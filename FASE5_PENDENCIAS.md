# Fase 5 — Status e Pendências

Branch: `feature/fase-5-avancado` (criada a partir da `develop`, que já tem a Fase 4).
Este documento existe para não perder o contexto (ex.: após formatar a máquina).

## ✅ Feito (Parte 1 — commit `a5901aa`)
- **Deep linking**: `mydex://pokemon/25`, `/compare`, `/ranking`, `/favorites`, `/account`
  — `src/navigation/linking.ts`
- **Comparação de Pokémons** — `src/screens/ComparisonScreen.tsx`
  (entrada: botão ⇄ no header da tela de detalhes)
- **Filtro avançado**: Geração (faixa de ID) + Habilidade (endpoint `/ability`)
  — `src/components/pokemon/AdvancedFilters.tsx`, `src/hooks/useFilterData.ts`,
  `src/hooks/usePokemonListState.ts` (reescrito com o "caminho índice")
- **Ranking dos favoritos** — `src/screens/RankingScreen.tsx`
  (entrada: botão de pódio no header da tela de Favoritos)
- **Offline-first / cache persistente** — `PersistQueryClientProvider` + AsyncStorage
  (`App.tsx`, `src/services/queryClient.ts`)

## ✅ Feito (upgrade de ambiente + correções — commits `b585db5` e `afbb908`)
- **Expo SDK 54 → 57** (`b585db5`): o Expo Go da App Store se atualizou sozinho
  e parou de abrir o projeto. RN 0.86, React 19.2, TS 6. Exigiu: `ignoreDeprecations`
  no tsconfig, `StyleSheet.absoluteFillObject` → `absoluteFill`, remoção de
  `newArchEnabled`/`edgeToEdgeEnabled` do `app.json` e migração do `splash`
  para o plugin `expo-splash-screen`.
- **Bug: favoritos vazavam entre contas** (`afbb908`): o `signOut` não limpava a
  lista local, então ao logar outra conta no mesmo aparelho o `syncWithCloud`
  enviava os favoritos do usuário anterior para a conta nova. Agora a subscription
  em `App.tsx` limpa o local no logout.
- **Bug: offline-first estava pela metade** (`afbb908`): no RN o TanStack Query
  não detecta conectividade sozinho e se considerava sempre online. `onlineManager`
  ligado ao NetInfo; novo hook `src/hooks/useIsOnline.ts` e tela de "Você está
  offline" na lista (sem isso, offline e sem cache a lista ficava em branco e muda).
- **Log de debug `[persist]` removido** do `App.tsx`.

## ✅ Feito (Parte 2 — notificação "Pokémon da semana")
Fecha a Fase 5. Notificação **local** (sem push, sem dev build).
- `src/services/notificationService.ts` — permissão, agendamento e cancelamento
- `src/store/weeklyPokemonStore.ts` — preferência (on/off) persistida
- `src/components/common/WeeklyPokemonToggle.tsx` — toggle, nas duas branches
  da tela de Conta (logado e deslogado)
- `src/navigation/linking.ts` — tocar na notificação abre o pokémon dela,
  reaproveitando o deep linking da Parte 1

**Por que 8 notificações avulsas e não uma repetindo:** um trigger `WEEKLY`
repete o *mesmo* conteúdo, ou seja, o mesmo pokémon para sempre. Então agendamos
8 ocorrências com trigger `DATE` (segundas, 9h), cada uma com o seu sorteio, e
a fila é recomposta no boot quando sobram menos de 2 (`refreshWeeklyPokemon`).

**Detalhe do Expo Go:** a URL da notificação é gerada com `Linking.createURL`,
não com `mydex://` cravado — no Expo Go o scheme do app não está registrado e
quem vale é o `exp://`. Assim o toque funciona nos dois ambientes.

## ❌ Pendente (Parte 2 — fazer depois)
1. **Commitar a Parte 2** e abrir o PR `feature/fase-5-avancado` → `develop`.

