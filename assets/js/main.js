(() => {
	const app = window.BHChaiSite || {};
	const initSequence = [app.initSiteHeader, app.initGalleryCarousels, app.initSectionNav];

	initSequence.forEach((initFn) => {
		if (typeof initFn === 'function') {
			initFn();
		}
	});
})();
