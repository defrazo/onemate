import { makeAutoObservable, reaction } from 'mobx';

import { insertTextBlocks } from '../lib';
import type { CutLine, TextBlock } from '.';

const initialState = {
	count: 1,
	sizePt: [0, 0] as [number, number],
	grid: [1, 1] as [number, number],
	cutLine: { paddingMm: 5, radiusMm: 10, visible: true } as CutLine,
	textBlocks: [
		{ id: 0, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
		{ id: 1, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
	] as TextBlock[],
	svgRaw: null as string | null,
	svgWithText: null as string | null,
};

export class GenStore {
	svgRaw: string | null = null;
	svgWithText: string | null = null;
	count: number = 1;
	sizePt: [number, number] = [0, 0]; // width, height
	grid: [number, number] = [1, 1]; // columns, rows
	cutLine: CutLine = { paddingMm: 5, radiusMm: 10, visible: true };
	textBlocks: TextBlock[] = [
		{ id: 0, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
		{ id: 1, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
	];

	get width() {
		return this.sizePt[0];
	}

	get widthMm() {
		return Number((this.sizePt[0] * 0.352778).toFixed(2));
	}

	get height() {
		return this.sizePt[1];
	}

	get heightMm() {
		return Number((this.sizePt[1] * 0.352778).toFixed(2));
	}

	get cols() {
		return this.grid[0];
	}

	get rows() {
		return this.grid[1];
	}

	get firstText() {
		return this.textBlocks[0];
	}

	get secondText() {
		return this.textBlocks[1];
	}

	get padding() {
		return this.cutLine.paddingMm;
	}

	get radius() {
		return this.cutLine.radiusMm;
	}

	get isCutLine() {
		return this.cutLine.visible;
	}

	get innerSvg() {
		return this.svgWithText?.replace(/<svg[^>]*>|<\/svg>/g, '') ?? '';
	}

	setCount(value: number) {
		this.count = value;
	}

	setSizePt([x, y]: [number, number]) {
		this.sizePt = [x, y];
	}

	setGrid([cols, rows]: [number, number]) {
		this.grid = [cols, rows];
	}

	updateTextBlock = <K extends keyof TextBlock>(index: number, key: K, value: TextBlock[K]) => {
		const updated = [...this.textBlocks];
		updated[index] = { ...updated[index], [key]: value };
		this.textBlocks = updated;
	};

	updateCutLine = <K extends keyof CutLine>(key: K, value: CutLine[K]) => {
		this.cutLine = { ...this.cutLine, [key]: value };
	};

	setRawSvg(svg: string) {
		this.svgRaw = svg;
	}

	resetGenerator() {
		Object.assign(this, initialState);
	}

	private rowsCorrection() {
		const [cols, rows] = this.grid;
		const requiredRows = Math.ceil(this.count / cols);

		if (rows !== requiredRows) this.grid = [cols, requiredRows];
	}

	constructor() {
		makeAutoObservable(this);
		reaction(
			() => [this.svgRaw, this.textBlocks.map((b) => ({ ...b }))] as [string | null, TextBlock[]],
			([raw]) => {
				if (!raw) {
					this.svgWithText = null;
					return;
				}

				const enabledBlocks = this.textBlocks.filter((b) => b.isEnabled);
				this.svgWithText = insertTextBlocks(
					raw,
					enabledBlocks.map((b) => ({
						text: b.text,
						x: b.x,
						y: b.y,
						fontSize: 20,
					}))
				);
			},
			{
				fireImmediately: true,
			}
		);

		reaction(
			() => [this.count, this.grid[0]],
			() => {
				this.rowsCorrection();
			}
		);
	}
}

export const genStore = new GenStore();
