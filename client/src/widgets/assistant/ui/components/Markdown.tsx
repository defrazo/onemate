import { createElement, memo, type ReactNode, useMemo } from 'react';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { createLowlight } from 'lowlight';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useCopy } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { safeMarkdownUrl } from '../../lib/markdown';

const lowlight = createLowlight({ javascript, typescript, json, python, bash, css, xml, sql, php });

/* prettier-ignore */
const allowedElements = [
	'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del', 'ul', 'ol', 'li', 
	'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'hr', 'input'
];

const remarkPlugins = [remarkGfm];

type HighlightNode = ReturnType<typeof lowlight.highlight>['children'][number];

const renderToken = (node: HighlightNode, index: number): ReactNode => {
	if (node.type === 'text') return node.value;
	if (node.type !== 'element') return null;

	const classes = node.properties.className;

	return createElement(
		'span',
		{ key: index, className: Array.isArray(classes) ? classes.join(' ') : undefined },
		node.children.map(renderToken)
	);
};

export const MarkdownBlock = memo(({ content }: { content: string }) => (
	<div className="assistant-markdown">
		<Markdown
			skipHtml
			allowedElements={allowedElements}
			components={{
				a: ({ href, children }) =>
					href ? (
						<a href={href} rel="noopener noreferrer" target="_blank">
							{children}
						</a>
					) : (
						<span>{children}</span>
					),

				img: () => null,

				table: ({ children }) => (
					<div
						className="assistant-table-scroll core-scrollbar focus-visible:ring-1 focus-visible:ring-(--accent-primary) focus-visible:outline-none"
						tabIndex={0}
					>
						<table>{children}</table>
					</div>
				),

				pre: ({ node }) => {
					const code = node?.children.find((child) => child.type === 'element' && child.tagName === 'code');
					if (!code || code.type !== 'element') return null;

					const text = code.children.map((child) => (child.type === 'text' ? child.value : '')).join('');

					const classes = code.properties.className;
					const language = Array.isArray(classes)
						? String(classes.find((name) => String(name).startsWith('language-')) ?? '').slice(9)
						: '';

					return <CodeBlock code={text} language={language} />;
				},
			}}
			remarkPlugins={remarkPlugins}
			urlTransform={safeMarkdownUrl}
		>
			{content}
		</Markdown>
	</div>
));

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
	const copy = useCopy();

	const highlighted = useMemo(() => {
		if (!language || !lowlight.registered(language)) return code;

		try {
			return lowlight.highlight(language, code).children.map(renderToken);
		} catch {
			return code;
		}
	}, [code, language]);

	return (
		<div className="assistant-code-block">
			<div className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-(--text-secondary)">
				<span className="truncate">{language || 'Код'}</span>
				<Button
					className="shrink-0 rounded-md text-xs"
					padding="xs"
					onClick={() => copy(code, 'Код скопирован')}
				>
					Копировать код
				</Button>
			</div>
			<pre className="core-scrollbar" tabIndex={0}>
				<code>{highlighted}</code>
			</pre>
		</div>
	);
};
