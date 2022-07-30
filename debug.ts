import { getLatest } from './lib';

getLatest().subscribe((r) => {
  console.log(r);
});
