var renderer = null, 
scene = null, 
robotGroup = null,
camera = null,
raycaster,
root = null,
robot_idle = null,
robot_attack = null,
controls,
group = null,
loopAnimation = false;
var totalSeconds;
var paused = false;
var robotMaterial = null;
var highscore = 0;
var spawned = false;
var dead = false;
var idleAnimationLoaded = runAnimationLoaded = attackAnimationLoaded = 0;

var blocker,  instructions;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;

var score = 0;
var robot_mixer = {};
var mixer = {};
var deadAnimator;
var morphs = [];
var robots = [];


var duration = 20000; // ms
var currentTime = Date.now();

var animation = "idle";

var Clock = {
    totalSeconds: 60,

    start: function () {
      var self = this;
  
      this.interval = setInterval(function () {
        self.totalSeconds -= 1;
        $("#time").text(parseInt(self.totalSeconds % 60));
       totalSeconds = self.totalSeconds;
      }, 1000);
    },
  
    pause: function () {
      clearInterval(this.interval);
      delete this.interval;
    },
  
    resume: function () {
      if (!this.interval) this.start();
    }
  };
  
  

window.onload = function () {
    Clock.pause();
};

function togglePause()
{
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );
        
    if (!paused)
    {
        paused = true;
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        animation = "run";
        Clock.resume();
       
    } else if (paused)
    {
        blocker.style.display = 'block';
        instructions.style.display = '';
        animation = "idle";
        Clock.pause();
        paused= false;
       
    }

}

function pause()
{
    window.addEventListener('keydown', function (e) {
        var key = e.keyCode;
        if (key === 80)// p key
        {
            togglePause();
        }
        });
}


function restartScene(){
    window.addEventListener('keydown', function (e) {
        var key = e.keyCode;
        if (key === 82)// r key
        {
            restart();
        }
    });
}


function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        createDeadAnimation();
    }
    else
    {
        robot_idle.rotation.x = 0;
        robot_idle.rotation.z = 0;
        robot_idle.position.y = -4;
    }
}


function createDeadAnimation()
{

    deadAnimator = new KF.KeyFrameAnimator;
    deadAnimator.init({ 
        interps:
            [
                { 
                    keys:[0, 0.3], 
                    values:[
                            { z:0    },
                            { z: -Math.PI/ 1.5},
                            ],
                },
                { 
                    keys:[0,0.3, 1], 
                    values:[
                            { y:-4    },
                            { y:-1 },
                            { y:-10 },
                            ],
                    
                },
            
            ],
        loop: loopAnimation,
        duration:1000,

    });
}

function playAnimations()
{
    deadAnimator.start();
    
}


function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( robots,true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;
       


        if(!deadAnimator.running)
        {
            
            console.log("entra");
            CLICKED.parent.animation = 'dead';
            
            deadAnimator.interps[0].target = CLICKED.parent.rotation;
            deadAnimator.interps[1].target = CLICKED.parent.position;
            
            playAnimations();
            console.log(dead);
            
            score+=1;
            $("#score").text(parseInt(score));
            spawn();
           
        }
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( '../models/Robot/robot_idle.fbx', function ( object ) 
    {
        
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                robotMaterial = child.material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        console.log(object.animations);
        robot_idle = object;

        robot_idle.robot_mixer = {};
        robot_idle.robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        
        createDeadAnimation();

        robot_idle.robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();
        idleAnimationLoaded = 1;
        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_idle.robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_idle.robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
            robot_idle.animations.push(object.animations[ 0 ]);
            attackAnimationLoaded = 1;
        } );

        loader.load( '../models/Robot/robot_run.fbx', function ( object ) 
        {
            console.log("RUN");
            robot_idle.robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_idle.robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
            robot_idle.animations.push(object.animations[ 0 ]);
            runAnimationLoaded = 1;
        } );

        loader.load( '../models/Robot/robot_walk.fbx', function ( object ) 
        {
            robot_idle.robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_idle.robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
            robot_idle.animations.push(object.animations[ 0 ]);
            
        } );
      
        
    } );
    
}

