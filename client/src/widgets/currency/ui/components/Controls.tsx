import { IconArrowsExchange, IconRefresh } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

export const Controls = observer(() => {
	const { currencyStore } = useStore();

	return (
		<div className="absolute top-1/2 left-4 flex h-7 w-fit -translate-y-3.5 rounded-lg bg-(--bg-secondary)">
			<Button
				centerIcon={<IconArrowsExchange className="size-4" />}
				className="h-7 w-13 rounded-l-lg rounded-r-none"
				title="Поменять местами"
				variant="accent"
				onClick={() => currencyStore.swapCurrencies()}
			/>
			<Button
				centerIcon={<IconRefresh className="size-4" />}
				className="h-7 w-13 rounded-l-none rounded-r-lg bg-(--accent-default)/10 text-(--accent-default) hover:bg-(--accent-default)/20"
				disabled={currencyStore.isDefault}
				title="Сбросить"
				variant="custom"
				onClick={() => currencyStore.clear()}
			/>
		</div>
	);
});
