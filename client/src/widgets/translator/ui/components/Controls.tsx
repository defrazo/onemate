import { IconArrowsExchange } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Select } from '@/shared/ui';

export const Controls = observer(() => {
	const { translatorStore } = useStore();

	return (
		<div className="grid grid-cols-[1fr_auto_1fr]">
			<Select
				hideChevron
				keyBadge
				align="start"
				className="justify-center rounded-none border-b border-(--tone-strong) text-sm transition-colors group-hover:border-(--accent-primary) aria-expanded:border-(--accent-primary)"
				listPlacement="start"
				options={translatorStore.languages}
				value={translatorStore.sourceLang}
				variant="custom"
				onChange={translatorStore.setSourceLanguage}
			/>
			<Button
				centerIcon={<IconArrowsExchange className="size-4 group-active/switcher:scale-90" />}
				className="group/switcher mx-4 my-auto h-6 w-8"
				padding="none"
				title="Поменять языки местами"
				variant="accent"
				onClick={translatorStore.swap}
			/>
			<Select
				hideChevron
				keyBadge
				align="start"
				className="justify-center rounded-none border-b border-(--tone-strong) text-sm transition-colors group-hover:border-(--accent-primary) aria-expanded:border-(--accent-primary)"
				listPlacement="end"
				options={translatorStore.languages}
				value={translatorStore.targetLang}
				variant="custom"
				onChange={translatorStore.setTargetLanguage}
			/>
		</div>
	);
});
