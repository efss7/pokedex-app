# Pokédex

Uma Pokédex completa em React Native — busca, filtros combináveis, comparação
entre pokémons, favoritos sincronizados na nuvem e modo offline. Projeto de
estudo construído com escopo de aplicação real: a mesma base de código roda no
celular e no navegador.

**[▶️ Abrir o app](https://efss7.github.io/pokedex-app/)** — roda no navegador,
sem instalar nada.

[![CI](https://github.com/efss7/pokedex-app/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/efss7/pokedex-app/actions/workflows/deploy-web.yml)

<!-- TODO: substituir por um GIF da aplicação.
     Sugestão: 10-15s percorrendo lista → busca → detalhes → comparação.
     É o que mais prende quem abre o repositório, e só dá para gravar
     com o app rodando. -->

## O que tem dentro

| | |
|---|---|
| **Pokédex** | Scroll infinito, busca com debounce e filtros combináveis por tipo, geração e habilidade |
| **Detalhes** | Stats em gráfico, cadeia evolutiva, efetividade contra tipos, alternância entre arte normal e shiny, fundo temático pela cor do tipo |
| **Comparação** | Dois pokémons lado a lado, barras divergentes por atributo e destaque do vencedor |
| **Favoritos** | Funcionam offline e sem conta; com login, sincronizam na nuvem |
| **Ranking** | Ordena os favoritos por qualquer atributo |
| **Conta** | Login opcional por e-mail e senha. O app funciona inteiro sem cadastro |
| **Offline** | Cache persistido em disco: o que já foi visitado continua acessível sem rede |
| **Notificação** | Um pokémon sorteado por semana, com deep link para os detalhes (só no app nativo) |

## Stack

| Camada | Escolha |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Linguagem | TypeScript, em modo estrito |
| Estado de servidor | TanStack Query v5, com cache persistido |
| Estado de cliente | Zustand |
| Navegação | React Navigation 7 (native stack) com deep linking |
| Backend | Supabase — autenticação e Postgres com Row Level Security |
| Animações | Reanimated |
| Testes | Jest e React Native Testing Library |

## Como está organizado

```
src/
├── components/     ui reutilizável — common/ (genéricos) e pokemon/ (domínio)
├── screens/        uma por rota da navegação
├── navigation/     stack, tipagem das rotas e deep linking
├── hooks/          queries, filtros e estado derivado
├── constants/      cores por tipo, gerações e configuração da API
├── services/       PokeAPI, Supabase, notificações e o queryClient
├── store/          Zustand: favoritos, sessão, tema e preferências
├── theme/          tokens e provider light/dark
├── types/          contratos da API
└── utils/          funções puras
```

A separação que sustenta o resto: **estado de servidor e estado de cliente são
coisas diferentes.** Tudo que vem da PokeAPI vive no TanStack Query, que cuida
de cache, revalidação e persistência. O que é do usuário — favoritos, sessão,
tema — vive no Zustand. Nenhum dado de API é copiado para dentro de um store,
o que elimina a classe inteira de bugs de sincronização entre os dois.

## Decisões técnicas

As partes do projeto onde a solução óbvia não funcionava.

### Filtros resolvidos em memória, não por requisição

A PokeAPI não tem endpoint de busca com múltiplos critérios. Filtrar por
geração e habilidade pelo caminho direto exigiria uma requisição por pokémon —
a dex inteira, a cada mudança de filtro.

A saída foi baixar **uma vez** um índice leve (id e nome de todos), mantê-lo em
cache e resolver os filtros por interseção de conjuntos em memória. Geração sai
de graça, porque é uma faixa de id; habilidade e tipo vêm de endpoints que já
devolvem a lista de quem pertence a cada um.

Filtro por stats ficou de fora pela mesma limitação: não existe endpoint que
devolva os stats em massa, e buscar um por um não é uma opção defensável.

### Notificação semanal como ocorrências individuais

O caminho natural seria um trigger semanal recorrente. Só que um trigger que
repete carrega **conteúdo fixo** — anunciaria o mesmo pokémon para sempre.

Então são agendadas várias ocorrências individuais, uma por semana, cada uma
com seu sorteio. A fila é finita por natureza, e é recomposta quando começa a
secar. O agendamento também busca os dados **antes** de cancelar a fila
anterior: na ordem inversa, uma falha de rede deixaria o usuário sem
notificação nenhuma e com a configuração ainda marcada como ativa.

### Favoritos: merge no login, descarte no logout

Ao entrar na conta, favoritos locais e da nuvem são **unidos**, nunca
sobrescritos — quem usou o app offline antes de se cadastrar não perde nada.

No logout a lista local é descartada. Sem isso, os favoritos de uma conta
vazariam para a próxima que logasse no mesmo aparelho. A sincronização também
confere se ainda é o mesmo usuário antes de gravar: entre o início e o fim das
chamadas de rede, o usuário pode ter saído.

### Detecção de rede explícita

No React Native o TanStack Query não sabe se há conexão. Ele depende de eventos
que só existem no navegador e, na ausência deles, assume que está sempre
online. O efeito é silencioso e ruim: offline as requisições disparam, gastam
as tentativas e falham, em vez de pausar e servir o cache imediatamente.

A conectividade é ligada explicitamente ao gerenciador do TanStack Query. Isso
também expôs um estado que não existia antes — uma query *pausada* não é
carregamento nem erro —, tratado nas telas para não render tela vazia e muda.

### Uma base, duas plataformas

A versão web sai do mesmo código via `react-native-web`. O que não existe no
navegador, como notificação local agendada, é isolado por checagem de
plataforma em vez de duplicar arquivos.

O roteamento precisou de tradução: o GitHub Pages serve o app em um subcaminho,
mas o React Navigation lê o endereço cru do navegador e não conhece esse
prefixo. Sem a ponte entre os dois, recarregar a página ou compartilhar um link
levava para fora do site.

## Qualidade

Os testes cobrem a lógica de maior risco — sincronização de favoritos,
agendamento de notificações, normalização de busca e os hooks de cache — em vez
de se espalharem para inflar cobertura.

Cada teste de regressão foi validado **reintroduzindo o bug** e confirmando que
ele falha. Um teste que passa com o defeito presente não protege nada, e essa
checagem é a única forma de saber a diferença.

Um hook de pre-commit roda lint, verificação de tipos e a suíte inteira contra
o conteúdo que está sendo commitado — e não contra a árvore de trabalho, que é
a pegadinha comum e deixa passar código quebrado. O mesmo conjunto roda no CI a
cada pull request, e o deploy só acontece se tudo passar.

```bash
npm test          # suíte completa
npm run typecheck # verificação de tipos
npm run lint      # sem tolerar warnings
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as chaves do Supabase
npm run start:go       # abre no Expo Go
```

O login é opcional: sem as chaves do Supabase o app roda normalmente, apenas
sem sincronização na nuvem. Para criar a tabela de favoritos, rode
`supabase/favorites.sql` no SQL Editor do seu projeto Supabase — o script já
inclui as políticas de Row Level Security.

Para a versão web: `npm run web`.

> O projeto usa `expo-dev-client`, então `npm start` mira uma build de
> desenvolvimento. Para o Expo Go, use `npm run start:go`.

## Deploy

A versão web é publicada no GitHub Pages a cada push na `main`, pelo workflow
em `.github/workflows/deploy-web.yml`. As chaves do Supabase vêm dos secrets do
repositório: o `.env` fica fora do controle de versão e não chega ao build.

Distribuição em loja ficou de fora por decisão de custo — a App Store exige
conta paga de desenvolvedor, sem alternativa gratuita.

Para gerar um APK Android, o `eas.json` já está configurado e o plano gratuito
do EAS dá conta, sem precisar da conta do Google Play:

```bash
npx eas-cli login
npx eas-cli init     # vincula o projeto e grava o id no app.json
npx eas-cli build --profile preview --platform android
```

> **Antes do primeiro build**, registre as chaves no EAS. O `.env` é ignorado
> pelo git e o EAS Build respeita o `.gitignore` — pelo mesmo motivo que o
> workflow web usa secrets. Sem isso o APK sai com o login desativado, sem erro
> visível:
>
> ```bash
> npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "<url>"
> npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<chave>"
> ```

## Limitações conhecidas

- **Evoluções ramificadas** (Eevee, por exemplo) mostram apenas o primeiro
  caminho da cadeia.
- **Filtro por stats** e **ranking geral da dex** não existem, pela limitação
  da API descrita acima.
- **Notificação semanal** é exclusiva do app nativo; no navegador o recurso
  não aparece.
- **Design system** tem tokens definidos que ainda não foram adotados em todas
  as telas — dívida técnica mapeada, não descuido.

## Licença

Projeto de estudo, sem fins comerciais. Dados e imagens vêm da PokeAPI.
Pokémon é marca registrada da Nintendo, Game Freak e The Pokémon Company.
