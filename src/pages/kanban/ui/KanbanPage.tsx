import { useEffect, useRef } from 'react';

import { initKanban } from '.';

const KanbanPage = () => {
	const kanbanRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!kanbanRef.current) return;

		const destroy = initKanban(`#${kanbanRef.current.id}`);
		return () => destroy();
	}, []);

	return <div ref={kanbanRef} className="size-full" id="kanban" />;
};

export default KanbanPage;
