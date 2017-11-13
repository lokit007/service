// Biến môi trường
var i18n = {};
// Các hàm xử lý chung cho các page
$.ajax({
    url: "/translate",
    type: "GET",
    datatype: "json",
    success: function(data){
        i18n = data;
    }
});
// Xử lý khi trang load hoàn tất
$(document).ready(function(){
    // Xu ly menu
    $("#menu").click(function(){
        if ($("#sub-memu").attr("style") == "display: initial;") {
            $("#sub-memu").attr("style", "display: none;");
            $("#btn-show-menu").attr("class", "fa fa-bars");
        } else {
            $("#sub-memu").attr("style", "display: initial;");
            $("#btn-show-menu").attr("class", "fa fa-bars fa-rotate-90");
        }
   });
   $("#sub-memu li").click(function(){
       if($(this).hasClass('active') == false) {
           var sel = $(this).attr("data");
           switch(sel) {
                case "1":
                    window.location.href = './personnel';
                    break;
                case "2":
                    window.location.href = './category';
                    break;
                case "3":
                    window.location.href = './partner';
                    break;
                case "4":
                    window.location.href = './warehouse';
                    break;
                case "5":
                    window.location.href = './statistical';
                    break;
                case "6":
                    window.location.href = './message';
                    break;
                default:
                    window.location.href = './branch';
            }
       }
   });
   // Xu ly form update Category
   $("#ic-close").click(function(){
       $("#f-update").hide(200);
   });
   $("#ic-show").click(function(){
       $("#f-update").show(100);
       $("#name").val("");
       $("#depiction").val("");
       $("#id").val("-1");
   });
   $('#d-contain').after("<i id='backToTop' class='fa fa-arrow-circle-up fa-3x' aria-hidden='true' style='display: none; position: fixed; bottom: 5px; right: 10px; cursor: pointer;'></i>");
   // Top page
   $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('#backToTop').fadeIn('slow');
        } else {
            $('#backToTop').fadeOut('slow');
        }
    });
    $("#backToTop").click(function(){
       $('html, body').animate({ scrollTop: 0 }, 500);
   });
   $("#d-fixheight").attr('style', 'max-height: ' + ($('#d-contain').height() - $("#view").offset().top - 10) + "px;");
    $(window).resize(function(){
        $("#d-fixheight").attr('style', 'max-height: ' + ($('#d-contain').height() - $("#view").offset().top - 10) + "px;");
    });
   // Input search
   $('input.search-control').on('change', function(){
        $('tbody').children('tr').remove();
        switch($(this).attr('data')) {
            case "branch" : 
                searchbranch();
                break;
            case "category" : 
                searchcategory();
                break;
            case "danhmuc" : 
                searchbranch();
                break;
            case "sanpham" : 
                searchbranch();
                break;
            case "khohang" : 
                searchbranch();
                break;
            default : 
                console.log("Not control search");
        }
   });
   // Tab index
   $('input.form-control').on('keypress', function(e){
        if(e.which == 13) {
            e.preventDefault();
            var index = +$(this).attr("index") + 1;
            $("[index='" + index +"']").focus();
        }
    });
   $('#btn-file').on("change",function(event) {
        var tmppath = URL.createObjectURL(event.target.files[0]);
        console.log(tmppath);
    });
    // Even model
    $('#mdShowMes').on('hidden.bs.modal', function (e) {
        if($('#md-div').hasClass('modal-error') === false) {
            window.location.reload(true);
        }
    });
});
/**
 * Alert design : Gọi để hiển thị alert
 * @param {* Trạng thái : error/warning/success} tp
 * @param {* Nhãn của alert} tl 
 * @param {* Nội dung alert} ct 
 */
