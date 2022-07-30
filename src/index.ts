import axios from 'axios';
import { Prod, Dump, Dumps, Party, Group, Board } from './interfaces';
import { forkJoin, Observable } from 'rxjs';
import * as zlib from 'zlib';
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

function gunzipJson(data: any): Observable<{ dump_date: string } | undefined> {
  return new Observable<any | undefined>((subscribe) => {
    zlib.gunzip(data, (_err: any, output: any) => {
      const obj = JSON.parse(output.toString());
      subscribe.next(obj);
      subscribe.complete();
    });
  });
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
                gunzipJson(prods.data),
                gunzipJson(parties.data),
                gunzipJson(groups.data),
                gunzipJson(boards.data),
              ]).subscribe(([prodsData, partiesData, groupsData, boardsData]) => {
                latest.prods.dump_date = prodsData?.dump_date || '';
                latest.parties.dump_date = partiesData?.dump_date || '';
                latest.groups.dump_date = groupsData?.dump_date || '';
                latest.boards.dump_date = boardsData?.dump_date || '';

                latest.prods.data = Object(prodsData).prods;
                latest.parties.data = Object(partiesData).parties;
                latest.groups.data = Object(groupsData).groups;
                latest.boards.data = Object(boardsData).boards;

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
