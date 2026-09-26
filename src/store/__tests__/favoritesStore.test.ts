import { useFavoritesStore } from '@store/favoritesStore';
import { useAuthStore } from '@store/authStore';
import {
  getRemoteFavoriteIds,
  addRemoteFavorites,
  addRemoteFavorite,
  removeRemoteFavorite,
} from '@services/favoritesService';

jest.mock('@services/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { signOut: jest.fn() } },
}));

jest.mock('@services/favoritesService', () => ({
  getRemoteFavoriteIds: jest.fn(),
  addRemoteFavorites: jest.fn(),
  addRemoteFavorite: jest.fn(),
  removeRemoteFavorite: jest.fn(),
}));

const USER_A = { id: 'user-a' };
const USER_B = { id: 'user-b' };

const login = (user: { id: string }) =>
  useAuthStore.setState({ status: 'authenticated', user: user as never, session: {} as never });

const logout = () =>
  useAuthStore.setState({ status: 'unauthenticated', user: null, session: null });

/** Promise que só resolve quando o teste mandar — para segurar o sync no ar. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

beforeEach(() => {
  jest.clearAllMocks();
  useFavoritesStore.setState({ favorites: [], hydrated: true, syncing: false });
  logout();
  (addRemoteFavorites as jest.Mock).mockResolvedValue(undefined);
  (addRemoteFavorite as jest.Mock).mockResolvedValue(undefined);
  (removeRemoteFavorite as jest.Mock).mockResolvedValue(undefined);
});

describe('favoritos locais', () => {
  it('adiciona, não duplica e remove', () => {
    const { addFavorite, removeFavorite } = useFavoritesStore.getState();

    addFavorite(25);
    addFavorite(25);
    expect(useFavoritesStore.getState().favorites).toEqual([25]);

    removeFavorite(25);
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('toggle alterna nos dois sentidos', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    toggleFavorite(6);
    expect(useFavoritesStore.getState().isFavorite(6)).toBe(true);

    toggleFavorite(6);
    expect(useFavoritesStore.getState().isFavorite(6)).toBe(false);
  });

  it('não espelha na nuvem enquanto deslogado', () => {
    useFavoritesStore.getState().addFavorite(1);
    expect(addRemoteFavorite).not.toHaveBeenCalled();
  });

  it('espelha na nuvem quando logado', () => {
    login(USER_A);
    useFavoritesStore.getState().addFavorite(1);
    expect(addRemoteFavorite).toHaveBeenCalledWith('user-a', 1);
  });
});

describe('syncWithCloud', () => {
  it('faz a união de local e nuvem, subindo só o que faltava', async () => {
    login(USER_A);
    useFavoritesStore.setState({ favorites: [1, 2] });
    (getRemoteFavoriteIds as jest.Mock).mockResolvedValue([2, 3]);

    await useFavoritesStore.getState().syncWithCloud();

    expect(useFavoritesStore.getState().favorites).toEqual([1, 2, 3]);
    expect(addRemoteFavorites).toHaveBeenCalledWith('user-a', [1]);
  });

  // Regressão: o merge é calculado antes dos awaits de rede e gravado depois.
  // Sem a checagem de usuário, o sync em voo sobrescrevia o clearFavorites() do
  // logout e devolvia os favoritos da conta anterior ao aparelho — que então
  // iam parar na próxima conta a logar.
  it('não regrava o merge se o usuário saiu durante o sync', async () => {
    login(USER_A);
    useFavoritesStore.setState({ favorites: [1, 2] });

    const remote = deferred<number[]>();
    (getRemoteFavoriteIds as jest.Mock).mockReturnValue(remote.promise);

    const syncing = useFavoritesStore.getState().syncWithCloud();

    // O usuário sai enquanto a rede ainda não respondeu.
    logout();
    useFavoritesStore.getState().clearFavorites();

    remote.resolve([10, 20]);
    await syncing;

    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('não regrava o merge se outra conta logou durante o sync', async () => {
    login(USER_A);
    useFavoritesStore.setState({ favorites: [1] });

    const remote = deferred<number[]>();
    (getRemoteFavoriteIds as jest.Mock).mockReturnValue(remote.promise);

    const syncing = useFavoritesStore.getState().syncWithCloud();

    logout();
    useFavoritesStore.getState().clearFavorites();
    login(USER_B);

    remote.resolve([99]);
    await syncing;

    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('não deixa a flag syncing presa quando a nuvem falha', async () => {
    login(USER_A);
    (getRemoteFavoriteIds as jest.Mock).mockRejectedValue(new Error('offline'));

    await useFavoritesStore.getState().syncWithCloud();

    expect(useFavoritesStore.getState().syncing).toBe(false);
  });
});
