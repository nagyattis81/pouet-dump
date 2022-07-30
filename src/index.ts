import axios from 'axios';
import { Prod, Dump, Dumps, Party, Group, Board } from './interfaces';
import { forkJoin, Observable } from 'rxjs';
import * as zlib from 'zlib';
import * as fs from 'fs';
import { POUET_NET_JSON } from './constants';

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

function gunzipJson(data: any, info: Info): Observable<{ dump_date: string } | undefined> {
  return new Observable<any | undefined>((subscribe) => {
    zlib.gunzip(data, (_err: any, output: any) => {
      const content = output.toString();
      const obj = JSON.parse(content);
      fs.writeFile(info.filename.split('.')[0] + '.json', content, (err) => {
        if (err) {
          subscribe.error();
        } else {
          subscribe.next(obj);
        }
        subscribe.complete();
      });
    });
  });
}

function setData(dumps: Dumps, prodsData: any, partiesData: any, groupsData: any, boardsData: any) {
  dumps.prods.dump_date = prodsData?.dump_date || '';
  dumps.parties.dump_date = partiesData?.dump_date || '';
  dumps.groups.dump_date = groupsData?.dump_date || '';
  dumps.boards.dump_date = boardsData?.dump_date || '';

  dumps.prods.data = Object(prodsData).prods;
  dumps.parties.data = Object(partiesData).parties;
  dumps.groups.data = Object(groupsData).groups;
  dumps.boards.data = Object(boardsData).boards;
}

function getLocale(latest: Dumps): Dumps | undefined {
  const files = fs
    .readdirSync('.')
    .filter((filter) => filter.startsWith('pouetdatadump-'))
    .filter((filter) => filter.endsWith('.json'));
  const prodsFilename = latest.prods.filename.split('.')[0] + '.json';
  const groupsFilename = latest.groups.filename.split('.')[0] + '.json';
  const partiesFilename = latest.parties.filename.split('.')[0] + '.json';
  const boardsFilename = latest.boards.filename.split('.')[0] + '.json';
  if (
    files.find((find) => find === prodsFilename) &&
    files.find((find) => find === groupsFilename) &&
    files.find((find) => find === partiesFilename) &&
    files.find((find) => find === boardsFilename)
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

export function getLatest(): Observable<Dumps | undefined> {
  return new Observable<Dumps | undefined>((subscribe) => {
    axios
      .get<Json>(POUET_NET_JSON)
      .then((value) => {
        const json = value.data;
        const latest: Dumps = {
          prods: createDumpFromInfo<Prod>(json.latest.prods),
          parties: createDumpFromInfo<Party>(json.latest.parties),
          groups: createDumpFromInfo<Group>(json.latest.groups),
          boards: createDumpFromInfo<Board>(json.latest.boards),
        };

        const locale = getLocale(latest);
        if (locale) {
          subscribe.next(locale);
          subscribe.complete();
          return;
        }

        axios
          .all([
            axios.get(latest.prods?.url || '', { responseType: 'arraybuffer' }),
            axios.get(latest.parties?.url || '', { responseType: 'arraybuffer' }),
            axios.get(latest.groups?.url || '', { responseType: 'arraybuffer' }),
            axios.get(latest.boards?.url || '', { responseType: 'arraybuffer' }),
          ])
          .then(
            axios.spread((prods, parties, groups, boards) => {
              forkJoin([
                gunzipJson(prods.data, latest.prods),
                gunzipJson(parties.data, latest.parties),
                gunzipJson(groups.data, latest.groups),
                gunzipJson(boards.data, latest.boards),
              ]).subscribe(([prodsData, partiesData, groupsData, boardsData]) => {
                setData(latest, prodsData, partiesData, groupsData, boardsData);
                subscribe.next(latest);
                subscribe.complete();
              });
            }),
          );
      })
      .catch(() => {
        subscribe.error();
      });
  });
}
