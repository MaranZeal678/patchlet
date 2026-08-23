(function(){"use strict";var be,x,ze,X,We,Ke,Ye,Ie,_e,ae,Je,Me,Oe,Re,me={},ve=[],Yt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ye=Array.isArray;function K(e,t){for(var n in t)e[n]=t[n];return e}function Pe(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Jt(e,t,n){var r,i,o,s={};for(o in t)o=="key"?r=t[o]:o=="ref"?i=t[o]:s[o]=t[o];if(arguments.length>2&&(s.children=arguments.length>3?be.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)s[o]===void 0&&(s[o]=e.defaultProps[o]);return we(e,s,r,i,null)}function we(e,t,n,r,i){var o={type:e,props:t,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++ze,__i:-1,__u:0};return i==null&&x.vnode!=null&&x.vnode(o),o}function ie(e){return e.children}function xe(e,t){this.props=e,this.context=t}function te(e,t){if(t==null)return e.__?te(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?te(e):null}function Qt(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,r=[],i=[],o=K({},t);o.__v=t.__v+1,x.vnode&&x.vnode(o),De(e.__P,o,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,r,n??te(t),!!(32&t.__u),i),o.__v=t.__v,o.__.__k[o.__i]=o,it(r,o,i),t.__e=t.__=null,o.__e!=n&&Qe(o)}}function Qe(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Qe(e)}function Xe(e){(!e.__d&&(e.__d=!0)&&X.push(e)&&!ke.__r++||We!=x.debounceRendering)&&((We=x.debounceRendering)||Ke)(ke)}function ke(){try{for(var e,t=1;X.length;)X.length>t&&X.sort(Ye),e=X.shift(),t=X.length,Qt(e)}finally{X.length=ke.__r=0}}function Ze(e,t,n,r,i,o,s,l,p,c,f){var b,a,h,m,k,S,A=r&&r.__k||ve,_=t.length;for(p=Xt(n,t,A,p,_),b=0;b<_;b++)(h=n.__k[b])!=null&&(a=h.__i!=-1&&A[h.__i]||me,h.__i=b,S=De(e,h,a,i,o,s,l,p,c,f),m=h.__e,h.ref&&a.ref!=h.ref&&(a.ref&&He(a.ref,null,h),f.push(h.ref,h.__c||m,h)),k==null&&m!=null&&(k=m),4&h.__u?(p=et(h,p,e),a.__e&&(a.__e=null)):typeof h.type=="function"&&S!==void 0?p=S:m&&(p=m.nextSibling),h.__u&=-7);return n.__e=k,p}function Xt(e,t,n,r,i){var o,s,l,p,c,f=n.length,b=f,a=0;for(e.__k=new Array(i),o=0;o<i;o++)(s=t[o])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[o]=we(null,s,null,null,null):ye(s)?s=e.__k[o]=we(ie,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[o]=we(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[o]=s,p=o+a,s.__=e,s.__b=e.__b+1,l=null,(c=s.__i=Zt(s,n,p,b))!=-1&&(b--,(l=n[c])&&(l.__u|=2)),l==null||l.__v==null?(c==-1&&(i>f?a--:i<f&&a++),typeof s.type!="function"&&(s.__u|=4)):c!=p&&(c==p-1?a--:c==p+1?a++:(c>p?a--:a++,s.__u|=4))):e.__k[o]=null;if(b)for(o=0;o<f;o++)(l=n[o])!=null&&(2&l.__u)==0&&(l.__e==r&&(r=te(l)),st(l,l));return r}function et(e,t,n){var r,i;if(typeof e.type=="function"){for(r=e.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=e,t=et(r[i],t,n));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=te(e)),t=n.insertBefore(e.__e,t||null));do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Zt(e,t,n,r){var i,o,s,l=e.key,p=e.type,c=t[n],f=c!=null&&(2&c.__u)==0;if(c===null&&l==null||f&&l==c.key&&p==c.type)return n;if(r>(f?1:0)){for(i=n-1,o=n+1;i>=0||o<t.length;)if((c=t[s=i>=0?i--:o++])!=null&&(2&c.__u)==0&&l==c.key&&p==c.type)return s}return-1}function tt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Yt.test(t)?n:n+"px"}function Se(e,t,n,r,i){var o,s;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof r=="string"&&(e.style.cssText=r=""),r)for(t in r)n&&t in n||tt(e.style,t,"");if(n)for(t in n)r&&n[t]==r[t]||tt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")o=t!=(t=t.replace(Je,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+o]=n,n?r?n[ae]=r[ae]:(n[ae]=Me,e.addEventListener(t,o?Re:Oe,o)):e.removeEventListener(t,o?Re:Oe,o);else{if(i=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function nt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[_e]==null)t[_e]=Me++;else if(t[_e]<n[ae])return;return n(x.event?x.event(t):t)}}}function De(e,t,n,r,i,o,s,l,p,c){var f,b,a,h,m,k,S,A,_,u,w,v,M,D,H,$,N=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),o=[l=t.__e=n.__e]),(f=x.__b)&&f(t);e:if(typeof N=="function"){b=s.length;try{if(_=t.props,u=N.prototype&&N.prototype.render,w=(f=N.contextType)&&r[f.__c],v=f?w?w.props.value:f.__:r,n.__c?A=(a=t.__c=n.__c).__=a.__E:(u?t.__c=a=new N(_,v):(t.__c=a=new xe(_,v),a.constructor=N,a.render=tn),w&&w.sub(a),a.state||(a.state={}),a.__n=r,h=a.__d=!0,a.__h=[],a._sb=[]),u&&a.__s==null&&(a.__s=a.state),u&&N.getDerivedStateFromProps!=null&&(a.__s==a.state&&(a.__s=K({},a.__s)),K(a.__s,N.getDerivedStateFromProps(_,a.__s))),m=a.props,k=a.state,a.__v=t,h)u&&N.getDerivedStateFromProps==null&&a.componentWillMount!=null&&a.componentWillMount(),u&&a.componentDidMount!=null&&a.__h.push(a.componentDidMount);else{if(u&&N.getDerivedStateFromProps==null&&_!==m&&a.componentWillReceiveProps!=null&&a.componentWillReceiveProps(_,v),t.__v==n.__v||!a.__e&&a.shouldComponentUpdate!=null&&a.shouldComponentUpdate(_,a.__s,v)===!1){t.__v!=n.__v&&(a.props=_,a.state=a.__s,a.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(L){L&&(L.__=t)}),ve.push.apply(a.__h,a._sb),a._sb=[],a.__h.length&&s.push(a),l=te(n);break e}a.componentWillUpdate!=null&&a.componentWillUpdate(_,a.__s,v),u&&a.componentDidUpdate!=null&&a.__h.push(function(){a.componentDidUpdate(m,k,S)})}if(a.context=v,a.props=_,a.__P=e,a.__e=!1,M=x.__r,D=0,u)a.state=a.__s,a.__d=!1,M&&M(t),f=a.render(a.props,a.state,a.context),ve.push.apply(a.__h,a._sb),a._sb=[];else do a.__d=!1,M&&M(t),f=a.render(a.props,a.state,a.context),a.state=a.__s;while(a.__d&&++D<25);a.state=a.__s,a.getChildContext!=null&&(r=K(K({},r),a.getChildContext())),u&&!h&&a.getSnapshotBeforeUpdate!=null&&(S=a.getSnapshotBeforeUpdate(m,k)),H=f!=null&&f.type===ie&&f.key==null?ot(f.props.children):f,l=Ze(e,ye(H)?H:[H],t,n,r,i,o,s,l,p,c),a.base=t.__e,t.__u&=-161,a.__h.length&&s.push(a),A&&(a.__E=a.__=null)}catch(L){if(s.length=b,t.__v=null,p||o!=null){if(L.then){for(t.__u|=p?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;o!=null&&(o[o.indexOf(l)]=null),t.__e=l}else if(o!=null)for($=o.length;$--;)Pe(o[$])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),L.then||rt(t),x.__e(L,t,n)}}else o==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):l=t.__e=en(n.__e,t,n,r,i,o,s,p,c);return(f=x.diffed)&&f(t),128&t.__u?void 0:l}function rt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(rt))}function it(e,t,n){for(var r=0;r<n.length;r++)He(n[r],n[++r],n[++r]);x.__c&&x.__c(t,e),e.some(function(i){try{e=i.__h,i.__h=[],e.some(function(o){o.call(i)})}catch(o){x.__e(o,i.__v)}})}function ot(e){return typeof e!="object"||e==null||e.__b>0?e:ye(e)?e.map(ot):e.constructor!==void 0?null:K({},e)}function en(e,t,n,r,i,o,s,l,p){var c,f,b,a,h,m,k,S=n.props||me,A=t.props,_=t.type;if(_=="svg"?i="http://www.w3.org/2000/svg":_=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),o!=null){for(c=0;c<o.length;c++)if((h=o[c])&&"setAttribute"in h==!!_&&(_?h.localName==_:h.nodeType==3)){e=h,o[c]=null;break}}if(e==null){if(_==null)return document.createTextNode(A);e=document.createElementNS(i,_,A.is&&A),l&&(x.__m&&x.__m(t,o),l=!1),o=null}if(_==null)S===A||l&&e.data==A||(e.data=A);else{if(o=_=="textarea"&&A.defaultValue!=null?null:o&&be.call(e.childNodes),!l&&o!=null)for(S={},c=0;c<e.attributes.length;c++)S[(h=e.attributes[c]).name]=h.value;for(c in S)h=S[c],c=="dangerouslySetInnerHTML"?b=h:c=="children"||c in A||c=="value"&&"defaultValue"in A||c=="checked"&&"defaultChecked"in A||Se(e,c,null,h,i);for(c in A)h=A[c],c=="children"?a=h:c=="dangerouslySetInnerHTML"?f=h:c=="value"?m=h:c=="checked"?k=h:l&&typeof h!="function"||S[c]===h||Se(e,c,h,S[c],i);if(f)l||b&&(f.__html==b.__html||f.__html==e.innerHTML)||(e.innerHTML=f.__html),t.__k=[];else if(b&&(e.innerHTML=""),Ze(t.type=="template"?e.content:e,ye(a)?a:[a],t,n,r,_=="foreignObject"?"http://www.w3.org/1999/xhtml":i,o,s,o?o[0]:n.__k&&te(n,0),l,p),o!=null)for(c=o.length;c--;)Pe(o[c]);l&&_!="textarea"||(c="value",_=="progress"&&m==null?e.removeAttribute("value"):m!=null&&(m!==e[c]||_=="progress"&&!m||_=="option"&&m!=S[c])&&Se(e,c,m,S[c],i),c="checked",k!=null&&k!=e[c]&&Se(e,c,k,S[c],i))}return e}function He(e,t,n){try{if(typeof e=="function"){var r=typeof e.__u=="function";r&&e.__u(),r&&t==null||(e.__u=e(t))}else e.current=t}catch(i){x.__e(i,n)}}function st(e,t,n){var r,i;if(x.unmount&&x.unmount(e),(r=e.ref)&&(r.current&&r.current!=e.__e||He(r,null,t)),(r=e.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(o){x.__e(o,t)}r.base=r.__P=r.__n=null}if(r=e.__k)for(i=0;i<r.length;i++)r[i]&&st(r[i],t,n||typeof e.type!="function");n||Pe(e.__e),e.__c=e.__=e.__e=void 0}function tn(e,t,n){return this.constructor(e,n)}function nn(e,t,n){var r,i,o,s;t==document&&(t=document.documentElement),x.__&&x.__(e,t),i=(r=!1)?null:t.__k,o=[],s=[],De(t,e=t.__k=Jt(ie,null,[e]),i||me,me,t.namespaceURI,i?null:t.firstChild?be.call(t.childNodes):null,o,i?i.__e:t.firstChild,r,s),it(o,e,s),e.props.children=null}be=ve.slice,x={__e:function(e,t,n,r){for(var i,o,s;t=t.__;)if((i=t.__c)&&!i.__)try{if((o=i.constructor)&&o.getDerivedStateFromError!=null&&(i.setState(o.getDerivedStateFromError(e)),s=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,r||{}),s=i.__d),s)return i.__E=i}catch(l){e=l}throw e}},ze=0,xe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=K({},this.state),typeof e=="function"&&(e=e(K({},n),this.props)),e&&K(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Xe(this))},xe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Xe(this))},xe.prototype.render=ie,X=[],Ke=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ye=function(e,t){return e.__v.__b-t.__v.__b},ke.__r=0,Ie=Math.random().toString(8),_e="__d"+Ie,ae="__a"+Ie,Je=/(PointerCapture)$|Capture$/i,Me=0,Oe=nt(!1),Re=nt(!0);var rn=0;function d(e,t,n,r,i,o){t||(t={});var s,l,p=t;if("ref"in p)for(l in p={},t)l=="ref"?s=t[l]:p[l]=t[l];var c={type:e,props:p,key:n,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--rn,__i:-1,__u:0,__source:i,__self:o};if(typeof e=="function"&&(s=e.defaultProps))for(l in s)p[l]===void 0&&(p[l]=s[l]);return x.vnode&&x.vnode(c),c}var le,C,$e,at,ce=0,lt=[],I=x,ct=I.__b,ut=I.__r,pt=I.diffed,dt=I.__c,ht=I.unmount,ft=I.__;function Ue(e,t){I.__h&&I.__h(C,e,ce||t),ce=0;var n=C.__H||(C.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function U(e){return ce=1,on(_t,e)}function on(e,t,n){var r=Ue(le++,2);if(r.t=e,!r.__c&&(r.__=[_t(void 0,t),function(l){var p=r.__N?r.__N[0]:r.__[0],c=r.t(p,l);p!==c&&(r.__N=[c,r.__[1]],r.__c.setState({}))}],r.__c=C,!C.__f)){var i=function(l,p,c){if(!r.__c.__H)return!0;var f=!1,b=r.__c.props!==l;if(r.__c.__H.__.some(function(h){if(h.__N){f=!0;var m=h.__[0];h.__=h.__N,h.__N=void 0,m!==h.__[0]&&(b=!0)}}),o){var a=o.call(this,l,p,c);return f?a||b:a}return!f||b};C.__f=!0;var o=C.shouldComponentUpdate,s=C.componentWillUpdate;C.componentWillUpdate=function(l,p,c){if(this.__e){var f=o;o=void 0,i(l,p,c),o=f}s&&s.call(this,l,p,c)},C.shouldComponentUpdate=i}return r.__N||r.__}function Z(e,t){var n=Ue(le++,3);!I.__s&&bt(n.__H,t)&&(n.__=e,n.u=t,C.__H.__h.push(n))}function z(e){return ce=5,Ee(function(){return{current:e}},[])}function Ee(e,t){var n=Ue(le++,7);return bt(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function F(e,t){return ce=8,Ee(function(){return e},t)}function sn(){for(var e;e=lt.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ae),t.__h.some(Ve),t.__h=[]}catch(n){t.__h=[],I.__e(n,e.__v)}}}I.__b=function(e){C=null,ct&&ct(e)},I.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),ft&&ft(e,t)},I.__r=function(e){ut&&ut(e),le=0;var t=(C=e.__c).__H;t&&($e===C?(t.__h=[],C.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.some(Ae),t.__h.some(Ve),t.__h=[],le=0)),$e=C},I.diffed=function(e){pt&&pt(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(lt.push(t)!==1&&at===I.requestAnimationFrame||((at=I.requestAnimationFrame)||an)(sn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),$e=C=null},I.__c=function(e,t){t.some(function(n){try{n.__h.some(Ae),n.__h=n.__h.filter(function(r){return!r.__||Ve(r)})}catch(r){t.some(function(i){i.__h&&(i.__h=[])}),t=[],I.__e(r,n.__v)}}),dt&&dt(e,t)},I.unmount=function(e){ht&&ht(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(r){try{Ae(r)}catch(i){t=i}}),n.__H=void 0,t&&I.__e(t,n.__v))};var gt=typeof requestAnimationFrame=="function";function an(e){var t,n=function(){clearTimeout(r),gt&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,35);gt&&(t=requestAnimationFrame(n))}function Ae(e){var t=C,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),C=t}function Ve(e){var t=C;e.__c=e.__(),C=t}function bt(e,t){return!e||e.length!==t.length||t.some(function(n,r){return n!==e[r]})}function _t(e,t){return typeof t=="function"?t(e):t}function ln(e=document){const t=e.documentElement?.getBoundingClientRect();return!!(t&&t.width+t.height>0)}function oe(e){if(!e||!e.isConnected)return!1;const t=e.ownerDocument;if(!t||!ln(t))return!0;const n=e.getBoundingClientRect();if(n.width<=0||n.height<=0)return!1;const r=t.defaultView,i=r?.innerWidth??0,o=r?.innerHeight??0;return n.bottom>-o&&n.right>-i&&n.top<o*2&&n.left<i*2}let mt=!1;const qe=new Set;function cn(){if(!(mt||typeof history>"u")){mt=!0;for(const e of["pushState","replaceState"]){const t=history[e];history[e]=function(...r){const i=t.apply(this,r);for(const o of qe)o();return i}}}}function un(e){cn();let t=location.href;const n=()=>{location.href!==t&&(t=location.href,e())};return qe.add(n),addEventListener("popstate",n),addEventListener("hashchange",n),()=>{qe.delete(n),removeEventListener("popstate",n),removeEventListener("hashchange",n)}}function pn(e,t=300,n=document.body){if(typeof MutationObserver>"u")return()=>{};let r;const i=new MutationObserver(()=>{r&&clearTimeout(r),r=setTimeout(e,t)});return i.observe(n,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","hidden","aria-hidden"]}),()=>{r&&clearTimeout(r),i.disconnect()}}function dn(e=300,t=1500,n=document.body){return new Promise(r=>{let i=!1,o,s;const l=typeof MutationObserver>"u"||!n?null:new MutationObserver(()=>c()),p=()=>{i||(i=!0,o&&clearTimeout(o),s&&clearTimeout(s),l?.disconnect(),r())},c=()=>{o&&clearTimeout(o),o=setTimeout(p,e)};l&&n&&(l.observe(n,{childList:!0,subtree:!0,attributes:!0}),s=setTimeout(p,t)),c()})}function hn(e,t=300){const n=un(()=>setTimeout(e,t)),r=pn(e,t);return()=>{n(),r()}}const Ge=1500,fn=3,gn=[0,120,400,900,Ge];class bn{constructor(t){this.deps=t,this.state="DONE",this.steps=[],this.index=0,this.lookup=new Map,this.affordances=new Map,this.target=null,this.message=null,this.unwatch=null,this.replanning=!1,this.recoveries=0,this.pressed=null,this.vanishTimers=[],this.onUserEvent=n=>{if(this.state!=="SPOTLIGHTING"||!this.target)return;const r=this.steps[this.index];if(r&&_n(n,this.target)){if(n.type==="pointerdown"){if(r.advanceOn!=="click"&&r.advanceOn!=="navigation")return;this.arm(this.target);return}if(mn(r.advanceOn,n.type)){if(n.type==="keydown"){const i=n.key;if(i!=="Enter"&&i!==" "&&i!=="Spacebar")return}this.enterVerifying()}}},this.onPageChanged=()=>{if(this.state==="DONE"||this.state==="FAILED"||this.replanning)return;const n=this.steps[this.index];if(n){if(this.pressed){this.checkPressedVanished();return}if(n.advanceOn==="navigation"&&this.state==="SPOTLIGHTING"){this.enterVerifying();return}oe(this.target)||this.recover()}},this.doc=t.doc??document,this.settleMs=t.settleMs??300}get snapshot(){return{state:this.state,stepIndex:this.index,total:this.steps.length,step:this.steps[this.index]??null,target:this.target,message:this.message}}start(t,n){this.stopListening(),this.steps=n,this.index=0,this.message=null,this.adoptScan(t);for(const r of["pointerdown","click","keydown","input","change"])this.doc.addEventListener(r,this.onUserEvent,!0);this.deps.watch&&(this.unwatch=this.deps.watch(this.onPageChanged)),this.enterSpotlight()}next(){this.state!=="SPOTLIGHTING"&&this.state!=="VERIFYING"||this.enterSnapshot()}lost(){this.state==="SPOTLIGHTING"&&this.recover()}stop(){this.stopListening(),this.target=null,this.transition("DONE")}dispose(){this.stopListening()}stopListening(){this.clearVanishChecks(),this.pressed=null;for(const t of["pointerdown","click","keydown","input","change"])this.doc.removeEventListener(t,this.onUserEvent,!0);this.unwatch?.(),this.unwatch=null}adoptScan(t){this.lookup=t.lookup,this.affordances=new Map(t.page.affordances.map(n=>[n.id,n]))}transition(t){this.state=t,this.deps.onChange(this.snapshot)}enterSpotlight(){const t=this.steps[this.index];if(!t){this.stopListening(),this.target=null,this.transition("DONE");return}const n=this.lookup.get(t.target)??null;if(!oe(n)){this.target=null,this.recover();return}this.target=n,this.message=null,this.transition("SPOTLIGHTING")}arm(t){this.clearVanishChecks(),this.pressed={element:t,at:Date.now(),index:this.index};for(const n of gn)this.vanishTimers.push(setTimeout(()=>this.checkPressedVanished(),n))}clearVanishChecks(){for(const t of this.vanishTimers)clearTimeout(t);this.vanishTimers=[]}checkPressedVanished(){const t=this.pressed;if(!(!t||this.state!=="SPOTLIGHTING"||t.index!==this.index)){if(Date.now()-t.at>Ge){this.clearVanishChecks(),this.pressed=null;return}oe(t.element)||(this.clearVanishChecks(),this.pressed=null,this.enterVerifying())}}enterVerifying(){this.clearVanishChecks(),this.pressed=null,this.transition("VERIFYING"),this.settle().then(()=>{this.state==="VERIFYING"&&this.enterSnapshot()})}settle(){return this.deps.settle?this.deps.settle():dn(this.settleMs,Ge,this.doc.body)}async enterSnapshot(){if(this.clearVanishChecks(),this.pressed=null,this.transition("SNAPSHOTTING"),this.index+=1,this.recoveries=0,this.index>=this.steps.length){await this.continueOrFinish();return}const t=this.steps[this.index],n=this.affordances.get(t.target),r=this.deps.rescan(),i=n?vt(r,n):null;if(this.adoptScan(r),n&&!i){await this.recover();return}i&&i!==t.target&&(this.steps=this.steps.map((o,s)=>s===this.index?{...o,target:i}:o)),this.enterSpotlight()}async continueOrFinish(){if(!this.replanning){this.replanning=!0,this.target=null,this.transition("SNAPSHOTTING");try{const t=await this.deps.replan(this.index);if(t&&t.steps.length>0){this.steps=[...this.steps.slice(0,this.index),...t.steps],this.adoptScan(t),this.replanning=!1,this.enterSpotlight();return}}catch{}this.replanning=!1,this.stopListening(),this.target=null,this.transition("DONE")}}async recover(){if(!this.replanning){if(this.recoveries>=fn){this.message="That control is no longer on the page.",this.stopListening(),this.target=null,this.transition("FAILED");return}this.recoveries+=1,this.replanning=!0,this.target=null,this.transition("SNAPSHOTTING");try{const t=this.steps[this.index],n=t?this.affordances.get(t.target):void 0,r=this.deps.rescan(),i=n?vt(r,n):null;if(i){this.adoptScan(r),this.steps=this.steps.map((s,l)=>l===this.index?{...s,target:i}:s),this.replanning=!1,this.enterSpotlight();return}const o=await this.deps.replan(this.index);if(!o||o.steps.length===0){this.message="That control is no longer on the page.",this.stopListening(),this.transition("FAILED");return}this.steps=[...this.steps.slice(0,this.index),...o.steps],this.adoptScan(o),this.replanning=!1,this.enterSpotlight()}catch{this.message="Guidance stopped because the page changed.",this.stopListening(),this.transition("FAILED")}finally{this.replanning=!1}}}}function _n(e,t){return(typeof e.composedPath=="function"?e.composedPath():[]).includes(t)?!0:e.target instanceof Node&&t.contains(e.target)}function mn(e,t){switch(e){case"click":return t==="click"||t==="keydown";case"input":return t==="input"||t==="change";case"navigation":return t==="click"||t==="keydown";case"manual":return!1}}function vt(e,t){const n=t.name.trim().toLowerCase();if(!n)return null;for(const r of e.page.affordances)if(r.role===t.role&&r.name.trim().toLowerCase()===n&&oe(e.lookup.get(r.id)))return r.id;return null}const Te=8,vn=12,yn=260,yt=14;class wn{constructor(t,n){this.host=t,this.handlers=n,this.view=null,this.frame=0,this.open=!1,this.schedule=()=>{this.frame||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.reposition()}))};const{root:r,hole:i,ring:o,bubble:s,counter:l,text:p,advance:c,stop:f}=xn();this.root=r,this.hole=i,this.ring=o,this.bubble=s,this.counter=l,this.text=p,this.advance=c,this.stop=f,this.advance.addEventListener("click",()=>{this.view&&(this.view.isLast?this.handlers.onDone():this.handlers.onNext())}),this.stop.addEventListener("click",()=>this.handlers.onStop()),this.host.appendChild(this.root)}show(t){if(!oe(t.target)){this.hide(),this.handlers.onLost?.();return}const n=t.target.getBoundingClientRect();(n.top<8||n.left<8||n.bottom>window.innerHeight-8||n.right>window.innerWidth-8)&&t.target.scrollIntoView({block:"center",inline:"center",behavior:"auto"}),this.view=t,this.counter.textContent=`Step ${t.index+1} of ${t.total}`,this.text.textContent=t.caption,this.advance.textContent=t.isLast?"Done":"Next",this.advance.hidden=!0,this.root.classList.toggle("pl-spot--busy",!!t.busy),this.open||(this.open=!0,kn(this.root),addEventListener("scroll",this.schedule,!0),addEventListener("resize",this.schedule)),this.reposition()}hide(){this.view=null,this.open&&(this.open=!1,Sn(this.root),removeEventListener("scroll",this.schedule,!0),removeEventListener("resize",this.schedule),this.frame&&cancelAnimationFrame(this.frame),this.frame=0)}destroy(){this.hide(),this.root.remove()}reposition(){if(!this.view)return;if(!oe(this.view.target)){this.hide(),this.handlers.onLost?.();return}const t=this.view.target.getBoundingClientRect(),n=innerWidth,r=innerHeight,i=Math.max(t.left-Te,4),o=Math.max(t.top-Te,4),s=Math.max(t.width+Te*2,12),l=Math.max(t.height+Te*2,12);for(const h of[this.hole,this.ring])h.setAttribute("x",String(i)),h.setAttribute("y",String(o)),h.setAttribute("width",String(Math.min(s,n-i-4))),h.setAttribute("height",String(Math.min(l,r-o-4))),h.setAttribute("rx",String(vn));const p=o+l+yt,c=this.bubble.offsetHeight||120,f=p+c<r,b=f?p:Math.max(o-yt-c,8),a=Math.min(Math.max(i,8),Math.max(n-yn-8,8));this.bubble.dataset.side=f?"below":"above",this.bubble.style.transform=`translate(${Math.round(a)}px, ${Math.round(b)}px)`}}function xn(){const e=document.createElement("div");e.className="pl-spot",e.setAttribute("popover","manual");const t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("class","pl-spot__svg"),t.setAttribute("aria-hidden","true");const n=document.createElementNS("http://www.w3.org/2000/svg","defs"),r=document.createElementNS("http://www.w3.org/2000/svg","mask");r.setAttribute("id","pl-spot-mask");const i=document.createElementNS("http://www.w3.org/2000/svg","rect");i.setAttribute("width","100%"),i.setAttribute("height","100%"),i.setAttribute("fill","white");const o=document.createElementNS("http://www.w3.org/2000/svg","rect");o.setAttribute("fill","black"),r.append(i,o),n.append(r);const s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("class","pl-spot__scrim"),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("mask","url(#pl-spot-mask)");const l=document.createElementNS("http://www.w3.org/2000/svg","rect");l.setAttribute("class","pl-spot__ring"),t.append(n,s,l);const p=document.createElement("div");p.className="pl-spot__bubble";const c=document.createElement("span");c.className="pl-spot__counter";const f=document.createElement("p");f.className="pl-spot__caption";const b=document.createElement("div");b.className="pl-spot__actions";const a=document.createElement("button");a.type="button",a.className="pl-btn pl-btn--quiet",a.textContent="Skip";const h=document.createElement("button");return h.type="button",h.className="pl-btn pl-btn--accent",h.textContent="Next",h.hidden=!0,b.append(a,h),p.append(c,f,b),e.append(t,p),{root:e,hole:o,ring:l,bubble:p,counter:c,text:f,advance:h,stop:a}}function kn(e){const t=e;if(typeof t.showPopover=="function")try{t.showPopover();return}catch{}e.classList.add("pl-spot--fallback")}function Sn(e){const t=e;if(typeof t.hidePopover=="function")try{t.hidePopover()}catch{}e.classList.remove("pl-spot--fallback")}var En=Object.prototype.toString;function An(e){return typeof e=="function"||En.call(e)==="[object Function]"}function Tn(e){var t=Number(e);return isNaN(t)?0:t===0||!isFinite(t)?t:(t>0?1:-1)*Math.floor(Math.abs(t))}var Ln=Math.pow(2,53)-1;function Cn(e){var t=Tn(e);return Math.min(Math.max(t,0),Ln)}function B(e,t){var n=Array,r=Object(e);if(e==null)throw new TypeError("Array.from requires an array-like object - not null or undefined");for(var i=Cn(r.length),o=An(n)?Object(new n(i)):new Array(i),s=0,l;s<i;)l=r[s],o[s]=l,s+=1;return o.length=i,o}function ue(e){"@babel/helpers - typeof";return ue=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ue(e)}function Nn(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function In(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,wt(r.key),r)}}function Mn(e,t,n){return t&&In(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function On(e,t,n){return t=wt(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function wt(e){var t=Rn(e,"string");return ue(t)=="symbol"?t:t+""}function Rn(e,t){if(ue(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(ue(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}var Pn=(function(){function e(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[];Nn(this,e),On(this,"items",void 0),this.items=t}return Mn(e,[{key:"add",value:function(n){return this.has(n)===!1&&this.items.push(n),this}},{key:"clear",value:function(){this.items=[]}},{key:"delete",value:function(n){var r=this.items.length;return this.items=this.items.filter(function(i){return i!==n}),r!==this.items.length}},{key:"forEach",value:function(n){var r=this;this.items.forEach(function(i){n(i,i,r)})}},{key:"has",value:function(n){return this.items.indexOf(n)!==-1}},{key:"size",get:function(){return this.items.length}}])})();const Dn=typeof Set>"u"?Set:Pn;function P(e){var t;return(t=e.localName)!==null&&t!==void 0?t:e.tagName.toLowerCase()}var Hn={article:"article",aside:"complementary",button:"button",datalist:"listbox",dd:"definition",details:"group",dialog:"dialog",dt:"term",fieldset:"group",figure:"figure",form:"form",footer:"contentinfo",h1:"heading",h2:"heading",h3:"heading",h4:"heading",h5:"heading",h6:"heading",header:"banner",hr:"separator",html:"document",legend:"legend",li:"listitem",math:"math",main:"main",menu:"list",nav:"navigation",ol:"list",optgroup:"group",option:"option",output:"status",progress:"progressbar",section:"region",summary:"button",table:"table",tbody:"rowgroup",textarea:"textbox",tfoot:"rowgroup",td:"cell",th:"columnheader",thead:"rowgroup",tr:"row",ul:"list"},$n={caption:new Set(["aria-label","aria-labelledby"]),code:new Set(["aria-label","aria-labelledby"]),deletion:new Set(["aria-label","aria-labelledby"]),emphasis:new Set(["aria-label","aria-labelledby"]),generic:new Set(["aria-label","aria-labelledby","aria-roledescription"]),insertion:new Set(["aria-label","aria-labelledby"]),none:new Set(["aria-label","aria-labelledby"]),paragraph:new Set(["aria-label","aria-labelledby"]),presentation:new Set(["aria-label","aria-labelledby"]),strong:new Set(["aria-label","aria-labelledby"]),subscript:new Set(["aria-label","aria-labelledby"]),superscript:new Set(["aria-label","aria-labelledby"])};function Un(e,t){return["aria-atomic","aria-busy","aria-controls","aria-current","aria-description","aria-describedby","aria-details","aria-dropeffect","aria-flowto","aria-grabbed","aria-hidden","aria-keyshortcuts","aria-label","aria-labelledby","aria-live","aria-owns","aria-relevant","aria-roledescription"].some(function(n){var r;return e.hasAttribute(n)&&!((r=$n[t])!==null&&r!==void 0&&r.has(n))})}function xt(e,t){return Un(e,t)}function Vn(e){var t=Gn(e);if(t===null||Fe.indexOf(t)!==-1){var n=qn(e);if(Fe.indexOf(t||"")===-1||xt(e,n||""))return n}return t}function qn(e){var t=Hn[P(e)];if(t!==void 0)return t;switch(P(e)){case"a":case"area":case"link":if(e.hasAttribute("href"))return"link";break;case"img":return e.getAttribute("alt")===""&&!xt(e,"img")?"presentation":"img";case"input":{var n=e,r=n.type;switch(r){case"button":case"image":case"reset":case"submit":return"button";case"checkbox":case"radio":return r;case"range":return"slider";case"email":case"tel":case"text":case"url":return e.hasAttribute("list")?"combobox":"textbox";case"search":return e.hasAttribute("list")?"combobox":"searchbox";case"number":return"spinbutton";default:return null}}case"select":return e.hasAttribute("multiple")||e.size>1?"listbox":"combobox"}return null}function Gn(e){var t=e.getAttribute("role");if(t!==null){var n=t.trim().split(" ")[0];if(n.length>0)return n}return null}var Fe=["presentation","none"];function E(e){return e!==null&&e.nodeType===e.ELEMENT_NODE}function kt(e){return E(e)&&P(e)==="caption"}function Le(e){return E(e)&&P(e)==="input"}function Fn(e){return E(e)&&P(e)==="optgroup"}function Bn(e){return E(e)&&P(e)==="select"}function jn(e){return E(e)&&P(e)==="table"}function zn(e){return E(e)&&P(e)==="textarea"}function Wn(e){var t=e.ownerDocument===null?e:e.ownerDocument,n=t.defaultView;if(n===null)throw new TypeError("no window available");return n}function Kn(e){return E(e)&&P(e)==="fieldset"}function Yn(e){return E(e)&&P(e)==="legend"}function Jn(e){return E(e)&&P(e)==="slot"}function Qn(e){return E(e)&&e.ownerSVGElement!==void 0}function Xn(e){return E(e)&&P(e)==="svg"}function Zn(e){return Qn(e)&&P(e)==="title"}function Be(e,t){if(E(e)&&e.hasAttribute(t)){var n=e.getAttribute(t).split(" "),r=e.getRootNode?e.getRootNode():e.ownerDocument;return n.map(function(i){return r.getElementById(i)}).filter(function(i){return i!==null})}return[]}function Y(e,t){return E(e)?t.indexOf(Vn(e))!==-1:!1}function er(e){return e.trim().replace(/\s\s+/g," ")}function tr(e,t){if(!E(e))return!1;if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!0;var n=t(e);return n.getPropertyValue("display")==="none"||n.getPropertyValue("visibility")==="hidden"}function nr(e){return Y(e,["button","combobox","listbox","textbox"])||St(e,"range")}function St(e,t){if(!E(e))return!1;switch(t){case"range":return Y(e,["meter","progressbar","scrollbar","slider","spinbutton"]);default:throw new TypeError("No knowledge about abstract role '".concat(t,"'. This is likely a bug :("))}}function Et(e,t){var n=B(e.querySelectorAll(t));return Be(e,"aria-owns").forEach(function(r){n.push.apply(n,B(r.querySelectorAll(t)))}),n}function rr(e){return Bn(e)?e.selectedOptions||Et(e,"[selected]"):Et(e,'[aria-selected="true"]')}function ir(e){return Y(e,Fe)}function or(e){return kt(e)}function sr(e){return Y(e,["button","cell","checkbox","columnheader","gridcell","heading","label","legend","link","menuitem","menuitemcheckbox","menuitemradio","option","radio","row","rowheader","switch","tab","tooltip","treeitem"])}function ar(e){return!1}function lr(e){return Le(e)||zn(e)?e.value:e.textContent||""}function At(e){var t=e.getPropertyValue("content");return/^["'].*["']$/.test(t)?t.slice(1,-1):""}function Tt(e){var t=P(e);return t==="button"||t==="input"&&e.getAttribute("type")!=="hidden"||t==="meter"||t==="output"||t==="progress"||t==="select"||t==="textarea"}function Lt(e){if(Tt(e))return e;var t=null;return e.childNodes.forEach(function(n){if(t===null&&E(n)){var r=Lt(n);r!==null&&(t=r)}}),t}function cr(e){if(e.control!==void 0)return e.control;var t=e.getAttribute("for");return t!==null?e.ownerDocument.getElementById(t):Lt(e)}function ur(e){var t=e.labels;if(t===null)return t;if(t!==void 0)return B(t);if(!Tt(e))return null;var n=e.ownerDocument;return B(n.querySelectorAll("label")).filter(function(r){return cr(r)===e})}function pr(e){var t=e.assignedNodes();return t.length===0?B(e.childNodes):t}function dr(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=new Dn,r=typeof Map>"u"?void 0:new Map,i=Wn(e),o=t.compute,s=o===void 0?"name":o,l=t.computedStyleSupportsPseudoElements,p=l===void 0?t.getComputedStyle!==void 0:l,c=t.getComputedStyle,f=c===void 0?i.getComputedStyle.bind(i):c,b=t.hidden,a=b===void 0?!1:b,h=function(w,v){if(v!==void 0)throw new Error("use uncachedGetComputedStyle directly for pseudo elements");if(r===void 0)return f(w);var M=r.get(w);if(M)return M;var D=f(w,v);return r.set(w,D),D};function m(u,w){var v="";if(E(u)&&p){var M=f(u,"::before"),D=At(M);v="".concat(D," ").concat(v)}var H=Jn(u)?pr(u):B(u.childNodes).concat(Be(u,"aria-owns"));if(H.forEach(function(L){var V=_(L,{isEmbeddedInLabel:w.isEmbeddedInLabel,isReferenced:!1,recursion:!0}),O=E(L)?h(L).getPropertyValue("display"):"inline",j=O!=="inline"?" ":"";v+="".concat(j).concat(V).concat(j)}),E(u)&&p){var $=f(u,"::after"),N=At($);v="".concat(v," ").concat(N)}return v.trim()}function k(u,w){var v=u.getAttributeNode(w);return v!==null&&!n.has(v)&&v.value.trim()!==""?(n.add(v),v.value):null}function S(u){return E(u)?k(u,"title"):null}function A(u){if(!E(u))return null;if(Kn(u)){n.add(u);for(var w=B(u.childNodes),v=0;v<w.length;v+=1){var M=w[v];if(Yn(M))return _(M,{isEmbeddedInLabel:!1,isReferenced:!1,recursion:!1})}}else if(jn(u)){n.add(u);for(var D=B(u.childNodes),H=0;H<D.length;H+=1){var $=D[H];if(kt($))return _($,{isEmbeddedInLabel:!1,isReferenced:!1,recursion:!1})}}else if(Xn(u)){n.add(u);for(var N=B(u.childNodes),L=0;L<N.length;L+=1){var V=N[L];if(Zn(V))return V.textContent}return null}else if(P(u)==="img"||P(u)==="area"){var O=k(u,"alt");if(O!==null)return O}else if(Fn(u)){var j=k(u,"label");if(j!==null)return j}if(Le(u)&&(u.type==="button"||u.type==="submit"||u.type==="reset")){var W=k(u,"value");if(W!==null)return W;if(u.type==="submit")return"Submit";if(u.type==="reset")return"Reset"}var he=ur(u);if(he!==null&&he.length!==0)return n.add(u),B(he).map(function(q){return _(q,{isEmbeddedInLabel:!0,isReferenced:!1,recursion:!0})}).filter(function(q){return q.length>0}).join(" ");if(Le(u)&&u.type==="image"){var ne=k(u,"alt");if(ne!==null)return ne;var ee=k(u,"title");return ee!==null?ee:"Submit Query"}if(Y(u,["button"])){var J=m(u,{isEmbeddedInLabel:!1});if(J!=="")return J}return null}function _(u,w){if(n.has(u))return"";if(!a&&tr(u,h)&&!w.isReferenced)return n.add(u),"";var v=E(u)?u.getAttributeNode("aria-labelledby"):null,M=v!==null&&!n.has(v)?Be(u,"aria-labelledby"):[];if(s==="name"&&!w.isReferenced&&M.length>0)return n.add(v),M.map(function(O){return _(O,{isEmbeddedInLabel:w.isEmbeddedInLabel,isReferenced:!0,recursion:!1})}).join(" ");var D=w.recursion&&nr(u)&&s==="name";if(!D){var H=(E(u)&&u.getAttribute("aria-label")||"").trim();if(H!==""&&s==="name")return n.add(u),H;if(!ir(u)){var $=A(u);if($!==null)return n.add(u),$}}if(Y(u,["menu"]))return n.add(u),"";if(D||w.isEmbeddedInLabel||w.isReferenced){if(Y(u,["combobox","listbox"])){n.add(u);var N=rr(u);return N.length===0?Le(u)?u.value:"":B(N).map(function(O){return _(O,{isEmbeddedInLabel:w.isEmbeddedInLabel,isReferenced:!1,recursion:!0})}).join(" ")}if(St(u,"range"))return n.add(u),u.hasAttribute("aria-valuetext")?u.getAttribute("aria-valuetext"):u.hasAttribute("aria-valuenow")?u.getAttribute("aria-valuenow"):u.getAttribute("value")||"";if(Y(u,["textbox"]))return n.add(u),lr(u)}if(sr(u)||E(u)&&w.isReferenced||or(u)||ar()){var L=m(u,{isEmbeddedInLabel:w.isEmbeddedInLabel});if(L!=="")return n.add(u),L}if(u.nodeType===u.TEXT_NODE)return n.add(u),u.textContent||"";if(w.recursion)return n.add(u),m(u,{isEmbeddedInLabel:w.isEmbeddedInLabel});var V=S(u);return V!==null?(n.add(u),V):(n.add(u),"")}return er(_(e,{isEmbeddedInLabel:!1,isReferenced:s==="description",recursion:!1}))}function hr(e){return Y(e,["caption","code","deletion","emphasis","generic","insertion","none","paragraph","presentation","strong","subscript","superscript"])}function fr(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};return hr(e)?"":dr(e,t)}const gr=new Set(["a","an","and","are","be","can","do","does","for","from","how","i","in","is","it","me","my","of","on","or","the","this","to","up","what","where","with","you","your"]),br=new Set(["ok","go","close","open","menu","more","link","button","submit","click here","here","next","previous","back","toggle","dismiss","x"]),_r={dialog:3,sidebar:2,header:2,navigation:2,main:1},mr={theme:["dark","light","appearance","mode"],dark:["theme","appearance","night"],username:["name","handle","profile","account","display"],profile:["account","username","settings"],account:["profile","user","settings"],password:["security","credentials"],billing:["payment","invoice","plan"],key:["keys","token","api"]};function Ct(e){return e.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>1&&!gr.has(t)).map(Nt)}function Nt(e){return e.length>4&&e.endsWith("ies")?`${e.slice(0,-3)}y`:e.length>3&&e.endsWith("es")&&!e.endsWith("ses")?e.slice(0,-2):e.length>3&&e.endsWith("s")&&!e.endsWith("ss")?e.slice(0,-1):e.length>5&&e.endsWith("ing")?e.slice(0,-3):e}function vr(e){const t=new Set(Ct(e));for(const n of[...t])for(const r of mr[n]??[])t.add(Nt(r));return t}function yr(e,t){let n=e.visible?4:0;n+=_r[e.landmark??""]??0,e.disabled&&(n-=2);const r=Ct([e.name,e.text??"",e.href??""].join(" "));r.length===0&&(n-=3);let i=0;for(const s of new Set(r))t.has(s)&&(i+=1);n+=i*6;const o=e.name.trim().toLowerCase();return o?br.has(o)&&(n-=2):n-=4,n}function wr(e,t,n){const r=vr(t);return e.map((i,o)=>({candidate:i,index:o,score:yr(i,r)})).sort((i,o)=>o.score-i.score||i.index-o.index).slice(0,n).sort((i,o)=>i.index-o.index).map(i=>i.candidate)}const xr=["button","a[href]",'input:not([type="hidden"])',"select","textarea","summary",'[role="button"]','[role="link"]','[role="tab"]','[role="menuitem"]','[role="menuitemcheckbox"]','[role="checkbox"]','[role="radio"]','[role="switch"]','[role="combobox"]','[role="option"]','[tabindex]:not([tabindex="-1"])','[contenteditable=""]','[contenteditable="true"]'].join(","),kr=150;function Sr(e={}){const t=e.root??document,n=e.question??"",r=e.limit??kr,i=[],o=new Set;Er(t.body??t.documentElement,i,o,e.exclude??null);const s=wr(i,n,r),l=new Map,p=s.map((c,f)=>{const b=`a${f+1}`;l.set(b,c.element);const a={id:b,role:c.role,name:c.name,visible:c.visible};return c.text&&c.text!==c.name&&(a.text=c.text),c.landmark&&(a.landmark=c.landmark),c.href&&(a.href=c.href),c.disabled&&(a.disabled=!0),c.state&&(a.state=c.state),a});return{page:{url:t.defaultView?.location?.href??"",title:t.title??"",affordances:p},lookup:l}}function Er(e,t,n,r){if(!e)return;const i=[e];for(;i.length;){const o=i.shift();if(r&&(o===r||r.contains(o)))continue;o!==e&&!n.has(o)&&Ar(o,xr)&&(n.add(o),t.push(Tr(o)));for(const l of Array.from(o.children))i.push(l);const s=o.shadowRoot;if(s&&s.mode==="open")for(const l of Array.from(s.children))i.push(l)}}function Ar(e,t){try{return e.matches(t)}catch{return!1}}function Tr(e){const t=Nr(e),n=(e.textContent??"").replace(/\s+/g," ").trim().slice(0,120),r=e instanceof HTMLAnchorElement?e.getAttribute("href")??void 0:void 0;return{element:e,role:Mr(e),name:t,text:n||void 0,landmark:Or(e),href:r,visible:Pr(e),disabled:Rr(e),state:Lr(e)}}function Lr(e){const t=[];return(e.getAttribute("aria-selected")==="true"||e.getAttribute("aria-current")==="page")&&t.push("selected"),e.getAttribute("aria-expanded")==="true"&&t.push("expanded"),(e.getAttribute("aria-checked")??(Cr(e)?"true":null))==="true"&&t.push("checked"),t.length?t.join(", "):void 0}function Cr(e){return e instanceof HTMLInputElement&&(e.type==="checkbox"||e.type==="radio")?e.checked:!1}function Nr(e){try{const n=fr(e).replace(/\s+/g," ").trim();if(n)return n}catch{}return(e.getAttribute("aria-label")??e.getAttribute("title")??e.getAttribute("placeholder")??e.getAttribute("value")??e.textContent??"").replace(/\s+/g," ").trim().slice(0,120)}const Ir={checkbox:"checkbox",radio:"radio",range:"slider",button:"button",submit:"button",reset:"button",search:"searchbox",email:"textbox",tel:"textbox",url:"textbox",number:"spinbutton",password:"textbox",text:"textbox"};function Mr(e){const t=e.getAttribute("role");if(t)return t.trim().split(/\s+/)[0];switch(e.tagName.toLowerCase()){case"a":return e.hasAttribute("href")?"link":"generic";case"button":return"button";case"select":return"combobox";case"textarea":return"textbox";case"summary":return"button";case"input":{const r=(e.getAttribute("type")??"text").toLowerCase();return Ir[r]??"textbox"}default:return e.getAttribute("contenteditable")!==null?"textbox":"button"}}const It={nav:"sidebar",header:"header",main:"main",aside:"sidebar",footer:"footer",dialog:"dialog",form:"form"},Mt={navigation:"sidebar",banner:"header",main:"main",complementary:"sidebar",contentinfo:"footer",dialog:"dialog",alertdialog:"dialog",menu:"menu",form:"form",search:"search"};function Or(e){let t=e;for(;t&&t!==t.ownerDocument?.body;){const n=t.getAttribute("role");if(n&&Mt[n])return Mt[n];const r=t.tagName.toLowerCase();if(It[r])return It[r];const i=t.getAttribute("aria-label");if(i&&t.hasAttribute("data-region"))return i.toLowerCase();t=t.parentElement??t.getRootNode().host??null}}function Rr(e){return e.getAttribute("aria-disabled")==="true"?!0:"disabled"in e&&!!e.disabled}function Pr(e){if(e.closest('[aria-hidden="true"],[hidden],[inert]'))return!1;const t=e.ownerDocument?.defaultView,n=t?.getComputedStyle(e);if(n&&(n.display==="none"||n.visibility==="hidden"||n.visibility==="collapse"||n.opacity==="0"))return!1;const r=e.getBoundingClientRect();if(!(typeof t?.innerWidth=="number"&&r.width+r.height>0))return Dr(e);if(r.width===0||r.height===0)return!1;const o=t?.innerWidth??0,s=t?.innerHeight??0;return r.bottom<=0||r.right<=0||r.top>=s||r.left>=o?!1:Hr(e,r,o,s)}function Dr(e){let t=e;const n=e.ownerDocument?.defaultView;for(;t;){const r=n?.getComputedStyle(t);if(r&&(r.display==="none"||r.visibility==="hidden"))return!1;t=t.parentElement}return!0}function Hr(e,t,n,r){const i=e.ownerDocument;if(!i||typeof i.elementFromPoint!="function")return!0;const o=Math.min(Math.max(t.left+t.width/2,1),n-1),s=Math.min(Math.max(t.top+t.height/2,1),r-1),l=$r(i,o,s);return l?l===e||e.contains(l)||l.contains(e):!1}function $r(e,t,n){let r=e.elementFromPoint(t,n);for(;r;){const i=r.shadowRoot;if(!i)return r;const o=i.elementFromPoint?.(t,n);if(!o||o===r)return r;r=o}return r}class Ur{constructor(t){this.onStateChange=t,this.audio=null,this.abort=null,this.objectUrl=null}get speaking(){return!!(this.audio&&!this.audio.paused&&!this.audio.ended)}async play(t){this.stop();const n=new AbortController;this.abort=n;try{const r=await t(n.signal);if(!r.body)return;const i=new Audio;this.audio=i,i.addEventListener("ended",()=>this.onStateChange(!1)),i.addEventListener("pause",()=>this.onStateChange(this.speaking)),Vr()?await this.playStreaming(i,r.body,n.signal):await this.playBuffered(i,r),this.onStateChange(!0)}catch(r){r?.name!=="AbortError"&&this.onStateChange(!1)}}stop(){this.abort?.abort(),this.abort=null,this.audio&&(this.audio.pause(),this.audio.src="",this.audio=null),this.objectUrl&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null),this.onStateChange(!1)}async playStreaming(t,n,r){const i=new MediaSource;this.objectUrl=URL.createObjectURL(i),t.src=this.objectUrl,await new Promise(p=>i.addEventListener("sourceopen",()=>p(),{once:!0}));const o=i.addSourceBuffer("audio/mpeg"),s=n.getReader();let l=!1;for(;;){const{done:p,value:c}=await s.read();if(p||r.aborted)break;await qr(o,c),l||(l=!0,t.play().catch(()=>{}))}i.readyState==="open"&&i.endOfStream(),l||t.play().catch(()=>{})}async playBuffered(t,n){const r=await n.blob();this.objectUrl=URL.createObjectURL(r),t.src=this.objectUrl,await t.play().catch(()=>{})}}function Vr(){return typeof MediaSource<"u"&&typeof MediaSource.isTypeSupported=="function"&&MediaSource.isTypeSupported("audio/mpeg")}function qr(e,t){return new Promise((n,r)=>{const i=()=>{e.removeEventListener("updateend",i),n()};e.addEventListener("updateend",i),e.addEventListener("error",r,{once:!0});try{e.appendBuffer(t)}catch(o){r(o)}})}class Ot{constructor(){this.recorder=null,this.chunks=[],this.stream=null,this.audio=null,this.silenceTimer=null}static get supported(){return typeof MediaRecorder<"u"&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia}get recording(){return this.recorder?.state==="recording"}async start(t){this.recording||(this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.chunks=[],this.recorder=new MediaRecorder(this.stream,Gr()),this.recorder.addEventListener("dataavailable",n=>{n.data.size>0&&this.chunks.push(n.data)}),this.recorder.start(250),t&&this.watchForSilence(t))}watchForSilence(t){if(!this.stream)return;const n=window.AudioContext??window.webkitAudioContext;if(!n)return;this.audio=new n;const r=this.audio.createMediaStreamSource(this.stream),i=this.audio.createAnalyser();i.fftSize=1024,r.connect(i);const o=new Uint8Array(i.frequencyBinCount);let s=!1,l=0;const p=()=>{if(!this.recording)return;i.getByteTimeDomainData(o);let c=0;for(const a of o)c=Math.max(c,Math.abs(a-128));const f=c>6,b=Date.now();if(f)s=!0,l=0;else if(s){if(l===0)l=b;else if(b-l>2600){t();return}}this.silenceTimer=window.setTimeout(p,120)};p()}async stop(){const t=this.recorder;if(!t||t.state==="inactive")return this.release(),null;const n=await new Promise(r=>{t.addEventListener("stop",()=>r(new Blob(this.chunks,{type:t.mimeType||"audio/webm"})),{once:!0}),t.stop()});return this.release(),n.size>0?n:null}cancel(){this.recorder&&this.recorder.state!=="inactive"&&this.recorder.stop(),this.release()}release(){this.silenceTimer!==null&&window.clearTimeout(this.silenceTimer),this.silenceTimer=null,this.audio?.close().catch(()=>{}),this.audio=null,this.stream?.getTracks().forEach(t=>t.stop()),this.stream=null,this.recorder=null,this.chunks=[]}}function Gr(){for(const e of["audio/webm;codecs=opus","audio/webm","audio/mp4"])if(MediaRecorder.isTypeSupported?.(e))return{mimeType:e};return{}}const pe={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":1.8,"stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"},Fr=()=>d("svg",{...pe,children:d("path",{d:"M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"})}),Rt=()=>d("svg",{...pe,children:d("path",{d:"m6 6 12 12M18 6 6 18"})}),Br=()=>d("svg",{...pe,children:d("path",{d:"M4.5 12h13M12 5.5 18.5 12 12 18.5"})}),jr=()=>d("svg",{...pe,children:[d("rect",{x:"9",y:"3",width:"6",height:"11",rx:"3"}),d("path",{d:"M5 11a7 7 0 0 0 14 0M12 18v3"})]}),zr=()=>d("svg",{...pe,children:[d("path",{d:"M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"}),d("path",{d:"M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"})]});function Wr(e){const t=z(null),[n,r]=U(0);Z(()=>{e.autoFocus&&t.current?.focus()},[e.autoFocus]),Z(()=>{const o=t.current;o&&(o.style.height="auto",o.style.height=`${Math.min(o.scrollHeight,96)}px`,o.style.overflowY=o.scrollHeight>96?"auto":"hidden",r(o.scrollHeight))},[e.value]);const i=e.voiceOn?e.recording?"Stop recording":"Record a question":"Voice is available. Click to turn it on.";return d("form",{class:"pl-composer",onSubmit:o=>{o.preventDefault(),e.onSubmit()},children:[d("div",{class:"pl-composer__field",children:[d("textarea",{ref:t,rows:1,"data-height":n,value:e.value,placeholder:e.transcribing?"Transcribing...":"Ask a question","aria-label":"Ask a question",disabled:e.transcribing,onInput:o=>e.onInput(o.currentTarget.value),onKeyDown:o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),e.onSubmit())}}),e.voiceSupported&&d("button",{type:"button",class:"pl-icon-btn","aria-pressed":e.voiceOn,"aria-label":i,title:i,onClick:()=>e.onToggleRecording(),children:d(jr,{})})]}),d("button",{type:"submit",class:"pl-send","aria-label":"Send",disabled:e.busy||e.value.trim().length===0,children:d(Br,{})})]})}function Kr({open:e,onClick:t}){return d("button",{type:"button",class:"pl-launcher","aria-label":e?"Close support":"Open support","aria-expanded":e,onClick:t,children:e?d(Rt,{}):d(Fr,{})})}const Yr={no_repository:"The team has not connected a repository yet, so I cannot report this.",failed:"The report could not be sent. Nothing was lost, so try again in a moment."};function Jr({text:e,request:t,escalation:n,reporting:r,blocked:i,elapsedSeconds:o,onReport:s}){return d("div",{class:"pl-card",children:[d("p",{children:e}),!n&&!i&&t&&d("div",{class:"pl-card__actions",children:[d("button",{type:"button",class:"pl-btn pl-btn--accent",onClick:s,disabled:r,children:r?"Reporting":"Report to developers"}),d("span",{class:"pl-card__label",children:t.title})]}),!n&&i&&d("p",{class:"pl-card__note",children:Yr[i]}),n&&d(Xr,{escalation:n,elapsedSeconds:o})]})}const Qr=[{key:"filed",label:"Your request was sent to the team",statuses:["filing","inspecting","drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"drafted",label:"Someone is working on it",statuses:["drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"pr",label:"A change is ready for review",statuses:["pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"approval",label:"Waiting on a final check",statuses:["awaiting_approval","approved","merging","deploying","shipped"]},{key:"shipped",label:"Done, it is live",statuses:["shipped"]}],Pt=["queued","filing","inspecting","drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"];function Xr({escalation:e,elapsedSeconds:t}){const n=e.status,r=Pt.indexOf(n);return n==="failed"||n==="rejected"?d("p",{class:"pl-timeline__note",children:n==="rejected"?"A developer decided not to build this for now.":"The report could not be completed. The team has the details."}):d(ie,{children:[d("span",{class:"pl-card__label",children:"Progress"}),d("ul",{class:"pl-timeline",children:Qr.map(i=>{const o=i.statuses.includes(n),s=Pt.indexOf(i.statuses[0]),l=o?r>s?"done":"current":"pending";return d("li",{"data-state":l,children:[d("span",{class:"pl-timeline__mark"}),d("span",{class:"pl-timeline__body",children:[d("span",{children:Zr(i,e)}),l==="current"&&t>10&&d("span",{class:"pl-timeline__note",children:[t,"s so far"]})]})]},i.key)})})]})}function Zr(e,t){return e.key==="filed"&&t.issueUrl?d("a",{class:"pl-link",href:t.issueUrl,target:"_blank",rel:"noreferrer noopener",children:"See your request on GitHub"}):e.key==="pr"&&t.prUrl?d("a",{class:"pl-link",href:t.prUrl,target:"_blank",rel:"noreferrer noopener",children:"See the change on GitHub"}):e.key==="shipped"&&t.deploymentUrl?d("a",{class:"pl-link",href:t.deploymentUrl,target:"_blank",rel:"noreferrer noopener",children:"It is live now, reload the page to use it"}):e.label}function ei({text:e,steps:t,guiding:n,onShowMe:r}){return d("div",{class:"pl-card",children:[d("p",{children:e}),t&&t.length>0&&d("div",{class:"pl-card__actions",children:[d("button",{type:"button",class:"pl-btn pl-btn--accent",onClick:r,disabled:n,children:n?"Showing you":"Show me"}),d("span",{class:"pl-card__label",children:[t.length," step",t.length===1?"":"s"]})]})]})}function ti({turns:e,guidingTurnId:t,elapsedSeconds:n,onShowMe:r,onReport:i}){const o=z(null);return Z(()=>{o.current?.scrollIntoView({block:"end"})},[e]),d("div",{class:"pl-messages",children:[e.length===0&&d("div",{class:"pl-empty",children:[d("h3",{children:"How can we help?"}),d("p",{children:"Ask a question and we will point at the right control on this page."})]}),e.map(s=>d(ni,{turn:s,guiding:t===s.id,elapsedSeconds:n,onShowMe:r,onReport:i},s.id)),d("div",{ref:o})]})}function ni({turn:e,guiding:t,elapsedSeconds:n,onShowMe:r,onReport:i}){const o=e.answer?.escalation;return d(ie,{children:[d("div",{class:"pl-msg pl-msg--user",children:d("p",{children:e.question})}),e.memory&&e.memory.length>0&&d("p",{class:"pl-recall",children:"Welcome back. Answering with what you told us before."}),e.error&&d("div",{class:"pl-msg pl-msg--agent",children:d("p",{children:e.error})}),e.answer&&o&&(o.offered===!0||o.reason)&&d(Jr,{text:e.answer.text,request:o.offered===!0?o.request:void 0,escalation:e.escalation,reporting:e.reporting,blocked:e.reportBlocked??(o.offered===!0?void 0:o.reason),elapsedSeconds:n,onReport:()=>i(e)}),e.answer&&o?.offered!==!0&&!o?.reason&&d(ei,{text:e.answer.text,steps:e.answer.steps,guiding:t,onShowMe:()=>r(e)})]})}const ri='button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';function ii({title:e,subtitle:t,speaking:n,onStopSpeaking:r,onClose:i,onEscape:o,children:s}){const l=z(null);return Z(()=>{const p=l.current;if(!p)return;const c=f=>{if(f.key==="Escape"){f.stopPropagation(),o();return}if(f.key!=="Tab")return;const b=Array.from(p.querySelectorAll(ri)).filter(k=>k.offsetParent!==null||k===p.ownerDocument.activeElement);if(b.length===0)return;const a=b[0],h=b[b.length-1],m=p.getRootNode().activeElement;!f.shiftKey&&m===h?(f.preventDefault(),a.focus()):f.shiftKey&&m===a&&(f.preventDefault(),h.focus())};return p.addEventListener("keydown",c),()=>p.removeEventListener("keydown",c)},[o]),d("div",{class:"pl-panel",role:"dialog","aria-label":e,ref:l,children:[d("header",{class:"pl-header",children:[d("div",{children:[d("p",{class:"pl-header__title",children:e}),d("p",{class:"pl-header__sub",children:t})]}),d("span",{class:"pl-header__spacer"}),n&&d("button",{type:"button",class:"pl-icon-btn","aria-label":"Stop speaking",onClick:r,children:d(zr,{})}),d("button",{type:"button",class:"pl-icon-btn","aria-label":"Close support",onClick:i,children:d(Rt,{})})]}),s]})}function oi(e,t){return{id:e,question:t,probes:{docs:{status:"pending"},interface:{status:"pending"},repository:{status:"pending"}}}}const Dt=new Set(["shipped","failed","rejected"]),si=["queued","filing","inspecting","drafting","pr_open","awaiting_approval","approved","rejected","merging","deploying","shipped","failed"];function ai(e){return si.includes(e)?e:"queued"}function li({client:e,shadow:t,host:n,position:r,register:i}){const[o,s]=U(!1),[l,p]=U([]),[c,f]=U(""),[b,a]=U(!1),[h,m]=U(null),[k,S]=U(""),[A,_]=U(!1),[u,w]=U(!1),[v,M]=U(!1),[D,H]=U(!1),[$,N]=U(0),L=z(null),V=z(void 0),O=z(null),j=z(null),W=z(null),he=z(0),ne=Ee(()=>new Ot,[]),ee=Ee(()=>new Ur(H),[]),J=F(g=>Sr({question:g,exclude:n}),[n]),q=F((g,y)=>{p(T=>T.map(R=>R.id===g?y(R):R))},[]),fe=F(()=>{O.current?.stop(),j.current?.hide(),W.current=null,m(null)},[]),zt=F(g=>{const y=j.current;if(y){if(g.state==="DONE"||g.state==="FAILED"){y.hide(),W.current=null,m(null),s(!0),S(g.state==="DONE"?"Guidance finished.":g.message??"Guidance stopped.");return}if(!g.step||!g.target){y.hide();return}y.show({target:g.target,caption:g.step.caption,index:g.stepIndex,total:g.total,isLast:g.stepIndex===g.total-1,busy:g.state!=="SPOTLIGHTING"}),g.state==="SPOTLIGHTING"&&S(`Step ${g.stepIndex+1} of ${g.total}. ${g.step.caption}`)}},[]),Wt=F(async g=>{const y=W.current;if(!y)return null;const T=J(y.question);L.current=T;let R=null;try{await e.ask({question:y.question,page:T.page,conversationId:V.current,continueFrom:g,onEvent:re=>{re.type==="answer"&&(R=re.steps)}})}catch{return null}return R?{...T,steps:R}:null},[e,J]),Ce=F(()=>{j.current||(j.current=new wn(t,{onNext:()=>O.current?.next(),onDone:()=>O.current?.next(),onStop:()=>fe(),onLost:()=>O.current?.lost()})),O.current||(O.current=new bn({rescan:()=>{const g=W.current,y=J(g?.question??"");return L.current=y,y},replan:Wt,onChange:zt,watch:g=>hn(g,300)}))},[zt,Wt,J,t,fe]),je=F(g=>{const y=g.answer?.steps,T=L.current;!y||y.length===0||!T||(Ce(),W.current={turnId:g.id,question:g.question},m(g.id),s(!1),O.current?.start(T,y))},[Ce]),ge=F(async g=>{const y=g.trim();if(!y||b)return;s(!0),f(""),a(!0);const T=`t${he.current+=1}`;let R=oi(T,y);p(G=>[...G,R]);const re=G=>{R=G,q(T,()=>G)},Q=J(y);L.current=Q,Ce();try{await e.ask({question:y,page:Q.page,conversationId:V.current,onEvent:G=>{re(ci(R,G,V)),G.type==="answer"&&(G.steps?.length&&je(R),A&&ee.play(Ti=>e.speak(G.text,Ti)))}})}catch{re({...R,error:"The support service is not reachable right now."})}finally{a(!1)}},[b,e,Ce,q,ee,J,je,A]),Ei=F(async g=>{const y=V.current;if(!(!y||!g.messageId||g.reporting||g.escalationId)){q(g.id,T=>({...T,reporting:!0,reportBlocked:void 0}));try{const T=await e.escalate(y,g.messageId);if(!T.ok){q(g.id,Q=>({...Q,reporting:!1,reportBlocked:T.reason}));return}const{escalationId:R,status:re}=T;q(g.id,Q=>({...Q,reporting:!1,escalationId:R,escalation:{id:R,status:ai(re)}})),ui(e,R,Q=>{q(g.id,G=>(G.escalation?.status!==Q.status&&N(0),{...G,escalation:Q}))})}catch{q(g.id,T=>({...T,reporting:!1,reportBlocked:"failed"}))}}},[e,q]);Z(()=>{if(!l.some(T=>T.escalation&&!Dt.has(T.escalation.status)))return;const y=setInterval(()=>N(T=>T+1),1e3);return()=>clearInterval(y)},[l]),Z(()=>{const g=y=>{y.key==="Escape"&&(W.current?fe():o&&s(!1))};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[o,fe]),Z(()=>{i({open:()=>s(!0),close:()=>s(!1),ask:g=>void ge(g)})},[ge,i]),Z(()=>()=>{O.current?.dispose(),j.current?.destroy(),ee.stop()},[ee]);const Ne=F(async()=>{w(!1),M(!0);try{const g=await ne.stop();if(g){const y=await e.transcribe(g);y?(f(y),ge(y)):S("I did not catch that. Try again.")}}catch{S("The microphone is not available.")}finally{M(!1)}},[ge,e,ne]),Kt=z(Ne);Kt.current=Ne;const Ai=F(async()=>{if(u){await Ne();return}try{_(!0),await ne.start(()=>void Kt.current()),w(!0)}catch{S("Microphone access was declined.")}},[Ne,ne,u]);return d("div",{class:"pl-root","data-position":r,children:[d("div",{class:"pl-sr",role:"status","aria-live":"polite",children:k}),o&&d(ii,{title:"Support",subtitle:b?"Checking":"We can show you on this page",speaking:D,onStopSpeaking:()=>ee.stop(),onClose:()=>s(!1),onEscape:()=>W.current?fe():s(!1),children:[d(ti,{turns:l,guidingTurnId:h,elapsedSeconds:$,onShowMe:je,onReport:g=>void Ei(g)}),d(Wr,{value:c,busy:b,voiceOn:A,voiceSupported:Ot.supported,recording:u,transcribing:v,autoFocus:h===null,onInput:f,onSubmit:()=>void ge(c),onToggleVoice:()=>{_(!0),S("Voice is on. Click the microphone to record.")},onToggleRecording:()=>void Ai()})]}),d(Kr,{open:o,onClick:()=>s(g=>!g)})]})}function ci(e,t,n){switch(t.type){case"conversation":return n.current=t.conversationId,{...e,messageId:t.messageId};case"understanding":return{...e,feature:t.feature,memory:t.memory};case"probe":return{...e,probes:{...e.probes,[t.probe]:t.status==="running"?{status:"running"}:{status:"done",result:t.result}}};case"verdict":return{...e,verdict:t.verdict};case"answer":return{...e,answer:{text:t.text,steps:t.steps,escalation:t.escalation}};case"error":return{...e,error:t.message}}}function ui(e,t,n){let r=!1;const i=async()=>{if(!r){try{const o=await e.escalation(t);if(n(o),Dt.has(o.status)){r=!0;return}}catch{}setTimeout(i,3e3)}};i()}class pi{constructor(){this.buffer=""}push(t){this.buffer+=t.replace(/\r\n/g,`
`);const n=[];let r=this.buffer.indexOf(`

`);for(;r!==-1;){const i=Ht(this.buffer.slice(0,r));this.buffer=this.buffer.slice(r+2),i!==null&&n.push(i),r=this.buffer.indexOf(`

`)}return n}flush(){const t=this.buffer.trim();if(this.buffer="",!t)return[];const n=Ht(t);return n===null?[]:[n]}}function Ht(e){const t=[];for(const n of e.split(`
`)){if(!n||n.startsWith(":"))continue;const r=n.indexOf(":");if((r===-1?n:n.slice(0,r))!=="data")continue;const i=r===-1?"":n.slice(r+1);t.push(i.startsWith(" ")?i.slice(1):i)}return t.length===0?null:t.join(`
`)}const di=["docs","interface","repository"],se=e=>typeof e=="object"&&e!==null;function $t(e){let t;try{t=JSON.parse(e)}catch{return null}if(!se(t))return null;switch(t.type){case"conversation":return typeof t.conversationId!="string"||typeof t.messageId!="string"?null:{type:"conversation",conversationId:t.conversationId,messageId:t.messageId};case"understanding":{if(typeof t.feature!="string")return null;const n=t.intent==="howto"||t.intent==="feature"?t.intent:"other",r=Array.isArray(t.memory)?t.memory.filter(i=>typeof i=="string"):[];return{type:"understanding",feature:t.feature,intent:n,memory:r}}case"probe":{if(typeof t.probe!="string"||!di.includes(t.probe))return null;const n=t.probe;return t.status==="running"?{type:"probe",probe:n,status:"running"}:t.status==="done"&&se(t.result)?{type:"probe",probe:n,status:"done",result:hi(n,t.result)}:null}case"verdict":return se(t.verdict)?{type:"verdict",verdict:fi(t.verdict)}:null;case"answer":return typeof t.text!="string"?null:{type:"answer",text:t.text,steps:bi(t.steps),escalation:_i(t.escalation)};case"error":return{type:"error",message:typeof t.message=="string"?t.message:"Something went wrong."};default:return null}}function hi(e,t){return{probe:e,hit:t.hit===!0,score:typeof t.score=="number"?t.score:null,summary:typeof t.summary=="string"?t.summary:"",evidence:t.evidence??null,latencyMs:typeof t.latencyMs=="number"?t.latencyMs:0}}function fi(e){const t=e.outcome;return{outcome:t==="answer"||t==="absent"?t:"hedge",confidence:typeof e.confidence=="number"?e.confidence:0,reasoning:typeof e.reasoning=="string"?e.reasoning:"",feature:typeof e.feature=="string"?e.feature:""}}const gi=["click","input","navigation","manual"];function bi(e){if(!Array.isArray(e))return null;const t=[];for(const n of e)se(n)&&(typeof n.target!="string"||typeof n.caption!="string"||t.push({target:n.target,caption:n.caption,advanceOn:typeof n.advanceOn=="string"&&gi.includes(n.advanceOn)?n.advanceOn:"click"}));return t.length?t:null}function _i(e){return se(e)?e.offered===!0&&se(e.request)?{offered:!0,request:e.request}:e.reason==="no_repository"?{offered:!1,reason:"no_repository"}:{offered:!1}:{offered:!1}}const Ut="patchlet:visitor";function Vt(){const e=new Uint8Array(16);return crypto.getRandomValues(e),Array.from(e,t=>t.toString(16).padStart(2,"0")).join("")}function qt(){try{const e=localStorage.getItem(Ut);if(e&&/^[0-9a-f]{32}$/.test(e))return e;const t=Vt();return localStorage.setItem(Ut,t),t}catch{return Vt()}}class mi{constructor(t){this.config=t}url(t){return`${this.config.apiBase.replace(/\/$/,"")}${t}`}async ask({question:t,page:n,conversationId:r,continueFrom:i,signal:o,onEvent:s}){const l={key:this.config.key,question:t,page:n,visitorId:qt()};r&&(l.conversationId=r),typeof i=="number"&&(l.continueFrom=i);const p=await fetch(this.url("/api/chat"),{method:"POST",headers:{"content-type":"application/json",accept:"text/event-stream"},body:JSON.stringify(l),signal:o});if(!p.ok||!p.body)throw new Error(`Chat request failed (${p.status})`);const c=p.body.getReader(),f=new TextDecoder,b=new pi;for(;;){const{done:a,value:h}=await c.read();if(a)break;for(const m of b.push(f.decode(h,{stream:!0}))){const k=$t(m);k&&s(k)}}for(const a of b.flush()){const h=$t(a);h&&s(h)}}async escalate(t,n){const r=await fetch(this.url("/api/escalate"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:this.config.key,conversationId:t,messageId:n,visitorId:qt()})}),i=await r.json().catch(()=>({}));return!r.ok||!i.escalationId?{ok:!1,reason:i.reason==="no_repository"?"no_repository":"failed"}:{ok:!0,escalationId:i.escalationId,status:i.status??"queued"}}async escalation(t){const n=await fetch(this.url(`/api/escalations/${encodeURIComponent(t)}?key=${encodeURIComponent(this.config.key)}`));if(!n.ok)throw new Error(`Could not read the report status (${n.status})`);return await n.json()}async transcribe(t){const n=new FormData;n.append("key",this.config.key),n.append("file",t,"speech.webm");const r=await fetch(this.url("/api/transcribe"),{method:"POST",body:n});if(!r.ok)throw new Error(`Could not transcribe that (${r.status})`);const i=await r.json();return typeof i.text=="string"?i.text:""}async speak(t,n){const r=await fetch(this.url("/api/speak"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:this.config.key,text:t}),signal:n});if(!r.ok)throw new Error(`Could not read that out (${r.status})`);return r}}const de={"--pl-accent":"#2e6f54","--pl-ink":"#17201c","--pl-muted":"#68716c","--pl-glass":"rgba(255, 253, 247, 0.6)","--pl-radius":"18px"},Gt=`
:host {
  --pl-accent: ${de["--pl-accent"]};
  --pl-ink: ${de["--pl-ink"]};
  --pl-muted: ${de["--pl-muted"]};
  --pl-glass: ${de["--pl-glass"]};
  --pl-radius: ${de["--pl-radius"]};

  --pl-accent-deep: #174633;
  --pl-glass-strong: rgba(255, 253, 247, 0.82);
  --pl-border: rgba(255, 255, 255, 0.72);
  --pl-hairline: rgba(23, 32, 28, 0.1);
  --pl-field: rgba(255, 255, 255, 0.5);
  --pl-bubble: rgba(255, 255, 255, 0.62);
  --pl-shadow: 0 28px 74px rgba(23, 32, 28, 0.24), 0 2px 10px rgba(23, 32, 28, 0.08);
  --pl-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.28);
  --pl-scrim: rgba(14, 18, 16, 0.42);
  --pl-blur: blur(28px) saturate(190%);
  --pl-serif: ui-serif, Georgia, "Times New Roman", serif;

  all: initial;
  position: fixed;
  inset: auto 0 0 auto;
  z-index: 2147483000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--pl-ink);
  -webkit-font-smoothing: antialiased;
}

:host([data-pl-scheme="dark"]) {
  --pl-ink: #f2f2f5;
  --pl-muted: #a0a0aa;
  --pl-accent-deep: #2e6f54;
  --pl-glass: rgba(28, 30, 29, 0.66);
  --pl-glass-strong: rgba(30, 30, 36, 0.92);
  --pl-border: rgba(255, 255, 255, 0.14);
  --pl-hairline: rgba(255, 255, 255, 0.1);
  --pl-field: rgba(255, 255, 255, 0.07);
  --pl-bubble: rgba(255, 255, 255, 0.08);
  --pl-shadow: 0 28px 74px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.35);
  --pl-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  --pl-scrim: rgba(4, 6, 5, 0.55);
}

*, *::before, *::after { box-sizing: border-box; }

.pl-root {
  position: fixed;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}
.pl-root[data-position="right"] { right: 22px; align-items: flex-end; }
.pl-root[data-position="left"] { left: 22px; align-items: flex-start; }

/* Launcher */
.pl-launcher {
  appearance: none;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: var(--pl-accent-deep);
  box-shadow:
    0 16px 38px rgba(23, 70, 51, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
  color: #fffdf7;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}
.pl-launcher:hover {
  transform: translateY(-2px);
  background: var(--pl-accent);
  box-shadow:
    0 20px 44px rgba(23, 70, 51, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.pl-launcher:active { transform: translateY(0) scale(0.96); }
.pl-launcher[aria-expanded="true"] { background: var(--pl-accent); }
.pl-launcher:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 3px; }
.pl-launcher svg { width: 26px; height: 26px; display: block; }

/* Panel */
.pl-panel {
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: var(--pl-radius);
  border: 1px solid var(--pl-border);
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 34%),
    radial-gradient(120% 80% at 90% 0%, rgba(46, 111, 84, 0.1), transparent 60%),
    var(--pl-glass);
  -webkit-backdrop-filter: var(--pl-blur);
  backdrop-filter: var(--pl-blur);
  box-shadow: var(--pl-shadow);
  overflow: hidden;
  transform-origin: bottom right;
  animation: pl-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.pl-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: var(--pl-highlight);
}
.pl-root[data-position="left"] .pl-panel { transform-origin: bottom left; }
:host([data-pl-scheme="dark"]) .pl-panel::before { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1); }
/* The light sheen across the top of the glass is tuned for a pale ground. At full strength on a
   dark host it reads as a smudge, so the dark scheme gets the same shape at a fifth of it. */
:host([data-pl-scheme="dark"]) .pl-panel {
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0) 34%),
    radial-gradient(120% 80% at 90% 0%, rgba(46, 111, 84, 0.18), transparent 60%),
    var(--pl-glass);
}

