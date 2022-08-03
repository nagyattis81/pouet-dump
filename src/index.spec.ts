import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getLatest, pouetDatadDmpFiles } from '.';
import { POUET_NET_JSON } from './constants';
import { Dumps } from './interfaces';
import * as fs from 'fs';

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
    // removeFiles();
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

  it(POUET_NET_JSON + ' 200 with data', (done) => {
    fs.writeFileSync('pouetdatadump-test.json', '');
    fs.writeFileSync('pouetdatadump-prods-20220803.json', '');
    mockAxios.onGet(POUET_NET_JSON).reply(200, {
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
    });
    getLatest().subscribe({
      error: (err: AxiosError) => {
        expect(err.message).toEqual('Request failed with status code 404');
        expect(mockAxios.history.get[0].url).toEqual(POUET_NET_JSON);
        expect(fs.existsSync('pouetdatadump-test.json')).toBeFalsy();
        expect(fs.existsSync('pouetdatadump-prods-20220803.json')).toBeTruthy();
        done();
      },
    });
  });
});
