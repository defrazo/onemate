import { MYMEMORY_API_KEY, MYMEMORY_API_URL } from '@/shared/lib/constants';
import { ApiError, EmptyResultError, handleError } from '@/shared/lib/errors';

import type { TranslateOptions } from '../model';

// Запрос перевода текста
export const fetchTranslate = async ({ text, source, target, signal }: TranslateOptions): Promise<string | null> => {
	const encodedText = encodeURIComponent(text.trim());
	const langPair = `${source}|${target}`;

	try {
		const url = `${MYMEMORY_API_URL}${encodedText}&langpair=${langPair}&key=${MYMEMORY_API_KEY}`;
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
