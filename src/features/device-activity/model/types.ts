export type ActivityLog = {
	id: string;
	user_id?: string;
	ip_address: string;
	browser: string;
	city: string;
	region: string;
	is_mobile: boolean;
	created_at: string;
};

export type DeviceData = {
	id?: string;
	ip: string;
	city: string;
	region?: string;
	isMobile: boolean;
	browser: string;
};

export type BrowserInfo = {
	browser: string;
	isPhone: boolean;
};
