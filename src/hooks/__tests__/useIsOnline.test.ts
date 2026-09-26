import { renderHook, act } from '@testing-library/react-native';
import { onlineManager } from '@tanstack/react-query';
import { useIsOnline } from '@hooks/useIsOnline';

// O hook lê o mesmo onlineManager que pausa as queries; aqui controlamos ele
// direto em vez de simular o NetInfo, que é só a fonte que o alimenta.
afterEach(() => onlineManager.setOnline(true));

describe('useIsOnline', () => {
  it('reflete o estado atual do onlineManager na primeira renderização', async () => {
    onlineManager.setOnline(false);
    const { result } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
  });

  it('re-renderiza quando a conectividade muda nos dois sentidos', async () => {
    const { result } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(true);

    await act(async () => {
      onlineManager.setOnline(false);
    });
    expect(result.current).toBe(false);

    await act(async () => {
      onlineManager.setOnline(true);
    });
    expect(result.current).toBe(true);
  });
});
