import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconArrows } from '@/shared/assets/icons';
import { WIDGET_TIPS } from '@/shared/content';
import { Button, Tooltip } from '@/shared/ui';

import { TranslatorBox } from '.';

const TranslatorWidget = () => {
	const { notifyStore, translatorStore: store } = useStore();

	const handleClear = () => {
		store.updateTextbox(0, 'text', '');
		store.updateTextbox(1, 'text', '');
	};

	useEffect(() => {
		if (!store.sourceText) return;

		let active = true;
		const timeout = setTimeout(() => {
			store.translateText().catch((e) => {
				if (active) notifyStore.setNotice(e.message || 'Произошла ошибка при переводе', 'error');
			});
		}, 1000);

		return () => {
			active = false;
			clearTimeout(timeout);
		};
	}, [store.sourceText, store.sourceLang, store.targetLang]);

	const location = useLocation();

	useEffect(() => {
		return () => store.reset();
	}, [location.pathname]);

	useEffect(() => () => store.destroy(), [store]);

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WIDGET_TIPS.translator}>
					<h1 className="core-header">Переводчик</h1>
				</Tooltip>
			</div>
			<div className="flex flex-1 flex-col">
				<div className="relative flex flex-1 flex-col gap-2 xl:flex-row">
					<TranslatorBox
						language={store.sourceLang}
						store={store}
						text={store.sourceText}
						type="source"
						onChangeLang={(value) => store.updateTextbox(0, 'language', value)}
						onClear={handleClear}
					/>
					<Button
						centerIcon={<IconArrows className="size-4 xl:rotate-90" />}
						className="bottom-6 left-1/2 z-10 size-8 w-full rounded-xl xl:absolute xl:w-4 xl:-translate-x-1/2 xl:rounded-full"
						title="Поменять языки местами"
						variant="accent"
						onClick={() => store.swapLanguages()}
					/>
					<TranslatorBox
						language={store.targetLang}
						store={store}
						text={store.targetText}
						type="target"
						onChangeLang={(value) => store.updateTextbox(1, 'language', value)}
					/>
				</div>
			</div>
		</>
	);
};

export default observer(TranslatorWidget);
