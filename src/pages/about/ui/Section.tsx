interface SectionProps {
	title: string;
	children: React.ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
	<section className="flex flex-col gap-2">
		<h2 className="core-header">{title}</h2>
		{children}
	</section>
);
