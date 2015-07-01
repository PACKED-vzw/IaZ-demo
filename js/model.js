var model = angular.module ('simpleCollectionView.model', ['simpleCollectionView.services']);


model.factory ('CLoader', function (VAMQuery) {
    var CLoader = function () {

    };
});


model.factory ('ItemDisplay', function () {
    var ItemDisplay = function (item) {
        this.item = item;
        this.img = {
            src: '',
            alt: '',
            id: ''
        };
        this.metadata = [];
        this.title = this.getTitle ();
        this.collections = [];
        this.exportItem = {};
        this.paginated = [];
    };

    /*
    Function to set the img attribute to the correct src for the primary image associated with the item.
    Sets this.img
     */
    ItemDisplay.prototype.setIMG = function () {
        if (typeof (this.item.image_set) != 'undefined') {
            for (var i = 0; i < this.item.image_set.length; i++) {
                if (this.item.image_set[i].fields.image_id == this.item.primary_image_id) {
                    this.img.src = 'http://media.vam.ac.uk/media/thira/' + this.item.image_set[i].fields.local;
                    this.img.alt = this.item.image_set[i].fields.image_id;
                    this.img.id = this.item.image_set[i].fields.image_id;
                }
            }
        }
    };

    /*
    Function to fill the this.metadata array with selected metadata for the item.
    Sets this.metadata with objects with attributes field & value.
     */
    ItemDisplay.prototype.setMetadata = function () {
        var displayed_metadata = ['title', 'object_number', 'artist', 'date_text', 'physical_description', 'dimensions', 'materials', 'public_access_description'];
        for (var i = 0; i < displayed_metadata.length; i++) {
            var attr_name = displayed_metadata[i];
            var attr_value = this.item[attr_name];
            if (Array.isArray (attr_value)) {
                /* Flatten */
                var attr_value_s = [];
                for (var j = 0; j < attr_value.length; j++) {
                    if (typeof (attr_value[j]) != 'undefined') {
                        attr_value_s.push (attr_value[j].fields.name);
                    }
                }
                attr_value = attr_value_s.join (', ');
            }
            this.metadata.push (
                {
                    field: attr_name,
                    disp: this.prettyField (attr_name),
                    value: attr_value
                }
            );
        }
    };

    /*
    Function to return the collections of an item, with a link.
     */
    ItemDisplay.prototype.getCollections = function () {
        var collections = [];
        if (typeof (this.item.collections) == 'undefined') {
            this.collections = collections;
        } else {
            for (var i = 0; i < this.item.collections.length; i++) {
                this.collections.push (
                    {
                        name: this.item.collections[i].fields.name,
                        link: this.getCollectionLink (this.item.collections[i].fields.name)
                    }
                );
            }
        }
    };

    /*
    Function to set the title
    @return string title
     */
    ItemDisplay.prototype.getTitle = function () {
        var title = '';
        if (this.item.title != '') {
            title = this.item.title;
        } else {
            title = this.item.descriptive_line;
        }
        return title;
    };

    /*
    Create a collections link for use in this application
    @param string collection_name
    @return string link
     */
    ItemDisplay.prototype.getCollectionLink = function (collection_name) {
        var link = encodeURIComponent (collection_name);
        link = link.replace (/%20/g, '+');
        return link;
    };

    /*
    Function to prettify the metadata.field
    @param string field
    @return string pretty_field
     */
    ItemDisplay.prototype.prettyField = function (field) {
        field = field.replace (/_/g, ' ');
        var first = field.slice (0, 1);
        var remain = field.slice (1);
        field = first.toLocaleUpperCase() + remain;
        return field;
    };

    /*
    Create an exportItem so we don't expose the internals of this module to a function that only needs this two attributes.
     */
    ItemDisplay.prototype.exportData = function () {
        this.exportItem.metadata = this.metadata;
        this.exportItem.img = this.img;
        this.exportItem.title = this.title;
        this.exportItem.collections = this.collections;
        console.log (this.exportItem.collections);
    };
    return ItemDisplay;
});

model.factory ('CollectionDisplay', function () {
    var CollectionDisplay = function (collection) {
        this.collection = collection;
        this.records = [];
        this.total_records = this.collection.result_count;
        this.exportCollection = {};
    };

    /*
    Get all the records from the JSON-response in an array with objects having the attributes title, img_link (link to the image) and item_link (link to the description of the item in our system.
     */
    CollectionDisplay.prototype.getRecords = function () {
        for (var i = 0; i < this.collection.records.length; i++) {
            if (typeof (this.collection.records[i]) != 'undefined') {
                var record = {
                    title: this.getItemTitle (this.collection.records[i]),
                    img_link: this.getIMGLink (this.collection.records[i].fields.primary_image_id),
                    item_link: this.getItemLink (this.collection.records[i].fields.object_number)
                };
                if (record.title == "" || typeof (record.title) == 'undefined') {
                    record.title = this.getObjectNumber (this.collection.records[i]);
                }
                this.records.push (record);
            }
        }
    };

    CollectionDisplay.prototype.getIMGLink = function (image_id) {
        if (image_id == '') {
            return 'view/css/Ehem_Baudenkmal.svg.png';
        } else {
            return 'http://media.vam.ac.uk/media/thira/collection_images/' + image_id.substr (0, 6) + '/' + image_id + '.jpg';
        }
    };

    CollectionDisplay.prototype.getItemLink = function (object_number) {
        return '#/item/' + object_number;
    };

    CollectionDisplay.prototype.getObjectNumber = function (record) {
        var object_number = record.fields.object_number;
        return object_number;
    };
    /*
    Function to get the title of an item
    @param object item (single item of record list)
    @return string title
     */
    CollectionDisplay.prototype.getItemTitle = function (item) {
        var title = '';
        if (item.fields.title != '' && typeof (item.fields.title) != 'undefined') {
            title = item.fields.title;
        } else {
            title = item.fields.descriptive_line;
        }
        return title;
    };

    CollectionDisplay.prototype.chunk = function (array, cSize) {
        var a = [];
        for (var i = 0; i < array.length; i += cSize) {
            a.push (array.slice (i, i + cSize));
        }
        return a;
    };

    /*
    Divide this.records in chunks (pages) of 60 items for continous display
     */
    CollectionDisplay.prototype.paginate = function () {
        var paginated = this.chunk (this.records, 60);
        this.paginated = paginated;
        return paginated;
    };

    CollectionDisplay.prototype.exportData = function () {
        this.exportCollection.total_records = this.total_records;
        this.exportCollection.records = this.records;
        this.exportCollection.paginated = this.paginate ();
    };


    return CollectionDisplay;
});