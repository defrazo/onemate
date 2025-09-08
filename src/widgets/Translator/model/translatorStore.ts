import { makeAutoObservable } from 'mobx';

import { createDefaultTranslator } from '@/shared/lib/constants';
import type { Status } from '@/shared/stores';

import { availableLanguages } from '../lib';
import type { ITranslatorProvider, Language, Textbox } from '.';

export class TranslatorStore {
	private debounce: ReturnType<typeof setTimeout> | null = null;
	private abort: AbortController | null = null;
	private inited: boolean = false;
	private status: Status = 'idle';
	private error: string | null = null;

	private static readonly languagesCache: Language[] = Object.values(availableLanguages).map((item) => ({
		key: item.code,
		label: item.name,
		value: item.code,
	}));

	textboxes: Textbox[] = createDefaultTranslator();

	get isLoading(): boolean {
		return this.status === 'loading';
	}

	get isReady(): boolean {
		return this.status === 'ready';
	}

	get isError(): boolean {
		return this.status === 'error';
	}

	get errorMessage(): string | null {
		return this.error;
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

	async translateText(): Promise<void> {
		if (!this.sourceText.trim() || this.sourceLang === this.targetLang) {
			this.abort?.abort();
			this.updateTextbox(1, 'text', '');
			this.setReady();
			return;
		}

		if (this.isLoading) this.abort?.abort();
		this.abort = new AbortController();

		this.setLoading();

		try {
			const result = await this.provider.translate({
				text: this.sourceText,
				source: this.sourceLang,
				target: this.targetLang,
				signal: this.abort.signal,
			});

			if (this.abort.signal.aborted) return;

			if (result != null) this.updateTextbox(1, 'text', result);

			this.setReady();
		} catch (error: any) {
			if (error?.name === 'AbortError') return;
			this.setError(error);
			throw error;
		}
	}

	constructor(private readonly provider: ITranslatorProvider) {
		makeAutoObservable<this, 'provider' | 'inited' | 'abort' | 'debounce'>(this, {
			provider: false,
			inited: false,
			abort: false,
			debounce: false,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.abort?.abort();
		this.inited = false;
	}

	private setLoading(): void {
		this.status = 'loading';
		this.error = null;
	}

	private setReady(): void {
		this.status = 'ready';
		this.error = null;
	}

	private setError(error: unknown): void {
		this.status = 'error';
		this.error = error instanceof Error ? error.message : String(error);
	}

	reset(): void {
		this.status = 'idle';
		this.error = null;
		this.textboxes = createDefaultTranslator();
		this.clearDebounce();
	}

	private clearDebounce(): void {
		if (this.debounce) {
			clearTimeout(this.debounce);
			this.debounce = null;
		}
	}
}
