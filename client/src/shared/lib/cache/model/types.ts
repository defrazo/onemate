export type CacheSection = Record<string, unknown>;

export type Cache = {
	ts: number;
	ui?: CacheSection;
};

export type CachePatch = {
	ui?: CacheSection;
};
