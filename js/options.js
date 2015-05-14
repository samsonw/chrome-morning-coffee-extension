(function () {
  'use strict';

   angular.module("optionsApp", ['ui.sortable'])
    .controller("optionsCtrl", function ($scope, $timeout) {
      var type;
      $scope.tabs = [];
      $scope.$watch('tabs', function(newValue, oldValue) {
        chrome.storage.sync.set({'data': newValue});
      }, true);

      var getTabs = function () {
        chrome.storage.sync.get('data', function (obj) {
          if (obj && Object.keys(obj).length !== 0) {
            $scope.tabs = obj.data;
            $scope.$apply(function () { $scope.tabs; });
          }
        });
      };

      getTabs();

      $scope.options = {
        newWindow: false,
        randomOrder: false
      };

      var loadOptions = function () {
        chrome.storage.sync.get('options', function (obj) {
          if (obj && Object.keys(obj).length !== 0) {
            $scope.options = obj.options;
          }
          $scope.$apply();
        });
      };

      loadOptions();

      $scope.$watch('options', function(newValue, oldValue) {
        chrome.storage.sync.set({'options': newValue});
      }, true);

      $scope.checkDisabled = function () {
        return angular.isUndefined($scope.selectedIndex) || $scope.selectedIndex === null ? true : false;
      };

      $scope.selectUrl = function (url, index) {
        $scope.selectedUrl = url;
        $scope.selectedIndex = index;
      };

      $scope.getUrlClass = function (index) {
        return $scope.selectedIndex === index ? 'info' : '';
      };

      var showModal = function () {
        $("#tabEditDialog").modal('show');
      };

      var hideModal = function () {
        $("#tabEditDialog").modal('hide');
      };

      $scope.handleAdd = function () {
        $scope.inputUrl = '';
        type = 'add';
        showModal();
      };

      $scope.handleEdit = function () {
        $scope.inputUrl = $scope.selectedUrl;
        type = 'edit';
        showModal();
      };

      $scope.handleDelete = function () {
        $scope.tabs.splice($scope.selectedIndex, 1);
        // select the previous url if available after deletion
        if ($scope.tabs.length === 0) {
          $scope.selectUrl(null, '');
        } else {
          var nextIndex = $scope.selectedIndex === $scope.tabs.length ? $scope.selectedIndex - 1 : $scope.selectedIndex;
          $scope.selectUrl($scope.tabs[nextIndex], nextIndex);
        }
      };

      $scope.handleModalSubmit = function () {
        hideModal();
        if (type === 'add') {
          $scope.tabs.push($scope.inputUrl);
          // select the last added url
          $scope.selectUrl($scope.inputUrl, $scope.tabs.length - 1);
          $timeout(function () {
            $('.tabs-selection-table tr:last').get(0).scrollIntoView();
          });
        } else if (type === 'edit') {
          $scope.tabs[$scope.selectedIndex] = $scope.inputUrl;
        }
      };

    });

})();
