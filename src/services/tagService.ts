import { rawDb } from '../db';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  nome: string;
}

export interface NoticiaTag {
  id: number;
  noticia_id: number;
  tag_id: number;
}

// ─── CRUD de Tag ──────────────────────────────────────────────────────────────

/** Cria uma nova tag. Retorna null se o nome já existir. */
export function criarTag(nome: string): NoticiaTag | null {
  const existente = rawDb
    .prepare('SELECT id FROM tag WHERE LOWER(nome) = LOWER(?)')
    .get(nome) as Tag | undefined;

  if (existente) return null;

  return rawDb
    .prepare('INSERT INTO tag (nome) VALUES (?)')
    .run(nome) as unknown as NoticiaTag;
}

/** Lista todas as tags cadastradas. */
export function listarTags(): Tag[] {
  return rawDb.prepare('SELECT * FROM tag ORDER BY nome').all() as Tag[];
}

/** Busca uma tag pelo id. */
export function buscarTagPorId(id: number): Tag | undefined {
  return rawDb.prepare('SELECT * FROM tag WHERE id = ?').get(id) as Tag | undefined;
}

// ─── Associação Notícia ↔ Tag ─────────────────────────────────────────────────

/** Associa uma tag a uma notícia. Ignora se o vínculo já existir. */
export function vincularTagNoticia(noticiaId: number, tagId: number): void {
  rawDb
    .prepare(
      'INSERT OR IGNORE INTO noticia_tag (noticia_id, tag_id) VALUES (?, ?)'
    )
    .run(noticiaId, tagId);
}

/** Remove a associação entre uma tag e uma notícia. */
export function desvincularTagNoticia(noticiaId: number, tagId: number): void {
  rawDb
    .prepare('DELETE FROM noticia_tag WHERE noticia_id = ? AND tag_id = ?')
    .run(noticiaId, tagId);
}

/** Retorna todas as tags de uma notícia específica. */
export function listarTagsDaNoticia(noticiaId: number): Tag[] {
  return rawDb
    .prepare(
      `SELECT tag.id, tag.nome
       FROM tag
       JOIN noticia_tag ON tag.id = noticia_tag.tag_id
       WHERE noticia_tag.noticia_id = ?
       ORDER BY tag.nome`
    )
    .all(noticiaId) as Tag[];
}

/** Retorna todas as notícias que possuem uma tag específica. */
export function listarNoticiasDaTag(tagId: number): Array<{
  id: number;
  titulo: string;
  data_criacao: string;
  cidade: string;
}> {
  return rawDb
    .prepare(
      `SELECT noticia.id, noticia.titulo, noticia.data_criacao, cidade.nome AS cidade
       FROM noticia
       JOIN noticia_tag ON noticia.id = noticia_tag.noticia_id
       JOIN cidade      ON noticia.cidade_id = cidade.id
       WHERE noticia_tag.tag_id = ?
       ORDER BY noticia.data_criacao DESC`
    )
    .all(tagId) as Array<{ id: number; titulo: string; data_criacao: string; cidade: string }>;
}
