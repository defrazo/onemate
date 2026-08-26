export const validateName = (name: string): Promise<boolean> => {
	if (name.trim().length < 2) return Promise.reject(new Error('Имя должно содержать минимум 2 символа'));

	if (/[^а-яёА-ЯЁa-zA-Z\s'-]/.test(name)) return Promise.reject(new Error('Имя содержит недопустимые символы'));

	return Promise.resolve(true);
};
