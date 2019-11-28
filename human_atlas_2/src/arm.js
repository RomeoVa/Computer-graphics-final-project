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

var bonesDict = [];

var arm = null;

var SHADOW_MAP_WIDTH = 700, SHADOW_MAP_HEIGHT = 700;


var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;

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
        orbitControls.update();
      
}



function loadOBJs(part,quantity)
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    for(let i=1; i<=quantity; i++)
    {
        objLoader.load(
            '../ArmObjs/'+part+'/'+i+'.obj',
        function(object)
        {
            
            var texture = new THREE.TextureLoader().load('../textures/muscle_texture.png');
            
            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    child.material.map = texture;
                }
            } );
            bone = object;


            bone.scale.set(1,1,1);
            bone.position.z = -3;
            bone.position.x = -1.5;
            //bone.rotation.x = Math.PI / 180 * 15;
            //bone.rotation.y = -3;
            //console.log("bo",bone);
            //bone.position.set(30, 0, 0);
            bones.add(bone);
            scene.add(bones);
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
    camera.position.set(0, 20, 150);
    //camera.position.set(0, 0, 150);
    scene.add(camera);

    //Controlers
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    

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

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    bones = new THREE.Object3D;

    
    loadOBJs("bones",3);
    //loadOBJs("veins",3);
    //loadOBJs("muscles",16);
    //loadMuscles();
    //dragControls = new THREE.DragControls( bones, camera, renderer.domElement );

   
    // Now add the group to our scene
    scene.add( root );
}