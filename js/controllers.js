var app = angular.module ('simpleCollectionView',
    ['simpleCollectionView.services', 'simpleCollectionView.model', 'ngRoute', 'infinite-scroll']);

app.config (['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when ('/search/:type', {
        controller: 'mainCtrl',
        templateUrl: '/view/main.html'
    }).when ('/item/:id', {
            controller: 'viewCtrl',
            resolve: {
                item: function (ItemLoader) {
                    return ItemLoader ();
                }
            },
            templateUrl: '/view/item.html'
    }).when ('/collection/:q', {
        controller: 'collectionCtrl',
        resolve: {
            collection: function (CollectionLoader) {
                return CollectionLoader ();
            }
        },
        templateUrl: '/view/collection.html'
    }).when ('/yale/:id', {
        controller: 'YaleCtrl',
        resolve: {
            YaleObject: function (YaleObjectLoader) {
                return YaleObjectLoader ();
            }
        },
        templateUrl: '/view/item.html'
    }).when ('/results/:term', {
        controller: 'resultCtrl',
        templateUrl: '/view/collection.html'
    })
}
]);

app.controller ('viewCtrl', ['$scope', 'item', 'ItemDisplay',
    function ($scope, item, ItemDisplay) {
        console.log ('view');
        item = item[0].fields; /* Returns an array of 1 item, data in fields */
        console.log (item);
        var itemDisplay = new ItemDisplay (item);
        itemDisplay.setIMG ();
        itemDisplay.setMetadata ();
        itemDisplay.exportData ();
        itemDisplay.getCollections ();
        $scope.item = itemDisplay.exportItem;
        console.log ($scope.item);
    }
]);

app.controller ('collectionCtrl', ['$scope', 'collection', 'CollectionDisplay',
    function ($scope, collection, CollectionDisplay) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        console.log ('collection');
        var collectionDisplay = new CollectionDisplay (collection);
        console.log (collection);
        collectionDisplay.getRecords ();
        collectionDisplay.exportData ();
        $scope.collection = collectionDisplay.exportCollection;
        $scope.chunked = $scope.chunk ($scope.collection.records, 4);
        console.log ($scope.chunked);
    }
]);

app.controller ('YaleCtrl', ['$scope',
    function ($scope) {

    }]);

app.controller ('resultCtrl', ['$scope', 'CollectionDisplay', 'VAMQuery', '$route',
    function ($scope, CollectionDisplay, VAMQuery, $route) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        $scope.collection = VAMQuery.get ({q: $route.current.params.term});
        $scope.collection.$promise.then (function (data) {
            var collectionDisplay = new CollectionDisplay (data);
            collectionDisplay.getRecords ();
            collectionDisplay.exportData ();
            $scope.pages = collectionDisplay.exportCollection.paginated;
            var start_list = $scope.pages.shift(); /* First page */
            $scope.chunked = $scope.chunk (start_list, 4);
        });
        $scope.loadMore = function () {
            if (!$scope.chunked) {
                console.log ('no data yet');
                return;
            }
            if ($scope.pages.length == 0) {
                return;
            }
            var list = $scope.pages.shift();
            list = $scope.chunk (list, 4);
            for (var i = 0; i < list.length; i++) {
                $scope.chunked.push (list[i]);
            }
            console.log ($scope.chunked);
        };
    }
]);

app.controller ('mainCtrl', ['$scope', '$location',
    function ($scope, $location) {
        console.log ('main');
        $scope.search = {
            term: ''
        };
        $scope.go = function (so) {
            $scope.search = angular.copy (so);
            window.location.href = '#/results/' + so.term;
        };
        $scope.reset = function () {
            $scope.so = angular.copy ($scope.search);
        };
        $scope.reset ();
        /* Creates search form & if type is va, uses collection view to show the results */
    }
]);