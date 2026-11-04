export const Progress = ({ completed, total }: { completed: number; total: number }) => {
	const percent = total ? (completed / total) * 100 : 0;

	return (
		<div className="shrink-0 space-y-1 text-xs text-(--text-secondary)">
			<div className="flex items-center justify-between gap-2">
				<span>Выполнено</span>
				<span>
					{completed} из {total}
				</span>
			</div>
			<div
				aria-label="Выполнение списка"
				aria-valuemax={total || 1}
				aria-valuemin={0}
				aria-valuenow={completed}
				className="h-1 overflow-hidden rounded-full bg-(--tone-strong)"
				role="progressbar"
			>
				<div className="h-full bg-(--accent-primary)" style={{ width: `${percent}%` }} />
			</div>
		</div>
	);
};
