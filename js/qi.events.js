/**
 * Created by pieter on 16/07/15.
 */

var QiEvents = function (record) {
    this.record = record;
    /*
    List of key-value pairs linking actors to events - for the event "vervaardiging", the actor is named "vervaardiger"
    There is no automatic way of doing this.
     */
    this.maker_roles = {
        'vervaardiging': 'vervaardiger',
        'ontwerp': 'ontwerper'
    };
};


/**
 * Return a list of acquisition events; elements of the list are of the following form:
 * {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
 acquisition_source_id
 @use this.record
 @return Array
 */
QiEvents.prototype.acquisitionEvents = function () {
    var arrayAcquisition = this.record.relationship.object_acquisition;
    return this.simpleEvents(arrayAcquisition, 'Acquisitie');
};

/**
 * Return a list of loan out events; elements of the list are of the following form:
 * {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
 acquisition_source_id
 @use this.record
 @return Array
 */
QiEvents.prototype.loanOutEvents = function () {
    var arrayLoanOut = this.record.relationship.loan_out_object;
    return this.simpleEvents(arrayLoanOut, 'Uitlening');
};

/**
 * Return a list of conservation events; elements of the list are of the following form:
 * {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
 acquisition_source_id
 @use this.record
 @return Array
 */
QiEvents.prototype.conservationEvents = function () {
    var arrayConservation = this.record.relationship.object_conservation;
    return this.simpleEvents(arrayConservation, 'Conservering');
};

/**
 * Return a list of exhibition events; elements of the list are of the following form:
 * {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
 acquisition_source_id
 @use this.record
 @return Array
 */
QiEvents.prototype.exhibitionEvents = function () {
    var arrayExhibition = this.record.relationship.exhibition_venue_object;
    return this.simpleEvents(arrayExhibition, 'Tentoonstelling');
};

/**
 * Return a list of production events; elements of the list are of the following form:
 * {
        actors: list (array) of actors
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        }
 * if the event is of object_production_type_id_name = Vervaardiging (lc); then get the contents of the actors field
 * where actor_role_id_name = Vervaardiger (lc)
 * @use this.record (single item in a QI API Response)
 * @return Array
 */
QiEvents.prototype.productionEvents = function () {
    var productionEvents = [];
    var arrayProduction = this.record.relationship.object_production;
    if (!arrayProduction instanceof Array) {
        arrayProduction = [arrayProduction];
    }
    for (var i = 0; i < arrayProduction.length; i++) {
        var event = {
            actors: [],
            display: '',
            date: '',
            type: '',
            period: ''
        };
        var objectProduction = arrayProduction[i];
        /* Display */
        event.display = String(this.getValueDirectly(objectProduction.details.object_production_type_id_name));
        /* Date */
        var date_from = this.getValueDirectly(objectProduction.details.date_from);
        var date_to = this.getValueDirectly(objectProduction.details.date_to);
        if (date_from == null || date_to == null) {
            /* If both are null, we get an empty string, which is what we want */
            if (date_from == null) {
                event.date = String(date_to);
            } else {
                event.date = String(date_from);
            }
        }
        /* Type */
        event.type = String(this.getValueDirectly(objectProduction.details.object_production_type_id_name));
        /* Period */
        event.period = event.date;
        /* TODO something */
        /* Actors */
        var actors = [];
        if (typeof(objectProduction.details.object_production_type_id_name) == 'undefined' || typeof(this.maker_roles[objectProduction.details.object_production_type_id_name.toLocaleLowerCase()]) == 'undefined') {
            /* Use the values of the production event */
            actors = [{
                name: String(this.getValueDirectly(objectProduction.details.actor_id_name)),
                stringroles: objectProduction.details.object_production_type_id_name.toLocaleLowerCase()
            }];
        } else {
            var t = this.getActorsByType(this.record.relationship.object_maker, this.maker_roles[objectProduction.details.object_production_type_id_name.toLocaleLowerCase()]);
            for (var j = 0; j < t.length; j++) {
                actors.push({
                    name: t[j],
                    stringroles: objectProduction.details.object_production_type_id_name
                });
            }
        }
        event.actors = actors;
        productionEvents.push(event);
    }
    return productionEvents;
};

/**
 Function to get a single value directly (no interpretation) from an attribute (param) of the eventObject
 @param eventObjectAttribute
 @return object|string|array\int|null
 */
QiEvents.prototype.getValueDirectly = function (eventObjectAttribute) {
    if (typeof(eventObjectAttribute) != 'undefined') {
        return eventObjectAttribute;
    }
    return null;
};

/**
 * Get the list of actors for which actor_role_id_name is of type (e.g. "Vervaardiger")
 * @param actorList
 * @param type
 * @return Array
 */
QiEvents.prototype.getActorsByType = function (actorList, type) {
    if (!actorList instanceof Array) {
        actorList = [actorList];
    }
    var returnActors = [];
    for (var i = 0; i < actorList.length; i++) {
        var actor = actorList[i];
        if (typeof(actor.details.actor_role_id_name) == 'undefined') {
            /* Continue when the actor has no role */
            continue;
        }
        if (actor.details.actor_role_id_name.toLocaleLowerCase() != type.toLocaleLowerCase()) {
            /* Continue when actor_role_id_name is not equal to type */
            continue;
        }
        returnActors.push(this.getValueDirectly(actor.name));
    }
    return returnActors;
};

/**
 * Return a simple event from a eventObject. A simple event only has .display and .type set.
 * @param eventObject a single event from an array of events in the API Response (e.g. a single loan_out_object event)
 * @param type string name of the type of event (e.g. Acquisitie)
 * @return object
 */
QiEvents.prototype.simpleEvent = function (eventObject, type) {
    var event = {
        actors: [],
        display: '',
        date: '',
        period: '',
        type: ''
    };
    event.display = this.getValueDirectly(eventObject.name);
    event.type = type;
    return event;
};

/**
 * Function that extracts from an eventArray (e.g. all loan_out_object events) of simple events the "events"-objects.
 * @param eventArray
 * @param type string name of the type of event (e.g. Acquisitie)
 * @return Array
 */
QiEvents.prototype.simpleEvents = function (eventArray, type) {
    var events = [];
    if (!eventArray instanceof Array) {
        eventArray = [eventArray];
    }
    for (var i = 0; i < eventArray.length; i++) {
        events.push(this.simpleEvent(eventArray[i], type))
    }
    return events;
};