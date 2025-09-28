import type { ReactNode } from 'react';

interface SectionProps {
	title: string;
	children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
	<section className="flex flex-col gap-2">
		<h2 className="core-header">{title}</h2>
		{children}
	</section>
);
