import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort, IUserRoutingPort } from '@/entities/user';
import { AsyncStore } from '@/shared/lib/store';
import { generateUUID } from '@/shared/lib/utils';

import { readTranslationHistory, writeTranslationHistory } from '../lib/history';
import { availableLanguages } from '../lib/languages';
import { PRIORITY_LANGUAGES, TRANSLATOR_MAX_LENGTH } from './constants';
import { createDefaultTranslator } from './defaults';
import type { TranslatorAvailability, TranslatorProvider } from './ports';
import type { Language, Textbox, TranslationHistoryEntry } from './types';

const SOURCE_IDX = 0;
const TARGET_IDX = 1;

export class TranslatorStore extends AsyncStore {
	private preparationAbort: AbortController | null = null;
	private abort: AbortController | null = null;
	private availabilityVersion = 0;
	private historyTimer: ReturnType<typeof setTimeout> | null = null;
	private historyReadyAt = 0;
	private historyVersion = 0;
	private historyResult: TranslationHistoryEntry | null = null;

	history: TranslationHistoryEntry[] = [];
	historyError: string | null = null;
	shouldAutoTranslate = true;

	get canUseHistory(): boolean {
		return !!this.user.id && this.user.userRole !== 'demo';
	}

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
		this.cancelHistory();
		this.cancelRequest();
		this.shouldAutoTranslate = true;
		const text = value.slice(0, TRANSLATOR_MAX_LENGTH);

		this.updateTextbox(SOURCE_IDX, 'text', text);

		if (
			(this.sourceLang === 'ru' && this.targetLang === 'en') ||
			(this.sourceLang === 'en' && this.targetLang === 'ru')
		) {
			const letters = text.match(/\p{L}/gu) ?? [];

			if (letters.length >= 3) {
				const cyrillic = letters.filter((letter) => /\p{Script=Cyrillic}/u.test(letter)).length;
				const latin = letters.filter((letter) => /\p{Script=Latin}/u.test(letter)).length;
				const language = cyrillic / letters.length >= 0.7 ? 'ru' : latin / letters.length >= 0.7 ? 'en' : null;

				if (language && language !== this.sourceLang) {
					this.cancelPreparation();
					this.cancelRequest();
					this.updateTextbox(SOURCE_IDX, 'language', language);
					this.updateTextbox(TARGET_IDX, 'language', language === 'ru' ? 'en' : 'ru');
					this.updateTextbox(TARGET_IDX, 'text', '');
				}
			}
		}

