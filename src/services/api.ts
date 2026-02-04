import axios from 'axios';
import { API_BASE_URL } from '@constants/index';

if (!API_BASE_URL) {
	throw new Error('API_BASE_URL is not defined in environment');
}

export const pokemonApi = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
});

