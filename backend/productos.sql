-- ============================================================
--  schema.sql  –  SQLite DDL generado desde schema.ts (Drizzle)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- countries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
    id          INTEGER NOT NULL PRIMARY KEY,
    name        TEXT    NOT NULL,
    short_name  TEXT,
    capital     TEXT    NOT NULL,
    nationality TEXT    NOT NULL,
    languages   TEXT    NOT NULL
);

-- ------------------------------------------------------------
-- people
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS people (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    document TEXT    NOT NULL,
    name     TEXT    NOT NULL,
    address  TEXT,
    status   TEXT    CHECK (status IN ('active', 'inactive')),
    photo    BLOB,
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive'))
);

-- ------------------------------------------------------------
-- employees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id        INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    position  TEXT,
    sector_id INTEGER
    -- sector_id FK se agrega luego porque sectors todavía no existe
);

-- ------------------------------------------------------------
-- sectors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sectors (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_name       TEXT    NOT NULL,
    sector_code       TEXT,
    sector_manager_id INTEGER REFERENCES employees (id)
);

-- Ahora que sectors existe, agregamos la FK de employees.sector_id
-- En SQLite no hay ALTER TABLE ADD CONSTRAINT, por lo que la FK
-- se modela via la declaración completa cuando se recrea la tabla.
-- Si se usa una migración limpia, employees queda así:

-- (Versión definitiva de employees, para uso en migraciones nuevas)
-- CREATE TABLE IF NOT EXISTS employees (
--     id        INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
--     position  TEXT,
--     sector_id INTEGER REFERENCES sectors (id)
-- );

-- ------------------------------------------------------------
-- insurances
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurances (
    policy_number   TEXT    NOT NULL PRIMARY KEY,
    company         TEXT    NOT NULL,
    combined_policy INTEGER,               -- boolean: 0 / 1
    amount          REAL    NOT NULL,
    CONSTRAINT chk_amount CHECK (amount > 0)
);

-- ------------------------------------------------------------
-- clients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    country_id  INTEGER REFERENCES countries (id),
    admitted    INTEGER,                   -- boolean: 0 / 1
    category    TEXT,
    verifier_id INTEGER NOT NULL REFERENCES employees (id),
    CONSTRAINT chk_category
        CHECK (category IN ('common', 'special', 'silver', 'gold', 'platinum'))
);

-- ------------------------------------------------------------
-- owners
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS owners (
    id                     INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    country_id             INTEGER REFERENCES countries (id),
    financial_verification INTEGER,        -- boolean: 0 / 1
    judicial_verification  INTEGER,        -- boolean: 0 / 1
    risk_rating            INTEGER,
    verifier_id            INTEGER NOT NULL REFERENCES employees (id),
    CONSTRAINT chk_risk_rating CHECK (risk_rating IN (1, 2, 3, 4, 5, 6))
);

-- ------------------------------------------------------------
-- auctioneers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auctioneers (
    id      INTEGER NOT NULL PRIMARY KEY REFERENCES people (id),
    license TEXT,
    region  TEXT
);

-- ------------------------------------------------------------
-- auctions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auctions (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    date              TEXT,
    time              TEXT    NOT NULL,
    status            TEXT,
    auctioneer_id     INTEGER REFERENCES auctioneers (id),
    location          TEXT,
    attendee_capacity INTEGER,
    has_warehouse     INTEGER,             -- boolean: 0 / 1
    own_security      INTEGER,             -- boolean: 0 / 1
    category          TEXT,
    CONSTRAINT chk_date
        CHECK (date > date('now', '+10 days')),
    CONSTRAINT chk_auction_status
        CHECK (status IN ('open', 'closed')),
    CONSTRAINT chk_auction_category
        CHECK (category IN ('common', 'special', 'silver', 'gold', 'platinum'))
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    date                TEXT,
    available           INTEGER,           -- boolean: 0 / 1
    catalog_description TEXT    DEFAULT 'None',
    full_description    TEXT    NOT NULL,
    reviewer_id         INTEGER NOT NULL REFERENCES employees (id),
    owner_id            INTEGER NOT NULL REFERENCES owners (id),
    insurance_policy    TEXT    REFERENCES insurances (policy_number)
);

-- ------------------------------------------------------------
-- photos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products (id),
    photo      BLOB    NOT NULL
);

-- ------------------------------------------------------------
-- catalogs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT    NOT NULL,
    auction_id  INTEGER REFERENCES auctions (id),
    manager_id  INTEGER NOT NULL REFERENCES employees (id)
);

-- ------------------------------------------------------------
-- catalog_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_id INTEGER NOT NULL REFERENCES catalogs (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    base_price REAL    NOT NULL,
    commission REAL    NOT NULL,
    auctioned  INTEGER,                    -- boolean: 0 / 1
    CONSTRAINT chk_base_price  CHECK (base_price  > 0.01),
    CONSTRAINT chk_commission  CHECK (commission  > 0.01)
);

-- ------------------------------------------------------------
-- attendees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendees (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    bidder_number INTEGER NOT NULL,
    client_id     INTEGER NOT NULL REFERENCES clients (id),
    auction_id    INTEGER NOT NULL REFERENCES auctions (id)
);

-- ------------------------------------------------------------
-- bids
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    attendee_id INTEGER NOT NULL REFERENCES attendees (id),
    item_id     INTEGER NOT NULL REFERENCES catalog_items (id),
    amount      REAL    NOT NULL,
    winner      INTEGER DEFAULT 0,         -- boolean: 0 / 1
    CONSTRAINT chk_bid_amount CHECK (amount > 0.01)
);

-- ------------------------------------------------------------
-- auction_records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auction_records (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL REFERENCES auctions (id),
    owner_id   INTEGER NOT NULL REFERENCES owners (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    client_id  INTEGER NOT NULL REFERENCES clients (id),
    amount     REAL    NOT NULL,
    commission REAL    NOT NULL,
    CONSTRAINT chk_record_amount     CHECK (amount     > 0.01),
    CONSTRAINT chk_record_commission CHECK (commission > 0.01)
);
