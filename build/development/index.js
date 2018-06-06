/*! v1.0.1 Build Tue, 05 Jun 2018 13:58:14 GMT */
(function() {var mashup = {}; var define = function () {var args = Array.prototype.slice.call(arguments, 0);var deps;var func;var name;if (typeof args[0] === 'string') {name = args[0];deps = args[1];func = args[2];} else if (Array.isArray(args[0])) {deps = args[0];func = args[1];}var header = deps.reduce(function(res, v) {return res.addDependency(v);}, tau.mashups);header = header.addDependency(name + '/config');header = header.addMashup(function() {var modules = Array.prototype.slice.call(arguments, 0);if (deps.length > 0 && modules.length === 1) {throw new Error('Can\'t properly load dependencies for mashup "' + name+ '", mashup is stopped.');}mashup.variables = modules[modules.length - 1];if (modules.length - deps.length === 2) {mashup.config = modules[modules.length - 2];} else {mashup.config = {};}if (Object.freeze) {Object.freeze(mashup.variables);Object.freeze(mashup.config);Object.freeze(mashup);}return func.apply(null, modules);});return header;};
define("EmbeddedPages", ["Underscore","jQuery","tau/configurator","tau/models/page.entity/entity.context.factory","tau/models/board.customize.units/const.entity.types.names","tau/models/board.customize.units/const.card.sizes","tau/models/board.customize.units/board.customize.units.interaction"], function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	__webpack_require__.p = mashup.variables ? mashup.variables.mashupPath : __webpack_require__.p;

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*******************!*\
  !*** multi index ***!
  \*******************/
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./index.js */1);
	__webpack_require__(/*! !!file?name=./mashup.config.js!./config.js */18);
	module.exports = __webpack_require__(/*! !!targetprocess-mashup-webpack-plugin/manifest-loader!./manifest.json */19);


/***/ }),
/* 1 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _underscore = __webpack_require__(/*! underscore */ 2);

	var _jquery = __webpack_require__(/*! jquery */ 3);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _configurator = __webpack_require__(/*! tau/configurator */ 4);

	var _configurator2 = _interopRequireDefault(_configurator);

	var _entityContext = __webpack_require__(/*! tau/models/page.entity/entity.context.factory */ 5);

	var _entityContext2 = _interopRequireDefault(_entityContext);

	var _targetprocessMashupHelper = __webpack_require__(/*! targetprocess-mashup-helper */ 6);

	var _index = __webpack_require__(/*! ./index.css */ 14);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/* globals mashup */

	var globalBus = _configurator2['default'].getGlobalBus();

	var defaultTemplate = function defaultTemplate(_ref) {
	    var url = _ref.url;
	    return '<iframe class="' + _index2['default'].frame + '" src="' + url + '" frameborder="0"></iframe>';
	};
	var emptyTemplate = function emptyTemplate(_ref2) {
	    var name = _ref2.name;
	    return '<span class="' + _index2['default'].empty + '">Nothing to display in the Tab: the value of the \'' + name + '\' Custom Field is empty.</span>';
	};

	var getTabsConfig = function getTabsConfig(config) {
	    if (config.type === 'tabs') {
	        return config;
	    }
	    if (config.children) {
	        for (var i = 0; i < config.children.length; i++) {
	            var childTabs = getTabsConfig(config.children[i]);
	            if (childTabs) {
	                return childTabs;
	            }
	        }
	    }
	    return null;
	};

	var configReadyForIntegration = function configReadyForIntegration(tabConfig, config, context) {
	    var tabDef = prepareTabConfig(tabConfig, context);

	    return tabDef.then(function (tabConf) {
	        if (!tabConf) {
	            return;
	        }

	        var labelText = tabConf.label,
	            render = tabConf.render,
	            _tabConf$onDestroy = tabConf.onDestroy,
	            onDestroy = _tabConf$onDestroy === undefined ? _underscore.noop : _tabConf$onDestroy;

	        var tabsConfig = getTabsConfig(config) || { tabs: [] };
	        var tabId = 'tab' + tabsConfig.tabs.length;
	        var headerBusId = 'header_' + tabId;
	        var contentBusId = 'content_' + tabId;

	        tabsConfig.tabs.push({
	            label: tabId,
	            header: [{
	                type: 'label',
	                name: headerBusId,
	                text: labelText
	            }],
	            items: [{
	                name: contentBusId,
	                type: 'container'
	            }]
	        });

	        var renderListener = (0, _targetprocessMashupHelper.addBusListener)(contentBusId, 'afterRender', function (e) {
	            if (typeof render === 'string') {
	                e.data.element.html(render);
	            } else {
	                render(e.data.element.first(), context);
	            }
	        });

	        var destroyListener = (0, _targetprocessMashupHelper.addBusListener)(contentBusId, 'destroy', function (e) {
	            renderListener.remove();
	            destroyListener.remove();
	            onDestroy(e);
	        });
	    }).promise();
	};

	var lc = function lc(str) {
	    return str.toLowerCase();
	};

	var findCustomFieldValue = function findCustomFieldValue(customFieldName, customFieldValues) {
	    var name = lc(customFieldName);
	    return (0, _underscore.find)(customFieldValues, function (cf) {
	        return lc(cf.name) === name;
	    });
	};

	var getCustomFieldValue = function getCustomFieldValue(store, entity, customFieldName) {
	    return store.getDef(entity.entityType.name, {
	        id: entity.id,
	        fields: ['customFields']
	    }).then(function (res) {
	        return findCustomFieldValue(customFieldName, res.customFields);
	    });
	};

	var onChange = function onChange(store, entity, customFieldName, listenerFunction) {
	    var listener = {};

	    store.on({
	        eventName: 'afterSave',
	        type: entity.entityType.name,
	        listener: listener,
	        filter: {
	            id: entity.id
	        },
	        hasChanges: ['customFields']
	    }, function (res) {
	        var customFieldValue = findCustomFieldValue(customFieldName, res.data.changes.customFields);
	        if (customFieldValue) {
	            listenerFunction(customFieldValue.value);
	        }
	    });

	    return listener;
	};

	var getUrl = function getUrl(customField, value) {
	    switch (lc(customField.type)) {
	        case 'url':
	            return value && value.url ? value.url : null;
	        case 'templatedurl':
	            return value ? String(customField.value).replace(/\{0\}/, value) : null;
	        default:
	            return '';
	    }
	};

	var renderTemplate = function renderTemplate(template, templateData) {
	    return (0, _underscore.isFunction)(template) ? template(templateData) : _jquery2['default'].tmpl(template, templateData);
	};

	var resizeDefaultFrame = function resizeDefaultFrame($frame) {
	    var padding = 80;
	    var $infoPanel = $frame.closest('.tau-page-entity').find('.additional-info');

	    $frame.css({
	        height: $infoPanel.height() - padding
	    });
	};

	var innerRenderTab = function innerRenderTab(el, template, adjustFrameSize, _ref3, cancellationToken) {
	    var customField = _ref3.customField,
	        value = _ref3.value,
	        entity = _ref3.entity;

	    if (cancellationToken.isCancelled) {
	        return;
	    }

	    var url = getUrl(customField, value);

	    var templateData = {
	        url: url,
	        entityId: entity.id,
	        name: customField.name
	    };

	    var $html = (0, _jquery2['default'])(renderTemplate(url ? template : emptyTemplate, templateData));

	    (0, _jquery2['default'])(el).html($html);

	    if (adjustFrameSize) {
	        var timeout = 3000;
	        resizeDefaultFrame($html);
	        setTimeout(function () {
	            return resizeDefaultFrame($html);
	        }, timeout);
	    }
	};

	var renderTab = function renderTab(store, entity, tabConfig, customField, dom, cancellationToken) {
	    var adjustFrameSize = !tabConfig.frameTemplate || tabConfig.adjustFrameSize;
	    var template = tabConfig.frameTemplate || defaultTemplate;

	    (0, _jquery.when)(getCustomFieldValue(store, entity, tabConfig.customFieldName)).then(function (_ref4) {
	        var value = _ref4.value;
	        return innerRenderTab(dom, template, adjustFrameSize, { customField: customField, value: value, entity: entity }, cancellationToken);
	    });

	    var storeListener = onChange(store, entity, tabConfig.customFieldName, function (changedValue) {
	        return innerRenderTab(dom, template, adjustFrameSize, { customField: customField, value: changedValue, entity: entity }, cancellationToken);
	    });

	    return function () {
	        return store.unbind(storeListener);
	    };
	};

	var loadEntityContext = function loadEntityContext(entity) {
	    return _entityContext2['default'].create(entity, _configurator2['default']);
	};

	var loadCustomField = function loadCustomField(entity, tabConfig) {
	    return (0, _jquery.when)(loadEntityContext(entity)).then(function (entityContext) {
	        return (0, _underscore.find)(entityContext.getCustomFields(), function (cf) {
	            return lc(cf.name) === lc(tabConfig.customFieldName) && lc(cf.entityKind) === lc(tabConfig.entityTypeName);
	        });
	    });
	};

	var loadProcess = function loadProcess(entity) {
	    return (0, _jquery.when)(loadEntityContext(entity)).then(function (entityContext) {
	        return entityContext.getProcess();
	    });
	};

	var inTypes = function inTypes(customField) {
	    var type = lc(customField.type);
	    return type === 'url' || type === 'templatedurl';
	};

	var resolveDeferred = function resolveDeferred(value) {
	    var deferred = _jquery2['default'].Deferred();
	    deferred.resolve(value);
	    return deferred;
	};

	var createCancellationToken = function createCancellationToken() {
	    var cancelled = false;

	    return {
	        cancel: function cancel() {
	            cancelled = true;
	        },


	        get isCancelled() {
	            return cancelled;
	        }
	    };
	};

	var cancellationTokens = [];

	var prepareTabConfig = function prepareTabConfig(tabConfig, context) {
	    var entity = context.entity;


	    if (lc(entity.entityType.name) !== lc(tabConfig.entityTypeName)) {
	        return resolveDeferred();
	    }

	    var cancellationToken = createCancellationToken();

	    cancellationTokens.push(cancellationToken);

	    return (0, _jquery.when)(loadCustomField(entity, tabConfig), tabConfig.processName ? loadProcess(entity) : null).then(function (customField, process) {
	        if (cancellationToken.isCancelled) {
	            return;
	        }

	        if (!customField || !inTypes(customField)) {
	            return;
	        }

	        if (process && lc(process.name) !== lc(tabConfig.processName)) {
	            return;
	        }

	        var unsubscribe = void 0;

	        return {
	            label: tabConfig.customFieldName,
	            render: function render(dom) {
	                var store = context.configurator.getStore();
	                unsubscribe = renderTab(store, entity, tabConfig, customField, dom, cancellationToken);
	            },
	            onDestroy: function onDestroy() {
	                return unsubscribe();
	            }
	        };
	    });
	};

	var addTabs = function addTabs(tabs) {
	    // Subscribe to configReadyForIntegration as late as possible to be in subscription chain after mashupsForViews
	    globalBus.once('contextRetrieved', function () {
	        globalBus.on('configReadyForIntegration', function (e) {
	            cancellationTokens.forEach(function (cancellationToken) {
	                return cancellationToken.cancel();
	            });
	            cancellationTokens = [];

	            var data = e.data;
	            var resultConfigPromises = tabs.map(function (tabConfig) {
	                return configReadyForIntegration(tabConfig, {
	                    children: data.children
	                }, data.context);
	            });

	            resultConfigPromises.unshift(data.integrationReadyPromise);
	            data.integrationReadyPromise = _jquery.when.apply(null, resultConfigPromises).then(function (integration) {
	                return integration;
	            });
	        });
	    });
	};

	var init = function init(mashupConfig) {
	    addTabs(mashupConfig.tabs);
	};

	init(mashup.config);

