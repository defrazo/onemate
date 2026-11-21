import type { UserStore } from '@/entities/user';
import { BaseRouting } from '@/shared/lib/repository';

import type { ITranslatorProvider, TranslatorAvailability, TranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';
import { TranslatorProviderDemo } from './translator.provider.demo';
import { TranslatorProviderApi } from './translator.provider.real';

export class TranslatorProviderRouting extends BaseRouting implements TranslatorProvider {
	private readonly realProvider = new TranslatorProviderApi();
	private readonly demoProvider: ITranslatorProvider = new TranslatorProviderDemo();

	constructor(userStore: UserStore) {
		super(userStore);
	}

	private getTargetProvider(): ITranslatorProvider {
		return this.role === 'demo' ? this.demoProvider : this.realProvider;
	}

	async translate(request: TranslateRequest): Promise<string> {
		this.checkPermission('translator', 'use');
		return this.getTargetProvider().translate(request);
	}

	async availability(source: string, target: string): Promise<TranslatorAvailability> {
		this.checkPermission('translator', 'use');
		return this.realProvider.availability(source, target);
	}

	async prepare(
		source: string,
		target: string,
		signal: AbortSignal,
		onProgress: (progress: number) => void
	): Promise<void> {
		this.checkPermission('translator', 'use');
		return this.realProvider.prepare(source, target, signal, onProgress);
	}
}
