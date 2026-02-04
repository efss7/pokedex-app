import { useEffect, useState } from 'react';

/**
 * Hook para aplicar debounce em valores
 * 
 * Debounce = atrasa a atualização de um valor até que o usuário
 * pare de digitar por X milissegundos
 * 
 * @param value - Valor a ser "debounced"
 * @param delay - Tempo de espera em ms (padrão: 500ms)
 * @returns Valor atrasado
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * // debouncedSearch só atualiza 500ms após usuário parar de digitar
 * useEffect(() => {
 *   fetchPokemon(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 * 
 * Por que usar?
 * - Evita fazer requisições a cada tecla digitada
 * - Melhora performance
 * - Reduz carga no servidor
 * 
 * Como funciona?
 * 1. Usuário digita "pikachu"
 * 2. A cada letra, reseta o timer
 * 3. Só quando passar 500ms SEM digitar, atualiza o valor
 * 4. Resultado: 1 requisição em vez de 7
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria timer que vai atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancela o timer anterior se value mudar
    // Isso garante que só o último timer vai executar
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-executa quando value ou delay mudar

  return debouncedValue;
}
