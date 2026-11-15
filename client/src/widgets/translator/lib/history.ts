import { LS_PREFIX } from '@/shared/config';
import { storage } from '@/shared/lib/storage';

import type { TranslationHistoryEntry } from '../model/types';

const MAX_ENTRIES = 30;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const key = (userId: string) => `${LS_PREFIX}translator_history_${userId}`;

const normalize = (value: unknown): TranslationHistoryEntry[] => {
	if (!Array.isArray(value)) return [];

	const now = Date.now();
	const seen = new Set<string>();

	return value
		.filter((entry): entry is TranslationHistoryEntry => {
			if (!entry || typeof entry !== 'object') return false;
			return (
				typeof entry.id === 'string' &&
				entry.id.length > 0 &&
				entry.id.length <= 100 &&
				typeof entry.source === 'string' &&
				entry.source.length > 0 &&
				entry.source.length <= 16 &&
				typeof entry.target === 'string' &&
				entry.target.length > 0 &&
				entry.target.length <= 16 &&
				typeof entry.original === 'string' &&
				!!entry.original.trim() &&
				entry.original.length <= 500 &&
				typeof entry.translation === 'string' &&
				!!entry.translation.trim() &&
				entry.translation.length <= 50000 &&
				Number.isFinite(entry.createdAt) &&
				entry.createdAt > now - MAX_AGE &&
				entry.createdAt <= now
			);
		})
		.sort((a, b) => b.createdAt - a.createdAt)
		.filter((entry) => {
			const signature = JSON.stringify([entry.source, entry.target, entry.original, entry.translation]);
			if (seen.has(signature) || seen.has(`id:${entry.id}`)) return false;
			seen.add(signature);
			seen.add(`id:${entry.id}`);
			return true;
		})
		.slice(0, MAX_ENTRIES)
		.map(({ id, source, target, original, translation, createdAt }) => ({
			id,
			source,
			target,
			original,
			translation,
			createdAt,
		}));
};

export const readTranslationHistory = (userId: string): TranslationHistoryEntry[] => {
	try {
		const raw: unknown = storage.get(key(userId));
		const entries = normalize(raw);

		try {
			if (JSON.stringify(raw) !== JSON.stringify(entries)) writeTranslationHistory(userId, entries);
		} catch {}

		return entries;
	} catch {
		return [];
	}
};

export const writeTranslationHistory = (userId: string, entries: TranslationHistoryEntry[]) => {
	const normalized = normalize(entries);

	if (normalized.length) storage.set(key(userId), normalized);
	else storage.remove(key(userId));
};
