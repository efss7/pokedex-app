# Fase 7 — Deploy

Branch: `feature/fase-7-deploy` (saiu da `develop` já com as Fases 1–6).

Este documento separa **o que já está pronto no repositório** do **que depende
de contas e login seus** — nenhuma dessas últimas etapas dá para automatizar
daqui, porque exigem autenticação interativa.

## ✅ Pronto (neste commit)

- **`eas.json`** com quatro perfis:
  - `development` — dev build com `expo-dev-client`, iOS mirando o **simulador**
  - `development-device` — mesma coisa, mas para iPhone físico
  - `preview` — distribuição interna; Android sai como **APK** (instalável direto,
    sem passar pela loja)
  - `production` — com `autoIncrement` para o número de build
- **Identificadores de app** no `app.json`. O `com.anonymous.pokedexapp` era
  placeholder do Expo; virou `com.efss7.pokedexapp` nas duas plataformas.
  **Troque agora se quiser outro** — depois de publicar, o identificador é
  permanente e mudá-lo cria um app novo na loja.
- **`expo-dev-client`** instalado, que é o que destrava o E2E pendente da Fase 6.

## ⚠️ Mudança no dia a dia: Expo Go agora precisa de `--go`

Com o `expo-dev-client` no projeto, `npx expo start` passa a mirar a dev build.
Para continuar testando no Expo Go como antes:

```
npm run start:go
```

O script existe para isso. O `npm start` puro só vai funcionar depois que houver
uma dev build instalada no aparelho.

## 🔑 Depende de você (login interativo)

### 1. Conta Expo e vínculo do projeto
```
npx eas-cli login
npx eas-cli init
```
O `init` grava `extra.eas.projectId` no `app.json` — sem isso nenhum build roda.

### 2. Variáveis de ambiente do Supabase — **atenção, isto quebra silenciosamente**
O `.env` está no `.gitignore` (correto), e o EAS Build respeita o `.gitignore`.
Resultado: o build **não recebe** `EXPO_PUBLIC_SUPABASE_URL` nem
`EXPO_PUBLIC_SUPABASE_ANON_KEY`, o `isSupabaseConfigured` vira `false` e o app
sobe com **login desativado** — sem erro visível, só um `console.warn`.

Antes do primeiro build, registre as duas no servidor do EAS:
```
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "<url>"
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<chave>"
```
Não colocamos os valores no `eas.json` de propósito: ele é versionado, e o
projeto vem mantendo as chaves fora do git desde a Fase 4.

### 3. Builds
```
npx eas-cli build --profile development --platform ios      # simulador
npx eas-cli build --profile development-device --platform ios
npx eas-cli build --profile preview --platform android      # APK
```
O build Android roda sem conta paga. O iOS **em aparelho** exige conta Apple
Developer ($99/ano) — a mesma barreira que derrubou o login com Apple na Fase 4.
O perfil `development` mirando simulador não exige conta paga.

### 4. Lojas (cada uma com seu custo)
- **Google Play** — taxa única de $25. `npx eas-cli submit --platform android`
- **TestFlight / App Store** — Apple Developer, $99/ano. `npx eas-cli submit --platform ios`

## 📋 Pendente depois que houver build

1. **E2E** — último item da Fase 6, que ficou bloqueado por falta de build nativa.
   O roadmap diz Detox; vale reavaliar **Maestro**, bem mais simples de configurar
   em projeto Expo (YAML, sem código de build). A decisão importa se o trabalho
   for avaliado pelo roadmap à risca.
2. **Os cenários de validação manual** acumulados desde a Fase 5 — estão listados
   em `FASE5_PENDENCIAS.md`, seção "Validar depois da publicação". São justamente
   os que o Expo Go não permite testar: persistência de cache entre reinícios,
   offline com e sem cache, e favoritos não vazando entre contas.
3. **Splash screen** — a migração do `splash` legado para o plugin
   `expo-splash-screen` (Fase 5) mudou um padrão de runtime: sem `imageWidth`
   explícito, o plugin desenha a imagem num quadrado de ~100dp. Só dá para
   comparar com o build antigo olhando uma build de verdade.