@keyframes pl-in { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }

.pl-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 13px;
  border-bottom: 1px solid var(--pl-hairline);
}
.pl-header__title {
  margin: 0;
  font-family: var(--pl-serif);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.pl-header__sub { font-size: 12px; color: var(--pl-muted); margin: 2px 0 0; }
.pl-header__spacer { flex: 1; }

.pl-icon-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--pl-muted);
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.pl-icon-btn:hover { background: var(--pl-field); color: var(--pl-ink); }
.pl-icon-btn:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-icon-btn[aria-pressed="true"] { color: var(--pl-accent); background: color-mix(in srgb, var(--pl-accent) 12%, transparent); }
.pl-icon-btn svg { width: 17px; height: 17px; }

/* Messages */
.pl-messages {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
}
.pl-empty { margin: auto 0; text-align: center; color: var(--pl-muted); padding: 8px 12px; }
.pl-empty h3 {
  margin: 0 0 8px;
  font-family: var(--pl-serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--pl-ink);
}
.pl-empty p { margin: 0; font-size: 13px; }

.pl-msg { max-width: 88%; padding: 9px 12px; border-radius: 14px; font-size: 13.5px; }
.pl-msg--user {
  align-self: flex-end;
  background: color-mix(in srgb, var(--pl-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--pl-accent) 24%, transparent);
}
.pl-msg--agent { align-self: flex-start; background: var(--pl-bubble); border: 1px solid var(--pl-hairline); }
.pl-msg p { margin: 0; white-space: pre-wrap; }

