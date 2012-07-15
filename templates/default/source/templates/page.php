<?php get_header(); ?>

<article id="page-<?php the_ID(); ?>" <?php post_class(); ?>>

	<header class="entry-header">
		<h1 class="entry-title"><?php the_title(); ?></h1>
	</header><!-- .entry-header -->

	<div class="entry-content">
		<?php the_content(); ?>
		<?php wp_link_pages(); ?>
	</div><!-- .entry-content-->

	<footer class="entry-meta">
		<?php edit_post_link( __( '[Edit]', '{{theme}}' ), '<span class="edit-link">', '</span>' ); ?>
	</footer><!-- #entry-meta -->

</article><!-- #post-<?php the_ID(); ?> -->

<?php comments_template('', true); ?>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
