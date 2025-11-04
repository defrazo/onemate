import { IconGoogle, IconMask } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

interface AuthSocialProps {
	isLoading: boolean;
	oAuth: () => void;
	demoAuth?: () => void;
}

export const AuthSocial = ({ isLoading, oAuth, demoAuth }: AuthSocialProps) => {
	return (
		<>
			<Tooltip className="w-full" content="Доступно только для разработчика">
				<Button
					className="flex h-10 w-full gap-2 text-sm hover:text-(--accent-text) md:text-base"
					loading={isLoading}
					variant="ghost"
					onClick={oAuth}
				>
					Продолжить с аккаунтом Google <IconGoogle className="size-5" />
				</Button>
			</Tooltip>
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
