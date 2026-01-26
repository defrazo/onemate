import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { ITranslatorProvider, TranslateRequest } from '../../model';
import { TranslatorProviderApi, TranslatorProviderDemo } from '.';

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
		this.checkPermission('translator', 'use', 'Перевод недоступен в демо-режиме');
		return this.getTargetProvider().translate(request);
	}
}
