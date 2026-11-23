# Legiliban Viewer

A search and reading interface, in Arabic and right-to-left, for the Lebanese Parliament archive collected by [legiliban-crawler](https://github.com/touficbatache/legiliban-crawler): session transcripts, deputies, councils and governments.

Built with Next.js, React, TypeScript, Tailwind CSS and shadcn/ui. The data is read on the server from the crawler's SQLite database.

## Features

- **Full-text search** with ranked results and highlighted snippets, falling back to plain-text matching for queries the index can't parse.
- **Filters** by record type, legislature and date, kept in the URL so a search can be shared as a link.
- **Transcript reader** with search inside the session and its agenda.
- **Deputies table**, **governments timeline** and **council compositions**.
- A link back to the original archive page for every record.

## Get the data

Download `parliament.db.zst` from the crawler's [releases](https://github.com/touficbatache/legiliban-crawler/releases), then:

```sh
mkdir -p data
zstd -d parliament.db.zst -o data/parliament.db
```

The database is about 1.3 GB and is not committed. To keep it elsewhere, set `PARLIAMENT_DB_PATH`.

## Run it

```sh
npm install
npm run dev
```

Then open http://localhost:3000.