function spawn()
{
    console.log("Cloning robot",robot_idle.animations);
    var newRobot = cloneFbx(robot_idle);
    newRobot.animation = 'run';
    newRobot.scale.set(0.01, 0.01, 0.01);
    newRobot.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.material = robotMaterial.clone();
        }
    } );
    var x = Math.floor(Math.random()*50) + 1; 
    var z =  -70 - Math.random() * 50;
    x *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

    newRobot.position.set( x, -4, z);
    newRobot.mixer = {};
    newRobot.mixer["idle"] =  new THREE.AnimationMixer( scene );
    newRobot.mixer["run"] =  new THREE.AnimationMixer( scene );
    newRobot.mixer["attack"] =  new THREE.AnimationMixer( scene );
    newRobot.mixer["dead"] = new KF.KeyFrameAnimator;
    newRobot.mixer["dead"] = deadAnimator;
    console.log("ANIMATOR",newRobot.mixer["dead"]);
    newRobot.mixer["idle"].clipAction( robot_idle.animations[ 0 ], newRobot ).play();
    newRobot.mixer["attack"].clipAction( robot_idle.animations[ 1 ], newRobot ).play();
    newRobot.mixer["run"].clipAction( robot_idle.animations[ 2 ], newRobot ).play();

    robots.push(newRobot);
    robotGroup.add(newRobot);
    scene.add(newRobot);
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
   
    if ( robots.length > 0) {
        for(robot_i of robots)
        {
            if(!paused)
            {
                robot_i.mixer['idle'].update(deltat * 0.001);
            }

            if(robot_i &&  robot_i.position.z < 80  && paused && robot_i.animation !="dead"){
                robot_i.mixer['run'].update(deltat * 0.001);
                robot_i.position.z += 0.01 * deltat;
            }
            
            else if(robot_i &&  robot_i.position.z > 80 && robot_i.position.z < 100 && robot_i.animation !="dead")
            {
                robot_i.mixer['attack'].update(deltat * 0.001);  
                robot_i.position.z += 0.01 * deltat;
            }
            else if(robot_i &&  robot_i.position.z > 100)
            {
                score-=1;
                $("#score").text(parseInt(score));
                robot_i.position.z = -70 - Math.random() * 50;
            }
           
            if(robot_i.animation =="dead")
            {
                robot_i.mixer["idle"].update(deltat * 0.001);
                KF.update();
                console.log("POSICION",robot_i.position.y );  
                if(robot_i.position.y == -10)
                {       
                    console.log("SE ELIMINA");     
                    scene.remove(robot_i);
    
                }
            
                //scene.remove(robot_i);

            }
           
        }    
    }
    
}

function restart(){
  
    animation = 'idle';
    Clock.totalSeconds = totalSeconds =60;
    Clock.pause();
    if (score > highscore){
        highscore = score;
    }
    score = 0;
    
    $("#highscore").text(parseInt(highscore));
    $("#score").text(parseInt(score));
    $("#time").text(parseInt(totalSeconds));
    spawned = false;
    blocker.style.display = 'block';
    instructions.style.display = '';
    for(robot_i of robots)
    {
        scene.remove(robot_i);
    }
    robots = [];
    paused= false;
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );
        if(runAnimationLoaded == attackAnimationLoaded == idleAnimationLoaded == 1 && !spawned)
        {
            for(var i = 0; i <= 6;i++){
                spawn();
            }
           
            spawned = true;
        }
        if(totalSeconds == 0)
        {
            restart();
            console.log("FIN");
        }
        // Spin the cube for next frame
        animate();
        KF.update();

        // Update the camera controller
        //orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

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
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 250 );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 20, 150);
    //camera.position.set(0, 0, 150);
    scene.add(camera);
    robotGroup = new THREE.Object3D;
    scene.add(robotGroup);

        
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
    
    // Create the objects
    loadFBX();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

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
 
    window.addEventListener( 'resize', onWindowResize);
    document.addEventListener('mousedown', onDocumentMouseDown);

    pause();
    restartScene();
    
    raycaster = new THREE.Raycaster();

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );
}