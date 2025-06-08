import { observer } from 'mobx-react-lite';

import { renderCutLine } from '../lib';
import { genStore } from '../model';

export const CardSvg = observer(({ width, height }: { width: number; height: number }) => {
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
