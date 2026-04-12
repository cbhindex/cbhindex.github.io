(() => {
	const app = (window.BHChaiSite = window.BHChaiSite || {});
	let hasInitialised = false;

	const cloneCard = (card) => {
		const clone = card.cloneNode(true);

		clone.dataset.galleryClone = 'true';
		clone.setAttribute('aria-hidden', 'true');
		clone.querySelectorAll('img').forEach((image) => {
			image.draggable = false;
		});
		clone.querySelectorAll('a, button, input, select, textarea').forEach((element) => {
			element.setAttribute('tabindex', '-1');
			element.setAttribute('aria-hidden', 'true');
		});

		return clone;
	};

	const assignCardAspect = (card) => {
		const image = card.querySelector('img');
		const width = Number(image && image.getAttribute('width'));
		const height = Number(image && image.getAttribute('height'));

		if (width > 0 && height > 0) {
			card.style.setProperty('--gallery-card-aspect', String(width / height));
		}
	};

	const markImagesUndraggable = (card) => {
		card.querySelectorAll('img').forEach((image) => {
			image.draggable = false;
		});
	};

	const initSingleCarousel = (carousel, index) => {
		const viewport = carousel.querySelector('[data-gallery-viewport]');
		const track = carousel.querySelector('[data-gallery-track]');
		const prevButton = carousel.querySelector('[data-gallery-prev]');
		const nextButton = carousel.querySelector('[data-gallery-next]');
		const originalCards = viewport && track ? Array.from(track.children) : [];

		if (!viewport || !track || originalCards.length === 0) {
			return;
		}

		if (!viewport.id) {
			viewport.id = `gallery-carousel-viewport-${index + 1}`;
		}

		if (prevButton) {
			prevButton.setAttribute('aria-controls', viewport.id);
		}

		if (nextButton) {
			nextButton.setAttribute('aria-controls', viewport.id);
		}

		originalCards.forEach((card) => {
			assignCardAspect(card);
			markImagesUndraggable(card);
		});

		const prependClones = originalCards.map(cloneCard);
		const appendClones = originalCards.map(cloneCard);

		for (let cloneIndex = prependClones.length - 1; cloneIndex >= 0; cloneIndex -= 1) {
			track.prepend(prependClones[cloneIndex]);
		}

		appendClones.forEach((clone) => {
			track.append(clone);
		});

		let loopStart = 0;
		let loopWidth = 0;
		let hasMeasured = false;
		let autoFrame = 0;
		let autoRunning = false;
		let lastAutoTick = 0;
		let resumeTimer = 0;
		let scrollIdleTimer = 0;
		let isDragging = false;
		let dragPointerId = null;
		let dragStartX = 0;
		let dragStartScrollLeft = 0;
		let dragDistance = 0;
		let suppressClick = false;

		const getAutoSpeed = () => (window.innerWidth <= 736 ? 34 : 46);
		const getScrollStep = () => Math.max(viewport.clientWidth * 0.72, 240);
		const hasValidLoop = () => Number.isFinite(loopStart) && Number.isFinite(loopWidth) && loopWidth > 1;

		const updateUniformCardHeight = () => {
			carousel.style.removeProperty('--gallery-card-uniform-height');

			const tallestCard = originalCards.reduce((maxHeight, card) => {
				const cardHeight = Math.ceil(card.getBoundingClientRect().height);

				return Math.max(maxHeight, cardHeight);
			}, 0);

			if (tallestCard > 0) {
				carousel.style.setProperty('--gallery-card-uniform-height', `${tallestCard}px`);
			}
		};

		const clearResumeTimer = () => {
			if (resumeTimer) {
				window.clearTimeout(resumeTimer);
				resumeTimer = 0;
			}
		};

		const clearScrollIdleTimer = () => {
			if (scrollIdleTimer) {
				window.clearTimeout(scrollIdleTimer);
				scrollIdleTimer = 0;
			}
		};

		const normalizeLoopPosition = () => {
			if (!hasMeasured || !hasValidLoop()) {
				return 0;
			}

			let adjustment = 0;

			while (viewport.scrollLeft < loopStart) {
				viewport.scrollLeft += loopWidth;
				adjustment += loopWidth;
			}

			while (viewport.scrollLeft >= loopStart + loopWidth) {
				viewport.scrollLeft -= loopWidth;
				adjustment -= loopWidth;
			}

			return adjustment;
		};

		const measure = () => {
			updateUniformCardHeight();

			const totalTrackWidth = track.scrollWidth;
			const previousLoopWidth = loopWidth;
			const offsetWithinLoop =
				hasMeasured && previousLoopWidth > 0
					? (((viewport.scrollLeft - loopStart) % previousLoopWidth) + previousLoopWidth) % previousLoopWidth
					: 0;

			if (!Number.isFinite(totalTrackWidth) || totalTrackWidth <= 0) {
				return;
			}

			loopWidth = totalTrackWidth / 3;
			loopStart = loopWidth;

			if (!hasValidLoop()) {
				hasMeasured = false;
				return;
			}

			viewport.scrollLeft = loopStart + (hasMeasured ? offsetWithinLoop : 0);
			normalizeLoopPosition();
			hasMeasured = true;
		};

		originalCards.forEach((card) => {
			const image = card.querySelector('img');

			if (image && !image.complete) {
				image.addEventListener('load', measure, { once: true });
			}
		});

		const stopAutoplay = () => {
			if (autoFrame) {
				window.cancelAnimationFrame(autoFrame);
				autoFrame = 0;
			}

			autoRunning = false;
			lastAutoTick = 0;
		};

		const autoplayTick = (timestamp) => {
			if (!autoRunning) {
				return;
			}

			if (!lastAutoTick) {
				lastAutoTick = timestamp;
			}

			const deltaSeconds = Math.min((timestamp - lastAutoTick) / 1000, 0.05);
			lastAutoTick = timestamp;
			viewport.scrollLeft += getAutoSpeed() * deltaSeconds;
			normalizeLoopPosition();
			autoFrame = window.requestAnimationFrame(autoplayTick);
		};

		const startAutoplay = () => {
			if (autoRunning || !hasMeasured || !hasValidLoop()) {
				return;
			}

			autoRunning = true;
			lastAutoTick = 0;
			autoFrame = window.requestAnimationFrame(autoplayTick);
		};

		const pauseAutoplay = () => {
			clearResumeTimer();
			clearScrollIdleTimer();
			stopAutoplay();
		};

		const scheduleAutoplayResume = () => {
			clearResumeTimer();
			resumeTimer = window.setTimeout(() => {
				if (!isDragging) {
					startAutoplay();
				}
			}, 2000);
		};

		const scheduleResumeAfterScrollIdle = () => {
			clearScrollIdleTimer();
			scrollIdleTimer = window.setTimeout(() => {
				normalizeLoopPosition();
				scheduleAutoplayResume();
			}, 140);
		};

		const moveByStep = (direction) => {
			pauseAutoplay();
			viewport.scrollBy({ left: direction * getScrollStep(), behavior: 'smooth' });
			scheduleResumeAfterScrollIdle();
		};

		const endDrag = () => {
			if (!isDragging) {
				return;
			}

			isDragging = false;
			dragPointerId = null;
			carousel.classList.remove('is-dragging');
			normalizeLoopPosition();
			scheduleAutoplayResume();
		};

		viewport.addEventListener('pointerdown', (event) => {
			if (event.pointerType === 'touch' || event.button !== 0) {
				return;
			}

			isDragging = true;
			dragPointerId = event.pointerId;
			dragStartX = event.clientX;
			dragStartScrollLeft = viewport.scrollLeft;
			dragDistance = 0;
			suppressClick = false;
			carousel.classList.add('is-dragging');
			pauseAutoplay();

			if (typeof viewport.setPointerCapture === 'function') {
				viewport.setPointerCapture(event.pointerId);
			}

			event.preventDefault();
		});

		viewport.addEventListener('pointermove', (event) => {
			if (!isDragging || event.pointerId !== dragPointerId) {
				return;
			}

			const deltaX = event.clientX - dragStartX;

			dragDistance = Math.max(dragDistance, Math.abs(deltaX));
			viewport.scrollLeft = dragStartScrollLeft - deltaX;
			dragStartScrollLeft += normalizeLoopPosition();

			if (dragDistance > 6) {
				suppressClick = true;
			}
		});

		const releasePointer = (event) => {
			if (!isDragging || event.pointerId !== dragPointerId) {
				return;
			}

			if (
				typeof viewport.releasePointerCapture === 'function' &&
				typeof viewport.hasPointerCapture === 'function' &&
				viewport.hasPointerCapture(event.pointerId)
			) {
				viewport.releasePointerCapture(event.pointerId);
			}

			endDrag();
		};

		viewport.addEventListener('pointerup', releasePointer);
		viewport.addEventListener('pointercancel', releasePointer);
		viewport.addEventListener('pointerleave', (event) => {
			if (event.pointerType === 'mouse') {
				releasePointer(event);
			}
		});

		viewport.addEventListener(
			'click',
			(event) => {
				if (!suppressClick) {
					return;
				}

				suppressClick = false;
				event.preventDefault();
				event.stopPropagation();
			},
			true
		);

		viewport.addEventListener(
			'wheel',
			() => {
				pauseAutoplay();
				scheduleResumeAfterScrollIdle();
			},
			{ passive: true }
		);

		viewport.addEventListener(
			'touchstart',
			() => {
				pauseAutoplay();
			},
			{ passive: true }
		);

		viewport.addEventListener(
			'scroll',
			() => {
				if (autoRunning || isDragging) {
					return;
				}

				pauseAutoplay();
				scheduleResumeAfterScrollIdle();
			},
			{ passive: true }
		);

		viewport.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				moveByStep(-1);
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				moveByStep(1);
			}
		});

		if (prevButton) {
			prevButton.addEventListener('click', () => {
				moveByStep(-1);
			});
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => {
				moveByStep(1);
			});
		}

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				pauseAutoplay();
			} else {
				scheduleAutoplayResume();
			}
		});

		window.addEventListener('resize', measure);
		window.addEventListener(
			'load',
			() => {
				window.requestAnimationFrame(measure);
			},
			{ once: true }
		);

		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				measure();
			});
		}

		measure();
		startAutoplay();
	};

	app.initGalleryCarousels = () => {
		if (hasInitialised) {
			return;
		}

		hasInitialised = true;

		const carousels = Array.from(document.querySelectorAll('[data-gallery-carousel]'));

		carousels.forEach((carousel, index) => {
			initSingleCarousel(carousel, index);
		});
	};
})();
