angular.module('items', ['ngResource'])

.factory('Item', function ($resource) {
	var Item = $resource(
		'/1.0/items/:ID',
		{},
		{
			update: { method: 'PUT', params:{ ID: '@ID' } }
		}
	);

	return Item;
})

.controller('SubmitItemCtrl', function($scope, Item) {
	$scope.items = Item.query();

	$scope.pushItem = function() {
		Item.save($scope.newItem,
			function(builtItem) {
				$scope.items.push(builtItem);
			},
			function(e) {
				console.log(e);
			}
		);

		$scope.newItem = {Type:"", AuthorID:null};
	};

	$scope.getItem = function() {
		Item.get($scope.newItem,
			function(gotItem) {
				$scope.theItem = gotItem;
			},
			function(e) {
				console.log(e);
			}

		);
		$scope.newItem = {ID:null};
	};

	$scope.setUpdateItem = function(item) {
		$scope.updateItem = {ID:item.ID, AuthorID:item.AuthorID, Type: item.Type};
	};

	$scope.putItem = function() {
		Item.update($scope.updateItem,
			function(updatedItem) {
				var index = 0;
				angular.forEach(
					$scope.items,
					function(value, key){
						if(value.ID == updatedItem.ID) {
							index = key;
						}
					}
				);
				$scope.items[index] = updatedItem;
			},
			function(e) {
				console.log(e);
			}
		);

		$scope.updateItem = {Type:"", ID:null, AuthorID:null};
	};

	$scope.deleteItem = function(item) {
		Item.remove({ID: item.ID},
			function() {
				var index = 0;
				angular.forEach(
					$scope.items,
					function(value, key){
						if(value.ID == item.ID) {
							index = key;
						}
					}
				);
				$scope.items.remove(index);
			},
			function(e) {
				console.log(e);
			}
		);
	};
})

.directive('submitItem', function(Item) {
	return {
		restrict: 'E',
		scope: {
			ItemID: "@"
		},
		templateUrl: '/template/submit-item.html',
		controller: 'SubmitItemCtrl',
		link: function(scope, element, attrs) {

		}
	};
});