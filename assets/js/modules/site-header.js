(() => {
	const app = (window.BHChaiSite = window.BHChaiSite || {});
	let hasInitialised = false;

	const initHeaderToggle = (body, header, nav) => {
		const mobileViewport = window.matchMedia('(max-width: 960px)');
		let headerToggle = document.getElementById('headerToggle');

		if (!headerToggle) {
			headerToggle = document.createElement('div');
			headerToggle.id = 'headerToggle';
			headerToggle.innerHTML =
				'<button type="button" class="toggle" aria-controls="header" aria-expanded="false" aria-label="Open navigation"></button>';
			// First in the DOM, so the hamburger is the first tab stop rather than
			// the very last element on the page.
			body.prepend(headerToggle);
		}

		const toggleButton = headerToggle.querySelector('.toggle');

		if (!toggleButton) {
			return;
		}

		const setHeaderVisibility = (isVisible) => {
			// The header becomes visibility:hidden when closed (layout.css), so focus
			// must not be left inside it — hand it back to the button that closed it.
			if (!isVisible && header.contains(document.activeElement)) {
				toggleButton.focus();
			}

			body.classList.toggle('header-visible', isVisible);
			toggleButton.setAttribute('aria-expanded', String(isVisible));
			toggleButton.setAttribute('aria-label', isVisible ? 'Close navigation' : 'Open navigation');
		};

		toggleButton.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			setHeaderVisibility(!body.classList.contains('header-visible'));
		});

		header.addEventListener('click', (event) => {
			const link = event.target.closest('a[href]');

			if (link && mobileViewport.matches) {
				setHeaderVisibility(false);
			}
		});

		document.addEventListener('click', (event) => {
			if (!body.classList.contains('header-visible')) {
				return;
			}

			if (header.contains(event.target) || headerToggle.contains(event.target)) {
				return;
			}

			setHeaderVisibility(false);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				setHeaderVisibility(false);
			}
		});

		const handleViewportChange = (event) => {
			if (!event.matches) {
				setHeaderVisibility(false);
			}
		};

		if (typeof mobileViewport.addEventListener === 'function') {
			mobileViewport.addEventListener('change', handleViewportChange);
		} else if (typeof mobileViewport.addListener === 'function') {
			mobileViewport.addListener(handleViewportChange);
		}
	};

	app.initSiteHeader = () => {
		if (hasInitialised) {
			return;
		}

		hasInitialised = true;

		const body = document.body;

		if (!body) {
			return;
		}

		const header = document.getElementById('header');
		const nav = document.getElementById('nav');

		if (!header || !nav) {
			return;
		}

		initHeaderToggle(body, header, nav);
	};
})();
