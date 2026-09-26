# Fase 7 — Deploy

Branch: `feature/fase-7-deploy` (saiu da `develop` já com as Fases 1–6).

## Escopo redefinido: custo zero

O roadmap original previa TestFlight e Google Play Internal. Ambos exigem conta
paga — **$99/ano** na Apple e **$25** de taxa única no Google. Como o objetivo é
**portfólio**, o que importa é alguém conseguir abrir e usar o app, e para isso
a loja não agrega nada. O escopo virou:

1. **Web no GitHub Pages** — link clicável, roda no navegador, sem instalar nada.
   É a vitrine principal.
2. **APK Android via EAS free tier** — anexado numa GitHub Release, sem precisar
   da conta do Google Play.
3. **iOS fica de fora.** Distribuir para iPhone exige os $99/ano da Apple, sem
   contorno. Build de simulador é gratuita, mas só serve para quem tem Mac com
   Xcode — inútil como vitrine.

## ✅ Pronto (neste commit)

- **`eas.json`** com perfis `development`, `development-device`, `preview`
  (Android como APK) e `production`.
- **Identificadores**: `com.anonymous.pokedexapp` (placeholder do Expo) virou
  `com.efss7.pokedexapp`, e o iOS ganhou o `bundleIdentifier` que faltava.
- **`expo-dev-client`** instalado — é o que destrava o E2E pendente da Fase 6.
- **Suporte a web**: `react-dom`, `react-native-web` e `@expo/metro-runtime`
  instalados; `experiments.baseUrl` apontando para `/pokedex-app`, que é o
  subcaminho onde o GitHub Pages serve um repositório de projeto.
- **Guardas de plataforma**: notificação local agendada não existe no browser, e
  `notificationService` é importado no boot. Sem guarda, a versão web quebraria
  na abertura. Agora `isSuportado` (`Platform.OS !== 'web'`) faz as funções
  virarem no-op, o toggle some da tela de Conta e o `linking` não consulta o
  módulo nativo.
- **`.github/workflows/deploy-web.yml`**: na push para a `main`, roda typecheck,
  lint e testes, exporta o web e publica no Pages.

## ⚠️ Mudança no dia a dia: Expo Go agora precisa de `--go`

Com o `expo-dev-client` no projeto, `npx expo start` passa a mirar a dev build.
Para seguir testando no Expo Go:

```
npm run start:go
```

O `npm start` puro só funciona depois que houver uma dev build no aparelho.

## 🔑 O que depende de você

### 1. Ligar o GitHub Pages (uma vez)
Settings → Pages → **Source: GitHub Actions**. Sem isso o workflow roda e falha
no passo de deploy.

### 2. Secrets do Supabase (uma vez)
Settings → Secrets and variables → Actions → New repository secret:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Sem eles o site publica com **login desativado** (`isSupabaseConfigured` vira
`false`), sem erro visível — só um `console.warn`. O resto do app funciona.

**Sobre expor a chave:** o prefixo `EXPO_PUBLIC_` significa que a chave vai para
o bundle do cliente de qualquer forma — quem abrir o DevTools vai vê-la. Isso é
esperado para a *anon key* do Supabase, que é pública por design; quem protege
os dados é o RLS, e o deste projeto está correto (`supabase/favorites.sql`:
políticas de select, insert e delete, todas por `auth.uid()`). O que **não** pode
vazar é a `service_role key`, que o projeto não usa em lugar nenhum.

### 3. Publicar
Merge `develop` → `main` (o marco v1.0, com tag). O push na `main` dispara o
workflow e o site sai em `https://efss7.github.io/pokedex-app/`.

### 4. APK Android (opcional, gratuito)
```
npx eas-cli login
npx eas-cli init
npx eas-cli build --profile preview --platform android
```
O `init` grava `extra.eas.projectId` no `app.json`. O build sai como APK, para
baixar do painel do EAS e anexar numa GitHub Release. Confira o limite mensal de
builds do plano gratuito no painel da Expo antes de rodar em série.

Lembre de registrar as chaves também no EAS, pelo mesmo motivo do `.env`
gitignored:
```
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "<url>"
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<chave>"
```

## 📋 Pendente

1. ✅ **Web verificada no navegador** (26/09/2026). A Pokédex roda inteira:
   lista, busca, filtros, detalhes, comparação, ranking, favoritos e login.
   A validação achou três bugs que o export compilando não revelava — roteamento
   no subcaminho, layout de desktop e um flash de erro no carregamento —, todos
   corrigidos. Também destravou os cenários que estavam pendentes desde a Fase 5
   (offline, persistência, favoritos entre contas): ver FASE5_PENDENCIAS.md.
   Para reproduzir o ambiente local, com o mesmo fallback de SPA do Pages:
   ```
   npx expo export --platform web
   mkdir -p /tmp/site/pokedex-app && cp -R dist/* /tmp/site/pokedex-app/
   cp dist/index.html /tmp/site/pokedex-app/404.html
   cd /tmp/site && npx serve -l 4173
   ```
   e abrir `http://localhost:4173/pokedex-app/` — o subcaminho importa, porque é
   ele que o `baseUrl` espera.

   ⚠️ Um `python3 -m http.server` **não serve** para testar recarga em rota
   profunda: ele devolve o próprio 404 e ignora o `404.html`, enquanto o GitHub
   Pages serve esse arquivo. Testar com ele dá falso negativo.
2. **E2E** — último item da Fase 6, destravado pela dev build. O roadmap diz
   Detox; vale reavaliar **Maestro**, bem mais simples em projeto Expo.
3. **README com print ou GIF** — para portfólio, rende mais que qualquer outra
   coisa desta lista, e é o que aparece primeiro na `main`.
4. **Cenários de validação manual** acumulados desde a Fase 5, em
   `FASE5_PENDENCIAS.md` — offline com e sem cache, persistência entre
   reinícios, favoritos entre contas.
5. **Splash screen** — a migração para o plugin `expo-splash-screen` mudou um
   padrão de runtime (sem `imageWidth`, a imagem vai para um quadrado de ~100dp).
   Só dá para comparar numa build de verdade.
