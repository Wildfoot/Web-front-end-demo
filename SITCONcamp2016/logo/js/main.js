var compressor = new LZMA( "./js/lzma_worker.js" );

var TO_RADIANS = Math.PI / 180;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SHADOW_MAP_WIDTH = 1024;
var SHADOW_MAP_HEIGHT = 1024;
var MARKER_HEIGHT = 20;
var viewportWidth = 1080;
var viewportHeight = 800;

var container;
var projector, camera, scene, renderer, controls;

//demo specific
var sphereRadius = 255;

var loader, lightContainer, orangeContainer, orange, normalTexture, uniform, lightDummie, targetDummie,clovesContainer,tableContainer,marker,shadowMesh;
//var intersectionPoint,intersectNormal;
var ambientLight,spotLight;
var mouse2d = new THREE.Vector3(0,0,0);
var _dragging = false;
var _mouseDown =  false;
var _attachRepeated = false;
var _attachInterval;
var clovesList = [];
var clovesPool = new ObjectPool();
var bInitComplete;

//start engine and loading
$(document).ready(function(){
    mainInit();
});

function mainInit() {

    properties = {
    }

    /*
    $("#codeBtn").bind( "click", function(event){
        event.stopPropagation();
        showCode();
    })

    $("#saveBtn").bind( "click", function(event){
        event.stopPropagation();
        $("#image-size-popup").css({top:38, left: $(this).offsetLeft}).fadeIn();

        $("#saveSubmitBtn").unbind().bind("click", function(){
            var format = $("#image-size-popup input:radio[name=format]:checked").val();
            var size = $("#image-size-input").val();

            saveFile(format,parseInt(size));
        })

        $("#saveCancelBtn").unbind().bind("click", function(){
            $("#image-size-popup").hide();
        })

    })

    $("#shareBtn").bind( "click", function(event){
        event.stopPropagation();
       shareOnline()
    })

    $("#urlBtn").bind( "click", function(event){
        event.stopPropagation();
        serializeUrl();
    })

    $("#clearBtn").bind( "click", function(event){
        event.stopPropagation();
        clear();
    })

     $("#runBtn").bind( "click", function(event){
        event.stopPropagation();
        run();
    })

    $("#undoBtn").bind( "click", function(event){
        event.stopPropagation();
        undo();
    })
    */
    initEngine();
    initObjects();

    window.addEventListener( 'resize', onWindowResize, false );
    onWindowResize();

    window.addEventListener( 'mousemove', onDocumentMouseMove, false );
}


