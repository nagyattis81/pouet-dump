import { forkJoin, Observable } from 'rxjs';
import * as sqlite3 from 'sqlite3';
import {
  createAwardsResult,
  createCreditsResult,
  createDownloadLinksResult,
  createGroupResult,
  createGroupsResult,
  createPartyResult,
  createPlacingsResult,
  createPlatformResult,
  createProd,
  createProdResult,
  createTypesResult,
  createUser,
} from './data.spec';
import { createTables } from './database';
import { insertBoard, insertParty, insertProd, insertUser } from './inserts';

describe('inserts.ts', () => {
  let db!: sqlite3.Database;
  beforeEach(() => {
    db = new sqlite3.Database(':memory:');
    createTables(db);
  });

  it('insertProd', (done) => {
    db.serialize(() => {
      db.serialize(() => {
        insertProd(db, createProd());

        const query = (sql: string): Observable<any[]> => {
          return new Observable<any[]>((subscriber) => {
            db.all(sql, (_, rows: any[]) => {
              subscriber.next(rows);
              subscriber.complete();
            });
          });
        };

        forkJoin([
          query('SELECT * FROM prod;'),
          query('SELECT * FROM party;'),
          query('SELECT * FROM group_ ;'),
          query('SELECT * FROM groups;'),
          query('SELECT * FROM platform;'),
          query('SELECT * FROM types;'),
          query('SELECT * FROM downloadLinks;'),
          query('SELECT * FROM credits;'),
          query('SELECT * FROM awards;'),
          query('SELECT * FROM placings;'),
        ]).subscribe(
          ([
            prod,
            party,
            group_,
            groups,
            platform,
            types,
            downloadLinks,
            credits,
            awards,
            placings,
          ]) => {
            expect(prod).toEqual(createProdResult());
            expect(party).toEqual(createPartyResult());
            expect(group_).toEqual(createGroupResult());
            expect(groups).toEqual(createGroupsResult());
            expect(platform).toEqual(createPlatformResult());
            expect(types).toEqual(createTypesResult());
            expect(downloadLinks).toEqual(createDownloadLinksResult());
            expect(credits).toEqual(createCreditsResult());
            expect(awards).toEqual(createAwardsResult());
            expect(placings).toEqual(createPlacingsResult());
            done();
          },
        );
      });
    });
  });

  it('insertParty', (done) => {
    db.serialize(() => {
      insertParty(db, null);
      db.all('SELECT * FROM party;', (err: Error | null, rows: any[]) => {
        expect(rows).toEqual([]);
        done();
      });
    });
  });

  it('insertBoard', (done) => {
    db.serialize(() => {
      insertBoard(db, {
        addedDate: 'addedDate',
        addeduser: createUser('1'),
        id: '1',
        name: 'name',
        phonenumber: 'phonenumber',
        sysop: 'sysop',
      });
      db.all('SELECT * FROM board;', (err: Error | null, rows: any[]) => {
        expect(rows).toEqual([
          {
            addedDate: 'addedDate',
            addedUser: 1,
            id: 1,
            name: 'name',
            phonenumber: 'phonenumber',
            sysop: 'sysop',
          },
        ]);
        done();
      });
    });
  });

  it('insertUser', (done) => {
    db.serialize(() => {
      insertUser(db, {
        avatar: 'avatar',
        glops: 0,
        id: '0',
        level: 'level',
        nickname: 'nickname',
        registerDate: 'registerDate',
      });
      db.all('SELECT * FROM user;', (err: Error | null, rows: any[]) => {
        expect(rows).toEqual([
          {
            avatar: 'avatar',
            glops: 0,
            id: 0,
            level: 'level',
            nickname: 'nickname',
            registerDate: 'registerDate',
          },
        ]);
        done();
      });
    });
  });
});
