
app.controller('Signup', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.SID = $routeParams.sid;

        $scope.Form = {
            Address: {
                Country: 'Puerto Rico'
            }
        };

        $scope.submitUser = function () {

            if ($scope.Form.password != $scope.Form.confirmPassword) {
                $scope.alert($scope.getLang('Passwords must match.'));
                return;
            }

            $http.post('api/signup/user', angular.toJson($scope.Form)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.pullSession();
                }
            });
        };

        $scope.submitAddress = function () {
            $http.post('api/signup/address', angular.toJson($scope.Form.address)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.pullSession();
                }
            });
        };

        $scope.submitType = function (a) {
            $scope.Form.isVendor = a;
            $http.post('api/signup/type', angular.toJson($scope.Form)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.pullSession();
                }
            });
        };

        $scope.submitFinal = function () {
            $http.post('api/signup/submit', angular.toJson({})).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    if ($scope.Session.isVendor)
                        $location.path('/vendor/new');
                    else
                        $location.path('/index');
                }
            });
        };


        $scope.pullSession = function () {
            $http.get('api/signup/session').then(function (r) {
                if (!r.data.errorCode) {
                    $scope.Form = $scope.Session = r.data.item;
                    if ($scope.Session.step == 2) {
                        $http.get('api/content/mode/get').then(function (r) {
                            if (r.data.item && r.data.item == 'vendorsignup') {
                                $scope.submitType(true);
                            }
                        });
                    }
                    else if ($scope.Session.step == 3) {
                        $scope.submitFinal();
                    }
                }
                $scope.Loaded = true;
            });
        };
        $scope.pullSession();
        
        $scope.pullUser(function (u) {
            if (u)
                $location.path('/my');
        });

    }]);