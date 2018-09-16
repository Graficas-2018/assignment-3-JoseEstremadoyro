var scene;
var speed =.1;
var camera;
var renderer;
var sun;
var planets;
var stop = false;
function stopf(){
    stop=true;
}
function animate(){
  // run animation of all objects
  if(!stop)
    requestAnimationFrame(animate);
  renderer.render(scene,camera);
  // animate next frame 
  sun.animate();
  planets.map(x=>x.animate()); 
}
function drawCurve(a,b,orbitRotation){

    var curve = new THREE.EllipseCurve(
        a-b,0,
        a,b
    );
    var points = curve.getPoints(1000);
    var geo = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({color:0x888888});
    var ellipse = new THREE.Line(geo,mat);
    scene.add(ellipse);
    // ellipse.rotation.x = orbitRotation; 
    // ellipse.rotation.y = orbitRotation;
    return ellipse;

}
function drawSphere(name,size,x,y,orbitRotation,ellipseA){

    var geo = new THREE.SphereGeometry(size,32,32); 
    var text = new THREE.TextureLoader().load("assets/"+name+".jpg");
    var mat;
    mat = new THREE.MeshPhongMaterial({map:text});
    var sphere = new THREE.Mesh(geo,mat);
    sphere.position.x = x;
    sphere.position.y = y;
    // sphere.position.z = -ellipseA*Math.sin(orbitRotation);

    // Poles to the north
    sphere.rotation.x = 90; 
    scene.add(sphere);

    return sphere

}

function drawSun(name,size){

    var geo = new THREE.SphereGeometry(size,32,32); 
    var text = new THREE.TextureLoader().load("assets/"+name+".jpg");
    var mat = new THREE.MeshBasicMaterial({map:text});
    var sphere = new THREE.Mesh(geo,mat);

    // Poles to the north
    sphere.rotation.x = 90; 
    scene.add(sphere);

    return sphere

}

// Planet class function
function planet(name,size,ellipseA,ellipseB,
        period,orbitalInclination,rotationPeriod){

    this.name = name;
    this.size = size/1000000;
    this.ellipseA = ellipseA/10;
    this.ellipseB = ellipseB/10;
    this.period = period;
    this.rotationPeriod = rotationPeriod;
    this.orbitalInclination = orbitalInclination/180*Math.PI;
    this.degree = 0;

    if(ellipseA){

        // Draw the ellipses
        this.ellipse = drawCurve(
            this.ellipseA,
            this.ellipseB,
            this.orbitalInclination
        );

        // Load texture
        // Draw the planet
		// Scales are modified for visual easiness 
        this.sphere = drawSphere(
            name,
            this.size*15,
            this.ellipseA+this.size/2,
            this.size/2,
            this.orbitalInclination,
            this.ellipseA
        );
        this.animate = ()=>{

            this.degree += 2*Math.PI/this.period*speed;
            this.sphere.rotation.y+=2*Math.PI/this.rotationPeriod*speed;
            this.sphere.position.x = -(
                this.ellipseA*this.ellipseB
            )/Math.sqrt(
                Math.pow(this.ellipseB,2)+
                Math.pow(this.ellipseA,2)*
                Math.pow((Math.tan(this.degree)),2)
            );//+this.ellipseA-this.ellipseB;
            this.sphere.position.y = -(
                this.ellipseA*this.ellipseB
            )/Math.sqrt(
                Math.pow(this.ellipseA,2)+
                Math.pow(this.ellipseB,2)/
                Math.pow((Math.tan(this.degree)),2)
            );
            /*this.sphere.position.z = (
                this.sphere.position.x*
                Math.sin(this.orbitalInclination)
            );*/
            // console.log(this.name,this.sphere.position.z)
            // console.log(this.degree);
            if(this.degree <= 3*Math.PI/2 
                    && this.degree >= Math.PI/2){
                this.sphere.position.x *= -1;
            }
            if(this.degree >= 0 && this.degree <= Math.PI) {
                this.sphere.position.y *= -1;
            }
            if(this.degree >=2*Math.PI){
                this.degree = 0;
            }
            //console.log(this.sphere.position,this.name,this.ellipseA,this.ellipseB);

        }

    }
    else{
		// Scales are modified for visual easiness 
        this.sphere = drawSun(
            name,
            this.size*2,
            0,
            0,
            this.orbitalInclination,
            this.ellipseA
        );
        this.animate = ()=>{
            this.sphere.rotation.y+=2*Math.PI/this.rotationPeriod*speed;
        }; 
    }

}
function onZoom(camera,renderer){
    return function(event){
        var value = Math.pow(2,event.target.value)-1;
        camera.position.z = value;
        camera.position.y = -value;
        renderer.render(scene,camera);
    };
}

function onMove(camera,renderer,xx,yy){
    var startx = xx;
    var starty = yy;
    return function(event){
        var x = (startx-event.clientX)/5000*camera.position.z;
        var y = (starty-event.clientY)/5000*camera.position.z;
        camera.position.x += x;
        camera.position.y -= y;
        renderer.render(scene,camera);
        startx += x;
        starty -= y;
    }
}

// On start
document.addEventListener("DOMContentLoaded",function(event){

    scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(
        60,window.innerWidth/window.innerHeight,0.1,10000);

    camera.position.z = 100;
    camera.position.y = -100;
    camera.rotation.x = 70;
    // camera.rotation.z = 90;

    var canvas = document.getElementById("systemCanvas");
    renderer = new THREE.WebGLRenderer({
        canvas:canvas,
        antialias:true,
        logarithmicdepthbuffer:true,
        alpha:true
    });
    var move; 
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    
    canvas.addEventListener("mousedown",function(event){
        move = onMove(camera,renderer,event.clientX,event.clientY)
        document.addEventListener("mousemove",move);
    });
    canvas.addEventListener("mouseup",function(){
        document.removeEventListener("mousemove",move);
    });
    document.getElementById("range").addEventListener(
            "input",onZoom(camera,renderer)
    );
    canvas.width = width;
    canvas.height = height;

    // renderer.setViewport(0,0,width,height);
    renderer.setSize(width,height);

	//Load background texture
	new THREE.TextureLoader().load(
		'assets/bg.jpg' , function(texture){
			 scene.background = texture;  
		});

    sun = new planet("sun",695508*2,null,null,null,null,24.47);

    // Planet information
    // Data taken from https://nssdc.gsfc.nasa.gov/planetary/factsheet/
    planets = [
        new planet("mercury",4879,57.9,56.66,88,7,1407.6),
        new planet("venus",12104,108.2,108.19,224.7,3.4,5832),
        new planet("earth",12756,149.6,149.57,365.2,0,23.9),
        new planet("mars",6792,227.9,226.9,687,5.1,24.7),
        new planet("jupiter",142984,778.55,777.61,1.9,9.9),
        new planet("saturn",120536,1433.55,1431.26,10747,1.3,10.7),
        new planet("uranus",51118,2872.45,2869.45,30589,2.5,17.2),
        new planet("neptune",49528,4495.1,4494.81,59800,1.8,16.1),
        new planet("pluto",2370,5906.35,5720.611,90560,17.2,153.3)
    ];

    // Ambient Light
    scene.add(new THREE.AmbientLight(0x666666));

    // Point Light
    var light = new THREE.PointLight();
    
    scene.add(light);

    animate();

});

