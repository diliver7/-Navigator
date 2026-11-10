"use client";

import { useEffect, useState } from "react";

/** 打字机文字：用于导游台旁白与首页演示 */
export function TypingText({
  text,
  speed = 26,
  className,
  loop = false,
}: {
  text: string;
  speed?: number;
  className?: string;
  loop?: boolean;
}) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        if (loop) {
          setTimeout(() => setVisible(""), 2400);
        }
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, loop]);

  return (
    <span className={className}>
      {visible}
      <span className="caret" aria-hidden />
    </span>
  );
}