/* One quiet line when the agent already knows this visitor. */
.pl-recall {
  align-self: flex-start;
  margin: -4px 0 0;
  padding: 0 2px;
  color: var(--pl-muted);
  font-size: 11.5px;
  line-height: 1.45;
}

/* Probe strip */
.pl-probes { display: flex; gap: 6px; align-self: stretch; }
.pl-pill {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-bubble);
  border-radius: 11px;
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pl-pill__name { font-size: 11px; font-weight: 600; letter-spacing: 0.01em; }
.pl-pill__state { font-size: 11px; color: var(--pl-muted); display: flex; align-items: center; gap: 5px; }
.pl-pill--running { border-color: color-mix(in srgb, var(--pl-accent) 35%, transparent); }
.pl-pill--running .pl-pill__state { color: var(--pl-accent); }
.pl-dot { width: 5px; height: 5px; border-radius: 999px; background: currentColor; }
.pl-pill--running .pl-dot { animation: pl-pulse 1.1s ease-in-out infinite; }
@keyframes pl-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

/* Cards */
.pl-card {
  align-self: stretch;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-glass-strong);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pl-card p { margin: 0; font-size: 13.5px; white-space: pre-wrap; }
.pl-card__label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pl-muted); }
.pl-card__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pl-card__note { color: var(--pl-muted); font-size: 12.5px; }

