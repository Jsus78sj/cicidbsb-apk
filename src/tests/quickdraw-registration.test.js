import assert from "node:assert/strict";
import {findTool} from "../tools/registry.js";
import "../tools/quickdraw.js";

const byId=findTool("quickrect");
const byAlias=findTool("qr");
const byName=findTool("مستطيل_سريع");
assert.ok(byId);
assert.equal(byId,byAlias);
assert.equal(byId,byName);
assert.equal(byId.label,"مستطيل سريع");
assert.equal(byId.steps.length,2);
assert.equal(byId.steps[1].restart,true);
assert.equal(byId.steps[1].box,true);
assert.ok(byId.opts.some(option=>option.k==="t"));
console.log("quickdraw registration: ok");
