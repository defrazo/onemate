import type { TranslateRequest } from './types';

export type TranslatorAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export type TranslatorProvider = ITranslatorProvider & ITranslatorPreparation;

export interface ITranslatorProvider {
	translate(request: TranslateRequest): Promise<string>;
}

export interface ITranslatorPreparation {
	availability(source: string, target: string): Promise<TranslatorAvailability>;
	prepare(source: string, target: string, signal: AbortSignal, onProgress: (progress: number) => void): Promise<void>;
}
