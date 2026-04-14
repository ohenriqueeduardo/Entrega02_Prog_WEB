// Criação das tabelas
import Database from 'better-sqlite3';

const db = new Database('database_envio_2.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS uf (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL,
    sigla TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cidade (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT NOT NULL,
    uf_id  INTEGER,
    FOREIGN KEY (uf_id) REFERENCES uf(id)
  );

  CREATE TABLE IF NOT EXISTS noticia (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo       TEXT NOT NULL,
    texto        TEXT NOT NULL,
    cidade_id    INTEGER,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES cidade(id)
  );

  CREATE TABLE IF NOT EXISTS tag (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS noticia_tag (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    noticia_id  INTEGER NOT NULL,
    tag_id      INTEGER NOT NULL,
    FOREIGN KEY (noticia_id) REFERENCES noticia(id),
    FOREIGN KEY (tag_id)     REFERENCES tag(id),
    UNIQUE (noticia_id, tag_id)
  );
`);

console.log('✅ Tabelas criadas com sucesso!');
