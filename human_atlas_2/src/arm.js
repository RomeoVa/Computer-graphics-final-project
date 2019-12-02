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


var mapUrl = "../images/checker_large.gif";

var deleteElements = false;

var bonesInfo = [];
var musclesInfo = [];
var veinsInfo = [];
var arteriesInfo = [];

// Groups
var bones = null,
veins = null,
arteries = null,
muscles = null;

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

var arm = null;

var SHADOW_MAP_WIDTH = 500, SHADOW_MAP_HEIGHT = 500;


var mouse = new THREE.Vector2(), INTERSECTED, CLICKED,returnedItem;

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );
        CSS3DRenderer.render( scene, camera );
        
        // Update the camera controller
        orbitControls.update();
      
}

function createInfoDictionary(namesArray,infoArray,size,info)
{
    for( var i = 0; i < size; i++)
    {

        infoArray[namesArray[i]] = info[i];
        //console.log("Info: \n",   infoArray[namesArray[i]]);
    }
    //console.log("Dictionary: ", infoArray);
}

function showModel(id)
{
    if(cssElement != null)
    {
        scene.remove(cssElement);
    }

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
                }
            });
        }
        //console.log("parte: ",armArray[i]);
    }

    var content = '<div id="css-content">' + bonesInfo[id] + '</div>'

    //Css 3d objects
    cssElement = createCSS3DObject(content);
    cssElement.position.set(0, 0, 0);
    cssElement.rotation.set(0,Math.PI,0);
    console.log(cssElement);
    
    scene.add(cssElement);
   
}

function showGroup(group)
{
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
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

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

    //create a CSS3DRenderer
    CSS3DRenderer = new THREE.CSS3DRenderer();
    CSS3DRenderer.setSize(window.innerWidth, window.innerHeight);
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
    camera.position.set(0, 0, -20);
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

    createInfoDictionary(bonesNames,bonesInfo,3,boneInfo);
    createInfoDictionary(musclesNames,musclesInfo,16,muscleInfo);


//     var geometry = new THREE.SphereGeometry( 15, 8, 6 );
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// var sphere = new THREE.Mesh( geometry, material );
// console.log(sphere.position);
// scene.add( sphere );

    root.add(bones);
    root.add(muscles);
    root.add(veins);
    root.add(arteries);
    console.log("bones position", root.position);
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

       console.log("MESH",mesh.position);
   
    
   
    // Now add the group to our scene
    scene.add( root );
}