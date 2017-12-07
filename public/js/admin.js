function onLoadData(url, method, data, cb) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        error(err) {
            return cb(err, {req: false, data: null})
        },
        success: function(results) {
            return cb(null, {req: true, data: results})
        }
    });
}

$(document).ready(function () {
    $('.show-menu').click(function (e) {
        var obj = $(this).children('ul.sub-menu');
        if (obj.hasClass("view")) obj.removeClass("view");
        else obj.addClass("view");
    });
    var objOpen = $('[data-open]');
    objOpen.on("click", function () {
        var objShow = $($(this).attr('data-open'));
        if (objShow.hasClass('show')) {
            objShow.removeClass('show')
            objShow.addClass('hide')
        } else {
            objShow.removeClass('hide')
            objShow.addClass('show')
        }
    })
    var objSpanChange = $('td.change span.glyphicon');
    objSpanChange.on('click', function(){
        var objRow = $(this).parent().parent();
        var keymail = objRow.children(':first-child');
        var stateOld = objRow.children(':nth-child(3)');
        var date = objRow.children(':nth-child(4)')
        var stateNew = 0;
        if($(this).hasClass('glyphicon-off')) stateNew = -1; /* Khoa tam thoi */
        else if($(this).hasClass('glyphicon-time')) stateNew = 3; /* Them 1 thang dung */
        else if($(this).hasClass('glyphicon-trash')) stateNew = -2; /* Khoa vinh vien */
        onLoadData('/service/changestate', 'post', {key:keymail.html(), old:stateOld.html(), new:stateNew}, function(err, result) {
            if(err) eModal.alert("Không thể cập nhật dữ liệu!", "Lỗi cập nhật!");
            else if(result.req) {
                if(result.data.requets) {
                    if(stateNew < -1) objRow.remove()
                    else {
                        stateOld.html(stateNew)
                        date.html(result.data.keyvalue)
                    }
                    eModal.alert("Đã cập nhật dữ liệu trên hệ thống!", "Cập nhật thành công!");
                } else eModal.alert("Không thể cập nhật dữ liệu!", "Lỗi cập nhật!");
            } else eModal.alert("Không thể cập nhật dữ liệu!", "Lỗi cập nhật!");
        })
        // alert(keymail + " - " + stateOld + " - " + stateNew)
    })
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Element');
        data.addColumn('number', 'Percentage');
        data.addRows([
            ['Nitrogen', 0.78],
            ['Oxygen', 0.21],
            ['Other', 0.01]
        ]);
        var chart = new google.visualization.PieChart(document.getElementById('myPieChart'));
        chart.draw(data, null);
    }
});