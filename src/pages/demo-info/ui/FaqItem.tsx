interface FaqItemProps {
	question: string;
	answer: string;
}

export const FaqItem = ({ question, answer }: FaqItemProps) => (
	<details className="core-border px-3 py-2 transition-colors hover:border-[var(--accent-hover)]">
		<summary className="cursor-pointer font-medium">{question}</summary>
		<p className="mt-2 text-sm">{answer}</p>
	</details>
);