## 🧪 Validar depois da publicação (Fase 7)
Decisão consciente: seguir sem testar agora. As correções passaram por typecheck
e build, mas **não foram exercitadas rodando**. Os cenários estão escritos na
seção "Como validar" no fim deste arquivo — rodar todos quando houver build
publicada (dev build ou TestFlight), onde não existem as limitações do Expo Go.
- Persistência do cache entre reinícios
- Offline com cache (dados continuam aparecendo)
- Offline sem cache (tela "Você está offline")
- Favoritos não vazam entre contas no logout
- Notificação "Pokémon da semana" dispara e abre o pokémon certo

## ⛔ Fora de escopo (limitação da PokeAPI — problema N+1)
- **Filtro por STATS** na dex inteira: exigiria os stats de ~1025 pokémons
  (1000+ requisições; não há endpoint em massa). Entregue: geração + habilidade.
- **Ranking GERAL** da dex: mesma limitação. Entregue: ranking dos favoritos.

## 🧹 Dívida técnica (anotada — refatorar depois)
- **Design system não adotado**: os tokens em `src/theme/spacing.ts`
  (spacing / borderRadius / fontSize / fontWeight) existem mas quase nada usa —
  as StyleSheets cravam números crus, com valores fora da escala, e primitivos
  (Chip / Button / Badge / Card) estão duplicados por tela. Plano: criar
  primitivos compartilhados usando os tokens e adotá-los nas telas.

## Como validar

### Persistência do cache (app reiniciado, com rede)
1. Rode o app e navegue (lista, alguns detalhes, uma busca) para popular o cache.
2. No terminal do Metro, aperte `r` (reload) — zera a memória e re-monta.
3. A lista deve aparecer **preenchida de imediato**, sem passar pelos skeletons.
   Se aparecer skeleton, o cache não veio do disco.

### Offline COM cache (Expo Go, iPhone)
1. Abra o app e navegue para popular o cache.
2. Ative o **modo avião**.
3. Navegue pela lista e abra detalhes já visitados — os dados devem continuar
   aparecendo, vindos do cache, sem erro e sem spinner infinito.
4. Desative o modo avião: as queries devem refazer sozinhas (é o `onlineManager`
   reagindo à reconexão).

⚠️ No Expo Go o bundle JS vem do Metro pela wi-fi. Com o modo avião o app que já
está carregado continua rodando (o JS está em memória), mas **não dá para recarregar**
— o `r` do Metro não chega. Por isso o cenário abaixo não é testável no aparelho.

### Offline SEM cache (a tela "Você está offline") — usar o simulador iOS
No simulador o Metro é servido por `localhost`, então dá para desligar a internet
do Mac sem perder o bundle — é o único jeito de reproduzir "abrir o app offline".
1. `npx expo start` e aperte `i` para abrir no simulador.
2. Em `App.tsx`, troque o `buster: 'v1'` para `'v2'` — isso descarta o cache
   persistido no próximo boot, simulando instalação nova. (Reverta depois.)
3. Desligue a **wi-fi do Mac** e recarregue o app no simulador.
4. Esperado: a tela **"Você está offline"**, e não uma lista vazia e muda
   nem "Erro ao carregar pokémons".

⚠️ O NetInfo no simulador iOS nem sempre reflete o estado real do Mac. Se a tela
de offline não aparecer, teste antes se o problema é o simulador (o cenário "offline
com cache" acima, no aparelho, já exercita o mesmo `onlineManager`).

### Bug dos favoritos entre contas
Sem precisar de duas contas: logue, favorite alguns pokémons, e **saia**.
A lista de favoritos deve ficar **vazia** após o logout (antes, continuava com
os favoritos da conta que saiu — e eles iam parar na próxima conta que logasse).
Com duas contas: logue em A, favorite, saia, logue em B — B não pode ver nada de A.

### Log de debug
Após um reload, o terminal do Metro **não** deve mais imprimir `[persist] ...`.

## Git / fluxo combinado
- Cada `feature/fase-X` sai da `develop` **atualizada** → PR de volta para `develop`.
- `develop → main` só em marcos (com tag).
