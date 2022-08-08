import { createDumps } from './data.spec';
import { getLocale } from './tools';

describe('tools.ts', () => {
  it.skip('getLocale', () => {
    const latest = createDumps();
    expect(getLocale(latest)).toBeDefined();
    latest.prods.filename = '_' + latest.prods.filename;
    expect(getLocale(latest)).toBeUndefined();
  });
});
