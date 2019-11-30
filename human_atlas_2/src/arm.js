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

var invisibleItems = [];

var content = '<div id="css-content">' +
      '<h1>Bicep Brachii</h1>' +
      '<p> The biceps (Latin: musculus biceps brachii, "two-headed muscle of the arm", sometimes abbreviated to biceps brachii) is a large muscle that lies on the front of the upper arm between the shoulder and the elbow. </p>' +
    '</div>';


var arm = null;

<<<<<<< HEAD
var SHADOW_MAP_WIDTH = 500, SHADOW_MAP_HEIGHT = 500;
=======
var SHADOW_MAP_WIDTH = 400, SHADOW_MAP_HEIGHT = 400;
>>>>>>> a6aa45c789f42b560fa76d6cb0f7bffab3e03bf3


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


function loadOBJs(part,quantity,text,group, array)
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    for(let i=1; i<=quantity; i++)
    {
        objLoader.load(
            '../ArmObjs/'+part+'/'+i+'.obj',
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
            
            array.push(object);
            armArray.push(object);

            object.scale.set(3,3,3);
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
function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( armArray,true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;
        CLICKED.traverse ( function (child) {
            if (child instanceof THREE.Mesh) {
                child.visible = false;
                console.log(child);
            }
        });

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

    //renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //create a CSS3DRenderer
    CSS3DRenderer = new THREE.CSS3DRenderer();
    CSS3DRenderer.setSize(window.innerWidth, window.innerHeight);
//        renderer.domElement.style.position = 'absolute';
//        renderer.domElement.style.top = 0;

    // add the output of the renderer to the html element
    document.body.appendChild(CSS3DRenderer.domElement);

    //window.addEventListener( 'resize', onWindowResize, false );

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
    camera.position.set(0, 0, -700);
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
    console.log("bones position", bones.position);
    console.log("camera position", camera.position);

    
    loadOBJs("bones",3,'bones',bones,bonesArray);
    loadOBJs("veins",3,'vein',veins,veinsArray);
    loadOBJs("muscles",16,'muscle',muscles,musclesArray);
    loadOBJs("arteries",9,'arterie',arteries,arteriesArray);

    root.add(bones);
    root.add(muscles);
    root.add(veins);
    root.add(arteries);
    
    //Css 3d objects
    var cssElement = createCSS3DObject(content);
    cssElement.position.set(-10, 0, 0);
    cssElement.rotation.set(0,Math.PI,0);
    console.log(cssElement);
    scene.add(cssElement);

   
    // Now add the group to our scene
    scene.add( root );
}