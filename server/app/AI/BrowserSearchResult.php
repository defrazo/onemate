<?php

namespace App\AI;

final class BrowserSearchResult
{
    private const MAX_TOOLS = 100;

    private const MAX_RESULTS = 100;

    private const MAX_SOURCES = 20;

    private const MAX_URL_LENGTH = 2048;

    private const MAX_TITLE_LENGTH = 200;

    public static function parse(mixed $tools): array
    {
        $executed = false;
        $sources = [];

        foreach (array_slice(is_array($tools) ? $tools : [], 0, self::MAX_TOOLS) as $tool) {
            if (!self::isBrowserTool($tool)) {
                continue;
            }

            $executed = true;
            $results = $tool['search_results']['results'] ?? [];

            foreach (array_slice(is_array($results) ? $results : [], 0, self::MAX_RESULTS) as $result) {
                $source = self::parseSource($result);

                if ($source === null || isset($sources[$source['url']])) {
                    continue;
                }

                $sources[$source['url']] = $source;

                if (count($sources) >= self::MAX_SOURCES) {
                    return [$executed, array_values($sources)];
                }
            }
        }

        return [$executed, array_values($sources)];
    }

    private static function isBrowserTool(mixed $tool): bool
    {
        return is_array($tool)
            && in_array($tool['name'] ?? null, ['browser.search', 'browser.open'], true)
            && in_array($tool['type'] ?? null, ['browser_search', 'browser.open'], true);
    }

    private static function parseSource(mixed $result): ?array
    {
        if (!is_array($result)) {
            return null;
        }

        $url = self::normalizeUrl($result['url'] ?? null);

        if ($url === null) {
            return null;
        }

        $host = parse_url($url, PHP_URL_HOST);

        $title = is_string($result['title'] ?? null)
            ? $result['title']
            : $host;

        $title = trim(preg_replace('/[\x00-\x1f\x7f]/', ' ', strip_tags($title)));

        return [
            'url' => $url,
            'title' => mb_substr($title ?: $host, 0, self::MAX_TITLE_LENGTH),
            'domain' => $host,
        ];
    }

    private static function normalizeUrl(mixed $url): ?string
    {
        if (
            !is_string($url)
            || strlen($url) > self::MAX_URL_LENGTH
            || preg_match('/[\x00-\x20\x7f]/', $url)
            || !filter_var($url, FILTER_VALIDATE_URL)
        ) {
            return null;
        }

        $parts = parse_url($url);

        if (!is_array($parts) || empty($parts['host'])) {
            return null;
        }

        $scheme = strtolower($parts['scheme'] ?? '');

        if (
            !in_array($scheme, ['http', 'https'], true)
            || isset($parts['user'])
            || isset($parts['pass'])
        ) {
            return null;
        }

        $host = strtolower($parts['host']);
        $port = $parts['port'] ?? null;

        $defaultPort = ($scheme === 'https' && $port === 443)
            || ($scheme === 'http' && $port === 80);

        return $scheme . '://' . $host
            . ($port !== null && !$defaultPort ? ':' . $port : '')
            . ($parts['path'] ?? '/')
            . (isset($parts['query']) ? '?' . $parts['query'] : '');
    }
}
