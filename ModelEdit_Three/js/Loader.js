/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function ( editor ) {

	var scope = this;
	var signals = editor.signals;

	this.texturePath = '';

	this.loadFile = function ( file ) {

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		switch ( extension ) {

			case 'obj':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					editor.addObject( object );
					editor.select( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			default:

				alert( '不支持的文件格式 (' + extension +  ')！\n暂时只支持.obj和.ply文件。' );

				break;

		}

	}

	var handleJSON = function ( data, file, filename ) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.version === undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		if ( data.metadata.type === 'BufferGeometry' ) {

			var loader = new THREE.BufferGeometryLoader();
			var result = loader.parse( data );

			var mesh = new THREE.Mesh( result );

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'geometry' ) {

			var loader = new THREE.JSONLoader();
			loader.setTexturePath( scope.texturePath );

			var result = loader.parse( data );

			var geometry = result.geometry;
			var material;

			if ( result.materials !== undefined ) {

				if ( result.materials.length > 1 ) {

					material = new THREE.MeshFaceMaterial( result.materials );

				} else {

					material = result.materials[ 0 ];

				}

			} else {

				material = new THREE.MeshPhongMaterial();

			}

			geometry.sourceType = "ascii";
			geometry.sourceFile = file.name;

			var mesh;

			if ( geometry.animation && geometry.animation.hierarchy ) {

				mesh = new THREE.SkinnedMesh( geometry, material );

			} else {

				mesh = new THREE.Mesh( geometry, material );

			}

			mesh.name = filename;

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'object' ) {

			var loader = new THREE.ObjectLoader();
			loader.setTexturePath( scope.texturePath );

			var result = loader.parse( data );

			if ( result instanceof THREE.Scene ) {

				editor.setScene( result );

			} else {

				editor.addObject( result );
				editor.select( result );

			}

		} else if ( data.metadata.type.toLowerCase() === 'scene' ) {

			// DEPRECATED

			var loader = new THREE.SceneLoader();
			loader.parse( data, function ( result ) {

				editor.setScene( result.scene );

			}, '' );

		}

	};

}