function showAlert(tp, tl, ct) {
    if(tp === "error") {
        $("#md-div").attr("class", "modal-content modal-error");
        $("#md-title").attr("class", "fa fa-ban");
    } else if (tp === "warning") {
        $("#md-div").attr("class", "modal-content modal-warning");
        $("#md-title").attr("class", "fa fa-exclamation-triangle");
    } else {
        $("#md-div").attr("class", "modal-content modal-success");
        $("#md-title").attr("class", "fa fa-check-square-o");
    }
    $("#md-title").text(tl);
    $("#md-content").text(ct);
    $("#mdShowMes").modal('show');
}
// Chi nhánh
$(document).ready(function(){
    $("#add").click(function(){
        eModal.confirm("Nội dung tn", "Nội dung n").then(function() { alert("Click ok"); }, null);
        $("#key").val("-1");
    });
    // check validate
    $("form[name='branch-update']").validate({
        rules : {
            namebranch: "required",
            addressbranch: 'required',
            phonebranch: {
                required: true,
                digits: true,
                minlength: 10,
                maxlength: 20,
            }
        },
        messages : {
            namebranch: i18n['branch-input-error'],
            addressbranch: i18n['branch-input-error'],
            phonebranch: {
                required: i18n['branch-input-error'],
                digits: i18n['branch-input-phone-error'],
                minlength: i18n['branch-input-phone-error'],
                maxlength: i18n['branch-input-phone-error'],
            }
        },
        submitHandler : function(form) {
            if($("#key").val() == "-1")
                updatebranch(true);
            else
                updatebranch(false);
        }
    });
});

