import { Provider } from '@supabase/supabase-js';

import { IconGoogle } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import { supabase } from '../lib';

export const AuthSocial = () => {
	const onOAuthLogin = (provider: Provider) => {
		supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: `${window.location.origin}/auth/callback` },
		});
	};

	return (
		<div className="flex w-full flex-col gap-2">
			<Button className="flex h-10 gap-2" variant="ghost" onClick={() => onOAuthLogin('google')}>
				Продолжить с аккаунтом Google <IconGoogle className="size-5" />
			</Button>
		</div>
	);
};
