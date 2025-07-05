import { API_URLS, TRANSLATOR_API_KEY } from '@/shared/config/apiConfig';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import type { TranslateOptions } from '../model';

// Запрос перевода текста
export const fetchTranslate = async ({ text, source, target, signal }: TranslateOptions): Promise<string | null> => {
	const encodedText = encodeURIComponent(text.trim());
	const langPair = `${source}|${target}`;

	try {
		const url = `${API_URLS.myMemory}${encodedText}&langpair=${langPair}&key=${TRANSLATOR_API_KEY}`;
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
