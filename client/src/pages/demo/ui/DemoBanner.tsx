import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, Link } from '@/shared/ui';

import { demoCache } from '../lib';

export const DemoBanner = observer(() => {
	const { userStore } = useStore();

	const userId = userStore.id;

	const [isClosed, setIsClosed] = useState(() => {
		return userId ? demoCache.isClosed(userId) : false;
	});

	if (userStore.userRole !== 'demo' || !userId || isClosed) return null;

	const onClose = () => {
		setIsClosed(true);
		demoCache.close(userId);
	};

	return (
		<div className="sticky top-0 z-100 border-b border-(--accent-primary)/30 bg-(--accent-primary-muted) backdrop-blur">
			<div className="relative mx-auto flex min-h-10 max-w-400 items-center justify-center px-12 py-2">
				<p className="flex items-center gap-1 text-center text-xs text-(--text-secondary) md:text-sm">
					<span className="font-semibold text-(--text-primary)">Вы в демо-режиме.</span>
					<span className="hidden sm:inline">
						Изменения сохраняются только в этом браузере, некоторые функции недоступны.
					</span>
					<Link
						className="text-(--accent-primary) hover:text-(--accent-primary-hover) hover:underline"
						padding="none"
						to="/demo"
						variant="custom"
					>
						Подробнее
					</Link>
				</p>
				<Button
					centerIcon={<IconX className="size-4" />}
					className="absolute right-4"
					padding="none"
					title="Закрыть уведомление"
					variant="icon"
					onClick={onClose}
				/>
			</div>
		</div>
	);
});
