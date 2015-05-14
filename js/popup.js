(function () {
  'use strict';
  // chrome.storage.sync.clear();

  var getCurrentTabUrl = function (callback) {
    var queryInfo = {
      active: true,
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
      var tab = tabs[0],
          url = tab.url;
      callback(url);
    });
  };

  var getCurrentTabsUrl = function (callback) {
    var queryInfo = {
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
      callback(tabs.map(function (tab) {
        return tab.url;
      }));
    });
  };

  var saveTab = function (url, callback) {
    chrome.storage.sync.get('data', function (obj) {
      var tabs;
      if (!obj || Object.keys(obj).length === 0) {
        tabs = [];
        tabs.push(url);
      } else {
        tabs = obj.data;
        tabs.push(url);
      }
      chrome.storage.sync.set({'data': tabs}, callback);
    });
  };

  var saveTabs = function (urls, callback) {
    chrome.storage.sync.get('data', function (obj) {
      var tabs;
      if (!obj || Object.keys(obj).length === 0) {
        tabs = [].concat(urls);
      } else {
        tabs = obj.data.concat(urls);
      }
      chrome.storage.sync.set({'data': tabs}, callback);
    });
  };

  var randomize = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  var openTabs = function ($q) {
    var deferred = $q.defer();
    var options = {
      newWindow: false,
      randomOrder: false
    }, tabs;

    // retrieve options and data
    chrome.storage.sync.get(['options', 'data'], function (obj) {
      if (obj && Object.keys(obj).length !== 0) {
        if (obj.options) {
          options = obj.options;
        }
        if (obj.data) {
          tabs = obj.data;

          if (options.randomOrder) {
            // clone it
            tabs = tabs.slice();
            tabs = randomize(tabs);
          }

          if (options.newWindow) {
            chrome.windows.create({ url: tabs });
          } else {
            tabs.forEach(function (tab) {
              chrome.tabs.create({ url: tab });
            });
          }
        }
      }
    });
  };

  angular.module("popupApp", [])
    .constant("MENU_ITEM_ADD_CURRENT_TAB", "Add current tab")
    .constant("MENU_ITEM_ADD_CURRENT_TABS", "Add all tabs in current window")
    .constant("MENU_ITEM_OPEN_TABS", "Open Morning Coffee tabs")
    .constant("MENU_ITEM_CONFIG_OPTIONS", "Configure Morning Coffee")
    .controller("popupCtrl", function ($scope, $q, MENU_ITEM_ADD_CURRENT_TAB, MENU_ITEM_ADD_CURRENT_TABS, MENU_ITEM_OPEN_TABS, MENU_ITEM_CONFIG_OPTIONS) {
      $scope.menus = [
        { label: MENU_ITEM_ADD_CURRENT_TAB, badge: 0 },
        { label: MENU_ITEM_ADD_CURRENT_TABS, badge: 0 },
        { label: MENU_ITEM_OPEN_TABS, badge: 0 },
        { label: MENU_ITEM_CONFIG_OPTIONS, badge: 0 }
      ];

      var updateBadge = function () {
        getCurrentTabsUrl(function (urls) {
          $scope.menus[1].badge = urls.length;
          $scope.$apply(function(){ $scope.menus; });
        });
        chrome.storage.sync.get('data', function (obj) {
          var num;
          if (!obj || Object.keys(obj).length === 0) {
            num = 0;
          } else {
            num = obj.data.length;
          }
          $scope.menus[2].badge = num;
          $scope.$apply(function(){ $scope.menus; });
        });
      };

      updateBadge();

      $scope.menuItemClick = function (menuItem) {
        switch(menuItem) {
          case MENU_ITEM_ADD_CURRENT_TAB:
            getCurrentTabUrl(function (url) {
              saveTab(url, function () {
                window.close();
              });
            });
            break;
          case MENU_ITEM_ADD_CURRENT_TABS:
            getCurrentTabsUrl(function (urls) {
              saveTabs(urls, function () {
                window.close();
              });
            });
            break;
          case MENU_ITEM_OPEN_TABS:
            openTabs($q);
            break;
          case MENU_ITEM_CONFIG_OPTIONS:
            chrome.tabs.create({ url: "options.html" });
            break;
        }
      };

    });

})();
