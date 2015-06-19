var app = angular.module ('simpleCollectionView',
    ['simpleCollectionView.services', 'simpleCollectionView.model', 'ngRoute']);

app.config (['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when ('/', {
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
        console.log ('collection');
        var collectionDisplay = new CollectionDisplay (collection);
        console.log (collection);
        collectionDisplay.getRecords ();
        collectionDisplay.exportData();
        $scope.collection = collectionDisplay.exportCollection;
    }
]);

app.controller ('YaleCtrl', ['$scope',
    function ($scope) {

    }]);

app.controller ('mainCtrl', ['$scope',
    function ($scope) {
        console.log ('main');
    }
]);