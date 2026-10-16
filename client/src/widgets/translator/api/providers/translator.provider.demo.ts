import { RestrictedAccess } from '@/shared/lib/errors';

import type { ITranslatorProvider, TranslateRequest } from '../../model';

export class TranslatorProviderDemo implements ITranslatorProvider {
	async translate(_: TranslateRequest): Promise<string> {
		throw new RestrictedAccess();
	}
}
