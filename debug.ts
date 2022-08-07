import Pouet from './src/index';

Pouet.sqlQuery(
  `
SELECT 
  * 
FROM 
  user;
`,
).subscribe((result) => {
  console.table(result);
});
