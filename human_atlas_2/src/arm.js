var renderer = null, 
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


var arm = null;

var SHADOW_MAP_WIDTH = 700, SHADOW_MAP_HEIGHT = 700;


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

        // Update the camera controller
        //orbitControls.update();
      
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
            root.add(group);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
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


function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );

    // Turn on shadows
    renderer.shadowMap.enabled = false;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 0, -20);
    camera.lookAt( new THREE.Vector3(0,0,0));
    //camera.position.set(0, 0, 150);
    scene.add(camera);
    document.addEventListener('mousedown', onDocumentMouseDown);


    //Controlers
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;


    raycaster = new THREE.Raycaster();

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
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
    //dragControls = new THREE.DragControls( bones, camera, renderer.domElement );

   
    // Now add the group to our scene
    scene.add( root );
}