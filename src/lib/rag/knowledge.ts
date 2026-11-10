import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * 轻量本地 RAG 引擎：
 * Markdown/纯文本文档 → 段落分块 → 中文二元词 + 英文词切分 → TF-IDF 向量 → 余弦相似度召回。
 * 不依赖外部 Embedding API，保证离线可演示、可解释。
 */

export interface KnowledgeDoc {
  id: string;
  title: string;
  source: string;
  content: string;
  characters: number;
  chunkCount: number;
}

export interface KnowledgeHit {
  docId: string;
  chunkId: string;
  title: string;
  source: string;
  content: string;
  score: number;
}

interface Chunk {
  id: string;
  docId: string;
  title: string;
  source: string;
  content: string;
  vector: Map<string, number>;
}

interface IndexCache {
  at: number;
  docs: KnowledgeDoc[];
  chunks: Chunk[];
  idf: Map<string, number>;
  df: Map<string, number>;
}

const KB_DIR = path.join(process.cwd(), "data", "knowledge");
const EXTRA_FILE = path.join(process.cwd(), ".data", "knowledge-extra.json");
const CACHE_TTL = 4000;
const MAX_CHUNK = 420;
const OVERLAP = 80;

let cache: IndexCache | null = null;

interface ExtraDoc {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

async function readExtraDocs(): Promise<ExtraDoc[]> {
  try {
    const raw = await fs.readFile(EXTRA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readSeedDocs(): Promise<{ id: string; title: string; source: string; content: string }[]> {
  try {
    const files = (await fs.readdir(KB_DIR)).filter((file) => /\.(md|txt)$/i.test(file));
    const docs = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(KB_DIR, file), "utf8");
        const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
        return {
          id: `seed-${file.replace(/\.(md|txt)$/i, "")}`,
          title: heading || file.replace(/\.(md|txt)$/i, ""),
          source: `data/knowledge/${file}`,
          content,
        };
      }),
    );
    return docs;
  } catch {
    return [];
  }
}

function chunkText(content: string): string[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if (buffer && buffer.length + paragraph.length + 2 > MAX_CHUNK) {
      chunks.push(buffer.trim());
      buffer = buffer.slice(-OVERLAP) + "\n" + paragraph;
    } else {
      buffer = buffer ? `${buffer}\n${paragraph}` : paragraph;
    }
    while (buffer.length > MAX_CHUNK * 1.6) {
      chunks.push(buffer.slice(0, MAX_CHUNK).trim());
      buffer = buffer.slice(MAX_CHUNK - OVERLAP);
    }
  }
  if (buffer.trim().length > 20) chunks.push(buffer.trim());

  return chunks.filter((chunk) => chunk.replace(/\s/g, "").length >= 30);
}

const STOP_TERMS = new Set([
  "如何", "怎么", "怎样", "什么", "哪些", "为什么", "可以", "可能", "应该", "需要", "一个", "这个", "那个",
  "我们", "你们", "他们", "以及", "进行", "通过", "因为", "所以", "但是", "而且", "如果", "就是", "不是",
  "没有", "还是", "能够", "帮你", "一下", "使用", "用的", "时候", "问题", "这样", "那样",
  "的时", "么样", "有什", "么区", "区别", "具体", "直接", "主要", "相关", "内容", "方面",
  "今天", "明天", "昨天", "最近", "现在",
]);

// 高频功能单字：只造噪声不携带主题信息，不计入单字特征
const CHAR_STOP = new Set(
  "的了吗是在我你他这也那有和就不都上中下人么什样怎来去说过要会能可对没很到着之与及或把被让从但而于以为其所因虽如果然并且已经还将又再最更越极太非别另每各位两几多少前后内外面间里旁边啊吗呢吧嘛呀啦哦嗯天吃气喝玩乐买卖走跑看做想问答叫给拿打影雨",
);

type WeightedToken = { t: string; w: number };

/** 中文二元词（权重 1）+ 单字（权重 0.4，提升召回）混合切分，英文/数字按词切分 */
function tokenize(text: string): WeightedToken[] {
  const tokens: WeightedToken[] = [];
  const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
  for (const part of normalized.split(/\s+/)) {
    if (!part) continue;
    if (/^[一-鿿]+$/.test(part)) {
      if (part.length === 1) {
        if (!CHAR_STOP.has(part)) tokens.push({ t: part, w: 0.4 });
      } else {
        for (const ch of part) if (!CHAR_STOP.has(ch)) tokens.push({ t: ch, w: 0.4 });
        for (let i = 0; i < part.length - 1; i++) {
          const bigram = part.slice(i, i + 2);
          if (!STOP_TERMS.has(bigram)) tokens.push({ t: bigram, w: 1 });
        }
      }
    } else if (!STOP_TERMS.has(part)) {
      tokens.push({ t: part, w: 1 });
    }
  }
  return tokens;
}

function termFrequency(tokens: WeightedToken[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const { t, w } of tokens) map.set(t, (map.get(t) ?? 0) + w);
  return map;
}