// Thông tin chi nhánh
function infobranch(id) {
    $.ajax({
        url: "/chi-nhanh/"+id,
        type: "GET",
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                $("#key").val(data.id);
                $("#name").val(data.name);
                $("#address").val(data.address);
                $("#phone").val(data.phone);
                $("#email").val(data.email);
                $("#fax").val(data.fax);    
                $("#update").removeAttr('disabled');
                $("#delete").removeAttr('disabled');
                $("#delete").attr('onclick', "deletebranch("+data.id+");");
                $("#chitiet").attr('onclick', "window.location.href='thong-tin/chi-nhanh/"+data.id+"'");
            } else {
                $("#update").attr('disabled', 'true');
                $("#delete").attr('disabled', 'true');
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Branch search
function searchbranch() {
    $.ajax({
        url: "/search/chi-nhanh",
        type: "GET",
        data : {
            index: $('tbody').children('tr').length,
            name: $("#name").val()
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                if(data.length<10) {
                    $("#viewmore").hide();
                }
                if(data.length>0) {
                    var html = "";
                    for(var i=0; i<data.length; i++) {
                        html += "<tr onclick='infobranch("+ data[i].id +");'>";
                        html += "<td>"+ data[i].id +"</td>";
                        html += "<td>"+ data[i].name +"</td>";
                        html += "<td>"+ data[i].address +"</td>";
                        html += "<td class='col-phone'>"+ data[i].phone +"</td>";
                        html += "<td class='col-action'>";
                        html += "<i class='fa fa-phone-square ctr-action' aria-hidden='true' onclick='window.location.href = 'mailto:"+ data[i].email +"';'></i>";
                        html += "<i class='fa fa-envelope ctr-action' aria-hidden='true' onclick='window.location.href = 'tel:"+ data[i].phone +"';'></i>";
                        html += "<i class='fa fa-trash ctr-action' aria-hidden='true'></i>";
                        html += "</td>"
                        html += "</tr>"
                    }
                    $('tbody').append(html);
                }
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Branch delete
function deletebranch(id) {
    eModal.confirm(i18n['branch-confirm-delete-message'], i18n['delete-data-system'])
    .then(() => {
        $.ajax({
            url: "/delete/chi-nhanh/"+id,
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data === "Success") {
                    eModal.alert(i18n['branch-alert-delete-message-success'], i18n['delete-data-system']);
                    window.location.reload(true);  
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }, null);
}
// Update branch
function updatebranch(iadd) {
    // Update data
    var idChange = '-1';
    if(iadd !== true) {
        idChange = $("#key").val();
    }
    $.ajax({
        url: "/update/chi-nhanh",
        type: "POST",
        data: {
            id: idChange,
            name: $("#name").val(),
            address: $("#address").val(),
            phone: $("#phone").val(),
            email: $("#email").val(),
            fax: $("#fax").val() 
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(dataChange){
            $("#d-waiting").hide();
            if (dataChange === "Success") {
                eModal.alert(i18n['branch-alert-update-message-success'], i18n['update-data-system']);
                window.location.reload(true);
            } else {
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}

// Danh mục

// Category info
function infocategory(id) {
    $.ajax({
        url: "/category/"+id,
        type: "GET",
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                $("#key").val(data.id);
                $("#name").val(data.name);
                $("#description").val(data.description);  
                $("#update").removeAttr('disabled');
                $("#delete").removeAttr('disabled');
                $("#delete").attr('onclick', "deletebranch("+data.id+");");
            } else {
                $("#update").attr('disabled', 'true');
                $("#delete").attr('disabled', 'true');
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Category search
function searchcategory() {
    $.ajax({
        url: "/search/category",
        type: "GET",
        data : {
            index: $('tbody').children('tr').length,
            name: $("#name").val()
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                if(data.length<10) {
                    $("#viewmore").hide();
                }
                if(data.length>0) {
                    var html = "";
                    for(var i=0; i<data.length; i++) {
                        html += "<tr onclick='infocategory("+ data[i].id +");'>";
                        html += "<td>"+ data[i].id +"</td>";
                        html += "<td>"+ data[i].name +"</td>";
                        html += "<td class='col-action'>";
                        html += "<i class='fa fa-bookmark ctr-action' aria-hidden='true' title='Click để xóa danh mục đã ghim'></i>";
                        html += "<i class='fa fa-trash ctr-action' aria-hidden='true' onclick='deletecategory('"+ data[i].id +"');'></i>";
                        html += "</td>"
                        html += "</tr>"
                    }
                    $('tbody').append(html);
                }
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Category delete
function deletecategory(id) {
    var btn = confirm("Việc xóa danh mục ảnh hưởng đến các ràng buộc cơ sở dữ liệu !!!\n Bạn có muốn tiếp tục xóa nó không?");
    if(btn === true) {
        $.ajax({
            url: "/delete/category/"+id,
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data === "Success") { 
                    showAlert('success', " Xóa dữ liệu", "Đã xóa thành công danh mục.");
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
}
// Update Category
function updatecategory(iadd) {
    // Check item null
    var name = $("#name").val();
    if (name == "") {
        alert("Tên danh mục không được để trống!!!");
        $("#name").focus();
    } else {
        // Check data exist
        $.ajax({
            url: "/search/branch",
            type: "GET",
            data : {
                index: 0,
                name: $("#name").val()
            },
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data !== undefined) {
                    if(data.length>0) {
                        showAlert('error', " Lỗi ràng buộc dữ liệu hệ thống", "Danh mục đã tồn tại trong hệ thống!!!\nVui lòng thao tác lại sau.");
                    } else {
                        // Update data
                        var idChange = '-1';
                        if(iadd !== true) {
                            idChange = $("#key").val();
                        }
                        $.ajax({
                            url: "/update/category",
                            type: "POST",
                            data: {
                                id: idChange,
                                name: $("#name").val(),
                                description: $("#description").val()
                            },
                            success: function(dataChange){
                                if (dataChange === "Success") { 
                                    showAlert('success', " Cập nhật dữ liệu", "Đã cập nhật thành công danh mục.");
                                } else {
                                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                                }
                            },
                            error: function(){
                                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                            }
                        });
                    }
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
    
}

// Đối tác

// Show Model
function showmodelpersonnel(sel) {
    if(sel == 0) {
        $("#keymodel").val("-1");
        $("#usernamemodel").val("");
        $("#usernamemodel").removeAttr('disabled');
        $("#fullnamemodel").val("");
        $("#identitycardmodel").val("");
        $("#addressmodel").val("");
        $("#phonemodel").val("");
        $("#emailmodel").val("");
        $("#salarymodel").val("");
        $("#myModalLabel").val("Thêm nhân viên mới");
        $('#myModal').modal('show');
    } else {
        $.ajax({
            url: "/personnel/" + $("#key").val(),
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data !== undefined) {
                    $("#keymodel").val(data.UserId);
                    $("#usernamemodel").val(data.UserName);
                    $("#usernamemodel").attr('disabled', 'true');
                    $("#fullnamemodel").val(data.FullName);
                    $("#identitycardmodel").val(data.IdentityCard);
                    $("#addressmodel").val(data.Address);
                    $("#phonemodel").val(data.Phone);
                    $("#emailmodel").val(data.Email);
                    $("#salarymodel").val(data.TotalSalary);
                    $("#br"+data.BranchId).attr('selected', 'selected');
                    $("#ju"+data.JurisdictionId).attr('selected', 'selected');
                    $("#myModalLabel").val("Thông tin chi tiết của nhân viên");  
                    $('#myModal').modal('show');  
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
    
}
// Personnel info
function infopersonnel(id) {
    $.ajax({
        url: "/personnel/"+id,
        type: "GET",
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                $("#key").val(data.UserName);
                $("#username").val(data.UserName);
                $("#fullname").val(data.FullName);
                $("#identitycard").val(data.IdentityCard);
                $("#address").val(data.Address);
                $("#phone").val(data.Phone);
                $("#email").val(data.Email);
                $("#salary").val(data.TotalSalary);
                $("#branch").val(data.NameBranch);    
                $("#info").removeAttr('disabled');
                $("#update").removeAttr('disabled');
                $("#delete").removeAttr('disabled');
                $("#delete").attr('onclick', "deletepersonnel("+data.UserName+");");
            } else {
                $("#info").attr('disabled', 'true');
                $("#update").attr('disabled', 'true');
                $("#delete").attr('disabled', 'true');
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Personnel search
function searchpersonnel() {
    $.ajax({
        url: "/search/personnel",
        type: "GET",
        data : {
            index: $('tbody').children('tr').length,
            username: $("#username").val(),
            fullname: $("#fullname").val(),
            identitycard: $("#identitycard").val(),
            address: $("#address").val(),
            phone: $("#phone").val()
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                if(data.length<10) {
                    $("#viewmore").hide();
                }
                if(data.length>0) {
                    var html = "";
                    for(var i=0; i<data.length; i++) {
                        html += "<tr onclick='infopersonnel('"+data[i].UserName+"');'>"
                        html += "<td>"+data[i].UserId+"</td>"
                        html += "<td>"+data[i].FullName+"</td>"
                        html += "<td class='col-phone'>"+data[i].Phone+"</td>"
                        html += "<td class='col-phone'>"+data[i].Email+"</td>"
                        html += "<td class='col-phone'>"+data[i].NameJurisdiction+"</td>"
                        html += "<td class='col-action'>"
                        html += "<i class='fa fa-phone-square ctr-action' aria-hidden='true' onclick='window.location.href = 'mailto:"+data[i].Email+"';'></i>"
                        html += "<i class='fa fa-envelope ctr-action' aria-hidden='true' onclick='window.location.href = 'tel:"+data[i].Phone+"';'></i>"
                        html += "<i class='fa fa-trash ctr-action' onclick='deletepersonnel('"+data[i].UserName+"');' aria-hidden='true'></i>"
                        html += "</td>";
                        html += "</tr>";
                    }
                    $('tbody').append(html);
                }
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Personnel delete
function deletepersonnel(id) {
    var btn = confirm("Việc xóa nhân viên ảnh hưởng đến các ràng buộc cơ sở dữ liệu !!!\n Bạn có muốn tiếp tục xóa nó không?");
    if(btn === true) {
        $.ajax({
            url: "/delete/personnel/"+id,
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data === "Success") {  
                    showAlert('success', "Xóa nhân viên", "Đã xóa thành công nhân viên.");
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
}
// Update Personnel
function updatepersonnel(iadd) {
    // Update data
    var idChange = '-1';
    if(iadd !== true) {
        idChange = $("#keymodel").val();
    }
    $.ajax({
        url: "/update/personnel",
        type: "POST",
        beforeSend: function() {
            $("#d-waiting").show();
        },
        data: {
            id: idChange,
            username: $("#usernamemodel").val(),
            fullname: $("#fullnamemodel").val(),
            identitycard: $("#identitycardmodel").val(),
            address: $("#addressmodel").val(),
            phone: $("#phonemodel").val(),
            email: $("#emailmodel").val(),
            branch: $("#branchmodel").val(),
            jurisdiction: $("#jurisdictionmodel").val(),
            salary: $("#salarymodel").val()  
        },
        success: function(dataChange){
            $("#d-waiting").hide();
            if (dataChange === "Success") {
                showAlert('success', "Cập nhật dữ liệu", "Đã cập nhật thành công nhân viên.");  
            } else {
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}

// Kho hành

// Show Model
function showmodelpartner(sel) {
    if(sel == 0) {
        $("#keymodel").val("-1");
        $("#usernamemodel").val("");
        $("#usernamemodel").removeAttr('disabled');
        $("#fullnamemodel").val("");
        $("#identitycardmodel").val("");
        $("#addressmodel").val("");
        $("#phonemodel").val("");
        $("#emailmodel").val("");
        $("#salarymodel").val("");
        $("#myModalLabel").val("Thêm nhân viên mới");
        $('#myModal').modal('show');
    } else {
        $.ajax({
            url: "/personnel/" + $("#key").val(),
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data !== undefined) {
                    $("#keymodel").val(data.UserId);
                    $("#usernamemodel").val(data.UserName);
                    $("#usernamemodel").attr('disabled', 'true');
                    $("#fullnamemodel").val(data.FullName);
                    $("#identitycardmodel").val(data.IdentityCard);
                    $("#addressmodel").val(data.Address);
                    $("#phonemodel").val(data.Phone);
                    $("#emailmodel").val(data.Email);
                    $("#salarymodel").val(data.TotalSalary);
                    $("#br"+data.BranchId).attr('selected', 'selected');
                    $("#ju"+data.JurisdictionId).attr('selected', 'selected');
                    $("#myModalLabel").val("Thông tin chi tiết của nhân viên");  
                    $('#myModal').modal('show');  
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
    
}
// Partner info
function infopartner(id) {
    $.ajax({
        url: "/partner/"+id,
        type: "GET",
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                $("#key").val(data.UserId);
                $("#name").val(data.Name);
                $("#address").val(data.Address);
                $("#phone").val(data.Phone);
                $("#email").val(data.Email);
                $("#delegate").val(data.Delegate); 
                $("#update").removeAttr('disabled');
                $("#delete").removeAttr('disabled');
                $("#delete").attr('onclick', "deletepartner("+data.UserId+");");
            } else {
                $("#update").attr('disabled', 'true');
                $("#delete").attr('disabled', 'true');
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Partner search
function searchpartner() {
    $.ajax({
        url: "/search/partner",
        type: "GET",
        data : {
            index: $('tbody').children('tr').length,
            name: $("#name").val(),
            email: $("#email").val(),
            address: $("#address").val(),
            phone: $("#phone").val()
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(data){
            $("#d-waiting").hide();
            if (data !== undefined) {
                if(data.length<10) {
                    $("#viewmore").hide();
                }
                if(data.length>0) {
                    var html = "";
                    for(var i=0; i<data.length; i++) {
                        html += "<tr onclick='infopartner('"+data[i].Id+"');'>"
                        html += "<td>"+data[i].Id+"</td>"
                        html += "<td>"+data[i].Name+"</td>"
                        html += "<td class='col-phone'>"+data[i].Phone+"</td>"
                        html += "<td class='col-phone'>"+data[i].Email+"</td>"
                        html += "<td class='col-action'>"
                        html += "<i class='fa fa-phone-square ctr-action' aria-hidden='true' onclick='window.location.href = 'mailto:"+data[i].Email+"';'></i>"
                        html += "<i class='fa fa-envelope ctr-action' aria-hidden='true' onclick='window.location.href = 'tel:"+data[i].Phone+"';'></i>"
                        html += "<i class='fa fa-trash ctr-action' onclick='deletepersonnel('"+data[i].UserId+"');' aria-hidden='true'></i>"
                        html += "</td>";
                        html += "</tr>";
                    }
                    $('tbody').append(html);
                }
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
// Partner delete
function deletepartner(id) {
    var btn = confirm("Việc xóa đối tác có thể ảnh hưởng đến các ràng buộc cơ sở dữ liệu !!!\n Bạn có muốn tiếp tục xóa nó không?");
    if(btn === true) {
        $.ajax({
            url: "/delete/partner/"+id,
            type: "GET",
            beforeSend: function() {
                $("#d-waiting").show();
            },
            success: function(data){
                $("#d-waiting").hide();
                if (data === "Success") {
                    showAlert('success', "Xóa dữ liệu", "Đã xóa thành công đối tác.");
                } else {
                    eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
                }
            },
            error: function(){
                $("#d-waiting").hide();
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        });
    }
}
// Update Partner
function updatepartner(iadd) {
    // Update data
    var idChange = '-1';
    if(iadd !== true) {
        idChange = $("#key").val();
    }
    $.ajax({
        url: "/update/partner",
        type: "POST",
        data: {
            id: idChange,
            name: $("#name").val(),
            address: $("#address").val(),
            phone: $("#phone").val(),
            email: $("#email").val(),
            delegate: $("#delegate").val()
        },
        beforeSend: function() {
            $("#d-waiting").show();
        },
        success: function(dataChange){
            $("#d-waiting").hide();
            if (dataChange === "Success") {
                alert("Đã cập nhật đối tác thành công.");
                window.location.reload(true);  
                showAlert('success', "Cập nhật dữ liệu", "Đã cập nhật đối tác thành công.");
            } else {
                eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
            }
        },
        error: function(){
            $("#d-waiting").hide();
            eModal.alert(i18n['404-connection-system-content'], i18n['404-connection-system-title']);
        }
    });
}
