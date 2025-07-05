import type { ContainerSize, DimensionsPt, DisplaySizes } from '../model';
import { genStore } from '../model';
import { stringifyCutLine } from '.';

// Конвертирует миллиметры в поинты
export const mmToPt = (mm: number): number => mm * (72 / 25.4);

// Удаляет xml-хедер из SVG
export const cleanSvgContent = (svg: string): string => svg.replace(/<\?xml[^>]*\?>\s*/i, '').trim();

// Извлекает размеры SVG в pt
export const extractSvgDimensions = (svgElement: SVGSVGElement): DimensionsPt => {
	const viewBox = svgElement.getAttribute('viewBox');

	if (viewBox) {
		const parts = viewBox.trim().split(/\s+|,/);

		if (parts.length === 4) {
			const width = parseFloat(parts[2]);
			const height = parseFloat(parts[3]);

			if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) return { widthPt: width, heightPt: height };
		}
	}

	const widthAttr = svgElement.getAttribute('width');
	const heightAttr = svgElement.getAttribute('height');

	if (widthAttr && heightAttr) {
		const parseNumber = (str: string): number => {
			const num = parseFloat(str);
			return isNaN(num) ? 0 : num;
		};

		const width = parseNumber(widthAttr);
		const height = parseNumber(heightAttr);

		if (width > 0 && height > 0) return { widthPt: width, heightPt: height };
	}

	return { widthPt: 90, heightPt: 110 };
};

// Скачивает SVG-файл
export const downloadSvgString = (svgString: string, filename: string): void => {
	const blob = new Blob([svgString], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
};

// Вставляет текст в SVG
export const insertTextBlocks = (
	svgString: string,
	textBlocks: Array<{ text: string; x: number; y: number; fontSize?: number }>
): string => {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgString, 'image/svg+xml');
		const root = doc.documentElement;

		root.querySelectorAll('text').forEach((el) => el.remove());

		textBlocks.forEach(({ text, x, y, fontSize = 20 }) => {
			const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
			textEl.setAttribute('fill', 'black');
			textEl.setAttribute('font-size', fontSize.toString());
			textEl.setAttribute('x', x.toString());
			textEl.setAttribute('y', y.toString());
			textEl.textContent = text;
			root.appendChild(textEl);
		});

		return new XMLSerializer().serializeToString(doc);
	} catch {
		return svgString;
	}
};

// Вычисляет размеры отображения карточек в контейнере
export const calculateDisplaySizes = (
	containerSize: ContainerSize,
	widthPt: number,
	heightPt: number,
	columns: number,
	rows: number
): DisplaySizes => {
	if (!containerSize.width || !containerSize.height || !widthPt || !heightPt) {
		return { cardWidth: widthPt, cardHeight: heightPt, scalePt: 1 };
	}

	const gridGap = 16;
	const aspectRatio = widthPt / heightPt;

	let cardWidth = Math.min(200, containerSize.width / columns - gridGap);
	let cardHeight = cardWidth / aspectRatio;

	const totalHeight = rows * cardHeight + (rows - 1) * gridGap;

	if (totalHeight > containerSize.height) {
		cardHeight = (containerSize.height - (rows - 1) * gridGap) / rows;
		cardWidth = cardHeight * aspectRatio;
	}

	const scalePt = cardWidth / widthPt;

	return { cardWidth, cardHeight, scalePt };
};

// Генерирует и скачивает сетку SVG-карточек
export const downloadGridSvg = (svgContent: string | null): void => {
	if (!svgContent) return;

	const parser = new DOMParser();
	const totalSlots = genStore.cols * genStore.rows;
	const cardsToRender = Math.min(genStore.count, totalSlots);

	const doc0 = parser.parseFromString(svgContent, 'image/svg+xml');
	const root0 = doc0.documentElement;

	const vb = root0.getAttribute('viewBox') || `0 0 ${genStore.width} ${genStore.height}`;
	const wAttr = root0.getAttribute('width') || `${genStore.width}pt`;
	const hAttr = root0.getAttribute('height') || `${genStore.height}pt`;

	const svgParts: string[] = [];
	svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${wAttr}" height="${hAttr}">`);

	for (let i = 0; i < cardsToRender; i++) {
		const col = i % genStore.cols;
		const row = Math.floor(i / genStore.cols);
		const tx = col * genStore.width;
		const ty = row * genStore.height;

		const doc = parser.parseFromString(svgContent, 'image/svg+xml');
		const innerSvg = doc.documentElement;

		const innerContent = Array.from(innerSvg.childNodes)
			.map((node) => new XMLSerializer().serializeToString(node))
			.join('');

		const line = genStore.isCutLine ? stringifyCutLine() : '';

		svgParts.push(`
			<g transform="translate(${tx}, ${ty})">
				${innerContent}
				${line}
			</g>
		`);
	}

	svgParts.push('</svg>');

	const finalSvg = svgParts.join('\n');
	downloadSvgString(finalSvg, 'cards-gridss.svg');
};
