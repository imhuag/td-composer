<?php
/**
 * Created by ra.
 * Date: 3/7/2016
 */


define('TDC_VERSION',   '__td_aurora_deploy_version__'); // this is used in the theme to determine if the plugin is installed
define('TDC_URL',       plugins_url('td-composer'));




class tdc_config {


	static $js_files_for_wp_admin = array (
		//'tdcDebug'              => '/assets/js/tdcDebug.js',
		'tdcNotice'             => '/assets/js/tdcNotice.js',
		'tdcShortcodeParser'    => '/assets/js/tdcShortcodeParser.js',
		'tdcInit'               => '/assets/js/wp-admin/tdcInit.js',  //@todo this should load only on edit post in wp-admin
	);



	static $js_files_for_wrapper = array (
		'tdcNotice'             => '/assets/js/tdcNotice.js',
		'tdcDebug'              => '/assets/js/tdcDebug.js',
		'tdcUtil'               => '/assets/js/tdcUtil.js',
		'tdcRecycle'            => '/assets/js/tdcRecycle.js',


		'tdcSavePost'           => '/assets/js/tdcSavePost.js',
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

		'tdcRecycleUI'          => '/assets/js/ui/tdcRecycleUI.js',

		'tdcMaskUI'                 => '/assets/js/ui/mask/tdcMaskUI.js',
		'tdcRowHandlerUI'           => '/assets/js/ui/mask/tdcRowHandlerUI.js',
		'tdcColumnHandlerUI'        => '/assets/js/ui/mask/tdcColumnHandlerUI.js',
		'tdcInnerRowHandlerUI'      => '/assets/js/ui/mask/tdcInnerRowHandlerUI.js',
		'tdcInnerColumnHandlerUI'   => '/assets/js/ui/mask/tdcInnerColumnHandlerUI.js',
		'tdcElementHandlerUI'       => '/assets/js/ui/mask/tdcElementHandlerUI.js',



		'tdcIFrameData'         => '/assets/js/data/tdcIFrameData.js',
		'tdcAdminIFrameUI'      => '/assets/js/tdcAdminIFrameUI.js',

		'tdcMain'               => '/assets/js/tdcMain.js',
		'tdcSidebar'            => '/assets/js/tdcSidebar.js',
		'tdcSidebarPanel'       => '/assets/js/tdcSidebarPanel.js',
		'tdcSidebarController'  => '/assets/js/tdcSidebarController.js',
		'tdcCssParser'          => '/assets/js/cssOps/tdcCssParser.js',
		'TdcCssGenerator'       => '/assets/js/cssOps/TdcCssGenerator.js',
		'tdcCssState'           => '/assets/js/cssOps/tdcCssEditorTab.js',

		'tdcColorPicker'        => '/assets/js/tdcColorPicker.js',
		'cssJs'                 => '/assets/js/external/css.js',


		'tdcLoader'             => '/assets/js/tdcLoader.js',
		'tdcThemePanel'         => '/assets/js/tdcLivePanel.js',
	);



	static $js_files_for_iframe = array (
		'tdcComposerBlocksApi'  => '/assets/js/iframe/tdcComposerBlocksApi.js',
		'tdcDebug'              => '/assets/js/tdcDebug.js',  //inject tdcDebug in the iframe also
	);

}