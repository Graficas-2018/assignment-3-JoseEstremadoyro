var end;
function drawCurve(a,b){
    var curve = new THREE.EllipseCurve(
        a-b,0,
        a,b,
    );
    var points = curve.getPoints(1000);
    var geo = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({color:0x888888});
    var ellipse = new THREE.Line(geo,mat);
    scene.add(ellipse);
    return ellipse;
}
function drawSphere(name,size,x,y){
    var geo = new THREE.SphereGeometry(size,32,32); 
    var text = new THREE.TextureLoader().load("assets/"+name+".jpg");
    var mat = new THREE.MeshBasicMaterial({map:text});
    var sphere = new THREE.Mesh(geo,mat);
    sphere.position.x = x;
    sphere.position.y = y;
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
    this.rotationPeriod = rotationPeriod;
    this.orbitalInclination = orbitalInclination;

    if(ellipseA){

        // Draw the ellipses
        this.ellipse = drawCurve(this.ellipseA,this.ellipseB);
		this.ellipse.rotation.x = orbitalInclination/180*Math.PI;
		this.ellipse.rotation.y = orbitalInclination/180*Math.PI;

        // Load texture
        // Draw the planet
		// Scales are modified for visual easiness 
        this.sphere = drawSphere(name,this.size*15,this.ellipseA,0);
    }
    else{
		// Scales are modified for visual easiness 
        this.sphere = drawSphere(name,this.size*2,0,0);
    }

}
function onZoom(camera,renderer){
    return function(event){
        var value = Math.pow(2,event.target.value);
        console.log(value);
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
        console.log(startx,starty,x,y)
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
    var camera = new THREE.PerspectiveCamera(
        60,window.innerWidth/window.innerHeight,0.1,10000);

    camera.position.z = 100;
    camera.position.y = -100;
    camera.rotation.x = 70;
    // camera.rotation.z = 90;

    var canvas = document.getElementById("systemCanvas");
    var renderer = new THREE.WebGLRenderer({
        canvas:canvas,
        antialias:true,
        logarithmicdepthbuffer:true,
        alpha:true
    });
    var move; 
    canvas.addEventListener("mousedown",function(event){
        console.log("mousedown",event.clientX,event.clientY);
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

    // Planet information
    // Data taken from https://nssdc.gsfc.nasa.gov/planetary/factsheet/
    planets = [
        new planet("sun",695508*2,null,null,88,0,1407.6),
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
    scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,100));

    // Animate planets
    renderer.render(scene,camera);

});

