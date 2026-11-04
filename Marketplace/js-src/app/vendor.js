
app.controller('Vendor', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.requireUser();

        $scope.WeightUnits = ['lb', 'oz', 'kg', 'g'];

        $scope.list = function () {
            $http.get('api/vendor/list').then(function (r) {
                if (r.data.errorCode)
                    $scope.Error = r.data.errorMessage;
                else
                    $scope.List = r.data.list;
            });
        };


        $http.get('api/vendor/global').then(function (r) {
            if (!r.data.errorCode)
                $scope.Global = r.data.item;
        });

        $scope.pullProducts = function (callback, isService) {
            $http.get('api/product/list?vendorMasterId=' + $routeParams.masterId + '&isService=' + (isService ? 'true' : 'false')).then(function (r) {
                if (!r.data.errorCode) {
                    $scope.Products = r.data.list;
                }
                if (callback)
                    callback(r.data);
            });
        };


        //New
        $scope.new = function () {
            $scope.Item = {
                documents: []
            };

            $scope.initUploader($scope, 'Uploader', 'application/pdf,application/msword,application/vnd.openxml', '#uploader', function (r) {
                if (r.errorCode)
                    $scope.alert(r.errorMessage);
                else {
                    if (r.item && r.item.originalFileName && r.item.id) {
                        $scope.Item.documents.push({
                            name: r.item.originalFileName,
                            storageItemID: r.item.id,
                            storageItem: r.item
                        });
                    }
                    else
                        $scope.alert('Unknown error ocurred. Please try again.');
                }
            });

            $scope.removeDocument = function (a) {
                $scope.Item.documents.splice($scope.Item.documents.indexOf(a), 1);
            };

            $scope.pullSession = function () {
                $http.get('api/vendor/session').then(function (r) {
                    if (!r.data.errorCode) {
                        $scope.Item = r.data.item;

                        if ($scope.Item.step == 10) {
                            $scope.submit();
                        }
                    }
                    else if(r.data.errorCode == 3)
                        $scope.Error = r.data.errorMessage;
                    $scope.Loaded = true;
                });
            };
            $scope.pullSession();

            $scope.submit = function () {
                $http.post('api/vendor/submit', {}).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $location.path('/vendor/manage/' + r.data.item.masterID);
                    }
                });
            };

            $scope.submitNew = function () {
                $http.post('api/vendor/new', angular.toJson($scope.Item)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.pullSession();
                });
            };

            $scope.submitAddress = function () {
                $http.post('api/vendor/address', angular.toJson($scope.Item.address)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.pullSession();
                    }
                });
            };

            $scope.submitBiz = function () {
                $http.post('api/vendor/biz', angular.toJson($scope.Item)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.pullSession();
                    }
                });
            };

            $scope.submitDocuments = function () {

                var _func = function () {
                    $http.post('api/vendor/documents', angular.toJson($scope.Item)).then(function (r) {
                        if (r.data.errorCode)
                            $scope.alert(r.data.errorMessage);
                        else {
                            $scope.pullSession();
                        }
                    });
                };

                if ($scope.Item.documents.length < $scope.Global.requiredDocumentCount) {
                    /*
                    if (!confirm($scope.getLang('You can continue the process without uploading the documents but you will need to upload them before your store gets approved into the marketplace.\n\nAre you sure you want to continue?')))
                        return;
                    */
                    $scope.confirm($scope.getLang('You can continue the process without uploading the documents but you will need to upload them before your store gets approved into the marketplace.\n\nAre you sure you want to continue?'), function () {
                        _func();
                    });
                }
                else
                    _func();

                
            };

            $scope.submitTerms = function () {
                $scope.Item.isAgreeTerms = true;
                $http.post('api/vendor/terms', angular.toJson($scope.Item)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.pullSession();
                    }
                });
            };

            $scope.nextTerms = function () {
                $scope.Item.step++;
            };
        };

        //Manage
        $scope.manage = function () {

            // Begin Sub
            $scope.Sub = $routeParams.sub ? $routeParams.sub : 'dashboard';

            var subInc = 'views/vendor/manage/' + $scope.Sub + '.html';
            $http.get(subInc).then(function (r) {
                $scope.SubInc = subInc + '?r=' + $scope.Rand;
            }, function () {
                $location.path('/not-found');
            });
            // End Sub

            $scope.load = function () {
                $http.get('api/vendor/get?masterId=' + $routeParams.masterId + '&manage=true').then(function (r) {
                    if (r.data.errorCode) {
                        $scope.alert(r.data.errorMessage);
                        $location.path('/not-found');
                    }
                    else {
                        $scope.Vendor = r.data.item;
                        $scope.Loaded = true;
                    }
                });
            };
            $scope.load();
        };

        // Manage Dashboard
        $scope.manageDashboard = function () {
            $http.get('api/vendor/dashboard?masterId=' + $routeParams.masterId).then(function (r) {
                if (r.data.errorCode) {
                    $scope.alert(r.data.errorMessage);
                }
                else {
                    $scope.Dashboard = r.data.item;
                }
            });
        };

        // Manage Orders
        $scope.manageOrders = function () {
            $scope.pullProducts();
            $http.get('api/order/vendor/list?vendorMasterId=' + $routeParams.masterId).then(function (r) {
                if (r.data.errorCode) {
                    $scope.alert(r.data.errorMessage);
                }
                else {
                    $scope.Orders = r.data.list;
                }
            });
        };

        // Manage Settings
        $scope.manageSettings = function () {
            $scope.loadSettings = function () {
                $http.get('api/vendor/get?masterId=' + $routeParams.masterId).then(function (r) {
                    if (r.data.errorCode) {
                        $scope.alert(r.data.errorMessage);
                    }
                    else {
                        $scope.Settings = r.data.item;
                    }
                });
            };
            $scope.loadSettings();

            $scope.saveSettings = function () {
                $scope.Saving = true;
                $http.post('api/vendor/settings/save', angular.toJson($scope.Settings)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.manage();
                        $scope.loadSettings();
                        $scope.alert('Settings have been saved!');
                    }
                    $scope.Saving = false;
                }, function () {
                    $scope.alert('Unknown error ocurred. Please try again.');
                    $scope.Saving = false;
                });
            };
        };

        // Manage Documents
        $scope.manageDocuments = function () {
            $scope.initUploader($scope, 'Uploader', 'application/pdf,application/msword,application/vnd.openxml', '#uploader', function (r) {
                if (r.errorCode)
                    $scope.alert(r.errorMessage);
                else {
                    if (r.item && r.item.originalFileName && r.item.id) {
                        var doc = {
                            vendorID: $scope.Vendor.id,
                            name: r.item.originalFileName,
                            storageItemID: r.item.id,
                            storageItem: r.item
                        };
                        $scope.Vendor.documents.push(doc);

                        $http.post('api/vendor/documents/add', angular.toJson(doc)).then(function (r) {
                            if (r.data.errorCode)
                                $scope.alert(r.data.errorMessage);
                        });
                    }
                    else
                        $scope.alert('Unknown error ocurred. Please try again.');
                }
            });

            $scope.removeDocument = function (a) {
                if (!confirm($scope.getLang('Are you sure you want to remove document: ') + a.name))
                    return;
                $http.get('api/vendor/documents/remove?docMasterId=' + a.masterID).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else
                        $scope.Vendor.documents.splice($scope.Vendor.documents.indexOf(a), 1);
                });
            };
        };

        // Manage Products
        $scope.manageProducts = function (isService) {

            $scope.pullProducts(function (data) {
                if (data.errorCode)
                    $scope.alert(r.data.errorMessage);
            }, isService);
        };

        // Manage Product Edit
        $scope.manageProductsEdit = function (isService) {
            var fe;
            var lf = function () {
                fe = $scope.initWysihtml('#product-input-description');
            };

            var numerics = ['price', 'comparePrice', 'cost', 'sku', 'weight'];

            $scope.Weekdays = [
                { name: 'Sun', selected: false },
                { name: 'Mon', selected: false },
                { name: 'Tue', selected: false },
                { name: 'Wed', selected: false },
                { name: 'Thu', selected: false },
                { name: 'Fri', selected: false },
                { name: 'Sat', selected: false }
            ];

            if ($routeParams.subId == 'new') {
                $scope.Product = {
                    status: 'Draft',
                    goodStatus: false,
                    description: '',
                    shortDescription: '',
                    images: [],
                    _tags: [],
                    weightUnit: 'lb'
                };
                $timeout(lf, 200);
            }
            else {
                $http.get('api/product/item?masterId=' + $routeParams.subId).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.Product = r.data.item;
                        $scope.Product._tags = $scope.toTagInput($scope.Product.tags);
                        $scope.makeNullIfZero($scope.Product, numerics);
                    }
                    $timeout(lf, 200);
                });
            }


            $scope.$watch('Product', function (nv, ov) {
                if (!nv)
                    return;
                for (var k in nv) {
                    try {
                        if (nv[k] != ov[k]) {
                            $scope.Updated = true;
                            break;
                        }
                    }
                    catch { }
                }
            }, true);

            $scope.submit = function () {
                $scope.makeZeroIfNull($scope.Product, numerics);
                $scope.Product.vendorID = $scope.Vendor.id;
                $scope.Product.description = $('#product-input-description textarea').val();
                $scope.Product.tags = $scope.fromTagInput($scope.Product._tags);
                $scope.Product.isService = isService;
                $http.post('api/product/save', angular.toJson($scope.Product)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        $scope.goBack();
                    }
                });
            };

            $scope._goBack = function () {
                if ($scope.Updated) {
                    if (!confirm($scope.getLang('There are unsaved changes. Are you sure you want to go back?')))
                        return;
                }
                $scope.goBack();
            };

            $scope.initLocalUploader = function () {
                var uploader = $scope.Uploader = new FileUploader({
                    url: 'api/storage/upload/image'
                });

                uploader.onAfterAddingFile = function (fileItem) {
                    fileItem.upload();
                };

                uploader.onCompleteItem = function (fileItem, response, status, headers) {
                    if (response.errorCode)
                        $scope.alert(response.errorMessage);
                    else {
                        $scope.Product.images.push(response.item);
                    }
                    $scope.Uploader.queue.splice($scope.Uploader.queue.indexOf(fileItem), 1);
                };

                uploader.onCompleteAll = function () {
                    console.info('Complete upload!');
                };
            };
            $scope.initLocalUploader();

            $scope.triggerUpload = function () {
                $('#uploader').trigger('click');
            };

            $scope.deleteImage = function (a) {
                $scope.Product.images.splice($scope.Product.images.indexOf(a), 1);
            };

            $scope.validate = function () {
                var p = $scope.Product;
                p.description = $('#product-input-description textarea').val();
                var errors = [];
                if (!p.name || p.name.length == 0) errors.push($scope.getLang('Product title can not be blank.'));
                if (!p.shortDescription || p.shortDescription.length < 25) errors.push($scope.getLang('Product short description must contain at least 25 characters.'));
                if (!p.description || p.description.length < 100) errors.push($scope.getLang('Product description must contain at least 100 characters.'));
                if (p.images.length == 0) errors.push($scope.getLang('You must at least upload 1 image.'));
                if (!p.price || p.price == 0 || p.price < 0) errors.push($scope.getLang('Price must be a positive number.'));

                if (errors.length != 0) {

                    if (isService) {
                        for (var n = 0; n < errors.length; n++) {
                            errors[n] = errors[n].replace(/Product/g, 'Service');
                        }
                    }

                    p.isActive = false;
                    $scope.alert(errors.join(' '));
                }
                
            };
        };

       
    }]);