import { it, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { store } from '../src/store.js';
import {navigateRequest, navigationSuccessful} from '../src/navigationSlice.js';

describe('Store dispatching navigation', () => {
  it('dispatches navigationRequested action', () => {
    const path = '/test-path';
    store.dispatch(navigateRequest(path));
    const state = store.getState();
    assert.strictEqual(state.navigation.navigateTo, path);
  })
  it('dispatches navigationSuccessful action', () => {
    store.dispatch(navigationSuccessful());
    const state = store.getState();
    assert.strictEqual(state.navigation.navigateTo, '', 'expected empty path');
  })
})