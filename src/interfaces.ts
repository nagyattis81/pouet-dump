export interface Info {
  filename: string;
  url: string;
  size_in_bytes: number;
}

export interface Json {
  dumps: any;
  latest: {
    prods: Info;
    parties: Info;
    groups: Info;
    boards: Info;
  };
}

export interface ConfigGetLatest {
  cache?: boolean;
}
