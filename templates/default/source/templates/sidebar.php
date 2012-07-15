<div id="sidebar">
	<?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('Main Sidebar') ) : ?>
    <!-- This content shows up if there are no widgets defined in the backend. -->
      <div class="help">
        <p>Please activate some Widgets.</p>
						
			</div>
	<?php endif; ?>
</div><!-- #sidebar-->
