export type UserButton = {
	id: string;
	icon?: React.ReactElement;
	leftIcon?: React.ReactNode;
	to?: string;
	action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	label: React.ReactNode;
};
