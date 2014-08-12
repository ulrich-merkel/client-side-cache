(function(c,r){function k(){c[b]||(c[b]={});return c[b]}var b="app",a;a=k();a.namespace=a.ns=function(a,f){if(a){a=String(a);var n=a.split("."),t=n.length,p=c[b],q;p||(c[b]={});if(!n)return!1;for(q=0;q<t;q+=1)p[n[q]]||(p[n[q]]={}),q===t-1&&f!==r&&(p[n[q]]=f),p=p[n[q]];return p}return!1};c[b]=a;c.getNamespace=c.getNs=k})(window);
(function(c,r){function k(){if(!(this instanceof k))return new k;this.m=[];this.r=null;this.f=!1}k.prototype=k.fn={add:function(b){this.f?b(this.r):this.m.push(b)},flush:function(b){if(!this.f)for(this.r=b,this.f=!0;this.m[0];)this.m.shift()(b)}};c.ns("helpers.queue",k)})(window.getNs());
(function(c,r,k,b){var a=function(){var c=[];return{isString:function(a){return"string"===typeof a||a instanceof String},isFunction:function(a){var b=!1;return b=Object.prototype.toString?"[object Function]"===Object.prototype.toString.call(a):"function"===typeof a||a instanceof Function},isArray:function(b){var c=Array.isArray,l=Object.prototype.toString;a.isArray=c&&"function"===typeof c?function(a){return c(a)}:l&&"function"===l?function(a){return"[object Array]"===l.call(a)}:function(a){return!!a&&
!!a.sort&&"function"===typeof a.sort};return a.isArray(b)},inArray:function(b,n,t){a.inArray=Array.prototype.indexOf?function(a,b,f){return c.indexOf.call(b,a,f)}:function(a,b,f){var h=b.length,s=0;if(f)return b[f]&&b[f]===a?f:-1;for(s=0;s<h;s+=1)if(b[s]===a)return s;return-1};return a.inArray(b,n,t)},callback:function(f){a.isFunction(f)||(f=function(){return b});return f},url:function(b){if(a.isString(b)){var c=r.createElement("a"),l;c.href=b;l=c.pathname.match(/\/([^\/?#]+)$/i);return{source:b,
protocol:c.protocol,host:c.hostname,port:c.port,query:c.search,file:l?l[1]:"/",hash:c.hash,path:c.pathname.replace(/^([^\/])/,"/$1"),extension:function(a){a=a.split(".");return a.length?a[a.length-1]:!1}(b),folder:function(){var a=b.lastIndexOf("/");return b.substr(0,a+1)}()}}},trim:function(b){if(!a.isString(b))return b;a.isFunction(String.prototype.trim)||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});return b.trim()}}}();k.ns("helpers.utils",a)})(window,document,window.getNs());
(function(c,r,k,b){var a=function(){var l=c.console!==b,f=l?c.console:null,n=l&&f.log!==b,t=l&&f.warn!==b,p=l&&f.error!==b,q=l&&f.time!==b&&f.timeEnd!==b;return{logToScreen:function(a){var h=r.getElementById("log"),s=r.createElement("p");a=r.createTextNode(a);h&&(s.appendChild(a),h.appendChild(s))},log:function(){var b=Array.prototype.slice.call(arguments);b.length&&(n&&(f.log.apply?f.log.apply(f,b):f.log(b)),b=b[0],a.logToScreen(b))},warn:function(){var b=Array.prototype.slice.call(arguments),h;
b.length&&(h=b[0],t?f.warn.apply(f,b):a.log(h),a.logToScreen(h))},error:function(){var b=Array.prototype.slice.call(arguments),h;b.length&&(h=b[0],p?f.error.apply(f,b):a.log(h),a.logToScreen(h))},save:function(){l&&(c.Blob&&c.JSON&&c.URL)&&(f.save=function(a,h){if(!a&&p)f.error("Console.save: No data");else{h||(h="console.json");"object"===typeof a&&(a=JSON.stringify(a,b,4));var s=new Blob([a],{type:"text/json"}),e=r.createEvent("MouseEvents"),d=r.createElement("a");d.download=h;d.href=c.URL.createObjectURL(s);
d.dataset.downloadurl=["text/json",d.download,d.href].join(":");e.initMouseEvent("click",!0,!1,c,0,0,0,0,0,!1,!1,!1,!1,0,null);d.dispatchEvent(e)}})},logTimerStart:function(a){q&&f.time(a)},logTimerEnd:function(a){q&&f.timeEnd(a)}}}();k.namespace("helpers.console",a)})(window,document,window.getNs());
(function(c,r,k){var b=function(){var a=r.helpers.utils;return{getXhr:function(){for(var a=null,b=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],c=b.length,t=0,t=0;t<c;t+=1){try{a=b[t]()}catch(p){continue}break}return a},xhr:function(c,f,n,t){var p=b.getXhr(),q,r="GET";f=a.callback(f);if(p)if(c){t!==k?r="POST":t=null;n===k&&(n=!0);q=function(){if(4===
p.readyState&&(200<=p.status&&400>p.status||0===p.status))try{var a=p.responseText;a?f(a):f(!1)}catch(e){f(!1)}else 4===p.readyState&&f(!1)};p.open(r,c,n);try{p.onreadystatechange!==k?p.onreadystatechange=q:p.onload!==k&&(p.onload=q)}catch(h){}p.send(t)}else f(!1);else f(!1)}}}();r.namespace("helpers.ajax",b)})(window,window.getNs());
(function(c,r,k,b){var a=function(){return{on:function(b,f,n){a.on="function"===typeof c.addEventListener?function(a,b,c){a.addEventListener(b,c,!1)}:"function"===typeof r.attachEvent?function(a,b,c){a.attachEvent("on"+b,c)}:function(a,b,c){a["on"+b]=c};a.on(b,f,n)},off:function(b,f,n){a.off="function"===typeof c.removeEventListener?function(a,b,c){a.removeEventListener(b,c,!1)}:"function"===typeof r.detachEvent?function(a,b,c){a.detachEvent("on"+b,c)}:function(a,b){a["on"+b]=null};a.off(b,f,n)}}}();
k.namespace("helpers.events",a)})(window,document,window.getNs());(function(c,r,k,b){var a=function(){var l=null,f=c.JSON;return{getJson:function(){null===l&&f&&f.stringify&&(l=f);return l},jsonToString:function(c,f,p){var k=!1;null===l&&(l=a.getJson());l&&(l.stringify&&c!==b)&&(k=l.stringify(c,f,p));return k},jsonToObject:function(c,f){var k=!1;null===l&&(l=a.getJson());l&&(l.parse&&c!==b)&&(k=l.parse(String(c),f));return k}}}();k.namespace("helpers.json",a)})(window,document,window.getNs());
(function(c,r,k,b){var a=function(){function a(){p===b&&(h(c,"online",a),h(c,"offline",a));p=r.onLine!==b?!!r.onLine:!0}var f,n,t,p,q,v=(r.userAgent||r.vendor||c.opera).toLowerCase(),h=k.helpers.events.on;return{isWebkit:function(){f===b&&(f=null!==v.match(/(webkit)/));return f},isMsie:function(){t===b&&(t=null!==v.match(/(msie)/));return t},isOpera:function(){n===b&&(n=null!==v.match(/(opera)/));return n},isOnline:function(){p===b&&a();return p},hasCanvas:function(){if(q===b){var a=document.createElement("canvas");
q=!(!a.getContext||!a.getContext("2d"))}return q}}}();k.ns("helpers.client",a)})(window,window.navigator,window.getNs());
(function(c,r,k){function b(a,b){b&&(b.dom?a=b.dom:b.id&&(a=c.getElementById(b.id)));return a}var a=function(){var l=r.helpers,f=l.utils,n=l.client,t=[],p=[],q=[],v=[],h=c.getElementsByTagName("head")[0];return{nuke:function(){t=[];p=[];q=[];v=[]},createDomNode:function(a,e){var d=c.createElement(a),b;if(e)for(b in e)e.hasOwnProperty(b)&&d.setAttribute(b,e[b]);return d},getAttribute:function(a,e){return a.getAttribute(e)},setAttribute:function(a,e,d){a.setAttribute(e,d)},appendCss:function(s,e,d,
m,g){if(-1===f.inArray(s,t)||g){var u=null,x=!1,w,l,u=b(u,m);if(null!==e){u||(u=a.createDomNode("style",{type:"text/css"}),u.className="lazyloaded");u.onerror=function(){d(!1)};m||h.appendChild(u);try{w=c.createTextNode(e),u.appendChild(w)}catch(y){u.styleSheet.cssText=e}finally{d(!0)}}else null!==s&&(u||(u=a.createDomNode("link",{rel:"stylesheet",type:"text/css"}),u.className="lazyloaded"),u.onerror=u.error=function(){u.onload=u.load=null;x=!0;window.clearTimeout(l);d(!1)},m||h.appendChild(u),n.isMsie()||
n.isOpera()?u.onload=u.load=function(){u.onerror=u.error=null;x=!0;window.clearTimeout(l);d(!0)}:d(!0),u.href=s,l=window.setTimeout(function(){x||d(!1)},4E3));t.push(s)}else d(!0)},appendJs:function(s,e,d,m,g){if(-1===f.inArray(s,p)||g){g=a.createDomNode("script");var u=c.getElementsByTagName("script")[0],x=!1,w=!1,l;(g=b(g,m))?(g.type="text/javascript",g.className="lazyloaded",g.async=!0,g.onreadystatechange=g.onload=function(){w||this.readyState&&"complete"!==this.readyState&&"loaded"!==this.readyState||
(this.onreadystatechange=this.onload=null,x=w=!0,window.clearTimeout(l),p.push(s),d(!0))},g.onerror=function(){this.onload=this.onreadystatechange=this.onerror=null;window.clearTimeout(l);x=!0;d(!1)},m||(u?u.parentNode.insertBefore(g,u):h.appendChild(g)),e&&!w?(g.textContent?g.textContent=e:g.nodeValue?g.nodeValue=e:g.text=e,x=w=!0):null!==s&&(g.src=s),w&&(p.push(s),x=!0,d(!0)),x||(l=window.setTimeout(function(){w||d(!1)},5E3))):d(!1)}else d(!0)},appendImg:function(a,e,d,m){var g=null;(g=b(g,m))||
(g=new Image);g.onerror=function(){g.onload=g.onerror=null;d(!1)};g.onload=function(){g.onload=g.onerror=null;d(!0)};e?g.src=e:a&&(g.src=a);if(g.complete&&g.naturalWidth!==k)g.onload();q.push(a)},appendHtml:function(a,e,d,m){var g=b(null,m);if(g){if(e)try{g.innerHTML=e,m.id&&n.isMsie()&&c.styleSheets[0].addRule("#"+m.id+":after",'content: " ";')}catch(h){g.innerText=e}d(!0);v.push(a)}else d(!1)}}}();r.ns("helpers.dom",a)})(document,window.getNs());
(function(c,r,k){function b(a){q("["+t+" Adapter] "+a)}function a(a){if(a){var d=a.name||a.code,m=a.message||a.description||"",g=m;if(FileError)switch(d){case FileError.ENCODING_ERR:case "EncodingError":g="Error Event: ENCODING_ERR "+m;break;case FileError.INVALID_MODIFICATION_ERR:case "InvalidModificationError":g="Error Event: INVALID_MODIFICATION_ERR";break;case FileError.INVALID_STATE_ERR:case "InvalidStateError":g="Error Event: INVALID_STATE_ERR "+m;break;case FileError.NO_MODIFICATION_ALLOWED_ERR:case "NoModificationAllowedError":g=
"Error Event: NO_MODIFICATION_ALLOWED_ERR "+m;break;case FileError.NOT_FOUND_ERR:case "NotFoundError":g="Error Event: NOT_FOUND_ERR "+m;break;case FileError.NOT_READABLE_ERR:case "NotReadableError":g="Error Event: NOT_READABLE_ERR "+m;break;case FileError.PATH_EXISTS_ERR:case "PathExistsError":g="Error Event: PATH_EXISTS_ERR "+m;break;case FileError.QUOTA_EXCEEDED_ERR:case "QuotaExceededError":g="Error Event: QUOTA_EXCEEDED_ERR "+m;break;case FileError.SECURITY_ERR:case "SecurityError":g="Error Event: SECURITY_ERR "+
m;break;case FileError.TYPE_MISMATCH_ERR:case "TypeMismatchError":g="Error Event: TYPE_MISMATCH_ERR "+m;break;default:g="Error Event: Unknown Error "+m}else g="Error Event: Unknown Error, no FileError available";b(g,a)}}function l(b,d,m){var g=function(d){a(d);m(!1)};if("."===d[0]||""===d[0])d=d.slice(1);d[0]?b.getDirectory(d[0],{create:!0},function(a){d.length?l(a,d.slice(1),m):m(!0)},g):m(!0)}function f(a,d,b){d=d.split("/");var g=d.length,h="",c=0;b=v(b);if(g){for(c=0;c<g-1;c+=1)h=h+d[c]+"/";l(a.root,
h.split("/"),b)}else b(!0)}function n(a){if(!(this instanceof n))return new n(a);this.adapter=null;this.type=t;this.size=52428800;this.init(a)}var t="fileSystem";k=r.helpers;var p=k.json,q=k.console.log,v=k.utils.callback,h=null,s=c.requestFileSystem||c.webkitRequestFileSystem||c.moz_requestFileSystem;n.prototype=n.fn={isSupported:function(){null===h&&((h=!!s&&(!!c.Blob||!!c.BlobBuilder)&&c.FileReader)||b(t+" is not supported"));return h},open:function(e){var d=this,m=d.adapter,g=function(b){a(b);
e(!1)};e=v(e);h?null===m?(c.requestFileSystem=s,c.requestFileSystem(c.TEMPORARY,d.size,function(a){m=d.adapter=a;b("Try to create test resource");try{d.create("test-item",p.jsonToString({test:"test-content"}),function(a){a?d.remove("test-item",function(){b("Test resource created and successfully deleted");e(m)}):g()})}catch(h){g(h)}},g)):(b("Adapter already opened"),e(m)):e(!1)},create:function(e,d,m){m=v(m);if(e&&h){var g=this.adapter,c=function(b){a(b);m(!1,b)};f(g,e,function(){g.root.getFile(e,
{create:!0},function(a){a.createWriter(function(a){var h;a.onwriteend=function(){b("File successfully written: url "+e);m(!0)};a.onerror=c;try{Blob?(h=new Blob([d],{type:"text/plain"}),a.write(h)):BlobBuilder&&(h=new BlobBuilder,h.append(d),a.write(h.getBlob("application/json")))}catch(g){c(g)}},c)},c)})}else m(!1)},read:function(b,d){d=v(d);if(b&&h){var m=this.adapter,g=function(b){a(b);d(!1,b)};f(m,b,function(){m.root.getFile(b,{create:!1},function(a){a.file(function(a){var b=new FileReader;b.onloadend=
function(){d(this.result)};b.onerror=g;b.onabort=g;b.readAsText(a)},g)},g)})}else d(!1)},update:function(a,b,h){this.create(a,b,h)},remove:function(b,d){d=v(d);if(b&&h){var m=this.adapter,g=function(b){a(b);d(!1,b)};f(m,b,function(){m.root.getFile(b,{create:!1},function(a){a.remove(function(){d(!0)},g)},g)})}else d(!1)},init:function(a){return this.isSupported()?(a&&a.size&&(this.size=a.size),this):!1}};r.ns("cache.storage.adapter."+t,n)})(window,window.getNs());
(function(c,r,k){function b(a){t("["+f+" Adapter] "+a)}function a(a){a&&b("Database error: "+(a.message||" No message avaible"))}function l(a){if(!(this instanceof l))return new l(a);this.adapter=null;this.type=f;this.dbName="cache";this.dbVersion="1.0";this.dbTable="offline";this.dbDescription="offline cache";this.dbKey="key";this.init(a)}var f="indexedDatabase",n=r.helpers,t=n.console.log,p=n.utils.callback,q=null,v=c.indexedDB||c.webkitIndexedDB||c.mozIndexedDB||c.OIndexedDB||c.msIndexedDB;l.prototype=
l.fn={isSupported:function(){null===q&&((q=!!v)||b(f+" is not supported"));return q},create:function(h,c,e){e=p(e);if(h&&q){var d=this.dbTable,m=this.dbName,g=this.adapter.transaction([d],"readwrite");h=g.objectStore(d).put({key:h,content:c});g.onerror=function(d){b("Failed to init transaction while creating/updating database entry "+m+" "+d);a(d);e(!1,d)};h.onerror=function(d){b("Failed to create/update database entry "+m+" "+d);a(d);e(!1,d)};h.onsuccess=function(){e(!0)}}else e(!1)},read:function(h,
c){c=p(c);if(h&&q){var e=this.dbTable,d=this.dbName,m=this.adapter.transaction([e],"readonly"),e=m.objectStore(e).get(h);m&&e?(m.onerror=function(g){b("Failed to init transaction while reading database "+d+" "+g);a(g);c(!1,g)},e.onerror=function(g){b("Failed to read database entry "+d+" "+g);a(g);c(!1,g)},e.onsuccess=function(a){a.target.result&&a.target.result.content?c(a.target.result.content):c(!1)}):c(!1)}else c(!1)},update:function(a,b,e){this.create(a,b,e)},remove:function(h,c){c=p(c);if(h&&
q){var e=this.dbTable,d=this.dbName,m=this.adapter.transaction([e],"readwrite"),e=m.objectStore(e).put({key:h,content:""});m.onerror=function(e){b("Failed to init transaction while deleting database entry "+d+" "+e);a(e);c(!1,e)};e.onerror=function(e){b("Failed to delete database entry "+d+" "+e);a(e);c(!1,e)};e.onsuccess=function(){c(!0)}}else c(!1)},open:function(h,s){s||(s=!1);h=p(h);var e=this,d=null,m=null,g=null,f=e.dbName,x=e.dbTable,l=function(a){a||h(!1);b("Try to create test resource");
e.create("test-item",'{test: "test-content"}',function(d){d?e.remove("test-item",function(){b("Test resource created and successfully deleted");h(a)}):h(!1)})},n,y,A,q,r;if(null===e.adapter)if(d=v){c.webkitIndexedDB!==k&&(c.IDBTransaction=c.webkitIDBTransaction,c.IDBKeyRange=c.webkitIDBKeyRange);n=function(a){a.createIndex(e.dbKey,e.dbKey,{unique:!0});a.createIndex("content","content",{unique:!1})};y=function(d){var c=m.result,s,A;e.adapter=c;b("Database request successfully done");e.dbVersion===
c.version||!c.setVersion&&"function"!==typeof c.setVersion?(e.adapter=c,l(c)):(g=d.currentTarget.result.setVersion(e.dbVersion),g.onfailure=function(d){b("Failed to open database: "+f+" "+d);a(d);h(!1)},g.onsuccess=function(d){s=m.result;try{A=s.createObjectStore(x,{keyPath:e.dbKey}),b("Database needs upgrade: "+f+" "+d.oldVersion+" "+d.newVersion),n(A)}catch(c){b("Failed to open database: "+f+" "+c),a(c),h(!1)}})};A=function(a){var d=m.result.createObjectStore(x,{keyPath:e.dbKey});b("Database needs upgrade: "+
f+" "+a.oldVersion+" "+a.newVersion);n(d)};q=function(d){b("Failed to open database: "+f+" "+d);a(d);s||e.open(h,!0);h(!1)};r=function(d){b("Opening database request is blocked! "+f+" "+d);a(d);h(!1)};if(s)try{m=d.open(f,e.dbVersion)}catch(t){b("Could not set version"),a(t),m=d.open(f)}else m=d.open(f);m.onsuccess=y;m.onupgradeneeded=A;m.onerror=q;m.onblocked=r}else h(!1);else l(e.adapter)},init:function(a){return this.isSupported()?(a&&(a.name&&(this.dbName=String(a.name)),a.version&&(this.dbVersion=
parseInt(a.version,10)),a.table&&(this.dbTable=a.table),a.description&&(this.dbDescription=String(a.description)),a.key&&(this.dbKey=a.key)),this):!1}};r.ns("cache.storage.adapter."+f,l)})(window,window.getNs());
(function(c,r,k){function b(a){t("["+n+" Adapter] "+a)}function a(a,b,c,d,m,g){!g&&a?a.transaction(function(a){a.executeSql(b,c,d,m)}):g?g.executeSql(b,c,d,m):m(null,{code:0,message:n+" isn't available"})}function l(a){var c="Errorcode: "+(a.code||"Code not present")+", Message: "+(a.message||"Message not present");a.info&&(c=c+" - "+a.info);b(c)}function f(a){if(!(this instanceof f))return new f(a);this.adapter=null;this.type=n;this.dbName="cache";this.dbVersion="1.0";this.dbDescription="resource cache";
this.dbTable="websql";this.dbSize=4194304;this.init(a)}var n="webSqlDatabase";k=r.helpers;var t=k.console.log,p=k.utils.callback,q=null,v=c.openDatabase;f.prototype=f.fn={isSupported:function(){null===q&&((q=!!v)||b(n+" is not supported"));return q},create:function(b,c,e){e=p(e);b&&q?a(this.adapter,"INSERT INTO "+this.dbTable+" (key, content) VALUES (?,?);",[b,c],function(){e(!0)},function(a,b){l(b);e(!1,b,{transaction:a})}):e(!1)},read:function(b,c){c=p(c);b&&q?a(this.adapter,"SELECT content FROM "+
this.dbTable+" WHERE key=?;",[b],function(a,b){var m=!1;b&&(b.rows&&1===b.rows.length)&&(m=b.rows.item(0).content);c(m,null,{transaction:a})},function(a,b){l(b);c(!1,b,{transaction:a})}):c(!1)},update:function(b,c,e){e=p(e);b&&q?a(this.adapter,"UPDATE "+this.dbTable+" SET content = ?  WHERE key=?;",[c,b],function(){e(!0)},function(a,b){l(b);e(!1,b,{transaction:a})}):e(!1)},remove:function(b,c){c=p(c);b&&q?a(this.adapter,"DELETE FROM "+this.dbTable+" WHERE key = ?;",[b],function(){c(!0)},function(a,
b){l(b);c(!1,b,{transaction:a})}):c(!1)},open:function(h){h=p(h);if(q){var f=this,e=f.adapter,d,m=function(a){a||h(!1);b("Try to create test resource");d=function(d){d?f.remove("test-item",function(){b("Test resource created and successfully deleted");h(a)}):h(!1)};f.read("test-item",function(a){a?f.update("test-item",'{test: "test-content"}',d):f.create("test-item",'{test: "test-content"}',d)})},g=function(d,c){b("Checking database table: name "+f.dbTable);a(d,"CREATE TABLE IF NOT EXISTS "+f.dbTable+
"(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, content TEXT NOT NULL);",[],function(){m(f.adapter)},function(a){l(a);m(!1)},c)},u=function(a){g(null,a)},x=function(a){a.info="Can't migrate to new database version. This may be caused by non-standard implementation of the changeVersion method. Please switch back your database version to use webSql on this device.";l(a);h(!1)};try{if(null===e&&f.isSupported())if(b("Initializing database"),f.adapter=e=v(f.dbName,"",f.dbDescription,
f.dbSize),String(e.version)!==String(f.dbVersion)&&e.changeVersion&&"function"===typeof e.changeVersion){b("Try to update version: new version "+e.version+", old version "+f.dbVersion);try{e.changeVersion(e.version,f.dbVersion,u,x)}catch(k){l(k),h(!1)}}else b("Open database with version number: "+f.dbVersion),e=c.openDatabase(f.dbName,f.dbVersion,f.dbDescription,f.dbSize),g(e);else f.isSupported()&&(b("database already initialized"),m(e))}catch(n){l(n),h(!1)}}else h(!1)},init:function(a){return this.isSupported()?
(a&&(a.description&&(this.dbDescription=a.description),a.name&&(this.dbName=a.name),a.size&&(this.dbSize=a.size),a.table&&(this.dbTable=a.table),a.version&&(this.dbVersion=String(a.version))),this):!1}};r.ns("cache.storage.adapter."+n,f)})(window,window.getNs());
(function(c,r,k){function b(a){v("["+n+" Adapter] "+a)}function a(a){!a&&c.event&&(a=c.event);b("Event - key: "+(a.key||"no e.key event")+", url: "+(a.url||"no e.url event"))}function l(a){a=h(a);switch(a){case "local":a="localStorage";break;case "session":a="sessionStorage";break;default:a="localStorage"}return a}function f(a){if(!(this instanceof f))return new f(a);this.adapter=null;this.type=n;this.lifetime="local";this.asynch=!0;this.init(a)}var n="webStorage",t=r.helpers,p=t.utils,q=t.events.on,
v=t.console.log,h=p.trim,s=p.callback,e=null;f.prototype=f.fn={isSupported:function(){var a=l(this.lifetime);if(null===e)try{e=!!c[a]&&!!c[a].getItem}catch(m){b(n+" is not supported",m),e=!1}return e},create:function(b,c,e){var f=this,h=!0,l=function(a){if(f.asynch)e(a);else return a};e=s(e);if(!b)return l(!1);try{f.adapter.setItem(b,c)}catch(k){h=!h,a(k)}return l(h)},read:function(b,c){var e=this,f,h=!0,l=function(a){if(e.asynch)c(a);else return a};c=s(c);if(!b)return l(!1);try{h=(f=e.adapter.getItem(b))?
f:!1}catch(k){h=!h,a(k)}return l(h)},update:function(a,b,c){if(this.asynch)this.create(a,b,c);else return this.create(a,b,c)},remove:function(b,c){var e=this,f=!0,h=function(a){if(e.asynch)c(a);else return a};c=s(c);if(!b)return h(!1);try{e.adapter.removeItem(b)}catch(l){f=!f,a(l)}return h(f)},open:function(d){var e=this,f=e.adapter,h=l(e.lifetime),k,n,p=function(a){if(e.asynch)d(a);else return a};d=s(d);if(null===f)try{if(f=e.adapter=c[h],q(c,"storage",a),b("Lifetime used: "+h),b("Try to create test resource"),
e.asynch)e.create("test-item",'{test: "test-content"}',function(a){a?e.remove("test-item",function(){b("Test resource created and successfully deleted");d(f)}):d(!1)});else{if(k=e.create("test-item",'{test: "test-content"}'))if(n=e.remove("test-item"))return b("Test resource created and successfully deleted"),f;return!1}}catch(r){return a(r),p(!1)}else if(e.isSupported())return p(f)},init:function(a){return this.isSupported()?(a&&(a.lifetime&&(this.lifetime=h(String(a.lifetime))),a.asynch!==k&&(this.asynch=
!!a.asynch)),this):!1}};r.ns("cache.storage.adapter."+n,f)})(window,window.getNs());
(function(c,r,k,b){function a(a){v("["+n+" Adapter] "+a)}function l(b,e){e.isLoaded||(e.isLoaded=!0,e.progressCallback(100),c.setTimeout(function(){b();a("Event loaded")},e.delay))}function f(a){if(!(this instanceof f))return new f(a);this.adapter=null;this.type=n;this.isLoaded=!1;this.delay=0;this.opened=!0;this.message="New version available. Update page?";this.init(a)}var n="applicationCache",t=k.helpers,p=t.dom,q=t.events.on,v=t.console.log,h=t.utils.callback,s=null,e=r.getElementsByTagName("html")[0],
d=c.applicationCache;f.prototype=f.fn={isSupported:function(){null===s&&((s=!!d&&!!p.getAttribute(e,"manifest"))||a(n+" is not supported or there is no manifest html attribute"));return s},open:function(e,d){var f=this,k=f.adapter,n=0,p,r;f.opened=!0;e=h(e);d&&d.progress&&(p=d.progress);p=f.progressCallback=h(p);if(f.isSupported()&&null!==k){r=function(){a("Event updateready");try{k.swapCache()}catch(b){a("Event updateready: swapcache is not available",b)}confirm(f.message)?c.location.reload(!0):
l(e,f);return!1};q(k,"checking",function(){a("Event checking");return!1});q(k,"noupdate",function(){a("Event noupdate");l(e,f);return!1});q(k,"downloading",function(){a("Event downloading");n=0;return!1});q(k,"progress",function(c){a("Event progress");var e=0;f.delay=500;n+=1;e=c&&c.lengthComputable!==b?Math.round(100*c.loaded/c.total):Math.round(100*n/20);p(e);return!1});q(k,"cached",function(){a("Event cached");l(e,f);return!1});q(k,"updateready",function(){r()});q(k,"obsolete",function(){a("Event obsolete");
c.location.reload(!0);return!1});q(k,"error",function(){a("Event error");l(e,f);return!1});switch(k.status){case k.UNCACHED:l(e,f);break;case k.IDLE:l(e,f);break;case k.UPDATEREADY:r();break;case k.OBSOLETE:l(e,f)}q(c,"online",function(){try{k.update()}catch(b){a("Window event online: update cache is not available",b)}});c.setTimeout(function(){f.isLoaded||l(e,f)},12E3)}else l(e,f)},init:function(a){this.isSupported()&&(null===this.adapter&&(this.adapter=d),a&&(a.message&&(this.message=String(a.message)),
a.delay!==b&&(this.delay=parseInt(a.delay,10))));return this}};k.ns("cache.storage.adapter."+n,f)})(window,document,window.getNs());
(function(c,r,k,b){function a(a){A("["+m+" controller] "+a)}function l(b){var c="";b&&(c="Error Event: Description "+(b.description||"no description available"));a(c)}function f(a,b,e){e.timeoutXhr=c.setTimeout(function(){b(!1)},4E3);L(a,function(a){c.clearTimeout(e.timeoutXhr);delete e.timeoutXhr;a?b(a):b(!1)})}function n(b){var c=null;try{c=w.jsonToObject(b)}catch(e){l(e),a("Couldn't convert json string to object.")}return c}function t(a,c,e){if(J){var f=r.createElement("canvas"),d,h=new Image,
g=null,k=0,m=0;e||(e="jpeg");h.onerror=function(){h.onload=h.onerror=null;c()};h.onload=function(){h.onload=h.onerror=null;k=f.height=h.height;m=f.width=h.width;d=f.getContext("2d");d.fillStyle="rgba(50, 50, 50, 0)";d.fillRect(0,0,m,k);d.drawImage(h,0,0);g=f.toDataURL("image/"+e);c(g)};I&&(h.src="");h.src=a;if(h.complete&&h.naturalWidth!==b)h.onload()}else c(!1)}function p(a){var b=a.data,c=a.url;"css"===a.type&&(c=x.url(c),c=c.folder,b=b.replace(/url\(\../g,"url("+c+".."),b=b.replace(/url\(\'../g,
"url('"+c+".."),b=b.replace(/url\(\"../g,'url("'+c+".."),a.data=b);return a}function q(a,c){return{ajax:a.ajax,data:a.data,expires:(new Date).getTime()+(a.lifetime||c.lifetime),group:a.group!==b?a.group:c.group,lastmod:a.lastmod||c.lastmod,lifetime:a.lifetime!==b?a.lifetime:c.lifetime,type:a.type||c.type,version:a.version||c.version}}function v(a,b,c){var e=a.type,d=a.url,h=a.data;a.ajax?"img"===e?t(d,b):f(d,b,a):h?b(h):c(!1)}function h(a){return D&&D[a]?!!D[a]:!1}function s(b,c){var e=null,d,f;b&&
b.length?(d=b[0].type,f=b.slice(1),a("Testing for storage adapter type: "+d),B[d]?e=new B[d](F):s(f,c),e&&e.isSupported()?e.open(function(h){h?(E=d,D=b[0],a("Used storage adapter type: "+E),c(e)):s(f,c)}):s(f,c)):c(!1)}function e(b,c,d){var f=null,h=0,g;if(d)try{a("Testing for preferred storage adapter type: "+d),B[d]?(f=new B[d](F))&&f.isSupported()?f.open(function(k){if(k){E=d;g=c.length;for(h=0;h<g;h+=1)c[h].type===d&&(D=c[h]);D?(a("Used storage type: "+E),b(f)):(a("Storage config not found: "+
E),e(b,c))}else e(b,c)}):e(b,c):e(b,c)}catch(k){l(k),a("Storage adapter could not be initialized: type "+d),e(b,c)}else s(c,b)}function d(a,b){if(!(this instanceof d))return new d(a,b);this.isEnabled=!0;this.appCacheAdapter=this.adapter=null;this.adapters={types:K,defaults:F};this.resources={defaults:M};this.init(a,b)}var m="storage",g=k.helpers,u=g.client,x=g.utils,w=g.json,G=g.ajax,y=x.isArray,A=g.console.log,C=x.callback,H=w.getJson(),L=G.xhr,z=x.trim,B=k.cache.storage.adapter,I=u.isWebkit(),J=
u.hasCanvas(),K=[{type:"fileSystem",css:!0,js:!0,html:!0,img:!0},{type:"indexedDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webSqlDatabase",css:!0,js:!0,html:!0,img:!0},{type:"webStorage",css:!0,js:!0,html:!0,img:!0}],F={name:"localcache",table:"cache",description:"local resource cache",size:4194304,version:"1.0",key:"key",lifetime:"local",offline:!0},E=null,D=null,M={ajax:!0,lifetime:2E4,group:0,lastmod:(new Date).getTime(),type:"css",version:1};d.prototype=d.fn={create:function(b,c){c=C(c);if(b&&
b.url){var e=this,d=b.url,f=b.type;v(b,function(g){if(g)if(b.data=g,b=p(b),null!==e.adapter&&h(f)){g=w.jsonToString(d);var k=q(b,e.resources.defaults),m=w.jsonToString(k);b.expires=k.expires;b.version=k.version;try{e.adapter.create(g,m,function(e){e?(a("Create new resource in storage adapter: type "+f+", url "+d),c(b)):(a("Create new resource in storage adapter failed"),c(!1))})}catch(n){l(n),a("Create new resource in storage adapter failed"),c(b)}}else a("Trying to create new resource, but resource type is not cachable or storage adapter is not available: type "+
f+", url "+d),c(b);else a("Couldn't get data via network"),c(b)},c)}else c(!1)},read:function(b,c){c=C(c);if(b&&b.url){var e=this,d=b.url,g=b.type;if(null!==this.adapter&&h(g)){a("Trying to read resource from storage: type "+g+", url "+d);try{e.adapter.read(w.jsonToString(d),function(f){f?(b=n(f))?(b.url=d,a("Successfully read resource from storage: type "+g+", url "+d),c(b,!0)):e.remove({url:d,type:g},function(){c(!1)}):(a("There is no data coming back from storage while reading: type "+g+", url "+
d),c(!1))})}catch(k){l(k),a("Try to read resource from storage, but storage adapter is not available: type "+g+", url "+d),f(d,function(e){a("Data loaded via ajax: type "+g+", url "+d+", data status "+!!e);b.data=e;c(b,!0)},b)}}else c(b)}else c(!1)},update:function(b,c){c=C(c);if(b&&b.url){var e=this,d=b.url,f=b.type;v(b,function(g){if(g)if(b.data=g,b=p(b),null!==e.adapter&&h(f)){g=w.jsonToString(d);var k=q(b,e.resources.defaults),m=w.jsonToString(k);b.expires=k.expires;b.version=k.version;try{e.adapter.update(g,
m,function(e){e?(a("Updated existing resource in storage adapter: type "+f+", url "+d),c(b)):(a("Updating resource in storage failed."),c(!1))})}catch(n){l(n),a("Updating resource in storage failed."),c(b)}}else a("Resource type is not cachable or storage adapter is not available: type "+f+", url "+d),c(b);else a("Couldn't get data via network, trying to used stored version"),e.read(b,function(a){a&&a.data?(b.data=a.data,c(b)):c(!1)})},c)}else c(!1)},remove:function(b,c){c=C(c);if(b&&b.url){var e=
b.url,d=b.type;null!==this.adapter&&h(d)?this.adapter.remove(w.jsonToString(e),function(f){f?(a("Delete resource form storage: type "+d+", url "+e),c(b)):(a("Deleting resource form storage failed: type "+d+", url "+e),c(!1))}):(a("Delete resource from storage failed, resource type is not cachable or there is no storage adapter: type "+d+", url "+e),c(b))}else c(!1)},init:function(c,d){var f=this,h=!1,g,k,m,l;c=C(c);d&&d.isEnabled!==b&&(f.isEnabled=!!d.isEnabled);if(f.isEnabled&&H){if(d){if(d.adapters){g=
d.adapters;if(g.types&&y(g.types)){k=g.types;m=k.length;for(l=0;l<m;l+=1)k[l].css===b&&(k[l].css=!0),k[l].js===b&&(k[l].js=!0),k[l].img===b&&(k[l].img=!0),k[l].html===b&&(k[l].html=!0);f.adapters.types=k}g.defaults&&(k=g.defaults,m=f.adapters.defaults,k.name&&(m.name=z(String(k.name))),k.table&&(m.table=z(String(k.table))),k.description&&(m.description=z(String(k.description))),k.size&&(m.size=parseInt(k.size,10)),k.version&&(m.version=z(String(k.version))),k.key&&(m.key=z(String(k.key))),k.lifetime&&
(m.lifetime=z(String(k.lifetime))),k.offline!==b&&(m.offline=!!k.offline));g.preferredType&&(h=z(String(g.preferredType)))}d.resources&&(g=d.resources,g.defaults&&(g=g.defaults,k=f.resources.defaults,g.ajax!==b&&(k.ajax=!!g.ajax),g.lifetime!==b&&(k.lifetime=parseInt(g.lifetime,10)),g.group!==b&&(k.group=parseInt(g.group,10)),g.lastmod!==b&&(k.lastmod=parseInt(g.lastmod,10)),g.type&&(k.type=z(String(g.type))),g.group!==b&&(k.version=parseFloat(g.version)),g.loaded&&(k.loaded=C(g.loaded))))}e(function(a){a||
(f.isEnabled=!1);f.adapter=a;c(f)},f.adapters.types,h);f.adapters.defaults.offline&&(B.applicationCache&&!f.appCacheAdapter)&&(f.appCacheAdapter=new B.applicationCache(F))}else H||a("There is no json support"),f.isEnabled||a("Caching data is disabled"),c(f)}};k.ns("cache."+m+".controller",d)})(window,document,window.getNs());
(function(c,r){function k(a){q("["+l+" controller] "+a)}function b(a){var b=h(a.type);if("js"!==b||"css"!==b||"html"!==b||"img"!==b||"custom"!==b){switch(t.url(a.url).extension){case "js":a="js";break;case "css":a="css";break;case "html":a="html";break;case "jpg":case "jpeg":case "png":a="img";break;default:a="custom"}b=a}return b}function a(b,c){if(!(this instanceof a))return new a(b,c);this.storage=null;this.init(b,c)}var l="cache",f=c.helpers,n=f.dom,t=f.utils,p=f.client,q=f.console.log,v=t.isArray,
h=t.trim,s=t.callback;a.prototype=a.fn={load:function(a,c){var f=this,g=(new Date).getTime(),l=function(){var a=0,b=0,c=null;return{init:function(e,f){c=f;a=e;b=0},loaded:function(){b+=1;b===a&&c()}}}(),q=function(a,b,c){var e=a.url,f=function(){a.loaded(a);l.loaded()},d=a.node||null;c=!!c;switch(a.type){case "js":n.appendJs(e,b,f,d,c);break;case "css":n.appendCss(e,b,f,d,c);break;case "img":n.appendImg(e,b,f,d,c);break;case "html":n.appendHtml(e,b,f,d,c);break;default:k("Didn't match any type for dom append: type "+
a.type),f()}},t=function(a){var b=a.data||null,c=function(a,b){a&&a.data?q(a,a.data,b):q(a,null,b)},e=f.storage,d=e.resources.defaults;a.ajax=a.ajax!==r?!!a.ajax:d.ajax;a.loaded=a.loaded!==r?s(a.loaded):s(d.loaded);e.read(a,function(d){if(d&&d.data){var h=a,l=f.storage.resources.defaults,n=parseInt(d.lifetime,10),t=d.version,s=d.lastmod?d.lastmod:0,y=!1,w,u=h.lastmod?h.lastmod:0,y=!0;w=!1;h.version=w=h.version!==r?parseFloat(h.version):l.version;h.group=h.group!==r?parseFloat(h.group):l.group;u&&
s?(h.lastmod=parseInt(u,10),y=s===h.lastmod):!u&&s?u=s:u||(u=l.lastmod);y=y&&w===t;w=0!==n&&(-1!==n&&y&&d.expires>g||-1===n&&y);h.lastmod=u;h.isValid=w;a=h;a.isValid||!p.isOnline()?(k("Resource is up to date: type "+a.type+", url "+a.url),(b=d.data)&&q(a,b)):(k("Resource is outdated and needs update: type "+a.type+", url "+a.url),e.update(a,c))}else k("Resource or resource data is not available in storage adapter, try to create it: type "+a.type+", url "+a.url),e.create(a,c)})},G=function(a,c){var e=
0,d=a.length,f=null;l.init(d,c);for(e=0;e<d;e+=1)(f=a[e])&&f.url&&(f.url=h(f.url),f.type=b(f),t(f))},y=function(a,b,c){var e=a.length;for(c||(c=0);!a[c]&&c<e;)c+=1;c>=e?b(f):(e=a[c],G(e,function(){y(a,b,c+1)}))};(function(a,b){var e;a&&v(a)||(a=[]);e=a.length;for(var f=a,g=[],h,l=0,m,n=f.length,l=0;l<n;l+=1)m=f[l],(h=m.group)||(h=0),h=g[h]?g[h]:g[h]=[],h.push(m);a=g;b=s(c);k("Load resource function called: "+e+" resources, "+a.length+" groups");y(a,b)})(a,c)},remove:function(a,c){var f=this.storage,
g=function(a,c){var e=a.length,d,g,l=function(a,b){k("Successfully removed resource: url "+b);a===e-1&&c()};if(e)for(d=0;d<e;d+=1)(g=a[d])&&g.url&&(g.url=h(g.url),g.type=b(g),f.remove(g,l(d,g.url)));else c()};(function(a,b){a&&v(a)||(a=[]);b=s(c);k("Remove resource function called: resources count "+a.length);g(a,b)})(a,c)},init:function(a,b){var f=this;a=s(a);k("Cache initializing, checking for storage and adapters");c.cache.storage.controller(function(b){f.storage=b;a(b)},b);return f}};c.ns(l+".controller",
a)})(window.getNs());
(function(c,r,k){function b(a){v("[cache interface] "+a)}function a(a){this.storage=this.controller=null;this.params=a;this.queue=new t;this.timeout=this.interval=this.calls=0}function l(b){var c=null,f=n.length,d;b||(b=u);if(s)for(d=0;d<f;d+=1)e(n[d].params)===e(b)&&(c=n[d]);c||(c=new a(b),n.push(c));return c}function f(a,e,f){var d=l(a),h,k,n,p=function(){h=d.interval;c.clearInterval(h);h=c.setInterval(function(){d.timeout=k=d.timeout+m;n=d.storage;d.controller&&(n&&(n.adapter||!n.isEnabled))&&
(c.clearInterval(h),d.queue.flush());k>g&&(c.clearInterval(h),b("Timeout reached while waiting for cache controller!!!"),f())},m)};d?d.storage?e(d):(d.queue.add(function(){e(d)}),d.calls+=1,1===d.calls?d.controller=new r.cache.controller(function(a){d.storage=a;d.controller?d.queue.flush():p()},a):p()):(b("Whether finding nor initializing a cache interface is possible!!!"),f())}var n=[];k=r.helpers;var t=k.queue,p=k.utils,q=k.json,v=k.console.log,h=p.isArray,s=q.getJson(),e=q.jsonToString,d=p.callback,
m=15,g=5E3,u={};k=function(){return{load:function(a,c,e){c=d(c);f(e,function(b){h(a)?b.controller.load(a,c):"applicationCache"===a?(b=b.storage)&&b.appCacheAdapter?b.appCacheAdapter.open(c,e):c(!1):c(!1)},function(){b("Get interface failed!");c(!1)});return this},remove:function(a,c,e){c=d(c);f(e,function(b){h(a)?b.controller.remove(a,c):c(!1)},function(){b("Get interface failed!");c(!1)});return this},setup:function(a){a&&(u=a);return this}}}();r.ns("cache.load",k.load);r.ns("cache.remove",k.remove);
r.ns("cache.setup",k.setup)})(window,window.getNs());
