$(document).ready(function(){
    $("#display_ajax").click(function(){
        $.getJSON("/ajax_book_detail/", function( data ){
            var items = [];
            $.each( data, function(key, val){
                items.push("<li id='" + key + "'>" + val + "</li>");
            });

            $("<ul/>", {
                "class": "my-new-list",
                html: items.join("")
            }).appendTo("body");
        });
        $("#ajax_result").append("RRRRRRRRRRRRRRRRRR");
    })
    $("#sent_ajax").click(function(){
        $.ajax({
            url: "/ajax_receive/",
            type: "POST",
            data: {
                test: "TEST",
                isbn_input: $("#isbn-input").val(),
                test2: 11,
            },
            error: function() {
                alert("Ajax request error");
            },
            success: function( data ){
                alert("Ajax request success");
                //$("#isbn-input-message").html(response);
                //$("#isbn-input-message").fadeIn();
                var items = [];
                $.each( data, function(key, val){
                    items.push("<li id='" + key + "'>" + val + "</li>");
                });
                $("<ul/>", {
                    "class": "my-new-list",
                    html: items.join("")
                }).appendTo("body");
            }
        });
        $("#ajax_sent_status").append("OOOOOOOOO");
    });
});

