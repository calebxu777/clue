(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function s(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=s(r);fetch(r.href,i)}})();const w=Object.create(null);w.open="0";w.close="1";w.ping="2";w.pong="3";w.message="4";w.upgrade="5";w.noop="6";const P=Object.create(null);Object.keys(w).forEach(t=>{P[w[t]]=t});const G={type:"error",data:"parser error"},_e=typeof Blob=="function"||typeof Blob<"u"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",xe=typeof ArrayBuffer=="function",Ee=t=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(t):t&&t.buffer instanceof ArrayBuffer,oe=({type:t,data:e},s,n)=>_e&&e instanceof Blob?s?n(e):pe(e,n):xe&&(e instanceof ArrayBuffer||Ee(e))?s?n(e):pe(new Blob([e]),n):n(w[t]+(e||"")),pe=(t,e)=>{const s=new FileReader;return s.onload=function(){const n=s.result.split(",")[1];e("b"+(n||""))},s.readAsDataURL(t)};function fe(t){return t instanceof Uint8Array?t:t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}let z;function Ue(t,e){if(_e&&t.data instanceof Blob)return t.data.arrayBuffer().then(fe).then(e);if(xe&&(t.data instanceof ArrayBuffer||Ee(t.data)))return e(fe(t.data));oe(t,!1,s=>{z||(z=new TextEncoder),e(z.encode(s))})}const me="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",R=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(let t=0;t<me.length;t++)R[me.charCodeAt(t)]=t;const He=t=>{let e=t.length*.75,s=t.length,n,r=0,i,a,c,d;t[t.length-1]==="="&&(e--,t[t.length-2]==="="&&e--);const h=new ArrayBuffer(e),m=new Uint8Array(h);for(n=0;n<s;n+=4)i=R[t.charCodeAt(n)],a=R[t.charCodeAt(n+1)],c=R[t.charCodeAt(n+2)],d=R[t.charCodeAt(n+3)],m[r++]=i<<2|a>>4,m[r++]=(a&15)<<4|c>>2,m[r++]=(c&3)<<6|d&63;return h},Ve=typeof ArrayBuffer=="function",ie=(t,e)=>{if(typeof t!="string")return{type:"message",data:Ce(t,e)};const s=t.charAt(0);return s==="b"?{type:"message",data:We(t.substring(1),e)}:P[s]?t.length>1?{type:P[s],data:t.substring(1)}:{type:P[s]}:G},We=(t,e)=>{if(Ve){const s=He(t);return Ce(s,e)}else return{base64:!0,data:t}},Ce=(t,e)=>e==="blob"?t instanceof Blob?t:new Blob([t]):t instanceof ArrayBuffer?t:t.buffer,Se="",Fe=(t,e)=>{const s=t.length,n=new Array(s);let r=0;t.forEach((i,a)=>{oe(i,!1,c=>{n[a]=c,++r===s&&e(n.join(Se))})})},je=(t,e)=>{const s=t.split(Se),n=[];for(let r=0;r<s.length;r++){const i=ie(s[r],e);if(n.push(i),i.type==="error")break}return n};function ze(){return new TransformStream({transform(t,e){Ue(t,s=>{const n=s.length;let r;if(n<126)r=new Uint8Array(1),new DataView(r.buffer).setUint8(0,n);else if(n<65536){r=new Uint8Array(3);const i=new DataView(r.buffer);i.setUint8(0,126),i.setUint16(1,n)}else{r=new Uint8Array(9);const i=new DataView(r.buffer);i.setUint8(0,127),i.setBigUint64(1,BigInt(n))}t.data&&typeof t.data!="string"&&(r[0]|=128),e.enqueue(r),e.enqueue(s)})}})}let K;function N(t){return t.reduce((e,s)=>e+s.length,0)}function L(t,e){if(t[0].length===e)return t.shift();const s=new Uint8Array(e);let n=0;for(let r=0;r<e;r++)s[r]=t[0][n++],n===t[0].length&&(t.shift(),n=0);return t.length&&n<t[0].length&&(t[0]=t[0].slice(n)),s}function Ke(t,e){K||(K=new TextDecoder);const s=[];let n=0,r=-1,i=!1;return new TransformStream({transform(a,c){for(s.push(a);;){if(n===0){if(N(s)<1)break;const d=L(s,1);i=(d[0]&128)===128,r=d[0]&127,r<126?n=3:r===126?n=1:n=2}else if(n===1){if(N(s)<2)break;const d=L(s,2);r=new DataView(d.buffer,d.byteOffset,d.length).getUint16(0),n=3}else if(n===2){if(N(s)<8)break;const d=L(s,8),h=new DataView(d.buffer,d.byteOffset,d.length),m=h.getUint32(0);if(m>Math.pow(2,21)-1){c.enqueue(G);break}r=m*Math.pow(2,32)+h.getUint32(4),n=3}else{if(N(s)<r)break;const d=L(s,r);c.enqueue(ie(i?d:K.decode(d),e)),n=0}if(r===0||r>t){c.enqueue(G);break}}}})}const Ie=4;function p(t){if(t)return Ye(t)}function Ye(t){for(var e in p.prototype)t[e]=p.prototype[e];return t}p.prototype.on=p.prototype.addEventListener=function(t,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+t]=this._callbacks["$"+t]||[]).push(e),this};p.prototype.once=function(t,e){function s(){this.off(t,s),e.apply(this,arguments)}return s.fn=e,this.on(t,s),this};p.prototype.off=p.prototype.removeListener=p.prototype.removeAllListeners=p.prototype.removeEventListener=function(t,e){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var s=this._callbacks["$"+t];if(!s)return this;if(arguments.length==1)return delete this._callbacks["$"+t],this;for(var n,r=0;r<s.length;r++)if(n=s[r],n===e||n.fn===e){s.splice(r,1);break}return s.length===0&&delete this._callbacks["$"+t],this};p.prototype.emit=function(t){this._callbacks=this._callbacks||{};for(var e=new Array(arguments.length-1),s=this._callbacks["$"+t],n=1;n<arguments.length;n++)e[n-1]=arguments[n];if(s){s=s.slice(0);for(var n=0,r=s.length;n<r;++n)s[n].apply(this,e)}return this};p.prototype.emitReserved=p.prototype.emit;p.prototype.listeners=function(t){return this._callbacks=this._callbacks||{},this._callbacks["$"+t]||[]};p.prototype.hasListeners=function(t){return!!this.listeners(t).length};const V=typeof Promise=="function"&&typeof Promise.resolve=="function"?e=>Promise.resolve().then(e):(e,s)=>s(e,0),y=typeof self<"u"?self:typeof window<"u"?window:Function("return this")(),Je="arraybuffer";function $e(t,...e){return e.reduce((s,n)=>(t.hasOwnProperty(n)&&(s[n]=t[n]),s),{})}const Xe=y.setTimeout,Qe=y.clearTimeout;function W(t,e){e.useNativeTimers?(t.setTimeoutFn=Xe.bind(y),t.clearTimeoutFn=Qe.bind(y)):(t.setTimeoutFn=y.setTimeout.bind(y),t.clearTimeoutFn=y.clearTimeout.bind(y))}const Ge=1.33;function Ze(t){return typeof t=="string"?et(t):Math.ceil((t.byteLength||t.size)*Ge)}function et(t){let e=0,s=0;for(let n=0,r=t.length;n<r;n++)e=t.charCodeAt(n),e<128?s+=1:e<2048?s+=2:e<55296||e>=57344?s+=3:(n++,s+=4);return s}function Te(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function tt(t){let e="";for(let s in t)t.hasOwnProperty(s)&&(e.length&&(e+="&"),e+=encodeURIComponent(s)+"="+encodeURIComponent(t[s]));return e}function st(t){let e={},s=t.split("&");for(let n=0,r=s.length;n<r;n++){let i=s[n].split("=");e[decodeURIComponent(i[0])]=decodeURIComponent(i[1])}return e}class nt extends Error{constructor(e,s,n){super(e),this.description=s,this.context=n,this.type="TransportError"}}class ae extends p{constructor(e){super(),this.writable=!1,W(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,s,n){return super.emitReserved("error",new nt(e,s,n)),this}open(){return this.readyState="opening",this.doOpen(),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(e){this.readyState==="open"&&this.write(e)}onOpen(){this.readyState="open",this.writable=!0,super.emitReserved("open")}onData(e){const s=ie(e,this.socket.binaryType);this.onPacket(s)}onPacket(e){super.emitReserved("packet",e)}onClose(e){this.readyState="closed",super.emitReserved("close",e)}pause(e){}createUri(e,s={}){return e+"://"+this._hostname()+this._port()+this.opts.path+this._query(s)}_hostname(){const e=this.opts.hostname;return e.indexOf(":")===-1?e:"["+e+"]"}_port(){return this.opts.port&&(this.opts.secure&&Number(this.opts.port)!==443||!this.opts.secure&&Number(this.opts.port)!==80)?":"+this.opts.port:""}_query(e){const s=tt(e);return s.length?"?"+s:""}}class rt extends ae{constructor(){super(...arguments),this._polling=!1}get name(){return"polling"}doOpen(){this._poll()}pause(e){this.readyState="pausing";const s=()=>{this.readyState="paused",e()};if(this._polling||!this.writable){let n=0;this._polling&&(n++,this.once("pollComplete",function(){--n||s()})),this.writable||(n++,this.once("drain",function(){--n||s()}))}else s()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved("poll")}onData(e){const s=n=>{if(this.readyState==="opening"&&n.type==="open"&&this.onOpen(),n.type==="close")return this.onClose({description:"transport closed by the server"}),!1;this.onPacket(n)};je(e,this.socket.binaryType).forEach(s),this.readyState!=="closed"&&(this._polling=!1,this.emitReserved("pollComplete"),this.readyState==="open"&&this._poll())}doClose(){const e=()=>{this.write([{type:"close"}])};this.readyState==="open"?e():this.once("open",e)}write(e){this.writable=!1,Fe(e,s=>{this.doWrite(s,()=>{this.writable=!0,this.emitReserved("drain")})})}uri(){const e=this.opts.secure?"https":"http",s=this.query||{};return this.opts.timestampRequests!==!1&&(s[this.opts.timestampParam]=Te()),!this.supportsBinary&&!s.sid&&(s.b64=1),this.createUri(e,s)}}let Re=!1;try{Re=typeof XMLHttpRequest<"u"&&"withCredentials"in new XMLHttpRequest}catch{}const ot=Re;function it(){}class at extends rt{constructor(e){if(super(e),typeof location<"u"){const s=location.protocol==="https:";let n=location.port;n||(n=s?"443":"80"),this.xd=typeof location<"u"&&e.hostname!==location.hostname||n!==e.port}}doWrite(e,s){const n=this.request({method:"POST",data:e});n.on("success",s),n.on("error",(r,i)=>{this.onError("xhr post error",r,i)})}doPoll(){const e=this.request();e.on("data",this.onData.bind(this)),e.on("error",(s,n)=>{this.onError("xhr poll error",s,n)}),this.pollXhr=e}}class k extends p{constructor(e,s,n){super(),this.createRequest=e,W(this,n),this._opts=n,this._method=n.method||"GET",this._uri=s,this._data=n.data!==void 0?n.data:null,this._create()}_create(){var e;const s=$e(this._opts,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");s.xdomain=!!this._opts.xd;const n=this._xhr=this.createRequest(s);try{n.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){n.setDisableHeaderCheck&&n.setDisableHeaderCheck(!0);for(let r in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(r)&&n.setRequestHeader(r,this._opts.extraHeaders[r])}}catch{}if(this._method==="POST")try{n.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{n.setRequestHeader("Accept","*/*")}catch{}(e=this._opts.cookieJar)===null||e===void 0||e.addCookies(n),"withCredentials"in n&&(n.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(n.timeout=this._opts.requestTimeout),n.onreadystatechange=()=>{var r;n.readyState===3&&((r=this._opts.cookieJar)===null||r===void 0||r.parseCookies(n.getResponseHeader("set-cookie"))),n.readyState===4&&(n.status===200||n.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof n.status=="number"?n.status:0)},0))},n.send(this._data)}catch(r){this.setTimeoutFn(()=>{this._onError(r)},0);return}typeof document<"u"&&(this._index=k.requestsCount++,k.requests[this._index]=this)}_onError(e){this.emitReserved("error",e,this._xhr),this._cleanup(!0)}_cleanup(e){if(!(typeof this._xhr>"u"||this._xhr===null)){if(this._xhr.onreadystatechange=it,e)try{this._xhr.abort()}catch{}typeof document<"u"&&delete k.requests[this._index],this._xhr=null}}_onLoad(){const e=this._xhr.responseText;e!==null&&(this.emitReserved("data",e),this.emitReserved("success"),this._cleanup())}abort(){this._cleanup()}}k.requestsCount=0;k.requests={};if(typeof document<"u"){if(typeof attachEvent=="function")attachEvent("onunload",ye);else if(typeof addEventListener=="function"){const t="onpagehide"in y?"pagehide":"unload";addEventListener(t,ye,!1)}}function ye(){for(let t in k.requests)k.requests.hasOwnProperty(t)&&k.requests[t].abort()}const ct=(function(){const t=Ae({xdomain:!1});return t&&t.responseType!==null})();class lt extends at{constructor(e){super(e);const s=e&&e.forceBase64;this.supportsBinary=ct&&!s}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new k(Ae,this.uri(),e)}}function Ae(t){const e=t.xdomain;try{if(typeof XMLHttpRequest<"u"&&(!e||ot))return new XMLHttpRequest}catch{}if(!e)try{return new y[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}const Oe=typeof navigator<"u"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class dt extends ae{get name(){return"websocket"}doOpen(){const e=this.uri(),s=this.opts.protocols,n=Oe?{}:$e(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(n.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,s,n)}catch(r){return this.emitReserved("error",r)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:"websocket connection closed",context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError("websocket error",e)}write(e){this.writable=!1;for(let s=0;s<e.length;s++){const n=e[s],r=s===e.length-1;oe(n,this.supportsBinary,i=>{try{this.doWrite(n,i)}catch{}r&&V(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){typeof this.ws<"u"&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){const e=this.opts.secure?"wss":"ws",s=this.query||{};return this.opts.timestampRequests&&(s[this.opts.timestampParam]=Te()),this.supportsBinary||(s.b64=1),this.createUri(e,s)}}const Y=y.WebSocket||y.MozWebSocket;class ut extends dt{createSocket(e,s,n){return Oe?new Y(e,s,n):s?new Y(e,s):new Y(e)}doWrite(e,s){this.ws.send(s)}}class ht extends ae{get name(){return"webtransport"}doOpen(){try{this._transport=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved("error",e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError("webtransport error",e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{const s=Ke(Number.MAX_SAFE_INTEGER,this.socket.binaryType),n=e.readable.pipeThrough(s).getReader(),r=ze();r.readable.pipeTo(e.writable),this._writer=r.writable.getWriter();const i=()=>{n.read().then(({done:c,value:d})=>{c||(this.onPacket(d),i())}).catch(c=>{})};i();const a={type:"open"};this.query.sid&&(a.data=`{"sid":"${this.query.sid}"}`),this._writer.write(a).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let s=0;s<e.length;s++){const n=e[s],r=s===e.length-1;this._writer.write(n).then(()=>{r&&V(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)===null||e===void 0||e.close()}}const pt={websocket:ut,webtransport:ht,polling:lt},ft=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,mt=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function Z(t){if(t.length>8e3)throw"URI too long";const e=t,s=t.indexOf("["),n=t.indexOf("]");s!=-1&&n!=-1&&(t=t.substring(0,s)+t.substring(s,n).replace(/:/g,";")+t.substring(n,t.length));let r=ft.exec(t||""),i={},a=14;for(;a--;)i[mt[a]]=r[a]||"";return s!=-1&&n!=-1&&(i.source=e,i.host=i.host.substring(1,i.host.length-1).replace(/;/g,":"),i.authority=i.authority.replace("[","").replace("]","").replace(/;/g,":"),i.ipv6uri=!0),i.pathNames=yt(i,i.path),i.queryKey=gt(i,i.query),i}function yt(t,e){const s=/\/{2,9}/g,n=e.replace(s,"/").split("/");return(e.slice(0,1)=="/"||e.length===0)&&n.splice(0,1),e.slice(-1)=="/"&&n.splice(n.length-1,1),n}function gt(t,e){const s={};return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(n,r,i){r&&(s[r]=i)}),s}const ee=typeof addEventListener=="function"&&typeof removeEventListener=="function",q=[];ee&&addEventListener("offline",()=>{q.forEach(t=>t())},!1);class x extends p{constructor(e,s){if(super(),this.binaryType=Je,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e=="object"&&(s=e,e=null),e){const n=Z(e);s.hostname=n.host,s.secure=n.protocol==="https"||n.protocol==="wss",s.port=n.port,n.query&&(s.query=n.query)}else s.host&&(s.hostname=Z(s.host).host);W(this,s),this.secure=s.secure!=null?s.secure:typeof location<"u"&&location.protocol==="https:",s.hostname&&!s.port&&(s.port=this.secure?"443":"80"),this.hostname=s.hostname||(typeof location<"u"?location.hostname:"localhost"),this.port=s.port||(typeof location<"u"&&location.port?location.port:this.secure?"443":"80"),this.transports=[],this._transportsByName={},s.transports.forEach(n=>{const r=n.prototype.name;this.transports.push(r),this._transportsByName[r]=n}),this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},s),this.opts.path=this.opts.path.replace(/\/$/,"")+(this.opts.addTrailingSlash?"/":""),typeof this.opts.query=="string"&&(this.opts.query=st(this.opts.query)),ee&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener("beforeunload",this._beforeunloadEventListener,!1)),this.hostname!=="localhost"&&(this._offlineEventListener=()=>{this._onClose("transport close",{description:"network connection lost"})},q.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){const s=Object.assign({},this.opts.query);s.EIO=Ie,s.transport=e,this.id&&(s.sid=this.id);const n=Object.assign({},this.opts,{query:s,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](n)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved("error","No transports available")},0);return}const e=this.opts.rememberUpgrade&&x.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1?"websocket":this.transports[0];this.readyState="opening";const s=this.createTransport(e);s.open(),this.setTransport(s)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on("drain",this._onDrain.bind(this)).on("packet",this._onPacket.bind(this)).on("error",this._onError.bind(this)).on("close",s=>this._onClose("transport close",s))}onOpen(){this.readyState="open",x.priorWebsocketSuccess=this.transport.name==="websocket",this.emitReserved("open"),this.flush()}_onPacket(e){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(this.emitReserved("packet",e),this.emitReserved("heartbeat"),e.type){case"open":this.onHandshake(JSON.parse(e.data));break;case"ping":this._sendPacket("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this._resetPingTimeout();break;case"error":const s=new Error("server error");s.code=e.data,this._onError(s);break;case"message":this.emitReserved("data",e.data),this.emitReserved("message",e.data);break}}onHandshake(e){this.emitReserved("handshake",e),this.id=e.sid,this.transport.query.sid=e.sid,this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!=="closed"&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);const e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose("ping timeout")},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved("drain"):this.flush()}flush(){if(this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){const e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved("flush")}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name==="polling"&&this.writeBuffer.length>1))return this.writeBuffer;let s=1;for(let n=0;n<this.writeBuffer.length;n++){const r=this.writeBuffer[n].data;if(r&&(s+=Ze(r)),n>0&&s>this._maxPayload)return this.writeBuffer.slice(0,n);s+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;const e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,V(()=>{this._onClose("ping timeout")},this.setTimeoutFn)),e}write(e,s,n){return this._sendPacket("message",e,s,n),this}send(e,s,n){return this._sendPacket("message",e,s,n),this}_sendPacket(e,s,n,r){if(typeof s=="function"&&(r=s,s=void 0),typeof n=="function"&&(r=n,n=null),this.readyState==="closing"||this.readyState==="closed")return;n=n||{},n.compress=n.compress!==!1;const i={type:e,data:s,options:n};this.emitReserved("packetCreate",i),this.writeBuffer.push(i),r&&this.once("flush",r),this.flush()}close(){const e=()=>{this._onClose("forced close"),this.transport.close()},s=()=>{this.off("upgrade",s),this.off("upgradeError",s),e()},n=()=>{this.once("upgrade",s),this.once("upgradeError",s)};return(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",()=>{this.upgrading?n():e()}):this.upgrading?n():e()),this}_onError(e){if(x.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState==="opening")return this.transports.shift(),this._open();this.emitReserved("error",e),this._onClose("transport error",e)}_onClose(e,s){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),ee&&(this._beforeunloadEventListener&&removeEventListener("beforeunload",this._beforeunloadEventListener,!1),this._offlineEventListener)){const n=q.indexOf(this._offlineEventListener);n!==-1&&q.splice(n,1)}this.readyState="closed",this.id=null,this.emitReserved("close",e,s),this.writeBuffer=[],this._prevBufferLen=0}}}x.protocol=Ie;class vt extends x{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState==="open"&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_probe(e){let s=this.createTransport(e),n=!1;x.priorWebsocketSuccess=!1;const r=()=>{n||(s.send([{type:"ping",data:"probe"}]),s.once("packet",_=>{if(!n)if(_.type==="pong"&&_.data==="probe"){if(this.upgrading=!0,this.emitReserved("upgrading",s),!s)return;x.priorWebsocketSuccess=s.name==="websocket",this.transport.pause(()=>{n||this.readyState!=="closed"&&(m(),this.setTransport(s),s.send([{type:"upgrade"}]),this.emitReserved("upgrade",s),s=null,this.upgrading=!1,this.flush())})}else{const $=new Error("probe error");$.transport=s.name,this.emitReserved("upgradeError",$)}}))};function i(){n||(n=!0,m(),s.close(),s=null)}const a=_=>{const $=new Error("probe error: "+_);$.transport=s.name,i(),this.emitReserved("upgradeError",$)};function c(){a("transport closed")}function d(){a("socket closed")}function h(_){s&&_.name!==s.name&&i()}const m=()=>{s.removeListener("open",r),s.removeListener("error",a),s.removeListener("close",c),this.off("close",d),this.off("upgrading",h)};s.once("open",r),s.once("error",a),s.once("close",c),this.once("close",d),this.once("upgrading",h),this._upgrades.indexOf("webtransport")!==-1&&e!=="webtransport"?this.setTimeoutFn(()=>{n||s.open()},200):s.open()}onHandshake(e){this._upgrades=this._filterUpgrades(e.upgrades),super.onHandshake(e)}_filterUpgrades(e){const s=[];for(let n=0;n<e.length;n++)~this.transports.indexOf(e[n])&&s.push(e[n]);return s}}let bt=class extends vt{constructor(e,s={}){const n=typeof e=="object"?e:s;(!n.transports||n.transports&&typeof n.transports[0]=="string")&&(n.transports=(n.transports||["polling","websocket","webtransport"]).map(r=>pt[r]).filter(r=>!!r)),super(e,n)}};function kt(t,e="",s){let n=t;s=s||typeof location<"u"&&location,t==null&&(t=s.protocol+"//"+s.host),typeof t=="string"&&(t.charAt(0)==="/"&&(t.charAt(1)==="/"?t=s.protocol+t:t=s.host+t),/^(https?|wss?):\/\//.test(t)||(typeof s<"u"?t=s.protocol+"//"+t:t="https://"+t),n=Z(t)),n.port||(/^(http|ws)$/.test(n.protocol)?n.port="80":/^(http|ws)s$/.test(n.protocol)&&(n.port="443")),n.path=n.path||"/";const i=n.host.indexOf(":")!==-1?"["+n.host+"]":n.host;return n.id=n.protocol+"://"+i+":"+n.port+e,n.href=n.protocol+"://"+i+(s&&s.port===n.port?"":":"+n.port),n}const wt=typeof ArrayBuffer=="function",_t=t=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(t):t.buffer instanceof ArrayBuffer,Be=Object.prototype.toString,xt=typeof Blob=="function"||typeof Blob<"u"&&Be.call(Blob)==="[object BlobConstructor]",Et=typeof File=="function"||typeof File<"u"&&Be.call(File)==="[object FileConstructor]";function ce(t){return wt&&(t instanceof ArrayBuffer||_t(t))||xt&&t instanceof Blob||Et&&t instanceof File}function D(t,e){if(!t||typeof t!="object")return!1;if(Array.isArray(t)){for(let s=0,n=t.length;s<n;s++)if(D(t[s]))return!0;return!1}if(ce(t))return!0;if(t.toJSON&&typeof t.toJSON=="function"&&arguments.length===1)return D(t.toJSON(),!0);for(const s in t)if(Object.prototype.hasOwnProperty.call(t,s)&&D(t[s]))return!0;return!1}function Ct(t){const e=[],s=t.data,n=t;return n.data=te(s,e),n.attachments=e.length,{packet:n,buffers:e}}function te(t,e){if(!t)return t;if(ce(t)){const s={_placeholder:!0,num:e.length};return e.push(t),s}else if(Array.isArray(t)){const s=new Array(t.length);for(let n=0;n<t.length;n++)s[n]=te(t[n],e);return s}else if(typeof t=="object"&&!(t instanceof Date)){const s={};for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&(s[n]=te(t[n],e));return s}return t}function St(t,e){return t.data=se(t.data,e),delete t.attachments,t}function se(t,e){if(!t)return t;if(t&&t._placeholder===!0){if(typeof t.num=="number"&&t.num>=0&&t.num<e.length)return e[t.num];throw new Error("illegal attachments")}else if(Array.isArray(t))for(let s=0;s<t.length;s++)t[s]=se(t[s],e);else if(typeof t=="object")for(const s in t)Object.prototype.hasOwnProperty.call(t,s)&&(t[s]=se(t[s],e));return t}const It=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"];var l;(function(t){t[t.CONNECT=0]="CONNECT",t[t.DISCONNECT=1]="DISCONNECT",t[t.EVENT=2]="EVENT",t[t.ACK=3]="ACK",t[t.CONNECT_ERROR=4]="CONNECT_ERROR",t[t.BINARY_EVENT=5]="BINARY_EVENT",t[t.BINARY_ACK=6]="BINARY_ACK"})(l||(l={}));class $t{constructor(e){this.replacer=e}encode(e){return(e.type===l.EVENT||e.type===l.ACK)&&D(e)?this.encodeAsBinary({type:e.type===l.EVENT?l.BINARY_EVENT:l.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let s=""+e.type;return(e.type===l.BINARY_EVENT||e.type===l.BINARY_ACK)&&(s+=e.attachments+"-"),e.nsp&&e.nsp!=="/"&&(s+=e.nsp+","),e.id!=null&&(s+=e.id),e.data!=null&&(s+=JSON.stringify(e.data,this.replacer)),s}encodeAsBinary(e){const s=Ct(e),n=this.encodeAsString(s.packet),r=s.buffers;return r.unshift(n),r}}class le extends p{constructor(e){super(),this.opts=Object.assign({reviver:void 0,maxAttachments:10},typeof e=="function"?{reviver:e}:e)}add(e){let s;if(typeof e=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");s=this.decodeString(e);const n=s.type===l.BINARY_EVENT;n||s.type===l.BINARY_ACK?(s.type=n?l.EVENT:l.ACK,this.reconstructor=new Tt(s),s.attachments===0&&super.emitReserved("decoded",s)):super.emitReserved("decoded",s)}else if(ce(e)||e.base64)if(this.reconstructor)s=this.reconstructor.takeBinaryData(e),s&&(this.reconstructor=null,super.emitReserved("decoded",s));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+e)}decodeString(e){let s=0;const n={type:Number(e.charAt(0))};if(l[n.type]===void 0)throw new Error("unknown packet type "+n.type);if(n.type===l.BINARY_EVENT||n.type===l.BINARY_ACK){const i=s+1;for(;e.charAt(++s)!=="-"&&s!=e.length;);const a=e.substring(i,s);if(a!=Number(a)||e.charAt(s)!=="-")throw new Error("Illegal attachments");const c=Number(a);if(!Rt(c)||c<0)throw new Error("Illegal attachments");if(c>this.opts.maxAttachments)throw new Error("too many attachments");n.attachments=c}if(e.charAt(s+1)==="/"){const i=s+1;for(;++s&&!(e.charAt(s)===","||s===e.length););n.nsp=e.substring(i,s)}else n.nsp="/";const r=e.charAt(s+1);if(r!==""&&Number(r)==r){const i=s+1;for(;++s;){const a=e.charAt(s);if(a==null||Number(a)!=a){--s;break}if(s===e.length)break}n.id=Number(e.substring(i,s+1))}if(e.charAt(++s)){const i=this.tryParse(e.substr(s));if(le.isPayloadValid(n.type,i))n.data=i;else throw new Error("invalid payload")}return n}tryParse(e){try{return JSON.parse(e,this.opts.reviver)}catch{return!1}}static isPayloadValid(e,s){switch(e){case l.CONNECT:return ge(s);case l.DISCONNECT:return s===void 0;case l.CONNECT_ERROR:return typeof s=="string"||ge(s);case l.EVENT:case l.BINARY_EVENT:return Array.isArray(s)&&(typeof s[0]=="number"||typeof s[0]=="string"&&It.indexOf(s[0])===-1);case l.ACK:case l.BINARY_ACK:return Array.isArray(s)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class Tt{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){const s=St(this.reconPack,this.buffers);return this.finishedReconstruction(),s}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}const Rt=Number.isInteger||function(t){return typeof t=="number"&&isFinite(t)&&Math.floor(t)===t};function ge(t){return Object.prototype.toString.call(t)==="[object Object]"}const At=Object.freeze(Object.defineProperty({__proto__:null,Decoder:le,Encoder:$t,get PacketType(){return l}},Symbol.toStringTag,{value:"Module"}));function v(t,e,s){return t.on(e,s),function(){t.off(e,s)}}const Ot=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class Ne extends p{constructor(e,s,n){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=s,n&&n.auth&&(this.auth=n.auth),this._opts=Object.assign({},n),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const e=this.io;this.subs=[v(e,"open",this.onopen.bind(this)),v(e,"packet",this.onpacket.bind(this)),v(e,"error",this.onerror.bind(this)),v(e,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift("message"),this.emit.apply(this,e),this}emit(e,...s){var n,r,i;if(Ot.hasOwnProperty(e))throw new Error('"'+e.toString()+'" is a reserved event name');if(s.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(s),this;const a={type:l.EVENT,data:s};if(a.options={},a.options.compress=this.flags.compress!==!1,typeof s[s.length-1]=="function"){const m=this.ids++,_=s.pop();this._registerAckCallback(m,_),a.id=m}const c=(r=(n=this.io.engine)===null||n===void 0?void 0:n.transport)===null||r===void 0?void 0:r.writable,d=this.connected&&!(!((i=this.io.engine)===null||i===void 0)&&i._hasPingExpired());return this.flags.volatile&&!c||(d?(this.notifyOutgoingListeners(a),this.packet(a)):this.sendBuffer.push(a)),this.flags={},this}_registerAckCallback(e,s){var n;const r=(n=this.flags.timeout)!==null&&n!==void 0?n:this._opts.ackTimeout;if(r===void 0){this.acks[e]=s;return}const i=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let c=0;c<this.sendBuffer.length;c++)this.sendBuffer[c].id===e&&this.sendBuffer.splice(c,1);s.call(this,new Error("operation has timed out"))},r),a=(...c)=>{this.io.clearTimeoutFn(i),s.apply(this,c)};a.withError=!0,this.acks[e]=a}emitWithAck(e,...s){return new Promise((n,r)=>{const i=(a,c)=>a?r(a):n(c);i.withError=!0,s.push(i),this.emit(e,...s)})}_addToQueue(e){let s;typeof e[e.length-1]=="function"&&(s=e.pop());const n={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((r,...i)=>(this._queue[0],r!==null?n.tryCount>this._opts.retries&&(this._queue.shift(),s&&s(r)):(this._queue.shift(),s&&s(null,...i)),n.pending=!1,this._drainQueue())),this._queue.push(n),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;const s=this._queue[0];s.pending&&!e||(s.pending=!0,s.tryCount++,this.flags=s.flags,this.emit.apply(this,s.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth=="function"?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:l.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved("connect_error",e)}onclose(e,s){this.connected=!1,delete this.id,this.emitReserved("disconnect",e,s),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(n=>String(n.id)===e)){const n=this.acks[e];delete this.acks[e],n.withError&&n.call(this,new Error("socket has been disconnected"))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case l.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case l.EVENT:case l.BINARY_EVENT:this.onevent(e);break;case l.ACK:case l.BINARY_ACK:this.onack(e);break;case l.DISCONNECT:this.ondisconnect();break;case l.CONNECT_ERROR:this.destroy();const n=new Error(e.data.message);n.data=e.data.data,this.emitReserved("connect_error",n);break}}onevent(e){const s=e.data||[];e.id!=null&&s.push(this.ack(e.id)),this.connected?this.emitEvent(s):this.receiveBuffer.push(Object.freeze(s))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){const s=this._anyListeners.slice();for(const n of s)n.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]=="string"&&(this._lastOffset=e[e.length-1])}ack(e){const s=this;let n=!1;return function(...r){n||(n=!0,s.packet({type:l.ACK,id:e,data:r}))}}onack(e){const s=this.acks[e.id];typeof s=="function"&&(delete this.acks[e.id],s.withError&&e.data.unshift(null),s.apply(this,e.data))}onconnect(e,s){this.id=e,this.recovered=s&&this._pid===s,this._pid=s,this.connected=!0,this.emitBuffered(),this._drainQueue(!0),this.emitReserved("connect")}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(e=>e()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:l.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){const s=this._anyListeners;for(let n=0;n<s.length;n++)if(e===s[n])return s.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){const s=this._anyOutgoingListeners;for(let n=0;n<s.length;n++)if(e===s[n])return s.splice(n,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const s=this._anyOutgoingListeners.slice();for(const n of s)n.apply(this,e.data)}}}function S(t){t=t||{},this.ms=t.min||100,this.max=t.max||1e4,this.factor=t.factor||2,this.jitter=t.jitter>0&&t.jitter<=1?t.jitter:0,this.attempts=0}S.prototype.duration=function(){var t=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random(),s=Math.floor(e*this.jitter*t);t=(Math.floor(e*10)&1)==0?t-s:t+s}return Math.min(t,this.max)|0};S.prototype.reset=function(){this.attempts=0};S.prototype.setMin=function(t){this.ms=t};S.prototype.setMax=function(t){this.max=t};S.prototype.setJitter=function(t){this.jitter=t};class ne extends p{constructor(e,s){var n;super(),this.nsps={},this.subs=[],e&&typeof e=="object"&&(s=e,e=void 0),s=s||{},s.path=s.path||"/socket.io",this.opts=s,W(this,s),this.reconnection(s.reconnection!==!1),this.reconnectionAttempts(s.reconnectionAttempts||1/0),this.reconnectionDelay(s.reconnectionDelay||1e3),this.reconnectionDelayMax(s.reconnectionDelayMax||5e3),this.randomizationFactor((n=s.randomizationFactor)!==null&&n!==void 0?n:.5),this.backoff=new S({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(s.timeout==null?2e4:s.timeout),this._readyState="closed",this.uri=e;const r=s.parser||At;this.encoder=new r.Encoder,this.decoder=new r.Decoder,this._autoConnect=s.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var s;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(s=this.backoff)===null||s===void 0||s.setMin(e),this)}randomizationFactor(e){var s;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(s=this.backoff)===null||s===void 0||s.setJitter(e),this)}reconnectionDelayMax(e){var s;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(s=this.backoff)===null||s===void 0||s.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf("open"))return this;this.engine=new bt(this.uri,this.opts);const s=this.engine,n=this;this._readyState="opening",this.skipReconnect=!1;const r=v(s,"open",function(){n.onopen(),e&&e()}),i=c=>{this.cleanup(),this._readyState="closed",this.emitReserved("error",c),e?e(c):this.maybeReconnectOnOpen()},a=v(s,"error",i);if(this._timeout!==!1){const c=this._timeout,d=this.setTimeoutFn(()=>{r(),i(new Error("timeout")),s.close()},c);this.opts.autoUnref&&d.unref(),this.subs.push(()=>{this.clearTimeoutFn(d)})}return this.subs.push(r),this.subs.push(a),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState="open",this.emitReserved("open");const e=this.engine;this.subs.push(v(e,"ping",this.onping.bind(this)),v(e,"data",this.ondata.bind(this)),v(e,"error",this.onerror.bind(this)),v(e,"close",this.onclose.bind(this)),v(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(e){try{this.decoder.add(e)}catch(s){this.onclose("parse error",s)}}ondecoded(e){V(()=>{this.emitReserved("packet",e)},this.setTimeoutFn)}onerror(e){this.emitReserved("error",e)}socket(e,s){let n=this.nsps[e];return n?this._autoConnect&&!n.active&&n.connect():(n=new Ne(this,e,s),this.nsps[e]=n),n}_destroy(e){const s=Object.keys(this.nsps);for(const n of s)if(this.nsps[n].active)return;this._close()}_packet(e){const s=this.encoder.encode(e);for(let n=0;n<s.length;n++)this.engine.write(s[n],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose("forced close")}disconnect(){return this._close()}onclose(e,s){var n;this.cleanup(),(n=this.engine)===null||n===void 0||n.close(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",e,s),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const s=this.backoff.duration();this._reconnecting=!0;const n=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved("reconnect_attempt",e.backoff.attempts),!e.skipReconnect&&e.open(r=>{r?(e._reconnecting=!1,e.reconnect(),this.emitReserved("reconnect_error",r)):e.onreconnect()}))},s);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}}onreconnect(){const e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",e)}}const T={};function M(t,e){typeof t=="object"&&(e=t,t=void 0),e=e||{};const s=kt(t,e.path||"/socket.io"),n=s.source,r=s.id,i=s.path,a=T[r]&&i in T[r].nsps,c=e.forceNew||e["force new connection"]||e.multiplex===!1||a;let d;return c?d=new ne(n,e):(T[r]||(T[r]=new ne(n,e)),d=T[r]),s.query&&!e.query&&(e.query=s.queryKey),d.socket(s.path,e)}Object.assign(M,{Manager:ne,Socket:Ne,io:M,connect:M});const F=[{id:"scarlet",name:"Miss Scarlet",color:"#c63b3b",accent:"#ffcabf",startKey:"scarlet",artCell:{x:0,y:0},chessCell:{x:0,y:0}},{id:"mustard",name:"Colonel Mustard",color:"#d1a62b",accent:"#ffefb3",startKey:"mustard",artCell:{x:1,y:0},chessCell:{x:1,y:0}},{id:"white",name:"Mrs. White",color:"#ebebdf",accent:"#ffffff",startKey:"white",artCell:{x:2,y:1},chessCell:{x:2,y:1}},{id:"green",name:"Mr. Green",color:"#4f925c",accent:"#d5f3d9",startKey:"green",artCell:{x:1,y:1},chessCell:{x:1,y:1}},{id:"peacock",name:"Mrs. Peacock",color:"#396dbf",accent:"#cee3ff",startKey:"peacock",artCell:{x:2,y:0},chessCell:{x:2,y:0}},{id:"plum",name:"Professor Plum",color:"#7a4c8f",accent:"#efd8ff",startKey:"plum",artCell:{x:0,y:1},chessCell:{x:0,y:1}}],j=[{id:"candlestick",name:"Candlestick",artCell:{x:0,y:0}},{id:"dagger",name:"Dagger",artCell:{x:1,y:0}},{id:"lead-pipe",name:"Lead Pipe",artCell:{x:2,y:0}},{id:"revolver",name:"Revolver",artCell:{x:0,y:1}},{id:"rope",name:"Rope",artCell:{x:1,y:1}},{id:"wrench",name:"Wrench",artCell:{x:2,y:1}}],de=[{id:"kitchen",name:"Kitchen",zone:{x1:0,y1:0,x2:6,y2:6},minW:5,maxW:6,minH:5,maxH:6,row:0,col:0,artCell:{x:2,y:2},flavor:"Stone Hearth"},{id:"ballroom",name:"Ballroom",zone:{x1:8,y1:0,x2:16,y2:6},minW:6,maxW:8,minH:5,maxH:6,row:0,col:1,artCell:{x:1,y:2},flavor:"Gilded Floor"},{id:"conservatory",name:"Conservatory",zone:{x1:18,y1:0,x2:24,y2:6},minW:5,maxW:6,minH:5,maxH:6,row:0,col:2,artCell:{x:0,y:2},flavor:"Iron Glass"},{id:"dining-room",name:"Dining Room",zone:{x1:0,y1:8,x2:6,y2:16},minW:5,maxW:6,minH:6,maxH:8,row:1,col:0,artCell:{x:1,y:1},flavor:"Walnut Banquet"},{id:"billiard-room",name:"Billiard Room",zone:{x1:8,y1:8,x2:16,y2:12},minW:5,maxW:7,minH:4,maxH:5,row:1,col:1,artCell:{x:2,y:1},flavor:"Ash Felt"},{id:"library",name:"Library",zone:{x1:18,y1:8,x2:24,y2:16},minW:5,maxW:6,minH:6,maxH:8,row:1,col:2,artCell:{x:0,y:1},flavor:"Mahogany Stacks"},{id:"lounge",name:"Lounge",zone:{x1:0,y1:18,x2:6,y2:24},minW:5,maxW:6,minH:5,maxH:6,row:2,col:0,artCell:{x:2,y:0},flavor:"Velvet Firelight"},{id:"hall",name:"Hall",zone:{x1:8,y1:18,x2:16,y2:24},minW:6,maxW:8,minH:5,maxH:6,row:2,col:1,artCell:{x:1,y:0},flavor:"Stone Stair"},{id:"study",name:"Study",zone:{x1:18,y1:18,x2:24,y2:24},minW:5,maxW:6,minH:5,maxH:6,row:2,col:2,artCell:{x:0,y:0},flavor:"Oak Conspiracy"}];function ve(t){return t.kind==="room"?`room:${t.roomId}`:`tile:${t.x},${t.y}`}const Bt=window.location.hostname==="localhost"?"http://localhost:3001":void 0,B=M(Bt,{autoConnect:!0}),ue="clue-mansion-session",J=is(),o={playerId:J.playerId,roomCode:new URLSearchParams(window.location.search).get("room")?.toUpperCase()??"",server:null,createName:"Host",joinName:"",joinCode:new URLSearchParams(window.location.search).get("room")?.toUpperCase()??"",seed:"",notice:"Create a room or join one with a room code.",busy:!1,revealHand:!0,suggestOpen:!1,accuseOpen:!1,clientError:"",notebookState:H(J.roomCode,J.playerId),panelOpen:{investigators:!0,notes:!0},showDice:!1,isRolling:!1},f=document.querySelector("#app");window.addEventListener("message",as);B.on("state:update",t=>{const e=o.roomCode,s=o.playerId,n=o.server?.match?.seed;o.server=t,o.roomCode=t.roomCode,o.joinCode=t.roomCode,!o.playerId&&t.self?.id&&(o.playerId=t.self.id),t.self?.id&&(t.roomCode!==e||t.self.id!==s||t.match?.seed!==n)&&(o.notebookState=H(t.roomCode,t.self.id,t.match?.seed)),o.notice=t.match?.statusMessage||o.notice,re(),history.replaceState(null,"",t.roomCode?`?room=${t.roomCode}`:window.location.pathname),u()});B.on("connect",async()=>{o.playerId&&o.roomCode&&await U()});B.on("connect_error",()=>{o.notice="Unable to reach the game server. Start `npm run dev` and refresh.",u()});u();function u(){const t=!o.server;f.innerHTML=`
    <div class="game-shell">
      <div class="background-fog"></div>
      ${t?`
      <header class="hero-banner">
        <div class="hero-copy">
          <p class="eyebrow">Realtime Multiplayer Mystery</p>
          <h1>Clue Mansion</h1>
          <p class="lead">
            Each browser is now a private player seat. Hidden hands stay hidden, disprovals are chosen by the actual holder, and the server owns the rules.
          </p>
        </div>
        <div class="hero-collage">
          <div class="hero-suspects"></div>
          <div class="hero-weapons"></div>
        </div>
      </header>
      `:""}

      ${o.server?Lt():Nt()}
    </div>

    ${Ut()}
    ${Ht()}
  `,Vt()}function Nt(){return`
    <main class="main-layout">
      <section class="stage-card">
        <div class="entry-grid">
          <section class="entry-card">
            <p class="eyebrow">Create Room</p>
            <h2>Host a Match</h2>
            <label class="control">
              <span>Your name</span>
              <input id="create-name" value="${E(o.createName)}" maxlength="24" />
            </label>
            <label class="control">
              <span>Board seed</span>
              <input id="seed-input" value="${E(o.seed)}" placeholder="Random if blank" />
            </label>
            <button id="create-room" class="action-button action-button--primary" ${o.busy?"disabled":""}>Create Room</button>
          </section>

          <section class="entry-card">
            <p class="eyebrow">Join Room</p>
            <h2>Enter a Live Session</h2>
            <label class="control">
              <span>Your name</span>
              <input id="join-name" value="${E(o.joinName)}" maxlength="24" />
            </label>
            <label class="control">
              <span>Room code</span>
              <input id="join-code" value="${E(o.joinCode)}" maxlength="8" />
            </label>
            <button id="join-room" class="action-button" ${o.busy?"disabled":""}>Join Room</button>
          </section>
        </div>
        <p class="notice">${o.notice}</p>
      </section>
    </main>
  `}function Lt(){return o.server.match?be():o.server.roomStatus==="lobby"?Pt():be()}function Pt(){const t=o.server.hostId===o.playerId;return`
    <main class="main-layout">
      <section class="stage-card">
        <div class="lobby-head">
          <div>
            <p class="eyebrow">Lobby</p>
            <h2>Room ${o.server.roomCode}</h2>
            <p class="lead slim">${o.notice}</p>
          </div>
          <div class="room-pill">Share code: <strong>${o.server.roomCode}</strong></div>
        </div>
        <div class="lobby-grid">
          <section class="side-card">
            <h3>Players</h3>
            <div class="players-panel">
              ${o.server.lobby.players.map(e=>`
                <article class="investigator ${e.id===o.playerId?"investigator--active":""}">
                  <div class="investigator-token" style="${A(g(e.suspectId))}"></div>
                  <div>
                    <strong>${e.name}</strong>
                    <small>${g(e.suspectId).name}</small>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
          <section class="side-card">
            <h3>Ready to Begin</h3>
            <p class="lead slim">Minimum 2 players, maximum 6 players. Suspects are assigned in join order for now.</p>
            ${t?`<button id="start-room" class="action-button action-button--primary" ${o.server.lobby.canStart?"":"disabled"}>Start Match</button>`:'<p class="notice">Waiting for the host to start the game.</p>'}
          </section>
        </div>
      </section>
    </main>
  `}function be(){const{self:t,match:e,pendingDisproof:s}=o.server,n=e.players[e.turnIndex],r=t&&Pe()?e.board.rooms[he().roomId]:null,i=e.currentPlayerId===t?.id;(e.diceFaces?.[0]??0)+(e.diceFaces?.[1]??0);const a=e.rollValue!==null;return`
    <main class="main-layout">
      ${e.winnerId?Jt(e):""}
      <div class="top-hud">
        <div class="turn-banner turn-banner--full">
          <div class="turn-banner-left">
            <p class="eyebrow">Current Turn</p>
            <h2>${e.winnerId?Yt():`${n.name} as ${g(n.suspectId).name}`}</h2>
          </div>
          <div class="turn-banner-right">
            <p class="status-text">${o.notice}</p>
            <div class="active-prompt">
              <span class="prompt-chip">${e.winnerId?o.notice:s?.isForSelf?"Choose one card to reveal.":s?`Waiting on ${s.playerName} to choose a disproval card.`:i?"Your browser is the active seat.":`Waiting for ${n.name}.`}</span>
            </div>
            <div class="turn-meta">
              <span>Room <strong>${o.server.roomCode}</strong></span>
              <span>Location <strong>${X(t?.position,e.board)}</strong></span>
              ${a?`<span>Moves left <strong>${e.movementRemaining}</strong></span>`:""}
            </div>
          </div>
        </div>
      </div>

      <div class="play-layout">
        <section class="board-panel">
          <div class="board-scroll-container">
            <div class="board-frame">
              <div class="board-grid" id="board">${qt()}</div>
            </div>
          </div>
          <div class="board-legend">
            <span><i class="swatch swatch--hallway"></i>Hallway</span>
            <span><i class="swatch swatch--door"></i>Door</span>
            <span><i class="swatch swatch--reach"></i>Reachable</span>
            <span><i class="swatch swatch--tunnel"></i>Tunnel Room</span>
            <span><i class="swatch swatch--pawn"></i>Chess Pawn</span>
          </div>
        </section>

        <aside class="side-panel">
          <section class="side-card collapsible-card">
            <button class="collapsible-header" data-toggle-panel="investigators">
              <h3>Investigators</h3>
              <span class="collapse-icon">${o.panelOpen.investigators?"▾":"▸"}</span>
            </button>
            <div class="collapsible-body ${o.panelOpen.investigators?"":"collapsed"}">
              <div class="players-panel">
              ${e.players.map(c=>`
                  <article class="investigator ${c.isCurrentTurn?"investigator--active":""} ${c.eliminated?"investigator--eliminated":""}">
                    <div class="investigator-token" style="${A(g(c.suspectId))}"></div>
                    <div>
                      <strong>${c.name}</strong>
                      <small>${g(c.suspectId).name}</small>
                      <small>${X(c?.position,e.board)}</small>
                    </div>
                  </article>
                `).join("")}
              </div>
            </div>
          </section>
          ${Mt(e,t)}
        </aside>
      </div>

      <section class="side-card desk-card">
        <div class="desk-header">
          <div>
            <p class="eyebrow">Your Desk</p>
            <h3>${t?.name??"Connecting..."} as ${t?g(t.suspectId).name:"Unknown"}</h3>
          </div>
          <div class="room-pill">${t?.eliminated?"Eliminated":i?"Your turn":"Waiting"}</div>
        </div>

        <div class="player-desk player-desk--active ${t?.eliminated?"player-desk--eliminated":""}">
          <div class="desk-top">
            <div class="desk-id">
              <div class="desk-piece" style="${t?A(g(t.suspectId)):""}"></div>
              <div>
                <strong>${t?.name??"Connecting..."}</strong>
                <small>${X(t?.position,e.board)}</small>
                ${t?.note?`<small class="private-note">${t.note}</small>`:""}
              </div>
            </div>
          </div>

          <div class="desk-actions">
            <button data-action="roll" class="action-button action-button--primary" ${Ft()?"":"disabled"}>🎲 Throw Dice</button>
            <button data-action="suggest" class="action-button" ${jt(r)?"":"disabled"}>💡 Suggest</button>
            <button data-action="accuse" class="action-button" ${I()?"":"disabled"}>⚡ Accuse</button>
            <button data-action="tunnel" class="action-button" ${zt(r)?"":"disabled"}>🚪 Tunnel</button>
            <button data-action="end-turn" class="action-button action-button--end" ${Kt()?"":"disabled"}>End Turn</button>
          </div>

          ${o.isRolling?`
            <div class="desk-dice-result">
              <div class="die die--desk die--rolling">${ke(5)}</div>
              <div class="dice-result-text">
                <strong>Rolling...</strong>
              </div>
            </div>
          `:o.showDice&&a?`
            <div class="desk-dice-result">
              <div class="die die--desk">${ke(e.rollValue)}</div>
              <div class="dice-result-text">
                <strong>Rolled ${e.rollValue}</strong>
                <small>${e.movementRemaining} moves remaining</small>
                <span style="display: block; color: var(--gold); font-size: 0.85rem; margin-top: 4px; line-height: 1.3;">Please go to the map to decide where you are heading.</span>
              </div>
            </div>
          `:""}

          <div class="desk-note-row">
            <button data-action="toggle-hand" class="text-button">${o.revealHand?"Hide Hand":"Reveal Hand"}</button>
            ${e.lastReveal?`<span class="private-note">Private reveal: ${e.lastReveal.disproverName} showed ${e.lastReveal.card.name}</span>`:""}
          </div>

          ${o.revealHand?Le(t?.hand??[]):'<div class="hand-hidden">Your private hand is hidden on this device.</div>'}

          ${s?.isForSelf?Dt(s.options):""}
        </div>
      </section>
    </main>
  `}function qt(){const t=o.server.match,e=t.reachable||[],s=Object.values(t.board.rooms).map(r=>{const i=e.find(c=>c.kind==="room"&&c.roomId===r.id),a=t.players.filter(c=>c.position?.type==="room"&&c.position.roomId===r.id);return`
      <button
        class="room-block ${i?"room-block--reachable":""} ${o.server.self?.position?.type==="room"&&o.server.self.position.roomId===r.id?"room-block--current":""} ${r.tunnelTo?"room-block--tunnel":""}"
        style="grid-column:${r.x+1} / span ${r.w}; grid-row:${r.y+1} / span ${r.h}; ${Xt(r)}"
        ${i?`data-node-key="${ve(i)}"`:""}
      >
        <div class="room-overlay"></div>
        <div class="room-content">
          <span class="room-name">${r.name}</span>
          <span class="room-flavor">${r.flavor}</span>
          ${r.tunnelTo?`<span class="room-badge room-badge--tunnel" style="${Zt()}">Tunnel to ${t.board.rooms[r.tunnelTo].name}</span>`:""}
          ${t.roomWeapons?.[r.id]?`<span class="room-badge room-badge--weapon">${De(t.roomWeapons[r.id]).name}</span>`:""}
        </div>
        <div class="room-pawns">${a.map(c=>we(g(c.suspectId),c.name)).join("")}</div>
      </button>
    `}).join(""),n=[];for(let r=0;r<t.board.size;r+=1)for(let i=0;i<t.board.size;i+=1){const a=t.board.tiles[r][i];if(a.type==="room")continue;const c=e.find(h=>h.kind==="tile"&&h.x===i&&h.y===r),d=t.players.filter(h=>h.position?.type==="tile"&&h.position.x===i&&h.position.y===r);n.push(`
        <button
          class="tile tile--${a.type} ${c?"tile--reachable":""}"
          style="grid-column:${i+1}; grid-row:${r+1}; ${Qt(a)}"
          ${c?`data-node-key="${ve(c)}"`:""}
        >
          ${d.length?`<div class="pawn-stack">${d.map(h=>we(g(h.suspectId),h.name)).join("")}</div>`:""}
        </button>
      `)}return s+n.join("")}function Le(t){return`
    <div class="hand-grid">
      ${t.slice().sort((e,s)=>e.type.localeCompare(s.type)||e.name.localeCompare(s.name)).map(e=>`
          <article class="case-card">
            <div class="case-card-art" style="${qe(e)}"></div>
            <div class="case-card-body">
              <strong>${e.name}</strong>
              <small>${ns(e.type)}</small>
            </div>
          </article>
        `).join("")}
    </div>
  `}function Dt(t){return`
    <section class="disproof-panel">
      <p class="eyebrow">Disprove Theory</p>
      <strong>Choose exactly one matching card to show.</strong>
      <div class="hand-grid hand-grid--choices">
        ${t.map(e=>`
            <button class="case-card case-card--choice" data-action="disprove" data-card-id="${e.id}">
              <div class="case-card-art" style="${qe(e)}"></div>
              <div class="case-card-body">
                <strong>${e.name}</strong>
                <small>Reveal this card</small>
              </div>
            </button>
          `).join("")}
      </div>
    </section>
  `}function Mt(t,e){const s=t.lastReveal?.card??null;return`
    <section class="side-card notebook-panel">
      <div class="notebook-head">
        <div>
          <h3>Detective Notes</h3>
          <p class="lead slim">Private notebook for this browser seat.</p>
        </div>
        <div class="room-pill">Notebook</div>
      </div>
      <div class="reveal-banner">
        <strong>Latest clue</strong>
        <span>${s?`${t.lastReveal.disproverName??"Someone"} showed you ${t.lastReveal.card.name}.`:e?.note||"Mark suspects, weapons, and rooms as the case unfolds."}</span>
      </div>
      ${s?`
        <div class="reveal-card">
          ${Le([s])}
        </div>
      `:""}
      <iframe
        class="notebook-frame"
        title="Detective score sheet"
        sandbox="allow-scripts"
        srcdoc="${E(ts(es(t,e)))}"
      ></iframe>
    </section>
  `}function Ut(){return!o.suggestOpen||!o.server?.match?"":`
    <dialog open>
      <form method="dialog" class="modal">
        <p class="eyebrow">Suggestion</p>
        <h3>Press the Room Theory</h3>
        <p class="modal-copy">Current room: ${Pe()?o.server.match.board.rooms[he().roomId].name:""}</p>
        <label class="control">
          <span>Suspect</span>
          <select id="suggest-suspect">${F.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Weapon</span>
          <select id="suggest-weapon">${j.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}</select>
        </label>
        <menu class="modal-actions">
          <button data-action="close-suggest" class="action-button">Cancel</button>
          <button data-action="confirm-suggest" class="action-button action-button--primary">Confirm</button>
        </menu>
      </form>
    </dialog>
  `}function Ht(){return!o.accuseOpen||!o.server?.match?"":`
    <dialog open>
      <form method="dialog" class="modal">
        <p class="eyebrow">Accusation</p>
        <h3>Commit to the Answer</h3>
        <label class="control">
          <span>Suspect</span>
          <select id="accuse-suspect">${F.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Weapon</span>
          <select id="accuse-weapon">${j.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select>
        </label>
        <label class="control">
          <span>Room</span>
          <select id="accuse-room">${de.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select>
        </label>
        <menu class="modal-actions">
          <button data-action="close-accuse" class="action-button">Cancel</button>
          <button data-action="confirm-accuse" class="action-button action-button--primary">Accuse</button>
        </menu>
      </form>
    </dialog>
  `}function Vt(){document.getElementById("create-name")?.addEventListener("input",t=>{o.createName=t.target.value}),document.getElementById("join-name")?.addEventListener("input",t=>{o.joinName=t.target.value}),document.getElementById("join-code")?.addEventListener("input",t=>{o.joinCode=String(t.target.value).replace(/[^A-Z0-9]/gi,"").toUpperCase().slice(0,8),t.target.value=o.joinCode}),document.getElementById("seed-input")?.addEventListener("input",t=>{o.seed=t.target.value}),document.getElementById("create-room")?.addEventListener("click",async()=>{o.busy=!0,u();const t=await b("room:create",{name:o.createName.trim()||"Host",seed:o.seed});o.busy=!1,t?.ok?(o.playerId=t.playerId,o.roomCode=t.roomCode,o.notebookState=H(t.roomCode,t.playerId),o.notice=`Room ${t.roomCode} created.`,re(),await U()):o.notice=t?.error||"Unable to create room.",u()}),document.getElementById("join-room")?.addEventListener("click",async()=>{o.busy=!0,u();const t=await b("room:join",{roomCode:o.joinCode,name:o.joinName.trim()||"Guest"});o.busy=!1,t?.ok?(o.playerId=t.playerId,o.roomCode=t.roomCode,o.notebookState=H(t.roomCode,t.playerId),o.notice=`Joined room ${t.roomCode}.`,re(),await U()):o.notice=t?.error||"Unable to join room.",u()}),document.getElementById("start-room")?.addEventListener("click",async()=>{try{o.clientError="",o.notice="Starting match...",u(),Wt("room:start",{roomCode:o.server.roomCode,playerId:o.playerId,seed:o.seed});let t=!1;for(let e=0;e<15;e+=1)if(await rs(200),await U(),o.server?.match){t=!0,o.notice=o.server.match.statusMessage||"Match started.";break}t||(o.notice="The room did not transition to an active match. Please try again."),u()}catch(t){o.clientError=t instanceof Error?t.message:String(t),o.notice="Start Match failed in the browser client.",u()}}),document.getElementById("board")?.addEventListener("click",async t=>{const e=t.target.closest("[data-node-key]");!e||!I()||await b("action:move",{roomCode:o.server.roomCode,playerId:o.playerId,destinationKey:e.dataset.nodeKey})}),f.querySelectorAll("[data-action='toggle-hand']").forEach(t=>{t.addEventListener("click",()=>{o.revealHand=!o.revealHand,u()})}),f.querySelectorAll("[data-action='roll']").forEach(t=>{t.addEventListener("click",async()=>{o.isRolling=!0,u();const e=await b("action:roll",{roomCode:o.server.roomCode,playerId:o.playerId});setTimeout(()=>{o.isRolling=!1,e?.ok?(o.showDice=!0,u(),setTimeout(()=>{o.showDice=!1,u()},4e3)):u()},800)})}),f.querySelectorAll("[data-action='suggest']").forEach(t=>{t.addEventListener("click",()=>{o.suggestOpen=!0,u()})}),f.querySelectorAll("[data-action='accuse']").forEach(t=>{t.addEventListener("click",()=>{o.accuseOpen=!0,u()})}),f.querySelectorAll("[data-action='tunnel']").forEach(t=>{t.addEventListener("click",()=>b("action:tunnel",{roomCode:o.server.roomCode,playerId:o.playerId}))}),f.querySelectorAll("[data-action='end-turn']").forEach(t=>{t.addEventListener("click",()=>{o.showDice=!1,b("action:endTurn",{roomCode:o.server.roomCode,playerId:o.playerId})})}),f.querySelectorAll("[data-action='disprove']").forEach(t=>{t.addEventListener("click",()=>b("action:disprove",{roomCode:o.server.roomCode,playerId:o.playerId,cardId:t.dataset.cardId}))}),f.querySelectorAll("[data-toggle-panel]").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.togglePanel;o.panelOpen[e]=!o.panelOpen[e],u()})}),f.querySelectorAll("[data-action='close-suggest']").forEach(t=>{t.addEventListener("click",()=>{o.suggestOpen=!1,u()})}),f.querySelectorAll("[data-action='close-accuse']").forEach(t=>{t.addEventListener("click",()=>{o.accuseOpen=!1,u()})}),f.querySelectorAll("[data-action='confirm-suggest']").forEach(t=>{t.addEventListener("click",async()=>{const e=document.getElementById("suggest-suspect").value,s=document.getElementById("suggest-weapon").value;o.suggestOpen=!1,u(),await b("action:suggest",{roomCode:o.server.roomCode,playerId:o.playerId,suspectId:e,weaponId:s})})}),f.querySelectorAll("[data-action='confirm-accuse']").forEach(t=>{t.addEventListener("click",async()=>{const e=document.getElementById("accuse-suspect").value,s=document.getElementById("accuse-weapon").value,n=document.getElementById("accuse-room").value;o.accuseOpen=!1,u(),await b("action:accuse",{roomCode:o.server.roomCode,playerId:o.playerId,suspectId:e,weaponId:s,roomId:n})})})}function b(t,e){return new Promise(s=>{B.timeout(4e3).emit(t,e,(n,r)=>{if(n){s({ok:!1,error:`Timed out waiting for ${t}.`});return}r?.error&&(o.notice=r.error,u()),s(r)})})}function Wt(t,e){B.emit(t,e)}async function U(){if(!o.playerId||!o.roomCode)return;const t=await b("room:sync",{roomCode:o.roomCode,playerId:o.playerId});t?.ok&&t.state?(o.server=t.state,o.notice=t.state.match?.statusMessage||o.notice,u()):t?.error&&(o.notice=`Sync failed: ${t.error}`,u())}function I(){return!!(o.server?.match&&o.server.match.currentPlayerId===o.playerId&&!o.server.self.eliminated&&!o.server.pendingDisproof&&!o.server.match.winnerId)}function Ft(){return I()&&o.server.match.rollValue===null}function jt(t){return I()&&!!t&&!o.server.match.hasSuggestedThisTurn}function zt(t){return I()&&!!t?.tunnelTo&&o.server.match.rollValue===null&&!o.server.match.hasMovedThisTurn}function Kt(){return I()&&o.server.match.rollValue!==null}function he(){return o.server?.self?.position??null}function Pe(){return he()?.type==="room"}function Yt(){if(o.server.match.winnerId==="nobody")return"No Detective Solved It";const t=o.server.match.players.find(e=>e.id===o.server.match.winnerId);return t?`${t.name} Wins the Victory!`:"Game Over"}function Jt(t){if(!t.winnerId)return"";const e=t.winnerId==="nobody",s=t.players.find(i=>i.id===t.winnerId),n=s?.name??"Unknown",r=s?g(s.suspectId).name:"";return`
    <div class="victory-overlay">
      <div class="victory-card">
        <div class="victory-glow"></div>
        <p class="eyebrow victory-eyebrow">${e?"Case Unsolved":"Case Closed"}</p>
        <h2 class="victory-title">${e?"No Detective Solved It":`${n} Wins the Victory!`}</h2>
        ${!e&&r?`<p class="victory-subtitle">Playing as ${r}</p>`:""}
        <p class="victory-status">${o.notice}</p>
        ${e?"":`
          <div class="victory-piece" style="${A(g(s.suspectId))}"></div>
        `}
      </div>
    </div>
  `}function ke(t){const e={1:["c"],2:["tl","br"],3:["tl","c","br"],4:["tl","tr","bl","br"],5:["tl","tr","c","bl","br"],6:["tl","tr","ml","mr","bl","br"]}[t];return`
    <span class="pip-grid">
      ${["tl","tr","ml","c","mr","bl","br"].map(s=>`<span class="pip ${e.includes(s)?"pip--on":""} pip--${s}"></span>`).join("")}
    </span>
  `}function X(t,e){if(!t||!e)return"Waiting for position...";if(t.type==="room")return e.rooms[t.roomId].name;const s=e.tiles[t.y][t.x];return s.type==="start"?"Start tile":s.type==="door"?`Doorway to ${e.rooms[s.roomId].name}`:`Hallway ${t.x}, ${t.y}`}function Xt(t){return C("/assets/rooms.jpg",t.artCell,3,3)}function Qt(t){return t.type==="door"?Gt():""}function Gt(){return`${C("/assets/doors-and-tunnels.jpg",{x:1,y:0},2,1)} background-repeat:no-repeat; background-color:#e9dcc6; background-size:200% 100%; border:1px solid rgba(84, 49, 20, 0.3);`}function Zt(){return`${C("/assets/doors-and-tunnels.jpg",{x:0,y:0},2,1)} background-repeat:no-repeat; background-size:200% 100%; background-color:rgba(18, 26, 38, 0.82); padding-left:30px;`}function qe(t){return t.type==="room"?C("/assets/rooms.jpg",ss(t.id).artCell,3,3):t.type==="weapon"?C("/assets/weapons.jpg",De(t.id).artCell,3,2):C("/assets/role.jpg",g(t.id).artCell,3,2)}function es(t,e){const s={roomCode:o.roomCode,playerId:o.playerId,seed:t.seed,lastReveal:t.lastReveal?.card?.name??"",players:t.players.map(r=>({id:r.id,name:r.name,suspectId:r.suspectId})),sections:[{id:"suspects",title:"Suspects",items:F.map(r=>({id:r.id,label:r.name}))},{id:"weapons",title:"Weapons",items:j.map(r=>({id:r.id,label:r.name}))},{id:"rooms",title:"Rooms",items:de.map(r=>({id:r.id,label:r.name}))}],notebookState:o.notebookState??O(),selfName:e?.name??"Detective"},n=JSON.stringify(s).replaceAll("<","\\u003c");return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root {
        color-scheme: light;
        --paper: #f4e8b3;
        --paper-edge: #d8c47b;
        --line: #9ec2e6;
        --line-strong: #d46a6a;
        --ink: #1a1f2b;
        --muted: #5e6b7e;
        --accent: #8a2f20;
        --accent-soft: rgba(138, 47, 32, 0.1);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: 'Special Elite', monospace;
        color: var(--ink);
        background: var(--paper);
        background-image: repeating-linear-gradient(transparent, transparent 31px, var(--line) 31px, var(--line) 32px);
        background-attachment: local;
      }

      .frame {
        min-height: 100vh;
        padding: 14px;
      }

      .toolbar {
        border: 1px dashed var(--paper-edge);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        font-family: 'Inter', sans-serif;
      }

      .sheet-wrap {
        border-left: 2px solid var(--line-strong);
        padding-left: 14px;
        background: transparent;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        padding: 10px;
        margin-bottom: 12px;
      }

      .tool-group {
        display: inline-flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      button {
        border: 1px solid #cbbb9f;
        border-radius: 999px;
        background: white;
        color: var(--ink);
        font: inherit;
        cursor: pointer;
        padding: 8px 12px;
      }

      button.active {
        background: linear-gradient(180deg, #923223, #702216);
        color: white;
        border-color: #923223;
      }

      .toolbar-note {
        margin-left: auto;
        font-size: 0.82rem;
        color: var(--muted);
      }

      .sheet-wrap {
        overflow: hidden;
        padding: 12px;
      }

      .sheet-stage {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--paper-edge);
        background: var(--paper);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      th,
      td {
        border: 1px solid var(--line);
      }

      thead th {
        background: #ddd3c0;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 8px 6px;
      }

      .label-col {
        width: 40%;
      }

      .player-col {
        width: calc(60% / ${Math.max(t.players.length,1)});
      }

      .section-row th {
        background: #cbc0ac;
        color: var(--ink);
        font-size: 1rem;
        padding: 10px 8px;
      }

      tbody th {
        text-align: left;
        font-size: 0.9rem;
        padding: 9px 10px;
        background: rgba(255, 255, 255, 0.46);
      }

      td {
        position: relative;
        height: 40px;
        text-align: center;
        vertical-align: middle;
        background: rgba(255, 255, 255, 0.54);
      }

      td[data-cell-key] {
        cursor: crosshair;
      }

      .cell-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        pointer-events: none;
        vertical-align: middle;
        margin: 0 1px;
      }

      .cell-mark--check {
        color: rgba(30, 106, 66, 0.85);
        font-size: 1.1rem;
      }

      .cell-mark--cross {
        color: rgba(138, 47, 32, 0.85);
        font-size: 1.1rem;
      }

      .cell-mark--text {
        font-size: 0.8rem;
        color: #050a14;
        background: rgba(255, 255, 255, 0.55);
        border-radius: 3px;
        padding: 0 3px;
      }

      .cell-inline-input {
        position: absolute;
        inset: 2px;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        border: 2px solid var(--accent);
        border-radius: 8px;
        background: #fffdf6;
        color: var(--ink);
        font: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        padding: 0 4px;
        outline: none;
        z-index: 5;
        box-shadow: 0 0 0 3px rgba(138, 47, 32, 0.15), 0 2px 8px rgba(0,0,0,0.12);
      }

      td.cell-editing {
        background: rgba(138, 47, 32, 0.06);
      }

      canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }

      canvas.is-drawing {
        pointer-events: auto;
      }

      @media (max-width: 720px) {
        .frame { padding: 10px; }
        th, td { font-size: 0.72rem; }
        td { height: 34px; }
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="toolbar">
        <div class="tool-group">
          <button type="button" data-tool="pen">Write</button>
          <button type="button" data-tool="erase">Rubber</button>
          <button type="button" data-tool="type">Type</button>
          <button type="button" data-tool="check">Check</button>
          <button type="button" data-tool="cross">Cross</button>
          <button type="button" data-tool="clear-marks">Clear ✓/✕</button>
          <button type="button" data-tool="clear">Clear Cell</button>
        </div>
        <div class="tool-group">
          <button type="button" data-action="clear-ink">Clear Ink</button>
        </div>
        <span class="toolbar-note">Private sheet for ${Q(e?.name??"Detective")}${t.lastReveal?.card?` • ${Q(t.lastReveal.disproverName??"Someone")} showed: ${Q(t.lastReveal.card.name)}`:""}</span>
      </div>
      <div style="font-size: 0.82rem; margin-bottom: 8px; color: var(--muted); text-align: center;">
        Select a tool to mark the grid. Marks can be stacked. Click again to toggle off. Use 'Clear Cell' to remove all marks from a cell. Use 'Rubber' to erase pen strokes.
      </div>
      <div class="sheet-wrap">
        <div class="sheet-stage" id="sheet-stage">
          <table id="sheet-table"></table>
          <canvas id="sheet-canvas"></canvas>
        </div>
      </div>
    </div>

    <script>
      const payload = ${n};
      const table = document.getElementById("sheet-table");
      const canvas = document.getElementById("sheet-canvas");
      const stage = document.getElementById("sheet-stage");
      const ctx = canvas.getContext("2d");
      const state = {
        tool: payload.notebookState?.tool || "check",
        cells: payload.notebookState?.cells || {},
        strokes: payload.notebookState?.strokes || [],
      };
      let activeStroke = null;

      function escapeText(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll("\\"", "&quot;");
      }

      function renderTable() {
        const headers = payload.players.map((player) => \`<th class="player-col">\${escapeText(player.name)}</th>\`).join("");
        const sections = payload.sections.map((section) => {
          const rows = section.items.map((item) => {
            const cells = payload.players.map((player) => {
              const key = cellKey(section.id, item.id, player.id);
              const entry = state.cells[key];
              return \`<td data-cell-key="\${key}">\${renderCell(entry)}</td>\`;
            }).join("");
            return \`<tr><th>\${escapeText(item.label)}</th>\${cells}</tr>\`;
          }).join("");
          return \`<tbody><tr class="section-row"><th colspan="\${payload.players.length + 1}">\${escapeText(section.title)}</th></tr>\${rows}</tbody>\`;
        }).join("");

        table.innerHTML = \`
          <thead>
            <tr>
              <th class="label-col">Evidence</th>
              \${headers}
            </tr>
          </thead>
          \${sections}
        \`;
      }

      function renderCell(entry) {
        if (!entry) return "";
        let html = "";
        if (entry.text) html += \`<span class="cell-mark cell-mark--text">\${escapeText(entry.text)}</span>\`;
        if (entry.check) html += '<span class="cell-mark cell-mark--check">&#10003;</span>';
        if (entry.cross) html += '<span class="cell-mark cell-mark--cross">&#10005;</span>';
        return html;
      }

      function cellKey(sectionId, itemId, playerId) {
        return [sectionId, itemId, playerId].join("::");
      }

      function setTool(tool) {
        state.tool = tool;
        document.querySelectorAll("[data-tool]").forEach((button) => {
          button.classList.toggle("active", button.dataset.tool === tool);
        });
        canvas.classList.toggle("is-drawing", tool === "pen" || tool === "erase");
        postUpdate();
      }

      function postUpdate() {
        parent.postMessage({
          type: "clue-notebook:update",
          roomCode: payload.roomCode,
          playerId: payload.playerId,
          seed: payload.seed,
          notebookState: {
            tool: state.tool,
            cells: state.cells,
            strokes: state.strokes,
          },
        }, "*");
      }

      function resizeCanvas() {
        const rect = stage.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(rect.width * ratio);
        canvas.height = Math.floor(rect.height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        redrawStrokes();
      }

      function redrawStrokes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const stroke of state.strokes) {
          drawStroke(stroke);
        }
        if (activeStroke) {
          drawStroke(activeStroke);
        }
      }

      function drawStroke(stroke) {
        if (!stroke.points || stroke.points.length < 2) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (stroke.mode === "erase") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = 16;
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "#4d3324";
          ctx.lineWidth = 2.4;
        }
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let index = 1; index < stroke.points.length; index += 1) {
          ctx.lineTo(stroke.points[index].x, stroke.points[index].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      function pointerPoint(event) {
        const rect = stage.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }

      let activeInlineInput = null;

      function beginInlineEdit(key) {
        if (activeInlineInput) {
          commitInlineEdit();
        }
        const cell = document.querySelector(\`td[data-cell-key="\${key}"]\`);
        const existing = state.cells[key]?.text || "";
        cell.classList.add("cell-editing");
        cell.innerHTML = "";
        const input = document.createElement("input");
        input.type = "text";
        input.className = "cell-inline-input";
        input.value = existing;
        input.maxLength = 10;
        input.placeholder = "...";
        cell.appendChild(input);
        activeInlineInput = { input, key };

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitInlineEdit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelInlineEdit();
          }
        });
        input.addEventListener("blur", () => {
          setTimeout(() => {
            if (activeInlineInput && activeInlineInput.input === input) {
              commitInlineEdit();
            }
          }, 80);
        });

        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }

      function commitInlineEdit() {
        if (!activeInlineInput) return;
        const { input, key } = activeInlineInput;
        activeInlineInput = null;
        const cleaned = input.value.trim().slice(0, 10);
        const cellState = state.cells[key] || {};
        const existing = cellState.text || "";
        
        if (cleaned !== existing) {
          if (cleaned) {
            state.cells[key] = { ...cellState, text: cleaned };
          } else {
            if (state.cells[key]) {
              delete state.cells[key].text;
              if (Object.keys(state.cells[key]).length === 0) delete state.cells[key];
            }
          }
        }
        
        const cell = document.querySelector(\`td[data-cell-key="\${key}"]\`);
        if (cell) cell.classList.remove("cell-editing");
        renderTable();
        postUpdate();
      }

      function cancelInlineEdit() {
        if (!activeInlineInput) return;
        const { key } = activeInlineInput;
        activeInlineInput = null;
        const cell = document.querySelector(\`td[data-cell-key="\${key}"]\`);
        if (cell) cell.classList.remove("cell-editing");
        renderTable();
      }

      stage.addEventListener("click", (event) => {
        if (event.target.closest(".cell-inline-input")) {
          return;
        }
        const cell = event.target.closest("td[data-cell-key]");
        if (!cell || state.tool === "pen" || state.tool === "erase") {
          return;
        }
        const key = cell.dataset.cellKey;
        if (state.tool === "type") {
          beginInlineEdit(key);
          return;
        }
        
        const currentVal = state.cells[key] || {};
        let modified = false;

        if (state.tool === "clear") {
          delete state.cells[key];
          modified = true;
        } else if (state.tool === "clear-marks") {
          if (currentVal.check || currentVal.cross) {
            delete currentVal.check;
            delete currentVal.cross;
            if (currentVal.text) {
              state.cells[key] = currentVal;
            } else {
              delete state.cells[key];
            }
            modified = true;
          }
        } else if (state.tool === "check") {
          state.cells[key] = { ...currentVal, check: !currentVal.check };
          modified = true;
        } else if (state.tool === "cross") {
          state.cells[key] = { ...currentVal, cross: !currentVal.cross };
          modified = true;
        }
        
        // Clean up empty objects
        if (state.cells[key] && !state.cells[key].check && !state.cells[key].cross && !state.cells[key].text) {
          delete state.cells[key];
        }

        if (modified) {
          renderTable();
          postUpdate();
        }
      });

      canvas.addEventListener("pointerdown", (event) => {
        if (state.tool !== "pen" && state.tool !== "erase") {
          return;
        }
        activeStroke = {
          mode: state.tool,
          points: [pointerPoint(event)],
        };
        canvas.setPointerCapture(event.pointerId);
        redrawStrokes();
      });

      canvas.addEventListener("pointermove", (event) => {
        if (!activeStroke) {
          return;
        }
        activeStroke.points.push(pointerPoint(event));
        redrawStrokes();
      });

      function finishStroke() {
        if (activeStroke && activeStroke.points.length > 1) {
          state.strokes.push(activeStroke);
          postUpdate();
        }
        activeStroke = null;
        redrawStrokes();
      }

      canvas.addEventListener("pointerup", finishStroke);
      canvas.addEventListener("pointercancel", finishStroke);

      document.querySelectorAll("[data-tool]").forEach((button) => {
        button.addEventListener("click", () => setTool(button.dataset.tool));
      });

      document.querySelector("[data-action='clear-ink']").addEventListener("click", () => {
        state.strokes = [];
        redrawStrokes();
        postUpdate();
      });

      renderTable();
      setTool(state.tool);
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
    <\/script>
  </body>
</html>`}function ts(t){return t.replace(/\.replaceAll\([^)]*&quot;[^)]*\);/,`.replaceAll('"', "&quot;");`).replace(/return '<span class="cell-mark cell-mark--check">[^']*';/,`return '<span class="cell-mark cell-mark--check">&#10003;</span>';`).replace(/return '<span class="cell-mark cell-mark--cross">[^']*';/,`return '<span class="cell-mark cell-mark--cross">&#10005;</span>';`).replace(/\s+[^\x00-\x7F]+\?shown:/," | shown:")}function A(t){return`background-image: none; background-color: ${t.color}; border: 2px solid rgba(255, 255, 255, 0.6);`}function we(t,e){return`<span class="pawn-piece" title="${E(e)}" style="${A(t)}"></span>`}function C(t,e,s,n){const r=s===1?0:e.x/(s-1)*100,i=n===1?0:e.y/(n-1)*100;return`background-image:url('${t}'); background-size:${s*100}% ${n*100}%; background-position:${r}% ${i}%;`}function g(t){return F.find(e=>e.id===t)}function De(t){return j.find(e=>e.id===t)}function ss(t){return de.find(e=>e.id===t)}function ns(t){return t.charAt(0).toUpperCase()+t.slice(1)}function E(t){return String(t??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function rs(t){return new Promise(e=>window.setTimeout(e,t))}function O(){return{tool:"check",cells:{},strokes:[]}}function Me(t=o.roomCode,e=o.playerId,s=o.server?.match?.seed){return`${ue}-notebook-${t||"room"}-${e||"player"}-${s||"lobby"}`}function os(){try{window.sessionStorage.setItem(Me(),JSON.stringify(o.notebookState??O()))}catch{}}function re(){try{window.sessionStorage.setItem(ue,JSON.stringify({roomCode:o.roomCode,playerId:o.playerId}))}catch{}}function is(){try{const t=window.sessionStorage.getItem(ue);return t?JSON.parse(t):{roomCode:"",playerId:null}}catch{return{roomCode:"",playerId:null}}}function H(t,e,s){try{const n=window.sessionStorage.getItem(Me(t,e,s));return n?JSON.parse(n):O()}catch{return O()}}function as(t){t.data?.type==="clue-notebook:update"&&(t.data.roomCode!==o.roomCode||t.data.playerId!==o.playerId||(o.notebookState=t.data.notebookState??O(),os()))}function Q(t){return String(t??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
