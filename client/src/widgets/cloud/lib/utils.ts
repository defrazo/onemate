export const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} Б`;

	const units = ['КБ', 'МБ', 'ГБ', 'ТБ'];
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1);

	const size = bytes / 1024 ** (index + 1);

	return `${Number(size.toFixed(1)).toLocaleString('ru-RU')} ${units[index]}`;
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

export const formatUploadSpeed = (bytesPerSecond: number) => {
	if (!bytesPerSecond) return '–';

	return `${formatFileSize(bytesPerSecond)}/с`;
};

export const formatRemainingTime = (seconds: number | null) => {
	if (seconds === null || !Number.isFinite(seconds)) return '–';

	const total = Math.max(0, Math.ceil(seconds));
	const minutes = Math.floor(total / 60);
	const remainingSeconds = total % 60;

	if (minutes === 0) return `${remainingSeconds} сек`;
	if (minutes < 60) return `${minutes} мин ${remainingSeconds} сек`;

	const hours = Math.floor(minutes / 60);

	return `${hours} ч ${minutes % 60} мин`;
};
