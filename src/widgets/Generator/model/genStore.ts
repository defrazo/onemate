import { makeAutoObservable, reaction } from 'mobx';

import { createDefaultGenerator } from '@/shared/lib/constants';

import { insertTextBlocks } from '../lib';
import type { CutLine, TextBlock } from '.';

export class GenStore {
	private disposers = new Set<() => void>();
	private inited: boolean = false;

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

	get width(): number {
		return this.sizePt[0];
	}

	get widthMm(): number {
		return Number((this.sizePt[0] * 0.352778).toFixed(2));
	}

	get height(): number {
		return this.sizePt[1];
	}

	get heightMm(): number {
		return Number((this.sizePt[1] * 0.352778).toFixed(2));
	}

	get cols(): number {
		return this.grid[0];
	}

	get rows(): number {
		return this.grid[1];
	}

	get firstText(): TextBlock {
		return this.textBlocks[0];
	}

	get secondText(): TextBlock {
		return this.textBlocks[1];
	}

	get padding(): number {
		return this.cutLine.paddingMm;
	}

	get radius(): number {
		return this.cutLine.radiusMm;
	}

	get isCutLine(): boolean {
		return this.cutLine.visible;
	}

	get innerSvg(): string {
		return this.svgWithText?.replace(/<svg[^>]*>|<\/svg>/g, '') ?? '';
	}

	setCount(value: number): void {
		this.count = value;
	}

	setSizePt([x, y]: [number, number]): void {
		this.sizePt = [x, y];
	}

	setGrid([cols, rows]: [number, number]): void {
		this.grid = [cols, rows];
	}

	updateTextBlock<K extends keyof TextBlock>(index: number, key: K, value: TextBlock[K]): void {
		const updated = [...this.textBlocks];
		updated[index] = { ...updated[index], [key]: value };
		this.textBlocks = updated;
	}

	updateCutLine<K extends keyof CutLine>(key: K, value: CutLine[K]): void {
		this.cutLine = { ...this.cutLine, [key]: value };
	}

	setRawSvg(svg: string): void {
		this.svgRaw = svg;
	}

	private rowsCorrection(): void {
		const [cols, rows] = this.grid;
		const requiredRows = Math.ceil(this.count / cols);

		if (rows !== requiredRows) this.grid = [cols, requiredRows];
	}

	constructor() {
		makeAutoObservable<this, 'inited' | 'disposers'>(this, {
			inited: false,
			disposers: false,
		});

		this.track(
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
				{ fireImmediately: true }
			)
		);

		this.track(
			reaction(
				() => [this.count, this.grid[0]],
				() => this.rowsCorrection()
			)
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
	}

	destroy(): void {
		this.disposers.forEach((dispose) => {
			try {
				dispose();
			} catch {}
		});
		this.disposers.clear();
		this.inited = false;
	}

	reset(): void {
		Object.assign(this, createDefaultGenerator());
	}

	private track(disposer?: (() => void) | void): void {
		if (!disposer) return;
		this.disposers.add(disposer);
	}
}
