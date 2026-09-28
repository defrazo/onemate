export const Calendar = () => (
	<div className="relative h-36 overflow-hidden rounded-lg border border-white/8 bg-white/5 p-3">
		<div className="mb-3 flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div className="flex size-5 items-center justify-center rounded-md bg-(--accent-default)/15">
					<span className="size-1.5 rounded-full bg-(--accent-default)/70" />
				</div>
				<div className="h-1.5 w-12 rounded-full bg-white/25" />
			</div>
			<div className="h-1.5 w-8 rounded-full bg-white/10" />
		</div>
		<div className="mb-2 grid grid-cols-7 gap-2">
			{Array.from({ length: 7 }).map((_, idx) => (
				<span key={idx} className="mx-auto size-1 rounded-full bg-(--accent-default)/30" />
			))}
		</div>
		<div className="grid grid-cols-7 gap-x-2 gap-y-2.5">
			{Array.from({ length: 28 }).map((_, idx) => (
				<span
					key={idx}
					className={
						idx === 19
							? 'mx-auto size-2 rounded-full bg-(--accent-default)/65'
							: 'mx-auto size-1 rounded-full bg-white/15'
					}
				/>
			))}
		</div>
	</div>
);
