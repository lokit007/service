function onLoadData(url, method, data, cb) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        beforeSend: function(){
            $('#waiting').removeClass('hide')
            $('#waiting').addClass('show')
        },
        error(err) {
            return cb(err, {req: false, data: null})
        },
        success: function(results) {
            return cb(null, {req: true, data: results})
        },
        complete: function(){
            $('#waiting').removeClass('show')
            $('#waiting').addClass('hide')
        }
    });
}
function eventSpan(){
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
}
var page = 1
function searchKeyMail(first) {
    var search = $("#txtSearch").val();
    if(first) page = 1
    if(page == 1) $('.previous').addClass('disabled')
    else  $('.previous').removeClass('disabled')
    onLoadData("/service/searchemail", "get", {key:search, page:page}, function(err, result) {
        if(err) eModal.alert("Không thể tìm kiếm dữ liệu bạn cần!", "Không tìm thấy dữ liệu!");
        else if(result.req) {
            if(result.data.req) {
                if(first) $(".rowdata").remove();
                result.data.data.forEach(element => {
                    this.rowdata = $('<tr class="rowdata page'+page+'"></tr>');
                    $('<td>'+element.Id+'</td>').appendTo(this.rowdata);
                    $('<td class="text-left">'+element.MacKey+'</td>').appendTo(this.rowdata);
                    $('<td>'+element.State+'</td>').appendTo(this.rowdata);
                    $('<td>'+element.DateBlock+'</td>').appendTo(this.rowdata);
                    $('<td class="text-left">'+element.NameUser+'</td>').appendTo(this.rowdata);
                    $('<td class="text-left">'+element.Phone+'</td>').appendTo(this.rowdata);
                    $('<td class="text-left">'+element.Email+'</td>').appendTo(this.rowdata);
                    $('<td class="change"><span class="glyphicon glyphicon-off"></span><span class="glyphicon glyphicon-time"></span><span class="glyphicon glyphicon-trash"></span></td>').appendTo(this.rowdata);
                    this.rowdata.appendTo(".table.table-hover.table-bordered");
                });
                var objSpanChange = $('td.change span.glyphicon');
                objSpanChange.on('click', eventSpan)
                if($('.page'+page).length < 20) $('.next').addClass('disabled')
            } else eModal.alert("Không thể tìm kiếm dữ liệu bạn cần!", "Không tìm thấy dữ liệu!");
        } else eModal.alert("Không thể tìm kiếm dữ liệu bạn cần!", "Không tìm thấy dữ liệu!");
    });
}
function getStateString(state) {
    switch(state) {
        case -2: return "-2 : Khóa vĩnh viễn";
        case -1: return "-1 : Khóa tạm thời";
        case 0: return "0 : Dùng cho 5 máy";
        case 1: return "1 : Dùng cho 5 máy vô thời hạn";
        case 2: return "2 : Đăng ký dùng";
        case 3: return "3 : Dùng thử";
        case 5: return "5 : Active vô thời hạn";
        default: return "Trạng thái khác";
    }
}
function drawPieChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Trạng Thái');
    data.addColumn('number', 'Phần Trăm');
    chartData.data1.forEach(function(element) {
        data.addRow([getStateString(element.State), element.SoLuong]);
    })
    var chart = new google.visualization.PieChart(document.getElementById('myPieChart'));
    var options = {
        title: 'Thống kê trạng thái người dùng'
    };
    chart.draw(data, options);
}
function drawColunmChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Tháng');
    data.addColumn('number', 'Số lượng');
    chartData.data2.forEach(function(element) {
        data.addRow([element.MonthRegit, element.Number]);
    })
    var chart = new google.visualization.ColumnChart(document.getElementById('myColumnChart'));
    var options = {
        title: 'Thống kê người dùng phầm mềm'
    };
    chart.draw(data, options);
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
    objSpanChange.on('click', eventSpan)
    var objPrevious = $('.previous');
    var objNext = $('.next');
    objPrevious.on('click', function(){
        if(page != 1) {
            var data = $('.page' + page)
            if(data.length < 20) objNext.removeClass('disabled')
            data.addClass('hide');
            page -= 1
            $('.page' + page).removeClass('hide');
            if(page == 1) objPrevious.addClass('disabled')
        }
    })
    objNext.on('click', function(){
        if(objNext.hasClass('disabled') == false) {
            objPrevious.removeClass('disabled')
            $('.page' + page).addClass('hide');
            page += 1
            var data = $('.page' + page)
            if(data.length > 0) {
                if(data.length < 20) objNext.addClass('disabled')
                $('.page' + page).removeClass('hide');
            } else {
                searchKeyMail(false)
            }
        }
    })
});