/***/ }),
/* 2 */
/*!*****************************!*\
  !*** external "Underscore" ***!
  \*****************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/*!*************************!*\
  !*** external "jQuery" ***!
  \*************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/*!***********************************!*\
  !*** external "tau/configurator" ***!
  \***********************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/*!****************************************************************!*\
  !*** external "tau/models/page.entity/entity.context.factory" ***!
  \****************************************************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/*!*************************************************!*\
  !*** ../~/targetprocess-mashup-helper/index.js ***!
  \*************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var configurator = __webpack_require__(/*! ./lib/configurator */ 7);
	var events = __webpack_require__(/*! ./lib/events */ 8);
	var customUnits = __webpack_require__(/*! ./lib/customUnits */ 9);
	var debug = __webpack_require__(/*! ./lib/debug */ 13);

	module.exports = {
	    addBusListener: events.addBusListener,
	    addBusListenerOnce: events.addBusListenerOnce,
	    getAppConfigurator: configurator.getAppConfigurator,

	    configurator: configurator,
	    events: events,
	    customUnits: customUnits,

	    debug: debug
	};


/***/ }),
/* 7 */
/*!************************************************************!*\
  !*** ../~/targetprocess-mashup-helper/lib/configurator.js ***!
  \************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var configurator = __webpack_require__(/*! tau/configurator */ 4);
	var $ = __webpack_require__(/*! jQuery */ 3);

	var appConfiguratorDef = new $.Deferred();

	configurator.getGlobalBus().on('configurator.ready', function(e, res) {

	    /* eslint-disable no-underscore-dangle*/
	    if (res._id && !res._id.match(/global/)) {

	        appConfiguratorDef.resolve(res);

	    }
	    /* eslint-enable no-underscore-dangle*/

	});

	var getAppConfigurator = function getAppConfigurator() {

	    return appConfiguratorDef.promise();

	};

	module.exports = {
	    getAppConfigurator: getAppConfigurator
	};