function initEngine() {

    projector = new THREE.Projector();
    container = document.getElementById('container');

    scene = new THREE.Scene();

    // fov, aspect, near, far
    camera = new THREE.PerspectiveCamera( 70, SCREEN_WIDTH / SCREEN_HEIGHT,1,1400 );
    camera.setLens(70,43.25)
    camera.position.z = 1000;
    camera.position.y = 450;
    camera.lookAt(scene.position);
    scene.add(camera);

    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.4;
    controls.enabled = false;
    controls.keys = [];

    ambientLight = new THREE.AmbientLight(0x000419);
    ambientLight.intensity = 0.2;
    scene.add(ambientLight);

    spotLight = new THREE.SpotLight( 0xffffff, 0.7, 0 );
    spotLight.intensity = 0;
    spotLight.target.position.set( 0, 0, 0 );
    spotLight.castShadow = true;
    scene.add(spotLight);

    lightDummie = new THREE.Object3D();
    lightDummie.position.set(-500,400,600);

    lightContainer = new THREE.Object3D();
    lightContainer.add( lightDummie )
    scene.add(lightContainer);

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, precision:'highp' };
    shadowTexture = new THREE.WebGLRenderTarget( SHADOW_MAP_WIDTH, SHADOW_MAP_HEIGHT, pars );

    try {

        renderer = new THREE.WebGLRenderer({ antialias: true, precision:'highp'});
        renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
        //renderer.physicallyBasedShading = true;

        renderer.sortObjects = false;
        renderer.preserveDrawingBuffer = true;
        renderer.shadowCameraNear = 3;
        renderer.shadowCameraFar = 1000;
        renderer.shadowCameraFov = 50;

        renderer.shadowMapBias = 0.0039;
        renderer.shadowMapDarkness = 0.5;
        renderer.shadowMapWidth = SHADOW_MAP_WIDTH;
        renderer.shadowMapHeight = SHADOW_MAP_HEIGHT;

        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        $("#footer,#menu-container,#center-buttons").fadeIn();
    }
    catch (e) {
        // need webgl
        document.getElementById('error').innerHTML = "<P><BR><B>Oh no...</B><br> You really need to consider using a modern browser that supports WebGL or else you gonna miss so much cool stuff around the internetz.<BR>Try <a href='http://www.google.com/landing/chrome/beta/' target='_blank'>Google Chrome 9+</a> or <a href='http://www.mozilla.com/firefox/beta/' target='_blank'>Firefox 4+</a>.<BR><BR>Still get this annoying message, it is possible that you have old blacklisted GPU drivers. Try updating the drivers for your graphic card.<BR>Or try to set a '--ignore-gpu-blacklist' switch for the browser. Oh, you using a mobile. Guess you can wish for GPU-support for christmas.</P>";
        document.getElementById('error').style.display = "block";

        return;
    }

    //add renderer to DOM

}

function initObjects() {

    tableContainer = new THREE.Object3D();
    tableContainer.position.y = -sphereRadius-50;
    tableContainer.rotation.x = - 90 * Math.PI / 180;
    lightContainer.add( tableContainer );

    loader = new THREE.JSONLoader( true );
    loader.load("models/cloves.js", function(geo) { clovesLoaded( geo ) });

}


function clovesLoaded( geo) {

    clovesGeometry = geo;
    clovesGeometry.computeTangents();

    orangeContainer = new THREE.Object3D();

    clovesContainer = new THREE.Object3D();
    orangeContainer.add(clovesContainer);

    clovesMaterial = new THREE.MeshPhongMaterial({color:0x483934});
    var clovesMesh;

    loader = new THREE.JSONLoader( true );
    loader.load("models/orange_large3.js", function(geo) { orangeLoaded( geo ) });

    clovesPool.createObject = createClove

    //createMarker
    markerMaterial = new THREE.MeshPhongMaterial({color:0x483934});
    markerMaterial.transparent = true;
    marker = new THREE.Mesh( clovesGeometry, markerMaterial );
    marker.visible = false;
    marker.castShadow = true;
    clovesContainer.add(marker);
}

function orangeLoaded( geo ) {

   var ambient = 0x333333, diffuse = 0xff9700, specular = 0xffffff, shininess = 30;

    var shader = THREE.ShaderUtils.lib[ "normal" ];

    uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    uniforms[ "tNormal" ].texture = THREE.ImageUtils.loadTexture("textures/orange_normal.jpg");
    uniforms[ "uNormalScale" ].value = 0.20;

    uniforms[ "uDiffuseColor" ].value.setHex( diffuse );
    uniforms[ "uSpecularColor" ].value.setHex( specular );
    uniforms[ "uAmbientColor" ].value.setHex( ambient );

    uniforms[ "uShininess" ].value = shininess;

    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true  };
    var material = new THREE.ShaderMaterial( parameters );

    orange = new THREE.Mesh( geo, material );

    orange.geometry.computeTangents();

    orange.receiveShadow = true;
    orangeContainer.add(orange);

    loader.statusDomElement.style.display = "none";

    scene.add( orangeContainer );

    //cap 1
    var capGeo = new THREE.PlaneGeometry(20,20,2,2);

    var capMaterial = new THREE.MeshPhongMaterial({map:THREE.ImageUtils.loadTexture("textures/orange_cap.png"), transparent:true})
    var capMesh = new THREE.Mesh( capGeo, capMaterial );
    capMesh.position.y = sphereRadius-11;
    capMesh.rotation.x = -Math.PI*.5
    orangeContainer.add(capMesh);

    var capMaterial2 = new THREE.MeshPhongMaterial({map:THREE.ImageUtils.loadTexture("textures/orange_cap2.png"), transparent:true})
    var capMesh2 = new THREE.Mesh( capGeo, capMaterial2 );
    capMesh2.position.y = -sphereRadius+16;
    capMesh2.rotation.x = Math.PI*.5
    capMesh2.scale.x = capMesh2.scale.y = capMesh2.scale.z = 1.2
    orangeContainer.add(capMesh2);

    //shadow

    /*var shadowMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/shadow.png' ), transparent:true } );
    var shadowGeo = new THREE.PlaneGeometry( 500, 500, 1, 1 );

    shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
    shadowMesh.receiveShadow = true;
    tableContainer.add(shadowMesh);*/

    initStartState();

}


