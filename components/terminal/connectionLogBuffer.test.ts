import test from "node:test";
import assert from "node:assert/strict";

import { createConnectionLogBuffer } from "./connectionLogBuffer.ts";

test("concatenates appended chunks while under the cap", () => {
  const buf = createConnectionLogBuffer(100);
  buf.append("foo");
  buf.append("bar");
  buf.append("baz");
  assert.equal(buf.toString(), "foobarbaz");
});

test("keeps only the last maxChars, matching slice(-max) semantics", () => {
  const max = 10;
  const buf = createConnectionLogBuffer(max);
  const chunks = ["abcd", "efgh", "ijkl", "mnop"]; // 16 chars total
  let naive = "";
  for (const c of chunks) {
    buf.append(c);
    naive += c;
  }
  assert.equal(buf.toString(), naive.slice(-max));
  assert.equal(buf.toString().length, max);
});

test("trims a single chunk larger than the cap to its last maxChars", () => {
  const buf = createConnectionLogBuffer(5);
  buf.append("0123456789");
  assert.equal(buf.toString(), "56789");
});

test("partial-trims the boundary chunk to keep exactly maxChars", () => {
  const buf = createConnectionLogBuffer(6);
  buf.append("abcde"); // 5
  buf.append("fghij"); // total 10 -> keep last 6 => "efghij"
  assert.equal(buf.toString(), "efghij");
});

test("stays correct across many small appends (ring semantics)", () => {
  const max = 50;
  const buf = createConnectionLogBuffer(max);
  let naive = "";
  for (let i = 0; i < 500; i++) {
    const chunk = `x${i}-`;
    buf.append(chunk);
    naive += chunk;
  }
  assert.equal(buf.toString(), naive.slice(-max));
});

test("reset clears the buffer", () => {
  const buf = createConnectionLogBuffer(100);
  buf.append("hello");
  buf.reset();
  assert.equal(buf.toString(), "");
  buf.append("world");
  assert.equal(buf.toString(), "world");
});

test("ignores empty appends", () => {
  const buf = createConnectionLogBuffer(100);
  buf.append("a");
  buf.append("");
  buf.append("b");
  assert.equal(buf.toString(), "ab");
});
