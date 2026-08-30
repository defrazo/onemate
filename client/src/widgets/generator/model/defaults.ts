import type { CutLine, TextBlock } from '.';

type GenState = {
	count: number;
	sizePt: [number, number];
	grid: [number, number];
	cutLine: CutLine;
	textBlocks: TextBlock[];
	svgRaw: string | null;
	svgWithText: string | null;
};

const DEFAULT_GENERATOR: GenState = {
	count: 1,
	sizePt: [0, 0],
	grid: [1, 1],
	cutLine: { paddingMm: 5, radiusMm: 10, visible: true },
	textBlocks: [
		{ id: 0, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
		{ id: 1, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
	],
	svgRaw: null,
	svgWithText: null,
};

export const createDefaultGenerator = (): GenState => clone(DEFAULT_GENERATOR);

const clone = <T>(v: T): T =>
	typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
