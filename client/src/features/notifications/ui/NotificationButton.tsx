import { useState } from 'react';
import { IconBell } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useEscapeClose, useOutsideClick } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { Menu } from './components';

export const NotificationButton = observer(() => {
	useEscapeClose(() => setIsOpen(false));

	const { notificationStore } = useStore();

	const [isOpen, setIsOpen] = useState(false);

	const buttonRef = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

	return (
		<div ref={buttonRef} className="relative">
			<Button
				active={isOpen}
				centerIcon={<IconBell className="size-5" />}
				className="flex size-9 rounded-xl text-(--color-secondary) transition-colors hover:bg-white/8 hover:text-(--accent-default)"
				type="button"
				variant="mobile"
				onClick={() => setIsOpen((value) => !value)}
			/>
			{notificationStore.unreadCount > 0 && (
				<span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-(--accent-default)" />
			)}
			{isOpen && <Menu />}
		</div>
	);
});
