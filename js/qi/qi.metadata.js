/**
 * Created by pieter on 16/07/15.
 */
var QiMetadata = function (record) {
    this.record = record;
};

/**
 * Get a list of titles from a record; there can be multiple titles; if so; return the ones that are in "nederlands" (Dutch) (language_id_name)
 * @returns {Array}
 */
QiMetadata.prototype.getTitle = function () {
    var arrayTitles = this.record.relationship.object_title;
    if (!arrayTitles instanceof Array) {
        arrayTitles = [arrayTitles];
    }
    var returnTitles = [];
    if (typeof(arrayTitles) == 'undefined') {
        return returnTitles;
    }
    if (arrayTitles.length == 1) {
        /* We have no choice */
        returnTitles.push(String(arrayTitles[0].details.name));
        return returnTitles;
    }
    for (var i = 0; i < arrayTitles.length; i++) {
        var objectTitle = arrayTitles[i];
        if (typeof (objectTitle.details.language_id_name) != 'undefined' && objectTitle.details.language_id_name.toLocaleLowerCase() == 'nederlands') {
            /* If we have a Dutch hoofdtitel, add it */
            returnTitles.push(String(objectTitle.details.name));
        }
    }
    return returnTitles;
};

/**
 * Get a list of descriptions; only return the descriptions that are in "nederlands" (language_id_name)
 * @returns {Array}
 */
QiMetadata.prototype.getDescription = function () {
    var returnDescriptions = [];
    var arrayDescriptions = this.record.relationship.object_description;
    if (typeof(arrayDescriptions) == 'undefined') {
        return returnDescriptions;
    }
    if (!arrayDescriptions instanceof Array) {
        arrayDescriptions = [arrayDescriptions];
    }
    if (arrayDescriptions.length == 1) {
        returnDescriptions.push(String(arrayDescriptions[0].details.name));
        return returnDescriptions;
    }
    for (var i = 0; i < arrayDescriptions.length; i++) {
        var objectDescription = arrayDescriptions[i];
        if (typeof(objectDescription.details.language_id_name) != 'undefined' && objectDescription.details.language_id_name.toLocaleLowerCase() == 'nederlands') {
            returnDescriptions.push(String(objectDescription.details.name));
        }
    }
    return returnDescriptions;
};


/**
 Function to get a single value directly (no interpretation) from an attribute (param)
 @param objectAttribute
 @return object|string|array\int|null
 */
QiMetadata.prototype.getValueDirectly = function (objectAttribute) {
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