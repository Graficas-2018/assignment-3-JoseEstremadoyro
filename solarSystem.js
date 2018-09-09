document.addEventListener("DOMContentLoaded",function(event){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
        75,window.innerWidth/window.innerHeight,0.1,110);
    camera.position.z = 10;
    camera.position.y = -10;
    camera.rotation.x = 70;

    var renderer = new THREE.WebGLRenderer({
        canvas:document.getElementById("systemCanvas"),
        antialias:true,
        logarithmicdepthbuffer:true,
        alpha:true
    });
    renderer.setClearColor( 0xffffff, 0);

    function drawCurve(a,b){
        var curve = new THREE.EllipseCurve(
            a-b,0,
            a,b,
        );
        var points = curve.getPoints(60);
        var geo = new THREE.BufferGeometry().setFromPoints(points);
        var mat = new THREE.LineBasicMaterial({color:0x666666});
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
        this.size = size/100000;
        this.ellipseA = ellipseA/100;
        this.ellipseB = ellipseB/100;
        this.rotationPeriod = rotationPeriod;
        this.orbitalInclination = orbitalInclination;

        if(ellipseA){

            // Draw the ellipses
            this.ellipse = drawCurve(this.ellipseA,this.ellipseB);

            // Load texture
            // Draw the planet
            this.sphere = drawSphere(name,this.size,this.ellipseA,0);
        }
        else{
            this.sphere = drawSphere(name,this.size,0,0);
        }

    }

    // Planet information
    // Data taken from https://nssdc.gsfc.nasa.gov/planetary/factsheet/
    planets = [
        new planet("mercury",4879,57.9,56.66,88,7,1407.6),
        new planet("venus",12104,108.2,108.19,224.7,3.4,5832),
        new planet("earth",12756,149.6,149.57,365.2,23.9),
        new planet("mars",6792,227.9,226.9,687,5.1,24.7),
        new planet("jupiter",142984,778.55,777.61,1.9,9.9),
        new planet("saturn",120536,1433.55,1431.26,10747,1.3,10.7),
        new planet("uranus",51118,2872.45,2869.45,30589,2.5,17.2),
        new planet("neptune",49528,4495.1,4494.81,59800,1.8,16.1),
        //new planet("pluto",2370,5906.35,5720.611,90560,17.2,153.3)
    ];
    scene.add(new THREE.HemisphereLight(0xffffff,0xffffff,100));

    // Animate planets
    renderer.render(scene,camera);
});
