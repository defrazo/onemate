import { observer } from 'mobx-react-lite';

import { genStore, useGenModel } from '../model';
import { CardSvg } from '.';

export const PreviewGrid = observer(() => {
	const { cardWidth, cardHeight, fullGridWidth, fullGridHeight, gap, ref } = useGenModel();

	return (
		<div className="flex w-full flex-col gap-2">
			<div
				ref={ref}
				className="core-base core-card flex min-h-full w-full items-center justify-center overflow-hidden"
			>
				{genStore.svgWithText && (
					<div
						style={{
							width: `${fullGridWidth}px`,
							height: `${fullGridHeight}px`,
						}}
					>
						<div
							className="core-border rounded-xl p-4"
							style={{
								display: 'grid',
								gap: `${gap}px`,
								gridTemplateColumns: `repeat(${genStore.cols}, ${cardWidth}px)`,
								gridTemplateRows: `repeat(${genStore.rows}, ${cardHeight}px)`,
							}}
						>
							{Array.from({ length: genStore.count }).map((_, i) => (
								<CardSvg key={i} height={cardHeight} width={cardWidth} />
							))}
						</div>
					</div>
				)}
				{!genStore.svgWithText && <div className="text-muted text-sm">Нет SVG для отображения</div>}
			</div>
		</div>
	);
});
