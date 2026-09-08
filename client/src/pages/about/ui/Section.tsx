import type { ReactNode } from 'react';

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="flex flex-col gap-2">
		<h2 className="core-header">{title}</h2>
		{children}
	</section>
);
