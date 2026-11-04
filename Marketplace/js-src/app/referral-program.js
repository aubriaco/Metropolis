
app.controller('ReferralProgram', ['$scope', '$http', '$routeParams', '$sce', '$location', '$timeout', '$route', 'FileUploader',
    function ($scope, $http, $routeParams, $sce, $location, $timeout, $route, FileUploader) {
		$scope.initBanner = function () {
			$timeout(function () {
				$('.banner-slider').owlCarousel({
					loop: true,
					margin: 0,
					responsiveClass: true,
					nav: true,
					navText: [
						"<i class=\"bx bx-chevron-left\"></i>",
						"<i class=\"bx bx-chevron-right\"></i>"
					],
					dots: false,
					responsive: {
						0: {
							nav: false,
							margin: 0,
							items: 1
						},
						576: {
							nav: false,
							items: 1
						},
						768: {
							nav: false,
							items: 1
						},
						1024: {
							nav: false,
							items: 1
						},
						1366: {
							items: 1
						},
						1400: {
							items: 1
						}
					},
				})
			}), 500;
		};
    }]);