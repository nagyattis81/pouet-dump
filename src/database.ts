import axios from 'axios';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { Observable } from 'rxjs';
import Pouet from '.';
import {
  insertBoard,
  insertGroup,
  insertParty,
  insertProd,
  insertUser,
} from './inserts';
import { DB_FILE_NAME, POUET_NET_JSON } from './constants';
import { Json } from './interfaces';

export function createTables(db: sqlite3.Database) {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const sql = fs
      .readFileSync(path.join(__dirname, './create.sql'))
      .toString();
    sql.split(');').forEach((txt) => {
      if (txt) {
        txt += ');';
        db.run(txt);
      }
    });
    db.run('COMMIT;');
  });
}

export function insertTables(
  db: sqlite3.Database,
  progress?: (title: string) => void,
): Observable<any> {
  if (progress) {
    progress('Get latest');
  }
  return new Observable<any>((subscribe) => {
    Pouet.getLatest({ cache: false }).subscribe((dumps) => {
      if (progress) {
        progress('Start transaction');
      }
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        db.run('INSERT INTO version (name, value) VALUES(?,?);', [
          'prods',
          dumps.prods.filename,
        ]);
        db.run('INSERT INTO version (name, value) VALUES(?,?);', [
          'groups',
          dumps.groups.filename,
        ]);
        db.run('INSERT INTO version (name, value) VALUES(?,?);', [
          'parties',
          dumps.parties.filename,
        ]);
        db.run('INSERT INTO version (name, value) VALUES(?,?);', [
          'boards',
          dumps.boards.filename,
        ]);
        dumps.parties.data.forEach((party) => insertParty(db, party));
        dumps.boards.data.forEach((board) => insertBoard(db, board));
        dumps.groups.data.forEach((group) => insertGroup(db, group));
        Object.values(dumps.users).forEach((user) => insertUser(db, user));
        dumps.prods.data.forEach((prod) => insertProd(db, prod));
        db.run('COMMIT;');
        if (progress) {
          progress('Stop transaction');
        }
        subscribe.next(null);
        subscribe.complete();
      });
    });
  });
}

export function createDatabase(
  progress?: (title: string) => void,
): Observable<sqlite3.Database> {
  if (progress) {
    progress('Create database ' + DB_FILE_NAME);
  }
  return new Observable<sqlite3.Database>((subscribe) => {
    const db = new sqlite3.Database(DB_FILE_NAME, (err) => {
      if (progress) {
        progress('Create tables');
      }
      createTables(db);
      if (progress) {
        progress('Insert tables');
      }
      insertTables(db, progress).subscribe(() => {
        subscribe.next(db);
        subscribe.complete();
      });
    });
  });
}

export function runQueries(
  db: sqlite3.Database,
  sql: string,
  progress?: (title: string) => void,
): Observable<any[]> {
  if (progress) {
    progress('Start query');
  }
  return new Observable<any[]>((subscribe) => {
    db.serialize(() => {
      const rows: any[] = [];
      db.each(
        sql,
        (err: Error | null, row: any) => {
          rows.push(row);
        },
        (err: Error | null, count: number) => {
          if (err) {
            subscribe.error(err);
          } else {
            if (progress) {
              progress('Stop query');
            }
            subscribe.next(rows);
          }
          subscribe.complete();
        },
      );
    });
  });
}

export function checkVersion(): Observable<boolean> {
  return new Observable<boolean>((subscribe) => {
    const db = new sqlite3.Database(
      DB_FILE_NAME,
      sqlite3.OPEN_READWRITE,
      (err) => {
        db.serialize(() => {
          axios.get<Json>(POUET_NET_JSON).then((result) => {
            db.serialize(() => {
              db.all(
                `
                  SELECT * 
                  FROM version
                  WHERE name='prods' AND value = ?
                  `,
                [result.data.latest.prods.filename],
                (_: Error | null, rows: any[]) => {
                  db.close(() => {
                    subscribe.next(rows.length > 0);
                    subscribe.complete();
                  });
                },
              );
            });
          });
        });
      },
    );
  });
}
