import { useState } from 'react';

import { calculateDisplaySizes, cleanSvgContent, extractSvgDimensions } from '../lib';
import { genStore, useContainerSize } from '.';

export const useGenModel = () => {
	const { ref, size: containerSize } = useContainerSize(32);
	const [selectedFileName, setSelectedFileName] = useState<string>('');

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		if (!file || file.type !== 'image/svg+xml') return;

		setSelectedFileName(file.name);

		const reader = new FileReader();
		reader.onload = () => {
			const originalSvg = reader.result as string;
			const cleanedSvg = cleanSvgContent(originalSvg);
			const parser = new DOMParser();
			const doc = parser.parseFromString(cleanedSvg, 'image/svg+xml');
			const svgEl = doc.querySelector('svg');
			if (!svgEl) return;

			const dims = extractSvgDimensions(svgEl);
			genStore.setSizePt([dims.widthPt, dims.heightPt]);
			genStore.setRawSvg(cleanedSvg);

			genStore.updateTextBlock(0, 'x', dims.widthPt / 3.3);
			genStore.updateTextBlock(0, 'y', dims.heightPt / 6.1);
			genStore.updateTextBlock(1, 'x', dims.widthPt / 3.3);
			genStore.updateTextBlock(1, 'y', dims.heightPt / 1.1);
		};

		reader.readAsText(file);
	};

	const { cardWidth, cardHeight } = calculateDisplaySizes(
		containerSize,
		genStore.width,
		genStore.height,
		genStore.cols,
		genStore.rows
	);

	const gap = 16;
	const fullGridWidth = genStore.cols * cardWidth + (genStore.cols - 1) * gap + 34;
	const fullGridHeight = genStore.rows * cardHeight + (genStore.rows - 1) * gap + 34;

	return {
		cardWidth,
		cardHeight,
		fullGridWidth,
		fullGridHeight,
		gap,
		ref,
		selectedFileName,
		setSelectedFileName,
		handleUpload,
	};
};
