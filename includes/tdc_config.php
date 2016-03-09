<?php
/**
 * Created by ra.
 * Date: 3/7/2016
 */


define('TDC_VERSION',   '__td_aurora_deploy_version__');
define('TDC_URL',       plugins_url('td-composer'));




class tdc_config {


	static $js_files_for_wp_admin = array (
		'tdc_init' => '/assets/js/tdcInit.js',
		'tdc_job_manager' => '/assets/js/tdcJobManager.js'
	);



	static $js_files_for_wrapper = array (
		'tdcShortcodeParser' => '/assets/js/tdcShortcodeParser.js',
		'tdcDebug' => '/assets/js/tdcDebug.js',
		'tdcMain' => '/assets/js/tdcMain.js'
	);



	static $js_files_for_iframe = array (
		'td_post_content' => '/assets/js/td_post_content.js',
		'td_bind_events' => '/assets/js/td_bind_events.js'
	);

}