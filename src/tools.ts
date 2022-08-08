import * as fs from 'fs';
import * as zlib from 'zlib';
import { Info } from './interfaces';
import { Board, Dump, Dumps, Prod, User } from './models';
import { Observable } from 'rxjs';

export const pouetDatadDmpFiles = fs
  .readdirSync('.')
  .filter(
    (filter) => filter.startsWith('pouetdatadump-') && filter.endsWith('.json'),
  );

export function gz2Json(gz: string): string {
  return gz.split('.')[0] + '.json';
}

export function repQuestMark(value: number): string {
  return ',?'.repeat(value).substring(1);
}

export const createDumpFromInfo = <T>(info: Info): Dump<T> => {
  return {
    filename: info.filename,
    url: info.url,
    size_in_bytes: info.size_in_bytes,
    dump_date: '',
    data: [],
  };
};

export function gunzipJson(
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

export function setData(
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

export function getLocale(latest: Dumps): Dumps | undefined {
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
