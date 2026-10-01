export const Translator = () => (
	<div className="relative h-28 overflow-hidden rounded-lg border border-white/8 bg-white/5 p-3">
		<div className="mb-4 flex items-center gap-2">
			<div className="size-5 rounded-md bg-(--accent-primary)/15" />
			<div className="h-1.5 w-12 rounded-full bg-white/20" />
		</div>
		<div className="grid grid-cols-2 gap-3">
			<div className="space-y-2">
				<div className="h-1.5 w-3/4 rounded-full bg-white/15" />
				<div className="h-1.5 w-1/2 rounded-full bg-white/10" />
			</div>
			<div className="space-y-2 border-l border-white/8 pl-3">
				<div className="h-1.5 w-2/3 rounded-full bg-white/12" />
				<div className="h-1.5 w-4/5 rounded-full bg-white/8" />
			</div>
		</div>
	</div>
);
