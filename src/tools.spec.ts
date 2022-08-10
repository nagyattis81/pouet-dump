import { copyJsonFiles, createDumps } from './data.spec';
import { removeFiles } from './tools';
import { Observable } from 'rxjs';
import { Dumps } from './models';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';

describe('tools.ts', () => {
  afterEach(() => {
    mockFs.restore();
  });

  it.skip('removeFiles empty', (done) => {
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
    const files = copyJsonFiles();
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
