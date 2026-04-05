// Conexão com SQLite usando Drizzle
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('database_envio_2.db');

export const db = drizzle(sqlite);
export const rawDb = sqlite; // para usar prepare()