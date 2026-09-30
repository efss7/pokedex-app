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

  it('percorre todos os ramos em evoluções ramificadas, marcando o estágio de cada uma', () => {
    // Eevee tem 3 evoluções paralelas (simplificado aqui); todas devem
    // aparecer no resultado, no mesmo estágio 1.
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

    expect(result.map((e) => e.name)).toEqual(['eevee', 'vaporeon', 'jolteon', 'flareon']);
    expect(result.map((e) => e.stage)).toEqual([0, 1, 1, 1]);
  });

  it('marca o estágio corretamente em cadeias lineares de 3 elos', () => {
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

    expect(result.map((e) => e.stage)).toEqual([0, 1, 2]);
  });

  it('marca o estágio corretamente em ramificações com mais de um nível (ex.: Wurmple)', () => {
    // Wurmple evolui para Silcoon ou Cascoon (estágio 1), cada um evoluindo
    // para um único pokémon final (estágio 2) — a árvore ramifica antes do
    // último elo, então o stage precisa ser calculado por caminho, não por
    // profundidade fixa.
    const chain = {
      chain: {
        species: species('wurmple', 265),
        evolution_details: [],
        evolves_to: [
          {
            species: species('silcoon', 266),
            evolution_details: levelUp(7),
            evolves_to: [
              {
                species: species('beautifly', 267),
                evolution_details: levelUp(10),
                evolves_to: [],
              },
            ],
          },
          {
            species: species('cascoon', 268),
            evolution_details: levelUp(7),
            evolves_to: [
              {
                species: species('dustox', 269),
                evolution_details: levelUp(10),
                evolves_to: [],
              },
            ],
          },
        ],
      },
    };

    const result = parseEvolutionChain(chain as never);

    expect(result.map((e) => e.name)).toEqual([
      'wurmple',
      'silcoon',
      'beautifly',
      'cascoon',
      'dustox',
    ]);
    expect(result.map((e) => e.stage)).toEqual([0, 1, 2, 1, 2]);
  });
});
