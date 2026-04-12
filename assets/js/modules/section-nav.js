(() => {
	const app = (window.BHChaiSite = window.BHChaiSite || {});
	let hasInitialised = false;

	app.initSectionNav = () => {
		if (hasInitialised) {
			return;
		}

		const nav = document.getElementById('nav');

		if (!nav) {
			return;
		}

		const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
		const sections = navLinks
			.map((link) => document.querySelector(link.getAttribute('href')))
			.filter((section) => section instanceof HTMLElement);

		if (sections.length === 0) {
			return;
		}

		hasInitialised = true;

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
	};
})();
