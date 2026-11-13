import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { AsyncStore } from '@/shared/lib/store';

import { availableLanguages } from '../lib/languages';
import { PRIORITY_LANGUAGES, TRANSLATOR_MAX_LENGTH } from './constants';
import { createDefaultTranslator } from './defaults';
import type { TranslatorAvailability, TranslatorProvider } from './ports';
import type { Language, Textbox } from './types';

const SOURCE_IDX = 0;
const TARGET_IDX = 1;

export class TranslatorStore extends AsyncStore {
	private preparationAbort: AbortController | null = null;
	private abort: AbortController | null = null;
	private availabilityVersion = 0;

	private static readonly languagesCache: Language[] = Object.values(availableLanguages)
		.map(({ name, code }) => ({
			key: code,
			label: name,
			value: code,
		}))
		.sort((a, b) => {
			const aIndex = PRIORITY_LANGUAGES.indexOf(a.value);
			const bIndex = PRIORITY_LANGUAGES.indexOf(b.value);

			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;

			return 0;
		});

	availability: TranslatorAvailability = 'unavailable';
	isPreparing = false;
	preparationProgress = 0;

	textboxes: Textbox[] = createDefaultTranslator();

	get isReady(): boolean {
		return !this.isLoading;
	}

	get sourceLang(): string {
		return this.textboxes[SOURCE_IDX].language;
	}

	get targetLang(): string {
		return this.textboxes[TARGET_IDX].language;
	}

	get sourceText(): string {
		return this.textboxes[SOURCE_IDX].text;
	}

	get targetText(): string {
		return this.textboxes[TARGET_IDX].text;
	}

	get languages(): Language[] {
		return TranslatorStore.languagesCache;
	}

	setSourceText(value: string): void {
		const text = value.slice(0, TRANSLATOR_MAX_LENGTH);

		this.updateTextbox(SOURCE_IDX, 'text', text);

		if (!text.trim()) {
			this.cancelRequest();
			this.updateTextbox(TARGET_IDX, 'text', '');
		}
	}

	setSourceLanguage(language: string): void {
		if (this.sourceLang === language) return;

		this.cancelPreparation();
		this.cancelRequest();
		this.updateTextbox(SOURCE_IDX, 'language', language);
	}

	setTargetLanguage(language: string): void {
		if (this.targetLang === language) return;

		this.cancelPreparation();
		this.cancelRequest();
		this.updateTextbox(TARGET_IDX, 'language', language);
	}

	clear(): void {
		this.cancelRequest();
		this.updateTextbox(SOURCE_IDX, 'text', '');
		this.updateTextbox(TARGET_IDX, 'text', '');
	}

	swap(): void {
		const [source, target] = this.textboxes;

		this.cancelPreparation();
		this.cancelRequest();

		this.textboxes = [
			{ ...source, language: target.language, text: target.text },
			{ ...target, language: source.language, text: source.text },
		];
	}

	async checkAvailability(): Promise<void> {
		const version = ++this.availabilityVersion;
		const source = this.sourceLang;
		const target = this.targetLang;

		if (source === target) {
			runInAction(() => (this.availability = 'unavailable'));
			return;
		}

		try {
			const availability = await this.provider.availability(source, target);

			if (version !== this.availabilityVersion) return;
			runInAction(() => (this.availability = availability));
		} catch {
			if (version !== this.availabilityVersion) return;
			runInAction(() => (this.availability = 'unavailable'));
		}
	}

	async prepare(): Promise<void> {
		if (this.isPreparing) return;

		const controller = new AbortController();
		this.preparationAbort = controller;

		const source = this.sourceLang;
		const target = this.targetLang;

		runInAction(() => {
			this.isPreparing = true;
			this.preparationProgress = 0;
		});

		try {
			await this.provider.prepare(source, target, controller.signal, (progress) => {
				if (controller.signal.aborted) return;
				runInAction(() => (this.preparationProgress = progress));
			});

			if (controller.signal.aborted) return;

			await this.checkAvailability();

			if (controller.signal.aborted) return;

			if (this.sourceText.trim()) await this.translate();
		} finally {
			if (this.preparationAbort === controller) {
				this.preparationAbort = null;
				runInAction(() => (this.isPreparing = false));
			}
		}
	}

	async translate(): Promise<void> {
		if (!this.sourceText.trim() || this.sourceLang === this.targetLang) {
			this.cancelRequest();
			this.updateTextbox(TARGET_IDX, 'text', '');
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

				if (result != null) this.updateTextbox(TARGET_IDX, 'text', result);
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			throw error;
		} finally {
			if (this.abort === controller) this.abort = null;
		}
	}

	private updateTextbox<K extends keyof Textbox>(idx: number, key: K, value: Textbox[K]): void {
		const updated = [...this.textboxes];
		updated[idx] = { ...updated[idx], [key]: value };
		this.textboxes = updated;
	}

	private cancelPreparation(): void {
		this.availabilityVersion++;
		this.preparationAbort?.abort();
		this.preparationAbort = null;

		this.availability = 'unavailable';
		this.isPreparing = false;
		this.preparationProgress = 0;
	}

	private cancelRequest(): void {
		this.abort?.abort();
		this.abort = null;
	}

	constructor(private readonly provider: TranslatorProvider) {
		super();

		makeObservable<this, 'updateTextbox' | 'cancelPreparation' | 'reset'>(this, {
			availability: observable,
			isPreparing: observable,
			preparationProgress: observable,
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
			cancelPreparation: action,
			clear: action,
			swap: action,
			reset: action,
		});

		this.setSourceLanguage = this.setSourceLanguage.bind(this);
		this.setTargetLanguage = this.setTargetLanguage.bind(this);
		this.clear = this.clear.bind(this);
		this.swap = this.swap.bind(this);
		this.prepare = this.prepare.bind(this);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.cancelPreparation();
		this.cancelRequest();
		super.destroy();
	}

	reset(): void {
		this.cancelPreparation();
		this.cancelRequest();
		this.textboxes = createDefaultTranslator();
	}
}