/***/ }),
/* 8 */
/*!******************************************************!*\
  !*** ../~/targetprocess-mashup-helper/lib/events.js ***!
  \******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var configurator = __webpack_require__(/*! tau/configurator */ 4);

	var reg = configurator.getBusRegistry();

	var makeCb = function(cb) {

	    return function() {

	        cb.apply(null, Array.prototype.slice.call(arguments).slice(1));

	    };

	};

	var addBusListener = function(busName, eventName, listener, once) {

	    var globalListener = makeCb(function(data) {

	        var bus = data.bus;

	        if (bus.name === busName) {

	            bus[once ? 'once' : 'on'](eventName, listener);

	        }

	    });

	    var scope = reg.addEventListener('create', globalListener);

	    reg.addEventListener('destroy', makeCb(function(data) {

	        var bus = data.bus;

	        if (bus.name === busName) {

	            bus.removeListener(eventName, listener, scope);

	        }

	    }));

	    return {
	        remove: function() {

	            reg.removeListener('create', globalListener, scope);
	            reg.getByName(busName).then(function(bus) {

	                bus.removeListener(eventName, listener, scope);

	            });

	        }
	    };

	};

	var addBusListenerOnce = function(busName, eventName, listener) {

	    return addBusListener(busName, eventName, listener, true);

	};

	module.exports = {
	    addBusListener: addBusListener,
	    addBusListenerOnce: addBusListenerOnce
	};


