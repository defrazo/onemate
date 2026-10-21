import {
	IconBraces,
	IconFile,
	IconFileCode,
	IconFileSpreadsheet,
	IconFileText,
	IconFileTypeDocx,
	IconFileTypePdf,
	IconFileZip,
	IconMusic,
	IconPalette,
	IconPhoto,
	IconPresentation,
	IconTerminal2,
	IconTypography,
	IconVideo,
} from '@tabler/icons-react';

const FILE_ICONS = {
	image: IconPhoto,
	document: IconFileTypeDocx,
	spreadsheet: IconFileSpreadsheet,
	presentation: IconPresentation,
	pdf: IconFileTypePdf,
	text: IconFileText,
	font: IconTypography,
	code: IconFileCode,
	data: IconBraces,
	archive: IconFileZip,
	audio: IconMusic,
	video: IconVideo,
	executable: IconTerminal2,
	design: IconPalette,
	default: IconFile,
};

type FileCategory = keyof typeof FILE_ICONS;

const FILE_EXTENSIONS: Partial<Record<Exclude<FileCategory, 'default'>, string[]>> = {
	image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'ico', 'tiff', 'heic'],
	document: ['doc', 'docx', 'odt', 'pages'],
	spreadsheet: ['xls', 'xlsx', 'ods', 'csv', 'tsv', 'numbers'],
	presentation: ['ppt', 'pptx', 'odp', 'key'],
	pdf: ['pdf'],
	text: ['txt', 'md', 'markdown', 'rtf', 'log'],
	font: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
	/* prettier-ignore */
	code: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
		'html', 'css', 'scss', 'sass', 'less',
		'php', 'py', 'go', 'rs', 'java', 'kt',
		'c', 'cpp', 'h', 'hpp', 'cs', 'swift',
		'vue', 'svelte', 'sql'],
	data: ['json', 'jsonl', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env'],
	archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'zst'],
	audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus'],
	video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'm4v'],
	executable: ['exe', 'msi', 'deb', 'rpm', 'apk', 'appimage', 'sh', 'bat', 'cmd', 'ps1'],
	design: ['psd', 'ai', 'eps', 'fig', 'sketch', 'blend', 'fbx', 'obj', 'stl'],
};

const EXTENSION_CATEGORY = new Map<string, FileCategory>(
	Object.entries(FILE_EXTENSIONS).flatMap(([category, extensions]) =>
		extensions.map((extension) => [extension, category as FileCategory])
	)
);

export const getFileIcon = (filename: string) => {
	const extension = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : undefined;
	const category = extension ? EXTENSION_CATEGORY.get(extension) : undefined;

	return FILE_ICONS[category ?? 'default'];
};
