import { useEffect, useRef, useState } from 'react';

import { usePageTitle } from '@/shared/lib/hooks';

import { initKanban } from '.';

const KanbanPage = () => {
	usePageTitle('Kanban');

	const [loading, setLoading] = useState(true);
	const kanbanRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!kanbanRef.current) return;

		let cleanup: void | (() => void);

		(async () => {
			cleanup = await initKanban(`#${kanbanRef.current!.id}`);
			setLoading(false);
		})();

		return () => cleanup?.();
	}, []);

	return (
		<div ref={kanbanRef} className="relative size-full overflow-hidden" id="kanban">
			{loading && <div className="kanban-loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
		</div>
	);
};

export default KanbanPage;
