var app = angular.module ('simpleCollectionView',
    ['simpleCollectionView.services', 'simpleCollectionView.lido', 'simpleCollectionView.qi',
        'ngRoute', 'infinite-scroll']);

app.config (['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when ('/search/lunden', {
        controller: 'lundenCtrl',
        templateUrl: '/view/list.html'
    }).when('/qi/item/:id', {
            templateUrl: 'view/qi.html',
            controller: 'QiCtrl'
        }
    ).when('/intro', {
            templateUrl: 'view/intro.html',
            controller: 'introCtrl'
        }
    ).when('/yale/:id', {
            templateUrl: 'view/yale.html',
            controller: 'YaleCtrl'
        }
    ).when('/cors-qi/item/:id', {
            templateUrl: 'view/qi.html',
            controller: 'QiCorsCtrl'
        }
    ).when('/backup/:id', {
            templateUrl: 'view/qi.html',
            controller: 'QiBackupCtrl'
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
        $scope.home = true;
    }
]);

app.controller ('introCtrl', ['$scope',
    function ($scope) {

    }
]);

app.controller ('QiBackupCtrl', ['$scope', 'QiDisplay', 'QiBackupObject', '$route',
    function ($scope, QiDisplay, QiBackupObject, $route) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        var qi = new QiBackupObject ($route.current.params.id);
        $scope.qi = qi.resource.get();
        $scope.qi.$promise.then (function (data) {
            var qiDisplay = new QiDisplay (data.records[0]);
            $scope.item = qiDisplay.exportItem;
            console.log($scope.item);
            $scope.events = qiDisplay.exportItem.events;
            $scope.chunked = $scope.chunk($scope.events, 3);
        });
    }
]);

app.controller ('QiCorsCtrl', ['$scope', 'QiDisplay', 'QiCorsObject', '$route',
    function ($scope, QiDisplay, QiCorsObject, $route) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        var qi = new QiCorsObject ($route.current.params.id);
        $scope.qi = qi.resource.get();
        $scope.qi.$promise.then (function (data) {
            var qiDisplay = new QiDisplay (data.records[0]);
            $scope.item = qiDisplay.exportItem;
            console.log($scope.item);
            $scope.events = qiDisplay.exportItem.events;
            $scope.chunked = $scope.chunk($scope.events, 3);
        });
    }
]);
app.controller ('lundenCtrl', ['$scope', 'LundenList', 'QiObject', function($scope, LundenList, QiObject) {
    var sd = new SearchDisplay();
    var list = new LundenList();
    $scope.list = list.resource.get();
    $scope.list.$promise.then(function(data) {
        /* data is the object of a acquisition. Acquisitions are linked to objects via object_acquisition in
        relationship. As we only have one acquisition record in this call, we use the first item in the
        records attribute. */
        var object_list = new QiList(data.records[0].relationship.object_acquisition);
        var result_list = object_list.items;
        $scope.pages = sd.chunk(result_list, 100);
        var first_page = $scope.pages.shift();
        $scope.chunked = sd.chunk(first_page, 4);
    });
    /**
     * This function implements "smooth scrolling". The result from the API is divided in pages of 100 items each.
     * When loading the page, only one page is loaded. When the user reaches the end of the page, the following
     * page is loaded.
     */
    $scope.loadMore = function() {
        if (!$scope.chunked) {
            return;
        }
        if ($scope.pages.length == 0) {
            return;
        }
        var page = $scope.pages.shift();
        page = sd.chunk(page, 4);
        for (var i = 0; i < page.length; i++) {
            $scope.chunked.push(page[i]);
        }
    };
    /**
     * This function returns the link to the image corresponding to the search result record.
     * It does this by executing an API call for the metadata of the object, and then
     * passing it through QiImage to get the image. It sets $scope.img_link
     * (disabled 'cause it's slow)
     * @param id
     */
    $scope.qi_image = function(id) {
        var qi = new QiObject(id);
        $scope.qi = qi.resource.get();
        $scope.qi.$promise.then(function(data) {
            var QiImage = new QiImage(data);
            $scope.img_link = QiImage.img;
        });
    };
}]);

app.controller ('QiCtrl', ['$scope', 'QiDisplay', 'QiObject', '$route',
    function ($scope, QiDisplay, QiObject, $route) {
        $scope.chunk = function (array, cSize) {
            var a = [];
            for (var i = 0; i < array.length; i += cSize) {
                a.push (array.slice (i, i + cSize));
            }
            return a;
        };
        var qi = new QiObject ($route.current.params.id);
        $scope.qi = qi.resource.get();
        $scope.qi.$promise.then (function (data) {
            var qiDisplay = new QiDisplay (data.records[0]);
            $scope.item = qiDisplay.exportItem;
            console.log($scope.item);
            $scope.events = qiDisplay.exportItem.events;
            $scope.chunked = $scope.chunk($scope.events, 3);
        });
    }
]);

app.controller ('YaleCtrl', ['$scope', 'LIDODisplay', 'YaleObject', '$route',
    function ($scope, LIDODisplay, YaleObject, $route) {
        var y = new YaleObject ($route.current.params.id);
        $scope.i = y.resource.get();
        $scope.i.$promise.then (function (data) {
            var lidoDisplay = new LIDODisplay (data);
            lidoDisplay.formatDisplay();
            lidoDisplay.exportData();
            $scope.item = lidoDisplay.exportItem;
            $scope.events = $scope.item.events;
        });
    }
]);
