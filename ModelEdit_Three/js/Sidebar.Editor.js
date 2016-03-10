/**
 * Created by Nero on 2015/11/12.
 */

Sidebar.Editor = function ( editor ) {

    var config = editor.config;
    var signals = editor.signals;


    // TODO: Add 'Brush' to function
    var toolTypes = {

        'Brush': 'Brush',
        'Twist': 'Twist',

    };

    var container = new UI.CollapsiblePanel();
    container.setCollapsed( editor.config.getKey( 'ui/sidebar/geometry/collapsed' ) );
    container.onCollapsedChange( function ( boolean ) {

        editor.config.setKey( 'ui/sidebar/geometry/collapsed', boolean );

    } );
    //container.setDisplay( 'none' );
    container.addStatic( new UI.Text( 'EDITOR' ) );
    container.add( new UI.Break() );

    // Class

    var options = {};
    for ( var key in toolTypes ) {

        options[ key ] = key;

    }
    // Editor Tools

    var toolTypeRow = new UI.Panel();

    var toolType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

        var value = this.getValue();

        if ( value === 'brush' ) {

            //rendererPropertiesRow.setDisplay( '' );

        } else {

            //rendererPropertiesRow.setDisplay( 'none' );

        }

        config.setKey( 'editor/tool', value );
        updateTool();

    } );

    toolTypeRow.add( new UI.Text( 'Tool' ).setWidth( '90px' ) );
    toolTypeRow.add( toolType );

    container.add( toolTypeRow );

    //var toolActions = new UI.Select().setPosition('absolute').setRight( '8px' ).setFontSize( '11px' );
    //toolActions.setOptions( {
    //
    //    'Brush': 'Brush',
    //    'Reset Position': 'Reset Position',
    //    'Reset Rotation': 'Reset Rotation',
    //    'Reset Scale': 'Reset Scale'
    //
    //} );
    //toolActions.onClick( function ( event ) {
    //
    //    event.stopPropagation(); // Avoid panel collapsing
    //
    //} );
    //toolActions.onChange( function ( event ) {
    //
    //    var object = editor.selected;
    //
    //    switch ( this.getValue() ) {
    //
    //        case 'Reset Position':
    //            object.position.set( 0, 0, 0 );
    //            break;
    //
    //        case 'Reset Rotation':
    //            object.rotation.set( 0, 0, 0 );
    //            break;
    //
    //        case 'Reset Scale':
    //            object.scale.set( 1, 1, 1 );
    //            break;
    //
    //    }
    //
    //    this.setValue( 'Actions' );
    //
    //    signals.objectChanged.dispatch( object );
    //
    //} );
    //container.addStatic( toolActions );


    //

    function updateTool() {

        createTool( toolType.getValue() );

    }

    // TODO: Add more arguments such as radius, strength...
    function createTool( type ) {

        var tool = toolTypes[ type ];

        signals.toolChanged.dispatch( tool );

    }

    createTool( config.getKey( 'editor/tool' ) );


    return container;
}