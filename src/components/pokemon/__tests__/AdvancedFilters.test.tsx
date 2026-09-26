import React from 'react';
import { renderComProviders, screen, userEvent } from '@test/test-utils';
import { AdvancedFilters } from '@components/pokemon/AdvancedFilters';
import { useAbilityNames } from '@hooks/useFilterData';

jest.mock('@hooks/useFilterData', () => ({
  useAbilityNames: jest.fn(),
}));

const HABILIDADES = ['flash-fire', 'solar-power', 'blaze', 'thick-fat'];

const props = {
  visible: true,
  onClose: jest.fn(),
  selectedGeneration: null,
  onSelectGeneration: jest.fn(),
  selectedAbility: null,
  onSelectAbility: jest.fn(),
  onClear: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useAbilityNames as jest.Mock).mockReturnValue({ data: HABILIDADES, isLoading: false });
});

describe('AdvancedFilters', () => {
  it('lista as habilidades com o nome legível, sem hífen', async () => {
    await renderComProviders(<AdvancedFilters {...props} />);

    expect(screen.getByText('flash fire')).toBeOnTheScreen();
    expect(screen.getByText('thick fat')).toBeOnTheScreen();
  });

  // O mock de useFilterData apaga a ligação com os dados, então o argumento
  // `enabled` é a única parte dessa ligação que ainda dá para verificar aqui:
  // passar `false` deixaria a lista permanentemente vazia no app.
  it('habilita a busca de habilidades quando o modal está visível', async () => {
    await renderComProviders(<AdvancedFilters {...props} />);
    expect(useAbilityNames).toHaveBeenCalledWith(true);
  });

  it('não busca habilidades com o modal fechado', async () => {
    await renderComProviders(<AdvancedFilters {...props} visible={false} />);
    expect(useAbilityNames).toHaveBeenCalledWith(false);
  });

  // Regressão: a busca comparava com o slug ("flash-fire") enquanto a lista
  // exibia o nome com espaço ("flash fire"), então digitar o que estava escrito
  // na tela não achava nada — e a maioria das habilidades é composta.
  it('acha a habilidade digitando o nome como aparece na tela', async () => {
    const user = userEvent.setup();
    await renderComProviders(<AdvancedFilters {...props} />);

    await user.type(screen.getByPlaceholderText('Buscar habilidade...'), 'flash fire');

    expect(screen.getByText('flash fire')).toBeOnTheScreen();
    expect(screen.queryByText('blaze')).not.toBeOnTheScreen();
  });

  it('acha também pelo slug, com hífen', async () => {
    const user = userEvent.setup();
    await renderComProviders(<AdvancedFilters {...props} />);

    await user.type(screen.getByPlaceholderText('Buscar habilidade...'), 'solar-power');

    expect(screen.getByText('solar power')).toBeOnTheScreen();
    expect(screen.queryByText('blaze')).not.toBeOnTheScreen();
  });

  it('seleciona a habilidade tocada', async () => {
    const user = userEvent.setup();
    await renderComProviders(<AdvancedFilters {...props} />);

    await user.press(screen.getByText('blaze'));

    expect(props.onSelectAbility).toHaveBeenCalledWith('blaze');
  });
});
