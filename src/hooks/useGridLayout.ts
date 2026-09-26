import { useWindowDimensions } from 'react-native';

/** Espaçamento entre cards e nas bordas da lista. */
const GUTTER = 16;
/** Largura confortável de um card; abaixo disso a arte fica pequena demais. */
const LARGURA_ALVO = 200;

/**
 * Colunas e largura de card a partir da largura da janela.
 *
 * Existe porque a lista (`numColumns`) e o card (largura) precisam concordar —
 * e porque `Dimensions.get('window')` no escopo do módulo congelava a largura
 * na avaliação do bundle: no navegador a janela é redimensionável, e num
 * monitor largo duas colunas davam cards de ~700px.
 *
 * Em telas de celular o resultado é idêntico ao cálculo anterior
 * (`(width - 48) / 2`), então não há mudança visual no app nativo.
 */
export const useGridLayout = () => {
  const { width } = useWindowDimensions();

  const columns = Math.max(2, Math.floor(width / (LARGURA_ALVO + GUTTER)));
  const cardWidth = (width - GUTTER * (columns + 1)) / columns;

  return { columns, cardWidth };
};
