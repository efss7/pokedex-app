# ✅ 1. ROADMAP COMPLETO DO PROJETO (Pacote B Profissional)

## 🟦 Fase 1 --- Setup Inicial

-   Criar projeto (Expo ou React Native CLI)
-   Estruturar pastas do projeto
-   Instalar libs:
    -   React Navigation
    -   Zustand
    -   TanStack Query
    -   Axios
    -   Reanimated
    -   MMKV
    -   Firebase/Supabase
    -   Victory Native ou Recharts para gráficos
    -   React Native SVG
-   Configurar Absolute Imports
-   Configurar tema light/dark básico

------------------------------------------------------------------------

## 🟩 Fase 2 --- Base da Pokédex

-   Criar serviço da PokeAPI com Axios
-   Tipar DTOs principais
-   Criar hook `usePokemonList` com TanStack Query
-   Página da lista com pagination e skeletons
-   Card animado do Pokémon
-   Busca com debounce
-   Filtro por tipo

------------------------------------------------------------------------

## 🟧 Fase 3 --- Tela de Detalhes

-   Buscar detalhes, stats, habilidades
-   Criar gráfico de stats
-   Exibir evoluções
-   Criar fundo temático baseado no tipo
-   Animação com shared elements
-   Botão favorito integrado ao Zustand

------------------------------------------------------------------------

## 🟪 Fase 4 --- Sistema de Usuário (Google + Apple)

-   Implementar Login com Google
-   Implementar Login com Apple (somente iOS)
-   Criar serviço de usuário
-   Sincronizar favoritos na nuvem
-   Persistir sessão com MMKV

------------------------------------------------------------------------

## 🟥 Fase 5 --- Funcionalidades Avançadas

-   Deep linking (`mydex://pokemon/25`)
-   Tela de ranking
-   Ranking dos favoritos
-   Filtro avançado por status e habilidades
-   Comparação de Pokémons
-   Notificação "Pokémon da semana"
-   Modo offline-first + cache persistente

------------------------------------------------------------------------

## 🟫 Fase 6 --- Qualidade e Testes

-   Testes unitários (Jest)
-   Testes de hooks
-   Testes de renderização
-   Teste E2E (Detox)
-   Lint + Husky

------------------------------------------------------------------------

## 🟨 Fase 7 --- Deploy Profissional

-   Configurar EAS build
-   Gerar build Android
-   Gerar build iOS
-   TestFlight + Google Internal
-   Criar página do app
-   Preparar versão 1.0
