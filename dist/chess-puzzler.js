var ChessPuzzler = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var sqlWasmBrowser = {exports: {}};

	(function (module, exports) {
	// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
	// https://github.com/kripken/emscripten/issues/5820
	// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
	// which is able to be used/called before the WASM is loaded.
	// The modularization below exports a promise that loads and resolves to the actual sql.js module.
	// That way, this module can't be used before the WASM is finished loading.

	// We are going to define a function that a user will call to start loading initializing our Sql.js library
	// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
	// Instead, we want to return the previously loaded module

	// TODO: Make this not declare a global if used in the browser
	var initSqlJsPromise = undefined;

	var initSqlJs = function (moduleConfig) {

	    if (initSqlJsPromise){
	      return initSqlJsPromise;
	    }
	    // If we're here, we've never called this function before
	    initSqlJsPromise = new Promise(function (resolveModule, reject) {

	        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
	        // https://github.com/kripken/emscripten/issues/5820

	        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
	        // properties to it, like `preRun`, `postRun`, etc
	        // We are using that to get notified when the WASM has finished loading.
	        // Only then will we return our promise

	        // If they passed in a moduleConfig object, use that
	        // Otherwise, initialize Module to the empty object
	        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

	        // EMCC only allows for a single onAbort function (not an array of functions)
	        // So if the user defined their own onAbort function, we remember it and call it
	        var originalOnAbortFunction = Module['onAbort'];
	        Module['onAbort'] = function (errorThatCausedAbort) {
	            reject(new Error(errorThatCausedAbort));
	            if (originalOnAbortFunction){
	              originalOnAbortFunction(errorThatCausedAbort);
	            }
	        };

	        Module['postRun'] = Module['postRun'] || [];
	        Module['postRun'].push(function () {
	            // When Emscripted calls postRun, this promise resolves with the built Module
	            resolveModule(Module);
	        });

	        // There is a section of code in the emcc-generated code below that looks like this:
	        // (Note that this is lowercase `module`)
	        // if (typeof module !== 'undefined') {
	        //     module['exports'] = Module;
	        // }
	        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
	        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
	        // but that carries with it additional unnecessary baggage/bugs we don't want either.
	        // So, we have three options:
	        // 1) We undefine `module`
	        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
	        // 3) We write a script to remove those lines of code as part of the Make process.
	        //
	        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
	        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
	        // That's a nice side effect since we're handling the modularization efforts ourselves
	        module = undefined;

	        // The emcc-generated code and shell-post.js code goes below,
	        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort
	var k;k||=typeof Module != 'undefined' ? Module : {};var aa=!!globalThis.window,ba=!!globalThis.WorkerGlobalScope;
	k.onRuntimeInitialized=function(){function a(f,l){switch(typeof l){case "boolean":bc(f,l?1:0);break;case "number":cc(f,l);break;case "string":dc(f,l,-1,-1);break;case "object":if(null===l)eb(f);else if(null!=l.length){var n=ca(l.length);m.set(l,n);ec(f,n,l.length,-1);da(n);}else ua(f,"Wrong API use : tried to return a value of an unknown type ("+l+").",-1);break;default:eb(f);}}function b(f,l){for(var n=[],p=0;p<f;p+=1){var r=t(l+4*p,"i32"),v=fc(r);if(1===v||2===v)r=gc(r);else if(3===v)r=hc(r);else if(4===
	v){v=r;r=ic(v);v=jc(v);for(var J=new Uint8Array(r),I=0;I<r;I+=1)J[I]=m[v+I];r=J;}else r=null;n.push(r);}return n}function c(f,l){this.Qa=f;this.db=l;this.Oa=1;this.yb=[];}function d(f,l){this.db=l;this.ob=ea(f);if(null===this.ob)throw Error("Unable to allocate memory for the SQL string");this.ub=this.ob;this.gb=this.Fb=null;}function e(f){this.filename="dbfile_"+(4294967295*Math.random()>>>0);if(null!=f){var l=this.filename,n="/",p=l;n&&(n="string"==typeof n?n:fa(n),p=l?ha(n+"/"+l):n);l=ia(!0,!0);p=ja(p,
	l);if(f){if("string"==typeof f){n=Array(f.length);for(var r=0,v=f.length;r<v;++r)n[r]=f.charCodeAt(r);f=n;}ka(p,l|146);n=ma(p,577);na(n,f,0,f.length,0);oa(n);ka(p,l);}}this.handleError(q(this.filename,g));this.db=t(g,"i32");hb(this.db);this.pb={};this.Sa={};}var g=y(4),h=k.cwrap,q=h("sqlite3_open","number",["string","number"]),w=h("sqlite3_close_v2","number",["number"]),u=h("sqlite3_exec","number",["number","string","number","number","number"]),x=h("sqlite3_changes","number",["number"]),D=h("sqlite3_prepare_v2",
	"number",["number","string","number","number","number"]),ib=h("sqlite3_sql","string",["number"]),lc=h("sqlite3_normalized_sql","string",["number"]),jb=h("sqlite3_prepare_v2","number",["number","number","number","number","number"]),mc=h("sqlite3_bind_text","number",["number","number","number","number","number"]),kb=h("sqlite3_bind_blob","number",["number","number","number","number","number"]),nc=h("sqlite3_bind_double","number",["number","number","number"]),oc=h("sqlite3_bind_int","number",["number",
	"number","number"]),pc=h("sqlite3_bind_parameter_index","number",["number","string"]),qc=h("sqlite3_step","number",["number"]),rc=h("sqlite3_errmsg","string",["number"]),sc=h("sqlite3_column_count","number",["number"]),tc=h("sqlite3_data_count","number",["number"]),uc=h("sqlite3_column_double","number",["number","number"]),lb=h("sqlite3_column_text","string",["number","number"]),vc=h("sqlite3_column_blob","number",["number","number"]),wc=h("sqlite3_column_bytes","number",["number","number"]),xc=h("sqlite3_column_type",
	"number",["number","number"]),yc=h("sqlite3_column_name","string",["number","number"]),zc=h("sqlite3_reset","number",["number"]),Ac=h("sqlite3_clear_bindings","number",["number"]),Bc=h("sqlite3_finalize","number",["number"]),mb=h("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),fc=h("sqlite3_value_type","number",["number"]),ic=h("sqlite3_value_bytes","number",["number"]),hc=h("sqlite3_value_text","string",["number"]),jc=h("sqlite3_value_blob",
	"number",["number"]),gc=h("sqlite3_value_double","number",["number"]),cc=h("sqlite3_result_double","",["number","number"]),eb=h("sqlite3_result_null","",["number"]),dc=h("sqlite3_result_text","",["number","string","number","number"]),ec=h("sqlite3_result_blob","",["number","number","number","number"]),bc=h("sqlite3_result_int","",["number","number"]),ua=h("sqlite3_result_error","",["number","string","number"]),nb=h("sqlite3_aggregate_context","number",["number","number"]),hb=h("RegisterExtensionFunctions",
	"number",["number"]),ob=h("sqlite3_update_hook","number",["number","number","number"]);c.prototype.bind=function(f){if(!this.Qa)throw "Statement closed";this.reset();return Array.isArray(f)?this.Wb(f):null!=f&&"object"===typeof f?this.Xb(f):!0};c.prototype.step=function(){if(!this.Qa)throw "Statement closed";this.Oa=1;var f=qc(this.Qa);switch(f){case 100:return !0;case 101:return !1;default:throw this.db.handleError(f);}};c.prototype.Pb=function(f){null==f&&(f=this.Oa,this.Oa+=1);return uc(this.Qa,f)};
	c.prototype.hc=function(f){null==f&&(f=this.Oa,this.Oa+=1);f=lb(this.Qa,f);if("function"!==typeof BigInt)throw Error("BigInt is not supported");return BigInt(f)};c.prototype.mc=function(f){null==f&&(f=this.Oa,this.Oa+=1);return lb(this.Qa,f)};c.prototype.getBlob=function(f){null==f&&(f=this.Oa,this.Oa+=1);var l=wc(this.Qa,f);f=vc(this.Qa,f);for(var n=new Uint8Array(l),p=0;p<l;p+=1)n[p]=m[f+p];return n};c.prototype.get=function(f,l){l=l||{};null!=f&&this.bind(f)&&this.step();f=[];for(var n=tc(this.Qa),
	p=0;p<n;p+=1)switch(xc(this.Qa,p)){case 1:var r=l.useBigInt?this.hc(p):this.Pb(p);f.push(r);break;case 2:f.push(this.Pb(p));break;case 3:f.push(this.mc(p));break;case 4:f.push(this.getBlob(p));break;default:f.push(null);}return f};c.prototype.Db=function(){for(var f=[],l=sc(this.Qa),n=0;n<l;n+=1)f.push(yc(this.Qa,n));return f};c.prototype.Ob=function(f,l){f=this.get(f,l);l=this.Db();for(var n={},p=0;p<l.length;p+=1)n[l[p]]=f[p];return n};c.prototype.lc=function(){return ib(this.Qa)};c.prototype.ic=
	function(){return lc(this.Qa)};c.prototype.Jb=function(f){null!=f&&this.bind(f);this.step();return this.reset()};c.prototype.Lb=function(f,l){null==l&&(l=this.Oa,this.Oa+=1);f=ea(f);this.yb.push(f);this.db.handleError(mc(this.Qa,l,f,-1,0));};c.prototype.Vb=function(f,l){null==l&&(l=this.Oa,this.Oa+=1);var n=ca(f.length);m.set(f,n);this.yb.push(n);this.db.handleError(kb(this.Qa,l,n,f.length,0));};c.prototype.Kb=function(f,l){null==l&&(l=this.Oa,this.Oa+=1);this.db.handleError((f===(f|0)?oc:nc)(this.Qa,
	l,f));};c.prototype.Yb=function(f){null==f&&(f=this.Oa,this.Oa+=1);kb(this.Qa,f,0,0,0);};c.prototype.Mb=function(f,l){null==l&&(l=this.Oa,this.Oa+=1);switch(typeof f){case "string":this.Lb(f,l);return;case "number":this.Kb(f,l);return;case "bigint":this.Lb(f.toString(),l);return;case "boolean":this.Kb(f+0,l);return;case "object":if(null===f){this.Yb(l);return}if(null!=f.length){this.Vb(f,l);return}}throw "Wrong API use : tried to bind a value of an unknown type ("+f+").";};c.prototype.Xb=function(f){var l=
	this;Object.keys(f).forEach(function(n){var p=pc(l.Qa,n);0!==p&&l.Mb(f[n],p);});return !0};c.prototype.Wb=function(f){for(var l=0;l<f.length;l+=1)this.Mb(f[l],l+1);return !0};c.prototype.reset=function(){this.Cb();return 0===Ac(this.Qa)&&0===zc(this.Qa)};c.prototype.Cb=function(){for(var f;void 0!==(f=this.yb.pop());)da(f);};c.prototype.cb=function(){this.Cb();var f=0===Bc(this.Qa);delete this.db.pb[this.Qa];this.Qa=0;return f};d.prototype.next=function(){if(null===this.ob)return {done:!0};null!==this.gb&&
	(this.gb.cb(),this.gb=null);if(!this.db.db)throw this.Ab(),Error("Database closed");var f=pa(),l=y(4);qa(g);qa(l);try{this.db.handleError(jb(this.db.db,this.ub,-1,g,l));this.ub=t(l,"i32");var n=t(g,"i32");if(0===n)return this.Ab(),{done:!0};this.gb=new c(n,this.db);this.db.pb[n]=this.gb;return {value:this.gb,done:!1}}catch(p){throw this.Fb=z(this.ub),this.Ab(),p;}finally{ra(f);}};d.prototype.Ab=function(){da(this.ob);this.ob=null;};d.prototype.jc=function(){return null!==this.Fb?this.Fb:z(this.ub)};
	"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator&&(d.prototype[Symbol.iterator]=function(){return this});e.prototype.Jb=function(f,l){if(!this.db)throw "Database closed";if(l){f=this.Gb(f,l);try{f.step();}finally{f.cb();}}else this.handleError(u(this.db,f,0,0,g));return this};e.prototype.exec=function(f,l,n){if(!this.db)throw "Database closed";var p=pa(),r=null,v=null,J=null;try{J=v=ea(f);var I=y(4);for(f=[];0!==t(J,"i8");){qa(g);qa(I);this.handleError(jb(this.db,J,-1,g,I));var L=t(g,"i32");
	J=t(I,"i32");if(0!==L){var G=null;r=new c(L,this);for(null!=l&&r.bind(l);r.step();)null===G&&(G={columns:r.Db(),values:[]},f.push(G)),G.values.push(r.get(null,n));r.cb();}}return f}catch(la){throw r&&r.cb(),la;}finally{v&&da(v),ra(p);}};e.prototype.ec=function(f,l,n,p,r){"function"===typeof l&&(p=n,n=l,l=void 0);f=this.Gb(f,l);try{for(;f.step();)n(f.Ob(null,r));}finally{f.cb();}if("function"===typeof p)return p()};e.prototype.Gb=function(f,l){qa(g);this.handleError(D(this.db,f,-1,g,0));f=t(g,"i32");if(0===
	f)throw "Nothing to prepare";var n=new c(f,this);null!=l&&n.bind(l);return this.pb[f]=n};e.prototype.pc=function(f){return new d(f,this)};e.prototype.fc=function(){Object.values(this.pb).forEach(function(l){l.cb();});Object.values(this.Sa).forEach(A);this.Sa={};this.handleError(w(this.db));var f=sa(this.filename);this.handleError(q(this.filename,g));this.db=t(g,"i32");hb(this.db);return f};e.prototype.close=function(){null!==this.db&&(Object.values(this.pb).forEach(function(f){f.cb();}),Object.values(this.Sa).forEach(A),
	this.Sa={},this.fb&&(A(this.fb),this.fb=void 0),this.handleError(w(this.db)),ta("/"+this.filename),this.db=null);};e.prototype.handleError=function(f){if(0===f)return null;f=rc(this.db);throw Error(f);};e.prototype.kc=function(){return x(this.db)};e.prototype.bc=function(f,l){Object.prototype.hasOwnProperty.call(this.Sa,f)&&(A(this.Sa[f]),delete this.Sa[f]);var n=va(function(p,r,v){r=b(r,v);try{var J=l.apply(null,r);}catch(I){ua(p,I,-1);return}a(p,J);},"viii");this.Sa[f]=n;this.handleError(mb(this.db,
	f,l.length,1,0,n,0,0,0));return this};e.prototype.ac=function(f,l){var n=l.init||function(){return null},p=l.finalize||function(L){return L},r=l.step;if(!r)throw "An aggregate function must have a step function in "+f;var v={};Object.hasOwnProperty.call(this.Sa,f)&&(A(this.Sa[f]),delete this.Sa[f]);l=f+"__finalize";Object.hasOwnProperty.call(this.Sa,l)&&(A(this.Sa[l]),delete this.Sa[l]);var J=va(function(L,G,la){var V=nb(L,1);Object.hasOwnProperty.call(v,V)||(v[V]=n());G=b(G,la);G=[v[V]].concat(G);
	try{v[V]=r.apply(null,G);}catch(Dc){delete v[V],ua(L,Dc,-1);}},"viii"),I=va(function(L){var G=nb(L,1);try{var la=p(v[G]);}catch(V){delete v[G];ua(L,V,-1);return}a(L,la);delete v[G];},"vi");this.Sa[f]=J;this.Sa[l]=I;this.handleError(mb(this.db,f,r.length-1,1,0,0,J,I,0));return this};e.prototype.vc=function(f){this.fb&&(ob(this.db,0,0),A(this.fb),this.fb=void 0);if(!f)return this;this.fb=va(function(l,n,p,r,v){switch(n){case 18:l="insert";break;case 23:l="update";break;case 9:l="delete";break;default:throw "unknown operationCode in updateHook callback: "+
	n;}p=z(p);r=z(r);if(v>Number.MAX_SAFE_INTEGER)throw "rowId too big to fit inside a Number";f(l,p,r,Number(v));},"viiiij");ob(this.db,this.fb,0);return this};c.prototype.bind=c.prototype.bind;c.prototype.step=c.prototype.step;c.prototype.get=c.prototype.get;c.prototype.getColumnNames=c.prototype.Db;c.prototype.getAsObject=c.prototype.Ob;c.prototype.getSQL=c.prototype.lc;c.prototype.getNormalizedSQL=c.prototype.ic;c.prototype.run=c.prototype.Jb;c.prototype.reset=c.prototype.reset;c.prototype.freemem=
	c.prototype.Cb;c.prototype.free=c.prototype.cb;d.prototype.next=d.prototype.next;d.prototype.getRemainingSQL=d.prototype.jc;e.prototype.run=e.prototype.Jb;e.prototype.exec=e.prototype.exec;e.prototype.each=e.prototype.ec;e.prototype.prepare=e.prototype.Gb;e.prototype.iterateStatements=e.prototype.pc;e.prototype["export"]=e.prototype.fc;e.prototype.close=e.prototype.close;e.prototype.handleError=e.prototype.handleError;e.prototype.getRowsModified=e.prototype.kc;e.prototype.create_function=e.prototype.bc;
	e.prototype.create_aggregate=e.prototype.ac;e.prototype.updateHook=e.prototype.vc;k.Database=e;};var wa="./this.program",xa=globalThis.document?.currentScript?.src;ba&&(xa=self.location.href);var ya="",za,Aa;
	if(aa||ba){try{ya=(new URL(".",xa)).href;}catch{}ba&&(Aa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)});za=async a=>{a=await fetch(a,{credentials:"same-origin"});if(a.ok)return a.arrayBuffer();throw Error(a.status+" : "+a.url);};}var Ba=console.log.bind(console),B=console.error.bind(console),Ca,Da=!1,Ea,m,C,Fa,E,F,Ga,Ha,H;
	function Ia(){var a=Ja.buffer;m=new Int8Array(a);Fa=new Int16Array(a);C=new Uint8Array(a);E=new Int32Array(a);F=new Uint32Array(a);Ga=new Float32Array(a);Ha=new Float64Array(a);H=new BigInt64Array(a);new BigUint64Array(a);}function Ka(a){k.onAbort?.(a);a="Aborted("+a+")";B(a);Da=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}var La;
	async function Ma(a){if(!Ca)try{var b=await za(a);return new Uint8Array(b)}catch{}if(a==La&&Ca)a=new Uint8Array(Ca);else if(Aa)a=Aa(a);else throw "both async and sync fetching of the wasm failed";return a}async function Na(a,b){try{var c=await Ma(a);return await WebAssembly.instantiate(c,b)}catch(d){B(`failed to asynchronously prepare wasm: ${d}`),Ka(d);}}
	async function Oa(a){var b=La;if(!Ca)try{var c=fetch(b,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(c,a)}catch(d){B(`wasm streaming compile failed: ${d}`),B("falling back to ArrayBuffer instantiation");}return Na(b,a)}class Pa{name="ExitStatus";constructor(a){this.message=`Program terminated with exit(${a})`;this.status=a;}}var Qa=a=>{for(;0<a.length;)a.shift()(k);},Ra=[],Sa=[],Ta=()=>{var a=k.preRun.shift();Sa.push(a);},K=0,Ua=null;
	function t(a,b="i8"){b.endsWith("*")&&(b="*");switch(b){case "i1":return m[a];case "i8":return m[a];case "i16":return Fa[a>>1];case "i32":return E[a>>2];case "i64":return H[a>>3];case "float":return Ga[a>>2];case "double":return Ha[a>>3];case "*":return F[a>>2];default:Ka(`invalid type for getValue: ${b}`);}}var Va=!0;
	function qa(a){var b="i32";b.endsWith("*")&&(b="*");switch(b){case "i1":m[a]=0;break;case "i8":m[a]=0;break;case "i16":Fa[a>>1]=0;break;case "i32":E[a>>2]=0;break;case "i64":H[a>>3]=BigInt(0);break;case "float":Ga[a>>2]=0;break;case "double":Ha[a>>3]=0;break;case "*":F[a>>2]=0;break;default:Ka(`invalid type for setValue: ${b}`);}}
	var Wa=new TextDecoder,Xa=(a,b,c,d)=>{c=b+c;if(d)return c;for(;a[b]&&!(b>=c);)++b;return b},z=(a,b,c)=>a?Wa.decode(C.subarray(a,Xa(C,a,b,c))):"",Ya=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,1),c++):c&&(a.splice(d,1),c--);}if(b)for(;c;c--)a.unshift("..");return a},ha=a=>{var b="/"===a.charAt(0),c="/"===a.slice(-1);(a=Ya(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return (b?"/":"")+a},Za=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
	a=b[0];b=b[1];if(!a&&!b)return ".";b&&=b.slice(0,-1);return a+b},$a=a=>a&&a.match(/([^\/]+|\/)\/*$/)[1],ab=()=>a=>crypto.getRandomValues(a),bb=a=>{(bb=ab())(a);},cb=(...a)=>{for(var b="",c=!1,d=a.length-1;-1<=d&&!c;d--){c=0<=d?a[d]:"/";if("string"!=typeof c)throw new TypeError("Arguments to path.resolve must be strings");if(!c)return "";b=c+"/"+b;c="/"===c.charAt(0);}b=Ya(b.split("/").filter(e=>!!e),!c).join("/");return (c?"/":"")+b||"."},db=a=>{var b=Xa(a,0);return Wa.decode(a.buffer?a.subarray(0,b):
	new Uint8Array(a.slice(0,b)))},fb=[],gb=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3;}return b},M=(a,b,c,d)=>{if(!(0<d))return 0;var e=c;d=c+d-1;for(var g=0;g<a.length;++g){var h=a.codePointAt(g);if(127>=h){if(c>=d)break;b[c++]=h;}else if(2047>=h){if(c+1>=d)break;b[c++]=192|h>>6;b[c++]=128|h&63;}else if(65535>=h){if(c+2>=d)break;b[c++]=224|h>>12;b[c++]=128|h>>6&63;b[c++]=128|h&63;}else {if(c+3>=d)break;b[c++]=240|h>>18;b[c++]=128|
	h>>12&63;b[c++]=128|h>>6&63;b[c++]=128|h&63;g++;}}b[c]=0;return c-e},pb=[];function qb(a,b){pb[a]={input:[],output:[],kb:b};rb(a,sb);}
	var sb={open(a){var b=pb[a.node.nb];if(!b)throw new N(43);a.Va=b;a.seekable=!1;},close(a){a.Va.kb.lb(a.Va);},lb(a){a.Va.kb.lb(a.Va);},read(a,b,c,d){if(!a.Va||!a.Va.kb.Qb)throw new N(60);for(var e=0,g=0;g<d;g++){try{var h=a.Va.kb.Qb(a.Va);}catch(q){throw new N(29);}if(void 0===h&&0===e)throw new N(6);if(null===h||void 0===h)break;e++;b[c+g]=h;}e&&(a.node.$a=Date.now());return e},write(a,b,c,d){if(!a.Va||!a.Va.kb.Hb)throw new N(60);try{for(var e=0;e<d;e++)a.Va.kb.Hb(a.Va,b[c+e]);}catch(g){throw new N(29);
	}d&&(a.node.Ua=a.node.Ta=Date.now());return e}},tb={Qb(){a:{if(!fb.length){var a=null;globalThis.window?.prompt&&(a=window.prompt("Input: "),null!==a&&(a+="\n"));if(!a){var b=null;break a}b=Array(gb(a)+1);a=M(a,b,0,b.length);b.length=a;fb=b;}b=fb.shift();}return b},Hb(a,b){null===b||10===b?(Ba(db(a.output)),a.output=[]):0!=b&&a.output.push(b);},lb(a){0<a.output?.length&&(Ba(db(a.output)),a.output=[]);},Dc(){return {yc:25856,Ac:5,xc:191,zc:35387,wc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,
	0,0,0,0,0,0,0,0,0,0,0]}},Ec(){return 0},Fc(){return [24,80]}},ub={Hb(a,b){null===b||10===b?(B(db(a.output)),a.output=[]):0!=b&&a.output.push(b);},lb(a){0<a.output?.length&&(B(db(a.output)),a.output=[]);}},O={Za:null,ab(){return O.createNode(null,"/",16895,0)},createNode(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new N(63);O.Za||(O.Za={dir:{node:{Wa:O.La.Wa,Xa:O.La.Xa,mb:O.La.mb,rb:O.La.rb,Tb:O.La.Tb,xb:O.La.xb,vb:O.La.vb,Ib:O.La.Ib,wb:O.La.wb},stream:{Ya:O.Ma.Ya}},file:{node:{Wa:O.La.Wa,Xa:O.La.Xa},
	stream:{Ya:O.Ma.Ya,read:O.Ma.read,write:O.Ma.write,sb:O.Ma.sb,tb:O.Ma.tb}},link:{node:{Wa:O.La.Wa,Xa:O.La.Xa,eb:O.La.eb},stream:{}},Nb:{node:{Wa:O.La.Wa,Xa:O.La.Xa},stream:vb}});c=wb(a,b,c,d);P(c.mode)?(c.La=O.Za.dir.node,c.Ma=O.Za.dir.stream,c.Na={}):32768===(c.mode&61440)?(c.La=O.Za.file.node,c.Ma=O.Za.file.stream,c.Ra=0,c.Na=null):40960===(c.mode&61440)?(c.La=O.Za.link.node,c.Ma=O.Za.link.stream):8192===(c.mode&61440)&&(c.La=O.Za.Nb.node,c.Ma=O.Za.Nb.stream);c.$a=c.Ua=c.Ta=Date.now();a&&(a.Na[b]=
	c,a.$a=a.Ua=a.Ta=c.$a);return c},Cc(a){return a.Na?a.Na.subarray?a.Na.subarray(0,a.Ra):new Uint8Array(a.Na):new Uint8Array(0)},La:{Wa(a){var b={};b.cc=8192===(a.mode&61440)?a.id:1;b.oc=a.id;b.mode=a.mode;b.rc=1;b.uid=0;b.nc=0;b.nb=a.nb;P(a.mode)?b.size=4096:32768===(a.mode&61440)?b.size=a.Ra:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.$a=new Date(a.$a);b.Ua=new Date(a.Ua);b.Ta=new Date(a.Ta);b.Zb=4096;b.$b=Math.ceil(b.size/b.Zb);return b},Xa(a,b){for(var c of ["mode","atime","mtime","ctime"])null!=
	b[c]&&(a[c]=b[c]);void 0!==b.size&&(b=b.size,a.Ra!=b&&(0==b?(a.Na=null,a.Ra=0):(c=a.Na,a.Na=new Uint8Array(b),c&&a.Na.set(c.subarray(0,Math.min(b,a.Ra))),a.Ra=b)));},mb(){O.zb||(O.zb=new N(44),O.zb.stack="<generic error, no stack>");throw O.zb;},rb(a,b,c,d){return O.createNode(a,b,c,d)},Tb(a,b,c){try{var d=Q(b,c);}catch(g){}if(d){if(P(a.mode))for(var e in d.Na)throw new N(55);xb(d);}delete a.parent.Na[a.name];b.Na[c]=a;a.name=c;b.Ta=b.Ua=a.parent.Ta=a.parent.Ua=Date.now();},xb(a,b){delete a.Na[b];a.Ta=
	a.Ua=Date.now();},vb(a,b){var c=Q(a,b),d;for(d in c.Na)throw new N(55);delete a.Na[b];a.Ta=a.Ua=Date.now();},Ib(a){return [".","..",...Object.keys(a.Na)]},wb(a,b,c){a=O.createNode(a,b,41471,0);a.link=c;return a},eb(a){if(40960!==(a.mode&61440))throw new N(28);return a.link}},Ma:{read(a,b,c,d,e){var g=a.node.Na;if(e>=a.node.Ra)return 0;a=Math.min(a.node.Ra-e,d);if(8<a&&g.subarray)b.set(g.subarray(e,e+a),c);else for(d=0;d<a;d++)b[c+d]=g[e+d];return a},write(a,b,c,d,e,g){b.buffer===m.buffer&&(g=!1);if(!d)return 0;
	a=a.node;a.Ua=a.Ta=Date.now();if(b.subarray&&(!a.Na||a.Na.subarray)){if(g)return a.Na=b.subarray(c,c+d),a.Ra=d;if(0===a.Ra&&0===e)return a.Na=b.slice(c,c+d),a.Ra=d;if(e+d<=a.Ra)return a.Na.set(b.subarray(c,c+d),e),d}g=e+d;var h=a.Na?a.Na.length:0;h>=g||(g=Math.max(g,h*(1048576>h?2:1.125)>>>0),0!=h&&(g=Math.max(g,256)),h=a.Na,a.Na=new Uint8Array(g),0<a.Ra&&a.Na.set(h.subarray(0,a.Ra),0));if(a.Na.subarray&&b.subarray)a.Na.set(b.subarray(c,c+d),e);else for(g=0;g<d;g++)a.Na[e+g]=b[c+g];a.Ra=Math.max(a.Ra,
	e+d);return d},Ya(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Ra);if(0>b)throw new N(28);return b},sb(a,b,c,d,e){if(32768!==(a.node.mode&61440))throw new N(43);a=a.node.Na;if(e&2||!a||a.buffer!==m.buffer){e=!0;d=65536*Math.ceil(b/65536);var g=yb(65536,d);g&&C.fill(0,g,g+d);d=g;if(!d)throw new N(48);if(a){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,c+b):a=Array.prototype.slice.call(a,c,c+b);m.set(a,d);}}else e=!1,d=a.byteOffset;return {tc:d,Ub:e}},tb(a,b,c,d){O.Ma.write(a,
	b,0,d,c,!1);return 0}}},ia=(a,b)=>{var c=0;a&&(c|=365);b&&(c|=146);return c},zb=null,Ab={},Bb=[],Cb=1,R=null,Db=!1,Eb=!0,Fb={},N=class{name="ErrnoError";constructor(a){this.Pa=a;}},Gb=class{qb={};node=null;get flags(){return this.qb.flags}set flags(a){this.qb.flags=a;}get position(){return this.qb.position}set position(a){this.qb.position=a;}},Hb=class{La={};Ma={};ib=null;constructor(a,b,c,d){a||=this;this.parent=a;this.ab=a.ab;this.id=Cb++;this.name=b;this.mode=c;this.nb=d;this.$a=this.Ua=this.Ta=Date.now();}get read(){return 365===
	(this.mode&365)}set read(a){a?this.mode|=365:this.mode&=-366;}get write(){return 146===(this.mode&146)}set write(a){a?this.mode|=146:this.mode&=-147;}};
	function S(a,b={}){if(!a)throw new N(44);b.Bb??(b.Bb=!0);"/"===a.charAt(0)||(a="//"+a);var c=0;a:for(;40>c;c++){a=a.split("/").filter(q=>!!q);for(var d=zb,e="/",g=0;g<a.length;g++){var h=g===a.length-1;if(h&&b.parent)break;if("."!==a[g])if(".."===a[g])if(e=Za(e),d===d.parent){a=e+"/"+a.slice(g+1).join("/");c--;continue a}else d=d.parent;else {e=ha(e+"/"+a[g]);try{d=Q(d,a[g]);}catch(q){if(44===q?.Pa&&h&&b.sc)return {path:e};throw q;}!d.ib||h&&!b.Bb||(d=d.ib.root);if(40960===(d.mode&61440)&&(!h||b.hb)){if(!d.La.eb)throw new N(52);
	d=d.La.eb(d);"/"===d.charAt(0)||(d=Za(e)+"/"+d);a=d+"/"+a.slice(g+1).join("/");continue a}}}return {path:e,node:d}}throw new N(32);}function fa(a){for(var b;;){if(a===a.parent)return a=a.ab.Sb,b?"/"!==a[a.length-1]?`${a}/${b}`:a+b:a;b=b?`${a.name}/${b}`:a.name;a=a.parent;}}function Ib(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return (a+c>>>0)%R.length}function xb(a){var b=Ib(a.parent.id,a.name);if(R[b]===a)R[b]=a.jb;else for(b=R[b];b;){if(b.jb===a){b.jb=a.jb;break}b=b.jb;}}
	function Q(a,b){var c=P(a.mode)?(c=Jb(a,"x"))?c:a.La.mb?0:2:54;if(c)throw new N(c);for(c=R[Ib(a.id,b)];c;c=c.jb){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.La.mb(a,b)}function wb(a,b,c,d){a=new Hb(a,b,c,d);b=Ib(a.parent.id,a.name);a.jb=R[b];return R[b]=a}function P(a){return 16384===(a&61440)}function Kb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}
	function Jb(a,b){if(Eb)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0}function Lb(a,b){if(!P(a.mode))return 54;try{return Q(a,b),20}catch(c){}return Jb(a,"wx")}function Mb(a,b,c){try{var d=Q(a,b);}catch(e){return e.Pa}if(a=Jb(a,"wx"))return a;if(c){if(!P(d.mode))return 54;if(d===d.parent||"/"===fa(d))return 10}else if(P(d.mode))return 31;return 0}function Nb(a){if(!a)throw new N(63);return a}
	function T(a){a=Bb[a];if(!a)throw new N(8);return a}function Ob(a,b=-1){a=Object.assign(new Gb,a);if(-1==b)a:{for(b=0;4096>=b;b++)if(!Bb[b])break a;throw new N(33);}a.bb=b;return Bb[b]=a}function Pb(a,b=-1){a=Ob(a,b);a.Ma?.Bc?.(a);return a}function Qb(a,b,c){var d=a?.Ma.Xa;a=d?a:b;d??=b.La.Xa;Nb(d);d(a,c);}var vb={open(a){a.Ma=Ab[a.node.nb].Ma;a.Ma.open?.(a);},Ya(){throw new N(70);}};function rb(a,b){Ab[a]={Ma:b};}
	function Rb(a,b){var c="/"===b;if(c&&zb)throw new N(10);if(!c&&b){var d=S(b,{Bb:!1});b=d.path;d=d.node;if(d.ib)throw new N(10);if(!P(d.mode))throw new N(54);}b={type:a,Gc:{},Sb:b,qc:[]};a=a.ab(b);a.ab=b;b.root=a;c?zb=a:d&&(d.ib=b,d.ab&&d.ab.qc.push(b));}function Sb(a,b,c){var d=S(a,{parent:!0}).node;a=$a(a);if(!a)throw new N(28);if("."===a||".."===a)throw new N(20);var e=Lb(d,a);if(e)throw new N(e);if(!d.La.rb)throw new N(63);return d.La.rb(d,a,b,c)}
	function ja(a,b=438){return Sb(a,b&4095|32768,0)}function U(a,b=511){return Sb(a,b&1023|16384,0)}function Tb(a,b,c){"undefined"==typeof c&&(c=b,b=438);Sb(a,b|8192,c);}function Ub(a,b){if(!cb(a))throw new N(44);var c=S(b,{parent:!0}).node;if(!c)throw new N(44);b=$a(b);var d=Lb(c,b);if(d)throw new N(d);if(!c.La.wb)throw new N(63);c.La.wb(c,b,a);}
	function Vb(a){var b=S(a,{parent:!0}).node;a=$a(a);var c=Q(b,a),d=Mb(b,a,!0);if(d)throw new N(d);if(!b.La.vb)throw new N(63);if(c.ib)throw new N(10);b.La.vb(b,a);xb(c);}function ta(a){var b=S(a,{parent:!0}).node;if(!b)throw new N(44);a=$a(a);var c=Q(b,a),d=Mb(b,a,!1);if(d)throw new N(d);if(!b.La.xb)throw new N(63);if(c.ib)throw new N(10);b.La.xb(b,a);xb(c);}function Wb(a,b){a=S(a,{hb:!b}).node;return Nb(a.La.Wa)(a)}function Xb(a,b,c,d){Qb(a,b,{mode:c&4095|b.mode&-4096,Ta:Date.now(),dc:d});}
	function ka(a,b){a="string"==typeof a?S(a,{hb:!0}).node:a;Xb(null,a,b);}function Yb(a,b,c){if(P(b.mode))throw new N(31);if(32768!==(b.mode&61440))throw new N(28);var d=Jb(b,"w");if(d)throw new N(d);Qb(a,b,{size:c,timestamp:Date.now()});}
	function ma(a,b,c=438){if(""===a)throw new N(44);if("string"==typeof b){var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090}[b];if("undefined"==typeof d)throw Error(`Unknown file open mode: ${b}`);b=d;}c=b&64?c&4095|32768:0;if("object"==typeof a)d=a;else {var e=a.endsWith("/");a=S(a,{hb:!(b&131072),sc:!0});d=a.node;a=a.path;}var g=!1;if(b&64)if(d){if(b&128)throw new N(20);}else {if(e)throw new N(31);d=Sb(a,c|511,0);g=!0;}if(!d)throw new N(44);8192===(d.mode&61440)&&(b&=-513);if(b&65536&&!P(d.mode))throw new N(54);
	if(!g&&(e=d?40960===(d.mode&61440)?32:P(d.mode)&&("r"!==Kb(b)||b&576)?31:Jb(d,Kb(b)):44))throw new N(e);b&512&&!g&&(e=d,e="string"==typeof e?S(e,{hb:!0}).node:e,Yb(null,e,0));b&=-131713;e=Ob({node:d,path:fa(d),flags:b,seekable:!0,position:0,Ma:d.Ma,uc:[],error:!1});e.Ma.open&&e.Ma.open(e);g&&ka(d,c&511);!k.logReadFiles||b&1||a in Fb||(Fb[a]=1);return e}function oa(a){if(null===a.bb)throw new N(8);a.Eb&&(a.Eb=null);try{a.Ma.close&&a.Ma.close(a);}catch(b){throw b;}finally{Bb[a.bb]=null;}a.bb=null;}
	function Zb(a,b,c){if(null===a.bb)throw new N(8);if(!a.seekable||!a.Ma.Ya)throw new N(70);if(0!=c&&1!=c&&2!=c)throw new N(28);a.position=a.Ma.Ya(a,b,c);a.uc=[];}function $b(a,b,c,d,e){if(0>d||0>e)throw new N(28);if(null===a.bb)throw new N(8);if(1===(a.flags&2097155))throw new N(8);if(P(a.node.mode))throw new N(31);if(!a.Ma.read)throw new N(28);var g="undefined"!=typeof e;if(!g)e=a.position;else if(!a.seekable)throw new N(70);b=a.Ma.read(a,b,c,d,e);g||(a.position+=b);return b}
	function na(a,b,c,d,e){if(0>d||0>e)throw new N(28);if(null===a.bb)throw new N(8);if(0===(a.flags&2097155))throw new N(8);if(P(a.node.mode))throw new N(31);if(!a.Ma.write)throw new N(28);a.seekable&&a.flags&1024&&Zb(a,0,2);var g="undefined"!=typeof e;if(!g)e=a.position;else if(!a.seekable)throw new N(70);b=a.Ma.write(a,b,c,d,e,void 0);g||(a.position+=b);return b}
	function sa(a){var b=b||0;b=ma(a,b);a=Wb(a).size;var d=new Uint8Array(a);$b(b,d,0,a,0);oa(b);return d}
	function W(a,b,c){a=ha("/dev/"+a);var d=ia(!!b,!!c);W.Rb??(W.Rb=64);var e=W.Rb++<<8|0;rb(e,{open(g){g.seekable=!1;},close(){c?.buffer?.length&&c(10);},read(g,h,q,w){for(var u=0,x=0;x<w;x++){try{var D=b();}catch(ib){throw new N(29);}if(void 0===D&&0===u)throw new N(6);if(null===D||void 0===D)break;u++;h[q+x]=D;}u&&(g.node.$a=Date.now());return u},write(g,h,q,w){for(var u=0;u<w;u++)try{c(h[q+u]);}catch(x){throw new N(29);}w&&(g.node.Ua=g.node.Ta=Date.now());return u}});Tb(a,d,e);}var X={};
	function Y(a,b,c){if("/"===b.charAt(0))return b;a=-100===a?"/":T(a).path;if(0==b.length){if(!c)throw new N(44);return a}return a+"/"+b}
	function ac(a,b){F[a>>2]=b.cc;F[a+4>>2]=b.mode;F[a+8>>2]=b.rc;F[a+12>>2]=b.uid;F[a+16>>2]=b.nc;F[a+20>>2]=b.nb;H[a+24>>3]=BigInt(b.size);E[a+32>>2]=4096;E[a+36>>2]=b.$b;var c=b.$a.getTime(),d=b.Ua.getTime(),e=b.Ta.getTime();H[a+40>>3]=BigInt(Math.floor(c/1E3));F[a+48>>2]=c%1E3*1E6;H[a+56>>3]=BigInt(Math.floor(d/1E3));F[a+64>>2]=d%1E3*1E6;H[a+72>>3]=BigInt(Math.floor(e/1E3));F[a+80>>2]=e%1E3*1E6;H[a+88>>3]=BigInt(b.oc);return 0}
	var kc=void 0,Cc=()=>{var a=E[+kc>>2];kc+=4;return a},Ec=0,Fc=[0,31,60,91,121,152,182,213,244,274,305,335],Gc=[0,31,59,90,120,151,181,212,243,273,304,334],Hc={},Ic=a=>{if(!(a instanceof Pa||"unwind"==a))throw a;},Jc=a=>{Ea=a;Va||0<Ec||(k.onExit?.(a),Da=!0);throw new Pa(a);},Kc=a=>{if(!Da)try{a();}catch(b){Ic(b);}finally{if(!(Va||0<Ec))try{Ea=a=Ea,Jc(a);}catch(b){Ic(b);}}},Lc={},Nc=()=>{if(!Mc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??
	"C").replace("-","_")+".UTF-8",_:wa||"./this.program"},b;for(b in Lc)void 0===Lc[b]?delete a[b]:a[b]=Lc[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);Mc=c;}return Mc},Mc,Oc=(a,b,c,d)=>{var e={string:u=>{var x=0;if(null!==u&&void 0!==u&&0!==u){x=gb(u)+1;var D=y(x);M(u,C,D,x);x=D;}return x},array:u=>{var x=y(u.length);m.set(u,x);return x}};a=k["_"+a];var g=[],h=0;if(d)for(var q=0;q<d.length;q++){var w=e[c[q]];w?(0===h&&(h=pa()),g[q]=w(d[q])):g[q]=d[q];}c=a(...g);return c=function(u){0!==h&&ra(h);return "string"===
	b?z(u):"boolean"===b?!!u:u}(c)},ea=a=>{var b=gb(a)+1,c=ca(b);c&&M(a,C,c,b);return c},Pc,Qc=[],A=a=>{Pc.delete(Z.get(a));Z.set(a,null);Qc.push(a);},Rc=a=>{const b=a.length;return [b%128|128,b>>7,...a]},Sc={i:127,p:127,j:126,f:125,d:124,e:111},Tc=a=>Rc(Array.from(a,b=>Sc[b])),va=(a,b)=>{if(!Pc){Pc=new WeakMap;var c=Z.length;if(Pc)for(var d=0;d<0+c;d++){var e=Z.get(d);e&&Pc.set(e,d);}}if(c=Pc.get(a)||0)return c;c=Qc.length?Qc.pop():Z.grow(1);try{Z.set(c,a);}catch(g){if(!(g instanceof TypeError))throw g;
	b=Uint8Array.of(0,97,115,109,1,0,0,0,1,...Rc([1,96,...Tc(b.slice(1)),...Tc("v"===b[0]?"":b[0])]),2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);b=new WebAssembly.Module(b);b=(new WebAssembly.Instance(b,{e:{f:a}})).exports.f;Z.set(c,b);}Pc.set(a,c);return c};R=Array(4096);Rb(O,"/");U("/tmp");U("/home");U("/home/web_user");
	(function(){U("/dev");rb(259,{read:()=>0,write:(d,e,g,h)=>h,Ya:()=>0});Tb("/dev/null",259);qb(1280,tb);qb(1536,ub);Tb("/dev/tty",1280);Tb("/dev/tty1",1536);var a=new Uint8Array(1024),b=0,c=()=>{0===b&&(bb(a),b=a.byteLength);return a[--b]};W("random",c);W("urandom",c);U("/dev/shm");U("/dev/shm/tmp");})();
	(function(){U("/proc");var a=U("/proc/self");U("/proc/self/fd");Rb({ab(){var b=wb(a,"fd",16895,73);b.Ma={Ya:O.Ma.Ya};b.La={mb(c,d){c=+d;var e=T(c);c={parent:null,ab:{Sb:"fake"},La:{eb:()=>e.path},id:c+1};return c.parent=c},Ib(){return Array.from(Bb.entries()).filter(([,c])=>c).map(([c])=>c.toString())}};return b}},"/proc/self/fd");})();k.noExitRuntime&&(Va=k.noExitRuntime);k.print&&(Ba=k.print);k.printErr&&(B=k.printErr);k.wasmBinary&&(Ca=k.wasmBinary);k.thisProgram&&(wa=k.thisProgram);
	if(k.preInit)for("function"==typeof k.preInit&&(k.preInit=[k.preInit]);0<k.preInit.length;)k.preInit.shift()();k.stackSave=()=>pa();k.stackRestore=a=>ra(a);k.stackAlloc=a=>y(a);k.cwrap=(a,b,c,d)=>{var e=!c||c.every(g=>"number"===g||"boolean"===g);return "string"!==b&&e&&!d?k["_"+a]:(...g)=>Oc(a,b,c,g)};k.addFunction=va;k.removeFunction=A;k.UTF8ToString=z;k.stringToNewUTF8=ea;k.writeArrayToMemory=(a,b)=>{m.set(a,b);};
	var ca,da,yb,Uc,ra,y,pa,Ja,Z,Vc={a:(a,b,c,d)=>Ka(`Assertion failed: ${z(a)}, at: `+[b?z(b):"unknown filename",c,d?z(d):"unknown function"]),i:function(a,b){try{return a=z(a),ka(a,b),0}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return -c.Pa}},L:function(a,b,c){try{b=z(b);b=Y(a,b);if(c&-8)return -28;var d=S(b,{hb:!0}).node;if(!d)return -44;a="";c&4&&(a+="r");c&2&&(a+="w");c&1&&(a+="x");return a&&Jb(d,a)?-2:0}catch(e){if("undefined"==typeof X||"ErrnoError"!==e.name)throw e;return -e.Pa}},
	j:function(a,b){try{var c=T(a);Xb(c,c.node,b,!1);return 0}catch(d){if("undefined"==typeof X||"ErrnoError"!==d.name)throw d;return -d.Pa}},h:function(a){try{var b=T(a);Qb(b,b.node,{timestamp:Date.now(),dc:!1});return 0}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return -c.Pa}},b:function(a,b,c){kc=c;try{var d=T(a);switch(b){case 0:var e=Cc();if(0>e)break;for(;Bb[e];)e++;return Pb(d,e).bb;case 1:case 2:return 0;case 3:return d.flags;case 4:return e=Cc(),d.flags|=e,0;case 12:return e=
	Cc(),Fa[e+0>>1]=2,0;case 13:case 14:return 0}return -28}catch(g){if("undefined"==typeof X||"ErrnoError"!==g.name)throw g;return -g.Pa}},g:function(a,b){try{var c=T(a),d=c.node,e=c.Ma.Wa;a=e?c:d;e??=d.La.Wa;Nb(e);var g=e(a);return ac(b,g)}catch(h){if("undefined"==typeof X||"ErrnoError"!==h.name)throw h;return -h.Pa}},H:function(a,b){b=-9007199254740992>b||9007199254740992<b?NaN:Number(b);try{if(isNaN(b))return -61;var c=T(a);if(0>b||0===(c.flags&2097155))throw new N(28);Yb(c,c.node,b);return 0}catch(d){if("undefined"==
	typeof X||"ErrnoError"!==d.name)throw d;return -d.Pa}},G:function(a,b){try{if(0===b)return -28;var c=gb("/")+1;if(b<c)return -68;M("/",C,a,b);return c}catch(d){if("undefined"==typeof X||"ErrnoError"!==d.name)throw d;return -d.Pa}},K:function(a,b){try{return a=z(a),ac(b,Wb(a,!0))}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return -c.Pa}},C:function(a,b,c){try{return b=z(b),b=Y(a,b),U(b,c),0}catch(d){if("undefined"==typeof X||"ErrnoError"!==d.name)throw d;return -d.Pa}},J:function(a,
	b,c,d){try{b=z(b);var e=d&256;b=Y(a,b,d&4096);return ac(c,e?Wb(b,!0):Wb(b))}catch(g){if("undefined"==typeof X||"ErrnoError"!==g.name)throw g;return -g.Pa}},x:function(a,b,c,d){kc=d;try{b=z(b);b=Y(a,b);var e=d?Cc():0;return ma(b,c,e).bb}catch(g){if("undefined"==typeof X||"ErrnoError"!==g.name)throw g;return -g.Pa}},v:function(a,b,c,d){try{b=z(b);b=Y(a,b);if(0>=d)return -28;var e=S(b).node;if(!e)throw new N(44);if(!e.La.eb)throw new N(28);var g=e.La.eb(e);var h=Math.min(d,gb(g)),q=m[c+h];M(g,C,c,d+1);
	m[c+h]=q;return h}catch(w){if("undefined"==typeof X||"ErrnoError"!==w.name)throw w;return -w.Pa}},u:function(a){try{return a=z(a),Vb(a),0}catch(b){if("undefined"==typeof X||"ErrnoError"!==b.name)throw b;return -b.Pa}},f:function(a,b){try{return a=z(a),ac(b,Wb(a))}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return -c.Pa}},r:function(a,b,c){try{b=z(b);b=Y(a,b);if(c)if(512===c)Vb(b);else return -28;else ta(b);return 0}catch(d){if("undefined"==typeof X||"ErrnoError"!==d.name)throw d;
	return -d.Pa}},q:function(a,b,c){try{b=z(b);b=Y(a,b,!0);var d=Date.now(),e,g;if(c){var h=F[c>>2]+4294967296*E[c+4>>2],q=E[c+8>>2];1073741823==q?e=d:1073741822==q?e=null:e=1E3*h+q/1E6;c+=16;h=F[c>>2]+4294967296*E[c+4>>2];q=E[c+8>>2];1073741823==q?g=d:1073741822==q?g=null:g=1E3*h+q/1E6;}else g=e=d;if(null!==(g??e)){a=e;var w=S(b,{hb:!0}).node;Nb(w.La.Xa)(w,{$a:a,Ua:g});}return 0}catch(u){if("undefined"==typeof X||"ErrnoError"!==u.name)throw u;return -u.Pa}},m:()=>Ka(""),l:()=>{Va=!1;Ec=0;},A:function(a,
	b){a=-9007199254740992>a||9007199254740992<a?NaN:Number(a);a=new Date(1E3*a);E[b>>2]=a.getSeconds();E[b+4>>2]=a.getMinutes();E[b+8>>2]=a.getHours();E[b+12>>2]=a.getDate();E[b+16>>2]=a.getMonth();E[b+20>>2]=a.getFullYear()-1900;E[b+24>>2]=a.getDay();var c=a.getFullYear();E[b+28>>2]=(0!==c%4||0===c%100&&0!==c%400?Gc:Fc)[a.getMonth()]+a.getDate()-1|0;E[b+36>>2]=-(60*a.getTimezoneOffset());c=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();var d=(new Date(a.getFullYear(),0,1)).getTimezoneOffset();
	E[b+32>>2]=(c!=d&&a.getTimezoneOffset()==Math.min(d,c))|0;},y:function(a,b,c,d,e,g,h){e=-9007199254740992>e||9007199254740992<e?NaN:Number(e);try{var q=T(d);if(0!==(b&2)&&0===(c&2)&&2!==(q.flags&2097155))throw new N(2);if(1===(q.flags&2097155))throw new N(2);if(!q.Ma.sb)throw new N(43);if(!a)throw new N(28);var w=q.Ma.sb(q,a,e,b,c);var u=w.tc;E[g>>2]=w.Ub;F[h>>2]=u;return 0}catch(x){if("undefined"==typeof X||"ErrnoError"!==x.name)throw x;return -x.Pa}},z:function(a,b,c,d,e,g){g=-9007199254740992>g||
	9007199254740992<g?NaN:Number(g);try{var h=T(e);if(c&2){if(32768!==(h.node.mode&61440))throw new N(43);d&2||h.Ma.tb&&h.Ma.tb(h,C.slice(a,a+b),g,b,d);}}catch(q){if("undefined"==typeof X||"ErrnoError"!==q.name)throw q;return -q.Pa}},n:(a,b)=>{Hc[a]&&(clearTimeout(Hc[a].id),delete Hc[a]);if(!b)return 0;var c=setTimeout(()=>{delete Hc[a];Kc(()=>Uc(a,performance.now()));},b);Hc[a]={id:c,Hc:b};return 0},B:(a,b,c,d)=>{var e=(new Date).getFullYear(),g=(new Date(e,0,1)).getTimezoneOffset();e=(new Date(e,6,1)).getTimezoneOffset();
	F[a>>2]=60*Math.max(g,e);E[b>>2]=Number(g!=e);b=h=>{var q=Math.abs(h);return `UTC${0<=h?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`};a=b(g);b=b(e);e<g?(M(a,C,c,17),M(b,C,d,17)):(M(a,C,d,17),M(b,C,c,17));},d:()=>Date.now(),s:()=>2147483648,c:()=>performance.now(),o:a=>{var b=C.length;a>>>=0;if(2147483648<a)return !1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);a:{d=(Math.min(2147483648,65536*Math.ceil(Math.max(a,d)/65536))-Ja.buffer.byteLength+
	65535)/65536|0;try{Ja.grow(d);Ia();var e=1;break a}catch(g){}e=void 0;}if(e)return !0}return !1},E:(a,b)=>{var c=0,d=0,e;for(e of Nc()){var g=b+c;F[a+d>>2]=g;c+=M(e,C,g,Infinity)+1;d+=4;}return 0},F:(a,b)=>{var c=Nc();F[a>>2]=c.length;a=0;for(var d of c)a+=gb(d)+1;F[b>>2]=a;return 0},e:function(a){try{var b=T(a);oa(b);return 0}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return c.Pa}},p:function(a,b){try{var c=T(a);m[b]=c.Va?2:P(c.mode)?3:40960===(c.mode&61440)?7:4;Fa[b+2>>1]=0;H[b+
	8>>3]=BigInt(0);H[b+16>>3]=BigInt(0);return 0}catch(d){if("undefined"==typeof X||"ErrnoError"!==d.name)throw d;return d.Pa}},w:function(a,b,c,d){try{a:{var e=T(a);a=b;for(var g,h=b=0;h<c;h++){var q=F[a>>2],w=F[a+4>>2];a+=8;var u=$b(e,m,q,w,g);if(0>u){var x=-1;break a}b+=u;if(u<w)break;"undefined"!=typeof g&&(g+=u);}x=b;}F[d>>2]=x;return 0}catch(D){if("undefined"==typeof X||"ErrnoError"!==D.name)throw D;return D.Pa}},D:function(a,b,c,d){b=-9007199254740992>b||9007199254740992<b?NaN:Number(b);try{if(isNaN(b))return 61;
	var e=T(a);Zb(e,b,c);H[d>>3]=BigInt(e.position);e.Eb&&0===b&&0===c&&(e.Eb=null);return 0}catch(g){if("undefined"==typeof X||"ErrnoError"!==g.name)throw g;return g.Pa}},I:function(a){try{var b=T(a);return b.Ma?.lb?.(b)}catch(c){if("undefined"==typeof X||"ErrnoError"!==c.name)throw c;return c.Pa}},t:function(a,b,c,d){try{a:{var e=T(a);a=b;for(var g,h=b=0;h<c;h++){var q=F[a>>2],w=F[a+4>>2];a+=8;var u=na(e,m,q,w,g);if(0>u){var x=-1;break a}b+=u;if(u<w)break;"undefined"!=typeof g&&(g+=u);}x=b;}F[d>>2]=x;
	return 0}catch(D){if("undefined"==typeof X||"ErrnoError"!==D.name)throw D;return D.Pa}},k:Jc};
	function Wc(){function a(){k.calledRun=!0;if(!Da){if(!k.noFSInit&&!Db){var b,c;Db=!0;b??=k.stdin;c??=k.stdout;d??=k.stderr;b?W("stdin",b):Ub("/dev/tty","/dev/stdin");c?W("stdout",null,c):Ub("/dev/tty","/dev/stdout");d?W("stderr",null,d):Ub("/dev/tty1","/dev/stderr");ma("/dev/stdin",0);ma("/dev/stdout",1);ma("/dev/stderr",1);}Xc.N();Eb=!1;k.onRuntimeInitialized?.();if(k.postRun)for("function"==typeof k.postRun&&(k.postRun=[k.postRun]);k.postRun.length;){var d=k.postRun.shift();Ra.push(d);}Qa(Ra);}}if(0<
	K)Ua=Wc;else {if(k.preRun)for("function"==typeof k.preRun&&(k.preRun=[k.preRun]);k.preRun.length;)Ta();Qa(Sa);0<K?Ua=Wc:k.setStatus?(k.setStatus("Running..."),setTimeout(()=>{setTimeout(()=>k.setStatus(""),1);a();},1)):a();}}var Xc;
	(async function(){function a(c){c=Xc=c.exports;k._sqlite3_free=c.P;k._sqlite3_value_text=c.Q;k._sqlite3_prepare_v2=c.R;k._sqlite3_step=c.S;k._sqlite3_reset=c.T;k._sqlite3_exec=c.U;k._sqlite3_finalize=c.V;k._sqlite3_column_name=c.W;k._sqlite3_column_text=c.X;k._sqlite3_column_type=c.Y;k._sqlite3_errmsg=c.Z;k._sqlite3_clear_bindings=c._;k._sqlite3_value_blob=c.$;k._sqlite3_value_bytes=c.aa;k._sqlite3_value_double=c.ba;k._sqlite3_value_int=c.ca;k._sqlite3_value_type=c.da;k._sqlite3_result_blob=c.ea;
	k._sqlite3_result_double=c.fa;k._sqlite3_result_error=c.ga;k._sqlite3_result_int=c.ha;k._sqlite3_result_int64=c.ia;k._sqlite3_result_null=c.ja;k._sqlite3_result_text=c.ka;k._sqlite3_aggregate_context=c.la;k._sqlite3_column_count=c.ma;k._sqlite3_data_count=c.na;k._sqlite3_column_blob=c.oa;k._sqlite3_column_bytes=c.pa;k._sqlite3_column_double=c.qa;k._sqlite3_bind_blob=c.ra;k._sqlite3_bind_double=c.sa;k._sqlite3_bind_int=c.ta;k._sqlite3_bind_text=c.ua;k._sqlite3_bind_parameter_index=c.va;k._sqlite3_sql=
	c.wa;k._sqlite3_normalized_sql=c.xa;k._sqlite3_changes=c.ya;k._sqlite3_close_v2=c.za;k._sqlite3_create_function_v2=c.Aa;k._sqlite3_update_hook=c.Ba;k._sqlite3_open=c.Ca;ca=k._malloc=c.Da;da=k._free=c.Ea;k._RegisterExtensionFunctions=c.Fa;yb=c.Ga;Uc=c.Ha;ra=c.Ia;y=c.Ja;pa=c.Ka;Ja=c.M;Z=c.O;Ia();K--;k.monitorRunDependencies?.(K);0==K&&Ua&&(c=Ua,Ua=null,c());return Xc}K++;k.monitorRunDependencies?.(K);var b={a:Vc};if(k.instantiateWasm)return new Promise(c=>{k.instantiateWasm(b,(d,e)=>{c(a(d));});});
	La??=k.locateFile?k.locateFile("sql-wasm-browser.wasm",ya):ya+"sql-wasm-browser.wasm";return a((await Oa(b)).instance)})();Wc();


	        // The shell-pre.js and emcc-generated code goes above
	        return Module;
	    }); // The end of the promise being returned

	  return initSqlJsPromise;
	}; // The end of our initSqlJs function

	// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
	// However, we don't want to use the emcc modularization. See shell-pre.js
	{
	    module.exports = initSqlJs;
	    // This will allow the module to be used in ES6 or CommonJS
	    module.exports.default = initSqlJs;
	}
	}(sqlWasmBrowser));

	var initSqlJs = sqlWasmBrowser.exports;

	let databasePromise;

	const DB_NAME = "puzzle-database";
	const STORE_NAME = "database";
	const DB_KEY = "sqlite";

	function getDatabase() {
	  if (!databasePromise) {
	    databasePromise = loadDatabase();
	  }

	  return databasePromise;
	}

	async function loadDatabase() {
	  const SQL = await initSqlJs({
	    locateFile: file => `/assets/sql-wasm/${file}`,
	  });

	  // Try to load a previously saved database
	  const savedDatabase = await loadFromIndexedDB();

	  if (savedDatabase) {
	    console.log("Loading database from index...");
	    return new SQL.Database(savedDatabase);
	  }

	  // No saved database — load the original database
	  const response = await fetch("/data/puzzle.sqlite");

	  if (!response.ok) {
	    throw new Error(
	      `Failed to load database: ${response.status}`
	    );
	  }

	  console.log("Loading database from file...");

	  const buffer = await response.arrayBuffer();
	  const database = new SQL.Database(new Uint8Array(buffer));

	  // Save the initial database to IndexedDB
	  await saveToIndexedDB(database);

	  return database;
	}

	function openIndexedDB() {
	  return new Promise((resolve, reject) => {
	    const request = indexedDB.open(DB_NAME, 1);

	    request.onupgradeneeded = () => {
	      const db = request.result;

	      if (!db.objectStoreNames.contains(STORE_NAME)) {
	        db.createObjectStore(STORE_NAME);
	      }
	    };

	    request.onsuccess = () => {
	      resolve(request.result);
	    };

	    request.onerror = () => {
	      reject(request.error);
	    };
	  });
	}

	async function loadFromIndexedDB() {
	  const db = await openIndexedDB();

	  return new Promise((resolve, reject) => {
	    const transaction = db.transaction(STORE_NAME, "readonly");
	    const store = transaction.objectStore(STORE_NAME);

	    const request = store.get(DB_KEY);

	    request.onsuccess = () => {
	      resolve(request.result ?? null);
	    };

	    request.onerror = () => {
	      reject(request.error);
	    };
	  });
	}

	async function saveToIndexedDB(database) {
	  const data = database.export();
	  const db = await openIndexedDB();

	  return new Promise((resolve, reject) => {
	    const transaction = db.transaction(STORE_NAME, "readwrite");
	    const store = transaction.objectStore(STORE_NAME);

	    const request = store.put(data, DB_KEY);

	    request.onsuccess = () => {
	      resolve();
	    };

	    request.onerror = () => {
	      reject(request.error);
	    };
	  });
	}

	async function exportDatabase() {
	  const db = await getDatabase();

	  const data = db.export();

	  const blob = new Blob([data], {
	    type: "application/x-sqlite3",
	  });

	  const url = URL.createObjectURL(blob);

	  const link = document.createElement("a");
	  link.href = url;
	  link.download = "puzzle.sqlite.bak";

	  document.body.appendChild(link);
	  link.click();
	  link.remove();

	  // timeout wrapper to help with potential mobile browser issues
	  setTimeout(() => {
	    URL.revokeObjectURL(url);
	  }, 1000);
	}


	async function dbQuery(sql, { params = [], jsonColumns = [] } = {}) {
	  const db = await getDatabase();
	  const preparedStatement = db.prepare(sql);

	  try {
	    preparedStatement.bind(params);

	    const rows = [];

	    while (preparedStatement.step()) {
	      const row = preparedStatement.getAsObject();

	      for (const column of jsonColumns) {
	        if (typeof row[column] === "string") {
	          try {
	            row[column] = JSON.parse(row[column]);
	          } catch {
	            // leave invalid JSON string
	          }
	        }
	      }

	      rows.push(row);
	    }

	    return rows;

	  } finally {
	    preparedStatement.free();
	  }
	}

	async function dbInsert(tablename, data, { jsonColumns = [] } = {}) {
	  const db = await getDatabase();
	  const columns = Object.keys(data);

	  const values = columns.map((column) =>
	    serializeValue(data[column], column, jsonColumns)
	  );

	  const placeholders = columns.map(() => "?").join(", ");

	  const sql = `
    INSERT INTO ${tablename} (${columns.join(", ")})
    VALUES (${placeholders})
  `;

	  db.run(sql, values);

	  const id = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
	  await saveToIndexedDB(db);
	  return id;
	}

	async function dbUpdate(
	  tablename,
	  data,
	  where,
	  { jsonColumns = [] } = {}
	) {
	  const db = await getDatabase();

	  const columns = Object.keys(data);

	  if (columns.length === 0) {
	    throw new Error("No data provided for update");
	  }

	  const whereColumns = Object.keys(where);

	  if (whereColumns.length === 0) {
	    throw new Error("WHERE clause is required");
	  }

	  const values = columns.map((column) =>
	    serializeValue(data[column], column, jsonColumns)
	  );

	  const whereValues = whereColumns.map((column) =>
	    serializeValue(where[column], column, jsonColumns)
	  );

	  const setClause = columns
	    .map((column) => `${column} = ?`)
	    .join(", ");

	  const whereClause = whereColumns
	    .map((column) => `${column} = ?`)
	    .join(" AND ");

	  const sql = `
    UPDATE ${tablename}
    SET ${setClause}
    WHERE ${whereClause}
  `;

	  db.run(sql, [...values, ...whereValues]);

	  const changes = db.exec("SELECT changes()")[0].values[0][0];
	  await saveToIndexedDB(db);
	  return changes;
	}

	function serializeValue(value, column, jsonColumns) {
	  if (
	    jsonColumns.includes(column) &&
	    typeof value === "object" &&
	    value !== null
	  ) {
	    return JSON.stringify(value);
	  }

	  return value;
	}

	async function dbRun(sql, params = []) {
	  const db = await getDatabase();
	  db.run(sql, params);
	  await saveToIndexedDB(db);
	}

	function getDeckPuzzles(deckId) {
	  return dbQuery(
	    `SELECT
       puzzle.id,
       puzzle.pgn,
       deck_puzzle.config
     FROM deck_puzzle
     JOIN puzzle ON puzzle.id = deck_puzzle.puzzle
     WHERE deck_puzzle.deck = ?
       AND (
         json_extract(deck_puzzle.config, '$.status') = 'unreviewed'
         OR deck_puzzle.config IS NULL
       )`,
	    {
	      params: [deckId],
	      jsonColumns: ["config"],
	    }
	  );
	}

	function getDecks() {
	  return dbQuery(
	    `SELECT
       deck.*,
       COUNT(deck_puzzle.puzzle) AS total_puzzles,
       SUM(
         CASE
           WHEN json_extract(deck_puzzle.config, '$.status') = 'unreviewed'
             OR deck_puzzle.config IS NULL
           THEN 1
           ELSE 0
         END
       ) AS unreviewed_puzzles
     FROM deck
     LEFT JOIN deck_puzzle
       ON deck_puzzle.deck = deck.id
     GROUP BY deck.id
     ORDER BY deck.name`,
	    { jsonColumns: ["config"] }
	  );
	}

	function writeReview(review) {
	  return dbInsert(
	    "review",
	    review,
	    { jsonColumns: ["attempts"] }
	  );
	}

	function updateDeckPuzzleStatus(deckId, puzzleId, status) {
	  return dbUpdate(
	    "deck_puzzle",
	    {
	      config: {
	        status,
	      },
	    },
	    {
	      deck: deckId,
	      puzzle: puzzleId,
	    },
	    {
	      jsonColumns: ["config"],
	    }
	  );
	}

	function resetDeck(deckId) {
	  return dbRun(
	    `UPDATE deck_puzzle
     SET config = ?
     WHERE deck = ?
       AND json_extract(config, '$.status') = 'reviewed'`,
	    [
	      JSON.stringify({ status: "unreviewed" }),
	      deckId,
	    ]
	  );
	}

	/*
	export async function resetDeck(deckId) {
	  const rows = await dbQuery(
	    `SELECT
	       deck,
	       puzzle,
	       config
	     FROM deck_puzzle
	     WHERE deck = ?`,
	    {
	      params: [deckId],
	      jsonColumns: ["config"],
	    }
	  );

	  for (const row of rows) {
	    const status = row.config?.status ?? "unreviewed";

	    if (status === "reviewed") {
	      await updateDeckPuzzleStatus(
	        row.deck,
	        row.puzzle,
	        "unreviewed"
	      );
	    }
	  }
	}
	*/

	var index_umd = {exports: {}};

	(function (module, exports) {
	(function (global, factory) {
		factory(exports) ;
	})(commonjsGlobal, (function (exports) {
		function getDefaultExportFromCjs (x) {
			return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
		}

		var _pgnParser$1 = {exports: {}};

		var _pgnParser = _pgnParser$1.exports;

		var hasRequired_pgnParser;

		function require_pgnParser () {
			if (hasRequired_pgnParser) return _pgnParser$1.exports;
			hasRequired_pgnParser = 1;
			(function (module) {
				// @ts-nocheck
				// @generated by Peggy 4.2.0.
				//
				// https://peggyjs.org/
				(function (root, factory) {
				    if (module.exports) {
				        module.exports = factory();
				    }
				})(_pgnParser, function () {
				    function peg$subclass(child, parent) {
				        function C() { this.constructor = child; }
				        C.prototype = parent.prototype;
				        child.prototype = new C();
				    }
				    function peg$SyntaxError(message, expected, found, location) {
				        var self = Error.call(this, message);
				        // istanbul ignore next Check is a necessary evil to support older environments
				        if (Object.setPrototypeOf) {
				            Object.setPrototypeOf(self, peg$SyntaxError.prototype);
				        }
				        self.expected = expected;
				        self.found = found;
				        self.location = location;
				        self.name = "SyntaxError";
				        return self;
				    }
				    peg$subclass(peg$SyntaxError, Error);
				    function peg$padEnd(str, targetLength, padString) {
				        padString = padString || " ";
				        if (str.length > targetLength) {
				            return str;
				        }
				        targetLength -= str.length;
				        padString += padString.repeat(targetLength);
				        return str + padString.slice(0, targetLength);
				    }
				    peg$SyntaxError.prototype.format = function (sources) {
				        var str = "Error: " + this.message;
				        if (this.location) {
				            var src = null;
				            var k;
				            for (k = 0; k < sources.length; k++) {
				                if (sources[k].source === this.location.source) {
				                    src = sources[k].text.split(/\r\n|\n|\r/g);
				                    break;
				                }
				            }
				            var s = this.location.start;
				            var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
				                ? this.location.source.offset(s)
				                : s;
				            var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
				            if (src) {
				                var e = this.location.end;
				                var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
				                var line = src[s.line - 1];
				                var last = s.line === e.line ? e.column : line.length + 1;
				                var hatLen = (last - s.column) || 1;
				                str += "\n --> " + loc + "\n"
				                    + filler + " |\n"
				                    + offset_s.line + " | " + line + "\n"
				                    + filler + " | " + peg$padEnd("", s.column - 1, ' ')
				                    + peg$padEnd("", hatLen, "^");
				            }
				            else {
				                str += "\n at " + loc;
				            }
				        }
				        return str;
				    };
				    peg$SyntaxError.buildMessage = function (expected, found) {
				        var DESCRIBE_EXPECTATION_FNS = {
				            literal: function (expectation) {
				                return "\"" + literalEscape(expectation.text) + "\"";
				            },
				            class: function (expectation) {
				                var escapedParts = expectation.parts.map(function (part) {
				                    return Array.isArray(part)
				                        ? classEscape(part[0]) + "-" + classEscape(part[1])
				                        : classEscape(part);
				                });
				                return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
				            },
				            any: function () {
				                return "any character";
				            },
				            end: function () {
				                return "end of input";
				            },
				            other: function (expectation) {
				                return expectation.description;
				            }
				        };
				        function hex(ch) {
				            return ch.charCodeAt(0).toString(16).toUpperCase();
				        }
				        function literalEscape(s) {
				            return s
				                .replace(/\\/g, "\\\\")
				                .replace(/"/g, "\\\"")
				                .replace(/\0/g, "\\0")
				                .replace(/\t/g, "\\t")
				                .replace(/\n/g, "\\n")
				                .replace(/\r/g, "\\r")
				                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
				                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
				        }
				        function classEscape(s) {
				            return s
				                .replace(/\\/g, "\\\\")
				                .replace(/\]/g, "\\]")
				                .replace(/\^/g, "\\^")
				                .replace(/-/g, "\\-")
				                .replace(/\0/g, "\\0")
				                .replace(/\t/g, "\\t")
				                .replace(/\n/g, "\\n")
				                .replace(/\r/g, "\\r")
				                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
				                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
				        }
				        function describeExpectation(expectation) {
				            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
				        }
				        function describeExpected(expected) {
				            var descriptions = expected.map(describeExpectation);
				            var i, j;
				            descriptions.sort();
				            if (descriptions.length > 0) {
				                for (i = 1, j = 1; i < descriptions.length; i++) {
				                    if (descriptions[i - 1] !== descriptions[i]) {
				                        descriptions[j] = descriptions[i];
				                        j++;
				                    }
				                }
				                descriptions.length = j;
				            }
				            switch (descriptions.length) {
				                case 1:
				                    return descriptions[0];
				                case 2:
				                    return descriptions[0] + " or " + descriptions[1];
				                default:
				                    return descriptions.slice(0, -1).join(", ")
				                        + ", or "
				                        + descriptions[descriptions.length - 1];
				            }
				        }
				        function describeFound(found) {
				            return found ? "\"" + literalEscape(found) + "\"" : "end of input";
				        }
				        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
				    };
				    function peg$parse(input, options) {
				        options = options !== undefined ? options : {};
				        var peg$FAILED = {};
				        var peg$source = options.grammarSource;
				        var peg$startRuleFunctions = { pgn: peg$parsepgn, tags: peg$parsetags, game: peg$parsegame, games: peg$parsegames };
				        var peg$startRuleFunction = peg$parsepgn;
				        var peg$c0 = "\uFEFF";
				        var peg$c1 = "Event";
				        var peg$c2 = "event";
				        var peg$c3 = "Site";
				        var peg$c4 = "site";
				        var peg$c5 = "Date";
				        var peg$c6 = "date";
				        var peg$c7 = "Round";
				        var peg$c8 = "round";
				        var peg$c9 = "White";
				        var peg$c10 = "white";
				        var peg$c11 = "Black";
				        var peg$c12 = "black";
				        var peg$c13 = "Result";
				        var peg$c14 = "result";
				        var peg$c15 = "WhiteTitle";
				        var peg$c16 = "Whitetitle";
				        var peg$c17 = "whitetitle";
				        var peg$c18 = "whiteTitle";
				        var peg$c19 = "BlackTitle";
				        var peg$c20 = "Blacktitle";
				        var peg$c21 = "blacktitle";
				        var peg$c22 = "blackTitle";
				        var peg$c23 = "WhiteELO";
				        var peg$c24 = "WhiteElo";
				        var peg$c25 = "Whiteelo";
				        var peg$c26 = "whiteelo";
				        var peg$c27 = "whiteElo";
				        var peg$c28 = "BlackELO";
				        var peg$c29 = "BlackElo";
				        var peg$c30 = "Blackelo";
				        var peg$c31 = "blackelo";
				        var peg$c32 = "blackElo";
				        var peg$c33 = "WhiteUSCF";
				        var peg$c34 = "WhiteUscf";
				        var peg$c35 = "Whiteuscf";
				        var peg$c36 = "whiteuscf";
				        var peg$c37 = "whiteUscf";
				        var peg$c38 = "BlackUSCF";
				        var peg$c39 = "BlackUscf";
				        var peg$c40 = "Blackuscf";
				        var peg$c41 = "blackuscf";
				        var peg$c42 = "blackUscf";
				        var peg$c43 = "WhiteNA";
				        var peg$c44 = "WhiteNa";
				        var peg$c45 = "Whitena";
				        var peg$c46 = "whitena";
				        var peg$c47 = "whiteNa";
				        var peg$c48 = "whiteNA";
				        var peg$c49 = "BlackNA";
				        var peg$c50 = "BlackNa";
				        var peg$c51 = "Blackna";
				        var peg$c52 = "blackna";
				        var peg$c53 = "blackNA";
				        var peg$c54 = "blackNa";
				        var peg$c55 = "WhiteType";
				        var peg$c56 = "Whitetype";
				        var peg$c57 = "whitetype";
				        var peg$c58 = "whiteType";
				        var peg$c59 = "BlackType";
				        var peg$c60 = "Blacktype";
				        var peg$c61 = "blacktype";
				        var peg$c62 = "blackType";
				        var peg$c63 = "EventDate";
				        var peg$c64 = "Eventdate";
				        var peg$c65 = "eventdate";
				        var peg$c66 = "eventDate";
				        var peg$c67 = "EventSponsor";
				        var peg$c68 = "Eventsponsor";
				        var peg$c69 = "eventsponsor";
				        var peg$c70 = "eventSponsor";
				        var peg$c71 = "Section";
				        var peg$c72 = "section";
				        var peg$c73 = "Stage";
				        var peg$c74 = "stage";
				        var peg$c75 = "Board";
				        var peg$c76 = "board";
				        var peg$c77 = "Opening";
				        var peg$c78 = "opening";
				        var peg$c79 = "Variation";
				        var peg$c80 = "variation";
				        var peg$c81 = "SubVariation";
				        var peg$c82 = "Subvariation";
				        var peg$c83 = "subvariation";
				        var peg$c84 = "subVariation";
				        var peg$c85 = "ECO";
				        var peg$c86 = "Eco";
				        var peg$c87 = "eco";
				        var peg$c88 = "NIC";
				        var peg$c89 = "Nic";
				        var peg$c90 = "nic";
				        var peg$c91 = "Time";
				        var peg$c92 = "time";
				        var peg$c93 = "UTCTime";
				        var peg$c94 = "UTCtime";
				        var peg$c95 = "UtcTime";
				        var peg$c96 = "Utctime";
				        var peg$c97 = "utctime";
				        var peg$c98 = "utcTime";
				        var peg$c99 = "UTCDate";
				        var peg$c100 = "UTCdate";
				        var peg$c101 = "UtcDate";
				        var peg$c102 = "Utcdate";
				        var peg$c103 = "utcdate";
				        var peg$c104 = "utcDate";
				        var peg$c105 = "TimeControl";
				        var peg$c106 = "Timecontrol";
				        var peg$c107 = "timecontrol";
				        var peg$c108 = "timeControl";
				        var peg$c109 = "SetUp";
				        var peg$c110 = "Setup";
				        var peg$c111 = "setup";
				        var peg$c112 = "setUp";
				        var peg$c113 = "FEN";
				        var peg$c114 = "Fen";
				        var peg$c115 = "fen";
				        var peg$c116 = "Termination";
				        var peg$c117 = "termination";
				        var peg$c118 = "Annotator";
				        var peg$c119 = "annotator";
				        var peg$c120 = "Mode";
				        var peg$c121 = "mode";
				        var peg$c122 = "PlyCount";
				        var peg$c123 = "Plycount";
				        var peg$c124 = "plycount";
				        var peg$c125 = "plyCount";
				        var peg$c126 = "Variant";
				        var peg$c127 = "variant";
				        var peg$c128 = "WhiteRatingDiff";
				        var peg$c129 = "BlackRatingDiff";
				        var peg$c130 = "WhiteFideId";
				        var peg$c131 = "BlackFideId";
				        var peg$c132 = "WhiteTeam";
				        var peg$c133 = "BlackTeam";
				        var peg$c134 = "Clock";
				        var peg$c135 = "WhiteClock";
				        var peg$c136 = "BlackClock";
				        var peg$c138 = "\"";
				        var peg$c139 = "\\";
				        var peg$c140 = ".";
				        var peg$c141 = ":";
				        var peg$c142 = "/";
				        var peg$c143 = "?";
				        var peg$c144 = "-";
				        var peg$c145 = "+";
				        var peg$c146 = "*";
				        var peg$c147 = "1-0";
				        var peg$c148 = "0-1";
				        var peg$c149 = "1/2-1/2";
				        var peg$c150 = "1/2";
				        var peg$c151 = "=";
				        var peg$c152 = "%csl";
				        var peg$c153 = "%cal";
				        var peg$c154 = "%";
				        var peg$c155 = "%eval";
				        var peg$c156 = "[%";
				        var peg$c157 = "}";
				        var peg$c158 = ",";
				        var peg$c159 = "Y";
				        var peg$c160 = "G";
				        var peg$c161 = "R";
				        var peg$c162 = "B";
				        var peg$c163 = "O";
				        var peg$c164 = "C";
				        var peg$c165 = "{";
				        var peg$c166 = "[";
				        var peg$c167 = "]";
				        var peg$c168 = ";";
				        var peg$c169 = "clk";
				        var peg$c170 = "egt";
				        var peg$c171 = "emt";
				        var peg$c172 = "mct";
				        var peg$c173 = "(";
				        var peg$c174 = ")";
				        var peg$c175 = " ";
				        var peg$c176 = "e.p.";
				        var peg$c177 = "O-O-O";
				        var peg$c178 = "O-O";
				        var peg$c179 = "@";
				        var peg$c180 = "Z0";
				        var peg$c181 = "+-";
				        var peg$c182 = "$$$";
				        var peg$c183 = "#";
				        var peg$c184 = "$";
				        var peg$c185 = "!!";
				        var peg$c186 = "??";
				        var peg$c187 = "!?";
				        var peg$c188 = "?!";
				        var peg$c189 = "!";
				        var peg$c190 = "\u203C";
				        var peg$c191 = "\u2047";
				        var peg$c192 = "\u2049";
				        var peg$c193 = "\u2048";
				        var peg$c194 = "\u25A1";
				        var peg$c195 = "\u221E";
				        var peg$c196 = "\u2A72";
				        var peg$c197 = "\u2A71";
				        var peg$c198 = "\xB1";
				        var peg$c199 = "\u2213";
				        var peg$c200 = "-+";
				        var peg$c201 = "\u2A00";
				        var peg$c202 = "\u27F3";
				        var peg$c203 = "\u2192";
				        var peg$c204 = "\u2191";
				        var peg$c205 = "\u21C6";
				        var peg$c206 = "D";
				        var peg$c207 = "x";
				        var peg$r0 = /^[ \t\n\r]/;
				        var peg$r1 = /^[\n\r]/;
				        var peg$r2 = /^[\-a-zA-Z0-9_.]/;
				        var peg$r3 = /^[^"\\\r\n]/;
				        var peg$r4 = /^[0-9?]/;
				        var peg$r5 = /^[0-9]/;
				        var peg$r6 = /^[BNW]/;
				        var peg$r7 = /^[^\n\r]/;
				        var peg$r8 = /^[1-8a-h]/;
				        var peg$r9 = /^[RNBQKP]/;
				        var peg$r10 = /^[RNBQ]/;
				        var peg$r11 = /^[a-h]/;
				        var peg$r12 = /^[1-8]/;
				        var peg$r13 = /^[\-x]/;
				        var peg$e0 = peg$literalExpectation("\uFEFF", false);
				        var peg$e1 = peg$literalExpectation("Event", false);
				        var peg$e2 = peg$literalExpectation("event", false);
				        var peg$e3 = peg$literalExpectation("Site", false);
				        var peg$e4 = peg$literalExpectation("site", false);
				        var peg$e5 = peg$literalExpectation("Date", false);
				        var peg$e6 = peg$literalExpectation("date", false);
				        var peg$e7 = peg$literalExpectation("Round", false);
				        var peg$e8 = peg$literalExpectation("round", false);
				        var peg$e9 = peg$literalExpectation("White", false);
				        var peg$e10 = peg$literalExpectation("white", false);
				        var peg$e11 = peg$literalExpectation("Black", false);
				        var peg$e12 = peg$literalExpectation("black", false);
				        var peg$e13 = peg$literalExpectation("Result", false);
				        var peg$e14 = peg$literalExpectation("result", false);
				        var peg$e15 = peg$literalExpectation("WhiteTitle", false);
				        var peg$e16 = peg$literalExpectation("Whitetitle", false);
				        var peg$e17 = peg$literalExpectation("whitetitle", false);
				        var peg$e18 = peg$literalExpectation("whiteTitle", false);
				        var peg$e19 = peg$literalExpectation("BlackTitle", false);
				        var peg$e20 = peg$literalExpectation("Blacktitle", false);
				        var peg$e21 = peg$literalExpectation("blacktitle", false);
				        var peg$e22 = peg$literalExpectation("blackTitle", false);
				        var peg$e23 = peg$literalExpectation("WhiteELO", false);
				        var peg$e24 = peg$literalExpectation("WhiteElo", false);
				        var peg$e25 = peg$literalExpectation("Whiteelo", false);
				        var peg$e26 = peg$literalExpectation("whiteelo", false);
				        var peg$e27 = peg$literalExpectation("whiteElo", false);
				        var peg$e28 = peg$literalExpectation("BlackELO", false);
				        var peg$e29 = peg$literalExpectation("BlackElo", false);
				        var peg$e30 = peg$literalExpectation("Blackelo", false);
				        var peg$e31 = peg$literalExpectation("blackelo", false);
				        var peg$e32 = peg$literalExpectation("blackElo", false);
				        var peg$e33 = peg$literalExpectation("WhiteUSCF", false);
				        var peg$e34 = peg$literalExpectation("WhiteUscf", false);
				        var peg$e35 = peg$literalExpectation("Whiteuscf", false);
				        var peg$e36 = peg$literalExpectation("whiteuscf", false);
				        var peg$e37 = peg$literalExpectation("whiteUscf", false);
				        var peg$e38 = peg$literalExpectation("BlackUSCF", false);
				        var peg$e39 = peg$literalExpectation("BlackUscf", false);
				        var peg$e40 = peg$literalExpectation("Blackuscf", false);
				        var peg$e41 = peg$literalExpectation("blackuscf", false);
				        var peg$e42 = peg$literalExpectation("blackUscf", false);
				        var peg$e43 = peg$literalExpectation("WhiteNA", false);
				        var peg$e44 = peg$literalExpectation("WhiteNa", false);
				        var peg$e45 = peg$literalExpectation("Whitena", false);
				        var peg$e46 = peg$literalExpectation("whitena", false);
				        var peg$e47 = peg$literalExpectation("whiteNa", false);
				        var peg$e48 = peg$literalExpectation("whiteNA", false);
				        var peg$e49 = peg$literalExpectation("BlackNA", false);
				        var peg$e50 = peg$literalExpectation("BlackNa", false);
				        var peg$e51 = peg$literalExpectation("Blackna", false);
				        var peg$e52 = peg$literalExpectation("blackna", false);
				        var peg$e53 = peg$literalExpectation("blackNA", false);
				        var peg$e54 = peg$literalExpectation("blackNa", false);
				        var peg$e55 = peg$literalExpectation("WhiteType", false);
				        var peg$e56 = peg$literalExpectation("Whitetype", false);
				        var peg$e57 = peg$literalExpectation("whitetype", false);
				        var peg$e58 = peg$literalExpectation("whiteType", false);
				        var peg$e59 = peg$literalExpectation("BlackType", false);
				        var peg$e60 = peg$literalExpectation("Blacktype", false);
				        var peg$e61 = peg$literalExpectation("blacktype", false);
				        var peg$e62 = peg$literalExpectation("blackType", false);
				        var peg$e63 = peg$literalExpectation("EventDate", false);
				        var peg$e64 = peg$literalExpectation("Eventdate", false);
				        var peg$e65 = peg$literalExpectation("eventdate", false);
				        var peg$e66 = peg$literalExpectation("eventDate", false);
				        var peg$e67 = peg$literalExpectation("EventSponsor", false);
				        var peg$e68 = peg$literalExpectation("Eventsponsor", false);
				        var peg$e69 = peg$literalExpectation("eventsponsor", false);
				        var peg$e70 = peg$literalExpectation("eventSponsor", false);
				        var peg$e71 = peg$literalExpectation("Section", false);
				        var peg$e72 = peg$literalExpectation("section", false);
				        var peg$e73 = peg$literalExpectation("Stage", false);
				        var peg$e74 = peg$literalExpectation("stage", false);
				        var peg$e75 = peg$literalExpectation("Board", false);
				        var peg$e76 = peg$literalExpectation("board", false);
				        var peg$e77 = peg$literalExpectation("Opening", false);
				        var peg$e78 = peg$literalExpectation("opening", false);
				        var peg$e79 = peg$literalExpectation("Variation", false);
				        var peg$e80 = peg$literalExpectation("variation", false);
				        var peg$e81 = peg$literalExpectation("SubVariation", false);
				        var peg$e82 = peg$literalExpectation("Subvariation", false);
				        var peg$e83 = peg$literalExpectation("subvariation", false);
				        var peg$e84 = peg$literalExpectation("subVariation", false);
				        var peg$e85 = peg$literalExpectation("ECO", false);
				        var peg$e86 = peg$literalExpectation("Eco", false);
				        var peg$e87 = peg$literalExpectation("eco", false);
				        var peg$e88 = peg$literalExpectation("NIC", false);
				        var peg$e89 = peg$literalExpectation("Nic", false);
				        var peg$e90 = peg$literalExpectation("nic", false);
				        var peg$e91 = peg$literalExpectation("Time", false);
				        var peg$e92 = peg$literalExpectation("time", false);
				        var peg$e93 = peg$literalExpectation("UTCTime", false);
				        var peg$e94 = peg$literalExpectation("UTCtime", false);
				        var peg$e95 = peg$literalExpectation("UtcTime", false);
				        var peg$e96 = peg$literalExpectation("Utctime", false);
				        var peg$e97 = peg$literalExpectation("utctime", false);
				        var peg$e98 = peg$literalExpectation("utcTime", false);
				        var peg$e99 = peg$literalExpectation("UTCDate", false);
				        var peg$e100 = peg$literalExpectation("UTCdate", false);
				        var peg$e101 = peg$literalExpectation("UtcDate", false);
				        var peg$e102 = peg$literalExpectation("Utcdate", false);
				        var peg$e103 = peg$literalExpectation("utcdate", false);
				        var peg$e104 = peg$literalExpectation("utcDate", false);
				        var peg$e105 = peg$literalExpectation("TimeControl", false);
				        var peg$e106 = peg$literalExpectation("Timecontrol", false);
				        var peg$e107 = peg$literalExpectation("timecontrol", false);
				        var peg$e108 = peg$literalExpectation("timeControl", false);
				        var peg$e109 = peg$literalExpectation("SetUp", false);
				        var peg$e110 = peg$literalExpectation("Setup", false);
				        var peg$e111 = peg$literalExpectation("setup", false);
				        var peg$e112 = peg$literalExpectation("setUp", false);
				        var peg$e113 = peg$literalExpectation("FEN", false);
				        var peg$e114 = peg$literalExpectation("Fen", false);
				        var peg$e115 = peg$literalExpectation("fen", false);
				        var peg$e116 = peg$literalExpectation("Termination", false);
				        var peg$e117 = peg$literalExpectation("termination", false);
				        var peg$e118 = peg$literalExpectation("Annotator", false);
				        var peg$e119 = peg$literalExpectation("annotator", false);
				        var peg$e120 = peg$literalExpectation("Mode", false);
				        var peg$e121 = peg$literalExpectation("mode", false);
				        var peg$e122 = peg$literalExpectation("PlyCount", false);
				        var peg$e123 = peg$literalExpectation("Plycount", false);
				        var peg$e124 = peg$literalExpectation("plycount", false);
				        var peg$e125 = peg$literalExpectation("plyCount", false);
				        var peg$e126 = peg$literalExpectation("Variant", false);
				        var peg$e127 = peg$literalExpectation("variant", false);
				        var peg$e128 = peg$literalExpectation("WhiteRatingDiff", false);
				        var peg$e129 = peg$literalExpectation("BlackRatingDiff", false);
				        var peg$e130 = peg$literalExpectation("WhiteFideId", false);
				        var peg$e131 = peg$literalExpectation("BlackFideId", false);
				        var peg$e132 = peg$literalExpectation("WhiteTeam", false);
				        var peg$e133 = peg$literalExpectation("BlackTeam", false);
				        var peg$e134 = peg$literalExpectation("Clock", false);
				        var peg$e135 = peg$literalExpectation("WhiteClock", false);
				        var peg$e136 = peg$literalExpectation("BlackClock", false);
				        var peg$e137 = peg$otherExpectation("whitespace");
				        var peg$e138 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
				        var peg$e139 = peg$classExpectation(["\n", "\r"], false, false);
				        var peg$e141 = peg$classExpectation(["-", ["a", "z"], ["A", "Z"], ["0", "9"], "_", "."], false, false);
				        var peg$e142 = peg$literalExpectation("\"", false);
				        var peg$e143 = peg$classExpectation(["\"", "\\", "\r", "\n"], true, false);
				        var peg$e144 = peg$literalExpectation("\\", false);
				        var peg$e145 = peg$classExpectation([["0", "9"], "?"], false, false);
				        var peg$e146 = peg$literalExpectation(".", false);
				        var peg$e147 = peg$classExpectation([["0", "9"]], false, false);
				        var peg$e148 = peg$literalExpectation(":", false);
				        var peg$e149 = peg$literalExpectation("/", false);
				        var peg$e150 = peg$classExpectation(["B", "N", "W"], false, false);
				        var peg$e151 = peg$literalExpectation("?", false);
				        var peg$e152 = peg$literalExpectation("-", false);
				        var peg$e153 = peg$literalExpectation("+", false);
				        var peg$e154 = peg$literalExpectation("*", false);
				        var peg$e155 = peg$literalExpectation("1-0", false);
				        var peg$e156 = peg$literalExpectation("0-1", false);
				        var peg$e157 = peg$literalExpectation("1/2-1/2", false);
				        var peg$e158 = peg$literalExpectation("1/2", false);
				        var peg$e159 = peg$literalExpectation("=", false);
				        var peg$e160 = peg$literalExpectation("%csl", false);
				        var peg$e161 = peg$literalExpectation("%cal", false);
				        var peg$e162 = peg$literalExpectation("%", false);
				        var peg$e163 = peg$literalExpectation("%eval", false);
				        var peg$e164 = peg$literalExpectation("[%", false);
				        var peg$e165 = peg$literalExpectation("}", false);
				        var peg$e166 = peg$anyExpectation();
				        var peg$e167 = peg$classExpectation(["\n", "\r"], true, false);
				        var peg$e168 = peg$literalExpectation(",", false);
				        var peg$e169 = peg$literalExpectation("Y", false);
				        var peg$e170 = peg$literalExpectation("G", false);
				        var peg$e171 = peg$literalExpectation("R", false);
				        var peg$e172 = peg$literalExpectation("B", false);
				        var peg$e173 = peg$literalExpectation("O", false);
				        var peg$e174 = peg$literalExpectation("C", false);
				        var peg$e175 = peg$literalExpectation("{", false);
				        var peg$e176 = peg$literalExpectation("[", false);
				        var peg$e177 = peg$literalExpectation("]", false);
				        var peg$e178 = peg$literalExpectation(";", false);
				        var peg$e179 = peg$literalExpectation("clk", false);
				        var peg$e180 = peg$literalExpectation("egt", false);
				        var peg$e181 = peg$literalExpectation("emt", false);
				        var peg$e182 = peg$literalExpectation("mct", false);
				        var peg$e183 = peg$literalExpectation("(", false);
				        var peg$e184 = peg$literalExpectation(")", false);
				        var peg$e185 = peg$otherExpectation("integer");
				        var peg$e186 = peg$literalExpectation(" ", false);
				        var peg$e187 = peg$literalExpectation("e.p.", false);
				        var peg$e188 = peg$literalExpectation("O-O-O", false);
				        var peg$e189 = peg$literalExpectation("O-O", false);
				        var peg$e190 = peg$literalExpectation("@", false);
				        var peg$e191 = peg$literalExpectation("Z0", false);
				        var peg$e192 = peg$literalExpectation("+-", false);
				        var peg$e193 = peg$literalExpectation("$$$", false);
				        var peg$e194 = peg$literalExpectation("#", false);
				        var peg$e195 = peg$literalExpectation("$", false);
				        var peg$e196 = peg$literalExpectation("!!", false);
				        var peg$e197 = peg$literalExpectation("??", false);
				        var peg$e198 = peg$literalExpectation("!?", false);
				        var peg$e199 = peg$literalExpectation("?!", false);
				        var peg$e200 = peg$literalExpectation("!", false);
				        var peg$e201 = peg$literalExpectation("\u203C", false);
				        var peg$e202 = peg$literalExpectation("\u2047", false);
				        var peg$e203 = peg$literalExpectation("\u2049", false);
				        var peg$e204 = peg$literalExpectation("\u2048", false);
				        var peg$e205 = peg$literalExpectation("\u25A1", false);
				        var peg$e206 = peg$literalExpectation("\u221E", false);
				        var peg$e207 = peg$literalExpectation("\u2A72", false);
				        var peg$e208 = peg$literalExpectation("\u2A71", false);
				        var peg$e209 = peg$literalExpectation("\xB1", false);
				        var peg$e210 = peg$literalExpectation("\u2213", false);
				        var peg$e211 = peg$literalExpectation("-+", false);
				        var peg$e212 = peg$literalExpectation("\u2A00", false);
				        var peg$e213 = peg$literalExpectation("\u27F3", false);
				        var peg$e214 = peg$literalExpectation("\u2192", false);
				        var peg$e215 = peg$literalExpectation("\u2191", false);
				        var peg$e216 = peg$literalExpectation("\u21C6", false);
				        var peg$e217 = peg$literalExpectation("D", false);
				        var peg$e218 = peg$classExpectation([["1", "8"], ["a", "h"]], false, false);
				        var peg$e219 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false);
				        var peg$e220 = peg$classExpectation(["R", "N", "B", "Q"], false, false);
				        var peg$e221 = peg$classExpectation([["a", "h"]], false, false);
				        var peg$e222 = peg$classExpectation([["1", "8"]], false, false);
				        var peg$e223 = peg$literalExpectation("x", false);
				        var peg$e224 = peg$classExpectation(["-", "x"], false, false);
				        var peg$f0 = function (head, m) { return m; };
				        var peg$f1 = function (head, tail) {
				            //console.log("Length tail: " + tail.length);
				            return [head].concat(tail);
				        };
				        var peg$f2 = function (games) {
				            //console.log("Length: " + games.length);
				            return games;
				        };
				        var peg$f3 = function (t, c, p) {
				            //console.log("Length pgn: " + p.length);
				            var mess = messages;
				            messages = [];
				            return { tags: t, gameComment: c, moves: p, messages: mess };
				        };
				        var peg$f4 = function (head, m) { return m; };
				        var peg$f5 = function (head, tail) {
				            var result = {};
				            [head].concat(tail).forEach(function (element) {
				                result[element.name] = element.value;
				            });
				            return result;
				        };
				        var peg$f6 = function (members) {
				            if (members === null)
				                return {};
				            members.messages = messages;
				            return members;
				        };
				        var peg$f7 = function (tag) { return tag; };
				        var peg$f8 = function (value) { return { name: 'Event', value: value }; };
				        var peg$f9 = function (value) { return { name: 'Site', value: value }; };
				        var peg$f10 = function (value) { return { name: 'Date', value: value }; };
				        var peg$f11 = function (value) { return { name: 'Round', value: value }; };
				        var peg$f12 = function (value) { return { name: 'WhiteTitle', value: value }; };
				        var peg$f13 = function (value) { return { name: 'BlackTitle', value: value }; };
				        var peg$f14 = function (value) { return { name: 'WhiteElo', value: value }; };
				        var peg$f15 = function (value) { return { name: 'BlackElo', value: value }; };
				        var peg$f16 = function (value) { return { name: 'WhiteUSCF', value: value }; };
				        var peg$f17 = function (value) { return { name: 'BlackUSCF', value: value }; };
				        var peg$f18 = function (value) { return { name: 'WhiteNA', value: value }; };
				        var peg$f19 = function (value) { return { name: 'BlackNA', value: value }; };
				        var peg$f20 = function (value) { return { name: 'WhiteType', value: value }; };
				        var peg$f21 = function (value) { return { name: 'BlackType', value: value }; };
				        var peg$f22 = function (value) { return { name: 'White', value: value }; };
				        var peg$f23 = function (value) { return { name: 'Black', value: value }; };
				        var peg$f24 = function (value) { return { name: 'Result', value: value }; };
				        var peg$f25 = function (value) { return { name: 'EventDate', value: value }; };
				        var peg$f26 = function (value) { return { name: 'EventSponsor', value: value }; };
				        var peg$f27 = function (value) { return { name: 'Section', value: value }; };
				        var peg$f28 = function (value) { return { name: 'Stage', value: value }; };
				        var peg$f29 = function (value) { return { name: 'Board', value: value }; };
				        var peg$f30 = function (value) { return { name: 'Opening', value: value }; };
				        var peg$f31 = function (value) { return { name: 'Variation', value: value }; };
				        var peg$f32 = function (value) { return { name: 'SubVariation', value: value }; };
				        var peg$f33 = function (value) { return { name: 'ECO', value: value }; };
				        var peg$f34 = function (value) { return { name: 'NIC', value: value }; };
				        var peg$f35 = function (value) { return { name: 'Time', value: value }; };
				        var peg$f36 = function (value) { return { name: 'UTCTime', value: value }; };
				        var peg$f37 = function (value) { return { name: 'UTCDate', value: value }; };
				        var peg$f38 = function (value) { return { name: 'TimeControl', value: value }; };
				        var peg$f39 = function (value) { return { name: 'SetUp', value: value }; };
				        var peg$f40 = function (value) { return { name: 'FEN', value: value }; };
				        var peg$f41 = function (value) { return { name: 'Termination', value: value }; };
				        var peg$f42 = function (value) { return { name: 'Annotator', value: value }; };
				        var peg$f43 = function (value) { return { name: 'Mode', value: value }; };
				        var peg$f44 = function (value) { return { name: 'PlyCount', value: value }; };
				        var peg$f45 = function (value) { return { name: 'Variant', value: value }; };
				        var peg$f46 = function (value) { return { name: 'WhiteRatingDiff', value: value }; };
				        var peg$f47 = function (value) { return { name: 'BlackRatingDiff', value: value }; };
				        var peg$f48 = function (value) { return { name: 'WhiteFideId', value: value }; };
				        var peg$f49 = function (value) { return { name: 'BlackFideId', value: value }; };
				        var peg$f50 = function (value) { return { name: 'WhiteTeam', value: value }; };
				        var peg$f51 = function (value) { return { name: 'BlackTeam', value: value }; };
				        var peg$f52 = function (value) { return { name: 'Clock', value: value }; };
				        var peg$f53 = function (value) { return { name: 'WhiteClock', value: value }; };
				        var peg$f54 = function (value) { return { name: 'BlackClock', value: value }; };
				        var peg$f55 = function (a, value) {
				            addMessage({ key: a, value: value, message: `Format of tag: "${a}" not correct: "${value}"` });
				            return { name: a, value: value };
				        };
				        var peg$f56 = function (a, value) {
				            addMessage({ key: a, value: value, message: `Tag: "${a}" not known: "${value}"` });
				            return { name: a, value: value };
				        };
				        var peg$f58 = function (chars) { return chars.join(""); };
				        var peg$f59 = function (stringContent) { return stringContent.map(c => c.char || c).join(''); };
				        var peg$f60 = function () { return { type: "char", char: "\\" }; };
				        var peg$f61 = function () { return { type: "char", char: '"' }; };
				        var peg$f62 = function (sequence) { return sequence; };
				        var peg$f63 = function (year, month, day) {
				            let val = "" + year.join("") + '.' + month.join("") + '.' + day.join("");
				            return { value: val, year: mi(year), month: mi(month), day: mi(day) };
				        };
				        var peg$f64 = function (hour, minute, second, millis) {
				            let val = hour.join("") + ':' + minute.join("") + ':' + second.join("");
				            let ms = 0;
				            if (millis) {
				                val = val + '.' + millis;
				                addMessage({ message: `Unusual use of millis in time: ${val}` });
				                mi(millis);
				            }
				            return { value: val, hour: mi(hour), minute: mi(minute), second: mi(second), millis: ms };
				        };
				        var peg$f65 = function (millis) { return millis.join(""); };
				        var peg$f66 = function (value) { return value; };
				        var peg$f67 = function (c, t) { return c + '/' + t; };
				        var peg$f68 = function (value) { return value; };
				        var peg$f69 = function (value) { return value; };
				        var peg$f70 = function (res) {
				            if (!res) {
				                addMessage({ message: "Tag TimeControl has to have a value" });
				                return "";
				            }
				            return res;
				        };
				        var peg$f71 = function (head, m) { return m; };
				        var peg$f72 = function (head, tail) { let ret = [head].concat(tail); ret.value = ret.map(ret => ret.value).join(':'); return ret; };
				        var peg$f73 = function (tcnqs) { return tcnqs; };
				        var peg$f74 = function () { return { kind: 'unknown', value: '?' }; };
				        var peg$f75 = function () { return { kind: 'unlimited', value: '-' }; };
				        var peg$f76 = function (moves, seconds, incr) { return { kind: 'movesInSecondsIncrement', moves: moves, seconds: seconds, increment: incr, value: '' + moves + '/' + seconds + '+' + incr }; };
				        var peg$f77 = function (moves, seconds) { return { kind: 'movesInSeconds', moves: moves, seconds: seconds, value: '' + moves + '/' + seconds }; };
				        var peg$f78 = function (seconds, incr) { return { kind: 'increment', seconds: seconds, increment: incr, value: '' + seconds + '+' + incr }; };
				        var peg$f79 = function (seconds) { return { kind: 'suddenDeath', seconds: seconds, value: '' + seconds }; };
				        var peg$f80 = function (seconds) { return { kind: 'hourglass', seconds: seconds, value: '*' + seconds }; };
				        var peg$f81 = function (res) { return res; };
				        var peg$f82 = function (res) { return res; };
				        var peg$f83 = function (res) { return res; };
				        var peg$f84 = function (res) { return res; };
				        var peg$f85 = function () { return "1/2-1/2"; };
				        var peg$f86 = function (res) { return res; };
				        var peg$f87 = function (v) { return v; };
				        var peg$f88 = function () { return 0; };
				        var peg$f89 = function () { addMessage({ message: 'Use "-" for an unknown value' }); return 0; };
				        var peg$f90 = function (digits) { return makeInteger(digits); };
				        var peg$f91 = function (cm, mn, hm, nag, dr, ca, vari, all) {
				            var arr = (all ? all : []);
				            var move = {};
				            move.moveNumber = mn;
				            move.notation = hm;
				            if (ca) {
				                move.commentAfter = ca.comment;
				            }
				            if (cm) {
				                move.commentMove = cm.comment;
				            }
				            if (dr) {
				                move.drawOffer = true;
				            }
				            move.variations = (vari ? vari : []);
				            move.nag = (nag ? nag : null);
				            arr.unshift(move);
				            move.commentDiag = ca;
				            return arr;
				        };
				        var peg$f92 = function (e) { return e; };
				        var peg$f93 = function (eg) { return [eg]; };
				        var peg$f94 = function (cf, c) { return c; };
				        var peg$f95 = function (cf, cfl) { return merge([cf].concat(cfl)); };
				        var peg$f96 = function () { return; };
				        var peg$f97 = function (cm) { return cm; };
				        var peg$f98 = function (cm) { return { comment: cm }; };
				        var peg$f99 = function (cf, ic) { return ic; };
				        var peg$f100 = function (cf, tail) { return merge([{ colorFields: cf }].concat(tail[0])); };
				        var peg$f101 = function (ca, ic) { return ic; };
				        var peg$f102 = function (ca, tail) { return merge([{ colorArrows: ca }].concat(tail[0])); };
				        var peg$f103 = function (cc, cv, ic) { return ic; };
				        var peg$f104 = function (cc, cv, tail) { var ret = {}; ret[cc] = cv; return merge([ret].concat(tail[0])); };
				        var peg$f105 = function (cc, cv, ic) { return ic; };
				        var peg$f106 = function (cc, cv, tail) { var ret = {}; ret[cc] = cv; return merge([ret].concat(tail[0])); };
				        var peg$f107 = function (ev, ic) { return ic; };
				        var peg$f108 = function (ev, tail) { var ret = {}; ret["eval"] = parseFloat(ev); return merge([ret].concat(tail[0])); };
				        var peg$f109 = function (ac, val, ic) { return ic; };
				        var peg$f110 = function (ac, val, tail) { var ret = {}; ret[ac] = val.join(""); return merge([ret].concat(tail[0])); };
				        var peg$f111 = function (c, ic) { return ic; };
				        var peg$f112 = function (c, tail) {
				            if (tail.length > 0) {
				                return merge([{ comment: trimEnd(c.join("")) }].concat(trimStart(tail[0])));
				            }
				            else {
				                return { comment: c.join("") };
				            }
				        };
				        var peg$f113 = function (ch) { return ch; };
				        var peg$f114 = function (ch) { return ch; };
				        var peg$f115 = function (cm) { return cm.join(""); };
				        var peg$f116 = function (cf, cfl) { var arr = []; arr.push(cf); for (var i = 0; i < cfl.length; i++) {
				            arr.push(cfl[i][2]);
				        } return arr; };
				        var peg$f117 = function (col, f) { return col + f; };
				        var peg$f118 = function (cf, cfl) { var arr = []; arr.push(cf); for (var i = 0; i < cfl.length; i++) {
				            arr.push(cfl[i][2]);
				        } return arr; };
				        var peg$f119 = function (col, ff, ft) { return col + ff + ft; };
				        var peg$f120 = function () { return "Y"; };
				        var peg$f121 = function () { return "G"; };
				        var peg$f122 = function () { return "R"; };
				        var peg$f123 = function () { return "B"; };
				        var peg$f124 = function () { return "O"; };
				        var peg$f125 = function () { return "C"; };
				        var peg$f126 = function (col, row) { return col + row; };
				        var peg$f131 = function () { return "clk"; };
				        var peg$f132 = function () { return "egt"; };
				        var peg$f133 = function () { return "emt"; };
				        var peg$f134 = function () { return "mct"; };
				        var peg$f135 = function (hm, s1, s2, millis) {
				            let ret = s1;
				            if (!hm) {
				                addMessage({ message: `Hours and minutes missing` });
				            }
				            else {
				                ret = hm + ret;
				            }
				            if (hm && ((hm.match(/:/g) || []).length == 2)) {
				                if (hm.search(':') == 2) {
				                    addMessage({ message: `Only 1 digit for hours normally used` });
				                }
				            }
				            if (!s2) {
				                addMessage({ message: `Only 2 digit for seconds normally used` });
				            }
				            else {
				                ret += s2;
				            }
				            if (millis) {
				                addMessage({ message: `Unusual use of millis in clock value` });
				                ret += '.' + millis;
				            }
				            return ret;
				        };
				        var peg$f136 = function (hm, s1, s2) {
				            let ret = s1;
				            if (!hm) {
				                addMessage({ message: `Hours and minutes missing` });
				            }
				            else {
				                ret = hm + ret;
				            }
				            if (hm && ((hm.match(/:/g) || []).length == 2)) {
				                if (hm.search(':') == 1) {
				                    addMessage({ message: `Only 2 digits for hours normally used` });
				                }
				            }
				            if (!s2) {
				                addMessage({ message: `Only 2 digit for seconds normally used` });
				            }
				            else {
				                ret += s2;
				            }
				            return ret;
				        };
				        var peg$f137 = function (hours, minutes) {
				            if (!minutes) {
				                addMessage({ message: `No hours found` });
				                return hours;
				            }
				            return hours + minutes;
				        };
				        var peg$f138 = function (h1, h2) {
				            let ret = h1;
				            if (h2) {
				                ret += h2 + ":";
				            }
				            else {
				                ret += ":";
				            }
				            return ret;
				        };
				        var peg$f139 = function (m1, m2) {
				            let ret = m1;
				            if (m2) {
				                ret += m2 + ":";
				            }
				            else {
				                ret += ":";
				                addMessage({ message: `Only 2 digits for minutes normally used` });
				            }
				            return ret;
				        };
				        var peg$f140 = function (d) { return d; };
				        var peg$f141 = function (vari, all) { var arr = (all ? all : []); arr.unshift(vari); return arr; };
				        var peg$f142 = function (num) { return num; };
				        var peg$f143 = function (digits) { return makeInteger(digits); };
				        var peg$f144 = function () { return ''; };
				        var peg$f145 = function (fig, disc, str, col, row, pr, ch) {
				            var hm = {};
				            hm.fig = (fig ? fig : null);
				            hm.disc = (disc ? disc : null);
				            hm.strike = (str ? str : null);
				            hm.col = col;
				            hm.row = row;
				            hm.check = (ch ? ch : null);
				            hm.promotion = pr;
				            hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
				            return hm;
				        };
				        var peg$f146 = function (fig, cols, rows, str, col, row, pr, ch) {
				            var hm = {};
				            hm.fig = (fig ? fig : null);
				            hm.strike = (str == 'x' ? str : null);
				            hm.col = col;
				            hm.row = row;
				            hm.notation = (fig && (fig !== 'P') ? fig : "") + cols + rows + (str == 'x' ? str : "-") + col + row + (pr ? pr : "") + (ch ? ch : "");
				            hm.check = (ch ? ch : null);
				            hm.promotion = pr;
				            return hm;
				        };
				        var peg$f147 = function (fig, str, col, row, pr, ch) {
				            var hm = {};
				            hm.fig = (fig ? fig : null);
				            hm.strike = (str ? str : null);
				            hm.col = col;
				            hm.row = row;
				            hm.check = (ch ? ch : null);
				            hm.promotion = pr;
				            hm.notation = (fig ? fig : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
				            return hm;
				        };
				        var peg$f148 = function (ch) { var hm = {}; hm.notation = 'O-O-O' + (ch ? ch : ""); hm.check = (ch ? ch : null); return hm; };
				        var peg$f149 = function (ch) { var hm = {}; hm.notation = 'O-O' + (ch ? ch : ""); hm.check = (ch ? ch : null); return hm; };
				        var peg$f150 = function (fig, col, row) { var hm = {}; hm.fig = fig; hm.drop = true; hm.col = col; hm.row = row; hm.notation = fig + '@' + col + row; return hm; };
				        var peg$f151 = function () { var hm = {}; hm.notation = "Z0"; return hm; };
				        var peg$f152 = function (ch) { return ch[1]; };
				        var peg$f153 = function (ch) { return ch[1]; };
				        var peg$f154 = function (f) { return '=' + f; };
				        var peg$f155 = function (nag, nags) { var arr = (nags ? nags : []); arr.unshift(nag); return arr; };
				        var peg$f156 = function (num) { return '$' + num; };
				        var peg$f157 = function () { return '$3'; };
				        var peg$f158 = function () { return '$4'; };
				        var peg$f159 = function () { return '$5'; };
				        var peg$f160 = function () { return '$6'; };
				        var peg$f161 = function () { return '$1'; };
				        var peg$f162 = function () { return '$2'; };
				        var peg$f163 = function () { return '$3'; };
				        var peg$f164 = function () { return '$4'; };
				        var peg$f165 = function () { return '$5'; };
				        var peg$f166 = function () { return '$6'; };
				        var peg$f167 = function () { return '$7'; };
				        var peg$f168 = function () { return '$10'; };
				        var peg$f169 = function () { return '$13'; };
				        var peg$f170 = function () { return '$14'; };
				        var peg$f171 = function () { return '$15'; };
				        var peg$f172 = function () { return '$16'; };
				        var peg$f173 = function () { return '$17'; };
				        var peg$f174 = function () { return '$18'; };
				        var peg$f175 = function () { return '$19'; };
				        var peg$f176 = function () { return '$22'; };
				        var peg$f177 = function () { return '$32'; };
				        var peg$f178 = function () { return '$36'; };
				        var peg$f179 = function () { return '$40'; };
				        var peg$f180 = function () { return '$132'; };
				        var peg$f181 = function () { return '$220'; };
				        var peg$currPos = options.peg$currPos | 0;
				        var peg$savedPos = peg$currPos;
				        var peg$posDetailsCache = [{ line: 1, column: 1 }];
				        var peg$maxFailPos = peg$currPos;
				        var peg$maxFailExpected = options.peg$maxFailExpected || [];
				        var peg$silentFails = options.peg$silentFails | 0;
				        var peg$result;
				        if (options.startRule) {
				            if (!(options.startRule in peg$startRuleFunctions)) {
				                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
				            }
				            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
				        }
				        function location() {
				            return peg$computeLocation(peg$savedPos, peg$currPos);
				        }
				        function peg$literalExpectation(text, ignoreCase) {
				            return { type: "literal", text: text, ignoreCase: ignoreCase };
				        }
				        function peg$classExpectation(parts, inverted, ignoreCase) {
				            return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
				        }
				        function peg$anyExpectation() {
				            return { type: "any" };
				        }
				        function peg$endExpectation() {
				            return { type: "end" };
				        }
				        function peg$otherExpectation(description) {
				            return { type: "other", description: description };
				        }
				        function peg$computePosDetails(pos) {
				            var details = peg$posDetailsCache[pos];
				            var p;
				            if (details) {
				                return details;
				            }
				            else {
				                if (pos >= peg$posDetailsCache.length) {
				                    p = peg$posDetailsCache.length - 1;
				                }
				                else {
				                    p = pos;
				                    while (!peg$posDetailsCache[--p]) { }
				                }
				                details = peg$posDetailsCache[p];
				                details = {
				                    line: details.line,
				                    column: details.column
				                };
				                while (p < pos) {
				                    if (input.charCodeAt(p) === 10) {
				                        details.line++;
				                        details.column = 1;
				                    }
				                    else {
				                        details.column++;
				                    }
				                    p++;
				                }
				                peg$posDetailsCache[pos] = details;
				                return details;
				            }
				        }
				        function peg$computeLocation(startPos, endPos, offset) {
				            var startPosDetails = peg$computePosDetails(startPos);
				            var endPosDetails = peg$computePosDetails(endPos);
				            var res = {
				                source: peg$source,
				                start: {
				                    offset: startPos,
				                    line: startPosDetails.line,
				                    column: startPosDetails.column
				                },
				                end: {
				                    offset: endPos,
				                    line: endPosDetails.line,
				                    column: endPosDetails.column
				                }
				            };
				            return res;
				        }
				        function peg$fail(expected) {
				            if (peg$currPos < peg$maxFailPos) {
				                return;
				            }
				            if (peg$currPos > peg$maxFailPos) {
				                peg$maxFailPos = peg$currPos;
				                peg$maxFailExpected = [];
				            }
				            peg$maxFailExpected.push(expected);
				        }
				        function peg$buildStructuredError(expected, found, location) {
				            return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
				        }
				        function peg$parseBOM() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 65279) {
				                s0 = peg$c0;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e0);
				                }
				            }
				            return s0;
				        }
				        function peg$parsegames() {
				            var s0, s3, s4, s5, s6, s8;
				            s0 = peg$currPos;
				            peg$parseBOM();
				            peg$parsews();
				            s3 = peg$currPos;
				            s4 = peg$parsegame();
				            if (s4 !== peg$FAILED) {
				                s5 = [];
				                s6 = peg$currPos;
				                peg$parsews();
				                s8 = peg$parsegame();
				                if (s8 !== peg$FAILED) {
				                    peg$savedPos = s6;
				                    s6 = peg$f0(s4, s8);
				                }
				                else {
				                    peg$currPos = s6;
				                    s6 = peg$FAILED;
				                }
				                while (s6 !== peg$FAILED) {
				                    s5.push(s6);
				                    s6 = peg$currPos;
				                    peg$parsews();
				                    s8 = peg$parsegame();
				                    if (s8 !== peg$FAILED) {
				                        peg$savedPos = s6;
				                        s6 = peg$f0(s4, s8);
				                    }
				                    else {
				                        peg$currPos = s6;
				                        s6 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s3;
				                s3 = peg$f1(s4, s5);
				            }
				            else {
				                peg$currPos = s3;
				                s3 = peg$FAILED;
				            }
				            if (s3 === peg$FAILED) {
				                s3 = null;
				            }
				            peg$savedPos = s0;
				            s0 = peg$f2(s3);
				            return s0;
				        }
				        function peg$parsegame() {
				            var s0, s2, s3, s4;
				            s0 = peg$currPos;
				            peg$parseBOM();
				            s2 = peg$parsetags();
				            s3 = peg$parsecomments();
				            if (s3 === peg$FAILED) {
				                s3 = null;
				            }
				            s4 = peg$parsepgn();
				            if (s4 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s0 = peg$f3(s2, s3, s4);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsetags() {
				            var s0, s3, s4, s5, s6, s8;
				            s0 = peg$currPos;
				            peg$parseBOM();
				            peg$parsews();
				            s3 = peg$currPos;
				            s4 = peg$parsetag();
				            if (s4 !== peg$FAILED) {
				                s5 = [];
				                s6 = peg$currPos;
				                peg$parsews();
				                s8 = peg$parsetag();
				                if (s8 !== peg$FAILED) {
				                    peg$savedPos = s6;
				                    s6 = peg$f4(s4, s8);
				                }
				                else {
				                    peg$currPos = s6;
				                    s6 = peg$FAILED;
				                }
				                while (s6 !== peg$FAILED) {
				                    s5.push(s6);
				                    s6 = peg$currPos;
				                    peg$parsews();
				                    s8 = peg$parsetag();
				                    if (s8 !== peg$FAILED) {
				                        peg$savedPos = s6;
				                        s6 = peg$f4(s4, s8);
				                    }
				                    else {
				                        peg$currPos = s6;
				                        s6 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s3;
				                s3 = peg$f5(s4, s5);
				            }
				            else {
				                peg$currPos = s3;
				                s3 = peg$FAILED;
				            }
				            if (s3 === peg$FAILED) {
				                s3 = null;
				            }
				            s4 = peg$parsews();
				            peg$savedPos = s0;
				            s0 = peg$f6(s3);
				            return s0;
				        }
				        function peg$parsetag() {
				            var s0, s1, s3, s5;
				            s0 = peg$currPos;
				            s1 = peg$parsebl();
				            if (s1 !== peg$FAILED) {
				                peg$parsews();
				                s3 = peg$parsetagKeyValue();
				                if (s3 !== peg$FAILED) {
				                    peg$parsews();
				                    s5 = peg$parsebr();
				                    if (s5 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f7(s3);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsetagKeyValue() {
				            var s0, s1, s2, s3, s4;
				            s0 = peg$currPos;
				            s1 = peg$parseeventKey();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsews();
				                s3 = peg$parsestring();
				                if (s3 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f8(s3);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parsesiteKey();
				                if (s1 !== peg$FAILED) {
				                    s2 = peg$parsews();
				                    s3 = peg$parsestring();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f9(s3);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parsedateKey();
				                    if (s1 !== peg$FAILED) {
				                        s2 = peg$parsews();
				                        s3 = peg$parsedateString();
				                        if (s3 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s0 = peg$f10(s3);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        s1 = peg$parseroundKey();
				                        if (s1 !== peg$FAILED) {
				                            s2 = peg$parsews();
				                            s3 = peg$parsestring();
				                            if (s3 !== peg$FAILED) {
				                                peg$savedPos = s0;
				                                s0 = peg$f11(s3);
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            s1 = peg$parsewhiteTitleKey();
				                            if (s1 !== peg$FAILED) {
				                                s2 = peg$parsews();
				                                s3 = peg$parsestring();
				                                if (s3 !== peg$FAILED) {
				                                    peg$savedPos = s0;
				                                    s0 = peg$f12(s3);
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                s1 = peg$parseblackTitleKey();
				                                if (s1 !== peg$FAILED) {
				                                    s2 = peg$parsews();
				                                    s3 = peg$parsestring();
				                                    if (s3 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s0 = peg$f13(s3);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$currPos;
				                                    s1 = peg$parsewhiteEloKey();
				                                    if (s1 !== peg$FAILED) {
				                                        s2 = peg$parsews();
				                                        s3 = peg$parseintegerOrDashString();
				                                        if (s3 !== peg$FAILED) {
				                                            peg$savedPos = s0;
				                                            s0 = peg$f14(s3);
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                    if (s0 === peg$FAILED) {
				                                        s0 = peg$currPos;
				                                        s1 = peg$parseblackEloKey();
				                                        if (s1 !== peg$FAILED) {
				                                            s2 = peg$parsews();
				                                            s3 = peg$parseintegerOrDashString();
				                                            if (s3 !== peg$FAILED) {
				                                                peg$savedPos = s0;
				                                                s0 = peg$f15(s3);
				                                            }
				                                            else {
				                                                peg$currPos = s0;
				                                                s0 = peg$FAILED;
				                                            }
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                        if (s0 === peg$FAILED) {
				                                            s0 = peg$currPos;
				                                            s1 = peg$parsewhiteUSCFKey();
				                                            if (s1 !== peg$FAILED) {
				                                                s2 = peg$parsews();
				                                                s3 = peg$parseintegerString();
				                                                if (s3 !== peg$FAILED) {
				                                                    peg$savedPos = s0;
				                                                    s0 = peg$f16(s3);
				                                                }
				                                                else {
				                                                    peg$currPos = s0;
				                                                    s0 = peg$FAILED;
				                                                }
				                                            }
				                                            else {
				                                                peg$currPos = s0;
				                                                s0 = peg$FAILED;
				                                            }
				                                            if (s0 === peg$FAILED) {
				                                                s0 = peg$currPos;
				                                                s1 = peg$parseblackUSCFKey();
				                                                if (s1 !== peg$FAILED) {
				                                                    s2 = peg$parsews();
				                                                    s3 = peg$parseintegerString();
				                                                    if (s3 !== peg$FAILED) {
				                                                        peg$savedPos = s0;
				                                                        s0 = peg$f17(s3);
				                                                    }
				                                                    else {
				                                                        peg$currPos = s0;
				                                                        s0 = peg$FAILED;
				                                                    }
				                                                }
				                                                else {
				                                                    peg$currPos = s0;
				                                                    s0 = peg$FAILED;
				                                                }
				                                                if (s0 === peg$FAILED) {
				                                                    s0 = peg$currPos;
				                                                    s1 = peg$parsewhiteNAKey();
				                                                    if (s1 !== peg$FAILED) {
				                                                        s2 = peg$parsews();
				                                                        s3 = peg$parsestring();
				                                                        if (s3 !== peg$FAILED) {
				                                                            peg$savedPos = s0;
				                                                            s0 = peg$f18(s3);
				                                                        }
				                                                        else {
				                                                            peg$currPos = s0;
				                                                            s0 = peg$FAILED;
				                                                        }
				                                                    }
				                                                    else {
				                                                        peg$currPos = s0;
				                                                        s0 = peg$FAILED;
				                                                    }
				                                                    if (s0 === peg$FAILED) {
				                                                        s0 = peg$currPos;
				                                                        s1 = peg$parseblackNAKey();
				                                                        if (s1 !== peg$FAILED) {
				                                                            s2 = peg$parsews();
				                                                            s3 = peg$parsestring();
				                                                            if (s3 !== peg$FAILED) {
				                                                                peg$savedPos = s0;
				                                                                s0 = peg$f19(s3);
				                                                            }
				                                                            else {
				                                                                peg$currPos = s0;
				                                                                s0 = peg$FAILED;
				                                                            }
				                                                        }
				                                                        else {
				                                                            peg$currPos = s0;
				                                                            s0 = peg$FAILED;
				                                                        }
				                                                        if (s0 === peg$FAILED) {
				                                                            s0 = peg$currPos;
				                                                            s1 = peg$parsewhiteTypeKey();
				                                                            if (s1 !== peg$FAILED) {
				                                                                s2 = peg$parsews();
				                                                                s3 = peg$parsestring();
				                                                                if (s3 !== peg$FAILED) {
				                                                                    peg$savedPos = s0;
				                                                                    s0 = peg$f20(s3);
				                                                                }
				                                                                else {
				                                                                    peg$currPos = s0;
				                                                                    s0 = peg$FAILED;
				                                                                }
				                                                            }
				                                                            else {
				                                                                peg$currPos = s0;
				                                                                s0 = peg$FAILED;
				                                                            }
				                                                            if (s0 === peg$FAILED) {
				                                                                s0 = peg$currPos;
				                                                                s1 = peg$parseblackTypeKey();
				                                                                if (s1 !== peg$FAILED) {
				                                                                    s2 = peg$parsews();
				                                                                    s3 = peg$parsestring();
				                                                                    if (s3 !== peg$FAILED) {
				                                                                        peg$savedPos = s0;
				                                                                        s0 = peg$f21(s3);
				                                                                    }
				                                                                    else {
				                                                                        peg$currPos = s0;
				                                                                        s0 = peg$FAILED;
				                                                                    }
				                                                                }
				                                                                else {
				                                                                    peg$currPos = s0;
				                                                                    s0 = peg$FAILED;
				                                                                }
				                                                                if (s0 === peg$FAILED) {
				                                                                    s0 = peg$currPos;
				                                                                    s1 = peg$parsewhiteKey();
				                                                                    if (s1 !== peg$FAILED) {
				                                                                        s2 = peg$parsews();
				                                                                        s3 = peg$parsestring();
				                                                                        if (s3 !== peg$FAILED) {
				                                                                            peg$savedPos = s0;
				                                                                            s0 = peg$f22(s3);
				                                                                        }
				                                                                        else {
				                                                                            peg$currPos = s0;
				                                                                            s0 = peg$FAILED;
				                                                                        }
				                                                                    }
				                                                                    else {
				                                                                        peg$currPos = s0;
				                                                                        s0 = peg$FAILED;
				                                                                    }
				                                                                    if (s0 === peg$FAILED) {
				                                                                        s0 = peg$currPos;
				                                                                        s1 = peg$parseblackKey();
				                                                                        if (s1 !== peg$FAILED) {
				                                                                            s2 = peg$parsews();
				                                                                            s3 = peg$parsestring();
				                                                                            if (s3 !== peg$FAILED) {
				                                                                                peg$savedPos = s0;
				                                                                                s0 = peg$f23(s3);
				                                                                            }
				                                                                            else {
				                                                                                peg$currPos = s0;
				                                                                                s0 = peg$FAILED;
				                                                                            }
				                                                                        }
				                                                                        else {
				                                                                            peg$currPos = s0;
				                                                                            s0 = peg$FAILED;
				                                                                        }
				                                                                        if (s0 === peg$FAILED) {
				                                                                            s0 = peg$currPos;
				                                                                            s1 = peg$parseresultKey();
				                                                                            if (s1 !== peg$FAILED) {
				                                                                                s2 = peg$parsews();
				                                                                                s3 = peg$parseresult();
				                                                                                if (s3 !== peg$FAILED) {
				                                                                                    peg$savedPos = s0;
				                                                                                    s0 = peg$f24(s3);
				                                                                                }
				                                                                                else {
				                                                                                    peg$currPos = s0;
				                                                                                    s0 = peg$FAILED;
				                                                                                }
				                                                                            }
				                                                                            else {
				                                                                                peg$currPos = s0;
				                                                                                s0 = peg$FAILED;
				                                                                            }
				                                                                            if (s0 === peg$FAILED) {
				                                                                                s0 = peg$currPos;
				                                                                                s1 = peg$parseeventDateKey();
				                                                                                if (s1 !== peg$FAILED) {
				                                                                                    s2 = peg$parsews();
				                                                                                    s3 = peg$parsedateString();
				                                                                                    if (s3 !== peg$FAILED) {
				                                                                                        peg$savedPos = s0;
				                                                                                        s0 = peg$f25(s3);
				                                                                                    }
				                                                                                    else {
				                                                                                        peg$currPos = s0;
				                                                                                        s0 = peg$FAILED;
				                                                                                    }
				                                                                                }
				                                                                                else {
				                                                                                    peg$currPos = s0;
				                                                                                    s0 = peg$FAILED;
				                                                                                }
				                                                                                if (s0 === peg$FAILED) {
				                                                                                    s0 = peg$currPos;
				                                                                                    s1 = peg$parseeventSponsorKey();
				                                                                                    if (s1 !== peg$FAILED) {
				                                                                                        s2 = peg$parsews();
				                                                                                        s3 = peg$parsestring();
				                                                                                        if (s3 !== peg$FAILED) {
				                                                                                            peg$savedPos = s0;
				                                                                                            s0 = peg$f26(s3);
				                                                                                        }
				                                                                                        else {
				                                                                                            peg$currPos = s0;
				                                                                                            s0 = peg$FAILED;
				                                                                                        }
				                                                                                    }
				                                                                                    else {
				                                                                                        peg$currPos = s0;
				                                                                                        s0 = peg$FAILED;
				                                                                                    }
				                                                                                    if (s0 === peg$FAILED) {
				                                                                                        s0 = peg$currPos;
				                                                                                        s1 = peg$parsesectionKey();
				                                                                                        if (s1 !== peg$FAILED) {
				                                                                                            s2 = peg$parsews();
				                                                                                            s3 = peg$parsestring();
				                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                peg$savedPos = s0;
				                                                                                                s0 = peg$f27(s3);
				                                                                                            }
				                                                                                            else {
				                                                                                                peg$currPos = s0;
				                                                                                                s0 = peg$FAILED;
				                                                                                            }
				                                                                                        }
				                                                                                        else {
				                                                                                            peg$currPos = s0;
				                                                                                            s0 = peg$FAILED;
				                                                                                        }
				                                                                                        if (s0 === peg$FAILED) {
				                                                                                            s0 = peg$currPos;
				                                                                                            s1 = peg$parsestageKey();
				                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                s2 = peg$parsews();
				                                                                                                s3 = peg$parsestring();
				                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                    peg$savedPos = s0;
				                                                                                                    s0 = peg$f28(s3);
				                                                                                                }
				                                                                                                else {
				                                                                                                    peg$currPos = s0;
				                                                                                                    s0 = peg$FAILED;
				                                                                                                }
				                                                                                            }
				                                                                                            else {
				                                                                                                peg$currPos = s0;
				                                                                                                s0 = peg$FAILED;
				                                                                                            }
				                                                                                            if (s0 === peg$FAILED) {
				                                                                                                s0 = peg$currPos;
				                                                                                                s1 = peg$parseboardKey();
				                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                    s2 = peg$parsews();
				                                                                                                    s3 = peg$parseintegerString();
				                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                        peg$savedPos = s0;
				                                                                                                        s0 = peg$f29(s3);
				                                                                                                    }
				                                                                                                    else {
				                                                                                                        peg$currPos = s0;
				                                                                                                        s0 = peg$FAILED;
				                                                                                                    }
				                                                                                                }
				                                                                                                else {
				                                                                                                    peg$currPos = s0;
				                                                                                                    s0 = peg$FAILED;
				                                                                                                }
				                                                                                                if (s0 === peg$FAILED) {
				                                                                                                    s0 = peg$currPos;
				                                                                                                    s1 = peg$parseopeningKey();
				                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                        s2 = peg$parsews();
				                                                                                                        s3 = peg$parsestring();
				                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                            peg$savedPos = s0;
				                                                                                                            s0 = peg$f30(s3);
				                                                                                                        }
				                                                                                                        else {
				                                                                                                            peg$currPos = s0;
				                                                                                                            s0 = peg$FAILED;
				                                                                                                        }
				                                                                                                    }
				                                                                                                    else {
				                                                                                                        peg$currPos = s0;
				                                                                                                        s0 = peg$FAILED;
				                                                                                                    }
				                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                        s0 = peg$currPos;
				                                                                                                        s1 = peg$parsevariationKey();
				                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                            s2 = peg$parsews();
				                                                                                                            s3 = peg$parsestring();
				                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                peg$savedPos = s0;
				                                                                                                                s0 = peg$f31(s3);
				                                                                                                            }
				                                                                                                            else {
				                                                                                                                peg$currPos = s0;
				                                                                                                                s0 = peg$FAILED;
				                                                                                                            }
				                                                                                                        }
				                                                                                                        else {
				                                                                                                            peg$currPos = s0;
				                                                                                                            s0 = peg$FAILED;
				                                                                                                        }
				                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                            s0 = peg$currPos;
				                                                                                                            s1 = peg$parsesubVariationKey();
				                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                s2 = peg$parsews();
				                                                                                                                s3 = peg$parsestring();
				                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                    peg$savedPos = s0;
				                                                                                                                    s0 = peg$f32(s3);
				                                                                                                                }
				                                                                                                                else {
				                                                                                                                    peg$currPos = s0;
				                                                                                                                    s0 = peg$FAILED;
				                                                                                                                }
				                                                                                                            }
				                                                                                                            else {
				                                                                                                                peg$currPos = s0;
				                                                                                                                s0 = peg$FAILED;
				                                                                                                            }
				                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                s0 = peg$currPos;
				                                                                                                                s1 = peg$parseecoKey();
				                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                    s2 = peg$parsews();
				                                                                                                                    s3 = peg$parsestring();
				                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                        peg$savedPos = s0;
				                                                                                                                        s0 = peg$f33(s3);
				                                                                                                                    }
				                                                                                                                    else {
				                                                                                                                        peg$currPos = s0;
				                                                                                                                        s0 = peg$FAILED;
				                                                                                                                    }
				                                                                                                                }
				                                                                                                                else {
				                                                                                                                    peg$currPos = s0;
				                                                                                                                    s0 = peg$FAILED;
				                                                                                                                }
				                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                    s0 = peg$currPos;
				                                                                                                                    s1 = peg$parsenicKey();
				                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                        s2 = peg$parsews();
				                                                                                                                        s3 = peg$parsestring();
				                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                            peg$savedPos = s0;
				                                                                                                                            s0 = peg$f34(s3);
				                                                                                                                        }
				                                                                                                                        else {
				                                                                                                                            peg$currPos = s0;
				                                                                                                                            s0 = peg$FAILED;
				                                                                                                                        }
				                                                                                                                    }
				                                                                                                                    else {
				                                                                                                                        peg$currPos = s0;
				                                                                                                                        s0 = peg$FAILED;
				                                                                                                                    }
				                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                        s0 = peg$currPos;
				                                                                                                                        s1 = peg$parsetimeKey();
				                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                            s2 = peg$parsews();
				                                                                                                                            s3 = peg$parsetimeString();
				                                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                                peg$savedPos = s0;
				                                                                                                                                s0 = peg$f35(s3);
				                                                                                                                            }
				                                                                                                                            else {
				                                                                                                                                peg$currPos = s0;
				                                                                                                                                s0 = peg$FAILED;
				                                                                                                                            }
				                                                                                                                        }
				                                                                                                                        else {
				                                                                                                                            peg$currPos = s0;
				                                                                                                                            s0 = peg$FAILED;
				                                                                                                                        }
				                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                            s0 = peg$currPos;
				                                                                                                                            s1 = peg$parseutcTimeKey();
				                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                s2 = peg$parsews();
				                                                                                                                                s3 = peg$parsetimeString();
				                                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                    s0 = peg$f36(s3);
				                                                                                                                                }
				                                                                                                                                else {
				                                                                                                                                    peg$currPos = s0;
				                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                }
				                                                                                                                            }
				                                                                                                                            else {
				                                                                                                                                peg$currPos = s0;
				                                                                                                                                s0 = peg$FAILED;
				                                                                                                                            }
				                                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                                s0 = peg$currPos;
				                                                                                                                                s1 = peg$parseutcDateKey();
				                                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                                    s2 = peg$parsews();
				                                                                                                                                    s3 = peg$parsedateString();
				                                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                                        peg$savedPos = s0;
				                                                                                                                                        s0 = peg$f37(s3);
				                                                                                                                                    }
				                                                                                                                                    else {
				                                                                                                                                        peg$currPos = s0;
				                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                    }
				                                                                                                                                }
				                                                                                                                                else {
				                                                                                                                                    peg$currPos = s0;
				                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                }
				                                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                                    s0 = peg$currPos;
				                                                                                                                                    s1 = peg$parsetimeControlKey();
				                                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                                        s2 = peg$parsews();
				                                                                                                                                        s3 = peg$parsetimeControl();
				                                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                                            peg$savedPos = s0;
				                                                                                                                                            s0 = peg$f38(s3);
				                                                                                                                                        }
				                                                                                                                                        else {
				                                                                                                                                            peg$currPos = s0;
				                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                        }
				                                                                                                                                    }
				                                                                                                                                    else {
				                                                                                                                                        peg$currPos = s0;
				                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                    }
				                                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                                        s0 = peg$currPos;
				                                                                                                                                        s1 = peg$parsesetUpKey();
				                                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                                            s2 = peg$parsews();
				                                                                                                                                            s3 = peg$parsestring();
				                                                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                                                peg$savedPos = s0;
				                                                                                                                                                s0 = peg$f39(s3);
				                                                                                                                                            }
				                                                                                                                                            else {
				                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                            }
				                                                                                                                                        }
				                                                                                                                                        else {
				                                                                                                                                            peg$currPos = s0;
				                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                        }
				                                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                                            s0 = peg$currPos;
				                                                                                                                                            s1 = peg$parsefenKey();
				                                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                                s2 = peg$parsews();
				                                                                                                                                                s3 = peg$parsestring();
				                                                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                                    s0 = peg$f40(s3);
				                                                                                                                                                }
				                                                                                                                                                else {
				                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                }
				                                                                                                                                            }
				                                                                                                                                            else {
				                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                            }
				                                                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                                                s0 = peg$currPos;
				                                                                                                                                                s1 = peg$parseterminationKey();
				                                                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                                                    s2 = peg$parsews();
				                                                                                                                                                    s3 = peg$parsestring();
				                                                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                                                        peg$savedPos = s0;
				                                                                                                                                                        s0 = peg$f41(s3);
				                                                                                                                                                    }
				                                                                                                                                                    else {
				                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                    }
				                                                                                                                                                }
				                                                                                                                                                else {
				                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                }
				                                                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                                                    s0 = peg$currPos;
				                                                                                                                                                    s1 = peg$parseannotatorKey();
				                                                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                                                        s2 = peg$parsews();
				                                                                                                                                                        s3 = peg$parsestring();
				                                                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                                                            peg$savedPos = s0;
				                                                                                                                                                            s0 = peg$f42(s3);
				                                                                                                                                                        }
				                                                                                                                                                        else {
				                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                        }
				                                                                                                                                                    }
				                                                                                                                                                    else {
				                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                    }
				                                                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                                                        s0 = peg$currPos;
				                                                                                                                                                        s1 = peg$parsemodeKey();
				                                                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                                                            s2 = peg$parsews();
				                                                                                                                                                            s3 = peg$parsestring();
				                                                                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                                                                peg$savedPos = s0;
				                                                                                                                                                                s0 = peg$f43(s3);
				                                                                                                                                                            }
				                                                                                                                                                            else {
				                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                            }
				                                                                                                                                                        }
				                                                                                                                                                        else {
				                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                        }
				                                                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                                                            s0 = peg$currPos;
				                                                                                                                                                            s1 = peg$parseplyCountKey();
				                                                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                                                s2 = peg$parsews();
				                                                                                                                                                                s3 = peg$parseintegerString();
				                                                                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                                                    s0 = peg$f44(s3);
				                                                                                                                                                                }
				                                                                                                                                                                else {
				                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                }
				                                                                                                                                                            }
				                                                                                                                                                            else {
				                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                            }
				                                                                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                                                                s0 = peg$currPos;
				                                                                                                                                                                s1 = peg$parsevariantKey();
				                                                                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                                                                    s2 = peg$parsews();
				                                                                                                                                                                    s3 = peg$parsestring();
				                                                                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                                                                        peg$savedPos = s0;
				                                                                                                                                                                        s0 = peg$f45(s3);
				                                                                                                                                                                    }
				                                                                                                                                                                    else {
				                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                    }
				                                                                                                                                                                }
				                                                                                                                                                                else {
				                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                }
				                                                                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                                                                    s0 = peg$currPos;
				                                                                                                                                                                    s1 = peg$parsewhiteRatingDiffKey();
				                                                                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                                                                        s2 = peg$parsews();
				                                                                                                                                                                        s3 = peg$parsestring();
				                                                                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                                                                            peg$savedPos = s0;
				                                                                                                                                                                            s0 = peg$f46(s3);
				                                                                                                                                                                        }
				                                                                                                                                                                        else {
				                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                        }
				                                                                                                                                                                    }
				                                                                                                                                                                    else {
				                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                    }
				                                                                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                                                                        s0 = peg$currPos;
				                                                                                                                                                                        s1 = peg$parseblackRatingDiffKey();
				                                                                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                                                                            s2 = peg$parsews();
				                                                                                                                                                                            s3 = peg$parsestring();
				                                                                                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                                                                                peg$savedPos = s0;
				                                                                                                                                                                                s0 = peg$f47(s3);
				                                                                                                                                                                            }
				                                                                                                                                                                            else {
				                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                            }
				                                                                                                                                                                        }
				                                                                                                                                                                        else {
				                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                        }
				                                                                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                                                                            s0 = peg$currPos;
				                                                                                                                                                                            s1 = peg$parsewhiteFideIdKey();
				                                                                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                                                                s2 = peg$parsews();
				                                                                                                                                                                                s3 = peg$parsestring();
				                                                                                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                                                                    s0 = peg$f48(s3);
				                                                                                                                                                                                }
				                                                                                                                                                                                else {
				                                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                                }
				                                                                                                                                                                            }
				                                                                                                                                                                            else {
				                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                            }
				                                                                                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                                                                                s0 = peg$currPos;
				                                                                                                                                                                                s1 = peg$parseblackFideIdKey();
				                                                                                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                                                                                    s2 = peg$parsews();
				                                                                                                                                                                                    s3 = peg$parsestring();
				                                                                                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                                                                                        peg$savedPos = s0;
				                                                                                                                                                                                        s0 = peg$f49(s3);
				                                                                                                                                                                                    }
				                                                                                                                                                                                    else {
				                                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                                    }
				                                                                                                                                                                                }
				                                                                                                                                                                                else {
				                                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                                }
				                                                                                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                                                                                    s0 = peg$currPos;
				                                                                                                                                                                                    s1 = peg$parsewhiteTeamKey();
				                                                                                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                                                                                        s2 = peg$parsews();
				                                                                                                                                                                                        s3 = peg$parsestring();
				                                                                                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                                                                                            peg$savedPos = s0;
				                                                                                                                                                                                            s0 = peg$f50(s3);
				                                                                                                                                                                                        }
				                                                                                                                                                                                        else {
				                                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                                        }
				                                                                                                                                                                                    }
				                                                                                                                                                                                    else {
				                                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                                    }
				                                                                                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                                                                                        s0 = peg$currPos;
				                                                                                                                                                                                        s1 = peg$parseblackTeamKey();
				                                                                                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                                                                                            s2 = peg$parsews();
				                                                                                                                                                                                            s3 = peg$parsestring();
				                                                                                                                                                                                            if (s3 !== peg$FAILED) {
				                                                                                                                                                                                                peg$savedPos = s0;
				                                                                                                                                                                                                s0 = peg$f51(s3);
				                                                                                                                                                                                            }
				                                                                                                                                                                                            else {
				                                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                                            }
				                                                                                                                                                                                        }
				                                                                                                                                                                                        else {
				                                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                                        }
				                                                                                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                                                                                            s0 = peg$currPos;
				                                                                                                                                                                                            s1 = peg$parseclockKey();
				                                                                                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                                                                                s2 = peg$parsews();
				                                                                                                                                                                                                s3 = peg$parsecolorClockTimeQ();
				                                                                                                                                                                                                if (s3 !== peg$FAILED) {
				                                                                                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                                                                                    s0 = peg$f52(s3);
				                                                                                                                                                                                                }
				                                                                                                                                                                                                else {
				                                                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                                                }
				                                                                                                                                                                                            }
				                                                                                                                                                                                            else {
				                                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                                            }
				                                                                                                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                                                                                                s0 = peg$currPos;
				                                                                                                                                                                                                s1 = peg$parsewhiteClockKey();
				                                                                                                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                                                                                                    s2 = peg$parsews();
				                                                                                                                                                                                                    s3 = peg$parseclockTimeQ();
				                                                                                                                                                                                                    if (s3 !== peg$FAILED) {
				                                                                                                                                                                                                        peg$savedPos = s0;
				                                                                                                                                                                                                        s0 = peg$f53(s3);
				                                                                                                                                                                                                    }
				                                                                                                                                                                                                    else {
				                                                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                                                    }
				                                                                                                                                                                                                }
				                                                                                                                                                                                                else {
				                                                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                                                }
				                                                                                                                                                                                                if (s0 === peg$FAILED) {
				                                                                                                                                                                                                    s0 = peg$currPos;
				                                                                                                                                                                                                    s1 = peg$parseblackClockKey();
				                                                                                                                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                                                                                                                        s2 = peg$parsews();
				                                                                                                                                                                                                        s3 = peg$parseclockTimeQ();
				                                                                                                                                                                                                        if (s3 !== peg$FAILED) {
				                                                                                                                                                                                                            peg$savedPos = s0;
				                                                                                                                                                                                                            s0 = peg$f54(s3);
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                        else {
				                                                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                    }
				                                                                                                                                                                                                    else {
				                                                                                                                                                                                                        peg$currPos = s0;
				                                                                                                                                                                                                        s0 = peg$FAILED;
				                                                                                                                                                                                                    }
				                                                                                                                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                                                                                                                        s0 = peg$currPos;
				                                                                                                                                                                                                        s1 = peg$currPos;
				                                                                                                                                                                                                        peg$silentFails++;
				                                                                                                                                                                                                        s2 = peg$parsevalidatedKey();
				                                                                                                                                                                                                        peg$silentFails--;
				                                                                                                                                                                                                        if (s2 !== peg$FAILED) {
				                                                                                                                                                                                                            peg$currPos = s1;
				                                                                                                                                                                                                            s1 = undefined;
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                        else {
				                                                                                                                                                                                                            s1 = peg$FAILED;
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                                                                                                                            s2 = peg$parsestringNoQuot();
				                                                                                                                                                                                                            s3 = peg$parsews();
				                                                                                                                                                                                                            s4 = peg$parsestring();
				                                                                                                                                                                                                            if (s4 !== peg$FAILED) {
				                                                                                                                                                                                                                peg$savedPos = s0;
				                                                                                                                                                                                                                s0 = peg$f55(s2, s4);
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                            else {
				                                                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                        else {
				                                                                                                                                                                                                            peg$currPos = s0;
				                                                                                                                                                                                                            s0 = peg$FAILED;
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                                                                                                                            s0 = peg$currPos;
				                                                                                                                                                                                                            s1 = peg$currPos;
				                                                                                                                                                                                                            peg$silentFails++;
				                                                                                                                                                                                                            s2 = peg$parsevalidatedKey();
				                                                                                                                                                                                                            peg$silentFails--;
				                                                                                                                                                                                                            if (s2 === peg$FAILED) {
				                                                                                                                                                                                                                s1 = undefined;
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                            else {
				                                                                                                                                                                                                                peg$currPos = s1;
				                                                                                                                                                                                                                s1 = peg$FAILED;
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                                                                                                                s2 = peg$parsestringNoQuot();
				                                                                                                                                                                                                                s3 = peg$parsews();
				                                                                                                                                                                                                                s4 = peg$parsestring();
				                                                                                                                                                                                                                if (s4 !== peg$FAILED) {
				                                                                                                                                                                                                                    peg$savedPos = s0;
				                                                                                                                                                                                                                    s0 = peg$f56(s2, s4);
				                                                                                                                                                                                                                }
				                                                                                                                                                                                                                else {
				                                                                                                                                                                                                                    peg$currPos = s0;
				                                                                                                                                                                                                                    s0 = peg$FAILED;
				                                                                                                                                                                                                                }
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                            else {
				                                                                                                                                                                                                                peg$currPos = s0;
				                                                                                                                                                                                                                s0 = peg$FAILED;
				                                                                                                                                                                                                            }
				                                                                                                                                                                                                        }
				                                                                                                                                                                                                    }
				                                                                                                                                                                                                }
				                                                                                                                                                                                            }
				                                                                                                                                                                                        }
				                                                                                                                                                                                    }
				                                                                                                                                                                                }
				                                                                                                                                                                            }
				                                                                                                                                                                        }
				                                                                                                                                                                    }
				                                                                                                                                                                }
				                                                                                                                                                            }
				                                                                                                                                                        }
				                                                                                                                                                    }
				                                                                                                                                                }
				                                                                                                                                            }
				                                                                                                                                        }
				                                                                                                                                    }
				                                                                                                                                }
				                                                                                                                            }
				                                                                                                                        }
				                                                                                                                    }
				                                                                                                                }
				                                                                                                            }
				                                                                                                        }
				                                                                                                    }
				                                                                                                }
				                                                                                            }
				                                                                                        }
				                                                                                    }
				                                                                                }
				                                                                            }
				                                                                        }
				                                                                    }
				                                                                }
				                                                            }
				                                                        }
				                                                    }
				                                                }
				                                            }
				                                        }
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsevalidatedKey() {
				            var s0;
				            s0 = peg$parsedateKey();
				            if (s0 === peg$FAILED) {
				                s0 = peg$parsewhiteEloKey();
				                if (s0 === peg$FAILED) {
				                    s0 = peg$parseblackEloKey();
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$parsewhiteUSCFKey();
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$parseblackUSCFKey();
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$parseresultKey();
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$parseeventDateKey();
				                                    if (s0 === peg$FAILED) {
				                                        s0 = peg$parseboardKey();
				                                        if (s0 === peg$FAILED) {
				                                            s0 = peg$parsetimeKey();
				                                            if (s0 === peg$FAILED) {
				                                                s0 = peg$parseutcTimeKey();
				                                                if (s0 === peg$FAILED) {
				                                                    s0 = peg$parseutcDateKey();
				                                                    if (s0 === peg$FAILED) {
				                                                        s0 = peg$parsetimeControlKey();
				                                                        if (s0 === peg$FAILED) {
				                                                            s0 = peg$parseplyCountKey();
				                                                            if (s0 === peg$FAILED) {
				                                                                s0 = peg$parseclockKey();
				                                                                if (s0 === peg$FAILED) {
				                                                                    s0 = peg$parsewhiteClockKey();
				                                                                    if (s0 === peg$FAILED) {
				                                                                        s0 = peg$parseblackClockKey();
				                                                                    }
				                                                                }
				                                                            }
				                                                        }
				                                                    }
				                                                }
				                                            }
				                                        }
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseeventKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c1) {
				                s0 = peg$c1;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e1);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c2) {
				                    s0 = peg$c2;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e2);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsesiteKey() {
				            var s0;
				            if (input.substr(peg$currPos, 4) === peg$c3) {
				                s0 = peg$c3;
				                peg$currPos += 4;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e3);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 4) === peg$c4) {
				                    s0 = peg$c4;
				                    peg$currPos += 4;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e4);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsedateKey() {
				            var s0;
				            if (input.substr(peg$currPos, 4) === peg$c5) {
				                s0 = peg$c5;
				                peg$currPos += 4;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e5);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 4) === peg$c6) {
				                    s0 = peg$c6;
				                    peg$currPos += 4;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e6);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseroundKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c7) {
				                s0 = peg$c7;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e7);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c8) {
				                    s0 = peg$c8;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e8);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c9) {
				                s0 = peg$c9;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e9);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c10) {
				                    s0 = peg$c10;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e10);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c11) {
				                s0 = peg$c11;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e11);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c12) {
				                    s0 = peg$c12;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e12);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseresultKey() {
				            var s0;
				            if (input.substr(peg$currPos, 6) === peg$c13) {
				                s0 = peg$c13;
				                peg$currPos += 6;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e13);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 6) === peg$c14) {
				                    s0 = peg$c14;
				                    peg$currPos += 6;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e14);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteTitleKey() {
				            var s0;
				            if (input.substr(peg$currPos, 10) === peg$c15) {
				                s0 = peg$c15;
				                peg$currPos += 10;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e15);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 10) === peg$c16) {
				                    s0 = peg$c16;
				                    peg$currPos += 10;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e16);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 10) === peg$c17) {
				                        s0 = peg$c17;
				                        peg$currPos += 10;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e17);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 10) === peg$c18) {
				                            s0 = peg$c18;
				                            peg$currPos += 10;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e18);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackTitleKey() {
				            var s0;
				            if (input.substr(peg$currPos, 10) === peg$c19) {
				                s0 = peg$c19;
				                peg$currPos += 10;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e19);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 10) === peg$c20) {
				                    s0 = peg$c20;
				                    peg$currPos += 10;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e20);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 10) === peg$c21) {
				                        s0 = peg$c21;
				                        peg$currPos += 10;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e21);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 10) === peg$c22) {
				                            s0 = peg$c22;
				                            peg$currPos += 10;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e22);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteEloKey() {
				            var s0;
				            if (input.substr(peg$currPos, 8) === peg$c23) {
				                s0 = peg$c23;
				                peg$currPos += 8;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e23);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 8) === peg$c24) {
				                    s0 = peg$c24;
				                    peg$currPos += 8;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e24);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 8) === peg$c25) {
				                        s0 = peg$c25;
				                        peg$currPos += 8;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e25);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 8) === peg$c26) {
				                            s0 = peg$c26;
				                            peg$currPos += 8;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e26);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 8) === peg$c27) {
				                                s0 = peg$c27;
				                                peg$currPos += 8;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e27);
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackEloKey() {
				            var s0;
				            if (input.substr(peg$currPos, 8) === peg$c28) {
				                s0 = peg$c28;
				                peg$currPos += 8;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e28);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 8) === peg$c29) {
				                    s0 = peg$c29;
				                    peg$currPos += 8;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e29);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 8) === peg$c30) {
				                        s0 = peg$c30;
				                        peg$currPos += 8;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e30);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 8) === peg$c31) {
				                            s0 = peg$c31;
				                            peg$currPos += 8;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e31);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 8) === peg$c32) {
				                                s0 = peg$c32;
				                                peg$currPos += 8;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e32);
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteUSCFKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c33) {
				                s0 = peg$c33;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e33);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c34) {
				                    s0 = peg$c34;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e34);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 9) === peg$c35) {
				                        s0 = peg$c35;
				                        peg$currPos += 9;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e35);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 9) === peg$c36) {
				                            s0 = peg$c36;
				                            peg$currPos += 9;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e36);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 9) === peg$c37) {
				                                s0 = peg$c37;
				                                peg$currPos += 9;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e37);
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackUSCFKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c38) {
				                s0 = peg$c38;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e38);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c39) {
				                    s0 = peg$c39;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e39);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 9) === peg$c40) {
				                        s0 = peg$c40;
				                        peg$currPos += 9;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e40);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 9) === peg$c41) {
				                            s0 = peg$c41;
				                            peg$currPos += 9;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e41);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 9) === peg$c42) {
				                                s0 = peg$c42;
				                                peg$currPos += 9;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e42);
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteNAKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c43) {
				                s0 = peg$c43;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e43);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c44) {
				                    s0 = peg$c44;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e44);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 7) === peg$c45) {
				                        s0 = peg$c45;
				                        peg$currPos += 7;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e45);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 7) === peg$c46) {
				                            s0 = peg$c46;
				                            peg$currPos += 7;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e46);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 7) === peg$c47) {
				                                s0 = peg$c47;
				                                peg$currPos += 7;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e47);
				                                }
				                            }
				                            if (s0 === peg$FAILED) {
				                                if (input.substr(peg$currPos, 7) === peg$c48) {
				                                    s0 = peg$c48;
				                                    peg$currPos += 7;
				                                }
				                                else {
				                                    s0 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e48);
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackNAKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c49) {
				                s0 = peg$c49;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e49);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c50) {
				                    s0 = peg$c50;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e50);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 7) === peg$c51) {
				                        s0 = peg$c51;
				                        peg$currPos += 7;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e51);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 7) === peg$c52) {
				                            s0 = peg$c52;
				                            peg$currPos += 7;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e52);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 7) === peg$c53) {
				                                s0 = peg$c53;
				                                peg$currPos += 7;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e53);
				                                }
				                            }
				                            if (s0 === peg$FAILED) {
				                                if (input.substr(peg$currPos, 7) === peg$c54) {
				                                    s0 = peg$c54;
				                                    peg$currPos += 7;
				                                }
				                                else {
				                                    s0 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e54);
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteTypeKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c55) {
				                s0 = peg$c55;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e55);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c56) {
				                    s0 = peg$c56;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e56);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 9) === peg$c57) {
				                        s0 = peg$c57;
				                        peg$currPos += 9;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e57);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 9) === peg$c58) {
				                            s0 = peg$c58;
				                            peg$currPos += 9;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e58);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackTypeKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c59) {
				                s0 = peg$c59;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e59);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c60) {
				                    s0 = peg$c60;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e60);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 9) === peg$c61) {
				                        s0 = peg$c61;
				                        peg$currPos += 9;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e61);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 9) === peg$c62) {
				                            s0 = peg$c62;
				                            peg$currPos += 9;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e62);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseeventDateKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c63) {
				                s0 = peg$c63;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e63);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c64) {
				                    s0 = peg$c64;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e64);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 9) === peg$c65) {
				                        s0 = peg$c65;
				                        peg$currPos += 9;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e65);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 9) === peg$c66) {
				                            s0 = peg$c66;
				                            peg$currPos += 9;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e66);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseeventSponsorKey() {
				            var s0;
				            if (input.substr(peg$currPos, 12) === peg$c67) {
				                s0 = peg$c67;
				                peg$currPos += 12;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e67);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 12) === peg$c68) {
				                    s0 = peg$c68;
				                    peg$currPos += 12;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e68);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 12) === peg$c69) {
				                        s0 = peg$c69;
				                        peg$currPos += 12;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e69);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 12) === peg$c70) {
				                            s0 = peg$c70;
				                            peg$currPos += 12;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e70);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsesectionKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c71) {
				                s0 = peg$c71;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e71);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c72) {
				                    s0 = peg$c72;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e72);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsestageKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c73) {
				                s0 = peg$c73;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e73);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c74) {
				                    s0 = peg$c74;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e74);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseboardKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c75) {
				                s0 = peg$c75;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e75);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c76) {
				                    s0 = peg$c76;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e76);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseopeningKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c77) {
				                s0 = peg$c77;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e77);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c78) {
				                    s0 = peg$c78;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e78);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsevariationKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c79) {
				                s0 = peg$c79;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e79);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c80) {
				                    s0 = peg$c80;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e80);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsesubVariationKey() {
				            var s0;
				            if (input.substr(peg$currPos, 12) === peg$c81) {
				                s0 = peg$c81;
				                peg$currPos += 12;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e81);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 12) === peg$c82) {
				                    s0 = peg$c82;
				                    peg$currPos += 12;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e82);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 12) === peg$c83) {
				                        s0 = peg$c83;
				                        peg$currPos += 12;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e83);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 12) === peg$c84) {
				                            s0 = peg$c84;
				                            peg$currPos += 12;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e84);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseecoKey() {
				            var s0;
				            if (input.substr(peg$currPos, 3) === peg$c85) {
				                s0 = peg$c85;
				                peg$currPos += 3;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e85);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 3) === peg$c86) {
				                    s0 = peg$c86;
				                    peg$currPos += 3;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e86);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 3) === peg$c87) {
				                        s0 = peg$c87;
				                        peg$currPos += 3;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e87);
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsenicKey() {
				            var s0;
				            if (input.substr(peg$currPos, 3) === peg$c88) {
				                s0 = peg$c88;
				                peg$currPos += 3;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e88);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 3) === peg$c89) {
				                    s0 = peg$c89;
				                    peg$currPos += 3;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e89);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 3) === peg$c90) {
				                        s0 = peg$c90;
				                        peg$currPos += 3;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e90);
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsetimeKey() {
				            var s0;
				            if (input.substr(peg$currPos, 4) === peg$c91) {
				                s0 = peg$c91;
				                peg$currPos += 4;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e91);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 4) === peg$c92) {
				                    s0 = peg$c92;
				                    peg$currPos += 4;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e92);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseutcTimeKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c93) {
				                s0 = peg$c93;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e93);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c94) {
				                    s0 = peg$c94;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e94);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 7) === peg$c95) {
				                        s0 = peg$c95;
				                        peg$currPos += 7;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e95);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 7) === peg$c96) {
				                            s0 = peg$c96;
				                            peg$currPos += 7;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e96);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 7) === peg$c97) {
				                                s0 = peg$c97;
				                                peg$currPos += 7;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e97);
				                                }
				                            }
				                            if (s0 === peg$FAILED) {
				                                if (input.substr(peg$currPos, 7) === peg$c98) {
				                                    s0 = peg$c98;
				                                    peg$currPos += 7;
				                                }
				                                else {
				                                    s0 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e98);
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseutcDateKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c99) {
				                s0 = peg$c99;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e99);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c100) {
				                    s0 = peg$c100;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e100);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 7) === peg$c101) {
				                        s0 = peg$c101;
				                        peg$currPos += 7;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e101);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 7) === peg$c102) {
				                            s0 = peg$c102;
				                            peg$currPos += 7;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e102);
				                            }
				                        }
				                        if (s0 === peg$FAILED) {
				                            if (input.substr(peg$currPos, 7) === peg$c103) {
				                                s0 = peg$c103;
				                                peg$currPos += 7;
				                            }
				                            else {
				                                s0 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e103);
				                                }
				                            }
				                            if (s0 === peg$FAILED) {
				                                if (input.substr(peg$currPos, 7) === peg$c104) {
				                                    s0 = peg$c104;
				                                    peg$currPos += 7;
				                                }
				                                else {
				                                    s0 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e104);
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsetimeControlKey() {
				            var s0;
				            if (input.substr(peg$currPos, 11) === peg$c105) {
				                s0 = peg$c105;
				                peg$currPos += 11;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e105);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 11) === peg$c106) {
				                    s0 = peg$c106;
				                    peg$currPos += 11;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e106);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 11) === peg$c107) {
				                        s0 = peg$c107;
				                        peg$currPos += 11;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e107);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 11) === peg$c108) {
				                            s0 = peg$c108;
				                            peg$currPos += 11;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e108);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsesetUpKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c109) {
				                s0 = peg$c109;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e109);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 5) === peg$c110) {
				                    s0 = peg$c110;
				                    peg$currPos += 5;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e110);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 5) === peg$c111) {
				                        s0 = peg$c111;
				                        peg$currPos += 5;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e111);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 5) === peg$c112) {
				                            s0 = peg$c112;
				                            peg$currPos += 5;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e112);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsefenKey() {
				            var s0;
				            if (input.substr(peg$currPos, 3) === peg$c113) {
				                s0 = peg$c113;
				                peg$currPos += 3;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e113);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 3) === peg$c114) {
				                    s0 = peg$c114;
				                    peg$currPos += 3;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e114);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 3) === peg$c115) {
				                        s0 = peg$c115;
				                        peg$currPos += 3;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e115);
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseterminationKey() {
				            var s0;
				            if (input.substr(peg$currPos, 11) === peg$c116) {
				                s0 = peg$c116;
				                peg$currPos += 11;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e116);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 11) === peg$c117) {
				                    s0 = peg$c117;
				                    peg$currPos += 11;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e117);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseannotatorKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c118) {
				                s0 = peg$c118;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e118);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 9) === peg$c119) {
				                    s0 = peg$c119;
				                    peg$currPos += 9;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e119);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsemodeKey() {
				            var s0;
				            if (input.substr(peg$currPos, 4) === peg$c120) {
				                s0 = peg$c120;
				                peg$currPos += 4;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e120);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 4) === peg$c121) {
				                    s0 = peg$c121;
				                    peg$currPos += 4;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e121);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseplyCountKey() {
				            var s0;
				            if (input.substr(peg$currPos, 8) === peg$c122) {
				                s0 = peg$c122;
				                peg$currPos += 8;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e122);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 8) === peg$c123) {
				                    s0 = peg$c123;
				                    peg$currPos += 8;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e123);
				                    }
				                }
				                if (s0 === peg$FAILED) {
				                    if (input.substr(peg$currPos, 8) === peg$c124) {
				                        s0 = peg$c124;
				                        peg$currPos += 8;
				                    }
				                    else {
				                        s0 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e124);
				                        }
				                    }
				                    if (s0 === peg$FAILED) {
				                        if (input.substr(peg$currPos, 8) === peg$c125) {
				                            s0 = peg$c125;
				                            peg$currPos += 8;
				                        }
				                        else {
				                            s0 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e125);
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsevariantKey() {
				            var s0;
				            if (input.substr(peg$currPos, 7) === peg$c126) {
				                s0 = peg$c126;
				                peg$currPos += 7;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e126);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                if (input.substr(peg$currPos, 7) === peg$c127) {
				                    s0 = peg$c127;
				                    peg$currPos += 7;
				                }
				                else {
				                    s0 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e127);
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteRatingDiffKey() {
				            var s0;
				            if (input.substr(peg$currPos, 15) === peg$c128) {
				                s0 = peg$c128;
				                peg$currPos += 15;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e128);
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackRatingDiffKey() {
				            var s0;
				            if (input.substr(peg$currPos, 15) === peg$c129) {
				                s0 = peg$c129;
				                peg$currPos += 15;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e129);
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteFideIdKey() {
				            var s0;
				            if (input.substr(peg$currPos, 11) === peg$c130) {
				                s0 = peg$c130;
				                peg$currPos += 11;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e130);
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackFideIdKey() {
				            var s0;
				            if (input.substr(peg$currPos, 11) === peg$c131) {
				                s0 = peg$c131;
				                peg$currPos += 11;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e131);
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteTeamKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c132) {
				                s0 = peg$c132;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e132);
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackTeamKey() {
				            var s0;
				            if (input.substr(peg$currPos, 9) === peg$c133) {
				                s0 = peg$c133;
				                peg$currPos += 9;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e133);
				                }
				            }
				            return s0;
				        }
				        function peg$parseclockKey() {
				            var s0;
				            if (input.substr(peg$currPos, 5) === peg$c134) {
				                s0 = peg$c134;
				                peg$currPos += 5;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e134);
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteClockKey() {
				            var s0;
				            if (input.substr(peg$currPos, 10) === peg$c135) {
				                s0 = peg$c135;
				                peg$currPos += 10;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e135);
				                }
				            }
				            return s0;
				        }
				        function peg$parseblackClockKey() {
				            var s0;
				            if (input.substr(peg$currPos, 10) === peg$c136) {
				                s0 = peg$c136;
				                peg$currPos += 10;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e136);
				                }
				            }
				            return s0;
				        }
				        function peg$parsews() {
				            var s0, s1;
				            peg$silentFails++;
				            s0 = [];
				            s1 = input.charAt(peg$currPos);
				            if (peg$r0.test(s1)) {
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e138);
				                }
				            }
				            while (s1 !== peg$FAILED) {
				                s0.push(s1);
				                s1 = input.charAt(peg$currPos);
				                if (peg$r0.test(s1)) {
				                    peg$currPos++;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e138);
				                    }
				                }
				            }
				            peg$silentFails--;
				            s1 = peg$FAILED;
				            if (peg$silentFails === 0) {
				                peg$fail(peg$e137);
				            }
				            return s0;
				        }
				        function peg$parsewsp() {
				            var s0, s1;
				            s0 = [];
				            s1 = input.charAt(peg$currPos);
				            if (peg$r0.test(s1)) {
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e138);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                while (s1 !== peg$FAILED) {
				                    s0.push(s1);
				                    s1 = input.charAt(peg$currPos);
				                    if (peg$r0.test(s1)) {
				                        peg$currPos++;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e138);
				                        }
				                    }
				                }
				            }
				            else {
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseeol() {
				            var s0, s1;
				            s0 = [];
				            s1 = input.charAt(peg$currPos);
				            if (peg$r1.test(s1)) {
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e139);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                while (s1 !== peg$FAILED) {
				                    s0.push(s1);
				                    s1 = input.charAt(peg$currPos);
				                    if (peg$r1.test(s1)) {
				                        peg$currPos++;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e139);
				                        }
				                    }
				                }
				            }
				            else {
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsestringNoQuot() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = [];
				            s2 = input.charAt(peg$currPos);
				            if (peg$r2.test(s2)) {
				                peg$currPos++;
				            }
				            else {
				                s2 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e141);
				                }
				            }
				            while (s2 !== peg$FAILED) {
				                s1.push(s2);
				                s2 = input.charAt(peg$currPos);
				                if (peg$r2.test(s2)) {
				                    peg$currPos++;
				                }
				                else {
				                    s2 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e141);
				                    }
				                }
				            }
				            peg$savedPos = s0;
				            s1 = peg$f58(s1);
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsequotation_mark() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 34) {
				                s0 = peg$c138;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e142);
				                }
				            }
				            return s0;
				        }
				        function peg$parsestring() {
				            var s0, s1, s3, s4, s5;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 34) {
				                s1 = peg$c138;
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e142);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$parse_();
				                s3 = [];
				                s4 = peg$parsestringChar();
				                while (s4 !== peg$FAILED) {
				                    s3.push(s4);
				                    s4 = peg$parsestringChar();
				                }
				                s4 = peg$parse_();
				                if (input.charCodeAt(peg$currPos) === 34) {
				                    s5 = peg$c138;
				                    peg$currPos++;
				                }
				                else {
				                    s5 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e142);
				                    }
				                }
				                if (s5 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f59(s3);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsestringChar() {
				            var s0, s1, s2, s3;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r3.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e143);
				                }
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parseEscape();
				                if (s1 !== peg$FAILED) {
				                    s2 = peg$currPos;
				                    if (input.charCodeAt(peg$currPos) === 92) {
				                        s3 = peg$c139;
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e144);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s2;
				                        s3 = peg$f60();
				                    }
				                    s2 = s3;
				                    if (s2 === peg$FAILED) {
				                        s2 = peg$currPos;
				                        if (input.charCodeAt(peg$currPos) === 34) {
				                            s3 = peg$c138;
				                            peg$currPos++;
				                        }
				                        else {
				                            s3 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e142);
				                            }
				                        }
				                        if (s3 !== peg$FAILED) {
				                            peg$savedPos = s2;
				                            s3 = peg$f61();
				                        }
				                        s2 = s3;
				                    }
				                    if (s2 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f62(s2);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            return s0;
				        }
				        function peg$parse_() {
				            var s0, s1;
				            peg$silentFails++;
				            s0 = [];
				            s1 = input.charAt(peg$currPos);
				            if (peg$r0.test(s1)) {
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e138);
				                }
				            }
				            while (s1 !== peg$FAILED) {
				                s0.push(s1);
				                s1 = input.charAt(peg$currPos);
				                if (peg$r0.test(s1)) {
				                    peg$currPos++;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e138);
				                    }
				                }
				            }
				            peg$silentFails--;
				            s1 = peg$FAILED;
				            if (peg$silentFails === 0) {
				                peg$fail(peg$e137);
				            }
				            return s0;
				        }
				        function peg$parseEscape() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 92) {
				                s0 = peg$c139;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e144);
				                }
				            }
				            return s0;
				        }
				        function peg$parsedateString() {
				            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$currPos;
				                s3 = input.charAt(peg$currPos);
				                if (peg$r4.test(s3)) {
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e145);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    s4 = input.charAt(peg$currPos);
				                    if (peg$r4.test(s4)) {
				                        peg$currPos++;
				                    }
				                    else {
				                        s4 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e145);
				                        }
				                    }
				                    if (s4 !== peg$FAILED) {
				                        s5 = input.charAt(peg$currPos);
				                        if (peg$r4.test(s5)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s5 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e145);
				                            }
				                        }
				                        if (s5 !== peg$FAILED) {
				                            s6 = input.charAt(peg$currPos);
				                            if (peg$r4.test(s6)) {
				                                peg$currPos++;
				                            }
				                            else {
				                                s6 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e145);
				                                }
				                            }
				                            if (s6 !== peg$FAILED) {
				                                s3 = [s3, s4, s5, s6];
				                                s2 = s3;
				                            }
				                            else {
				                                peg$currPos = s2;
				                                s2 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s2;
				                            s2 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s2;
				                        s2 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s2;
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    if (input.charCodeAt(peg$currPos) === 46) {
				                        s3 = peg$c140;
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e146);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        s4 = peg$currPos;
				                        s5 = input.charAt(peg$currPos);
				                        if (peg$r4.test(s5)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s5 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e145);
				                            }
				                        }
				                        if (s5 !== peg$FAILED) {
				                            s6 = input.charAt(peg$currPos);
				                            if (peg$r4.test(s6)) {
				                                peg$currPos++;
				                            }
				                            else {
				                                s6 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e145);
				                                }
				                            }
				                            if (s6 !== peg$FAILED) {
				                                s5 = [s5, s6];
				                                s4 = s5;
				                            }
				                            else {
				                                peg$currPos = s4;
				                                s4 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s4;
				                            s4 = peg$FAILED;
				                        }
				                        if (s4 !== peg$FAILED) {
				                            if (input.charCodeAt(peg$currPos) === 46) {
				                                s5 = peg$c140;
				                                peg$currPos++;
				                            }
				                            else {
				                                s5 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e146);
				                                }
				                            }
				                            if (s5 !== peg$FAILED) {
				                                s6 = peg$currPos;
				                                s7 = input.charAt(peg$currPos);
				                                if (peg$r4.test(s7)) {
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s7 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e145);
				                                    }
				                                }
				                                if (s7 !== peg$FAILED) {
				                                    s8 = input.charAt(peg$currPos);
				                                    if (peg$r4.test(s8)) {
				                                        peg$currPos++;
				                                    }
				                                    else {
				                                        s8 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e145);
				                                        }
				                                    }
				                                    if (s8 !== peg$FAILED) {
				                                        s7 = [s7, s8];
				                                        s6 = s7;
				                                    }
				                                    else {
				                                        peg$currPos = s6;
				                                        s6 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s6;
				                                    s6 = peg$FAILED;
				                                }
				                                if (s6 !== peg$FAILED) {
				                                    s7 = peg$parsequotation_mark();
				                                    if (s7 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s0 = peg$f63(s2, s4, s6);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsetimeString() {
				            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = input.charAt(peg$currPos);
				                if (peg$r5.test(s3)) {
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e147);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    while (s3 !== peg$FAILED) {
				                        s2.push(s3);
				                        s3 = input.charAt(peg$currPos);
				                        if (peg$r5.test(s3)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s3 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e147);
				                            }
				                        }
				                    }
				                }
				                else {
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    if (input.charCodeAt(peg$currPos) === 58) {
				                        s3 = peg$c141;
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e148);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        s4 = [];
				                        s5 = input.charAt(peg$currPos);
				                        if (peg$r5.test(s5)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s5 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e147);
				                            }
				                        }
				                        if (s5 !== peg$FAILED) {
				                            while (s5 !== peg$FAILED) {
				                                s4.push(s5);
				                                s5 = input.charAt(peg$currPos);
				                                if (peg$r5.test(s5)) {
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s5 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e147);
				                                    }
				                                }
				                            }
				                        }
				                        else {
				                            s4 = peg$FAILED;
				                        }
				                        if (s4 !== peg$FAILED) {
				                            if (input.charCodeAt(peg$currPos) === 58) {
				                                s5 = peg$c141;
				                                peg$currPos++;
				                            }
				                            else {
				                                s5 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e148);
				                                }
				                            }
				                            if (s5 !== peg$FAILED) {
				                                s6 = [];
				                                s7 = input.charAt(peg$currPos);
				                                if (peg$r5.test(s7)) {
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s7 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e147);
				                                    }
				                                }
				                                if (s7 !== peg$FAILED) {
				                                    while (s7 !== peg$FAILED) {
				                                        s6.push(s7);
				                                        s7 = input.charAt(peg$currPos);
				                                        if (peg$r5.test(s7)) {
				                                            peg$currPos++;
				                                        }
				                                        else {
				                                            s7 = peg$FAILED;
				                                            if (peg$silentFails === 0) {
				                                                peg$fail(peg$e147);
				                                            }
				                                        }
				                                    }
				                                }
				                                else {
				                                    s6 = peg$FAILED;
				                                }
				                                if (s6 !== peg$FAILED) {
				                                    s7 = peg$parsemillis();
				                                    if (s7 === peg$FAILED) {
				                                        s7 = null;
				                                    }
				                                    s8 = peg$parsequotation_mark();
				                                    if (s8 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s0 = peg$f64(s2, s4, s6, s7);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsemillis() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 46) {
				                s1 = peg$c140;
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e146);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = input.charAt(peg$currPos);
				                if (peg$r5.test(s3)) {
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e147);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    while (s3 !== peg$FAILED) {
				                        s2.push(s3);
				                        s3 = input.charAt(peg$currPos);
				                        if (peg$r5.test(s3)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s3 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e147);
				                            }
				                        }
				                    }
				                }
				                else {
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f65(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorClockTimeQ() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsecolorClockTime();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsequotation_mark();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f66(s2);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorClockTime() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parseclockColor();
				            if (s1 !== peg$FAILED) {
				                if (input.charCodeAt(peg$currPos) === 47) {
				                    s2 = peg$c142;
				                    peg$currPos++;
				                }
				                else {
				                    s2 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e149);
				                    }
				                }
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parseclockTime();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f67(s1, s3);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseclockColor() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r6.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e150);
				                }
				            }
				            return s0;
				        }
				        function peg$parseclockTimeQ() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parseclockTime();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsequotation_mark();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f68(s2);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseclockTime() {
				            var s0, s1;
				            s0 = peg$currPos;
				            s1 = peg$parseclockValue1D();
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f69(s1);
				            }
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsetimeControl() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsetcnqs();
				                s3 = peg$parsequotation_mark();
				                if (s3 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f70(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsetcnqs() {
				            var s0, s1, s2, s3, s4, s5, s6;
				            s0 = peg$currPos;
				            s1 = peg$currPos;
				            s2 = peg$parsetcnq();
				            if (s2 !== peg$FAILED) {
				                s3 = [];
				                s4 = peg$currPos;
				                if (input.charCodeAt(peg$currPos) === 58) {
				                    s5 = peg$c141;
				                    peg$currPos++;
				                }
				                else {
				                    s5 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e148);
				                    }
				                }
				                if (s5 !== peg$FAILED) {
				                    s6 = peg$parsetcnq();
				                    if (s6 !== peg$FAILED) {
				                        peg$savedPos = s4;
				                        s4 = peg$f71(s2, s6);
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s4;
				                    s4 = peg$FAILED;
				                }
				                while (s4 !== peg$FAILED) {
				                    s3.push(s4);
				                    s4 = peg$currPos;
				                    if (input.charCodeAt(peg$currPos) === 58) {
				                        s5 = peg$c141;
				                        peg$currPos++;
				                    }
				                    else {
				                        s5 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e148);
				                        }
				                    }
				                    if (s5 !== peg$FAILED) {
				                        s6 = peg$parsetcnq();
				                        if (s6 !== peg$FAILED) {
				                            peg$savedPos = s4;
				                            s4 = peg$f71(s2, s6);
				                        }
				                        else {
				                            peg$currPos = s4;
				                            s4 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s1;
				                s1 = peg$f72(s2, s3);
				            }
				            else {
				                peg$currPos = s1;
				                s1 = peg$FAILED;
				            }
				            if (s1 === peg$FAILED) {
				                s1 = null;
				            }
				            peg$savedPos = s0;
				            s1 = peg$f73(s1);
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsetcnq() {
				            var s0, s1, s2, s3, s4, s5;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 63) {
				                s1 = peg$c143;
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e151);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f74();
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                if (input.charCodeAt(peg$currPos) === 45) {
				                    s1 = peg$c144;
				                    peg$currPos++;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e152);
				                    }
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f75();
				                }
				                s0 = s1;
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parseinteger();
				                    if (s1 !== peg$FAILED) {
				                        if (input.charCodeAt(peg$currPos) === 47) {
				                            s2 = peg$c142;
				                            peg$currPos++;
				                        }
				                        else {
				                            s2 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e149);
				                            }
				                        }
				                        if (s2 !== peg$FAILED) {
				                            s3 = peg$parseinteger();
				                            if (s3 !== peg$FAILED) {
				                                if (input.charCodeAt(peg$currPos) === 43) {
				                                    s4 = peg$c145;
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s4 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e153);
				                                    }
				                                }
				                                if (s4 !== peg$FAILED) {
				                                    s5 = peg$parseinteger();
				                                    if (s5 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s0 = peg$f76(s1, s3, s5);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        s1 = peg$parseinteger();
				                        if (s1 !== peg$FAILED) {
				                            if (input.charCodeAt(peg$currPos) === 47) {
				                                s2 = peg$c142;
				                                peg$currPos++;
				                            }
				                            else {
				                                s2 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e149);
				                                }
				                            }
				                            if (s2 !== peg$FAILED) {
				                                s3 = peg$parseinteger();
				                                if (s3 !== peg$FAILED) {
				                                    peg$savedPos = s0;
				                                    s0 = peg$f77(s1, s3);
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            s1 = peg$parseinteger();
				                            if (s1 !== peg$FAILED) {
				                                if (input.charCodeAt(peg$currPos) === 43) {
				                                    s2 = peg$c145;
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s2 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e153);
				                                    }
				                                }
				                                if (s2 !== peg$FAILED) {
				                                    s3 = peg$parseinteger();
				                                    if (s3 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s0 = peg$f78(s1, s3);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                s1 = peg$parseinteger();
				                                if (s1 !== peg$FAILED) {
				                                    peg$savedPos = s0;
				                                    s1 = peg$f79(s1);
				                                }
				                                s0 = s1;
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$currPos;
				                                    if (input.charCodeAt(peg$currPos) === 42) {
				                                        s1 = peg$c146;
				                                        peg$currPos++;
				                                    }
				                                    else {
				                                        s1 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e154);
				                                        }
				                                    }
				                                    if (s1 !== peg$FAILED) {
				                                        s2 = peg$parseinteger();
				                                        if (s2 !== peg$FAILED) {
				                                            peg$savedPos = s0;
				                                            s0 = peg$f80(s2);
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseresult() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parseinnerResult();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsequotation_mark();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f81(s2);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseinnerResult() {
				            var s0, s1;
				            s0 = peg$currPos;
				            if (input.substr(peg$currPos, 3) === peg$c147) {
				                s1 = peg$c147;
				                peg$currPos += 3;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e155);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f82(s1);
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                if (input.substr(peg$currPos, 3) === peg$c148) {
				                    s1 = peg$c148;
				                    peg$currPos += 3;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e156);
				                    }
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f83(s1);
				                }
				                s0 = s1;
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    if (input.substr(peg$currPos, 7) === peg$c149) {
				                        s1 = peg$c149;
				                        peg$currPos += 7;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e157);
				                        }
				                    }
				                    if (s1 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s1 = peg$f84(s1);
				                    }
				                    s0 = s1;
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        if (input.substr(peg$currPos, 3) === peg$c150) {
				                            s1 = peg$c150;
				                            peg$currPos += 3;
				                        }
				                        else {
				                            s1 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e158);
				                            }
				                        }
				                        if (s1 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s1 = peg$f85();
				                        }
				                        s0 = s1;
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            if (input.charCodeAt(peg$currPos) === 42) {
				                                s1 = peg$c146;
				                                peg$currPos++;
				                            }
				                            else {
				                                s1 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e154);
				                                }
				                            }
				                            if (s1 !== peg$FAILED) {
				                                peg$savedPos = s0;
				                                s1 = peg$f86(s1);
				                            }
				                            s0 = s1;
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseintegerOrDashString() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parseintegerString();
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f87(s1);
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parsequotation_mark();
				                if (s1 !== peg$FAILED) {
				                    if (input.charCodeAt(peg$currPos) === 45) {
				                        s2 = peg$c144;
				                        peg$currPos++;
				                    }
				                    else {
				                        s2 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e152);
				                        }
				                    }
				                    if (s2 !== peg$FAILED) {
				                        s3 = peg$parsequotation_mark();
				                        if (s3 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s0 = peg$f88();
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parsequotation_mark();
				                    if (s1 !== peg$FAILED) {
				                        s2 = peg$parsequotation_mark();
				                        if (s2 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s0 = peg$f89();
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parseintegerString() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsequotation_mark();
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = input.charAt(peg$currPos);
				                if (peg$r5.test(s3)) {
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e147);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    while (s3 !== peg$FAILED) {
				                        s2.push(s3);
				                        s3 = input.charAt(peg$currPos);
				                        if (peg$r5.test(s3)) {
				                            peg$currPos++;
				                        }
				                        else {
				                            s3 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e147);
				                            }
				                        }
				                    }
				                }
				                else {
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsequotation_mark();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f90(s2);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsepgn() {
				            var s0, s2, s3, s5, s7, s9, s10, s12, s14, s15;
				            s0 = peg$currPos;
				            peg$parseBOM();
				            s2 = peg$parsews();
				            s3 = peg$parsecomments();
				            if (s3 === peg$FAILED) {
				                s3 = null;
				            }
				            peg$parsews();
				            s5 = peg$parsemoveNumber();
				            if (s5 === peg$FAILED) {
				                s5 = null;
				            }
				            peg$parsews();
				            s7 = peg$parsehalfMove();
				            if (s7 !== peg$FAILED) {
				                peg$parsews();
				                s9 = peg$parsenags();
				                if (s9 === peg$FAILED) {
				                    s9 = null;
				                }
				                s10 = peg$parsedrawOffer();
				                if (s10 === peg$FAILED) {
				                    s10 = null;
				                }
				                peg$parsews();
				                s12 = peg$parsecomments();
				                if (s12 === peg$FAILED) {
				                    s12 = null;
				                }
				                peg$parsews();
				                s14 = peg$parsevariation();
				                if (s14 === peg$FAILED) {
				                    s14 = null;
				                }
				                s15 = peg$parsepgn();
				                if (s15 === peg$FAILED) {
				                    s15 = null;
				                }
				                peg$savedPos = s0;
				                s0 = peg$f91(s3, s5, s7, s9, s10, s12, s14, s15);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                peg$parsews();
				                s2 = peg$parseendGame();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsews();
				                    peg$savedPos = s0;
				                    s0 = peg$f92(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            return s0;
				        }
				        function peg$parsedrawOffer() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsepl();
				            if (s1 !== peg$FAILED) {
				                if (input.charCodeAt(peg$currPos) === 61) {
				                    s2 = peg$c151;
				                    peg$currPos++;
				                }
				                else {
				                    s2 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e159);
				                    }
				                }
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsepr();
				                    if (s3 !== peg$FAILED) {
				                        s1 = [s1, s2, s3];
				                        s0 = s1;
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseendGame() {
				            var s0, s1;
				            s0 = peg$currPos;
				            s1 = peg$parseinnerResult();
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f93(s1);
				            }
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsecomments() {
				            var s0, s1, s2, s3, s5;
				            s0 = peg$currPos;
				            s1 = peg$parsecomment();
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = peg$currPos;
				                peg$parsews();
				                s5 = peg$parsecomment();
				                if (s5 !== peg$FAILED) {
				                    peg$savedPos = s3;
				                    s3 = peg$f94(s1, s5);
				                }
				                else {
				                    peg$currPos = s3;
				                    s3 = peg$FAILED;
				                }
				                while (s3 !== peg$FAILED) {
				                    s2.push(s3);
				                    s3 = peg$currPos;
				                    peg$parsews();
				                    s5 = peg$parsecomment();
				                    if (s5 !== peg$FAILED) {
				                        peg$savedPos = s3;
				                        s3 = peg$f94(s1, s5);
				                    }
				                    else {
				                        peg$currPos = s3;
				                        s3 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s0;
				                s0 = peg$f95(s1, s2);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecomment() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsecl();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsecr();
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f96();
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parsecl();
				                if (s1 !== peg$FAILED) {
				                    s2 = peg$parseinnerComment();
				                    if (s2 !== peg$FAILED) {
				                        s3 = peg$parsecr();
				                        if (s3 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s0 = peg$f97(s2);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parsecommentEndOfLine();
				                    if (s1 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s1 = peg$f98(s1);
				                    }
				                    s0 = s1;
				                }
				            }
				            return s0;
				        }
				        function peg$parseinnerComment() {
				            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
				            s0 = peg$currPos;
				            s1 = peg$parsews();
				            s2 = peg$parsebl();
				            if (s2 !== peg$FAILED) {
				                if (input.substr(peg$currPos, 4) === peg$c152) {
				                    s3 = peg$c152;
				                    peg$currPos += 4;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e160);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    s4 = peg$parsewsp();
				                    if (s4 !== peg$FAILED) {
				                        s5 = peg$parsecolorFields();
				                        if (s5 === peg$FAILED) {
				                            s5 = null;
				                        }
				                        s6 = peg$parsews();
				                        s7 = peg$parsebr();
				                        if (s7 !== peg$FAILED) {
				                            s8 = peg$parsews();
				                            s9 = [];
				                            s10 = peg$currPos;
				                            s11 = peg$parseinnerComment();
				                            if (s11 !== peg$FAILED) {
				                                peg$savedPos = s10;
				                                s11 = peg$f99(s5, s11);
				                            }
				                            s10 = s11;
				                            while (s10 !== peg$FAILED) {
				                                s9.push(s10);
				                                s10 = peg$currPos;
				                                s11 = peg$parseinnerComment();
				                                if (s11 !== peg$FAILED) {
				                                    peg$savedPos = s10;
				                                    s11 = peg$f99(s5, s11);
				                                }
				                                s10 = s11;
				                            }
				                            peg$savedPos = s0;
				                            s0 = peg$f100(s5, s9);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parsews();
				                s2 = peg$parsebl();
				                if (s2 !== peg$FAILED) {
				                    if (input.substr(peg$currPos, 4) === peg$c153) {
				                        s3 = peg$c153;
				                        peg$currPos += 4;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e161);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        s4 = peg$parsewsp();
				                        if (s4 !== peg$FAILED) {
				                            s5 = peg$parsecolorArrows();
				                            if (s5 === peg$FAILED) {
				                                s5 = null;
				                            }
				                            s6 = peg$parsews();
				                            s7 = peg$parsebr();
				                            if (s7 !== peg$FAILED) {
				                                s8 = peg$parsews();
				                                s9 = [];
				                                s10 = peg$currPos;
				                                s11 = peg$parseinnerComment();
				                                if (s11 !== peg$FAILED) {
				                                    peg$savedPos = s10;
				                                    s11 = peg$f101(s5, s11);
				                                }
				                                s10 = s11;
				                                while (s10 !== peg$FAILED) {
				                                    s9.push(s10);
				                                    s10 = peg$currPos;
				                                    s11 = peg$parseinnerComment();
				                                    if (s11 !== peg$FAILED) {
				                                        peg$savedPos = s10;
				                                        s11 = peg$f101(s5, s11);
				                                    }
				                                    s10 = s11;
				                                }
				                                peg$savedPos = s0;
				                                s0 = peg$f102(s5, s9);
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parsews();
				                    s2 = peg$parsebl();
				                    if (s2 !== peg$FAILED) {
				                        if (input.charCodeAt(peg$currPos) === 37) {
				                            s3 = peg$c154;
				                            peg$currPos++;
				                        }
				                        else {
				                            s3 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e162);
				                            }
				                        }
				                        if (s3 !== peg$FAILED) {
				                            s4 = peg$parseclockCommand1D();
				                            if (s4 !== peg$FAILED) {
				                                s5 = peg$parsewsp();
				                                if (s5 !== peg$FAILED) {
				                                    s6 = peg$parseclockValue1D();
				                                    if (s6 !== peg$FAILED) {
				                                        s7 = peg$parsews();
				                                        s8 = peg$parsebr();
				                                        if (s8 !== peg$FAILED) {
				                                            s9 = peg$parsews();
				                                            s10 = [];
				                                            s11 = peg$currPos;
				                                            s12 = peg$parseinnerComment();
				                                            if (s12 !== peg$FAILED) {
				                                                peg$savedPos = s11;
				                                                s12 = peg$f103(s4, s6, s12);
				                                            }
				                                            s11 = s12;
				                                            while (s11 !== peg$FAILED) {
				                                                s10.push(s11);
				                                                s11 = peg$currPos;
				                                                s12 = peg$parseinnerComment();
				                                                if (s12 !== peg$FAILED) {
				                                                    peg$savedPos = s11;
				                                                    s12 = peg$f103(s4, s6, s12);
				                                                }
				                                                s11 = s12;
				                                            }
				                                            peg$savedPos = s0;
				                                            s0 = peg$f104(s4, s6, s10);
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        s1 = peg$parsews();
				                        s2 = peg$parsebl();
				                        if (s2 !== peg$FAILED) {
				                            if (input.charCodeAt(peg$currPos) === 37) {
				                                s3 = peg$c154;
				                                peg$currPos++;
				                            }
				                            else {
				                                s3 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e162);
				                                }
				                            }
				                            if (s3 !== peg$FAILED) {
				                                s4 = peg$parseclockCommand2D();
				                                if (s4 !== peg$FAILED) {
				                                    s5 = peg$parsewsp();
				                                    if (s5 !== peg$FAILED) {
				                                        s6 = peg$parseclockValue2D();
				                                        if (s6 !== peg$FAILED) {
				                                            s7 = peg$parsews();
				                                            s8 = peg$parsebr();
				                                            if (s8 !== peg$FAILED) {
				                                                s9 = peg$parsews();
				                                                s10 = [];
				                                                s11 = peg$currPos;
				                                                s12 = peg$parseinnerComment();
				                                                if (s12 !== peg$FAILED) {
				                                                    peg$savedPos = s11;
				                                                    s12 = peg$f105(s4, s6, s12);
				                                                }
				                                                s11 = s12;
				                                                while (s11 !== peg$FAILED) {
				                                                    s10.push(s11);
				                                                    s11 = peg$currPos;
				                                                    s12 = peg$parseinnerComment();
				                                                    if (s12 !== peg$FAILED) {
				                                                        peg$savedPos = s11;
				                                                        s12 = peg$f105(s4, s6, s12);
				                                                    }
				                                                    s11 = s12;
				                                                }
				                                                peg$savedPos = s0;
				                                                s0 = peg$f106(s4, s6, s10);
				                                            }
				                                            else {
				                                                peg$currPos = s0;
				                                                s0 = peg$FAILED;
				                                            }
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            s1 = peg$parsews();
				                            s2 = peg$parsebl();
				                            if (s2 !== peg$FAILED) {
				                                if (input.substr(peg$currPos, 5) === peg$c155) {
				                                    s3 = peg$c155;
				                                    peg$currPos += 5;
				                                }
				                                else {
				                                    s3 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e163);
				                                    }
				                                }
				                                if (s3 !== peg$FAILED) {
				                                    s4 = peg$parsewsp();
				                                    if (s4 !== peg$FAILED) {
				                                        s5 = peg$parsestringNoQuot();
				                                        s6 = peg$parsews();
				                                        s7 = peg$parsebr();
				                                        if (s7 !== peg$FAILED) {
				                                            s8 = peg$parsews();
				                                            s9 = [];
				                                            s10 = peg$currPos;
				                                            s11 = peg$parseinnerComment();
				                                            if (s11 !== peg$FAILED) {
				                                                peg$savedPos = s10;
				                                                s11 = peg$f107(s5, s11);
				                                            }
				                                            s10 = s11;
				                                            while (s10 !== peg$FAILED) {
				                                                s9.push(s10);
				                                                s10 = peg$currPos;
				                                                s11 = peg$parseinnerComment();
				                                                if (s11 !== peg$FAILED) {
				                                                    peg$savedPos = s10;
				                                                    s11 = peg$f107(s5, s11);
				                                                }
				                                                s10 = s11;
				                                            }
				                                            peg$savedPos = s0;
				                                            s0 = peg$f108(s5, s9);
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                s1 = peg$parsews();
				                                s2 = peg$parsebl();
				                                if (s2 !== peg$FAILED) {
				                                    if (input.charCodeAt(peg$currPos) === 37) {
				                                        s3 = peg$c154;
				                                        peg$currPos++;
				                                    }
				                                    else {
				                                        s3 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e162);
				                                        }
				                                    }
				                                    if (s3 !== peg$FAILED) {
				                                        s4 = peg$parsestringNoQuot();
				                                        s5 = peg$parsewsp();
				                                        if (s5 !== peg$FAILED) {
				                                            s6 = [];
				                                            s7 = peg$parsenbr();
				                                            if (s7 !== peg$FAILED) {
				                                                while (s7 !== peg$FAILED) {
				                                                    s6.push(s7);
				                                                    s7 = peg$parsenbr();
				                                                }
				                                            }
				                                            else {
				                                                s6 = peg$FAILED;
				                                            }
				                                            if (s6 !== peg$FAILED) {
				                                                s7 = peg$parsebr();
				                                                if (s7 !== peg$FAILED) {
				                                                    s8 = peg$parsews();
				                                                    s9 = [];
				                                                    s10 = peg$currPos;
				                                                    s11 = peg$parseinnerComment();
				                                                    if (s11 !== peg$FAILED) {
				                                                        peg$savedPos = s10;
				                                                        s11 = peg$f109(s4, s6, s11);
				                                                    }
				                                                    s10 = s11;
				                                                    while (s10 !== peg$FAILED) {
				                                                        s9.push(s10);
				                                                        s10 = peg$currPos;
				                                                        s11 = peg$parseinnerComment();
				                                                        if (s11 !== peg$FAILED) {
				                                                            peg$savedPos = s10;
				                                                            s11 = peg$f109(s4, s6, s11);
				                                                        }
				                                                        s10 = s11;
				                                                    }
				                                                    peg$savedPos = s0;
				                                                    s0 = peg$f110(s4, s6, s9);
				                                                }
				                                                else {
				                                                    peg$currPos = s0;
				                                                    s0 = peg$FAILED;
				                                                }
				                                            }
				                                            else {
				                                                peg$currPos = s0;
				                                                s0 = peg$FAILED;
				                                            }
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$currPos;
				                                    s1 = [];
				                                    s2 = peg$parsenonCommand();
				                                    if (s2 !== peg$FAILED) {
				                                        while (s2 !== peg$FAILED) {
				                                            s1.push(s2);
				                                            s2 = peg$parsenonCommand();
				                                        }
				                                    }
				                                    else {
				                                        s1 = peg$FAILED;
				                                    }
				                                    if (s1 !== peg$FAILED) {
				                                        s2 = [];
				                                        s3 = peg$currPos;
				                                        s4 = peg$parsews();
				                                        s5 = peg$parseinnerComment();
				                                        if (s5 !== peg$FAILED) {
				                                            peg$savedPos = s3;
				                                            s3 = peg$f111(s1, s5);
				                                        }
				                                        else {
				                                            peg$currPos = s3;
				                                            s3 = peg$FAILED;
				                                        }
				                                        while (s3 !== peg$FAILED) {
				                                            s2.push(s3);
				                                            s3 = peg$currPos;
				                                            s4 = peg$parsews();
				                                            s5 = peg$parseinnerComment();
				                                            if (s5 !== peg$FAILED) {
				                                                peg$savedPos = s3;
				                                                s3 = peg$f111(s1, s5);
				                                            }
				                                            else {
				                                                peg$currPos = s3;
				                                                s3 = peg$FAILED;
				                                            }
				                                        }
				                                        peg$savedPos = s0;
				                                        s0 = peg$f112(s1, s2);
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsenonCommand() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$currPos;
				            peg$silentFails++;
				            if (input.substr(peg$currPos, 2) === peg$c156) {
				                s2 = peg$c156;
				                peg$currPos += 2;
				            }
				            else {
				                s2 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e164);
				                }
				            }
				            peg$silentFails--;
				            if (s2 === peg$FAILED) {
				                s1 = undefined;
				            }
				            else {
				                peg$currPos = s1;
				                s1 = peg$FAILED;
				            }
				            if (s1 !== peg$FAILED) {
				                s2 = peg$currPos;
				                peg$silentFails++;
				                if (input.charCodeAt(peg$currPos) === 125) {
				                    s3 = peg$c157;
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e165);
				                    }
				                }
				                peg$silentFails--;
				                if (s3 === peg$FAILED) {
				                    s2 = undefined;
				                }
				                else {
				                    peg$currPos = s2;
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    if (input.length > peg$currPos) {
				                        s3 = input.charAt(peg$currPos);
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e166);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f113(s3);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsenbr() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = peg$currPos;
				            peg$silentFails++;
				            s2 = peg$parsebr();
				            peg$silentFails--;
				            if (s2 === peg$FAILED) {
				                s1 = undefined;
				            }
				            else {
				                peg$currPos = s1;
				                s1 = peg$FAILED;
				            }
				            if (s1 !== peg$FAILED) {
				                if (input.length > peg$currPos) {
				                    s2 = input.charAt(peg$currPos);
				                    peg$currPos++;
				                }
				                else {
				                    s2 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e166);
				                    }
				                }
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f114(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecommentEndOfLine() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsesemicolon();
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = input.charAt(peg$currPos);
				                if (peg$r7.test(s3)) {
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e167);
				                    }
				                }
				                while (s3 !== peg$FAILED) {
				                    s2.push(s3);
				                    s3 = input.charAt(peg$currPos);
				                    if (peg$r7.test(s3)) {
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e167);
				                        }
				                    }
				                }
				                s3 = peg$parseeol();
				                if (s3 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f115(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorFields() {
				            var s0, s1, s3, s4, s5, s6, s7;
				            s0 = peg$currPos;
				            s1 = peg$parsecolorField();
				            if (s1 !== peg$FAILED) {
				                peg$parsews();
				                s3 = [];
				                s4 = peg$currPos;
				                if (input.charCodeAt(peg$currPos) === 44) {
				                    s5 = peg$c158;
				                    peg$currPos++;
				                }
				                else {
				                    s5 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e168);
				                    }
				                }
				                if (s5 !== peg$FAILED) {
				                    s6 = peg$parsews();
				                    s7 = peg$parsecolorField();
				                    if (s7 !== peg$FAILED) {
				                        s5 = [s5, s6, s7];
				                        s4 = s5;
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s4;
				                    s4 = peg$FAILED;
				                }
				                while (s4 !== peg$FAILED) {
				                    s3.push(s4);
				                    s4 = peg$currPos;
				                    if (input.charCodeAt(peg$currPos) === 44) {
				                        s5 = peg$c158;
				                        peg$currPos++;
				                    }
				                    else {
				                        s5 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e168);
				                        }
				                    }
				                    if (s5 !== peg$FAILED) {
				                        s6 = peg$parsews();
				                        s7 = peg$parsecolorField();
				                        if (s7 !== peg$FAILED) {
				                            s5 = [s5, s6, s7];
				                            s4 = s5;
				                        }
				                        else {
				                            peg$currPos = s4;
				                            s4 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s0;
				                s0 = peg$f116(s1, s3);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorField() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = peg$parsecolor();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsefield();
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f117(s1, s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorArrows() {
				            var s0, s1, s3, s4, s5, s6, s7;
				            s0 = peg$currPos;
				            s1 = peg$parsecolorArrow();
				            if (s1 !== peg$FAILED) {
				                peg$parsews();
				                s3 = [];
				                s4 = peg$currPos;
				                if (input.charCodeAt(peg$currPos) === 44) {
				                    s5 = peg$c158;
				                    peg$currPos++;
				                }
				                else {
				                    s5 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e168);
				                    }
				                }
				                if (s5 !== peg$FAILED) {
				                    s6 = peg$parsews();
				                    s7 = peg$parsecolorArrow();
				                    if (s7 !== peg$FAILED) {
				                        s5 = [s5, s6, s7];
				                        s4 = s5;
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s4;
				                    s4 = peg$FAILED;
				                }
				                while (s4 !== peg$FAILED) {
				                    s3.push(s4);
				                    s4 = peg$currPos;
				                    if (input.charCodeAt(peg$currPos) === 44) {
				                        s5 = peg$c158;
				                        peg$currPos++;
				                    }
				                    else {
				                        s5 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e168);
				                        }
				                    }
				                    if (s5 !== peg$FAILED) {
				                        s6 = peg$parsews();
				                        s7 = peg$parsecolorArrow();
				                        if (s7 !== peg$FAILED) {
				                            s5 = [s5, s6, s7];
				                            s4 = s5;
				                        }
				                        else {
				                            peg$currPos = s4;
				                            s4 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s4;
				                        s4 = peg$FAILED;
				                    }
				                }
				                peg$savedPos = s0;
				                s0 = peg$f118(s1, s3);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolorArrow() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsecolor();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsefield();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsefield();
				                    if (s3 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s0 = peg$f119(s1, s2, s3);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecolor() {
				            var s0, s1;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 89) {
				                s1 = peg$c159;
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e169);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f120();
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                if (input.charCodeAt(peg$currPos) === 71) {
				                    s1 = peg$c160;
				                    peg$currPos++;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e170);
				                    }
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f121();
				                }
				                s0 = s1;
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    if (input.charCodeAt(peg$currPos) === 82) {
				                        s1 = peg$c161;
				                        peg$currPos++;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e171);
				                        }
				                    }
				                    if (s1 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s1 = peg$f122();
				                    }
				                    s0 = s1;
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        if (input.charCodeAt(peg$currPos) === 66) {
				                            s1 = peg$c162;
				                            peg$currPos++;
				                        }
				                        else {
				                            s1 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e172);
				                            }
				                        }
				                        if (s1 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s1 = peg$f123();
				                        }
				                        s0 = s1;
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            if (input.charCodeAt(peg$currPos) === 79) {
				                                s1 = peg$c163;
				                                peg$currPos++;
				                            }
				                            else {
				                                s1 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e173);
				                                }
				                            }
				                            if (s1 !== peg$FAILED) {
				                                peg$savedPos = s0;
				                                s1 = peg$f124();
				                            }
				                            s0 = s1;
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                if (input.charCodeAt(peg$currPos) === 67) {
				                                    s1 = peg$c164;
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s1 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e174);
				                                    }
				                                }
				                                if (s1 !== peg$FAILED) {
				                                    peg$savedPos = s0;
				                                    s1 = peg$f125();
				                                }
				                                s0 = s1;
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsefield() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = peg$parsecolumn();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parserow();
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f126(s1, s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsecl() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 123) {
				                s0 = peg$c165;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e175);
				                }
				            }
				            return s0;
				        }
				        function peg$parsecr() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 125) {
				                s0 = peg$c157;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e165);
				                }
				            }
				            return s0;
				        }
				        function peg$parsebl() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 91) {
				                s0 = peg$c166;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e176);
				                }
				            }
				            return s0;
				        }
				        function peg$parsebr() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 93) {
				                s0 = peg$c167;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e177);
				                }
				            }
				            return s0;
				        }
				        function peg$parsesemicolon() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 59) {
				                s0 = peg$c168;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e178);
				                }
				            }
				            return s0;
				        }
				        function peg$parseclockCommand1D() {
				            var s0, s1;
				            s0 = peg$currPos;
				            if (input.substr(peg$currPos, 3) === peg$c169) {
				                s1 = peg$c169;
				                peg$currPos += 3;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e179);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f131();
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                if (input.substr(peg$currPos, 3) === peg$c170) {
				                    s1 = peg$c170;
				                    peg$currPos += 3;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e180);
				                    }
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f132();
				                }
				                s0 = s1;
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    if (input.substr(peg$currPos, 3) === peg$c171) {
				                        s1 = peg$c171;
				                        peg$currPos += 3;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e181);
				                        }
				                    }
				                    if (s1 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s1 = peg$f133();
				                    }
				                    s0 = s1;
				                }
				            }
				            return s0;
				        }
				        function peg$parseclockCommand2D() {
				            var s0, s1;
				            s0 = peg$currPos;
				            if (input.substr(peg$currPos, 3) === peg$c172) {
				                s1 = peg$c172;
				                peg$currPos += 3;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e182);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f134();
				            }
				            s0 = s1;
				            return s0;
				        }
				        function peg$parseclockValue1D() {
				            var s0, s1, s2, s3, s4;
				            s0 = peg$currPos;
				            s1 = peg$parsehoursMinutes();
				            if (s1 === peg$FAILED) {
				                s1 = null;
				            }
				            s2 = peg$parsedigit();
				            if (s2 !== peg$FAILED) {
				                s3 = peg$parsedigit();
				                if (s3 === peg$FAILED) {
				                    s3 = null;
				                }
				                s4 = peg$parsemillis();
				                if (s4 === peg$FAILED) {
				                    s4 = null;
				                }
				                peg$savedPos = s0;
				                s0 = peg$f135(s1, s2, s3, s4);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseclockValue2D() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsehoursMinutes();
				            if (s1 === peg$FAILED) {
				                s1 = null;
				            }
				            s2 = peg$parsedigit();
				            if (s2 !== peg$FAILED) {
				                s3 = peg$parsedigit();
				                if (s3 === peg$FAILED) {
				                    s3 = null;
				                }
				                peg$savedPos = s0;
				                s0 = peg$f136(s1, s2, s3);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsehoursMinutes() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = peg$parsehoursClock();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parseminutesClock();
				                if (s2 === peg$FAILED) {
				                    s2 = null;
				                }
				                peg$savedPos = s0;
				                s0 = peg$f137(s1, s2);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsehoursClock() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsedigit();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsedigit();
				                if (s2 === peg$FAILED) {
				                    s2 = null;
				                }
				                if (input.charCodeAt(peg$currPos) === 58) {
				                    s3 = peg$c141;
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e148);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f138(s1, s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parseminutesClock() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsedigit();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsedigit();
				                if (s2 === peg$FAILED) {
				                    s2 = null;
				                }
				                if (input.charCodeAt(peg$currPos) === 58) {
				                    s3 = peg$c141;
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e148);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f139(s1, s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsedigit() {
				            var s0, s1;
				            s0 = peg$currPos;
				            s1 = input.charAt(peg$currPos);
				            if (peg$r5.test(s1)) {
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e147);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f140(s1);
				            }
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsevariation() {
				            var s0, s1, s2, s3, s5;
				            s0 = peg$currPos;
				            s1 = peg$parsepl();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsepgn();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parsepr();
				                    if (s3 !== peg$FAILED) {
				                        peg$parsews();
				                        s5 = peg$parsevariation();
				                        if (s5 === peg$FAILED) {
				                            s5 = null;
				                        }
				                        peg$savedPos = s0;
				                        s0 = peg$f141(s2, s5);
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsepl() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 40) {
				                s0 = peg$c173;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e183);
				                }
				            }
				            return s0;
				        }
				        function peg$parsepr() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 41) {
				                s0 = peg$c174;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e184);
				                }
				            }
				            return s0;
				        }
				        function peg$parsemoveNumber() {
				            var s0, s1, s2, s3, s4, s5, s6;
				            s0 = peg$currPos;
				            s1 = peg$parseinteger();
				            if (s1 !== peg$FAILED) {
				                s2 = [];
				                s3 = peg$parsewhiteSpace();
				                while (s3 !== peg$FAILED) {
				                    s2.push(s3);
				                    s3 = peg$parsewhiteSpace();
				                }
				                s3 = [];
				                s4 = peg$parsedot();
				                while (s4 !== peg$FAILED) {
				                    s3.push(s4);
				                    s4 = peg$parsedot();
				                }
				                s4 = [];
				                s5 = peg$parsewhiteSpace();
				                while (s5 !== peg$FAILED) {
				                    s4.push(s5);
				                    s5 = peg$parsewhiteSpace();
				                }
				                s5 = [];
				                s6 = peg$parsedot();
				                while (s6 !== peg$FAILED) {
				                    s5.push(s6);
				                    s6 = peg$parsedot();
				                }
				                peg$savedPos = s0;
				                s0 = peg$f142(s1);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsedot() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 46) {
				                s0 = peg$c140;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e146);
				                }
				            }
				            return s0;
				        }
				        function peg$parseinteger() {
				            var s0, s1, s2;
				            peg$silentFails++;
				            s0 = peg$currPos;
				            s1 = [];
				            s2 = input.charAt(peg$currPos);
				            if (peg$r5.test(s2)) {
				                peg$currPos++;
				            }
				            else {
				                s2 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e147);
				                }
				            }
				            if (s2 !== peg$FAILED) {
				                while (s2 !== peg$FAILED) {
				                    s1.push(s2);
				                    s2 = input.charAt(peg$currPos);
				                    if (peg$r5.test(s2)) {
				                        peg$currPos++;
				                    }
				                    else {
				                        s2 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e147);
				                        }
				                    }
				                }
				            }
				            else {
				                s1 = peg$FAILED;
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f143(s1);
				            }
				            s0 = s1;
				            peg$silentFails--;
				            if (s0 === peg$FAILED) {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e185);
				                }
				            }
				            return s0;
				        }
				        function peg$parsewhiteSpace() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            s1 = [];
				            if (input.charCodeAt(peg$currPos) === 32) {
				                s2 = peg$c175;
				                peg$currPos++;
				            }
				            else {
				                s2 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e186);
				                }
				            }
				            if (s2 !== peg$FAILED) {
				                while (s2 !== peg$FAILED) {
				                    s1.push(s2);
				                    if (input.charCodeAt(peg$currPos) === 32) {
				                        s2 = peg$c175;
				                        peg$currPos++;
				                    }
				                    else {
				                        s2 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e186);
				                        }
				                    }
				                }
				            }
				            else {
				                s1 = peg$FAILED;
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f144();
				            }
				            s0 = s1;
				            return s0;
				        }
				        function peg$parsehalfMove() {
				            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
				            s0 = peg$currPos;
				            s1 = peg$parsefigure();
				            if (s1 === peg$FAILED) {
				                s1 = null;
				            }
				            s2 = peg$currPos;
				            peg$silentFails++;
				            s3 = peg$parsecheckdisc();
				            peg$silentFails--;
				            if (s3 !== peg$FAILED) {
				                peg$currPos = s2;
				                s2 = undefined;
				            }
				            else {
				                s2 = peg$FAILED;
				            }
				            if (s2 !== peg$FAILED) {
				                s3 = peg$parsediscriminator();
				                if (s3 !== peg$FAILED) {
				                    s4 = peg$parsestrike();
				                    if (s4 === peg$FAILED) {
				                        s4 = null;
				                    }
				                    s5 = peg$parsecolumn();
				                    if (s5 !== peg$FAILED) {
				                        s6 = peg$parserow();
				                        if (s6 !== peg$FAILED) {
				                            s7 = peg$parsepromotion();
				                            if (s7 === peg$FAILED) {
				                                s7 = null;
				                            }
				                            s8 = peg$parsecheck();
				                            if (s8 === peg$FAILED) {
				                                s8 = null;
				                            }
				                            peg$parsews();
				                            if (input.substr(peg$currPos, 4) === peg$c176) {
				                                peg$currPos += 4;
				                            }
				                            else {
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e187);
				                                }
				                            }
				                            peg$savedPos = s0;
				                            s0 = peg$f145(s1, s3, s4, s5, s6, s7, s8);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$parsefigure();
				                if (s1 === peg$FAILED) {
				                    s1 = null;
				                }
				                s2 = peg$parsecolumn();
				                if (s2 !== peg$FAILED) {
				                    s3 = peg$parserow();
				                    if (s3 !== peg$FAILED) {
				                        s4 = peg$parsestrikeOrDash();
				                        if (s4 === peg$FAILED) {
				                            s4 = null;
				                        }
				                        s5 = peg$parsecolumn();
				                        if (s5 !== peg$FAILED) {
				                            s6 = peg$parserow();
				                            if (s6 !== peg$FAILED) {
				                                s7 = peg$parsepromotion();
				                                if (s7 === peg$FAILED) {
				                                    s7 = null;
				                                }
				                                s8 = peg$parsecheck();
				                                if (s8 === peg$FAILED) {
				                                    s8 = null;
				                                }
				                                peg$savedPos = s0;
				                                s0 = peg$f146(s1, s2, s3, s4, s5, s6, s7, s8);
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    s1 = peg$parsefigure();
				                    if (s1 === peg$FAILED) {
				                        s1 = null;
				                    }
				                    s2 = peg$parsestrike();
				                    if (s2 === peg$FAILED) {
				                        s2 = null;
				                    }
				                    s3 = peg$parsecolumn();
				                    if (s3 !== peg$FAILED) {
				                        s4 = peg$parserow();
				                        if (s4 !== peg$FAILED) {
				                            s5 = peg$parsepromotion();
				                            if (s5 === peg$FAILED) {
				                                s5 = null;
				                            }
				                            s6 = peg$parsecheck();
				                            if (s6 === peg$FAILED) {
				                                s6 = null;
				                            }
				                            peg$savedPos = s0;
				                            s0 = peg$f147(s1, s2, s3, s4, s5, s6);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        if (input.substr(peg$currPos, 5) === peg$c177) {
				                            s1 = peg$c177;
				                            peg$currPos += 5;
				                        }
				                        else {
				                            s1 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e188);
				                            }
				                        }
				                        if (s1 !== peg$FAILED) {
				                            s2 = peg$parsecheck();
				                            if (s2 === peg$FAILED) {
				                                s2 = null;
				                            }
				                            peg$savedPos = s0;
				                            s0 = peg$f148(s2);
				                        }
				                        else {
				                            peg$currPos = s0;
				                            s0 = peg$FAILED;
				                        }
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            if (input.substr(peg$currPos, 3) === peg$c178) {
				                                s1 = peg$c178;
				                                peg$currPos += 3;
				                            }
				                            else {
				                                s1 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e189);
				                                }
				                            }
				                            if (s1 !== peg$FAILED) {
				                                s2 = peg$parsecheck();
				                                if (s2 === peg$FAILED) {
				                                    s2 = null;
				                                }
				                                peg$savedPos = s0;
				                                s0 = peg$f149(s2);
				                            }
				                            else {
				                                peg$currPos = s0;
				                                s0 = peg$FAILED;
				                            }
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                s1 = peg$parsefigure();
				                                if (s1 !== peg$FAILED) {
				                                    if (input.charCodeAt(peg$currPos) === 64) {
				                                        s2 = peg$c179;
				                                        peg$currPos++;
				                                    }
				                                    else {
				                                        s2 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e190);
				                                        }
				                                    }
				                                    if (s2 !== peg$FAILED) {
				                                        s3 = peg$parsecolumn();
				                                        if (s3 !== peg$FAILED) {
				                                            s4 = peg$parserow();
				                                            if (s4 !== peg$FAILED) {
				                                                peg$savedPos = s0;
				                                                s0 = peg$f150(s1, s3, s4);
				                                            }
				                                            else {
				                                                peg$currPos = s0;
				                                                s0 = peg$FAILED;
				                                            }
				                                        }
				                                        else {
				                                            peg$currPos = s0;
				                                            s0 = peg$FAILED;
				                                        }
				                                    }
				                                    else {
				                                        peg$currPos = s0;
				                                        s0 = peg$FAILED;
				                                    }
				                                }
				                                else {
				                                    peg$currPos = s0;
				                                    s0 = peg$FAILED;
				                                }
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$currPos;
				                                    if (input.substr(peg$currPos, 2) === peg$c180) {
				                                        s1 = peg$c180;
				                                        peg$currPos += 2;
				                                    }
				                                    else {
				                                        s1 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e191);
				                                        }
				                                    }
				                                    if (s1 === peg$FAILED) {
				                                        s1 = peg$currPos;
				                                        if (input.charCodeAt(peg$currPos) === 45) {
				                                            s2 = peg$c144;
				                                            peg$currPos++;
				                                        }
				                                        else {
				                                            s2 = peg$FAILED;
				                                            if (peg$silentFails === 0) {
				                                                peg$fail(peg$e152);
				                                            }
				                                        }
				                                        if (s2 !== peg$FAILED) {
				                                            if (input.charCodeAt(peg$currPos) === 45) {
				                                                s3 = peg$c144;
				                                                peg$currPos++;
				                                            }
				                                            else {
				                                                s3 = peg$FAILED;
				                                                if (peg$silentFails === 0) {
				                                                    peg$fail(peg$e152);
				                                                }
				                                            }
				                                            if (s3 !== peg$FAILED) {
				                                                s2 = [s2, s3];
				                                                s1 = s2;
				                                            }
				                                            else {
				                                                peg$currPos = s1;
				                                                s1 = peg$FAILED;
				                                            }
				                                        }
				                                        else {
				                                            peg$currPos = s1;
				                                            s1 = peg$FAILED;
				                                        }
				                                    }
				                                    if (s1 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s1 = peg$f151();
				                                    }
				                                    s0 = s1;
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsecheck() {
				            var s0, s1, s2, s3;
				            s0 = peg$currPos;
				            s1 = peg$currPos;
				            s2 = peg$currPos;
				            peg$silentFails++;
				            if (input.substr(peg$currPos, 2) === peg$c181) {
				                s3 = peg$c181;
				                peg$currPos += 2;
				            }
				            else {
				                s3 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e192);
				                }
				            }
				            peg$silentFails--;
				            if (s3 === peg$FAILED) {
				                s2 = undefined;
				            }
				            else {
				                peg$currPos = s2;
				                s2 = peg$FAILED;
				            }
				            if (s2 !== peg$FAILED) {
				                if (input.charCodeAt(peg$currPos) === 43) {
				                    s3 = peg$c145;
				                    peg$currPos++;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e153);
				                    }
				                }
				                if (s3 !== peg$FAILED) {
				                    s2 = [s2, s3];
				                    s1 = s2;
				                }
				                else {
				                    peg$currPos = s1;
				                    s1 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s1;
				                s1 = peg$FAILED;
				            }
				            if (s1 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s1 = peg$f152(s1);
				            }
				            s0 = s1;
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                s1 = peg$currPos;
				                s2 = peg$currPos;
				                peg$silentFails++;
				                if (input.substr(peg$currPos, 3) === peg$c182) {
				                    s3 = peg$c182;
				                    peg$currPos += 3;
				                }
				                else {
				                    s3 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e193);
				                    }
				                }
				                peg$silentFails--;
				                if (s3 === peg$FAILED) {
				                    s2 = undefined;
				                }
				                else {
				                    peg$currPos = s2;
				                    s2 = peg$FAILED;
				                }
				                if (s2 !== peg$FAILED) {
				                    if (input.charCodeAt(peg$currPos) === 35) {
				                        s3 = peg$c183;
				                        peg$currPos++;
				                    }
				                    else {
				                        s3 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e194);
				                        }
				                    }
				                    if (s3 !== peg$FAILED) {
				                        s2 = [s2, s3];
				                        s1 = s2;
				                    }
				                    else {
				                        peg$currPos = s1;
				                        s1 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s1;
				                    s1 = peg$FAILED;
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f153(s1);
				                }
				                s0 = s1;
				            }
				            return s0;
				        }
				        function peg$parsepromotion() {
				            var s0, s2;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 61) {
				                peg$currPos++;
				            }
				            else {
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e159);
				                }
				            }
				            s2 = peg$parsepromFigure();
				            if (s2 !== peg$FAILED) {
				                peg$savedPos = s0;
				                s0 = peg$f154(s2);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsenags() {
				            var s0, s1, s3;
				            s0 = peg$currPos;
				            s1 = peg$parsenag();
				            if (s1 !== peg$FAILED) {
				                peg$parsews();
				                s3 = peg$parsenags();
				                if (s3 === peg$FAILED) {
				                    s3 = null;
				                }
				                peg$savedPos = s0;
				                s0 = peg$f155(s1, s3);
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsenag() {
				            var s0, s1, s2;
				            s0 = peg$currPos;
				            if (input.charCodeAt(peg$currPos) === 36) {
				                s1 = peg$c184;
				                peg$currPos++;
				            }
				            else {
				                s1 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e195);
				                }
				            }
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parseinteger();
				                if (s2 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s0 = peg$f156(s2);
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            if (s0 === peg$FAILED) {
				                s0 = peg$currPos;
				                if (input.substr(peg$currPos, 2) === peg$c185) {
				                    s1 = peg$c185;
				                    peg$currPos += 2;
				                }
				                else {
				                    s1 = peg$FAILED;
				                    if (peg$silentFails === 0) {
				                        peg$fail(peg$e196);
				                    }
				                }
				                if (s1 !== peg$FAILED) {
				                    peg$savedPos = s0;
				                    s1 = peg$f157();
				                }
				                s0 = s1;
				                if (s0 === peg$FAILED) {
				                    s0 = peg$currPos;
				                    if (input.substr(peg$currPos, 2) === peg$c186) {
				                        s1 = peg$c186;
				                        peg$currPos += 2;
				                    }
				                    else {
				                        s1 = peg$FAILED;
				                        if (peg$silentFails === 0) {
				                            peg$fail(peg$e197);
				                        }
				                    }
				                    if (s1 !== peg$FAILED) {
				                        peg$savedPos = s0;
				                        s1 = peg$f158();
				                    }
				                    s0 = s1;
				                    if (s0 === peg$FAILED) {
				                        s0 = peg$currPos;
				                        if (input.substr(peg$currPos, 2) === peg$c187) {
				                            s1 = peg$c187;
				                            peg$currPos += 2;
				                        }
				                        else {
				                            s1 = peg$FAILED;
				                            if (peg$silentFails === 0) {
				                                peg$fail(peg$e198);
				                            }
				                        }
				                        if (s1 !== peg$FAILED) {
				                            peg$savedPos = s0;
				                            s1 = peg$f159();
				                        }
				                        s0 = s1;
				                        if (s0 === peg$FAILED) {
				                            s0 = peg$currPos;
				                            if (input.substr(peg$currPos, 2) === peg$c188) {
				                                s1 = peg$c188;
				                                peg$currPos += 2;
				                            }
				                            else {
				                                s1 = peg$FAILED;
				                                if (peg$silentFails === 0) {
				                                    peg$fail(peg$e199);
				                                }
				                            }
				                            if (s1 !== peg$FAILED) {
				                                peg$savedPos = s0;
				                                s1 = peg$f160();
				                            }
				                            s0 = s1;
				                            if (s0 === peg$FAILED) {
				                                s0 = peg$currPos;
				                                if (input.charCodeAt(peg$currPos) === 33) {
				                                    s1 = peg$c189;
				                                    peg$currPos++;
				                                }
				                                else {
				                                    s1 = peg$FAILED;
				                                    if (peg$silentFails === 0) {
				                                        peg$fail(peg$e200);
				                                    }
				                                }
				                                if (s1 !== peg$FAILED) {
				                                    peg$savedPos = s0;
				                                    s1 = peg$f161();
				                                }
				                                s0 = s1;
				                                if (s0 === peg$FAILED) {
				                                    s0 = peg$currPos;
				                                    if (input.charCodeAt(peg$currPos) === 63) {
				                                        s1 = peg$c143;
				                                        peg$currPos++;
				                                    }
				                                    else {
				                                        s1 = peg$FAILED;
				                                        if (peg$silentFails === 0) {
				                                            peg$fail(peg$e151);
				                                        }
				                                    }
				                                    if (s1 !== peg$FAILED) {
				                                        peg$savedPos = s0;
				                                        s1 = peg$f162();
				                                    }
				                                    s0 = s1;
				                                    if (s0 === peg$FAILED) {
				                                        s0 = peg$currPos;
				                                        if (input.charCodeAt(peg$currPos) === 8252) {
				                                            s1 = peg$c190;
				                                            peg$currPos++;
				                                        }
				                                        else {
				                                            s1 = peg$FAILED;
				                                            if (peg$silentFails === 0) {
				                                                peg$fail(peg$e201);
				                                            }
				                                        }
				                                        if (s1 !== peg$FAILED) {
				                                            peg$savedPos = s0;
				                                            s1 = peg$f163();
				                                        }
				                                        s0 = s1;
				                                        if (s0 === peg$FAILED) {
				                                            s0 = peg$currPos;
				                                            if (input.charCodeAt(peg$currPos) === 8263) {
				                                                s1 = peg$c191;
				                                                peg$currPos++;
				                                            }
				                                            else {
				                                                s1 = peg$FAILED;
				                                                if (peg$silentFails === 0) {
				                                                    peg$fail(peg$e202);
				                                                }
				                                            }
				                                            if (s1 !== peg$FAILED) {
				                                                peg$savedPos = s0;
				                                                s1 = peg$f164();
				                                            }
				                                            s0 = s1;
				                                            if (s0 === peg$FAILED) {
				                                                s0 = peg$currPos;
				                                                if (input.charCodeAt(peg$currPos) === 8265) {
				                                                    s1 = peg$c192;
				                                                    peg$currPos++;
				                                                }
				                                                else {
				                                                    s1 = peg$FAILED;
				                                                    if (peg$silentFails === 0) {
				                                                        peg$fail(peg$e203);
				                                                    }
				                                                }
				                                                if (s1 !== peg$FAILED) {
				                                                    peg$savedPos = s0;
				                                                    s1 = peg$f165();
				                                                }
				                                                s0 = s1;
				                                                if (s0 === peg$FAILED) {
				                                                    s0 = peg$currPos;
				                                                    if (input.charCodeAt(peg$currPos) === 8264) {
				                                                        s1 = peg$c193;
				                                                        peg$currPos++;
				                                                    }
				                                                    else {
				                                                        s1 = peg$FAILED;
				                                                        if (peg$silentFails === 0) {
				                                                            peg$fail(peg$e204);
				                                                        }
				                                                    }
				                                                    if (s1 !== peg$FAILED) {
				                                                        peg$savedPos = s0;
				                                                        s1 = peg$f166();
				                                                    }
				                                                    s0 = s1;
				                                                    if (s0 === peg$FAILED) {
				                                                        s0 = peg$currPos;
				                                                        if (input.charCodeAt(peg$currPos) === 9633) {
				                                                            s1 = peg$c194;
				                                                            peg$currPos++;
				                                                        }
				                                                        else {
				                                                            s1 = peg$FAILED;
				                                                            if (peg$silentFails === 0) {
				                                                                peg$fail(peg$e205);
				                                                            }
				                                                        }
				                                                        if (s1 !== peg$FAILED) {
				                                                            peg$savedPos = s0;
				                                                            s1 = peg$f167();
				                                                        }
				                                                        s0 = s1;
				                                                        if (s0 === peg$FAILED) {
				                                                            s0 = peg$currPos;
				                                                            if (input.charCodeAt(peg$currPos) === 61) {
				                                                                s1 = peg$c151;
				                                                                peg$currPos++;
				                                                            }
				                                                            else {
				                                                                s1 = peg$FAILED;
				                                                                if (peg$silentFails === 0) {
				                                                                    peg$fail(peg$e159);
				                                                                }
				                                                            }
				                                                            if (s1 !== peg$FAILED) {
				                                                                peg$savedPos = s0;
				                                                                s1 = peg$f168();
				                                                            }
				                                                            s0 = s1;
				                                                            if (s0 === peg$FAILED) {
				                                                                s0 = peg$currPos;
				                                                                if (input.charCodeAt(peg$currPos) === 8734) {
				                                                                    s1 = peg$c195;
				                                                                    peg$currPos++;
				                                                                }
				                                                                else {
				                                                                    s1 = peg$FAILED;
				                                                                    if (peg$silentFails === 0) {
				                                                                        peg$fail(peg$e206);
				                                                                    }
				                                                                }
				                                                                if (s1 !== peg$FAILED) {
				                                                                    peg$savedPos = s0;
				                                                                    s1 = peg$f169();
				                                                                }
				                                                                s0 = s1;
				                                                                if (s0 === peg$FAILED) {
				                                                                    s0 = peg$currPos;
				                                                                    if (input.charCodeAt(peg$currPos) === 10866) {
				                                                                        s1 = peg$c196;
				                                                                        peg$currPos++;
				                                                                    }
				                                                                    else {
				                                                                        s1 = peg$FAILED;
				                                                                        if (peg$silentFails === 0) {
				                                                                            peg$fail(peg$e207);
				                                                                        }
				                                                                    }
				                                                                    if (s1 !== peg$FAILED) {
				                                                                        peg$savedPos = s0;
				                                                                        s1 = peg$f170();
				                                                                    }
				                                                                    s0 = s1;
				                                                                    if (s0 === peg$FAILED) {
				                                                                        s0 = peg$currPos;
				                                                                        if (input.charCodeAt(peg$currPos) === 10865) {
				                                                                            s1 = peg$c197;
				                                                                            peg$currPos++;
				                                                                        }
				                                                                        else {
				                                                                            s1 = peg$FAILED;
				                                                                            if (peg$silentFails === 0) {
				                                                                                peg$fail(peg$e208);
				                                                                            }
				                                                                        }
				                                                                        if (s1 !== peg$FAILED) {
				                                                                            peg$savedPos = s0;
				                                                                            s1 = peg$f171();
				                                                                        }
				                                                                        s0 = s1;
				                                                                        if (s0 === peg$FAILED) {
				                                                                            s0 = peg$currPos;
				                                                                            if (input.charCodeAt(peg$currPos) === 177) {
				                                                                                s1 = peg$c198;
				                                                                                peg$currPos++;
				                                                                            }
				                                                                            else {
				                                                                                s1 = peg$FAILED;
				                                                                                if (peg$silentFails === 0) {
				                                                                                    peg$fail(peg$e209);
				                                                                                }
				                                                                            }
				                                                                            if (s1 !== peg$FAILED) {
				                                                                                peg$savedPos = s0;
				                                                                                s1 = peg$f172();
				                                                                            }
				                                                                            s0 = s1;
				                                                                            if (s0 === peg$FAILED) {
				                                                                                s0 = peg$currPos;
				                                                                                if (input.charCodeAt(peg$currPos) === 8723) {
				                                                                                    s1 = peg$c199;
				                                                                                    peg$currPos++;
				                                                                                }
				                                                                                else {
				                                                                                    s1 = peg$FAILED;
				                                                                                    if (peg$silentFails === 0) {
				                                                                                        peg$fail(peg$e210);
				                                                                                    }
				                                                                                }
				                                                                                if (s1 !== peg$FAILED) {
				                                                                                    peg$savedPos = s0;
				                                                                                    s1 = peg$f173();
				                                                                                }
				                                                                                s0 = s1;
				                                                                                if (s0 === peg$FAILED) {
				                                                                                    s0 = peg$currPos;
				                                                                                    if (input.substr(peg$currPos, 2) === peg$c181) {
				                                                                                        s1 = peg$c181;
				                                                                                        peg$currPos += 2;
				                                                                                    }
				                                                                                    else {
				                                                                                        s1 = peg$FAILED;
				                                                                                        if (peg$silentFails === 0) {
				                                                                                            peg$fail(peg$e192);
				                                                                                        }
				                                                                                    }
				                                                                                    if (s1 !== peg$FAILED) {
				                                                                                        peg$savedPos = s0;
				                                                                                        s1 = peg$f174();
				                                                                                    }
				                                                                                    s0 = s1;
				                                                                                    if (s0 === peg$FAILED) {
				                                                                                        s0 = peg$currPos;
				                                                                                        if (input.substr(peg$currPos, 2) === peg$c200) {
				                                                                                            s1 = peg$c200;
				                                                                                            peg$currPos += 2;
				                                                                                        }
				                                                                                        else {
				                                                                                            s1 = peg$FAILED;
				                                                                                            if (peg$silentFails === 0) {
				                                                                                                peg$fail(peg$e211);
				                                                                                            }
				                                                                                        }
				                                                                                        if (s1 !== peg$FAILED) {
				                                                                                            peg$savedPos = s0;
				                                                                                            s1 = peg$f175();
				                                                                                        }
				                                                                                        s0 = s1;
				                                                                                        if (s0 === peg$FAILED) {
				                                                                                            s0 = peg$currPos;
				                                                                                            if (input.charCodeAt(peg$currPos) === 10752) {
				                                                                                                s1 = peg$c201;
				                                                                                                peg$currPos++;
				                                                                                            }
				                                                                                            else {
				                                                                                                s1 = peg$FAILED;
				                                                                                                if (peg$silentFails === 0) {
				                                                                                                    peg$fail(peg$e212);
				                                                                                                }
				                                                                                            }
				                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                peg$savedPos = s0;
				                                                                                                s1 = peg$f176();
				                                                                                            }
				                                                                                            s0 = s1;
				                                                                                            if (s0 === peg$FAILED) {
				                                                                                                s0 = peg$currPos;
				                                                                                                if (input.charCodeAt(peg$currPos) === 10227) {
				                                                                                                    s1 = peg$c202;
				                                                                                                    peg$currPos++;
				                                                                                                }
				                                                                                                else {
				                                                                                                    s1 = peg$FAILED;
				                                                                                                    if (peg$silentFails === 0) {
				                                                                                                        peg$fail(peg$e213);
				                                                                                                    }
				                                                                                                }
				                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                    peg$savedPos = s0;
				                                                                                                    s1 = peg$f177();
				                                                                                                }
				                                                                                                s0 = s1;
				                                                                                                if (s0 === peg$FAILED) {
				                                                                                                    s0 = peg$currPos;
				                                                                                                    if (input.charCodeAt(peg$currPos) === 8594) {
				                                                                                                        s1 = peg$c203;
				                                                                                                        peg$currPos++;
				                                                                                                    }
				                                                                                                    else {
				                                                                                                        s1 = peg$FAILED;
				                                                                                                        if (peg$silentFails === 0) {
				                                                                                                            peg$fail(peg$e214);
				                                                                                                        }
				                                                                                                    }
				                                                                                                    if (s1 !== peg$FAILED) {
				                                                                                                        peg$savedPos = s0;
				                                                                                                        s1 = peg$f178();
				                                                                                                    }
				                                                                                                    s0 = s1;
				                                                                                                    if (s0 === peg$FAILED) {
				                                                                                                        s0 = peg$currPos;
				                                                                                                        if (input.charCodeAt(peg$currPos) === 8593) {
				                                                                                                            s1 = peg$c204;
				                                                                                                            peg$currPos++;
				                                                                                                        }
				                                                                                                        else {
				                                                                                                            s1 = peg$FAILED;
				                                                                                                            if (peg$silentFails === 0) {
				                                                                                                                peg$fail(peg$e215);
				                                                                                                            }
				                                                                                                        }
				                                                                                                        if (s1 !== peg$FAILED) {
				                                                                                                            peg$savedPos = s0;
				                                                                                                            s1 = peg$f179();
				                                                                                                        }
				                                                                                                        s0 = s1;
				                                                                                                        if (s0 === peg$FAILED) {
				                                                                                                            s0 = peg$currPos;
				                                                                                                            if (input.charCodeAt(peg$currPos) === 8646) {
				                                                                                                                s1 = peg$c205;
				                                                                                                                peg$currPos++;
				                                                                                                            }
				                                                                                                            else {
				                                                                                                                s1 = peg$FAILED;
				                                                                                                                if (peg$silentFails === 0) {
				                                                                                                                    peg$fail(peg$e216);
				                                                                                                                }
				                                                                                                            }
				                                                                                                            if (s1 !== peg$FAILED) {
				                                                                                                                peg$savedPos = s0;
				                                                                                                                s1 = peg$f180();
				                                                                                                            }
				                                                                                                            s0 = s1;
				                                                                                                            if (s0 === peg$FAILED) {
				                                                                                                                s0 = peg$currPos;
				                                                                                                                if (input.charCodeAt(peg$currPos) === 68) {
				                                                                                                                    s1 = peg$c206;
				                                                                                                                    peg$currPos++;
				                                                                                                                }
				                                                                                                                else {
				                                                                                                                    s1 = peg$FAILED;
				                                                                                                                    if (peg$silentFails === 0) {
				                                                                                                                        peg$fail(peg$e217);
				                                                                                                                    }
				                                                                                                                }
				                                                                                                                if (s1 !== peg$FAILED) {
				                                                                                                                    peg$savedPos = s0;
				                                                                                                                    s1 = peg$f181();
				                                                                                                                }
				                                                                                                                s0 = s1;
				                                                                                                            }
				                                                                                                        }
				                                                                                                    }
				                                                                                                }
				                                                                                            }
				                                                                                        }
				                                                                                    }
				                                                                                }
				                                                                            }
				                                                                        }
				                                                                    }
				                                                                }
				                                                            }
				                                                        }
				                                                    }
				                                                }
				                                            }
				                                        }
				                                    }
				                                }
				                            }
				                        }
				                    }
				                }
				            }
				            return s0;
				        }
				        function peg$parsediscriminator() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r8.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e218);
				                }
				            }
				            return s0;
				        }
				        function peg$parsecheckdisc() {
				            var s0, s1, s2, s3, s4;
				            s0 = peg$currPos;
				            s1 = peg$parsediscriminator();
				            if (s1 !== peg$FAILED) {
				                s2 = peg$parsestrike();
				                if (s2 === peg$FAILED) {
				                    s2 = null;
				                }
				                s3 = peg$parsecolumn();
				                if (s3 !== peg$FAILED) {
				                    s4 = peg$parserow();
				                    if (s4 !== peg$FAILED) {
				                        s1 = [s1, s2, s3, s4];
				                        s0 = s1;
				                    }
				                    else {
				                        peg$currPos = s0;
				                        s0 = peg$FAILED;
				                    }
				                }
				                else {
				                    peg$currPos = s0;
				                    s0 = peg$FAILED;
				                }
				            }
				            else {
				                peg$currPos = s0;
				                s0 = peg$FAILED;
				            }
				            return s0;
				        }
				        function peg$parsefigure() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r9.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e219);
				                }
				            }
				            return s0;
				        }
				        function peg$parsepromFigure() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r10.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e220);
				                }
				            }
				            return s0;
				        }
				        function peg$parsecolumn() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r11.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e221);
				                }
				            }
				            return s0;
				        }
				        function peg$parserow() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r12.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e222);
				                }
				            }
				            return s0;
				        }
				        function peg$parsestrike() {
				            var s0;
				            if (input.charCodeAt(peg$currPos) === 120) {
				                s0 = peg$c207;
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e223);
				                }
				            }
				            return s0;
				        }
				        function peg$parsestrikeOrDash() {
				            var s0;
				            s0 = input.charAt(peg$currPos);
				            if (peg$r13.test(s0)) {
				                peg$currPos++;
				            }
				            else {
				                s0 = peg$FAILED;
				                if (peg$silentFails === 0) {
				                    peg$fail(peg$e224);
				                }
				            }
				            return s0;
				        }
				        var messages = [];
				        function addMessage(json) {
				            var o = Object.assign(json, location());
				            messages.push(o);
				            return o;
				        }
				        function makeInteger(o) {
				            return parseInt(o.join(""), 10);
				        }
				        function mi(o) {
				            return o.join("").match(/\?/) ? o.join("") : makeInteger(o);
				        }
				        function merge(array) {
				            var ret = {};
				            // return array
				            array.forEach(function (json) {
				                for (var key in json) {
				                    if (Array.isArray(json[key])) {
				                        ret[key] = ret[key] ? ret[key].concat(json[key]) : json[key];
				                    }
				                    else {
				                        ret[key] = ret[key] ? trimEnd(ret[key]) + " " + trimStart(json[key]) : json[key];
				                    }
				                }
				            });
				            return ret;
				        }
				        function trimStart(st) {
				            if (typeof st !== "string")
				                return st;
				            var r = /^\s+/;
				            return st.replace(r, '');
				        }
				        function trimEnd(st) {
				            if (typeof st !== "string")
				                return st;
				            var r = /\s+$/;
				            return st.replace(r, '');
				        }
				        peg$result = peg$startRuleFunction();
				        if (options.peg$library) {
				            return /** @type {any} */ ({
				                peg$result,
				                peg$currPos,
				                peg$FAILED,
				                peg$maxFailExpected,
				                peg$maxFailPos
				            });
				        }
				        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
				            return peg$result;
				        }
				        else {
				            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
				                peg$fail(peg$endExpectation());
				            }
				            throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length
				                ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
				                : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
				        }
				    }
				    return {
				        StartRules: ["pgn", "tags", "game", "games"],
				        SyntaxError: peg$SyntaxError,
				        parse: peg$parse
				    };
				}); 
			} (_pgnParser$1));
			return _pgnParser$1.exports;
		}

		var _pgnParserExports = require_pgnParser();
		var PegParser = /*@__PURE__*/getDefaultExportFromCjs(_pgnParserExports);

		// import PegParser = require("./_pgn-parser")
		// import * as PegParser from './_pgn-parser'
		/**
		 * General parse function, that accepts all `startRule`s. Calls then the more specific ones, so that the
		 * postParse processing can now rely on the same structure all the time.
		 * @param input - the PGN string that will be parsed according to the `startRule` given
		 * @param options - the parameters that have to include the `startRule`
		 * @returns a ParseTree or an array of ParseTrees, depending on the startRule
		 */
		function parse(input, options) {
		    if (!options || options.startRule === "games") {
		        return parseGames(input, options);
		    }
		    else {
		        return parseGame(input, options);
		    }
		}
		/**
		 * Special parse function to parse one game only, options may be omitted.
		 * @param input - the PGN string that will be parsed
		 * @param options - object with additional parameters (not used at the moment)
		 * @returns a ParseTree with the defined structure
		 */
		function parseGame(input, options = { startRule: "game" }) {
		    try {
		        input = input.trim();
		        // Ensure that the correct structure exists: { tags: xxx, moves: ... }
		        let result = PegParser.parse(input, options);
		        let res2 = { moves: [], messages: [] };
		        if (options.startRule === "pgn") {
		            res2.moves = result;
		        }
		        else if (options.startRule === "tags") {
		            res2.tags = result;
		        }
		        else {
		            res2 = result;
		        }
		        return postParseGame(res2, input, options);
		    }
		    catch (error) {
		        // error will be enhanced, so throw the returning error object
		        throw parseError(input, options, error);
		    }
		}
		/**
		 * Handles parsing errors and enhances the error object with a detailed error hint.
		 * @param input - the PGN string that was being parsed
		 * @param options - the parsing options that were used
		 * @param error - the error that occurred during parsing
		 * @returns the enhanced error object
		 */
		function parseError(input, options, error) {
		    // Check if the error contains location information
		    if (error.location && error.location.start) {
		        const line = error.location.start.line;
		        const column = error.location.start.column;
		        // Split the input into lines
		        const lines = input.split("\n");
		        // Create context with a few lines before and after the error
		        const contextStart = Math.max(0, line - 3);
		        const contextEnd = Math.min(lines.length, line + 2);
		        const contextLines = [];
		        for (let i = contextStart; i < contextEnd; i++) {
		            const lineNum = i + 1;
		            let lineContent = lines[i] || "";
		            // If this is the error line, mark the error position
		            if (lineNum === line) {
		                if (column <= lineContent.length) {
		                    // Insert ** before the character at the error position
		                    lineContent = lineContent.substring(0, column - 1) + "**" + lineContent.substring(column - 1);
		                }
		                else {
		                    // Error is at the end of the line
		                    lineContent += "**";
		                }
		            }
		            contextLines.push(`${lineNum}: ${lineContent}`);
		        }
		        // Create the error hint
		        error.errorHint = `Error at line ${line}, column ${column}:\n${contextLines.join("\n")}`;
		    }
		    else {
		        // If no location info is available, provide a basic message
		        error.errorHint = `Error parsing PGN (no location information available): ${error.message || "Unknown error"}`;
		    }
		    return error;
		}
		function postParseGame(_parseTree, _input, _options) {
		    /** Ensure that the result is kept as tag only, so no check of last move is necessary any more. */
		    function handleGameResult(parseTree) {
		        if (_options.startRule !== "tags") {
		            let move = parseTree.moves[parseTree.moves.length - 1];
		            if (typeof move == "string") {
		                parseTree.moves.pop();
		                if (parseTree.tags) {
		                    let tmp = parseTree.tags["Result"];
		                    if (tmp) {
		                        if (move !== tmp) {
		                            parseTree.messages.push({
		                                key: "Result",
		                                value: tmp,
		                                message: "Result in tags is different to result in SAN",
		                            });
		                        }
		                    }
		                    parseTree.tags["Result"] = move;
		                }
		            }
		        }
		        return parseTree;
		    }
		    function handleTurn(parseResult) {
		        function handleTurnGame(_game) {
		            function getTurnFromFEN(fen) {
		                return fen.split(/\s+/)[1];
		            }
		            function setTurn(_move, _currentTurn) {
		                function switchTurn(currentTurn) {
		                    return currentTurn === "w" ? "b" : "w";
		                }
		                _move.turn = _currentTurn;
		                if (_move.variations) {
		                    _move.variations.forEach(function (variation) {
		                        let varTurn = _currentTurn;
		                        variation.forEach((varMove) => (varTurn = setTurn(varMove, varTurn)));
		                    });
		                }
		                return switchTurn(_currentTurn);
		            }
		            const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		            let fen = _options.fen || (_game.tags && _game.tags["FEN"]) || START;
		            let currentTurn = getTurnFromFEN(fen);
		            _game.moves.forEach((move) => (currentTurn = setTurn(move, currentTurn)));
		            return _game;
		        }
		        if (!parseResult.moves) {
		            return parseResult;
		        }
		        return handleTurnGame(parseResult);
		    }
		    return handleTurn(handleGameResult(_parseTree));
		}
		/**
		 * Parses possibly more than one game, therefore returns an array of ParseTree.
		 * @param input the PGN string to parse
		 * @param options the optional parameters (not used at the moment)
		 * @returns an array of ParseTrees, one for each game included
		 */
		function parseGames(input, options = { startRule: "games" }) {
		    function handleGamesAnomaly(parseTree) {
		        if (!Array.isArray(parseTree))
		            return [];
		        if (parseTree.length === 0)
		            return parseTree;
		        let last = parseTree.pop();
		        if (last.tags !== undefined || last.moves.length > 0) {
		            parseTree.push(last);
		        }
		        return parseTree;
		    }
		    function postParseGames(parseTrees, input, options = { startRule: "games" }) {
		        return handleGamesAnomaly(parseTrees);
		    }
		    try {
		        const gamesOptions = Object.assign({ startRule: "games" }, options);
		        let result = PegParser.parse(input, gamesOptions);
		        if (!result) {
		            return [];
		        }
		        postParseGames(result, input, gamesOptions);
		        result.forEach((pt) => {
		            postParseGame(pt, input, gamesOptions);
		        });
		        return result;
		    }
		    catch (error) {
		        // error will be enhanced, so throw the returning error object
		        throw parseError(input, options, error);
		    }
		}
		// export { SyntaxError };

		const normalizeLineEndings = (str, normalized = '\n') => str.replace(/\r?\n/g, normalized);
		/**
		 * Returns an array of SplitGames, which are objects that may contain tags and / or pgn strings.
		 * The split function expects well formed export format strings (see [8.1 Tag pair section](https://github.com/mliebelt/pgn-spec-commented/blob/main/pgn-specification.md#81-tag-pair-section), statement "a single empty line follows the last tag pair"). So the split function only works when tags are separated from pgn string by an empty line, and the next game is separated by at least one empty line as well.
		 * @param input - the PGN string that may contain multiple games
		 * @param options - not used at the moment
		 * @returns an array of SplitGame to be parsed later
		 */
		function split(input, options = { startRule: "games" }) {
		    // let result = parser.parse(input, options)
		    let result = normalizeLineEndings(input).split(/\n\n+/);
		    let res = [];
		    let g = { tags: '', pgn: '', all: '' };
		    result.forEach(function (part) {
		        if (part.startsWith('[')) {
		            g.tags = part;
		        }
		        else if (part) {
		            g.pgn = part;
		            let game = g.tags ? g.tags + "\n\n" + g.pgn : g.pgn;
		            g.all = game;
		            res.push(g);
		            g = { tags: '', pgn: '', all: '' };
		        }
		    });
		    return res;
		}

		exports.parse = parse;
		exports.parseGame = parseGame;
		exports.parseGames = parseGames;
		exports.split = split;

	}));
	}(index_umd, index_umd.exports));

	// @generated by Peggy 4.2.0.
	//
	// https://peggyjs.org/



	  function rootNode(comment) {
	  	return comment !== null ? { comment, variations: [] } : { variations: []}
	  }

	  function node(move, suffix, nag, comment, variations) {
	  	const node = { move, variations };

	    if (suffix) {
	    	node.suffix = suffix;
	    }

	    if (nag) {
	    	node.nag = nag;
	    }

	    if (comment !== null) {
	    	node.comment = comment;
	    }

	    return node
	  }

	  function lineToTree(...nodes) {
	  	const [root, ...rest] = nodes;

	    let parent = root;

	    for (const child of rest) {
	    	if (child !== null) {
	        	parent.variations = [child, ...child.variations];
	            child.variations = [];
	            parent = child;
	        }
	    }

	  	return root
	  }

	  function pgn$4(headers, game) {
	  	if (game.marker && game.marker.comment) {
	    	let node = game.root;
	        while (true) {
	        	const next = node.variations[0];
	            if (!next) {
	            	node.comment = game.marker.comment;
	            	break
	            }
	            node = next;
	        }
	    }

	  	return {
	    	headers,
	        root: game.root,
	        result: (game.marker && game.marker.result) ?? undefined
	    }
	  }

	function peg$subclass(child, parent) {
	  function C() { this.constructor = child; }
	  C.prototype = parent.prototype;
	  child.prototype = new C();
	}

	function peg$SyntaxError(message, expected, found, location) {
	  var self = Error.call(this, message);
	  // istanbul ignore next Check is a necessary evil to support older environments
	  if (Object.setPrototypeOf) {
	    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
	  }
	  self.expected = expected;
	  self.found = found;
	  self.location = location;
	  self.name = "SyntaxError";
	  return self;
	}

	peg$subclass(peg$SyntaxError, Error);

	function peg$padEnd(str, targetLength, padString) {
	  padString = padString || " ";
	  if (str.length > targetLength) { return str; }
	  targetLength -= str.length;
	  padString += padString.repeat(targetLength);
	  return str + padString.slice(0, targetLength);
	}

	peg$SyntaxError.prototype.format = function(sources) {
	  var str = "Error: " + this.message;
	  if (this.location) {
	    var src = null;
	    var k;
	    for (k = 0; k < sources.length; k++) {
	      if (sources[k].source === this.location.source) {
	        src = sources[k].text.split(/\r\n|\n|\r/g);
	        break;
	      }
	    }
	    var s = this.location.start;
	    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
	      ? this.location.source.offset(s)
	      : s;
	    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
	    if (src) {
	      var e = this.location.end;
	      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
	      var line = src[s.line - 1];
	      var last = s.line === e.line ? e.column : line.length + 1;
	      var hatLen = (last - s.column) || 1;
	      str += "\n --> " + loc + "\n"
	          + filler + " |\n"
	          + offset_s.line + " | " + line + "\n"
	          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
	          + peg$padEnd("", hatLen, "^");
	    } else {
	      str += "\n at " + loc;
	    }
	  }
	  return str;
	};

	peg$SyntaxError.buildMessage = function(expected, found) {
	  var DESCRIBE_EXPECTATION_FNS = {
	    literal: function(expectation) {
	      return "\"" + literalEscape(expectation.text) + "\"";
	    },

	    class: function(expectation) {
	      var escapedParts = expectation.parts.map(function(part) {
	        return Array.isArray(part)
	          ? classEscape(part[0]) + "-" + classEscape(part[1])
	          : classEscape(part);
	      });

	      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
	    },

	    any: function() {
	      return "any character";
	    },

	    end: function() {
	      return "end of input";
	    },

	    other: function(expectation) {
	      return expectation.description;
	    }
	  };

	  function hex(ch) {
	    return ch.charCodeAt(0).toString(16).toUpperCase();
	  }

	  function literalEscape(s) {
	    return s
	      .replace(/\\/g, "\\\\")
	      .replace(/"/g,  "\\\"")
	      .replace(/\0/g, "\\0")
	      .replace(/\t/g, "\\t")
	      .replace(/\n/g, "\\n")
	      .replace(/\r/g, "\\r")
	      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
	      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
	  }

	  function classEscape(s) {
	    return s
	      .replace(/\\/g, "\\\\")
	      .replace(/\]/g, "\\]")
	      .replace(/\^/g, "\\^")
	      .replace(/-/g,  "\\-")
	      .replace(/\0/g, "\\0")
	      .replace(/\t/g, "\\t")
	      .replace(/\n/g, "\\n")
	      .replace(/\r/g, "\\r")
	      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
	      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
	  }

	  function describeExpectation(expectation) {
	    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
	  }

	  function describeExpected(expected) {
	    var descriptions = expected.map(describeExpectation);
	    var i, j;

	    descriptions.sort();

	    if (descriptions.length > 0) {
	      for (i = 1, j = 1; i < descriptions.length; i++) {
	        if (descriptions[i - 1] !== descriptions[i]) {
	          descriptions[j] = descriptions[i];
	          j++;
	        }
	      }
	      descriptions.length = j;
	    }

	    switch (descriptions.length) {
	      case 1:
	        return descriptions[0];

	      case 2:
	        return descriptions[0] + " or " + descriptions[1];

	      default:
	        return descriptions.slice(0, -1).join(", ")
	          + ", or "
	          + descriptions[descriptions.length - 1];
	    }
	  }

	  function describeFound(found) {
	    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
	  }

	  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
	};

	function peg$parse(input, options) {
	  options = options !== undefined ? options : {};

	  var peg$FAILED = {};
	  var peg$source = options.grammarSource;

	  var peg$startRuleFunctions = { pgn: peg$parsepgn };
	  var peg$startRuleFunction = peg$parsepgn;

	  var peg$c0 = "[";
	  var peg$c1 = "\"";
	  var peg$c2 = "]";
	  var peg$c3 = ".";
	  var peg$c4 = "O-O-O";
	  var peg$c5 = "O-O";
	  var peg$c6 = "0-0-0";
	  var peg$c7 = "0-0";
	  var peg$c8 = "$";
	  var peg$c9 = "{";
	  var peg$c10 = "}";
	  var peg$c11 = ";";
	  var peg$c12 = "(";
	  var peg$c13 = ")";
	  var peg$c14 = "1-0";
	  var peg$c15 = "0-1";
	  var peg$c16 = "1/2-1/2";
	  var peg$c17 = "*";

	  var peg$r0 = /^[a-zA-Z]/;
	  var peg$r1 = /^[^"]/;
	  var peg$r2 = /^[0-9]/;
	  var peg$r3 = /^[.]/;
	  var peg$r4 = /^[a-zA-Z1-8\-=]/;
	  var peg$r5 = /^[+#]/;
	  var peg$r6 = /^[!?]/;
	  var peg$r7 = /^[^}]/;
	  var peg$r8 = /^[^\r\n]/;
	  var peg$r9 = /^[ \t\r\n]/;

	  var peg$e0 = peg$otherExpectation("tag pair");
	  var peg$e1 = peg$literalExpectation("[", false);
	  var peg$e2 = peg$literalExpectation("\"", false);
	  var peg$e3 = peg$literalExpectation("]", false);
	  var peg$e4 = peg$otherExpectation("tag name");
	  var peg$e5 = peg$classExpectation([["a", "z"], ["A", "Z"]], false, false);
	  var peg$e6 = peg$otherExpectation("tag value");
	  var peg$e7 = peg$classExpectation(["\""], true, false);
	  var peg$e8 = peg$otherExpectation("move number");
	  var peg$e9 = peg$classExpectation([["0", "9"]], false, false);
	  var peg$e10 = peg$literalExpectation(".", false);
	  var peg$e11 = peg$classExpectation(["."], false, false);
	  var peg$e12 = peg$otherExpectation("standard algebraic notation");
	  var peg$e13 = peg$literalExpectation("O-O-O", false);
	  var peg$e14 = peg$literalExpectation("O-O", false);
	  var peg$e15 = peg$literalExpectation("0-0-0", false);
	  var peg$e16 = peg$literalExpectation("0-0", false);
	  var peg$e17 = peg$classExpectation([["a", "z"], ["A", "Z"], ["1", "8"], "-", "="], false, false);
	  var peg$e18 = peg$classExpectation(["+", "#"], false, false);
	  var peg$e19 = peg$otherExpectation("suffix annotation");
	  var peg$e20 = peg$classExpectation(["!", "?"], false, false);
	  var peg$e21 = peg$otherExpectation("NAG");
	  var peg$e22 = peg$literalExpectation("$", false);
	  var peg$e23 = peg$otherExpectation("brace comment");
	  var peg$e24 = peg$literalExpectation("{", false);
	  var peg$e25 = peg$classExpectation(["}"], true, false);
	  var peg$e26 = peg$literalExpectation("}", false);
	  var peg$e27 = peg$otherExpectation("rest of line comment");
	  var peg$e28 = peg$literalExpectation(";", false);
	  var peg$e29 = peg$classExpectation(["\r", "\n"], true, false);
	  var peg$e30 = peg$otherExpectation("variation");
	  var peg$e31 = peg$literalExpectation("(", false);
	  var peg$e32 = peg$literalExpectation(")", false);
	  var peg$e33 = peg$otherExpectation("game termination marker");
	  var peg$e34 = peg$literalExpectation("1-0", false);
	  var peg$e35 = peg$literalExpectation("0-1", false);
	  var peg$e36 = peg$literalExpectation("1/2-1/2", false);
	  var peg$e37 = peg$literalExpectation("*", false);
	  var peg$e38 = peg$otherExpectation("whitespace");
	  var peg$e39 = peg$classExpectation([" ", "\t", "\r", "\n"], false, false);

	  var peg$f0 = function(headers, game) { return pgn$4(headers, game) };
	  var peg$f1 = function(tagPairs) { return Object.fromEntries(tagPairs) };
	  var peg$f2 = function(tagName, tagValue) { return [tagName, tagValue] };
	  var peg$f3 = function(root, marker) { return { root, marker} };
	  var peg$f4 = function(comment, moves) { return lineToTree(rootNode(comment), ...moves.flat()) };
	  var peg$f5 = function(san, suffix, nag, comment, variations) { return node(san, suffix, nag, comment, variations) };
	  var peg$f6 = function(nag) { return nag };
	  var peg$f7 = function(comment) { return comment.replace(/[\r\n]+/g, " ") };
	  var peg$f8 = function(comment) { return comment.trim() };
	  var peg$f9 = function(line) { return line };
	  var peg$f10 = function(result, comment) { return { result, comment } };
	  var peg$currPos = options.peg$currPos | 0;
	  var peg$posDetailsCache = [{ line: 1, column: 1 }];
	  var peg$maxFailPos = peg$currPos;
	  var peg$maxFailExpected = options.peg$maxFailExpected || [];
	  var peg$silentFails = options.peg$silentFails | 0;

	  var peg$result;

	  if (options.startRule) {
	    if (!(options.startRule in peg$startRuleFunctions)) {
	      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	    }

	    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	  }

	  function peg$literalExpectation(text, ignoreCase) {
	    return { type: "literal", text: text, ignoreCase: ignoreCase };
	  }

	  function peg$classExpectation(parts, inverted, ignoreCase) {
	    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
	  }

	  function peg$endExpectation() {
	    return { type: "end" };
	  }

	  function peg$otherExpectation(description) {
	    return { type: "other", description: description };
	  }

	  function peg$computePosDetails(pos) {
	    var details = peg$posDetailsCache[pos];
	    var p;

	    if (details) {
	      return details;
	    } else {
	      if (pos >= peg$posDetailsCache.length) {
	        p = peg$posDetailsCache.length - 1;
	      } else {
	        p = pos;
	        while (!peg$posDetailsCache[--p]) {}
	      }

	      details = peg$posDetailsCache[p];
	      details = {
	        line: details.line,
	        column: details.column
	      };

	      while (p < pos) {
	        if (input.charCodeAt(p) === 10) {
	          details.line++;
	          details.column = 1;
	        } else {
	          details.column++;
	        }

	        p++;
	      }

	      peg$posDetailsCache[pos] = details;

	      return details;
	    }
	  }

	  function peg$computeLocation(startPos, endPos, offset) {
	    var startPosDetails = peg$computePosDetails(startPos);
	    var endPosDetails = peg$computePosDetails(endPos);

	    var res = {
	      source: peg$source,
	      start: {
	        offset: startPos,
	        line: startPosDetails.line,
	        column: startPosDetails.column
	      },
	      end: {
	        offset: endPos,
	        line: endPosDetails.line,
	        column: endPosDetails.column
	      }
	    };
	    return res;
	  }

	  function peg$fail(expected) {
	    if (peg$currPos < peg$maxFailPos) { return; }

	    if (peg$currPos > peg$maxFailPos) {
	      peg$maxFailPos = peg$currPos;
	      peg$maxFailExpected = [];
	    }

	    peg$maxFailExpected.push(expected);
	  }

	  function peg$buildStructuredError(expected, found, location) {
	    return new peg$SyntaxError(
	      peg$SyntaxError.buildMessage(expected, found),
	      expected,
	      found,
	      location
	    );
	  }

	  function peg$parsepgn() {
	    var s0, s1, s2;

	    s0 = peg$currPos;
	    s1 = peg$parsetagPairSection();
	    s2 = peg$parsemoveTextSection();
	    s0 = peg$f0(s1, s2);

	    return s0;
	  }

	  function peg$parsetagPairSection() {
	    var s0, s1, s2;

	    s0 = peg$currPos;
	    s1 = [];
	    s2 = peg$parsetagPair();
	    while (s2 !== peg$FAILED) {
	      s1.push(s2);
	      s2 = peg$parsetagPair();
	    }
	    s2 = peg$parse_();
	    s0 = peg$f1(s1);

	    return s0;
	  }

	  function peg$parsetagPair() {
	    var s0, s2, s4, s6, s7, s8, s10;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    peg$parse_();
	    if (input.charCodeAt(peg$currPos) === 91) {
	      s2 = peg$c0;
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e1); }
	    }
	    if (s2 !== peg$FAILED) {
	      peg$parse_();
	      s4 = peg$parsetagName();
	      if (s4 !== peg$FAILED) {
	        peg$parse_();
	        if (input.charCodeAt(peg$currPos) === 34) {
	          s6 = peg$c1;
	          peg$currPos++;
	        } else {
	          s6 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e2); }
	        }
	        if (s6 !== peg$FAILED) {
	          s7 = peg$parsetagValue();
	          if (input.charCodeAt(peg$currPos) === 34) {
	            s8 = peg$c1;
	            peg$currPos++;
	          } else {
	            s8 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$e2); }
	          }
	          if (s8 !== peg$FAILED) {
	            peg$parse_();
	            if (input.charCodeAt(peg$currPos) === 93) {
	              s10 = peg$c2;
	              peg$currPos++;
	            } else {
	              s10 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$e3); }
	            }
	            if (s10 !== peg$FAILED) {
	              s0 = peg$f2(s4, s7);
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      if (peg$silentFails === 0) { peg$fail(peg$e0); }
	    }

	    return s0;
	  }

	  function peg$parsetagName() {
	    var s0, s1, s2;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    s1 = [];
	    s2 = input.charAt(peg$currPos);
	    if (peg$r0.test(s2)) {
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e5); }
	    }
	    if (s2 !== peg$FAILED) {
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        s2 = input.charAt(peg$currPos);
	        if (peg$r0.test(s2)) {
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e5); }
	        }
	      }
	    } else {
	      s1 = peg$FAILED;
	    }
	    if (s1 !== peg$FAILED) {
	      s0 = input.substring(s0, peg$currPos);
	    } else {
	      s0 = s1;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e4); }
	    }

	    return s0;
	  }

	  function peg$parsetagValue() {
	    var s0, s1, s2;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    s1 = [];
	    s2 = input.charAt(peg$currPos);
	    if (peg$r1.test(s2)) {
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e7); }
	    }
	    while (s2 !== peg$FAILED) {
	      s1.push(s2);
	      s2 = input.charAt(peg$currPos);
	      if (peg$r1.test(s2)) {
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e7); }
	      }
	    }
	    s0 = input.substring(s0, peg$currPos);
	    peg$silentFails--;
	    s1 = peg$FAILED;
	    if (peg$silentFails === 0) { peg$fail(peg$e6); }

	    return s0;
	  }

	  function peg$parsemoveTextSection() {
	    var s0, s1, s3;

	    s0 = peg$currPos;
	    s1 = peg$parseline();
	    peg$parse_();
	    s3 = peg$parsegameTerminationMarker();
	    if (s3 === peg$FAILED) {
	      s3 = null;
	    }
	    peg$parse_();
	    s0 = peg$f3(s1, s3);

	    return s0;
	  }

	  function peg$parseline() {
	    var s0, s1, s2, s3;

	    s0 = peg$currPos;
	    s1 = peg$parsecomment();
	    if (s1 === peg$FAILED) {
	      s1 = null;
	    }
	    s2 = [];
	    s3 = peg$parsemove();
	    while (s3 !== peg$FAILED) {
	      s2.push(s3);
	      s3 = peg$parsemove();
	    }
	    s0 = peg$f4(s1, s2);

	    return s0;
	  }

	  function peg$parsemove() {
	    var s0, s4, s5, s6, s7, s8, s9, s10;

	    s0 = peg$currPos;
	    peg$parse_();
	    peg$parsemoveNumber();
	    peg$parse_();
	    s4 = peg$parsesan();
	    if (s4 !== peg$FAILED) {
	      s5 = peg$parsesuffixAnnotation();
	      if (s5 === peg$FAILED) {
	        s5 = null;
	      }
	      s6 = [];
	      s7 = peg$parsenag();
	      while (s7 !== peg$FAILED) {
	        s6.push(s7);
	        s7 = peg$parsenag();
	      }
	      s7 = peg$parse_();
	      s8 = peg$parsecomment();
	      if (s8 === peg$FAILED) {
	        s8 = null;
	      }
	      s9 = [];
	      s10 = peg$parsevariation();
	      while (s10 !== peg$FAILED) {
	        s9.push(s10);
	        s10 = peg$parsevariation();
	      }
	      s0 = peg$f5(s4, s5, s6, s8, s9);
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }

	    return s0;
	  }

	  function peg$parsemoveNumber() {
	    var s0, s1, s2, s3, s4, s5;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    s1 = [];
	    s2 = input.charAt(peg$currPos);
	    if (peg$r2.test(s2)) {
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e9); }
	    }
	    while (s2 !== peg$FAILED) {
	      s1.push(s2);
	      s2 = input.charAt(peg$currPos);
	      if (peg$r2.test(s2)) {
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e9); }
	      }
	    }
	    if (input.charCodeAt(peg$currPos) === 46) {
	      s2 = peg$c3;
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e10); }
	    }
	    if (s2 !== peg$FAILED) {
	      s3 = peg$parse_();
	      s4 = [];
	      s5 = input.charAt(peg$currPos);
	      if (peg$r3.test(s5)) {
	        peg$currPos++;
	      } else {
	        s5 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e11); }
	      }
	      while (s5 !== peg$FAILED) {
	        s4.push(s5);
	        s5 = input.charAt(peg$currPos);
	        if (peg$r3.test(s5)) {
	          peg$currPos++;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e11); }
	        }
	      }
	      s1 = [s1, s2, s3, s4];
	      s0 = s1;
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e8); }
	    }

	    return s0;
	  }

	  function peg$parsesan() {
	    var s0, s1, s2, s3, s4, s5;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    s1 = peg$currPos;
	    if (input.substr(peg$currPos, 5) === peg$c4) {
	      s2 = peg$c4;
	      peg$currPos += 5;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e13); }
	    }
	    if (s2 === peg$FAILED) {
	      if (input.substr(peg$currPos, 3) === peg$c5) {
	        s2 = peg$c5;
	        peg$currPos += 3;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e14); }
	      }
	      if (s2 === peg$FAILED) {
	        if (input.substr(peg$currPos, 5) === peg$c6) {
	          s2 = peg$c6;
	          peg$currPos += 5;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e15); }
	        }
	        if (s2 === peg$FAILED) {
	          if (input.substr(peg$currPos, 3) === peg$c7) {
	            s2 = peg$c7;
	            peg$currPos += 3;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$e16); }
	          }
	          if (s2 === peg$FAILED) {
	            s2 = peg$currPos;
	            s3 = input.charAt(peg$currPos);
	            if (peg$r0.test(s3)) {
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$e5); }
	            }
	            if (s3 !== peg$FAILED) {
	              s4 = [];
	              s5 = input.charAt(peg$currPos);
	              if (peg$r4.test(s5)) {
	                peg$currPos++;
	              } else {
	                s5 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$e17); }
	              }
	              if (s5 !== peg$FAILED) {
	                while (s5 !== peg$FAILED) {
	                  s4.push(s5);
	                  s5 = input.charAt(peg$currPos);
	                  if (peg$r4.test(s5)) {
	                    peg$currPos++;
	                  } else {
	                    s5 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$e17); }
	                  }
	                }
	              } else {
	                s4 = peg$FAILED;
	              }
	              if (s4 !== peg$FAILED) {
	                s3 = [s3, s4];
	                s2 = s3;
	              } else {
	                peg$currPos = s2;
	                s2 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s2;
	              s2 = peg$FAILED;
	            }
	          }
	        }
	      }
	    }
	    if (s2 !== peg$FAILED) {
	      s3 = input.charAt(peg$currPos);
	      if (peg$r5.test(s3)) {
	        peg$currPos++;
	      } else {
	        s3 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e18); }
	      }
	      if (s3 === peg$FAILED) {
	        s3 = null;
	      }
	      s2 = [s2, s3];
	      s1 = s2;
	    } else {
	      peg$currPos = s1;
	      s1 = peg$FAILED;
	    }
	    if (s1 !== peg$FAILED) {
	      s0 = input.substring(s0, peg$currPos);
	    } else {
	      s0 = s1;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e12); }
	    }

	    return s0;
	  }

	  function peg$parsesuffixAnnotation() {
	    var s0, s1, s2;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    s1 = [];
	    s2 = input.charAt(peg$currPos);
	    if (peg$r6.test(s2)) {
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e20); }
	    }
	    while (s2 !== peg$FAILED) {
	      s1.push(s2);
	      if (s1.length >= 2) {
	        s2 = peg$FAILED;
	      } else {
	        s2 = input.charAt(peg$currPos);
	        if (peg$r6.test(s2)) {
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e20); }
	        }
	      }
	    }
	    if (s1.length < 1) {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    } else {
	      s0 = s1;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e19); }
	    }

	    return s0;
	  }

	  function peg$parsenag() {
	    var s0, s2, s3, s4, s5;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    peg$parse_();
	    if (input.charCodeAt(peg$currPos) === 36) {
	      s2 = peg$c8;
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e22); }
	    }
	    if (s2 !== peg$FAILED) {
	      s3 = peg$currPos;
	      s4 = [];
	      s5 = input.charAt(peg$currPos);
	      if (peg$r2.test(s5)) {
	        peg$currPos++;
	      } else {
	        s5 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e9); }
	      }
	      if (s5 !== peg$FAILED) {
	        while (s5 !== peg$FAILED) {
	          s4.push(s5);
	          s5 = input.charAt(peg$currPos);
	          if (peg$r2.test(s5)) {
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$e9); }
	          }
	        }
	      } else {
	        s4 = peg$FAILED;
	      }
	      if (s4 !== peg$FAILED) {
	        s3 = input.substring(s3, peg$currPos);
	      } else {
	        s3 = s4;
	      }
	      if (s3 !== peg$FAILED) {
	        s0 = peg$f6(s3);
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      if (peg$silentFails === 0) { peg$fail(peg$e21); }
	    }

	    return s0;
	  }

	  function peg$parsecomment() {
	    var s0;

	    s0 = peg$parsebraceComment();
	    if (s0 === peg$FAILED) {
	      s0 = peg$parserestOfLineComment();
	    }

	    return s0;
	  }

	  function peg$parsebraceComment() {
	    var s0, s1, s2, s3, s4;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    if (input.charCodeAt(peg$currPos) === 123) {
	      s1 = peg$c9;
	      peg$currPos++;
	    } else {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e24); }
	    }
	    if (s1 !== peg$FAILED) {
	      s2 = peg$currPos;
	      s3 = [];
	      s4 = input.charAt(peg$currPos);
	      if (peg$r7.test(s4)) {
	        peg$currPos++;
	      } else {
	        s4 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e25); }
	      }
	      while (s4 !== peg$FAILED) {
	        s3.push(s4);
	        s4 = input.charAt(peg$currPos);
	        if (peg$r7.test(s4)) {
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e25); }
	        }
	      }
	      s2 = input.substring(s2, peg$currPos);
	      if (input.charCodeAt(peg$currPos) === 125) {
	        s3 = peg$c10;
	        peg$currPos++;
	      } else {
	        s3 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e26); }
	      }
	      if (s3 !== peg$FAILED) {
	        s0 = peg$f7(s2);
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e23); }
	    }

	    return s0;
	  }

	  function peg$parserestOfLineComment() {
	    var s0, s1, s2, s3, s4;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    if (input.charCodeAt(peg$currPos) === 59) {
	      s1 = peg$c11;
	      peg$currPos++;
	    } else {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e28); }
	    }
	    if (s1 !== peg$FAILED) {
	      s2 = peg$currPos;
	      s3 = [];
	      s4 = input.charAt(peg$currPos);
	      if (peg$r8.test(s4)) {
	        peg$currPos++;
	      } else {
	        s4 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e29); }
	      }
	      while (s4 !== peg$FAILED) {
	        s3.push(s4);
	        s4 = input.charAt(peg$currPos);
	        if (peg$r8.test(s4)) {
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e29); }
	        }
	      }
	      s2 = input.substring(s2, peg$currPos);
	      s0 = peg$f8(s2);
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e27); }
	    }

	    return s0;
	  }

	  function peg$parsevariation() {
	    var s0, s2, s3, s5;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    peg$parse_();
	    if (input.charCodeAt(peg$currPos) === 40) {
	      s2 = peg$c12;
	      peg$currPos++;
	    } else {
	      s2 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e31); }
	    }
	    if (s2 !== peg$FAILED) {
	      s3 = peg$parseline();
	      if (s3 !== peg$FAILED) {
	        peg$parse_();
	        if (input.charCodeAt(peg$currPos) === 41) {
	          s5 = peg$c13;
	          peg$currPos++;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e32); }
	        }
	        if (s5 !== peg$FAILED) {
	          s0 = peg$f9(s3);
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      if (peg$silentFails === 0) { peg$fail(peg$e30); }
	    }

	    return s0;
	  }

	  function peg$parsegameTerminationMarker() {
	    var s0, s1, s3;

	    peg$silentFails++;
	    s0 = peg$currPos;
	    if (input.substr(peg$currPos, 3) === peg$c14) {
	      s1 = peg$c14;
	      peg$currPos += 3;
	    } else {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e34); }
	    }
	    if (s1 === peg$FAILED) {
	      if (input.substr(peg$currPos, 3) === peg$c15) {
	        s1 = peg$c15;
	        peg$currPos += 3;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e35); }
	      }
	      if (s1 === peg$FAILED) {
	        if (input.substr(peg$currPos, 7) === peg$c16) {
	          s1 = peg$c16;
	          peg$currPos += 7;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$e36); }
	        }
	        if (s1 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 42) {
	            s1 = peg$c17;
	            peg$currPos++;
	          } else {
	            s1 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$e37); }
	          }
	        }
	      }
	    }
	    if (s1 !== peg$FAILED) {
	      peg$parse_();
	      s3 = peg$parsecomment();
	      if (s3 === peg$FAILED) {
	        s3 = null;
	      }
	      s0 = peg$f10(s1, s3);
	    } else {
	      peg$currPos = s0;
	      s0 = peg$FAILED;
	    }
	    peg$silentFails--;
	    if (s0 === peg$FAILED) {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e33); }
	    }

	    return s0;
	  }

	  function peg$parse_() {
	    var s0, s1;

	    peg$silentFails++;
	    s0 = [];
	    s1 = input.charAt(peg$currPos);
	    if (peg$r9.test(s1)) {
	      peg$currPos++;
	    } else {
	      s1 = peg$FAILED;
	      if (peg$silentFails === 0) { peg$fail(peg$e39); }
	    }
	    while (s1 !== peg$FAILED) {
	      s0.push(s1);
	      s1 = input.charAt(peg$currPos);
	      if (peg$r9.test(s1)) {
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$e39); }
	      }
	    }
	    peg$silentFails--;
	    s1 = peg$FAILED;
	    if (peg$silentFails === 0) { peg$fail(peg$e38); }

	    return s0;
	  }

	  peg$result = peg$startRuleFunction();

	  if (options.peg$library) {
	    return /** @type {any} */ ({
	      peg$result,
	      peg$currPos,
	      peg$FAILED,
	      peg$maxFailExpected,
	      peg$maxFailPos
	    });
	  }
	  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	    return peg$result;
	  } else {
	    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	      peg$fail(peg$endExpectation());
	    }

	    throw peg$buildStructuredError(
	      peg$maxFailExpected,
	      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
	      peg$maxFailPos < input.length
	        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
	        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
	    );
	  }
	}

	/**
	 * @license
	 * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are met:
	 *
	 * 1. Redistributions of source code must retain the above copyright notice,
	 *    this list of conditions and the following disclaimer.
	 * 2. Redistributions in binary form must reproduce the above copyright notice,
	 *    this list of conditions and the following disclaimer in the documentation
	 *    and/or other materials provided with the distribution.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
	 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
	 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
	 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
	 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
	 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
	 * POSSIBILITY OF SUCH DAMAGE.
	 */
	const MASK64 = 0xffffffffffffffffn;
	function rotl(x, k) {
	    return ((x << k) | (x >> (64n - k))) & 0xffffffffffffffffn;
	}
	function wrappingMul(x, y) {
	    return (x * y) & MASK64;
	}
	// xoroshiro128**
	function xoroshiro128(state) {
	    return function () {
	        let s0 = BigInt(state & MASK64);
	        let s1 = BigInt((state >> 64n) & MASK64);
	        const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);
	        s1 ^= s0;
	        s0 = (rotl(s0, 24n) ^ s1 ^ (s1 << 16n)) & MASK64;
	        s1 = rotl(s1, 37n);
	        state = (s1 << 64n) | s0;
	        return result;
	    };
	}
	const rand = xoroshiro128(0xa187eb39cdcaed8f31c4b365b102e01en);
	const PIECE_KEYS = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => rand())));
	const EP_KEYS = Array.from({ length: 8 }, () => rand());
	const CASTLING_KEYS = Array.from({ length: 16 }, () => rand());
	const SIDE_KEY = rand();
	const WHITE = 'w';
	const BLACK = 'b';
	const PAWN = 'p';
	const KNIGHT = 'n';
	const BISHOP = 'b';
	const ROOK = 'r';
	const QUEEN = 'q';
	const KING = 'k';
	const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	class Move {
	    color;
	    from;
	    to;
	    piece;
	    captured;
	    promotion;
	    /**
	     * @deprecated This field is deprecated and will be removed in version 2.0.0.
	     * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
	     * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
	     * `isBigPawn`
	     */
	    flags;
	    san;
	    lan;
	    before;
	    after;
	    constructor(chess, internal) {
	        const { color, piece, from, to, flags, captured, promotion } = internal;
	        const fromAlgebraic = algebraic(from);
	        const toAlgebraic = algebraic(to);
	        this.color = color;
	        this.piece = piece;
	        this.from = fromAlgebraic;
	        this.to = toAlgebraic;
	        /*
	         * HACK: The chess['_method']() calls below invoke private methods in the
	         * Chess class to generate SAN and FEN. It's a bit of a hack, but makes the
	         * code cleaner elsewhere.
	         */
	        this.san = chess['_moveToSan'](internal, chess['_moves']({ legal: true }));
	        this.lan = fromAlgebraic + toAlgebraic;
	        this.before = chess.fen();
	        // Generate the FEN for the 'after' key
	        chess['_makeMove'](internal);
	        this.after = chess.fen();
	        chess['_undoMove']();
	        // Build the text representation of the move flags
	        this.flags = '';
	        for (const flag in BITS) {
	            if (BITS[flag] & flags) {
	                this.flags += FLAGS[flag];
	            }
	        }
	        if (captured) {
	            this.captured = captured;
	        }
	        if (promotion) {
	            this.promotion = promotion;
	            this.lan += promotion;
	        }
	    }
	    isCapture() {
	        return this.flags.indexOf(FLAGS['CAPTURE']) > -1;
	    }
	    isPromotion() {
	        return this.flags.indexOf(FLAGS['PROMOTION']) > -1;
	    }
	    isEnPassant() {
	        return this.flags.indexOf(FLAGS['EP_CAPTURE']) > -1;
	    }
	    isKingsideCastle() {
	        return this.flags.indexOf(FLAGS['KSIDE_CASTLE']) > -1;
	    }
	    isQueensideCastle() {
	        return this.flags.indexOf(FLAGS['QSIDE_CASTLE']) > -1;
	    }
	    isBigPawn() {
	        return this.flags.indexOf(FLAGS['BIG_PAWN']) > -1;
	    }
	}
	const EMPTY = -1;
	const FLAGS = {
	    NORMAL: 'n',
	    CAPTURE: 'c',
	    BIG_PAWN: 'b',
	    EP_CAPTURE: 'e',
	    PROMOTION: 'p',
	    KSIDE_CASTLE: 'k',
	    QSIDE_CASTLE: 'q',
	    NULL_MOVE: '-',
	};
	// prettier-ignore
	const SQUARES = [
	    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
	    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
	    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
	    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
	    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
	    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
	    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
	    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
	];
	const BITS = {
	    NORMAL: 1,
	    CAPTURE: 2,
	    BIG_PAWN: 4,
	    EP_CAPTURE: 8,
	    PROMOTION: 16,
	    KSIDE_CASTLE: 32,
	    QSIDE_CASTLE: 64,
	    NULL_MOVE: 128,
	};
	/* eslint-disable @typescript-eslint/naming-convention */
	// these are required, according to spec
	const SEVEN_TAG_ROSTER = {
	    Event: '?',
	    Site: '?',
	    Date: '????.??.??',
	    Round: '?',
	    White: '?',
	    Black: '?',
	    Result: '*',
	};
	/**
	 * These nulls are placeholders to fix the order of tags (as they appear in PGN spec); null values will be
	 * eliminated in getHeaders()
	 */
	const SUPLEMENTAL_TAGS = {
	    WhiteTitle: null,
	    BlackTitle: null,
	    WhiteElo: null,
	    BlackElo: null,
	    WhiteUSCF: null,
	    BlackUSCF: null,
	    WhiteNA: null,
	    BlackNA: null,
	    WhiteType: null,
	    BlackType: null,
	    EventDate: null,
	    EventSponsor: null,
	    Section: null,
	    Stage: null,
	    Board: null,
	    Opening: null,
	    Variation: null,
	    SubVariation: null,
	    ECO: null,
	    NIC: null,
	    Time: null,
	    UTCTime: null,
	    UTCDate: null,
	    TimeControl: null,
	    SetUp: null,
	    FEN: null,
	    Termination: null,
	    Annotator: null,
	    Mode: null,
	    PlyCount: null,
	};
	const HEADER_TEMPLATE = {
	    ...SEVEN_TAG_ROSTER,
	    ...SUPLEMENTAL_TAGS,
	};
	/* eslint-enable @typescript-eslint/naming-convention */
	/*
	 * NOTES ABOUT 0x88 MOVE GENERATION ALGORITHM
	 * ----------------------------------------------------------------------------
	 * From https://github.com/jhlywa/chess.js/issues/230
	 *
	 * A lot of people are confused when they first see the internal representation
	 * of chess.js. It uses the 0x88 Move Generation Algorithm which internally
	 * stores the board as an 8x16 array. This is purely for efficiency but has a
	 * couple of interesting benefits:
	 *
	 * 1. 0x88 offers a very inexpensive "off the board" check. Bitwise AND (&) any
	 *    square with 0x88, if the result is non-zero then the square is off the
	 *    board. For example, assuming a knight square A8 (0 in 0x88 notation),
	 *    there are 8 possible directions in which the knight can move. These
	 *    directions are relative to the 8x16 board and are stored in the
	 *    PIECE_OFFSETS map. One possible move is A8 - 18 (up one square, and two
	 *    squares to the left - which is off the board). 0 - 18 = -18 & 0x88 = 0x88
	 *    (because of two-complement representation of -18). The non-zero result
	 *    means the square is off the board and the move is illegal. Take the
	 *    opposite move (from A8 to C7), 0 + 18 = 18 & 0x88 = 0. A result of zero
	 *    means the square is on the board.
	 *
	 * 2. The relative distance (or difference) between two squares on a 8x16 board
	 *    is unique and can be used to inexpensively determine if a piece on a
	 *    square can attack any other arbitrary square. For example, let's see if a
	 *    pawn on E7 can attack E2. The difference between E7 (20) - E2 (100) is
	 *    -80. We add 119 to make the ATTACKS array index non-negative (because the
	 *    worst case difference is A8 - H1 = -119). The ATTACKS array contains a
	 *    bitmask of pieces that can attack from that distance and direction.
	 *    ATTACKS[-80 + 119=39] gives us 24 or 0b11000 in binary. Look at the
	 *    PIECE_MASKS map to determine the mask for a given piece type. In our pawn
	 *    example, we would check to see if 24 & 0x1 is non-zero, which it is
	 *    not. So, naturally, a pawn on E7 can't attack a piece on E2. However, a
	 *    rook can since 24 & 0x8 is non-zero. The only thing left to check is that
	 *    there are no blocking pieces between E7 and E2. That's where the RAYS
	 *    array comes in. It provides an offset (in this case 16) to add to E7 (20)
	 *    to check for blocking pieces. E7 (20) + 16 = E6 (36) + 16 = E5 (52) etc.
	 */
	// prettier-ignore
	// eslint-disable-next-line
	const Ox88 = {
	    a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
	    a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
	    a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
	    a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
	    a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
	    a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
	    a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
	    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
	};
	const PAWN_OFFSETS = {
	    b: [16, 32, 17, 15],
	    w: [-16, -32, -17, -15],
	};
	const PIECE_OFFSETS = {
	    n: [-18, -33, -31, -14, 18, 33, 31, 14],
	    b: [-17, -15, 17, 15],
	    r: [-16, 1, 16, -1],
	    q: [-17, -16, -15, 1, 17, 16, 15, -1],
	    k: [-17, -16, -15, 1, 17, 16, 15, -1],
	};
	// prettier-ignore
	const ATTACKS = [
	    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
	    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
	    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
	    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
	    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
	    24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
	    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
	    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
	    0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
	    0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
	    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
	];
	// prettier-ignore
	const RAYS = [
	    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
	    0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
	    0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
	    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
	    0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
	    0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
	    0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
	    0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
	    0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
	    -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
	];
	const PIECE_MASKS = { p: 0x1, n: 0x2, b: 0x4, r: 0x8, q: 0x10, k: 0x20 };
	const SYMBOLS = 'pnbrqkPNBRQK';
	const PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];
	const RANK_1 = 7;
	const RANK_2 = 6;
	/*
	 * const RANK_3 = 5
	 * const RANK_4 = 4
	 * const RANK_5 = 3
	 * const RANK_6 = 2
	 */
	const RANK_7 = 1;
	const RANK_8 = 0;
	const SIDES = {
	    [KING]: BITS.KSIDE_CASTLE,
	    [QUEEN]: BITS.QSIDE_CASTLE,
	};
	const ROOKS = {
	    w: [
	        { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
	        { square: Ox88.h1, flag: BITS.KSIDE_CASTLE },
	    ],
	    b: [
	        { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
	        { square: Ox88.h8, flag: BITS.KSIDE_CASTLE },
	    ],
	};
	const SECOND_RANK = { b: RANK_7, w: RANK_2 };
	const SAN_NULLMOVE = '--';
	// Extracts the zero-based rank of an 0x88 square.
	function rank(square) {
	    return square >> 4;
	}
	// Extracts the zero-based file of an 0x88 square.
	function file(square) {
	    return square & 0xf;
	}
	function isDigit(c) {
	    return '0123456789'.indexOf(c) !== -1;
	}
	// Converts a 0x88 square to algebraic notation.
	function algebraic(square) {
	    const f = file(square);
	    const r = rank(square);
	    return ('abcdefgh'.substring(f, f + 1) +
	        '87654321'.substring(r, r + 1));
	}
	function swapColor(color) {
	    return color === WHITE ? BLACK : WHITE;
	}
	function validateFen(fen) {
	    // 1st criterion: 6 space-seperated fields?
	    const tokens = fen.split(/\s+/);
	    if (tokens.length !== 6) {
	        return {
	            ok: false,
	            error: 'Invalid FEN: must contain six space-delimited fields',
	        };
	    }
	    // 2nd criterion: move number field is a integer value > 0?
	    const moveNumber = parseInt(tokens[5], 10);
	    if (isNaN(moveNumber) || moveNumber <= 0) {
	        return {
	            ok: false,
	            error: 'Invalid FEN: move number must be a positive integer',
	        };
	    }
	    // 3rd criterion: half move counter is an integer >= 0?
	    const halfMoves = parseInt(tokens[4], 10);
	    if (isNaN(halfMoves) || halfMoves < 0) {
	        return {
	            ok: false,
	            error: 'Invalid FEN: half move counter number must be a non-negative integer',
	        };
	    }
	    // 4th criterion: 4th field is a valid e.p.-string?
	    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
	        return { ok: false, error: 'Invalid FEN: en-passant square is invalid' };
	    }
	    // 5th criterion: 3th field is a valid castle-string?
	    if (/[^kKqQ-]/.test(tokens[2])) {
	        return { ok: false, error: 'Invalid FEN: castling availability is invalid' };
	    }
	    // 6th criterion: 2nd field is "w" (white) or "b" (black)?
	    if (!/^(w|b)$/.test(tokens[1])) {
	        return { ok: false, error: 'Invalid FEN: side-to-move is invalid' };
	    }
	    // 7th criterion: 1st field contains 8 rows?
	    const rows = tokens[0].split('/');
	    if (rows.length !== 8) {
	        return {
	            ok: false,
	            error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows",
	        };
	    }
	    // 8th criterion: every row is valid?
	    for (let i = 0; i < rows.length; i++) {
	        // check for right sum of fields AND not two numbers in succession
	        let sumFields = 0;
	        let previousWasNumber = false;
	        for (let k = 0; k < rows[i].length; k++) {
	            if (isDigit(rows[i][k])) {
	                if (previousWasNumber) {
	                    return {
	                        ok: false,
	                        error: 'Invalid FEN: piece data is invalid (consecutive number)',
	                    };
	                }
	                sumFields += parseInt(rows[i][k], 10);
	                previousWasNumber = true;
	            }
	            else {
	                if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
	                    return {
	                        ok: false,
	                        error: 'Invalid FEN: piece data is invalid (invalid piece)',
	                    };
	                }
	                sumFields += 1;
	                previousWasNumber = false;
	            }
	        }
	        if (sumFields !== 8) {
	            return {
	                ok: false,
	                error: 'Invalid FEN: piece data is invalid (too many squares in rank)',
	            };
	        }
	    }
	    // 9th criterion: is en-passant square legal?
	    if ((tokens[3][1] == '3' && tokens[1] == 'w') ||
	        (tokens[3][1] == '6' && tokens[1] == 'b')) {
	        return { ok: false, error: 'Invalid FEN: illegal en-passant square' };
	    }
	    // 10th criterion: does chess position contain exact two kings?
	    const kings = [
	        { color: 'white', regex: /K/g },
	        { color: 'black', regex: /k/g },
	    ];
	    for (const { color, regex } of kings) {
	        if (!regex.test(tokens[0])) {
	            return { ok: false, error: `Invalid FEN: missing ${color} king` };
	        }
	        if ((tokens[0].match(regex) || []).length > 1) {
	            return { ok: false, error: `Invalid FEN: too many ${color} kings` };
	        }
	    }
	    // 11th criterion: are any pawns on the first or eighth rows?
	    if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === 'P')) {
	        return {
	            ok: false,
	            error: 'Invalid FEN: some pawns are on the edge rows',
	        };
	    }
	    return { ok: true };
	}
	// this function is used to uniquely identify ambiguous moves
	function getDisambiguator(move, moves) {
	    const from = move.from;
	    const to = move.to;
	    const piece = move.piece;
	    let ambiguities = 0;
	    let sameRank = 0;
	    let sameFile = 0;
	    for (let i = 0, len = moves.length; i < len; i++) {
	        const ambigFrom = moves[i].from;
	        const ambigTo = moves[i].to;
	        const ambigPiece = moves[i].piece;
	        /*
	         * if a move of the same piece type ends on the same to square, we'll need
	         * to add a disambiguator to the algebraic notation
	         */
	        if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
	            ambiguities++;
	            if (rank(from) === rank(ambigFrom)) {
	                sameRank++;
	            }
	            if (file(from) === file(ambigFrom)) {
	                sameFile++;
	            }
	        }
	    }
	    if (ambiguities > 0) {
	        if (sameRank > 0 && sameFile > 0) {
	            /*
	             * if there exists a similar moving piece on the same rank and file as
	             * the move in question, use the square as the disambiguator
	             */
	            return algebraic(from);
	        }
	        else if (sameFile > 0) {
	            /*
	             * if the moving piece rests on the same file, use the rank symbol as the
	             * disambiguator
	             */
	            return algebraic(from).charAt(1);
	        }
	        else {
	            // else use the file symbol
	            return algebraic(from).charAt(0);
	        }
	    }
	    return '';
	}
	function addMove(moves, color, from, to, piece, captured = undefined, flags = BITS.NORMAL) {
	    const r = rank(to);
	    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
	        for (let i = 0; i < PROMOTIONS.length; i++) {
	            const promotion = PROMOTIONS[i];
	            moves.push({
	                color,
	                from,
	                to,
	                piece,
	                captured,
	                promotion,
	                flags: flags | BITS.PROMOTION,
	            });
	        }
	    }
	    else {
	        moves.push({
	            color,
	            from,
	            to,
	            piece,
	            captured,
	            flags,
	        });
	    }
	}
	function inferPieceType(san) {
	    let pieceType = san.charAt(0);
	    if (pieceType >= 'a' && pieceType <= 'h') {
	        const matches = san.match(/[a-h]\d.*[a-h]\d/);
	        if (matches) {
	            return undefined;
	        }
	        return PAWN;
	    }
	    pieceType = pieceType.toLowerCase();
	    if (pieceType === 'o') {
	        return KING;
	    }
	    return pieceType;
	}
	// parses all of the decorators out of a SAN string
	function strippedSan(move) {
	    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
	}
	class Chess {
	    _board = new Array(128);
	    _turn = WHITE;
	    _header = {};
	    _kings = { w: EMPTY, b: EMPTY };
	    _epSquare = -1;
	    _halfMoves = 0;
	    _moveNumber = 0;
	    _history = [];
	    _comments = {};
	    _castling = { w: 0, b: 0 };
	    _hash = 0n;
	    // tracks number of times a position has been seen for repetition checking
	    _positionCount = new Map();
	    constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {
	        this.load(fen, { skipValidation });
	    }
	    clear({ preserveHeaders = false } = {}) {
	        this._board = new Array(128);
	        this._kings = { w: EMPTY, b: EMPTY };
	        this._turn = WHITE;
	        this._castling = { w: 0, b: 0 };
	        this._epSquare = EMPTY;
	        this._halfMoves = 0;
	        this._moveNumber = 1;
	        this._history = [];
	        this._comments = {};
	        this._header = preserveHeaders ? this._header : { ...HEADER_TEMPLATE };
	        this._hash = this._computeHash();
	        this._positionCount = new Map();
	        /*
	         * Delete the SetUp and FEN headers (if preserved), the board is empty and
	         * these headers don't make sense in this state. They'll get added later
	         * via .load() or .put()
	         */
	        this._header['SetUp'] = null;
	        this._header['FEN'] = null;
	    }
	    load(fen, { skipValidation = false, preserveHeaders = false } = {}) {
	        let tokens = fen.split(/\s+/);
	        // append commonly omitted fen tokens
	        if (tokens.length >= 2 && tokens.length < 6) {
	            const adjustments = ['-', '-', '0', '1'];
	            fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(' ');
	        }
	        tokens = fen.split(/\s+/);
	        if (!skipValidation) {
	            const { ok, error } = validateFen(fen);
	            if (!ok) {
	                throw new Error(error);
	            }
	        }
	        const position = tokens[0];
	        let square = 0;
	        this.clear({ preserveHeaders });
	        for (let i = 0; i < position.length; i++) {
	            const piece = position.charAt(i);
	            if (piece === '/') {
	                square += 8;
	            }
	            else if (isDigit(piece)) {
	                square += parseInt(piece, 10);
	            }
	            else {
	                const color = piece < 'a' ? WHITE : BLACK;
	                this._put({ type: piece.toLowerCase(), color }, algebraic(square));
	                square++;
	            }
	        }
	        this._turn = tokens[1];
	        if (tokens[2].indexOf('K') > -1) {
	            this._castling.w |= BITS.KSIDE_CASTLE;
	        }
	        if (tokens[2].indexOf('Q') > -1) {
	            this._castling.w |= BITS.QSIDE_CASTLE;
	        }
	        if (tokens[2].indexOf('k') > -1) {
	            this._castling.b |= BITS.KSIDE_CASTLE;
	        }
	        if (tokens[2].indexOf('q') > -1) {
	            this._castling.b |= BITS.QSIDE_CASTLE;
	        }
	        this._epSquare = tokens[3] === '-' ? EMPTY : Ox88[tokens[3]];
	        this._halfMoves = parseInt(tokens[4], 10);
	        this._moveNumber = parseInt(tokens[5], 10);
	        this._hash = this._computeHash();
	        this._updateSetup(fen);
	        this._incPositionCount();
	    }
	    fen({ forceEnpassantSquare = false, } = {}) {
	        let empty = 0;
	        let fen = '';
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            if (this._board[i]) {
	                if (empty > 0) {
	                    fen += empty;
	                    empty = 0;
	                }
	                const { color, type: piece } = this._board[i];
	                fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
	            }
	            else {
	                empty++;
	            }
	            if ((i + 1) & 0x88) {
	                if (empty > 0) {
	                    fen += empty;
	                }
	                if (i !== Ox88.h1) {
	                    fen += '/';
	                }
	                empty = 0;
	                i += 8;
	            }
	        }
	        let castling = '';
	        if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
	            castling += 'K';
	        }
	        if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
	            castling += 'Q';
	        }
	        if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
	            castling += 'k';
	        }
	        if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
	            castling += 'q';
	        }
	        // do we have an empty castling flag?
	        castling = castling || '-';
	        let epSquare = '-';
	        /*
	         * only print the ep square if en passant is a valid move (pawn is present
	         * and ep capture is not pinned)
	         */
	        if (this._epSquare !== EMPTY) {
	            if (forceEnpassantSquare) {
	                epSquare = algebraic(this._epSquare);
	            }
	            else {
	                const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
	                const squares = [bigPawnSquare + 1, bigPawnSquare - 1];
	                for (const square of squares) {
	                    // is the square off the board?
	                    if (square & 0x88) {
	                        continue;
	                    }
	                    const color = this._turn;
	                    // is there a pawn that can capture the epSquare?
	                    if (this._board[square]?.color === color &&
	                        this._board[square]?.type === PAWN) {
	                        // if the pawn makes an ep capture, does it leave its king in check?
	                        this._makeMove({
	                            color,
	                            from: square,
	                            to: this._epSquare,
	                            piece: PAWN,
	                            captured: PAWN,
	                            flags: BITS.EP_CAPTURE,
	                        });
	                        const isLegal = !this._isKingAttacked(color);
	                        this._undoMove();
	                        // if ep is legal, break and set the ep square in the FEN output
	                        if (isLegal) {
	                            epSquare = algebraic(this._epSquare);
	                            break;
	                        }
	                    }
	                }
	            }
	        }
	        return [
	            fen,
	            this._turn,
	            castling,
	            epSquare,
	            this._halfMoves,
	            this._moveNumber,
	        ].join(' ');
	    }
	    _pieceKey(i) {
	        if (!this._board[i]) {
	            return 0n;
	        }
	        const { color, type } = this._board[i];
	        const colorIndex = {
	            w: 0,
	            b: 1,
	        }[color];
	        const typeIndex = {
	            p: 0,
	            n: 1,
	            b: 2,
	            r: 3,
	            q: 4,
	            k: 5,
	        }[type];
	        return PIECE_KEYS[colorIndex][typeIndex][i];
	    }
	    _epKey() {
	        return this._epSquare === EMPTY ? 0n : EP_KEYS[this._epSquare & 7];
	    }
	    _castlingKey() {
	        const index = (this._castling.w >> 5) | (this._castling.b >> 3);
	        return CASTLING_KEYS[index];
	    }
	    _computeHash() {
	        let hash = 0n;
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            // did we run off the end of the board
	            if (i & 0x88) {
	                i += 7;
	                continue;
	            }
	            if (this._board[i]) {
	                hash ^= this._pieceKey(i);
	            }
	        }
	        hash ^= this._epKey();
	        hash ^= this._castlingKey();
	        if (this._turn === 'b') {
	            hash ^= SIDE_KEY;
	        }
	        return hash;
	    }
	    /*
	     * Called when the initial board setup is changed with put() or remove().
	     * modifies the SetUp and FEN properties of the header object. If the FEN
	     * is equal to the default position, the SetUp and FEN are deleted the setup
	     * is only updated if history.length is zero, ie moves haven't been made.
	     */
	    _updateSetup(fen) {
	        if (this._history.length > 0)
	            return;
	        if (fen !== DEFAULT_POSITION) {
	            this._header['SetUp'] = '1';
	            this._header['FEN'] = fen;
	        }
	        else {
	            this._header['SetUp'] = null;
	            this._header['FEN'] = null;
	        }
	    }
	    reset() {
	        this.load(DEFAULT_POSITION);
	    }
	    get(square) {
	        return this._board[Ox88[square]];
	    }
	    findPiece(piece) {
	        const squares = [];
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            // did we run off the end of the board
	            if (i & 0x88) {
	                i += 7;
	                continue;
	            }
	            // if empty square or wrong color
	            if (!this._board[i] || this._board[i]?.color !== piece.color) {
	                continue;
	            }
	            // check if square contains the requested piece
	            if (this._board[i].color === piece.color &&
	                this._board[i].type === piece.type) {
	                squares.push(algebraic(i));
	            }
	        }
	        return squares;
	    }
	    put({ type, color }, square) {
	        if (this._put({ type, color }, square)) {
	            this._updateCastlingRights();
	            this._updateEnPassantSquare();
	            this._updateSetup(this.fen());
	            return true;
	        }
	        return false;
	    }
	    _set(sq, piece) {
	        this._hash ^= this._pieceKey(sq);
	        this._board[sq] = piece;
	        this._hash ^= this._pieceKey(sq);
	    }
	    _put({ type, color }, square) {
	        // check for piece
	        if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
	            return false;
	        }
	        // check for valid square
	        if (!(square in Ox88)) {
	            return false;
	        }
	        const sq = Ox88[square];
	        // don't let the user place more than one king
	        if (type == KING &&
	            !(this._kings[color] == EMPTY || this._kings[color] == sq)) {
	            return false;
	        }
	        const currentPieceOnSquare = this._board[sq];
	        // if one of the kings will be replaced by the piece from args, set the `_kings` respective entry to `EMPTY`
	        if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {
	            this._kings[currentPieceOnSquare.color] = EMPTY;
	        }
	        this._set(sq, { type: type, color: color });
	        if (type === KING) {
	            this._kings[color] = sq;
	        }
	        return true;
	    }
	    _clear(sq) {
	        this._hash ^= this._pieceKey(sq);
	        delete this._board[sq];
	    }
	    remove(square) {
	        const piece = this.get(square);
	        this._clear(Ox88[square]);
	        if (piece && piece.type === KING) {
	            this._kings[piece.color] = EMPTY;
	        }
	        this._updateCastlingRights();
	        this._updateEnPassantSquare();
	        this._updateSetup(this.fen());
	        return piece;
	    }
	    _updateCastlingRights() {
	        this._hash ^= this._castlingKey();
	        const whiteKingInPlace = this._board[Ox88.e1]?.type === KING &&
	            this._board[Ox88.e1]?.color === WHITE;
	        const blackKingInPlace = this._board[Ox88.e8]?.type === KING &&
	            this._board[Ox88.e8]?.color === BLACK;
	        if (!whiteKingInPlace ||
	            this._board[Ox88.a1]?.type !== ROOK ||
	            this._board[Ox88.a1]?.color !== WHITE) {
	            this._castling.w &= -65;
	        }
	        if (!whiteKingInPlace ||
	            this._board[Ox88.h1]?.type !== ROOK ||
	            this._board[Ox88.h1]?.color !== WHITE) {
	            this._castling.w &= -33;
	        }
	        if (!blackKingInPlace ||
	            this._board[Ox88.a8]?.type !== ROOK ||
	            this._board[Ox88.a8]?.color !== BLACK) {
	            this._castling.b &= -65;
	        }
	        if (!blackKingInPlace ||
	            this._board[Ox88.h8]?.type !== ROOK ||
	            this._board[Ox88.h8]?.color !== BLACK) {
	            this._castling.b &= -33;
	        }
	        this._hash ^= this._castlingKey();
	    }
	    _updateEnPassantSquare() {
	        if (this._epSquare === EMPTY) {
	            return;
	        }
	        const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
	        const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
	        const attackers = [currentSquare + 1, currentSquare - 1];
	        if (this._board[startSquare] !== null ||
	            this._board[this._epSquare] !== null ||
	            this._board[currentSquare]?.color !== swapColor(this._turn) ||
	            this._board[currentSquare]?.type !== PAWN) {
	            this._hash ^= this._epKey();
	            this._epSquare = EMPTY;
	            return;
	        }
	        const canCapture = (square) => !(square & 0x88) &&
	            this._board[square]?.color === this._turn &&
	            this._board[square]?.type === PAWN;
	        if (!attackers.some(canCapture)) {
	            this._hash ^= this._epKey();
	            this._epSquare = EMPTY;
	        }
	    }
	    _attacked(color, square, verbose) {
	        const attackers = [];
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            // did we run off the end of the board
	            if (i & 0x88) {
	                i += 7;
	                continue;
	            }
	            // if empty square or wrong color
	            if (this._board[i] === undefined || this._board[i].color !== color) {
	                continue;
	            }
	            const piece = this._board[i];
	            const difference = i - square;
	            // skip - to/from square are the same
	            if (difference === 0) {
	                continue;
	            }
	            const index = difference + 119;
	            if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
	                if (piece.type === PAWN) {
	                    if ((difference > 0 && piece.color === WHITE) ||
	                        (difference <= 0 && piece.color === BLACK)) {
	                        if (!verbose) {
	                            return true;
	                        }
	                        else {
	                            attackers.push(algebraic(i));
	                        }
	                    }
	                    continue;
	                }
	                // if the piece is a knight or a king
	                if (piece.type === 'n' || piece.type === 'k') {
	                    if (!verbose) {
	                        return true;
	                    }
	                    else {
	                        attackers.push(algebraic(i));
	                        continue;
	                    }
	                }
	                const offset = RAYS[index];
	                let j = i + offset;
	                let blocked = false;
	                while (j !== square) {
	                    if (this._board[j] != null) {
	                        blocked = true;
	                        break;
	                    }
	                    j += offset;
	                }
	                if (!blocked) {
	                    if (!verbose) {
	                        return true;
	                    }
	                    else {
	                        attackers.push(algebraic(i));
	                        continue;
	                    }
	                }
	            }
	        }
	        if (verbose) {
	            return attackers;
	        }
	        else {
	            return false;
	        }
	    }
	    attackers(square, attackedBy) {
	        if (!attackedBy) {
	            return this._attacked(this._turn, Ox88[square], true);
	        }
	        else {
	            return this._attacked(attackedBy, Ox88[square], true);
	        }
	    }
	    _isKingAttacked(color) {
	        const square = this._kings[color];
	        return square === -1 ? false : this._attacked(swapColor(color), square);
	    }
	    hash() {
	        return this._hash.toString(16);
	    }
	    isAttacked(square, attackedBy) {
	        return this._attacked(attackedBy, Ox88[square]);
	    }
	    isCheck() {
	        return this._isKingAttacked(this._turn);
	    }
	    inCheck() {
	        return this.isCheck();
	    }
	    isCheckmate() {
	        return this.isCheck() && this._moves().length === 0;
	    }
	    isStalemate() {
	        return !this.isCheck() && this._moves().length === 0;
	    }
	    isInsufficientMaterial() {
	        /*
	         * k.b. vs k.b. (of opposite colors) with mate in 1:
	         * 8/8/8/8/1b6/8/B1k5/K7 b - - 0 1
	         *
	         * k.b. vs k.n. with mate in 1:
	         * 8/8/8/8/1n6/8/B7/K1k5 b - - 2 1
	         */
	        const pieces = {
	            b: 0,
	            n: 0,
	            r: 0,
	            q: 0,
	            k: 0,
	            p: 0,
	        };
	        const bishops = [];
	        let numPieces = 0;
	        let squareColor = 0;
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            squareColor = (squareColor + 1) % 2;
	            if (i & 0x88) {
	                i += 7;
	                continue;
	            }
	            const piece = this._board[i];
	            if (piece) {
	                pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
	                if (piece.type === BISHOP) {
	                    bishops.push(squareColor);
	                }
	                numPieces++;
	            }
	        }
	        // k vs. k
	        if (numPieces === 2) {
	            return true;
	        }
	        else if (
	        // k vs. kn .... or .... k vs. kb
	        numPieces === 3 &&
	            (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) {
	            return true;
	        }
	        else if (numPieces === pieces[BISHOP] + 2) {
	            // kb vs. kb where any number of bishops are all on the same color
	            let sum = 0;
	            const len = bishops.length;
	            for (let i = 0; i < len; i++) {
	                sum += bishops[i];
	            }
	            if (sum === 0 || sum === len) {
	                return true;
	            }
	        }
	        return false;
	    }
	    isThreefoldRepetition() {
	        return this._getPositionCount(this._hash) >= 3;
	    }
	    isDrawByFiftyMoves() {
	        return this._halfMoves >= 100; // 50 moves per side = 100 half moves
	    }
	    isDraw() {
	        return (this.isDrawByFiftyMoves() ||
	            this.isStalemate() ||
	            this.isInsufficientMaterial() ||
	            this.isThreefoldRepetition());
	    }
	    isGameOver() {
	        return this.isCheckmate() || this.isDraw();
	    }
	    moves({ verbose = false, square = undefined, piece = undefined, } = {}) {
	        const moves = this._moves({ square, piece });
	        if (verbose) {
	            return moves.map((move) => new Move(this, move));
	        }
	        else {
	            return moves.map((move) => this._moveToSan(move, moves));
	        }
	    }
	    _moves({ legal = true, piece = undefined, square = undefined, } = {}) {
	        const forSquare = square ? square.toLowerCase() : undefined;
	        const forPiece = piece?.toLowerCase();
	        const moves = [];
	        const us = this._turn;
	        const them = swapColor(us);
	        let firstSquare = Ox88.a8;
	        let lastSquare = Ox88.h1;
	        let singleSquare = false;
	        // are we generating moves for a single square?
	        if (forSquare) {
	            // illegal square, return empty moves
	            if (!(forSquare in Ox88)) {
	                return [];
	            }
	            else {
	                firstSquare = lastSquare = Ox88[forSquare];
	                singleSquare = true;
	            }
	        }
	        for (let from = firstSquare; from <= lastSquare; from++) {
	            // did we run off the end of the board
	            if (from & 0x88) {
	                from += 7;
	                continue;
	            }
	            // empty square or opponent, skip
	            if (!this._board[from] || this._board[from].color === them) {
	                continue;
	            }
	            const { type } = this._board[from];
	            let to;
	            if (type === PAWN) {
	                if (forPiece && forPiece !== type)
	                    continue;
	                // single square, non-capturing
	                to = from + PAWN_OFFSETS[us][0];
	                if (!this._board[to]) {
	                    addMove(moves, us, from, to, PAWN);
	                    // double square
	                    to = from + PAWN_OFFSETS[us][1];
	                    if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
	                        addMove(moves, us, from, to, PAWN, undefined, BITS.BIG_PAWN);
	                    }
	                }
	                // pawn captures
	                for (let j = 2; j < 4; j++) {
	                    to = from + PAWN_OFFSETS[us][j];
	                    if (to & 0x88)
	                        continue;
	                    if (this._board[to]?.color === them) {
	                        addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);
	                    }
	                    else if (to === this._epSquare) {
	                        addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);
	                    }
	                }
	            }
	            else {
	                if (forPiece && forPiece !== type)
	                    continue;
	                for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
	                    const offset = PIECE_OFFSETS[type][j];
	                    to = from;
	                    while (true) {
	                        to += offset;
	                        if (to & 0x88)
	                            break;
	                        if (!this._board[to]) {
	                            addMove(moves, us, from, to, type);
	                        }
	                        else {
	                            // own color, stop loop
	                            if (this._board[to].color === us)
	                                break;
	                            addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);
	                            break;
	                        }
	                        /* break, if knight or king */
	                        if (type === KNIGHT || type === KING)
	                            break;
	                    }
	                }
	            }
	        }
	        /*
	         * check for castling if we're:
	         *   a) generating all moves, or
	         *   b) doing single square move generation on the king's square
	         */
	        if (forPiece === undefined || forPiece === KING) {
	            if (!singleSquare || lastSquare === this._kings[us]) {
	                // king-side castling
	                if (this._castling[us] & BITS.KSIDE_CASTLE) {
	                    const castlingFrom = this._kings[us];
	                    const castlingTo = castlingFrom + 2;
	                    if (!this._board[castlingFrom + 1] &&
	                        !this._board[castlingTo] &&
	                        !this._attacked(them, this._kings[us]) &&
	                        !this._attacked(them, castlingFrom + 1) &&
	                        !this._attacked(them, castlingTo)) {
	                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.KSIDE_CASTLE);
	                    }
	                }
	                // queen-side castling
	                if (this._castling[us] & BITS.QSIDE_CASTLE) {
	                    const castlingFrom = this._kings[us];
	                    const castlingTo = castlingFrom - 2;
	                    if (!this._board[castlingFrom - 1] &&
	                        !this._board[castlingFrom - 2] &&
	                        !this._board[castlingFrom - 3] &&
	                        !this._attacked(them, this._kings[us]) &&
	                        !this._attacked(them, castlingFrom - 1) &&
	                        !this._attacked(them, castlingTo)) {
	                        addMove(moves, us, this._kings[us], castlingTo, KING, undefined, BITS.QSIDE_CASTLE);
	                    }
	                }
	            }
	        }
	        /*
	         * return all pseudo-legal moves (this includes moves that allow the king
	         * to be captured)
	         */
	        if (!legal || this._kings[us] === -1) {
	            return moves;
	        }
	        // filter out illegal moves
	        const legalMoves = [];
	        for (let i = 0, len = moves.length; i < len; i++) {
	            this._makeMove(moves[i]);
	            if (!this._isKingAttacked(us)) {
	                legalMoves.push(moves[i]);
	            }
	            this._undoMove();
	        }
	        return legalMoves;
	    }
	    move(move, { strict = false } = {}) {
	        /*
	         * The move function can be called with in the following parameters:
	         *
	         * .move('Nxb7')       <- argument is a case-sensitive SAN string
	         *
	         * .move({ from: 'h7', <- argument is a move object
	         *         to :'h8',
	         *         promotion: 'q' })
	         *
	         *
	         * An optional strict argument may be supplied to tell chess.js to
	         * strictly follow the SAN specification.
	         */
	        let moveObj = null;
	        if (typeof move === 'string') {
	            moveObj = this._moveFromSan(move, strict);
	        }
	        else if (move === null) {
	            moveObj = this._moveFromSan(SAN_NULLMOVE, strict);
	        }
	        else if (typeof move === 'object') {
	            const moves = this._moves();
	            // convert the pretty move object to an ugly move object
	            for (let i = 0, len = moves.length; i < len; i++) {
	                if (move.from === algebraic(moves[i].from) &&
	                    move.to === algebraic(moves[i].to) &&
	                    (!('promotion' in moves[i]) || move.promotion === moves[i].promotion)) {
	                    moveObj = moves[i];
	                    break;
	                }
	            }
	        }
	        // failed to find move
	        if (!moveObj) {
	            if (typeof move === 'string') {
	                throw new Error(`Invalid move: ${move}`);
	            }
	            else {
	                throw new Error(`Invalid move: ${JSON.stringify(move)}`);
	            }
	        }
	        //disallow null moves when in check
	        if (this.isCheck() && moveObj.flags & BITS.NULL_MOVE) {
	            throw new Error('Null move not allowed when in check');
	        }
	        /*
	         * need to make a copy of move because we can't generate SAN after the move
	         * is made
	         */
	        const prettyMove = new Move(this, moveObj);
	        this._makeMove(moveObj);
	        this._incPositionCount();
	        return prettyMove;
	    }
	    _push(move) {
	        this._history.push({
	            move,
	            kings: { b: this._kings.b, w: this._kings.w },
	            turn: this._turn,
	            castling: { b: this._castling.b, w: this._castling.w },
	            epSquare: this._epSquare,
	            halfMoves: this._halfMoves,
	            moveNumber: this._moveNumber,
	        });
	    }
	    _movePiece(from, to) {
	        this._hash ^= this._pieceKey(from);
	        this._board[to] = this._board[from];
	        delete this._board[from];
	        this._hash ^= this._pieceKey(to);
	    }
	    _makeMove(move) {
	        const us = this._turn;
	        const them = swapColor(us);
	        this._push(move);
	        if (move.flags & BITS.NULL_MOVE) {
	            if (us === BLACK) {
	                this._moveNumber++;
	            }
	            this._halfMoves++;
	            this._turn = them;
	            this._epSquare = EMPTY;
	            return;
	        }
	        this._hash ^= this._epKey();
	        this._hash ^= this._castlingKey();
	        if (move.captured) {
	            this._hash ^= this._pieceKey(move.to);
	        }
	        this._movePiece(move.from, move.to);
	        // if ep capture, remove the captured pawn
	        if (move.flags & BITS.EP_CAPTURE) {
	            if (this._turn === BLACK) {
	                this._clear(move.to - 16);
	            }
	            else {
	                this._clear(move.to + 16);
	            }
	        }
	        // if pawn promotion, replace with new piece
	        if (move.promotion) {
	            this._clear(move.to);
	            this._set(move.to, { type: move.promotion, color: us });
	        }
	        // if we moved the king
	        if (this._board[move.to].type === KING) {
	            this._kings[us] = move.to;
	            // if we castled, move the rook next to the king
	            if (move.flags & BITS.KSIDE_CASTLE) {
	                const castlingTo = move.to - 1;
	                const castlingFrom = move.to + 1;
	                this._movePiece(castlingFrom, castlingTo);
	            }
	            else if (move.flags & BITS.QSIDE_CASTLE) {
	                const castlingTo = move.to + 1;
	                const castlingFrom = move.to - 2;
	                this._movePiece(castlingFrom, castlingTo);
	            }
	            // turn off castling
	            this._castling[us] = 0;
	        }
	        // turn off castling if we move a rook
	        if (this._castling[us]) {
	            for (let i = 0, len = ROOKS[us].length; i < len; i++) {
	                if (move.from === ROOKS[us][i].square &&
	                    this._castling[us] & ROOKS[us][i].flag) {
	                    this._castling[us] ^= ROOKS[us][i].flag;
	                    break;
	                }
	            }
	        }
	        // turn off castling if we capture a rook
	        if (this._castling[them]) {
	            for (let i = 0, len = ROOKS[them].length; i < len; i++) {
	                if (move.to === ROOKS[them][i].square &&
	                    this._castling[them] & ROOKS[them][i].flag) {
	                    this._castling[them] ^= ROOKS[them][i].flag;
	                    break;
	                }
	            }
	        }
	        this._hash ^= this._castlingKey();
	        // if big pawn move, update the en passant square
	        if (move.flags & BITS.BIG_PAWN) {
	            let epSquare;
	            if (us === BLACK) {
	                epSquare = move.to - 16;
	            }
	            else {
	                epSquare = move.to + 16;
	            }
	            if ((!((move.to - 1) & 0x88) &&
	                this._board[move.to - 1]?.type === PAWN &&
	                this._board[move.to - 1]?.color === them) ||
	                (!((move.to + 1) & 0x88) &&
	                    this._board[move.to + 1]?.type === PAWN &&
	                    this._board[move.to + 1]?.color === them)) {
	                this._epSquare = epSquare;
	                this._hash ^= this._epKey();
	            }
	            else {
	                this._epSquare = EMPTY;
	            }
	        }
	        else {
	            this._epSquare = EMPTY;
	        }
	        // reset the 50 move counter if a pawn is moved or a piece is captured
	        if (move.piece === PAWN) {
	            this._halfMoves = 0;
	        }
	        else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
	            this._halfMoves = 0;
	        }
	        else {
	            this._halfMoves++;
	        }
	        if (us === BLACK) {
	            this._moveNumber++;
	        }
	        this._turn = them;
	        this._hash ^= SIDE_KEY;
	    }
	    undo() {
	        const hash = this._hash;
	        const move = this._undoMove();
	        if (move) {
	            const prettyMove = new Move(this, move);
	            this._decPositionCount(hash);
	            return prettyMove;
	        }
	        return null;
	    }
	    _undoMove() {
	        const old = this._history.pop();
	        if (old === undefined) {
	            return null;
	        }
	        this._hash ^= this._epKey();
	        this._hash ^= this._castlingKey();
	        const move = old.move;
	        this._kings = old.kings;
	        this._turn = old.turn;
	        this._castling = old.castling;
	        this._epSquare = old.epSquare;
	        this._halfMoves = old.halfMoves;
	        this._moveNumber = old.moveNumber;
	        this._hash ^= this._epKey();
	        this._hash ^= this._castlingKey();
	        this._hash ^= SIDE_KEY;
	        const us = this._turn;
	        const them = swapColor(us);
	        if (move.flags & BITS.NULL_MOVE) {
	            return move;
	        }
	        this._movePiece(move.to, move.from);
	        // to undo any promotions
	        if (move.piece) {
	            this._clear(move.from);
	            this._set(move.from, { type: move.piece, color: us });
	        }
	        if (move.captured) {
	            if (move.flags & BITS.EP_CAPTURE) {
	                // en passant capture
	                let index;
	                if (us === BLACK) {
	                    index = move.to - 16;
	                }
	                else {
	                    index = move.to + 16;
	                }
	                this._set(index, { type: PAWN, color: them });
	            }
	            else {
	                // regular capture
	                this._set(move.to, { type: move.captured, color: them });
	            }
	        }
	        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
	            let castlingTo, castlingFrom;
	            if (move.flags & BITS.KSIDE_CASTLE) {
	                castlingTo = move.to + 1;
	                castlingFrom = move.to - 1;
	            }
	            else {
	                castlingTo = move.to - 2;
	                castlingFrom = move.to + 1;
	            }
	            this._movePiece(castlingFrom, castlingTo);
	        }
	        return move;
	    }
	    pgn({ newline = '\n', maxWidth = 0, } = {}) {
	        /*
	         * using the specification from http://www.chessclub.com/help/PGN-spec
	         * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
	         */
	        const result = [];
	        let headerExists = false;
	        /* add the PGN header information */
	        for (const i in this._header) {
	            /*
	             * TODO: order of enumerated properties in header object is not
	             * guaranteed, see ECMA-262 spec (section 12.6.4)
	             *
	             * By using HEADER_TEMPLATE, the order of tags should be preserved; we
	             * do have to check for null placeholders, though, and omit them
	             */
	            const headerTag = this._header[i];
	            if (headerTag)
	                result.push(`[${i} "${this._header[i]}"]` + newline);
	            headerExists = true;
	        }
	        if (headerExists && this._history.length) {
	            result.push(newline);
	        }
	        const appendComment = (moveString) => {
	            const comment = this._comments[this.fen()];
	            if (typeof comment !== 'undefined') {
	                const delimiter = moveString.length > 0 ? ' ' : '';
	                moveString = `${moveString}${delimiter}{${comment}}`;
	            }
	            return moveString;
	        };
	        // pop all of history onto reversed_history
	        const reversedHistory = [];
	        while (this._history.length > 0) {
	            reversedHistory.push(this._undoMove());
	        }
	        const moves = [];
	        let moveString = '';
	        // special case of a commented starting position with no moves
	        if (reversedHistory.length === 0) {
	            moves.push(appendComment(''));
	        }
	        // build the list of moves.  a move_string looks like: "3. e3 e6"
	        while (reversedHistory.length > 0) {
	            moveString = appendComment(moveString);
	            const move = reversedHistory.pop();
	            // make TypeScript stop complaining about move being undefined
	            if (!move) {
	                break;
	            }
	            // if the position started with black to move, start PGN with #. ...
	            if (!this._history.length && move.color === 'b') {
	                const prefix = `${this._moveNumber}. ...`;
	                // is there a comment preceding the first move?
	                moveString = moveString ? `${moveString} ${prefix}` : prefix;
	            }
	            else if (move.color === 'w') {
	                // store the previous generated move_string if we have one
	                if (moveString.length) {
	                    moves.push(moveString);
	                }
	                moveString = this._moveNumber + '.';
	            }
	            moveString =
	                moveString + ' ' + this._moveToSan(move, this._moves({ legal: true }));
	            this._makeMove(move);
	        }
	        // are there any other leftover moves?
	        if (moveString.length) {
	            moves.push(appendComment(moveString));
	        }
	        // is there a result? (there ALWAYS has to be a result according to spec; see Seven Tag Roster)
	        moves.push(this._header.Result || '*');
	        /*
	         * history should be back to what it was before we started generating PGN,
	         * so join together moves
	         */
	        if (maxWidth === 0) {
	            return result.join('') + moves.join(' ');
	        }
	        // TODO (jah): huh?
	        const strip = function () {
	            if (result.length > 0 && result[result.length - 1] === ' ') {
	                result.pop();
	                return true;
	            }
	            return false;
	        };
	        // NB: this does not preserve comment whitespace.
	        const wrapComment = function (width, move) {
	            for (const token of move.split(' ')) {
	                if (!token) {
	                    continue;
	                }
	                if (width + token.length > maxWidth) {
	                    while (strip()) {
	                        width--;
	                    }
	                    result.push(newline);
	                    width = 0;
	                }
	                result.push(token);
	                width += token.length;
	                result.push(' ');
	                width++;
	            }
	            if (strip()) {
	                width--;
	            }
	            return width;
	        };
	        // wrap the PGN output at max_width
	        let currentWidth = 0;
	        for (let i = 0; i < moves.length; i++) {
	            if (currentWidth + moves[i].length > maxWidth) {
	                if (moves[i].includes('{')) {
	                    currentWidth = wrapComment(currentWidth, moves[i]);
	                    continue;
	                }
	            }
	            // if the current move will push past max_width
	            if (currentWidth + moves[i].length > maxWidth && i !== 0) {
	                // don't end the line with whitespace
	                if (result[result.length - 1] === ' ') {
	                    result.pop();
	                }
	                result.push(newline);
	                currentWidth = 0;
	            }
	            else if (i !== 0) {
	                result.push(' ');
	                currentWidth++;
	            }
	            result.push(moves[i]);
	            currentWidth += moves[i].length;
	        }
	        return result.join('');
	    }
	    /**
	     * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)
	     */
	    header(...args) {
	        for (let i = 0; i < args.length; i += 2) {
	            if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
	                this._header[args[i]] = args[i + 1];
	            }
	        }
	        return this._header;
	    }
	    // TODO: value validation per spec
	    setHeader(key, value) {
	        this._header[key] = value ?? SEVEN_TAG_ROSTER[key] ?? null;
	        return this.getHeaders();
	    }
	    removeHeader(key) {
	        if (key in this._header) {
	            this._header[key] = SEVEN_TAG_ROSTER[key] || null;
	            return true;
	        }
	        return false;
	    }
	    // return only non-null headers (omit placemarker nulls)
	    getHeaders() {
	        const nonNullHeaders = {};
	        for (const [key, value] of Object.entries(this._header)) {
	            if (value !== null) {
	                nonNullHeaders[key] = value;
	            }
	        }
	        return nonNullHeaders;
	    }
	    loadPgn(pgn, { strict = false, newlineChar = '\r?\n', } = {}) {
	        // If newlineChar is not the default, replace all instances with \n
	        if (newlineChar !== '\r?\n') {
	            pgn = pgn.replace(new RegExp(newlineChar, 'g'), '\n');
	        }
	        const parsedPgn = peg$parse(pgn);
	        // Put the board in the starting position
	        this.reset();
	        // parse PGN header
	        const headers = parsedPgn.headers;
	        let fen = '';
	        for (const key in headers) {
	            // check to see user is including fen (possibly with wrong tag case)
	            if (key.toLowerCase() === 'fen') {
	                fen = headers[key];
	            }
	            this.header(key, headers[key]);
	        }
	        /*
	         * the permissive parser should attempt to load a fen tag, even if it's the
	         * wrong case and doesn't include a corresponding [SetUp "1"] tag
	         */
	        if (!strict) {
	            if (fen) {
	                this.load(fen, { preserveHeaders: true });
	            }
	        }
	        else {
	            /*
	             * strict parser - load the starting position indicated by [Setup '1']
	             * and [FEN position]
	             */
	            if (headers['SetUp'] === '1') {
	                if (!('FEN' in headers)) {
	                    throw new Error('Invalid PGN: FEN tag must be supplied with SetUp tag');
	                }
	                // don't clear the headers when loading
	                this.load(headers['FEN'], { preserveHeaders: true });
	            }
	        }
	        let node = parsedPgn.root;
	        while (node) {
	            if (node.move) {
	                const move = this._moveFromSan(node.move, strict);
	                if (move == null) {
	                    throw new Error(`Invalid move in PGN: ${node.move}`);
	                }
	                else {
	                    this._makeMove(move);
	                    this._incPositionCount();
	                }
	            }
	            if (node.comment !== undefined) {
	                this._comments[this.fen()] = node.comment;
	            }
	            node = node.variations[0];
	        }
	        /*
	         * Per section 8.2.6 of the PGN spec, the Result tag pair must match match
	         * the termination marker. Only do this when headers are present, but the
	         * result tag is missing
	         */
	        const result = parsedPgn.result;
	        if (result &&
	            Object.keys(this._header).length &&
	            this._header['Result'] !== result) {
	            this.setHeader('Result', result);
	        }
	    }
	    /*
	     * Convert a move from 0x88 coordinates to Standard Algebraic Notation
	     * (SAN)
	     *
	     * @param {boolean} strict Use the strict SAN parser. It will throw errors
	     * on overly disambiguated moves (see below):
	     *
	     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
	     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
	     * 4. ... Ne7 is technically the valid SAN
	     */
	    _moveToSan(move, moves) {
	        let output = '';
	        if (move.flags & BITS.KSIDE_CASTLE) {
	            output = 'O-O';
	        }
	        else if (move.flags & BITS.QSIDE_CASTLE) {
	            output = 'O-O-O';
	        }
	        else if (move.flags & BITS.NULL_MOVE) {
	            return SAN_NULLMOVE;
	        }
	        else {
	            if (move.piece !== PAWN) {
	                const disambiguator = getDisambiguator(move, moves);
	                output += move.piece.toUpperCase() + disambiguator;
	            }
	            if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
	                if (move.piece === PAWN) {
	                    output += algebraic(move.from)[0];
	                }
	                output += 'x';
	            }
	            output += algebraic(move.to);
	            if (move.promotion) {
	                output += '=' + move.promotion.toUpperCase();
	            }
	        }
	        this._makeMove(move);
	        if (this.isCheck()) {
	            if (this.isCheckmate()) {
	                output += '#';
	            }
	            else {
	                output += '+';
	            }
	        }
	        this._undoMove();
	        return output;
	    }
	    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
	    _moveFromSan(move, strict = false) {
	        // strip off any move decorations: e.g Nf3+?! becomes Nf3
	        let cleanMove = strippedSan(move);
	        if (!strict) {
	            if (cleanMove === '0-0') {
	                cleanMove = 'O-O';
	            }
	            else if (cleanMove === '0-0-0') {
	                cleanMove = 'O-O-O';
	            }
	        }
	        //first implementation of null with a dummy move (black king moves from a8 to a8), maybe this can be implemented better
	        if (cleanMove == SAN_NULLMOVE) {
	            const res = {
	                color: this._turn,
	                from: 0,
	                to: 0,
	                piece: 'k',
	                flags: BITS.NULL_MOVE,
	            };
	            return res;
	        }
	        let pieceType = inferPieceType(cleanMove);
	        let moves = this._moves({ legal: true, piece: pieceType });
	        // strict parser
	        for (let i = 0, len = moves.length; i < len; i++) {
	            if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
	                return moves[i];
	            }
	        }
	        // the strict parser failed
	        if (strict) {
	            return null;
	        }
	        let piece = undefined;
	        let matches = undefined;
	        let from = undefined;
	        let to = undefined;
	        let promotion = undefined;
	        /*
	         * The default permissive (non-strict) parser allows the user to parse
	         * non-standard chess notations. This parser is only run after the strict
	         * Standard Algebraic Notation (SAN) parser has failed.
	         *
	         * When running the permissive parser, we'll run a regex to grab the piece, the
	         * to/from square, and an optional promotion piece. This regex will
	         * parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
	         * f7f8q, b1c3
	         *
	         * NOTE: Some positions and moves may be ambiguous when using the permissive
	         * parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
	         * the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated bishop
	         * move). In these cases, the permissive parser will default to the most
	         * basic interpretation (which is b1c3 parsing to Nc3).
	         */
	        let overlyDisambiguated = false;
	        matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
	        if (matches) {
	            piece = matches[1];
	            from = matches[2];
	            to = matches[3];
	            promotion = matches[4];
	            if (from.length == 1) {
	                overlyDisambiguated = true;
	            }
	        }
	        else {
	            /*
	             * The [a-h]?[1-8]? portion of the regex below handles moves that may be
	             * overly disambiguated (e.g. Nge7 is unnecessary and non-standard when
	             * there is one legal knight move to e7). In this case, the value of
	             * 'from' variable will be a rank or file, not a square.
	             */
	            matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);
	            if (matches) {
	                piece = matches[1];
	                from = matches[2];
	                to = matches[3];
	                promotion = matches[4];
	                if (from.length == 1) {
	                    overlyDisambiguated = true;
	                }
	            }
	        }
	        pieceType = inferPieceType(cleanMove);
	        moves = this._moves({
	            legal: true,
	            piece: piece ? piece : pieceType,
	        });
	        if (!to) {
	            return null;
	        }
	        for (let i = 0, len = moves.length; i < len; i++) {
	            if (!from) {
	                // if there is no from square, it could be just 'x' missing from a capture
	                if (cleanMove ===
	                    strippedSan(this._moveToSan(moves[i], moves)).replace('x', '')) {
	                    return moves[i];
	                }
	                // hand-compare move properties with the results from our permissive regex
	            }
	            else if ((!piece || piece.toLowerCase() == moves[i].piece) &&
	                Ox88[from] == moves[i].from &&
	                Ox88[to] == moves[i].to &&
	                (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
	                return moves[i];
	            }
	            else if (overlyDisambiguated) {
	                /*
	                 * SPECIAL CASE: we parsed a move string that may have an unneeded
	                 * rank/file disambiguator (e.g. Nge7).  The 'from' variable will
	                 */
	                const square = algebraic(moves[i].from);
	                if ((!piece || piece.toLowerCase() == moves[i].piece) &&
	                    Ox88[to] == moves[i].to &&
	                    (from == square[0] || from == square[1]) &&
	                    (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
	                    return moves[i];
	                }
	            }
	        }
	        return null;
	    }
	    ascii() {
	        let s = '   +------------------------+\n';
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            // display the rank
	            if (file(i) === 0) {
	                s += ' ' + '87654321'[rank(i)] + ' |';
	            }
	            if (this._board[i]) {
	                const piece = this._board[i].type;
	                const color = this._board[i].color;
	                const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
	                s += ' ' + symbol + ' ';
	            }
	            else {
	                s += ' . ';
	            }
	            if ((i + 1) & 0x88) {
	                s += '|\n';
	                i += 8;
	            }
	        }
	        s += '   +------------------------+\n';
	        s += '     a  b  c  d  e  f  g  h';
	        return s;
	    }
	    perft(depth) {
	        const moves = this._moves({ legal: false });
	        let nodes = 0;
	        const color = this._turn;
	        for (let i = 0, len = moves.length; i < len; i++) {
	            this._makeMove(moves[i]);
	            if (!this._isKingAttacked(color)) {
	                if (depth - 1 > 0) {
	                    nodes += this.perft(depth - 1);
	                }
	                else {
	                    nodes++;
	                }
	            }
	            this._undoMove();
	        }
	        return nodes;
	    }
	    setTurn(color) {
	        if (this._turn == color) {
	            return false;
	        }
	        this.move('--');
	        return true;
	    }
	    turn() {
	        return this._turn;
	    }
	    board() {
	        const output = [];
	        let row = [];
	        for (let i = Ox88.a8; i <= Ox88.h1; i++) {
	            if (this._board[i] == null) {
	                row.push(null);
	            }
	            else {
	                row.push({
	                    square: algebraic(i),
	                    type: this._board[i].type,
	                    color: this._board[i].color,
	                });
	            }
	            if ((i + 1) & 0x88) {
	                output.push(row);
	                row = [];
	                i += 8;
	            }
	        }
	        return output;
	    }
	    squareColor(square) {
	        if (square in Ox88) {
	            const sq = Ox88[square];
	            return (rank(sq) + file(sq)) % 2 === 0 ? 'light' : 'dark';
	        }
	        return null;
	    }
	    history({ verbose = false } = {}) {
	        const reversedHistory = [];
	        const moveHistory = [];
	        while (this._history.length > 0) {
	            reversedHistory.push(this._undoMove());
	        }
	        while (true) {
	            const move = reversedHistory.pop();
	            if (!move) {
	                break;
	            }
	            if (verbose) {
	                moveHistory.push(new Move(this, move));
	            }
	            else {
	                moveHistory.push(this._moveToSan(move, this._moves()));
	            }
	            this._makeMove(move);
	        }
	        return moveHistory;
	    }
	    /*
	     * Keeps track of position occurrence counts for the purpose of repetition
	     * checking. Old positions are removed from the map if their counts are reduced to 0.
	     */
	    _getPositionCount(hash) {
	        return this._positionCount.get(hash) ?? 0;
	    }
	    _incPositionCount() {
	        this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);
	    }
	    _decPositionCount(hash) {
	        const currentCount = this._positionCount.get(hash) ?? 0;
	        if (currentCount === 1) {
	            this._positionCount.delete(hash);
	        }
	        else {
	            this._positionCount.set(hash, currentCount - 1);
	        }
	    }
	    _pruneComments() {
	        const reversedHistory = [];
	        const currentComments = {};
	        const copyComment = (fen) => {
	            if (fen in this._comments) {
	                currentComments[fen] = this._comments[fen];
	            }
	        };
	        while (this._history.length > 0) {
	            reversedHistory.push(this._undoMove());
	        }
	        copyComment(this.fen());
	        while (true) {
	            const move = reversedHistory.pop();
	            if (!move) {
	                break;
	            }
	            this._makeMove(move);
	            copyComment(this.fen());
	        }
	        this._comments = currentComments;
	    }
	    getComment() {
	        return this._comments[this.fen()];
	    }
	    setComment(comment) {
	        this._comments[this.fen()] = comment.replace('{', '[').replace('}', ']');
	    }
	    /**
	     * @deprecated Renamed to `removeComment` for consistency
	     */
	    deleteComment() {
	        return this.removeComment();
	    }
	    removeComment() {
	        const comment = this._comments[this.fen()];
	        delete this._comments[this.fen()];
	        return comment;
	    }
	    getComments() {
	        this._pruneComments();
	        return Object.keys(this._comments).map((fen) => {
	            return { fen: fen, comment: this._comments[fen] };
	        });
	    }
	    /**
	     * @deprecated Renamed to `removeComments` for consistency
	     */
	    deleteComments() {
	        return this.removeComments();
	    }
	    removeComments() {
	        this._pruneComments();
	        return Object.keys(this._comments).map((fen) => {
	            const comment = this._comments[fen];
	            delete this._comments[fen];
	            return { fen: fen, comment: comment };
	        });
	    }
	    setCastlingRights(color, rights) {
	        for (const side of [KING, QUEEN]) {
	            if (rights[side] !== undefined) {
	                if (rights[side]) {
	                    this._castling[color] |= SIDES[side];
	                }
	                else {
	                    this._castling[color] &= ~SIDES[side];
	                }
	            }
	        }
	        this._updateCastlingRights();
	        const result = this.getCastlingRights(color);
	        return ((rights[KING] === undefined || rights[KING] === result[KING]) &&
	            (rights[QUEEN] === undefined || rights[QUEEN] === result[QUEEN]));
	    }
	    getCastlingRights(color) {
	        return {
	            [KING]: (this._castling[color] & SIDES[KING]) !== 0,
	            [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0,
	        };
	    }
	    moveNumber() {
	        return this._moveNumber;
	    }
	}

	let pgn$3 = null;
	let pgnPath = [];

	function loadPgn(pgnstring) {
	  pgn$3 = index_umd.exports.parse(pgnstring, {
	    startRule: "game",
	  });

	  const restructuredMoves = restructureMoveTree(pgn$3.moves);

	  pgn$3.moves = augmentMoveTree(
	    restructuredMoves,
	    pgn$3.tags.FEN
	  );

	  pgnPath.length = 0;

	  return pgn$3;
	}

	function restructureMoveTree(moves) {
	  if (!moves?.length) {
	    return [];
	  }

	  function buildLine(line) {
	    if (!line?.length) {
	      return null;
	    }

	    const [move, ...rest] = line;

	    const { variations: _, ...data } = move;

	    const node = {
	      ...data,
	      children: [],
	    };

	    // The next move is the mainline child.
	    if (rest.length > 0) {
	      const nextMove = rest[0];

	      // children[0] = mainline
	      node.children.push(buildLine(rest));

	      // children[1...] = variations that are alternatives to nextMove
	      for (const variation of nextMove.variations ?? []) {
	        node.children.push(buildLine(variation));
	      }
	    }

	    return node;
	  }

	  return [
	    buildLine(moves),
	    ...(moves[0].variations ?? []).map(buildLine),
	  ];

	}

	function augmentMoveTree(tree, fen) {
	  const chess = fen ? new Chess(fen) : new Chess();

	  for (const node of tree) {
	    augmentNode(node, chess);
	  }

	  return tree;
	}

	function augmentNode(node, parentChess) {
	  
	  const chess = new Chess(parentChess.fen());

	  const fenBefore = chess.fen();

	  const move = chess.move(node.notation.notation);

	  if (!move) {
	    throw new Error(`Could not make move: ${node.notation.notation}`);
	  }

	  const fenAfter = chess.fen();

	  Object.assign(node, {
	    ...move,
	    fenBefore,
	    fenAfter,
	    isCheck: chess.isCheck(),
	    isCheckmate: chess.isCheckmate(),
	    isStalemate: chess.isStalemate(),
	    isDraw: chess.isDraw(),
	    isThreefoldRepetition: chess.isThreefoldRepetition(),
	    isInsufficientMaterial: chess.isInsufficientMaterial(),
	    isOriginal: true,
	  });

	  for (const child of node.children ?? []) {
	    augmentNode(child, chess);
	  }
	}

	function getNodeAtPath(path = pgnPath) {
	  if (!path.length) {
	    return null;
	  }

	  let nodes = pgn$3.moves;
	  let node = null;

	  for (const index of path) {
	    node = nodes?.[index];

	    if (!node) {
	      return null;
	    }

	    nodes = node.children;
	  }

	  return node;
	}

	function getChildrenAtPath(path = pgnPath) {
	  const node = getNodeAtPath(path);

	  if (!node) {
	    return pgn$3.moves;
	  }

	  return node.children ?? [];
	}

	function findMatchingChildIndex(orig, dest, promotion) {
	  const children = getChildrenAtPath();

	  const index = children.findIndex(node =>
	    node.from === orig &&
	    node.to === dest &&
	    (promotion === undefined || node.promotion === promotion)
	  );

	  return index === -1 ? null : index;
	}

	function setPath(path) {
	  pgnPath.length = 0;
	  pgnPath.push(...path);
	}

	function getVariation() {
	  const nodes = [];
	  let children = pgn$3.moves;

	  for (const index of pgnPath) {
	    const node = children?.[index];

	    nodes.push(node);
	    children = node.children;
	  }

	  return nodes;
	}

	// keeping this separate from getVariation
	// allows adding a created but unattached node
	// to format incorrect responses
	function formatVariation(nodes) {
	  const moves = [];

	  for (let i = 0; i < nodes.length; i++) {
	    const node = nodes[i];

	    let moveNum;
	    if (node.moveNumber !== undefined) {
	      moveNum = node.moveNumber;
	    } else if (node.fenBefore) {
	      const fenParts = node.fenBefore.split(" ");
	      moveNum = fenParts[5]; 
	    }

	    if (node.color === "w") {
	      moves.push(`${moveNum}.`);
	    } else if (i === 0 && moveNum) {
	      moves.push(`${moveNum}...`);
	    }

	    moves.push(node.san);
	  }

	  return moves.join(" ");
	}


	function addNodeToPath(node) {

	  if (pgnPath.length === 0) {

	    pgn$3.moves.push(node);

	    const index = pgn$3.moves.length - 1;

	    pgnPath.push(index);

	  } else {

	    const currentNode = getNodeAtPath();

	    if (!currentNode) {
	      console.error("Could not find current PGN node");
	      return;
	    }

	    if (!currentNode.children) {
	      currentNode.children = [];
	    }

	    currentNode.children.push(node);

	    const index = currentNode.children.length - 1;

	    pgnPath.push(index);
	  }
	}

	function createNode(chess, orig, dest, promotion) {

	  const fenBefore = chess.fen();
	  // we don't want to update chess
	  // we just want the metadata to create the node
	  const tempchess = new Chess(fenBefore);

	  let move;

	  try {
	    move = tempchess.move({
	      from: orig,
	      to: dest,
	      ...(promotion !== undefined
	        ? { promotion: promotion }
	        : {}),
	    });

	  } catch (error) {
	    console.error("Illegal move:", error);
	    return null;
	  }

	  if (!move) {
	    return null;
	  }

	  const fenAfter = tempchess.fen();

	  return {
	    ...move,

	    fenBefore: fenBefore,
	    fenAfter: fenAfter,

	    isCheck: tempchess.isCheck(),
	    isCheckmate: tempchess.isCheckmate(),
	    isStalemate: tempchess.isStalemate(),
	    isDraw: tempchess.isDraw(),
	    isThreefoldRepetition:
	      tempchess.isThreefoldRepetition(),
	    isInsufficientMaterial:
	      tempchess.isInsufficientMaterial(),

	    isOriginal: false,

	    children: [],
	  };
	}

	function removeNodeAtPath() {

	  if (!pgnPath.length) {
	    return false;
	  }

	  const childIndex = pgnPath[pgnPath.length - 1];

	  const parentPath = pgnPath.slice(0, -1);

	  let children;

	  if (!parentPath.length) {
	    children = pgn$3.moves;
	  } else {
	    const parentNode = getNodeAtPath(parentPath);
	    children = parentNode.children;
	  }

	  if (!children) {
	    return false;
	  }

	  children.splice(childIndex, 1);

	  pgnPath.pop();

	  return true;
	}

	const colors = ['white', 'black'];
	const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

	const invRanks = [...ranks].reverse();
	const allKeys = Array.prototype.concat(...files.map(c => ranks.map(r => c + r)));
	const pos2key = (pos) => allKeys[8 * pos[0] + pos[1]];
	const key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
	const allPos = allKeys.map(key2pos);
	function memo(f) {
	    let v;
	    const ret = () => {
	        if (v === undefined)
	            v = f();
	        return v;
	    };
	    ret.clear = () => {
	        v = undefined;
	    };
	    return ret;
	}
	const timer = () => {
	    let startAt;
	    return {
	        start() {
	            startAt = performance.now();
	        },
	        cancel() {
	            startAt = undefined;
	        },
	        stop() {
	            if (!startAt)
	                return 0;
	            const time = performance.now() - startAt;
	            startAt = undefined;
	            return time;
	        },
	    };
	};
	const opposite = (c) => (c === 'white' ? 'black' : 'white');
	const distanceSq = (pos1, pos2) => {
	    const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
	    return dx * dx + dy * dy;
	};
	const samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
	const posToTranslate = (bounds) => (pos, asWhite) => [
	    ((asWhite ? pos[0] : 7 - pos[0]) * bounds.width) / 8,
	    ((asWhite ? 7 - pos[1] : pos[1]) * bounds.height) / 8,
	];
	const translate = (el, pos) => {
	    el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
	};
	const translateAndScale = (el, pos, scale = 1) => {
	    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
	};
	const setVisible = (el, v) => {
	    el.style.visibility = v ? 'visible' : 'hidden';
	};
	const eventPosition = (e) => {
	    var _a;
	    if (e.clientX || e.clientX === 0)
	        return [e.clientX, e.clientY];
	    if ((_a = e.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
	        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
	    return; // touchend has no position!
	};
	const isRightButton = (e) => e.button === 2;
	const createEl = (tagName, className) => {
	    const el = document.createElement(tagName);
	    if (className)
	        el.className = className;
	    return el;
	};
	function computeSquareCenter(key, asWhite, bounds) {
	    const pos = key2pos(key);
	    if (!asWhite) {
	        pos[0] = 7 - pos[0];
	        pos[1] = 7 - pos[1];
	    }
	    return [
	        bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
	        bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
	    ];
	}

	const diff = (a, b) => Math.abs(a - b);
	const pawn = (color) => (x1, y1, x2, y2) => diff(x1, x2) < 2 &&
	    (color === 'white'
	        ? // allow 2 squares from first two ranks, for horde
	            y2 === y1 + 1 || (y1 <= 1 && y2 === y1 + 2 && x1 === x2)
	        : y2 === y1 - 1 || (y1 >= 6 && y2 === y1 - 2 && x1 === x2));
	const knight = (x1, y1, x2, y2) => {
	    const xd = diff(x1, x2);
	    const yd = diff(y1, y2);
	    return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
	};
	const bishop = (x1, y1, x2, y2) => {
	    return diff(x1, x2) === diff(y1, y2);
	};
	const rook = (x1, y1, x2, y2) => {
	    return x1 === x2 || y1 === y2;
	};
	const queen = (x1, y1, x2, y2) => {
	    return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
	};
	const king = (color, rookFiles, canCastle) => (x1, y1, x2, y2) => (diff(x1, x2) < 2 && diff(y1, y2) < 2) ||
	    (canCastle &&
	        y1 === y2 &&
	        y1 === (color === 'white' ? 0 : 7) &&
	        ((x1 === 4 && ((x2 === 2 && rookFiles.includes(0)) || (x2 === 6 && rookFiles.includes(7)))) ||
	            rookFiles.includes(x2)));
	function rookFilesOf(pieces, color) {
	    const backrank = color === 'white' ? '1' : '8';
	    const files = [];
	    for (const [key, piece] of pieces) {
	        if (key[1] === backrank && piece.color === color && piece.role === 'rook') {
	            files.push(key2pos(key)[0]);
	        }
	    }
	    return files;
	}
	function premove(pieces, key, canCastle) {
	    const piece = pieces.get(key);
	    if (!piece)
	        return [];
	    const pos = key2pos(key), r = piece.role, mobility = r === 'pawn'
	        ? pawn(piece.color)
	        : r === 'knight'
	            ? knight
	            : r === 'bishop'
	                ? bishop
	                : r === 'rook'
	                    ? rook
	                    : r === 'queen'
	                        ? queen
	                        : king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
	    return allPos
	        .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]))
	        .map(pos2key);
	}

	function callUserFunction(f, ...args) {
	    if (f)
	        setTimeout(() => f(...args), 1);
	}
	function toggleOrientation(state) {
	    state.orientation = opposite(state.orientation);
	    state.animation.current = state.draggable.current = state.selected = undefined;
	}
	function setPieces(state, pieces) {
	    for (const [key, piece] of pieces) {
	        if (piece)
	            state.pieces.set(key, piece);
	        else
	            state.pieces.delete(key);
	    }
	}
	function setCheck(state, color) {
	    state.check = undefined;
	    if (color === true)
	        color = state.turnColor;
	    if (color)
	        for (const [k, p] of state.pieces) {
	            if (p.role === 'king' && p.color === color) {
	                state.check = k;
	            }
	        }
	}
	function setPremove(state, orig, dest, meta) {
	    unsetPredrop(state);
	    state.premovable.current = [orig, dest];
	    callUserFunction(state.premovable.events.set, orig, dest, meta);
	}
	function unsetPremove(state) {
	    if (state.premovable.current) {
	        state.premovable.current = undefined;
	        callUserFunction(state.premovable.events.unset);
	    }
	}
	function setPredrop(state, role, key) {
	    unsetPremove(state);
	    state.predroppable.current = { role, key };
	    callUserFunction(state.predroppable.events.set, role, key);
	}
	function unsetPredrop(state) {
	    const pd = state.predroppable;
	    if (pd.current) {
	        pd.current = undefined;
	        callUserFunction(pd.events.unset);
	    }
	}
	function tryAutoCastle(state, orig, dest) {
	    if (!state.autoCastle)
	        return false;
	    const king = state.pieces.get(orig);
	    if (!king || king.role !== 'king')
	        return false;
	    const origPos = key2pos(orig);
	    const destPos = key2pos(dest);
	    if ((origPos[1] !== 0 && origPos[1] !== 7) || origPos[1] !== destPos[1])
	        return false;
	    if (origPos[0] === 4 && !state.pieces.has(dest)) {
	        if (destPos[0] === 6)
	            dest = pos2key([7, destPos[1]]);
	        else if (destPos[0] === 2)
	            dest = pos2key([0, destPos[1]]);
	    }
	    const rook = state.pieces.get(dest);
	    if (!rook || rook.color !== king.color || rook.role !== 'rook')
	        return false;
	    state.pieces.delete(orig);
	    state.pieces.delete(dest);
	    if (origPos[0] < destPos[0]) {
	        state.pieces.set(pos2key([6, destPos[1]]), king);
	        state.pieces.set(pos2key([5, destPos[1]]), rook);
	    }
	    else {
	        state.pieces.set(pos2key([2, destPos[1]]), king);
	        state.pieces.set(pos2key([3, destPos[1]]), rook);
	    }
	    return true;
	}
	function baseMove(state, orig, dest) {
	    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
	    if (orig === dest || !origPiece)
	        return false;
	    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
	    if (dest === state.selected)
	        unselect(state);
	    callUserFunction(state.events.move, orig, dest, captured);
	    if (!tryAutoCastle(state, orig, dest)) {
	        state.pieces.set(dest, origPiece);
	        state.pieces.delete(orig);
	    }
	    state.lastMove = [orig, dest];
	    state.check = undefined;
	    callUserFunction(state.events.change);
	    return captured || true;
	}
	function baseNewPiece(state, piece, key, force) {
	    if (state.pieces.has(key)) {
	        if (force)
	            state.pieces.delete(key);
	        else
	            return false;
	    }
	    callUserFunction(state.events.dropNewPiece, piece, key);
	    state.pieces.set(key, piece);
	    state.lastMove = [key];
	    state.check = undefined;
	    callUserFunction(state.events.change);
	    state.movable.dests = undefined;
	    state.turnColor = opposite(state.turnColor);
	    return true;
	}
	function baseUserMove(state, orig, dest) {
	    const result = baseMove(state, orig, dest);
	    if (result) {
	        state.movable.dests = undefined;
	        state.turnColor = opposite(state.turnColor);
	        state.animation.current = undefined;
	    }
	    return result;
	}
	function userMove(state, orig, dest) {
	    if (canMove(state, orig, dest)) {
	        const result = baseUserMove(state, orig, dest);
	        if (result) {
	            const holdTime = state.hold.stop();
	            unselect(state);
	            const metadata = {
	                premove: false,
	                ctrlKey: state.stats.ctrlKey,
	                holdTime,
	            };
	            if (result !== true)
	                metadata.captured = result;
	            callUserFunction(state.movable.events.after, orig, dest, metadata);
	            return true;
	        }
	    }
	    else if (canPremove(state, orig, dest)) {
	        setPremove(state, orig, dest, {
	            ctrlKey: state.stats.ctrlKey,
	        });
	        unselect(state);
	        return true;
	    }
	    unselect(state);
	    return false;
	}
	function dropNewPiece(state, orig, dest, force) {
	    const piece = state.pieces.get(orig);
	    if (piece && (canDrop(state, orig, dest) || force)) {
	        state.pieces.delete(orig);
	        baseNewPiece(state, piece, dest, force);
	        callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
	            premove: false,
	            predrop: false,
	        });
	    }
	    else if (piece && canPredrop(state, orig, dest)) {
	        setPredrop(state, piece.role, dest);
	    }
	    else {
	        unsetPremove(state);
	        unsetPredrop(state);
	    }
	    state.pieces.delete(orig);
	    unselect(state);
	}
	function selectSquare(state, key, force) {
	    callUserFunction(state.events.select, key);
	    if (state.selected) {
	        if (state.selected === key && !state.draggable.enabled) {
	            unselect(state);
	            state.hold.cancel();
	            return;
	        }
	        else if ((state.selectable.enabled || force) && state.selected !== key) {
	            if (userMove(state, state.selected, key)) {
	                state.stats.dragged = false;
	                return;
	            }
	        }
	    }
	    if ((state.selectable.enabled || state.draggable.enabled) &&
	        (isMovable(state, key) || isPremovable(state, key))) {
	        setSelected(state, key);
	        state.hold.start();
	    }
	}
	function setSelected(state, key) {
	    state.selected = key;
	    if (isPremovable(state, key)) {
	        // calculate chess premoves if custom premoves are not passed
	        if (!state.premovable.customDests) {
	            state.premovable.dests = premove(state.pieces, key, state.premovable.castle);
	        }
	    }
	    else
	        state.premovable.dests = undefined;
	}
	function unselect(state) {
	    state.selected = undefined;
	    state.premovable.dests = undefined;
	    state.hold.cancel();
	}
	function isMovable(state, orig) {
	    const piece = state.pieces.get(orig);
	    return (!!piece &&
	        (state.movable.color === 'both' ||
	            (state.movable.color === piece.color && state.turnColor === piece.color)));
	}
	const canMove = (state, orig, dest) => {
	    var _a, _b;
	    return orig !== dest &&
	        isMovable(state, orig) &&
	        (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest)));
	};
	function canDrop(state, orig, dest) {
	    const piece = state.pieces.get(orig);
	    return (!!piece &&
	        (orig === dest || !state.pieces.has(dest)) &&
	        (state.movable.color === 'both' ||
	            (state.movable.color === piece.color && state.turnColor === piece.color)));
	}
	function isPremovable(state, orig) {
	    const piece = state.pieces.get(orig);
	    return (!!piece &&
	        state.premovable.enabled &&
	        state.movable.color === piece.color &&
	        state.turnColor !== piece.color);
	}
	function canPremove(state, orig, dest) {
	    var _a, _b;
	    const validPremoves = (_b = (_a = state.premovable.customDests) === null || _a === void 0 ? void 0 : _a.get(orig)) !== null && _b !== void 0 ? _b : premove(state.pieces, orig, state.premovable.castle);
	    return orig !== dest && isPremovable(state, orig) && validPremoves.includes(dest);
	}
	function canPredrop(state, orig, dest) {
	    const piece = state.pieces.get(orig);
	    const destPiece = state.pieces.get(dest);
	    return (!!piece &&
	        (!destPiece || destPiece.color !== state.movable.color) &&
	        state.predroppable.enabled &&
	        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
	        state.movable.color === piece.color &&
	        state.turnColor !== piece.color);
	}
	function isDraggable(state, orig) {
	    const piece = state.pieces.get(orig);
	    return (!!piece &&
	        state.draggable.enabled &&
	        (state.movable.color === 'both' ||
	            (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled))));
	}
	function playPremove(state) {
	    const move = state.premovable.current;
	    if (!move)
	        return false;
	    const orig = move[0], dest = move[1];
	    let success = false;
	    if (canMove(state, orig, dest)) {
	        const result = baseUserMove(state, orig, dest);
	        if (result) {
	            const metadata = { premove: true };
	            if (result !== true)
	                metadata.captured = result;
	            callUserFunction(state.movable.events.after, orig, dest, metadata);
	            success = true;
	        }
	    }
	    unsetPremove(state);
	    return success;
	}
	function playPredrop(state, validate) {
	    const drop = state.predroppable.current;
	    let success = false;
	    if (!drop)
	        return false;
	    if (validate(drop)) {
	        const piece = {
	            role: drop.role,
	            color: state.movable.color,
	        };
	        if (baseNewPiece(state, piece, drop.key)) {
	            callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
	                premove: false,
	                predrop: true,
	            });
	            success = true;
	        }
	    }
	    unsetPredrop(state);
	    return success;
	}
	function cancelMove(state) {
	    unsetPremove(state);
	    unsetPredrop(state);
	    unselect(state);
	}
	function stop(state) {
	    state.movable.color = state.movable.dests = state.animation.current = undefined;
	    cancelMove(state);
	}
	function getKeyAtDomPos(pos, asWhite, bounds) {
	    let file = Math.floor((8 * (pos[0] - bounds.left)) / bounds.width);
	    if (!asWhite)
	        file = 7 - file;
	    let rank = 7 - Math.floor((8 * (pos[1] - bounds.top)) / bounds.height);
	    if (!asWhite)
	        rank = 7 - rank;
	    return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? pos2key([file, rank]) : undefined;
	}
	function getSnappedKeyAtDomPos(orig, pos, asWhite, bounds) {
	    const origPos = key2pos(orig);
	    const validSnapPos = allPos.filter(pos2 => queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]));
	    const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), asWhite, bounds));
	    const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
	    const [, closestSnapIndex] = validSnapDistances.reduce((a, b, index) => (a[0] < b ? a : [b, index]), [validSnapDistances[0], 0]);
	    return pos2key(validSnapPos[closestSnapIndex]);
	}
	const whitePov = (s) => s.orientation === 'white';

	const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
	const roles = {
	    p: 'pawn',
	    r: 'rook',
	    n: 'knight',
	    b: 'bishop',
	    q: 'queen',
	    k: 'king',
	};
	const letters = {
	    pawn: 'p',
	    rook: 'r',
	    knight: 'n',
	    bishop: 'b',
	    queen: 'q',
	    king: 'k',
	};
	function read(fen) {
	    if (fen === 'start')
	        fen = initial;
	    const pieces = new Map();
	    let row = 7, col = 0;
	    for (const c of fen) {
	        switch (c) {
	            case ' ':
	            case '[':
	                return pieces;
	            case '/':
	                --row;
	                if (row < 0)
	                    return pieces;
	                col = 0;
	                break;
	            case '~': {
	                const piece = pieces.get(pos2key([col - 1, row]));
	                if (piece)
	                    piece.promoted = true;
	                break;
	            }
	            default: {
	                const nb = c.charCodeAt(0);
	                if (nb < 57)
	                    col += nb - 48;
	                else {
	                    const role = c.toLowerCase();
	                    pieces.set(pos2key([col, row]), {
	                        role: roles[role],
	                        color: c === role ? 'black' : 'white',
	                    });
	                    ++col;
	                }
	            }
	        }
	    }
	    return pieces;
	}
	function write(pieces) {
	    return invRanks
	        .map(y => files
	        .map(x => {
	        const piece = pieces.get((x + y));
	        if (piece) {
	            let p = letters[piece.role];
	            if (piece.color === 'white')
	                p = p.toUpperCase();
	            if (piece.promoted)
	                p += '~';
	            return p;
	        }
	        else
	            return '1';
	    })
	        .join(''))
	        .join('/')
	        .replace(/1{2,}/g, s => s.length.toString());
	}

	function applyAnimation(state, config) {
	    if (config.animation) {
	        deepMerge(state.animation, config.animation);
	        // no need for such short animations
	        if ((state.animation.duration || 0) < 70)
	            state.animation.enabled = false;
	    }
	}
	function configure(state, config) {
	    var _a, _b, _c;
	    // don't merge destinations and autoShapes. Just override.
	    if ((_a = config.movable) === null || _a === void 0 ? void 0 : _a.dests)
	        state.movable.dests = undefined;
	    if ((_b = config.drawable) === null || _b === void 0 ? void 0 : _b.autoShapes)
	        state.drawable.autoShapes = [];
	    deepMerge(state, config);
	    // if a fen was provided, replace the pieces
	    if (config.fen) {
	        state.pieces = read(config.fen);
	        state.drawable.shapes = ((_c = config.drawable) === null || _c === void 0 ? void 0 : _c.shapes) || [];
	    }
	    // apply config values that could be undefined yet meaningful
	    if ('check' in config)
	        setCheck(state, config.check || false);
	    if ('lastMove' in config && !config.lastMove)
	        state.lastMove = undefined;
	    // in case of ZH drop last move, there's a single square.
	    // if the previous last move had two squares,
	    // the merge algorithm will incorrectly keep the second square.
	    else if (config.lastMove)
	        state.lastMove = config.lastMove;
	    // fix move/premove dests
	    if (state.selected)
	        setSelected(state, state.selected);
	    applyAnimation(state, config);
	    if (!state.movable.rookCastle && state.movable.dests) {
	        const rank = state.movable.color === 'white' ? '1' : '8', kingStartPos = ('e' + rank), dests = state.movable.dests.get(kingStartPos), king = state.pieces.get(kingStartPos);
	        if (!dests || !king || king.role !== 'king')
	            return;
	        state.movable.dests.set(kingStartPos, dests.filter(d => !(d === 'a' + rank && dests.includes(('c' + rank))) &&
	            !(d === 'h' + rank && dests.includes(('g' + rank)))));
	    }
	}
	function deepMerge(base, extend) {
	    for (const key in extend) {
	        if (key === '__proto__' || key === 'constructor' || !Object.prototype.hasOwnProperty.call(extend, key))
	            continue;
	        if (Object.prototype.hasOwnProperty.call(base, key) &&
	            isPlainObject(base[key]) &&
	            isPlainObject(extend[key]))
	            deepMerge(base[key], extend[key]);
	        else
	            base[key] = extend[key];
	    }
	}
	function isPlainObject(o) {
	    if (typeof o !== 'object' || o === null)
	        return false;
	    const proto = Object.getPrototypeOf(o);
	    return proto === Object.prototype || proto === null;
	}

	const anim = (mutation, state) => state.animation.enabled ? animate(mutation, state) : render$2(mutation, state);
	function render$2(mutation, state) {
	    const result = mutation(state);
	    state.dom.redraw();
	    return result;
	}
	const makePiece = (key, piece) => ({
	    key: key,
	    pos: key2pos(key),
	    piece: piece,
	});
	const closer = (piece, pieces) => pieces.sort((p1, p2) => distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos))[0];
	function computePlan(prevPieces, current) {
	    const anims = new Map(), animedOrigs = [], fadings = new Map(), missings = [], news = [], prePieces = new Map();
	    let curP, preP, vector;
	    for (const [k, p] of prevPieces) {
	        prePieces.set(k, makePiece(k, p));
	    }
	    for (const key of allKeys) {
	        curP = current.pieces.get(key);
	        preP = prePieces.get(key);
	        if (curP) {
	            if (preP) {
	                if (!samePiece(curP, preP.piece)) {
	                    missings.push(preP);
	                    news.push(makePiece(key, curP));
	                }
	            }
	            else
	                news.push(makePiece(key, curP));
	        }
	        else if (preP)
	            missings.push(preP);
	    }
	    for (const newP of news) {
	        preP = closer(newP, missings.filter(p => samePiece(newP.piece, p.piece)));
	        if (preP) {
	            vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
	            anims.set(newP.key, vector.concat(vector));
	            animedOrigs.push(preP.key);
	        }
	    }
	    for (const p of missings) {
	        if (!animedOrigs.includes(p.key))
	            fadings.set(p.key, p.piece);
	    }
	    return {
	        anims: anims,
	        fadings: fadings,
	    };
	}
	function step(state, now) {
	    const cur = state.animation.current;
	    if (cur === undefined) {
	        // animation was canceled :(
	        if (!state.dom.destroyed)
	            state.dom.redrawNow();
	        return;
	    }
	    const rest = 1 - (now - cur.start) * cur.frequency;
	    if (rest <= 0) {
	        state.animation.current = undefined;
	        state.dom.redrawNow();
	    }
	    else {
	        const ease = easing(rest);
	        for (const cfg of cur.plan.anims.values()) {
	            cfg[2] = cfg[0] * ease;
	            cfg[3] = cfg[1] * ease;
	        }
	        state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
	        requestAnimationFrame((now = performance.now()) => step(state, now));
	    }
	}
	function animate(mutation, state) {
	    // clone state before mutating it
	    const prevPieces = new Map(state.pieces);
	    const result = mutation(state);
	    const plan = computePlan(prevPieces, state);
	    if (plan.anims.size || plan.fadings.size) {
	        const alreadyRunning = state.animation.current && state.animation.current.start;
	        state.animation.current = {
	            start: performance.now(),
	            frequency: 1 / state.animation.duration,
	            plan: plan,
	        };
	        if (!alreadyRunning)
	            step(state, performance.now());
	    }
	    else {
	        // don't animate, just render right away
	        state.dom.redraw();
	    }
	    return result;
	}
	// https://gist.github.com/gre/1650294
	const easing = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

	const brushes = ['green', 'red', 'blue', 'yellow'];
	function start$2(state, e) {
	    // support one finger touch only
	    if (e.touches && e.touches.length > 1)
	        return;
	    e.stopPropagation();
	    e.preventDefault();
	    e.ctrlKey ? unselect(state) : cancelMove(state);
	    const pos = eventPosition(e), orig = getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
	    if (!orig)
	        return;
	    state.drawable.current = {
	        orig,
	        pos,
	        brush: eventBrush(e),
	        snapToValidMove: state.drawable.defaultSnapToValidMove,
	    };
	    processDraw(state);
	}
	function processDraw(state) {
	    requestAnimationFrame(() => {
	        const cur = state.drawable.current;
	        if (cur) {
	            const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state), state.dom.bounds());
	            if (!keyAtDomPos) {
	                cur.snapToValidMove = false;
	            }
	            const mouseSq = cur.snapToValidMove
	                ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state), state.dom.bounds())
	                : keyAtDomPos;
	            if (mouseSq !== cur.mouseSq) {
	                cur.mouseSq = mouseSq;
	                cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
	                state.dom.redrawNow();
	            }
	            processDraw(state);
	        }
	    });
	}
	function move$1(state, e) {
	    if (state.drawable.current)
	        state.drawable.current.pos = eventPosition(e);
	}
	function end$1(state) {
	    const cur = state.drawable.current;
	    if (cur) {
	        if (cur.mouseSq)
	            addShape(state.drawable, cur);
	        cancel$1(state);
	    }
	}
	function cancel$1(state) {
	    if (state.drawable.current) {
	        state.drawable.current = undefined;
	        state.dom.redraw();
	    }
	}
	function clear(state) {
	    if (state.drawable.shapes.length) {
	        state.drawable.shapes = [];
	        state.dom.redraw();
	        onChange(state.drawable);
	    }
	}
	function eventBrush(e) {
	    var _a;
	    const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
	    const modB = e.altKey || e.metaKey || ((_a = e.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e, 'AltGraph'));
	    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
	}
	function addShape(drawable, cur) {
	    const sameShape = (s) => s.orig === cur.orig && s.dest === cur.dest;
	    const similar = drawable.shapes.find(sameShape);
	    if (similar)
	        drawable.shapes = drawable.shapes.filter(s => !sameShape(s));
	    if (!similar || similar.brush !== cur.brush)
	        drawable.shapes.push({
	            orig: cur.orig,
	            dest: cur.dest,
	            brush: cur.brush,
	        });
	    onChange(drawable);
	}
	function onChange(drawable) {
	    if (drawable.onChange)
	        drawable.onChange(drawable.shapes);
	}

	function start$1(s, e) {
	    if (!(s.trustAllEvents || e.isTrusted))
	        return; // only trust when trustAllEvents is enabled
	    if (e.buttons !== undefined && e.buttons > 1)
	        return; // only touch or left click
	    if (e.touches && e.touches.length > 1)
	        return; // support one finger touch only
	    const bounds = s.dom.bounds(), position = eventPosition(e), orig = getKeyAtDomPos(position, whitePov(s), bounds);
	    if (!orig)
	        return;
	    const piece = s.pieces.get(orig);
	    const previouslySelected = s.selected;
	    if (!previouslySelected &&
	        s.drawable.enabled &&
	        (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
	        clear(s);
	    // Prevent touch scroll and create no corresponding mouse event, if there
	    // is an intent to interact with the board.
	    if (e.cancelable !== false &&
	        (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
	        e.preventDefault();
	    else if (e.touches)
	        return; // Handle only corresponding mouse event https://github.com/lichess-org/chessground/pull/268
	    const hadPremove = !!s.premovable.current;
	    const hadPredrop = !!s.predroppable.current;
	    s.stats.ctrlKey = e.ctrlKey;
	    if (s.selected && canMove(s, s.selected, orig)) {
	        anim(state => selectSquare(state, orig), s);
	    }
	    else {
	        selectSquare(s, orig);
	    }
	    const stillSelected = s.selected === orig;
	    const element = pieceElementByKey(s, orig);
	    if (piece && element && stillSelected && isDraggable(s, orig)) {
	        s.draggable.current = {
	            orig,
	            piece,
	            origPos: position,
	            pos: position,
	            started: s.draggable.autoDistance && s.stats.dragged,
	            element,
	            previouslySelected,
	            originTarget: e.target,
	            keyHasChanged: false,
	        };
	        element.cgDragging = true;
	        element.classList.add('dragging');
	        // place ghost
	        const ghost = s.dom.elements.ghost;
	        if (ghost) {
	            ghost.className = `ghost ${piece.color} ${piece.role}`;
	            translate(ghost, posToTranslate(bounds)(key2pos(orig), whitePov(s)));
	            setVisible(ghost, true);
	        }
	        processDrag(s);
	    }
	    else {
	        if (hadPremove)
	            unsetPremove(s);
	        if (hadPredrop)
	            unsetPredrop(s);
	    }
	    s.dom.redraw();
	}
	function pieceCloseTo(s, pos) {
	    const asWhite = whitePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / 8, 2);
	    for (const key of s.pieces.keys()) {
	        const center = computeSquareCenter(key, asWhite, bounds);
	        if (distanceSq(center, pos) <= radiusSq)
	            return true;
	    }
	    return false;
	}
	function dragNewPiece(s, piece, e, force) {
	    const key = 'a0';
	    s.pieces.set(key, piece);
	    s.dom.redraw();
	    const position = eventPosition(e);
	    s.draggable.current = {
	        orig: key,
	        piece,
	        origPos: position,
	        pos: position,
	        started: true,
	        element: () => pieceElementByKey(s, key),
	        originTarget: e.target,
	        newPiece: true,
	        force: !!force,
	        keyHasChanged: false,
	    };
	    processDrag(s);
	}
	function processDrag(s) {
	    requestAnimationFrame(() => {
	        var _a;
	        const cur = s.draggable.current;
	        if (!cur)
	            return;
	        // cancel animations while dragging
	        if ((_a = s.animation.current) === null || _a === void 0 ? void 0 : _a.plan.anims.has(cur.orig))
	            s.animation.current = undefined;
	        // if moving piece is gone, cancel
	        const origPiece = s.pieces.get(cur.orig);
	        if (!origPiece || !samePiece(origPiece, cur.piece))
	            cancel(s);
	        else {
	            if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
	                cur.started = true;
	            if (cur.started) {
	                // support lazy elements
	                if (typeof cur.element === 'function') {
	                    const found = cur.element();
	                    if (!found)
	                        return;
	                    found.cgDragging = true;
	                    found.classList.add('dragging');
	                    cur.element = found;
	                }
	                const bounds = s.dom.bounds();
	                translate(cur.element, [
	                    cur.pos[0] - bounds.left - bounds.width / 16,
	                    cur.pos[1] - bounds.top - bounds.height / 16,
	                ]);
	                cur.keyHasChanged || (cur.keyHasChanged = cur.orig !== getKeyAtDomPos(cur.pos, whitePov(s), bounds));
	            }
	        }
	        processDrag(s);
	    });
	}
	function move(s, e) {
	    // support one finger touch only
	    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
	        s.draggable.current.pos = eventPosition(e);
	    }
	}
	function end(s, e) {
	    const cur = s.draggable.current;
	    if (!cur)
	        return;
	    // create no corresponding mouse event
	    if (e.type === 'touchend' && e.cancelable !== false)
	        e.preventDefault();
	    // comparing with the origin target is an easy way to test that the end event
	    // has the same touch origin
	    if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.newPiece) {
	        s.draggable.current = undefined;
	        return;
	    }
	    unsetPremove(s);
	    unsetPredrop(s);
	    // touchend has no position; so use the last touchmove position instead
	    const eventPos = eventPosition(e) || cur.pos;
	    const dest = getKeyAtDomPos(eventPos, whitePov(s), s.dom.bounds());
	    if (dest && cur.started && cur.orig !== dest) {
	        if (cur.newPiece)
	            dropNewPiece(s, cur.orig, dest, cur.force);
	        else {
	            s.stats.ctrlKey = e.ctrlKey;
	            if (userMove(s, cur.orig, dest))
	                s.stats.dragged = true;
	        }
	    }
	    else if (cur.newPiece) {
	        s.pieces.delete(cur.orig);
	    }
	    else if (s.draggable.deleteOnDropOff && !dest) {
	        s.pieces.delete(cur.orig);
	        callUserFunction(s.events.change);
	    }
	    if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest))
	        unselect(s);
	    else if (!s.selectable.enabled)
	        unselect(s);
	    removeDragElements(s);
	    s.draggable.current = undefined;
	    s.dom.redraw();
	}
	function cancel(s) {
	    const cur = s.draggable.current;
	    if (cur) {
	        if (cur.newPiece)
	            s.pieces.delete(cur.orig);
	        s.draggable.current = undefined;
	        unselect(s);
	        removeDragElements(s);
	        s.dom.redraw();
	    }
	}
	function removeDragElements(s) {
	    const e = s.dom.elements;
	    if (e.ghost)
	        setVisible(e.ghost, false);
	}
	function pieceElementByKey(s, key) {
	    let el = s.dom.elements.board.firstChild;
	    while (el) {
	        if (el.cgKey === key && el.tagName === 'PIECE')
	            return el;
	        el = el.nextSibling;
	    }
	    return;
	}

	function explosion(state, keys) {
	    state.exploding = { stage: 1, keys };
	    state.dom.redraw();
	    setTimeout(() => {
	        setStage(state, 2);
	        setTimeout(() => setStage(state, undefined), 120);
	    }, 120);
	}
	function setStage(state, stage) {
	    if (state.exploding) {
	        if (stage)
	            state.exploding.stage = stage;
	        else
	            state.exploding = undefined;
	        state.dom.redraw();
	    }
	}

	// see API types and documentations in dts/api.d.ts
	function start(state, redrawAll) {
	    function toggleOrientation$1() {
	        toggleOrientation(state);
	        redrawAll();
	    }
	    return {
	        set(config) {
	            if (config.orientation && config.orientation !== state.orientation)
	                toggleOrientation$1();
	            applyAnimation(state, config);
	            (config.fen ? anim : render$2)(state => configure(state, config), state);
	        },
	        state,
	        getFen: () => write(state.pieces),
	        toggleOrientation: toggleOrientation$1,
	        setPieces(pieces) {
	            anim(state => setPieces(state, pieces), state);
	        },
	        selectSquare(key, force) {
	            if (key)
	                anim(state => selectSquare(state, key, force), state);
	            else if (state.selected) {
	                unselect(state);
	                state.dom.redraw();
	            }
	        },
	        move(orig, dest) {
	            anim(state => baseMove(state, orig, dest), state);
	        },
	        newPiece(piece, key) {
	            anim(state => baseNewPiece(state, piece, key), state);
	        },
	        playPremove() {
	            if (state.premovable.current) {
	                if (anim(playPremove, state))
	                    return true;
	                // if the premove couldn't be played, redraw to clear it up
	                state.dom.redraw();
	            }
	            return false;
	        },
	        playPredrop(validate) {
	            if (state.predroppable.current) {
	                const result = playPredrop(state, validate);
	                state.dom.redraw();
	                return result;
	            }
	            return false;
	        },
	        cancelPremove() {
	            render$2(unsetPremove, state);
	        },
	        cancelPredrop() {
	            render$2(unsetPredrop, state);
	        },
	        cancelMove() {
	            render$2(state => {
	                cancelMove(state);
	                cancel(state);
	            }, state);
	        },
	        stop() {
	            render$2(state => {
	                stop(state);
	                cancel(state);
	            }, state);
	        },
	        explode(keys) {
	            explosion(state, keys);
	        },
	        setAutoShapes(shapes) {
	            render$2(state => (state.drawable.autoShapes = shapes), state);
	        },
	        setShapes(shapes) {
	            render$2(state => (state.drawable.shapes = shapes), state);
	        },
	        getKeyAtDomPos(pos) {
	            return getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
	        },
	        redrawAll,
	        dragNewPiece(piece, event, force) {
	            dragNewPiece(state, piece, event, force);
	        },
	        destroy() {
	            stop(state);
	            state.dom.unbind && state.dom.unbind();
	            state.dom.destroyed = true;
	        },
	    };
	}

	function defaults() {
	    return {
	        pieces: read(initial),
	        orientation: 'white',
	        turnColor: 'white',
	        coordinates: true,
	        coordinatesOnSquares: false,
	        ranksPosition: 'right',
	        autoCastle: true,
	        viewOnly: false,
	        disableContextMenu: false,
	        addPieceZIndex: false,
	        blockTouchScroll: false,
	        pieceKey: false,
	        trustAllEvents: false,
	        highlight: {
	            lastMove: true,
	            check: true,
	        },
	        animation: {
	            enabled: true,
	            duration: 200,
	        },
	        movable: {
	            free: true,
	            color: 'both',
	            showDests: true,
	            events: {},
	            rookCastle: true,
	        },
	        premovable: {
	            enabled: true,
	            showDests: true,
	            castle: true,
	            events: {},
	        },
	        predroppable: {
	            enabled: false,
	            events: {},
	        },
	        draggable: {
	            enabled: true,
	            distance: 3,
	            autoDistance: true,
	            showGhost: true,
	            deleteOnDropOff: false,
	        },
	        dropmode: {
	            active: false,
	        },
	        selectable: {
	            enabled: true,
	        },
	        stats: {
	            // on touchscreen, default to "tap-tap" moves
	            // instead of drag
	            dragged: !('ontouchstart' in window),
	        },
	        events: {},
	        drawable: {
	            enabled: true, // can draw
	            visible: true, // can view
	            defaultSnapToValidMove: true,
	            eraseOnClick: true,
	            shapes: [],
	            autoShapes: [],
	            brushes: {
	                green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
	                red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
	                blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
	                yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
	                paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
	                paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
	                paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
	                paleGrey: {
	                    key: 'pgr',
	                    color: '#4a4a4a',
	                    opacity: 0.35,
	                    lineWidth: 15,
	                },
	                purple: { key: 'purple', color: '#68217a', opacity: 0.65, lineWidth: 10 },
	                pink: { key: 'pink', color: '#ee2080', opacity: 0.5, lineWidth: 10 },
	                white: { key: 'white', color: 'white', opacity: 1, lineWidth: 10 },
	            },
	            prevSvgHash: '',
	        },
	        hold: timer(),
	    };
	}

	const hilites = {
	    hilitePrimary: { key: 'hilitePrimary', color: '#3291ff', opacity: 1, lineWidth: 1 },
	    hiliteWhite: { key: 'hiliteWhite', color: '#ffffff', opacity: 1, lineWidth: 1 },
	};
	function createDefs() {
	    const defs = createElement('defs');
	    const filter = setAttributes(createElement('filter'), { id: 'cg-filter-blur' });
	    filter.appendChild(setAttributes(createElement('feGaussianBlur'), { stdDeviation: '0.019' }));
	    defs.appendChild(filter);
	    return defs;
	}
	function renderSvg(state, shapesEl, customsEl) {
	    var _a;
	    const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, dests = new Map(), bounds = state.dom.bounds(), nonPieceAutoShapes = d.autoShapes.filter(autoShape => !autoShape.piece);
	    for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
	        if (!s.dest)
	            continue;
	        const sources = (_a = dests.get(s.dest)) !== null && _a !== void 0 ? _a : new Set(), from = pos2user(orient(key2pos(s.orig), state.orientation), bounds), to = pos2user(orient(key2pos(s.dest), state.orientation), bounds);
	        sources.add(moveAngle(from, to));
	        dests.set(s.dest, sources);
	    }
	    const shapes = d.shapes.concat(nonPieceAutoShapes).map((s) => {
	        return {
	            shape: s,
	            current: false,
	            hash: shapeHash(s, isShort(s.dest, dests), false, bounds),
	        };
	    });
	    if (cur)
	        shapes.push({
	            shape: cur,
	            current: true,
	            hash: shapeHash(cur, isShort(cur.dest, dests), true, bounds),
	        });
	    const fullHash = shapes.map(sc => sc.hash).join(';');
	    if (fullHash === state.drawable.prevSvgHash)
	        return;
	    state.drawable.prevSvgHash = fullHash;
	    /*
	      -- DOM hierarchy --
	      <svg class="cg-shapes">      (<= svg)
	        <defs>
	          ...(for brushes)...
	        </defs>
	        <g>
	          ...(for arrows and circles)...
	        </g>
	      </svg>
	      <svg class="cg-custom-svgs"> (<= customSvg)
	        <g>
	          ...(for custom svgs)...
	        </g>
	      </svg>
	    */
	    const defsEl = shapesEl.querySelector('defs');
	    syncDefs(d, shapes, defsEl);
	    syncShapes$1(shapes, shapesEl.querySelector('g'), customsEl.querySelector('g'), s => renderShape$1(state, s, d.brushes, dests, bounds));
	}
	// append only. Don't try to update/remove.
	function syncDefs(d, shapes, defsEl) {
	    var _a;
	    const brushes = new Map();
	    let brush;
	    for (const s of shapes.filter(s => s.shape.dest && s.shape.brush)) {
	        brush = makeCustomBrush(d.brushes[s.shape.brush], s.shape.modifiers);
	        if ((_a = s.shape.modifiers) === null || _a === void 0 ? void 0 : _a.hilite)
	            brushes.set(hilite(brush).key, hilite(brush));
	        brushes.set(brush.key, brush);
	    }
	    const keysInDom = new Set();
	    let el = defsEl.firstElementChild;
	    while (el) {
	        keysInDom.add(el.getAttribute('cgKey'));
	        el = el.nextElementSibling;
	    }
	    for (const [key, brush] of brushes.entries()) {
	        if (!keysInDom.has(key))
	            defsEl.appendChild(renderMarker(brush));
	    }
	}
	function syncShapes$1(syncables, shapes, customs, renderShape) {
	    const hashesInDom = new Map();
	    for (const sc of syncables)
	        hashesInDom.set(sc.hash, false);
	    for (const root of [shapes, customs]) {
	        const toRemove = [];
	        let el = root.firstElementChild, elHash;
	        while (el) {
	            elHash = el.getAttribute('cgHash');
	            if (hashesInDom.has(elHash))
	                hashesInDom.set(elHash, true);
	            else
	                toRemove.push(el);
	            el = el.nextElementSibling;
	        }
	        for (const el of toRemove)
	            root.removeChild(el);
	    }
	    // insert shapes that are not yet in dom
	    for (const sc of syncables.filter(s => !hashesInDom.get(s.hash))) {
	        for (const svg of renderShape(sc)) {
	            if (svg.isCustom)
	                customs.appendChild(svg.el);
	            else
	                shapes.appendChild(svg.el);
	        }
	    }
	}
	function shapeHash({ orig, dest, brush, piece, modifiers, customSvg, label }, shorten, current, bounds) {
	    var _a, _b;
	    // a shape and an overlay svg share a lifetime and have the same cgHash attribute
	    return [
	        bounds.width,
	        bounds.height,
	        current,
	        orig,
	        dest,
	        brush,
	        shorten && '-',
	        piece && pieceHash(piece),
	        modifiers && modifiersHash(modifiers),
	        customSvg && `custom-${textHash(customSvg.html)},${(_b = (_a = customSvg.center) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 'o'}`,
	        label && `label-${textHash(label.text)}`,
	    ]
	        .filter(x => x)
	        .join(',');
	}
	function pieceHash(piece) {
	    return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
	}
	function modifiersHash(m) {
	    return [m.lineWidth, m.hilite && '*'].filter(x => x).join(',');
	}
	function textHash(s) {
	    // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
	    let h = 0;
	    for (let i = 0; i < s.length; i++) {
	        h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
	    }
	    return h.toString();
	}
	function renderShape$1(state, { shape, current, hash }, brushes, dests, bounds) {
	    var _a, _b;
	    const from = pos2user(orient(key2pos(shape.orig), state.orientation), bounds), to = shape.dest ? pos2user(orient(key2pos(shape.dest), state.orientation), bounds) : from, brush = shape.brush && makeCustomBrush(brushes[shape.brush], shape.modifiers), slots = dests.get(shape.dest), svgs = [];
	    if (brush) {
	        const el = setAttributes(createElement('g'), { cgHash: hash });
	        svgs.push({ el });
	        if (from[0] !== to[0] || from[1] !== to[1])
	            el.appendChild(renderArrow(shape, brush, from, to, current, isShort(shape.dest, dests)));
	        else
	            el.appendChild(renderCircle(brushes[shape.brush], from, current, bounds));
	    }
	    if (shape.label) {
	        const label = shape.label;
	        (_a = label.fill) !== null && _a !== void 0 ? _a : (label.fill = shape.brush && brushes[shape.brush].color);
	        const corner = shape.brush ? undefined : 'tr';
	        svgs.push({ el: renderLabel(label, hash, from, to, slots, corner), isCustom: true });
	    }
	    if (shape.customSvg) {
	        const on = (_b = shape.customSvg.center) !== null && _b !== void 0 ? _b : 'orig';
	        const [x, y] = on === 'label' ? labelCoords(from, to, slots).map(c => c - 0.5) : on === 'dest' ? to : from;
	        const el = setAttributes(createElement('g'), { transform: `translate(${x},${y})`, cgHash: hash });
	        el.innerHTML = `<svg width="1" height="1" viewBox="0 0 100 100">${shape.customSvg.html}</svg>`;
	        svgs.push({ el, isCustom: true });
	    }
	    return svgs;
	}
	function renderCircle(brush, at, current, bounds) {
	    const widths = circleWidth(), radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
	    return setAttributes(createElement('circle'), {
	        stroke: brush.color,
	        'stroke-width': widths[current ? 0 : 1],
	        fill: 'none',
	        opacity: opacity(brush, current),
	        cx: at[0],
	        cy: at[1],
	        r: radius - widths[1] / 2,
	    });
	}
	function hilite(brush) {
	    return ['#ffffff', '#fff', 'white'].includes(brush.color)
	        ? hilites['hilitePrimary']
	        : hilites['hiliteWhite'];
	}
	function renderArrow(s, brush, from, to, current, shorten) {
	    var _a;
	    function renderLine(isHilite) {
	        var _a;
	        const m = arrowMargin(shorten && !current), dx = to[0] - from[0], dy = to[1] - from[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
	        return setAttributes(createElement('line'), {
	            stroke: isHilite ? hilite(brush).color : brush.color,
	            'stroke-width': lineWidth(brush, current) + (isHilite ? 0.04 : 0),
	            'stroke-linecap': 'round',
	            'marker-end': `url(#arrowhead-${isHilite ? hilite(brush).key : brush.key})`,
	            opacity: ((_a = s.modifiers) === null || _a === void 0 ? void 0 : _a.hilite) ? 1 : opacity(brush, current),
	            x1: from[0],
	            y1: from[1],
	            x2: to[0] - xo,
	            y2: to[1] - yo,
	        });
	    }
	    if (!((_a = s.modifiers) === null || _a === void 0 ? void 0 : _a.hilite))
	        return renderLine(false);
	    const g = createElement('g');
	    const blurred = setAttributes(createElement('g'), { filter: 'url(#cg-filter-blur)' });
	    blurred.appendChild(filterBox(from, to));
	    blurred.appendChild(renderLine(true));
	    g.appendChild(blurred);
	    g.appendChild(renderLine(false));
	    return g;
	}
	function renderMarker(brush) {
	    const marker = setAttributes(createElement('marker'), {
	        id: 'arrowhead-' + brush.key,
	        orient: 'auto',
	        overflow: 'visible',
	        markerWidth: 4,
	        markerHeight: 4,
	        refX: brush.key.startsWith('hilite') ? 1.86 : 2.05,
	        refY: 2,
	    });
	    marker.appendChild(setAttributes(createElement('path'), {
	        d: 'M0,0 V4 L3,2 Z',
	        fill: brush.color,
	    }));
	    marker.setAttribute('cgKey', brush.key);
	    return marker;
	}
	function renderLabel(label, hash, from, to, slots, corner) {
	    var _a;
	    const labelSize = 0.4, fontSize = labelSize * 0.75 ** label.text.length, at = labelCoords(from, to, slots), cornerOff = corner === 'tr' ? 0.4 : 0, g = setAttributes(createElement('g'), {
	        transform: `translate(${at[0] + cornerOff},${at[1] - cornerOff})`,
	        cgHash: hash,
	    });
	    g.appendChild(setAttributes(createElement('circle'), {
	        r: labelSize / 2,
	        'fill-opacity': corner ? 1.0 : 0.8,
	        'stroke-opacity': corner ? 1.0 : 0.7,
	        'stroke-width': 0.03,
	        fill: (_a = label.fill) !== null && _a !== void 0 ? _a : '#666',
	        stroke: 'white',
	    }));
	    const labelEl = setAttributes(createElement('text'), {
	        'font-size': fontSize,
	        'font-family': 'Noto Sans',
	        'text-anchor': 'middle',
	        fill: 'white',
	        y: 0.13 * 0.75 ** label.text.length,
	    });
	    labelEl.innerHTML = label.text;
	    g.appendChild(labelEl);
	    return g;
	}
	function orient(pos, color) {
	    return color === 'white' ? pos : [7 - pos[0], 7 - pos[1]];
	}
	function isShort(dest, dests) {
	    return true === (dest && dests.has(dest) && dests.get(dest).size > 1);
	}
	function createElement(tagName) {
	    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}
	function setAttributes(el, attrs) {
	    for (const key in attrs) {
	        if (Object.prototype.hasOwnProperty.call(attrs, key))
	            el.setAttribute(key, attrs[key]);
	    }
	    return el;
	}
	function makeCustomBrush(base, modifiers) {
	    return !modifiers
	        ? base
	        : {
	            color: base.color,
	            opacity: Math.round(base.opacity * 10) / 10,
	            lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
	            key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
	        };
	}
	function circleWidth() {
	    return [3 / 64, 4 / 64];
	}
	function lineWidth(brush, current) {
	    return ((brush.lineWidth || 10) * (current ? 0.85 : 1)) / 64;
	}
	function opacity(brush, current) {
	    return (brush.opacity || 1) * (current ? 0.9 : 1);
	}
	function arrowMargin(shorten) {
	    return (shorten ? 20 : 10) / 64;
	}
	function pos2user(pos, bounds) {
	    const xScale = Math.min(1, bounds.width / bounds.height);
	    const yScale = Math.min(1, bounds.height / bounds.width);
	    return [(pos[0] - 3.5) * xScale, (3.5 - pos[1]) * yScale];
	}
	function filterBox(from, to) {
	    // lines/arrows are considered to be one dimensional for the purposes of SVG filters,
	    // so we add a transparent bounding box to ensure they apply to the 2nd dimension
	    const box = {
	        from: [Math.floor(Math.min(from[0], to[0])), Math.floor(Math.min(from[1], to[1]))],
	        to: [Math.ceil(Math.max(from[0], to[0])), Math.ceil(Math.max(from[1], to[1]))],
	    };
	    return setAttributes(createElement('rect'), {
	        x: box.from[0],
	        y: box.from[1],
	        width: box.to[0] - box.from[0],
	        height: box.to[1] - box.from[1],
	        fill: 'none',
	        stroke: 'none',
	    });
	}
	function moveAngle(from, to, asSlot = true) {
	    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) + Math.PI;
	    return asSlot ? (Math.round((angle * 8) / Math.PI) + 16) % 16 : angle;
	}
	function dist(from, to) {
	    return Math.sqrt([from[0] - to[0], from[1] - to[1]].reduce((acc, x) => acc + x * x, 0));
	}
	/*
	 try to place label at the junction of the destination shaft and arrowhead. if there's more than
	 1 arrow pointing to a square, the arrow shortens by 10 / 64 units so the label must move as well.
	 
	 if the angle between two incoming arrows is pi / 8, such as when an adjacent knight and bishop
	 attack the same square, the knight's label is slid further down the shaft by an amount equal to
	 our label size to avoid collision
	*/
	function labelCoords(from, to, slots) {
	    let mag = dist(from, to);
	    //if (mag === 0) return [from[0], from[1]];
	    const angle = moveAngle(from, to, false);
	    if (slots) {
	        mag -= 33 / 64; // reduce by arrowhead length
	        if (slots.size > 1) {
	            mag -= 10 / 64; // reduce by shortening factor
	            const slot = moveAngle(from, to);
	            if (slots.has((slot + 1) % 16) || slots.has((slot + 15) % 16)) {
	                if (slot & 1)
	                    mag -= 0.4;
	                // and by label size for the knight if another arrow is within pi / 8.
	            }
	        }
	    }
	    return [from[0] - Math.cos(angle) * mag, from[1] - Math.sin(angle) * mag].map(c => c + 0.5);
	}

	function renderWrap(element, s) {
	    // .cg-wrap (element passed to Chessground)
	    //   cg-container
	    //     cg-board
	    //     svg.cg-shapes
	    //       defs
	    //       g
	    //     svg.cg-custom-svgs
	    //       g
	    //     cg-auto-pieces
	    //     coords.ranks
	    //     coords.files
	    //     piece.ghost
	    element.innerHTML = '';
	    // ensure the cg-wrap class is set
	    // so bounds calculation can use the CSS width/height values
	    // add that class yourself to the element before calling chessground
	    // for a slight performance improvement! (avoids recomputing style)
	    element.classList.add('cg-wrap');
	    for (const c of colors)
	        element.classList.toggle('orientation-' + c, s.orientation === c);
	    element.classList.toggle('manipulable', !s.viewOnly);
	    const container = createEl('cg-container');
	    element.appendChild(container);
	    const board = createEl('cg-board');
	    container.appendChild(board);
	    let svg;
	    let customSvg;
	    let autoPieces;
	    if (s.drawable.visible) {
	        svg = setAttributes(createElement('svg'), {
	            class: 'cg-shapes',
	            viewBox: '-4 -4 8 8',
	            preserveAspectRatio: 'xMidYMid slice',
	        });
	        svg.appendChild(createDefs());
	        svg.appendChild(createElement('g'));
	        customSvg = setAttributes(createElement('svg'), {
	            class: 'cg-custom-svgs',
	            viewBox: '-3.5 -3.5 8 8',
	            preserveAspectRatio: 'xMidYMid slice',
	        });
	        customSvg.appendChild(createElement('g'));
	        autoPieces = createEl('cg-auto-pieces');
	        container.appendChild(svg);
	        container.appendChild(customSvg);
	        container.appendChild(autoPieces);
	    }
	    if (s.coordinates) {
	        const orientClass = s.orientation === 'black' ? ' black' : '';
	        const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : '';
	        if (s.coordinatesOnSquares) {
	            const rankN = s.orientation === 'white' ? i => i + 1 : i => 8 - i;
	            files.forEach((f, i) => container.appendChild(renderCoords(ranks.map(r => f + r), 'squares rank' + rankN(i) + orientClass + ranksPositionClass)));
	        }
	        else {
	            container.appendChild(renderCoords(ranks, 'ranks' + orientClass + ranksPositionClass));
	            container.appendChild(renderCoords(files, 'files' + orientClass));
	        }
	    }
	    let ghost;
	    if (s.draggable.enabled && s.draggable.showGhost) {
	        ghost = createEl('piece', 'ghost');
	        setVisible(ghost, false);
	        container.appendChild(ghost);
	    }
	    return {
	        board,
	        container,
	        wrap: element,
	        ghost,
	        svg,
	        customSvg,
	        autoPieces,
	    };
	}
	function renderCoords(elems, className) {
	    const el = createEl('coords', className);
	    let f;
	    for (const elem of elems) {
	        f = createEl('coord');
	        f.textContent = elem;
	        el.appendChild(f);
	    }
	    return el;
	}

	function drop(s, e) {
	    if (!s.dropmode.active)
	        return;
	    unsetPremove(s);
	    unsetPredrop(s);
	    const piece = s.dropmode.piece;
	    if (piece) {
	        s.pieces.set('a0', piece);
	        const position = eventPosition(e);
	        const dest = position && getKeyAtDomPos(position, whitePov(s), s.dom.bounds());
	        if (dest)
	            dropNewPiece(s, 'a0', dest);
	    }
	    s.dom.redraw();
	}

	function bindBoard(s, onResize) {
	    const boardEl = s.dom.elements.board;
	    if ('ResizeObserver' in window)
	        new ResizeObserver(onResize).observe(s.dom.elements.wrap);
	    if (s.disableContextMenu || s.drawable.enabled) {
	        boardEl.addEventListener('contextmenu', e => e.preventDefault());
	    }
	    if (s.viewOnly)
	        return;
	    // Cannot be passive, because we prevent touch scrolling and dragging of
	    // selected elements.
	    const onStart = startDragOrDraw(s);
	    boardEl.addEventListener('touchstart', onStart, {
	        passive: false,
	    });
	    boardEl.addEventListener('mousedown', onStart, {
	        passive: false,
	    });
	}
	// returns the unbind function
	function bindDocument(s, onResize) {
	    const unbinds = [];
	    // Old versions of Edge and Safari do not support ResizeObserver. Send
	    // chessground.resize if a user action has changed the bounds of the board.
	    if (!('ResizeObserver' in window))
	        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
	    if (!s.viewOnly) {
	        const onmove = dragOrDraw(s, move, move$1);
	        const onend = dragOrDraw(s, end, end$1);
	        for (const ev of ['touchmove', 'mousemove'])
	            unbinds.push(unbindable(document, ev, onmove));
	        for (const ev of ['touchend', 'mouseup'])
	            unbinds.push(unbindable(document, ev, onend));
	        const onScroll = () => s.dom.bounds.clear();
	        unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
	        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
	    }
	    return () => unbinds.forEach(f => f());
	}
	function unbindable(el, eventName, callback, options) {
	    el.addEventListener(eventName, callback, options);
	    return () => el.removeEventListener(eventName, callback, options);
	}
	const startDragOrDraw = (s) => e => {
	    if (s.draggable.current)
	        cancel(s);
	    else if (s.drawable.current)
	        cancel$1(s);
	    else if (e.shiftKey || isRightButton(e)) {
	        if (s.drawable.enabled)
	            start$2(s, e);
	    }
	    else if (!s.viewOnly) {
	        if (s.dropmode.active)
	            drop(s, e);
	        else
	            start$1(s, e);
	    }
	};
	const dragOrDraw = (s, withDrag, withDraw) => e => {
	    if (s.drawable.current) {
	        if (s.drawable.enabled)
	            withDraw(s, e);
	    }
	    else if (!s.viewOnly)
	        withDrag(s, e);
	};

	// ported from https://github.com/lichess-org/lichobile/blob/master/src/chessground/render.ts
	// in case of bugs, blame @veloce
	function render$1(s) {
	    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds()), boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = new Set(), sameSquares = new Set(), movedPieces = new Map(), movedSquares = new Map(); // by class name
	    let k, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
	    // walk over all board dom elements, apply animations and flag moved pieces
	    el = boardEl.firstChild;
	    while (el) {
	        k = el.cgKey;
	        if (isPieceNode(el)) {
	            pieceAtKey = pieces.get(k);
	            anim = anims.get(k);
	            fading = fadings.get(k);
	            elPieceName = el.cgPiece;
	            // if piece not being dragged anymore, remove dragging style
	            if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
	                el.classList.remove('dragging');
	                translate(el, posToTranslate$1(key2pos(k), asWhite));
	                el.cgDragging = false;
	            }
	            // remove fading class if it still remains
	            if (!fading && el.cgFading) {
	                el.cgFading = false;
	                el.classList.remove('fading');
	            }
	            // there is now a piece at this dom key
	            if (pieceAtKey) {
	                // continue animation if already animating and same piece
	                // (otherwise it could animate a captured piece)
	                if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
	                    const pos = key2pos(k);
	                    pos[0] += anim[2];
	                    pos[1] += anim[3];
	                    el.classList.add('anim');
	                    translate(el, posToTranslate$1(pos, asWhite));
	                }
	                else if (el.cgAnimating) {
	                    el.cgAnimating = false;
	                    el.classList.remove('anim');
	                    translate(el, posToTranslate$1(key2pos(k), asWhite));
	                    if (s.addPieceZIndex)
	                        el.style.zIndex = posZIndex(key2pos(k), asWhite);
	                }
	                // same piece: flag as same
	                if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
	                    samePieces.add(k);
	                }
	                // different piece: flag as moved unless it is a fading piece
	                else {
	                    if (fading && elPieceName === pieceNameOf(fading)) {
	                        el.classList.add('fading');
	                        el.cgFading = true;
	                    }
	                    else {
	                        appendValue(movedPieces, elPieceName, el);
	                    }
	                }
	            }
	            // no piece: flag as moved
	            else {
	                appendValue(movedPieces, elPieceName, el);
	            }
	        }
	        else if (isSquareNode(el)) {
	            const cn = el.className;
	            if (squares.get(k) === cn)
	                sameSquares.add(k);
	            else
	                appendValue(movedSquares, cn, el);
	        }
	        el = el.nextSibling;
	    }
	    // walk over all squares in current set, apply dom changes to moved squares
	    // or append new squares
	    for (const [sk, className] of squares) {
	        if (!sameSquares.has(sk)) {
	            sMvdset = movedSquares.get(className);
	            sMvd = sMvdset && sMvdset.pop();
	            const translation = posToTranslate$1(key2pos(sk), asWhite);
	            if (sMvd) {
	                sMvd.cgKey = sk;
	                translate(sMvd, translation);
	            }
	            else {
	                const squareNode = createEl('square', className);
	                squareNode.cgKey = sk;
	                translate(squareNode, translation);
	                boardEl.insertBefore(squareNode, boardEl.firstChild);
	            }
	        }
	    }
	    // walk over all pieces in current set, apply dom changes to moved pieces
	    // or append new pieces
	    for (const [k, p] of pieces) {
	        anim = anims.get(k);
	        if (!samePieces.has(k)) {
	            pMvdset = movedPieces.get(pieceNameOf(p));
	            pMvd = pMvdset && pMvdset.pop();
	            // a same piece was moved
	            if (pMvd) {
	                // apply dom changes
	                pMvd.cgKey = k;
	                if (pMvd.cgFading) {
	                    pMvd.classList.remove('fading');
	                    pMvd.cgFading = false;
	                }
	                const pos = key2pos(k);
	                if (s.addPieceZIndex)
	                    pMvd.style.zIndex = posZIndex(pos, asWhite);
	                if (anim) {
	                    pMvd.cgAnimating = true;
	                    pMvd.classList.add('anim');
	                    pos[0] += anim[2];
	                    pos[1] += anim[3];
	                }
	                translate(pMvd, posToTranslate$1(pos, asWhite));
	            }
	            // no piece in moved obj: insert the new piece
	            // assumes the new piece is not being dragged
	            else {
	                const pieceName = pieceNameOf(p), pieceNode = createEl('piece', pieceName), pos = key2pos(k);
	                pieceNode.cgPiece = pieceName;
	                pieceNode.cgKey = k;
	                if (anim) {
	                    pieceNode.cgAnimating = true;
	                    pos[0] += anim[2];
	                    pos[1] += anim[3];
	                }
	                translate(pieceNode, posToTranslate$1(pos, asWhite));
	                if (s.addPieceZIndex)
	                    pieceNode.style.zIndex = posZIndex(pos, asWhite);
	                boardEl.appendChild(pieceNode);
	            }
	        }
	    }
	    // remove any element that remains in the moved sets
	    for (const nodes of movedPieces.values())
	        removeNodes(s, nodes);
	    for (const nodes of movedSquares.values())
	        removeNodes(s, nodes);
	}
	function renderResized$1(s) {
	    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds());
	    let el = s.dom.elements.board.firstChild;
	    while (el) {
	        if ((isPieceNode(el) && !el.cgAnimating) || isSquareNode(el)) {
	            translate(el, posToTranslate$1(key2pos(el.cgKey), asWhite));
	        }
	        el = el.nextSibling;
	    }
	}
	function updateBounds(s) {
	    var _a, _b;
	    const bounds = s.dom.elements.wrap.getBoundingClientRect();
	    const container = s.dom.elements.container;
	    const ratio = bounds.height / bounds.width;
	    const width = (Math.floor((bounds.width * window.devicePixelRatio) / 8) * 8) / window.devicePixelRatio;
	    const height = width * ratio;
	    container.style.width = width + 'px';
	    container.style.height = height + 'px';
	    s.dom.bounds.clear();
	    (_a = s.addDimensionsCssVarsTo) === null || _a === void 0 ? void 0 : _a.style.setProperty('---cg-width', width + 'px');
	    (_b = s.addDimensionsCssVarsTo) === null || _b === void 0 ? void 0 : _b.style.setProperty('---cg-height', height + 'px');
	}
	const isPieceNode = (el) => el.tagName === 'PIECE';
	const isSquareNode = (el) => el.tagName === 'SQUARE';
	function removeNodes(s, nodes) {
	    for (const node of nodes)
	        s.dom.elements.board.removeChild(node);
	}
	function posZIndex(pos, asWhite) {
	    const minZ = 3;
	    const rank = pos[1];
	    const z = asWhite ? minZ + 7 - rank : minZ + rank;
	    return `${z}`;
	}
	const pieceNameOf = (piece) => `${piece.color} ${piece.role}`;
	function computeSquareClasses(s) {
	    var _a, _b, _c;
	    const squares = new Map();
	    if (s.lastMove && s.highlight.lastMove)
	        for (const k of s.lastMove) {
	            addSquare(squares, k, 'last-move');
	        }
	    if (s.check && s.highlight.check)
	        addSquare(squares, s.check, 'check');
	    if (s.selected) {
	        addSquare(squares, s.selected, 'selected');
	        if (s.movable.showDests) {
	            const dests = (_a = s.movable.dests) === null || _a === void 0 ? void 0 : _a.get(s.selected);
	            if (dests)
	                for (const k of dests) {
	                    addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
	                }
	            const pDests = (_c = (_b = s.premovable.customDests) === null || _b === void 0 ? void 0 : _b.get(s.selected)) !== null && _c !== void 0 ? _c : s.premovable.dests;
	            if (pDests)
	                for (const k of pDests) {
	                    addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
	                }
	        }
	    }
	    const premove = s.premovable.current;
	    if (premove)
	        for (const k of premove)
	            addSquare(squares, k, 'current-premove');
	    else if (s.predroppable.current)
	        addSquare(squares, s.predroppable.current.key, 'current-premove');
	    const o = s.exploding;
	    if (o)
	        for (const k of o.keys)
	            addSquare(squares, k, 'exploding' + o.stage);
	    if (s.highlight.custom) {
	        s.highlight.custom.forEach((v, k) => {
	            addSquare(squares, k, v);
	        });
	    }
	    return squares;
	}
	function addSquare(squares, key, klass) {
	    const classes = squares.get(key);
	    if (classes)
	        squares.set(key, `${classes} ${klass}`);
	    else
	        squares.set(key, klass);
	}
	function appendValue(map, key, value) {
	    const arr = map.get(key);
	    if (arr)
	        arr.push(value);
	    else
	        map.set(key, [value]);
	}

	// append and remove only. No updates.
	function syncShapes(shapes, root, renderShape) {
	    const hashesInDom = new Map(), // by hash
	    toRemove = [];
	    for (const sc of shapes)
	        hashesInDom.set(sc.hash, false);
	    let el = root.firstElementChild, elHash;
	    while (el) {
	        elHash = el.getAttribute('cgHash');
	        // found a shape element that's here to stay
	        if (hashesInDom.has(elHash))
	            hashesInDom.set(elHash, true);
	        // or remove it
	        else
	            toRemove.push(el);
	        el = el.nextElementSibling;
	    }
	    // remove old shapes
	    for (const el of toRemove)
	        root.removeChild(el);
	    // insert shapes that are not yet in dom
	    for (const sc of shapes) {
	        if (!hashesInDom.get(sc.hash))
	            root.appendChild(renderShape(sc));
	    }
	}

	function render(state, autoPieceEl) {
	    const autoPieces = state.drawable.autoShapes.filter(autoShape => autoShape.piece);
	    const autoPieceShapes = autoPieces.map((s) => {
	        return {
	            shape: s,
	            hash: hash(s),
	            current: false,
	        };
	    });
	    syncShapes(autoPieceShapes, autoPieceEl, shape => renderShape(state, shape, state.dom.bounds()));
	}
	function renderResized(state) {
	    var _a;
	    const asWhite = whitePov(state), posToTranslate$1 = posToTranslate(state.dom.bounds());
	    let el = (_a = state.dom.elements.autoPieces) === null || _a === void 0 ? void 0 : _a.firstChild;
	    while (el) {
	        translateAndScale(el, posToTranslate$1(key2pos(el.cgKey), asWhite), el.cgScale);
	        el = el.nextSibling;
	    }
	}
	function renderShape(state, { shape, hash }, bounds) {
	    var _a, _b, _c;
	    const orig = shape.orig;
	    const role = (_a = shape.piece) === null || _a === void 0 ? void 0 : _a.role;
	    const color = (_b = shape.piece) === null || _b === void 0 ? void 0 : _b.color;
	    const scale = (_c = shape.piece) === null || _c === void 0 ? void 0 : _c.scale;
	    const pieceEl = createEl('piece', `${role} ${color}`);
	    pieceEl.setAttribute('cgHash', hash);
	    pieceEl.cgKey = orig;
	    pieceEl.cgScale = scale;
	    translateAndScale(pieceEl, posToTranslate(bounds)(key2pos(orig), whitePov(state)), scale);
	    return pieceEl;
	}
	const hash = (autoPiece) => { var _a, _b, _c; return [autoPiece.orig, (_a = autoPiece.piece) === null || _a === void 0 ? void 0 : _a.role, (_b = autoPiece.piece) === null || _b === void 0 ? void 0 : _b.color, (_c = autoPiece.piece) === null || _c === void 0 ? void 0 : _c.scale].join(','); };

	function Chessground(element, config) {
	    const maybeState = defaults();
	    configure(maybeState, config || {});
	    function redrawAll() {
	        const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
	        // compute bounds from existing board element if possible
	        // this allows non-square boards from CSS to be handled (for 3D)
	        const elements = renderWrap(element, maybeState), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
	            render$1(state);
	            if (elements.autoPieces)
	                render(state, elements.autoPieces);
	            if (!skipSvg && elements.svg)
	                renderSvg(state, elements.svg, elements.customSvg);
	        }, onResize = () => {
	            updateBounds(state);
	            renderResized$1(state);
	            if (elements.autoPieces)
	                renderResized(state);
	        };
	        const state = maybeState;
	        state.dom = {
	            elements,
	            bounds,
	            redraw: debounceRedraw(redrawNow),
	            redrawNow,
	            unbind: prevUnbind,
	        };
	        state.drawable.prevSvgHash = '';
	        updateBounds(state);
	        redrawNow(false);
	        bindBoard(state, onResize);
	        if (!prevUnbind)
	            state.dom.unbind = bindDocument(state, onResize);
	        state.events.insert && state.events.insert(elements);
	        return state;
	    }
	    return start(redrawAll(), redrawAll);
	}
	function debounceRedraw(redrawNow) {
	    let redrawing = false;
	    return () => {
	        if (redrawing)
	            return;
	        redrawing = true;
	        requestAnimationFrame(() => {
	            redrawNow();
	            redrawing = false;
	        });
	    };
	}

	const reviewSession = {
	  puzzle: null,
	  type: null,
	  inittime: null,
	  result: null,
	  numright: 0,
	  numwrong: 0,
	  elapsed: null,
	  attempts: [],

	  initialize(puzzle, type) {
	    this.puzzle = puzzle;
	    this.type = type;
	    this.inittime = Date.now();
	    this.result = null;
	    this.numright = 0;
	    this.numwrong = 0;
	    this.elapsed = null;
	    this.attempts = [];
	  },

	  logAttempt(correct, chess, orig, dest, promotion) {
	    const nodes = getVariation();
	    const node = chess ? createNode(chess, orig, dest, promotion) : null;

	    if (node) { nodes.push(node); }

	    const attempt = formatVariation(nodes);

	    const elapsed = Date.now() - this.inittime;

	    this.attempts.push({ attempt, correct, elapsed });

	    if (correct) {
	      this.numright++;
	    } else {
	      this.numwrong++;
	    }
	  },

	  markIncorrect() {
	    this.result = 0;
	  },

	  // Finish and prepare data for the database
	  getResult() {
	    if (this.result === null) {
	      this.result = this.numwrong ? 0 : 1;
	    }
	    return {
	      puzzle: this.puzzle,
	      type: this.type,
	      inittime: this.inittime,
	      result: this.result,
	      numright: this.numright,
	      numwrong: this.numwrong,
	      elapsed: Date.now() - this.inittime,
	      attempts: this.attempts,
	    };
	  }
	};

	const promotion = document.getElementById("promotion");

	function handleClickMoveWithPromotion(chess, cg, dest, onMove) {
	  const orig = getUniqueOrigForDest(chess, dest);

	  if (!orig) {
	    return;
	  }

	  cg.move(orig, dest);
	  handleMoveWithPromotion(chess, orig, dest, onMove);
	}

	function isPromotion(chess, orig, dest) {
	  const piece = chess.get(orig);

	  if (!piece || piece.type !== "p") {
	    return false;
	  }

	  return dest[1] === "1" || dest[1] === "8";
	}

	function handleMoveWithPromotion(chess, orig, dest, onMove) {
	  if (isPromotion(chess, orig, dest)) {
	    showPromotionPopup(
	      orig,
	      dest,
	      chess,
	      promotion => onMove(orig, dest, promotion)
	    );
	  } else {
	    onMove(orig, dest);
	  }
	}

	function showPromotionPopup(orig, dest, chess, onSelect) {
	  const color = chess.get(orig).color;

	  for (const piece of ["q", "r", "b", "n"]) {
	    const button = promotion.querySelector(
	      `[data-piece="${piece}"]`
	    );

	    const image = document.createElement("img");

	    image.src =
	      `assets/images/pieces/merida/${color}${piece.toUpperCase()}.svg`;

	    button.replaceChildren(image);

	    button.onclick = () => {
	      hidePromotionPopup();
	      onSelect(piece);
	    };
	  }

	  promotion.classList.add("visible");
	}

	function hidePromotionPopup() {
	  promotion.classList.remove("visible");
	}

	function legalDests(chess) {
	  const dests = new Map();
	  SQUARES.forEach((s) => {
	    const ms = chess.moves({ square: s, verbose: true });
	    if (ms.length)
	      dests.set(
	        s,
	        ms.map((m) => m.to),
	      );
	  });
	  return dests;
	}

	function cgTurnColor(chess) {
	  return chess.turn() === "w" ? "white" : "black";
	}

	function getUniqueOrigForDest(chess, dest) {
	  const dests = legalDests(chess);
	  const origins = [];

	  for (const [orig, destinations] of dests.entries()) {
	    if (destinations.includes(dest)) {
	      origins.push(orig);
	    }
	  }

	  return origins.length === 1 ? origins[0] : null;
	}

	function createViewSolutionButton(callback, finish) {

	  const preboardMiddle = document.querySelector(".preboard-middle");

	  const button = document.createElement("button");

	  button.type = "button";
	  button.textContent = "View the solution";
	  button.className = "continueBtn";

	  button.addEventListener("click", () => {
	    button.disabled = true;
	    callback();
	    button.remove();
	    finish();
	  });

	  preboardMiddle.appendChild(button);

	  return button;
	}

	let audioMap = new Map();
	let audioMuted = false;

	// Pre-load audio files to prevent playback delays and race conditions
	function initAudio(mute = false) {
	    const sounds = ["capture", "castle", "check", "checkmate", "click", "error", "move", "promote"];
	    audioMap = new Map();
	    sounds.forEach(sound => {
	        const audio = new Audio(`assets/audio/${sound}.mp3`);
	        audio.preload = 'auto';
	        audio.muted = mute;
	        audioMap.set(sound, audio);
	    });

	    return audioMap;
	}

	function playSound(soundName) {

	    const audio = audioMap.get(soundName);

	    if (!audio) return;

	    // Cloned to prevent race conditions and sound interruption
	    const clone = audio.cloneNode();
	    clone.muted = audioMuted;

	    clone.play()
		.catch(e => console.error(`Could not play sound: ${soundName}`, e));
	   
	}

	function changeAudio(move) {
	    const soundMap = { 
		    "#": "checkmate", 
		    "+": "check", 
		    "x": "capture", 
		    "O-O": "castle", 
		    "=": "promote"
	    };

	    let sound = "move";

	    for (const flag in soundMap) {
	        if (move.san.includes(flag)) {
	            sound = soundMap[flag];
	            break;
	        }
	    }
	    playSound(sound);
	}

	function setAudioMuted(mute) {
	    audioMuted = mute;

	    audioMap.forEach(audio => {
	        audio.muted = audioMuted;
	    });
	}

	function isAudioMuted() {
	    return audioMuted;
	}

	let cg$2;
	let chess$2;
	let pgn$2;
	let resolvePuzzle$2;
	let viewSolutionButtonClicked;
	let advanceButton$2;
	let currentAbortSignal$2 = null;
	let onAbortListener$2 = null;

	function runPuzzle(el, loadedPgn, options = {}) {
	  return new Promise(resolve => {

	    console.log("IN PUZZLE-STANDARD");

	    const {
		abortSignal = null,
	        opponentMovesFirst = false,
	        onViewSolution = null,
	    } = options;

	    currentAbortSignal$2 = abortSignal;
	    viewSolutionButtonClicked = false;

	    if (currentAbortSignal$2?.aborted) {
	      resolve();
	      return;
	    }

	    resolvePuzzle$2 = resolve;

	    pgn$2 = loadedPgn;

	    setPath([]);

	    chess$2 = new Chess(pgn$2.tags.FEN);
	    window.chess = chess$2;

	    if (currentAbortSignal$2) {
	      onAbortListener$2 = onAbort$1;
	      currentAbortSignal$2.addEventListener("abort", onAbortListener$2, { once: true });
	    }

	    cg$2 = Chessground(el, {
	      fen: chess$2.fen(),
	      turnColor: cgTurnColor(chess$2),

	      movable: {
	        color: cgTurnColor(chess$2),
	        free: false,
	        dests: legalDests(chess$2),

	        events: {
	          after(orig, dest) {

	            handleMoveWithPromotion(chess$2, orig, dest, handleMove$2);

	          },
	        },
	      },

	      draggable: {
	        showGhost: true,
	      },
	      events: {
	        select(dest) {
	          handleClickMoveWithPromotion(chess$2, cg$2, dest, handleMove$2);
	        }
	      },
	    });

	    // test
	    //window.addEventListener("resize", () => {
	    //  cg.redraw();
	    //});

	    const board = el.querySelector("cg-board");
	    board.classList.add(`border-${cgTurnColor(chess$2)}`);

	    advanceButton$2 = createViewSolutionButton(
	      onViewSolution,
	      () => {
	        viewSolutionButtonClicked = true;
		cleanup$1();
	        resolvePuzzle$2();
	      }
	    );

	    //// this is untested
	    // if (opponentMovesFirst) {
	    //   makeOpponentMove();
	    //   updateBoard();
	    // }
		  
	    window.cg = cg$2;

	  });
	}

	async function handleMove$2(orig, dest, promotion = undefined) {
	  if (currentAbortSignal$2?.aborted) {
	    return;
	  }

	  const moveIsCorrect = makePlayerMove(orig, dest, promotion);

	  if (!moveIsCorrect) {
	    reviewSession.logAttempt(false, chess$2, orig, dest, promotion);
	    playSound("error");
	 
	    resetBoard$2();
	    return;
	  }

	  
	  if (isSolved$1()) {
	    reviewSession.logAttempt(true);
	    finishPuzzle$1();
	    return;
	  }

	  // delay to separate sounds
	  await new Promise(resolve => setTimeout(resolve, 400));

	  if (viewSolutionButtonClicked || currentAbortSignal$2?.aborted) {
	    return;
	  }

	  makeOpponentMove();
	  updateBoard$1();

	  if (isSolved$1()) {
	    reviewSession.logAttempt(true);
	    finishPuzzle$1();
	    return;
	  }
	}

	function makePlayerMove(orig, dest, promotion) {
	  
	  const index = findMatchingChildIndex(orig, dest, promotion);

	  // wrong move
	  if (index === null) {
	    return false;
	  }

	  // correct move
	  pgnPath.push(index);

	  const move = chess$2.move({
	    from: orig,
	    to: dest,
	    promotion,
	  });

	  changeAudio(move);

	  if (promotion !== undefined) {
	    cg$2.set({
	      fen: chess$2.fen(),
	    });
	  }

	  return true;

	}

	function makeOpponentMove() {
	  // choose randomly among variations
	  const children = getChildrenAtPath();

	  if (children.length === 0) {
	    return false;
	  }

	  const index = Math.floor(Math.random() * children.length);
	  const node = children[index];

	  pgnPath.push(index);

	  const move = chess$2.move({
	    from: node.from,
	    to: node.to,
	  });

	  changeAudio(move);

	  cg$2.move(node.from, node.to);

	  return true;

	}

	function resetBoard$2() {
	  if (!cg$2) return;

	  cg$2.set({
	    fen: chess$2.fen(),
	    turnColor: cgTurnColor(chess$2),
	    movable: {
	      color: cgTurnColor(chess$2),
	      free: false,
	      dests: legalDests(chess$2),
	    },
	  });
	}

	function updateBoard$1() {
	  if (!cg$2) return;

	  const playerColor = cgTurnColor(chess$2);
	  const playerDests = legalDests(chess$2);

	  cg$2.set({
	    fen: chess$2.fen(),
	    turnColor: playerColor,
	    movable: {
	      color: playerColor,
	      free: false,
	      dests: playerDests,
	    },
	  });
	}

	function isSolved$1() {
	  const node = getNodeAtPath();
	  return !!node && node.children?.length === 0;
	}

	async function finishPuzzle$1() {
	  if (advanceButton$2) {
	    advanceButton$2.disabled = true;
	  }
	  // pause for visual and audio effect
	  await new Promise(resolve => setTimeout(resolve, 1000));

	  if (currentAbortSignal$2?.aborted) return;

	  cleanup$1();
	  resolvePuzzle$2();
	}

	//
	// REPLICATED CODE ACROSS UNITS
	//

	function cleanup$1() {
	  if (advanceButton$2) {
	    advanceButton$2.remove();
	    advanceButton$2 = null;
	  }

	  if (cg$2) {
	    cg$2.destroy();
	    cg$2 = null;
	  }

	  if (currentAbortSignal$2 && onAbortListener$2) {
	    currentAbortSignal$2.removeEventListener("abort", onAbortListener$2);
	    onAbortListener$2 = null;
	  }
	}

	function onAbort$1() {
	  console.log("STANDARD ABORTED");
	  cleanup$1();
	  if (resolvePuzzle$2) {
	    resolvePuzzle$2();
	  }
	}

	const CP_THRESHOLD = 0.3;
	const MARGINAL_THRESHOLD = 0.6;

	let cg$1;
	let chess$1;
	let pgn$1;
	let resolvePuzzle$1;

	let foundCandidates;
	let shapes;
	let marginalMoves;
	let advanceButton$1;
	let currentSignal = null;
	let onAbortListener$1 = null;

	function runCandidatePuzzle(el, loadedPgn, options = {}, signal = null) {
	  return new Promise(resolve => {

	    console.log("IN PUZZLE-CANDIDATES");

	    currentSignal = signal;

	    if (currentSignal?.aborted) {
	      resolve();
	      return;
	    }

	    resolvePuzzle$1 = resolve;

	    const { 
	//      opponentMovesFirst = false,
	      onViewSolution = null,
	    } = options;

	    pgn$1 = loadedPgn;

	    chess$1 = new Chess(pgn$1.tags.FEN);

	    prepareCandidates();

	    setPath([]);

	    foundCandidates = new Set();
	    shapes = [];

	    if (currentSignal) {
	      onAbortListener$1 = onAbort;
	      signal.addEventListener("abort", onAbortListener$1, { once: true });
	    }

	    cg$1 = Chessground(el, {
	      fen: chess$1.fen(),
	      turnColor: cgTurnColor(chess$1),

	      drawable: {
	        enabled: false,
	        shapes: shapes,
	        eraseOnClick: false,
	      },

	      movable: {
	        color: cgTurnColor(chess$1),
	        free: false,
	        dests: legalDests(chess$1),

	        events: {
	          after(orig, dest) {

	            handleMoveWithPromotion(chess$1, orig, dest, handleMove$1);

	          },
	        },
	      },

	      draggable: {
	        showGhost: true,
	      },

	      events: {
	        select(dest) {
	          handleClickMoveWithPromotion(chess$1, cg$1, dest, handleMove$1);
	        }
	      },
	    });

	    const board = el.querySelector("cg-board");
	    board.classList.add(`border-${cgTurnColor(chess$1)}`);

	    window.chess = chess$1;
	    window.cg = cg$1;

	    advanceButton$1 = createViewSolutionButton(
	      onViewSolution,
	      () => {
	        if (currentSignal && onAbortListener$1) {
	          currentSignal.removeEventListener("abort", onAbortListener$1);
	        }
	        cleanup();
	        console.log("CANDIDATES CHESSGROUND DESTROYED - VIEW SOLUTION BUTTON");
	        resolvePuzzle$1();
	      }
	    );

	  });
	}

	function prepareCandidates() {

	  console.log("PREPARE CANDIDATES");

	  marginalMoves = [];

	  const children = pgn$1.moves;

	  const evaluatedChildren = children.filter(
	    node => typeof node?.commentDiag?.eval === "number"
	  );

	  // No evaluations means all variations correct
	  if (evaluatedChildren.length === 0) {
	    return;
	  }

	  // commentDiag.eval is from White's perspective.
	  // Convert evla to the player's perspective
	  const playerColor = chess$1.turn();

	  const candidates = children.map(node => {

	    const evalValue = node?.commentDiag?.eval;

	    return {
	      node,
	      eval:
	        typeof evalValue === "number"
	          ? playerColor === "w"
	            ? evalValue
	            : -evalValue
	          : null,
	    };
	  });

	  const evaluatedCandidates = candidates.filter(
	    candidate => candidate.eval !== null
	  );

	  const bestEval = Math.max(
	    ...evaluatedCandidates.map(candidate => candidate.eval)
	  );

	  const greenMoves = [];

	  for (const candidate of candidates) {

	    // Nodes without evaluations retain the original behavior
	    // and remain valid green candidates.
	    if (candidate.eval === null) {
	      greenMoves.push(candidate.node);
	      continue;
	    }

	    const difference = bestEval - candidate.eval;

	    if (difference <= CP_THRESHOLD) {
	      greenMoves.push(candidate.node);

	    } else if (difference <= MARGINAL_THRESHOLD) {
	      marginalMoves.push(candidate.node);
	    }

	    console.log({
	        move: candidate.node.san,
	        eval: candidate.eval,
	        bestEval,
	        difference,
	        CP_THRESHOLD,
	        MARGINAL_THRESHOLD,
	    });

	  }

	  // The puzzle itself now consists only of green candidates.
	  pgn$1.moves = greenMoves;

	  window.pgn = pgn$1;
	  window.greenMoves = greenMoves;
	  window.marginalMoves = marginalMoves;
	}


	function findMatchingMarginalMove(orig, dest, promotion) {

	  return marginalMoves.some(node =>
	    node.from === orig &&
	    node.to === dest &&
	    (promotion === undefined || node.promotion === promotion)
	  );
	}


	function handleMove$1(orig, dest, promotion = undefined) {

	  if (currentSignal?.aborted) return;

	  const index = findMatchingChildIndex(orig, dest, promotion);

	  if (index !== null) {

	    changeAudio(getNodeAtPath([index]));

	    trackAttempt(orig, dest, "green", index);

	    reviewSession.logAttempt(
	      true,
	      chess$1,
	      orig,
	      dest,
	      promotion
	    );

	  } else if (findMatchingMarginalMove(orig, dest, promotion)) {

	    playSound("error");

	    trackAttempt(orig, dest, "yellow");

	    reviewSession.logAttempt(
	      false,
	      chess$1,
	      orig,
	      dest,
	      promotion
	    );

	  } else {

	    playSound("error");

	    trackAttempt(orig, dest, "red");

	    reviewSession.logAttempt(
	      false,
	      chess$1,
	      orig,
	      dest,
	      promotion
	    );
	  }

	  if (isSolved()) {
	    finishPuzzle();
	    return;
	  }

	  resetBoard$1();
	}


	function trackAttempt(orig, dest, result, index = null) {

	  shapes.push({
	    orig,
	    dest,
	    brush: result,
	  });

	  if (result === "green") {
	    foundCandidates.add(index);
	  }

	  const priority = ["red", "yellow", "green"];

	  shapes.sort(
	    (a, b) =>
	      priority.indexOf(a.brush) - priority.indexOf(b.brush)
	  );

	  cg$1.set({
	    drawable: {
	      shapes: shapes,
	    },
	  });

	}


	function resetBoard$1() {

	  chess$1.load(pgn$1.tags.FEN);

	  cg$1.set({
	    fen: chess$1.fen(),
	    turnColor: cgTurnColor(chess$1),
	    drawable: {
	      shapes: shapes,
	    },
	    movable: {
	      color: cgTurnColor(chess$1),
	      free: false,
	      dests: legalDests(chess$1),
	    },
	  });
	}


	function isSolved() {

	  const children = getChildrenAtPath();

	  return foundCandidates.size === children.length;
	}


	function finishPuzzle() {

	  if (currentSignal?.aborted) return;

	  console.log("Found candidates:", foundCandidates);

	  if (currentSignal && onAbortListener$1) {
	    currentSignal.removeEventListener("abort", onAbortListener$1);
	  }

	  cleanup();

	  console.log("CANDIDATES CHESSGROUND DESTROYED");

	  resolvePuzzle$1();

	}

	//
	// REPLICATED CODE ACROSS UNITS
	//

	function cleanup() {
	  if (advanceButton$1) {
	    advanceButton$1.remove();
	    advanceButton$1 = null;
	  }

	  if (cg$1) {
	    cg$1.destroy();
	    cg$1 = null;
	  }

	  if (currentAbortSignal && onAbortListener$1) {
	    currentAbortSignal.removeEventListener("abort", onAbortListener$1);
	    onAbortListener$1 = null;
	  }
	}

	function onAbort() {
	  console.log("CANDIDATES ABORTED");
	  cleanup();
	  if (resolvePuzzle$1) {
	    resolvePuzzle$1();
	  }
	}

	let cg;
	let chess;
	let pgn;
	let orientation = "white";
	let resolvePuzzle;
	let advanceButton = null;
	let currentAbortSignal$1;
	let onAbortListener = null;

	function runViewer(el, loadedPgn, options={}, signal = null) {
	  return new Promise(resolve => {

	    console.log("IN VIEWER");

	    currentAbortSignal$1 = signal;

	    if (currentAbortSignal$1?.aborted) {
	      resolve();
	      return;
	    }

	    resolvePuzzle = resolve;

	    pgn = loadedPgn;

	    chess = new Chess(pgn.tags.FEN);

	    window.chess = chess;

	    orientation = "white";

	    setPath([]);

	    if (currentAbortSignal$1) {
	      onAbortListener = onAbortViewer;
	      signal.addEventListener("abort", onAbortListener, { once: true });
	    }

	    cg = Chessground(el, {
	      fen: chess.fen(),
	      orientation: orientation,
	      turnColor: cgTurnColor(chess),

	      movable: {
	        color: "both",
	        free: false,
	        dests: legalDests(chess),

	        events: {
	          after(orig, dest) {
	            handleMoveWithPromotion(chess, orig, dest, handleMove);
	          },
	        },
	      },

	      draggable: {
	        showGhost: true,
	      },

	      events: {
	        select(dest) {
	          handleClickMoveWithPromotion(chess, cg, dest, handleMove);
	        }
	      },

	      drawable: {
	        enabled: true,
	        visible: true,
	        autoShapes: [],
	        shapes: [],
	      },
	    });

	    const board = el.querySelector("cg-board");
	    board.classList.add(`border-${cgTurnColor(chess)}`);

	    window.cg = cg;

	    createNavigation();

	    updateBoard();
	    updatePgnArrows();

	    createContinueButton(() => {
	      cleanupViewer();
	      resolve();
	    });
	  });
	}


	function handleMove(orig, dest, promotion = undefined) {

	  const matchingIndex = findMatchingChildIndex(
	    orig,
	    dest,
	    promotion
	  );

	  if (matchingIndex !== null) {

	    const children = getChildrenAtPath();
	    const node = children[matchingIndex];

	    chess.load(node.fenAfter);

	    pgnPath.push(matchingIndex);

	    changeAudio(getNodeAtPath(pgnPath));

	    updateBoard();
	    updatePgnArrows();

	    return;
	  }

	  // not in tree, create temporary user node
	  const node = createNode(chess, orig, dest, promotion);

	  addNodeToPath(node);

	  changeAudio(node);

	  updateChess();
	  updateBoard();
	  updatePgnArrows();
	}

	function moveBackward() {

	  if (pgnPath.length === 0) {
	    return;
	  }

	  playSound("move");

	  const currentNode = getNodeAtPath();

	  if (currentNode?.isOriginal === false) {
	    removeNodeAtPath();
	  } else {
	    pgnPath.pop();
	  }

	  updateChess();
	  updateBoard();
	  updatePgnArrows();
	}


	// move forward in mainline
	function moveForward() {

	  const children = getChildrenAtPath();

	  if (children.length === 0) {
	    return;
	  }

	  pgnPath.push(0);

	  changeAudio(getNodeAtPath());

	  updateChess();
	  updateBoard();
	  updatePgnArrows();
	}

	// reset to starting fen 
	function resetBoard() {

	  playSound("move");

	  // remove temporary nodes
	  while (pgnPath.length > 0) {

	    const currentNode = getNodeAtPath();

	    if (currentNode?.isOriginal === false) {
	      removeNodeAtPath();
	    } else {
	      pgnPath.pop();
	    }
	  }

	  updateChess();
	  updateBoard();
	  updatePgnArrows();
	}

	function updateChess() {

	  const node = getNodeAtPath();

	  if (!node) {
	    chess.load(pgn.tags.FEN);
	    return;
	  }

	  chess.load(node.fenAfter);
	}

	// green arrows for pgn moves
	function updatePgnArrows() {

	  if (!cg) {
	    return;
	  }

	  const children = getChildrenAtPath();

	  const arrows = children
	    .filter(node => node.isOriginal === true)
	    .map(node => ({
	      orig: node.from,
	      dest: node.to,
	      brush: "green",
	    }));

	  cg.set({
	    drawable: {
	      autoShapes: arrows,
	    },
	  });
	}


	function updateBoard() {

	  cg.set({
	    fen: chess.fen(),
	    orientation: orientation,
	    turnColor: cgTurnColor(chess),
	    lastMove: getLastMove(),

	    movable: {
	      color: "both",
	      free: false,
	      dests: legalDests(chess),
	    },
	  });

	  updateNavigationButtons();
	}

	function getLastMove() {
	  const node = getNodeAtPath();

	  if (!node) {
	    return undefined;
	  }

	  return [node.from, node.to];
	}

	function createNavigation() {

	  const buttons = document.getElementById("postboard");

	  buttons.innerHTML = `
    <button
      class="navBtn"
      id="resetBoard"
      title="Back to start"
      aria-label="Back to start"
    >
      <span class="material-icons">first_page</span>
    </button>

    <button
      class="navBtn"
      id="navBackward"
      title="One move back"
      aria-label="One move back"
    >
      <span class="material-icons">keyboard_arrow_left</span>
    </button>

    <button
      class="navBtn"
      id="navForward"
      title="One move forward"
      aria-label="One move forward"
    >
      <span class="material-icons">keyboard_arrow_right</span>
    </button>

    <button
      class="navBtn"
      id="openLichessAnalysis"
      title="Copy FEN to clipboard OR Open Lichess Analysis"
      aria-label="Copy FEN to clipboard OR Open Lichess Analysis"
    >
      <span class="material-icons md-small">content_copy</span>
    </button>

    <button
      class="navBtn"
      id="stockfishToggle"
      title="Computer Analysis"
      aria-label="Computer Analysis"
    >
      <span class="material-icons md-small">developer_board_off</span>
    </button>

    <button
      class="navBtn"
      id="rotateBoard"
      title="Flip board"
      aria-label="Flip board"
    >
      <span class="flipBoardIcon material-icons md-small">flip</span>
    </button>
  `;

	  buttons
	    .querySelector("#resetBoard")
	    .addEventListener("click", resetBoard);

	  buttons
	    .querySelector("#navBackward")
	    .addEventListener("click", moveBackward);

	  buttons
	    .querySelector("#navForward")
	    .addEventListener("click", moveForward);

	  buttons
	    .querySelector("#openLichessAnalysis")
	    .addEventListener("click", openLichessAnalysis);

	  buttons
	    .querySelector("#stockfishToggle")
	    .addEventListener("click", toggleAnalysis);

	  buttons
	    .querySelector("#rotateBoard")
	    .addEventListener("click", rotateBoard);
	}


	function updateNavigationButtons() {

	  const reset =
	    document.getElementById("resetBoard");

	  const back =
	    document.getElementById("navBackward");

	  const forward =
	    document.getElementById("navForward");

	  const atStart =
	    pgnPath.length === 0;

	  const hasForwardMove =
	    getChildrenAtPath().length > 0;

	  if (reset) {
	    reset.disabled = atStart;
	  }

	  if (back) {
	    back.disabled = atStart;
	  }

	  if (forward) {
	    forward.disabled = !hasForwardMove;
	  }
	}

	function openLichessAnalysis() {

	  const fen = chess.fen();

	  const url =
	    `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;

	  window.open(url, "_blank", "noopener,noreferrer");
	}

	// placeholder
	function toggleAnalysis() {

	  console.log(
	    "Computer analysis placeholder"
	  );

	  const button =
	    document.getElementById(
	      "stockfishToggle"
	    );

	  if (button) {
	    button.classList.toggle(
	      "active-toggle"
	    );
	  }
	}


	function rotateBoard() {

	  orientation = orientation === "white" ? "black" : "white";

	  cg.set({
	    orientation: orientation,
	  });
	}


	function createContinueButton(onContinue) {
	  const preboardMiddle = document.querySelector(".preboard-middle");

	  advanceButton = document.createElement("button");

	  advanceButton.textContent = "Continue";
	  advanceButton.className = "continueBtn";

	  advanceButton.addEventListener("click", () => {
	    onContinue();
	  });

	  preboardMiddle.appendChild(advanceButton);
	}

	function cleanupViewer() {
	  if (advanceButton) {
	    advanceButton.remove();
	    advanceButton = null;
	  }

	  const postboard = document.getElementById("postboard");
	  if (postboard) {
	    postboard.innerHTML = "";
	  }

	  if (cg) {
	    cg.destroy();
	    cg = null;
	  }

	  if (currentAbortSignal$1 && onAbortListener) {
	    currentAbortSignal$1.removeEventListener("abort", onAbortListener);
	    onAbortListener = null;
	  }
	}

	function onAbortViewer() {
	  console.log("VIEWER ABORTED");
	  cleanupViewer();
	  if (resolvePuzzle) {
	    resolvePuzzle();
	  }
	}

	function createPuzzleTimer() {

	  const preboard = document.getElementById("preboard");

	  const timer = document.createElement("span");

	  timer.id = "puzzle-timer";
	  timer.textContent = "00:00";

	  preboard.appendChild(timer);

	  return timer;
	}

	function startPuzzleTimer(timerElement) {

	  const start = Date.now();

	  const interval = setInterval(() => {

	    const elapsed = Date.now() - start;

	    timerElement.textContent =
	      formatTime(elapsed);

	  }, 1000);

	  return {
	    stop() {
	      clearInterval(interval);

	      const elapsed = Date.now() - start;

	      timerElement.textContent =
	        formatTime(elapsed);

	      return elapsed;
	    }
	  };
	}

	function formatTime(milliseconds) {

	  const totalSeconds =
	    Math.floor(milliseconds / 1000);

	  const minutes =
	    Math.floor(totalSeconds / 60);

	  const seconds =
	    totalSeconds % 60;

	  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	async function showDeckPicker(element, onDeckSelected) {
	  const overlay = document.createElement("div");
	  overlay.id = "deck-picker";

	  const panel = document.createElement("div");
	  panel.className = "deck-picker-panel";

	  const header = document.createElement("div");
	  header.className = "deck-picker-header";

	  const title = document.createElement("div");
	  title.textContent = "Decks";

	  const closeButton = document.createElement("button");
	  closeButton.type = "button";
	  closeButton.className = "deck-picker-close";
	  closeButton.textContent = "×";
	  closeButton.setAttribute("aria-label", "Close");

	  header.appendChild(title);
	  header.appendChild(closeButton);

	  const list = document.createElement("div");
	  list.className = "deck-list";

	  panel.appendChild(header);
	  panel.appendChild(list);
	  overlay.appendChild(panel);

	  document.getElementById("puzzlebox").appendChild(overlay);

	  closeButton.addEventListener("click", () => {
	    overlay.remove();
	  });

	  overlay.addEventListener("click", event => {
	    if (event.target === overlay) {
	      overlay.remove();
	    }
	  });

	  await refreshDeckList(
	    list,
	    element,
	    overlay,
	    onDeckSelected
	  );
	}

	async function refreshDeckList(
	  list,
	  element,
	  overlay,
	  onDeckSelected
	) {
	  const decks = await getDecks();

	  list.replaceChildren();

	  const folders = new Map();
	  const topLevelDecks = [];

	  for (const deck of decks) {
	    if (deck.folder == null || deck.folder.trim() === "") {
	      topLevelDecks.push(deck);
	      continue;
	    }

	    if (!folders.has(deck.folder)) {
	      folders.set(deck.folder, []);
	    }

	    folders.get(deck.folder).push(deck);
	  }

	  const sortedFolders = [...folders.entries()].sort(
	    ([a], [b]) => a.localeCompare(b)
	  );

	  for (const [folderName, folderDecks] of sortedFolders) {
	    addFolder(
	      list,
	      folderName,
	      folderDecks,
	      element,
	      overlay,
	      onDeckSelected,
	      list
	    );
	  }

	  topLevelDecks.sort((a, b) =>
	    a.name.localeCompare(b.name)
	  );

	  for (const deck of topLevelDecks) {
	    addDeck(
	      list,
	      deck,
	      element,
	      overlay,
	      onDeckSelected,
	      list
	    );
	  }
	}

	function addFolder(
	  container,
	  folderName,
	  decks,
	  element,
	  overlay,
	  onDeckSelected,
	  list
	) {
	  const section = document.createElement("div");
	  section.className = "folder-section";

	  const folderButton = document.createElement("button");
	  folderButton.type = "button";
	  folderButton.className = "folder-button";
	  folderButton.textContent = `▾  ${folderName}`;

	  const contents = document.createElement("div");
	  contents.className = "folder-contents";

	  folderButton.addEventListener("click", () => {
	    contents.hidden = !contents.hidden;

	    folderButton.textContent = contents.hidden
	      ? `▸  ${folderName}`
	      : `▾  ${folderName}`;
	  });

	  section.appendChild(folderButton);
	  section.appendChild(contents);

	  decks.sort((a, b) =>
	    a.name.localeCompare(b.name)
	  );

	  for (const deck of decks) {
	    addDeck(
	      contents,
	      deck,
	      element,
	      overlay,
	      onDeckSelected,
	      list
	    );
	  }

	  container.appendChild(section);
	}

	function addDeck(
	  container,
	  deck,
	  element,
	  overlay,
	  onDeckSelected,
	  list
	) {
	  const row = document.createElement("div");
	  row.className = "deck-row";

	  const button = document.createElement("button");
	  button.type = "button";
	  button.className = "deck-button";
	  button.textContent = deck.name;

	  // Wrapper for stacked right controls
	  const controlStack = document.createElement("div");
	  controlStack.className = "deck-control-stack";

	  const count = document.createElement("span");
	  count.className = "deck-count";
	  count.textContent =
	    `${deck.unreviewed_puzzles}/${deck.total_puzzles}`;

	  const resetButton = document.createElement("button");
	  resetButton.type = "button";
	  resetButton.className = "deck-reset-button";
	  resetButton.textContent = "Reset";
	  resetButton.setAttribute(
	    "aria-label",
	    `Reset ${deck.name}`
	  );

	  button.addEventListener("click", async () => {

	    if (deck.unreviewed_puzzles === 0) {
	      return;
	    }

	    overlay.remove();

	    await onDeckSelected(deck.id, element);
	  });

	  resetButton.addEventListener("click", async event => {
	    event.stopPropagation();

	    resetButton.disabled = true;

	    try {
	      await resetDeck(deck.id);

	      await refreshDeckList(
	        list,
	        element,
	        overlay,
	        onDeckSelected
	      );
	    } finally {
	      resetButton.disabled = false;
	    }
	  });

	  // Append controls to stack container
	  controlStack.appendChild(count);
	  controlStack.appendChild(resetButton);

	  // Append button and stack container to row
	  row.appendChild(button);
	  row.appendChild(controlStack);

	  container.appendChild(row);
	}

	let puzzles = [];
	let puzzleIndex = 0;
	let currentDeckId = null;
	let currentDeckConfig = null;
	let puzzleSession = 0;
	let currentAbortController = null;

	async function run(element) {
	  initAudio(false);

	  createMenu(element);

	  await showDeckPicker(element, startDeck);
	}

	async function startDeck(deckId, element) {

	  // Cancel any running puzzle immediately
	  if (currentAbortController) {
	    currentAbortController.abort();
	  }

	  const session = ++puzzleSession;

	  currentDeckId = deckId;

	  const decks = await getDecks();
	  const deck = decks.find(deck => deck.id === deckId);

	  currentDeckConfig = deck.config ?? {};

	  puzzles = await getDeckPuzzles(deckId);

	  window.puzzles = puzzles;

	  if (session !== puzzleSession) {
	    return;
	  }

	  if (puzzles.length === 0) {
	    return;
	  }

	  if (currentDeckConfig.review_order === "random") {
	    shuffle(puzzles);
	  }

	  puzzleIndex = 0;

	  await startPuzzles(element, session);

	  if (session === puzzleSession) {
	    await showDeckPicker(element, startDeck);
	  }
	}

	async function startPuzzles(element, session) {
	  while ( puzzleIndex < puzzles.length && session === puzzleSession) {

	    currentAbortController = new AbortController();
	    const abortSignal = currentAbortController.signal;

	    const section = document.createElement("section");
	    section.className = "blue merida";

	    const cgWrap = document.createElement("div");
	    cgWrap.className = "cg-wrap";

	    section.appendChild(cgWrap);
	    element.replaceChildren(section);

	    //document.getElementById("preboard")?.replaceChildren();
	    //document.getElementById("buttons-container")?.replaceChildren();

	    const puzzle = puzzles[puzzleIndex];

	    console.log("STARTPUZZLES", puzzleIndex, puzzles.length);
	    console.log("PGN", puzzle.pgn);

	    const pgn = loadPgn(puzzle.pgn);

	    window.pgn = pgn;

	    const timerElement = createPuzzleTimer();
	    const timer = startPuzzleTimer(timerElement);
	    const puzzleIdElement = document.createElement("span");

	    puzzleIdElement.id = "puzzle-id";
	    puzzleIdElement.textContent = `#${puzzle.id}`;

	    const preboardRight = document.querySelector(".preboard-right");
	    preboardRight.replaceChildren(timerElement, puzzleIdElement);
	    reviewSession.initialize(
	      puzzle.id,
	      currentDeckConfig.puzzle_type
	    );

	    let solutionRequested = false;

	    const onViewSolution = () => {
	      if (solutionRequested) return;
	      solutionRequested = true;
	      timer.stop();
	      reviewSession.markIncorrect();
	    };

	    if (currentDeckConfig.puzzle_type === "candidates") {
	      await runCandidatePuzzle(cgWrap, pgn, {onViewSolution, abortSignal});

	    } else if (currentDeckConfig.puzzle_type === "standard") {
	      await runPuzzle(cgWrap, pgn, {onViewSolution,abortSignal});

	    }

	    // User may have switched decks while the puzzle was running.
	    if (session !== puzzleSession || abortSignal.aborted) {
	      timer.stop();
	      return;
	    }

	    timer.stop();

	    const review = reviewSession.getResult();

	    console.log("REVIEW:", review);

	    await writeReview(review);

	    await updatePuzzleStatus(puzzle.id, review);

	    if (session !== puzzleSession || abortSignal.aborted) return;

	    await runViewer(cgWrap, pgn, {abortSignal});

	    if (session !== puzzleSession || abortSignal.aborted) return;

	    puzzleIndex++;
	  }

	  if (session === puzzleSession) {
	    console.log("DECK COMPLETE");
	  }
	}

	async function updatePuzzleStatus(puzzleId, review) {
	  const retain = currentDeckConfig.retain;

	  if (retain === "all") {
	    return;
	  }

	  if (retain === "none") {
	    await updateDeckPuzzleStatus(
	      currentDeckId,
	      puzzleId,
	      "reviewed"
	    );
	    return;
	  }

	  if (retain === "incorrect") {
	    if (review.result === 1) {
	      await updateDeckPuzzleStatus(
	        currentDeckId,
	        puzzleId,
	        "reviewed"
	      );
	    }

	    return;
	  }

	  throw new Error(`Unknown retain setting: ${retain}`);
	}

	function shuffle(array) {
	  for (let i = array.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));

	    [array[i], array[j]] = [array[j], array[i]];
	  }
	}

	function createMenu(element) {
	  const preboardLeft = document.querySelector(".preboard-left");

	  const menu = document.createElement("div");
	  menu.id = "menu";

	  const decksButton = document.createElement("button");
	  decksButton.type = "button";
	  decksButton.className = "menu-item";
	  decksButton.textContent = "♟";
	  decksButton.setAttribute("aria-label", "Decks");
	  decksButton.title = "Decks";

	  decksButton.addEventListener("click", async () => {
	    await showDeckPicker(element, startDeck);
	  });

	  const audioButton = document.createElement("button");
	  audioButton.type = "button";
	  audioButton.className = "menu-item";

	  function updateAudioButton() {
	    const muted = isAudioMuted();

	    audioButton.textContent = muted ? "🔇" : "🔊";
	    audioButton.setAttribute(
	      "aria-label",
	      muted ? "Unmute audio" : "Mute audio"
	    );
	    audioButton.title = muted ? "Unmute audio" : "Mute audio";
	  }

	  updateAudioButton();

	  audioButton.addEventListener("click", () => {
	    setAudioMuted(!isAudioMuted());
	    updateAudioButton();
	  });

	  const exportButton = document.createElement("button");
	  exportButton.type = "button";
	  exportButton.className = "menu-item";
	  exportButton.textContent = "💾";
	  exportButton.setAttribute("aria-label", "Export database");
	  exportButton.title = "Export database";

	  exportButton.addEventListener("click", async () => {
	    await exportDatabase();
	  });

	  menu.appendChild(decksButton);
	  menu.appendChild(audioButton);
	  menu.appendChild(exportButton);

	  preboardLeft.appendChild(menu);
	}

	exports.run = run;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
