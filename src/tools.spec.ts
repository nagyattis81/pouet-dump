import { createDumps } from './data.spec';
import { removeFiles } from './tools';
import { Observable } from 'rxjs';
import { Dumps } from './models';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';

describe('tools.ts', () => {
  afterEach(() => {
    mockFs.restore();
  });

  function copyFiles(): any {
    return {
      'pouetdatadump-prods-99991231.json': mockFs.load(
        './testdata/pouetdatadump-prods-99991231.json',
      ),
      'pouetdatadump-groups-99991231.json': mockFs.load(
        './testdata/pouetdatadump-groups-99991231.json',
      ),
      'pouetdatadump-parties-99991231.json': mockFs.load(
        './testdata/pouetdatadump-parties-99991231.json',
      ),
      'pouetdatadump-boards-99991231.json': mockFs.load(
        './testdata/pouetdatadump-boards-99991231.json',
      ),
    };
  }

  it('removeFiles empty', (done) => {
    new Observable<Dumps>((subscriber) => {
      const dumps = createDumps();
      if (removeFiles(dumps, subscriber)) {
        return;
      }
      subscriber.next(undefined);
      subscriber.complete();
    }).subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('removeFiles full', (done) => {
    const files = copyFiles();
    files['pouetdatadump-remove-test.json'] = '{}';
    mockFs(files);
    new Observable<Dumps>((subscriber) => {
      const dumps = createDumps();
      if (removeFiles(dumps, subscriber)) {
        return;
      }
      subscriber.next(undefined);
      subscriber.complete();
    }).subscribe((result) => {
      expect(result).toBeDefined();
      expect(fs.existsSync('pouetdatadump-remove-test.json')).toBeFalsy();
      done();
    });
  });
});
