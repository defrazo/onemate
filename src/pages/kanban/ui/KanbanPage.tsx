import { useEffect, useRef } from 'react';

import { usePageTitle } from '@/shared/lib/hooks';

import { initKanban } from '.';

const KanbanPage = () => {
	usePageTitle('Kanban');

	const kanbanRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!kanbanRef.current) return;

		let cleanup: (() => void) | undefined;

		(async () => (cleanup = await initKanban(`#${kanbanRef.current!.id}`)))();

		return () => cleanup?.();
	}, []);

	return <div ref={kanbanRef} className="size-full" id="kanban" />;
};

export default KanbanPage;
