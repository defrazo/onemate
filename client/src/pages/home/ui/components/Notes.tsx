export const Notes = () => (
	<div className="relative h-36 overflow-hidden rounded-lg border border-white/8 bg-white/5 p-3">
		<div className="mb-3 flex items-center gap-2">
			<div className="flex size-5 items-center justify-center rounded-md bg-(--accent-default)/15">
				<span className="size-1.5 rounded-sm bg-(--accent-default)/70" />
			</div>
			<div className="h-1.5 w-10 rounded-full bg-white/25" />
		</div>
		<div className="space-y-2">
			<div className="rounded-md border border-white/8 bg-white/3 p-2">
				<div className="h-1.5 w-4/5 rounded-full bg-white/18" />
				<div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-white/10" />
			</div>
			<div className="rounded-md border border-white/8 bg-white/3 p-2">
				<div className="h-1.5 w-2/3 rounded-full bg-white/15" />
				<div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-white/10" />
			</div>
			<div className="rounded-md border border-white/8 bg-white/3 p-2">
				<div className="h-1.5 w-3/4 rounded-full bg-white/15" />
			</div>
		</div>
	</div>
);
