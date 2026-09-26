import { parseEvolutionChain } from '@utils/evolutionHelper';

const species = (name: string, id: number) => ({
  name,
  url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
});

const levelUp = (minLevel: number) => [
  { trigger: { name: 'level-up' }, min_level: minLevel },
];

describe('parseEvolutionChain', () => {
  it('achata a cadeia em ordem, extraindo o id da URL da espécie', () => {
    const chain = {
      chain: {
        species: species('charmander', 4),
        evolution_details: [],
        evolves_to: [
          {
            species: species('charmeleon', 5),
            evolution_details: levelUp(16),
            evolves_to: [
              {
                species: species('charizard', 6),
                evolution_details: levelUp(36),
                evolves_to: [],
              },
            ],
          },
        ],
      },
    };

    const result = parseEvolutionChain(chain as never);

    expect(result.map((e) => e.name)).toEqual(['charmander', 'charmeleon', 'charizard']);
    expect(result.map((e) => e.id)).toEqual([4, 5, 6]);
  });

  it('deixa o primeiro da cadeia sem trigger e preenche os seguintes', () => {
    const chain = {
      chain: {
        species: species('bulbasaur', 1),
        evolution_details: [],
        evolves_to: [
          {
            species: species('ivysaur', 2),
            evolution_details: levelUp(16),
            evolves_to: [],
          },
        ],
      },
    };

    const [primeiro, segundo] = parseEvolutionChain(chain as never);

    expect(primeiro.trigger).toBeUndefined();
    expect(primeiro.minLevel).toBeUndefined();
    expect(segundo.trigger).toBe('level-up');
    expect(segundo.minLevel).toBe(16);
  });

  it('retorna só a espécie quando não há evolução', () => {
    const chain = {
      chain: {
        species: species('tauros', 128),
        evolution_details: [],
        evolves_to: [],
      },
    };

    expect(parseEvolutionChain(chain as never)).toHaveLength(1);
  });

  it('segue apenas o primeiro caminho em evoluções ramificadas (limitação conhecida)', () => {
    // Eevee tem 8 evoluções paralelas; o helper documenta que só segue a
    // primeira. Este teste trava esse comportamento — se um dia a tela passar
    // a mostrar todos os caminhos, ele falha e lembra de revisitar a decisão.
    const chain = {
      chain: {
        species: species('eevee', 133),
        evolution_details: [],
        evolves_to: [
          { species: species('vaporeon', 134), evolution_details: [], evolves_to: [] },
          { species: species('jolteon', 135), evolution_details: [], evolves_to: [] },
          { species: species('flareon', 136), evolution_details: [], evolves_to: [] },
        ],
      },
    };

    const result = parseEvolutionChain(chain as never);

    expect(result.map((e) => e.name)).toEqual(['eevee', 'vaporeon']);
  });
});
