interface TechIconProps {
	label: string;
	svg: React.ReactNode;
	hint?: string;
}

export const TechIcon = ({ label, svg, hint }: TechIconProps) => (
	<div className="flex cursor-default items-center gap-3 rounded-2xl border border-[var(--border-color)]/40 bg-[var(--bg-primary)] p-3 shadow-sm transition-transform duration-500 select-none hover:z-10 hover:scale-[1.15]">
		<div className="grid size-10 place-items-center rounded-xl bg-[var(--bg-tertiary)]/50">{svg}</div>
		<div>
			<div className="text-lg font-semibold">{label}</div>
			{hint && <div className="text-sm opacity-80">{hint}</div>}
		</div>
	</div>
);
