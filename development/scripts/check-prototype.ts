import assert from "node:assert/strict";
import { getPrototypeRole } from "../src/lib/prototype-login.ts";

assert.equal(getPrototypeRole("purok.demo"), "purok");
assert.equal(getPrototypeRole(" Barangay.Demo "), "barangay");
assert.equal(getPrototypeRole("drrm.demo"), "drrm");
assert.equal(getPrototypeRole("unknown.demo"), undefined);

console.log("Prototype checks passed.");
