export const validateEmail = (email: string): Promise<boolean> => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
	if (!emailRegex.test(email)) return Promise.reject(new Error('Некорректный формат e-mail'));

	const [name, domain] = email.split('@');
	if (!name || name.length < 2) return Promise.reject(new Error('Имя пользователя в e-mail слишком короткое'));

	const domainParts = domain.split('.');
	const sld = domainParts[0];
	const tld = domainParts[domainParts.length - 1];

	if (!sld || sld.length < 2) return Promise.reject(new Error('Домен в e-mail слишком короткий'));

	if (!tld || tld.length < 2) return Promise.reject(new Error('Некорректное окончание домена'));

	return Promise.resolve(true);
};
