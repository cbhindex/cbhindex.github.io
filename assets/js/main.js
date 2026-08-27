(() => {
	const app = window.BHChaiSite || {};
	const initSequence = [
		['intro', app.initIntro],
		['siteHeader', app.initSiteHeader],
		['galleryCarousels', app.initGalleryCarousels],
		['sectionNav', app.initSectionNav],
		['researchDetails', app.initResearchDetails],
	];

	/* Each module is isolated: one that throws must not take the rest of the
	   page down with it. This matters most for initIntro, which is what
	   removes the opacity:0 the content sections start at — but the same
	   argument applies to every module after it in the list. */
	initSequence.forEach(([name, initFn]) => {
		if (typeof initFn !== 'function') {
			return;
		}

		try {
			initFn();
		} catch (error) {
			if (window.console && window.console.error) {
				window.console.error(`BHChaiSite: ${name} failed to initialise.`, error);
			}
		}
	});
})();
