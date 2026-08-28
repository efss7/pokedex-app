# Fase 5 — Status e Pendências

Branch: `feature/fase-5-avancado` (criada a partir da `develop`, que já tem a Fase 4).
Este documento existe para não perder o contexto (ex.: após formatar a máquina).

## ✅ Feito (Parte 1 — este commit)
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

## ❌ Pendente (Parte 2 — fazer depois)
1. **Notificação "Pokémon da semana"** — única feature que falta.
   É uma notificação **local semanal** → roda no Expo Go (sem push/dev build).
   Usar `expo-notifications` (agendar notificação semanal com um pokémon aleatório).
2. **Remover o log de debug** `[persist]` no `App.tsx` (callback `onSuccess` do
   `PersistQueryClientProvider`) depois de validar a persistência.
3. **Commitar a Parte 2** e abrir o PR `feature/fase-5-avancado` → `develop`.

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

## Como validar a persistência (offline-first) após reinstalar o ambiente
1. Rode o app e navegue (lista, alguns detalhes, uma busca) para popular o cache.
2. No terminal do Metro, aperte `r` (reload) — isso zera a memória e re-monta.
3. Veja no log: `[persist] cache restaurado do disco: N queries`.
   Se `N > 0`, a persistência está funcionando (os dados vieram do disco).

## Git / fluxo combinado
- Cada `feature/fase-X` sai da `develop` **atualizada** → PR de volta para `develop`.
- `develop → main` só em marcos (com tag).
