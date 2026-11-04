
app.controller('General', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {

        $scope.setGeneral = function (a, b) {
            $scope[a] = b;
        };
        
        $scope.initCategories = function () {
            $http.get('api/category/list').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else
                    $scope.Categories = r.data.list;
            });
        };


        $scope.doGlobalSearch = function (q) {
            if (!q)
                return;
            var s = '';
            for (var n = 0; n < q.length; n++) {
                var c = q.charCodeAt(n);
                if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122))
                    s += q[n];
                else
                    s += '-';
            }
            $location.path('/s/' + s);
        };

        var globalSearchTimer = null;
        $scope.globalSearchChanged = function (q) {
            if (globalSearchTimer != null)
                $timeout.cancel(globalSearchTimer);
            globalSearchTimer = $timeout(function () {
                globalSearchTimer = null;
                $scope.doGlobalSearch(q);
            }, 1000);
        };


    }]);