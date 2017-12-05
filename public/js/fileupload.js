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
        var files = e.originalEvent.dataTransfer.files;
        //We need to send dropped files to Server
        handleFileUpload(files, obj);
    });
    obj.on('click', function(e) {
        $("#file").click();
        $('#file').change(function() {
            handleFileUpload($('#file')[0].files, obj);
        });
    })
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
        }
    });
});