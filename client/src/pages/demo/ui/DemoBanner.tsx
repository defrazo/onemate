import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

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
		<div className="sticky top-0 z-100 border-b border-(--accent-default)/30 bg-(--accent-default)/10 backdrop-blur">
			<div className="relative mx-auto flex min-h-10 max-w-400 items-center justify-center px-12 py-2">
				<p className="text-center text-xs text-(--color-secondary) md:text-sm">
					<span className="font-bold text-(--color-primary)">Вы в демо-режиме.</span>{' '}
					<span className="hidden sm:inline">
						Изменения сохраняются только в этом браузере, некоторые функции недоступны.{' '}
					</span>
					<Link
						className="text-(--accent-default) transition-colors hover:text-(--accent-hover) hover:underline"
						to="/demo"
					>
						Подробнее
					</Link>
				</p>
				<Button
					centerIcon={<IconX className="size-4" />}
					className="absolute right-4 text-(--color-secondary) hover:text-(--color-primary)"
					size="custom"
					title="Закрыть уведомление"
					variant="mobile"
					onClick={onClose}
				/>
			</div>
		</div>
	);
});
