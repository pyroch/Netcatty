import test from "node:test";
import assert from "node:assert/strict";

import { optionArrowWordJumpSequence } from "./optionArrowWordJump";

// Discussion #826: on macOS, Option+←/→ defaults to xterm's ^[[1;3D / ^[[1;3C,
// which most shells don't bind. When enabled, remap them to Meta-b / Meta-f so
// readline/zle does backward-word / forward-word out of the box (Termius-style).

const ev = (over: Partial<Parameters<typeof optionArrowWordJumpSequence>[0]> = {}) => ({
  key: "ArrowLeft",
  altKey: true,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...over,
});

test("Option+Left → Meta-b (backward-word) when enabled", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ key: "ArrowLeft" }), true), "\x1bb");
});

test("Option+Right → Meta-f (forward-word) when enabled", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ key: "ArrowRight" }), true), "\x1bf");
});

test("disabled → null (xterm default ^[[1;3D/C is kept)", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ key: "ArrowLeft" }), false), null);
  assert.equal(optionArrowWordJumpSequence(ev({ key: "ArrowRight" }), false), null);
});

test("no Option held → null", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ altKey: false }), true), null);
});

test("extra modifiers with Option → null (don't hijack Shift/Ctrl/Cmd combos)", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ shiftKey: true }), true), null);
  assert.equal(optionArrowWordJumpSequence(ev({ ctrlKey: true }), true), null);
  assert.equal(optionArrowWordJumpSequence(ev({ metaKey: true }), true), null);
});

test("non-arrow keys → null", () => {
  assert.equal(optionArrowWordJumpSequence(ev({ key: "ArrowUp" }), true), null);
  assert.equal(optionArrowWordJumpSequence(ev({ key: "f" }), true), null);
});
