import type { TranslateRequest } from './types';

export interface ITranslatorProvider {
	translate(request: TranslateRequest): Promise<string>;
}
