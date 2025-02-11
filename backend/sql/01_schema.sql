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
    parent_comment_id integer,
    user_id integer NOT NULL,
    user_name varchar(50) NOT NULL,
    item_id integer NOT NULL,
    content text NOT NULL,
    created_at text NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    foreign key (parent_comment_id) references comments (comment_id),
    foreign key (user_id) references users (id),
    foreign key (item_id) references items (id)
);
