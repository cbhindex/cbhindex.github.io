(() => {
	const body = document.body;
	const header = document.getElementById('header');
	const nav = document.getElementById('nav');

	if (!body || !header || !nav) {
		return;
	}

	const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
	const sections = navLinks
		.map((link) => document.querySelector(link.getAttribute('href')))
		.filter((section) => section instanceof HTMLElement);
	const mobileViewport = window.matchMedia('(max-width: 960px)');

	const clearPreload = () => {
		window.setTimeout(() => {
			body.classList.remove('is-preload');
		}, 100);
	};

	if (document.readyState === 'complete') {
		clearPreload();
	} else {
		window.addEventListener('load', clearPreload, { once: true });
	}

	const headerToggle = document.createElement('div');
	headerToggle.id = 'headerToggle';
	headerToggle.innerHTML =
		'<button type="button" class="toggle" aria-controls="header" aria-expanded="false" aria-label="Open navigation"></button>';
	body.append(headerToggle);

	const toggleButton = headerToggle.querySelector('.toggle');

	const setHeaderVisibility = (isVisible) => {
		body.classList.toggle('header-visible', isVisible);

		if (toggleButton) {
			toggleButton.setAttribute('aria-expanded', String(isVisible));
			toggleButton.setAttribute('aria-label', isVisible ? 'Close navigation' : 'Open navigation');
		}
	};

	if (toggleButton) {
		toggleButton.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			setHeaderVisibility(!body.classList.contains('header-visible'));
		});
	}

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

	if (sections.length === 0) {
		return;
	}

	const activateLink = (id) => {
		navLinks.forEach((link) => {
			const isActive = link.getAttribute('href') === id;

			link.classList.toggle('active', isActive);

			if (isActive) {
				link.setAttribute('aria-current', 'page');
			} else {
				link.removeAttribute('aria-current');
			}
		});
	};

	const updateActiveLink = () => {
		const scrollMarker = window.scrollY + window.innerHeight * 0.35;
		let currentSection = sections[0];

		sections.forEach((section) => {
			if (section.offsetTop <= scrollMarker) {
				currentSection = section;
			}
		});

		activateLink(`#${currentSection.id}`);
	};

	let ticking = false;

	const requestActiveLinkUpdate = () => {
		if (ticking) {
			return;
		}

		ticking = true;
		window.requestAnimationFrame(() => {
			updateActiveLink();
			ticking = false;
		});
	};

	requestActiveLinkUpdate();
	window.addEventListener('scroll', requestActiveLinkUpdate, { passive: true });
	window.addEventListener('resize', requestActiveLinkUpdate);
	window.addEventListener('hashchange', requestActiveLinkUpdate);
})();
