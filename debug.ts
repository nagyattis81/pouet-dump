import Pouet, { Group, Prod } from './src/index';

Pouet.getLatest().subscribe((dumps) => {

  const isWindows = (prod:Prod): boolean => {
    return Object.keys(prod.platforms).find((key) => key == '68') !== undefined;
  }

  const mapGroupsToList = (groups: readonly Group[]):string => {
    return groups.map(prod => prod.name).join(',')
  }

  const sortByVoteup = (a: Prod, b: Prod):1|-1|0 => {
      if (a.voteup > b.voteup) {
        return -1;
      }
      if (a.voteup < b.voteup) {
        return 1;
      }
      return 0;
  }

  const prodToRow = (prod:Prod) => ({
        pouetid: prod.id,
        name: prod.name,
        voteup: prod.voteup,
        releaseDate: prod.releaseDate,
        groups: mapGroupsToList(prod.groups)
      });
  
  const rows = dumps.prods.data
    .sort(sortByVoteup)
    .filter((prod:Prod) => prod.type === 'demo')
    .filter(isWindows)
    .filter((_:Prod,index:number) => index < 10)
    .map(prodToRow);
    

  console.log(dumps.prods.dump_date);
  console.table(rows);

  const CSV_FILENAME = 'result.csv';
  Pouet.genCSV(rows, 'result.csv', () => {
    console.log('Write', CSV_FILENAME);
  });
});

Pouet.sqlQuery(
`SELECT 'https://www.pouet.net/prod.php?which=' || P.id, P.name, P.voteup, P.party_year
FROM prod as P
INNER JOIN credits as C ON C.prod = P.id
INNER JOIN user as U ON U.id   = C.user
WHERE U.nickname LIKE 'aha'
ORDER BY P.voteup DESC
LIMIT 10
;`,
).subscribe((result) => {
  console.table(result);
});