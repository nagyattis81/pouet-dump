# pouet-dump

[![npm](https://img.shields.io/npm/v/@nagyattis81/pouet-dump)](https://www.npmjs.com/package/@nagyattis81/pouet-dump)![npm](https://img.shields.io/npm/dw/@nagyattis81/pouet-dump)

Queries from pouet.net dump.

## Data source

https://data.pouet.net/

## Installing

```
npm i @nagyattis81/pouet-dump
```

## Example

[pouet-query](https://github.com/nagyattis81/pouet-dump/tree/main/example)

```typescript
import Pouet, { Prod } from '@nagyattis81/pouet-dump';

Pouet.getLatest().subscribe((dumps) => {
  const func = dumps.parties.data.find(
    (party) => party.name.toLowerCase() === 'function',
  )?.id;
  if (!func) {
    return;
  }

  const rows: any[] = [];
  dumps.prods.data
    .filter((prod) => prod.party?.id === func)
    .sort((a: Prod, b: Prod) => {
      if (a.voteup > b.voteup) {
        return -1;
      }
      if (a.voteup < b.voteup) {
        return 1;
      }
      return 0;
    })
    .filter((_, index) => index < 10)
    .forEach((prod) => {
      rows.push({
        pouetid: prod.id,
        'name type': prod.name + ' ' + prod.type,
        voteup: prod.voteup,
      });
    });
  console.log(dumps.prods.dump_date);
  console.table(rows);
});
```

![1]

## Model

```typescript
export interface Platform {
  name: string;
  icon: string;
  slug: string;
}

export interface Party {
  id: string;
  name: string;
  web: string;
  addedDate: string;
  addedUser: string;
}

export interface Placing {
  party: Party;
  compo: string;
  ranking: number;
  year: number;
  compo_name: string;
}

export interface Group {
  id: string;
  name: string;
  acronym: string;
  disambiguation: string;
  web: string;
  addedUser: string;
  addedDate: string;
  csdb: string;
  zxdemo: string;
  demozoo: string;
}

export interface Board {
  id: string;
  name: string;
  addeduser: User;
  sysop: string;
  phonenumber: string;
  addedDate: string;
}

export interface Award {
  id: string;
  prodID: string;
  categoryID: string;
  awardType: string;
}

export interface User {
  id: string;
  nickname: string;
  level: string;
  avatar: string;
  glops: number;
  registerDate: string;
}

export interface Credit {
  user: User;
  role: string;
}

export interface DownloadLink {
  type: string;
  link: string;
}

export interface Prod {
  id: string;
  name: string;
  download: string;
  types: string[];
  platforms: { [key: string]: Platform };
  placings: Placing[];
  groups: Group[];
  awards: Award[];
  type: string;
  addedUser: string;
  addedDate: string;
  releaseDate: string;
  voteup: number;
  votepig: number;
  votedown: number;
  voteavg: number;
  party_compo: string;
  party_place: number;
  party_year: number;
  party: Party;
  addeduser: User;
  sceneorg: string;
  demozoo: string;
  csdb: string;
  zxdemo: string;
  invitation: string;
  invitationyear: number;
  boardID: string;
  rank: number;
  cdc: number;
  downloadLinks: DownloadLink[];
  credits: Credit[];
  popularity: number;
  screenshot: string;
  party_compo_name: string;
}

export interface Dump<T> {
  filename: string;
  url: string;
  size_in_bytes: number;
  dump_date: string;
  data: T[];
}

export interface Dumps {
  prods: Dump<Prod>;
  parties: Dump<Party>;
  groups: Dump<Group>;
  boards: Dump<Board>;
  platforms: { [key: string]: Platform };
  users: { [key: string]: User };
}
```

[1]: screenshot.png
