/* globals mashup */

import {find, isFunction, noop, jsonSelect} from 'underscore';
import $, {when, Deferred} from 'jquery';
import configurator from 'tau/configurator';
import contextFactory from 'tau/models/page.entity/entity.context.factory';

import {addBusListener} from 'targetprocess-mashup-helper';

import S from './index.css';

const globalBus = configurator.getGlobalBus();

const templateDefault = ({url}) => `<iframe class="${S.frame}" src="${url}" frameborder="0"></iframe>`;
const templateEmpty = ({name}) => `
    <span class="${S.empty}">
        Nothing to display in the Tab: the value of the '${name}' Custom Field is empty,
    </span>
`;

const getTabsConfig = (config) => {

    const tabsConfig = jsonSelect(config.children, ':has(:root>.type:val("tabs"))');

    return tabsConfig.length ? tabsConfig[0] : {tabs: []};

};

const onConfigReadyForIntegration = (addTabCb, config, context) => {

    const configDef = new Deferred();

    const tabDef = new Deferred();
    const resolve = tabDef.resolve.bind(tabDef);

    addTabCb(resolve, context);

    tabDef.then((tabConf) => {

        if (!tabConf) return;

        const {label: labelText, render, onDestroy = noop} = tabConf;

        const tabsConfig = getTabsConfig(config);

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

            if (typeof render === 'string') e.data.element.html(render);
            else render(e.data.element.first(), context);

        });

        const destroyListener = addBusListener(contentBusId, 'destroy', (e) => {

            renderListener.remove();
            destroyListener.remove();

            onDestroy(e);

        });

    })
    .then(() => {

        const resConfig = {
            ...config,
            context
        };

        configDef.resolve(resConfig);

    });

    return configDef.promise();

};

const addTab = (addTabCb) => {

    const lowestPriority = 100500;

    globalBus.on('configReadyForIntegration', (e) => {

        const config = {
            children: e.data.children
        };
        const context = e.data.context;

        const resultConfig = onConfigReadyForIntegration(addTabCb, config, context);

        e.data.integrationReadyPromise = when(e.data.integrationReadyPromise, resultConfig)
            .then((integration) => integration);

    }, null, null, lowestPriority);

};

const lc = (str) => str.toLowerCase();

const findCustomFieldValue = (customFieldName, customFieldValues) =>
    find(customFieldValues, (cf) => lc(cf.name) === lc(customFieldName));

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

        if (customFieldValue) listenerFunction(customFieldValue.value);

    });

    return listener;

};

const getUrl = (customField, value) => {

    switch (lc(customField.type)) {

        case 'url':
            return (value && value.url) ? value.url : null;
        case 'templatedurl':
            return value ? String(value).replace(/\{0\}/, value) : null;
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

    const $html = $(renderTemplate(url ? template : templateEmpty, templateData));

    $(el).html($html);

    if (isDefault) {

        const timeout = 3000;

        resizeDefaultFrame($html);
        setTimeout(() => resizeDefaultFrame($html), timeout);

    }

};

const renderTab = (store, entity, tabConfig, customField, dom) => {

    const isDefault = !tabConfig.frameTemplate;
    const template = tabConfig.frameTemplate || templateDefault;

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

const inTypes = (customField) =>
    lc(customField.type) === 'url' || lc(customField.type) === 'templatedurl';

const addTabByConfig = (tabConfig) =>
    addTab((createTab, context) => {

        const {entity} = context;

        const store = context.configurator.getStore();

        if (lc(entity.entityType.name) !== lc(tabConfig.entityTypeName)) return createTab();

        return when(loadCustomField(entity, tabConfig), tabConfig.processName ? loadProcess(entity) : null)
            .then((customField, process) => {

                if (!customField || !inTypes(customField)) return createTab();
                if (process && lc(process.name) !== lc(tabConfig.processName)) return createTab();

                try {

                    let unsubscribe;

                    return createTab({
                        label: tabConfig.customFieldName,
                        render: (dom) => {

                            unsubscribe = renderTab(store, entity, tabConfig, customField, dom);

                        },
                        onDestroy: () => unsubscribe()
                    });

                } catch (e) {

                    createTab();

                    throw e;

                }

            });

    });

const init = (mashupConfig) =>
    mashupConfig.tabs.forEach(addTabByConfig);

init(mashup.config);
