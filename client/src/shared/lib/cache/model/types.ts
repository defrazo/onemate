export type CacheSection = Record<string, unknown>;

export type Cache = {
	ts: number;
	ui?: CacheSection;
	auth?: CacheSection;
};

export type CachePatch = {
	ui?: CacheSection;
	auth?: CacheSection;
};
