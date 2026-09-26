# Pokédex

Aplicativo de Pokédex em React Native, consumindo a [PokeAPI](https://pokeapi.co/).
Construído como projeto de estudo, com o escopo de um app real: cache offline,
autenticação, sincronização na nuvem, testes automatizados e deploy contínuo.

**▶️ [Acesse o app](https://efss7.github.io/pokedex-app/)** — roda no navegador,
sem instalar nada.

<!-- TODO: substituir pelo GIF/print da aplicação.
     Sugestão: um GIF curto (10-15s) percorrendo lista → busca → detalhes →
     comparação. É o que mais prende quem abre o repositório. -->

## Funcionalidades

**Pokédex** — lista paginada com scroll infinito, busca com debounce e filtros
combináveis por tipo, geração e habilidade.

**Detalhes** — stats em gráfico, cadeia evolutiva, efetividade contra tipos,
alternância entre arte normal e shiny, e fundo temático pela cor do tipo.

**Comparação** — dois pokémons lado a lado, com barras divergentes por atributo
e destaque do vencedor.

**Favoritos** — funcionam offline e sem conta. Com login, sincronizam na nuvem
e seguem entre dispositivos.

**Ranking** — ordena os favoritos por qualquer atributo.

**Conta** — login opcional com e-mail e senha via Supabase. O app funciona
inteiro sem cadastro; a conta só habilita a sincronização.

**Offline-first** — o cache é persistido em disco, então o que já foi visitado
continua disponível sem rede.

**Notificação semanal** — um pokémon sorteado por semana, com deep link direto
para os detalhes (apenas no app nativo).

## Stack

| Camada | Escolha |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Linguagem | TypeScript 6 (strict) |
| Dados | TanStack Query v5 com cache persistido |
| Estado | Zustand |
| Navegação | React Navigation 7 (native stack) com deep linking |
| Backend | Supabase (auth + Postgres com RLS) |
| Animações | Reanimated 4 |
| Testes | Jest + React Native Testing Library |

## Decisões técnicas

**Filtros por índice, não por requisição.** A PokeAPI não tem endpoint de busca
com múltiplos critérios. Filtrar por geração e habilidade exigiria uma
requisição por pokémon (~1025). A solução foi baixar uma vez o índice completo
(id + nome), manter em cache e resolver os filtros por interseção de conjuntos
em memória. Filtro por stats ficou de fora pelo mesmo motivo: exigiria os stats
de todos os pokémons, sem endpoint em massa que permita isso.

**Notificação semanal com ocorrências avulsas.** Um trigger `WEEKLY` do
`expo-notifications` repete o mesmo conteúdo indefinidamente — ou seja,
anunciaria o mesmo pokémon para sempre. São agendadas 8 ocorrências
individuais, cada uma com seu sorteio, e a fila é recomposta quando vai secando.

**Merge de favoritos sem perda.** Ao logar, favoritos locais e da nuvem são
unidos, não sobrescritos — quem usou o app offline antes de criar a conta não
perde nada. No logout a lista local é descartada, para os favoritos de uma
conta não vazarem para a próxima que logar no mesmo aparelho.

**Detecção de rede explícita.** No React Native o TanStack Query não detecta
conectividade sozinho: ele depende de eventos do navegador que não existem ali,
e por isso se considera sempre online. Sem ligar o `onlineManager` ao NetInfo,
as requisições disparam offline, gastam os retries e falham, em vez de pausar e
servir o cache imediatamente.

**Uma base de código, duas plataformas.** A versão web sai do mesmo código via
`react-native-web`. O que não existe no navegador (notificação local agendada)
é isolado por checagem de plataforma, e o roteamento traduz entre o subcaminho
do GitHub Pages e as rotas internas.

## Qualidade

37 testes automatizados, concentrados na lógica de maior risco em vez de
espalhados para inflar cobertura: sincronização de favoritos, agendamento de
notificações, normalização de busca e hooks de cache.

Os testes de regressão foram validados reintroduzindo cada bug e confirmando
que falham — um teste que passa com o bug presente não protege nada.

Um hook de pre-commit roda lint, typecheck e a suíte inteira contra o conteúdo
que está sendo commitado (e não contra a árvore de trabalho, que é a pegadinha
comum). O mesmo conjunto roda no CI a cada pull request, e o deploy só acontece
se tudo passar.

```bash
npm test          # suíte completa
npm run typecheck # tsc --noEmit
npm run lint      # eslint, sem tolerar warnings
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as chaves do Supabase
npm run start:go       # abre no Expo Go
```

O login é opcional: sem as chaves do Supabase o app roda normalmente, apenas
sem sincronização na nuvem. Para criar a tabela de favoritos, rode
`supabase/favorites.sql` no SQL Editor do seu projeto Supabase.

Para a versão web: `npm run web`.

> Este projeto usa `expo-dev-client`, então `npm start` mira uma build de
> desenvolvimento. Para o Expo Go, use `npm run start:go`.

## Deploy

A versão web é publicada automaticamente no GitHub Pages a cada push na `main`,
pelo workflow em `.github/workflows/deploy-web.yml`. As chaves do Supabase vêm
dos secrets do repositório — o build não lê o `.env`, que é versionado apenas
como exemplo.

Distribuição em loja ficou de fora por decisão de custo: a App Store exige
conta paga de desenvolvedor, sem alternativa gratuita. A configuração de build
nativa (`eas.json`) está no repositório e gera APK Android pelo plano gratuito
do EAS.

## Limitações conhecidas

- **Evoluções ramificadas** (Eevee, por exemplo) mostram apenas o primeiro
  caminho da cadeia.
- **Filtro por stats e ranking geral da dex** não existem, pela limitação da
  API descrita acima.
- **Notificação semanal** é exclusiva do app nativo; no navegador o recurso não
  aparece.
- **Design system** tem tokens definidos que ainda não foram adotados em todas
  as telas — é dívida técnica mapeada, não descuido.

## Licença

Projeto de estudo, sem fins comerciais. Os dados e as imagens vêm da PokeAPI;
Pokémon é marca registrada da Nintendo, Game Freak e The Pokémon Company.
