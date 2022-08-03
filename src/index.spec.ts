import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { gz2Json, pouetDatadDmpFiles, getLatest } from '.';
import { POUET_NET_JSON } from './constants';
import * as fs from 'fs';
import { Dumps } from './interfaces';

const JSON_DATA = {
  latest: {
    prods: {
      filename: 'pouetdatadump-prods-20220803.json.gz',
      url: 'pouetdatadump-prods-20220803.json.gz',
      size_in_bytes: 0,
    },
    parties: {
      filename: 'pouetdatadump-parties-20220803.json.gz',
      url: 'pouetdatadump-parties-20220803.json.gz',
      size_in_bytes: 0,
    },
    groups: {
      filename: 'pouetdatadump-groups-20220803.json.gz',
      url: 'pouetdatadump-groups-20220803.json.gz',
      size_in_bytes: 0,
    },
    boards: {
      filename: 'pouetdatadump-boards-20220803.json.gz',
      url: 'pouetdatadump-boards-20220803.json.gz',
      size_in_bytes: 0,
    },
  },
};

describe('tests', () => {
  let mockAxios: MockAdapter;

  const removeFiles = () => {
    pouetDatadDmpFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  };

  beforeEach(() => {
    removeFiles();
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    removeFiles();
    mockAxios.reset();
  });

  it(POUET_NET_JSON + ' 400', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(400);
    getLatest().subscribe({
      error: (err: AxiosError) => {
        expect(err.message).toEqual('Request failed with status code 400');
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 null data', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(200);
    getLatest().subscribe({
      error: (err: any) => {
        expect(err).toBeDefined();
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 with invalid data', (done) => {
    const OLD_JSON_FILE = 'pouetdatadump-old.json';
    fs.writeFileSync(OLD_JSON_FILE, '');
    fs.writeFileSync(gz2Json(JSON_DATA.latest.prods.filename), '{}');
    fs.writeFileSync(gz2Json(JSON_DATA.latest.boards.filename), '{}');
    fs.writeFileSync(gz2Json(JSON_DATA.latest.parties.filename), '{}');
    fs.writeFileSync(gz2Json(JSON_DATA.latest.groups.filename), '{}');
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);
    getLatest().subscribe({
      error: (err: AxiosError) => {
        expect(err.message).toEqual('Request failed with status code 404');
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        expect(fs.existsSync(OLD_JSON_FILE)).toBeFalsy();
        expect(
          fs.existsSync(gz2Json(JSON_DATA.latest.prods.filename)),
        ).toBeTruthy();
        expect(
          fs.existsSync(gz2Json(JSON_DATA.latest.boards.filename)),
        ).toBeTruthy();
        expect(
          fs.existsSync(gz2Json(JSON_DATA.latest.parties.filename)),
        ).toBeTruthy();
        expect(
          fs.existsSync(gz2Json(JSON_DATA.latest.groups.filename)),
        ).toBeTruthy();
        done();
      },
    });
  });

  it(POUET_NET_JSON + ' 200 with valid data', (done) => {
    mockAxios.onGet(POUET_NET_JSON).reply(200, JSON_DATA);

    const mock = (url: string) => {
      mockAxios.onGet(url).reply(200, fs.readFileSync('./testdata/' + url));
    };

    mock(JSON_DATA.latest.prods.url);
    mock(JSON_DATA.latest.groups.url);
    mock(JSON_DATA.latest.parties.url);
    mock(JSON_DATA.latest.boards.url);

    getLatest().subscribe({
      next: (dumps: Dumps) => {
        expect(dumps.prods.data.length).toEqual(1);
        expect(dumps.groups.data.length).toEqual(1);
        expect(dumps.parties.data.length).toEqual(1);
        expect(dumps.boards.data.length).toEqual(1);
        expect(Object.keys(dumps.platforms).length).toEqual(4);
        expect(Object.keys(dumps.users).length).toEqual(5);
        done();
      },
    });
  });
});
