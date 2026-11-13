import type { ITranslatorProvider } from '../../model/ports';
import type { TranslateRequest } from '../../model/types';

export type TranslatorAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

type BrowserTranslator = {
	translate(text: string, options?: { signal?: AbortSignal }): Promise<string>;
	destroy(): void;
};

type BrowserTranslatorFactory = {
	availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorAvailability>;
	create(options: {
		sourceLanguage: string;
		targetLanguage: string;
		signal?: AbortSignal;
		monitor?: (monitor: EventTarget) => void;
	}): Promise<BrowserTranslator>;
};

export class TranslatorProviderBrowser implements ITranslatorProvider {
	private get factory(): BrowserTranslatorFactory | null {
		return (globalThis as typeof globalThis & { Translator?: BrowserTranslatorFactory }).Translator ?? null;
	}

	async availability(source: string, target: string): Promise<TranslatorAvailability> {
		if (!this.factory) return 'unavailable';
		return this.factory.availability({ sourceLanguage: source, targetLanguage: target });
	}

	async prepare(
		source: string,
		target: string,
		signal: AbortSignal,
		onProgress: (progress: number) => void
	): Promise<void> {
		const factory = this.factory;
		if (!factory) throw new Error('Браузерный перевод недоступен');

		const translator = await factory.create({
			sourceLanguage: source,
			targetLanguage: target,
			signal,
			monitor(monitor) {
				monitor.addEventListener('downloadprogress', (event) => {
					const progress = event as ProgressEvent;
					onProgress(Math.round(progress.loaded * 100));
				});
			},
		});

		translator.destroy();
	}

	async translate({ text, source, target, signal }: TranslateRequest): Promise<string> {
		const factory = this.factory;
		if (!factory) throw new Error('Браузерный перевод недоступен');

		const translator = await factory.create({ sourceLanguage: source, targetLanguage: target, signal });

		try {
			return await translator.translate(text, { signal });
		} finally {
			translator.destroy();
		}
	}
}
