import axios, { AxiosError } from 'axios';
import {
  Prod,
  Dump,
  Dumps,
  Party,
  Group,
  Board,
  User,
  Platform,
} from './interfaces';
import { forkJoin, Observable } from 'rxjs';
import * as zlib from 'zlib';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

export * from './interfaces';

const POUET_NET_JSON = 'https://data.pouet.net/json.php';
const DB_FILE_NAME = 'pouet.db';

interface Info {
  filename: string;
  url: string;
  size_in_bytes: number;
}

interface Json {
  dumps: any;
  latest: {
    prods: Info;
    parties: Info;
    groups: Info;
    boards: Info;
  };
}

interface Config {
  cache?: boolean;
}

const createDumpFromInfo = <T>(info: Info): Dump<T> => {
  return {
    filename: info.filename,
    url: info.url,
    size_in_bytes: info.size_in_bytes,
    dump_date: '',
    data: [],
  };
};

function gunzipJson(
  data: any,
  info: Info,
  cache: boolean,
): Observable<{ dump_date: string } | undefined> {
  return new Observable<any | undefined>((subscribe) => {
    if (!data) {
      subscribe.error('undefined gz data');
      subscribe.complete();
      return;
    }
    zlib.gunzip(data, (_err: any, output: any) => {
      const content = output.toString();
      const obj = JSON.parse(content);
      const name = info.filename.split('.')[0] + '.json';
      if (cache === true && !fs.existsSync(name)) {
        fs.writeFile(name, content, (err) => {
          subscribe.next(obj);
          subscribe.complete();
        });
      } else {
        subscribe.next(obj);
        subscribe.complete();
      }
    });
  });
}

function setData(
  dumps: Dumps,
  prodsData: any,
  partiesData: any,
  groupsData: any,
  boardsData: any,
) {
  const handleUser = (user: User) => {
    user.glops = Number(user.glops);
    dumps.users[user.id] = user;
  };

  dumps.prods.dump_date = prodsData?.dump_date || '';
  dumps.parties.dump_date = partiesData?.dump_date || '';
  dumps.groups.dump_date = groupsData?.dump_date || '';
  dumps.boards.dump_date = boardsData?.dump_date || '';

  dumps.prods.data = Object(prodsData).prods;
  if (dumps.prods.data) {
    (dumps.prods.data as Prod[]).forEach((prod) => {
      prod.placings.forEach((placing) => {
        placing.ranking = Number(placing.ranking);
        placing.year = Number(placing.year);
      });
      prod.voteup = Number(prod.voteup);
      prod.votepig = Number(prod.votepig);
      prod.votedown = Number(prod.votedown);
      prod.voteavg = Number(prod.voteavg);
      prod.party_place = Number(prod.party_place);
      prod.party_year = Number(prod.party_year);
      handleUser(prod.addeduser);
      prod.invitationyear = Number(prod.invitationyear);
      prod.rank = Number(prod.rank);
      prod.credits.forEach((credit) => handleUser(credit.user));
      Object.keys(prod.platforms).forEach((key) => {
        dumps.platforms[key] = prod.platforms[key];
      });
    });
  }
  dumps.parties.data = Object(partiesData).parties;
  dumps.groups.data = Object(groupsData).groups;
  dumps.boards.data = Object(boardsData).boards;
  if (dumps.boards?.data) {
    (dumps.boards.data as Board[]).forEach((board) =>
      handleUser(board.addeduser),
    );
  }
}

const pouetDatadDmpFiles = fs
  .readdirSync('.')
  .filter(
    (filter) => filter.startsWith('pouetdatadump-') && filter.endsWith('.json'),
  );

function gz2Json(gz: string): string {
  return gz.split('.')[0] + '.json';
}

function getLocale(latest: Dumps): Dumps | undefined {
  const prodsFilename = gz2Json(latest.prods.filename);
  const groupsFilename = gz2Json(latest.groups.filename);
  const partiesFilename = gz2Json(latest.parties.filename);
  const boardsFilename = gz2Json(latest.boards.filename);

  if (
    pouetDatadDmpFiles.find((find) => find === prodsFilename) &&
    pouetDatadDmpFiles.find((find) => find === groupsFilename) &&
    pouetDatadDmpFiles.find((find) => find === partiesFilename) &&
    pouetDatadDmpFiles.find((find) => find === boardsFilename) &&
    fs.existsSync(prodsFilename) &&
    fs.existsSync(groupsFilename) &&
    fs.existsSync(partiesFilename) &&
    fs.existsSync(boardsFilename)
  ) {
    const prodsData = JSON.parse(fs.readFileSync(prodsFilename).toString());
    const partiesData = JSON.parse(fs.readFileSync(partiesFilename).toString());
    const groupsData = JSON.parse(fs.readFileSync(groupsFilename).toString());
    const boardsData = JSON.parse(fs.readFileSync(boardsFilename).toString());
    const locale: Dumps = latest;
    setData(locale, prodsData, partiesData, groupsData, boardsData);
    return locale;
  }
  return undefined;
}

