import { IconArrowsExchange } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Select } from '@/shared/ui';

export const Controls = observer(() => {
	const { translatorStore } = useStore();

	return (
		<div className="grid grid-cols-[1fr_auto_1fr] border-b border-(--border-primary)">
			<Select
				hideChevron
				align="start"
				className="justify-center text-sm"
				listClassName="right-auto mt-2 w-50"
				options={translatorStore.languages}
				value={translatorStore.sourceLang}
				variant="custom"
				onChange={translatorStore.setSourceLanguage}
			/>
			<Button
				centerIcon={<IconArrowsExchange className="size-4 group-active:scale-90" />}
				className="group h-6 w-13"
				padding="none"
				title="Поменять языки местами"
				variant="accent"
				onClick={translatorStore.swap}
			/>
			<Select
				hideChevron
				align="start"
				className="justify-center text-sm"
				listClassName="left-auto mt-2 w-50"
				options={translatorStore.languages}
				value={translatorStore.targetLang}
				variant="custom"
				onChange={translatorStore.setTargetLanguage}
			/>
		</div>
	);
});
