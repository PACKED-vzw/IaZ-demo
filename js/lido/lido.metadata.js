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
    this.collections = this.getCollections(this.objectClassificationWrap);
    this.title = this.getTitle(this.objectIdentificationWrap);
    this.object_type = this.getObjectType(this.objectClassificationWrap);
    this.measurements = this.getMeasurements(this.objectIdentificationWrap);
    this.repository = this.getRepository(this.objectIdentificationWrap);
    this.subjects = this.getSubjects(this.objectRelationWrap);
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
 * If no title as found, use record.lidoRecID.value (via this.getID)
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
    if (this.helper.is_array(titleSet)) {
        titleSet = titleSet[0];
    }
    var appellationValue = titleSet.appellationValue;
    if (!this.helper.is_array(appellationValue)) {
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

/**
 * Get a list of types (objectWorkType).
 * Types are in objectClassificationWrap.objectWorkTypeWrap.objectWorkType.term.value
 * objectWorkType and term are repeatable
 * @param objectClassificationWrap
 * @returns {Array}
 */
LIDOMetadata.prototype.getObjectType = function(objectClassificationWrap) {
    var types = [];
    if (!objectClassificationWrap.hasOwnProperty('objectWorkTypeWrap')) {
        return types;
    }
    if (!objectClassificationWrap.objectWorkTypeWrap.hasOwnProperty('objectWorkType')) {
        return types;
    }
    var objectWorkType = objectClassificationWrap.objectWorkTypeWrap.objectWorkType;
    if (!this.helper.is_array(objectWorkType) || !objectWorkType instanceof Array) {
        /* The result is an array, so it's easier of we convert the source to an array as well */
        objectWorkType = [objectWorkType];
    }
    for (var i = 0; i < objectWorkType.length; i++) {
        var type = objectWorkType[i];
        var concept = '';
        if (type.term instanceof Array) {
            concept = this.helper.getPropertyByLang(type.term, 'en');
        } else {
            concept = type.term.value;
        }
        types.push(concept);
    }
    return types;
};

/**
 * Return the measurements of an object. The measurements are either in objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet.displayObjectMeasurements
 * or not. If they aren't, we create nice strings out of objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet.measurementsSet.measurementType/Unit/Value
 * Everything below objectMeasurementsWrap is repeatable
 * @param objectIdentificationWrap
 * @returns {string}
 */
LIDOMetadata.prototype.getMeasurements = function(objectIdentificationWrap) {
    var measurements = '';
    var a_measurements = [];
    if (!objectIdentificationWrap.hasOwnProperty('objectMeasurementsWrap')) {
        return measurements;
    }
    if (!objectIdentificationWrap.objectMeasurementsWrap.hasOwnProperty('objectMeasurementsSet')) {
        return measurements;
    }
    /* objectmeasurementsset is repeatable */
    var objectMeasurementsSet = [];
    if (!objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet instanceof Array || !this.helper.is_array(objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet)) {
        objectMeasurementsSet.push(objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet);
    } else {
        objectMeasurementsSet = objectIdentificationWrap.objectMeasurementsWrap.objectMeasurementsSet;
    }
    for (var i = 0; i < objectMeasurementsSet.length; i++) {
        /*
        If there is a displayObjectMeasurements, use that one; else concat the different elements in objectMeasurements
        like this: measurementsSet.measurementValue .measurementUnit (.measurementType)
         */
        if (objectMeasurementsSet[i].hasOwnProperty('displayObjectMeasurements')) {
            if (this.helper.is_array(objectMeasurementsSet[i].displayObjectMeasurements)) {
                a_measurements.push(this.helper.getPropertyByLang(objectMeasurementsSet[i].displayObjectMeasurements, 'en'));
            } else {
                a_measurements.push(objectMeasurementsSet[i].displayObjectMeasurements.value);
            }
        } else {
            var objectMeasurements = objectMeasurementsSet[i];
            if (!objectMeasurements.hasOwnProperty('measurementsSet')) {
                /* Exit this run when no measurementsSet (=containing the measurements) could be found */
                continue;
            }
            for (var j = 0; j < objectMeasurements.measurementsSet.length; j++) {
                var type = objectMeasurements.measurementsSet[j].measurementType;
                var unit = objectMeasurements.measurementsSet[j].measurementUnit;
                var value = objectMeasurements.measurementsSet[j].measurementValue;
                if (this.helper.is_array(type)) {
                    type = this.helper.getPropertyByLang(type, 'en');
                } else {
                    type = type.value;
                }
                if (this.helper.is_array(unit)) {
                    unit = this.helper.getPropertyByLang(unit, 'en');
                } else {
                    unit = unit.value;
                }
                if (this.helper.is_array(value)) {
                    value = this.helper.getPropertyByLang(value, 'en');
                } else {
                    value = value.value;
                }
                a_measurements.push(value + ' ' + unit + ' (' + type + ')');
            }
        }
    }
    /* Now concat a_measurements into a single string, cause that's what we expect */
    measurements = a_measurements.join('; ');
    return measurements;
};

/**
 * Return the name of the repository in objectIdentificationWrap.repositoryWrap.repositorySet.repositoryName.legalBodyName.appellationValue
 * There can be multiple repositorySets; pick the one that has a type-attribute that equals "current"
 * legalBodyName is repeatable, but we can't know which one to choose, so we pick the first one.
 * @param objectIdentificationWrap
 * @returns {string}
 */
LIDOMetadata.prototype.getRepository = function(objectIdentificationWrap) {
    var repository = '';
    if (!objectIdentificationWrap.hasOwnProperty('repositoryWrap')) {
        return repository;
    }
    var repositories = [];
    if (!this.helper.is_array(objectIdentificationWrap.repositoryWrap.repositorySet)) {
        repositories.push(objectIdentificationWrap.repositoryWrap.repositorySet);
    } else {
        repositories = objectIdentificationWrap.repositoryWrap.repositorySet;
    }
    for (var i = 0; i < repositories.length; i++) {
        var repositorySet = repositories[i];
        if (repositorySet.type == 'current') {
            if (!repositorySet.hasOwnProperty('repositoryName')) {
                return repository;
            }
            if (!repositorySet.repositoryName.hasOwnProperty('legalBodyName')) {
                return repository;
            }
            var legalBodyName = repositorySet.repositoryName.legalBodyName;
            if (this.helper.is_array(legalBodyName)) {
                /*
                 While the standard supports multiple names for the same institution, it does not provide a way
                 to know which one to use. So we simply take the first.
                 */
                legalBodyName = legalBodyName[0];
            }
            if (this.helper.is_array(legalBodyName.appellationValue)) {
                repository = this.helper.getPropertyByLang(legalBodyName.appellationValue, 'en');
            } else {
                repository = legalBodyName.appellationValue.value;
            }
            break;
        }
    }
    return repository;
};

/**
 * Return a list of subjects.
 * Subjects are in objectRelationWrap.subjectWrap.subjectSet; either as a (single) displaySubject, or as
 * a list of subjectConcepts ("structured subjects" - usually referenced to external sources).
 * We prefer displaySubject if it exists, else we return all the subjectConcepts
 * @param objectRelationWrap
 * @returns {Array}
 */
LIDOMetadata.prototype.getSubjects = function(objectRelationWrap) {
    var subjects = [];
    if (!objectRelationWrap.hasOwnProperty('subjectWrap')) {
        return subjects;
    }
    var subjectSet = [];
    if (!this.helper.is_array(objectRelationWrap.subjectWrap.subjectSet)) {
        subjectSet.push(objectRelationWrap.subjectWrap.subjectSet);
    } else {
        subjectSet = objectRelationWrap.subjectWrap.subjectSet;
    }
    for (var i = 0; i < subjectSet.length; i++) {
        /* Use the displaySubject if it exists; else merge the list of .subject with subjects */
        if (subjectSet[i].hasOwnProperty('displaySubject')) {
            if (this.helper.is_array(subjectSet[i].displaySubject)) {
                subjects.push(this.helper.getPropertyByLang(subjectSet[i].displaySubject, 'en'));
            } else {
                subjects.push(subjectSet[i].displaySubject.value);
            }
            continue;
        }
        /*
        subject may have many child-tags; however, we are only interested in "keywords", which are subjectConcept
         */
        if (!subjectSet[i].subject.hasOwnProperty('subjectConcept')) {
            continue;
        }
        var subjectConcept = [];
        if (!this.helper.is_array(subjectSet[i].subject.subjectConcept)) {
            subjectConcept.push(subjectSet[i].subject.subjectConcept);
        } else {
            subjectConcept = subjectSet[i].subject.subjectConcept
        }
        for (var j = 0; j < subjectConcept.length; j++) {
            if (this.helper.is_array(subjectConcept[j].term)) {
                subjects.push(this.helper.getPropertyByLang(subjectConcept[j].term, 'en'));
            } else {
                subjects.push(subjectConcept[j].term.value);
            }
        }
    }
    return subjects;
};

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
