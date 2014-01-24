/**
 * requestAnimationFrame polyfill
 *
 * modified and improved based on eric möllers work
 *
 * @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */

(function (window) {

	// local vars
    var lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'],
		vendorsLength = vendors.length,
		x;

	/**
	 * try to use browser prefixed version
	 */
    for (x = 0; x < vendorsLength && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

	/**
	 * fall back to standard timers
	 */
    if (!window.requestAnimationFrame) {

		window.isRequestAnimationFrameFallback = 1;

        window.requestAnimationFrame = function (callback, element) {

            var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
	}

    if (!window.cancelAnimationFrame) {

		window.isRequestAnimationFrameFallback = 1;

        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
	}

}(window));