export const Weather = () => (
	<div className="relative h-28 overflow-hidden rounded-lg border border-white/8 bg-white/5 p-3">
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div className="size-5 rounded-md bg-(--accent-default)/15" />
				<div className="h-1.5 w-10 rounded-full bg-white/20" />
			</div>
			<div className="h-1.5 w-12 rounded-full bg-white/10" />
		</div>
		<div className="mt-4 flex items-center justify-center gap-5">
			<div className="relative size-9">
				<div className="absolute inset-1 rounded-full bg-amber-400/35" />
				<div className="absolute top-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-amber-400/30" />
				<div className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-amber-400/30" />
				<div className="absolute top-1/2 left-0 h-px w-1.5 -translate-y-1/2 bg-amber-400/30" />
				<div className="absolute top-1/2 right-0 h-px w-1.5 -translate-y-1/2 bg-amber-400/30" />
			</div>
			<div>
				<div className="h-4 w-10 rounded bg-white/20" />
				<div className="mt-2 h-1.5 w-14 rounded-full bg-white/10" />
			</div>
		</div>
	</div>
);
