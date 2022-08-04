import axios, { AxiosError } from 'axios';
import { Prod, Dump, Dumps, Party, Group, Board, User } from './interfaces';
import { forkJoin, Observable } from 'rxjs';
import * as zlib from 'zlib';
import * as fs from 'fs';

export * from './interfaces';

const POUET_NET_JSON = 'https://data.pouet.net/json.php';

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

export default class Pouet {
  static getLatest(
    config: { cache?: boolean } = { cache: true },
  ): Observable<Dumps> {
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
}
