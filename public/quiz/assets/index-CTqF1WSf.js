var Hg=Object.defineProperty;var Bu=r=>{throw TypeError(r)};var Wg=(r,e,t)=>e in r?Hg(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var L=(r,e,t)=>Wg(r,typeof e!="symbol"?e+"":e,t),Nc=(r,e,t)=>e.has(r)||Bu("Cannot "+t);var Je=(r,e,t)=>(Nc(r,e,"read from private field"),t?t.call(r):e.get(r)),At=(r,e,t)=>e.has(r)?Bu("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),Tt=(r,e,t,n)=>(Nc(r,e,"write to private field"),n?n.call(r,t):e.set(r,t),t),Xr=(r,e,t)=>(Nc(r,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();ArrayBuffer.isView||(ArrayBuffer.isView=r=>r!==null&&typeof r=="object"&&r.buffer instanceof ArrayBuffer);typeof globalThis=="undefined"&&typeof window!="undefined"&&(window.globalThis=window);typeof FormData=="undefined"&&(globalThis.FormData=class{});var Nt={JOIN_ROOM:10,ERROR:11,LEAVE_ROOM:12,ROOM_DATA:13,ROOM_STATE:14,ROOM_STATE_PATCH:15,ROOM_DATA_BYTES:17,PING:18,ROOM_INPUT_RELIABLE:19,ROOM_INPUT_UNRELIABLE:20,ROOM_REQUEST:21,ROOM_RESPONSE:22},Ll={TIMED:128,UNRELIABLE:64},Xg=31,ku={OK:0,ERROR:2},zu={INPUT_REFLECTION:1,INPUT_OPTIONS:2},Js={RENDER_TIME:1,FIXED_TIMESTEP:2,PATCH_RATE:4,SUB_STEPS:8,RECKON_TIME:16},hi={GOING_AWAY:1001,NO_STATUS_RECEIVED:1005,ABNORMAL_CLOSURE:1006,CONSENTED:4e3,FAILED_TO_RECONNECT:4003,MAY_TRY_RECONNECT:4010};class uo extends Error{constructor(t,n,i){super(n);L(this,"code");L(this,"headers");L(this,"status");L(this,"response");L(this,"data");this.name="ServerError",this.code=t,i&&(this.headers=i.headers,this.status=i.status,this.response=i.response,this.data=i.data)}}class Hf extends Error{constructor(t,n){super(t);L(this,"code");this.code=n,this.name="MatchMakeError",Object.setPrototypeOf(this,Hf.prototype)}}const br=255,Rp=213;var me;(function(r){r[r.ADD=128]="ADD",r[r.REPLACE=0]="REPLACE",r[r.DELETE=64]="DELETE",r[r.DELETE_AND_MOVE=96]="DELETE_AND_MOVE",r[r.MOVE_AND_ADD=160]="MOVE_AND_ADD",r[r.DELETE_AND_ADD=192]="DELETE_AND_ADD",r[r.CLEAR=10]="CLEAR",r[r.REVERSE=15]="REVERSE",r[r.MOVE=32]="MOVE",r[r.DELETE_BY_REFID=33]="DELETE_BY_REFID",r[r.ADD_BY_REFID=129]="ADD_BY_REFID"})(me||(me={}));var qd;(qd=Symbol.metadata)!=null||(Symbol.metadata=Symbol.for("Symbol.metadata"));function Cp(r){Object.defineProperty(r,Symbol.metadata,{value:void 0,writable:!0,configurable:!0,enumerable:!1})}const Gu=function(){return typeof globalThis!="undefined"?globalThis:typeof global!="undefined"?global:typeof self!="undefined"?self:typeof window!="undefined"?window:{}}();if(typeof Symbol=="function"&&typeof Symbol.for!="function"){const r="colyseus.symbolRegistry",e=Gu[r]||(Gu[r]=Object.create(null));Symbol.for=function(t){return e[t]||(e[t]=Symbol(t))},Symbol.keyFor=function(t){for(const n in e)if(e[n]===t)return n}}const Ke=Symbol.for("$refId"),_i="~track",vi="~encoder",ni="~decoder",Br="~filter",Pt="~getByIndex",si="~deleteByIndex",Is="~resyncPrune",Q=Symbol.for("$changes"),nt=Symbol.for("$childType"),Ft=Symbol.for("$proxyTarget"),Qi="~onEncodeEnd",ii="~reset",qa="~onDecodeEnd",Fn=Symbol.for("$values"),Dp="~builder",Pn="~descriptors",ho="~__encodeDescriptor",Ci="~encoders",nn="~__numFields",er="~__refTypeFieldIndexes",Kn="~__viewFieldIndexes",Ei="$__fieldIndexesByViewTag",wr="~__unreliableFieldIndexes",vo="~__patchOnlyFieldIndexes",ja="~__fullSyncSkipIndexes",Ss="~__fullStateOnlyFieldIndexes",Un="~__streamFieldIndexes",ta="~__streamPriorities";let qg;try{qg=new TextEncoder}catch{}const ac=new ArrayBuffer(8),Dr=new Int32Array(ac),Fl=new Float32Array(ac),jg=new Float64Array(ac),Pp=new BigInt64Array(ac),$g=typeof Buffer!="undefined"&&Buffer.byteLength,Up=$g?Buffer.byteLength:function(r,e){for(var t=0,n=0,i=0,s=r.length;i<s;i++)t=r.charCodeAt(i),t<128?n+=1:t<2048?n+=2:t<55296||t>=57344?n+=3:(i++,n+=4);return n};function Ip(r,e,t){for(var n=0,i=0,s=e.length;i<s;i++)n=e.charCodeAt(i),n<128?r[t.offset++]=n:n<2048?(r[t.offset]=192|n>>6,r[t.offset+1]=128|n&63,t.offset+=2):n<55296||n>=57344?(r[t.offset]=224|n>>12,r[t.offset+1]=128|n>>6&63,r[t.offset+2]=128|n&63,t.offset+=3):(i++,n=65536+((n&1023)<<10|e.charCodeAt(i)&1023),r[t.offset]=240|n>>18,r[t.offset+1]=128|n>>12&63,r[t.offset+2]=128|n>>6&63,r[t.offset+3]=128|n&63,t.offset+=4)}function Lp(r,e,t){r[t.offset++]=e&255}function Yg(r,e,t){r[t.offset++]=e&255}function Fp(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255}function Wf(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255}function Ni(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255,r[t.offset++]=e>>16&255,r[t.offset++]=e>>24&255}function Pr(r,e,t){const n=e>>24,i=e>>16,s=e>>8,o=e;r[t.offset++]=o&255,r[t.offset++]=s&255,r[t.offset++]=i&255,r[t.offset++]=n&255}function Np(r,e,t){const n=Math.floor(e/Math.pow(2,32)),i=e>>>0;Pr(r,i,t),Pr(r,n,t)}function Op(r,e,t){const n=e/Math.pow(2,32)>>0,i=e>>>0;Pr(r,i,t),Pr(r,n,t)}function Kg(r,e,t){Pp[0]=BigInt.asIntN(64,e),Ni(r,Dr[0],t),Ni(r,Dr[1],t)}function Jg(r,e,t){Pp[0]=BigInt.asIntN(64,e),Ni(r,Dr[0],t),Ni(r,Dr[1],t)}function Bp(r,e,t){Fl[0]=e,Ni(r,Dr[0],t)}function kp(r,e,t){jg[0]=e,Ni(r,Dr[0],t),Ni(r,Dr[1],t)}function Zg(r,e,t){r[t.offset++]=e?1:0}function Qg(r,e,t){e||(e="");let n=Up(e,"utf8"),i=0;if(n<32)r[t.offset++]=n|160,i=1;else if(n<256)r[t.offset++]=217,r[t.offset++]=n,i=2;else if(n<65536)r[t.offset++]=218,Wf(r,n,t),i=3;else if(n<4294967296)r[t.offset++]=219,Pr(r,n,t),i=5;else throw new Error("String too long");return Ip(r,e,t),i+n}function Nl(r,e,t){if(isNaN(e))return Nl(r,0,t);if(isFinite(e)){if(e!==(e|0))return Math.abs(e)<=34028235e31&&(Fl[0]=e,Math.abs(Math.abs(Fl[0])-Math.abs(e))<1e-4)?(r[t.offset++]=202,Bp(r,e,t),5):(r[t.offset++]=203,kp(r,e,t),9)}else return Nl(r,e>0?Number.MAX_SAFE_INTEGER:-Number.MAX_SAFE_INTEGER,t);return e>=0?e<128?(r[t.offset++]=e&255,1):e<256?(r[t.offset++]=204,r[t.offset++]=e&255,2):e<65536?(r[t.offset++]=205,Wf(r,e,t),3):e<4294967296?(r[t.offset++]=206,Pr(r,e,t),5):(r[t.offset++]=207,Op(r,e,t),9):e>=-32?(r[t.offset++]=224|e+32,1):e>=-128?(r[t.offset++]=208,Lp(r,e,t),2):e>=-32768?(r[t.offset++]=209,Fp(r,e,t),3):e>=-2147483648?(r[t.offset++]=210,Ni(r,e,t),5):(r[t.offset++]=211,Np(r,e,t),9)}const st={int8:Lp,uint8:Yg,int16:Fp,uint16:Wf,int32:Ni,uint32:Pr,int64:Np,uint64:Op,bigint64:Kg,biguint64:Jg,float32:Bp,float64:kp,boolean:Zg,string:Qg,number:Nl,utf8Write:Ip,utf8Length:Up},Fo=new ArrayBuffer(8),Ur=new Int32Array(Fo),e0=new Float32Array(Fo),t0=new Float64Array(Fo),n0=new BigUint64Array(Fo),i0=new BigInt64Array(Fo);function zp(r,e,t){t>r.length-e.offset&&(t=r.length-e.offset);for(var n="",i=0,s=e.offset,o=e.offset+t;s<o;s++){var a=r[s];if(!(a&128)){n+=String.fromCharCode(a);continue}if((a&224)===192){n+=String.fromCharCode((a&31)<<6|r[++s]&63);continue}if((a&240)===224){n+=String.fromCharCode((a&15)<<12|(r[++s]&63)<<6|(r[++s]&63)<<0);continue}if((a&248)===240){i=(a&7)<<18|(r[++s]&63)<<12|(r[++s]&63)<<6|(r[++s]&63)<<0,i>=65536?(i-=65536,n+=String.fromCharCode((i>>>10)+55296,(i&1023)+56320)):n+=String.fromCharCode(i);continue}console.error("decode.utf8Read(): Invalid byte "+a+" at offset "+s+". Skip to end of string: "+(e.offset+t));break}return e.offset+=t,n}function Gp(r,e){return No(r,e)<<24>>24}function No(r,e){return r[e.offset++]}function Vp(r,e){return lc(r,e)<<16>>16}function lc(r,e){return r[e.offset++]|r[e.offset++]<<8}function oi(r,e){return r[e.offset++]|r[e.offset++]<<8|r[e.offset++]<<16|r[e.offset++]<<24}function Es(r,e){return oi(r,e)>>>0}function Hp(r,e){return Ur[0]=oi(r,e),e0[0]}function Wp(r,e){return Ur[0]=oi(r,e),Ur[1]=oi(r,e),t0[0]}function Xp(r,e){const t=Es(r,e);return oi(r,e)*Math.pow(2,32)+t}function qp(r,e){const t=Es(r,e);return Es(r,e)*Math.pow(2,32)+t}function r0(r,e){return Ur[0]=oi(r,e),Ur[1]=oi(r,e),i0[0]}function s0(r,e){return Ur[0]=oi(r,e),Ur[1]=oi(r,e),n0[0]}function o0(r,e){return No(r,e)>0}function a0(r,e){const t=r[e.offset++];let n;return t<192?n=t&31:t===217?n=No(r,e):t===218?n=lc(r,e):t===219&&(n=Es(r,e)),zp(r,e,n)}function c0(r,e){const t=r[e.offset++];if(t<128)return t;if(t===202)return Hp(r,e);if(t===203)return Wp(r,e);if(t===204)return No(r,e);if(t===205)return lc(r,e);if(t===206)return Es(r,e);if(t===207)return qp(r,e);if(t===208)return Gp(r,e);if(t===209)return Vp(r,e);if(t===210)return oi(r,e);if(t===211)return Xp(r,e);if(t>223)return(255-t+1)*-1}function l0(r,e){const t=r[e.offset];return t<192&&t>160||t===217||t===218||t===219}const ht={utf8Read:zp,int8:Gp,uint8:No,int16:Vp,uint16:lc,int32:oi,uint32:Es,float32:Hp,float64:Wp,int64:Xp,uint64:qp,bigint64:r0,biguint64:s0,boolean:o0,string:a0,number:c0,stringCheck:l0},Xf={},f0=new Map;function zi(r,e){e.constructor&&(Object.prototype.hasOwnProperty.call(e,"constructor")&&e.constructor[Symbol.metadata]==null&&Cp(e.constructor),f0.set(e.constructor,r),Xf[r]=e),e.encode&&(st[r]=e.encode),e.decode&&(ht[r]=e.decode)}function jp(r){return Xf[r]}const $p="ArraySchema does not support streaming — positional ops (splice / unshift / reverse) shift subsequent indexes, so holding ADDs back for a later tick under `maxPerTick` would desync the decoder. Use `t.stream(X)` (stable monotonic positions) or `t.map(X).stream()` (stable keys) instead.";function Oi(){return{pendingByView:new Map,sentByView:new Map,broadcastPending:new Set,sentBroadcast:new Set,broadcastDeletes:new Set,maxPerTick:32}}function qf(r){var e;return(e=r._stream)!=null?e:r._stream=Oi()}function fc(r,e,t){e.activeViews.size===0&&qf(r).broadcastPending.add(t)}function uc(r,e,t,n){const i=r._stream;if(i===void 0)return!0;let s=!1;return i.broadcastPending.delete(n)?s=!0:i.sentBroadcast.delete(n)&&i.broadcastDeletes.add(n),e.forEachActiveView(o=>{const a=i.pendingByView.get(o.id);if(a!=null&&a.has(n)){a.delete(n),s=!0;return}const c=i.sentByView.get(o.id);if(c!=null&&c.has(n)){c.delete(n);let l=o.changes.get(t);l===void 0&&(l=new Map,o.changes.set(t,l)),l.set(n,me.DELETE)}}),s}function u0(r,e,t){const n=r._stream;if(n!==void 0){n.broadcastPending.clear();for(const i of n.sentBroadcast)n.broadcastDeletes.add(i);n.sentBroadcast.clear(),e.forEachActiveView(i=>{var o;(o=n.pendingByView.get(i.id))==null||o.clear();const s=n.sentByView.get(i.id);if(s!==void 0&&s.size>0){let a=i.changes.get(t);a===void 0&&(a=new Map,i.changes.set(t,a));for(const c of s)a.set(c,me.DELETE);s.clear()}})}}function h0(r,e,t){const n=qf(r);let i=n.pendingByView.get(e);i===void 0&&(i=new Set,n.pendingByView.set(e,i)),i.add(t)}function hc(r,e){var n;const t=r._stream;t!==void 0&&(t.pendingByView.delete(e),t.sentByView.delete(e),(n=t.priorityByView)==null||n.delete(e))}const d0={8:"uint8",16:"uint16",32:"uint32"};function jf(r){var a,c;if(r==null||typeof r!="object")throw new Error("t.quantized(): options object with { min, max } is required.");const{min:e,max:t}=r;if(typeof e!="number"||typeof t!="number"||!(t>e)||!Number.isFinite(e)||!Number.isFinite(t))throw new Error(`t.quantized(): require finite min < max (got min=${e}, max=${t}).`);const n=(a=r.bits)!=null?a:16;if(n!==8&&n!==16&&n!==32)throw new Error(`t.quantized(): bits must be 8, 16 or 32 (got ${n}).`);const i=(c=r.mode)!=null?c:"clamp";if(i!=="clamp"&&i!=="wrap")throw new Error(`t.quantized(): mode must be "clamp" or "wrap" (got ${JSON.stringify(i)}).`);const s=i==="wrap",o=Math.pow(2,n);return{min:e,max:t,bits:n,wrap:s,wire:d0[n],range:t-e,span:s?o:e===-t?o-2:o-1}}function Ir(r){return r!==null&&typeof r=="object"&&r.quantized!==void 0}function Yp(r,e){if(r.wrap){if(!Number.isFinite(e))return 0;const n=r.range;let i=(e-r.min)%n;i<0&&(i+=n);const s=r.span;return Math.floor(i/n*s+.5)%s}if(e!==e)return 0;const t=e<r.min?r.min:e>r.max?r.max:e;return Math.floor((t-r.min)/r.range*r.span+.5)}function Kp(r,e){return r.min+e/r.span*r.range}function p0(r){const e=st[r.wire];return(t,n,i)=>e(t,Yp(r,n),i)}function m0(r,e,t){const n=ht[r.wire];return Kp(r,n(e,t))}const li=class li{constructor(e){L(this,"types",{});L(this,"schemas",new Map);L(this,"hasFilters",!1);e&&this.discoverTypes(e)}static register(e){const t=Object.getPrototypeOf(e);if(t!==Ot){let n=li.inheritedTypes.get(t);n||(n=new Set,li.inheritedTypes.set(t,n)),n.add(e)}}static cache(e){let t=li.cachedContexts.get(e);return t||(t=new li(e),li.cachedContexts.set(e,t)),t}has(e){return this.schemas.has(e)}get(e){return this.types[e]}add(e,t=this.schemas.size){return this.schemas.has(e)?!1:(this.types[t]=e,e[Symbol.metadata]==null&&mt.initialize(e),this.schemas.set(e,t),!0)}getTypeId(e){return this.schemas.get(e)}discoverTypes(e){var i;if(!this.add(e))return;(i=li.inheritedTypes.get(e))==null||i.forEach(s=>{this.discoverTypes(s)});let t=e;for(;(t=Object.getPrototypeOf(t))&&t!==Ot&&t!==Function.prototype;)this.discoverTypes(t);const n=e[Symbol.metadata];(n[Kn]||n[Un])&&(this.hasFilters=!0);for(const s in n){const a=n[s].type;if(typeof a!="string"&&!Ir(a))if(typeof a=="function")this.discoverTypes(a);else{const c=Object.values(a)[0];if(typeof c=="string")continue;this.discoverTypes(c)}}}debug(){return`TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}`}};L(li,"inheritedTypes",new Map),L(li,"cachedContexts",new Map);let Lr=li;const Vu=63;function g0(r){const e=typeof Object.keys(r)[0]=="string"&&jp(Object.keys(r)[0]);return{complexTypeKlass:e,childType:e?Object.values(r)[0]:r}}function Ms(r){if(Array.isArray(r))return{array:Ms(r[0])};if(Ir(r))return typeof r.quantized.wire=="string"?r:{quantized:jf(r.quantized)};if(typeof r.type!="undefined")return r.type;if(_0(r))return Object.keys(r).every(e=>typeof r[e]=="string")?"string":"number";if(typeof r=="object"&&r!==null){const e=Object.keys(r).find(t=>Xf[t]!==void 0);if(e)return r[e]=Ms(r[e]),r}return r}function _0(r){if(typeof r=="function"&&r[Symbol.metadata])return!1;const e=Object.keys(r),t=e.filter(n=>/\d+/.test(n));return!!(t.length>0&&t.length===e.length/2&&r[r[t[0]]]==t[0]||e.length>0&&e.every(n=>typeof r[n]=="string"&&r[n]===n))}const v0=[er,wr,vo,ja,Ss,Un,Ci];function na(r,e,t){r[e]||Object.defineProperty(r,e,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[e].push(t)}const mt={addField(r,e,t,n,i){if(e>=Vu)throw new Error(`Can't define field '${t}'.
Schema instances may only have up to ${Vu} fields.`);r[e]=Object.assign(r[e]||{},{type:Ms(n),index:e,name:t}),Object.defineProperty(r,Pn,{value:r[Pn]||{},enumerable:!1,configurable:!0}),i?r[Pn][t]=i:r[Pn][t]={value:void 0,writable:!0,enumerable:!0,configurable:!0},Object.defineProperty(r,nn,{value:e,enumerable:!1,configurable:!0}),Object.defineProperty(r,t,{value:e,enumerable:!1,configurable:!0}),typeof r[e].type!="string"&&!Ir(r[e].type)&&(r[er]===void 0&&Object.defineProperty(r,er,{value:[],enumerable:!1,configurable:!0}),r[er].push(e));const s=r[e].type;if(s&&typeof s=="object"&&s.stream!==void 0){if(s.array!==void 0)throw new Error($p);r[e].stream=!0,r[Un]||Object.defineProperty(r,Un,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[Un].includes(e)||r[Un].push(e);const o=n==null?void 0:n.priority;typeof o=="function"&&mt.setStreamPriority(r,t,o)}},setTag(r,e,t){const n=r[e],i=r[n];if(i.tag=t,r[Kn]||(Object.defineProperty(r,Kn,{value:[],enumerable:!1,configurable:!0}),Object.defineProperty(r,Ei,{value:{},enumerable:!1,configurable:!0})),r[Kn].push(n),t<0)r[Ei][t]||(r[Ei][t]=[]),r[Ei][t].push(n);else for(let s=t;s>0;s&=s-1){const o=s&-s;r[Ei][o]||(r[Ei][o]=[]),r[Ei][o].push(n)}},setUnreliable(r,e){const t=r[e];if(typeof r[t].type!="string")throw new Error(`@unreliable cannot be applied to ref-type field "${e}". For ref-type fields, mark each primitive sub-field with @unreliable instead. See README "Limitations and best practices".`);r[t].unreliable=!0,r[wr]||Object.defineProperty(r,wr,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[wr].push(t)},setPatchOnly(r,e){const t=r[e];if(r[t].fullStateOnly)throw new Error(`field "${e}" cannot be both patchOnly and fullStateOnly — those are the only two delivery channels, so the field would never reach a client.`);r[t].patchOnly=!0,na(r,vo,t),na(r,ja,t)},setDeprecated(r,e){const t=r[e];r[t].deprecated=!0,na(r,ja,t),Object.defineProperty(r,t,{value:r[t],enumerable:!1,configurable:!0})},setFullStateOnly(r,e){const t=r[e];if(r[t].patchOnly)throw new Error(`field "${e}" cannot be both patchOnly and fullStateOnly — those are the only two delivery channels, so the field would never reach a client.`);r[t].fullStateOnly=!0,na(r,Ss,t)},setStream(r,e){const t=r[e];r[t].stream=!0,r[Un]||Object.defineProperty(r,Un,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[Un].push(t)},setStreamPriority(r,e,t){const n=r[e];r[ta]||Object.defineProperty(r,ta,{value:{},enumerable:!1,configurable:!0,writable:!0}),r[ta][n]=t},getStreamPriority(r,e){var t;return(t=r==null?void 0:r[ta])==null?void 0:t[e]},defineField(r,e,t,n,i){const s=Ms(i),{complexTypeKlass:o,childType:a}=g0(s);mt.addField(e,t,n,s,m_(n,t,a,o)),e[Pn][n]&&Object.defineProperty(r.prototype,n,e[Pn][n]),(typeof s=="string"||Ir(s))&&(e[Ci]||Object.defineProperty(e,Ci,{value:[],enumerable:!1,configurable:!0,writable:!0}),e[Ci][t]=typeof s=="string"?st[s]:p0(s.quantized))},setFields(r,e){var a,c;const t=r.prototype.constructor;Lr.register(t);const n=Object.getPrototypeOf(t),i=n&&n[Symbol.metadata],s=mt.initialize(t);t[_i]||(t[_i]=Ot[_i]),t[vi]||(t[vi]=Ot[vi]),t[ni]||(t[ni]=Ot[ni]),t.prototype.toJSON||(t.prototype.toJSON=Ot.prototype.toJSON);let o=(c=(a=s[nn])!=null?a:i&&i[nn])!=null?c:-1;o++,s[Ci]||Object.defineProperty(s,Ci,{value:i!=null&&i[Ci]?[...i[Ci]]:[],enumerable:!1,configurable:!0,writable:!0});for(const l in e){if(s[l]!==void 0)throw new Error(`@colyseus/schema: Duplicate '${l}' definition on '${t.name||"(anonymous)"}'.`);mt.defineField(t,s,o,l,e[l]),o++}return r},isDeprecated(r,e){return r[e].deprecated===!0},initialize(r){var i;const e=Object.getPrototypeOf(r),t=e[Symbol.metadata];let n=(i=r[Symbol.metadata])!=null?i:Object.create(null);if(e!==Ot&&n===t&&(n=Object.create(null),t)){Object.setPrototypeOf(n,t),Object.defineProperty(n,nn,{value:t[nn],enumerable:!1,configurable:!0,writable:!0}),t[Kn]!==void 0&&(Object.defineProperty(n,Kn,{value:[...t[Kn]],enumerable:!1,configurable:!0,writable:!0}),Object.defineProperty(n,Ei,{value:{...t[Ei]},enumerable:!1,configurable:!0,writable:!0}));for(const s of v0){const o=t[s];o!==void 0&&Object.defineProperty(n,s,{value:[...o],enumerable:!1,configurable:!0,writable:!0})}Object.defineProperty(n,Pn,{value:{...t[Pn]},enumerable:!1,configurable:!0,writable:!0})}return Object.defineProperty(r,Symbol.metadata,{value:n,writable:!1,configurable:!0}),n},isValidInstance(r){return r.constructor[Symbol.metadata]&&Object.prototype.hasOwnProperty.call(r.constructor[Symbol.metadata],nn)},getFields(r){const e=r[Symbol.metadata],t={};for(let n=0;n<=e[nn];n++)t[e[n].name]=e[n].type;return t},hasViewTagAtIndex(r,e){var t;return(t=r==null?void 0:r[Kn])==null?void 0:t.includes(e)},hasUnreliableAtIndex(r,e){var t;return(t=r==null?void 0:r[wr])==null?void 0:t.includes(e)},hasPatchOnlyAtIndex(r,e){var t;return(t=r==null?void 0:r[vo])==null?void 0:t.includes(e)},hasFullStateOnlyAtIndex(r,e){var t;return(t=r==null?void 0:r[Ss])==null?void 0:t.includes(e)},hasStreamAtIndex(r,e){var t;return(t=r==null?void 0:r[Un])==null?void 0:t.includes(e)}},Jp=(r,e,t)=>r(e,t);class x0{constructor(e){L(this,"dirtyLow",0);L(this,"dirtyHigh",0);L(this,"ops");this.ops=new Uint8Array(Math.max(e+1,1))}record(e,t){const n=this.ops[e];n===0?this.ops[e]=t:n===me.DELETE?this.ops[e]=me.DELETE_AND_ADD:n===me.ADD&&t===me.DELETE_AND_ADD&&(this.ops[e]=me.DELETE_AND_ADD),e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}recordDelete(e,t){this.ops[e]=t,e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}recordRaw(e,t){this.record(e,t)}operationAt(e){const t=this.ops[e];return t===0?void 0:t}setOperationAt(e,t){this.ops[e]=t}forEach(e){this.forEachWithCtx(e,Jp)}forEachWithCtx(e,t){let n=this.dirtyLow,i=this.dirtyHigh;const s=this.ops;for(;n!==0;){const o=n&-n,a=31-Math.clz32(o);n^=o,t(e,a,s[a])}for(;i!==0;){const o=i&-i,a=31-Math.clz32(o)+32;i^=o,t(e,a,s[a])}}size(){return $a(this.dirtyLow)+$a(this.dirtyHigh)}has(){return(this.dirtyLow|this.dirtyHigh)!==0}reset(){this.dirtyLow=0,this.dirtyHigh=0,this.ops.fill(0)}}class y0{constructor(){L(this,"dirty",new Map);L(this,"pureOps",[])}record(e,t){const n=this.dirty.get(e);n===void 0?this.dirty.set(e,t):n===me.DELETE?this.dirty.set(e,me.DELETE_AND_ADD):n===me.ADD&&t===me.DELETE_AND_ADD&&this.dirty.set(e,me.DELETE_AND_ADD)}recordDelete(e,t){this.dirty.set(e,t)}recordRaw(e,t){this.dirty.set(e,t)}recordPure(e){this.pureOps.push([this.dirty.size,e])}operationAt(e){return this.dirty.get(e)}setOperationAt(e,t){this.dirty.has(e)&&this.dirty.set(e,t)}forEach(e){this.forEachWithCtx(e,Jp)}forEachWithCtx(e,t){const n=this.pureOps;if(n.length>0){let i=0,s=0;for(const[o,a]of this.dirty){for(;i<n.length&&n[i][0]<=s;){const c=n[i++][1];t(e,-c,c)}t(e,o,a),s++}for(;i<n.length;){const o=n[i++][1];t(e,-o,o)}}else for(const[i,s]of this.dirty)t(e,i,s)}size(){return this.dirty.size+this.pureOps.length}has(){return this.dirty.size>0||this.pureOps.length>0}reset(){this.dirty.clear(),this.pureOps.length=0}shift(e){const t=new Map;for(const[n,i]of this.dirty)t.set(n+e,i);this.dirty=t}}function $a(r){return r=r-(r>>>1&1431655765),r=(r&858993459)+(r>>>2&858993459),(r+(r>>>4)&252645135)*16843009>>>24}function ia(r){if(r===void 0)return 0;let e=0;for(let t=0,n=r.length;t<n;t++){const i=r[t];i<32&&(e|=1<<i)}return e}function S0(r){const e=[],t=[],n=[],i=[],s=r==null?void 0:r[nn];if(s===void 0)return{names:e,types:t,tags:n,encoders:i};const o=r[Ci];for(let a=0;a<=s;a++){const c=r[a];if(c===void 0){e[a]=void 0,t[a]=void 0,n[a]=void 0,i[a]=void 0;continue}e[a]=c.name,t[a]=c.type,n[a]=c.tag,i[a]=o==null?void 0:o[a]}return{names:e,types:t,tags:n,encoders:i}}function Zp(r){var c,l,f,u,h,d,g,_;const e=r.constructor;if(Object.prototype.hasOwnProperty.call(e,ho))return e[ho];const t=e[Symbol.metadata],n=mt.isValidInstance(r),i=((l=(c=t==null?void 0:t[Kn])==null?void 0:c.length)!=null?l:0)>0,s=S0(t),o=n&&!i?void 0:e[Br],a={encoder:e[vi],filter:o,metadata:t,isSchema:n,filterBitmask:n?ia(t==null?void 0:t[Kn]):0,hasAnyFullStateOnly:((u=(f=t==null?void 0:t[Ss])==null?void 0:f.length)!=null?u:0)>0,hasAnyUnreliable:((d=(h=t==null?void 0:t[wr])==null?void 0:h.length)!=null?d:0)>0,hasAnyStream:((_=(g=t==null?void 0:t[Un])==null?void 0:g.length)!=null?_:0)>0,hasAnyView:i,fullStateOnlyBitmask:ia(t==null?void 0:t[Ss]),unreliableBitmask:ia(t==null?void 0:t[wr]),streamBitmask:ia(t==null?void 0:t[Un]),names:s.names,types:s.types,tags:s.tags,encoders:s.encoders};return Object.defineProperty(e,ho,{value:a,enumerable:!1,writable:!0,configurable:!0}),a}function E0(r,e,t){if(r.parentRef){if(r.parentRef[Q]===e[Q]){r._parentIndex=t;return}if(Qp(r,(n,i)=>n[Q]===e[Q])){r._parentIndex=t;return}}r.parentRef===void 0?(r.parentRef=e,r._parentIndex=t):(r.extraParents={ref:r.parentRef,index:r._parentIndex,next:r.extraParents},r.parentRef=e,r._parentIndex=t)}function M0(r,e,t){if(r.extraParents===void 0){r._parentIndex=t;return}if(r.parentRef[Q]===e[Q]){r._parentIndex=t;return}for(let n=r.extraParents;n!==void 0;n=n.next)if(n.ref[Q]===e[Q]){n.index=t;return}}function b0(r,e){if(r.parentRef&&r.parentRef[Q]===e[Q])return r.extraParents?(r.parentRef=r.extraParents.ref,r._parentIndex=r.extraParents.index,r.extraParents=r.extraParents.next):(r.parentRef=void 0,r._parentIndex=void 0),!0;let t=r.extraParents,n=null;for(;t;){if(t.ref[Q]===e[Q])return n?n.next=t.next:r.extraParents=t.next,!0;n=t,t=t.next}return r.parentRef===void 0}function w0(r,e){if(r.parentRef!==void 0&&e(r.parentRef,r._parentIndex))return{ref:r.parentRef,index:r._parentIndex};for(let t=r.extraParents;t!==void 0;t=t.next)if(e(t.ref,t.index))return{ref:t.ref,index:t.index}}function Qp(r,e){if(r.parentRef!==void 0&&e(r.parentRef,r._parentIndex))return!0;for(let t=r.extraParents;t!==void 0;t=t.next)if(e(t.ref,t.index))return!0;return!1}function T0(r,e){if(r.parentRef&&r.parentRef[Q]===e[Q])return r._parentIndex;for(let t=r.extraParents;t!==void 0;t=t.next)if(t.ref[Q]===e[Q])return t.index}function A0(r){const e=[];r.parentRef&&e.push({ref:r.parentRef,index:r._parentIndex});let t=r.extraParents;for(;t;)e.push({ref:t.ref,index:t.index}),t=t.next;return e}function R0(r,e,t){const n=e.refTarget;if(e.isArray){const s=n.items,o=s[t];if(o!==void 0&&o[Q]===r)return!0;for(let a=0,c=s.length;a<c;a++){const l=s[a];if(l!==void 0&&l[Q]===r)return!0}return!1}const i=e.getValue(t);return i!==void 0&&i[Q]===r}const em=(r,e)=>{r.isFieldUnreliable(e)?r.ensureUnreliableRecorder().record(e,me.ADD):r.record(e,me.ADD)},C0=(r,e)=>r(e);function D0(r,e){$f(r,e,C0)}function $f(r,e,t){var i;const n=r.refTarget;if(n[nt]!==void 0){if(r.isPatchOnly)return;if(Array.isArray(n.items)){const s=n.items;for(let o=0,a=s.length;o<a;o++)s[o]!==void 0&&t(e,o)}else if(n.journal!==void 0)for(const[s,o]of n.journal.keyByIndex)n.$items.has(o)&&t(e,s);else if(n.$items!==void 0)for(const s of n.$items.keys())t(e,s)}else{const s=r.metadata;if(!s)return;const o=(i=s[nn])!=null?i:-1,a=s[ja],c=r.encDescriptor.names;for(let l=0;l<=o;l++){const f=c[l];if(f===void 0||a&&a.includes(l))continue;const u=n[f];u!=null&&t(e,l)}}}function tm(r,e,t,n){var i,s,o,a,c;P0(r,e,t),!r.isFullStateOnly&&(r.has()&&((i=r.root)==null||i.enqueueChangeTree(r)),(s=r.unreliableRecorder)!=null&&s.has()&&((o=r.root)==null||o.enqueueUnreliable(r)),!r.has()&&!((a=r.unreliableRecorder)!=null&&a.has())&&((c=r.root)==null||c.enqueueChangeTree(r)))}function P0(r,e,t){var g,_,m,p,y,b,v,C,R;if(!e)return;const n=e[Q],i=!n._isSchema;let s;i?(e=n.parent,t=n.parentIndex,s=e==null?void 0:e[Q].metadata):s=n.metadata;const o=((g=s==null?void 0:s[vo])!=null&&g.includes(t)?po:0)|((_=s==null?void 0:s[Ss])!=null&&_.includes(t)?hs:0),a=n.flags&H0|o,c=r.flags;r.flags=c|a,a&~c&hs&&(r.reset(),(m=r.unreliableRecorder)==null||m.reset());const f=(p=r.root)==null?void 0:p.types;if(!(f!=null&&f.hasFilters))return;const u=(b=(y=s==null?void 0:s[Kn])==null?void 0:y.includes(t))!=null?b:!1,h=(C=(v=s==null?void 0:s[Un])==null?void 0:v.includes(t))!=null?C:!1,d=n.isFiltered||u||h;if(r.isFiltered=d,h&&!i){r.isStreamCollection=!0;const w=qf(r.ref);if(w.priority===void 0){const A=mt.getStreamPriority(s,t);A!==void 0&&(w.priority=A)}(R=r.root)==null||R.registerStream(r.ref)}if(d){const w=nm(r);r.isVisibilitySharedWithParent=n.isFiltered&&w&&!h&&(!u||i&&s[t].tag!==gc)}}function Hu(r){const e=r.pendingFilterRefresh;for(let t=0;t<e.length;t++){const n=e[t];n.flags&xo&&Yf(n)}e.length=0}function nm(r){return r._isSchema||typeof r.refTarget[nt]!="string"}function Yf(r){var s;r.flags&=~xo;const e=r.root;if(e===void 0||r.parentRef===void 0)return;const t=nm(r);let n=Wu(r,r.parentRef,r._parentIndex,t);for(let o=r.extraParents;o!==void 0&&n!==U0;o=o.next)n|=Wu(r,o.ref,o.index,t);if(n===0)return;r.isVisibilitySharedWithParent=(n&Ka)!==0;const i=(n&Ya)===0;i!==r.isFiltered&&(r.isFiltered=i,!i&&!r.isFullStateOnly&&(r.forEachLiveWithCtx(r,em),r.has()&&e.enqueueChangeTree(r),(s=r.unreliableRecorder)!=null&&s.has()&&e.enqueueUnreliable(r)),r.forEachChildWithCtx(r,I0))}const im=1,Ya=2,Ka=4,U0=im|Ya|Ka;function Wu(r,e,t,n){var o;const i=e[Q];if(i.root!==r.root||!R0(r,i,t))return 0;i.flags&xo&&Yf(i);let s=im;if(i._isSchema)i.encDescriptor.tags[t]!==void 0||i.isFieldStream(t)||(i.isFiltered?n&&(s|=Ka):s|=Ya);else if(!i.isFiltered)s|=Ya;else if(n&&!i.isStreamCollection){const a=(o=i.parent)==null?void 0:o[Q];(a!=null&&a._isSchema?a.encDescriptor.tags[i.parentIndex]:void 0)!==gc&&(s|=Ka)}return s}const I0=(r,e,t)=>{Yf(e)};function L0(r,e,t,n){const i=r.subscribedViews;if(i===void 0)return;const s=r.isStreamCollection,o=s?r.ref:void 0,a=s?void 0:t[Q];for(let c=0,l=i.length;c<l;c++){let f=i[c];for(;f!==0;){const u=f&-f;f^=u;const h=c*32+(31-Math.clz32(u)),d=n.activeViews.get(h),g=d==null?void 0:d.deref();if(g===void 0){i[c]&=~u;continue}s?h0(o,h,e):a!==void 0&&g.markVisible(a)}}}function F0(r,e){r.root=e;const t=e.add(r);tm(r,r.parent,r.parentIndex),t&&Oo(r,e,k0)}function N0(r,e,t,n){if(r.addParent(e,n),!t)return;const i=t.add(r);t!==r.root&&(r.root=t,tm(r,e,n));const s=e==null?void 0:e[Q];if(s!==void 0&&s.subscribedViews!==void 0&&e[nt]!==void 0&&L0(s,n,r.ref,t),i){let o=Xu[ra];o===void 0&&(o={parentRef:void 0,root:void 0},Xu[ra]=o),o.parentRef=r.ref,o.root=t,ra++,Oo(r,o,z0),ra--}}function O0(r,e){Oo(r,e,B0)}function B0(r,e,t){r(e,t)}function Oo(r,e,t){var i;const n=r.refTarget;if(n[nt]){if(typeof n[nt]!="string"){const s=n.items;if(s!==void 0)for(let o=0,a=s.length;o<a;o++){const c=s[o];c&&t(e,c[Q],o)}else{const o=n.$items,a=n._collectionIndexes;for(const c of o.keys()){const l=o.get(c);l&&t(e,l[Q],(i=a==null?void 0:a[c])!=null?i:c)}}}}else{const s=r.metadata,o=s==null?void 0:s[er];if(!o)return;const a=r.encDescriptor.names;for(let c=0,l=o.length;c<l;c++){const f=o[c],u=n[a[f]];u&&t(e,u[Q],f)}}}function k0(r,e,t){e.root!==r?e.setRoot(r):r.add(e)}const Xu=[];let ra=0;function z0(r,e,t){if(e.root===r.root){r.root.add(e),r.root.moveNextToParent(e);return}e.setParent(r.parentRef,r.root,t)}function G0(r,e,t){const n=(t&3)<<3;return t<4?r>>>n&255:e>>>n&255}const V0=(r,e,t)=>r(e,t);function qu(){return{next:void 0,tail:void 0,nextPosition:0}}const Oc=1,Bc=2,Zs=4,kc=8,po=16,hs=32,zc=64,sa=128,xo=256,H0=po|hs;class Ls{constructor(e,t=e){L(this,"ref");L(this,"refTarget");L(this,"metadata");L(this,"encDescriptor");L(this,"root");L(this,"parentRef");L(this,"_parentIndex");L(this,"extraParents");L(this,"flags",Zs);L(this,"_fullSyncGen",0);L(this,"_isSchema",!1);L(this,"dirtyLow",0);L(this,"dirtyHigh",0);L(this,"opsLow",0);L(this,"opsHigh",0);L(this,"ops");L(this,"collDirty");L(this,"collPureOps");L(this,"unreliableRecorder");L(this,"paused",!1);L(this,"changesNode");L(this,"unreliableChangesNode");L(this,"visibleViews");L(this,"tagViews");L(this,"subscribedViews");var s,o;this.ref=e,this.refTarget=t;const n=Zp(e);this.encDescriptor=n,this.metadata=n.metadata;const i=n.isSchema;if(this._isSchema=i,this.ops=void 0,this.collDirty=void 0,this.collPureOps=void 0,i){const a=(o=(s=this.metadata)==null?void 0:s[nn])!=null?o:0;a>7&&(this.ops=new Uint8Array(a+1))}else this.collDirty=new Map}get isArray(){return this.refTarget!==this.ref}get isFiltered(){return(this.flags&Oc)!==0}set isFiltered(e){this.flags=e?this.flags|Oc:this.flags&~Oc}get isVisibilitySharedWithParent(){return(this.flags&Bc)!==0}set isVisibilitySharedWithParent(e){this.flags=e?this.flags|Bc:this.flags&~Bc}get isNew(){return(this.flags&Zs)!==0}set isNew(e){this.flags=e?this.flags|Zs:this.flags&~Zs}get isUnreliable(){return(this.flags&kc)!==0}set isUnreliable(e){this.flags=e?this.flags|kc:this.flags&~kc}get isPatchOnly(){return(this.flags&po)!==0}set isPatchOnly(e){this.flags=e?this.flags|po:this.flags&~po}get isFullStateOnly(){return(this.flags&hs)!==0}set isFullStateOnly(e){this.flags=e?this.flags|hs:this.flags&~hs}get isStreamCollection(){return(this.flags&zc)!==0}set isStreamCollection(e){this.flags=e?this.flags|zc:this.flags&~zc}get needsRestage(){return(this.flags&sa)!==0}set needsRestage(e){this.flags=e?this.flags|sa:this.flags&~sa}get hasFilteredFields(){return this.isFiltered||this.encDescriptor.hasAnyView}ensureUnreliableRecorder(){var e,t;return this.unreliableRecorder===void 0&&(this.unreliableRecorder=this._isSchema?new x0((t=(e=this.metadata)==null?void 0:e[nn])!=null?t:0):new y0),this.unreliableRecorder}isFieldUnreliable(e){const t=this.encDescriptor;return t.hasAnyUnreliable?e<32?(t.unreliableBitmask&1<<e)!==0:mt.hasUnreliableAtIndex(this.metadata,e):!1}isFieldFullStateOnly(e){if(this.isFullStateOnly)return!0;const t=this.encDescriptor;return t.hasAnyFullStateOnly?e<32?(t.fullStateOnlyBitmask&1<<e)!==0:mt.hasFullStateOnlyAtIndex(this.metadata,e):!1}isFieldStream(e){const t=this.encDescriptor;return t.hasAnyStream?e<32?(t.streamBitmask&1<<e)!==0:mt.hasStreamAtIndex(this.metadata,e):!1}_opAt(e){const t=this.ops;if(t!==void 0)return t[e];const n=(e&3)<<3;return e<4?this.opsLow>>>n&255:this.opsHigh>>>n&255}_opPut(e,t){const n=this.ops;if(n!==void 0){n[e]=t;return}const i=(e&3)<<3,s=~(255<<i);e<4?this.opsLow=this.opsLow&s|t<<i:this.opsHigh=this.opsHigh&s|t<<i}_markDirty(e){e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}record(e,t){if(this._isSchema){const n=this._opAt(e);n===0?this._opPut(e,t):n===me.DELETE?this._opPut(e,me.DELETE_AND_ADD):n===me.ADD&&t===me.DELETE_AND_ADD&&this._opPut(e,me.DELETE_AND_ADD),this._markDirty(e)}else{const n=this.collDirty,i=n.get(e);let s;i===void 0?s=t:i===me.DELETE||i===me.ADD&&t===me.DELETE_AND_ADD?s=me.DELETE_AND_ADD:s=i,n.set(e,s)}}recordDelete(e,t){this._isSchema?(this._opPut(e,t),this._markDirty(e)):this.collDirty.set(e,t)}recordRaw(e,t){this._isSchema?(this._opPut(e,t),this._markDirty(e)):this.collDirty.set(e,t)}recordPure(e){var t;if(this._isSchema)throw new Error("ChangeTree (Schema): pure operations are not supported");((t=this.collPureOps)!=null?t:this.collPureOps=[]).push([this.collDirty.size,e])}operationAt(e){if(this._isSchema){const t=this._opAt(e);return t===0?void 0:t}return this.collDirty.get(e)}setOperationAt(e,t){if(this._isSchema)this._opPut(e,t);else{const n=this.collDirty;n.has(e)&&n.set(e,t)}}forEach(e){this.forEachWithCtx(e,V0)}forEachWithCtx(e,t){if(this._isSchema){let s=this.dirtyLow,o=this.dirtyHigh;const a=this.ops;if(a!==void 0){for(;s!==0;){const c=s&-s,l=31-Math.clz32(c);s^=c,t(e,l,a[l])}for(;o!==0;){const c=o&-o,l=31-Math.clz32(c)+32;o^=c,t(e,l,a[l])}}else{const c=this.opsLow,l=this.opsHigh;for(;s!==0;){const f=s&-s,u=31-Math.clz32(f);s^=f,t(e,u,G0(c,l,u))}}return}const n=this.collDirty,i=this.collPureOps;if(i!==void 0&&i.length>0){let s=0,o=0;for(const[a,c]of n){for(;s<i.length&&i[s][0]<=o;){const l=i[s++][1];t(e,-l,l)}t(e,a,c),o++}for(;s<i.length;){const a=i[s++][1];t(e,-a,a)}}else for(const[s,o]of n)t(e,s,o)}size(){var e,t;return this._isSchema?$a(this.dirtyLow)+$a(this.dirtyHigh):this.collDirty.size+((t=(e=this.collPureOps)==null?void 0:e.length)!=null?t:0)}has(){return this._isSchema?(this.dirtyLow|this.dirtyHigh)!==0:this.collDirty.size>0||this.collPureOps!==void 0&&this.collPureOps.length>0}reset(){if(this._isSchema){this.dirtyLow=0,this.dirtyHigh=0,this.ops!==void 0?this.ops.fill(0):(this.opsLow=0,this.opsHigh=0);return}this.collDirty.clear(),this.collPureOps!==void 0&&(this.collPureOps.length=0)}recycle(){var e,t,n;if(this.root!==void 0)throw new Error(`@colyseus/schema: cannot recycle an attached ChangeTree (${(t=(e=this.ref)==null?void 0:e.constructor)==null?void 0:t.name}). Remove the instance from its parent collection before releasing it to a pool.`);this.reset(),(n=this.unreliableRecorder)==null||n.reset(),this.flags=Zs|sa,this._fullSyncGen=0,this.parentRef=void 0,this._parentIndex=void 0,this.extraParents=void 0,this.changesNode=void 0,this.unreliableChangesNode=void 0,this.paused=!1,this.visibleViews=void 0,this.tagViews=void 0,this.subscribedViews=void 0}insertAt(e,t){var o;if(this._isSchema)throw new Error("ChangeTree (Schema): insertAt is not supported");const n=this.collDirty,i=new Map,s=!this.paused&&!this.isFullStateOnly;if(e>0)for(const[a,c]of n)a<e&&i.set(a,c);if(s)for(let a=0;a<t;a++)i.set(e+a,me.ADD);for(const[a,c]of n)a>=e&&i.set(a+t,c);this.collDirty=i,s&&((o=this.root)==null||o.enqueueChangeTree(this))}unshift(e){this.insertAt(0,e)}setRoot(e){F0(this,e)}setParent(e,t,n){N0(this,e,t,n)}forEachChild(e){O0(this,e)}forEachChildWithCtx(e,t){Oo(this,e,t)}forEachLive(e){D0(this,e)}forEachLiveWithCtx(e,t){$f(this,e,t)}operation(e){var t;this.paused||this.isFullStateOnly||(this.recordPure(e),(t=this.root)==null||t.enqueueChangeTree(this))}_routeAndRecord(e,t,n){var i,s;if(!(this.paused||this.isFieldFullStateOnly(e))){if(this.isFieldUnreliable(e)&&!this.isNew){const o=this.ensureUnreliableRecorder();n?o.recordRaw(e,t):o.record(e,t),(i=this.root)==null||i.enqueueUnreliable(this);return}n?this.recordRaw(e,t):this.record(e,t),(s=this.root)==null||s.enqueueChangeTree(this)}}change(e,t=me.ADD){this._routeAndRecord(e,t,!1)}indexedOperation(e,t){this._routeAndRecord(e,t,!0)}getChange(e){return this.operationAt(e)}pause(){this.paused=!0}resume(){this.paused=!1}untracked(e){const t=this.paused;this.paused=!0;try{return e()}finally{this.paused=t}}markDirty(e,t=me.ADD){const n=this.paused;this.paused=!1;try{this.change(e,t)}finally{this.paused=n}}getValue(e,t=!1){return this.refTarget[Pt](e,t)}delete(e,t){var s,o,a;if(e===void 0){try{throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${e}'`)}catch(c){console.warn(c)}return}if(this.paused||this.isFieldFullStateOnly(e))return this.getValue(e);const n=this.isFieldUnreliable(e)&&!this.isNew;n?this.ensureUnreliableRecorder().recordDelete(e,t!=null?t:me.DELETE):this.recordDelete(e,t!=null?t:me.DELETE);const i=this.getValue(e);return i&&i[Q]&&((s=this.root)==null||s.remove(i[Q])),n?(o=this.root)==null||o.enqueueUnreliable(this):(a=this.root)==null||a.enqueueChangeTree(this),i}endEncode(){var e,t;this.reset(),this.changesNode=void 0,this._isSchema||(t=(e=this.refTarget)[Qi])==null||t.call(e),this.isNew=!1}endEncodeUnreliable(){var e,t,n;(e=this.unreliableRecorder)==null||e.reset(),this.unreliableChangesNode=void 0,this._isSchema||(n=(t=this.refTarget)[Qi])==null||n.call(t)}discard(){var e,t,n;this._isSchema||(t=(e=this.refTarget)[Qi])==null||t.call(e),this.reset(),(n=this.unreliableRecorder)==null||n.reset()}discardAll(){var t;const e=n=>{if(n<0)return;const i=this.getValue(n);i&&i[Q]&&i[Q].discardAll()};this.forEach(e),(t=this.unreliableRecorder)==null||t.forEach(e),this.discard()}get changed(){var e,t;return this.has()||((t=(e=this.unreliableRecorder)==null?void 0:e.has())!=null?t:!1)}get parent(){return this.parentRef}get parentIndex(){return this._parentIndex}addParent(e,t){E0(this,e,t)}setParentIndex(e,t){M0(this,e,t)}removeParent(e=this.parent){return b0(this,e)}findParent(e){return w0(this,e)}hasParent(e){return Qp(this,e)}indexInParent(e){return T0(this,e)}getAllParents(){return A0(this)}}class W0{constructor(e){L(this,"ref");L(this,"root");L(this,"parentRef");L(this,"paused",!1);L(this,"isNew",!1);L(this,"flags",0);this.ref=e}change(){}delete(){}indexedOperation(){}operation(){}setParent(){}addParent(){}setParentIndex(){}removeParent(){return!1}getChange(){return 0}discard(){}discardAll(){}pause(){}resume(){}untracked(e){return e()}markDirty(){}forEachChild(e){var o,a,c;const t=this.ref;if(t[nt]){if(typeof t[nt]!="string")for(const[l,f]of t.entries())f&&e(f[Q],(a=(o=t._collectionIndexes)==null?void 0:o[l])!=null?a:l);return}const n=t.constructor,i=n==null?void 0:n[Symbol.metadata];if(!i)return;const s=(c=i[er])!=null?c:[];for(let l=0;l<s.length;l++){const f=s[l],u=t[i[f].name];u&&e(u[Q],f)}}forEachChildWithCtx(e,t){this.forEachChild((n,i)=>t(e,n,i))}forEachLive(){}forEachLiveWithCtx(){}forEach(){}}function X0(r){return new W0(r)}function Fs(r,e=r){Object.defineProperty(r,Q,{value:X0(e),enumerable:!1,writable:!0})}function dc(r,e,t,n,i,s,o){var a;o!==void 0?o(e,n,s):typeof t=="string"?(a=st[t])==null||a.call(st,e,n,s):t[Symbol.metadata]!=null?(st.number(e,n[Ke],s),(i&me.ADD)===me.ADD&&r.tryEncodeTypeId(e,t,n.constructor,s)):st.number(e,n[Ke],s)}const q0=function(r,e,t,n,i,s,o,a){var u;if(e[s.offset++]=(n|i)&255,i===me.DELETE)return;const c=t.encDescriptor,l=t.ref,f=(u=l[Fn][n])!=null?u:l[c.names[n]];dc(r,e,c.types[n],f,i,s,c.encoders[n])},j0=function(r,e,t,n,i,s){if(e[s.offset++]=i&255,st.number(e,n,s),i===me.DELETE)return;const o=t.ref;if((i&me.ADD)===me.ADD){const a=o.$indexes.get(n);st.string(e,a,s)}dc(r,e,o[nt],o[Pt](n),i,s)},Kf=function(r,e,t,n,i,s){if(e[s.offset++]=i&255,st.number(e,n,s),i===me.DELETE)return;const o=t.ref;dc(r,e,o[nt],o[Pt](n),i,s)},$0=function(r,e,t,n,i,s,o,a){const c=t.refTarget,l=c[nt],f=typeof l!="string",u=a&&t.isFiltered&&f;let h;if(u){const g=c.tmpItems[n];if(!g)return;if(h=g[Ke],i===me.DELETE)i=me.DELETE_BY_REFID;else if((i&me.ADD)===me.ADD)i=me.ADD_BY_REFID;else if((i&me.MOVE)===me.MOVE)return}else if(i===me.DELETE&&f){const g=c.tmpItems[n];if(!g)return;h=g[Ke],i=me.DELETE_BY_REFID}else h=n;if(e[s.offset++]=i&255,st.number(e,h,s),i===me.DELETE||i===me.DELETE_BY_REFID)return;const d=c[Pt](n,o);dc(r,e,l,d,i,s)};function rm(r,e,t,n,i,s,o){const a=r.resyncVisited;let c=a.get(r.currentRefId);if(c===void 0&&a.set(r.currentRefId,c=new Set),c.add(n),i!==void 0&&t===me.ADD&&i!==s){const l=i[Ke];l!==void 0&&(r.root.removeRef(l),o==null||o.push({ref:e,refId:r.currentRefId,op:me.DELETE,dynamicIndex:n,value:void 0,previousValue:i}))}}function Y0(r,e){const t=r.resyncVisited;t.has(e)||t.set(e,new Set)}function K0(r,e){if(r.resyncDamaged){console.warn("@colyseus/schema: resync sweep skipped — parts of the payload could not be decoded. Stale entries may persist until the next resync.");return}Jf(r,r.state,new Set,e)}function Jf(r,e,t,n){const i=e[Ke];if(i===void 0||t.has(i))return;t.add(i);const s=e.constructor[Symbol.metadata],o=s==null?void 0:s[er];if(o===void 0)return;const a=s[vo];for(let c=0;c<o.length;c++){const l=o[c];if(a!==void 0&&a.includes(l))continue;const f=s[l],u=e[f.name];u&&(Ot.is(f.type)?Jf(r,u,t,n):J0(r,u,t,n))}}function J0(r,e,t,n){var c;const i=(c=e[Ft])!=null?c:e,s=i[Ke];if(s===void 0||t.has(s))return;t.add(s);const o=r.resyncVisited.get(s);if(o===void 0)return;const a=r.root;i[Is](o,(l,f)=>{n==null||n.push({ref:e,refId:s,op:me.DELETE,dynamicIndex:f,value:void 0,previousValue:l});const u=l==null?void 0:l[Ke];u!==void 0&&a.removeRef(u)},l=>{Ot.isSchema(l)&&Jf(r,l,t,n)})}const sm=-1,Jn={Map:1,Array:2,Set:3,Collection:4,Stream:5};function Zf(r,e,t,n,i,s,o,a,c){const l=r.root;let f;if((e&me.DELETE)===me.DELETE){const u=i==null?void 0:i[Ke];u!==void 0&&l.removeRef(u),e!==me.DELETE_AND_ADD&&t[si](n),f=void 0}if(e!==me.DELETE)if(typeof s=="string")f=ht[s](o,a);else if(Ir(s))f=m0(s.quantized,o,a);else if(Ot.is(s)){const u=ht.number(o,a);if(f=l.refs.get(u),(e&me.ADD)===me.ADD){const h=r.getInstanceType(o,a,s);f||(f=r.createInstanceOfType(h)),l.addRef(u,f,f!==i||e===me.DELETE_AND_ADD&&f===i)}}else{const u=jp(Object.keys(s)[0]),h=ht.number(o,a);r.resyncVisited!==null&&Y0(r,h);const d=l.refs.has(h)?i||l.refs.get(h):u.constructor.initializeForDecoder();if(f=d.clone(!0),f[nt]=Object.values(s)[0],i){let g=i[Ke];if(g!==void 0&&h!==g){(e&me.DELETE)!==me.DELETE&&l.removeRef(g);const _=i.entries();let m;for(;(m=_.next())&&!m.done;){const[p,y]=m.value;typeof y=="object"&&(g=y[Ke]),c==null||c.push({ref:i,refId:g,op:me.DELETE,field:p,value:void 0,previousValue:y})}}}l.addRef(h,f,d!==i||e===me.DELETE_AND_ADD&&d===i)}return f}const Z0=function(r,e,t,n,i){const s=e[t.offset++],o=n.constructor[Symbol.metadata],a=s>>6<<6,c=s%(a||255),l=o[c];if(l===void 0)return console.warn("@colyseus/schema: field not defined at",{index:c,ref:n.constructor.name,metadata:o}),sm;const f=l.deprecated===!0,u=f?void 0:n[Pt](c),h=Zf(r,a,n,c,u,l.type,e,t,i);f||(h!=null&&(n[l.name]=h),u!==h&&(i==null||i.push({ref:n,refId:r.currentRefId,op:a,field:l.name,value:h,previousValue:u})))},pc=function(r,e,t,n,i){var d,g;const s=(d=n[Ft])!=null?d:n,o=e[t.offset++];if(o===me.CLEAR){r.removeChildRefs(s,i),s.clear();return}const a=ht.number(e,t),c=s[nt],l=s.constructor.COLLECTION_KIND;let f;(o&me.ADD)===me.ADD?l===Jn.Map?(f=ht.string(e,t),s.setIndex(a,f)):f=a:f=s.getIndex(a);const u=s[Pt](a),h=Zf(r,o,n,a,u,c,e,t,i);if(r.resyncVisited!==null&&rm(r,n,o,f,u,h,i),h!=null)switch(l){case Jn.Map:s.$items.set(f,h);break;case Jn.Array:s.$setAt(a,h,r.resyncVisited!==null&&o===me.ADD?me.REPLACE:o);break;case Jn.Set:case Jn.Collection:case Jn.Stream:s.$items.has(a)||(s.$items.set(a,h),typeof s.$refId=="number"&&a>=s.$refId&&(s.$refId=a+1));break;default:console.warn(`@colyseus/schema: missing COLLECTION_KIND on ${(g=s.constructor)==null?void 0:g.name} — item at index ${a} was not stored.`);break}u!==h&&(i==null||i.push({ref:n,refId:r.currentRefId,op:o,dynamicIndex:f,value:h,previousValue:u}))},Q0=function(r,e,t,n,i){var h;const s=(h=n[Ft])!=null?h:n;let o=e[t.offset++],a;if(o===me.CLEAR){r.removeChildRefs(s,i),s.clear();return}else if(o===me.REVERSE){s.items.reverse();return}else if(o===me.DELETE_BY_REFID){const d=ht.number(e,t),g=r.root.refs.get(d);if(g===void 0||(r.root.removeRef(d),a=s.findIndex(_=>_===g),a===-1))return;s[si](a),i==null||i.push({ref:n,refId:r.currentRefId,op:me.DELETE,dynamicIndex:a,value:void 0,previousValue:g});return}else if(o===me.ADD_BY_REFID){const d=ht.number(e,t),g=r.root.refs.get(d);g&&(a=s.findIndex(_=>_===g)),(a===-1||a===void 0)&&(a=s.length)}else a=ht.number(e,t);const c=s[nt];let l=a;const f=s.items[a],u=Zf(r,o,n,a,f,c,e,t,i);r.resyncVisited!==null&&rm(r,n,o,a,f,u,i),u!=null&&u!==f&&s.$setAt(a,u,r.resyncVisited!==null&&o===me.ADD?me.REPLACE:o),f!==u&&(i==null||i.push({ref:n,refId:r.currentRefId,op:o,dynamicIndex:l,value:u,previousValue:f}))};class Qf extends Error{}function mc(r,e,t,n){if(!(r instanceof e))throw new Qf(`a '${e.name}' was expected, but '${r&&r.constructor.name}' was provided in ${t.constructor.name}#${n}`)}const e_=(r,e)=>{const t=r.toString(),n=e.toString();return t<n?-1:t>n?1:0},ju={get:(r,e)=>typeof e!="symbol"&&!isNaN(e)?r.items[e]:Reflect.get(r,e),set:(r,e,t)=>{var n;if(typeof e!="symbol"&&!isNaN(e)){if(t==null)r.$deleteAt(e);else{let i;if(t[Q]){mc(t,r[nt],r,e);const s=r.items[e];r.isMovingItems?(i=r.$wireIndex(Number(e)),s!==void 0?t[Q].isNew?r[Q].indexedOperation(i,me.MOVE_AND_ADD):(r[Q].getChange(i)&me.DELETE)===me.DELETE?r[Q].indexedOperation(i,me.DELETE_AND_MOVE):r[Q].indexedOperation(i,me.MOVE):t[Q].isNew&&r[Q].indexedOperation(i,me.ADD),t[Q].setParent(r,r[Q].root,i)):i=r.$changeAt(Number(e),t),s!==void 0&&((n=s[Q].root)==null||n.remove(s[Q]))}else i=r.$changeAt(Number(e),t);r.items[e]=t,i!==void 0&&(r.tmpItems[i]=t)}return!0}return Reflect.set(r,e,t)},deleteProperty:(r,e)=>(typeof e=="number"?r.$deleteAt(e):delete r[e],!0),has:(r,e)=>typeof e!="symbol"&&!isNaN(Number(e))?Reflect.has(r.items,e):Reflect.has(r,e)};var jd,$d,Yd,Kd,Jd,Zd,Qd;const Dn=class Dn{constructor(...e){L(this,Qd);L(this,Zd);L(this,Jd);L(this,Kd);L(this,"items",[]);L(this,"tmpItems",[]);L(this,"deletedIndexes",[]);L(this,"isMovingItems",!1);L(this,"_needsCompaction",!1);L(this,jd);this[nt]=void 0,this[Ft]=this;const t=new Proxy(this,ju);return Object.defineProperty(this,Q,{value:new Ls(t,this),enumerable:!1,writable:!0}),e.length>0&&this.push(...e),t}static[(Qd=Q,Zd=Ke,Jd=Ft,Kd=nt,Yd=vi,$d=ni,Br)](e,t,n){var s,o;if(!n)return!0;const i=(s=e[Ft])!=null?s:e;return typeof i[nt]=="string"||n.isChangeTreeVisible((o=i.tmpItems[t])==null?void 0:o[Q])}static is(e){return Array.isArray(e)||e.array!==void 0}static from(e){return new Dn(...Array.from(e))}static initializeForDecoder(){const e=Object.create(Dn.prototype);e.items=[],e.isMovingItems=!1,e._needsCompaction=!1,e[nt]=void 0,e[Ft]=e;const t=new Proxy(e,ju);return Fs(e,t),t}set length(e){e===0?this.clear():e<this.items.length?this.splice(e,this.length-e):console.warn("ArraySchema: can't set .length to a higher value than its length.")}get length(){return this.items.length}pauseTracking(){this[Q].pause()}resumeTracking(){this[Q].resume()}untracked(e){return this[Q].untracked(e)}get isTrackingPaused(){return this[Q].paused}push(...e){var c;const t=this[Ft],n=t.items,i=t.tmpItems,s=t[Q],o=t[nt];let a=i.length;for(let l=0,f=e.length;l<f;l++,a++){const u=e[l];if(u==null)return;typeof u=="object"&&o&&mc(u,o,t,l),s.indexedOperation(a,me.ADD),n.push(u),i.push(u),(c=u[Q])==null||c.setParent(this,s.root,a)}return a}pop(){const e=this[Ft],t=e.tmpItems,n=e.deletedIndexes;let i=-1;for(let s=t.length-1;s>=0;s--)if(n[s]!==!0){i=s;break}if(!(i<0))return e[Q].delete(i),n[i]=!0,e.items.pop()}at(e){return e<0&&(e+=this.length),this.items[e]}$wireIndex(e){const t=this.deletedIndexes;if(t.length===0)return e;const n=this.tmpItems;let i=0;for(let s=0;s<n.length;s++)if(t[s]!==!0){if(i===e)return s;i++}return n.length+(e-i)}$reindexChildren(e,t){var s,o;if(!this[Q].hasFilteredFields||typeof this[nt]=="string")return;const n=this.tmpItems,i=n.length;if(t!==void 0)for(;e<i&&n[e]===t[e];)e++;for(let a=e;a<i;a++)(o=(s=n[a])==null?void 0:s[Q])==null||o.setParentIndex(this,a)}$changeAt(e,t){var o;if(t==null){console.error("ArraySchema items cannot be null nor undefined; Use `splice(index, 1)` instead.");return}if(this.items[e]===t)return;const n=this.items[e]!==void 0?typeof t=="object"?me.DELETE_AND_ADD:me.REPLACE:me.ADD,i=this.$wireIndex(e),s=this[Q];return s.change(i,n),(o=t[Q])==null||o.setParent(this,s.root,i),i}$deleteAt(e,t){this[Q].delete(this.$wireIndex(e),t)}$setAt(e,t,n){n===me.ADD&&this.items[e]!==void 0?this.items.splice(e,0,t):n===me.DELETE_AND_MOVE?(this.items.splice(e,1),this.items[e]=t):(e>this.items.length&&(this._needsCompaction=!0),this.items[e]=t)}clear(){const e=this[Ft];if(e.items.length===0)return;const t=e[Q];t.forEachChild((n,i)=>{var s;(s=t.root)==null||s.remove(n)}),t.discard(),t.operation(me.CLEAR),e.items.length=0,e.tmpItems.length=0}[ii](){var i,s,o;const e=(i=this[Ft])!=null?i:this,t=e[Q];if(t.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed ArraySchema (pooling not supported).");const n=e.items;for(let a=0;a<n.length;a++)(o=(s=n[a])==null?void 0:s[ii])==null||o.call(s);e.items.length=0,e.tmpItems.length=0,e.deletedIndexes.length=0,t.recycle(),e[Ke]=void 0}concat(...e){return new Dn(...this.items.concat(...e))}join(e){return this.items.join(e)}reverse(){const e=this[Ft],t=e[Q];if(t.has()||e.deletedIndexes.length>0){const n=e.items.slice().reverse();return this.clear(),this.push(...n),this}return t.operation(me.REVERSE),e.items.reverse(),e.tmpItems.reverse(),e.$reindexChildren(0),this}shift(){const e=this[Ft],t=e.items;if(t.length===0)return;const n=e[Q],i=e.deletedIndexes;let s=0;for(;i[s]===!0;)s++;return n.delete(s,me.DELETE),i[s]=!0,t.shift()}slice(e,t){const n=new Dn;return n.push(...this.items.slice(e,t)),n}sort(e=e_){const t=this[Ft];t.isMovingItems=!0;const n=t[Q];return t.items.sort(e).forEach((s,o)=>n.change(o,me.REPLACE)),t.tmpItems.sort(e),t.$reindexChildren(0),t.isMovingItems=!1,this}splice(e,t,...n){var d,g,_,m;const i=this[Ft],s=i[Q],o=i.items,a=i.tmpItems,c=i.deletedIndexes,l=o.length,f=a.length,u=n.length,h=[];for(let p=0;p<f;p++)c[p]!==!0&&h.push(p);if(l>e){t===void 0&&(t=l-e);for(let p=e;p<e+t;p++){const y=h[p];s.delete(y,me.DELETE),c[y]=!0}}else t=0;if(u>0){const p=(d=h[e])!=null?d:l,y=Math.min(u,t);for(let v=0;v<y;v++){const C=p+v;s.indexedOperation(C,c[C]?me.DELETE_AND_ADD:me.ADD),a[C]=n[v],c[C]=!1,(g=n[v][Q])==null||g.setParent(this,s.root,C)}const b=u-y;if(b>0){const v=p+y;s.insertAt(v,b);for(let C=0;C<b;C++)(_=n[y+C][Q])==null||_.setParent(this,s.root,v+C);c.length>0&&c.splice(v,0,...new Array(b).fill(!1)),a.splice(v,0,...n.slice(y)),i.$reindexChildren(v+b)}}return(m=s.root)==null||m.enqueueChangeTree(s),o.splice(e,t,...n)}unshift(...e){var s,o;const t=this[Ft],n=t[Q];n.unshift(e.length);for(let a=0;a<e.length;a++)(o=(s=e[a])==null?void 0:s[Q])==null||o.setParent(this,n.root,a);const i=t.deletedIndexes;return i.length>0&&i.unshift(...new Array(e.length).fill(!1)),t.tmpItems.unshift(...e),t.$reindexChildren(e.length),t.items.unshift(...e)}indexOf(e,t){return this.items.indexOf(e,t)}lastIndexOf(e,t=this.length-1){return this.items.lastIndexOf(e,t)}every(e,t){return this.items.every(e,t)}some(e,t){return this.items.some(e,t)}forEach(e,t){return this.items.forEach(e,t)}map(e,t){return this.items.map(e,t)}filter(e,t){return this.items.filter(e,t)}reduce(e,t){return this.items.reduce(e,t)}reduceRight(e,t){return this.items.reduceRight(e,t)}find(e,t){return this.items.find(e,t)}findIndex(e,t){return this.items.findIndex(e,t)}fill(e,t,n){throw new Error("ArraySchema#fill() not implemented")}copyWithin(e,t,n){throw new Error("ArraySchema#copyWithin() not implemented")}toString(){return this.items.toString()}toLocaleString(){return this.items.toLocaleString()}[Symbol.iterator](){return this.items[Symbol.iterator]()}static get[Symbol.species](){return Dn}entries(){return this.items.entries()}keys(){return this.items.keys()}values(){return this.items.values()}includes(e,t){return this.items.includes(e,t)}flatMap(e,t){throw new Error("ArraySchema#flatMap() is not supported.")}flat(e){throw new Error("ArraySchema#flat() is not supported.")}findLast(){return this.items.findLast.apply(this.items,arguments)}findLastIndex(...e){return this.items.findLastIndex.apply(this.items,arguments)}with(e,t){const n=this.items.slice();return e<0&&(e+=this.length),n[e]=t,new Dn(...n)}toReversed(){return this.items.slice().reverse()}toSorted(e){return this.items.slice().sort(e)}toSpliced(e,t,...n){return this.items.toSpliced.apply(copy,arguments)}shuffle(){return this.move(e=>{let t=this.items.length;for(;t!=0;){let n=Math.floor(Math.random()*t);t--,[this[t],this[n]]=[this[n],this[t]]}})}move(e){return this.isMovingItems=!0,e(this),this.isMovingItems=!1,this}[(jd=Symbol.unscopables,Pt)](e,t=!1){var i;const n=(i=this[Ft])!=null?i:this;return t||n.deletedIndexes[e]?n.items[e]:n.tmpItems[e]||n.items[e]}[si](e){var n;const t=(n=this[Ft])!=null?n:this;t.items[e]=void 0,t._needsCompaction=!0}[Qi](){const e=this.tmpItems;this.tmpItems=this.items.slice(),this.deletedIndexes.length>0&&(this.$reindexChildren(0,e),this.deletedIndexes.length=0)}[qa](){var t;const e=(t=this[Ft])!=null?t:this;e._needsCompaction&&(e._needsCompaction=!1,e.items=e.items.filter(n=>n!==void 0))}[Is](e,t,n){var a;const i=(a=this[Ft])!=null?a:this,s=i.items;let o=!1;for(let c=0;c<s.length;c++){const l=s[c];if(e.has(c)){n(l);continue}o=!0,t(l,c),i[si](c)}o&&i[qa]()}toArray(){return this.items.slice(0)}toJSON(){return this.toArray().map(e=>typeof e.toJSON=="function"?e.toJSON():e)}clone(e){let t;return e?(t=new Dn,t.push(...this.items)):t=new Dn(...this.map(n=>n[Q]?n.clone():n)),t}};L(Dn,Yd,$0),L(Dn,$d,Q0),L(Dn,"COLLECTION_KIND",Jn.Array);let tr=Dn;zi("array",{constructor:tr});class $u{constructor(){L(this,"keyByIndex",new Map);L(this,"indexByKey",{});L(this,"nextIndex",0);L(this,"snapshots")}indexOf(e){const t=this.indexByKey[e];return t===void 0?void 0:t}assign(e){const t=this.nextIndex++;return this.indexByKey[e]=t,this.keyByIndex.set(t,e),t}snapshot(e,t){var n;((n=this.snapshots)!=null?n:this.snapshots=new Map).set(e,t)}forgetSnapshot(e){var t;(t=this.snapshots)==null||t.delete(e)}snapshotAt(e){var t;return(t=this.snapshots)==null?void 0:t.get(e)}setIndex(e,t){this.keyByIndex.set(e,t),this.indexByKey[t]=e}keyOf(e){return this.keyByIndex.get(e)}cleanupAfterEncode(){if(this.snapshots!==void 0){for(const[e]of this.snapshots){const t=this.keyByIndex.get(e);t!==void 0&&(delete this.indexByKey[t],this.keyByIndex.delete(e))}this.snapshots.clear()}}reset(){var e;this.indexByKey={},this.keyByIndex.clear(),(e=this.snapshots)==null||e.clear(),this.nextIndex=0}}var ep,tp,np,ip,rp;const fi=class fi{constructor(e){L(this,rp);L(this,ip);L(this,"childType");L(this,np);L(this,"$items",new Map);L(this,"journal",new $u);L(this,"_stream");if(Object.defineProperty(this,Q,{value:new Ls(this),enumerable:!1,writable:!0}),this[nt]=void 0,e)if(e instanceof Map||e instanceof fi)e.forEach((t,n)=>this.set(n,t));else for(const t in e)this.set(t,e[t])}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).priority=e}get $indexes(){return this.journal.keyByIndex}get _collectionIndexes(){return this.journal.indexByKey}static[(rp=Q,ip=Ke,np=nt,tp=vi,ep=ni,Br)](e,t,n){var s;if(!n||typeof e[nt]=="string")return!0;const i=(s=e[Pt](t))!=null?s:e.journal.snapshotAt(t);return n.isChangeTreeVisible(i[Q])}static is(e){return e.map!==void 0}static initializeForDecoder(){const e=Object.create(fi.prototype);return e.$items=new Map,e.journal=new $u,e[nt]=void 0,Fs(e),e}[Symbol.iterator](){return this.$items[Symbol.iterator]()}get[Symbol.toStringTag](){return this.$items[Symbol.toStringTag]}static get[Symbol.species](){return fi}set(e,t){var c;if(t==null)throw new Error(`MapSchema#set('${e}', ${t}): trying to set ${t} value on '${e}'.`);typeof t=="object"&&this[nt]&&mc(t,this[nt],this,e),e=e.toString();const n=this[Q],i=t[Q]!==void 0,s=this.journal;let o=s.indexOf(e),a;if(o!==void 0){a=me.REPLACE;const l=this.$items.get(e);if(l===t)return;i&&(a=me.DELETE_AND_ADD,l!==void 0&&((c=l[Q].root)==null||c.remove(l[Q]))),s.snapshotAt(o)!==void 0&&s.forgetSnapshot(o)}else o=s.assign(e),a=me.ADD;return this.$items.set(e,t),a===me.ADD&&n.isStreamCollection?n.root!==void 0&&fc(this,n.root,o):n.change(o,a),i&&t[Q].setParent(this,n.root,o),this}get(e){return this.$items.get(e)}getOrInsert(e,t){return this.$items.has(e)?this.$items.get(e):(this.set(e,t),t)}getOrInsertComputed(e,t){if(this.$items.has(e))return this.$items.get(e);const n=t(e);return this.set(e,n),n}delete(e){if(!this.$items.has(e))return!1;const t=this.journal.indexOf(e),n=this.$items.get(e),i=this[Q];if(i.isStreamCollection){const s=i.root;let o=!1;return s!==void 0&&(o=uc(this,s,this[Ke],t)),(n==null?void 0:n[Q])!==void 0&&(s==null||s.remove(n[Q])),this.$items.delete(e),o||this.journal.snapshot(t,n),!0}return this.journal.snapshot(t,n),i.delete(t),this.$items.delete(e)}clear(){const e=this[Q];e.discard(),e.forEachChild((t,n)=>{var i;(i=e.root)==null||i.remove(t)}),this.journal.reset(),this.$items.clear(),e.operation(me.CLEAR)}[ii](){const e=this[Q];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed MapSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[ii])==null?void 0:n.call(t)}),this.$items.clear(),this.journal.reset(),e.recycle(),this[Ke]=void 0}has(e){return this.$items.has(e)}forEach(e){this.$items.forEach(e)}entries(){return this.$items.entries()}keys(){return this.$items.keys()}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[Q].pause()}resumeTracking(){this[Q].resume()}untracked(e){return this[Q].untracked(e)}get isTrackingPaused(){return this[Q].paused}setIndex(e,t){this.journal.setIndex(e,t)}getIndex(e){return this.journal.keyOf(e)}[Pt](e){const t=this.journal.keyOf(e);return t!==void 0?this.$items.get(t):void 0}[si](e){const t=this.journal.keyOf(e);t!==void 0&&(this.$items.delete(t),this.journal.keyByIndex.delete(e))}[Is](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=new Set).add(o),t(s,o)}),i!==null){i.forEach(o=>{this.$items.delete(o),delete this.journal.indexByKey[o]});const s=[];this.journal.keyByIndex.forEach((o,a)=>{i.has(o)&&s.push(a)});for(let o=0;o<s.length;o++)this.journal.keyByIndex.delete(s[o])}}[Qi](){this.journal.cleanupAfterEncode()}_dropView(e){hc(this,e)}_unregister(){}toJSON(){const e={};return this.forEach((t,n)=>{e[n]=typeof t.toJSON=="function"?t.toJSON():t}),e}clone(e){let t;return e?t=Object.assign(new fi,this):(t=new fi,this.forEach((n,i)=>{n[Q]?t.set(i,n.clone()):t.set(i,n)})),t}};L(fi,tp,j0),L(fi,ep,pc),L(fi,"COLLECTION_KIND",Jn.Map);let nr=fi;zi("map",{constructor:nr});var sp,op,ap,cp,lp;const Yi=class Yi{constructor(e){L(this,lp);L(this,cp);L(this,ap);L(this,"$items",new Map);L(this,"deletedItems",{});L(this,"$refId",0);L(this,"_stream");Object.defineProperty(this,Q,{value:new Ls(this),enumerable:!1,writable:!0}),this[nt]=void 0,e&&e.forEach(t=>this.add(t))}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).priority=e}static[(lp=Q,cp=Ke,ap=nt,op=vi,sp=ni,Br)](e,t,n){var i;return!n||typeof e[nt]=="string"||n.isChangeTreeVisible(((i=e[Pt](t))!=null?i:e.deletedItems[t])[Q])}static is(e){return e.collection!==void 0}static initializeForDecoder(){const e=Object.create(Yi.prototype);return e.$items=new Map,e.deletedItems={},e.$refId=0,e[nt]=void 0,Fs(e),e}add(e){const t=this.$refId++,n=this[Q];return e[Q]!==void 0&&e[Q].setParent(this,n.root,t),this.$items.set(t,e),n.isStreamCollection?n.root!==void 0&&fc(this,n.root,t):n.change(t),t}at(e){const t=Array.from(this.$items.keys())[e];return this.$items.get(t)}entries(){return this.$items.entries()}delete(e){const t=this.$items.entries();let n,i;for(;(i=t.next())&&!i.done;)if(e===i.value[1]){n=i.value[0];break}if(n===void 0)return!1;const s=this[Q];if(s.isStreamCollection){const o=s.root,a=this.$items.get(n);return o!==void 0&&uc(this,o,this[Ke],n),(a==null?void 0:a[Q])!==void 0&&(o==null||o.remove(a[Q])),this.deletedItems[n]=a,this.$items.delete(n)}return this.deletedItems[n]=s.delete(n),this.$items.delete(n)}clear(){const e=this[Q];e.discard(),e.forEachChild((t,n)=>{var i;(i=e.root)==null||i.remove(t)}),this.$items.clear(),e.operation(me.CLEAR)}[ii](){const e=this[Q];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed CollectionSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[ii])==null?void 0:n.call(t)}),this.$items.clear(),this.deletedItems={},this.$refId=0,e.recycle(),this[Ke]=void 0}has(e){return Array.from(this.$items.values()).some(t=>t===e)}forEach(e){this.$items.forEach((t,n,i)=>e(t,n,this))}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[Q].pause()}resumeTracking(){this[Q].resume()}untracked(e){return this[Q].untracked(e)}get isTrackingPaused(){return this[Q].paused}[Symbol.iterator](){return this.$items.values()}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[si](e){this.$items.delete(e)}[Is](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=[]).push(o),t(s,o)}),i!==null)for(let s=0;s<i.length;s++)this[si](i[s])}[Qi](){for(const e in this.deletedItems)delete this.deletedItems[e]}_dropView(e){hc(this,e)}_unregister(){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach((t,n)=>{e.push(typeof t.toJSON=="function"?t.toJSON():t)}),e}clone(e){let t;return e?t=Object.assign(new Yi,this):(t=new Yi,this.forEach(n=>{n[Q]?t.add(n.clone()):t.add(n)})),t}};L(Yi,op,Kf),L(Yi,sp,pc),L(Yi,"COLLECTION_KIND",Jn.Collection);let yo=Yi;zi("collection",{constructor:yo});var fp,up,hp,dp,pp;const Ki=class Ki{constructor(e){L(this,pp);L(this,dp);L(this,hp);L(this,"$items",new Map);L(this,"deletedItems",{});L(this,"$refId",0);L(this,"_stream");Object.defineProperty(this,Q,{value:new Ls(this),enumerable:!1,writable:!0}),this[nt]=void 0,e&&e.forEach(t=>this.add(t))}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).priority=e}static[(pp=Q,dp=Ke,hp=nt,up=vi,fp=ni,Br)](e,t,n){var i;return!n||typeof e[nt]=="string"||n.isVisible(((i=e[Pt](t))!=null?i:e.deletedItems[t])[Q])}static is(e){return e.set!==void 0}static initializeForDecoder(){const e=Object.create(Ki.prototype);return e.$items=new Map,e.deletedItems={},e.$refId=0,e[nt]=void 0,Fs(e),e}add(e){if(this.has(e))return!1;const t=this.$refId++,n=this[Q];return e[Q]!==void 0&&e[Q].setParent(this,n.root,t),this.$items.set(t,e),n.isStreamCollection?n.root!==void 0&&fc(this,n.root,t):n.change(t,me.ADD),t}entries(){return this.$items.entries()}delete(e){const t=this.$items.entries();let n,i;for(;(i=t.next())&&!i.done;)if(e===i.value[1]){n=i.value[0];break}if(n===void 0)return!1;const s=this[Q];if(s.isStreamCollection){const o=s.root,a=this.$items.get(n);return o!==void 0&&uc(this,o,this[Ke],n),(a==null?void 0:a[Q])!==void 0&&(o==null||o.remove(a[Q])),this.deletedItems[n]=a,this.$items.delete(n)}return this.deletedItems[n]=s.delete(n),this.$items.delete(n)}clear(){const e=this[Q];e.discard(),this.$items.clear(),e.operation(me.CLEAR)}[ii](){const e=this[Q];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed SetSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[ii])==null?void 0:n.call(t)}),this.$items.clear(),this.deletedItems={},this.$refId=0,e.recycle(),this[Ke]=void 0}has(e){const t=this.$items.values();let n=!1,i;for(;(i=t.next())&&!i.done;)if(e===i.value){n=!0;break}return n}forEach(e){this.$items.forEach((t,n,i)=>e(t,n,this))}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[Q].pause()}resumeTracking(){this[Q].resume()}untracked(e){return this[Q].untracked(e)}get isTrackingPaused(){return this[Q].paused}[Symbol.iterator](){return this.$items.values()}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[si](e){this.$items.delete(e)}[Is](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=[]).push(o),t(s,o)}),i!==null)for(let s=0;s<i.length;s++)this[si](i[s])}[Qi](){for(const e in this.deletedItems)delete this.deletedItems[e]}_dropView(e){hc(this,e)}_unregister(){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach((t,n)=>{e.push(typeof t.toJSON=="function"?t.toJSON():t)}),e}clone(e){let t;return e?t=Object.assign(new Ki,this):(t=new Ki,this.forEach(n=>{n[Q]?t.add(n.clone()):t.add(n)})),t}};L(Ki,up,Kf),L(Ki,fp,pc),L(Ki,"COLLECTION_KIND",Jn.Set);let So=Ki;zi("set",{constructor:So});var mp,gp,_p,vp,xp;const Di=class Di{constructor(){L(this,xp);L(this,vp);L(this,_p);L(this,"$items",new Map);L(this,"$nextPosition",0);L(this,"_itemIndex",new Map);L(this,"_stream");Object.defineProperty(this,Q,{value:new Ls(this),enumerable:!1,writable:!0}),this[nt]=void 0}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Oi()).priority=e}static[(xp=Q,vp=Ke,_p=nt,gp=vi,mp=ni,Br)](e,t,n){if(!n)return!0;const i=e[Pt](t);return i===void 0?!1:n.isVisible(i[Q])}static is(e){return e&&e.stream!==void 0}static initializeForDecoder(){const e=Object.create(Di.prototype);return e.$items=new Map,e.$nextPosition=0,e._itemIndex=new Map,e[nt]=void 0,Fs(e),e}add(e){if(this._itemIndex.has(e))return-1;const t=this.$nextPosition++;this.$items.set(t,e),this._itemIndex.set(e,t);const i=this[Q].root;return e[Q]!==void 0&&e[Q].setParent(this,i,t),i!==void 0&&fc(this,i,t),t}remove(e){const t=this._itemIndex.get(e);if(t===void 0)return!1;this._itemIndex.delete(e),this.$items.delete(t);const n=this[Q].root;return n!==void 0&&(uc(this,n,this[Ke],t),e[Q]!==void 0&&n.remove(e[Q])),!0}has(e){return this._itemIndex.has(e)}clear(){const e=this[Q].root;if(e!==void 0){u0(this,e,this[Ke]);for(const t of this.$items.values())t[Q]!==void 0&&e.remove(t[Q])}this.$items.clear(),this._itemIndex.clear()}forEach(e){for(const[t,n]of this.$items)e(n,t,this)}values(){return this.$items.values()}entries(){return this.$items.entries()}[Symbol.iterator](){return this.$items.values()}get size(){return this.$items.size}get length(){return this.$items.size}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[si](e){const t=this.$items.get(e);t!==void 0&&(this._itemIndex.delete(t),this.$items.delete(e))}[Is](){}[Qi](){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach(t=>{e.push(typeof(t==null?void 0:t.toJSON)=="function"?t.toJSON():t)}),e}clone(e){if(e)return Object.assign(new Di,this);const t=new Di;return t.maxPerTick=this.maxPerTick,this.forEach(n=>{t.add(typeof(n==null?void 0:n.clone)=="function"?n.clone():n)}),t}_dropView(e){hc(this,e)}_unregister(){}};L(Di,"$isStream",!0),L(Di,gp,Kf),L(Di,mp,pc),L(Di,"COLLECTION_KIND",Jn.Stream);let Ja=Di;zi("stream",{constructor:Ja});var yp;yp=Dp;class cr{constructor(e){L(this,yp,!0);L(this,"_type");L(this,"_default");L(this,"_hasDefault",!1);L(this,"_view");L(this,"_unreliable",!1);L(this,"_patchOnly",!1);L(this,"_deprecated",!1);L(this,"_deprecatedThrows",!0);L(this,"_fullStateOnly",!1);L(this,"_stream",!1);L(this,"_optional",!1);L(this,"_noSync",!1);L(this,"_streamPriority");this._type=e}default(e){return this._default=e,this._hasDefault=!0,this}view(e){return this._view=e!=null?e:-1,this}unreliable(){return this._unreliable=!0,this}patchOnly(){return this._patchOnly=!0,this}fullStateOnly(){return this._fullStateOnly=!0,this}noSync(){return this._noSync=!0,this}stream(){const e=this._type;if(e&&typeof e=="object"&&e.array!==void 0)throw new Error($p);return this._stream=!0,this}priority(e){return this._streamPriority=e,this}deprecated(e=!0){return this._deprecated=!0,this._deprecatedThrows=e,this}optional(){return this._optional=!0,this}toDefinition(){return{type:this._type,default:this._default,hasDefault:this._hasDefault,view:this._view,unreliable:this._unreliable,patchOnly:this._patchOnly,deprecated:this._deprecated,deprecatedThrows:this._deprecatedThrows,fullStateOnly:this._fullStateOnly,stream:this._stream,optional:this._optional,noSync:this._noSync,streamPriority:this._streamPriority}}}function om(r){return r!=null&&r[Dp]===!0}function on(r){return()=>new cr(r)}function Bo(r){if(om(r)){const e=r._type,t=typeof e=="string"?`use the type name instead: t.array("${e}")`:'collections accept a Schema class or a primitive type name ("string", "number", …)';throw new Error(`t.array/map/set/collection(): a t.* builder is not a valid element type — ${t}.`)}return r}const t_=r=>new cr({array:Bo(r)}),n_=r=>new cr({map:Bo(r)}),i_=r=>new cr({set:Bo(r)}),r_=r=>new cr({collection:Bo(r)}),s_=r=>{const e=new cr({stream:Bo(r)});return e._stream=!0,e},o_=r=>new cr(r);function Yu(r){return new cr({quantized:jf(r)})}const yn=Object.freeze({string:on("string"),number:on("number"),boolean:on("boolean"),int8:on("int8"),uint8:on("uint8"),int16:on("int16"),uint16:on("uint16"),int32:on("int32"),uint32:on("uint32"),int64:on("int64"),uint64:on("uint64"),float32:on("float32"),float64:on("float64"),bigint64:on("bigint64"),biguint64:on("biguint64"),ref:o_,array:t_,map:n_,set:i_,collection:r_,stream:s_,quantized:Yu,angle:r=>{var e;return Yu({min:0,max:Math.PI*2,mode:"wrap",bits:(e=r==null?void 0:r.bits)!=null?e:16})}}),gc=-1;function a_(r=gc){return function(e,t){const n=mt.initialize(e.constructor);mt.setTag(n,t,r)}}function c_(r,e){const t=mt.initialize(r.constructor);mt.setUnreliable(t,e)}function l_(r,e){const t=mt.initialize(r.constructor);mt.setPatchOnly(t,e)}const f_={number:"number",int8:"number",uint8:"number",int16:"number",uint16:"number",int32:"number",uint32:"number",int64:"number",uint64:"number",float32:"number",float64:"number",bigint64:"bigint",biguint64:"bigint",string:"string",boolean:"boolean"};function u_(r,e,t){const n=f_[t],i=t==="string",s=t==="boolean";return function(o){const a=this[Fn],c=a[e];if(o!==c){if(o!=null){if(!s&&n!==void 0&&typeof o!==n&&!(i&&o===null)){const l=o&&o.constructor?` (${o.constructor.name})`:"";throw new Qf(`a '${n}' was expected, but '${JSON.stringify(o)}'${l} was provided in ${this.constructor.name}#${r}`)}this.constructor[_i](this[Q],e,me.ADD)}else c!=null&&this[Q].delete(e);a[e]=o}}}function h_(r,e,t){return function(n){var o,a;const i=this[Fn],s=i[e];if(n!==s){if(n!=null){mc(n,t,this,r);const c=this[Q],l=this.constructor;s!=null&&s[Q]?((o=c.root)==null||o.remove(s[Q]),l[_i](c,e,me.DELETE_AND_ADD)):l[_i](c,e,me.ADD),(a=n[Q])==null||a.setParent(this,c.root,e)}else s!=null&&this[Q].delete(e);i[e]=n}}}function d_(r,e,t,n){const i=n.constructor===tr,s=n.constructor===nr;return function(o){var l,f;const a=this[Fn],c=a[e];if(o!==c){if(o!=null){if(i&&!(o instanceof tr)){const d=new tr;d[nt]=t,d.push(...o),o=d}else if(s&&!(o instanceof nr)){const d=new nr;if(d[nt]=t,o instanceof Map)o.forEach((g,_)=>d.set(_,g));else for(const g in o)d.set(g,o[g]);o=d}else o[nt]=t;const u=this[Q],h=this.constructor;c!=null&&c[Q]?((l=u.root)==null||l.remove(c[Q]),h[_i](u,e,me.DELETE_AND_ADD)):h[_i](u,e,me.ADD),(f=o[Q])==null||f.setParent(this,u.root,e)}else c!=null&&this[Q].delete(e);a[e]=o}}}function p_(r,e,t){return function(n){const i=this[Fn],s=i[e];if(n!=null){if(typeof n!="number")throw new Qf(`a 'number' was expected, but '${JSON.stringify(n)}' was provided in ${this.constructor.name}#${r}`);if(n=Kp(t,Yp(t,n)),n===s)return;this.constructor[_i](this[Q],e,me.ADD)}else{if(n===s)return;s!=null&&this[Q].delete(e)}i[e]=n}}function m_(r,e,t,n){let i;return n?i=d_(r,e,t,n):typeof t=="string"?i=u_(r,e,t):Ir(t)?i=p_(r,e,t.quantized):i=h_(r,e,t),{get:function(){return this[Fn][e]},set:i,enumerable:!0,configurable:!0}}function g_(r=!0){return function(e,t){var i;const n=mt.initialize(e.constructor);mt.setDeprecated(n,t),r&&((i=n[Pn])!=null||(n[Pn]={}),n[Pn][t]={get:function(){throw new Error(`${t} is deprecated.`)},set:function(s){},enumerable:!1,configurable:!0},Object.defineProperty(e,t,n[Pn][t]))}}function __(r){if(r&&typeof r=="object"){if(r.array!==void 0)return()=>new tr;if(r.map!==void 0)return()=>new nr;if(r.set!==void 0)return()=>new So;if(r.collection!==void 0)return()=>new yo;if(r.stream!==void 0)return()=>new Ja}else if(typeof r=="function"&&Ot.is(r)&&(!r.prototype.initialize||r.prototype.initialize.length===0))return()=>new r}function ko(r,e,t=Ot){var w;if(r==null||typeof r!="object")throw new Error(`schema(): first argument must be a fields object (got ${typeof r}).`);const n={},i={},s={},o={},a=(A,S)=>{typeof S=="function"?o[A]=S:S&&typeof S.clone=="function"?o[A]=()=>S.clone():s[A]=S},c=(A,S)=>{if(S.hasDefault)a(A,S.default);else if(!S.optional){const x=__(S.type);x&&(o[A]=x)}},l={},f=[],u=[],h={},d=[],g=[],_={},m=[];for(const A in r){const S=r[A];if(om(S)){const x=S.toDefinition();if(x.noSync){if(x.view!==void 0||x.unreliable||x.patchOnly||x.fullStateOnly||x.stream)throw new Error(`schema(${e?`'${e}'`:""}): field '${A}' uses .noSync() together with a sync-only modifier (.view/.unreliable/.patchOnly/.fullStateOnly/.stream). A local-only field cannot be synchronized.`);c(A,x);continue}if(x.patchOnly&&x.fullStateOnly)throw new Error(`schema(${e?`'${e}'`:""}): field '${A}' uses .patchOnly() together with .fullStateOnly(). Those are the only two delivery channels, so the field would never reach a client — use .noSync() if that is intended.`);const F=Ms(x.type);if(typeof F=="function"&&!Ot.is(F))throw new Error(`schema(${e?`'${e}'`:""}): field '${A}' is a synced ref to non-Schema class '${F.name||"(anonymous)"}' — use .noSync(), or Metadata.setFields().`);n[A]=F,x.view!==void 0&&(l[A]=x.view),x.unreliable&&f.push(A),x.patchOnly&&u.push(A),x.deprecated&&(h[A]=x.deprecatedThrows),x.fullStateOnly&&d.push(A),x.stream&&g.push(A),x.streamPriority!==void 0&&(_[A]=x.streamPriority),x.optional&&m.push(A),c(A,x)}else if(typeof S=="function")Ot.is(S)?(n[A]=Ms(S),(!S.prototype.initialize||S.prototype.initialize.length===0)&&(o[A]=()=>new S)):i[A]=S;else throw new Error(`schema(${e?`'${e}'`:""}): field '${A}' must be a t.* builder, Schema subclass, or method (got ${typeof S}).`)}const p=A=>{for(const S in s)A[S]=s[S];for(const S in o)A[S]=o[S]()},y=()=>{const A={};return p(A),A},b=A=>{const S=Object.keys(n),x={};for(const F in A)S.includes(F)||(x[F]=A[F]);return x},v=typeof i.initialize=="function",C=(w=i.initialize)!=null?w:t._initialize,R=class extends t{constructor(...A){const S=A[0];S===void 0?(super(),p(this)):super(Object.assign(y(),v?b(S):S)),C&&new.target===R&&C.apply(this,A)}};e&&Object.defineProperty(R,"name",{value:e}),mt.setFields(R,n),R._getDefaultValues=y,R._initialize=C,Object.assign(R.prototype,i);for(const A in l)a_(l[A])(R.prototype,A);for(const A of f)c_(R.prototype,A);for(const A of u)l_(R.prototype,A);for(const A in h)g_(h[A])(R.prototype,A);if(d.length>0||g.length>0){const A=R[Symbol.metadata];for(const S of d)mt.setFullStateOnly(A,S);for(const S of g)mt.setStream(A,S);for(const S in _)mt.setStreamPriority(A,S,_[S])}if(m.length>0){const A=R[Symbol.metadata];for(const S of m)A[A[S]].optional=!0}return R.extend=(A,S)=>ko(A,S,R),R}function v_(r){return new Array(r).fill(0).map((e,t)=>t===r-1?"└─ ":"   ").join("")}var Sp,Ep,Mp,bp;const $n=class $n{constructor(e){L(this,Ep);L(this,Sp);$n.initialize(this),e&&$n.assignProps(this,e)}static initialize(e){Object.defineProperty(e,Q,{value:new Ls(e),enumerable:!1,writable:!0}),e[Fn]=[]}static initializeForDecoder(){const e=Object.create(this.prototype);return Fs(e),e[Fn]=[],e}static reset(e){const t=e==null?void 0:e[Q];if(t===void 0||typeof t.recycle!="function")throw new Error("@colyseus/schema: Schema.reset() requires a tracked (encoder-side) instance.");if(t.extraParents!==void 0)throw new Error(`@colyseus/schema: cannot reset a shared instance (${e.constructor.name}) with multiple parents.`);e[ii]()}[(bp=vi,Mp=ni,Ep=Ke,Sp=Fn,ii)](){var i,s;const e=this.constructor[Symbol.metadata],t=(i=e==null?void 0:e[er])!=null?i:[],n=this[Fn];for(let o=0;o<t.length;o++){const a=n[t[o]];(s=a==null?void 0:a[ii])==null||s.call(a)}this[Q].recycle(),this[Ke]=void 0}static is(e){const t=e[Symbol.metadata];return typeof t=="object"&&t!==null}static isSchema(e){return typeof(e==null?void 0:e.assign)=="function"}static[_i](e,t,n=me.ADD){e.change(t,n)}static[Br](e,t,n){var o;const s=(o=e.constructor[Symbol.metadata][t])==null?void 0:o.tag;return n===void 0?s===void 0:s===void 0?!0:s===gc?n.isChangeTreeVisible(e[Q]):n.hasTagOnTree(e[Q],s)}assign(e){return $n.assignProps(this,e),this}static assignProps(e,t){const n=e.constructor[Symbol.metadata];if(n&&n[nn]!==void 0)for(let s=0;s<=n[nn];s++){const o=n[s];if(!o)continue;const a=t[o.name];a!==void 0&&(e[o.name]=a)}const i=Object.keys(t);for(let s=0;s<i.length;s++){const o=i[s];n&&n[o]!==void 0||(e[o]=t[o])}}restore(e){const t=this.constructor[Symbol.metadata];for(const n in t){const i=t[n],s=i.name,o=i.type,a=e[s];if(a!=null){if(typeof o=="string")this[s]=a;else if($n.is(o)){const c=new o;c.restore(a),this[s]=c}else if(typeof o=="object"){const c=Object.keys(o)[0],l=o[c];if(c==="map"){const f=this[s];for(const u in a)if($n.is(l)){const h=new l;h.restore(a[u]),f.set(u,h)}else f.set(u,a[u])}else if(c==="array"){const f=this[s];for(let u=0;u<a.length;u++)if($n.is(l)){const h=new l;h.restore(a[u]),f.push(h)}else f.push(a[u])}}}}return this}setDirty(e,t){const n=this.constructor[Symbol.metadata];this[Q].change(n[n[e]].index,t)}pauseTracking(){this[Q].pause()}resumeTracking(){this[Q].resume()}untracked(e){return this[Q].untracked(e)}get isTrackingPaused(){return this[Q].paused}clone(){var n;const e=Object.create(this.constructor.prototype);$n.initialize(e);const t=this.constructor[Symbol.metadata];for(const i in t){const s=t[i].name;typeof this[s]=="object"&&typeof((n=this[s])==null?void 0:n.clone)=="function"?e[s]=this[s].clone():e[s]=this[s]}return e}toJSON(){const e={},t=this.constructor[Symbol.metadata];for(const n in t){const i=t[n],s=i.name;!i.deprecated&&this[s]!==null&&typeof this[s]!="undefined"&&(e[s]=typeof this[s].toJSON=="function"?this[s].toJSON():this[s])}return e}discardAllChanges(){this[Q].discardAll()}[Pt](e){const t=this.constructor[Symbol.metadata];return this[t[e].name]}[si](e){const t=this.constructor[Symbol.metadata];this[t[e].name]=void 0}static debugRefIds(e,t=!1,n=0,i,s=""){var h;const o=t?` - ${JSON.stringify(e.toJSON())}`:"",a=e[Q],c=e[Ke],l=i?i.root:a.root,f=((h=l==null?void 0:l.refCount)==null?void 0:h[c])>1?` [×${l.refCount[c]}]`:"";let u=`${v_(n)}${s}${e.constructor.name} (refId: ${c})${f}${o}
`;return a.forEachChild((d,g)=>{var p;let _=g;typeof g=="number"&&e.$indexes&&(_=(p=e.$indexes.get(g))!=null?p:g);const m=e.forEach!==void 0&&_!==void 0?`["${_}"]: `:"";u+=this.debugRefIds(d.ref,t,n+1,i,m)}),u}static debugRefIdEncodingOrder(e,t="allChanges"){var c;const n=[],i=e[Q];if(t==="changes"){let l=(c=i.root.changes)==null?void 0:c.next;for(;l;)l.changeTree&&n.push(l.changeTree.ref[Ke]),l=l.next;return n}const s=t==="allFilteredChanges",o=new Set,a=l=>{o.has(l)||(o.add(l),l.isFiltered===s&&n.push(l.ref[Ke]),l.forEachChild((f,u)=>a(f)))};return a(i),n}static debugRefIdsFromDecoder(e){return this.debugRefIds(e.state,!1,0,e)}static debugChanges(e,t=!1){const n=e[Q],i=t?"allChanges":"changes";let s=`${e.constructor.name} (${e[Ke]}) -> .${i}:
`;return t?n.forEachLive(o=>{s+=`- [${o}]: ADD (${JSON.stringify(n.getValue(Number(o),!0))})
`}):n.forEach((o,a)=>{o<0||!a||(s+=`- [${o}]: ${me[a]} (${JSON.stringify(n.getValue(Number(o),!1))})
`)}),s}};L($n,bp,q0),L($n,Mp,Z0);let Ot=$n;Cp(Ot);const Ku={value:0,enumerable:!1,writable:!0};class x_{constructor(e,t=0){L(this,"types");L(this,"nextUniqueId",0);L(this,"refCount",{});L(this,"changeTrees",{});L(this,"changes",qu());L(this,"unreliableChanges",qu());L(this,"pendingFilterRefresh",[]);L(this,"_nodePool",[]);L(this,"_nextViewId",0);L(this,"_freeViewIds",[]);L(this,"activeViews",new Map);L(this,"streamTrees",new Set);this.types=e,this.nextUniqueId=t}enqueueFilterRefresh(e){this.types.hasFilters&&(e.flags&xo||(e.flags|=xo,this.pendingFilterRefresh.push(e)))}acquireViewId(){return this._freeViewIds.length>0?this._freeViewIds.pop():this._nextViewId++}releaseViewId(e){this._freeViewIds.push(e)}registerView(e){this.activeViews.set(e.id,new WeakRef(e))}unregisterView(e){this.activeViews.delete(e.id);const t=e.id;for(const n of this.streamTrees)n._dropView(t)}forEachActiveView(e){for(const[t,n]of this.activeViews){const i=n.deref();if(i===void 0){this.activeViews.delete(t);for(const s of this.streamTrees)s._dropView(t);continue}e(i)}}registerStream(e){this.streamTrees.add(e)}unregisterStream(e){this.streamTrees.delete(e)}add(e){const t=e.ref;t[Ke]===void 0&&(Ku.value=this.nextUniqueId++,Object.defineProperty(t,Ke,Ku));const n=t[Ke],i=this.changeTrees[n]===void 0;i&&(this.changeTrees[n]=e);const s=this.refCount[n];return(s===0||e.needsRestage)&&(e.needsRestage=!1,e.forEachLiveWithCtx(e,em)),this.refCount[n]=(s||0)+1,s>0&&this.enqueueFilterRefresh(e),i}remove(e){var i;const t=e.ref[Ke],n=this.refCount[t]-1;if(n<=0){if(e.root=void 0,delete this.changeTrees[t],e.isStreamCollection){const s=e.ref;(i=s._unregister)==null||i.call(s),this.unregisterStream(s)}this.removeFromQueue(e),this.removeFromUnreliableQueue(e),this.refCount[t]=0,e.forEachChild((s,o)=>{s.removeParent(e.ref)&&(s.parentRef===void 0||s.parentRef&&this.refCount[s.ref[Ke]]>0?this.remove(s):s.parentRef&&this.moveNextToParent(s))})}else this.refCount[t]=n,this.enqueueFilterRefresh(e),this.recursivelyMoveNextToParent(e);return n}recursivelyMoveNextToParent(e){this.moveNextToParent(e),e.forEachChild((t,n)=>this.recursivelyMoveNextToParent(t))}moveNextToParent(e){e.changesNode&&this._moveNextToParentInList(this.changes,e,e.changesNode,"changesNode"),e.unreliableChangesNode&&this._moveNextToParentInList(this.unreliableChanges,e,e.unreliableChangesNode,"unreliableChangesNode")}_moveNextToParentInList(e,t,n,i){const s=t.parent;if(!s||!s[Q])return;const o=s[Q][i];!o||o===n||n.position>o.position||(n.prev?n.prev.next=n.next:e.next=n.next,n.next?n.next.prev=n.prev:e.tail=n.prev,n.prev=e.tail,n.next=void 0,e.tail.next=n,e.tail=n,n.position=e.nextPosition++)}enqueueChangeTree(e,t=e.changesNode){t||(e.changesNode=this._appendToList(this.changes,e))}enqueueUnreliable(e,t=e.unreliableChangesNode){t||(e.unreliableChangesNode=this._appendToList(this.unreliableChanges,e))}_appendToList(e,t){const n=this._nodePool;let i;return n.length>0?(i=n.pop(),i.changeTree=t,i.next=void 0,i.prev=void 0):i={changeTree:t,next:void 0,prev:void 0,position:0},e.next?(i.prev=e.tail,e.tail.next=i,e.tail=i):(e.nextPosition=0,e.next=i,e.tail=i),i.position=e.nextPosition++,i}releaseNode(e){e.changeTree=void 0,e.prev=void 0,e.next=void 0,this._nodePool.push(e)}removeFromQueue(e){return this._removeNode(this.changes,e,e.changesNode,"changesNode")}removeFromUnreliableQueue(e){return this._removeNode(this.unreliableChanges,e,e.unreliableChangesNode,"unreliableChangesNode")}_removeNode(e,t,n,i){return!n||n.changeTree!==t?!1:(n.prev?n.prev.next=n.next:e.next=n.next,n.next?n.next.prev=n.prev:e.tail=n.prev,t[i]=void 0,this.releaseNode(n),!0)}}function y_(r,e){if(e===-1||e>=r.length)return!1;const t=r.length-1;for(let n=e;n<t;n++)r[n]=r[n+1];return r.length=t,!0}function S_(r,e,t){const n=~t,i=r.changeTrees;for(const s in i){const o=i[s],a=o.visibleViews;a!==void 0&&e<a.length&&(a[e]&=n);const c=o.subscribedViews;c!==void 0&&e<c.length&&(c[e]&=n);const l=o.tagViews;l!==void 0&&l.forEach(f=>{e<f.length&&(f[e]&=n)})}}new FinalizationRegistry(({root:r,id:e,slot:t,bit:n})=>{S_(r,t,n),r.releaseViewId(e)});const E_=-1;function Ju(r){r.structSwitchEmitted||(r.shouldEmitSwitch&&(r.buffer[r.it.offset++]=br&255,st.number(r.buffer,r.ref[Ke],r.it)),r.structSwitchEmitted=!0)}function M_(r,e){cm(r,e,me.ADD)}function am(r,e){if(e._fullSyncGen===r.gen)return;if(e._fullSyncGen=r.gen,!r.hasView||r.view.isChangeTreeVisible(e)){const n=e.encDescriptor;r.changeTree=e,r.ref=e.ref,r.encoder=n.encoder,r.filter=n.filter,r.metadata=n.metadata,r.treeIsFiltered=e.isFiltered,r.isSchema=n.isSchema,r.filterBitmask=n.filterBitmask,r.tags=n.tags,r.structSwitchEmitted=!1,r.shouldEmitSwitch=r.hasView||r.it.offset>r.initialOffset||e!==r.rootChangeTree,$f(e,r,M_)}Oo(e,r,b_)}function b_(r,e,t){am(r,e)}function cm(r,e,t){if(e<0){if(r.treeIsFiltered!==r.emitFiltered)return;Ju(r),r.buffer[r.it.offset++]=Math.abs(e)&255;return}if((r.isSchema?r.treeIsFiltered||(e<32?(r.filterBitmask&1<<e)!==0:r.tags[e]!==void 0):r.treeIsFiltered)!==r.emitFiltered)return;const i=r.isEncodeAll?me.ADD:t;i!==void 0&&(r.filter!==void 0&&!r.filter(r.ref,e,r.view)||(Ju(r),r.encoder(r.self,r.buffer,r.changeTree,e,i,r.it,r.isEncodeAll,r.hasView,r.metadata)))}function Gc(r,e){const t=new Uint8Array(r.length+e.length);return t.set(r,0),t.set(e,r.length),t}const ui=class ui{constructor(e,t){L(this,"sharedBuffer",new Uint8Array(ui.BUFFER_SIZE));L(this,"context");L(this,"state");L(this,"root");L(this,"_encodeCtx",{self:void 0,buffer:void 0,it:void 0,changeTree:void 0,ref:void 0,encoder:void 0,filter:void 0,metadata:void 0,view:void 0,isEncodeAll:!1,hasView:!1,treeIsFiltered:!1,isSchema:!1,emitFiltered:!1,filterBitmask:0,tags:void 0,structSwitchEmitted:!1,isRootTree:!1,shouldEmitSwitch:!1,gen:0,initialOffset:0,rootChangeTree:void 0});L(this,"_fullSyncGen",0);this.context=Lr.cache(e.constructor),this.root=t!=null?t:new x_(this.context),this.setState(e)}setState(e){this.state=e,this.state[Q].setRoot(this.root)}encode(e={offset:0},t,n=this.sharedBuffer,i=e.offset){return this._encodeChannel(e,t,n,i,!1)}encodeUnreliable(e={offset:0},t,n=this.sharedBuffer,i=e.offset){return this._encodeChannel(e,t,n,i,!0)}_encodeChannel(e,t,n,i,s){this.root.pendingFilterRefresh.length>0&&Hu(this.root);const o=t!==void 0,a=this.state[Q],c=this._encodeCtx;c.self=this,c.buffer=n,c.it=e,c.view=t,c.isEncodeAll=!1,c.hasView=o,c.emitFiltered=o;let f=s?this.root.unreliableChanges:this.root.changes;for(;f=f.next;){const u=f.changeTree;if(o&&!t.isChangeTreeVisible(u))continue;const h=s?u.unreliableRecorder:u;if(!h||!h.has())continue;const d=u.encDescriptor;c.changeTree=u,c.ref=u.ref,c.encoder=d.encoder,c.filter=d.filter,c.metadata=d.metadata,c.treeIsFiltered=u.isFiltered,c.isSchema=d.isSchema,c.filterBitmask=d.filterBitmask,c.tags=d.tags,c.structSwitchEmitted=!1,c.isRootTree=u===a,c.shouldEmitSwitch=o||e.offset>i||!c.isRootTree,h.forEachWithCtx(c,cm)}return!s&&!o&&this.root.activeViews.size===0&&this.root.streamTrees.size>0&&this._emitStreamBroadcast(n,e),e.offset>n.byteLength?(n=this._resizeBuffer(n,e.offset),e.offset=i,this._encodeChannel(e,t,n,i,s)):n.subarray(0,e.offset)}encodeFullSync(e,t,n,i,s=e.offset){this.root.pendingFilterRefresh.length>0&&Hu(this.root);const o=i!==void 0,a=this.state[Q],c=this._encodeCtx;return c.self=this,c.buffer=t,c.it=e,c.view=i,c.isEncodeAll=!0,c.hasView=o,c.emitFiltered=n,c.gen=++this._fullSyncGen,c.initialOffset=s,c.rootChangeTree=a,am(c,a),e.offset>t.byteLength?(t=this._resizeBuffer(t,e.offset),e.offset=s,this.encodeFullSync(e,t,n,i,s)):t.subarray(0,e.offset)}_resizeBuffer(e,t){const n=Math.ceil(t/ui.BUFFER_SIZE)*ui.BUFFER_SIZE;console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(n/1024)} * 1024; // ${Math.round(n/1024)} KB
`);const i=new Uint8Array(n);return i.set(e),e===this.sharedBuffer&&(this.sharedBuffer=i),i}encodeAll(e={offset:0},t=this.sharedBuffer){return this.encodeFullSync(e,t,!1)}encodeAllView(e,t,n,i=this.sharedBuffer){const s=n.offset;return i=this.encodeFullSync(n,i,!0,e,s),Gc(i.subarray(0,t),i.subarray(s,n.offset))}ensureCapacity(e,t){if(t+ui.BUFFER_SIZE<=e.byteLength)return e;const n=Math.ceil((t+ui.BUFFER_SIZE)/ui.BUFFER_SIZE)*ui.BUFFER_SIZE,i=new Uint8Array(n);return i.set(e.subarray(0,t)),e===this.sharedBuffer&&(this.sharedBuffer=i),i}encodeView(e,t,n,i=this.sharedBuffer){const s=n.offset;this._emitStreamPriority(e);for(const o of e.changes.keys()){const a=e.changes.get(o),c=this.root.changeTrees[o];if(c===void 0){e.changes.delete(o);continue}if(a.size===0)continue;const l=c.encDescriptor,f=l.encoder,u=l.metadata,h=c.ref,d=c.refTarget;i=this.ensureCapacity(i,n.offset),i[n.offset++]=br&255,st.number(i,h[Ke],n);for(const[g,_]of a){let m;if(g===E_){const b=d.tmpItems,v=d.deletedIndexes;for(let C=0;C<b.length;C++)b[C]===void 0||v[C]===!0||f(this,i,c,C,me.ADD,n,!1,!0,u);continue}if(typeof g=="number")m=g;else{const b=g.indexInParent(h);if(b===void 0)continue;if(m=b,_===me.ADD&&c.getChange(m)===me.DELETE){e.changes.delete(g.ref[Ke]);continue}}const y=d[Pt](m)!==void 0&&_||me.DELETE;f(this,i,c,m,y,n,!1,!0,u)}}return e.changes.clear(),i=this.encode(n,e,i),Gc(i.subarray(0,t),i.subarray(s,n.offset))}encodeUnreliableView(e,t,n,i=this.sharedBuffer){const s=n.offset;return i=this.encodeUnreliable(n,e,i,s),Gc(i.subarray(0,t),i.subarray(s,n.offset))}_emitStreamBroadcast(e,t){const n=this.root.streamTrees;for(const i of n){const s=i,o=s[Q],a=s[Ke];if(a===void 0)continue;const c=s._stream,l=c.broadcastDeletes,f=c.broadcastPending,u=c.sentBroadcast,h=l.size>0,d=f.size>0,g=o.encDescriptor,_=g.encoder,m=g.metadata;if(h||d){if(e[t.offset++]=br&255,st.number(e,a,t),h){for(const C of l)_(this,e,o,C,me.DELETE,t,!1,!1,m);l.clear()}const p=c.maxPerTick,y=[];let b=0;const v=[];for(const C of f){if(b>=p)break;const R=s[Pt](C);if(R===void 0){v.push(C);continue}_(this,e,o,C,me.ADD,t,!1,!1,m),u.add(C),y.push(R),v.push(C),b++}for(const C of v)f.delete(C);for(const C of y){const R=C[Q];if(R===void 0)continue;const w=C[Ke];if(w===void 0)continue;e[t.offset++]=br&255,st.number(e,w,t);const A=R.encDescriptor,S=A.encoder,x=A.metadata;R.forEachLive(F=>{mt.hasUnreliableAtIndex(x,F)||S(this,e,R,F,me.ADD,t,!1,!1,x)})}}for(const p of u){const y=s[Pt](p);if(y===void 0)continue;const b=y[Q];if(b===void 0||!b.has())continue;const v=y[Ke];if(v===void 0)continue;e[t.offset++]=br&255,st.number(e,v,t);const C=b.encDescriptor,R=C.encoder,w=C.metadata;b.forEach((A,S)=>{A<0||mt.hasUnreliableAtIndex(w,A)||R(this,e,b,A,S,t,!1,!1,w)})}}}_emitStreamPriority(e){var i;const t=this.root.streamTrees;if(t.size===0)return;const n=e.id;for(const s of t){const o=s,a=o._stream,c=a.pendingByView.get(n);if(c===void 0||c.size===0)continue;const l=(i=a.priorityByView)==null?void 0:i.get(n),f=l!==void 0,u=a.priority,h=a.maxPerTick,d=[],g=[];if(f||u!==void 0){const p=[],y=[];let b=0;for(const v of c){const C=o[Pt](v);if(C===void 0){g.push(v);continue}const R=f?l(C):u(e,C);if(b<h){let w=b++;for(;w>0&&y[w-1]<R;)y[w]=y[w-1],p[w]=p[w-1],w--;y[w]=R,p[w]=v}else if(R>y[h-1]){let w=h-1;for(;w>0&&y[w-1]<R;)y[w]=y[w-1],p[w]=p[w-1],w--;y[w]=R,p[w]=v}}for(let v=0;v<b;v++)d.push(p[v])}else for(const p of c){if(d.length>=h)break;d.push(p)}for(const p of g)c.delete(p);const _=d.length;let m=a.sentByView.get(n);m===void 0&&(m=new Set,a.sentByView.set(n,m));for(let p=0;p<_;p++){const y=d[p],b=o[Pt](y);if(b===void 0){c.delete(y);continue}e._addImmediate(b);const v=b[Q];if(v!==void 0){const C=b[Ke];let R=e.changes.get(C);R===void 0&&(R=new Map,e.changes.set(C,R));const w=v.metadata;v.forEachLive(A=>{mt.hasUnreliableAtIndex(w,A)||R.set(A,me.ADD)})}c.delete(y),m.add(y)}}}discardChanges(){const e=this.root.changes;let t=e.next;const n=this.root;for(;t;){const i=t.next;t.changeTree.endEncode(),n.releaseNode(t),t=i}e.next=void 0,e.tail=void 0}discardUnreliableChanges(){const e=this.root.unreliableChanges;let t=e.next;const n=this.root;for(;t;){const i=t.next;t.changeTree.endEncodeUnreliable(),n.releaseNode(t),t=i}e.next=void 0,e.tail=void 0}tryEncodeTypeId(e,t,n,i){const s=this.context.getTypeId(t),o=this.context.getTypeId(n);if(o===void 0){console.warn(`@colyseus/schema WARNING: Class "${n.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);return}s!==o&&(e[i.offset++]=Rp&255,st.number(e,o,i))}get hasChanges(){return this.root.changes.next!==void 0}get hasUnreliableChanges(){return this.root.unreliableChanges.next!==void 0}};L(ui,"BUFFER_SIZE",16*1024);let Za=ui;class Zu extends Error{constructor(e){super(e),this.name="DecodingWarning"}}const Qu={value:0,enumerable:!1,writable:!0};class w_{constructor(){L(this,"refs",new Map);L(this,"refCount",{});L(this,"deletedRefs",new Set);L(this,"callbacks",{});L(this,"nextUniqueId",0)}getNextUniqueId(){return this.nextUniqueId++}addRef(e,t,n=!0){this.refs.set(e,t),t[Ke]===void 0?(Qu.value=e,Object.defineProperty(t,Ke,Qu)):t[Ke]!==e&&(t[Ke]=e),n&&(this.refCount[e]=(this.refCount[e]||0)+1),this.deletedRefs.has(e)&&this.deletedRefs.delete(e)}removeRef(e){const t=this.refCount[e];if(t===void 0){try{throw new Zu("trying to remove refId that doesn't exist: "+e)}catch(n){console.warn(n)}return}if(t===0){try{const n=this.refs.get(e);throw new Zu(`trying to remove refId '${e}' with 0 refCount (${n.constructor.name}: ${JSON.stringify(n)})`)}catch(n){console.warn(n)}return}(this.refCount[e]=t-1)<=0&&this.deletedRefs.add(e)}clearRefs(){this.refs.clear(),this.deletedRefs.clear(),this.callbacks={},this.refCount={}}garbageCollectDeletedRefs(){this.deletedRefs.forEach(e=>{if(this.refCount[e]>0)return;const t=this.refs.get(e),n=t.constructor[Symbol.metadata];if(n!=null)for(const i in n){const s=n[i].name,o=t[s];if(typeof o=="object"&&o){const a=o[Ke];a!==void 0&&!this.deletedRefs.has(a)&&this.removeRef(a)}}else typeof t[nt]=="function"&&Array.from(t.values()).forEach(i=>{const s=i[Ke];s!==void 0&&!this.deletedRefs.has(s)&&this.removeRef(s)});this.refs.delete(e),delete this.refCount[e],delete this.callbacks[e]}),this.deletedRefs.clear()}addCallback(e,t,n){if(e===void 0){const i=typeof t=="number"?me[t]:t;throw new Error(`Can't addCallback on '${i}' (refId is undefined)`)}return this.callbacks[e]||(this.callbacks[e]={}),this.callbacks[e][t]||(this.callbacks[e][t]=[]),this.callbacks[e][t].push(n),()=>this.removeCallback(e,t,n)}removeCallback(e,t,n){var s,o,a;const i=(a=(o=(s=this.callbacks)==null?void 0:s[e])==null?void 0:o[t])==null?void 0:a.indexOf(n);i!==void 0&&i!==-1&&y_(this.callbacks[e][t],i)}}class Qa{constructor(e,t){L(this,"context");L(this,"state");L(this,"root");L(this,"currentRefId",0);L(this,"triggerChanges");L(this,"resyncVisited",null);L(this,"resyncDamaged",!1);this.setState(e),this.context=t||new Lr(e.constructor)}setState(e){this.state=e,this.root=new w_,this.root.addRef(0,e)}decode(e,t={offset:0},n=this.state){var c,l,f;const i=this.triggerChanges!==void 0?[]:null,s=this.root,o=e.byteLength;let a=n.constructor[ni];for(this.currentRefId=0;t.offset<o;){if(e[t.offset]==br){t.offset++,(c=n[qa])==null||c.call(n);const h=ht.number(e,t),d=s.refs.get(h);d?(n=d,a=n.constructor[ni],this.currentRefId=h):(console.error(`"refId" not found: ${h}`,{previousRef:n,previousRefId:this.currentRefId}),console.warn("Please report this issue to the developers."),this.skipCurrentStructure(e,t,o));continue}if(a(this,e,t,n,i)===sm){console.warn("@colyseus/schema: definition mismatch"),this.skipCurrentStructure(e,t,o);continue}}return(l=n[qa])==null||l.call(n),this.resyncVisited!==null&&K0(this,i),i!==null&&((f=this.triggerChanges)==null||f.call(this,i)),s.garbageCollectDeletedRefs(),i}decodeResync(e,t={offset:0}){this.resyncVisited=new Map,this.resyncDamaged=!1;try{return this.decode(e,t)}finally{this.resyncVisited=null}}skipCurrentStructure(e,t,n){this.resyncVisited!==null&&(this.resyncDamaged=!0);const i={offset:t.offset};for(;t.offset<n&&!(e[t.offset]===br&&(i.offset=t.offset+1,this.root.refs.has(ht.number(e,i))));)t.offset++}getInstanceType(e,t,n){let i;if(e[t.offset]===Rp){t.offset++;const s=ht.number(e,t);i=this.context.get(s)}return i||n}createInstanceOfType(e){return e.initializeForDecoder()}removeChildRefs(e,t){const n=typeof e[nt]!="string",i=e[Ke];e.forEach((s,o)=>{t==null||t.push({ref:e,refId:i,op:me.DELETE,field:o,value:void 0,previousValue:s}),n&&this.root.removeRef(s[Ke])})}}const lm=ko({min:yn.float64(),max:yn.float64(),bits:yn.uint8(),mode:yn.uint8()},"QuantizedDescriptor"),fm=ko({name:yn.string(),type:yn.string(),referencedType:yn.number(),childPrimitive:yn.string(),quantized:yn.ref(lm).optional()},"ReflectionField"),um=ko({id:yn.number(),extendsId:yn.number(),fields:yn.array(fm)},"ReflectionType"),Bi=ko({types:yn.array(um),rootType:yn.number()},"Reflection");Bi.encode=function(r,e={offset:0}){const t=r.context,n=new Bi,i=new Za(n),s=t.schemas.get(r.state.constructor);s>0&&(n.rootType=s);const o=new Set,a={},c=f=>{if(f.extendsId===void 0||o.has(f.extendsId)){o.add(f.id),n.types.push(f);const u=a[f.id];u!==void 0&&(delete a[f.id],u.forEach(h=>c(h)))}else a[f.extendsId]===void 0&&(a[f.extendsId]=[]),a[f.extendsId].push(f)};t.schemas.forEach((f,u)=>{var _;const h=new um;h.id=Number(f);const d=Object.getPrototypeOf(u);d!==Ot&&(h.extendsId=t.schemas.get(d));const g=u[Symbol.metadata];if(g!==d[Symbol.metadata]){const m=(_=g[nn])!=null?_:-1;for(let p=0;p<=m;p++){const y=g[p];if(y===void 0)continue;const b=y.name;if(!Object.prototype.hasOwnProperty.call(g,b))continue;const v=new fm;v.name=b;let C;if(typeof y.type=="string")C=y.type;else if(Ir(y.type)){const R=y.type.quantized;C="quantized";const w=new lm;w.min=R.min,w.max=R.max,w.bits=R.bits,w.mode=R.wrap?1:0,v.quantized=w}else{let R;Ot.is(y.type)?(C="ref",R=y.type):(C=Object.keys(y.type)[0],typeof y.type[C]=="string"?v.childPrimitive=y.type[C]:R=y.type[C]),v.referencedType=R?t.getTypeId(R):-1}v.type=C,h.fields.push(v)}}c(h)});for(const f in a)a[f].forEach(u=>n.types.push(u));return i.encodeAll(e).slice(0,e.offset)};Bi.decode=function(r,e){const t=new Bi;new Qa(t).decode(r,e);const i=new Lr;t.types.forEach(a=>{var f;const c=(f=i.get(a.extendsId))!=null?f:Ot,l=class extends c{};Lr.register(l),i.add(l,a.id)},{});const s=(a,c,l)=>{c.fields.forEach((f,u)=>{var d;const h=l+u;if(f.quantized!==void 0){const g=f.quantized;mt.addField(a,h,f.name,{quantized:jf({min:g.min,max:g.max,bits:g.bits,mode:g.mode===1?"wrap":"clamp"})})}else if(f.referencedType!==void 0){const g=f.type,_=(d=i.get(f.referencedType))!=null?d:f.childPrimitive;g==="ref"?mt.addField(a,h,f.name,_):mt.addField(a,h,f.name,{[g]:_})}else mt.addField(a,h,f.name,f.type)})};t.types.forEach(a=>{const c=i.get(a.id),l=mt.initialize(c),f=[];let u=a;do f.push(u),u=t.types.find(d=>d.id===u.extendsId);while(u);let h=0;f.reverse().forEach(d=>{s(l,d,h),h+=d.fields.length})});const o=new(i.get(t.rootType||0));return new Qa(o,i)};Bi.makeEncodable=function(r){const e=r[Symbol.metadata];if(!e)return r;const t=e[nn];if(t===void 0)return r;for(let n=0;n<=t;n++){const i=e[n];i&&mt.defineField(r,e,n,i.name,i.type)}return Object.prototype.hasOwnProperty.call(r,ho)&&delete r[ho],r};zi("map",{constructor:nr});zi("array",{constructor:tr});zi("set",{constructor:So});zi("collection",{constructor:yo});const eh=256,Vc=5,Mr=class Mr{constructor(e,t={}){L(this,"instance");L(this,"mode");L(this,"historySize");L(this,"_desc");L(this,"_numFields");L(this,"_slots");L(this,"_slotLens");L(this,"_slotHead",0);L(this,"_slotCount",0);L(this,"_outBuffer");L(this,"_seq",0);L(this,"_encoder");var i,s,o;this.instance=e,this.mode=(i=t.mode)!=null?i:"reliable",this.historySize=this.mode==="unreliable"?Math.max(1,(s=t.historySize)!=null?s:3):1,this._desc=Zp(e);const n=(o=this._desc.metadata)==null?void 0:o[nn];if(n===void 0)throw new Error(`InputEncoder: '${e.constructor.name}' has no fields`);this._numFields=n;for(let a=0;a<=n;a++)if(this._desc.names[a]!==void 0&&this._desc.encoders[a]===void 0)throw new Error(`InputEncoder: non-primitive field '${this._desc.names[a]}' on '${e.constructor.name}' is not supported. Use Encoder for state containing refs/collections.`);if(this.mode==="unreliable"){this._slots=new Array(this.historySize),this._slotLens=new Array(this.historySize).fill(0);for(let a=0;a<this.historySize;a++)this._slots[a]=new Uint8Array(eh);this._outBuffer=new Uint8Array((eh+Vc)*this.historySize)}this._encoder=new Za(e)}get seq(){return this._seq}encode(){const e=this._produceDelta();return this.mode==="reliable"?e:this._pushAndEmitRing(e)}reset(){this._slotHead=0,this._slotCount=0,this._encoder.discardChanges();const e=this.instance[Q],t=this.instance[Fn];for(let n=0;n<=this._numFields;n++)t[n]===void 0||t[n]===null||e.markDirty(n)}copyInto(e){const t=this.instance[Fn],n=e[Fn];for(let i=0;i<=this._numFields;i++)n[i]=t[i]}_produceDelta(){const e=this._encoder.encode();return this._encoder.discardChanges(),e}_pushAndEmitRing(e){this._seq++;let t=this._slots[this._slotHead];return e.length>t.byteLength&&(t=this._slots[this._slotHead]=Mr._grow(t,e.length,"unreliable ring slot")),t.set(e),this._slotLens[this._slotHead]=e.length,this._slotHead=(this._slotHead+1)%this.historySize,this._slotCount<this.historySize&&this._slotCount++,this._emitRing()}_emitRing(){const e=this._seq-this._slotCount+1;let t=Vc;for(let o=0;o<this._slotCount;o++)t+=this._slotLens[o]+Vc;let n=this._outBuffer;t>n.byteLength&&(n=this._outBuffer=Mr._grow(n,t,"unreliable output packet"));const i={offset:0};st.number(n,e,i);const s=(this._slotHead-this._slotCount+this.historySize)%this.historySize;for(let o=0;o<this._slotCount;o++){const a=(s+o)%this.historySize,c=this._slotLens[a];st.number(n,c,i),n.set(this._slots[a].subarray(0,c),i.offset),i.offset+=c}return n.subarray(0,i.offset)}static _grow(e,t,n){const i=Math.max(t,e.byteLength*2);return Mr._warned||(Mr._warned=!0,console.warn(`@colyseus/schema/input: InputEncoder buffer overflow in ${n}. Growing to ${i} bytes.`)),new Uint8Array(i)}};L(Mr,"_warned",!1);let Ol=Mr;function ei(){return typeof performance!="undefined"?performance.now():Date.now()}const T_=typeof WeakRef!="undefined"?r=>new WeakRef(r):r=>({deref:()=>r}),A_=64;function R_(r,e){const t=globalThis;let n=t.__colyseusDebug;if(!n){const i=[];n=t.__colyseusDebug={__buffer:i,publish(s,o){i.push([s,T_(o)]),i.length>A_&&i.shift()}}}n.publish(r,e)}function C_(){if(typeof globalThis=="undefined")return!1;const r=globalThis.__colyseusDebug;return r!=null&&r.__buffer===void 0}var wp;const D_=(wp=Symbol.metadata)!=null?wp:Symbol.for("Symbol.metadata");function P_(r){return r.constructor[D_]}const Bl=9,U_=Bl,I_=(r,e)=>(e?2:1)*(Bl+4+Bl*r),_n=class _n{constructor(e,t,n,i){L(this,"data");L(this,"_host");L(this,"_encoder");L(this,"_scratch",new Uint8Array(2048));L(this,"_framed",null);L(this,"_sentCount",0);L(this,"_lastProcessed",0);L(this,"_epoch",0);L(this,"_sendTimes");L(this,"_inputBufferSize");L(this,"_inputBuffer",null);L(this,"_reckonTimes",null);L(this,"_pendingReckon",0);L(this,"_lastStamp",0);L(this,"_stampRing",null);L(this,"_renderDeltaRing",null);L(this,"_ringSlots",0);L(this,"_warnedUnknownKeys",null);L(this,"_stampRender",!1);L(this,"_stampReckon",!1);L(this,"_allowRewind");L(this,"_sendListeners",null);L(this,"_renderDelay",0);L(this,"_renderDelayExplicit",!1);L(this,"_renderDelayProvider");L(this,"_tickRate");L(this,"_patchRate");L(this,"_subSteps",1);var a,c,l,f,u;this._host=e,this.data=t,this._encoder=n,this._stampRender=(a=i==null?void 0:i.stampRender)!=null?a:!1,this._stampReckon=(c=i==null?void 0:i.stampReckon)!=null?c:!1,this._allowRewind=i==null?void 0:i.allowRewind,this._allowRewind!==void 0&&n.mode==="unreliable"&&!_n._warnedAllowRewindIgnored&&(_n._warnedAllowRewindIgnored=!0,console.warn('@colyseus/sdk: `allowRewind` is ignored on `mode:"unreliable"` — a packet stamps its whole redundancy ring or none of it, so excluding one input would cost bandwidth rather than save it. Use `mode:"reliable"` to gate the lag-comp stamp per input.')),this._renderDelay=(l=i==null?void 0:i.renderDelay)!=null?l:0,this._renderDelayExplicit=(i==null?void 0:i.renderDelay)!==void 0,this._tickRate=i==null?void 0:i.tickRate,this._patchRate=i==null?void 0:i.patchRate,this._subSteps=(f=i==null?void 0:i.subSteps)!=null?f:1;const s=this._tickRate?1e3/this._tickRate:1e3/60,o=_n.BUFFER_RTT_BUDGET_MS+((u=this._patchRate)!=null?u:0);this._inputBufferSize=Math.max(_n.BUFFER_FLOOR,Math.ceil(o/s*_n.BUFFER_HEADROOM)),this._sendTimes=new Float64Array(this._inputBufferSize)}get mode(){return this._encoder.mode}get tickRate(){return this._tickRate}get stepSeconds(){return this._tickRate?1/this._tickRate:void 0}get stepMs(){return this._tickRate?1e3/this._tickRate:void 0}get patchRate(){return this._patchRate}get subSteps(){return this._subSteps}get subStepSeconds(){return this._tickRate?1/this._tickRate/this._subSteps:void 0}get subStepMs(){return this._tickRate?1e3/this._tickRate/this._subSteps:void 0}get lastProcessed(){return this._lastProcessed}get sentCount(){return this._sentCount}get pendingCount(){return this._sentCount-this._lastProcessed}get replayBufferSize(){return this._inputBufferSize}get epoch(){return this._epoch}at(e){if(this._inputBuffer!==null&&!(e<=this._lastProcessed||e>this._sentCount)){if(this._sentCount-e>=this._inputBufferSize){_n._warnedBufferOverflow||(_n._warnedBufferOverflow=!0,console.warn(`@colyseus/sdk: input replay buffer (${this._inputBufferSize}) overflowed — RTT exceeds its budget at this input rate; reconciliation may drift.`));return}return this._inputBuffer[e%this._inputBufferSize]}}reckonTimeAt(e){return this._reckonTimes===null||e<=this._lastProcessed||e>this._sentCount||this._sentCount-e>=this._inputBufferSize?0:this._reckonTimes[e%this._inputBufferSize]}reset(){this._encoder.reset(),this._sentCount=this._lastProcessed=this._encoder.seq,this._framed=null,this._lastStamp=0,this._ringSlots=0,this._sendTimes.fill(0),this._epoch++}bindRenderDelay(e){this._renderDelayExplicit||(this._renderDelayProvider=e)}_resolveRenderDelay(){return this._renderDelayProvider?this._renderDelayProvider():this._renderDelay}_warnUnknownFields(){var t,n;const e=P_(this.data);if(e)for(const i of Object.keys(this.data))e[i]!==void 0||(t=this._warnedUnknownKeys)!=null&&t.has(i)||(((n=this._warnedUnknownKeys)!=null?n:this._warnedUnknownKeys=new Set).add(i),console.warn(`@colyseus/sdk input: "${i}" is not a declared field on ${this.data.constructor.name} — the write is never encoded or sent. Declare it with @type(...) on the input schema, or remove the write.`))}send(){const e=this._host.connection;if(!(e!=null&&e.isOpen))return 0;C_()&&this._warnUnknownFields();const t=this._encoder.encode(),n=this._encoder.mode==="reliable",i=this._stampReckon||this._stampRender,s=i&&n&&(this._allowRewind===void 0||this._allowRewind(this.data)),o=i&&!n,a=this._stampReckon&&this._stampRender,l=1+(s?U_+(a?2:0):o?I_(this._encoder.historySize,a):0)+t.length;l>this._scratch.byteLength&&(this._scratch=new Uint8Array(Math.max(l,this._scratch.byteLength*2)),this._framed=null),this._scratch[0]=(n?Nt.ROOM_INPUT_RELIABLE:Nt.ROOM_INPUT_UNRELIABLE)|(s||o?Ll.TIMED:0);const f={offset:1};if(o)this._writeRingStamps(f);else if(s){const{stamp:g,renderDelta:_}=this._sampleStamp();st.number(this._scratch,g-this._lastStamp,f),this._lastStamp=g,a&&st.uint16(this._scratch,_,f)}else this._pendingReckon=0;this._scratch.set(t,f.offset);const u=f.offset+t.length;(this._framed===null||this._framed.byteLength!==u)&&(this._framed=this._scratch.subarray(0,u));const h=this._framed;let d;return n?(e.send(h),d=++this._sentCount):(e.sendUnreliable(h),d=this._sentCount=this._encoder.seq),this._recordSent(d),d}_writeRingStamps(e){var c,l;const{stamp:t,renderDelta:n}=this._sampleStamp(),i=this._encoder.historySize,s=this._encoder.seq,o=this._ringSlots=Math.min(this._ringSlots+1,i),a=(c=this._stampRing)!=null?c:this._stampRing=new Float64Array(i);if(a[s%i]=t,st.number(this._scratch,o,e),st.uint32(this._scratch,t,e),this._writeSeriesDeltas(a,s,o,e),this._stampReckon&&this._stampRender){const f=(l=this._renderDeltaRing)!=null?l:this._renderDeltaRing=new Uint16Array(i);f[s%i]=n,st.uint16(this._scratch,n,e),this._writeSeriesDeltas(f,s,o,e)}}_writeSeriesDeltas(e,t,n,i){const s=e.length;for(let o=1;o<n;o++)st.number(this._scratch,e[(t-o+1)%s]-e[(t-o)%s],i)}_sampleStamp(){var s,o,a,c;const e=this._host.clock,t=((o=(s=e==null?void 0:e.lastServerTime)==null?void 0:s.call(e))!=null?o:0)>0,n=t?Math.max(0,Math.round(e.serverNow()))>>>0:0,i=t?Math.min(65535,Math.max(0,Math.round(this._resolveRenderDelay()+((c=(a=e.smoothedRtt)==null?void 0:a.call(e))!=null?c:0)/2))):0;return this._pendingReckon=n,{stamp:this._stampReckon?n:n>i?n-i:0,renderDelta:i}}_recordSent(e){var n;if(this._inputBuffer===null){const i=this.data.constructor;this._inputBuffer=Array.from({length:this._inputBufferSize},()=>new i)}this._encoder.copyInto(this._inputBuffer[e%this._inputBufferSize]),this._sendTimes[e%this._inputBufferSize]=ei(),this._stampReckon&&(((n=this._reckonTimes)!=null?n:this._reckonTimes=new Float64Array(this._inputBufferSize))[e%this._inputBufferSize]=this._pendingReckon);const t=this._sendListeners;if(t!==null)for(let i=0;i<t.length;i++)t[i](e)}onSend(e){const t=this._sendListeners;return this._sendListeners=t!==null?[...t,e]:[e],()=>{const n=this._sendListeners;if(n===null)return;const i=n.indexOf(e);if(i<0)return;const s=n.slice();s.splice(i,1),this._sendListeners=s.length>0?s:null}}ackInput(e){if(e<=this._lastProcessed)return-1;const t=this._sentCount-e>=this._inputBufferSize;if(this._lastProcessed=e,t)return-1;const n=this._sendTimes[e%this._inputBufferSize];return n>0?ei()-n:-1}};L(_n,"BUFFER_FLOOR",64),L(_n,"BUFFER_RTT_BUDGET_MS",1e3),L(_n,"BUFFER_HEADROOM",1.5),L(_n,"_warnedBufferOverflow",!1),L(_n,"_warnedAllowRewindIgnored",!1);let kl=_n;const hm=Object.freeze({now:()=>ei(),serverNow:()=>ei(),renderNow:()=>ei(),rtt:()=>0,smoothedRtt:()=>0,jitter:()=>0,lastServerTime:()=>0,patchInterval:()=>0,setPatchInterval:r=>{},sample:(r,e)=>{}}),Lt=class Lt{constructor(){L(this,"_clockOffset",0);L(this,"_clockHasSample",!1);L(this,"_offsetCount",0);L(this,"_rttFloorT",[]);L(this,"_rttFloorV",[]);L(this,"_rtt",0);L(this,"_smoothedRtt",0);L(this,"_rttHasSample",!1);L(this,"_jitter",0);L(this,"_lastRecvTime",-1);L(this,"_lastServerTime",0);L(this,"_patchInterval",0);L(this,"_renderTau",Lt.RENDER_TAU);L(this,"_renderSn",0);L(this,"_renderSnAt",0)}serverNow(){return ei()+this._clockOffset}renderNow(){const e=this.serverNow();if(this._renderTau<=0)return e;const t=ei();if(this._renderSn===0)return this._renderSn=e,this._renderSnAt=t,this._renderSn;const n=Math.min(t-this._renderSnAt,100);return n<.5?this._renderSn:(this._renderSnAt=t,this._renderSn+=n,Math.abs(e-this._renderSn)>Lt.RENDER_SNAP?(this._renderSn=e,this._renderSn):(this._renderSn+=(e-this._renderSn)*(1-Math.exp(-n/this._renderTau)),this._renderSn))}setRenderTau(e){this._renderTau=e>0?e:0}now(){return ei()}rtt(){return this._rtt}smoothedRtt(){return this._smoothedRtt}jitter(){return this._jitter}lastServerTime(){return this._lastServerTime}patchInterval(){return this._patchInterval}setPatchInterval(e){this._patchInterval=e>0?e:0}sample(e,t){const n=ei(),i=Lt.EMA_ALPHA,s=this._patchInterval;if(this._lastRecvTime>=0&&s>0){const a=n-this._lastRecvTime,c=Math.round(a/s);c>=1&&c<=Lt.JITTER_STALL_X&&(this._jitter+=(Math.abs(a-c*s)-this._jitter)*Lt.JITTER_GAIN)}this._lastRecvTime=n,this._lastServerTime=e,(t<0||this._smoothedRtt>0&&t>this._smoothedRtt*Lt.RTT_OUTLIER_X)&&(t=-1);const o=t>=0?e+t/2-n:e-n;if(!this._clockHasSample)this._clockOffset=o,this._clockHasSample=!0,t>=0&&(this.pushRttFloor(t,n),this._offsetCount=1);else if(t>=0){const a=this.pushRttFloor(t,n),c=this._offsetCount<Lt.RTT_GATE_WARMUP;this._offsetCount++,(c||t<=a*Lt.RTT_GATE_FACTOR)&&(this._clockOffset=this._clockOffset*(1-i)+o*i)}t>=0&&(this._rtt=t,this._rttHasSample?this._smoothedRtt=this._smoothedRtt*(1-i)+t*i:(this._smoothedRtt=t,this._rttHasSample=!0))}pushRttFloor(e,t){const n=this._rttFloorT,i=this._rttFloorV;for(;i.length>0&&i[i.length-1]>=e;)i.pop(),n.pop();i.push(e),n.push(t);const s=t-Lt.RTT_GATE_WINDOW;for(;n.length>0&&n[0]<s;)n.shift(),i.shift();return i[0]}reset(){this._clockOffset=0,this._clockHasSample=!1,this._offsetCount=0,this._rtt=0,this._smoothedRtt=0,this._rttHasSample=!1,this._jitter=0,this._lastRecvTime=-1,this._lastServerTime=0,this._rttFloorT.length=0,this._rttFloorV.length=0,this._renderSn=0,this._renderSnAt=0}};L(Lt,"EMA_ALPHA",.1),L(Lt,"RENDER_TAU",250),L(Lt,"RENDER_SNAP",250),L(Lt,"RTT_OUTLIER_X",4),L(Lt,"JITTER_GAIN",1/16),L(Lt,"JITTER_STALL_X",4),L(Lt,"RTT_GATE_FACTOR",1.2),L(Lt,"RTT_GATE_WINDOW",1e4),L(Lt,"RTT_GATE_WARMUP",30);let zl=Lt;var Rr,Yn,gs,bo,wo,To,Ao,Ro,Co,_s,Do,rc,dm;class Hc{constructor(e){At(this,rc);At(this,Rr);At(this,Yn);At(this,gs);At(this,bo);At(this,wo,!1);At(this,To);At(this,Ao,!1);At(this,Ro,!1);At(this,Co);At(this,_s);At(this,Do);Tt(this,Rr,e)}get patchRate(){return Je(this,_s)}applyReflection(e,t,n){const i=Bi.decode(e.subarray(0,n),t);Bi.makeEncodable(i.state.constructor),Tt(this,To,i.state.constructor),Je(this,Rr).clock===hm&&(Je(this,Rr).clock=new zl)}applyOptions(e,t){const n=e[t.offset++];Tt(this,Ao,(n&Js.RENDER_TIME)!==0),Tt(this,Ro,(n&Js.RECKON_TIME)!==0),n&Js.FIXED_TIMESTEP&&Tt(this,Co,ht.number(e,t)),n&Js.PATCH_RATE&&Tt(this,_s,ht.number(e,t)),n&Js.SUB_STEPS&&Tt(this,Do,ht.number(e,t))}ackInput(e){return Je(this,Yn)?Je(this,Yn).ackInput(e):-1}reset(){var e;(e=Je(this,Yn))==null||e.reset()}handle(e){var s;if(Je(this,Yn))return e!==void 0&&Xr(this,rc,dm).call(this,e),Je(this,Yn);const t=(s=e==null?void 0:e.type)!=null?s:Je(this,To);if(!t)throw new Error("room.input(): no input schema available. The server room must call `defineInput(YourInput)`, or you can pass `{ type: YourInput }` explicitly.");const n=new t,i=new Ol(n,e);return Tt(this,Yn,new kl(Je(this,Rr),n,i,{stampRender:Je(this,Ao),stampReckon:Je(this,Ro),renderDelay:e==null?void 0:e.renderDelay,allowRewind:e==null?void 0:e.allowRewind,tickRate:Je(this,Co),patchRate:Je(this,_s),subSteps:Je(this,Do)})),Tt(this,gs,e),Tt(this,bo,i),Je(this,Yn)}}Rr=new WeakMap,Yn=new WeakMap,gs=new WeakMap,bo=new WeakMap,wo=new WeakMap,To=new WeakMap,Ao=new WeakMap,Ro=new WeakMap,Co=new WeakMap,_s=new WeakMap,Do=new WeakMap,rc=new WeakSet,dm=function(e){var i,s,o;if(Je(this,wo))return;const t=Je(this,Yn),n=[];e.type!==void 0&&e.type!==((i=t.data)==null?void 0:i.constructor)&&n.push("type"),e.mode!==void 0&&e.mode!==t.mode&&n.push("mode"),e.historySize!==void 0&&t.mode==="unreliable"&&e.historySize!==Je(this,bo).historySize&&n.push("historySize"),e.renderDelay!==void 0&&e.renderDelay!==((s=Je(this,gs))==null?void 0:s.renderDelay)&&n.push("renderDelay"),e.allowRewind!==void 0!=(((o=Je(this,gs))==null?void 0:o.allowRewind)!==void 0)&&n.push("allowRewind"),n.length!==0&&(Tt(this,wo,!0),console.warn(`@colyseus/sdk: room.input() options ignored — the input handle was already created by an earlier call (first call wins). Differing: ${n.join(", ")}.`))};var Gl;try{Gl=new TextDecoder}catch{}var Le,Sn,$=0,vt={},ft,Zi,kn=0,gi=0,Ht,Li,Mn=[],ct,th={useRecords:!1,mapsAsObjects:!0};class pm{}const mm=new pm;mm.name="MessagePack 0xC1";var ir=!1,nh=2;class bs{constructor(e){e&&(e.useRecords===!1&&e.mapsAsObjects===void 0&&(e.mapsAsObjects=!0),e.sequential&&e.trusted!==!1&&(e.trusted=!0,!e.structures&&e.useRecords!=!1&&(e.structures=[],e.maxSharedStructures||(e.maxSharedStructures=0))),e.structures?e.structures.sharedLength=e.structures.length:e.getStructures&&((e.structures=[]).uninitialized=!0,e.structures.sharedLength=0),e.int64AsNumber&&(e.int64AsType="number")),Object.assign(this,e)}unpack(e,t){if(Le)return Sm(()=>(Hl(),this?this.unpack(e,t):bs.prototype.unpack.call(th,e,t)));!e.buffer&&e.constructor===ArrayBuffer&&(e=typeof Buffer!="undefined"?Buffer.from(e):new Uint8Array(e)),typeof t=="object"?(Sn=t.end||e.length,$=t.start||0):($=0,Sn=t>-1?t:e.length),gi=0,Zi=null,Ht=null,Le=e;try{ct=e.dataView||(e.dataView=new DataView(e.buffer,e.byteOffset,e.byteLength))}catch(n){throw Le=null,e instanceof Uint8Array?n:new Error("Source must be a Uint8Array or Buffer but was a "+(e&&typeof e=="object"?e.constructor.name:typeof e))}if(this instanceof bs){if(vt=this,this.structures)return ft=this.structures,oa(t);(!ft||ft.length>0)&&(ft=[])}else vt=th,(!ft||ft.length>0)&&(ft=[]);return oa(t)}unpackMultiple(e,t){let n,i=0;try{ir=!0;let s=e.length,o=this?this.unpack(e,s):_c.unpack(e,s);if(t){if(t(o,i,$)===!1)return;for(;$<s;)if(i=$,t(oa(),i,$)===!1)return}else{for(n=[o];$<s;)i=$,n.push(oa());return n}}catch(s){throw s.lastPosition=i,s.values=n,s}finally{ir=!1,Hl()}}_mergeStructures(e,t){this._onLoadedStructures&&(e=this._onLoadedStructures(e)),e=e||[],Object.isFrozen(e)&&(e=e.map(n=>n.slice(0)));for(let n=0,i=e.length;n<i;n++){let s=e[n];s&&(s.isShared=!0,n>=32&&(s.highByte=n-32>>5))}e.sharedLength=e.length;for(let n in t||[])if(n>=0){let i=e[n],s=t[n];s&&(i&&((e.restoreStructures||(e.restoreStructures=[]))[n]=i),e[n]=s)}return this.structures=e}decode(e,t){return this.unpack(e,t)}}function oa(r){try{if(!vt.trusted&&!ir){let t=ft.sharedLength||0;t<ft.length&&(ft.length=t)}let e;if(vt._readStruct&&Le[$]<64&&Le[$]>=32?(e=vt._readStruct(Le,$,Sn),Le=null,!(r&&r.lazy)&&e&&(e=e.toJSON()),$=Sn):e=Dt(),Ht&&($=Ht.postBundlePosition,Ht=null),ir&&(ft.restoreStructures=null),$==Sn)ft&&ft.restoreStructures&&ih(),ft=null,Le=null,Li&&(Li=null);else{if($>Sn)throw new Error("Unexpected end of MessagePack data");if(!ir){let t;try{t=JSON.stringify(e,(n,i)=>typeof i=="bigint"?`${i}n`:i).slice(0,100)}catch(n){t="(JSON view not available "+n+")"}throw new Error("Data read, but end of buffer not reached "+t)}}return e}catch(e){throw ft&&ft.restoreStructures&&ih(),Hl(),(e instanceof RangeError||e.message.startsWith("Unexpected end of buffer")||$>Sn)&&(e.incomplete=!0),e}}function ih(){for(let r in ft.restoreStructures)ft[r]=ft.restoreStructures[r];ft.restoreStructures=null}function Dt(){let r=Le[$++];if(r<160)if(r<128){if(r<64)return r;{let e=ft[r&63]||vt.getStructures&&gm()[r&63];return e?(e.read||(e.read=eu(e,r&63)),e.read()):r}}else if(r<144)if(r-=128,vt.mapsAsObjects){let e={};for(let t=0;t<r;t++){let n=vm();n==="__proto__"&&(n="__proto_"),e[n]=Dt()}return e}else{let e=new Map;for(let t=0;t<r;t++)e.set(Dt(),Dt());return e}else{r-=144;let e=new Array(r);for(let t=0;t<r;t++)e[t]=Dt();return vt.freezeData?Object.freeze(e):e}else if(r<192){let e=r-160;if(gi>=$)return Zi.slice($-kn,($+=e)-kn);if(gi==0&&Sn<140){let t=e<16?nu(e):_m(e);if(t!=null)return t}return Vl(e)}else{let e;switch(r){case 192:return null;case 193:return Ht?(e=Dt(),e>0?Ht[1].slice(Ht.position1,Ht.position1+=e):Ht[0].slice(Ht.position0,Ht.position0-=e)):mm;case 194:return!1;case 195:return!0;case 196:if(e=Le[$++],e===void 0)throw new Error("Unexpected end of buffer");return Wc(e);case 197:return e=ct.getUint16($),$+=2,Wc(e);case 198:return e=ct.getUint32($),$+=4,Wc(e);case 199:return lr(Le[$++]);case 200:return e=ct.getUint16($),$+=2,lr(e);case 201:return e=ct.getUint32($),$+=4,lr(e);case 202:if(e=ct.getFloat32($),vt.useFloat32>2){let t=iu[(Le[$]&127)<<1|Le[$+1]>>7];return $+=4,(t*e+(e>0?.5:-.5)>>0)/t}return $+=4,e;case 203:return e=ct.getFloat64($),$+=8,e;case 204:return Le[$++];case 205:return e=ct.getUint16($),$+=2,e;case 206:return e=ct.getUint32($),$+=4,e;case 207:return vt.int64AsType==="number"?(e=ct.getUint32($)*4294967296,e+=ct.getUint32($+4)):vt.int64AsType==="string"?e=ct.getBigUint64($).toString():vt.int64AsType==="auto"?(e=ct.getBigUint64($),e<=BigInt(2)<<BigInt(52)&&(e=Number(e))):e=ct.getBigUint64($),$+=8,e;case 208:return ct.getInt8($++);case 209:return e=ct.getInt16($),$+=2,e;case 210:return e=ct.getInt32($),$+=4,e;case 211:return vt.int64AsType==="number"?(e=ct.getInt32($)*4294967296,e+=ct.getUint32($+4)):vt.int64AsType==="string"?e=ct.getBigInt64($).toString():vt.int64AsType==="auto"?(e=ct.getBigInt64($),e>=BigInt(-2)<<BigInt(52)&&e<=BigInt(2)<<BigInt(52)&&(e=Number(e))):e=ct.getBigInt64($),$+=8,e;case 212:if(e=Le[$++],e==114)return lh(Le[$++]&63);{let t=Mn[e];if(t)return t.read?($++,t.read(Dt())):t.noBuffer?($++,t()):t(Le.subarray($,++$));throw new Error("Unknown extension "+e)}case 213:return e=Le[$],e==114?($++,lh(Le[$++]&63,Le[$++])):lr(2);case 214:return lr(4);case 215:return lr(8);case 216:return lr(16);case 217:return e=Le[$++],gi>=$?Zi.slice($-kn,($+=e)-kn):F_(e);case 218:return e=ct.getUint16($),$+=2,gi>=$?Zi.slice($-kn,($+=e)-kn):N_(e);case 219:return e=ct.getUint32($),$+=4,gi>=$?Zi.slice($-kn,($+=e)-kn):O_(e);case 220:return e=ct.getUint16($),$+=2,sh(e);case 221:return e=ct.getUint32($),$+=4,sh(e);case 222:return e=ct.getUint16($),$+=2,oh(e);case 223:return e=ct.getUint32($),$+=4,oh(e);default:if(r>=224)return r-256;throw r===void 0?tu():new Error("Unknown MessagePack token "+r)}}}const L_=/^[a-zA-Z_$][a-zA-Z\d_$]*$/;function eu(r,e){function t(){if(t.count++>nh){let i;try{i=r.read=new Function("r","return function(){return "+(vt.freezeData?"Object.freeze":"")+"({"+r.map(s=>s==="__proto__"?"__proto_:r()":L_.test(s)?s+":r()":"["+JSON.stringify(s)+"]:r()").join(",")+"})}")(Dt)}catch{return nh=1/0,t()}return r.read0=i,r.highByte===0&&(r.read=rh(e,r.read)),i()}let n={};for(let i=0,s=r.length;i<s;i++){let o=r[i];o==="__proto__"&&(o="__proto_"),n[o]=Dt()}return vt.freezeData?Object.freeze(n):n}return t.count=0,r.read0=t,r.highByte===0?rh(e,t):t}const rh=(r,e)=>function(){let t=Le[$++];if(t===0)return e();let n=r<32?-(r+(t<<5)):r+(t<<5),i=ft[n]||gm()[n];if(!i)throw new Error("Record id is not defined for "+n);return i.read||(i.read=eu(i,r)),i.read()};function gm(){let r=Sm(()=>(Le=null,vt.getStructures()));return ft=vt._mergeStructures(r,ft)}var Vl=zo,F_=zo,N_=zo,O_=zo;function zo(r){let e;if(r<16&&(e=nu(r)))return e;if(r>64&&Gl)return Gl.decode(Le.subarray($,$+=r));const t=$+r,n=[];for(e="";$<t;){const i=Le[$++];if(!(i&128))n.push(i);else if((i&224)===192)if(i<194||$>=t||(Le[$]&192)!==128)n.push(65533);else{const s=Le[$++]&63;n.push((i&31)<<6|s)}else if((i&240)===224){const s=$<t?Le[$]:0;if($>=t||(s&192)!==128||i===224&&s<160||i===237&&s>=160)n.push(65533);else if($++,$>=t||(Le[$]&192)!==128)n.push(65533);else{const o=Le[$++]&63;n.push((i&31)<<12|(s&63)<<6|o)}}else if((i&248)===240){const s=$<t?Le[$]:0;if(i>244||$>=t||(s&192)!==128||i===240&&s<144||i===244&&s>=144)n.push(65533);else if($++,$>=t||(Le[$]&192)!==128)n.push(65533);else{const o=Le[$++]&63;if($>=t||(Le[$]&192)!==128)n.push(65533);else{const a=Le[$++]&63;let c=(i&7)<<18|(s&63)<<12|o<<6|a;c-=65536,n.push(c>>>10&1023|55296),n.push(56320|c&1023)}}}else n.push(65533);n.length>=4096&&(e+=Vt.apply(String,n),n.length=0)}return n.length>0&&(e+=Vt.apply(String,n)),e}function tu(){let r=new Error("Unexpected end of MessagePack data");return r.incomplete=!0,r}function sh(r){if(r>Sn-$)throw tu();let e=new Array(r);for(let t=0;t<r;t++)e[t]=Dt();return vt.freezeData?Object.freeze(e):e}function oh(r){if(r>(Sn-$)/2)throw tu();if(vt.mapsAsObjects){let e={};for(let t=0;t<r;t++){let n=vm();n==="__proto__"&&(n="__proto_"),e[n]=Dt()}return e}else{let e=new Map;for(let t=0;t<r;t++)e.set(Dt(),Dt());return e}}var Vt=String.fromCharCode;function _m(r){let e=$,t=new Array(r);for(let n=0;n<r;n++){const i=Le[$++];if((i&128)>0){$=e;return}t[n]=i}return Vt.apply(String,t)}function nu(r){if(r<4)if(r<2){if(r===0)return"";{let e=Le[$++];if((e&128)>1){$-=1;return}return Vt(e)}}else{let e=Le[$++],t=Le[$++];if((e&128)>0||(t&128)>0){$-=2;return}if(r<3)return Vt(e,t);let n=Le[$++];if((n&128)>0){$-=3;return}return Vt(e,t,n)}else{let e=Le[$++],t=Le[$++],n=Le[$++],i=Le[$++];if((e&128)>0||(t&128)>0||(n&128)>0||(i&128)>0){$-=4;return}if(r<6){if(r===4)return Vt(e,t,n,i);{let s=Le[$++];if((s&128)>0){$-=5;return}return Vt(e,t,n,i,s)}}else if(r<8){let s=Le[$++],o=Le[$++];if((s&128)>0||(o&128)>0){$-=6;return}if(r<7)return Vt(e,t,n,i,s,o);let a=Le[$++];if((a&128)>0){$-=7;return}return Vt(e,t,n,i,s,o,a)}else{let s=Le[$++],o=Le[$++],a=Le[$++],c=Le[$++];if((s&128)>0||(o&128)>0||(a&128)>0||(c&128)>0){$-=8;return}if(r<10){if(r===8)return Vt(e,t,n,i,s,o,a,c);{let l=Le[$++];if((l&128)>0){$-=9;return}return Vt(e,t,n,i,s,o,a,c,l)}}else if(r<12){let l=Le[$++],f=Le[$++];if((l&128)>0||(f&128)>0){$-=10;return}if(r<11)return Vt(e,t,n,i,s,o,a,c,l,f);let u=Le[$++];if((u&128)>0){$-=11;return}return Vt(e,t,n,i,s,o,a,c,l,f,u)}else{let l=Le[$++],f=Le[$++],u=Le[$++],h=Le[$++];if((l&128)>0||(f&128)>0||(u&128)>0||(h&128)>0){$-=12;return}if(r<14){if(r===12)return Vt(e,t,n,i,s,o,a,c,l,f,u,h);{let d=Le[$++];if((d&128)>0){$-=13;return}return Vt(e,t,n,i,s,o,a,c,l,f,u,h,d)}}else{let d=Le[$++],g=Le[$++];if((d&128)>0||(g&128)>0){$-=14;return}if(r<15)return Vt(e,t,n,i,s,o,a,c,l,f,u,h,d,g);let _=Le[$++];if((_&128)>0){$-=15;return}return Vt(e,t,n,i,s,o,a,c,l,f,u,h,d,g,_)}}}}}function ah(){let r=Le[$++],e;if(r<192)e=r-160;else switch(r){case 217:e=Le[$++];break;case 218:e=ct.getUint16($),$+=2;break;case 219:e=ct.getUint32($),$+=4;break;default:throw new Error("Expected string")}return zo(e)}function Wc(r){return vt.copyBuffers?Uint8Array.prototype.slice.call(Le,$,$+=r):Le.subarray($,$+=r)}function lr(r){let e=Le[$++];if(Mn[e]){let t;return Mn[e](Le.subarray($,t=$+=r),n=>{$=n;try{return Dt()}finally{$=t}})}else throw new Error("Unknown extension type "+e)}var ch=new Array(4096);function vm(){let r=Le[$++];if(r>=160&&r<192){if(r=r-160,gi>=$)return Zi.slice($-kn,($+=r)-kn);if(!(gi==0&&Sn<180))return Vl(r)}else return $--,xm(Dt());let e=(r<<5^(r>1?ct.getUint16($):r>0?Le[$]:0))&4095,t=ch[e],n=$,i=$+r-3,s,o=0;if(t&&t.bytes==r){for(;n<i;){if(s=ct.getUint32(n),s!=t[o++]){n=1879048192;break}n+=4}for(i+=3;n<i;)if(s=Le[n++],s!=t[o++]){n=1879048192;break}if(n===i)return $=n,t.string;i-=3,n=$}for(t=[],ch[e]=t,t.bytes=r;n<i;)s=ct.getUint32(n),t.push(s),n+=4;for(i+=3;n<i;)s=Le[n++],t.push(s);let a=r<16?nu(r):_m(r);return a!=null?t.string=a:t.string=Vl(r)}function xm(r){if(typeof r=="string")return r;if(typeof r=="number"||typeof r=="boolean"||typeof r=="bigint")return r.toString();if(r==null)return r+"";if(vt.allowArraysInMapKeys&&Array.isArray(r)&&r.flat().every(e=>["string","number","boolean","bigint"].includes(typeof e)))return r.flat().toString();throw new Error(`Invalid property type for record: ${typeof r}`)}const lh=(r,e)=>{let t=Dt().map(xm),n=r;e!==void 0&&(r=r<32?-((e<<5)+r):(e<<5)+r,t.highByte=e);let i=ft[r];return i&&(i.isShared||ir)&&((ft.restoreStructures||(ft.restoreStructures=[]))[r]=i),ft[r]=t,t.read=eu(t,n),(t.read0||t.read)()};Mn[0]=()=>{};Mn[0].noBuffer=!0;Mn[66]=r=>{let e=r.byteLength%8||8,t=BigInt(r[0]&128?r[0]-256:r[0]);for(let n=1;n<e;n++)t<<=BigInt(8),t+=BigInt(r[n]);if(r.byteLength!==e){let n=new DataView(r.buffer,r.byteOffset,r.byteLength),i=(s,o)=>{let a=o-s;if(a<=40){let u=n.getBigUint64(s);for(let h=s+8;h<o;h+=8)u<<=BigInt(64),u|=n.getBigUint64(h);return u}let c=s+(a>>4<<3),l=i(s,c),f=i(c,o);return l<<BigInt((o-c)*8)|f};t=t<<BigInt((n.byteLength-e)*8)|i(e,n.byteLength)}return t};let fh={Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,AggregateError:typeof AggregateError=="function"?AggregateError:null};Mn[101]=()=>{let r=Dt();if(!fh[r[0]]){let e=Error(r[1],{cause:r[2]});return e.name=r[0],e}return fh[r[0]](r[1],{cause:r[2]})};Mn[105]=r=>{if(vt.structuredClone===!1)throw new Error("Structured clone extension is disabled");let e=ct.getUint32($-4);Li||(Li=new Map);let t=Le[$],n;t>=144&&t<160||t==220||t==221?n=[]:t>=128&&t<144||t==222||t==223?n=new Map:(t>=199&&t<=201||t>=212&&t<=216)&&Le[$+1]===115?n=new Set:n={};let i={target:n};Li.set(e,i);let s=Dt();if(i.used)Object.assign(n,s);else return i.target=s;if(n instanceof Map)for(let[o,a]of s.entries())n.set(o,a);if(n instanceof Set)for(let o of Array.from(s))n.add(o);return n};Mn[112]=r=>{if(vt.structuredClone===!1)throw new Error("Structured clone extension is disabled");let e=ct.getUint32($-4),t=Li.get(e);return t.used=!0,t.target};Mn[115]=()=>new Set(Dt());const ym=["Int8","Uint8","Uint8Clamped","Int16","Uint16","Int32","Uint32","Float32","Float64","BigInt64","BigUint64"].map(r=>r+"Array");let B_=typeof globalThis=="object"?globalThis:window;Mn[116]=r=>{let e=r[0],t=Uint8Array.prototype.slice.call(r,1).buffer,n=ym[e];if(!n){if(e===16)return t;if(e===17)return new DataView(t);throw new Error("Could not find typed array for code "+e)}return new B_[n](t)};Mn[120]=()=>{let r=Dt();return new RegExp(r[0],r[1])};const k_=[];Mn[98]=r=>{let e=(r[0]<<24)+(r[1]<<16)+(r[2]<<8)+r[3],t=$;return $+=e-r.length,Ht=k_,Ht=[ah(),ah()],Ht.position0=0,Ht.position1=0,Ht.postBundlePosition=$,$=t,Dt()};Mn[255]=r=>r.length==4?new Date((r[0]*16777216+(r[1]<<16)+(r[2]<<8)+r[3])*1e3):r.length==8?new Date(((r[0]<<22)+(r[1]<<14)+(r[2]<<6)+(r[3]>>2))/1e6+((r[3]&3)*4294967296+r[4]*16777216+(r[5]<<16)+(r[6]<<8)+r[7])*1e3):r.length==12?new Date(((r[0]<<24)+(r[1]<<16)+(r[2]<<8)+r[3])/1e6+((r[4]&128?-281474976710656:0)+r[6]*1099511627776+r[7]*4294967296+r[8]*16777216+(r[9]<<16)+(r[10]<<8)+r[11])*1e3):new Date("invalid");function Sm(r){vt&&vt._onSaveState&&vt._onSaveState();let e=Sn,t=$,n=kn,i=gi,s=Zi,o=Li,a=Ht,c=new Uint8Array(Le.slice(0,Sn)),l=ft,f=ft.slice(0,ft.length),u=vt,h=ir,d=r();return Sn=e,$=t,kn=n,gi=i,Zi=s,Li=o,Ht=a,Le=c,ir=h,ft=l,ft.splice(0,ft.length,...f),vt=u,ct=new DataView(Le.buffer,Le.byteOffset,Le.byteLength),d}function Hl(){Le=null,Li=null,ft=null}const iu=new Array(147);for(let r=0;r<256;r++)iu[r]=+("1e"+Math.floor(45.15-r*.30103));var _c=new bs({useRecords:!1});const uh=_c.unpack;_c.unpackMultiple;_c.unpack;let z_=new Float32Array(1);new Uint8Array(z_.buffer,0,4);bs.SUPPORTS_STRUCT_HOOKS=!0;let Fa;try{Fa=new TextEncoder}catch{}let Wl,Xl;const ws=typeof Buffer!="undefined",aa=ws?function(r){return Buffer.allocUnsafeSlow(r)}:Uint8Array,Em=ws?Buffer:Uint8Array,hh=ws?4294967296:2144337920;let oe,Qs,Mt,Z=0,Qt,Rt=null;const G_=21760,V_=/[\u0080-\uFFFF]/,qr=Symbol("record-id");class ru extends bs{constructor(e){super(e),this.offset=0;let t,n,i,s,o=Em.prototype.utf8Write?function(E,P){return oe.utf8Write(E,P,oe.byteLength-P)}:Fa&&Fa.encodeInto?function(E,P){return Fa.encodeInto(E,oe.subarray(P)).written}:!1,a=this;e||(e={});let c=e&&e.sequential,l=e.structures||e.saveStructures,f=e.maxSharedStructures;if(f==null&&(f=l?32:0),f>8160)throw new Error("Maximum maxSharedStructure is 8160");e.structuredClone&&e.moreTypes==null&&(this.moreTypes=!0);let u=e.maxOwnStructures;u==null&&(u=l?32:64),!this.structures&&e.useRecords!=!1&&(this.structures=[]);let h=f>32||u+f>64,d=f+64,g=f+u+64;if(g>8256)throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");let _=[],m=0,p=0;this.pack=this.encode=function(E,P){if(oe||(oe=new aa(8192),Mt=oe.dataView||(oe.dataView=new DataView(oe.buffer,0,8192)),Z=0),Qt=oe.length-10,Qt-Z<2048?(oe=new aa(oe.length),Mt=oe.dataView||(oe.dataView=new DataView(oe.buffer,0,oe.length)),Qt=oe.length-10,Z=0):Z=Z+7&2147483640,t=Z,P&Na&&(Z+=P&255),s=a.structuredClone?new Map:null,a.bundleStrings&&typeof E!="string"?(Rt=[],Rt.size=1/0):Rt=null,i=a.structures,i){i.uninitialized&&(i=a._mergeStructures(a.getStructures()));let U=i.sharedLength||0;if(U>f)throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to "+i.sharedLength);if(!i.transitions){i.transitions=Object.create(null);for(let B=0;B<U;B++){let z=i[B];if(!z)continue;let X,V=i.transitions;for(let N=0,q=z.length;N<q;N++){let te=z[N];X=V[te],X||(X=V[te]=Object.create(null)),V=X}V[qr]=B+64}this.lastNamedStructuresLength=U}c||(i.nextId=U+64)}n&&(n=!1);let O;try{a._writeStruct&&E&&typeof E=="object"?E.constructor===Object?S(E):E.constructor!==Map&&!Array.isArray(E)&&!Xl.some(B=>E instanceof B)?S(a.useToJSON!==!1&&E.toJSON?E.toJSON():E):v(E):v(E);let U=Rt;if(Rt&&ph(t,v,0),s&&s.idsToInsert){let B=s.idsToInsert.sort((N,q)=>N.offset>q.offset?1:-1),z=B.length,X=-1;for(;U&&z>0;){let N=B[--z].offset+t;N<U.stringsPosition+t&&X===-1&&(X=0),N>U.position+t?X>=0&&(X+=6):(X>=0&&(Mt.setUint32(U.position+t,Mt.getUint32(U.position+t)+X),X=-1),U=U.previous,z++)}X>=0&&U&&Mt.setUint32(U.position+t,Mt.getUint32(U.position+t)+X),Z+=B.length*6,Z>Qt&&x(Z),a.offset=Z;let V=H_(oe.subarray(t,Z),B);return s=null,V}return a.offset=Z,P&X_?(oe.start=t,oe.end=Z,oe):oe.subarray(t,Z)}catch(U){throw O=U,U}finally{if(i&&(y(),n&&a.saveStructures)){let U=i.sharedLength||0,B=oe.subarray(t,Z),z=(a._prepareStructures||W_)(i,a);if(!O)return a.saveStructures(z,z.isCompatible)===!1?(i.uninitialized=!0,a.pack(E,P)):(a.lastNamedStructuresLength=U,oe.length>1073741824&&(oe=null),B)}oe.length>1073741824&&(oe=null),P&q_&&(Z=t)}};const y=()=>{p<10&&p++;let E=i.sharedLength||0;if(i.length>E&&!c&&(i.length=E),m>1e4)i.transitions=null,p=0,m=0,_.length>0&&(_=[]);else if(_.length>0&&!c){for(let P=0,O=_.length;P<O;P++)_[P][qr]=0;_=[]}},b=E=>{var P=E.length;P<16?oe[Z++]=144|P:P<65536?(oe[Z++]=220,oe[Z++]=P>>8,oe[Z++]=P&255):(oe[Z++]=221,Mt.setUint32(Z,P),Z+=4);for(let O=0;O<P;O++)v(E[O])},v=E=>{Z>Qt&&(oe=x(Z));var P=typeof E,O;if(P==="string"){let U=E.length;if(Rt&&U>=4&&U<4096){if((Rt.size+=U)>G_){let V,N=(Rt[0]?Rt[0].length*3+Rt[1].length:0)+10;Z+N>Qt&&(oe=x(Z+N));let q;Rt.position?(q=Rt,oe[Z]=200,Z+=3,oe[Z++]=98,V=Z-t,Z+=4,ph(t,v,0),Mt.setUint16(V+t-3,Z-t-V)):(oe[Z++]=214,oe[Z++]=98,V=Z-t,Z+=4),Rt=["",""],Rt.previous=q,Rt.size=0,Rt.position=V}let X=V_.test(E);Rt[X?0:1]+=E,oe[Z++]=193,v(X?-U:U);return}let B;U<32?B=1:U<256?B=2:U<65536?B=3:B=5;let z=U*3;if(Z+z>Qt&&(oe=x(Z+z)),U<64||!o){let X,V,N,q=Z+B;for(X=0;X<U;X++)V=E.charCodeAt(X),V<128?oe[q++]=V:V<2048?(oe[q++]=V>>6|192,oe[q++]=V&63|128):(V&64512)===55296&&((N=E.charCodeAt(X+1))&64512)===56320?(V=65536+((V&1023)<<10)+(N&1023),X++,oe[q++]=V>>18|240,oe[q++]=V>>12&63|128,oe[q++]=V>>6&63|128,oe[q++]=V&63|128):(oe[q++]=V>>12|224,oe[q++]=V>>6&63|128,oe[q++]=V&63|128);O=q-Z-B}else O=o(E,Z+B);O<32?oe[Z++]=160|O:O<256?(B<2&&oe.copyWithin(Z+2,Z+1,Z+1+O),oe[Z++]=217,oe[Z++]=O):O<65536?(B<3&&oe.copyWithin(Z+3,Z+2,Z+2+O),oe[Z++]=218,oe[Z++]=O>>8,oe[Z++]=O&255):(B<5&&oe.copyWithin(Z+5,Z+3,Z+3+O),oe[Z++]=219,Mt.setUint32(Z,O),Z+=4),Z+=O}else if(P==="number")if(E>>>0===E)E<32||E<128&&this.useRecords===!1||E<64&&!this._writeStruct?oe[Z++]=E:E<256?(oe[Z++]=204,oe[Z++]=E):E<65536?(oe[Z++]=205,oe[Z++]=E>>8,oe[Z++]=E&255):(oe[Z++]=206,Mt.setUint32(Z,E),Z+=4);else if(E>>0===E)E>=-32?oe[Z++]=256+E:E>=-128?(oe[Z++]=208,oe[Z++]=E+256):E>=-32768?(oe[Z++]=209,Mt.setInt16(Z,E),Z+=2):(oe[Z++]=210,Mt.setInt32(Z,E),Z+=4);else{let U;if((U=this.useFloat32)>0&&E<4294967296&&E>=-2147483648){oe[Z++]=202,Mt.setFloat32(Z,E);let B;if(U<4||(B=E*iu[(oe[Z]&127)<<1|oe[Z+1]>>7])>>0===B){Z+=4;return}else Z--}oe[Z++]=203,Mt.setFloat64(Z,E),Z+=8}else if(P==="object"||P==="function")if(!E)oe[Z++]=192;else{if(s){let B=s.get(E);if(B){if(!B.id){let z=s.idsToInsert||(s.idsToInsert=[]);B.id=z.push(B)}oe[Z++]=214,oe[Z++]=112,Mt.setUint32(Z,B.id),Z+=4;return}else s.set(E,{offset:Z-t})}let U=E.constructor;if(U===Object)A(E);else if(U===Array)b(E);else if(U===Map)if(this.mapAsEmptyObject)oe[Z++]=128;else{O=E.size,O<16?oe[Z++]=128|O:O<65536?(oe[Z++]=222,oe[Z++]=O>>8,oe[Z++]=O&255):(oe[Z++]=223,Mt.setUint32(Z,O),Z+=4);for(let[B,z]of E)v(B),v(z)}else{for(let B=0,z=Wl.length;B<z;B++){let X=Xl[B];if(E instanceof X){let V=Wl[B];if(V.write){V.type&&(oe[Z++]=212,oe[Z++]=V.type,oe[Z++]=0);let H=V.write.call(this,E);H===E?Array.isArray(E)?b(E):A(E):v(H);return}let N=oe,q=Mt,te=Z;oe=null;let k;try{k=V.pack.call(this,E,H=>(oe=N,N=null,Z+=H,Z>Qt&&x(Z),{target:oe,targetView:Mt,position:Z-H}),v)}finally{N&&(oe=N,Mt=q,Z=te,Qt=oe.length-10)}k&&(k.length+Z>Qt&&x(k.length+Z),Z=dh(k,oe,Z,V.type));return}}if(Array.isArray(E))b(E);else{if(a.useToJSON!==!1&&E.toJSON){const B=E.toJSON();if(B!==E)return v(B)}if(P==="function")return v(this.writeFunction&&this.writeFunction(E));A(E)}}}else if(P==="boolean")oe[Z++]=E?195:194;else if(P==="bigint"){if(E<9223372036854776e3&&E>=-9223372036854776e3)oe[Z++]=211,Mt.setBigInt64(Z,E);else if(E<18446744073709552e3&&E>0)oe[Z++]=207,Mt.setBigUint64(Z,E);else if(this.largeBigIntToFloat)oe[Z++]=203,Mt.setFloat64(Z,Number(E));else{if(this.largeBigIntToString)return v(E.toString());if(this.useBigIntExtension||this.moreTypes){let U=E<0?BigInt(-1):BigInt(0),B;if(E>>BigInt(65536)===U){let z=BigInt(18446744073709552e3)-BigInt(1),X=[];for(;X.push(E&z),E>>BigInt(63)!==U;)E>>=BigInt(64);B=new Uint8Array(new BigUint64Array(X).buffer),B.reverse()}else{let z=E<0,X=(z?~E:E).toString(16);if(X.length%2?X="0"+X:parseInt(X.charAt(0),16)>=8&&(X="00"+X),ws)B=Buffer.from(X,"hex");else{B=new Uint8Array(X.length/2);for(let V=0;V<B.length;V++)B[V]=parseInt(X.slice(V*2,V*2+2),16)}if(z)for(let V=0;V<B.length;V++)B[V]=~B[V]}B.length+Z>Qt&&x(B.length+Z),Z=dh(B,oe,Z,66);return}else throw new RangeError(E+" was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string")}Z+=8}else if(P==="undefined")this.encodeUndefinedAsNil?oe[Z++]=192:(oe[Z++]=212,oe[Z++]=0,oe[Z++]=0);else throw new Error("Unknown type: "+P)},C=this.variableMapSize||this.coercibleKeyAsNumber||this.skipValues?E=>{let P;if(this.skipValues){P=[];for(let B in E)(typeof E.hasOwnProperty!="function"||E.hasOwnProperty(B))&&!this.skipValues.includes(E[B])&&P.push(B)}else P=Object.keys(E);let O=P.length;O<16?oe[Z++]=128|O:O<65536?(oe[Z++]=222,oe[Z++]=O>>8,oe[Z++]=O&255):(oe[Z++]=223,Mt.setUint32(Z,O),Z+=4);let U;if(this.coercibleKeyAsNumber)for(let B=0;B<O;B++){U=P[B];let z=Number(U);v(isNaN(z)?U:z),v(E[U])}else for(let B=0;B<O;B++)v(U=P[B]),v(E[U])}:E=>{oe[Z++]=222;let P=Z-t;Z+=2;let O=0;for(let U in E)(typeof E.hasOwnProperty!="function"||E.hasOwnProperty(U))&&(v(U),v(E[U]),O++);if(O>65535)throw new Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');oe[P+++t]=O>>8,oe[P+t]=O&255},R=this.useRecords===!1?C:e.progressiveRecords&&!h?E=>{let P,O=i.transitions||(i.transitions=Object.create(null)),U=Z++-t,B;for(let z in E)if(typeof E.hasOwnProperty!="function"||E.hasOwnProperty(z)){if(P=O[z],P)O=P;else{let X=Object.keys(E),V=O;O=i.transitions;let N=0;for(let q=0,te=X.length;q<te;q++){let k=X[q];P=O[k],P||(P=O[k]=Object.create(null),N++),O=P}U+t+1==Z?(Z--,F(O,X,N)):I(O,X,U,N),B=!0,O=V[z]}v(E[z])}if(!B){let z=O[qr];z?oe[U+t]=z:I(O,Object.keys(E),U,0)}}:E=>{let P,O=i.transitions||(i.transitions=Object.create(null)),U=0;for(let z in E)(typeof E.hasOwnProperty!="function"||E.hasOwnProperty(z))&&(P=O[z],P||(P=O[z]=Object.create(null),U++),O=P);let B=O[qr];B?B>=96&&h?(oe[Z++]=((B-=96)&31)+96,oe[Z++]=B>>5):oe[Z++]=B:F(O,O.__keys__||Object.keys(E),U);for(let z in E)(typeof E.hasOwnProperty!="function"||E.hasOwnProperty(z))&&v(E[z])},w=typeof this.useRecords=="function"&&this.useRecords,A=w?E=>{w(E)?R(E):C(E)}:R,S=E=>{let P=a._writeStruct(E,oe,t,Z,i,x,(O,U,B)=>{if(B)return n=!0;Z=U;let z=oe;return v(O),y(),z!==oe?{position:Z,targetView:Mt,target:oe}:Z});if(P===0)return A(E);Z=P},x=E=>{let P;if(E>16777216){if(E-t>hh)throw new Error("Packed buffer would be larger than maximum buffer size");P=Math.min(hh,Math.round(Math.max((E-t)*(E>67108864?1.25:2),4194304)/4096)*4096)}else P=(Math.max(E-t<<2,oe.length-1)>>12)+1<<12;let O=new aa(P);return Mt=O.dataView||(O.dataView=new DataView(O.buffer,0,P)),E=Math.min(E,oe.length),oe.copy?oe.copy(O,0,t,E):O.set(oe.slice(t,E)),Z-=t,t=0,Qt=O.length-10,oe=O},F=(E,P,O)=>{let U=i.nextId;U||(U=64),U<d&&this.shouldShareStructure&&!this.shouldShareStructure(P)?(U=i.nextOwnId,U<g||(U=d),i.nextOwnId=U+1):(U>=g&&(U=d),i.nextId=U+1);let B=P.highByte=U>=96&&h?U-96>>5:-1;E[qr]=U,E.__keys__=P,i[U-64]=P,U<d?(P.isShared=!0,i.sharedLength=U-63,n=!0,B>=0?(oe[Z++]=(U&31)+96,oe[Z++]=B):oe[Z++]=U):(B>=0?(oe[Z++]=213,oe[Z++]=114,oe[Z++]=(U&31)+96,oe[Z++]=B):(oe[Z++]=212,oe[Z++]=114,oe[Z++]=U),O&&(m+=p*O),_.length>=u&&(_.shift()[qr]=0),_.push(E),v(P))},I=(E,P,O,U)=>{let B=oe,z=Z,X=Qt,V=t;oe=Qs,Z=0,t=0,oe||(Qs=oe=new aa(8192)),Qt=oe.length-10,F(E,P,U),Qs=oe;let N=Z;if(oe=B,Z=z,Qt=X,t=V,N>1){let q=Z+N-1;q>Qt&&x(q);let te=O+t;oe.copyWithin(te+N,te+1,Z),oe.set(Qs.slice(0,N),te),Z=q}else oe[O+t]=Qs[0]}}useBuffer(e){oe=e,oe.dataView||(oe.dataView=new DataView(oe.buffer,oe.byteOffset,oe.byteLength)),Mt=oe.dataView,Z=0}set position(e){Z=e}get position(){return Z}clearSharedData(){this.structures&&(this.structures=[]),this.typedStructs&&(this.typedStructs=[])}}Xl=[Date,Set,Error,RegExp,ArrayBuffer,Object.getPrototypeOf(Uint8Array.prototype).constructor,DataView,pm];Wl=[{pack(r,e,t){let n=r.getTime()/1e3;if((this.useTimestamp32||r.getMilliseconds()===0)&&n>=0&&n<4294967296){let{target:i,targetView:s,position:o}=e(6);i[o++]=214,i[o++]=255,s.setUint32(o,n)}else if(n>0&&n<4294967296){let{target:i,targetView:s,position:o}=e(10);i[o++]=215,i[o++]=255,s.setUint32(o,r.getMilliseconds()*4e6+(n/1e3/4294967296>>0)),s.setUint32(o+4,n)}else if(isNaN(n)){if(this.onInvalidDate)return e(0),t(this.onInvalidDate());let{target:i,targetView:s,position:o}=e(3);i[o++]=212,i[o++]=255,i[o++]=255}else{let{target:i,targetView:s,position:o}=e(15);i[o++]=199,i[o++]=12,i[o++]=255,s.setUint32(o,r.getMilliseconds()*1e6),s.setBigInt64(o+4,BigInt(Math.floor(n)))}}},{pack(r,e,t){if(this.setAsEmptyObject)return e(0),t({});let n=Array.from(r),{target:i,position:s}=e(this.moreTypes?3:0);this.moreTypes&&(i[s++]=212,i[s++]=115,i[s++]=0),t(n)}},{pack(r,e,t){let{target:n,position:i}=e(this.moreTypes?3:0);this.moreTypes&&(n[i++]=212,n[i++]=101,n[i++]=0),t([r.name,r.message,r.cause])}},{pack(r,e,t){let{target:n,position:i}=e(this.moreTypes?3:0);this.moreTypes&&(n[i++]=212,n[i++]=120,n[i++]=0),t([r.source,r.flags])}},{pack(r,e){this.moreTypes?Xc(r,16,e):qc(ws?Buffer.from(r):new Uint8Array(r),e)}},{pack(r,e){let t=r.constructor;t!==Em&&this.moreTypes?Xc(r,ym.indexOf(t.name),e):qc(r,e)}},{pack(r,e){this.moreTypes?Xc(r,17,e):qc(ws?Buffer.from(r):new Uint8Array(r),e)}},{pack(r,e){let{target:t,position:n}=e(1);t[n]=193}}];function Xc(r,e,t,n){let i=r.byteLength;if(i+1<256){var{target:s,position:o}=t(4+i);s[o++]=199,s[o++]=i+1}else if(i+1<65536){var{target:s,position:o}=t(5+i);s[o++]=200,s[o++]=i+1>>8,s[o++]=i+1&255}else{var{target:s,position:o,targetView:a}=t(7+i);s[o++]=201,a.setUint32(o,i+1),o+=4}s[o++]=116,s[o++]=e,r.buffer||(r=new Uint8Array(r)),s.set(new Uint8Array(r.buffer,r.byteOffset,r.byteLength),o)}function qc(r,e){let t=r.byteLength;var n,i;if(t<256){var{target:n,position:i}=e(t+2);n[i++]=196,n[i++]=t}else if(t<65536){var{target:n,position:i}=e(t+3);n[i++]=197,n[i++]=t>>8,n[i++]=t&255}else{var{target:n,position:i,targetView:s}=e(t+5);n[i++]=198,s.setUint32(i,t),i+=4}n.set(r,i)}function dh(r,e,t,n){let i=r.length;switch(i){case 1:e[t++]=212;break;case 2:e[t++]=213;break;case 4:e[t++]=214;break;case 8:e[t++]=215;break;case 16:e[t++]=216;break;default:i<256?(e[t++]=199,e[t++]=i):i<65536?(e[t++]=200,e[t++]=i>>8,e[t++]=i&255):(e[t++]=201,e[t++]=i>>24,e[t++]=i>>16&255,e[t++]=i>>8&255,e[t++]=i&255)}return e[t++]=n,e.set(r,t),t+=i,t}function H_(r,e){let t,n=e.length*6,i=r.length-n;for(;t=e.pop();){let s=t.offset,o=t.id;r.copyWithin(s+n,s,i),n-=6;let a=s+n;r[a++]=214,r[a++]=105,r[a++]=o>>24,r[a++]=o>>16&255,r[a++]=o>>8&255,r[a++]=o&255,i=s}return r}function ph(r,e,t){if(Rt.length>0){Mt.setUint32(Rt.position+r,Z+t-Rt.position-r),Rt.stringsPosition=Z-r;let n=Rt;Rt=null,e(n[0]),e(n[1])}}function W_(r,e){return r.isCompatible=t=>{let n=!t||(e.lastNamedStructuresLength||0)===t.length;return n||e._mergeStructures(t),n},r}ru.SUPPORTS_STRUCT_HOOKS=!0;let Mm=new ru({useRecords:!1});Mm.pack;Mm.pack;const X_=512,q_=1024,Na=2048,j_=9;class mh{constructor(){L(this,"pending",new Uint8Array(0))}push(e){if(!e||e.byteLength===0)return[];const t=this.pending.byteLength===0?e:$_(this.pending,e),n=[];let i=0;for(;i<t.byteLength;){const s={offset:i};let o;try{o=ht.number(t,s)}catch(c){if(t.byteLength-i<=j_)break;throw c}const a=s.offset+o;if(a>t.byteLength)break;n.push(t.subarray(s.offset,a)),i=a}return this.pending=i<t.byteLength?t.slice(i):new Uint8Array(0),n}}function $_(r,e){const t=new Uint8Array(r.byteLength+e.byteLength);return t.set(r,0),t.set(e,r.byteLength),t}class gh{constructor(e){L(this,"wt");L(this,"url");L(this,"isOpen",!1);L(this,"events");L(this,"reader");L(this,"writer");L(this,"unreliableReader");L(this,"unreliableWriter");L(this,"lengthPrefixBuffer",new Uint8Array(9));L(this,"reliableReassembler",new mh);L(this,"unreliableReassembler",new mh);this.events=e}connect(e,t={}){this.url=e;const n=t.fingerprint&&{serverCertificateHashes:[{algorithm:"sha-256",value:new Uint8Array(t.fingerprint)}]}||void 0;this.wt=new WebTransport(e,n),this.wt.ready.then(i=>{console.log("WebTransport ready!",i),this.isOpen=!0,this.unreliableReader=this.wt.datagrams.readable.getReader();const s=this.wt.datagrams;this.unreliableWriter=(s.createWritable?s.createWritable():s.writable).getWriter(),this.wt.incomingBidirectionalStreams.getReader().read().then(a=>{this.reader=a.value.readable.getReader(),this.writer=a.value.writable.getWriter(),this.sendSeatReservation(t.roomId,t.sessionId,t.reconnectionToken,t.skipHandshake),this.readIncomingData(),this.readIncomingUnreliableData()}).catch(a=>{console.error("failed to read incoming stream",a),console.error("TODO: close the connection")})}).catch(i=>{console.log("WebTransport not ready!",i),this._close()}),this.wt.closed.then(i=>{console.log("WebTransport closed w/ success",i),this.events.onclose({code:i.closeCode,reason:i.reason})}).catch(i=>{console.log("WebTransport closed w/ error",i),this.events.onerror(i),this.events.onclose({code:i.closeCode,reason:i.reason})}).finally(()=>{this._close()})}send(e){this.writer.write(this.frame(e))}sendUnreliable(e){this.unreliableWriter.write(this.frame(e))}frame(e){const t=e instanceof Uint8Array?e:new Uint8Array(e),n=st.number(this.lengthPrefixBuffer,t.length,{offset:0}),i=new Uint8Array(n+t.length);return i.set(this.lengthPrefixBuffer.subarray(0,n),0),i.set(t,n),i}close(e,t){var n;this.isOpen=!1;try{const i=(n=this.wt)==null?void 0:n.close({closeCode:e,reason:t});i&&typeof i.catch=="function"&&i.catch(()=>{})}catch{}}async readIncomingData(){let e;for(;this.isOpen;){try{if(e=await this.reader.read(),e.done||!e.value)break;for(const t of this.reliableReassembler.push(e.value))this.events.onmessage({data:t})}catch(t){t.message.indexOf("session is closed")===-1&&console.error("H3Transport: failed to read incoming data",t);break}if(e.done)break}}async readIncomingUnreliableData(){let e;for(;this.isOpen;){try{if(e=await this.unreliableReader.read(),e.done||!e.value)break;for(const t of this.unreliableReassembler.push(e.value))this.events.onmessage({data:t})}catch(t){t.message.indexOf("session is closed")===-1&&console.error("H3Transport: failed to read incoming data",t);break}if(e.done)break}}sendSeatReservation(e,t,n,i){const s={offset:0},o=[];st.string(o,e,s),st.string(o,t,s),n&&st.string(o,n,s),i&&st.boolean(o,1,s),this.writer.write(new Uint8Array(o).buffer)}_close(){this.isOpen=!1}}function Y_(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var K_=function(){throw new Error("ws does not work in the browser. Browser clients must use the native WebSocket object")};const J_=Y_(K_),jc=globalThis.WebSocket||J_;let _h=!1;class Z_{constructor(e){L(this,"ws");L(this,"protocols");L(this,"events");this.events=e}send(e){this.ws.send(e)}sendUnreliable(e){_h||(_h=!0,console.warn('@colyseus/sdk: the WebSocket transport has no unreliable channel — sending `mode:"unreliable"` traffic reliably instead. Use @colyseus/h3-transport (WebTransport) for datagram delivery.')),this.send(e)}connect(e,t){try{this.ws=new jc(e,{headers:t,protocols:this.protocols})}catch{this.ws=new jc(e,this.protocols)}this.ws.binaryType="arraybuffer",this.ws.onopen=n=>{var i,s;return(s=(i=this.events).onopen)==null?void 0:s.call(i,n)},this.ws.onmessage=n=>{var i,s;return(s=(i=this.events).onmessage)==null?void 0:s.call(i,n)},this.ws.onclose=n=>{var i,s;return(s=(i=this.events).onclose)==null?void 0:s.call(i,n)},this.ws.onerror=n=>{var i,s;return(s=(i=this.events).onerror)==null?void 0:s.call(i,n)}}close(e,t){e===hi.MAY_TRY_RECONNECT&&this.events.onclose&&(this.ws.onclose=null,this.events.onclose({code:e,reason:t})),this.ws.close(e,t)}get isOpen(){return this.ws.readyState===jc.OPEN}}const mo=[],ql=typeof addEventListener=="function"&&typeof removeEventListener=="function";ql&&addEventListener("offline",()=>{console.warn(`@colyseus/sdk: 🛑 Network offline. Closing ${mo.length} connection(s)`),mo.forEach(r=>r())},!1);var Po;class bm{constructor(e){L(this,"transport");L(this,"events",{});L(this,"url");L(this,"options");At(this,Po,ql?()=>this.close(hi.MAY_TRY_RECONNECT):null);switch(e){case"h3":this.transport=new gh(this.events);break;default:this.transport=new Z_(this.events);break}}connect(e,t){if(ql){const n=this.events.onopen;this.events.onopen=s=>{mo.push(Je(this,Po)),n==null||n(s)};const i=this.events.onclose;this.events.onclose=s=>{mo.splice(mo.indexOf(Je(this,Po)),1),i==null||i(s)}}this.url=e,this.options=t,this.transport.connect(e,t)}send(e){this.transport.send(e)}sendUnreliable(e){this.transport.sendUnreliable(e)}reconnect(e){if(this.transport instanceof gh){this.transport.connect(this.url,{...this.options,...e});return}const t=new URL(this.url);for(const n in e)t.searchParams.set(n,e[n]);this.transport.connect(t.toString(),this.options)}close(e,t){this.transport.close(e,t)}get isOpen(){return this.transport.isOpen}}Po=new WeakMap;const wm={};function Tm(r,e){wm[r]=e}function vh(r){const e=wm[r];if(!e)throw new Error("missing serializer: "+r);return e}const Am=()=>({emit(r,...e){let t=this.events[r]||[];for(let n=0,i=t.length;n<i;n++)t[n](...e)},events:{},on(r,e){var t;return(t=this.events[r])!=null&&t.push(e)||(this.events[r]=[e]),()=>{var n;this.events[r]=(n=this.events[r])==null?void 0:n.filter(i=>e!==i)}}});class Q_{constructor(){L(this,"handlers",[])}register(e,t=!1){return this.handlers.push(e),this}invoke(...e){this.handlers.forEach(t=>t.apply(this,e))}invokeAsync(...e){return Promise.all(this.handlers.map(t=>t.apply(this,e)))}remove(e){const t=this.handlers.indexOf(e);this.handlers[t]=this.handlers[this.handlers.length-1],this.handlers.pop()}clear(){this.handlers=[]}}function jr(){const r=new Q_;function e(t){return r.register(t,this===null)}return e.once=t=>{const n=function(...i){t.apply(this,i),r.remove(n)};r.register(n)},e.remove=t=>r.remove(t),e.invoke=(...t)=>r.invoke(...t),e.invokeAsync=(...t)=>r.invokeAsync(...t),e.clear=()=>r.clear(),e}class Rm{constructor(){L(this,"state");L(this,"decoder")}setState(e,t){this.decoder.root.refs.size>1&&typeof this.decoder.decodeResync=="function"?this.decoder.decodeResync(e,t):this.decoder.decode(e,t)}getState(){return this.state}patch(e,t){return this.decoder.decode(e,t)}teardown(){this.decoder.root.clearRefs()}handshake(e,t){this.state?(Bi.decode(e,t),this.decoder=new Qa(this.state)):(this.decoder=Bi.decode(e,t),this.state=this.decoder.state)}}function ev(){return{enabled:!0,retryCount:0,maxRetries:15,delay:100,minDelay:100,maxDelay:5e3,minUptime:5e3,backoff:tv,maxEnqueuedMessages:10,enqueuedMessages:[],isReconnecting:!1}}const tv=(r,e)=>Math.floor(Math.pow(2,r)*e);function $c(r,e){r.reconnection.enqueuedMessages.push({data:e}),r.reconnection.enqueuedMessages.length>r.reconnection.maxEnqueuedMessages&&r.reconnection.enqueuedMessages.shift()}function nv(r,e){var n;if(!e){const i=new Error("request rejected");return i.name="rejected",i.reason=r,i}const t=new Error((n=r==null?void 0:r.message)!=null?n:"request failed");return r!=null&&r.name&&(t.name=r.name),(r==null?void 0:r.code)!==void 0&&(t.code=r.code),t}var Uo,vs,xs,di,pi,ys,yi,Cm,Dm,Pm,Um;const sc=class sc{constructor(e,t){At(this,yi);L(this,"roomId");L(this,"sessionId");L(this,"reconnectionToken");L(this,"name");L(this,"connection");L(this,"onStateChange",jr());L(this,"onError",jr());L(this,"onLeave",jr());L(this,"onReconnect",jr());L(this,"onDrop",jr());L(this,"onJoin",jr());L(this,"serializerId");L(this,"serializer");L(this,"reconnection",ev());L(this,"joinedAtTime",0);L(this,"clock",hm);L(this,"onMessageHandlers",Am());L(this,"packr");L(this,"sharedBuffer");At(this,Uo,0);At(this,vs);At(this,xs,0);At(this,di,new Map);At(this,pi);At(this,ys,0);if(this.name=e,this.packr=new ru,this.sharedBuffer=new Uint8Array(8192),t){const n=new(vh("schema"));this.serializer=n;const i=new t;n.state=i,n.decoder=new Qa(i)}this.onLeave(()=>{this.removeAllListeners(),this.destroy()})}connect(e,t,n){var s;this.connection=new bm(t.protocol),this.connection.events.onmessage=this.onMessageCallback.bind(this),this.connection.events.onclose=o=>{var a;if(Xr(this,yi,Pm).call(this,"connection closed before a response was received."),this.joinedAtTime===0){(a=console.warn)==null||a.call(console,`Room connection was closed unexpectedly (${o.code}): ${o.reason}`),this.onError.invoke(o.code,o.reason);return}o.code===hi.NO_STATUS_RECEIVED||o.code===hi.ABNORMAL_CLOSURE||o.code===hi.GOING_AWAY||o.code===hi.MAY_TRY_RECONNECT?(this.onDrop.invoke(o.code,o.reason),this.handleReconnection(o.code,o.reason)):this.onLeave.invoke(o.code,o.reason)},this.connection.events.onerror=o=>{this.onError.invoke(o.code,o.reason)};const i=((s=this.serializer)==null?void 0:s.getState())!==void 0;if(t.protocol==="h3"){const o=new URL(e);this.connection.connect(o.origin,{...t,skipHandshake:i})}else this.connection.connect(`${e}${i?"&skipHandshake=1":""}`,n)}leave(e=!0){return new Promise(t=>{this.onLeave(n=>t(n)),this.connection?e?(this.sharedBuffer[0]=Nt.LEAVE_ROOM,this.connection.send(this.sharedBuffer.subarray(0,1))):this.connection.close():this.onLeave.invoke(hi.CONSENTED)})}onMessage(e,t){return this.onMessageHandlers.on(this.getMessageHandlerKey(e),t)}ping(e){var t;(t=this.connection)!=null&&t.isOpen&&(Tt(this,Uo,ei()),Tt(this,vs,e),this.sharedBuffer[0]=Nt.PING,this.connection.send(this.sharedBuffer.subarray(0,1)))}send(e,t,n){if(n!==void 0){this.request(e,t).then(a=>n(a,void 0),a=>n(void 0,a));return}const i={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA,typeof e=="string"?st.string(this.sharedBuffer,e,i):st.number(this.sharedBuffer,e,i);const s=i.offset;let o;t!==void 0?(o=this.packr.pack(t,Na|s),o.set(this.sharedBuffer.subarray(0,s),0)):o=this.sharedBuffer.subarray(0,s),this.connection.isOpen?this.connection.send(o):$c(this,new Uint8Array(o))}request(e,t,n){var s;if(!this.connection.isOpen)return Promise.reject(new Error(`cannot send request "${e}": connection is not open.`));const i=(s=n==null?void 0:n.timeout)!=null?s:sc.defaultRequestTimeout;return new Promise((o,a)=>{let c;const l=this.sendRequest(e,t,{mode:n==null?void 0:n.mode},(f,u,h)=>{clearTimeout(c),f?o(u):a(nv(u,h))},f=>{clearTimeout(c),a(new Error(f))});c=setTimeout(()=>{this.cancelRequest(l),a(new Error(`request "${e}" timed out after ${i}ms.`))},i)})}sendRequest(e,t,n,i,s){const o=Xr(this,yi,Cm).call(this),a=Xr(this,yi,Dm).call(this,o,e,t);if(n.mode==="unreliable"){if(!this.connection.isOpen)return-1;this.connection.sendUnreliable(a)}else this.connection.isOpen?this.connection.send(a):$c(this,new Uint8Array(a));return Je(this,di).set(o,{onReply:i,onClose:s}),o}cancelRequest(e){Je(this,di).delete(e)}sendUnreliable(e,t){if(!this.connection.isOpen)return;const n={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA,typeof e=="string"?st.string(this.sharedBuffer,e,n):st.number(this.sharedBuffer,e,n);const i=n.offset;let s;t!==void 0?(s=this.packr.pack(t,Na|i),s.set(this.sharedBuffer.subarray(0,i),0)):s=this.sharedBuffer.subarray(0,i),this.connection.sendUnreliable(s)}sendBytes(e,t){const n={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA_BYTES,typeof e=="string"?st.string(this.sharedBuffer,e,n):st.number(this.sharedBuffer,e,n);const i=n.offset;if(i+t.byteLength>this.sharedBuffer.byteLength){const s=new Uint8Array(i+t.byteLength);s.set(this.sharedBuffer.subarray(0,i)),this.sharedBuffer=s}this.sharedBuffer.set(t,i),this.connection.isOpen?this.connection.send(this.sharedBuffer.subarray(0,i+t.byteLength)):$c(this,this.sharedBuffer.subarray(0,i+t.byteLength))}input(e){var t;return((t=Je(this,pi))!=null?t:Tt(this,pi,new Hc(this))).handle(e)}get state(){return this.serializer.getState()}removeAllListeners(){this.onJoin.clear(),this.onStateChange.clear(),this.onError.clear(),this.onLeave.clear(),this.onReconnect.clear(),this.onDrop.clear(),this.onMessageHandlers.events={},this.serializer instanceof Rm&&(this.serializer.decoder.root.callbacks={})}onMessageCallback(e){Xr(this,yi,Um).call(this,new Uint8Array(e.data))}dispatchMessage(e,t){var i;const n=this.getMessageHandlerKey(e);this.onMessageHandlers.events[n]?this.onMessageHandlers.emit(n,t):this.onMessageHandlers.events["*"]?this.onMessageHandlers.emit("*",e,t):n.startsWith("__")||(i=console.warn)==null||i.call(console,`@colyseus/sdk: onMessage() not registered for type '${e}'.`)}destroy(){this.serializer&&this.serializer.teardown()}getMessageHandlerKey(e){switch(typeof e){case"string":return e;case"number":return`i${e}`;default:throw new Error("invalid message type.")}}handleReconnection(e,t){var n;if(!this.reconnection.enabled){this.onLeave.invoke(e,t);return}if(Date.now()-this.joinedAtTime<this.reconnection.minUptime){console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} Room has not been up for long enough for automatic reconnection. (min uptime: ${this.reconnection.minUptime}ms)`),this.onLeave.invoke(hi.ABNORMAL_CLOSURE,"Room uptime too short for reconnection.");return}this.reconnection.isReconnecting||(this.reconnection.retryCount=0,this.reconnection.isReconnecting=!0,(n=Je(this,pi))==null||n.reset()),this.retryReconnection()}retryReconnection(){if(this.reconnection.retryCount>=this.reconnection.maxRetries){console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} ❌ Reconnection failed after ${this.reconnection.maxRetries} attempts.`),this.reconnection.isReconnecting=!1,this.onLeave.invoke(hi.FAILED_TO_RECONNECT,"No more retries. Reconnection failed.");return}this.reconnection.retryCount++;const e=Math.min(this.reconnection.maxDelay,Math.max(this.reconnection.minDelay,this.reconnection.backoff(this.reconnection.retryCount,this.reconnection.delay)));console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9203)} will retry in ${(e/1e3).toFixed(1)} seconds...`),setTimeout(()=>{try{console.info(`[Colyseus reconnection]: ${String.fromCodePoint(128260)} Re-establishing sessionId '${this.sessionId}' with roomId '${this.roomId}'... (attempt ${this.reconnection.retryCount} of ${this.reconnection.maxRetries})`),this.connection.reconnect({reconnectionToken:this.reconnectionToken.split(":")[1],skipHandshake:!0})}catch{this.retryReconnection()}},e)}};Uo=new WeakMap,vs=new WeakMap,xs=new WeakMap,di=new WeakMap,pi=new WeakMap,ys=new WeakMap,yi=new WeakSet,Cm=function(){const e=Je(this,xs);return Tt(this,xs,Je(this,xs)+1>>>0),e},Dm=function(e,t,n){const i={offset:1};this.sharedBuffer[0]=Nt.ROOM_REQUEST,st.number(this.sharedBuffer,e,i),typeof t=="string"?st.string(this.sharedBuffer,t,i):st.number(this.sharedBuffer,t,i);const s=i.offset;if(n!==void 0){const o=this.packr.pack(n,Na|s);return o.set(this.sharedBuffer.subarray(0,s),0),o}return this.sharedBuffer.subarray(0,s)},Pm=function(e){var t;if(Je(this,di).size!==0){for(const n of Je(this,di).values())(t=n.onClose)==null||t.call(n,e);Je(this,di).clear()}},Um=function(e){var s,o,a,c,l,f;const t={offset:1},n=e[0],i=n&Xg;if(n&Ll.TIMED){const u=ht.uint32(e,t),h=ht.uint32(e,t),d=Je(this,pi)?Je(this,pi).ackInput(h):-1;this.clock.sample(u,d)}if(i===Nt.JOIN_ROOM){const u=ht.utf8Read(e,t,e[t.offset++]);if(this.serializerId=ht.utf8Read(e,t,e[t.offset++]),!this.serializer){const g=vh(this.serializerId);this.serializer=new g}const h=ht.number(e,t);if(h>0&&this.serializer.handshake){const g=t.offset+h;this.serializer.handshake(e.subarray(0,g),t),t.offset=g}for(;t.offset<e.byteLength;){const g=e[t.offset++],_=ht.number(e,t),m=t.offset+_;g===zu.INPUT_REFLECTION?((s=Je(this,pi))!=null?s:Tt(this,pi,new Hc(this))).applyReflection(e,t,m):g===zu.INPUT_OPTIONS&&((o=Je(this,pi))!=null?o:Tt(this,pi,new Hc(this))).applyOptions(e,t),t.offset=m}const d=(a=Je(this,pi))==null?void 0:a.patchRate;if(d!==void 0&&((l=(c=this.clock).setPatchInterval)==null||l.call(c,d)),this.joinedAtTime===0?(this.joinedAtTime=Date.now(),this.onJoin.invoke()):(console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9989)} reconnection successful!`),this.reconnection.isReconnecting=!1,this.onReconnect.invoke()),this.reconnectionToken=`${this.roomId}:${u}`,this.sharedBuffer[0]=Nt.JOIN_ROOM,this.connection.send(this.sharedBuffer.subarray(0,1)),this.reconnection.enqueuedMessages.length>0){for(const g of this.reconnection.enqueuedMessages)this.connection.send(g.data);this.reconnection.enqueuedMessages=[]}}else if(i===Nt.ERROR){const u=ht.number(e,t),h=ht.string(e,t);this.onError.invoke(u,h)}else if(i===Nt.LEAVE_ROOM)this.leave();else if(i===Nt.ROOM_STATE)Tt(this,ys,0),this.serializer.setState(e,t),this.onStateChange.invoke(this.serializer.getState());else if(i===Nt.ROOM_STATE_PATCH){if(n&Ll.UNRELIABLE){const u=ht.uint16(e,t);if(u-Je(this,ys)<<16>>16<=0)return;Tt(this,ys,u)}this.serializer.patch(e,t),this.onStateChange.invoke(this.serializer.getState())}else if(i===Nt.ROOM_DATA){const u=ht.stringCheck(e,t)?ht.string(e,t):ht.number(e,t),h=e.byteLength>t.offset?uh(e,{start:t.offset}):void 0;this.dispatchMessage(u,h)}else if(i===Nt.ROOM_DATA_BYTES){const u=ht.stringCheck(e,t)?ht.string(e,t):ht.number(e,t);this.dispatchMessage(u,e.subarray(t.offset))}else if(i===Nt.ROOM_RESPONSE){const u=ht.number(e,t),h=e[t.offset++],d=e.byteLength>t.offset?uh(e,{start:t.offset}):void 0,g=Je(this,di).get(u);g!==void 0&&(Je(this,di).delete(u),g.onReply(h===ku.OK,d,h===ku.ERROR))}else i===Nt.PING&&((f=Je(this,vs))==null||f.call(this,Math.round(ei()-Je(this,Uo))),Tt(this,vs,void 0))},L(sc,"defaultRequestTimeout",1e4);let jl=sc;function iv(r,e){return new Promise((t,n)=>{var o;const i=new XMLHttpRequest,s=(e==null?void 0:e.method)||"GET";i.open(s,r.toString()),i.withCredentials=(e==null?void 0:e.credentials)==="include",e!=null&&e.headers&&(e.headers instanceof Headers?e.headers:new Headers(e.headers)).forEach((c,l)=>{i.setRequestHeader(l,c)}),i.onload=()=>{var f;const a=new Headers,c=i.getAllResponseHeaders().trim();if(c)for(const u of c.split(/[\r\n]+/)){const h=u.indexOf(": ");h>0&&a.append(u.substring(0,h),u.substring(h+2))}const l=(f=i.response)!=null?f:i.responseText;t(new rv(l,{status:i.status,statusText:i.statusText,headers:a}))},i.onerror=()=>n(new TypeError("Network request failed")),i.ontimeout=()=>n(new TypeError("Network request timed out")),i.send((o=e==null?void 0:e.body)!=null?o:null)})}class rv{constructor(e,t){L(this,"status");L(this,"statusText");L(this,"headers");L(this,"ok");L(this,"body");this.body=e,this.status=t.status,this.statusText=t.statusText,this.headers=t.headers,this.ok=t.status>=200&&t.status<300}async json(){return typeof this.body=="string"?JSON.parse(this.body):this.body}async text(){return typeof this.body=="string"?this.body:JSON.stringify(this.body)}async blob(){return new Blob([this.body])}}function sv(r){if(r===void 0)return!1;const e=typeof r;return e==="string"||e==="number"||e==="boolean"||e===null?!0:e!=="object"?!1:Array.isArray(r)?!0:r.buffer?!1:r.constructor&&r.constructor.name==="Object"||typeof r.toJSON=="function"}function ov(r,e){const{params:t,query:n}=e||{},[i,s]=r.split("?");let o=i;if(t)if(Array.isArray(t)){const l=o.split("/").filter(f=>f.startsWith(":"));for(const[f,u]of l.entries()){const h=t[f];o=o.replace(u,h)}}else for(const[l,f]of Object.entries(t))o=o.replace(`:${l}`,String(f));const a=new URLSearchParams(s);if(n)for(const[l,f]of Object.entries(n))f!=null&&a.set(l,String(f));let c=a.toString();return c=c.length>0?`?${c}`.replace(/\+/g,"%20"):"",`${o}${c}`}class av{constructor(e,t,n){L(this,"authToken");L(this,"options");L(this,"sdk");L(this,"_fetchFn");L(this,"del",this.delete);this.sdk=e,this.options=t,this._fetchFn=n}get fetchFn(){return this._fetchFn||(this._fetchFn=typeof globalThis.fetch!="undefined"?globalThis.fetch.bind(globalThis):iv),this._fetchFn}async request(e,t,n){return this.executeRequest(e,t,n)}get(e,t){return this.request("GET",e,t)}post(e,t){return this.request("POST",e,t)}delete(e,t){return this.request("DELETE",e,t)}patch(e,t){return this.request("PATCH",e,t)}put(e,t){return this.request("PUT",e,t)}async executeRequest(e,t,n){var d,g,_;let i=this.options.body?{...this.options.body,...(n==null?void 0:n.body)||{}}:n==null?void 0:n.body;const s=this.options.query?{...this.options.query,...(n==null?void 0:n.query)||{}}:n==null?void 0:n.query,o=this.options.params?{...this.options.params,...(n==null?void 0:n.params)||{}}:n==null?void 0:n.params,a=new Headers(this.options.headers?{...this.options.headers,...(n==null?void 0:n.headers)||{}}:n==null?void 0:n.headers);if(this.authToken&&!a.has("authorization")&&a.set("authorization",`Bearer ${this.authToken}`),sv(i)&&typeof i=="object"&&i!==null){a.has("content-type")||a.set("content-type","application/json");for(const[m,p]of Object.entries(i))p instanceof Date&&(i[m]=p.toISOString());i=JSON.stringify(i)}const c={credentials:(n==null?void 0:n.credentials)||"include",...this.options,...n,query:s,params:o,headers:a,body:i,method:e},l=ov(this.sdk.getHttpEndpoint(t.toString()),c);let f;try{f=await this.fetchFn(l,c)}catch(m){if(m.name==="AbortError")throw m;const p=new uo(((d=m.cause)==null?void 0:d.code)||m.code,m.message);throw p.response=f,p.cause=m.cause,p}const u=f.headers.get("content-type");let h;if(u!=null&&u.includes("json")?h=await f.json():u!=null&&u.includes("text")?h=await f.text():h=await f.blob(),!f.ok)throw new uo(f.status,(_=(g=h.message)!=null?g:h.error)!=null?_:f.statusText,{headers:f.headers,status:f.status,response:f,data:h});return{raw:f,data:h,headers:f.headers,status:f.status,statusText:f.statusText}}}let fr;function su(){if(!fr)try{fr=typeof cc!="undefined"&&cc.sys&&cc.sys.localStorage?cc.sys.localStorage:window.localStorage}catch{}return!fr&&typeof globalThis.indexedDB!="undefined"&&(fr=new uv),fr||(fr={cache:{},setItem:function(r,e){this.cache[r]=e},getItem:function(r){return this.cache[r]},removeItem:function(r){delete this.cache[r]}}),fr}function cv(r,e){su().setItem(r,e)}function lv(r){su().removeItem(r)}function fv(r,e){const t=su().getItem(r);typeof Promise=="undefined"||!(t instanceof Promise)?e(t):t.then(n=>e(n))}class uv{constructor(){L(this,"dbPromise",new Promise(e=>{const t=indexedDB.open("_colyseus_storage",1);t.onupgradeneeded=()=>t.result.createObjectStore("store"),t.onsuccess=()=>e(t.result)}))}async tx(e,t){const i=(await this.dbPromise).transaction("store",e).objectStore("store");return t(i)}setItem(e,t){return this.tx("readwrite",n=>n.put(t,e)).then()}async getItem(e){const t=await this.tx("readonly",n=>n.get(e));return new Promise(n=>{t.onsuccess=()=>n(t.result)})}removeItem(e){return this.tx("readwrite",t=>t.delete(e)).then()}}var Io,Pi,Lo;class hv{constructor(e){L(this,"settings",{path:"/auth",key:"colyseus-auth-token"});At(this,Io,!1);At(this,Pi,null);At(this,Lo,Am());L(this,"http");this.http=e,fv(this.settings.key,t=>this.token=t)}set token(e){this.http.authToken=e}get token(){return this.http.authToken}onChange(e){const t=Je(this,Lo).on("change",e);return Je(this,Io)||this.getUserData().then(n=>{this.emitChange({...n,token:this.token})}).catch(n=>{this.emitChange({user:null,token:void 0})}),Tt(this,Io,!0),t}async getUserData(){if(this.token)return(await this.http.get(`${this.settings.path}/userdata`)).data;throw new Error("missing auth.token")}async registerWithEmailAndPassword(e,t,n){const i=(await this.http.post(`${this.settings.path}/register`,{body:{email:e,password:t,options:n}})).data;return this.emitChange(i),i}async signInWithEmailAndPassword(e,t){const n=(await this.http.post(`${this.settings.path}/login`,{body:{email:e,password:t}})).data;return this.emitChange(n),n}async signInAnonymously(e){const t=(await this.http.post(`${this.settings.path}/anonymous`,{body:{options:e}})).data;return this.emitChange(t),t}async sendPasswordResetEmail(e){return(await this.http.post(`${this.settings.path}/forgot-password`,{body:{email:e}})).data}async signInWithProvider(e,t={}){return new Promise((n,i)=>{const s=t.width||480,o=t.height||768,a=this.token?`?token=${this.token}`:"",c=`Login with ${e[0].toUpperCase()+e.substring(1)}`,l=this.http.sdk.getHttpEndpoint(`${t.prefix||`${this.settings.path}/provider`}/${e}${a}`),f=screen.width/2-s/2,u=screen.height/2-o/2;Tt(this,Pi,window.open(l,c,"toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width="+s+", height="+o+", top="+u+", left="+f));const h=g=>{var _;if(!(g.data.user===void 0&&g.data.token===void 0))if(clearInterval(d),(_=Je(this,Pi))==null||_.close(),Tt(this,Pi,null),window.removeEventListener("message",h),g.data.error!==void 0){const m=new Error(String(g.data.error));m.code=g.data.error,g.data.reason!==void 0&&(m.reason=g.data.reason),g.data.until!==void 0&&(m.until=g.data.until),i(m)}else n(g.data),this.emitChange(g.data)},d=setInterval(()=>{(!Je(this,Pi)||Je(this,Pi).closed)&&(Tt(this,Pi,null),i("cancelled"),window.removeEventListener("message",h))},200);window.addEventListener("message",h)})}async signOut(){this.emitChange({user:null,token:null})}emitChange(e){e.token!==void 0&&(this.token=e.token,e.token===null?lv(this.settings.key):cv(this.settings.key,e.token)),Je(this,Lo).emit("change",e)}}Io=new WeakMap,Pi=new WeakMap,Lo=new WeakMap;function dv(r){var i;const e=((i=window==null?void 0:window.location)==null?void 0:i.hostname)||"localhost",t=r.hostname.split("."),n=!r.hostname.includes("trycloudflare.com")&&!r.hostname.includes("discordsays.com")&&t.length>2?`/${t[0]}`:"";return r.pathname.startsWith("/.proxy")?`${r.protocol}//${e}${n}${r.pathname}${r.search}`:`${r.protocol}//${e}/.proxy/colyseus${n}${r.pathname}${r.search}`}var Tp;const xh=typeof window!="undefined"&&typeof((Tp=window==null?void 0:window.location)==null?void 0:Tp.hostname)!="undefined"?`${window.location.protocol.replace("http","ws")}//${window.location.hostname}${window.location.port&&`:${window.location.port}`}`:"ws://127.0.0.1:2567",oc=class oc{constructor(e=xh,t){L(this,"http");L(this,"auth");L(this,"settings");L(this,"urlBuilder");var n,i;if(typeof e=="string"){const s=e.startsWith("/")?new URL(e,xh):new URL(e),o=s.protocol==="https:"||s.protocol==="wss:",a=Number(s.port||(o?443:80));this.settings={hostname:s.hostname,pathname:s.pathname,port:a,secure:o,searchParams:s.searchParams.toString()||void 0}}else e.port===void 0&&(e.port=e.secure?443:80),e.pathname===void 0&&(e.pathname=""),this.settings=e;this.settings.pathname.endsWith("/")&&(this.settings.pathname=this.settings.pathname.slice(0,-1)),t!=null&&t.protocol&&(this.settings.protocol=t.protocol),this.http=new av(this,{headers:(t==null?void 0:t.headers)||{}},t==null?void 0:t.fetchFn),this.auth=new hv(this.http),this.urlBuilder=t==null?void 0:t.urlBuilder,!this.urlBuilder&&typeof window!="undefined"&&((i=(n=window==null?void 0:window.location)==null?void 0:n.hostname)!=null&&i.includes("discordsays.com"))&&(this.urlBuilder=dv,console.log("Colyseus SDK: Discord Embedded SDK detected. Using custom URL builder."))}static async selectByLatency(e,t,n={}){const i=e.map(o=>new oc(o,t)),s=(await Promise.allSettled(i.map((o,a)=>o.getLatency(n).then(c=>{const l=i[a].settings;return console.log(`🛜 Endpoint Latency: ${c}ms - ${l.hostname}:${l.port}${l.pathname}`),[a,c]})))).filter(o=>o.status==="fulfilled").map(o=>o.value);if(s.length===0)throw new Error("All endpoints failed to respond");return i[s.sort((o,a)=>o[1]-a[1])[0][0]]}async joinOrCreate(e,t={},n){return await this.createMatchMakeRequest("joinOrCreate",e,t,n)}async create(e,t={},n){return await this.createMatchMakeRequest("create",e,t,n)}async join(e,t={},n){return await this.createMatchMakeRequest("join",e,t,n)}async joinById(e,t={},n){return await this.createMatchMakeRequest("joinById",e,t,n)}async reconnect(e,t){if(typeof e=="string"&&typeof t=="string")throw new Error("DEPRECATED: .reconnect() now only accepts 'reconnectionToken' as argument.\nYou can get this token from previously connected `room.reconnectionToken`");const[n,i]=e.split(":");if(!n||!i)throw new Error(`Invalid reconnection token format.
The format should be roomId:reconnectionToken`);return await this.createMatchMakeRequest("reconnect",n,{reconnectionToken:i},t)}async consumeSeatReservation(e,t){const n=this.createRoom(e.name,t);n.roomId=e.roomId,n.sessionId=e.sessionId;const i={sessionId:n.sessionId};return e.reconnectionToken&&(i.reconnectionToken=e.reconnectionToken),n.connect(this.buildEndpoint(e,i),{...e,protocol:this.settings.protocol},this.http.options.headers),new Promise((s,o)=>{const a=(c,l)=>o(new uo(c,l));n.onError.once(a),n.onJoin.once(()=>{n.onError.remove(a),R_("room",n),s(n)})})}getLatency(e={}){var s,o,a;const t=(s=e.protocol)!=null?s:"ws",n=(o=e.pingCount)!=null?o:1,i=(a=e.timeout)!=null?a:1500;return new Promise((c,l)=>{var p;const f=new bm(t),u=[];let h=0,d=!1,g;const _=y=>{if(!d){d=!0,clearTimeout(g);try{f.close()}catch{}y()}},m=y=>_(()=>l(new uo(hi.ABNORMAL_CLOSURE,`Failed to get latency: ${y}`)));g=setTimeout(()=>m(`timed out after ${i}ms`),i),f.events.onopen=()=>{h=Date.now(),f.send(new Uint8Array([Nt.PING]))},f.events.onmessage=y=>{if(u.push(Date.now()-h),u.length<n)h=Date.now(),f.send(new Uint8Array([Nt.PING]));else{const b=u.reduce((v,C)=>v+C,0)/u.length;_(()=>c(b))}},f.events.onclose=y=>m(`connection closed${y!=null&&y.code?` (${y.code})`:""}${y!=null&&y.reason?`: ${y.reason}`:""}`),f.events.onerror=y=>m(y.message);try{f.connect(this.getHttpEndpoint())}catch(y){m((p=y==null?void 0:y.message)!=null?p:"failed to connect")}})}async createMatchMakeRequest(e,t,n={},i){try{if(!t)throw new Error("Must provide a room name");const o=(await this.http.post(`/matchmake/${e}/${t}`,{headers:{Accept:"application/json","Content-Type":"application/json"},body:n})).data;return e==="reconnect"&&(o.reconnectionToken=n.reconnectionToken),await this.consumeSeatReservation(o,i)}catch(s){throw s instanceof uo?new Hf(s.message,s.code):s}}createRoom(e,t){return new jl(e,t)}buildEndpoint(e,t={}){let n=this.settings.protocol||"ws",i=this.settings.searchParams||"";this.http.authToken&&(t._authToken=this.http.authToken);for(const a in t)t.hasOwnProperty(a)&&(i+=(i?"&":"")+`${a}=${t[a]}`);n==="h3"&&(n="http");let s=this.settings.secure?`${n}s://`:`${n}://`;e.publicAddress?s+=`${e.publicAddress}`:s+=`${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}`;const o=`${s}/${e.processId}/${e.roomId}?${i}`;return this.urlBuilder?this.urlBuilder(new URL(o)):o}getHttpEndpoint(e=""){const t=e.startsWith("/")?e:`/${e}`;let n=`${this.settings.secure?"https":"http"}://${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}${t}`;return this.settings.searchParams&&(n+=`?${this.settings.searchParams}`),this.urlBuilder?this.urlBuilder(new URL(n)):n}getEndpointPort(){return this.settings.port!==80&&this.settings.port!==443?`:${this.settings.port}`:""}};L(oc,"VERSION","0.18");let $l=oc;const pv=$l;class mv{setState(e){}getState(){return null}patch(e){}teardown(){}handshake(e){}}Tm("schema",Rm);Tm("none",mv);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ou="170",gv=0,yh=1,_v=2,Im=1,vv=2,Ri=3,or=0,En=1,Zn=2,rr=0,ds=1,Sh=2,Eh=3,Mh=4,xv=5,yr=100,yv=101,Sv=102,Ev=103,Mv=104,bv=200,wv=201,Tv=202,Av=203,Yl=204,Kl=205,Rv=206,Cv=207,Dv=208,Pv=209,Uv=210,Iv=211,Lv=212,Fv=213,Nv=214,Jl=0,Zl=1,Ql=2,Ts=3,ef=4,tf=5,nf=6,rf=7,Lm=0,Ov=1,Bv=2,sr=0,kv=1,zv=2,Gv=3,Vv=4,Hv=5,Wv=6,Xv=7,Fm=300,As=301,Rs=302,sf=303,of=304,vc=306,af=1e3,Tr=1001,cf=1002,ri=1003,qv=1004,ca=1005,zn=1006,Yc=1007,Ar=1008,ki=1009,Nm=1010,Om=1011,Eo=1012,au=1013,Fr=1014,Ui=1015,Go=1016,cu=1017,lu=1018,Cs=1020,Bm=35902,km=1021,zm=1022,ti=1023,Gm=1024,Vm=1025,ps=1026,Ds=1027,Hm=1028,fu=1029,Wm=1030,uu=1031,hu=1033,Oa=33776,Ba=33777,ka=33778,za=33779,lf=35840,ff=35841,uf=35842,hf=35843,df=36196,pf=37492,mf=37496,gf=37808,_f=37809,vf=37810,xf=37811,yf=37812,Sf=37813,Ef=37814,Mf=37815,bf=37816,wf=37817,Tf=37818,Af=37819,Rf=37820,Cf=37821,Ga=36492,Df=36494,Pf=36495,Xm=36283,Uf=36284,If=36285,Lf=36286,jv=3200,qm=3201,jm=0,$v=1,Ji="",In="srgb",Ns="srgb-linear",xc="linear",St="srgb",$r=7680,bh=519,Yv=512,Kv=513,Jv=514,$m=515,Zv=516,Qv=517,ex=518,tx=519,wh=35044,Th="300 es",Ii=2e3,ec=2001;class Os{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Kc=Math.PI/180,tc=180/Math.PI;function Vo(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(en[r&255]+en[r>>8&255]+en[r>>16&255]+en[r>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]).toLowerCase()}function vn(r,e,t){return Math.max(e,Math.min(t,r))}function nx(r,e){return(r%e+e)%e}function Jc(r,e,t){return(1-t)*r+t*e}function eo(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function gn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}class ot{constructor(e=0,t=0){ot.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*i+e.x,this.y=s*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class tt{constructor(e,t,n,i,s,o,a,c,l){tt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,c,l)}set(e,t,n,i,s,o,a,c,l){const f=this.elements;return f[0]=e,f[1]=i,f[2]=a,f[3]=t,f[4]=s,f[5]=c,f[6]=n,f[7]=o,f[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],f=n[4],u=n[7],h=n[2],d=n[5],g=n[8],_=i[0],m=i[3],p=i[6],y=i[1],b=i[4],v=i[7],C=i[2],R=i[5],w=i[8];return s[0]=o*_+a*y+c*C,s[3]=o*m+a*b+c*R,s[6]=o*p+a*v+c*w,s[1]=l*_+f*y+u*C,s[4]=l*m+f*b+u*R,s[7]=l*p+f*v+u*w,s[2]=h*_+d*y+g*C,s[5]=h*m+d*b+g*R,s[8]=h*p+d*v+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],f=e[8];return t*o*f-t*a*l-n*s*f+n*a*c+i*s*l-i*o*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],f=e[8],u=f*o-a*l,h=a*c-f*s,d=l*s-o*c,g=t*u+n*h+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(i*l-f*n)*_,e[2]=(a*n-i*o)*_,e[3]=h*_,e[4]=(f*t-i*c)*_,e[5]=(i*s-a*t)*_,e[6]=d*_,e[7]=(n*c-l*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-i*l,i*c,-i*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Zc.makeScale(e,t)),this}rotate(e){return this.premultiply(Zc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Zc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Zc=new tt;function Ym(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function nc(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function ix(){const r=nc("canvas");return r.style.display="block",r}const Ah={};function co(r){r in Ah||(Ah[r]=!0,console.warn(r))}function rx(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function sx(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function ox(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const dt={enabled:!0,workingColorSpace:Ns,spaces:{},convert:function(r,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===St&&(r.r=Fi(r.r),r.g=Fi(r.g),r.b=Fi(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===St&&(r.r=ms(r.r),r.g=ms(r.g),r.b=ms(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ji?xc:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function Fi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function ms(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}const Rh=[.64,.33,.3,.6,.15,.06],Ch=[.2126,.7152,.0722],Dh=[.3127,.329],Ph=new tt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Uh=new tt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);dt.define({[Ns]:{primaries:Rh,whitePoint:Dh,transfer:xc,toXYZ:Ph,fromXYZ:Uh,luminanceCoefficients:Ch,workingColorSpaceConfig:{unpackColorSpace:In},outputColorSpaceConfig:{drawingBufferColorSpace:In}},[In]:{primaries:Rh,whitePoint:Dh,transfer:St,toXYZ:Ph,fromXYZ:Uh,luminanceCoefficients:Ch,outputColorSpaceConfig:{drawingBufferColorSpace:In}}});let Yr;class ax{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Yr===void 0&&(Yr=nc("canvas")),Yr.width=e.width,Yr.height=e.height;const n=Yr.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Yr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){const t=nc("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=Fi(s[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Fi(t[n]/255)*255):t[n]=Fi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let cx=0;class Km{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cx++}),this.uuid=Vo(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(Qc(i[o].image)):s.push(Qc(i[o]))}else s=Qc(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Qc(r){return typeof HTMLImageElement!="undefined"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&r instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&r instanceof ImageBitmap?ax.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let lx=0;class cn extends Os{constructor(e=cn.DEFAULT_IMAGE,t=cn.DEFAULT_MAPPING,n=Tr,i=Tr,s=zn,o=Ar,a=ti,c=ki,l=cn.DEFAULT_ANISOTROPY,f=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lx++}),this.uuid=Vo(),this.name="",this.source=new Km(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ot(0,0),this.repeat=new ot(1,1),this.center=new ot(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case af:e.x=e.x-Math.floor(e.x);break;case Tr:e.x=e.x<0?0:1;break;case cf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case af:e.y=e.y-Math.floor(e.y);break;case Tr:e.y=e.y<0?0:1;break;case cf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=Fm;cn.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,n=0,i=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const c=e.elements,l=c[0],f=c[4],u=c[8],h=c[1],d=c[5],g=c[9],_=c[2],m=c[6],p=c[10];if(Math.abs(f-h)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(f+h)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(l+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(l+1)/2,v=(d+1)/2,C=(p+1)/2,R=(f+h)/4,w=(u+_)/4,A=(g+m)/4;return b>v&&b>C?b<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(b),i=R/n,s=w/n):v>C?v<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(v),n=R/i,s=A/i):C<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(C),n=w/s,i=A/s),this.set(n,i,s,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(h-f)*(h-f));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(h-f)/y,this.w=Math.acos((l+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class fx extends Os{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:zn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new cn(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Km(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Nr extends fx{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Jm extends cn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ri,this.minFilter=ri,this.wrapR=Tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ux extends cn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ri,this.minFilter=ri,this.wrapR=Tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ho{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,o,a){let c=n[i+0],l=n[i+1],f=n[i+2],u=n[i+3];const h=s[o+0],d=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=f,e[t+3]=u;return}if(a===1){e[t+0]=h,e[t+1]=d,e[t+2]=g,e[t+3]=_;return}if(u!==_||c!==h||l!==d||f!==g){let m=1-a;const p=c*h+l*d+f*g+u*_,y=p>=0?1:-1,b=1-p*p;if(b>Number.EPSILON){const C=Math.sqrt(b),R=Math.atan2(C,p*y);m=Math.sin(m*R)/C,a=Math.sin(a*R)/C}const v=a*y;if(c=c*m+h*v,l=l*m+d*v,f=f*m+g*v,u=u*m+_*v,m===1-a){const C=1/Math.sqrt(c*c+l*l+f*f+u*u);c*=C,l*=C,f*=C,u*=C}}e[t]=c,e[t+1]=l,e[t+2]=f,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,o){const a=n[i],c=n[i+1],l=n[i+2],f=n[i+3],u=s[o],h=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+f*u+c*d-l*h,e[t+1]=c*g+f*h+l*u-a*d,e[t+2]=l*g+f*d+a*h-c*u,e[t+3]=f*g-a*u-c*h-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),f=a(i/2),u=a(s/2),h=c(n/2),d=c(i/2),g=c(s/2);switch(o){case"XYZ":this._x=h*f*u+l*d*g,this._y=l*d*u-h*f*g,this._z=l*f*g+h*d*u,this._w=l*f*u-h*d*g;break;case"YXZ":this._x=h*f*u+l*d*g,this._y=l*d*u-h*f*g,this._z=l*f*g-h*d*u,this._w=l*f*u+h*d*g;break;case"ZXY":this._x=h*f*u-l*d*g,this._y=l*d*u+h*f*g,this._z=l*f*g+h*d*u,this._w=l*f*u-h*d*g;break;case"ZYX":this._x=h*f*u-l*d*g,this._y=l*d*u+h*f*g,this._z=l*f*g-h*d*u,this._w=l*f*u+h*d*g;break;case"YZX":this._x=h*f*u+l*d*g,this._y=l*d*u+h*f*g,this._z=l*f*g-h*d*u,this._w=l*f*u-h*d*g;break;case"XZY":this._x=h*f*u-l*d*g,this._y=l*d*u-h*f*g,this._z=l*f*g+h*d*u,this._w=l*f*u+h*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],f=t[6],u=t[10],h=n+a+u;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(f-c)*d,this._y=(s-l)*d,this._z=(o-i)*d}else if(n>a&&n>u){const d=2*Math.sqrt(1+n-a-u);this._w=(f-c)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(s+l)/d}else if(a>u){const d=2*Math.sqrt(1+a-n-u);this._w=(s-l)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(c+f)/d}else{const d=2*Math.sqrt(1+u-n-a);this._w=(o-i)/d,this._x=(s+l)/d,this._y=(c+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vn(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,f=t._w;return this._x=n*f+o*a+i*l-s*c,this._y=i*f+o*c+s*a-n*l,this._z=s*f+o*l+n*c-i*a,this._w=o*f-n*a-i*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;const c=1-a*a;if(c<=Number.EPSILON){const d=1-t;return this._w=d*o+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),f=Math.atan2(l,a),u=Math.sin((1-t)*f)/l,h=Math.sin(t*f)/l;return this._w=o*u+this._w*h,this._x=n*u+this._x*h,this._y=i*u+this._y*h,this._z=s*u+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ie{constructor(e=0,t=0,n=0){ie.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ih.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ih.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*i-a*n),f=2*(a*t-s*i),u=2*(s*n-o*t);return this.x=t+c*l+o*u-a*f,this.y=n+c*f+a*l-s*u,this.z=i+c*u+s*f-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-s*a,this.y=s*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return el.copy(this).projectOnVector(e),this.sub(el)}reflect(e){return this.sub(el.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const el=new ie,Ih=new Ho;class kr{constructor(e=new ie(1/0,1/0,1/0),t=new ie(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Xn):Xn.fromBufferAttribute(s,o),Xn.applyMatrix4(e.matrixWorld),this.expandByPoint(Xn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),la.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),la.copy(n.boundingBox)),la.applyMatrix4(e.matrixWorld),this.union(la)}const i=e.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xn),Xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(to),fa.subVectors(this.max,to),Kr.subVectors(e.a,to),Jr.subVectors(e.b,to),Zr.subVectors(e.c,to),Hi.subVectors(Jr,Kr),Wi.subVectors(Zr,Jr),ur.subVectors(Kr,Zr);let t=[0,-Hi.z,Hi.y,0,-Wi.z,Wi.y,0,-ur.z,ur.y,Hi.z,0,-Hi.x,Wi.z,0,-Wi.x,ur.z,0,-ur.x,-Hi.y,Hi.x,0,-Wi.y,Wi.x,0,-ur.y,ur.x,0];return!tl(t,Kr,Jr,Zr,fa)||(t=[1,0,0,0,1,0,0,0,1],!tl(t,Kr,Jr,Zr,fa))?!1:(ua.crossVectors(Hi,Wi),t=[ua.x,ua.y,ua.z],tl(t,Kr,Jr,Zr,fa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Mi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Mi=[new ie,new ie,new ie,new ie,new ie,new ie,new ie,new ie],Xn=new ie,la=new kr,Kr=new ie,Jr=new ie,Zr=new ie,Hi=new ie,Wi=new ie,ur=new ie,to=new ie,fa=new ie,ua=new ie,hr=new ie;function tl(r,e,t,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){hr.fromArray(r,s);const a=i.x*Math.abs(hr.x)+i.y*Math.abs(hr.y)+i.z*Math.abs(hr.z),c=e.dot(hr),l=t.dot(hr),f=n.dot(hr);if(Math.max(-Math.max(c,l,f),Math.min(c,l,f))>a)return!1}return!0}const hx=new kr,no=new ie,nl=new ie;class Wo{constructor(e=new ie,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):hx.setFromPoints(e).getCenter(n);let i=0;for(let s=0,o=e.length;s<o;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;no.subVectors(e,this.center);const t=no.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(no,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(no.copy(e.center).add(nl)),this.expandByPoint(no.copy(e.center).sub(nl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const bi=new ie,il=new ie,ha=new ie,Xi=new ie,rl=new ie,da=new ie,sl=new ie;class du{constructor(e=new ie,t=new ie(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,bi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=bi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(bi.copy(this.origin).addScaledVector(this.direction,t),bi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){il.copy(e).add(t).multiplyScalar(.5),ha.copy(t).sub(e).normalize(),Xi.copy(this.origin).sub(il);const s=e.distanceTo(t)*.5,o=-this.direction.dot(ha),a=Xi.dot(this.direction),c=-Xi.dot(ha),l=Xi.lengthSq(),f=Math.abs(1-o*o);let u,h,d,g;if(f>0)if(u=o*c-a,h=o*a-c,g=s*f,u>=0)if(h>=-g)if(h<=g){const _=1/f;u*=_,h*=_,d=u*(u+o*h+2*a)+h*(o*u+h+2*c)+l}else h=s,u=Math.max(0,-(o*h+a)),d=-u*u+h*(h+2*c)+l;else h=-s,u=Math.max(0,-(o*h+a)),d=-u*u+h*(h+2*c)+l;else h<=-g?(u=Math.max(0,-(-o*s+a)),h=u>0?-s:Math.min(Math.max(-s,-c),s),d=-u*u+h*(h+2*c)+l):h<=g?(u=0,h=Math.min(Math.max(-s,-c),s),d=h*(h+2*c)+l):(u=Math.max(0,-(o*s+a)),h=u>0?s:Math.min(Math.max(-s,-c),s),d=-u*u+h*(h+2*c)+l);else h=o>0?-s:s,u=Math.max(0,-(o*h+a)),d=-u*u+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(il).addScaledVector(ha,h),d}intersectSphere(e,t){bi.subVectors(e.center,this.origin);const n=bi.dot(this.direction),i=bi.dot(bi)-n*n,s=e.radius*e.radius;if(i>s)return null;const o=Math.sqrt(s-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,o,a,c;const l=1/this.direction.x,f=1/this.direction.y,u=1/this.direction.z,h=this.origin;return l>=0?(n=(e.min.x-h.x)*l,i=(e.max.x-h.x)*l):(n=(e.max.x-h.x)*l,i=(e.min.x-h.x)*l),f>=0?(s=(e.min.y-h.y)*f,o=(e.max.y-h.y)*f):(s=(e.max.y-h.y)*f,o=(e.min.y-h.y)*f),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-h.z)*u,c=(e.max.z-h.z)*u):(a=(e.max.z-h.z)*u,c=(e.min.z-h.z)*u),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,bi)!==null}intersectTriangle(e,t,n,i,s){rl.subVectors(t,e),da.subVectors(n,e),sl.crossVectors(rl,da);let o=this.direction.dot(sl),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Xi.subVectors(this.origin,e);const c=a*this.direction.dot(da.crossVectors(Xi,da));if(c<0)return null;const l=a*this.direction.dot(rl.cross(Xi));if(l<0||c+l>o)return null;const f=-a*Xi.dot(sl);return f<0?null:this.at(f/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class wt{constructor(e,t,n,i,s,o,a,c,l,f,u,h,d,g,_,m){wt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,c,l,f,u,h,d,g,_,m)}set(e,t,n,i,s,o,a,c,l,f,u,h,d,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=f,p[10]=u,p[14]=h,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new wt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/Qr.setFromMatrixColumn(e,0).length(),s=1/Qr.setFromMatrixColumn(e,1).length(),o=1/Qr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),f=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const h=o*f,d=o*u,g=a*f,_=a*u;t[0]=c*f,t[4]=-c*u,t[8]=l,t[1]=d+g*l,t[5]=h-_*l,t[9]=-a*c,t[2]=_-h*l,t[6]=g+d*l,t[10]=o*c}else if(e.order==="YXZ"){const h=c*f,d=c*u,g=l*f,_=l*u;t[0]=h+_*a,t[4]=g*a-d,t[8]=o*l,t[1]=o*u,t[5]=o*f,t[9]=-a,t[2]=d*a-g,t[6]=_+h*a,t[10]=o*c}else if(e.order==="ZXY"){const h=c*f,d=c*u,g=l*f,_=l*u;t[0]=h-_*a,t[4]=-o*u,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*f,t[9]=_-h*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const h=o*f,d=o*u,g=a*f,_=a*u;t[0]=c*f,t[4]=g*l-d,t[8]=h*l+_,t[1]=c*u,t[5]=_*l+h,t[9]=d*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const h=o*c,d=o*l,g=a*c,_=a*l;t[0]=c*f,t[4]=_-h*u,t[8]=g*u+d,t[1]=u,t[5]=o*f,t[9]=-a*f,t[2]=-l*f,t[6]=d*u+g,t[10]=h-_*u}else if(e.order==="XZY"){const h=o*c,d=o*l,g=a*c,_=a*l;t[0]=c*f,t[4]=-u,t[8]=l*f,t[1]=h*u+_,t[5]=o*f,t[9]=d*u-g,t[2]=g*u-d,t[6]=a*f,t[10]=_*u+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(dx,e,px)}lookAt(e,t,n){const i=this.elements;return Rn.subVectors(e,t),Rn.lengthSq()===0&&(Rn.z=1),Rn.normalize(),qi.crossVectors(n,Rn),qi.lengthSq()===0&&(Math.abs(n.z)===1?Rn.x+=1e-4:Rn.z+=1e-4,Rn.normalize(),qi.crossVectors(n,Rn)),qi.normalize(),pa.crossVectors(Rn,qi),i[0]=qi.x,i[4]=pa.x,i[8]=Rn.x,i[1]=qi.y,i[5]=pa.y,i[9]=Rn.y,i[2]=qi.z,i[6]=pa.z,i[10]=Rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],f=n[1],u=n[5],h=n[9],d=n[13],g=n[2],_=n[6],m=n[10],p=n[14],y=n[3],b=n[7],v=n[11],C=n[15],R=i[0],w=i[4],A=i[8],S=i[12],x=i[1],F=i[5],I=i[9],E=i[13],P=i[2],O=i[6],U=i[10],B=i[14],z=i[3],X=i[7],V=i[11],N=i[15];return s[0]=o*R+a*x+c*P+l*z,s[4]=o*w+a*F+c*O+l*X,s[8]=o*A+a*I+c*U+l*V,s[12]=o*S+a*E+c*B+l*N,s[1]=f*R+u*x+h*P+d*z,s[5]=f*w+u*F+h*O+d*X,s[9]=f*A+u*I+h*U+d*V,s[13]=f*S+u*E+h*B+d*N,s[2]=g*R+_*x+m*P+p*z,s[6]=g*w+_*F+m*O+p*X,s[10]=g*A+_*I+m*U+p*V,s[14]=g*S+_*E+m*B+p*N,s[3]=y*R+b*x+v*P+C*z,s[7]=y*w+b*F+v*O+C*X,s[11]=y*A+b*I+v*U+C*V,s[15]=y*S+b*E+v*B+C*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],f=e[2],u=e[6],h=e[10],d=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*c*u-i*l*u-s*a*h+n*l*h+i*a*d-n*c*d)+_*(+t*c*d-t*l*h+s*o*h-i*o*d+i*l*f-s*c*f)+m*(+t*l*u-t*a*d-s*o*u+n*o*d+s*a*f-n*l*f)+p*(-i*a*f-t*c*u+t*a*h+i*o*u-n*o*h+n*c*f)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],f=e[8],u=e[9],h=e[10],d=e[11],g=e[12],_=e[13],m=e[14],p=e[15],y=u*m*l-_*h*l+_*c*d-a*m*d-u*c*p+a*h*p,b=g*h*l-f*m*l-g*c*d+o*m*d+f*c*p-o*h*p,v=f*_*l-g*u*l+g*a*d-o*_*d-f*a*p+o*u*p,C=g*u*c-f*_*c-g*a*h+o*_*h+f*a*m-o*u*m,R=t*y+n*b+i*v+s*C;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/R;return e[0]=y*w,e[1]=(_*h*s-u*m*s-_*i*d+n*m*d+u*i*p-n*h*p)*w,e[2]=(a*m*s-_*c*s+_*i*l-n*m*l-a*i*p+n*c*p)*w,e[3]=(u*c*s-a*h*s-u*i*l+n*h*l+a*i*d-n*c*d)*w,e[4]=b*w,e[5]=(f*m*s-g*h*s+g*i*d-t*m*d-f*i*p+t*h*p)*w,e[6]=(g*c*s-o*m*s-g*i*l+t*m*l+o*i*p-t*c*p)*w,e[7]=(o*h*s-f*c*s+f*i*l-t*h*l-o*i*d+t*c*d)*w,e[8]=v*w,e[9]=(g*u*s-f*_*s-g*n*d+t*_*d+f*n*p-t*u*p)*w,e[10]=(o*_*s-g*a*s+g*n*l-t*_*l-o*n*p+t*a*p)*w,e[11]=(f*a*s-o*u*s-f*n*l+t*u*l+o*n*d-t*a*d)*w,e[12]=C*w,e[13]=(f*_*i-g*u*i+g*n*h-t*_*h-f*n*m+t*u*m)*w,e[14]=(g*a*i-o*_*i-g*n*c+t*_*c+o*n*m-t*a*m)*w,e[15]=(o*u*i-f*a*i+f*n*c-t*u*c-o*n*h+t*a*h)*w,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,o=e.x,a=e.y,c=e.z,l=s*o,f=s*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,f*a+n,f*c-i*o,0,l*c-i*a,f*c+i*o,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,o){return this.set(1,n,s,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,f=o+o,u=a+a,h=s*l,d=s*f,g=s*u,_=o*f,m=o*u,p=a*u,y=c*l,b=c*f,v=c*u,C=n.x,R=n.y,w=n.z;return i[0]=(1-(_+p))*C,i[1]=(d+v)*C,i[2]=(g-b)*C,i[3]=0,i[4]=(d-v)*R,i[5]=(1-(h+p))*R,i[6]=(m+y)*R,i[7]=0,i[8]=(g+b)*w,i[9]=(m-y)*w,i[10]=(1-(h+_))*w,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=Qr.set(i[0],i[1],i[2]).length();const o=Qr.set(i[4],i[5],i[6]).length(),a=Qr.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],qn.copy(this);const l=1/s,f=1/o,u=1/a;return qn.elements[0]*=l,qn.elements[1]*=l,qn.elements[2]*=l,qn.elements[4]*=f,qn.elements[5]*=f,qn.elements[6]*=f,qn.elements[8]*=u,qn.elements[9]*=u,qn.elements[10]*=u,t.setFromRotationMatrix(qn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,i,s,o,a=Ii){const c=this.elements,l=2*s/(t-e),f=2*s/(n-i),u=(t+e)/(t-e),h=(n+i)/(n-i);let d,g;if(a===Ii)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===ec)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=d,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,s,o,a=Ii){const c=this.elements,l=1/(t-e),f=1/(n-i),u=1/(o-s),h=(t+e)*l,d=(n+i)*f;let g,_;if(a===Ii)g=(o+s)*u,_=-2*u;else if(a===ec)g=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-h,c[1]=0,c[5]=2*f,c[9]=0,c[13]=-d,c[2]=0,c[6]=0,c[10]=_,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Qr=new ie,qn=new wt,dx=new ie(0,0,0),px=new ie(1,1,1),qi=new ie,pa=new ie,Rn=new ie,Lh=new wt,Fh=new Ho;class xi{constructor(e=0,t=0,n=0,i=xi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],o=i[4],a=i[8],c=i[1],l=i[5],f=i[9],u=i[2],h=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(vn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-vn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(vn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-vn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(vn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-f,l),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-vn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-f,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Lh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Fh.setFromEuler(this),this.setFromQuaternion(Fh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}xi.DEFAULT_ORDER="XYZ";class pu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let mx=0;const Nh=new ie,es=new Ho,wi=new wt,ma=new ie,io=new ie,gx=new ie,_x=new Ho,Oh=new ie(1,0,0),Bh=new ie(0,1,0),kh=new ie(0,0,1),zh={type:"added"},vx={type:"removed"},ts={type:"childadded",child:null},ol={type:"childremoved",child:null};class Xt extends Os{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mx++}),this.uuid=Vo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xt.DEFAULT_UP.clone();const e=new ie,t=new xi,n=new Ho,i=new ie(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new wt},normalMatrix:{value:new tt}}),this.matrix=new wt,this.matrixWorld=new wt,this.matrixAutoUpdate=Xt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return es.setFromAxisAngle(e,t),this.quaternion.multiply(es),this}rotateOnWorldAxis(e,t){return es.setFromAxisAngle(e,t),this.quaternion.premultiply(es),this}rotateX(e){return this.rotateOnAxis(Oh,e)}rotateY(e){return this.rotateOnAxis(Bh,e)}rotateZ(e){return this.rotateOnAxis(kh,e)}translateOnAxis(e,t){return Nh.copy(e).applyQuaternion(this.quaternion),this.position.add(Nh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Oh,e)}translateY(e){return this.translateOnAxis(Bh,e)}translateZ(e){return this.translateOnAxis(kh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(wi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ma.copy(e):ma.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),io.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wi.lookAt(io,ma,this.up):wi.lookAt(ma,io,this.up),this.quaternion.setFromRotationMatrix(wi),i&&(wi.extractRotation(i.matrixWorld),es.setFromRotationMatrix(wi),this.quaternion.premultiply(es.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(zh),ts.child=e,this.dispatchEvent(ts),ts.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vx),ol.child=e,this.dispatchEvent(ol),ol.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),wi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),wi.multiply(e.parent.matrixWorld)),e.applyMatrix4(wi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(zh),ts.child=e,this.dispatchEvent(ts),ts.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(io,e,gx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(io,_x,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,f=c.length;l<f;l++){const u=c[l];s(e.shapes,u)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(e.materials,this.material[c]));i.material=a}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];i.animations.push(s(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),f=o(e.images),u=o(e.shapes),h=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),f.length>0&&(n.images=f),u.length>0&&(n.shapes=u),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const c=[];for(const l in a){const f=a[l];delete f.metadata,c.push(f)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Xt.DEFAULT_UP=new ie(0,1,0);Xt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jn=new ie,Ti=new ie,al=new ie,Ai=new ie,ns=new ie,is=new ie,Gh=new ie,cl=new ie,ll=new ie,fl=new ie,ul=new xt,hl=new xt,dl=new xt;class Qn{constructor(e=new ie,t=new ie,n=new ie){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),jn.subVectors(e,t),i.cross(jn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){jn.subVectors(i,t),Ti.subVectors(n,t),al.subVectors(e,t);const o=jn.dot(jn),a=jn.dot(Ti),c=jn.dot(al),l=Ti.dot(Ti),f=Ti.dot(al),u=o*l-a*a;if(u===0)return s.set(0,0,0),null;const h=1/u,d=(l*c-a*f)*h,g=(o*f-a*c)*h;return s.set(1-d-g,g,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Ai)===null?!1:Ai.x>=0&&Ai.y>=0&&Ai.x+Ai.y<=1}static getInterpolation(e,t,n,i,s,o,a,c){return this.getBarycoord(e,t,n,i,Ai)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ai.x),c.addScaledVector(o,Ai.y),c.addScaledVector(a,Ai.z),c)}static getInterpolatedAttribute(e,t,n,i,s,o){return ul.setScalar(0),hl.setScalar(0),dl.setScalar(0),ul.fromBufferAttribute(e,t),hl.fromBufferAttribute(e,n),dl.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(ul,s.x),o.addScaledVector(hl,s.y),o.addScaledVector(dl,s.z),o}static isFrontFacing(e,t,n,i){return jn.subVectors(n,t),Ti.subVectors(e,t),jn.cross(Ti).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jn.subVectors(this.c,this.b),Ti.subVectors(this.a,this.b),jn.cross(Ti).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Qn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Qn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return Qn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return Qn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Qn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let o,a;ns.subVectors(i,n),is.subVectors(s,n),cl.subVectors(e,n);const c=ns.dot(cl),l=is.dot(cl);if(c<=0&&l<=0)return t.copy(n);ll.subVectors(e,i);const f=ns.dot(ll),u=is.dot(ll);if(f>=0&&u<=f)return t.copy(i);const h=c*u-f*l;if(h<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(ns,o);fl.subVectors(e,s);const d=ns.dot(fl),g=is.dot(fl);if(g>=0&&d<=g)return t.copy(s);const _=d*l-c*g;if(_<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(is,a);const m=f*g-d*u;if(m<=0&&u-f>=0&&d-g>=0)return Gh.subVectors(s,i),a=(u-f)/(u-f+(d-g)),t.copy(i).addScaledVector(Gh,a);const p=1/(m+_+h);return o=_*p,a=h*p,t.copy(n).addScaledVector(ns,o).addScaledVector(is,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Zm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ji={h:0,s:0,l:0},ga={h:0,s:0,l:0};function pl(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class et{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=In){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=dt.workingColorSpace){if(e=nx(e,1),t=vn(t,0,1),n=vn(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=pl(o,s,e+1/3),this.g=pl(o,s,e),this.b=pl(o,s,e-1/3)}return dt.toWorkingColorSpace(this,i),this}setStyle(e,t=In){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=In){const n=Zm[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fi(e.r),this.g=Fi(e.g),this.b=Fi(e.b),this}copyLinearToSRGB(e){return this.r=ms(e.r),this.g=ms(e.g),this.b=ms(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=In){return dt.fromWorkingColorSpace(tn.copy(this),e),Math.round(vn(tn.r*255,0,255))*65536+Math.round(vn(tn.g*255,0,255))*256+Math.round(vn(tn.b*255,0,255))}getHexString(e=In){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.fromWorkingColorSpace(tn.copy(this),t);const n=tn.r,i=tn.g,s=tn.b,o=Math.max(n,i,s),a=Math.min(n,i,s);let c,l;const f=(a+o)/2;if(a===o)c=0,l=0;else{const u=o-a;switch(l=f<=.5?u/(o+a):u/(2-o-a),o){case n:c=(i-s)/u+(i<s?6:0);break;case i:c=(s-n)/u+2;break;case s:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=f,e}getRGB(e,t=dt.workingColorSpace){return dt.fromWorkingColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=In){dt.fromWorkingColorSpace(tn.copy(this),e);const t=tn.r,n=tn.g,i=tn.b;return e!==In?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ji),this.setHSL(ji.h+e,ji.s+t,ji.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ji),e.getHSL(ga);const n=Jc(ji.h,ga.h,t),i=Jc(ji.s,ga.s,t),s=Jc(ji.l,ga.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new et;et.NAMES=Zm;let xx=0;class Bs extends Os{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:xx++}),this.uuid=Vo(),this.name="",this.blending=ds,this.side=or,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Yl,this.blendDst=Kl,this.blendEquation=yr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new et(0,0,0),this.blendAlpha=0,this.depthFunc=Ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$r,this.stencilZFail=$r,this.stencilZPass=$r,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ds&&(n.blending=this.blending),this.side!==or&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Yl&&(n.blendSrc=this.blendSrc),this.blendDst!==Kl&&(n.blendDst=this.blendDst),this.blendEquation!==yr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ts&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==$r&&(n.stencilFail=this.stencilFail),this.stencilZFail!==$r&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==$r&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(t){const s=i(e.textures),o=i(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Mo extends Bs{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.combine=Lm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const It=new ie,_a=new ot;class Gn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=wh,this.updateRanges=[],this.gpuType=Ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)_a.fromBufferAttribute(this,t),_a.applyMatrix3(e),this.setXY(t,_a.x,_a.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=eo(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=gn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=eo(t,this.array)),t}setX(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=eo(t,this.array)),t}setY(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=eo(t,this.array)),t}setZ(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=eo(t,this.array)),t}setW(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array),i=gn(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array),i=gn(i,this.array),s=gn(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==wh&&(e.usage=this.usage),e}}class Qm extends Gn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class eg extends Gn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class sn extends Gn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let yx=0;const Bn=new wt,ml=new Xt,rs=new ie,Cn=new kr,ro=new kr,Gt=new ie;class Nn extends Os{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yx++}),this.uuid=Vo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ym(e)?eg:Qm)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new tt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Bn.makeRotationFromQuaternion(e),this.applyMatrix4(Bn),this}rotateX(e){return Bn.makeRotationX(e),this.applyMatrix4(Bn),this}rotateY(e){return Bn.makeRotationY(e),this.applyMatrix4(Bn),this}rotateZ(e){return Bn.makeRotationZ(e),this.applyMatrix4(Bn),this}translate(e,t,n){return Bn.makeTranslation(e,t,n),this.applyMatrix4(Bn),this}scale(e,t,n){return Bn.makeScale(e,t,n),this.applyMatrix4(Bn),this}lookAt(e){return ml.lookAt(e),ml.updateMatrix(),this.applyMatrix4(ml.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rs).negate(),this.translate(rs.x,rs.y,rs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new sn(n,3))}else{for(let n=0,i=t.count;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new kr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ie(-1/0,-1/0,-1/0),new ie(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];Cn.setFromBufferAttribute(s),this.morphTargetsRelative?(Gt.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint(Gt),Gt.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint(Gt)):(this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ie,1/0);return}if(e){const n=this.boundingSphere.center;if(Cn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];ro.setFromBufferAttribute(a),this.morphTargetsRelative?(Gt.addVectors(Cn.min,ro.min),Cn.expandByPoint(Gt),Gt.addVectors(Cn.max,ro.max),Cn.expandByPoint(Gt)):(Cn.expandByPoint(ro.min),Cn.expandByPoint(ro.max))}Cn.getCenter(n);let i=0;for(let s=0,o=e.count;s<o;s++)Gt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Gt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],c=this.morphTargetsRelative;for(let l=0,f=a.count;l<f;l++)Gt.fromBufferAttribute(a,l),c&&(rs.fromBufferAttribute(e,l),Gt.add(rs)),i=Math.max(i,n.distanceToSquared(Gt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Gn(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let A=0;A<n.count;A++)a[A]=new ie,c[A]=new ie;const l=new ie,f=new ie,u=new ie,h=new ot,d=new ot,g=new ot,_=new ie,m=new ie;function p(A,S,x){l.fromBufferAttribute(n,A),f.fromBufferAttribute(n,S),u.fromBufferAttribute(n,x),h.fromBufferAttribute(s,A),d.fromBufferAttribute(s,S),g.fromBufferAttribute(s,x),f.sub(l),u.sub(l),d.sub(h),g.sub(h);const F=1/(d.x*g.y-g.x*d.y);isFinite(F)&&(_.copy(f).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(F),m.copy(u).multiplyScalar(d.x).addScaledVector(f,-g.x).multiplyScalar(F),a[A].add(_),a[S].add(_),a[x].add(_),c[A].add(m),c[S].add(m),c[x].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let A=0,S=y.length;A<S;++A){const x=y[A],F=x.start,I=x.count;for(let E=F,P=F+I;E<P;E+=3)p(e.getX(E+0),e.getX(E+1),e.getX(E+2))}const b=new ie,v=new ie,C=new ie,R=new ie;function w(A){C.fromBufferAttribute(i,A),R.copy(C);const S=a[A];b.copy(S),b.sub(C.multiplyScalar(C.dot(S))).normalize(),v.crossVectors(R,S);const F=v.dot(c[A])<0?-1:1;o.setXYZW(A,b.x,b.y,b.z,F)}for(let A=0,S=y.length;A<S;++A){const x=y[A],F=x.start,I=x.count;for(let E=F,P=F+I;E<P;E+=3)w(e.getX(E+0)),w(e.getX(E+1)),w(e.getX(E+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Gn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);const i=new ie,s=new ie,o=new ie,a=new ie,c=new ie,l=new ie,f=new ie,u=new ie;if(e)for(let h=0,d=e.count;h<d;h+=3){const g=e.getX(h+0),_=e.getX(h+1),m=e.getX(h+2);i.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),f.subVectors(o,s),u.subVectors(i,s),f.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,_),l.fromBufferAttribute(n,m),a.add(f),c.add(f),l.add(f),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let h=0,d=t.count;h<d;h+=3)i.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),f.subVectors(o,s),u.subVectors(i,s),f.cross(u),n.setXYZ(h+0,f.x,f.y,f.z),n.setXYZ(h+1,f.x,f.y,f.z),n.setXYZ(h+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Gt.fromBufferAttribute(e,t),Gt.normalize(),e.setXYZ(t,Gt.x,Gt.y,Gt.z)}toNonIndexed(){function e(a,c){const l=a.array,f=a.itemSize,u=a.normalized,h=new l.constructor(c.length*f);let d=0,g=0;for(let _=0,m=c.length;_<m;_++){a.isInterleavedBufferAttribute?d=c[_]*a.data.stride+a.offset:d=c[_]*f;for(let p=0;p<f;p++)h[g++]=l[d++]}return new Gn(h,f,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Nn,n=this.index.array,i=this.attributes;for(const a in i){const c=i[a],l=e(c,n);t.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let f=0,u=l.length;f<u;f++){const h=l[f],d=e(h,n);c.push(d)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],f=[];for(let u=0,h=l.length;u<h;u++){const d=l[u];f.push(d.toJSON(e.data))}f.length>0&&(i[c]=f,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const l in i){const f=i[l];this.setAttribute(l,f.clone(t))}const s=e.morphAttributes;for(const l in s){const f=[],u=s[l];for(let h=0,d=u.length;h<d;h++)f.push(u[h].clone(t));this.morphAttributes[l]=f}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,f=o.length;l<f;l++){const u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Vh=new wt,dr=new du,va=new Wo,Hh=new ie,xa=new ie,ya=new ie,Sa=new ie,gl=new ie,Ea=new ie,Wh=new ie,Ma=new ie;class Wt extends Xt{constructor(e=new Nn,t=new Mo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(s&&a){Ea.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const f=a[c],u=s[c];f!==0&&(gl.fromBufferAttribute(u,e),o?Ea.addScaledVector(gl,f):Ea.addScaledVector(gl.sub(t),f))}t.add(Ea)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),va.copy(n.boundingSphere),va.applyMatrix4(s),dr.copy(e.ray).recast(e.near),!(va.containsPoint(dr.origin)===!1&&(dr.intersectSphere(va,Hh)===null||dr.origin.distanceToSquared(Hh)>(e.far-e.near)**2))&&(Vh.copy(s).invert(),dr.copy(e.ray).applyMatrix4(Vh),!(n.boundingBox!==null&&dr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,dr)))}_computeIntersections(e,t,n){let i;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,f=s.attributes.uv1,u=s.attributes.normal,h=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),b=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,C=b;v<C;v+=3){const R=a.getX(v),w=a.getX(v+1),A=a.getX(v+2);i=ba(this,p,e,n,l,f,u,R,w,A),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=a.getX(m),b=a.getX(m+1),v=a.getX(m+2);i=ba(this,o,e,n,l,f,u,y,b,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),b=Math.min(c.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,C=b;v<C;v+=3){const R=v,w=v+1,A=v+2;i=ba(this,p,e,n,l,f,u,R,w,A),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(c.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=m,b=m+1,v=m+2;i=ba(this,o,e,n,l,f,u,y,b,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function Sx(r,e,t,n,i,s,o,a){let c;if(e.side===En?c=n.intersectTriangle(o,s,i,!0,a):c=n.intersectTriangle(i,s,o,e.side===or,a),c===null)return null;Ma.copy(a),Ma.applyMatrix4(r.matrixWorld);const l=t.ray.origin.distanceTo(Ma);return l<t.near||l>t.far?null:{distance:l,point:Ma.clone(),object:r}}function ba(r,e,t,n,i,s,o,a,c,l){r.getVertexPosition(a,xa),r.getVertexPosition(c,ya),r.getVertexPosition(l,Sa);const f=Sx(r,e,t,n,xa,ya,Sa,Wh);if(f){const u=new ie;Qn.getBarycoord(Wh,xa,ya,Sa,u),i&&(f.uv=Qn.getInterpolatedAttribute(i,a,c,l,u,new ot)),s&&(f.uv1=Qn.getInterpolatedAttribute(s,a,c,l,u,new ot)),o&&(f.normal=Qn.getInterpolatedAttribute(o,a,c,l,u,new ie),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const h={a,b:c,c:l,normal:new ie,materialIndex:0};Qn.getNormal(xa,ya,Sa,h.normal),f.face=h,f.barycoord=u}return f}class Or extends Nn{constructor(e=1,t=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};const a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],f=[],u=[];let h=0,d=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,s,4),g("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(c),this.setAttribute("position",new sn(l,3)),this.setAttribute("normal",new sn(f,3)),this.setAttribute("uv",new sn(u,2));function g(_,m,p,y,b,v,C,R,w,A,S){const x=v/w,F=C/A,I=v/2,E=C/2,P=R/2,O=w+1,U=A+1;let B=0,z=0;const X=new ie;for(let V=0;V<U;V++){const N=V*F-E;for(let q=0;q<O;q++){const te=q*x-I;X[_]=te*y,X[m]=N*b,X[p]=P,l.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=R>0?1:-1,f.push(X.x,X.y,X.z),u.push(q/w),u.push(1-V/A),B+=1}}for(let V=0;V<A;V++)for(let N=0;N<w;N++){const q=h+N+O*V,te=h+N+O*(V+1),k=h+(N+1)+O*(V+1),H=h+(N+1)+O*V;c.push(q,te,H),c.push(te,k,H),z+=6}a.addGroup(d,z,S),d+=z,h+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Or(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ps(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function an(r){const e={};for(let t=0;t<r.length;t++){const n=Ps(r[t]);for(const i in n)e[i]=n[i]}return e}function Ex(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function tg(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}const ng={clone:Ps,merge:an};var Mx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ar extends Bs{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mx,this.fragmentShader=bx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ps(e.uniforms),this.uniformsGroups=Ex(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class ig extends Xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new wt,this.projectionMatrix=new wt,this.projectionMatrixInverse=new wt,this.coordinateSystem=Ii}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const $i=new ie,Xh=new ot,qh=new ot;class xn extends ig{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=tc*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Kc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return tc*2*Math.atan(Math.tan(Kc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){$i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($i.x,$i.y).multiplyScalar(-e/$i.z),$i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set($i.x,$i.y).multiplyScalar(-e/$i.z)}getViewSize(e,t){return this.getViewBounds(e,Xh,qh),t.subVectors(qh,Xh)}setViewOffset(e,t,n,i,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Kc*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*i/c,t-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ss=-90,os=1;class wx extends Xt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new xn(ss,os,e,t);i.layers=this.layers,this.add(i);const s=new xn(ss,os,e,t);s.layers=this.layers,this.add(s);const o=new xn(ss,os,e,t);o.layers=this.layers,this.add(o);const a=new xn(ss,os,e,t);a.layers=this.layers,this.add(a);const c=new xn(ss,os,e,t);c.layers=this.layers,this.add(c);const l=new xn(ss,os,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,o,a,c]=t;for(const l of t)this.remove(l);if(e===Ii)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ec)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,f]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,f),e.setRenderTarget(u,h,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class rg extends cn{constructor(e,t,n,i,s,o,a,c,l,f){e=e!==void 0?e:[],t=t!==void 0?t:As,super(e,t,n,i,s,o,a,c,l,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Tx extends Nr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new rg(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:zn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Or(5,5,5),s=new ar({name:"CubemapFromEquirect",uniforms:Ps(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:En,blending:rr});s.uniforms.tEquirect.value=t;const o=new Wt(i,s),a=t.minFilter;return t.minFilter===Ar&&(t.minFilter=zn),new wx(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(s)}}const _l=new ie,Ax=new ie,Rx=new tt;class vr{constructor(e=new ie(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=_l.subVectors(n,t).cross(Ax.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(_l),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Rx.getNormalMatrix(e),i=this.coplanarPoint(_l).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const pr=new Wo,wa=new ie;class mu{constructor(e=new vr,t=new vr,n=new vr,i=new vr,s=new vr,o=new vr){this.planes=[e,t,n,i,s,o]}set(e,t,n,i,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ii){const n=this.planes,i=e.elements,s=i[0],o=i[1],a=i[2],c=i[3],l=i[4],f=i[5],u=i[6],h=i[7],d=i[8],g=i[9],_=i[10],m=i[11],p=i[12],y=i[13],b=i[14],v=i[15];if(n[0].setComponents(c-s,h-l,m-d,v-p).normalize(),n[1].setComponents(c+s,h+l,m+d,v+p).normalize(),n[2].setComponents(c+o,h+f,m+g,v+y).normalize(),n[3].setComponents(c-o,h-f,m-g,v-y).normalize(),n[4].setComponents(c-a,h-u,m-_,v-b).normalize(),t===Ii)n[5].setComponents(c+a,h+u,m+_,v+b).normalize();else if(t===ec)n[5].setComponents(a,u,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),pr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),pr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(pr)}intersectsSprite(e){return pr.center.set(0,0,0),pr.radius=.7071067811865476,pr.applyMatrix4(e.matrixWorld),this.intersectsSphere(pr)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(wa.x=i.normal.x>0?e.max.x:e.min.x,wa.y=i.normal.y>0?e.max.y:e.min.y,wa.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(wa)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function sg(){let r=null,e=!1,t=null,n=null;function i(s,o){t(s,o),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Cx(r){const e=new WeakMap;function t(a,c){const l=a.array,f=a.usage,u=l.byteLength,h=r.createBuffer();r.bindBuffer(c,h),r.bufferData(c,l,f),a.onUploadCallback();let d;if(l instanceof Float32Array)d=r.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=r.HALF_FLOAT:d=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=r.SHORT;else if(l instanceof Uint32Array)d=r.UNSIGNED_INT;else if(l instanceof Int32Array)d=r.INT;else if(l instanceof Int8Array)d=r.BYTE;else if(l instanceof Uint8Array)d=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){const f=c.array,u=c.updateRanges;if(r.bindBuffer(l,a),u.length===0)r.bufferSubData(l,0,f);else{u.sort((d,g)=>d.start-g.start);let h=0;for(let d=1;d<u.length;d++){const g=u[h],_=u[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,u[h]=_)}u.length=h+1;for(let d=0,g=u.length;d<g;d++){const _=u[d];r.bufferSubData(l,_.start*f.BYTES_PER_ELEMENT,f,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(r.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const f=e.get(a);(!f||f.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:s,update:o}}class zr extends Nn{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),l=a+1,f=c+1,u=e/a,h=t/c,d=[],g=[],_=[],m=[];for(let p=0;p<f;p++){const y=p*h-o;for(let b=0;b<l;b++){const v=b*u-s;g.push(v,-y,0),_.push(0,0,1),m.push(b/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let y=0;y<a;y++){const b=y+l*p,v=y+l*(p+1),C=y+1+l*(p+1),R=y+1+l*p;d.push(b,v,R),d.push(v,C,R)}this.setIndex(d),this.setAttribute("position",new sn(g,3)),this.setAttribute("normal",new sn(_,3)),this.setAttribute("uv",new sn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zr(e.width,e.height,e.widthSegments,e.heightSegments)}}var Dx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Px=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ux=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ix=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Fx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Nx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ox=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,kx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,zx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Vx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Hx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Xx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,jx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$x=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Yx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Kx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Jx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Zx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Qx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ey=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ty=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ny=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,iy=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ry=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,sy=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,oy="gl_FragColor = linearToOutputTexel( gl_FragColor );",ay=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ly=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,fy=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,uy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,hy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,dy=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,py=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,my=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_y=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,vy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,xy=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,yy=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Sy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ey=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,My=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,by=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,wy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ty=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ay=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ry=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cy=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Dy=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Py=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Uy=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Iy=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ly=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fy=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ny=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Oy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,By=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ky=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Gy=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Vy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hy=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Wy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xy=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,qy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$y=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Yy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ky=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jy=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Zy=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Qy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,eS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tS=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,nS=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,iS=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,rS=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,sS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,oS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,aS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,cS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,lS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,fS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,uS=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,hS=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,dS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,pS=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,mS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,gS=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_S=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,xS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,yS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,SS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ES=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,MS=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,bS=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,wS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,TS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,AS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,RS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const CS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,DS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,PS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,US=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,IS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,LS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,FS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,NS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,OS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,BS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,kS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,GS=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,VS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,HS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,WS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,XS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jS=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$S=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,YS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,KS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,JS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ZS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,QS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,eE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,iE=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,oE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,aE=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,cE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rt={alphahash_fragment:Dx,alphahash_pars_fragment:Px,alphamap_fragment:Ux,alphamap_pars_fragment:Ix,alphatest_fragment:Lx,alphatest_pars_fragment:Fx,aomap_fragment:Nx,aomap_pars_fragment:Ox,batching_pars_vertex:Bx,batching_vertex:kx,begin_vertex:zx,beginnormal_vertex:Gx,bsdfs:Vx,iridescence_fragment:Hx,bumpmap_pars_fragment:Wx,clipping_planes_fragment:Xx,clipping_planes_pars_fragment:qx,clipping_planes_pars_vertex:jx,clipping_planes_vertex:$x,color_fragment:Yx,color_pars_fragment:Kx,color_pars_vertex:Jx,color_vertex:Zx,common:Qx,cube_uv_reflection_fragment:ey,defaultnormal_vertex:ty,displacementmap_pars_vertex:ny,displacementmap_vertex:iy,emissivemap_fragment:ry,emissivemap_pars_fragment:sy,colorspace_fragment:oy,colorspace_pars_fragment:ay,envmap_fragment:cy,envmap_common_pars_fragment:ly,envmap_pars_fragment:fy,envmap_pars_vertex:uy,envmap_physical_pars_fragment:Ey,envmap_vertex:hy,fog_vertex:dy,fog_pars_vertex:py,fog_fragment:my,fog_pars_fragment:gy,gradientmap_pars_fragment:_y,lightmap_pars_fragment:vy,lights_lambert_fragment:xy,lights_lambert_pars_fragment:yy,lights_pars_begin:Sy,lights_toon_fragment:My,lights_toon_pars_fragment:by,lights_phong_fragment:wy,lights_phong_pars_fragment:Ty,lights_physical_fragment:Ay,lights_physical_pars_fragment:Ry,lights_fragment_begin:Cy,lights_fragment_maps:Dy,lights_fragment_end:Py,logdepthbuf_fragment:Uy,logdepthbuf_pars_fragment:Iy,logdepthbuf_pars_vertex:Ly,logdepthbuf_vertex:Fy,map_fragment:Ny,map_pars_fragment:Oy,map_particle_fragment:By,map_particle_pars_fragment:ky,metalnessmap_fragment:zy,metalnessmap_pars_fragment:Gy,morphinstance_vertex:Vy,morphcolor_vertex:Hy,morphnormal_vertex:Wy,morphtarget_pars_vertex:Xy,morphtarget_vertex:qy,normal_fragment_begin:jy,normal_fragment_maps:$y,normal_pars_fragment:Yy,normal_pars_vertex:Ky,normal_vertex:Jy,normalmap_pars_fragment:Zy,clearcoat_normal_fragment_begin:Qy,clearcoat_normal_fragment_maps:eS,clearcoat_pars_fragment:tS,iridescence_pars_fragment:nS,opaque_fragment:iS,packing:rS,premultiplied_alpha_fragment:sS,project_vertex:oS,dithering_fragment:aS,dithering_pars_fragment:cS,roughnessmap_fragment:lS,roughnessmap_pars_fragment:fS,shadowmap_pars_fragment:uS,shadowmap_pars_vertex:hS,shadowmap_vertex:dS,shadowmask_pars_fragment:pS,skinbase_vertex:mS,skinning_pars_vertex:gS,skinning_vertex:_S,skinnormal_vertex:vS,specularmap_fragment:xS,specularmap_pars_fragment:yS,tonemapping_fragment:SS,tonemapping_pars_fragment:ES,transmission_fragment:MS,transmission_pars_fragment:bS,uv_pars_fragment:wS,uv_pars_vertex:TS,uv_vertex:AS,worldpos_vertex:RS,background_vert:CS,background_frag:DS,backgroundCube_vert:PS,backgroundCube_frag:US,cube_vert:IS,cube_frag:LS,depth_vert:FS,depth_frag:NS,distanceRGBA_vert:OS,distanceRGBA_frag:BS,equirect_vert:kS,equirect_frag:zS,linedashed_vert:GS,linedashed_frag:VS,meshbasic_vert:HS,meshbasic_frag:WS,meshlambert_vert:XS,meshlambert_frag:qS,meshmatcap_vert:jS,meshmatcap_frag:$S,meshnormal_vert:YS,meshnormal_frag:KS,meshphong_vert:JS,meshphong_frag:ZS,meshphysical_vert:QS,meshphysical_frag:eE,meshtoon_vert:tE,meshtoon_frag:nE,points_vert:iE,points_frag:rE,shadow_vert:sE,shadow_frag:oE,sprite_vert:aE,sprite_frag:cE},Ne={common:{diffuse:{value:new et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},envMapRotation:{value:new tt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new ot(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new et(16777215)},opacity:{value:1},center:{value:new ot(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},mi={basic:{uniforms:an([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:an([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new et(0)}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:an([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new et(0)},specular:{value:new et(1118481)},shininess:{value:30}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:an([Ne.common,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.roughnessmap,Ne.metalnessmap,Ne.fog,Ne.lights,{emissive:{value:new et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:an([Ne.common,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.gradientmap,Ne.fog,Ne.lights,{emissive:{value:new et(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:an([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:an([Ne.points,Ne.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:an([Ne.common,Ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:an([Ne.common,Ne.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:an([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:an([Ne.sprite,Ne.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new tt}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distanceRGBA:{uniforms:an([Ne.common,Ne.displacementmap,{referencePosition:{value:new ie},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distanceRGBA_vert,fragmentShader:rt.distanceRGBA_frag},shadow:{uniforms:an([Ne.lights,Ne.fog,{color:{value:new et(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};mi.physical={uniforms:an([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new ot(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new ot},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new et(0)},specularColor:{value:new et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new ot},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const Ta={r:0,b:0,g:0},mr=new xi,lE=new wt;function fE(r,e,t,n,i,s,o){const a=new et(0);let c=s===!0?0:1,l,f,u=null,h=0,d=null;function g(y){let b=y.isScene===!0?y.background:null;return b&&b.isTexture&&(b=(y.backgroundBlurriness>0?t:e).get(b)),b}function _(y){let b=!1;const v=g(y);v===null?p(a,c):v&&v.isColor&&(p(v,1),b=!0);const C=r.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function m(y,b){const v=g(b);v&&(v.isCubeTexture||v.mapping===vc)?(f===void 0&&(f=new Wt(new Or(1,1,1),new ar({name:"BackgroundCubeMaterial",uniforms:Ps(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:En,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(C,R,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(f)),mr.copy(b.backgroundRotation),mr.x*=-1,mr.y*=-1,mr.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(mr.y*=-1,mr.z*=-1),f.material.uniforms.envMap.value=v,f.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,f.material.uniforms.backgroundRotation.value.setFromMatrix4(lE.makeRotationFromEuler(mr)),f.material.toneMapped=dt.getTransfer(v.colorSpace)!==St,(u!==v||h!==v.version||d!==r.toneMapping)&&(f.material.needsUpdate=!0,u=v,h=v.version,d=r.toneMapping),f.layers.enableAll(),y.unshift(f,f.geometry,f.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Wt(new zr(2,2),new ar({name:"BackgroundMaterial",uniforms:Ps(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:or,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=dt.getTransfer(v.colorSpace)!==St,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||h!==v.version||d!==r.toneMapping)&&(l.material.needsUpdate=!0,u=v,h=v.version,d=r.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function p(y,b){y.getRGB(Ta,tg(r)),n.buffers.color.setClear(Ta.r,Ta.g,Ta.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(y,b=1){a.set(y),c=b,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(y){c=y,p(a,c)},render:_,addToRenderList:m}}function uE(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=h(null);let s=i,o=!1;function a(x,F,I,E,P){let O=!1;const U=u(E,I,F);s!==U&&(s=U,l(s.object)),O=d(x,E,I,P),O&&g(x,E,I,P),P!==null&&e.update(P,r.ELEMENT_ARRAY_BUFFER),(O||o)&&(o=!1,v(x,F,I,E),P!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(P).buffer))}function c(){return r.createVertexArray()}function l(x){return r.bindVertexArray(x)}function f(x){return r.deleteVertexArray(x)}function u(x,F,I){const E=I.wireframe===!0;let P=n[x.id];P===void 0&&(P={},n[x.id]=P);let O=P[F.id];O===void 0&&(O={},P[F.id]=O);let U=O[E];return U===void 0&&(U=h(c()),O[E]=U),U}function h(x){const F=[],I=[],E=[];for(let P=0;P<t;P++)F[P]=0,I[P]=0,E[P]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:I,attributeDivisors:E,object:x,attributes:{},index:null}}function d(x,F,I,E){const P=s.attributes,O=F.attributes;let U=0;const B=I.getAttributes();for(const z in B)if(B[z].location>=0){const V=P[z];let N=O[z];if(N===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(N=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(N=x.instanceColor)),V===void 0||V.attribute!==N||N&&V.data!==N.data)return!0;U++}return s.attributesNum!==U||s.index!==E}function g(x,F,I,E){const P={},O=F.attributes;let U=0;const B=I.getAttributes();for(const z in B)if(B[z].location>=0){let V=O[z];V===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(V=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(V=x.instanceColor));const N={};N.attribute=V,V&&V.data&&(N.data=V.data),P[z]=N,U++}s.attributes=P,s.attributesNum=U,s.index=E}function _(){const x=s.newAttributes;for(let F=0,I=x.length;F<I;F++)x[F]=0}function m(x){p(x,0)}function p(x,F){const I=s.newAttributes,E=s.enabledAttributes,P=s.attributeDivisors;I[x]=1,E[x]===0&&(r.enableVertexAttribArray(x),E[x]=1),P[x]!==F&&(r.vertexAttribDivisor(x,F),P[x]=F)}function y(){const x=s.newAttributes,F=s.enabledAttributes;for(let I=0,E=F.length;I<E;I++)F[I]!==x[I]&&(r.disableVertexAttribArray(I),F[I]=0)}function b(x,F,I,E,P,O,U){U===!0?r.vertexAttribIPointer(x,F,I,P,O):r.vertexAttribPointer(x,F,I,E,P,O)}function v(x,F,I,E){_();const P=E.attributes,O=I.getAttributes(),U=F.defaultAttributeValues;for(const B in O){const z=O[B];if(z.location>=0){let X=P[B];if(X===void 0&&(B==="instanceMatrix"&&x.instanceMatrix&&(X=x.instanceMatrix),B==="instanceColor"&&x.instanceColor&&(X=x.instanceColor)),X!==void 0){const V=X.normalized,N=X.itemSize,q=e.get(X);if(q===void 0)continue;const te=q.buffer,k=q.type,H=q.bytesPerElement,se=k===r.INT||k===r.UNSIGNED_INT||X.gpuType===au;if(X.isInterleavedBufferAttribute){const Y=X.data,ae=Y.stride,Me=X.offset;if(Y.isInstancedInterleavedBuffer){for(let Ae=0;Ae<z.locationSize;Ae++)p(z.location+Ae,Y.meshPerAttribute);x.isInstancedMesh!==!0&&E._maxInstanceCount===void 0&&(E._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let Ae=0;Ae<z.locationSize;Ae++)m(z.location+Ae);r.bindBuffer(r.ARRAY_BUFFER,te);for(let Ae=0;Ae<z.locationSize;Ae++)b(z.location+Ae,N/z.locationSize,k,V,ae*H,(Me+N/z.locationSize*Ae)*H,se)}else{if(X.isInstancedBufferAttribute){for(let Y=0;Y<z.locationSize;Y++)p(z.location+Y,X.meshPerAttribute);x.isInstancedMesh!==!0&&E._maxInstanceCount===void 0&&(E._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let Y=0;Y<z.locationSize;Y++)m(z.location+Y);r.bindBuffer(r.ARRAY_BUFFER,te);for(let Y=0;Y<z.locationSize;Y++)b(z.location+Y,N/z.locationSize,k,V,N*H,N/z.locationSize*Y*H,se)}}else if(U!==void 0){const V=U[B];if(V!==void 0)switch(V.length){case 2:r.vertexAttrib2fv(z.location,V);break;case 3:r.vertexAttrib3fv(z.location,V);break;case 4:r.vertexAttrib4fv(z.location,V);break;default:r.vertexAttrib1fv(z.location,V)}}}}y()}function C(){A();for(const x in n){const F=n[x];for(const I in F){const E=F[I];for(const P in E)f(E[P].object),delete E[P];delete F[I]}delete n[x]}}function R(x){if(n[x.id]===void 0)return;const F=n[x.id];for(const I in F){const E=F[I];for(const P in E)f(E[P].object),delete E[P];delete F[I]}delete n[x.id]}function w(x){for(const F in n){const I=n[F];if(I[x.id]===void 0)continue;const E=I[x.id];for(const P in E)f(E[P].object),delete E[P];delete I[x.id]}}function A(){S(),o=!0,s!==i&&(s=i,l(s.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:A,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:R,releaseStatesOfProgram:w,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function hE(r,e,t){let n;function i(l){n=l}function s(l,f){r.drawArrays(n,l,f),t.update(f,n,1)}function o(l,f,u){u!==0&&(r.drawArraysInstanced(n,l,f,u),t.update(f,n,u))}function a(l,f,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,f,0,u);let d=0;for(let g=0;g<u;g++)d+=f[g];t.update(d,n,1)}function c(l,f,u,h){if(u===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<l.length;g++)o(l[g],f[g],h[g]);else{d.multiDrawArraysInstancedWEBGL(n,l,0,f,0,h,0,u);let g=0;for(let _=0;_<u;_++)g+=f[_]*h[_];t.update(g,n,1)}}this.setMode=i,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function dE(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(w){return!(w!==ti&&n.convert(w)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const A=w===Go&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==ki&&n.convert(w)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Ui&&!A)}function c(w){if(w==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const f=c(l);f!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",f,"instead."),l=f);const u=t.logarithmicDepthBuffer===!0,h=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),d=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),y=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),b=r.getParameter(r.MAX_VARYING_VECTORS),v=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,R=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:h,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:b,maxFragmentUniforms:v,vertexTextures:C,maxSamples:R}}function pE(r){const e=this;let t=null,n=0,i=!1,s=!1;const o=new vr,a=new tt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,h){const d=u.length!==0||h||n!==0||i;return i=h,n=u.length,d},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,h){t=f(u,h,0)},this.setState=function(u,h,d){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=r.get(u);if(!i||g===null||g.length===0||s&&!m)s?f(null):l();else{const y=s?0:n,b=y*4;let v=p.clippingState||null;c.value=v,v=f(g,h,b,d);for(let C=0;C!==b;++C)v[C]=t[C];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(u,h,d,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=c.value,g!==!0||m===null){const p=d+_*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,v=d;b!==_;++b,v+=4)o.copy(u[b]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function mE(r){let e=new WeakMap;function t(o,a){return a===sf?o.mapping=As:a===of&&(o.mapping=Rs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===sf||a===of)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new Tx(c.height);return l.fromEquirectangularTexture(r,o),e.set(o,l),o.addEventListener("dispose",i),t(l.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class gE extends ig{constructor(e=-1,t=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=f*this.view.offsetY,c=a-f*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const fs=4,jh=[.125,.215,.35,.446,.526,.582],Sr=20,vl=new gE,$h=new et;let xl=null,yl=0,Sl=0,El=!1;const xr=(1+Math.sqrt(5))/2,as=1/xr,Yh=[new ie(-xr,as,0),new ie(xr,as,0),new ie(-as,0,xr),new ie(as,0,xr),new ie(0,xr,-as),new ie(0,xr,as),new ie(-1,1,-1),new ie(1,1,-1),new ie(-1,1,1),new ie(1,1,1)];class Kh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),Sl=this._renderer.getActiveMipmapLevel(),El=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(xl,yl,Sl),this._renderer.xr.enabled=El,e.scissorTest=!1,Aa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===As||e.mapping===Rs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),xl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),Sl=this._renderer.getActiveMipmapLevel(),El=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:zn,minFilter:zn,generateMipmaps:!1,type:Go,format:ti,colorSpace:Ns,depthBuffer:!1},i=Jh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jh(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=_E(s)),this._blurMaterial=vE(s,e,t)}return i}_compileMaterial(e){const t=new Wt(this._lodPlanes[0],e);this._renderer.compile(t,vl)}_sceneToCubeUV(e,t,n,i){const a=new xn(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],f=this._renderer,u=f.autoClear,h=f.toneMapping;f.getClearColor($h),f.toneMapping=sr,f.autoClear=!1;const d=new Mo({name:"PMREM.Background",side:En,depthWrite:!1,depthTest:!1}),g=new Wt(new Or,d);let _=!1;const m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,_=!0):(d.color.copy($h),_=!0);for(let p=0;p<6;p++){const y=p%3;y===0?(a.up.set(0,c[p],0),a.lookAt(l[p],0,0)):y===1?(a.up.set(0,0,c[p]),a.lookAt(0,l[p],0)):(a.up.set(0,c[p],0),a.lookAt(0,0,l[p]));const b=this._cubeSize;Aa(i,y*b,p>2?b:0,b,b),f.setRenderTarget(i),_&&f.render(g,a),f.render(e,a)}g.geometry.dispose(),g.material.dispose(),f.toneMapping=h,f.autoClear=u,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===As||e.mapping===Rs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zh());const s=i?this._cubemapMaterial:this._equirectMaterial,o=new Wt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const c=this._cubeSize;Aa(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,vl)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Yh[(i-s-1)%Yh.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,i,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",s),this._halfBlur(o,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,u=new Wt(this._lodPlanes[i],l),h=l.uniforms,d=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Sr-1),_=s/g,m=isFinite(s)?1+Math.floor(f*_):Sr;m>Sr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Sr}`);const p=[];let y=0;for(let w=0;w<Sr;++w){const A=w/_,S=Math.exp(-A*A/2);p.push(S),w===0?y+=S:w<m&&(y+=2*S)}for(let w=0;w<p.length;w++)p[w]=p[w]/y;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:b}=this;h.dTheta.value=g,h.mipInt.value=b-n;const v=this._sizeLods[i],C=3*v*(i>b-fs?i-b+fs:0),R=4*(this._cubeSize-v);Aa(t,C,R,3*v,2*v),c.setRenderTarget(t),c.render(u,vl)}}function _E(r){const e=[],t=[],n=[];let i=r;const s=r-fs+1+jh.length;for(let o=0;o<s;o++){const a=Math.pow(2,i);t.push(a);let c=1/a;o>r-fs?c=jh[o-r+fs-1]:o===0&&(c=0),n.push(c);const l=1/(a-2),f=-l,u=1+l,h=[f,f,u,f,u,u,f,f,u,u,f,u],d=6,g=6,_=3,m=2,p=1,y=new Float32Array(_*g*d),b=new Float32Array(m*g*d),v=new Float32Array(p*g*d);for(let R=0;R<d;R++){const w=R%3*2/3-1,A=R>2?0:-1,S=[w,A,0,w+2/3,A,0,w+2/3,A+1,0,w,A,0,w+2/3,A+1,0,w,A+1,0];y.set(S,_*g*R),b.set(h,m*g*R);const x=[R,R,R,R,R,R];v.set(x,p*g*R)}const C=new Nn;C.setAttribute("position",new Gn(y,_)),C.setAttribute("uv",new Gn(b,m)),C.setAttribute("faceIndex",new Gn(v,p)),e.push(C),i>fs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Jh(r,e,t){const n=new Nr(r,e,t);return n.texture.mapping=vc,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Aa(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function vE(r,e,t){const n=new Float32Array(Sr),i=new ie(0,1,0);return new ar({name:"SphericalGaussianBlur",defines:{n:Sr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:gu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function Zh(){return new ar({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:gu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function Qh(){return new ar({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:gu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function gu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function xE(r){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===sf||c===of,f=c===As||c===Rs;if(l||f){let u=e.get(a);const h=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Kh(r)),u=l?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const d=a.image;return l&&d&&d.height>0||f&&d&&i(d)?(t===null&&(t=new Kh(r)),u=l?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function i(a){let c=0;const l=6;for(let f=0;f<l;f++)a[f]!==void 0&&c++;return c===l}function s(a){const c=a.target;c.removeEventListener("dispose",s);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function yE(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&co("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function SE(r,e,t,n){const i={},s=new WeakMap;function o(u){const h=u.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);for(const g in h.morphAttributes){const _=h.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}h.removeEventListener("dispose",o),delete i[h.id];const d=s.get(h);d&&(e.remove(d),s.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(u,h){return i[h.id]===!0||(h.addEventListener("dispose",o),i[h.id]=!0,t.memory.geometries++),h}function c(u){const h=u.attributes;for(const g in h)e.update(h[g],r.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const _=d[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],r.ARRAY_BUFFER)}}function l(u){const h=[],d=u.index,g=u.attributes.position;let _=0;if(d!==null){const y=d.array;_=d.version;for(let b=0,v=y.length;b<v;b+=3){const C=y[b+0],R=y[b+1],w=y[b+2];h.push(C,R,R,w,w,C)}}else if(g!==void 0){const y=g.array;_=g.version;for(let b=0,v=y.length/3-1;b<v;b+=3){const C=b+0,R=b+1,w=b+2;h.push(C,R,R,w,w,C)}}else return;const m=new(Ym(h)?eg:Qm)(h,1);m.version=_;const p=s.get(u);p&&e.remove(p),s.set(u,m)}function f(u){const h=s.get(u);if(h){const d=u.index;d!==null&&h.version<d.version&&l(u)}else l(u);return s.get(u)}return{get:a,update:c,getWireframeAttribute:f}}function EE(r,e,t){let n;function i(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function c(h,d){r.drawElements(n,d,s,h*o),t.update(d,n,1)}function l(h,d,g){g!==0&&(r.drawElementsInstanced(n,d,s,h*o,g),t.update(d,n,g))}function f(h,d,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,s,h,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];t.update(m,n,1)}function u(h,d,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)l(h[p]/o,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,s,h,0,_,0,g);let p=0;for(let y=0;y<g;y++)p+=d[y]*_[y];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=f,this.renderMultiDrawInstances=u}function ME(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case r.TRIANGLES:t.triangles+=a*(s/3);break;case r.LINES:t.lines+=a*(s/2);break;case r.LINE_STRIP:t.lines+=a*(s-1);break;case r.LINE_LOOP:t.lines+=a*s;break;case r.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function bE(r,e,t){const n=new WeakMap,i=new xt;function s(o,a,c){const l=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=f!==void 0?f.length:0;let h=n.get(a);if(h===void 0||h.count!==u){let x=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",x)};var d=x;h!==void 0&&h.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),_===!0&&(v=2),m===!0&&(v=3);let C=a.attributes.position.count*v,R=1;C>e.maxTextureSize&&(R=Math.ceil(C/e.maxTextureSize),C=e.maxTextureSize);const w=new Float32Array(C*R*4*u),A=new Jm(w,C,R,u);A.type=Ui,A.needsUpdate=!0;const S=v*4;for(let F=0;F<u;F++){const I=p[F],E=y[F],P=b[F],O=C*R*4*F;for(let U=0;U<I.count;U++){const B=U*S;g===!0&&(i.fromBufferAttribute(I,U),w[O+B+0]=i.x,w[O+B+1]=i.y,w[O+B+2]=i.z,w[O+B+3]=0),_===!0&&(i.fromBufferAttribute(E,U),w[O+B+4]=i.x,w[O+B+5]=i.y,w[O+B+6]=i.z,w[O+B+7]=0),m===!0&&(i.fromBufferAttribute(P,U),w[O+B+8]=i.x,w[O+B+9]=i.y,w[O+B+10]=i.z,w[O+B+11]=P.itemSize===4?i.w:1)}}h={count:u,texture:A,size:new ot(C,R)},n.set(a,h),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const _=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(r,"morphTargetBaseInfluence",_),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(r,"morphTargetsTextureSize",h.size)}return{update:s}}function wE(r,e,t,n){let i=new WeakMap;function s(c){const l=n.render.frame,f=c.geometry,u=e.get(c,f);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(t.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,r.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const h=c.skeleton;i.get(h)!==l&&(h.update(),i.set(h,l))}return u}function o(){i=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:s,dispose:o}}class og extends cn{constructor(e,t,n,i,s,o,a,c,l,f=ps){if(f!==ps&&f!==Ds)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&f===ps&&(n=Fr),n===void 0&&f===Ds&&(n=Cs),super(null,i,s,o,a,c,f,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:ri,this.minFilter=c!==void 0?c:ri,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const ag=new cn,ed=new og(1,1),cg=new Jm,lg=new ux,fg=new rg,td=[],nd=[],id=new Float32Array(16),rd=new Float32Array(9),sd=new Float32Array(4);function ks(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=td[i];if(s===void 0&&(s=new Float32Array(i),td[i]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,r[o].toArray(s,a)}return s}function Bt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function kt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function yc(r,e){let t=nd[e];t===void 0&&(t=new Int32Array(e),nd[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function TE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function AE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;r.uniform2fv(this.addr,e),kt(t,e)}}function RE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Bt(t,e))return;r.uniform3fv(this.addr,e),kt(t,e)}}function CE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;r.uniform4fv(this.addr,e),kt(t,e)}}function DE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;sd.set(n),r.uniformMatrix2fv(this.addr,!1,sd),kt(t,n)}}function PE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;rd.set(n),r.uniformMatrix3fv(this.addr,!1,rd),kt(t,n)}}function UE(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Bt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),kt(t,e)}else{if(Bt(t,n))return;id.set(n),r.uniformMatrix4fv(this.addr,!1,id),kt(t,n)}}function IE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function LE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;r.uniform2iv(this.addr,e),kt(t,e)}}function FE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;r.uniform3iv(this.addr,e),kt(t,e)}}function NE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;r.uniform4iv(this.addr,e),kt(t,e)}}function OE(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function BE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Bt(t,e))return;r.uniform2uiv(this.addr,e),kt(t,e)}}function kE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Bt(t,e))return;r.uniform3uiv(this.addr,e),kt(t,e)}}function zE(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Bt(t,e))return;r.uniform4uiv(this.addr,e),kt(t,e)}}function GE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(ed.compareFunction=$m,s=ed):s=ag,t.setTexture2D(e||s,i)}function VE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||lg,i)}function HE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||fg,i)}function WE(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||cg,i)}function XE(r){switch(r){case 5126:return TE;case 35664:return AE;case 35665:return RE;case 35666:return CE;case 35674:return DE;case 35675:return PE;case 35676:return UE;case 5124:case 35670:return IE;case 35667:case 35671:return LE;case 35668:case 35672:return FE;case 35669:case 35673:return NE;case 5125:return OE;case 36294:return BE;case 36295:return kE;case 36296:return zE;case 35678:case 36198:case 36298:case 36306:case 35682:return GE;case 35679:case 36299:case 36307:return VE;case 35680:case 36300:case 36308:case 36293:return HE;case 36289:case 36303:case 36311:case 36292:return WE}}function qE(r,e){r.uniform1fv(this.addr,e)}function jE(r,e){const t=ks(e,this.size,2);r.uniform2fv(this.addr,t)}function $E(r,e){const t=ks(e,this.size,3);r.uniform3fv(this.addr,t)}function YE(r,e){const t=ks(e,this.size,4);r.uniform4fv(this.addr,t)}function KE(r,e){const t=ks(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function JE(r,e){const t=ks(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function ZE(r,e){const t=ks(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function QE(r,e){r.uniform1iv(this.addr,e)}function eM(r,e){r.uniform2iv(this.addr,e)}function tM(r,e){r.uniform3iv(this.addr,e)}function nM(r,e){r.uniform4iv(this.addr,e)}function iM(r,e){r.uniform1uiv(this.addr,e)}function rM(r,e){r.uniform2uiv(this.addr,e)}function sM(r,e){r.uniform3uiv(this.addr,e)}function oM(r,e){r.uniform4uiv(this.addr,e)}function aM(r,e,t){const n=this.cache,i=e.length,s=yc(t,i);Bt(n,s)||(r.uniform1iv(this.addr,s),kt(n,s));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||ag,s[o])}function cM(r,e,t){const n=this.cache,i=e.length,s=yc(t,i);Bt(n,s)||(r.uniform1iv(this.addr,s),kt(n,s));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||lg,s[o])}function lM(r,e,t){const n=this.cache,i=e.length,s=yc(t,i);Bt(n,s)||(r.uniform1iv(this.addr,s),kt(n,s));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||fg,s[o])}function fM(r,e,t){const n=this.cache,i=e.length,s=yc(t,i);Bt(n,s)||(r.uniform1iv(this.addr,s),kt(n,s));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||cg,s[o])}function uM(r){switch(r){case 5126:return qE;case 35664:return jE;case 35665:return $E;case 35666:return YE;case 35674:return KE;case 35675:return JE;case 35676:return ZE;case 5124:case 35670:return QE;case 35667:case 35671:return eM;case 35668:case 35672:return tM;case 35669:case 35673:return nM;case 5125:return iM;case 36294:return rM;case 36295:return sM;case 36296:return oM;case 35678:case 36198:case 36298:case 36306:case 35682:return aM;case 35679:case 36299:case 36307:return cM;case 35680:case 36300:case 36308:case 36293:return lM;case 36289:case 36303:case 36311:case 36292:return fM}}class hM{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=XE(t.type)}}class dM{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=uM(t.type)}}class pM{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,o=i.length;s!==o;++s){const a=i[s];a.setValue(e,t[a.id],n)}}}const Ml=/(\w+)(\])?(\[|\.)?/g;function od(r,e){r.seq.push(e),r.map[e.id]=e}function mM(r,e,t){const n=r.name,i=n.length;for(Ml.lastIndex=0;;){const s=Ml.exec(n),o=Ml.lastIndex;let a=s[1];const c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){od(t,l===void 0?new hM(a,r,e):new dM(a,r,e));break}else{let u=t.map[a];u===void 0&&(u=new pM(a),od(t,u)),t=u}}}class Va{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),o=e.getUniformLocation(t,s.name);mM(s,o,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,o=t.length;s!==o;++s){const a=t[s],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function ad(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const gM=37297;let _M=0;function vM(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=i;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const cd=new tt;function xM(r){dt._getMatrix(cd,dt.workingColorSpace,r);const e=`mat3( ${cd.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(r)){case xc:return[e,"LinearTransferOETF"];case St:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function ld(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+vM(r.getShaderSource(e),o)}else return i}function yM(r,e){const t=xM(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function SM(r,e){let t;switch(e){case kv:t="Linear";break;case zv:t="Reinhard";break;case Gv:t="Cineon";break;case Vv:t="ACESFilmic";break;case Wv:t="AgX";break;case Xv:t="Neutral";break;case Hv:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ra=new ie;function EM(){dt.getLuminanceCoefficients(Ra);const r=Ra.x.toFixed(4),e=Ra.y.toFixed(4),t=Ra.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function MM(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lo).join(`
`)}function bM(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function wM(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:r.getAttribLocation(e,o),locationSize:a}}return t}function lo(r){return r!==""}function fd(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ud(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const TM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ff(r){return r.replace(TM,RM)}const AM=new Map;function RM(r,e){let t=rt[e];if(t===void 0){const n=AM.get(e);if(n!==void 0)t=rt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ff(t)}const CM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hd(r){return r.replace(CM,DM)}function DM(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function dd(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function PM(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Im?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===vv?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ri&&(e="SHADOWMAP_TYPE_VSM"),e}function UM(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case As:case Rs:e="ENVMAP_TYPE_CUBE";break;case vc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function IM(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Rs:e="ENVMAP_MODE_REFRACTION";break}return e}function LM(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case Lm:e="ENVMAP_BLENDING_MULTIPLY";break;case Ov:e="ENVMAP_BLENDING_MIX";break;case Bv:e="ENVMAP_BLENDING_ADD";break}return e}function FM(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function NM(r,e,t,n){const i=r.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=PM(t),l=UM(t),f=IM(t),u=LM(t),h=FM(t),d=MM(t),g=bM(s),_=i.createProgram();let m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(lo).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(lo).join(`
`),p.length>0&&(p+=`
`)):(m=[dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lo).join(`
`),p=[dd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+f:"",t.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==sr?"#define TONE_MAPPING":"",t.toneMapping!==sr?rt.tonemapping_pars_fragment:"",t.toneMapping!==sr?SM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,yM("linearToOutputTexel",t.outputColorSpace),EM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(lo).join(`
`)),o=Ff(o),o=fd(o,t),o=ud(o,t),a=Ff(a),a=fd(a,t),a=ud(a,t),o=hd(o),a=hd(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Th?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Th?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=y+m+o,v=y+p+a,C=ad(i,i.VERTEX_SHADER,b),R=ad(i,i.FRAGMENT_SHADER,v);i.attachShader(_,C),i.attachShader(_,R),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function w(F){if(r.debug.checkShaderErrors){const I=i.getProgramInfoLog(_).trim(),E=i.getShaderInfoLog(C).trim(),P=i.getShaderInfoLog(R).trim();let O=!0,U=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(O=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,_,C,R);else{const B=ld(i,C,"vertex"),z=ld(i,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+I+`
`+B+`
`+z)}else I!==""?console.warn("THREE.WebGLProgram: Program Info Log:",I):(E===""||P==="")&&(U=!1);U&&(F.diagnostics={runnable:O,programLog:I,vertexShader:{log:E,prefix:m},fragmentShader:{log:P,prefix:p}})}i.deleteShader(C),i.deleteShader(R),A=new Va(i,_),S=wM(i,_)}let A;this.getUniforms=function(){return A===void 0&&w(this),A};let S;this.getAttributes=function(){return S===void 0&&w(this),S};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=i.getProgramParameter(_,gM)),x},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_M++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=R,this}let OM=0;class BM{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new kM(e),t.set(e,n)),n}}class kM{constructor(e){this.id=OM++,this.code=e,this.usedTimes=0}}function zM(r,e,t,n,i,s,o){const a=new pu,c=new BM,l=new Set,f=[],u=i.logarithmicDepthBuffer,h=i.vertexTextures;let d=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return l.add(S),S===0?"uv":`uv${S}`}function m(S,x,F,I,E){const P=I.fog,O=E.geometry,U=S.isMeshStandardMaterial?I.environment:null,B=(S.isMeshStandardMaterial?t:e).get(S.envMap||U),z=B&&B.mapping===vc?B.image.height:null,X=g[S.type];S.precision!==null&&(d=i.getMaxPrecision(S.precision),d!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",d,"instead."));const V=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,N=V!==void 0?V.length:0;let q=0;O.morphAttributes.position!==void 0&&(q=1),O.morphAttributes.normal!==void 0&&(q=2),O.morphAttributes.color!==void 0&&(q=3);let te,k,H,se;if(X){const $e=mi[X];te=$e.vertexShader,k=$e.fragmentShader}else te=S.vertexShader,k=S.fragmentShader,c.update(S),H=c.getVertexShaderID(S),se=c.getFragmentShaderID(S);const Y=r.getRenderTarget(),ae=r.state.buffers.depth.getReversed(),Me=E.isInstancedMesh===!0,Ae=E.isBatchedMesh===!0,we=!!S.map,he=!!S.matcap,Ve=!!B,W=!!S.aoMap,He=!!S.lightMap,Ie=!!S.bumpMap,Fe=!!S.normalMap,ue=!!S.displacementMap,Ue=!!S.emissiveMap,Ee=!!S.metalnessMap,T=!!S.roughnessMap,M=S.anisotropy>0,G=S.clearcoat>0,ee=S.dispersion>0,ne=S.iridescence>0,fe=S.sheen>0,_e=S.transmission>0,ge=M&&!!S.anisotropyMap,Se=G&&!!S.clearcoatMap,Oe=G&&!!S.clearcoatNormalMap,ve=G&&!!S.clearcoatRoughnessMap,Re=ne&&!!S.iridescenceMap,Ce=ne&&!!S.iridescenceThicknessMap,De=fe&&!!S.sheenColorMap,pe=fe&&!!S.sheenRoughnessMap,Be=!!S.specularMap,ke=!!S.specularColorMap,it=!!S.specularIntensityMap,j=_e&&!!S.transmissionMap,xe=_e&&!!S.thicknessMap,re=!!S.gradientMap,ye=!!S.alphaMap,Te=S.alphaTest>0,be=!!S.alphaHash,Ge=!!S.extensions;let Ze=sr;S.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(Ze=r.toneMapping);const je={shaderID:X,shaderType:S.type,shaderName:S.name,vertexShader:te,fragmentShader:k,defines:S.defines,customVertexShaderID:H,customFragmentShaderID:se,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:d,batching:Ae,batchingColor:Ae&&E._colorsTexture!==null,instancing:Me,instancingColor:Me&&E.instanceColor!==null,instancingMorph:Me&&E.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:Y===null?r.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:Ns,alphaToCoverage:!!S.alphaToCoverage,map:we,matcap:he,envMap:Ve,envMapMode:Ve&&B.mapping,envMapCubeUVHeight:z,aoMap:W,lightMap:He,bumpMap:Ie,normalMap:Fe,displacementMap:h&&ue,emissiveMap:Ue,normalMapObjectSpace:Fe&&S.normalMapType===$v,normalMapTangentSpace:Fe&&S.normalMapType===jm,metalnessMap:Ee,roughnessMap:T,anisotropy:M,anisotropyMap:ge,clearcoat:G,clearcoatMap:Se,clearcoatNormalMap:Oe,clearcoatRoughnessMap:ve,dispersion:ee,iridescence:ne,iridescenceMap:Re,iridescenceThicknessMap:Ce,sheen:fe,sheenColorMap:De,sheenRoughnessMap:pe,specularMap:Be,specularColorMap:ke,specularIntensityMap:it,transmission:_e,transmissionMap:j,thicknessMap:xe,gradientMap:re,opaque:S.transparent===!1&&S.blending===ds&&S.alphaToCoverage===!1,alphaMap:ye,alphaTest:Te,alphaHash:be,combine:S.combine,mapUv:we&&_(S.map.channel),aoMapUv:W&&_(S.aoMap.channel),lightMapUv:He&&_(S.lightMap.channel),bumpMapUv:Ie&&_(S.bumpMap.channel),normalMapUv:Fe&&_(S.normalMap.channel),displacementMapUv:ue&&_(S.displacementMap.channel),emissiveMapUv:Ue&&_(S.emissiveMap.channel),metalnessMapUv:Ee&&_(S.metalnessMap.channel),roughnessMapUv:T&&_(S.roughnessMap.channel),anisotropyMapUv:ge&&_(S.anisotropyMap.channel),clearcoatMapUv:Se&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Oe&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Re&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:De&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:pe&&_(S.sheenRoughnessMap.channel),specularMapUv:Be&&_(S.specularMap.channel),specularColorMapUv:ke&&_(S.specularColorMap.channel),specularIntensityMapUv:it&&_(S.specularIntensityMap.channel),transmissionMapUv:j&&_(S.transmissionMap.channel),thicknessMapUv:xe&&_(S.thicknessMap.channel),alphaMapUv:ye&&_(S.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Fe||M),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:E.isPoints===!0&&!!O.attributes.uv&&(we||ye),fog:!!P,useFog:S.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:ae,skinning:E.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:N,morphTextureStride:q,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:r.shadowMap.enabled&&F.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ze,decodeVideoTexture:we&&S.map.isVideoTexture===!0&&dt.getTransfer(S.map.colorSpace)===St,decodeVideoTextureEmissive:Ue&&S.emissiveMap.isVideoTexture===!0&&dt.getTransfer(S.emissiveMap.colorSpace)===St,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Zn,flipSided:S.side===En,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ge&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ge&&S.extensions.multiDraw===!0||Ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return je.vertexUv1s=l.has(1),je.vertexUv2s=l.has(2),je.vertexUv3s=l.has(3),l.clear(),je}function p(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const F in S.defines)x.push(F),x.push(S.defines[F]);return S.isRawShaderMaterial===!1&&(y(x,S),b(x,S),x.push(r.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function y(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function b(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){const x=g[S.type];let F;if(x){const I=mi[x];F=ng.clone(I.uniforms)}else F=S.uniforms;return F}function C(S,x){let F;for(let I=0,E=f.length;I<E;I++){const P=f[I];if(P.cacheKey===x){F=P,++F.usedTimes;break}}return F===void 0&&(F=new NM(r,x,S,s),f.push(F)),F}function R(S){if(--S.usedTimes===0){const x=f.indexOf(S);f[x]=f[f.length-1],f.pop(),S.destroy()}}function w(S){c.remove(S)}function A(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:C,releaseProgram:R,releaseShaderCache:w,programs:f,dispose:A}}function GM(){let r=new WeakMap;function e(o){return r.has(o)}function t(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function n(o){r.delete(o)}function i(o,a,c){r.get(o)[a]=c}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function VM(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function pd(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function md(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function o(u,h,d,g,_,m){let p=r[e];return p===void 0?(p={id:u.id,object:u,geometry:h,material:d,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},r[e]=p):(p.id=u.id,p.object=u,p.geometry=h,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),e++,p}function a(u,h,d,g,_,m){const p=o(u,h,d,g,_,m);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):t.push(p)}function c(u,h,d,g,_,m){const p=o(u,h,d,g,_,m);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):t.unshift(p)}function l(u,h){t.length>1&&t.sort(u||VM),n.length>1&&n.sort(h||pd),i.length>1&&i.sort(h||pd)}function f(){for(let u=e,h=r.length;u<h;u++){const d=r[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:a,unshift:c,finish:f,sort:l}}function HM(){let r=new WeakMap;function e(n,i){const s=r.get(n);let o;return s===void 0?(o=new md,r.set(n,[o])):i>=s.length?(o=new md,s.push(o)):o=s[i],o}function t(){r=new WeakMap}return{get:e,dispose:t}}function WM(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new ie,color:new et};break;case"SpotLight":t={position:new ie,direction:new ie,color:new et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new ie,color:new et,distance:0,decay:0};break;case"HemisphereLight":t={direction:new ie,skyColor:new et,groundColor:new et};break;case"RectAreaLight":t={color:new et,position:new ie,halfWidth:new ie,halfHeight:new ie};break}return r[e.id]=t,t}}}function XM(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let qM=0;function jM(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function $M(r){const e=new WM,t=XM(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new ie);const i=new ie,s=new wt,o=new wt;function a(l){let f=0,u=0,h=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,y=0,b=0,v=0,C=0,R=0,w=0;l.sort(jM);for(let S=0,x=l.length;S<x;S++){const F=l[S],I=F.color,E=F.intensity,P=F.distance,O=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)f+=I.r*E,u+=I.g*E,h+=I.b*E;else if(F.isLightProbe){for(let U=0;U<9;U++)n.probe[U].addScaledVector(F.sh.coefficients[U],E);w++}else if(F.isDirectionalLight){const U=e.get(F);if(U.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const B=F.shadow,z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,n.directionalShadow[d]=z,n.directionalShadowMap[d]=O,n.directionalShadowMatrix[d]=F.shadow.matrix,y++}n.directional[d]=U,d++}else if(F.isSpotLight){const U=e.get(F);U.position.setFromMatrixPosition(F.matrixWorld),U.color.copy(I).multiplyScalar(E),U.distance=P,U.coneCos=Math.cos(F.angle),U.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),U.decay=F.decay,n.spot[_]=U;const B=F.shadow;if(F.map&&(n.spotLightMap[C]=F.map,C++,B.updateMatrices(F),F.castShadow&&R++),n.spotLightMatrix[_]=B.matrix,F.castShadow){const z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,n.spotShadow[_]=z,n.spotShadowMap[_]=O,v++}_++}else if(F.isRectAreaLight){const U=e.get(F);U.color.copy(I).multiplyScalar(E),U.halfWidth.set(F.width*.5,0,0),U.halfHeight.set(0,F.height*.5,0),n.rectArea[m]=U,m++}else if(F.isPointLight){const U=e.get(F);if(U.color.copy(F.color).multiplyScalar(F.intensity),U.distance=F.distance,U.decay=F.decay,F.castShadow){const B=F.shadow,z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,z.shadowCameraNear=B.camera.near,z.shadowCameraFar=B.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=O,n.pointShadowMatrix[g]=F.shadow.matrix,b++}n.point[g]=U,g++}else if(F.isHemisphereLight){const U=e.get(F);U.skyColor.copy(F.color).multiplyScalar(E),U.groundColor.copy(F.groundColor).multiplyScalar(E),n.hemi[p]=U,p++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ne.LTC_FLOAT_1,n.rectAreaLTC2=Ne.LTC_FLOAT_2):(n.rectAreaLTC1=Ne.LTC_HALF_1,n.rectAreaLTC2=Ne.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=u,n.ambient[2]=h;const A=n.hash;(A.directionalLength!==d||A.pointLength!==g||A.spotLength!==_||A.rectAreaLength!==m||A.hemiLength!==p||A.numDirectionalShadows!==y||A.numPointShadows!==b||A.numSpotShadows!==v||A.numSpotMaps!==C||A.numLightProbes!==w)&&(n.directional.length=d,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=v+C-R,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=w,A.directionalLength=d,A.pointLength=g,A.spotLength=_,A.rectAreaLength=m,A.hemiLength=p,A.numDirectionalShadows=y,A.numPointShadows=b,A.numSpotShadows=v,A.numSpotMaps=C,A.numLightProbes=w,n.version=qM++)}function c(l,f){let u=0,h=0,d=0,g=0,_=0;const m=f.matrixWorldInverse;for(let p=0,y=l.length;p<y;p++){const b=l[p];if(b.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),u++}else if(b.isSpotLight){const v=n.spot[d];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),d++}else if(b.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(b.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(b.width*.5,0,0),v.halfHeight.set(0,b.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const v=n.point[h];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),h++}else if(b.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(b.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:c,state:n}}function gd(r){const e=new $M(r),t=[],n=[];function i(f){l.camera=f,t.length=0,n.length=0}function s(f){t.push(f)}function o(f){n.push(f)}function a(){e.setup(t)}function c(f){e.setupView(t,f)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:s,pushShadow:o}}function YM(r){let e=new WeakMap;function t(i,s=0){const o=e.get(i);let a;return o===void 0?(a=new gd(r),e.set(i,[a])):s>=o.length?(a=new gd(r),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class ug extends Bs{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=jv,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class hg extends Bs{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const KM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,JM=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ZM(r,e,t){let n=new mu;const i=new ot,s=new ot,o=new xt,a=new ug({depthPacking:qm}),c=new hg,l={},f=t.maxTextureSize,u={[or]:En,[En]:or,[Zn]:Zn},h=new ar({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ot},radius:{value:4}},vertexShader:KM,fragmentShader:JM}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const g=new Nn;g.setAttribute("position",new Gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Wt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Im;let p=this.type;this.render=function(R,w,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const S=r.getRenderTarget(),x=r.getActiveCubeFace(),F=r.getActiveMipmapLevel(),I=r.state;I.setBlending(rr),I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const E=p!==Ri&&this.type===Ri,P=p===Ri&&this.type!==Ri;for(let O=0,U=R.length;O<U;O++){const B=R[O],z=B.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",B,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const X=z.getFrameExtents();if(i.multiply(X),s.copy(z.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(s.x=Math.floor(f/X.x),i.x=s.x*X.x,z.mapSize.x=s.x),i.y>f&&(s.y=Math.floor(f/X.y),i.y=s.y*X.y,z.mapSize.y=s.y)),z.map===null||E===!0||P===!0){const N=this.type!==Ri?{minFilter:ri,magFilter:ri}:{};z.map!==null&&z.map.dispose(),z.map=new Nr(i.x,i.y,N),z.map.texture.name=B.name+".shadowMap",z.camera.updateProjectionMatrix()}r.setRenderTarget(z.map),r.clear();const V=z.getViewportCount();for(let N=0;N<V;N++){const q=z.getViewport(N);o.set(s.x*q.x,s.y*q.y,s.x*q.z,s.y*q.w),I.viewport(o),z.updateMatrices(B,N),n=z.getFrustum(),v(w,A,z.camera,B,this.type)}z.isPointLightShadow!==!0&&this.type===Ri&&y(z,A),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(S,x,F)};function y(R,w){const A=e.update(_);h.defines.VSM_SAMPLES!==R.blurSamples&&(h.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Nr(i.x,i.y)),h.uniforms.shadow_pass.value=R.map.texture,h.uniforms.resolution.value=R.mapSize,h.uniforms.radius.value=R.radius,r.setRenderTarget(R.mapPass),r.clear(),r.renderBufferDirect(w,null,A,h,_,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,r.setRenderTarget(R.map),r.clear(),r.renderBufferDirect(w,null,A,d,_,null)}function b(R,w,A,S){let x=null;const F=A.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(F!==void 0)x=F;else if(x=A.isPointLight===!0?c:a,r.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const I=x.uuid,E=w.uuid;let P=l[I];P===void 0&&(P={},l[I]=P);let O=P[E];O===void 0&&(O=x.clone(),P[E]=O,w.addEventListener("dispose",C)),x=O}if(x.visible=w.visible,x.wireframe=w.wireframe,S===Ri?x.side=w.shadowSide!==null?w.shadowSide:w.side:x.side=w.shadowSide!==null?w.shadowSide:u[w.side],x.alphaMap=w.alphaMap,x.alphaTest=w.alphaTest,x.map=w.map,x.clipShadows=w.clipShadows,x.clippingPlanes=w.clippingPlanes,x.clipIntersection=w.clipIntersection,x.displacementMap=w.displacementMap,x.displacementScale=w.displacementScale,x.displacementBias=w.displacementBias,x.wireframeLinewidth=w.wireframeLinewidth,x.linewidth=w.linewidth,A.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const I=r.properties.get(x);I.light=A}return x}function v(R,w,A,S,x){if(R.visible===!1)return;if(R.layers.test(w.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&x===Ri)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,R.matrixWorld);const E=e.update(R),P=R.material;if(Array.isArray(P)){const O=E.groups;for(let U=0,B=O.length;U<B;U++){const z=O[U],X=P[z.materialIndex];if(X&&X.visible){const V=b(R,X,S,x);R.onBeforeShadow(r,R,w,A,E,V,z),r.renderBufferDirect(A,null,E,V,R,z),R.onAfterShadow(r,R,w,A,E,V,z)}}}else if(P.visible){const O=b(R,P,S,x);R.onBeforeShadow(r,R,w,A,E,O,null),r.renderBufferDirect(A,null,E,O,R,null),R.onAfterShadow(r,R,w,A,E,O,null)}}const I=R.children;for(let E=0,P=I.length;E<P;E++)v(I[E],w,A,S,x)}function C(R){R.target.removeEventListener("dispose",C);for(const A in l){const S=l[A],x=R.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const QM={[Jl]:Zl,[Ql]:nf,[ef]:rf,[Ts]:tf,[Zl]:Jl,[nf]:Ql,[rf]:ef,[tf]:Ts};function e1(r,e){function t(){let j=!1;const xe=new xt;let re=null;const ye=new xt(0,0,0,0);return{setMask:function(Te){re!==Te&&!j&&(r.colorMask(Te,Te,Te,Te),re=Te)},setLocked:function(Te){j=Te},setClear:function(Te,be,Ge,Ze,je){je===!0&&(Te*=Ze,be*=Ze,Ge*=Ze),xe.set(Te,be,Ge,Ze),ye.equals(xe)===!1&&(r.clearColor(Te,be,Ge,Ze),ye.copy(xe))},reset:function(){j=!1,re=null,ye.set(-1,0,0,0)}}}function n(){let j=!1,xe=!1,re=null,ye=null,Te=null;return{setReversed:function(be){if(xe!==be){const Ge=e.get("EXT_clip_control");xe?Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.ZERO_TO_ONE_EXT):Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.NEGATIVE_ONE_TO_ONE_EXT);const Ze=Te;Te=null,this.setClear(Ze)}xe=be},getReversed:function(){return xe},setTest:function(be){be?Y(r.DEPTH_TEST):ae(r.DEPTH_TEST)},setMask:function(be){re!==be&&!j&&(r.depthMask(be),re=be)},setFunc:function(be){if(xe&&(be=QM[be]),ye!==be){switch(be){case Jl:r.depthFunc(r.NEVER);break;case Zl:r.depthFunc(r.ALWAYS);break;case Ql:r.depthFunc(r.LESS);break;case Ts:r.depthFunc(r.LEQUAL);break;case ef:r.depthFunc(r.EQUAL);break;case tf:r.depthFunc(r.GEQUAL);break;case nf:r.depthFunc(r.GREATER);break;case rf:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}ye=be}},setLocked:function(be){j=be},setClear:function(be){Te!==be&&(xe&&(be=1-be),r.clearDepth(be),Te=be)},reset:function(){j=!1,re=null,ye=null,Te=null,xe=!1}}}function i(){let j=!1,xe=null,re=null,ye=null,Te=null,be=null,Ge=null,Ze=null,je=null;return{setTest:function($e){j||($e?Y(r.STENCIL_TEST):ae(r.STENCIL_TEST))},setMask:function($e){xe!==$e&&!j&&(r.stencilMask($e),xe=$e)},setFunc:function($e,Et,bt){(re!==$e||ye!==Et||Te!==bt)&&(r.stencilFunc($e,Et,bt),re=$e,ye=Et,Te=bt)},setOp:function($e,Et,bt){(be!==$e||Ge!==Et||Ze!==bt)&&(r.stencilOp($e,Et,bt),be=$e,Ge=Et,Ze=bt)},setLocked:function($e){j=$e},setClear:function($e){je!==$e&&(r.clearStencil($e),je=$e)},reset:function(){j=!1,xe=null,re=null,ye=null,Te=null,be=null,Ge=null,Ze=null,je=null}}}const s=new t,o=new n,a=new i,c=new WeakMap,l=new WeakMap;let f={},u={},h=new WeakMap,d=[],g=null,_=!1,m=null,p=null,y=null,b=null,v=null,C=null,R=null,w=new et(0,0,0),A=0,S=!1,x=null,F=null,I=null,E=null,P=null;const O=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let U=!1,B=0;const z=r.getParameter(r.VERSION);z.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(z)[1]),U=B>=1):z.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),U=B>=2);let X=null,V={};const N=r.getParameter(r.SCISSOR_BOX),q=r.getParameter(r.VIEWPORT),te=new xt().fromArray(N),k=new xt().fromArray(q);function H(j,xe,re,ye){const Te=new Uint8Array(4),be=r.createTexture();r.bindTexture(j,be),r.texParameteri(j,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(j,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Ge=0;Ge<re;Ge++)j===r.TEXTURE_3D||j===r.TEXTURE_2D_ARRAY?r.texImage3D(xe,0,r.RGBA,1,1,ye,0,r.RGBA,r.UNSIGNED_BYTE,Te):r.texImage2D(xe+Ge,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Te);return be}const se={};se[r.TEXTURE_2D]=H(r.TEXTURE_2D,r.TEXTURE_2D,1),se[r.TEXTURE_CUBE_MAP]=H(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[r.TEXTURE_2D_ARRAY]=H(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),se[r.TEXTURE_3D]=H(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Y(r.DEPTH_TEST),o.setFunc(Ts),Ie(!1),Fe(yh),Y(r.CULL_FACE),W(rr);function Y(j){f[j]!==!0&&(r.enable(j),f[j]=!0)}function ae(j){f[j]!==!1&&(r.disable(j),f[j]=!1)}function Me(j,xe){return u[j]!==xe?(r.bindFramebuffer(j,xe),u[j]=xe,j===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=xe),j===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=xe),!0):!1}function Ae(j,xe){let re=d,ye=!1;if(j){re=h.get(xe),re===void 0&&(re=[],h.set(xe,re));const Te=j.textures;if(re.length!==Te.length||re[0]!==r.COLOR_ATTACHMENT0){for(let be=0,Ge=Te.length;be<Ge;be++)re[be]=r.COLOR_ATTACHMENT0+be;re.length=Te.length,ye=!0}}else re[0]!==r.BACK&&(re[0]=r.BACK,ye=!0);ye&&r.drawBuffers(re)}function we(j){return g!==j?(r.useProgram(j),g=j,!0):!1}const he={[yr]:r.FUNC_ADD,[yv]:r.FUNC_SUBTRACT,[Sv]:r.FUNC_REVERSE_SUBTRACT};he[Ev]=r.MIN,he[Mv]=r.MAX;const Ve={[bv]:r.ZERO,[wv]:r.ONE,[Tv]:r.SRC_COLOR,[Yl]:r.SRC_ALPHA,[Uv]:r.SRC_ALPHA_SATURATE,[Dv]:r.DST_COLOR,[Rv]:r.DST_ALPHA,[Av]:r.ONE_MINUS_SRC_COLOR,[Kl]:r.ONE_MINUS_SRC_ALPHA,[Pv]:r.ONE_MINUS_DST_COLOR,[Cv]:r.ONE_MINUS_DST_ALPHA,[Iv]:r.CONSTANT_COLOR,[Lv]:r.ONE_MINUS_CONSTANT_COLOR,[Fv]:r.CONSTANT_ALPHA,[Nv]:r.ONE_MINUS_CONSTANT_ALPHA};function W(j,xe,re,ye,Te,be,Ge,Ze,je,$e){if(j===rr){_===!0&&(ae(r.BLEND),_=!1);return}if(_===!1&&(Y(r.BLEND),_=!0),j!==xv){if(j!==m||$e!==S){if((p!==yr||v!==yr)&&(r.blendEquation(r.FUNC_ADD),p=yr,v=yr),$e)switch(j){case ds:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Sh:r.blendFunc(r.ONE,r.ONE);break;case Eh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Mh:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}else switch(j){case ds:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Sh:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Eh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Mh:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}y=null,b=null,C=null,R=null,w.set(0,0,0),A=0,m=j,S=$e}return}Te=Te||xe,be=be||re,Ge=Ge||ye,(xe!==p||Te!==v)&&(r.blendEquationSeparate(he[xe],he[Te]),p=xe,v=Te),(re!==y||ye!==b||be!==C||Ge!==R)&&(r.blendFuncSeparate(Ve[re],Ve[ye],Ve[be],Ve[Ge]),y=re,b=ye,C=be,R=Ge),(Ze.equals(w)===!1||je!==A)&&(r.blendColor(Ze.r,Ze.g,Ze.b,je),w.copy(Ze),A=je),m=j,S=!1}function He(j,xe){j.side===Zn?ae(r.CULL_FACE):Y(r.CULL_FACE);let re=j.side===En;xe&&(re=!re),Ie(re),j.blending===ds&&j.transparent===!1?W(rr):W(j.blending,j.blendEquation,j.blendSrc,j.blendDst,j.blendEquationAlpha,j.blendSrcAlpha,j.blendDstAlpha,j.blendColor,j.blendAlpha,j.premultipliedAlpha),o.setFunc(j.depthFunc),o.setTest(j.depthTest),o.setMask(j.depthWrite),s.setMask(j.colorWrite);const ye=j.stencilWrite;a.setTest(ye),ye&&(a.setMask(j.stencilWriteMask),a.setFunc(j.stencilFunc,j.stencilRef,j.stencilFuncMask),a.setOp(j.stencilFail,j.stencilZFail,j.stencilZPass)),Ue(j.polygonOffset,j.polygonOffsetFactor,j.polygonOffsetUnits),j.alphaToCoverage===!0?Y(r.SAMPLE_ALPHA_TO_COVERAGE):ae(r.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(j){x!==j&&(j?r.frontFace(r.CW):r.frontFace(r.CCW),x=j)}function Fe(j){j!==gv?(Y(r.CULL_FACE),j!==F&&(j===yh?r.cullFace(r.BACK):j===_v?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ae(r.CULL_FACE),F=j}function ue(j){j!==I&&(U&&r.lineWidth(j),I=j)}function Ue(j,xe,re){j?(Y(r.POLYGON_OFFSET_FILL),(E!==xe||P!==re)&&(r.polygonOffset(xe,re),E=xe,P=re)):ae(r.POLYGON_OFFSET_FILL)}function Ee(j){j?Y(r.SCISSOR_TEST):ae(r.SCISSOR_TEST)}function T(j){j===void 0&&(j=r.TEXTURE0+O-1),X!==j&&(r.activeTexture(j),X=j)}function M(j,xe,re){re===void 0&&(X===null?re=r.TEXTURE0+O-1:re=X);let ye=V[re];ye===void 0&&(ye={type:void 0,texture:void 0},V[re]=ye),(ye.type!==j||ye.texture!==xe)&&(X!==re&&(r.activeTexture(re),X=re),r.bindTexture(j,xe||se[j]),ye.type=j,ye.texture=xe)}function G(){const j=V[X];j!==void 0&&j.type!==void 0&&(r.bindTexture(j.type,null),j.type=void 0,j.texture=void 0)}function ee(){try{r.compressedTexImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ne(){try{r.compressedTexImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function fe(){try{r.texSubImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function _e(){try{r.texSubImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ge(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Se(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Oe(){try{r.texStorage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ve(){try{r.texStorage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Re(){try{r.texImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Ce(){try{r.texImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function De(j){te.equals(j)===!1&&(r.scissor(j.x,j.y,j.z,j.w),te.copy(j))}function pe(j){k.equals(j)===!1&&(r.viewport(j.x,j.y,j.z,j.w),k.copy(j))}function Be(j,xe){let re=l.get(xe);re===void 0&&(re=new WeakMap,l.set(xe,re));let ye=re.get(j);ye===void 0&&(ye=r.getUniformBlockIndex(xe,j.name),re.set(j,ye))}function ke(j,xe){const ye=l.get(xe).get(j);c.get(xe)!==ye&&(r.uniformBlockBinding(xe,ye,j.__bindingPointIndex),c.set(xe,ye))}function it(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),f={},X=null,V={},u={},h=new WeakMap,d=[],g=null,_=!1,m=null,p=null,y=null,b=null,v=null,C=null,R=null,w=new et(0,0,0),A=0,S=!1,x=null,F=null,I=null,E=null,P=null,te.set(0,0,r.canvas.width,r.canvas.height),k.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:Y,disable:ae,bindFramebuffer:Me,drawBuffers:Ae,useProgram:we,setBlending:W,setMaterial:He,setFlipSided:Ie,setCullFace:Fe,setLineWidth:ue,setPolygonOffset:Ue,setScissorTest:Ee,activeTexture:T,bindTexture:M,unbindTexture:G,compressedTexImage2D:ee,compressedTexImage3D:ne,texImage2D:Re,texImage3D:Ce,updateUBOMapping:Be,uniformBlockBinding:ke,texStorage2D:Oe,texStorage3D:ve,texSubImage2D:fe,texSubImage3D:_e,compressedTexSubImage2D:ge,compressedTexSubImage3D:Se,scissor:De,viewport:pe,reset:it}}function _d(r,e,t,n){const i=t1(n);switch(t){case km:return r*e;case Gm:return r*e;case Vm:return r*e*2;case Hm:return r*e/i.components*i.byteLength;case fu:return r*e/i.components*i.byteLength;case Wm:return r*e*2/i.components*i.byteLength;case uu:return r*e*2/i.components*i.byteLength;case zm:return r*e*3/i.components*i.byteLength;case ti:return r*e*4/i.components*i.byteLength;case hu:return r*e*4/i.components*i.byteLength;case Oa:case Ba:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case ka:case za:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case ff:case hf:return Math.max(r,16)*Math.max(e,8)/4;case lf:case uf:return Math.max(r,8)*Math.max(e,8)/2;case df:case pf:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case mf:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case gf:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case _f:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case vf:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case xf:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case yf:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Sf:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Ef:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Mf:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case bf:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case wf:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Tf:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Af:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Rf:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Cf:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Ga:case Df:case Pf:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Xm:case Uf:return Math.ceil(r/4)*Math.ceil(e/4)*8;case If:case Lf:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function t1(r){switch(r){case ki:case Nm:return{byteLength:1,components:1};case Eo:case Om:case Go:return{byteLength:2,components:1};case cu:case lu:return{byteLength:2,components:4};case Fr:case au:case Ui:return{byteLength:4,components:1};case Bm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function n1(r,e,t,n,i,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ot,f=new WeakMap;let u;const h=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,M){return d?new OffscreenCanvas(T,M):nc("canvas")}function _(T,M,G){let ee=1;const ne=Ee(T);if((ne.width>G||ne.height>G)&&(ee=G/Math.max(ne.width,ne.height)),ee<1)if(typeof HTMLImageElement!="undefined"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&T instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&T instanceof ImageBitmap||typeof VideoFrame!="undefined"&&T instanceof VideoFrame){const fe=Math.floor(ee*ne.width),_e=Math.floor(ee*ne.height);u===void 0&&(u=g(fe,_e));const ge=M?g(fe,_e):u;return ge.width=fe,ge.height=_e,ge.getContext("2d").drawImage(T,0,0,fe,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+fe+"x"+_e+")."),ge}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){r.generateMipmap(T)}function y(T){return T.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?r.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function b(T,M,G,ee,ne=!1){if(T!==null){if(r[T]!==void 0)return r[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let fe=M;if(M===r.RED&&(G===r.FLOAT&&(fe=r.R32F),G===r.HALF_FLOAT&&(fe=r.R16F),G===r.UNSIGNED_BYTE&&(fe=r.R8)),M===r.RED_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.R8UI),G===r.UNSIGNED_SHORT&&(fe=r.R16UI),G===r.UNSIGNED_INT&&(fe=r.R32UI),G===r.BYTE&&(fe=r.R8I),G===r.SHORT&&(fe=r.R16I),G===r.INT&&(fe=r.R32I)),M===r.RG&&(G===r.FLOAT&&(fe=r.RG32F),G===r.HALF_FLOAT&&(fe=r.RG16F),G===r.UNSIGNED_BYTE&&(fe=r.RG8)),M===r.RG_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RG8UI),G===r.UNSIGNED_SHORT&&(fe=r.RG16UI),G===r.UNSIGNED_INT&&(fe=r.RG32UI),G===r.BYTE&&(fe=r.RG8I),G===r.SHORT&&(fe=r.RG16I),G===r.INT&&(fe=r.RG32I)),M===r.RGB_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RGB8UI),G===r.UNSIGNED_SHORT&&(fe=r.RGB16UI),G===r.UNSIGNED_INT&&(fe=r.RGB32UI),G===r.BYTE&&(fe=r.RGB8I),G===r.SHORT&&(fe=r.RGB16I),G===r.INT&&(fe=r.RGB32I)),M===r.RGBA_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RGBA8UI),G===r.UNSIGNED_SHORT&&(fe=r.RGBA16UI),G===r.UNSIGNED_INT&&(fe=r.RGBA32UI),G===r.BYTE&&(fe=r.RGBA8I),G===r.SHORT&&(fe=r.RGBA16I),G===r.INT&&(fe=r.RGBA32I)),M===r.RGB&&G===r.UNSIGNED_INT_5_9_9_9_REV&&(fe=r.RGB9_E5),M===r.RGBA){const _e=ne?xc:dt.getTransfer(ee);G===r.FLOAT&&(fe=r.RGBA32F),G===r.HALF_FLOAT&&(fe=r.RGBA16F),G===r.UNSIGNED_BYTE&&(fe=_e===St?r.SRGB8_ALPHA8:r.RGBA8),G===r.UNSIGNED_SHORT_4_4_4_4&&(fe=r.RGBA4),G===r.UNSIGNED_SHORT_5_5_5_1&&(fe=r.RGB5_A1)}return(fe===r.R16F||fe===r.R32F||fe===r.RG16F||fe===r.RG32F||fe===r.RGBA16F||fe===r.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function v(T,M){let G;return T?M===null||M===Fr||M===Cs?G=r.DEPTH24_STENCIL8:M===Ui?G=r.DEPTH32F_STENCIL8:M===Eo&&(G=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Fr||M===Cs?G=r.DEPTH_COMPONENT24:M===Ui?G=r.DEPTH_COMPONENT32F:M===Eo&&(G=r.DEPTH_COMPONENT16),G}function C(T,M){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==ri&&T.minFilter!==zn?Math.log2(Math.max(M.width,M.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?M.mipmaps.length:1}function R(T){const M=T.target;M.removeEventListener("dispose",R),A(M),M.isVideoTexture&&f.delete(M)}function w(T){const M=T.target;M.removeEventListener("dispose",w),x(M)}function A(T){const M=n.get(T);if(M.__webglInit===void 0)return;const G=T.source,ee=h.get(G);if(ee){const ne=ee[M.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&S(T),Object.keys(ee).length===0&&h.delete(G)}n.remove(T)}function S(T){const M=n.get(T);r.deleteTexture(M.__webglTexture);const G=T.source,ee=h.get(G);delete ee[M.__cacheKey],o.memory.textures--}function x(T){const M=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(M.__webglFramebuffer[ee]))for(let ne=0;ne<M.__webglFramebuffer[ee].length;ne++)r.deleteFramebuffer(M.__webglFramebuffer[ee][ne]);else r.deleteFramebuffer(M.__webglFramebuffer[ee]);M.__webglDepthbuffer&&r.deleteRenderbuffer(M.__webglDepthbuffer[ee])}else{if(Array.isArray(M.__webglFramebuffer))for(let ee=0;ee<M.__webglFramebuffer.length;ee++)r.deleteFramebuffer(M.__webglFramebuffer[ee]);else r.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&r.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&r.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ee=0;ee<M.__webglColorRenderbuffer.length;ee++)M.__webglColorRenderbuffer[ee]&&r.deleteRenderbuffer(M.__webglColorRenderbuffer[ee]);M.__webglDepthRenderbuffer&&r.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const G=T.textures;for(let ee=0,ne=G.length;ee<ne;ee++){const fe=n.get(G[ee]);fe.__webglTexture&&(r.deleteTexture(fe.__webglTexture),o.memory.textures--),n.remove(G[ee])}n.remove(T)}let F=0;function I(){F=0}function E(){const T=F;return T>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+i.maxTextures),F+=1,T}function P(T){const M=[];return M.push(T.wrapS),M.push(T.wrapT),M.push(T.wrapR||0),M.push(T.magFilter),M.push(T.minFilter),M.push(T.anisotropy),M.push(T.internalFormat),M.push(T.format),M.push(T.type),M.push(T.generateMipmaps),M.push(T.premultiplyAlpha),M.push(T.flipY),M.push(T.unpackAlignment),M.push(T.colorSpace),M.join()}function O(T,M){const G=n.get(T);if(T.isVideoTexture&&ue(T),T.isRenderTargetTexture===!1&&T.version>0&&G.__version!==T.version){const ee=T.image;if(ee===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{k(G,T,M);return}}t.bindTexture(r.TEXTURE_2D,G.__webglTexture,r.TEXTURE0+M)}function U(T,M){const G=n.get(T);if(T.version>0&&G.__version!==T.version){k(G,T,M);return}t.bindTexture(r.TEXTURE_2D_ARRAY,G.__webglTexture,r.TEXTURE0+M)}function B(T,M){const G=n.get(T);if(T.version>0&&G.__version!==T.version){k(G,T,M);return}t.bindTexture(r.TEXTURE_3D,G.__webglTexture,r.TEXTURE0+M)}function z(T,M){const G=n.get(T);if(T.version>0&&G.__version!==T.version){H(G,T,M);return}t.bindTexture(r.TEXTURE_CUBE_MAP,G.__webglTexture,r.TEXTURE0+M)}const X={[af]:r.REPEAT,[Tr]:r.CLAMP_TO_EDGE,[cf]:r.MIRRORED_REPEAT},V={[ri]:r.NEAREST,[qv]:r.NEAREST_MIPMAP_NEAREST,[ca]:r.NEAREST_MIPMAP_LINEAR,[zn]:r.LINEAR,[Yc]:r.LINEAR_MIPMAP_NEAREST,[Ar]:r.LINEAR_MIPMAP_LINEAR},N={[Yv]:r.NEVER,[tx]:r.ALWAYS,[Kv]:r.LESS,[$m]:r.LEQUAL,[Jv]:r.EQUAL,[ex]:r.GEQUAL,[Zv]:r.GREATER,[Qv]:r.NOTEQUAL};function q(T,M){if(M.type===Ui&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===zn||M.magFilter===Yc||M.magFilter===ca||M.magFilter===Ar||M.minFilter===zn||M.minFilter===Yc||M.minFilter===ca||M.minFilter===Ar)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(T,r.TEXTURE_WRAP_S,X[M.wrapS]),r.texParameteri(T,r.TEXTURE_WRAP_T,X[M.wrapT]),(T===r.TEXTURE_3D||T===r.TEXTURE_2D_ARRAY)&&r.texParameteri(T,r.TEXTURE_WRAP_R,X[M.wrapR]),r.texParameteri(T,r.TEXTURE_MAG_FILTER,V[M.magFilter]),r.texParameteri(T,r.TEXTURE_MIN_FILTER,V[M.minFilter]),M.compareFunction&&(r.texParameteri(T,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(T,r.TEXTURE_COMPARE_FUNC,N[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===ri||M.minFilter!==ca&&M.minFilter!==Ar||M.type===Ui&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");r.texParameterf(T,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,i.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function te(T,M){let G=!1;T.__webglInit===void 0&&(T.__webglInit=!0,M.addEventListener("dispose",R));const ee=M.source;let ne=h.get(ee);ne===void 0&&(ne={},h.set(ee,ne));const fe=P(M);if(fe!==T.__cacheKey){ne[fe]===void 0&&(ne[fe]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ne[fe].usedTimes++;const _e=ne[T.__cacheKey];_e!==void 0&&(ne[T.__cacheKey].usedTimes--,_e.usedTimes===0&&S(M)),T.__cacheKey=fe,T.__webglTexture=ne[fe].texture}return G}function k(T,M,G){let ee=r.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ee=r.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ee=r.TEXTURE_3D);const ne=te(T,M),fe=M.source;t.bindTexture(ee,T.__webglTexture,r.TEXTURE0+G);const _e=n.get(fe);if(fe.version!==_e.__version||ne===!0){t.activeTexture(r.TEXTURE0+G);const ge=dt.getPrimaries(dt.workingColorSpace),Se=M.colorSpace===Ji?null:dt.getPrimaries(M.colorSpace),Oe=M.colorSpace===Ji||ge===Se?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);let ve=_(M.image,!1,i.maxTextureSize);ve=Ue(M,ve);const Re=s.convert(M.format,M.colorSpace),Ce=s.convert(M.type);let De=b(M.internalFormat,Re,Ce,M.colorSpace,M.isVideoTexture);q(ee,M);let pe;const Be=M.mipmaps,ke=M.isVideoTexture!==!0,it=_e.__version===void 0||ne===!0,j=fe.dataReady,xe=C(M,ve);if(M.isDepthTexture)De=v(M.format===Ds,M.type),it&&(ke?t.texStorage2D(r.TEXTURE_2D,1,De,ve.width,ve.height):t.texImage2D(r.TEXTURE_2D,0,De,ve.width,ve.height,0,Re,Ce,null));else if(M.isDataTexture)if(Be.length>0){ke&&it&&t.texStorage2D(r.TEXTURE_2D,xe,De,Be[0].width,Be[0].height);for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,Ce,pe.data):t.texImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,Re,Ce,pe.data);M.generateMipmaps=!1}else ke?(it&&t.texStorage2D(r.TEXTURE_2D,xe,De,ve.width,ve.height),j&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ve.width,ve.height,Re,Ce,ve.data)):t.texImage2D(r.TEXTURE_2D,0,De,ve.width,ve.height,0,Re,Ce,ve.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){ke&&it&&t.texStorage3D(r.TEXTURE_2D_ARRAY,xe,De,Be[0].width,Be[0].height,ve.depth);for(let re=0,ye=Be.length;re<ye;re++)if(pe=Be[re],M.format!==ti)if(Re!==null)if(ke){if(j)if(M.layerUpdates.size>0){const Te=_d(pe.width,pe.height,M.format,M.type);for(const be of M.layerUpdates){const Ge=pe.data.subarray(be*Te/pe.data.BYTES_PER_ELEMENT,(be+1)*Te/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,be,pe.width,pe.height,1,Re,Ge)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,ve.depth,Re,pe.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,re,De,pe.width,pe.height,ve.depth,0,pe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?j&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,ve.depth,Re,Ce,pe.data):t.texImage3D(r.TEXTURE_2D_ARRAY,re,De,pe.width,pe.height,ve.depth,0,Re,Ce,pe.data)}else{ke&&it&&t.texStorage2D(r.TEXTURE_2D,xe,De,Be[0].width,Be[0].height);for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],M.format!==ti?Re!==null?ke?j&&t.compressedTexSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,pe.data):t.compressedTexImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,Ce,pe.data):t.texImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,Re,Ce,pe.data)}else if(M.isDataArrayTexture)if(ke){if(it&&t.texStorage3D(r.TEXTURE_2D_ARRAY,xe,De,ve.width,ve.height,ve.depth),j)if(M.layerUpdates.size>0){const re=_d(ve.width,ve.height,M.format,M.type);for(const ye of M.layerUpdates){const Te=ve.data.subarray(ye*re/ve.data.BYTES_PER_ELEMENT,(ye+1)*re/ve.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ye,ve.width,ve.height,1,Re,Ce,Te)}M.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ve.width,ve.height,ve.depth,Re,Ce,ve.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,De,ve.width,ve.height,ve.depth,0,Re,Ce,ve.data);else if(M.isData3DTexture)ke?(it&&t.texStorage3D(r.TEXTURE_3D,xe,De,ve.width,ve.height,ve.depth),j&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ve.width,ve.height,ve.depth,Re,Ce,ve.data)):t.texImage3D(r.TEXTURE_3D,0,De,ve.width,ve.height,ve.depth,0,Re,Ce,ve.data);else if(M.isFramebufferTexture){if(it)if(ke)t.texStorage2D(r.TEXTURE_2D,xe,De,ve.width,ve.height);else{let re=ve.width,ye=ve.height;for(let Te=0;Te<xe;Te++)t.texImage2D(r.TEXTURE_2D,Te,De,re,ye,0,Re,Ce,null),re>>=1,ye>>=1}}else if(Be.length>0){if(ke&&it){const re=Ee(Be[0]);t.texStorage2D(r.TEXTURE_2D,xe,De,re.width,re.height)}for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,Re,Ce,pe):t.texImage2D(r.TEXTURE_2D,re,De,Re,Ce,pe);M.generateMipmaps=!1}else if(ke){if(it){const re=Ee(ve);t.texStorage2D(r.TEXTURE_2D,xe,De,re.width,re.height)}j&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,Re,Ce,ve)}else t.texImage2D(r.TEXTURE_2D,0,De,Re,Ce,ve);m(M)&&p(ee),_e.__version=fe.version,M.onUpdate&&M.onUpdate(M)}T.__version=M.version}function H(T,M,G){if(M.image.length!==6)return;const ee=te(T,M),ne=M.source;t.bindTexture(r.TEXTURE_CUBE_MAP,T.__webglTexture,r.TEXTURE0+G);const fe=n.get(ne);if(ne.version!==fe.__version||ee===!0){t.activeTexture(r.TEXTURE0+G);const _e=dt.getPrimaries(dt.workingColorSpace),ge=M.colorSpace===Ji?null:dt.getPrimaries(M.colorSpace),Se=M.colorSpace===Ji||_e===ge?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const Oe=M.isCompressedTexture||M.image[0].isCompressedTexture,ve=M.image[0]&&M.image[0].isDataTexture,Re=[];for(let ye=0;ye<6;ye++)!Oe&&!ve?Re[ye]=_(M.image[ye],!0,i.maxCubemapSize):Re[ye]=ve?M.image[ye].image:M.image[ye],Re[ye]=Ue(M,Re[ye]);const Ce=Re[0],De=s.convert(M.format,M.colorSpace),pe=s.convert(M.type),Be=b(M.internalFormat,De,pe,M.colorSpace),ke=M.isVideoTexture!==!0,it=fe.__version===void 0||ee===!0,j=ne.dataReady;let xe=C(M,Ce);q(r.TEXTURE_CUBE_MAP,M);let re;if(Oe){ke&&it&&t.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Be,Ce.width,Ce.height);for(let ye=0;ye<6;ye++){re=Re[ye].mipmaps;for(let Te=0;Te<re.length;Te++){const be=re[Te];M.format!==ti?De!==null?ke?j&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,0,0,be.width,be.height,De,be.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,Be,be.width,be.height,0,be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,0,0,be.width,be.height,De,pe,be.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,Be,be.width,be.height,0,De,pe,be.data)}}}else{if(re=M.mipmaps,ke&&it){re.length>0&&xe++;const ye=Ee(Re[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Be,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(ve){ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,Re[ye].width,Re[ye].height,De,pe,Re[ye].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,Be,Re[ye].width,Re[ye].height,0,De,pe,Re[ye].data);for(let Te=0;Te<re.length;Te++){const Ge=re[Te].image[ye].image;ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,0,0,Ge.width,Ge.height,De,pe,Ge.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,Be,Ge.width,Ge.height,0,De,pe,Ge.data)}}else{ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,De,pe,Re[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,Be,De,pe,Re[ye]);for(let Te=0;Te<re.length;Te++){const be=re[Te];ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,0,0,De,pe,be.image[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,Be,De,pe,be.image[ye])}}}m(M)&&p(r.TEXTURE_CUBE_MAP),fe.__version=ne.version,M.onUpdate&&M.onUpdate(M)}T.__version=M.version}function se(T,M,G,ee,ne,fe){const _e=s.convert(G.format,G.colorSpace),ge=s.convert(G.type),Se=b(G.internalFormat,_e,ge,G.colorSpace),Oe=n.get(M),ve=n.get(G);if(ve.__renderTarget=M,!Oe.__hasExternalTextures){const Re=Math.max(1,M.width>>fe),Ce=Math.max(1,M.height>>fe);ne===r.TEXTURE_3D||ne===r.TEXTURE_2D_ARRAY?t.texImage3D(ne,fe,Se,Re,Ce,M.depth,0,_e,ge,null):t.texImage2D(ne,fe,Se,Re,Ce,0,_e,ge,null)}t.bindFramebuffer(r.FRAMEBUFFER,T),Fe(M)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ee,ne,ve.__webglTexture,0,Ie(M)):(ne===r.TEXTURE_2D||ne>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,ee,ne,ve.__webglTexture,fe),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Y(T,M,G){if(r.bindRenderbuffer(r.RENDERBUFFER,T),M.depthBuffer){const ee=M.depthTexture,ne=ee&&ee.isDepthTexture?ee.type:null,fe=v(M.stencilBuffer,ne),_e=M.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ge=Ie(M);Fe(M)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ge,fe,M.width,M.height):G?r.renderbufferStorageMultisample(r.RENDERBUFFER,ge,fe,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,fe,M.width,M.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,_e,r.RENDERBUFFER,T)}else{const ee=M.textures;for(let ne=0;ne<ee.length;ne++){const fe=ee[ne],_e=s.convert(fe.format,fe.colorSpace),ge=s.convert(fe.type),Se=b(fe.internalFormat,_e,ge,fe.colorSpace),Oe=Ie(M);G&&Fe(M)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Oe,Se,M.width,M.height):Fe(M)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Oe,Se,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,Se,M.width,M.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function ae(T,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,T),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ee=n.get(M.depthTexture);ee.__renderTarget=M,(!ee.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),O(M.depthTexture,0);const ne=ee.__webglTexture,fe=Ie(M);if(M.depthTexture.format===ps)Fe(M)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ne,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ne,0);else if(M.depthTexture.format===Ds)Fe(M)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ne,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ne,0);else throw new Error("Unknown depthTexture format")}function Me(T){const M=n.get(T),G=T.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==T.depthTexture){const ee=T.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),ee){const ne=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,ee.removeEventListener("dispose",ne)};ee.addEventListener("dispose",ne),M.__depthDisposeCallback=ne}M.__boundDepthTexture=ee}if(T.depthTexture&&!M.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");ae(M.__webglFramebuffer,T)}else if(G){M.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)if(t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer[ee]),M.__webglDepthbuffer[ee]===void 0)M.__webglDepthbuffer[ee]=r.createRenderbuffer(),Y(M.__webglDepthbuffer[ee],T,!1);else{const ne=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,fe=M.__webglDepthbuffer[ee];r.bindRenderbuffer(r.RENDERBUFFER,fe),r.framebufferRenderbuffer(r.FRAMEBUFFER,ne,r.RENDERBUFFER,fe)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=r.createRenderbuffer(),Y(M.__webglDepthbuffer,T,!1);else{const ee=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ne=M.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ne),r.framebufferRenderbuffer(r.FRAMEBUFFER,ee,r.RENDERBUFFER,ne)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ae(T,M,G){const ee=n.get(T);M!==void 0&&se(ee.__webglFramebuffer,T,T.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),G!==void 0&&Me(T)}function we(T){const M=T.texture,G=n.get(T),ee=n.get(M);T.addEventListener("dispose",w);const ne=T.textures,fe=T.isWebGLCubeRenderTarget===!0,_e=ne.length>1;if(_e||(ee.__webglTexture===void 0&&(ee.__webglTexture=r.createTexture()),ee.__version=M.version,o.memory.textures++),fe){G.__webglFramebuffer=[];for(let ge=0;ge<6;ge++)if(M.mipmaps&&M.mipmaps.length>0){G.__webglFramebuffer[ge]=[];for(let Se=0;Se<M.mipmaps.length;Se++)G.__webglFramebuffer[ge][Se]=r.createFramebuffer()}else G.__webglFramebuffer[ge]=r.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){G.__webglFramebuffer=[];for(let ge=0;ge<M.mipmaps.length;ge++)G.__webglFramebuffer[ge]=r.createFramebuffer()}else G.__webglFramebuffer=r.createFramebuffer();if(_e)for(let ge=0,Se=ne.length;ge<Se;ge++){const Oe=n.get(ne[ge]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=r.createTexture(),o.memory.textures++)}if(T.samples>0&&Fe(T)===!1){G.__webglMultisampledFramebuffer=r.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ge=0;ge<ne.length;ge++){const Se=ne[ge];G.__webglColorRenderbuffer[ge]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,G.__webglColorRenderbuffer[ge]);const Oe=s.convert(Se.format,Se.colorSpace),ve=s.convert(Se.type),Re=b(Se.internalFormat,Oe,ve,Se.colorSpace,T.isXRRenderTarget===!0),Ce=Ie(T);r.renderbufferStorageMultisample(r.RENDERBUFFER,Ce,Re,T.width,T.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ge,r.RENDERBUFFER,G.__webglColorRenderbuffer[ge])}r.bindRenderbuffer(r.RENDERBUFFER,null),T.depthBuffer&&(G.__webglDepthRenderbuffer=r.createRenderbuffer(),Y(G.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(fe){t.bindTexture(r.TEXTURE_CUBE_MAP,ee.__webglTexture),q(r.TEXTURE_CUBE_MAP,M);for(let ge=0;ge<6;ge++)if(M.mipmaps&&M.mipmaps.length>0)for(let Se=0;Se<M.mipmaps.length;Se++)se(G.__webglFramebuffer[ge][Se],T,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Se);else se(G.__webglFramebuffer[ge],T,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0);m(M)&&p(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(_e){for(let ge=0,Se=ne.length;ge<Se;ge++){const Oe=ne[ge],ve=n.get(Oe);t.bindTexture(r.TEXTURE_2D,ve.__webglTexture),q(r.TEXTURE_2D,Oe),se(G.__webglFramebuffer,T,Oe,r.COLOR_ATTACHMENT0+ge,r.TEXTURE_2D,0),m(Oe)&&p(r.TEXTURE_2D)}t.unbindTexture()}else{let ge=r.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ge=T.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ge,ee.__webglTexture),q(ge,M),M.mipmaps&&M.mipmaps.length>0)for(let Se=0;Se<M.mipmaps.length;Se++)se(G.__webglFramebuffer[Se],T,M,r.COLOR_ATTACHMENT0,ge,Se);else se(G.__webglFramebuffer,T,M,r.COLOR_ATTACHMENT0,ge,0);m(M)&&p(ge),t.unbindTexture()}T.depthBuffer&&Me(T)}function he(T){const M=T.textures;for(let G=0,ee=M.length;G<ee;G++){const ne=M[G];if(m(ne)){const fe=y(T),_e=n.get(ne).__webglTexture;t.bindTexture(fe,_e),p(fe),t.unbindTexture()}}}const Ve=[],W=[];function He(T){if(T.samples>0){if(Fe(T)===!1){const M=T.textures,G=T.width,ee=T.height;let ne=r.COLOR_BUFFER_BIT;const fe=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,_e=n.get(T),ge=M.length>1;if(ge)for(let Se=0;Se<M.length;Se++)t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let Se=0;Se<M.length;Se++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(ne|=r.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(ne|=r.STENCIL_BUFFER_BIT)),ge){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,_e.__webglColorRenderbuffer[Se]);const Oe=n.get(M[Se]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Oe,0)}r.blitFramebuffer(0,0,G,ee,0,0,G,ee,ne,r.NEAREST),c===!0&&(Ve.length=0,W.length=0,Ve.push(r.COLOR_ATTACHMENT0+Se),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Ve.push(fe),W.push(fe),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,W)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Ve))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ge)for(let Se=0;Se<M.length;Se++){t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,_e.__webglColorRenderbuffer[Se]);const Oe=n.get(M[Se]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,Oe,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){const M=T.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[M])}}}function Ie(T){return Math.min(i.maxSamples,T.samples)}function Fe(T){const M=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ue(T){const M=o.render.frame;f.get(T)!==M&&(f.set(T,M),T.update())}function Ue(T,M){const G=T.colorSpace,ee=T.format,ne=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||G!==Ns&&G!==Ji&&(dt.getTransfer(G)===St?(ee!==ti||ne!==ki)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),M}function Ee(T){return typeof HTMLImageElement!="undefined"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame!="undefined"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=E,this.resetTextureUnits=I,this.setTexture2D=O,this.setTexture2DArray=U,this.setTexture3D=B,this.setTextureCube=z,this.rebindTextures=Ae,this.setupRenderTarget=we,this.updateRenderTargetMipmap=he,this.updateMultisampleRenderTarget=He,this.setupDepthRenderbuffer=Me,this.setupFrameBufferTexture=se,this.useMultisampledRTT=Fe}function i1(r,e){function t(n,i=Ji){let s;const o=dt.getTransfer(i);if(n===ki)return r.UNSIGNED_BYTE;if(n===cu)return r.UNSIGNED_SHORT_4_4_4_4;if(n===lu)return r.UNSIGNED_SHORT_5_5_5_1;if(n===Bm)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===Nm)return r.BYTE;if(n===Om)return r.SHORT;if(n===Eo)return r.UNSIGNED_SHORT;if(n===au)return r.INT;if(n===Fr)return r.UNSIGNED_INT;if(n===Ui)return r.FLOAT;if(n===Go)return r.HALF_FLOAT;if(n===km)return r.ALPHA;if(n===zm)return r.RGB;if(n===ti)return r.RGBA;if(n===Gm)return r.LUMINANCE;if(n===Vm)return r.LUMINANCE_ALPHA;if(n===ps)return r.DEPTH_COMPONENT;if(n===Ds)return r.DEPTH_STENCIL;if(n===Hm)return r.RED;if(n===fu)return r.RED_INTEGER;if(n===Wm)return r.RG;if(n===uu)return r.RG_INTEGER;if(n===hu)return r.RGBA_INTEGER;if(n===Oa||n===Ba||n===ka||n===za)if(o===St)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Oa)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ba)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ka)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===za)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Oa)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ba)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ka)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===za)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===lf||n===ff||n===uf||n===hf)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===lf)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ff)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===uf)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===hf)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===df||n===pf||n===mf)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===df||n===pf)return o===St?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===mf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===gf||n===_f||n===vf||n===xf||n===yf||n===Sf||n===Ef||n===Mf||n===bf||n===wf||n===Tf||n===Af||n===Rf||n===Cf)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===gf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===_f)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===vf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===xf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===yf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Sf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ef)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Mf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===bf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===wf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Tf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Af)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Rf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Cf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ga||n===Df||n===Pf)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Ga)return o===St?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Df)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Pf)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Xm||n===Uf||n===If||n===Lf)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Ga)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Uf)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===If)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Lf)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Cs?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class r1 extends xn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class us extends Xt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const s1={type:"move"};class bl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new us,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new us,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ie,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ie),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new us,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ie,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ie),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(l,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const f=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],h=f.position.distanceTo(u.position),d=.02,g=.005;l.inputState.pinching&&h>d+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=d-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(s1)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new us;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const o1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,a1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class c1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new cn,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ar({vertexShader:o1,fragmentShader:a1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Wt(new zr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class l1 extends Os{constructor(e,t){super();const n=this;let i=null,s=1,o=null,a="local-floor",c=1,l=null,f=null,u=null,h=null,d=null,g=null;const _=new c1,m=t.getContextAttributes();let p=null,y=null;const b=[],v=[],C=new ot;let R=null;const w=new xn;w.viewport=new xt;const A=new xn;A.viewport=new xt;const S=[w,A],x=new r1;let F=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let H=b[k];return H===void 0&&(H=new bl,b[k]=H),H.getTargetRaySpace()},this.getControllerGrip=function(k){let H=b[k];return H===void 0&&(H=new bl,b[k]=H),H.getGripSpace()},this.getHand=function(k){let H=b[k];return H===void 0&&(H=new bl,b[k]=H),H.getHandSpace()};function E(k){const H=v.indexOf(k.inputSource);if(H===-1)return;const se=b[H];se!==void 0&&(se.update(k.inputSource,k.frame,l||o),se.dispatchEvent({type:k.type,data:k.inputSource}))}function P(){i.removeEventListener("select",E),i.removeEventListener("selectstart",E),i.removeEventListener("selectend",E),i.removeEventListener("squeeze",E),i.removeEventListener("squeezestart",E),i.removeEventListener("squeezeend",E),i.removeEventListener("end",P),i.removeEventListener("inputsourceschange",O);for(let k=0;k<b.length;k++){const H=v[k];H!==null&&(v[k]=null,b[k].disconnect(H))}F=null,I=null,_.reset(),e.setRenderTarget(p),d=null,h=null,u=null,i=null,y=null,te.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){s=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){a=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(k){l=k},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(k){if(i=k,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",E),i.addEventListener("selectstart",E),i.addEventListener("selectend",E),i.addEventListener("squeeze",E),i.addEventListener("squeezestart",E),i.addEventListener("squeezeend",E),i.addEventListener("end",P),i.addEventListener("inputsourceschange",O),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(C),i.renderState.layers===void 0){const H={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,H),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Nr(d.framebufferWidth,d.framebufferHeight,{format:ti,type:ki,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let H=null,se=null,Y=null;m.depth&&(Y=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,H=m.stencil?Ds:ps,se=m.stencil?Cs:Fr);const ae={colorFormat:t.RGBA8,depthFormat:Y,scaleFactor:s};u=new XRWebGLBinding(i,t),h=u.createProjectionLayer(ae),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),y=new Nr(h.textureWidth,h.textureHeight,{format:ti,type:ki,depthTexture:new og(h.textureWidth,h.textureHeight,se,void 0,void 0,void 0,void 0,void 0,void 0,H),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),te.setContext(i),te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function O(k){for(let H=0;H<k.removed.length;H++){const se=k.removed[H],Y=v.indexOf(se);Y>=0&&(v[Y]=null,b[Y].disconnect(se))}for(let H=0;H<k.added.length;H++){const se=k.added[H];let Y=v.indexOf(se);if(Y===-1){for(let Me=0;Me<b.length;Me++)if(Me>=v.length){v.push(se),Y=Me;break}else if(v[Me]===null){v[Me]=se,Y=Me;break}if(Y===-1)break}const ae=b[Y];ae&&ae.connect(se)}}const U=new ie,B=new ie;function z(k,H,se){U.setFromMatrixPosition(H.matrixWorld),B.setFromMatrixPosition(se.matrixWorld);const Y=U.distanceTo(B),ae=H.projectionMatrix.elements,Me=se.projectionMatrix.elements,Ae=ae[14]/(ae[10]-1),we=ae[14]/(ae[10]+1),he=(ae[9]+1)/ae[5],Ve=(ae[9]-1)/ae[5],W=(ae[8]-1)/ae[0],He=(Me[8]+1)/Me[0],Ie=Ae*W,Fe=Ae*He,ue=Y/(-W+He),Ue=ue*-W;if(H.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(Ue),k.translateZ(ue),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),ae[10]===-1)k.projectionMatrix.copy(H.projectionMatrix),k.projectionMatrixInverse.copy(H.projectionMatrixInverse);else{const Ee=Ae+ue,T=we+ue,M=Ie-Ue,G=Fe+(Y-Ue),ee=he*we/T*Ee,ne=Ve*we/T*Ee;k.projectionMatrix.makePerspective(M,G,ee,ne,Ee,T),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function X(k,H){H===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(H.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(i===null)return;let H=k.near,se=k.far;_.texture!==null&&(_.depthNear>0&&(H=_.depthNear),_.depthFar>0&&(se=_.depthFar)),x.near=A.near=w.near=H,x.far=A.far=w.far=se,(F!==x.near||I!==x.far)&&(i.updateRenderState({depthNear:x.near,depthFar:x.far}),F=x.near,I=x.far),w.layers.mask=k.layers.mask|2,A.layers.mask=k.layers.mask|4,x.layers.mask=w.layers.mask|A.layers.mask;const Y=k.parent,ae=x.cameras;X(x,Y);for(let Me=0;Me<ae.length;Me++)X(ae[Me],Y);ae.length===2?z(x,w,A):x.projectionMatrix.copy(w.projectionMatrix),V(k,x,Y)};function V(k,H,se){se===null?k.matrix.copy(H.matrixWorld):(k.matrix.copy(se.matrixWorld),k.matrix.invert(),k.matrix.multiply(H.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(H.projectionMatrix),k.projectionMatrixInverse.copy(H.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=tc*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(h===null&&d===null))return c},this.setFoveation=function(k){c=k,h!==null&&(h.fixedFoveation=k),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=k)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let N=null;function q(k,H){if(f=H.getViewerPose(l||o),g=H,f!==null){const se=f.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let Y=!1;se.length!==x.cameras.length&&(x.cameras.length=0,Y=!0);for(let Me=0;Me<se.length;Me++){const Ae=se[Me];let we=null;if(d!==null)we=d.getViewport(Ae);else{const Ve=u.getViewSubImage(h,Ae);we=Ve.viewport,Me===0&&(e.setRenderTargetTextures(y,Ve.colorTexture,h.ignoreDepthValues?void 0:Ve.depthStencilTexture),e.setRenderTarget(y))}let he=S[Me];he===void 0&&(he=new xn,he.layers.enable(Me),he.viewport=new xt,S[Me]=he),he.matrix.fromArray(Ae.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(Ae.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(we.x,we.y,we.width,we.height),Me===0&&(x.matrix.copy(he.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),Y===!0&&x.cameras.push(he)}const ae=i.enabledFeatures;if(ae&&ae.includes("depth-sensing")){const Me=u.getDepthInformation(se[0]);Me&&Me.isValid&&Me.texture&&_.init(e,Me,i.renderState)}}for(let se=0;se<b.length;se++){const Y=v[se],ae=b[se];Y!==null&&ae!==void 0&&ae.update(Y,H,l||o)}N&&N(k,H),H.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:H}),g=null}const te=new sg;te.setAnimationLoop(q),this.setAnimationLoop=function(k){N=k},this.dispose=function(){}}}const gr=new xi,f1=new wt;function u1(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,tg(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,y,b,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),u(m,p)):p.isMeshPhongMaterial?(s(m,p),f(m,p)):p.isMeshStandardMaterial?(s(m,p),h(m,p),p.isMeshPhysicalMaterial&&d(m,p,v)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,y,b):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===En&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===En&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=e.get(p),b=y.envMap,v=y.envMapRotation;b&&(m.envMap.value=b,gr.copy(v),gr.x*=-1,gr.y*=-1,gr.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(gr.y*=-1,gr.z*=-1),m.envMapRotation.value.setFromMatrix4(f1.makeRotationFromEuler(gr)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,y,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function f(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===En&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function h1(r,e,t,n){let i={},s={},o=[];const a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,b){const v=b.program;n.uniformBlockBinding(y,v)}function l(y,b){let v=i[y.id];v===void 0&&(g(y),v=f(y),i[y.id]=v,y.addEventListener("dispose",m));const C=b.program;n.updateUBOMapping(y,C);const R=e.render.frame;s[y.id]!==R&&(h(y),s[y.id]=R)}function f(y){const b=u();y.__bindingPointIndex=b;const v=r.createBuffer(),C=y.__size,R=y.usage;return r.bindBuffer(r.UNIFORM_BUFFER,v),r.bufferData(r.UNIFORM_BUFFER,C,R),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,b,v),v}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){const b=i[y.id],v=y.uniforms,C=y.__cache;r.bindBuffer(r.UNIFORM_BUFFER,b);for(let R=0,w=v.length;R<w;R++){const A=Array.isArray(v[R])?v[R]:[v[R]];for(let S=0,x=A.length;S<x;S++){const F=A[S];if(d(F,R,S,C)===!0){const I=F.__offset,E=Array.isArray(F.value)?F.value:[F.value];let P=0;for(let O=0;O<E.length;O++){const U=E[O],B=_(U);typeof U=="number"||typeof U=="boolean"?(F.__data[0]=U,r.bufferSubData(r.UNIFORM_BUFFER,I+P,F.__data)):U.isMatrix3?(F.__data[0]=U.elements[0],F.__data[1]=U.elements[1],F.__data[2]=U.elements[2],F.__data[3]=0,F.__data[4]=U.elements[3],F.__data[5]=U.elements[4],F.__data[6]=U.elements[5],F.__data[7]=0,F.__data[8]=U.elements[6],F.__data[9]=U.elements[7],F.__data[10]=U.elements[8],F.__data[11]=0):(U.toArray(F.__data,P),P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,I,F.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(y,b,v,C){const R=y.value,w=b+"_"+v;if(C[w]===void 0)return typeof R=="number"||typeof R=="boolean"?C[w]=R:C[w]=R.clone(),!0;{const A=C[w];if(typeof R=="number"||typeof R=="boolean"){if(A!==R)return C[w]=R,!0}else if(A.equals(R)===!1)return A.copy(R),!0}return!1}function g(y){const b=y.uniforms;let v=0;const C=16;for(let w=0,A=b.length;w<A;w++){const S=Array.isArray(b[w])?b[w]:[b[w]];for(let x=0,F=S.length;x<F;x++){const I=S[x],E=Array.isArray(I.value)?I.value:[I.value];for(let P=0,O=E.length;P<O;P++){const U=E[P],B=_(U),z=v%C,X=z%B.boundary,V=z+X;v+=X,V!==0&&C-V<B.storage&&(v+=C-V),I.__data=new Float32Array(B.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=v,v+=B.storage}}}const R=v%C;return R>0&&(v+=C-R),y.__size=v,y.__cache={},this}function _(y){const b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),b}function m(y){const b=y.target;b.removeEventListener("dispose",m);const v=o.indexOf(b.__bindingPointIndex);o.splice(v,1),r.deleteBuffer(i[b.id]),delete i[b.id],delete s[b.id]}function p(){for(const y in i)r.deleteBuffer(i[y]);o=[],i={},s={}}return{bind:c,update:l,dispose:p}}class d1{constructor(e={}){const{canvas:t=ix(),context:n=null,depth:i=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const y=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=In,this.toneMapping=sr,this.toneMappingExposure=1;const v=this;let C=!1,R=0,w=0,A=null,S=-1,x=null;const F=new xt,I=new xt;let E=null;const P=new et(0);let O=0,U=t.width,B=t.height,z=1,X=null,V=null;const N=new xt(0,0,U,B),q=new xt(0,0,U,B);let te=!1;const k=new mu;let H=!1,se=!1;const Y=new wt,ae=new wt,Me=new ie,Ae=new xt,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let he=!1;function Ve(){return A===null?z:1}let W=n;function He(D,J){return t.getContext(D,J)}try{const D={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:f,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ou}`),t.addEventListener("webglcontextlost",ye,!1),t.addEventListener("webglcontextrestored",Te,!1),t.addEventListener("webglcontextcreationerror",be,!1),W===null){const J="webgl2";if(W=He(J,D),W===null)throw He(J)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(D){throw console.error("THREE.WebGLRenderer: "+D.message),D}let Ie,Fe,ue,Ue,Ee,T,M,G,ee,ne,fe,_e,ge,Se,Oe,ve,Re,Ce,De,pe,Be,ke,it,j;function xe(){Ie=new yE(W),Ie.init(),ke=new i1(W,Ie),Fe=new dE(W,Ie,e,ke),ue=new e1(W,Ie),Fe.reverseDepthBuffer&&h&&ue.buffers.depth.setReversed(!0),Ue=new ME(W),Ee=new GM,T=new n1(W,Ie,ue,Ee,Fe,ke,Ue),M=new mE(v),G=new xE(v),ee=new Cx(W),it=new uE(W,ee),ne=new SE(W,ee,Ue,it),fe=new wE(W,ne,ee,Ue),De=new bE(W,Fe,T),ve=new pE(Ee),_e=new zM(v,M,G,Ie,Fe,it,ve),ge=new u1(v,Ee),Se=new HM,Oe=new YM(Ie),Ce=new fE(v,M,G,ue,fe,d,c),Re=new ZM(v,fe,Fe),j=new h1(W,Ue,Fe,ue),pe=new hE(W,Ie,Ue),Be=new EE(W,Ie,Ue),Ue.programs=_e.programs,v.capabilities=Fe,v.extensions=Ie,v.properties=Ee,v.renderLists=Se,v.shadowMap=Re,v.state=ue,v.info=Ue}xe();const re=new l1(v,W);this.xr=re,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){const D=Ie.get("WEBGL_lose_context");D&&D.loseContext()},this.forceContextRestore=function(){const D=Ie.get("WEBGL_lose_context");D&&D.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(D){D!==void 0&&(z=D,this.setSize(U,B,!1))},this.getSize=function(D){return D.set(U,B)},this.setSize=function(D,J,le=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=D,B=J,t.width=Math.floor(D*z),t.height=Math.floor(J*z),le===!0&&(t.style.width=D+"px",t.style.height=J+"px"),this.setViewport(0,0,D,J)},this.getDrawingBufferSize=function(D){return D.set(U*z,B*z).floor()},this.setDrawingBufferSize=function(D,J,le){U=D,B=J,z=le,t.width=Math.floor(D*le),t.height=Math.floor(J*le),this.setViewport(0,0,D,J)},this.getCurrentViewport=function(D){return D.copy(F)},this.getViewport=function(D){return D.copy(N)},this.setViewport=function(D,J,le,ce){D.isVector4?N.set(D.x,D.y,D.z,D.w):N.set(D,J,le,ce),ue.viewport(F.copy(N).multiplyScalar(z).round())},this.getScissor=function(D){return D.copy(q)},this.setScissor=function(D,J,le,ce){D.isVector4?q.set(D.x,D.y,D.z,D.w):q.set(D,J,le,ce),ue.scissor(I.copy(q).multiplyScalar(z).round())},this.getScissorTest=function(){return te},this.setScissorTest=function(D){ue.setScissorTest(te=D)},this.setOpaqueSort=function(D){X=D},this.setTransparentSort=function(D){V=D},this.getClearColor=function(D){return D.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(D=!0,J=!0,le=!0){let ce=0;if(D){let K=!1;if(A!==null){const Pe=A.texture.format;K=Pe===hu||Pe===uu||Pe===fu}if(K){const Pe=A.texture.type,de=Pe===ki||Pe===Fr||Pe===Eo||Pe===Cs||Pe===cu||Pe===lu,ze=Ce.getClearColor(),Xe=Ce.getClearAlpha(),Ye=ze.r,Qe=ze.g,We=ze.b;de?(g[0]=Ye,g[1]=Qe,g[2]=We,g[3]=Xe,W.clearBufferuiv(W.COLOR,0,g)):(_[0]=Ye,_[1]=Qe,_[2]=We,_[3]=Xe,W.clearBufferiv(W.COLOR,0,_))}else ce|=W.COLOR_BUFFER_BIT}J&&(ce|=W.DEPTH_BUFFER_BIT),le&&(ce|=W.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W.clear(ce)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ye,!1),t.removeEventListener("webglcontextrestored",Te,!1),t.removeEventListener("webglcontextcreationerror",be,!1),Se.dispose(),Oe.dispose(),Ee.dispose(),M.dispose(),G.dispose(),fe.dispose(),it.dispose(),j.dispose(),_e.dispose(),re.dispose(),re.removeEventListener("sessionstart",Ct),re.removeEventListener("sessionend",ln),Jt.stop()};function ye(D){D.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function Te(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const D=Ue.autoReset,J=Re.enabled,le=Re.autoUpdate,ce=Re.needsUpdate,K=Re.type;xe(),Ue.autoReset=D,Re.enabled=J,Re.autoUpdate=le,Re.needsUpdate=ce,Re.type=K}function be(D){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",D.statusMessage)}function Ge(D){const J=D.target;J.removeEventListener("dispose",Ge),Ze(J)}function Ze(D){je(D),Ee.remove(D)}function je(D){const J=Ee.get(D).programs;J!==void 0&&(J.forEach(function(le){_e.releaseProgram(le)}),D.isShaderMaterial&&_e.releaseShaderCache(D))}this.renderBufferDirect=function(D,J,le,ce,K,Pe){J===null&&(J=we);const de=K.isMesh&&K.matrixWorld.determinant()<0,ze=wc(D,J,le,ce,K);ue.setMaterial(ce,de);let Xe=le.index,Ye=1;if(ce.wireframe===!0){if(Xe=ne.getWireframeAttribute(le),Xe===void 0)return;Ye=2}const Qe=le.drawRange,We=le.attributes.position;let at=Qe.start*Ye,pt=(Qe.start+Qe.count)*Ye;Pe!==null&&(at=Math.max(at,Pe.start*Ye),pt=Math.min(pt,(Pe.start+Pe.count)*Ye)),Xe!==null?(at=Math.max(at,0),pt=Math.min(pt,Xe.count)):We!=null&&(at=Math.max(at,0),pt=Math.min(pt,We.count));const gt=pt-at;if(gt<0||gt===1/0)return;it.setup(K,ce,ze,le,Xe);let qt,lt=pe;if(Xe!==null&&(qt=ee.get(Xe),lt=Be,lt.setIndex(qt)),K.isMesh)ce.wireframe===!0?(ue.setLineWidth(ce.wireframeLinewidth*Ve()),lt.setMode(W.LINES)):lt.setMode(W.TRIANGLES);else if(K.isLine){let qe=ce.linewidth;qe===void 0&&(qe=1),ue.setLineWidth(qe*Ve()),K.isLineSegments?lt.setMode(W.LINES):K.isLineLoop?lt.setMode(W.LINE_LOOP):lt.setMode(W.LINE_STRIP)}else K.isPoints?lt.setMode(W.POINTS):K.isSprite&&lt.setMode(W.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)lt.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(Ie.get("WEBGL_multi_draw"))lt.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const qe=K._multiDrawStarts,wn=K._multiDrawCounts,ut=K._multiDrawCount,jt=Xe?ee.get(Xe).bytesPerElement:1,ci=Ee.get(ce).currentProgram.getUniforms();for(let Ut=0;Ut<ut;Ut++)ci.setValue(W,"_gl_DrawID",Ut),lt.render(qe[Ut]/jt,wn[Ut])}else if(K.isInstancedMesh)lt.renderInstances(at,gt,K.count);else if(le.isInstancedBufferGeometry){const qe=le._maxInstanceCount!==void 0?le._maxInstanceCount:1/0,wn=Math.min(le.instanceCount,qe);lt.renderInstances(at,gt,wn)}else lt.render(at,gt)};function $e(D,J,le){D.transparent===!0&&D.side===Zn&&D.forceSinglePass===!1?(D.side=En,D.needsUpdate=!0,On(D,J,le),D.side=or,D.needsUpdate=!0,On(D,J,le),D.side=Zn):On(D,J,le)}this.compile=function(D,J,le=null){le===null&&(le=D),p=Oe.get(le),p.init(J),b.push(p),le.traverseVisible(function(K){K.isLight&&K.layers.test(J.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),D!==le&&D.traverseVisible(function(K){K.isLight&&K.layers.test(J.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),p.setupLights();const ce=new Set;return D.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Pe=K.material;if(Pe)if(Array.isArray(Pe))for(let de=0;de<Pe.length;de++){const ze=Pe[de];$e(ze,le,K),ce.add(ze)}else $e(Pe,le,K),ce.add(Pe)}),b.pop(),p=null,ce},this.compileAsync=function(D,J,le=null){const ce=this.compile(D,J,le);return new Promise(K=>{function Pe(){if(ce.forEach(function(de){Ee.get(de).currentProgram.isReady()&&ce.delete(de)}),ce.size===0){K(D);return}setTimeout(Pe,10)}Ie.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let Et=null;function bt(D){Et&&Et(D)}function Ct(){Jt.stop()}function ln(){Jt.start()}const Jt=new sg;Jt.setAnimationLoop(bt),typeof self!="undefined"&&Jt.setContext(self),this.setAnimationLoop=function(D){Et=D,re.setAnimationLoop(D),D===null?Jt.stop():Jt.start()},re.addEventListener("sessionstart",Ct),re.addEventListener("sessionend",ln),this.render=function(D,J){if(J!==void 0&&J.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),J.parent===null&&J.matrixWorldAutoUpdate===!0&&J.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(J),J=re.getCamera()),D.isScene===!0&&D.onBeforeRender(v,D,J,A),p=Oe.get(D,b.length),p.init(J),b.push(p),ae.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),k.setFromProjectionMatrix(ae),se=this.localClippingEnabled,H=ve.init(this.clippingPlanes,se),m=Se.get(D,y.length),m.init(),y.push(m),re.enabled===!0&&re.isPresenting===!0){const Pe=v.xr.getDepthSensingMesh();Pe!==null&&bn(Pe,J,-1/0,v.sortObjects)}bn(D,J,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(X,V),he=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,he&&Ce.addToRenderList(m,D),this.info.render.frame++,H===!0&&ve.beginShadows();const le=p.state.shadowsArray;Re.render(le,D,J),H===!0&&ve.endShadows(),this.info.autoReset===!0&&this.info.reset();const ce=m.opaque,K=m.transmissive;if(p.setupLights(),J.isArrayCamera){const Pe=J.cameras;if(K.length>0)for(let de=0,ze=Pe.length;de<ze;de++){const Xe=Pe[de];ai(ce,K,D,Xe)}he&&Ce.render(D);for(let de=0,ze=Pe.length;de<ze;de++){const Xe=Pe[de];Vn(m,D,Xe,Xe.viewport)}}else K.length>0&&ai(ce,K,D,J),he&&Ce.render(D),Vn(m,D,J);A!==null&&(T.updateMultisampleRenderTarget(A),T.updateRenderTargetMipmap(A)),D.isScene===!0&&D.onAfterRender(v,D,J),it.resetDefaultState(),S=-1,x=null,b.pop(),b.length>0?(p=b[b.length-1],H===!0&&ve.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function bn(D,J,le,ce){if(D.visible===!1)return;if(D.layers.test(J.layers)){if(D.isGroup)le=D.renderOrder;else if(D.isLOD)D.autoUpdate===!0&&D.update(J);else if(D.isLight)p.pushLight(D),D.castShadow&&p.pushShadow(D);else if(D.isSprite){if(!D.frustumCulled||k.intersectsSprite(D)){ce&&Ae.setFromMatrixPosition(D.matrixWorld).applyMatrix4(ae);const de=fe.update(D),ze=D.material;ze.visible&&m.push(D,de,ze,le,Ae.z,null)}}else if((D.isMesh||D.isLine||D.isPoints)&&(!D.frustumCulled||k.intersectsObject(D))){const de=fe.update(D),ze=D.material;if(ce&&(D.boundingSphere!==void 0?(D.boundingSphere===null&&D.computeBoundingSphere(),Ae.copy(D.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ae.copy(de.boundingSphere.center)),Ae.applyMatrix4(D.matrixWorld).applyMatrix4(ae)),Array.isArray(ze)){const Xe=de.groups;for(let Ye=0,Qe=Xe.length;Ye<Qe;Ye++){const We=Xe[Ye],at=ze[We.materialIndex];at&&at.visible&&m.push(D,de,at,le,Ae.z,We)}}else ze.visible&&m.push(D,de,ze,le,Ae.z,null)}}const Pe=D.children;for(let de=0,ze=Pe.length;de<ze;de++)bn(Pe[de],J,le,ce)}function Vn(D,J,le,ce){const K=D.opaque,Pe=D.transmissive,de=D.transparent;p.setupLightsView(le),H===!0&&ve.setGlobalState(v.clippingPlanes,le),ce&&ue.viewport(F.copy(ce)),K.length>0&&fn(K,J,le),Pe.length>0&&fn(Pe,J,le),de.length>0&&fn(de,J,le),ue.buffers.depth.setTest(!0),ue.buffers.depth.setMask(!0),ue.buffers.color.setMask(!0),ue.setPolygonOffset(!1)}function ai(D,J,le,ce){if((le.isScene===!0?le.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[ce.id]===void 0&&(p.state.transmissionRenderTarget[ce.id]=new Nr(1,1,{generateMipmaps:!0,type:Ie.has("EXT_color_buffer_half_float")||Ie.has("EXT_color_buffer_float")?Go:ki,minFilter:Ar,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:dt.workingColorSpace}));const Pe=p.state.transmissionRenderTarget[ce.id],de=ce.viewport||F;Pe.setSize(de.z,de.w);const ze=v.getRenderTarget();v.setRenderTarget(Pe),v.getClearColor(P),O=v.getClearAlpha(),O<1&&v.setClearColor(16777215,.5),v.clear(),he&&Ce.render(le);const Xe=v.toneMapping;v.toneMapping=sr;const Ye=ce.viewport;if(ce.viewport!==void 0&&(ce.viewport=void 0),p.setupLightsView(ce),H===!0&&ve.setGlobalState(v.clippingPlanes,ce),fn(D,le,ce),T.updateMultisampleRenderTarget(Pe),T.updateRenderTargetMipmap(Pe),Ie.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let We=0,at=J.length;We<at;We++){const pt=J[We],gt=pt.object,qt=pt.geometry,lt=pt.material,qe=pt.group;if(lt.side===Zn&&gt.layers.test(ce.layers)){const wn=lt.side;lt.side=En,lt.needsUpdate=!0,zt(gt,le,ce,qt,lt,qe),lt.side=wn,lt.needsUpdate=!0,Qe=!0}}Qe===!0&&(T.updateMultisampleRenderTarget(Pe),T.updateRenderTargetMipmap(Pe))}v.setRenderTarget(ze),v.setClearColor(P,O),Ye!==void 0&&(ce.viewport=Ye),v.toneMapping=Xe}function fn(D,J,le){const ce=J.isScene===!0?J.overrideMaterial:null;for(let K=0,Pe=D.length;K<Pe;K++){const de=D[K],ze=de.object,Xe=de.geometry,Ye=ce===null?de.material:ce,Qe=de.group;ze.layers.test(le.layers)&&zt(ze,J,le,Xe,Ye,Qe)}}function zt(D,J,le,ce,K,Pe){D.onBeforeRender(v,J,le,ce,K,Pe),D.modelViewMatrix.multiplyMatrices(le.matrixWorldInverse,D.matrixWorld),D.normalMatrix.getNormalMatrix(D.modelViewMatrix),K.onBeforeRender(v,J,le,ce,D,Pe),K.transparent===!0&&K.side===Zn&&K.forceSinglePass===!1?(K.side=En,K.needsUpdate=!0,v.renderBufferDirect(le,J,ce,K,D,Pe),K.side=or,K.needsUpdate=!0,v.renderBufferDirect(le,J,ce,K,D,Pe),K.side=Zn):v.renderBufferDirect(le,J,ce,K,D,Pe),D.onAfterRender(v,J,le,ce,K,Pe)}function On(D,J,le){J.isScene!==!0&&(J=we);const ce=Ee.get(D),K=p.state.lights,Pe=p.state.shadowsArray,de=K.state.version,ze=_e.getParameters(D,K.state,Pe,J,le),Xe=_e.getProgramCacheKey(ze);let Ye=ce.programs;ce.environment=D.isMeshStandardMaterial?J.environment:null,ce.fog=J.fog,ce.envMap=(D.isMeshStandardMaterial?G:M).get(D.envMap||ce.environment),ce.envMapRotation=ce.environment!==null&&D.envMap===null?J.environmentRotation:D.envMapRotation,Ye===void 0&&(D.addEventListener("dispose",Ge),Ye=new Map,ce.programs=Ye);let Qe=Ye.get(Xe);if(Qe!==void 0){if(ce.currentProgram===Qe&&ce.lightsStateVersion===de)return Gr(D,ze),Qe}else ze.uniforms=_e.getUniforms(D),D.onBeforeCompile(ze,v),Qe=_e.acquireProgram(ze,Xe),Ye.set(Xe,Qe),ce.uniforms=ze.uniforms;const We=ce.uniforms;return(!D.isShaderMaterial&&!D.isRawShaderMaterial||D.clipping===!0)&&(We.clippingPlanes=ve.uniform),Gr(D,ze),ce.needsLights=Vr(D),ce.lightsStateVersion=de,ce.needsLights&&(We.ambientLightColor.value=K.state.ambient,We.lightProbe.value=K.state.probe,We.directionalLights.value=K.state.directional,We.directionalLightShadows.value=K.state.directionalShadow,We.spotLights.value=K.state.spot,We.spotLightShadows.value=K.state.spotShadow,We.rectAreaLights.value=K.state.rectArea,We.ltc_1.value=K.state.rectAreaLTC1,We.ltc_2.value=K.state.rectAreaLTC2,We.pointLights.value=K.state.point,We.pointLightShadows.value=K.state.pointShadow,We.hemisphereLights.value=K.state.hemi,We.directionalShadowMap.value=K.state.directionalShadowMap,We.directionalShadowMatrix.value=K.state.directionalShadowMatrix,We.spotShadowMap.value=K.state.spotShadowMap,We.spotLightMatrix.value=K.state.spotLightMatrix,We.spotLightMap.value=K.state.spotLightMap,We.pointShadowMap.value=K.state.pointShadowMap,We.pointShadowMatrix.value=K.state.pointShadowMatrix),ce.currentProgram=Qe,ce.uniformsList=null,Qe}function Vs(D){if(D.uniformsList===null){const J=D.currentProgram.getUniforms();D.uniformsList=Va.seqWithValue(J.seq,D.uniforms)}return D.uniformsList}function Gr(D,J){const le=Ee.get(D);le.outputColorSpace=J.outputColorSpace,le.batching=J.batching,le.batchingColor=J.batchingColor,le.instancing=J.instancing,le.instancingColor=J.instancingColor,le.instancingMorph=J.instancingMorph,le.skinning=J.skinning,le.morphTargets=J.morphTargets,le.morphNormals=J.morphNormals,le.morphColors=J.morphColors,le.morphTargetsCount=J.morphTargetsCount,le.numClippingPlanes=J.numClippingPlanes,le.numIntersection=J.numClipIntersection,le.vertexAlphas=J.vertexAlphas,le.vertexTangents=J.vertexTangents,le.toneMapping=J.toneMapping}function wc(D,J,le,ce,K){J.isScene!==!0&&(J=we),T.resetTextureUnits();const Pe=J.fog,de=ce.isMeshStandardMaterial?J.environment:null,ze=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ns,Xe=(ce.isMeshStandardMaterial?G:M).get(ce.envMap||de),Ye=ce.vertexColors===!0&&!!le.attributes.color&&le.attributes.color.itemSize===4,Qe=!!le.attributes.tangent&&(!!ce.normalMap||ce.anisotropy>0),We=!!le.morphAttributes.position,at=!!le.morphAttributes.normal,pt=!!le.morphAttributes.color;let gt=sr;ce.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(gt=v.toneMapping);const qt=le.morphAttributes.position||le.morphAttributes.normal||le.morphAttributes.color,lt=qt!==void 0?qt.length:0,qe=Ee.get(ce),wn=p.state.lights;if(H===!0&&(se===!0||D!==x)){const hn=D===x&&ce.id===S;ve.setState(ce,D,hn)}let ut=!1;ce.version===qe.__version?(qe.needsLights&&qe.lightsStateVersion!==wn.state.version||qe.outputColorSpace!==ze||K.isBatchedMesh&&qe.batching===!1||!K.isBatchedMesh&&qe.batching===!0||K.isBatchedMesh&&qe.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&qe.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&qe.instancing===!1||!K.isInstancedMesh&&qe.instancing===!0||K.isSkinnedMesh&&qe.skinning===!1||!K.isSkinnedMesh&&qe.skinning===!0||K.isInstancedMesh&&qe.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&qe.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&qe.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&qe.instancingMorph===!1&&K.morphTexture!==null||qe.envMap!==Xe||ce.fog===!0&&qe.fog!==Pe||qe.numClippingPlanes!==void 0&&(qe.numClippingPlanes!==ve.numPlanes||qe.numIntersection!==ve.numIntersection)||qe.vertexAlphas!==Ye||qe.vertexTangents!==Qe||qe.morphTargets!==We||qe.morphNormals!==at||qe.morphColors!==pt||qe.toneMapping!==gt||qe.morphTargetsCount!==lt)&&(ut=!0):(ut=!0,qe.__version=ce.version);let jt=qe.currentProgram;ut===!0&&(jt=On(ce,J,K));let ci=!1,Ut=!1,Si=!1;const yt=jt.getUniforms(),un=qe.uniforms;if(ue.useProgram(jt.program)&&(ci=!0,Ut=!0,Si=!0),ce.id!==S&&(S=ce.id,Ut=!0),ci||x!==D){ue.buffers.depth.getReversed()?(Y.copy(D.projectionMatrix),sx(Y),ox(Y),yt.setValue(W,"projectionMatrix",Y)):yt.setValue(W,"projectionMatrix",D.projectionMatrix),yt.setValue(W,"viewMatrix",D.matrixWorldInverse);const Tn=yt.map.cameraPosition;Tn!==void 0&&Tn.setValue(W,Me.setFromMatrixPosition(D.matrixWorld)),Fe.logarithmicDepthBuffer&&yt.setValue(W,"logDepthBufFC",2/(Math.log(D.far+1)/Math.LN2)),(ce.isMeshPhongMaterial||ce.isMeshToonMaterial||ce.isMeshLambertMaterial||ce.isMeshBasicMaterial||ce.isMeshStandardMaterial||ce.isShaderMaterial)&&yt.setValue(W,"isOrthographic",D.isOrthographicCamera===!0),x!==D&&(x=D,Ut=!0,Si=!0)}if(K.isSkinnedMesh){yt.setOptional(W,K,"bindMatrix"),yt.setOptional(W,K,"bindMatrixInverse");const hn=K.skeleton;hn&&(hn.boneTexture===null&&hn.computeBoneTexture(),yt.setValue(W,"boneTexture",hn.boneTexture,T))}K.isBatchedMesh&&(yt.setOptional(W,K,"batchingTexture"),yt.setValue(W,"batchingTexture",K._matricesTexture,T),yt.setOptional(W,K,"batchingIdTexture"),yt.setValue(W,"batchingIdTexture",K._indirectTexture,T),yt.setOptional(W,K,"batchingColorTexture"),K._colorsTexture!==null&&yt.setValue(W,"batchingColorTexture",K._colorsTexture,T));const Zt=le.morphAttributes;if((Zt.position!==void 0||Zt.normal!==void 0||Zt.color!==void 0)&&De.update(K,le,jt),(Ut||qe.receiveShadow!==K.receiveShadow)&&(qe.receiveShadow=K.receiveShadow,yt.setValue(W,"receiveShadow",K.receiveShadow)),ce.isMeshGouraudMaterial&&ce.envMap!==null&&(un.envMap.value=Xe,un.flipEnvMap.value=Xe.isCubeTexture&&Xe.isRenderTargetTexture===!1?-1:1),ce.isMeshStandardMaterial&&ce.envMap===null&&J.environment!==null&&(un.envMapIntensity.value=J.environmentIntensity),Ut&&(yt.setValue(W,"toneMappingExposure",v.toneMappingExposure),qe.needsLights&&$o(un,Si),Pe&&ce.fog===!0&&ge.refreshFogUniforms(un,Pe),ge.refreshMaterialUniforms(un,ce,z,B,p.state.transmissionRenderTarget[D.id]),Va.upload(W,Vs(qe),un,T)),ce.isShaderMaterial&&ce.uniformsNeedUpdate===!0&&(Va.upload(W,Vs(qe),un,T),ce.uniformsNeedUpdate=!1),ce.isSpriteMaterial&&yt.setValue(W,"center",K.center),yt.setValue(W,"modelViewMatrix",K.modelViewMatrix),yt.setValue(W,"normalMatrix",K.normalMatrix),yt.setValue(W,"modelMatrix",K.matrixWorld),ce.isShaderMaterial||ce.isRawShaderMaterial){const hn=ce.uniformsGroups;for(let Tn=0,dn=hn.length;Tn<dn;Tn++){const Hs=hn[Tn];j.update(Hs,jt),j.bind(Hs,jt)}}return jt}function $o(D,J){D.ambientLightColor.needsUpdate=J,D.lightProbe.needsUpdate=J,D.directionalLights.needsUpdate=J,D.directionalLightShadows.needsUpdate=J,D.pointLights.needsUpdate=J,D.pointLightShadows.needsUpdate=J,D.spotLights.needsUpdate=J,D.spotLightShadows.needsUpdate=J,D.rectAreaLights.needsUpdate=J,D.hemisphereLights.needsUpdate=J}function Vr(D){return D.isMeshLambertMaterial||D.isMeshToonMaterial||D.isMeshPhongMaterial||D.isMeshStandardMaterial||D.isShadowMaterial||D.isShaderMaterial&&D.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(D,J,le){Ee.get(D.texture).__webglTexture=J,Ee.get(D.depthTexture).__webglTexture=le;const ce=Ee.get(D);ce.__hasExternalTextures=!0,ce.__autoAllocateDepthBuffer=le===void 0,ce.__autoAllocateDepthBuffer||Ie.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ce.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(D,J){const le=Ee.get(D);le.__webglFramebuffer=J,le.__useDefaultFramebuffer=J===void 0},this.setRenderTarget=function(D,J=0,le=0){A=D,R=J,w=le;let ce=!0,K=null,Pe=!1,de=!1;if(D){const Xe=Ee.get(D);if(Xe.__useDefaultFramebuffer!==void 0)ue.bindFramebuffer(W.FRAMEBUFFER,null),ce=!1;else if(Xe.__webglFramebuffer===void 0)T.setupRenderTarget(D);else if(Xe.__hasExternalTextures)T.rebindTextures(D,Ee.get(D.texture).__webglTexture,Ee.get(D.depthTexture).__webglTexture);else if(D.depthBuffer){const We=D.depthTexture;if(Xe.__boundDepthTexture!==We){if(We!==null&&Ee.has(We)&&(D.width!==We.image.width||D.height!==We.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(D)}}const Ye=D.texture;(Ye.isData3DTexture||Ye.isDataArrayTexture||Ye.isCompressedArrayTexture)&&(de=!0);const Qe=Ee.get(D).__webglFramebuffer;D.isWebGLCubeRenderTarget?(Array.isArray(Qe[J])?K=Qe[J][le]:K=Qe[J],Pe=!0):D.samples>0&&T.useMultisampledRTT(D)===!1?K=Ee.get(D).__webglMultisampledFramebuffer:Array.isArray(Qe)?K=Qe[le]:K=Qe,F.copy(D.viewport),I.copy(D.scissor),E=D.scissorTest}else F.copy(N).multiplyScalar(z).floor(),I.copy(q).multiplyScalar(z).floor(),E=te;if(ue.bindFramebuffer(W.FRAMEBUFFER,K)&&ce&&ue.drawBuffers(D,K),ue.viewport(F),ue.scissor(I),ue.setScissorTest(E),Pe){const Xe=Ee.get(D.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_CUBE_MAP_POSITIVE_X+J,Xe.__webglTexture,le)}else if(de){const Xe=Ee.get(D.texture),Ye=J||0;W.framebufferTextureLayer(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,Xe.__webglTexture,le||0,Ye)}S=-1},this.readRenderTargetPixels=function(D,J,le,ce,K,Pe,de){if(!(D&&D.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=Ee.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&de!==void 0&&(ze=ze[de]),ze){ue.bindFramebuffer(W.FRAMEBUFFER,ze);try{const Xe=D.texture,Ye=Xe.format,Qe=Xe.type;if(!Fe.textureFormatReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Fe.textureTypeReadable(Qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}J>=0&&J<=D.width-ce&&le>=0&&le<=D.height-K&&W.readPixels(J,le,ce,K,ke.convert(Ye),ke.convert(Qe),Pe)}finally{const Xe=A!==null?Ee.get(A).__webglFramebuffer:null;ue.bindFramebuffer(W.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(D,J,le,ce,K,Pe,de){if(!(D&&D.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ze=Ee.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&de!==void 0&&(ze=ze[de]),ze){const Xe=D.texture,Ye=Xe.format,Qe=Xe.type;if(!Fe.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Fe.textureTypeReadable(Qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(J>=0&&J<=D.width-ce&&le>=0&&le<=D.height-K){ue.bindFramebuffer(W.FRAMEBUFFER,ze);const We=W.createBuffer();W.bindBuffer(W.PIXEL_PACK_BUFFER,We),W.bufferData(W.PIXEL_PACK_BUFFER,Pe.byteLength,W.STREAM_READ),W.readPixels(J,le,ce,K,ke.convert(Ye),ke.convert(Qe),0);const at=A!==null?Ee.get(A).__webglFramebuffer:null;ue.bindFramebuffer(W.FRAMEBUFFER,at);const pt=W.fenceSync(W.SYNC_GPU_COMMANDS_COMPLETE,0);return W.flush(),await rx(W,pt,4),W.bindBuffer(W.PIXEL_PACK_BUFFER,We),W.getBufferSubData(W.PIXEL_PACK_BUFFER,0,Pe),W.deleteBuffer(We),W.deleteSync(pt),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(D,J=null,le=0){D.isTexture!==!0&&(co("WebGLRenderer: copyFramebufferToTexture function signature has changed."),J=arguments[0]||null,D=arguments[1]);const ce=Math.pow(2,-le),K=Math.floor(D.image.width*ce),Pe=Math.floor(D.image.height*ce),de=J!==null?J.x:0,ze=J!==null?J.y:0;T.setTexture2D(D,0),W.copyTexSubImage2D(W.TEXTURE_2D,le,0,0,de,ze,K,Pe),ue.unbindTexture()},this.copyTextureToTexture=function(D,J,le=null,ce=null,K=0){D.isTexture!==!0&&(co("WebGLRenderer: copyTextureToTexture function signature has changed."),ce=arguments[0]||null,D=arguments[1],J=arguments[2],K=arguments[3]||0,le=null);let Pe,de,ze,Xe,Ye,Qe,We,at,pt;const gt=D.isCompressedTexture?D.mipmaps[K]:D.image;le!==null?(Pe=le.max.x-le.min.x,de=le.max.y-le.min.y,ze=le.isBox3?le.max.z-le.min.z:1,Xe=le.min.x,Ye=le.min.y,Qe=le.isBox3?le.min.z:0):(Pe=gt.width,de=gt.height,ze=gt.depth||1,Xe=0,Ye=0,Qe=0),ce!==null?(We=ce.x,at=ce.y,pt=ce.z):(We=0,at=0,pt=0);const qt=ke.convert(J.format),lt=ke.convert(J.type);let qe;J.isData3DTexture?(T.setTexture3D(J,0),qe=W.TEXTURE_3D):J.isDataArrayTexture||J.isCompressedArrayTexture?(T.setTexture2DArray(J,0),qe=W.TEXTURE_2D_ARRAY):(T.setTexture2D(J,0),qe=W.TEXTURE_2D),W.pixelStorei(W.UNPACK_FLIP_Y_WEBGL,J.flipY),W.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL,J.premultiplyAlpha),W.pixelStorei(W.UNPACK_ALIGNMENT,J.unpackAlignment);const wn=W.getParameter(W.UNPACK_ROW_LENGTH),ut=W.getParameter(W.UNPACK_IMAGE_HEIGHT),jt=W.getParameter(W.UNPACK_SKIP_PIXELS),ci=W.getParameter(W.UNPACK_SKIP_ROWS),Ut=W.getParameter(W.UNPACK_SKIP_IMAGES);W.pixelStorei(W.UNPACK_ROW_LENGTH,gt.width),W.pixelStorei(W.UNPACK_IMAGE_HEIGHT,gt.height),W.pixelStorei(W.UNPACK_SKIP_PIXELS,Xe),W.pixelStorei(W.UNPACK_SKIP_ROWS,Ye),W.pixelStorei(W.UNPACK_SKIP_IMAGES,Qe);const Si=D.isDataArrayTexture||D.isData3DTexture,yt=J.isDataArrayTexture||J.isData3DTexture;if(D.isRenderTargetTexture||D.isDepthTexture){const un=Ee.get(D),Zt=Ee.get(J),hn=Ee.get(un.__renderTarget),Tn=Ee.get(Zt.__renderTarget);ue.bindFramebuffer(W.READ_FRAMEBUFFER,hn.__webglFramebuffer),ue.bindFramebuffer(W.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer);for(let dn=0;dn<ze;dn++)Si&&W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Ee.get(D).__webglTexture,K,Qe+dn),D.isDepthTexture?(yt&&W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Ee.get(J).__webglTexture,K,pt+dn),W.blitFramebuffer(Xe,Ye,Pe,de,We,at,Pe,de,W.DEPTH_BUFFER_BIT,W.NEAREST)):yt?W.copyTexSubImage3D(qe,K,We,at,pt+dn,Xe,Ye,Pe,de):W.copyTexSubImage2D(qe,K,We,at,pt+dn,Xe,Ye,Pe,de);ue.bindFramebuffer(W.READ_FRAMEBUFFER,null),ue.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else yt?D.isDataTexture||D.isData3DTexture?W.texSubImage3D(qe,K,We,at,pt,Pe,de,ze,qt,lt,gt.data):J.isCompressedArrayTexture?W.compressedTexSubImage3D(qe,K,We,at,pt,Pe,de,ze,qt,gt.data):W.texSubImage3D(qe,K,We,at,pt,Pe,de,ze,qt,lt,gt):D.isDataTexture?W.texSubImage2D(W.TEXTURE_2D,K,We,at,Pe,de,qt,lt,gt.data):D.isCompressedTexture?W.compressedTexSubImage2D(W.TEXTURE_2D,K,We,at,gt.width,gt.height,qt,gt.data):W.texSubImage2D(W.TEXTURE_2D,K,We,at,Pe,de,qt,lt,gt);W.pixelStorei(W.UNPACK_ROW_LENGTH,wn),W.pixelStorei(W.UNPACK_IMAGE_HEIGHT,ut),W.pixelStorei(W.UNPACK_SKIP_PIXELS,jt),W.pixelStorei(W.UNPACK_SKIP_ROWS,ci),W.pixelStorei(W.UNPACK_SKIP_IMAGES,Ut),K===0&&J.generateMipmaps&&W.generateMipmap(qe),ue.unbindTexture()},this.copyTextureToTexture3D=function(D,J,le=null,ce=null,K=0){return D.isTexture!==!0&&(co("WebGLRenderer: copyTextureToTexture3D function signature has changed."),le=arguments[0]||null,ce=arguments[1]||null,D=arguments[2],J=arguments[3],K=arguments[4]||0),co('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(D,J,le,ce,K)},this.initRenderTarget=function(D){Ee.get(D).__webglFramebuffer===void 0&&T.setupRenderTarget(D)},this.initTexture=function(D){D.isCubeTexture?T.setTextureCube(D,0):D.isData3DTexture?T.setTexture3D(D,0):D.isDataArrayTexture||D.isCompressedArrayTexture?T.setTexture2DArray(D,0):T.setTexture2D(D,0),ue.unbindTexture()},this.resetState=function(){R=0,w=0,A=null,ue.reset(),it.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ii}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}}class _u{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new et(e),this.density=t}clone(){return new _u(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class p1 extends Xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xi,this.environmentIntensity=1,this.environmentRotation=new xi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class m1 extends Gn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}class dg extends Bs{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new et(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const vd=new wt,Nf=new du,Ca=new Wo,Da=new ie;class g1 extends Xt{constructor(e=new Nn,t=new dg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ca.copy(n.boundingSphere),Ca.applyMatrix4(i),Ca.radius+=s,e.ray.intersectsSphere(Ca)===!1)return;vd.copy(i).invert(),Nf.copy(e.ray).applyMatrix4(vd);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){const h=Math.max(0,o.start),d=Math.min(l.count,o.start+o.count);for(let g=h,_=d;g<_;g++){const m=l.getX(g);Da.fromBufferAttribute(u,m),xd(Da,m,c,i,e,t,this)}}else{const h=Math.max(0,o.start),d=Math.min(u.count,o.start+o.count);for(let g=h,_=d;g<_;g++)Da.fromBufferAttribute(u,g),xd(Da,g,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function xd(r,e,t,n,i,s,o){const a=Nf.distanceSqToPoint(r);if(a<t){const c=new ie;Nf.closestPointToPoint(r,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;s.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class vu extends Nn{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],o=[],a=[],c=[],l=new ie,f=new ot;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let u=0,h=3;u<=t;u++,h+=3){const d=n+u/t*i;l.x=e*Math.cos(d),l.y=e*Math.sin(d),o.push(l.x,l.y,l.z),a.push(0,0,1),f.x=(o[h]/e+1)/2,f.y=(o[h+1]/e+1)/2,c.push(f.x,f.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new sn(o,3)),this.setAttribute("normal",new sn(a,3)),this.setAttribute("uv",new sn(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vu(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class ic extends Nn{constructor(e=1,t=1,n=1,i=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};const l=this;i=Math.floor(i),s=Math.floor(s);const f=[],u=[],h=[],d=[];let g=0;const _=[],m=n/2;let p=0;y(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(f),this.setAttribute("position",new sn(u,3)),this.setAttribute("normal",new sn(h,3)),this.setAttribute("uv",new sn(d,2));function y(){const v=new ie,C=new ie;let R=0;const w=(t-e)/n;for(let A=0;A<=s;A++){const S=[],x=A/s,F=x*(t-e)+e;for(let I=0;I<=i;I++){const E=I/i,P=E*c+a,O=Math.sin(P),U=Math.cos(P);C.x=F*O,C.y=-x*n+m,C.z=F*U,u.push(C.x,C.y,C.z),v.set(O,w,U).normalize(),h.push(v.x,v.y,v.z),d.push(E,1-x),S.push(g++)}_.push(S)}for(let A=0;A<i;A++)for(let S=0;S<s;S++){const x=_[S][A],F=_[S+1][A],I=_[S+1][A+1],E=_[S][A+1];(e>0||S!==0)&&(f.push(x,F,E),R+=3),(t>0||S!==s-1)&&(f.push(F,I,E),R+=3)}l.addGroup(p,R,0),p+=R}function b(v){const C=g,R=new ot,w=new ie;let A=0;const S=v===!0?e:t,x=v===!0?1:-1;for(let I=1;I<=i;I++)u.push(0,m*x,0),h.push(0,x,0),d.push(.5,.5),g++;const F=g;for(let I=0;I<=i;I++){const P=I/i*c+a,O=Math.cos(P),U=Math.sin(P);w.x=S*U,w.y=m*x,w.z=S*O,u.push(w.x,w.y,w.z),h.push(0,x,0),R.x=O*.5+.5,R.y=U*.5*x+.5,d.push(R.x,R.y),g++}for(let I=0;I<i;I++){const E=C+I,P=F+I;v===!0?f.push(P,P+1,E):f.push(P+1,P,E),A+=3}l.addGroup(p,A,v===!0?1:2),p+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ic(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class xu extends Nn{constructor(e=.5,t=1,n=32,i=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);const a=[],c=[],l=[],f=[];let u=e;const h=(t-e)/i,d=new ie,g=new ot;for(let _=0;_<=i;_++){for(let m=0;m<=n;m++){const p=s+m/n*o;d.x=u*Math.cos(p),d.y=u*Math.sin(p),c.push(d.x,d.y,d.z),l.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,f.push(g.x,g.y)}u+=h}for(let _=0;_<i;_++){const m=_*(n+1);for(let p=0;p<n;p++){const y=p+m,b=y,v=y+n+1,C=y+n+2,R=y+1;a.push(b,v,R),a.push(v,C,R)}}this.setIndex(a),this.setAttribute("position",new sn(c,3)),this.setAttribute("normal",new sn(l,3)),this.setAttribute("uv",new sn(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xu(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Pa extends Bs{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new et(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jm,this.normalScale=new ot(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class yu extends Xt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new et(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class _1 extends yu{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Xt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new et(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const wl=new wt,yd=new ie,Sd=new ie;class pg{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ot(512,512),this.map=null,this.mapPass=null,this.matrix=new wt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new mu,this._frameExtents=new ot(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;yd.setFromMatrixPosition(e.matrixWorld),t.position.copy(yd),Sd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Sd),t.updateMatrixWorld(),wl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class v1 extends pg{constructor(){super(new xn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=tc*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Ed extends yu{constructor(e,t,n=0,i=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Xt.DEFAULT_UP),this.updateMatrix(),this.target=new Xt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new v1}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Md=new wt,so=new ie,Tl=new ie;class x1 extends pg{constructor(){super(new xn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ot(4,2),this._viewportCount=6,this._viewports=[new xt(2,1,1,1),new xt(0,1,1,1),new xt(3,1,1,1),new xt(1,1,1,1),new xt(3,0,1,1),new xt(1,0,1,1)],this._cubeDirections=[new ie(1,0,0),new ie(-1,0,0),new ie(0,0,1),new ie(0,0,-1),new ie(0,1,0),new ie(0,-1,0)],this._cubeUps=[new ie(0,1,0),new ie(0,1,0),new ie(0,1,0),new ie(0,1,0),new ie(0,0,1),new ie(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),so.setFromMatrixPosition(e.matrixWorld),n.position.copy(so),Tl.copy(n.position),Tl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Tl),n.updateMatrixWorld(),i.makeTranslation(-so.x,-so.y,-so.z),Md.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Md)}}class y1 extends yu{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new x1}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class S1 extends Nn{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class E1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=bd(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=bd();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function bd(){return performance.now()}const wd=new wt;class M1{constructor(e,t,n=0,i=1/0){this.ray=new du(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new pu,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return wd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(wd),this}intersectObject(e,t=!0,n=[]){return Of(e,this,n,t),n.sort(Td),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)Of(e[i],this,n,t);return n.sort(Td),n}}function Td(r,e){return r.distance-e.distance}function Of(r,e,t,n){let i=!0;if(r.layers.test(e.layers)&&r.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const s=r.children;for(let o=0,a=s.length;o<a;o++)Of(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ou}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ou);function b1(){var r=Object.create(null);function e(i,s){var o=i.id,a=i.name,c=i.dependencies;c===void 0&&(c=[]);var l=i.init;l===void 0&&(l=function(){});var f=i.getTransferables;if(f===void 0&&(f=null),!r[o])try{c=c.map(function(h){return h&&h.isWorkerModule&&(e(h,function(d){if(d instanceof Error)throw d}),h=r[h.id].value),h}),l=n("<"+a+">.init",l),f&&(f=n("<"+a+">.getTransferables",f));var u=null;typeof l=="function"?u=l.apply(void 0,c):console.error("worker module init function failed to rehydrate"),r[o]={id:o,value:u,getTransferables:f},s(u)}catch(h){h&&h.noLog||console.error(h),s(h)}}function t(i,s){var o,a=i.id,c=i.args;(!r[a]||typeof r[a].value!="function")&&s(new Error("Worker module "+a+": not found or its 'init' did not return a function"));try{var l=(o=r[a]).value.apply(o,c);l&&typeof l.then=="function"?l.then(f,function(u){return s(u instanceof Error?u:new Error(""+u))}):f(l)}catch(u){s(u)}function f(u){try{var h=r[a].getTransferables&&r[a].getTransferables(u);(!h||!Array.isArray(h)||!h.length)&&(h=void 0),s(u,h)}catch(d){console.error(d),s(d)}}}function n(i,s){var o=void 0;self.troikaDefine=function(c){return o=c};var a=URL.createObjectURL(new Blob(["/** "+i.replace(/\*/g,"")+` **/

troikaDefine(
`+s+`
)`],{type:"application/javascript"}));try{importScripts(a)}catch(c){console.error(c)}return URL.revokeObjectURL(a),delete self.troikaDefine,o}self.addEventListener("message",function(i){var s=i.data,o=s.messageId,a=s.action,c=s.data;try{a==="registerModule"&&e(c,function(l){l instanceof Error?postMessage({messageId:o,success:!1,error:l.message}):postMessage({messageId:o,success:!0,result:{isCallable:typeof l=="function"}})}),a==="callModule"&&t(c,function(l,f){l instanceof Error?postMessage({messageId:o,success:!1,error:l.message}):postMessage({messageId:o,success:!0,result:l},f||void 0)})}catch(l){postMessage({messageId:o,success:!1,error:l.stack})}})}function w1(r){var e=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e._getInitResult().then(function(i){if(typeof i=="function")return i.apply(void 0,t);throw new Error("Worker module function was called but `init` did not return a callable function")})};return e._getInitResult=function(){var t=r.dependencies,n=r.init;t=Array.isArray(t)?t.map(function(s){return s&&(s=s.onMainThread||s,s._getInitResult&&(s=s._getInitResult())),s}):[];var i=Promise.all(t).then(function(s){return n.apply(null,s)});return e._getInitResult=function(){return i},i},e}var mg=function(){var r=!1;if(typeof window!="undefined"&&typeof window.document!="undefined")try{var e=new Worker(URL.createObjectURL(new Blob([""],{type:"application/javascript"})));e.terminate(),r=!0}catch(t){console.log("Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: ["+t.message+"]")}return mg=function(){return r},r},T1=0,A1=0,Al=!1,go=Object.create(null),_o=Object.create(null),Bf=Object.create(null);function zs(r){if((!r||typeof r.init!="function")&&!Al)throw new Error("requires `options.init` function");var e=r.dependencies,t=r.init,n=r.getTransferables,i=r.workerId,s=w1(r);i==null&&(i="#default");var o="workerModule"+ ++T1,a=r.name||o,c=null;e=e&&e.map(function(f){return typeof f=="function"&&!f.workerModuleData&&(Al=!0,f=zs({workerId:i,name:"<"+a+"> function dependency: "+f.name,init:`function(){return (
`+Ha(f)+`
)}`}),Al=!1),f&&f.workerModuleData&&(f=f.workerModuleData),f});function l(){for(var f=[],u=arguments.length;u--;)f[u]=arguments[u];if(!mg())return s.apply(void 0,f);if(!c){c=Ad(i,"registerModule",l.workerModuleData);var h=function(){c=null,_o[i].delete(h)};(_o[i]||(_o[i]=new Set)).add(h)}return c.then(function(d){var g=d.isCallable;if(g)return Ad(i,"callModule",{id:o,args:f});throw new Error("Worker module function was called but `init` did not return a callable function")})}return l.workerModuleData={isWorkerModule:!0,id:o,name:a,dependencies:e,init:Ha(t),getTransferables:n&&Ha(n)},l.onMainThread=s,l}function R1(r){_o[r]&&_o[r].forEach(function(e){e()}),go[r]&&(go[r].terminate(),delete go[r])}function Ha(r){var e=r.toString();return!/^function/.test(e)&&/^\w+\s*\(/.test(e)&&(e="function "+e),e}function C1(r){var e=go[r];if(!e){var t=Ha(b1);e=go[r]=new Worker(URL.createObjectURL(new Blob(["/** Worker Module Bootstrap: "+r.replace(/\*/g,"")+` **/

;(`+t+")()"],{type:"application/javascript"}))),e.onmessage=function(n){var i=n.data,s=i.messageId,o=Bf[s];if(!o)throw new Error("WorkerModule response with empty or unknown messageId");delete Bf[s],o(i)}}return e}function Ad(r,e,t){return new Promise(function(n,i){var s=++A1;Bf[s]=function(o){o.success?n(o.result):i(new Error("Error in worker "+e+" call: "+o.error))},C1(r).postMessage({messageId:s,action:e,data:t})})}function gg(){var r=function(e){function t(X,V,N,q,te,k,H,se){var Y=1-H;se.x=Y*Y*X+2*Y*H*N+H*H*te,se.y=Y*Y*V+2*Y*H*q+H*H*k}function n(X,V,N,q,te,k,H,se,Y,ae){var Me=1-Y;ae.x=Me*Me*Me*X+3*Me*Me*Y*N+3*Me*Y*Y*te+Y*Y*Y*H,ae.y=Me*Me*Me*V+3*Me*Me*Y*q+3*Me*Y*Y*k+Y*Y*Y*se}function i(X,V){for(var N=/([MLQCZ])([^MLQCZ]*)/g,q,te,k,H,se;q=N.exec(X);){var Y=q[2].replace(/^\s*|\s*$/g,"").split(/[,\s]+/).map(function(ae){return parseFloat(ae)});switch(q[1]){case"M":H=te=Y[0],se=k=Y[1];break;case"L":(Y[0]!==H||Y[1]!==se)&&V("L",H,se,H=Y[0],se=Y[1]);break;case"Q":{V("Q",H,se,H=Y[2],se=Y[3],Y[0],Y[1]);break}case"C":{V("C",H,se,H=Y[4],se=Y[5],Y[0],Y[1],Y[2],Y[3]);break}case"Z":(H!==te||se!==k)&&V("L",H,se,te,k);break}}}function s(X,V,N){N===void 0&&(N=16);var q={x:0,y:0};i(X,function(te,k,H,se,Y,ae,Me,Ae,we){switch(te){case"L":V(k,H,se,Y);break;case"Q":{for(var he=k,Ve=H,W=1;W<N;W++)t(k,H,ae,Me,se,Y,W/(N-1),q),V(he,Ve,q.x,q.y),he=q.x,Ve=q.y;break}case"C":{for(var He=k,Ie=H,Fe=1;Fe<N;Fe++)n(k,H,ae,Me,Ae,we,se,Y,Fe/(N-1),q),V(He,Ie,q.x,q.y),He=q.x,Ie=q.y;break}}})}var o="precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}",a="precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}",c=new WeakMap,l={premultipliedAlpha:!1,preserveDrawingBuffer:!0,antialias:!1,depth:!1};function f(X,V){var N=X.getContext?X.getContext("webgl",l):X,q=c.get(N);if(!q){let He=function(T){var M=k[T];if(!M&&(M=k[T]=N.getExtension(T),!M))throw new Error(T+" not supported");return M},Ie=function(T,M){var G=N.createShader(M);return N.shaderSource(G,T),N.compileShader(G),G},Fe=function(T,M,G,ee){if(!H[T]){var ne={},fe={},_e=N.createProgram();N.attachShader(_e,Ie(M,N.VERTEX_SHADER)),N.attachShader(_e,Ie(G,N.FRAGMENT_SHADER)),N.linkProgram(_e),H[T]={program:_e,transaction:function(Se){N.useProgram(_e),Se({setUniform:function(ve,Re){for(var Ce=[],De=arguments.length-2;De-- >0;)Ce[De]=arguments[De+2];var pe=fe[Re]||(fe[Re]=N.getUniformLocation(_e,Re));N["uniform"+ve].apply(N,[pe].concat(Ce))},setAttribute:function(ve,Re,Ce,De,pe){var Be=ne[ve];Be||(Be=ne[ve]={buf:N.createBuffer(),loc:N.getAttribLocation(_e,ve),data:null}),N.bindBuffer(N.ARRAY_BUFFER,Be.buf),N.vertexAttribPointer(Be.loc,Re,N.FLOAT,!1,0,0),N.enableVertexAttribArray(Be.loc),te?N.vertexAttribDivisor(Be.loc,De):He("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(Be.loc,De),pe!==Be.data&&(N.bufferData(N.ARRAY_BUFFER,pe,Ce),Be.data=pe)}})}}}H[T].transaction(ee)},ue=function(T,M){Y++;try{N.activeTexture(N.TEXTURE0+Y);var G=se[T];G||(G=se[T]=N.createTexture(),N.bindTexture(N.TEXTURE_2D,G),N.texParameteri(N.TEXTURE_2D,N.TEXTURE_MIN_FILTER,N.NEAREST),N.texParameteri(N.TEXTURE_2D,N.TEXTURE_MAG_FILTER,N.NEAREST)),N.bindTexture(N.TEXTURE_2D,G),M(G,Y)}finally{Y--}},Ue=function(T,M,G){var ee=N.createFramebuffer();ae.push(ee),N.bindFramebuffer(N.FRAMEBUFFER,ee),N.activeTexture(N.TEXTURE0+M),N.bindTexture(N.TEXTURE_2D,T),N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,T,0);try{G(ee)}finally{N.deleteFramebuffer(ee),N.bindFramebuffer(N.FRAMEBUFFER,ae[--ae.length-1]||null)}},Ee=function(){k={},H={},se={},Y=-1,ae.length=0};var Me=He,Ae=Ie,we=Fe,he=ue,Ve=Ue,W=Ee,te=typeof WebGL2RenderingContext!="undefined"&&N instanceof WebGL2RenderingContext,k={},H={},se={},Y=-1,ae=[];N.canvas.addEventListener("webglcontextlost",function(T){Ee(),T.preventDefault()},!1),c.set(N,q={gl:N,isWebGL2:te,getExtension:He,withProgram:Fe,withTexture:ue,withTextureFramebuffer:Ue,handleContextLoss:Ee})}V(q)}function u(X,V,N,q,te,k,H,se){H===void 0&&(H=15),se===void 0&&(se=null),f(X,function(Y){var ae=Y.gl,Me=Y.withProgram,Ae=Y.withTexture;Ae("copy",function(we,he){ae.texImage2D(ae.TEXTURE_2D,0,ae.RGBA,te,k,0,ae.RGBA,ae.UNSIGNED_BYTE,V),Me("copy",o,a,function(Ve){var W=Ve.setUniform,He=Ve.setAttribute;He("aUV",2,ae.STATIC_DRAW,0,new Float32Array([0,0,2,0,0,2])),W("1i","image",he),ae.bindFramebuffer(ae.FRAMEBUFFER,se||null),ae.disable(ae.BLEND),ae.colorMask(H&8,H&4,H&2,H&1),ae.viewport(N,q,te,k),ae.scissor(N,q,te,k),ae.drawArrays(ae.TRIANGLES,0,3)})})})}function h(X,V,N){var q=X.width,te=X.height;f(X,function(k){var H=k.gl,se=new Uint8Array(q*te*4);H.readPixels(0,0,q,te,H.RGBA,H.UNSIGNED_BYTE,se),X.width=V,X.height=N,u(H,se,0,0,q,te)})}var d=Object.freeze({__proto__:null,withWebGLContext:f,renderImageData:u,resizeWebGLCanvasWithoutClearing:h});function g(X,V,N,q,te,k){k===void 0&&(k=1);var H=new Uint8Array(X*V),se=q[2]-q[0],Y=q[3]-q[1],ae=[];s(N,function(He,Ie,Fe,ue){ae.push({x1:He,y1:Ie,x2:Fe,y2:ue,minX:Math.min(He,Fe),minY:Math.min(Ie,ue),maxX:Math.max(He,Fe),maxY:Math.max(Ie,ue)})}),ae.sort(function(He,Ie){return He.maxX-Ie.maxX});for(var Me=0;Me<X;Me++)for(var Ae=0;Ae<V;Ae++){var we=Ve(q[0]+se*(Me+.5)/X,q[1]+Y*(Ae+.5)/V),he=Math.pow(1-Math.abs(we)/te,k)/2;we<0&&(he=1-he),he=Math.max(0,Math.min(255,Math.round(he*255))),H[Ae*X+Me]=he}return H;function Ve(He,Ie){for(var Fe=1/0,ue=1/0,Ue=ae.length;Ue--;){var Ee=ae[Ue];if(Ee.maxX+ue<=He)break;if(He+ue>Ee.minX&&Ie-ue<Ee.maxY&&Ie+ue>Ee.minY){var T=p(He,Ie,Ee.x1,Ee.y1,Ee.x2,Ee.y2);T<Fe&&(Fe=T,ue=Math.sqrt(Fe))}}return W(He,Ie)&&(ue=-ue),ue}function W(He,Ie){for(var Fe=0,ue=ae.length;ue--;){var Ue=ae[ue];if(Ue.maxX<=He)break;var Ee=Ue.y1>Ie!=Ue.y2>Ie&&He<(Ue.x2-Ue.x1)*(Ie-Ue.y1)/(Ue.y2-Ue.y1)+Ue.x1;Ee&&(Fe+=Ue.y1<Ue.y2?1:-1)}return Fe!==0}}function _(X,V,N,q,te,k,H,se,Y,ae){k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0),m(X,V,N,q,te,k,H,null,se,Y,ae)}function m(X,V,N,q,te,k,H,se,Y,ae,Me){k===void 0&&(k=1),Y===void 0&&(Y=0),ae===void 0&&(ae=0),Me===void 0&&(Me=0);for(var Ae=g(X,V,N,q,te,k),we=new Uint8Array(Ae.length*4),he=0;he<Ae.length;he++)we[he*4+Me]=Ae[he];u(H,we,Y,ae,X,V,1<<3-Me,se)}function p(X,V,N,q,te,k){var H=te-N,se=k-q,Y=H*H+se*se,ae=Y?Math.max(0,Math.min(1,((X-N)*H+(V-q)*se)/Y)):0,Me=X-(N+ae*H),Ae=V-(q+ae*se);return Me*Me+Ae*Ae}var y=Object.freeze({__proto__:null,generate:g,generateIntoCanvas:_,generateIntoFramebuffer:m}),b="precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}",v="precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}",C="precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}",R=new Float32Array([0,0,2,0,0,2]),w=null,A=!1,S={},x=new WeakMap;function F(X){if(!A&&!O(X))throw new Error("WebGL generation not supported")}function I(X,V,N,q,te,k,H){if(k===void 0&&(k=1),H===void 0&&(H=null),!H&&(H=w,!H)){var se=typeof OffscreenCanvas=="function"?new OffscreenCanvas(1,1):typeof document!="undefined"?document.createElement("canvas"):null;if(!se)throw new Error("OffscreenCanvas or DOM canvas not supported");H=w=se.getContext("webgl",{depth:!1})}F(H);var Y=new Uint8Array(X*V*4);f(H,function(we){var he=we.gl,Ve=we.withTexture,W=we.withTextureFramebuffer;Ve("readable",function(He,Ie){he.texImage2D(he.TEXTURE_2D,0,he.RGBA,X,V,0,he.RGBA,he.UNSIGNED_BYTE,null),W(He,Ie,function(Fe){P(X,V,N,q,te,k,he,Fe,0,0,0),he.readPixels(0,0,X,V,he.RGBA,he.UNSIGNED_BYTE,Y)})})});for(var ae=new Uint8Array(X*V),Me=0,Ae=0;Me<Y.length;Me+=4)ae[Ae++]=Y[Me];return ae}function E(X,V,N,q,te,k,H,se,Y,ae){k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0),P(X,V,N,q,te,k,H,null,se,Y,ae)}function P(X,V,N,q,te,k,H,se,Y,ae,Me){k===void 0&&(k=1),Y===void 0&&(Y=0),ae===void 0&&(ae=0),Me===void 0&&(Me=0),F(H);var Ae=[];s(N,function(we,he,Ve,W){Ae.push(we,he,Ve,W)}),Ae=new Float32Array(Ae),f(H,function(we){var he=we.gl,Ve=we.isWebGL2,W=we.getExtension,He=we.withProgram,Ie=we.withTexture,Fe=we.withTextureFramebuffer,ue=we.handleContextLoss;if(Ie("rawDistances",function(Ue,Ee){(X!==Ue._lastWidth||V!==Ue._lastHeight)&&he.texImage2D(he.TEXTURE_2D,0,he.RGBA,Ue._lastWidth=X,Ue._lastHeight=V,0,he.RGBA,he.UNSIGNED_BYTE,null),He("main",b,v,function(T){var M=T.setAttribute,G=T.setUniform,ee=!Ve&&W("ANGLE_instanced_arrays"),ne=!Ve&&W("EXT_blend_minmax");M("aUV",2,he.STATIC_DRAW,0,R),M("aLineSegment",4,he.DYNAMIC_DRAW,1,Ae),G.apply(void 0,["4f","uGlyphBounds"].concat(q)),G("1f","uMaxDistance",te),G("1f","uExponent",k),Fe(Ue,Ee,function(fe){he.enable(he.BLEND),he.colorMask(!0,!0,!0,!0),he.viewport(0,0,X,V),he.scissor(0,0,X,V),he.blendFunc(he.ONE,he.ONE),he.blendEquationSeparate(he.FUNC_ADD,Ve?he.MAX:ne.MAX_EXT),he.clear(he.COLOR_BUFFER_BIT),Ve?he.drawArraysInstanced(he.TRIANGLES,0,3,Ae.length/4):ee.drawArraysInstancedANGLE(he.TRIANGLES,0,3,Ae.length/4)})}),He("post",o,C,function(T){T.setAttribute("aUV",2,he.STATIC_DRAW,0,R),T.setUniform("1i","tex",Ee),he.bindFramebuffer(he.FRAMEBUFFER,se),he.disable(he.BLEND),he.colorMask(Me===0,Me===1,Me===2,Me===3),he.viewport(Y,ae,X,V),he.scissor(Y,ae,X,V),he.drawArrays(he.TRIANGLES,0,3)})}),he.isContextLost())throw ue(),new Error("webgl context lost")})}function O(X){var V=!X||X===w?S:X.canvas||X,N=x.get(V);if(N===void 0){A=!0;var q=null;try{var te=[97,106,97,61,99,137,118,80,80,118,137,99,61,97,106,97],k=I(4,4,"M8,8L16,8L24,24L16,24Z",[0,0,32,32],24,1,X);N=k&&te.length===k.length&&k.every(function(H,se){return H===te[se]}),N||(q="bad trial run results",console.info(te,k))}catch(H){N=!1,q=H.message}q&&console.warn("WebGL SDF generation not supported:",q),A=!1,x.set(V,N)}return N}var U=Object.freeze({__proto__:null,generate:I,generateIntoCanvas:E,generateIntoFramebuffer:P,isSupported:O});function B(X,V,N,q,te,k){te===void 0&&(te=Math.max(q[2]-q[0],q[3]-q[1])/2),k===void 0&&(k=1);try{return I.apply(U,arguments)}catch(H){return console.info("WebGL SDF generation failed, falling back to JS",H),g.apply(y,arguments)}}function z(X,V,N,q,te,k,H,se,Y,ae){te===void 0&&(te=Math.max(q[2]-q[0],q[3]-q[1])/2),k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0);try{return E.apply(U,arguments)}catch(Me){return console.info("WebGL SDF generation failed, falling back to JS",Me),_.apply(y,arguments)}}return e.forEachPathCommand=i,e.generate=B,e.generateIntoCanvas=z,e.javascript=y,e.pathToLineSegments=s,e.webgl=U,e.webglUtils=d,Object.defineProperty(e,"__esModule",{value:!0}),e}({});return r}function D1(){var r=function(e){var t={R:"13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",EN:"1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",ES:"17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",ET:"z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",AN:"16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",CS:"18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",B:"a,3,f+2,2v,690",S:"9,2,k",WS:"c,k,4f4,1vk+a,u,1j,335",ON:"x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",BN:"0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",NSM:"lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",AL:"16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",LRO:"6ct",RLO:"6cu",LRE:"6cq",RLE:"6cr",PDF:"6cs",LRI:"6ee",RLI:"6ef",FSI:"6eg",PDI:"6eh"},n={},i={};n.L=1,i[1]="L",Object.keys(t).forEach(function(ue,Ue){n[ue]=1<<Ue+1,i[n[ue]]=ue}),Object.freeze(n);var s=n.LRI|n.RLI|n.FSI,o=n.L|n.R|n.AL,a=n.B|n.S|n.WS|n.ON|n.FSI|n.LRI|n.RLI|n.PDI,c=n.BN|n.RLE|n.LRE|n.RLO|n.LRO|n.PDF,l=n.S|n.WS|n.B|s|n.PDI|c,f=null;function u(){if(!f){f=new Map;var ue=0;for(var Ue in t)if(t.hasOwnProperty(Ue))for(var Ee=t[Ue],T="",M=void 0,G=!1,ee=0,ne=0;ne<=Ee.length+1;ne+=1){var fe=Ee[ne];if(fe!==","&&ne!==Ee.length)fe==="+"?(G=!0,ee=ue=ee+parseInt(T,36),T=""):T+=fe;else{G?M=ue+parseInt(T,36):(ee=ue=ee+parseInt(T,36),M=ue),G=!1,T="",ee=M;for(var _e=ue;_e<M+1;_e+=1)f.set(_e,n[Ue])}}}}function h(ue){return u(),f.get(ue.codePointAt(0))||n.L}function d(ue){return i[h(ue)]}var g={pairs:"14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",canonical:"6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye"};function _(ue,Ue){var Ee=36,T=0,M=new Map,G=Ue&&new Map,ee;return ue.split(",").forEach(function ne(fe){if(fe.indexOf("+")!==-1)for(var _e=+fe;_e--;)ne(ee);else{ee=fe;var ge=fe.split(">"),Se=ge[0],Oe=ge[1];Se=String.fromCodePoint(T+=parseInt(Se,Ee)),Oe=String.fromCodePoint(T+=parseInt(Oe,Ee)),M.set(Se,Oe),Ue&&G.set(Oe,Se)}}),{map:M,reverseMap:G}}var m,p,y;function b(){if(!m){var ue=_(g.pairs,!0),Ue=ue.map,Ee=ue.reverseMap;m=Ue,p=Ee,y=_(g.canonical,!1).map}}function v(ue){return b(),m.get(ue)||null}function C(ue){return b(),p.get(ue)||null}function R(ue){return b(),y.get(ue)||null}var w=n.L,A=n.R,S=n.EN,x=n.ES,F=n.ET,I=n.AN,E=n.CS,P=n.B,O=n.S,U=n.ON,B=n.BN,z=n.NSM,X=n.AL,V=n.LRO,N=n.RLO,q=n.LRE,te=n.RLE,k=n.PDF,H=n.LRI,se=n.RLI,Y=n.FSI,ae=n.PDI;function Me(ue,Ue){for(var Ee=125,T=new Uint32Array(ue.length),M=0;M<ue.length;M++)T[M]=h(ue[M]);var G=new Map;function ee(pn,Wn){var mn=T[pn];T[pn]=Wn,G.set(mn,G.get(mn)-1),mn&a&&G.set(a,G.get(a)-1),G.set(Wn,(G.get(Wn)||0)+1),Wn&a&&G.set(a,(G.get(a)||0)+1)}for(var ne=new Uint8Array(ue.length),fe=new Map,_e=[],ge=null,Se=0;Se<ue.length;Se++)ge||_e.push(ge={start:Se,end:ue.length-1,level:Ue==="rtl"?1:Ue==="ltr"?0:Nu(Se,!1)}),T[Se]&P&&(ge.end=Se,ge=null);for(var Oe=te|q|N|V|s|ae|k|P,ve=function(pn){return pn+(pn&1?1:2)},Re=function(pn){return pn+(pn&1?2:1)},Ce=0;Ce<_e.length;Ce++){ge=_e[Ce];var De=[{_level:ge.level,_override:0,_isolate:0}],pe=void 0,Be=0,ke=0,it=0;G.clear();for(var j=ge.start;j<=ge.end;j++){var xe=T[j];if(pe=De[De.length-1],G.set(xe,(G.get(xe)||0)+1),xe&a&&G.set(a,(G.get(a)||0)+1),xe&Oe)if(xe&(te|q)){ne[j]=pe._level;var re=(xe===te?Re:ve)(pe._level);re<=Ee&&!Be&&!ke?De.push({_level:re,_override:0,_isolate:0}):Be||ke++}else if(xe&(N|V)){ne[j]=pe._level;var ye=(xe===N?Re:ve)(pe._level);ye<=Ee&&!Be&&!ke?De.push({_level:ye,_override:xe&N?A:w,_isolate:0}):Be||ke++}else if(xe&s){xe&Y&&(xe=Nu(j+1,!0)===1?se:H),ne[j]=pe._level,pe._override&&ee(j,pe._override);var Te=(xe===se?Re:ve)(pe._level);Te<=Ee&&Be===0&&ke===0?(it++,De.push({_level:Te,_override:0,_isolate:1,_isolInitIndex:j})):Be++}else if(xe&ae){if(Be>0)Be--;else if(it>0){for(ke=0;!De[De.length-1]._isolate;)De.pop();var be=De[De.length-1]._isolInitIndex;be!=null&&(fe.set(be,j),fe.set(j,be)),De.pop(),it--}pe=De[De.length-1],ne[j]=pe._level,pe._override&&ee(j,pe._override)}else xe&k?(Be===0&&(ke>0?ke--:!pe._isolate&&De.length>1&&(De.pop(),pe=De[De.length-1])),ne[j]=pe._level):xe&P&&(ne[j]=ge.level);else ne[j]=pe._level,pe._override&&xe!==B&&ee(j,pe._override)}for(var Ge=[],Ze=null,je=ge.start;je<=ge.end;je++){var $e=T[je];if(!($e&c)){var Et=ne[je],bt=$e&s,Ct=$e===ae;Ze&&Et===Ze._level?(Ze._end=je,Ze._endsWithIsolInit=bt):Ge.push(Ze={_start:je,_end:je,_level:Et,_startsWithPDI:Ct,_endsWithIsolInit:bt})}}for(var ln=[],Jt=0;Jt<Ge.length;Jt++){var bn=Ge[Jt];if(!bn._startsWithPDI||bn._startsWithPDI&&!fe.has(bn._start)){for(var Vn=[Ze=bn],ai=void 0;Ze&&Ze._endsWithIsolInit&&(ai=fe.get(Ze._end))!=null;)for(var fn=Jt+1;fn<Ge.length;fn++)if(Ge[fn]._start===ai){Vn.push(Ze=Ge[fn]);break}for(var zt=[],On=0;On<Vn.length;On++)for(var Vs=Vn[On],Gr=Vs._start;Gr<=Vs._end;Gr++)zt.push(Gr);for(var wc=ne[zt[0]],$o=ge.level,Vr=zt[0]-1;Vr>=0;Vr--)if(!(T[Vr]&c)){$o=ne[Vr];break}var D=zt[zt.length-1],J=ne[D],le=ge.level;if(!(T[D]&s)){for(var ce=D+1;ce<=ge.end;ce++)if(!(T[ce]&c)){le=ne[ce];break}}ln.push({_seqIndices:zt,_sosType:Math.max($o,wc)%2?A:w,_eosType:Math.max(le,J)%2?A:w})}}for(var K=0;K<ln.length;K++){var Pe=ln[K],de=Pe._seqIndices,ze=Pe._sosType,Xe=Pe._eosType,Ye=ne[de[0]]&1?A:w;if(G.get(z))for(var Qe=0;Qe<de.length;Qe++){var We=de[Qe];if(T[We]&z){for(var at=ze,pt=Qe-1;pt>=0;pt--)if(!(T[de[pt]]&c)){at=T[de[pt]];break}ee(We,at&(s|ae)?U:at)}}if(G.get(S))for(var gt=0;gt<de.length;gt++){var qt=de[gt];if(T[qt]&S)for(var lt=gt-1;lt>=-1;lt--){var qe=lt===-1?ze:T[de[lt]];if(qe&o){qe===X&&ee(qt,I);break}}}if(G.get(X))for(var wn=0;wn<de.length;wn++){var ut=de[wn];T[ut]&X&&ee(ut,A)}if(G.get(x)||G.get(E))for(var jt=1;jt<de.length-1;jt++){var ci=de[jt];if(T[ci]&(x|E)){for(var Ut=0,Si=0,yt=jt-1;yt>=0&&(Ut=T[de[yt]],!!(Ut&c));yt--);for(var un=jt+1;un<de.length&&(Si=T[de[un]],!!(Si&c));un++);Ut===Si&&(T[ci]===x?Ut===S:Ut&(S|I))&&ee(ci,Ut)}}if(G.get(S))for(var Zt=0;Zt<de.length;Zt++){var hn=de[Zt];if(T[hn]&S){for(var Tn=Zt-1;Tn>=0&&T[de[Tn]]&(F|c);Tn--)ee(de[Tn],S);for(Zt++;Zt<de.length&&T[de[Zt]]&(F|c|S);Zt++)T[de[Zt]]!==S&&ee(de[Zt],S)}}if(G.get(F)||G.get(x)||G.get(E))for(var dn=0;dn<de.length;dn++){var Hs=de[dn];if(T[Hs]&(F|x|E)){ee(Hs,U);for(var Yo=dn-1;Yo>=0&&T[de[Yo]]&c;Yo--)ee(de[Yo],U);for(var Ko=dn+1;Ko<de.length&&T[de[Ko]]&c;Ko++)ee(de[Ko],U)}}if(G.get(S))for(var Tc=0,bu=ze;Tc<de.length;Tc++){var wu=de[Tc],Ac=T[wu];Ac&S?bu===w&&ee(wu,w):Ac&o&&(bu=Ac)}if(G.get(a)){var Ws=A|S|I,Tu=Ws|w,Jo=[];{for(var Hr=[],Wr=0;Wr<de.length;Wr++)if(T[de[Wr]]&a){var Xs=ue[de[Wr]],Au=void 0;if(v(Xs)!==null)if(Hr.length<63)Hr.push({char:Xs,seqIndex:Wr});else break;else if((Au=C(Xs))!==null)for(var qs=Hr.length-1;qs>=0;qs--){var Rc=Hr[qs].char;if(Rc===Au||Rc===C(R(Xs))||v(R(Rc))===Xs){Jo.push([Hr[qs].seqIndex,Wr]),Hr.length=qs;break}}}Jo.sort(function(pn,Wn){return pn[0]-Wn[0]})}for(var Cc=0;Cc<Jo.length;Cc++){for(var Ru=Jo[Cc],Zo=Ru[0],Dc=Ru[1],Cu=!1,Hn=0,Pc=Zo+1;Pc<Dc;Pc++){var Du=de[Pc];if(T[Du]&Tu){Cu=!0;var Pu=T[Du]&Ws?A:w;if(Pu===Ye){Hn=Pu;break}}}if(Cu&&!Hn){Hn=ze;for(var Uc=Zo-1;Uc>=0;Uc--){var Uu=de[Uc];if(T[Uu]&Tu){var Iu=T[Uu]&Ws?A:w;Iu!==Ye?Hn=Iu:Hn=Ye;break}}}if(Hn){if(T[de[Zo]]=T[de[Dc]]=Hn,Hn!==Ye){for(var js=Zo+1;js<de.length;js++)if(!(T[de[js]]&c)){h(ue[de[js]])&z&&(T[de[js]]=Hn);break}}if(Hn!==Ye){for(var $s=Dc+1;$s<de.length;$s++)if(!(T[de[$s]]&c)){h(ue[de[$s]])&z&&(T[de[$s]]=Hn);break}}}}for(var Gi=0;Gi<de.length;Gi++)if(T[de[Gi]]&a){for(var Lu=Gi,Ic=Gi,Lc=ze,Ys=Gi-1;Ys>=0;Ys--)if(T[de[Ys]]&c)Lu=Ys;else{Lc=T[de[Ys]]&Ws?A:w;break}for(var Fu=Xe,Ks=Gi+1;Ks<de.length;Ks++)if(T[de[Ks]]&(a|c))Ic=Ks;else{Fu=T[de[Ks]]&Ws?A:w;break}for(var Fc=Lu;Fc<=Ic;Fc++)T[de[Fc]]=Lc===Fu?Lc:Ye;Gi=Ic}}}for(var An=ge.start;An<=ge.end;An++){var Gg=ne[An],Qo=T[An];if(Gg&1?Qo&(w|S|I)&&ne[An]++:Qo&A?ne[An]++:Qo&(I|S)&&(ne[An]+=2),Qo&c&&(ne[An]=An===0?ge.level:ne[An-1]),An===ge.end||h(ue[An])&(O|P))for(var ea=An;ea>=0&&h(ue[ea])&l;ea--)ne[ea]=ge.level}}return{levels:ne,paragraphs:_e};function Nu(pn,Wn){for(var mn=pn;mn<ue.length;mn++){var Vi=T[mn];if(Vi&(A|X))return 1;if(Vi&(P|w)||Wn&&Vi===ae)return 0;if(Vi&s){var Ou=Vg(mn);mn=Ou===-1?ue.length:Ou}}return 0}function Vg(pn){for(var Wn=1,mn=pn+1;mn<ue.length;mn++){var Vi=T[mn];if(Vi&P)break;if(Vi&ae){if(--Wn===0)return mn}else Vi&s&&Wn++}return-1}}var Ae="14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1",we;function he(){if(!we){var ue=_(Ae,!0),Ue=ue.map,Ee=ue.reverseMap;Ee.forEach(function(T,M){Ue.set(M,T)}),we=Ue}}function Ve(ue){return he(),we.get(ue)||null}function W(ue,Ue,Ee,T){var M=ue.length;Ee=Math.max(0,Ee==null?0:+Ee),T=Math.min(M-1,T==null?M-1:+T);for(var G=new Map,ee=Ee;ee<=T;ee++)if(Ue[ee]&1){var ne=Ve(ue[ee]);ne!==null&&G.set(ee,ne)}return G}function He(ue,Ue,Ee,T){var M=ue.length;Ee=Math.max(0,Ee==null?0:+Ee),T=Math.min(M-1,T==null?M-1:+T);var G=[];return Ue.paragraphs.forEach(function(ee){var ne=Math.max(Ee,ee.start),fe=Math.min(T,ee.end);if(ne<fe){for(var _e=Ue.levels.slice(ne,fe+1),ge=fe;ge>=ne&&h(ue[ge])&l;ge--)_e[ge]=ee.level;for(var Se=ee.level,Oe=1/0,ve=0;ve<_e.length;ve++){var Re=_e[ve];Re>Se&&(Se=Re),Re<Oe&&(Oe=Re|1)}for(var Ce=Se;Ce>=Oe;Ce--)for(var De=0;De<_e.length;De++)if(_e[De]>=Ce){for(var pe=De;De+1<_e.length&&_e[De+1]>=Ce;)De++;De>pe&&G.push([pe+ne,De+ne])}}}),G}function Ie(ue,Ue,Ee,T){var M=Fe(ue,Ue,Ee,T),G=[].concat(ue);return M.forEach(function(ee,ne){G[ne]=(Ue.levels[ee]&1?Ve(ue[ee]):null)||ue[ee]}),G.join("")}function Fe(ue,Ue,Ee,T){for(var M=He(ue,Ue,Ee,T),G=[],ee=0;ee<ue.length;ee++)G[ee]=ee;return M.forEach(function(ne){for(var fe=ne[0],_e=ne[1],ge=G.slice(fe,_e+1),Se=ge.length;Se--;)G[_e-Se]=ge[Se]}),G}return e.closingToOpeningBracket=C,e.getBidiCharType=h,e.getBidiCharTypeName=d,e.getCanonicalBracket=R,e.getEmbeddingLevels=Me,e.getMirroredCharacter=Ve,e.getMirroredCharactersMap=W,e.getReorderSegments=He,e.getReorderedIndices=Fe,e.getReorderedString=Ie,e.openingToClosingBracket=v,Object.defineProperty(e,"__esModule",{value:!0}),e}({});return r}const _g=/\bvoid\s+main\s*\(\s*\)\s*{/g;function kf(r){const e=/^[ \t]*#include +<([\w\d./]+)>/gm;function t(n,i){let s=rt[i];return s?kf(s):n}return r.replace(e,t)}const $t=[];for(let r=0;r<256;r++)$t[r]=(r<16?"0":"")+r.toString(16);function P1(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return($t[r&255]+$t[r>>8&255]+$t[r>>16&255]+$t[r>>24&255]+"-"+$t[e&255]+$t[e>>8&255]+"-"+$t[e>>16&15|64]+$t[e>>24&255]+"-"+$t[t&63|128]+$t[t>>8&255]+"-"+$t[t>>16&255]+$t[t>>24&255]+$t[n&255]+$t[n>>8&255]+$t[n>>16&255]+$t[n>>24&255]).toUpperCase()}const _r=Object.assign||function(){let r=arguments[0];for(let e=1,t=arguments.length;e<t;e++){let n=arguments[e];if(n)for(let i in n)Object.prototype.hasOwnProperty.call(n,i)&&(r[i]=n[i])}return r},U1=Date.now(),Rd=new WeakMap,Cd=new Map;let I1=1e10;function zf(r,e){const t=O1(e);let n=Rd.get(r);if(n||Rd.set(r,n=Object.create(null)),n[t])return new n[t];const i=`_onBeforeCompile${t}`,s=function(l,f){r.onBeforeCompile.call(this,l,f);const u=this.customProgramCacheKey()+"|"+l.vertexShader+"|"+l.fragmentShader;let h=Cd[u];if(!h){const d=L1(this,l,e,t);h=Cd[u]=d}l.vertexShader=h.vertexShader,l.fragmentShader=h.fragmentShader,_r(l.uniforms,this.uniforms),e.timeUniform&&(l.uniforms[e.timeUniform]={get value(){return Date.now()-U1}}),this[i]&&this[i](l)},o=function(){return a(e.chained?r:r.clone())},a=function(l){const f=Object.create(l,c);return Object.defineProperty(f,"baseMaterial",{value:r}),Object.defineProperty(f,"id",{value:I1++}),f.uuid=P1(),f.uniforms=_r({},l.uniforms,e.uniforms),f.defines=_r({},l.defines,e.defines),f.defines[`TROIKA_DERIVED_MATERIAL_${t}`]="",f.extensions=_r({},l.extensions,e.extensions),f._listeners=void 0,f},c={constructor:{value:o},isDerivedMaterial:{value:!0},type:{get:()=>r.type,set:l=>{r.type=l}},isDerivedFrom:{writable:!0,configurable:!0,value:function(l){const f=this.baseMaterial;return l===f||f.isDerivedMaterial&&f.isDerivedFrom(l)||!1}},customProgramCacheKey:{writable:!0,configurable:!0,value:function(){return r.customProgramCacheKey()+"|"+t}},onBeforeCompile:{get(){return s},set(l){this[i]=l}},copy:{writable:!0,configurable:!0,value:function(l){return r.copy.call(this,l),!r.isShaderMaterial&&!r.isDerivedMaterial&&(_r(this.extensions,l.extensions),_r(this.defines,l.defines),_r(this.uniforms,ng.clone(l.uniforms))),this}},clone:{writable:!0,configurable:!0,value:function(){const l=new r.constructor;return a(l).copy(this)}},getDepthMaterial:{writable:!0,configurable:!0,value:function(){let l=this._depthMaterial;return l||(l=this._depthMaterial=zf(r.isDerivedMaterial?r.getDepthMaterial():new ug({depthPacking:qm}),e),l.defines.IS_DEPTH_MATERIAL="",l.uniforms=this.uniforms),l}},getDistanceMaterial:{writable:!0,configurable:!0,value:function(){let l=this._distanceMaterial;return l||(l=this._distanceMaterial=zf(r.isDerivedMaterial?r.getDistanceMaterial():new hg,e),l.defines.IS_DISTANCE_MATERIAL="",l.uniforms=this.uniforms),l}},dispose:{writable:!0,configurable:!0,value(){const{_depthMaterial:l,_distanceMaterial:f}=this;l&&l.dispose(),f&&f.dispose(),r.dispose.call(this)}}};return n[t]=o,new o}function L1(r,{vertexShader:e,fragmentShader:t},n,i){let{vertexDefs:s,vertexMainIntro:o,vertexMainOutro:a,vertexTransform:c,fragmentDefs:l,fragmentMainIntro:f,fragmentMainOutro:u,fragmentColorTransform:h,customRewriter:d,timeUniform:g}=n;if(s=s||"",o=o||"",a=a||"",l=l||"",f=f||"",u=u||"",(c||d)&&(e=kf(e)),(h||d)&&(t=t.replace(/^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,`
//!BEGIN_POST_CHUNK $1
$&
//!END_POST_CHUNK
`),t=kf(t)),d){let _=d({vertexShader:e,fragmentShader:t});e=_.vertexShader,t=_.fragmentShader}if(h){let _=[];t=t.replace(/^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,m=>(_.push(m),"")),u=`${h}
${_.join(`
`)}
${u}`}if(g){const _=`
uniform float ${g};
`;s=_+s,l=_+l}return c&&(e=`vec3 troika_position_${i};
vec3 troika_normal_${i};
vec2 troika_uv_${i};
${e}
`,s=`${s}
void troikaVertexTransform${i}() {
  vec3 position = troika_position_${i};
  vec3 normal = troika_normal_${i};
  vec2 uv = troika_uv_${i};
  ${c}
  troika_position_${i} = position;
  troika_normal_${i} = normal;
  troika_uv_${i} = uv;
}
`,o=`
troika_position_${i} = vec3(position);
troika_normal_${i} = vec3(normal);
troika_uv_${i} = vec2(uv);
troikaVertexTransform${i}();
${o}
`,e=e.replace(/\b(position|normal|uv)\b/g,(_,m,p,y)=>/\battribute\s+vec[23]\s+$/.test(y.substr(0,p))?m:`troika_${m}_${i}`),r.map&&r.map.channel>0||(e=e.replace(/\bMAP_UV\b/g,`troika_uv_${i}`))),e=Dd(e,i,s,o,a),t=Dd(t,i,l,f,u),{vertexShader:e,fragmentShader:t}}function Dd(r,e,t,n,i){return(n||i||t)&&(r=r.replace(_g,`
${t}
void troikaOrigMain${e}() {`),r+=`
void main() {
  ${n}
  troikaOrigMain${e}();
  ${i}
}`),r}function F1(r,e){return r==="uniforms"?void 0:typeof e=="function"?e.toString():e}let N1=0;const Pd=new Map;function O1(r){const e=JSON.stringify(r,F1);let t=Pd.get(e);return t==null&&Pd.set(e,t=++N1),t}/*!
Custom build of Typr.ts (https://github.com/fredli74/Typr.ts) for use in Troika text rendering.
Original MIT license applies: https://github.com/fredli74/Typr.ts/blob/master/LICENSE
*/function B1(){return typeof window=="undefined"&&(self.window=self),function(r){var e={parse:function(i){var s=e._bin,o=new Uint8Array(i);if(s.readASCII(o,0,4)=="ttcf"){var a=4;s.readUshort(o,a),a+=2,s.readUshort(o,a),a+=2;var c=s.readUint(o,a);a+=4;for(var l=[],f=0;f<c;f++){var u=s.readUint(o,a);a+=4,l.push(e._readFont(o,u))}return l}return[e._readFont(o,0)]},_readFont:function(i,s){var o=e._bin,a=s;o.readFixed(i,s),s+=4;var c=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2;for(var l=["cmap","head","hhea","maxp","hmtx","name","OS/2","post","loca","glyf","kern","CFF ","GDEF","GPOS","GSUB","SVG "],f={_data:i,_offset:a},u={},h=0;h<c;h++){var d=o.readASCII(i,s,4);s+=4,o.readUint(i,s),s+=4;var g=o.readUint(i,s);s+=4;var _=o.readUint(i,s);s+=4,u[d]={offset:g,length:_}}for(h=0;h<l.length;h++){var m=l[h];u[m]&&(f[m.trim()]=e[m.trim()].parse(i,u[m].offset,u[m].length,f))}return f},_tabOffset:function(i,s,o){for(var a=e._bin,c=a.readUshort(i,o+4),l=o+12,f=0;f<c;f++){var u=a.readASCII(i,l,4);l+=4,a.readUint(i,l),l+=4;var h=a.readUint(i,l);if(l+=4,a.readUint(i,l),l+=4,u==s)return h}return 0}};e._bin={readFixed:function(i,s){return(i[s]<<8|i[s+1])+(i[s+2]<<8|i[s+3])/65540},readF2dot14:function(i,s){return e._bin.readShort(i,s)/16384},readInt:function(i,s){return e._bin._view(i).getInt32(s)},readInt8:function(i,s){return e._bin._view(i).getInt8(s)},readShort:function(i,s){return e._bin._view(i).getInt16(s)},readUshort:function(i,s){return e._bin._view(i).getUint16(s)},readUshorts:function(i,s,o){for(var a=[],c=0;c<o;c++)a.push(e._bin.readUshort(i,s+2*c));return a},readUint:function(i,s){return e._bin._view(i).getUint32(s)},readUint64:function(i,s){return 4294967296*e._bin.readUint(i,s)+e._bin.readUint(i,s+4)},readASCII:function(i,s,o){for(var a="",c=0;c<o;c++)a+=String.fromCharCode(i[s+c]);return a},readUnicode:function(i,s,o){for(var a="",c=0;c<o;c++){var l=i[s++]<<8|i[s++];a+=String.fromCharCode(l)}return a},_tdec:typeof window!="undefined"&&window.TextDecoder?new window.TextDecoder:null,readUTF8:function(i,s,o){var a=e._bin._tdec;return a&&s==0&&o==i.length?a.decode(i):e._bin.readASCII(i,s,o)},readBytes:function(i,s,o){for(var a=[],c=0;c<o;c++)a.push(i[s+c]);return a},readASCIIArray:function(i,s,o){for(var a=[],c=0;c<o;c++)a.push(String.fromCharCode(i[s+c]));return a},_view:function(i){return i._dataView||(i._dataView=i.buffer?new DataView(i.buffer,i.byteOffset,i.byteLength):new DataView(new Uint8Array(i).buffer))}},e._lctf={},e._lctf.parse=function(i,s,o,a,c){var l=e._bin,f={},u=s;l.readFixed(i,s),s+=4;var h=l.readUshort(i,s);s+=2;var d=l.readUshort(i,s);s+=2;var g=l.readUshort(i,s);return s+=2,f.scriptList=e._lctf.readScriptList(i,u+h),f.featureList=e._lctf.readFeatureList(i,u+d),f.lookupList=e._lctf.readLookupList(i,u+g,c),f},e._lctf.readLookupList=function(i,s,o){var a=e._bin,c=s,l=[],f=a.readUshort(i,s);s+=2;for(var u=0;u<f;u++){var h=a.readUshort(i,s);s+=2;var d=e._lctf.readLookupTable(i,c+h,o);l.push(d)}return l},e._lctf.readLookupTable=function(i,s,o){var a=e._bin,c=s,l={tabs:[]};l.ltype=a.readUshort(i,s),s+=2,l.flag=a.readUshort(i,s),s+=2;var f=a.readUshort(i,s);s+=2;for(var u=l.ltype,h=0;h<f;h++){var d=a.readUshort(i,s);s+=2;var g=o(i,u,c+d,l);l.tabs.push(g)}return l},e._lctf.numOfOnes=function(i){for(var s=0,o=0;o<32;o++)i>>>o&1&&s++;return s},e._lctf.readClassDef=function(i,s){var o=e._bin,a=[],c=o.readUshort(i,s);if(s+=2,c==1){var l=o.readUshort(i,s);s+=2;var f=o.readUshort(i,s);s+=2;for(var u=0;u<f;u++)a.push(l+u),a.push(l+u),a.push(o.readUshort(i,s)),s+=2}if(c==2){var h=o.readUshort(i,s);for(s+=2,u=0;u<h;u++)a.push(o.readUshort(i,s)),s+=2,a.push(o.readUshort(i,s)),s+=2,a.push(o.readUshort(i,s)),s+=2}return a},e._lctf.getInterval=function(i,s){for(var o=0;o<i.length;o+=3){var a=i[o],c=i[o+1];if(i[o+2],a<=s&&s<=c)return o}return-1},e._lctf.readCoverage=function(i,s){var o=e._bin,a={};a.fmt=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);return s+=2,a.fmt==1&&(a.tab=o.readUshorts(i,s,c)),a.fmt==2&&(a.tab=o.readUshorts(i,s,3*c)),a},e._lctf.coverageIndex=function(i,s){var o=i.tab;if(i.fmt==1)return o.indexOf(s);if(i.fmt==2){var a=e._lctf.getInterval(o,s);if(a!=-1)return o[a+2]+(s-o[a])}return-1},e._lctf.readFeatureList=function(i,s){var o=e._bin,a=s,c=[],l=o.readUshort(i,s);s+=2;for(var f=0;f<l;f++){var u=o.readASCII(i,s,4);s+=4;var h=o.readUshort(i,s);s+=2;var d=e._lctf.readFeatureTable(i,a+h);d.tag=u.trim(),c.push(d)}return c},e._lctf.readFeatureTable=function(i,s){var o=e._bin,a=s,c={},l=o.readUshort(i,s);s+=2,l>0&&(c.featureParams=a+l);var f=o.readUshort(i,s);s+=2,c.tab=[];for(var u=0;u<f;u++)c.tab.push(o.readUshort(i,s+2*u));return c},e._lctf.readScriptList=function(i,s){var o=e._bin,a=s,c={},l=o.readUshort(i,s);s+=2;for(var f=0;f<l;f++){var u=o.readASCII(i,s,4);s+=4;var h=o.readUshort(i,s);s+=2,c[u.trim()]=e._lctf.readScriptTable(i,a+h)}return c},e._lctf.readScriptTable=function(i,s){var o=e._bin,a=s,c={},l=o.readUshort(i,s);s+=2,l>0&&(c.default=e._lctf.readLangSysTable(i,a+l));var f=o.readUshort(i,s);s+=2;for(var u=0;u<f;u++){var h=o.readASCII(i,s,4);s+=4;var d=o.readUshort(i,s);s+=2,c[h.trim()]=e._lctf.readLangSysTable(i,a+d)}return c},e._lctf.readLangSysTable=function(i,s){var o=e._bin,a={};o.readUshort(i,s),s+=2,a.reqFeature=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);return s+=2,a.features=o.readUshorts(i,s,c),a},e.CFF={},e.CFF.parse=function(i,s,o){var a=e._bin;(i=new Uint8Array(i.buffer,s,o))[s=0],i[++s],i[++s],i[++s],s++;var c=[];s=e.CFF.readIndex(i,s,c);for(var l=[],f=0;f<c.length-1;f++)l.push(a.readASCII(i,s+c[f],c[f+1]-c[f]));s+=c[c.length-1];var u=[];s=e.CFF.readIndex(i,s,u);var h=[];for(f=0;f<u.length-1;f++)h.push(e.CFF.readDict(i,s+u[f],s+u[f+1]));s+=u[u.length-1];var d=h[0],g=[];s=e.CFF.readIndex(i,s,g);var _=[];for(f=0;f<g.length-1;f++)_.push(a.readASCII(i,s+g[f],g[f+1]-g[f]));if(s+=g[g.length-1],e.CFF.readSubrs(i,s,d),d.CharStrings){s=d.CharStrings,g=[],s=e.CFF.readIndex(i,s,g);var m=[];for(f=0;f<g.length-1;f++)m.push(a.readBytes(i,s+g[f],g[f+1]-g[f]));d.CharStrings=m}if(d.ROS){s=d.FDArray;var p=[];for(s=e.CFF.readIndex(i,s,p),d.FDArray=[],f=0;f<p.length-1;f++){var y=e.CFF.readDict(i,s+p[f],s+p[f+1]);e.CFF._readFDict(i,y,_),d.FDArray.push(y)}s+=p[p.length-1],s=d.FDSelect,d.FDSelect=[];var b=i[s];if(s++,b!=3)throw b;var v=a.readUshort(i,s);for(s+=2,f=0;f<v+1;f++)d.FDSelect.push(a.readUshort(i,s),i[s+2]),s+=3}return d.Encoding&&(d.Encoding=e.CFF.readEncoding(i,d.Encoding,d.CharStrings.length)),d.charset&&(d.charset=e.CFF.readCharset(i,d.charset,d.CharStrings.length)),e.CFF._readFDict(i,d,_),d},e.CFF._readFDict=function(i,s,o){var a;for(var c in s.Private&&(a=s.Private[1],s.Private=e.CFF.readDict(i,a,a+s.Private[0]),s.Private.Subrs&&e.CFF.readSubrs(i,a+s.Private.Subrs,s.Private)),s)["FamilyName","FontName","FullName","Notice","version","Copyright"].indexOf(c)!=-1&&(s[c]=o[s[c]-426+35])},e.CFF.readSubrs=function(i,s,o){var a=e._bin,c=[];s=e.CFF.readIndex(i,s,c);var l,f=c.length;l=f<1240?107:f<33900?1131:32768,o.Bias=l,o.Subrs=[];for(var u=0;u<c.length-1;u++)o.Subrs.push(a.readBytes(i,s+c[u],c[u+1]-c[u]))},e.CFF.tableSE=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,0,111,112,113,114,0,115,116,117,118,119,120,121,122,0,123,0,124,125,126,127,128,129,130,131,0,132,133,0,134,135,136,137,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,0,139,0,0,0,0,140,141,142,143,0,0,0,0,0,144,0,0,0,145,0,0,146,147,148,149,0,0,0,0],e.CFF.glyphByUnicode=function(i,s){for(var o=0;o<i.charset.length;o++)if(i.charset[o]==s)return o;return-1},e.CFF.glyphBySE=function(i,s){return s<0||s>255?-1:e.CFF.glyphByUnicode(i,e.CFF.tableSE[s])},e.CFF.readEncoding=function(i,s,o){e._bin;var a=[".notdef"],c=i[s];if(s++,c!=0)throw"error: unknown encoding format: "+c;var l=i[s];s++;for(var f=0;f<l;f++)a.push(i[s+f]);return a},e.CFF.readCharset=function(i,s,o){var a=e._bin,c=[".notdef"],l=i[s];if(s++,l==0)for(var f=0;f<o;f++){var u=a.readUshort(i,s);s+=2,c.push(u)}else{if(l!=1&&l!=2)throw"error: format: "+l;for(;c.length<o;){u=a.readUshort(i,s),s+=2;var h=0;for(l==1?(h=i[s],s++):(h=a.readUshort(i,s),s+=2),f=0;f<=h;f++)c.push(u),u++}}return c},e.CFF.readIndex=function(i,s,o){var a=e._bin,c=a.readUshort(i,s)+1,l=i[s+=2];if(s++,l==1)for(var f=0;f<c;f++)o.push(i[s+f]);else if(l==2)for(f=0;f<c;f++)o.push(a.readUshort(i,s+2*f));else if(l==3)for(f=0;f<c;f++)o.push(16777215&a.readUint(i,s+3*f-1));else if(c!=1)throw"unsupported offset size: "+l+", count: "+c;return(s+=c*l)-1},e.CFF.getCharString=function(i,s,o){var a=e._bin,c=i[s],l=i[s+1];i[s+2],i[s+3],i[s+4];var f=1,u=null,h=null;c<=20&&(u=c,f=1),c==12&&(u=100*c+l,f=2),21<=c&&c<=27&&(u=c,f=1),c==28&&(h=a.readShort(i,s+1),f=3),29<=c&&c<=31&&(u=c,f=1),32<=c&&c<=246&&(h=c-139,f=1),247<=c&&c<=250&&(h=256*(c-247)+l+108,f=2),251<=c&&c<=254&&(h=256*-(c-251)-l-108,f=2),c==255&&(h=a.readInt(i,s+1)/65535,f=5),o.val=h!=null?h:"o"+u,o.size=f},e.CFF.readCharString=function(i,s,o){for(var a=s+o,c=e._bin,l=[];s<a;){var f=i[s],u=i[s+1];i[s+2],i[s+3],i[s+4];var h=1,d=null,g=null;f<=20&&(d=f,h=1),f==12&&(d=100*f+u,h=2),f!=19&&f!=20||(d=f,h=2),21<=f&&f<=27&&(d=f,h=1),f==28&&(g=c.readShort(i,s+1),h=3),29<=f&&f<=31&&(d=f,h=1),32<=f&&f<=246&&(g=f-139,h=1),247<=f&&f<=250&&(g=256*(f-247)+u+108,h=2),251<=f&&f<=254&&(g=256*-(f-251)-u-108,h=2),f==255&&(g=c.readInt(i,s+1)/65535,h=5),l.push(g!=null?g:"o"+d),s+=h}return l},e.CFF.readDict=function(i,s,o){for(var a=e._bin,c={},l=[];s<o;){var f=i[s],u=i[s+1];i[s+2],i[s+3],i[s+4];var h=1,d=null,g=null;if(f==28&&(g=a.readShort(i,s+1),h=3),f==29&&(g=a.readInt(i,s+1),h=5),32<=f&&f<=246&&(g=f-139,h=1),247<=f&&f<=250&&(g=256*(f-247)+u+108,h=2),251<=f&&f<=254&&(g=256*-(f-251)-u-108,h=2),f==255)throw g=a.readInt(i,s+1)/65535,h=5,"unknown number";if(f==30){var _=[];for(h=1;;){var m=i[s+h];h++;var p=m>>4,y=15&m;if(p!=15&&_.push(p),y!=15&&_.push(y),y==15)break}for(var b="",v=[0,1,2,3,4,5,6,7,8,9,".","e","e-","reserved","-","endOfNumber"],C=0;C<_.length;C++)b+=v[_[C]];g=parseFloat(b)}f<=21&&(d=["version","Notice","FullName","FamilyName","Weight","FontBBox","BlueValues","OtherBlues","FamilyBlues","FamilyOtherBlues","StdHW","StdVW","escape","UniqueID","XUID","charset","Encoding","CharStrings","Private","Subrs","defaultWidthX","nominalWidthX"][f],h=1,f==12&&(d=["Copyright","isFixedPitch","ItalicAngle","UnderlinePosition","UnderlineThickness","PaintType","CharstringType","FontMatrix","StrokeWidth","BlueScale","BlueShift","BlueFuzz","StemSnapH","StemSnapV","ForceBold",0,0,"LanguageGroup","ExpansionFactor","initialRandomSeed","SyntheticBase","PostScript","BaseFontName","BaseFontBlend",0,0,0,0,0,0,"ROS","CIDFontVersion","CIDFontRevision","CIDFontType","CIDCount","UIDBase","FDArray","FDSelect","FontName"][u],h=2)),d!=null?(c[d]=l.length==1?l[0]:l,l=[]):l.push(g),s+=h}return c},e.cmap={},e.cmap.parse=function(i,s,o){i=new Uint8Array(i.buffer,s,o),s=0;var a=e._bin,c={};a.readUshort(i,s),s+=2;var l=a.readUshort(i,s);s+=2;var f=[];c.tables=[];for(var u=0;u<l;u++){var h=a.readUshort(i,s);s+=2;var d=a.readUshort(i,s);s+=2;var g=a.readUint(i,s);s+=4;var _="p"+h+"e"+d,m=f.indexOf(g);if(m==-1){var p;m=c.tables.length,f.push(g);var y=a.readUshort(i,g);y==0?p=e.cmap.parse0(i,g):y==4?p=e.cmap.parse4(i,g):y==6?p=e.cmap.parse6(i,g):y==12?p=e.cmap.parse12(i,g):console.debug("unknown format: "+y,h,d,g),c.tables.push(p)}if(c[_]!=null)throw"multiple tables for one platform+encoding";c[_]=m}return c},e.cmap.parse0=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2,a.map=[];for(var l=0;l<c-6;l++)a.map.push(i[s+l]);return a},e.cmap.parse4=function(i,s){var o=e._bin,a=s,c={};c.format=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2;var f=o.readUshort(i,s);s+=2;var u=f/2;c.searchRange=o.readUshort(i,s),s+=2,c.entrySelector=o.readUshort(i,s),s+=2,c.rangeShift=o.readUshort(i,s),s+=2,c.endCount=o.readUshorts(i,s,u),s+=2*u,s+=2,c.startCount=o.readUshorts(i,s,u),s+=2*u,c.idDelta=[];for(var h=0;h<u;h++)c.idDelta.push(o.readShort(i,s)),s+=2;for(c.idRangeOffset=o.readUshorts(i,s,u),s+=2*u,c.glyphIdArray=[];s<a+l;)c.glyphIdArray.push(o.readUshort(i,s)),s+=2;return c},e.cmap.parse6=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,a.firstCode=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);s+=2,a.glyphIdArray=[];for(var l=0;l<c;l++)a.glyphIdArray.push(o.readUshort(i,s)),s+=2;return a},e.cmap.parse12=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2,s+=2,o.readUint(i,s),s+=4,o.readUint(i,s),s+=4;var c=o.readUint(i,s);s+=4,a.groups=[];for(var l=0;l<c;l++){var f=s+12*l,u=o.readUint(i,f+0),h=o.readUint(i,f+4),d=o.readUint(i,f+8);a.groups.push([u,h,d])}return a},e.glyf={},e.glyf.parse=function(i,s,o,a){for(var c=[],l=0;l<a.maxp.numGlyphs;l++)c.push(null);return c},e.glyf._parseGlyf=function(i,s){var o=e._bin,a=i._data,c=e._tabOffset(a,"glyf",i._offset)+i.loca[s];if(i.loca[s]==i.loca[s+1])return null;var l={};if(l.noc=o.readShort(a,c),c+=2,l.xMin=o.readShort(a,c),c+=2,l.yMin=o.readShort(a,c),c+=2,l.xMax=o.readShort(a,c),c+=2,l.yMax=o.readShort(a,c),c+=2,l.xMin>=l.xMax||l.yMin>=l.yMax)return null;if(l.noc>0){l.endPts=[];for(var f=0;f<l.noc;f++)l.endPts.push(o.readUshort(a,c)),c+=2;var u=o.readUshort(a,c);if(c+=2,a.length-c<u)return null;l.instructions=o.readBytes(a,c,u),c+=u;var h=l.endPts[l.noc-1]+1;for(l.flags=[],f=0;f<h;f++){var d=a[c];if(c++,l.flags.push(d),(8&d)!=0){var g=a[c];c++;for(var _=0;_<g;_++)l.flags.push(d),f++}}for(l.xs=[],f=0;f<h;f++){var m=(2&l.flags[f])!=0,p=(16&l.flags[f])!=0;m?(l.xs.push(p?a[c]:-a[c]),c++):p?l.xs.push(0):(l.xs.push(o.readShort(a,c)),c+=2)}for(l.ys=[],f=0;f<h;f++)m=(4&l.flags[f])!=0,p=(32&l.flags[f])!=0,m?(l.ys.push(p?a[c]:-a[c]),c++):p?l.ys.push(0):(l.ys.push(o.readShort(a,c)),c+=2);var y=0,b=0;for(f=0;f<h;f++)y+=l.xs[f],b+=l.ys[f],l.xs[f]=y,l.ys[f]=b}else{var v;l.parts=[];do{v=o.readUshort(a,c),c+=2;var C={m:{a:1,b:0,c:0,d:1,tx:0,ty:0},p1:-1,p2:-1};if(l.parts.push(C),C.glyphIndex=o.readUshort(a,c),c+=2,1&v){var R=o.readShort(a,c);c+=2;var w=o.readShort(a,c);c+=2}else R=o.readInt8(a,c),c++,w=o.readInt8(a,c),c++;2&v?(C.m.tx=R,C.m.ty=w):(C.p1=R,C.p2=w),8&v?(C.m.a=C.m.d=o.readF2dot14(a,c),c+=2):64&v?(C.m.a=o.readF2dot14(a,c),c+=2,C.m.d=o.readF2dot14(a,c),c+=2):128&v&&(C.m.a=o.readF2dot14(a,c),c+=2,C.m.b=o.readF2dot14(a,c),c+=2,C.m.c=o.readF2dot14(a,c),c+=2,C.m.d=o.readF2dot14(a,c),c+=2)}while(32&v);if(256&v){var A=o.readUshort(a,c);for(c+=2,l.instr=[],f=0;f<A;f++)l.instr.push(a[c]),c++}}return l},e.GDEF={},e.GDEF.parse=function(i,s,o,a){var c=s;s+=4;var l=e._bin.readUshort(i,s);return{glyphClassDef:l===0?null:e._lctf.readClassDef(i,c+l)}},e.GPOS={},e.GPOS.parse=function(i,s,o,a){return e._lctf.parse(i,s,o,a,e.GPOS.subt)},e.GPOS.subt=function(i,s,o,a){var c=e._bin,l=o,f={};if(f.fmt=c.readUshort(i,o),o+=2,s==1||s==2||s==3||s==7||s==8&&f.fmt<=2){var u=c.readUshort(i,o);o+=2,f.coverage=e._lctf.readCoverage(i,u+l)}if(s==1&&f.fmt==1){var h=c.readUshort(i,o);o+=2,h!=0&&(f.pos=e.GPOS.readValueRecord(i,o,h))}else if(s==2&&f.fmt>=1&&f.fmt<=2){h=c.readUshort(i,o),o+=2;var d=c.readUshort(i,o);o+=2;var g=e._lctf.numOfOnes(h),_=e._lctf.numOfOnes(d);if(f.fmt==1){f.pairsets=[];var m=c.readUshort(i,o);o+=2;for(var p=0;p<m;p++){var y=l+c.readUshort(i,o);o+=2;var b=c.readUshort(i,y);y+=2;for(var v=[],C=0;C<b;C++){var R=c.readUshort(i,y);y+=2,h!=0&&(I=e.GPOS.readValueRecord(i,y,h),y+=2*g),d!=0&&(E=e.GPOS.readValueRecord(i,y,d),y+=2*_),v.push({gid2:R,val1:I,val2:E})}f.pairsets.push(v)}}if(f.fmt==2){var w=c.readUshort(i,o);o+=2;var A=c.readUshort(i,o);o+=2;var S=c.readUshort(i,o);o+=2;var x=c.readUshort(i,o);for(o+=2,f.classDef1=e._lctf.readClassDef(i,l+w),f.classDef2=e._lctf.readClassDef(i,l+A),f.matrix=[],p=0;p<S;p++){var F=[];for(C=0;C<x;C++){var I=null,E=null;h!=0&&(I=e.GPOS.readValueRecord(i,o,h),o+=2*g),d!=0&&(E=e.GPOS.readValueRecord(i,o,d),o+=2*_),F.push({val1:I,val2:E})}f.matrix.push(F)}}}else if(s==4&&f.fmt==1)f.markCoverage=e._lctf.readCoverage(i,c.readUshort(i,o)+l),f.baseCoverage=e._lctf.readCoverage(i,c.readUshort(i,o+2)+l),f.markClassCount=c.readUshort(i,o+4),f.markArray=e.GPOS.readMarkArray(i,c.readUshort(i,o+6)+l),f.baseArray=e.GPOS.readBaseArray(i,c.readUshort(i,o+8)+l,f.markClassCount);else if(s==6&&f.fmt==1)f.mark1Coverage=e._lctf.readCoverage(i,c.readUshort(i,o)+l),f.mark2Coverage=e._lctf.readCoverage(i,c.readUshort(i,o+2)+l),f.markClassCount=c.readUshort(i,o+4),f.mark1Array=e.GPOS.readMarkArray(i,c.readUshort(i,o+6)+l),f.mark2Array=e.GPOS.readBaseArray(i,c.readUshort(i,o+8)+l,f.markClassCount);else{if(s==9&&f.fmt==1){var P=c.readUshort(i,o);o+=2;var O=c.readUint(i,o);if(o+=4,a.ltype==9)a.ltype=P;else if(a.ltype!=P)throw"invalid extension substitution";return e.GPOS.subt(i,a.ltype,l+O)}console.debug("unsupported GPOS table LookupType",s,"format",f.fmt)}return f},e.GPOS.readValueRecord=function(i,s,o){var a=e._bin,c=[];return c.push(1&o?a.readShort(i,s):0),s+=1&o?2:0,c.push(2&o?a.readShort(i,s):0),s+=2&o?2:0,c.push(4&o?a.readShort(i,s):0),s+=4&o?2:0,c.push(8&o?a.readShort(i,s):0),s+=8&o?2:0,c},e.GPOS.readBaseArray=function(i,s,o){var a=e._bin,c=[],l=s,f=a.readUshort(i,s);s+=2;for(var u=0;u<f;u++){for(var h=[],d=0;d<o;d++)h.push(e.GPOS.readAnchorRecord(i,l+a.readUshort(i,s))),s+=2;c.push(h)}return c},e.GPOS.readMarkArray=function(i,s){var o=e._bin,a=[],c=s,l=o.readUshort(i,s);s+=2;for(var f=0;f<l;f++){var u=e.GPOS.readAnchorRecord(i,o.readUshort(i,s+2)+c);u.markClass=o.readUshort(i,s),a.push(u),s+=4}return a},e.GPOS.readAnchorRecord=function(i,s){var o=e._bin,a={};return a.fmt=o.readUshort(i,s),a.x=o.readShort(i,s+2),a.y=o.readShort(i,s+4),a},e.GSUB={},e.GSUB.parse=function(i,s,o,a){return e._lctf.parse(i,s,o,a,e.GSUB.subt)},e.GSUB.subt=function(i,s,o,a){var c=e._bin,l=o,f={};if(f.fmt=c.readUshort(i,o),o+=2,s!=1&&s!=2&&s!=4&&s!=5&&s!=6)return null;if(s==1||s==2||s==4||s==5&&f.fmt<=2||s==6&&f.fmt<=2){var u=c.readUshort(i,o);o+=2,f.coverage=e._lctf.readCoverage(i,l+u)}if(s==1&&f.fmt>=1&&f.fmt<=2){if(f.fmt==1)f.delta=c.readShort(i,o),o+=2;else if(f.fmt==2){var h=c.readUshort(i,o);o+=2,f.newg=c.readUshorts(i,o,h),o+=2*f.newg.length}}else if(s==2&&f.fmt==1){h=c.readUshort(i,o),o+=2,f.seqs=[];for(var d=0;d<h;d++){var g=c.readUshort(i,o)+l;o+=2;var _=c.readUshort(i,g);f.seqs.push(c.readUshorts(i,g+2,_))}}else if(s==4)for(f.vals=[],h=c.readUshort(i,o),o+=2,d=0;d<h;d++){var m=c.readUshort(i,o);o+=2,f.vals.push(e.GSUB.readLigatureSet(i,l+m))}else if(s==5&&f.fmt==2){if(f.fmt==2){var p=c.readUshort(i,o);o+=2,f.cDef=e._lctf.readClassDef(i,l+p),f.scset=[];var y=c.readUshort(i,o);for(o+=2,d=0;d<y;d++){var b=c.readUshort(i,o);o+=2,f.scset.push(b==0?null:e.GSUB.readSubClassSet(i,l+b))}}}else if(s==6&&f.fmt==3){if(f.fmt==3){for(d=0;d<3;d++){h=c.readUshort(i,o),o+=2;for(var v=[],C=0;C<h;C++)v.push(e._lctf.readCoverage(i,l+c.readUshort(i,o+2*C)));o+=2*h,d==0&&(f.backCvg=v),d==1&&(f.inptCvg=v),d==2&&(f.ahedCvg=v)}h=c.readUshort(i,o),o+=2,f.lookupRec=e.GSUB.readSubstLookupRecords(i,o,h)}}else{if(s==7&&f.fmt==1){var R=c.readUshort(i,o);o+=2;var w=c.readUint(i,o);if(o+=4,a.ltype==9)a.ltype=R;else if(a.ltype!=R)throw"invalid extension substitution";return e.GSUB.subt(i,a.ltype,l+w)}console.debug("unsupported GSUB table LookupType",s,"format",f.fmt)}return f},e.GSUB.readSubClassSet=function(i,s){var o=e._bin.readUshort,a=s,c=[],l=o(i,s);s+=2;for(var f=0;f<l;f++){var u=o(i,s);s+=2,c.push(e.GSUB.readSubClassRule(i,a+u))}return c},e.GSUB.readSubClassRule=function(i,s){var o=e._bin.readUshort,a={},c=o(i,s),l=o(i,s+=2);s+=2,a.input=[];for(var f=0;f<c-1;f++)a.input.push(o(i,s)),s+=2;return a.substLookupRecords=e.GSUB.readSubstLookupRecords(i,s,l),a},e.GSUB.readSubstLookupRecords=function(i,s,o){for(var a=e._bin.readUshort,c=[],l=0;l<o;l++)c.push(a(i,s),a(i,s+2)),s+=4;return c},e.GSUB.readChainSubClassSet=function(i,s){var o=e._bin,a=s,c=[],l=o.readUshort(i,s);s+=2;for(var f=0;f<l;f++){var u=o.readUshort(i,s);s+=2,c.push(e.GSUB.readChainSubClassRule(i,a+u))}return c},e.GSUB.readChainSubClassRule=function(i,s){for(var o=e._bin,a={},c=["backtrack","input","lookahead"],l=0;l<c.length;l++){var f=o.readUshort(i,s);s+=2,l==1&&f--,a[c[l]]=o.readUshorts(i,s,f),s+=2*a[c[l]].length}return f=o.readUshort(i,s),s+=2,a.subst=o.readUshorts(i,s,2*f),s+=2*a.subst.length,a},e.GSUB.readLigatureSet=function(i,s){var o=e._bin,a=s,c=[],l=o.readUshort(i,s);s+=2;for(var f=0;f<l;f++){var u=o.readUshort(i,s);s+=2,c.push(e.GSUB.readLigature(i,a+u))}return c},e.GSUB.readLigature=function(i,s){var o=e._bin,a={chain:[]};a.nglyph=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);s+=2;for(var l=0;l<c-1;l++)a.chain.push(o.readUshort(i,s)),s+=2;return a},e.head={},e.head.parse=function(i,s,o){var a=e._bin,c={};return a.readFixed(i,s),s+=4,c.fontRevision=a.readFixed(i,s),s+=4,a.readUint(i,s),s+=4,a.readUint(i,s),s+=4,c.flags=a.readUshort(i,s),s+=2,c.unitsPerEm=a.readUshort(i,s),s+=2,c.created=a.readUint64(i,s),s+=8,c.modified=a.readUint64(i,s),s+=8,c.xMin=a.readShort(i,s),s+=2,c.yMin=a.readShort(i,s),s+=2,c.xMax=a.readShort(i,s),s+=2,c.yMax=a.readShort(i,s),s+=2,c.macStyle=a.readUshort(i,s),s+=2,c.lowestRecPPEM=a.readUshort(i,s),s+=2,c.fontDirectionHint=a.readShort(i,s),s+=2,c.indexToLocFormat=a.readShort(i,s),s+=2,c.glyphDataFormat=a.readShort(i,s),s+=2,c},e.hhea={},e.hhea.parse=function(i,s,o){var a=e._bin,c={};return a.readFixed(i,s),s+=4,c.ascender=a.readShort(i,s),s+=2,c.descender=a.readShort(i,s),s+=2,c.lineGap=a.readShort(i,s),s+=2,c.advanceWidthMax=a.readUshort(i,s),s+=2,c.minLeftSideBearing=a.readShort(i,s),s+=2,c.minRightSideBearing=a.readShort(i,s),s+=2,c.xMaxExtent=a.readShort(i,s),s+=2,c.caretSlopeRise=a.readShort(i,s),s+=2,c.caretSlopeRun=a.readShort(i,s),s+=2,c.caretOffset=a.readShort(i,s),s+=2,s+=8,c.metricDataFormat=a.readShort(i,s),s+=2,c.numberOfHMetrics=a.readUshort(i,s),s+=2,c},e.hmtx={},e.hmtx.parse=function(i,s,o,a){for(var c=e._bin,l={aWidth:[],lsBearing:[]},f=0,u=0,h=0;h<a.maxp.numGlyphs;h++)h<a.hhea.numberOfHMetrics&&(f=c.readUshort(i,s),s+=2,u=c.readShort(i,s),s+=2),l.aWidth.push(f),l.lsBearing.push(u);return l},e.kern={},e.kern.parse=function(i,s,o,a){var c=e._bin,l=c.readUshort(i,s);if(s+=2,l==1)return e.kern.parseV1(i,s-2,o,a);var f=c.readUshort(i,s);s+=2;for(var u={glyph1:[],rval:[]},h=0;h<f;h++){s+=2,o=c.readUshort(i,s),s+=2;var d=c.readUshort(i,s);s+=2;var g=d>>>8;if((g&=15)!=0)throw"unknown kern table format: "+g;s=e.kern.readFormat0(i,s,u)}return u},e.kern.parseV1=function(i,s,o,a){var c=e._bin;c.readFixed(i,s),s+=4;var l=c.readUint(i,s);s+=4;for(var f={glyph1:[],rval:[]},u=0;u<l;u++){c.readUint(i,s),s+=4;var h=c.readUshort(i,s);s+=2,c.readUshort(i,s),s+=2;var d=h>>>8;if((d&=15)!=0)throw"unknown kern table format: "+d;s=e.kern.readFormat0(i,s,f)}return f},e.kern.readFormat0=function(i,s,o){var a=e._bin,c=-1,l=a.readUshort(i,s);s+=2,a.readUshort(i,s),s+=2,a.readUshort(i,s),s+=2,a.readUshort(i,s),s+=2;for(var f=0;f<l;f++){var u=a.readUshort(i,s);s+=2;var h=a.readUshort(i,s);s+=2;var d=a.readShort(i,s);s+=2,u!=c&&(o.glyph1.push(u),o.rval.push({glyph2:[],vals:[]}));var g=o.rval[o.rval.length-1];g.glyph2.push(h),g.vals.push(d),c=u}return s},e.loca={},e.loca.parse=function(i,s,o,a){var c=e._bin,l=[],f=a.head.indexToLocFormat,u=a.maxp.numGlyphs+1;if(f==0)for(var h=0;h<u;h++)l.push(c.readUshort(i,s+(h<<1))<<1);if(f==1)for(h=0;h<u;h++)l.push(c.readUint(i,s+(h<<2)));return l},e.maxp={},e.maxp.parse=function(i,s,o){var a=e._bin,c={},l=a.readUint(i,s);return s+=4,c.numGlyphs=a.readUshort(i,s),s+=2,l==65536&&(c.maxPoints=a.readUshort(i,s),s+=2,c.maxContours=a.readUshort(i,s),s+=2,c.maxCompositePoints=a.readUshort(i,s),s+=2,c.maxCompositeContours=a.readUshort(i,s),s+=2,c.maxZones=a.readUshort(i,s),s+=2,c.maxTwilightPoints=a.readUshort(i,s),s+=2,c.maxStorage=a.readUshort(i,s),s+=2,c.maxFunctionDefs=a.readUshort(i,s),s+=2,c.maxInstructionDefs=a.readUshort(i,s),s+=2,c.maxStackElements=a.readUshort(i,s),s+=2,c.maxSizeOfInstructions=a.readUshort(i,s),s+=2,c.maxComponentElements=a.readUshort(i,s),s+=2,c.maxComponentDepth=a.readUshort(i,s),s+=2),c},e.name={},e.name.parse=function(i,s,o){var a=e._bin,c={};a.readUshort(i,s),s+=2;var l=a.readUshort(i,s);s+=2,a.readUshort(i,s);for(var f,u=["copyright","fontFamily","fontSubfamily","ID","fullName","version","postScriptName","trademark","manufacturer","designer","description","urlVendor","urlDesigner","licence","licenceURL","---","typoFamilyName","typoSubfamilyName","compatibleFull","sampleText","postScriptCID","wwsFamilyName","wwsSubfamilyName","lightPalette","darkPalette"],h=s+=2,d=0;d<l;d++){var g=a.readUshort(i,s);s+=2;var _=a.readUshort(i,s);s+=2;var m=a.readUshort(i,s);s+=2;var p=a.readUshort(i,s);s+=2;var y=a.readUshort(i,s);s+=2;var b=a.readUshort(i,s);s+=2;var v,C=u[p],R=h+12*l+b;if(g==0)v=a.readUnicode(i,R,y/2);else if(g==3&&_==0)v=a.readUnicode(i,R,y/2);else if(_==0)v=a.readASCII(i,R,y);else if(_==1)v=a.readUnicode(i,R,y/2);else if(_==3)v=a.readUnicode(i,R,y/2);else{if(g!=1)throw"unknown encoding "+_+", platformID: "+g;v=a.readASCII(i,R,y),console.debug("reading unknown MAC encoding "+_+" as ASCII")}var w="p"+g+","+m.toString(16);c[w]==null&&(c[w]={}),c[w][C!==void 0?C:p]=v,c[w]._lang=m}for(var A in c)if(c[A].postScriptName!=null&&c[A]._lang==1033)return c[A];for(var A in c)if(c[A].postScriptName!=null&&c[A]._lang==0)return c[A];for(var A in c)if(c[A].postScriptName!=null&&c[A]._lang==3084)return c[A];for(var A in c)if(c[A].postScriptName!=null)return c[A];for(var A in c){f=A;break}return console.debug("returning name table with languageID "+c[f]._lang),c[f]},e["OS/2"]={},e["OS/2"].parse=function(i,s,o){var a=e._bin.readUshort(i,s);s+=2;var c={};if(a==0)e["OS/2"].version0(i,s,c);else if(a==1)e["OS/2"].version1(i,s,c);else if(a==2||a==3||a==4)e["OS/2"].version2(i,s,c);else{if(a!=5)throw"unknown OS/2 table version: "+a;e["OS/2"].version5(i,s,c)}return c},e["OS/2"].version0=function(i,s,o){var a=e._bin;return o.xAvgCharWidth=a.readShort(i,s),s+=2,o.usWeightClass=a.readUshort(i,s),s+=2,o.usWidthClass=a.readUshort(i,s),s+=2,o.fsType=a.readUshort(i,s),s+=2,o.ySubscriptXSize=a.readShort(i,s),s+=2,o.ySubscriptYSize=a.readShort(i,s),s+=2,o.ySubscriptXOffset=a.readShort(i,s),s+=2,o.ySubscriptYOffset=a.readShort(i,s),s+=2,o.ySuperscriptXSize=a.readShort(i,s),s+=2,o.ySuperscriptYSize=a.readShort(i,s),s+=2,o.ySuperscriptXOffset=a.readShort(i,s),s+=2,o.ySuperscriptYOffset=a.readShort(i,s),s+=2,o.yStrikeoutSize=a.readShort(i,s),s+=2,o.yStrikeoutPosition=a.readShort(i,s),s+=2,o.sFamilyClass=a.readShort(i,s),s+=2,o.panose=a.readBytes(i,s,10),s+=10,o.ulUnicodeRange1=a.readUint(i,s),s+=4,o.ulUnicodeRange2=a.readUint(i,s),s+=4,o.ulUnicodeRange3=a.readUint(i,s),s+=4,o.ulUnicodeRange4=a.readUint(i,s),s+=4,o.achVendID=[a.readInt8(i,s),a.readInt8(i,s+1),a.readInt8(i,s+2),a.readInt8(i,s+3)],s+=4,o.fsSelection=a.readUshort(i,s),s+=2,o.usFirstCharIndex=a.readUshort(i,s),s+=2,o.usLastCharIndex=a.readUshort(i,s),s+=2,o.sTypoAscender=a.readShort(i,s),s+=2,o.sTypoDescender=a.readShort(i,s),s+=2,o.sTypoLineGap=a.readShort(i,s),s+=2,o.usWinAscent=a.readUshort(i,s),s+=2,o.usWinDescent=a.readUshort(i,s),s+=2},e["OS/2"].version1=function(i,s,o){var a=e._bin;return s=e["OS/2"].version0(i,s,o),o.ulCodePageRange1=a.readUint(i,s),s+=4,o.ulCodePageRange2=a.readUint(i,s),s+=4},e["OS/2"].version2=function(i,s,o){var a=e._bin;return s=e["OS/2"].version1(i,s,o),o.sxHeight=a.readShort(i,s),s+=2,o.sCapHeight=a.readShort(i,s),s+=2,o.usDefault=a.readUshort(i,s),s+=2,o.usBreak=a.readUshort(i,s),s+=2,o.usMaxContext=a.readUshort(i,s),s+=2},e["OS/2"].version5=function(i,s,o){var a=e._bin;return s=e["OS/2"].version2(i,s,o),o.usLowerOpticalPointSize=a.readUshort(i,s),s+=2,o.usUpperOpticalPointSize=a.readUshort(i,s),s+=2},e.post={},e.post.parse=function(i,s,o){var a=e._bin,c={};return c.version=a.readFixed(i,s),s+=4,c.italicAngle=a.readFixed(i,s),s+=4,c.underlinePosition=a.readShort(i,s),s+=2,c.underlineThickness=a.readShort(i,s),s+=2,c},e==null&&(e={}),e.U==null&&(e.U={}),e.U.codeToGlyph=function(i,s){var o=i.cmap,a=-1;if(o.p0e4!=null?a=o.p0e4:o.p3e1!=null?a=o.p3e1:o.p1e0!=null?a=o.p1e0:o.p0e3!=null&&(a=o.p0e3),a==-1)throw"no familiar platform and encoding!";var c=o.tables[a];if(c.format==0)return s>=c.map.length?0:c.map[s];if(c.format==4){for(var l=-1,f=0;f<c.endCount.length;f++)if(s<=c.endCount[f]){l=f;break}return l==-1||c.startCount[l]>s?0:65535&(c.idRangeOffset[l]!=0?c.glyphIdArray[s-c.startCount[l]+(c.idRangeOffset[l]>>1)-(c.idRangeOffset.length-l)]:s+c.idDelta[l])}if(c.format==12){if(s>c.groups[c.groups.length-1][1])return 0;for(f=0;f<c.groups.length;f++){var u=c.groups[f];if(u[0]<=s&&s<=u[1])return u[2]+(s-u[0])}return 0}throw"unknown cmap table format "+c.format},e.U.glyphToPath=function(i,s){var o={cmds:[],crds:[]};if(i.SVG&&i.SVG.entries[s]){var a=i.SVG.entries[s];return a==null?o:(typeof a=="string"&&(a=e.SVG.toPath(a),i.SVG.entries[s]=a),a)}if(i.CFF){var c={x:0,y:0,stack:[],nStems:0,haveWidth:!1,width:i.CFF.Private?i.CFF.Private.defaultWidthX:0,open:!1},l=i.CFF,f=i.CFF.Private;if(l.ROS){for(var u=0;l.FDSelect[u+2]<=s;)u+=2;f=l.FDArray[l.FDSelect[u+1]].Private}e.U._drawCFF(i.CFF.CharStrings[s],c,l,f,o)}else i.glyf&&e.U._drawGlyf(s,i,o);return o},e.U._drawGlyf=function(i,s,o){var a=s.glyf[i];a==null&&(a=s.glyf[i]=e.glyf._parseGlyf(s,i)),a!=null&&(a.noc>-1?e.U._simpleGlyph(a,o):e.U._compoGlyph(a,s,o))},e.U._simpleGlyph=function(i,s){for(var o=0;o<i.noc;o++){for(var a=o==0?0:i.endPts[o-1]+1,c=i.endPts[o],l=a;l<=c;l++){var f=l==a?c:l-1,u=l==c?a:l+1,h=1&i.flags[l],d=1&i.flags[f],g=1&i.flags[u],_=i.xs[l],m=i.ys[l];if(l==a)if(h){if(!d){e.U.P.moveTo(s,_,m);continue}e.U.P.moveTo(s,i.xs[f],i.ys[f])}else d?e.U.P.moveTo(s,i.xs[f],i.ys[f]):e.U.P.moveTo(s,(i.xs[f]+_)/2,(i.ys[f]+m)/2);h?d&&e.U.P.lineTo(s,_,m):g?e.U.P.qcurveTo(s,_,m,i.xs[u],i.ys[u]):e.U.P.qcurveTo(s,_,m,(_+i.xs[u])/2,(m+i.ys[u])/2)}e.U.P.closePath(s)}},e.U._compoGlyph=function(i,s,o){for(var a=0;a<i.parts.length;a++){var c={cmds:[],crds:[]},l=i.parts[a];e.U._drawGlyf(l.glyphIndex,s,c);for(var f=l.m,u=0;u<c.crds.length;u+=2){var h=c.crds[u],d=c.crds[u+1];o.crds.push(h*f.a+d*f.b+f.tx),o.crds.push(h*f.c+d*f.d+f.ty)}for(u=0;u<c.cmds.length;u++)o.cmds.push(c.cmds[u])}},e.U._getGlyphClass=function(i,s){var o=e._lctf.getInterval(s,i);return o==-1?0:s[o+2]},e.U._applySubs=function(i,s,o,a){for(var c=i.length-s-1,l=0;l<o.tabs.length;l++)if(o.tabs[l]!=null){var f,u=o.tabs[l];if(!u.coverage||(f=e._lctf.coverageIndex(u.coverage,i[s]))!=-1){if(o.ltype==1)i[s],u.fmt==1?i[s]=i[s]+u.delta:i[s]=u.newg[f];else if(o.ltype==4)for(var h=u.vals[f],d=0;d<h.length;d++){var g=h[d],_=g.chain.length;if(!(_>c)){for(var m=!0,p=0,y=0;y<_;y++){for(;i[s+p+(1+y)]==-1;)p++;g.chain[y]!=i[s+p+(1+y)]&&(m=!1)}if(m){for(i[s]=g.nglyph,y=0;y<_+p;y++)i[s+y+1]=-1;break}}}else if(o.ltype==5&&u.fmt==2)for(var b=e._lctf.getInterval(u.cDef,i[s]),v=u.cDef[b+2],C=u.scset[v],R=0;R<C.length;R++){var w=C[R],A=w.input;if(!(A.length>c)){for(m=!0,y=0;y<A.length;y++){var S=e._lctf.getInterval(u.cDef,i[s+1+y]);if(b==-1&&u.cDef[S+2]!=A[y]){m=!1;break}}if(m){var x=w.substLookupRecords;for(d=0;d<x.length;d+=2)x[d],x[d+1]}}}else if(o.ltype==6&&u.fmt==3){if(!e.U._glsCovered(i,u.backCvg,s-u.backCvg.length)||!e.U._glsCovered(i,u.inptCvg,s)||!e.U._glsCovered(i,u.ahedCvg,s+u.inptCvg.length))continue;var F=u.lookupRec;for(R=0;R<F.length;R+=2){b=F[R];var I=a[F[R+1]];e.U._applySubs(i,s+b,I,a)}}}}},e.U._glsCovered=function(i,s,o){for(var a=0;a<s.length;a++)if(e._lctf.coverageIndex(s[a],i[o+a])==-1)return!1;return!0},e.U.glyphsToPath=function(i,s,o){for(var a={cmds:[],crds:[]},c=0,l=0;l<s.length;l++){var f=s[l];if(f!=-1){for(var u=l<s.length-1&&s[l+1]!=-1?s[l+1]:0,h=e.U.glyphToPath(i,f),d=0;d<h.crds.length;d+=2)a.crds.push(h.crds[d]+c),a.crds.push(h.crds[d+1]);for(o&&a.cmds.push(o),d=0;d<h.cmds.length;d++)a.cmds.push(h.cmds[d]);o&&a.cmds.push("X"),c+=i.hmtx.aWidth[f],l<s.length-1&&(c+=e.U.getPairAdjustment(i,f,u))}}return a},e.U.P={},e.U.P.moveTo=function(i,s,o){i.cmds.push("M"),i.crds.push(s,o)},e.U.P.lineTo=function(i,s,o){i.cmds.push("L"),i.crds.push(s,o)},e.U.P.curveTo=function(i,s,o,a,c,l,f){i.cmds.push("C"),i.crds.push(s,o,a,c,l,f)},e.U.P.qcurveTo=function(i,s,o,a,c){i.cmds.push("Q"),i.crds.push(s,o,a,c)},e.U.P.closePath=function(i){i.cmds.push("Z")},e.U._drawCFF=function(i,s,o,a,c){for(var l=s.stack,f=s.nStems,u=s.haveWidth,h=s.width,d=s.open,g=0,_=s.x,m=s.y,p=0,y=0,b=0,v=0,C=0,R=0,w=0,A=0,S=0,x=0,F={val:0,size:0};g<i.length;){e.CFF.getCharString(i,g,F);var I=F.val;if(g+=F.size,I=="o1"||I=="o18")l.length%2!=0&&!u&&(h=l.shift()+a.nominalWidthX),f+=l.length>>1,l.length=0,u=!0;else if(I=="o3"||I=="o23")l.length%2!=0&&!u&&(h=l.shift()+a.nominalWidthX),f+=l.length>>1,l.length=0,u=!0;else if(I=="o4")l.length>1&&!u&&(h=l.shift()+a.nominalWidthX,u=!0),d&&e.U.P.closePath(c),m+=l.pop(),e.U.P.moveTo(c,_,m),d=!0;else if(I=="o5")for(;l.length>0;)_+=l.shift(),m+=l.shift(),e.U.P.lineTo(c,_,m);else if(I=="o6"||I=="o7")for(var E=l.length,P=I=="o6",O=0;O<E;O++){var U=l.shift();P?_+=U:m+=U,P=!P,e.U.P.lineTo(c,_,m)}else if(I=="o8"||I=="o24"){E=l.length;for(var B=0;B+6<=E;)p=_+l.shift(),y=m+l.shift(),b=p+l.shift(),v=y+l.shift(),_=b+l.shift(),m=v+l.shift(),e.U.P.curveTo(c,p,y,b,v,_,m),B+=6;I=="o24"&&(_+=l.shift(),m+=l.shift(),e.U.P.lineTo(c,_,m))}else{if(I=="o11")break;if(I=="o1234"||I=="o1235"||I=="o1236"||I=="o1237")I=="o1234"&&(y=m,b=(p=_+l.shift())+l.shift(),x=v=y+l.shift(),R=v,A=m,_=(w=(C=(S=b+l.shift())+l.shift())+l.shift())+l.shift(),e.U.P.curveTo(c,p,y,b,v,S,x),e.U.P.curveTo(c,C,R,w,A,_,m)),I=="o1235"&&(p=_+l.shift(),y=m+l.shift(),b=p+l.shift(),v=y+l.shift(),S=b+l.shift(),x=v+l.shift(),C=S+l.shift(),R=x+l.shift(),w=C+l.shift(),A=R+l.shift(),_=w+l.shift(),m=A+l.shift(),l.shift(),e.U.P.curveTo(c,p,y,b,v,S,x),e.U.P.curveTo(c,C,R,w,A,_,m)),I=="o1236"&&(p=_+l.shift(),y=m+l.shift(),b=p+l.shift(),x=v=y+l.shift(),R=v,w=(C=(S=b+l.shift())+l.shift())+l.shift(),A=R+l.shift(),_=w+l.shift(),e.U.P.curveTo(c,p,y,b,v,S,x),e.U.P.curveTo(c,C,R,w,A,_,m)),I=="o1237"&&(p=_+l.shift(),y=m+l.shift(),b=p+l.shift(),v=y+l.shift(),S=b+l.shift(),x=v+l.shift(),C=S+l.shift(),R=x+l.shift(),w=C+l.shift(),A=R+l.shift(),Math.abs(w-_)>Math.abs(A-m)?_=w+l.shift():m=A+l.shift(),e.U.P.curveTo(c,p,y,b,v,S,x),e.U.P.curveTo(c,C,R,w,A,_,m));else if(I=="o14"){if(l.length>0&&!u&&(h=l.shift()+o.nominalWidthX,u=!0),l.length==4){var z=l.shift(),X=l.shift(),V=l.shift(),N=l.shift(),q=e.CFF.glyphBySE(o,V),te=e.CFF.glyphBySE(o,N);e.U._drawCFF(o.CharStrings[q],s,o,a,c),s.x=z,s.y=X,e.U._drawCFF(o.CharStrings[te],s,o,a,c)}d&&(e.U.P.closePath(c),d=!1)}else if(I=="o19"||I=="o20")l.length%2!=0&&!u&&(h=l.shift()+a.nominalWidthX),f+=l.length>>1,l.length=0,u=!0,g+=f+7>>3;else if(I=="o21")l.length>2&&!u&&(h=l.shift()+a.nominalWidthX,u=!0),m+=l.pop(),_+=l.pop(),d&&e.U.P.closePath(c),e.U.P.moveTo(c,_,m),d=!0;else if(I=="o22")l.length>1&&!u&&(h=l.shift()+a.nominalWidthX,u=!0),_+=l.pop(),d&&e.U.P.closePath(c),e.U.P.moveTo(c,_,m),d=!0;else if(I=="o25"){for(;l.length>6;)_+=l.shift(),m+=l.shift(),e.U.P.lineTo(c,_,m);p=_+l.shift(),y=m+l.shift(),b=p+l.shift(),v=y+l.shift(),_=b+l.shift(),m=v+l.shift(),e.U.P.curveTo(c,p,y,b,v,_,m)}else if(I=="o26")for(l.length%2&&(_+=l.shift());l.length>0;)p=_,y=m+l.shift(),_=b=p+l.shift(),m=(v=y+l.shift())+l.shift(),e.U.P.curveTo(c,p,y,b,v,_,m);else if(I=="o27")for(l.length%2&&(m+=l.shift());l.length>0;)y=m,b=(p=_+l.shift())+l.shift(),v=y+l.shift(),_=b+l.shift(),m=v,e.U.P.curveTo(c,p,y,b,v,_,m);else if(I=="o10"||I=="o29"){var k=I=="o10"?a:o;if(l.length==0)console.debug("error: empty stack");else{var H=l.pop(),se=k.Subrs[H+k.Bias];s.x=_,s.y=m,s.nStems=f,s.haveWidth=u,s.width=h,s.open=d,e.U._drawCFF(se,s,o,a,c),_=s.x,m=s.y,f=s.nStems,u=s.haveWidth,h=s.width,d=s.open}}else if(I=="o30"||I=="o31"){var Y=l.length,ae=(B=0,I=="o31");for(B+=Y-(E=-3&Y);B<E;)ae?(y=m,b=(p=_+l.shift())+l.shift(),m=(v=y+l.shift())+l.shift(),E-B==5?(_=b+l.shift(),B++):_=b,ae=!1):(p=_,y=m+l.shift(),b=p+l.shift(),v=y+l.shift(),_=b+l.shift(),E-B==5?(m=v+l.shift(),B++):m=v,ae=!0),e.U.P.curveTo(c,p,y,b,v,_,m),B+=4}else{if((I+"").charAt(0)=="o")throw console.debug("Unknown operation: "+I,i),I;l.push(I)}}}s.x=_,s.y=m,s.nStems=f,s.haveWidth=u,s.width=h,s.open=d};var t=e,n={Typr:t};return r.Typr=t,r.default=n,Object.defineProperty(r,"__esModule",{value:!0}),r}({}).Typr}/*!
Custom bundle of woff2otf (https://github.com/arty-name/woff2otf) with fflate
(https://github.com/101arrowz/fflate) for use in Troika text rendering. 
Original licenses apply: 
- fflate: https://github.com/101arrowz/fflate/blob/master/LICENSE (MIT)
- woff2otf.js: https://github.com/arty-name/woff2otf/blob/master/woff2otf.js (Apache2)
*/function k1(){return function(r){var e=Uint8Array,t=Uint16Array,n=Uint32Array,i=new e([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),s=new e([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),o=new e([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(I,E){for(var P=new t(31),O=0;O<31;++O)P[O]=E+=1<<I[O-1];var U=new n(P[30]);for(O=1;O<30;++O)for(var B=P[O];B<P[O+1];++B)U[B]=B-P[O]<<5|O;return[P,U]},c=a(i,2),l=c[0],f=c[1];l[28]=258,f[258]=28;for(var u=a(s,0)[0],h=new t(32768),d=0;d<32768;++d){var g=(43690&d)>>>1|(21845&d)<<1;g=(61680&(g=(52428&g)>>>2|(13107&g)<<2))>>>4|(3855&g)<<4,h[d]=((65280&g)>>>8|(255&g)<<8)>>>1}var _=function(I,E,P){for(var O=I.length,U=0,B=new t(E);U<O;++U)++B[I[U]-1];var z,X=new t(E);for(U=0;U<E;++U)X[U]=X[U-1]+B[U-1]<<1;{z=new t(1<<E);var V=15-E;for(U=0;U<O;++U)if(I[U])for(var N=U<<4|I[U],q=E-I[U],te=X[I[U]-1]++<<q,k=te|(1<<q)-1;te<=k;++te)z[h[te]>>>V]=N}return z},m=new e(288);for(d=0;d<144;++d)m[d]=8;for(d=144;d<256;++d)m[d]=9;for(d=256;d<280;++d)m[d]=7;for(d=280;d<288;++d)m[d]=8;var p=new e(32);for(d=0;d<32;++d)p[d]=5;var y=_(m,9),b=_(p,5),v=function(I){for(var E=I[0],P=1;P<I.length;++P)I[P]>E&&(E=I[P]);return E},C=function(I,E,P){var O=E/8|0;return(I[O]|I[O+1]<<8)>>(7&E)&P},R=function(I,E){var P=E/8|0;return(I[P]|I[P+1]<<8|I[P+2]<<16)>>(7&E)},w=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],A=function(I,E,P){var O=new Error(E||w[I]);if(O.code=I,Error.captureStackTrace&&Error.captureStackTrace(O,A),!P)throw O;return O},S=function(I,E,P){var O=I.length;if(!O||P&&!P.l&&O<5)return E||new e(0);var U=!E||P,B=!P||P.i;P||(P={}),E||(E=new e(3*O));var z,X=function(pe){var Be=E.length;if(pe>Be){var ke=new e(Math.max(2*Be,pe));ke.set(E),E=ke}},V=P.f||0,N=P.p||0,q=P.b||0,te=P.l,k=P.d,H=P.m,se=P.n,Y=8*O;do{if(!te){P.f=V=C(I,N,1);var ae=C(I,N+1,3);if(N+=3,!ae){var Me=I[(Ee=((z=N)/8|0)+(7&z&&1)+4)-4]|I[Ee-3]<<8,Ae=Ee+Me;if(Ae>O){B&&A(0);break}U&&X(q+Me),E.set(I.subarray(Ee,Ae),q),P.b=q+=Me,P.p=N=8*Ae;continue}if(ae==1)te=y,k=b,H=9,se=5;else if(ae==2){var we=C(I,N,31)+257,he=C(I,N+10,15)+4,Ve=we+C(I,N+5,31)+1;N+=14;for(var W=new e(Ve),He=new e(19),Ie=0;Ie<he;++Ie)He[o[Ie]]=C(I,N+3*Ie,7);N+=3*he;var Fe=v(He),ue=(1<<Fe)-1,Ue=_(He,Fe);for(Ie=0;Ie<Ve;){var Ee,T=Ue[C(I,N,ue)];if(N+=15&T,(Ee=T>>>4)<16)W[Ie++]=Ee;else{var M=0,G=0;for(Ee==16?(G=3+C(I,N,3),N+=2,M=W[Ie-1]):Ee==17?(G=3+C(I,N,7),N+=3):Ee==18&&(G=11+C(I,N,127),N+=7);G--;)W[Ie++]=M}}var ee=W.subarray(0,we),ne=W.subarray(we);H=v(ee),se=v(ne),te=_(ee,H),k=_(ne,se)}else A(1);if(N>Y){B&&A(0);break}}U&&X(q+131072);for(var fe=(1<<H)-1,_e=(1<<se)-1,ge=N;;ge=N){var Se=(M=te[R(I,N)&fe])>>>4;if((N+=15&M)>Y){B&&A(0);break}if(M||A(2),Se<256)E[q++]=Se;else{if(Se==256){ge=N,te=null;break}var Oe=Se-254;if(Se>264){var ve=i[Ie=Se-257];Oe=C(I,N,(1<<ve)-1)+l[Ie],N+=ve}var Re=k[R(I,N)&_e],Ce=Re>>>4;if(Re||A(3),N+=15&Re,ne=u[Ce],Ce>3&&(ve=s[Ce],ne+=R(I,N)&(1<<ve)-1,N+=ve),N>Y){B&&A(0);break}U&&X(q+131072);for(var De=q+Oe;q<De;q+=4)E[q]=E[q-ne],E[q+1]=E[q+1-ne],E[q+2]=E[q+2-ne],E[q+3]=E[q+3-ne];q=De}}P.l=te,P.p=ge,P.b=q,te&&(V=1,P.m=H,P.d=k,P.n=se)}while(!V);return q==E.length?E:function(pe,Be,ke){(ke==null||ke>pe.length)&&(ke=pe.length);var it=new(pe instanceof t?t:pe instanceof n?n:e)(ke-Be);return it.set(pe.subarray(Be,ke)),it}(E,0,q)},x=new e(0),F=typeof TextDecoder!="undefined"&&new TextDecoder;try{F.decode(x,{stream:!0})}catch{}return r.convert_streams=function(I){var E=new DataView(I),P=0;function O(){var we=E.getUint16(P);return P+=2,we}function U(){var we=E.getUint32(P);return P+=4,we}function B(we){Me.setUint16(Ae,we),Ae+=2}function z(we){Me.setUint32(Ae,we),Ae+=4}for(var X={signature:U(),flavor:U(),length:U(),numTables:O(),reserved:O(),totalSfntSize:U(),majorVersion:O(),minorVersion:O(),metaOffset:U(),metaLength:U(),metaOrigLength:U(),privOffset:U(),privLength:U()},V=0;Math.pow(2,V)<=X.numTables;)V++;V--;for(var N=16*Math.pow(2,V),q=16*X.numTables-N,te=12,k=[],H=0;H<X.numTables;H++)k.push({tag:U(),offset:U(),compLength:U(),origLength:U(),origChecksum:U()}),te+=16;var se,Y=new Uint8Array(12+16*k.length+k.reduce(function(we,he){return we+he.origLength+4},0)),ae=Y.buffer,Me=new DataView(ae),Ae=0;return z(X.flavor),B(X.numTables),B(N),B(V),B(q),k.forEach(function(we){z(we.tag),z(we.origChecksum),z(te),z(we.origLength),we.outOffset=te,(te+=we.origLength)%4!=0&&(te+=4-te%4)}),k.forEach(function(we){var he,Ve=I.slice(we.offset,we.offset+we.compLength);if(we.compLength!=we.origLength){var W=new Uint8Array(we.origLength);he=new Uint8Array(Ve,2),S(he,W)}else W=new Uint8Array(Ve);Y.set(W,we.outOffset);var He=0;(te=we.outOffset+we.origLength)%4!=0&&(He=4-te%4),Y.set(new Uint8Array(He).buffer,we.outOffset+we.origLength),se=te+He}),ae.slice(0,se)},Object.defineProperty(r,"__esModule",{value:!0}),r}({}).convert_streams}function z1(r,e){const t={M:2,L:2,Q:4,C:6,Z:0},n={C:"18g,ca,368,1kz",D:"17k,6,2,2+4,5+c,2+6,2+1,10+1,9+f,j+11,2+1,a,2,2+1,15+2,3,j+2,6+3,2+8,2,2,2+1,w+a,4+e,3+3,2,3+2,3+5,23+w,2f+4,3,2+9,2,b,2+3,3,1k+9,6+1,3+1,2+2,2+d,30g,p+y,1,1+1g,f+x,2,sd2+1d,jf3+4,f+3,2+4,2+2,b+3,42,2,4+2,2+1,2,3,t+1,9f+w,2,el+2,2+g,d+2,2l,2+1,5,3+1,2+1,2,3,6,16wm+1v",R:"17m+3,2,2,6+3,m,15+2,2+2,h+h,13,3+8,2,2,3+1,2,p+1,x,5+4,5,a,2,2,3,u,c+2,g+1,5,2+1,4+1,5j,6+1,2,b,2+2,f,2+1,1s+2,2,3+1,7,1ez0,2,2+1,4+4,b,4,3,b,42,2+2,4,3,2+1,2,o+3,ae,ep,x,2o+2,3+1,3,5+1,6",L:"x9u,jff,a,fd,jv",T:"4t,gj+33,7o+4,1+1,7c+18,2,2+1,2+1,2,21+a,2,1b+k,h,2u+6,3+5,3+1,2+3,y,2,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,3,7,6+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+d,1,1+1,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,ek,3+1,r+4,1e+4,6+5,2p+c,1+3,1,1+2,1+b,2db+2,3y,2p+v,ff+3,30+1,n9x,1+2,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,5s,6y+2,ea,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+9,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2,2b+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,470+8,at4+4,1o+6,t5,1s+3,2a,f5l+1,2+3,43o+2,a+7,1+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,1,gzau,v+2n,3l+6n"},i=1,s=2,o=4,a=8,c=16,l=32;let f;function u(w){if(!f){const A={R:s,L:i,D:o,C:c,U:l,T:a};f=new Map;for(let S in n){let x=0;n[S].split(",").forEach(F=>{let[I,E]=F.split("+");I=parseInt(I,36),E=E?parseInt(E,36):0,f.set(x+=I,A[S]);for(let P=E;P--;)f.set(++x,A[S])})}}return f.get(w)||l}const h=1,d=2,g=3,_=4,m=[null,"isol","init","fina","medi"];function p(w){const A=new Uint8Array(w.length);let S=l,x=h,F=-1;for(let I=0;I<w.length;I++){const E=w.codePointAt(I);let P=u(E)|0,O=h;P&a||(S&(i|o|c)?P&(s|o|c)?(O=g,(x===h||x===g)&&A[F]++):P&(i|l)&&(x===d||x===_)&&A[F]--:S&(s|l)&&(x===d||x===_)&&A[F]--,x=A[I]=O,S=P,F=I,E>65535&&I++)}return A}function y(w,A){const S=[];for(let F=0;F<A.length;F++){const I=A.codePointAt(F);I>65535&&F++,S.push(r.U.codeToGlyph(w,I))}const x=w.GSUB;if(x){const{lookupList:F,featureList:I}=x;let E;const P=/^(rlig|liga|mset|isol|init|fina|medi|half|pres|blws|ccmp)$/,O=[];I.forEach(U=>{if(P.test(U.tag))for(let B=0;B<U.tab.length;B++){if(O[U.tab[B]])continue;O[U.tab[B]]=!0;const z=F[U.tab[B]],X=/^(isol|init|fina|medi)$/.test(U.tag);X&&!E&&(E=p(A));for(let V=0;V<S.length;V++)(!E||!X||m[E[V]]===U.tag)&&r.U._applySubs(S,V,z,F)}})}return S}function b(w,A){const S=new Int16Array(A.length*3);let x=0;for(;x<A.length;x++){const P=A[x];if(P===-1)continue;S[x*3+2]=w.hmtx.aWidth[P];const O=w.GPOS;if(O){const U=O.lookupList;for(let B=0;B<U.length;B++){const z=U[B];for(let X=0;X<z.tabs.length;X++){const V=z.tabs[X];if(z.ltype===1){if(r._lctf.coverageIndex(V.coverage,P)!==-1&&V.pos){E(V.pos,x);break}}else if(z.ltype===2){let N=null,q=F();if(q!==-1){const te=r._lctf.coverageIndex(V.coverage,A[q]);if(te!==-1){if(V.fmt===1){const k=V.pairsets[te];for(let H=0;H<k.length;H++)k[H].gid2===P&&(N=k[H])}else if(V.fmt===2){const k=r.U._getGlyphClass(A[q],V.classDef1),H=r.U._getGlyphClass(P,V.classDef2);N=V.matrix[k][H]}if(N){N.val1&&E(N.val1,q),N.val2&&E(N.val2,x);break}}}}else if(z.ltype===4){const N=r._lctf.coverageIndex(V.markCoverage,P);if(N!==-1){const q=F(I),te=q===-1?-1:r._lctf.coverageIndex(V.baseCoverage,A[q]);if(te!==-1){const k=V.markArray[N],H=V.baseArray[te][k.markClass];S[x*3]=H.x-k.x+S[q*3]-S[q*3+2],S[x*3+1]=H.y-k.y+S[q*3+1];break}}}else if(z.ltype===6){const N=r._lctf.coverageIndex(V.mark1Coverage,P);if(N!==-1){const q=F();if(q!==-1){const te=A[q];if(v(w,te)===3){const k=r._lctf.coverageIndex(V.mark2Coverage,te);if(k!==-1){const H=V.mark1Array[N],se=V.mark2Array[k][H.markClass];S[x*3]=se.x-H.x+S[q*3]-S[q*3+2],S[x*3+1]=se.y-H.y+S[q*3+1];break}}}}}}}}else if(w.kern&&!w.cff){const U=F();if(U!==-1){const B=w.kern.glyph1.indexOf(A[U]);if(B!==-1){const z=w.kern.rval[B].glyph2.indexOf(P);z!==-1&&(S[U*3+2]+=w.kern.rval[B].vals[z])}}}}return S;function F(P){for(let O=x-1;O>=0;O--)if(A[O]!==-1&&(!P||P(A[O])))return O;return-1}function I(P){return v(w,P)===1}function E(P,O){for(let U=0;U<3;U++)S[O*3+U]+=P[U]||0}}function v(w,A){const S=w.GDEF&&w.GDEF.glyphClassDef;return S?r.U._getGlyphClass(A,S):0}function C(...w){for(let A=0;A<w.length;A++)if(typeof w[A]=="number")return w[A]}function R(w){const A=Object.create(null),S=w["OS/2"],x=w.hhea,F=w.head.unitsPerEm,I=C(S&&S.sTypoAscender,x&&x.ascender,F),E={unitsPerEm:F,ascender:I,descender:C(S&&S.sTypoDescender,x&&x.descender,0),capHeight:C(S&&S.sCapHeight,I),xHeight:C(S&&S.sxHeight,I),lineGap:C(S&&S.sTypoLineGap,x&&x.lineGap),supportsCodePoint(P){return r.U.codeToGlyph(w,P)>0},forEachGlyph(P,O,U,B){let z=0;const X=1/E.unitsPerEm*O,V=y(w,P);let N=0;const q=b(w,V);return V.forEach((te,k)=>{if(te!==-1){let H=A[te];if(!H){const{cmds:se,crds:Y}=r.U.glyphToPath(w,te);let ae="",Me=0;for(let W=0,He=se.length;W<He;W++){const Ie=t[se[W]];ae+=se[W];for(let Fe=1;Fe<=Ie;Fe++)ae+=(Fe>1?",":"")+Y[Me++]}let Ae,we,he,Ve;if(Y.length){Ae=we=1/0,he=Ve=-1/0;for(let W=0,He=Y.length;W<He;W+=2){let Ie=Y[W],Fe=Y[W+1];Ie<Ae&&(Ae=Ie),Fe<we&&(we=Fe),Ie>he&&(he=Ie),Fe>Ve&&(Ve=Fe)}}else Ae=he=we=Ve=0;H=A[te]={index:te,advanceWidth:w.hmtx.aWidth[te],xMin:Ae,yMin:we,xMax:he,yMax:Ve,path:ae}}B.call(null,H,z+q[k*3]*X,q[k*3+1]*X,N),z+=q[k*3+2]*X,U&&(z+=U*O)}N+=P.codePointAt(N)>65535?2:1}),z}};return E}return function(A){const S=new Uint8Array(A,0,4),x=r._bin.readASCII(S,0,4);if(x==="wOFF")A=e(A);else if(x==="wOF2")throw new Error("woff2 fonts not supported");return R(r.parse(A)[0])}}const G1=zs({name:"Typr Font Parser",dependencies:[B1,k1,z1],init(r,e,t){const n=r(),i=e();return t(n,i)}});/*!
Custom bundle of @unicode-font-resolver/client v1.0.2 (https://github.com/lojjic/unicode-font-resolver)
for use in Troika text rendering. 
Original MIT license applies
*/function V1(){return function(r){var e=function(){this.buckets=new Map};e.prototype.add=function(b){var v=b>>5;this.buckets.set(v,(this.buckets.get(v)||0)|1<<(31&b))},e.prototype.has=function(b){var v=this.buckets.get(b>>5);return v!==void 0&&(v&1<<(31&b))!=0},e.prototype.serialize=function(){var b=[];return this.buckets.forEach(function(v,C){b.push((+C).toString(36)+":"+v.toString(36))}),b.join(",")},e.prototype.deserialize=function(b){var v=this;this.buckets.clear(),b.split(",").forEach(function(C){var R=C.split(":");v.buckets.set(parseInt(R[0],36),parseInt(R[1],36))})};var t=Math.pow(2,8),n=t-1,i=~n;function s(b){var v=function(R){return R&i}(b).toString(16),C=function(R){return(R&i)+t-1}(b).toString(16);return"codepoint-index/plane"+(b>>16)+"/"+v+"-"+C+".json"}function o(b,v){var C=b&n,R=v.codePointAt(C/6|0);return((R=(R||48)-48)&1<<C%6)!=0}function a(b,v){var C;(C=b,C.replace(/U\+/gi,"").replace(/^,+|,+$/g,"").split(/,+/).map(function(R){return R.split("-").map(function(w){return parseInt(w.trim(),16)})})).forEach(function(R){var w=R[0],A=R[1];A===void 0&&(A=w),v(w,A)})}function c(b,v){a(b,function(C,R){for(var w=C;w<=R;w++)v(w)})}var l={},f={},u=new WeakMap,h="https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data";function d(b){var v=u.get(b);return v||(v=new e,c(b.ranges,function(C){return v.add(C)}),u.set(b,v)),v}var g,_=new Map;function m(b,v,C){return b[v]?v:b[C]?C:function(R){for(var w in R)return w}(b)}function p(b,v){var C=v;if(!b.includes(C)){C=1/0;for(var R=0;R<b.length;R++)Math.abs(b[R]-v)<Math.abs(C-v)&&(C=b[R])}return C}function y(b){return g||(g=new Set,c("9-D,20,85,A0,1680,2000-200A,2028-202F,205F,3000",function(v){g.add(v)})),g.has(b)}return r.CodePointSet=e,r.clearCache=function(){l={},f={}},r.getFontsForString=function(b,v){v===void 0&&(v={});var C,R=v.lang;R===void 0&&(R=/\p{Script=Hangul}/u.test(C=b)?"ko":/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(C)?"ja":"en");var w=v.category;w===void 0&&(w="sans-serif");var A=v.style;A===void 0&&(A="normal");var S=v.weight;S===void 0&&(S=400);var x=(v.dataUrl||h).replace(/\/$/g,""),F=new Map,I=new Uint8Array(b.length),E={},P={},O=new Array(b.length),U=new Map,B=!1;function z(N){var q=_.get(N);return q||(q=fetch(x+"/"+N).then(function(te){if(!te.ok)throw new Error(te.statusText);return te.json().then(function(k){if(!Array.isArray(k)||k[0]!==1)throw new Error("Incorrect schema version; need 1, got "+k[0]);return k[1]})}).catch(function(te){if(x!==h)return B||(console.error('unicode-font-resolver: Failed loading from dataUrl "'+x+'", trying default CDN. '+te.message),B=!0),x=h,_.delete(N),z(N);throw te}),_.set(N,q)),q}for(var X=function(N){var q=b.codePointAt(N),te=s(q);O[N]=te,l[te]||U.has(te)||U.set(te,z(te).then(function(k){l[te]=k})),q>65535&&(N++,V=N)},V=0;V<b.length;V++)X(V);return Promise.all(U.values()).then(function(){U.clear();for(var N=function(te){var k=b.codePointAt(te),H=null,se=l[O[te]],Y=void 0;for(var ae in se){var Me=P[ae];if(Me===void 0&&(Me=P[ae]=new RegExp(ae).test(R||"en")),Me){for(var Ae in Y=ae,se[ae])if(o(k,se[ae][Ae])){H=Ae;break}break}}if(!H){e:for(var we in se)if(we!==Y){for(var he in se[we])if(o(k,se[we][he])){H=he;break e}}}H||(console.debug("No font coverage for U+"+k.toString(16)),H="latin"),O[te]=H,f[H]||U.has(H)||U.set(H,z("font-meta/"+H+".json").then(function(Ve){f[H]=Ve})),k>65535&&(te++,q=te)},q=0;q<b.length;q++)N(q);return Promise.all(U.values())}).then(function(){for(var N,q=null,te=0;te<b.length;te++){var k=b.codePointAt(te);if(q&&(y(k)||d(q).has(k)))I[te]=I[te-1];else{q=f[O[te]];var H=E[q.id];if(!H){var se=q.typeforms,Y=m(se,w,"sans-serif"),ae=m(se[Y],A,"normal"),Me=p((N=se[Y])===null||N===void 0?void 0:N[ae],S);H=E[q.id]=x+"/font-files/"+q.id+"/"+Y+"."+ae+"."+Me+".woff"}var Ae=F.get(H);Ae==null&&(Ae=F.size,F.set(H,Ae)),I[te]=Ae}k>65535&&(te++,I[te]=I[te-1])}return{fontUrls:Array.from(F.keys()),chars:I}})},Object.defineProperty(r,"__esModule",{value:!0}),r}({})}function H1(r,e){const t=Object.create(null),n=Object.create(null);function i(o,a){const c=l=>{console.error(`Failure loading font ${o}`,l)};try{const l=new XMLHttpRequest;l.open("get",o,!0),l.responseType="arraybuffer",l.onload=function(){if(l.status>=400)c(new Error(l.statusText));else if(l.status>0)try{const f=r(l.response);f.src=o,a(f)}catch(f){c(f)}},l.onerror=c,l.send()}catch(l){c(l)}}function s(o,a){let c=t[o];c?a(c):n[o]?n[o].push(a):(n[o]=[a],i(o,l=>{l.src=o,t[o]=l,n[o].forEach(f=>f(l)),delete n[o]}))}return function(o,a,{lang:c,fonts:l=[],style:f="normal",weight:u="normal",unicodeFontsURL:h}={}){const d=new Uint8Array(o.length),g=[];o.length||y();const _=new Map,m=[];if(f!=="italic"&&(f="normal"),typeof u!="number"&&(u=u==="bold"?700:400),l&&!Array.isArray(l)&&(l=[l]),l=l.slice().filter(v=>!v.lang||v.lang.test(c)).reverse(),l.length){let w=0;(function A(S=0){for(let x=S,F=o.length;x<F;x++){const I=o.codePointAt(x);if(w===1&&g[d[x-1]].supportsCodePoint(I)||x>0&&/\s/.test(o[x]))d[x]=d[x-1],w===2&&(m[m.length-1][1]=x);else for(let E=d[x],P=l.length;E<=P;E++)if(E===P){const O=w===2?m[m.length-1]:m[m.length]=[x,x];O[1]=x,w=2}else{d[x]=E;const{src:O,unicodeRange:U}=l[E];if(!U||b(I,U)){const B=t[O];if(!B){s(O,()=>{A(x)});return}if(B.supportsCodePoint(I)){let z=_.get(B);typeof z!="number"&&(z=g.length,g.push(B),_.set(B,z)),d[x]=z,w=1;break}}}I>65535&&x+1<F&&(d[x+1]=d[x],x++,w===2&&(m[m.length-1][1]=x))}p()})()}else m.push([0,o.length-1]),p();function p(){if(m.length){const v=m.map(C=>o.substring(C[0],C[1]+1)).join(`
`);e.getFontsForString(v,{lang:c||void 0,style:f,weight:u,dataUrl:h}).then(({fontUrls:C,chars:R})=>{const w=g.length;let A=0;m.forEach(x=>{for(let F=0,I=x[1]-x[0];F<=I;F++)d[x[0]+F]=R[A++]+w;A++});let S=0;C.forEach((x,F)=>{s(x,I=>{g[F+w]=I,++S===C.length&&y()})})})}else y()}function y(){a({chars:d,fonts:g})}function b(v,C){for(let R=0;R<C.length;R++){const[w,A=w]=C[R];if(w<=v&&v<=A)return!0}return!1}}}const W1=zs({name:"FontResolver",dependencies:[H1,G1,V1],init(r,e,t){return r(e,t())}});function X1(r,e){const n=/[\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/,i="[^\\S\\u00A0]",s=new RegExp(`${i}|[\\-\\u007C\\u00AD\\u2010\\u2012-\\u2014\\u2027\\u2056\\u2E17\\u2E40]`);function o({text:g,lang:_,fonts:m,style:p,weight:y,preResolvedFonts:b,unicodeFontsURL:v},C){const R=({chars:w,fonts:A})=>{let S,x;const F=[];for(let I=0;I<w.length;I++)w[I]!==x?(x=w[I],F.push(S={start:I,end:I,fontObj:A[w[I]]})):S.end=I;C(F)};b?R(b):r(g,R,{lang:_,fonts:m,style:p,weight:y,unicodeFontsURL:v})}function a({text:g="",font:_,lang:m,sdfGlyphSize:p=64,fontSize:y=400,fontWeight:b=1,fontStyle:v="normal",letterSpacing:C=0,lineHeight:R="normal",maxWidth:w=1/0,direction:A,textAlign:S="left",textIndent:x=0,whiteSpace:F="normal",overflowWrap:I="normal",anchorX:E=0,anchorY:P=0,metricsOnly:O=!1,unicodeFontsURL:U,preResolvedFonts:B=null,includeCaretPositions:z=!1,chunkedBoundsSize:X=8192,colorRanges:V=null},N){const q=u(),te={fontLoad:0,typesetting:0};g.indexOf("\r")>-1&&(console.info("Typesetter: got text with \\r chars; normalizing to \\n"),g=g.replace(/\r\n/g,`
`).replace(/\r/g,`
`)),y=+y,C=+C,w=+w,R=R||"normal",x=+x,o({text:g,lang:m,style:v,weight:b,fonts:typeof _=="string"?[{src:_}]:_,unicodeFontsURL:U,preResolvedFonts:B},k=>{te.fontLoad=u()-q;const H=isFinite(w);let se=null,Y=null,ae=null,Me=null,Ae=null,we=null,he=null,Ve=null,W=0,He=0,Ie=F!=="nowrap";const Fe=new Map,ue=u();let Ue=x,Ee=0,T=new h;const M=[T];k.forEach(_e=>{const{fontObj:ge}=_e,{ascender:Se,descender:Oe,unitsPerEm:ve,lineGap:Re,capHeight:Ce,xHeight:De}=ge;let pe=Fe.get(ge);if(!pe){const xe=y/ve,re=R==="normal"?(Se-Oe+Re)*xe:R*y,ye=(re-(Se-Oe)*xe)/2,Te=Math.min(re,(Se-Oe)*xe),be=(Se+Oe)/2*xe+Te/2;pe={index:Fe.size,src:ge.src,fontObj:ge,fontSizeMult:xe,unitsPerEm:ve,ascender:Se*xe,descender:Oe*xe,capHeight:Ce*xe,xHeight:De*xe,lineHeight:re,baseline:-ye-Se*xe,caretTop:be,caretBottom:be-Te},Fe.set(ge,pe)}const{fontSizeMult:Be}=pe,ke=g.slice(_e.start,_e.end+1);let it,j;ge.forEachGlyph(ke,y,C,(xe,re,ye,Te)=>{re+=Ee,Te+=_e.start,it=re,j=xe;const be=g.charAt(Te),Ge=xe.advanceWidth*Be,Ze=T.count;let je;if("isEmpty"in xe||(xe.isWhitespace=!!be&&new RegExp(i).test(be),xe.canBreakAfter=!!be&&s.test(be),xe.isEmpty=xe.xMin===xe.xMax||xe.yMin===xe.yMax||n.test(be)),!xe.isWhitespace&&!xe.isEmpty&&He++,Ie&&H&&!xe.isWhitespace&&re+Ge+Ue>w&&Ze){if(T.glyphAt(Ze-1).glyphObj.canBreakAfter)je=new h,Ue=-re;else for(let Et=Ze;Et--;)if(Et===0&&I==="break-word"){je=new h,Ue=-re;break}else if(T.glyphAt(Et).glyphObj.canBreakAfter){je=T.splitAt(Et+1);const bt=je.glyphAt(0).x;Ue-=bt;for(let Ct=je.count;Ct--;)je.glyphAt(Ct).x-=bt;break}je&&(T.isSoftWrapped=!0,T=je,M.push(T),W=w)}let $e=T.glyphAt(T.count);$e.glyphObj=xe,$e.x=re+Ue,$e.y=ye,$e.width=Ge,$e.charIndex=Te,$e.fontData=pe,be===`
`&&(T=new h,M.push(T),Ue=-(re+Ge+C*y)+x)}),Ee=it+j.advanceWidth*Be+C*y});let G=0;M.forEach(_e=>{let ge=!0;for(let Se=_e.count;Se--;){const Oe=_e.glyphAt(Se);ge&&!Oe.glyphObj.isWhitespace&&(_e.width=Oe.x+Oe.width,_e.width>W&&(W=_e.width),ge=!1);let{lineHeight:ve,capHeight:Re,xHeight:Ce,baseline:De}=Oe.fontData;ve>_e.lineHeight&&(_e.lineHeight=ve);const pe=De-_e.baseline;pe<0&&(_e.baseline+=pe,_e.cap+=pe,_e.ex+=pe),_e.cap=Math.max(_e.cap,_e.baseline+Re),_e.ex=Math.max(_e.ex,_e.baseline+Ce)}_e.baseline-=G,_e.cap-=G,_e.ex-=G,G+=_e.lineHeight});let ee=0,ne=0;if(E&&(typeof E=="number"?ee=-E:typeof E=="string"&&(ee=-W*(E==="left"?0:E==="center"?.5:E==="right"?1:l(E)))),P&&(typeof P=="number"?ne=-P:typeof P=="string"&&(ne=P==="top"?0:P==="top-baseline"?-M[0].baseline:P==="top-cap"?-M[0].cap:P==="top-ex"?-M[0].ex:P==="middle"?G/2:P==="bottom"?G:P==="bottom-baseline"?-M[M.length-1].baseline:l(P)*G)),!O){const _e=e.getEmbeddingLevels(g,A);se=new Uint16Array(He),Y=new Uint8Array(He),ae=new Float32Array(He*2),Me={},he=[1/0,1/0,-1/0,-1/0],Ve=[],z&&(we=new Float32Array(g.length*4)),V&&(Ae=new Uint8Array(He*3));let ge=0,Se=-1,Oe=-1,ve,Re;if(M.forEach((Ce,De)=>{let{count:pe,width:Be}=Ce;if(pe>0){let ke=0;for(let Te=pe;Te--&&Ce.glyphAt(Te).glyphObj.isWhitespace;)ke++;let it=0,j=0;if(S==="center")it=(W-Be)/2;else if(S==="right")it=W-Be;else if(S==="justify"&&Ce.isSoftWrapped){let Te=0;for(let be=pe-ke;be--;)Ce.glyphAt(be).glyphObj.isWhitespace&&Te++;j=(W-Be)/Te}if(j||it){let Te=0;for(let be=0;be<pe;be++){let Ge=Ce.glyphAt(be);const Ze=Ge.glyphObj;Ge.x+=it+Te,j!==0&&Ze.isWhitespace&&be<pe-ke&&(Te+=j,Ge.width+=j)}}const xe=e.getReorderSegments(g,_e,Ce.glyphAt(0).charIndex,Ce.glyphAt(Ce.count-1).charIndex);for(let Te=0;Te<xe.length;Te++){const[be,Ge]=xe[Te];let Ze=1/0,je=-1/0;for(let $e=0;$e<pe;$e++)if(Ce.glyphAt($e).charIndex>=be){let Et=$e,bt=$e;for(;bt<pe;bt++){let Ct=Ce.glyphAt(bt);if(Ct.charIndex>Ge)break;bt<pe-ke&&(Ze=Math.min(Ze,Ct.x),je=Math.max(je,Ct.x+Ct.width))}for(let Ct=Et;Ct<bt;Ct++){const ln=Ce.glyphAt(Ct);ln.x=je-(ln.x+ln.width-Ze)}break}}let re;const ye=Te=>re=Te;for(let Te=0;Te<pe;Te++){const be=Ce.glyphAt(Te);re=be.glyphObj;const Ge=re.index,Ze=_e.levels[be.charIndex]&1;if(Ze){const je=e.getMirroredCharacter(g[be.charIndex]);je&&be.fontData.fontObj.forEachGlyph(je,0,0,ye)}if(z){const{charIndex:je,fontData:$e}=be,Et=be.x+ee,bt=be.x+be.width+ee;we[je*4]=Ze?bt:Et,we[je*4+1]=Ze?Et:bt,we[je*4+2]=Ce.baseline+$e.caretBottom+ne,we[je*4+3]=Ce.baseline+$e.caretTop+ne;const Ct=je-Se;Ct>1&&f(we,Se,Ct),Se=je}if(V){const{charIndex:je}=be;for(;je>Oe;)Oe++,V.hasOwnProperty(Oe)&&(Re=V[Oe])}if(!re.isWhitespace&&!re.isEmpty){const je=ge++,{fontSizeMult:$e,src:Et,index:bt}=be.fontData,Ct=Me[Et]||(Me[Et]={});Ct[Ge]||(Ct[Ge]={path:re.path,pathBounds:[re.xMin,re.yMin,re.xMax,re.yMax]});const ln=be.x+ee,Jt=be.y+Ce.baseline+ne;ae[je*2]=ln,ae[je*2+1]=Jt;const bn=ln+re.xMin*$e,Vn=Jt+re.yMin*$e,ai=ln+re.xMax*$e,fn=Jt+re.yMax*$e;bn<he[0]&&(he[0]=bn),Vn<he[1]&&(he[1]=Vn),ai>he[2]&&(he[2]=ai),fn>he[3]&&(he[3]=fn),je%X===0&&(ve={start:je,end:je,rect:[1/0,1/0,-1/0,-1/0]},Ve.push(ve)),ve.end++;const zt=ve.rect;if(bn<zt[0]&&(zt[0]=bn),Vn<zt[1]&&(zt[1]=Vn),ai>zt[2]&&(zt[2]=ai),fn>zt[3]&&(zt[3]=fn),se[je]=Ge,Y[je]=bt,V){const On=je*3;Ae[On]=Re>>16&255,Ae[On+1]=Re>>8&255,Ae[On+2]=Re&255}}}}}),we){const Ce=g.length-Se;Ce>1&&f(we,Se,Ce)}}const fe=[];Fe.forEach(({index:_e,src:ge,unitsPerEm:Se,ascender:Oe,descender:ve,lineHeight:Re,capHeight:Ce,xHeight:De})=>{fe[_e]={src:ge,unitsPerEm:Se,ascender:Oe,descender:ve,lineHeight:Re,capHeight:Ce,xHeight:De}}),te.typesetting=u()-ue,N({glyphIds:se,glyphFontIndices:Y,glyphPositions:ae,glyphData:Me,fontData:fe,caretPositions:we,glyphColors:Ae,chunkedBounds:Ve,fontSize:y,topBaseline:ne+M[0].baseline,blockBounds:[ee,ne-G,ee+W,ne],visibleBounds:he,timings:te})})}function c(g,_){a({...g,metricsOnly:!0},m=>{const[p,y,b,v]=m.blockBounds;_({width:b-p,height:v-y})})}function l(g){let _=g.match(/^([\d.]+)%$/),m=_?parseFloat(_[1]):NaN;return isNaN(m)?0:m/100}function f(g,_,m){const p=g[_*4],y=g[_*4+1],b=g[_*4+2],v=g[_*4+3],C=(y-p)/m;for(let R=0;R<m;R++){const w=(_+R)*4;g[w]=p+C*R,g[w+1]=p+C*(R+1),g[w+2]=b,g[w+3]=v}}function u(){return(self.performance||Date).now()}function h(){this.data=[]}const d=["glyphObj","x","y","width","charIndex","fontData"];return h.prototype={width:0,lineHeight:0,baseline:0,cap:0,ex:0,isSoftWrapped:!1,get count(){return Math.ceil(this.data.length/d.length)},glyphAt(g){let _=h.flyweight;return _.data=this.data,_.index=g,_},splitAt(g){let _=new h;return _.data=this.data.splice(g*d.length),_}},h.flyweight=d.reduce((g,_,m,p)=>(Object.defineProperty(g,_,{get(){return this.data[this.index*d.length+m]},set(y){this.data[this.index*d.length+m]=y}}),g),{data:null,index:0}),{typeset:a,measure:c}}const Cr=()=>(self.performance||Date).now(),Sc=gg();let Ud;function q1(r,e,t,n,i,s,o,a,c,l,f=!0){return f?$1(r,e,t,n,i,s,o,a,c,l).then(null,u=>(Ud||(console.warn("WebGL SDF generation failed, falling back to JS",u),Ud=!0),Ld(r,e,t,n,i,s,o,a,c,l))):Ld(r,e,t,n,i,s,o,a,c,l)}const Wa=[],j1=5;let Gf=0;function vg(){const r=Cr();for(;Wa.length&&Cr()-r<j1;)Wa.shift()();Gf=Wa.length?setTimeout(vg,0):0}const $1=(...r)=>new Promise((e,t)=>{Wa.push(()=>{const n=Cr();try{Sc.webgl.generateIntoCanvas(...r),e({timing:Cr()-n})}catch(i){t(i)}}),Gf||(Gf=setTimeout(vg,0))}),Y1=4,K1=2e3,Id={};let J1=0;function Ld(r,e,t,n,i,s,o,a,c,l){const f="TroikaTextSDFGenerator_JS_"+J1++%Y1;let u=Id[f];return u||(u=Id[f]={workerModule:zs({name:f,workerId:f,dependencies:[gg,Cr],init(h,d){const g=h().javascript.generate;return function(..._){const m=d();return{textureData:g(..._),timing:d()-m}}},getTransferables(h){return[h.textureData.buffer]}}),requests:0,idleTimer:null}),u.requests++,clearTimeout(u.idleTimer),u.workerModule(r,e,t,n,i,s).then(({textureData:h,timing:d})=>{const g=Cr(),_=new Uint8Array(h.length*4);for(let m=0;m<h.length;m++)_[m*4+l]=h[m];return Sc.webglUtils.renderImageData(o,_,a,c,r,e,1<<3-l),d+=Cr()-g,--u.requests===0&&(u.idleTimer=setTimeout(()=>{R1(f)},K1)),{timing:d}})}function Z1(r){r._warm||(Sc.webgl.isSupported(r),r._warm=!0)}const Q1=Sc.webglUtils.resizeWebGLCanvasWithoutClearing,fo={unicodeFontsURL:null,sdfGlyphSize:64,sdfMargin:1/16,sdfExponent:9,textureWidth:2048},eb=new et;function cs(){return(self.performance||Date).now()}const Fd=Object.create(null);function tb(r,e){r=ib({},r);const t=cs(),n=[];if(r.font&&n.push({label:"user",src:rb(r.font)}),r.font=n,r.text=""+r.text,r.sdfGlyphSize=r.sdfGlyphSize||fo.sdfGlyphSize,r.unicodeFontsURL=r.unicodeFontsURL||fo.unicodeFontsURL,r.colorRanges!=null){let h={};for(let d in r.colorRanges)if(r.colorRanges.hasOwnProperty(d)){let g=r.colorRanges[d];typeof g!="number"&&(g=eb.set(g).getHex()),h[d]=g}r.colorRanges=h}Object.freeze(r);const{textureWidth:i,sdfExponent:s}=fo,{sdfGlyphSize:o}=r,a=i/o*4;let c=Fd[o];if(!c){const h=document.createElement("canvas");h.width=i,h.height=o*256/a,c=Fd[o]={glyphCount:0,sdfGlyphSize:o,sdfCanvas:h,sdfTexture:new cn(h,void 0,void 0,void 0,zn,zn),contextLost:!1,glyphsByFont:new Map},c.sdfTexture.generateMipmaps=!1,nb(c)}const{sdfTexture:l,sdfCanvas:f}=c;Sg(r).then(h=>{const{glyphIds:d,glyphFontIndices:g,fontData:_,glyphPositions:m,fontSize:p,timings:y}=h,b=[],v=new Float32Array(d.length*4);let C=0,R=0;const w=cs(),A=_.map(E=>{let P=c.glyphsByFont.get(E.src);return P||c.glyphsByFont.set(E.src,P=new Map),P});d.forEach((E,P)=>{const O=g[P],{src:U,unitsPerEm:B}=_[O];let z=A[O].get(E);if(!z){const{path:te,pathBounds:k}=h.glyphData[U][E],H=Math.max(k[2]-k[0],k[3]-k[1])/o*(fo.sdfMargin*o+.5),se=c.glyphCount++,Y=[k[0]-H,k[1]-H,k[2]+H,k[3]+H];A[O].set(E,z={path:te,atlasIndex:se,sdfViewBox:Y}),b.push(z)}const{sdfViewBox:X}=z,V=m[R++],N=m[R++],q=p/B;v[C++]=V+X[0]*q,v[C++]=N+X[1]*q,v[C++]=V+X[2]*q,v[C++]=N+X[3]*q,d[P]=z.atlasIndex}),y.quads=(y.quads||0)+(cs()-w);const S=cs();y.sdf={};const x=f.height,F=Math.ceil(c.glyphCount/a),I=Math.pow(2,Math.ceil(Math.log2(F*o)));I>x&&(console.info(`Increasing SDF texture size ${x}->${I}`),Q1(f,i,I),l.dispose()),Promise.all(b.map(E=>xg(E,c,r.gpuAccelerateSDF).then(({timing:P})=>{y.sdf[E.atlasIndex]=P}))).then(()=>{b.length&&!c.contextLost&&(yg(c),l.needsUpdate=!0),y.sdfTotal=cs()-S,y.total=cs()-t,e(Object.freeze({parameters:r,sdfTexture:l,sdfGlyphSize:o,sdfExponent:s,glyphBounds:v,glyphAtlasIndices:d,glyphColors:h.glyphColors,caretPositions:h.caretPositions,chunkedBounds:h.chunkedBounds,ascender:h.ascender,descender:h.descender,lineHeight:h.lineHeight,capHeight:h.capHeight,xHeight:h.xHeight,topBaseline:h.topBaseline,blockBounds:h.blockBounds,visibleBounds:h.visibleBounds,timings:h.timings}))})}),Promise.resolve().then(()=>{c.contextLost||Z1(f)})}function xg({path:r,atlasIndex:e,sdfViewBox:t},{sdfGlyphSize:n,sdfCanvas:i,contextLost:s},o){if(s)return Promise.resolve({timing:-1});const{textureWidth:a,sdfExponent:c}=fo,l=Math.max(t[2]-t[0],t[3]-t[1]),f=Math.floor(e/4),u=f%(a/n)*n,h=Math.floor(f/(a/n))*n,d=e%4;return q1(n,n,r,t,l,c,i,u,h,d,o)}function nb(r){const e=r.sdfCanvas;e.addEventListener("webglcontextlost",t=>{console.log("Context Lost",t),t.preventDefault(),r.contextLost=!0}),e.addEventListener("webglcontextrestored",t=>{console.log("Context Restored",t),r.contextLost=!1;const n=[];r.glyphsByFont.forEach(i=>{i.forEach(s=>{n.push(xg(s,r,!0))})}),Promise.all(n).then(()=>{yg(r),r.sdfTexture.needsUpdate=!0})})}function ib(r,e){for(let t in e)e.hasOwnProperty(t)&&(r[t]=e[t]);return r}let Ua;function rb(r){return Ua||(Ua=typeof document=="undefined"?{}:document.createElement("a")),Ua.href=r,Ua.href}function yg(r){if(typeof createImageBitmap!="function"){console.info("Safari<15: applying SDF canvas workaround");const{sdfCanvas:e,sdfTexture:t}=r,{width:n,height:i}=e,s=r.sdfCanvas.getContext("webgl");let o=t.image.data;(!o||o.length!==n*i*4)&&(o=new Uint8Array(n*i*4),t.image={width:n,height:i,data:o},t.flipY=!1,t.isDataTexture=!0),s.readPixels(0,0,n,i,s.RGBA,s.UNSIGNED_BYTE,o)}}const sb=zs({name:"Typesetter",dependencies:[X1,W1,D1],init(r,e,t){return r(e,t())}}),Sg=zs({name:"Typesetter",dependencies:[sb],init(r){return function(e){return new Promise(t=>{r.typeset(e,t)})}},getTransferables(r){const e=[];for(let t in r)r[t]&&r[t].buffer&&e.push(r[t].buffer);return e}});Sg.onMainThread;const Nd={};function ob(r){let e=Nd[r];return e||(e=Nd[r]=new zr(1,1,r,r).translate(.5,.5,0)),e}const ab="aTroikaGlyphBounds",Od="aTroikaGlyphIndex",cb="aTroikaGlyphColor";class lb extends S1{constructor(){super(),this.detail=1,this.curveRadius=0,this.groups=[{start:0,count:1/0,materialIndex:0},{start:0,count:1/0,materialIndex:1}],this.boundingSphere=new Wo,this.boundingBox=new kr}computeBoundingSphere(){}computeBoundingBox(){}set detail(e){if(e!==this._detail){this._detail=e,(typeof e!="number"||e<1)&&(e=1);let t=ob(e);["position","normal","uv"].forEach(n=>{this.attributes[n]=t.attributes[n].clone()}),this.setIndex(t.getIndex().clone())}}get detail(){return this._detail}set curveRadius(e){e!==this._curveRadius&&(this._curveRadius=e,this._updateBounds())}get curveRadius(){return this._curveRadius}updateGlyphs(e,t,n,i,s){this.updateAttributeData(ab,e,4),this.updateAttributeData(Od,t,1),this.updateAttributeData(cb,s,3),this._blockBounds=n,this._chunkedBounds=i,this.instanceCount=t.length,this._updateBounds()}_updateBounds(){const e=this._blockBounds;if(e){const{curveRadius:t,boundingBox:n}=this;if(t){const{PI:i,floor:s,min:o,max:a,sin:c,cos:l}=Math,f=i/2,u=i*2,h=Math.abs(t),d=e[0]/h,g=e[2]/h,_=s((d+f)/u)!==s((g+f)/u)?-h:o(c(d)*h,c(g)*h),m=s((d-f)/u)!==s((g-f)/u)?h:a(c(d)*h,c(g)*h),p=s((d+i)/u)!==s((g+i)/u)?h*2:a(h-l(d)*h,h-l(g)*h);n.min.set(_,e[1],t<0?-p:0),n.max.set(m,e[3],t<0?0:p)}else n.min.set(e[0],e[1],0),n.max.set(e[2],e[3],0);n.getBoundingSphere(this.boundingSphere)}}applyClipRect(e){let t=this.getAttribute(Od).count,n=this._chunkedBounds;if(n)for(let i=n.length;i--;){t=n[i].end;let s=n[i].rect;if(s[1]<e.w&&s[3]>e.y&&s[0]<e.z&&s[2]>e.x)break}this.instanceCount=t}updateAttributeData(e,t,n){const i=this.getAttribute(e);t?i&&i.array.length===t.length?(i.array.set(t),i.needsUpdate=!0):(this.setAttribute(e,new m1(t,n)),delete this._maxInstanceCount,this.dispose()):i&&this.deleteAttribute(e)}}const fb=`
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform vec4 uTroikaTotalBounds;
uniform vec4 uTroikaClipRect;
uniform mat3 uTroikaOrient;
uniform bool uTroikaUseGlyphColors;
uniform float uTroikaEdgeOffset;
uniform float uTroikaBlurRadius;
uniform vec2 uTroikaPositionOffset;
uniform float uTroikaCurveRadius;
attribute vec4 aTroikaGlyphBounds;
attribute float aTroikaGlyphIndex;
attribute vec3 aTroikaGlyphColor;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec3 vTroikaGlyphColor;
varying vec2 vTroikaGlyphDimensions;
`,ub=`
vec4 bounds = aTroikaGlyphBounds;
bounds.xz += uTroikaPositionOffset.x;
bounds.yw -= uTroikaPositionOffset.y;

vec4 outlineBounds = vec4(
  bounds.xy - uTroikaEdgeOffset - uTroikaBlurRadius,
  bounds.zw + uTroikaEdgeOffset + uTroikaBlurRadius
);
vec4 clippedBounds = vec4(
  clamp(outlineBounds.xy, uTroikaClipRect.xy, uTroikaClipRect.zw),
  clamp(outlineBounds.zw, uTroikaClipRect.xy, uTroikaClipRect.zw)
);

vec2 clippedXY = (mix(clippedBounds.xy, clippedBounds.zw, position.xy) - bounds.xy) / (bounds.zw - bounds.xy);

position.xy = mix(bounds.xy, bounds.zw, clippedXY);

uv = (position.xy - uTroikaTotalBounds.xy) / (uTroikaTotalBounds.zw - uTroikaTotalBounds.xy);

float rad = uTroikaCurveRadius;
if (rad != 0.0) {
  float angle = position.x / rad;
  position.xz = vec2(sin(angle) * rad, rad - cos(angle) * rad);
  normal.xz = vec2(sin(angle), cos(angle));
}
  
position = uTroikaOrient * position;
normal = uTroikaOrient * normal;

vTroikaGlyphUV = clippedXY.xy;
vTroikaGlyphDimensions = vec2(bounds[2] - bounds[0], bounds[3] - bounds[1]);


float txCols = uTroikaSDFTextureSize.x / uTroikaSDFGlyphSize;
vec2 txUvPerSquare = uTroikaSDFGlyphSize / uTroikaSDFTextureSize;
vec2 txStartUV = txUvPerSquare * vec2(
  mod(floor(aTroikaGlyphIndex / 4.0), txCols),
  floor(floor(aTroikaGlyphIndex / 4.0) / txCols)
);
vTroikaTextureUVBounds = vec4(txStartUV, vec2(txStartUV) + txUvPerSquare);
vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);
`,hb=`
uniform sampler2D uTroikaSDFTexture;
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform float uTroikaSDFExponent;
uniform float uTroikaEdgeOffset;
uniform float uTroikaFillOpacity;
uniform float uTroikaBlurRadius;
uniform vec3 uTroikaStrokeColor;
uniform float uTroikaStrokeWidth;
uniform float uTroikaStrokeOpacity;
uniform bool uTroikaSDFDebug;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec2 vTroikaGlyphDimensions;

float troikaSdfValueToSignedDistance(float alpha) {
  // Inverse of exponential encoding in webgl-sdf-generator
  
  float maxDimension = max(vTroikaGlyphDimensions.x, vTroikaGlyphDimensions.y);
  float absDist = (1.0 - pow(2.0 * (alpha > 0.5 ? 1.0 - alpha : alpha), 1.0 / uTroikaSDFExponent)) * maxDimension;
  float signedDist = absDist * (alpha > 0.5 ? -1.0 : 1.0);
  return signedDist;
}

float troikaGlyphUvToSdfValue(vec2 glyphUV) {
  vec2 textureUV = mix(vTroikaTextureUVBounds.xy, vTroikaTextureUVBounds.zw, glyphUV);
  vec4 rgba = texture2D(uTroikaSDFTexture, textureUV);
  float ch = floor(vTroikaTextureChannel + 0.5); //NOTE: can't use round() in WebGL1
  return ch == 0.0 ? rgba.r : ch == 1.0 ? rgba.g : ch == 2.0 ? rgba.b : rgba.a;
}

float troikaGlyphUvToDistance(vec2 uv) {
  return troikaSdfValueToSignedDistance(troikaGlyphUvToSdfValue(uv));
}

float troikaGetAADist() {
  
  #if defined(GL_OES_standard_derivatives) || __VERSION__ >= 300
  return length(fwidth(vTroikaGlyphUV * vTroikaGlyphDimensions)) * 0.5;
  #else
  return vTroikaGlyphDimensions.x / 64.0;
  #endif
}

float troikaGetFragDistValue() {
  vec2 clampedGlyphUV = clamp(vTroikaGlyphUV, 0.5 / uTroikaSDFGlyphSize, 1.0 - 0.5 / uTroikaSDFGlyphSize);
  float distance = troikaGlyphUvToDistance(clampedGlyphUV);
 
  // Extrapolate distance when outside bounds:
  distance += clampedGlyphUV == vTroikaGlyphUV ? 0.0 : 
    length((vTroikaGlyphUV - clampedGlyphUV) * vTroikaGlyphDimensions);

  

  return distance;
}

float troikaGetEdgeAlpha(float distance, float distanceOffset, float aaDist) {
  #if defined(IS_DEPTH_MATERIAL) || defined(IS_DISTANCE_MATERIAL)
  float alpha = step(-distanceOffset, -distance);
  #else

  float alpha = smoothstep(
    distanceOffset + aaDist,
    distanceOffset - aaDist,
    distance
  );
  #endif

  return alpha;
}
`,db=`
float aaDist = troikaGetAADist();
float fragDistance = troikaGetFragDistValue();
float edgeAlpha = uTroikaSDFDebug ?
  troikaGlyphUvToSdfValue(vTroikaGlyphUV) :
  troikaGetEdgeAlpha(fragDistance, uTroikaEdgeOffset, max(aaDist, uTroikaBlurRadius));

#if !defined(IS_DEPTH_MATERIAL) && !defined(IS_DISTANCE_MATERIAL)
vec4 fillRGBA = gl_FragColor;
fillRGBA.a *= uTroikaFillOpacity;
vec4 strokeRGBA = uTroikaStrokeWidth == 0.0 ? fillRGBA : vec4(uTroikaStrokeColor, uTroikaStrokeOpacity);
if (fillRGBA.a == 0.0) fillRGBA.rgb = strokeRGBA.rgb;
gl_FragColor = mix(fillRGBA, strokeRGBA, smoothstep(
  -uTroikaStrokeWidth - aaDist,
  -uTroikaStrokeWidth + aaDist,
  fragDistance
));
gl_FragColor.a *= edgeAlpha;
#endif

if (edgeAlpha == 0.0) {
  discard;
}
`;function pb(r){const e=zf(r,{chained:!0,extensions:{derivatives:!0},uniforms:{uTroikaSDFTexture:{value:null},uTroikaSDFTextureSize:{value:new ot},uTroikaSDFGlyphSize:{value:0},uTroikaSDFExponent:{value:0},uTroikaTotalBounds:{value:new xt(0,0,0,0)},uTroikaClipRect:{value:new xt(0,0,0,0)},uTroikaEdgeOffset:{value:0},uTroikaFillOpacity:{value:1},uTroikaPositionOffset:{value:new ot},uTroikaCurveRadius:{value:0},uTroikaBlurRadius:{value:0},uTroikaStrokeWidth:{value:0},uTroikaStrokeColor:{value:new et},uTroikaStrokeOpacity:{value:1},uTroikaOrient:{value:new tt},uTroikaUseGlyphColors:{value:!0},uTroikaSDFDebug:{value:!1}},vertexDefs:fb,vertexTransform:ub,fragmentDefs:hb,fragmentColorTransform:db,customRewriter({vertexShader:t,fragmentShader:n}){let i=/\buniform\s+vec3\s+diffuse\b/;return i.test(n)&&(n=n.replace(i,"varying vec3 vTroikaGlyphColor").replace(/\bdiffuse\b/g,"vTroikaGlyphColor"),i.test(t)||(t=t.replace(_g,`uniform vec3 diffuse;
$&
vTroikaGlyphColor = uTroikaUseGlyphColors ? aTroikaGlyphColor / 255.0 : diffuse;
`))),{vertexShader:t,fragmentShader:n}}});return e.transparent=!0,e.forceSinglePass=!0,Object.defineProperties(e,{isTroikaTextMaterial:{value:!0},shadowSide:{get(){return this.side},set(){}}}),e}const Su=new Mo({color:16777215,side:Zn,transparent:!0}),Bd=8421504,kd=new wt,Ia=new ie,Rl=new ie,oo=[],mb=new ie,Cl="+x+y";function zd(r){return Array.isArray(r)?r[0]:r}let Eg=()=>{const r=new Wt(new zr(1,1),Su);return Eg=()=>r,r},Mg=()=>{const r=new Wt(new zr(1,1,32,1),Su);return Mg=()=>r,r};const gb={type:"syncstart"},_b={type:"synccomplete"},bg=["font","fontSize","fontStyle","fontWeight","lang","letterSpacing","lineHeight","maxWidth","overflowWrap","text","direction","textAlign","textIndent","whiteSpace","anchorX","anchorY","colorRanges","sdfGlyphSize"],vb=bg.concat("material","color","depthOffset","clipRect","curveRadius","orientation","glyphGeometryDetail");class wg extends Wt{constructor(){const e=new lb;super(e,null),this.text="",this.anchorX=0,this.anchorY=0,this.curveRadius=0,this.direction="auto",this.font=null,this.unicodeFontsURL=null,this.fontSize=.1,this.fontWeight="normal",this.fontStyle="normal",this.lang=null,this.letterSpacing=0,this.lineHeight="normal",this.maxWidth=1/0,this.overflowWrap="normal",this.textAlign="left",this.textIndent=0,this.whiteSpace="normal",this.material=null,this.color=null,this.colorRanges=null,this.outlineWidth=0,this.outlineColor=0,this.outlineOpacity=1,this.outlineBlur=0,this.outlineOffsetX=0,this.outlineOffsetY=0,this.strokeWidth=0,this.strokeColor=Bd,this.strokeOpacity=1,this.fillOpacity=1,this.depthOffset=0,this.clipRect=null,this.orientation=Cl,this.glyphGeometryDetail=1,this.sdfGlyphSize=null,this.gpuAccelerateSDF=!0,this.debugSDF=!1}sync(e){this._needsSync&&(this._needsSync=!1,this._isSyncing?(this._queuedSyncs||(this._queuedSyncs=[])).push(e):(this._isSyncing=!0,this.dispatchEvent(gb),tb({text:this.text,font:this.font,lang:this.lang,fontSize:this.fontSize||.1,fontWeight:this.fontWeight||"normal",fontStyle:this.fontStyle||"normal",letterSpacing:this.letterSpacing||0,lineHeight:this.lineHeight||"normal",maxWidth:this.maxWidth,direction:this.direction||"auto",textAlign:this.textAlign,textIndent:this.textIndent,whiteSpace:this.whiteSpace,overflowWrap:this.overflowWrap,anchorX:this.anchorX,anchorY:this.anchorY,colorRanges:this.colorRanges,includeCaretPositions:!0,sdfGlyphSize:this.sdfGlyphSize,gpuAccelerateSDF:this.gpuAccelerateSDF,unicodeFontsURL:this.unicodeFontsURL},t=>{this._isSyncing=!1,this._textRenderInfo=t,this.geometry.updateGlyphs(t.glyphBounds,t.glyphAtlasIndices,t.blockBounds,t.chunkedBounds,t.glyphColors);const n=this._queuedSyncs;n&&(this._queuedSyncs=null,this._needsSync=!0,this.sync(()=>{n.forEach(i=>i&&i())})),this.dispatchEvent(_b),e&&e()})))}onBeforeRender(e,t,n,i,s,o){this.sync(),s.isTroikaTextMaterial&&this._prepareForRender(s)}dispose(){this.geometry.dispose()}get textRenderInfo(){return this._textRenderInfo||null}createDerivedMaterial(e){return pb(e)}get material(){let e=this._derivedMaterial;const t=this._baseMaterial||this._defaultMaterial||(this._defaultMaterial=Su.clone());if((!e||!e.isDerivedFrom(t))&&(e=this._derivedMaterial=this.createDerivedMaterial(t),t.addEventListener("dispose",function n(){t.removeEventListener("dispose",n),e.dispose()})),this.hasOutline()){let n=e._outlineMtl;return n||(n=e._outlineMtl=Object.create(e,{id:{value:e.id+.1}}),n.isTextOutlineMaterial=!0,n.depthWrite=!1,n.map=null,e.addEventListener("dispose",function i(){e.removeEventListener("dispose",i),n.dispose()})),[n,e]}else return e}set material(e){e&&e.isTroikaTextMaterial?(this._derivedMaterial=e,this._baseMaterial=e.baseMaterial):this._baseMaterial=e}hasOutline(){return!!(this.outlineWidth||this.outlineBlur||this.outlineOffsetX||this.outlineOffsetY)}get glyphGeometryDetail(){return this.geometry.detail}set glyphGeometryDetail(e){this.geometry.detail=e}get curveRadius(){return this.geometry.curveRadius}set curveRadius(e){this.geometry.curveRadius=e}get customDepthMaterial(){return zd(this.material).getDepthMaterial()}set customDepthMaterial(e){}get customDistanceMaterial(){return zd(this.material).getDistanceMaterial()}set customDistanceMaterial(e){}_prepareForRender(e){const t=e.isTextOutlineMaterial,n=e.uniforms,i=this.textRenderInfo;if(i){const{sdfTexture:a,blockBounds:c}=i;n.uTroikaSDFTexture.value=a,n.uTroikaSDFTextureSize.value.set(a.image.width,a.image.height),n.uTroikaSDFGlyphSize.value=i.sdfGlyphSize,n.uTroikaSDFExponent.value=i.sdfExponent,n.uTroikaTotalBounds.value.fromArray(c),n.uTroikaUseGlyphColors.value=!t&&!!i.glyphColors;let l=0,f=0,u=0,h,d,g,_=0,m=0;if(t){let{outlineWidth:y,outlineOffsetX:b,outlineOffsetY:v,outlineBlur:C,outlineOpacity:R}=this;l=this._parsePercent(y)||0,f=Math.max(0,this._parsePercent(C)||0),h=R,_=this._parsePercent(b)||0,m=this._parsePercent(v)||0}else u=Math.max(0,this._parsePercent(this.strokeWidth)||0),u&&(g=this.strokeColor,n.uTroikaStrokeColor.value.set(g==null?Bd:g),d=this.strokeOpacity,d==null&&(d=1)),h=this.fillOpacity;n.uTroikaEdgeOffset.value=l,n.uTroikaPositionOffset.value.set(_,m),n.uTroikaBlurRadius.value=f,n.uTroikaStrokeWidth.value=u,n.uTroikaStrokeOpacity.value=d,n.uTroikaFillOpacity.value=h==null?1:h,n.uTroikaCurveRadius.value=this.curveRadius||0;let p=this.clipRect;if(p&&Array.isArray(p)&&p.length===4)n.uTroikaClipRect.value.fromArray(p);else{const y=(this.fontSize||.1)*100;n.uTroikaClipRect.value.set(c[0]-y,c[1]-y,c[2]+y,c[3]+y)}this.geometry.applyClipRect(n.uTroikaClipRect.value)}n.uTroikaSDFDebug.value=!!this.debugSDF,e.polygonOffset=!!this.depthOffset,e.polygonOffsetFactor=e.polygonOffsetUnits=this.depthOffset||0;const s=t?this.outlineColor||0:this.color;if(s==null)delete e.color;else{const a=e.hasOwnProperty("color")?e.color:e.color=new et;(s!==a._input||typeof s=="object")&&a.set(a._input=s)}let o=this.orientation||Cl;if(o!==e._orientation){let a=n.uTroikaOrient.value;o=o.replace(/[^-+xyz]/g,"");let c=o!==Cl&&o.match(/^([-+])([xyz])([-+])([xyz])$/);if(c){let[,l,f,u,h]=c;Ia.set(0,0,0)[f]=l==="-"?1:-1,Rl.set(0,0,0)[h]=u==="-"?-1:1,kd.lookAt(mb,Ia.cross(Rl),Rl),a.setFromMatrix4(kd)}else a.identity();e._orientation=o}}_parsePercent(e){if(typeof e=="string"){let t=e.match(/^(-?[\d.]+)%$/),n=t?parseFloat(t[1]):NaN;e=(isNaN(n)?0:n/100)*this.fontSize}return e}localPositionToTextCoords(e,t=new ot){t.copy(e);const n=this.curveRadius;return n&&(t.x=Math.atan2(e.x,Math.abs(n)-Math.abs(e.z))*Math.abs(n)),t}worldPositionToTextCoords(e,t=new ot){return Ia.copy(e),this.localPositionToTextCoords(this.worldToLocal(Ia),t)}raycast(e,t){const{textRenderInfo:n,curveRadius:i}=this;if(n){const s=n.blockBounds,o=i?Mg():Eg(),a=o.geometry,{position:c,uv:l}=a.attributes;for(let f=0;f<l.count;f++){let u=s[0]+l.getX(f)*(s[2]-s[0]);const h=s[1]+l.getY(f)*(s[3]-s[1]);let d=0;i&&(d=i-Math.cos(u/i)*i,u=Math.sin(u/i)*i),c.setXYZ(f,u,h,d)}a.boundingSphere=this.geometry.boundingSphere,a.boundingBox=this.geometry.boundingBox,o.matrixWorld=this.matrixWorld,o.material.side=this.material.side,oo.length=0,o.raycast(e,oo);for(let f=0;f<oo.length;f++)oo[f].object=this,t.push(oo[f])}}copy(e){const t=this.geometry;return super.copy(e),this.geometry=t,vb.forEach(n=>{this[n]=e[n]}),this}clone(){return new this.constructor().copy(this)}}bg.forEach(r=>{const e="_private_"+r;Object.defineProperty(wg.prototype,r,{get(){return this[e]},set(t){t!==this[e]&&(this[e]=t,this._needsSync=!0)}})});new kr;new et;const xb=[{category:"Getränke",q:"Aus welcher Pflanze wird Tequila hergestellt?",answers:["Agave"," Zuckerrohr","Weizen","Mais"],correct:0},{category:"Getränke",q:"Welches Getränk wird aus Trauben hergestellt?",answers:["Bier","Wein","Whisky","Tee"],correct:1},{category:"Getränke",q:"Wie viel Prozent hat ein klassisches Pils etwa?",answers:["ca. 5 %","ca. 12 %","ca. 1 %","ca. 20 %"],correct:0},{category:"Getränke",q:"Was ist die Basis eines Mojitos?",answers:["Wodka","Rum","Gin","Tequila"],correct:1},{category:"Getränke",q:"Aus welchem Land kommt der Espresso ursprünglich?",answers:["Frankreich","Italien","Spanien","USA"],correct:1},{category:"Getränke",q:"Welcher Cocktail enthält Cola und Rum?",answers:["Cuba Libre","Margarita","Negroni","Aperol Spritz"],correct:0},{category:"Speisen",q:"Aus welchem Land kommt Sushi?",answers:["China","Japan","Korea","Thailand"],correct:1},{category:"Speisen",q:"Woraus wird klassische Pizza Margherita gemacht?",answers:["Tomate, Mozzarella, Basilikum","Salami, Käse, Pilze","Thunfisch, Zwiebel","Hähnchen, Ananas"],correct:0},{category:"Speisen",q:"Was ist die Hauptzutat von Hummus?",answers:["Linsen","Kichererbsen","Bohnen","Erbsen"],correct:1},{category:"Speisen",q:'Welche Nudelsorte bedeutet „kleine Schnüre"?',answers:["Spaghetti","Penne","Fusilli","Rigatoni"],correct:0},{category:"Speisen",q:"Aus welchem Getreide wird klassisches Risotto gemacht?",answers:["Weizen","Reis","Gerste","Hafer"],correct:1},{category:"Speisen",q:"Was ist Tofu?",answers:["Käse aus Milch","Quark aus Soja","Fleisch-Ersatz aus Weizen","Fischpaste"],correct:1},{category:"Shisha",q:"Wie heißt der Tabakkopf einer Shisha?",answers:["Bowl","Head","Hose","Valve"],correct:1},{category:"Shisha",q:"Was kühlt den Rauch in der Shisha?",answers:["Das Wasser in der Bowl","Der Kohleteller","Der Schlauch","Die Zange"],correct:0},{category:"Shisha",q:"Womit wird der Tabak in der Shisha erhitzt?",answers:["Feuerzeug direkt","Kohle","Strom","Kerze"],correct:1},{category:"Shisha",q:"Wie nennt man den Schlauch einer Shisha?",answers:["Hose","Tube","Pipe","Stem"],correct:0},{category:"Allgemein",q:"Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?",answers:["9","10","11","12"],correct:2},{category:"Allgemein",q:"Welche Farbe entsteht, wenn man Blau und Gelb mischt?",answers:["Grün","Orange","Violett","Braun"],correct:0},{category:"Allgemein",q:"Wie viele Kontinente gibt es?",answers:["5","6","7","8"],correct:2},{category:"Allgemein",q:"Welches ist das größte Land der Welt?",answers:["China","USA","Kanada","Russland"],correct:3}],ao=["#ef4444","#3b82f6","#22c55e","#eab308"],Gd=15,yb=2.4;var Ap;const Tg=typeof window!="undefined"&&(typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches||typeof navigator!="undefined"&&((Ap=navigator.maxTouchPoints)!=null?Ap:0)>0),Vd=Tg?1.5:2;function Dl(r,e="#ffffff"){const t=new wg;return t.fontSize=r,t.color=e,t.anchorX="center",t.anchorY="middle",t.textAlign="center",t.sync(),t}class Sb{constructor(e,t){this.raf=0,this.clock=new E1,this.beams=[],this.correct=null,this.qIndex=0,this.phase="idle",this.timeLeft=Gd,this.revealTimer=0,this.botTimers=[],this.answerLocks=new Set,this.players=[],this.onChange=null,this.onSelectAnswer=null,this.onPointerDown=i=>{var d;if(this.phase!=="question")return;const o=this.renderer.domElement.getBoundingClientRect(),a=(i.clientX-o.left)/o.width*2-1,c=-((i.clientY-o.top)/o.height)*2+1,l=new M1;l.setFromCamera(new ot(a,c),this.camera);const f=l.intersectObjects(this.beams.map(g=>g.group),!0);if(f.length===0)return;let u=f[0].object;for(;u&&u.userData.answerIndex===void 0;)u=u.parent;const h=u==null?void 0:u.userData.answerIndex;typeof h=="number"&&((d=this.onSelectAnswer)==null||d.call(this,h))},this.resize=()=>{const i=Math.max(1,this.container.clientWidth||window.innerWidth),s=Math.max(1,this.container.clientHeight||window.innerHeight);this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Vd)),this.renderer.setSize(i,s,!1),this.camera.aspect=i/s,this.camera.fov=this.camera.aspect<1?62:55,this.camera.updateProjectionMatrix()},this.loop=()=>{const i=Math.min(this.clock.getDelta(),.1),s=this.clock.elapsedTime;this.authoritative&&this.phase==="question"?(this.timeLeft-=i,this.timeLeft<=0&&this.reveal()):this.authoritative&&this.phase==="reveal"&&(this.revealTimer-=i,this.revealTimer<=0&&this.next()),this.board.position.y=3+Math.sin(s*.9)*.045,this.beams.forEach((o,a)=>{const c=1+Math.sin(s*2.4+a)*.05;o.group.scale.y=c}),this.stars.rotation.y=s*.02,this.categoryText.material.opacity=.7+Math.sin(s*2)*.3,this.renderer.render(this.scene,this.camera),this.raf=requestAnimationFrame(this.loop)},this.container=e,this.authoritative=t,this.questions=xb,this.renderer=new d1({antialias:!Tg,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Vd)),this.renderer.outputColorSpace=In,this.renderer.shadowMap.enabled=!1,this.renderer.domElement.style.width="100%",this.renderer.domElement.style.height="100%",e.appendChild(this.renderer.domElement),this.scene=new p1,this.scene.background=new et(460059),this.scene.fog=new _u(460059,.035),this.camera=new xn(55,1,.1,100),this.camera.position.set(0,2.6,7.2),this.camera.lookAt(0,1.9,0);const n=this.buildStage();this.board=n.board,this.boardText=n.boardText,this.categoryText=n.categoryText,this.beams=n.beams,this.stars=n.stars,this.order=this.shuffle(this.questions).slice(0,10),this.resize(),window.addEventListener("resize",this.resize),window.addEventListener("pointerdown",this.onPointerDown),this.renderer.domElement.addEventListener("pointerdown",this.onPointerDown),this.loop()}buildStage(){const e=this.scene;e.add(new _1(8952319,1182250,.75));const t=new Ed(16773848,90,30,Math.PI/5,.5,1.6);t.position.set(-3.2,7.5,4.2),t.target.position.set(0,2.4,-.4),e.add(t,t.target);const n=new Ed(5995519,60,30,Math.PI/4.5,.6,1.6);n.position.set(3.6,6.5,3),n.target.position.set(0,2.2,-.4),e.add(n,n.target);const i=new Wt(new vu(6,64),new Pa({color:1314867,roughness:.5,metalness:.6}));i.rotation.x=-Math.PI/2,e.add(i);const s=new Wt(new xu(2.2,2.45,64),new Mo({color:6962431,transparent:!0,opacity:.45,side:Zn}));s.rotation.x=-Math.PI/2,s.position.y=.02,e.add(s);const o=new us,a=new Wt(new Or(3.9,1.6,.14),new Pa({color:1774672,roughness:.35,metalness:.35,emissive:1313338,emissiveIntensity:.6}));o.add(a);const c=new Wt(new Or(4.02,1.72,.06),new Mo({color:3647743,transparent:!0,opacity:.5}));c.position.z=-.06,o.add(c),o.position.set(0,3,-.7),o.rotation.x=-.1,e.add(o);const l=Dl(.2,"#ffffff");l.maxWidth=3.5,l.position.set(0,-.02,.1),o.add(l);const f=Dl(.12,"#7dd3fc");f.position.set(0,.66,.1),o.add(f);const u=[],h=[-1.35,-.45,.45,1.35];for(let p=0;p<4;p++){const y=new us,b=new Pa({color:new et(ao[p]),emissive:new et(ao[p]),emissiveIntensity:.55,roughness:.3,metalness:.4,transparent:!0,opacity:.9}),v=new Wt(new ic(.16,.22,.95,24),b);v.position.y=.5,y.add(v);const C=new Wt(new ic(.34,.34,.08,24),new Pa({color:2103893,roughness:.4,metalness:.5}));C.position.y=.04,y.add(C);const R=Dl(.34,ao[p]);R.position.set(0,1.18,0),y.add(R);const w=new y1(new et(ao[p]),4,4,2);w.position.set(0,.6,0),y.add(w),y.position.set(h[p],0,-.9),y.userData.answerIndex=p,e.add(y),u.push({group:y,mat:b,light:w})}const d=400,g=new Float32Array(d*3);for(let p=0;p<d;p++)g[p*3]=(Math.random()-.5)*26,g[p*3+1]=Math.random()*12-1,g[p*3+2]=(Math.random()-.5)*26-4;const _=new Nn;_.setAttribute("position",new Gn(g,3));const m=new g1(_,new dg({color:10471679,size:.05,transparent:!0,opacity:.8}));return e.add(m),{board:o,boardText:l,categoryText:f,beams:u,stars:m}}shuffle(e){const t=e.slice();for(let n=t.length-1;n>0;n--){const i=Math.floor(Math.random()*(n+1));[t[n],t[i]]=[t[i],t[n]]}return t}currentQuestion(){return this.order[Math.min(this.qIndex,this.order.length-1)]}start(){this.qIndex=0,this.players.forEach(e=>{e.score=0,e.choice=null}),this.beginQuestion()}restart(){this.order=this.shuffle(this.questions).slice(0,10),this.start()}beginQuestion(){this.phase="question",this.correct=null,this.timeLeft=Gd,this.answerLocks.clear(),this.players.forEach(e=>{e.choice=null}),this.syncVisuals(),this.emit(),Pl(this.botTimers);for(const e of this.players){if(!e.isBot)continue;const t=2e3+Math.random()*9e3,n=this.currentQuestion(),i=Math.random()<.62;let s=n.correct;if(!i)do s=Math.floor(Math.random()*4);while(s===n.correct);const o=window.setTimeout(()=>this.answer(e.id,s),t);this.botTimers.push(o)}}answer(e,t){if(this.phase!=="question"||this.answerLocks.has(e))return!1;const n=this.players.find(o=>o.id===e);if(!n)return!1;this.answerLocks.add(e),n.choice=t;const i=this.currentQuestion();t===i.correct&&(n.score+=700+Math.round(this.timeLeft*30));const s=!n.isBot;return s&&this.autoAnswerBots(),this.syncVisuals(),this.emit(),(s||this.players.every(o=>o.choice!==null))&&this.reveal(),!0}autoAnswerBots(){const e=this.currentQuestion();for(const t of this.players){if(!t.isBot||t.choice!==null)continue;const n=Math.random()<.62;let i=e.correct;if(!n)do i=Math.floor(Math.random()*4);while(i===e.correct);t.choice=i,i===e.correct&&(t.score+=700+Math.round(this.timeLeft*30))}}reveal(){this.phase==="question"&&(Pl(this.botTimers),this.phase="reveal",this.correct=this.currentQuestion().correct,this.revealTimer=yb,this.syncVisuals(),this.emit())}next(){this.qIndex+=1,this.qIndex>=this.order.length?(this.phase="results",this.syncVisuals(),this.emit()):this.beginQuestion()}getSnapshot(){var t,n;const e=this.currentQuestion();return{qIndex:this.qIndex,phase:this.phase,timeLeft:this.timeLeft,players:this.players.map(i=>({...i})),correct:this.correct,total:this.order.length,category:(t=e==null?void 0:e.category)!=null?t:"",question:(n=e==null?void 0:e.q)!=null?n:"",answers:e!=null&&e.answers?[...e.answers]:[]}}applySnapshot(e){this.qIndex=e.qIndex,this.phase=e.phase,this.timeLeft=e.timeLeft,this.correct=e.correct,this.players=e.players.map(t=>({...t})),this.syncVisuals()}setPlayers(e){this.players=e.map(t=>({...t})),this.syncVisuals(),this.emit()}emit(){var e;(e=this.onChange)==null||e.call(this,this.getSnapshot())}syncVisuals(){const e=this.currentQuestion();e&&(this.boardText.text=e.q,this.categoryText.text=`${e.category} · Frage ${Math.min(this.qIndex+1,this.order.length)}/${this.order.length}`,this.boardText.sync(),this.categoryText.sync());for(let t=0;t<this.beams.length;t++){const n=this.beams[t],i=ao[t];let s=new et(i),o=.55,a=.9;this.phase==="reveal"&&this.correct!==null?t===this.correct?(s=new et(2278750),o=1.6,a=1):(s=new et(3816021),o=.12,a=.4):this.phase!=="question"&&(o=.3,a=.6),n.mat.emissive.copy(s),n.mat.emissiveIntensity=o,n.mat.opacity=a,n.light.color.copy(s),n.light.intensity=this.phase==="reveal"&&t===this.correct?8:3}}dispose(){cancelAnimationFrame(this.raf),Pl(this.botTimers),window.removeEventListener("resize",this.resize),window.removeEventListener("pointerdown",this.onPointerDown),this.renderer.domElement.removeEventListener("pointerdown",this.onPointerDown),this.renderer.dispose(),this.container.innerHTML=""}}function Pl(r){for(const e of r)window.clearTimeout(e);r.length=0}const Xo=["#ef4444","#3b82f6","#22c55e","#eab308"],Ag=["A","B","C","D"],Rg=15,qo=new URLSearchParams(window.location.search),Gs=qo.get("net"),Xa=qo.get("name")||"Du",Eb=qo.get("mode")||"public",Hd=qo.get("room")||"",Ec=document.getElementById("app"),Kt=new Sb(Ec,!Gs);Kt.authoritative=!Gs;const Cg="me";let Us=Cg;function rn(r,e=""){const t=document.createElement(r);return e&&(t.className=e),t}function _t(r,e,t){const n=rn(r,e);return n.textContent=t,n}const jo=rn("div","qz-hud");Ec.appendChild(jo);const Eu=rn("div","qz-top");Eu.appendChild(_t("div","qz-brand","🎬 digi-gastro Quiz"));const Dg=_t("div","qz-count","15s");Eu.appendChild(Dg);jo.appendChild(Eu);const Vf=rn("div","qz-scores");jo.appendChild(Vf);const Pg=rn("div","qz-timer"),Ug=rn("div");Pg.appendChild(Ug);jo.appendChild(Pg);const Ig=rn("div","qz-answers"),ls=[];for(let r=0;r<4;r++){const e=document.createElement("button"),t=_t("span","badge",Ag[r]);t.style.background=Xo[r];const n=_t("span","txt","");e.appendChild(t),e.appendChild(n),e.addEventListener("click",()=>Bg(r)),Ig.appendChild(e),ls.push(e)}jo.appendChild(Ig);function Mu(r){var e;Vf.innerHTML="",r.players.forEach(t=>{const n=rn("div","qz-score");n.style.color=t.color;const i=_t("div","nm",t.isBot?`${t.name} 🤖`:t.name);i.style.color="#fff";const s=_t("div","pt",String(t.score));if(n.appendChild(i),n.appendChild(s),t.choice!==null){const o=_t("div","tag",Ag[t.choice]);o.style.color=t.color,n.appendChild(o)}Vf.appendChild(n)});for(let t=0;t<4;t++){const n=ls[t].querySelector(".txt");n.textContent=(e=r.answers[t])!=null?e:"",ls[t].disabled=r.phase!=="question",ls[t].className="";const i=ls[t].querySelector(".badge");i.style.background=Xo[t]}r.phase==="reveal"&&r.correct!==null&&ls.forEach((t,n)=>{n===r.correct?t.classList.add("correct"):r.players.some(i=>i.choice===n&&n!==r.correct)?t.classList.add("wrong"):t.classList.add("dim")})}function Lg(r,e){Ug.style.transform=`scaleX(${Math.max(0,Math.min(1,r))})`,Dg.textContent=`${Math.max(0,Math.ceil(e))}s`}function Mc(r){const e=rn("div","qz-overlay"),t=rn("div","qz-card");return r.forEach(n=>t.appendChild(n)),e.appendChild(t),Ec.appendChild(e),e}function bc(){document.querySelectorAll(".qz-overlay").forEach(r=>r.remove())}function La(r,e){const t=_t("div","qz-center",r);Ec.appendChild(t),window.setTimeout(()=>t.remove(),e)}let Yt=null,Ln=!1,Er={ids:[],names:[]},Fg=!1,Ul=!1;function Ng(r){const e=[];for(let t=r;t<4;t++)e.push({id:`bot${t}`,name:`Bot ${t}`,color:Xo[t],isBot:!0,score:0,choice:null});return e}function Og(){const r=[{id:Us,name:Xa,color:Xo[0],isBot:!1,score:0,choice:null},...Ng(1)];Kt.setPlayers(r),La("3",700),window.setTimeout(()=>La("2",700),700),window.setTimeout(()=>La("1",700),1400),window.setTimeout(()=>{La("LOS!",700),Kt.start()},2100)}function Bg(r){if(Kt.phase==="question"){if(Gs&&!Ln){Yt==null||Yt.send("intent",{type:"answer",index:r});const e=Kt.players.find(t=>t.id===Us);e&&e.choice===null&&(e.choice=r,Mu(Kt.getSnapshot()));return}Kt.answer(Us,r)}}Kt.onSelectAnswer=r=>Bg(r);Kt.onChange=r=>{Mu(r),Ln&&Yt&&Yt.send("state",r),r.phase==="results"&&!Ul?(Ul=!0,Mb(r)):r.phase!=="results"&&(Ul=!1)};let Wd=0;function kg(){const r=Kt.getSnapshot();Lg(r.timeLeft/Rg,r.timeLeft),Ln&&Yt&&r.phase==="question"&&performance.now()-Wd>300&&(Wd=performance.now(),Yt.send("state",r)),requestAnimationFrame(kg)}requestAnimationFrame(kg);function Mb(r){const e=r.players.slice().sort((i,s)=>s.score-i.score),t=rn("div","qz-ranks");e.forEach((i,s)=>{const o=rn("div","row");o.appendChild(_t("span","",`${s+1}. ${i.name}`)),o.appendChild(_t("span","",String(i.score))),t.appendChild(o)});const n=_t("button","qz-btn","🔁 Nochmal");n.addEventListener("click",()=>{bc(),(!Gs||Ln)&&Kt.restart()}),Mc([_t("h1","","🏆 Ergebnis"),t,n])}function Il(r){if(Fg)return;bc();const e=[_t("div","","🎬"),_t("h1","","digi-gastro Quiz"),_t("p","",Ln?"Tisch-Duell":"Warte auf den Host…")],t=rn("div","qz-code");t.appendChild(_t("div","lbl","Raum-Code")),t.appendChild(_t("div","val",r)),t.appendChild(_t("div","lbl","Freunde: Code eingeben")),e.push(t);const n=rn("div","qz-roster");Er.ids.forEach((i,s)=>{const o=rn("div","row");o.appendChild(_t("span","",`● ${Er.names[s]||`Tisch ${s+1}`}${i===Us?" (Du)":""}`)),o.appendChild(_t("span","",["rot","blau","grün","gelb"][s])),n.appendChild(o)});for(let i=Er.ids.length;i<4;i++){const s=rn("div","row");s.appendChild(_t("span","","🤖 Bot")),s.appendChild(_t("span","",["rot","blau","grün","gelb"][i])),n.appendChild(s)}if(e.push(n),Ln){const i=_t("button","qz-btn","🚀 Spiel starten");i.addEventListener("click",()=>{const s={ids:Er.ids,names:Er.names};Yt==null||Yt.send("start",s),zg(s)}),e.push(i)}Mc(e)}function zg(r){const e=r.ids||[],t=e.map((n,i)=>({id:n,name:r.names&&r.names[i]||`Tisch ${i+1}`,color:Xo[i],isBot:!1,score:0,choice:null}));Kt.setPlayers([...t,...Ng(e.length)]),Fg=!0,bc(),Ln&&Kt.start()}function bb(){const r=_t("button","qz-btn","▶ Spiel starten");r.addEventListener("click",()=>{bc(),Og()}),Mc([_t("div","","🎬"),_t("h1","","digi-gastro Quiz"),_t("p","","3D-Quizshow · Du gegen 3 Bots"),r])}function Xd(r){var e;try{(e=window.parent)==null||e.postMessage(r,"*")}catch{}}function wb(){const r=new pv(Gs);(Eb==="create"?r.create("quiz",{name:Xa}):Hd?r.joinById(Hd,{name:Xa}):r.joinOrCreate("quiz",{name:Xa})).then(t=>{var n;Yt=t,Us=(n=t.sessionId)!=null?n:Cg,Xd({type:"kart:room",roomId:t.roomId}),Yt.onMessage("role",i=>{Ln=!!i.isHost,Kt.authoritative=Ln,Il(t.roomId)}),Yt.onMessage("roster",i=>{Er={ids:i.ids||[],names:i.names||[]};const s=Er.ids[0];Ln=!!s&&s===Us,Kt.authoritative=Ln,Il(t.roomId)}),Yt.onMessage("start",i=>zg(i)),Yt.onMessage("state",i=>{Ln||(Kt.applySnapshot(i),Mu(i),Lg(i.timeLeft/Rg,i.timeLeft))}),Yt.onMessage("intent",i=>{Ln&&i.type==="answer"&&typeof i.index=="number"&&Kt.answer(i.from,i.index)}),Yt.send("hello"),Il(t.roomId)}).catch(t=>{const n=t instanceof Error?t.message:String(t);Xd({type:"kart:room-error",message:n});const i=_t("button","qz-btn ghost","Zurück");i.addEventListener("click",()=>window.location.reload()),Mc([_t("h1","","Verbindung fehlgeschlagen"),_t("p","",n),i])})}Gs?wb():qo.get("auto")==="1"?Og():bb();
