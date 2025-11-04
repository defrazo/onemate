import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { useGenModel } from '../model';
import { CardSvg } from '.';

export const PreviewGrid = observer(() => {
	const { genStore } = useStore();
	const { cardWidth, cardHeight, fullGridWidth, fullGridHeight, gap, ref } = useGenModel();

	return (
		<div className="hidden w-full flex-col gap-2 lg:flex">
			<div
				ref={ref}
				className="core-base core-card flex min-h-full w-full items-center justify-center overflow-hidden"
			>
				{genStore.svgWithText && (
					<div style={{ width: `${fullGridWidth}px`, height: `${fullGridHeight}px` }}>
						<div
							className="core-border p-4"
							style={{
								display: 'grid',
								gap: `${gap}px`,
								gridTemplateColumns: `repeat(${genStore.cols}, ${cardWidth}px)`,
								gridTemplateRows: `repeat(${genStore.rows}, ${cardHeight}px)`,
							}}
						>
							{Array.from({ length: genStore.count }).map((_, idx) => (
								<CardSvg key={idx} height={cardHeight} width={cardWidth} />
							))}
						</div>
					</div>
				)}
				{!genStore.svgWithText && <div className="text-muted text-sm">Нет SVG для отображения</div>}
			</div>
		</div>
	);
});
