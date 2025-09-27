import { Divider } from '@/shared/ui';

interface FeatureCardProps {
	title: string;
	desc: string;
	Icon: any;
}

export const FeatureCard = ({ title, desc, Icon }: FeatureCardProps) => (
	<div className="core-base core-card cursor-default border border-solid border-[var(--border-color)]/40 shadow-[var(--shadow)] transition-transform duration-500 select-none hover:z-10 hover:scale-[1.15]">
		<div className="flex-row items-center gap-2">
			<div className="flex items-center gap-2">
				<Icon className="size-5" />
				<h1 className="leading-4 font-semibold">{title}</h1>
			</div>
		</div>
		<Divider margY="sm" />
		<p className="text-justify text-sm opacity-80 md:text-center">{desc}</p>
	</div>
);
