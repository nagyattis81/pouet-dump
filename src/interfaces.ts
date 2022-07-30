export interface Prod {
  id: string;
  name: string;
  download: string;
  types: string[];
}

export interface Party {
  id: string;
}

export interface Group {
  id: string;
}

export interface Board {
  id: string;
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
}
