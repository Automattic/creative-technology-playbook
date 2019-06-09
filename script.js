var renderer	= new THREE.WebGLRenderer({
	antialias	: true,
	alpha: true
});

renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );
// init scene and camera
var scene	= new THREE.Scene();
var camera = new THREE.Camera();
scene.add(camera);
var ambientLight = new THREE.AmbientLight( 0x000000  );
scene.add( ambientLight  );

var onRenderFcts = [];
var lights = [];
lights[ 0  ] = new THREE.PointLight( 0xffffff, 1, 0  );
lights[ 1  ] = new THREE.PointLight( 0xffffff, 1, 0  );
lights[ 2  ] = new THREE.PointLight( 0xffffff, 1, 0  );

lights[ 0  ].position.set( 0, 20, 0  );
lights[ 1  ].position.set( 10, 20, 10  );
lights[ 2  ].position.set( - 10, - 20, - 10  );

scene.add( lights[ 0  ]  );
scene.add( lights[ 1  ]  );
scene.add( lights[ 2  ]  );

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////
var arToolkitSource = new THREEx.ArToolkitSource({
	sourceType : 'webcam',
});

arToolkitSource.init(function onReady(){
	onResize()
})

// handle resize
window.addEventListener('resize', function(){
	onResize()
});

function onResize(){
	arToolkitSource.onResize()	
	arToolkitSource.copySizeTo(renderer.domElement)	
	if( arToolkitContext.arController !== null ){
		arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
	}	
}

// create atToolkitContext
var arToolkitContext = new THREEx.ArToolkitContext({
	cameraParametersUrl: 'assets/camera_para.dat',
	detectionMode: 'mono',
	maxDetectionRate: 30,
	canvasWidth: 80*3,
	canvasHeight: 60*3,
});

// initialize it
arToolkitContext.init(function onCompleted(){
	// copy projection matrix to camera
	camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
});

// update artoolkit on every frame
onRenderFcts.push(function(){
	if( arToolkitSource.ready === false )	return
	arToolkitContext.update( arToolkitSource.domElement )
});

////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////

// build a smoothedControls
var smoothedRoot = new THREE.Group()
scene.add(smoothedRoot)
var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
	lerpPosition: 0.4,
	lerpQuaternion: 0.3,
	lerpScale: 1,
});

// build markerControls
function createMarker( name, scene, mesh, patternUrl ){
	var markerRoot = new THREE.Group();
	markerRoot.name = name;
	scene.add( markerRoot );
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type : 'pattern',
		patternUrl : 'assets/' + patternUrl
	});
	markerRoot.add( mesh );

	onRenderFcts.push(function(){
		smoothedControls.update( markerRoot );
	});
}

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////
// var arWorldRoot = smoothedRoot

function generateSprite() {
	var canvas = document.createElement( 'canvas'  );
	canvas.width = 16;
	canvas.height = 16;

	var context = canvas.getContext( '2d'  );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2  );
	gradient.addColorStop( 0, 'rgba(255,255,255,0)'  );
	gradient.addColorStop( 0.2, 'rgba(255,0,40,1)'  );
	gradient.addColorStop( 0.4, 'rgba(64,0,0,1)'  );
	gradient.addColorStop( 1, 'rgba(255,255,255,0)'  );

	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height  );

	return canvas;
}

function initParticle( particle, delay  ) {
	// var particle = this instanceof THREE.Sprite ? this : particle;
	var delay = delay !== undefined ? delay : 0;

	particle.position.set( 0, 0, .1 );
	particle.scale.x = particle.scale.y = Math.random() * .1 + .05;

	new TWEEN.Tween( particle  )
		.delay( delay  )
		.to( {}, 10000  )
		.onComplete( initParticle  )
		.start();

	new TWEEN.Tween( particle.position  )
		.delay( delay  )
		.to( { x: Math.random() * 30 - 15, y: Math.random() * 50 - 25, z: - Math.random() * 30 - 15  }, 50000  )
		.start();

	new TWEEN.Tween( particle.scale  )
		.delay( delay  )
		.to( { x: 0.01, y: 0.01  }, 10000 )
		.start();
}

