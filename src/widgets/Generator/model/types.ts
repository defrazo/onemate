import type { ChangeEvent } from 'react';

export type ContainerSize = {
	width: number;
	height: number;
};

export type CutLine = {
	paddingMm: number;
	radiusMm: number;
	visible: boolean;
};

export type DimensionsPt = {
	widthPt: number;
	heightPt: number;
};

export type DisplaySizes = {
	cardWidth: number;
	cardHeight: number;
	scalePt: number;
};

export type SettingsPanels = {
	id: string;
	max: number;
	min?: number;
	type: string;
	value: number;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export type TextBlock = {
	id: number;
	text: string;
	isEnabled: boolean;
	x: number;
	y: number;
};
