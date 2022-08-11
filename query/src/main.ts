import Pouet from '@nagyattis81/pouet-dump';

Pouet.sqlQuery(
  `
  SELECT 'https://www.pouet.net/prod.php?which=' || P.id, P.name, P.voteup, P.party_year
  FROM prod as P
  INNER JOIN credits as C ON C.prod = P.id
  INNER JOIN user as U ON U.id   = C.user
  WHERE U.nickname LIKE 'aha'
  ORDER BY P.voteup DESC
  LIMIT 10
  ;
  `,
).subscribe((result) => {
  console.table(result);
});
