/* prettier-ignore */
export type WeatherCode =
	| '01d' | '01n'
	| '02d' | '02n'
	| '03d' | '03n'
	| '04d' | '04n'
	| '09d' | '09n'
	| '10d' | '10n'
	| '11d' | '11n'
	| '13d' | '13n'
	| '50d' | '50n';

export type ForecastApiItem = {
	dt: number;
	main: WeatherMain;
	weather: WeatherDescription[];
	wind: WeatherWind;
	clouds: { all: number };
	dt_txt: string;
};

export type WeatherData = {
	name: string;
	main: WeatherMain;
	wind: WeatherWind;
	clouds: { all: number };
	sys: { sunrise: number; sunset: number };
	weather: WeatherDescription[];
};

export type ForecastItem = {
	date: string;
	day: string;
	minTemp: number;
	maxTemp: number;
	description: string;
	icon: string;
};

type WeatherMain = {
	temp: number;
	feels_like: number;
	temp_min: number;
	temp_max: number;
	humidity: number;
	pressure: number;
};

type WeatherWind = {
	speed: number;
	deg: number;
};

type WeatherDescription = {
	description: string;
	icon: string;
};
