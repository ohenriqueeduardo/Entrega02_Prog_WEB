import { perguntar, pedirTextoObrigatorio, selecionarDaLista } from './prompts';
import { criarUF, listarUFs } from '../services/ufService';
import { criarCidade, listarCidades } from '../services/cidadeService';
import {
  criarNoticia,
  listarNoticias,
  listarPorEstado,
  listarAgrupado,
} from '../services/noticiaService';

// ─── Tipos auxiliares ────────────────────────────────────────────────────────

interface UF {
  id: number;
  nome: string;
  sigla: string;
}

interface Cidade {
  id: number;
  nome: string;
  sigla: string;
}

interface Noticia {
  id: number;
  titulo: string;
  data_criacao: string;
  cidade: string;
}

interface NoticiaAgrupada {
  sigla: string;
  titulo: string;
  cidade: string;
}

interface NoticiaDetalhe {
  titulo: string;
  texto: string;
  data_criacao: string;
  cidade: string;
}

// ─── Utilitários de exibição ─────────────────────────────────────────────────

function separador(char = '─', tamanho = 50): void {
  console.log('\n' + char.repeat(tamanho));
}

function titulo(texto: string): void {
  separador();
  console.log(`  📌 ${texto}`);
  separador();
}

function pausar(): Promise<void> {
  return perguntar('\n  Pressione ENTER para continuar...').then(() => {});
}

// ─── Fluxo: Cadastrar UF ─────────────────────────────────────────────────────

export async function fluxoCadastrarUF(): Promise<void> {
  titulo('Cadastrar UF');

  const nome = await pedirTextoObrigatorio('Nome do estado (ex: São Paulo)');
  const sigla = await pedirTextoObrigatorio('Sigla (ex: SP)');

  criarUF(nome, sigla.toUpperCase());

  console.log(`\n  ✅ UF "${sigla.toUpperCase()} - ${nome}" cadastrada com sucesso!`);
  await pausar();
}

// ─── Fluxo: Cadastrar Cidade ──────────────────────────────────────────────────

export async function fluxoCadastrarCidade(): Promise<void> {
  titulo('Cadastrar Cidade');

  const nome = await pedirTextoObrigatorio('Nome da cidade');

  const ufs = listarUFs() as UF[];
  const ufSelecionada = await selecionarDaLista(ufs, (uf) => `${uf.sigla} - ${uf.nome}`, 'UFs');

  if (!ufSelecionada) {
    console.log('\n  ❌ Cadastre pelo menos uma UF antes de cadastrar uma cidade.');
    await pausar();
    return;
  }

  criarCidade(nome, ufSelecionada.id);

  console.log(`\n  ✅ Cidade "${nome}" cadastrada em "${ufSelecionada.sigla}" com sucesso!`);
  await pausar();
}

// ─── Fluxo: Cadastrar Notícia ─────────────────────────────────────────────────

export async function fluxoCadastrarNoticia(): Promise<void> {
  titulo('Cadastrar Notícia');

  const tituloNoticia = await pedirTextoObrigatorio('Título da notícia');
  const texto = await pedirTextoObrigatorio('Texto da notícia');

  const cidades = listarCidades() as Cidade[];
  const cidadeSelecionada = await selecionarDaLista(
    cidades,
    (c) => `${c.nome} (${c.sigla})`,
    'Cidades'
  );

  if (!cidadeSelecionada) {
    console.log('\n  ❌ Cadastre pelo menos uma cidade antes de cadastrar uma notícia.');
    await pausar();
    return;
  }

  criarNoticia(tituloNoticia, texto, cidadeSelecionada.id);

  console.log(`\n  ✅ Notícia "${tituloNoticia}" cadastrada em "${cidadeSelecionada.nome}" com sucesso!`);
  await pausar();
}

// ─── Fluxo: Listar Notícias (recentes ou antigas) ────────────────────────────

export async function fluxoListarNoticias(ordem: 'ASC' | 'DESC'): Promise<void> {
  const label = ordem === 'DESC' ? 'Notícias Recentes' : 'Notícias Antigas';
  titulo(label);

  const noticias = listarNoticias(ordem) as Noticia[];

  if (noticias.length === 0) {
    console.log('  ⚠️  Nenhuma notícia cadastrada ainda.');
    await pausar();
    return;
  }

  exibirListaNoticias(noticias);

  // Ação pós-lista
  while (true) {
    const acao = await perguntar('\n  (d) Detalhar notícia   (z) Voltar: ');

    if (acao.toLowerCase() === 'z') break;

    if (acao.toLowerCase() === 'd') {
      await fluxoDetalharNoticia(noticias);
    } else {
      console.log('  ⚠️  Opção inválida. Use (d) para detalhar ou (z) para voltar.');
    }
  }
}

