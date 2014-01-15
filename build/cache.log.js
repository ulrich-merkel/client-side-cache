(function(d,r){function k(){d[e]||(d[e]={});return d[e]}var e="app",f;f=k();f.namespace=function(f,k){if(f){f=String(f);var l=f.split("."),s=l.length,r=d[e],p;r||(d[e]={});if(!l)return!1;for(p=0;p<s;p+=1)r[l[p]]||(r[l[p]]={},p===s-1&&k&&(r[l[p]]=k)),r=r[l[p]];return r}return!1};d[e]=f;d.getNamespace=d.getNs=k})(window);
(function(d,r){function k(){if(!(this instanceof k))return new k;this.methods=[];this.response=null;this.flushed=!1}k.prototype=k.fn={add:function(d){this.flushed?d(this.response):this.methods.push(d)},flush:function(d){if(!this.flushed)for(this.response=d,this.flushed=!0;this.methods[0];)this.methods.shift()(d)}};d.namespace("helpers.queue",k)})(window.getNs());
(function(d,r,k,e){var f=function(){var k=null,n=d.console!==e,l=n?d.console:null,s=n&&l.log!==e,u=n&&l.warn!==e,p=n&&l.time!==e&&l.timeEnd!==e,t=[];return{isString:function(b){return"string"===typeof b||b instanceof String},isFunction:function(b){return"function"===typeof b||b instanceof Function},isArray:function(b){var a=Array.isArray,c=Object.prototype.toString;f.isArray=a&&"function"===typeof a?function(c){return a(c)}:c&&"function"===c?function(a){return"[object Array]"===c.call(a)}:function(a){return!!a.sort&&
"function"===typeof a.sort};return f.isArray(b)},inArray:function(b,a,c){f.inArray=Array.prototype.indexOf?function(a,c,b){return t.indexOf.call(c,a,b)}:function(a,c,b){var d=c.length,e=0;if(b)return c[b]&&c[b]===a?b:-1;for(e=0;e<d;e+=1)if(c[e]===a)return e;return-1};return f.inArray(b,a,c)},callback:function(b){f.isFunction(b)||(b=function(){});return b},on:function(b,a,c){f.on="function"===typeof d.addEventListener?function(a,c,b){a.addEventListener(c,b,!1)}:"function"===typeof r.attachEvent?function(a,
c,b){a.attachEvent("on"+c,b)}:function(a,c,b){a["on"+c]=b};f.on(b,a,c)},off:function(b,a,c){f.off="function"===typeof d.removeEventListener?function(a,c,b){a.removeEventListener(c,b,!1)}:"function"===typeof r.detachEvent?function(a,c,b){a.detachEvent("on"+c,b)}:function(a,c){a["on"+c]=null};f.off(b,a,c)},getXhr:function(){for(var b=null,a=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],
c=a.length,m=0,m=0;m<c;m+=1){try{b=a[m]()}catch(g){continue}break}return b},xhr:function(b,a,c,m){var g=f.getXhr(),h,d="GET";a=f.callback(a);if(g)if(b){m!==e?d="POST":m=null;c===e&&(c=!0);h=function(){if(4===g.readyState&&(200<=g.status&&400>g.status||0===g.status))try{var c=g.responseText;c?a(c):a(!1)}catch(b){a(!1)}else 4===g.readyState&&a(!1)};g.open(d,b,c);try{g.onreadystatechange!==e?g.onreadystatechange=h:g.onload!==e&&(g.onload=h)}catch(p){g.onload=null,g.onload=h}g.send(m)}else a(!1);else a(!1)},
getJson:function(){null===k&&(d.JSON&&d.JSON.stringify)&&(k=d.JSON);return k},jsonToString:function(b){var a=!1;null===k&&(k=f.getJson());k&&b&&(a=k.stringify(b));return a},jsonToObject:function(b){var a=!1;null===k&&(k=f.getJson());k&&b&&(a=k.parse(b));return a},logToScreen:function(b){var a=r.getElementById("log"),c=r.createElement("p");b=r.createTextNode(b);a&&(c.appendChild(b),a.appendChild(c))},log:function(){var b=arguments;b.length&&(s&&l.log.apply(l,b),b=b[0],f.logToScreen(b))},warn:function(){var b=
arguments,a;b.length&&(a=b[0],u?l.warn.apply(l,b):f.log(a),f.logToScreen(a))},logTimerStart:function(b){p&&d.console.time(b)},logTimerEnd:function(b){p&&d.console.timeEnd(b)},url:function(b){if(f.isString(b)){var a=r.createElement("a"),c;a.href=b;c=a.pathname.match(/\/([^\/?#]+)$/i);return{source:b,protocol:a.protocol,host:a.hostname,port:a.port,query:a.search,file:c?c[1]:"/",hash:a.hash,path:a.pathname.replace(/^([^\/])/,"/$1"),extension:function(a){a=a.split(".");return a.length?a[a.length-1]:!1}(b),
folder:function(){var a=b.lastIndexOf("/");return b.substr(0,a+1)}()}}},queryString:function(b){b={};for(var a=d.location.search.substring(1).split("&"),c=a.length,m=0,g,h,m=0;m<c;m+=1)g=a[m].split("="),b[g[0]]===e?b[g[0]]=g[1]:"string"===typeof b[g[0]]?(h=[b[g[0]],g[1]],b[g[0]]=h):b[g[0]].push(g[1]);return b}(),sprintf:function(b){var a=1,c=arguments;return b.replace(/%s/g,function(){return a<c.length?c[a++]:""})},trim:function(b){if(!f.isString(b))return b;f.isFunction(String.prototype.trim)||(String.prototype.trim=
function(){return this.replace(/^\s+|\s+$/g,"")});return b.trim()}}}();k.namespace("helpers.utils",f)})(window,document,window.getNs());
(function(d,r,k,e){var f=function(){function f(){switch(parseInt(d.orientation,10)){case 0:G=K;break;case 180:G=K;break;case 90:G=z;break;case -90:G=z}}function n(){L||(I(d,"orientationchange",f),L=!0)}function l(){(p=null!==v.match(/(iphone|ipod|ipad)/))&&n()}function s(){y===e&&(I(d,"online",s),I(d,"offline",s));y=r.onLine!==e?!!r.onLine:!0}function u(){var a=r.connection||r.mozConnection||r.webkitConnection||{type:0,UNKNOWN:0,ETHERNET:1,WIFI:2,CELL_2G:3,CELL_3G:4},c=function(){A=a};a.onchange=
c;c()}var p,t,b,a,c,m,g,h,H,B,F,D,w,E,C,x,y,A,z="landscapeMode",K="portraitMode",G,J,M,L,N=r.userAgent||r.vendor||d.opera,v=N.toLowerCase(),I=k.helpers.utils.on;return{isiOS:function(){p===e&&l();return p},isWebkit:function(){t===e&&(t=null!==v.match(/(webkit)/));return t},isAndroid:function(){b===e&&(b=null!==v.match(/(android)/))&&n();return b},isBlackberry:function(){a===e&&(a=null!==v.match(/(blackberry)/))&&n();return a},isChrome:function(){m===e&&(m=null!==v.match(/(chrome)/));return m},isOpera:function(){c===
e&&(c=null!==v.match(/(opera)/));return c},isSafari:function(){g===e&&(g=null!==v.match(/(safari)/));return g},isFirefox:function(){h===e&&(h=null!==v.match(/(firefox)/));return h},isSeamonkey:function(){H===e&&(H=null!==v.match(/(seamonkey)/));return H},isCamino:function(){B===e&&(B=null!==v.match(/(camino)/));return B},isMsie:function(){F===e&&(F=null!==v.match(/(msie)/));return F},isiPad:function(){D===e&&(D=null!==v.match(/(ipad)/))&&n();return D},isiPhone:function(){w===e&&(w=null!==v.match(/(iphone)/))&&
n();return w},isMobile:function(){E===e&&(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(v)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(v.substr(0,
4))?(E=!0,n()):E=!1);return E},getBrowserVersion:function(){if(C===e){var a,c;(c=v.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i))&&null!==(a=N.match(/version\/([\.\d]+)/i))&&(c[2]=a[1]);C=c?c[2]:r.appVersion}return C},getiOSVersion:function(){if(x===e&&(p===e&&l(),p)){var a=r.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);x=[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3]||0,10)]}return x},isOnline:function(){y===e&&s();return y},getNetworkConnection:function(){A===e&&u();return A},
isStandalone:function(){return r.standalone!==e&&r.standalone},isTouchDevice:function(){return!!d.ontouchstart||d.navigator.msMaxTouchPoints},orientation:function(){return d.orientation?d.orientation:0},orientationMode:function(){G===e&&f();return G},hasRetinaDisplay:function(){return 2<=d.devicePixelRatio},hideStatusbar:function(a){a||(a=0);d.clearTimeout(M);M=d.setTimeout(function(){0===parseInt(d.pageYOffset,10)&&d.scrollTo(0,1)},a)},hasCanvas:function(){if(J===e){var a=document.createElement("canvas");
J=!(!a.getContext||!a.getContext("2d"))}return J}}}();k.namespace("helpers.client",f)})(window,window.navigator,window.getNs());
(function(d,r,k){function e(e,f){f&&(f.dom?e=f.dom:f.id&&(e=d.getElementById(f.id)));return e}var f=function(){var q=r.helpers,n=q.utils,l=q.client,s=[],u=[],p=[],t=[],b=d.getElementsByTagName("head")[0];return{nuke:function(){s=[];u=[];p=[];t=[]},createDomNode:function(a,c){var b=d.createElement(a),g;if(c)for(g in c)c.hasOwnProperty(g)&&b.setAttribute(g,c[g]);return b},hasClass:function(a,c){return RegExp(" "+c+" ").test(" "+a.className+" ")},getAttribute:function(a,c){return a.getAttribute(c)},
setAttribute:function(a,c,b){a.setAttribute(c,b)},appendCss:function(a,c,m,g,h){if(-1===n.inArray(a,s)||h){var p;h=e(null,g);if(null!==c){h||(h=f.createDomNode("style",{type:"text/css"}),h.className="lazyloaded");h.onerror=function(){m(!1)};g||b.appendChild(h);try{p=d.createTextNode(c),h.appendChild(p)}catch(k){h.styleSheet.cssText=c}finally{m()}}else null!==a&&(h||(h=f.createDomNode("link",{rel:"stylesheet",type:"text/css"}),h.className="lazyloaded"),h.onerror=function(){m(!1)},g||b.appendChild(h),
l.isMsie()||l.isOpera()?h.onload=m:m(),h.href=a);s.push(a)}else m()},appendJs:function(a,c,m,g,h){if(-1===n.inArray(a,u)||h){h=f.createDomNode("script");var p=d.getElementsByTagName("script")[0],k=!1;(h=e(h,g))?(h.type="text/javascript",h.className="lazyloaded",h.async=!0,h.onreadystatechange=h.onload=function(){k||this.readyState&&"complete"!==this.readyState&&"loaded"!==this.readyState||(this.onreadystatechange=this.onload=null,k=!0,u.push(a),m())},h.onerror=function(){this.onload=this.onreadystatechange=
this.onerror=null;m()},g||(p?p.parentNode.insertBefore(h,p):b.appendChild(h)),c&&!k?(h.textContent?h.textContent=c:h.nodeValue?h.nodeValue=c:h.text=c,k=!0):null!==a&&(h.src=a),k&&(u.push(a),m())):m()}else m()},appendImg:function(a,c,b,g){var h=null;(h=e(h,g))||(h=new Image);h.onerror=function(){h.onload=h.onerror=null;b()};h.onload=function(){h.onload=h.onerror=null;b()};c?h.src=c:a&&(h.src=a);if(h.complete&&h.naturalWidth!==k)h.onload();p.push(a)},appendHtml:function(a,c,b,g){var h=e(null,g);if(h){if(c)try{h.innerHTML=
c,g.id&&l.isMsie()&&d.styleSheets[0].addRule("#"+g.id+":after","content: ' ';")}catch(f){h.innerText=c}b();t.push(a)}else b()}}}();r.namespace("helpers.dom",f)})(document,window.getNs());
(function(d,r){function k(a){p("["+l+" Adapter] "+a)}function e(a){if(a){var c="",c=a.name||a.message||a.code;if(FileError)switch(c){case FileError.ENCODING_ERR:c="Error Event: ENCODING_ERR";break;case FileError.INVALID_MODIFICATION_ERR:c="Error Event: INVALID_MODIFICATION_ERR";break;case FileError.INVALID_STATE_ERR:c="Error Event: INVALID_STATE_ERR";break;case FileError.NO_MODIFICATION_ALLOWED_ERR:c="Error Event: NO_MODIFICATION_ALLOWED_ERR";break;case FileError.NOT_FOUND_ERR:case "NotFoundError":c=
"Error Event: NOT_FOUND_ERR";break;case FileError.NOT_READABLE_ERR:c="Error Event: NOT_READABLE_ERR";break;case FileError.PATH_EXISTS_ERR:c="Error Event: PATH_EXISTS_ERR";break;case FileError.QUOTA_EXCEEDED_ERR:c="Error Event: QUOTA_EXCEEDED_ERR";break;case FileError.SECURITY_ERR:c="Error Event: SECURITY_ERR";break;case FileError.TYPE_MISMATCH_ERR:c="Error Event: TYPE_MISMATCH_ERR";break;default:c="Error Event: Unknown Error"}else c="Error Event: Unknown Error, no FileError available";k(c,a)}}function f(a,
c,b){if("."===c[0]||""===c[0])c=c.slice(1);c[0]?a.getDirectory(c[0],{create:!0},function(a){c.length?f(a,c.slice(1),b):b()},e):b()}function q(a,c,b){c=c.split("/");var g=c.length,h="",d=0;b=t(b);if(g){for(d=0;d<g-1;d+=1)h=h+c[d]+"/";f(a.root,h.split("/"),b)}else b()}function n(a){if(!(this instanceof n))return new n(a);this.adapter=null;this.type=l;this.size=52428800;this.init(a)}var l="fileSystem",s=d.getNs&&d.getNs()||d,u=s.helpers.utils,p=u.log,t=u.callback,b=null;n.prototype=n.fn={isSupported:function(){null===
b&&((b=(!!d.requestFileSystem||!!d.webkitRequestFileSystem||!!d.moz_requestFileSystem)&&(!!d.Blob||!!d.BlobBuilder))||k(l+" is not supported"));return b},open:function(a){var c=this,b=c.adapter;a=t(a);null===b?(d.requestFileSystem=d.requestFileSystem||d.webkitRequestFileSystem||d.moz_requestFileSystem,d.requestFileSystem(d.TEMPORARY,c.size,function(g){b=c.adapter=g;k("Try to create test resource");try{c.create("test-item",u.jsonToString({test:"test-content"}),function(g){g?c.remove("test-item",function(){k("Test resource created and successfully deleted");
a(b)}):a(!1)})}catch(h){e(h),a(!1)}},e)):a(b)},create:function(a,c,b){b=t(b);var g=this.adapter,h=function(a){e(a);b(!1,a)};q(g,a,function(){g.root.getFile(a,{create:!0},function(a){a.createWriter(function(a){var g;a.onwriteend=function(){b(!0)};a.onerror=h;try{Blob?(g=new Blob([c],{type:"text/plain"}),a.write(g)):BlobBuilder&&(g=new BlobBuilder,g.append(c),a.write(g.getBlob("application/json")))}catch(d){h(d)}},h)},h)})},read:function(a,c){c=t(c);var b=this.adapter,g=function(a){e(a);c(!1,a)};q(b,
a,function(){b.root.getFile(a,{create:!1},function(a){a.file(function(a){var b=new FileReader;b.onloadend=function(){c(this.result)};b.readAsText(a)},g)},g)})},update:function(a,c,b){this.create(a,c,b)},remove:function(a,c){c=t(c);var b=this.adapter,g=function(a){e(a);c(!1,a)};q(b,a,function(){b.root.getFile(a,{create:!1},function(a){a.remove(function(){c(!0)},g)},g)})},init:function(a){return this.isSupported()?(a&&a.size&&(this.size=a.size),this):!1}};u.isFunction(s.namespace)?s.namespace("cache.storage.adapter."+
l,n):s[l]=n})(window);
(function(d,r){function k(d){l("["+f+" Adapter] "+d)}function e(d){if(!(this instanceof e))return new e(d);this.adapter=null;this.type=f;this.dbName="cache";this.dbVersion="1.0";this.dbTable="offline";this.dbDescription="Local offline cache";this.dbKey="key";this.init(d)}var f="indexedDatabase",q=d.getNs&&d.getNs()||d,n=q.helpers.utils,l=n.log,s=n.callback,u=null;e.prototype=e.fn={isSupported:function(){null===u&&((u=!!d.indexedDB||!!d.webkitIndexedDB||!!d.mozIndexedDB||!!d.OIndexedDB||!!d.msIndexedDB)||
k(f+" is not supported"));return u},create:function(d,e,b){var a=this.dbTable,c=this.dbName,m=this.adapter.transaction([a],"readwrite");d=m.objectStore(a).put({key:d,content:e});b=s(b);m.onerror=function(a){k("Failed to init transaction while creating/updating database entry "+c+" "+a);b(!1,a)};d.onerror=function(a){k("Failed to create/update database entry "+c+" "+a);b(!1,a)};d.onsuccess=function(){b(!0)}},read:function(d,e){e=s(e);var b=this.dbTable,a=this.dbName,c=this.adapter.transaction([b],
"readonly"),b=c.objectStore(b).get(d);c&&b?(c.onerror=function(c){k("Failed to init transaction while reading database "+a+" "+c);e(!1,c)},b.onerror=function(c){k("Failed to read database entry "+a+" "+c);e(!1,c)},b.onsuccess=function(a){a.target.result&&a.target.result.content?e(a.target.result.content):e(!1)}):e(!1)},update:function(d,e,b){this.create(d,e,b)},remove:function(d,e){e=s(e);var b=this.dbTable,a=this.dbName,c=this.adapter.transaction([b],"readwrite"),b=c.objectStore(b).put({key:d,content:""});
c.onerror=function(c){k("Failed to init transaction while deleting database entry "+a+" "+c);e(!1,c)};b.onerror=function(c){k("Failed to delete database entry "+a+" "+c);e(!1,c)};b.onsuccess=function(){e(!0)}},open:function(e,f){var b=this,a=null,c=null,m=null,g=b.dbName,h=b.dbTable,l=function(a){a||e(!1);k("Try to create test resource");b.create("test-item",'{test: "test-content"}',function(c){c?b.remove("test-item",function(){k("Test resource created and successfully deleted");e(a)}):e(!1)})},n,
q,D,w;f||(f=!1);e=s(e);if(null===b.adapter)if(a=d.indexedDB||d.webkitIndexedDB||d.mozIndexedDB||d.OIndexedDB||d.msIndexedDB){d.webkitIndexedDB!==r&&(d.IDBTransaction=d.webkitIDBTransaction,d.IDBKeyRange=d.webkitIDBKeyRange);n=function(a){var d=c.result,f,w;b.adapter=d;b.dbVersion===d.version||!d.setVersion&&"function"!==typeof d.setVersion?(b.adapter=d,l(d)):(m=a.currentTarget.result.setVersion(b.dbVersion),m.onfailure=function(a){k("Failed to open database: "+g+" "+a);e(!1)},m.onsuccess=function(a){f=
c.result;w=f.createObjectStore(h,{keyPath:b.dbKey});k("Database needs upgrade: "+g+" "+a.oldVersion+" "+a.newVersion);w.createIndex("key","key",{unique:!0});w.createIndex("content","content",{unique:!1})})};q=function(a){var d=c.result.createObjectStore(h,{keyPath:b.dbKey});k("Database needs upgrade: "+g+" "+a.oldVersion+" "+a.newVersion);d.createIndex("key","key",{unique:!0});d.createIndex("content","content",{unique:!1})};D=function(a){k("Failed to open database: "+g+" "+a);f||b.open(e,!0);e(!1)};
w=function(a){k("Opening database request is blocked! "+g+" "+a);e(!1)};if(f)try{c=a.open(g,b.dbVersion)}catch(E){k(E),c=a.open(g)}else c=a.open(g);c.onsuccess=n;c.onupgradeneeded=q;c.onerror=D;c.onblocked=w}else e(!1);else l(b.adapter)},init:function(d){return this.isSupported()?(d&&(d.name&&(this.dbName=d.name),d.version&&(this.dbVersion=d.version),d.table&&(this.dbTable=d.table),d.description&&(this.dbDescription=d.description),d.key&&(this.dbKey=d.key)),this):!1}};n.isFunction(q.namespace)?q.namespace("cache.storage.adapter."+
f,e):q[f]=e})(window);
(function(d,r){function k(b){u("["+n+" Adapter] "+b)}function e(b,a,c,d,g,e){!e&&b?b.transaction(function(b){b.executeSql(a,c,d,g)}):e?e.executeSql(a,c,d,g):g(null,{code:0,message:"The storage adapter isn't available"})}function f(b){var a="Errorcode: "+(b.code||"Code not present")+", Message: "+(b.message||"Message not present");b.info&&(a=a+" - "+b.info);k(a)}function q(b){if(!(this instanceof q))return new q(b);this.adapter=null;this.type=n;this.dbName="cache";this.dbVersion="1.0";this.dbDescription=
"resource cache";this.dbTable="websql";this.dbSize=4194304;this.init(b)}var n="webSqlDatabase",l=d.getNs&&d.getNs()||d,s=l.helpers.utils,u=s.log,p=s.callback,t=null;q.prototype=q.fn={isSupported:function(){null===t&&((t=!!d.openDatabase)||k(n+" is not supported"));return t},create:function(b,a,c){c=p(c);e(this.adapter,"INSERT INTO "+this.dbTable+" (key, content) VALUES (?,?);",[b,a],function(){c(!0)},function(a,b){f(b);c(!1,b,{transaction:a})})},read:function(b,a){a=p(a);e(this.adapter,"SELECT content FROM "+
this.dbTable+" WHERE key=?;",[b],function(c,b){var d=!1;b&&(b.rows&&1===b.rows.length)&&(d=b.rows.item(0).content);a(d,null,{transaction:c})},function(c,b){f(b);a(!1,b,{transaction:c})})},update:function(b,a,c){c=p(c);e(this.adapter,"UPDATE "+this.dbTable+" SET content = ?  WHERE key=?;",[a,b],function(){c(!0)},function(a,b){f(b);c(!1,b,{transaction:a})})},remove:function(b,a){a=p(a);e(this.adapter,"DELETE FROM "+this.dbTable+" WHERE key = ?;",[b],function(){a(!0)},function(c,b){f(b);a(!1,b,{transaction:c})})},
open:function(b){b=p(b);var a=this,c=a.adapter,m=function(c){c||b(!1);k("Try to create test resource");a.create("test-item",'{test: "test-content"}',function(d){d?a.remove("test-item",function(){k("Test resource created and successfully deleted");b(c)}):b(!1)})},g=function(c,b){e(c,"CREATE TABLE IF NOT EXISTS "+a.dbTable+"(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);",[],function(){m(c)},function(a){f(a);m(!1)},b)},h=function(a){g(null,a)},l=function(a){a.info=
"Can't migrate to new database version and using localStorage instead. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.";f(a);b(!1)};try{if(null===c&&a.isSupported())if(a.adapter=c=d.openDatabase(a.dbName,"",a.dbDescription,a.dbSize),String(c.version)!==String(a.dbVersion)&&c.changeVersion&&"function"===typeof c.changeVersion)try{c.changeVersion(c.version,a.dbVersion,h,l)}catch(n){f(n),b(!1)}else c=
d.openDatabase(a.dbName,a.dbVersion,a.dbDescription,a.dbSize),g(c);else a.isSupported()&&m(c)}catch(t){f(t),b(!1)}},init:function(b){return this.isSupported()?(b&&(b.description&&(this.dbDescription=b.description),b.name&&(this.dbName=b.name),b.size&&(this.dbSize=b.size),b.table&&(this.dbTable=b.table),b.version&&(this.dbVersion=String(b.version))),this):!1}};s.isFunction(l.namespace)?l.namespace("cache.storage.adapter."+n,q):l[n]=q})(window);
(function(d,r){function k(a){p("["+n+" Adapter] "+a)}function e(a){!a&&d.event&&(a=d.event);k("Event - key: "+(a.key||"no e.key event")+", url: "+(a.url||"no e.url event"))}function f(a){switch(a){case "local":a="localStorage";break;case "session":a="sessionStorage";break;default:a="localStorage"}return a}function q(a){if(!(this instanceof q))return new q(a);this.adapter=null;this.type=n;this.lifetime="local";this.init(a)}var n="webStorage",l=d.getNs&&d.getNs()||d,s=l.helpers.utils,u=s.on,p=s.log,
t=s.callback,b=null;q.prototype=q.fn={isSupported:function(){var a=f(this.lifetime);if(null===b)try{b=!!d[a]&&!!d[a].getItem}catch(c){k(n+" is not supported"),b=!1}return b},create:function(a,c,b){var d=!0;b=t(b);try{this.adapter.setItem(a,c),b(d)}catch(h){e(h),d=!d,b(d,h)}return d},read:function(a,c){var b;c=t(c);try{(b=this.adapter.getItem(a))?c(b):c(!1)}catch(d){e(d),c(!1,d)}return b},update:function(a,c,b){return this.create(a,c,b)},remove:function(a,b){var d=!0;b=t(b);try{this.adapter.removeItem(a),
b(d)}catch(g){e(g),d=!d,b(d,g)}return d},open:function(a){var b=this,m=b.adapter,g=f(b.lifetime);a=t(a);if(null===m)try{m=b.adapter=d[g],u(d,"storage",e),k("Try to create test resource"),b.create("test-item",'{test: "test-content"}',function(d){d?b.remove("test-item",function(){k("Test resource created and successfully deleted");a(m)}):a(!1)})}catch(h){a(!1)}else b.isSupported()&&a(m)},init:function(a){return this.isSupported()?(a&&a.lifetime&&(this.lifetime=a.lifetime),this):!1}};s.isFunction(l.namespace)?
l.namespace("cache.storage.adapter."+n,q):l[n]=q})(window);
(function(d,r,k){function e(a){b("["+n+" Adapter] "+a)}function f(a,b){b.isLoaded||(b.isLoaded=!0,b.progressCallback(100),d.setTimeout(function(){a();e("Event loaded")},b.delay))}function q(a){if(!(this instanceof q))return new q(a);this.adapter=null;this.type=n;this.isLoaded=!1;this.delay=25;this.init(a)}var n="applicationCache",l=d.getNs&&d.getNs()||d,s=l.helpers,u=s.utils,p=s.dom,t=u.on,b=u.log,a=u.callback,c=null,m=r.getElementsByTagName("html")[0];q.prototype=q.fn={isSupported:function(){null===
c&&((c=!!d.applicationCache&&!!p.getAttribute(m,"manifest"))||e(n+" is not supported or there is no manifest html attribute"));return c},open:function(b,c){var m=this,l=m.adapter,n=0,p,w;b=a(b);c&&c.progress&&(p=c.progress);p=m.progressCallback=a(p);if(m.isSupported()&&null!==l){w=function(){e("Event updateready");try{l.swapCache()}catch(a){e("Event updateready: swapcache is not available",a)}confirm("A new version of this website is available. Do you want to an update?")?d.location.reload(!0):f(b,
m);return!1};t(l,"checking",function(){e("Event checking");return!1});t(l,"noupdate",function(){e("Event noupdate");f(b,m);return!1});t(l,"downloading",function(){e("Event downloading");n=0;return!1});t(l,"progress",function(a){e("Event progress");var b="";m.delay=500;n+=1;b=a&&a.lengthComputable!==k?Math.round(100*a.loaded/a.total):Math.round(100*n/20);p(b);return!1});t(l,"cached",function(){e("Event cached");f(b,m);return!1});t(l,"updateready",function(){w()});t(l,"obsolete",function(){e("Event obsolete");
d.location.reload(!0);return!1});t(l,"error",function(){e("Event error");f(b,m);return!1});switch(l.status){case l.UNCACHED:f(b,m);break;case l.IDLE:f(b,m);break;case l.UPDATEREADY:w();break;case l.OBSOLETE:f(b,m)}t(d,"online",function(){try{l.update()}catch(a){e("Window event online: update cache is not available",a)}});d.setTimeout(function(){m.isLoaded||f(b,m)},12E3)}else f(b,m)},init:function(a){a=this.adapter;this.isSupported()&&null===a&&(this.adapter=d.applicationCache);return this}};l.namespace("cache.storage.adapter."+
n,q)})(window,document);
(function(d,r,k,e){function f(a){H("["+c+" controller] "+a)}function q(a,b,c){c.timeout=d.setTimeout(function(){b(!1)},5E3);D(a,function(a){d.clearTimeout(c.timeout);delete c.timeout;a?b(a):b(!1)})}function n(a){var b=null;try{b=h.jsonToObject(a)}catch(c){f("Couldn't convert json string to object."+c)}return b}function l(a,b,c){if(E){var d=r.createElement("canvas"),h,f=new Image,g=null,k=0,m=0;c||(c="jpeg");f.onerror=function(){f.onload=f.onerror=null;b()};f.onload=function(){f.onload=f.onerror=null;
k=d.height=f.height;m=d.width=f.width;h=d.getContext("2d");h.fillStyle="rgba(50, 50, 50, 0)";h.fillRect(0,0,m,k);h.drawImage(f,0,0);g=d.toDataURL("image/"+c);b(g)};f.src=a;if(f.complete&&f.naturalWidth!==e)f.onload()}else b(!1)}function s(a){var b=a.data,c=a.url;"css"===a.type&&(c=h.url(c),c=c.folder,b=b.replace(/url\(\../g,"url("+c+".."),b=b.replace(/url\(\'../g,"url('"+c+".."),b=b.replace(/url\(\"../g,'url("'+c+".."),a.data=b);return a}function u(a){return{ajax:a.ajax,data:a.data,expires:(new Date).getTime()+
(a.lifetime||z.lifetime),group:a.group!==e?a.group:z.group,lastmod:a.lastmod||z.lastmod,lifetime:a.lifetime!==e?a.lifetime:z.lifetime,type:a.type||z.type,version:a.version||z.version}}function p(a){return A&&A[a]?!!A[a]:!1}function t(a,b){var c=null,d;a&&a.length?(d=a[0].type,f("Testing for storage adapter type: "+d),w[d]?c=new w[d](x):t(a.slice(1),b),c&&c.isSupported()?c.open(function(e){e?(y=d,A=a[0],f("Used storage adapter type: "+y),b(c)):t(a.slice(1),b)}):t(a.slice(1),b)):y||b(!1)}function b(a,
c){var d=null,e=0,h;if(c)try{f("Testing for storage adapter type: "+c),w[c]?d=new w[c](x):b(a),d&&d.isSupported()?d.open(function(g){if(g){y=c;h=C.length;for(e=0;e<h;e+=1)C[e].type===c&&(A=C[e]);A?(f("Used storage type: "+y),a(d)):(f("Storage config not found: "+y),b(a))}else b(a)}):b(a)}catch(g){f("Storage adapter could not be initialized: type "+c,g),b(a)}else t(C,a)}function a(b,c){if(!(this instanceof a))return new a(b,c);this.isEnabled=!0;this.adapter=null;this.adapters={types:C,defaults:x};
this.appCacheAdapter=null;this.resourceDefaults=z;this.init(b,c)}var c="storage",m=k.helpers,g=m.client,h=m.utils,H=h.log,B=h.callback,F=h.getJson(),D=h.xhr,w=k.cache.storage.adapter,E=g.hasCanvas(),C=[{type:"fileSystem",css:!0,js:!0,html:!0,img:!0},{type:"indexedDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webSqlDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webStorage",css:!0,js:!0,html:!0,img:!0}],x={name:"localcache",table:"cache",description:"local resource cache",size:4194304,version:"1.0",
key:"key",lifetime:"local",offline:!0},y=null,A=null,z={ajax:!0,lifetime:2E4,group:0,lastmod:(new Date).getTime(),type:"css",version:1};a.prototype=a.fn={create:function(a,b){var c=this,d=a.url,e=a.type,g=function(g){if(g)if(a.data=g,a=s(a),null!==c.adapter&&p(e)){g=h.jsonToString(d);var k=u(a),m=h.jsonToString(k);a.expires=k.expires;a.version=k.version;try{c.adapter.create(g,m,function(c){c?(f("Create new resource in storage adapter: type "+e+", url "+d),b(a)):(f("Create new resource in storage adapter failed"),
b(!1))})}catch(l){b(a)}}else f("Trying to create new resource, but resource type is not cachable or storage adapter is not available: type "+e+", url "+d),b(a);else f("Couldn't get data via network"),b(a)};b=B(b);a.ajax?"img"===e?l(d,g):q(d,g,a):a.data?g(a.data):b(!1)},read:function(a,b){var c=this,d=a.url,e=a.type;b=B(b);if(null!==this.adapter&&p(e)){f("Trying to read resource from storage: type "+e+", url "+d);try{c.adapter.read(h.jsonToString(d),function(g){g?(a=n(g))?(a.url=d,f("Successfully read resource from storage: type "+
e+", url "+d),b(a,!0)):c.remove({url:d,type:e},function(){b(!1)}):(f("There is no data coming back from storage while reading: type "+e+", url "+d),b(!1))})}catch(g){q(d,function(c){a.data=c;f("Try to read resource from storage, but storage adapter is not available: type "+e+", url "+d);b(a,!0)},a)}}else b(a)},update:function(a,b){var c=this,d=a.url,e=a.type,g=function(g){if(g)if(a.data=g,a=s(a),null!==c.adapter&&p(e)){g=h.jsonToString(d);var k=u(a),m=h.jsonToString(k);a.expires=k.expires;a.version=
k.version;try{c.adapter.update(g,m,function(c){c?(f("Update existing resource in storage adapter: type "+e+", url "+d),b(a)):(f("Updating resource in storage failed."),b(!1))})}catch(l){b(a)}}else f("Resource type is not cachable or storage adapter is not available: type "+e+", url "+d),b(a);else f("Couldn't get data via network, trying to used stored version"),c.read(a,function(c){c&&c.data?(a.data=c.data,b(a)):b(!1)})};b=B(b);a.ajax?"img"===e?l(d,g):q(d,g,a):a.data?g(a.data):b(!1)},remove:function(a,
b){var c=a.url,d=a.type;b=B(b);null!==this.adapter&&p(d)?this.adapter.remove(h.jsonToString(c),function(e){e?(f("Delete resource form storage: type "+d+", url "+c),b(a)):(f("Deleting resource form storage failed: type "+d+", url "+c),b(!1))}):(f("Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type "+d+", url "+c),b(a))},init:function(a,c){var d=this,g=!1;a=B(a);c&&c.isEnabled!==e&&(d.isEnabled=!!c.isEnabled);d.isEnabled&&F?(c&&(c.description&&(x.description=
String(c.description)),c.key&&(x.key=String(c.key)),c.lifetime&&(x.lifetime=String(c.lifetime)),c.name&&(x.name=String(c.name)),c.size&&(x.size=parseInt(c.size,10)),c.table&&(x.table=String(c.table)),c.type&&(x.type=g=String(c.type)),c.offline&&(x.offline=Boolean(c.offline)),c.version&&(x.version=String(c.version))),x.offline&&w.applicationCache&&(d.appCacheAdapter=new w.applicationCache(x)),b(function(b){d.adapter=b;a(d)},g)):(F||f("There is no json support"),d.isEnabled||f("Caching data is disabled"),
a(d))}};h.isFunction(k.namespace)?k.namespace("cache."+c+".controller",a):k[c]=a})(window,document,window.getNs());
(function(d,r,k){function e(a){p("["+n+" controller] "+a)}function f(a){a=s.url(a).extension;switch(a){case "js":a="js";break;case "css":a="css";break;case "html":a="html";break;case "jpg":case "jpeg":case "png":a="img";break;default:a="custom"}return a}function q(a,b){if(!(this instanceof q))return new q(a,b);this.storage=null;this.init(a,b)}var n="cache";d=r.helpers;var l=d.dom,s=d.utils,u=d.client,p=s.log,t=s.isArray,b=s.callback;q.prototype=q.fn={load:function(a,c){var d=this,g=(new Date).getTime(),
h=function(){var a=0,b=0,c=null;return{init:function(d,e){c=e;a=d;b=0},loaded:function(){b+=1;b===a&&c()}}}(),n=function(a,c,d){var e=a.url,g=b(a.loaded),f=function(){h.loaded();g(a)},k=a.node||null;d=!!d;switch(a.type){case "js":l.appendJs(e,c,f,k,d);break;case "css":l.appendCss(e,c,f,k,d);break;case "img":l.appendImg(e,c,f,k,d);break;case "html":l.appendHtml(e,c,f,k,d);break;default:f()}},p=function(a){var b=a.data||null,c=function(a,b){a&&a.data?n(a,a.data,b):n(a,null,b)},f=d.storage,h=f.resourceDefaults;
a.ajax=a.ajax!==k?!!a.ajax:h.ajax;f.read(a,function(h){if(h&&h.data){var l=a,p=d.storage.resourceDefaults,t=parseInt(h.lifetime,10),r=h.version,q=h.lastmod?h.lastmod:0,s=!1,y,v=l.lastmod?l.lastmod:0,s=!0;y=!1;l.version=y=l.version!==k?parseFloat(l.version):p.version;l.group=l.group!==k?parseFloat(l.group):p.group;v&&q?(l.lastmod=parseInt(v,10),s=q===l.lastmod):!v&&q?v=q:v||(v=p.lastmod);s=s&&y===r;y=0!==t&&(-1!==t&&s&&h.expires>g||-1===t&&s);l.lastmod=v;l.isValid=y;a=l;a.isValid||!u.isOnline()?(e("Resource is up to date: type "+
a.type+", url "+a.url),(b=h.data)&&n(a,b)):(e("Resource is outdated and needs update: type "+a.type+", url "+a.url),f.update(a,c))}else e("Resource or resource data is not available in storage adapter: type "+a.type+", url "+a.url),f.create(a,c)})},r=function(a,b){var c=0,d=a.length,e=null;h.init(d,b);for(c=0;c<d;c+=1)(e=a[c])&&e.url&&(e.type||(e.type=f(e.url)),p(e))},q=function(a,b,c){var d=a.length;for(c||(c=0);!a[c]&&c<d;)c+=1;c>=d?b():(d=a[c],r(d,function(){q(a,b,c+1)}))};(function(a,d){var g;
a&&t(a)||(a=[]);g=a.length;for(var f=a,h=[],k,l=0,m,n=f.length,l=0;l<n;l+=1)m=f[l],(k=m.group)||(k=0),k=h[k]?h[k]:h[k]=[],k.push(m);a=h;d=b(c);e("Load resource function called: "+g+" resources, "+a.length+" groups");q(a,d)})(a,c)},remove:function(a,c){var d=this.storage,g=function(a,b){var c=a.length,g,k,l=function(a,d){e("Successfully removed resource: url "+d);a===c-1&&b()};if(c)for(g=0;g<c;g+=1)(k=a[g])&&k.url&&(k.type||(k.type=f(k.url)),d.remove(k,l(g,k.url)));else b()};(function(a,d){a&&t(a)||
(a=[]);d=b(c);e("Remove resource function called: resources count "+a.length);g(a,d)})(a,c)},init:function(a,c){var d=this;a=b(a);e("Cache initializing and checking for storage adapters");r.cache.storage.controller(function(b){d.storage=b;a(b)},c)}};s.isFunction(r.namespace)?r.namespace(n+".controller",q):r[n]=q})(window,window.getNs());
(function(d,r,k){function e(d){this.storage=this.controller=null;this.params=d;this.queue=new u;this.calls=0}function f(d){var b=null,a=p.length,c;d||(d={});for(c=0;c<a;c+=1)s(p[c].params)===s(d)&&(b=p[c]);b||(b=new e(d),p.push(b));return b}var q=r.cache.controller;k=r.helpers;var n=k.utils,l=n.isArray,s=n.jsonToString,u=k.queue,p=[];r.namespace("cache.load",function(e,b,a){var c=f(a),k=function(b,d,e){l(b)?c.controller.load(b,d):"applicationCache"===b&&((b=c.storage)&&b.appCacheAdapter?b.appCacheAdapter.open(d,
a):d())};c.storage?k(e,b,a):(c.queue.add(function(){k(e,b,a)}),c.calls+=1,1===c.calls&&(c.controller=new q(function(a){c.storage=a;c.controller?c.queue.flush(this):c.interval=d.setInterval(function(){c.controller&&(d.clearInterval(c.interval),c.queue.flush(this))},25)},a)));return this})})(window,window.getNs());
