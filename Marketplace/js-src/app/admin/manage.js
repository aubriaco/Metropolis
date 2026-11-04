
app.controller('AdminManage', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.requireAdmin();

        if ($location.path().indexOf('/admin/manage') != 0)
            $location.path('/admin/manage');

        $scope.Loaded = true;
        $scope.CheckAll = false;

        // Begin Sub
        $scope.Sub = $routeParams.sub ? $routeParams.sub : 'vendor';

        var subInc = 'views/admin/manage/' + $scope.Sub + '.html';
        $http.get(subInc).then(function (r) {
            $scope.SubInc = subInc + '?r=' + $scope.Rand;
        }, function () {
            $location.path('/not-found');
        });
        // End Sub

        $scope.pullVendor = function (masterId, callback) {
            $http.get('api/admin/vendors/' + masterId).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    if (callback)
                        callback(r.data.item);
                }
            });
        };

        
        $scope.toggleAll = function (list, onVal) {
            if (!list)
                return;
            list.forEach(function (i) {
                i.selected = onVal;
            });
        };

        $scope.checkChanged = function (list, item) {
            if (!item)
                return;
            var setOn = true;
            if (!item.selected)
                setOn = false;
            else {
                if (!list)
                    return;
                setOn = true;
                list.forEach(function (i) {
                    if (!i.selected)
                        setOn = false;
                });
            }
            angular.element('[ng-model="CheckAll"]')[0].checked = setOn;
            $scope.CheckAll = setOn;
        };

        // Vendors
        $scope.manageVendors = function () {
            
            $http.get('api/admin/vendors').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else
                    $scope.Vendors = $scope.processList(r.data.list);
            });

            $scope.approve = function () {
                var data = [];
                $scope.Vendors.forEach(function (i) {
                    if(i.selected)
                        data.push(i.id);
                });
                $http.post('api/admin/vendors/approve', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.manageVendors();
                });
            };

            $scope.disable = function () {
                var data = [];
                $scope.Vendors.forEach(function (i) {
                    if (i.selected)
                        data.push(i.id);
                });
                $http.post('api/admin/vendors/disable', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.manageVendors();
                });
            };
        };

        // Vendors View
        $scope.manageVendorsView = function () {
            $scope.pullVendor($routeParams.q, function (item) {
                $scope.Vendor = item;
                $http.get('api/admin/vendors/' + $scope.Vendor.id + '/products').then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.Products = r.data.list;
                });
            });
        };

        // Products View
        $scope.manageProductsView = function () {
            $http.get('api/admin/products/' + $routeParams.q).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.Product = r.data.item;
                    $scope.pullVendor($scope.Product.vendorMasterID, function (item) {
                        $scope.Vendor = item;
                    });
                }
            });
        };

        // Users
        $scope.manageUsers = function () {
            $http.get('api/admin/users').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else
                    $scope.Users = $scope.processList(r.data.list);
            });

            $scope.newUser = function () {
                $location.path('/admin/manage/user-view/new');
            };
        };

        $scope.manageUsersView = function () {
            if ($routeParams.q == 'new') {
                $scope.UserItem = {};
                $scope.alert('WIP');
                $scope.goBack();
            }
            else {
                $http.get('api/admin/users/' + $routeParams.q).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.UserItem = r.data.item;
                });
            }
        };

    }]);