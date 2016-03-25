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

		'tdcOperationUI'        => '/assets/js/ui/tdcOperationUI.js',
		'tdcRowUI'              => '/assets/js/ui/tdcRowUI.js',
		'tdcColumnUI'           => '/assets/js/ui/tdcColumnUI.js',
		'tdcInnerRowUI'         => '/assets/js/ui/tdcInnerRowUI.js',
		'tdcInnerColumnUI'      => '/assets/js/ui/tdcInnerColumnUI.js',
		'tdcElementsUI'         => '/assets/js/ui/tdcElementsUI.js',
		'tdcElementUI'          => '/assets/js/ui/tdcElementUI.js',

		'tdcAdminIFrameUI'      => '/assets/js/tdcAdminIFrameUI.js',

		'tdcMain'               => '/assets/js/tdcMain.js',
		'tdcSidebar'      => '/assets/js/tdcSidebar.js',


		'tdcColorPicker'      => '/assets/js/tdcColorPicker.js'

	);



	static $js_files_for_iframe = array (
		'td_post_content' => '/assets/js/td_post_content.js',

	);

}