export const isActiveRoute = (pathname: string, to: string) => {
	if (to === '/') return pathname === '/';
	return pathname === to || pathname.startsWith(`${to}/`);
};
