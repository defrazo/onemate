export const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
	<details className="core-border px-3 py-2 transition-colors hover:border-(--accent-hover)">
		<summary className="cursor-pointer font-medium">{question}</summary>
		<p className="mt-2 text-sm">{answer}</p>
	</details>
);
