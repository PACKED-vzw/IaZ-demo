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
        var url = 'lazy_api/api.php?url=' + encodeURI ('http://www.vam.ac.uk/api/json/museumobject/:id');
        return $resource (url, {id: '@id'});
    }
]);

services.factory ('Collection', ['$resource',
    function ($resource) {
        var url = 'lazy_api/api.php?url=' + encodeURI ('http://www.vam.ac.uk/api/json/museumobject/search?q=:q&images=1');
        return $resource (url, {q: '@q'});
    }
]);

services.factory ('YaleObject', ['$resource',
    function ($resource) {
        var url = 'lido_api/api.php?r=' + encodeURI ('http://collections.britishart.yale.edu/oaicatmuseum/OAIHandler?verb=GetRecord&identifier=:i&metadataPrefix=lido') + '&format=json&remote_format=xml';
        return $resource (url, {i: '@i'});
    }]
);

services.factory ('VAMQuery', ['$resource',
    function ($resource) {
        var url = 'lazy_api/api.php?url=' + encodeURI ('http://www.vam.ac.uk/api/json/museumobject/search?q=:q&images=1');
        return $resource (url, {q: '@q'});
    }
]);

services.factory ('YaleObjectLoader', ['YaleObject', '$route', '$q',
    function (YaleObject, $route, $q) {
        return function () {
            var delay = $q.defer ();
            YaleObject.get ({i: $route.current.params.id}, function (YaleObject) {
                delay.resolve (YaleObject);
            }, function () {
                delay.reject ('Unable to fetch item '+ $route.current.params.id);
            }); /* lido_api returns object for single results; array for multiple */
            return delay.promise;
        }
    }
]);

services.factory ('ItemLoader', ['Item', '$route', '$q',
    function (Item, $route, $q) {
        return function () {
            var delay = $q.defer ();
            Item.query ({id: $route.current.params.id}, function (item) {
                delay.resolve (item);
            }, function () {
                delay.reject ('Unable to fetch item ' + $route.current.params.id);
            });
            return delay.promise;
        };
    }
]);

services.factory ('CollectionLoader', ['Collection', '$route', '$q',
    function (Collection, $route, $q) {
        return function () {
            var delay = $q.defer ();
            Collection.get ({id: $route.current.params.q}, function (collection) {
                delay.resolve (collection);
            }, function () {
                delay.reject ('Unable to fetch collection ' + $route.current.params.q);
            });
            return delay.promise;
        };
    }
]);