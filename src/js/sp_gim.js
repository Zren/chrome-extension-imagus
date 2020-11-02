(function() {
	// Invokes a mousedown event on each thumbnail on Google Images,
	// since "href" on links are filled only after the user clicks on them
	var timer = null;

	var queue = [].slice.call(
		document.body.querySelectorAll(
			'a[jsname][jsaction] > div[jsaction^=mousedown]'
		)
	);

	if ( !queue.length ) {
		return;
	}

	var mdEvent = new MouseEvent('mousedown', {bubbles: true});

	var next = function() {
		cancelAnimationFrame(timer);

		if ( !queue.length ) {
			return;
		}

		queue.shift().dispatchEvent(mdEvent);

		if ( queue.length ) {
			timer = requestAnimationFrame(next);
		}
	};

	var thumbs = queue[0].closest('div[id] > div[jsname][class]:first-child');
	var related = thumbs.closest('div[id][jsname]').nextElementSibling.lastElementChild;

	var mutObs = new MutationObserver(function(mutations) {
		for ( var i = 0; i < mutations.length; ++i ) {
			var added = mutations[i].addedNodes;

			if ( !added.length ) {
				continue;
			}

			if ( mutations[i].target === thumbs ) {
				queue.push(added[0].querySelector('img'));
				continue;
			}

			setTimeout(function() {
				[].push.apply(queue, added[0].querySelectorAll('a>div>img'));
				next();
			}, 500);
			return;
		}

		next();
	});

	mutObs.observe(thumbs, {childList: true});
	mutObs.observe(related, {childList: true});
	next();
})();
