import { IconCloudOff } from '@tabler/icons-react';

import { Button, NoContent } from '@/shared/ui';

export const Empty = ({ onAdd }: { onAdd: () => void }) => {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<NoContent
					description="Добавьте сайт или сервис, чтобы следить за его доступностью"
					icon={IconCloudOff}
					title="Нет сервисов"
				/>
				<Button className="h-6 rounded-md text-xs" onClick={onAdd}>
					Добавить сервис
				</Button>
			</div>
		</div>
	);
};
