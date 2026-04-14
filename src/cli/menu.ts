import { perguntar, pedirTextoObrigatorio, selecionarDaLista } from './prompts';
import { criarUF, listarUFs }               from '../services/ufService';
import { criarCidade, listarCidades }       from '../services/cidadeService';
import {
  criarNoticia,
  listarNoticias,
  listarPorEstado,
  listarAgrupado,
  buscarNoticiaPorId,
} from '../services/noticiaService';
import {
  criarTag,
  listarTags,
  vincularTagNoticia,
  desvincularTagNoticia,
  listarTagsDaNoticia,
  listarNoticiasDaTag,
  Tag,
} from '../services/tagService';

// ─── Tipos auxiliares ────────────────────────────────────────────────────────

interface UF      { id: number; nome: string; sigla: string; }
interface Cidade  { id: number; nome: string; sigla: string; }
interface Noticia { id: number; titulo: string; data_criacao: string; cidade: string; }
interface NoticiaAgrupada { sigla: string; titulo: string; cidade: string; }

// ─── Utilitários de exibição ─────────────────────────────────────────────────

function sep(char = '─', n = 50): void { console.log('\n' + char.repeat(n)); }

function cabecalho(texto: string): void {
  sep('═');
  console.log(`  📌 ${texto}`);
  sep('═');
}

function pausar(): Promise<void> {
  return perguntar('\n  Pressione ENTER para continuar...').then(() => {});
}

function exibirTags(tags: Tag[]): string {
  return tags.length ? tags.map(t => `#${t.nome}`).join('  ') : '(sem tags)';
}

// ─── Fluxo: Cadastrar UF ─────────────────────────────────────────────────────

export async function fluxoCadastrarUF(): Promise<void> {
  cabecalho('Cadastrar UF');
  const nome  = await pedirTextoObrigatorio('Nome do estado (ex: São Paulo)');
  const sigla = await pedirTextoObrigatorio('Sigla (ex: SP)');
  criarUF(nome, sigla.toUpperCase());
  console.log(`\n  ✅ UF "${sigla.toUpperCase()} — ${nome}" cadastrada com sucesso!`);
  await pausar();
}

// ─── Fluxo: Cadastrar Cidade ──────────────────────────────────────────────────

export async function fluxoCadastrarCidade(): Promise<void> {
  cabecalho('Cadastrar Cidade');
  const nome = await pedirTextoObrigatorio('Nome da cidade');
  const ufs  = listarUFs() as UF[];
  const uf   = await selecionarDaLista(ufs, u => `${u.sigla} — ${u.nome}`, 'UFs');
  if (!uf) {
    console.log('\n  ❌ Cadastre pelo menos uma UF antes de cadastrar uma cidade.');
    await pausar(); return;
  }
  criarCidade(nome, uf.id);
  console.log(`\n  ✅ Cidade "${nome}" cadastrada em "${uf.sigla}" com sucesso!`);
  await pausar();
}

// ─── Fluxo: Cadastrar Notícia ─────────────────────────────────────────────────

export async function fluxoCadastrarNoticia(): Promise<void> {
  cabecalho('Cadastrar Notícia');

  const tituloN = await pedirTextoObrigatorio('Título da notícia');
  const texto   = await pedirTextoObrigatorio('Texto da notícia');

  const cidades = listarCidades() as Cidade[];
  const cidade  = await selecionarDaLista(cidades, c => `${c.nome} (${c.sigla})`, 'Cidades');
  if (!cidade) {
    console.log('\n  ❌ Cadastre pelo menos uma cidade antes de cadastrar uma notícia.');
    await pausar(); return;
  }

  const resultado = criarNoticia(tituloN, texto, cidade.id) as { lastInsertRowid: number };
  const noticiaId = resultado.lastInsertRowid;

  console.log(`\n  ✅ Notícia "${tituloN}" cadastrada em "${cidade.nome}"!`);

  // ── Vincular tags opcionalmente ──────────────────────────────────────────
  const vincular = await perguntar('\n  Deseja adicionar tags agora? (s/n): ');
  if (vincular.toLowerCase() === 's') {
    await fluxoVincularTags(noticiaId, tituloN);
  }

  await pausar();
}

// ─── Fluxo: Listar Notícias ───────────────────────────────────────────────────

export async function fluxoListarNoticias(ordem: 'ASC' | 'DESC'): Promise<void> {
  const label = ordem === 'DESC' ? 'Notícias Recentes' : 'Notícias Antigas';
  cabecalho(label);

  const noticias = listarNoticias(ordem) as Noticia[];
  if (noticias.length === 0) {
    console.log('  ⚠️  Nenhuma notícia cadastrada ainda.');
    await pausar(); return;
  }

  exibirListaNoticias(noticias);

  while (true) {
    const acao = await perguntar('\n  (d) Detalhar   (z) Voltar: ');
    if (acao.toLowerCase() === 'z') break;
    if (acao.toLowerCase() === 'd') {
      await fluxoDetalharNoticia(noticias);
    } else {
      console.log('  ⚠️  Opção inválida.');
    }
  }
}

