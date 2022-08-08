import axios, { AxiosError } from 'axios';
import { Prod, Dumps, Party, Group, Board } from './models';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';
import { ConfigGetLatest, Json } from './interfaces';
import { DB_FILE_NAME, POUET_NET_JSON } from './constants';
import {
  createDumpFromInfo,
  getLocale,
  gunzipJson,
  gz2Json,
  removeFiles,
  setData,
} from './tools';
import {
  checkVersion,
  createAndRunDatabase,
  createDatabase,
  runQueries,
} from './database';

export * from './models';

export default class Pouet {
  static getLatest(
    config: ConfigGetLatest = { cache: true },
  ): Observable<Dumps> {
    return new Observable<Dumps>((subscriber: Subscriber<Dumps>) => {
      axios
        .get<Json>(POUET_NET_JSON)
        .then((value) => {
          const json = value.data;
          let latest: Dumps;
          try {
            latest = {
              prods: createDumpFromInfo<Prod>(json.latest.prods),
              parties: createDumpFromInfo<Party>(json.latest.parties),
              groups: createDumpFromInfo<Group>(json.latest.groups),
              boards: createDumpFromInfo<Board>(json.latest.boards),
              platforms: {},
              users: {},
            };
          } catch (err) {
            subscriber.error(err);
            subscriber.complete();
            return;
          }

          if (config.cache === true && removeFiles(latest, subscriber)) {
            return;
          }

          axios
            .all([
              axios.get(latest.prods?.url || '', {
                responseType: 'arraybuffer',
              }),
              axios.get(latest.parties?.url || '', {
                responseType: 'arraybuffer',
              }),
              axios.get(latest.groups?.url || '', {
                responseType: 'arraybuffer',
              }),
              axios.get(latest.boards?.url || '', {
                responseType: 'arraybuffer',
              }),
            ])
            .then(
              axios.spread((prods, parties, groups, boards) => {
                forkJoin([
                  gunzipJson(prods.data, latest.prods, config.cache === true),
                  gunzipJson(
                    parties.data,
                    latest.parties,
                    config.cache === true,
                  ),
                  gunzipJson(groups.data, latest.groups, config.cache === true),
                  gunzipJson(boards.data, latest.boards, config.cache === true),
                ]).subscribe({
                  next: ([prodsData, partiesData, groupsData, boardsData]) => {
                    setData(
                      latest,
                      prodsData,
                      partiesData,
                      groupsData,
                      boardsData,
                    );
                    subscriber.next(latest);
                    subscriber.complete();
                  },
                  error: (err: any) => {
                    subscriber.error(err);
                    subscriber.complete();
                  },
                });
              }),
            )
            .catch((res) => {
              subscriber.error(res);
              subscriber.complete();
            });
        })
        .catch((err: AxiosError) => {
          subscriber.error(err);
          subscriber.complete();
        });
    });
  }
  static genCSV(records: any[], path: string, done: () => void) {
    if (records.length === 0) {
      return;
    }
    const record = records[0];
    const header: { id: string; title: string }[] = [];
    Object.keys(record).forEach((key) => {
      header.push({
        id: key,
        title: key,
      });
    });
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({ path, header });
    csvWriter.writeRecords(records).then(() => {
      done();
    });
  }
  static sqlQuery(
    sql: string,
    progress?: (title: string) => void,
  ): Observable<any[]> {
    return new Observable<any[]>((subscriber: Subscriber<any[]>) => {
      if (fs.existsSync(DB_FILE_NAME)) {
        checkVersion().subscribe((currentVersion) => {
          if (currentVersion) {
            if (progress) {
              progress('Open ' + DB_FILE_NAME);
            }
            const db = new sqlite3.Database(
              DB_FILE_NAME,
              sqlite3.OPEN_READWRITE,
              (_) => {
                runQueries(db, sql, progress).subscribe((result) => {
                  subscriber.next(result);
                  subscriber.complete();
                });
              },
            );
          } else {
            fs.unlinkSync(DB_FILE_NAME);
            createAndRunDatabase(sql, subscriber, progress);
          }
        });
        return;
      }
      createAndRunDatabase(sql, subscriber, progress);
    });
  }
}