//called from object pool
function createClove() {
    var clove = new THREE.Mesh( clovesGeometry, clovesMaterial );
    clove.castShadow = true;
    return clove;
}

//function  used by all types
function attachClove( pos, delay ) {

    if( !delay) delay = 0;

    var clovesMesh = clovesPool.getObject();
    clovesList.push(clovesMesh);
    clovesContainer.add(clovesMesh);

    clovesMesh.position = new THREE.Vector3().add(pos,pos.clone().normalize().multiplyScalar(MARKER_HEIGHT));
    clovesMesh.lookAt( orangeContainer.position );

    clovesMesh.visible = false;
    new TWEEN.Tween(clovesMesh.position)
        .to(pos, 200)
        .easing(TWEEN.Easing.Sinusoidal.EaseOut)
        .onUpdate(function(){
            clovesMesh.visible = true;
            clovesMesh.rotation.z += 0.03;
        })
        .delay(delay)
        .start();


    if( !_attachRepeated ) {
        marker.material.opacity = 0;
        marker.castShadow = false;
        new TWEEN.Tween( marker.material ).to({opacity:1},200).delay(200).onUpdate(function(){
            marker.castShadow = true;
            clovesMesh.rotation.z += 0.03;
        }).start()
    }

    return clovesMesh;
}

/* intersectionpoint 
function attachCloveRepeated(){
    _attachRepeated = true;

    if( intersectionPoint == null || intersectNormal == null ) return;

    attachClove(intersectionPoint);
}

function attachCloveAtCursor() {
    if( intersectionPoint == null || intersectNormal == null ) return;

     attachClove(intersectionPoint);
}
/*/



function initRotateOrange( animTime ) {

    new TWEEN.Tween(spotLight).to({intensity:0.9},1000).delay(2000).start();

    orangeContainer.rotation.z = Math.PI*0.5;
    orangeContainer.rotation.y = Math.PI*0.5;

    new TWEEN.Tween(orangeContainer.rotation).to({y:0,z:0,y:0},animTime)
        .easing( TWEEN.Easing.Sinusoidal.EaseInOut)
        .onComplete( function(){
            if( _dragging ) {
                controls.enabled=true
            }
            marker.visible = true;
            bInitComplete = true;
        })
        .start();
}

