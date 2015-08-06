/**
 * Created by pieter on 6/08/15.
 */

var LIDOEvents = function(record) {
    /**
     * Parse the eventSet part of the object and build a list of events (class.events
     * in which each event is of the form:
     * {
        actors: list (array) of actors
                    {
                        name:
                        role:
                    }
        display: name of the event formatted for display
        date: date of the event (string)
        type: type of the event (string) (e.g. "creation")
        period: timeperiod (e.g. "18th century") of the event
        } (if undefined, the values are null)
     */
    this.helper = new LIDOHelper();
    this.original_events = this.getEventSet(record);
    this.events = [];
    for (var i = 0; i < this.original_events.length; i++) {
        this.events.push(this.getSingleEventMetadata(this.original_events[i]));
    }
};

/**
 * All events are inside eventSet, which is the sole element inside eventWrap
 * This function returns the eventSet array which may then be traversed like
 * for event in eventSet:
 *      do foo
 * @param record: record object
 */
LIDOEvents.prototype.getEventSet = function(record) {
    var events = [];
    if (!record.hasOwnProperty('descriptiveMetadata')) {
        /* No descriptive metadata, thus no events */
        return events;
    }
    if (!record.descriptiveMetadata.hasOwnProperty('eventWrap')) {
        /* No eventWrap, thus no events */
        return events;
    }
    if (!record.descriptiveMetadata.eventWrap.hasOwnProperty('eventSet')) {
        /* No eventSet, thus no events */
        return events;
    }
    events = record.descriptiveMetadata.eventWrap.eventSet;
    return events;
};

/**
 * Function to get the metadata to fill in the event prototype (see above) for a single event
 * @param eventPart (eventSet[i]) (has two children: .event and .displayEvent)
 * @return Object
 */
LIDOEvents.prototype.getSingleEventMetadata = function(eventPart) {
    var actors = this.getEventActors(eventPart);
    var display = this.getEventDisplay(eventPart);
    var date = this.getEventDate(eventPart);
    var type = this.getEventType(eventPart);
    var period = this.getEventPeriod(eventPart);
    return {
        actors: actors,
        display: display,
        date: date,
        type: type,
        period: period
    };
};

/**
 * Function to get the actors linked to an event. eventActor may be an object, meaning there is only one actor
 * connected to this event, or an array, meaning multiple are connected to this event.
 * Every eventActor has a role (actorInRole.roleActor.term.value).
 * Returns a list containing objects of the form {name: foo, role:bar}
 * @param eventPart
 * @return Array
 */
LIDOEvents.prototype.getEventActors = function(eventPart){
    var event = eventPart.event;
    var actors = [];
    if (!event.hasOwnProperty('eventActor')) {
        /* No actors */
        return actors;
    }
    if (event.eventActor instanceof Array) {
        for (var i = 0; i < event.eventActor.length; i++) {
            actors.push(this.getActorObject(event.eventActor[i]));
        }
    } else {
        actors.push(this.getActorObject(event.eventActor));
    }
    return actors;
};

/**
 * Function to return the following information of every eventActor-object:
 *      name (eventActor.displayActorInRole.value OR eventActor.actorInRole.nameActorSet.appellationValue.value where pref = preferred)
 *      role (eventActor.roleActor.term.value)
 * Returned as an object {name: foo, role:bar}
 * @param eventActor
 * @return Object
 */
LIDOEvents.prototype.getActorObject = function(eventActor) {
    var actor = {name: '', role: ''};
    actor.name = this.getActorName(eventActor);
    actor.role = this.getActorRole(eventActor);
    return actor;
};

/**
 * Function to get the role of an actor:
 *  eventActor.roleActor.term.value
 * An actor may have multiple roleActors; if so, concat them using ', ' as separator
 * @param eventActor
 * @return String
 */
LIDOEvents.prototype.getActorRole = function(eventActor) {
    var role = '';
    if (!eventActor.hasOwnProperty('actorInRole')) {
        /* No actor */
        return role;
    }
    if (!eventActor.actorInRole.hasOwnProperty('roleActor')) {
        /* No role */
        return role;
    }
    if (eventActor.actorInRole.roleActor instanceof Array) {
        var roles = [];
        for (var i = 0; i < eventActor.actorInRole.roleActor.length; i++) {
            var roleActor = eventActor.actorInRole.roleActor[i];
            if (roleActor.term instanceof Array) {
                roles.push(this.helper.getPropertyByLang(roleActor.term, 'en'));
            } else {
                roles.push(roleActor.term.value);
            }
        }
        role = roles.join(', ');
    } else {
        if (eventActor.actorInRole.roleActor.term instanceof Array) {
            role = this.helper.getPropertyByLang(eventActor.actorInRole.roleActor.term, 'en');
        } else {
            role = eventActor.actorInRole.roleActor.term.value;
        }
    }
    return role;
};

/**
 * Function to get the name of an actor:
 *  eventActor.displayActorInRole.value OR eventActor.actorInRole.nameActorSet.appellationValue.value where pref = preferred
 * @param eventActor
 * @return String
 */