function createTables(db: sqlite3.Database) {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const sql = fs
      .readFileSync(path.join(__dirname, './create.sql'))
      .toString();
    sql.split(');').forEach((txt) => {
      if (txt) {
        txt += ');';
        db.run(txt);
      }
    });
    db.run('COMMIT;');
  });
}

function repQuestMark(value: number): string {
  return ',?'.repeat(value).substring(1);
}

function insertProd(db: sqlite3.Database, prod: Prod) {
  const values: any[] = [
    Number(prod.id),
    prod.name,
    prod.download,
    prod.type,
    prod.addedUser,
    prod.addedDate,
    prod.releaseDate,
    Number(prod.voteup),
    Number(prod.votepig),
    Number(prod.votedown),
    Number(prod.voteavg),
    prod.party_compo,
    Number(prod.party_place),
    Number(prod.party_year),
    Number(prod.party),
    Number(prod.addeduser.id),
    prod.sceneorg,
    prod.demozoo,
    prod.csdb,
    prod.zxdemo,
    prod.invitation,
    Number(prod.invitationyear),
    prod.boardID,
    Number(prod.rank),
    Number(prod.cdc),
    Number(prod.popularity),
    prod.screenshot,
    prod.party_compo_name,
  ];
  const sql =
    `INSERT INTO prod(
    id,
    name,
    download,
    type,
    addedUserName,
    addedDate,
    releaseDate,
    voteup,
    votepig,
    votedown,
    voteavg,
    party_compo,
    party_place,
    party_year,
    party,
    addedUserId,
    sceneorg,
    demozoo,
    csdb,
    zxdemo,
    invitation,
    invitationyear,
    boardID,
    rank,
    cdc,
    popularity,
    screenshot,
    party_compo_name
  ) VALUES(` +
    repQuestMark(values.length) +
    `);`;
  db.run(sql, values);
  insertParty(db, prod.party);
  prod.groups.forEach((group) => {
    insertGroup(db, group, Number(prod.id));
  });
  Object.keys(prod.platforms).forEach((key) =>
    insertPlatform(db, Number(key), prod.platforms[key], Number(prod.id)),
  );

  prod.types.forEach((type) => {
    db.run('INSERT INTO types (prod,value) VALUES(?,?);', [
      Number(prod.id),
      type,
    ]);
  });

  prod.downloadLinks.forEach((downloadLink) => {
    db.run('INSERT INTO downloadLinks (prod,type,link) VALUES(?,?,?);', [
      Number(prod.id),
      downloadLink.type,
      downloadLink.link,
    ]);
  });

  prod.credits.forEach((credit) => {
    db.run('INSERT INTO credits (prod, user,role) VALUES(?,?,?);', [
      Number(prod.id),
      Number(credit.user.id),
      credit.role,
    ]);
  });

  prod.awards.forEach((award) => {
    const values: any[] = [
      Number(award.id),
      Number(award.prodID),
      Number(award.categoryID),
      award.awardType,
    ];
    db.run(
      'INSERT INTO awards (id,prodID,categoryID,awardType) VALUES(' +
        repQuestMark(values.length) +
        ');',
      values,
    );
  });

  prod.placings.forEach((placing) => {
    const values: any[] = [
      Number(prod.id),
      Number(placing.party.id),
      placing.compo,
      placing.ranking,
      placing.year,
      placing.compo_name,
    ];
    db.run(
      'INSERT INTO placings (prod, party,compo,ranking,year,compo_name) VALUES(' +
        repQuestMark(values.length) +
        ');',
      values,
    );
  });
}

function insertParty(db: sqlite3.Database, party: Party) {
  if (!party) {
    return;
  }
  const values: any[] = [
    Number(party.id),
    party.name,
    party.web,
    party.addedDate,
    party.addedUser,
  ];
  db.run(
    'INSERT OR IGNORE INTO party (id,name,web,addedDate,addedUser) VALUES(' +
      repQuestMark(values.length) +
      ')',
    values,
  );
}