function initStartState() {

    $("#loading").delay(500).hide( function(){
        closeMoreInfo();
    });

    $("#container").mousedown( function(event) {
        event.preventDefault();
        _mouseDown = true;
        $("#codeInjector").blur();
        if( !_dragging ) {
            attachCloveAtCursor();
            clearInterval(_attachInterval);
            _attachRepeated = false;
            _attachInterval = setInterval( attachCloveRepeated, 150 );
        }
    })

    $("#container").mouseup( function(event) {
        event.preventDefault();
        _mouseDown = false;
        _attachRepeated = false;
        clearInterval(_attachInterval)
    })

    $(window).keydown(function(event) {

     if(event.keyCode == 9) {
        if(event.preventDefault) {
            event.preventDefault();
        }
     }
     else if ( event.which == 32 ) {
         //event.preventDefault();
         _dragging = true;
         controls.enabled = true;

       }
    });

     $(window).keyup(function(event) {

     if ( event.which == 32 ) {
         event.preventDefault();
         _dragging = false;
         controls.enabled = false
       }
    });

    if ( window.location.hash ) {

        var hash = window.location.hash.substr( 1 );
        var version = hash.substr( 0, 2 );
        if ( version == 'A/' ) {
            // LZMA
            readURL( hash.substr( 2 ) );
        }

    } else {
       initRotateOrange( 3000 );
    }

    animate();
}

//game loop
function animate() {
    requestAnimationFrame(animate);
    checkCollisions();
    TWEEN.update();
    render();
}


function render() {

    if( bInitComplete ) {
        controls.update();
    }

    if( intersectionPoint && marker ){
        var normal = intersectionPoint.clone().normalize()
        marker.position = new THREE.Vector3().add(intersectionPoint,normal.multiplyScalar(MARKER_HEIGHT));
        marker.lookAt( orangeContainer.position );
        marker.visible = true;
    }
    else marker.visible = false;

   lightContainer.rotation = camera.rotation;

    //shadows don´t update when inside a child, so here is a workaround:
    var childWorldMatrix = lightDummie.matrixWorld;
    var tempParentMatrix = new THREE.Matrix4();
    var inverse = new THREE.Matrix4();
    inverse.getInverse( scene.matrixWorld )
    tempParentMatrix.multiply(inverse,childWorldMatrix );
    spotLight.position = tempParentMatrix.getPosition();

    //spotLight.target = camera;
    renderer.render( scene, camera );

    updateFPS();
}

function checkCollisions() {

    var vector = mouse2d.clone();
    projector.unprojectVector( vector, camera );
    var r = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
    var c = r.intersectObject( orange );

    if(c.length > 0 && c[0].point) {
        intersectionPoint = c[0].point
        intersectNormal = c[0].face.normal;

        if( _dragging ) {
            $("body").css("cursor","move");
        }
        else {
            $("body").css("cursor","none");
        }
    }
    else {
        intersectionPoint = null;
        intersectNormal = null;
        $("body").css("cursor","default");
    }

}

var camera_rotation = function() {
    requestAnimationFrame( render );

    orange.rotation.x += 0.1;
    orange.rotation.y += 0.1;
    
    renderer.render(scene, camera);
};

/*mousemove*/ 
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse2d.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2d.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    camera_rotation();
}
/**/


function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix()

    $("#footer").css("top",window.innerHeight-60)
}

function clear() {

    var i;
    var max = clovesList.length;
    for( i=0;i<max;i++) {
        clovesContainer.remove(clovesList[i]);
        clovesPool.returnObject(clovesList[i].poolId);
    }

    clovesList = [];

    //serializeUrl();
}

/**********************
 * EDITOR
 **********************/


function run(){
    clear();
    eval($("#codeInjector").val());

}

function undo() {
    if( clovesList.length == 0 ) return;

    var clove = clovesList[clovesList.length-1];

    clovesList.pop();

    var clonedPosition = new THREE.Vector3(clove.position.x,clove.position.y,clove.position.z);

    var targetPosition = new THREE.Vector3().add(clonedPosition,clonedPosition.clone().normalize().multiplyScalar(40));

     new TWEEN.Tween(clove.position).to(targetPosition, 400).easing(TWEEN.Easing.Sinusoidal.EaseIn)
     .onUpdate(function(){
            clove.rotation.z -= 0.03;
        })
    .onComplete(function(){
         clovesContainer.remove(clove);
         clovesPool.returnObject(clove.poolId);

    })
    .start();
}

