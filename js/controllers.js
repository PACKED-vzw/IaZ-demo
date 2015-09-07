var app = angular.module ('simpleCollectionView',
    ['simpleCollectionView.services', 'simpleCollectionView.model', 'simpleCollectionView.lido', 'simpleCollectionView.qi',
        'ngRoute', 'infinite-scroll']);

app.config (['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when ('/search/lunden', {
        controller: 'lundenCtrl',
        templateUrl: '/view/list.html'
    }).when ('/search/qi', {
        controller: 'qiSearchCtrl',
        templateUrl: 'view/list.html'
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

app.controller ('lundenCtrl', ['$scope', 'LundenList', function($scope, LundenList) {
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
}]);

app.controller ('qiSearchCtrl', ['$scope', function($scope) {

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
            $scope.events = qiDisplay.exportItem.events;
            $scope.chunked = $scope.chunk($scope.events, 3);
        });
    }
]);