.pl-btn {
  appearance: none;
  font: inherit;
  font-size: 12.5px;
  font-weight: 550;
  border-radius: 10px;
  padding: 7px 12px;
  border: 1px solid var(--pl-hairline);
  background: var(--pl-field);
  color: var(--pl-ink);
  cursor: pointer;
  transition: background 120ms ease, transform 120ms ease;
}
.pl-btn:hover { transform: translateY(-1px); }
.pl-btn:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-btn:disabled { opacity: 0.55; cursor: default; transform: none; }
.pl-btn--accent { background: var(--pl-accent-deep); border-color: transparent; color: #fffdf7; }
.pl-btn--accent:hover { background: var(--pl-accent); }
.pl-btn--quiet { background: transparent; color: var(--pl-muted); }

/* Escalation timeline */
.pl-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pl-timeline li { display: flex; gap: 9px; align-items: flex-start; font-size: 12.5px; }
.pl-timeline__mark {
  width: 8px; height: 8px; margin-top: 6px; border-radius: 999px; flex: none;
  border: 1px solid var(--pl-muted); background: transparent;
}
.pl-timeline li[data-state="done"] .pl-timeline__mark { background: var(--pl-muted); }
.pl-timeline li[data-state="current"] .pl-timeline__mark { background: var(--pl-accent); border-color: var(--pl-accent); }
.pl-timeline li[data-state="pending"] { color: var(--pl-muted); }
.pl-timeline__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pl-timeline__note { color: var(--pl-muted); font-size: 11.5px; }
.pl-link { color: var(--pl-accent); text-decoration: none; font-weight: 550; }
.pl-link:hover { text-decoration: underline; }

/* Composer */
.pl-composer {
  border-top: 1px solid var(--pl-hairline);
  padding: 10px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.pl-composer__field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--pl-field);
  border: 1px solid var(--pl-hairline);
  border-radius: 13px;
  padding: 6px 8px 6px 12px;
}
.pl-composer__field:focus-within { border-color: color-mix(in srgb, var(--pl-accent) 45%, transparent); }
.pl-composer textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 13.5px;
  color: var(--pl-ink);
  max-height: 96px;
  padding: 3px 0;
  /* The field grows to fit its text, so it only scrolls once it hits the cap. Left on auto it
     shows a scrollbar with stepper arrows on a one-line question. */
  overflow-y: hidden;
  scrollbar-width: thin;
}
.pl-composer textarea::-webkit-scrollbar { width: 6px; }
.pl-composer textarea::-webkit-scrollbar-button { display: none; }
.pl-composer textarea::-webkit-scrollbar-thumb { border-radius: 999px; background: var(--pl-hairline); }
.pl-composer textarea::placeholder { color: var(--pl-muted); }
.pl-send {
  appearance: none;
  border: 0;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 11px;
  background: var(--pl-accent-deep);
  color: #fffdf7;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pl-send:hover:not(:disabled) { background: var(--pl-accent); }
.pl-send:disabled { opacity: 0.35; cursor: default; }
.pl-send:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
.pl-send svg { width: 16px; height: 16px; }
.pl-hint { font-size: 11px; color: var(--pl-muted); padding: 0 12px 8px; }

.pl-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* Spotlight */
.pl-spot {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  pointer-events: none;
}
.pl-spot::backdrop { background: transparent; }
.pl-spot--fallback { z-index: 2147483001; }
.pl-spot__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.pl-spot__scrim { fill: var(--pl-scrim); transition: opacity 160ms ease; }
.pl-spot__ring {
  fill: none;
  stroke: var(--pl-accent);
  stroke-width: 2;
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--pl-accent) 55%, transparent));
  transition: x 160ms ease, y 160ms ease, width 160ms ease, height 160ms ease;
}
.pl-spot__bubble {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  pointer-events: auto;
  border-radius: 14px;
  border: 1px solid var(--pl-border);
  background: var(--pl-glass-strong);
  -webkit-backdrop-filter: var(--pl-blur);
  backdrop-filter: var(--pl-blur);
  box-shadow: var(--pl-shadow), var(--pl-highlight);
  padding: 12px 13px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--pl-ink);
  transition: transform 160ms ease;
}
/* A caret on the edge facing the ring, so the caption reads as being about that control and
   not as a notice that happens to be nearby. */
