/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Edit = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Edit' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

    var scene = editor.scene;

	// Clear

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Clear' );
	option.onClick( function () {

		editor.clear();

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

		var loader = new THREE.JSONLoader();
		loader.load( "js/lightmap/lightmap.json", function ( geometry, materials ) {

			for ( var i = 0; i < materials.length; i ++ ) {

				materials[ i ].lightMapIntensity = 0.75;

			}

			var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

			mesh.scale.multiplyScalar( 100 );
            scene.add( mesh );

		} );

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() );

	// Undo

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Undo' );
	option.onClick( function () {

		editor.history.undo();

	} );
	options.add( option );

	// Redo

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Redo' );
	option.onClick( function () {

		editor.history.redo();

	} );
	options.add( option );

	// ---

	options.add( new UI.HorizontalRule() );

	// Copy

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Copy' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === null ) return; // avoid copying the camera or scene

		object = object.clone();

		editor.addObject( object );
		editor.select( object );

	} );
	options.add( option );

	// Delete

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Delete' );
	option.onClick( function () {

		var object = editor.selected;

		var parent = object.parent;
		editor.removeObject( object );
		editor.select( parent );

	} );
	options.add( option );

	//// My own function
    //
	//var option = new UI.Panel();
	//option.setClass( 'option' );
	//option.setTextContent( 'hello' );
	//option.onClick(function () {
	//	signals.showHello.dispatch();
	//} );
	//options.add ( option );

	return container;

};
