
window.onscroll = function(){
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        $("#menubar").addClass('navfix');
        $("#backtop").show();
    } else {
        $("#menubar").removeClass('navfix');
        $("#backtop").hide();
    }
}
function hidealert(){
    $("#alert-autohide").hide(500);
}
function showalert(title, content, delay){
    $("#title").text(title);
    $("#content-alert").html(content);
    $("#alert-autohide").show(500);
    setTimeout(hidealert, delay);
}
$(document).ready(function(){ 	
	$("#backtop").click(function () {
		$('body,html').animate({
			scrollTop: 0
		});
    });

    $("#signup").validate({
        rules: {
            username: {
                required: true,
                remote: {
                    url: "/checkusername",
                    type: "post",
                    data: {
                        username: function() {
                            return $("#username").val();
                        }
                    }
                }
            },
            password: "required",
            review: {
                equalTo: "#password"
            },
            email: "email",
            phone: "digits"
        },
        messages: {
            username: {
                required: "Tài khoản không được để trống!",
                remote: "Tài khoản đã tồn tại!"
            },
            password: "Mật khẩu không được để trống!",
            review: "Mật khẩu không trùng khớp!",
            email: "Không đúng định dạng email!",
            phone: "Không đúng định dạng số điện thoại!"
        },
        submitHandler: function(form) {
            $("#waiting").show();
            form.submit();
        }
    });

    $("#login").validate({
        rules: {
            username: "required",
            password: "required",
        },
        messages: {
            username: "Tên đăng nhập không được để trống!",
            password: "Mật khẩu không được để trống!"
        },
        submitHandler: function(form) {
            $("#waiting").show();
            form.submit();
        }
    });
});