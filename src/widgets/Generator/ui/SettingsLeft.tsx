import { observer } from 'mobx-react-lite';

import { Divider, ZoomOnHover } from '@/shared/ui';

import { renderCutLine } from '../lib';
import { genStore, useGenModel } from '../model';
import { TextBlock } from '.';

export const SettingsLeft = observer(() => {
	const { cardWidth, cardHeight } = useGenModel();

	return (
		<div className="core-base core-card top-4 flex w-full flex-col gap-2">
			{genStore.svgWithText && (
				<ZoomOnHover>
					<svg
						className="core-border rounded-xl p-2"
						height={cardHeight}
						style={{ display: 'block', maxWidth: '100%', height: 'auto', width: 'auto' }}
						viewBox={`0 0 ${genStore.width} ${genStore.height}`}
						width={cardWidth}
					>
						<g
							dangerouslySetInnerHTML={{
								__html: genStore.svgWithText.replace(/<svg[^>]*>|<\/svg>/g, ''),
							}}
						/>

						{genStore.isCutLine && renderCutLine()}
					</svg>
				</ZoomOnHover>
			)}
			<TextBlock
				isChecked={genStore.firstText.isEnabled}
				label="Надпись верхняя"
				position={[genStore.firstText.x, genStore.firstText.y]}
				textValue={genStore.firstText.text}
				onCheckToggle={() => genStore.updateTextBlock(0, 'isEnabled', !genStore.firstText.isEnabled)}
				onPositionChange={(axis, value) => genStore.updateTextBlock(0, axis, value)}
				onTextChange={(e) => genStore.updateTextBlock(0, 'text', e.target.value)}
			/>
			<Divider />
			<TextBlock
				isChecked={genStore.secondText.isEnabled}
				label="Надпись нижняя"
				position={[genStore.secondText.x, genStore.secondText.y]}
				textValue={genStore.secondText.text}
				onCheckToggle={() => genStore.updateTextBlock(1, 'isEnabled', !genStore.secondText.isEnabled)}
				onPositionChange={(axis, value) => genStore.updateTextBlock(1, axis, value)}
				onTextChange={(e) => genStore.updateTextBlock(1, 'text', e.target.value)}
			/>
		</div>
	);
});
