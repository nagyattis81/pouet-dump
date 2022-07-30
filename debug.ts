import { getLatest } from './lib';

getLatest().subscribe((r) => {
  console.log(r?.prods.data.find((find) => find.id === '51789'));
});
