<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" <?php language_attributes(); ?>> <!--<![endif]-->

<head>
  <!-- Meta Tags -->
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <!-- Title -->
  <title><?php	wp_title( '|', true, 'right' ); ?><?php bloginfo('name'); ?></title>

  <!-- Pingbacks -->
  <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

  <!-- Load Modernizer from CDN -->
  <script src="http://www.modernizr.com/downloads/modernizr-latest.js"></script> 

  <!-- Theme Hook -->
  <?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>

