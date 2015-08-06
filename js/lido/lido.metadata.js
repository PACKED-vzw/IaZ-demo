/**
 * Created by pieter on 6/08/15.
 */

var LIDOMetadata = function(record) {
    /**
     * This class will extract from a single LIDO JSON record the following metadata (as one object):
     *  {
     *      collections: Array - descriptiveMetadata.objectClassificationWrap.classificationWrap.classification
     *          where collection in collections = {name: foo, link: bar}
     *      title: String - descriptiveMetadata.objectIdentificationWrap.titleWrap.titleSet
     *      object_type: Array - descriptiveMetadata.objectClassificationWrap.objectWorkTypeWrap.objectWorkType
     *      measurements: String - descriptiveMetadata.objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet
     *      repository: String - descriptiveMetadata.objectIdentificationWrap.repositoryWrap.repositorySet
     *      subjects: Array - descriptiveMetadata.objectRelationWrap.subjectWrap.subjectSet.subject.subjectConcept
     *  }
     */
    this.helper = new LIDOHelper();
    this.record = record;
    this.objectClassificationWrap = this.getObjectClassificationWrap(record);
    this.objectIdentificationWrap = this.getObjectIdentificationWrap(record);
    this.objectRelationWrap = this.getObjectRelationWrap(record);
};

/**
 * Function to get the objectClassificationWrap property
 * @param record
 * @return Object
 */
LIDOMetadata.prototype.getObjectClassificationWrap = function(record) {
    var objectClassificationWrap = {};
    if (!record.hasOwnProperty('descriptiveMetadata')) {
        /* No descriptive metadata */
        return objectClassificationWrap;
    }
    if (!record.descriptiveMetadata.hasOwnProperty('objectClassificationWrap')) {
        /* No objectClassificationWrap */
        return objectClassificationWrap;
    } else {
        objectClassificationWrap = record.descriptiveMetadata.objectClassificationWrap;
    }
    return objectClassificationWrap;
};

/**
 * Function to get the objectIdentificationWrap property
 * @param record
 * @return Object
 */
LIDOMetadata.prototype.getObjectIdentificationWrap = function(record) {
    var objectIdentificationWrap = {};
    if (!record.hasOwnProperty('descriptiveMetadata')) {
        /* No descriptive metadata */
        return objectIdentificationWrap;
    }
    if (!record.descriptiveMetadata.hasOwnProperty('objectIdentificationWrap')) {
        /* No objectIdentificationWrap */
        return objectIdentificationWrap;
    } else {
        objectIdentificationWrap = record.descriptiveMetadata.objectIdentificationWrap;
    }
    return objectIdentificationWrap;
};

/**
 * Function to get the objectRelationWrap property
 * @param record
 * @return Object
 */
LIDOMetadata.prototype.getObjectRelationWrap = function(record) {
    var objectRelationWrap = {};
    if (!record.hasOwnProperty('descriptiveMetadata')) {
        /* No descriptive metadata */
        return objectRelationWrap;
    }
    if (!record.descriptiveMetadata.hasOwnProperty('objectRelationWrap')) {
        /* No objectRelationWrap */
        return objectRelationWrap;
    } else {
        objectRelationWrap = record.descriptiveMetadata.objectRelationWrap;
    }
    return objectRelationWrap;
};

/**
 * Get a list of collections for a record.
 * Returns an array of collection objects of the form:
 *  {
 *      name: descriptiveMetadata.objectClassificationWrap.classificationWrap.classification.term.value
 *      link: .name in an URL-resolvable form
 *  }
 * @param objectClassificationWrap
 * @return Array
 */
