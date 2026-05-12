const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../../database.sqlite");

const db = new Database(DB_PATH);

// Activar foreign keys en cada conexión
db.pragma("foreign_keys = ON");

// Crear/migrar tablas al iniciar
db.exec(`
  -- countries
  CREATE TABLE IF NOT EXISTS countries (
    id          INTEGER NOT NULL PRIMARY KEY,
    name        TEXT    NOT NULL,
    short_name  TEXT,
    capital     TEXT    NOT NULL,
    nationality TEXT    NOT NULL,
    languages   TEXT    NOT NULL
  );

  -- people  (email y password van acá para reutilizarlos en cualquier rol)
  CREATE TABLE IF NOT EXISTS people (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    document TEXT    NOT NULL,
    name     TEXT    NOT NULL,
    address  TEXT,
    status   TEXT    CHECK (status IN ('active', 'inactive')),
    photo    BLOB,
    email    TEXT    UNIQUE,
    password TEXT
  );

  -- employees
  CREATE TABLE IF NOT EXISTS employees (
    id        INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    position  TEXT,
    sector_id INTEGER
  );

  -- sectors
  CREATE TABLE IF NOT EXISTS sectors (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_name       TEXT    NOT NULL,
    sector_code       TEXT,
    sector_manager_id INTEGER REFERENCES employees (id)
  );

  -- insurances
  CREATE TABLE IF NOT EXISTS insurances (
    policy_number   TEXT NOT NULL PRIMARY KEY,
    company         TEXT NOT NULL,
    combined_policy INTEGER,
    amount          REAL NOT NULL CHECK (amount > 0)
  );

  -- clients
  CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    country_id  INTEGER REFERENCES countries (id),
    admitted    INTEGER,
    category    TEXT    CHECK (category IN ('common', 'special', 'silver', 'gold', 'platinum')),
    verifier_id INTEGER NOT NULL REFERENCES employees (id)
  );

  -- owners
  CREATE TABLE IF NOT EXISTS owners (
    id                     INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    country_id             INTEGER REFERENCES countries (id),
    financial_verification INTEGER,
    judicial_verification  INTEGER,
    risk_rating            INTEGER CHECK (risk_rating IN (1,2,3,4,5,6)),
    verifier_id            INTEGER NOT NULL REFERENCES employees (id)
  );

  -- auctioneers
  CREATE TABLE IF NOT EXISTS auctioneers (
    id      INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    license TEXT,
    region  TEXT
  );

  -- auctions
  CREATE TABLE IF NOT EXISTS auctions (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    date              TEXT    CHECK (date > date('now', '+10 days')),
    time              TEXT    NOT NULL,
    status            TEXT    CHECK (status IN ('open', 'closed')),
    auctioneer_id     INTEGER REFERENCES auctioneers (id),
    location          TEXT,
    attendee_capacity INTEGER,
    has_warehouse     INTEGER,
    own_security      INTEGER,
    category          TEXT    CHECK (category IN ('common', 'special', 'silver', 'gold', 'platinum'))
  );

  -- products
  CREATE TABLE IF NOT EXISTS products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    date                TEXT,
    available           INTEGER,
    catalog_description TEXT    DEFAULT 'None',
    full_description    TEXT    NOT NULL,
    reviewer_id         INTEGER NOT NULL REFERENCES employees (id),
    owner_id            INTEGER NOT NULL REFERENCES owners (id),
    insurance_policy    TEXT    REFERENCES insurances (policy_number)
  );

  -- photos
  CREATE TABLE IF NOT EXISTS photos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products (id),
    photo      BLOB    NOT NULL
  );

  -- catalogs
  CREATE TABLE IF NOT EXISTS catalogs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT    NOT NULL,
    auction_id  INTEGER REFERENCES auctions (id),
    manager_id  INTEGER NOT NULL REFERENCES employees (id)
  );

  -- catalog_items
  CREATE TABLE IF NOT EXISTS catalog_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_id INTEGER NOT NULL REFERENCES catalogs (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    base_price REAL    NOT NULL CHECK (base_price > 0.01),
    commission REAL    NOT NULL CHECK (commission > 0.01),
    auctioned  INTEGER
  );

  -- attendees
  CREATE TABLE IF NOT EXISTS attendees (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    bidder_number INTEGER NOT NULL,
    client_id     INTEGER NOT NULL REFERENCES clients (id),
    auction_id    INTEGER NOT NULL REFERENCES auctions (id)
  );

  -- bids
  CREATE TABLE IF NOT EXISTS bids (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    attendee_id INTEGER NOT NULL REFERENCES attendees (id),
    item_id     INTEGER NOT NULL REFERENCES catalog_items (id),
    amount      REAL    NOT NULL CHECK (amount > 0.01),
    winner      INTEGER DEFAULT 0
  );

  -- auction_records
  CREATE TABLE IF NOT EXISTS auction_records (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL REFERENCES auctions (id),
    owner_id   INTEGER NOT NULL REFERENCES owners (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    client_id  INTEGER NOT NULL REFERENCES clients (id),
    amount     REAL    NOT NULL CHECK (amount > 0.01),
    commission REAL    NOT NULL CHECK (commission > 0.01)
  );
`);

module.exports = db;
