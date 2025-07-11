import { makeAutoObservable, runInAction } from 'mobx';

import { handleError } from '@/shared/lib/errors';

import { fetchTranslate } from '../api';
import { availableLanguages } from '../lib';
import { Language, Textbox } from '.';

class TranslatorStore {
	private abortController: AbortController | null = null;

	textboxes: Textbox[] = [
		{ type: 'source', language: 'ru', text: '' },
		{ type: 'target', language: 'en', text: '' },
	];
	isLoading: boolean = false;
	error: string | null = null;

	get sourceLang() {
		return this.textboxes[0].language;
	}

	get targetLang() {
		return this.textboxes[1].language;
	}

	get sourceText() {
		return this.textboxes[0].text;
	}

	get targetText() {
		return this.textboxes[1].text;
	}

	get languages(): Language[] {
		return Object.values(availableLanguages).map((item) => ({
			key: item.code,
			label: item.name,
			value: item.code,
		}));
	}

	updateTextboxes = <K extends keyof Textbox>(index: number, key: K, value: Textbox[K]) => {
		const updated = [...this.textboxes];
		updated[index] = { ...updated[index], [key]: value };
		this.textboxes = updated;
	};

	swapLanguages = (): void => {
		const [source, target] = this.textboxes;
		this.textboxes = [
			{ ...source, language: target.language, text: target.text },
			{ ...target, language: source.language, text: source.text },
		];
	};

	async translateText(): Promise<void> {
		this.abortController?.abort();
		this.abortController = new AbortController();
		this.isLoading = true;
		this.error = null;

		try {
			const result = await fetchTranslate({
				text: this.sourceText,
				source: this.sourceLang,
				target: this.targetLang,
				signal: this.abortController.signal,
			});

			runInAction(() => {
				if (result) this.updateTextboxes(1, 'text', result);
				this.isLoading = false;
			});
		} catch (error) {
			handleError(error);
			runInAction(() => {
				this.error = 'Ошибка перевода';
				this.isLoading = false;
			});
		}
	}

	constructor() {
		makeAutoObservable(this);
	}
}

export const translatorStore = new TranslatorStore();