// ─── Fluxo: Notícias por Estado ───────────────────────────────────────────────

export async function fluxoNoticiasPorEstado(): Promise<void> {
  cabecalho('Notícias por Estado');

  const ufs = listarUFs() as UF[];
  const uf  = await selecionarDaLista(ufs, u => `${u.sigla} — ${u.nome}`, 'UFs');
  if (!uf) { await pausar(); return; }

  const noticias = listarPorEstado(uf.id) as Array<{ id: number; titulo: string; cidade: string }>;
  console.log(`\n  📰 Notícias em "${uf.sigla} — ${uf.nome}":`);

  if (noticias.length === 0) {
    console.log('  ⚠️  Nenhuma notícia encontrada para este estado.');
  } else {
    noticias.forEach((n, i) => {
      const tags = listarTagsDaNoticia(n.id);
      console.log(`\n  [${i + 1}] ${n.titulo}`);
      console.log(`       📍 ${n.cidade}`);
      console.log(`       🏷️  ${exibirTags(tags)}`);
    });
  }

  await pausar();
}

// ─── Fluxo: Agrupadas por Estado ──────────────────────────────────────────────

export async function fluxoAgrupadasPorEstado(): Promise<void> {
  cabecalho('Notícias Agrupadas por Estado');

  const dados = listarAgrupado() as NoticiaAgrupada[];
  if (dados.length === 0) {
    console.log('  ⚠️  Nenhuma notícia cadastrada ainda.');
    await pausar(); return;
  }

  const grupos: Record<string, NoticiaAgrupada[]> = {};
  for (const item of dados) {
    if (!grupos[item.sigla]) grupos[item.sigla] = [];
    grupos[item.sigla].push(item);
  }

  for (const sigla in grupos) {
    console.log(`\n  🗺️  ${sigla}`);
    sep('·', 40);
    grupos[sigla].forEach((n, i) => {
      console.log(`     [${i + 1}] ${n.titulo}`);
      console.log(`          📍 ${n.cidade}`);
    });
  }

  await pausar();
}

// ─── Fluxo: Cadastrar Tag ─────────────────────────────────────────────────────

export async function fluxoCadastrarTag(): Promise<void> {
  cabecalho('Cadastrar Tag');
  const nome = await pedirTextoObrigatorio('Nome da tag (ex: política, esporte)');
  const resultado = criarTag(nome);
  if (!resultado) {
    console.log(`\n  ⚠️  A tag "#${nome}" já existe.`);
  } else {
    console.log(`\n  ✅ Tag "#${nome}" cadastrada com sucesso!`);
  }
  await pausar();
}

// ─── Fluxo: Vincular Tag ↔ Notícia ───────────────────────────────────────────

export async function fluxoGerenciarTagsDeNoticia(): Promise<void> {
  cabecalho('Gerenciar Tags de Notícia');

  const noticias = listarNoticias('DESC') as Noticia[];
  const noticia  = await selecionarDaLista(noticias, n => n.titulo, 'Notícias');
  if (!noticia) { await pausar(); return; }

  while (true) {
    const tagsAtuais = listarTagsDaNoticia(noticia.id);
    console.log(`\n  📰 "${noticia.titulo}"`);
    console.log(`  🏷️  Tags atuais: ${exibirTags(tagsAtuais)}`);
    sep('─', 40);
    console.log('  (v) Vincular tag      (d) Desvincular tag      (z) Voltar');

    const acao = await perguntar('\n  Opção: ');

    if (acao.toLowerCase() === 'z') break;

    if (acao.toLowerCase() === 'v') {
      await fluxoVincularTags(noticia.id, noticia.titulo);

    } else if (acao.toLowerCase() === 'd') {
      if (tagsAtuais.length === 0) {
        console.log('\n  ⚠️  Esta notícia não possui tags para remover.');
        continue;
      }
      const tag = await selecionarDaLista(tagsAtuais, t => t.nome, 'tags para remover');
      if (tag) {
        desvincularTagNoticia(noticia.id, tag.id);
        console.log(`\n  ✅ Tag "#${tag.nome}" removida da notícia.`);
      }
    } else {
      console.log('  ⚠️  Opção inválida.');
    }
  }
}

// ─── Fluxo: Notícias por Tag ──────────────────────────────────────────────────

