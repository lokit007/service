function sendFileToServer(formData, status) {
    var uploadURL = "/service/upl/" + $("#app-select").val(); //Upload URL
    var extraData = {}; //Extra Data.
    formData.append('app',"sendmail");
    var jqXHR = $.ajax({
        xhr: function () {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener('progress', function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    //Set progress
                    status.setProgress(percent);
                }, false);
            }
            return xhrobj;
        },
        url: uploadURL,
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: formData,
        success: function (data) {
            status.setProgress(100);
        }
    });
    status.setAbort(jqXHR);
}
var rowCount = 0;
function createStatusbar(obj) {
    rowCount++;
    var row = "odd";
    if (rowCount % 2 == 0) row = "even";
    this.statusbar = $("<div class='statusbar " + row + "'></div>");
    this.iconremove = $("<span onclick='onRemove(this)' class='glyphicon glyphicon-remove'></span>").appendTo(this.statusbar);
    this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
    this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
    this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
    this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
    this.statusbar.appendTo(obj);

    this.setFileNameSize = function (name, size) {
        var sizeStr = "";
        var sizeKB = size / 1024;
        if (parseInt(sizeKB) > 1024) {
            var sizeMB = sizeKB / 1024;
            sizeStr = sizeMB.toFixed(2) + " MB";
        }
        else {
            sizeStr = sizeKB.toFixed(2) + " KB";
        }
        this.iconremove.attr('data', name)
        this.filename.attr('data', name)
        this.filename.html(name);
        this.size.html(sizeStr);
    }
    this.setProgress = function (progress) {
        var progressBarWidth = progress * this.progressBar.width() / 100;
        this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
        if (parseInt(progress) >= 100) {
            this.abort.hide();
        }
    }
    this.setAbort = function (jqxhr) {
        var sb = this.statusbar;
        this.abort.click(function () {
            jqxhr.abort();
            sb.hide();
        });
    }
}
function handleFileUpload(files, obj) {
    for (var i = 0; i < files.length; i++) {
        var fd = new FormData();
        fd.append('file', files[i]);
        var status = new createStatusbar(obj); //Using this we can set progress.
        $("#dragandrophandler .statusbar .filename[data='"+files[i].name+"']").parent().remove()
        status.setFileNameSize(files[i].name, files[i].size);
        sendFileToServer(fd, status);
    }
}
function onRemove(e) {
    var keyfile = $(e).attr("data");
    var app = $("#app-select").val();
    if(app != "") {
        $.ajax({
            url: "/service/del",
            type: "POST",
            data: {
                key: keyfile,
                app: app
            },
            success: function (data) {
                if(data.state == true) {
                    $(e).parent().remove();
                }
            }
        });
    }
}
$(document).ready(function () {
    var obj = $("#dragandrophandler");
    var objSelect = $("#app-select");
    var objOpenFile = $("#open-file");
    var objForm = $("#f-upload-file");
    var objAdd = $("#insert");
    var objDel = $("#delete");
    var objUpd = $("#update");

    obj.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border', '2px solid #0B85A1');
    });
    obj.on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    obj.on('drop', function (e) {
        $(this).css('border', '2px dotted #0B85A1');
        e.preventDefault();
        var keyapp = objSelect.val();
        if(keyapp != "") {
            var files = e.originalEvent.dataTransfer.files;
            handleFileUpload(files, obj);
        } else eModal.alert("Bạn chưa chọn ứng dụng cần cập nhật!", "Dữ liệu đầu vào chưa có!")
    });
    $(document).on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $(document).on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        obj.css('border', '2px dotted #0B85A1');
    });
    $(document).on('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    objSelect.on('change', function(e) {
        var keyapp = objSelect.val();
        if(keyapp != "") {
            objDel.removeAttr('disabled')
            objUpd.removeAttr('disabled')
            $.ajax({
                url: "/service/info/" + keyapp,
                type: "POST",
                success: function (data) {
                    if(data.status == "Success") {
                        $("#ver-upload").val(data.ver);
                        obj.empty();
                        data.data.forEach(element => {
                            this.statusbar = $("<div class='statusbar'></div>");
                            this.iconremove = $("<span onclick='onRemove(this)' data='"+ element.name +"' class='glyphicon glyphicon-remove'></span>").appendTo(this.statusbar);
                            this.filename = $("<div class='filename' data='"+ element.name +"'>"+ element.name +"</div>").appendTo(this.statusbar);
                            this.size = $("<div class='filesize'>"+ element.size +"</div>").appendTo(this.statusbar);
                            this.statusbar.appendTo(obj);
                        });
                    }
                }
            });
        } else {
            objDel.attr('disabled', 'true')
            objUpd.attr('disabled', 'true')
        }
    });
    objOpenFile.on('click', function(e) {
        var keyapp = objSelect.val();
        if(keyapp != "") $("#file").click();
        else eModal.alert("Bạn chưa chọn ứng dụng cần cập nhật!", "Dữ liệu đầu vào chưa có!")
        $('#file').change(function() {
            handleFileUpload($('#file')[0].files, obj);
        });
    });
    objForm.on('submit', function(e) {
        var keyapp = objSelect.val();
        if(keyapp != "") {
            $.ajax({
                type: "POST",
                url: objForm.attr("action"),
                data: objForm.serialize(),
                success: function(data) {
                    if(data == "Success") eModal.alert("Bạn đã cập nhật thành công!", "Thông báo từ server")
                    else eModal.alert("Chưa cập nhật được phần mềm!<br>Vui lòng kiểm tra lại", "Lỗi cập nhật!")
                }
            });
        } else eModal.alert("Bạn chưa chọn ứng dụng cần cập nhật!", "Dữ liệu đầu vào chưa có!")
        e.preventDefault();
    });
    objAdd.on('click', function(e){
        var options = {
            url: "http://localhost:3000/service/add",
            title:'Thêm ứng dụng',
            size: eModal.size.sm,
            buttons: [
                {text: 'Thêm mới', style: 'info', close: true, click: function() {
                    var objForm = $("#f-add-app");
                    $.ajax({
                        type: "POST",
                        url: "/service/act/addnew",
                        data: objForm.serialize(),
                        success: function(data) {
                            if(data.status == "Success") {
                                alert("Bạn đã cập nhật thành công!")
                                $("<option value="+data.obj.key+">"+data.obj.name+"</option>").appendTo(objSelect)
                            } else alert("Chưa cập nhật được phần mềm!<br>Vui lòng kiểm tra lại")
                        }
                    });
                } },
                {text: 'Hủy bỏ', style: 'danger', close: true }
            ]
        };
        eModal.ajax(options);
    })
    objDel.on('click', function(e) {
        var keyfile = $("#app-select").val();
        var app = $("#app-select option:selected").text();
        if(app != "") {
            $.ajax({
                url: "/service/act/del",
                type: "POST",
                data: {
                    key: keyfile,
                    name: app
                },
                success: function (data) {
                    if(data == "Success") {
                        alert("Bạn đã xóa thành công!")
                        $("#app-select option:selected").remove()
                        obj.children().remove()
                    } else alert("Chưa xóa được phần mềm!<br>Vui lòng kiểm tra lại")
                }
            });
        }
    })
});