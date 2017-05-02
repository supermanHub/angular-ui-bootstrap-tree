uibTreeApp.controller('SimpleCtrl', ['$scope','uibTreeUtil', function($scope, uibTreeUtil){
	$scope.iconExpand;
	$scope.iconCollapse;
	$scope.iconLeaf;
	$scope.iconSelect;
	$scope.labelClass;
	$scope.cascade;
	$scope.reverse;
	$scope.disableSelect;
	$scope.rootNumber = 1;
	$scope.childrenSize = 2;
	$scope.levelNumber = 2;


	
	var total;
	$scope.initTree = function(){
		total = 0;
		$scope.treeModel = [];
		for(var i=0; i< $scope.rootNumber; i++){
			
			var rootTree = {
				label: 'Root_' + (i+1),
				children:[],
				expanded: true
			}
			
			for(var j=0; j<$scope.childrenSize; j++){
				rootTree.children.push(createTree('SubTree_' + (j+1), 0));
			}
			
			
			$scope.treeModel.push(rootTree);
		}

		$scope.totalTreeItem = total + $scope.rootNumber;
	}

	var createTree = function(label, level){
		var tree = {
			label: label,
			children: []
		}
		total = total + 1;
		if(level < $scope.levelNumber - 2){
			level = level + 1;

			for(var index=0; index < $scope.childrenSize; ){
				index = index + 1;
				tree.children.push(createTree(tree.label + '_' + index, level))
			}
			
		}
		return tree;
	}

	$scope.initTree();

	$scope.resetDisableSelect = function(){
		if($scope.reverse || $scope.cascade){
			$scope.disableSelect = false;
		}
	}

	$scope.expandAll = function(){
		uibTreeUtil.expandAll($scope.treeModel);
	}

	$scope.expandLevel = 0;
	$scope.expandByLevel = function(){
		uibTreeUtil.expandByLevel($scope.treeModel, $scope.expandLevel);
	}

	$scope.collapseAll = function(){
		uibTreeUtil.collapseAll($scope.treeModel);
	}

	$scope.getSelectedTreeModel = function(){
		$scope.selectedTreeModel = uibTreeUtil.getSelectedTreeModel($scope.treeModel);
	}
}]);