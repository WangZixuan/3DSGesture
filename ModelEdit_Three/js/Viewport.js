/**
 * @author mrdoob / http://mrdoob.com/
 */

var Viewport = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Info( editor ) );

	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = [];

	// helpers

	//var grid = new THREE.GridHelper( 800, 25 );
	//sceneHelpers.add( grid );

	// camera

	var camera = editor.camera;

    // LIGHTS

    var light = new THREE.DirectionalLight( 0xaabbff, 0.3 );
    light.position.x = 300;
    light.position.y = 250;
    light.position.z = -500;
    scene.add( light );

	var light2 = new THREE.DirectionalLight( 0xaabbff, 0.3 );
	light2.position.x = 300;
	light2.position.y = -250;
	light2.position.z = -500;
	scene.add( light2 );

    var light3 = new THREE.DirectionalLight( 0xaabbff, 0.3 );
    light3.position.x = -300;
    light3.position.y = -250;
    light3.position.z = 500;
    scene.add( light3 );

    var light4 = new THREE.DirectionalLight( 0xaabbff, 0.3 );
    light4.position.x = -300;
    light4.position.y = 250;
    light4.position.z = -500;
    scene.add( light4 );

    // SKYDOME

    var vertexShader = document.getElementById( 'vertexShader' ).textContent;
    var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    var uniforms = {
        topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
        bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
        offset:		 { type: "f", value: 400 },
        exponent:	 { type: "f", value: 0.6 }
    };
    uniforms.topColor.value.copy( light.color );

    var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
    var skyMat = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    } );

    var sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );

    // Floor

    var loader = new THREE.JSONLoader();
    loader.load( "js/lightmap/lightmap.json", function ( geometry, materials ) {

        for ( var i = 0; i < materials.length; i ++ ) {

            materials[ i ].lightMapIntensity = 0.75;

        }

        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

        mesh.scale.multiplyScalar( 100 );
        scene.add( mesh );

        render();

    } );

	// Model Box

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var matrix = new THREE.Matrix4();

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.update( object );

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

		}

		render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		var object = transformControls.object;

		matrix.copy( object.matrix );

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( matrix.equals( object.matrix ) === false ) {

			( function ( matrix1, matrix2 ) {

				editor.history.add(
					function () {
						matrix1.decompose( object.position, object.quaternion, object.scale );
						signals.objectChanged.dispatch( object );
					},
					function () {
						matrix2.decompose( object.position, object.quaternion, object.scale );
						signals.objectChanged.dispatch( object );
					}
				);

			} )( matrix.clone(), object.matrix.clone() );

		}

		signals.objectChanged.dispatch( object );
		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );

	// fog

	var oldFogType = "None";
	var oldFogColor = 0xaaaaaa;
	var oldFogNear = 1;
	var oldFogFar = 5000;
	var oldFogDensity = 0.00025;

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	// events

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return raycaster.intersectObjects( objects );

	};

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	};

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) == 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			render();

		}

	};

	function onMouseDown( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	};

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	};

	function onDoubleClick( event ) {

		//var array = getMousePosition( container.dom, event.clientX, event.clientY );
		//onDoubleClickPosition.fromArray( array );
        //
		//var intersects = getIntersects( onDoubleClickPosition, objects );
        //
		//if ( intersects.length > 0 ) {
        //
		//	var intersect = intersects[ 0 ];
        //
		//	signals.objectFocused.dispatch( intersect.object );
        //
		//}

<<<<<<< HEAD
        if (curTool == "Brush") {

			mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
			
			raycaster.setFromCamera( mouse, camera );
=======
        if ( curTool == "Brush" ) {

            mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

            console.log(renderer.domElement.clientWidth);
            console.log(renderer.domElement.clientHeight);

>>>>>>> refs/remotes/Neroldy/master
            var points = editor.selected.geometry.vertices;//Get points
            var faces = editor.selected.geometry.faces;//Get faces

            raycaster.setFromCamera(mouse, camera);
            // See if the ray from the camera into the world hits one of our meshes
            var intersects = raycaster.intersectObject(editor.selected);
<<<<<<< HEAD

			
			//Make a Goss Lump.
			if (intersects.length != 0)
			{
				var middlePoint = faces[intersects[0].faceIndex].a;
			
				var outsideCirclePoints = new Set();
				var outsideFaces = new Set();
				for (var i=0; i<faces.length; ++i)
				{
					//console.log(faces[i].a);
					if (faces[i].a == middlePoint)
					{
						outsideCirclePoints.add(faces[i].b);
						outsideCirclePoints.add(faces[i].c);
						outsideFaces.add(i);
						continue;
					}
					if (faces[i].b == middlePoint)
					{
						outsideCirclePoints.add(faces[i].a);
						outsideCirclePoints.add(faces[i].c);
						outsideFaces.add(i);
						continue;
					}
					if (faces[i].c == middlePoint)
					{
						outsideCirclePoints.add(faces[i].a);
						outsideCirclePoints.add(faces[i].b);
						outsideFaces.add(i);
						continue;
					}
				}
				var arrayOutsideFaces = Array.from(outsideFaces);
				var arrayOutsideCirclePoints = Array.from(outsideCirclePoints);
				
				//Get the outside of outside.
				
				var outsideOutsideCirclePoints = new Set(); 
				
				for (var i=0; i<faces.length; ++i)
				{
					var index = indexOf.call(arrayOutsideCirclePoints, faces[i].a);
					if (-1 != index)
					{
						outsideOutsideCirclePoints.add(faces[i].b);
						outsideOutsideCirclePoints.add(faces[i].c);
					}
						
					index = indexOf.call(arrayOutsideCirclePoints, faces[i].b);
					if (-1 != index)
					{
						outsideOutsideCirclePoints.add(faces[i].a);
						outsideOutsideCirclePoints.add(faces[i].c);
					}
						
					index = indexOf.call(arrayOutsideCirclePoints, faces[i].c);
					if (-1 != index)
					{
						outsideOutsideCirclePoints.add(faces[i].a);
						outsideOutsideCirclePoints.add(faces[i].b);
					}
				}
				
	
				//Calculate sum of all normal vectors of faces in outsideFaces[].
				var sumOfNormal = new Array(0,0,0);
											
				for (var oneFaceIndex in arrayOutsideFaces)
				//for (let oneFaceIndex of outsideFaces) 
				{
					console.log("oneFaceIndex");
					console.log(arrayOutsideFaces[oneFaceIndex]);
					sumOfNormal[0]+=faces[arrayOutsideFaces[oneFaceIndex]].normal.x;
					sumOfNormal[1]+=faces[arrayOutsideFaces[oneFaceIndex]].normal.y;
					sumOfNormal[2]+=faces[arrayOutsideFaces[oneFaceIndex]].normal.z;
				}
				
				//Normalized
				var sumsum = Math.pow(sumOfNormal[0], 2) + Math.pow(sumOfNormal[1], 2) + Math.pow(sumOfNormal[2], 2);  
				sumsum = Math.sqrt(sumsum);
				sumOfNormal[0] = sumOfNormal[0] / sumsum;
				sumOfNormal[1] = sumOfNormal[1] / sumsum;
				sumOfNormal[2] = sumOfNormal[2] / sumsum;
				
				//Make the lump
				points[middlePoint].x += 30 * sumOfNormal[0] / sumsum;
				points[middlePoint].y += 30 * sumOfNormal[1] / sumsum;
				points[middlePoint].z += 30 * sumOfNormal[2] / sumsum;
				
				
				
				for (var onePoint in arrayOutsideCirclePoints)
				//for (let onePoint of outsideCirclePoints) 
				{
					if (-1 != indexOf.call(arrayOutsideCirclePoints, arrayOutsideCirclePoints[onePoint]))
					{
						points[arrayOutsideCirclePoints[onePoint]].x += 20 * sumOfNormal[0] / sumsum;
						points[arrayOutsideCirclePoints[onePoint]].y += 20 * sumOfNormal[1] / sumsum;
						points[arrayOutsideCirclePoints[onePoint]].z += 20 * sumOfNormal[2] / sumsum;
					}
				}
				
				var arrayOutsideOutsideCirclePoints = Array.from(outsideOutsideCirclePoints);
				for (var onePoint in arrayOutsideOutsideCirclePoints)
				//for (let onePoint of outsideCirclePoints) 
				{
					points[arrayOutsideOutsideCirclePoints[onePoint]].x += 10 * sumOfNormal[0] / sumsum;
					points[arrayOutsideOutsideCirclePoints[onePoint]].y += 10 * sumOfNormal[1] / sumsum;
					points[arrayOutsideOutsideCirclePoints[onePoint]].z += 10 * sumOfNormal[2] / sumsum;
				}
				
			}
		}
			
=======
            //console.log(intersects.length);

            //Make a Goss Lump.
            if (intersects.length != 0)//TODO chage it to !=
            {
                var middlePoint = faces[intersects[0].faceIndex].a;

                var outsideCirclePoints = new Set();
                var outsideFaces = new Set();
                for (var i = 0; i < faces.length; ++i) {
                    //console.log(faces[i].a);
                    if (faces[i].a == middlePoint) {
                        outsideCirclePoints.add(faces[i].b);
                        outsideCirclePoints.add(faces[i].c);
                        outsideFaces.add(i);
                        continue;
                    }
                    if (faces[i].b == middlePoint) {
                        outsideCirclePoints.add(faces[i].a);
                        outsideCirclePoints.add(faces[i].c);
                        outsideFaces.add(i);
                        continue;
                    }
                    if (faces[i].c == middlePoint) {
                        outsideCirclePoints.add(faces[i].a);
                        outsideCirclePoints.add(faces[i].b);
                        outsideFaces.add(i);
                        continue;
                    }
                }


                //Calculate sum of all normal vectors of faces in outsideFaces[].
                var sumOfNormal = new Array(0, 0, 0);

                var arrayoutsideFaces = Array.from(outsideFaces);

                for (var oneFaceIndex in arrayoutsideFaces)
                    //for (let oneFaceIndex of outsideFaces)
                {
                    console.log("oneFaceIndex");
                    console.log(arrayoutsideFaces[oneFaceIndex]);
                    sumOfNormal[0] += faces[arrayoutsideFaces[oneFaceIndex]].normal.x;
                    sumOfNormal[1] += faces[arrayoutsideFaces[oneFaceIndex]].normal.y;
                    sumOfNormal[2] += faces[arrayoutsideFaces[oneFaceIndex]].normal.z;
                }

                //Normalized
                var sumsum = Math.pow(sumOfNormal[0], 2) + Math.pow(sumOfNormal[1], 2) + Math.pow(sumOfNormal[2], 2);
                sumsum = Math.sqrt(sumsum);
                sumOfNormal[0] = sumOfNormal[0] / sumsum;
                sumOfNormal[1] = sumOfNormal[1] / sumsum;
                sumOfNormal[2] = sumOfNormal[2] / sumsum;

                //Make the lump
                points[middlePoint].x += 3 * sumOfNormal[0] / sumsum;
                points[middlePoint].y += 3 * sumOfNormal[1] / sumsum;
                points[middlePoint].z += 3 * sumOfNormal[2] / sumsum;

                var arrayoutsideCirclePoints = Array.from(outsideCirclePoints);

                for (var onePoint in arrayoutsideCirclePoints)
                    //for (let onePoint of outsideCirclePoints)
                {
                    points[arrayoutsideCirclePoints[onePoint]].x += 15 * sumOfNormal[0] / sumsum;
                    points[arrayoutsideCirclePoints[onePoint]].y += 15 * sumOfNormal[1] / sumsum;
                    points[arrayoutsideCirclePoints[onePoint]].z += 15 * sumOfNormal[2] / sumsum;
                }

            }
        }
        //else if ( curTool == "" )
>>>>>>> refs/remotes/Neroldy/master

        editor.selected.geometry.verticesNeedUpdate = true;
        render();

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );

	} );

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		render();

	} );

	var clearColor;

	signals.themeChanged.add( function ( value ) {

		switch ( value ) {

			case 'css/light.css':
				//grid.setColors( 0x444444, 0x888888 );
				clearColor = 0xaaaaaa;
				break;
			case 'css/dark.css':
				grid.setColors( 0xbbbbbb, 0x888888 );
				clearColor = 0x333333;
				break;

		}

		renderer.setClearColor( clearColor );

		render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setClearColor( clearColor );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	var saveTimeout;

	signals.cameraChanged.add( function () {

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null ) {

			if ( object.geometry !== undefined &&
				 object instanceof THREE.Sprite === false ) {

				selectionBox.update( object );
				selectionBox.visible = false;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( geometry ) {

		selectionBox.update( editor.selected );

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.push( child );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.objectChanged.add( function ( object ) {

		selectionBox.update( object );
		transformControls.update();

		if ( object instanceof THREE.PerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.splice( objects.indexOf( child ), 1 );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	signals.fogTypeChanged.add( function ( fogType ) {

		if ( fogType !== oldFogType ) {

			if ( fogType === "None" ) {

				scene.fog = null;

			} else if ( fogType === "Fog" ) {

				scene.fog = new THREE.Fog( oldFogColor, oldFogNear, oldFogFar );

			} else if ( fogType === "FogExp2" ) {

				scene.fog = new THREE.FogExp2( oldFogColor, oldFogDensity );

			}

			updateMaterials();

			oldFogType = fogType;

		}

		render();

	} );

	signals.fogColorChanged.add( function ( fogColor ) {

		oldFogColor = fogColor;

		updateFog( scene );

		render();

	} );

	signals.fogParametersChanged.add( function ( near, far, density ) {

		oldFogNear = near;
		oldFogFar = far;
		oldFogDensity = density;

		updateFog( scene );

		render();

	} );

	signals.windowResize.add( function () {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

    var curTool = "Brush";
    signals.toolChanged.add ( function( newTool ) {

        curTool = newTool;

    } );
	//

	var renderer = null;

	animate();

	//

	function updateMaterials() {

		editor.scene.traverse( function ( node ) {

			if ( node.material ) {

				node.material.needsUpdate = true;

				if ( node.material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < node.material.materials.length; i ++ ) {

						node.material.materials[ i ].needsUpdate = true;

					}

				}

			}

		} );

	}

	function updateFog( root ) {

		if ( root.fog ) {

			root.fog.color.setHex( oldFogColor );

			if ( root.fog.near !== undefined ) root.fog.near = oldFogNear;
			if ( root.fog.far !== undefined ) root.fog.far = oldFogFar;
			if ( root.fog.density !== undefined ) root.fog.density = oldFogDensity;

		}

	}

	function animate() {

		requestAnimationFrame( animate );

		/*

		// animations

		if ( THREE.AnimationHandler.animations.length > 0 ) {

			THREE.AnimationHandler.update( 0.016 );

			for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

				var helper = sceneHelpers.children[ i ];

				if ( helper instanceof THREE.SkeletonHelper ) {

					helper.update();

				}

			}

			render();

		}

		*/

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		//var[] list = scene.getChildByName();
		renderer.render( scene, camera );

		if ( renderer instanceof THREE.RaytracingRenderer === false ) {

			renderer.render( sceneHelpers, camera );

		}

	}
	
	//http://stackoverflow.com/questions/1181575/determine-whether-an-array-contains-a-value
	var indexOf = function(needle) {
		if(typeof Array.prototype.indexOf === 'function') {
			indexOf = Array.prototype.indexOf;
		} else {
			indexOf = function(needle) {
				var i = -1, index = -1;
	
				for(i = 0; i < this.length; i++) {
					if(this[i] === needle) {
						index = i;
						break;
					}
				}
	
				return index;
			};
		}

		return indexOf.call(this, needle);
	};
			

	return container;

}
