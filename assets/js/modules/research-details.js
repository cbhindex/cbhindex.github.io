(() => {
	const app = (window.BHChaiSite = window.BHChaiSite || {});
	let hasInitialised = false;

	const scrollSummaryIntoView = (summary) => {
		const targetTop = summary.getBoundingClientRect().top + window.scrollY - 16;

		window.scrollTo({
			top: Math.max(targetTop, 0),
			behavior: 'smooth',
		});
	};

	const addBottomCollapse = (details) => {
		const summary = details.querySelector('summary');
		const content = details.querySelector('.research-details-content');

		if (!summary || !content) {
			return;
		}

		const button = document.createElement('button');

		button.type = 'button';
		button.className = 'research-details-collapse';
		button.innerHTML =
			'<span class="details-collapse-icon" aria-hidden="true"></span>Hide details';

		button.addEventListener('click', () => {
			details.open = false;
			scrollSummaryIntoView(summary);

			if (typeof summary.focus === 'function') {
				summary.focus({ preventScroll: true });
			}
		});

		content.append(button);
	};

	app.initResearchDetails = () => {
		if (hasInitialised) {
			return;
		}

		hasInitialised = true;

		// Scoped to Research data panels only; intentionally excludes other
		// collapsibles such as the "Old News" year sections.
		const panels = Array.from(document.querySelectorAll('.research-details'));

		panels.forEach(addBottomCollapse);
	};
})();
