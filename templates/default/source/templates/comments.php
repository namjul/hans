<?php

// Do not delete these lines
if (!empty($_SERVER['SCRIPT_FILENAME']) && 'comments.php' == basename($_SERVER['SCRIPT_FILENAME']))
  die ('Please do not load this page directly. Thanks!');

if ( post_password_required() ) { ?>
  <p class="nocomments"><?php _e('This post is password protected. Enter the password to view comments.', 'framework') ?></p>
  <?php
  return;
}


// You can start editing here. 

/* ------------------------------------------------------------------------------------
 * Display comments
 * ------------------------------------------------------------------------------------*/
if ( have_comments() ) : ?>

<section id="comments">
  
  <?php if ( ! empty($comments_by_type['comment']) ) : // if there are normal comments ?>
    <h3 id="comments-title"><?php comments_number('No Comments', 'One Comment', '% Comments' );?></h3>

    <ol class="comments-list">
      <?php wp_list_comments('type=comment&avatar_size=60'); ?>
    </ol>

    <?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : // are there comments to navigate through ?>
      <nav id="comments-nav">
        <h1 class="assistive-text"><?php _e( 'Comment navigation', 'framwork' ); ?></h1>
        <div class="nav-previous"><?php previous_comments_link( __( '&larr; Older Comments', 'framwork' ) ); ?></div>
        <div class="nav-next"><?php next_comments_link( __( 'Newer Comments &rarr;', 'framework' ) ); ?></div>
      </nav>
		<?php endif; // check for comment navigation ?>

  <?php endif; ?>

  <?php if ( ! empty($comments_by_type['pings']) ) : // if there are pings ?>
    <h3 id="pings"><?php _e('Trackbacks for this post', 'framework') ?></h3>
    
    <ol class="comments-pinglist">
      <?php wp_list_comments('type=pings'); ?>
    </ol>
  <?php endif; 


/* ------------------------------------------------------------------------------------
 * Display closed comments or no comments
 * ------------------------------------------------------------------------------------*/
  if ( !comments_open() ) : // If comments exits but are closes. ?>
		<p class="nocomments"><?php _e('Comments are now closed for this article.', 'framework') ?></p>
  <?php endif; ?>

<?php else : // this is displayed if there are no comments so far ?>

  <?php if ( comments_open() ) : ?>
    <!-- if comments are open, but there are no comments. -->

  <?php else : // comments are closed ?>
    <!-- If comments are closed. -->
		<p class="nocomments"><?php _e('Comments are closed.', 'framework') ?></p>

  <?php endif; ?>
<?php endif; 


/* ------------------------------------------------------------------------------------
 * Comments form
 * ------------------------------------------------------------------------------------*/

if ( comments_open() ) : ?>

  <?php comment_form(); ?>

</section><!-- #comments-content -->

<?php endif; ?>
