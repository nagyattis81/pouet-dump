import { getLatest } from '.';

it('dump names', (done) => {
  getLatest().subscribe((dumps) => {
    expect(dumps).toBeDefined();
    if (dumps) {
      expect(Object.keys(dumps).sort()).toEqual(['boards', 'groups', 'parties', 'platforms', 'prods', 'users']);
    }
    done();
  });
});
