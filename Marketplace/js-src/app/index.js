
app.controller('Index', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {

        if ($routeParams.lang) {
            $scope.setCurrentLangByIdent($routeParams.lang, true);
        }

        $scope.localInit = function () {
            console.log('RootMode', $scope.RootMode);
            if ($scope.RootMode == 'vendorsignup')
                $location.path('/sell');

            $scope.pullUser(function (user) {
                if (!user || !user.isAdmin) {
                    $http.get('/api/content/stage').then(function (r) {
                        if (!r.data.errorCode) {
                            if (r.data.item == 'vendorsignup')
                                $scope.setModeAsVendorSignup();
                        }
                    });
                }   
            });
        };

    }]);