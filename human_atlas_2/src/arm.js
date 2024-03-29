var renderer = null, 
CSS3DRenderer = null,
scene = null, 
camera = null,
raycaster,
root = null,
controls,
loopAnimation = false,
bone = null,
orbitControls = null,
dragControls=null;
var objLoader;
var cssAnimator;


var currentTime = Date.now();

var animator;

var mapUrl = "../images/checker_large.gif";

var deleteElements = false;

var armInfo = [];


// Groups
var bones = null,
veins = null,
arteries = null,
muscles = null,
arm = null;

var bonesArray = [];
var musclesArray = [];
var veinsArray = [];
var arteriesArray = [];
var armArray = [];
var cssElement;

var bonesNames = ["FJ1499","FJ1500","FJ1501"];
var musclesNames = ["FJ1471",
    "FJ1472",
    "FJ1473",
    "FJ1474",
    "FJ1475",
    "FJ1476",
    "FJ1477",
    "FJ1478",
    "FJ1479",
    "FJ1480",
    "FJ1481",
    "FJ1482",
    "FJ1483",
    "FJ1484",
    "FJ1485",
    "FJ1486"];
var veinsNames = ["FJ1496","FJ1497","FJ1498"];
var arteriesNames = ["FJ1487",
    "FJ1488",
    "FJ1489",
    "FJ1490",
    "FJ1491",
    "FJ1492",
    "FJ1493",
    "FJ1494",
    "FJ1495"];

var invisibleItems = [];


var SHADOW_MAP_WIDTH = 500, SHADOW_MAP_HEIGHT = 500;


var mouse = new THREE.Vector2(), INTERSECTED, CLICKED,returnedItem;

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function createCSSAnimation()
{
    
    cssAnimator = new KF.KeyFrameAnimator;
    cssAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, 0.25, 0.5, 0.75, 1], 
                        values:[
                                { y : camera.rotation.y / 4 },
                                { y : camera.rotation.y / 2},
                                { y : - camera.rotation.y / 4},
                                { y : - camera.rotation.y / 2},
                                { y : - camera.rotation.y / 4},
                                ],
                        target:cssElement.rotation
                    },
                ],
            loop: true,
            duration:5000,

    });

    cssAnimator.start();
        
}

function createAnimation()
{

    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, 1], 
                    values:[
                            { y:0    },
                            { y: 2 * Math.PI},
                            ],
                }
            
            ],
        loop: false,
        duration:10000,

    });
}


function playAnimations()
{
    animator.start();
    
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );
        CSS3DRenderer.render( scene, camera );
        
        //console.log("camera position", camera.position);
        // Update the camera controller
        orbitControls.update();

        animate();
        KF.update();
      
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
}

function createInfoDictionary(namesArray,size,info)
{
    for( var i = 0; i < size; i++)
    {

        armInfo[namesArray[i]] = info[i];
        //console.log("Info: \n",   infoArray[namesArray[i]]);
    }
    //console.log("Dictionary: ", infoArray);
}

function showModel(id)
{
    
    for(var i = 0; i < armArray.length; i++)
    {
        armArray[i].traverse ( function (child) {
            if (child instanceof THREE.Mesh) {
                child.visible = false;
            }
        });
        if(armArray[i].name == id)
        {
            armArray[i].traverse ( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.visible = true;
                    //child.parent.position.set(0,0,-10);
                    console.log("Hijo",child);
                }
            });
            //animator.interps[0].target = armArray[i].rotation;
            //KF.update();
            //playAnimations();
            //armArray[i].position.set(500,0,0);
        }
        //console.log("parte: ",armArray[i]);
    }

    showCSS(id);
    //createCameraAnimation();
   
}

