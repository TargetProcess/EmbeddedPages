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
    const tabDef = prepareTabConfig(tabConfig, context);

    return tabDef.then((tabConf) => {
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
    }).promise();
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

const innerRenderTab = (el, template, adjustFrameSize, {customField, value, entity}, cancellationToken) => {
    if (cancellationToken.isCancelled) {
        return;
    }

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

const renderTab = (entity, tabConfig, customField, dom, cancellationToken) => {
    const adjustFrameSize = !tabConfig.frameTemplate || tabConfig.adjustFrameSize;
    const template = tabConfig.frameTemplate || defaultTemplate;
    let cancelled = false;
    const destroyable = {
        destroy: () => {
            cancelled = true;
        }
    };

    loadEntityContext(entity).then(context => {
        const store = context.configurator.getStore();

        when(getCustomFieldValue(store, entity, tabConfig.customFieldName))
            .then(({value}) =>
                innerRenderTab(dom, template, adjustFrameSize, {customField, value, entity}, cancellationToken));
        if (!cancelled) {
            const storeListener = onChange(store, entity, tabConfig.customFieldName, (changedValue) =>
                innerRenderTab(dom, template, adjustFrameSize, {
                    customField,
                    value: changedValue,
                    entity
                }, cancellationToken));

            destroyable.destroy = () => store.unbind(storeListener);
        }
    });

    return destroyable;
};

const loadEntityContext = (entity) =>
    contextFactory.create(entity, configurator);

const loadCustomFieldsAndProcess = entity =>
    $.ajax(`/targetprocess/api/v2/${entity.entityType.name.toLowerCase()}?where=(id==${entity.id})&select={customValues,process:{project.process.id,project.process.name}}`)
        .then(response => response.items[0]);

const inTypes = (customField) => {
    const type = lc(customField.type);
    return type === 'url' || type === 'templatedurl';
};

const resolveDeferred = value => {
    const deferred = $.Deferred();
    deferred.resolve(value);
    return deferred;
};

const createCancellationToken = () => {
    let cancelled = false;

    return {
        cancel () {
            cancelled = true;
        },

        get isCancelled () {
            return cancelled;
        }
    };
};

let cancellationTokens = [];

const prepareTabConfig = (tabConfig, context) => {
    const {entity} = context;

    if (lc(entity.entityType.name) !== lc(tabConfig.entityTypeName)) {
        return resolveDeferred();
    }

    const cancellationToken = createCancellationToken();

    cancellationTokens.push(cancellationToken);

    // return when(loadCustomField(entity, tabConfig), tabConfig.processName ? loadProcess(entity) : null)
    return loadCustomFieldsAndProcess(entity)
        .then(({customValues: {customFields = []}, process}) => {
            if (cancellationToken.isCancelled) {
                return;
            }

            const customField = find(customFields,
                cf => lc(cf.name) === lc(tabConfig.customFieldName));

            if (!customField || !inTypes(customField)) {
                return;
            }

            if (process && tabConfig.processName && lc(process.name) !== lc(tabConfig.processName)) {
                return;
            }

            let destroyable;

            return {
                label: tabConfig.customFieldName,
                render: (dom) => {
                    destroyable = renderTab(entity, tabConfig, customField, dom, cancellationToken);
                },
                onDestroy: () => destroyable.destroy()
            };
        });
};

const addTabs = (tabs) => {
    // Subscribe to configReadyForIntegration as late as possible to be in subscription chain after mashupsForViews
    globalBus.once('contextRetrieved', () => {
        globalBus.on('configReadyForIntegration', (e) => {
            // cancellationTokens.forEach(cancellationToken => cancellationToken.cancel());
            cancellationTokens = [];

            const data = e.data;
            const resultConfigPromises = tabs.map(tabConfig => configReadyForIntegration(tabConfig, {
                children: data.children
            }, data.context));

            resultConfigPromises.unshift(data.integrationReadyPromise);
            data.integrationReadyPromise = when.apply(null, resultConfigPromises).then((integration) => integration);
        });
    });
};

const init = (mashupConfig) => {
    addTabs(mashupConfig.tabs);
};

init(mashup.config);
