import { fecharInterface } from './cli/prompts';
import {
  exibirMenu,
  fluxoCadastrarNoticia,
  fluxoListarNoticias,
  fluxoNoticiasPorEstado,
  fluxoAgrupadasPorEstado,
  fluxoCadastrarUF,
  fluxoCadastrarCidade,
  fluxoCadastrarTag,
  fluxoNoticiasPorTag,
  fluxoGerenciarTagsDeNoticia,
} from './cli/menu';

async function main(): Promise<void> {
  console.clear();
  console.log('\n  Bem-vindo ao Sistema de Notícias! 🗞️');

  let rodando = true;

  while (rodando) {
    const opcao = await exibirMenu();
    console.clear();

    switch (opcao.trim()) {
      case '0': await fluxoCadastrarNoticia();          break;
      case '1': await fluxoListarNoticias('DESC');      break;
      case '2': await fluxoListarNoticias('ASC');       break;
      case '3': await fluxoNoticiasPorEstado();         break;
      case '4': await fluxoAgrupadasPorEstado();        break;
      case '5': await fluxoCadastrarUF();               break;
      case '6': await fluxoCadastrarCidade();           break;
      case '7':
        console.log('\n  👋 Até logo!\n');
        rodando = false;
        break;
      case '8': await fluxoCadastrarTag();              break;
      case '9': await fluxoNoticiasPorTag();            break;
      case 't':
      case 'T': await fluxoGerenciarTagsDeNoticia();   break;
      default:
        console.log('\n  ⚠️  Opção inválida.\n');
        break;
    }

    if (rodando) console.clear();
  }

  fecharInterface();
}

main().catch((err) => {
  console.error('\n  ❌ Erro inesperado:', err);
  fecharInterface();
  process.exit(1);
});