function insertBoard(db: sqlite3.Database, board: Board) {
  const values: any[] = [
    Number(board.id),
    board.name,
    Number(board.addeduser.id),
    board.sysop,
    board.phonenumber,
    board.addedDate,
  ];
  db.run(
    'INSERT INTO board (id,name,addedUser,sysop,phonenumber,addedDate) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
}

function insertGroup(db: sqlite3.Database, group: Group, prodId?: number) {
  const values: any[] = [
    Number(group.id),
    group.name,
    group.acronym,
    group.disambiguation,
    group.web,
    group.addedUser,
    group.addedDate,
    group.csdb,
    group.zxdemo,
    group.demozoo,
  ];
  db.run(
    'INSERT OR IGNORE INTO group_ (id,name,acronym,disambiguation,web,addedUser,addedDate,csdb,zxdemo,demozoo) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
  if (prodId !== undefined) {
    db.run('INSERT INTO groups (prod,group_) VALUES(?,?);', [
      prodId,
      Number(group.id),
    ]);
  }
}

function insertPlatform(
  db: sqlite3.Database,
  id: number,
  platform: Platform,
  prodId?: number,
) {
  const values: any[] = [id, platform.name, platform.icon, platform.slug];
  db.run(
    'INSERT OR IGNORE INTO platform (id,name,icon,slug) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
  if (prodId !== undefined) {
    db.run('INSERT INTO platforms (prod,platform) VALUES(?,?);', [prodId, id]);
  }
}

function insertUser(db: sqlite3.Database, user: User) {
  const values: any[] = [
    Number(user.id),
    user.nickname,
    user.level,
    user.avatar,
    user.glops,
    user.registerDate,
  ];
  db.run(
    'INSERT OR IGNORE INTO user (id,nickname,level,avatar,glops,registerDate) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
}

function insertTables(db: sqlite3.Database): Observable<any> {
  return new Observable<any>((subscribe) => {
    Pouet.getLatest({ cache: false }).subscribe((dumps) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        dumps.parties.data.forEach((party) => insertParty(db, party));
        dumps.boards.data.forEach((board) => insertBoard(db, board));
        dumps.groups.data.forEach((group) => insertGroup(db, group));
        Object.values(dumps.users).forEach((user) => insertUser(db, user));
        dumps.prods.data.forEach((prod) => insertProd(db, prod));
        db.run('COMMIT;');
        subscribe.next(null);
        subscribe.complete();
      });
    });
  });
}

function createDatabase(): Observable<sqlite3.Database> {
  return new Observable<sqlite3.Database>((subscribe) => {
    const db = new sqlite3.Database(DB_FILE_NAME, (err) => {
      createTables(db);
      insertTables(db).subscribe(() => {
        subscribe.next(db);
        subscribe.complete();
      });
    });
  });
}

function runQueries(db: sqlite3.Database, sql: string): Observable<any[]> {
  return new Observable<any[]>((subscribe) => {
    db.serialize(() => {
      const rows: any[] = [];
      db.each(
        sql,
        (err: Error | null, row: any) => {
          rows.push(row);
        },
        (err: Error | null, count: number) => {
          if (err) {
            subscribe.error(err);
          } else {
            subscribe.next(rows);
          }
          subscribe.complete();
        },
      );
    });
  });
}

export default class Pouet {
  static getLatest(config: Config = { cache: true }): Observable<Dumps> {
    return new Observable<Dumps>((subscribe) => {
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
            subscribe.error(err);
            subscribe.complete();
            return;
          }

          if (config.cache === true) {
            const files = fs
              .readdirSync('.')
              .filter(
                (filter) =>
                  filter.startsWith('pouetdatadump-') &&
                  filter.endsWith('.json'),
              );
            const removeFile = (file: string) => {
              const index = files.indexOf(gz2Json(file), 0);
              if (index > -1) {
                files.splice(index, 1);
              }
            };
            removeFile(latest.prods.filename);
            removeFile(latest.parties.filename);
            removeFile(latest.groups.filename);
            removeFile(latest.boards.filename);
            files.forEach((file) => {
              fs.unlinkSync(file);
            });
            const locale = getLocale(latest);
            if (locale) {
              subscribe.next(locale);
              subscribe.complete();
              return;
            }
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
                    subscribe.next(latest);
                    subscribe.complete();
                  },
                  error: (err: any) => {
                    subscribe.error(err);
                    subscribe.complete();
                  },
                });
              }),
            )
            .catch((res) => {
              subscribe.error(res);
              subscribe.complete();
            });
        })
        .catch((err: AxiosError) => {
          subscribe.error(err);
          subscribe.complete();
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
  static sqlQuery(sql: string): Observable<any[]> {
    return new Observable<any[]>((subscribe) => {
      if (fs.existsSync(DB_FILE_NAME)) {
        const db = new sqlite3.Database(
          DB_FILE_NAME,
          sqlite3.OPEN_READWRITE,
          (err) => {
            runQueries(db, sql).subscribe((result) => {
              subscribe.next(result);
              subscribe.complete();
            });
          },
        );
        return;
      }

      /*      
      if (config.cache === false) {
        if (fs.existsSync(DB_FILE_NAME)) {
          fs.unlinkSync(DB_FILE_NAME);
        }
        createDatabase().subscribe((db) => {
          runQueries(db, sql).subscribe((result) => {
            subscribe.next(result);
            subscribe.complete();
          });
        });
        return;
      }

      const db = new sqlite3.Database(
        DB_FILE_NAME,
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            if (Object(err).code === 'SQLITE_CANTOPEN') {
              // runQueries(createDatabase(config), sql);
              subscribe.next([]);
              subscribe.complete();
              return;
            } else {
              subscribe.error(err);
              subscribe.complete();
            }
          }
          runQueries(db, sql);
          subscribe.next([]);
          subscribe.complete();
        },
      );
*/
    });
  }
}
