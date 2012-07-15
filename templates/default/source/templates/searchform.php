<form method="get" id="searchform" action="<?php echo home_url(); ?>/">
	<fieldset>
		<input type="text" name="s" id="s" value="<?php _e('Type and hit enter', '{{theme}}') ?>" onfocus="if(this.value=='<?php _e('Type and hit enter', '{{theme}}') ?>')this.value='';" onblur="if(this.value=='')this.value='<?php _e('Type and hit enter', '{{theme}}') ?>';" />
	</fieldset>
</form><!-- #searchform -->

