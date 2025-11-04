import type { ReactNode } from 'react';

interface TechIconProps {
	label: string;
	svg: ReactNode;
	hint: string;
}

export const TechIcon = ({ label, svg, hint }: TechIconProps) => (
	<div className="core-semiborder core-base core-card flex cursor-default items-center gap-4 bg-(--bg-primary) shadow-(--shadow) transition-transform duration-500 select-none hover:z-10 hover:scale-[1.15]">
		<div className="grid size-10 place-items-center rounded-xl bg-(--bg-primary)">{svg}</div>
		<div className="mt-1 flex flex-col justify-between gap-1.5">
			<h2 className="text-base leading-4 font-bold">{label}</h2>
			{hint && <div className="text-justify text-sm leading-4 opacity-80 md:text-center">{hint}</div>}
		</div>
	</div>
);
