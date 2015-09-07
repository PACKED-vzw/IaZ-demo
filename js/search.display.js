/**
 * Created by pieter on 7/09/15.
 */

var SearchDisplay = function() {

};

/**
 * Divide i_array into chunks of size c_size and return the chunks in an array.
 * @param i_array
 * @param c_size
 * @returns {Array}
 */
SearchDisplay.prototype.chunk = function(i_array, c_size) {
    var a = [];
    for (var i = 0; i < i_array.length; i += c_size) {
        a.push (i_array.slice (i, i + c_size));
    }
    return a;
};
