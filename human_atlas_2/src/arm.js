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

var content = '<div id="css-content">' +
      '<h1>Bicep Brachii</h1>' +
      '<p> The biceps (Latin: musculus biceps brachii, "two-headed muscle of the arm", sometimes abbreviated to biceps brachii) is a large muscle that lies on the front of the upper arm between the shoulder and the elbow. </p>' +
    '</div>';

var vein0 = '<h1>Basilic vein</h1>' +
'<p>The basilic vein is a large superficial vein of the upper limb that helps drain parts of the hand and forearm. It originates on the medial (ulnar) side of the dorsal venous network of the hand and travels up the base of the forearm, where its course is generally visible through the skin as it travels in the subcutaneous fat and fascia lying superficial to the muscles.</p>';
var vein1 = '<h1>Cephalic vein</h1>' +
'<p>The cephalic vein is a superficial vein in the arm. It communicates with the basilic vein via the median cubital vein at the elbow and is located in the superficial fascia along the anterolateral surface of the biceps brachii muscle.</p>';
var vein2 = '<h1>Median cubital vein</h1>' +
'<p>The median cubital vein (or median basilic vein) is a superficial vein of the upper limb. It is very clinically relevant as it is routinely used for venipuncture (taking blood) and as a site for an intravenous cannula . It connects the basilic and cephalic vein and becomes prominent when pressure is applied.</p>';

var arterie0 = '<h1>Dorsal carpal branch artery.</h1>' +
'<p>The Dorsal carpal branch artery is a small vessel which arises beneath the extensor tendons of the thumb; crossing the carpus transversely toward the medial border of the hand, it anastomoses with the dorsal carpal branch of the ulnar artery.</p>';
var arterie1 = '<h1>Radial collateral branch artery.</h1>' +
'<p>This artery is a branch of the deep brachial artery. It arises in the arm proper and anastomoses with the radial recurrent artery near the elbow.</p>';
var arterie2 = '<h1>Brachial artery.</h1>' +
'<p>The brachial artery is the major blood vessel of the (upper) arm. It is the continuation of the axillary artery beyond the lower margin of teres major muscle. It continues down the ventral surface of the arm until it reaches the cubital fossa at the elbow.</p>';
var arterie3 = '<h1>Deep brachial artery</h1>' +
'<p>The deep artery of arm (also known as arteria profunda brachii and the deep brachial artery) is a large vessel which arises from the lateral and posterior part of the brachial artery, just below the lower border of the teres major.</p>';
var arterie4 = '<h1>Inferior ulnar collateral artery.</h1>' +
'<p>This artery arises about 5 cm. above the elbow from the brachial artery.</p>';
var arterie5 = '<h1>Posterior ulnar recurrent artery.</h1>' +
'<p>The posterior ulnar recurrent artery is an artery in the forearm. It is one of two recurrent arteries that arises from the ulnar artery, the other being the anterior ulnar recurrent artery. The posterior ulnar recurrent artery being much larger than the anterior and also arises somewhat lower than it.</p>';
var arterie6 = '<h1>Radial recurrent artery</h1>' +
'<p>The radial recurrent artery arises from the radial artery immediately below the elbow.It ascends between the branches of the radial nerve, lying on the supinator muscle and then between the brachioradialis muscle and the brachialis muscle, supplying these muscles and the elbow-joint, and anastomosing with the terminal part of the profunda brachii.</p>';
var arterie7 = '<h1>Superior ulnar collateral artery</h1>' +
'<p>The superior ulnar collateral artery (inferior profunda artery), of small size, arises from the brachial artery a little below the middle of the arm; it frequently springs from the upper part of the a. profunda brachii.</p>';
var arterie8 = '<h1>Trunk ulnar artery.</h1>' +
'<p>The ulnar artery is the main blood vessel, with oxygenated blood, of the medial aspect of the forearm. It arises from the brachial artery and terminates in the superficial palmar arch, which joins with the superficial branch of the radial artery. It is palpable on the anterior and medial aspect of the wrist.</p>';


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
                    child.position.set(0,0,0);
                    console.log("Hijo",child);
                }
            });
        }
        //console.log("parte: ",armArray[i]);
    }
   
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


    var geometry = new THREE.SphereGeometry( 15, 8, 6 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( geometry, material );
console.log(sphere.position);
scene.add( sphere );

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

      //scene.add(mesh);

       console.log("MESH",mesh.position);
   
    
    //Css 3d objects
    var cssElement = createCSS3DObject(content);
    cssElement.position.set(-10, 0, 0);
    cssElement.rotation.set(0,Math.PI,0);
    console.log(cssElement);
    //scene.add(cssElement);

   
    // Now add the group to our scene
    scene.add( root );
}