(function(e){function t(t){for(var a,c,s=t[0],i=t[1],l=t[2],u=0,d=[];u<s.length;u++)c=s[u],Object.prototype.hasOwnProperty.call(o,c)&&o[c]&&d.push(o[c][0]),o[c]=0;for(a in i)Object.prototype.hasOwnProperty.call(i,a)&&(e[a]=i[a]);b&&b(t);while(d.length)d.shift()();return r.push.apply(r,l||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],a=!0,c=1;c<n.length;c++){var i=n[c];0!==o[i]&&(a=!1)}a&&(r.splice(t--,1),e=s(s.s=n[0]))}return e}var a={},o={app:0},r=[];function c(e){return s.p+"js/"+({about:"about"}[e]||e)+"."+{about:"079860ef"}[e]+".js"}function s(t){if(a[t])return a[t].exports;var n=a[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.e=function(e){var t=[],n=o[e];if(0!==n)if(n)t.push(n[2]);else{var a=new Promise((function(t,a){n=o[e]=[t,a]}));t.push(n[2]=a);var r,i=document.createElement("script");i.charset="utf-8",i.timeout=120,s.nc&&i.setAttribute("nonce",s.nc),i.src=c(e);var l=new Error;r=function(t){i.onerror=i.onload=null,clearTimeout(u);var n=o[e];if(0!==n){if(n){var a=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;l.message="Loading chunk "+e+" failed.\n("+a+": "+r+")",l.name="ChunkLoadError",l.type=a,l.request=r,n[1](l)}o[e]=void 0}};var u=setTimeout((function(){r({type:"timeout",target:i})}),12e4);i.onerror=i.onload=r,document.head.appendChild(i)}return Promise.all(t)},s.m=e,s.c=a,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)s.d(n,a,function(t){return e[t]}.bind(null,a));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="/",s.oe=function(e){throw console.error(e),e};var i=window["webpackJsonp"]=window["webpackJsonp"]||[],l=i.push.bind(i);i.push=t,i=i.slice();for(var u=0;u<i.length;u++)t(i[u]);var b=l;r.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("7a23"),o={id:"app"},r={class:"centered"},c=Object(a["h"])("br",null,null,-1),s=Object(a["h"])("br",null,null,-1),i=Object(a["h"])("br",null,null,-1),l=Object(a["h"])("br",null,null,-1),u=Object(a["h"])("br",null,null,-1);function b(e,t,n,b,d,v){var f=this,p=Object(a["z"])("Navbar"),O=Object(a["z"])("Loader"),j=Object(a["z"])("router-view");return Object(a["r"])(),Object(a["e"])("div",o,[Object(a["h"])(p,{sessionActive:e.sessionActive},null,8,["sessionActive"]),Object(a["h"])("div",r,[c,Object(a["h"])("button",{type:"button",class:"btn btn-primary",onClick:t[1]||(t[1]=function(e){return v.showToast("Notification ".concat(f.$store.state.count),"success",3e3)})}," Notification "),this.$store.state.loader?(Object(a["r"])(),Object(a["e"])(O,{key:0})):Object(a["f"])("",!0),Object(a["h"])(j),Object(a["h"])("button",{type:"button",class:"btn btn-warning",onClick:t[2]||(t[2]=function(e){return f.$store.state.loader=!f.$store.state.loader})}," Loader is "+Object(a["C"])(this.$store.state.loader),1),s,i,Object(a["h"])("button",{type:"button",class:"btn btn-success",onClick:t[3]||(t[3]=function(t){return e.sessionActive=!e.sessionActive})}," Session is "+Object(a["C"])(e.sessionActive),1),l,u,Object(a["h"])("button",{type:"button",class:"btn btn-danger",onClick:t[4]||(t[4]=function(e){return f.$store.state.count++})}," Session is "+Object(a["C"])(this.$store.state.count),1)])])}n("ab8b"),n("9537"),n("3e48");var d=Object(a["J"])("data-v-49b1cb2d");Object(a["u"])("data-v-49b1cb2d");var v={id:"nav"},f={class:"navbar navbar-expand-lg navbar-dark bg-dark"},p={class:"container-fluid"},O=Object(a["g"])("SwipeHub"),j=Object(a["h"])("button",{class:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarSupportedContent","aria-controls":"navbarSupportedContent","aria-expanded":"false","aria-label":"Toggle navigation"},[Object(a["h"])("span",{class:"navbar-toggler-icon"})],-1),h={class:"collapse navbar-collapse",id:"navbarSupportedContent"},m={class:"navbar-nav me-auto mb-2 mb-lg-0"},g={class:"nav-item"},y=Object(a["g"])("Home"),k={key:0,class:"nav-item",onclick:"openPage('session')"},w=Object(a["g"])("Session"),S={key:1,class:"nav-item"},C=Object(a["h"])("a",{class:"nav-link active",id:"matchTab"},"Matches",-1),A={key:0,class:"navbar-nav"},_=Object(a["h"])("li",{class:"nav-item",onclick:"createShareLink()"},[Object(a["h"])("a",{class:"nav-link",id:"matchTab"},"Share Joinable Link")],-1),P=Object(a["h"])("li",{class:"nav-item dropdown"},[Object(a["h"])("a",{class:"nav-link dropdown-toggle",href:"#",id:"navbarDropdown",role:"button","data-bs-toggle":"dropdown","aria-expanded":"false"}," Session Info "),Object(a["h"])("ul",{class:"dropdown-menu dropdown-menu-dark","aria-labelledby":"navbarDropdown"},[Object(a["h"])("li",null,[Object(a["h"])("a",{class:"dropdown-item",id:"userIdPlaceholder"},"User Id")]),Object(a["h"])("li",null,[Object(a["h"])("hr",{class:"dropdown-divider"})]),Object(a["h"])("li",null,[Object(a["h"])("a",{class:"dropdown-item",id:"sessionIdPlaceholder",onclick:"copyToClipboard('sessionId')"},"SessionId")])])],-1),T=Object(a["h"])("li",{class:"nav-item",onclick:"leaveSession()"},[Object(a["h"])("a",{class:"nav-link",id:"leaveSessionBtn"},"Leave Session")],-1);Object(a["s"])();var $=d((function(e,t,n,o,r,c){var s=Object(a["z"])("router-link");return Object(a["r"])(),Object(a["e"])("div",v,[Object(a["h"])("nav",f,[Object(a["h"])("div",p,[Object(a["h"])(s,{class:"navbar-brand",to:"/",onClick:t[1]||(t[1]=function(e){return c.increment()})},{default:d((function(){return[O]})),_:1}),j,Object(a["h"])("div",h,[Object(a["h"])("ul",m,[Object(a["h"])("li",g,[Object(a["h"])(s,{class:"nav-link",to:"/"},{default:d((function(){return[y]})),_:1})]),n.sessionActive?(Object(a["r"])(),Object(a["e"])("li",k,[Object(a["h"])(s,{class:"nav-link",to:"/about"},{default:d((function(){return[w]})),_:1})])):Object(a["f"])("",!0),n.sessionActive?(Object(a["r"])(),Object(a["e"])("li",S,[C])):Object(a["f"])("",!0)]),n.sessionActive?(Object(a["r"])(),Object(a["e"])("ul",A,[_,P,T])):Object(a["f"])("",!0)])])])])})),x=n("5502"),I=Object(x["a"])({state:{count:0,loader:!1},mutations:{increment:function(e){e.count++}}}),L={name:"Navbar",store:I,props:{sessionActive:{type:Boolean}},methods:{increment:function(){this.$store.commit("increment")}}};n("8d6a");L.render=$,L.__scopeId="data-v-49b1cb2d";var H=L,J=Object(a["J"])("data-v-0ff8c030");Object(a["u"])("data-v-0ff8c030");var z={class:"loader"};Object(a["s"])();var M=J((function(e,t,n,o,r,c){return Object(a["r"])(),Object(a["e"])("div",z)})),N={name:"Loader"};n("6eb9");N.render=M,N.__scopeId="data-v-0ff8c030";var E=N,W=n("6c42"),B={name:"App",components:{Navbar:H,Loader:E},setup:function(){var e=Object(W["b"])();return{toast:e}},store:I,data:function(){return{sessionActive:!1}},methods:{increment:function(){this.$store.commit("increment")},showToast:function(e,t,n){this.toast(e,{type:t,timeout:n})}}};n("ba12");B.render=b;var D=B,q=(n("d3b7"),n("3ca3"),n("ddb0"),n("6c02")),U={class:"home"};function V(e,t,n,o,r,c){var s=Object(a["z"])("HelloWorld");return Object(a["r"])(),Object(a["e"])("div",U,[Object(a["h"])(s,{msg:"Anant & Varun"}),Object(a["h"])("h1",null,Object(a["C"])(e.$store.state.count),1)])}var F=Object(a["J"])("data-v-43f48a4c");Object(a["u"])("data-v-43f48a4c");var G={class:"hello"};Object(a["s"])();var K=F((function(e,t,n,o,r,c){return Object(a["r"])(),Object(a["e"])("div",G,[Object(a["h"])("h1",null,Object(a["C"])(n.msg),1)])})),Q={name:"HelloWorld",props:{msg:String}};n("ffd7");Q.render=K,Q.__scopeId="data-v-43f48a4c";var R=Q,X={name:"Home",store:I,components:{HelloWorld:R},mounted:function(){this.$store.state.count+=1}};X.render=V;var Y=X,Z=[{path:"/",name:"Home",component:Y},{path:"/about",name:"About",component:function(){return n.e("about").then(n.bind(null,"f820"))}}],ee=Object(q["a"])({history:Object(q["b"])("/"),routes:Z}),te=ee,ne=(n("8199"),{position:"top-center",maxToasts:3,closeOnClick:!1,pauseOnHover:!1});Object(a["d"])(D).use(I).use(W["a"],ne).use(te).mount("#app")},"6eb9":function(e,t,n){"use strict";n("ea10")},8199:function(e,t,n){},"8d6a":function(e,t,n){"use strict";n("bce6")},ba12:function(e,t,n){"use strict";n("d539")},bce6:function(e,t,n){},d539:function(e,t,n){},ea10:function(e,t,n){},f540:function(e,t,n){},ffd7:function(e,t,n){"use strict";n("f540")}});
//# sourceMappingURL=app.04c45efd.js.map