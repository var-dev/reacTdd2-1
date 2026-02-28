import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { searchParams, commaStringPop, commaStringPush } from "../src/searchParams.js";

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
describe('commaStringPop', ()=>{
  it('returns empty tuple if input is empty', ()=>{
    assert.deepEqual(commaStringPop(""), ["", ""]);
  })
  it('returns empty string and input if input has no comma', ()=>{
    assert.deepEqual(commaStringPop("abc"), ["", "abc"]);
  })
  it('returns tuple of two strings if input has one comma', ()=>{
    assert.deepEqual(commaStringPop("abc,def"), ["abc", "def"]);
  })
  it('returns tuple of two strings if input has more than one comma', ()=>{
    assert.deepEqual(commaStringPop("abc,def,ghi"), ["abc,def", "ghi"]);
  })
  it('handles undefined correctly', ()=>{
    assert.deepEqual(commaStringPop(undefined), ["", ""])
  })
})
describe('commaStringPush', ()=>{
  it('returns second param if first is empty', ()=>{
    assert.equal(commaStringPush("", "abc"), "abc");
  })
  it('returns joined strings if first is not empty', ()=>{
    assert.equal(commaStringPush("abc", "def"), "abc,def");
  })
  it('handles undefined first param correctly', ()=>{
    assert.equal(commaStringPush(undefined, "abc"), "abc");
  })
})

