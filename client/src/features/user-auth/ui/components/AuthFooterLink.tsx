import { Button } from '@/shared/ui';

interface AuthFooterLinkProps {
	text?: string;
	linkText: string;
	action: () => void;
}

export const AuthFooterLink = ({ text, linkText, action }: AuthFooterLinkProps) => {
	return (
		<div className="flex items-center justify-center gap-1.5 font-semibold opacity-70 transition-opacity select-none hover:opacity-100">
			{text}
			<Button
				className="text-(--accent-primary) hover:text-(--accent-primary-hover)"
				padding="none"
				variant="custom"
				onClick={action}
			>
				{linkText}
			</Button>
		</div>
	);
};
