import { rawDb } from '../db';

export function criarNoticia(titulo: string, texto: string, cidadeId: number) {
  return rawDb.prepare(`
    INSERT INTO noticia (titulo, texto, cidade_id)
    VALUES (?, ?, ?)
  `).run(titulo, texto, cidadeId);
}

export function listarNoticias(ordem: 'ASC' | 'DESC') {
  return rawDb.prepare(`
    SELECT noticia.id, titulo, data_criacao, cidade.nome as cidade
    FROM noticia
    JOIN cidade ON noticia.cidade_id = cidade.id
    ORDER BY data_criacao ${ordem}
  `).all();
}

export function listarPorEstado(ufId: number) {
  return rawDb.prepare(`
    SELECT titulo, cidade.nome as cidade
    FROM noticia
    JOIN cidade ON noticia.cidade_id = cidade.id
    WHERE cidade.uf_id = ?
  `).all(ufId);
}

export function listarAgrupado() {
  return rawDb.prepare(`
    SELECT uf.sigla, noticia.titulo, cidade.nome as cidade
    FROM noticia
    JOIN cidade ON noticia.cidade_id = cidade.id
    JOIN uf ON cidade.uf_id = uf.id
    ORDER BY uf.sigla
  `).all();
}