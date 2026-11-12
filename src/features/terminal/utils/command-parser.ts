export type ParseResult =
  | { ok: true; command: string; args: string[] }
  | { ok: false; error: string };

/**
 * Splits a command line into words. Supports single and double quotes and
 * backslash escapes. Purely lexical: nothing is evaluated or expanded.
 */
export function parseCommandLine(input: string): ParseResult {
  const words: string[] = [];
  let current = "";
  let hasWord = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === "\\" && quote === '"' && (input[i + 1] === '"' || input[i + 1] === "\\")) {
        current += input[++i];
      } else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      hasWord = true;
    } else if (ch === "\\" && i + 1 < input.length) {
      current += input[++i];
      hasWord = true;
    } else if (/\s/.test(ch)) {
      if (hasWord) words.push(current);
      current = "";
      hasWord = false;
    } else {
      current += ch;
      hasWord = true;
    }
  }

  if (quote) return { ok: false, error: `parse error: unmatched ${quote}` };
  if (hasWord) words.push(current);
  const [command = "", ...args] = words;
  return { ok: true, command, args };
}
