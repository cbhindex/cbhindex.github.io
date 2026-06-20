(() => {
	const app = window.BHChaiSite || {};
	const initSequence = [
		app.initIntro,
		app.initSiteHeader,
		app.initGalleryCarousels,
		app.initSectionNav,
		app.initResearchDetails,
	];

	initSequence.forEach((initFn) => {
		if (typeof initFn === 'function') {
			initFn();
		}
	});
})();
