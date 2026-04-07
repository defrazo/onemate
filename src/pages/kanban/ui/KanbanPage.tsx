import { useEffect, useRef, useState } from 'react';

import { usePageTitle } from '@/shared/lib/hooks';
import { ErrorFallback } from '@/shared/ui';

import { initKanban } from '.';

const KanbanPage = () => {
	usePageTitle('Kanban');

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const kanbanRef = useRef<HTMLDivElement | null>(null);
	const cleanupRef = useRef<(() => void) | undefined>(undefined);
	const requestIdRef = useRef(0);

	const init = async () => {
		const root = kanbanRef.current;
		if (!root) return;

		const requestId = ++requestIdRef.current;

		cleanupRef.current?.();
		cleanupRef.current = undefined;

		setLoading(true);
		setError(false);

		try {
			const destroy = await initKanban(root);

			if (requestId !== requestIdRef.current) {
				destroy?.();
				return;
			}

			cleanupRef.current = destroy;
			return destroy;
		} catch {
			if (requestId === requestIdRef.current) setError(true);
		} finally {
			if (requestId === requestIdRef.current) setLoading(false);
		}
	};

	useEffect(() => {
		let disposed = false;

		init().then((destroy) => {
			if (disposed) destroy?.();
		});

		return () => {
			disposed = true;
			requestIdRef.current += 1;
			cleanupRef.current?.();
			cleanupRef.current = undefined;
		};
	}, []);

	return (
		<div className="relative size-full">
			<div ref={kanbanRef} className="size-full overflow-hidden" id="kanban" />

			{(loading || error) && (
				<div className="absolute inset-0 flex items-center justify-center">
					<ErrorFallback delay={7000} message="Что-то пошло не так..." onRetry={init} />
				</div>
			)}
		</div>
	);
};

export default KanbanPage;
