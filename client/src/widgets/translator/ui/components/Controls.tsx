import { IconArrowsExchange } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Select } from '@/shared/ui';

export const Controls = observer(() => {
	const { translatorStore } = useStore();

	return (
		<div className="flex items-center justify-between gap-3">
			<Select
				hideChevron
				keyBadge
				align="start"
				className="justify-center text-sm aria-expanded:border-(--accent-primary)"
				listPlacement="start"
				options={translatorStore.languages}
				value={translatorStore.sourceLang}
				variant="tone"
				onChange={translatorStore.setSourceLanguage}
			/>
			<Button
				centerIcon={<IconArrowsExchange className="size-4 group-active/switcher:scale-90" />}
				className="group/switcher size-8 shrink-0 rounded-full"
				padding="none"
				title="Поменять языки местами"
				variant="accent"
				onClick={translatorStore.swap}
			/>
			<Select
				hideChevron
				keyBadge
				align="start"
				className="justify-center text-sm aria-expanded:border-(--accent-primary)"
				listPlacement="end"
				options={translatorStore.languages}
				value={translatorStore.targetLang}
				variant="tone"
				onChange={translatorStore.setTargetLanguage}
			/>
		</div>
	);
});
