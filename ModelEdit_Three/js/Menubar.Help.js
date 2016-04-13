/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Help = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Help' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Source code

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Source code' );
	option.onClick( function () {

		window.open( 'https://github.com/Neroldy/3DEditor', '_blank' )

	} );
	options.add( option );

	// three.js

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'three.js' );
	option.onClick( function () {

		window.open( 'http://threejs.org', '_blank' );

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() );

	// About

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'About' );
	option.onClick( function () {

		alert("3DEditor\n一个基于three.js的在线三维模型浏览和编辑的工具。\n\n作者：\n李东阳\n王梓轩\n刘飞");

	} );
	options.add( option );

	return container;

};
