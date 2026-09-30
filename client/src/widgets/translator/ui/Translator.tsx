import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';

import { useStore } from '@/app/providers';

import { TRANSLATE_DELAY } from '../model';
import { Controls, TranslateField } from './components';

export const Translator = observer(() => {
	const location = useLocation();

	const { notifyStore, translatorStore: store } = useStore();

	useEffect(() => {
		if (!store.sourceText.trim()) return;

		let active = true;

		const timeout = setTimeout(() => {
			store.translate().catch(() => {
				if (!active) return;

				notifyStore.setNotice('Что-то пошло не так', 'error');
			});
		}, TRANSLATE_DELAY);

		return () => {
			active = false;
			clearTimeout(timeout);
		};
	}, [store.sourceText, store.sourceLang, store.targetLang, store, notifyStore]);

	useEffect(() => {
		return () => store.reset();
	}, [location.pathname, store]);

	useEffect(() => {
		return () => store.destroy();
	}, [store]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<Controls />
			<div className="grid min-h-0 flex-1 grid-cols-1 gap-2 xl:grid-cols-2 xl:gap-0">
				<TranslateField side="source" />
				<TranslateField side="target" />
			</div>
		</div>
	);
});
