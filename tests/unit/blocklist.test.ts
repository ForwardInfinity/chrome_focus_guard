/**
 * Unit tests for blocklist CRUD operations in src/background/blocklist.ts
 * Uses Jest and jsdom to mock chrome.storage.sync.
 */

import {
  getBlocklist,
  addToBlocklist,
  removeFromBlocklist,
  clearBlocklist,
} from '../../src/background/blocklist';

// Mock chrome.storage.sync
const storage: { [key: string]: any } = {};
const chromeMock = {
  storage: {
    sync: {
      get: jest.fn((key: string, cb: (result: any) => void) => {
        cb({ [key]: storage[key] });
      }),
      set: jest.fn((items: any, cb: () => void) => {
        Object.assign(storage, items);
        cb();
      }),
    },
  },
};

declare const global: any;
global.chrome = chromeMock;

beforeEach(() => {
  // Reset storage and mocks before each test
  for (const key in storage) delete storage[key];
  jest.clearAllMocks();
});

describe('blocklist CRUD', () => {
  test('getBlocklist returns empty array if unset', async () => {
    const list = await getBlocklist();
    expect(list).toEqual([]);
  });

  test('addToBlocklist adds a new domain', async () => {
    await addToBlocklist('example.com');
    const list = await getBlocklist();
    expect(list).toEqual(['example.com']);
  });

  test('addToBlocklist does not add duplicates', async () => {
    await addToBlocklist('foo.com');
    await addToBlocklist('foo.com');
    const list = await getBlocklist();
    expect(list).toEqual(['foo.com']);
  });

  test('removeFromBlocklist removes a domain', async () => {
    await addToBlocklist('a.com');
    await addToBlocklist('b.com');
    await removeFromBlocklist('a.com');
    const list = await getBlocklist();
    expect(list).toEqual(['b.com']);
  });

  test('removeFromBlocklist does nothing if domain not present', async () => {
    await addToBlocklist('a.com');
    await removeFromBlocklist('b.com');
    const list = await getBlocklist();
    expect(list).toEqual(['a.com']);
  });

  test('clearBlocklist empties the list', async () => {
    await addToBlocklist('x.com');
    await clearBlocklist();
    const list = await getBlocklist();
    expect(list).toEqual([]);
  });
});

describe('blocklist performance', () => {
  const ops = [
    { name: 'getBlocklist', fn: () => getBlocklist() },
    { name: 'addToBlocklist', fn: () => addToBlocklist('perf.com') },
    { name: 'removeFromBlocklist', fn: () => removeFromBlocklist('perf.com') },
    { name: 'clearBlocklist', fn: () => clearBlocklist() },
  ];

  ops.forEach(({ name, fn }) => {
    test(`${name} completes in <50ms`, async () => {
      const start = performance.now();
      await fn();
      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });
  });
});
