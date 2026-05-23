const test = require("node:test");
const assert = require("node:assert/strict");
const { buildUploadPlan } = require("./zmodemHelper.cjs");

const never = () => { throw new Error("resolver should not be called"); };

test("no conflicts: everything offered, nothing removed, resolver untouched", async () => {
  const plan = await buildUploadPlan(["a.txt", "b.txt"], [], never);
  assert.deepEqual(plan, { filesToOffer: ["a.txt", "b.txt"], filesToRemove: [], aborted: false });
});

test("overwrite a conflict: file is both removed and offered", async () => {
  const plan = await buildUploadPlan(["a.txt", "b.txt"], ["b.txt"],
    async () => ({ action: "overwrite" }));
  assert.deepEqual(plan, { filesToOffer: ["a.txt", "b.txt"], filesToRemove: ["b.txt"], aborted: false });
});

test("skip a conflict: omitted from offer and remove", async () => {
  const plan = await buildUploadPlan(["a.txt", "b.txt"], ["b.txt"],
    async () => ({ action: "skip" }));
  assert.deepEqual(plan, { filesToOffer: ["a.txt"], filesToRemove: [], aborted: false });
});

test("cancel aborts the whole transfer", async () => {
  const plan = await buildUploadPlan(["a.txt", "b.txt"], ["b.txt"],
    async () => ({ action: "cancel" }));
  assert.deepEqual(plan, { filesToOffer: [], filesToRemove: [], aborted: true });
});

test("applyToRest reuses the action and stops prompting", async () => {
  let calls = 0;
  const plan = await buildUploadPlan(["a", "b", "c"], ["a", "b", "c"],
    async () => { calls++; return { action: "overwrite", applyToRest: true }; });
  assert.equal(calls, 1);
  assert.deepEqual(plan, { filesToOffer: ["a", "b", "c"], filesToRemove: ["a", "b", "c"], aborted: false });
});

test("only conflicting files invoke the resolver; order preserved", async () => {
  const seen = [];
  const plan = await buildUploadPlan(["a", "b", "c"], ["b"],
    async (n) => { seen.push(n); return { action: "skip" }; });
  assert.deepEqual(seen, ["b"]);
  assert.deepEqual(plan.filesToOffer, ["a", "c"]);
});
