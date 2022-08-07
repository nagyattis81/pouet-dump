import Pouet from './src/index';

Pouet.sqlQuery('SELECT id,name,type from prod;', { cache: false }).subscribe(
  (result) => {
    console.table(result);
  },
);
