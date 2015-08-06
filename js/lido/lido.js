/**
 * Created by pieter on 1/07/15.
 */
var lido = angular.module ('simpleCollectionView.lido', ['simpleCollectionView.services']);


lido.factory ('LIDODisplay', function () {
    var LIDODisplay = function (lido) {
        this.lido = lido;
        this.lido_events = new LIDOEvents(this.lido);
        this.exportItem = {};
        this.item = {};
        this.img = {
            src: '',
            alt: ''
        };
        this.metadata = {
            types: [],
            measurements: [],
            repository: [],
            subjects: []
        };
        this.stringmetadata = [];
        this.title = '';
        this.collections = [];
    };

    /*
     Parse this.lido into this.item
     */
    LIDODisplay.prototype.parseItem = function () {
        this.item.title = this.lido.descriptiveMetadata.objectIdentificationWrap.titleWrap.titleSet;
        this.item.img = this.lido.administrativeMetadata.resourceWrap.resourceSet.resourceRepresentation;
        this.item.collections = this.lido.descriptiveMetadata.objectClassificationWrap.classificationWrap;
        this.item.metadata = this.lido.descriptiveMetadata;
    };

    /*
     Convert the currently wrapped properties to strings or arrays of strings for display
     */
    LIDODisplay.prototype.formatDisplay = function () {
        this.getTitle ();
        this.getLargeImage ();
        this.img.alt = this.title;
        this.getCollections ();
        this.getMetadata ();
        /* Add attribute stringroles for display */
        var events = this.events;
        for (var i = 0; i < events.length; i++) {
            for (var j = 0; j < events[i].actors.length; j++) {
                events[i].actors[j].stringroles = events[i].actors[j].role;
            }
        }
        /* Create stringmetadata for ng-repeat of simple (key => value of type string) metadata elements (see template) */
        var metadata = this.metadata;
        for (var key in this.metadata) {
            if (! this.metadata.hasOwnProperty (key)) {
                continue;
            }
            if (typeof (this.metadata[key]) == 'string') {
                this.stringmetadata.push ({
                    attr: this.prettyField (key),
                    val: this.metadata[key]
                });
            }
        }
        this.events = events;
    };

    /**
     Function to prettify the metadata.field
     @param field
     @return string
     */
    LIDODisplay.prototype.prettyField = function (field) {
        field = field.replace (/_/g, ' ');
        var first = field.slice (0, 1);
        var remain = field.slice (1);
        field = first.toLocaleUpperCase() + remain;
        return field;
    };

    /*
     Get the collections
     */
    LIDODisplay.prototype.getCollections = function () {
        this.collections = [{
            name: this.item.collections.classification.term.value,
            link: this.item.collections.classification.term.value
        }];
    };

    /*
     Get the title
     */
    LIDODisplay.prototype.getTitle = function () {
        this.title = this.item.title.appellationValue.value;
        if (this.title == '') {
            this.title = this.lido.lidoRecID.value;
        }
    };

    /*
     Get the "large" image
     */
    LIDODisplay.prototype.getLargeImage = function () {
        for (var i = 0; i < this.item.img.length; i++) {
            if (this.item.img[i].type == 'large' || this.item.img[i].type == 'original') {
                this.img.src = this.item.img[i].linkResource.value;
                break;
            }
        }
        if (this.img.src == '') {
            this.img.src = 'view/css/Ehem_Baudenkmal.svg.png';
        }
    };

    /*
     Get the "thumb" image
     */
    LIDODisplay.prototype.getThumbImage = function () {
        for (var i = 0; i < this.item.img.length; i++) {
            if (this.item.img[i].type == 'thumb') {
                this.img.src = this.item.img[i].linkResource.value;
                break;
            }
        }
        if (this.img.src == '') {
            this.img.src = 'view/css/Ehem_Baudenkmal.svg.png';
        }
    };

    /*
     Get the metadata
     Use helper functions to delve deep in the object structure of jsonified-lido object
     */
    LIDODisplay.prototype.getMetadata = function () {
        this.events = this.lido_events.events;
        this.metadata.measurements = this.getMeasurements (this.item.metadata.objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet);
        this.metadata.repository = this.getRepository (this.item.metadata.objectIdentificationWrap.repositoryWrap.repositorySet);
        this.metadata.types = this.getTypes (this.item.metadata.objectClassificationWrap.objectWorkTypeWrap.objectWorkType);
        this.metadata.subjects = this.getSubjects (this.item.metadata.objectRelationWrap.subjectWrap.subjectSet.subject.subjectConcept);
    };

    /**
     * Return the displayObjectMeasurements
     * @param objectMeasurementsSet
     * @returns {string}
     */
    LIDODisplay.prototype.getMeasurements = function (objectMeasurementsSet) {
        if (typeof (objectMeasurementsSet.displayObjectMeasurements) == 'undefined') {
            return '';
        }
        return objectMeasurementsSet.displayObjectMeasurements.value;
    };

    /**
     * Get the repository containing this object
     * @param repositorySet
     * @returns {string}
     */
    LIDODisplay.prototype.getRepository = function (repositorySet) {
        if (typeof (repositorySet.repositoryName.legalBodyName) == 'undefined') {
            return '';
        }
        return repositorySet.repositoryName.legalBodyName.appellationValue.value;
    };

    /**
     * Return a list of types
     * @param objectWorkType
     * @returns {Array}
     */
    LIDODisplay.prototype.getTypes = function (objectWorkType) {
        if (typeof (objectWorkType) == 'undefined') {
            return [];
        }
        var list = [];
        for (var i = 0; i < objectWorkType.length; i++) {
            list = list.concat (this.getTypeFromList (objectWorkType[i]));
        }
        return list;
    };

    /**
     * Get all types from a list
     * @param objectWorkTypeElement
     * @returns {Array}
     */
    LIDODisplay.prototype.getTypeFromList = function (objectWorkTypeElement) {
        var types = [];
        if (objectWorkTypeElement instanceof Array) {
            for (var i = 0; i < objectWorkTypeElement.length; i++) {
                types = types.concat (this.getTypeFromList (objectWorkTypeElement[i]));
            }
        } else {
            types.push (objectWorkTypeElement.term.value);
        }
        return types;
    };

    /**
     * Get a list of subjects
     * @param subjectConcept
     * @returns {Array}
     */
    LIDODisplay.prototype.getSubjects = function (subjectConcept) {
        if (typeof (subjectConcept) == 'undefined') {
            return [];
        }
        var list = [];
        for (var i = 0; i < subjectConcept.length; i++) {
            list = list.concat (this.getSubjectFromList (subjectConcept[i]));
        }
        return list;
    };

    /**
     * Get subjects from a list
     * @param subjectConceptPart
     * @returns {Array}
     */
    LIDODisplay.prototype.getSubjectFromList = function (subjectConceptPart) {
        var subjects = [];
        if (subjectConceptPart instanceof Array) {
            for (var i = 0; i < subjectConceptPart.length; i++) {
                subjects = subjects.concat (this.getSubjectFromList (subjectConceptPart[i]));
            }
        } else {
            subjects.push (subjectConceptPart.term.value);
        }
        return subjects;
    };


    LIDODisplay.prototype.chunk = function (array, cSize) {
        var a = [];
        for (var i = 0; i < array.length; i += cSize) {
            a.push (array.slice (i, i + cSize));
        }
        return a;
    };

    /*
     Divide this.records in chunks (pages) of 60 items for continous display
     */
    LIDODisplay.prototype.paginate = function () {
        var paginated = this.chunk (this.records, 60);
        this.paginated = paginated;
        return paginated;
    };

    LIDODisplay.prototype.exportData = function () {
        this.exportItem.metadata = this.metadata;
        this.exportItem.img = this.img;
        this.exportItem.title = this.title;
        this.exportItem.collections = this.collections;
        this.exportItem.events = this.events;
        this.exportItem.stringmetadata = this.stringmetadata;
    };
    return LIDODisplay;
});