import { Link } from 'react-router-dom';

interface AuthFooterLinkProps {
	text: string;
	linkText: string;
	to: string;
}

export const AuthFooterLink = ({ text, linkText, to }: AuthFooterLinkProps) => {
	return (
		<div className="opacity-70 transition-opacity select-none hover:opacity-100">
			{text}{' '}
			<Link
				className="cursor-pointer font-semibold text-(--accent-primary) transition-colors hover:text-(--accent-primary-hover)"
				to={to}
			>
				{linkText}
			</Link>
		</div>
	);
};
