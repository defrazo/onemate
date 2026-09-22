import { IconActivityHeartbeat, IconPlus } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const Empty = ({ onAdd }: { onAdd: () => void }) => {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<div className="flex max-w-64 flex-col items-center text-center">
				<div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-(--accent-default)/10">
					<IconActivityHeartbeat className="size-5 text-(--accent-default)" />
				</div>

				<span className="text-sm text-(--color-primary)">Нет ресурсов</span>

				<span className="mt-1 text-xs leading-relaxed text-(--color-secondary)">
					Добавьте сайт или сервис, чтобы следить за его доступностью
				</span>

				<Button className="mt-4" leftIcon={<IconPlus className="size-4" />} size="sm" onClick={onAdd}>
					Добавить ресурс
				</Button>
			</div>
		</div>
	);
};
