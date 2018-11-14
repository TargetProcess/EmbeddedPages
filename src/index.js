/* globals mashup */
import {find, isFunction, noop, compact} from 'underscore';
import $, {when, Deferred} from 'jquery';
import configurator from 'tau/configurator';
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
        for (let i = 0; i < config.children.length; i++) {
            const childTabs = getTabsConfig(config.children[i]);
            if (childTabs) {
                return childTabs;
            }
        }
    }
    return null;
};

const configReadyForIntegration = (tabConfig, config, context) => {
    const tabConf = prepareTabConfig(tabConfig, context);

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
};

const lc = (str) => str.toLowerCase();

const findCustomFieldValue = (customFieldName, customFieldValues) => {
    const name = lc(customFieldName);
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
    const $infoPanel = $frame.closest('.tau-page-entity').find('.additional-info');

    $frame.css({
        height: $infoPanel.height() - padding
    });
};

const innerRenderTab = (el, template, adjustFrameSize, {customField, value, entity}) => {
    const url = getUrl(customField, value);

    const templateData = {
        url,
        entityId: entity.id,
        name: customField.name
    };

    const $html = $(renderTemplate(url ? template : emptyTemplate, templateData));

    $(el).html($html);

    if (adjustFrameSize) {
        const timeout = 3000;
        resizeDefaultFrame($html);
        setTimeout(() => resizeDefaultFrame($html), timeout);
    }
};

const renderTab = ({entity, tabConfig, customField, dom, context}) => {
    const adjustFrameSize = !tabConfig.frameTemplate || tabConfig.adjustFrameSize;
    const template = tabConfig.frameTemplate || defaultTemplate;
    const store = context.configurator.getStore();

    when(getCustomFieldValue(store, entity, tabConfig.customFieldName))
        .then(({value}) =>
            innerRenderTab(dom, template, adjustFrameSize, {
                customField,
                value,
                entity
            }));

    const storeListener = onChange(store, entity, tabConfig.customFieldName, (changedValue) =>
        innerRenderTab(dom, template, adjustFrameSize, {
            customField,
            value: changedValue,
            entity
        }));

    return {
        destroy: () => store.unbind(storeListener)
    };
};

const inTypes = (customField) => {
    const type = lc(customField.type);
    return type === 'url' || type === 'templatedurl';
};

const prepareTabConfig = (tabConfig, context) => {
    const {entity} = context;
    const lowercasedEntityTypeName = lc(tabConfig.entityTypeName);

    if (lc(entity.entityType.name) !== lowercasedEntityTypeName) {
        return null;
    }

    const customFields = context.getCustomFields();
    const lowercasedCfName = lc(tabConfig.customFieldName);

    const customFieldOfTab = find(customFields,
        cf => lc(cf.name) === lowercasedCfName &&
            lc(cf.entityKind) === lowercasedEntityTypeName);

    if (!customFieldOfTab || !inTypes(customFieldOfTab)) {
        return null;
    }

    const process = context.getProcess();

    if (tabConfig.processName && lc(process.name) !== lc(tabConfig.processName)) {
        return null;
    }

    let destroyable;

    return {
        label: tabConfig.customFieldName,
        render: (dom) => {
            destroyable = renderTab({
                context,
                entity,
                tabConfig,
                customField: customFieldOfTab,
                dom
            });
        },
        onDestroy: () => destroyable.destroy()
    };
};

const addTabs = (tabs) => {
    // Subscribe to configReadyForIntegration as late as possible to be in subscription chain after mashupsForViews
    globalBus.once('contextRetrieved', () => {
        globalBus.on('configReadyForIntegration', (e) => {
            const data = e.data;
            tabs.forEach(tabConfig => configReadyForIntegration(tabConfig, {
                children: data.children
            }, data.context));
        });
    });
};

addTabs(mashup.config.tabs);
