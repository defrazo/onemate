import type { TranslateRequest } from '.';

export interface ITranslatorProvider {
	translate(request: TranslateRequest): Promise<string>;
}
