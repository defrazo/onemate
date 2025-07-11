import { Provider } from '@supabase/supabase-js';

import { IconGoogle } from '@/shared/assets/icons';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui';

export const AuthSocial = () => {
	const onOAuthLogin = (provider: Provider) => {
		supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: `${window.location.origin}/auth/callback` },
		});
	};

	return (
		<Button className="flex h-10 w-full gap-2" variant="ghost" onClick={() => onOAuthLogin('google')}>
			Продолжить с аккаунтом Google <IconGoogle className="size-5" />
		</Button>
	);
};
