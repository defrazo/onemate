import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { renderCutLine } from '../lib';

export const CardSvg = observer(({ width, height }: { width: number; height: number }) => {
	const { genStore } = useStore();

	return (
		<svg
			height={`${height}px`}
			style={{ display: 'block' }}
			viewBox={`0 0 ${genStore.width} ${genStore.height}`}
			width={`${width}px`}
		>
			<g dangerouslySetInnerHTML={{ __html: genStore.innerSvg }} />
			{genStore.isCutLine && renderCutLine()}
		</svg>
	);
});