LIDOMetadata.prototype.getCollections = function(objectClassificationWrap) {
    var collections = [];
    var name = '';
    var link = '';
    if (!objectClassificationWrap.hasOwnProperty('classificationWrap')) {
        /* No classification wrap */
        return collections;
    }
    if (!objectClassificationWrap.classificationWrap.hasOwnProperty('classification')) {
        /* No classification objects */
        return collections;
    }
    var classification = objectClassificationWrap.classificationWrap.classification;
    /*
    The standard supports multiple classifications.
     */
    if (classification instanceof Array) {
        /* Multiple classifications */
        for (var i = 0; i < classification.length; i++) {
            name = '';
            if (classification[i].term instanceof Array) {
                name = this.helper.getPropertyByLang(classification[i].term, 'en');
            } else {
                name = classification[i].term.value;
            }
            link = encodeURIComponent(name);
            collections.push({
                name: name,
                link: link
            });
        }
    } else {
        /* Only one classification */
        if (classification.term instanceof Array) {
            /*
            There might be different terms according to language
             */
            name = this.helper.getPropertyByLang(classification.term, 'en');
        } else {
            name = classification.term.value;
        }
        link = encodeURIComponent(name);
        collections.push({
            name: name,
            link: link
        });
    }
    return collections;
};

/**
 * Function to return the title.
 * Titles are in objectIdentificationWrap.titleWrap.titleSet.appellationValue.value where pref == preferred
 * titleSet and appellationValue are repeatable
 * However, we do not support multiple titleSets (TODO fix)
 * If no title as found, use record.lidoRecID.value (via this.getID
 * @param objectIdentificationWrap
 * @return String
 */
LIDOMetadata.prototype.getTitle = function(objectIdentificationWrap) {
    var title = this.getID(this.record);
    if (!objectIdentificationWrap.hasOwnProperty('titleWrap')) {
        return title;
    }
    if (!objectIdentificationWrap.titleWrap.hasOwnProperty('titleSet')) {
        return title;
    }
    var titleSet = objectIdentificationWrap.titleWrap.titleSet;
    if (titleSet instanceof Array) {
        titleSet = titleSet[0];
    }
    var appellationValue = titleSet.appellationValue;
    if (!appellationValue instanceof Array) {
        appellationValue = [appellationValue];
    }
    for (var i = 0; i < appellationValue.length; i++) {
        var local_title = appellationValue[i];
        if (local_title.pref == 'preferred') {
            title = local_title.value;
            break;
        }
    }
    return title;
};
/*LIDODisplay.prototype.getTypes = function (objectWorkType) {
 if (typeof (objectWorkType) == 'undefined') {
 return [];
 }
 var list = [];
 for (var i = 0; i < objectWorkType.length; i++) {
 list = list.concat (this.getTypeFromList (objectWorkType[i]));
 }
 return list;
 };
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
};*/
LIDOMetadata.prototype.getObjectType = function(record) {};

LIDOMetadata.prototype.getMeasurements = function(record) {};

LIDOMetadata.prototype.getRepository = function(record) {};

LIDOMetadata.prototype.getSubjects = function(record) {};

/**
 * Function to get the ID of this record.
 * ID is in record.lidoRecID.value
 * lidoRecID is repeatable; use either pref == 'preferred' or type == 'local'
 * If neither of those attributes is set, use the first we can find.
 * @param record
 * @return String
 */
LIDOMetadata.prototype.getID = function(record) {
    var lido_rec_id = '';
    if (!record.hasOwnProperty('lidoRecID')) {
        /* No RECID */
        return lido_rec_id;
    }
    if (record.lidoRecId instanceof Array) {
        for (var i = 0; i < record.lidoRecId.length; i++) {
            if (record.lidoRecId[i].hasOwnProperty('pref')) {
                if (record.lidoRecId[i].pref == 'preferred') {
                    lido_rec_id = record.lidoRecId[i].value;
                    break;
                }
            }
        }
        if (lido_rec_id == '') {
            /* There was either no .pref == 'preferred' or simply no .pref; use .type == 'local' */
            for (i = 0; i < record.lidoRecId.length; i++) {
                if (record.lidoRecId[i].hasOwnProperty('source')) {
                    if (record.lidoRecId[i].source == 'local') {
                        lido_rec_id = record.lidoRecId[i].value;
                        break;
                    }
                }
            }
            if (lido_rec_id == '') {
                /* Still no luck */
                lido_rec_id = record.lidoRecId[0].value;
            }
        }
    } else {
        lido_rec_id = record.lidoRecID.value;
    }
    return lido_rec_id;
};
