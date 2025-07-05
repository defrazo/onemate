import { observer } from 'mobx-react-lite';

import { IconArrows } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import { translatorStore } from '../model';
import { TranslatorBox } from '.';

const TranslatorWidget = () => {
	return (
		<div className="core-card core-base flex h-full flex-col gap-2 shadow-[var(--shadow)]">
			<h1 className="core-header">Переводчик</h1>
			<div className="flex flex-1 flex-col">
				<div className="relative flex flex-1 gap-2">
					<TranslatorBox
						language={translatorStore.sourceLang}
						text={translatorStore.sourceText}
						type="source"
						onChangeLanguage={(value) => translatorStore.updateTextboxes(0, 'language', value)}
						onChangeText={(value) => translatorStore.updateTextboxes(0, 'text', value)}
						onClearTextbox={() => translatorStore.updateTextboxes(0, 'text', '')}
					/>
					<Button
						centerIcon={<IconArrows className="size-4" />}
						className="core-elements absolute bottom-6 left-1/2 z-10 size-8 -translate-x-1/2 rotate-90 rounded-full"
						onClick={() => translatorStore.swapLanguages()}
					/>
					<TranslatorBox
						language={translatorStore.targetLang}
						loading={translatorStore.isLoading}
						text={translatorStore.targetText}
						type="target"
						onChangeLanguage={(value) => translatorStore.updateTextboxes(1, 'language', value)}
						onClearTextbox={() => translatorStore.updateTextboxes(1, 'text', '')}
					/>
				</div>
			</div>
		</div>
	);
};

export default observer(TranslatorWidget);
