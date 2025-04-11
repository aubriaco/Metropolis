$(function() {
	"use strict";

	$(document).ready(function () {
        $('.show_hide_password a').on('click', function (event) {
            event.preventDefault();
            if ($(this).parent().find('input').attr("type") == "text") {
                $(this).parent().find('input').attr('type', 'password');
                $(this).parent().find('i').addClass("bx-hide");
                $(this).parent().find('i').removeClass("bx-show");
            } else {
                $(this).parent().find('input').attr('type', 'text');
                $(this).parent().find('i').removeClass("bx-hide");
                $(this).parent().find('i').addClass("bx-show");
            }
        });
        $('.show_hide_password input').on('blur', function (event) {
            $(this).parent().find('input').attr('type', 'password');
            $(this).parent().find('i').addClass("bx-hide");
            $(this).parent().find('i').removeClass("bx-show");
        });
    });



});