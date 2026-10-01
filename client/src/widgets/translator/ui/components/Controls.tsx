import { IconArrowsExchange } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Select } from '@/shared/ui';

export const Controls = observer(() => {
	const { translatorStore } = useStore();

	return (
		<div className="grid grid-cols-[1fr_auto_1fr] border-b border-(--border-primary) pb-2">
			<Select
				hideChevron
				align="start"
				className="justify-center text-sm transition-colors hover:text-(--accent-primary)"
				listClassName="-left-2 right-auto mt-2 w-50"
				options={translatorStore.languages}
				size="custom"
				value={translatorStore.sourceLang}
				variant="mobile"
				onChange={translatorStore.setSourceLanguage}
			/>
			<Button
				centerIcon={<IconArrowsExchange className="size-4" />}
				className="h-6 w-13 rounded-lg"
				title="Поменять языки местами"
				variant="accent"
				onClick={translatorStore.swap}
			/>
			<Select
				hideChevron
				align="start"
				className="justify-center text-sm transition-colors hover:text-(--accent-primary)"
				listClassName="-right-2 left-auto mt-2 w-50"
				options={translatorStore.languages}
				size="custom"
				value={translatorStore.targetLang}
				variant="mobile"
				onChange={translatorStore.setTargetLanguage}
			/>
		</div>
	);
});
