import * as sqlite3 from 'sqlite3';
import { Board, Group, Party, Platform, Prod, User } from './models';
import { repQuestMark } from './tools';

export function insertProd(db: sqlite3.Database, prod: Prod) {
  const valuesProd: any[] = [
    Number(prod.id),
    prod.name,
    prod.download,
    prod.type,
    prod.addedUser,
    prod.addedDate,
    prod.releaseDate,
    Number(prod.voteup),
    Number(prod.votepig),
    Number(prod.votedown),
    Number(prod.voteavg),
    prod.party_compo,
    Number(prod.party_place),
    Number(prod.party_year),
    Number(prod.party),
    Number(prod.addeduser.id),
    prod.sceneorg,
    prod.demozoo,
    prod.csdb,
    prod.zxdemo,
    prod.invitation,
    Number(prod.invitationyear),
    prod.boardID,
    Number(prod.rank),
    Number(prod.cdc),
    Number(prod.popularity),
    prod.screenshot,
    prod.party_compo_name,
  ];
  const sql =
    `INSERT INTO prod(
      id,
      name,
      download,
      type,
      addedUserName,
      addedDate,
      releaseDate,
      voteup,
      votepig,
      votedown,
      voteavg,
      party_compo,
      party_place,
      party_year,
      party,
      addedUserId,
      sceneorg,
      demozoo,
      csdb,
      zxdemo,
      invitation,
      invitationyear,
      boardID,
      rank,
      cdc,
      popularity,
      screenshot,
      party_compo_name
    ) VALUES(` +
    repQuestMark(valuesProd.length) +
    `);`;
  db.run(sql, valuesProd);
  insertParty(db, prod.party);
  prod.groups.forEach((group) => {
    insertGroup(db, group, Number(prod.id));
  });
  Object.keys(prod.platforms).forEach((key) =>
    insertPlatform(db, Number(key), prod.platforms[key], Number(prod.id)),
  );

  prod.types.forEach((type) => {
    db.run('INSERT INTO types (prod,value) VALUES(?,?);', [
      Number(prod.id),
      type,
    ]);
  });

  prod.downloadLinks.forEach((downloadLink) => {
    db.run('INSERT INTO downloadLinks (prod,type,link) VALUES(?,?,?);', [
      Number(prod.id),
      downloadLink.type,
      downloadLink.link,
    ]);
  });

  prod.credits.forEach((credit) => {
    db.run('INSERT INTO credits (prod, user,role) VALUES(?,?,?);', [
      Number(prod.id),
      Number(credit.user.id),
      credit.role,
    ]);
  });

  prod.awards.forEach((award) => {
    const valuesAward: any[] = [
      Number(award.id),
      Number(award.prodID),
      Number(award.categoryID),
      award.awardType,
    ];
    db.run(
      'INSERT INTO awards (id,prodID,categoryID,awardType) VALUES(' +
        repQuestMark(valuesAward.length) +
        ');',
      valuesAward,
    );
  });

  prod.placings.forEach((placing) => {
    const valuesPlacing: any[] = [
      Number(prod.id),
      Number(placing.party.id),
      placing.compo,
      placing.ranking,
      placing.year,
      placing.compo_name,
    ];
    db.run(
      'INSERT INTO placings (prod, party,compo,ranking,year,compo_name) VALUES(' +
        repQuestMark(valuesPlacing.length) +
        ');',
      valuesPlacing,
    );
  });
}

export function insertParty(
  db: sqlite3.Database,
  party: Party | undefined | null,
) {
  if (!party) {
    return;
  }
  const values: any[] = [
    Number(party.id),
    party.name,
    party.web,
    party.addedDate,
    party.addedUser,
  ];
  db.run(
    'INSERT OR IGNORE INTO party (id,name,web,addedDate,addedUser) VALUES(' +
      repQuestMark(values.length) +
      ')',
    values,
  );
}

export function insertBoard(db: sqlite3.Database, board: Board) {
  const values: any[] = [
    Number(board.id),
    board.name,
    Number(board.addeduser.id),
    board.sysop,
    board.phonenumber,
    board.addedDate,
  ];
  db.run(
    'INSERT INTO board (id,name,addedUser,sysop,phonenumber,addedDate) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
}

export function insertGroup(
  db: sqlite3.Database,
  group: Group,
  prodId?: number,
) {
  const values: any[] = [
    Number(group.id),
    group.name,
    group.acronym,
    group.disambiguation,
    group.web,
    group.addedUser,
    group.addedDate,
    group.csdb,
    group.zxdemo,
    group.demozoo,
  ];
  db.run(
    'INSERT OR IGNORE INTO group_ (id,name,acronym,disambiguation,web,addedUser,addedDate,csdb,zxdemo,demozoo) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
  if (prodId !== undefined) {
    db.run('INSERT INTO groups (prod,group_) VALUES(?,?);', [
      prodId,
      Number(group.id),
    ]);
  }
}

export function insertPlatform(
  db: sqlite3.Database,
  id: number,
  platform: Platform,
  prodId?: number,
) {
  const values: any[] = [id, platform.name, platform.icon, platform.slug];
  db.run(
    'INSERT OR IGNORE INTO platform (id,name,icon,slug) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
  if (prodId !== undefined) {
    db.run('INSERT INTO platforms (prod,platform) VALUES(?,?);', [prodId, id]);
  }
}

export function insertUser(db: sqlite3.Database, user: User) {
  const values: any[] = [
    Number(user.id),
    user.nickname,
    user.level,
    user.avatar,
    user.glops,
    user.registerDate,
  ];
  db.run(
    'INSERT OR IGNORE INTO user (id,nickname,level,avatar,glops,registerDate) VALUES(' +
      repQuestMark(values.length) +
      ');',
    values,
  );
}
