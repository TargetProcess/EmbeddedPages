/* globals mashup */

import {find, isFunction, noop} from 'underscore';
import $, {when, Deferred} from 'jquery';
import configurator from 'tau/configurator';
import contextFactory from 'tau/models/page.entity/entity.context.factory';
import {addBusListener} from 'targetprocess-mashup-helper';
import S from './index.css';

const globalBus = configurator.getGlobalBus();

const defaultTemplate = ({url}) =>
    `<iframe class="${S.frame}" src="${url}" frameborder="0"></iframe>`;
const emptyTemplate = ({name}) =>
    `<span class="${S.empty}">Nothing to display in the Tab: the value of the '${name}' Custom Field is empty.</span>`;

const getTabsConfig = (config) => {
    if (config.type === 'tabs') {
        return config;
    }
    if (config.children) {
        for (var i = 0; i < config.children.length; i++) {
            const childTabs = getTabsConfig(config.children[i]);
            if (childTabs) {
                return childTabs;
            }
        }
    }
    return null;
};

const onConfigReadyForIntegration = (addTabCb, config, context) => {
    const configDef = new Deferred();
    const tabDef = new Deferred();

    addTabCb(tabDef.resolve, context);

    tabDef
        .then((tabConf) => {
            if (!tabConf) {
                return;
            }

            const {label: labelText, render, onDestroy = noop} = tabConf;
            const tabsConfig = getTabsConfig(config) || {tabs: []};
            const tabId = `tab${tabsConfig.tabs.length}`;
            const headerBusId = `header_${tabId}`;
            const contentBusId = `content_${tabId}`;

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

            const renderListener = addBusListener(contentBusId, 'afterRender', (e) => {
                if (typeof render === 'string') {
                    e.data.element.html(render);
                } else {
                    render(e.data.element.first(), context);
                }
            });

            const destroyListener = addBusListener(contentBusId, 'destroy', (e) => {
                renderListener.remove();
                destroyListener.remove();
                onDestroy(e);
            });

        })
        .then(configDef.resolve);

    return configDef.promise();
};

const lc = (str) => str.toLowerCase();

const findCustomFieldValue = (customFieldName, customFieldValues) => {
    var name = lc(customFieldName);
    return find(customFieldValues, (cf) => lc(cf.name) === name);
};

const getCustomFieldValue = (store, entity, customFieldName) =>
    store
        .getDef(entity.entityType.name, {
            id: entity.id,
            fields: ['customFields']
        })
        .then((res) => findCustomFieldValue(customFieldName, res.customFields));

const onChange = (store, entity, customFieldName, listenerFunction) => {
    const listener = {};

    store.on({
        eventName: 'afterSave',
        type: entity.entityType.name,
        listener,
        filter: {
            id: entity.id
        },
        hasChanges: ['customFields']
    }, (res) => {
        const customFieldValue = findCustomFieldValue(customFieldName, res.data.changes.customFields);
        if (customFieldValue) {
            listenerFunction(customFieldValue.value);
        }
    });

    return listener;
};

const getUrl = (customField, value) => {
    switch (lc(customField.type)) {
        case 'url':
            return (value && value.url) ? value.url : null;
        case 'templatedurl':
            return value ? String(customField.value).replace(/\{0\}/, value) : null;
        default:
            return '';
    }
};

const renderTemplate = (template, templateData) =>
    isFunction(template) ? template(templateData) : $.tmpl(template, templateData);

const resizeDefaultFrame = ($frame) => {
    const padding = 80;
    const $left = $frame.closest('.tau-page-entity').find('.additional-info');

    $frame.css({
        height: $left.height() - padding
    });
};

const innerRenderTab = (el, template, customField, value, isDefault) => {
    const url = getUrl(customField, value);

    const templateData = {
        url,
        name: customField.name
    };

    const $html = $(renderTemplate(url ? template : emptyTemplate, templateData));

    $(el).html($html);

    if (isDefault) {
        const timeout = 3000;
        resizeDefaultFrame($html);
        setTimeout(() => resizeDefaultFrame($html), timeout);
    }
};

const renderTab = (store, entity, tabConfig, customField, dom) => {
    const isDefault = !tabConfig.frameTemplate;
    const template = tabConfig.frameTemplate || defaultTemplate;

    when(getCustomFieldValue(store, entity, tabConfig.customFieldName))
        .then(({value}) =>
            innerRenderTab(dom, template, customField, value, isDefault));

    const storeListener = onChange(store, entity, tabConfig.customFieldName, (changedValue) =>
        innerRenderTab(dom, template, customField, changedValue, isDefault));

    return () => store.unbind(storeListener);
};

const loadEntityContext = (entity) =>
    contextFactory.create(entity, configurator);

const loadCustomField = (entity, tabConfig) =>
    when(loadEntityContext(entity))
        .then((entityContext) =>
            find(entityContext.getCustomFields(), (cf) =>
            lc(cf.name) === lc(tabConfig.customFieldName) &&
            lc(cf.entityKind) === lc(tabConfig.entityTypeName)));

const loadProcess = (entity) =>
    when(loadEntityContext(entity))
        .then((entityContext) => entityContext.getProcess());

const inTypes = (customField) => {
    const type = lc(customField.type);
    return type === 'url' || type === 'templatedurl';
};

const addTabCallback = (tabConfig, createTab, context) => {
    const {entity} = context;

    if (lc(entity.entityType.name) !== lc(tabConfig.entityTypeName)) {
        return createTab();
    }

    return when(loadCustomField(entity, tabConfig), tabConfig.processName ? loadProcess(entity) : null)
        .then((customField, process) => {

            if (!customField || !inTypes(customField)) {
                return createTab();
            }
            if (process && lc(process.name) !== lc(tabConfig.processName)) {
                return createTab();
            }

            try {
                let unsubscribe;

                return createTab({
                    label: tabConfig.customFieldName,
                    render: (dom) => {
                        const store = context.configurator.getStore();
                        unsubscribe = renderTab(store, entity, tabConfig, customField, dom);
                    },
                    onDestroy: () => unsubscribe()
                });

            } catch (e) {
                createTab();
                throw e;
            }
        });
};

const addTabs = (tabs) => {
    // Subscribe to configReadyForIntegration as late as possible to be in subscription chain after mashupsForViews
    globalBus.once('contextRetrieved', () => {
        globalBus.on('configReadyForIntegration', (e) => {
            var data = e.data;
            const resultConfigPromises = tabs.map((tabConfig) => {
                const addTabCb = (createTab, context) => addTabCallback(tabConfig, createTab, context);
                return onConfigReadyForIntegration(addTabCb, {children: data.children}, data.context);
            });

            resultConfigPromises.unshift(data.integrationReadyPromise);
            data.integrationReadyPromise = when.apply(null, resultConfigPromises).then((integration) => integration);
        });
    });
};

const init = (mashupConfig) => {
    addTabs(mashupConfig.tabs);
};

init(mashup.config);
