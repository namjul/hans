<?php
/**
 * Blank Framework: Ajax Functions
 * 
 * This file contains functions that can be access by ajax 
 *
 * Ajax request needs a action parameter uppon which the function call is decided
 * Expl.:
 *  {
 *    action : 'myajax-submit',
 *    postID : postID
 *  }
 *
 * WP Action:
 * wp_ajax_nopriv_ + 'action' -> if user is not logged in.
 * wp_ajax_ + 'action' -> if user is logged in.
 * 
 */

/* ------------------------------------------------------------------------------------
 * Returns json object with a success message
 * @returns json object
 * ------------------------------------------------------------------------------------*/
function myajax_submit() {
  // get the submitted parameters
  $postID = $_POST['postID'];
  // generate the response
  $response = json_encode( array( 'success' => true ) );
  // response output
  header( "Content-Type: application/json" );
  echo $response;
  // IMPORTANT: don't forget to "exit"
  exit;
}
add_action( 'wp_ajax_nopriv_myajax-submit', 'myajax_submit' ); // only if user is not logged in.
add_action( 'wp_ajax_myajax-submit', 'myajax_submit' ); // if user in logged in.


?>
 
