import type { ITranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';
import { fetchTranslate } from '../fetchTranslate';

export class TranslatorProviderApi implements ITranslatorProvider {
	async translate({ text, source, target, signal }: TranslateRequest): Promise<string> {
		const result = await fetchTranslate({ text, source, target, signal });
		if (result === null) throw new Error('Не удалось перевести текст');
		return result;
	}
}
