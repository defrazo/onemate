export const Currency = () => (
	<div className="relative h-28 overflow-hidden rounded-lg border border-white/8 bg-white/5 p-3">
		<div className="mb-4 flex items-center gap-2">
			<div className="size-5 rounded-md bg-(--accent-default)/15" />
			<div className="h-1.5 w-14 rounded-full bg-white/20" />
		</div>
		<div className="flex items-center justify-center gap-2">
			<div className="h-3 w-8 rounded bg-white/15" />
			<div className="h-1.5 w-3 rounded-full bg-white/10" />
			<div className="h-3 w-12 rounded bg-white/20" />
		</div>
		<div className="mt-4 h-6 rounded-md border border-white/8 bg-white/3" />
	</div>
);
