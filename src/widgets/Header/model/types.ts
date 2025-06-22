export type UserButton = {
	id: string;
	icon: React.ReactElement;
	to?: string;
	action: (e: React.MouseEvent<HTMLButtonElement>) => void;
	label: React.ReactNode;
};
