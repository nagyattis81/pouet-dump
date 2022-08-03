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

export interface Error {
  code: string;
  message: string;
  status: string;
}
