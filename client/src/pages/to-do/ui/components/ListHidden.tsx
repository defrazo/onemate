import { IconEyeOff } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button, NoContent } from '@/shared/ui';

export const ListHidden = ({ isDropTarget, onShow }: { isDropTarget: boolean; onShow: () => void }) => (
	<div
		className={cn(
			'flex min-h-0 flex-1 items-center justify-center rounded-lg select-none',
			isDropTarget && 'bg-(--accent-primary-muted) ring-1 ring-(--accent-primary) ring-inset'
		)}
	>
		<NoContent icon={IconEyeOff} title="Список скрыт">
			<Button className="h-6 rounded-md text-xs" onClick={onShow}>
				Показать
			</Button>
		</NoContent>
	</div>
);