		if (!text.trim()) {
			this.cancelRequest();
			this.updateTextbox(TARGET_IDX, 'text', '');
		}
	}

	setSourceLanguage(language: string): void {
		if (this.sourceLang === language) return;
		this.shouldAutoTranslate = true;

		this.cancelPreparation();
		this.cancelRequest();
		this.updateTextbox(SOURCE_IDX, 'language', language);
	}

	setTargetLanguage(language: string): void {
		if (this.targetLang === language) return;
		this.shouldAutoTranslate = true;

		this.cancelPreparation();
		this.cancelRequest();
		this.updateTextbox(TARGET_IDX, 'language', language);
	}

	clear(): void {
		this.cancelHistory();
		this.shouldAutoTranslate = true;
		this.cancelRequest();
		this.updateTextbox(SOURCE_IDX, 'text', '');
		this.updateTextbox(TARGET_IDX, 'text', '');
	}

	swap(): void {
		this.shouldAutoTranslate = true;
		const [source, target] = this.textboxes;

		this.cancelPreparation();
		this.cancelRequest();

		this.textboxes = [
			{ ...source, language: target.language, text: target.text },
			{ ...target, language: source.language, text: source.text },
		];
	}

	loadHistory(): void {
		this.history = this.canUseHistory ? readTranslationHistory(this.user.id!) : [];
	}

	deleteHistory(id: string): void {
		if (!this.canUseHistory) return;

		this.cancelHistory();
		this.saveHistory(readTranslationHistory(this.user.id!).filter((entry) => entry.id !== id));
	}

	clearHistory(): void {
		this.cancelHistory();
		this.saveHistory([]);
	}

	restoreHistory(entry: TranslationHistoryEntry): void {
		if (!this.canUseHistory) return;

		const saved = readTranslationHistory(this.user.id!).find((item) => item.id === entry.id);
		if (!saved) return;

		this.cancelPreparation();
		this.cancelRequest();

		this.shouldAutoTranslate = false;
		this.textboxes = [
			{ type: 'source', language: saved.source, text: saved.original },
			{ type: 'target', language: saved.target, text: saved.translation },
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

		if (this.historyTimer) clearTimeout(this.historyTimer);
		this.historyTimer = null;
		this.historyResult = null;

		const owner = this.canUseHistory ? this.user.id : null;
		const historyVersion = this.historyVersion;
		const original = this.sourceText;
		const source = this.sourceLang;
		const target = this.targetLang;

		try {
			await this.withLoading(async () => {
				const result = await this.provider.translate({
					text: original,
					source,
					target,
					signal: controller.signal,
				});

				if (
					controller.signal.aborted ||
					original !== this.sourceText ||
					source !== this.sourceLang ||
					target !== this.targetLang
				)
					return;

				if (result != null) {
					this.updateTextbox(TARGET_IDX, 'text', result);

					if (
						owner &&
						owner === this.user.id &&
						this.canUseHistory &&
						historyVersion === this.historyVersion &&
						result.trim()
					) {
						this.historyResult = {
							id: generateUUID(),
							source,
							target,
							original,
							translation: result,
							createdAt: Date.now(),
						};

						if (this.historyTimer) clearTimeout(this.historyTimer);
						this.historyTimer = setTimeout(
							() => {
								this.historyTimer = null;
								if (
									owner !== this.user.id ||
									!this.canUseHistory ||
									controller.signal.aborted ||
									!this.historyResult
								)
									return;

								const entry = this.historyResult;

								if (
									entry.original !== this.sourceText ||
									entry.source !== this.sourceLang ||
									entry.target !== this.targetLang
								)
									return;

								runInAction(() => this.saveHistory([entry, ...readTranslationHistory(owner)]));
							},
							Math.max(0, this.historyReadyAt - Date.now())
						);
					}
				}
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			throw error;
		} finally {
			if (this.abort === controller) this.abort = null;
		}
	}

	private saveHistory(entries: TranslationHistoryEntry[]): void {
		if (!this.canUseHistory) return;

		try {
			writeTranslationHistory(this.user.id!, entries);
			this.history = readTranslationHistory(this.user.id!);
			this.historyError = null;
		} catch {
			this.historyError = 'Не удалось сохранить историю переводов';
		}
	}

	private cancelHistory(): void {
		this.historyVersion++;
		if (this.historyTimer) clearTimeout(this.historyTimer);

		this.historyTimer = null;
		this.historyResult = null;
		this.historyReadyAt = Date.now() + 3000;
	}

	private updateTextbox<K extends keyof Textbox>(idx: number, key: K, value: Textbox[K]): void {
		const updated = [...this.textboxes];
		updated[idx] = { ...updated[idx], [key]: value };
		this.textboxes = updated;
	}

	private cancelPreparation(): void {
		this.cancelHistory();
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

	constructor(
		private readonly provider: TranslatorProvider,
		private readonly user: IBaseUserPort & Pick<IUserRoutingPort, 'userRole'>
	) {
		super();

		makeObservable<this, 'updateTextbox' | 'cancelPreparation' | 'reset'>(this, {
			availability: observable,
			isPreparing: observable,
			preparationProgress: observable,
			textboxes: observable,
			history: observable,
			historyError: observable,
			shouldAutoTranslate: observable,
			canUseHistory: computed,
			loadHistory: action,
			deleteHistory: action,
			clearHistory: action,
			restoreHistory: action,

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

		this.track(
			reaction(
				() => [this.user.id, this.user.userRole],
				() => {
					this.reset();
					this.loadHistory();
				},
				{ fireImmediately: true }
			)
		);
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
		this.shouldAutoTranslate = true;
		this.history = [];
		this.historyError = null;
	}
}
