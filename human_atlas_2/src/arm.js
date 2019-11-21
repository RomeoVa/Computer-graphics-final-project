var renderer = null, 
scene = null, 
camera = null,
raycaster,
root = null,
controls,
loopAnimation = false;

// Groups
var bones = null,
veins = null,
arteries = null,
muscles = null;

var bonesArray = musclesArray = arteriesArray = veinsArray = [];

var arm = null;


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
      
}



function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load(
        '../models/penguin/PenguinBaseMesh.obj',

        function(object)
        {
            
            var texture = new THREE.TextureLoader().load('../models/penguin/Penguin_Diffuse_Color.png');
         
            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    child.material.map = texture;
                }
            } );
                    
            penguin = object;
            penguin.scale.set(3,3,3);
            penguin.position.z = -3;
            penguin.position.x = -1.5;
            penguin.rotation.x = Math.PI / 180 * 15;
            penguin.rotation.y = -3;
            console.log("pinguino",penguin);
            group.add(penguin);
            penguin.position.set(10, 0, 0);
            scene.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}


var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );
    


    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xff00ff );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 20, 150);
    //camera.position.set(0, 0, 150);
    scene.add(camera);

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
    
  

    
    raycaster = new THREE.Raycaster();

   
    // Now add the group to our scene
    scene.add( root );
}