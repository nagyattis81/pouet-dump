import { getLatest } from '.';

test.skip('getLatest', () => {
  getLatest().subscribe((r) => {
    if (r) {
      const dumps = ['prods', 'parties', 'groups', 'boards'];
      expect(Object.keys(r)).toEqual(dumps);
      dumps.forEach((dump) => {
        const info = Object(r)[dump];
        expect(info.filename).not.toEqual('');
        expect(info.url).not.toEqual('');
        expect(info.size_in_bytes).toBeGreaterThan(0);
      });
    }
  });
});
