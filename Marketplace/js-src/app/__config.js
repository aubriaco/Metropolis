
// Hi my name is Alessandro Ubriaco and you are looking at my handwritten javascript :)

var app = angular.module('app', ['ngRoute', 'ngSanitize', 'angularFileUpload', '720kb.datepicker', '720kb.fx', 'ui.mask', 'ngTagsInput', 'color.picker', 'signature', 'dndLists']);


app.config(['$routeProvider', '$locationProvider',
function ($routeProvider, $locationProvider) {
    //Routes
    $routeProvider
        .when('/index', { templateUrl: 'views/index.html' })
        .when('/locale/:lang', { templateUrl: 'views/index.html' })
        .when('/s/:qs', { templateUrl: 'views/product-list.html' })
        .when('/s/:qs/c/:qc', { templateUrl: 'views/product-list.html' })
        .when('/s/:qs/c/:qc/f/:qf', { templateUrl: 'views/product-list.html' })
        .when('/s/:qs/f/:qf', { templateUrl: 'views/product-list.html' })
        .when('/c/:qc', { templateUrl: 'views/product-list.html' })
        .when('/c/:qc/f/:qf', { templateUrl: 'views/product-list.html' })
        .when('/f/:qf', { templateUrl: 'views/product-list.html' })
        .when('/p/:qi', { templateUrl: 'views/product-view.html' })
        .when('/not-found', { templateUrl: 'views/not-found.html' })
        .when('/my', { templateUrl: 'views/my.html' })
        .when('/my/:sub', { templateUrl: 'views/my.html' })
        .when('/my/:sub/:q', { templateUrl: 'views/my.html' })
        .when('/login', { templateUrl: 'views/login.html' })
        .when('/forgot-password', { templateUrl: 'views/forgot-password.html' })
        .when('/reset-password/:code', { templateUrl: 'views/reset-password.html' })
        .when('/signup', { templateUrl: 'views/signup.html' })
        .when('/signup/as/ref', { templateUrl: 'views/signup.html' })
        .when('/vendor/new', { templateUrl: 'views/vendor/new.html' })
        .when('/vendor/manage/:masterId', { templateUrl: 'views/vendor/manage.html' })
        .when('/vendor/manage/:masterId/:sub', { templateUrl: 'views/vendor/manage.html' })
        .when('/vendor/manage/:masterId/:sub/:subId', { templateUrl: 'views/vendor/manage.html' })
        .when('/sell', { templateUrl: 'views/sell.html' })
        .when('/referral-program', { templateUrl: 'views/referral-program.html' })

        .when('/cart', { redirectTo: '/checkout/cart' })
        .when('/checkout', { templateUrl: 'views/checkout.html' })
        .when('/checkout/:sub', { templateUrl: 'views/checkout.html' })

        .when('/wishlist', { templateUrl: 'views/wishlist.html' })

        .when('/admin', { templateUrl: 'views/admin/manage.html' })
        .when('/admin/manage', { templateUrl: 'views/admin/manage.html' })
        .when('/admin/manage/:sub', { templateUrl: 'views/admin/manage.html' })
        .when('/admin/manage/:sub/:q', { templateUrl: 'views/admin/manage.html' })

        .when('/terms-of-service', { templateUrl: 'views/terms-of-service.html' })
        .when('/privacy-policy', { templateUrl: 'views/privacy-policy.html' })

        .when('/vendorsignup', { templateUrl: 'views/mode.html' })
        .when('/bypass', { templateUrl: 'views/bypass.html' })



        .otherwise({ redirectTo: 'index' });

    $locationProvider.html5Mode(true);
}]);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.directive('ngIncludeLocal', function () {
    return {
        templateUrl: function (elem, attrs) { return attrs.ngIncludeLocal; },
        restrict: 'AE'        
    };
});

app.directive('ngAutocomplete', function () {
    return {
        require: 'ngModel',
        scope: {
            ngAutocompleteSelect: '='
        },
        link: function (scope, el, attr, ngModel) {
            var _self = this;
            var url = attr.ngAutocomplete;
            var options = {

                url: function (phrase) {
                    return url + (url.indexOf('?') > 0 ? '&' : '?') + 'search=' + phrase;
                },

                getValue: "Name",

                list: {
                    onKeyEnterEvent: function () {
                        console.log(attr);
                        ngModel.$setViewValue($(el).val());
                        $(el).trigger('change');                        
                    }
                },

                requestDelay: 500

            };
            $(el).easyAutocomplete(options);
            $(el).change(function () {
                scope.ngAutocompleteSelect($(this).getSelectedItemData());
            });
        }
    };
});


function encodeToHtmlChars(rawStr) {
    return rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
}


function toEnc(s) {
    return encodeURIComponent(btoa(encodeToHtmlChars(angular.toJson(s))));
}

function fromEnc(s) {
    return angular.fromJson(atob(decodeURIComponent(s)));
}

function toParams(o) {
    var s = '';
    for (i in o) {
        if (s.length > 0)
            s += '&';
        s += i + '=' + o[i];
    }
    return s;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function formatDate(date) {


    var day = new String(date.getDate());
    var month = new String(date.getMonth()+1);
    var year = new String(date.getFullYear());

    if (day.length < 2)
        day = '0' + day;

    if (month.length < 2)
        month = '0' + month;

    return month + '/' + day + '/' + year;
}

function formatTime(date) {


    var hours = new String(date.getHours());
    var minutes = new String(date.getMinutes());

    if (hours.length < 2)
        hours = '0' + hours;

    if (minutes.length < 2)
        minutes = '0' + minutes;

    return hours + ':' + minutes;
}

function encodeToHtmlChars(rawStr) {
    return rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
}


function toEnc(s) {
    return encodeURIComponent(btoa(encodeToHtmlChars(angular.toJson(s))));
}

function fromEnc(s) {
    return angular.fromJson(atob(decodeURIComponent(s)));
}