// ─── Fluxo: Notícias por Estado ───────────────────────────────────────────────

export async function fluxoNoticiasPorEstado(): Promise<void> {
  titulo('Notícias por Estado');

  const ufs = listarUFs() as UF[];
  const ufSelecionada = await selecionarDaLista(ufs, (uf) => `${uf.sigla} - ${uf.nome}`, 'UFs');

  if (!ufSelecionada) {
    await pausar();
    return;
  }

  const noticias = listarPorEstado(ufSelecionada.id) as Array<{ titulo: string; cidade: string }>;

  console.log(`\n  📰 Notícias em "${ufSelecionada.sigla} - ${ufSelecionada.nome}":`);

  if (noticias.length === 0) {
    console.log('  ⚠️  Nenhuma notícia encontrada para este estado.');
  } else {
    noticias.forEach((n, i) => {
      console.log(`\n  [${i + 1}] ${n.titulo}`);
      console.log(`       📍 ${n.cidade}`);
    });
  }

  await pausar();
}

// ─── Fluxo: Agrupadas por Estado ──────────────────────────────────────────────

export async function fluxoAgrupadasPorEstado(): Promise<void> {
  titulo('Notícias Agrupadas por Estado');

  const dados = listarAgrupado() as NoticiaAgrupada[];

  if (dados.length === 0) {
    console.log('  ⚠️  Nenhuma notícia cadastrada ainda.');
    await pausar();
    return;
  }

  // Agrupa localmente por sigla
  const grupos: Record<string, NoticiaAgrupada[]> = {};
  for (const item of dados) {
    if (!grupos[item.sigla]) grupos[item.sigla] = [];
    grupos[item.sigla].push(item);
  }

  for (const sigla in grupos) {
    console.log(`\n  🗺️  ${sigla}`);
    separador('·', 40);
    grupos[sigla].forEach((n, i) => {
      console.log(`     [${i + 1}] ${n.titulo}`);
      console.log(`          📍 ${n.cidade}`);
    });
  }

  await pausar();
}

// ─── Sub-fluxo: Detalhar Notícia ──────────────────────────────────────────────

async function fluxoDetalharNoticia(noticias: Noticia[]): Promise<void> {
  const escolhida = await selecionarDaLista(
    noticias,
    (n) => n.titulo,
    'notícias para detalhar'
  );

  if (!escolhida) return;

  // Busca o texto completo via rawDb
  const { rawDb } = await import('../db');
  const detalhe = rawDb
    .prepare(
      `SELECT titulo, texto, data_criacao, cidade.nome as cidade
       FROM noticia
       JOIN cidade ON noticia.cidade_id = cidade.id
       WHERE noticia.id = ?`
    )
    .get(escolhida.id) as NoticiaDetalhe | undefined;

  if (!detalhe) {
    console.log('  ⚠️  Não foi possível carregar o detalhe desta notícia.');
    return;
  }

  separador('═');
  console.log(`\n  📰 ${detalhe.titulo}`);
  console.log(`  📍 ${detalhe.cidade}   🕐 ${detalhe.data_criacao}`);
  separador('─', 50);
  console.log(`\n${detalhe.texto
    .match(/.{1,70}/g)
    ?.map((l) => `  ${l}`)
    .join('\n') ?? `  ${detalhe.texto}`}`);
  separador('═');
}

// ─── Exibição de lista de notícias ────────────────────────────────────────────

function exibirListaNoticias(noticias: Noticia[]): void {
  noticias.forEach((n, i) => {
    console.log(`\n  [${i + 1}] ${n.titulo}`);
    console.log(`       📍 ${n.cidade}   🕐 ${n.data_criacao}`);
  });
}

// ─── Menu Principal ───────────────────────────────────────────────────────────

export async function exibirMenu(): Promise<string> {
  separador('═');
  console.log('');
  console.log('   📰  SISTEMA DE NOTÍCIAS — CLI');
  console.log('');
  separador('─');
  console.log('   [0]  Cadastrar notícia');
  console.log('   [1]  Listar notícias (recentes primeiro)');
  console.log('   [2]  Listar notícias (antigas primeiro)');
  console.log('   [3]  Notícias por estado');
  console.log('   [4]  Agrupadas por estado');
  console.log('   [5]  Cadastrar UF');
  console.log('   [6]  Cadastrar cidade');
  console.log('   [7]  Sair');
  console.log('');
  separador('═');

  return perguntar('  Escolha uma opção: ');
}
