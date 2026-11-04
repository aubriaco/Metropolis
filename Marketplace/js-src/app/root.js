
app.controller('Root', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
        $scope.RootLive = false;
        $scope.RootMode = 'default';
        $scope.RootTheme = '/views/_themes/default.html';
        $scope.RootThemeDefault = $scope.RootTheme;
        $scope.MainLoaded = false;
        $scope.User = false;
        $scope.Modal = { tpl: 'blank' };
        $scope.ModalHideCallback = false;
        $scope.General = {};
        $scope.Filters = { Clear: true };
        $scope.CurrentLangName = 'English';
        $scope.CurrentLang = 'en';
        $scope.Languages = [
            { ident: 'en', name: 'English', flag: 'us' },
            { ident: 'es', name: 'Español', flag: 'pr' }
        ];
        $scope.CurrentLangItem = $scope.Languages[0];
        $scope.Rand = String(Math.random()).replace('.', '');
        $scope.Version = 0;

        $scope.Bools = [
            true,
            false
        ];

        $scope.Countries = [];

        $scope.States = {
            USA: [
                { ident: 'AL', name: 'Alabama' },
                { ident: 'AK', name: 'Alaska' },
                { ident: 'AZ', name: 'Arizona' },
                { ident: 'AR', name: 'Arkansas' },
                { ident: 'CA', name: 'California' },
                { ident: 'CO', name: 'Colorado' },
                { ident: 'CT', name: 'Connecticut' },
                { ident: 'DE', name: 'Delaware' },
                { ident: 'DC', name: 'District Of Columbia' },
                { ident: 'FL', name: 'Florida' },
                { ident: 'GA', name: 'Georgia' },
                { ident: 'HI', name: 'Hawaii' },
                { ident: 'ID', name: 'Idaho' },
                { ident: 'IL', name: 'Illinois' },
                { ident: 'IN', name: 'Indiana' },
                { ident: 'IA', name: 'Iowa' },
                { ident: 'KS', name: 'Kansas' },
                { ident: 'KY', name: 'Kentucky' },
                { ident: 'LA', name: 'Louisiana' },
                { ident: 'ME', name: 'Maine' },
                { ident: 'MD', name: 'Maryland' },
                { ident: 'MA', name: 'Massachusetts' },
                { ident: 'MI', name: 'Michigan' },
                { ident: 'MN', name: 'Minnesota' },
                { ident: 'MS', name: 'Mississippi' },
                { ident: 'MO', name: 'Missouri' },
                { ident: 'MT', name: 'Montana' },
                { ident: 'NE', name: 'Nebraska' },
                { ident: 'NV', name: 'Nevada' },
                { ident: 'NH', name: 'New Hampshire' },
                { ident: 'NJ', name: 'New Jersey' },
                { ident: 'NM', name: 'New Mexico' },
                { ident: 'NY', name: 'New York' },
                { ident: 'NC', name: 'North Carolina' },
                { ident: 'ND', name: 'North Dakota' },
                { ident: 'OH', name: 'Ohio' },
                { ident: 'OK', name: 'Oklahoma' },
                { ident: 'OR', name: 'Oregon' },
                { ident: 'PA', name: 'Pennsylvania' },
                { ident: 'RI', name: 'Rhode Island' },
                { ident: 'SC', name: 'South Carolina' },
                { ident: 'SD', name: 'South Dakota' },
                { ident: 'TN', name: 'Tennessee' },
                { ident: 'TX', name: 'Texas' },
                { ident: 'UT', name: 'Utah' },
                { ident: 'VT', name: 'Vermont' },
                { ident: 'VA', name: 'Virginia' },
                { ident: 'WA', name: 'Washington' },
                { ident: 'WV', name: 'West Virginia' },
                { ident: 'WI', name: 'Wisconsin' },
                { ident: 'WY', name: 'Wyoming' }
            ],
            Canada: [
                { ident: 'AB', name: 'Alberta' },
                { ident: 'BC', name: 'British Columbia' },
                { ident: 'MB', name: 'Manitoba' },
                { ident: 'NB', name: 'New Brunswick' },
                { ident: 'NL', name: 'Newfoundland and Labrador' },
                { ident: 'NT', name: 'Northwest Territories' },
                { ident: 'NS', name: 'Nova Scotia' },
                { ident: 'NU', name: 'Nunavut' },
                { ident: 'ON', name: 'Ontario' },
                { ident: 'PE', name: 'Prince Edward Island' },
                { ident: 'QC', name: 'Quebec' },
                { ident: 'SK', name: 'SaskatchewanYukon' },
                { ident: 'YT', name: 'Yukon' }
            ]
        };


        // Alert
        $scope._Alert = function () {
            var _self = this;
            var eleID = 'modal-alert';
            var eventBound = false;
            var modal = null;
            this.Shown = false;
            this.Current = null;
            this.NextList = [];

            this.click = function (a) {
                if (!_self.Current.callback)
                    return;
                _self.Current.callback(a);
                if(modal)
                    modal.hide();
            };

            this.getNext = function () {
                if (_self.NextList.length == 0)
                    return null;
                var msg = _self.NextList[0];
                _self.NextList.splice(0, 1);
                return msg;
            };

            this.next = function () {
                var msg = _self.getNext();
                if (msg) {
                    $timeout(function () {
                        _self.show(msg);
                    }, 500);
                }
            };

            this.show = function (msg, buttons, callback) {
                console.log('Alert.show', msg);
                if (!buttons)
                    buttons = [];
                _self.NextList.push({ msg: msg, buttons: buttons, callback: callback });
                if (_self.Shown)
                    return;

                _self.Shown = true;
                _self.Current = _self.getNext();
                var ele = document.getElementById(eleID);
                modal = new bootstrap.Modal(ele);
                modal.show();
                if (!eventBound) {
                    ele.addEventListener('hide.bs.modal', function () {
                        _self.Shown = false;
                        _self.Current = null;
                        _self.next();
                    });
                    eventBound = true;
                }
            };
        };
        $scope.Alert = new $scope._Alert();

        $scope.alert = function (a) {
            $scope.Alert.show(a);
        };

        $scope.confirm = function (a, callback) {
            if (!callback)
                return confirm(a);
            var cb = function (r) {
                if (r == 'OK')
                    callback();
            };
            $scope.Alert.show(a, ['OK', 'Cancel'], cb);
        };

        $scope.pullCurrentLang = function () {
            var params = $scope.parseQS();
            if (params && params.lang)
                $scope.setCurrentLangByIdent(params.lang);
            else {
                $http.get('api/content/lang/get').then(function (r) {
                    if (!r.data.errorCode) {
                        $scope.setCurrentLangByIdent(r.data.item);
                    }
                });
            }
        };

        $scope.setCurrentLang = function (a, c) {
            $scope.CurrentLangItem = a;
            $scope.CurrentLang = a.ident;
            $scope.CurrentLangName = a.name;
            if (c) {
                $http.post('api/content/lang/set/' + a.ident).then(function (r) {
                    if (r.data.errorCode)
                        console.log('Lang set error', r.data.errorMessage);
                });
            }
        };

        $scope.setCurrentLangByIdent = function (a, c) {
            $scope.Languages.forEach(function (i) {
                if (i.ident == a) {
                    $scope.setCurrentLang(i, c);
                }
            });
        };

        $scope.getLang = function (a) {
            if ($scope.Lang && $scope.Lang[a] && $scope.Lang[a][$scope.CurrentLang])
                return $scope.Lang[a][$scope.CurrentLang];
            return a;
        };

        $scope.loadLang = function () {
            $http.get('lang/dict.json?v=' + $scope.Version).then(function (r) {
                $scope.Lang = r.data;
                $scope.pullCurrentLang();
            });
        };

        $scope.BoolOptions = [
            { ID: true, Name: 'True' },
            { ID: false, Name: 'False' }
        ];

        $scope.scrollTop = function () {
            $(window).scrollTop(0);
        };

        $scope.initTooltips = function () {
            console.log('Init tooltips.');
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            });
        };

        $scope.$on('$locationChangeStart', function (event) {
            //$(window).scrollTop(0);
            $('#globalsearch').val('');
        });

        $scope.$on('$locationChangeSuccess', function (event) {
            $(window).scrollTop(0);
        });

        $scope.parseQS = function () {
            var qs = document.location.search;
            var data = {};
            if (qs.length > 0) {
                if (qs.substr(0, 1) == '?')
                    qs = qs.substr(1);
                var p = qs.split('&');

                p.forEach(function (i) {
                    var q = i.indexOf('=');
                    if (q > -1) {
                        var a = i.substr(0, q);
                        var b = i.substr(q + 1);
                        data[a] = b;
                    }
                });
            }
            return data;
        };

        $scope.encLoc = function (a) {
            if (!a)
                a = $location.path();
            return btoa(a).replace(/=/g, '-') + 'Z';
        };

        $scope.decLoc = function (a) {
            return atob(a.substr(0, a.length - 1).replace(/-/g, '='));
        };

        $scope.capitalize = function (a) {
            if (!a || a.length == 0)
                return '';
            a = a.trim();
            var ms = a.match(/ [a-z]/g);
            if (ms) {
                ms.forEach(function (i) {
                    a = a.replace(i, i.toUpperCase());
                });
            }

            var c = a.slice(0, 1);
            var r = c.toUpperCase();
            if (a.length > 1)
                r += a.substr(1);

            return r;
        };

        $scope.deepscan = function (a) {
            b = {};
            for (i in a) {
                b[i] = a[i];
            }
            return b;
        };

        $scope.makeArray = function (a) {
            var b = [];
            for (var n = 0; n < a.length; n++) {
                b.push(a[n]);
            }
            return b;
        };

        $scope.mergeobjs = function (a, b) {
            Object.assign(a, b);
        };

        $scope.set = function (a, b) {
            $scope[a] = b;
        };

        $scope.get = function (a) {
            return $scope[a];
        };

        $scope.fetch = function (a, b, c, def) {
            if (!a)
                return false;
            if (!c) c = 'id';
            for (var n = 0; n < a.length; n++) {
                if (a[n][c] == b)
                    return a[n];
            }
            return def !== undefined ? def : false;
        };

        $scope.groupBy2 = function (list, v, sums) {
            var result = [];
            for (var n = 0; n < list.length; n++) {
                var item = list[n];
                var node = $scope.fetch(result, item[v], v);
                if (!node) {
                    node = { ID: item[v], __children: [] };
                    node[v] = item[v];
                    result.push(node);
                }
                node.__children.push(item);
                if (sums) {
                    for (var i = 0; i < sums.length; i++) {
                        var s = sums[i];
                        if (node[s] === undefined || node[s] == null)
                            node[s] = 0;
                        if (s == "__counter")
                            node[s]++;
                        else
                            node[s] += item[s];
                    }
                }
            }
            return result;
        };

        $scope.addElement = function (a, b) {
            if (!b)
                b = {};
            a.push(b);
        };

        $scope.removeElement = function (a, b) {
            a.splice(a.indexOf(b), 1);
        };

        $scope.pulse = function () {
            $scope.Pulse = true;
            $timeout(function () {
                $scope.Pulse = false;
            }, 2000);
        };

        $scope.showNotify = function (msg, title) {
            var opts = {
                "closeButton": true,
                "debug": false,
                "positionClass": "toast-top-right toast-default",
                "toastClass": "black",
                "onclick": null,
                "showDuration": "100",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };

            toastr.info(msg, title, opts);

        };

        $scope.showMessage = function (s) {
            $scope.Message = s;
            $timeout(function () {
                $scope.Message = false;
            }, 5000);
        };

        $scope.hideMessage = function () {
            $scope.Message = false;
        };

        $scope.hideError = function () {
            $scope.Error = false;
        };

        $scope.showError = function (s) {
            $scope.Error = s;
            $timeout(function () {
                $scope.Error = false;
            }, 5000);
        };

        $scope.isLoc = function (loc, sub) {
            if (!sub && $location.path().length > loc.length) {
                return ($location.path().substr(0, loc.length) == loc);
            }
            return ($location.path() == loc);
        };


        $scope.goBack = function () {
            history.go(-1);
        };

        $scope.scrollTo = function (eleID) {
            var ele = document.getElementById(eleID);
            if(ele)
                ele.scrollIntoView();
        };

        $scope.showModal = function (title, tpl) {
            $scope.Modal = { title: title, tpl: tpl };
            $('#modal').modal();
            $('#modal').on('hide.bs.modal', function () {
                $scope.Modal = { tpl: 'blank' };
                if ($scope.ModalHideCallback) {
                    $scope.ModalHideCallback();
                    $scope.ModalHideCallback = null;
                }
            });
        };

        $scope.showModalProgress = function (msg) {
            $scope.Modal = { title: 'Please wait...', msg: msg, progress: true };
            $('#modal').modal();
            $('#modal').on('hide.bs.modal', function () {
                $scope.Modal = false;
            });
        };

        $scope.showModalMessage = function (msg) {
            $scope.Modal = { title: 'Alert', msg: msg };
            $('#modal').modal();
            $('#modal').on('hide.bs.modal', function () {
                $scope.Modal = false;
            });
        };

        $scope.hardReload = function () {
            window.location.reload(true);
        };

        $scope.hideModal = function () {
            $('#modal').modal('hide');
            $scope.Modal = false;
        };

        $scope.logout = function () {
            $http({ method: 'POST', url: 'api/auth/logout' }).then(function (r) {
                $scope.User = null;
                $location.path('/');
            });
        };

        $scope.round = function (n) {
            return Math.round(n);
        };

        $scope.sum = function (a, i) {
            if (!a || !a.length)
                return 0;
            var s = 0;
            for (var n = 0; n < a.length; n++) {
                s += a[n][i];
            }
            return s;
        };

        $scope.formatCurrency = function (n, t) {
            if (!n)
                n = 0;
            if (!t)
                t = '';
            return t + n.toFixed(2).replace(/./g, function (c, i, a) {
                return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
            });
        };

        $scope.formatPhone = function (s) {
            if (!s)
                return '';
            var cc = '';
            if (s.length == 12 && s.substr(0, 2) == '+1')
                s = s.substr(2);
            else if (s.length > 10) {
                var d = s.length - 10;
                cc = s.substr(0, d) + ' ';
                s = s.substr(d);
            }
            return cc + '(' + s.substr(0, 3) + ') ' + s.substr(3, 3) + '-' + s.substr(6);
        };

        $scope.formatDate = function (dt) {
            var mm = dt.getMonth() + 1;
            var dd = dt.getDate();

            return [(mm > 9 ? '' : '0') + mm, '/',
            (dd > 9 ? '' : '0') + dd, '/',
            dt.getFullYear()
            ].join('');
        };

        $scope.getPageModel = function (pageCount, current) {
            var model = [];
            var center = current - 10;
            var max = center + 20;
            if (max > pageCount)
                max = pageCount;
            if (center < 1)
                center = 1;
            var page = center;

            if (center > 1)
                model.push({ page: 1, current: (current == 1) });

            for (var n = center; n <= max; n++) {
                model.push({ page: page, current: (current == page) });
                page++;
            }

            if (max < pageCount)
                model.push({ page: pageCount - 1, current: (current == pageCount - 1) });

            return model;
        };

        $scope.addToItem = function (v, item) {
            if (!item[v])
                item[v] = [];
            item[v].push({});
        }

        $scope.removeFromItem = function (v, item, a) {
            if (!item[v])
                return;
            item[v].splice(item[v].indexOf(a), 1);
        }

        $scope.initAddressLookup = function (item, id) {
            if (!id)
                id = 'address-lookup';
            $timeout(function () {
                var ac = new google.maps.places.Autocomplete((
                    document.getElementById(id)), {
                });
                console.log(id);
                console.log(document.getElementById(id));
                console.log('Initialized address lookup.');
                ac.addListener('place_changed', function () {
                    var place = ac.getPlace();

                    var com = place.address_components;
                    item.Address1 = '';
                    for (var n = 0; n < com.length; n++) {
                        if (com[n].types.indexOf('street_number') >= 0 || com[n].types.indexOf('route') >= 0)
                            item.Address1 += com[n].long_name + ' ';
                        else if (com[n].types.indexOf('sublocality') >= 0)
                            item.Address2 = com[n].long_name;
                        else if (com[n].types.indexOf('locality') >= 0)
                            item.City = com[n].long_name;
                        else if (com[n].types.indexOf('administrative_area_level_1') >= 0)
                            item.State = com[n].short_name;
                        else if (com[n].types.indexOf('country') >= 0) {
                            var country = com[n].short_name;
                            if (country == 'US')
                                country = 'USA';
                            item.Country = country;
                        }
                        else if (com[n].types.indexOf('postal_code') >= 0)
                            item.ZipCode = com[n].long_name;
                    }
                });
            }, 1000);
        }


        $scope.rootSearch = function (q) {
            $location.path('/search/' + encodeURIComponent(q));
        }

        $scope.initAutoComplete = function () {

            $('.autocomplete').each(function () {
                var _self = this;
                var url = $(this).attr('autocomplete-url');
                var options = {

                    url: function (phrase) {
                        return url + (url.indexOf('?') > 0 ? '&' : '?') + 'search=' + phrase;
                    },

                    getValue: "Name",

                    list: {
                        onKeyEnterEvent: function () {
                            console.log('trigger');
                            $(_self).trigger('change');
                        }
                    },

                    requestDelay: 500

                };
                $(this).easyAutocomplete(options);
            });

        };


        $scope.initAutoCompleteDelayed = function () {
            console.log('Init auto complete delayed.');
            $timeout(function () {
                $scope.initAutoComplete();
            }, 500);
        };


        $scope.expandAutoCompleteLoop = function () {
            $('.autocomplete').css('width', '100%');
            $timeout($scope.expandAutoCompleteLoop, 100);
        };
        $scope.expandAutoCompleteLoop();

        function sortOn(collection, name) {

            collection.sort(
                function (a, b) {
                    if (a[name] <= b[name]) {
                        return (-1);
                    }
                    return (1);
                }
            );
        }



        $scope.groupBy = function (list, attribute) {

            var groups = [];

            sortOn(list, attribute);

            var groupValue = "_INVALID_GROUP_VALUE_";
            var group = null;
            for (var i = 0; i < list.length; i++) {

                var item = list[i];

                if (item[attribute] !== groupValue) {

                    group = {
                        lead: item,
                        items: []
                    };

                    groupValue = item[attribute];

                    groups.push(group);

                }

                group.items.push(item);

            }

            return groups;

        };

        $scope.convertDate = function (a) {
            if (a.indexOf('T') != -1) {
                var p = a.split('T');
                var d = p[0].split('-');
                var t = p[1].split(':');
                return d[1] + '/' + d[2] + '/' + d[0] + ' ' + t[0] + ':' + t[1];
            }
            else {
                var d = a.split('-');
                return d[1] + '/' + d[2] + '/' + d[0];
            }
            return a;
        };

        $scope.convertDateNoTime = function (a) {
            if (a.indexOf('T') != -1) {
                var p = a.split('T');
                var d = p[0].split('-');
                return d[1] + '/' + d[2] + '/' + d[0];
            }
            else {
                var d = a.split('-');
                return d[1] + '/' + d[2] + '/' + d[0];
            }
            return a;
        };

        $scope.convertListDates = function (a) {
            a.forEach(function (i) {
                for (j in i) {
                    if (i[j]) {
                        if (j.indexOf('Date') != -1 && j.indexOf('BirthDate') == -1 && j.indexOf('birthDate') == -1) {
                            i[j] = $scope.convertDate(i[j]);
                        }
                    }
                }
            });
        };

        $scope.dataDate = function (a) {
            if (a.indexOf('/') != -1) {
                var p = a.split('/');
                return p[2] + '-' + p[0] + '-' + p[1];
            }
            return null;
        };

        $scope.dataTime = function (a) {
            if (a.indexOf(':') != -1) {
                var p = a.split(':');
                if (p.length == 2)
                    return a + ':00';
            }
            return null;
        };

        $scope.dataDateTime = function (a) {
            if (a.indexOf(' ') != -1) {
                var p = a.split(' ');
                var d = $scope.dataDate(p[0]);
                var t = $scope.dataTime(p[1]);
                if (!d)
                    return '0001-01-01T00:00:00';
                if (!t)
                    t = '00:00:00';
                return d + 'T' + t;
            }
            return a;
        };

        $scope.getOnlyDate = function (a) {
            if (a.indexOf('T')) {
                var p = a.split('T');
                return p[0];
            }
            return a;
        };

        $scope.getOnlyTime = function (a) {
            if (a.indexOf('T')) {
                var p = a.split('T');
                return p[1];
            }
            return a;
        };

        $scope.isInvalidDate = function (a) {
            return (a == '01/01/0001' || a == '0001-01-01');
        };

        $scope.validatePhone = function (a) {
            return (a.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').length >= 10);
        };

        $scope.addressValidatePhone = function (a) {
            if (a && a.Phone) {
                if ($scope.validatePhone(a.Phone))
                    a.__phoneerror = null;
                else
                    a.__phoneerror = 'Invalid phone number.';
            }
        };

        $scope.hasSection = function (sec, sections) {
            if (!sections)
                sections = $scope.RoleSections;
            if (!sections)
                return false;
            for (var n = 0; n < sections.length; n++) {
                if (sections[n].section == sec)
                    return true;
            }
            return false;
        };

        $scope.initSliders = function () {
            $timeout(function () {
                $(".slider").each(function (i, el) {
                    var $this = $(el),
                        $label_1 = $('<span class="ui-label"></span>'),
                        $label_2 = $label_1.clone(),

                        orientation = attrDefault($this, 'vertical', 0) != 0 ? 'vertical' : 'horizontal',

                        prefix = attrDefault($this, 'prefix', ''),
                        postfix = attrDefault($this, 'postfix', ''),

                        fill = attrDefault($this, 'fill', ''),
                        $fill = $(fill),

                        step = attrDefault($this, 'step', 1),
                        value = attrDefault($this, 'value', 5),
                        min = attrDefault($this, 'min', 0),
                        max = attrDefault($this, 'max', 100),
                        min_val = attrDefault($this, 'min-val', 10),
                        max_val = attrDefault($this, 'max-val', 90),

                        is_range = $this.is('[data-min-val]') || $this.is('[data-max-val]'),

                        reps = 0;


                    // Range Slider Options
                    if (is_range) {
                        $this.slider({
                            range: true,
                            orientation: orientation,
                            min: min,
                            max: max,
                            values: [min_val, max_val],
                            step: step,
                            slide: function (e, ui) {
                                var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                                    max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                                $label_1.html(min_val);
                                $label_2.html(max_val);

                                if (fill)
                                    $fill.val(min_val + ',' + max_val);

                                reps++;
                            },
                            change: function (ev, ui) {
                                if (reps == 1) {
                                    var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                                        max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                                    $label_1.html(min_val);
                                    $label_2.html(max_val);

                                    if (fill)
                                        $fill.val(min_val + ',' + max_val);
                                }

                                reps = 0;
                            }
                        });

                        var $handles = $this.find('.ui-slider-handle');

                        $label_1.html((prefix ? prefix : '') + min_val + (postfix ? postfix : ''));
                        $handles.first().append($label_1);

                        $label_2.html((prefix ? prefix : '') + max_val + (postfix ? postfix : ''));
                        $handles.last().append($label_2);
                    }
                    // Normal Slider
                    else {

                        $this.slider({
                            range: attrDefault($this, 'basic', 0) ? false : "min",
                            orientation: orientation,
                            min: min,
                            max: max,
                            value: value,
                            step: step,
                            slide: function (ev, ui) {
                                var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                                $label_1.html(val);


                                if (fill)
                                    $fill.val(val);

                                reps++;
                            },
                            change: function (ev, ui) {
                                if (reps == 1) {
                                    var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                                    $label_1.html(val);

                                    if (fill)
                                        $fill.val(val);
                                }

                                reps = 0;
                            }
                        });

                        var $handles = $this.find('.ui-slider-handle');
                        //$fill = $('<div class="ui-fill"></div>');

                        $label_1.html((prefix ? prefix : '') + value + (postfix ? postfix : ''));
                        $handles.html($label_1);

                        //$handles.parent().prepend( $fill );

                        //$fill.width($handles.get(0).style.left);
                    }

                });
            }, 200);
        };

        $scope.checkEnv = function () {
            if (document.location.hostname.startsWith('uat.')) {
                console.log(document.location.hostname);
                var ele = document.getElementById('dev-env');
                if (!ele)
                    setTimeout($scope.checkEnv, 100);
                else
                    ele.style.display = 'block';
            }
        };
        $scope.checkEnv();

        $scope.themeLoop = function () {
            if ($location.path().length >= 8 && $location.path().substr(0, 8) == '/vendor/')
                $scope.RootTheme = '/views/_themes/dashboard.html?v=' + $scope.Version;
            else if ($location.path().length >= 7 && $location.path().substr(0, 7) == '/admin/')
                $scope.RootTheme = '/views/_themes/admin.html?v=' + $scope.Version;
            else if ($scope.RootTheme != $scope.RootThemeDefault)
                $scope.RootTheme = $scope.RootThemeDefault;
            $timeout($scope.themeLoop, 200);
        };
        $scope.themeLoop();

        $scope.loadMode = function () {
            $http.get('/api/content/mode/get').then(function (r) {
                if (!r.data.errorCode) {
                    if (r.data.item && r.data.item == 'vendorsignup') {
                        $scope.RootTheme = '/views/_themes/stripped.html?v=' + $scope.Version;
                        $scope.RootThemeDefault = $scope.RootTheme;
                        $scope.RootMode = r.data.item;
                        $('#landing').css('display', 'none');
                        $('#body-wrapper').css('display', 'block');
                    }
                }
                else {
                    $scope.RootTheme = '/views/_themes/default.html?v=' + $scope.Version;
                    $scope.RootThemeDefault = $scope.RootTheme;
                }                
            });
        };

        $scope.setModeAsVendorSignup = function () {
            $http.post('/api/content/mode/set/vendorsignup').then(function (r) {
                if (!r.data.errorCode) {
                    $scope.RootTheme = '/views/_themes/stripped.html?v=' + $scope.Version;
                    $scope.RootMode = 'vendorsignup';
                    $scope.RootThemeDefault = $scope.RootTheme;
                    $('#landing').css('display', 'none');
                    $('#body-wrapper').css('display', 'block');
                    $location.path('/sell');
                }
            });
        };

        $scope.setModeFromLoc = function () {
            var loc = $location.path();
            if (loc.length > 2) {
                loc = loc.substr(1);
                if (loc == 'vendorsignup') {
                    $scope.setModeAsVendorSignup();
                }

            }
        };

        $http.get('api/auth/config').then(function (r) {
            if (r.data.item.debug && r.data.item.ident == "prod") {
                $('#landing').css('display', 'block');
                $scope.RootLive = false;
            }
            else {
                $('#body-wrapper').css('display', 'block');
                $scope.RootLive = true;
            }
            $('#loading').css('display', 'none');
            if (r.data.item.requireSSL) {
                if (document.location.href.indexOf('https://') == -1) {
                    document.location.replace('https://' + document.location.href.substr(document.location.href.indexOf('//') + 2));
                    return;
                }
            }
            $scope.loadMode();
        });

        $scope.UploaderCallback = null;

        $scope.setUploaderCallback = function (a) {
            $scope.UploaderCallback = a;
        };

        $scope.pullUser = function (callback) {
            $http.get('api/auth/user').then(function (r) {
                if (r.data.errorCode)
                    $scope.User = false;
                else
                    $scope.User = r.data.item;
                if (callback)
                    callback($scope.User);
            });
        };

        $scope.pullUser();

        $scope.requireUser = function () {
            $scope.pullUser(function (u) {
                if (!u)
                    $location.path('/login');
            });
        };

        $scope.requireAdmin = function () {
            $scope.pullUser(function (u) {
                if (!u || !u.isAdmin)
                    $location.path('/login');
            });
        };

        $scope.bypass = function () {
            $http.post('api/content/bypass').then(function (r) {
                if (r.data.errorCode)
                    $scope.alert(r.data.errorMessage);
                else {
                    $scope.RootMode = 'bypass';
                    document.location.replace('/index');
                }
            });
        };

        $scope.go = function (a) {
            $location.path(a);
        };

        $scope.toTagInput = function (l) {
            var r = [];
            l.forEach(function (i) {
                r.push({ text: i });
            });
            return r;
        };

        $scope.fromTagInput = function (l) {
            var r = [];
            l.forEach(function (i) {
                r.push(i.text);
            });
            return r;
        };

        $scope.makeNullIfZero = function (a, l) {
            l.forEach(function (i) {
                if (a[i] == 0)
                    a[i] = null;
            });
        };

        $scope.makeZeroIfNull = function (a, l) {
            l.forEach(function (i) {
                if (a[i] === null)
                    a[i] = 0;
            });
        };

        $scope.processList = function (l) {
            for (var n = 0; n < l.length; n++) {
                l[n] = $scope.processItem(l[n]);
            }
            return l;
        };

        $scope.processItem = function (a) {
            for (var k in a) {
                if (k.indexOf('Date') != -1) {
                    if (a[k].indexOf(':') != -1 && a[k].indexOf('00:00:00') == -1)
                        a[k] = $scope.formatRespDateTime(a[k])
                    else if (a[k].indexOf('-') != -1)
                        a[k] = $scope.formatRespDate(a[k])
                }
            }
            return a;
        };

        $scope.processRequestDate = function (a) {
            if (a.indexOf('/') != -1) {
                var p = a.split('/');
                return p[2] + '-' + p[0] + '-' + p[1];
            }
        };

        $scope.processRequest = function (a) {
            for (var k in a) {
                if (k.indexOf('Date') != -1) {
                    if (a[k] != null) {
                        if (a[k].indexOf(' ') != -1) {
                            var p = a[k].split(' ');
                            if (p.length >= 2) {
                                a[k] = $scope.processRequestDate(p[0]) + 'T' + p[1];
                            }
                        }
                        else
                            a[k] = $scope.processRequestDate(a[k]);
                    }
                }
            }
            return a;
        };


        $scope.formatRespDateTime = function (s) {
            if (!s)
                return 'None';
            var dt = new Date(s);
            var mm = dt.getMonth() + 1;
            var dd = dt.getDate();
            var h = dt.getHours();
            var m = dt.getMinutes();
            var yy = String(dt.getFullYear());
            while (yy.length < 4)
                yy = '0' + yy;

            return [(mm > 9 ? '' : '0') + mm, '/',
            (dd > 9 ? '' : '0') + dd, '/',
                yy,
            ' ' + (h > 9 ? '' : '0') + h + ':' + (m > 9 ? '' : '0') + m,
            $scope.Globals && $scope.Globals.TimeZone ? (' ' + $scope.Globals.TimeZone) : ''
            ].join('');
        };

        $scope.formatDate = function (dt) {
            var mm = dt.getMonth() + 1;
            var dd = dt.getDate();

            return [(mm > 9 ? '' : '0') + mm, '/',
            (dd > 9 ? '' : '0') + dd, '/',
            dt.getFullYear()
            ].join('');
        };


        $scope.initWysihtml = function (a) {
            new wysihtml.Editor($(a).find('textarea').get(0), {
                toolbar: $(a).find('.toolbar').get(0),
                parserRules: wysihtmlParserRules
            });


            $(a).find('.toolbar').addClass('bg-dark').addClass('bg-dark-1');

            $(a).find('.toolbar').html('<a data-wysihtml-command="bold" title="CTRL+B"><i class="bx bx-bold"></i></a> \
                        <a data-wysihtml-command="italic" title="CTRL+I"><i class="bx bx-italic"></i></a> \
                        <a data-wysihtml-command="underline"><i class="bx bx-underline"></i></a> \
                        <a data-wysihtml-command="formatBlock" data-wysihtml-command-value="h3"><i class="bx bx-heading"></i>1</a> \
                        <a data-wysihtml-command="formatBlock" data-wysihtml-command-value="h4"><i class="bx bx-heading"></i>2</a> \
                        <a data-wysihtml-command="formatBlock" data-wysihtml-command-blank-value="true">Normal</a> \
                        <a data-wysihtml-command="insertUnorderedList"><i class="bx bx-list-ul"></i></a> \
                        <a data-wysihtml-command="insertOrderedList"><i class="bx bx-list-ol"></i></a>');

            $(a).find('.toolbar a').addClass('btn').addClass('btn-light');
        };

        $scope.initUploader = function (scope, a, type, uploaderEle, callback) {
            var uploader = scope[a] = new FileUploader({
                url: 'api/storage/upload/' + type.replace(/\//g, '_')
            });

            uploader.onAfterAddingFile = function (fileItem) {
                fileItem.upload();
            };

            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                if (response.errorCode)
                    scope.alert(response.errorMessage);
                else {
                    if (callback)
                        callback(response);
                }
                scope[a].queue.splice(scope[a].queue.indexOf(fileItem), 1);
            };

            uploader.onCompleteAll = function () {
                console.info('Complete upload!');
            };

            scope.triggerUpload = function () {
                $(uploaderEle).trigger('click');
            };

        };

        $http.get('/api/content/version').then(function (r) {
            if (!r.data.errorCode)
                $scope.Version = r.data.item;
            $scope.loadLang();
        });


        $scope.pullCountries = function () {
            $http.get('/api/address/country/list').then(function (r) {
                if (!r.data.errorCode)
                    $scope.Countries = r.data.list;
            });
        };
        $scope.pullCountries();

        // Toast
        $scope._Toast = function () {
            var _self = this;
            this.List = [];

            this.remove = function (a) {
                _self.List.splice(_self.List.indexOf(a), 1);
            };

            this.add = function (title, message, icon, linkLoc, linkText) {
                if (!icon)
                    icon = 'bx-info-circle';
                var data = {
                    title: title,
                    message: message,
                    icon: icon,
                    linkLoc: linkLoc,
                    linkText: linkText,
                    close: function () {
                        _self.remove(data);
                    },
                    timer: function () {
                        setTimeout(data.close, 5000);
                    }
                };
                _self.List.unshift(data);
                data.timer();
            };
        };
        $scope.Toast = new $scope._Toast();

        // Cart
        $scope._Cart = function () {
            var _self = this;
            this.List = [];
            this.Total = 0;

            this.calc = function () {
                _self.Total = 0;
                _self.List.forEach(function (i) {
                    _self.Total += (i.price * i.cart.quantity);
                });
            };

            this.load = function () {
                $http.get('/api/cart/list').then(function (r) {
                    if (!r.data.errorCode) {
                        _self.List = r.data.list;
                        _self.calc();
                    }
                });
            };

            this.show = function () {
                var cartToggle = document.querySelector('#cart-menu-toggle')
                var dd = new bootstrap.Dropdown(cartToggle);
                dd.show();
            };

            this.add = function (productID) {
                var data = {
                    productID: productID,
                    quantity: 1
                };
                $http.post('/api/cart/add', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        _self.load();
                        $scope.Toast.add('Cart', 'Product has been added to cart.', null, '/checkout/cart', 'View Cart');
                    }
                });
                
            };

            this.remove = function (a) {
                var data = {
                    productID: a.id,
                    quantity: a.cart.quantity
                };
                $http.post('/api/cart/remove', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.alert(r.data.errorMessage);
                    else {
                        _self.load();
                        $scope.Toast.add('Cart', 'Product has been removed from cart.');
                    }
                });
                _self.List.splice(_self.List.indexOf(a), 1);
            };


            this.load();
        };
        $scope.Cart = new $scope._Cart();

        // Wishlist
        $scope._Wishlist = function () {
            var _self = this;
            this.List = [];

            this.load = function () {
                $http.get('/api/wishlist/list').then(function (r) {
                    if (!r.data.errorCode) {
                        _self.List = r.data.list;
                    }
                });
            };

            this.add = function (productID) {
                var data = {
                    productID: productID
                };
                $http.post('/api/wishlist/add', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.Toast.add('Wishlist', r.data.errorMessage, 'bx-error-circle', '/wishlist', 'View Wishlist');
                    else {
                        _self.load();
                        $scope.Toast.add('Wishlist', 'Product has been added to wishlist.', null, '/wishlist', 'View Wishlist');
                    }
                });

            };

            this.remove = function (a) {
                var data = {
                    productID: a.id
                };
                $http.post('/api/wishlist/remove', angular.toJson(data)).then(function (r) {
                    if (r.data.errorCode)
                        $scope.Toast.add('Wishlist', r.data.errorMessage, 'bx-error-circle');
                    else {
                        _self.load();
                        $scope.Toast.add('Wishlist', 'Product has been removed from wishlist.');
                    }
                });
                _self.List.splice(_self.List.indexOf(a), 1);
            };


            this.load();
        };
        $scope.Wishlist = new $scope._Wishlist();


    }]);
