
app.controller('Checkout', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        //$scope.requireUser();

        $scope.Steps = [
            { ident: 1, title: 'Cart', icon: 'bx-cart', current: false, active: false },
            { ident: 2, title: 'Shipping', icon: 'bx-cube', current: false, active: false },
            { ident: 3, title: 'Payment', icon: 'bx-credit-card', current: false, active: false },
            { ident: 4, title: 'Review', icon: 'bx-check-circle', current: false, active: false }
        ];

        $scope.setCurrentStep = function (a) {
            $scope.Steps.forEach(function (i) {
                if (i.ident <= a) {
                    i.active = true;
                    if (i.ident == a)
                        i.current = true;
                    else
                        i.current = false;
                }
                else {
                    i.active = false;
                    i.current = false;
                }
            });
        };

        // Begin Sub
        $scope.Sub = $routeParams.sub ? $routeParams.sub : 'cart';

        var subInc = 'views/checkout/' + $scope.Sub + '.html';
        $http.get(subInc).then(function (r) {
            $scope.SubInc = subInc + '?r=' + $scope.Rand;
        }, function () {
            $location.path('/not-found');
        });
        // End Sub


        $scope.cart = function () {
            $scope.setCurrentStep(1);
        };

    }]);