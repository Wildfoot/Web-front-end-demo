$('div.animation').on('click', function(){
    alert("click!! in js")
})

setTimeout(function(){
    $('#google').attr("href", "http://yahoo.com").html("Yahoo!")
}, 5000)

$('input#rred').on('change',function(){
    if($('input#rred').val().length > 6){
        $('input#rred').css('background-color', 'green')
    }
    else {
        console.log($('input#rred').val().length)
    }
})

$('#test-form').on('submit', function(){
    $.ajax({
        url: 'https://httpbin.org/get',
        data: $('#test-form').serialize(), 
        type: 'GET'
    })

    .done(function(data){
        $('div.result').html(JSON.stringify(data.args))
    })
    return false;
})
/*
$.ajax({
    url: "http://example.com/api/v2/login",
    data: $('form').serialize(),
    type: "POST",
    dataType: "json"
})
*/
