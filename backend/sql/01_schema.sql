CREATE TABLE IF NOT EXISTS items
(
    id          integer primary key autoincrement,
    name        varchar(50),
    price       integer,
    description text,
    category_id integer,
    seller_id   integer,
    image       blob,
    status      integer,
    created_at  text NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    updated_at  text NOT NULL DEFAULT (DATETIME('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS users
(
    id       integer primary key autoincrement,
    name     varchar(50) NOT NULL UNIQUE,
    password binary(60),
    balance  integer default 0
);

CREATE TABLE IF NOT EXISTS category
(
    id   integer primary key,
    name varchar(50)
);

CREATE TABLE IF NOT EXISTS status
(
    id   integer primary key,
    name varchar(50)
);

CREATE TABLE IF NOT EXISTS comments
(
    comment_id integer primary key autoincrement,
    user_id integer NOT NULL,
    item_id integer NOT NULL,
    content text NOT NULL,
    created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    foreign key (user_id) references users (id),
    foreign key (item_id) references items (id)
);

-- Insert default categories
INSERT INTO category (name) VALUES ("fashion"), ("electronics"), ("food"), ("health"), ("lifestyle");