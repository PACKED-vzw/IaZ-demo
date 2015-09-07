/**
 * Created by pieter on 23/04/15.
 */

/**
 * Divide an array in arrays of cSize (last array contains the remainder if a.length % cSize != 0)
 * @param cSize
 * @returns {Array}
 */
Array.prototype.chunk = function (cSize) {
    var a = [];
    for (var i = 0; i < this.length; i += cSize) {
        a.push (this.slice (i, i + cSize));
    }
    return a;
};

var services = angular.module ('simpleCollectionView.services', ['ngResource']);

services.factory ('Item', ['$resource',
    function ($resource) {
        var LazyItem = function (id) {
            this.id = id;
            this.url = 'lazy_api/api.php?url=' + encodeURIComponent ('http://www.vam.ac.uk/api/json/museumobject/' + id);
            this.resource = $resource (this.url);
        };
        return LazyItem;
    }
]);

services.factory ('Collection', ['$resource',
    function ($resource) {
        var url = 'lazy_api/api.php?url=' + encodeURIComponent ('http://www.vam.ac.uk/api/json/museumobject/search?q=:q&images=1');
        return $resource (url, {q: '@q'});
    }
]);

services.factory ('QiObject', ['$resource',
    function ($resource) {
        var QiObject = function (id) {
            this.id = id;
            this.url = 'lazy_api/api.php?url=' + encodeURIComponent('https://zilver.qi-cms.com/api/get/object/id/' + this.id);
            //this.url = 'file.php';
            this.resource = $resource(this.url);
        };
        return QiObject;
    }
]);

/**
 * Return the acquisition object corresponding to the Lunden collection.
 */
services.factory ('LundenList', ['$resource',
    function($resource) {
        var LundenList = function() {
            this.url = 'lazy_api/api.php?url=' + encodeURIComponent('https://zilver.qi-cms.com/api/get/acquisition/id/346');
            this.resource = $resource(this.url);
        };
        return LundenList;
    }
]);
