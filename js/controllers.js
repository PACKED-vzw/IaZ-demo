var app = angular.module ('simpleCollectionView',
    ['simpleCollectionView.services', 'simpleCollectionView.model', 'simpleCollectionView.lido', 'ngRoute', 'infinite-scroll']);

app.config (['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when ('/search/collection', {
        controller: 'mainCtrl',
        templateUrl: '/view/main.html'
    }).when ('/search/yale', {
        controller: 'yaleSearchCtrl',
        templateUrl: 'view/yalesearch.html'
    }).when ('/item/:id', {
            controller: 'viewCtrl',
            templateUrl: '/view/item.html'
    }).when ('/collection/:q', {
        controller: 'collectionCtrl',
        templateUrl: '/view/collection.html'
    }).when ('/yale/:id', {
        controller: 'YaleCtrl',
        templateUrl: '/view/yale.html'
    }).when ('/results/:term', {
        controller: 'resultCtrl',
        templateUrl: '/view/collection.html'
    }).when('/qi/item/:id', {
            templateUrl: 'view/qi.html',
            controller: 'QiCtrl'
        }
    ).when('qi/collections/:collection', {

        }
    ).when ('/', {
        templateUrl: 'view/index.html',
        controller: 'indexCtrl'
    }).otherwise ({
        redirectTo: '/'
    });
}
]);

app.controller ('indexCtrl', ['$scope',
    function ($scope) {

    }
]);

app.controller ('yaleSearchCtrl', ['$scope',
    function ($scope) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        var list = [];
        for (var i = 100; i <= 900; i++) {
            list.push ({
                id: 'oai:tms.ycba.yale.edu:' + i
            });
        }
        $scope.chunked = $scope.chunk (list, 4);
    }
]);

app.controller ('viewCtrl', ['$scope', 'ItemDisplay', 'Item', '$route',
    function ($scope, ItemDisplay, Item, $route) {
        var it = new Item ($route.current.params.id);
        $scope.it = it.resource.query ();
        $scope.it.$promise.then (function (data) {
            var item = data[0].fields;
            var itemDisplay = new ItemDisplay (item);
            itemDisplay.setIMG ();
            itemDisplay.setMetadata ();
            itemDisplay.exportData ();
            itemDisplay.getCollections ();
            $scope.item = itemDisplay.exportItem;
        });
    }
]);

app.controller ('collectionCtrl', ['$scope', 'CollectionDisplay', 'Collection', '$route',
    function ($scope, CollectionDisplay, Collection, $route) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        $scope.collection = Collection.get ({id: $route.current.params.q});
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
                return;
            }
            if ($scope.pages.length == 0) {
                return;
            }
            var list = $scope.pages.shift ();
            list = $scope.chunk (list, 4);
            for (var i = 0; i < list.length; i++) {
                $scope.chunked.push (list[i]);
            }
        };
    }
]);

app.controller ('QiCtrl', ['$scope', 'QiDisplay', 'QiObject', '$route',
    function ($scope, QiDisplay, QiObject, $route) {
        var qi = new QiObject ($route.current.params.id);
        $scope.qi = qi.resource.get();
        $scope.qi.$promise.then (function (data) {
            var QiDisplay = new QiDisplay (data.records[0]);
            $scope.item = QiDisplay.exportItem;
            $scope.events = QiDisplay.exportItem.events;
        });
    }
]);

app.controller ('YaleCtrl', ['$scope', 'LIDODisplay', 'YaleObject', '$route',
    function ($scope, LIDODisplay, YaleObject, $route) {
        var y = new YaleObject ($route.current.params.id);
        $scope.i = y.resource.get();
        $scope.i.$promise.then (function (data) {
            var lidoDisplay = new LIDODisplay (data);
            lidoDisplay.parseItem ();
            lidoDisplay.formatDisplay ();
            lidoDisplay.exportData ();
            console.log (lidoDisplay.item);
            console.log (lidoDisplay.exportItem);
            $scope.item = lidoDisplay.exportItem;
            $scope.events = $scope.item.events;
        });
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
                return;
            }
            if ($scope.pages.length == 0) {
                return;
            }
            var list = $scope.pages.shift ();
            list = $scope.chunk (list, 4);
            for (var i = 0; i < list.length; i++) {
                $scope.chunked.push (list[i]);
            }
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