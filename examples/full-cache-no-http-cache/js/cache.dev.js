(function(e,u){function q(){e[c]||(e[c]={});return e[c]}var c="app",b;b=q();b.namespace=b.ns=function(b,l){if(b){b=String(b);var n=b.split("."),g=n.length,s=e[c],p;s||(e[c]={});if(!n)return!1;for(p=0;p<g;p+=1)s[n[p]]||(s[n[p]]={}),p===g-1&&l!==u&&(s[n[p]]=l),s=s[n[p]];return s}return!1};e[c]=b;e.getNamespace=e.getNs=q})(window);
(function(e,u){function q(){if(!(this instanceof q))return new q;this.m=[];this.r=null;this.f=!1}q.prototype=q.fn={add:function(c){this.f?c(this.r):this.m.push(c)},flush:function(c){if(!this.f)for(this.r=c,this.f=!0;this.m[0];)this.m.shift()(c)}};e.ns("helpers.queue",q)})(window.getNs());
(function(e,u,q,c){var b=function(){var k=null,l=[];return{isString:function(b){return"string"===typeof b||b instanceof String},isFunction:function(b){return"function"===typeof b||b instanceof Function},isArray:function(c){var g=Array.isArray,e=Object.prototype.toString;b.isArray=g&&"function"===typeof g?function(b){return g(b)}:e&&"function"===e?function(b){return"[object Array]"===e.call(b)}:function(b){return!!b&&!!b.sort&&"function"===typeof b.sort};return b.isArray(c)},inArray:function(c,g,e){b.inArray=
Array.prototype.indexOf?function(b,c,f){return l.indexOf.call(c,b,f)}:function(b,c,f){var d=c.length,a=0;if(f)return c[f]&&c[f]===b?f:-1;for(a=0;a<d;a+=1)if(c[a]===b)return a;return-1};return b.inArray(c,g,e)},callback:function(n){b.isFunction(n)||(n=function(){return c});return n},on:function(c,g,s){b.on="function"===typeof e.addEventListener?function(b,c,f){b.addEventListener(c,f,!1)}:"function"===typeof u.attachEvent?function(b,c,f){b.attachEvent("on"+c,f)}:function(b,c,f){b["on"+c]=f};b.on(c,
g,s)},off:function(c,g,s){b.off="function"===typeof e.removeEventListener?function(b,c,f){b.removeEventListener(c,f,!1)}:"function"===typeof u.detachEvent?function(b,c,f){b.detachEvent("on"+c,f)}:function(b,c){b["on"+c]=null};b.off(c,g,s)},getXhr:function(){for(var b=null,c=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],e=c.length,k=0,k=0;k<
e;k+=1){try{b=c[k]()}catch(l){continue}break}return b},xhr:function(e,g,k,p){var l=b.getXhr(),f,d="GET";g=b.callback(g);if(l)if(e){p!==c?d="POST":p=null;k===c&&(k=!0);f=function(){if(4===l.readyState&&(200<=l.status&&400>l.status||0===l.status))try{var a=l.responseText;a?g(a):g(!1)}catch(b){g(!1)}else 4===l.readyState&&g(!1)};l.open(d,e,k);try{l.onreadystatechange!==c?l.onreadystatechange=f:l.onload!==c&&(l.onload=f)}catch(a){}l.send(p)}else g(!1);else g(!1)},getJson:function(){null===k&&(e.JSON&&
e.JSON.stringify)&&(k=e.JSON);return k},jsonToString:function(e){var g=!1;null===k&&(k=b.getJson());k&&e!==c&&(g=k.stringify(e));return g},jsonToObject:function(e){var g=!1;null===k&&(k=b.getJson());k&&e!==c&&(g=k.parse(e));return g},logToScreen:function(b){var c=u.getElementById("log"),e=u.createElement("p");b=u.createTextNode(b);c&&(e.appendChild(b),c.appendChild(e))},log:function(){var k=arguments,g=e.console!==c,l=g?e.console:null,g=g&&l.log!==c;k.length&&(g&&l.log.apply(l,k),k=k[0],b.logToScreen(k))},
url:function(c){if(b.isString(c)){var e=u.createElement("a"),k;e.href=c;k=e.pathname.match(/\/([^\/?#]+)$/i);return{source:c,protocol:e.protocol,host:e.hostname,port:e.port,query:e.search,file:k?k[1]:"/",hash:e.hash,path:e.pathname.replace(/^([^\/])/,"/$1"),extension:function(b){b=b.split(".");return b.length?b[b.length-1]:!1}(c),folder:function(){var b=c.lastIndexOf("/");return c.substr(0,b+1)}()}}},trim:function(c){if(!b.isString(c))return c;b.isFunction(String.prototype.trim)||(String.prototype.trim=
function(){return this.replace(/^\s+|\s+$/g,"")});return c.trim()}}}();q.ns("helpers.utils",b)})(window,document,window.getNs());
(function(e,u,q,c){var b=function(){function b(){g===c&&(t(e,"online",b),t(e,"offline",b));g=u.onLine!==c?!!u.onLine:!0}var l,n,g,s,p=(u.userAgent||u.vendor||e.opera).toLowerCase(),t=q.helpers.utils.on;return{isMsie:function(){n===c&&(n=null!==p.match(/(msie)/));return n},isOpera:function(){l===c&&(l=null!==p.match(/(opera)/));return l},isOnline:function(){g===c&&b();return g},hasCanvas:function(){if(s===c){var b=document.createElement("canvas");s=!(!b.getContext||!b.getContext("2d"))}return s}}}();
q.ns("helpers.client",b)})(window,window.navigator,window.getNs());
(function(e,u,q){function c(b,c){c&&(c.dom?b=c.dom:c.id&&(b=e.getElementById(c.id)));return b}var b=function(){var k=u.helpers,l=k.utils,n=k.client,g=[],s=[],p=[],t=[],f=e.getElementsByTagName("head")[0];return{nuke:function(){g=[];s=[];p=[];t=[]},createDomNode:function(b,a){var c=e.createElement(b),f;if(a)for(f in a)a.hasOwnProperty(f)&&c.setAttribute(f,a[f]);return c},getAttribute:function(b,a){return b.getAttribute(a)},setAttribute:function(b,a,c){b.setAttribute(a,c)},appendCss:function(d,a,r,
w,h){if(-1===l.inArray(d,g)||h){var m=null,C=!1,v,k,m=c(m,w);if(null!==a){m||(m=b.createDomNode("style",{type:"text/css"}),m.className="lazyloaded");m.onerror=function(){r(!1)};w||f.appendChild(m);try{v=e.createTextNode(a),m.appendChild(v)}catch(q){m.styleSheet.cssText=a}finally{r(!0)}}else null!==d&&(m||(m=b.createDomNode("link",{rel:"stylesheet",type:"text/css"}),m.className="lazyloaded"),m.onerror=m.error=function(){m.onload=m.load=null;C=!0;window.clearTimeout(k);r(!1)},w||f.appendChild(m),n.isMsie()||
n.isOpera()?m.onload=m.load=function(){m.onerror=m.error=null;C=!0;window.clearTimeout(k);r(!0)}:r(!0),m.href=d,k=window.setTimeout(function(){C||r(!1)},4E3));g.push(d)}else r(!0)},appendJs:function(d,a,r,w,h){if(-1===l.inArray(d,s)||h){h=b.createDomNode("script");var m=e.getElementsByTagName("script")[0],k=!1,v=!1,g;(h=c(h,w))?(h.type="text/javascript",h.className="lazyloaded",h.async=!0,h.onreadystatechange=h.onload=function(){v||this.readyState&&"complete"!==this.readyState&&"loaded"!==this.readyState||
(this.onreadystatechange=this.onload=null,k=v=!0,window.clearTimeout(g),s.push(d),r(!0))},h.onerror=function(){this.onload=this.onreadystatechange=this.onerror=null;window.clearTimeout(g);k=!0;r(!1)},w||(m?m.parentNode.insertBefore(h,m):f.appendChild(h)),a&&!v?(h.textContent?h.textContent=a:h.nodeValue?h.nodeValue=a:h.text=a,k=v=!0):null!==d&&(h.src=d),v&&(s.push(d),k=!0,r(!0)),k||(g=window.setTimeout(function(){v||r(!1)},5E3))):r(!1)}else r(!0)},appendImg:function(b,a,f,w){var h=null;(h=c(h,w))||
(h=new Image);h.onerror=function(){h.onload=h.onerror=null;f(!1)};h.onload=function(){h.onload=h.onerror=null;f(!0)};a?h.src=a:b&&(h.src=b);if(h.complete&&h.naturalWidth!==q)h.onload();p.push(b)},appendHtml:function(b,a,f,w){var h=c(null,w);if(h){if(a)try{h.innerHTML=a,w.id&&n.isMsie()&&e.styleSheets[0].addRule("#"+w.id+":after",'content: " ";')}catch(m){h.innerText=a}f(!0);t.push(b)}else f(!1)}}}();u.ns("helpers.dom",b)})(document,window.getNs());
(function(e,u,q){function c(a){p("["+g+" Adapter] "+a)}function b(a){if(a){var b=a.name||a.code,f=a.message||a.description||"",h=f;if(FileError)switch(b){case FileError.ENCODING_ERR:case "EncodingError":h="Error Event: ENCODING_ERR "+f;break;case FileError.INVALID_MODIFICATION_ERR:case "InvalidModificationError":h="Error Event: INVALID_MODIFICATION_ERR";break;case FileError.INVALID_STATE_ERR:case "InvalidStateError":h="Error Event: INVALID_STATE_ERR "+f;break;case FileError.NO_MODIFICATION_ALLOWED_ERR:case "NoModificationAllowedError":h=
"Error Event: NO_MODIFICATION_ALLOWED_ERR "+f;break;case FileError.NOT_FOUND_ERR:case "NotFoundError":h="Error Event: NOT_FOUND_ERR "+f;break;case FileError.NOT_READABLE_ERR:case "NotReadableError":h="Error Event: NOT_READABLE_ERR "+f;break;case FileError.PATH_EXISTS_ERR:case "PathExistsError":h="Error Event: PATH_EXISTS_ERR "+f;break;case FileError.QUOTA_EXCEEDED_ERR:case "QuotaExceededError":h="Error Event: QUOTA_EXCEEDED_ERR "+f;break;case FileError.SECURITY_ERR:case "SecurityError":h="Error Event: SECURITY_ERR "+
f;break;case FileError.TYPE_MISMATCH_ERR:case "TypeMismatchError":h="Error Event: TYPE_MISMATCH_ERR "+f;break;default:h="Error Event: Unknown Error "+f}else h="Error Event: Unknown Error, no FileError available";c(h,a)}}function k(a,f,c){var h=function(a){b(a);c(!1)};if("."===f[0]||""===f[0])f=f.slice(1);f[0]?a.getDirectory(f[0],{create:!0},function(a){f.length?k(a,f.slice(1),c):c(!0)},h):c(!0)}function l(a,b,f){b=b.split("/");var h=b.length,c="",d=0;f=t(f);if(h){for(d=0;d<h-1;d+=1)c=c+b[d]+"/";k(a.root,
c.split("/"),f)}else f(!0)}function n(a){if(!(this instanceof n))return new n(a);this.adapter=null;this.type=g;this.size=52428800;this.init(a)}var g="fileSystem",s=u.helpers.utils,p=s.log,t=s.callback,f=null,d=e.requestFileSystem||e.webkitRequestFileSystem||e.moz_requestFileSystem;n.prototype=n.fn={isSupported:function(){null===f&&((f=!!d&&(!!e.Blob||!!e.BlobBuilder)&&e.FileReader)||c(g+" is not supported"));return f},open:function(a){var r=this,w=r.adapter,h=function(f){b(f);a(!1)};a=t(a);f?null===
w?(e.requestFileSystem=d,e.requestFileSystem(e.TEMPORARY,r.size,function(b){w=r.adapter=b;c("Try to create test resource");try{r.create("test-item",s.jsonToString({test:"test-content"}),function(b){b?r.remove("test-item",function(){c("Test resource created and successfully deleted");a(w)}):h()})}catch(f){h(f)}},h)):(c("Adapter already opened"),a(w)):a(!1)},create:function(a,r,d){d=t(d);if(a&&f){var h=this.adapter,m=function(a){b(a);d(!1,a)};l(h,a,function(){h.root.getFile(a,{create:!0},function(b){b.createWriter(function(b){var f;
b.onwriteend=function(){c("File successfully written: url "+a);d(!0)};b.onerror=m;try{Blob?(f=new Blob([r],{type:"text/plain"}),b.write(f)):BlobBuilder&&(f=new BlobBuilder,f.append(r),b.write(f.getBlob("application/json")))}catch(h){m(h)}},m)},m)})}else d(!1)},read:function(a,c){c=t(c);if(a&&f){var d=this.adapter,h=function(a){b(a);c(!1,a)};l(d,a,function(){d.root.getFile(a,{create:!1},function(a){a.file(function(a){var b=new FileReader;b.onloadend=function(){c(this.result)};b.onerror=h;b.onabort=
h;b.readAsText(a)},h)},h)})}else c(!1)},update:function(a,b,f){this.create(a,b,f)},remove:function(a,c){c=t(c);if(a&&f){var d=this.adapter,h=function(a){b(a);c(!1,a)};l(d,a,function(){d.root.getFile(a,{create:!1},function(a){a.remove(function(){c(!0)},h)},h)})}else c(!1)},init:function(a){return this.isSupported()?(a&&a.size&&(this.size=a.size),this):!1}};u.ns("cache.storage.adapter."+g,n)})(window,window.getNs());
(function(e,u,q){function c(b){g("["+l+" Adapter] "+b)}function b(b){b&&c("Database error: "+(b.message||" No message avaible"))}function k(b){if(!(this instanceof k))return new k(b);this.adapter=null;this.type=l;this.dbName="cache";this.dbVersion="1.0";this.dbTable="offline";this.dbDescription="offline cache";this.dbKey="key";this.init(b)}var l="indexedDatabase",n=u.helpers.utils,g=n.log,s=n.callback,p=null,t=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.OIndexedDB||e.msIndexedDB;k.prototype=
k.fn={isSupported:function(){null===p&&((p=!!t)||c(l+" is not supported"));return p},create:function(f,d,a){a=s(a);if(f&&p){var r=this.dbTable,e=this.dbName,h=this.adapter.transaction([r],"readwrite");f=h.objectStore(r).put({key:f,content:d});h.onerror=function(f){c("Failed to init transaction while creating/updating database entry "+e+" "+f);b(f);a(!1,f)};f.onerror=function(f){c("Failed to create/update database entry "+e+" "+f);b(f);a(!1,f)};f.onsuccess=function(){a(!0)}}else a(!1)},read:function(f,
d){d=s(d);if(f&&p){var a=this.dbTable,e=this.dbName,w=this.adapter.transaction([a],"readonly"),a=w.objectStore(a).get(f);w&&a?(w.onerror=function(a){c("Failed to init transaction while reading database "+e+" "+a);b(a);d(!1,a)},a.onerror=function(a){c("Failed to read database entry "+e+" "+a);b(a);d(!1,a)},a.onsuccess=function(a){a.target.result&&a.target.result.content?d(a.target.result.content):d(!1)}):d(!1)}else d(!1)},update:function(b,c,a){this.create(b,c,a)},remove:function(f,d){d=s(d);if(f&&
p){var a=this.dbTable,e=this.dbName,w=this.adapter.transaction([a],"readwrite"),a=w.objectStore(a).put({key:f,content:""});w.onerror=function(a){c("Failed to init transaction while deleting database entry "+e+" "+a);b(a);d(!1,a)};a.onerror=function(a){c("Failed to delete database entry "+e+" "+a);b(a);d(!1,a)};a.onsuccess=function(){d(!0)}}else d(!1)},open:function(f,d){d||(d=!1);f=s(f);var a=this,r=null,w=null,h=null,m=a.dbName,k=a.dbTable,v=function(b){b||f(!1);c("Try to create test resource");
a.create("test-item",'{test: "test-content"}',function(h){h?a.remove("test-item",function(){c("Test resource created and successfully deleted");f(b)}):f(!1)})},g,l,x,n,p;if(null===a.adapter)if(r=t){e.webkitIndexedDB!==q&&(e.IDBTransaction=e.webkitIDBTransaction,e.IDBKeyRange=e.webkitIDBKeyRange);g=function(b){b.createIndex(a.dbKey,a.dbKey,{unique:!0});b.createIndex("content","content",{unique:!1})};l=function(d){var e=w.result,r,l;a.adapter=e;c("Database request successfully done");a.dbVersion===
e.version||!e.setVersion&&"function"!==typeof e.setVersion?(a.adapter=e,v(e)):(h=d.currentTarget.result.setVersion(a.dbVersion),h.onfailure=function(a){c("Failed to open database: "+m+" "+a);b(a);f(!1)},h.onsuccess=function(h){r=w.result;try{l=r.createObjectStore(k,{keyPath:a.dbKey}),c("Database needs upgrade: "+m+" "+h.oldVersion+" "+h.newVersion),g(l)}catch(d){c("Failed to open database: "+m+" "+d),b(d),f(!1)}})};x=function(b){var f=w.result.createObjectStore(k,{keyPath:a.dbKey});c("Database needs upgrade: "+
m+" "+b.oldVersion+" "+b.newVersion);g(f)};n=function(h){c("Failed to open database: "+m+" "+h);b(h);d||a.open(f,!0);f(!1)};p=function(a){c("Opening database request is blocked! "+m+" "+a);b(a);f(!1)};if(d)try{w=r.open(m,a.dbVersion)}catch(u){c("Could not set version"),b(u),w=r.open(m)}else w=r.open(m);w.onsuccess=l;w.onupgradeneeded=x;w.onerror=n;w.onblocked=p}else f(!1);else v(a.adapter)},init:function(b){return this.isSupported()?(b&&(b.name&&(this.dbName=String(b.name)),b.version&&(this.dbVersion=
parseInt(b.version,10)),b.table&&(this.dbTable=b.table),b.description&&(this.dbDescription=String(b.description)),b.key&&(this.dbKey=b.key)),this):!1}};u.ns("cache.storage.adapter."+l,k)})(window,window.getNs());
(function(e,u,q){function c(b){g("["+n+" Adapter] "+b)}function b(b,c,a,e,k,h){!h&&b?b.transaction(function(b){b.executeSql(c,a,e,k)}):h?h.executeSql(c,a,e,k):k(null,{code:0,message:n+" isn't available"})}function k(b){var d="Errorcode: "+(b.code||"Code not present")+", Message: "+(b.message||"Message not present");b.info&&(d=d+" - "+b.info);c(d)}function l(b){if(!(this instanceof l))return new l(b);this.adapter=null;this.type=n;this.dbName="cache";this.dbVersion="1.0";this.dbDescription="resource cache";
this.dbTable="websql";this.dbSize=4194304;this.init(b)}var n="webSqlDatabase";q=u.helpers.utils;var g=q.log,s=q.callback,p=null,t=e.openDatabase;l.prototype=l.fn={isSupported:function(){null===p&&((p=!!t)||c(n+" is not supported"));return p},create:function(c,d,a){a=s(a);c&&p?b(this.adapter,"INSERT INTO "+this.dbTable+" (key, content) VALUES (?,?);",[c,d],function(){a(!0)},function(b,c){k(c);a(!1,c,{transaction:b})}):a(!1)},read:function(c,d){d=s(d);c&&p?b(this.adapter,"SELECT content FROM "+this.dbTable+
" WHERE key=?;",[c],function(a,b){var c=!1;b&&(b.rows&&1===b.rows.length)&&(c=b.rows.item(0).content);d(c,null,{transaction:a})},function(a,b){k(b);d(!1,b,{transaction:a})}):d(!1)},update:function(c,d,a){a=s(a);c&&p?b(this.adapter,"UPDATE "+this.dbTable+" SET content = ?  WHERE key=?;",[d,c],function(){a(!0)},function(b,c){k(c);a(!1,c,{transaction:b})}):a(!1)},remove:function(c,d){d=s(d);c&&p?b(this.adapter,"DELETE FROM "+this.dbTable+" WHERE key = ?;",[c],function(){d(!0)},function(a,b){k(b);d(!1,
b,{transaction:a})}):d(!1)},open:function(f){f=s(f);if(p){var d=this,a=d.adapter,r,g=function(a){a||f(!1);c("Try to create test resource");r=function(b){b?d.remove("test-item",function(){c("Test resource created and successfully deleted");f(a)}):f(!1)};d.read("test-item",function(a){a?d.update("test-item",'{test: "test-content"}',r):d.create("test-item",'{test: "test-content"}',r)})},h=function(a,h){c("Checking database table: name "+d.dbTable);b(a,"CREATE TABLE IF NOT EXISTS "+d.dbTable+"(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);",
[],function(){g(d.adapter)},function(a){k(a);g(!1)},h)},m=function(a){h(null,a)},l=function(a){a.info="Can't migrate to new database version. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.";k(a);f(!1)};try{if(null===a&&d.isSupported())if(c("Initializing database"),d.adapter=a=t(d.dbName,"",d.dbDescription,d.dbSize),String(a.version)!==String(d.dbVersion)&&a.changeVersion&&"function"===typeof a.changeVersion){c("Try to update version: new version "+
a.version+", old version "+d.dbVersion);try{a.changeVersion(a.version,d.dbVersion,m,l)}catch(v){k(v),f(!1)}}else c("Open database with version number: "+d.dbVersion),a=e.openDatabase(d.dbName,d.dbVersion,d.dbDescription,d.dbSize),h(a);else d.isSupported()&&(c("database already initialized"),g(a))}catch(n){k(n),f(!1)}}else f(!1)},init:function(b){return this.isSupported()?(b&&(b.description&&(this.dbDescription=b.description),b.name&&(this.dbName=b.name),b.size&&(this.dbSize=b.size),b.table&&(this.dbTable=
b.table),b.version&&(this.dbVersion=String(b.version))),this):!1}};u.ns("cache.storage.adapter."+n,l)})(window,window.getNs());
(function(e,u,q){function c(a){p("["+n+" Adapter] "+a)}function b(a){!a&&e.event&&(a=e.event);c("Event - key: "+(a.key||"no e.key event")+", url: "+(a.url||"no e.url event"))}function k(a){a=t(a);switch(a){case "local":a="localStorage";break;case "session":a="sessionStorage";break;default:a="localStorage"}return a}function l(a){if(!(this instanceof l))return new l(a);this.adapter=null;this.type=n;this.lifetime="local";this.asynch=!0;this.init(a)}var n="webStorage",g=u.helpers.utils,s=g.on,p=g.log,
t=g.trim,f=g.callback,d=null;l.prototype=l.fn={isSupported:function(){var a=k(this.lifetime);if(null===d)try{d=!!e[a]&&!!e[a].getItem}catch(b){c(n+" is not supported",b),d=!1}return d},create:function(a,c,d){var h=this,e=!0,k=function(a){if(h.asynch)d(a);else return a};d=f(d);if(!a)return k(!1);try{h.adapter.setItem(a,c)}catch(v){e=!e,b(v)}return k(e)},read:function(a,c){var d=this,h,e=!0,k=function(a){if(d.asynch)c(a);else return a};c=f(c);if(!a)return k(!1);try{e=(h=d.adapter.getItem(a))?h:!1}catch(v){e=
!e,b(v)}return k(e)},update:function(a,b,c){if(this.asynch)this.create(a,b,c);else return this.create(a,b,c)},remove:function(a,c){var d=this,h=!0,e=function(a){if(d.asynch)c(a);else return a};c=f(c);if(!a)return e(!1);try{d.adapter.removeItem(a)}catch(k){h=!h,b(k)}return e(h)},open:function(a){var d=this,g=d.adapter,h=k(d.lifetime),m,l,v=function(b){if(d.asynch)a(b);else return b};a=f(a);if(null===g)try{if(g=d.adapter=e[h],s(e,"storage",b),c("Lifetime used: "+h),c("Try to create test resource"),
d.asynch)d.create("test-item",'{test: "test-content"}',function(b){b?d.remove("test-item",function(){c("Test resource created and successfully deleted");a(g)}):a(!1)});else{if(m=d.create("test-item",'{test: "test-content"}'))if(l=d.remove("test-item"))return c("Test resource created and successfully deleted"),g;return!1}}catch(n){return b(n),v(!1)}else if(d.isSupported())return v(g)},init:function(a){return this.isSupported()?(a&&(a.lifetime&&(this.lifetime=t(String(a.lifetime))),a.asynch!==q&&(this.asynch=
!!a.asynch)),this):!1}};u.ns("cache.storage.adapter."+n,l)})(window,window.getNs());
(function(e,u,q,c){function b(a){f("["+n+" Adapter] "+a)}function k(a,c){c.isLoaded||(c.isLoaded=!0,c.progressCallback(100),e.setTimeout(function(){a();b("Event loaded")},c.delay))}function l(a){if(!(this instanceof l))return new l(a);this.adapter=null;this.type=n;this.isLoaded=!1;this.delay=0;this.opened=!0;this.message="New version available. Update page?";this.init(a)}var n="applicationCache",g=q.helpers,s=g.utils,p=g.dom,t=s.on,f=s.log,d=s.callback,a=null,r=u.getElementsByTagName("html")[0],w=
e.applicationCache;l.prototype=l.fn={isSupported:function(){null===a&&((a=!!w&&!!p.getAttribute(r,"manifest"))||b(n+" is not supported or there is no manifest html attribute"));return a},open:function(a,f){var g=this,v=g.adapter,l=0,r,x;g.opened=!0;a=d(a);f&&f.progress&&(r=f.progress);r=g.progressCallback=d(r);if(g.isSupported()&&null!==v){x=function(){b("Event updateready");try{v.swapCache()}catch(c){b("Event updateready: swapcache is not available",c)}confirm(g.message)?e.location.reload(!0):k(a,
g);return!1};t(v,"checking",function(){b("Event checking");return!1});t(v,"noupdate",function(){b("Event noupdate");k(a,g);return!1});t(v,"downloading",function(){b("Event downloading");l=0;return!1});t(v,"progress",function(a){b("Event progress");var d=0;g.delay=500;l+=1;d=a&&a.lengthComputable!==c?Math.round(100*a.loaded/a.total):Math.round(100*l/20);r(d);return!1});t(v,"cached",function(){b("Event cached");k(a,g);return!1});t(v,"updateready",function(){x()});t(v,"obsolete",function(){b("Event obsolete");
e.location.reload(!0);return!1});t(v,"error",function(){b("Event error");k(a,g);return!1});switch(v.status){case v.UNCACHED:k(a,g);break;case v.IDLE:k(a,g);break;case v.UPDATEREADY:x();break;case v.OBSOLETE:k(a,g)}t(e,"online",function(){try{v.update()}catch(a){b("Window event online: update cache is not available",a)}});e.setTimeout(function(){g.isLoaded||k(a,g)},12E3)}else k(a,g)},init:function(a){this.isSupported()&&(null===this.adapter&&(this.adapter=w),a&&(a.message&&(this.message=String(a.message)),
a.delay!==c&&(this.delay=parseInt(a.delay,10))));return this}};q.ns("cache.storage.adapter."+n,l)})(window,document,window.getNs());
(function(e,u,q,c){function b(a){v("["+r+" controller] "+a)}function k(a){var c="";a&&(c="Error Event: Description "+(a.description||"no description available"));b(c)}function l(a,b,c){c.timeout=e.setTimeout(function(){b(!1)},4E3);x(a,function(a){e.clearTimeout(c.timeout);delete c.timeout;a?b(a):b(!1)})}function n(a){var c=null;try{c=m.jsonToObject(a)}catch(d){k(d),b("Couldn't convert json string to object.")}return c}function g(a,b,d){if(I){var f=u.createElement("canvas"),h,e=new Image,g=null,k=
0,m=0;d||(d="jpeg");e.onerror=function(){e.onload=e.onerror=null;b()};e.onload=function(){e.onload=e.onerror=null;k=f.height=e.height;m=f.width=e.width;h=f.getContext("2d");h.fillStyle="rgba(50, 50, 50, 0)";h.fillRect(0,0,m,k);h.drawImage(e,0,0);g=f.toDataURL("image/"+d);b(g)};e.src=a;if(e.complete&&e.naturalWidth!==c)e.onload()}else b(!1)}function s(a){var b=a.data,c=a.url;"css"===a.type&&(c=m.url(c),c=c.folder,b=b.replace(/url\(\../g,"url("+c+".."),b=b.replace(/url\(\'../g,"url('"+c+".."),b=b.replace(/url\(\"../g,
'url("'+c+".."),a.data=b);return a}function p(a,b){return{ajax:a.ajax,data:a.data,expires:(new Date).getTime()+(a.lifetime||b.lifetime),group:a.group!==c?a.group:b.group,lastmod:a.lastmod||b.lastmod,lifetime:a.lifetime!==c?a.lifetime:b.lifetime,type:a.type||b.type,version:a.version||b.version}}function t(a){return B&&B[a]?!!B[a]:!1}function f(a,c){var d=null,e,h;a&&a.length?(e=a[0].type,h=a.slice(1),b("Testing for storage adapter type: "+e),A[e]?d=new A[e](F):f(h,c),d&&d.isSupported()?d.open(function(g){g?
(E=e,B=a[0],b("Used storage adapter type: "+E),c(d)):f(h,c)}):f(h,c)):c(!1)}function d(a,c,e){var h=null,g=0,m;if(e)try{b("Testing for preferred storage adapter type: "+e),A[e]?(h=new A[e](F))&&h.isSupported()?h.open(function(f){if(f){E=e;m=c.length;for(g=0;g<m;g+=1)c[g].type===e&&(B=c[g]);B?(b("Used storage type: "+E),a(h)):(b("Storage config not found: "+E),d(a,c))}else d(a,c)}):d(a,c):d(a,c)}catch(l){k(l),b("Storage adapter could not be initialized: type "+e),d(a,c)}else f(c,a)}function a(b,c){if(!(this instanceof
a))return new a(b,c);this.isEnabled=!0;this.appCacheAdapter=this.adapter=null;this.adapters={types:G,defaults:F};this.resources={defaults:H};this.init(b,c)}var r="storage",w=q.helpers,h=w.client,m=w.utils,C=m.isArray,v=m.log,z=m.callback,D=m.getJson(),x=m.xhr,y=m.trim,A=q.cache.storage.adapter,I=h.hasCanvas(),G=[{type:"fileSystem",css:!0,js:!0,html:!0,img:!0},{type:"indexedDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webSqlDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webStorage",css:!0,js:!0,html:!0,
img:!0}],F={name:"localcache",table:"cache",description:"local resource cache",size:4194304,version:"1.0",key:"key",lifetime:"local",offline:!0},E=null,B=null,H={ajax:!0,lifetime:2E4,group:0,lastmod:(new Date).getTime(),type:"css",version:1};a.prototype=a.fn={create:function(a,c){c=z(c);if(a&&a.url){var e=this,d=a.url,h=a.type,f=function(f){if(f)if(a.data=f,a=s(a),null!==e.adapter&&t(h)){f=m.jsonToString(d);var g=p(a,e.resources.defaults),l=m.jsonToString(g);a.expires=g.expires;a.version=g.version;
try{e.adapter.create(f,l,function(e){e?(b("Create new resource in storage adapter: type "+h+", url "+d),c(a)):(b("Create new resource in storage adapter failed"),c(!1))})}catch(v){k(v),b("Create new resource in storage adapter failed"),c(a)}}else b("Trying to create new resource, but resource type is not cachable or storage adapter is not available: type "+h+", url "+d),c(a);else b("Couldn't get data via network"),c(a)};a.ajax?"img"===h?g(d,f):l(d,f,a):a.data?f(a.data):c(!1)}else c(!1)},read:function(a,
c){c=z(c);if(a&&a.url){var e=this,d=a.url,f=a.type;if(null!==this.adapter&&t(f)){b("Trying to read resource from storage: type "+f+", url "+d);try{e.adapter.read(m.jsonToString(d),function(h){h?(a=n(h))?(a.url=d,b("Successfully read resource from storage: type "+f+", url "+d),c(a,!0)):e.remove({url:d,type:f},function(){c(!1)}):(b("There is no data coming back from storage while reading: type "+f+", url "+d),c(!1))})}catch(h){k(h),b("Try to read resource from storage, but storage adapter is not available: type "+
f+", url "+d),l(d,function(e){b("Data loaded via ajax: type "+f+", url "+d+", data status "+!!e);a.data=e;c(a,!0)},a)}}else c(a)}else c(!1)},update:function(a,c){c=z(c);if(a&&a.url){var d=this,e=a.url,f=a.type,h=function(h){if(h)if(a.data=h,a=s(a),null!==d.adapter&&t(f)){h=m.jsonToString(e);var g=p(a,d.resources.defaults),l=m.jsonToString(g);a.expires=g.expires;a.version=g.version;try{d.adapter.update(h,l,function(d){d?(b("Updated existing resource in storage adapter: type "+f+", url "+e),c(a)):(b("Updating resource in storage failed."),
c(!1))})}catch(v){k(v),b("Updating resource in storage failed."),c(a)}}else b("Resource type is not cachable or storage adapter is not available: type "+f+", url "+e),c(a);else b("Couldn't get data via network, trying to used stored version"),d.read(a,function(b){b&&b.data?(a.data=b.data,c(a)):c(!1)})};a.ajax?"img"===f?g(e,h):l(e,h,a):a.data?h(a.data):c(!1)}else c(!1)},remove:function(a,c){c=z(c);if(a&&a.url){var d=a.url,e=a.type;null!==this.adapter&&t(e)?this.adapter.remove(m.jsonToString(d),function(f){f?
(b("Delete resource form storage: type "+e+", url "+d),c(a)):(b("Deleting resource form storage failed: type "+e+", url "+d),c(!1))}):(b("Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type "+e+", url "+d),c(a))}else c(!1)},init:function(a,e){var f=this,h=!1,g,k,m,l;a=z(a);e&&e.isEnabled!==c&&(f.isEnabled=!!e.isEnabled);if(f.isEnabled&&D){if(e){if(e.adapters){g=e.adapters;if(g.types&&C(g.types)){k=g.types;m=k.length;for(l=0;l<m;l+=1)k[l].css===c&&
(k[l].css=!0),k[l].js===c&&(k[l].js=!0),k[l].img===c&&(k[l].img=!0),k[l].html===c&&(k[l].html=!0);f.adapters.types=k}g.defaults&&(k=g.defaults,m=f.adapters.defaults,k.name&&(m.name=y(String(k.name))),k.table&&(m.table=y(String(k.table))),k.description&&(m.description=y(String(k.description))),k.size&&(m.size=parseInt(k.size,10)),k.version&&(m.version=y(String(k.version))),k.key&&(m.key=y(String(k.key))),k.lifetime&&(m.lifetime=y(String(k.lifetime))),k.offline!==c&&(m.offline=!!k.offline));g.preferredType&&
(h=y(String(g.preferredType)))}e.resources&&(g=e.resources,g.defaults&&(g=g.defaults,k=f.resources.defaults,g.ajax!==c&&(k.ajax=!!g.ajax),g.lifetime!==c&&(k.lifetime=parseInt(g.lifetime,10)),g.group!==c&&(k.group=parseInt(g.group,10)),g.lastmod!==c&&(k.lastmod=parseInt(g.lastmod,10)),g.type&&(k.type=y(String(g.type))),g.group!==c&&(k.version=parseFloat(g.version)),g.loaded&&(k.loaded=z(g.loaded))))}d(function(b){b||(f.isEnabled=!1);f.adapter=b;a(f)},f.adapters.types,h);f.adapters.defaults.offline&&
(A.applicationCache&&!f.appCacheAdapter)&&(f.appCacheAdapter=new A.applicationCache(F))}else D||b("There is no json support"),f.isEnabled||b("Caching data is disabled"),a(f)}};q.ns("cache."+r+".controller",a)})(window,document,window.getNs());
(function(e,u){function q(a){p("["+k+" controller] "+a)}function c(a){var b=f(a.type);if("js"!==b||"css"!==b||"html"!==b||"img"!==b||"custom"!==b){switch(g.url(a.url).extension){case "js":a="js";break;case "css":a="css";break;case "html":a="html";break;case "jpg":case "jpeg":case "png":a="img";break;default:a="custom"}b=a}return b}function b(a,c){if(!(this instanceof b))return new b(a,c);this.storage=null;this.init(a,c)}var k="cache",l=e.helpers,n=l.dom,g=l.utils,s=l.client,p=g.log,t=g.isArray,f=
g.trim,d=g.callback;b.prototype=b.fn={load:function(a,b){var e=this,h=(new Date).getTime(),g=function(){var a=0,b=0,c=null;return{init:function(e,d){c=d;a=e;b=0},loaded:function(){b+=1;b===a&&c()}}}(),k=function(a,b,c){var e=a.url,d=function(){a.loaded(a);g.loaded()},f=a.node||null;c=!!c;switch(a.type){case "js":n.appendJs(e,b,d,f,c);break;case "css":n.appendCss(e,b,d,f,c);break;case "img":n.appendImg(e,b,d,f,c);break;case "html":n.appendHtml(e,b,d,f,c);break;default:q("Didn't match any type for dom append: type "+
a.type),d()}},l=function(a){var b=a.data||null,c=function(a,b){a&&a.data?k(a,a.data,b):k(a,null,b)},f=e.storage,g=f.resources.defaults;a.ajax=a.ajax!==u?!!a.ajax:g.ajax;a.loaded=a.loaded!==u?d(a.loaded):d(g.loaded);f.read(a,function(d){if(d&&d.data){var g=a,m=e.storage.resources.defaults,l=parseInt(d.lifetime,10),v=d.version,n=d.lastmod?d.lastmod:0,r=!1,p,t=g.lastmod?g.lastmod:0,r=!0;p=!1;g.version=p=g.version!==u?parseFloat(g.version):m.version;g.group=g.group!==u?parseFloat(g.group):m.group;t&&
n?(g.lastmod=parseInt(t,10),r=n===g.lastmod):!t&&n?t=n:t||(t=m.lastmod);r=r&&p===v;p=0!==l&&(-1!==l&&r&&d.expires>h||-1===l&&r);g.lastmod=t;g.isValid=p;a=g;a.isValid||!s.isOnline()?(q("Resource is up to date: type "+a.type+", url "+a.url),(b=d.data)&&k(a,b)):(q("Resource is outdated and needs update: type "+a.type+", url "+a.url),f.update(a,c))}else q("Resource or resource data is not available in storage adapter, try to create it: type "+a.type+", url "+a.url),f.create(a,c)})},p=function(a,b){var d=
0,e=a.length,h=null;g.init(e,b);for(d=0;d<e;d+=1)(h=a[d])&&h.url&&(h.url=f(h.url),h.type=c(h),l(h))},D=function(a,b,c){var d=a.length;for(c||(c=0);!a[c]&&c<d;)c+=1;c>=d?b(e):(d=a[c],p(d,function(){D(a,b,c+1)}))};(function(a,c){var e;a&&t(a)||(a=[]);e=a.length;for(var f=a,h=[],g,k=0,m,l=f.length,k=0;k<l;k+=1)m=f[k],(g=m.group)||(g=0),g=h[g]?h[g]:h[g]=[],g.push(m);a=h;c=d(b);q("Load resource function called: "+e+" resources, "+a.length+" groups");D(a,c)})(a,b)},remove:function(a,b){var e=this.storage,
h=function(a,b){var d=a.length,h,g,k=function(a,c){q("Successfully removed resource: url "+c);a===d-1&&b()};if(d)for(h=0;h<d;h+=1)(g=a[h])&&g.url&&(g.url=f(g.url),g.type=c(g),e.remove(g,k(h,g.url)));else b()};(function(a,c){a&&t(a)||(a=[]);c=d(b);q("Remove resource function called: resources count "+a.length);h(a,c)})(a,b)},init:function(a,b){var c=this;a=d(a);q("Cache initializing, checking for storage and adapters");e.cache.storage.controller(function(b){c.storage=b;a(b)},b);return c}};e.ns(k+".controller",
b)})(window.getNs());
(function(e,u,q){function c(a){s("[cache interface] "+a)}function b(a){this.storage=this.controller=null;this.params=a;this.queue=new g;this.timeout=this.interval=this.calls=0}function k(a){var c=null,d=n.length,e;a||(a=w);if(t)for(e=0;e<d;e+=1)f(n[e].params)===f(a)&&(c=n[e]);c||(c=new b(a),n.push(c));return c}function l(b,d,f){var g=k(b),l,n,p,q=function(){l=g.interval;e.clearInterval(l);l=e.setInterval(function(){g.timeout=n=g.timeout+a;p=g.storage;g.controller&&(p&&(p.adapter||!p.isEnabled))&&
(e.clearInterval(l),g.queue.flush());n>r&&(e.clearInterval(l),c("Timeout reached while waiting for cache controller!!!"),f())},a)};g?g.storage?d(g):(g.queue.add(function(){d(g)}),g.calls+=1,1===g.calls?g.controller=new u.cache.controller(function(a){g.storage=a;g.controller?g.queue.flush():q()},b):q()):(c("Whether finding nor initializing a cache interface is possible!!!"),f())}var n=[];q=u.helpers;var g=q.queue;q=q.utils;var s=q.log,p=q.isArray,t=q.getJson(),f=q.jsonToString,d=q.callback,a=15,r=
5E3,w={};q=function(){return{load:function(a,b,e){b=d(b);l(e,function(c){p(a)?c.controller.load(a,b):"applicationCache"===a?(c=c.storage)&&c.appCacheAdapter?c.appCacheAdapter.open(b,e):b(!1):b(!1)},function(){c("Get interface failed!");b(!1)});return this},remove:function(a,b,e){b=d(b);l(e,function(c){p(a)?c.controller.remove(a,b):b(!1)},function(){c("Get interface failed!");b(!1)});return this},setup:function(a){a&&(w=a);return this}}}();u.ns("cache.load",q.load);u.ns("cache.remove",q.remove);u.ns("cache.setup",
q.setup)})(window,window.getNs());
