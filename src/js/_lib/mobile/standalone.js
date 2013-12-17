/*-------------------------------------------------------------------------------------*/
/* Don't open internal links in standalone iOS Mode in safari
 * prevents links from apps from oppening in mobile safari, this javascript must be the first script in your <head>
 */
(function (document, navigator, standalone) {
    'use strict';
    if ((typeof (navigator.standalone) !== 'undefined') && navigator.standalone) {
        var curnode, location = document.location, stop = /^(a|html)$/i;
        document.addEventListener('click', function (e) {
            curnode = e.target;
            while (!(stop).test(curnode.nodeName)) {
                curnode = curnode.parentNode;
            }
            // Condidions to do this only on links to your own app
            // if you want all links, use if('href' in curnode) instead.
            if ('href' in curnode && (curnode.href.indexOf('http') || ~curnode.href.indexOf(location.host))) {
                e.preventDefault();
                location.href = curnode.href;
            }
        }, false);
    }
}(document, window.navigator, 'standalone'));