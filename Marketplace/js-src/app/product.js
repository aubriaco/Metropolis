
app.controller('Product', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.Filter = {
            categories: {}
        };
        $scope.ShowCategoryFilter = true;
        $scope.Stars = [1, 2, 3, 4, 5];


        // Search
        $scope.search = function () {
            var query = {};

            $scope.setPresets = function () {
                if (!$scope.Categories) {
                    $timeout($scope.setPresets, 200);
                    return;
                }
                if ($routeParams.qc) {
                    var qc = $routeParams.qc;
                    var p;
                    if (qc.indexOf(',') != -1)
                        p = qc.split(',');
                    else
                        p = [qc];
                    p.forEach(function (j) {
                        $scope.Categories.forEach(function (i) {
                            if (i.ident == j)
                                $scope.Filter.categories[i.id] = true;
                        });
                    });
                }
            };

            if ($routeParams.qc) {
                query.categoryIdent = $routeParams.qc;
            }
            if ($routeParams.qs) {
                query.terms = $routeParams.qs.replace(/-/g, ' ');
                $('#globalsearch').val(query.terms);
            }
            if ($routeParams.qf) {
                try {
                    $scope.Filter = angular.fromJson(atob($routeParams.qf));
                    query.filter = $scope.Filter;
                }
                catch {
                    console.log('Filter', 'Error parsing.');
                }
            }

            if (!$scope.Filter.page) {
                $scope.Filter.page = 1;
            }

            $scope.setPresets();

            $scope.getSearchLoc = function (qs, qc, qf) {
                return (qs ? '/s/' + qs : '') + (qc ? '/c/' + qc : '') + (qf ? '/f/' + qf : '');
            };

            $scope.applySearch = function (qs, qc, qf) {
                $location.path($scope.getSearchLoc(qs, qc, qf));
            };

            $scope.getPageLoc = function (p) {
                var filter = $scope.deepscan($scope.Filter);
                filter.page = p;
                return $scope.getSearchLoc($routeParams.qs, $routeParams.qc, btoa(angular.toJson(filter)));
            };

            $scope.applyFilter = function (filter) {
                var qs = $routeParams.qs;
                var qc = $routeParams.qc;
                var qf = btoa(angular.toJson(filter));
                if (filter.categories) {
                    qc = '';
                    for (var k in filter.categories) {
                        if (filter.categories[k]) {
                            if (qc.length > 0)
                                qc += ',';
                            $scope.Categories.forEach(function (i) {
                                if (i.id == k)
                                    qc += i.ident;
                            });
                        }
                    }
                }
                $scope.applySearch(qs, qc, qf);
            };


            $http.post('api/product/search', angular.toJson(query)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.List = r.data.list;
                    $scope.PageCount = r.data.pageCount;
                    $scope.Paging = $scope.getPageModel(r.data.pageCount, $scope.Filter.page);
                    $scope.SearchLoaded = true;
                }
            });
        };

        // View
        $scope.view = function () {
            $scope.Product = {};
            $scope.Review = { rating: 0 };
            $scope.ReviewErrors = {};

            $scope.loadReviews = function () {
                $http.get('api/review/list?productId=' + $scope.Product.id).then(function (r) {
                    if (!r.data.errorCode)
                        $scope.ReviewList = r.data.list;
                });
            };

            $http.get('api/product/view?ident=' + $routeParams.qi).then(function (r) {
                if (r.data.errorCode)
                    $scope.Product = {};
                else {
                    $scope.Product = r.data.item;

                    $timeout(function () {
                        $('.product-gallery').owlCarousel({
                            loop: true,
                            margin: 10,
                            responsiveClass: true,
                            nav: false,
                            dots: false,
                            thumbs: true,
                            thumbsPrerendered: true,
                            responsive: {
                                0: {
                                    items: 1
                                },
                                600: {
                                    items: 1
                                },
                                1000: {
                                    items: 1
                                }
                            }
                        })
                    }, 500);


                    $http.post('api/product/search', angular.toJson({ terms: $scope.Product.tags.join(' ') })).then(function (r) {
                        if (r.data.errorCode)
                            $scope.alert(r.data.errorMessage);
                        else {
                            $scope.SimilarList = r.data.list;
                        }
                    });

                    $scope.loadReviews();

                }
                $scope.Loaded = true;
            });

            $scope.validateReview = function (r) {
                var errors = [];
                if (!r.body || r.body.length < 25) errors.push($scope.getLang('Review must contain at least 25 characters.'));

                if (errors.length != 0) {
                    $scope.alert(errors.join(' '));
                    return false;
                }

                return true;
            };

            $scope.submitReview = function (a) {
                if (!$scope.validateReview(a))
                    return;
                a.productID = $scope.Product.id;
                $http.post('api/review/submit', angular.toJson(a)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.alert('Review has been submitted!');
                        $scope.Review = { rating: 0 };
                        $scope.loadReviews();
                    }
                });
            };

        };


        // Featured
        $scope.featured = function () {

            var query = {
                filter: { featured: true }
            };

            $http.post('api/product/search', angular.toJson(query)).then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.Featured = r.data.list;
                }
            });
        };

    }]);