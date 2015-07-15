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
     */
    var QiDisplay = function (qiResponseObject) {
        this.item = qiResponseObject;
        this.metadata = this.getMetadata();
        this.img = this.getImage();
        this.title = this.getTitle();
        this.collections = this.getCollections();
        this.events = this.getEvents();
        this.exportItem = this.export();
    };

    /**
    Function to get a list of defined metadata fields from a QI API Response (this.item)
    @return array ({field, disp, value})
     */
    QiDisplay.prototype.getMetadata = function () {};

    /**
    Function to get an image object of the following form from a QI API Response (this.item):
        {
        src
        alt
        id
        }
     @return object
     */
    QiDisplay.prototype.getImage = function () {};

    /**
    Function to get the title from a Qi API Response (this.item)
     @return string
     */
    QiDisplay.prototype.getTitle = function () {
        if (typeof (this.item.name) != 'undefined' && this.item.name != '') {
            return this.item.name;
        } else {
            return this.item.record.object_number;
        }
    };

    /**
    Function to get a list of collections from a Qi API Response (this.item)
     @return array()
     */
    QiDisplay.prototype.getCollections = function () {};

    QiDisplay.prototype.getEvents = function () {};

    /**
    Function to create a exportItem from our QiDisplay object
     @return object
     */
    QiDisplay.prototype.export = function () {};

    return QiDisplay ();
});