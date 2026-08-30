import { action, computed, makeObservable, observable } from 'mobx';

import { AsyncStore } from '@/shared/lib/store';

import { availableLanguages } from '../lib';
import { createDefaultTranslator, type ITranslatorProvider, type Language, type Textbox } from '.';

export class TranslatorStore extends AsyncStore {
	private abort: AbortController | null = null;

	private static readonly languagesCache: Language[] = Object.values(availableLanguages).map(({ name, code }) => ({
		key: code,
		label: name,
		value: code,
	}));

	textboxes: Textbox[] = createDefaultTranslator();

	get isReady(): boolean {
		return !this.isLoading;
	}

	get sourceLang(): string {
		return this.textboxes[0].language;
	}

	get targetLang(): string {
		return this.textboxes[1].language;
	}

	get sourceText(): string {
		return this.textboxes[0].text;
	}

	get targetText(): string {
		return this.textboxes[1].text;
	}

	get languages(): Language[] {
		return TranslatorStore.languagesCache;
	}

	updateTextbox<K extends keyof Textbox>(index: number, key: K, value: Textbox[K]): void {
		const updated = [...this.textboxes];
		updated[index] = { ...updated[index], [key]: value };
		this.textboxes = updated;
	}

	swapLanguages(): void {
		const [source, target] = this.textboxes;
		this.textboxes = [
			{ ...source, language: target.language, text: target.text },
			{ ...target, language: source.language, text: source.text },
		];

		void this.translateText();
	}

	private cancelRequest(): void {
		this.abort?.abort();
		this.abort = null;
	}

	async translateText(): Promise<void> {
		if (!this.sourceText.trim() || this.sourceLang === this.targetLang) {
			this.cancelRequest();
			this.updateTextbox(1, 'text', '');
			return;
		}

		this.cancelRequest();

		const controller = new AbortController();
		this.abort = controller;

		try {
			await this.withLoading(async () => {
				const result = await this.provider.translate({
					text: this.sourceText,
					source: this.sourceLang,
					target: this.targetLang,
					signal: controller.signal,
				});

				if (controller.signal.aborted) return;

				if (result != null) this.updateTextbox(1, 'text', result);
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			throw error;
		} finally {
			if (this.abort === controller) this.abort = null;
		}
	}

	constructor(private readonly provider: ITranslatorProvider) {
		super();

		makeObservable<this, 'reset'>(this, {
			textboxes: observable,

			isReady: computed,
			sourceLang: computed,
			targetLang: computed,
			sourceText: computed,
			targetText: computed,
			languages: computed,

			updateTextbox: action,
			swapLanguages: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.cancelRequest();
		super.destroy();
	}

	protected reset(): void {
		this.cancelRequest();
		this.textboxes = createDefaultTranslator();
	}
}
