# Testes E2E (Maestro)

Fluxos de ponta a ponta, escritos em YAML. Rodam contra o app **instalado** —
por isso dependem de uma build de desenvolvimento, não do Expo Go.

## Por que Maestro e não Detox

O roadmap original dizia Detox. Maestro foi escolhido por exigir bem menos
configuração em projeto Expo: fluxos declarativos, sem código de build nem
setup nativo. É desvio consciente do roadmap.

## Pré-requisitos

1. Maestro instalado: `curl -fsSL https://get.maestro.mobile.dev | bash`
2. Uma build de desenvolvimento instalada no simulador ou aparelho:
   ```
   npx eas-cli build --profile development --platform ios
   ```
   O perfil `development` mira o **simulador iOS**, que não exige conta Apple
   paga. Para Android, use `--profile preview --platform android` (APK).

## Rodando

```
npm run test:e2e           # todos os fluxos
maestro test .maestro/03-evolucoes-ramificadas.yaml   # um só
```

## O que cada fluxo cobre

| Fluxo | Cobertura |
|---|---|
| `01-busca` | Busca com debounce e limpeza do campo |
| `02-detalhes-e-favorito` | Favoritar no detalhe e o favorito aparecendo na lista — persistência local |
| `03-evolucoes-ramificadas` | Regressão: o Eevee mostrava só 1 das 8 evoluções |
| `04-comparacao` | Entrada na comparação pelo header do detalhe |

## Sobre os seletores

Os fluxos miram `accessibilityLabel` em vez de texto visível. É mais estável
(texto de UI muda com frequência) e tem efeito colateral bom: se um seletor
quebra, normalmente é porque a acessibilidade regrediu junto.

**Os fluxos nunca foram executados** — foram escritos com os seletores
conferidos contra o código, mas sem build disponível no momento. Espere ajustes
de espera/timing na primeira execução real.
