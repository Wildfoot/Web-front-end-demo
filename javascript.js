/*
var i = 0
    while(i < 10)
    {
    	console.log(1);
    	i = i+1;
    }
*/
/*
for(var i=0; i<10; i++)
{
	console.log(2);
}
*/

//陣列  push加到陣列尾端

/*
var dmobject={}
dmobject.name = "Andrew";
dmobject.number	= 50;
dmobject.dmfunction = function()

{
	console.log(this.name);
}

dmobject.dmfunction();
console.log( dmobject.number );
console.log( dmobject.name );
*/
/*function load()
{
	console.log("inload");

	var Documenttest1 = document.getElementById("testinput");
}*/


//var newbottom = 0;


function addfun()
{
	$('#addiv').append('<input type="buttom" value="test" class="newbottom" style="background-color:white; color:green; border:none;">')
	newbottom++;
}
function remfun()
{
	$('.newbottom').remove()
}