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
		if(undefined != model.selected && null != model.selected){
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
		if(undefined != model.children && null != model.children){
			if(angular.isArray(model.children)){
				if(model.children.length > 0){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	var isExpanded = function(model){
		if(undefined != model.expanded && null != model.expanded){
			if(model.expanded == true || model.expanded == 'true'){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	var expandModel = function(model){
		if(!isExpanded(model)){
			model.expanded = true;
		}

		if(hasChildren(model)){
			for(var i=0; i<model.children.length; i++){
				expandModel(model.children[i]);
			}
		}
	}

	var expandModelByLevel = function(model,max,current){
		if(!isExpanded(model)){
			model.expanded = true;
		}

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
		if(isExpanded(model)){
			model.expanded = false;
		}
		if(hasChildren(model)){
			for(var i=0; i<model.children.length; i++){
				collapseModel(model.children[i]);
			}
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
			if(undefined != treeModel && null != treeModel && angular.isArray(treeModel)){
				for(var i=0; i<treeModel.length; i++){
					expandModel(treeModel[i]);
				}
			}
		},

		expandByLevel: function(treeModel, level){
			if(undefined != treeModel && null != treeModel && angular.isArray(treeModel) && level > 0){
				for(var i=0; i<treeModel.length; i++){
					expandModelByLevel(treeModel[i], level, 0);
				}
			}
		},

		collapseAll: function(treeModel){
			if(undefined != treeModel && null != treeModel && angular.isArray(treeModel)){
				for(var i=0; i<treeModel.length; i++){
					collapseModel(treeModel[i]);
				}
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

			//Check children
			var hasChildren = function(model){
				if(undefined != model.children && null != model.children){
					if(angular.isArray(model.children)){
						if(model.children.length > 0){
							return true;
						}else{
							return false;
						}
					}else{
						return false;
					}
				}else{
					return false;
				}
			}

			//Check expanded or ollapsed
			var isExpanded = function(model){
				if(undefined != model.expanded && null != model.expanded){
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
				if(undefined != model.selected && null != model.selected){
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
				return scope.cascade == 'true';
			}

			var isReverse = function(){
				return scope.reverse == 'true';
			}

			var isDisableSelect = function(){
				if(isCascade() || isReverse()){
					return false;
				}else{
					return scope.disableSelect == 'true';
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
					for(var i=0; i<model.children.length; i++){
						if(!isSelected(model.children[i])){
							cascade_select_tree_node(model.children[i]);
						}
					}
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
					for(var i=0; i<model.children.length; i++){
						if(!isSelected(model.children[i])){
							cascade_select_tree_node(model.children[i]);
						}
					}
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
					for(var i=0; i<model.children.length; i++){
						if(isSelected(model.children[i])){
							cascade_deselect_tree_node(model.children[i]);
						}
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
					for(var i=0; i<model.children.length; i++){
						if(isSelected(model.children[i])){
							cascade_deselect_tree_node(model.children[i]);
						}
					}
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
						if(undefined != model.iconCollapse && model.iconCollapse != null && model.iconCollapse != ''){
							return model.iconCollapse;
						}else{
							if(undefined != scope.iconCollapse && scope.iconCollapse != ''){
								return scope.iconCollapse;
							}else{
								return 'icon-minus glyphicon glyphicon-minus fa fa-minus text-info';
							}
						}
					}else{
						if(undefined != model.iconExpand && model.iconExpand != null && model.iconExpand != ''){
							return model.iconExpand;
						}else{
							if(undefined != scope.iconExpand && scope.iconExpand != ''){
								return scope.iconExpand;
							}else{
								return 'icon-plus glyphicon glyphicon-plus fa fa-plus text-info';
							}
						}
					}
				}else{
					if(undefined != model.iconLeaf && model.iconLeaf != null && model.iconLeaf != ''){
						return model.iconLeaf;
					}else{
						if(undefined != scope.iconLeaf && scope.iconLeaf != ''){
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
				if(undefined != model.iconSelect && model.iconSelect != null && model.iconSelect != ''){
					return model.iconSelect;
				}else{
					if(undefined != scope.iconSelect && scope.iconSelect != ''){
						return scope.iconSelect;
					}else{
						return 'icon-check glyphicon glyphicon-ok fa fa-check text-info';
					}
				}
			}

			//Get uibTree Label class
			scope.getUibTreeLabelClass = function(model){
				if(undefined != model.labelClass && model.labelClass != null && model.labelClass != ''){
					return model.labelClass;
				}else{
					if(undefined != scope.labelClass && scope.labelClass != ''){
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