function showCode() {

    $("#codeBox").show();
    $("#codeBox").css("overflow","auto");
    
    $("#codeInjector").animate({width: 550, height: 340 }, 500, function(){
         $("#runBtn").css("top",410);
        $("#runBtn").fadeIn();
    });
}

function hideCode() {
    $("#runBtn").fadeOut();
    $("#codeBox").css("overflow","hidden");
    $("#codeInjector").animate({
    width: 100,
    height: 16
  }, 500, function(){

        $("#codeBox").hide();

    });
}

/**********************
* SAVE AND PARSE
 **********************/


var dummyFunction = function() {};
var bAlertTips;
function setURL( serializedString ) {
    compressor.compress( serializedString, 1, function( bytes ) {
        var hex = convertBytesToHex( bytes );

        /* $.ajax({
          type: 'POST',
          data: {url:"http://www.inear.se"},
          url: "http://tinyurl.com/api-create.php",
          cache: false,
          success: function(data){
           console.log(data);
          }
        });
*/
        $.ajax({
          type: 'POST',
          data: {data: "#A/" + hex},
          url: "save_entry.php",
          cache: false,
          success: function(data){
           console.log("save entry:" + data );
          }
        });

        window.location.replace( '#A/' + hex );

        if( !bAlertTips ) {
           bAlertTips = true;
           alert("You got a pretty long unique url waiting for you in the address-bar. An advice is to use a url-shortener service that handle long urls, like tinyurl.com. Happy sharing!");
        }
    },
    dummyFunction );
}

function readURL( hash ) {
    var bytes = convertHexToBytes( hash );
    compressor.decompress( bytes, function( text ) {

        parseCloves(text);
    }, dummyFunction );
}

function convertHexToBytes( text ) {
    var tmpHex, array = [];
    for ( var i = 0; i < text.length; i += 2 ) {
        tmpHex = text.substring( i, i + 2 );
        array.push( parseInt( tmpHex, 16 ) );
    }

    return array;
}

function convertBytesToHex( byteArray ) {
    var tmpHex, hex = "";
    for ( var i = 0, il = byteArray.length; i < il; i ++ ) {
        if ( byteArray[ i ] < 0 ) {
            byteArray[ i ] = byteArray[ i ] + 256;
        }

        tmpHex = byteArray[ i ].toString( 16 );

        // add leading zero
        if ( tmpHex.length == 1 ) tmpHex = "0" + tmpHex;

        hex += tmpHex;

    }
    return hex;
}

function serializeUrl() {
    var output = ""
    var i,clovePos;
    var max = clovesList.length;

    output += camera.rotation.x + "," + camera.rotation.y + "," + camera.rotation.z + ",";
    output += Math.round(camera.position.x) + "," + Math.round(camera.position.y) + "," + Math.round(camera.position.z) + ",";
    output += camera.up.x + "," + camera.up.y + "," + camera.up.z + ",";

    for( i=0; i<max; i++ ) {
        clovePos = clovesList[i].position;
        output += Math.round(clovePos.x) + "," + Math.round(clovePos.y) + "," + Math.round(clovePos.z)
        output += ",";
    }

    output = output.substring(0,output.length-1);

    setURL(output);
}


function parseCloves( serializedString ) {

    var positions = serializedString.split(",");

    var i;
    var pos;
    var max = positions.length;

    var cameraRotation = new THREE.Vector3(parseFloat(positions[0]),parseFloat(positions[1]),parseFloat(positions[2]));
    var cameraPosition = new THREE.Vector3(parseInt(positions[3]),parseInt(positions[4]),parseInt(positions[5]));
    var cameraUp = new THREE.Vector3(parseFloat(positions[6]),parseFloat(positions[7]),parseFloat(positions[8]));

    camera.position = cameraPosition;
    camera.rotation = cameraRotation;
    camera.up = cameraUp;
    controls.update();

    for( i=9; i<max;i+=3 ) {
        pos = new THREE.Vector3().set(parseInt(positions[i]),parseInt(positions[i+1]),parseInt(positions[i+2]));
        attachClove( pos, i*5 );
    }

    controls.enabled = false;
    totalAnimationTime = i*5+400

    totalAnimationTime = Math.max(totalAnimationTime, 3000);

    initRotateOrange( totalAnimationTime );

}


