
app.controller('My', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.requireUser();

        // Begin Sub
        $scope.Sub = $routeParams.sub ? $routeParams.sub : 'dashboard';

        var subInc = 'views/my/' + $scope.Sub + '.html';
        $http.get(subInc).then(function (r) {
            $scope.SubInc = subInc + '?r=' + $scope.Rand;
        }, function () {
            $location.path('/not-found');
        });
        // End Sub

        $scope.verifyEmail = function () {
            $scope.Error = null;
            $http.post('api/auth/verify-email', angular.toJson({ code: $routeParams.q })).then(function (r) {
                if (r.data.errorCode)
                    $scope.Error = r.data.errorMessage;
                $scope.Completed = true;
            }, function () {
                $scope.Completed = true;
                $scope.Error = $scope.getLang('Unknown error. Please try again.');
            });
        };

        $scope.resendVerifyEmail = function () {
            $http.post('api/auth/verify-email/resend').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert($scope.getLang(r.data.errorMessage));
                else
                    $scope.alert($scope.getLang('Please check your inbox to confirm your email.'));
            });
        };

        $scope.verifyPhone = function () {
            $scope.Error = null;
            $http.post('api/auth/verify-phone', angular.toJson({ code: $routeParams.q })).then(function (r) {
                if (r.data.errorCode)
                    $scope.Error = r.data.errorMessage;
                $scope.Completed = true;
            }, function () {
                $scope.Completed = true;
                $scope.Error = $scope.getLang('Unknown error. Please try again.');
            });
        };

        $scope.resendVerifyPhone = function () {
            $http.post('api/auth/verify-phone/resend').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert($scope.getLang(r.data.errorMessage));
                else
                    $scope.alert($scope.getLang('Please check your phone messages.'));
            });
        };

        // account
        $scope.accountInfo = function () {

            $scope.pullUser(function (user) {
                $scope.Info = user;

                $scope.saveAccountInfo = function (item) {
                    $http.post('api/user/info/save', angular.toJson(item)).then(function (r) {
                        if (r.data.errorCode)
                            $scope.alert($scope.getLang(r.data.errorMessage));
                        else
                            $scope.alert($scope.getLang('Information updated.'));
                    });
                };
            });
           
        };
    }]);