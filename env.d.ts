interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_ANON_KEY: string;
	readonly VITE_IPINFO_API_KEY: string;
	readonly VITE_MYMEMORY_API_KEY: string;
	readonly VITE_OPENWEATHER_API_KEY: string;
	readonly VITE_ALLOWED_EMAILS: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
