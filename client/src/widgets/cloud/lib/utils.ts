export const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} Б`;

	const units = ['КБ', 'МБ', 'ГБ', 'ТБ'];
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1);

	return `${(bytes / 1024 ** (index + 1)).toFixed(1)} ${units[index]}`;
};

export const normalizePastedFiles = (files: File[]): File[] =>
	files.map((file) => {
		if (!file.type.startsWith('image/')) return file;

		const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';

		const name = `Screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;

		return new File([file], name, { type: file.type, lastModified: file.lastModified });
	});

export const getFileNameParts = (filename: string) => {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot <= 0) return { name: filename, extension: '' };

	return { name: filename.slice(0, lastDot), extension: filename.slice(lastDot) };
};
