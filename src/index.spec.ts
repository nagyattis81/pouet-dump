import { getLatest } from '.';

describe('queries', () => {
  it(' fr-041: debris', (done) => {
    getLatest().subscribe((dumps) => {
      expect(dumps).toBeDefined();
      if (dumps) {
        const prod = dumps.prods.data.find((find) => find.id === '30244');
        expect(prod?.voteup).toBeGreaterThan(803);
        expect(dumps.prods.data.length).toBeGreaterThan(80000);
      }
      done();
    });
  });
});
