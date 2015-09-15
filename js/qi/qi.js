/**
 * Created by pieter on 15/07/15.
 */
var model = angular.module ('simpleCollectionView.qi', ['simpleCollectionView.services']);

model.factory ('QiDisplay', function() {
    /*
    Create an object that parses the responses of the Qi API for a single object to something
    the controllers may accept for display.
    Accepts the qiResponseObject-parameter, which is the value of a single item in the response.records list
    Returns QiDisplay object which has an exportItem containing the following variables:
     this.exportItem.metadata: array of objects of the following form:
         {
         field: name of the metadata field in the Qi Response,
         disp: displayable metadata field name,
         value: value of the fild
         }
     this.exportItem.img: object for an image of the following form:
        {
        src: source (full link) of the image
        alt: alternative name of the image ("alt"-tag)
        id: id of the image ("id"-tag)
        }
     this.exportItem.title: string containing the title (pretty name) of the Qi Response
     this.exportItem.collections: list of strings containing the collections this item belongs to
     this.exportItem.events: list of events of the following form:
        {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
     */
    var QiDisplay = function (qiResponseObject) {
        this.item = qiResponseObject;
        this.QiEvents = new QiEvents(this.item);
        this.QiMetadata = new QiMetadata(this.item);
        this.QiImage = new QiImage(this.item);
        this.metadata = this.getMetadata();
        this.img = this.QiImage.img;
        this.title = this.getName();
        this.collections = this.getCollections();
        this.events = this.getEvents();
        this.exportItem = this.getExportItem();
    };

    /**
    Function to get a list of defined metadata fields from a QI API Response (this.item)
    @return array ({field, disp, value})
     */
    QiDisplay.prototype.getMetadata = function () {
        var metadata = [];
        /* Title */
        var titles = this.QiMetadata.getTitle();
        for (var i = 0; i < titles.length; i++) {
            metadata.push({
                field: titles[i].replace(' ', '_'),
                disp: 'Titel',
                value: titles[i]
            });
        }
        /* Description */
        var descriptions = this.QiMetadata.getDescription();
        for (i = 0; i < descriptions.length; i++) {
            metadata.push({
                field: descriptions[i].replace(' ', '_'),
                disp: 'Beschrijving',
                value: descriptions[i]
            });
        }
        /* Object type */
        /*
        object_x_id holds a reference (foreign key) to the x (i.c. object type). If that's null, no x has
        been assigned to this object, so skip it.
         */
        if (this.getValueDirectly(this.item.record.object_type_id) !== null) {
            metadata.push({
                field: 'Objecttype',
                disp: 'Objecttype',
                value: this.getValueDirectly(this.item.record.object_type_value)
            });
        }
        /* Object style */
        if (this.getValueDirectly(this.item.record.object_style_id) !== null) {
            metadata.push({
                field: 'Stijl',
                disp: 'Stijl',
                value: this.getValueDirectly(this.item.record.object_style_value)
            });
        }
        return metadata;
    };

    /**
    Function to get the title from a Qi API Response (this.item)
     @return string
     */
    QiDisplay.prototype.getName = function () {
        if (typeof (this.item.name) != 'undefined' && this.item.name != '') {
            return this.item.name;
        } else {
            return this.item.record.object_number;
        }
    };

    /**
    Function to get a list of collections from a Qi API Response (this.item)
     @return Array
     */
    QiDisplay.prototype.getCollections = function () {
        /* QI items only have 1 collection */
        var returnCollections = [];
        if (this.getValueDirectly(this.item.record.collection_type_id) !== null) {
            returnCollections.push({
                name: this.getValueDirectly(this.item.record.collection_type_value),
                link: this.getValueDirectly(this.item.record.collection_type_value)
            });
        }
        return returnCollections;
    };

    /**
    Function to get a list of events from a Qi API Response (this.item)
     @return Array
     */
    QiDisplay.prototype.getEvents = function () {
        var e_list = ['object_production', 'object_acquisition', 'loan_out_object', 'object_conservation', 'exhibition_venue_object'];
        var events = [];
        /* Production */
        events = events.concat(this.QiEvents.productionEvents());
        /* Acquisition */
        events = events.concat(this.QiEvents.acquisitionEvents());
        /* Loan out */
        events = events.concat(this.QiEvents.loanOutEvents());
        /* Conservation */
        events = events.concat(this.QiEvents.conservationEvents());
        /* Exhibition */
        events = events.concat(this.QiEvents.exhibitionEvents());
        return events;
    };

    /**
    Function to create a exportItem from our QiDisplay object
     @return object
     */
    QiDisplay.prototype.getExportItem = function () {
        var exportItem = {};
        if (this.title != '') {
            exportItem.title = this.title;
        }
        if (this.img != '') {
            exportItem.img = this.img;
        }
        if (this.collections.length > 0) {
            exportItem.collections = this.collections;
        }
        if (this.metadata.length > 0) {
            exportItem.metadata = this.metadata;
        }
        if (this.events.length > 0) {
            exportItem.events = this.events;
        }
        return exportItem;
    };

    /**
     Function to get a single value directly (no interpretation) from an attribute (param)
     @param objectAttribute
     @return object|string|array\int|null
     */
    QiDisplay.prototype.getValueDirectly = function (objectAttribute) {
        if (typeof(objectAttribute) != 'undefined') {
            if (objectAttribute instanceof String) {
                if (objectAttribute != '' && objectAttribute !== null) {
                    return objectAttribute;
                } else {
                    return null;
                }
            }
            return objectAttribute;
        }
        return null;
    };

    return QiDisplay;
});