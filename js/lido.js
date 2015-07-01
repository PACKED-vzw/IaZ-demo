/**
 * Created by pieter on 1/07/15.
 */
var lido = angular.module ('simpleCollectionView.lido', ['simpleCollectionView.services']);


lido.factory ('LIDODisplay', function () {
    var LIDODisplay = function (lido) {
        this.lido = lido;
        this.exportItem = {};
        this.item = {};
        this.img = {
            src: '',
            alt: ''
        };
        this.metadata = {
            events: [],
            types: [],
            measurements: [],
            repository: [],
            subjects: [],
            formatted: {
                Repository: '',
                Events: [],
                Types: [],
                Measurements: [],
                Subjects: []
            }
        };
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
        this.formatForDisplay ();
    };

    LIDODisplay.prototype.formatForDisplay = function () {
        for (var i = 0; i < this.metadata.events.length; i++) {
            var event = {
                Type: this.metadata.events[i].type,
                Period: this.metadata.events[i].period,
                Date: this.metadata.events[i].date,
                Actors: this.formatActorsForDisplay (this.metadata.events[i].actors)
            };
            this.metadata.formatted.Events.push (event);
        }
    };

    /**
     * Format a list of actors for display as "actor (roles), actor (roles)"
     * @param actors
     * @returns {string}
     */
    LIDODisplay.prototype.formatActorsForDisplay = function (actors) {
        var list = [];
        for (var i = 0; i < actors.length; i++) {
            list.push (actors[i].name + ' (' + actors[i].roles.join(', ') + ')');
        }
        return list.join (', ');
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
        this.metadata.events = this.getEventMetadata (this.item.metadata.eventWrap.eventSet);
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

    /**
     * Get event metadata
     * @param eventSetPart
     * @returns {Array}
     */
    LIDODisplay.prototype.getEventMetadata = function (eventSetPart) {
        var events = [];
        if (eventSetPart instanceof Array) {
            for (var i = 0; i < eventSetPart.length; i++) {
                events = events.concat (this.getEventMetadata (eventSetPart[i]));
            }
        } else {
            var event = {
                actors: this.getActorsFromList (eventSetPart.event.eventActor),
                date: this.getEventDate (eventSetPart.event.eventDate),
                type: this.getEventType (eventSetPart.event.eventType),
                period: this.getEventPeriod (eventSetPart.event.periodName)
            };
            events.push (event);
        }
        return events;
    };


    /**
     * Return the period of an event
     * @param eventPeriodPart
     * @returns {string}
     */
    LIDODisplay.prototype.getEventPeriod = function (eventPeriodPart) {
        if (typeof (eventPeriodPart) == 'undefined') {
            return '';
        } else {
            return eventPeriodPart.term.value;
        }
    };

    /**
     * Return the type of an event
     * @param eventTypePart
     * @returns {string}
     */
    LIDODisplay.prototype.getEventType = function (eventTypePart) {
        if (typeof (eventTypePart) == 'undefined') {
            return '';
        }
        return eventTypePart.term.value;
    };

    /**
     * Get Event date
     * @param eventDatePart
     * @returns {string}
     */
    LIDODisplay.prototype.getEventDate = function (eventDatePart) {
        if (typeof (eventDatePart) == 'undefined') {
            return '';
        }
        return eventDatePart.date.latestDate.value;
    };

    /**
     * Get actors from the eventActor list
     * @param eventActorPart
     * @returns {Array}
     */
    LIDODisplay.prototype.getActorsFromList = function (eventActorPart) {
        var actors = [];
        if (eventActorPart instanceof Array) {
            for (var i = 0; i < eventActorPart.length; i++) {
                actors.concat(this.getActorsFromList(eventActorPart[i]));
            }
        } else if (typeof (eventActorPart) == 'undefined') {
            return actors;
        } else {
            var actor = {
                name: '',
                roles: []
            };
            /* Names */
            for (var j = 0; j < eventActorPart.actorInRole.actor.nameActorSet.appellationValue.length; j++) {
                if (eventActorPart.actorInRole.actor.nameActorSet.appellationValue[j].pref == 'preferred') {
                    actor.name = eventActorPart.actorInRole.actor.nameActorSet.appellationValue[j].value;
                    break;
                }
            }
            for (var k = 0; k < eventActorPart.actorInRole.roleActor.length; k++) {
                actor.roles = actor.roles.concat (this.getRoles (eventActorPart.actorInRole.roleActor[k]));
            }
            actors.push (actor);
        }
        return actors;
    };

    /**
     * Get the actor role from a roleActor-list
     * @param roleActorPart
     * @returns {Array}
     */
    LIDODisplay.prototype.getRoles = function (roleActorPart) {
        var roles = [];
        if (roleActorPart instanceof Array) {
            for (var i = 0; i < roleActorPart.length; i++) {
                roles = roles.concat (this.getRoles (roleActorPart[i]));
            }
        } else if (typeof (roleActorPart) == 'undefined') {
            return roles;
        } else {
            roles.push (roleActorPart.term.value);
        }
        return roles;
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
    };
    return LIDODisplay;
});