import { action, computed, makeObservable, observable } from 'mobx';

import { AsyncStore } from '@/shared/lib/store';

import { availableLanguages } from '../lib';
import {
	createDefaultTranslator,
	type ITranslatorProvider,
	type Language,
	type Textbox,
	TRANSLATOR_MAX_LENGTH,
} from '.';

const SOURCE_INDEX = 0;
const TARGET_INDEX = 1;

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
		return this.textboxes[SOURCE_INDEX].language;
	}

	get targetLang(): string {
		return this.textboxes[TARGET_INDEX].language;
	}

	get sourceText(): string {
		return this.textboxes[SOURCE_INDEX].text;
	}

	get targetText(): string {
		return this.textboxes[TARGET_INDEX].text;
	}

	get languages(): Language[] {
		return TranslatorStore.languagesCache;
	}

	setSourceText(value: string): void {
		const text = value.slice(0, TRANSLATOR_MAX_LENGTH);

		this.updateTextbox(SOURCE_INDEX, 'text', text);

		if (!text.trim()) {
			this.cancelRequest();
			this.updateTextbox(TARGET_INDEX, 'text', '');
		}
	}

	setSourceLanguage(language: string): void {
		this.updateTextbox(SOURCE_INDEX, 'language', language);
	}

	setTargetLanguage(language: string): void {
		this.updateTextbox(TARGET_INDEX, 'language', language);
	}

	clear(): void {
		this.cancelRequest();
		this.updateTextbox(SOURCE_INDEX, 'text', '');
		this.updateTextbox(TARGET_INDEX, 'text', '');
	}

	swap(): void {
		const [source, target] = this.textboxes;

		this.cancelRequest();

		this.textboxes = [
			{ ...source, language: target.language, text: target.text },
			{ ...target, language: source.language, text: source.text },
		];
	}

	async translate(): Promise<void> {
		if (!this.sourceText.trim() || this.sourceLang === this.targetLang) {
			this.cancelRequest();
			this.updateTextbox(TARGET_INDEX, 'text', '');
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

				if (result != null) this.updateTextbox(TARGET_INDEX, 'text', result);
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			throw error;
		} finally {
			if (this.abort === controller) this.abort = null;
		}
	}

	private updateTextbox<K extends keyof Textbox>(index: number, key: K, value: Textbox[K]): void {
		const updated = [...this.textboxes];
		updated[index] = { ...updated[index], [key]: value };
		this.textboxes = updated;
	}

	private cancelRequest(): void {
		this.abort?.abort();
		this.abort = null;
	}

	constructor(private readonly provider: ITranslatorProvider) {
		super();

		makeObservable<this, 'updateTextbox' | 'reset'>(this, {
			textboxes: observable,

			isReady: computed,
			sourceLang: computed,
			targetLang: computed,
			sourceText: computed,
			targetText: computed,
			languages: computed,

			updateTextbox: action,
			setSourceText: action,
			setSourceLanguage: action,
			setTargetLanguage: action,
			clear: action,
			swap: action,
			reset: action,
		});

		this.setSourceLanguage = this.setSourceLanguage.bind(this);
		this.setTargetLanguage = this.setTargetLanguage.bind(this);
		this.clear = this.clear.bind(this);
		this.swap = this.swap.bind(this);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.cancelRequest();
		super.destroy();
	}

	reset(): void {
		this.cancelRequest();
		this.textboxes = createDefaultTranslator();
	}
}
