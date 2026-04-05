import { rawDb } from '../db';

export function criarUF(nome: string, sigla: string) {
  return rawDb.prepare(
    'INSERT INTO uf (nome, sigla) VALUES (?, ?)'
  ).run(nome, sigla);
}

export function listarUFs() {
  return rawDb.prepare('SELECT * FROM uf').all();
}