/***/ }),
/* 9 */
/*!***********************************************************!*\
  !*** ../~/targetprocess-mashup-helper/lib/customUnits.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var types = __webpack_require__(/*! tau/models/board.customize.units/const.entity.types.names */ 10);
	var sizes = __webpack_require__(/*! tau/models/board.customize.units/const.card.sizes */ 11);
	var openUnitEditor = __webpack_require__(/*! tau/models/board.customize.units/board.customize.units.interaction */ 12).openUnitEditor;

	var configuratorHelper = __webpack_require__(/*! ./configurator */ 7);

	var shallowCopy = function(source) {

	    return Object.keys(source || {}).reduce(function(res, key) {

	        res[key] = source[key];

	        return res;

	    }, {});

	};

	var add = function(sourceUnit) {

	    var unit = shallowCopy(sourceUnit);

	    unit.types = unit.types || [
	        types.ANY_TYPE
	    ];
	    unit.sizes = unit.sizes || Object.keys(sizes).map(function(k) {

	        return sizes[k];

	    });

	    return configuratorHelper
	        .getAppConfigurator()
	        .then(function(configurator) {

	            var registry = configurator.getUnitsRegistry();

	            if (!unit.id) {

	                throw new Error('Field "id" is required for custom unit config');

	            }

	            if (registry.units[unit.id]) {

	                throw new Error('Custom unit with id "' + unit.id + '" has been already registered');

	            }

	            unit.name = unit.name || unit.id;

	            unit.model = (unit.model || unit.sampleData) ? unit.model : {dummy: 1};

	            if (typeof unit.model !== 'string' && typeof unit.model === 'object') {

	                unit.model = Object.keys(unit.model).reduce(function(res, v) {

	                    return res.concat(v + ':' + unit.model[v]);

	                }, []).join(', ');

	            }

	            unit.sampleData = unit.sampleData || {};

	            unit.template = (typeof sourceUnit.template === 'object') ? shallowCopy(unit.template) : (unit.template || {
	                markup: ['<div class="tau-board-unit__value">' + unit.id + '</div>']
	            });

	            if (typeof unit.template === 'string') {

	                unit.template = {
	                    markup: [unit.template]
	                };

	            }

	            if (typeof unit.template.markup === 'string') {

	                unit.template.markup = [unit.template.markup];

	            }

	            if (unit.outerClassName) {

	                unit.classId = unit.outerClassName;

	            }

	            if (unit.priority) {

	                unit.priority = Number(unit.priority);

	            }

	            if (unit.isEditable) {

	                unit.interactionConfig = {
	                    isEditable: unit.isEditable
	                };

	                if (unit.editorHandler) {

	                    unit.interactionConfig.handler = unit.editorHandler;

	                } else {

	                    unit.interactionConfig.handler = function(cardData, environment) {

	                        var data = cardData.cardDataForUnit;
	                        var editorComponentName = unit.editorComponentName instanceof Function ?
	                            unit.editorComponentName(data) :
	                            unit.editorComponentName;
	                        var editor = openUnitEditor(editorComponentName, {});

	                        if (unit.editorData) {

	                            var cardDataForUnit = {};

	                            Object.keys(unit.editorData).forEach(function(k) {

	                                var v = unit.editorData[k];

	                                cardDataForUnit[k] = v instanceof Function ? v(data) : data[v];

	                            });

	                            cardData.cardDataForUnit = cardDataForUnit;

	                        }

	                        return editor(cardData, environment);

	                   };

	                }

	            }

	            registry.units[unit.id] = registry.register([unit])[unit.id];

	        });

	};

	module.exports = {
	    types: types,
	    sizes: sizes,
	    add: add
	};


