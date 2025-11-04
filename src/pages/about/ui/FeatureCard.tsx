import { Divider } from '@/shared/ui';

interface FeatureCardProps {
	title: string;
	desc: string;
	Icon: any;
}

export const FeatureCard = ({ title, desc, Icon }: FeatureCardProps) => (
	<div className="core-base core-card core-semiborder cursor-default shadow-(--shadow) transition-transform duration-500 select-none hover:z-10 hover:scale-[1.15]">
		<div className="flex items-center gap-2">
			<Icon className="size-5" />
			<h2 className="text-base leading-4 font-bold">{title}</h2>
		</div>
		<Divider className="bg-(--accent-default-op)" margY="sm" />
		<p className="text-justify text-sm opacity-80 md:text-center">{desc}</p>
	</div>
);
