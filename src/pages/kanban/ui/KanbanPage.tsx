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
		<>
			<style>
				{`
				.kanban-loader {
					width: 120px;
					height: 8px;
					-webkit-mask: linear-gradient(90deg,#000 70%,#0000 0) left/20% 100%;
					background:
						linear-gradient(var(--accent-default) 0 0) left -25% top 0 /20% 100% no-repeat
						var(--border-color);
					animation: load 1s infinite steps(6);
				}
				@keyframes load { 100% {background-position: right -25% top 0} }
				`}
			</style>

			<div ref={kanbanRef} className="relative size-full" id="kanban">
				{loading && (
					<div className="kanban-loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
				)}
			</div>
		</>
	);
};

export default KanbanPage;