export async function fluxoNoticiasPorTag(): Promise<void> {
  cabecalho('Notícias por Tag');

  const tags = listarTags();
  const tag  = await selecionarDaLista(tags, t => `#${t.nome}`, 'Tags');
  if (!tag) { await pausar(); return; }

  const noticias = listarNoticiasDaTag(tag.id);
  console.log(`\n  🏷️  Notícias com a tag "#${tag.nome}":`);

  if (noticias.length === 0) {
    console.log('  ⚠️  Nenhuma notícia encontrada para esta tag.');
  } else {
    noticias.forEach((n, i) => {
      console.log(`\n  [${i + 1}] ${n.titulo}`);
      console.log(`       📍 ${n.cidade}   🕐 ${n.data_criacao}`);
    });
  }

  await pausar();
}

// ─── Sub-fluxo: Vincular tags (usado no cadastro e no gerenciamento) ──────────

async function fluxoVincularTags(noticiaId: number, tituloNoticia: string): Promise<void> {
  const todasTags = listarTags();
  if (todasTags.length === 0) {
    console.log('\n  ⚠️  Nenhuma tag cadastrada. Cadastre tags no menu [8].');
    return;
  }

  while (true) {
    const tagsAtuais = listarTagsDaNoticia(noticiaId);
    const tagsDisponiveis = todasTags.filter(t => !tagsAtuais.some(ta => ta.id === t.id));

    console.log(`\n  📰 "${tituloNoticia}"`);
    console.log(`  🏷️  Tags já vinculadas: ${exibirTags(tagsAtuais)}`);

    if (tagsDisponiveis.length === 0) {
      console.log('\n  ✅ Todas as tags já foram vinculadas a esta notícia.');
      break;
    }

    const tag = await selecionarDaLista(tagsDisponiveis, t => `#${t.nome}`, 'tags disponíveis');
    if (!tag) break;

    vincularTagNoticia(noticiaId, tag.id);
    console.log(`\n  ✅ Tag "#${tag.nome}" vinculada!`);

    const continuar = await perguntar('  Adicionar outra tag? (s/n): ');
    if (continuar.toLowerCase() !== 's') break;
  }
}

// ─── Sub-fluxo: Detalhar Notícia ──────────────────────────────────────────────

async function fluxoDetalharNoticia(noticias: Noticia[]): Promise<void> {
  const escolhida = await selecionarDaLista(noticias, n => n.titulo, 'notícias para detalhar');
  if (!escolhida) return;

  const detalhe = buscarNoticiaPorId(escolhida.id);
  if (!detalhe) {
    console.log('  ⚠️  Não foi possível carregar o detalhe desta notícia.');
    return;
  }

  const tags = listarTagsDaNoticia(escolhida.id);

  sep('═');
  console.log(`\n  📰 ${detalhe.titulo}`);
  console.log(`  📍 ${detalhe.cidade}   🕐 ${detalhe.data_criacao}`);
  console.log(`  🏷️  ${exibirTags(tags)}`);
  sep('─', 50);
  console.log(
    '\n' +
    (detalhe.texto.match(/.{1,70}/g)?.map(l => `  ${l}`).join('\n') ?? `  ${detalhe.texto}`)
  );
  sep('═');
  await pausar();
}

// ─── Exibição de lista de notícias ────────────────────────────────────────────

function exibirListaNoticias(noticias: Noticia[]): void {
  noticias.forEach((n, i) => {
    const tags = listarTagsDaNoticia(n.id);
    console.log(`\n  [${i + 1}] ${n.titulo}`);
    console.log(`       📍 ${n.cidade}   🕐 ${n.data_criacao}`);
    console.log(`       🏷️  ${exibirTags(tags)}`);
  });
}

// ─── Menu Principal ───────────────────────────────────────────────────────────

export async function exibirMenu(): Promise<string> {
  sep('═');
  console.log('');
  console.log('   📰  SISTEMA DE NOTÍCIAS — CLI');
  console.log('');
  sep('─');
  console.log('   ── Notícias ──────────────────────────────');
  console.log('   [0]  Cadastrar notícia');
  console.log('   [1]  Listar notícias (recentes primeiro)');
  console.log('   [2]  Listar notícias (antigas primeiro)');
  console.log('   [3]  Notícias por estado');
  console.log('   [4]  Agrupadas por estado');
  console.log('   ── Tags ────────────────────────────────────');
  console.log('   [8]  Cadastrar tag');
  console.log('   [9]  Notícias por tag');
  console.log('   [t]  Gerenciar tags de uma notícia');
  console.log('   ── Cadastros ───────────────────────────────');
  console.log('   [5]  Cadastrar UF');
  console.log('   [6]  Cadastrar cidade');
  console.log('   ────────────────────────────────────────────');
  console.log('   [7]  Sair');
  console.log('');
  sep('═');
  return perguntar('  Escolha uma opção: ');
}
