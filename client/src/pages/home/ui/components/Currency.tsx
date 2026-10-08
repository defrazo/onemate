export const Currency = () => (
	<div className="relative h-28 overflow-hidden rounded-lg border border-(--tone-strong-hover) bg-(--tone-strong) p-3">
		<div className="mb-4 flex items-center gap-2">
			<div className="size-5 rounded-md bg-(--accent-primary)/15" />
			<div className="h-1.5 w-14 rounded-full bg-(--border-tone)" />
		</div>
		<div className="flex items-center justify-center gap-2">
			<div className="h-3 w-8 rounded bg-(--tone-strong-hover)" />
			<div className="h-1.5 w-3 rounded-full bg-(--tone-strong)" />
			<div className="h-3 w-12 rounded bg-(--border-tone)" />
		</div>
		<div className="mt-4 h-6 rounded-md border border-(--tone-strong) bg-(--tone)" />
	</div>
);
