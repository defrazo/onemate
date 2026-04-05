import { useEffect, useRef, useState } from 'react';

import { usePageTitle } from '@/shared/lib/hooks';

import { initKanban } from '.';

const KanbanPage = () => {
	usePageTitle('Kanban');

	const [loading, setLoading] = useState(true);
	const kanbanRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const root = kanbanRef.current;
		if (!root) return;

		let isDisposed = false;
		let cleanup: (() => void) | undefined;

		(async () => {
			try {
				const destroy = await initKanban(root);

				if (isDisposed) {
					destroy?.();
					return;
				}

				cleanup = destroy;
			} finally {
				if (!isDisposed) setLoading(false);
			}
		})();

		return () => {
			isDisposed = true;
			cleanup?.();
		};
	}, []);

	return (
		<div ref={kanbanRef} className="relative size-full overflow-hidden" id="kanban">
			{loading && <div className="kanban-loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
		</div>
	);
};

export default KanbanPage;