.pl-spot__bubble::after {
  content: "";
  position: absolute;
  left: 24px;
  width: 11px;
  height: 11px;
  background: var(--pl-glass-strong);
  border: 1px solid var(--pl-border);
  transform: rotate(45deg);
}
.pl-spot__bubble[data-side="below"]::after {
  top: -6.5px;
  border-right: 0;
  border-bottom: 0;
}
.pl-spot__bubble[data-side="above"]::after {
  bottom: -6.5px;
  border-left: 0;
  border-top: 0;
}
.pl-spot__counter {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pl-accent);
}
.pl-spot__caption { margin: 0; font-size: 13.5px; line-height: 1.45; }
.pl-spot__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 1px; }
.pl-spot--busy .pl-spot__caption { opacity: 0.6; }

@media (prefers-reduced-motion: reduce) {
  .pl-panel { animation: none; }
  .pl-launcher, .pl-btn, .pl-spot__bubble, .pl-spot__ring, .pl-spot__scrim { transition: none; }
  .pl-pill--running .pl-dot { animation: none; opacity: 1; }
}
`;function vi(e){if(typeof CSSStyleSheet<"u"&&"adoptedStyleSheets"in Document.prototype)try{const n=new CSSStyleSheet;n.replaceSync(Gt),e.adoptedStyleSheets=[...e.adoptedStyleSheets,n];return}catch{}const t=document.createElement("style");t.textContent=Gt,e.appendChild(t)}function Ft(){const e=[document.body,document.documentElement].filter(Boolean);for(const t of e){const n=getComputedStyle(t).backgroundColor,r=yi(n);if(r!==null)return r<.4?"dark":"light"}return typeof matchMedia=="function"&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function yi(e){const t=e.match(/rgba?\(([^)]+)\)/);if(!t)return null;const n=t[1].split(",").map(s=>Number.parseFloat(s.trim()));if(n.length<3||n.some(Number.isNaN)||n.length>3&&n[3]===0)return null;const[r,i,o]=n;return(.2126*r+.7152*i+.0722*o)/255}const Bt="patchlet-widget",wi="patchlet_ask";function xi(){return new URLSearchParams(location.search).get(wi)?.trim()??""}function ki(){const t=document.currentScript??document.querySelector("script[data-key]"),n=t?.dataset.key?.trim();if(!n)return console.warn("[patchlet] no data-key on the script tag, the widget will not load"),null;const r=t?.src?new URL(t.src,location.href).origin:location.origin,i=t?.dataset.api?.trim()||r,o=t?.dataset.position==="left"?"left":"right";return{key:n,apiBase:i,position:o}}function jt(e){if(document.querySelector(Bt))return;let t=xi();const n=document.createElement(Bt);n.setAttribute("data-pl-scheme",Ft()),document.body.appendChild(n);const r=n.attachShadow({mode:"open"});vi(r);const i=document.createElement("div");r.appendChild(i);const o=new MutationObserver(()=>n.setAttribute("data-pl-scheme",Ft()));o.observe(document.documentElement,{attributes:!0,attributeFilter:["class","style","data-theme"]}),o.observe(document.body,{attributes:!0,attributeFilter:["class","style","data-theme"]});const s=new mi({apiBase:e.apiBase,key:e.key});nn(d(li,{client:s,shadow:r,host:n,position:e.position,register:l=>{if(window.Patchlet=l,t){const p=t;t="",setTimeout(()=>window.Patchlet?.ask(p),400)}}}),i)}function Si(){const e=ki();e&&(document.body?jt(e):document.addEventListener("DOMContentLoaded",()=>jt(e),{once:!0}))}Si()})();
