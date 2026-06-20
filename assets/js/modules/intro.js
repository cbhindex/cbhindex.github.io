(() => {
	const app = (window.BHChaiSite = window.BHChaiSite || {});
	let hasInitialised = false;

	app.initIntro = () => {
		if (hasInitialised) {
			return;
		}
		hasInitialised = true;
		app.introReady = true;

		const sections = Array.from(document.querySelectorAll('.reveal-fade'));

		if (sections.length === 0) {
			return;
		}

		const prefersReducedMotion =
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Reduced motion or no observer support: just show the sections.
		if (prefersReducedMotion || !('IntersectionObserver' in window)) {
			sections.forEach((el) => el.classList.add('in'));
			return;
		}

		// Fade each section in when it enters the viewport, and reset it when it
		// leaves so the reveal replays on the way back. The transition lives on
		// .in (in the CSS), so removing it resets instantly while off-screen.
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					entry.target.classList.toggle('in', entry.isIntersecting);
				});
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0 }
		);

		// Reveal any section already in view immediately (the observer's first
		// callback can lag while the main thread is busy on load), then observe
		// all of them for scroll-driven reveal/replay.
		const viewportHeight =
			window.innerHeight || document.documentElement.clientHeight;
		sections.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.top < viewportHeight * 0.9 && rect.bottom > 0) {
				el.classList.add('in');
			}
			observer.observe(el);
		});
	};
})();
