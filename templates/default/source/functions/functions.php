<?php

/* ------------------------------------------------------------------------------------
 * {{theme}} Wordpress Theme
 * ------------------------------------------------------------------------------------*/


/* ------------------------------------------------------------------------------------
 * Define PHP file constants.
 * ------------------------------------------------------------------------------------*/
$theme_data = get_theme( get_current_theme() );

define( 'THEME_DIR', TEMPLATEPATH );
define( 'LIB_DIR', THEME_DIR . '/includes' );
define( 'THEME_VERSION', $theme_data['Version'] );


/* ------------------------------------------------------------------------------------
 * Load Theme Translation Domain
 * ------------------------------------------------------------------------------------*/
load_theme_textdomain('{{theme}}', TEMPLATEPATH . '/languages');


/* ------------------------------------------------------------------------------------
 * Cleaning up the Wordpress Head
 * ------------------------------------------------------------------------------------*/
function {{theme}}_theme_head_cleanup() {
  remove_action( 'wp_head', 'feed_links_extra', 3 );                    // Category Feeds
  //remove_action( 'wp_head', 'feed_links', 2 );                        // Post and Comment Feeds
  remove_action( 'wp_head', 'rsd_link' );                               // EditURI link
  remove_action( 'wp_head', 'wlwmanifest_link' );                       // Windows Live Writer
  remove_action( 'wp_head', 'index_rel_link' );                         // index link
  remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );            // previous link
  remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );             // start link
  remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 ); // Links for Adjacent Posts
  remove_action( 'wp_head', 'wp_generator' );                           // WP version
}
add_action('init', '{{theme}}_theme_head_cleanup');


/* ------------------------------------------------------------------------------------
 * Remove Admin Bar
 * ------------------------------------------------------------------------------------*/
add_filter( 'show_admin_bar', '__return_false' );


/* ------------------------------------------------------------------------------------
 * Configure WP Functions & Theme Support
 * ------------------------------------------------------------------------------------*/
function {{theme}}_theme_support() {

  if ( function_exists( 'add_theme_support' ) ) {

    //Adding Post-Thumbnail Support
    add_theme_support('post-thumbnails');                   
    set_post_thumbnail_size(50, 50, true); //Normal post thumbnails
    /* include more thumbnail sizes
    ... */ 

    // Create custom sizes
    if ( function_exists( 'add_image_size' ) ) { 
      //add_image_size('post image', 220, null, false); //narrow column
    }

    //Post Formats supported
    add_theme_support( 'post-formats', // post formats
      array(
        'aside', // title less blurb
        'gallery', // gallery of images
        'link', // quick link to other site
        'image', // an image
        'quote', // a quick quote
        'video', // video
        'audio', // audio
      )
    ); 

    //Custom Menu
    add_theme_support( 'menus' ); // wp menus
    register_nav_menus(
    	array(
	      	'primary' => __( 'Primary Navigation'),
	      	'secondary' => __( 'Secondary Navigation'),
	      	'footer' => __( 'Footer Navigation')
    	));
    
    //Posts & Comments Rss
    add_theme_support( 'automatic-feed-links' ); // rss

  }

  // Max Content Width
  if ( ! isset( $content_width ) )
    $content_width = 640;

}
add_action('after_setup_theme', '{{theme}}_theme_support');


/* ------------------------------------------------------------------------------------
 * Register and load js and css files 
 * ------------------------------------------------------------------------------------*/
function {{theme}}_theme_enqueue_script() {
  if ( !is_admin() ) { 
    $theme  = get_theme( get_current_theme() );

    // Scripts
    wp_register_script( 'theme-script', get_template_directory_uri() . '/javascripts/theme.js', false, THEME_VERSION, TRUE);
    wp_enqueue_script( 'theme-script');

    // Styles
    wp_register_style( 'theme-style', get_bloginfo( 'stylesheet_url' ), false, $theme['Version'] );
    wp_enqueue_style( 'theme-style' );

    //Declare global javascript variables
    wp_localize_script( 'theme-script', '{{theme}}_GLOBALS', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
  }
}    
add_action('wp_enqueue_scripts', '{{theme}}_theme_enqueue_script');

/* ------------------------------------------------------------------------------------
 * Register and load js and css files for admin page
 * ------------------------------------------------------------------------------------*/
function sk_theme_admin_enqueue_script() {
    wp_register_script( 'skin-admin-script', get_template_directory_uri() . '/javascripts/admin.js', false, THEME_VERSION);
    wp_enqueue_script( 'skin-admin-script');
}
add_action('admin_enqueue_scripts', 'sk_theme_admin_enqueue_script');

function sk_adminCSS() {
  	wp_register_script( 'skin-admin-style', get_template_directory_uri() . '/admin.css', false, THEME_VERSION);
    wp_enqueue_script( 'skin-admin-style');
}
add_action('admin_head', 'sk_adminCSS');


/* ------------------------------------------------------------------------------------
 * Register and load scripts for single pages
 * ------------------------------------------------------------------------------------*/
function {{theme}}_theme_single_scripts() {
  if(is_singular()) {
		wp_enqueue_script( 'comment-reply' );
  } 
}
add_action( 'wp_print_styles', '{{theme}}_theme_single_scripts' );
	

/* ------------------------------------------------------------------------------------
 * Register Widgets 
 * ------------------------------------------------------------------------------------*/
function {{theme}}_theme_register_sidebars() {
  if ( function_exists('register_sidebar') ) {

    register_sidebar(array(
      'name' => 'Main Sidebar',
      'before_widget' => '<div id="%1$s" class="widget %2$s">',
      'after_widget' => '</div>',
      'before_title' => '<h3 class="widget-title">',
      'after_title' => '</h3>'
    ));
  
  }
}
add_action( 'widgets_init', '{{theme}}_theme_register_sidebars' );


/*-----------------------------------------------------------------------------------*/
/*	Custom Login Logo 
/*-----------------------------------------------------------------------------------*/
function {{theme}}_login_logo() {
    echo '<style type="text/css">
        h1 a { background-image:url('.get_template_directory_uri().'/images/custom-login-logo.png) !important; }
    </style>';
}
function {{theme}}_login_title() {
echo get_option('blogname');
}
//add_action('login_head', '{{theme}}_login_logo');
add_filter('{{theme}}', '{{theme}}_login_title');


/*-----------------------------------------------------------------------------------*/
/*  Customise the footer in admin area 
/*-----------------------------------------------------------------------------------*/
function {{theme}}_footer_admin () {
  echo 'Theme designed and developed by <a href="gestalted.com" target="_blank">Gestalted</a> and powered by <a href="http://wordpress.org" target="_blank">WordPress</a>.';
}
add_filter('admin_footer_text', '{{theme}}_footer_admin');


/* ------------------------------------------------------------------------------------
 * Load libary files.
 * ------------------------------------------------------------------------------------*/
require_once LIB_DIR . '/ajax.php';
require_once LIB_DIR . '/template.php';

?>
