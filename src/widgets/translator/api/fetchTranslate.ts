import { API_URLS, env } from '@/shared/lib/constants';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import type { TranslateRequest } from '../model';

// Запрос перевода текста
export const fetchTranslate = async ({ text, source, target, signal }: TranslateRequest): Promise<string | null> => {
	const encodedText = encodeURIComponent(text.trim());
	const langPair = `${source}|${target}`;

	try {
		const url = `${API_URLS.MYMEMORY}${encodedText}&langpair=${langPair}&key=${env.MYMEMORY_API_KEY}`;
		const response = await fetch(url, { signal });

		if (!response.ok) throw new ApiError();

		const data = await response.json();
		const translated = data?.responseData?.translatedText?.trim();

		if (translated) return translated;
		throw new EmptyResultError('Произошла ошибка во время перевода');
	} catch (error) {
		handleError(error);
		return null;
	}
};
