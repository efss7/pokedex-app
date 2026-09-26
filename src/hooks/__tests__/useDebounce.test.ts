import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@hooks/useDebounce';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useDebounce', () => {
  it('devolve o valor inicial na hora, sem esperar', async () => {
    const { result } = await renderHook(() => useDebounce('pikachu', 500));
    expect(result.current).toBe('pikachu');
  });

  it('só atualiza depois do delay', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'ab' });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  // É o ponto do debounce: digitar rápido não pode emitir valores intermediários.
  it('descarta os valores intermediários enquanto o usuário digita', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebounce(value, 400), {
      initialProps: { value: '' },
    });

    for (const value of ['p', 'pi', 'pik', 'pika']) {
      await rerender({ value });
      await act(async () => {
        jest.advanceTimersByTime(100); // sempre menos que o delay
      });
    }

    expect(result.current).toBe('');

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('pika');
  });
});
