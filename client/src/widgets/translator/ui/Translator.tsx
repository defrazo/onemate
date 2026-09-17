import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { TRANSLATE_DELAY } from '../model';
import { Controls, TranslateField } from './components';

export const Translator = observer(() => {
	const location = useLocation();

	const { notifyStore, translatorStore } = useStore();

	useEffect(() => {
		if (!translatorStore.sourceText.trim()) return;

		let active = true;

		const timeout = setTimeout(() => {
			translatorStore.translate().catch(() => {
				if (!active) return;

				notifyStore.setNotice('Что-то пошло не так', 'error');
			});
		}, TRANSLATE_DELAY);

		return () => {
			active = false;
			clearTimeout(timeout);
		};
	}, [translatorStore.sourceText, translatorStore.sourceLang, translatorStore.targetLang]);

	useEffect(() => {
		return () => translatorStore.reset();
	}, [location.pathname]);

	useEffect(() => {
		return () => translatorStore.destroy();
	}, [translatorStore]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<Controls />
			<div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-2">
				<TranslateField side="source" />
				<TranslateField side="target" />
			</div>
		</div>
	);
});
