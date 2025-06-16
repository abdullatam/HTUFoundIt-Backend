CREATE TYPE user_role AS ENUM ('student','admin');
CREATE TYPE item_status AS ENUM ('pending','matched','returned');

CREATE TABLE users (
  id         SERIAL       PRIMARY KEY,
  name       TEXT         NOT NULL,
  email      TEXT         NOT NULL UNIQUE,
  mobile     INTEGER      NOT NULL,
  role       user_role    NOT NULL
);

CREATE TABLE lostitem (
  id           SERIAL       PRIMARY KEY,
  name         TEXT         NOT NULL,
  category     TEXT         NOT NULL,
  place        INTEGER      NOT NULL,
  date_lost    DATE         NOT NULL,
  image_url    TEXT         NOT NULL,
  status       item_status  NOT NULL DEFAULT 'pending',
  posted_by    INTEGER      NOT NULL REFERENCES users(id),
  description  TEXT         NOT NULL,
  avatar_url   TEXT,
  mobile       INTEGER
);

CREATE TABLE founditem (
  id             SERIAL       PRIMARY KEY,
  name           TEXT         NOT NULL,
  category       TEXT         NOT NULL,
  place          INTEGER      NOT NULL,
  date_found     DATE         NOT NULL,
  image_url      TEXT         NOT NULL,
  status         item_status  NOT NULL DEFAULT 'pending',
  submitted_by   INTEGER      NOT NULL REFERENCES users(id)
);

CREATE TABLE matches (
  id             SERIAL      PRIMARY KEY,
  lost_item_id   INTEGER     NOT NULL UNIQUE REFERENCES lostitem(id),
  found_item_id  INTEGER     NOT NULL UNIQUE REFERENCES founditem(id),
  matched_by     INTEGER     NOT NULL REFERENCES users(id),
  matched_at     TIMESTAMP   NOT NULL DEFAULT now()
);
