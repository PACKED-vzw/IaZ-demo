/**
 * Created by pieter on 7/09/15.
 */

/**
 * This class returns a list of (id, name)-pairs from a list (array) of objects (from a search result, but
 * works on any list of objects returned by the Qi API). These pairs will be used to display search
 * result pages.
 * @param result
 * @constructor
 */
var QiList = function(result){
    this.result = result;
    this.items = this.getItemList();
};

/**
 * Function that returns an array of (id, name)-pairs from a list of objects returned by the Qi API.
 * @returns {Array}
 */
QiList.prototype.getItemList = function() {
    var item_list = [];
    for (var i = 0; i < this.result.length; i++) {
        var single_object = this.singleObject(this.result[i]);
        if (single_object != null) {
            item_list.push(single_object);
        }
    }
    return item_list;
};

/**
 * Function that takes a single item in a QI result list and returns a (id, name)-pair.
 * @param qi_object
 * @returns {*}
 */
QiList.prototype.singleObject = function(qi_object) {
    var single_object = [];
    var id = qi_object.id;
    if (typeof(qi_object.target_id) != 'undefined') {
        /* If target_id exists, we have a list of items linked via a relationship. In that case target_id is the id
        of the object, not id. */
        id = qi_object.target_id;
    }
    if (typeof(id) == 'undefined' || id == '') {
        return null;
    }
    single_object.push(id);
    if (typeof(qi_object.name) == 'undefined' || qi_object.name == '') {
        single_object.push(id); /* Use ID as fallback */
    } else {
        single_object.push(qi_object.name);
    }
    return single_object;
};
