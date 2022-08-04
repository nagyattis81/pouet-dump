import Pouet, { Prod } from '@nagyattis81/pouet-dump';

Pouet.getLatest().subscribe((dumps) => {
  const func = dumps.parties.data.find(
    (party) => party.name.toLowerCase() === 'function',
  )?.id;
  if (!func) {
    return;
  }

  const rows: any[] = [];
  dumps.prods.data
    .filter((prod) => prod.party?.id === func)
    .sort((a: Prod, b: Prod) => {
      if (a.voteup > b.voteup) {
        return -1;
      }
      if (a.voteup < b.voteup) {
        return 1;
      }
      return 0;
    })
    .filter((_, index) => index < 10)
    .forEach((prod) => {
      rows.push({
        pouetid: prod.id,
        'name type': prod.name + ' ' + prod.type,
        voteup: prod.voteup,
      });
    });

  console.log(dumps.prods.dump_date);
  console.table(rows);

  const CSV_FILENAME = 'result.csv';
  Pouet.genCSV(rows, 'result.csv', () => {
    console.log('Write', CSV_FILENAME);
  });
});