function showCSS(id)
{
    //Remove current Css element
    removeCSS();

    var content = '<div id="css-content">' + armInfo[id] + '</div>'

    //Css 3d objects
    cssElement = createCSS3DObject(content);

    //Set Css position in front of the camera
    var vec = new THREE.Vector3( 500, 100, -10 );
    vec.applyQuaternion( camera.quaternion );
    cssElement.position.copy( vec );
    cssElement.rotation.set(camera.rotation.x,camera.rotation.y,camera.rotation.z);

    
    scene.add(cssElement);

    //createCSSAnimation();

}

function removeCSS()
{
    if(cssElement != null)
    {
        //cssAnimator.stop();
        scene.remove(cssElement);
    }

}

function showGroup(group)
{
    //Remove current Css element
    removeCSS();
    
    console.log("show group");
    for(var i = 0; i < armArray.length; i++)
    {
        armArray[i].traverse ( function (child) {
            if (child instanceof THREE.Mesh) {
                child.visible = false;
            }
        });
    }

    for(var i = 0; i < group.length; i++)
    {
        group[i].traverse ( function (child) {
            if (child instanceof THREE.Mesh) {
                child.visible = true;
            }
        });
    }
}

function loadOBJs(part,quantity,text,group, array,namesArray)
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    for(let i=0; i<quantity; i++)
    {
        objLoader.load(
            '../ArmObjs/'+part+'/'+(i+1)+'.obj',
        function(object)
        {
            
            var texture = new THREE.TextureLoader().load('../textures/'+text+'_texture.png');
            
            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    child.material.map = texture;
                }
            } );
            object.name = namesArray[i];
            array.push(object);
            object.scale.set(3,3,3);
            armArray.push(object);

            
            //bone.rotation.x = Math.PI / 180 * 15;
            //bone.rotation.y = -3;
            //console.log("bo",bone);
            //bone.position.set(0, 0, 10);
            group.add(object);
        },
        function ( xhr ) {

            //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
        
        });
    }
 
}
function returnModel()
{
    console.log("AGAP");
    returnedItem = invisibleItems.pop();

    returnedItem.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
            child.visible = true;
            console.log(child);
        }
    });
}

function changeFlag(tag)
{
    if(tag == "delete")
    {
        deleteElements = true;
    }else{
        deleteElements = false;
    }
    console.log(deleteElements);

}

function onDocumentMouseDown(event)
{
    var canvas = document.getElementById("webglcanvas");
    console.log("CANVAS", canvas);
    event.preventDefault();
    event.preventDefault();
    //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouse.x = ( event.clientX / canvas.width ) * 2 - 1;
    mouse.y = - ( event.clientY /canvas.height ) * 2 + 1;

    //deleteElements = document.getElementById("myRadio").value;

    // find intersections

    console.log("click");
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( armArray,true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;
        //CLICKED.child.position.scale.set(100,100,100);
        if(deleteElements)
        {
            CLICKED.traverse ( function (child) {
                if (child instanceof THREE.Mesh) {
                    child.visible = false;
                    //child.scale.set(15,15,15);
                    console.log(CLICKED.parent);
                }
            });
        }else{
            CLICKED.traverse ( function (child) {
                if (child instanceof THREE.Mesh) {
                    //child.scale.set(15,15,15);
                    console.log(CLICKED.parent);
                    showModel(CLICKED.parent.name);
                }
            });

        }
        

        invisibleItems.push(CLICKED);
        //scene.remove(CLICKED.parent);
       
    }

    //     if(!deadAnimator.running)
    //     {
            
    //         console.log("entra");
    //         CLICKED.parent.animation = 'dead';
            
    //         deadAnimator.interps[0].target = CLICKED.parent.rotation;
    //         deadAnimator.interps[1].target = CLICKED.parent.position;
            
    //         playAnimations();
    //         console.log(dead);
            
    //         score+=1;
    //         $("#score").text(parseInt(score));
    //         spawn();
           
    //     }
    // } 
    // else 
    // {
    //     if ( CLICKED ) 
    //         CLICKED.material.emissive.setHex( CLICKED.currentHex );

    //     CLICKED = null;
    // }
}

