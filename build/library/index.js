/*! v1.0.2 Build Fri, 13 Apr 2018 16:38:47 GMT */
!function(){var e={},t=function(){var t,n,r,i=Array.prototype.slice.call(arguments,0);"string"==typeof i[0]?(r=i[0],t=i[1],n=i[2]):Array.isArray(i[0])&&(t=i[0],n=i[1]);var o=t.reduce(function(e,t){return e.addDependency(t)},tau.mashups);return o=o.addDependency(r+"/config"),o=o.addMashup(function(){var i=Array.prototype.slice.call(arguments,0);if(t.length>0&&1===i.length)throw new Error("Can't properly load dependencies for mashup \""+r+'", mashup is stopped.');return e.variables=i[i.length-1],i.length-t.length===2?e.config=i[i.length-2]:e.config={},Object.freeze&&(Object.freeze(e.variables),Object.freeze(e.config),Object.freeze(e)),n.apply(null,i)})};t("EmbeddedPages",["Underscore","jQuery","tau/configurator","tau/models/page.entity/entity.context.factory","tau/models/board.customize.units/const.entity.types.names","tau/models/board.customize.units/const.card.sizes","tau/models/board.customize.units/board.customize.units.interaction"],function(t,n,r,i,o,a,u){return function(t){function n(e){if(r[e])return r[e].exports;var i=r[e]={exports:{},id:e,loaded:!1};return t[e].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}var r={};return n.m=t,n.c=r,n.p="",n.p=e.variables?e.variables.mashupPath:n.p,n(0)}([function(e,t,n){n(1),n(18),e.exports=n(19)},function(t,n,r){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function o(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}var a=r(2),u=r(3),s=i(u),c=r(4),f=i(c),l=r(5),d=i(l),p=r(6),m=r(14),v=i(m),h=f.default.getGlobalBus(),y=function(e){var t=e.url;return'<iframe class="'+v.default.frame+'" src="'+t+'" frameborder="0"></iframe>'},g=function(e){var t=e.name;return'<span class="'+v.default.empty+"\">Nothing to display in the Tab: the value of the '"+t+"' Custom Field is empty.</span>"},b=function e(t){if("tabs"===t.type)return t;if(t.children)for(var n=0;n<t.children.length;n++){var r=e(t.children[n]);if(r)return r}return null},x=function(e,t,n){var r=new u.Deferred,i=new u.Deferred;return e(i.resolve,n),i.then(function(e){if(e){var r=e.label,i=e.render,o=e.onDestroy,u=void 0===o?a.noop:o,s=b(t)||{tabs:[]},c="tab"+s.tabs.length,f="header_"+c,l="content_"+c;s.tabs.push({label:c,header:[{type:"label",name:f,text:r}],items:[{name:l,type:"container"}]});var d=(0,p.addBusListener)(l,"afterRender",function(e){"string"==typeof i?e.data.element.html(i):i(e.data.element.first(),n)}),m=(0,p.addBusListener)(l,"destroy",function(e){d.remove(),m.remove(),u(e)})}}).then(r.resolve),r.promise()},C=function(e){return e.toLowerCase()},L=function(e,t){var n=C(e);return(0,a.find)(t,function(e){return C(e.name)===n})},w=function(e,t,n){return e.getDef(t.entityType.name,{id:t.id,fields:["customFields"]}).then(function(e){return L(n,e.customFields)})},j=function(e,t,n,r){var i={};return e.on({eventName:"afterSave",type:t.entityType.name,listener:i,filter:{id:t.id},hasChanges:["customFields"]},function(e){var t=L(n,e.data.changes.customFields);t&&r(t.value)}),i},N=function(e,t){switch(C(e.type)){case"url":return t&&t.url?t.url:null;case"templatedurl":return t?String(e.value).replace(/\{0\}/,t):null;default:return""}},A=function(e,t){return(0,a.isFunction)(e)?e(t):s.default.tmpl(e,t)},B=function(e){var t=80,n=e.closest(".tau-page-entity").find(".additional-info");e.css({height:n.height()-t})},O=function(e,t,n,r){var i=r.customField,o=r.value,a=r.entity,u=N(i,o),c={url:u,entityId:a.id,name:i.name},f=(0,s.default)(A(u?t:g,c));if((0,s.default)(e).html(f),n){var l=3e3;B(f),setTimeout(function(){return B(f)},l)}},R=function(e,t,n,r,i){var o=!n.frameTemplate||n.adjustFrameSize,a=n.frameTemplate||y;(0,u.when)(w(e,t,n.customFieldName)).then(function(e){var n=e.value;return O(i,a,o,{customField:r,value:n,entity:t})});var s=j(e,t,n.customFieldName,function(e){return O(i,a,o,{customField:r,value:e,entity:t})});return function(){return e.unbind(s)}},F=function(e){return d.default.create(e,f.default)},U=function(e,t){return(0,u.when)(F(e)).then(function(e){return(0,a.find)(e.getCustomFields(),function(e){return C(e.name)===C(t.customFieldName)&&C(e.entityKind)===C(t.entityTypeName)})})},z=function(e){return(0,u.when)(F(e)).then(function(e){return e.getProcess()})},S=function(e){var t=C(e.type);return"url"===t||"templatedurl"===t},T=function(e,t,n){var r=n.entity;return C(r.entityType.name)!==C(e.entityTypeName)?t():(0,u.when)(U(r,e),e.processName?z(r):null).then(function(i,o){if(!i||!S(i))return t();if(o&&C(o.name)!==C(e.processName))return t();try{var a=void 0;return t({label:e.customFieldName,render:function(t){var o=n.configurator.getStore();a=R(o,r,e,i,t)},onDestroy:function(){return a()}})}catch(e){throw t(),e}})},D=function(e){h.once("contextRetrieved",function(){h.on("configReadyForIntegration",function(t){var n=t.data,r=e.map(function(e){var t=function(t,n){return T(e,t,n)};return x(t,{children:n.children},n.context)});r.unshift(n.integrationReadyPromise),n.integrationReadyPromise=u.when.apply(void 0,o(r)).then(function(e){return e})})})},E=function(e){D(e.tabs)};E(e.config)},function(e,n){e.exports=t},function(e,t){e.exports=n},function(e,t){e.exports=r},function(e,t){e.exports=i},function(e,t,n){"use strict";var r=n(7),i=n(8),o=n(9),a=n(13);e.exports={addBusListener:i.addBusListener,addBusListenerOnce:i.addBusListenerOnce,getAppConfigurator:r.getAppConfigurator,configurator:r,events:i,customUnits:o,debug:a}},function(e,t,n){"use strict";var r=n(4),i=n(3),o=new i.Deferred;r.getGlobalBus().on("configurator.ready",function(e,t){t._id&&!t._id.match(/global/)&&o.resolve(t)});var a=function(){return o.promise()};e.exports={getAppConfigurator:a}},function(e,t,n){"use strict";var r=n(4),i=r.getBusRegistry(),o=function(e){return function(){e.apply(null,Array.prototype.slice.call(arguments).slice(1))}},a=function(e,t,n,r){var a=o(function(i){var o=i.bus;o.name===e&&o[r?"once":"on"](t,n)}),u=i.addEventListener("create",a);return i.addEventListener("destroy",o(function(r){var i=r.bus;i.name===e&&i.removeListener(t,n,u)})),{remove:function(){i.removeListener("create",a,u),i.getByName(e).then(function(e){e.removeListener(t,n,u)})}}},u=function(e,t,n){return a(e,t,n,!0)};e.exports={addBusListener:a,addBusListenerOnce:u}},function(e,t,n){"use strict";var r=n(10),i=n(11),o=n(12).openUnitEditor,a=n(7),u=function(e){return Object.keys(e||{}).reduce(function(t,n){return t[n]=e[n],t},{})},s=function(e){var t=u(e);return t.types=t.types||[r.ANY_TYPE],t.sizes=t.sizes||Object.keys(i).map(function(e){return i[e]}),a.getAppConfigurator().then(function(n){var r=n.getUnitsRegistry();if(!t.id)throw new Error('Field "id" is required for custom unit config');if(r.units[t.id])throw new Error('Custom unit with id "'+t.id+'" has been already registered');t.name=t.name||t.id,t.model=t.model||t.sampleData?t.model:{dummy:1},"string"!=typeof t.model&&"object"==typeof t.model&&(t.model=Object.keys(t.model).reduce(function(e,n){return e.concat(n+":"+t.model[n])},[]).join(", ")),t.sampleData=t.sampleData||{},t.template="object"==typeof e.template?u(t.template):t.template||{markup:['<div class="tau-board-unit__value">'+t.id+"</div>"]},"string"==typeof t.template&&(t.template={markup:[t.template]}),"string"==typeof t.template.markup&&(t.template.markup=[t.template.markup]),t.outerClassName&&(t.classId=t.outerClassName),t.priority&&(t.priority=Number(t.priority)),t.isEditable&&(t.interactionConfig={isEditable:t.isEditable},t.editorHandler?t.interactionConfig.handler=t.editorHandler:t.interactionConfig.handler=function(e,n){var r=e.cardDataForUnit,i=t.editorComponentName instanceof Function?t.editorComponentName(r):t.editorComponentName,a=o(i,{});if(t.editorData){var u={};Object.keys(t.editorData).forEach(function(e){var n=t.editorData[e];u[e]=n instanceof Function?n(r):r[n]}),e.cardDataForUnit=u}return a(e,n)}),r.units[t.id]=r.register([t])[t.id]})};e.exports={types:r,sizes:i,add:s}},function(e,t){e.exports=o},function(e,t){e.exports=a},function(e,t){e.exports=u},function(e,t,n){"use strict";var r=n(4),i=r.getBusRegistry(),o=function(){i.on("create",function(e,t){var n=t.bus;n.on("afterRender",function(e,t){t.element.attr("data-component-name",n.name)})})},a=function(e,t){var n=e;e?"string"==typeof e&&(n=function(t){return(t.name||t.id)===e}):n=function(){return!0},t||(t=function(e,t,n){console.log("LOG BUS",e,t,n)});var i=r.getGlobalBus(),o=i.fire.bind(i);i.fire=function(e,r,i){return i&&n(i,e,r)&&t(i.name||i.id,e,r),o(e,r,i)}};e.exports={showComponentsNames:o,logBus:a}},function(e,t,n){var r=n(15);"string"==typeof r&&(r=[[e.id,r,""]]);n(17)(r,{});r.locals&&(e.exports=r.locals)},function(e,t,n){t=e.exports=n(16)(),t.push([e.id,".XQLfJ1fOSeM_6mWJdOjSz{width:100%;height:700px;overflow:scroll;border:1px solid #ccc;min-height:70vh}._2hqpnQvyimzihTcycgAvjw{color:#bbb;font-size:11px;display:block}",""]),t.locals={frame:"XQLfJ1fOSeM_6mWJdOjSz",empty:"_2hqpnQvyimzihTcycgAvjw"}},function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},i=0;i<this.length;i++){var o=this[i][0];"number"==typeof o&&(r[o]=!0)}for(i=0;i<t.length;i++){var a=t[i];"number"==typeof a[0]&&r[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(e,t,n){function r(e,t){for(var n=0;n<e.length;n++){var r=e[n],i=p[r.id];if(i){i.refs++;for(var o=0;o<i.parts.length;o++)i.parts[o](r.parts[o]);for(;o<r.parts.length;o++)i.parts.push(c(r.parts[o],t))}else{for(var a=[],o=0;o<r.parts.length;o++)a.push(c(r.parts[o],t));p[r.id]={id:r.id,refs:1,parts:a}}}}function i(e){for(var t=[],n={},r=0;r<e.length;r++){var i=e[r],o=i[0],a=i[1],u=i[2],s=i[3],c={css:a,media:u,sourceMap:s};n[o]?n[o].parts.push(c):t.push(n[o]={id:o,parts:[c]})}return t}function o(e,t){var n=h(),r=b[b.length-1];if("top"===e.insertAt)r?r.nextSibling?n.insertBefore(t,r.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),b.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function a(e){e.parentNode.removeChild(e);var t=b.indexOf(e);t>=0&&b.splice(t,1)}function u(e){var t=document.createElement("style");return t.type="text/css",o(e,t),t}function s(e){var t=document.createElement("link");return t.rel="stylesheet",o(e,t),t}function c(e,t){var n,r,i;if(t.singleton){var o=g++;n=y||(y=u(t)),r=f.bind(null,n,o,!1),i=f.bind(null,n,o,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=s(t),r=d.bind(null,n),i=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=u(t),r=l.bind(null,n),i=function(){a(n)});return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else i()}}function f(e,t,n,r){var i=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=x(t,i);else{var o=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(o,a[t]):e.appendChild(o)}}function l(e,t){var n=t.css,r=t.media;if(r&&e.setAttribute("media",r),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function d(e,t){var n=t.css,r=t.sourceMap;r&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var i=new Blob([n],{type:"text/css"}),o=e.href;e.href=URL.createObjectURL(i),o&&URL.revokeObjectURL(o)}var p={},m=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},v=m(function(){return/msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase())}),h=m(function(){return document.head||document.getElementsByTagName("head")[0]}),y=null,g=0,b=[];e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=v()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var n=i(e);return r(n,t),function(e){for(var o=[],a=0;a<n.length;a++){var u=n[a],s=p[u.id];s.refs--,o.push(s)}if(e){var c=i(e);r(c,t)}for(var a=0;a<o.length;a++){var s=o[a];if(0===s.refs){for(var f=0;f<s.parts.length;f++)s.parts[f]();delete p[s.id]}}}};var x=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},function(e,t,n){e.exports=n.p+"./mashup.config.js"},function(e,t){}])})}();