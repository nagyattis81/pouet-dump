export interface Prod {}
export interface Party {}
export interface Group {}
export interface Board {}

export interface Dump<T> {
  filename: string;
  url: string;
  size_in_bytes: number;
  dump_date: string;
  data: Array<T>;
}

export interface Dumps {
  prods?: Dump<Prod>;
  parties?: Dump<Party>;
  groups?: Dump<Group>;
  boards?: Dump<Board>;
}
