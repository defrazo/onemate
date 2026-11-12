import { RestrictedAccess } from '@/shared/lib/errors';

import type { ITranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';

export class TranslatorProviderDemo implements ITranslatorProvider {
	async translate(_: TranslateRequest): Promise<string> {
		throw new RestrictedAccess();
	}
}
