import type { ITranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';
import { fetchTranslate } from '../fetchTranslate';
import { type TranslatorAvailability, TranslatorProviderBrowser } from './translator.provider.browser';

export class TranslatorProviderApi implements ITranslatorProvider {
	private readonly browser = new TranslatorProviderBrowser();

	availability(source: string, target: string): Promise<TranslatorAvailability> {
		return this.browser.availability(source, target);
	}

	prepare(
		source: string,
		target: string,
		signal: AbortSignal,
		onProgress: (progress: number) => void
	): Promise<void> {
		return this.browser.prepare(source, target, signal, onProgress);
	}

	async translate(request: TranslateRequest): Promise<string> {
		let availability: TranslatorAvailability = 'unavailable';

		try {
			availability = await this.browser.availability(request.source, request.target);
		} catch (error) {
			if (request.signal?.aborted) throw error;
		}

		if (request.signal?.aborted) throw new DOMException('Операция отменена', 'AbortError');

		if (availability === 'available') return this.browser.translate(request);

		const result = await fetchTranslate(request);
		if (result === null) throw new Error('Не удалось перевести текст');

		return result;
	}
}
