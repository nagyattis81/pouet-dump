import { getLatest } from './lib';

console.time('getLatest');
getLatest().subscribe((r) => {
  console.log(r?.prods.data.find((find) => find.id === '51789'));
  console.timeLog('getLatest');
});
