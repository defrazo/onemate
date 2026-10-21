export const Translator = () => (
	<div className="relative h-28 overflow-hidden rounded-lg border border-(--tone-strong-hover) bg-(--tone-strong) p-3">
		<div className="mb-4 flex items-center gap-2">
			<div className="size-5 rounded-md bg-(--accent-primary)/15" />
			<div className="h-1.5 w-12 rounded-full bg-(--border-tone)" />
		</div>
		<div className="grid grid-cols-2 gap-3">
			<div className="space-y-2">
				<div className="h-1.5 w-3/4 rounded-full bg-(--tone-strong-hover)" />
				<div className="h-1.5 w-1/2 rounded-full bg-(--tone-strong)" />
			</div>
			<div className="space-y-2 border-l border-(--tone-strong) pl-3">
				<div className="h-1.5 w-2/3 rounded-full bg-(--tone-strong-hover)" />
				<div className="bg(--tone-strong) h-1.5 w-4/5 rounded-full" />
			</div>
		</div>
	</div>
);
