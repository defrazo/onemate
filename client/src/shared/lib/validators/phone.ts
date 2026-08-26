export const validatePhone = (phone: string): Promise<boolean> => {
	const digitsOnly = phone.replace(/[^\d]/g, '');

	if (digitsOnly.length < 10) {
		return Promise.reject(new Error('Номер телефона слишком короткий'));
	}

	const allowedPattern = /^[\d\s()+-]+$/;
	if (!allowedPattern.test(phone)) {
		return Promise.reject(new Error('Телефон может содержать только цифры, пробелы, скобки, дефисы и знак "+"'));
	}

	return Promise.resolve(true);
};
