import "server-only";

import path from "node:path";
import Database from "better-sqlite3";

const DEFAULT_DB_PATH = "./data/parliament.db";

function resolveDbPath() {
  const configured = process.env.PARLIAMENT_DB_PATH || DEFAULT_DB_PATH;
  if (path.isAbsolute(configured)) return configured;

  if (configured === DEFAULT_DB_PATH || configured === "data/parliament.db") {
    return path.join(process.cwd(), "data", "parliament.db");
  }

  return path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

type DbInstance = Database.Database;

let dbSingleton: DbInstance | null = null;

export function getDb() {
  if (dbSingleton) {
    return dbSingleton;
  }

  dbSingleton = new Database(resolveDbPath(), {
    readonly: true,
    fileMustExist: true,
  });

  dbSingleton.pragma("query_only = 1");
  dbSingleton.pragma("busy_timeout = 5000");
  dbSingleton.pragma("temp_store = MEMORY");

  return dbSingleton;
}

export type SqlValue = string | number | null;

export function runAll<T>(sql: string, params: SqlValue[] = []) {
  return getDb()
    .prepare(sql)
    .all(...params) as T[];
}

export function runGet<T>(sql: string, params: SqlValue[] = []) {
  return (getDb()
    .prepare(sql)
    .get(...params) ?? null) as T | null;
}
