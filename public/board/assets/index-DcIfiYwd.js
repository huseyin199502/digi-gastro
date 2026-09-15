var n0=Object.defineProperty;var eu=r=>{throw TypeError(r)};var i0=(r,e,t)=>e in r?n0(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var L=(r,e,t)=>i0(r,typeof e!="symbol"?e+"":e,t),$l=(r,e,t)=>e.has(r)||eu("Cannot "+t);var Je=(r,e,t)=>($l(r,e,"read from private field"),t?t.call(r):e.get(r)),At=(r,e,t)=>e.has(r)?eu("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),wt=(r,e,t,n)=>($l(r,e,"write to private field"),n?n.call(r,t):e.set(r,t),t),ts=(r,e,t)=>($l(r,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ih="170",r0=0,tu=1,s0=2,Gp=1,o0=2,Ii=3,hr=0,Sn=1,xi=2,rr=0,Es=1,nu=2,iu=3,ru=4,a0=5,Tr=100,l0=101,c0=102,f0=103,h0=104,u0=200,d0=201,p0=202,m0=203,$c=204,jc=205,g0=206,_0=207,v0=208,x0=209,y0=210,S0=211,E0=212,M0=213,b0=214,qc=0,Yc=1,Kc=2,Ps=3,Jc=4,Zc=5,Qc=6,ef=7,Vp=0,w0=1,T0=2,sr=0,A0=1,R0=2,C0=3,D0=4,P0=5,I0=6,U0=7,Hp=300,Is=301,Us=302,tf=303,nf=304,vl=306,rf=1e3,Dr=1001,sf=1002,ii=1003,L0=1004,pa=1005,Gn=1006,jl=1007,Pr=1008,zi=1009,Wp=1010,Xp=1011,Po=1012,rh=1013,kr=1014,Ni=1015,Yo=1016,sh=1017,oh=1018,Ls=1020,$p=35902,jp=1021,qp=1022,ti=1023,Yp=1024,Kp=1025,Ms=1026,Fs=1027,Jp=1028,ah=1029,Zp=1030,lh=1031,ch=1033,$a=33776,ja=33777,qa=33778,Ya=33779,of=35840,af=35841,lf=35842,cf=35843,ff=36196,hf=37492,uf=37496,df=37808,pf=37809,mf=37810,gf=37811,_f=37812,vf=37813,xf=37814,yf=37815,Sf=37816,Ef=37817,Mf=37818,bf=37819,wf=37820,Tf=37821,Ka=36492,Af=36494,Rf=36495,Qp=36283,Cf=36284,Df=36285,Pf=36286,F0=3200,em=3201,tm=0,N0=1,tr="",Un="srgb",Hs="srgb-linear",xl="linear",St="srgb",ns=7680,su=519,O0=512,B0=513,k0=514,nm=515,z0=516,G0=517,V0=518,H0=519,ou=35044,au="300 es",Oi=2e3,il=2001;class Ws{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ql=Math.PI/180,If=180/Math.PI;function Ko(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(en[r&255]+en[r>>8&255]+en[r>>16&255]+en[r>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]).toLowerCase()}function vn(r,e,t){return Math.max(e,Math.min(t,r))}function W0(r,e){return(r%e+e)%e}function Yl(r,e,t){return(1-t)*r+t*e}function lo(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function gn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}class st{constructor(e=0,t=0){st.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*i+e.x,this.y=s*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class et{constructor(e,t,n,i,s,o,a,l,c){et.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,l,c)}set(e,t,n,i,s,o,a,l,c){const f=this.elements;return f[0]=e,f[1]=i,f[2]=a,f[3]=t,f[4]=s,f[5]=l,f[6]=n,f[7]=o,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],f=n[4],h=n[7],u=n[2],d=n[5],g=n[8],_=i[0],m=i[3],p=i[6],y=i[1],E=i[4],v=i[7],C=i[2],R=i[5],T=i[8];return s[0]=o*_+a*y+l*C,s[3]=o*m+a*E+l*R,s[6]=o*p+a*v+l*T,s[1]=c*_+f*y+h*C,s[4]=c*m+f*E+h*R,s[7]=c*p+f*v+h*T,s[2]=u*_+d*y+g*C,s[5]=u*m+d*E+g*R,s[8]=u*p+d*v+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8];return t*o*f-t*a*c-n*s*f+n*a*l+i*s*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8],h=f*o-a*c,u=a*l-f*s,d=c*s-o*l,g=t*h+n*u+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(i*c-f*n)*_,e[2]=(a*n-i*o)*_,e[3]=u*_,e[4]=(f*t-i*l)*_,e[5]=(i*s-a*t)*_,e[6]=d*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Kl.makeScale(e,t)),this}rotate(e){return this.premultiply(Kl.makeRotation(-e)),this}translate(e,t){return this.premultiply(Kl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Kl=new et;function im(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function rl(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function X0(){const r=rl("canvas");return r.style.display="block",r}const lu={};function yo(r){r in lu||(lu[r]=!0,console.warn(r))}function $0(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function j0(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function q0(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const dt={enabled:!0,workingColorSpace:Hs,spaces:{},convert:function(r,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===St&&(r.r=Bi(r.r),r.g=Bi(r.g),r.b=Bi(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===St&&(r.r=bs(r.r),r.g=bs(r.g),r.b=bs(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===tr?xl:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function Bi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function bs(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}const cu=[.64,.33,.3,.6,.15,.06],fu=[.2126,.7152,.0722],hu=[.3127,.329],uu=new et().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),du=new et().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);dt.define({[Hs]:{primaries:cu,whitePoint:hu,transfer:xl,toXYZ:uu,fromXYZ:du,luminanceCoefficients:fu,workingColorSpaceConfig:{unpackColorSpace:Un},outputColorSpaceConfig:{drawingBufferColorSpace:Un}},[Un]:{primaries:cu,whitePoint:hu,transfer:St,toXYZ:uu,fromXYZ:du,luminanceCoefficients:fu,outputColorSpaceConfig:{drawingBufferColorSpace:Un}}});let is;class Y0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{is===void 0&&(is=rl("canvas")),is.width=e.width,is.height=e.height;const n=is.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=is}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){const t=rl("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=Bi(s[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bi(t[n]/255)*255):t[n]=Bi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let K0=0;class rm{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:K0++}),this.uuid=Ko(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(Jl(i[o].image)):s.push(Jl(i[o]))}else s=Jl(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Jl(r){return typeof HTMLImageElement!="undefined"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&r instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&r instanceof ImageBitmap?Y0.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let J0=0;class on extends Ws{constructor(e=on.DEFAULT_IMAGE,t=on.DEFAULT_MAPPING,n=Dr,i=Dr,s=Gn,o=Pr,a=ti,l=zi,c=on.DEFAULT_ANISOTROPY,f=tr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:J0++}),this.uuid=Ko(),this.name="",this.source=new rm(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new st(0,0),this.repeat=new st(1,1),this.center=new st(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new et,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Hp)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case rf:e.x=e.x-Math.floor(e.x);break;case Dr:e.x=e.x<0?0:1;break;case sf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case rf:e.y=e.y-Math.floor(e.y);break;case Dr:e.y=e.y<0?0:1;break;case sf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}on.DEFAULT_IMAGE=null;on.DEFAULT_MAPPING=Hp;on.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,n=0,i=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],f=l[4],h=l[8],u=l[1],d=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(f-u)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,v=(d+1)/2,C=(p+1)/2,R=(f+u)/4,T=(h+_)/4,w=(g+m)/4;return E>v&&E>C?E<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(E),i=R/n,s=T/n):v>C?v<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(v),n=R/i,s=w/i):C<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(C),n=T/s,i=w/s),this.set(n,i,s,t),this}let y=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(u-f)*(u-f));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(h-_)/y,this.z=(u-f)/y,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Z0 extends Ws{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new on(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new rm(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class zr extends Z0{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class sm extends on{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ii,this.minFilter=ii,this.wrapR=Dr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Q0 extends on{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ii,this.minFilter=ii,this.wrapR=Dr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Jo{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,o,a){let l=n[i+0],c=n[i+1],f=n[i+2],h=n[i+3];const u=s[o+0],d=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=f,e[t+3]=h;return}if(a===1){e[t+0]=u,e[t+1]=d,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==u||c!==d||f!==g){let m=1-a;const p=l*u+c*d+f*g+h*_,y=p>=0?1:-1,E=1-p*p;if(E>Number.EPSILON){const C=Math.sqrt(E),R=Math.atan2(C,p*y);m=Math.sin(m*R)/C,a=Math.sin(a*R)/C}const v=a*y;if(l=l*m+u*v,c=c*m+d*v,f=f*m+g*v,h=h*m+_*v,m===1-a){const C=1/Math.sqrt(l*l+c*c+f*f+h*h);l*=C,c*=C,f*=C,h*=C}}e[t]=l,e[t+1]=c,e[t+2]=f,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,o){const a=n[i],l=n[i+1],c=n[i+2],f=n[i+3],h=s[o],u=s[o+1],d=s[o+2],g=s[o+3];return e[t]=a*g+f*h+l*d-c*u,e[t+1]=l*g+f*u+c*h-a*d,e[t+2]=c*g+f*d+a*u-l*h,e[t+3]=f*g-a*h-l*u-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),f=a(i/2),h=a(s/2),u=l(n/2),d=l(i/2),g=l(s/2);switch(o){case"XYZ":this._x=u*f*h+c*d*g,this._y=c*d*h-u*f*g,this._z=c*f*g+u*d*h,this._w=c*f*h-u*d*g;break;case"YXZ":this._x=u*f*h+c*d*g,this._y=c*d*h-u*f*g,this._z=c*f*g-u*d*h,this._w=c*f*h+u*d*g;break;case"ZXY":this._x=u*f*h-c*d*g,this._y=c*d*h+u*f*g,this._z=c*f*g+u*d*h,this._w=c*f*h-u*d*g;break;case"ZYX":this._x=u*f*h-c*d*g,this._y=c*d*h+u*f*g,this._z=c*f*g-u*d*h,this._w=c*f*h+u*d*g;break;case"YZX":this._x=u*f*h+c*d*g,this._y=c*d*h+u*f*g,this._z=c*f*g-u*d*h,this._w=c*f*h-u*d*g;break;case"XZY":this._x=u*f*h-c*d*g,this._y=c*d*h-u*f*g,this._z=c*f*g+u*d*h,this._w=c*f*h+u*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],f=t[6],h=t[10],u=n+a+h;if(u>0){const d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(s-c)*d,this._z=(o-i)*d}else if(n>a&&n>h){const d=2*Math.sqrt(1+n-a-h);this._w=(f-l)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(s+c)/d}else if(a>h){const d=2*Math.sqrt(1+a-n-h);this._w=(s-c)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(l+f)/d}else{const d=2*Math.sqrt(1+h-n-a);this._w=(o-i)/d,this._x=(s+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vn(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,f=t._w;return this._x=n*f+o*a+i*c-s*l,this._y=i*f+o*l+s*a-n*c,this._z=s*f+o*c+n*l-i*a,this._w=o*f-n*a-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const d=1-t;return this._w=d*o+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),f=Math.atan2(c,a),h=Math.sin((1-t)*f)/c,u=Math.sin(t*f)/c;return this._w=o*h+this._w*u,this._x=n*h+this._x*u,this._y=i*h+this._y*u,this._z=s*h+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Z{constructor(e=0,t=0,n=0){Z.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(pu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(pu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),f=2*(a*t-s*i),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*f,this.y=n+l*f+a*c-s*h,this.z=i+l*h+s*f-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-s*a,this.y=s*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Zl.copy(this).projectOnVector(e),this.sub(Zl)}reflect(e){return this.sub(Zl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vn(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Zl=new Z,pu=new Jo;class jr{constructor(e=new Z(1/0,1/0,1/0),t=new Z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint($n.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint($n.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=$n.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,$n):$n.fromBufferAttribute(s,o),$n.applyMatrix4(e.matrixWorld),this.expandByPoint($n);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ma.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ma.copy(n.boundingBox)),ma.applyMatrix4(e.matrixWorld),this.union(ma)}const i=e.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$n),$n.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(co),ga.subVectors(this.max,co),rs.subVectors(e.a,co),ss.subVectors(e.b,co),os.subVectors(e.c,co),ji.subVectors(ss,rs),qi.subVectors(os,ss),pr.subVectors(rs,os);let t=[0,-ji.z,ji.y,0,-qi.z,qi.y,0,-pr.z,pr.y,ji.z,0,-ji.x,qi.z,0,-qi.x,pr.z,0,-pr.x,-ji.y,ji.x,0,-qi.y,qi.x,0,-pr.y,pr.x,0];return!Ql(t,rs,ss,os,ga)||(t=[1,0,0,0,1,0,0,0,1],!Ql(t,rs,ss,os,ga))?!1:(_a.crossVectors(ji,qi),t=[_a.x,_a.y,_a.z],Ql(t,rs,ss,os,ga))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$n).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($n).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ti),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Ti=[new Z,new Z,new Z,new Z,new Z,new Z,new Z,new Z],$n=new Z,ma=new jr,rs=new Z,ss=new Z,os=new Z,ji=new Z,qi=new Z,pr=new Z,co=new Z,ga=new Z,_a=new Z,mr=new Z;function Ql(r,e,t,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){mr.fromArray(r,s);const a=i.x*Math.abs(mr.x)+i.y*Math.abs(mr.y)+i.z*Math.abs(mr.z),l=e.dot(mr),c=t.dot(mr),f=n.dot(mr);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>a)return!1}return!0}const e_=new jr,fo=new Z,ec=new Z;class Zo{constructor(e=new Z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):e_.setFromPoints(e).getCenter(n);let i=0;for(let s=0,o=e.length;s<o;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fo.subVectors(e,this.center);const t=fo.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(fo,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ec.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fo.copy(e.center).add(ec)),this.expandByPoint(fo.copy(e.center).sub(ec))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ai=new Z,tc=new Z,va=new Z,Yi=new Z,nc=new Z,xa=new Z,ic=new Z;class om{constructor(e=new Z,t=new Z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ai)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ai.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ai.copy(this.origin).addScaledVector(this.direction,t),Ai.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){tc.copy(e).add(t).multiplyScalar(.5),va.copy(t).sub(e).normalize(),Yi.copy(this.origin).sub(tc);const s=e.distanceTo(t)*.5,o=-this.direction.dot(va),a=Yi.dot(this.direction),l=-Yi.dot(va),c=Yi.lengthSq(),f=Math.abs(1-o*o);let h,u,d,g;if(f>0)if(h=o*l-a,u=o*a-l,g=s*f,h>=0)if(u>=-g)if(u<=g){const _=1/f;h*=_,u*=_,d=h*(h+o*u+2*a)+u*(o*h+u+2*l)+c}else u=s,h=Math.max(0,-(o*u+a)),d=-h*h+u*(u+2*l)+c;else u=-s,h=Math.max(0,-(o*u+a)),d=-h*h+u*(u+2*l)+c;else u<=-g?(h=Math.max(0,-(-o*s+a)),u=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+u*(u+2*l)+c):u<=g?(h=0,u=Math.min(Math.max(-s,-l),s),d=u*(u+2*l)+c):(h=Math.max(0,-(o*s+a)),u=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+u*(u+2*l)+c);else u=o>0?-s:s,h=Math.max(0,-(o*u+a)),d=-h*h+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(tc).addScaledVector(va,u),d}intersectSphere(e,t){Ai.subVectors(e.center,this.origin);const n=Ai.dot(this.direction),i=Ai.dot(Ai)-n*n,s=e.radius*e.radius;if(i>s)return null;const o=Math.sqrt(s-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,o,a,l;const c=1/this.direction.x,f=1/this.direction.y,h=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,i=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,i=(e.min.x-u.x)*c),f>=0?(s=(e.min.y-u.y)*f,o=(e.max.y-u.y)*f):(s=(e.max.y-u.y)*f,o=(e.min.y-u.y)*f),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),h>=0?(a=(e.min.z-u.z)*h,l=(e.max.z-u.z)*h):(a=(e.max.z-u.z)*h,l=(e.min.z-u.z)*h),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Ai)!==null}intersectTriangle(e,t,n,i,s){nc.subVectors(t,e),xa.subVectors(n,e),ic.crossVectors(nc,xa);let o=this.direction.dot(ic),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Yi.subVectors(this.origin,e);const l=a*this.direction.dot(xa.crossVectors(Yi,xa));if(l<0)return null;const c=a*this.direction.dot(nc.cross(Yi));if(c<0||l+c>o)return null;const f=-a*Yi.dot(ic);return f<0?null:this.at(f/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Tt{constructor(e,t,n,i,s,o,a,l,c,f,h,u,d,g,_,m){Tt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,o,a,l,c,f,h,u,d,g,_,m)}set(e,t,n,i,s,o,a,l,c,f,h,u,d,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=f,p[10]=h,p[14]=u,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Tt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/as.setFromMatrixColumn(e,0).length(),s=1/as.setFromMatrixColumn(e,1).length(),o=1/as.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),f=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const u=o*f,d=o*h,g=a*f,_=a*h;t[0]=l*f,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=u-_*c,t[9]=-a*l,t[2]=_-u*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){const u=l*f,d=l*h,g=c*f,_=c*h;t[0]=u+_*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*f,t[9]=-a,t[2]=d*a-g,t[6]=_+u*a,t[10]=o*l}else if(e.order==="ZXY"){const u=l*f,d=l*h,g=c*f,_=c*h;t[0]=u-_*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*f,t[9]=_-u*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const u=o*f,d=o*h,g=a*f,_=a*h;t[0]=l*f,t[4]=g*c-d,t[8]=u*c+_,t[1]=l*h,t[5]=_*c+u,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const u=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*f,t[4]=_-u*h,t[8]=g*h+d,t[1]=h,t[5]=o*f,t[9]=-a*f,t[2]=-c*f,t[6]=d*h+g,t[10]=u-_*h}else if(e.order==="XZY"){const u=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*f,t[4]=-h,t[8]=c*f,t[1]=u*h+_,t[5]=o*f,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*f,t[10]=_*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(t_,e,n_)}lookAt(e,t,n){const i=this.elements;return Rn.subVectors(e,t),Rn.lengthSq()===0&&(Rn.z=1),Rn.normalize(),Ki.crossVectors(n,Rn),Ki.lengthSq()===0&&(Math.abs(n.z)===1?Rn.x+=1e-4:Rn.z+=1e-4,Rn.normalize(),Ki.crossVectors(n,Rn)),Ki.normalize(),ya.crossVectors(Rn,Ki),i[0]=Ki.x,i[4]=ya.x,i[8]=Rn.x,i[1]=Ki.y,i[5]=ya.y,i[9]=Rn.y,i[2]=Ki.z,i[6]=ya.z,i[10]=Rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],f=n[1],h=n[5],u=n[9],d=n[13],g=n[2],_=n[6],m=n[10],p=n[14],y=n[3],E=n[7],v=n[11],C=n[15],R=i[0],T=i[4],w=i[8],S=i[12],x=i[1],F=i[5],I=i[9],M=i[13],P=i[2],O=i[6],U=i[10],B=i[14],z=i[3],X=i[7],V=i[11],N=i[15];return s[0]=o*R+a*x+l*P+c*z,s[4]=o*T+a*F+l*O+c*X,s[8]=o*w+a*I+l*U+c*V,s[12]=o*S+a*M+l*B+c*N,s[1]=f*R+h*x+u*P+d*z,s[5]=f*T+h*F+u*O+d*X,s[9]=f*w+h*I+u*U+d*V,s[13]=f*S+h*M+u*B+d*N,s[2]=g*R+_*x+m*P+p*z,s[6]=g*T+_*F+m*O+p*X,s[10]=g*w+_*I+m*U+p*V,s[14]=g*S+_*M+m*B+p*N,s[3]=y*R+E*x+v*P+C*z,s[7]=y*T+E*F+v*O+C*X,s[11]=y*w+E*I+v*U+C*V,s[15]=y*S+E*M+v*B+C*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],f=e[2],h=e[6],u=e[10],d=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*l*h-i*c*h-s*a*u+n*c*u+i*a*d-n*l*d)+_*(+t*l*d-t*c*u+s*o*u-i*o*d+i*c*f-s*l*f)+m*(+t*c*h-t*a*d-s*o*h+n*o*d+s*a*f-n*c*f)+p*(-i*a*f-t*l*h+t*a*u+i*o*h-n*o*u+n*l*f)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],f=e[8],h=e[9],u=e[10],d=e[11],g=e[12],_=e[13],m=e[14],p=e[15],y=h*m*c-_*u*c+_*l*d-a*m*d-h*l*p+a*u*p,E=g*u*c-f*m*c-g*l*d+o*m*d+f*l*p-o*u*p,v=f*_*c-g*h*c+g*a*d-o*_*d-f*a*p+o*h*p,C=g*h*l-f*_*l-g*a*u+o*_*u+f*a*m-o*h*m,R=t*y+n*E+i*v+s*C;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/R;return e[0]=y*T,e[1]=(_*u*s-h*m*s-_*i*d+n*m*d+h*i*p-n*u*p)*T,e[2]=(a*m*s-_*l*s+_*i*c-n*m*c-a*i*p+n*l*p)*T,e[3]=(h*l*s-a*u*s-h*i*c+n*u*c+a*i*d-n*l*d)*T,e[4]=E*T,e[5]=(f*m*s-g*u*s+g*i*d-t*m*d-f*i*p+t*u*p)*T,e[6]=(g*l*s-o*m*s-g*i*c+t*m*c+o*i*p-t*l*p)*T,e[7]=(o*u*s-f*l*s+f*i*c-t*u*c-o*i*d+t*l*d)*T,e[8]=v*T,e[9]=(g*h*s-f*_*s-g*n*d+t*_*d+f*n*p-t*h*p)*T,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*p+t*a*p)*T,e[11]=(f*a*s-o*h*s-f*n*c+t*h*c+o*n*d-t*a*d)*T,e[12]=C*T,e[13]=(f*_*i-g*h*i+g*n*u-t*_*u-f*n*m+t*h*m)*T,e[14]=(g*a*i-o*_*i-g*n*l+t*_*l+o*n*m-t*a*m)*T,e[15]=(o*h*i-f*a*i+f*n*l-t*h*l-o*n*u+t*a*u)*T,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,f=s*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,f*a+n,f*l-i*o,0,c*l-i*a,f*l+i*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,o){return this.set(1,n,s,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,f=o+o,h=a+a,u=s*c,d=s*f,g=s*h,_=o*f,m=o*h,p=a*h,y=l*c,E=l*f,v=l*h,C=n.x,R=n.y,T=n.z;return i[0]=(1-(_+p))*C,i[1]=(d+v)*C,i[2]=(g-E)*C,i[3]=0,i[4]=(d-v)*R,i[5]=(1-(u+p))*R,i[6]=(m+y)*R,i[7]=0,i[8]=(g+E)*T,i[9]=(m-y)*T,i[10]=(1-(u+_))*T,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=as.set(i[0],i[1],i[2]).length();const o=as.set(i[4],i[5],i[6]).length(),a=as.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],jn.copy(this);const c=1/s,f=1/o,h=1/a;return jn.elements[0]*=c,jn.elements[1]*=c,jn.elements[2]*=c,jn.elements[4]*=f,jn.elements[5]*=f,jn.elements[6]*=f,jn.elements[8]*=h,jn.elements[9]*=h,jn.elements[10]*=h,t.setFromRotationMatrix(jn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,i,s,o,a=Oi){const l=this.elements,c=2*s/(t-e),f=2*s/(n-i),h=(t+e)/(t-e),u=(n+i)/(n-i);let d,g;if(a===Oi)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===il)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,o,a=Oi){const l=this.elements,c=1/(t-e),f=1/(n-i),h=1/(o-s),u=(t+e)*c,d=(n+i)*f;let g,_;if(a===Oi)g=(o+s)*h,_=-2*h;else if(a===il)g=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*f,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const as=new Z,jn=new Tt,t_=new Z(0,0,0),n_=new Z(1,1,1),Ki=new Z,ya=new Z,Rn=new Z,mu=new Tt,gu=new Jo;class oi{constructor(e=0,t=0,n=0,i=oi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],o=i[4],a=i[8],l=i[1],c=i[5],f=i[9],h=i[2],u=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(vn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-vn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(vn(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-vn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(vn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-vn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-f,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return mu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(mu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return gu.setFromEuler(this),this.setFromQuaternion(gu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}oi.DEFAULT_ORDER="XYZ";class am{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let i_=0;const _u=new Z,ls=new Jo,Ri=new Tt,Sa=new Z,ho=new Z,r_=new Z,s_=new Jo,vu=new Z(1,0,0),xu=new Z(0,1,0),yu=new Z(0,0,1),Su={type:"added"},o_={type:"removed"},cs={type:"childadded",child:null},rc={type:"childremoved",child:null};class $t extends Ws{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:i_++}),this.uuid=Ko(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=$t.DEFAULT_UP.clone();const e=new Z,t=new oi,n=new Jo,i=new Z(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Tt},normalMatrix:{value:new et}}),this.matrix=new Tt,this.matrixWorld=new Tt,this.matrixAutoUpdate=$t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new am,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ls.setFromAxisAngle(e,t),this.quaternion.multiply(ls),this}rotateOnWorldAxis(e,t){return ls.setFromAxisAngle(e,t),this.quaternion.premultiply(ls),this}rotateX(e){return this.rotateOnAxis(vu,e)}rotateY(e){return this.rotateOnAxis(xu,e)}rotateZ(e){return this.rotateOnAxis(yu,e)}translateOnAxis(e,t){return _u.copy(e).applyQuaternion(this.quaternion),this.position.add(_u.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vu,e)}translateY(e){return this.translateOnAxis(xu,e)}translateZ(e){return this.translateOnAxis(yu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ri.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Sa.copy(e):Sa.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ho.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ri.lookAt(ho,Sa,this.up):Ri.lookAt(Sa,ho,this.up),this.quaternion.setFromRotationMatrix(Ri),i&&(Ri.extractRotation(i.matrixWorld),ls.setFromRotationMatrix(Ri),this.quaternion.premultiply(ls.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Su),cs.child=e,this.dispatchEvent(cs),cs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(o_),rc.child=e,this.dispatchEvent(rc),rc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ri.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ri.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ri),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Su),cs.child=e,this.dispatchEvent(cs),cs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ho,e,r_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ho,s_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));i.material=a}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),f=o(e.images),h=o(e.shapes),u=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),f.length>0&&(n.images=f),h.length>0&&(n.shapes=h),u.length>0&&(n.skeletons=u),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const f=a[c];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}$t.DEFAULT_UP=new Z(0,1,0);$t.DEFAULT_MATRIX_AUTO_UPDATE=!0;$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const qn=new Z,Ci=new Z,sc=new Z,Di=new Z,fs=new Z,hs=new Z,Eu=new Z,oc=new Z,ac=new Z,lc=new Z,fc=new xt,hc=new xt,uc=new xt;class ei{constructor(e=new Z,t=new Z,n=new Z){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),qn.subVectors(e,t),i.cross(qn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){qn.subVectors(i,t),Ci.subVectors(n,t),sc.subVectors(e,t);const o=qn.dot(qn),a=qn.dot(Ci),l=qn.dot(sc),c=Ci.dot(Ci),f=Ci.dot(sc),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const u=1/h,d=(c*l-a*f)*u,g=(o*f-a*l)*u;return s.set(1-d-g,g,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Di)===null?!1:Di.x>=0&&Di.y>=0&&Di.x+Di.y<=1}static getInterpolation(e,t,n,i,s,o,a,l){return this.getBarycoord(e,t,n,i,Di)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Di.x),l.addScaledVector(o,Di.y),l.addScaledVector(a,Di.z),l)}static getInterpolatedAttribute(e,t,n,i,s,o){return fc.setScalar(0),hc.setScalar(0),uc.setScalar(0),fc.fromBufferAttribute(e,t),hc.fromBufferAttribute(e,n),uc.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(fc,s.x),o.addScaledVector(hc,s.y),o.addScaledVector(uc,s.z),o}static isFrontFacing(e,t,n,i){return qn.subVectors(n,t),Ci.subVectors(e,t),qn.cross(Ci).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qn.subVectors(this.c,this.b),Ci.subVectors(this.a,this.b),qn.cross(Ci).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ei.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ei.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return ei.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return ei.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ei.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let o,a;fs.subVectors(i,n),hs.subVectors(s,n),oc.subVectors(e,n);const l=fs.dot(oc),c=hs.dot(oc);if(l<=0&&c<=0)return t.copy(n);ac.subVectors(e,i);const f=fs.dot(ac),h=hs.dot(ac);if(f>=0&&h<=f)return t.copy(i);const u=l*h-f*c;if(u<=0&&l>=0&&f<=0)return o=l/(l-f),t.copy(n).addScaledVector(fs,o);lc.subVectors(e,s);const d=fs.dot(lc),g=hs.dot(lc);if(g>=0&&d<=g)return t.copy(s);const _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(hs,a);const m=f*g-d*h;if(m<=0&&h-f>=0&&d-g>=0)return Eu.subVectors(s,i),a=(h-f)/(h-f+(d-g)),t.copy(i).addScaledVector(Eu,a);const p=1/(m+_+u);return o=_*p,a=u*p,t.copy(n).addScaledVector(fs,o).addScaledVector(hs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const lm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ji={h:0,s:0,l:0},Ea={h:0,s:0,l:0};function dc(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class ot{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Un){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=dt.workingColorSpace){if(e=W0(e,1),t=vn(t,0,1),n=vn(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=dc(o,s,e+1/3),this.g=dc(o,s,e),this.b=dc(o,s,e-1/3)}return dt.toWorkingColorSpace(this,i),this}setStyle(e,t=Un){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Un){const n=lm[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bi(e.r),this.g=Bi(e.g),this.b=Bi(e.b),this}copyLinearToSRGB(e){return this.r=bs(e.r),this.g=bs(e.g),this.b=bs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Un){return dt.fromWorkingColorSpace(tn.copy(this),e),Math.round(vn(tn.r*255,0,255))*65536+Math.round(vn(tn.g*255,0,255))*256+Math.round(vn(tn.b*255,0,255))}getHexString(e=Un){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.fromWorkingColorSpace(tn.copy(this),t);const n=tn.r,i=tn.g,s=tn.b,o=Math.max(n,i,s),a=Math.min(n,i,s);let l,c;const f=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=f<=.5?h/(o+a):h/(2-o-a),o){case n:l=(i-s)/h+(i<s?6:0);break;case i:l=(s-n)/h+2;break;case s:l=(n-i)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=f,e}getRGB(e,t=dt.workingColorSpace){return dt.fromWorkingColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=Un){dt.fromWorkingColorSpace(tn.copy(this),e);const t=tn.r,n=tn.g,i=tn.b;return e!==Un?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Ji),this.setHSL(Ji.h+e,Ji.s+t,Ji.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ji),e.getHSL(Ea);const n=Yl(Ji.h,Ea.h,t),i=Yl(Ji.s,Ea.s,t),s=Yl(Ji.l,Ea.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new ot;ot.NAMES=lm;let a_=0;class Xs extends Ws{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:a_++}),this.uuid=Ko(),this.name="",this.blending=Es,this.side=hr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$c,this.blendDst=jc,this.blendEquation=Tr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ot(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=su,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ns,this.stencilZFail=ns,this.stencilZPass=ns,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Es&&(n.blending=this.blending),this.side!==hr&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==$c&&(n.blendSrc=this.blendSrc),this.blendDst!==jc&&(n.blendDst=this.blendDst),this.blendEquation!==Tr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ps&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==su&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ns&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ns&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ns&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=i(e.textures),o=i(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class fh extends Xs{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new oi,this.combine=Vp,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ut=new Z,Ma=new st;class Vn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ou,this.updateRanges=[],this.gpuType=Ni,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ma.fromBufferAttribute(this,t),Ma.applyMatrix3(e),this.setXY(t,Ma.x,Ma.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix3(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=lo(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=gn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=lo(t,this.array)),t}setX(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=lo(t,this.array)),t}setY(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=lo(t,this.array)),t}setZ(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=lo(t,this.array)),t}setW(e,t){return this.normalized&&(t=gn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array),i=gn(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=gn(t,this.array),n=gn(n,this.array),i=gn(i,this.array),s=gn(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ou&&(e.usage=this.usage),e}}class cm extends Vn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class fm extends Vn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class kt extends Vn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let l_=0;const Bn=new Tt,pc=new $t,us=new Z,Cn=new jr,uo=new jr,Ht=new Z;class Mn extends Ws{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:l_++}),this.uuid=Ko(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(im(e)?fm:cm)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new et().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Bn.makeRotationFromQuaternion(e),this.applyMatrix4(Bn),this}rotateX(e){return Bn.makeRotationX(e),this.applyMatrix4(Bn),this}rotateY(e){return Bn.makeRotationY(e),this.applyMatrix4(Bn),this}rotateZ(e){return Bn.makeRotationZ(e),this.applyMatrix4(Bn),this}translate(e,t,n){return Bn.makeTranslation(e,t,n),this.applyMatrix4(Bn),this}scale(e,t,n){return Bn.makeScale(e,t,n),this.applyMatrix4(Bn),this}lookAt(e){return pc.lookAt(e),pc.updateMatrix(),this.applyMatrix4(pc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(us).negate(),this.translate(us.x,us.y,us.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new kt(n,3))}else{for(let n=0,i=t.count;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Z(-1/0,-1/0,-1/0),new Z(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];Cn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ht.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint(Ht),Ht.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint(Ht)):(this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Z,1/0);return}if(e){const n=this.boundingSphere.center;if(Cn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];uo.setFromBufferAttribute(a),this.morphTargetsRelative?(Ht.addVectors(Cn.min,uo.min),Cn.expandByPoint(Ht),Ht.addVectors(Cn.max,uo.max),Cn.expandByPoint(Ht)):(Cn.expandByPoint(uo.min),Cn.expandByPoint(uo.max))}Cn.getCenter(n);let i=0;for(let s=0,o=e.count;s<o;s++)Ht.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Ht));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,f=a.count;c<f;c++)Ht.fromBufferAttribute(a,c),l&&(us.fromBufferAttribute(e,c),Ht.add(us)),i=Math.max(i,n.distanceToSquared(Ht))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Vn(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let w=0;w<n.count;w++)a[w]=new Z,l[w]=new Z;const c=new Z,f=new Z,h=new Z,u=new st,d=new st,g=new st,_=new Z,m=new Z;function p(w,S,x){c.fromBufferAttribute(n,w),f.fromBufferAttribute(n,S),h.fromBufferAttribute(n,x),u.fromBufferAttribute(s,w),d.fromBufferAttribute(s,S),g.fromBufferAttribute(s,x),f.sub(c),h.sub(c),d.sub(u),g.sub(u);const F=1/(d.x*g.y-g.x*d.y);isFinite(F)&&(_.copy(f).multiplyScalar(g.y).addScaledVector(h,-d.y).multiplyScalar(F),m.copy(h).multiplyScalar(d.x).addScaledVector(f,-g.x).multiplyScalar(F),a[w].add(_),a[S].add(_),a[x].add(_),l[w].add(m),l[S].add(m),l[x].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let w=0,S=y.length;w<S;++w){const x=y[w],F=x.start,I=x.count;for(let M=F,P=F+I;M<P;M+=3)p(e.getX(M+0),e.getX(M+1),e.getX(M+2))}const E=new Z,v=new Z,C=new Z,R=new Z;function T(w){C.fromBufferAttribute(i,w),R.copy(C);const S=a[w];E.copy(S),E.sub(C.multiplyScalar(C.dot(S))).normalize(),v.crossVectors(R,S);const F=v.dot(l[w])<0?-1:1;o.setXYZW(w,E.x,E.y,E.z,F)}for(let w=0,S=y.length;w<S;++w){const x=y[w],F=x.start,I=x.count;for(let M=F,P=F+I;M<P;M+=3)T(e.getX(M+0)),T(e.getX(M+1)),T(e.getX(M+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Vn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);const i=new Z,s=new Z,o=new Z,a=new Z,l=new Z,c=new Z,f=new Z,h=new Z;if(e)for(let u=0,d=e.count;u<d;u+=3){const g=e.getX(u+0),_=e.getX(u+1),m=e.getX(u+2);i.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),f.subVectors(o,s),h.subVectors(i,s),f.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(f),l.add(f),c.add(f),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=t.count;u<d;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),f.subVectors(o,s),h.subVectors(i,s),f.cross(h),n.setXYZ(u+0,f.x,f.y,f.z),n.setXYZ(u+1,f.x,f.y,f.z),n.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ht.fromBufferAttribute(e,t),Ht.normalize(),e.setXYZ(t,Ht.x,Ht.y,Ht.z)}toNonIndexed(){function e(a,l){const c=a.array,f=a.itemSize,h=a.normalized,u=new c.constructor(l.length*f);let d=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*f;for(let p=0;p<f;p++)u[g++]=c[d++]}return new Vn(u,f,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Mn,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let f=0,h=c.length;f<h;f++){const u=c[f],d=e(u,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],f=[];for(let h=0,u=c.length;h<u;h++){const d=c[h];f.push(d.toJSON(e.data))}f.length>0&&(i[l]=f,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const f=i[c];this.setAttribute(c,f.clone(t))}const s=e.morphAttributes;for(const c in s){const f=[],h=s[c];for(let u=0,d=h.length;u<d;u++)f.push(h[u].clone(t));this.morphAttributes[c]=f}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,f=o.length;c<f;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Mu=new Tt,gr=new om,ba=new Zo,bu=new Z,wa=new Z,Ta=new Z,Aa=new Z,mc=new Z,Ra=new Z,wu=new Z,Ca=new Z;class Jt extends $t{constructor(e=new Mn,t=new fh){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(s&&a){Ra.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const f=a[l],h=s[l];f!==0&&(mc.fromBufferAttribute(h,e),o?Ra.addScaledVector(mc,f):Ra.addScaledVector(mc.sub(t),f))}t.add(Ra)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ba.copy(n.boundingSphere),ba.applyMatrix4(s),gr.copy(e.ray).recast(e.near),!(ba.containsPoint(gr.origin)===!1&&(gr.intersectSphere(ba,bu)===null||gr.origin.distanceToSquared(bu)>(e.far-e.near)**2))&&(Mu.copy(s).invert(),gr.copy(e.ray).applyMatrix4(Mu),!(n.boundingBox!==null&&gr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,gr)))}_computeIntersections(e,t,n){let i;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,f=s.attributes.uv1,h=s.attributes.normal,u=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),E=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,C=E;v<C;v+=3){const R=a.getX(v),T=a.getX(v+1),w=a.getX(v+2);i=Da(this,p,e,n,c,f,h,R,T,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=a.getX(m),E=a.getX(m+1),v=a.getX(m+2);i=Da(this,o,e,n,c,f,h,y,E,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),E=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,C=E;v<C;v+=3){const R=v,T=v+1,w=v+2;i=Da(this,p,e,n,c,f,h,R,T,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=m,E=m+1,v=m+2;i=Da(this,o,e,n,c,f,h,y,E,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function c_(r,e,t,n,i,s,o,a){let l;if(e.side===Sn?l=n.intersectTriangle(o,s,i,!0,a):l=n.intersectTriangle(i,s,o,e.side===hr,a),l===null)return null;Ca.copy(a),Ca.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(Ca);return c<t.near||c>t.far?null:{distance:c,point:Ca.clone(),object:r}}function Da(r,e,t,n,i,s,o,a,l,c){r.getVertexPosition(a,wa),r.getVertexPosition(l,Ta),r.getVertexPosition(c,Aa);const f=c_(r,e,t,n,wa,Ta,Aa,wu);if(f){const h=new Z;ei.getBarycoord(wu,wa,Ta,Aa,h),i&&(f.uv=ei.getInterpolatedAttribute(i,a,l,c,h,new st)),s&&(f.uv1=ei.getInterpolatedAttribute(s,a,l,c,h,new st)),o&&(f.normal=ei.getInterpolatedAttribute(o,a,l,c,h,new Z),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new Z,materialIndex:0};ei.getNormal(wa,Ta,Aa,u.normal),f.face=u,f.barycoord=h}return f}class $s extends Mn{constructor(e=1,t=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};const a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],f=[],h=[];let u=0,d=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,s,4),g("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new kt(c,3)),this.setAttribute("normal",new kt(f,3)),this.setAttribute("uv",new kt(h,2));function g(_,m,p,y,E,v,C,R,T,w,S){const x=v/T,F=C/w,I=v/2,M=C/2,P=R/2,O=T+1,U=w+1;let B=0,z=0;const X=new Z;for(let V=0;V<U;V++){const N=V*F-M;for(let $=0;$<O;$++){const ne=$*x-I;X[_]=ne*y,X[m]=N*E,X[p]=P,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=R>0?1:-1,f.push(X.x,X.y,X.z),h.push($/T),h.push(1-V/w),B+=1}}for(let V=0;V<w;V++)for(let N=0;N<T;N++){const $=u+N+O*V,ne=u+N+O*(V+1),k=u+(N+1)+O*(V+1),H=u+(N+1)+O*V;l.push($,ne,H),l.push(ne,k,H),z+=6}a.addGroup(d,z,S),d+=z,u+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ns(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function ln(r){const e={};for(let t=0;t<r.length;t++){const n=Ns(r[t]);for(const i in n)e[i]=n[i]}return e}function f_(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function hm(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}const um={clone:Ns,merge:ln};var h_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,u_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ur extends Xs{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=h_,this.fragmentShader=u_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ns(e.uniforms),this.uniformsGroups=f_(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class dm extends $t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Tt,this.projectionMatrix=new Tt,this.projectionMatrixInverse=new Tt,this.coordinateSystem=Oi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Zi=new Z,Tu=new st,Au=new st;class Ln extends dm{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=If*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ql*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return If*2*Math.atan(Math.tan(ql*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z),Zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z)}getViewSize(e,t){return this.getViewBounds(e,Tu,Au),t.subVectors(Au,Tu)}setViewOffset(e,t,n,i,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ql*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ds=-90,ps=1;class d_ extends $t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Ln(ds,ps,e,t);i.layers=this.layers,this.add(i);const s=new Ln(ds,ps,e,t);s.layers=this.layers,this.add(s);const o=new Ln(ds,ps,e,t);o.layers=this.layers,this.add(o);const a=new Ln(ds,ps,e,t);a.layers=this.layers,this.add(a);const l=new Ln(ds,ps,e,t);l.layers=this.layers,this.add(l);const c=new Ln(ds,ps,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===Oi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===il)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,f]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,f),e.setRenderTarget(h,u,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class pm extends on{constructor(e,t,n,i,s,o,a,l,c,f){e=e!==void 0?e:[],t=t!==void 0?t:Is,super(e,t,n,i,s,o,a,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class p_ extends zr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new pm(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Gn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new $s(5,5,5),s=new ur({name:"CubemapFromEquirect",uniforms:Ns(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Sn,blending:rr});s.uniforms.tEquirect.value=t;const o=new Jt(i,s),a=t.minFilter;return t.minFilter===Pr&&(t.minFilter=Gn),new d_(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(s)}}const gc=new Z,m_=new Z,g_=new et;class Mr{constructor(e=new Z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=gc.subVectors(n,t).cross(m_.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(gc),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||g_.getNormalMatrix(e),i=this.coplanarPoint(gc).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const _r=new Zo,Pa=new Z;class hh{constructor(e=new Mr,t=new Mr,n=new Mr,i=new Mr,s=new Mr,o=new Mr){this.planes=[e,t,n,i,s,o]}set(e,t,n,i,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Oi){const n=this.planes,i=e.elements,s=i[0],o=i[1],a=i[2],l=i[3],c=i[4],f=i[5],h=i[6],u=i[7],d=i[8],g=i[9],_=i[10],m=i[11],p=i[12],y=i[13],E=i[14],v=i[15];if(n[0].setComponents(l-s,u-c,m-d,v-p).normalize(),n[1].setComponents(l+s,u+c,m+d,v+p).normalize(),n[2].setComponents(l+o,u+f,m+g,v+y).normalize(),n[3].setComponents(l-o,u-f,m-g,v-y).normalize(),n[4].setComponents(l-a,u-h,m-_,v-E).normalize(),t===Oi)n[5].setComponents(l+a,u+h,m+_,v+E).normalize();else if(t===il)n[5].setComponents(a,h,_,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),_r.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),_r.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(_r)}intersectsSprite(e){return _r.center.set(0,0,0),_r.radius=.7071067811865476,_r.applyMatrix4(e.matrixWorld),this.intersectsSphere(_r)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Pa.x=i.normal.x>0?e.max.x:e.min.x,Pa.y=i.normal.y>0?e.max.y:e.min.y,Pa.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Pa)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function mm(){let r=null,e=!1,t=null,n=null;function i(s,o){t(s,o),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function __(r){const e=new WeakMap;function t(a,l){const c=a.array,f=a.usage,h=c.byteLength,u=r.createBuffer();r.bindBuffer(l,u),r.bufferData(l,c,f),a.onUploadCallback();let d;if(c instanceof Float32Array)d=r.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=r.HALF_FLOAT:d=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=r.SHORT;else if(c instanceof Uint32Array)d=r.UNSIGNED_INT;else if(c instanceof Int32Array)d=r.INT;else if(c instanceof Int8Array)d=r.BYTE;else if(c instanceof Uint8Array)d=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const f=l.array,h=l.updateRanges;if(r.bindBuffer(c,a),h.length===0)r.bufferSubData(c,0,f);else{h.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<h.length;d++){const g=h[u],_=h[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,h[u]=_)}h.length=u+1;for(let d=0,g=h.length;d<g;d++){const _=h[d];r.bufferSubData(c,_.start*f.BYTES_PER_ELEMENT,f,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(r.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const f=e.get(a);(!f||f.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:s,update:o}}class qr extends Mn{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,f=l+1,h=e/a,u=t/l,d=[],g=[],_=[],m=[];for(let p=0;p<f;p++){const y=p*u-o;for(let E=0;E<c;E++){const v=E*h-s;g.push(v,-y,0),_.push(0,0,1),m.push(E/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){const E=y+c*p,v=y+c*(p+1),C=y+1+c*(p+1),R=y+1+c*p;d.push(E,v,R),d.push(v,C,R)}this.setIndex(d),this.setAttribute("position",new kt(g,3)),this.setAttribute("normal",new kt(_,3)),this.setAttribute("uv",new kt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qr(e.width,e.height,e.widthSegments,e.heightSegments)}}var v_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,x_=`#ifdef USE_ALPHAHASH
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
#endif`,y_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,S_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,E_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,M_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,b_=`#ifdef USE_AOMAP
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
#endif`,w_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,T_=`#ifdef USE_BATCHING
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
#endif`,A_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,R_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,C_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,D_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,P_=`#ifdef USE_IRIDESCENCE
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
#endif`,I_=`#ifdef USE_BUMPMAP
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
#endif`,U_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,L_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,F_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,N_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,O_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,B_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,k_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,z_=`#if defined( USE_COLOR_ALPHA )
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
#endif`,G_=`#define PI 3.141592653589793
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
} // validated`,V_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,H_=`vec3 transformedNormal = objectNormal;
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
#endif`,W_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,X_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,j_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,q_="gl_FragColor = linearToOutputTexel( gl_FragColor );",Y_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,K_=`#ifdef USE_ENVMAP
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
#endif`,J_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Z_=`#ifdef USE_ENVMAP
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
#endif`,Q_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ev=`#ifdef USE_ENVMAP
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
#endif`,tv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,iv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sv=`#ifdef USE_GRADIENTMAP
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
}`,ov=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,av=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cv=`uniform bool receiveShadow;
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
#endif`,fv=`#ifdef USE_ENVMAP
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
#endif`,hv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,uv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,dv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mv=`PhysicalMaterial material;
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
#endif`,gv=`struct PhysicalMaterial {
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
}`,_v=`
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
#endif`,vv=`#if defined( RE_IndirectDiffuse )
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
#endif`,xv=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,yv=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Sv=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ev=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mv=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Tv=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Av=`#if defined( USE_POINTS_UV )
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
#endif`,Rv=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Dv=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Pv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Iv=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Uv=`#ifdef USE_MORPHTARGETS
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
#endif`,Lv=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Nv=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Ov=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Bv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,zv=`#ifdef USE_NORMALMAP
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
#endif`,Gv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Wv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Xv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$v=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,jv=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qv=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Yv=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Kv=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Jv=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Qv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ex=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,tx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,nx=`float getShadowMask() {
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
}`,ix=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rx=`#ifdef USE_SKINNING
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
#endif`,sx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ox=`#ifdef USE_SKINNING
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
#endif`,ax=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,hx=`#ifdef USE_TRANSMISSION
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
#endif`,ux=`#ifdef USE_TRANSMISSION
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
#endif`,dx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,px=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const _x=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vx=`uniform sampler2D t2D;
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
}`,xx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yx=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ex=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mx=`#include <common>
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
}`,bx=`#if DEPTH_PACKING == 3200
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
}`,wx=`#define DISTANCE
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
}`,Tx=`#define DISTANCE
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
}`,Ax=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Rx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cx=`uniform float scale;
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
}`,Dx=`uniform vec3 diffuse;
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
}`,Px=`#include <common>
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
}`,Ix=`uniform vec3 diffuse;
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
}`,Ux=`#define LAMBERT
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
}`,Lx=`#define LAMBERT
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
}`,Fx=`#define MATCAP
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
}`,Nx=`#define MATCAP
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
}`,Ox=`#define NORMAL
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
}`,Bx=`#define NORMAL
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
}`,kx=`#define PHONG
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
}`,zx=`#define PHONG
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
}`,Gx=`#define STANDARD
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
}`,Vx=`#define STANDARD
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
}`,Hx=`#define TOON
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
}`,Wx=`#define TOON
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
}`,Xx=`uniform float size;
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
}`,$x=`uniform vec3 diffuse;
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
}`,jx=`#include <common>
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
}`,qx=`uniform vec3 color;
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
}`,Yx=`uniform float rotation;
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
}`,Kx=`uniform vec3 diffuse;
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
}`,it={alphahash_fragment:v_,alphahash_pars_fragment:x_,alphamap_fragment:y_,alphamap_pars_fragment:S_,alphatest_fragment:E_,alphatest_pars_fragment:M_,aomap_fragment:b_,aomap_pars_fragment:w_,batching_pars_vertex:T_,batching_vertex:A_,begin_vertex:R_,beginnormal_vertex:C_,bsdfs:D_,iridescence_fragment:P_,bumpmap_pars_fragment:I_,clipping_planes_fragment:U_,clipping_planes_pars_fragment:L_,clipping_planes_pars_vertex:F_,clipping_planes_vertex:N_,color_fragment:O_,color_pars_fragment:B_,color_pars_vertex:k_,color_vertex:z_,common:G_,cube_uv_reflection_fragment:V_,defaultnormal_vertex:H_,displacementmap_pars_vertex:W_,displacementmap_vertex:X_,emissivemap_fragment:$_,emissivemap_pars_fragment:j_,colorspace_fragment:q_,colorspace_pars_fragment:Y_,envmap_fragment:K_,envmap_common_pars_fragment:J_,envmap_pars_fragment:Z_,envmap_pars_vertex:Q_,envmap_physical_pars_fragment:fv,envmap_vertex:ev,fog_vertex:tv,fog_pars_vertex:nv,fog_fragment:iv,fog_pars_fragment:rv,gradientmap_pars_fragment:sv,lightmap_pars_fragment:ov,lights_lambert_fragment:av,lights_lambert_pars_fragment:lv,lights_pars_begin:cv,lights_toon_fragment:hv,lights_toon_pars_fragment:uv,lights_phong_fragment:dv,lights_phong_pars_fragment:pv,lights_physical_fragment:mv,lights_physical_pars_fragment:gv,lights_fragment_begin:_v,lights_fragment_maps:vv,lights_fragment_end:xv,logdepthbuf_fragment:yv,logdepthbuf_pars_fragment:Sv,logdepthbuf_pars_vertex:Ev,logdepthbuf_vertex:Mv,map_fragment:bv,map_pars_fragment:wv,map_particle_fragment:Tv,map_particle_pars_fragment:Av,metalnessmap_fragment:Rv,metalnessmap_pars_fragment:Cv,morphinstance_vertex:Dv,morphcolor_vertex:Pv,morphnormal_vertex:Iv,morphtarget_pars_vertex:Uv,morphtarget_vertex:Lv,normal_fragment_begin:Fv,normal_fragment_maps:Nv,normal_pars_fragment:Ov,normal_pars_vertex:Bv,normal_vertex:kv,normalmap_pars_fragment:zv,clearcoat_normal_fragment_begin:Gv,clearcoat_normal_fragment_maps:Vv,clearcoat_pars_fragment:Hv,iridescence_pars_fragment:Wv,opaque_fragment:Xv,packing:$v,premultiplied_alpha_fragment:jv,project_vertex:qv,dithering_fragment:Yv,dithering_pars_fragment:Kv,roughnessmap_fragment:Jv,roughnessmap_pars_fragment:Zv,shadowmap_pars_fragment:Qv,shadowmap_pars_vertex:ex,shadowmap_vertex:tx,shadowmask_pars_fragment:nx,skinbase_vertex:ix,skinning_pars_vertex:rx,skinning_vertex:sx,skinnormal_vertex:ox,specularmap_fragment:ax,specularmap_pars_fragment:lx,tonemapping_fragment:cx,tonemapping_pars_fragment:fx,transmission_fragment:hx,transmission_pars_fragment:ux,uv_pars_fragment:dx,uv_pars_vertex:px,uv_vertex:mx,worldpos_vertex:gx,background_vert:_x,background_frag:vx,backgroundCube_vert:xx,backgroundCube_frag:yx,cube_vert:Sx,cube_frag:Ex,depth_vert:Mx,depth_frag:bx,distanceRGBA_vert:wx,distanceRGBA_frag:Tx,equirect_vert:Ax,equirect_frag:Rx,linedashed_vert:Cx,linedashed_frag:Dx,meshbasic_vert:Px,meshbasic_frag:Ix,meshlambert_vert:Ux,meshlambert_frag:Lx,meshmatcap_vert:Fx,meshmatcap_frag:Nx,meshnormal_vert:Ox,meshnormal_frag:Bx,meshphong_vert:kx,meshphong_frag:zx,meshphysical_vert:Gx,meshphysical_frag:Vx,meshtoon_vert:Hx,meshtoon_frag:Wx,points_vert:Xx,points_frag:$x,shadow_vert:jx,shadow_frag:qx,sprite_vert:Yx,sprite_frag:Kx},Ne={common:{diffuse:{value:new ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new et}},envmap:{envMap:{value:null},envMapRotation:{value:new et},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new et}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new et}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new et},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new et},normalScale:{value:new st(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new et},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new et}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new et}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new et}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0},uvTransform:{value:new et}},sprite:{diffuse:{value:new ot(16777215)},opacity:{value:1},center:{value:new st(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}}},vi={basic:{uniforms:ln([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.fog]),vertexShader:it.meshbasic_vert,fragmentShader:it.meshbasic_frag},lambert:{uniforms:ln([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new ot(0)}}]),vertexShader:it.meshlambert_vert,fragmentShader:it.meshlambert_frag},phong:{uniforms:ln([Ne.common,Ne.specularmap,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,Ne.lights,{emissive:{value:new ot(0)},specular:{value:new ot(1118481)},shininess:{value:30}}]),vertexShader:it.meshphong_vert,fragmentShader:it.meshphong_frag},standard:{uniforms:ln([Ne.common,Ne.envmap,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.roughnessmap,Ne.metalnessmap,Ne.fog,Ne.lights,{emissive:{value:new ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag},toon:{uniforms:ln([Ne.common,Ne.aomap,Ne.lightmap,Ne.emissivemap,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.gradientmap,Ne.fog,Ne.lights,{emissive:{value:new ot(0)}}]),vertexShader:it.meshtoon_vert,fragmentShader:it.meshtoon_frag},matcap:{uniforms:ln([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,Ne.fog,{matcap:{value:null}}]),vertexShader:it.meshmatcap_vert,fragmentShader:it.meshmatcap_frag},points:{uniforms:ln([Ne.points,Ne.fog]),vertexShader:it.points_vert,fragmentShader:it.points_frag},dashed:{uniforms:ln([Ne.common,Ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:it.linedashed_vert,fragmentShader:it.linedashed_frag},depth:{uniforms:ln([Ne.common,Ne.displacementmap]),vertexShader:it.depth_vert,fragmentShader:it.depth_frag},normal:{uniforms:ln([Ne.common,Ne.bumpmap,Ne.normalmap,Ne.displacementmap,{opacity:{value:1}}]),vertexShader:it.meshnormal_vert,fragmentShader:it.meshnormal_frag},sprite:{uniforms:ln([Ne.sprite,Ne.fog]),vertexShader:it.sprite_vert,fragmentShader:it.sprite_frag},background:{uniforms:{uvTransform:{value:new et},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:it.background_vert,fragmentShader:it.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new et}},vertexShader:it.backgroundCube_vert,fragmentShader:it.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:it.cube_vert,fragmentShader:it.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:it.equirect_vert,fragmentShader:it.equirect_frag},distanceRGBA:{uniforms:ln([Ne.common,Ne.displacementmap,{referencePosition:{value:new Z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:it.distanceRGBA_vert,fragmentShader:it.distanceRGBA_frag},shadow:{uniforms:ln([Ne.lights,Ne.fog,{color:{value:new ot(0)},opacity:{value:1}}]),vertexShader:it.shadow_vert,fragmentShader:it.shadow_frag}};vi.physical={uniforms:ln([vi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new et},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new et},clearcoatNormalScale:{value:new st(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new et},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new et},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new et},sheen:{value:0},sheenColor:{value:new ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new et},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new et},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new et},transmissionSamplerSize:{value:new st},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new et},attenuationDistance:{value:0},attenuationColor:{value:new ot(0)},specularColor:{value:new ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new et},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new et},anisotropyVector:{value:new st},anisotropyMap:{value:null},anisotropyMapTransform:{value:new et}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag};const Ia={r:0,b:0,g:0},vr=new oi,Jx=new Tt;function Zx(r,e,t,n,i,s,o){const a=new ot(0);let l=s===!0?0:1,c,f,h=null,u=0,d=null;function g(y){let E=y.isScene===!0?y.background:null;return E&&E.isTexture&&(E=(y.backgroundBlurriness>0?t:e).get(E)),E}function _(y){let E=!1;const v=g(y);v===null?p(a,l):v&&v.isColor&&(p(v,1),E=!0);const C=r.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||E)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function m(y,E){const v=g(E);v&&(v.isCubeTexture||v.mapping===vl)?(f===void 0&&(f=new Jt(new $s(1,1,1),new ur({name:"BackgroundCubeMaterial",uniforms:Ns(vi.backgroundCube.uniforms),vertexShader:vi.backgroundCube.vertexShader,fragmentShader:vi.backgroundCube.fragmentShader,side:Sn,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(C,R,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(f)),vr.copy(E.backgroundRotation),vr.x*=-1,vr.y*=-1,vr.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(vr.y*=-1,vr.z*=-1),f.material.uniforms.envMap.value=v,f.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,f.material.uniforms.backgroundRotation.value.setFromMatrix4(Jx.makeRotationFromEuler(vr)),f.material.toneMapped=dt.getTransfer(v.colorSpace)!==St,(h!==v||u!==v.version||d!==r.toneMapping)&&(f.material.needsUpdate=!0,h=v,u=v.version,d=r.toneMapping),f.layers.enableAll(),y.unshift(f,f.geometry,f.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Jt(new qr(2,2),new ur({name:"BackgroundMaterial",uniforms:Ns(vi.background.uniforms),vertexShader:vi.background.vertexShader,fragmentShader:vi.background.fragmentShader,side:hr,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=dt.getTransfer(v.colorSpace)!==St,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=r.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,E){y.getRGB(Ia,hm(r)),n.buffers.color.setClear(Ia.r,Ia.g,Ia.b,E,o)}return{getClearColor:function(){return a},setClearColor:function(y,E=1){a.set(y),l=E,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:_,addToRenderList:m}}function Qx(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=u(null);let s=i,o=!1;function a(x,F,I,M,P){let O=!1;const U=h(M,I,F);s!==U&&(s=U,c(s.object)),O=d(x,M,I,P),O&&g(x,M,I,P),P!==null&&e.update(P,r.ELEMENT_ARRAY_BUFFER),(O||o)&&(o=!1,v(x,F,I,M),P!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(P).buffer))}function l(){return r.createVertexArray()}function c(x){return r.bindVertexArray(x)}function f(x){return r.deleteVertexArray(x)}function h(x,F,I){const M=I.wireframe===!0;let P=n[x.id];P===void 0&&(P={},n[x.id]=P);let O=P[F.id];O===void 0&&(O={},P[F.id]=O);let U=O[M];return U===void 0&&(U=u(l()),O[M]=U),U}function u(x){const F=[],I=[],M=[];for(let P=0;P<t;P++)F[P]=0,I[P]=0,M[P]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:I,attributeDivisors:M,object:x,attributes:{},index:null}}function d(x,F,I,M){const P=s.attributes,O=F.attributes;let U=0;const B=I.getAttributes();for(const z in B)if(B[z].location>=0){const V=P[z];let N=O[z];if(N===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(N=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(N=x.instanceColor)),V===void 0||V.attribute!==N||N&&V.data!==N.data)return!0;U++}return s.attributesNum!==U||s.index!==M}function g(x,F,I,M){const P={},O=F.attributes;let U=0;const B=I.getAttributes();for(const z in B)if(B[z].location>=0){let V=O[z];V===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(V=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(V=x.instanceColor));const N={};N.attribute=V,V&&V.data&&(N.data=V.data),P[z]=N,U++}s.attributes=P,s.attributesNum=U,s.index=M}function _(){const x=s.newAttributes;for(let F=0,I=x.length;F<I;F++)x[F]=0}function m(x){p(x,0)}function p(x,F){const I=s.newAttributes,M=s.enabledAttributes,P=s.attributeDivisors;I[x]=1,M[x]===0&&(r.enableVertexAttribArray(x),M[x]=1),P[x]!==F&&(r.vertexAttribDivisor(x,F),P[x]=F)}function y(){const x=s.newAttributes,F=s.enabledAttributes;for(let I=0,M=F.length;I<M;I++)F[I]!==x[I]&&(r.disableVertexAttribArray(I),F[I]=0)}function E(x,F,I,M,P,O,U){U===!0?r.vertexAttribIPointer(x,F,I,P,O):r.vertexAttribPointer(x,F,I,M,P,O)}function v(x,F,I,M){_();const P=M.attributes,O=I.getAttributes(),U=F.defaultAttributeValues;for(const B in O){const z=O[B];if(z.location>=0){let X=P[B];if(X===void 0&&(B==="instanceMatrix"&&x.instanceMatrix&&(X=x.instanceMatrix),B==="instanceColor"&&x.instanceColor&&(X=x.instanceColor)),X!==void 0){const V=X.normalized,N=X.itemSize,$=e.get(X);if($===void 0)continue;const ne=$.buffer,k=$.type,H=$.bytesPerElement,se=k===r.INT||k===r.UNSIGNED_INT||X.gpuType===rh;if(X.isInterleavedBufferAttribute){const Y=X.data,ae=Y.stride,Me=X.offset;if(Y.isInstancedInterleavedBuffer){for(let Ae=0;Ae<z.locationSize;Ae++)p(z.location+Ae,Y.meshPerAttribute);x.isInstancedMesh!==!0&&M._maxInstanceCount===void 0&&(M._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let Ae=0;Ae<z.locationSize;Ae++)m(z.location+Ae);r.bindBuffer(r.ARRAY_BUFFER,ne);for(let Ae=0;Ae<z.locationSize;Ae++)E(z.location+Ae,N/z.locationSize,k,V,ae*H,(Me+N/z.locationSize*Ae)*H,se)}else{if(X.isInstancedBufferAttribute){for(let Y=0;Y<z.locationSize;Y++)p(z.location+Y,X.meshPerAttribute);x.isInstancedMesh!==!0&&M._maxInstanceCount===void 0&&(M._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let Y=0;Y<z.locationSize;Y++)m(z.location+Y);r.bindBuffer(r.ARRAY_BUFFER,ne);for(let Y=0;Y<z.locationSize;Y++)E(z.location+Y,N/z.locationSize,k,V,N*H,N/z.locationSize*Y*H,se)}}else if(U!==void 0){const V=U[B];if(V!==void 0)switch(V.length){case 2:r.vertexAttrib2fv(z.location,V);break;case 3:r.vertexAttrib3fv(z.location,V);break;case 4:r.vertexAttrib4fv(z.location,V);break;default:r.vertexAttrib1fv(z.location,V)}}}}y()}function C(){w();for(const x in n){const F=n[x];for(const I in F){const M=F[I];for(const P in M)f(M[P].object),delete M[P];delete F[I]}delete n[x]}}function R(x){if(n[x.id]===void 0)return;const F=n[x.id];for(const I in F){const M=F[I];for(const P in M)f(M[P].object),delete M[P];delete F[I]}delete n[x.id]}function T(x){for(const F in n){const I=n[F];if(I[x.id]===void 0)continue;const M=I[x.id];for(const P in M)f(M[P].object),delete M[P];delete I[x.id]}}function w(){S(),o=!0,s!==i&&(s=i,c(s.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:w,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:R,releaseStatesOfProgram:T,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function ey(r,e,t){let n;function i(c){n=c}function s(c,f){r.drawArrays(n,c,f),t.update(f,n,1)}function o(c,f,h){h!==0&&(r.drawArraysInstanced(n,c,f,h),t.update(f,n,h))}function a(c,f,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,f,0,h);let d=0;for(let g=0;g<h;g++)d+=f[g];t.update(d,n,1)}function l(c,f,h,u){if(h===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],f[g],u[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,f,0,u,0,h);let g=0;for(let _=0;_<h;_++)g+=f[_]*u[_];t.update(g,n,1)}}this.setMode=i,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function ty(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(T){return!(T!==ti&&n.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const w=T===Yo&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==zi&&n.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==Ni&&!w)}function l(T){if(T==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const f=l(c);f!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);const h=t.logarithmicDepthBuffer===!0,u=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),d=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),y=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),E=r.getParameter(r.MAX_VARYING_VECTORS),v=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,R=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:E,maxFragmentUniforms:v,vertexTextures:C,maxSamples:R}}function ny(r){const e=this;let t=null,n=0,i=!1,s=!1;const o=new Mr,a=new et,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){const d=h.length!==0||u||n!==0||i;return i=u,n=h.length,d},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,u){t=f(h,u,0)},this.setState=function(h,u,d){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=r.get(h);if(!i||g===null||g.length===0||s&&!m)s?f(null):c();else{const y=s?0:n,E=y*4;let v=p.clippingState||null;l.value=v,v=f(g,u,E,d);for(let C=0;C!==E;++C)v[C]=t[C];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(h,u,d,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=d+_*4,y=u.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let E=0,v=d;E!==_;++E,v+=4)o.copy(h[E]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function iy(r){let e=new WeakMap;function t(o,a){return a===tf?o.mapping=Is:a===nf&&(o.mapping=Us),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===tf||a===nf)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new p_(l.height);return c.fromEquirectangularTexture(r,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class gm extends dm{constructor(e=-1,t=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=f*this.view.offsetY,l=a-f*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Ss=4,Ru=[.125,.215,.35,.446,.526,.582],Ar=20,_c=new gm,Cu=new ot;let vc=null,xc=0,yc=0,Sc=!1;const br=(1+Math.sqrt(5))/2,ms=1/br,Du=[new Z(-br,ms,0),new Z(br,ms,0),new Z(-ms,0,br),new Z(ms,0,br),new Z(0,br,-ms),new Z(0,br,ms),new Z(-1,1,-1),new Z(1,1,-1),new Z(-1,1,1),new Z(1,1,1)];class Pu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){vc=this._renderer.getRenderTarget(),xc=this._renderer.getActiveCubeFace(),yc=this._renderer.getActiveMipmapLevel(),Sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Uu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(vc,xc,yc),this._renderer.xr.enabled=Sc,e.scissorTest=!1,Ua(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Is||e.mapping===Us?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),vc=this._renderer.getRenderTarget(),xc=this._renderer.getActiveCubeFace(),yc=this._renderer.getActiveMipmapLevel(),Sc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Gn,minFilter:Gn,generateMipmaps:!1,type:Yo,format:ti,colorSpace:Hs,depthBuffer:!1},i=Iu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Iu(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ry(s)),this._blurMaterial=sy(s,e,t)}return i}_compileMaterial(e){const t=new Jt(this._lodPlanes[0],e);this._renderer.compile(t,_c)}_sceneToCubeUV(e,t,n,i){const a=new Ln(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,u=f.toneMapping;f.getClearColor(Cu),f.toneMapping=sr,f.autoClear=!1;const d=new fh({name:"PMREM.Background",side:Sn,depthWrite:!1,depthTest:!1}),g=new Jt(new $s,d);let _=!1;const m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,_=!0):(d.color.copy(Cu),_=!0);for(let p=0;p<6;p++){const y=p%3;y===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):y===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const E=this._cubeSize;Ua(i,y*E,p>2?E:0,E,E),f.setRenderTarget(i),_&&f.render(g,a),f.render(e,a)}g.geometry.dispose(),g.material.dispose(),f.toneMapping=u,f.autoClear=h,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Is||e.mapping===Us;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Uu());const s=i?this._cubemapMaterial:this._equirectMaterial,o=new Jt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Ua(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,_c)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Du[(i-s-1)%Du.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,i,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",s),this._halfBlur(o,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,h=new Jt(this._lodPlanes[i],c),u=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Ar-1),_=s/g,m=isFinite(s)?1+Math.floor(f*_):Ar;m>Ar&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ar}`);const p=[];let y=0;for(let T=0;T<Ar;++T){const w=T/_,S=Math.exp(-w*w/2);p.push(S),T===0?y+=S:T<m&&(y+=2*S)}for(let T=0;T<p.length;T++)p[T]=p[T]/y;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:E}=this;u.dTheta.value=g,u.mipInt.value=E-n;const v=this._sizeLods[i],C=3*v*(i>E-Ss?i-E+Ss:0),R=4*(this._cubeSize-v);Ua(t,C,R,3*v,2*v),l.setRenderTarget(t),l.render(h,_c)}}function ry(r){const e=[],t=[],n=[];let i=r;const s=r-Ss+1+Ru.length;for(let o=0;o<s;o++){const a=Math.pow(2,i);t.push(a);let l=1/a;o>r-Ss?l=Ru[o-r+Ss-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),f=-c,h=1+c,u=[f,f,h,f,h,h,f,f,h,h,f,h],d=6,g=6,_=3,m=2,p=1,y=new Float32Array(_*g*d),E=new Float32Array(m*g*d),v=new Float32Array(p*g*d);for(let R=0;R<d;R++){const T=R%3*2/3-1,w=R>2?0:-1,S=[T,w,0,T+2/3,w,0,T+2/3,w+1,0,T,w,0,T+2/3,w+1,0,T,w+1,0];y.set(S,_*g*R),E.set(u,m*g*R);const x=[R,R,R,R,R,R];v.set(x,p*g*R)}const C=new Mn;C.setAttribute("position",new Vn(y,_)),C.setAttribute("uv",new Vn(E,m)),C.setAttribute("faceIndex",new Vn(v,p)),e.push(C),i>Ss&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Iu(r,e,t){const n=new zr(r,e,t);return n.texture.mapping=vl,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ua(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function sy(r,e,t){const n=new Float32Array(Ar),i=new Z(0,1,0);return new ur({name:"SphericalGaussianBlur",defines:{n:Ar,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:uh(),fragmentShader:`

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
		`,blending:rr,depthTest:!1,depthWrite:!1})}function Uu(){return new ur({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:uh(),fragmentShader:`

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
		`,blending:rr,depthTest:!1,depthWrite:!1})}function Lu(){return new ur({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:uh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function uh(){return`

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
	`}function oy(r){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===tf||l===nf,f=l===Is||l===Us;if(c||f){let h=e.get(a);const u=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return t===null&&(t=new Pu(r)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const d=a.image;return c&&d&&d.height>0||f&&d&&i(d)?(t===null&&(t=new Pu(r)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function i(a){let l=0;const c=6;for(let f=0;f<c;f++)a[f]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function ay(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&yo("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function ly(r,e,t,n){const i={},s=new WeakMap;function o(h){const u=h.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);for(const g in u.morphAttributes){const _=u.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}u.removeEventListener("dispose",o),delete i[u.id];const d=s.get(u);d&&(e.remove(d),s.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(h,u){return i[u.id]===!0||(u.addEventListener("dispose",o),i[u.id]=!0,t.memory.geometries++),u}function l(h){const u=h.attributes;for(const g in u)e.update(u[g],r.ARRAY_BUFFER);const d=h.morphAttributes;for(const g in d){const _=d[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],r.ARRAY_BUFFER)}}function c(h){const u=[],d=h.index,g=h.attributes.position;let _=0;if(d!==null){const y=d.array;_=d.version;for(let E=0,v=y.length;E<v;E+=3){const C=y[E+0],R=y[E+1],T=y[E+2];u.push(C,R,R,T,T,C)}}else if(g!==void 0){const y=g.array;_=g.version;for(let E=0,v=y.length/3-1;E<v;E+=3){const C=E+0,R=E+1,T=E+2;u.push(C,R,R,T,T,C)}}else return;const m=new(im(u)?fm:cm)(u,1);m.version=_;const p=s.get(h);p&&e.remove(p),s.set(h,m)}function f(h){const u=s.get(h);if(u){const d=h.index;d!==null&&u.version<d.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:f}}function cy(r,e,t){let n;function i(u){n=u}let s,o;function a(u){s=u.type,o=u.bytesPerElement}function l(u,d){r.drawElements(n,d,s,u*o),t.update(d,n,1)}function c(u,d,g){g!==0&&(r.drawElementsInstanced(n,d,s,u*o,g),t.update(d,n,g))}function f(u,d,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,s,u,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];t.update(m,n,1)}function h(u,d,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<u.length;p++)c(u[p]/o,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,s,u,0,_,0,g);let p=0;for(let y=0;y<g;y++)p+=d[y]*_[y];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=f,this.renderMultiDrawInstances=h}function fy(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case r.TRIANGLES:t.triangles+=a*(s/3);break;case r.LINES:t.lines+=a*(s/2);break;case r.LINE_STRIP:t.lines+=a*(s-1);break;case r.LINE_LOOP:t.lines+=a*s;break;case r.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function hy(r,e,t){const n=new WeakMap,i=new xt;function s(o,a,l){const c=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=f!==void 0?f.length:0;let u=n.get(a);if(u===void 0||u.count!==h){let x=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",x)};var d=x;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],E=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),_===!0&&(v=2),m===!0&&(v=3);let C=a.attributes.position.count*v,R=1;C>e.maxTextureSize&&(R=Math.ceil(C/e.maxTextureSize),C=e.maxTextureSize);const T=new Float32Array(C*R*4*h),w=new sm(T,C,R,h);w.type=Ni,w.needsUpdate=!0;const S=v*4;for(let F=0;F<h;F++){const I=p[F],M=y[F],P=E[F],O=C*R*4*F;for(let U=0;U<I.count;U++){const B=U*S;g===!0&&(i.fromBufferAttribute(I,U),T[O+B+0]=i.x,T[O+B+1]=i.y,T[O+B+2]=i.z,T[O+B+3]=0),_===!0&&(i.fromBufferAttribute(M,U),T[O+B+4]=i.x,T[O+B+5]=i.y,T[O+B+6]=i.z,T[O+B+7]=0),m===!0&&(i.fromBufferAttribute(P,U),T[O+B+8]=i.x,T[O+B+9]=i.y,T[O+B+10]=i.z,T[O+B+11]=P.itemSize===4?i.w:1)}}u={count:h,texture:w,size:new st(C,R)},n.set(a,u),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(r,"morphTargetBaseInfluence",_),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(r,"morphTargetsTextureSize",u.size)}return{update:s}}function uy(r,e,t,n){let i=new WeakMap;function s(l){const c=n.render.frame,f=l.geometry,h=e.get(l,f);if(i.get(h)!==c&&(e.update(h),i.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;i.get(u)!==c&&(u.update(),i.set(u,c))}return h}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class _m extends on{constructor(e,t,n,i,s,o,a,l,c,f=Ms){if(f!==Ms&&f!==Fs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&f===Ms&&(n=kr),n===void 0&&f===Fs&&(n=Ls),super(null,i,s,o,a,l,f,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:ii,this.minFilter=l!==void 0?l:ii,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const vm=new on,Fu=new _m(1,1),xm=new sm,ym=new Q0,Sm=new pm,Nu=[],Ou=[],Bu=new Float32Array(16),ku=new Float32Array(9),zu=new Float32Array(4);function js(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=Nu[i];if(s===void 0&&(s=new Float32Array(i),Nu[i]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,r[o].toArray(s,a)}return s}function zt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Gt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function yl(r,e){let t=Ou[e];t===void 0&&(t=new Int32Array(e),Ou[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function dy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function py(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;r.uniform2fv(this.addr,e),Gt(t,e)}}function my(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(zt(t,e))return;r.uniform3fv(this.addr,e),Gt(t,e)}}function gy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;r.uniform4fv(this.addr,e),Gt(t,e)}}function _y(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;zu.set(n),r.uniformMatrix2fv(this.addr,!1,zu),Gt(t,n)}}function vy(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;ku.set(n),r.uniformMatrix3fv(this.addr,!1,ku),Gt(t,n)}}function xy(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(zt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Gt(t,e)}else{if(zt(t,n))return;Bu.set(n),r.uniformMatrix4fv(this.addr,!1,Bu),Gt(t,n)}}function yy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Sy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;r.uniform2iv(this.addr,e),Gt(t,e)}}function Ey(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(zt(t,e))return;r.uniform3iv(this.addr,e),Gt(t,e)}}function My(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;r.uniform4iv(this.addr,e),Gt(t,e)}}function by(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function wy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(zt(t,e))return;r.uniform2uiv(this.addr,e),Gt(t,e)}}function Ty(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(zt(t,e))return;r.uniform3uiv(this.addr,e),Gt(t,e)}}function Ay(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(zt(t,e))return;r.uniform4uiv(this.addr,e),Gt(t,e)}}function Ry(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(Fu.compareFunction=nm,s=Fu):s=vm,t.setTexture2D(e||s,i)}function Cy(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||ym,i)}function Dy(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Sm,i)}function Py(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||xm,i)}function Iy(r){switch(r){case 5126:return dy;case 35664:return py;case 35665:return my;case 35666:return gy;case 35674:return _y;case 35675:return vy;case 35676:return xy;case 5124:case 35670:return yy;case 35667:case 35671:return Sy;case 35668:case 35672:return Ey;case 35669:case 35673:return My;case 5125:return by;case 36294:return wy;case 36295:return Ty;case 36296:return Ay;case 35678:case 36198:case 36298:case 36306:case 35682:return Ry;case 35679:case 36299:case 36307:return Cy;case 35680:case 36300:case 36308:case 36293:return Dy;case 36289:case 36303:case 36311:case 36292:return Py}}function Uy(r,e){r.uniform1fv(this.addr,e)}function Ly(r,e){const t=js(e,this.size,2);r.uniform2fv(this.addr,t)}function Fy(r,e){const t=js(e,this.size,3);r.uniform3fv(this.addr,t)}function Ny(r,e){const t=js(e,this.size,4);r.uniform4fv(this.addr,t)}function Oy(r,e){const t=js(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function By(r,e){const t=js(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function ky(r,e){const t=js(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function zy(r,e){r.uniform1iv(this.addr,e)}function Gy(r,e){r.uniform2iv(this.addr,e)}function Vy(r,e){r.uniform3iv(this.addr,e)}function Hy(r,e){r.uniform4iv(this.addr,e)}function Wy(r,e){r.uniform1uiv(this.addr,e)}function Xy(r,e){r.uniform2uiv(this.addr,e)}function $y(r,e){r.uniform3uiv(this.addr,e)}function jy(r,e){r.uniform4uiv(this.addr,e)}function qy(r,e,t){const n=this.cache,i=e.length,s=yl(t,i);zt(n,s)||(r.uniform1iv(this.addr,s),Gt(n,s));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||vm,s[o])}function Yy(r,e,t){const n=this.cache,i=e.length,s=yl(t,i);zt(n,s)||(r.uniform1iv(this.addr,s),Gt(n,s));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||ym,s[o])}function Ky(r,e,t){const n=this.cache,i=e.length,s=yl(t,i);zt(n,s)||(r.uniform1iv(this.addr,s),Gt(n,s));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Sm,s[o])}function Jy(r,e,t){const n=this.cache,i=e.length,s=yl(t,i);zt(n,s)||(r.uniform1iv(this.addr,s),Gt(n,s));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||xm,s[o])}function Zy(r){switch(r){case 5126:return Uy;case 35664:return Ly;case 35665:return Fy;case 35666:return Ny;case 35674:return Oy;case 35675:return By;case 35676:return ky;case 5124:case 35670:return zy;case 35667:case 35671:return Gy;case 35668:case 35672:return Vy;case 35669:case 35673:return Hy;case 5125:return Wy;case 36294:return Xy;case 36295:return $y;case 36296:return jy;case 35678:case 36198:case 36298:case 36306:case 35682:return qy;case 35679:case 36299:case 36307:return Yy;case 35680:case 36300:case 36308:case 36293:return Ky;case 36289:case 36303:case 36311:case 36292:return Jy}}class Qy{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Iy(t.type)}}class eS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Zy(t.type)}}class tS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,o=i.length;s!==o;++s){const a=i[s];a.setValue(e,t[a.id],n)}}}const Ec=/(\w+)(\])?(\[|\.)?/g;function Gu(r,e){r.seq.push(e),r.map[e.id]=e}function nS(r,e,t){const n=r.name,i=n.length;for(Ec.lastIndex=0;;){const s=Ec.exec(n),o=Ec.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Gu(t,c===void 0?new Qy(a,r,e):new eS(a,r,e));break}else{let h=t.map[a];h===void 0&&(h=new tS(a),Gu(t,h)),t=h}}}class Ja{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),o=e.getUniformLocation(t,s.name);nS(s,o,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function Vu(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const iS=37297;let rS=0;function sS(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=i;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Hu=new et;function oS(r){dt._getMatrix(Hu,dt.workingColorSpace,r);const e=`mat3( ${Hu.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(r)){case xl:return[e,"LinearTransferOETF"];case St:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function Wu(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+sS(r.getShaderSource(e),o)}else return i}function aS(r,e){const t=oS(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function lS(r,e){let t;switch(e){case A0:t="Linear";break;case R0:t="Reinhard";break;case C0:t="Cineon";break;case D0:t="ACESFilmic";break;case I0:t="AgX";break;case U0:t="Neutral";break;case P0:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const La=new Z;function cS(){dt.getLuminanceCoefficients(La);const r=La.x.toFixed(4),e=La.y.toFixed(4),t=La.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fS(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(So).join(`
`)}function hS(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function uS(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:r.getAttribLocation(e,o),locationSize:a}}return t}function So(r){return r!==""}function Xu(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function $u(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const dS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Uf(r){return r.replace(dS,mS)}const pS=new Map;function mS(r,e){let t=it[e];if(t===void 0){const n=pS.get(e);if(n!==void 0)t=it[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Uf(t)}const gS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ju(r){return r.replace(gS,_S)}function _S(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function qu(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}function vS(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Gp?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===o0?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ii&&(e="SHADOWMAP_TYPE_VSM"),e}function xS(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Is:case Us:e="ENVMAP_TYPE_CUBE";break;case vl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function yS(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Us:e="ENVMAP_MODE_REFRACTION";break}return e}function SS(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case Vp:e="ENVMAP_BLENDING_MULTIPLY";break;case w0:e="ENVMAP_BLENDING_MIX";break;case T0:e="ENVMAP_BLENDING_ADD";break}return e}function ES(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function MS(r,e,t,n){const i=r.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=vS(t),c=xS(t),f=yS(t),h=SS(t),u=ES(t),d=fS(t),g=hS(s),_=i.createProgram();let m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(So).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(So).join(`
`),p.length>0&&(p+=`
`)):(m=[qu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(So).join(`
`),p=[qu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+f:"",t.envMap?"#define "+h:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==sr?"#define TONE_MAPPING":"",t.toneMapping!==sr?it.tonemapping_pars_fragment:"",t.toneMapping!==sr?lS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",it.colorspace_pars_fragment,aS("linearToOutputTexel",t.outputColorSpace),cS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(So).join(`
`)),o=Uf(o),o=Xu(o,t),o=$u(o,t),a=Uf(a),a=Xu(a,t),a=$u(a,t),o=ju(o),a=ju(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===au?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===au?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const E=y+m+o,v=y+p+a,C=Vu(i,i.VERTEX_SHADER,E),R=Vu(i,i.FRAGMENT_SHADER,v);i.attachShader(_,C),i.attachShader(_,R),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function T(F){if(r.debug.checkShaderErrors){const I=i.getProgramInfoLog(_).trim(),M=i.getShaderInfoLog(C).trim(),P=i.getShaderInfoLog(R).trim();let O=!0,U=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(O=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,_,C,R);else{const B=Wu(i,C,"vertex"),z=Wu(i,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+I+`
`+B+`
`+z)}else I!==""?console.warn("THREE.WebGLProgram: Program Info Log:",I):(M===""||P==="")&&(U=!1);U&&(F.diagnostics={runnable:O,programLog:I,vertexShader:{log:M,prefix:m},fragmentShader:{log:P,prefix:p}})}i.deleteShader(C),i.deleteShader(R),w=new Ja(i,_),S=uS(i,_)}let w;this.getUniforms=function(){return w===void 0&&T(this),w};let S;this.getAttributes=function(){return S===void 0&&T(this),S};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=i.getProgramParameter(_,iS)),x},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=rS++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=R,this}let bS=0;class wS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new TS(e),t.set(e,n)),n}}class TS{constructor(e){this.id=bS++,this.code=e,this.usedTimes=0}}function AS(r,e,t,n,i,s,o){const a=new am,l=new wS,c=new Set,f=[],h=i.logarithmicDepthBuffer,u=i.vertexTextures;let d=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,x,F,I,M){const P=I.fog,O=M.geometry,U=S.isMeshStandardMaterial?I.environment:null,B=(S.isMeshStandardMaterial?t:e).get(S.envMap||U),z=B&&B.mapping===vl?B.image.height:null,X=g[S.type];S.precision!==null&&(d=i.getMaxPrecision(S.precision),d!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",d,"instead."));const V=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,N=V!==void 0?V.length:0;let $=0;O.morphAttributes.position!==void 0&&($=1),O.morphAttributes.normal!==void 0&&($=2),O.morphAttributes.color!==void 0&&($=3);let ne,k,H,se;if(X){const qe=vi[X];ne=qe.vertexShader,k=qe.fragmentShader}else ne=S.vertexShader,k=S.fragmentShader,l.update(S),H=l.getVertexShaderID(S),se=l.getFragmentShaderID(S);const Y=r.getRenderTarget(),ae=r.state.buffers.depth.getReversed(),Me=M.isInstancedMesh===!0,Ae=M.isBatchedMesh===!0,we=!!S.map,ue=!!S.matcap,Ve=!!B,W=!!S.aoMap,He=!!S.lightMap,Ue=!!S.bumpMap,Fe=!!S.normalMap,he=!!S.displacementMap,Ie=!!S.emissiveMap,Ee=!!S.metalnessMap,A=!!S.roughnessMap,b=S.anisotropy>0,G=S.clearcoat>0,te=S.dispersion>0,ie=S.iridescence>0,fe=S.sheen>0,_e=S.transmission>0,ge=b&&!!S.anisotropyMap,Se=G&&!!S.clearcoatMap,Oe=G&&!!S.clearcoatNormalMap,ve=G&&!!S.clearcoatRoughnessMap,Re=ie&&!!S.iridescenceMap,Ce=ie&&!!S.iridescenceThicknessMap,De=fe&&!!S.sheenColorMap,pe=fe&&!!S.sheenRoughnessMap,Be=!!S.specularMap,ke=!!S.specularColorMap,nt=!!S.specularIntensityMap,j=_e&&!!S.transmissionMap,xe=_e&&!!S.thicknessMap,re=!!S.gradientMap,ye=!!S.alphaMap,Te=S.alphaTest>0,be=!!S.alphaHash,Ge=!!S.extensions;let Ze=sr;S.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(Ze=r.toneMapping);const je={shaderID:X,shaderType:S.type,shaderName:S.name,vertexShader:ne,fragmentShader:k,defines:S.defines,customVertexShaderID:H,customFragmentShaderID:se,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:d,batching:Ae,batchingColor:Ae&&M._colorsTexture!==null,instancing:Me,instancingColor:Me&&M.instanceColor!==null,instancingMorph:Me&&M.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:Y===null?r.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:Hs,alphaToCoverage:!!S.alphaToCoverage,map:we,matcap:ue,envMap:Ve,envMapMode:Ve&&B.mapping,envMapCubeUVHeight:z,aoMap:W,lightMap:He,bumpMap:Ue,normalMap:Fe,displacementMap:u&&he,emissiveMap:Ie,normalMapObjectSpace:Fe&&S.normalMapType===N0,normalMapTangentSpace:Fe&&S.normalMapType===tm,metalnessMap:Ee,roughnessMap:A,anisotropy:b,anisotropyMap:ge,clearcoat:G,clearcoatMap:Se,clearcoatNormalMap:Oe,clearcoatRoughnessMap:ve,dispersion:te,iridescence:ie,iridescenceMap:Re,iridescenceThicknessMap:Ce,sheen:fe,sheenColorMap:De,sheenRoughnessMap:pe,specularMap:Be,specularColorMap:ke,specularIntensityMap:nt,transmission:_e,transmissionMap:j,thicknessMap:xe,gradientMap:re,opaque:S.transparent===!1&&S.blending===Es&&S.alphaToCoverage===!1,alphaMap:ye,alphaTest:Te,alphaHash:be,combine:S.combine,mapUv:we&&_(S.map.channel),aoMapUv:W&&_(S.aoMap.channel),lightMapUv:He&&_(S.lightMap.channel),bumpMapUv:Ue&&_(S.bumpMap.channel),normalMapUv:Fe&&_(S.normalMap.channel),displacementMapUv:he&&_(S.displacementMap.channel),emissiveMapUv:Ie&&_(S.emissiveMap.channel),metalnessMapUv:Ee&&_(S.metalnessMap.channel),roughnessMapUv:A&&_(S.roughnessMap.channel),anisotropyMapUv:ge&&_(S.anisotropyMap.channel),clearcoatMapUv:Se&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Oe&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Re&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:De&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:pe&&_(S.sheenRoughnessMap.channel),specularMapUv:Be&&_(S.specularMap.channel),specularColorMapUv:ke&&_(S.specularColorMap.channel),specularIntensityMapUv:nt&&_(S.specularIntensityMap.channel),transmissionMapUv:j&&_(S.transmissionMap.channel),thicknessMapUv:xe&&_(S.thicknessMap.channel),alphaMapUv:ye&&_(S.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Fe||b),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:M.isPoints===!0&&!!O.attributes.uv&&(we||ye),fog:!!P,useFog:S.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:ae,skinning:M.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:N,morphTextureStride:$,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:r.shadowMap.enabled&&F.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ze,decodeVideoTexture:we&&S.map.isVideoTexture===!0&&dt.getTransfer(S.map.colorSpace)===St,decodeVideoTextureEmissive:Ie&&S.emissiveMap.isVideoTexture===!0&&dt.getTransfer(S.emissiveMap.colorSpace)===St,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===xi,flipSided:S.side===Sn,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ge&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ge&&S.extensions.multiDraw===!0||Ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return je.vertexUv1s=c.has(1),je.vertexUv2s=c.has(2),je.vertexUv3s=c.has(3),c.clear(),je}function p(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const F in S.defines)x.push(F),x.push(S.defines[F]);return S.isRawShaderMaterial===!1&&(y(x,S),E(x,S),x.push(r.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function y(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function E(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){const x=g[S.type];let F;if(x){const I=vi[x];F=um.clone(I.uniforms)}else F=S.uniforms;return F}function C(S,x){let F;for(let I=0,M=f.length;I<M;I++){const P=f[I];if(P.cacheKey===x){F=P,++F.usedTimes;break}}return F===void 0&&(F=new MS(r,x,S,s),f.push(F)),F}function R(S){if(--S.usedTimes===0){const x=f.indexOf(S);f[x]=f[f.length-1],f.pop(),S.destroy()}}function T(S){l.remove(S)}function w(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:C,releaseProgram:R,releaseShaderCache:T,programs:f,dispose:w}}function RS(){let r=new WeakMap;function e(o){return r.has(o)}function t(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function n(o){r.delete(o)}function i(o,a,l){r.get(o)[a]=l}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function CS(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function Yu(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Ku(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function o(h,u,d,g,_,m){let p=r[e];return p===void 0?(p={id:h.id,object:h,geometry:u,material:d,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},r[e]=p):(p.id=h.id,p.object=h,p.geometry=u,p.material=d,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,u,d,g,_,m){const p=o(h,u,d,g,_,m);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):t.push(p)}function l(h,u,d,g,_,m){const p=o(h,u,d,g,_,m);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):t.unshift(p)}function c(h,u){t.length>1&&t.sort(h||CS),n.length>1&&n.sort(u||Yu),i.length>1&&i.sort(u||Yu)}function f(){for(let h=e,u=r.length;h<u;h++){const d=r[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:a,unshift:l,finish:f,sort:c}}function DS(){let r=new WeakMap;function e(n,i){const s=r.get(n);let o;return s===void 0?(o=new Ku,r.set(n,[o])):i>=s.length?(o=new Ku,s.push(o)):o=s[i],o}function t(){r=new WeakMap}return{get:e,dispose:t}}function PS(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new Z,color:new ot};break;case"SpotLight":t={position:new Z,direction:new Z,color:new ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Z,color:new ot,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Z,skyColor:new ot,groundColor:new ot};break;case"RectAreaLight":t={color:new ot,position:new Z,halfWidth:new Z,halfHeight:new Z};break}return r[e.id]=t,t}}}function IS(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let US=0;function LS(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function FS(r){const e=new PS,t=IS(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new Z);const i=new Z,s=new Tt,o=new Tt;function a(c){let f=0,h=0,u=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,y=0,E=0,v=0,C=0,R=0,T=0;c.sort(LS);for(let S=0,x=c.length;S<x;S++){const F=c[S],I=F.color,M=F.intensity,P=F.distance,O=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)f+=I.r*M,h+=I.g*M,u+=I.b*M;else if(F.isLightProbe){for(let U=0;U<9;U++)n.probe[U].addScaledVector(F.sh.coefficients[U],M);T++}else if(F.isDirectionalLight){const U=e.get(F);if(U.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const B=F.shadow,z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,n.directionalShadow[d]=z,n.directionalShadowMap[d]=O,n.directionalShadowMatrix[d]=F.shadow.matrix,y++}n.directional[d]=U,d++}else if(F.isSpotLight){const U=e.get(F);U.position.setFromMatrixPosition(F.matrixWorld),U.color.copy(I).multiplyScalar(M),U.distance=P,U.coneCos=Math.cos(F.angle),U.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),U.decay=F.decay,n.spot[_]=U;const B=F.shadow;if(F.map&&(n.spotLightMap[C]=F.map,C++,B.updateMatrices(F),F.castShadow&&R++),n.spotLightMatrix[_]=B.matrix,F.castShadow){const z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,n.spotShadow[_]=z,n.spotShadowMap[_]=O,v++}_++}else if(F.isRectAreaLight){const U=e.get(F);U.color.copy(I).multiplyScalar(M),U.halfWidth.set(F.width*.5,0,0),U.halfHeight.set(0,F.height*.5,0),n.rectArea[m]=U,m++}else if(F.isPointLight){const U=e.get(F);if(U.color.copy(F.color).multiplyScalar(F.intensity),U.distance=F.distance,U.decay=F.decay,F.castShadow){const B=F.shadow,z=t.get(F);z.shadowIntensity=B.intensity,z.shadowBias=B.bias,z.shadowNormalBias=B.normalBias,z.shadowRadius=B.radius,z.shadowMapSize=B.mapSize,z.shadowCameraNear=B.camera.near,z.shadowCameraFar=B.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=O,n.pointShadowMatrix[g]=F.shadow.matrix,E++}n.point[g]=U,g++}else if(F.isHemisphereLight){const U=e.get(F);U.skyColor.copy(F.color).multiplyScalar(M),U.groundColor.copy(F.groundColor).multiplyScalar(M),n.hemi[p]=U,p++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ne.LTC_FLOAT_1,n.rectAreaLTC2=Ne.LTC_FLOAT_2):(n.rectAreaLTC1=Ne.LTC_HALF_1,n.rectAreaLTC2=Ne.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=h,n.ambient[2]=u;const w=n.hash;(w.directionalLength!==d||w.pointLength!==g||w.spotLength!==_||w.rectAreaLength!==m||w.hemiLength!==p||w.numDirectionalShadows!==y||w.numPointShadows!==E||w.numSpotShadows!==v||w.numSpotMaps!==C||w.numLightProbes!==T)&&(n.directional.length=d,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=v+C-R,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=T,w.directionalLength=d,w.pointLength=g,w.spotLength=_,w.rectAreaLength=m,w.hemiLength=p,w.numDirectionalShadows=y,w.numPointShadows=E,w.numSpotShadows=v,w.numSpotMaps=C,w.numLightProbes=T,n.version=US++)}function l(c,f){let h=0,u=0,d=0,g=0,_=0;const m=f.matrixWorldInverse;for(let p=0,y=c.length;p<y;p++){const E=c[p];if(E.isDirectionalLight){const v=n.directional[h];v.direction.setFromMatrixPosition(E.matrixWorld),i.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),h++}else if(E.isSpotLight){const v=n.spot[d];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(E.matrixWorld),i.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),d++}else if(E.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(E.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(E.width*.5,0,0),v.halfHeight.set(0,E.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){const v=n.point[u];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),u++}else if(E.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(E.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function Ju(r){const e=new FS(r),t=[],n=[];function i(f){c.camera=f,t.length=0,n.length=0}function s(f){t.push(f)}function o(f){n.push(f)}function a(){e.setup(t)}function l(f){e.setupView(t,f)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function NS(r){let e=new WeakMap;function t(i,s=0){const o=e.get(i);let a;return o===void 0?(a=new Ju(r),e.set(i,[a])):s>=o.length?(a=new Ju(r),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class Em extends Xs{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=F0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Mm extends Xs{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const OS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,BS=`uniform sampler2D shadow_pass;
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
}`;function kS(r,e,t){let n=new hh;const i=new st,s=new st,o=new xt,a=new Em({depthPacking:em}),l=new Mm,c={},f=t.maxTextureSize,h={[hr]:Sn,[Sn]:hr,[xi]:xi},u=new ur({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new st},radius:{value:4}},vertexShader:OS,fragmentShader:BS}),d=u.clone();d.defines.HORIZONTAL_PASS=1;const g=new Mn;g.setAttribute("position",new Vn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Jt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gp;let p=this.type;this.render=function(R,T,w){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const S=r.getRenderTarget(),x=r.getActiveCubeFace(),F=r.getActiveMipmapLevel(),I=r.state;I.setBlending(rr),I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const M=p!==Ii&&this.type===Ii,P=p===Ii&&this.type!==Ii;for(let O=0,U=R.length;O<U;O++){const B=R[O],z=B.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",B,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const X=z.getFrameExtents();if(i.multiply(X),s.copy(z.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(s.x=Math.floor(f/X.x),i.x=s.x*X.x,z.mapSize.x=s.x),i.y>f&&(s.y=Math.floor(f/X.y),i.y=s.y*X.y,z.mapSize.y=s.y)),z.map===null||M===!0||P===!0){const N=this.type!==Ii?{minFilter:ii,magFilter:ii}:{};z.map!==null&&z.map.dispose(),z.map=new zr(i.x,i.y,N),z.map.texture.name=B.name+".shadowMap",z.camera.updateProjectionMatrix()}r.setRenderTarget(z.map),r.clear();const V=z.getViewportCount();for(let N=0;N<V;N++){const $=z.getViewport(N);o.set(s.x*$.x,s.y*$.y,s.x*$.z,s.y*$.w),I.viewport(o),z.updateMatrices(B,N),n=z.getFrustum(),v(T,w,z.camera,B,this.type)}z.isPointLightShadow!==!0&&this.type===Ii&&y(z,w),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(S,x,F)};function y(R,T){const w=e.update(_);u.defines.VSM_SAMPLES!==R.blurSamples&&(u.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new zr(i.x,i.y)),u.uniforms.shadow_pass.value=R.map.texture,u.uniforms.resolution.value=R.mapSize,u.uniforms.radius.value=R.radius,r.setRenderTarget(R.mapPass),r.clear(),r.renderBufferDirect(T,null,w,u,_,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,r.setRenderTarget(R.map),r.clear(),r.renderBufferDirect(T,null,w,d,_,null)}function E(R,T,w,S){let x=null;const F=w.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(F!==void 0)x=F;else if(x=w.isPointLight===!0?l:a,r.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const I=x.uuid,M=T.uuid;let P=c[I];P===void 0&&(P={},c[I]=P);let O=P[M];O===void 0&&(O=x.clone(),P[M]=O,T.addEventListener("dispose",C)),x=O}if(x.visible=T.visible,x.wireframe=T.wireframe,S===Ii?x.side=T.shadowSide!==null?T.shadowSide:T.side:x.side=T.shadowSide!==null?T.shadowSide:h[T.side],x.alphaMap=T.alphaMap,x.alphaTest=T.alphaTest,x.map=T.map,x.clipShadows=T.clipShadows,x.clippingPlanes=T.clippingPlanes,x.clipIntersection=T.clipIntersection,x.displacementMap=T.displacementMap,x.displacementScale=T.displacementScale,x.displacementBias=T.displacementBias,x.wireframeLinewidth=T.wireframeLinewidth,x.linewidth=T.linewidth,w.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const I=r.properties.get(x);I.light=w}return x}function v(R,T,w,S,x){if(R.visible===!1)return;if(R.layers.test(T.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&x===Ii)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,R.matrixWorld);const M=e.update(R),P=R.material;if(Array.isArray(P)){const O=M.groups;for(let U=0,B=O.length;U<B;U++){const z=O[U],X=P[z.materialIndex];if(X&&X.visible){const V=E(R,X,S,x);R.onBeforeShadow(r,R,T,w,M,V,z),r.renderBufferDirect(w,null,M,V,R,z),R.onAfterShadow(r,R,T,w,M,V,z)}}}else if(P.visible){const O=E(R,P,S,x);R.onBeforeShadow(r,R,T,w,M,O,null),r.renderBufferDirect(w,null,M,O,R,null),R.onAfterShadow(r,R,T,w,M,O,null)}}const I=R.children;for(let M=0,P=I.length;M<P;M++)v(I[M],T,w,S,x)}function C(R){R.target.removeEventListener("dispose",C);for(const w in c){const S=c[w],x=R.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const zS={[qc]:Yc,[Kc]:Qc,[Jc]:ef,[Ps]:Zc,[Yc]:qc,[Qc]:Kc,[ef]:Jc,[Zc]:Ps};function GS(r,e){function t(){let j=!1;const xe=new xt;let re=null;const ye=new xt(0,0,0,0);return{setMask:function(Te){re!==Te&&!j&&(r.colorMask(Te,Te,Te,Te),re=Te)},setLocked:function(Te){j=Te},setClear:function(Te,be,Ge,Ze,je){je===!0&&(Te*=Ze,be*=Ze,Ge*=Ze),xe.set(Te,be,Ge,Ze),ye.equals(xe)===!1&&(r.clearColor(Te,be,Ge,Ze),ye.copy(xe))},reset:function(){j=!1,re=null,ye.set(-1,0,0,0)}}}function n(){let j=!1,xe=!1,re=null,ye=null,Te=null;return{setReversed:function(be){if(xe!==be){const Ge=e.get("EXT_clip_control");xe?Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.ZERO_TO_ONE_EXT):Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.NEGATIVE_ONE_TO_ONE_EXT);const Ze=Te;Te=null,this.setClear(Ze)}xe=be},getReversed:function(){return xe},setTest:function(be){be?Y(r.DEPTH_TEST):ae(r.DEPTH_TEST)},setMask:function(be){re!==be&&!j&&(r.depthMask(be),re=be)},setFunc:function(be){if(xe&&(be=zS[be]),ye!==be){switch(be){case qc:r.depthFunc(r.NEVER);break;case Yc:r.depthFunc(r.ALWAYS);break;case Kc:r.depthFunc(r.LESS);break;case Ps:r.depthFunc(r.LEQUAL);break;case Jc:r.depthFunc(r.EQUAL);break;case Zc:r.depthFunc(r.GEQUAL);break;case Qc:r.depthFunc(r.GREATER);break;case ef:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}ye=be}},setLocked:function(be){j=be},setClear:function(be){Te!==be&&(xe&&(be=1-be),r.clearDepth(be),Te=be)},reset:function(){j=!1,re=null,ye=null,Te=null,xe=!1}}}function i(){let j=!1,xe=null,re=null,ye=null,Te=null,be=null,Ge=null,Ze=null,je=null;return{setTest:function(qe){j||(qe?Y(r.STENCIL_TEST):ae(r.STENCIL_TEST))},setMask:function(qe){xe!==qe&&!j&&(r.stencilMask(qe),xe=qe)},setFunc:function(qe,Et,bt){(re!==qe||ye!==Et||Te!==bt)&&(r.stencilFunc(qe,Et,bt),re=qe,ye=Et,Te=bt)},setOp:function(qe,Et,bt){(be!==qe||Ge!==Et||Ze!==bt)&&(r.stencilOp(qe,Et,bt),be=qe,Ge=Et,Ze=bt)},setLocked:function(qe){j=qe},setClear:function(qe){je!==qe&&(r.clearStencil(qe),je=qe)},reset:function(){j=!1,xe=null,re=null,ye=null,Te=null,be=null,Ge=null,Ze=null,je=null}}}const s=new t,o=new n,a=new i,l=new WeakMap,c=new WeakMap;let f={},h={},u=new WeakMap,d=[],g=null,_=!1,m=null,p=null,y=null,E=null,v=null,C=null,R=null,T=new ot(0,0,0),w=0,S=!1,x=null,F=null,I=null,M=null,P=null;const O=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let U=!1,B=0;const z=r.getParameter(r.VERSION);z.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(z)[1]),U=B>=1):z.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),U=B>=2);let X=null,V={};const N=r.getParameter(r.SCISSOR_BOX),$=r.getParameter(r.VIEWPORT),ne=new xt().fromArray(N),k=new xt().fromArray($);function H(j,xe,re,ye){const Te=new Uint8Array(4),be=r.createTexture();r.bindTexture(j,be),r.texParameteri(j,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(j,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Ge=0;Ge<re;Ge++)j===r.TEXTURE_3D||j===r.TEXTURE_2D_ARRAY?r.texImage3D(xe,0,r.RGBA,1,1,ye,0,r.RGBA,r.UNSIGNED_BYTE,Te):r.texImage2D(xe+Ge,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Te);return be}const se={};se[r.TEXTURE_2D]=H(r.TEXTURE_2D,r.TEXTURE_2D,1),se[r.TEXTURE_CUBE_MAP]=H(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[r.TEXTURE_2D_ARRAY]=H(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),se[r.TEXTURE_3D]=H(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Y(r.DEPTH_TEST),o.setFunc(Ps),Ue(!1),Fe(tu),Y(r.CULL_FACE),W(rr);function Y(j){f[j]!==!0&&(r.enable(j),f[j]=!0)}function ae(j){f[j]!==!1&&(r.disable(j),f[j]=!1)}function Me(j,xe){return h[j]!==xe?(r.bindFramebuffer(j,xe),h[j]=xe,j===r.DRAW_FRAMEBUFFER&&(h[r.FRAMEBUFFER]=xe),j===r.FRAMEBUFFER&&(h[r.DRAW_FRAMEBUFFER]=xe),!0):!1}function Ae(j,xe){let re=d,ye=!1;if(j){re=u.get(xe),re===void 0&&(re=[],u.set(xe,re));const Te=j.textures;if(re.length!==Te.length||re[0]!==r.COLOR_ATTACHMENT0){for(let be=0,Ge=Te.length;be<Ge;be++)re[be]=r.COLOR_ATTACHMENT0+be;re.length=Te.length,ye=!0}}else re[0]!==r.BACK&&(re[0]=r.BACK,ye=!0);ye&&r.drawBuffers(re)}function we(j){return g!==j?(r.useProgram(j),g=j,!0):!1}const ue={[Tr]:r.FUNC_ADD,[l0]:r.FUNC_SUBTRACT,[c0]:r.FUNC_REVERSE_SUBTRACT};ue[f0]=r.MIN,ue[h0]=r.MAX;const Ve={[u0]:r.ZERO,[d0]:r.ONE,[p0]:r.SRC_COLOR,[$c]:r.SRC_ALPHA,[y0]:r.SRC_ALPHA_SATURATE,[v0]:r.DST_COLOR,[g0]:r.DST_ALPHA,[m0]:r.ONE_MINUS_SRC_COLOR,[jc]:r.ONE_MINUS_SRC_ALPHA,[x0]:r.ONE_MINUS_DST_COLOR,[_0]:r.ONE_MINUS_DST_ALPHA,[S0]:r.CONSTANT_COLOR,[E0]:r.ONE_MINUS_CONSTANT_COLOR,[M0]:r.CONSTANT_ALPHA,[b0]:r.ONE_MINUS_CONSTANT_ALPHA};function W(j,xe,re,ye,Te,be,Ge,Ze,je,qe){if(j===rr){_===!0&&(ae(r.BLEND),_=!1);return}if(_===!1&&(Y(r.BLEND),_=!0),j!==a0){if(j!==m||qe!==S){if((p!==Tr||v!==Tr)&&(r.blendEquation(r.FUNC_ADD),p=Tr,v=Tr),qe)switch(j){case Es:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nu:r.blendFunc(r.ONE,r.ONE);break;case iu:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case ru:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}else switch(j){case Es:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case nu:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case iu:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case ru:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}y=null,E=null,C=null,R=null,T.set(0,0,0),w=0,m=j,S=qe}return}Te=Te||xe,be=be||re,Ge=Ge||ye,(xe!==p||Te!==v)&&(r.blendEquationSeparate(ue[xe],ue[Te]),p=xe,v=Te),(re!==y||ye!==E||be!==C||Ge!==R)&&(r.blendFuncSeparate(Ve[re],Ve[ye],Ve[be],Ve[Ge]),y=re,E=ye,C=be,R=Ge),(Ze.equals(T)===!1||je!==w)&&(r.blendColor(Ze.r,Ze.g,Ze.b,je),T.copy(Ze),w=je),m=j,S=!1}function He(j,xe){j.side===xi?ae(r.CULL_FACE):Y(r.CULL_FACE);let re=j.side===Sn;xe&&(re=!re),Ue(re),j.blending===Es&&j.transparent===!1?W(rr):W(j.blending,j.blendEquation,j.blendSrc,j.blendDst,j.blendEquationAlpha,j.blendSrcAlpha,j.blendDstAlpha,j.blendColor,j.blendAlpha,j.premultipliedAlpha),o.setFunc(j.depthFunc),o.setTest(j.depthTest),o.setMask(j.depthWrite),s.setMask(j.colorWrite);const ye=j.stencilWrite;a.setTest(ye),ye&&(a.setMask(j.stencilWriteMask),a.setFunc(j.stencilFunc,j.stencilRef,j.stencilFuncMask),a.setOp(j.stencilFail,j.stencilZFail,j.stencilZPass)),Ie(j.polygonOffset,j.polygonOffsetFactor,j.polygonOffsetUnits),j.alphaToCoverage===!0?Y(r.SAMPLE_ALPHA_TO_COVERAGE):ae(r.SAMPLE_ALPHA_TO_COVERAGE)}function Ue(j){x!==j&&(j?r.frontFace(r.CW):r.frontFace(r.CCW),x=j)}function Fe(j){j!==r0?(Y(r.CULL_FACE),j!==F&&(j===tu?r.cullFace(r.BACK):j===s0?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ae(r.CULL_FACE),F=j}function he(j){j!==I&&(U&&r.lineWidth(j),I=j)}function Ie(j,xe,re){j?(Y(r.POLYGON_OFFSET_FILL),(M!==xe||P!==re)&&(r.polygonOffset(xe,re),M=xe,P=re)):ae(r.POLYGON_OFFSET_FILL)}function Ee(j){j?Y(r.SCISSOR_TEST):ae(r.SCISSOR_TEST)}function A(j){j===void 0&&(j=r.TEXTURE0+O-1),X!==j&&(r.activeTexture(j),X=j)}function b(j,xe,re){re===void 0&&(X===null?re=r.TEXTURE0+O-1:re=X);let ye=V[re];ye===void 0&&(ye={type:void 0,texture:void 0},V[re]=ye),(ye.type!==j||ye.texture!==xe)&&(X!==re&&(r.activeTexture(re),X=re),r.bindTexture(j,xe||se[j]),ye.type=j,ye.texture=xe)}function G(){const j=V[X];j!==void 0&&j.type!==void 0&&(r.bindTexture(j.type,null),j.type=void 0,j.texture=void 0)}function te(){try{r.compressedTexImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ie(){try{r.compressedTexImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function fe(){try{r.texSubImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function _e(){try{r.texSubImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ge(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Se(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Oe(){try{r.texStorage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ve(){try{r.texStorage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Re(){try{r.texImage2D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Ce(){try{r.texImage3D.apply(r,arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function De(j){ne.equals(j)===!1&&(r.scissor(j.x,j.y,j.z,j.w),ne.copy(j))}function pe(j){k.equals(j)===!1&&(r.viewport(j.x,j.y,j.z,j.w),k.copy(j))}function Be(j,xe){let re=c.get(xe);re===void 0&&(re=new WeakMap,c.set(xe,re));let ye=re.get(j);ye===void 0&&(ye=r.getUniformBlockIndex(xe,j.name),re.set(j,ye))}function ke(j,xe){const ye=c.get(xe).get(j);l.get(xe)!==ye&&(r.uniformBlockBinding(xe,ye,j.__bindingPointIndex),l.set(xe,ye))}function nt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),f={},X=null,V={},h={},u=new WeakMap,d=[],g=null,_=!1,m=null,p=null,y=null,E=null,v=null,C=null,R=null,T=new ot(0,0,0),w=0,S=!1,x=null,F=null,I=null,M=null,P=null,ne.set(0,0,r.canvas.width,r.canvas.height),k.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:Y,disable:ae,bindFramebuffer:Me,drawBuffers:Ae,useProgram:we,setBlending:W,setMaterial:He,setFlipSided:Ue,setCullFace:Fe,setLineWidth:he,setPolygonOffset:Ie,setScissorTest:Ee,activeTexture:A,bindTexture:b,unbindTexture:G,compressedTexImage2D:te,compressedTexImage3D:ie,texImage2D:Re,texImage3D:Ce,updateUBOMapping:Be,uniformBlockBinding:ke,texStorage2D:Oe,texStorage3D:ve,texSubImage2D:fe,texSubImage3D:_e,compressedTexSubImage2D:ge,compressedTexSubImage3D:Se,scissor:De,viewport:pe,reset:nt}}function Zu(r,e,t,n){const i=VS(n);switch(t){case jp:return r*e;case Yp:return r*e;case Kp:return r*e*2;case Jp:return r*e/i.components*i.byteLength;case ah:return r*e/i.components*i.byteLength;case Zp:return r*e*2/i.components*i.byteLength;case lh:return r*e*2/i.components*i.byteLength;case qp:return r*e*3/i.components*i.byteLength;case ti:return r*e*4/i.components*i.byteLength;case ch:return r*e*4/i.components*i.byteLength;case $a:case ja:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case qa:case Ya:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case af:case cf:return Math.max(r,16)*Math.max(e,8)/4;case of:case lf:return Math.max(r,8)*Math.max(e,8)/2;case ff:case hf:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case uf:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case df:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case pf:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case mf:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case gf:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case _f:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case vf:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case xf:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case yf:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Sf:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Ef:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Mf:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case bf:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case wf:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Tf:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Ka:case Af:case Rf:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Qp:case Cf:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Df:case Pf:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function VS(r){switch(r){case zi:case Wp:return{byteLength:1,components:1};case Po:case Xp:case Yo:return{byteLength:2,components:1};case sh:case oh:return{byteLength:2,components:4};case kr:case rh:case Ni:return{byteLength:4,components:1};case $p:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function HS(r,e,t,n,i,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new st,f=new WeakMap;let h;const u=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,b){return d?new OffscreenCanvas(A,b):rl("canvas")}function _(A,b,G){let te=1;const ie=Ee(A);if((ie.width>G||ie.height>G)&&(te=G/Math.max(ie.width,ie.height)),te<1)if(typeof HTMLImageElement!="undefined"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&A instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&A instanceof ImageBitmap||typeof VideoFrame!="undefined"&&A instanceof VideoFrame){const fe=Math.floor(te*ie.width),_e=Math.floor(te*ie.height);h===void 0&&(h=g(fe,_e));const ge=b?g(fe,_e):h;return ge.width=fe,ge.height=_e,ge.getContext("2d").drawImage(A,0,0,fe,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+fe+"x"+_e+")."),ge}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),A;return A}function m(A){return A.generateMipmaps}function p(A){r.generateMipmap(A)}function y(A){return A.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?r.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function E(A,b,G,te,ie=!1){if(A!==null){if(r[A]!==void 0)return r[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let fe=b;if(b===r.RED&&(G===r.FLOAT&&(fe=r.R32F),G===r.HALF_FLOAT&&(fe=r.R16F),G===r.UNSIGNED_BYTE&&(fe=r.R8)),b===r.RED_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.R8UI),G===r.UNSIGNED_SHORT&&(fe=r.R16UI),G===r.UNSIGNED_INT&&(fe=r.R32UI),G===r.BYTE&&(fe=r.R8I),G===r.SHORT&&(fe=r.R16I),G===r.INT&&(fe=r.R32I)),b===r.RG&&(G===r.FLOAT&&(fe=r.RG32F),G===r.HALF_FLOAT&&(fe=r.RG16F),G===r.UNSIGNED_BYTE&&(fe=r.RG8)),b===r.RG_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RG8UI),G===r.UNSIGNED_SHORT&&(fe=r.RG16UI),G===r.UNSIGNED_INT&&(fe=r.RG32UI),G===r.BYTE&&(fe=r.RG8I),G===r.SHORT&&(fe=r.RG16I),G===r.INT&&(fe=r.RG32I)),b===r.RGB_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RGB8UI),G===r.UNSIGNED_SHORT&&(fe=r.RGB16UI),G===r.UNSIGNED_INT&&(fe=r.RGB32UI),G===r.BYTE&&(fe=r.RGB8I),G===r.SHORT&&(fe=r.RGB16I),G===r.INT&&(fe=r.RGB32I)),b===r.RGBA_INTEGER&&(G===r.UNSIGNED_BYTE&&(fe=r.RGBA8UI),G===r.UNSIGNED_SHORT&&(fe=r.RGBA16UI),G===r.UNSIGNED_INT&&(fe=r.RGBA32UI),G===r.BYTE&&(fe=r.RGBA8I),G===r.SHORT&&(fe=r.RGBA16I),G===r.INT&&(fe=r.RGBA32I)),b===r.RGB&&G===r.UNSIGNED_INT_5_9_9_9_REV&&(fe=r.RGB9_E5),b===r.RGBA){const _e=ie?xl:dt.getTransfer(te);G===r.FLOAT&&(fe=r.RGBA32F),G===r.HALF_FLOAT&&(fe=r.RGBA16F),G===r.UNSIGNED_BYTE&&(fe=_e===St?r.SRGB8_ALPHA8:r.RGBA8),G===r.UNSIGNED_SHORT_4_4_4_4&&(fe=r.RGBA4),G===r.UNSIGNED_SHORT_5_5_5_1&&(fe=r.RGB5_A1)}return(fe===r.R16F||fe===r.R32F||fe===r.RG16F||fe===r.RG32F||fe===r.RGBA16F||fe===r.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function v(A,b){let G;return A?b===null||b===kr||b===Ls?G=r.DEPTH24_STENCIL8:b===Ni?G=r.DEPTH32F_STENCIL8:b===Po&&(G=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===kr||b===Ls?G=r.DEPTH_COMPONENT24:b===Ni?G=r.DEPTH_COMPONENT32F:b===Po&&(G=r.DEPTH_COMPONENT16),G}function C(A,b){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==ii&&A.minFilter!==Gn?Math.log2(Math.max(b.width,b.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?b.mipmaps.length:1}function R(A){const b=A.target;b.removeEventListener("dispose",R),w(b),b.isVideoTexture&&f.delete(b)}function T(A){const b=A.target;b.removeEventListener("dispose",T),x(b)}function w(A){const b=n.get(A);if(b.__webglInit===void 0)return;const G=A.source,te=u.get(G);if(te){const ie=te[b.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&S(A),Object.keys(te).length===0&&u.delete(G)}n.remove(A)}function S(A){const b=n.get(A);r.deleteTexture(b.__webglTexture);const G=A.source,te=u.get(G);delete te[b.__cacheKey],o.memory.textures--}function x(A){const b=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(b.__webglFramebuffer[te]))for(let ie=0;ie<b.__webglFramebuffer[te].length;ie++)r.deleteFramebuffer(b.__webglFramebuffer[te][ie]);else r.deleteFramebuffer(b.__webglFramebuffer[te]);b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer[te])}else{if(Array.isArray(b.__webglFramebuffer))for(let te=0;te<b.__webglFramebuffer.length;te++)r.deleteFramebuffer(b.__webglFramebuffer[te]);else r.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&r.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let te=0;te<b.__webglColorRenderbuffer.length;te++)b.__webglColorRenderbuffer[te]&&r.deleteRenderbuffer(b.__webglColorRenderbuffer[te]);b.__webglDepthRenderbuffer&&r.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const G=A.textures;for(let te=0,ie=G.length;te<ie;te++){const fe=n.get(G[te]);fe.__webglTexture&&(r.deleteTexture(fe.__webglTexture),o.memory.textures--),n.remove(G[te])}n.remove(A)}let F=0;function I(){F=0}function M(){const A=F;return A>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+i.maxTextures),F+=1,A}function P(A){const b=[];return b.push(A.wrapS),b.push(A.wrapT),b.push(A.wrapR||0),b.push(A.magFilter),b.push(A.minFilter),b.push(A.anisotropy),b.push(A.internalFormat),b.push(A.format),b.push(A.type),b.push(A.generateMipmaps),b.push(A.premultiplyAlpha),b.push(A.flipY),b.push(A.unpackAlignment),b.push(A.colorSpace),b.join()}function O(A,b){const G=n.get(A);if(A.isVideoTexture&&he(A),A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){const te=A.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{k(G,A,b);return}}t.bindTexture(r.TEXTURE_2D,G.__webglTexture,r.TEXTURE0+b)}function U(A,b){const G=n.get(A);if(A.version>0&&G.__version!==A.version){k(G,A,b);return}t.bindTexture(r.TEXTURE_2D_ARRAY,G.__webglTexture,r.TEXTURE0+b)}function B(A,b){const G=n.get(A);if(A.version>0&&G.__version!==A.version){k(G,A,b);return}t.bindTexture(r.TEXTURE_3D,G.__webglTexture,r.TEXTURE0+b)}function z(A,b){const G=n.get(A);if(A.version>0&&G.__version!==A.version){H(G,A,b);return}t.bindTexture(r.TEXTURE_CUBE_MAP,G.__webglTexture,r.TEXTURE0+b)}const X={[rf]:r.REPEAT,[Dr]:r.CLAMP_TO_EDGE,[sf]:r.MIRRORED_REPEAT},V={[ii]:r.NEAREST,[L0]:r.NEAREST_MIPMAP_NEAREST,[pa]:r.NEAREST_MIPMAP_LINEAR,[Gn]:r.LINEAR,[jl]:r.LINEAR_MIPMAP_NEAREST,[Pr]:r.LINEAR_MIPMAP_LINEAR},N={[O0]:r.NEVER,[H0]:r.ALWAYS,[B0]:r.LESS,[nm]:r.LEQUAL,[k0]:r.EQUAL,[V0]:r.GEQUAL,[z0]:r.GREATER,[G0]:r.NOTEQUAL};function $(A,b){if(b.type===Ni&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Gn||b.magFilter===jl||b.magFilter===pa||b.magFilter===Pr||b.minFilter===Gn||b.minFilter===jl||b.minFilter===pa||b.minFilter===Pr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(A,r.TEXTURE_WRAP_S,X[b.wrapS]),r.texParameteri(A,r.TEXTURE_WRAP_T,X[b.wrapT]),(A===r.TEXTURE_3D||A===r.TEXTURE_2D_ARRAY)&&r.texParameteri(A,r.TEXTURE_WRAP_R,X[b.wrapR]),r.texParameteri(A,r.TEXTURE_MAG_FILTER,V[b.magFilter]),r.texParameteri(A,r.TEXTURE_MIN_FILTER,V[b.minFilter]),b.compareFunction&&(r.texParameteri(A,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(A,r.TEXTURE_COMPARE_FUNC,N[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===ii||b.minFilter!==pa&&b.minFilter!==Pr||b.type===Ni&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");r.texParameterf(A,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function ne(A,b){let G=!1;A.__webglInit===void 0&&(A.__webglInit=!0,b.addEventListener("dispose",R));const te=b.source;let ie=u.get(te);ie===void 0&&(ie={},u.set(te,ie));const fe=P(b);if(fe!==A.__cacheKey){ie[fe]===void 0&&(ie[fe]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ie[fe].usedTimes++;const _e=ie[A.__cacheKey];_e!==void 0&&(ie[A.__cacheKey].usedTimes--,_e.usedTimes===0&&S(b)),A.__cacheKey=fe,A.__webglTexture=ie[fe].texture}return G}function k(A,b,G){let te=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(te=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(te=r.TEXTURE_3D);const ie=ne(A,b),fe=b.source;t.bindTexture(te,A.__webglTexture,r.TEXTURE0+G);const _e=n.get(fe);if(fe.version!==_e.__version||ie===!0){t.activeTexture(r.TEXTURE0+G);const ge=dt.getPrimaries(dt.workingColorSpace),Se=b.colorSpace===tr?null:dt.getPrimaries(b.colorSpace),Oe=b.colorSpace===tr||ge===Se?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);let ve=_(b.image,!1,i.maxTextureSize);ve=Ie(b,ve);const Re=s.convert(b.format,b.colorSpace),Ce=s.convert(b.type);let De=E(b.internalFormat,Re,Ce,b.colorSpace,b.isVideoTexture);$(te,b);let pe;const Be=b.mipmaps,ke=b.isVideoTexture!==!0,nt=_e.__version===void 0||ie===!0,j=fe.dataReady,xe=C(b,ve);if(b.isDepthTexture)De=v(b.format===Fs,b.type),nt&&(ke?t.texStorage2D(r.TEXTURE_2D,1,De,ve.width,ve.height):t.texImage2D(r.TEXTURE_2D,0,De,ve.width,ve.height,0,Re,Ce,null));else if(b.isDataTexture)if(Be.length>0){ke&&nt&&t.texStorage2D(r.TEXTURE_2D,xe,De,Be[0].width,Be[0].height);for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,Ce,pe.data):t.texImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,Re,Ce,pe.data);b.generateMipmaps=!1}else ke?(nt&&t.texStorage2D(r.TEXTURE_2D,xe,De,ve.width,ve.height),j&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ve.width,ve.height,Re,Ce,ve.data)):t.texImage2D(r.TEXTURE_2D,0,De,ve.width,ve.height,0,Re,Ce,ve.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){ke&&nt&&t.texStorage3D(r.TEXTURE_2D_ARRAY,xe,De,Be[0].width,Be[0].height,ve.depth);for(let re=0,ye=Be.length;re<ye;re++)if(pe=Be[re],b.format!==ti)if(Re!==null)if(ke){if(j)if(b.layerUpdates.size>0){const Te=Zu(pe.width,pe.height,b.format,b.type);for(const be of b.layerUpdates){const Ge=pe.data.subarray(be*Te/pe.data.BYTES_PER_ELEMENT,(be+1)*Te/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,be,pe.width,pe.height,1,Re,Ge)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,ve.depth,Re,pe.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,re,De,pe.width,pe.height,ve.depth,0,pe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?j&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,pe.width,pe.height,ve.depth,Re,Ce,pe.data):t.texImage3D(r.TEXTURE_2D_ARRAY,re,De,pe.width,pe.height,ve.depth,0,Re,Ce,pe.data)}else{ke&&nt&&t.texStorage2D(r.TEXTURE_2D,xe,De,Be[0].width,Be[0].height);for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],b.format!==ti?Re!==null?ke?j&&t.compressedTexSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,pe.data):t.compressedTexImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,pe.width,pe.height,Re,Ce,pe.data):t.texImage2D(r.TEXTURE_2D,re,De,pe.width,pe.height,0,Re,Ce,pe.data)}else if(b.isDataArrayTexture)if(ke){if(nt&&t.texStorage3D(r.TEXTURE_2D_ARRAY,xe,De,ve.width,ve.height,ve.depth),j)if(b.layerUpdates.size>0){const re=Zu(ve.width,ve.height,b.format,b.type);for(const ye of b.layerUpdates){const Te=ve.data.subarray(ye*re/ve.data.BYTES_PER_ELEMENT,(ye+1)*re/ve.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ye,ve.width,ve.height,1,Re,Ce,Te)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ve.width,ve.height,ve.depth,Re,Ce,ve.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,De,ve.width,ve.height,ve.depth,0,Re,Ce,ve.data);else if(b.isData3DTexture)ke?(nt&&t.texStorage3D(r.TEXTURE_3D,xe,De,ve.width,ve.height,ve.depth),j&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ve.width,ve.height,ve.depth,Re,Ce,ve.data)):t.texImage3D(r.TEXTURE_3D,0,De,ve.width,ve.height,ve.depth,0,Re,Ce,ve.data);else if(b.isFramebufferTexture){if(nt)if(ke)t.texStorage2D(r.TEXTURE_2D,xe,De,ve.width,ve.height);else{let re=ve.width,ye=ve.height;for(let Te=0;Te<xe;Te++)t.texImage2D(r.TEXTURE_2D,Te,De,re,ye,0,Re,Ce,null),re>>=1,ye>>=1}}else if(Be.length>0){if(ke&&nt){const re=Ee(Be[0]);t.texStorage2D(r.TEXTURE_2D,xe,De,re.width,re.height)}for(let re=0,ye=Be.length;re<ye;re++)pe=Be[re],ke?j&&t.texSubImage2D(r.TEXTURE_2D,re,0,0,Re,Ce,pe):t.texImage2D(r.TEXTURE_2D,re,De,Re,Ce,pe);b.generateMipmaps=!1}else if(ke){if(nt){const re=Ee(ve);t.texStorage2D(r.TEXTURE_2D,xe,De,re.width,re.height)}j&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,Re,Ce,ve)}else t.texImage2D(r.TEXTURE_2D,0,De,Re,Ce,ve);m(b)&&p(te),_e.__version=fe.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function H(A,b,G){if(b.image.length!==6)return;const te=ne(A,b),ie=b.source;t.bindTexture(r.TEXTURE_CUBE_MAP,A.__webglTexture,r.TEXTURE0+G);const fe=n.get(ie);if(ie.version!==fe.__version||te===!0){t.activeTexture(r.TEXTURE0+G);const _e=dt.getPrimaries(dt.workingColorSpace),ge=b.colorSpace===tr?null:dt.getPrimaries(b.colorSpace),Se=b.colorSpace===tr||_e===ge?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const Oe=b.isCompressedTexture||b.image[0].isCompressedTexture,ve=b.image[0]&&b.image[0].isDataTexture,Re=[];for(let ye=0;ye<6;ye++)!Oe&&!ve?Re[ye]=_(b.image[ye],!0,i.maxCubemapSize):Re[ye]=ve?b.image[ye].image:b.image[ye],Re[ye]=Ie(b,Re[ye]);const Ce=Re[0],De=s.convert(b.format,b.colorSpace),pe=s.convert(b.type),Be=E(b.internalFormat,De,pe,b.colorSpace),ke=b.isVideoTexture!==!0,nt=fe.__version===void 0||te===!0,j=ie.dataReady;let xe=C(b,Ce);$(r.TEXTURE_CUBE_MAP,b);let re;if(Oe){ke&&nt&&t.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Be,Ce.width,Ce.height);for(let ye=0;ye<6;ye++){re=Re[ye].mipmaps;for(let Te=0;Te<re.length;Te++){const be=re[Te];b.format!==ti?De!==null?ke?j&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,0,0,be.width,be.height,De,be.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,Be,be.width,be.height,0,be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,0,0,be.width,be.height,De,pe,be.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te,Be,be.width,be.height,0,De,pe,be.data)}}}else{if(re=b.mipmaps,ke&&nt){re.length>0&&xe++;const ye=Ee(Re[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Be,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(ve){ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,Re[ye].width,Re[ye].height,De,pe,Re[ye].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,Be,Re[ye].width,Re[ye].height,0,De,pe,Re[ye].data);for(let Te=0;Te<re.length;Te++){const Ge=re[Te].image[ye].image;ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,0,0,Ge.width,Ge.height,De,pe,Ge.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,Be,Ge.width,Ge.height,0,De,pe,Ge.data)}}else{ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,De,pe,Re[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,Be,De,pe,Re[ye]);for(let Te=0;Te<re.length;Te++){const be=re[Te];ke?j&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,0,0,De,pe,be.image[ye]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,Te+1,Be,De,pe,be.image[ye])}}}m(b)&&p(r.TEXTURE_CUBE_MAP),fe.__version=ie.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function se(A,b,G,te,ie,fe){const _e=s.convert(G.format,G.colorSpace),ge=s.convert(G.type),Se=E(G.internalFormat,_e,ge,G.colorSpace),Oe=n.get(b),ve=n.get(G);if(ve.__renderTarget=b,!Oe.__hasExternalTextures){const Re=Math.max(1,b.width>>fe),Ce=Math.max(1,b.height>>fe);ie===r.TEXTURE_3D||ie===r.TEXTURE_2D_ARRAY?t.texImage3D(ie,fe,Se,Re,Ce,b.depth,0,_e,ge,null):t.texImage2D(ie,fe,Se,Re,Ce,0,_e,ge,null)}t.bindFramebuffer(r.FRAMEBUFFER,A),Fe(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,te,ie,ve.__webglTexture,0,Ue(b)):(ie===r.TEXTURE_2D||ie>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,te,ie,ve.__webglTexture,fe),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Y(A,b,G){if(r.bindRenderbuffer(r.RENDERBUFFER,A),b.depthBuffer){const te=b.depthTexture,ie=te&&te.isDepthTexture?te.type:null,fe=v(b.stencilBuffer,ie),_e=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ge=Ue(b);Fe(b)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ge,fe,b.width,b.height):G?r.renderbufferStorageMultisample(r.RENDERBUFFER,ge,fe,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,fe,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,_e,r.RENDERBUFFER,A)}else{const te=b.textures;for(let ie=0;ie<te.length;ie++){const fe=te[ie],_e=s.convert(fe.format,fe.colorSpace),ge=s.convert(fe.type),Se=E(fe.internalFormat,_e,ge,fe.colorSpace),Oe=Ue(b);G&&Fe(b)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Oe,Se,b.width,b.height):Fe(b)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Oe,Se,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,Se,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function ae(A,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,A),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const te=n.get(b.depthTexture);te.__renderTarget=b,(!te.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),O(b.depthTexture,0);const ie=te.__webglTexture,fe=Ue(b);if(b.depthTexture.format===Ms)Fe(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ie,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ie,0);else if(b.depthTexture.format===Fs)Fe(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ie,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ie,0);else throw new Error("Unknown depthTexture format")}function Me(A){const b=n.get(A),G=A.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==A.depthTexture){const te=A.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),te){const ie=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,te.removeEventListener("dispose",ie)};te.addEventListener("dispose",ie),b.__depthDisposeCallback=ie}b.__boundDepthTexture=te}if(A.depthTexture&&!b.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");ae(b.__webglFramebuffer,A)}else if(G){b.__webglDepthbuffer=[];for(let te=0;te<6;te++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[te]),b.__webglDepthbuffer[te]===void 0)b.__webglDepthbuffer[te]=r.createRenderbuffer(),Y(b.__webglDepthbuffer[te],A,!1);else{const ie=A.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,fe=b.__webglDepthbuffer[te];r.bindRenderbuffer(r.RENDERBUFFER,fe),r.framebufferRenderbuffer(r.FRAMEBUFFER,ie,r.RENDERBUFFER,fe)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),Y(b.__webglDepthbuffer,A,!1);else{const te=A.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ie=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ie),r.framebufferRenderbuffer(r.FRAMEBUFFER,te,r.RENDERBUFFER,ie)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ae(A,b,G){const te=n.get(A);b!==void 0&&se(te.__webglFramebuffer,A,A.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),G!==void 0&&Me(A)}function we(A){const b=A.texture,G=n.get(A),te=n.get(b);A.addEventListener("dispose",T);const ie=A.textures,fe=A.isWebGLCubeRenderTarget===!0,_e=ie.length>1;if(_e||(te.__webglTexture===void 0&&(te.__webglTexture=r.createTexture()),te.__version=b.version,o.memory.textures++),fe){G.__webglFramebuffer=[];for(let ge=0;ge<6;ge++)if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer[ge]=[];for(let Se=0;Se<b.mipmaps.length;Se++)G.__webglFramebuffer[ge][Se]=r.createFramebuffer()}else G.__webglFramebuffer[ge]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer=[];for(let ge=0;ge<b.mipmaps.length;ge++)G.__webglFramebuffer[ge]=r.createFramebuffer()}else G.__webglFramebuffer=r.createFramebuffer();if(_e)for(let ge=0,Se=ie.length;ge<Se;ge++){const Oe=n.get(ie[ge]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=r.createTexture(),o.memory.textures++)}if(A.samples>0&&Fe(A)===!1){G.__webglMultisampledFramebuffer=r.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ge=0;ge<ie.length;ge++){const Se=ie[ge];G.__webglColorRenderbuffer[ge]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,G.__webglColorRenderbuffer[ge]);const Oe=s.convert(Se.format,Se.colorSpace),ve=s.convert(Se.type),Re=E(Se.internalFormat,Oe,ve,Se.colorSpace,A.isXRRenderTarget===!0),Ce=Ue(A);r.renderbufferStorageMultisample(r.RENDERBUFFER,Ce,Re,A.width,A.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ge,r.RENDERBUFFER,G.__webglColorRenderbuffer[ge])}r.bindRenderbuffer(r.RENDERBUFFER,null),A.depthBuffer&&(G.__webglDepthRenderbuffer=r.createRenderbuffer(),Y(G.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(fe){t.bindTexture(r.TEXTURE_CUBE_MAP,te.__webglTexture),$(r.TEXTURE_CUBE_MAP,b);for(let ge=0;ge<6;ge++)if(b.mipmaps&&b.mipmaps.length>0)for(let Se=0;Se<b.mipmaps.length;Se++)se(G.__webglFramebuffer[ge][Se],A,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Se);else se(G.__webglFramebuffer[ge],A,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0);m(b)&&p(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(_e){for(let ge=0,Se=ie.length;ge<Se;ge++){const Oe=ie[ge],ve=n.get(Oe);t.bindTexture(r.TEXTURE_2D,ve.__webglTexture),$(r.TEXTURE_2D,Oe),se(G.__webglFramebuffer,A,Oe,r.COLOR_ATTACHMENT0+ge,r.TEXTURE_2D,0),m(Oe)&&p(r.TEXTURE_2D)}t.unbindTexture()}else{let ge=r.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ge=A.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ge,te.__webglTexture),$(ge,b),b.mipmaps&&b.mipmaps.length>0)for(let Se=0;Se<b.mipmaps.length;Se++)se(G.__webglFramebuffer[Se],A,b,r.COLOR_ATTACHMENT0,ge,Se);else se(G.__webglFramebuffer,A,b,r.COLOR_ATTACHMENT0,ge,0);m(b)&&p(ge),t.unbindTexture()}A.depthBuffer&&Me(A)}function ue(A){const b=A.textures;for(let G=0,te=b.length;G<te;G++){const ie=b[G];if(m(ie)){const fe=y(A),_e=n.get(ie).__webglTexture;t.bindTexture(fe,_e),p(fe),t.unbindTexture()}}}const Ve=[],W=[];function He(A){if(A.samples>0){if(Fe(A)===!1){const b=A.textures,G=A.width,te=A.height;let ie=r.COLOR_BUFFER_BIT;const fe=A.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,_e=n.get(A),ge=b.length>1;if(ge)for(let Se=0;Se<b.length;Se++)t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let Se=0;Se<b.length;Se++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(ie|=r.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(ie|=r.STENCIL_BUFFER_BIT)),ge){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,_e.__webglColorRenderbuffer[Se]);const Oe=n.get(b[Se]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Oe,0)}r.blitFramebuffer(0,0,G,te,0,0,G,te,ie,r.NEAREST),l===!0&&(Ve.length=0,W.length=0,Ve.push(r.COLOR_ATTACHMENT0+Se),A.depthBuffer&&A.resolveDepthBuffer===!1&&(Ve.push(fe),W.push(fe),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,W)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Ve))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ge)for(let Se=0;Se<b.length;Se++){t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.RENDERBUFFER,_e.__webglColorRenderbuffer[Se]);const Oe=n.get(b[Se]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,_e.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Se,r.TEXTURE_2D,Oe,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const b=A.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}}function Ue(A){return Math.min(i.maxSamples,A.samples)}function Fe(A){const b=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function he(A){const b=o.render.frame;f.get(A)!==b&&(f.set(A,b),A.update())}function Ie(A,b){const G=A.colorSpace,te=A.format,ie=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||G!==Hs&&G!==tr&&(dt.getTransfer(G)===St?(te!==ti||ie!==zi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),b}function Ee(A){return typeof HTMLImageElement!="undefined"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame!="undefined"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=M,this.resetTextureUnits=I,this.setTexture2D=O,this.setTexture2DArray=U,this.setTexture3D=B,this.setTextureCube=z,this.rebindTextures=Ae,this.setupRenderTarget=we,this.updateRenderTargetMipmap=ue,this.updateMultisampleRenderTarget=He,this.setupDepthRenderbuffer=Me,this.setupFrameBufferTexture=se,this.useMultisampledRTT=Fe}function WS(r,e){function t(n,i=tr){let s;const o=dt.getTransfer(i);if(n===zi)return r.UNSIGNED_BYTE;if(n===sh)return r.UNSIGNED_SHORT_4_4_4_4;if(n===oh)return r.UNSIGNED_SHORT_5_5_5_1;if(n===$p)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===Wp)return r.BYTE;if(n===Xp)return r.SHORT;if(n===Po)return r.UNSIGNED_SHORT;if(n===rh)return r.INT;if(n===kr)return r.UNSIGNED_INT;if(n===Ni)return r.FLOAT;if(n===Yo)return r.HALF_FLOAT;if(n===jp)return r.ALPHA;if(n===qp)return r.RGB;if(n===ti)return r.RGBA;if(n===Yp)return r.LUMINANCE;if(n===Kp)return r.LUMINANCE_ALPHA;if(n===Ms)return r.DEPTH_COMPONENT;if(n===Fs)return r.DEPTH_STENCIL;if(n===Jp)return r.RED;if(n===ah)return r.RED_INTEGER;if(n===Zp)return r.RG;if(n===lh)return r.RG_INTEGER;if(n===ch)return r.RGBA_INTEGER;if(n===$a||n===ja||n===qa||n===Ya)if(o===St)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===$a)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ja)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===qa)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ya)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===$a)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ja)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===qa)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ya)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===of||n===af||n===lf||n===cf)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===of)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===af)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===lf)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===cf)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ff||n===hf||n===uf)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===ff||n===hf)return o===St?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===uf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===df||n===pf||n===mf||n===gf||n===_f||n===vf||n===xf||n===yf||n===Sf||n===Ef||n===Mf||n===bf||n===wf||n===Tf)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===df)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===pf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===mf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===gf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===_f)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===vf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===xf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===yf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Sf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ef)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Mf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===bf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===wf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Tf)return o===St?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ka||n===Af||n===Rf)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Ka)return o===St?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Af)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Rf)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Qp||n===Cf||n===Df||n===Pf)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Ka)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Cf)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Df)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Pf)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ls?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class XS extends Ln{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Eo extends $t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const $S={type:"move"};class Mc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Eo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Eo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Eo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Z),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const f=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],u=f.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent($S)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Eo;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const jS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qS=`
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

}`;class YS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new on,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ur({vertexShader:jS,fragmentShader:qS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Jt(new qr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class KS extends Ws{constructor(e,t){super();const n=this;let i=null,s=1,o=null,a="local-floor",l=1,c=null,f=null,h=null,u=null,d=null,g=null;const _=new YS,m=t.getContextAttributes();let p=null,y=null;const E=[],v=[],C=new st;let R=null;const T=new Ln;T.viewport=new xt;const w=new Ln;w.viewport=new xt;const S=[T,w],x=new XS;let F=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let H=E[k];return H===void 0&&(H=new Mc,E[k]=H),H.getTargetRaySpace()},this.getControllerGrip=function(k){let H=E[k];return H===void 0&&(H=new Mc,E[k]=H),H.getGripSpace()},this.getHand=function(k){let H=E[k];return H===void 0&&(H=new Mc,E[k]=H),H.getHandSpace()};function M(k){const H=v.indexOf(k.inputSource);if(H===-1)return;const se=E[H];se!==void 0&&(se.update(k.inputSource,k.frame,c||o),se.dispatchEvent({type:k.type,data:k.inputSource}))}function P(){i.removeEventListener("select",M),i.removeEventListener("selectstart",M),i.removeEventListener("selectend",M),i.removeEventListener("squeeze",M),i.removeEventListener("squeezestart",M),i.removeEventListener("squeezeend",M),i.removeEventListener("end",P),i.removeEventListener("inputsourceschange",O);for(let k=0;k<E.length;k++){const H=v[k];H!==null&&(v[k]=null,E[k].disconnect(H))}F=null,I=null,_.reset(),e.setRenderTarget(p),d=null,u=null,h=null,i=null,y=null,ne.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){s=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){a=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(k){c=k},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(k){if(i=k,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",M),i.addEventListener("selectstart",M),i.addEventListener("selectend",M),i.addEventListener("squeeze",M),i.addEventListener("squeezestart",M),i.addEventListener("squeezeend",M),i.addEventListener("end",P),i.addEventListener("inputsourceschange",O),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(C),i.renderState.layers===void 0){const H={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,H),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new zr(d.framebufferWidth,d.framebufferHeight,{format:ti,type:zi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let H=null,se=null,Y=null;m.depth&&(Y=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,H=m.stencil?Fs:Ms,se=m.stencil?Ls:kr);const ae={colorFormat:t.RGBA8,depthFormat:Y,scaleFactor:s};h=new XRWebGLBinding(i,t),u=h.createProjectionLayer(ae),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new zr(u.textureWidth,u.textureHeight,{format:ti,type:zi,depthTexture:new _m(u.textureWidth,u.textureHeight,se,void 0,void 0,void 0,void 0,void 0,void 0,H),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),ne.setContext(i),ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function O(k){for(let H=0;H<k.removed.length;H++){const se=k.removed[H],Y=v.indexOf(se);Y>=0&&(v[Y]=null,E[Y].disconnect(se))}for(let H=0;H<k.added.length;H++){const se=k.added[H];let Y=v.indexOf(se);if(Y===-1){for(let Me=0;Me<E.length;Me++)if(Me>=v.length){v.push(se),Y=Me;break}else if(v[Me]===null){v[Me]=se,Y=Me;break}if(Y===-1)break}const ae=E[Y];ae&&ae.connect(se)}}const U=new Z,B=new Z;function z(k,H,se){U.setFromMatrixPosition(H.matrixWorld),B.setFromMatrixPosition(se.matrixWorld);const Y=U.distanceTo(B),ae=H.projectionMatrix.elements,Me=se.projectionMatrix.elements,Ae=ae[14]/(ae[10]-1),we=ae[14]/(ae[10]+1),ue=(ae[9]+1)/ae[5],Ve=(ae[9]-1)/ae[5],W=(ae[8]-1)/ae[0],He=(Me[8]+1)/Me[0],Ue=Ae*W,Fe=Ae*He,he=Y/(-W+He),Ie=he*-W;if(H.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(Ie),k.translateZ(he),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),ae[10]===-1)k.projectionMatrix.copy(H.projectionMatrix),k.projectionMatrixInverse.copy(H.projectionMatrixInverse);else{const Ee=Ae+he,A=we+he,b=Ue-Ie,G=Fe+(Y-Ie),te=ue*we/A*Ee,ie=Ve*we/A*Ee;k.projectionMatrix.makePerspective(b,G,te,ie,Ee,A),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function X(k,H){H===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(H.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(i===null)return;let H=k.near,se=k.far;_.texture!==null&&(_.depthNear>0&&(H=_.depthNear),_.depthFar>0&&(se=_.depthFar)),x.near=w.near=T.near=H,x.far=w.far=T.far=se,(F!==x.near||I!==x.far)&&(i.updateRenderState({depthNear:x.near,depthFar:x.far}),F=x.near,I=x.far),T.layers.mask=k.layers.mask|2,w.layers.mask=k.layers.mask|4,x.layers.mask=T.layers.mask|w.layers.mask;const Y=k.parent,ae=x.cameras;X(x,Y);for(let Me=0;Me<ae.length;Me++)X(ae[Me],Y);ae.length===2?z(x,T,w):x.projectionMatrix.copy(T.projectionMatrix),V(k,x,Y)};function V(k,H,se){se===null?k.matrix.copy(H.matrixWorld):(k.matrix.copy(se.matrixWorld),k.matrix.invert(),k.matrix.multiply(H.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(H.projectionMatrix),k.projectionMatrixInverse.copy(H.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=If*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(k){l=k,u!==null&&(u.fixedFoveation=k),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=k)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let N=null;function $(k,H){if(f=H.getViewerPose(c||o),g=H,f!==null){const se=f.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let Y=!1;se.length!==x.cameras.length&&(x.cameras.length=0,Y=!0);for(let Me=0;Me<se.length;Me++){const Ae=se[Me];let we=null;if(d!==null)we=d.getViewport(Ae);else{const Ve=h.getViewSubImage(u,Ae);we=Ve.viewport,Me===0&&(e.setRenderTargetTextures(y,Ve.colorTexture,u.ignoreDepthValues?void 0:Ve.depthStencilTexture),e.setRenderTarget(y))}let ue=S[Me];ue===void 0&&(ue=new Ln,ue.layers.enable(Me),ue.viewport=new xt,S[Me]=ue),ue.matrix.fromArray(Ae.transform.matrix),ue.matrix.decompose(ue.position,ue.quaternion,ue.scale),ue.projectionMatrix.fromArray(Ae.projectionMatrix),ue.projectionMatrixInverse.copy(ue.projectionMatrix).invert(),ue.viewport.set(we.x,we.y,we.width,we.height),Me===0&&(x.matrix.copy(ue.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),Y===!0&&x.cameras.push(ue)}const ae=i.enabledFeatures;if(ae&&ae.includes("depth-sensing")){const Me=h.getDepthInformation(se[0]);Me&&Me.isValid&&Me.texture&&_.init(e,Me,i.renderState)}}for(let se=0;se<E.length;se++){const Y=v[se],ae=E[se];Y!==null&&ae!==void 0&&ae.update(Y,H,c||o)}N&&N(k,H),H.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:H}),g=null}const ne=new mm;ne.setAnimationLoop($),this.setAnimationLoop=function(k){N=k},this.dispose=function(){}}}const xr=new oi,JS=new Tt;function ZS(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,hm(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,y,E,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),f(m,p)):p.isMeshStandardMaterial?(s(m,p),u(m,p),p.isMeshPhysicalMaterial&&d(m,p,v)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,E):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Sn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Sn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=e.get(p),E=y.envMap,v=y.envMapRotation;E&&(m.envMap.value=E,xr.copy(v),xr.x*=-1,xr.y*=-1,xr.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(xr.y*=-1,xr.z*=-1),m.envMapRotation.value.setFromMatrix4(JS.makeRotationFromEuler(xr)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,E){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=E*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function f(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Sn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function QS(r,e,t,n){let i={},s={},o=[];const a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){const v=E.program;n.uniformBlockBinding(y,v)}function c(y,E){let v=i[y.id];v===void 0&&(g(y),v=f(y),i[y.id]=v,y.addEventListener("dispose",m));const C=E.program;n.updateUBOMapping(y,C);const R=e.render.frame;s[y.id]!==R&&(u(y),s[y.id]=R)}function f(y){const E=h();y.__bindingPointIndex=E;const v=r.createBuffer(),C=y.__size,R=y.usage;return r.bindBuffer(r.UNIFORM_BUFFER,v),r.bufferData(r.UNIFORM_BUFFER,C,R),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,E,v),v}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){const E=i[y.id],v=y.uniforms,C=y.__cache;r.bindBuffer(r.UNIFORM_BUFFER,E);for(let R=0,T=v.length;R<T;R++){const w=Array.isArray(v[R])?v[R]:[v[R]];for(let S=0,x=w.length;S<x;S++){const F=w[S];if(d(F,R,S,C)===!0){const I=F.__offset,M=Array.isArray(F.value)?F.value:[F.value];let P=0;for(let O=0;O<M.length;O++){const U=M[O],B=_(U);typeof U=="number"||typeof U=="boolean"?(F.__data[0]=U,r.bufferSubData(r.UNIFORM_BUFFER,I+P,F.__data)):U.isMatrix3?(F.__data[0]=U.elements[0],F.__data[1]=U.elements[1],F.__data[2]=U.elements[2],F.__data[3]=0,F.__data[4]=U.elements[3],F.__data[5]=U.elements[4],F.__data[6]=U.elements[5],F.__data[7]=0,F.__data[8]=U.elements[6],F.__data[9]=U.elements[7],F.__data[10]=U.elements[8],F.__data[11]=0):(U.toArray(F.__data,P),P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,I,F.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(y,E,v,C){const R=y.value,T=E+"_"+v;if(C[T]===void 0)return typeof R=="number"||typeof R=="boolean"?C[T]=R:C[T]=R.clone(),!0;{const w=C[T];if(typeof R=="number"||typeof R=="boolean"){if(w!==R)return C[T]=R,!0}else if(w.equals(R)===!1)return w.copy(R),!0}return!1}function g(y){const E=y.uniforms;let v=0;const C=16;for(let T=0,w=E.length;T<w;T++){const S=Array.isArray(E[T])?E[T]:[E[T]];for(let x=0,F=S.length;x<F;x++){const I=S[x],M=Array.isArray(I.value)?I.value:[I.value];for(let P=0,O=M.length;P<O;P++){const U=M[P],B=_(U),z=v%C,X=z%B.boundary,V=z+X;v+=X,V!==0&&C-V<B.storage&&(v+=C-V),I.__data=new Float32Array(B.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=v,v+=B.storage}}}const R=v%C;return R>0&&(v+=C-R),y.__size=v,y.__cache={},this}function _(y){const E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),E}function m(y){const E=y.target;E.removeEventListener("dispose",m);const v=o.indexOf(E.__bindingPointIndex);o.splice(v,1),r.deleteBuffer(i[E.id]),delete i[E.id],delete s[E.id]}function p(){for(const y in i)r.deleteBuffer(i[y]);o=[],i={},s={}}return{bind:l,update:c,dispose:p}}class eE{constructor(e={}){const{canvas:t=X0(),context:n=null,depth:i=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:u=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const y=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Un,this.toneMapping=sr,this.toneMappingExposure=1;const v=this;let C=!1,R=0,T=0,w=null,S=-1,x=null;const F=new xt,I=new xt;let M=null;const P=new ot(0);let O=0,U=t.width,B=t.height,z=1,X=null,V=null;const N=new xt(0,0,U,B),$=new xt(0,0,U,B);let ne=!1;const k=new hh;let H=!1,se=!1;const Y=new Tt,ae=new Tt,Me=new Z,Ae=new xt,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ue=!1;function Ve(){return w===null?z:1}let W=n;function He(D,J){return t.getContext(D,J)}try{const D={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ih}`),t.addEventListener("webglcontextlost",ye,!1),t.addEventListener("webglcontextrestored",Te,!1),t.addEventListener("webglcontextcreationerror",be,!1),W===null){const J="webgl2";if(W=He(J,D),W===null)throw He(J)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(D){throw console.error("THREE.WebGLRenderer: "+D.message),D}let Ue,Fe,he,Ie,Ee,A,b,G,te,ie,fe,_e,ge,Se,Oe,ve,Re,Ce,De,pe,Be,ke,nt,j;function xe(){Ue=new ay(W),Ue.init(),ke=new WS(W,Ue),Fe=new ty(W,Ue,e,ke),he=new GS(W,Ue),Fe.reverseDepthBuffer&&u&&he.buffers.depth.setReversed(!0),Ie=new fy(W),Ee=new RS,A=new HS(W,Ue,he,Ee,Fe,ke,Ie),b=new iy(v),G=new oy(v),te=new __(W),nt=new Qx(W,te),ie=new ly(W,te,Ie,nt),fe=new uy(W,ie,te,Ie),De=new hy(W,Fe,A),ve=new ny(Ee),_e=new AS(v,b,G,Ue,Fe,nt,ve),ge=new ZS(v,Ee),Se=new DS,Oe=new NS(Ue),Ce=new Zx(v,b,G,he,fe,d,l),Re=new kS(v,fe,Fe),j=new QS(W,Ie,Fe,he),pe=new ey(W,Ue,Ie),Be=new cy(W,Ue,Ie),Ie.programs=_e.programs,v.capabilities=Fe,v.extensions=Ue,v.properties=Ee,v.renderLists=Se,v.shadowMap=Re,v.state=he,v.info=Ie}xe();const re=new KS(v,W);this.xr=re,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){const D=Ue.get("WEBGL_lose_context");D&&D.loseContext()},this.forceContextRestore=function(){const D=Ue.get("WEBGL_lose_context");D&&D.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(D){D!==void 0&&(z=D,this.setSize(U,B,!1))},this.getSize=function(D){return D.set(U,B)},this.setSize=function(D,J,ce=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=D,B=J,t.width=Math.floor(D*z),t.height=Math.floor(J*z),ce===!0&&(t.style.width=D+"px",t.style.height=J+"px"),this.setViewport(0,0,D,J)},this.getDrawingBufferSize=function(D){return D.set(U*z,B*z).floor()},this.setDrawingBufferSize=function(D,J,ce){U=D,B=J,z=ce,t.width=Math.floor(D*ce),t.height=Math.floor(J*ce),this.setViewport(0,0,D,J)},this.getCurrentViewport=function(D){return D.copy(F)},this.getViewport=function(D){return D.copy(N)},this.setViewport=function(D,J,ce,le){D.isVector4?N.set(D.x,D.y,D.z,D.w):N.set(D,J,ce,le),he.viewport(F.copy(N).multiplyScalar(z).round())},this.getScissor=function(D){return D.copy($)},this.setScissor=function(D,J,ce,le){D.isVector4?$.set(D.x,D.y,D.z,D.w):$.set(D,J,ce,le),he.scissor(I.copy($).multiplyScalar(z).round())},this.getScissorTest=function(){return ne},this.setScissorTest=function(D){he.setScissorTest(ne=D)},this.setOpaqueSort=function(D){X=D},this.setTransparentSort=function(D){V=D},this.getClearColor=function(D){return D.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(D=!0,J=!0,ce=!0){let le=0;if(D){let K=!1;if(w!==null){const Pe=w.texture.format;K=Pe===ch||Pe===lh||Pe===ah}if(K){const Pe=w.texture.type,de=Pe===zi||Pe===kr||Pe===Po||Pe===Ls||Pe===sh||Pe===oh,ze=Ce.getClearColor(),Xe=Ce.getClearAlpha(),Ye=ze.r,Qe=ze.g,We=ze.b;de?(g[0]=Ye,g[1]=Qe,g[2]=We,g[3]=Xe,W.clearBufferuiv(W.COLOR,0,g)):(_[0]=Ye,_[1]=Qe,_[2]=We,_[3]=Xe,W.clearBufferiv(W.COLOR,0,_))}else le|=W.COLOR_BUFFER_BIT}J&&(le|=W.DEPTH_BUFFER_BIT),ce&&(le|=W.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W.clear(le)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ye,!1),t.removeEventListener("webglcontextrestored",Te,!1),t.removeEventListener("webglcontextcreationerror",be,!1),Se.dispose(),Oe.dispose(),Ee.dispose(),b.dispose(),G.dispose(),fe.dispose(),nt.dispose(),j.dispose(),_e.dispose(),re.dispose(),re.removeEventListener("sessionstart",Ct),re.removeEventListener("sessionend",cn),Zt.stop()};function ye(D){D.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function Te(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const D=Ie.autoReset,J=Re.enabled,ce=Re.autoUpdate,le=Re.needsUpdate,K=Re.type;xe(),Ie.autoReset=D,Re.enabled=J,Re.autoUpdate=ce,Re.needsUpdate=le,Re.type=K}function be(D){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",D.statusMessage)}function Ge(D){const J=D.target;J.removeEventListener("dispose",Ge),Ze(J)}function Ze(D){je(D),Ee.remove(D)}function je(D){const J=Ee.get(D).programs;J!==void 0&&(J.forEach(function(ce){_e.releaseProgram(ce)}),D.isShaderMaterial&&_e.releaseShaderCache(D))}this.renderBufferDirect=function(D,J,ce,le,K,Pe){J===null&&(J=we);const de=K.isMesh&&K.matrixWorld.determinant()<0,ze=Fl(D,J,ce,le,K);he.setMaterial(le,de);let Xe=ce.index,Ye=1;if(le.wireframe===!0){if(Xe=ie.getWireframeAttribute(ce),Xe===void 0)return;Ye=2}const Qe=ce.drawRange,We=ce.attributes.position;let at=Qe.start*Ye,pt=(Qe.start+Qe.count)*Ye;Pe!==null&&(at=Math.max(at,Pe.start*Ye),pt=Math.min(pt,(Pe.start+Pe.count)*Ye)),Xe!==null?(at=Math.max(at,0),pt=Math.min(pt,Xe.count)):We!=null&&(at=Math.max(at,0),pt=Math.min(pt,We.count));const gt=pt-at;if(gt<0||gt===1/0)return;nt.setup(K,le,ze,ce,Xe);let jt,ct=pe;if(Xe!==null&&(jt=te.get(Xe),ct=Be,ct.setIndex(jt)),K.isMesh)le.wireframe===!0?(he.setLineWidth(le.wireframeLinewidth*Ve()),ct.setMode(W.LINES)):ct.setMode(W.TRIANGLES);else if(K.isLine){let $e=le.linewidth;$e===void 0&&($e=1),he.setLineWidth($e*Ve()),K.isLineSegments?ct.setMode(W.LINES):K.isLineLoop?ct.setMode(W.LINE_LOOP):ct.setMode(W.LINE_STRIP)}else K.isPoints?ct.setMode(W.POINTS):K.isSprite&&ct.setMode(W.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)ct.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(Ue.get("WEBGL_multi_draw"))ct.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const $e=K._multiDrawStarts,wn=K._multiDrawCounts,ht=K._multiDrawCount,qt=Xe?te.get(Xe).bytesPerElement:1,fi=Ee.get(le).currentProgram.getUniforms();for(let It=0;It<ht;It++)fi.setValue(W,"_gl_DrawID",It),ct.render($e[It]/qt,wn[It])}else if(K.isInstancedMesh)ct.renderInstances(at,gt,K.count);else if(ce.isInstancedBufferGeometry){const $e=ce._maxInstanceCount!==void 0?ce._maxInstanceCount:1/0,wn=Math.min(ce.instanceCount,$e);ct.renderInstances(at,gt,wn)}else ct.render(at,gt)};function qe(D,J,ce){D.transparent===!0&&D.side===xi&&D.forceSinglePass===!1?(D.side=Sn,D.needsUpdate=!0,On(D,J,ce),D.side=hr,D.needsUpdate=!0,On(D,J,ce),D.side=xi):On(D,J,ce)}this.compile=function(D,J,ce=null){ce===null&&(ce=D),p=Oe.get(ce),p.init(J),E.push(p),ce.traverseVisible(function(K){K.isLight&&K.layers.test(J.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),D!==ce&&D.traverseVisible(function(K){K.isLight&&K.layers.test(J.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),p.setupLights();const le=new Set;return D.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Pe=K.material;if(Pe)if(Array.isArray(Pe))for(let de=0;de<Pe.length;de++){const ze=Pe[de];qe(ze,ce,K),le.add(ze)}else qe(Pe,ce,K),le.add(Pe)}),E.pop(),p=null,le},this.compileAsync=function(D,J,ce=null){const le=this.compile(D,J,ce);return new Promise(K=>{function Pe(){if(le.forEach(function(de){Ee.get(de).currentProgram.isReady()&&le.delete(de)}),le.size===0){K(D);return}setTimeout(Pe,10)}Ue.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let Et=null;function bt(D){Et&&Et(D)}function Ct(){Zt.stop()}function cn(){Zt.start()}const Zt=new mm;Zt.setAnimationLoop(bt),typeof self!="undefined"&&Zt.setContext(self),this.setAnimationLoop=function(D){Et=D,re.setAnimationLoop(D),D===null?Zt.stop():Zt.start()},re.addEventListener("sessionstart",Ct),re.addEventListener("sessionend",cn),this.render=function(D,J){if(J!==void 0&&J.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),J.parent===null&&J.matrixWorldAutoUpdate===!0&&J.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(J),J=re.getCamera()),D.isScene===!0&&D.onBeforeRender(v,D,J,w),p=Oe.get(D,E.length),p.init(J),E.push(p),ae.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),k.setFromProjectionMatrix(ae),se=this.localClippingEnabled,H=ve.init(this.clippingPlanes,se),m=Se.get(D,y.length),m.init(),y.push(m),re.enabled===!0&&re.isPresenting===!0){const Pe=v.xr.getDepthSensingMesh();Pe!==null&&bn(Pe,J,-1/0,v.sortObjects)}bn(D,J,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(X,V),ue=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,ue&&Ce.addToRenderList(m,D),this.info.render.frame++,H===!0&&ve.beginShadows();const ce=p.state.shadowsArray;Re.render(ce,D,J),H===!0&&ve.endShadows(),this.info.autoReset===!0&&this.info.reset();const le=m.opaque,K=m.transmissive;if(p.setupLights(),J.isArrayCamera){const Pe=J.cameras;if(K.length>0)for(let de=0,ze=Pe.length;de<ze;de++){const Xe=Pe[de];ci(le,K,D,Xe)}ue&&Ce.render(D);for(let de=0,ze=Pe.length;de<ze;de++){const Xe=Pe[de];Hn(m,D,Xe,Xe.viewport)}}else K.length>0&&ci(le,K,D,J),ue&&Ce.render(D),Hn(m,D,J);w!==null&&(A.updateMultisampleRenderTarget(w),A.updateRenderTargetMipmap(w)),D.isScene===!0&&D.onAfterRender(v,D,J),nt.resetDefaultState(),S=-1,x=null,E.pop(),E.length>0?(p=E[E.length-1],H===!0&&ve.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function bn(D,J,ce,le){if(D.visible===!1)return;if(D.layers.test(J.layers)){if(D.isGroup)ce=D.renderOrder;else if(D.isLOD)D.autoUpdate===!0&&D.update(J);else if(D.isLight)p.pushLight(D),D.castShadow&&p.pushShadow(D);else if(D.isSprite){if(!D.frustumCulled||k.intersectsSprite(D)){le&&Ae.setFromMatrixPosition(D.matrixWorld).applyMatrix4(ae);const de=fe.update(D),ze=D.material;ze.visible&&m.push(D,de,ze,ce,Ae.z,null)}}else if((D.isMesh||D.isLine||D.isPoints)&&(!D.frustumCulled||k.intersectsObject(D))){const de=fe.update(D),ze=D.material;if(le&&(D.boundingSphere!==void 0?(D.boundingSphere===null&&D.computeBoundingSphere(),Ae.copy(D.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ae.copy(de.boundingSphere.center)),Ae.applyMatrix4(D.matrixWorld).applyMatrix4(ae)),Array.isArray(ze)){const Xe=de.groups;for(let Ye=0,Qe=Xe.length;Ye<Qe;Ye++){const We=Xe[Ye],at=ze[We.materialIndex];at&&at.visible&&m.push(D,de,at,ce,Ae.z,We)}}else ze.visible&&m.push(D,de,ze,ce,Ae.z,null)}}const Pe=D.children;for(let de=0,ze=Pe.length;de<ze;de++)bn(Pe[de],J,ce,le)}function Hn(D,J,ce,le){const K=D.opaque,Pe=D.transmissive,de=D.transparent;p.setupLightsView(ce),H===!0&&ve.setGlobalState(v.clippingPlanes,ce),le&&he.viewport(F.copy(le)),K.length>0&&fn(K,J,ce),Pe.length>0&&fn(Pe,J,ce),de.length>0&&fn(de,J,ce),he.buffers.depth.setTest(!0),he.buffers.depth.setMask(!0),he.buffers.color.setMask(!0),he.setPolygonOffset(!1)}function ci(D,J,ce,le){if((ce.isScene===!0?ce.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[le.id]===void 0&&(p.state.transmissionRenderTarget[le.id]=new zr(1,1,{generateMipmaps:!0,type:Ue.has("EXT_color_buffer_half_float")||Ue.has("EXT_color_buffer_float")?Yo:zi,minFilter:Pr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:dt.workingColorSpace}));const Pe=p.state.transmissionRenderTarget[le.id],de=le.viewport||F;Pe.setSize(de.z,de.w);const ze=v.getRenderTarget();v.setRenderTarget(Pe),v.getClearColor(P),O=v.getClearAlpha(),O<1&&v.setClearColor(16777215,.5),v.clear(),ue&&Ce.render(ce);const Xe=v.toneMapping;v.toneMapping=sr;const Ye=le.viewport;if(le.viewport!==void 0&&(le.viewport=void 0),p.setupLightsView(le),H===!0&&ve.setGlobalState(v.clippingPlanes,le),fn(D,ce,le),A.updateMultisampleRenderTarget(Pe),A.updateRenderTargetMipmap(Pe),Ue.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let We=0,at=J.length;We<at;We++){const pt=J[We],gt=pt.object,jt=pt.geometry,ct=pt.material,$e=pt.group;if(ct.side===xi&&gt.layers.test(le.layers)){const wn=ct.side;ct.side=Sn,ct.needsUpdate=!0,Vt(gt,ce,le,jt,ct,$e),ct.side=wn,ct.needsUpdate=!0,Qe=!0}}Qe===!0&&(A.updateMultisampleRenderTarget(Pe),A.updateRenderTargetMipmap(Pe))}v.setRenderTarget(ze),v.setClearColor(P,O),Ye!==void 0&&(le.viewport=Ye),v.toneMapping=Xe}function fn(D,J,ce){const le=J.isScene===!0?J.overrideMaterial:null;for(let K=0,Pe=D.length;K<Pe;K++){const de=D[K],ze=de.object,Xe=de.geometry,Ye=le===null?de.material:le,Qe=de.group;ze.layers.test(ce.layers)&&Vt(ze,J,ce,Xe,Ye,Qe)}}function Vt(D,J,ce,le,K,Pe){D.onBeforeRender(v,J,ce,le,K,Pe),D.modelViewMatrix.multiplyMatrices(ce.matrixWorldInverse,D.matrixWorld),D.normalMatrix.getNormalMatrix(D.modelViewMatrix),K.onBeforeRender(v,J,ce,le,D,Pe),K.transparent===!0&&K.side===xi&&K.forceSinglePass===!1?(K.side=Sn,K.needsUpdate=!0,v.renderBufferDirect(ce,J,le,K,D,Pe),K.side=hr,K.needsUpdate=!0,v.renderBufferDirect(ce,J,le,K,D,Pe),K.side=xi):v.renderBufferDirect(ce,J,le,K,D,Pe),D.onAfterRender(v,J,ce,le,K,Pe)}function On(D,J,ce){J.isScene!==!0&&(J=we);const le=Ee.get(D),K=p.state.lights,Pe=p.state.shadowsArray,de=K.state.version,ze=_e.getParameters(D,K.state,Pe,J,ce),Xe=_e.getProgramCacheKey(ze);let Ye=le.programs;le.environment=D.isMeshStandardMaterial?J.environment:null,le.fog=J.fog,le.envMap=(D.isMeshStandardMaterial?G:b).get(D.envMap||le.environment),le.envMapRotation=le.environment!==null&&D.envMap===null?J.environmentRotation:D.envMapRotation,Ye===void 0&&(D.addEventListener("dispose",Ge),Ye=new Map,le.programs=Ye);let Qe=Ye.get(Xe);if(Qe!==void 0){if(le.currentProgram===Qe&&le.lightsStateVersion===de)return Jr(D,ze),Qe}else ze.uniforms=_e.getUniforms(D),D.onBeforeCompile(ze,v),Qe=_e.acquireProgram(ze,Xe),Ye.set(Xe,Qe),le.uniforms=ze.uniforms;const We=le.uniforms;return(!D.isShaderMaterial&&!D.isRawShaderMaterial||D.clipping===!0)&&(We.clippingPlanes=ve.uniform),Jr(D,ze),le.needsLights=Zr(D),le.lightsStateVersion=de,le.needsLights&&(We.ambientLightColor.value=K.state.ambient,We.lightProbe.value=K.state.probe,We.directionalLights.value=K.state.directional,We.directionalLightShadows.value=K.state.directionalShadow,We.spotLights.value=K.state.spot,We.spotLightShadows.value=K.state.spotShadow,We.rectAreaLights.value=K.state.rectArea,We.ltc_1.value=K.state.rectAreaLTC1,We.ltc_2.value=K.state.rectAreaLTC2,We.pointLights.value=K.state.point,We.pointLightShadows.value=K.state.pointShadow,We.hemisphereLights.value=K.state.hemi,We.directionalShadowMap.value=K.state.directionalShadowMap,We.directionalShadowMatrix.value=K.state.directionalShadowMatrix,We.spotShadowMap.value=K.state.spotShadowMap,We.spotLightMatrix.value=K.state.spotLightMatrix,We.spotLightMap.value=K.state.spotLightMap,We.pointShadowMap.value=K.state.pointShadowMap,We.pointShadowMatrix.value=K.state.pointShadowMatrix),le.currentProgram=Qe,le.uniformsList=null,Qe}function Qs(D){if(D.uniformsList===null){const J=D.currentProgram.getUniforms();D.uniformsList=Ja.seqWithValue(J.seq,D.uniforms)}return D.uniformsList}function Jr(D,J){const ce=Ee.get(D);ce.outputColorSpace=J.outputColorSpace,ce.batching=J.batching,ce.batchingColor=J.batchingColor,ce.instancing=J.instancing,ce.instancingColor=J.instancingColor,ce.instancingMorph=J.instancingMorph,ce.skinning=J.skinning,ce.morphTargets=J.morphTargets,ce.morphNormals=J.morphNormals,ce.morphColors=J.morphColors,ce.morphTargetsCount=J.morphTargetsCount,ce.numClippingPlanes=J.numClippingPlanes,ce.numIntersection=J.numClipIntersection,ce.vertexAlphas=J.vertexAlphas,ce.vertexTangents=J.vertexTangents,ce.toneMapping=J.toneMapping}function Fl(D,J,ce,le,K){J.isScene!==!0&&(J=we),A.resetTextureUnits();const Pe=J.fog,de=le.isMeshStandardMaterial?J.environment:null,ze=w===null?v.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Hs,Xe=(le.isMeshStandardMaterial?G:b).get(le.envMap||de),Ye=le.vertexColors===!0&&!!ce.attributes.color&&ce.attributes.color.itemSize===4,Qe=!!ce.attributes.tangent&&(!!le.normalMap||le.anisotropy>0),We=!!ce.morphAttributes.position,at=!!ce.morphAttributes.normal,pt=!!ce.morphAttributes.color;let gt=sr;le.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(gt=v.toneMapping);const jt=ce.morphAttributes.position||ce.morphAttributes.normal||ce.morphAttributes.color,ct=jt!==void 0?jt.length:0,$e=Ee.get(le),wn=p.state.lights;if(H===!0&&(se===!0||D!==x)){const un=D===x&&le.id===S;ve.setState(le,D,un)}let ht=!1;le.version===$e.__version?($e.needsLights&&$e.lightsStateVersion!==wn.state.version||$e.outputColorSpace!==ze||K.isBatchedMesh&&$e.batching===!1||!K.isBatchedMesh&&$e.batching===!0||K.isBatchedMesh&&$e.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&$e.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&$e.instancing===!1||!K.isInstancedMesh&&$e.instancing===!0||K.isSkinnedMesh&&$e.skinning===!1||!K.isSkinnedMesh&&$e.skinning===!0||K.isInstancedMesh&&$e.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&$e.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&$e.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&$e.instancingMorph===!1&&K.morphTexture!==null||$e.envMap!==Xe||le.fog===!0&&$e.fog!==Pe||$e.numClippingPlanes!==void 0&&($e.numClippingPlanes!==ve.numPlanes||$e.numIntersection!==ve.numIntersection)||$e.vertexAlphas!==Ye||$e.vertexTangents!==Qe||$e.morphTargets!==We||$e.morphNormals!==at||$e.morphColors!==pt||$e.toneMapping!==gt||$e.morphTargetsCount!==ct)&&(ht=!0):(ht=!0,$e.__version=le.version);let qt=$e.currentProgram;ht===!0&&(qt=On(le,J,K));let fi=!1,It=!1,wi=!1;const yt=qt.getUniforms(),hn=$e.uniforms;if(he.useProgram(qt.program)&&(fi=!0,It=!0,wi=!0),le.id!==S&&(S=le.id,It=!0),fi||x!==D){he.buffers.depth.getReversed()?(Y.copy(D.projectionMatrix),j0(Y),q0(Y),yt.setValue(W,"projectionMatrix",Y)):yt.setValue(W,"projectionMatrix",D.projectionMatrix),yt.setValue(W,"viewMatrix",D.matrixWorldInverse);const Tn=yt.map.cameraPosition;Tn!==void 0&&Tn.setValue(W,Me.setFromMatrixPosition(D.matrixWorld)),Fe.logarithmicDepthBuffer&&yt.setValue(W,"logDepthBufFC",2/(Math.log(D.far+1)/Math.LN2)),(le.isMeshPhongMaterial||le.isMeshToonMaterial||le.isMeshLambertMaterial||le.isMeshBasicMaterial||le.isMeshStandardMaterial||le.isShaderMaterial)&&yt.setValue(W,"isOrthographic",D.isOrthographicCamera===!0),x!==D&&(x=D,It=!0,wi=!0)}if(K.isSkinnedMesh){yt.setOptional(W,K,"bindMatrix"),yt.setOptional(W,K,"bindMatrixInverse");const un=K.skeleton;un&&(un.boneTexture===null&&un.computeBoneTexture(),yt.setValue(W,"boneTexture",un.boneTexture,A))}K.isBatchedMesh&&(yt.setOptional(W,K,"batchingTexture"),yt.setValue(W,"batchingTexture",K._matricesTexture,A),yt.setOptional(W,K,"batchingIdTexture"),yt.setValue(W,"batchingIdTexture",K._indirectTexture,A),yt.setOptional(W,K,"batchingColorTexture"),K._colorsTexture!==null&&yt.setValue(W,"batchingColorTexture",K._colorsTexture,A));const Qt=ce.morphAttributes;if((Qt.position!==void 0||Qt.normal!==void 0||Qt.color!==void 0)&&De.update(K,ce,qt),(It||$e.receiveShadow!==K.receiveShadow)&&($e.receiveShadow=K.receiveShadow,yt.setValue(W,"receiveShadow",K.receiveShadow)),le.isMeshGouraudMaterial&&le.envMap!==null&&(hn.envMap.value=Xe,hn.flipEnvMap.value=Xe.isCubeTexture&&Xe.isRenderTargetTexture===!1?-1:1),le.isMeshStandardMaterial&&le.envMap===null&&J.environment!==null&&(hn.envMapIntensity.value=J.environmentIntensity),It&&(yt.setValue(W,"toneMappingExposure",v.toneMappingExposure),$e.needsLights&&aa(hn,wi),Pe&&le.fog===!0&&ge.refreshFogUniforms(hn,Pe),ge.refreshMaterialUniforms(hn,le,z,B,p.state.transmissionRenderTarget[D.id]),Ja.upload(W,Qs($e),hn,A)),le.isShaderMaterial&&le.uniformsNeedUpdate===!0&&(Ja.upload(W,Qs($e),hn,A),le.uniformsNeedUpdate=!1),le.isSpriteMaterial&&yt.setValue(W,"center",K.center),yt.setValue(W,"modelViewMatrix",K.modelViewMatrix),yt.setValue(W,"normalMatrix",K.normalMatrix),yt.setValue(W,"modelMatrix",K.matrixWorld),le.isShaderMaterial||le.isRawShaderMaterial){const un=le.uniformsGroups;for(let Tn=0,dn=un.length;Tn<dn;Tn++){const eo=un[Tn];j.update(eo,qt),j.bind(eo,qt)}}return qt}function aa(D,J){D.ambientLightColor.needsUpdate=J,D.lightProbe.needsUpdate=J,D.directionalLights.needsUpdate=J,D.directionalLightShadows.needsUpdate=J,D.pointLights.needsUpdate=J,D.pointLightShadows.needsUpdate=J,D.spotLights.needsUpdate=J,D.spotLightShadows.needsUpdate=J,D.rectAreaLights.needsUpdate=J,D.hemisphereLights.needsUpdate=J}function Zr(D){return D.isMeshLambertMaterial||D.isMeshToonMaterial||D.isMeshPhongMaterial||D.isMeshStandardMaterial||D.isShadowMaterial||D.isShaderMaterial&&D.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(D,J,ce){Ee.get(D.texture).__webglTexture=J,Ee.get(D.depthTexture).__webglTexture=ce;const le=Ee.get(D);le.__hasExternalTextures=!0,le.__autoAllocateDepthBuffer=ce===void 0,le.__autoAllocateDepthBuffer||Ue.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),le.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(D,J){const ce=Ee.get(D);ce.__webglFramebuffer=J,ce.__useDefaultFramebuffer=J===void 0},this.setRenderTarget=function(D,J=0,ce=0){w=D,R=J,T=ce;let le=!0,K=null,Pe=!1,de=!1;if(D){const Xe=Ee.get(D);if(Xe.__useDefaultFramebuffer!==void 0)he.bindFramebuffer(W.FRAMEBUFFER,null),le=!1;else if(Xe.__webglFramebuffer===void 0)A.setupRenderTarget(D);else if(Xe.__hasExternalTextures)A.rebindTextures(D,Ee.get(D.texture).__webglTexture,Ee.get(D.depthTexture).__webglTexture);else if(D.depthBuffer){const We=D.depthTexture;if(Xe.__boundDepthTexture!==We){if(We!==null&&Ee.has(We)&&(D.width!==We.image.width||D.height!==We.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");A.setupDepthRenderbuffer(D)}}const Ye=D.texture;(Ye.isData3DTexture||Ye.isDataArrayTexture||Ye.isCompressedArrayTexture)&&(de=!0);const Qe=Ee.get(D).__webglFramebuffer;D.isWebGLCubeRenderTarget?(Array.isArray(Qe[J])?K=Qe[J][ce]:K=Qe[J],Pe=!0):D.samples>0&&A.useMultisampledRTT(D)===!1?K=Ee.get(D).__webglMultisampledFramebuffer:Array.isArray(Qe)?K=Qe[ce]:K=Qe,F.copy(D.viewport),I.copy(D.scissor),M=D.scissorTest}else F.copy(N).multiplyScalar(z).floor(),I.copy($).multiplyScalar(z).floor(),M=ne;if(he.bindFramebuffer(W.FRAMEBUFFER,K)&&le&&he.drawBuffers(D,K),he.viewport(F),he.scissor(I),he.setScissorTest(M),Pe){const Xe=Ee.get(D.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_CUBE_MAP_POSITIVE_X+J,Xe.__webglTexture,ce)}else if(de){const Xe=Ee.get(D.texture),Ye=J||0;W.framebufferTextureLayer(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,Xe.__webglTexture,ce||0,Ye)}S=-1},this.readRenderTargetPixels=function(D,J,ce,le,K,Pe,de){if(!(D&&D.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=Ee.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&de!==void 0&&(ze=ze[de]),ze){he.bindFramebuffer(W.FRAMEBUFFER,ze);try{const Xe=D.texture,Ye=Xe.format,Qe=Xe.type;if(!Fe.textureFormatReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Fe.textureTypeReadable(Qe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}J>=0&&J<=D.width-le&&ce>=0&&ce<=D.height-K&&W.readPixels(J,ce,le,K,ke.convert(Ye),ke.convert(Qe),Pe)}finally{const Xe=w!==null?Ee.get(w).__webglFramebuffer:null;he.bindFramebuffer(W.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(D,J,ce,le,K,Pe,de){if(!(D&&D.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ze=Ee.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&de!==void 0&&(ze=ze[de]),ze){const Xe=D.texture,Ye=Xe.format,Qe=Xe.type;if(!Fe.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Fe.textureTypeReadable(Qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(J>=0&&J<=D.width-le&&ce>=0&&ce<=D.height-K){he.bindFramebuffer(W.FRAMEBUFFER,ze);const We=W.createBuffer();W.bindBuffer(W.PIXEL_PACK_BUFFER,We),W.bufferData(W.PIXEL_PACK_BUFFER,Pe.byteLength,W.STREAM_READ),W.readPixels(J,ce,le,K,ke.convert(Ye),ke.convert(Qe),0);const at=w!==null?Ee.get(w).__webglFramebuffer:null;he.bindFramebuffer(W.FRAMEBUFFER,at);const pt=W.fenceSync(W.SYNC_GPU_COMMANDS_COMPLETE,0);return W.flush(),await $0(W,pt,4),W.bindBuffer(W.PIXEL_PACK_BUFFER,We),W.getBufferSubData(W.PIXEL_PACK_BUFFER,0,Pe),W.deleteBuffer(We),W.deleteSync(pt),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(D,J=null,ce=0){D.isTexture!==!0&&(yo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),J=arguments[0]||null,D=arguments[1]);const le=Math.pow(2,-ce),K=Math.floor(D.image.width*le),Pe=Math.floor(D.image.height*le),de=J!==null?J.x:0,ze=J!==null?J.y:0;A.setTexture2D(D,0),W.copyTexSubImage2D(W.TEXTURE_2D,ce,0,0,de,ze,K,Pe),he.unbindTexture()},this.copyTextureToTexture=function(D,J,ce=null,le=null,K=0){D.isTexture!==!0&&(yo("WebGLRenderer: copyTextureToTexture function signature has changed."),le=arguments[0]||null,D=arguments[1],J=arguments[2],K=arguments[3]||0,ce=null);let Pe,de,ze,Xe,Ye,Qe,We,at,pt;const gt=D.isCompressedTexture?D.mipmaps[K]:D.image;ce!==null?(Pe=ce.max.x-ce.min.x,de=ce.max.y-ce.min.y,ze=ce.isBox3?ce.max.z-ce.min.z:1,Xe=ce.min.x,Ye=ce.min.y,Qe=ce.isBox3?ce.min.z:0):(Pe=gt.width,de=gt.height,ze=gt.depth||1,Xe=0,Ye=0,Qe=0),le!==null?(We=le.x,at=le.y,pt=le.z):(We=0,at=0,pt=0);const jt=ke.convert(J.format),ct=ke.convert(J.type);let $e;J.isData3DTexture?(A.setTexture3D(J,0),$e=W.TEXTURE_3D):J.isDataArrayTexture||J.isCompressedArrayTexture?(A.setTexture2DArray(J,0),$e=W.TEXTURE_2D_ARRAY):(A.setTexture2D(J,0),$e=W.TEXTURE_2D),W.pixelStorei(W.UNPACK_FLIP_Y_WEBGL,J.flipY),W.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL,J.premultiplyAlpha),W.pixelStorei(W.UNPACK_ALIGNMENT,J.unpackAlignment);const wn=W.getParameter(W.UNPACK_ROW_LENGTH),ht=W.getParameter(W.UNPACK_IMAGE_HEIGHT),qt=W.getParameter(W.UNPACK_SKIP_PIXELS),fi=W.getParameter(W.UNPACK_SKIP_ROWS),It=W.getParameter(W.UNPACK_SKIP_IMAGES);W.pixelStorei(W.UNPACK_ROW_LENGTH,gt.width),W.pixelStorei(W.UNPACK_IMAGE_HEIGHT,gt.height),W.pixelStorei(W.UNPACK_SKIP_PIXELS,Xe),W.pixelStorei(W.UNPACK_SKIP_ROWS,Ye),W.pixelStorei(W.UNPACK_SKIP_IMAGES,Qe);const wi=D.isDataArrayTexture||D.isData3DTexture,yt=J.isDataArrayTexture||J.isData3DTexture;if(D.isRenderTargetTexture||D.isDepthTexture){const hn=Ee.get(D),Qt=Ee.get(J),un=Ee.get(hn.__renderTarget),Tn=Ee.get(Qt.__renderTarget);he.bindFramebuffer(W.READ_FRAMEBUFFER,un.__webglFramebuffer),he.bindFramebuffer(W.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer);for(let dn=0;dn<ze;dn++)wi&&W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Ee.get(D).__webglTexture,K,Qe+dn),D.isDepthTexture?(yt&&W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Ee.get(J).__webglTexture,K,pt+dn),W.blitFramebuffer(Xe,Ye,Pe,de,We,at,Pe,de,W.DEPTH_BUFFER_BIT,W.NEAREST)):yt?W.copyTexSubImage3D($e,K,We,at,pt+dn,Xe,Ye,Pe,de):W.copyTexSubImage2D($e,K,We,at,pt+dn,Xe,Ye,Pe,de);he.bindFramebuffer(W.READ_FRAMEBUFFER,null),he.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else yt?D.isDataTexture||D.isData3DTexture?W.texSubImage3D($e,K,We,at,pt,Pe,de,ze,jt,ct,gt.data):J.isCompressedArrayTexture?W.compressedTexSubImage3D($e,K,We,at,pt,Pe,de,ze,jt,gt.data):W.texSubImage3D($e,K,We,at,pt,Pe,de,ze,jt,ct,gt):D.isDataTexture?W.texSubImage2D(W.TEXTURE_2D,K,We,at,Pe,de,jt,ct,gt.data):D.isCompressedTexture?W.compressedTexSubImage2D(W.TEXTURE_2D,K,We,at,gt.width,gt.height,jt,gt.data):W.texSubImage2D(W.TEXTURE_2D,K,We,at,Pe,de,jt,ct,gt);W.pixelStorei(W.UNPACK_ROW_LENGTH,wn),W.pixelStorei(W.UNPACK_IMAGE_HEIGHT,ht),W.pixelStorei(W.UNPACK_SKIP_PIXELS,qt),W.pixelStorei(W.UNPACK_SKIP_ROWS,fi),W.pixelStorei(W.UNPACK_SKIP_IMAGES,It),K===0&&J.generateMipmaps&&W.generateMipmap($e),he.unbindTexture()},this.copyTextureToTexture3D=function(D,J,ce=null,le=null,K=0){return D.isTexture!==!0&&(yo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ce=arguments[0]||null,le=arguments[1]||null,D=arguments[2],J=arguments[3],K=arguments[4]||0),yo('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(D,J,ce,le,K)},this.initRenderTarget=function(D){Ee.get(D).__webglFramebuffer===void 0&&A.setupRenderTarget(D)},this.initTexture=function(D){D.isCubeTexture?A.setTextureCube(D,0):D.isData3DTexture?A.setTexture3D(D,0):D.isDataArrayTexture||D.isCompressedArrayTexture?A.setTexture2DArray(D,0):A.setTexture2D(D,0),he.unbindTexture()},this.resetState=function(){R=0,T=0,w=null,he.reset(),nt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Oi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}}class dh{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ot(e),this.density=t}clone(){return new dh(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class tE extends $t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new oi,this.environmentIntensity=1,this.environmentRotation=new oi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class nE extends Vn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}class bm extends Xs{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ot(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Qu=new Tt,Lf=new om,Fa=new Zo,Na=new Z;class iE extends $t{constructor(e=new Mn,t=new bm){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fa.copy(n.boundingSphere),Fa.applyMatrix4(i),Fa.radius+=s,e.ray.intersectsSphere(Fa)===!1)return;Qu.copy(i).invert(),Lf.copy(e.ray).applyMatrix4(Qu);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const u=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let g=u,_=d;g<_;g++){const m=c.getX(g);Na.fromBufferAttribute(h,m),ed(Na,m,l,i,e,t,this)}}else{const u=Math.max(0,o.start),d=Math.min(h.count,o.start+o.count);for(let g=u,_=d;g<_;g++)Na.fromBufferAttribute(h,g),ed(Na,g,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function ed(r,e,t,n,i,s,o){const a=Lf.distanceSqToPoint(r);if(a<t){const l=new Z;Lf.closestPointToPoint(r,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class rE extends on{constructor(e,t,n,i,s,o,a,l,c){super(e,t,n,i,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ph extends Mn{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new Z,f=new st;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,u=3;h<=t;h++,u+=3){const d=n+h/t*i;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),f.x=(o[u]/e+1)/2,f.y=(o[u+1]/e+1)/2,l.push(f.x,f.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new kt(o,3)),this.setAttribute("normal",new kt(a,3)),this.setAttribute("uv",new kt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ph(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class mh extends Mn{constructor(e=1,t=1,n=1,i=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),s=Math.floor(s);const f=[],h=[],u=[],d=[];let g=0;const _=[],m=n/2;let p=0;y(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(f),this.setAttribute("position",new kt(h,3)),this.setAttribute("normal",new kt(u,3)),this.setAttribute("uv",new kt(d,2));function y(){const v=new Z,C=new Z;let R=0;const T=(t-e)/n;for(let w=0;w<=s;w++){const S=[],x=w/s,F=x*(t-e)+e;for(let I=0;I<=i;I++){const M=I/i,P=M*l+a,O=Math.sin(P),U=Math.cos(P);C.x=F*O,C.y=-x*n+m,C.z=F*U,h.push(C.x,C.y,C.z),v.set(O,T,U).normalize(),u.push(v.x,v.y,v.z),d.push(M,1-x),S.push(g++)}_.push(S)}for(let w=0;w<i;w++)for(let S=0;S<s;S++){const x=_[S][w],F=_[S+1][w],I=_[S+1][w+1],M=_[S][w+1];(e>0||S!==0)&&(f.push(x,F,M),R+=3),(t>0||S!==s-1)&&(f.push(F,I,M),R+=3)}c.addGroup(p,R,0),p+=R}function E(v){const C=g,R=new st,T=new Z;let w=0;const S=v===!0?e:t,x=v===!0?1:-1;for(let I=1;I<=i;I++)h.push(0,m*x,0),u.push(0,x,0),d.push(.5,.5),g++;const F=g;for(let I=0;I<=i;I++){const P=I/i*l+a,O=Math.cos(P),U=Math.sin(P);T.x=S*U,T.y=m*x,T.z=S*O,h.push(T.x,T.y,T.z),u.push(0,x,0),R.x=O*.5+.5,R.y=U*.5*x+.5,d.push(R.x,R.y),g++}for(let I=0;I<i;I++){const M=C+I,P=F+I;v===!0?f.push(P,P+1,M):f.push(P+1,P,M),w+=3}c.addGroup(p,w,v===!0?1:2),p+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mh(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class gh extends Mn{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],o=[];a(i),c(n),f(),this.setAttribute("position",new kt(s,3)),this.setAttribute("normal",new kt(s.slice(),3)),this.setAttribute("uv",new kt(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const E=new Z,v=new Z,C=new Z;for(let R=0;R<t.length;R+=3)d(t[R+0],E),d(t[R+1],v),d(t[R+2],C),l(E,v,C,y)}function l(y,E,v,C){const R=C+1,T=[];for(let w=0;w<=R;w++){T[w]=[];const S=y.clone().lerp(v,w/R),x=E.clone().lerp(v,w/R),F=R-w;for(let I=0;I<=F;I++)I===0&&w===R?T[w][I]=S:T[w][I]=S.clone().lerp(x,I/F)}for(let w=0;w<R;w++)for(let S=0;S<2*(R-w)-1;S++){const x=Math.floor(S/2);S%2===0?(u(T[w][x+1]),u(T[w+1][x]),u(T[w][x])):(u(T[w][x+1]),u(T[w+1][x+1]),u(T[w+1][x]))}}function c(y){const E=new Z;for(let v=0;v<s.length;v+=3)E.x=s[v+0],E.y=s[v+1],E.z=s[v+2],E.normalize().multiplyScalar(y),s[v+0]=E.x,s[v+1]=E.y,s[v+2]=E.z}function f(){const y=new Z;for(let E=0;E<s.length;E+=3){y.x=s[E+0],y.y=s[E+1],y.z=s[E+2];const v=m(y)/2/Math.PI+.5,C=p(y)/Math.PI+.5;o.push(v,1-C)}g(),h()}function h(){for(let y=0;y<o.length;y+=6){const E=o[y+0],v=o[y+2],C=o[y+4],R=Math.max(E,v,C),T=Math.min(E,v,C);R>.9&&T<.1&&(E<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),C<.2&&(o[y+4]+=1))}}function u(y){s.push(y.x,y.y,y.z)}function d(y,E){const v=y*3;E.x=e[v+0],E.y=e[v+1],E.z=e[v+2]}function g(){const y=new Z,E=new Z,v=new Z,C=new Z,R=new st,T=new st,w=new st;for(let S=0,x=0;S<s.length;S+=9,x+=6){y.set(s[S+0],s[S+1],s[S+2]),E.set(s[S+3],s[S+4],s[S+5]),v.set(s[S+6],s[S+7],s[S+8]),R.set(o[x+0],o[x+1]),T.set(o[x+2],o[x+3]),w.set(o[x+4],o[x+5]),C.copy(y).add(E).add(v).divideScalar(3);const F=m(C);_(R,x+0,y,F),_(T,x+2,E,F),_(w,x+4,v,F)}}function _(y,E,v,C){C<0&&y.x===1&&(o[E]=y.x-1),v.x===0&&v.z===0&&(o[E]=C/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gh(e.vertices,e.indices,e.radius,e.details)}}class _h extends gh{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new _h(e.radius,e.detail)}}class vh extends Mn{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const f=[],h=new Z,u=new Z,d=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const y=[],E=p/n;let v=0;p===0&&o===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let C=0;C<=t;C++){const R=C/t;h.x=-e*Math.cos(i+R*s)*Math.sin(o+E*a),h.y=e*Math.cos(o+E*a),h.z=e*Math.sin(i+R*s)*Math.sin(o+E*a),g.push(h.x,h.y,h.z),u.copy(h).normalize(),_.push(u.x,u.y,u.z),m.push(R+v,1-E),y.push(c++)}f.push(y)}for(let p=0;p<n;p++)for(let y=0;y<t;y++){const E=f[p][y+1],v=f[p][y],C=f[p+1][y],R=f[p+1][y+1];(p!==0||o>0)&&d.push(E,v,R),(p!==n-1||l<Math.PI)&&d.push(v,C,R)}this.setIndex(d),this.setAttribute("position",new kt(g,3)),this.setAttribute("normal",new kt(_,3)),this.setAttribute("uv",new kt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vh(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Io extends Xs{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tm,this.normalScale=new st(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new oi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class xh extends $t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ot(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class sE extends xh{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ot(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const bc=new Tt,td=new Z,nd=new Z;class wm{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new st(512,512),this.map=null,this.mapPass=null,this.matrix=new Tt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hh,this._frameExtents=new st(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;td.setFromMatrixPosition(e.matrixWorld),t.position.copy(td),nd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(nd),t.updateMatrixWorld(),bc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(bc),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(bc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const id=new Tt,po=new Z,wc=new Z;class oE extends wm{constructor(){super(new Ln(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new st(4,2),this._viewportCount=6,this._viewports=[new xt(2,1,1,1),new xt(0,1,1,1),new xt(3,1,1,1),new xt(1,1,1,1),new xt(3,0,1,1),new xt(1,0,1,1)],this._cubeDirections=[new Z(1,0,0),new Z(-1,0,0),new Z(0,0,1),new Z(0,0,-1),new Z(0,1,0),new Z(0,-1,0)],this._cubeUps=[new Z(0,1,0),new Z(0,1,0),new Z(0,1,0),new Z(0,1,0),new Z(0,0,1),new Z(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),po.setFromMatrixPosition(e.matrixWorld),n.position.copy(po),wc.copy(n.position),wc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(wc),n.updateMatrixWorld(),i.makeTranslation(-po.x,-po.y,-po.z),id.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(id)}}class aE extends xh{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new oE}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class lE extends wm{constructor(){super(new gm(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class cE extends xh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy($t.DEFAULT_UP),this.updateMatrix(),this.target=new $t,this.shadow=new lE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class fE extends Mn{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ih}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ih);ArrayBuffer.isView||(ArrayBuffer.isView=r=>r!==null&&typeof r=="object"&&r.buffer instanceof ArrayBuffer);typeof globalThis=="undefined"&&typeof window!="undefined"&&(window.globalThis=window);typeof FormData=="undefined"&&(globalThis.FormData=class{});var Nt={JOIN_ROOM:10,ERROR:11,LEAVE_ROOM:12,ROOM_DATA:13,ROOM_STATE:14,ROOM_STATE_PATCH:15,ROOM_DATA_BYTES:17,PING:18,ROOM_INPUT_RELIABLE:19,ROOM_INPUT_UNRELIABLE:20,ROOM_REQUEST:21,ROOM_RESPONSE:22},Ff={TIMED:128,UNRELIABLE:64},hE=31,rd={OK:0,ERROR:2},sd={INPUT_REFLECTION:1,INPUT_OPTIONS:2},mo={RENDER_TIME:1,FIXED_TIMESTEP:2,PATCH_RATE:4,SUB_STEPS:8,RECKON_TIME:16},mi={GOING_AWAY:1001,NO_STATUS_RECEIVED:1005,ABNORMAL_CLOSURE:1006,CONSENTED:4e3,FAILED_TO_RECONNECT:4003,MAY_TRY_RECONNECT:4010};class bo extends Error{constructor(t,n,i){super(n);L(this,"code");L(this,"headers");L(this,"status");L(this,"response");L(this,"data");this.name="ServerError",this.code=t,i&&(this.headers=i.headers,this.status=i.status,this.response=i.response,this.data=i.data)}}class yh extends Error{constructor(t,n){super(t);L(this,"code");this.code=n,this.name="MatchMakeError",Object.setPrototypeOf(this,yh.prototype)}}const Ir=255,Tm=213;var me;(function(r){r[r.ADD=128]="ADD",r[r.REPLACE=0]="REPLACE",r[r.DELETE=64]="DELETE",r[r.DELETE_AND_MOVE=96]="DELETE_AND_MOVE",r[r.MOVE_AND_ADD=160]="MOVE_AND_ADD",r[r.DELETE_AND_ADD=192]="DELETE_AND_ADD",r[r.CLEAR=10]="CLEAR",r[r.REVERSE=15]="REVERSE",r[r.MOVE=32]="MOVE",r[r.DELETE_BY_REFID=33]="DELETE_BY_REFID",r[r.ADD_BY_REFID=129]="ADD_BY_REFID"})(me||(me={}));var rp;(rp=Symbol.metadata)!=null||(Symbol.metadata=Symbol.for("Symbol.metadata"));function Am(r){Object.defineProperty(r,Symbol.metadata,{value:void 0,writable:!0,configurable:!0,enumerable:!1})}const od=function(){return typeof globalThis!="undefined"?globalThis:typeof global!="undefined"?global:typeof self!="undefined"?self:typeof window!="undefined"?window:{}}();if(typeof Symbol=="function"&&typeof Symbol.for!="function"){const r="colyseus.symbolRegistry",e=od[r]||(od[r]=Object.create(null));Symbol.for=function(t){return e[t]||(e[t]=Symbol(t))},Symbol.keyFor=function(t){for(const n in e)if(e[n]===t)return n}}const Ke=Symbol.for("$refId"),Si="~track",Ei="~encoder",ri="~decoder",Yr="~filter",Pt="~getByIndex",ai="~deleteByIndex",qs="~resyncPrune",ee=Symbol.for("$changes"),tt=Symbol.for("$childType"),Ft=Symbol.for("$proxyTarget"),or="~onEncodeEnd",si="~reset",sl="~onDecodeEnd",Nn=Symbol.for("$values"),Rm="~builder",Pn="~descriptors",wo="~__encodeDescriptor",Ui="~encoders",rn="~__numFields",ar="~__refTypeFieldIndexes",Zn="~__viewFieldIndexes",Pi="$__fieldIndexesByViewTag",Ur="~__unreliableFieldIndexes",Uo="~__patchOnlyFieldIndexes",ol="~__fullSyncSkipIndexes",Os="~__fullStateOnlyFieldIndexes",In="~__streamFieldIndexes",Oa="~__streamPriorities";let uE;try{uE=new TextEncoder}catch{}const Sl=new ArrayBuffer(8),Gr=new Int32Array(Sl),Nf=new Float32Array(Sl),dE=new Float64Array(Sl),Cm=new BigInt64Array(Sl),pE=typeof Buffer!="undefined"&&Buffer.byteLength,Dm=pE?Buffer.byteLength:function(r,e){for(var t=0,n=0,i=0,s=r.length;i<s;i++)t=r.charCodeAt(i),t<128?n+=1:t<2048?n+=2:t<55296||t>=57344?n+=3:(i++,n+=4);return n};function Pm(r,e,t){for(var n=0,i=0,s=e.length;i<s;i++)n=e.charCodeAt(i),n<128?r[t.offset++]=n:n<2048?(r[t.offset]=192|n>>6,r[t.offset+1]=128|n&63,t.offset+=2):n<55296||n>=57344?(r[t.offset]=224|n>>12,r[t.offset+1]=128|n>>6&63,r[t.offset+2]=128|n&63,t.offset+=3):(i++,n=65536+((n&1023)<<10|e.charCodeAt(i)&1023),r[t.offset]=240|n>>18,r[t.offset+1]=128|n>>12&63,r[t.offset+2]=128|n>>6&63,r[t.offset+3]=128|n&63,t.offset+=4)}function Im(r,e,t){r[t.offset++]=e&255}function mE(r,e,t){r[t.offset++]=e&255}function Um(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255}function Sh(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255}function Gi(r,e,t){r[t.offset++]=e&255,r[t.offset++]=e>>8&255,r[t.offset++]=e>>16&255,r[t.offset++]=e>>24&255}function Vr(r,e,t){const n=e>>24,i=e>>16,s=e>>8,o=e;r[t.offset++]=o&255,r[t.offset++]=s&255,r[t.offset++]=i&255,r[t.offset++]=n&255}function Lm(r,e,t){const n=Math.floor(e/Math.pow(2,32)),i=e>>>0;Vr(r,i,t),Vr(r,n,t)}function Fm(r,e,t){const n=e/Math.pow(2,32)>>0,i=e>>>0;Vr(r,i,t),Vr(r,n,t)}function gE(r,e,t){Cm[0]=BigInt.asIntN(64,e),Gi(r,Gr[0],t),Gi(r,Gr[1],t)}function _E(r,e,t){Cm[0]=BigInt.asIntN(64,e),Gi(r,Gr[0],t),Gi(r,Gr[1],t)}function Nm(r,e,t){Nf[0]=e,Gi(r,Gr[0],t)}function Om(r,e,t){dE[0]=e,Gi(r,Gr[0],t),Gi(r,Gr[1],t)}function vE(r,e,t){r[t.offset++]=e?1:0}function xE(r,e,t){e||(e="");let n=Dm(e,"utf8"),i=0;if(n<32)r[t.offset++]=n|160,i=1;else if(n<256)r[t.offset++]=217,r[t.offset++]=n,i=2;else if(n<65536)r[t.offset++]=218,Sh(r,n,t),i=3;else if(n<4294967296)r[t.offset++]=219,Vr(r,n,t),i=5;else throw new Error("String too long");return Pm(r,e,t),i+n}function Of(r,e,t){if(isNaN(e))return Of(r,0,t);if(isFinite(e)){if(e!==(e|0))return Math.abs(e)<=34028235e31&&(Nf[0]=e,Math.abs(Math.abs(Nf[0])-Math.abs(e))<1e-4)?(r[t.offset++]=202,Nm(r,e,t),5):(r[t.offset++]=203,Om(r,e,t),9)}else return Of(r,e>0?Number.MAX_SAFE_INTEGER:-Number.MAX_SAFE_INTEGER,t);return e>=0?e<128?(r[t.offset++]=e&255,1):e<256?(r[t.offset++]=204,r[t.offset++]=e&255,2):e<65536?(r[t.offset++]=205,Sh(r,e,t),3):e<4294967296?(r[t.offset++]=206,Vr(r,e,t),5):(r[t.offset++]=207,Fm(r,e,t),9):e>=-32?(r[t.offset++]=224|e+32,1):e>=-128?(r[t.offset++]=208,Im(r,e,t),2):e>=-32768?(r[t.offset++]=209,Um(r,e,t),3):e>=-2147483648?(r[t.offset++]=210,Gi(r,e,t),5):(r[t.offset++]=211,Lm(r,e,t),9)}const rt={int8:Im,uint8:mE,int16:Um,uint16:Sh,int32:Gi,uint32:Vr,int64:Lm,uint64:Fm,bigint64:gE,biguint64:_E,float32:Nm,float64:Om,boolean:vE,string:xE,number:Of,utf8Write:Pm,utf8Length:Dm},Qo=new ArrayBuffer(8),Hr=new Int32Array(Qo),yE=new Float32Array(Qo),SE=new Float64Array(Qo),EE=new BigUint64Array(Qo),ME=new BigInt64Array(Qo);function Bm(r,e,t){t>r.length-e.offset&&(t=r.length-e.offset);for(var n="",i=0,s=e.offset,o=e.offset+t;s<o;s++){var a=r[s];if(!(a&128)){n+=String.fromCharCode(a);continue}if((a&224)===192){n+=String.fromCharCode((a&31)<<6|r[++s]&63);continue}if((a&240)===224){n+=String.fromCharCode((a&15)<<12|(r[++s]&63)<<6|(r[++s]&63)<<0);continue}if((a&248)===240){i=(a&7)<<18|(r[++s]&63)<<12|(r[++s]&63)<<6|(r[++s]&63)<<0,i>=65536?(i-=65536,n+=String.fromCharCode((i>>>10)+55296,(i&1023)+56320)):n+=String.fromCharCode(i);continue}console.error("decode.utf8Read(): Invalid byte "+a+" at offset "+s+". Skip to end of string: "+(e.offset+t));break}return e.offset+=t,n}function km(r,e){return ea(r,e)<<24>>24}function ea(r,e){return r[e.offset++]}function zm(r,e){return El(r,e)<<16>>16}function El(r,e){return r[e.offset++]|r[e.offset++]<<8}function li(r,e){return r[e.offset++]|r[e.offset++]<<8|r[e.offset++]<<16|r[e.offset++]<<24}function Bs(r,e){return li(r,e)>>>0}function Gm(r,e){return Hr[0]=li(r,e),yE[0]}function Vm(r,e){return Hr[0]=li(r,e),Hr[1]=li(r,e),SE[0]}function Hm(r,e){const t=Bs(r,e);return li(r,e)*Math.pow(2,32)+t}function Wm(r,e){const t=Bs(r,e);return Bs(r,e)*Math.pow(2,32)+t}function bE(r,e){return Hr[0]=li(r,e),Hr[1]=li(r,e),ME[0]}function wE(r,e){return Hr[0]=li(r,e),Hr[1]=li(r,e),EE[0]}function TE(r,e){return ea(r,e)>0}function AE(r,e){const t=r[e.offset++];let n;return t<192?n=t&31:t===217?n=ea(r,e):t===218?n=El(r,e):t===219&&(n=Bs(r,e)),Bm(r,e,n)}function RE(r,e){const t=r[e.offset++];if(t<128)return t;if(t===202)return Gm(r,e);if(t===203)return Vm(r,e);if(t===204)return ea(r,e);if(t===205)return El(r,e);if(t===206)return Bs(r,e);if(t===207)return Wm(r,e);if(t===208)return km(r,e);if(t===209)return zm(r,e);if(t===210)return li(r,e);if(t===211)return Hm(r,e);if(t>223)return(255-t+1)*-1}function CE(r,e){const t=r[e.offset];return t<192&&t>160||t===217||t===218||t===219}const ut={utf8Read:Bm,int8:km,uint8:ea,int16:zm,uint16:El,int32:li,uint32:Bs,float32:Gm,float64:Vm,int64:Hm,uint64:Wm,bigint64:bE,biguint64:wE,boolean:TE,string:AE,number:RE,stringCheck:CE},Eh={},DE=new Map;function Wi(r,e){e.constructor&&(Object.prototype.hasOwnProperty.call(e,"constructor")&&e.constructor[Symbol.metadata]==null&&Am(e.constructor),DE.set(e.constructor,r),Eh[r]=e),e.encode&&(rt[r]=e.encode),e.decode&&(ut[r]=e.decode)}function Xm(r){return Eh[r]}const $m="ArraySchema does not support streaming — positional ops (splice / unshift / reverse) shift subsequent indexes, so holding ADDs back for a later tick under `maxPerTick` would desync the decoder. Use `t.stream(X)` (stable monotonic positions) or `t.map(X).stream()` (stable keys) instead.";function Vi(){return{pendingByView:new Map,sentByView:new Map,broadcastPending:new Set,sentBroadcast:new Set,broadcastDeletes:new Set,maxPerTick:32}}function Mh(r){var e;return(e=r._stream)!=null?e:r._stream=Vi()}function Ml(r,e,t){e.activeViews.size===0&&Mh(r).broadcastPending.add(t)}function bl(r,e,t,n){const i=r._stream;if(i===void 0)return!0;let s=!1;return i.broadcastPending.delete(n)?s=!0:i.sentBroadcast.delete(n)&&i.broadcastDeletes.add(n),e.forEachActiveView(o=>{const a=i.pendingByView.get(o.id);if(a!=null&&a.has(n)){a.delete(n),s=!0;return}const l=i.sentByView.get(o.id);if(l!=null&&l.has(n)){l.delete(n);let c=o.changes.get(t);c===void 0&&(c=new Map,o.changes.set(t,c)),c.set(n,me.DELETE)}}),s}function PE(r,e,t){const n=r._stream;if(n!==void 0){n.broadcastPending.clear();for(const i of n.sentBroadcast)n.broadcastDeletes.add(i);n.sentBroadcast.clear(),e.forEachActiveView(i=>{var o;(o=n.pendingByView.get(i.id))==null||o.clear();const s=n.sentByView.get(i.id);if(s!==void 0&&s.size>0){let a=i.changes.get(t);a===void 0&&(a=new Map,i.changes.set(t,a));for(const l of s)a.set(l,me.DELETE);s.clear()}})}}function IE(r,e,t){const n=Mh(r);let i=n.pendingByView.get(e);i===void 0&&(i=new Set,n.pendingByView.set(e,i)),i.add(t)}function wl(r,e){var n;const t=r._stream;t!==void 0&&(t.pendingByView.delete(e),t.sentByView.delete(e),(n=t.priorityByView)==null||n.delete(e))}const UE={8:"uint8",16:"uint16",32:"uint32"};function bh(r){var a,l;if(r==null||typeof r!="object")throw new Error("t.quantized(): options object with { min, max } is required.");const{min:e,max:t}=r;if(typeof e!="number"||typeof t!="number"||!(t>e)||!Number.isFinite(e)||!Number.isFinite(t))throw new Error(`t.quantized(): require finite min < max (got min=${e}, max=${t}).`);const n=(a=r.bits)!=null?a:16;if(n!==8&&n!==16&&n!==32)throw new Error(`t.quantized(): bits must be 8, 16 or 32 (got ${n}).`);const i=(l=r.mode)!=null?l:"clamp";if(i!=="clamp"&&i!=="wrap")throw new Error(`t.quantized(): mode must be "clamp" or "wrap" (got ${JSON.stringify(i)}).`);const s=i==="wrap",o=Math.pow(2,n);return{min:e,max:t,bits:n,wrap:s,wire:UE[n],range:t-e,span:s?o:e===-t?o-2:o-1}}function Wr(r){return r!==null&&typeof r=="object"&&r.quantized!==void 0}function jm(r,e){if(r.wrap){if(!Number.isFinite(e))return 0;const n=r.range;let i=(e-r.min)%n;i<0&&(i+=n);const s=r.span;return Math.floor(i/n*s+.5)%s}if(e!==e)return 0;const t=e<r.min?r.min:e>r.max?r.max:e;return Math.floor((t-r.min)/r.range*r.span+.5)}function qm(r,e){return r.min+e/r.span*r.range}function LE(r){const e=rt[r.wire];return(t,n,i)=>e(t,jm(r,n),i)}function FE(r,e,t){const n=ut[r.wire];return qm(r,n(e,t))}const ui=class ui{constructor(e){L(this,"types",{});L(this,"schemas",new Map);L(this,"hasFilters",!1);e&&this.discoverTypes(e)}static register(e){const t=Object.getPrototypeOf(e);if(t!==Ot){let n=ui.inheritedTypes.get(t);n||(n=new Set,ui.inheritedTypes.set(t,n)),n.add(e)}}static cache(e){let t=ui.cachedContexts.get(e);return t||(t=new ui(e),ui.cachedContexts.set(e,t)),t}has(e){return this.schemas.has(e)}get(e){return this.types[e]}add(e,t=this.schemas.size){return this.schemas.has(e)?!1:(this.types[t]=e,e[Symbol.metadata]==null&&mt.initialize(e),this.schemas.set(e,t),!0)}getTypeId(e){return this.schemas.get(e)}discoverTypes(e){var i;if(!this.add(e))return;(i=ui.inheritedTypes.get(e))==null||i.forEach(s=>{this.discoverTypes(s)});let t=e;for(;(t=Object.getPrototypeOf(t))&&t!==Ot&&t!==Function.prototype;)this.discoverTypes(t);const n=e[Symbol.metadata];(n[Zn]||n[In])&&(this.hasFilters=!0);for(const s in n){const a=n[s].type;if(typeof a!="string"&&!Wr(a))if(typeof a=="function")this.discoverTypes(a);else{const l=Object.values(a)[0];if(typeof l=="string")continue;this.discoverTypes(l)}}}debug(){return`TypeContext ->
	Schema types: ${this.schemas.size}
	hasFilters: ${this.hasFilters}`}};L(ui,"inheritedTypes",new Map),L(ui,"cachedContexts",new Map);let Xr=ui;const ad=63;function NE(r){const e=typeof Object.keys(r)[0]=="string"&&Xm(Object.keys(r)[0]);return{complexTypeKlass:e,childType:e?Object.values(r)[0]:r}}function ks(r){if(Array.isArray(r))return{array:ks(r[0])};if(Wr(r))return typeof r.quantized.wire=="string"?r:{quantized:bh(r.quantized)};if(typeof r.type!="undefined")return r.type;if(OE(r))return Object.keys(r).every(e=>typeof r[e]=="string")?"string":"number";if(typeof r=="object"&&r!==null){const e=Object.keys(r).find(t=>Eh[t]!==void 0);if(e)return r[e]=ks(r[e]),r}return r}function OE(r){if(typeof r=="function"&&r[Symbol.metadata])return!1;const e=Object.keys(r),t=e.filter(n=>/\d+/.test(n));return!!(t.length>0&&t.length===e.length/2&&r[r[t[0]]]==t[0]||e.length>0&&e.every(n=>typeof r[n]=="string"&&r[n]===n))}const BE=[ar,Ur,Uo,ol,Os,In,Ui];function Ba(r,e,t){r[e]||Object.defineProperty(r,e,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[e].push(t)}const mt={addField(r,e,t,n,i){if(e>=ad)throw new Error(`Can't define field '${t}'.
Schema instances may only have up to ${ad} fields.`);r[e]=Object.assign(r[e]||{},{type:ks(n),index:e,name:t}),Object.defineProperty(r,Pn,{value:r[Pn]||{},enumerable:!1,configurable:!0}),i?r[Pn][t]=i:r[Pn][t]={value:void 0,writable:!0,enumerable:!0,configurable:!0},Object.defineProperty(r,rn,{value:e,enumerable:!1,configurable:!0}),Object.defineProperty(r,t,{value:e,enumerable:!1,configurable:!0}),typeof r[e].type!="string"&&!Wr(r[e].type)&&(r[ar]===void 0&&Object.defineProperty(r,ar,{value:[],enumerable:!1,configurable:!0}),r[ar].push(e));const s=r[e].type;if(s&&typeof s=="object"&&s.stream!==void 0){if(s.array!==void 0)throw new Error($m);r[e].stream=!0,r[In]||Object.defineProperty(r,In,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[In].includes(e)||r[In].push(e);const o=n==null?void 0:n.priority;typeof o=="function"&&mt.setStreamPriority(r,t,o)}},setTag(r,e,t){const n=r[e],i=r[n];if(i.tag=t,r[Zn]||(Object.defineProperty(r,Zn,{value:[],enumerable:!1,configurable:!0}),Object.defineProperty(r,Pi,{value:{},enumerable:!1,configurable:!0})),r[Zn].push(n),t<0)r[Pi][t]||(r[Pi][t]=[]),r[Pi][t].push(n);else for(let s=t;s>0;s&=s-1){const o=s&-s;r[Pi][o]||(r[Pi][o]=[]),r[Pi][o].push(n)}},setUnreliable(r,e){const t=r[e];if(typeof r[t].type!="string")throw new Error(`@unreliable cannot be applied to ref-type field "${e}". For ref-type fields, mark each primitive sub-field with @unreliable instead. See README "Limitations and best practices".`);r[t].unreliable=!0,r[Ur]||Object.defineProperty(r,Ur,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[Ur].push(t)},setPatchOnly(r,e){const t=r[e];if(r[t].fullStateOnly)throw new Error(`field "${e}" cannot be both patchOnly and fullStateOnly — those are the only two delivery channels, so the field would never reach a client.`);r[t].patchOnly=!0,Ba(r,Uo,t),Ba(r,ol,t)},setDeprecated(r,e){const t=r[e];r[t].deprecated=!0,Ba(r,ol,t),Object.defineProperty(r,t,{value:r[t],enumerable:!1,configurable:!0})},setFullStateOnly(r,e){const t=r[e];if(r[t].patchOnly)throw new Error(`field "${e}" cannot be both patchOnly and fullStateOnly — those are the only two delivery channels, so the field would never reach a client.`);r[t].fullStateOnly=!0,Ba(r,Os,t)},setStream(r,e){const t=r[e];r[t].stream=!0,r[In]||Object.defineProperty(r,In,{value:[],enumerable:!1,configurable:!0,writable:!0}),r[In].push(t)},setStreamPriority(r,e,t){const n=r[e];r[Oa]||Object.defineProperty(r,Oa,{value:{},enumerable:!1,configurable:!0,writable:!0}),r[Oa][n]=t},getStreamPriority(r,e){var t;return(t=r==null?void 0:r[Oa])==null?void 0:t[e]},defineField(r,e,t,n,i){const s=ks(i),{complexTypeKlass:o,childType:a}=NE(s);mt.addField(e,t,n,s,F1(n,t,a,o)),e[Pn][n]&&Object.defineProperty(r.prototype,n,e[Pn][n]),(typeof s=="string"||Wr(s))&&(e[Ui]||Object.defineProperty(e,Ui,{value:[],enumerable:!1,configurable:!0,writable:!0}),e[Ui][t]=typeof s=="string"?rt[s]:LE(s.quantized))},setFields(r,e){var a,l;const t=r.prototype.constructor;Xr.register(t);const n=Object.getPrototypeOf(t),i=n&&n[Symbol.metadata],s=mt.initialize(t);t[Si]||(t[Si]=Ot[Si]),t[Ei]||(t[Ei]=Ot[Ei]),t[ri]||(t[ri]=Ot[ri]),t.prototype.toJSON||(t.prototype.toJSON=Ot.prototype.toJSON);let o=(l=(a=s[rn])!=null?a:i&&i[rn])!=null?l:-1;o++,s[Ui]||Object.defineProperty(s,Ui,{value:i!=null&&i[Ui]?[...i[Ui]]:[],enumerable:!1,configurable:!0,writable:!0});for(const c in e){if(s[c]!==void 0)throw new Error(`@colyseus/schema: Duplicate '${c}' definition on '${t.name||"(anonymous)"}'.`);mt.defineField(t,s,o,c,e[c]),o++}return r},isDeprecated(r,e){return r[e].deprecated===!0},initialize(r){var i;const e=Object.getPrototypeOf(r),t=e[Symbol.metadata];let n=(i=r[Symbol.metadata])!=null?i:Object.create(null);if(e!==Ot&&n===t&&(n=Object.create(null),t)){Object.setPrototypeOf(n,t),Object.defineProperty(n,rn,{value:t[rn],enumerable:!1,configurable:!0,writable:!0}),t[Zn]!==void 0&&(Object.defineProperty(n,Zn,{value:[...t[Zn]],enumerable:!1,configurable:!0,writable:!0}),Object.defineProperty(n,Pi,{value:{...t[Pi]},enumerable:!1,configurable:!0,writable:!0}));for(const s of BE){const o=t[s];o!==void 0&&Object.defineProperty(n,s,{value:[...o],enumerable:!1,configurable:!0,writable:!0})}Object.defineProperty(n,Pn,{value:{...t[Pn]},enumerable:!1,configurable:!0,writable:!0})}return Object.defineProperty(r,Symbol.metadata,{value:n,writable:!1,configurable:!0}),n},isValidInstance(r){return r.constructor[Symbol.metadata]&&Object.prototype.hasOwnProperty.call(r.constructor[Symbol.metadata],rn)},getFields(r){const e=r[Symbol.metadata],t={};for(let n=0;n<=e[rn];n++)t[e[n].name]=e[n].type;return t},hasViewTagAtIndex(r,e){var t;return(t=r==null?void 0:r[Zn])==null?void 0:t.includes(e)},hasUnreliableAtIndex(r,e){var t;return(t=r==null?void 0:r[Ur])==null?void 0:t.includes(e)},hasPatchOnlyAtIndex(r,e){var t;return(t=r==null?void 0:r[Uo])==null?void 0:t.includes(e)},hasFullStateOnlyAtIndex(r,e){var t;return(t=r==null?void 0:r[Os])==null?void 0:t.includes(e)},hasStreamAtIndex(r,e){var t;return(t=r==null?void 0:r[In])==null?void 0:t.includes(e)}},Ym=(r,e,t)=>r(e,t);class kE{constructor(e){L(this,"dirtyLow",0);L(this,"dirtyHigh",0);L(this,"ops");this.ops=new Uint8Array(Math.max(e+1,1))}record(e,t){const n=this.ops[e];n===0?this.ops[e]=t:n===me.DELETE?this.ops[e]=me.DELETE_AND_ADD:n===me.ADD&&t===me.DELETE_AND_ADD&&(this.ops[e]=me.DELETE_AND_ADD),e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}recordDelete(e,t){this.ops[e]=t,e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}recordRaw(e,t){this.record(e,t)}operationAt(e){const t=this.ops[e];return t===0?void 0:t}setOperationAt(e,t){this.ops[e]=t}forEach(e){this.forEachWithCtx(e,Ym)}forEachWithCtx(e,t){let n=this.dirtyLow,i=this.dirtyHigh;const s=this.ops;for(;n!==0;){const o=n&-n,a=31-Math.clz32(o);n^=o,t(e,a,s[a])}for(;i!==0;){const o=i&-i,a=31-Math.clz32(o)+32;i^=o,t(e,a,s[a])}}size(){return al(this.dirtyLow)+al(this.dirtyHigh)}has(){return(this.dirtyLow|this.dirtyHigh)!==0}reset(){this.dirtyLow=0,this.dirtyHigh=0,this.ops.fill(0)}}class zE{constructor(){L(this,"dirty",new Map);L(this,"pureOps",[])}record(e,t){const n=this.dirty.get(e);n===void 0?this.dirty.set(e,t):n===me.DELETE?this.dirty.set(e,me.DELETE_AND_ADD):n===me.ADD&&t===me.DELETE_AND_ADD&&this.dirty.set(e,me.DELETE_AND_ADD)}recordDelete(e,t){this.dirty.set(e,t)}recordRaw(e,t){this.dirty.set(e,t)}recordPure(e){this.pureOps.push([this.dirty.size,e])}operationAt(e){return this.dirty.get(e)}setOperationAt(e,t){this.dirty.has(e)&&this.dirty.set(e,t)}forEach(e){this.forEachWithCtx(e,Ym)}forEachWithCtx(e,t){const n=this.pureOps;if(n.length>0){let i=0,s=0;for(const[o,a]of this.dirty){for(;i<n.length&&n[i][0]<=s;){const l=n[i++][1];t(e,-l,l)}t(e,o,a),s++}for(;i<n.length;){const o=n[i++][1];t(e,-o,o)}}else for(const[i,s]of this.dirty)t(e,i,s)}size(){return this.dirty.size+this.pureOps.length}has(){return this.dirty.size>0||this.pureOps.length>0}reset(){this.dirty.clear(),this.pureOps.length=0}shift(e){const t=new Map;for(const[n,i]of this.dirty)t.set(n+e,i);this.dirty=t}}function al(r){return r=r-(r>>>1&1431655765),r=(r&858993459)+(r>>>2&858993459),(r+(r>>>4)&252645135)*16843009>>>24}function ka(r){if(r===void 0)return 0;let e=0;for(let t=0,n=r.length;t<n;t++){const i=r[t];i<32&&(e|=1<<i)}return e}function GE(r){const e=[],t=[],n=[],i=[],s=r==null?void 0:r[rn];if(s===void 0)return{names:e,types:t,tags:n,encoders:i};const o=r[Ui];for(let a=0;a<=s;a++){const l=r[a];if(l===void 0){e[a]=void 0,t[a]=void 0,n[a]=void 0,i[a]=void 0;continue}e[a]=l.name,t[a]=l.type,n[a]=l.tag,i[a]=o==null?void 0:o[a]}return{names:e,types:t,tags:n,encoders:i}}function Km(r){var l,c,f,h,u,d,g,_;const e=r.constructor;if(Object.prototype.hasOwnProperty.call(e,wo))return e[wo];const t=e[Symbol.metadata],n=mt.isValidInstance(r),i=((c=(l=t==null?void 0:t[Zn])==null?void 0:l.length)!=null?c:0)>0,s=GE(t),o=n&&!i?void 0:e[Yr],a={encoder:e[Ei],filter:o,metadata:t,isSchema:n,filterBitmask:n?ka(t==null?void 0:t[Zn]):0,hasAnyFullStateOnly:((h=(f=t==null?void 0:t[Os])==null?void 0:f.length)!=null?h:0)>0,hasAnyUnreliable:((d=(u=t==null?void 0:t[Ur])==null?void 0:u.length)!=null?d:0)>0,hasAnyStream:((_=(g=t==null?void 0:t[In])==null?void 0:g.length)!=null?_:0)>0,hasAnyView:i,fullStateOnlyBitmask:ka(t==null?void 0:t[Os]),unreliableBitmask:ka(t==null?void 0:t[Ur]),streamBitmask:ka(t==null?void 0:t[In]),names:s.names,types:s.types,tags:s.tags,encoders:s.encoders};return Object.defineProperty(e,wo,{value:a,enumerable:!1,writable:!0,configurable:!0}),a}function VE(r,e,t){if(r.parentRef){if(r.parentRef[ee]===e[ee]){r._parentIndex=t;return}if(Jm(r,(n,i)=>n[ee]===e[ee])){r._parentIndex=t;return}}r.parentRef===void 0?(r.parentRef=e,r._parentIndex=t):(r.extraParents={ref:r.parentRef,index:r._parentIndex,next:r.extraParents},r.parentRef=e,r._parentIndex=t)}function HE(r,e,t){if(r.extraParents===void 0){r._parentIndex=t;return}if(r.parentRef[ee]===e[ee]){r._parentIndex=t;return}for(let n=r.extraParents;n!==void 0;n=n.next)if(n.ref[ee]===e[ee]){n.index=t;return}}function WE(r,e){if(r.parentRef&&r.parentRef[ee]===e[ee])return r.extraParents?(r.parentRef=r.extraParents.ref,r._parentIndex=r.extraParents.index,r.extraParents=r.extraParents.next):(r.parentRef=void 0,r._parentIndex=void 0),!0;let t=r.extraParents,n=null;for(;t;){if(t.ref[ee]===e[ee])return n?n.next=t.next:r.extraParents=t.next,!0;n=t,t=t.next}return r.parentRef===void 0}function XE(r,e){if(r.parentRef!==void 0&&e(r.parentRef,r._parentIndex))return{ref:r.parentRef,index:r._parentIndex};for(let t=r.extraParents;t!==void 0;t=t.next)if(e(t.ref,t.index))return{ref:t.ref,index:t.index}}function Jm(r,e){if(r.parentRef!==void 0&&e(r.parentRef,r._parentIndex))return!0;for(let t=r.extraParents;t!==void 0;t=t.next)if(e(t.ref,t.index))return!0;return!1}function $E(r,e){if(r.parentRef&&r.parentRef[ee]===e[ee])return r._parentIndex;for(let t=r.extraParents;t!==void 0;t=t.next)if(t.ref[ee]===e[ee])return t.index}function jE(r){const e=[];r.parentRef&&e.push({ref:r.parentRef,index:r._parentIndex});let t=r.extraParents;for(;t;)e.push({ref:t.ref,index:t.index}),t=t.next;return e}function qE(r,e,t){const n=e.refTarget;if(e.isArray){const s=n.items,o=s[t];if(o!==void 0&&o[ee]===r)return!0;for(let a=0,l=s.length;a<l;a++){const c=s[a];if(c!==void 0&&c[ee]===r)return!0}return!1}const i=e.getValue(t);return i!==void 0&&i[ee]===r}const Zm=(r,e)=>{r.isFieldUnreliable(e)?r.ensureUnreliableRecorder().record(e,me.ADD):r.record(e,me.ADD)},YE=(r,e)=>r(e);function KE(r,e){wh(r,e,YE)}function wh(r,e,t){var i;const n=r.refTarget;if(n[tt]!==void 0){if(r.isPatchOnly)return;if(Array.isArray(n.items)){const s=n.items;for(let o=0,a=s.length;o<a;o++)s[o]!==void 0&&t(e,o)}else if(n.journal!==void 0)for(const[s,o]of n.journal.keyByIndex)n.$items.has(o)&&t(e,s);else if(n.$items!==void 0)for(const s of n.$items.keys())t(e,s)}else{const s=r.metadata;if(!s)return;const o=(i=s[rn])!=null?i:-1,a=s[ol],l=r.encDescriptor.names;for(let c=0;c<=o;c++){const f=l[c];if(f===void 0||a&&a.includes(c))continue;const h=n[f];h!=null&&t(e,c)}}}function Qm(r,e,t,n){var i,s,o,a,l;JE(r,e,t),!r.isFullStateOnly&&(r.has()&&((i=r.root)==null||i.enqueueChangeTree(r)),(s=r.unreliableRecorder)!=null&&s.has()&&((o=r.root)==null||o.enqueueUnreliable(r)),!r.has()&&!((a=r.unreliableRecorder)!=null&&a.has())&&((l=r.root)==null||l.enqueueChangeTree(r)))}function JE(r,e,t){var g,_,m,p,y,E,v,C,R;if(!e)return;const n=e[ee],i=!n._isSchema;let s;i?(e=n.parent,t=n.parentIndex,s=e==null?void 0:e[ee].metadata):s=n.metadata;const o=((g=s==null?void 0:s[Uo])!=null&&g.includes(t)?To:0)|((_=s==null?void 0:s[Os])!=null&&_.includes(t)?ws:0),a=n.flags&c1|o,l=r.flags;r.flags=l|a,a&~l&ws&&(r.reset(),(m=r.unreliableRecorder)==null||m.reset());const f=(p=r.root)==null?void 0:p.types;if(!(f!=null&&f.hasFilters))return;const h=(E=(y=s==null?void 0:s[Zn])==null?void 0:y.includes(t))!=null?E:!1,u=(C=(v=s==null?void 0:s[In])==null?void 0:v.includes(t))!=null?C:!1,d=n.isFiltered||h||u;if(r.isFiltered=d,u&&!i){r.isStreamCollection=!0;const T=Mh(r.ref);if(T.priority===void 0){const w=mt.getStreamPriority(s,t);w!==void 0&&(T.priority=w)}(R=r.root)==null||R.registerStream(r.ref)}if(d){const T=eg(r);r.isVisibilitySharedWithParent=n.isFiltered&&T&&!u&&(!h||i&&s[t].tag!==Cl)}}function ld(r){const e=r.pendingFilterRefresh;for(let t=0;t<e.length;t++){const n=e[t];n.flags&Lo&&Th(n)}e.length=0}function eg(r){return r._isSchema||typeof r.refTarget[tt]!="string"}function Th(r){var s;r.flags&=~Lo;const e=r.root;if(e===void 0||r.parentRef===void 0)return;const t=eg(r);let n=cd(r,r.parentRef,r._parentIndex,t);for(let o=r.extraParents;o!==void 0&&n!==ZE;o=o.next)n|=cd(r,o.ref,o.index,t);if(n===0)return;r.isVisibilitySharedWithParent=(n&cl)!==0;const i=(n&ll)===0;i!==r.isFiltered&&(r.isFiltered=i,!i&&!r.isFullStateOnly&&(r.forEachLiveWithCtx(r,Zm),r.has()&&e.enqueueChangeTree(r),(s=r.unreliableRecorder)!=null&&s.has()&&e.enqueueUnreliable(r)),r.forEachChildWithCtx(r,QE))}const tg=1,ll=2,cl=4,ZE=tg|ll|cl;function cd(r,e,t,n){var o;const i=e[ee];if(i.root!==r.root||!qE(r,i,t))return 0;i.flags&Lo&&Th(i);let s=tg;if(i._isSchema)i.encDescriptor.tags[t]!==void 0||i.isFieldStream(t)||(i.isFiltered?n&&(s|=cl):s|=ll);else if(!i.isFiltered)s|=ll;else if(n&&!i.isStreamCollection){const a=(o=i.parent)==null?void 0:o[ee];(a!=null&&a._isSchema?a.encDescriptor.tags[i.parentIndex]:void 0)!==Cl&&(s|=cl)}return s}const QE=(r,e,t)=>{Th(e)};function e1(r,e,t,n){const i=r.subscribedViews;if(i===void 0)return;const s=r.isStreamCollection,o=s?r.ref:void 0,a=s?void 0:t[ee];for(let l=0,c=i.length;l<c;l++){let f=i[l];for(;f!==0;){const h=f&-f;f^=h;const u=l*32+(31-Math.clz32(h)),d=n.activeViews.get(u),g=d==null?void 0:d.deref();if(g===void 0){i[l]&=~h;continue}s?IE(o,u,e):a!==void 0&&g.markVisible(a)}}}function t1(r,e){r.root=e;const t=e.add(r);Qm(r,r.parent,r.parentIndex),t&&ta(r,e,s1)}function n1(r,e,t,n){if(r.addParent(e,n),!t)return;const i=t.add(r);t!==r.root&&(r.root=t,Qm(r,e,n));const s=e==null?void 0:e[ee];if(s!==void 0&&s.subscribedViews!==void 0&&e[tt]!==void 0&&e1(s,n,r.ref,t),i){let o=fd[za];o===void 0&&(o={parentRef:void 0,root:void 0},fd[za]=o),o.parentRef=r.ref,o.root=t,za++,ta(r,o,o1),za--}}function i1(r,e){ta(r,e,r1)}function r1(r,e,t){r(e,t)}function ta(r,e,t){var i;const n=r.refTarget;if(n[tt]){if(typeof n[tt]!="string"){const s=n.items;if(s!==void 0)for(let o=0,a=s.length;o<a;o++){const l=s[o];l&&t(e,l[ee],o)}else{const o=n.$items,a=n._collectionIndexes;for(const l of o.keys()){const c=o.get(l);c&&t(e,c[ee],(i=a==null?void 0:a[l])!=null?i:l)}}}}else{const s=r.metadata,o=s==null?void 0:s[ar];if(!o)return;const a=r.encDescriptor.names;for(let l=0,c=o.length;l<c;l++){const f=o[l],h=n[a[f]];h&&t(e,h[ee],f)}}}function s1(r,e,t){e.root!==r?e.setRoot(r):r.add(e)}const fd=[];let za=0;function o1(r,e,t){if(e.root===r.root){r.root.add(e),r.root.moveNextToParent(e);return}e.setParent(r.parentRef,r.root,t)}function a1(r,e,t){const n=(t&3)<<3;return t<4?r>>>n&255:e>>>n&255}const l1=(r,e,t)=>r(e,t);function hd(){return{next:void 0,tail:void 0,nextPosition:0}}const Tc=1,Ac=2,go=4,Rc=8,To=16,ws=32,Cc=64,Ga=128,Lo=256,c1=To|ws;class Ys{constructor(e,t=e){L(this,"ref");L(this,"refTarget");L(this,"metadata");L(this,"encDescriptor");L(this,"root");L(this,"parentRef");L(this,"_parentIndex");L(this,"extraParents");L(this,"flags",go);L(this,"_fullSyncGen",0);L(this,"_isSchema",!1);L(this,"dirtyLow",0);L(this,"dirtyHigh",0);L(this,"opsLow",0);L(this,"opsHigh",0);L(this,"ops");L(this,"collDirty");L(this,"collPureOps");L(this,"unreliableRecorder");L(this,"paused",!1);L(this,"changesNode");L(this,"unreliableChangesNode");L(this,"visibleViews");L(this,"tagViews");L(this,"subscribedViews");var s,o;this.ref=e,this.refTarget=t;const n=Km(e);this.encDescriptor=n,this.metadata=n.metadata;const i=n.isSchema;if(this._isSchema=i,this.ops=void 0,this.collDirty=void 0,this.collPureOps=void 0,i){const a=(o=(s=this.metadata)==null?void 0:s[rn])!=null?o:0;a>7&&(this.ops=new Uint8Array(a+1))}else this.collDirty=new Map}get isArray(){return this.refTarget!==this.ref}get isFiltered(){return(this.flags&Tc)!==0}set isFiltered(e){this.flags=e?this.flags|Tc:this.flags&~Tc}get isVisibilitySharedWithParent(){return(this.flags&Ac)!==0}set isVisibilitySharedWithParent(e){this.flags=e?this.flags|Ac:this.flags&~Ac}get isNew(){return(this.flags&go)!==0}set isNew(e){this.flags=e?this.flags|go:this.flags&~go}get isUnreliable(){return(this.flags&Rc)!==0}set isUnreliable(e){this.flags=e?this.flags|Rc:this.flags&~Rc}get isPatchOnly(){return(this.flags&To)!==0}set isPatchOnly(e){this.flags=e?this.flags|To:this.flags&~To}get isFullStateOnly(){return(this.flags&ws)!==0}set isFullStateOnly(e){this.flags=e?this.flags|ws:this.flags&~ws}get isStreamCollection(){return(this.flags&Cc)!==0}set isStreamCollection(e){this.flags=e?this.flags|Cc:this.flags&~Cc}get needsRestage(){return(this.flags&Ga)!==0}set needsRestage(e){this.flags=e?this.flags|Ga:this.flags&~Ga}get hasFilteredFields(){return this.isFiltered||this.encDescriptor.hasAnyView}ensureUnreliableRecorder(){var e,t;return this.unreliableRecorder===void 0&&(this.unreliableRecorder=this._isSchema?new kE((t=(e=this.metadata)==null?void 0:e[rn])!=null?t:0):new zE),this.unreliableRecorder}isFieldUnreliable(e){const t=this.encDescriptor;return t.hasAnyUnreliable?e<32?(t.unreliableBitmask&1<<e)!==0:mt.hasUnreliableAtIndex(this.metadata,e):!1}isFieldFullStateOnly(e){if(this.isFullStateOnly)return!0;const t=this.encDescriptor;return t.hasAnyFullStateOnly?e<32?(t.fullStateOnlyBitmask&1<<e)!==0:mt.hasFullStateOnlyAtIndex(this.metadata,e):!1}isFieldStream(e){const t=this.encDescriptor;return t.hasAnyStream?e<32?(t.streamBitmask&1<<e)!==0:mt.hasStreamAtIndex(this.metadata,e):!1}_opAt(e){const t=this.ops;if(t!==void 0)return t[e];const n=(e&3)<<3;return e<4?this.opsLow>>>n&255:this.opsHigh>>>n&255}_opPut(e,t){const n=this.ops;if(n!==void 0){n[e]=t;return}const i=(e&3)<<3,s=~(255<<i);e<4?this.opsLow=this.opsLow&s|t<<i:this.opsHigh=this.opsHigh&s|t<<i}_markDirty(e){e<32?this.dirtyLow|=1<<e:this.dirtyHigh|=1<<e-32}record(e,t){if(this._isSchema){const n=this._opAt(e);n===0?this._opPut(e,t):n===me.DELETE?this._opPut(e,me.DELETE_AND_ADD):n===me.ADD&&t===me.DELETE_AND_ADD&&this._opPut(e,me.DELETE_AND_ADD),this._markDirty(e)}else{const n=this.collDirty,i=n.get(e);let s;i===void 0?s=t:i===me.DELETE||i===me.ADD&&t===me.DELETE_AND_ADD?s=me.DELETE_AND_ADD:s=i,n.set(e,s)}}recordDelete(e,t){this._isSchema?(this._opPut(e,t),this._markDirty(e)):this.collDirty.set(e,t)}recordRaw(e,t){this._isSchema?(this._opPut(e,t),this._markDirty(e)):this.collDirty.set(e,t)}recordPure(e){var t;if(this._isSchema)throw new Error("ChangeTree (Schema): pure operations are not supported");((t=this.collPureOps)!=null?t:this.collPureOps=[]).push([this.collDirty.size,e])}operationAt(e){if(this._isSchema){const t=this._opAt(e);return t===0?void 0:t}return this.collDirty.get(e)}setOperationAt(e,t){if(this._isSchema)this._opPut(e,t);else{const n=this.collDirty;n.has(e)&&n.set(e,t)}}forEach(e){this.forEachWithCtx(e,l1)}forEachWithCtx(e,t){if(this._isSchema){let s=this.dirtyLow,o=this.dirtyHigh;const a=this.ops;if(a!==void 0){for(;s!==0;){const l=s&-s,c=31-Math.clz32(l);s^=l,t(e,c,a[c])}for(;o!==0;){const l=o&-o,c=31-Math.clz32(l)+32;o^=l,t(e,c,a[c])}}else{const l=this.opsLow,c=this.opsHigh;for(;s!==0;){const f=s&-s,h=31-Math.clz32(f);s^=f,t(e,h,a1(l,c,h))}}return}const n=this.collDirty,i=this.collPureOps;if(i!==void 0&&i.length>0){let s=0,o=0;for(const[a,l]of n){for(;s<i.length&&i[s][0]<=o;){const c=i[s++][1];t(e,-c,c)}t(e,a,l),o++}for(;s<i.length;){const a=i[s++][1];t(e,-a,a)}}else for(const[s,o]of n)t(e,s,o)}size(){var e,t;return this._isSchema?al(this.dirtyLow)+al(this.dirtyHigh):this.collDirty.size+((t=(e=this.collPureOps)==null?void 0:e.length)!=null?t:0)}has(){return this._isSchema?(this.dirtyLow|this.dirtyHigh)!==0:this.collDirty.size>0||this.collPureOps!==void 0&&this.collPureOps.length>0}reset(){if(this._isSchema){this.dirtyLow=0,this.dirtyHigh=0,this.ops!==void 0?this.ops.fill(0):(this.opsLow=0,this.opsHigh=0);return}this.collDirty.clear(),this.collPureOps!==void 0&&(this.collPureOps.length=0)}recycle(){var e,t,n;if(this.root!==void 0)throw new Error(`@colyseus/schema: cannot recycle an attached ChangeTree (${(t=(e=this.ref)==null?void 0:e.constructor)==null?void 0:t.name}). Remove the instance from its parent collection before releasing it to a pool.`);this.reset(),(n=this.unreliableRecorder)==null||n.reset(),this.flags=go|Ga,this._fullSyncGen=0,this.parentRef=void 0,this._parentIndex=void 0,this.extraParents=void 0,this.changesNode=void 0,this.unreliableChangesNode=void 0,this.paused=!1,this.visibleViews=void 0,this.tagViews=void 0,this.subscribedViews=void 0}insertAt(e,t){var o;if(this._isSchema)throw new Error("ChangeTree (Schema): insertAt is not supported");const n=this.collDirty,i=new Map,s=!this.paused&&!this.isFullStateOnly;if(e>0)for(const[a,l]of n)a<e&&i.set(a,l);if(s)for(let a=0;a<t;a++)i.set(e+a,me.ADD);for(const[a,l]of n)a>=e&&i.set(a+t,l);this.collDirty=i,s&&((o=this.root)==null||o.enqueueChangeTree(this))}unshift(e){this.insertAt(0,e)}setRoot(e){t1(this,e)}setParent(e,t,n){n1(this,e,t,n)}forEachChild(e){i1(this,e)}forEachChildWithCtx(e,t){ta(this,e,t)}forEachLive(e){KE(this,e)}forEachLiveWithCtx(e,t){wh(this,e,t)}operation(e){var t;this.paused||this.isFullStateOnly||(this.recordPure(e),(t=this.root)==null||t.enqueueChangeTree(this))}_routeAndRecord(e,t,n){var i,s;if(!(this.paused||this.isFieldFullStateOnly(e))){if(this.isFieldUnreliable(e)&&!this.isNew){const o=this.ensureUnreliableRecorder();n?o.recordRaw(e,t):o.record(e,t),(i=this.root)==null||i.enqueueUnreliable(this);return}n?this.recordRaw(e,t):this.record(e,t),(s=this.root)==null||s.enqueueChangeTree(this)}}change(e,t=me.ADD){this._routeAndRecord(e,t,!1)}indexedOperation(e,t){this._routeAndRecord(e,t,!0)}getChange(e){return this.operationAt(e)}pause(){this.paused=!0}resume(){this.paused=!1}untracked(e){const t=this.paused;this.paused=!0;try{return e()}finally{this.paused=t}}markDirty(e,t=me.ADD){const n=this.paused;this.paused=!1;try{this.change(e,t)}finally{this.paused=n}}getValue(e,t=!1){return this.refTarget[Pt](e,t)}delete(e,t){var s,o,a;if(e===void 0){try{throw new Error(`@colyseus/schema ${this.ref.constructor.name}: trying to delete non-existing index '${e}'`)}catch(l){console.warn(l)}return}if(this.paused||this.isFieldFullStateOnly(e))return this.getValue(e);const n=this.isFieldUnreliable(e)&&!this.isNew;n?this.ensureUnreliableRecorder().recordDelete(e,t!=null?t:me.DELETE):this.recordDelete(e,t!=null?t:me.DELETE);const i=this.getValue(e);return i&&i[ee]&&((s=this.root)==null||s.remove(i[ee])),n?(o=this.root)==null||o.enqueueUnreliable(this):(a=this.root)==null||a.enqueueChangeTree(this),i}endEncode(){var e,t;this.reset(),this.changesNode=void 0,this._isSchema||(t=(e=this.refTarget)[or])==null||t.call(e),this.isNew=!1}endEncodeUnreliable(){var e,t,n;(e=this.unreliableRecorder)==null||e.reset(),this.unreliableChangesNode=void 0,this._isSchema||(n=(t=this.refTarget)[or])==null||n.call(t)}discard(){var e,t,n;this._isSchema||(t=(e=this.refTarget)[or])==null||t.call(e),this.reset(),(n=this.unreliableRecorder)==null||n.reset()}discardAll(){var t;const e=n=>{if(n<0)return;const i=this.getValue(n);i&&i[ee]&&i[ee].discardAll()};this.forEach(e),(t=this.unreliableRecorder)==null||t.forEach(e),this.discard()}get changed(){var e,t;return this.has()||((t=(e=this.unreliableRecorder)==null?void 0:e.has())!=null?t:!1)}get parent(){return this.parentRef}get parentIndex(){return this._parentIndex}addParent(e,t){VE(this,e,t)}setParentIndex(e,t){HE(this,e,t)}removeParent(e=this.parent){return WE(this,e)}findParent(e){return XE(this,e)}hasParent(e){return Jm(this,e)}indexInParent(e){return $E(this,e)}getAllParents(){return jE(this)}}class f1{constructor(e){L(this,"ref");L(this,"root");L(this,"parentRef");L(this,"paused",!1);L(this,"isNew",!1);L(this,"flags",0);this.ref=e}change(){}delete(){}indexedOperation(){}operation(){}setParent(){}addParent(){}setParentIndex(){}removeParent(){return!1}getChange(){return 0}discard(){}discardAll(){}pause(){}resume(){}untracked(e){return e()}markDirty(){}forEachChild(e){var o,a,l;const t=this.ref;if(t[tt]){if(typeof t[tt]!="string")for(const[c,f]of t.entries())f&&e(f[ee],(a=(o=t._collectionIndexes)==null?void 0:o[c])!=null?a:c);return}const n=t.constructor,i=n==null?void 0:n[Symbol.metadata];if(!i)return;const s=(l=i[ar])!=null?l:[];for(let c=0;c<s.length;c++){const f=s[c],h=t[i[f].name];h&&e(h[ee],f)}}forEachChildWithCtx(e,t){this.forEachChild((n,i)=>t(e,n,i))}forEachLive(){}forEachLiveWithCtx(){}forEach(){}}function h1(r){return new f1(r)}function Ks(r,e=r){Object.defineProperty(r,ee,{value:h1(e),enumerable:!1,writable:!0})}function Tl(r,e,t,n,i,s,o){var a;o!==void 0?o(e,n,s):typeof t=="string"?(a=rt[t])==null||a.call(rt,e,n,s):t[Symbol.metadata]!=null?(rt.number(e,n[Ke],s),(i&me.ADD)===me.ADD&&r.tryEncodeTypeId(e,t,n.constructor,s)):rt.number(e,n[Ke],s)}const u1=function(r,e,t,n,i,s,o,a){var h;if(e[s.offset++]=(n|i)&255,i===me.DELETE)return;const l=t.encDescriptor,c=t.ref,f=(h=c[Nn][n])!=null?h:c[l.names[n]];Tl(r,e,l.types[n],f,i,s,l.encoders[n])},d1=function(r,e,t,n,i,s){if(e[s.offset++]=i&255,rt.number(e,n,s),i===me.DELETE)return;const o=t.ref;if((i&me.ADD)===me.ADD){const a=o.$indexes.get(n);rt.string(e,a,s)}Tl(r,e,o[tt],o[Pt](n),i,s)},Ah=function(r,e,t,n,i,s){if(e[s.offset++]=i&255,rt.number(e,n,s),i===me.DELETE)return;const o=t.ref;Tl(r,e,o[tt],o[Pt](n),i,s)},p1=function(r,e,t,n,i,s,o,a){const l=t.refTarget,c=l[tt],f=typeof c!="string",h=a&&t.isFiltered&&f;let u;if(h){const g=l.tmpItems[n];if(!g)return;if(u=g[Ke],i===me.DELETE)i=me.DELETE_BY_REFID;else if((i&me.ADD)===me.ADD)i=me.ADD_BY_REFID;else if((i&me.MOVE)===me.MOVE)return}else if(i===me.DELETE&&f){const g=l.tmpItems[n];if(!g)return;u=g[Ke],i=me.DELETE_BY_REFID}else u=n;if(e[s.offset++]=i&255,rt.number(e,u,s),i===me.DELETE||i===me.DELETE_BY_REFID)return;const d=l[Pt](n,o);Tl(r,e,c,d,i,s)};function ng(r,e,t,n,i,s,o){const a=r.resyncVisited;let l=a.get(r.currentRefId);if(l===void 0&&a.set(r.currentRefId,l=new Set),l.add(n),i!==void 0&&t===me.ADD&&i!==s){const c=i[Ke];c!==void 0&&(r.root.removeRef(c),o==null||o.push({ref:e,refId:r.currentRefId,op:me.DELETE,dynamicIndex:n,value:void 0,previousValue:i}))}}function m1(r,e){const t=r.resyncVisited;t.has(e)||t.set(e,new Set)}function g1(r,e){if(r.resyncDamaged){console.warn("@colyseus/schema: resync sweep skipped — parts of the payload could not be decoded. Stale entries may persist until the next resync.");return}Rh(r,r.state,new Set,e)}function Rh(r,e,t,n){const i=e[Ke];if(i===void 0||t.has(i))return;t.add(i);const s=e.constructor[Symbol.metadata],o=s==null?void 0:s[ar];if(o===void 0)return;const a=s[Uo];for(let l=0;l<o.length;l++){const c=o[l];if(a!==void 0&&a.includes(c))continue;const f=s[c],h=e[f.name];h&&(Ot.is(f.type)?Rh(r,h,t,n):_1(r,h,t,n))}}function _1(r,e,t,n){var l;const i=(l=e[Ft])!=null?l:e,s=i[Ke];if(s===void 0||t.has(s))return;t.add(s);const o=r.resyncVisited.get(s);if(o===void 0)return;const a=r.root;i[qs](o,(c,f)=>{n==null||n.push({ref:e,refId:s,op:me.DELETE,dynamicIndex:f,value:void 0,previousValue:c});const h=c==null?void 0:c[Ke];h!==void 0&&a.removeRef(h)},c=>{Ot.isSchema(c)&&Rh(r,c,t,n)})}const ig=-1,Qn={Map:1,Array:2,Set:3,Collection:4,Stream:5};function Ch(r,e,t,n,i,s,o,a,l){const c=r.root;let f;if((e&me.DELETE)===me.DELETE){const h=i==null?void 0:i[Ke];h!==void 0&&c.removeRef(h),e!==me.DELETE_AND_ADD&&t[ai](n),f=void 0}if(e!==me.DELETE)if(typeof s=="string")f=ut[s](o,a);else if(Wr(s))f=FE(s.quantized,o,a);else if(Ot.is(s)){const h=ut.number(o,a);if(f=c.refs.get(h),(e&me.ADD)===me.ADD){const u=r.getInstanceType(o,a,s);f||(f=r.createInstanceOfType(u)),c.addRef(h,f,f!==i||e===me.DELETE_AND_ADD&&f===i)}}else{const h=Xm(Object.keys(s)[0]),u=ut.number(o,a);r.resyncVisited!==null&&m1(r,u);const d=c.refs.has(u)?i||c.refs.get(u):h.constructor.initializeForDecoder();if(f=d.clone(!0),f[tt]=Object.values(s)[0],i){let g=i[Ke];if(g!==void 0&&u!==g){(e&me.DELETE)!==me.DELETE&&c.removeRef(g);const _=i.entries();let m;for(;(m=_.next())&&!m.done;){const[p,y]=m.value;typeof y=="object"&&(g=y[Ke]),l==null||l.push({ref:i,refId:g,op:me.DELETE,field:p,value:void 0,previousValue:y})}}}c.addRef(u,f,d!==i||e===me.DELETE_AND_ADD&&d===i)}return f}const v1=function(r,e,t,n,i){const s=e[t.offset++],o=n.constructor[Symbol.metadata],a=s>>6<<6,l=s%(a||255),c=o[l];if(c===void 0)return console.warn("@colyseus/schema: field not defined at",{index:l,ref:n.constructor.name,metadata:o}),ig;const f=c.deprecated===!0,h=f?void 0:n[Pt](l),u=Ch(r,a,n,l,h,c.type,e,t,i);f||(u!=null&&(n[c.name]=u),h!==u&&(i==null||i.push({ref:n,refId:r.currentRefId,op:a,field:c.name,value:u,previousValue:h})))},Al=function(r,e,t,n,i){var d,g;const s=(d=n[Ft])!=null?d:n,o=e[t.offset++];if(o===me.CLEAR){r.removeChildRefs(s,i),s.clear();return}const a=ut.number(e,t),l=s[tt],c=s.constructor.COLLECTION_KIND;let f;(o&me.ADD)===me.ADD?c===Qn.Map?(f=ut.string(e,t),s.setIndex(a,f)):f=a:f=s.getIndex(a);const h=s[Pt](a),u=Ch(r,o,n,a,h,l,e,t,i);if(r.resyncVisited!==null&&ng(r,n,o,f,h,u,i),u!=null)switch(c){case Qn.Map:s.$items.set(f,u);break;case Qn.Array:s.$setAt(a,u,r.resyncVisited!==null&&o===me.ADD?me.REPLACE:o);break;case Qn.Set:case Qn.Collection:case Qn.Stream:s.$items.has(a)||(s.$items.set(a,u),typeof s.$refId=="number"&&a>=s.$refId&&(s.$refId=a+1));break;default:console.warn(`@colyseus/schema: missing COLLECTION_KIND on ${(g=s.constructor)==null?void 0:g.name} — item at index ${a} was not stored.`);break}h!==u&&(i==null||i.push({ref:n,refId:r.currentRefId,op:o,dynamicIndex:f,value:u,previousValue:h}))},x1=function(r,e,t,n,i){var u;const s=(u=n[Ft])!=null?u:n;let o=e[t.offset++],a;if(o===me.CLEAR){r.removeChildRefs(s,i),s.clear();return}else if(o===me.REVERSE){s.items.reverse();return}else if(o===me.DELETE_BY_REFID){const d=ut.number(e,t),g=r.root.refs.get(d);if(g===void 0||(r.root.removeRef(d),a=s.findIndex(_=>_===g),a===-1))return;s[ai](a),i==null||i.push({ref:n,refId:r.currentRefId,op:me.DELETE,dynamicIndex:a,value:void 0,previousValue:g});return}else if(o===me.ADD_BY_REFID){const d=ut.number(e,t),g=r.root.refs.get(d);g&&(a=s.findIndex(_=>_===g)),(a===-1||a===void 0)&&(a=s.length)}else a=ut.number(e,t);const l=s[tt];let c=a;const f=s.items[a],h=Ch(r,o,n,a,f,l,e,t,i);r.resyncVisited!==null&&ng(r,n,o,a,f,h,i),h!=null&&h!==f&&s.$setAt(a,h,r.resyncVisited!==null&&o===me.ADD?me.REPLACE:o),f!==h&&(i==null||i.push({ref:n,refId:r.currentRefId,op:o,dynamicIndex:c,value:h,previousValue:f}))};class Dh extends Error{}function Rl(r,e,t,n){if(!(r instanceof e))throw new Dh(`a '${e.name}' was expected, but '${r&&r.constructor.name}' was provided in ${t.constructor.name}#${n}`)}const y1=(r,e)=>{const t=r.toString(),n=e.toString();return t<n?-1:t>n?1:0},ud={get:(r,e)=>typeof e!="symbol"&&!isNaN(e)?r.items[e]:Reflect.get(r,e),set:(r,e,t)=>{var n;if(typeof e!="symbol"&&!isNaN(e)){if(t==null)r.$deleteAt(e);else{let i;if(t[ee]){Rl(t,r[tt],r,e);const s=r.items[e];r.isMovingItems?(i=r.$wireIndex(Number(e)),s!==void 0?t[ee].isNew?r[ee].indexedOperation(i,me.MOVE_AND_ADD):(r[ee].getChange(i)&me.DELETE)===me.DELETE?r[ee].indexedOperation(i,me.DELETE_AND_MOVE):r[ee].indexedOperation(i,me.MOVE):t[ee].isNew&&r[ee].indexedOperation(i,me.ADD),t[ee].setParent(r,r[ee].root,i)):i=r.$changeAt(Number(e),t),s!==void 0&&((n=s[ee].root)==null||n.remove(s[ee]))}else i=r.$changeAt(Number(e),t);r.items[e]=t,i!==void 0&&(r.tmpItems[i]=t)}return!0}return Reflect.set(r,e,t)},deleteProperty:(r,e)=>(typeof e=="number"?r.$deleteAt(e):delete r[e],!0),has:(r,e)=>typeof e!="symbol"&&!isNaN(Number(e))?Reflect.has(r.items,e):Reflect.has(r,e)};var sp,op,ap,lp,cp,fp,hp;const Dn=class Dn{constructor(...e){L(this,hp);L(this,fp);L(this,cp);L(this,lp);L(this,"items",[]);L(this,"tmpItems",[]);L(this,"deletedIndexes",[]);L(this,"isMovingItems",!1);L(this,"_needsCompaction",!1);L(this,sp);this[tt]=void 0,this[Ft]=this;const t=new Proxy(this,ud);return Object.defineProperty(this,ee,{value:new Ys(t,this),enumerable:!1,writable:!0}),e.length>0&&this.push(...e),t}static[(hp=ee,fp=Ke,cp=Ft,lp=tt,ap=Ei,op=ri,Yr)](e,t,n){var s,o;if(!n)return!0;const i=(s=e[Ft])!=null?s:e;return typeof i[tt]=="string"||n.isChangeTreeVisible((o=i.tmpItems[t])==null?void 0:o[ee])}static is(e){return Array.isArray(e)||e.array!==void 0}static from(e){return new Dn(...Array.from(e))}static initializeForDecoder(){const e=Object.create(Dn.prototype);e.items=[],e.isMovingItems=!1,e._needsCompaction=!1,e[tt]=void 0,e[Ft]=e;const t=new Proxy(e,ud);return Ks(e,t),t}set length(e){e===0?this.clear():e<this.items.length?this.splice(e,this.length-e):console.warn("ArraySchema: can't set .length to a higher value than its length.")}get length(){return this.items.length}pauseTracking(){this[ee].pause()}resumeTracking(){this[ee].resume()}untracked(e){return this[ee].untracked(e)}get isTrackingPaused(){return this[ee].paused}push(...e){var l;const t=this[Ft],n=t.items,i=t.tmpItems,s=t[ee],o=t[tt];let a=i.length;for(let c=0,f=e.length;c<f;c++,a++){const h=e[c];if(h==null)return;typeof h=="object"&&o&&Rl(h,o,t,c),s.indexedOperation(a,me.ADD),n.push(h),i.push(h),(l=h[ee])==null||l.setParent(this,s.root,a)}return a}pop(){const e=this[Ft],t=e.tmpItems,n=e.deletedIndexes;let i=-1;for(let s=t.length-1;s>=0;s--)if(n[s]!==!0){i=s;break}if(!(i<0))return e[ee].delete(i),n[i]=!0,e.items.pop()}at(e){return e<0&&(e+=this.length),this.items[e]}$wireIndex(e){const t=this.deletedIndexes;if(t.length===0)return e;const n=this.tmpItems;let i=0;for(let s=0;s<n.length;s++)if(t[s]!==!0){if(i===e)return s;i++}return n.length+(e-i)}$reindexChildren(e,t){var s,o;if(!this[ee].hasFilteredFields||typeof this[tt]=="string")return;const n=this.tmpItems,i=n.length;if(t!==void 0)for(;e<i&&n[e]===t[e];)e++;for(let a=e;a<i;a++)(o=(s=n[a])==null?void 0:s[ee])==null||o.setParentIndex(this,a)}$changeAt(e,t){var o;if(t==null){console.error("ArraySchema items cannot be null nor undefined; Use `splice(index, 1)` instead.");return}if(this.items[e]===t)return;const n=this.items[e]!==void 0?typeof t=="object"?me.DELETE_AND_ADD:me.REPLACE:me.ADD,i=this.$wireIndex(e),s=this[ee];return s.change(i,n),(o=t[ee])==null||o.setParent(this,s.root,i),i}$deleteAt(e,t){this[ee].delete(this.$wireIndex(e),t)}$setAt(e,t,n){n===me.ADD&&this.items[e]!==void 0?this.items.splice(e,0,t):n===me.DELETE_AND_MOVE?(this.items.splice(e,1),this.items[e]=t):(e>this.items.length&&(this._needsCompaction=!0),this.items[e]=t)}clear(){const e=this[Ft];if(e.items.length===0)return;const t=e[ee];t.forEachChild((n,i)=>{var s;(s=t.root)==null||s.remove(n)}),t.discard(),t.operation(me.CLEAR),e.items.length=0,e.tmpItems.length=0}[si](){var i,s,o;const e=(i=this[Ft])!=null?i:this,t=e[ee];if(t.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed ArraySchema (pooling not supported).");const n=e.items;for(let a=0;a<n.length;a++)(o=(s=n[a])==null?void 0:s[si])==null||o.call(s);e.items.length=0,e.tmpItems.length=0,e.deletedIndexes.length=0,t.recycle(),e[Ke]=void 0}concat(...e){return new Dn(...this.items.concat(...e))}join(e){return this.items.join(e)}reverse(){const e=this[Ft],t=e[ee];if(t.has()||e.deletedIndexes.length>0){const n=e.items.slice().reverse();return this.clear(),this.push(...n),this}return t.operation(me.REVERSE),e.items.reverse(),e.tmpItems.reverse(),e.$reindexChildren(0),this}shift(){const e=this[Ft],t=e.items;if(t.length===0)return;const n=e[ee],i=e.deletedIndexes;let s=0;for(;i[s]===!0;)s++;return n.delete(s,me.DELETE),i[s]=!0,t.shift()}slice(e,t){const n=new Dn;return n.push(...this.items.slice(e,t)),n}sort(e=y1){const t=this[Ft];t.isMovingItems=!0;const n=t[ee];return t.items.sort(e).forEach((s,o)=>n.change(o,me.REPLACE)),t.tmpItems.sort(e),t.$reindexChildren(0),t.isMovingItems=!1,this}splice(e,t,...n){var d,g,_,m;const i=this[Ft],s=i[ee],o=i.items,a=i.tmpItems,l=i.deletedIndexes,c=o.length,f=a.length,h=n.length,u=[];for(let p=0;p<f;p++)l[p]!==!0&&u.push(p);if(c>e){t===void 0&&(t=c-e);for(let p=e;p<e+t;p++){const y=u[p];s.delete(y,me.DELETE),l[y]=!0}}else t=0;if(h>0){const p=(d=u[e])!=null?d:c,y=Math.min(h,t);for(let v=0;v<y;v++){const C=p+v;s.indexedOperation(C,l[C]?me.DELETE_AND_ADD:me.ADD),a[C]=n[v],l[C]=!1,(g=n[v][ee])==null||g.setParent(this,s.root,C)}const E=h-y;if(E>0){const v=p+y;s.insertAt(v,E);for(let C=0;C<E;C++)(_=n[y+C][ee])==null||_.setParent(this,s.root,v+C);l.length>0&&l.splice(v,0,...new Array(E).fill(!1)),a.splice(v,0,...n.slice(y)),i.$reindexChildren(v+E)}}return(m=s.root)==null||m.enqueueChangeTree(s),o.splice(e,t,...n)}unshift(...e){var s,o;const t=this[Ft],n=t[ee];n.unshift(e.length);for(let a=0;a<e.length;a++)(o=(s=e[a])==null?void 0:s[ee])==null||o.setParent(this,n.root,a);const i=t.deletedIndexes;return i.length>0&&i.unshift(...new Array(e.length).fill(!1)),t.tmpItems.unshift(...e),t.$reindexChildren(e.length),t.items.unshift(...e)}indexOf(e,t){return this.items.indexOf(e,t)}lastIndexOf(e,t=this.length-1){return this.items.lastIndexOf(e,t)}every(e,t){return this.items.every(e,t)}some(e,t){return this.items.some(e,t)}forEach(e,t){return this.items.forEach(e,t)}map(e,t){return this.items.map(e,t)}filter(e,t){return this.items.filter(e,t)}reduce(e,t){return this.items.reduce(e,t)}reduceRight(e,t){return this.items.reduceRight(e,t)}find(e,t){return this.items.find(e,t)}findIndex(e,t){return this.items.findIndex(e,t)}fill(e,t,n){throw new Error("ArraySchema#fill() not implemented")}copyWithin(e,t,n){throw new Error("ArraySchema#copyWithin() not implemented")}toString(){return this.items.toString()}toLocaleString(){return this.items.toLocaleString()}[Symbol.iterator](){return this.items[Symbol.iterator]()}static get[Symbol.species](){return Dn}entries(){return this.items.entries()}keys(){return this.items.keys()}values(){return this.items.values()}includes(e,t){return this.items.includes(e,t)}flatMap(e,t){throw new Error("ArraySchema#flatMap() is not supported.")}flat(e){throw new Error("ArraySchema#flat() is not supported.")}findLast(){return this.items.findLast.apply(this.items,arguments)}findLastIndex(...e){return this.items.findLastIndex.apply(this.items,arguments)}with(e,t){const n=this.items.slice();return e<0&&(e+=this.length),n[e]=t,new Dn(...n)}toReversed(){return this.items.slice().reverse()}toSorted(e){return this.items.slice().sort(e)}toSpliced(e,t,...n){return this.items.toSpliced.apply(copy,arguments)}shuffle(){return this.move(e=>{let t=this.items.length;for(;t!=0;){let n=Math.floor(Math.random()*t);t--,[this[t],this[n]]=[this[n],this[t]]}})}move(e){return this.isMovingItems=!0,e(this),this.isMovingItems=!1,this}[(sp=Symbol.unscopables,Pt)](e,t=!1){var i;const n=(i=this[Ft])!=null?i:this;return t||n.deletedIndexes[e]?n.items[e]:n.tmpItems[e]||n.items[e]}[ai](e){var n;const t=(n=this[Ft])!=null?n:this;t.items[e]=void 0,t._needsCompaction=!0}[or](){const e=this.tmpItems;this.tmpItems=this.items.slice(),this.deletedIndexes.length>0&&(this.$reindexChildren(0,e),this.deletedIndexes.length=0)}[sl](){var t;const e=(t=this[Ft])!=null?t:this;e._needsCompaction&&(e._needsCompaction=!1,e.items=e.items.filter(n=>n!==void 0))}[qs](e,t,n){var a;const i=(a=this[Ft])!=null?a:this,s=i.items;let o=!1;for(let l=0;l<s.length;l++){const c=s[l];if(e.has(l)){n(c);continue}o=!0,t(c,l),i[ai](l)}o&&i[sl]()}toArray(){return this.items.slice(0)}toJSON(){return this.toArray().map(e=>typeof e.toJSON=="function"?e.toJSON():e)}clone(e){let t;return e?(t=new Dn,t.push(...this.items)):t=new Dn(...this.map(n=>n[ee]?n.clone():n)),t}};L(Dn,ap,p1),L(Dn,op,x1),L(Dn,"COLLECTION_KIND",Qn.Array);let lr=Dn;Wi("array",{constructor:lr});class dd{constructor(){L(this,"keyByIndex",new Map);L(this,"indexByKey",{});L(this,"nextIndex",0);L(this,"snapshots")}indexOf(e){const t=this.indexByKey[e];return t===void 0?void 0:t}assign(e){const t=this.nextIndex++;return this.indexByKey[e]=t,this.keyByIndex.set(t,e),t}snapshot(e,t){var n;((n=this.snapshots)!=null?n:this.snapshots=new Map).set(e,t)}forgetSnapshot(e){var t;(t=this.snapshots)==null||t.delete(e)}snapshotAt(e){var t;return(t=this.snapshots)==null?void 0:t.get(e)}setIndex(e,t){this.keyByIndex.set(e,t),this.indexByKey[t]=e}keyOf(e){return this.keyByIndex.get(e)}cleanupAfterEncode(){if(this.snapshots!==void 0){for(const[e]of this.snapshots){const t=this.keyByIndex.get(e);t!==void 0&&(delete this.indexByKey[t],this.keyByIndex.delete(e))}this.snapshots.clear()}}reset(){var e;this.indexByKey={},this.keyByIndex.clear(),(e=this.snapshots)==null||e.clear(),this.nextIndex=0}}var up,dp,pp,mp,gp;const di=class di{constructor(e){L(this,gp);L(this,mp);L(this,"childType");L(this,pp);L(this,"$items",new Map);L(this,"journal",new dd);L(this,"_stream");if(Object.defineProperty(this,ee,{value:new Ys(this),enumerable:!1,writable:!0}),this[tt]=void 0,e)if(e instanceof Map||e instanceof di)e.forEach((t,n)=>this.set(n,t));else for(const t in e)this.set(t,e[t])}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).priority=e}get $indexes(){return this.journal.keyByIndex}get _collectionIndexes(){return this.journal.indexByKey}static[(gp=ee,mp=Ke,pp=tt,dp=Ei,up=ri,Yr)](e,t,n){var s;if(!n||typeof e[tt]=="string")return!0;const i=(s=e[Pt](t))!=null?s:e.journal.snapshotAt(t);return n.isChangeTreeVisible(i[ee])}static is(e){return e.map!==void 0}static initializeForDecoder(){const e=Object.create(di.prototype);return e.$items=new Map,e.journal=new dd,e[tt]=void 0,Ks(e),e}[Symbol.iterator](){return this.$items[Symbol.iterator]()}get[Symbol.toStringTag](){return this.$items[Symbol.toStringTag]}static get[Symbol.species](){return di}set(e,t){var l;if(t==null)throw new Error(`MapSchema#set('${e}', ${t}): trying to set ${t} value on '${e}'.`);typeof t=="object"&&this[tt]&&Rl(t,this[tt],this,e),e=e.toString();const n=this[ee],i=t[ee]!==void 0,s=this.journal;let o=s.indexOf(e),a;if(o!==void 0){a=me.REPLACE;const c=this.$items.get(e);if(c===t)return;i&&(a=me.DELETE_AND_ADD,c!==void 0&&((l=c[ee].root)==null||l.remove(c[ee]))),s.snapshotAt(o)!==void 0&&s.forgetSnapshot(o)}else o=s.assign(e),a=me.ADD;return this.$items.set(e,t),a===me.ADD&&n.isStreamCollection?n.root!==void 0&&Ml(this,n.root,o):n.change(o,a),i&&t[ee].setParent(this,n.root,o),this}get(e){return this.$items.get(e)}getOrInsert(e,t){return this.$items.has(e)?this.$items.get(e):(this.set(e,t),t)}getOrInsertComputed(e,t){if(this.$items.has(e))return this.$items.get(e);const n=t(e);return this.set(e,n),n}delete(e){if(!this.$items.has(e))return!1;const t=this.journal.indexOf(e),n=this.$items.get(e),i=this[ee];if(i.isStreamCollection){const s=i.root;let o=!1;return s!==void 0&&(o=bl(this,s,this[Ke],t)),(n==null?void 0:n[ee])!==void 0&&(s==null||s.remove(n[ee])),this.$items.delete(e),o||this.journal.snapshot(t,n),!0}return this.journal.snapshot(t,n),i.delete(t),this.$items.delete(e)}clear(){const e=this[ee];e.discard(),e.forEachChild((t,n)=>{var i;(i=e.root)==null||i.remove(t)}),this.journal.reset(),this.$items.clear(),e.operation(me.CLEAR)}[si](){const e=this[ee];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed MapSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[si])==null?void 0:n.call(t)}),this.$items.clear(),this.journal.reset(),e.recycle(),this[Ke]=void 0}has(e){return this.$items.has(e)}forEach(e){this.$items.forEach(e)}entries(){return this.$items.entries()}keys(){return this.$items.keys()}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[ee].pause()}resumeTracking(){this[ee].resume()}untracked(e){return this[ee].untracked(e)}get isTrackingPaused(){return this[ee].paused}setIndex(e,t){this.journal.setIndex(e,t)}getIndex(e){return this.journal.keyOf(e)}[Pt](e){const t=this.journal.keyOf(e);return t!==void 0?this.$items.get(t):void 0}[ai](e){const t=this.journal.keyOf(e);t!==void 0&&(this.$items.delete(t),this.journal.keyByIndex.delete(e))}[qs](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=new Set).add(o),t(s,o)}),i!==null){i.forEach(o=>{this.$items.delete(o),delete this.journal.indexByKey[o]});const s=[];this.journal.keyByIndex.forEach((o,a)=>{i.has(o)&&s.push(a)});for(let o=0;o<s.length;o++)this.journal.keyByIndex.delete(s[o])}}[or](){this.journal.cleanupAfterEncode()}_dropView(e){wl(this,e)}_unregister(){}toJSON(){const e={};return this.forEach((t,n)=>{e[n]=typeof t.toJSON=="function"?t.toJSON():t}),e}clone(e){let t;return e?t=Object.assign(new di,this):(t=new di,this.forEach((n,i)=>{n[ee]?t.set(i,n.clone()):t.set(i,n)})),t}};L(di,dp,d1),L(di,up,Al),L(di,"COLLECTION_KIND",Qn.Map);let cr=di;Wi("map",{constructor:cr});var _p,vp,xp,yp,Sp;const Qi=class Qi{constructor(e){L(this,Sp);L(this,yp);L(this,xp);L(this,"$items",new Map);L(this,"deletedItems",{});L(this,"$refId",0);L(this,"_stream");Object.defineProperty(this,ee,{value:new Ys(this),enumerable:!1,writable:!0}),this[tt]=void 0,e&&e.forEach(t=>this.add(t))}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).priority=e}static[(Sp=ee,yp=Ke,xp=tt,vp=Ei,_p=ri,Yr)](e,t,n){var i;return!n||typeof e[tt]=="string"||n.isChangeTreeVisible(((i=e[Pt](t))!=null?i:e.deletedItems[t])[ee])}static is(e){return e.collection!==void 0}static initializeForDecoder(){const e=Object.create(Qi.prototype);return e.$items=new Map,e.deletedItems={},e.$refId=0,e[tt]=void 0,Ks(e),e}add(e){const t=this.$refId++,n=this[ee];return e[ee]!==void 0&&e[ee].setParent(this,n.root,t),this.$items.set(t,e),n.isStreamCollection?n.root!==void 0&&Ml(this,n.root,t):n.change(t),t}at(e){const t=Array.from(this.$items.keys())[e];return this.$items.get(t)}entries(){return this.$items.entries()}delete(e){const t=this.$items.entries();let n,i;for(;(i=t.next())&&!i.done;)if(e===i.value[1]){n=i.value[0];break}if(n===void 0)return!1;const s=this[ee];if(s.isStreamCollection){const o=s.root,a=this.$items.get(n);return o!==void 0&&bl(this,o,this[Ke],n),(a==null?void 0:a[ee])!==void 0&&(o==null||o.remove(a[ee])),this.deletedItems[n]=a,this.$items.delete(n)}return this.deletedItems[n]=s.delete(n),this.$items.delete(n)}clear(){const e=this[ee];e.discard(),e.forEachChild((t,n)=>{var i;(i=e.root)==null||i.remove(t)}),this.$items.clear(),e.operation(me.CLEAR)}[si](){const e=this[ee];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed CollectionSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[si])==null?void 0:n.call(t)}),this.$items.clear(),this.deletedItems={},this.$refId=0,e.recycle(),this[Ke]=void 0}has(e){return Array.from(this.$items.values()).some(t=>t===e)}forEach(e){this.$items.forEach((t,n,i)=>e(t,n,this))}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[ee].pause()}resumeTracking(){this[ee].resume()}untracked(e){return this[ee].untracked(e)}get isTrackingPaused(){return this[ee].paused}[Symbol.iterator](){return this.$items.values()}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[ai](e){this.$items.delete(e)}[qs](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=[]).push(o),t(s,o)}),i!==null)for(let s=0;s<i.length;s++)this[ai](i[s])}[or](){for(const e in this.deletedItems)delete this.deletedItems[e]}_dropView(e){wl(this,e)}_unregister(){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach((t,n)=>{e.push(typeof t.toJSON=="function"?t.toJSON():t)}),e}clone(e){let t;return e?t=Object.assign(new Qi,this):(t=new Qi,this.forEach(n=>{n[ee]?t.add(n.clone()):t.add(n)})),t}};L(Qi,vp,Ah),L(Qi,_p,Al),L(Qi,"COLLECTION_KIND",Qn.Collection);let Fo=Qi;Wi("collection",{constructor:Fo});var Ep,Mp,bp,wp,Tp;const er=class er{constructor(e){L(this,Tp);L(this,wp);L(this,bp);L(this,"$items",new Map);L(this,"deletedItems",{});L(this,"$refId",0);L(this,"_stream");Object.defineProperty(this,ee,{value:new Ys(this),enumerable:!1,writable:!0}),this[tt]=void 0,e&&e.forEach(t=>this.add(t))}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).priority=e}static[(Tp=ee,wp=Ke,bp=tt,Mp=Ei,Ep=ri,Yr)](e,t,n){var i;return!n||typeof e[tt]=="string"||n.isVisible(((i=e[Pt](t))!=null?i:e.deletedItems[t])[ee])}static is(e){return e.set!==void 0}static initializeForDecoder(){const e=Object.create(er.prototype);return e.$items=new Map,e.deletedItems={},e.$refId=0,e[tt]=void 0,Ks(e),e}add(e){if(this.has(e))return!1;const t=this.$refId++,n=this[ee];return e[ee]!==void 0&&e[ee].setParent(this,n.root,t),this.$items.set(t,e),n.isStreamCollection?n.root!==void 0&&Ml(this,n.root,t):n.change(t,me.ADD),t}entries(){return this.$items.entries()}delete(e){const t=this.$items.entries();let n,i;for(;(i=t.next())&&!i.done;)if(e===i.value[1]){n=i.value[0];break}if(n===void 0)return!1;const s=this[ee];if(s.isStreamCollection){const o=s.root,a=this.$items.get(n);return o!==void 0&&bl(this,o,this[Ke],n),(a==null?void 0:a[ee])!==void 0&&(o==null||o.remove(a[ee])),this.deletedItems[n]=a,this.$items.delete(n)}return this.deletedItems[n]=s.delete(n),this.$items.delete(n)}clear(){const e=this[ee];e.discard(),this.$items.clear(),e.operation(me.CLEAR)}[si](){const e=this[ee];if(e.isStreamCollection)throw new Error("@colyseus/schema: cannot reset a streamed SetSchema (pooling not supported).");this.$items.forEach(t=>{var n;return(n=t==null?void 0:t[si])==null?void 0:n.call(t)}),this.$items.clear(),this.deletedItems={},this.$refId=0,e.recycle(),this[Ke]=void 0}has(e){const t=this.$items.values();let n=!1,i;for(;(i=t.next())&&!i.done;)if(e===i.value){n=!0;break}return n}forEach(e){this.$items.forEach((t,n,i)=>e(t,n,this))}values(){return this.$items.values()}get size(){return this.$items.size}pauseTracking(){this[ee].pause()}resumeTracking(){this[ee].resume()}untracked(e){return this[ee].untracked(e)}get isTrackingPaused(){return this[ee].paused}[Symbol.iterator](){return this.$items.values()}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[ai](e){this.$items.delete(e)}[qs](e,t,n){let i=null;if(this.$items.forEach((s,o)=>{if(e.has(o)){n(s);return}(i!=null?i:i=[]).push(o),t(s,o)}),i!==null)for(let s=0;s<i.length;s++)this[ai](i[s])}[or](){for(const e in this.deletedItems)delete this.deletedItems[e]}_dropView(e){wl(this,e)}_unregister(){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach((t,n)=>{e.push(typeof t.toJSON=="function"?t.toJSON():t)}),e}clone(e){let t;return e?t=Object.assign(new er,this):(t=new er,this.forEach(n=>{n[ee]?t.add(n.clone()):t.add(n)})),t}};L(er,Mp,Ah),L(er,Ep,Al),L(er,"COLLECTION_KIND",Qn.Set);let No=er;Wi("set",{constructor:No});var Ap,Rp,Cp,Dp,Pp;const Li=class Li{constructor(){L(this,Pp);L(this,Dp);L(this,Cp);L(this,"$items",new Map);L(this,"$nextPosition",0);L(this,"_itemIndex",new Map);L(this,"_stream");Object.defineProperty(this,ee,{value:new Ys(this),enumerable:!1,writable:!0}),this[tt]=void 0}get maxPerTick(){var e,t;return(t=(e=this._stream)==null?void 0:e.maxPerTick)!=null?t:32}set maxPerTick(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).maxPerTick=e}get priority(){var e;return(e=this._stream)==null?void 0:e.priority}set priority(e){var t;((t=this._stream)!=null?t:this._stream=Vi()).priority=e}static[(Pp=ee,Dp=Ke,Cp=tt,Rp=Ei,Ap=ri,Yr)](e,t,n){if(!n)return!0;const i=e[Pt](t);return i===void 0?!1:n.isVisible(i[ee])}static is(e){return e&&e.stream!==void 0}static initializeForDecoder(){const e=Object.create(Li.prototype);return e.$items=new Map,e.$nextPosition=0,e._itemIndex=new Map,e[tt]=void 0,Ks(e),e}add(e){if(this._itemIndex.has(e))return-1;const t=this.$nextPosition++;this.$items.set(t,e),this._itemIndex.set(e,t);const i=this[ee].root;return e[ee]!==void 0&&e[ee].setParent(this,i,t),i!==void 0&&Ml(this,i,t),t}remove(e){const t=this._itemIndex.get(e);if(t===void 0)return!1;this._itemIndex.delete(e),this.$items.delete(t);const n=this[ee].root;return n!==void 0&&(bl(this,n,this[Ke],t),e[ee]!==void 0&&n.remove(e[ee])),!0}has(e){return this._itemIndex.has(e)}clear(){const e=this[ee].root;if(e!==void 0){PE(this,e,this[Ke]);for(const t of this.$items.values())t[ee]!==void 0&&e.remove(t[ee])}this.$items.clear(),this._itemIndex.clear()}forEach(e){for(const[t,n]of this.$items)e(n,t,this)}values(){return this.$items.values()}entries(){return this.$items.entries()}[Symbol.iterator](){return this.$items.values()}get size(){return this.$items.size}get length(){return this.$items.size}setIndex(e,t){}getIndex(e){return e}[Pt](e){return this.$items.get(e)}[ai](e){const t=this.$items.get(e);t!==void 0&&(this._itemIndex.delete(t),this.$items.delete(e))}[qs](){}[or](){}toArray(){return Array.from(this.$items.values())}toJSON(){const e=[];return this.forEach(t=>{e.push(typeof(t==null?void 0:t.toJSON)=="function"?t.toJSON():t)}),e}clone(e){if(e)return Object.assign(new Li,this);const t=new Li;return t.maxPerTick=this.maxPerTick,this.forEach(n=>{t.add(typeof(n==null?void 0:n.clone)=="function"?n.clone():n)}),t}_dropView(e){wl(this,e)}_unregister(){}};L(Li,"$isStream",!0),L(Li,Rp,Ah),L(Li,Ap,Al),L(Li,"COLLECTION_KIND",Qn.Stream);let fl=Li;Wi("stream",{constructor:fl});var Ip;Ip=Rm;class dr{constructor(e){L(this,Ip,!0);L(this,"_type");L(this,"_default");L(this,"_hasDefault",!1);L(this,"_view");L(this,"_unreliable",!1);L(this,"_patchOnly",!1);L(this,"_deprecated",!1);L(this,"_deprecatedThrows",!0);L(this,"_fullStateOnly",!1);L(this,"_stream",!1);L(this,"_optional",!1);L(this,"_noSync",!1);L(this,"_streamPriority");this._type=e}default(e){return this._default=e,this._hasDefault=!0,this}view(e){return this._view=e!=null?e:-1,this}unreliable(){return this._unreliable=!0,this}patchOnly(){return this._patchOnly=!0,this}fullStateOnly(){return this._fullStateOnly=!0,this}noSync(){return this._noSync=!0,this}stream(){const e=this._type;if(e&&typeof e=="object"&&e.array!==void 0)throw new Error($m);return this._stream=!0,this}priority(e){return this._streamPriority=e,this}deprecated(e=!0){return this._deprecated=!0,this._deprecatedThrows=e,this}optional(){return this._optional=!0,this}toDefinition(){return{type:this._type,default:this._default,hasDefault:this._hasDefault,view:this._view,unreliable:this._unreliable,patchOnly:this._patchOnly,deprecated:this._deprecated,deprecatedThrows:this._deprecatedThrows,fullStateOnly:this._fullStateOnly,stream:this._stream,optional:this._optional,noSync:this._noSync,streamPriority:this._streamPriority}}}function rg(r){return r!=null&&r[Rm]===!0}function an(r){return()=>new dr(r)}function na(r){if(rg(r)){const e=r._type,t=typeof e=="string"?`use the type name instead: t.array("${e}")`:'collections accept a Schema class or a primitive type name ("string", "number", …)';throw new Error(`t.array/map/set/collection(): a t.* builder is not a valid element type — ${t}.`)}return r}const S1=r=>new dr({array:na(r)}),E1=r=>new dr({map:na(r)}),M1=r=>new dr({set:na(r)}),b1=r=>new dr({collection:na(r)}),w1=r=>{const e=new dr({stream:na(r)});return e._stream=!0,e},T1=r=>new dr(r);function pd(r){return new dr({quantized:bh(r)})}const xn=Object.freeze({string:an("string"),number:an("number"),boolean:an("boolean"),int8:an("int8"),uint8:an("uint8"),int16:an("int16"),uint16:an("uint16"),int32:an("int32"),uint32:an("uint32"),int64:an("int64"),uint64:an("uint64"),float32:an("float32"),float64:an("float64"),bigint64:an("bigint64"),biguint64:an("biguint64"),ref:T1,array:S1,map:E1,set:M1,collection:b1,stream:w1,quantized:pd,angle:r=>{var e;return pd({min:0,max:Math.PI*2,mode:"wrap",bits:(e=r==null?void 0:r.bits)!=null?e:16})}}),Cl=-1;function A1(r=Cl){return function(e,t){const n=mt.initialize(e.constructor);mt.setTag(n,t,r)}}function R1(r,e){const t=mt.initialize(r.constructor);mt.setUnreliable(t,e)}function C1(r,e){const t=mt.initialize(r.constructor);mt.setPatchOnly(t,e)}const D1={number:"number",int8:"number",uint8:"number",int16:"number",uint16:"number",int32:"number",uint32:"number",int64:"number",uint64:"number",float32:"number",float64:"number",bigint64:"bigint",biguint64:"bigint",string:"string",boolean:"boolean"};function P1(r,e,t){const n=D1[t],i=t==="string",s=t==="boolean";return function(o){const a=this[Nn],l=a[e];if(o!==l){if(o!=null){if(!s&&n!==void 0&&typeof o!==n&&!(i&&o===null)){const c=o&&o.constructor?` (${o.constructor.name})`:"";throw new Dh(`a '${n}' was expected, but '${JSON.stringify(o)}'${c} was provided in ${this.constructor.name}#${r}`)}this.constructor[Si](this[ee],e,me.ADD)}else l!=null&&this[ee].delete(e);a[e]=o}}}function I1(r,e,t){return function(n){var o,a;const i=this[Nn],s=i[e];if(n!==s){if(n!=null){Rl(n,t,this,r);const l=this[ee],c=this.constructor;s!=null&&s[ee]?((o=l.root)==null||o.remove(s[ee]),c[Si](l,e,me.DELETE_AND_ADD)):c[Si](l,e,me.ADD),(a=n[ee])==null||a.setParent(this,l.root,e)}else s!=null&&this[ee].delete(e);i[e]=n}}}function U1(r,e,t,n){const i=n.constructor===lr,s=n.constructor===cr;return function(o){var c,f;const a=this[Nn],l=a[e];if(o!==l){if(o!=null){if(i&&!(o instanceof lr)){const d=new lr;d[tt]=t,d.push(...o),o=d}else if(s&&!(o instanceof cr)){const d=new cr;if(d[tt]=t,o instanceof Map)o.forEach((g,_)=>d.set(_,g));else for(const g in o)d.set(g,o[g]);o=d}else o[tt]=t;const h=this[ee],u=this.constructor;l!=null&&l[ee]?((c=h.root)==null||c.remove(l[ee]),u[Si](h,e,me.DELETE_AND_ADD)):u[Si](h,e,me.ADD),(f=o[ee])==null||f.setParent(this,h.root,e)}else l!=null&&this[ee].delete(e);a[e]=o}}}function L1(r,e,t){return function(n){const i=this[Nn],s=i[e];if(n!=null){if(typeof n!="number")throw new Dh(`a 'number' was expected, but '${JSON.stringify(n)}' was provided in ${this.constructor.name}#${r}`);if(n=qm(t,jm(t,n)),n===s)return;this.constructor[Si](this[ee],e,me.ADD)}else{if(n===s)return;s!=null&&this[ee].delete(e)}i[e]=n}}function F1(r,e,t,n){let i;return n?i=U1(r,e,t,n):typeof t=="string"?i=P1(r,e,t):Wr(t)?i=L1(r,e,t.quantized):i=I1(r,e,t),{get:function(){return this[Nn][e]},set:i,enumerable:!0,configurable:!0}}function N1(r=!0){return function(e,t){var i;const n=mt.initialize(e.constructor);mt.setDeprecated(n,t),r&&((i=n[Pn])!=null||(n[Pn]={}),n[Pn][t]={get:function(){throw new Error(`${t} is deprecated.`)},set:function(s){},enumerable:!1,configurable:!0},Object.defineProperty(e,t,n[Pn][t]))}}function O1(r){if(r&&typeof r=="object"){if(r.array!==void 0)return()=>new lr;if(r.map!==void 0)return()=>new cr;if(r.set!==void 0)return()=>new No;if(r.collection!==void 0)return()=>new Fo;if(r.stream!==void 0)return()=>new fl}else if(typeof r=="function"&&Ot.is(r)&&(!r.prototype.initialize||r.prototype.initialize.length===0))return()=>new r}function ia(r,e,t=Ot){var T;if(r==null||typeof r!="object")throw new Error(`schema(): first argument must be a fields object (got ${typeof r}).`);const n={},i={},s={},o={},a=(w,S)=>{typeof S=="function"?o[w]=S:S&&typeof S.clone=="function"?o[w]=()=>S.clone():s[w]=S},l=(w,S)=>{if(S.hasDefault)a(w,S.default);else if(!S.optional){const x=O1(S.type);x&&(o[w]=x)}},c={},f=[],h=[],u={},d=[],g=[],_={},m=[];for(const w in r){const S=r[w];if(rg(S)){const x=S.toDefinition();if(x.noSync){if(x.view!==void 0||x.unreliable||x.patchOnly||x.fullStateOnly||x.stream)throw new Error(`schema(${e?`'${e}'`:""}): field '${w}' uses .noSync() together with a sync-only modifier (.view/.unreliable/.patchOnly/.fullStateOnly/.stream). A local-only field cannot be synchronized.`);l(w,x);continue}if(x.patchOnly&&x.fullStateOnly)throw new Error(`schema(${e?`'${e}'`:""}): field '${w}' uses .patchOnly() together with .fullStateOnly(). Those are the only two delivery channels, so the field would never reach a client — use .noSync() if that is intended.`);const F=ks(x.type);if(typeof F=="function"&&!Ot.is(F))throw new Error(`schema(${e?`'${e}'`:""}): field '${w}' is a synced ref to non-Schema class '${F.name||"(anonymous)"}' — use .noSync(), or Metadata.setFields().`);n[w]=F,x.view!==void 0&&(c[w]=x.view),x.unreliable&&f.push(w),x.patchOnly&&h.push(w),x.deprecated&&(u[w]=x.deprecatedThrows),x.fullStateOnly&&d.push(w),x.stream&&g.push(w),x.streamPriority!==void 0&&(_[w]=x.streamPriority),x.optional&&m.push(w),l(w,x)}else if(typeof S=="function")Ot.is(S)?(n[w]=ks(S),(!S.prototype.initialize||S.prototype.initialize.length===0)&&(o[w]=()=>new S)):i[w]=S;else throw new Error(`schema(${e?`'${e}'`:""}): field '${w}' must be a t.* builder, Schema subclass, or method (got ${typeof S}).`)}const p=w=>{for(const S in s)w[S]=s[S];for(const S in o)w[S]=o[S]()},y=()=>{const w={};return p(w),w},E=w=>{const S=Object.keys(n),x={};for(const F in w)S.includes(F)||(x[F]=w[F]);return x},v=typeof i.initialize=="function",C=(T=i.initialize)!=null?T:t._initialize,R=class extends t{constructor(...w){const S=w[0];S===void 0?(super(),p(this)):super(Object.assign(y(),v?E(S):S)),C&&new.target===R&&C.apply(this,w)}};e&&Object.defineProperty(R,"name",{value:e}),mt.setFields(R,n),R._getDefaultValues=y,R._initialize=C,Object.assign(R.prototype,i);for(const w in c)A1(c[w])(R.prototype,w);for(const w of f)R1(R.prototype,w);for(const w of h)C1(R.prototype,w);for(const w in u)N1(u[w])(R.prototype,w);if(d.length>0||g.length>0){const w=R[Symbol.metadata];for(const S of d)mt.setFullStateOnly(w,S);for(const S of g)mt.setStream(w,S);for(const S in _)mt.setStreamPriority(w,S,_[S])}if(m.length>0){const w=R[Symbol.metadata];for(const S of m)w[w[S]].optional=!0}return R.extend=(w,S)=>ia(w,S,R),R}function B1(r){return new Array(r).fill(0).map((e,t)=>t===r-1?"└─ ":"   ").join("")}var Up,Lp,Fp,Np;const Kn=class Kn{constructor(e){L(this,Lp);L(this,Up);Kn.initialize(this),e&&Kn.assignProps(this,e)}static initialize(e){Object.defineProperty(e,ee,{value:new Ys(e),enumerable:!1,writable:!0}),e[Nn]=[]}static initializeForDecoder(){const e=Object.create(this.prototype);return Ks(e),e[Nn]=[],e}static reset(e){const t=e==null?void 0:e[ee];if(t===void 0||typeof t.recycle!="function")throw new Error("@colyseus/schema: Schema.reset() requires a tracked (encoder-side) instance.");if(t.extraParents!==void 0)throw new Error(`@colyseus/schema: cannot reset a shared instance (${e.constructor.name}) with multiple parents.`);e[si]()}[(Np=Ei,Fp=ri,Lp=Ke,Up=Nn,si)](){var i,s;const e=this.constructor[Symbol.metadata],t=(i=e==null?void 0:e[ar])!=null?i:[],n=this[Nn];for(let o=0;o<t.length;o++){const a=n[t[o]];(s=a==null?void 0:a[si])==null||s.call(a)}this[ee].recycle(),this[Ke]=void 0}static is(e){const t=e[Symbol.metadata];return typeof t=="object"&&t!==null}static isSchema(e){return typeof(e==null?void 0:e.assign)=="function"}static[Si](e,t,n=me.ADD){e.change(t,n)}static[Yr](e,t,n){var o;const s=(o=e.constructor[Symbol.metadata][t])==null?void 0:o.tag;return n===void 0?s===void 0:s===void 0?!0:s===Cl?n.isChangeTreeVisible(e[ee]):n.hasTagOnTree(e[ee],s)}assign(e){return Kn.assignProps(this,e),this}static assignProps(e,t){const n=e.constructor[Symbol.metadata];if(n&&n[rn]!==void 0)for(let s=0;s<=n[rn];s++){const o=n[s];if(!o)continue;const a=t[o.name];a!==void 0&&(e[o.name]=a)}const i=Object.keys(t);for(let s=0;s<i.length;s++){const o=i[s];n&&n[o]!==void 0||(e[o]=t[o])}}restore(e){const t=this.constructor[Symbol.metadata];for(const n in t){const i=t[n],s=i.name,o=i.type,a=e[s];if(a!=null){if(typeof o=="string")this[s]=a;else if(Kn.is(o)){const l=new o;l.restore(a),this[s]=l}else if(typeof o=="object"){const l=Object.keys(o)[0],c=o[l];if(l==="map"){const f=this[s];for(const h in a)if(Kn.is(c)){const u=new c;u.restore(a[h]),f.set(h,u)}else f.set(h,a[h])}else if(l==="array"){const f=this[s];for(let h=0;h<a.length;h++)if(Kn.is(c)){const u=new c;u.restore(a[h]),f.push(u)}else f.push(a[h])}}}}return this}setDirty(e,t){const n=this.constructor[Symbol.metadata];this[ee].change(n[n[e]].index,t)}pauseTracking(){this[ee].pause()}resumeTracking(){this[ee].resume()}untracked(e){return this[ee].untracked(e)}get isTrackingPaused(){return this[ee].paused}clone(){var n;const e=Object.create(this.constructor.prototype);Kn.initialize(e);const t=this.constructor[Symbol.metadata];for(const i in t){const s=t[i].name;typeof this[s]=="object"&&typeof((n=this[s])==null?void 0:n.clone)=="function"?e[s]=this[s].clone():e[s]=this[s]}return e}toJSON(){const e={},t=this.constructor[Symbol.metadata];for(const n in t){const i=t[n],s=i.name;!i.deprecated&&this[s]!==null&&typeof this[s]!="undefined"&&(e[s]=typeof this[s].toJSON=="function"?this[s].toJSON():this[s])}return e}discardAllChanges(){this[ee].discardAll()}[Pt](e){const t=this.constructor[Symbol.metadata];return this[t[e].name]}[ai](e){const t=this.constructor[Symbol.metadata];this[t[e].name]=void 0}static debugRefIds(e,t=!1,n=0,i,s=""){var u;const o=t?` - ${JSON.stringify(e.toJSON())}`:"",a=e[ee],l=e[Ke],c=i?i.root:a.root,f=((u=c==null?void 0:c.refCount)==null?void 0:u[l])>1?` [×${c.refCount[l]}]`:"";let h=`${B1(n)}${s}${e.constructor.name} (refId: ${l})${f}${o}
`;return a.forEachChild((d,g)=>{var p;let _=g;typeof g=="number"&&e.$indexes&&(_=(p=e.$indexes.get(g))!=null?p:g);const m=e.forEach!==void 0&&_!==void 0?`["${_}"]: `:"";h+=this.debugRefIds(d.ref,t,n+1,i,m)}),h}static debugRefIdEncodingOrder(e,t="allChanges"){var l;const n=[],i=e[ee];if(t==="changes"){let c=(l=i.root.changes)==null?void 0:l.next;for(;c;)c.changeTree&&n.push(c.changeTree.ref[Ke]),c=c.next;return n}const s=t==="allFilteredChanges",o=new Set,a=c=>{o.has(c)||(o.add(c),c.isFiltered===s&&n.push(c.ref[Ke]),c.forEachChild((f,h)=>a(f)))};return a(i),n}static debugRefIdsFromDecoder(e){return this.debugRefIds(e.state,!1,0,e)}static debugChanges(e,t=!1){const n=e[ee],i=t?"allChanges":"changes";let s=`${e.constructor.name} (${e[Ke]}) -> .${i}:
`;return t?n.forEachLive(o=>{s+=`- [${o}]: ADD (${JSON.stringify(n.getValue(Number(o),!0))})
`}):n.forEach((o,a)=>{o<0||!a||(s+=`- [${o}]: ${me[a]} (${JSON.stringify(n.getValue(Number(o),!1))})
`)}),s}};L(Kn,Np,u1),L(Kn,Fp,v1);let Ot=Kn;Am(Ot);const md={value:0,enumerable:!1,writable:!0};class k1{constructor(e,t=0){L(this,"types");L(this,"nextUniqueId",0);L(this,"refCount",{});L(this,"changeTrees",{});L(this,"changes",hd());L(this,"unreliableChanges",hd());L(this,"pendingFilterRefresh",[]);L(this,"_nodePool",[]);L(this,"_nextViewId",0);L(this,"_freeViewIds",[]);L(this,"activeViews",new Map);L(this,"streamTrees",new Set);this.types=e,this.nextUniqueId=t}enqueueFilterRefresh(e){this.types.hasFilters&&(e.flags&Lo||(e.flags|=Lo,this.pendingFilterRefresh.push(e)))}acquireViewId(){return this._freeViewIds.length>0?this._freeViewIds.pop():this._nextViewId++}releaseViewId(e){this._freeViewIds.push(e)}registerView(e){this.activeViews.set(e.id,new WeakRef(e))}unregisterView(e){this.activeViews.delete(e.id);const t=e.id;for(const n of this.streamTrees)n._dropView(t)}forEachActiveView(e){for(const[t,n]of this.activeViews){const i=n.deref();if(i===void 0){this.activeViews.delete(t);for(const s of this.streamTrees)s._dropView(t);continue}e(i)}}registerStream(e){this.streamTrees.add(e)}unregisterStream(e){this.streamTrees.delete(e)}add(e){const t=e.ref;t[Ke]===void 0&&(md.value=this.nextUniqueId++,Object.defineProperty(t,Ke,md));const n=t[Ke],i=this.changeTrees[n]===void 0;i&&(this.changeTrees[n]=e);const s=this.refCount[n];return(s===0||e.needsRestage)&&(e.needsRestage=!1,e.forEachLiveWithCtx(e,Zm)),this.refCount[n]=(s||0)+1,s>0&&this.enqueueFilterRefresh(e),i}remove(e){var i;const t=e.ref[Ke],n=this.refCount[t]-1;if(n<=0){if(e.root=void 0,delete this.changeTrees[t],e.isStreamCollection){const s=e.ref;(i=s._unregister)==null||i.call(s),this.unregisterStream(s)}this.removeFromQueue(e),this.removeFromUnreliableQueue(e),this.refCount[t]=0,e.forEachChild((s,o)=>{s.removeParent(e.ref)&&(s.parentRef===void 0||s.parentRef&&this.refCount[s.ref[Ke]]>0?this.remove(s):s.parentRef&&this.moveNextToParent(s))})}else this.refCount[t]=n,this.enqueueFilterRefresh(e),this.recursivelyMoveNextToParent(e);return n}recursivelyMoveNextToParent(e){this.moveNextToParent(e),e.forEachChild((t,n)=>this.recursivelyMoveNextToParent(t))}moveNextToParent(e){e.changesNode&&this._moveNextToParentInList(this.changes,e,e.changesNode,"changesNode"),e.unreliableChangesNode&&this._moveNextToParentInList(this.unreliableChanges,e,e.unreliableChangesNode,"unreliableChangesNode")}_moveNextToParentInList(e,t,n,i){const s=t.parent;if(!s||!s[ee])return;const o=s[ee][i];!o||o===n||n.position>o.position||(n.prev?n.prev.next=n.next:e.next=n.next,n.next?n.next.prev=n.prev:e.tail=n.prev,n.prev=e.tail,n.next=void 0,e.tail.next=n,e.tail=n,n.position=e.nextPosition++)}enqueueChangeTree(e,t=e.changesNode){t||(e.changesNode=this._appendToList(this.changes,e))}enqueueUnreliable(e,t=e.unreliableChangesNode){t||(e.unreliableChangesNode=this._appendToList(this.unreliableChanges,e))}_appendToList(e,t){const n=this._nodePool;let i;return n.length>0?(i=n.pop(),i.changeTree=t,i.next=void 0,i.prev=void 0):i={changeTree:t,next:void 0,prev:void 0,position:0},e.next?(i.prev=e.tail,e.tail.next=i,e.tail=i):(e.nextPosition=0,e.next=i,e.tail=i),i.position=e.nextPosition++,i}releaseNode(e){e.changeTree=void 0,e.prev=void 0,e.next=void 0,this._nodePool.push(e)}removeFromQueue(e){return this._removeNode(this.changes,e,e.changesNode,"changesNode")}removeFromUnreliableQueue(e){return this._removeNode(this.unreliableChanges,e,e.unreliableChangesNode,"unreliableChangesNode")}_removeNode(e,t,n,i){return!n||n.changeTree!==t?!1:(n.prev?n.prev.next=n.next:e.next=n.next,n.next?n.next.prev=n.prev:e.tail=n.prev,t[i]=void 0,this.releaseNode(n),!0)}}function z1(r,e){if(e===-1||e>=r.length)return!1;const t=r.length-1;for(let n=e;n<t;n++)r[n]=r[n+1];return r.length=t,!0}function G1(r,e,t){const n=~t,i=r.changeTrees;for(const s in i){const o=i[s],a=o.visibleViews;a!==void 0&&e<a.length&&(a[e]&=n);const l=o.subscribedViews;l!==void 0&&e<l.length&&(l[e]&=n);const c=o.tagViews;c!==void 0&&c.forEach(f=>{e<f.length&&(f[e]&=n)})}}new FinalizationRegistry(({root:r,id:e,slot:t,bit:n})=>{G1(r,t,n),r.releaseViewId(e)});const V1=-1;function gd(r){r.structSwitchEmitted||(r.shouldEmitSwitch&&(r.buffer[r.it.offset++]=Ir&255,rt.number(r.buffer,r.ref[Ke],r.it)),r.structSwitchEmitted=!0)}function H1(r,e){og(r,e,me.ADD)}function sg(r,e){if(e._fullSyncGen===r.gen)return;if(e._fullSyncGen=r.gen,!r.hasView||r.view.isChangeTreeVisible(e)){const n=e.encDescriptor;r.changeTree=e,r.ref=e.ref,r.encoder=n.encoder,r.filter=n.filter,r.metadata=n.metadata,r.treeIsFiltered=e.isFiltered,r.isSchema=n.isSchema,r.filterBitmask=n.filterBitmask,r.tags=n.tags,r.structSwitchEmitted=!1,r.shouldEmitSwitch=r.hasView||r.it.offset>r.initialOffset||e!==r.rootChangeTree,wh(e,r,H1)}ta(e,r,W1)}function W1(r,e,t){sg(r,e)}function og(r,e,t){if(e<0){if(r.treeIsFiltered!==r.emitFiltered)return;gd(r),r.buffer[r.it.offset++]=Math.abs(e)&255;return}if((r.isSchema?r.treeIsFiltered||(e<32?(r.filterBitmask&1<<e)!==0:r.tags[e]!==void 0):r.treeIsFiltered)!==r.emitFiltered)return;const i=r.isEncodeAll?me.ADD:t;i!==void 0&&(r.filter!==void 0&&!r.filter(r.ref,e,r.view)||(gd(r),r.encoder(r.self,r.buffer,r.changeTree,e,i,r.it,r.isEncodeAll,r.hasView,r.metadata)))}function Dc(r,e){const t=new Uint8Array(r.length+e.length);return t.set(r,0),t.set(e,r.length),t}const pi=class pi{constructor(e,t){L(this,"sharedBuffer",new Uint8Array(pi.BUFFER_SIZE));L(this,"context");L(this,"state");L(this,"root");L(this,"_encodeCtx",{self:void 0,buffer:void 0,it:void 0,changeTree:void 0,ref:void 0,encoder:void 0,filter:void 0,metadata:void 0,view:void 0,isEncodeAll:!1,hasView:!1,treeIsFiltered:!1,isSchema:!1,emitFiltered:!1,filterBitmask:0,tags:void 0,structSwitchEmitted:!1,isRootTree:!1,shouldEmitSwitch:!1,gen:0,initialOffset:0,rootChangeTree:void 0});L(this,"_fullSyncGen",0);this.context=Xr.cache(e.constructor),this.root=t!=null?t:new k1(this.context),this.setState(e)}setState(e){this.state=e,this.state[ee].setRoot(this.root)}encode(e={offset:0},t,n=this.sharedBuffer,i=e.offset){return this._encodeChannel(e,t,n,i,!1)}encodeUnreliable(e={offset:0},t,n=this.sharedBuffer,i=e.offset){return this._encodeChannel(e,t,n,i,!0)}_encodeChannel(e,t,n,i,s){this.root.pendingFilterRefresh.length>0&&ld(this.root);const o=t!==void 0,a=this.state[ee],l=this._encodeCtx;l.self=this,l.buffer=n,l.it=e,l.view=t,l.isEncodeAll=!1,l.hasView=o,l.emitFiltered=o;let f=s?this.root.unreliableChanges:this.root.changes;for(;f=f.next;){const h=f.changeTree;if(o&&!t.isChangeTreeVisible(h))continue;const u=s?h.unreliableRecorder:h;if(!u||!u.has())continue;const d=h.encDescriptor;l.changeTree=h,l.ref=h.ref,l.encoder=d.encoder,l.filter=d.filter,l.metadata=d.metadata,l.treeIsFiltered=h.isFiltered,l.isSchema=d.isSchema,l.filterBitmask=d.filterBitmask,l.tags=d.tags,l.structSwitchEmitted=!1,l.isRootTree=h===a,l.shouldEmitSwitch=o||e.offset>i||!l.isRootTree,u.forEachWithCtx(l,og)}return!s&&!o&&this.root.activeViews.size===0&&this.root.streamTrees.size>0&&this._emitStreamBroadcast(n,e),e.offset>n.byteLength?(n=this._resizeBuffer(n,e.offset),e.offset=i,this._encodeChannel(e,t,n,i,s)):n.subarray(0,e.offset)}encodeFullSync(e,t,n,i,s=e.offset){this.root.pendingFilterRefresh.length>0&&ld(this.root);const o=i!==void 0,a=this.state[ee],l=this._encodeCtx;return l.self=this,l.buffer=t,l.it=e,l.view=i,l.isEncodeAll=!0,l.hasView=o,l.emitFiltered=n,l.gen=++this._fullSyncGen,l.initialOffset=s,l.rootChangeTree=a,sg(l,a),e.offset>t.byteLength?(t=this._resizeBuffer(t,e.offset),e.offset=s,this.encodeFullSync(e,t,n,i,s)):t.subarray(0,e.offset)}_resizeBuffer(e,t){const n=Math.ceil(t/pi.BUFFER_SIZE)*pi.BUFFER_SIZE;console.warn(`@colyseus/schema buffer overflow. Encoded state is higher than default BUFFER_SIZE. Use the following to increase default BUFFER_SIZE:

    import { Encoder } from "@colyseus/schema";
    Encoder.BUFFER_SIZE = ${Math.round(n/1024)} * 1024; // ${Math.round(n/1024)} KB
`);const i=new Uint8Array(n);return i.set(e),e===this.sharedBuffer&&(this.sharedBuffer=i),i}encodeAll(e={offset:0},t=this.sharedBuffer){return this.encodeFullSync(e,t,!1)}encodeAllView(e,t,n,i=this.sharedBuffer){const s=n.offset;return i=this.encodeFullSync(n,i,!0,e,s),Dc(i.subarray(0,t),i.subarray(s,n.offset))}ensureCapacity(e,t){if(t+pi.BUFFER_SIZE<=e.byteLength)return e;const n=Math.ceil((t+pi.BUFFER_SIZE)/pi.BUFFER_SIZE)*pi.BUFFER_SIZE,i=new Uint8Array(n);return i.set(e.subarray(0,t)),e===this.sharedBuffer&&(this.sharedBuffer=i),i}encodeView(e,t,n,i=this.sharedBuffer){const s=n.offset;this._emitStreamPriority(e);for(const o of e.changes.keys()){const a=e.changes.get(o),l=this.root.changeTrees[o];if(l===void 0){e.changes.delete(o);continue}if(a.size===0)continue;const c=l.encDescriptor,f=c.encoder,h=c.metadata,u=l.ref,d=l.refTarget;i=this.ensureCapacity(i,n.offset),i[n.offset++]=Ir&255,rt.number(i,u[Ke],n);for(const[g,_]of a){let m;if(g===V1){const E=d.tmpItems,v=d.deletedIndexes;for(let C=0;C<E.length;C++)E[C]===void 0||v[C]===!0||f(this,i,l,C,me.ADD,n,!1,!0,h);continue}if(typeof g=="number")m=g;else{const E=g.indexInParent(u);if(E===void 0)continue;if(m=E,_===me.ADD&&l.getChange(m)===me.DELETE){e.changes.delete(g.ref[Ke]);continue}}const y=d[Pt](m)!==void 0&&_||me.DELETE;f(this,i,l,m,y,n,!1,!0,h)}}return e.changes.clear(),i=this.encode(n,e,i),Dc(i.subarray(0,t),i.subarray(s,n.offset))}encodeUnreliableView(e,t,n,i=this.sharedBuffer){const s=n.offset;return i=this.encodeUnreliable(n,e,i,s),Dc(i.subarray(0,t),i.subarray(s,n.offset))}_emitStreamBroadcast(e,t){const n=this.root.streamTrees;for(const i of n){const s=i,o=s[ee],a=s[Ke];if(a===void 0)continue;const l=s._stream,c=l.broadcastDeletes,f=l.broadcastPending,h=l.sentBroadcast,u=c.size>0,d=f.size>0,g=o.encDescriptor,_=g.encoder,m=g.metadata;if(u||d){if(e[t.offset++]=Ir&255,rt.number(e,a,t),u){for(const C of c)_(this,e,o,C,me.DELETE,t,!1,!1,m);c.clear()}const p=l.maxPerTick,y=[];let E=0;const v=[];for(const C of f){if(E>=p)break;const R=s[Pt](C);if(R===void 0){v.push(C);continue}_(this,e,o,C,me.ADD,t,!1,!1,m),h.add(C),y.push(R),v.push(C),E++}for(const C of v)f.delete(C);for(const C of y){const R=C[ee];if(R===void 0)continue;const T=C[Ke];if(T===void 0)continue;e[t.offset++]=Ir&255,rt.number(e,T,t);const w=R.encDescriptor,S=w.encoder,x=w.metadata;R.forEachLive(F=>{mt.hasUnreliableAtIndex(x,F)||S(this,e,R,F,me.ADD,t,!1,!1,x)})}}for(const p of h){const y=s[Pt](p);if(y===void 0)continue;const E=y[ee];if(E===void 0||!E.has())continue;const v=y[Ke];if(v===void 0)continue;e[t.offset++]=Ir&255,rt.number(e,v,t);const C=E.encDescriptor,R=C.encoder,T=C.metadata;E.forEach((w,S)=>{w<0||mt.hasUnreliableAtIndex(T,w)||R(this,e,E,w,S,t,!1,!1,T)})}}}_emitStreamPriority(e){var i;const t=this.root.streamTrees;if(t.size===0)return;const n=e.id;for(const s of t){const o=s,a=o._stream,l=a.pendingByView.get(n);if(l===void 0||l.size===0)continue;const c=(i=a.priorityByView)==null?void 0:i.get(n),f=c!==void 0,h=a.priority,u=a.maxPerTick,d=[],g=[];if(f||h!==void 0){const p=[],y=[];let E=0;for(const v of l){const C=o[Pt](v);if(C===void 0){g.push(v);continue}const R=f?c(C):h(e,C);if(E<u){let T=E++;for(;T>0&&y[T-1]<R;)y[T]=y[T-1],p[T]=p[T-1],T--;y[T]=R,p[T]=v}else if(R>y[u-1]){let T=u-1;for(;T>0&&y[T-1]<R;)y[T]=y[T-1],p[T]=p[T-1],T--;y[T]=R,p[T]=v}}for(let v=0;v<E;v++)d.push(p[v])}else for(const p of l){if(d.length>=u)break;d.push(p)}for(const p of g)l.delete(p);const _=d.length;let m=a.sentByView.get(n);m===void 0&&(m=new Set,a.sentByView.set(n,m));for(let p=0;p<_;p++){const y=d[p],E=o[Pt](y);if(E===void 0){l.delete(y);continue}e._addImmediate(E);const v=E[ee];if(v!==void 0){const C=E[Ke];let R=e.changes.get(C);R===void 0&&(R=new Map,e.changes.set(C,R));const T=v.metadata;v.forEachLive(w=>{mt.hasUnreliableAtIndex(T,w)||R.set(w,me.ADD)})}l.delete(y),m.add(y)}}}discardChanges(){const e=this.root.changes;let t=e.next;const n=this.root;for(;t;){const i=t.next;t.changeTree.endEncode(),n.releaseNode(t),t=i}e.next=void 0,e.tail=void 0}discardUnreliableChanges(){const e=this.root.unreliableChanges;let t=e.next;const n=this.root;for(;t;){const i=t.next;t.changeTree.endEncodeUnreliable(),n.releaseNode(t),t=i}e.next=void 0,e.tail=void 0}tryEncodeTypeId(e,t,n,i){const s=this.context.getTypeId(t),o=this.context.getTypeId(n);if(o===void 0){console.warn(`@colyseus/schema WARNING: Class "${n.name}" is not registered on TypeRegistry - Please either tag the class with @entity or define a @type() field.`);return}s!==o&&(e[i.offset++]=Tm&255,rt.number(e,o,i))}get hasChanges(){return this.root.changes.next!==void 0}get hasUnreliableChanges(){return this.root.unreliableChanges.next!==void 0}};L(pi,"BUFFER_SIZE",16*1024);let hl=pi;class _d extends Error{constructor(e){super(e),this.name="DecodingWarning"}}const vd={value:0,enumerable:!1,writable:!0};class X1{constructor(){L(this,"refs",new Map);L(this,"refCount",{});L(this,"deletedRefs",new Set);L(this,"callbacks",{});L(this,"nextUniqueId",0)}getNextUniqueId(){return this.nextUniqueId++}addRef(e,t,n=!0){this.refs.set(e,t),t[Ke]===void 0?(vd.value=e,Object.defineProperty(t,Ke,vd)):t[Ke]!==e&&(t[Ke]=e),n&&(this.refCount[e]=(this.refCount[e]||0)+1),this.deletedRefs.has(e)&&this.deletedRefs.delete(e)}removeRef(e){const t=this.refCount[e];if(t===void 0){try{throw new _d("trying to remove refId that doesn't exist: "+e)}catch(n){console.warn(n)}return}if(t===0){try{const n=this.refs.get(e);throw new _d(`trying to remove refId '${e}' with 0 refCount (${n.constructor.name}: ${JSON.stringify(n)})`)}catch(n){console.warn(n)}return}(this.refCount[e]=t-1)<=0&&this.deletedRefs.add(e)}clearRefs(){this.refs.clear(),this.deletedRefs.clear(),this.callbacks={},this.refCount={}}garbageCollectDeletedRefs(){this.deletedRefs.forEach(e=>{if(this.refCount[e]>0)return;const t=this.refs.get(e),n=t.constructor[Symbol.metadata];if(n!=null)for(const i in n){const s=n[i].name,o=t[s];if(typeof o=="object"&&o){const a=o[Ke];a!==void 0&&!this.deletedRefs.has(a)&&this.removeRef(a)}}else typeof t[tt]=="function"&&Array.from(t.values()).forEach(i=>{const s=i[Ke];s!==void 0&&!this.deletedRefs.has(s)&&this.removeRef(s)});this.refs.delete(e),delete this.refCount[e],delete this.callbacks[e]}),this.deletedRefs.clear()}addCallback(e,t,n){if(e===void 0){const i=typeof t=="number"?me[t]:t;throw new Error(`Can't addCallback on '${i}' (refId is undefined)`)}return this.callbacks[e]||(this.callbacks[e]={}),this.callbacks[e][t]||(this.callbacks[e][t]=[]),this.callbacks[e][t].push(n),()=>this.removeCallback(e,t,n)}removeCallback(e,t,n){var s,o,a;const i=(a=(o=(s=this.callbacks)==null?void 0:s[e])==null?void 0:o[t])==null?void 0:a.indexOf(n);i!==void 0&&i!==-1&&z1(this.callbacks[e][t],i)}}class ul{constructor(e,t){L(this,"context");L(this,"state");L(this,"root");L(this,"currentRefId",0);L(this,"triggerChanges");L(this,"resyncVisited",null);L(this,"resyncDamaged",!1);this.setState(e),this.context=t||new Xr(e.constructor)}setState(e){this.state=e,this.root=new X1,this.root.addRef(0,e)}decode(e,t={offset:0},n=this.state){var l,c,f;const i=this.triggerChanges!==void 0?[]:null,s=this.root,o=e.byteLength;let a=n.constructor[ri];for(this.currentRefId=0;t.offset<o;){if(e[t.offset]==Ir){t.offset++,(l=n[sl])==null||l.call(n);const u=ut.number(e,t),d=s.refs.get(u);d?(n=d,a=n.constructor[ri],this.currentRefId=u):(console.error(`"refId" not found: ${u}`,{previousRef:n,previousRefId:this.currentRefId}),console.warn("Please report this issue to the developers."),this.skipCurrentStructure(e,t,o));continue}if(a(this,e,t,n,i)===ig){console.warn("@colyseus/schema: definition mismatch"),this.skipCurrentStructure(e,t,o);continue}}return(c=n[sl])==null||c.call(n),this.resyncVisited!==null&&g1(this,i),i!==null&&((f=this.triggerChanges)==null||f.call(this,i)),s.garbageCollectDeletedRefs(),i}decodeResync(e,t={offset:0}){this.resyncVisited=new Map,this.resyncDamaged=!1;try{return this.decode(e,t)}finally{this.resyncVisited=null}}skipCurrentStructure(e,t,n){this.resyncVisited!==null&&(this.resyncDamaged=!0);const i={offset:t.offset};for(;t.offset<n&&!(e[t.offset]===Ir&&(i.offset=t.offset+1,this.root.refs.has(ut.number(e,i))));)t.offset++}getInstanceType(e,t,n){let i;if(e[t.offset]===Tm){t.offset++;const s=ut.number(e,t);i=this.context.get(s)}return i||n}createInstanceOfType(e){return e.initializeForDecoder()}removeChildRefs(e,t){const n=typeof e[tt]!="string",i=e[Ke];e.forEach((s,o)=>{t==null||t.push({ref:e,refId:i,op:me.DELETE,field:o,value:void 0,previousValue:s}),n&&this.root.removeRef(s[Ke])})}}const ag=ia({min:xn.float64(),max:xn.float64(),bits:xn.uint8(),mode:xn.uint8()},"QuantizedDescriptor"),lg=ia({name:xn.string(),type:xn.string(),referencedType:xn.number(),childPrimitive:xn.string(),quantized:xn.ref(ag).optional()},"ReflectionField"),cg=ia({id:xn.number(),extendsId:xn.number(),fields:xn.array(lg)},"ReflectionType"),Hi=ia({types:xn.array(cg),rootType:xn.number()},"Reflection");Hi.encode=function(r,e={offset:0}){const t=r.context,n=new Hi,i=new hl(n),s=t.schemas.get(r.state.constructor);s>0&&(n.rootType=s);const o=new Set,a={},l=f=>{if(f.extendsId===void 0||o.has(f.extendsId)){o.add(f.id),n.types.push(f);const h=a[f.id];h!==void 0&&(delete a[f.id],h.forEach(u=>l(u)))}else a[f.extendsId]===void 0&&(a[f.extendsId]=[]),a[f.extendsId].push(f)};t.schemas.forEach((f,h)=>{var _;const u=new cg;u.id=Number(f);const d=Object.getPrototypeOf(h);d!==Ot&&(u.extendsId=t.schemas.get(d));const g=h[Symbol.metadata];if(g!==d[Symbol.metadata]){const m=(_=g[rn])!=null?_:-1;for(let p=0;p<=m;p++){const y=g[p];if(y===void 0)continue;const E=y.name;if(!Object.prototype.hasOwnProperty.call(g,E))continue;const v=new lg;v.name=E;let C;if(typeof y.type=="string")C=y.type;else if(Wr(y.type)){const R=y.type.quantized;C="quantized";const T=new ag;T.min=R.min,T.max=R.max,T.bits=R.bits,T.mode=R.wrap?1:0,v.quantized=T}else{let R;Ot.is(y.type)?(C="ref",R=y.type):(C=Object.keys(y.type)[0],typeof y.type[C]=="string"?v.childPrimitive=y.type[C]:R=y.type[C]),v.referencedType=R?t.getTypeId(R):-1}v.type=C,u.fields.push(v)}}l(u)});for(const f in a)a[f].forEach(h=>n.types.push(h));return i.encodeAll(e).slice(0,e.offset)};Hi.decode=function(r,e){const t=new Hi;new ul(t).decode(r,e);const i=new Xr;t.types.forEach(a=>{var f;const l=(f=i.get(a.extendsId))!=null?f:Ot,c=class extends l{};Xr.register(c),i.add(c,a.id)},{});const s=(a,l,c)=>{l.fields.forEach((f,h)=>{var d;const u=c+h;if(f.quantized!==void 0){const g=f.quantized;mt.addField(a,u,f.name,{quantized:bh({min:g.min,max:g.max,bits:g.bits,mode:g.mode===1?"wrap":"clamp"})})}else if(f.referencedType!==void 0){const g=f.type,_=(d=i.get(f.referencedType))!=null?d:f.childPrimitive;g==="ref"?mt.addField(a,u,f.name,_):mt.addField(a,u,f.name,{[g]:_})}else mt.addField(a,u,f.name,f.type)})};t.types.forEach(a=>{const l=i.get(a.id),c=mt.initialize(l),f=[];let h=a;do f.push(h),h=t.types.find(d=>d.id===h.extendsId);while(h);let u=0;f.reverse().forEach(d=>{s(c,d,u),u+=d.fields.length})});const o=new(i.get(t.rootType||0));return new ul(o,i)};Hi.makeEncodable=function(r){const e=r[Symbol.metadata];if(!e)return r;const t=e[rn];if(t===void 0)return r;for(let n=0;n<=t;n++){const i=e[n];i&&mt.defineField(r,e,n,i.name,i.type)}return Object.prototype.hasOwnProperty.call(r,wo)&&delete r[wo],r};Wi("map",{constructor:cr});Wi("array",{constructor:lr});Wi("set",{constructor:No});Wi("collection",{constructor:Fo});const xd=256,Pc=5,Cr=class Cr{constructor(e,t={}){L(this,"instance");L(this,"mode");L(this,"historySize");L(this,"_desc");L(this,"_numFields");L(this,"_slots");L(this,"_slotLens");L(this,"_slotHead",0);L(this,"_slotCount",0);L(this,"_outBuffer");L(this,"_seq",0);L(this,"_encoder");var i,s,o;this.instance=e,this.mode=(i=t.mode)!=null?i:"reliable",this.historySize=this.mode==="unreliable"?Math.max(1,(s=t.historySize)!=null?s:3):1,this._desc=Km(e);const n=(o=this._desc.metadata)==null?void 0:o[rn];if(n===void 0)throw new Error(`InputEncoder: '${e.constructor.name}' has no fields`);this._numFields=n;for(let a=0;a<=n;a++)if(this._desc.names[a]!==void 0&&this._desc.encoders[a]===void 0)throw new Error(`InputEncoder: non-primitive field '${this._desc.names[a]}' on '${e.constructor.name}' is not supported. Use Encoder for state containing refs/collections.`);if(this.mode==="unreliable"){this._slots=new Array(this.historySize),this._slotLens=new Array(this.historySize).fill(0);for(let a=0;a<this.historySize;a++)this._slots[a]=new Uint8Array(xd);this._outBuffer=new Uint8Array((xd+Pc)*this.historySize)}this._encoder=new hl(e)}get seq(){return this._seq}encode(){const e=this._produceDelta();return this.mode==="reliable"?e:this._pushAndEmitRing(e)}reset(){this._slotHead=0,this._slotCount=0,this._encoder.discardChanges();const e=this.instance[ee],t=this.instance[Nn];for(let n=0;n<=this._numFields;n++)t[n]===void 0||t[n]===null||e.markDirty(n)}copyInto(e){const t=this.instance[Nn],n=e[Nn];for(let i=0;i<=this._numFields;i++)n[i]=t[i]}_produceDelta(){const e=this._encoder.encode();return this._encoder.discardChanges(),e}_pushAndEmitRing(e){this._seq++;let t=this._slots[this._slotHead];return e.length>t.byteLength&&(t=this._slots[this._slotHead]=Cr._grow(t,e.length,"unreliable ring slot")),t.set(e),this._slotLens[this._slotHead]=e.length,this._slotHead=(this._slotHead+1)%this.historySize,this._slotCount<this.historySize&&this._slotCount++,this._emitRing()}_emitRing(){const e=this._seq-this._slotCount+1;let t=Pc;for(let o=0;o<this._slotCount;o++)t+=this._slotLens[o]+Pc;let n=this._outBuffer;t>n.byteLength&&(n=this._outBuffer=Cr._grow(n,t,"unreliable output packet"));const i={offset:0};rt.number(n,e,i);const s=(this._slotHead-this._slotCount+this.historySize)%this.historySize;for(let o=0;o<this._slotCount;o++){const a=(s+o)%this.historySize,l=this._slotLens[a];rt.number(n,l,i),n.set(this._slots[a].subarray(0,l),i.offset),i.offset+=l}return n.subarray(0,i.offset)}static _grow(e,t,n){const i=Math.max(t,e.byteLength*2);return Cr._warned||(Cr._warned=!0,console.warn(`@colyseus/schema/input: InputEncoder buffer overflow in ${n}. Growing to ${i} bytes.`)),new Uint8Array(i)}};L(Cr,"_warned",!1);let Bf=Cr;function ni(){return typeof performance!="undefined"?performance.now():Date.now()}const $1=typeof WeakRef!="undefined"?r=>new WeakRef(r):r=>({deref:()=>r}),j1=64;function q1(r,e){const t=globalThis;let n=t.__colyseusDebug;if(!n){const i=[];n=t.__colyseusDebug={__buffer:i,publish(s,o){i.push([s,$1(o)]),i.length>j1&&i.shift()}}}n.publish(r,e)}function Y1(){if(typeof globalThis=="undefined")return!1;const r=globalThis.__colyseusDebug;return r!=null&&r.__buffer===void 0}var Op;const K1=(Op=Symbol.metadata)!=null?Op:Symbol.for("Symbol.metadata");function J1(r){return r.constructor[K1]}const kf=9,Z1=kf,Q1=(r,e)=>(e?2:1)*(kf+4+kf*r),_n=class _n{constructor(e,t,n,i){L(this,"data");L(this,"_host");L(this,"_encoder");L(this,"_scratch",new Uint8Array(2048));L(this,"_framed",null);L(this,"_sentCount",0);L(this,"_lastProcessed",0);L(this,"_epoch",0);L(this,"_sendTimes");L(this,"_inputBufferSize");L(this,"_inputBuffer",null);L(this,"_reckonTimes",null);L(this,"_pendingReckon",0);L(this,"_lastStamp",0);L(this,"_stampRing",null);L(this,"_renderDeltaRing",null);L(this,"_ringSlots",0);L(this,"_warnedUnknownKeys",null);L(this,"_stampRender",!1);L(this,"_stampReckon",!1);L(this,"_allowRewind");L(this,"_sendListeners",null);L(this,"_renderDelay",0);L(this,"_renderDelayExplicit",!1);L(this,"_renderDelayProvider");L(this,"_tickRate");L(this,"_patchRate");L(this,"_subSteps",1);var a,l,c,f,h;this._host=e,this.data=t,this._encoder=n,this._stampRender=(a=i==null?void 0:i.stampRender)!=null?a:!1,this._stampReckon=(l=i==null?void 0:i.stampReckon)!=null?l:!1,this._allowRewind=i==null?void 0:i.allowRewind,this._allowRewind!==void 0&&n.mode==="unreliable"&&!_n._warnedAllowRewindIgnored&&(_n._warnedAllowRewindIgnored=!0,console.warn('@colyseus/sdk: `allowRewind` is ignored on `mode:"unreliable"` — a packet stamps its whole redundancy ring or none of it, so excluding one input would cost bandwidth rather than save it. Use `mode:"reliable"` to gate the lag-comp stamp per input.')),this._renderDelay=(c=i==null?void 0:i.renderDelay)!=null?c:0,this._renderDelayExplicit=(i==null?void 0:i.renderDelay)!==void 0,this._tickRate=i==null?void 0:i.tickRate,this._patchRate=i==null?void 0:i.patchRate,this._subSteps=(f=i==null?void 0:i.subSteps)!=null?f:1;const s=this._tickRate?1e3/this._tickRate:1e3/60,o=_n.BUFFER_RTT_BUDGET_MS+((h=this._patchRate)!=null?h:0);this._inputBufferSize=Math.max(_n.BUFFER_FLOOR,Math.ceil(o/s*_n.BUFFER_HEADROOM)),this._sendTimes=new Float64Array(this._inputBufferSize)}get mode(){return this._encoder.mode}get tickRate(){return this._tickRate}get stepSeconds(){return this._tickRate?1/this._tickRate:void 0}get stepMs(){return this._tickRate?1e3/this._tickRate:void 0}get patchRate(){return this._patchRate}get subSteps(){return this._subSteps}get subStepSeconds(){return this._tickRate?1/this._tickRate/this._subSteps:void 0}get subStepMs(){return this._tickRate?1e3/this._tickRate/this._subSteps:void 0}get lastProcessed(){return this._lastProcessed}get sentCount(){return this._sentCount}get pendingCount(){return this._sentCount-this._lastProcessed}get replayBufferSize(){return this._inputBufferSize}get epoch(){return this._epoch}at(e){if(this._inputBuffer!==null&&!(e<=this._lastProcessed||e>this._sentCount)){if(this._sentCount-e>=this._inputBufferSize){_n._warnedBufferOverflow||(_n._warnedBufferOverflow=!0,console.warn(`@colyseus/sdk: input replay buffer (${this._inputBufferSize}) overflowed — RTT exceeds its budget at this input rate; reconciliation may drift.`));return}return this._inputBuffer[e%this._inputBufferSize]}}reckonTimeAt(e){return this._reckonTimes===null||e<=this._lastProcessed||e>this._sentCount||this._sentCount-e>=this._inputBufferSize?0:this._reckonTimes[e%this._inputBufferSize]}reset(){this._encoder.reset(),this._sentCount=this._lastProcessed=this._encoder.seq,this._framed=null,this._lastStamp=0,this._ringSlots=0,this._sendTimes.fill(0),this._epoch++}bindRenderDelay(e){this._renderDelayExplicit||(this._renderDelayProvider=e)}_resolveRenderDelay(){return this._renderDelayProvider?this._renderDelayProvider():this._renderDelay}_warnUnknownFields(){var t,n;const e=J1(this.data);if(e)for(const i of Object.keys(this.data))e[i]!==void 0||(t=this._warnedUnknownKeys)!=null&&t.has(i)||(((n=this._warnedUnknownKeys)!=null?n:this._warnedUnknownKeys=new Set).add(i),console.warn(`@colyseus/sdk input: "${i}" is not a declared field on ${this.data.constructor.name} — the write is never encoded or sent. Declare it with @type(...) on the input schema, or remove the write.`))}send(){const e=this._host.connection;if(!(e!=null&&e.isOpen))return 0;Y1()&&this._warnUnknownFields();const t=this._encoder.encode(),n=this._encoder.mode==="reliable",i=this._stampReckon||this._stampRender,s=i&&n&&(this._allowRewind===void 0||this._allowRewind(this.data)),o=i&&!n,a=this._stampReckon&&this._stampRender,c=1+(s?Z1+(a?2:0):o?Q1(this._encoder.historySize,a):0)+t.length;c>this._scratch.byteLength&&(this._scratch=new Uint8Array(Math.max(c,this._scratch.byteLength*2)),this._framed=null),this._scratch[0]=(n?Nt.ROOM_INPUT_RELIABLE:Nt.ROOM_INPUT_UNRELIABLE)|(s||o?Ff.TIMED:0);const f={offset:1};if(o)this._writeRingStamps(f);else if(s){const{stamp:g,renderDelta:_}=this._sampleStamp();rt.number(this._scratch,g-this._lastStamp,f),this._lastStamp=g,a&&rt.uint16(this._scratch,_,f)}else this._pendingReckon=0;this._scratch.set(t,f.offset);const h=f.offset+t.length;(this._framed===null||this._framed.byteLength!==h)&&(this._framed=this._scratch.subarray(0,h));const u=this._framed;let d;return n?(e.send(u),d=++this._sentCount):(e.sendUnreliable(u),d=this._sentCount=this._encoder.seq),this._recordSent(d),d}_writeRingStamps(e){var l,c;const{stamp:t,renderDelta:n}=this._sampleStamp(),i=this._encoder.historySize,s=this._encoder.seq,o=this._ringSlots=Math.min(this._ringSlots+1,i),a=(l=this._stampRing)!=null?l:this._stampRing=new Float64Array(i);if(a[s%i]=t,rt.number(this._scratch,o,e),rt.uint32(this._scratch,t,e),this._writeSeriesDeltas(a,s,o,e),this._stampReckon&&this._stampRender){const f=(c=this._renderDeltaRing)!=null?c:this._renderDeltaRing=new Uint16Array(i);f[s%i]=n,rt.uint16(this._scratch,n,e),this._writeSeriesDeltas(f,s,o,e)}}_writeSeriesDeltas(e,t,n,i){const s=e.length;for(let o=1;o<n;o++)rt.number(this._scratch,e[(t-o+1)%s]-e[(t-o)%s],i)}_sampleStamp(){var s,o,a,l;const e=this._host.clock,t=((o=(s=e==null?void 0:e.lastServerTime)==null?void 0:s.call(e))!=null?o:0)>0,n=t?Math.max(0,Math.round(e.serverNow()))>>>0:0,i=t?Math.min(65535,Math.max(0,Math.round(this._resolveRenderDelay()+((l=(a=e.smoothedRtt)==null?void 0:a.call(e))!=null?l:0)/2))):0;return this._pendingReckon=n,{stamp:this._stampReckon?n:n>i?n-i:0,renderDelta:i}}_recordSent(e){var n;if(this._inputBuffer===null){const i=this.data.constructor;this._inputBuffer=Array.from({length:this._inputBufferSize},()=>new i)}this._encoder.copyInto(this._inputBuffer[e%this._inputBufferSize]),this._sendTimes[e%this._inputBufferSize]=ni(),this._stampReckon&&(((n=this._reckonTimes)!=null?n:this._reckonTimes=new Float64Array(this._inputBufferSize))[e%this._inputBufferSize]=this._pendingReckon);const t=this._sendListeners;if(t!==null)for(let i=0;i<t.length;i++)t[i](e)}onSend(e){const t=this._sendListeners;return this._sendListeners=t!==null?[...t,e]:[e],()=>{const n=this._sendListeners;if(n===null)return;const i=n.indexOf(e);if(i<0)return;const s=n.slice();s.splice(i,1),this._sendListeners=s.length>0?s:null}}ackInput(e){if(e<=this._lastProcessed)return-1;const t=this._sentCount-e>=this._inputBufferSize;if(this._lastProcessed=e,t)return-1;const n=this._sendTimes[e%this._inputBufferSize];return n>0?ni()-n:-1}};L(_n,"BUFFER_FLOOR",64),L(_n,"BUFFER_RTT_BUDGET_MS",1e3),L(_n,"BUFFER_HEADROOM",1.5),L(_n,"_warnedBufferOverflow",!1),L(_n,"_warnedAllowRewindIgnored",!1);let zf=_n;const fg=Object.freeze({now:()=>ni(),serverNow:()=>ni(),renderNow:()=>ni(),rtt:()=>0,smoothedRtt:()=>0,jitter:()=>0,lastServerTime:()=>0,patchInterval:()=>0,setPatchInterval:r=>{},sample:(r,e)=>{}}),Lt=class Lt{constructor(){L(this,"_clockOffset",0);L(this,"_clockHasSample",!1);L(this,"_offsetCount",0);L(this,"_rttFloorT",[]);L(this,"_rttFloorV",[]);L(this,"_rtt",0);L(this,"_smoothedRtt",0);L(this,"_rttHasSample",!1);L(this,"_jitter",0);L(this,"_lastRecvTime",-1);L(this,"_lastServerTime",0);L(this,"_patchInterval",0);L(this,"_renderTau",Lt.RENDER_TAU);L(this,"_renderSn",0);L(this,"_renderSnAt",0)}serverNow(){return ni()+this._clockOffset}renderNow(){const e=this.serverNow();if(this._renderTau<=0)return e;const t=ni();if(this._renderSn===0)return this._renderSn=e,this._renderSnAt=t,this._renderSn;const n=Math.min(t-this._renderSnAt,100);return n<.5?this._renderSn:(this._renderSnAt=t,this._renderSn+=n,Math.abs(e-this._renderSn)>Lt.RENDER_SNAP?(this._renderSn=e,this._renderSn):(this._renderSn+=(e-this._renderSn)*(1-Math.exp(-n/this._renderTau)),this._renderSn))}setRenderTau(e){this._renderTau=e>0?e:0}now(){return ni()}rtt(){return this._rtt}smoothedRtt(){return this._smoothedRtt}jitter(){return this._jitter}lastServerTime(){return this._lastServerTime}patchInterval(){return this._patchInterval}setPatchInterval(e){this._patchInterval=e>0?e:0}sample(e,t){const n=ni(),i=Lt.EMA_ALPHA,s=this._patchInterval;if(this._lastRecvTime>=0&&s>0){const a=n-this._lastRecvTime,l=Math.round(a/s);l>=1&&l<=Lt.JITTER_STALL_X&&(this._jitter+=(Math.abs(a-l*s)-this._jitter)*Lt.JITTER_GAIN)}this._lastRecvTime=n,this._lastServerTime=e,(t<0||this._smoothedRtt>0&&t>this._smoothedRtt*Lt.RTT_OUTLIER_X)&&(t=-1);const o=t>=0?e+t/2-n:e-n;if(!this._clockHasSample)this._clockOffset=o,this._clockHasSample=!0,t>=0&&(this.pushRttFloor(t,n),this._offsetCount=1);else if(t>=0){const a=this.pushRttFloor(t,n),l=this._offsetCount<Lt.RTT_GATE_WARMUP;this._offsetCount++,(l||t<=a*Lt.RTT_GATE_FACTOR)&&(this._clockOffset=this._clockOffset*(1-i)+o*i)}t>=0&&(this._rtt=t,this._rttHasSample?this._smoothedRtt=this._smoothedRtt*(1-i)+t*i:(this._smoothedRtt=t,this._rttHasSample=!0))}pushRttFloor(e,t){const n=this._rttFloorT,i=this._rttFloorV;for(;i.length>0&&i[i.length-1]>=e;)i.pop(),n.pop();i.push(e),n.push(t);const s=t-Lt.RTT_GATE_WINDOW;for(;n.length>0&&n[0]<s;)n.shift(),i.shift();return i[0]}reset(){this._clockOffset=0,this._clockHasSample=!1,this._offsetCount=0,this._rtt=0,this._smoothedRtt=0,this._rttHasSample=!1,this._jitter=0,this._lastRecvTime=-1,this._lastServerTime=0,this._rttFloorT.length=0,this._rttFloorV.length=0,this._renderSn=0,this._renderSnAt=0}};L(Lt,"EMA_ALPHA",.1),L(Lt,"RENDER_TAU",250),L(Lt,"RENDER_SNAP",250),L(Lt,"RTT_OUTLIER_X",4),L(Lt,"JITTER_GAIN",1/16),L(Lt,"JITTER_STALL_X",4),L(Lt,"RTT_GATE_FACTOR",1.2),L(Lt,"RTT_GATE_WINDOW",1e4),L(Lt,"RTT_GATE_WARMUP",30);let Gf=Lt;var Nr,Jn,Ts,Bo,ko,zo,Go,Vo,Ho,As,Wo,ml,hg;class Ic{constructor(e){At(this,ml);At(this,Nr);At(this,Jn);At(this,Ts);At(this,Bo);At(this,ko,!1);At(this,zo);At(this,Go,!1);At(this,Vo,!1);At(this,Ho);At(this,As);At(this,Wo);wt(this,Nr,e)}get patchRate(){return Je(this,As)}applyReflection(e,t,n){const i=Hi.decode(e.subarray(0,n),t);Hi.makeEncodable(i.state.constructor),wt(this,zo,i.state.constructor),Je(this,Nr).clock===fg&&(Je(this,Nr).clock=new Gf)}applyOptions(e,t){const n=e[t.offset++];wt(this,Go,(n&mo.RENDER_TIME)!==0),wt(this,Vo,(n&mo.RECKON_TIME)!==0),n&mo.FIXED_TIMESTEP&&wt(this,Ho,ut.number(e,t)),n&mo.PATCH_RATE&&wt(this,As,ut.number(e,t)),n&mo.SUB_STEPS&&wt(this,Wo,ut.number(e,t))}ackInput(e){return Je(this,Jn)?Je(this,Jn).ackInput(e):-1}reset(){var e;(e=Je(this,Jn))==null||e.reset()}handle(e){var s;if(Je(this,Jn))return e!==void 0&&ts(this,ml,hg).call(this,e),Je(this,Jn);const t=(s=e==null?void 0:e.type)!=null?s:Je(this,zo);if(!t)throw new Error("room.input(): no input schema available. The server room must call `defineInput(YourInput)`, or you can pass `{ type: YourInput }` explicitly.");const n=new t,i=new Bf(n,e);return wt(this,Jn,new zf(Je(this,Nr),n,i,{stampRender:Je(this,Go),stampReckon:Je(this,Vo),renderDelay:e==null?void 0:e.renderDelay,allowRewind:e==null?void 0:e.allowRewind,tickRate:Je(this,Ho),patchRate:Je(this,As),subSteps:Je(this,Wo)})),wt(this,Ts,e),wt(this,Bo,i),Je(this,Jn)}}Nr=new WeakMap,Jn=new WeakMap,Ts=new WeakMap,Bo=new WeakMap,ko=new WeakMap,zo=new WeakMap,Go=new WeakMap,Vo=new WeakMap,Ho=new WeakMap,As=new WeakMap,Wo=new WeakMap,ml=new WeakSet,hg=function(e){var i,s,o;if(Je(this,ko))return;const t=Je(this,Jn),n=[];e.type!==void 0&&e.type!==((i=t.data)==null?void 0:i.constructor)&&n.push("type"),e.mode!==void 0&&e.mode!==t.mode&&n.push("mode"),e.historySize!==void 0&&t.mode==="unreliable"&&e.historySize!==Je(this,Bo).historySize&&n.push("historySize"),e.renderDelay!==void 0&&e.renderDelay!==((s=Je(this,Ts))==null?void 0:s.renderDelay)&&n.push("renderDelay"),e.allowRewind!==void 0!=(((o=Je(this,Ts))==null?void 0:o.allowRewind)!==void 0)&&n.push("allowRewind"),n.length!==0&&(wt(this,ko,!0),console.warn(`@colyseus/sdk: room.input() options ignored — the input handle was already created by an earlier call (first call wins). Differing: ${n.join(", ")}.`))};var Vf;try{Vf=new TextDecoder}catch{}var Le,yn,q=0,vt={},ft,nr,zn=0,yi=0,Xt,ki,En=[],lt,yd={useRecords:!1,mapsAsObjects:!0};class ug{}const dg=new ug;dg.name="MessagePack 0xC1";var fr=!1,Sd=2;class zs{constructor(e){e&&(e.useRecords===!1&&e.mapsAsObjects===void 0&&(e.mapsAsObjects=!0),e.sequential&&e.trusted!==!1&&(e.trusted=!0,!e.structures&&e.useRecords!=!1&&(e.structures=[],e.maxSharedStructures||(e.maxSharedStructures=0))),e.structures?e.structures.sharedLength=e.structures.length:e.getStructures&&((e.structures=[]).uninitialized=!0,e.structures.sharedLength=0),e.int64AsNumber&&(e.int64AsType="number")),Object.assign(this,e)}unpack(e,t){if(Le)return xg(()=>(Wf(),this?this.unpack(e,t):zs.prototype.unpack.call(yd,e,t)));!e.buffer&&e.constructor===ArrayBuffer&&(e=typeof Buffer!="undefined"?Buffer.from(e):new Uint8Array(e)),typeof t=="object"?(yn=t.end||e.length,q=t.start||0):(q=0,yn=t>-1?t:e.length),yi=0,nr=null,Xt=null,Le=e;try{lt=e.dataView||(e.dataView=new DataView(e.buffer,e.byteOffset,e.byteLength))}catch(n){throw Le=null,e instanceof Uint8Array?n:new Error("Source must be a Uint8Array or Buffer but was a "+(e&&typeof e=="object"?e.constructor.name:typeof e))}if(this instanceof zs){if(vt=this,this.structures)return ft=this.structures,Va(t);(!ft||ft.length>0)&&(ft=[])}else vt=yd,(!ft||ft.length>0)&&(ft=[]);return Va(t)}unpackMultiple(e,t){let n,i=0;try{fr=!0;let s=e.length,o=this?this.unpack(e,s):Dl.unpack(e,s);if(t){if(t(o,i,q)===!1)return;for(;q<s;)if(i=q,t(Va(),i,q)===!1)return}else{for(n=[o];q<s;)i=q,n.push(Va());return n}}catch(s){throw s.lastPosition=i,s.values=n,s}finally{fr=!1,Wf()}}_mergeStructures(e,t){this._onLoadedStructures&&(e=this._onLoadedStructures(e)),e=e||[],Object.isFrozen(e)&&(e=e.map(n=>n.slice(0)));for(let n=0,i=e.length;n<i;n++){let s=e[n];s&&(s.isShared=!0,n>=32&&(s.highByte=n-32>>5))}e.sharedLength=e.length;for(let n in t||[])if(n>=0){let i=e[n],s=t[n];s&&(i&&((e.restoreStructures||(e.restoreStructures=[]))[n]=i),e[n]=s)}return this.structures=e}decode(e,t){return this.unpack(e,t)}}function Va(r){try{if(!vt.trusted&&!fr){let t=ft.sharedLength||0;t<ft.length&&(ft.length=t)}let e;if(vt._readStruct&&Le[q]<64&&Le[q]>=32?(e=vt._readStruct(Le,q,yn),Le=null,!(r&&r.lazy)&&e&&(e=e.toJSON()),q=yn):e=Dt(),Xt&&(q=Xt.postBundlePosition,Xt=null),fr&&(ft.restoreStructures=null),q==yn)ft&&ft.restoreStructures&&Ed(),ft=null,Le=null,ki&&(ki=null);else{if(q>yn)throw new Error("Unexpected end of MessagePack data");if(!fr){let t;try{t=JSON.stringify(e,(n,i)=>typeof i=="bigint"?`${i}n`:i).slice(0,100)}catch(n){t="(JSON view not available "+n+")"}throw new Error("Data read, but end of buffer not reached "+t)}}return e}catch(e){throw ft&&ft.restoreStructures&&Ed(),Wf(),(e instanceof RangeError||e.message.startsWith("Unexpected end of buffer")||q>yn)&&(e.incomplete=!0),e}}function Ed(){for(let r in ft.restoreStructures)ft[r]=ft.restoreStructures[r];ft.restoreStructures=null}function Dt(){let r=Le[q++];if(r<160)if(r<128){if(r<64)return r;{let e=ft[r&63]||vt.getStructures&&pg()[r&63];return e?(e.read||(e.read=Ph(e,r&63)),e.read()):r}}else if(r<144)if(r-=128,vt.mapsAsObjects){let e={};for(let t=0;t<r;t++){let n=gg();n==="__proto__"&&(n="__proto_"),e[n]=Dt()}return e}else{let e=new Map;for(let t=0;t<r;t++)e.set(Dt(),Dt());return e}else{r-=144;let e=new Array(r);for(let t=0;t<r;t++)e[t]=Dt();return vt.freezeData?Object.freeze(e):e}else if(r<192){let e=r-160;if(yi>=q)return nr.slice(q-zn,(q+=e)-zn);if(yi==0&&yn<140){let t=e<16?Uh(e):mg(e);if(t!=null)return t}return Hf(e)}else{let e;switch(r){case 192:return null;case 193:return Xt?(e=Dt(),e>0?Xt[1].slice(Xt.position1,Xt.position1+=e):Xt[0].slice(Xt.position0,Xt.position0-=e)):dg;case 194:return!1;case 195:return!0;case 196:if(e=Le[q++],e===void 0)throw new Error("Unexpected end of buffer");return Uc(e);case 197:return e=lt.getUint16(q),q+=2,Uc(e);case 198:return e=lt.getUint32(q),q+=4,Uc(e);case 199:return yr(Le[q++]);case 200:return e=lt.getUint16(q),q+=2,yr(e);case 201:return e=lt.getUint32(q),q+=4,yr(e);case 202:if(e=lt.getFloat32(q),vt.useFloat32>2){let t=Lh[(Le[q]&127)<<1|Le[q+1]>>7];return q+=4,(t*e+(e>0?.5:-.5)>>0)/t}return q+=4,e;case 203:return e=lt.getFloat64(q),q+=8,e;case 204:return Le[q++];case 205:return e=lt.getUint16(q),q+=2,e;case 206:return e=lt.getUint32(q),q+=4,e;case 207:return vt.int64AsType==="number"?(e=lt.getUint32(q)*4294967296,e+=lt.getUint32(q+4)):vt.int64AsType==="string"?e=lt.getBigUint64(q).toString():vt.int64AsType==="auto"?(e=lt.getBigUint64(q),e<=BigInt(2)<<BigInt(52)&&(e=Number(e))):e=lt.getBigUint64(q),q+=8,e;case 208:return lt.getInt8(q++);case 209:return e=lt.getInt16(q),q+=2,e;case 210:return e=lt.getInt32(q),q+=4,e;case 211:return vt.int64AsType==="number"?(e=lt.getInt32(q)*4294967296,e+=lt.getUint32(q+4)):vt.int64AsType==="string"?e=lt.getBigInt64(q).toString():vt.int64AsType==="auto"?(e=lt.getBigInt64(q),e>=BigInt(-2)<<BigInt(52)&&e<=BigInt(2)<<BigInt(52)&&(e=Number(e))):e=lt.getBigInt64(q),q+=8,e;case 212:if(e=Le[q++],e==114)return Rd(Le[q++]&63);{let t=En[e];if(t)return t.read?(q++,t.read(Dt())):t.noBuffer?(q++,t()):t(Le.subarray(q,++q));throw new Error("Unknown extension "+e)}case 213:return e=Le[q],e==114?(q++,Rd(Le[q++]&63,Le[q++])):yr(2);case 214:return yr(4);case 215:return yr(8);case 216:return yr(16);case 217:return e=Le[q++],yi>=q?nr.slice(q-zn,(q+=e)-zn):tM(e);case 218:return e=lt.getUint16(q),q+=2,yi>=q?nr.slice(q-zn,(q+=e)-zn):nM(e);case 219:return e=lt.getUint32(q),q+=4,yi>=q?nr.slice(q-zn,(q+=e)-zn):iM(e);case 220:return e=lt.getUint16(q),q+=2,bd(e);case 221:return e=lt.getUint32(q),q+=4,bd(e);case 222:return e=lt.getUint16(q),q+=2,wd(e);case 223:return e=lt.getUint32(q),q+=4,wd(e);default:if(r>=224)return r-256;throw r===void 0?Ih():new Error("Unknown MessagePack token "+r)}}}const eM=/^[a-zA-Z_$][a-zA-Z\d_$]*$/;function Ph(r,e){function t(){if(t.count++>Sd){let i;try{i=r.read=new Function("r","return function(){return "+(vt.freezeData?"Object.freeze":"")+"({"+r.map(s=>s==="__proto__"?"__proto_:r()":eM.test(s)?s+":r()":"["+JSON.stringify(s)+"]:r()").join(",")+"})}")(Dt)}catch{return Sd=1/0,t()}return r.read0=i,r.highByte===0&&(r.read=Md(e,r.read)),i()}let n={};for(let i=0,s=r.length;i<s;i++){let o=r[i];o==="__proto__"&&(o="__proto_"),n[o]=Dt()}return vt.freezeData?Object.freeze(n):n}return t.count=0,r.read0=t,r.highByte===0?Md(e,t):t}const Md=(r,e)=>function(){let t=Le[q++];if(t===0)return e();let n=r<32?-(r+(t<<5)):r+(t<<5),i=ft[n]||pg()[n];if(!i)throw new Error("Record id is not defined for "+n);return i.read||(i.read=Ph(i,r)),i.read()};function pg(){let r=xg(()=>(Le=null,vt.getStructures()));return ft=vt._mergeStructures(r,ft)}var Hf=ra,tM=ra,nM=ra,iM=ra;function ra(r){let e;if(r<16&&(e=Uh(r)))return e;if(r>64&&Vf)return Vf.decode(Le.subarray(q,q+=r));const t=q+r,n=[];for(e="";q<t;){const i=Le[q++];if(!(i&128))n.push(i);else if((i&224)===192)if(i<194||q>=t||(Le[q]&192)!==128)n.push(65533);else{const s=Le[q++]&63;n.push((i&31)<<6|s)}else if((i&240)===224){const s=q<t?Le[q]:0;if(q>=t||(s&192)!==128||i===224&&s<160||i===237&&s>=160)n.push(65533);else if(q++,q>=t||(Le[q]&192)!==128)n.push(65533);else{const o=Le[q++]&63;n.push((i&31)<<12|(s&63)<<6|o)}}else if((i&248)===240){const s=q<t?Le[q]:0;if(i>244||q>=t||(s&192)!==128||i===240&&s<144||i===244&&s>=144)n.push(65533);else if(q++,q>=t||(Le[q]&192)!==128)n.push(65533);else{const o=Le[q++]&63;if(q>=t||(Le[q]&192)!==128)n.push(65533);else{const a=Le[q++]&63;let l=(i&7)<<18|(s&63)<<12|o<<6|a;l-=65536,n.push(l>>>10&1023|55296),n.push(56320|l&1023)}}}else n.push(65533);n.length>=4096&&(e+=Wt.apply(String,n),n.length=0)}return n.length>0&&(e+=Wt.apply(String,n)),e}function Ih(){let r=new Error("Unexpected end of MessagePack data");return r.incomplete=!0,r}function bd(r){if(r>yn-q)throw Ih();let e=new Array(r);for(let t=0;t<r;t++)e[t]=Dt();return vt.freezeData?Object.freeze(e):e}function wd(r){if(r>(yn-q)/2)throw Ih();if(vt.mapsAsObjects){let e={};for(let t=0;t<r;t++){let n=gg();n==="__proto__"&&(n="__proto_"),e[n]=Dt()}return e}else{let e=new Map;for(let t=0;t<r;t++)e.set(Dt(),Dt());return e}}var Wt=String.fromCharCode;function mg(r){let e=q,t=new Array(r);for(let n=0;n<r;n++){const i=Le[q++];if((i&128)>0){q=e;return}t[n]=i}return Wt.apply(String,t)}function Uh(r){if(r<4)if(r<2){if(r===0)return"";{let e=Le[q++];if((e&128)>1){q-=1;return}return Wt(e)}}else{let e=Le[q++],t=Le[q++];if((e&128)>0||(t&128)>0){q-=2;return}if(r<3)return Wt(e,t);let n=Le[q++];if((n&128)>0){q-=3;return}return Wt(e,t,n)}else{let e=Le[q++],t=Le[q++],n=Le[q++],i=Le[q++];if((e&128)>0||(t&128)>0||(n&128)>0||(i&128)>0){q-=4;return}if(r<6){if(r===4)return Wt(e,t,n,i);{let s=Le[q++];if((s&128)>0){q-=5;return}return Wt(e,t,n,i,s)}}else if(r<8){let s=Le[q++],o=Le[q++];if((s&128)>0||(o&128)>0){q-=6;return}if(r<7)return Wt(e,t,n,i,s,o);let a=Le[q++];if((a&128)>0){q-=7;return}return Wt(e,t,n,i,s,o,a)}else{let s=Le[q++],o=Le[q++],a=Le[q++],l=Le[q++];if((s&128)>0||(o&128)>0||(a&128)>0||(l&128)>0){q-=8;return}if(r<10){if(r===8)return Wt(e,t,n,i,s,o,a,l);{let c=Le[q++];if((c&128)>0){q-=9;return}return Wt(e,t,n,i,s,o,a,l,c)}}else if(r<12){let c=Le[q++],f=Le[q++];if((c&128)>0||(f&128)>0){q-=10;return}if(r<11)return Wt(e,t,n,i,s,o,a,l,c,f);let h=Le[q++];if((h&128)>0){q-=11;return}return Wt(e,t,n,i,s,o,a,l,c,f,h)}else{let c=Le[q++],f=Le[q++],h=Le[q++],u=Le[q++];if((c&128)>0||(f&128)>0||(h&128)>0||(u&128)>0){q-=12;return}if(r<14){if(r===12)return Wt(e,t,n,i,s,o,a,l,c,f,h,u);{let d=Le[q++];if((d&128)>0){q-=13;return}return Wt(e,t,n,i,s,o,a,l,c,f,h,u,d)}}else{let d=Le[q++],g=Le[q++];if((d&128)>0||(g&128)>0){q-=14;return}if(r<15)return Wt(e,t,n,i,s,o,a,l,c,f,h,u,d,g);let _=Le[q++];if((_&128)>0){q-=15;return}return Wt(e,t,n,i,s,o,a,l,c,f,h,u,d,g,_)}}}}}function Td(){let r=Le[q++],e;if(r<192)e=r-160;else switch(r){case 217:e=Le[q++];break;case 218:e=lt.getUint16(q),q+=2;break;case 219:e=lt.getUint32(q),q+=4;break;default:throw new Error("Expected string")}return ra(e)}function Uc(r){return vt.copyBuffers?Uint8Array.prototype.slice.call(Le,q,q+=r):Le.subarray(q,q+=r)}function yr(r){let e=Le[q++];if(En[e]){let t;return En[e](Le.subarray(q,t=q+=r),n=>{q=n;try{return Dt()}finally{q=t}})}else throw new Error("Unknown extension type "+e)}var Ad=new Array(4096);function gg(){let r=Le[q++];if(r>=160&&r<192){if(r=r-160,yi>=q)return nr.slice(q-zn,(q+=r)-zn);if(!(yi==0&&yn<180))return Hf(r)}else return q--,_g(Dt());let e=(r<<5^(r>1?lt.getUint16(q):r>0?Le[q]:0))&4095,t=Ad[e],n=q,i=q+r-3,s,o=0;if(t&&t.bytes==r){for(;n<i;){if(s=lt.getUint32(n),s!=t[o++]){n=1879048192;break}n+=4}for(i+=3;n<i;)if(s=Le[n++],s!=t[o++]){n=1879048192;break}if(n===i)return q=n,t.string;i-=3,n=q}for(t=[],Ad[e]=t,t.bytes=r;n<i;)s=lt.getUint32(n),t.push(s),n+=4;for(i+=3;n<i;)s=Le[n++],t.push(s);let a=r<16?Uh(r):mg(r);return a!=null?t.string=a:t.string=Hf(r)}function _g(r){if(typeof r=="string")return r;if(typeof r=="number"||typeof r=="boolean"||typeof r=="bigint")return r.toString();if(r==null)return r+"";if(vt.allowArraysInMapKeys&&Array.isArray(r)&&r.flat().every(e=>["string","number","boolean","bigint"].includes(typeof e)))return r.flat().toString();throw new Error(`Invalid property type for record: ${typeof r}`)}const Rd=(r,e)=>{let t=Dt().map(_g),n=r;e!==void 0&&(r=r<32?-((e<<5)+r):(e<<5)+r,t.highByte=e);let i=ft[r];return i&&(i.isShared||fr)&&((ft.restoreStructures||(ft.restoreStructures=[]))[r]=i),ft[r]=t,t.read=Ph(t,n),(t.read0||t.read)()};En[0]=()=>{};En[0].noBuffer=!0;En[66]=r=>{let e=r.byteLength%8||8,t=BigInt(r[0]&128?r[0]-256:r[0]);for(let n=1;n<e;n++)t<<=BigInt(8),t+=BigInt(r[n]);if(r.byteLength!==e){let n=new DataView(r.buffer,r.byteOffset,r.byteLength),i=(s,o)=>{let a=o-s;if(a<=40){let h=n.getBigUint64(s);for(let u=s+8;u<o;u+=8)h<<=BigInt(64),h|=n.getBigUint64(u);return h}let l=s+(a>>4<<3),c=i(s,l),f=i(l,o);return c<<BigInt((o-l)*8)|f};t=t<<BigInt((n.byteLength-e)*8)|i(e,n.byteLength)}return t};let Cd={Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,AggregateError:typeof AggregateError=="function"?AggregateError:null};En[101]=()=>{let r=Dt();if(!Cd[r[0]]){let e=Error(r[1],{cause:r[2]});return e.name=r[0],e}return Cd[r[0]](r[1],{cause:r[2]})};En[105]=r=>{if(vt.structuredClone===!1)throw new Error("Structured clone extension is disabled");let e=lt.getUint32(q-4);ki||(ki=new Map);let t=Le[q],n;t>=144&&t<160||t==220||t==221?n=[]:t>=128&&t<144||t==222||t==223?n=new Map:(t>=199&&t<=201||t>=212&&t<=216)&&Le[q+1]===115?n=new Set:n={};let i={target:n};ki.set(e,i);let s=Dt();if(i.used)Object.assign(n,s);else return i.target=s;if(n instanceof Map)for(let[o,a]of s.entries())n.set(o,a);if(n instanceof Set)for(let o of Array.from(s))n.add(o);return n};En[112]=r=>{if(vt.structuredClone===!1)throw new Error("Structured clone extension is disabled");let e=lt.getUint32(q-4),t=ki.get(e);return t.used=!0,t.target};En[115]=()=>new Set(Dt());const vg=["Int8","Uint8","Uint8Clamped","Int16","Uint16","Int32","Uint32","Float32","Float64","BigInt64","BigUint64"].map(r=>r+"Array");let rM=typeof globalThis=="object"?globalThis:window;En[116]=r=>{let e=r[0],t=Uint8Array.prototype.slice.call(r,1).buffer,n=vg[e];if(!n){if(e===16)return t;if(e===17)return new DataView(t);throw new Error("Could not find typed array for code "+e)}return new rM[n](t)};En[120]=()=>{let r=Dt();return new RegExp(r[0],r[1])};const sM=[];En[98]=r=>{let e=(r[0]<<24)+(r[1]<<16)+(r[2]<<8)+r[3],t=q;return q+=e-r.length,Xt=sM,Xt=[Td(),Td()],Xt.position0=0,Xt.position1=0,Xt.postBundlePosition=q,q=t,Dt()};En[255]=r=>r.length==4?new Date((r[0]*16777216+(r[1]<<16)+(r[2]<<8)+r[3])*1e3):r.length==8?new Date(((r[0]<<22)+(r[1]<<14)+(r[2]<<6)+(r[3]>>2))/1e6+((r[3]&3)*4294967296+r[4]*16777216+(r[5]<<16)+(r[6]<<8)+r[7])*1e3):r.length==12?new Date(((r[0]<<24)+(r[1]<<16)+(r[2]<<8)+r[3])/1e6+((r[4]&128?-281474976710656:0)+r[6]*1099511627776+r[7]*4294967296+r[8]*16777216+(r[9]<<16)+(r[10]<<8)+r[11])*1e3):new Date("invalid");function xg(r){vt&&vt._onSaveState&&vt._onSaveState();let e=yn,t=q,n=zn,i=yi,s=nr,o=ki,a=Xt,l=new Uint8Array(Le.slice(0,yn)),c=ft,f=ft.slice(0,ft.length),h=vt,u=fr,d=r();return yn=e,q=t,zn=n,yi=i,nr=s,ki=o,Xt=a,Le=l,fr=u,ft=c,ft.splice(0,ft.length,...f),vt=h,lt=new DataView(Le.buffer,Le.byteOffset,Le.byteLength),d}function Wf(){Le=null,ki=null,ft=null}const Lh=new Array(147);for(let r=0;r<256;r++)Lh[r]=+("1e"+Math.floor(45.15-r*.30103));var Dl=new zs({useRecords:!1});const Dd=Dl.unpack;Dl.unpackMultiple;Dl.unpack;let oM=new Float32Array(1);new Uint8Array(oM.buffer,0,4);zs.SUPPORTS_STRUCT_HOOKS=!0;let Za;try{Za=new TextEncoder}catch{}let Xf,$f;const Gs=typeof Buffer!="undefined",Ha=Gs?function(r){return Buffer.allocUnsafeSlow(r)}:Uint8Array,yg=Gs?Buffer:Uint8Array,Pd=Gs?4294967296:2144337920;let oe,_o,Mt,Q=0,nn,Rt=null;const aM=21760,lM=/[\u0080-\uFFFF]/,gs=Symbol("record-id");class Fh extends zs{constructor(e){super(e),this.offset=0;let t,n,i,s,o=yg.prototype.utf8Write?function(M,P){return oe.utf8Write(M,P,oe.byteLength-P)}:Za&&Za.encodeInto?function(M,P){return Za.encodeInto(M,oe.subarray(P)).written}:!1,a=this;e||(e={});let l=e&&e.sequential,c=e.structures||e.saveStructures,f=e.maxSharedStructures;if(f==null&&(f=c?32:0),f>8160)throw new Error("Maximum maxSharedStructure is 8160");e.structuredClone&&e.moreTypes==null&&(this.moreTypes=!0);let h=e.maxOwnStructures;h==null&&(h=c?32:64),!this.structures&&e.useRecords!=!1&&(this.structures=[]);let u=f>32||h+f>64,d=f+64,g=f+h+64;if(g>8256)throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");let _=[],m=0,p=0;this.pack=this.encode=function(M,P){if(oe||(oe=new Ha(8192),Mt=oe.dataView||(oe.dataView=new DataView(oe.buffer,0,8192)),Q=0),nn=oe.length-10,nn-Q<2048?(oe=new Ha(oe.length),Mt=oe.dataView||(oe.dataView=new DataView(oe.buffer,0,oe.length)),nn=oe.length-10,Q=0):Q=Q+7&2147483640,t=Q,P&Qa&&(Q+=P&255),s=a.structuredClone?new Map:null,a.bundleStrings&&typeof M!="string"?(Rt=[],Rt.size=1/0):Rt=null,i=a.structures,i){i.uninitialized&&(i=a._mergeStructures(a.getStructures()));let U=i.sharedLength||0;if(U>f)throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to "+i.sharedLength);if(!i.transitions){i.transitions=Object.create(null);for(let B=0;B<U;B++){let z=i[B];if(!z)continue;let X,V=i.transitions;for(let N=0,$=z.length;N<$;N++){let ne=z[N];X=V[ne],X||(X=V[ne]=Object.create(null)),V=X}V[gs]=B+64}this.lastNamedStructuresLength=U}l||(i.nextId=U+64)}n&&(n=!1);let O;try{a._writeStruct&&M&&typeof M=="object"?M.constructor===Object?S(M):M.constructor!==Map&&!Array.isArray(M)&&!$f.some(B=>M instanceof B)?S(a.useToJSON!==!1&&M.toJSON?M.toJSON():M):v(M):v(M);let U=Rt;if(Rt&&Ud(t,v,0),s&&s.idsToInsert){let B=s.idsToInsert.sort((N,$)=>N.offset>$.offset?1:-1),z=B.length,X=-1;for(;U&&z>0;){let N=B[--z].offset+t;N<U.stringsPosition+t&&X===-1&&(X=0),N>U.position+t?X>=0&&(X+=6):(X>=0&&(Mt.setUint32(U.position+t,Mt.getUint32(U.position+t)+X),X=-1),U=U.previous,z++)}X>=0&&U&&Mt.setUint32(U.position+t,Mt.getUint32(U.position+t)+X),Q+=B.length*6,Q>nn&&x(Q),a.offset=Q;let V=cM(oe.subarray(t,Q),B);return s=null,V}return a.offset=Q,P&hM?(oe.start=t,oe.end=Q,oe):oe.subarray(t,Q)}catch(U){throw O=U,U}finally{if(i&&(y(),n&&a.saveStructures)){let U=i.sharedLength||0,B=oe.subarray(t,Q),z=(a._prepareStructures||fM)(i,a);if(!O)return a.saveStructures(z,z.isCompatible)===!1?(i.uninitialized=!0,a.pack(M,P)):(a.lastNamedStructuresLength=U,oe.length>1073741824&&(oe=null),B)}oe.length>1073741824&&(oe=null),P&uM&&(Q=t)}};const y=()=>{p<10&&p++;let M=i.sharedLength||0;if(i.length>M&&!l&&(i.length=M),m>1e4)i.transitions=null,p=0,m=0,_.length>0&&(_=[]);else if(_.length>0&&!l){for(let P=0,O=_.length;P<O;P++)_[P][gs]=0;_=[]}},E=M=>{var P=M.length;P<16?oe[Q++]=144|P:P<65536?(oe[Q++]=220,oe[Q++]=P>>8,oe[Q++]=P&255):(oe[Q++]=221,Mt.setUint32(Q,P),Q+=4);for(let O=0;O<P;O++)v(M[O])},v=M=>{Q>nn&&(oe=x(Q));var P=typeof M,O;if(P==="string"){let U=M.length;if(Rt&&U>=4&&U<4096){if((Rt.size+=U)>aM){let V,N=(Rt[0]?Rt[0].length*3+Rt[1].length:0)+10;Q+N>nn&&(oe=x(Q+N));let $;Rt.position?($=Rt,oe[Q]=200,Q+=3,oe[Q++]=98,V=Q-t,Q+=4,Ud(t,v,0),Mt.setUint16(V+t-3,Q-t-V)):(oe[Q++]=214,oe[Q++]=98,V=Q-t,Q+=4),Rt=["",""],Rt.previous=$,Rt.size=0,Rt.position=V}let X=lM.test(M);Rt[X?0:1]+=M,oe[Q++]=193,v(X?-U:U);return}let B;U<32?B=1:U<256?B=2:U<65536?B=3:B=5;let z=U*3;if(Q+z>nn&&(oe=x(Q+z)),U<64||!o){let X,V,N,$=Q+B;for(X=0;X<U;X++)V=M.charCodeAt(X),V<128?oe[$++]=V:V<2048?(oe[$++]=V>>6|192,oe[$++]=V&63|128):(V&64512)===55296&&((N=M.charCodeAt(X+1))&64512)===56320?(V=65536+((V&1023)<<10)+(N&1023),X++,oe[$++]=V>>18|240,oe[$++]=V>>12&63|128,oe[$++]=V>>6&63|128,oe[$++]=V&63|128):(oe[$++]=V>>12|224,oe[$++]=V>>6&63|128,oe[$++]=V&63|128);O=$-Q-B}else O=o(M,Q+B);O<32?oe[Q++]=160|O:O<256?(B<2&&oe.copyWithin(Q+2,Q+1,Q+1+O),oe[Q++]=217,oe[Q++]=O):O<65536?(B<3&&oe.copyWithin(Q+3,Q+2,Q+2+O),oe[Q++]=218,oe[Q++]=O>>8,oe[Q++]=O&255):(B<5&&oe.copyWithin(Q+5,Q+3,Q+3+O),oe[Q++]=219,Mt.setUint32(Q,O),Q+=4),Q+=O}else if(P==="number")if(M>>>0===M)M<32||M<128&&this.useRecords===!1||M<64&&!this._writeStruct?oe[Q++]=M:M<256?(oe[Q++]=204,oe[Q++]=M):M<65536?(oe[Q++]=205,oe[Q++]=M>>8,oe[Q++]=M&255):(oe[Q++]=206,Mt.setUint32(Q,M),Q+=4);else if(M>>0===M)M>=-32?oe[Q++]=256+M:M>=-128?(oe[Q++]=208,oe[Q++]=M+256):M>=-32768?(oe[Q++]=209,Mt.setInt16(Q,M),Q+=2):(oe[Q++]=210,Mt.setInt32(Q,M),Q+=4);else{let U;if((U=this.useFloat32)>0&&M<4294967296&&M>=-2147483648){oe[Q++]=202,Mt.setFloat32(Q,M);let B;if(U<4||(B=M*Lh[(oe[Q]&127)<<1|oe[Q+1]>>7])>>0===B){Q+=4;return}else Q--}oe[Q++]=203,Mt.setFloat64(Q,M),Q+=8}else if(P==="object"||P==="function")if(!M)oe[Q++]=192;else{if(s){let B=s.get(M);if(B){if(!B.id){let z=s.idsToInsert||(s.idsToInsert=[]);B.id=z.push(B)}oe[Q++]=214,oe[Q++]=112,Mt.setUint32(Q,B.id),Q+=4;return}else s.set(M,{offset:Q-t})}let U=M.constructor;if(U===Object)w(M);else if(U===Array)E(M);else if(U===Map)if(this.mapAsEmptyObject)oe[Q++]=128;else{O=M.size,O<16?oe[Q++]=128|O:O<65536?(oe[Q++]=222,oe[Q++]=O>>8,oe[Q++]=O&255):(oe[Q++]=223,Mt.setUint32(Q,O),Q+=4);for(let[B,z]of M)v(B),v(z)}else{for(let B=0,z=Xf.length;B<z;B++){let X=$f[B];if(M instanceof X){let V=Xf[B];if(V.write){V.type&&(oe[Q++]=212,oe[Q++]=V.type,oe[Q++]=0);let H=V.write.call(this,M);H===M?Array.isArray(M)?E(M):w(M):v(H);return}let N=oe,$=Mt,ne=Q;oe=null;let k;try{k=V.pack.call(this,M,H=>(oe=N,N=null,Q+=H,Q>nn&&x(Q),{target:oe,targetView:Mt,position:Q-H}),v)}finally{N&&(oe=N,Mt=$,Q=ne,nn=oe.length-10)}k&&(k.length+Q>nn&&x(k.length+Q),Q=Id(k,oe,Q,V.type));return}}if(Array.isArray(M))E(M);else{if(a.useToJSON!==!1&&M.toJSON){const B=M.toJSON();if(B!==M)return v(B)}if(P==="function")return v(this.writeFunction&&this.writeFunction(M));w(M)}}}else if(P==="boolean")oe[Q++]=M?195:194;else if(P==="bigint"){if(M<9223372036854776e3&&M>=-9223372036854776e3)oe[Q++]=211,Mt.setBigInt64(Q,M);else if(M<18446744073709552e3&&M>0)oe[Q++]=207,Mt.setBigUint64(Q,M);else if(this.largeBigIntToFloat)oe[Q++]=203,Mt.setFloat64(Q,Number(M));else{if(this.largeBigIntToString)return v(M.toString());if(this.useBigIntExtension||this.moreTypes){let U=M<0?BigInt(-1):BigInt(0),B;if(M>>BigInt(65536)===U){let z=BigInt(18446744073709552e3)-BigInt(1),X=[];for(;X.push(M&z),M>>BigInt(63)!==U;)M>>=BigInt(64);B=new Uint8Array(new BigUint64Array(X).buffer),B.reverse()}else{let z=M<0,X=(z?~M:M).toString(16);if(X.length%2?X="0"+X:parseInt(X.charAt(0),16)>=8&&(X="00"+X),Gs)B=Buffer.from(X,"hex");else{B=new Uint8Array(X.length/2);for(let V=0;V<B.length;V++)B[V]=parseInt(X.slice(V*2,V*2+2),16)}if(z)for(let V=0;V<B.length;V++)B[V]=~B[V]}B.length+Q>nn&&x(B.length+Q),Q=Id(B,oe,Q,66);return}else throw new RangeError(M+" was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string")}Q+=8}else if(P==="undefined")this.encodeUndefinedAsNil?oe[Q++]=192:(oe[Q++]=212,oe[Q++]=0,oe[Q++]=0);else throw new Error("Unknown type: "+P)},C=this.variableMapSize||this.coercibleKeyAsNumber||this.skipValues?M=>{let P;if(this.skipValues){P=[];for(let B in M)(typeof M.hasOwnProperty!="function"||M.hasOwnProperty(B))&&!this.skipValues.includes(M[B])&&P.push(B)}else P=Object.keys(M);let O=P.length;O<16?oe[Q++]=128|O:O<65536?(oe[Q++]=222,oe[Q++]=O>>8,oe[Q++]=O&255):(oe[Q++]=223,Mt.setUint32(Q,O),Q+=4);let U;if(this.coercibleKeyAsNumber)for(let B=0;B<O;B++){U=P[B];let z=Number(U);v(isNaN(z)?U:z),v(M[U])}else for(let B=0;B<O;B++)v(U=P[B]),v(M[U])}:M=>{oe[Q++]=222;let P=Q-t;Q+=2;let O=0;for(let U in M)(typeof M.hasOwnProperty!="function"||M.hasOwnProperty(U))&&(v(U),v(M[U]),O++);if(O>65535)throw new Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');oe[P+++t]=O>>8,oe[P+t]=O&255},R=this.useRecords===!1?C:e.progressiveRecords&&!u?M=>{let P,O=i.transitions||(i.transitions=Object.create(null)),U=Q++-t,B;for(let z in M)if(typeof M.hasOwnProperty!="function"||M.hasOwnProperty(z)){if(P=O[z],P)O=P;else{let X=Object.keys(M),V=O;O=i.transitions;let N=0;for(let $=0,ne=X.length;$<ne;$++){let k=X[$];P=O[k],P||(P=O[k]=Object.create(null),N++),O=P}U+t+1==Q?(Q--,F(O,X,N)):I(O,X,U,N),B=!0,O=V[z]}v(M[z])}if(!B){let z=O[gs];z?oe[U+t]=z:I(O,Object.keys(M),U,0)}}:M=>{let P,O=i.transitions||(i.transitions=Object.create(null)),U=0;for(let z in M)(typeof M.hasOwnProperty!="function"||M.hasOwnProperty(z))&&(P=O[z],P||(P=O[z]=Object.create(null),U++),O=P);let B=O[gs];B?B>=96&&u?(oe[Q++]=((B-=96)&31)+96,oe[Q++]=B>>5):oe[Q++]=B:F(O,O.__keys__||Object.keys(M),U);for(let z in M)(typeof M.hasOwnProperty!="function"||M.hasOwnProperty(z))&&v(M[z])},T=typeof this.useRecords=="function"&&this.useRecords,w=T?M=>{T(M)?R(M):C(M)}:R,S=M=>{let P=a._writeStruct(M,oe,t,Q,i,x,(O,U,B)=>{if(B)return n=!0;Q=U;let z=oe;return v(O),y(),z!==oe?{position:Q,targetView:Mt,target:oe}:Q});if(P===0)return w(M);Q=P},x=M=>{let P;if(M>16777216){if(M-t>Pd)throw new Error("Packed buffer would be larger than maximum buffer size");P=Math.min(Pd,Math.round(Math.max((M-t)*(M>67108864?1.25:2),4194304)/4096)*4096)}else P=(Math.max(M-t<<2,oe.length-1)>>12)+1<<12;let O=new Ha(P);return Mt=O.dataView||(O.dataView=new DataView(O.buffer,0,P)),M=Math.min(M,oe.length),oe.copy?oe.copy(O,0,t,M):O.set(oe.slice(t,M)),Q-=t,t=0,nn=O.length-10,oe=O},F=(M,P,O)=>{let U=i.nextId;U||(U=64),U<d&&this.shouldShareStructure&&!this.shouldShareStructure(P)?(U=i.nextOwnId,U<g||(U=d),i.nextOwnId=U+1):(U>=g&&(U=d),i.nextId=U+1);let B=P.highByte=U>=96&&u?U-96>>5:-1;M[gs]=U,M.__keys__=P,i[U-64]=P,U<d?(P.isShared=!0,i.sharedLength=U-63,n=!0,B>=0?(oe[Q++]=(U&31)+96,oe[Q++]=B):oe[Q++]=U):(B>=0?(oe[Q++]=213,oe[Q++]=114,oe[Q++]=(U&31)+96,oe[Q++]=B):(oe[Q++]=212,oe[Q++]=114,oe[Q++]=U),O&&(m+=p*O),_.length>=h&&(_.shift()[gs]=0),_.push(M),v(P))},I=(M,P,O,U)=>{let B=oe,z=Q,X=nn,V=t;oe=_o,Q=0,t=0,oe||(_o=oe=new Ha(8192)),nn=oe.length-10,F(M,P,U),_o=oe;let N=Q;if(oe=B,Q=z,nn=X,t=V,N>1){let $=Q+N-1;$>nn&&x($);let ne=O+t;oe.copyWithin(ne+N,ne+1,Q),oe.set(_o.slice(0,N),ne),Q=$}else oe[O+t]=_o[0]}}useBuffer(e){oe=e,oe.dataView||(oe.dataView=new DataView(oe.buffer,oe.byteOffset,oe.byteLength)),Mt=oe.dataView,Q=0}set position(e){Q=e}get position(){return Q}clearSharedData(){this.structures&&(this.structures=[]),this.typedStructs&&(this.typedStructs=[])}}$f=[Date,Set,Error,RegExp,ArrayBuffer,Object.getPrototypeOf(Uint8Array.prototype).constructor,DataView,ug];Xf=[{pack(r,e,t){let n=r.getTime()/1e3;if((this.useTimestamp32||r.getMilliseconds()===0)&&n>=0&&n<4294967296){let{target:i,targetView:s,position:o}=e(6);i[o++]=214,i[o++]=255,s.setUint32(o,n)}else if(n>0&&n<4294967296){let{target:i,targetView:s,position:o}=e(10);i[o++]=215,i[o++]=255,s.setUint32(o,r.getMilliseconds()*4e6+(n/1e3/4294967296>>0)),s.setUint32(o+4,n)}else if(isNaN(n)){if(this.onInvalidDate)return e(0),t(this.onInvalidDate());let{target:i,targetView:s,position:o}=e(3);i[o++]=212,i[o++]=255,i[o++]=255}else{let{target:i,targetView:s,position:o}=e(15);i[o++]=199,i[o++]=12,i[o++]=255,s.setUint32(o,r.getMilliseconds()*1e6),s.setBigInt64(o+4,BigInt(Math.floor(n)))}}},{pack(r,e,t){if(this.setAsEmptyObject)return e(0),t({});let n=Array.from(r),{target:i,position:s}=e(this.moreTypes?3:0);this.moreTypes&&(i[s++]=212,i[s++]=115,i[s++]=0),t(n)}},{pack(r,e,t){let{target:n,position:i}=e(this.moreTypes?3:0);this.moreTypes&&(n[i++]=212,n[i++]=101,n[i++]=0),t([r.name,r.message,r.cause])}},{pack(r,e,t){let{target:n,position:i}=e(this.moreTypes?3:0);this.moreTypes&&(n[i++]=212,n[i++]=120,n[i++]=0),t([r.source,r.flags])}},{pack(r,e){this.moreTypes?Lc(r,16,e):Fc(Gs?Buffer.from(r):new Uint8Array(r),e)}},{pack(r,e){let t=r.constructor;t!==yg&&this.moreTypes?Lc(r,vg.indexOf(t.name),e):Fc(r,e)}},{pack(r,e){this.moreTypes?Lc(r,17,e):Fc(Gs?Buffer.from(r):new Uint8Array(r),e)}},{pack(r,e){let{target:t,position:n}=e(1);t[n]=193}}];function Lc(r,e,t,n){let i=r.byteLength;if(i+1<256){var{target:s,position:o}=t(4+i);s[o++]=199,s[o++]=i+1}else if(i+1<65536){var{target:s,position:o}=t(5+i);s[o++]=200,s[o++]=i+1>>8,s[o++]=i+1&255}else{var{target:s,position:o,targetView:a}=t(7+i);s[o++]=201,a.setUint32(o,i+1),o+=4}s[o++]=116,s[o++]=e,r.buffer||(r=new Uint8Array(r)),s.set(new Uint8Array(r.buffer,r.byteOffset,r.byteLength),o)}function Fc(r,e){let t=r.byteLength;var n,i;if(t<256){var{target:n,position:i}=e(t+2);n[i++]=196,n[i++]=t}else if(t<65536){var{target:n,position:i}=e(t+3);n[i++]=197,n[i++]=t>>8,n[i++]=t&255}else{var{target:n,position:i,targetView:s}=e(t+5);n[i++]=198,s.setUint32(i,t),i+=4}n.set(r,i)}function Id(r,e,t,n){let i=r.length;switch(i){case 1:e[t++]=212;break;case 2:e[t++]=213;break;case 4:e[t++]=214;break;case 8:e[t++]=215;break;case 16:e[t++]=216;break;default:i<256?(e[t++]=199,e[t++]=i):i<65536?(e[t++]=200,e[t++]=i>>8,e[t++]=i&255):(e[t++]=201,e[t++]=i>>24,e[t++]=i>>16&255,e[t++]=i>>8&255,e[t++]=i&255)}return e[t++]=n,e.set(r,t),t+=i,t}function cM(r,e){let t,n=e.length*6,i=r.length-n;for(;t=e.pop();){let s=t.offset,o=t.id;r.copyWithin(s+n,s,i),n-=6;let a=s+n;r[a++]=214,r[a++]=105,r[a++]=o>>24,r[a++]=o>>16&255,r[a++]=o>>8&255,r[a++]=o&255,i=s}return r}function Ud(r,e,t){if(Rt.length>0){Mt.setUint32(Rt.position+r,Q+t-Rt.position-r),Rt.stringsPosition=Q-r;let n=Rt;Rt=null,e(n[0]),e(n[1])}}function fM(r,e){return r.isCompatible=t=>{let n=!t||(e.lastNamedStructuresLength||0)===t.length;return n||e._mergeStructures(t),n},r}Fh.SUPPORTS_STRUCT_HOOKS=!0;let Sg=new Fh({useRecords:!1});Sg.pack;Sg.pack;const hM=512,uM=1024,Qa=2048,dM=9;class Ld{constructor(){L(this,"pending",new Uint8Array(0))}push(e){if(!e||e.byteLength===0)return[];const t=this.pending.byteLength===0?e:pM(this.pending,e),n=[];let i=0;for(;i<t.byteLength;){const s={offset:i};let o;try{o=ut.number(t,s)}catch(l){if(t.byteLength-i<=dM)break;throw l}const a=s.offset+o;if(a>t.byteLength)break;n.push(t.subarray(s.offset,a)),i=a}return this.pending=i<t.byteLength?t.slice(i):new Uint8Array(0),n}}function pM(r,e){const t=new Uint8Array(r.byteLength+e.byteLength);return t.set(r,0),t.set(e,r.byteLength),t}class Fd{constructor(e){L(this,"wt");L(this,"url");L(this,"isOpen",!1);L(this,"events");L(this,"reader");L(this,"writer");L(this,"unreliableReader");L(this,"unreliableWriter");L(this,"lengthPrefixBuffer",new Uint8Array(9));L(this,"reliableReassembler",new Ld);L(this,"unreliableReassembler",new Ld);this.events=e}connect(e,t={}){this.url=e;const n=t.fingerprint&&{serverCertificateHashes:[{algorithm:"sha-256",value:new Uint8Array(t.fingerprint)}]}||void 0;this.wt=new WebTransport(e,n),this.wt.ready.then(i=>{console.log("WebTransport ready!",i),this.isOpen=!0,this.unreliableReader=this.wt.datagrams.readable.getReader();const s=this.wt.datagrams;this.unreliableWriter=(s.createWritable?s.createWritable():s.writable).getWriter(),this.wt.incomingBidirectionalStreams.getReader().read().then(a=>{this.reader=a.value.readable.getReader(),this.writer=a.value.writable.getWriter(),this.sendSeatReservation(t.roomId,t.sessionId,t.reconnectionToken,t.skipHandshake),this.readIncomingData(),this.readIncomingUnreliableData()}).catch(a=>{console.error("failed to read incoming stream",a),console.error("TODO: close the connection")})}).catch(i=>{console.log("WebTransport not ready!",i),this._close()}),this.wt.closed.then(i=>{console.log("WebTransport closed w/ success",i),this.events.onclose({code:i.closeCode,reason:i.reason})}).catch(i=>{console.log("WebTransport closed w/ error",i),this.events.onerror(i),this.events.onclose({code:i.closeCode,reason:i.reason})}).finally(()=>{this._close()})}send(e){this.writer.write(this.frame(e))}sendUnreliable(e){this.unreliableWriter.write(this.frame(e))}frame(e){const t=e instanceof Uint8Array?e:new Uint8Array(e),n=rt.number(this.lengthPrefixBuffer,t.length,{offset:0}),i=new Uint8Array(n+t.length);return i.set(this.lengthPrefixBuffer.subarray(0,n),0),i.set(t,n),i}close(e,t){var n;this.isOpen=!1;try{const i=(n=this.wt)==null?void 0:n.close({closeCode:e,reason:t});i&&typeof i.catch=="function"&&i.catch(()=>{})}catch{}}async readIncomingData(){let e;for(;this.isOpen;){try{if(e=await this.reader.read(),e.done||!e.value)break;for(const t of this.reliableReassembler.push(e.value))this.events.onmessage({data:t})}catch(t){t.message.indexOf("session is closed")===-1&&console.error("H3Transport: failed to read incoming data",t);break}if(e.done)break}}async readIncomingUnreliableData(){let e;for(;this.isOpen;){try{if(e=await this.unreliableReader.read(),e.done||!e.value)break;for(const t of this.unreliableReassembler.push(e.value))this.events.onmessage({data:t})}catch(t){t.message.indexOf("session is closed")===-1&&console.error("H3Transport: failed to read incoming data",t);break}if(e.done)break}}sendSeatReservation(e,t,n,i){const s={offset:0},o=[];rt.string(o,e,s),rt.string(o,t,s),n&&rt.string(o,n,s),i&&rt.boolean(o,1,s),this.writer.write(new Uint8Array(o).buffer)}_close(){this.isOpen=!1}}function mM(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var gM=function(){throw new Error("ws does not work in the browser. Browser clients must use the native WebSocket object")};const _M=mM(gM),Nc=globalThis.WebSocket||_M;let Nd=!1;class vM{constructor(e){L(this,"ws");L(this,"protocols");L(this,"events");this.events=e}send(e){this.ws.send(e)}sendUnreliable(e){Nd||(Nd=!0,console.warn('@colyseus/sdk: the WebSocket transport has no unreliable channel — sending `mode:"unreliable"` traffic reliably instead. Use @colyseus/h3-transport (WebTransport) for datagram delivery.')),this.send(e)}connect(e,t){try{this.ws=new Nc(e,{headers:t,protocols:this.protocols})}catch{this.ws=new Nc(e,this.protocols)}this.ws.binaryType="arraybuffer",this.ws.onopen=n=>{var i,s;return(s=(i=this.events).onopen)==null?void 0:s.call(i,n)},this.ws.onmessage=n=>{var i,s;return(s=(i=this.events).onmessage)==null?void 0:s.call(i,n)},this.ws.onclose=n=>{var i,s;return(s=(i=this.events).onclose)==null?void 0:s.call(i,n)},this.ws.onerror=n=>{var i,s;return(s=(i=this.events).onerror)==null?void 0:s.call(i,n)}}close(e,t){e===mi.MAY_TRY_RECONNECT&&this.events.onclose&&(this.ws.onclose=null,this.events.onclose({code:e,reason:t})),this.ws.close(e,t)}get isOpen(){return this.ws.readyState===Nc.OPEN}}const Ao=[],jf=typeof addEventListener=="function"&&typeof removeEventListener=="function";jf&&addEventListener("offline",()=>{console.warn(`@colyseus/sdk: 🛑 Network offline. Closing ${Ao.length} connection(s)`),Ao.forEach(r=>r())},!1);var Xo;class Eg{constructor(e){L(this,"transport");L(this,"events",{});L(this,"url");L(this,"options");At(this,Xo,jf?()=>this.close(mi.MAY_TRY_RECONNECT):null);switch(e){case"h3":this.transport=new Fd(this.events);break;default:this.transport=new vM(this.events);break}}connect(e,t){if(jf){const n=this.events.onopen;this.events.onopen=s=>{Ao.push(Je(this,Xo)),n==null||n(s)};const i=this.events.onclose;this.events.onclose=s=>{Ao.splice(Ao.indexOf(Je(this,Xo)),1),i==null||i(s)}}this.url=e,this.options=t,this.transport.connect(e,t)}send(e){this.transport.send(e)}sendUnreliable(e){this.transport.sendUnreliable(e)}reconnect(e){if(this.transport instanceof Fd){this.transport.connect(this.url,{...this.options,...e});return}const t=new URL(this.url);for(const n in e)t.searchParams.set(n,e[n]);this.transport.connect(t.toString(),this.options)}close(e,t){this.transport.close(e,t)}get isOpen(){return this.transport.isOpen}}Xo=new WeakMap;const Mg={};function bg(r,e){Mg[r]=e}function Od(r){const e=Mg[r];if(!e)throw new Error("missing serializer: "+r);return e}const wg=()=>({emit(r,...e){let t=this.events[r]||[];for(let n=0,i=t.length;n<i;n++)t[n](...e)},events:{},on(r,e){var t;return(t=this.events[r])!=null&&t.push(e)||(this.events[r]=[e]),()=>{var n;this.events[r]=(n=this.events[r])==null?void 0:n.filter(i=>e!==i)}}});class xM{constructor(){L(this,"handlers",[])}register(e,t=!1){return this.handlers.push(e),this}invoke(...e){this.handlers.forEach(t=>t.apply(this,e))}invokeAsync(...e){return Promise.all(this.handlers.map(t=>t.apply(this,e)))}remove(e){const t=this.handlers.indexOf(e);this.handlers[t]=this.handlers[this.handlers.length-1],this.handlers.pop()}clear(){this.handlers=[]}}function _s(){const r=new xM;function e(t){return r.register(t,this===null)}return e.once=t=>{const n=function(...i){t.apply(this,i),r.remove(n)};r.register(n)},e.remove=t=>r.remove(t),e.invoke=(...t)=>r.invoke(...t),e.invokeAsync=(...t)=>r.invokeAsync(...t),e.clear=()=>r.clear(),e}class Tg{constructor(){L(this,"state");L(this,"decoder")}setState(e,t){this.decoder.root.refs.size>1&&typeof this.decoder.decodeResync=="function"?this.decoder.decodeResync(e,t):this.decoder.decode(e,t)}getState(){return this.state}patch(e,t){return this.decoder.decode(e,t)}teardown(){this.decoder.root.clearRefs()}handshake(e,t){this.state?(Hi.decode(e,t),this.decoder=new ul(this.state)):(this.decoder=Hi.decode(e,t),this.state=this.decoder.state)}}function yM(){return{enabled:!0,retryCount:0,maxRetries:15,delay:100,minDelay:100,maxDelay:5e3,minUptime:5e3,backoff:SM,maxEnqueuedMessages:10,enqueuedMessages:[],isReconnecting:!1}}const SM=(r,e)=>Math.floor(Math.pow(2,r)*e);function Oc(r,e){r.reconnection.enqueuedMessages.push({data:e}),r.reconnection.enqueuedMessages.length>r.reconnection.maxEnqueuedMessages&&r.reconnection.enqueuedMessages.shift()}function EM(r,e){var n;if(!e){const i=new Error("request rejected");return i.name="rejected",i.reason=r,i}const t=new Error((n=r==null?void 0:r.message)!=null?n:"request failed");return r!=null&&r.name&&(t.name=r.name),(r==null?void 0:r.code)!==void 0&&(t.code=r.code),t}var $o,Rs,Cs,gi,_i,Ds,Mi,Ag,Rg,Cg,Dg;const gl=class gl{constructor(e,t){At(this,Mi);L(this,"roomId");L(this,"sessionId");L(this,"reconnectionToken");L(this,"name");L(this,"connection");L(this,"onStateChange",_s());L(this,"onError",_s());L(this,"onLeave",_s());L(this,"onReconnect",_s());L(this,"onDrop",_s());L(this,"onJoin",_s());L(this,"serializerId");L(this,"serializer");L(this,"reconnection",yM());L(this,"joinedAtTime",0);L(this,"clock",fg);L(this,"onMessageHandlers",wg());L(this,"packr");L(this,"sharedBuffer");At(this,$o,0);At(this,Rs);At(this,Cs,0);At(this,gi,new Map);At(this,_i);At(this,Ds,0);if(this.name=e,this.packr=new Fh,this.sharedBuffer=new Uint8Array(8192),t){const n=new(Od("schema"));this.serializer=n;const i=new t;n.state=i,n.decoder=new ul(i)}this.onLeave(()=>{this.removeAllListeners(),this.destroy()})}connect(e,t,n){var s;this.connection=new Eg(t.protocol),this.connection.events.onmessage=this.onMessageCallback.bind(this),this.connection.events.onclose=o=>{var a;if(ts(this,Mi,Cg).call(this,"connection closed before a response was received."),this.joinedAtTime===0){(a=console.warn)==null||a.call(console,`Room connection was closed unexpectedly (${o.code}): ${o.reason}`),this.onError.invoke(o.code,o.reason);return}o.code===mi.NO_STATUS_RECEIVED||o.code===mi.ABNORMAL_CLOSURE||o.code===mi.GOING_AWAY||o.code===mi.MAY_TRY_RECONNECT?(this.onDrop.invoke(o.code,o.reason),this.handleReconnection(o.code,o.reason)):this.onLeave.invoke(o.code,o.reason)},this.connection.events.onerror=o=>{this.onError.invoke(o.code,o.reason)};const i=((s=this.serializer)==null?void 0:s.getState())!==void 0;if(t.protocol==="h3"){const o=new URL(e);this.connection.connect(o.origin,{...t,skipHandshake:i})}else this.connection.connect(`${e}${i?"&skipHandshake=1":""}`,n)}leave(e=!0){return new Promise(t=>{this.onLeave(n=>t(n)),this.connection?e?(this.sharedBuffer[0]=Nt.LEAVE_ROOM,this.connection.send(this.sharedBuffer.subarray(0,1))):this.connection.close():this.onLeave.invoke(mi.CONSENTED)})}onMessage(e,t){return this.onMessageHandlers.on(this.getMessageHandlerKey(e),t)}ping(e){var t;(t=this.connection)!=null&&t.isOpen&&(wt(this,$o,ni()),wt(this,Rs,e),this.sharedBuffer[0]=Nt.PING,this.connection.send(this.sharedBuffer.subarray(0,1)))}send(e,t,n){if(n!==void 0){this.request(e,t).then(a=>n(a,void 0),a=>n(void 0,a));return}const i={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA,typeof e=="string"?rt.string(this.sharedBuffer,e,i):rt.number(this.sharedBuffer,e,i);const s=i.offset;let o;t!==void 0?(o=this.packr.pack(t,Qa|s),o.set(this.sharedBuffer.subarray(0,s),0)):o=this.sharedBuffer.subarray(0,s),this.connection.isOpen?this.connection.send(o):Oc(this,new Uint8Array(o))}request(e,t,n){var s;if(!this.connection.isOpen)return Promise.reject(new Error(`cannot send request "${e}": connection is not open.`));const i=(s=n==null?void 0:n.timeout)!=null?s:gl.defaultRequestTimeout;return new Promise((o,a)=>{let l;const c=this.sendRequest(e,t,{mode:n==null?void 0:n.mode},(f,h,u)=>{clearTimeout(l),f?o(h):a(EM(h,u))},f=>{clearTimeout(l),a(new Error(f))});l=setTimeout(()=>{this.cancelRequest(c),a(new Error(`request "${e}" timed out after ${i}ms.`))},i)})}sendRequest(e,t,n,i,s){const o=ts(this,Mi,Ag).call(this),a=ts(this,Mi,Rg).call(this,o,e,t);if(n.mode==="unreliable"){if(!this.connection.isOpen)return-1;this.connection.sendUnreliable(a)}else this.connection.isOpen?this.connection.send(a):Oc(this,new Uint8Array(a));return Je(this,gi).set(o,{onReply:i,onClose:s}),o}cancelRequest(e){Je(this,gi).delete(e)}sendUnreliable(e,t){if(!this.connection.isOpen)return;const n={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA,typeof e=="string"?rt.string(this.sharedBuffer,e,n):rt.number(this.sharedBuffer,e,n);const i=n.offset;let s;t!==void 0?(s=this.packr.pack(t,Qa|i),s.set(this.sharedBuffer.subarray(0,i),0)):s=this.sharedBuffer.subarray(0,i),this.connection.sendUnreliable(s)}sendBytes(e,t){const n={offset:1};this.sharedBuffer[0]=Nt.ROOM_DATA_BYTES,typeof e=="string"?rt.string(this.sharedBuffer,e,n):rt.number(this.sharedBuffer,e,n);const i=n.offset;if(i+t.byteLength>this.sharedBuffer.byteLength){const s=new Uint8Array(i+t.byteLength);s.set(this.sharedBuffer.subarray(0,i)),this.sharedBuffer=s}this.sharedBuffer.set(t,i),this.connection.isOpen?this.connection.send(this.sharedBuffer.subarray(0,i+t.byteLength)):Oc(this,this.sharedBuffer.subarray(0,i+t.byteLength))}input(e){var t;return((t=Je(this,_i))!=null?t:wt(this,_i,new Ic(this))).handle(e)}get state(){return this.serializer.getState()}removeAllListeners(){this.onJoin.clear(),this.onStateChange.clear(),this.onError.clear(),this.onLeave.clear(),this.onReconnect.clear(),this.onDrop.clear(),this.onMessageHandlers.events={},this.serializer instanceof Tg&&(this.serializer.decoder.root.callbacks={})}onMessageCallback(e){ts(this,Mi,Dg).call(this,new Uint8Array(e.data))}dispatchMessage(e,t){var i;const n=this.getMessageHandlerKey(e);this.onMessageHandlers.events[n]?this.onMessageHandlers.emit(n,t):this.onMessageHandlers.events["*"]?this.onMessageHandlers.emit("*",e,t):n.startsWith("__")||(i=console.warn)==null||i.call(console,`@colyseus/sdk: onMessage() not registered for type '${e}'.`)}destroy(){this.serializer&&this.serializer.teardown()}getMessageHandlerKey(e){switch(typeof e){case"string":return e;case"number":return`i${e}`;default:throw new Error("invalid message type.")}}handleReconnection(e,t){var n;if(!this.reconnection.enabled){this.onLeave.invoke(e,t);return}if(Date.now()-this.joinedAtTime<this.reconnection.minUptime){console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} Room has not been up for long enough for automatic reconnection. (min uptime: ${this.reconnection.minUptime}ms)`),this.onLeave.invoke(mi.ABNORMAL_CLOSURE,"Room uptime too short for reconnection.");return}this.reconnection.isReconnecting||(this.reconnection.retryCount=0,this.reconnection.isReconnecting=!0,(n=Je(this,_i))==null||n.reset()),this.retryReconnection()}retryReconnection(){if(this.reconnection.retryCount>=this.reconnection.maxRetries){console.info(`[Colyseus reconnection]: ${String.fromCodePoint(10060)} ❌ Reconnection failed after ${this.reconnection.maxRetries} attempts.`),this.reconnection.isReconnecting=!1,this.onLeave.invoke(mi.FAILED_TO_RECONNECT,"No more retries. Reconnection failed.");return}this.reconnection.retryCount++;const e=Math.min(this.reconnection.maxDelay,Math.max(this.reconnection.minDelay,this.reconnection.backoff(this.reconnection.retryCount,this.reconnection.delay)));console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9203)} will retry in ${(e/1e3).toFixed(1)} seconds...`),setTimeout(()=>{try{console.info(`[Colyseus reconnection]: ${String.fromCodePoint(128260)} Re-establishing sessionId '${this.sessionId}' with roomId '${this.roomId}'... (attempt ${this.reconnection.retryCount} of ${this.reconnection.maxRetries})`),this.connection.reconnect({reconnectionToken:this.reconnectionToken.split(":")[1],skipHandshake:!0})}catch{this.retryReconnection()}},e)}};$o=new WeakMap,Rs=new WeakMap,Cs=new WeakMap,gi=new WeakMap,_i=new WeakMap,Ds=new WeakMap,Mi=new WeakSet,Ag=function(){const e=Je(this,Cs);return wt(this,Cs,Je(this,Cs)+1>>>0),e},Rg=function(e,t,n){const i={offset:1};this.sharedBuffer[0]=Nt.ROOM_REQUEST,rt.number(this.sharedBuffer,e,i),typeof t=="string"?rt.string(this.sharedBuffer,t,i):rt.number(this.sharedBuffer,t,i);const s=i.offset;if(n!==void 0){const o=this.packr.pack(n,Qa|s);return o.set(this.sharedBuffer.subarray(0,s),0),o}return this.sharedBuffer.subarray(0,s)},Cg=function(e){var t;if(Je(this,gi).size!==0){for(const n of Je(this,gi).values())(t=n.onClose)==null||t.call(n,e);Je(this,gi).clear()}},Dg=function(e){var s,o,a,l,c,f;const t={offset:1},n=e[0],i=n&hE;if(n&Ff.TIMED){const h=ut.uint32(e,t),u=ut.uint32(e,t),d=Je(this,_i)?Je(this,_i).ackInput(u):-1;this.clock.sample(h,d)}if(i===Nt.JOIN_ROOM){const h=ut.utf8Read(e,t,e[t.offset++]);if(this.serializerId=ut.utf8Read(e,t,e[t.offset++]),!this.serializer){const g=Od(this.serializerId);this.serializer=new g}const u=ut.number(e,t);if(u>0&&this.serializer.handshake){const g=t.offset+u;this.serializer.handshake(e.subarray(0,g),t),t.offset=g}for(;t.offset<e.byteLength;){const g=e[t.offset++],_=ut.number(e,t),m=t.offset+_;g===sd.INPUT_REFLECTION?((s=Je(this,_i))!=null?s:wt(this,_i,new Ic(this))).applyReflection(e,t,m):g===sd.INPUT_OPTIONS&&((o=Je(this,_i))!=null?o:wt(this,_i,new Ic(this))).applyOptions(e,t),t.offset=m}const d=(a=Je(this,_i))==null?void 0:a.patchRate;if(d!==void 0&&((c=(l=this.clock).setPatchInterval)==null||c.call(l,d)),this.joinedAtTime===0?(this.joinedAtTime=Date.now(),this.onJoin.invoke()):(console.info(`[Colyseus reconnection]: ${String.fromCodePoint(9989)} reconnection successful!`),this.reconnection.isReconnecting=!1,this.onReconnect.invoke()),this.reconnectionToken=`${this.roomId}:${h}`,this.sharedBuffer[0]=Nt.JOIN_ROOM,this.connection.send(this.sharedBuffer.subarray(0,1)),this.reconnection.enqueuedMessages.length>0){for(const g of this.reconnection.enqueuedMessages)this.connection.send(g.data);this.reconnection.enqueuedMessages=[]}}else if(i===Nt.ERROR){const h=ut.number(e,t),u=ut.string(e,t);this.onError.invoke(h,u)}else if(i===Nt.LEAVE_ROOM)this.leave();else if(i===Nt.ROOM_STATE)wt(this,Ds,0),this.serializer.setState(e,t),this.onStateChange.invoke(this.serializer.getState());else if(i===Nt.ROOM_STATE_PATCH){if(n&Ff.UNRELIABLE){const h=ut.uint16(e,t);if(h-Je(this,Ds)<<16>>16<=0)return;wt(this,Ds,h)}this.serializer.patch(e,t),this.onStateChange.invoke(this.serializer.getState())}else if(i===Nt.ROOM_DATA){const h=ut.stringCheck(e,t)?ut.string(e,t):ut.number(e,t),u=e.byteLength>t.offset?Dd(e,{start:t.offset}):void 0;this.dispatchMessage(h,u)}else if(i===Nt.ROOM_DATA_BYTES){const h=ut.stringCheck(e,t)?ut.string(e,t):ut.number(e,t);this.dispatchMessage(h,e.subarray(t.offset))}else if(i===Nt.ROOM_RESPONSE){const h=ut.number(e,t),u=e[t.offset++],d=e.byteLength>t.offset?Dd(e,{start:t.offset}):void 0,g=Je(this,gi).get(h);g!==void 0&&(Je(this,gi).delete(h),g.onReply(u===rd.OK,d,u===rd.ERROR))}else i===Nt.PING&&((f=Je(this,Rs))==null||f.call(this,Math.round(ni()-Je(this,$o))),wt(this,Rs,void 0))},L(gl,"defaultRequestTimeout",1e4);let qf=gl;function MM(r,e){return new Promise((t,n)=>{var o;const i=new XMLHttpRequest,s=(e==null?void 0:e.method)||"GET";i.open(s,r.toString()),i.withCredentials=(e==null?void 0:e.credentials)==="include",e!=null&&e.headers&&(e.headers instanceof Headers?e.headers:new Headers(e.headers)).forEach((l,c)=>{i.setRequestHeader(c,l)}),i.onload=()=>{var f;const a=new Headers,l=i.getAllResponseHeaders().trim();if(l)for(const h of l.split(/[\r\n]+/)){const u=h.indexOf(": ");u>0&&a.append(h.substring(0,u),h.substring(u+2))}const c=(f=i.response)!=null?f:i.responseText;t(new bM(c,{status:i.status,statusText:i.statusText,headers:a}))},i.onerror=()=>n(new TypeError("Network request failed")),i.ontimeout=()=>n(new TypeError("Network request timed out")),i.send((o=e==null?void 0:e.body)!=null?o:null)})}class bM{constructor(e,t){L(this,"status");L(this,"statusText");L(this,"headers");L(this,"ok");L(this,"body");this.body=e,this.status=t.status,this.statusText=t.statusText,this.headers=t.headers,this.ok=t.status>=200&&t.status<300}async json(){return typeof this.body=="string"?JSON.parse(this.body):this.body}async text(){return typeof this.body=="string"?this.body:JSON.stringify(this.body)}async blob(){return new Blob([this.body])}}function wM(r){if(r===void 0)return!1;const e=typeof r;return e==="string"||e==="number"||e==="boolean"||e===null?!0:e!=="object"?!1:Array.isArray(r)?!0:r.buffer?!1:r.constructor&&r.constructor.name==="Object"||typeof r.toJSON=="function"}function TM(r,e){const{params:t,query:n}=e||{},[i,s]=r.split("?");let o=i;if(t)if(Array.isArray(t)){const c=o.split("/").filter(f=>f.startsWith(":"));for(const[f,h]of c.entries()){const u=t[f];o=o.replace(h,u)}}else for(const[c,f]of Object.entries(t))o=o.replace(`:${c}`,String(f));const a=new URLSearchParams(s);if(n)for(const[c,f]of Object.entries(n))f!=null&&a.set(c,String(f));let l=a.toString();return l=l.length>0?`?${l}`.replace(/\+/g,"%20"):"",`${o}${l}`}class AM{constructor(e,t,n){L(this,"authToken");L(this,"options");L(this,"sdk");L(this,"_fetchFn");L(this,"del",this.delete);this.sdk=e,this.options=t,this._fetchFn=n}get fetchFn(){return this._fetchFn||(this._fetchFn=typeof globalThis.fetch!="undefined"?globalThis.fetch.bind(globalThis):MM),this._fetchFn}async request(e,t,n){return this.executeRequest(e,t,n)}get(e,t){return this.request("GET",e,t)}post(e,t){return this.request("POST",e,t)}delete(e,t){return this.request("DELETE",e,t)}patch(e,t){return this.request("PATCH",e,t)}put(e,t){return this.request("PUT",e,t)}async executeRequest(e,t,n){var d,g,_;let i=this.options.body?{...this.options.body,...(n==null?void 0:n.body)||{}}:n==null?void 0:n.body;const s=this.options.query?{...this.options.query,...(n==null?void 0:n.query)||{}}:n==null?void 0:n.query,o=this.options.params?{...this.options.params,...(n==null?void 0:n.params)||{}}:n==null?void 0:n.params,a=new Headers(this.options.headers?{...this.options.headers,...(n==null?void 0:n.headers)||{}}:n==null?void 0:n.headers);if(this.authToken&&!a.has("authorization")&&a.set("authorization",`Bearer ${this.authToken}`),wM(i)&&typeof i=="object"&&i!==null){a.has("content-type")||a.set("content-type","application/json");for(const[m,p]of Object.entries(i))p instanceof Date&&(i[m]=p.toISOString());i=JSON.stringify(i)}const l={credentials:(n==null?void 0:n.credentials)||"include",...this.options,...n,query:s,params:o,headers:a,body:i,method:e},c=TM(this.sdk.getHttpEndpoint(t.toString()),l);let f;try{f=await this.fetchFn(c,l)}catch(m){if(m.name==="AbortError")throw m;const p=new bo(((d=m.cause)==null?void 0:d.code)||m.code,m.message);throw p.response=f,p.cause=m.cause,p}const h=f.headers.get("content-type");let u;if(h!=null&&h.includes("json")?u=await f.json():h!=null&&h.includes("text")?u=await f.text():u=await f.blob(),!f.ok)throw new bo(f.status,(_=(g=u.message)!=null?g:u.error)!=null?_:f.statusText,{headers:f.headers,status:f.status,response:f,data:u});return{raw:f,data:u,headers:f.headers,status:f.status,statusText:f.statusText}}}let Sr;function Nh(){if(!Sr)try{Sr=typeof cc!="undefined"&&cc.sys&&cc.sys.localStorage?cc.sys.localStorage:window.localStorage}catch{}return!Sr&&typeof globalThis.indexedDB!="undefined"&&(Sr=new PM),Sr||(Sr={cache:{},setItem:function(r,e){this.cache[r]=e},getItem:function(r){return this.cache[r]},removeItem:function(r){delete this.cache[r]}}),Sr}function RM(r,e){Nh().setItem(r,e)}function CM(r){Nh().removeItem(r)}function DM(r,e){const t=Nh().getItem(r);typeof Promise=="undefined"||!(t instanceof Promise)?e(t):t.then(n=>e(n))}class PM{constructor(){L(this,"dbPromise",new Promise(e=>{const t=indexedDB.open("_colyseus_storage",1);t.onupgradeneeded=()=>t.result.createObjectStore("store"),t.onsuccess=()=>e(t.result)}))}async tx(e,t){const i=(await this.dbPromise).transaction("store",e).objectStore("store");return t(i)}setItem(e,t){return this.tx("readwrite",n=>n.put(t,e)).then()}async getItem(e){const t=await this.tx("readonly",n=>n.get(e));return new Promise(n=>{t.onsuccess=()=>n(t.result)})}removeItem(e){return this.tx("readwrite",t=>t.delete(e)).then()}}var jo,Fi,qo;class IM{constructor(e){L(this,"settings",{path:"/auth",key:"colyseus-auth-token"});At(this,jo,!1);At(this,Fi,null);At(this,qo,wg());L(this,"http");this.http=e,DM(this.settings.key,t=>this.token=t)}set token(e){this.http.authToken=e}get token(){return this.http.authToken}onChange(e){const t=Je(this,qo).on("change",e);return Je(this,jo)||this.getUserData().then(n=>{this.emitChange({...n,token:this.token})}).catch(n=>{this.emitChange({user:null,token:void 0})}),wt(this,jo,!0),t}async getUserData(){if(this.token)return(await this.http.get(`${this.settings.path}/userdata`)).data;throw new Error("missing auth.token")}async registerWithEmailAndPassword(e,t,n){const i=(await this.http.post(`${this.settings.path}/register`,{body:{email:e,password:t,options:n}})).data;return this.emitChange(i),i}async signInWithEmailAndPassword(e,t){const n=(await this.http.post(`${this.settings.path}/login`,{body:{email:e,password:t}})).data;return this.emitChange(n),n}async signInAnonymously(e){const t=(await this.http.post(`${this.settings.path}/anonymous`,{body:{options:e}})).data;return this.emitChange(t),t}async sendPasswordResetEmail(e){return(await this.http.post(`${this.settings.path}/forgot-password`,{body:{email:e}})).data}async signInWithProvider(e,t={}){return new Promise((n,i)=>{const s=t.width||480,o=t.height||768,a=this.token?`?token=${this.token}`:"",l=`Login with ${e[0].toUpperCase()+e.substring(1)}`,c=this.http.sdk.getHttpEndpoint(`${t.prefix||`${this.settings.path}/provider`}/${e}${a}`),f=screen.width/2-s/2,h=screen.height/2-o/2;wt(this,Fi,window.open(c,l,"toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width="+s+", height="+o+", top="+h+", left="+f));const u=g=>{var _;if(!(g.data.user===void 0&&g.data.token===void 0))if(clearInterval(d),(_=Je(this,Fi))==null||_.close(),wt(this,Fi,null),window.removeEventListener("message",u),g.data.error!==void 0){const m=new Error(String(g.data.error));m.code=g.data.error,g.data.reason!==void 0&&(m.reason=g.data.reason),g.data.until!==void 0&&(m.until=g.data.until),i(m)}else n(g.data),this.emitChange(g.data)},d=setInterval(()=>{(!Je(this,Fi)||Je(this,Fi).closed)&&(wt(this,Fi,null),i("cancelled"),window.removeEventListener("message",u))},200);window.addEventListener("message",u)})}async signOut(){this.emitChange({user:null,token:null})}emitChange(e){e.token!==void 0&&(this.token=e.token,e.token===null?CM(this.settings.key):RM(this.settings.key,e.token)),Je(this,qo).emit("change",e)}}jo=new WeakMap,Fi=new WeakMap,qo=new WeakMap;function UM(r){var i;const e=((i=window==null?void 0:window.location)==null?void 0:i.hostname)||"localhost",t=r.hostname.split("."),n=!r.hostname.includes("trycloudflare.com")&&!r.hostname.includes("discordsays.com")&&t.length>2?`/${t[0]}`:"";return r.pathname.startsWith("/.proxy")?`${r.protocol}//${e}${n}${r.pathname}${r.search}`:`${r.protocol}//${e}/.proxy/colyseus${n}${r.pathname}${r.search}`}var Bp;const Bd=typeof window!="undefined"&&typeof((Bp=window==null?void 0:window.location)==null?void 0:Bp.hostname)!="undefined"?`${window.location.protocol.replace("http","ws")}//${window.location.hostname}${window.location.port&&`:${window.location.port}`}`:"ws://127.0.0.1:2567",_l=class _l{constructor(e=Bd,t){L(this,"http");L(this,"auth");L(this,"settings");L(this,"urlBuilder");var n,i;if(typeof e=="string"){const s=e.startsWith("/")?new URL(e,Bd):new URL(e),o=s.protocol==="https:"||s.protocol==="wss:",a=Number(s.port||(o?443:80));this.settings={hostname:s.hostname,pathname:s.pathname,port:a,secure:o,searchParams:s.searchParams.toString()||void 0}}else e.port===void 0&&(e.port=e.secure?443:80),e.pathname===void 0&&(e.pathname=""),this.settings=e;this.settings.pathname.endsWith("/")&&(this.settings.pathname=this.settings.pathname.slice(0,-1)),t!=null&&t.protocol&&(this.settings.protocol=t.protocol),this.http=new AM(this,{headers:(t==null?void 0:t.headers)||{}},t==null?void 0:t.fetchFn),this.auth=new IM(this.http),this.urlBuilder=t==null?void 0:t.urlBuilder,!this.urlBuilder&&typeof window!="undefined"&&((i=(n=window==null?void 0:window.location)==null?void 0:n.hostname)!=null&&i.includes("discordsays.com"))&&(this.urlBuilder=UM,console.log("Colyseus SDK: Discord Embedded SDK detected. Using custom URL builder."))}static async selectByLatency(e,t,n={}){const i=e.map(o=>new _l(o,t)),s=(await Promise.allSettled(i.map((o,a)=>o.getLatency(n).then(l=>{const c=i[a].settings;return console.log(`🛜 Endpoint Latency: ${l}ms - ${c.hostname}:${c.port}${c.pathname}`),[a,l]})))).filter(o=>o.status==="fulfilled").map(o=>o.value);if(s.length===0)throw new Error("All endpoints failed to respond");return i[s.sort((o,a)=>o[1]-a[1])[0][0]]}async joinOrCreate(e,t={},n){return await this.createMatchMakeRequest("joinOrCreate",e,t,n)}async create(e,t={},n){return await this.createMatchMakeRequest("create",e,t,n)}async join(e,t={},n){return await this.createMatchMakeRequest("join",e,t,n)}async joinById(e,t={},n){return await this.createMatchMakeRequest("joinById",e,t,n)}async reconnect(e,t){if(typeof e=="string"&&typeof t=="string")throw new Error("DEPRECATED: .reconnect() now only accepts 'reconnectionToken' as argument.\nYou can get this token from previously connected `room.reconnectionToken`");const[n,i]=e.split(":");if(!n||!i)throw new Error(`Invalid reconnection token format.
The format should be roomId:reconnectionToken`);return await this.createMatchMakeRequest("reconnect",n,{reconnectionToken:i},t)}async consumeSeatReservation(e,t){const n=this.createRoom(e.name,t);n.roomId=e.roomId,n.sessionId=e.sessionId;const i={sessionId:n.sessionId};return e.reconnectionToken&&(i.reconnectionToken=e.reconnectionToken),n.connect(this.buildEndpoint(e,i),{...e,protocol:this.settings.protocol},this.http.options.headers),new Promise((s,o)=>{const a=(l,c)=>o(new bo(l,c));n.onError.once(a),n.onJoin.once(()=>{n.onError.remove(a),q1("room",n),s(n)})})}getLatency(e={}){var s,o,a;const t=(s=e.protocol)!=null?s:"ws",n=(o=e.pingCount)!=null?o:1,i=(a=e.timeout)!=null?a:1500;return new Promise((l,c)=>{var p;const f=new Eg(t),h=[];let u=0,d=!1,g;const _=y=>{if(!d){d=!0,clearTimeout(g);try{f.close()}catch{}y()}},m=y=>_(()=>c(new bo(mi.ABNORMAL_CLOSURE,`Failed to get latency: ${y}`)));g=setTimeout(()=>m(`timed out after ${i}ms`),i),f.events.onopen=()=>{u=Date.now(),f.send(new Uint8Array([Nt.PING]))},f.events.onmessage=y=>{if(h.push(Date.now()-u),h.length<n)u=Date.now(),f.send(new Uint8Array([Nt.PING]));else{const E=h.reduce((v,C)=>v+C,0)/h.length;_(()=>l(E))}},f.events.onclose=y=>m(`connection closed${y!=null&&y.code?` (${y.code})`:""}${y!=null&&y.reason?`: ${y.reason}`:""}`),f.events.onerror=y=>m(y.message);try{f.connect(this.getHttpEndpoint())}catch(y){m((p=y==null?void 0:y.message)!=null?p:"failed to connect")}})}async createMatchMakeRequest(e,t,n={},i){try{if(!t)throw new Error("Must provide a room name");const o=(await this.http.post(`/matchmake/${e}/${t}`,{headers:{Accept:"application/json","Content-Type":"application/json"},body:n})).data;return e==="reconnect"&&(o.reconnectionToken=n.reconnectionToken),await this.consumeSeatReservation(o,i)}catch(s){throw s instanceof bo?new yh(s.message,s.code):s}}createRoom(e,t){return new qf(e,t)}buildEndpoint(e,t={}){let n=this.settings.protocol||"ws",i=this.settings.searchParams||"";this.http.authToken&&(t._authToken=this.http.authToken);for(const a in t)t.hasOwnProperty(a)&&(i+=(i?"&":"")+`${a}=${t[a]}`);n==="h3"&&(n="http");let s=this.settings.secure?`${n}s://`:`${n}://`;e.publicAddress?s+=`${e.publicAddress}`:s+=`${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}`;const o=`${s}/${e.processId}/${e.roomId}?${i}`;return this.urlBuilder?this.urlBuilder(new URL(o)):o}getHttpEndpoint(e=""){const t=e.startsWith("/")?e:`/${e}`;let n=`${this.settings.secure?"https":"http"}://${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}${t}`;return this.settings.searchParams&&(n+=`?${this.settings.searchParams}`),this.urlBuilder?this.urlBuilder(new URL(n)):n}getEndpointPort(){return this.settings.port!==80&&this.settings.port!==443?`:${this.settings.port}`:""}};L(_l,"VERSION","0.18");let Yf=_l;const LM=Yf;class FM{setState(e){}getState(){return null}patch(e){}teardown(){}handshake(e){}}bg("schema",Tg);bg("none",FM);function NM(){var r=Object.create(null);function e(i,s){var o=i.id,a=i.name,l=i.dependencies;l===void 0&&(l=[]);var c=i.init;c===void 0&&(c=function(){});var f=i.getTransferables;if(f===void 0&&(f=null),!r[o])try{l=l.map(function(u){return u&&u.isWorkerModule&&(e(u,function(d){if(d instanceof Error)throw d}),u=r[u.id].value),u}),c=n("<"+a+">.init",c),f&&(f=n("<"+a+">.getTransferables",f));var h=null;typeof c=="function"?h=c.apply(void 0,l):console.error("worker module init function failed to rehydrate"),r[o]={id:o,value:h,getTransferables:f},s(h)}catch(u){u&&u.noLog||console.error(u),s(u)}}function t(i,s){var o,a=i.id,l=i.args;(!r[a]||typeof r[a].value!="function")&&s(new Error("Worker module "+a+": not found or its 'init' did not return a function"));try{var c=(o=r[a]).value.apply(o,l);c&&typeof c.then=="function"?c.then(f,function(h){return s(h instanceof Error?h:new Error(""+h))}):f(c)}catch(h){s(h)}function f(h){try{var u=r[a].getTransferables&&r[a].getTransferables(h);(!u||!Array.isArray(u)||!u.length)&&(u=void 0),s(h,u)}catch(d){console.error(d),s(d)}}}function n(i,s){var o=void 0;self.troikaDefine=function(l){return o=l};var a=URL.createObjectURL(new Blob(["/** "+i.replace(/\*/g,"")+` **/

troikaDefine(
`+s+`
)`],{type:"application/javascript"}));try{importScripts(a)}catch(l){console.error(l)}return URL.revokeObjectURL(a),delete self.troikaDefine,o}self.addEventListener("message",function(i){var s=i.data,o=s.messageId,a=s.action,l=s.data;try{a==="registerModule"&&e(l,function(c){c instanceof Error?postMessage({messageId:o,success:!1,error:c.message}):postMessage({messageId:o,success:!0,result:{isCallable:typeof c=="function"}})}),a==="callModule"&&t(l,function(c,f){c instanceof Error?postMessage({messageId:o,success:!1,error:c.message}):postMessage({messageId:o,success:!0,result:c},f||void 0)})}catch(c){postMessage({messageId:o,success:!1,error:c.stack})}})}function OM(r){var e=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e._getInitResult().then(function(i){if(typeof i=="function")return i.apply(void 0,t);throw new Error("Worker module function was called but `init` did not return a callable function")})};return e._getInitResult=function(){var t=r.dependencies,n=r.init;t=Array.isArray(t)?t.map(function(s){return s&&(s=s.onMainThread||s,s._getInitResult&&(s=s._getInitResult())),s}):[];var i=Promise.all(t).then(function(s){return n.apply(null,s)});return e._getInitResult=function(){return i},i},e}var Pg=function(){var r=!1;if(typeof window!="undefined"&&typeof window.document!="undefined")try{var e=new Worker(URL.createObjectURL(new Blob([""],{type:"application/javascript"})));e.terminate(),r=!0}catch(t){console.log("Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: ["+t.message+"]")}return Pg=function(){return r},r},BM=0,kM=0,Bc=!1,Ro=Object.create(null),Co=Object.create(null),Kf=Object.create(null);function Js(r){if((!r||typeof r.init!="function")&&!Bc)throw new Error("requires `options.init` function");var e=r.dependencies,t=r.init,n=r.getTransferables,i=r.workerId,s=OM(r);i==null&&(i="#default");var o="workerModule"+ ++BM,a=r.name||o,l=null;e=e&&e.map(function(f){return typeof f=="function"&&!f.workerModuleData&&(Bc=!0,f=Js({workerId:i,name:"<"+a+"> function dependency: "+f.name,init:`function(){return (
`+el(f)+`
)}`}),Bc=!1),f&&f.workerModuleData&&(f=f.workerModuleData),f});function c(){for(var f=[],h=arguments.length;h--;)f[h]=arguments[h];if(!Pg())return s.apply(void 0,f);if(!l){l=kd(i,"registerModule",c.workerModuleData);var u=function(){l=null,Co[i].delete(u)};(Co[i]||(Co[i]=new Set)).add(u)}return l.then(function(d){var g=d.isCallable;if(g)return kd(i,"callModule",{id:o,args:f});throw new Error("Worker module function was called but `init` did not return a callable function")})}return c.workerModuleData={isWorkerModule:!0,id:o,name:a,dependencies:e,init:el(t),getTransferables:n&&el(n)},c.onMainThread=s,c}function zM(r){Co[r]&&Co[r].forEach(function(e){e()}),Ro[r]&&(Ro[r].terminate(),delete Ro[r])}function el(r){var e=r.toString();return!/^function/.test(e)&&/^\w+\s*\(/.test(e)&&(e="function "+e),e}function GM(r){var e=Ro[r];if(!e){var t=el(NM);e=Ro[r]=new Worker(URL.createObjectURL(new Blob(["/** Worker Module Bootstrap: "+r.replace(/\*/g,"")+` **/

;(`+t+")()"],{type:"application/javascript"}))),e.onmessage=function(n){var i=n.data,s=i.messageId,o=Kf[s];if(!o)throw new Error("WorkerModule response with empty or unknown messageId");delete Kf[s],o(i)}}return e}function kd(r,e,t){return new Promise(function(n,i){var s=++kM;Kf[s]=function(o){o.success?n(o.result):i(new Error("Error in worker "+e+" call: "+o.error))},GM(r).postMessage({messageId:s,action:e,data:t})})}function Ig(){var r=function(e){function t(X,V,N,$,ne,k,H,se){var Y=1-H;se.x=Y*Y*X+2*Y*H*N+H*H*ne,se.y=Y*Y*V+2*Y*H*$+H*H*k}function n(X,V,N,$,ne,k,H,se,Y,ae){var Me=1-Y;ae.x=Me*Me*Me*X+3*Me*Me*Y*N+3*Me*Y*Y*ne+Y*Y*Y*H,ae.y=Me*Me*Me*V+3*Me*Me*Y*$+3*Me*Y*Y*k+Y*Y*Y*se}function i(X,V){for(var N=/([MLQCZ])([^MLQCZ]*)/g,$,ne,k,H,se;$=N.exec(X);){var Y=$[2].replace(/^\s*|\s*$/g,"").split(/[,\s]+/).map(function(ae){return parseFloat(ae)});switch($[1]){case"M":H=ne=Y[0],se=k=Y[1];break;case"L":(Y[0]!==H||Y[1]!==se)&&V("L",H,se,H=Y[0],se=Y[1]);break;case"Q":{V("Q",H,se,H=Y[2],se=Y[3],Y[0],Y[1]);break}case"C":{V("C",H,se,H=Y[4],se=Y[5],Y[0],Y[1],Y[2],Y[3]);break}case"Z":(H!==ne||se!==k)&&V("L",H,se,ne,k);break}}}function s(X,V,N){N===void 0&&(N=16);var $={x:0,y:0};i(X,function(ne,k,H,se,Y,ae,Me,Ae,we){switch(ne){case"L":V(k,H,se,Y);break;case"Q":{for(var ue=k,Ve=H,W=1;W<N;W++)t(k,H,ae,Me,se,Y,W/(N-1),$),V(ue,Ve,$.x,$.y),ue=$.x,Ve=$.y;break}case"C":{for(var He=k,Ue=H,Fe=1;Fe<N;Fe++)n(k,H,ae,Me,Ae,we,se,Y,Fe/(N-1),$),V(He,Ue,$.x,$.y),He=$.x,Ue=$.y;break}}})}var o="precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}",a="precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}",l=new WeakMap,c={premultipliedAlpha:!1,preserveDrawingBuffer:!0,antialias:!1,depth:!1};function f(X,V){var N=X.getContext?X.getContext("webgl",c):X,$=l.get(N);if(!$){let He=function(A){var b=k[A];if(!b&&(b=k[A]=N.getExtension(A),!b))throw new Error(A+" not supported");return b},Ue=function(A,b){var G=N.createShader(b);return N.shaderSource(G,A),N.compileShader(G),G},Fe=function(A,b,G,te){if(!H[A]){var ie={},fe={},_e=N.createProgram();N.attachShader(_e,Ue(b,N.VERTEX_SHADER)),N.attachShader(_e,Ue(G,N.FRAGMENT_SHADER)),N.linkProgram(_e),H[A]={program:_e,transaction:function(Se){N.useProgram(_e),Se({setUniform:function(ve,Re){for(var Ce=[],De=arguments.length-2;De-- >0;)Ce[De]=arguments[De+2];var pe=fe[Re]||(fe[Re]=N.getUniformLocation(_e,Re));N["uniform"+ve].apply(N,[pe].concat(Ce))},setAttribute:function(ve,Re,Ce,De,pe){var Be=ie[ve];Be||(Be=ie[ve]={buf:N.createBuffer(),loc:N.getAttribLocation(_e,ve),data:null}),N.bindBuffer(N.ARRAY_BUFFER,Be.buf),N.vertexAttribPointer(Be.loc,Re,N.FLOAT,!1,0,0),N.enableVertexAttribArray(Be.loc),ne?N.vertexAttribDivisor(Be.loc,De):He("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(Be.loc,De),pe!==Be.data&&(N.bufferData(N.ARRAY_BUFFER,pe,Ce),Be.data=pe)}})}}}H[A].transaction(te)},he=function(A,b){Y++;try{N.activeTexture(N.TEXTURE0+Y);var G=se[A];G||(G=se[A]=N.createTexture(),N.bindTexture(N.TEXTURE_2D,G),N.texParameteri(N.TEXTURE_2D,N.TEXTURE_MIN_FILTER,N.NEAREST),N.texParameteri(N.TEXTURE_2D,N.TEXTURE_MAG_FILTER,N.NEAREST)),N.bindTexture(N.TEXTURE_2D,G),b(G,Y)}finally{Y--}},Ie=function(A,b,G){var te=N.createFramebuffer();ae.push(te),N.bindFramebuffer(N.FRAMEBUFFER,te),N.activeTexture(N.TEXTURE0+b),N.bindTexture(N.TEXTURE_2D,A),N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,A,0);try{G(te)}finally{N.deleteFramebuffer(te),N.bindFramebuffer(N.FRAMEBUFFER,ae[--ae.length-1]||null)}},Ee=function(){k={},H={},se={},Y=-1,ae.length=0};var Me=He,Ae=Ue,we=Fe,ue=he,Ve=Ie,W=Ee,ne=typeof WebGL2RenderingContext!="undefined"&&N instanceof WebGL2RenderingContext,k={},H={},se={},Y=-1,ae=[];N.canvas.addEventListener("webglcontextlost",function(A){Ee(),A.preventDefault()},!1),l.set(N,$={gl:N,isWebGL2:ne,getExtension:He,withProgram:Fe,withTexture:he,withTextureFramebuffer:Ie,handleContextLoss:Ee})}V($)}function h(X,V,N,$,ne,k,H,se){H===void 0&&(H=15),se===void 0&&(se=null),f(X,function(Y){var ae=Y.gl,Me=Y.withProgram,Ae=Y.withTexture;Ae("copy",function(we,ue){ae.texImage2D(ae.TEXTURE_2D,0,ae.RGBA,ne,k,0,ae.RGBA,ae.UNSIGNED_BYTE,V),Me("copy",o,a,function(Ve){var W=Ve.setUniform,He=Ve.setAttribute;He("aUV",2,ae.STATIC_DRAW,0,new Float32Array([0,0,2,0,0,2])),W("1i","image",ue),ae.bindFramebuffer(ae.FRAMEBUFFER,se||null),ae.disable(ae.BLEND),ae.colorMask(H&8,H&4,H&2,H&1),ae.viewport(N,$,ne,k),ae.scissor(N,$,ne,k),ae.drawArrays(ae.TRIANGLES,0,3)})})})}function u(X,V,N){var $=X.width,ne=X.height;f(X,function(k){var H=k.gl,se=new Uint8Array($*ne*4);H.readPixels(0,0,$,ne,H.RGBA,H.UNSIGNED_BYTE,se),X.width=V,X.height=N,h(H,se,0,0,$,ne)})}var d=Object.freeze({__proto__:null,withWebGLContext:f,renderImageData:h,resizeWebGLCanvasWithoutClearing:u});function g(X,V,N,$,ne,k){k===void 0&&(k=1);var H=new Uint8Array(X*V),se=$[2]-$[0],Y=$[3]-$[1],ae=[];s(N,function(He,Ue,Fe,he){ae.push({x1:He,y1:Ue,x2:Fe,y2:he,minX:Math.min(He,Fe),minY:Math.min(Ue,he),maxX:Math.max(He,Fe),maxY:Math.max(Ue,he)})}),ae.sort(function(He,Ue){return He.maxX-Ue.maxX});for(var Me=0;Me<X;Me++)for(var Ae=0;Ae<V;Ae++){var we=Ve($[0]+se*(Me+.5)/X,$[1]+Y*(Ae+.5)/V),ue=Math.pow(1-Math.abs(we)/ne,k)/2;we<0&&(ue=1-ue),ue=Math.max(0,Math.min(255,Math.round(ue*255))),H[Ae*X+Me]=ue}return H;function Ve(He,Ue){for(var Fe=1/0,he=1/0,Ie=ae.length;Ie--;){var Ee=ae[Ie];if(Ee.maxX+he<=He)break;if(He+he>Ee.minX&&Ue-he<Ee.maxY&&Ue+he>Ee.minY){var A=p(He,Ue,Ee.x1,Ee.y1,Ee.x2,Ee.y2);A<Fe&&(Fe=A,he=Math.sqrt(Fe))}}return W(He,Ue)&&(he=-he),he}function W(He,Ue){for(var Fe=0,he=ae.length;he--;){var Ie=ae[he];if(Ie.maxX<=He)break;var Ee=Ie.y1>Ue!=Ie.y2>Ue&&He<(Ie.x2-Ie.x1)*(Ue-Ie.y1)/(Ie.y2-Ie.y1)+Ie.x1;Ee&&(Fe+=Ie.y1<Ie.y2?1:-1)}return Fe!==0}}function _(X,V,N,$,ne,k,H,se,Y,ae){k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0),m(X,V,N,$,ne,k,H,null,se,Y,ae)}function m(X,V,N,$,ne,k,H,se,Y,ae,Me){k===void 0&&(k=1),Y===void 0&&(Y=0),ae===void 0&&(ae=0),Me===void 0&&(Me=0);for(var Ae=g(X,V,N,$,ne,k),we=new Uint8Array(Ae.length*4),ue=0;ue<Ae.length;ue++)we[ue*4+Me]=Ae[ue];h(H,we,Y,ae,X,V,1<<3-Me,se)}function p(X,V,N,$,ne,k){var H=ne-N,se=k-$,Y=H*H+se*se,ae=Y?Math.max(0,Math.min(1,((X-N)*H+(V-$)*se)/Y)):0,Me=X-(N+ae*H),Ae=V-($+ae*se);return Me*Me+Ae*Ae}var y=Object.freeze({__proto__:null,generate:g,generateIntoCanvas:_,generateIntoFramebuffer:m}),E="precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}",v="precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}",C="precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}",R=new Float32Array([0,0,2,0,0,2]),T=null,w=!1,S={},x=new WeakMap;function F(X){if(!w&&!O(X))throw new Error("WebGL generation not supported")}function I(X,V,N,$,ne,k,H){if(k===void 0&&(k=1),H===void 0&&(H=null),!H&&(H=T,!H)){var se=typeof OffscreenCanvas=="function"?new OffscreenCanvas(1,1):typeof document!="undefined"?document.createElement("canvas"):null;if(!se)throw new Error("OffscreenCanvas or DOM canvas not supported");H=T=se.getContext("webgl",{depth:!1})}F(H);var Y=new Uint8Array(X*V*4);f(H,function(we){var ue=we.gl,Ve=we.withTexture,W=we.withTextureFramebuffer;Ve("readable",function(He,Ue){ue.texImage2D(ue.TEXTURE_2D,0,ue.RGBA,X,V,0,ue.RGBA,ue.UNSIGNED_BYTE,null),W(He,Ue,function(Fe){P(X,V,N,$,ne,k,ue,Fe,0,0,0),ue.readPixels(0,0,X,V,ue.RGBA,ue.UNSIGNED_BYTE,Y)})})});for(var ae=new Uint8Array(X*V),Me=0,Ae=0;Me<Y.length;Me+=4)ae[Ae++]=Y[Me];return ae}function M(X,V,N,$,ne,k,H,se,Y,ae){k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0),P(X,V,N,$,ne,k,H,null,se,Y,ae)}function P(X,V,N,$,ne,k,H,se,Y,ae,Me){k===void 0&&(k=1),Y===void 0&&(Y=0),ae===void 0&&(ae=0),Me===void 0&&(Me=0),F(H);var Ae=[];s(N,function(we,ue,Ve,W){Ae.push(we,ue,Ve,W)}),Ae=new Float32Array(Ae),f(H,function(we){var ue=we.gl,Ve=we.isWebGL2,W=we.getExtension,He=we.withProgram,Ue=we.withTexture,Fe=we.withTextureFramebuffer,he=we.handleContextLoss;if(Ue("rawDistances",function(Ie,Ee){(X!==Ie._lastWidth||V!==Ie._lastHeight)&&ue.texImage2D(ue.TEXTURE_2D,0,ue.RGBA,Ie._lastWidth=X,Ie._lastHeight=V,0,ue.RGBA,ue.UNSIGNED_BYTE,null),He("main",E,v,function(A){var b=A.setAttribute,G=A.setUniform,te=!Ve&&W("ANGLE_instanced_arrays"),ie=!Ve&&W("EXT_blend_minmax");b("aUV",2,ue.STATIC_DRAW,0,R),b("aLineSegment",4,ue.DYNAMIC_DRAW,1,Ae),G.apply(void 0,["4f","uGlyphBounds"].concat($)),G("1f","uMaxDistance",ne),G("1f","uExponent",k),Fe(Ie,Ee,function(fe){ue.enable(ue.BLEND),ue.colorMask(!0,!0,!0,!0),ue.viewport(0,0,X,V),ue.scissor(0,0,X,V),ue.blendFunc(ue.ONE,ue.ONE),ue.blendEquationSeparate(ue.FUNC_ADD,Ve?ue.MAX:ie.MAX_EXT),ue.clear(ue.COLOR_BUFFER_BIT),Ve?ue.drawArraysInstanced(ue.TRIANGLES,0,3,Ae.length/4):te.drawArraysInstancedANGLE(ue.TRIANGLES,0,3,Ae.length/4)})}),He("post",o,C,function(A){A.setAttribute("aUV",2,ue.STATIC_DRAW,0,R),A.setUniform("1i","tex",Ee),ue.bindFramebuffer(ue.FRAMEBUFFER,se),ue.disable(ue.BLEND),ue.colorMask(Me===0,Me===1,Me===2,Me===3),ue.viewport(Y,ae,X,V),ue.scissor(Y,ae,X,V),ue.drawArrays(ue.TRIANGLES,0,3)})}),ue.isContextLost())throw he(),new Error("webgl context lost")})}function O(X){var V=!X||X===T?S:X.canvas||X,N=x.get(V);if(N===void 0){w=!0;var $=null;try{var ne=[97,106,97,61,99,137,118,80,80,118,137,99,61,97,106,97],k=I(4,4,"M8,8L16,8L24,24L16,24Z",[0,0,32,32],24,1,X);N=k&&ne.length===k.length&&k.every(function(H,se){return H===ne[se]}),N||($="bad trial run results",console.info(ne,k))}catch(H){N=!1,$=H.message}$&&console.warn("WebGL SDF generation not supported:",$),w=!1,x.set(V,N)}return N}var U=Object.freeze({__proto__:null,generate:I,generateIntoCanvas:M,generateIntoFramebuffer:P,isSupported:O});function B(X,V,N,$,ne,k){ne===void 0&&(ne=Math.max($[2]-$[0],$[3]-$[1])/2),k===void 0&&(k=1);try{return I.apply(U,arguments)}catch(H){return console.info("WebGL SDF generation failed, falling back to JS",H),g.apply(y,arguments)}}function z(X,V,N,$,ne,k,H,se,Y,ae){ne===void 0&&(ne=Math.max($[2]-$[0],$[3]-$[1])/2),k===void 0&&(k=1),se===void 0&&(se=0),Y===void 0&&(Y=0),ae===void 0&&(ae=0);try{return M.apply(U,arguments)}catch(Me){return console.info("WebGL SDF generation failed, falling back to JS",Me),_.apply(y,arguments)}}return e.forEachPathCommand=i,e.generate=B,e.generateIntoCanvas=z,e.javascript=y,e.pathToLineSegments=s,e.webgl=U,e.webglUtils=d,Object.defineProperty(e,"__esModule",{value:!0}),e}({});return r}function VM(){var r=function(e){var t={R:"13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",EN:"1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",ES:"17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",ET:"z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",AN:"16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",CS:"18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",B:"a,3,f+2,2v,690",S:"9,2,k",WS:"c,k,4f4,1vk+a,u,1j,335",ON:"x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",BN:"0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",NSM:"lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",AL:"16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",LRO:"6ct",RLO:"6cu",LRE:"6cq",RLE:"6cr",PDF:"6cs",LRI:"6ee",RLI:"6ef",FSI:"6eg",PDI:"6eh"},n={},i={};n.L=1,i[1]="L",Object.keys(t).forEach(function(he,Ie){n[he]=1<<Ie+1,i[n[he]]=he}),Object.freeze(n);var s=n.LRI|n.RLI|n.FSI,o=n.L|n.R|n.AL,a=n.B|n.S|n.WS|n.ON|n.FSI|n.LRI|n.RLI|n.PDI,l=n.BN|n.RLE|n.LRE|n.RLO|n.LRO|n.PDF,c=n.S|n.WS|n.B|s|n.PDI|l,f=null;function h(){if(!f){f=new Map;var he=0;for(var Ie in t)if(t.hasOwnProperty(Ie))for(var Ee=t[Ie],A="",b=void 0,G=!1,te=0,ie=0;ie<=Ee.length+1;ie+=1){var fe=Ee[ie];if(fe!==","&&ie!==Ee.length)fe==="+"?(G=!0,te=he=te+parseInt(A,36),A=""):A+=fe;else{G?b=he+parseInt(A,36):(te=he=te+parseInt(A,36),b=he),G=!1,A="",te=b;for(var _e=he;_e<b+1;_e+=1)f.set(_e,n[Ie])}}}}function u(he){return h(),f.get(he.codePointAt(0))||n.L}function d(he){return i[u(he)]}var g={pairs:"14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",canonical:"6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye"};function _(he,Ie){var Ee=36,A=0,b=new Map,G=Ie&&new Map,te;return he.split(",").forEach(function ie(fe){if(fe.indexOf("+")!==-1)for(var _e=+fe;_e--;)ie(te);else{te=fe;var ge=fe.split(">"),Se=ge[0],Oe=ge[1];Se=String.fromCodePoint(A+=parseInt(Se,Ee)),Oe=String.fromCodePoint(A+=parseInt(Oe,Ee)),b.set(Se,Oe),Ie&&G.set(Oe,Se)}}),{map:b,reverseMap:G}}var m,p,y;function E(){if(!m){var he=_(g.pairs,!0),Ie=he.map,Ee=he.reverseMap;m=Ie,p=Ee,y=_(g.canonical,!1).map}}function v(he){return E(),m.get(he)||null}function C(he){return E(),p.get(he)||null}function R(he){return E(),y.get(he)||null}var T=n.L,w=n.R,S=n.EN,x=n.ES,F=n.ET,I=n.AN,M=n.CS,P=n.B,O=n.S,U=n.ON,B=n.BN,z=n.NSM,X=n.AL,V=n.LRO,N=n.RLO,$=n.LRE,ne=n.RLE,k=n.PDF,H=n.LRI,se=n.RLI,Y=n.FSI,ae=n.PDI;function Me(he,Ie){for(var Ee=125,A=new Uint32Array(he.length),b=0;b<he.length;b++)A[b]=u(he[b]);var G=new Map;function te(pn,Xn){var mn=A[pn];A[pn]=Xn,G.set(mn,G.get(mn)-1),mn&a&&G.set(a,G.get(a)-1),G.set(Xn,(G.get(Xn)||0)+1),Xn&a&&G.set(a,(G.get(a)||0)+1)}for(var ie=new Uint8Array(he.length),fe=new Map,_e=[],ge=null,Se=0;Se<he.length;Se++)ge||_e.push(ge={start:Se,end:he.length-1,level:Ie==="rtl"?1:Ie==="ltr"?0:Zh(Se,!1)}),A[Se]&P&&(ge.end=Se,ge=null);for(var Oe=ne|$|N|V|s|ae|k|P,ve=function(pn){return pn+(pn&1?1:2)},Re=function(pn){return pn+(pn&1?2:1)},Ce=0;Ce<_e.length;Ce++){ge=_e[Ce];var De=[{_level:ge.level,_override:0,_isolate:0}],pe=void 0,Be=0,ke=0,nt=0;G.clear();for(var j=ge.start;j<=ge.end;j++){var xe=A[j];if(pe=De[De.length-1],G.set(xe,(G.get(xe)||0)+1),xe&a&&G.set(a,(G.get(a)||0)+1),xe&Oe)if(xe&(ne|$)){ie[j]=pe._level;var re=(xe===ne?Re:ve)(pe._level);re<=Ee&&!Be&&!ke?De.push({_level:re,_override:0,_isolate:0}):Be||ke++}else if(xe&(N|V)){ie[j]=pe._level;var ye=(xe===N?Re:ve)(pe._level);ye<=Ee&&!Be&&!ke?De.push({_level:ye,_override:xe&N?w:T,_isolate:0}):Be||ke++}else if(xe&s){xe&Y&&(xe=Zh(j+1,!0)===1?se:H),ie[j]=pe._level,pe._override&&te(j,pe._override);var Te=(xe===se?Re:ve)(pe._level);Te<=Ee&&Be===0&&ke===0?(nt++,De.push({_level:Te,_override:0,_isolate:1,_isolInitIndex:j})):Be++}else if(xe&ae){if(Be>0)Be--;else if(nt>0){for(ke=0;!De[De.length-1]._isolate;)De.pop();var be=De[De.length-1]._isolInitIndex;be!=null&&(fe.set(be,j),fe.set(j,be)),De.pop(),nt--}pe=De[De.length-1],ie[j]=pe._level,pe._override&&te(j,pe._override)}else xe&k?(Be===0&&(ke>0?ke--:!pe._isolate&&De.length>1&&(De.pop(),pe=De[De.length-1])),ie[j]=pe._level):xe&P&&(ie[j]=ge.level);else ie[j]=pe._level,pe._override&&xe!==B&&te(j,pe._override)}for(var Ge=[],Ze=null,je=ge.start;je<=ge.end;je++){var qe=A[je];if(!(qe&l)){var Et=ie[je],bt=qe&s,Ct=qe===ae;Ze&&Et===Ze._level?(Ze._end=je,Ze._endsWithIsolInit=bt):Ge.push(Ze={_start:je,_end:je,_level:Et,_startsWithPDI:Ct,_endsWithIsolInit:bt})}}for(var cn=[],Zt=0;Zt<Ge.length;Zt++){var bn=Ge[Zt];if(!bn._startsWithPDI||bn._startsWithPDI&&!fe.has(bn._start)){for(var Hn=[Ze=bn],ci=void 0;Ze&&Ze._endsWithIsolInit&&(ci=fe.get(Ze._end))!=null;)for(var fn=Zt+1;fn<Ge.length;fn++)if(Ge[fn]._start===ci){Hn.push(Ze=Ge[fn]);break}for(var Vt=[],On=0;On<Hn.length;On++)for(var Qs=Hn[On],Jr=Qs._start;Jr<=Qs._end;Jr++)Vt.push(Jr);for(var Fl=ie[Vt[0]],aa=ge.level,Zr=Vt[0]-1;Zr>=0;Zr--)if(!(A[Zr]&l)){aa=ie[Zr];break}var D=Vt[Vt.length-1],J=ie[D],ce=ge.level;if(!(A[D]&s)){for(var le=D+1;le<=ge.end;le++)if(!(A[le]&l)){ce=ie[le];break}}cn.push({_seqIndices:Vt,_sosType:Math.max(aa,Fl)%2?w:T,_eosType:Math.max(ce,J)%2?w:T})}}for(var K=0;K<cn.length;K++){var Pe=cn[K],de=Pe._seqIndices,ze=Pe._sosType,Xe=Pe._eosType,Ye=ie[de[0]]&1?w:T;if(G.get(z))for(var Qe=0;Qe<de.length;Qe++){var We=de[Qe];if(A[We]&z){for(var at=ze,pt=Qe-1;pt>=0;pt--)if(!(A[de[pt]]&l)){at=A[de[pt]];break}te(We,at&(s|ae)?U:at)}}if(G.get(S))for(var gt=0;gt<de.length;gt++){var jt=de[gt];if(A[jt]&S)for(var ct=gt-1;ct>=-1;ct--){var $e=ct===-1?ze:A[de[ct]];if($e&o){$e===X&&te(jt,I);break}}}if(G.get(X))for(var wn=0;wn<de.length;wn++){var ht=de[wn];A[ht]&X&&te(ht,w)}if(G.get(x)||G.get(M))for(var qt=1;qt<de.length-1;qt++){var fi=de[qt];if(A[fi]&(x|M)){for(var It=0,wi=0,yt=qt-1;yt>=0&&(It=A[de[yt]],!!(It&l));yt--);for(var hn=qt+1;hn<de.length&&(wi=A[de[hn]],!!(wi&l));hn++);It===wi&&(A[fi]===x?It===S:It&(S|I))&&te(fi,It)}}if(G.get(S))for(var Qt=0;Qt<de.length;Qt++){var un=de[Qt];if(A[un]&S){for(var Tn=Qt-1;Tn>=0&&A[de[Tn]]&(F|l);Tn--)te(de[Tn],S);for(Qt++;Qt<de.length&&A[de[Qt]]&(F|l|S);Qt++)A[de[Qt]]!==S&&te(de[Qt],S)}}if(G.get(F)||G.get(x)||G.get(M))for(var dn=0;dn<de.length;dn++){var eo=de[dn];if(A[eo]&(F|x|M)){te(eo,U);for(var la=dn-1;la>=0&&A[de[la]]&l;la--)te(de[la],U);for(var ca=dn+1;ca<de.length&&A[de[ca]]&l;ca++)te(de[ca],U)}}if(G.get(S))for(var Nl=0,zh=ze;Nl<de.length;Nl++){var Gh=de[Nl],Ol=A[Gh];Ol&S?zh===T&&te(Gh,T):Ol&o&&(zh=Ol)}if(G.get(a)){var to=w|S|I,Vh=to|T,fa=[];{for(var Qr=[],es=0;es<de.length;es++)if(A[de[es]]&a){var no=he[de[es]],Hh=void 0;if(v(no)!==null)if(Qr.length<63)Qr.push({char:no,seqIndex:es});else break;else if((Hh=C(no))!==null)for(var io=Qr.length-1;io>=0;io--){var Bl=Qr[io].char;if(Bl===Hh||Bl===C(R(no))||v(R(Bl))===no){fa.push([Qr[io].seqIndex,es]),Qr.length=io;break}}}fa.sort(function(pn,Xn){return pn[0]-Xn[0]})}for(var kl=0;kl<fa.length;kl++){for(var Wh=fa[kl],ha=Wh[0],zl=Wh[1],Xh=!1,Wn=0,Gl=ha+1;Gl<zl;Gl++){var $h=de[Gl];if(A[$h]&Vh){Xh=!0;var jh=A[$h]&to?w:T;if(jh===Ye){Wn=jh;break}}}if(Xh&&!Wn){Wn=ze;for(var Vl=ha-1;Vl>=0;Vl--){var qh=de[Vl];if(A[qh]&Vh){var Yh=A[qh]&to?w:T;Yh!==Ye?Wn=Yh:Wn=Ye;break}}}if(Wn){if(A[de[ha]]=A[de[zl]]=Wn,Wn!==Ye){for(var ro=ha+1;ro<de.length;ro++)if(!(A[de[ro]]&l)){u(he[de[ro]])&z&&(A[de[ro]]=Wn);break}}if(Wn!==Ye){for(var so=zl+1;so<de.length;so++)if(!(A[de[so]]&l)){u(he[de[so]])&z&&(A[de[so]]=Wn);break}}}}for(var Xi=0;Xi<de.length;Xi++)if(A[de[Xi]]&a){for(var Kh=Xi,Hl=Xi,Wl=ze,oo=Xi-1;oo>=0;oo--)if(A[de[oo]]&l)Kh=oo;else{Wl=A[de[oo]]&to?w:T;break}for(var Jh=Xe,ao=Xi+1;ao<de.length;ao++)if(A[de[ao]]&(a|l))Hl=ao;else{Jh=A[de[ao]]&to?w:T;break}for(var Xl=Kh;Xl<=Hl;Xl++)A[de[Xl]]=Wl===Jh?Wl:Ye;Xi=Hl}}}for(var An=ge.start;An<=ge.end;An++){var e0=ie[An],ua=A[An];if(e0&1?ua&(T|S|I)&&ie[An]++:ua&w?ie[An]++:ua&(I|S)&&(ie[An]+=2),ua&l&&(ie[An]=An===0?ge.level:ie[An-1]),An===ge.end||u(he[An])&(O|P))for(var da=An;da>=0&&u(he[da])&c;da--)ie[da]=ge.level}}return{levels:ie,paragraphs:_e};function Zh(pn,Xn){for(var mn=pn;mn<he.length;mn++){var $i=A[mn];if($i&(w|X))return 1;if($i&(P|T)||Xn&&$i===ae)return 0;if($i&s){var Qh=t0(mn);mn=Qh===-1?he.length:Qh}}return 0}function t0(pn){for(var Xn=1,mn=pn+1;mn<he.length;mn++){var $i=A[mn];if($i&P)break;if($i&ae){if(--Xn===0)return mn}else $i&s&&Xn++}return-1}}var Ae="14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1",we;function ue(){if(!we){var he=_(Ae,!0),Ie=he.map,Ee=he.reverseMap;Ee.forEach(function(A,b){Ie.set(b,A)}),we=Ie}}function Ve(he){return ue(),we.get(he)||null}function W(he,Ie,Ee,A){var b=he.length;Ee=Math.max(0,Ee==null?0:+Ee),A=Math.min(b-1,A==null?b-1:+A);for(var G=new Map,te=Ee;te<=A;te++)if(Ie[te]&1){var ie=Ve(he[te]);ie!==null&&G.set(te,ie)}return G}function He(he,Ie,Ee,A){var b=he.length;Ee=Math.max(0,Ee==null?0:+Ee),A=Math.min(b-1,A==null?b-1:+A);var G=[];return Ie.paragraphs.forEach(function(te){var ie=Math.max(Ee,te.start),fe=Math.min(A,te.end);if(ie<fe){for(var _e=Ie.levels.slice(ie,fe+1),ge=fe;ge>=ie&&u(he[ge])&c;ge--)_e[ge]=te.level;for(var Se=te.level,Oe=1/0,ve=0;ve<_e.length;ve++){var Re=_e[ve];Re>Se&&(Se=Re),Re<Oe&&(Oe=Re|1)}for(var Ce=Se;Ce>=Oe;Ce--)for(var De=0;De<_e.length;De++)if(_e[De]>=Ce){for(var pe=De;De+1<_e.length&&_e[De+1]>=Ce;)De++;De>pe&&G.push([pe+ie,De+ie])}}}),G}function Ue(he,Ie,Ee,A){var b=Fe(he,Ie,Ee,A),G=[].concat(he);return b.forEach(function(te,ie){G[ie]=(Ie.levels[te]&1?Ve(he[te]):null)||he[te]}),G.join("")}function Fe(he,Ie,Ee,A){for(var b=He(he,Ie,Ee,A),G=[],te=0;te<he.length;te++)G[te]=te;return b.forEach(function(ie){for(var fe=ie[0],_e=ie[1],ge=G.slice(fe,_e+1),Se=ge.length;Se--;)G[_e-Se]=ge[Se]}),G}return e.closingToOpeningBracket=C,e.getBidiCharType=u,e.getBidiCharTypeName=d,e.getCanonicalBracket=R,e.getEmbeddingLevels=Me,e.getMirroredCharacter=Ve,e.getMirroredCharactersMap=W,e.getReorderSegments=He,e.getReorderedIndices=Fe,e.getReorderedString=Ue,e.openingToClosingBracket=v,Object.defineProperty(e,"__esModule",{value:!0}),e}({});return r}const Ug=/\bvoid\s+main\s*\(\s*\)\s*{/g;function Jf(r){const e=/^[ \t]*#include +<([\w\d./]+)>/gm;function t(n,i){let s=it[i];return s?Jf(s):n}return r.replace(e,t)}const Yt=[];for(let r=0;r<256;r++)Yt[r]=(r<16?"0":"")+r.toString(16);function HM(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Yt[r&255]+Yt[r>>8&255]+Yt[r>>16&255]+Yt[r>>24&255]+"-"+Yt[e&255]+Yt[e>>8&255]+"-"+Yt[e>>16&15|64]+Yt[e>>24&255]+"-"+Yt[t&63|128]+Yt[t>>8&255]+"-"+Yt[t>>16&255]+Yt[t>>24&255]+Yt[n&255]+Yt[n>>8&255]+Yt[n>>16&255]+Yt[n>>24&255]).toUpperCase()}const Er=Object.assign||function(){let r=arguments[0];for(let e=1,t=arguments.length;e<t;e++){let n=arguments[e];if(n)for(let i in n)Object.prototype.hasOwnProperty.call(n,i)&&(r[i]=n[i])}return r},WM=Date.now(),zd=new WeakMap,Gd=new Map;let XM=1e10;function Zf(r,e){const t=YM(e);let n=zd.get(r);if(n||zd.set(r,n=Object.create(null)),n[t])return new n[t];const i=`_onBeforeCompile${t}`,s=function(c,f){r.onBeforeCompile.call(this,c,f);const h=this.customProgramCacheKey()+"|"+c.vertexShader+"|"+c.fragmentShader;let u=Gd[h];if(!u){const d=$M(this,c,e,t);u=Gd[h]=d}c.vertexShader=u.vertexShader,c.fragmentShader=u.fragmentShader,Er(c.uniforms,this.uniforms),e.timeUniform&&(c.uniforms[e.timeUniform]={get value(){return Date.now()-WM}}),this[i]&&this[i](c)},o=function(){return a(e.chained?r:r.clone())},a=function(c){const f=Object.create(c,l);return Object.defineProperty(f,"baseMaterial",{value:r}),Object.defineProperty(f,"id",{value:XM++}),f.uuid=HM(),f.uniforms=Er({},c.uniforms,e.uniforms),f.defines=Er({},c.defines,e.defines),f.defines[`TROIKA_DERIVED_MATERIAL_${t}`]="",f.extensions=Er({},c.extensions,e.extensions),f._listeners=void 0,f},l={constructor:{value:o},isDerivedMaterial:{value:!0},type:{get:()=>r.type,set:c=>{r.type=c}},isDerivedFrom:{writable:!0,configurable:!0,value:function(c){const f=this.baseMaterial;return c===f||f.isDerivedMaterial&&f.isDerivedFrom(c)||!1}},customProgramCacheKey:{writable:!0,configurable:!0,value:function(){return r.customProgramCacheKey()+"|"+t}},onBeforeCompile:{get(){return s},set(c){this[i]=c}},copy:{writable:!0,configurable:!0,value:function(c){return r.copy.call(this,c),!r.isShaderMaterial&&!r.isDerivedMaterial&&(Er(this.extensions,c.extensions),Er(this.defines,c.defines),Er(this.uniforms,um.clone(c.uniforms))),this}},clone:{writable:!0,configurable:!0,value:function(){const c=new r.constructor;return a(c).copy(this)}},getDepthMaterial:{writable:!0,configurable:!0,value:function(){let c=this._depthMaterial;return c||(c=this._depthMaterial=Zf(r.isDerivedMaterial?r.getDepthMaterial():new Em({depthPacking:em}),e),c.defines.IS_DEPTH_MATERIAL="",c.uniforms=this.uniforms),c}},getDistanceMaterial:{writable:!0,configurable:!0,value:function(){let c=this._distanceMaterial;return c||(c=this._distanceMaterial=Zf(r.isDerivedMaterial?r.getDistanceMaterial():new Mm,e),c.defines.IS_DISTANCE_MATERIAL="",c.uniforms=this.uniforms),c}},dispose:{writable:!0,configurable:!0,value(){const{_depthMaterial:c,_distanceMaterial:f}=this;c&&c.dispose(),f&&f.dispose(),r.dispose.call(this)}}};return n[t]=o,new o}function $M(r,{vertexShader:e,fragmentShader:t},n,i){let{vertexDefs:s,vertexMainIntro:o,vertexMainOutro:a,vertexTransform:l,fragmentDefs:c,fragmentMainIntro:f,fragmentMainOutro:h,fragmentColorTransform:u,customRewriter:d,timeUniform:g}=n;if(s=s||"",o=o||"",a=a||"",c=c||"",f=f||"",h=h||"",(l||d)&&(e=Jf(e)),(u||d)&&(t=t.replace(/^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,`
//!BEGIN_POST_CHUNK $1
$&
//!END_POST_CHUNK
`),t=Jf(t)),d){let _=d({vertexShader:e,fragmentShader:t});e=_.vertexShader,t=_.fragmentShader}if(u){let _=[];t=t.replace(/^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,m=>(_.push(m),"")),h=`${u}
${_.join(`
`)}
${h}`}if(g){const _=`
uniform float ${g};
`;s=_+s,c=_+c}return l&&(e=`vec3 troika_position_${i};
vec3 troika_normal_${i};
vec2 troika_uv_${i};
${e}
`,s=`${s}
void troikaVertexTransform${i}() {
  vec3 position = troika_position_${i};
  vec3 normal = troika_normal_${i};
  vec2 uv = troika_uv_${i};
  ${l}
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
`,e=e.replace(/\b(position|normal|uv)\b/g,(_,m,p,y)=>/\battribute\s+vec[23]\s+$/.test(y.substr(0,p))?m:`troika_${m}_${i}`),r.map&&r.map.channel>0||(e=e.replace(/\bMAP_UV\b/g,`troika_uv_${i}`))),e=Vd(e,i,s,o,a),t=Vd(t,i,c,f,h),{vertexShader:e,fragmentShader:t}}function Vd(r,e,t,n,i){return(n||i||t)&&(r=r.replace(Ug,`
${t}
void troikaOrigMain${e}() {`),r+=`
void main() {
  ${n}
  troikaOrigMain${e}();
  ${i}
}`),r}function jM(r,e){return r==="uniforms"?void 0:typeof e=="function"?e.toString():e}let qM=0;const Hd=new Map;function YM(r){const e=JSON.stringify(r,jM);let t=Hd.get(e);return t==null&&Hd.set(e,t=++qM),t}/*!
Custom build of Typr.ts (https://github.com/fredli74/Typr.ts) for use in Troika text rendering.
Original MIT license applies: https://github.com/fredli74/Typr.ts/blob/master/LICENSE
*/function KM(){return typeof window=="undefined"&&(self.window=self),function(r){var e={parse:function(i){var s=e._bin,o=new Uint8Array(i);if(s.readASCII(o,0,4)=="ttcf"){var a=4;s.readUshort(o,a),a+=2,s.readUshort(o,a),a+=2;var l=s.readUint(o,a);a+=4;for(var c=[],f=0;f<l;f++){var h=s.readUint(o,a);a+=4,c.push(e._readFont(o,h))}return c}return[e._readFont(o,0)]},_readFont:function(i,s){var o=e._bin,a=s;o.readFixed(i,s),s+=4;var l=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2;for(var c=["cmap","head","hhea","maxp","hmtx","name","OS/2","post","loca","glyf","kern","CFF ","GDEF","GPOS","GSUB","SVG "],f={_data:i,_offset:a},h={},u=0;u<l;u++){var d=o.readASCII(i,s,4);s+=4,o.readUint(i,s),s+=4;var g=o.readUint(i,s);s+=4;var _=o.readUint(i,s);s+=4,h[d]={offset:g,length:_}}for(u=0;u<c.length;u++){var m=c[u];h[m]&&(f[m.trim()]=e[m.trim()].parse(i,h[m].offset,h[m].length,f))}return f},_tabOffset:function(i,s,o){for(var a=e._bin,l=a.readUshort(i,o+4),c=o+12,f=0;f<l;f++){var h=a.readASCII(i,c,4);c+=4,a.readUint(i,c),c+=4;var u=a.readUint(i,c);if(c+=4,a.readUint(i,c),c+=4,h==s)return u}return 0}};e._bin={readFixed:function(i,s){return(i[s]<<8|i[s+1])+(i[s+2]<<8|i[s+3])/65540},readF2dot14:function(i,s){return e._bin.readShort(i,s)/16384},readInt:function(i,s){return e._bin._view(i).getInt32(s)},readInt8:function(i,s){return e._bin._view(i).getInt8(s)},readShort:function(i,s){return e._bin._view(i).getInt16(s)},readUshort:function(i,s){return e._bin._view(i).getUint16(s)},readUshorts:function(i,s,o){for(var a=[],l=0;l<o;l++)a.push(e._bin.readUshort(i,s+2*l));return a},readUint:function(i,s){return e._bin._view(i).getUint32(s)},readUint64:function(i,s){return 4294967296*e._bin.readUint(i,s)+e._bin.readUint(i,s+4)},readASCII:function(i,s,o){for(var a="",l=0;l<o;l++)a+=String.fromCharCode(i[s+l]);return a},readUnicode:function(i,s,o){for(var a="",l=0;l<o;l++){var c=i[s++]<<8|i[s++];a+=String.fromCharCode(c)}return a},_tdec:typeof window!="undefined"&&window.TextDecoder?new window.TextDecoder:null,readUTF8:function(i,s,o){var a=e._bin._tdec;return a&&s==0&&o==i.length?a.decode(i):e._bin.readASCII(i,s,o)},readBytes:function(i,s,o){for(var a=[],l=0;l<o;l++)a.push(i[s+l]);return a},readASCIIArray:function(i,s,o){for(var a=[],l=0;l<o;l++)a.push(String.fromCharCode(i[s+l]));return a},_view:function(i){return i._dataView||(i._dataView=i.buffer?new DataView(i.buffer,i.byteOffset,i.byteLength):new DataView(new Uint8Array(i).buffer))}},e._lctf={},e._lctf.parse=function(i,s,o,a,l){var c=e._bin,f={},h=s;c.readFixed(i,s),s+=4;var u=c.readUshort(i,s);s+=2;var d=c.readUshort(i,s);s+=2;var g=c.readUshort(i,s);return s+=2,f.scriptList=e._lctf.readScriptList(i,h+u),f.featureList=e._lctf.readFeatureList(i,h+d),f.lookupList=e._lctf.readLookupList(i,h+g,l),f},e._lctf.readLookupList=function(i,s,o){var a=e._bin,l=s,c=[],f=a.readUshort(i,s);s+=2;for(var h=0;h<f;h++){var u=a.readUshort(i,s);s+=2;var d=e._lctf.readLookupTable(i,l+u,o);c.push(d)}return c},e._lctf.readLookupTable=function(i,s,o){var a=e._bin,l=s,c={tabs:[]};c.ltype=a.readUshort(i,s),s+=2,c.flag=a.readUshort(i,s),s+=2;var f=a.readUshort(i,s);s+=2;for(var h=c.ltype,u=0;u<f;u++){var d=a.readUshort(i,s);s+=2;var g=o(i,h,l+d,c);c.tabs.push(g)}return c},e._lctf.numOfOnes=function(i){for(var s=0,o=0;o<32;o++)i>>>o&1&&s++;return s},e._lctf.readClassDef=function(i,s){var o=e._bin,a=[],l=o.readUshort(i,s);if(s+=2,l==1){var c=o.readUshort(i,s);s+=2;var f=o.readUshort(i,s);s+=2;for(var h=0;h<f;h++)a.push(c+h),a.push(c+h),a.push(o.readUshort(i,s)),s+=2}if(l==2){var u=o.readUshort(i,s);for(s+=2,h=0;h<u;h++)a.push(o.readUshort(i,s)),s+=2,a.push(o.readUshort(i,s)),s+=2,a.push(o.readUshort(i,s)),s+=2}return a},e._lctf.getInterval=function(i,s){for(var o=0;o<i.length;o+=3){var a=i[o],l=i[o+1];if(i[o+2],a<=s&&s<=l)return o}return-1},e._lctf.readCoverage=function(i,s){var o=e._bin,a={};a.fmt=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);return s+=2,a.fmt==1&&(a.tab=o.readUshorts(i,s,l)),a.fmt==2&&(a.tab=o.readUshorts(i,s,3*l)),a},e._lctf.coverageIndex=function(i,s){var o=i.tab;if(i.fmt==1)return o.indexOf(s);if(i.fmt==2){var a=e._lctf.getInterval(o,s);if(a!=-1)return o[a+2]+(s-o[a])}return-1},e._lctf.readFeatureList=function(i,s){var o=e._bin,a=s,l=[],c=o.readUshort(i,s);s+=2;for(var f=0;f<c;f++){var h=o.readASCII(i,s,4);s+=4;var u=o.readUshort(i,s);s+=2;var d=e._lctf.readFeatureTable(i,a+u);d.tag=h.trim(),l.push(d)}return l},e._lctf.readFeatureTable=function(i,s){var o=e._bin,a=s,l={},c=o.readUshort(i,s);s+=2,c>0&&(l.featureParams=a+c);var f=o.readUshort(i,s);s+=2,l.tab=[];for(var h=0;h<f;h++)l.tab.push(o.readUshort(i,s+2*h));return l},e._lctf.readScriptList=function(i,s){var o=e._bin,a=s,l={},c=o.readUshort(i,s);s+=2;for(var f=0;f<c;f++){var h=o.readASCII(i,s,4);s+=4;var u=o.readUshort(i,s);s+=2,l[h.trim()]=e._lctf.readScriptTable(i,a+u)}return l},e._lctf.readScriptTable=function(i,s){var o=e._bin,a=s,l={},c=o.readUshort(i,s);s+=2,c>0&&(l.default=e._lctf.readLangSysTable(i,a+c));var f=o.readUshort(i,s);s+=2;for(var h=0;h<f;h++){var u=o.readASCII(i,s,4);s+=4;var d=o.readUshort(i,s);s+=2,l[u.trim()]=e._lctf.readLangSysTable(i,a+d)}return l},e._lctf.readLangSysTable=function(i,s){var o=e._bin,a={};o.readUshort(i,s),s+=2,a.reqFeature=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);return s+=2,a.features=o.readUshorts(i,s,l),a},e.CFF={},e.CFF.parse=function(i,s,o){var a=e._bin;(i=new Uint8Array(i.buffer,s,o))[s=0],i[++s],i[++s],i[++s],s++;var l=[];s=e.CFF.readIndex(i,s,l);for(var c=[],f=0;f<l.length-1;f++)c.push(a.readASCII(i,s+l[f],l[f+1]-l[f]));s+=l[l.length-1];var h=[];s=e.CFF.readIndex(i,s,h);var u=[];for(f=0;f<h.length-1;f++)u.push(e.CFF.readDict(i,s+h[f],s+h[f+1]));s+=h[h.length-1];var d=u[0],g=[];s=e.CFF.readIndex(i,s,g);var _=[];for(f=0;f<g.length-1;f++)_.push(a.readASCII(i,s+g[f],g[f+1]-g[f]));if(s+=g[g.length-1],e.CFF.readSubrs(i,s,d),d.CharStrings){s=d.CharStrings,g=[],s=e.CFF.readIndex(i,s,g);var m=[];for(f=0;f<g.length-1;f++)m.push(a.readBytes(i,s+g[f],g[f+1]-g[f]));d.CharStrings=m}if(d.ROS){s=d.FDArray;var p=[];for(s=e.CFF.readIndex(i,s,p),d.FDArray=[],f=0;f<p.length-1;f++){var y=e.CFF.readDict(i,s+p[f],s+p[f+1]);e.CFF._readFDict(i,y,_),d.FDArray.push(y)}s+=p[p.length-1],s=d.FDSelect,d.FDSelect=[];var E=i[s];if(s++,E!=3)throw E;var v=a.readUshort(i,s);for(s+=2,f=0;f<v+1;f++)d.FDSelect.push(a.readUshort(i,s),i[s+2]),s+=3}return d.Encoding&&(d.Encoding=e.CFF.readEncoding(i,d.Encoding,d.CharStrings.length)),d.charset&&(d.charset=e.CFF.readCharset(i,d.charset,d.CharStrings.length)),e.CFF._readFDict(i,d,_),d},e.CFF._readFDict=function(i,s,o){var a;for(var l in s.Private&&(a=s.Private[1],s.Private=e.CFF.readDict(i,a,a+s.Private[0]),s.Private.Subrs&&e.CFF.readSubrs(i,a+s.Private.Subrs,s.Private)),s)["FamilyName","FontName","FullName","Notice","version","Copyright"].indexOf(l)!=-1&&(s[l]=o[s[l]-426+35])},e.CFF.readSubrs=function(i,s,o){var a=e._bin,l=[];s=e.CFF.readIndex(i,s,l);var c,f=l.length;c=f<1240?107:f<33900?1131:32768,o.Bias=c,o.Subrs=[];for(var h=0;h<l.length-1;h++)o.Subrs.push(a.readBytes(i,s+l[h],l[h+1]-l[h]))},e.CFF.tableSE=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,0,111,112,113,114,0,115,116,117,118,119,120,121,122,0,123,0,124,125,126,127,128,129,130,131,0,132,133,0,134,135,136,137,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,0,139,0,0,0,0,140,141,142,143,0,0,0,0,0,144,0,0,0,145,0,0,146,147,148,149,0,0,0,0],e.CFF.glyphByUnicode=function(i,s){for(var o=0;o<i.charset.length;o++)if(i.charset[o]==s)return o;return-1},e.CFF.glyphBySE=function(i,s){return s<0||s>255?-1:e.CFF.glyphByUnicode(i,e.CFF.tableSE[s])},e.CFF.readEncoding=function(i,s,o){e._bin;var a=[".notdef"],l=i[s];if(s++,l!=0)throw"error: unknown encoding format: "+l;var c=i[s];s++;for(var f=0;f<c;f++)a.push(i[s+f]);return a},e.CFF.readCharset=function(i,s,o){var a=e._bin,l=[".notdef"],c=i[s];if(s++,c==0)for(var f=0;f<o;f++){var h=a.readUshort(i,s);s+=2,l.push(h)}else{if(c!=1&&c!=2)throw"error: format: "+c;for(;l.length<o;){h=a.readUshort(i,s),s+=2;var u=0;for(c==1?(u=i[s],s++):(u=a.readUshort(i,s),s+=2),f=0;f<=u;f++)l.push(h),h++}}return l},e.CFF.readIndex=function(i,s,o){var a=e._bin,l=a.readUshort(i,s)+1,c=i[s+=2];if(s++,c==1)for(var f=0;f<l;f++)o.push(i[s+f]);else if(c==2)for(f=0;f<l;f++)o.push(a.readUshort(i,s+2*f));else if(c==3)for(f=0;f<l;f++)o.push(16777215&a.readUint(i,s+3*f-1));else if(l!=1)throw"unsupported offset size: "+c+", count: "+l;return(s+=l*c)-1},e.CFF.getCharString=function(i,s,o){var a=e._bin,l=i[s],c=i[s+1];i[s+2],i[s+3],i[s+4];var f=1,h=null,u=null;l<=20&&(h=l,f=1),l==12&&(h=100*l+c,f=2),21<=l&&l<=27&&(h=l,f=1),l==28&&(u=a.readShort(i,s+1),f=3),29<=l&&l<=31&&(h=l,f=1),32<=l&&l<=246&&(u=l-139,f=1),247<=l&&l<=250&&(u=256*(l-247)+c+108,f=2),251<=l&&l<=254&&(u=256*-(l-251)-c-108,f=2),l==255&&(u=a.readInt(i,s+1)/65535,f=5),o.val=u!=null?u:"o"+h,o.size=f},e.CFF.readCharString=function(i,s,o){for(var a=s+o,l=e._bin,c=[];s<a;){var f=i[s],h=i[s+1];i[s+2],i[s+3],i[s+4];var u=1,d=null,g=null;f<=20&&(d=f,u=1),f==12&&(d=100*f+h,u=2),f!=19&&f!=20||(d=f,u=2),21<=f&&f<=27&&(d=f,u=1),f==28&&(g=l.readShort(i,s+1),u=3),29<=f&&f<=31&&(d=f,u=1),32<=f&&f<=246&&(g=f-139,u=1),247<=f&&f<=250&&(g=256*(f-247)+h+108,u=2),251<=f&&f<=254&&(g=256*-(f-251)-h-108,u=2),f==255&&(g=l.readInt(i,s+1)/65535,u=5),c.push(g!=null?g:"o"+d),s+=u}return c},e.CFF.readDict=function(i,s,o){for(var a=e._bin,l={},c=[];s<o;){var f=i[s],h=i[s+1];i[s+2],i[s+3],i[s+4];var u=1,d=null,g=null;if(f==28&&(g=a.readShort(i,s+1),u=3),f==29&&(g=a.readInt(i,s+1),u=5),32<=f&&f<=246&&(g=f-139,u=1),247<=f&&f<=250&&(g=256*(f-247)+h+108,u=2),251<=f&&f<=254&&(g=256*-(f-251)-h-108,u=2),f==255)throw g=a.readInt(i,s+1)/65535,u=5,"unknown number";if(f==30){var _=[];for(u=1;;){var m=i[s+u];u++;var p=m>>4,y=15&m;if(p!=15&&_.push(p),y!=15&&_.push(y),y==15)break}for(var E="",v=[0,1,2,3,4,5,6,7,8,9,".","e","e-","reserved","-","endOfNumber"],C=0;C<_.length;C++)E+=v[_[C]];g=parseFloat(E)}f<=21&&(d=["version","Notice","FullName","FamilyName","Weight","FontBBox","BlueValues","OtherBlues","FamilyBlues","FamilyOtherBlues","StdHW","StdVW","escape","UniqueID","XUID","charset","Encoding","CharStrings","Private","Subrs","defaultWidthX","nominalWidthX"][f],u=1,f==12&&(d=["Copyright","isFixedPitch","ItalicAngle","UnderlinePosition","UnderlineThickness","PaintType","CharstringType","FontMatrix","StrokeWidth","BlueScale","BlueShift","BlueFuzz","StemSnapH","StemSnapV","ForceBold",0,0,"LanguageGroup","ExpansionFactor","initialRandomSeed","SyntheticBase","PostScript","BaseFontName","BaseFontBlend",0,0,0,0,0,0,"ROS","CIDFontVersion","CIDFontRevision","CIDFontType","CIDCount","UIDBase","FDArray","FDSelect","FontName"][h],u=2)),d!=null?(l[d]=c.length==1?c[0]:c,c=[]):c.push(g),s+=u}return l},e.cmap={},e.cmap.parse=function(i,s,o){i=new Uint8Array(i.buffer,s,o),s=0;var a=e._bin,l={};a.readUshort(i,s),s+=2;var c=a.readUshort(i,s);s+=2;var f=[];l.tables=[];for(var h=0;h<c;h++){var u=a.readUshort(i,s);s+=2;var d=a.readUshort(i,s);s+=2;var g=a.readUint(i,s);s+=4;var _="p"+u+"e"+d,m=f.indexOf(g);if(m==-1){var p;m=l.tables.length,f.push(g);var y=a.readUshort(i,g);y==0?p=e.cmap.parse0(i,g):y==4?p=e.cmap.parse4(i,g):y==6?p=e.cmap.parse6(i,g):y==12?p=e.cmap.parse12(i,g):console.debug("unknown format: "+y,u,d,g),l.tables.push(p)}if(l[_]!=null)throw"multiple tables for one platform+encoding";l[_]=m}return l},e.cmap.parse0=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2,a.map=[];for(var c=0;c<l-6;c++)a.map.push(i[s+c]);return a},e.cmap.parse4=function(i,s){var o=e._bin,a=s,l={};l.format=o.readUshort(i,s),s+=2;var c=o.readUshort(i,s);s+=2,o.readUshort(i,s),s+=2;var f=o.readUshort(i,s);s+=2;var h=f/2;l.searchRange=o.readUshort(i,s),s+=2,l.entrySelector=o.readUshort(i,s),s+=2,l.rangeShift=o.readUshort(i,s),s+=2,l.endCount=o.readUshorts(i,s,h),s+=2*h,s+=2,l.startCount=o.readUshorts(i,s,h),s+=2*h,l.idDelta=[];for(var u=0;u<h;u++)l.idDelta.push(o.readShort(i,s)),s+=2;for(l.idRangeOffset=o.readUshorts(i,s,h),s+=2*h,l.glyphIdArray=[];s<a+c;)l.glyphIdArray.push(o.readUshort(i,s)),s+=2;return l},e.cmap.parse6=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,o.readUshort(i,s),s+=2,a.firstCode=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);s+=2,a.glyphIdArray=[];for(var c=0;c<l;c++)a.glyphIdArray.push(o.readUshort(i,s)),s+=2;return a},e.cmap.parse12=function(i,s){var o=e._bin,a={};a.format=o.readUshort(i,s),s+=2,s+=2,o.readUint(i,s),s+=4,o.readUint(i,s),s+=4;var l=o.readUint(i,s);s+=4,a.groups=[];for(var c=0;c<l;c++){var f=s+12*c,h=o.readUint(i,f+0),u=o.readUint(i,f+4),d=o.readUint(i,f+8);a.groups.push([h,u,d])}return a},e.glyf={},e.glyf.parse=function(i,s,o,a){for(var l=[],c=0;c<a.maxp.numGlyphs;c++)l.push(null);return l},e.glyf._parseGlyf=function(i,s){var o=e._bin,a=i._data,l=e._tabOffset(a,"glyf",i._offset)+i.loca[s];if(i.loca[s]==i.loca[s+1])return null;var c={};if(c.noc=o.readShort(a,l),l+=2,c.xMin=o.readShort(a,l),l+=2,c.yMin=o.readShort(a,l),l+=2,c.xMax=o.readShort(a,l),l+=2,c.yMax=o.readShort(a,l),l+=2,c.xMin>=c.xMax||c.yMin>=c.yMax)return null;if(c.noc>0){c.endPts=[];for(var f=0;f<c.noc;f++)c.endPts.push(o.readUshort(a,l)),l+=2;var h=o.readUshort(a,l);if(l+=2,a.length-l<h)return null;c.instructions=o.readBytes(a,l,h),l+=h;var u=c.endPts[c.noc-1]+1;for(c.flags=[],f=0;f<u;f++){var d=a[l];if(l++,c.flags.push(d),(8&d)!=0){var g=a[l];l++;for(var _=0;_<g;_++)c.flags.push(d),f++}}for(c.xs=[],f=0;f<u;f++){var m=(2&c.flags[f])!=0,p=(16&c.flags[f])!=0;m?(c.xs.push(p?a[l]:-a[l]),l++):p?c.xs.push(0):(c.xs.push(o.readShort(a,l)),l+=2)}for(c.ys=[],f=0;f<u;f++)m=(4&c.flags[f])!=0,p=(32&c.flags[f])!=0,m?(c.ys.push(p?a[l]:-a[l]),l++):p?c.ys.push(0):(c.ys.push(o.readShort(a,l)),l+=2);var y=0,E=0;for(f=0;f<u;f++)y+=c.xs[f],E+=c.ys[f],c.xs[f]=y,c.ys[f]=E}else{var v;c.parts=[];do{v=o.readUshort(a,l),l+=2;var C={m:{a:1,b:0,c:0,d:1,tx:0,ty:0},p1:-1,p2:-1};if(c.parts.push(C),C.glyphIndex=o.readUshort(a,l),l+=2,1&v){var R=o.readShort(a,l);l+=2;var T=o.readShort(a,l);l+=2}else R=o.readInt8(a,l),l++,T=o.readInt8(a,l),l++;2&v?(C.m.tx=R,C.m.ty=T):(C.p1=R,C.p2=T),8&v?(C.m.a=C.m.d=o.readF2dot14(a,l),l+=2):64&v?(C.m.a=o.readF2dot14(a,l),l+=2,C.m.d=o.readF2dot14(a,l),l+=2):128&v&&(C.m.a=o.readF2dot14(a,l),l+=2,C.m.b=o.readF2dot14(a,l),l+=2,C.m.c=o.readF2dot14(a,l),l+=2,C.m.d=o.readF2dot14(a,l),l+=2)}while(32&v);if(256&v){var w=o.readUshort(a,l);for(l+=2,c.instr=[],f=0;f<w;f++)c.instr.push(a[l]),l++}}return c},e.GDEF={},e.GDEF.parse=function(i,s,o,a){var l=s;s+=4;var c=e._bin.readUshort(i,s);return{glyphClassDef:c===0?null:e._lctf.readClassDef(i,l+c)}},e.GPOS={},e.GPOS.parse=function(i,s,o,a){return e._lctf.parse(i,s,o,a,e.GPOS.subt)},e.GPOS.subt=function(i,s,o,a){var l=e._bin,c=o,f={};if(f.fmt=l.readUshort(i,o),o+=2,s==1||s==2||s==3||s==7||s==8&&f.fmt<=2){var h=l.readUshort(i,o);o+=2,f.coverage=e._lctf.readCoverage(i,h+c)}if(s==1&&f.fmt==1){var u=l.readUshort(i,o);o+=2,u!=0&&(f.pos=e.GPOS.readValueRecord(i,o,u))}else if(s==2&&f.fmt>=1&&f.fmt<=2){u=l.readUshort(i,o),o+=2;var d=l.readUshort(i,o);o+=2;var g=e._lctf.numOfOnes(u),_=e._lctf.numOfOnes(d);if(f.fmt==1){f.pairsets=[];var m=l.readUshort(i,o);o+=2;for(var p=0;p<m;p++){var y=c+l.readUshort(i,o);o+=2;var E=l.readUshort(i,y);y+=2;for(var v=[],C=0;C<E;C++){var R=l.readUshort(i,y);y+=2,u!=0&&(I=e.GPOS.readValueRecord(i,y,u),y+=2*g),d!=0&&(M=e.GPOS.readValueRecord(i,y,d),y+=2*_),v.push({gid2:R,val1:I,val2:M})}f.pairsets.push(v)}}if(f.fmt==2){var T=l.readUshort(i,o);o+=2;var w=l.readUshort(i,o);o+=2;var S=l.readUshort(i,o);o+=2;var x=l.readUshort(i,o);for(o+=2,f.classDef1=e._lctf.readClassDef(i,c+T),f.classDef2=e._lctf.readClassDef(i,c+w),f.matrix=[],p=0;p<S;p++){var F=[];for(C=0;C<x;C++){var I=null,M=null;u!=0&&(I=e.GPOS.readValueRecord(i,o,u),o+=2*g),d!=0&&(M=e.GPOS.readValueRecord(i,o,d),o+=2*_),F.push({val1:I,val2:M})}f.matrix.push(F)}}}else if(s==4&&f.fmt==1)f.markCoverage=e._lctf.readCoverage(i,l.readUshort(i,o)+c),f.baseCoverage=e._lctf.readCoverage(i,l.readUshort(i,o+2)+c),f.markClassCount=l.readUshort(i,o+4),f.markArray=e.GPOS.readMarkArray(i,l.readUshort(i,o+6)+c),f.baseArray=e.GPOS.readBaseArray(i,l.readUshort(i,o+8)+c,f.markClassCount);else if(s==6&&f.fmt==1)f.mark1Coverage=e._lctf.readCoverage(i,l.readUshort(i,o)+c),f.mark2Coverage=e._lctf.readCoverage(i,l.readUshort(i,o+2)+c),f.markClassCount=l.readUshort(i,o+4),f.mark1Array=e.GPOS.readMarkArray(i,l.readUshort(i,o+6)+c),f.mark2Array=e.GPOS.readBaseArray(i,l.readUshort(i,o+8)+c,f.markClassCount);else{if(s==9&&f.fmt==1){var P=l.readUshort(i,o);o+=2;var O=l.readUint(i,o);if(o+=4,a.ltype==9)a.ltype=P;else if(a.ltype!=P)throw"invalid extension substitution";return e.GPOS.subt(i,a.ltype,c+O)}console.debug("unsupported GPOS table LookupType",s,"format",f.fmt)}return f},e.GPOS.readValueRecord=function(i,s,o){var a=e._bin,l=[];return l.push(1&o?a.readShort(i,s):0),s+=1&o?2:0,l.push(2&o?a.readShort(i,s):0),s+=2&o?2:0,l.push(4&o?a.readShort(i,s):0),s+=4&o?2:0,l.push(8&o?a.readShort(i,s):0),s+=8&o?2:0,l},e.GPOS.readBaseArray=function(i,s,o){var a=e._bin,l=[],c=s,f=a.readUshort(i,s);s+=2;for(var h=0;h<f;h++){for(var u=[],d=0;d<o;d++)u.push(e.GPOS.readAnchorRecord(i,c+a.readUshort(i,s))),s+=2;l.push(u)}return l},e.GPOS.readMarkArray=function(i,s){var o=e._bin,a=[],l=s,c=o.readUshort(i,s);s+=2;for(var f=0;f<c;f++){var h=e.GPOS.readAnchorRecord(i,o.readUshort(i,s+2)+l);h.markClass=o.readUshort(i,s),a.push(h),s+=4}return a},e.GPOS.readAnchorRecord=function(i,s){var o=e._bin,a={};return a.fmt=o.readUshort(i,s),a.x=o.readShort(i,s+2),a.y=o.readShort(i,s+4),a},e.GSUB={},e.GSUB.parse=function(i,s,o,a){return e._lctf.parse(i,s,o,a,e.GSUB.subt)},e.GSUB.subt=function(i,s,o,a){var l=e._bin,c=o,f={};if(f.fmt=l.readUshort(i,o),o+=2,s!=1&&s!=2&&s!=4&&s!=5&&s!=6)return null;if(s==1||s==2||s==4||s==5&&f.fmt<=2||s==6&&f.fmt<=2){var h=l.readUshort(i,o);o+=2,f.coverage=e._lctf.readCoverage(i,c+h)}if(s==1&&f.fmt>=1&&f.fmt<=2){if(f.fmt==1)f.delta=l.readShort(i,o),o+=2;else if(f.fmt==2){var u=l.readUshort(i,o);o+=2,f.newg=l.readUshorts(i,o,u),o+=2*f.newg.length}}else if(s==2&&f.fmt==1){u=l.readUshort(i,o),o+=2,f.seqs=[];for(var d=0;d<u;d++){var g=l.readUshort(i,o)+c;o+=2;var _=l.readUshort(i,g);f.seqs.push(l.readUshorts(i,g+2,_))}}else if(s==4)for(f.vals=[],u=l.readUshort(i,o),o+=2,d=0;d<u;d++){var m=l.readUshort(i,o);o+=2,f.vals.push(e.GSUB.readLigatureSet(i,c+m))}else if(s==5&&f.fmt==2){if(f.fmt==2){var p=l.readUshort(i,o);o+=2,f.cDef=e._lctf.readClassDef(i,c+p),f.scset=[];var y=l.readUshort(i,o);for(o+=2,d=0;d<y;d++){var E=l.readUshort(i,o);o+=2,f.scset.push(E==0?null:e.GSUB.readSubClassSet(i,c+E))}}}else if(s==6&&f.fmt==3){if(f.fmt==3){for(d=0;d<3;d++){u=l.readUshort(i,o),o+=2;for(var v=[],C=0;C<u;C++)v.push(e._lctf.readCoverage(i,c+l.readUshort(i,o+2*C)));o+=2*u,d==0&&(f.backCvg=v),d==1&&(f.inptCvg=v),d==2&&(f.ahedCvg=v)}u=l.readUshort(i,o),o+=2,f.lookupRec=e.GSUB.readSubstLookupRecords(i,o,u)}}else{if(s==7&&f.fmt==1){var R=l.readUshort(i,o);o+=2;var T=l.readUint(i,o);if(o+=4,a.ltype==9)a.ltype=R;else if(a.ltype!=R)throw"invalid extension substitution";return e.GSUB.subt(i,a.ltype,c+T)}console.debug("unsupported GSUB table LookupType",s,"format",f.fmt)}return f},e.GSUB.readSubClassSet=function(i,s){var o=e._bin.readUshort,a=s,l=[],c=o(i,s);s+=2;for(var f=0;f<c;f++){var h=o(i,s);s+=2,l.push(e.GSUB.readSubClassRule(i,a+h))}return l},e.GSUB.readSubClassRule=function(i,s){var o=e._bin.readUshort,a={},l=o(i,s),c=o(i,s+=2);s+=2,a.input=[];for(var f=0;f<l-1;f++)a.input.push(o(i,s)),s+=2;return a.substLookupRecords=e.GSUB.readSubstLookupRecords(i,s,c),a},e.GSUB.readSubstLookupRecords=function(i,s,o){for(var a=e._bin.readUshort,l=[],c=0;c<o;c++)l.push(a(i,s),a(i,s+2)),s+=4;return l},e.GSUB.readChainSubClassSet=function(i,s){var o=e._bin,a=s,l=[],c=o.readUshort(i,s);s+=2;for(var f=0;f<c;f++){var h=o.readUshort(i,s);s+=2,l.push(e.GSUB.readChainSubClassRule(i,a+h))}return l},e.GSUB.readChainSubClassRule=function(i,s){for(var o=e._bin,a={},l=["backtrack","input","lookahead"],c=0;c<l.length;c++){var f=o.readUshort(i,s);s+=2,c==1&&f--,a[l[c]]=o.readUshorts(i,s,f),s+=2*a[l[c]].length}return f=o.readUshort(i,s),s+=2,a.subst=o.readUshorts(i,s,2*f),s+=2*a.subst.length,a},e.GSUB.readLigatureSet=function(i,s){var o=e._bin,a=s,l=[],c=o.readUshort(i,s);s+=2;for(var f=0;f<c;f++){var h=o.readUshort(i,s);s+=2,l.push(e.GSUB.readLigature(i,a+h))}return l},e.GSUB.readLigature=function(i,s){var o=e._bin,a={chain:[]};a.nglyph=o.readUshort(i,s),s+=2;var l=o.readUshort(i,s);s+=2;for(var c=0;c<l-1;c++)a.chain.push(o.readUshort(i,s)),s+=2;return a},e.head={},e.head.parse=function(i,s,o){var a=e._bin,l={};return a.readFixed(i,s),s+=4,l.fontRevision=a.readFixed(i,s),s+=4,a.readUint(i,s),s+=4,a.readUint(i,s),s+=4,l.flags=a.readUshort(i,s),s+=2,l.unitsPerEm=a.readUshort(i,s),s+=2,l.created=a.readUint64(i,s),s+=8,l.modified=a.readUint64(i,s),s+=8,l.xMin=a.readShort(i,s),s+=2,l.yMin=a.readShort(i,s),s+=2,l.xMax=a.readShort(i,s),s+=2,l.yMax=a.readShort(i,s),s+=2,l.macStyle=a.readUshort(i,s),s+=2,l.lowestRecPPEM=a.readUshort(i,s),s+=2,l.fontDirectionHint=a.readShort(i,s),s+=2,l.indexToLocFormat=a.readShort(i,s),s+=2,l.glyphDataFormat=a.readShort(i,s),s+=2,l},e.hhea={},e.hhea.parse=function(i,s,o){var a=e._bin,l={};return a.readFixed(i,s),s+=4,l.ascender=a.readShort(i,s),s+=2,l.descender=a.readShort(i,s),s+=2,l.lineGap=a.readShort(i,s),s+=2,l.advanceWidthMax=a.readUshort(i,s),s+=2,l.minLeftSideBearing=a.readShort(i,s),s+=2,l.minRightSideBearing=a.readShort(i,s),s+=2,l.xMaxExtent=a.readShort(i,s),s+=2,l.caretSlopeRise=a.readShort(i,s),s+=2,l.caretSlopeRun=a.readShort(i,s),s+=2,l.caretOffset=a.readShort(i,s),s+=2,s+=8,l.metricDataFormat=a.readShort(i,s),s+=2,l.numberOfHMetrics=a.readUshort(i,s),s+=2,l},e.hmtx={},e.hmtx.parse=function(i,s,o,a){for(var l=e._bin,c={aWidth:[],lsBearing:[]},f=0,h=0,u=0;u<a.maxp.numGlyphs;u++)u<a.hhea.numberOfHMetrics&&(f=l.readUshort(i,s),s+=2,h=l.readShort(i,s),s+=2),c.aWidth.push(f),c.lsBearing.push(h);return c},e.kern={},e.kern.parse=function(i,s,o,a){var l=e._bin,c=l.readUshort(i,s);if(s+=2,c==1)return e.kern.parseV1(i,s-2,o,a);var f=l.readUshort(i,s);s+=2;for(var h={glyph1:[],rval:[]},u=0;u<f;u++){s+=2,o=l.readUshort(i,s),s+=2;var d=l.readUshort(i,s);s+=2;var g=d>>>8;if((g&=15)!=0)throw"unknown kern table format: "+g;s=e.kern.readFormat0(i,s,h)}return h},e.kern.parseV1=function(i,s,o,a){var l=e._bin;l.readFixed(i,s),s+=4;var c=l.readUint(i,s);s+=4;for(var f={glyph1:[],rval:[]},h=0;h<c;h++){l.readUint(i,s),s+=4;var u=l.readUshort(i,s);s+=2,l.readUshort(i,s),s+=2;var d=u>>>8;if((d&=15)!=0)throw"unknown kern table format: "+d;s=e.kern.readFormat0(i,s,f)}return f},e.kern.readFormat0=function(i,s,o){var a=e._bin,l=-1,c=a.readUshort(i,s);s+=2,a.readUshort(i,s),s+=2,a.readUshort(i,s),s+=2,a.readUshort(i,s),s+=2;for(var f=0;f<c;f++){var h=a.readUshort(i,s);s+=2;var u=a.readUshort(i,s);s+=2;var d=a.readShort(i,s);s+=2,h!=l&&(o.glyph1.push(h),o.rval.push({glyph2:[],vals:[]}));var g=o.rval[o.rval.length-1];g.glyph2.push(u),g.vals.push(d),l=h}return s},e.loca={},e.loca.parse=function(i,s,o,a){var l=e._bin,c=[],f=a.head.indexToLocFormat,h=a.maxp.numGlyphs+1;if(f==0)for(var u=0;u<h;u++)c.push(l.readUshort(i,s+(u<<1))<<1);if(f==1)for(u=0;u<h;u++)c.push(l.readUint(i,s+(u<<2)));return c},e.maxp={},e.maxp.parse=function(i,s,o){var a=e._bin,l={},c=a.readUint(i,s);return s+=4,l.numGlyphs=a.readUshort(i,s),s+=2,c==65536&&(l.maxPoints=a.readUshort(i,s),s+=2,l.maxContours=a.readUshort(i,s),s+=2,l.maxCompositePoints=a.readUshort(i,s),s+=2,l.maxCompositeContours=a.readUshort(i,s),s+=2,l.maxZones=a.readUshort(i,s),s+=2,l.maxTwilightPoints=a.readUshort(i,s),s+=2,l.maxStorage=a.readUshort(i,s),s+=2,l.maxFunctionDefs=a.readUshort(i,s),s+=2,l.maxInstructionDefs=a.readUshort(i,s),s+=2,l.maxStackElements=a.readUshort(i,s),s+=2,l.maxSizeOfInstructions=a.readUshort(i,s),s+=2,l.maxComponentElements=a.readUshort(i,s),s+=2,l.maxComponentDepth=a.readUshort(i,s),s+=2),l},e.name={},e.name.parse=function(i,s,o){var a=e._bin,l={};a.readUshort(i,s),s+=2;var c=a.readUshort(i,s);s+=2,a.readUshort(i,s);for(var f,h=["copyright","fontFamily","fontSubfamily","ID","fullName","version","postScriptName","trademark","manufacturer","designer","description","urlVendor","urlDesigner","licence","licenceURL","---","typoFamilyName","typoSubfamilyName","compatibleFull","sampleText","postScriptCID","wwsFamilyName","wwsSubfamilyName","lightPalette","darkPalette"],u=s+=2,d=0;d<c;d++){var g=a.readUshort(i,s);s+=2;var _=a.readUshort(i,s);s+=2;var m=a.readUshort(i,s);s+=2;var p=a.readUshort(i,s);s+=2;var y=a.readUshort(i,s);s+=2;var E=a.readUshort(i,s);s+=2;var v,C=h[p],R=u+12*c+E;if(g==0)v=a.readUnicode(i,R,y/2);else if(g==3&&_==0)v=a.readUnicode(i,R,y/2);else if(_==0)v=a.readASCII(i,R,y);else if(_==1)v=a.readUnicode(i,R,y/2);else if(_==3)v=a.readUnicode(i,R,y/2);else{if(g!=1)throw"unknown encoding "+_+", platformID: "+g;v=a.readASCII(i,R,y),console.debug("reading unknown MAC encoding "+_+" as ASCII")}var T="p"+g+","+m.toString(16);l[T]==null&&(l[T]={}),l[T][C!==void 0?C:p]=v,l[T]._lang=m}for(var w in l)if(l[w].postScriptName!=null&&l[w]._lang==1033)return l[w];for(var w in l)if(l[w].postScriptName!=null&&l[w]._lang==0)return l[w];for(var w in l)if(l[w].postScriptName!=null&&l[w]._lang==3084)return l[w];for(var w in l)if(l[w].postScriptName!=null)return l[w];for(var w in l){f=w;break}return console.debug("returning name table with languageID "+l[f]._lang),l[f]},e["OS/2"]={},e["OS/2"].parse=function(i,s,o){var a=e._bin.readUshort(i,s);s+=2;var l={};if(a==0)e["OS/2"].version0(i,s,l);else if(a==1)e["OS/2"].version1(i,s,l);else if(a==2||a==3||a==4)e["OS/2"].version2(i,s,l);else{if(a!=5)throw"unknown OS/2 table version: "+a;e["OS/2"].version5(i,s,l)}return l},e["OS/2"].version0=function(i,s,o){var a=e._bin;return o.xAvgCharWidth=a.readShort(i,s),s+=2,o.usWeightClass=a.readUshort(i,s),s+=2,o.usWidthClass=a.readUshort(i,s),s+=2,o.fsType=a.readUshort(i,s),s+=2,o.ySubscriptXSize=a.readShort(i,s),s+=2,o.ySubscriptYSize=a.readShort(i,s),s+=2,o.ySubscriptXOffset=a.readShort(i,s),s+=2,o.ySubscriptYOffset=a.readShort(i,s),s+=2,o.ySuperscriptXSize=a.readShort(i,s),s+=2,o.ySuperscriptYSize=a.readShort(i,s),s+=2,o.ySuperscriptXOffset=a.readShort(i,s),s+=2,o.ySuperscriptYOffset=a.readShort(i,s),s+=2,o.yStrikeoutSize=a.readShort(i,s),s+=2,o.yStrikeoutPosition=a.readShort(i,s),s+=2,o.sFamilyClass=a.readShort(i,s),s+=2,o.panose=a.readBytes(i,s,10),s+=10,o.ulUnicodeRange1=a.readUint(i,s),s+=4,o.ulUnicodeRange2=a.readUint(i,s),s+=4,o.ulUnicodeRange3=a.readUint(i,s),s+=4,o.ulUnicodeRange4=a.readUint(i,s),s+=4,o.achVendID=[a.readInt8(i,s),a.readInt8(i,s+1),a.readInt8(i,s+2),a.readInt8(i,s+3)],s+=4,o.fsSelection=a.readUshort(i,s),s+=2,o.usFirstCharIndex=a.readUshort(i,s),s+=2,o.usLastCharIndex=a.readUshort(i,s),s+=2,o.sTypoAscender=a.readShort(i,s),s+=2,o.sTypoDescender=a.readShort(i,s),s+=2,o.sTypoLineGap=a.readShort(i,s),s+=2,o.usWinAscent=a.readUshort(i,s),s+=2,o.usWinDescent=a.readUshort(i,s),s+=2},e["OS/2"].version1=function(i,s,o){var a=e._bin;return s=e["OS/2"].version0(i,s,o),o.ulCodePageRange1=a.readUint(i,s),s+=4,o.ulCodePageRange2=a.readUint(i,s),s+=4},e["OS/2"].version2=function(i,s,o){var a=e._bin;return s=e["OS/2"].version1(i,s,o),o.sxHeight=a.readShort(i,s),s+=2,o.sCapHeight=a.readShort(i,s),s+=2,o.usDefault=a.readUshort(i,s),s+=2,o.usBreak=a.readUshort(i,s),s+=2,o.usMaxContext=a.readUshort(i,s),s+=2},e["OS/2"].version5=function(i,s,o){var a=e._bin;return s=e["OS/2"].version2(i,s,o),o.usLowerOpticalPointSize=a.readUshort(i,s),s+=2,o.usUpperOpticalPointSize=a.readUshort(i,s),s+=2},e.post={},e.post.parse=function(i,s,o){var a=e._bin,l={};return l.version=a.readFixed(i,s),s+=4,l.italicAngle=a.readFixed(i,s),s+=4,l.underlinePosition=a.readShort(i,s),s+=2,l.underlineThickness=a.readShort(i,s),s+=2,l},e==null&&(e={}),e.U==null&&(e.U={}),e.U.codeToGlyph=function(i,s){var o=i.cmap,a=-1;if(o.p0e4!=null?a=o.p0e4:o.p3e1!=null?a=o.p3e1:o.p1e0!=null?a=o.p1e0:o.p0e3!=null&&(a=o.p0e3),a==-1)throw"no familiar platform and encoding!";var l=o.tables[a];if(l.format==0)return s>=l.map.length?0:l.map[s];if(l.format==4){for(var c=-1,f=0;f<l.endCount.length;f++)if(s<=l.endCount[f]){c=f;break}return c==-1||l.startCount[c]>s?0:65535&(l.idRangeOffset[c]!=0?l.glyphIdArray[s-l.startCount[c]+(l.idRangeOffset[c]>>1)-(l.idRangeOffset.length-c)]:s+l.idDelta[c])}if(l.format==12){if(s>l.groups[l.groups.length-1][1])return 0;for(f=0;f<l.groups.length;f++){var h=l.groups[f];if(h[0]<=s&&s<=h[1])return h[2]+(s-h[0])}return 0}throw"unknown cmap table format "+l.format},e.U.glyphToPath=function(i,s){var o={cmds:[],crds:[]};if(i.SVG&&i.SVG.entries[s]){var a=i.SVG.entries[s];return a==null?o:(typeof a=="string"&&(a=e.SVG.toPath(a),i.SVG.entries[s]=a),a)}if(i.CFF){var l={x:0,y:0,stack:[],nStems:0,haveWidth:!1,width:i.CFF.Private?i.CFF.Private.defaultWidthX:0,open:!1},c=i.CFF,f=i.CFF.Private;if(c.ROS){for(var h=0;c.FDSelect[h+2]<=s;)h+=2;f=c.FDArray[c.FDSelect[h+1]].Private}e.U._drawCFF(i.CFF.CharStrings[s],l,c,f,o)}else i.glyf&&e.U._drawGlyf(s,i,o);return o},e.U._drawGlyf=function(i,s,o){var a=s.glyf[i];a==null&&(a=s.glyf[i]=e.glyf._parseGlyf(s,i)),a!=null&&(a.noc>-1?e.U._simpleGlyph(a,o):e.U._compoGlyph(a,s,o))},e.U._simpleGlyph=function(i,s){for(var o=0;o<i.noc;o++){for(var a=o==0?0:i.endPts[o-1]+1,l=i.endPts[o],c=a;c<=l;c++){var f=c==a?l:c-1,h=c==l?a:c+1,u=1&i.flags[c],d=1&i.flags[f],g=1&i.flags[h],_=i.xs[c],m=i.ys[c];if(c==a)if(u){if(!d){e.U.P.moveTo(s,_,m);continue}e.U.P.moveTo(s,i.xs[f],i.ys[f])}else d?e.U.P.moveTo(s,i.xs[f],i.ys[f]):e.U.P.moveTo(s,(i.xs[f]+_)/2,(i.ys[f]+m)/2);u?d&&e.U.P.lineTo(s,_,m):g?e.U.P.qcurveTo(s,_,m,i.xs[h],i.ys[h]):e.U.P.qcurveTo(s,_,m,(_+i.xs[h])/2,(m+i.ys[h])/2)}e.U.P.closePath(s)}},e.U._compoGlyph=function(i,s,o){for(var a=0;a<i.parts.length;a++){var l={cmds:[],crds:[]},c=i.parts[a];e.U._drawGlyf(c.glyphIndex,s,l);for(var f=c.m,h=0;h<l.crds.length;h+=2){var u=l.crds[h],d=l.crds[h+1];o.crds.push(u*f.a+d*f.b+f.tx),o.crds.push(u*f.c+d*f.d+f.ty)}for(h=0;h<l.cmds.length;h++)o.cmds.push(l.cmds[h])}},e.U._getGlyphClass=function(i,s){var o=e._lctf.getInterval(s,i);return o==-1?0:s[o+2]},e.U._applySubs=function(i,s,o,a){for(var l=i.length-s-1,c=0;c<o.tabs.length;c++)if(o.tabs[c]!=null){var f,h=o.tabs[c];if(!h.coverage||(f=e._lctf.coverageIndex(h.coverage,i[s]))!=-1){if(o.ltype==1)i[s],h.fmt==1?i[s]=i[s]+h.delta:i[s]=h.newg[f];else if(o.ltype==4)for(var u=h.vals[f],d=0;d<u.length;d++){var g=u[d],_=g.chain.length;if(!(_>l)){for(var m=!0,p=0,y=0;y<_;y++){for(;i[s+p+(1+y)]==-1;)p++;g.chain[y]!=i[s+p+(1+y)]&&(m=!1)}if(m){for(i[s]=g.nglyph,y=0;y<_+p;y++)i[s+y+1]=-1;break}}}else if(o.ltype==5&&h.fmt==2)for(var E=e._lctf.getInterval(h.cDef,i[s]),v=h.cDef[E+2],C=h.scset[v],R=0;R<C.length;R++){var T=C[R],w=T.input;if(!(w.length>l)){for(m=!0,y=0;y<w.length;y++){var S=e._lctf.getInterval(h.cDef,i[s+1+y]);if(E==-1&&h.cDef[S+2]!=w[y]){m=!1;break}}if(m){var x=T.substLookupRecords;for(d=0;d<x.length;d+=2)x[d],x[d+1]}}}else if(o.ltype==6&&h.fmt==3){if(!e.U._glsCovered(i,h.backCvg,s-h.backCvg.length)||!e.U._glsCovered(i,h.inptCvg,s)||!e.U._glsCovered(i,h.ahedCvg,s+h.inptCvg.length))continue;var F=h.lookupRec;for(R=0;R<F.length;R+=2){E=F[R];var I=a[F[R+1]];e.U._applySubs(i,s+E,I,a)}}}}},e.U._glsCovered=function(i,s,o){for(var a=0;a<s.length;a++)if(e._lctf.coverageIndex(s[a],i[o+a])==-1)return!1;return!0},e.U.glyphsToPath=function(i,s,o){for(var a={cmds:[],crds:[]},l=0,c=0;c<s.length;c++){var f=s[c];if(f!=-1){for(var h=c<s.length-1&&s[c+1]!=-1?s[c+1]:0,u=e.U.glyphToPath(i,f),d=0;d<u.crds.length;d+=2)a.crds.push(u.crds[d]+l),a.crds.push(u.crds[d+1]);for(o&&a.cmds.push(o),d=0;d<u.cmds.length;d++)a.cmds.push(u.cmds[d]);o&&a.cmds.push("X"),l+=i.hmtx.aWidth[f],c<s.length-1&&(l+=e.U.getPairAdjustment(i,f,h))}}return a},e.U.P={},e.U.P.moveTo=function(i,s,o){i.cmds.push("M"),i.crds.push(s,o)},e.U.P.lineTo=function(i,s,o){i.cmds.push("L"),i.crds.push(s,o)},e.U.P.curveTo=function(i,s,o,a,l,c,f){i.cmds.push("C"),i.crds.push(s,o,a,l,c,f)},e.U.P.qcurveTo=function(i,s,o,a,l){i.cmds.push("Q"),i.crds.push(s,o,a,l)},e.U.P.closePath=function(i){i.cmds.push("Z")},e.U._drawCFF=function(i,s,o,a,l){for(var c=s.stack,f=s.nStems,h=s.haveWidth,u=s.width,d=s.open,g=0,_=s.x,m=s.y,p=0,y=0,E=0,v=0,C=0,R=0,T=0,w=0,S=0,x=0,F={val:0,size:0};g<i.length;){e.CFF.getCharString(i,g,F);var I=F.val;if(g+=F.size,I=="o1"||I=="o18")c.length%2!=0&&!h&&(u=c.shift()+a.nominalWidthX),f+=c.length>>1,c.length=0,h=!0;else if(I=="o3"||I=="o23")c.length%2!=0&&!h&&(u=c.shift()+a.nominalWidthX),f+=c.length>>1,c.length=0,h=!0;else if(I=="o4")c.length>1&&!h&&(u=c.shift()+a.nominalWidthX,h=!0),d&&e.U.P.closePath(l),m+=c.pop(),e.U.P.moveTo(l,_,m),d=!0;else if(I=="o5")for(;c.length>0;)_+=c.shift(),m+=c.shift(),e.U.P.lineTo(l,_,m);else if(I=="o6"||I=="o7")for(var M=c.length,P=I=="o6",O=0;O<M;O++){var U=c.shift();P?_+=U:m+=U,P=!P,e.U.P.lineTo(l,_,m)}else if(I=="o8"||I=="o24"){M=c.length;for(var B=0;B+6<=M;)p=_+c.shift(),y=m+c.shift(),E=p+c.shift(),v=y+c.shift(),_=E+c.shift(),m=v+c.shift(),e.U.P.curveTo(l,p,y,E,v,_,m),B+=6;I=="o24"&&(_+=c.shift(),m+=c.shift(),e.U.P.lineTo(l,_,m))}else{if(I=="o11")break;if(I=="o1234"||I=="o1235"||I=="o1236"||I=="o1237")I=="o1234"&&(y=m,E=(p=_+c.shift())+c.shift(),x=v=y+c.shift(),R=v,w=m,_=(T=(C=(S=E+c.shift())+c.shift())+c.shift())+c.shift(),e.U.P.curveTo(l,p,y,E,v,S,x),e.U.P.curveTo(l,C,R,T,w,_,m)),I=="o1235"&&(p=_+c.shift(),y=m+c.shift(),E=p+c.shift(),v=y+c.shift(),S=E+c.shift(),x=v+c.shift(),C=S+c.shift(),R=x+c.shift(),T=C+c.shift(),w=R+c.shift(),_=T+c.shift(),m=w+c.shift(),c.shift(),e.U.P.curveTo(l,p,y,E,v,S,x),e.U.P.curveTo(l,C,R,T,w,_,m)),I=="o1236"&&(p=_+c.shift(),y=m+c.shift(),E=p+c.shift(),x=v=y+c.shift(),R=v,T=(C=(S=E+c.shift())+c.shift())+c.shift(),w=R+c.shift(),_=T+c.shift(),e.U.P.curveTo(l,p,y,E,v,S,x),e.U.P.curveTo(l,C,R,T,w,_,m)),I=="o1237"&&(p=_+c.shift(),y=m+c.shift(),E=p+c.shift(),v=y+c.shift(),S=E+c.shift(),x=v+c.shift(),C=S+c.shift(),R=x+c.shift(),T=C+c.shift(),w=R+c.shift(),Math.abs(T-_)>Math.abs(w-m)?_=T+c.shift():m=w+c.shift(),e.U.P.curveTo(l,p,y,E,v,S,x),e.U.P.curveTo(l,C,R,T,w,_,m));else if(I=="o14"){if(c.length>0&&!h&&(u=c.shift()+o.nominalWidthX,h=!0),c.length==4){var z=c.shift(),X=c.shift(),V=c.shift(),N=c.shift(),$=e.CFF.glyphBySE(o,V),ne=e.CFF.glyphBySE(o,N);e.U._drawCFF(o.CharStrings[$],s,o,a,l),s.x=z,s.y=X,e.U._drawCFF(o.CharStrings[ne],s,o,a,l)}d&&(e.U.P.closePath(l),d=!1)}else if(I=="o19"||I=="o20")c.length%2!=0&&!h&&(u=c.shift()+a.nominalWidthX),f+=c.length>>1,c.length=0,h=!0,g+=f+7>>3;else if(I=="o21")c.length>2&&!h&&(u=c.shift()+a.nominalWidthX,h=!0),m+=c.pop(),_+=c.pop(),d&&e.U.P.closePath(l),e.U.P.moveTo(l,_,m),d=!0;else if(I=="o22")c.length>1&&!h&&(u=c.shift()+a.nominalWidthX,h=!0),_+=c.pop(),d&&e.U.P.closePath(l),e.U.P.moveTo(l,_,m),d=!0;else if(I=="o25"){for(;c.length>6;)_+=c.shift(),m+=c.shift(),e.U.P.lineTo(l,_,m);p=_+c.shift(),y=m+c.shift(),E=p+c.shift(),v=y+c.shift(),_=E+c.shift(),m=v+c.shift(),e.U.P.curveTo(l,p,y,E,v,_,m)}else if(I=="o26")for(c.length%2&&(_+=c.shift());c.length>0;)p=_,y=m+c.shift(),_=E=p+c.shift(),m=(v=y+c.shift())+c.shift(),e.U.P.curveTo(l,p,y,E,v,_,m);else if(I=="o27")for(c.length%2&&(m+=c.shift());c.length>0;)y=m,E=(p=_+c.shift())+c.shift(),v=y+c.shift(),_=E+c.shift(),m=v,e.U.P.curveTo(l,p,y,E,v,_,m);else if(I=="o10"||I=="o29"){var k=I=="o10"?a:o;if(c.length==0)console.debug("error: empty stack");else{var H=c.pop(),se=k.Subrs[H+k.Bias];s.x=_,s.y=m,s.nStems=f,s.haveWidth=h,s.width=u,s.open=d,e.U._drawCFF(se,s,o,a,l),_=s.x,m=s.y,f=s.nStems,h=s.haveWidth,u=s.width,d=s.open}}else if(I=="o30"||I=="o31"){var Y=c.length,ae=(B=0,I=="o31");for(B+=Y-(M=-3&Y);B<M;)ae?(y=m,E=(p=_+c.shift())+c.shift(),m=(v=y+c.shift())+c.shift(),M-B==5?(_=E+c.shift(),B++):_=E,ae=!1):(p=_,y=m+c.shift(),E=p+c.shift(),v=y+c.shift(),_=E+c.shift(),M-B==5?(m=v+c.shift(),B++):m=v,ae=!0),e.U.P.curveTo(l,p,y,E,v,_,m),B+=4}else{if((I+"").charAt(0)=="o")throw console.debug("Unknown operation: "+I,i),I;c.push(I)}}}s.x=_,s.y=m,s.nStems=f,s.haveWidth=h,s.width=u,s.open=d};var t=e,n={Typr:t};return r.Typr=t,r.default=n,Object.defineProperty(r,"__esModule",{value:!0}),r}({}).Typr}/*!
Custom bundle of woff2otf (https://github.com/arty-name/woff2otf) with fflate
(https://github.com/101arrowz/fflate) for use in Troika text rendering. 
Original licenses apply: 
- fflate: https://github.com/101arrowz/fflate/blob/master/LICENSE (MIT)
- woff2otf.js: https://github.com/arty-name/woff2otf/blob/master/woff2otf.js (Apache2)
*/function JM(){return function(r){var e=Uint8Array,t=Uint16Array,n=Uint32Array,i=new e([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),s=new e([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),o=new e([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(I,M){for(var P=new t(31),O=0;O<31;++O)P[O]=M+=1<<I[O-1];var U=new n(P[30]);for(O=1;O<30;++O)for(var B=P[O];B<P[O+1];++B)U[B]=B-P[O]<<5|O;return[P,U]},l=a(i,2),c=l[0],f=l[1];c[28]=258,f[258]=28;for(var h=a(s,0)[0],u=new t(32768),d=0;d<32768;++d){var g=(43690&d)>>>1|(21845&d)<<1;g=(61680&(g=(52428&g)>>>2|(13107&g)<<2))>>>4|(3855&g)<<4,u[d]=((65280&g)>>>8|(255&g)<<8)>>>1}var _=function(I,M,P){for(var O=I.length,U=0,B=new t(M);U<O;++U)++B[I[U]-1];var z,X=new t(M);for(U=0;U<M;++U)X[U]=X[U-1]+B[U-1]<<1;{z=new t(1<<M);var V=15-M;for(U=0;U<O;++U)if(I[U])for(var N=U<<4|I[U],$=M-I[U],ne=X[I[U]-1]++<<$,k=ne|(1<<$)-1;ne<=k;++ne)z[u[ne]>>>V]=N}return z},m=new e(288);for(d=0;d<144;++d)m[d]=8;for(d=144;d<256;++d)m[d]=9;for(d=256;d<280;++d)m[d]=7;for(d=280;d<288;++d)m[d]=8;var p=new e(32);for(d=0;d<32;++d)p[d]=5;var y=_(m,9),E=_(p,5),v=function(I){for(var M=I[0],P=1;P<I.length;++P)I[P]>M&&(M=I[P]);return M},C=function(I,M,P){var O=M/8|0;return(I[O]|I[O+1]<<8)>>(7&M)&P},R=function(I,M){var P=M/8|0;return(I[P]|I[P+1]<<8|I[P+2]<<16)>>(7&M)},T=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],w=function(I,M,P){var O=new Error(M||T[I]);if(O.code=I,Error.captureStackTrace&&Error.captureStackTrace(O,w),!P)throw O;return O},S=function(I,M,P){var O=I.length;if(!O||P&&!P.l&&O<5)return M||new e(0);var U=!M||P,B=!P||P.i;P||(P={}),M||(M=new e(3*O));var z,X=function(pe){var Be=M.length;if(pe>Be){var ke=new e(Math.max(2*Be,pe));ke.set(M),M=ke}},V=P.f||0,N=P.p||0,$=P.b||0,ne=P.l,k=P.d,H=P.m,se=P.n,Y=8*O;do{if(!ne){P.f=V=C(I,N,1);var ae=C(I,N+1,3);if(N+=3,!ae){var Me=I[(Ee=((z=N)/8|0)+(7&z&&1)+4)-4]|I[Ee-3]<<8,Ae=Ee+Me;if(Ae>O){B&&w(0);break}U&&X($+Me),M.set(I.subarray(Ee,Ae),$),P.b=$+=Me,P.p=N=8*Ae;continue}if(ae==1)ne=y,k=E,H=9,se=5;else if(ae==2){var we=C(I,N,31)+257,ue=C(I,N+10,15)+4,Ve=we+C(I,N+5,31)+1;N+=14;for(var W=new e(Ve),He=new e(19),Ue=0;Ue<ue;++Ue)He[o[Ue]]=C(I,N+3*Ue,7);N+=3*ue;var Fe=v(He),he=(1<<Fe)-1,Ie=_(He,Fe);for(Ue=0;Ue<Ve;){var Ee,A=Ie[C(I,N,he)];if(N+=15&A,(Ee=A>>>4)<16)W[Ue++]=Ee;else{var b=0,G=0;for(Ee==16?(G=3+C(I,N,3),N+=2,b=W[Ue-1]):Ee==17?(G=3+C(I,N,7),N+=3):Ee==18&&(G=11+C(I,N,127),N+=7);G--;)W[Ue++]=b}}var te=W.subarray(0,we),ie=W.subarray(we);H=v(te),se=v(ie),ne=_(te,H),k=_(ie,se)}else w(1);if(N>Y){B&&w(0);break}}U&&X($+131072);for(var fe=(1<<H)-1,_e=(1<<se)-1,ge=N;;ge=N){var Se=(b=ne[R(I,N)&fe])>>>4;if((N+=15&b)>Y){B&&w(0);break}if(b||w(2),Se<256)M[$++]=Se;else{if(Se==256){ge=N,ne=null;break}var Oe=Se-254;if(Se>264){var ve=i[Ue=Se-257];Oe=C(I,N,(1<<ve)-1)+c[Ue],N+=ve}var Re=k[R(I,N)&_e],Ce=Re>>>4;if(Re||w(3),N+=15&Re,ie=h[Ce],Ce>3&&(ve=s[Ce],ie+=R(I,N)&(1<<ve)-1,N+=ve),N>Y){B&&w(0);break}U&&X($+131072);for(var De=$+Oe;$<De;$+=4)M[$]=M[$-ie],M[$+1]=M[$+1-ie],M[$+2]=M[$+2-ie],M[$+3]=M[$+3-ie];$=De}}P.l=ne,P.p=ge,P.b=$,ne&&(V=1,P.m=H,P.d=k,P.n=se)}while(!V);return $==M.length?M:function(pe,Be,ke){(ke==null||ke>pe.length)&&(ke=pe.length);var nt=new(pe instanceof t?t:pe instanceof n?n:e)(ke-Be);return nt.set(pe.subarray(Be,ke)),nt}(M,0,$)},x=new e(0),F=typeof TextDecoder!="undefined"&&new TextDecoder;try{F.decode(x,{stream:!0})}catch{}return r.convert_streams=function(I){var M=new DataView(I),P=0;function O(){var we=M.getUint16(P);return P+=2,we}function U(){var we=M.getUint32(P);return P+=4,we}function B(we){Me.setUint16(Ae,we),Ae+=2}function z(we){Me.setUint32(Ae,we),Ae+=4}for(var X={signature:U(),flavor:U(),length:U(),numTables:O(),reserved:O(),totalSfntSize:U(),majorVersion:O(),minorVersion:O(),metaOffset:U(),metaLength:U(),metaOrigLength:U(),privOffset:U(),privLength:U()},V=0;Math.pow(2,V)<=X.numTables;)V++;V--;for(var N=16*Math.pow(2,V),$=16*X.numTables-N,ne=12,k=[],H=0;H<X.numTables;H++)k.push({tag:U(),offset:U(),compLength:U(),origLength:U(),origChecksum:U()}),ne+=16;var se,Y=new Uint8Array(12+16*k.length+k.reduce(function(we,ue){return we+ue.origLength+4},0)),ae=Y.buffer,Me=new DataView(ae),Ae=0;return z(X.flavor),B(X.numTables),B(N),B(V),B($),k.forEach(function(we){z(we.tag),z(we.origChecksum),z(ne),z(we.origLength),we.outOffset=ne,(ne+=we.origLength)%4!=0&&(ne+=4-ne%4)}),k.forEach(function(we){var ue,Ve=I.slice(we.offset,we.offset+we.compLength);if(we.compLength!=we.origLength){var W=new Uint8Array(we.origLength);ue=new Uint8Array(Ve,2),S(ue,W)}else W=new Uint8Array(Ve);Y.set(W,we.outOffset);var He=0;(ne=we.outOffset+we.origLength)%4!=0&&(He=4-ne%4),Y.set(new Uint8Array(He).buffer,we.outOffset+we.origLength),se=ne+He}),ae.slice(0,se)},Object.defineProperty(r,"__esModule",{value:!0}),r}({}).convert_streams}function ZM(r,e){const t={M:2,L:2,Q:4,C:6,Z:0},n={C:"18g,ca,368,1kz",D:"17k,6,2,2+4,5+c,2+6,2+1,10+1,9+f,j+11,2+1,a,2,2+1,15+2,3,j+2,6+3,2+8,2,2,2+1,w+a,4+e,3+3,2,3+2,3+5,23+w,2f+4,3,2+9,2,b,2+3,3,1k+9,6+1,3+1,2+2,2+d,30g,p+y,1,1+1g,f+x,2,sd2+1d,jf3+4,f+3,2+4,2+2,b+3,42,2,4+2,2+1,2,3,t+1,9f+w,2,el+2,2+g,d+2,2l,2+1,5,3+1,2+1,2,3,6,16wm+1v",R:"17m+3,2,2,6+3,m,15+2,2+2,h+h,13,3+8,2,2,3+1,2,p+1,x,5+4,5,a,2,2,3,u,c+2,g+1,5,2+1,4+1,5j,6+1,2,b,2+2,f,2+1,1s+2,2,3+1,7,1ez0,2,2+1,4+4,b,4,3,b,42,2+2,4,3,2+1,2,o+3,ae,ep,x,2o+2,3+1,3,5+1,6",L:"x9u,jff,a,fd,jv",T:"4t,gj+33,7o+4,1+1,7c+18,2,2+1,2+1,2,21+a,2,1b+k,h,2u+6,3+5,3+1,2+3,y,2,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,3,7,6+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+d,1,1+1,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,ek,3+1,r+4,1e+4,6+5,2p+c,1+3,1,1+2,1+b,2db+2,3y,2p+v,ff+3,30+1,n9x,1+2,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,5s,6y+2,ea,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+9,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2,2b+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,470+8,at4+4,1o+6,t5,1s+3,2a,f5l+1,2+3,43o+2,a+7,1+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,1,gzau,v+2n,3l+6n"},i=1,s=2,o=4,a=8,l=16,c=32;let f;function h(T){if(!f){const w={R:s,L:i,D:o,C:l,U:c,T:a};f=new Map;for(let S in n){let x=0;n[S].split(",").forEach(F=>{let[I,M]=F.split("+");I=parseInt(I,36),M=M?parseInt(M,36):0,f.set(x+=I,w[S]);for(let P=M;P--;)f.set(++x,w[S])})}}return f.get(T)||c}const u=1,d=2,g=3,_=4,m=[null,"isol","init","fina","medi"];function p(T){const w=new Uint8Array(T.length);let S=c,x=u,F=-1;for(let I=0;I<T.length;I++){const M=T.codePointAt(I);let P=h(M)|0,O=u;P&a||(S&(i|o|l)?P&(s|o|l)?(O=g,(x===u||x===g)&&w[F]++):P&(i|c)&&(x===d||x===_)&&w[F]--:S&(s|c)&&(x===d||x===_)&&w[F]--,x=w[I]=O,S=P,F=I,M>65535&&I++)}return w}function y(T,w){const S=[];for(let F=0;F<w.length;F++){const I=w.codePointAt(F);I>65535&&F++,S.push(r.U.codeToGlyph(T,I))}const x=T.GSUB;if(x){const{lookupList:F,featureList:I}=x;let M;const P=/^(rlig|liga|mset|isol|init|fina|medi|half|pres|blws|ccmp)$/,O=[];I.forEach(U=>{if(P.test(U.tag))for(let B=0;B<U.tab.length;B++){if(O[U.tab[B]])continue;O[U.tab[B]]=!0;const z=F[U.tab[B]],X=/^(isol|init|fina|medi)$/.test(U.tag);X&&!M&&(M=p(w));for(let V=0;V<S.length;V++)(!M||!X||m[M[V]]===U.tag)&&r.U._applySubs(S,V,z,F)}})}return S}function E(T,w){const S=new Int16Array(w.length*3);let x=0;for(;x<w.length;x++){const P=w[x];if(P===-1)continue;S[x*3+2]=T.hmtx.aWidth[P];const O=T.GPOS;if(O){const U=O.lookupList;for(let B=0;B<U.length;B++){const z=U[B];for(let X=0;X<z.tabs.length;X++){const V=z.tabs[X];if(z.ltype===1){if(r._lctf.coverageIndex(V.coverage,P)!==-1&&V.pos){M(V.pos,x);break}}else if(z.ltype===2){let N=null,$=F();if($!==-1){const ne=r._lctf.coverageIndex(V.coverage,w[$]);if(ne!==-1){if(V.fmt===1){const k=V.pairsets[ne];for(let H=0;H<k.length;H++)k[H].gid2===P&&(N=k[H])}else if(V.fmt===2){const k=r.U._getGlyphClass(w[$],V.classDef1),H=r.U._getGlyphClass(P,V.classDef2);N=V.matrix[k][H]}if(N){N.val1&&M(N.val1,$),N.val2&&M(N.val2,x);break}}}}else if(z.ltype===4){const N=r._lctf.coverageIndex(V.markCoverage,P);if(N!==-1){const $=F(I),ne=$===-1?-1:r._lctf.coverageIndex(V.baseCoverage,w[$]);if(ne!==-1){const k=V.markArray[N],H=V.baseArray[ne][k.markClass];S[x*3]=H.x-k.x+S[$*3]-S[$*3+2],S[x*3+1]=H.y-k.y+S[$*3+1];break}}}else if(z.ltype===6){const N=r._lctf.coverageIndex(V.mark1Coverage,P);if(N!==-1){const $=F();if($!==-1){const ne=w[$];if(v(T,ne)===3){const k=r._lctf.coverageIndex(V.mark2Coverage,ne);if(k!==-1){const H=V.mark1Array[N],se=V.mark2Array[k][H.markClass];S[x*3]=se.x-H.x+S[$*3]-S[$*3+2],S[x*3+1]=se.y-H.y+S[$*3+1];break}}}}}}}}else if(T.kern&&!T.cff){const U=F();if(U!==-1){const B=T.kern.glyph1.indexOf(w[U]);if(B!==-1){const z=T.kern.rval[B].glyph2.indexOf(P);z!==-1&&(S[U*3+2]+=T.kern.rval[B].vals[z])}}}}return S;function F(P){for(let O=x-1;O>=0;O--)if(w[O]!==-1&&(!P||P(w[O])))return O;return-1}function I(P){return v(T,P)===1}function M(P,O){for(let U=0;U<3;U++)S[O*3+U]+=P[U]||0}}function v(T,w){const S=T.GDEF&&T.GDEF.glyphClassDef;return S?r.U._getGlyphClass(w,S):0}function C(...T){for(let w=0;w<T.length;w++)if(typeof T[w]=="number")return T[w]}function R(T){const w=Object.create(null),S=T["OS/2"],x=T.hhea,F=T.head.unitsPerEm,I=C(S&&S.sTypoAscender,x&&x.ascender,F),M={unitsPerEm:F,ascender:I,descender:C(S&&S.sTypoDescender,x&&x.descender,0),capHeight:C(S&&S.sCapHeight,I),xHeight:C(S&&S.sxHeight,I),lineGap:C(S&&S.sTypoLineGap,x&&x.lineGap),supportsCodePoint(P){return r.U.codeToGlyph(T,P)>0},forEachGlyph(P,O,U,B){let z=0;const X=1/M.unitsPerEm*O,V=y(T,P);let N=0;const $=E(T,V);return V.forEach((ne,k)=>{if(ne!==-1){let H=w[ne];if(!H){const{cmds:se,crds:Y}=r.U.glyphToPath(T,ne);let ae="",Me=0;for(let W=0,He=se.length;W<He;W++){const Ue=t[se[W]];ae+=se[W];for(let Fe=1;Fe<=Ue;Fe++)ae+=(Fe>1?",":"")+Y[Me++]}let Ae,we,ue,Ve;if(Y.length){Ae=we=1/0,ue=Ve=-1/0;for(let W=0,He=Y.length;W<He;W+=2){let Ue=Y[W],Fe=Y[W+1];Ue<Ae&&(Ae=Ue),Fe<we&&(we=Fe),Ue>ue&&(ue=Ue),Fe>Ve&&(Ve=Fe)}}else Ae=ue=we=Ve=0;H=w[ne]={index:ne,advanceWidth:T.hmtx.aWidth[ne],xMin:Ae,yMin:we,xMax:ue,yMax:Ve,path:ae}}B.call(null,H,z+$[k*3]*X,$[k*3+1]*X,N),z+=$[k*3+2]*X,U&&(z+=U*O)}N+=P.codePointAt(N)>65535?2:1}),z}};return M}return function(w){const S=new Uint8Array(w,0,4),x=r._bin.readASCII(S,0,4);if(x==="wOFF")w=e(w);else if(x==="wOF2")throw new Error("woff2 fonts not supported");return R(r.parse(w)[0])}}const QM=Js({name:"Typr Font Parser",dependencies:[KM,JM,ZM],init(r,e,t){const n=r(),i=e();return t(n,i)}});/*!
Custom bundle of @unicode-font-resolver/client v1.0.2 (https://github.com/lojjic/unicode-font-resolver)
for use in Troika text rendering. 
Original MIT license applies
*/function eb(){return function(r){var e=function(){this.buckets=new Map};e.prototype.add=function(E){var v=E>>5;this.buckets.set(v,(this.buckets.get(v)||0)|1<<(31&E))},e.prototype.has=function(E){var v=this.buckets.get(E>>5);return v!==void 0&&(v&1<<(31&E))!=0},e.prototype.serialize=function(){var E=[];return this.buckets.forEach(function(v,C){E.push((+C).toString(36)+":"+v.toString(36))}),E.join(",")},e.prototype.deserialize=function(E){var v=this;this.buckets.clear(),E.split(",").forEach(function(C){var R=C.split(":");v.buckets.set(parseInt(R[0],36),parseInt(R[1],36))})};var t=Math.pow(2,8),n=t-1,i=~n;function s(E){var v=function(R){return R&i}(E).toString(16),C=function(R){return(R&i)+t-1}(E).toString(16);return"codepoint-index/plane"+(E>>16)+"/"+v+"-"+C+".json"}function o(E,v){var C=E&n,R=v.codePointAt(C/6|0);return((R=(R||48)-48)&1<<C%6)!=0}function a(E,v){var C;(C=E,C.replace(/U\+/gi,"").replace(/^,+|,+$/g,"").split(/,+/).map(function(R){return R.split("-").map(function(T){return parseInt(T.trim(),16)})})).forEach(function(R){var T=R[0],w=R[1];w===void 0&&(w=T),v(T,w)})}function l(E,v){a(E,function(C,R){for(var T=C;T<=R;T++)v(T)})}var c={},f={},h=new WeakMap,u="https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data";function d(E){var v=h.get(E);return v||(v=new e,l(E.ranges,function(C){return v.add(C)}),h.set(E,v)),v}var g,_=new Map;function m(E,v,C){return E[v]?v:E[C]?C:function(R){for(var T in R)return T}(E)}function p(E,v){var C=v;if(!E.includes(C)){C=1/0;for(var R=0;R<E.length;R++)Math.abs(E[R]-v)<Math.abs(C-v)&&(C=E[R])}return C}function y(E){return g||(g=new Set,l("9-D,20,85,A0,1680,2000-200A,2028-202F,205F,3000",function(v){g.add(v)})),g.has(E)}return r.CodePointSet=e,r.clearCache=function(){c={},f={}},r.getFontsForString=function(E,v){v===void 0&&(v={});var C,R=v.lang;R===void 0&&(R=/\p{Script=Hangul}/u.test(C=E)?"ko":/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(C)?"ja":"en");var T=v.category;T===void 0&&(T="sans-serif");var w=v.style;w===void 0&&(w="normal");var S=v.weight;S===void 0&&(S=400);var x=(v.dataUrl||u).replace(/\/$/g,""),F=new Map,I=new Uint8Array(E.length),M={},P={},O=new Array(E.length),U=new Map,B=!1;function z(N){var $=_.get(N);return $||($=fetch(x+"/"+N).then(function(ne){if(!ne.ok)throw new Error(ne.statusText);return ne.json().then(function(k){if(!Array.isArray(k)||k[0]!==1)throw new Error("Incorrect schema version; need 1, got "+k[0]);return k[1]})}).catch(function(ne){if(x!==u)return B||(console.error('unicode-font-resolver: Failed loading from dataUrl "'+x+'", trying default CDN. '+ne.message),B=!0),x=u,_.delete(N),z(N);throw ne}),_.set(N,$)),$}for(var X=function(N){var $=E.codePointAt(N),ne=s($);O[N]=ne,c[ne]||U.has(ne)||U.set(ne,z(ne).then(function(k){c[ne]=k})),$>65535&&(N++,V=N)},V=0;V<E.length;V++)X(V);return Promise.all(U.values()).then(function(){U.clear();for(var N=function(ne){var k=E.codePointAt(ne),H=null,se=c[O[ne]],Y=void 0;for(var ae in se){var Me=P[ae];if(Me===void 0&&(Me=P[ae]=new RegExp(ae).test(R||"en")),Me){for(var Ae in Y=ae,se[ae])if(o(k,se[ae][Ae])){H=Ae;break}break}}if(!H){e:for(var we in se)if(we!==Y){for(var ue in se[we])if(o(k,se[we][ue])){H=ue;break e}}}H||(console.debug("No font coverage for U+"+k.toString(16)),H="latin"),O[ne]=H,f[H]||U.has(H)||U.set(H,z("font-meta/"+H+".json").then(function(Ve){f[H]=Ve})),k>65535&&(ne++,$=ne)},$=0;$<E.length;$++)N($);return Promise.all(U.values())}).then(function(){for(var N,$=null,ne=0;ne<E.length;ne++){var k=E.codePointAt(ne);if($&&(y(k)||d($).has(k)))I[ne]=I[ne-1];else{$=f[O[ne]];var H=M[$.id];if(!H){var se=$.typeforms,Y=m(se,T,"sans-serif"),ae=m(se[Y],w,"normal"),Me=p((N=se[Y])===null||N===void 0?void 0:N[ae],S);H=M[$.id]=x+"/font-files/"+$.id+"/"+Y+"."+ae+"."+Me+".woff"}var Ae=F.get(H);Ae==null&&(Ae=F.size,F.set(H,Ae)),I[ne]=Ae}k>65535&&(ne++,I[ne]=I[ne-1])}return{fontUrls:Array.from(F.keys()),chars:I}})},Object.defineProperty(r,"__esModule",{value:!0}),r}({})}function tb(r,e){const t=Object.create(null),n=Object.create(null);function i(o,a){const l=c=>{console.error(`Failure loading font ${o}`,c)};try{const c=new XMLHttpRequest;c.open("get",o,!0),c.responseType="arraybuffer",c.onload=function(){if(c.status>=400)l(new Error(c.statusText));else if(c.status>0)try{const f=r(c.response);f.src=o,a(f)}catch(f){l(f)}},c.onerror=l,c.send()}catch(c){l(c)}}function s(o,a){let l=t[o];l?a(l):n[o]?n[o].push(a):(n[o]=[a],i(o,c=>{c.src=o,t[o]=c,n[o].forEach(f=>f(c)),delete n[o]}))}return function(o,a,{lang:l,fonts:c=[],style:f="normal",weight:h="normal",unicodeFontsURL:u}={}){const d=new Uint8Array(o.length),g=[];o.length||y();const _=new Map,m=[];if(f!=="italic"&&(f="normal"),typeof h!="number"&&(h=h==="bold"?700:400),c&&!Array.isArray(c)&&(c=[c]),c=c.slice().filter(v=>!v.lang||v.lang.test(l)).reverse(),c.length){let T=0;(function w(S=0){for(let x=S,F=o.length;x<F;x++){const I=o.codePointAt(x);if(T===1&&g[d[x-1]].supportsCodePoint(I)||x>0&&/\s/.test(o[x]))d[x]=d[x-1],T===2&&(m[m.length-1][1]=x);else for(let M=d[x],P=c.length;M<=P;M++)if(M===P){const O=T===2?m[m.length-1]:m[m.length]=[x,x];O[1]=x,T=2}else{d[x]=M;const{src:O,unicodeRange:U}=c[M];if(!U||E(I,U)){const B=t[O];if(!B){s(O,()=>{w(x)});return}if(B.supportsCodePoint(I)){let z=_.get(B);typeof z!="number"&&(z=g.length,g.push(B),_.set(B,z)),d[x]=z,T=1;break}}}I>65535&&x+1<F&&(d[x+1]=d[x],x++,T===2&&(m[m.length-1][1]=x))}p()})()}else m.push([0,o.length-1]),p();function p(){if(m.length){const v=m.map(C=>o.substring(C[0],C[1]+1)).join(`
`);e.getFontsForString(v,{lang:l||void 0,style:f,weight:h,dataUrl:u}).then(({fontUrls:C,chars:R})=>{const T=g.length;let w=0;m.forEach(x=>{for(let F=0,I=x[1]-x[0];F<=I;F++)d[x[0]+F]=R[w++]+T;w++});let S=0;C.forEach((x,F)=>{s(x,I=>{g[F+T]=I,++S===C.length&&y()})})})}else y()}function y(){a({chars:d,fonts:g})}function E(v,C){for(let R=0;R<C.length;R++){const[T,w=T]=C[R];if(T<=v&&v<=w)return!0}return!1}}}const nb=Js({name:"FontResolver",dependencies:[tb,QM,eb],init(r,e,t){return r(e,t())}});function ib(r,e){const n=/[\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/,i="[^\\S\\u00A0]",s=new RegExp(`${i}|[\\-\\u007C\\u00AD\\u2010\\u2012-\\u2014\\u2027\\u2056\\u2E17\\u2E40]`);function o({text:g,lang:_,fonts:m,style:p,weight:y,preResolvedFonts:E,unicodeFontsURL:v},C){const R=({chars:T,fonts:w})=>{let S,x;const F=[];for(let I=0;I<T.length;I++)T[I]!==x?(x=T[I],F.push(S={start:I,end:I,fontObj:w[T[I]]})):S.end=I;C(F)};E?R(E):r(g,R,{lang:_,fonts:m,style:p,weight:y,unicodeFontsURL:v})}function a({text:g="",font:_,lang:m,sdfGlyphSize:p=64,fontSize:y=400,fontWeight:E=1,fontStyle:v="normal",letterSpacing:C=0,lineHeight:R="normal",maxWidth:T=1/0,direction:w,textAlign:S="left",textIndent:x=0,whiteSpace:F="normal",overflowWrap:I="normal",anchorX:M=0,anchorY:P=0,metricsOnly:O=!1,unicodeFontsURL:U,preResolvedFonts:B=null,includeCaretPositions:z=!1,chunkedBoundsSize:X=8192,colorRanges:V=null},N){const $=h(),ne={fontLoad:0,typesetting:0};g.indexOf("\r")>-1&&(console.info("Typesetter: got text with \\r chars; normalizing to \\n"),g=g.replace(/\r\n/g,`
`).replace(/\r/g,`
`)),y=+y,C=+C,T=+T,R=R||"normal",x=+x,o({text:g,lang:m,style:v,weight:E,fonts:typeof _=="string"?[{src:_}]:_,unicodeFontsURL:U,preResolvedFonts:B},k=>{ne.fontLoad=h()-$;const H=isFinite(T);let se=null,Y=null,ae=null,Me=null,Ae=null,we=null,ue=null,Ve=null,W=0,He=0,Ue=F!=="nowrap";const Fe=new Map,he=h();let Ie=x,Ee=0,A=new u;const b=[A];k.forEach(_e=>{const{fontObj:ge}=_e,{ascender:Se,descender:Oe,unitsPerEm:ve,lineGap:Re,capHeight:Ce,xHeight:De}=ge;let pe=Fe.get(ge);if(!pe){const xe=y/ve,re=R==="normal"?(Se-Oe+Re)*xe:R*y,ye=(re-(Se-Oe)*xe)/2,Te=Math.min(re,(Se-Oe)*xe),be=(Se+Oe)/2*xe+Te/2;pe={index:Fe.size,src:ge.src,fontObj:ge,fontSizeMult:xe,unitsPerEm:ve,ascender:Se*xe,descender:Oe*xe,capHeight:Ce*xe,xHeight:De*xe,lineHeight:re,baseline:-ye-Se*xe,caretTop:be,caretBottom:be-Te},Fe.set(ge,pe)}const{fontSizeMult:Be}=pe,ke=g.slice(_e.start,_e.end+1);let nt,j;ge.forEachGlyph(ke,y,C,(xe,re,ye,Te)=>{re+=Ee,Te+=_e.start,nt=re,j=xe;const be=g.charAt(Te),Ge=xe.advanceWidth*Be,Ze=A.count;let je;if("isEmpty"in xe||(xe.isWhitespace=!!be&&new RegExp(i).test(be),xe.canBreakAfter=!!be&&s.test(be),xe.isEmpty=xe.xMin===xe.xMax||xe.yMin===xe.yMax||n.test(be)),!xe.isWhitespace&&!xe.isEmpty&&He++,Ue&&H&&!xe.isWhitespace&&re+Ge+Ie>T&&Ze){if(A.glyphAt(Ze-1).glyphObj.canBreakAfter)je=new u,Ie=-re;else for(let Et=Ze;Et--;)if(Et===0&&I==="break-word"){je=new u,Ie=-re;break}else if(A.glyphAt(Et).glyphObj.canBreakAfter){je=A.splitAt(Et+1);const bt=je.glyphAt(0).x;Ie-=bt;for(let Ct=je.count;Ct--;)je.glyphAt(Ct).x-=bt;break}je&&(A.isSoftWrapped=!0,A=je,b.push(A),W=T)}let qe=A.glyphAt(A.count);qe.glyphObj=xe,qe.x=re+Ie,qe.y=ye,qe.width=Ge,qe.charIndex=Te,qe.fontData=pe,be===`
`&&(A=new u,b.push(A),Ie=-(re+Ge+C*y)+x)}),Ee=nt+j.advanceWidth*Be+C*y});let G=0;b.forEach(_e=>{let ge=!0;for(let Se=_e.count;Se--;){const Oe=_e.glyphAt(Se);ge&&!Oe.glyphObj.isWhitespace&&(_e.width=Oe.x+Oe.width,_e.width>W&&(W=_e.width),ge=!1);let{lineHeight:ve,capHeight:Re,xHeight:Ce,baseline:De}=Oe.fontData;ve>_e.lineHeight&&(_e.lineHeight=ve);const pe=De-_e.baseline;pe<0&&(_e.baseline+=pe,_e.cap+=pe,_e.ex+=pe),_e.cap=Math.max(_e.cap,_e.baseline+Re),_e.ex=Math.max(_e.ex,_e.baseline+Ce)}_e.baseline-=G,_e.cap-=G,_e.ex-=G,G+=_e.lineHeight});let te=0,ie=0;if(M&&(typeof M=="number"?te=-M:typeof M=="string"&&(te=-W*(M==="left"?0:M==="center"?.5:M==="right"?1:c(M)))),P&&(typeof P=="number"?ie=-P:typeof P=="string"&&(ie=P==="top"?0:P==="top-baseline"?-b[0].baseline:P==="top-cap"?-b[0].cap:P==="top-ex"?-b[0].ex:P==="middle"?G/2:P==="bottom"?G:P==="bottom-baseline"?-b[b.length-1].baseline:c(P)*G)),!O){const _e=e.getEmbeddingLevels(g,w);se=new Uint16Array(He),Y=new Uint8Array(He),ae=new Float32Array(He*2),Me={},ue=[1/0,1/0,-1/0,-1/0],Ve=[],z&&(we=new Float32Array(g.length*4)),V&&(Ae=new Uint8Array(He*3));let ge=0,Se=-1,Oe=-1,ve,Re;if(b.forEach((Ce,De)=>{let{count:pe,width:Be}=Ce;if(pe>0){let ke=0;for(let Te=pe;Te--&&Ce.glyphAt(Te).glyphObj.isWhitespace;)ke++;let nt=0,j=0;if(S==="center")nt=(W-Be)/2;else if(S==="right")nt=W-Be;else if(S==="justify"&&Ce.isSoftWrapped){let Te=0;for(let be=pe-ke;be--;)Ce.glyphAt(be).glyphObj.isWhitespace&&Te++;j=(W-Be)/Te}if(j||nt){let Te=0;for(let be=0;be<pe;be++){let Ge=Ce.glyphAt(be);const Ze=Ge.glyphObj;Ge.x+=nt+Te,j!==0&&Ze.isWhitespace&&be<pe-ke&&(Te+=j,Ge.width+=j)}}const xe=e.getReorderSegments(g,_e,Ce.glyphAt(0).charIndex,Ce.glyphAt(Ce.count-1).charIndex);for(let Te=0;Te<xe.length;Te++){const[be,Ge]=xe[Te];let Ze=1/0,je=-1/0;for(let qe=0;qe<pe;qe++)if(Ce.glyphAt(qe).charIndex>=be){let Et=qe,bt=qe;for(;bt<pe;bt++){let Ct=Ce.glyphAt(bt);if(Ct.charIndex>Ge)break;bt<pe-ke&&(Ze=Math.min(Ze,Ct.x),je=Math.max(je,Ct.x+Ct.width))}for(let Ct=Et;Ct<bt;Ct++){const cn=Ce.glyphAt(Ct);cn.x=je-(cn.x+cn.width-Ze)}break}}let re;const ye=Te=>re=Te;for(let Te=0;Te<pe;Te++){const be=Ce.glyphAt(Te);re=be.glyphObj;const Ge=re.index,Ze=_e.levels[be.charIndex]&1;if(Ze){const je=e.getMirroredCharacter(g[be.charIndex]);je&&be.fontData.fontObj.forEachGlyph(je,0,0,ye)}if(z){const{charIndex:je,fontData:qe}=be,Et=be.x+te,bt=be.x+be.width+te;we[je*4]=Ze?bt:Et,we[je*4+1]=Ze?Et:bt,we[je*4+2]=Ce.baseline+qe.caretBottom+ie,we[je*4+3]=Ce.baseline+qe.caretTop+ie;const Ct=je-Se;Ct>1&&f(we,Se,Ct),Se=je}if(V){const{charIndex:je}=be;for(;je>Oe;)Oe++,V.hasOwnProperty(Oe)&&(Re=V[Oe])}if(!re.isWhitespace&&!re.isEmpty){const je=ge++,{fontSizeMult:qe,src:Et,index:bt}=be.fontData,Ct=Me[Et]||(Me[Et]={});Ct[Ge]||(Ct[Ge]={path:re.path,pathBounds:[re.xMin,re.yMin,re.xMax,re.yMax]});const cn=be.x+te,Zt=be.y+Ce.baseline+ie;ae[je*2]=cn,ae[je*2+1]=Zt;const bn=cn+re.xMin*qe,Hn=Zt+re.yMin*qe,ci=cn+re.xMax*qe,fn=Zt+re.yMax*qe;bn<ue[0]&&(ue[0]=bn),Hn<ue[1]&&(ue[1]=Hn),ci>ue[2]&&(ue[2]=ci),fn>ue[3]&&(ue[3]=fn),je%X===0&&(ve={start:je,end:je,rect:[1/0,1/0,-1/0,-1/0]},Ve.push(ve)),ve.end++;const Vt=ve.rect;if(bn<Vt[0]&&(Vt[0]=bn),Hn<Vt[1]&&(Vt[1]=Hn),ci>Vt[2]&&(Vt[2]=ci),fn>Vt[3]&&(Vt[3]=fn),se[je]=Ge,Y[je]=bt,V){const On=je*3;Ae[On]=Re>>16&255,Ae[On+1]=Re>>8&255,Ae[On+2]=Re&255}}}}}),we){const Ce=g.length-Se;Ce>1&&f(we,Se,Ce)}}const fe=[];Fe.forEach(({index:_e,src:ge,unitsPerEm:Se,ascender:Oe,descender:ve,lineHeight:Re,capHeight:Ce,xHeight:De})=>{fe[_e]={src:ge,unitsPerEm:Se,ascender:Oe,descender:ve,lineHeight:Re,capHeight:Ce,xHeight:De}}),ne.typesetting=h()-he,N({glyphIds:se,glyphFontIndices:Y,glyphPositions:ae,glyphData:Me,fontData:fe,caretPositions:we,glyphColors:Ae,chunkedBounds:Ve,fontSize:y,topBaseline:ie+b[0].baseline,blockBounds:[te,ie-G,te+W,ie],visibleBounds:ue,timings:ne})})}function l(g,_){a({...g,metricsOnly:!0},m=>{const[p,y,E,v]=m.blockBounds;_({width:E-p,height:v-y})})}function c(g){let _=g.match(/^([\d.]+)%$/),m=_?parseFloat(_[1]):NaN;return isNaN(m)?0:m/100}function f(g,_,m){const p=g[_*4],y=g[_*4+1],E=g[_*4+2],v=g[_*4+3],C=(y-p)/m;for(let R=0;R<m;R++){const T=(_+R)*4;g[T]=p+C*R,g[T+1]=p+C*(R+1),g[T+2]=E,g[T+3]=v}}function h(){return(self.performance||Date).now()}function u(){this.data=[]}const d=["glyphObj","x","y","width","charIndex","fontData"];return u.prototype={width:0,lineHeight:0,baseline:0,cap:0,ex:0,isSoftWrapped:!1,get count(){return Math.ceil(this.data.length/d.length)},glyphAt(g){let _=u.flyweight;return _.data=this.data,_.index=g,_},splitAt(g){let _=new u;return _.data=this.data.splice(g*d.length),_}},u.flyweight=d.reduce((g,_,m,p)=>(Object.defineProperty(g,_,{get(){return this.data[this.index*d.length+m]},set(y){this.data[this.index*d.length+m]=y}}),g),{data:null,index:0}),{typeset:a,measure:l}}const Or=()=>(self.performance||Date).now(),Pl=Ig();let Wd;function rb(r,e,t,n,i,s,o,a,l,c,f=!0){return f?ob(r,e,t,n,i,s,o,a,l,c).then(null,h=>(Wd||(console.warn("WebGL SDF generation failed, falling back to JS",h),Wd=!0),$d(r,e,t,n,i,s,o,a,l,c))):$d(r,e,t,n,i,s,o,a,l,c)}const tl=[],sb=5;let Qf=0;function Lg(){const r=Or();for(;tl.length&&Or()-r<sb;)tl.shift()();Qf=tl.length?setTimeout(Lg,0):0}const ob=(...r)=>new Promise((e,t)=>{tl.push(()=>{const n=Or();try{Pl.webgl.generateIntoCanvas(...r),e({timing:Or()-n})}catch(i){t(i)}}),Qf||(Qf=setTimeout(Lg,0))}),ab=4,lb=2e3,Xd={};let cb=0;function $d(r,e,t,n,i,s,o,a,l,c){const f="TroikaTextSDFGenerator_JS_"+cb++%ab;let h=Xd[f];return h||(h=Xd[f]={workerModule:Js({name:f,workerId:f,dependencies:[Ig,Or],init(u,d){const g=u().javascript.generate;return function(..._){const m=d();return{textureData:g(..._),timing:d()-m}}},getTransferables(u){return[u.textureData.buffer]}}),requests:0,idleTimer:null}),h.requests++,clearTimeout(h.idleTimer),h.workerModule(r,e,t,n,i,s).then(({textureData:u,timing:d})=>{const g=Or(),_=new Uint8Array(u.length*4);for(let m=0;m<u.length;m++)_[m*4+c]=u[m];return Pl.webglUtils.renderImageData(o,_,a,l,r,e,1<<3-c),d+=Or()-g,--h.requests===0&&(h.idleTimer=setTimeout(()=>{zM(f)},lb)),{timing:d}})}function fb(r){r._warm||(Pl.webgl.isSupported(r),r._warm=!0)}const hb=Pl.webglUtils.resizeWebGLCanvasWithoutClearing,Mo={unicodeFontsURL:null,sdfGlyphSize:64,sdfMargin:1/16,sdfExponent:9,textureWidth:2048},ub=new ot;function vs(){return(self.performance||Date).now()}const jd=Object.create(null);function db(r,e){r=mb({},r);const t=vs(),n=[];if(r.font&&n.push({label:"user",src:gb(r.font)}),r.font=n,r.text=""+r.text,r.sdfGlyphSize=r.sdfGlyphSize||Mo.sdfGlyphSize,r.unicodeFontsURL=r.unicodeFontsURL||Mo.unicodeFontsURL,r.colorRanges!=null){let u={};for(let d in r.colorRanges)if(r.colorRanges.hasOwnProperty(d)){let g=r.colorRanges[d];typeof g!="number"&&(g=ub.set(g).getHex()),u[d]=g}r.colorRanges=u}Object.freeze(r);const{textureWidth:i,sdfExponent:s}=Mo,{sdfGlyphSize:o}=r,a=i/o*4;let l=jd[o];if(!l){const u=document.createElement("canvas");u.width=i,u.height=o*256/a,l=jd[o]={glyphCount:0,sdfGlyphSize:o,sdfCanvas:u,sdfTexture:new on(u,void 0,void 0,void 0,Gn,Gn),contextLost:!1,glyphsByFont:new Map},l.sdfTexture.generateMipmaps=!1,pb(l)}const{sdfTexture:c,sdfCanvas:f}=l;Og(r).then(u=>{const{glyphIds:d,glyphFontIndices:g,fontData:_,glyphPositions:m,fontSize:p,timings:y}=u,E=[],v=new Float32Array(d.length*4);let C=0,R=0;const T=vs(),w=_.map(M=>{let P=l.glyphsByFont.get(M.src);return P||l.glyphsByFont.set(M.src,P=new Map),P});d.forEach((M,P)=>{const O=g[P],{src:U,unitsPerEm:B}=_[O];let z=w[O].get(M);if(!z){const{path:ne,pathBounds:k}=u.glyphData[U][M],H=Math.max(k[2]-k[0],k[3]-k[1])/o*(Mo.sdfMargin*o+.5),se=l.glyphCount++,Y=[k[0]-H,k[1]-H,k[2]+H,k[3]+H];w[O].set(M,z={path:ne,atlasIndex:se,sdfViewBox:Y}),E.push(z)}const{sdfViewBox:X}=z,V=m[R++],N=m[R++],$=p/B;v[C++]=V+X[0]*$,v[C++]=N+X[1]*$,v[C++]=V+X[2]*$,v[C++]=N+X[3]*$,d[P]=z.atlasIndex}),y.quads=(y.quads||0)+(vs()-T);const S=vs();y.sdf={};const x=f.height,F=Math.ceil(l.glyphCount/a),I=Math.pow(2,Math.ceil(Math.log2(F*o)));I>x&&(console.info(`Increasing SDF texture size ${x}->${I}`),hb(f,i,I),c.dispose()),Promise.all(E.map(M=>Fg(M,l,r.gpuAccelerateSDF).then(({timing:P})=>{y.sdf[M.atlasIndex]=P}))).then(()=>{E.length&&!l.contextLost&&(Ng(l),c.needsUpdate=!0),y.sdfTotal=vs()-S,y.total=vs()-t,e(Object.freeze({parameters:r,sdfTexture:c,sdfGlyphSize:o,sdfExponent:s,glyphBounds:v,glyphAtlasIndices:d,glyphColors:u.glyphColors,caretPositions:u.caretPositions,chunkedBounds:u.chunkedBounds,ascender:u.ascender,descender:u.descender,lineHeight:u.lineHeight,capHeight:u.capHeight,xHeight:u.xHeight,topBaseline:u.topBaseline,blockBounds:u.blockBounds,visibleBounds:u.visibleBounds,timings:u.timings}))})}),Promise.resolve().then(()=>{l.contextLost||fb(f)})}function Fg({path:r,atlasIndex:e,sdfViewBox:t},{sdfGlyphSize:n,sdfCanvas:i,contextLost:s},o){if(s)return Promise.resolve({timing:-1});const{textureWidth:a,sdfExponent:l}=Mo,c=Math.max(t[2]-t[0],t[3]-t[1]),f=Math.floor(e/4),h=f%(a/n)*n,u=Math.floor(f/(a/n))*n,d=e%4;return rb(n,n,r,t,c,l,i,h,u,d,o)}function pb(r){const e=r.sdfCanvas;e.addEventListener("webglcontextlost",t=>{console.log("Context Lost",t),t.preventDefault(),r.contextLost=!0}),e.addEventListener("webglcontextrestored",t=>{console.log("Context Restored",t),r.contextLost=!1;const n=[];r.glyphsByFont.forEach(i=>{i.forEach(s=>{n.push(Fg(s,r,!0))})}),Promise.all(n).then(()=>{Ng(r),r.sdfTexture.needsUpdate=!0})})}function mb(r,e){for(let t in e)e.hasOwnProperty(t)&&(r[t]=e[t]);return r}let Wa;function gb(r){return Wa||(Wa=typeof document=="undefined"?{}:document.createElement("a")),Wa.href=r,Wa.href}function Ng(r){if(typeof createImageBitmap!="function"){console.info("Safari<15: applying SDF canvas workaround");const{sdfCanvas:e,sdfTexture:t}=r,{width:n,height:i}=e,s=r.sdfCanvas.getContext("webgl");let o=t.image.data;(!o||o.length!==n*i*4)&&(o=new Uint8Array(n*i*4),t.image={width:n,height:i,data:o},t.flipY=!1,t.isDataTexture=!0),s.readPixels(0,0,n,i,s.RGBA,s.UNSIGNED_BYTE,o)}}const _b=Js({name:"Typesetter",dependencies:[ib,nb,VM],init(r,e,t){return r(e,t())}}),Og=Js({name:"Typesetter",dependencies:[_b],init(r){return function(e){return new Promise(t=>{r.typeset(e,t)})}},getTransferables(r){const e=[];for(let t in r)r[t]&&r[t].buffer&&e.push(r[t].buffer);return e}});Og.onMainThread;const qd={};function vb(r){let e=qd[r];return e||(e=qd[r]=new qr(1,1,r,r).translate(.5,.5,0)),e}const xb="aTroikaGlyphBounds",Yd="aTroikaGlyphIndex",yb="aTroikaGlyphColor";class Sb extends fE{constructor(){super(),this.detail=1,this.curveRadius=0,this.groups=[{start:0,count:1/0,materialIndex:0},{start:0,count:1/0,materialIndex:1}],this.boundingSphere=new Zo,this.boundingBox=new jr}computeBoundingSphere(){}computeBoundingBox(){}set detail(e){if(e!==this._detail){this._detail=e,(typeof e!="number"||e<1)&&(e=1);let t=vb(e);["position","normal","uv"].forEach(n=>{this.attributes[n]=t.attributes[n].clone()}),this.setIndex(t.getIndex().clone())}}get detail(){return this._detail}set curveRadius(e){e!==this._curveRadius&&(this._curveRadius=e,this._updateBounds())}get curveRadius(){return this._curveRadius}updateGlyphs(e,t,n,i,s){this.updateAttributeData(xb,e,4),this.updateAttributeData(Yd,t,1),this.updateAttributeData(yb,s,3),this._blockBounds=n,this._chunkedBounds=i,this.instanceCount=t.length,this._updateBounds()}_updateBounds(){const e=this._blockBounds;if(e){const{curveRadius:t,boundingBox:n}=this;if(t){const{PI:i,floor:s,min:o,max:a,sin:l,cos:c}=Math,f=i/2,h=i*2,u=Math.abs(t),d=e[0]/u,g=e[2]/u,_=s((d+f)/h)!==s((g+f)/h)?-u:o(l(d)*u,l(g)*u),m=s((d-f)/h)!==s((g-f)/h)?u:a(l(d)*u,l(g)*u),p=s((d+i)/h)!==s((g+i)/h)?u*2:a(u-c(d)*u,u-c(g)*u);n.min.set(_,e[1],t<0?-p:0),n.max.set(m,e[3],t<0?0:p)}else n.min.set(e[0],e[1],0),n.max.set(e[2],e[3],0);n.getBoundingSphere(this.boundingSphere)}}applyClipRect(e){let t=this.getAttribute(Yd).count,n=this._chunkedBounds;if(n)for(let i=n.length;i--;){t=n[i].end;let s=n[i].rect;if(s[1]<e.w&&s[3]>e.y&&s[0]<e.z&&s[2]>e.x)break}this.instanceCount=t}updateAttributeData(e,t,n){const i=this.getAttribute(e);t?i&&i.array.length===t.length?(i.array.set(t),i.needsUpdate=!0):(this.setAttribute(e,new nE(t,n)),delete this._maxInstanceCount,this.dispose()):i&&this.deleteAttribute(e)}}const Eb=`
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
`,Mb=`
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
`,bb=`
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
`,wb=`
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
`;function Tb(r){const e=Zf(r,{chained:!0,extensions:{derivatives:!0},uniforms:{uTroikaSDFTexture:{value:null},uTroikaSDFTextureSize:{value:new st},uTroikaSDFGlyphSize:{value:0},uTroikaSDFExponent:{value:0},uTroikaTotalBounds:{value:new xt(0,0,0,0)},uTroikaClipRect:{value:new xt(0,0,0,0)},uTroikaEdgeOffset:{value:0},uTroikaFillOpacity:{value:1},uTroikaPositionOffset:{value:new st},uTroikaCurveRadius:{value:0},uTroikaBlurRadius:{value:0},uTroikaStrokeWidth:{value:0},uTroikaStrokeColor:{value:new ot},uTroikaStrokeOpacity:{value:1},uTroikaOrient:{value:new et},uTroikaUseGlyphColors:{value:!0},uTroikaSDFDebug:{value:!1}},vertexDefs:Eb,vertexTransform:Mb,fragmentDefs:bb,fragmentColorTransform:wb,customRewriter({vertexShader:t,fragmentShader:n}){let i=/\buniform\s+vec3\s+diffuse\b/;return i.test(n)&&(n=n.replace(i,"varying vec3 vTroikaGlyphColor").replace(/\bdiffuse\b/g,"vTroikaGlyphColor"),i.test(t)||(t=t.replace(Ug,`uniform vec3 diffuse;
$&
vTroikaGlyphColor = uTroikaUseGlyphColors ? aTroikaGlyphColor / 255.0 : diffuse;
`))),{vertexShader:t,fragmentShader:n}}});return e.transparent=!0,e.forceSinglePass=!0,Object.defineProperties(e,{isTroikaTextMaterial:{value:!0},shadowSide:{get(){return this.side},set(){}}}),e}const Oh=new fh({color:16777215,side:xi,transparent:!0}),Kd=8421504,Jd=new Tt,Xa=new Z,kc=new Z,vo=[],Ab=new Z,zc="+x+y";function Zd(r){return Array.isArray(r)?r[0]:r}let Bg=()=>{const r=new Jt(new qr(1,1),Oh);return Bg=()=>r,r},kg=()=>{const r=new Jt(new qr(1,1,32,1),Oh);return kg=()=>r,r};const Rb={type:"syncstart"},Cb={type:"synccomplete"},zg=["font","fontSize","fontStyle","fontWeight","lang","letterSpacing","lineHeight","maxWidth","overflowWrap","text","direction","textAlign","textIndent","whiteSpace","anchorX","anchorY","colorRanges","sdfGlyphSize"],Db=zg.concat("material","color","depthOffset","clipRect","curveRadius","orientation","glyphGeometryDetail");class Il extends Jt{constructor(){const e=new Sb;super(e,null),this.text="",this.anchorX=0,this.anchorY=0,this.curveRadius=0,this.direction="auto",this.font=null,this.unicodeFontsURL=null,this.fontSize=.1,this.fontWeight="normal",this.fontStyle="normal",this.lang=null,this.letterSpacing=0,this.lineHeight="normal",this.maxWidth=1/0,this.overflowWrap="normal",this.textAlign="left",this.textIndent=0,this.whiteSpace="normal",this.material=null,this.color=null,this.colorRanges=null,this.outlineWidth=0,this.outlineColor=0,this.outlineOpacity=1,this.outlineBlur=0,this.outlineOffsetX=0,this.outlineOffsetY=0,this.strokeWidth=0,this.strokeColor=Kd,this.strokeOpacity=1,this.fillOpacity=1,this.depthOffset=0,this.clipRect=null,this.orientation=zc,this.glyphGeometryDetail=1,this.sdfGlyphSize=null,this.gpuAccelerateSDF=!0,this.debugSDF=!1}sync(e){this._needsSync&&(this._needsSync=!1,this._isSyncing?(this._queuedSyncs||(this._queuedSyncs=[])).push(e):(this._isSyncing=!0,this.dispatchEvent(Rb),db({text:this.text,font:this.font,lang:this.lang,fontSize:this.fontSize||.1,fontWeight:this.fontWeight||"normal",fontStyle:this.fontStyle||"normal",letterSpacing:this.letterSpacing||0,lineHeight:this.lineHeight||"normal",maxWidth:this.maxWidth,direction:this.direction||"auto",textAlign:this.textAlign,textIndent:this.textIndent,whiteSpace:this.whiteSpace,overflowWrap:this.overflowWrap,anchorX:this.anchorX,anchorY:this.anchorY,colorRanges:this.colorRanges,includeCaretPositions:!0,sdfGlyphSize:this.sdfGlyphSize,gpuAccelerateSDF:this.gpuAccelerateSDF,unicodeFontsURL:this.unicodeFontsURL},t=>{this._isSyncing=!1,this._textRenderInfo=t,this.geometry.updateGlyphs(t.glyphBounds,t.glyphAtlasIndices,t.blockBounds,t.chunkedBounds,t.glyphColors);const n=this._queuedSyncs;n&&(this._queuedSyncs=null,this._needsSync=!0,this.sync(()=>{n.forEach(i=>i&&i())})),this.dispatchEvent(Cb),e&&e()})))}onBeforeRender(e,t,n,i,s,o){this.sync(),s.isTroikaTextMaterial&&this._prepareForRender(s)}dispose(){this.geometry.dispose()}get textRenderInfo(){return this._textRenderInfo||null}createDerivedMaterial(e){return Tb(e)}get material(){let e=this._derivedMaterial;const t=this._baseMaterial||this._defaultMaterial||(this._defaultMaterial=Oh.clone());if((!e||!e.isDerivedFrom(t))&&(e=this._derivedMaterial=this.createDerivedMaterial(t),t.addEventListener("dispose",function n(){t.removeEventListener("dispose",n),e.dispose()})),this.hasOutline()){let n=e._outlineMtl;return n||(n=e._outlineMtl=Object.create(e,{id:{value:e.id+.1}}),n.isTextOutlineMaterial=!0,n.depthWrite=!1,n.map=null,e.addEventListener("dispose",function i(){e.removeEventListener("dispose",i),n.dispose()})),[n,e]}else return e}set material(e){e&&e.isTroikaTextMaterial?(this._derivedMaterial=e,this._baseMaterial=e.baseMaterial):this._baseMaterial=e}hasOutline(){return!!(this.outlineWidth||this.outlineBlur||this.outlineOffsetX||this.outlineOffsetY)}get glyphGeometryDetail(){return this.geometry.detail}set glyphGeometryDetail(e){this.geometry.detail=e}get curveRadius(){return this.geometry.curveRadius}set curveRadius(e){this.geometry.curveRadius=e}get customDepthMaterial(){return Zd(this.material).getDepthMaterial()}set customDepthMaterial(e){}get customDistanceMaterial(){return Zd(this.material).getDistanceMaterial()}set customDistanceMaterial(e){}_prepareForRender(e){const t=e.isTextOutlineMaterial,n=e.uniforms,i=this.textRenderInfo;if(i){const{sdfTexture:a,blockBounds:l}=i;n.uTroikaSDFTexture.value=a,n.uTroikaSDFTextureSize.value.set(a.image.width,a.image.height),n.uTroikaSDFGlyphSize.value=i.sdfGlyphSize,n.uTroikaSDFExponent.value=i.sdfExponent,n.uTroikaTotalBounds.value.fromArray(l),n.uTroikaUseGlyphColors.value=!t&&!!i.glyphColors;let c=0,f=0,h=0,u,d,g,_=0,m=0;if(t){let{outlineWidth:y,outlineOffsetX:E,outlineOffsetY:v,outlineBlur:C,outlineOpacity:R}=this;c=this._parsePercent(y)||0,f=Math.max(0,this._parsePercent(C)||0),u=R,_=this._parsePercent(E)||0,m=this._parsePercent(v)||0}else h=Math.max(0,this._parsePercent(this.strokeWidth)||0),h&&(g=this.strokeColor,n.uTroikaStrokeColor.value.set(g==null?Kd:g),d=this.strokeOpacity,d==null&&(d=1)),u=this.fillOpacity;n.uTroikaEdgeOffset.value=c,n.uTroikaPositionOffset.value.set(_,m),n.uTroikaBlurRadius.value=f,n.uTroikaStrokeWidth.value=h,n.uTroikaStrokeOpacity.value=d,n.uTroikaFillOpacity.value=u==null?1:u,n.uTroikaCurveRadius.value=this.curveRadius||0;let p=this.clipRect;if(p&&Array.isArray(p)&&p.length===4)n.uTroikaClipRect.value.fromArray(p);else{const y=(this.fontSize||.1)*100;n.uTroikaClipRect.value.set(l[0]-y,l[1]-y,l[2]+y,l[3]+y)}this.geometry.applyClipRect(n.uTroikaClipRect.value)}n.uTroikaSDFDebug.value=!!this.debugSDF,e.polygonOffset=!!this.depthOffset,e.polygonOffsetFactor=e.polygonOffsetUnits=this.depthOffset||0;const s=t?this.outlineColor||0:this.color;if(s==null)delete e.color;else{const a=e.hasOwnProperty("color")?e.color:e.color=new ot;(s!==a._input||typeof s=="object")&&a.set(a._input=s)}let o=this.orientation||zc;if(o!==e._orientation){let a=n.uTroikaOrient.value;o=o.replace(/[^-+xyz]/g,"");let l=o!==zc&&o.match(/^([-+])([xyz])([-+])([xyz])$/);if(l){let[,c,f,h,u]=l;Xa.set(0,0,0)[f]=c==="-"?1:-1,kc.set(0,0,0)[u]=h==="-"?-1:1,Jd.lookAt(Ab,Xa.cross(kc),kc),a.setFromMatrix4(Jd)}else a.identity();e._orientation=o}}_parsePercent(e){if(typeof e=="string"){let t=e.match(/^(-?[\d.]+)%$/),n=t?parseFloat(t[1]):NaN;e=(isNaN(n)?0:n/100)*this.fontSize}return e}localPositionToTextCoords(e,t=new st){t.copy(e);const n=this.curveRadius;return n&&(t.x=Math.atan2(e.x,Math.abs(n)-Math.abs(e.z))*Math.abs(n)),t}worldPositionToTextCoords(e,t=new st){return Xa.copy(e),this.localPositionToTextCoords(this.worldToLocal(Xa),t)}raycast(e,t){const{textRenderInfo:n,curveRadius:i}=this;if(n){const s=n.blockBounds,o=i?kg():Bg(),a=o.geometry,{position:l,uv:c}=a.attributes;for(let f=0;f<c.count;f++){let h=s[0]+c.getX(f)*(s[2]-s[0]);const u=s[1]+c.getY(f)*(s[3]-s[1]);let d=0;i&&(d=i-Math.cos(h/i)*i,h=Math.sin(h/i)*i),l.setXYZ(f,h,u,d)}a.boundingSphere=this.geometry.boundingSphere,a.boundingBox=this.geometry.boundingBox,o.matrixWorld=this.matrixWorld,o.material.side=this.material.side,vo.length=0,o.raycast(e,vo);for(let f=0;f<vo.length;f++)vo[f].object=this,t.push(vo[f])}}copy(e){const t=this.geometry;return super.copy(e),this.geometry=t,Db.forEach(n=>{this[n]=e[n]}),this}clone(){return new this.constructor().copy(this)}}zg.forEach(r=>{const e="_private_"+r;Object.defineProperty(Il.prototype,r,{get(){return this[e]},set(t){t!==this[e]&&(this[e]=t,this._needsSync=!0)}})});new jr;new ot;const eh=[["B",1,15],["I",16,30],["N",31,45],["G",46,60],["O",61,75]],Pb=3.6;function Ib(){const r=new Array(25).fill(0);return eh.forEach(([,e,t],n)=>{const i=[];for(let s=e;s<=t;s++)i.push(s);for(let s=0;s<5;s++){const o=Math.floor(Math.random()*i.length);r[s*5+n]=i.splice(o,1)[0]}}),r[12]=0,r}function Ub(r,e){const t=n=>n===0||r.has(n);for(let n=0;n<5;n++)if([0,1,2,3,4].every(i=>t(e[n*5+i])))return!0;for(let n=0;n<5;n++)if([0,1,2,3,4].every(i=>t(e[i*5+n])))return!0;return!!([0,1,2,3,4].every(n=>t(e[n*5+n]))||[0,1,2,3,4].every(n=>t(e[n*5+(4-n)])))}const Lb={id:"bingo",title:"Bingo",minPlayers:2,maxPlayers:8,create(r){return new Fb(r)}};class Fb{constructor(e){this.balls=[],this.players=[],this.timer=0,this.shownWinner=!1,this.started=!1,this.cells=[],this.state={phase:"play",drawn:[],last:null,cards:{},marked:{},winner:null,drawSeq:0,log:"Bereit"},this.ctx=e,this.header=new Il,this.header.fontSize=.4,this.header.color="#ffffff",this.header.anchorX="center",this.header.anchorY="middle",this.header.position.set(0,3,-1),this.header.text="BINGO",this.header.sync(),e.scene.add(this.header),this.cage=new Eo;const t=new Jt(new _h(.9,1),new Io({color:2761568,wireframe:!0,emissive:4930815,emissiveIntensity:.6}));this.cage.add(t);const n=new vh(.12,16,12);for(let i=0;i<14;i++){const s=new Jt(n,new Io({color:[15680580,3900150,2278750,15381256][i%4],roughness:.3,metalness:.2}));s.position.set((Math.random()-.5)*.9,(Math.random()-.5)*.9,(Math.random()-.5)*.9),this.cage.add(s),this.balls.push(s)}this.cage.position.set(0,1.7,0),e.scene.add(this.cage),this.hudRoot=document.createElement("div"),this.hudRoot.className="bb-root",e.hud.appendChild(this.hudRoot),this.buildHud()}setPlayers(e){this.players=e,this.render()}start(){this.state={phase:"play",drawn:[],last:null,cards:{},marked:{},winner:null,drawSeq:0,log:"Los!"},this.shownWinner=!1,this.started=!0,this.timer=1.2,this.players.forEach(e=>{this.state.cards[e.id]=Ib(),this.state.marked[e.id]=[]}),this.timer=1.2,this.render(),this.ctx.sendState(this.snapshot())}snapshot(){return JSON.parse(JSON.stringify(this.state))}getState(){return this.snapshot()}applyState(e){this.state=JSON.parse(JSON.stringify(e)),this.state.phase!=="done"&&this.shownWinner&&(this.shownWinner=!1,this.ctx.clearOverlay()),this.render(),this.renderCard(),this.maybeShowWinner()}maybeShowWinner(){if(this.state.phase==="done"&&!this.shownWinner){this.shownWinner=!0;const e=this.state.winner?this.players.find(t=>t.id===this.state.winner):void 0;e?(this.ctx.postScore("bingo",e.id===this.ctx.myId?1:0),this.showWinner(e.name)):this.showDraw()}}showDraw(){const e=document.createElement("button");e.className="bb-again",e.textContent="🔁 Nochmal",e.disabled=!this.ctx.isHost,e.textContent=this.ctx.isHost?"🔁 Nochmal":"⏳ Warte auf Host…",e.addEventListener("click",()=>{this.ctx.isHost&&(this.ctx.clearOverlay(),this.ctx.rematch())}),this.ctx.overlay([xs("div","","🎯"),xs("h1","","Kein Bingo"),xs("p","","Alle Zahlen gezogen – niemand hatte eine Linie."),e])}draw(){var i,s,o;if(this.state.phase!=="play")return;const e=[];for(let a=1;a<=75;a++)this.state.drawn.includes(a)||e.push(a);if(e.length===0){this.state.phase="done",this.state.log="Alle Zahlen gezogen – keine Linie.",this.render(),this.maybeShowWinner(),this.ctx.sendState(this.snapshot());return}const t=e[Math.floor(Math.random()*e.length)];this.state.drawn.push(t),this.state.last=t,this.state.drawSeq+=1;const n=(s=(i=eh.find(([,a,l])=>t>=a&&t<=l))==null?void 0:i[0])!=null?s:"";this.state.log=`${n}-${t}`;for(const a of this.players)!a.isBot||this.state.winner||((o=this.state.cards[a.id])!=null?o:[]).includes(t)&&this.mark(a.id,t,!0);this.checkWinners(),this.render(),this.ctx.sendState(this.snapshot())}mark(e,t,n=!1){var s;const i=(s=this.state.marked[e])!=null?s:this.state.marked[e]=[];i.includes(t)||i.push(t),n||(this.renderCard(),this.ctx.sendState(this.snapshot()))}checkWinners(){var e,t;if(!this.state.winner)for(const n of this.players){const i=new Set((e=this.state.marked[n.id])!=null?e:[]);if(Ub(i,(t=this.state.cards[n.id])!=null?t:[])){this.state.winner=n.id,this.state.phase="done",this.state.log=`🏆 ${n.name} hat BINGO!`,this.maybeShowWinner();return}}}handleIntent(e,t){var n;if(e.type==="mark"&&typeof e.n=="number"&&this.state.drawn.includes(e.n)){if(!((n=this.state.cards[t])!=null?n:[]).includes(e.n))return;this.mark(t,e.n),this.checkWinners(),this.ctx.sendState(this.snapshot())}}update(e){this.cage.rotation.y+=e*.6,this.cage.rotation.x+=e*.2,this.balls.forEach((t,n)=>{t.position.y+=Math.sin(performance.now()/400+n)*.002}),!(!this.ctx.isHost||!this.started||this.state.phase!=="play")&&(this.timer-=e,this.timer<=0&&(this.timer=Pb,this.draw()))}buildHud(){this.lastBadge=wr("div","bb-last"),this.calledEl=wr("div","bb-called"),this.cardEl=wr("div","bb-card"),this.logEl=wr("div","bb-log");const e=wr("div","bb-top");e.appendChild(this.lastBadge),e.appendChild(this.logEl),this.hudRoot.appendChild(e),this.hudRoot.appendChild(this.calledEl),this.hudRoot.appendChild(this.cardEl)}render(){this.lastBadge.textContent=this.state.last?String(this.state.last):"–",this.logEl.textContent=this.state.log,this.calledEl.innerHTML="",this.state.drawn.slice(-12).forEach(e=>{const t=wr("span","bb-ball");t.textContent=String(e),this.calledEl.appendChild(t)}),this.renderCard()}renderCard(){var n;const e=this.state.cards[this.ctx.myId];if(!e)return;if(this.cells.length!==25){this.cardEl.innerHTML="";for(let i=0;i<25;i++){const s=document.createElement("button");s.className="bb-cell",s.innerHTML='<span class="lt"></span><span class="nu"></span>',s.addEventListener("click",()=>{const o=this.state.cards[this.ctx.myId];if(!o||this.state.phase!=="play")return;const a=o[i];a===0||!this.state.drawn.includes(a)||(this.ctx.isHost?(this.mark(this.ctx.myId,a),this.checkWinners()):this.ctx.sendIntent({type:"mark",n:a}))}),this.cardEl.appendChild(s),this.cells.push(s)}}const t=new Set((n=this.state.marked[this.ctx.myId])!=null?n:[]);for(let i=0;i<25;i++){const s=e[i],o=this.cells[i],a=o.querySelector(".lt"),l=o.querySelector(".nu");a&&(a.textContent=eh[i%5][0]),l&&(l.textContent=s===0?"★":String(s));const c=s===0||this.state.drawn.includes(s),f=s===0||t.has(s);o.classList.toggle("marked",f),o.classList.toggle("hot",s===this.state.last),o.disabled=s===0||!c||this.state.phase!=="play"}}showWinner(e){const t=document.createElement("button");t.className="bb-again",t.textContent="🔁 Nochmal",t.disabled=!this.ctx.isHost,t.textContent=this.ctx.isHost?"🔁 Nochmal":"⏳ Warte auf Host…",t.addEventListener("click",()=>{this.ctx.isHost&&(this.ctx.clearOverlay(),this.ctx.rematch())}),this.ctx.overlay([xs("div","","🏆"),xs("h1","",e),xs("p","","hat BINGO!"),t])}dispose(){var e,t;this.ctx.scene.remove(this.header),this.ctx.scene.remove(this.cage),(t=(e=this.header).dispose)==null||t.call(e),this.hudRoot.remove()}}function wr(r,e){const t=document.createElement(r);return t.className=e,t}function xs(r,e,t){const n=wr(r,e);return n.textContent=t,n}const xo=new Z;function kn(r,e,t,n,i,s){const o=2*Math.PI*i/4,a=Math.max(s-2*i,0),l=Math.PI/4;xo.copy(e),xo[n]=0,xo.normalize();const c=.5*o/(o+a),f=1-xo.angleTo(r)/l;return Math.sign(xo[t])===1?f*c:a/(o+a)+c+c*(1-f)}class Nb extends $s{constructor(e=1,t=1,n=1,i=2,s=.1){if(i=i*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,i,i,i),i===1)return;const o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;const a=new Z,l=new Z,c=new Z(e,t,n).divideScalar(2).subScalar(s),f=this.attributes.position.array,h=this.attributes.normal.array,u=this.attributes.uv.array,d=f.length/6,g=new Z,_=.5/i;for(let m=0,p=0;m<f.length;m+=3,p+=2)switch(a.fromArray(f,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),f[m+0]=c.x*Math.sign(a.x)+l.x*s,f[m+1]=c.y*Math.sign(a.y)+l.y*s,f[m+2]=c.z*Math.sign(a.z)+l.z*s,h[m+0]=l.x,h[m+1]=l.y,h[m+2]=l.z,Math.floor(m/d)){case 0:g.set(1,0,0),u[p+0]=kn(g,l,"z","y",s,n),u[p+1]=1-kn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),u[p+0]=1-kn(g,l,"z","y",s,n),u[p+1]=1-kn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),u[p+0]=1-kn(g,l,"x","z",s,e),u[p+1]=kn(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),u[p+0]=1-kn(g,l,"x","z",s,e),u[p+1]=1-kn(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),u[p+0]=1-kn(g,l,"x","y",s,e),u[p+1]=1-kn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),u[p+0]=kn(g,l,"x","y",s,e),u[p+1]=1-kn(g,l,"y","x",s,t);break}}}const Ob={1:[[.5,.5]],2:[[.29,.29],[.71,.71]],3:[[.29,.29],[.5,.5],[.71,.71]],4:[[.29,.29],[.71,.29],[.29,.71],[.71,.71]],5:[[.29,.29],[.71,.29],[.5,.5],[.29,.71],[.71,.71]],6:[[.29,.24],[.71,.24],[.29,.5],[.71,.5],[.29,.76],[.71,.76]]},Bb=[1,6,2,5,3,4];function kb(r,e,t){const i=document.createElement("canvas");i.width=128,i.height=128;const s=i.getContext("2d"),o=s.createLinearGradient(0,0,128,128);o.addColorStop(0,e),o.addColorStop(1,"#d9d2c4"),s.fillStyle=o,s.fillRect(0,0,128,128);for(const[l,c]of Ob[r])s.beginPath(),s.arc(l*128,c*128,128*.1,0,Math.PI*2),s.fillStyle=t,s.fill();const a=new rE(i);return a.anisotropy=4,a}function Qd(r,e){let t=0,n=0;switch(r){case 1:n=Math.PI/2;break;case 6:n=-Math.PI/2;break;case 2:break;case 5:t=Math.PI;break;case 3:t=-Math.PI/2;break;default:t=Math.PI/2;break}return new oi(t,e,n,"YXZ")}class Gg{constructor(e,t,n={}){var a,l,c,f;this.dice=[],this.scene=e,this.size=(a=n.size)!=null?a:.62,this.spacing=(l=n.spacing)!=null?l:this.size*1.18,this.bodyColor=(c=n.body)!=null?c:"#fdfcf6";const i=(f=n.y)!=null?f:.42;this.baseY=i;const s=new Nb(this.size,this.size,this.size,4,this.size*.16);this.geo=s;const o=-((t-1)*this.spacing)/2;for(let h=0;h<t;h++){const u=Bb.map(g=>new Io({map:kb(g,this.bodyColor,"#1c1a26"),roughness:.35,metalness:.05})),d=new Jt(s,u);d.position.set(o+h*this.spacing,i,0),d.castShadow=!1,this.scene.add(d),this.dice.push({mesh:d,value:1,target:1,yaw:0,spin:0,rolling:0,kept:!1,baseY:i,baseMat:u})}this.setValues(this.dice.map(()=>1),!0)}get values(){return this.dice.map(e=>e.value)}roll(e,t=null){for(let n=0;n<this.dice.length;n++){if(t&&!t.includes(n))continue;const i=this.dice[n];i.target=e[n]||1+Math.floor(Math.random()*6),i.rolling=.55+Math.random()*.25,i.spin=6+Math.random()*8}}setValues(e,t=!1){var n;for(let i=0;i<this.dice.length;i++){const s=this.dice[i];s.value=(n=e[i])!=null?n:1,s.target=s.value,t&&(s.rolling=0,s.yaw=(Math.random()-.5)*.5,s.mesh.quaternion.setFromEuler(Qd(s.value,s.yaw)))}}setKept(e,t){const n=this.dice[e];n&&(n.kept=t,n.baseY=this.baseY+(t?.16:0))}setActive(e){this.dice.forEach((t,n)=>{t.mesh.visible=n<e})}setHighlight(e){this.dice.forEach((t,n)=>{const i=!e||e.includes(n);t.baseMat.forEach(s=>{s.emissive.setHex(i?0:2234931),s.emissiveIntensity=i?0:.6})})}update(e){for(const t of this.dice)t.rolling>0?(t.rolling-=e,t.mesh.rotation.x+=e*t.spin,t.mesh.rotation.y+=e*t.spin*.8,t.mesh.rotation.z+=e*t.spin*.6,t.mesh.position.y=t.baseY+Math.abs(Math.sin(t.mesh.rotation.x))*.25,t.rolling<=0&&(t.value=t.target,t.yaw=(Math.random()-.5)*.5,t.mesh.quaternion.setFromEuler(Qd(t.value,t.yaw)))):t.mesh.position.y+=(t.baseY-t.mesh.position.y)*Math.min(1,e*10)}dispose(){for(const e of this.dice)this.scene.remove(e.mesh),e.baseMat.forEach(t=>{var n;(n=t.map)==null||n.dispose(),t.dispose()});this.geo.dispose(),this.dice=[]}}const ep=[{id:"ones",label:"Einser",hint:"Summe der Einsen"},{id:"twos",label:"Zweier",hint:"Summe der Zweien"},{id:"threes",label:"Dreier",hint:"Summe der Dreien"},{id:"fours",label:"Vierer",hint:"Summe der Vieren"},{id:"fives",label:"Fünfer",hint:"Summe der Fünfen"},{id:"sixes",label:"Sechser",hint:"Summe der Sechsen"},{id:"three",label:"Dreierpasch",hint:"3 gleiche → Summe"},{id:"four",label:"Viererpasch",hint:"4 gleiche → Summe"},{id:"fullHouse",label:"Full House",hint:"3+2 → 25"},{id:"small",label:"Kleine Straße",hint:"4 in Folge → 30"},{id:"large",label:"Große Straße",hint:"5 in Folge → 40"},{id:"yahtzee",label:"Kniffel",hint:"5 gleiche → 50"},{id:"chance",label:"Chance",hint:"Summe aller"}];function Gc(r,e){const t=[0,0,0,0,0,0,0];e.forEach(s=>{var o;t[s]=((o=t[s])!=null?o:0)+1});const n=e.reduce((s,o)=>s+o,0),i=Math.max(...t);switch(r){case"ones":return t[1]*1;case"twos":return t[2]*2;case"threes":return t[3]*3;case"fours":return t[4]*4;case"fives":return t[5]*5;case"sixes":return t[6]*6;case"three":return i>=3?n:0;case"four":return i>=4?n:0;case"fullHouse":return i===3&&t.includes(2)||i===5?25:0;case"small":{const s=new Set(e);return[[1,2,3,4],[2,3,4,5],[3,4,5,6]].some(a=>a.every(l=>s.has(l)))?30:0}case"large":{const s=[...new Set(e)].sort().join("");return s==="12345"||s==="23456"?40:0}case"yahtzee":return i===5?50:0;case"chance":return n}}const zb=()=>1+Math.floor(Math.random()*6),Vg={id:"poker",title:"Würfel-Poker",minPlayers:2,maxPlayers:6,create(r){return new Gb(r)}};class Gb{constructor(e){this.players=[],this.state={phase:"play",turn:0,rollsLeft:3,dice:[1,1,1,1,1],kept:[!1,!1,!1,!1,!1],scores:{},rollSeq:0,log:"Bereit"},this.diceChips=[],this.botWait=0,this.botStep=0,this.appliedSeq=-1,this.shownResults=!1,this.ctx=e,this.header=new Il,this.header.fontSize=.34,this.header.color="#ffffff",this.header.anchorX="center",this.header.anchorY="middle",this.header.maxWidth=5,this.header.position.set(0,3,-1.2),this.header.sync(),e.scene.add(this.header),this.dset=new Gg(e.scene,5,{size:.72,spacing:.92,y:.5}),this.dset.dice.forEach(t=>{t.baseY=.5,t.mesh.position.y=.5}),this.hudRoot=document.createElement("div"),this.hudRoot.className="bp-root",e.hud.appendChild(this.hudRoot),this.buildHud()}setPlayers(e){this.players=e;for(const t of e)this.state.scores[t.id]||(this.state.scores[t.id]={});this.render()}start(){this.state={phase:"play",turn:0,rollsLeft:3,dice:[1,1,1,1,1],kept:[!1,!1,!1,!1,!1],scores:{},rollSeq:0,log:"Am Zug"},this.players.forEach(e=>{this.state.scores[e.id]={}}),this.shownResults=!1,this.rollAll()}showResults(){var s;const e=Object.values((s=this.state.scores[this.ctx.myId])!=null?s:{}).reduce((o,a)=>o+(a!=null?a:0),0);this.ctx.postScore("poker",e);const t=this.players.map(o=>{var a;return{p:o,total:Object.values((a=this.state.scores[o.id])!=null?a:{}).reduce((l,c)=>l+(c!=null?c:0),0)}}).sort((o,a)=>a.total-o.total),n=Yn("div","roster");t.forEach((o,a)=>{const l=Yn("div","row"),c=Yn("span","");c.textContent=`${a+1}. ${o.p.name}`;const f=Yn("span","");f.textContent=String(o.total),l.appendChild(c),l.appendChild(f),n.appendChild(l)});const i=document.createElement("button");i.className="btn",i.textContent=this.ctx.isHost?"🔁 Nochmal":"⏳ Warte auf Host…",i.disabled=!this.ctx.isHost,i.addEventListener("click",()=>{this.ctx.isHost&&(this.ctx.clearOverlay(),this.ctx.rematch())}),this.ctx.overlay([Vb("h1","","🏆 Ergebnis"),n,i])}buildHud(){const e=Yn("div","bp-rollbar");this.rollInfo=Yn("div","bp-rollinfo"),this.rollBtn=Vc("🎲 Würfeln","bp-btn",()=>this.intent({type:"roll"})),e.appendChild(this.rollInfo),e.appendChild(this.rollBtn);const t=Yn("div","bp-chips");for(let n=0;n<5;n++){const i=Vc("?","bp-chip",()=>this.intent({type:"keep",index:n}));t.appendChild(i),this.diceChips.push(i)}this.catGrid=Yn("div","bp-cats"),this.logEl=Yn("div","bp-log"),this.hudRoot.appendChild(this.logEl),this.hudRoot.appendChild(this.catGrid),this.hudRoot.appendChild(t),this.hudRoot.appendChild(e)}isMyTurn(){var e;return((e=this.players[this.state.turn])==null?void 0:e.id)===this.ctx.myId}intent(e){!this.isMyTurn()||this.state.phase!=="play"||(this.ctx.isHost?this.applyIntent(e,this.ctx.myId):this.ctx.sendIntent(e))}rollAll(){const e=[];for(let n=0;n<5;n++)this.state.kept[n]||e.push(n);if(this.state.rollsLeft<=0||e.length===0)return;const t=this.state.dice.slice();e.forEach(n=>{t[n]=zb()}),this.state.dice=t,this.state.rollsLeft-=1,this.state.rollSeq+=1,this.state.log=`Wurf ${3-this.state.rollsLeft}/3`,this.dset.roll(t,e),this.afterChange()}toggleKeep(e){this.state.kept[e]=!this.state.kept[e],this.dset.setKept(e,this.state.kept[e]),this.afterChange()}chooseCat(e){var n,i,s,o;if(((n=this.state.scores[this.currentId()])==null?void 0:n[e])!==void 0)return;const t=Gc(e,this.state.dice);((o=(i=this.state.scores)[s=this.currentId()])!=null?o:i[s]={})[e]=t,this.state.log=`${this.currentName()}: ${e} = ${t}`,this.nextTurn()}nextTurn(){var t;if(this.players.every(n=>{var i;return Object.keys((i=this.state.scores[n.id])!=null?i:{}).length>=13})){this.state.phase="done",this.state.log="Spiel beendet",this.afterChange();return}do this.state.turn=(this.state.turn+1)%this.players.length;while(Object.keys((t=this.state.scores[this.players[this.state.turn].id])!=null?t:{}).length>=13);this.state.rollsLeft=3,this.state.kept=[!1,!1,!1,!1,!1],this.state.dice=[1,1,1,1,1],this.dset.dice.forEach((n,i)=>this.dset.setKept(i,!1)),this.state.log=`${this.currentName()} ist am Zug`,this.afterChange(),this.rollAll()}applyIntent(e,t){var n;((n=this.players[this.state.turn])==null?void 0:n.id)===t&&(e.type==="roll"?this.rollAll():e.type==="keep"&&typeof e.index=="number"?this.toggleKeep(e.index):e.type==="cat"&&typeof e.cat=="string"&&this.chooseCat(e.cat))}handleIntent(e,t){this.applyIntent(e,t)}currentId(){var e,t;return(t=(e=this.players[this.state.turn])==null?void 0:e.id)!=null?t:""}currentName(){var e,t;return(t=(e=this.players[this.state.turn])==null?void 0:e.name)!=null?t:""}afterChange(){this.render(),this.ctx.sendState(this.snapshot())}snapshot(){return{...this.state,dice:[...this.state.dice],kept:[...this.state.kept],scores:JSON.parse(JSON.stringify(this.state.scores))}}getState(){return this.snapshot()}applyState(e){const t=e,n=t.rollSeq!==this.appliedSeq;if(this.appliedSeq=t.rollSeq,this.state={...t,dice:[...t.dice],kept:[...t.kept],scores:JSON.parse(JSON.stringify(t.scores))},n){const i=t.dice.map((s,o)=>o).filter(s=>!t.kept[s]);i.length?this.dset.roll(t.dice,i):this.dset.setValues(t.dice,!0)}else this.dset.setValues(t.dice,!0);t.kept.forEach((i,s)=>this.dset.setKept(s,i)),t.phase!=="done"&&this.shownResults&&(this.shownResults=!1,this.ctx.clearOverlay()),this.render()}update(e){var s,o;if(this.dset.update(e),!this.ctx.isHost||this.state.phase!=="play")return;if(!((s=this.players[this.state.turn])==null?void 0:s.isBot)){this.botStep=0,this.botWait=0;return}if(this.botWait-=e,this.botWait>0)return;if(this.state.rollsLeft>0){const a=[0,0,0,0,0,0,0];this.state.dice.forEach(c=>{a[c]+=1});let l=1;for(let c=2;c<=6;c++)a[c]>a[l]&&(l=c);for(let c=0;c<5;c++){const f=this.state.dice[c]===l||this.state.dice[c]>=5;this.state.kept[c]!==f&&(this.state.kept[c]=f,this.dset.setKept(c,f))}if(this.state.kept.some(c=>!c)){this.botWait=.9,this.rollAll();return}}let n="chance",i=-1;for(const a of ep){if(((o=this.state.scores[this.currentId()])==null?void 0:o[a.id])!==void 0)continue;const l=Gc(a.id,this.state.dice);l>i&&(i=l,n=a.id)}this.botStep+=1,this.botWait=1,this.chooseCat(n)}render(){var n,i,s;const e=this.players[this.state.turn];this.header.text=this.state.phase==="done"?"🏆 Spiel beendet":`Am Zug: ${(n=e==null?void 0:e.name)!=null?n:""}`,this.header.color=(i=e==null?void 0:e.color)!=null?i:"#ffffff",this.header.sync(),this.logEl.textContent=this.state.log;const t=this.isMyTurn()&&this.state.phase==="play";this.rollBtn.disabled=!t||this.state.rollsLeft<=0,this.rollInfo.textContent=t?`Würfe übrig: ${this.state.rollsLeft}`:"Warte…",this.diceChips.forEach((o,a)=>{o.textContent=this.state.dice[a]?"⚀⚁⚂⚃⚄⚅"[this.state.dice[a]-1]:"?",o.classList.toggle("kept",!!this.state.kept[a]),o.disabled=!t}),this.catGrid.innerHTML="";for(const o of ep){const a=(s=this.state.scores[this.ctx.myId])==null?void 0:s[o.id],l=Vc("","bp-cat",()=>this.intent({type:"cat",cat:o.id})),c=Yn("span","nm");c.textContent=o.label;const f=Yn("span","vl");f.textContent=String(a!==void 0?a:Gc(o.id,this.state.dice)),l.appendChild(c),l.appendChild(f),a!==void 0&&l.classList.add("used"),l.disabled=!t||a!==void 0,this.catGrid.appendChild(l)}this.state.phase==="done"&&!this.shownResults&&(this.shownResults=!0,this.showResults())}dispose(){var e,t;this.dset.dispose(),this.ctx.scene.remove(this.header),(t=(e=this.header).dispose)==null||t.call(e),this.hudRoot.remove()}}function Yn(r,e){const t=document.createElement(r);return t.className=e,t}function Vc(r,e,t){const n=document.createElement("button");return n.className=e,n.textContent=r,n.addEventListener("click",t),n}function Vb(r,e,t){const n=document.createElement(r);return n.textContent=t,n}const Hc=5,tp=()=>1+Math.floor(Math.random()*6),Hb={id:"liar",title:"Lügen-Dice",minPlayers:2,maxPlayers:6,create(r){return new Wb(r)}};class Wb{constructor(e){this.players=[],this.state={phase:"play",turn:0,dice:{},bid:null,reveal:null,log:"Bereit",round:1},this.qty=1,this.face=1,this.botWait=0,this.appliedRound=-1,this.shownWinner=!1,this._revealTimer=0,this.ctx=e,this.header=new Il,this.header.fontSize=.34,this.header.color="#ffffff",this.header.anchorX="center",this.header.anchorY="middle",this.header.maxWidth=5,this.header.position.set(0,3,-1.1),this.header.sync(),e.scene.add(this.header),this.dset=new Gg(e.scene,Hc,{size:.66,spacing:.84,y:.48}),this.dset.dice.forEach(t=>{t.baseY=.48,t.mesh.position.y=.48}),this.hudRoot=document.createElement("div"),this.hudRoot.className="bl-root",e.hud.appendChild(this.hudRoot),this.buildHud()}setPlayers(e){this.players=e,this.render()}start(){this.state={phase:"play",turn:0,dice:{},bid:null,reveal:null,log:"Am Zug",round:1},this.shownWinner=!1,this.rollAll()}alivePlayers(){return this.players.filter(e=>{var t,n;return((n=(t=this.state.dice[e.id])==null?void 0:t.length)!=null?n:0)>0})}rollAll(){var e,t,n,i,s,o;for(const a of this.players){const l=(t=(e=this.state.dice[a.id])==null?void 0:e.length)!=null?t:Hc;this.state.dice[a.id]=Array.from({length:a.id in this.state.dice?l:Hc},()=>tp())}for(this.state.turn=0;((o=(s=this.state.dice[(i=(n=this.players[this.state.turn])==null?void 0:n.id)!=null?i:""])==null?void 0:s.length)!=null?o:0)===0;)this.state.turn=(this.state.turn+1)%this.players.length;this.state.bid=null,this.state.reveal=null,this.state.log=`${this.currentName()} beginnt`,this.syncMyDice(),this.afterChange()}currentId(){var e,t;return(t=(e=this.players[this.state.turn])==null?void 0:e.id)!=null?t:""}currentName(){var e,t;return(t=(e=this.players[this.state.turn])==null?void 0:e.name)!=null?t:""}totalDice(){return this.players.reduce((e,t)=>{var n,i;return e+((i=(n=this.state.dice[t.id])==null?void 0:n.length)!=null?i:0)},0)}validBid(e,t){const n=this.state.bid;return n?e>n.qty?t>=1&&t<=6:e===n.qty?t>n.face:!1:e>=1&&t>=1&&t<=6}doBid(e,t){this.state.reveal&&(this.state.reveal=null,this.rollRound()),this.state.bid={qty:e,face:t,by:this.currentId()},this.state.log=`${this.currentName()} bietet ${e}× ${t}`,this.nextTurn()}rollRound(){var e,t;for(const n of this.players){const i=(t=(e=this.state.dice[n.id])==null?void 0:e.length)!=null?t:0;i>0&&(this.state.dice[n.id]=Array.from({length:i},()=>tp()))}this.syncMyDice()}doChallenge(){var l,c,f,h,u,d,g,_;const e=this.state.bid;if(!e)return;let t=0;for(const m of this.players)t+=((l=this.state.dice[m.id])!=null?l:[]).filter(p=>p===e.face).length;const n=this.players.find(m=>m.id===e.by),i=this.players[this.state.turn],s=t>=e.qty?i:n;if(s){const m=(c=this.state.dice[s.id])!=null?c:[];m.pop(),this.state.dice[s.id]=m}this.state.reveal={actual:t,face:e.face,qty:e.qty,loser:(f=s==null?void 0:s.id)!=null?f:"",by:e.by},this.state.log=`Zweifel! ${t}× ${e.face} → ${s==null?void 0:s.name} verliert einen Würfel`;const o=this.alivePlayers();if(o.length<=1){this.state.phase="done",this.state.log=`🏆 ${(h=o[0])==null?void 0:h.name} gewinnt!`,this.maybeShowWinner(),this.afterChange();return}let a=this.players.findIndex(m=>m.id===(s==null?void 0:s.id));do a=(a+1)%this.players.length;while(((_=(g=this.state.dice[(d=(u=this.players[a])==null?void 0:u.id)!=null?d:""])==null?void 0:g.length)!=null?_:0)===0);this.state.turn=a,this.state.bid=null,this.state.round+=1,this.syncMyDice(),this.afterChange()}nextTurn(){var t,n,i,s;let e=this.state.turn;do e=(e+1)%this.players.length;while(((s=(i=this.state.dice[(n=(t=this.players[e])==null?void 0:t.id)!=null?n:""])==null?void 0:i.length)!=null?s:0)===0);this.state.turn=e,this.afterChange()}syncMyDice(){var t;const e=(t=this.state.dice[this.ctx.myId])!=null?t:[];this.dset.setActive(Math.min(this.dset.dice.length,e.length)),e.length&&this.dset.roll(e,e.map((n,i)=>i))}handleIntent(e,t){this.state.phase!=="play"||this.currentId()!==t||this.state.reveal||(e.type==="bid"&&typeof e.qty=="number"&&typeof e.face=="number"?this.validBid(e.qty,e.face)&&this.doBid(e.qty,e.face):e.type==="challenge"&&this.state.bid&&this.doChallenge())}afterChange(){this.render(),this.ctx.sendState(this.snapshot())}snapshot(){return JSON.parse(JSON.stringify(this.state))}getState(){return this.snapshot()}applyState(e){var s;const t=e,n=t.round!==this.appliedRound;this.appliedRound=t.round,this.state=JSON.parse(JSON.stringify(t));const i=(s=t.dice[this.ctx.myId])!=null?s:[];this.dset.setActive(Math.min(this.dset.dice.length,i.length)),n?this.syncMyDice():i.length&&this.dset.setValues(i,!0),t.phase!=="done"&&this.shownWinner&&(this.shownWinner=!1,this.ctx.clearOverlay()),this.render(),this.maybeShowWinner()}maybeShowWinner(){if(this.state.phase==="done"&&!this.shownWinner){this.shownWinner=!0;const t=this.alivePlayers()[0];t&&(this.ctx.postScore("liar",t.id===this.ctx.myId?1:0),this.showWinner(t.name))}}update(e){var l,c;if(this.dset.update(e),!this.ctx.isHost||this.state.phase!=="play"||this.state.reveal)return;if(!((l=this.players[this.state.turn])==null?void 0:l.isBot)){this.botWait=0;return}if(this.botWait-=e,this.botWait>0)return;this.botWait=1.1;const n=this.totalDice(),i=(c=this.state.dice[this.currentId()])!=null?c:[],s=this.state.bid;if(!s){const f=[0,0,0,0,0,0,0];i.forEach(u=>{f[u]+=1});let h=1;for(let u=2;u<=6;u++)f[u]>f[h]&&(h=u);this.doBid(Math.max(1,Math.round(n*.28)),h);return}const a=i.filter(f=>f===s.face).length+(n-i.length)/6;if(s.qty>a+.8||Math.random()<.08){this.doChallenge();return}s.face<6&&Math.random()<.5?this.doBid(s.qty,s.face+1):this.doBid(s.qty+1,1)}buildHud(){this.bidInfo=hi("div","bl-bid"),this.logEl=hi("div","bl-log"),this.playersEl=hi("div","bl-players"),this.controls=hi("div","bl-controls");const e=hi("div","bl-stepper"),t=document.createElement("button");t.className="bl-step",t.textContent="−";const n=hi("span","bl-qty");n.textContent="1";const i=document.createElement("button");i.className="bl-step",i.textContent="+",t.addEventListener("click",()=>{this.qty=Math.max(1,this.qty-1),n.textContent=String(this.qty)}),i.addEventListener("click",()=>{this.qty=Math.min(50,this.qty+1),n.textContent=String(this.qty)}),e.appendChild(t),e.appendChild(n),e.appendChild(i);const s=hi("div","bl-faces"),o=[];for(let f=1;f<=6;f++){const h=document.createElement("button");h.className="bl-face",h.textContent="⚀⚁⚂⚃⚄⚅"[f-1],h.addEventListener("click",()=>{this.face=f,o.forEach((u,d)=>u.classList.toggle("sel",d===f-1))}),f===1&&h.classList.add("sel"),o.push(h),s.appendChild(h)}const a=document.createElement("button");a.className="bl-bidbtn",a.textContent="Bieten",a.addEventListener("click",()=>this.intent({type:"bid",qty:this.qty,face:this.face}));const l=document.createElement("button");l.className="bl-doubtbtn",l.textContent="Zweifeln!",l.addEventListener("click",()=>this.intent({type:"challenge"}));const c=hi("div","bl-actionrow");c.appendChild(a),c.appendChild(l),this.controls.appendChild(this.bidInfo),this.controls.appendChild(e),this.controls.appendChild(s),this.controls.appendChild(c),this.hudRoot.appendChild(this.playersEl),this.hudRoot.appendChild(this.logEl),this.hudRoot.appendChild(this.controls)}intent(e){!this.isMyTurn()||this.state.phase!=="play"||this.state.reveal||(this.ctx.isHost?this.handleIntent(e,this.ctx.myId):this.ctx.sendIntent(e))}isMyTurn(){return this.currentId()===this.ctx.myId}render(){var n,i,s,o,a,l;const e=this.players[this.state.turn];this.header.text=this.state.phase==="done"?"🏆 Spiel beendet":`Am Zug: ${(n=e==null?void 0:e.name)!=null?n:""}`,this.header.color=(i=e==null?void 0:e.color)!=null?i:"#ffffff",this.header.sync(),this.logEl.textContent=this.state.log,this.bidInfo.textContent=this.state.bid?`Aktuell: ${this.state.bid.qty}× ${"⚀⚁⚂⚃⚄⚅"[this.state.bid.face-1]}`:"Noch kein Gebot",this.playersEl.innerHTML="";for(const c of this.players){const f=(o=(s=this.state.dice[c.id])==null?void 0:s.length)!=null?o:0,h=hi("div","bl-pchip");h.style.color=c.color,h.textContent=`${c.name}${c.isBot?" 🤖":""} · ${f} 🎲`,((a=this.players[this.state.turn])==null?void 0:a.id)===c.id&&h.classList.add("active"),f===0&&h.classList.add("out"),this.playersEl.appendChild(h)}const t=this.isMyTurn()&&this.state.phase==="play"&&!this.state.reveal;if(this.controls.style.opacity=t?"1":"0.4",Array.from(this.controls.querySelectorAll("button")).forEach(c=>{c.disabled=!t}),this.state.reveal){this.state.reveal;const c=[0,0,0,0,0,0,0];for(const h of this.players)((l=this.state.dice[h.id])!=null?l:[]).forEach(u=>{c[u]+=1});const f=c.slice(1).map((h,u)=>`${"⚀⚁⚂⚃⚄⚅"[u]}×${h}`).join("  ");this.bidInfo.textContent=`Aufgedeckt: ${f}`,window.clearTimeout(this._revealTimer),this._revealTimer=window.setTimeout(()=>{this.state.reveal=null,this.render()},3200)}}showWinner(e){const t=document.createElement("button");t.className="bl-bidbtn",t.textContent="🔁 Nochmal",t.disabled=!this.ctx.isHost,t.textContent=this.ctx.isHost?"🔁 Nochmal":"⏳ Warte auf Host…",t.addEventListener("click",()=>{this.ctx.isHost&&(this.ctx.clearOverlay(),this.ctx.rematch())}),this.ctx.overlay([Wc("div","","🏆"),Wc("h1","",e),Wc("p","","gewinnt!"),t])}dispose(){var e,t;this.dset.dispose(),this.ctx.scene.remove(this.header),(t=(e=this.header).dispose)==null||t.call(e),this.hudRoot.remove()}}function hi(r,e){const t=document.createElement(r);return t.className=e,t}function Wc(r,e,t){const n=hi(r,e);return n.textContent=t,n}const Lr=["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#06b6d4"],Zs=new URLSearchParams(window.location.search),Xb=Zs.get("game")||"poker",ir=Zs.get("net"),Do=Zs.get("name")||"Du",$b=Zs.get("mode")||"public",np=Zs.get("room")||"",jb={bingo:Lb,poker:Vg,liar:Hb};var kp;const sa=(kp=jb[Xb])!=null?kp:Vg,Oo=document.getElementById("app");var zp;const Hg=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches||((zp=navigator.maxTouchPoints)!=null?zp:0)>0,Wg=Hg?1.5:2,$r=new eE({antialias:!Hg,powerPreference:"high-performance"});$r.setPixelRatio(Math.min(window.devicePixelRatio||1,Wg));$r.outputColorSpace=Un;$r.shadowMap.enabled=!1;Oo.appendChild($r.domElement);const bi=new tE;bi.background=new ot(525852);bi.fog=new dh(525852,.04);const Fr=new Ln(58,1,.1,100);Fr.position.set(0,4.6,6.4);Fr.lookAt(0,1.5,0);bi.add(new sE(8952319,1313838,.9));const Xg=new cE(16774112,1.5);Xg.position.set(-3,8,5);bi.add(Xg);const $g=new aE(8150271,20,20,2);$g.position.set(3,5,3);bi.add($g);const jg=new Jt(new mh(5.2,5.4,.4,64),new Io({color:1511992,roughness:.6,metalness:.35}));jg.position.y=-.2;bi.add(jg);const Bh=new Jt(new ph(4.6,64),new Io({color:1191972,roughness:.9,metalness:.05}));Bh.rotation.x=-Math.PI/2;Bh.position.y=.01;bi.add(Bh);const nl=new Float32Array(300*3);for(let r=0;r<300;r++)nl[r*3]=(Math.random()-.5)*40,nl[r*3+1]=Math.random()*16-2,nl[r*3+2]=(Math.random()-.5)*40-6;const qg=new Mn;qg.setAttribute("position",new Vn(nl,3));const Yg=new iE(qg,new bm({color:10471679,size:.06,transparent:!0,opacity:.8}));bi.add(Yg);const oa=document.createElement("div");oa.className="hud";Oo.appendChild(oa);const Ul=document.createElement("div");Ul.className="topbar";Ul.innerHTML=`<div class="brand">🎲 digi-gastro · ${sa.title}</div><div class="status" id="status">Bereit</div>`;oa.appendChild(Ul);const kh=document.createElement("div");kh.className="gamehud";oa.appendChild(kh);const qb=Ul.querySelector("#status");function Vs(r){const e=document.createElement("div");e.className="ovl";const t=document.createElement("div");return t.className="ovl-card",r.forEach(n=>t.appendChild(n)),e.appendChild(t),Oo.appendChild(e),e}function Kr(){document.querySelectorAll(".ovl").forEach(r=>r.remove())}function Yb(r,e=2200){const t=document.createElement("div");t.className="toast",t.textContent=r,oa.appendChild(t),window.setTimeout(()=>t.remove(),e)}function Kt(r,e,t){const n=document.createElement(r);return e&&(n.className=e),n.textContent=t,n}let Bt=null,sn=!ir,Br="me",Fn=[],Ll=!1,dl={ids:[],names:[]},_t=null;function th(r){const t=r.slice(0,sa.maxPlayers);for(let n=t.length;n<4;n++)t.push({id:`bot${n}`,name:`Bot ${n}`,color:Lr[n%Lr.length],isBot:!0});return t}const Rr={scene:bi,hud:kh,overlay:Vs,clearOverlay:Kr,toast:Yb,myId:Br,isHost:sn,myName:Do,players:Fn,sendState:r=>{if(!ir||!sn||!Bt)return;const e=r,t=e&&typeof e=="object"?e.dice:void 0,n=t&&typeof t=="object"&&!Array.isArray(t),i=e&&typeof e=="object"&&(e.reveal||e.phase==="done");if(n&&!i){for(const s of Fn){if(s.isBot||s.id===Br)continue;const o={};for(const[a,l]of Object.entries(t))o[a]=a===s.id?l:Array.isArray(l)?l.map(()=>0):[];Bt.send("stateFor",{to:s.id,state:{...e,dice:o}})}return}Bt.send("state",r)},sendIntent:r=>{var e;!ir||sn?(e=_t==null?void 0:_t.handleIntent)==null||e.call(_t,r,Rr.myId):Bt==null||Bt.send("intent",r)},postScore:(r,e)=>{var t;try{(t=window.parent)==null||t.postMessage({type:"game:score",game:r,score:e},"*")}catch{}},rematch:()=>{ir&&!sn||(ir&&sn&&Bt&&Bt.send("start",dl),_t==null||_t.start())}};function nh(r){qb.textContent=r}function pl(){_t==null||_t.dispose(),_t=sa.create(Rr),_t.setPlayers(Fn)}function Kg(){_t&&(Ll=!0,Kr(),nh(sn?"Spiel läuft":"Warte auf Host…"),sn||!ir?_t.start():nh("Warte auf Host…"))}function Jg(){Fn=th([{id:"me",name:Do,color:Lr[0],isBot:!1}]),Br="me",pl(),Kg()}function Kb(){const r=document.createElement("button");r.className="btn",r.textContent="▶ Spiel starten",r.addEventListener("click",()=>{Kr(),Jg()}),Vs([Kt("div","","🎲"),Kt("h1","",`digi-gastro ${sa.title}`),Kt("p","","Gegen Bots oder Freunde"),r])}function Xc(r){if(Ll)return;Kr();const e=[Kt("div","","🎲"),Kt("h1","",sa.title),Kt("p","",sn?"Tisch-Duell":"Warte auf Host…")],t=document.createElement("div");t.className="code",t.appendChild(Kt("div","lbl","Raum-Code")),t.appendChild(Kt("div","val",r)),t.appendChild(Kt("div","lbl","Freunde: Code eingeben")),e.push(t);const n=document.createElement("div");if(n.className="roster",Fn.forEach((i,s)=>{var a;const o=document.createElement("div");o.className="row",o.appendChild(Kt("span","",`● ${i.name}${i.id===Br?" (Du)":""}${i.isBot?" 🤖":""}`)),o.appendChild(Kt("span","",(a=["rot","blau","grün","gelb","lila","cyan"][s])!=null?a:"")),n.appendChild(o)}),e.push(n),sn){const i=document.createElement("button");i.className="btn",i.textContent="🚀 Spiel starten",i.addEventListener("click",()=>{dl={ids:Fn.filter(s=>!s.isBot).map(s=>s.id),names:Fn.filter(s=>!s.isBot).map(s=>s.name)},i.disabled=!0,i.textContent="⏳ Gleich geht’s los…",Bt&&Bt.send("start",dl)}),e.push(i)}Vs(e)}let ys=null;function Jb(r){if(Ll)return;Kr();const e=document.createElement("div");e.className="cd",Vs([Kt("div","","⏳"),Kt("h1","","Gleich geht’s los…"),e]),ys!==null&&window.clearInterval(ys);const t=()=>{const n=Math.ceil((r-Date.now())/1e3);e.textContent=String(Math.max(0,n)),n<=0&&ys!==null&&(window.clearInterval(ys),ys=null)};t(),ys=window.setInterval(t,150)}function Zb(){const r=new LM(ir);($b==="create"?r.create("board",{name:Do,mode:"create"}):np?r.joinById(np,{name:Do,mode:"join"}):r.joinOrCreate("board",{name:Do,mode:"public"})).then(t=>{var n,i;Bt=t,Br=(n=t.sessionId)!=null?n:"me",Rr.myId=Br;try{(i=window.parent)==null||i.postMessage({type:"kart:room",roomId:t.roomId},"*")}catch{}Bt.onMessage("role",s=>{sn=!!s.isHost,Rr.isHost=sn,nh(sn?"Host":"Gast"),Xc(t.roomId)}),Bt.onMessage("roster",s=>{const o=s.ids||[],a=o[0];sn=!!a&&a===Br,Rr.isHost=sn;const l=o.map((c,f)=>({id:c,name:s.names&&s.names[f]||`Tisch ${f+1}`,color:Lr[f%Lr.length],isBot:!1}));Fn=th(l),Rr.players=Fn,!Ll&&(_t?_t.setPlayers(Fn):pl(),Xc(t.roomId))}),Bt.onMessage("start",s=>{dl={ids:s.ids||[],names:s.names||[]};const o=(s.ids||[]).map((a,l)=>({id:a,name:s.names&&s.names[l]||`Tisch ${l+1}`,color:Lr[l%Lr.length],isBot:!1}));Fn=th(o),Rr.players=Fn,_t?_t.setPlayers(Fn):pl(),Kg()}),Bt.onMessage("state",s=>{sn||_t==null||_t.applyState(s)}),Bt.onStateChange(s=>{const o=s;(o==null?void 0:o.phase)==="countdown"&&o.countdownEndsAt&&Jb(o.countdownEndsAt)}),Bt.onMessage("lobby:closed",s=>{var o;Kr(),Vs([Kt("h1","","Spiel läuft bereits"),Kt("p","",(o=s==null?void 0:s.reason)!=null?o:"Bitte später erneut versuchen.")])}),Bt.onMessage("intent",s=>{var l;if(!sn)return;const{from:o,...a}=s;(l=_t==null?void 0:_t.handleIntent)==null||l.call(_t,a,o)}),Bt.send("hello"),Xc(t.roomId)}).catch(t=>{var s;const n=t instanceof Error?t.message:String(t);try{(s=window.parent)==null||s.postMessage({type:"kart:room-error",message:n},"*")}catch{}const i=document.createElement("button");i.className="btn ghost",i.textContent="Zurück",i.addEventListener("click",()=>window.location.reload()),Vs([Kt("h1","","Verbindung fehlgeschlagen"),Kt("p","",n),i])})}let ip=performance.now();function Zg(){const r=performance.now(),e=Math.min(.1,(r-ip)/1e3);ip=r,Yg.rotation.y+=e*.02,_t==null||_t.update(e),$r.render(bi,Fr),requestAnimationFrame(Zg)}function Qg(){const r=Math.max(1,Oo.clientWidth||window.innerWidth),e=Math.max(1,Oo.clientHeight||window.innerHeight);$r.setPixelRatio(Math.min(window.devicePixelRatio||1,Wg)),$r.setSize(r,e,!1),Fr.aspect=r/e,Fr.fov=Fr.aspect<1?64:58,Fr.updateProjectionMatrix()}window.addEventListener("resize",Qg);Qg();pl();ir?Zb():Zs.get("auto")==="1"?(Kr(),Jg()):Kb();Zg();
