angular.module('items', ['ngResource', 'ui', 'ui.bootstrap', 'alerts', 'genericItem', 'rawItem', 'twitterItem'])

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

.factory('ItemCache', function ($rootScope, $timeout, Item) {
	function ItemCache() {
		var self = this;

		this.items = [];

		this.refresh = function() {
			Item.query(function(i) {
				self.items.length = 0;
				angular.forEach(i, function(val) {
					self.items.push(val);
				});
				$timeout(self.refresh, 500);
			});
		};

		this.refresh();

	}

	return new ItemCache();
})

.filter('filterByTerm', function() {
	return function(input, term) {
		if(term === "" || term === undefined) return input;
		var out = [];
		for(var i = 0;i < input.length;i++) {
			if(input[i].Terms !== undefined) {
				for(var j = 0;j < input[i].Terms.length;j++) {
					if(input[i].Terms[j].Term == term) out.push(input[i]);
				}
			}
		}
		return out;
	};
})

.controller('CreateItemCtrl', function($scope, Alerter, Item) {
	var defaultType = "";
	$scope.item = {Type: defaultType};

	$scope.debug = function() {
		console.log($scope.item);
	};

	$scope.createItem = function() {
		if($scope.item.StartTime !== undefined) $scope.item.StartTime = new Date($scope.item.StartTime);
		if($scope.item.StopTime !== undefined) $scope.item.StopTime = new Date($scope.item.StopTime);

		Item.save(
			$scope.item,
			function() {
				Alerter.success("Item Created", 2000);
				$scope.item = {Type: defaultType};
			},
			function(e) {
				Alerter.error("There was a problem creating the item. "+"Status:"+e.status+". Reply Body:"+e.data);
				console.log(e);
			}
		);
	};
})

.directive('createItem', function(Item) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '/template/items/create-item.html',
		controller: 'CreateItemCtrl',
		link: function(scope, element, attrs) {

		}
	};
})

.controller('UpdateItemCtrl', function($scope, Alerter, Item) {
	$scope.debug = function() {
		console.log($scope.item);
	};

	$scope.updateItem = function() {
		if($scope.item.StartTime !== undefined) $scope.item.StartTime = new Date($scope.item.StartTime);
		if($scope.item.StopTime !== undefined) $scope.item.StopTime = new Date($scope.item.StopTime);

		Item.update(
			$scope.item,
			function() {
				Alerter.success("Item Updated", 2000);
				$scope.cancel();
			},
			function(e) {
				if(e.status == 304) {
					Alerter.warn("Nothing was changed.", 2000);
					$scope.cancel();
				} else {
					Alerter.error("There was a problem updating the item. "+"Status:"+e.status+". Reply Body:"+e.data);
				}
				console.log(e);
			}
		);
	};

	$scope.deleteItem = function() {
		Item.remove(
			$scope.item,
			function() {
				Alerter.success("Item Deleted", 2000);
				$scope.cancel();
			},
			function(e) {
				Alerter.error("There was a problem deleting the item. "+"Status:"+e.status+". Reply Body:"+e.data);
				console.log(e);
			}
		);
	};

	$scope.cancel = function() {
		if($scope.dialog !== undefined) {
			$scope.dialog.close();
		}
	};
})

.directive('updateItem', function(Item) {
	return {
		restrict: 'E',
		scope: {
			item: "=",
			dialog: "="
		},
		templateUrl: '/template/items/update-item.html',
		controller: 'UpdateItemCtrl',
		link: function(scope, element, attrs) {

		}
	};
})

.controller('UpdateItemDialogCtrl', function($scope, item, dialog) {
	$scope.dialog = dialog;
	$scope.item = item;
})

.factory('updateItemDialog', function ($dialog) {
	return {
		open: function(item) {
			var d = $dialog.dialog({
				modalFade: false,
				backdrop: false,
				keyboard: true,
				backdropClick: false,
				resolve: {item: function() { return item; }},
				templateUrl: '/template/items/update-item-dialog.html',
				controller: 'UpdateItemDialogCtrl'
			});

			return d.open();
		}
	};
})

.controller('TileItemCtrl', function($scope) {

})

.directive('tileItem', function(Item) {
	return {
		restrict: 'E',
		scope: {
			item: "="
		},
		templateUrl: '/template/items/tile-item.html',
		controller: 'TileItemCtrl',
		link: function(scope, element, attrs) {

		}
	};
})

.controller('CloseupItemCtrl', function($scope) {
	$scope.cancel = function() {
		if($scope.dialog !== undefined) {
			$scope.dialog.close();
		}
	};

	$scope.debug = function() {
		console.log($scope.item);
	};
})

.directive('closeupItem', function(Item) {
	return {
		restrict: 'E',
		scope: {
			item: "=",
			dialog: "="
		},
		templateUrl: '/template/items/closeup-item.html',
		controller: 'CloseupItemCtrl',
		link: function(scope, element, attrs) {

		}
	};
})

.controller('CloseupItemDialogCtrl', function($scope, item, dialog) {
	$scope.dialog = dialog;
	$scope.item = item;
})

.factory('closeupItemDialog', function ($dialog) {
	return {
		open: function(item) {
			var d = $dialog.dialog({
				modalFade: false,
				backdrop: false,
				keyboard: true,
				backdropClick: false,
				resolve: {item: function() { return item; }},
				templateUrl: '/template/items/closeup-item-dialog.html',
				controller: 'CloseupItemDialogCtrl'
			});

			return d.open();
		}
	};
});
