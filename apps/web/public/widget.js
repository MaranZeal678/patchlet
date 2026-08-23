(function(){"use strict";var ge,w,Fe,X,Ve,Be,ze,Ce,me,se,We,Ne,Ie,Me,_e={},be=[],Wt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ve=Array.isArray;function Y(e,t){for(var n in t)e[n]=t[n];return e}function Re(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Yt(e,t,n){var r,i,o,s={};for(o in t)o=="key"?r=t[o]:o=="ref"?i=t[o]:s[o]=t[o];if(arguments.length>2&&(s.children=arguments.length>3?ge.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)s[o]===void 0&&(s[o]=e.defaultProps[o]);return ye(e,s,r,i,null)}function ye(e,t,n,r,i){var o={type:e,props:t,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++Fe,__i:-1,__u:0};return i==null&&w.vnode!=null&&w.vnode(o),o}function ie(e){return e.children}function xe(e,t){this.props=e,this.context=t}function te(e,t){if(t==null)return e.__?te(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?te(e):null}function Kt(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,r=[],i=[],o=Y({},t);o.__v=t.__v+1,w.vnode&&w.vnode(o),Oe(e.__P,o,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,r,n??te(t),!!(32&t.__u),i),o.__v=t.__v,o.__.__k[o.__i]=o,tt(r,o,i),t.__e=t.__=null,o.__e!=n&&Ye(o)}}function Ye(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Ye(e)}function Ke(e){(!e.__d&&(e.__d=!0)&&X.push(e)&&!we.__r++||Ve!=w.debounceRendering)&&((Ve=w.debounceRendering)||Be)(we)}function we(){try{for(var e,t=1;X.length;)X.length>t&&X.sort(ze),e=X.shift(),t=X.length,Kt(e)}finally{X.length=we.__r=0}}function Je(e,t,n,r,i,o,s,l,p,c,f){var m,a,h,b,k,S,A=r&&r.__k||be,_=t.length;for(p=Jt(n,t,A,p,_),m=0;m<_;m++)(h=n.__k[m])!=null&&(a=h.__i!=-1&&A[h.__i]||_e,h.__i=m,S=Oe(e,h,a,i,o,s,l,p,c,f),b=h.__e,h.ref&&a.ref!=h.ref&&(a.ref&&Pe(a.ref,null,h),f.push(h.ref,h.__c||b,h)),k==null&&b!=null&&(k=b),4&h.__u?(p=Qe(h,p,e),a.__e&&(a.__e=null)):typeof h.type=="function"&&S!==void 0?p=S:b&&(p=b.nextSibling),h.__u&=-7);return n.__e=k,p}function Jt(e,t,n,r,i){var o,s,l,p,c,f=n.length,m=f,a=0;for(e.__k=new Array(i),o=0;o<i;o++)(s=t[o])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[o]=ye(null,s,null,null,null):ve(s)?s=e.__k[o]=ye(ie,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[o]=ye(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[o]=s,p=o+a,s.__=e,s.__b=e.__b+1,l=null,(c=s.__i=Qt(s,n,p,m))!=-1&&(m--,(l=n[c])&&(l.__u|=2)),l==null||l.__v==null?(c==-1&&(i>f?a--:i<f&&a++),typeof s.type!="function"&&(s.__u|=4)):c!=p&&(c==p-1?a--:c==p+1?a++:(c>p?a--:a++,s.__u|=4))):e.__k[o]=null;if(m)for(o=0;o<f;o++)(l=n[o])!=null&&(2&l.__u)==0&&(l.__e==r&&(r=te(l)),rt(l,l));return r}function Qe(e,t,n){var r,i;if(typeof e.type=="function"){for(r=e.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=e,t=Qe(r[i],t,n));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=te(e)),t=n.insertBefore(e.__e,t||null));do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Qt(e,t,n,r){var i,o,s,l=e.key,p=e.type,c=t[n],f=c!=null&&(2&c.__u)==0;if(c===null&&l==null||f&&l==c.key&&p==c.type)return n;if(r>(f?1:0)){for(i=n-1,o=n+1;i>=0||o<t.length;)if((c=t[s=i>=0?i--:o++])!=null&&(2&c.__u)==0&&l==c.key&&p==c.type)return s}return-1}function Xe(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Wt.test(t)?n:n+"px"}function ke(e,t,n,r,i){var o,s;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof r=="string"&&(e.style.cssText=r=""),r)for(t in r)n&&t in n||Xe(e.style,t,"");if(n)for(t in n)r&&n[t]==r[t]||Xe(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")o=t!=(t=t.replace(We,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+o]=n,n?r?n[se]=r[se]:(n[se]=Ne,e.addEventListener(t,o?Me:Ie,o)):e.removeEventListener(t,o?Me:Ie,o);else{if(i=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Ze(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[me]==null)t[me]=Ne++;else if(t[me]<n[se])return;return n(w.event?w.event(t):t)}}}function Oe(e,t,n,r,i,o,s,l,p,c){var f,m,a,h,b,k,S,A,_,u,y,v,R,D,H,$,N=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),o=[l=t.__e=n.__e]),(f=w.__b)&&f(t);e:if(typeof N=="function"){m=s.length;try{if(_=t.props,u=N.prototype&&N.prototype.render,y=(f=N.contextType)&&r[f.__c],v=f?y?y.props.value:f.__:r,n.__c?A=(a=t.__c=n.__c).__=a.__E:(u?t.__c=a=new N(_,v):(t.__c=a=new xe(_,v),a.constructor=N,a.render=Zt),y&&y.sub(a),a.state||(a.state={}),a.__n=r,h=a.__d=!0,a.__h=[],a._sb=[]),u&&a.__s==null&&(a.__s=a.state),u&&N.getDerivedStateFromProps!=null&&(a.__s==a.state&&(a.__s=Y({},a.__s)),Y(a.__s,N.getDerivedStateFromProps(_,a.__s))),b=a.props,k=a.state,a.__v=t,h)u&&N.getDerivedStateFromProps==null&&a.componentWillMount!=null&&a.componentWillMount(),u&&a.componentDidMount!=null&&a.__h.push(a.componentDidMount);else{if(u&&N.getDerivedStateFromProps==null&&_!==b&&a.componentWillReceiveProps!=null&&a.componentWillReceiveProps(_,v),t.__v==n.__v||!a.__e&&a.shouldComponentUpdate!=null&&a.shouldComponentUpdate(_,a.__s,v)===!1){t.__v!=n.__v&&(a.props=_,a.state=a.__s,a.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(L){L&&(L.__=t)}),be.push.apply(a.__h,a._sb),a._sb=[],a.__h.length&&s.push(a),l=te(n);break e}a.componentWillUpdate!=null&&a.componentWillUpdate(_,a.__s,v),u&&a.componentDidUpdate!=null&&a.__h.push(function(){a.componentDidUpdate(b,k,S)})}if(a.context=v,a.props=_,a.__P=e,a.__e=!1,R=w.__r,D=0,u)a.state=a.__s,a.__d=!1,R&&R(t),f=a.render(a.props,a.state,a.context),be.push.apply(a.__h,a._sb),a._sb=[];else do a.__d=!1,R&&R(t),f=a.render(a.props,a.state,a.context),a.state=a.__s;while(a.__d&&++D<25);a.state=a.__s,a.getChildContext!=null&&(r=Y(Y({},r),a.getChildContext())),u&&!h&&a.getSnapshotBeforeUpdate!=null&&(S=a.getSnapshotBeforeUpdate(b,k)),H=f!=null&&f.type===ie&&f.key==null?nt(f.props.children):f,l=Je(e,ve(H)?H:[H],t,n,r,i,o,s,l,p,c),a.base=t.__e,t.__u&=-161,a.__h.length&&s.push(a),A&&(a.__E=a.__=null)}catch(L){if(s.length=m,t.__v=null,p||o!=null){if(L.then){for(t.__u|=p?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;o!=null&&(o[o.indexOf(l)]=null),t.__e=l}else if(o!=null)for($=o.length;$--;)Re(o[$])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),L.then||et(t),w.__e(L,t,n)}}else o==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):l=t.__e=Xt(n.__e,t,n,r,i,o,s,p,c);return(f=w.diffed)&&f(t),128&t.__u?void 0:l}function et(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(et))}function tt(e,t,n){for(var r=0;r<n.length;r++)Pe(n[r],n[++r],n[++r]);w.__c&&w.__c(t,e),e.some(function(i){try{e=i.__h,i.__h=[],e.some(function(o){o.call(i)})}catch(o){w.__e(o,i.__v)}})}function nt(e){return typeof e!="object"||e==null||e.__b>0?e:ve(e)?e.map(nt):e.constructor!==void 0?null:Y({},e)}function Xt(e,t,n,r,i,o,s,l,p){var c,f,m,a,h,b,k,S=n.props||_e,A=t.props,_=t.type;if(_=="svg"?i="http://www.w3.org/2000/svg":_=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),o!=null){for(c=0;c<o.length;c++)if((h=o[c])&&"setAttribute"in h==!!_&&(_?h.localName==_:h.nodeType==3)){e=h,o[c]=null;break}}if(e==null){if(_==null)return document.createTextNode(A);e=document.createElementNS(i,_,A.is&&A),l&&(w.__m&&w.__m(t,o),l=!1),o=null}if(_==null)S===A||l&&e.data==A||(e.data=A);else{if(o=_=="textarea"&&A.defaultValue!=null?null:o&&ge.call(e.childNodes),!l&&o!=null)for(S={},c=0;c<e.attributes.length;c++)S[(h=e.attributes[c]).name]=h.value;for(c in S)h=S[c],c=="dangerouslySetInnerHTML"?m=h:c=="children"||c in A||c=="value"&&"defaultValue"in A||c=="checked"&&"defaultChecked"in A||ke(e,c,null,h,i);for(c in A)h=A[c],c=="children"?a=h:c=="dangerouslySetInnerHTML"?f=h:c=="value"?b=h:c=="checked"?k=h:l&&typeof h!="function"||S[c]===h||ke(e,c,h,S[c],i);if(f)l||m&&(f.__html==m.__html||f.__html==e.innerHTML)||(e.innerHTML=f.__html),t.__k=[];else if(m&&(e.innerHTML=""),Je(t.type=="template"?e.content:e,ve(a)?a:[a],t,n,r,_=="foreignObject"?"http://www.w3.org/1999/xhtml":i,o,s,o?o[0]:n.__k&&te(n,0),l,p),o!=null)for(c=o.length;c--;)Re(o[c]);l&&_!="textarea"||(c="value",_=="progress"&&b==null?e.removeAttribute("value"):b!=null&&(b!==e[c]||_=="progress"&&!b||_=="option"&&b!=S[c])&&ke(e,c,b,S[c],i),c="checked",k!=null&&k!=e[c]&&ke(e,c,k,S[c],i))}return e}function Pe(e,t,n){try{if(typeof e=="function"){var r=typeof e.__u=="function";r&&e.__u(),r&&t==null||(e.__u=e(t))}else e.current=t}catch(i){w.__e(i,n)}}function rt(e,t,n){var r,i;if(w.unmount&&w.unmount(e),(r=e.ref)&&(r.current&&r.current!=e.__e||Pe(r,null,t)),(r=e.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(o){w.__e(o,t)}r.base=r.__P=r.__n=null}if(r=e.__k)for(i=0;i<r.length;i++)r[i]&&rt(r[i],t,n||typeof e.type!="function");n||Re(e.__e),e.__c=e.__=e.__e=void 0}function Zt(e,t,n){return this.constructor(e,n)}function en(e,t,n){var r,i,o,s;t==document&&(t=document.documentElement),w.__&&w.__(e,t),i=(r=!1)?null:t.__k,o=[],s=[],Oe(t,e=t.__k=Yt(ie,null,[e]),i||_e,_e,t.namespaceURI,i?null:t.firstChild?ge.call(t.childNodes):null,o,i?i.__e:t.firstChild,r,s),tt(o,e,s),e.props.children=null}ge=be.slice,w={__e:function(e,t,n,r){for(var i,o,s;t=t.__;)if((i=t.__c)&&!i.__)try{if((o=i.constructor)&&o.getDerivedStateFromError!=null&&(i.setState(o.getDerivedStateFromError(e)),s=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,r||{}),s=i.__d),s)return i.__E=i}catch(l){e=l}throw e}},Fe=0,xe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Y({},this.state),typeof e=="function"&&(e=e(Y({},n),this.props)),e&&Y(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Ke(this))},xe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Ke(this))},xe.prototype.render=ie,X=[],Be=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ze=function(e,t){return e.__v.__b-t.__v.__b},we.__r=0,Ce=Math.random().toString(8),me="__d"+Ce,se="__a"+Ce,We=/(PointerCapture)$|Capture$/i,Ne=0,Ie=Ze(!1),Me=Ze(!0);var tn=0;function d(e,t,n,r,i,o){t||(t={});var s,l,p=t;if("ref"in p)for(l in p={},t)l=="ref"?s=t[l]:p[l]=t[l];var c={type:e,props:p,key:n,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--tn,__i:-1,__u:0,__source:i,__self:o};if(typeof e=="function"&&(s=e.defaultProps))for(l in s)p[l]===void 0&&(p[l]=s[l]);return w.vnode&&w.vnode(c),c}var ae,C,De,it,le=0,ot=[],I=w,st=I.__b,at=I.__r,lt=I.diffed,ct=I.__c,ut=I.unmount,pt=I.__;function He(e,t){I.__h&&I.__h(C,e,le||t),le=0;var n=C.__H||(C.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function U(e){return le=1,nn(ht,e)}function nn(e,t,n){var r=He(ae++,2);if(r.t=e,!r.__c&&(r.__=[ht(void 0,t),function(l){var p=r.__N?r.__N[0]:r.__[0],c=r.t(p,l);p!==c&&(r.__N=[c,r.__[1]],r.__c.setState({}))}],r.__c=C,!C.__f)){var i=function(l,p,c){if(!r.__c.__H)return!0;var f=!1,m=r.__c.props!==l;if(r.__c.__H.__.some(function(h){if(h.__N){f=!0;var b=h.__[0];h.__=h.__N,h.__N=void 0,b!==h.__[0]&&(m=!0)}}),o){var a=o.call(this,l,p,c);return f?a||m:a}return!f||m};C.__f=!0;var o=C.shouldComponentUpdate,s=C.componentWillUpdate;C.componentWillUpdate=function(l,p,c){if(this.__e){var f=o;o=void 0,i(l,p,c),o=f}s&&s.call(this,l,p,c)},C.shouldComponentUpdate=i}return r.__N||r.__}function Z(e,t){var n=He(ae++,3);!I.__s&&ft(n.__H,t)&&(n.__=e,n.u=t,C.__H.__h.push(n))}function z(e){return le=5,Se(function(){return{current:e}},[])}function Se(e,t){var n=He(ae++,7);return ft(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function j(e,t){return le=8,Se(function(){return e},t)}function rn(){for(var e;e=ot.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ee),t.__h.some($e),t.__h=[]}catch(n){t.__h=[],I.__e(n,e.__v)}}}I.__b=function(e){C=null,st&&st(e)},I.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),pt&&pt(e,t)},I.__r=function(e){at&&at(e),ae=0;var t=(C=e.__c).__H;t&&(De===C?(t.__h=[],C.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.some(Ee),t.__h.some($e),t.__h=[],ae=0)),De=C},I.diffed=function(e){lt&&lt(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(ot.push(t)!==1&&it===I.requestAnimationFrame||((it=I.requestAnimationFrame)||on)(rn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),De=C=null},I.__c=function(e,t){t.some(function(n){try{n.__h.some(Ee),n.__h=n.__h.filter(function(r){return!r.__||$e(r)})}catch(r){t.some(function(i){i.__h&&(i.__h=[])}),t=[],I.__e(r,n.__v)}}),ct&&ct(e,t)},I.unmount=function(e){ut&&ut(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(r){try{Ee(r)}catch(i){t=i}}),n.__H=void 0,t&&I.__e(t,n.__v))};var dt=typeof requestAnimationFrame=="function";function on(e){var t,n=function(){clearTimeout(r),dt&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,35);dt&&(t=requestAnimationFrame(n))}function Ee(e){var t=C,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),C=t}function $e(e){var t=C;e.__c=e.__(),C=t}function ft(e,t){return!e||e.length!==t.length||t.some(function(n,r){return n!==e[r]})}function ht(e,t){return typeof t=="function"?t(e):t}class sn{constructor(t){this.deps=t,this.state="DONE",this.steps=[],this.index=0,this.lookup=new Map,this.affordances=new Map,this.target=null,this.message=null,this.unwatch=null,this.replanning=!1,this.onUserEvent=n=>{if(this.state!=="SPOTLIGHTING"||!this.target)return;const r=this.steps[this.index];if(!(!r||!an(r.advanceOn,n.type)||!((typeof n.composedPath=="function"?n.composedPath():[]).includes(this.target)||n.target instanceof Node&&this.target.contains(n.target)))){if(n.type==="keydown"){const s=n.key;if(s!=="Enter"&&s!==" "&&s!=="Spacebar")return}this.enterVerifying()}},this.onPageChanged=()=>{if(this.state==="DONE"||this.state==="FAILED"||this.replanning)return;const n=this.steps[this.index];if(n){if(n.advanceOn==="navigation"&&this.state==="SPOTLIGHTING"){this.enterVerifying();return}this.target&&this.target.isConnected||this.recover()}},this.doc=t.doc??document,this.settleMs=t.settleMs??300}get snapshot(){return{state:this.state,stepIndex:this.index,total:this.steps.length,step:this.steps[this.index]??null,target:this.target,message:this.message}}start(t,n){this.stopListening(),this.steps=n,this.index=0,this.message=null,this.adoptScan(t),this.doc.addEventListener("click",this.onUserEvent,!0),this.doc.addEventListener("keydown",this.onUserEvent,!0),this.doc.addEventListener("input",this.onUserEvent,!0),this.doc.addEventListener("change",this.onUserEvent,!0),this.deps.watch&&(this.unwatch=this.deps.watch(this.onPageChanged)),this.enterSpotlight()}next(){this.state!=="SPOTLIGHTING"&&this.state!=="VERIFYING"||this.enterSnapshot()}stop(){this.stopListening(),this.target=null,this.transition("DONE")}dispose(){this.stopListening()}stopListening(){this.settleTimer&&clearTimeout(this.settleTimer),this.settleTimer=void 0,this.doc.removeEventListener("click",this.onUserEvent,!0),this.doc.removeEventListener("keydown",this.onUserEvent,!0),this.doc.removeEventListener("input",this.onUserEvent,!0),this.doc.removeEventListener("change",this.onUserEvent,!0),this.unwatch?.(),this.unwatch=null}adoptScan(t){this.lookup=t.lookup,this.affordances=new Map(t.page.affordances.map(n=>[n.id,n]))}transition(t){this.state=t,this.deps.onChange(this.snapshot)}enterSpotlight(){const t=this.steps[this.index];if(!t){this.stopListening(),this.target=null,this.transition("DONE");return}const n=this.lookup.get(t.target)??null;if(!n||!n.isConnected){this.recover();return}this.target=n,this.message=null,this.transition("SPOTLIGHTING")}enterVerifying(){this.transition("VERIFYING"),this.settleTimer&&clearTimeout(this.settleTimer),this.settleTimer=setTimeout(()=>this.enterSnapshot(),this.settleMs)}enterSnapshot(){if(this.settleTimer&&clearTimeout(this.settleTimer),this.transition("SNAPSHOTTING"),this.index+=1,this.index>=this.steps.length){this.continueOrFinish();return}const t=this.steps[this.index],n=this.affordances.get(t.target),r=this.deps.rescan(),i=n?gt(r,n):null;if(this.adoptScan(r),n&&!i){this.recover();return}i&&i!==t.target&&(this.steps=this.steps.map((o,s)=>s===this.index?{...o,target:i}:o)),this.enterSpotlight()}async continueOrFinish(){if(!this.replanning){this.replanning=!0;try{const t=await this.deps.replan(this.index);if(t&&t.steps.length>0){this.steps=[...this.steps.slice(0,this.index),...t.steps],this.adoptScan(t),this.replanning=!1,this.enterSpotlight();return}}catch{}this.replanning=!1,this.stopListening(),this.target=null,this.transition("DONE")}}async recover(){if(!this.replanning){this.replanning=!0,this.transition("SNAPSHOTTING");try{const t=this.steps[this.index],n=t?this.affordances.get(t.target):void 0,r=this.deps.rescan(),i=n?gt(r,n):null;if(i){this.adoptScan(r),this.steps=this.steps.map((s,l)=>l===this.index?{...s,target:i}:s),this.replanning=!1,this.enterSpotlight();return}const o=await this.deps.replan(this.index);if(!o||o.steps.length===0){this.message="That control is no longer on the page.",this.stopListening(),this.transition("FAILED");return}this.steps=[...this.steps.slice(0,this.index),...o.steps],this.adoptScan(o),this.replanning=!1,this.enterSpotlight()}catch{this.message="Guidance stopped because the page changed.",this.stopListening(),this.transition("FAILED")}finally{this.replanning=!1}}}}function an(e,t){switch(e){case"click":return t==="click"||t==="keydown";case"input":return t==="input"||t==="change";case"navigation":return t==="click"||t==="keydown";case"manual":return!1}}function gt(e,t){const n=t.name.trim().toLowerCase();if(!n)return null;for(const r of e.page.affordances){if(r.role!==t.role||r.name.trim().toLowerCase()!==n)continue;if(e.lookup.get(r.id)?.isConnected)return r.id}return null}const Ae=8,ln=12,cn=260,mt=14;class un{constructor(t,n){this.host=t,this.handlers=n,this.view=null,this.frame=0,this.open=!1,this.schedule=()=>{this.frame||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.reposition()}))};const{root:r,hole:i,ring:o,bubble:s,counter:l,text:p,advance:c,stop:f}=pn();this.root=r,this.hole=i,this.ring=o,this.bubble=s,this.counter=l,this.text=p,this.advance=c,this.stop=f,this.advance.addEventListener("click",()=>{this.view&&(this.view.isLast?this.handlers.onDone():this.handlers.onNext())}),this.stop.addEventListener("click",()=>this.handlers.onStop()),this.host.appendChild(this.root)}show(t){const n=t.target.getBoundingClientRect();(n.top<8||n.left<8||n.bottom>window.innerHeight-8||n.right>window.innerWidth-8)&&t.target.scrollIntoView({block:"center",inline:"center",behavior:"auto"}),this.view=t,this.counter.textContent=`Step ${t.index+1} of ${t.total}`,this.text.textContent=t.caption,this.advance.textContent=t.isLast?"Done":"Next",this.advance.hidden=!0,this.root.classList.toggle("pl-spot--busy",!!t.busy),this.open||(this.open=!0,dn(this.root),addEventListener("scroll",this.schedule,!0),addEventListener("resize",this.schedule)),this.reposition()}hide(){this.view=null,this.open&&(this.open=!1,fn(this.root),removeEventListener("scroll",this.schedule,!0),removeEventListener("resize",this.schedule),this.frame&&cancelAnimationFrame(this.frame),this.frame=0)}destroy(){this.hide(),this.root.remove()}reposition(){if(!this.view)return;const t=this.view.target.getBoundingClientRect(),n=innerWidth,r=innerHeight,i=Math.max(t.left-Ae,4),o=Math.max(t.top-Ae,4),s=Math.max(t.width+Ae*2,12),l=Math.max(t.height+Ae*2,12);for(const a of[this.hole,this.ring])a.setAttribute("x",String(i)),a.setAttribute("y",String(o)),a.setAttribute("width",String(Math.min(s,n-i-4))),a.setAttribute("height",String(Math.min(l,r-o-4))),a.setAttribute("rx",String(ln));const p=o+l+mt,c=this.bubble.offsetHeight||120,f=p+c<r?p:Math.max(o-mt-c,8),m=Math.min(Math.max(i,8),Math.max(n-cn-8,8));this.bubble.style.transform=`translate(${Math.round(m)}px, ${Math.round(f)}px)`}}function pn(){const e=document.createElement("div");e.className="pl-spot",e.setAttribute("popover","manual");const t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("class","pl-spot__svg"),t.setAttribute("aria-hidden","true");const n=document.createElementNS("http://www.w3.org/2000/svg","defs"),r=document.createElementNS("http://www.w3.org/2000/svg","mask");r.setAttribute("id","pl-spot-mask");const i=document.createElementNS("http://www.w3.org/2000/svg","rect");i.setAttribute("width","100%"),i.setAttribute("height","100%"),i.setAttribute("fill","white");const o=document.createElementNS("http://www.w3.org/2000/svg","rect");o.setAttribute("fill","black"),r.append(i,o),n.append(r);const s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("class","pl-spot__scrim"),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("mask","url(#pl-spot-mask)");const l=document.createElementNS("http://www.w3.org/2000/svg","rect");l.setAttribute("class","pl-spot__ring"),t.append(n,s,l);const p=document.createElement("div");p.className="pl-spot__bubble";const c=document.createElement("span");c.className="pl-spot__counter";const f=document.createElement("p");f.className="pl-spot__caption";const m=document.createElement("div");m.className="pl-spot__actions";const a=document.createElement("button");a.type="button",a.className="pl-btn pl-btn--quiet",a.textContent="Skip";const h=document.createElement("button");return h.type="button",h.className="pl-btn pl-btn--accent",h.textContent="Next",h.hidden=!0,m.append(a,h),p.append(c,f,m),e.append(t,p),{root:e,hole:o,ring:l,bubble:p,counter:c,text:f,advance:h,stop:a}}function dn(e){const t=e;if(typeof t.showPopover=="function")try{t.showPopover();return}catch{}e.classList.add("pl-spot--fallback")}function fn(e){const t=e;if(typeof t.hidePopover=="function")try{t.hidePopover()}catch{}e.classList.remove("pl-spot--fallback")}let _t=!1;const Ue=new Set;function hn(){if(!(_t||typeof history>"u")){_t=!0;for(const e of["pushState","replaceState"]){const t=history[e];history[e]=function(...r){const i=t.apply(this,r);for(const o of Ue)o();return i}}}}function gn(e){hn();let t=location.href;const n=()=>{location.href!==t&&(t=location.href,e())};return Ue.add(n),addEventListener("popstate",n),addEventListener("hashchange",n),()=>{Ue.delete(n),removeEventListener("popstate",n),removeEventListener("hashchange",n)}}function mn(e,t=300,n=document.body){if(typeof MutationObserver>"u")return()=>{};let r;const i=new MutationObserver(()=>{r&&clearTimeout(r),r=setTimeout(e,t)});return i.observe(n,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style","hidden","aria-hidden"]}),()=>{r&&clearTimeout(r),i.disconnect()}}function _n(e,t=300){const n=gn(()=>setTimeout(e,t)),r=mn(e,t);return()=>{n(),r()}}var bn=Object.prototype.toString;function vn(e){return typeof e=="function"||bn.call(e)==="[object Function]"}function yn(e){var t=Number(e);return isNaN(t)?0:t===0||!isFinite(t)?t:(t>0?1:-1)*Math.floor(Math.abs(t))}var xn=Math.pow(2,53)-1;function wn(e){var t=yn(e);return Math.min(Math.max(t,0),xn)}function F(e,t){var n=Array,r=Object(e);if(e==null)throw new TypeError("Array.from requires an array-like object - not null or undefined");for(var i=wn(r.length),o=vn(n)?Object(new n(i)):new Array(i),s=0,l;s<i;)l=r[s],o[s]=l,s+=1;return o.length=i,o}function ce(e){"@babel/helpers - typeof";return ce=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ce(e)}function kn(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function Sn(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,bt(r.key),r)}}function En(e,t,n){return t&&Sn(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function An(e,t,n){return t=bt(t),t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function bt(e){var t=Tn(e,"string");return ce(t)=="symbol"?t:t+""}function Tn(e,t){if(ce(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(ce(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}var Ln=(function(){function e(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[];kn(this,e),An(this,"items",void 0),this.items=t}return En(e,[{key:"add",value:function(n){return this.has(n)===!1&&this.items.push(n),this}},{key:"clear",value:function(){this.items=[]}},{key:"delete",value:function(n){var r=this.items.length;return this.items=this.items.filter(function(i){return i!==n}),r!==this.items.length}},{key:"forEach",value:function(n){var r=this;this.items.forEach(function(i){n(i,i,r)})}},{key:"has",value:function(n){return this.items.indexOf(n)!==-1}},{key:"size",get:function(){return this.items.length}}])})();const Cn=typeof Set>"u"?Set:Ln;function O(e){var t;return(t=e.localName)!==null&&t!==void 0?t:e.tagName.toLowerCase()}var Nn={article:"article",aside:"complementary",button:"button",datalist:"listbox",dd:"definition",details:"group",dialog:"dialog",dt:"term",fieldset:"group",figure:"figure",form:"form",footer:"contentinfo",h1:"heading",h2:"heading",h3:"heading",h4:"heading",h5:"heading",h6:"heading",header:"banner",hr:"separator",html:"document",legend:"legend",li:"listitem",math:"math",main:"main",menu:"list",nav:"navigation",ol:"list",optgroup:"group",option:"option",output:"status",progress:"progressbar",section:"region",summary:"button",table:"table",tbody:"rowgroup",textarea:"textbox",tfoot:"rowgroup",td:"cell",th:"columnheader",thead:"rowgroup",tr:"row",ul:"list"},In={caption:new Set(["aria-label","aria-labelledby"]),code:new Set(["aria-label","aria-labelledby"]),deletion:new Set(["aria-label","aria-labelledby"]),emphasis:new Set(["aria-label","aria-labelledby"]),generic:new Set(["aria-label","aria-labelledby","aria-roledescription"]),insertion:new Set(["aria-label","aria-labelledby"]),none:new Set(["aria-label","aria-labelledby"]),paragraph:new Set(["aria-label","aria-labelledby"]),presentation:new Set(["aria-label","aria-labelledby"]),strong:new Set(["aria-label","aria-labelledby"]),subscript:new Set(["aria-label","aria-labelledby"]),superscript:new Set(["aria-label","aria-labelledby"])};function Mn(e,t){return["aria-atomic","aria-busy","aria-controls","aria-current","aria-description","aria-describedby","aria-details","aria-dropeffect","aria-flowto","aria-grabbed","aria-hidden","aria-keyshortcuts","aria-label","aria-labelledby","aria-live","aria-owns","aria-relevant","aria-roledescription"].some(function(n){var r;return e.hasAttribute(n)&&!((r=In[t])!==null&&r!==void 0&&r.has(n))})}function vt(e,t){return Mn(e,t)}function Rn(e){var t=Pn(e);if(t===null||qe.indexOf(t)!==-1){var n=On(e);if(qe.indexOf(t||"")===-1||vt(e,n||""))return n}return t}function On(e){var t=Nn[O(e)];if(t!==void 0)return t;switch(O(e)){case"a":case"area":case"link":if(e.hasAttribute("href"))return"link";break;case"img":return e.getAttribute("alt")===""&&!vt(e,"img")?"presentation":"img";case"input":{var n=e,r=n.type;switch(r){case"button":case"image":case"reset":case"submit":return"button";case"checkbox":case"radio":return r;case"range":return"slider";case"email":case"tel":case"text":case"url":return e.hasAttribute("list")?"combobox":"textbox";case"search":return e.hasAttribute("list")?"combobox":"searchbox";case"number":return"spinbutton";default:return null}}case"select":return e.hasAttribute("multiple")||e.size>1?"listbox":"combobox"}return null}function Pn(e){var t=e.getAttribute("role");if(t!==null){var n=t.trim().split(" ")[0];if(n.length>0)return n}return null}var qe=["presentation","none"];function E(e){return e!==null&&e.nodeType===e.ELEMENT_NODE}function yt(e){return E(e)&&O(e)==="caption"}function Te(e){return E(e)&&O(e)==="input"}function Dn(e){return E(e)&&O(e)==="optgroup"}function Hn(e){return E(e)&&O(e)==="select"}function $n(e){return E(e)&&O(e)==="table"}function Un(e){return E(e)&&O(e)==="textarea"}function qn(e){var t=e.ownerDocument===null?e:e.ownerDocument,n=t.defaultView;if(n===null)throw new TypeError("no window available");return n}function Gn(e){return E(e)&&O(e)==="fieldset"}function jn(e){return E(e)&&O(e)==="legend"}function Fn(e){return E(e)&&O(e)==="slot"}function Vn(e){return E(e)&&e.ownerSVGElement!==void 0}function Bn(e){return E(e)&&O(e)==="svg"}function zn(e){return Vn(e)&&O(e)==="title"}function Ge(e,t){if(E(e)&&e.hasAttribute(t)){var n=e.getAttribute(t).split(" "),r=e.getRootNode?e.getRootNode():e.ownerDocument;return n.map(function(i){return r.getElementById(i)}).filter(function(i){return i!==null})}return[]}function K(e,t){return E(e)?t.indexOf(Rn(e))!==-1:!1}function Wn(e){return e.trim().replace(/\s\s+/g," ")}function Yn(e,t){if(!E(e))return!1;if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!0;var n=t(e);return n.getPropertyValue("display")==="none"||n.getPropertyValue("visibility")==="hidden"}function Kn(e){return K(e,["button","combobox","listbox","textbox"])||xt(e,"range")}function xt(e,t){if(!E(e))return!1;switch(t){case"range":return K(e,["meter","progressbar","scrollbar","slider","spinbutton"]);default:throw new TypeError("No knowledge about abstract role '".concat(t,"'. This is likely a bug :("))}}function wt(e,t){var n=F(e.querySelectorAll(t));return Ge(e,"aria-owns").forEach(function(r){n.push.apply(n,F(r.querySelectorAll(t)))}),n}function Jn(e){return Hn(e)?e.selectedOptions||wt(e,"[selected]"):wt(e,'[aria-selected="true"]')}function Qn(e){return K(e,qe)}function Xn(e){return yt(e)}function Zn(e){return K(e,["button","cell","checkbox","columnheader","gridcell","heading","label","legend","link","menuitem","menuitemcheckbox","menuitemradio","option","radio","row","rowheader","switch","tab","tooltip","treeitem"])}function er(e){return!1}function tr(e){return Te(e)||Un(e)?e.value:e.textContent||""}function kt(e){var t=e.getPropertyValue("content");return/^["'].*["']$/.test(t)?t.slice(1,-1):""}function St(e){var t=O(e);return t==="button"||t==="input"&&e.getAttribute("type")!=="hidden"||t==="meter"||t==="output"||t==="progress"||t==="select"||t==="textarea"}function Et(e){if(St(e))return e;var t=null;return e.childNodes.forEach(function(n){if(t===null&&E(n)){var r=Et(n);r!==null&&(t=r)}}),t}function nr(e){if(e.control!==void 0)return e.control;var t=e.getAttribute("for");return t!==null?e.ownerDocument.getElementById(t):Et(e)}function rr(e){var t=e.labels;if(t===null)return t;if(t!==void 0)return F(t);if(!St(e))return null;var n=e.ownerDocument;return F(n.querySelectorAll("label")).filter(function(r){return nr(r)===e})}function ir(e){var t=e.assignedNodes();return t.length===0?F(e.childNodes):t}function or(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=new Cn,r=typeof Map>"u"?void 0:new Map,i=qn(e),o=t.compute,s=o===void 0?"name":o,l=t.computedStyleSupportsPseudoElements,p=l===void 0?t.getComputedStyle!==void 0:l,c=t.getComputedStyle,f=c===void 0?i.getComputedStyle.bind(i):c,m=t.hidden,a=m===void 0?!1:m,h=function(y,v){if(v!==void 0)throw new Error("use uncachedGetComputedStyle directly for pseudo elements");if(r===void 0)return f(y);var R=r.get(y);if(R)return R;var D=f(y,v);return r.set(y,D),D};function b(u,y){var v="";if(E(u)&&p){var R=f(u,"::before"),D=kt(R);v="".concat(D," ").concat(v)}var H=Fn(u)?ir(u):F(u.childNodes).concat(Ge(u,"aria-owns"));if(H.forEach(function(L){var q=_(L,{isEmbeddedInLabel:y.isEmbeddedInLabel,isReferenced:!1,recursion:!0}),P=E(L)?h(L).getPropertyValue("display"):"inline",V=P!=="inline"?" ":"";v+="".concat(V).concat(q).concat(V)}),E(u)&&p){var $=f(u,"::after"),N=kt($);v="".concat(v," ").concat(N)}return v.trim()}function k(u,y){var v=u.getAttributeNode(y);return v!==null&&!n.has(v)&&v.value.trim()!==""?(n.add(v),v.value):null}function S(u){return E(u)?k(u,"title"):null}function A(u){if(!E(u))return null;if(Gn(u)){n.add(u);for(var y=F(u.childNodes),v=0;v<y.length;v+=1){var R=y[v];if(jn(R))return _(R,{isEmbeddedInLabel:!1,isReferenced:!1,recursion:!1})}}else if($n(u)){n.add(u);for(var D=F(u.childNodes),H=0;H<D.length;H+=1){var $=D[H];if(yt($))return _($,{isEmbeddedInLabel:!1,isReferenced:!1,recursion:!1})}}else if(Bn(u)){n.add(u);for(var N=F(u.childNodes),L=0;L<N.length;L+=1){var q=N[L];if(zn(q))return q.textContent}return null}else if(O(u)==="img"||O(u)==="area"){var P=k(u,"alt");if(P!==null)return P}else if(Dn(u)){var V=k(u,"label");if(V!==null)return V}if(Te(u)&&(u.type==="button"||u.type==="submit"||u.type==="reset")){var W=k(u,"value");if(W!==null)return W;if(u.type==="submit")return"Submit";if(u.type==="reset")return"Reset"}var de=rr(u);if(de!==null&&de.length!==0)return n.add(u),F(de).map(function(G){return _(G,{isEmbeddedInLabel:!0,isReferenced:!1,recursion:!0})}).filter(function(G){return G.length>0}).join(" ");if(Te(u)&&u.type==="image"){var ne=k(u,"alt");if(ne!==null)return ne;var ee=k(u,"title");return ee!==null?ee:"Submit Query"}if(K(u,["button"])){var J=b(u,{isEmbeddedInLabel:!1});if(J!=="")return J}return null}function _(u,y){if(n.has(u))return"";if(!a&&Yn(u,h)&&!y.isReferenced)return n.add(u),"";var v=E(u)?u.getAttributeNode("aria-labelledby"):null,R=v!==null&&!n.has(v)?Ge(u,"aria-labelledby"):[];if(s==="name"&&!y.isReferenced&&R.length>0)return n.add(v),R.map(function(P){return _(P,{isEmbeddedInLabel:y.isEmbeddedInLabel,isReferenced:!0,recursion:!1})}).join(" ");var D=y.recursion&&Kn(u)&&s==="name";if(!D){var H=(E(u)&&u.getAttribute("aria-label")||"").trim();if(H!==""&&s==="name")return n.add(u),H;if(!Qn(u)){var $=A(u);if($!==null)return n.add(u),$}}if(K(u,["menu"]))return n.add(u),"";if(D||y.isEmbeddedInLabel||y.isReferenced){if(K(u,["combobox","listbox"])){n.add(u);var N=Jn(u);return N.length===0?Te(u)?u.value:"":F(N).map(function(P){return _(P,{isEmbeddedInLabel:y.isEmbeddedInLabel,isReferenced:!1,recursion:!0})}).join(" ")}if(xt(u,"range"))return n.add(u),u.hasAttribute("aria-valuetext")?u.getAttribute("aria-valuetext"):u.hasAttribute("aria-valuenow")?u.getAttribute("aria-valuenow"):u.getAttribute("value")||"";if(K(u,["textbox"]))return n.add(u),tr(u)}if(Zn(u)||E(u)&&y.isReferenced||Xn(u)||er()){var L=b(u,{isEmbeddedInLabel:y.isEmbeddedInLabel});if(L!=="")return n.add(u),L}if(u.nodeType===u.TEXT_NODE)return n.add(u),u.textContent||"";if(y.recursion)return n.add(u),b(u,{isEmbeddedInLabel:y.isEmbeddedInLabel});var q=S(u);return q!==null?(n.add(u),q):(n.add(u),"")}return Wn(_(e,{isEmbeddedInLabel:!1,isReferenced:s==="description",recursion:!1}))}function sr(e){return K(e,["caption","code","deletion","emphasis","generic","insertion","none","paragraph","presentation","strong","subscript","superscript"])}function ar(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};return sr(e)?"":or(e,t)}const lr=new Set(["a","an","and","are","be","can","do","does","for","from","how","i","in","is","it","me","my","of","on","or","the","this","to","up","what","where","with","you","your"]),cr=new Set(["ok","go","close","open","menu","more","link","button","submit","click here","here","next","previous","back","toggle","dismiss","x"]),ur={dialog:3,sidebar:2,header:2,navigation:2,main:1},pr={theme:["dark","light","appearance","mode"],dark:["theme","appearance","night"],username:["name","handle","profile","account","display"],profile:["account","username","settings"],account:["profile","user","settings"],password:["security","credentials"],billing:["payment","invoice","plan"],key:["keys","token","api"]};function At(e){return e.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>1&&!lr.has(t)).map(Tt)}function Tt(e){return e.length>4&&e.endsWith("ies")?`${e.slice(0,-3)}y`:e.length>3&&e.endsWith("es")&&!e.endsWith("ses")?e.slice(0,-2):e.length>3&&e.endsWith("s")&&!e.endsWith("ss")?e.slice(0,-1):e.length>5&&e.endsWith("ing")?e.slice(0,-3):e}function dr(e){const t=new Set(At(e));for(const n of[...t])for(const r of pr[n]??[])t.add(Tt(r));return t}function fr(e,t){let n=e.visible?4:0;n+=ur[e.landmark??""]??0,e.disabled&&(n-=2);const r=At([e.name,e.text??"",e.href??""].join(" "));r.length===0&&(n-=3);let i=0;for(const s of new Set(r))t.has(s)&&(i+=1);n+=i*6;const o=e.name.trim().toLowerCase();return o?cr.has(o)&&(n-=2):n-=4,n}function hr(e,t,n){const r=dr(t);return e.map((i,o)=>({candidate:i,index:o,score:fr(i,r)})).sort((i,o)=>o.score-i.score||i.index-o.index).slice(0,n).sort((i,o)=>i.index-o.index).map(i=>i.candidate)}const gr=["button","a[href]",'input:not([type="hidden"])',"select","textarea","summary",'[role="button"]','[role="link"]','[role="tab"]','[role="menuitem"]','[role="menuitemcheckbox"]','[role="checkbox"]','[role="radio"]','[role="switch"]','[role="combobox"]','[role="option"]','[tabindex]:not([tabindex="-1"])','[contenteditable=""]','[contenteditable="true"]'].join(","),mr=150;function _r(e={}){const t=e.root??document,n=e.question??"",r=e.limit??mr,i=[],o=new Set;br(t.body??t.documentElement,i,o,e.exclude??null);const s=hr(i,n,r),l=new Map,p=s.map((c,f)=>{const m=`a${f+1}`;l.set(m,c.element);const a={id:m,role:c.role,name:c.name,visible:c.visible};return c.text&&c.text!==c.name&&(a.text=c.text),c.landmark&&(a.landmark=c.landmark),c.href&&(a.href=c.href),c.disabled&&(a.disabled=!0),a});return{page:{url:t.defaultView?.location?.href??"",title:t.title??"",affordances:p},lookup:l}}function br(e,t,n,r){if(!e)return;const i=[e];for(;i.length;){const o=i.shift();if(r&&(o===r||r.contains(o)))continue;o!==e&&!n.has(o)&&vr(o,gr)&&(n.add(o),t.push(yr(o)));for(const l of Array.from(o.children))i.push(l);const s=o.shadowRoot;if(s&&s.mode==="open")for(const l of Array.from(s.children))i.push(l)}}function vr(e,t){try{return e.matches(t)}catch{return!1}}function yr(e){const t=xr(e),n=(e.textContent??"").replace(/\s+/g," ").trim().slice(0,120),r=e instanceof HTMLAnchorElement?e.getAttribute("href")??void 0:void 0;return{element:e,role:kr(e),name:t,text:n||void 0,landmark:Sr(e),href:r,visible:Ar(e),disabled:Er(e)}}function xr(e){try{const n=ar(e).replace(/\s+/g," ").trim();if(n)return n}catch{}return(e.getAttribute("aria-label")??e.getAttribute("title")??e.getAttribute("placeholder")??e.getAttribute("value")??e.textContent??"").replace(/\s+/g," ").trim().slice(0,120)}const wr={checkbox:"checkbox",radio:"radio",range:"slider",button:"button",submit:"button",reset:"button",search:"searchbox",email:"textbox",tel:"textbox",url:"textbox",number:"spinbutton",password:"textbox",text:"textbox"};function kr(e){const t=e.getAttribute("role");if(t)return t.trim().split(/\s+/)[0];switch(e.tagName.toLowerCase()){case"a":return e.hasAttribute("href")?"link":"generic";case"button":return"button";case"select":return"combobox";case"textarea":return"textbox";case"summary":return"button";case"input":{const r=(e.getAttribute("type")??"text").toLowerCase();return wr[r]??"textbox"}default:return e.getAttribute("contenteditable")!==null?"textbox":"button"}}const Lt={nav:"sidebar",header:"header",main:"main",aside:"sidebar",footer:"footer",dialog:"dialog",form:"form"},Ct={navigation:"sidebar",banner:"header",main:"main",complementary:"sidebar",contentinfo:"footer",dialog:"dialog",alertdialog:"dialog",menu:"menu",form:"form",search:"search"};function Sr(e){let t=e;for(;t&&t!==t.ownerDocument?.body;){const n=t.getAttribute("role");if(n&&Ct[n])return Ct[n];const r=t.tagName.toLowerCase();if(Lt[r])return Lt[r];const i=t.getAttribute("aria-label");if(i&&t.hasAttribute("data-region"))return i.toLowerCase();t=t.parentElement??t.getRootNode().host??null}}function Er(e){return e.getAttribute("aria-disabled")==="true"?!0:"disabled"in e&&!!e.disabled}function Ar(e){if(e.closest('[aria-hidden="true"],[hidden],[inert]'))return!1;const t=e.ownerDocument?.defaultView,n=t?.getComputedStyle(e);if(n&&(n.display==="none"||n.visibility==="hidden"||n.visibility==="collapse"||n.opacity==="0"))return!1;const r=e.getBoundingClientRect();if(!(typeof t?.innerWidth=="number"&&r.width+r.height>0))return Tr(e);if(r.width===0||r.height===0)return!1;const o=t?.innerWidth??0,s=t?.innerHeight??0;return r.bottom<=0||r.right<=0||r.top>=s||r.left>=o?!1:Lr(e,r,o,s)}function Tr(e){let t=e;const n=e.ownerDocument?.defaultView;for(;t;){const r=n?.getComputedStyle(t);if(r&&(r.display==="none"||r.visibility==="hidden"))return!1;t=t.parentElement}return!0}function Lr(e,t,n,r){const i=e.ownerDocument;if(!i||typeof i.elementFromPoint!="function")return!0;const o=Math.min(Math.max(t.left+t.width/2,1),n-1),s=Math.min(Math.max(t.top+t.height/2,1),r-1),l=Cr(i,o,s);return l?l===e||e.contains(l)||l.contains(e):!1}function Cr(e,t,n){let r=e.elementFromPoint(t,n);for(;r;){const i=r.shadowRoot;if(!i)return r;const o=i.elementFromPoint?.(t,n);if(!o||o===r)return r;r=o}return r}class Nr{constructor(t){this.onStateChange=t,this.audio=null,this.abort=null,this.objectUrl=null}get speaking(){return!!(this.audio&&!this.audio.paused&&!this.audio.ended)}async play(t){this.stop();const n=new AbortController;this.abort=n;try{const r=await t(n.signal);if(!r.body)return;const i=new Audio;this.audio=i,i.addEventListener("ended",()=>this.onStateChange(!1)),i.addEventListener("pause",()=>this.onStateChange(this.speaking)),Ir()?await this.playStreaming(i,r.body,n.signal):await this.playBuffered(i,r),this.onStateChange(!0)}catch(r){r?.name!=="AbortError"&&this.onStateChange(!1)}}stop(){this.abort?.abort(),this.abort=null,this.audio&&(this.audio.pause(),this.audio.src="",this.audio=null),this.objectUrl&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null),this.onStateChange(!1)}async playStreaming(t,n,r){const i=new MediaSource;this.objectUrl=URL.createObjectURL(i),t.src=this.objectUrl,await new Promise(p=>i.addEventListener("sourceopen",()=>p(),{once:!0}));const o=i.addSourceBuffer("audio/mpeg"),s=n.getReader();let l=!1;for(;;){const{done:p,value:c}=await s.read();if(p||r.aborted)break;await Mr(o,c),l||(l=!0,t.play().catch(()=>{}))}i.readyState==="open"&&i.endOfStream(),l||t.play().catch(()=>{})}async playBuffered(t,n){const r=await n.blob();this.objectUrl=URL.createObjectURL(r),t.src=this.objectUrl,await t.play().catch(()=>{})}}function Ir(){return typeof MediaSource<"u"&&typeof MediaSource.isTypeSupported=="function"&&MediaSource.isTypeSupported("audio/mpeg")}function Mr(e,t){return new Promise((n,r)=>{const i=()=>{e.removeEventListener("updateend",i),n()};e.addEventListener("updateend",i),e.addEventListener("error",r,{once:!0});try{e.appendBuffer(t)}catch(o){r(o)}})}class Nt{constructor(){this.recorder=null,this.chunks=[],this.stream=null,this.audio=null,this.silenceTimer=null}static get supported(){return typeof MediaRecorder<"u"&&typeof navigator<"u"&&!!navigator.mediaDevices?.getUserMedia}get recording(){return this.recorder?.state==="recording"}async start(t){this.recording||(this.stream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.chunks=[],this.recorder=new MediaRecorder(this.stream,Rr()),this.recorder.addEventListener("dataavailable",n=>{n.data.size>0&&this.chunks.push(n.data)}),this.recorder.start(250),t&&this.watchForSilence(t))}watchForSilence(t){if(!this.stream)return;const n=window.AudioContext??window.webkitAudioContext;if(!n)return;this.audio=new n;const r=this.audio.createMediaStreamSource(this.stream),i=this.audio.createAnalyser();i.fftSize=1024,r.connect(i);const o=new Uint8Array(i.frequencyBinCount);let s=!1,l=0;const p=()=>{if(!this.recording)return;i.getByteTimeDomainData(o);let c=0;for(const a of o)c=Math.max(c,Math.abs(a-128));const f=c>6,m=Date.now();if(f)s=!0,l=0;else if(s){if(l===0)l=m;else if(m-l>2600){t();return}}this.silenceTimer=window.setTimeout(p,120)};p()}async stop(){const t=this.recorder;if(!t||t.state==="inactive")return this.release(),null;const n=await new Promise(r=>{t.addEventListener("stop",()=>r(new Blob(this.chunks,{type:t.mimeType||"audio/webm"})),{once:!0}),t.stop()});return this.release(),n.size>0?n:null}cancel(){this.recorder&&this.recorder.state!=="inactive"&&this.recorder.stop(),this.release()}release(){this.silenceTimer!==null&&window.clearTimeout(this.silenceTimer),this.silenceTimer=null,this.audio?.close().catch(()=>{}),this.audio=null,this.stream?.getTracks().forEach(t=>t.stop()),this.stream=null,this.recorder=null,this.chunks=[]}}function Rr(){for(const e of["audio/webm;codecs=opus","audio/webm","audio/mp4"])if(MediaRecorder.isTypeSupported?.(e))return{mimeType:e};return{}}const ue={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":1.8,"stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true"},Or=()=>d("svg",{...ue,children:d("path",{d:"M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"})}),It=()=>d("svg",{...ue,children:d("path",{d:"m6 6 12 12M18 6 6 18"})}),Pr=()=>d("svg",{...ue,children:d("path",{d:"M4.5 12h13M12 5.5 18.5 12 12 18.5"})}),Dr=()=>d("svg",{...ue,children:[d("rect",{x:"9",y:"3",width:"6",height:"11",rx:"3"}),d("path",{d:"M5 11a7 7 0 0 0 14 0M12 18v3"})]}),Hr=()=>d("svg",{...ue,children:[d("path",{d:"M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"}),d("path",{d:"M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"})]});function $r(e){const t=z(null),[n,r]=U(0);Z(()=>{e.autoFocus&&t.current?.focus()},[e.autoFocus]),Z(()=>{const o=t.current;o&&(o.style.height="auto",o.style.height=`${Math.min(o.scrollHeight,96)}px`,r(o.scrollHeight))},[e.value]);const i=e.voiceOn?e.recording?"Stop recording":"Record a question":"Voice is available. Click to turn it on.";return d("form",{class:"pl-composer",onSubmit:o=>{o.preventDefault(),e.onSubmit()},children:[d("div",{class:"pl-composer__field",children:[d("textarea",{ref:t,rows:1,"data-height":n,value:e.value,placeholder:e.transcribing?"Transcribing...":"Ask a question","aria-label":"Ask a question",disabled:e.transcribing,onInput:o=>e.onInput(o.currentTarget.value),onKeyDown:o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),e.onSubmit())}}),e.voiceSupported&&d("button",{type:"button",class:"pl-icon-btn","aria-pressed":e.voiceOn,"aria-label":i,title:i,onClick:()=>e.onToggleRecording(),children:d(Dr,{})})]}),d("button",{type:"submit",class:"pl-send","aria-label":"Send",disabled:e.busy||e.value.trim().length===0,children:d(Pr,{})})]})}function Ur({open:e,onClick:t}){return d("button",{type:"button",class:"pl-launcher","aria-label":e?"Close support":"Open support","aria-expanded":e,onClick:t,children:e?d(It,{}):d(Or,{})})}const qr={no_repository:"The team has not connected a repository yet, so I cannot report this.",failed:"The report could not be sent. Nothing was lost, so try again in a moment."};function Gr({text:e,request:t,escalation:n,reporting:r,blocked:i,elapsedSeconds:o,onReport:s}){return d("div",{class:"pl-card",children:[d("p",{children:e}),!n&&!i&&t&&d("div",{class:"pl-card__actions",children:[d("button",{type:"button",class:"pl-btn pl-btn--accent",onClick:s,disabled:r,children:r?"Reporting":"Report to developers"}),d("span",{class:"pl-card__label",children:t.title})]}),!n&&i&&d("p",{class:"pl-card__note",children:qr[i]}),n&&d(Fr,{escalation:n,elapsedSeconds:o})]})}const jr=[{key:"filed",label:"Your request was sent to the team",statuses:["filing","inspecting","drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"drafted",label:"Someone is working on it",statuses:["drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"pr",label:"A change is ready for review",statuses:["pr_open","awaiting_approval","approved","merging","deploying","shipped"]},{key:"approval",label:"Waiting on a final check",statuses:["awaiting_approval","approved","merging","deploying","shipped"]},{key:"shipped",label:"Done, it is live",statuses:["shipped"]}],Mt=["queued","filing","inspecting","drafting","pr_open","awaiting_approval","approved","merging","deploying","shipped"];function Fr({escalation:e,elapsedSeconds:t}){const n=e.status,r=Mt.indexOf(n);return n==="failed"||n==="rejected"?d("p",{class:"pl-timeline__note",children:n==="rejected"?"A developer decided not to build this for now.":"The report could not be completed. The team has the details."}):d(ie,{children:[d("span",{class:"pl-card__label",children:"Progress"}),d("ul",{class:"pl-timeline",children:jr.map(i=>{const o=i.statuses.includes(n),s=Mt.indexOf(i.statuses[0]),l=o?r>s?"done":"current":"pending";return d("li",{"data-state":l,children:[d("span",{class:"pl-timeline__mark"}),d("span",{class:"pl-timeline__body",children:[d("span",{children:Vr(i,e)}),l==="current"&&t>10&&d("span",{class:"pl-timeline__note",children:[t,"s so far"]})]})]},i.key)})})]})}function Vr(e,t){return e.key==="filed"&&t.issueUrl?d("a",{class:"pl-link",href:t.issueUrl,target:"_blank",rel:"noreferrer noopener",children:"See your request on GitHub"}):e.key==="pr"&&t.prUrl?d("a",{class:"pl-link",href:t.prUrl,target:"_blank",rel:"noreferrer noopener",children:"See the change on GitHub"}):e.key==="shipped"&&t.deploymentUrl?d("a",{class:"pl-link",href:t.deploymentUrl,target:"_blank",rel:"noreferrer noopener",children:"It is live now, reload the page to use it"}):e.label}function Br({text:e,steps:t,guiding:n,onShowMe:r}){return d("div",{class:"pl-card",children:[d("p",{children:e}),t&&t.length>0&&d("div",{class:"pl-card__actions",children:[d("button",{type:"button",class:"pl-btn pl-btn--accent",onClick:r,disabled:n,children:n?"Showing you":"Show me"}),d("span",{class:"pl-card__label",children:[t.length," step",t.length===1?"":"s"]})]})]})}function zr({turns:e,guidingTurnId:t,elapsedSeconds:n,onShowMe:r,onReport:i}){const o=z(null);return Z(()=>{o.current?.scrollIntoView({block:"end"})},[e]),d("div",{class:"pl-messages",children:[e.length===0&&d("div",{class:"pl-empty",children:[d("h3",{children:"How can we help?"}),d("p",{children:"Ask a question and we will point at the right control on this page."})]}),e.map(s=>d(Yr,{turn:s,guiding:t===s.id,elapsedSeconds:n,onShowMe:r,onReport:i},s.id)),d("div",{ref:o})]})}function Wr(e){return e.replace(/^The visitor's\b/,"Your").replace(/^The visitor\b/,"You").replace(/^You is\b/,"You are").replace(/^You has\b/,"You have")}function Yr({turn:e,guiding:t,elapsedSeconds:n,onShowMe:r,onReport:i}){const o=e.answer?.escalation;return d(ie,{children:[d("div",{class:"pl-msg pl-msg--user",children:d("p",{children:e.question})}),e.memory&&e.memory.length>0&&d("p",{class:"pl-recall",title:e.memory.join(" "),children:["Welcome back. ",Wr(e.memory[e.memory.length-1]??"")]}),e.error&&d("div",{class:"pl-msg pl-msg--agent",children:d("p",{children:e.error})}),e.answer&&o&&(o.offered===!0||o.reason)&&d(Gr,{text:e.answer.text,request:o.offered===!0?o.request:void 0,escalation:e.escalation,reporting:e.reporting,blocked:e.reportBlocked??(o.offered===!0?void 0:o.reason),elapsedSeconds:n,onReport:()=>i(e)}),e.answer&&o?.offered!==!0&&!o?.reason&&d(Br,{text:e.answer.text,steps:e.answer.steps,guiding:t,onShowMe:()=>r(e)})]})}const Kr='button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';function Jr({title:e,subtitle:t,speaking:n,onStopSpeaking:r,onClose:i,onEscape:o,children:s}){const l=z(null);return Z(()=>{const p=l.current;if(!p)return;const c=f=>{if(f.key==="Escape"){f.stopPropagation(),o();return}if(f.key!=="Tab")return;const m=Array.from(p.querySelectorAll(Kr)).filter(k=>k.offsetParent!==null||k===p.ownerDocument.activeElement);if(m.length===0)return;const a=m[0],h=m[m.length-1],b=p.getRootNode().activeElement;!f.shiftKey&&b===h?(f.preventDefault(),a.focus()):f.shiftKey&&b===a&&(f.preventDefault(),h.focus())};return p.addEventListener("keydown",c),()=>p.removeEventListener("keydown",c)},[o]),d("div",{class:"pl-panel",role:"dialog","aria-label":e,ref:l,children:[d("header",{class:"pl-header",children:[d("div",{children:[d("p",{class:"pl-header__title",children:e}),d("p",{class:"pl-header__sub",children:t})]}),d("span",{class:"pl-header__spacer"}),n&&d("button",{type:"button",class:"pl-icon-btn","aria-label":"Stop speaking",onClick:r,children:d(Hr,{})}),d("button",{type:"button",class:"pl-icon-btn","aria-label":"Close support",onClick:i,children:d(It,{})})]}),s]})}function Qr(e,t){return{id:e,question:t,probes:{docs:{status:"pending"},interface:{status:"pending"},repository:{status:"pending"}}}}const Rt=new Set(["shipped","failed","rejected"]),Xr=["queued","filing","inspecting","drafting","pr_open","awaiting_approval","approved","rejected","merging","deploying","shipped","failed"];function Zr(e){return Xr.includes(e)?e:"queued"}function ei({client:e,shadow:t,host:n,position:r,register:i}){const[o,s]=U(!1),[l,p]=U([]),[c,f]=U(""),[m,a]=U(!1),[h,b]=U(null),[k,S]=U(""),[A,_]=U(!1),[u,y]=U(!1),[v,R]=U(!1),[D,H]=U(!1),[$,N]=U(0),L=z(null),q=z(void 0),P=z(null),V=z(null),W=z(null),de=z(0),ne=Se(()=>new Nt,[]),ee=Se(()=>new Nr(H),[]),J=j(g=>_r({question:g,exclude:n}),[n]),G=j((g,x)=>{p(T=>T.map(M=>M.id===g?x(M):M))},[]),fe=j(()=>{P.current?.stop(),V.current?.hide(),W.current=null,b(null)},[]),Ft=j(g=>{const x=V.current;if(x){if(g.state==="DONE"||g.state==="FAILED"){x.hide(),W.current=null,b(null),s(!0),S(g.state==="DONE"?"Guidance finished.":g.message??"Guidance stopped.");return}!g.step||!g.target||(x.show({target:g.target,caption:g.step.caption,index:g.stepIndex,total:g.total,isLast:g.stepIndex===g.total-1,busy:g.state!=="SPOTLIGHTING"}),g.state==="SPOTLIGHTING"&&S(`Step ${g.stepIndex+1} of ${g.total}. ${g.step.caption}`))}},[]),Vt=j(async g=>{const x=W.current;if(!x)return null;const T=J(x.question);L.current=T;let M=null;try{await e.ask({question:x.question,page:T.page,conversationId:q.current,continueFrom:g,onEvent:re=>{re.type==="answer"&&(M=re.steps)}})}catch{return null}return M?{...T,steps:M}:null},[e,J]),Bt=j(()=>{V.current||(V.current=new un(t,{onNext:()=>P.current?.next(),onDone:()=>P.current?.next(),onStop:()=>fe()})),P.current||(P.current=new sn({rescan:()=>{const g=W.current,x=J(g?.question??"");return L.current=x,x},replan:Vt,onChange:Ft,watch:g=>_n(g,300)}))},[Ft,Vt,J,t,fe]),je=j(g=>{const x=g.answer?.steps,T=L.current;!x||x.length===0||!T||(Bt(),W.current={turnId:g.id,question:g.question},b(g.id),s(!1),P.current?.start(T,x))},[Bt]),he=j(async g=>{const x=g.trim();if(!x||m)return;s(!0),f(""),a(!0);const T=`t${de.current+=1}`;let M=Qr(T,x);p(B=>[...B,M]);const re=B=>{M=B,G(T,()=>B)},Q=J(x);L.current=Q;try{await e.ask({question:x,page:Q.page,conversationId:q.current,onEvent:B=>re(ti(M,B,q))}),M.answer?.steps?.length&&je(M),A&&M.answer&&ee.play(B=>e.speak(M.answer?.text??"",B))}catch{re({...M,error:"The support service is not reachable right now."})}finally{a(!1)}},[m,e,G,ee,J,je,A]),_i=j(async g=>{const x=q.current;if(!(!x||!g.messageId||g.reporting||g.escalationId)){G(g.id,T=>({...T,reporting:!0,reportBlocked:void 0}));try{const T=await e.escalate(x,g.messageId);if(!T.ok){G(g.id,Q=>({...Q,reporting:!1,reportBlocked:T.reason}));return}const{escalationId:M,status:re}=T;G(g.id,Q=>({...Q,reporting:!1,escalationId:M,escalation:{id:M,status:Zr(re)}})),ni(e,M,Q=>{G(g.id,B=>(B.escalation?.status!==Q.status&&N(0),{...B,escalation:Q}))})}catch{G(g.id,T=>({...T,reporting:!1,reportBlocked:"failed"}))}}},[e,G]);Z(()=>{if(!l.some(T=>T.escalation&&!Rt.has(T.escalation.status)))return;const x=setInterval(()=>N(T=>T+1),1e3);return()=>clearInterval(x)},[l]),Z(()=>{const g=x=>{x.key==="Escape"&&(W.current?fe():o&&s(!1))};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[o,fe]),Z(()=>{i({open:()=>s(!0),close:()=>s(!1),ask:g=>void he(g)})},[he,i]),Z(()=>()=>{P.current?.dispose(),V.current?.destroy(),ee.stop()},[ee]);const Le=j(async()=>{y(!1),R(!0);try{const g=await ne.stop();if(g){const x=await e.transcribe(g);x?(f(x),he(x)):S("I did not catch that. Try again.")}}catch{S("The microphone is not available.")}finally{R(!1)}},[he,e,ne]),zt=z(Le);zt.current=Le;const bi=j(async()=>{if(u){await Le();return}try{_(!0),await ne.start(()=>void zt.current()),y(!0)}catch{S("Microphone access was declined.")}},[Le,ne,u]);return d("div",{class:"pl-root","data-position":r,children:[d("div",{class:"pl-sr",role:"status","aria-live":"polite",children:k}),o&&d(Jr,{title:"Support",subtitle:m?"Checking":"We can show you on this page",speaking:D,onStopSpeaking:()=>ee.stop(),onClose:()=>s(!1),onEscape:()=>W.current?fe():s(!1),children:[d(zr,{turns:l,guidingTurnId:h,elapsedSeconds:$,onShowMe:je,onReport:g=>void _i(g)}),d($r,{value:c,busy:m,voiceOn:A,voiceSupported:Nt.supported,recording:u,transcribing:v,autoFocus:h===null,onInput:f,onSubmit:()=>void he(c),onToggleVoice:()=>{_(!0),S("Voice is on. Click the microphone to record.")},onToggleRecording:()=>void bi()})]}),d(Ur,{open:o,onClick:()=>s(g=>!g)})]})}function ti(e,t,n){switch(t.type){case"conversation":return n.current=t.conversationId,{...e,messageId:t.messageId};case"understanding":return{...e,feature:t.feature,memory:t.memory};case"probe":return{...e,probes:{...e.probes,[t.probe]:t.status==="running"?{status:"running"}:{status:"done",result:t.result}}};case"verdict":return{...e,verdict:t.verdict};case"answer":return{...e,answer:{text:t.text,steps:t.steps,escalation:t.escalation}};case"error":return{...e,error:t.message}}}function ni(e,t,n){let r=!1;const i=async()=>{if(!r){try{const o=await e.escalation(t);if(n(o),Rt.has(o.status)){r=!0;return}}catch{}setTimeout(i,3e3)}};i()}class ri{constructor(){this.buffer=""}push(t){this.buffer+=t.replace(/\r\n/g,`
`);const n=[];let r=this.buffer.indexOf(`

`);for(;r!==-1;){const i=Ot(this.buffer.slice(0,r));this.buffer=this.buffer.slice(r+2),i!==null&&n.push(i),r=this.buffer.indexOf(`

`)}return n}flush(){const t=this.buffer.trim();if(this.buffer="",!t)return[];const n=Ot(t);return n===null?[]:[n]}}function Ot(e){const t=[];for(const n of e.split(`
`)){if(!n||n.startsWith(":"))continue;const r=n.indexOf(":");if((r===-1?n:n.slice(0,r))!=="data")continue;const i=r===-1?"":n.slice(r+1);t.push(i.startsWith(" ")?i.slice(1):i)}return t.length===0?null:t.join(`
`)}const ii=["docs","interface","repository"],oe=e=>typeof e=="object"&&e!==null;function Pt(e){let t;try{t=JSON.parse(e)}catch{return null}if(!oe(t))return null;switch(t.type){case"conversation":return typeof t.conversationId!="string"||typeof t.messageId!="string"?null:{type:"conversation",conversationId:t.conversationId,messageId:t.messageId};case"understanding":{if(typeof t.feature!="string")return null;const n=t.intent==="howto"||t.intent==="feature"?t.intent:"other",r=Array.isArray(t.memory)?t.memory.filter(i=>typeof i=="string"):[];return{type:"understanding",feature:t.feature,intent:n,memory:r}}case"probe":{if(typeof t.probe!="string"||!ii.includes(t.probe))return null;const n=t.probe;return t.status==="running"?{type:"probe",probe:n,status:"running"}:t.status==="done"&&oe(t.result)?{type:"probe",probe:n,status:"done",result:oi(n,t.result)}:null}case"verdict":return oe(t.verdict)?{type:"verdict",verdict:si(t.verdict)}:null;case"answer":return typeof t.text!="string"?null:{type:"answer",text:t.text,steps:li(t.steps),escalation:ci(t.escalation)};case"error":return{type:"error",message:typeof t.message=="string"?t.message:"Something went wrong."};default:return null}}function oi(e,t){return{probe:e,hit:t.hit===!0,score:typeof t.score=="number"?t.score:null,summary:typeof t.summary=="string"?t.summary:"",evidence:t.evidence??null,latencyMs:typeof t.latencyMs=="number"?t.latencyMs:0}}function si(e){const t=e.outcome;return{outcome:t==="answer"||t==="absent"?t:"hedge",confidence:typeof e.confidence=="number"?e.confidence:0,reasoning:typeof e.reasoning=="string"?e.reasoning:"",feature:typeof e.feature=="string"?e.feature:""}}const ai=["click","input","navigation","manual"];function li(e){if(!Array.isArray(e))return null;const t=[];for(const n of e)oe(n)&&(typeof n.target!="string"||typeof n.caption!="string"||t.push({target:n.target,caption:n.caption,advanceOn:typeof n.advanceOn=="string"&&ai.includes(n.advanceOn)?n.advanceOn:"click"}));return t.length?t:null}function ci(e){return oe(e)?e.offered===!0&&oe(e.request)?{offered:!0,request:e.request}:e.reason==="no_repository"?{offered:!1,reason:"no_repository"}:{offered:!1}:{offered:!1}}const Dt="patchlet:visitor";function Ht(){const e=new Uint8Array(16);return crypto.getRandomValues(e),Array.from(e,t=>t.toString(16).padStart(2,"0")).join("")}function $t(){try{const e=localStorage.getItem(Dt);if(e&&/^[0-9a-f]{32}$/.test(e))return e;const t=Ht();return localStorage.setItem(Dt,t),t}catch{return Ht()}}class ui{constructor(t){this.config=t}url(t){return`${this.config.apiBase.replace(/\/$/,"")}${t}`}async ask({question:t,page:n,conversationId:r,continueFrom:i,signal:o,onEvent:s}){const l={key:this.config.key,question:t,page:n,visitorId:$t()};r&&(l.conversationId=r),typeof i=="number"&&(l.continueFrom=i);const p=await fetch(this.url("/api/chat"),{method:"POST",headers:{"content-type":"application/json",accept:"text/event-stream"},body:JSON.stringify(l),signal:o});if(!p.ok||!p.body)throw new Error(`Chat request failed (${p.status})`);const c=p.body.getReader(),f=new TextDecoder,m=new ri;for(;;){const{done:a,value:h}=await c.read();if(a)break;for(const b of m.push(f.decode(h,{stream:!0}))){const k=Pt(b);k&&s(k)}}for(const a of m.flush()){const h=Pt(a);h&&s(h)}}async escalate(t,n){const r=await fetch(this.url("/api/escalate"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:this.config.key,conversationId:t,messageId:n,visitorId:$t()})}),i=await r.json().catch(()=>({}));return!r.ok||!i.escalationId?{ok:!1,reason:i.reason==="no_repository"?"no_repository":"failed"}:{ok:!0,escalationId:i.escalationId,status:i.status??"queued"}}async escalation(t){const n=await fetch(this.url(`/api/escalations/${encodeURIComponent(t)}?key=${encodeURIComponent(this.config.key)}`));if(!n.ok)throw new Error(`Could not read the report status (${n.status})`);return await n.json()}async transcribe(t){const n=new FormData;n.append("key",this.config.key),n.append("file",t,"speech.webm");const r=await fetch(this.url("/api/transcribe"),{method:"POST",body:n});if(!r.ok)throw new Error(`Could not transcribe that (${r.status})`);const i=await r.json();return typeof i.text=="string"?i.text:""}async speak(t,n){const r=await fetch(this.url("/api/speak"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:this.config.key,text:t}),signal:n});if(!r.ok)throw new Error(`Could not read that out (${r.status})`);return r}}const pe={"--pl-accent":"#2e6f54","--pl-ink":"#17201c","--pl-muted":"#68716c","--pl-glass":"rgba(255, 253, 247, 0.6)","--pl-radius":"18px"},Ut=`
:host {
  --pl-accent: ${pe["--pl-accent"]};
  --pl-ink: ${pe["--pl-ink"]};
  --pl-muted: ${pe["--pl-muted"]};
  --pl-glass: ${pe["--pl-glass"]};
  --pl-radius: ${pe["--pl-radius"]};

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
.pl-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }
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
}
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
  box-shadow: var(--pl-shadow);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--pl-ink);
  transition: transform 160ms ease;
}
.pl-spot__counter { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--pl-muted); }
.pl-spot__caption { margin: 0; font-size: 13.5px; }
.pl-spot__actions { display: flex; justify-content: flex-end; gap: 8px; }
.pl-spot--busy .pl-spot__caption { opacity: 0.6; }

@media (prefers-reduced-motion: reduce) {
  .pl-panel { animation: none; }
  .pl-launcher, .pl-btn, .pl-spot__bubble, .pl-spot__ring, .pl-spot__scrim { transition: none; }
  .pl-pill--running .pl-dot { animation: none; opacity: 1; }
}
`;function pi(e){if(typeof CSSStyleSheet<"u"&&"adoptedStyleSheets"in Document.prototype)try{const n=new CSSStyleSheet;n.replaceSync(Ut),e.adoptedStyleSheets=[...e.adoptedStyleSheets,n];return}catch{}const t=document.createElement("style");t.textContent=Ut,e.appendChild(t)}function qt(){const e=[document.body,document.documentElement].filter(Boolean);for(const t of e){const n=getComputedStyle(t).backgroundColor,r=di(n);if(r!==null)return r<.4?"dark":"light"}return typeof matchMedia=="function"&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function di(e){const t=e.match(/rgba?\(([^)]+)\)/);if(!t)return null;const n=t[1].split(",").map(s=>Number.parseFloat(s.trim()));if(n.length<3||n.some(Number.isNaN)||n.length>3&&n[3]===0)return null;const[r,i,o]=n;return(.2126*r+.7152*i+.0722*o)/255}const Gt="patchlet-widget",fi="patchlet_ask";function hi(){return new URLSearchParams(location.search).get(fi)?.trim()??""}function gi(){const t=document.currentScript??document.querySelector("script[data-key]"),n=t?.dataset.key?.trim();if(!n)return console.warn("[patchlet] no data-key on the script tag, the widget will not load"),null;const r=t?.src?new URL(t.src,location.href).origin:location.origin,i=t?.dataset.api?.trim()||r,o=t?.dataset.position==="left"?"left":"right";return{key:n,apiBase:i,position:o}}function jt(e){if(document.querySelector(Gt))return;let t=hi();const n=document.createElement(Gt);n.setAttribute("data-pl-scheme",qt()),document.body.appendChild(n);const r=n.attachShadow({mode:"open"});pi(r);const i=document.createElement("div");r.appendChild(i);const o=new MutationObserver(()=>n.setAttribute("data-pl-scheme",qt()));o.observe(document.documentElement,{attributes:!0,attributeFilter:["class","style","data-theme"]}),o.observe(document.body,{attributes:!0,attributeFilter:["class","style","data-theme"]});const s=new ui({apiBase:e.apiBase,key:e.key});en(d(ei,{client:s,shadow:r,host:n,position:e.position,register:l=>{if(window.Patchlet=l,t){const p=t;t="",setTimeout(()=>window.Patchlet?.ask(p),400)}}}),i)}function mi(){const e=gi();e&&(document.body?jt(e):document.addEventListener("DOMContentLoaded",()=>jt(e),{once:!0}))}mi()})();
