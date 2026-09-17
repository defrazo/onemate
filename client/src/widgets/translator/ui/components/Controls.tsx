import { IconArrowsExchange } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, SelectExt } from '@/shared/ui';

export const Controls = observer(() => {
	const { translatorStore } = useStore();

	return (
		<div className="grid grid-cols-[1fr_auto_1fr] border-b border-(--border-color) pb-2">
			<SelectExt
				className="min-w-0 border-0 text-sm"
				options={translatorStore.languages}
				size="custom"
				value={translatorStore.sourceLang}
				variant="mobile"
				visibleDown={false}
				visibleKey={false}
				onChange={translatorStore.setSourceLanguage}
			/>
			<Button
				centerIcon={<IconArrowsExchange className="size-4" />}
				className="h-6 w-13 rounded-lg"
				title="Поменять языки местами"
				variant="accent"
				onClick={translatorStore.swap}
			/>
			<SelectExt
				className="min-w-0 border-0 text-sm"
				options={translatorStore.languages}
				size="custom"
				value={translatorStore.targetLang}
				variant="mobile"
				visibleDown={false}
				visibleKey={false}
				onChange={translatorStore.setTargetLanguage}
			/>
		</div>
	);
});
