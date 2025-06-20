import { genStore } from '../model';
import { mmToPt } from './utils';

export const renderCutLine = () => (
	<rect
		fill="none"
		height={genStore.height - 2 * mmToPt(genStore.padding)}
		rx={mmToPt(genStore.radius)}
		ry={mmToPt(genStore.radius)}
		stroke="black"
		strokeWidth="1"
		width={genStore.width - 2 * mmToPt(genStore.padding)}
		x={mmToPt(genStore.padding)}
		y={mmToPt(genStore.padding)}
	/>
);

export const stringifyCutLine = () => `
	<rect
		fill="none"
		height="${genStore.height - 2 * mmToPt(genStore.padding)}"
		rx="${mmToPt(genStore.radius)}"
		ry="${mmToPt(genStore.radius)}"
		stroke="black"
		stroke-width="1"
		width="${genStore.width - 2 * mmToPt(genStore.padding)}"
		x="${mmToPt(genStore.padding)}"
		y="${mmToPt(genStore.padding)}"
	/>
`;
