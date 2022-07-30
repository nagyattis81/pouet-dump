import axios from 'axios';
import { Prod, Dump, Dumps, Party, Group, Board } from './interfaces';
import { Observable } from 'rxjs';

export function getLatest(): Observable<Dumps | undefined> {
  return new Observable<Dumps | undefined>((subscribe) => {
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

    axios
      .get<Json>('https://data.pouet.net/json.php')
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
            axios.get(latest.prods?.url || ''),
            axios.get(latest.parties?.url || ''),
            axios.get(latest.groups?.url || ''),
            axios.get(latest.boards?.url || ''),
          ])
          .then(
            axios.spread((prods, parties, groups, boards) => {
              // console.log(prods);
              // console.log(parties);
              // console.log(groups);
              // console.log(boards);
              subscribe.next(latest);
              subscribe.complete();
            }),
          );
      })
      .catch(() => {
        subscribe.error();
      });
  });
}
