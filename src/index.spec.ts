import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Pouet from '.';
import * as fs from 'fs';
import { Dumps } from './models';
import { pouetDatadDmpFiles } from './tools';
import { POUET_NET_JSON } from './constants';
import { createJson } from './data.spec';
import * as mockFs from 'mock-fs';
import * as path from 'path';

const JSON_DATA = createJson();

const removeFiles = () => {
  pouetDatadDmpFiles().forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
};

describe('Pouet.getLatest', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    mockFs({
      testdata: {
        'pouetdatadump-prods-99991231.json.gz': mockFs.load(
          path.resolve(
            __dirname,
            './../testdata/pouetdatadump-prods-99991231.json.gz',
          ),
        ),
        'pouetdatadump-groups-99991231.json.gz': mockFs.load(
          path.resolve(
            __dirname,
            './../testdata/pouetdatadump-groups-99991231.json.gz',
          ),
        ),
        'pouetdatadump-parties-99991231.json.gz': mockFs.load(
          path.resolve(
            __dirname,
            './../testdata/pouetdatadump-parties-99991231.json.gz',
          ),
        ),
        'pouetdatadump-boards-99991231.json.gz': mockFs.load(
          path.resolve(
            __dirname,
            './../testdata/pouetdatadump-boards-99991231.json.gz',
          ),
        ),
      },
    });
  });

  afterEach(() => {
    mockAxios.reset();
    mockFs.restore();
  });

  it(POUET_NET_JSON + ' 400', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(400);
    Pouet.getLatest({ cache: false }).subscribe({
      error: (err: AxiosError) => {
        expect(err.message).toEqual('Request failed with status code 400');
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 null data', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(200);
    Pouet.getLatest({ cache: false }).subscribe({
      error: (err: any) => {
        expect(err).toBeDefined();
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 with invalid data', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);
    Pouet.getLatest({ cache: false }).subscribe({
      error: (err: AxiosError) => {
        expect(err.message).toEqual('Request failed with status code 404');
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 with valid data', (done) => {
    removeFiles();
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);

    const mock = (url: string) => {
      mockAxios.onGet(url).reply(200, fs.readFileSync('./testdata/' + url));
    };

    mock(JSON_DATA.latest.prods.url);
    mock(JSON_DATA.latest.groups.url);
    mock(JSON_DATA.latest.parties.url);
    mock(JSON_DATA.latest.boards.url);

    Pouet.getLatest().subscribe({
      next: (dumps: Dumps) => {
        expect(dumps.prods.data.length).toEqual(1);
        expect(dumps.groups.data.length).toEqual(1);
        expect(dumps.parties.data.length).toEqual(1);
        expect(dumps.boards.data.length).toEqual(1);
        expect(Object.keys(dumps.platforms).length).toEqual(4);
        expect(Object.keys(dumps.users).length).toEqual(5);

        const prod = dumps.prods.data[0];
        expect(prod.name).toEqual('Astral Blur');
        expect(prod.placings[0].ranking).toEqual(3);
        expect(prod.placings[0].year).toEqual(1997);
        expect(prod.voteup).toEqual(81);
        expect(prod.votepig).toEqual(18);
        expect(prod.votedown).toEqual(5);
        expect(prod.voteavg).toEqual(0.73);
        expect(prod.party_place).toEqual(3);
        expect(prod.party_year).toEqual(1997);
        expect(prod.invitationyear).toEqual(2000);
        expect(prod.rank).toEqual(665);

        expect(dumps.users['1'].glops).toEqual(850);
        expect(dumps.users['1'].nickname).toEqual('analogue');

        expect(fs.existsSync('pouetdatadump-prods-99991231.json')).toBeTruthy();
        expect(
          fs.existsSync('pouetdatadump-boards-99991231.json'),
        ).toBeTruthy();
        expect(
          fs.existsSync('pouetdatadump-groups-99991231.json'),
        ).toBeTruthy();
        expect(
          fs.existsSync('pouetdatadump-parties-99991231.json'),
        ).toBeTruthy();

        done();
      },
      error: (err) => {
        throw new Error(err);
      },
    });
  });

  it(POUET_NET_JSON + ' 200 with valid data - undef gz data', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);

    const mock = (url: string) => {
      mockAxios.onGet(url).reply(200);
    };
    mock(JSON_DATA.latest.prods.url);
    mock(JSON_DATA.latest.groups.url);
    mock(JSON_DATA.latest.parties.url);
    mock(JSON_DATA.latest.boards.url);

    Pouet.getLatest({ cache: false }).subscribe({
      error: (err) => {
        expect(err).toEqual('undefined gz data');
        done();
      },
    });
  });
});

describe('Pouet.genCSV', () => {
  it('genCSV', (done) => {
    fs.unlinkSync('out.csv');
    Pouet.genCSV([], 'out.csv', () => {});
    expect(fs.existsSync('out.csv')).toBeFalsy();
    Pouet.genCSV([{ id: 'id1', title: 'title1' }], 'out.csv', () => {
      expect(fs.existsSync('out.csv')).toBeTruthy();
      done();
    });
  });
});

describe('Pouet.sqlQuery', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it('sqlQuery', (done) => {
    removeFiles();
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);

    const mock = (url: string) => {
      mockAxios.onGet(url).reply(200, fs.readFileSync('./testdata/' + url));
    };

    mock(JSON_DATA.latest.prods.url);
    mock(JSON_DATA.latest.groups.url);
    mock(JSON_DATA.latest.parties.url);
    mock(JSON_DATA.latest.boards.url);

    const titles: string[] = [];

    Pouet.sqlQuery('SELECT * FROM platform;', (title: string) => {
      titles.push(title);
    }).subscribe((result) => {
      expect(result.length).toEqual(4);
      expect(result.map((value) => value.name).sort()).toEqual([
        'BeOS',
        'Linux',
        'MS-Dos',
        'Windows',
      ]);
      expect(titles.sort()).toEqual([
        'Open pouet.db',
        'Start query',
        'Stop query',
      ]);
      done();
    });
  });
});