LIDOEvents.prototype.getActorName = function(eventActor) {
    var name = '';
    if (eventActor.hasOwnProperty('displayActorInRole')) {
        /* displayActorInRole is how the provider thinks it should be displayed */
        if (eventActor.displayActorInRole instanceof Array) {
            name = this.helper.getPropertyByLang(eventActor.displayActorInRole, 'en');
        } else {
            name = eventActor.displayActorInRole.value;
        }
    } else {
        if (!eventActor.hasOwnProperty('actorInRole')) {
            /* No actors */
            return name;
        }
        /* Some actors have multiple different names. We do not support this (TODO support) */
        var nameActorSet;
        if (eventActor.actorInRole.actor.nameActorSet instanceof Array) {
            nameActorSet = eventActor.actorInRole.actor.nameActorSet[0];
        } else {
            nameActorSet = eventActor.actorInRole.actor.nameActorSet;
        }
        var appellationValue = nameActorSet.appellationValue;
        if (!appellationValue instanceof Array) {
            appellationValue = [appellationValue];
        }
        for (var i = 0; i < appellationValue.length; i++) {
            var actor_name = nameActorSet.appellationValue[i];
            if (actor_name.pref == 'preferred') {
                name = actor_name.value;
                break;
            }
        }
    }
    return name;
};

/**
 * Function to get what the provider sees as the display title for the event.
 * eventPart.displayEvent may be an array, if so: check the xml:lang tag for the English title (xml:lang=en)
 * If eventPart.displayEvent is unset, use eventSet.event.eventType (via this.getEventType(eventPart))
 * @param eventPart
 * @return String
 */
LIDOEvents.prototype.getEventDisplay = function(eventPart){
    var display_event = '';
    if (!eventPart.hasOwnProperty('displayEvent')) {
        /* No display Event */
        display_event = this.getEventType(eventPart);
    } else {
        if (eventPart.displayEvent instanceof Array) {
            display_event = this.helper.getPropertyByLang(eventPart.displayEvent, 'en');
        } else {
            display_event = eventPart.displayEvent.value;
        }
    }
    return display_event;
};

/**
 * Function to get the date of the event (eventDate-part of event object)
 * Returns eventDate.displayDate if set, else a concat of eventDate.date.earliestDate '-' eventDate.date.latestDate
 * @param eventPart
 * @return String
 */
LIDOEvents.prototype.getEventDate = function(eventPart) {
    var event = eventPart.event;
    var event_date = '';
    if (!event.hasOwnProperty('eventDate')) {
        /* Has no date */
        return event_date;
    }
    if (event.eventDate.hasOwnProperty('displayDate')) {
        if (event.eventDate.displayDate instanceof Array) {
            event_date = this.helper.getPropertyByLang(event.eventDate.displayDate, 'en');
        } else {
            event_date = event.eventDate.displayDate.value;
        }
    } else {
        if (!event.eventDate.hasOwnProperty('date')) {
            /* Has no date-object, thus no dates */
            return event_date;
        }
        var dates = [];
        if (event.eventDate.date.hasOwnProperty('earliestDate')) {
            dates.push(event.eventDate.date.earliestDate.value);
        }
        if (event.eventDate.date.hasOwnProperty('latestDate')) {
            dates.push(event.eventDate.date.latestDate.value);
        }
        /* Concat dates with a ' - ' in between; this prevents some ugly string logic when one of the dates is not set */
        event_date = dates.join(' - ');
    }
    return event_date;
};

/**
 * Get the type of the event.
 * event.eventType.term.value
 * @param eventPart
 * @return String
 */
LIDOEvents.prototype.getEventType = function(eventPart) {
    var event = eventPart.event;
    var type = '';
    if (!event.hasOwnProperty('eventType')) {
        /* No type */
        return type;
    }
    if (event.eventType.term instanceof Array) {
        type = this.helper.getPropertyByLang(event.eventType.term, 'en');
    } else {
        type = event.eventType.term.value;
    }
    return type;
};

/**
 * Get the period during which the event took place.
 * eventPart.event.periodName.term.value; Both periodName and term are repeatable
 * For every periodName, get the value of the lang == en term
 * Concat all periodNames into one list with '-' for separator
 * @param eventPart
 * @return String
 */
LIDOEvents.prototype.getEventPeriod = function(eventPart) {
    var period = '';
    var event = eventPart.event;
    var periods = [];
    if (!event.hasOwnProperty('periodName')) {
        /* No period name */
        return period;
    }
    if (event.periodName instanceof Array) {
        for (var i = 0; i < event.periodName.length; i++) {
            var eventPeriod = event.periodName[i];
            if (eventPeriod.term instanceof Array) {
                periods.push(this.helper.getPropertyByLang(eventPeriod.term, 'en'));
            } else {
                periods.push(eventPeriod.term.value);
            }
        }
        /* Concat */
        period = periods.join(' - ');
    } else {
        if (event.periodName.term instanceof Array) {
            period = this.helper.getPropertyByLang(event.periodName.term, 'en');
        } else {
            period = event.periodName.term.value;
        }
    }
    return period;
};