/***/ }),
/* 10 */
/*!****************************************************************************!*\
  !*** external "tau/models/board.customize.units/const.entity.types.names" ***!
  \****************************************************************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ }),
/* 11 */
/*!********************************************************************!*\
  !*** external "tau/models/board.customize.units/const.card.sizes" ***!
  \********************************************************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ }),
/* 12 */
/*!*************************************************************************************!*\
  !*** external "tau/models/board.customize.units/board.customize.units.interaction" ***!
  \*************************************************************************************/
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }),
/* 13 */
/*!*****************************************************!*\
  !*** ../~/targetprocess-mashup-helper/lib/debug.js ***!
  \*****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var configurator = __webpack_require__(/*! tau/configurator */ 4);

	var reg = configurator.getBusRegistry();

	var showComponentsNames = function() {

	    reg.on('create', function(e, data) {

	        var bus = data.bus;

	        bus.on('afterRender', function(renderEvent, renderData) {

	            renderData.element.attr('data-component-name', bus.name);

	        });

	    });

	};

	var logBus = function(predicate, logger) {

	    var predicateFunc = predicate;

	    if (!predicate) {

	        predicateFunc = function() {

	            return true;

	        };

	    } else if (typeof predicate === 'string') {

	        predicateFunc = function(bus) {

	            return (bus.name || bus.id) === predicate;

	        };

	    }

	    if (!logger) {

	        logger = function(busName, eventName, data) {

	            console.log('LOG BUS', busName, eventName, data);

	        };

	    }

	    var globalBus = configurator.getGlobalBus();
	    var fire = globalBus.fire.bind(globalBus);

	    globalBus.fire = function(eventName, data, bus) {

	        if (bus && predicateFunc(bus, eventName, data)) {

	            logger(bus.name || bus.id, eventName, data);

	        }

	        return fire(eventName, data, bus);

	    };

	};

	module.exports = {
	    showComponentsNames: showComponentsNames,
	    logBus: logBus
	};


/***/ }),
/* 14 */
/*!*******************!*\
  !*** ./index.css ***!
  \*******************/
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(/*! !../~/css-loader?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!../~/postcss-loader!./index.css */ 15);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ../~/style-loader/addStyles.js */ 17)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!../node_modules/postcss-loader/index.js!./index.css", function() {
				var newContent = require("!!../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!../node_modules/postcss-loader/index.js!./index.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 15 */
/*!*********************************************************************************************************************************!*\
  !*** ../~/css-loader?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]!../~/postcss-loader!./index.css ***!
  \*********************************************************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ../~/css-loader/lib/css-base.js */ 16)();
	// imports


	// module
	exports.push([module.id, ".index---frame---XQLfJ {\r\n    width: 100%;\r\n    height: 700px;\r\n    overflow: scroll;\r\n    border: 1px solid #CCCCCC;\r\n    min-height: 70vh;\r\n}\r\n\r\n.index---empty---2hqpn {\r\n    color: #BBBBBB;\r\n    font-size: 11px;\r\n    display: block;\r\n}\r\n", ""]);

	// exports
	exports.locals = {
		"frame": "index---frame---XQLfJ",
		"empty": "index---empty---2hqpn"
	};

/***/ }),
/* 16 */
/*!***************************************!*\
  !*** ../~/css-loader/lib/css-base.js ***!
  \***************************************/
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ }),
/* 17 */
/*!**************************************!*\
  !*** ../~/style-loader/addStyles.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 18 */
/*!************************************************************!*\
  !*** ../~/file-loader?name=./mashup.config.js!./config.js ***!
  \************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "./mashup.config.js";

/***/ }),
/* 19 */
/*!********************************************************************************!*\
  !*** ../~/targetprocess-mashup-webpack-plugin/manifest-loader!./manifest.json ***!
  \********************************************************************************/
/***/ (function(module, exports) {

	// manifest

/***/ })
/******/ ])});})();;