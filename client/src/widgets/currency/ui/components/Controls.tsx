import { IconArrowsExchange, IconEraser } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

export const Controls = observer(() => {
	const { currencyStore } = useStore();

	return (
		<div className="absolute top-1/2 left-4 flex h-6 w-fit -translate-y-3 rounded-lg bg-(--bg-secondary)">
			<Button
				centerIcon={<IconArrowsExchange className="size-4 group-active/swap:scale-90" />}
				className="group/swap w-13 rounded-l-lg rounded-r-none"
				padding="none"
				title="Поменять местами"
				variant="accent"
				onClick={() => currencyStore.swapCurrencies()}
			/>
			<Button
				centerIcon={<IconEraser className="size-4 group-active/clear:scale-90" />}
				className="group/clear w-13 rounded-l-none rounded-r-lg border-y border-r border-(--accent-primary)/70 bg-(--accent-primary-muted) text-(--accent-primary) hover:bg-(--accent-primary)/20"
				disabled={currencyStore.isDefault}
				padding="none"
				title="Сбросить"
				variant="custom"
				onClick={() => currencyStore.clear()}
			/>
		</div>
	);
});
