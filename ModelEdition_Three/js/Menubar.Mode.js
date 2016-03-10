/**
 * Created by Nero on 2015/11/12.
 */

Menubar.Mode = function ( editor ) {

    var container = new UI.Panel();
    container.setClass( 'menu' );

    var title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent( 'Mode' );
    container.add( title );

    var options = new UI.Panel();
    options.setClass( 'options' );
    container.add( options );

    // Sculpture

    var option = new UI.Panel();
    option.setClass( 'option' );
    option.setTextContent( 'Sculpture' );
    option.onClick( function () {

        // TODO: Add Sculpture Event function

    } );
    options.add( option );

    // VoxelPainter

    var option = new UI.Panel();
    option.setClass( 'option' );
    option.setTextContent( 'Voxel Painter' );
    option.onClick( function() {

        // TODO: Add VoxelPainter Event function

    } );
    options.add( option );

    options.add( new UI.HorizontalRule() );

    // Play

    var option = new UI.Panel();
    option.setClass( 'option' );
    option.setTextContent( 'Play' );
    option.onClick( function() {

        // TODO: Add Play Event function

    } );
    options.add( option );

    return container;

};