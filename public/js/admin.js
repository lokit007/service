$(document).ready(function() {
    $('.show-menu').click(function(e) {
        var obj = $(this).children('ul.sub-menu');
        if(obj.hasClass("view")) obj.removeClass("view");
        else obj.addClass("view");
    });
});