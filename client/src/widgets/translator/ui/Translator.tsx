import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { Divider } from '@/shared/ui';

import { TRANSLATE_DELAY } from '../model/constants';
import { Controls, TranslateField } from './components';

export const Translator = observer(() => {
	const location = useLocation();

	const { notifyStore, translatorStore: store } = useStore();

	useEffect(() => {
		if (!store.sourceText.trim()) return;

		let active = true;

		const timeout = setTimeout(() => {
			store.translate().catch((error) => {
				if (!active) return;

				notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
			});
		}, TRANSLATE_DELAY);

		return () => {
			active = false;
			clearTimeout(timeout);
		};
	}, [store.sourceText, store.sourceLang, store.targetLang, store, notifyStore]);

	useEffect(() => {
		store.checkAvailability();
	}, [store.sourceLang, store.targetLang, store]);

	useEffect(() => {
		return () => store.reset();
	}, [location.pathname, store]);

	useEffect(() => {
		return () => store.destroy();
	}, [store]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<Controls />
			<div className="flex min-h-0 flex-1 flex-col gap-1 xl:flex-row xl:gap-0">
				<TranslateField side="source" />
				<Divider className="mt-4 self-stretch bg-(--tone-strong)" direction="Y" margX="xs" />
				<TranslateField side="target" />
			</div>
		</div>
	);
});
