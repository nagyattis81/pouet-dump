import Pouet from './src/index';

Pouet.sqlQuery('SELECT * from prod;', { cache: false }).subscribe((result) => {
  console.log('RESULT', result);
});
