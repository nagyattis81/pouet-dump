import { getLatest } from './lib';
import { Dumps } from './lib/interfaces';

console.time('all');
getLatest().subscribe({
  next(value) {
    console.time('query');
    const dumps = value as Dumps;
    console.log(dumps.platforms);
    console.timeLog('query');
    console.timeLog('all');
  },
  error(err) {
    console.log(err);
    console.timeLog('all');
  },
});