function initFastParticle( particle, delay ) {
	var particle = this instanceof THREE.Sprite ? this : particle;
	var delay = delay !== undefined ? delay : 0;

	particle.position.set( -.18, 0, .1 );
	particle.scale.x = particle.scale.y = .1;

	new TWEEN.Tween( particle  )
		.delay( delay  )
		.to( {}, 750  )
		.onComplete( initFastParticle  )
		.start();

	new TWEEN.Tween( particle.position  )
		.delay( delay  )
		.to( { x: 0.2, y: 0, z: -.2  }, 750  )
		.easing(TWEEN.Easing.Circular.Out) 
		.start();
}

function initConnectionParticleLeft( particle, delay ){
	var particle = this instanceof THREE.Sprite ? this : particle;
	var delay = delay !== undefined ? delay : 0;

	particle.position.set( -0.2, 0, 0 );
	particle.scale.x = particle.scale.y = .1;

	new TWEEN.Tween( particle )
		.delay( delay  )
		.to( {}, 1500  )
		.onComplete( initConnectionParticleLeft )
		.start();

	new TWEEN.Tween( particle.position  )
		.delay( delay  )
		.to( { z: 1 }, 5000  )
		.easing(TWEEN.Easing.Circular.Out) 
		.start();

	new TWEEN.Tween( particle.position )
		.delay( delay  )
		.to( { x: 1 }, 5000  )
		.start();
}

var material = new THREE.SpriteMaterial({
	map: new THREE.CanvasTexture( generateSprite() ),
	blending: THREE.AdditiveBlending
});

var group = new THREE.Group()
for ( var i = 0; i < 100; i++  ) {

	particle = new THREE.Sprite( material );

	initParticle( particle, i * 100  );

	group.add( particle );
}
createMarker( 'experimentation', scene, group, 'experimentation.patt' );

particle = new THREE.Sprite( material );
initFastParticle( particle, 0 );
createMarker( 'speed', scene, particle, 'speed.patt' );

particle = new THREE.Sprite( material );
initConnectionParticleLeft( particle, 0 );
createMarker( 'connection', scene, particle, 'connection.patt' );

//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
var stats = new Stats();
document.body.appendChild( stats.dom );

function animate(){
	renderer.render( scene, camera );
	onRenderFcts.forEach( ( renderFct ) => {
		renderFct();
	});
	TWEEN.update();
	stats.update();
	requestAnimationFrame( animate );
}

requestAnimationFrame( animate );

// var loader = new THREE.FontLoader();
// var font = loader.load(
// 	'assets/Arial_Regular.json',
// 	function( font ) {
// 		var geometry = new THREE.TextGeometry( '886', {
// 			font: font,
// 			size: .25,
// 			height: .025,
// 			curveSegments: 24
// 		} );
// 		var material	= new THREE.MeshPhongMaterial({
// 			emissive: 0x0,
// 			shininess: 21,
// 			specular: 0x111111,
// 			color: 0xe51849
// 		}); 
// 		var meshStat = new THREE.Mesh( geometry, material );
// 		meshStat.position.y	= 0;
// 		meshStat.position.x	= - 0.25;

// 		var geometry = new THREE.TextGeometry( 'deploys this week', {
// 			font: font,
// 			size: .15,
// 			height: .025,
// 			curveSegments: 24
// 		} );
// 		var meshCaption = new THREE.Mesh( geometry, material );
// 		meshCaption.position.y	= .25;
// 		meshCaption.position.x	= - 0.4;

// 		var group = new THREE.Group( geometry, material )
// 		group.add( meshStat );
// 		group.add( meshCaption );
// 		group.rotation.x = - Math.PI / 2;
// 		// createMarker( 'speed', scene, group, 'speed.patt' );
// 	},

// 	function ( xhr ) {
// 		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
// 	},

// 	// onError callback
// 	function ( err ) {
// 		console.log( 'An error happened' );
// 	}
// );

