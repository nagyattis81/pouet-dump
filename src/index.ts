import axios, { AxiosError } from 'axios';
import { Prod, Dump, Dumps, Party, Group, Board, Error, User } from './interfaces';
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

const createEmptyDump = <T>(): Dump<T> => {
  return {
    filename: '',
    url: '',
    size_in_bytes: -1,
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
  const handleUser = (user: User) => {
    user.glops = Number(user.glops);
    if (dumps.users.find((find) => find.id === user.id)) {
      return;
    }
    dumps.users.push(user);
  };

  dumps.prods.dump_date = prodsData?.dump_date || '';
  dumps.parties.dump_date = partiesData?.dump_date || '';
  dumps.groups.dump_date = groupsData?.dump_date || '';
  dumps.boards.dump_date = boardsData?.dump_date || '';

  dumps.prods.data = Object(prodsData).prods;
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

  dumps.parties.data = Object(partiesData).parties;
  dumps.groups.data = Object(groupsData).groups;
  dumps.boards.data = Object(boardsData).boards;
  (dumps.boards.data as Board[]).forEach((board) => handleUser(board.addeduser));
}

const pouetdatadumpFiles = fs
  .readdirSync('.')
  .filter((filter) => filter.startsWith('pouetdatadump-'))
  .filter((filter) => filter.endsWith('.json'));

function getFromFile(): Dumps | undefined {
  let prodsData!: any;
  let partiesData!: any;
  let groupsData!: any;
  let boardsData!: any;

  pouetdatadumpFiles.forEach((file) => {
    if (file.startsWith('pouetdatadump-boards-') && file.endsWith('.json')) {
      boardsData = JSON.parse(fs.readFileSync(file).toString());
    }
    if (file.startsWith('pouetdatadump-groups-') && file.endsWith('.json')) {
      groupsData = JSON.parse(fs.readFileSync(file).toString());
    }
    if (file.startsWith('pouetdatadump-parties-') && file.endsWith('.json')) {
      partiesData = JSON.parse(fs.readFileSync(file).toString());
    }
    if (file.startsWith('pouetdatadump-prods-') && file.endsWith('.json')) {
      prodsData = JSON.parse(fs.readFileSync(file).toString());
    }
  });
  if (prodsData && partiesData && groupsData && boardsData) {
    const locale: Dumps = {
      prods: createEmptyDump<Prod>(),
      boards: createEmptyDump<Board>(),
      groups: createEmptyDump<Group>(),
      parties: createEmptyDump<Party>(),
      platforms: {},
      users: [],
    };
    setData(locale, prodsData, partiesData, groupsData, boardsData);
    return locale;
  }
  return undefined;
}

function getLocale(latest: Dumps): Dumps | undefined {
  const prodsFilename = latest.prods.filename.split('.')[0] + '.json';
  const groupsFilename = latest.groups.filename.split('.')[0] + '.json';
  const partiesFilename = latest.parties.filename.split('.')[0] + '.json';
  const boardsFilename = latest.boards.filename.split('.')[0] + '.json';
  if (
    pouetdatadumpFiles.find((find) => find === prodsFilename) &&
    pouetdatadumpFiles.find((find) => find === groupsFilename) &&
    pouetdatadumpFiles.find((find) => find === partiesFilename) &&
    pouetdatadumpFiles.find((find) => find === boardsFilename)
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

export function getLatest(config: { cache?: boolean } = { cache: true }): Observable<Dumps> {
  return new Observable<Dumps>((subscribe) => {
    axios
      .get<Json>(POUET_NET_JSON)
      .then((value) => {
        const json = value.data;
        const latest: Dumps = {
          prods: createDumpFromInfo<Prod>(json.latest.prods),
          parties: createDumpFromInfo<Party>(json.latest.parties),
          groups: createDumpFromInfo<Group>(json.latest.groups),
          boards: createDumpFromInfo<Board>(json.latest.boards),
          platforms: {},
          users: [],
        };

        if (config.cache === true) {
          const locale = getLocale(latest);
          if (locale) {
            subscribe.next(locale);
            subscribe.complete();
            return;
          }
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
      .catch((err: AxiosError) => {
        const locale = getFromFile();
        if (locale) {
          subscribe.next(locale);
          subscribe.complete();
          return;
        }
        subscribe.error({
          code: err.code,
          message: err.message,
          status: err.status,
        } as Error);
        subscribe.complete();
      });
  });
}
