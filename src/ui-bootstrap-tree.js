'use strict';
/**
* Module ui.bootstrap.tree
*
* Angular ui bootstrap tree used to create tree easily
*/
angular.module('ui.bootstrap.tree', [])
.run(["$templateCache",function($templateCache){
	$templateCache.put('uibTreeItemTemplate.html','<span><i ng-class="getUibTreeNodeIcon(tree)" ng-click="toggleUibTreeNodeStatus(tree)"></i>&nbsp;<lable ng-click="toggleUibTreeNodeSelect(tree)" ng-class="getUibTreeLabelClass(tree)">{{tree.label}}</lable>&nbsp;<i ng-if="getUibTreeSelectStatus(tree)" ng-class="getUibTreeSelectIcon(tree)"></i></span><ul ng-if="getUibTreeNodeStatus(tree)" class="uib-tree"><li ng-repeat="tree in tree.children" ng-include="\'uibTreeItemTemplate.html\'"></li></ul>');
}])
.service('uibTreeUtil', function(){

	var isSelected = function(model){
		if(model.selected){
			if(model.selected == true || model.selected == 'true'){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	var hasChildren = function(model){
		if(model.children){
			if(model.children.length <= 0){
				return false;
			}else{
				return true;
			}	
		}else{
			return false;
		}
	}

	var expandModel = function(model){
		model.expanded = true;
		if(hasChildren(model)){
			angular.forEach(model.children, function(m){
				expandModel(m)
			});
		}
	}

	var expandModelByLevel = function(model,max,current){
		model.expanded = true;
		current++;
		if(hasChildren(model)){
			for(var i=0; i < model.children.length; i++){
				if(current < max){
					expandModelByLevel(model.children[i], max, current);
				}else{
					break;
				}
			}
		}
	}

	var collapseModel = function(model){
		model.expanded = false;
		if(hasChildren(model)){
			angular.forEach(model.children, function(m){
				collapseModel(m)
			});
		}
	}

	var removeUnselectedChild = function(models){
		for(var i=0; i< models.length; i++){
			var model = models[i];
			if(!isSelected(model)){
				models.splice(i,1);
				if(hasChildren(model)){
					for(var j=model.children.length; j>0; j--){
						models.splice(i,0,model.children[j-1]);
					}
				}
				i--;
			}else{
				if(hasChildren(model)){
					removeUnselectedChild(model.children);
				}
			}
		}
	};

	return {

		expandAll: function(treeModel){
			console.log("expandAll");
			if(angular.isDefined(treeModel)){
				angular.forEach(treeModel, function(m){
					expandModel(m);
				});
			}
		},

		expandByLevel: function(treeModel, level){
			if(angular.isDefined(treeModel) && level > 0){
				angular.forEach(treeModel, function(m){
					expandModelByLevel(m, level, 0);
				});
			}
		},

		collapseAll: function(treeModel){
			if(angular.isDefined(treeModel)){
				angular.forEach(treeModel, function(m){
					collapseModel(m);
				});
			}
		},

		getSelectedTreeModel: function(treeModel){
			var selectedTreeModel = angular.copy(treeModel);

			for(var i=0; i< selectedTreeModel.length; i++){
				var model = selectedTreeModel[i];
				if(!isSelected(model)){
					selectedTreeModel.splice(i,1);
					if(hasChildren(model)){
						for(var j=model.children.length; j>0; j--){
							selectedTreeModel.splice(i,0,model.children[j-1]);
						}
					}
					i--;
				}else{
					if(hasChildren(model)){
						removeUnselectedChild(model.children);
					}
				}
			}

			return selectedTreeModel;
		}
	}
})
.directive('uibTree',function(){
	return {
		restrict: 'E',
		scope: {
			treeModel: '=',
			iconExpand: '@',
			iconCollapse: '@',
			iconLeaf: '@',
			iconSelect: '@',
			labelClass: '@',
			cascade: '@',
			reverse: '@',
			disableSelect: '@',
			onSelect: '&',
			onDeselect: '&'
		},
		template: '<ul class="uib-tree"><li ng-repeat="tree in treeModel" ng-include="\'uibTreeItemTemplate.html\'"></li></ul>',
		replace: true,
		
		link: function( scope, element, attrs ) {
			//Verification
			if(!angular.isDefined(scope.treeModel)){
				console.error('Tree model is required');
			} else if(!angular.isObject(scope.treeModel)){
				console.error('Tree model must be an Object');
			} else if(!angular.isArray(scope.treeModel)){
				scope.treeModel = [scope.treeModel];
			} else {
				//Good
			}

			console.log(scope);

			//Check children
			var hasChildren = function(model){
				if(model.children){
					if(model.children.length <= 0){
						return false;
					}else{
						return true;
					}	
				}else{
					return false;
				}
			}

			//Check expanded or ollapsed
			var isExpanded = function(model){
				if(model.expanded){
					if(model.expanded == true || model.expanded == 'true'){
						return true;
					}else{
						return false;
					}
				}else{
					return false;
				}
			}

			//Check selected or unselected
			var isSelected = function(model){
				if(model.selected){
					if(model.selected == true || model.selected == 'true'){
						return true;
					}else{
						return false;
					}
				}else{
					return false;
				}
			}

			var isCascade = function(){
				if(!angular.isDefined(scope.cascade) || (scope.cascade != true && scope.cascade != 'true')){
					return false;
				}else{
					return true;
				}
			}

			var isReverse = function(){
				if(!angular.isDefined(scope.reverse) || (scope.reverse != true && scope.reverse != 'true')){
					return false;
				}else{
					return true;
				}
			}

			var isDisableSelect = function(){
				if(isCascade() || isReverse()){
					return false;
				}else{
					if(!angular.isDefined(scope.disableSelect) || (scope.disableSelect != true && scope.disableSelect != 'true')){
						return false;
					}else{
						return true;
					}
				}
			}

			//Get parent
			var getParent = function(model){
				var parent = null;
				
				var loops = function(_root){
					if(hasChildren(_root)){
						if(_root.children.indexOf(model) != -1){
							parent = _root;
						}else{
							for(var i=0; i<_root.children.length;i++){
								if(hasChildren(_root.children[i])){
									loops(_root.children[i]);
								}
								if(parent != null){
									break;
								}
							}
						}
					}
				}

				for(var j=0; j<scope.treeModel.length; j++){
					loops(scope.treeModel[j]);
					if(parent != null){
						break;
					}
				}

				return parent;
			}

			var cascade_select_tree_node = function(model){
				if(hasChildren(model)){
					angular.forEach(model.children, function(m){
						if(!isSelected(m)){
							cascade_select_tree_node(m);
						}
					})
				}

				model.selected = true;
				if(model.onSelect != null) {
	              	model.onSelect();
	            }else {
	            	if(scope.onSelect != null){
	            		scope.onSelect({model: model});
	            	}
	            }
			}

			var select_tree_node = function(model){
				if(isCascade() && hasChildren(model)){
					angular.forEach(model.children, function(m){
						if(!isSelected(m)){
							cascade_select_tree_node(m);
						}
					})
				}
	            
	            model.selected = true;
	            
	            if(model.onSelect != null) {
	              	model.onSelect();
	            }else {
	            	if(scope.onSelect != null){
	            		scope.onSelect({model: model});
	            	}
	            }
			}

			var cascade_deselect_tree_node = function(model){
				if(hasChildren(model)){
					angular.forEach(model.children, function(m){
						if(isSelected(m)){
							cascade_deselect_tree_node(m);
						}
					});
				}

				model.selected = false;
				if(model.onDeselect != null) {
	              	model.onDeselect();
	            }else {
	            	if(scope.onDeselect != null){
	            		scope.onDeselect({model: model});
	            	}
	            }
			}

			var reverse_deselect_tree_node = function(model){
				var parent = getParent(model);
				if(parent != null && isSelected(parent)){
					reverse_deselect_tree_node(parent);
				}

	            model.selected = false;
				if(model.onDeselect != null) {
	              	model.onDeselect();
	            }else {
	            	if(scope.onDeselect != null){
	            		scope.onDeselect({model: model});
	            	}
	            }
			}

			var deselect_tree_node = function(model){

				if(isCascade() && hasChildren(model)){
					angular.forEach(model.children, function(m){
						if(isSelected(m)){
							cascade_deselect_tree_node(m);
						}
					})
				}
				
				if(isReverse()){
					var parent = getParent(model);
					if(parent != null && isSelected(parent)){
						reverse_deselect_tree_node(parent);
					}
				}
				
				model.selected = false;
				if(model.onDeselect != null) {
	              	model.onDeselect();
	            }else {
	            	if(scope.onDeselect != null){
	            		scope.onDeselect({model: model});
	            	}
	            }

			}

			//Get uibTree expand or collapse status
			scope.getUibTreeNodeStatus = function(model){
				return isExpanded(model);
			}
			
			//Get uibTree node icon
			scope.getUibTreeNodeIcon=function(model){
				if(hasChildren(model)){
					if(isExpanded(model)){
						if(angular.isDefined(model.iconCollapse) && model.iconCollapse != null && model.iconCollapse != ''){
							return model.iconCollapse;
						}else{
							if(angular.isDefined(scope.iconCollapse) && scope.iconCollapse != null && scope.iconCollapse != ''){
								return scope.iconCollapse;
							}else{
								return 'icon-minus glyphicon glyphicon-minus fa fa-minus text-info';
							}
						}
					}else{
						if(angular.isDefined(model.iconExpand) && model.iconExpand != null && model.iconExpand != ''){
							return model.iconExpand;
						}else{
							if(angular.isDefined(scope.iconExpand) && scope.iconExpand != null && scope.iconExpand != ''){
								return scope.iconExpand;
							}else{
								return 'icon-plus glyphicon glyphicon-plus fa fa-plus text-info';
							}
						}
					}
				}else{
					if(angular.isDefined(model.iconLeaf) && model.iconLeaf != null && model.iconLeaf != ''){
						return model.iconLeaf;
					}else{
						if(angular.isDefined(scope.iconLeaf) && scope.iconLeaf != null && scope.iconLeaf != ''){
							return scope.iconLeaf;
						}else{
							return 'icon-file glyphicon glyphicon-file fa fa-file text-info';
						}
					}
				}
			}

			//Get uibTree select status
			scope.getUibTreeSelectStatus=function(model){
				return (!isDisableSelect() && isSelected(model));
			}

			//Get uibTree select icon
			scope.getUibTreeSelectIcon=function(model){
				if(angular.isDefined(model.iconSelect) && model.iconSelect != null && model.iconSelect != ''){
					return model.iconSelect;
				}else{
					if(angular.isDefined(scope.iconSelect) && scope.iconSelect != null && scope.iconSelect != ''){
						return scope.iconSelect;
					}else{
						return 'icon-check glyphicon glyphicon-ok fa fa-check text-info';
					}
				}
			}

			//Get uibTree Label class
			scope.getUibTreeLabelClass = function(model){
				if(angular.isDefined(model.labelClass) && model.labelClass != null && model.labelClass != ''){
					return model.labelClass;
				}else{
					if(angular.isDefined(scope.labelClass) && scope.labelClass != null && scope.labelClass != ''){
						return scope.labelClass;
					}else{
						return 'text-info';
					}
				}
			}

			//Expand or Collspse tree node
			scope.toggleUibTreeNodeStatus = function(model){
				if(hasChildren(model)){
					if(isExpanded(model)){
						model.expanded = false;
					}else{
						model.expanded = true;
					}
				}
			}

			//Expand or Collspse tree node
			scope.toggleUibTreeNodeSelect = function(model){
				if(!isDisableSelect()){
					if(isSelected(model)){
						deselect_tree_node(model);
					}else{
						select_tree_node(model)
					}
				}
			}

		}
	}
});