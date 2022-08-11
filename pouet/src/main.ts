import * as args from 'args';
import * as fs from 'fs';
import Pouet from '@nagyattis81/pouet-dump';

args.option('sql', 'input query sql file').option('csv', 'output csv file');

const flags = args.parse(process.argv);
if (flags.sql && flags.csv) {
  const sql = fs.readFileSync(flags.sql).toString();
  Pouet.sqlQuery(sql).subscribe((result) => {
    Pouet.genCSV(result, flags.csv, () => {});
  });
} else {
  args.showHelp();
}
