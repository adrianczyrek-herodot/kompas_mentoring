-- Extensions in template1 so every new database (e.g. per-test databases) has them too.
\connect template1
create extension if not exists btree_gist;
create extension if not exists unaccent;
create extension if not exists pg_trgm;
