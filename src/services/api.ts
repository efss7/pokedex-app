// Import nomeado: `axios.create` via default dispara import/no-named-as-default-member,
// porque `create` também é exportado como named.
import { create } from 'axios';
import { API_BASE_URL } from '@constants/index';

if (!API_BASE_URL) {
	throw new Error('API_BASE_URL is not defined in environment');
}

export const pokemonApi = create({
	baseURL: API_BASE_URL,
	timeout: 15000,
});

