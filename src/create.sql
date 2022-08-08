CREATE TABLE
  IF NOT EXISTS version (name VARCHAR, value VARCHAR);

CREATE TABLE
  IF NOT EXISTS awards (
    id INT UNIQUE PRIMARY KEY,
    prodID INT,
    categoryID INT,
    awardType VARCHAR
  );

CREATE INDEX awards_prodID_idx ON awards (prodID);

CREATE TABLE
  IF NOT EXISTS board (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    addedUser INT,
    sysop VARCHAR,
    phonenumber VARCHAR,
    addedDate VARCHAR
  );

CREATE INDEX board_id_idx ON board (id);

CREATE TABLE
  IF NOT EXISTS credits (prod INT, user INT, role VARCHAR);

CREATE INDEX credits_prod_idx ON credits (prod);

CREATE INDEX credits_user_idx ON credits (user);

CREATE TABLE
  IF NOT EXISTS downloadLinks (prod INT, type VARCHAR, link VARCHAR);

CREATE INDEX downloadLinks_prod_idx ON downloadLinks (prod);

CREATE TABLE
  IF NOT EXISTS group_ (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    acronym VARCHAR,
    disambiguation VARCHAR,
    web VARCHAR,
    addedUser VARCHAR,
    addedDate VARCHAR,
    csdb VARCHAR,
    zxdemo VARCHAR,
    demozoo VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX group_id_idx ON group_ (id);

CREATE TABLE
  IF NOT EXISTS groups (prod INT, group_ INT);

CREATE INDEX groups_prod_idx ON groups (prod);

CREATE TABLE
  IF NOT EXISTS party (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    web VARCHAR,
    addedDate VARCHAR,
    addedUser VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX party_id_idx ON party (id);

CREATE TABLE
  IF NOT EXISTS placings (
    prod INT,
    party INT,
    compo VARCHAR,
    ranking INT,
    year INT,
    compo_name VARCHAR
  );

CREATE INDEX placings_prod_idx ON placings (prod);

CREATE TABLE
  IF NOT EXISTS platform (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    icon VARCHAR,
    slug VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX platform_id_idx ON platform (id);

CREATE TABLE
  IF NOT EXISTS platforms (prod INT, platform INT);

CREATE INDEX platforms_prod_idx ON platforms (prod);

CREATE TABLE
  IF NOT EXISTS prod (
    id INT UNIQUE PRIMARY KEY,
    name VARCHAR,
    download VARCHAR,
    type VARCHAR,
    addedUserName VARCHAR,
    addedDate VARCHAR,
    releaseDate VARCHAR,
    voteup INT,
    votepig INT,
    votedown INT,
    voteavg REAL,
    party_compo VARCHAR,
    party_place INT,
    party_year INT,
    party INT,
    addedUserId INT,
    sceneorg VARCHAR,
    demozoo VARCHAR,
    csdb VARCHAR,
    zxdemo VARCHAR,
    invitation VARCHAR,
    invitationyear INT,
    boardID VARCHAR,
    rank INT,
    cdc INT,
    popularity REAL,
    screenshot VARCHAR,
    party_compo_name VARCHAR
  );

CREATE INDEX prod_id_idx ON prod (id);

CREATE TABLE
  IF NOT EXISTS types (prod INT, value VARCHAR);

CREATE INDEX types_prod_idx ON types (prod);

CREATE TABLE
  IF NOT EXISTS user (
    id INT UNIQUE PRIMARY KEY,
    nickname VARCHAR,
    level VARCHAR,
    avatar VARCHAR,
    glops INT,
    registerDate VARCHAR,
    UNIQUE (id)
  );

CREATE INDEX user_id_idx ON user (id);