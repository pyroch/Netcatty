/**
 * A bounded, append-only text buffer that retains only the last `maxChars`
 * characters — the connection log used for diagnostics/replay.
 *
 * The naive implementation (`log += chunk; if (log.length > max) log =
 * log.slice(-max)`) flattens a ~max-length string on *every* append once the
 * cap is reached. On a busy session that runs on the render thread for every
 * output chunk (including each echoed keystroke). This keeps the data as a
 * queue of chunks and only ever copies the small boundary chunk when trimming,
 * so append is amortized O(chunk) and the full string is materialized once, on
 * `toString()`.
 */
export interface ConnectionLogBuffer {
  append(chunk: string): void;
  toString(): string;
  reset(): void;
}

export function createConnectionLogBuffer(maxChars: number): ConnectionLogBuffer {
  let chunks: string[] = [];
  let total = 0;

  const trim = () => {
    let overflow = total - maxChars;
    while (overflow > 0 && chunks.length > 0) {
      const head = chunks[0];
      if (head.length <= overflow) {
        // Drop the whole oldest chunk.
        chunks.shift();
        total -= head.length;
        overflow -= head.length;
      } else {
        // Partial-trim the oldest chunk to land exactly on the cap.
        chunks[0] = head.slice(overflow);
        total -= overflow;
        overflow = 0;
      }
    }
  };

  return {
    append(chunk: string): void {
      if (!chunk) return;
      // A single chunk longer than the cap can only contribute its own tail.
      if (chunk.length > maxChars) {
        chunks = [chunk.slice(-maxChars)];
        total = maxChars;
        return;
      }
      chunks.push(chunk);
      total += chunk.length;
      if (total > maxChars) trim();
    },
    toString(): string {
      if (chunks.length > 1) {
        // Collapse to a single chunk so repeated reads stay cheap.
        const joined = chunks.join("");
        chunks = [joined];
        return joined;
      }
      return chunks[0] ?? "";
    },
    reset(): void {
      chunks = [];
      total = 0;
    },
  };
}
