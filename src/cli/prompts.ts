import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/** Faz uma pergunta e retorna a resposta como string */
export function perguntar(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta.trim());
    });
  });
}

/** Fecha a interface de leitura (chamar ao sair) */
export function fecharInterface(): void {
  rl.close();
}

/** Pede um texto obrigatório — repete até o usuário digitar algo */
export async function pedirTextoObrigatorio(label: string): Promise<string> {
  let valor = '';
  while (!valor) {
    valor = await perguntar(`  ${label}: `);
    if (!valor) console.log('  ⚠️  Campo obrigatório. Tente novamente.');
  }
  return valor;
}

/** Exibe uma lista numerada e pede que o usuário escolha um item pelo número */
export async function selecionarDaLista<T>(
  itens: T[],
  getLabel: (item: T) => string,
  titulo: string
): Promise<T | null> {
  if (itens.length === 0) {
    console.log(`  ⚠️  Nenhum(a) ${titulo} cadastrado(a) ainda.`);
    return null;
  }

  console.log(`\n  📋 ${titulo} disponíveis:`);
  itens.forEach((item, i) => {
    console.log(`     [${i + 1}] ${getLabel(item)}`);
  });

  let escolha = -1;
  while (escolha < 1 || escolha > itens.length) {
    const entrada = await perguntar(`  Escolha [1-${itens.length}]: `);
    escolha = parseInt(entrada);
    if (isNaN(escolha) || escolha < 1 || escolha > itens.length) {
      console.log(`  ⚠️  Opção inválida. Digite um número entre 1 e ${itens.length}.`);
    }
  }

  return itens[escolha - 1];
}