async function buildIndex(): Promise<IndexCache> {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache;

  const seeds = await readSeedDocs();
  const extras = await readExtraDocs();
  const rawDocs = [
    ...seeds,
    ...extras.map((doc) => ({
      id: doc.id,
      title: doc.title,
      source: "用户上传 · 本地知识库",
      content: doc.content,
    })),
  ];

  const docs: KnowledgeDoc[] = [];
  const chunkDrafts: Omit<Chunk, "vector">[] = [];

  for (const doc of rawDocs) {
    const pieces = chunkText(doc.content);
    docs.push({
      id: doc.id,
      title: doc.title,
      source: doc.source,
      content: doc.content,
      characters: doc.content.length,
      chunkCount: pieces.length,
    });
    pieces.forEach((piece, index) => {
      chunkDrafts.push({
        id: `${doc.id}#${index + 1}`,
        docId: doc.id,
        title: doc.title,
        source: doc.source,
        content: piece,
      });
    });
  }

  // 计算 IDF
  const df = new Map<string, number>();
  const chunkTokens = chunkDrafts.map((chunk) => tokenize(`${chunk.title} ${chunk.content}`));
  for (const tokens of chunkTokens) {
    for (const term of new Set(tokens.map((x) => x.t))) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const total = Math.max(chunkDrafts.length, 1);
  const idf = new Map<string, number>();
  for (const [term, count] of df) idf.set(term, Math.log((total + 1) / (count + 0.5)) + 1);

  // 出现在 45% 以上分块中的高频单字不参与计分，避免无关查询蹭分
  const isNoisyUnigram = (term: string) => term.length === 1 && (df.get(term) ?? 0) / total > 0.45;

  const chunks: Chunk[] = chunkDrafts.map((chunk, index) => {
    const tf = termFrequency(chunkTokens[index]);
    const vector = new Map<string, number>();
    let norm = 0;
    for (const [term, count] of tf) {
      if (isNoisyUnigram(term)) continue;
      const weight = (1 + Math.log(count)) * (idf.get(term) ?? 0);
      if (!weight) continue;
      vector.set(term, weight);
      norm += weight * weight;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [term, weight] of vector) vector.set(term, weight / norm);
    return { ...chunk, vector };
  });

  cache = { at: Date.now(), docs, chunks, idf, df };
  return cache;
}

export type KnowledgeDocMeta = Omit<KnowledgeDoc, "content">;

export async function listKnowledgeDocs(): Promise<KnowledgeDocMeta[]> {
  const index = await buildIndex();
  return index.docs.map(({ content, ...meta }) => ({ ...meta, characters: content.length }));
}

export async function searchKnowledge(query: string, topK = 4): Promise<KnowledgeHit[]> {
  const index = await buildIndex();
  const queryTokens = tokenize(query);
  if (!queryTokens.length || !index.chunks.length) return [];

  const df = index.df;
  const total = Math.max(index.chunks.length, 1);

  const queryTf = termFrequency(queryTokens);
  const queryVector = new Map<string, number>();
  let norm = 0;
  for (const [term, count] of queryTf) {
    if (term.length === 1 && (df.get(term) ?? 0) / total > 0.45) continue;
    const idfWeight = index.idf.get(term);
    if (!idfWeight) continue;
    const weight = (1 + Math.log(count)) * idfWeight;
    queryVector.set(term, weight);
    norm += weight * weight;
  }
  if (!queryVector.size) return [];
  norm = Math.sqrt(norm) || 1;

  const latinQ = query.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? [];
  const scored = index.chunks
    .map((chunk) => {
      let score = 0;
      for (const [term, weight] of queryVector) {
        const chunkWeight = chunk.vector.get(term);
        if (chunkWeight) score += (weight / norm) * chunkWeight;
      }
      if (chunk.title.includes(query.trim())) score += 0.12;
      else if (latinQ.some((t) => t.length >= 2 && chunk.title.toLowerCase().includes(t))) score += 0.1;
      return { chunk, score };
    })
    .filter((item) => item.score > 0.01)
    .sort((a, b) => b.score - a.score);

  // 置信阈值：绝对下限过滤「只命中个别常见词」的低质召回，相对阈值过滤长尾噪声
  const topScore = scored[0]?.score ?? 0;
  const minScore = Math.max(0.08, topScore * 0.55);
  const limited = scored.filter((item) => item.score >= minScore).slice(0, Math.max(1, Math.min(topK, 8)));

  return limited.map(({ chunk, score }) => ({
    docId: chunk.docId,
    chunkId: chunk.id,
    title: chunk.title,
    source: chunk.source,
    content: chunk.content,
    score: Math.round(score * 1000) / 1000,
  }));
}

export async function addKnowledgeDoc(input: { title: string; content: string }): Promise<KnowledgeDoc> {
  const title = input.title.trim().slice(0, 80) || "未命名文档";
  const content = input.content.trim();
  if (content.length < 30) throw new Error("文档内容至少需要 30 个字符");
  if (content.length > 50_000) throw new Error("单篇文档不能超过 5 万字符");

  const extras = await readExtraDocs();
  const doc: ExtraDoc = {
    id: `user-${randomUUID().slice(0, 8)}`,
    title,
    content,
    createdAt: Date.now(),
  };
  extras.unshift(doc);
  await fs.mkdir(path.dirname(EXTRA_FILE), { recursive: true });
  await fs.writeFile(EXTRA_FILE, JSON.stringify(extras, null, 2), "utf8");
  cache = null;

  const chunkCount = chunkText(content).length;
  return {
    id: doc.id,
    title: doc.title,
    source: "用户上传 · 本地知识库",
    content,
    characters: content.length,
    chunkCount,
  };
}

export async function knowledgeStats(): Promise<{ docs: number; chunks: number; characters: number }> {
  const index = await buildIndex();
  return {
    docs: index.docs.length,
    chunks: index.chunks.length,
    characters: index.docs.reduce((sum, doc) => sum + doc.characters, 0),
  };
}
