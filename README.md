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

  const CSV_FILENAME = 'result.csv';
  Pouet.genCSV(rows, 'result.csv', () => {
    console.log('Write', CSV_FILENAME);
  });
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

## Database

```sql
CREATE TABLE
  IF NOT EXISTS awards (id INT, prodID INT, categoryID INT, awardType VARCHAR);

CREATE INDEX awards_prodID_idx ON awards (prodID);

CREATE TABLE
  IF NOT EXISTS board (
    id INT,
    name VARCHAR,
    addedUser INT,
    sysop VARCHAR,
    phonenumber VARCHAR,
    addedDate VARCHAR
  );

CREATE INDEX board_id_idx ON board (id);

CREATE TABLE
  IF NOT EXISTS credits (prod INT, user INT, role VARCHAR);

CREATE INDEX credits_prod_idx ON credits (prod);

CREATE INDEX credits_user_idx ON credits (user);

CREATE TABLE
  IF NOT EXISTS downloadLinks (prod INT, type VARCHAR, link VARCHAR);

CREATE INDEX downloadLinks_prod_idx ON downloadLinks (prod);

CREATE TABLE
  IF NOT EXISTS group_ (
    id INT,
    name VARCHAR,
    acronym VARCHAR,
    disambiguation VARCHAR,
    web VARCHAR,
    addedUser VARCHAR,
    addedDate VARCHAR,
    csdb VARCHAR,
    zxdemo VARCHAR,
    demozoo VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX group_id_idx ON group_ (id);

CREATE TABLE
  IF NOT EXISTS groups (prod INT, group_ INT);

CREATE INDEX groups_prod_idx ON groups (prod);

CREATE TABLE
  IF NOT EXISTS party (
    id INT,
    name VARCHAR,
    web VARCHAR,
    addedDate VARCHAR,
    addedUser VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX party_id_idx ON party (id);

CREATE TABLE
  IF NOT EXISTS placings (
    prod INT,
    party INT,
    compo VARCHAR,
    ranking INT,
    year INT,
    compo_name VARCHAR
  );

CREATE INDEX placings_prod_idx ON placings (prod);

CREATE TABLE
  IF NOT EXISTS platform (
    id INT,
    name VARCHAR,
    icon VARCHAR,
    slug VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX platform_id_idx ON platform (id);

CREATE TABLE
  IF NOT EXISTS platforms (prod INT, platform INT);

CREATE INDEX platforms_prod_idx ON platforms (prod);

CREATE TABLE
  IF NOT EXISTS prod (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    download VARCHAR,
    type VARCHAR,
    addedUserName VARCHAR,
    addedDate VARCHAR,
    releaseDate VARCHAR,
    voteup INT,
    votepig INT,
    votedown INT,
    voteavg REAL,
    party_compo VARCHAR,
    party_place INT,
    party_year INT,
    party INT,
    addedUserId INT,
    sceneorg VARCHAR,
    demozoo VARCHAR,
    csdb VARCHAR,
    zxdemo VARCHAR,
    invitation VARCHAR,
    invitationyear INT,
    boardID VARCHAR,
    rank INT,
    cdc INT,
    popularity REAL,
    screenshot VARCHAR,
    party_compo_name VARCHAR
  );

CREATE INDEX prod_id_idx ON prod (id);

CREATE TABLE
  IF NOT EXISTS types (prod INT, value VARCHAR);

CREATE INDEX types_prod_idx ON types (prod);

CREATE TABLE
  IF NOT EXISTS user (
    id INT,
    nickname VARCHAR,
    level VARCHAR,
    avatar VARCHAR,
    glops INT,
    registerDate VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX user_id_idx ON user (id);
```

[1]: screenshot.png
