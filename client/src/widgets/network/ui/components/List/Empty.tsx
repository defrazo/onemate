import { IconActivityHeartbeat } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const Empty = ({ onAdd }: { onAdd: () => void }) => {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-0.5">
				<div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-(--accent-primary)/10">
					<IconActivityHeartbeat className="size-5 text-(--accent-primary)" />
				</div>
				<span className="text-sm text-(--text-primary)">Нет сервисов</span>
				<span className="trim text-xs text-(--text-disabled)">
					Добавьте сайт или сервис, чтобы следить за его доступностью
				</span>
				<Button className="mt-3 h-6 rounded-lg px-3 text-xs" size="custom" onClick={onAdd}>
					Добавить сервис
				</Button>
			</div>
		</div>
	);
};
