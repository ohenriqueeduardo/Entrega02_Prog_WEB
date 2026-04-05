import { criarUF, listarUFs } from './services/ufService';
import { criarCidade, listarCidades } from './services/cidadeService';
import { criarNoticia, listarNoticias } from './services/noticiaService';

// Inserindo dados
criarUF('Distrito Federal', 'DF');

const ufs = listarUFs();
const ufId = (ufs[0] as { id: number }).id;

criarCidade('Brasília', ufId);

const cidades = listarCidades();
const cidadeId = (cidades[0] as { id: number }).id;

criarNoticia('Título teste', 'Texto da notícia', cidadeId);

// Listagens
console.log("📍 UFs:");
console.log(listarUFs());

console.log("\n🏙️ Cidades:");
console.log(listarCidades());

console.log("\n📰 Notícias:");
console.log(listarNoticias('DESC'));