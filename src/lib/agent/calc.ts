/** 安全的四则运算求值器（递归下降，不使用 eval） */

export function evaluateExpression(input: string): number {
  const normalized = input
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[×xX]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[，,]/g, "")
    .replace(/\s+/g, "");

  if (!normalized || normalized.length > 120) {
    throw new Error("表达式为空或过长");
  }
  if (!/^[0-9+\-*/%^().]+$/.test(normalized)) {
    throw new Error("表达式包含不支持的字符");
  }

  let index = 0;

  const peek = () => normalized[index];
  const consume = (char?: string) => {
    if (char && normalized[index] !== char) throw new Error(`期望 ${char}`);
    return normalized[index++];
  };

  function parseNumber(): number {
    const start = index;
    while (index < normalized.length && /[0-9.]/.test(normalized[index])) index++;
    if (start === index) throw new Error("表达式格式错误");
    const value = Number(normalized.slice(start, index));
    if (!Number.isFinite(value)) throw new Error("数字格式错误");
    return value;
  }

  function parseFactor(): number {
    if (peek() === "(") {
      consume("(");
      const value = parseAdditive();
      consume(")");
      return value;
    }
    if (peek() === "-") {
      consume("-");
      return -parseFactor();
    }
    if (peek() === "+") {
      consume("+");
      return parseFactor();
    }
    return parseNumber();
  }

  function parsePower(): number {
    const base = parseFactor();
    if (peek() === "^") {
      consume("^");
      return Math.pow(base, parsePower());
    }
    return base;
  }

  function parseMultiplicative(): number {
    let value = parsePower();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const operator = consume();
      const right = parsePower();
      if (operator === "*") value *= right;
      else if (operator === "/") {
        if (right === 0) throw new Error("除数不能为 0");
        value /= right;
      } else {
        if (right === 0) throw new Error("取模不能为 0");
        value %= right;
      }
    }
    return value;
  }

  function parseAdditive(): number {
    let value = parseMultiplicative();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = parseMultiplicative();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = parseAdditive();
  if (index !== normalized.length) throw new Error("表达式末尾存在多余内容");
  return result;
}
