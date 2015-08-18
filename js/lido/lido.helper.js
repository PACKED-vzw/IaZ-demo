/**
 * Created by pieter on 6/08/15.
 */

var LIDOHelper = function() {
    /**
     * Class of various helper functions that are used by .metadata and .events
     */
};

/**
 * Get a specific property from a list of properties.
 * The property itself is an object with a .lang tag and a .value tag.
 * If the .lang tag matches lang, value == .value.
 * If value == ''; return first .value regardless of .lang
 * @param propertyArray
 * @param lang
 * @return String
 */
LIDOHelper.prototype.getPropertyByLang = function(propertyArray, lang) {
    var value = '';
    for (var i = 0; i < propertyArray.length; i++) {
        var property = propertyArray[i];
        if (property.hasOwnProperty('lang')) {
            if (property.lang == lang) {
                value = property.value;
                break;
            }
        }
    }
    if (value == '') {
        /* This means that either property has no .lang-property OR no .lang == lang was found */
        value = propertyArray[0].value;
    }
    return value;
};

/**
 * Check whether the object o is an array
 * From http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 * @param o
 * @returns {boolean}
 */
LIDOHelper.prototype.is_array = function(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
};
