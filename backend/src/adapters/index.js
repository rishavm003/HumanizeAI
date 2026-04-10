import GroqAdapter from './GroqAdapter.js';

export function getPrimaryAdapter() {
  return new GroqAdapter();
}

export function getFallbackAdapter() {
  return new GroqAdapter();
}

export default { getPrimaryAdapter, getFallbackAdapter };
