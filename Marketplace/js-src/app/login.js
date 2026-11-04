
app.controller('Login', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {

        $scope.Form = {};
        $scope.Params = $scope.parseQS();

        
        $scope.login = function () {

            if ($scope.Params.r)
                $scope.Form.returnLoc = $scope.decLoc($scope.Params.r);

            $http.post('api/auth/login', angular.toJson($scope.Form)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    if (r.data.item.returnLoc)
                        $location.url(r.data.item.returnLoc);
                    else
                        $location.url('/my');
                }
            });
        };

        $scope.pullUser(function (u) {
            if (u)
                $location.path('/my');
        });

        // Forgot Password
        $scope.forgotPassword = function () {

            $scope.submit = function () {
                $http.post('api/auth/forgot-password', angular.toJson($scope.Form)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.alert($scope.getLang('An email has been sent to ' + $scope.Form.email + ' with further instructions on recovering your user account.'));
                        $location.path('/login');
                    }
                });
            };
        };

        // Reset Password
        $scope.resetPassword = function () {

            $scope.Form.code = $routeParams.code;

            $scope.submit = function () {
                if ($scope.Form.password != $scope.Form.confirmPassword) {
                    $scope.alert($scope.getLang('Passwords must match.'));
                    return;
                }

                $http.post('api/auth/reset-password', angular.toJson($scope.Form)).then(function (r) {
                    if (r.data.errorCode) {
                        $scope.alert(r.data.errorMessage);
                        if (r.data.errorCode == 6)
                            $location.path('/forgot-password');
                    }
                    else {
                        $location.path('/login');
                    }
                });
            };
        };
    }]);