function createCSS3DObject(content) 
{
      // convert the string to dome elements
      var wrapper = document.createElement('div');
      wrapper.innerHTML = content;
      var div = wrapper.firstChild;

      // set some values on the div to style it.
      // normally you do this directly in HTML and 
      // CSS files.
      div.style.width = '400px';
      div.style.height = '400px';
      div.style.opacity = 0.7;
      div.style.borderRadius= '10px';
      div.style.background = new THREE.Color(Math.random() * 0xffffff).getStyle();

      // create a CSS3Dobject and return it.
      var object = new THREE.CSS3DObject(div);
      return object;
}

function setAllLights()
{
    //SpotLight
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);

    spotLight.castShadow = false;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    root.add(spotLight);

    //AmbienLight
    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);


}


function createScene(canvas) 
{
    // *************** Renders **********************
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.setSize( canvas.width, canvas.height );

    //create a CSS3DRenderer
    CSS3DRenderer = new THREE.CSS3DRenderer();
    //CSS3DRenderer.setSize(window.innerWidth, window.innerHeight);
    CSS3DRenderer.setSize(canvas.width, canvas.height);
//        renderer.domElement.style.position = 'absolute';
//        renderer.domElement.style.top = 0;

    // add the output of the renderer to the html element
    document.body.appendChild(CSS3DRenderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    // Turn on shadows
    renderer.shadowMap.enabled = false;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // ************ Scene *********************
    // Create a new Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // *************** Camara ******************
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 40000 );
    camera.position.set(-680, 687, -539);
    camera.lookAt( new THREE.Vector3(0,0,0));
    scene.add(camera);
    // ****************************************


    document.addEventListener('mousedown', onDocumentMouseDown);


    //*************** Controlers ***************
    orbitControls = new THREE.OrbitControls(camera, CSS3DRenderer.domElement);
    orbitControls.update();
    //dragControls = new THREE.DragControls( bones, camera, renderer.domElement );
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    arm = new THREE.Object3D;

    //Set lights
    setAllLights();
    
    raycaster = new THREE.Raycaster();

    //**************** Objects ******************
    bones = new THREE.Object3D;
    muscles = new THREE.Object3D;
    veins = new THREE.Object3D;
    arteries = new THREE.Object3D;
    

    loadOBJs("bones",3,'bones',bones,bonesArray,bonesNames);
    loadOBJs("veins",3,'vein',veins,veinsArray,veinsNames);
    loadOBJs("muscles",16,'muscle',muscles,musclesArray,musclesNames);
    loadOBJs("arteries",9,'arterie',arteries,arteriesArray,arteriesNames);

    createInfoDictionary(bonesNames,3,boneInfo);
    createInfoDictionary(musclesNames,16,muscleInfo);
    createInfoDictionary(veinsNames,3,veinInfo);
    createInfoDictionary(arteriesNames,9,arterieInfo);

    createAnimation();

    var geometry = new THREE.SphereGeometry( 2, 32, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( geometry, material );
console.log(sphere.position);
scene.add( sphere );

    root.add(bones);
    root.add(muscles);
    root.add(veins);
    root.add(arteries);

    
    arm.add(bones);
    arm.add(muscles);
    arm.add(veins);
    arm.add(arteries);

    arm.scale.set(.4,.4,.4);
    arm.position.set(300,120,-1000)

    console.log("bones position", arm.position);
    console.log("camera position", camera.position);
    
      // Create a texture map
      var map = new THREE.TextureLoader().load(mapUrl);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(8, 8);

      var color = 0xffffff;

      // Put in a ground plane to show off the lighting
      geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
      var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
  
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = -4.02;

      //scene.add(mesh);

       console.log("MESH",mesh.position);
   
    
   
    // Now add the group to our scene
    scene.add( root );
    scene.add( arm );
}