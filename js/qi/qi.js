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
        this.image_server = 'https://zilver.qi-cms.com/media/_source/'; /* URL of the server containing the images; server + path = src of the image */
        this.metadata = this.getMetadata();
        this.img = this.getImage();
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
        metadata.push({
            field: 'Objecttype',
            disp: 'Objecttype',
            value: this.getValueDirectly(this.item.record.object_type_value)
        });
        /* Object style */
        metadata.push({
            field: 'Stijl',
            disp: 'Stijl',
            value: this.getValueDirectly(this.item.record.object_style_value)
        });
        return metadata;
    };

    /**
    Function to get an image object of the following form from a QI API Response (this.item):
        {
        src
        alt
        id
        }
     @return object (attributes are empty ('' not undefined) when no image could be found)
     */
    QiDisplay.prototype.getImage = function () {
        var images = this.item.media.image;
        var image_list = [];
        //for (var i = 0; i < images.length; i++) {
        for (var i = 0; i < 1; i++) { /* We only need one image */
            var image = images[i];
            var image_object = {
                src: '',
                alt: '',
                id: ''
            };
            image_object.src = this.image_server + image.path + '/' + image.filename;
            if (typeof (image.alt_text) != 'undefined' && image.alt_text != '') {
                image_object.alt = image.alt_text;
            } else if (typeof (image.caption) != 'undefined' && image.caption != '') {
                image_object.alt = image.caption;
            } else {
                /* Fallback */
                image_object.alt = image.filename;
            }
            image_object.id = image.filename;
            image_list.push (image_object);
        }
        if (image_list.length == 0) {
            /* No image, return empty object */
            return {
                src: '',
                alt: '',
                id: ''
            };
        }
        return image_list[0];
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
        returnCollections.push({
            name: this.getValueDirectly(this.item.record.collection_type_value),
            link: this.getValueDirectly(this.item.record.collection_type_value)
        });
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
        console.log(events);
        return events;
    };

    /**
    Function to create a exportItem from our QiDisplay object
     @return object
     */
    QiDisplay.prototype.getExportItem = function () {
        return {
            title: this.title,
            img: this.img,
            collections: this.collections,
            metadata: this.metadata,
            events: this.events
        };
    };

    /**
     Function to get a single value directly (no interpretation) from an attribute (param)
     @param objectAttribute
     @return object|string|array\int|null
     */
    QiDisplay.prototype.getValueDirectly = function (objectAttribute) {
        if (typeof(objectAttribute) != 'undefined') {
            if (objectAttribute instanceof String) {
                if (objectAttribute != '') {
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