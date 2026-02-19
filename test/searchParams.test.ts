import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { searchParams } from "../src/searchParams.js";

describe('searchParams', ()=>{
  it('returns empty string if no params', ()=>{
    assert.equal(searchParams({ after: "", searchTerm: "" }), "");
  })
  it('returns after param if only after', ()=>{
    assert.equal(searchParams({ after: "abc", searchTerm: "" }), "?after=abc");
  })
  it('returns searchTerm param if only searchTerm', ()=>{
    assert.equal(searchParams({ after: "", searchTerm: "hello" }), "?searchTerm=hello");
  })
  it('returns both params if both present', ()=>{
    assert.equal(searchParams({ after: "abc", searchTerm: "hello" }), "?after=abc&searchTerm=hello");
  })
  it('returns multiple params', ()=>{
    assert.equal(searchParams({ after: "abc", searchTerm: "hello", asd: "somethingNew" }), "?after=abc&searchTerm=hello&asd=somethingNew");
  })
  it('checks proper encoding', ()=>{
    assert.equal(searchParams({ after: "abc/def", searchTerm: "hello world🙂" }), "?after=abc%2Fdef&searchTerm=hello%20world%F0%9F%99%82");
  })
})