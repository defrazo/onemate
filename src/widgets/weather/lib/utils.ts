export const getWindDirection = (deg: number): string => {
	const index = Math.floor(((deg + 22.5) % 360) / 45);
	const directions = [
		'Северный',
		'Северо-восточный',
		'Восточный',
		'Юго-восточный',
		'Южный',
		'Юго-западный',
		'Западный',
		'Северо-западный',
	];

	return directions[index];
};
