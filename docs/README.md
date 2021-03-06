Embedded Pages
==================

The Embedded Pages mashup allows to see the pages by links you've provided in a URL and Template URL custom field as an additional tab on an entity view, so that you can work with the external pages and documents straight in Targetprocess.  

For example, if Google Docs application is used to keep documentation related to User Stories, you can create a custom field "Google Doc" and specify there links to appropriate google documents for each User Story. This document will be reflected as a new tab on a User Story view.

![Embedded Pages](./1.jpg)

How to activate it:

1. Install the mashup from the Targetprocess Mashups Library
2. Create URL or Template URL custom fields in ```Settings -> Processes -> your process -> Custom Fields tab```
3. Change a mashup config (in the mashups list) to specify which custom fields you'd like to see as an embedded page on a User Story view:

```
tau.mashups.addModule('EmbeddedPages/config', {

    tabs: [{
        /* Sample embedded page of the 'CustomPageUrl' Custom Field of a User Story of a Project with the 'Scrum' Process */
        entityTypeName: 'UserStory',
        customFieldName: 'Google Doc',
        processName: 'Scrum'
    }]

});
```

Now when you put a URL into a 'Google Doc' custom field for a User Story, it will be reflected as a new tab and an embedded page on that User Story view.

__Notes__: 

1. Refresh of the screen is required to see the embedded page details. 
2. You can show as tabs any number of URL and Template URL custom fields for different processes and entity types.
