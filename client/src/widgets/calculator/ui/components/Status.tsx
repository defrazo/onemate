import { IconRefresh } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const Status = ({ count, onClear }: { count: number; onClear: () => void }) => {
	return (
		<div className="flex items-center justify-between border-t border-(--border-primary) pt-2">
			<div className="flex h-6 items-center rounded-lg bg-(--accent-primary)/10 px-2 text-xs text-(--accent-primary)">
				{count} вычислений
			</div>
			<Button
				className="h-6 min-w-22.5 rounded-lg bg-(--accent-primary)/10 px-2 text-xs text-(--accent-primary)"
				disabled={!count}
				leftIcon={<IconRefresh className="size-4" />}
				size="custom"
				title="Очистить историю"
				variant="accent"
				onClick={onClear}
			>
				Очистить
			</Button>
		</div>
	);
};
