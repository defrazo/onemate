(function () {
	const KEY = 'onemate_cache_ui';
	const root = document.documentElement;

	function applyTheme(theme) {
		root.classList.remove('light-theme', 'dark-theme');
		root.classList.add(theme + '-theme');
		root.style.colorScheme = theme;
	}

	try {
		const saved = JSON.parse(localStorage.getItem(KEY))?.theme;
		var theme = saved === 'light' || saved === 'dark' ? saved : DEFAULT;

		applyTheme(theme);

		window.addEventListener('storage', function (event) {
			if (event.key !== KEY || !event.newValue) return;

			try {
				var theme = JSON.parse(event.newValue).theme;
				if (theme === 'light' || theme === 'dark') applyTheme(theme);
			} catch {}
		});
	} catch {}
})();
