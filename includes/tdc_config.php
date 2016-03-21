<?php
/**
 * Created by ra.
 * Date: 3/7/2016
 */


define('TDC_VERSION',   '__td_aurora_deploy_version__');
define('TDC_URL',       plugins_url('td-composer'));




class tdc_config {


	static $js_files_for_wp_admin = array (
		'tdc_init' => '/assets/js/tdcInit.js'
	);



	static $js_files_for_wrapper = array (
		'tdcDebug'              => '/assets/js/tdcDebug.js',

		'tdcShortcodeParser'    => '/assets/js/tdcShortcodeParser.js',
		'tdcJobManager'         => '/assets/js/tdcJobManager.js',

		'tdcAdminWrapperUI'     => '/assets/js/tdcAdminWrapperUI.js',
		'tdcMain'               => '/assets/js/tdcMain.js'
	);



	static $js_files_for_iframe = array (
		'td_post_content' => '/assets/js/td_post_content.js',

	);

}