/*! modernizr 3.3.1 (Custom Build) | MIT *
 * http://modernizr.com/download/?-csscalc-csstransforms-flexbox-svg-setclasses !*/
!function(e,n,t){function r(e,n){return typeof e===n}function s(){var e,n,t,s,o,i,a;for(var l in y)if(y.hasOwnProperty(l)){if(e=[],n=y[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=r(n.fn,"function")?n.fn():n.fn,o=0;o<e.length;o++)i=e[o],a=i.split("."),1===a.length?Modernizr[a[0]]=s:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=s),x.push((s?"":"no-")+a.join("-"))}}function o(e){var n=C.className,t=Modernizr._config.classPrefix||"";if(_&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),_?C.className.baseVal=n:C.className=n)}function i(e,n){return!!~(""+e).indexOf(n)}function a(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):_?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function l(){var e=n.body;return e||(e=a(_?"svg":"body"),e.fake=!0),e}function f(e,t,r,s){var o,i,f,u,c="modernizr",d=a("div"),p=l();if(parseInt(r,10))for(;r--;)f=a("div"),f.id=s?s[r]:c+(r+1),d.appendChild(f);return o=a("style"),o.type="text/css",o.id="s"+c,(p.fake?p:d).appendChild(o),p.appendChild(d),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(n.createTextNode(e)),d.id=c,p.fake&&(p.style.background="",p.style.overflow="hidden",u=C.style.overflow,C.style.overflow="hidden",C.appendChild(p)),i=t(d,e),p.fake?(p.parentNode.removeChild(p),C.style.overflow=u,C.offsetHeight):d.parentNode.removeChild(d),!!i}function u(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function c(n,r){var s=n.length;if("CSS"in e&&"supports"in e.CSS){for(;s--;)if(e.CSS.supports(u(n[s]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var o=[];s--;)o.push("("+u(n[s])+":"+r+")");return o=o.join(" or "),f("@supports ("+o+") { #modernizr { position: absolute; } }",function(e){return"absolute"==getComputedStyle(e,null).position})}return t}function d(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function p(e,n,s,o){function l(){u&&(delete T.style,delete T.modElem)}if(o=r(o,"undefined")?!1:o,!r(s,"undefined")){var f=c(e,s);if(!r(f,"undefined"))return f}for(var u,p,m,v,g,h=["modernizr","tspan"];!T.style;)u=!0,T.modElem=a(h.shift()),T.style=T.modElem.style;for(m=e.length,p=0;m>p;p++)if(v=e[p],g=T.style[v],i(v,"-")&&(v=d(v)),T.style[v]!==t){if(o||r(s,"undefined"))return l(),"pfx"==n?v:!0;try{T.style[v]=s}catch(y){}if(T.style[v]!=g)return l(),"pfx"==n?v:!0}return l(),!1}function m(e,n){return function(){return e.apply(n,arguments)}}function v(e,n,t){var s;for(var o in e)if(e[o]in n)return t===!1?e[o]:(s=n[e[o]],r(s,"function")?m(s,t||n):s);return!1}function g(e,n,t,s,o){var i=e.charAt(0).toUpperCase()+e.slice(1),a=(e+" "+b.join(i+" ")+i).split(" ");return r(n,"string")||r(n,"undefined")?p(a,n,s,o):(a=(e+" "+N.join(i+" ")+i).split(" "),v(a,n,t))}function h(e,n,r){return g(e,t,t,n,r)}var y=[],w={_version:"3.3.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){y.push({name:e,fn:n,options:t})},addAsyncTest:function(e){y.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=w,Modernizr=new Modernizr;var x=[],C=n.documentElement,_="svg"===C.nodeName.toLowerCase();Modernizr.addTest("svg",!!n.createElementNS&&!!n.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect);var S="Moz O ms Webkit",b=w._config.usePrefixes?S.split(" "):[];w._cssomPrefixes=b;var E={elem:a("modernizr")};Modernizr._q.push(function(){delete E.elem});var T={style:E.elem.style};Modernizr._q.unshift(function(){delete T.style});var N=w._config.usePrefixes?S.toLowerCase().split(" "):[];w._domPrefixes=N,w.testAllProps=g,w.testAllProps=h,Modernizr.addTest("flexbox",h("flexBasis","1px",!0));var P=w._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];w._prefixes=P,Modernizr.addTest("csscalc",function(){var e="width:",n="calc(10px);",t=a("a");return t.style.cssText=e+P.join(n+e),!!t.style.length}),Modernizr.addTest("csstransforms",function(){return-1===navigator.userAgent.indexOf("Android 2.")&&h("transform","scale(1)",!0)}),s(),o(x),delete w.addTest,delete w.addAsyncTest;for(var z=0;z<Modernizr._q.length;z++)Modernizr._q[z]();e.Modernizr=Modernizr}(window,document);