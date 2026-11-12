import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { ITranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';
import { TranslatorProviderDemo } from './translator.provider.demo';
import { TranslatorProviderApi } from './translator.provider.real';

export class TranslatorProviderRouting extends BaseRouting implements ITranslatorProvider {
	private readonly realProvider: ITranslatorProvider;
	private readonly demoProvider: ITranslatorProvider;

	constructor(userStore: UserStore) {
		super(userStore);
		this.realProvider = new TranslatorProviderApi();
		this.demoProvider = new TranslatorProviderDemo();
	}

	private getTargetProvider(): ITranslatorProvider {
		return this.role === 'demo' ? this.demoProvider : this.realProvider;
	}

	async translate(request: TranslateRequest): Promise<string> {
		this.checkPermission('translator', 'use');
		return this.getTargetProvider().translate(request);
	}
}
