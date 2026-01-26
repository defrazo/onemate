import type { ITranslatorProvider, TranslateRequest } from '../../model';

export class TranslatorProviderDemo implements ITranslatorProvider {
	async translate(_: TranslateRequest): Promise<string> {
		throw new Error('Перевод недоступен в демо-режиме');
	}
}
