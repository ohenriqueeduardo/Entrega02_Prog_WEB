import { rawDb } from '../db';

export function criarCidade(nome: string, ufId: number) {
  return rawDb.prepare(
    'INSERT INTO cidade (nome, uf_id) VALUES (?, ?)'
  ).run(nome, ufId);
}

export function listarCidades() {
  return rawDb.prepare(`
    SELECT cidade.id, cidade.nome, uf.sigla
    FROM cidade
    JOIN uf ON cidade.uf_id = uf.id
  `).all();
}