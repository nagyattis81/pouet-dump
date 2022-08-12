import * as args from 'args';
import * as fs from 'fs';
import Pouet from '@nagyattis81/pouet-dump';
const Table = require('easy-table');

args.option('sql', 'input query sql file').option('csv', 'output csv file');

const flags = args.parse(process.argv);
if (flags.sql) {
  const sql = fs.readFileSync(flags.sql).toString();
  Pouet.sqlQuery(sql).subscribe((result) => {
    if (flags.csv) {
      Pouet.genCSV(result, flags.csv, () => {});
    } else if (result.length > 0) {
      var t = new Table();
      const keys = Object.keys(result[0]);
      result.forEach((row) => {
        keys.forEach((key) => {
          const value = row[key];
          t.cell(key, value, isNaN(Number(value)) ? undefined : Table.number());
        });
        t.newRow();
      });
      console.log(t.toString());
    }
  });
} else {
  args.showHelp();
}
