import { IconMask } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

interface AuthSocialProps {
	isLoading: boolean;
	demoAuth?: () => void;
}

export const AuthSocial = ({ isLoading, demoAuth }: AuthSocialProps) => {
	return (
		<>
			{demoAuth && (
				<Tooltip className="w-full" content="Запустить демо-режим">
					<Button
						className="flex h-10 w-full gap-2 text-sm hover:text-(--accent-text) hover:opacity-100 md:text-base"
						loading={isLoading}
						variant="ghost"
						onClick={demoAuth}
					>
						Войти как гость <IconMask className="size-5" />
					</Button>
				</Tooltip>
			)}
		</>
	);
};
