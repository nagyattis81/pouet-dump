# pouet-dump

Queries from pouet dump.

## Data source

https://data.pouet.net/

## Installing

```
npm i @nagyattis81/pouet-dump
```

## Example

```typescript
import { getLatest } from '@nagyattis81/pouet-dump';
import { Prod } from '@nagyattis81/pouet-dump/lib/interfaces';

getLatest().subscribe((dumps) => {
  const func = dumps.parties.data.find((party) => party.name.toLowerCase() === 'function')?.id;
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
    .filter((_, index) => index < 20)
    .forEach((prod) => {
      rows.push({
        id: prod.id,
        name: prod.name,
        type: prod.type,
        youtube: prod.downloadLinks.find((downloadLink) => downloadLink.type.match(/youtube/gi))?.link ?? '',
        voteup: prod.voteup,
      });
    });
  console.log(dumps.prods.dump_date);
  console.table(rows);
});
```

```
2022-07-27 04:30:01
┌─────────┬─────────┬─────────────────────────────────────────┬──────────────────────────┬─────────────────────────────────────────────────────────────────────────────┬────────┐
│ (index) │   id    │                  name                   │           type           │                                   youtube                                   │ voteup │
├─────────┼─────────┼─────────────────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────────────────┼────────┤
│    0    │ '32194' │                'tracie'                 │           '1k'           │                  'http://youtube.com/watch?v=UuMOe454R6I'                   │  299   │
│    1    │ '53871' │                'Spongy'                 │          '128b'          │                'http://www.youtube.com/watch?v=36BPql6Nl_U'                 │  178   │
│    2    │ '82882' │              'PILEDRIVER'               │          'demo'          │                'https://www.youtube.com/watch?v=4zkSd3-6I2A'                │  158   │
│    3    │ '51763' │                'passing'                │          'demo'          │                'http://www.youtube.com/watch?v=82wGnCD0Saw'                 │  157   │
│    4    │ '26655' │               'Demoplex'                │          '256b'          │                'http://www.youtube.com/watch?v=E6zhyutgX1k'                 │  147   │
│    5    │ '66372' │               'Megapole'                │          '256b'          │                'https://www.youtube.com/watch?v=Z8Av7Sc7yGY'                │  144   │
│    6    │ '51757' │                'organix'                │ '4k,procedural graphics' │                                     ''                                      │  141   │
│    7    │ '61883' │            'Apocalypse When'            │          'demo'          │ 'https://www.youtube.com/watch?v=xjWFupnWIv4&list=UU96JVq-z0-0iHAkIkKp1_6w' │  139   │
│    8    │ '68147' │          'Universal Sequence'           │          '64k'           │                'https://www.youtube.com/watch?v=20vPbH6UWIc'                │  137   │
│    9    │ '19448' │                 'hell'                  │          '256b'          │                'http://www.youtube.com/watch?v=ajKmg1TmLh8'                 │  136   │
│   10    │ '19420' │         'Structure 2: Sequence'         │          'demo'          │                'http://www.youtube.com/watch?v=S-e5C7szsuw'                 │  133   │
│   11    │ '60278' │ 'candy ~TokyoDemoFest 2013 Invitation~' │     '64k,invitation'     │                'http://www.youtube.com/watch?v=pGFOmKvA2l8'                 │  121   │
│   12    │ '66380' │          'Immediate railways'           │          '256b'          │                'https://www.youtube.com/watch?v=Sbq2HzXEcN4'                │  120   │
│   13    │ '78045' │                 'Pyrit'                 │          '256b'          │                'http://www.youtube.com/watch?v=eYNoaVERfR4'                 │  113   │
│   14    │ '32212' │              'Pixel Town'               │          '256b'          │                                     ''                                      │  111   │
│   15    │ '53875' │                 'Uzel'                  │          '256b'          │                'http://www.youtube.com/watch?v=ytdvlrdr_Ts'                 │  111   │
│   16    │ '19434' │                 'SSRI'                  │          '64k'           │                'https://www.youtube.com/watch?v=YKAsCLuWgxE'                │  101   │
│   17    │ '57750' │            'Stainless Steel'            │          '256b'          │                'http://www.youtube.com/watch?v=SIkXiUqHpFI'                 │   98   │
│   18    │ '61881' │           'primitive beings'            │          'demo'          │                'https://www.youtube.com/watch?v=ACiY93k7bl4'                │   98   │
│   19    │ '51758' │  'last night a dj killed my demoskene'  │ '4k,procedural graphics' │                                     ''                                      │   94   │
└─────────┴─────────┴─────────────────────────────────────────┴──────────────────────────┴─────────────────────────────────────────────────────────────────────────────┴────────┘
```

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
  users: User[];
}

export interface Error {
  code: string;
  message: string;
  status: string;
}
```
