<?php get_header(); ?>

<?php if ( have_posts() ) : ?>

  <?php /* Start the Loop */ ?>
  <?php while ( have_posts() ) : the_post(); ?>

    <?php get_template_part( 'post', get_post_format() ); ?>
  
    <?php comments_template('', true); ?>

  <?php endwhile; ?>

<?php else : ?>

  <article id="post-0" class="post no-results not-found">
    <header class="entry-header">
      <h1 class="entry-title"><?php _e( 'Nothing Found', '{{theme}}' ); ?></h1>
    </header><!-- .entry-header -->
  </article><!-- #post-0 -->

<?php endif; ?>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