function shareOnline(  ) {
    SCREEN_WIDTH = 512;
    SCREEN_HEIGHT = 512;
    renderer.domElement.width = SCREEN_WIDTH
    renderer.domElement.height = SCREEN_HEIGHT
    renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    marker.visible = false;
    //shadowMesh.visible = false;
    render();
    //window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );

    share()

    marker.vsible = true;
   // shadowMesh.visible = true;
    onWindowResize();
    render();

}


function share(){

    //702586f00324590ea2f63a6b38827e3904ee0a2b9
    //67cf1a795870269be79e0e908ecfc1e7

    try {
        var img = renderer.domElement.toDataURL('image/jpeg', 0.9).split(',')[1];
    } catch(e) {
        var img = renderer.domElement.toDataURL().split(',')[1];
    }
    // open the popup in the click handler so it will not be blocked
    var w = window.open();
    w.document.write('<body style="background: 8a1c08;color:#ffffff"><div style="position: absolute;left: 50%;top: 50%;padding: 12px;width: 200px;height: 200px;margin-left: -100px;margin-top: -100px;">Uploading photo to imgur.com</div></body>');
    // upload to imgur using jquery/CORS
    // https://developer.mozilla.org/En/HTTP_access_control
    $.ajax({
        url: 'http://api.imgur.com/2/upload.json',
        type: 'POST',
        data: {
            type: 'base64',
            // get your key here, quick and fast http://imgur.com/register/api_anon
            key: 'd3539598db9ba7e4a2c6c2ac59a8ef0b',
            name: 'christmasorange.jpg',
            title: 'Christmas Clove Orange',
            caption: 'http://inear.se/xmas',
            image: img
        },
        dataType: 'json'
    }).success(function(data) {
        w.location.href = data['upload']['links']['imgur_page'];
    }).error(function() {
        alert('Could not reach api.imgur.com. Sorry :(');
        w.close();
    });
}


function saveFile( format, size ) {
    SCREEN_WIDTH = size;
    SCREEN_HEIGHT = size;
    renderer.domElement.width = SCREEN_WIDTH
    renderer.domElement.height = SCREEN_HEIGHT
    renderer.setSize(SCREEN_WIDTH,SCREEN_HEIGHT);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    marker.visible = false;
    //shadowMesh.visible = false;
    render();

    var img = renderer.domElement.toDataURL('image/' + format );

    // open the popup in the click handler so it will not be blocked
    var w = window.open();
    w.document.write('<body style="background: #000000;color:#ffffff">Right-click and select "Save as..."<br><br><div style="margin:30px"><img src="' + img + '"></div></body>');

    marker.vsible = true;
   // shadowMesh.visible = true;
    onWindowResize();
    render();

}

/********************************************************/

var _frames = 0;
var _time;
var _timeLastFrame = new Date().getTime();
var _fps = "";
var _mb = 0;
var _timeLastSecond = new Date().getTime();

function updateFPS() {

    _frames ++;
    _time = new Date().getTime();

    _ms = _time - _timeLastFrame;

    _timeLastFrame = _time;

    if ( _time > _timeLastSecond + 1000 ) {

        _fps = Math.round( ( _frames * 1000) / ( _time - _timeLastSecond ) );
        //_mb = performance.memory.usedJSHeapSize * 0.000000954;

        $("#infoText").html("FPS: " + _fps);

        _timeLastSecond = _time;
        _frames = 0;

    }
}

/********************************************************/


