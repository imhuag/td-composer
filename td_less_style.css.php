<?php
/**
 * Used only on dev! - it is removed from the package by our deploy ;)
 * V2.0
 */
require_once 'includes/external/td_node_less/td_less_compiler.php';


// this array is used by td_deploy to compile all the files
// it is also used by the live compiler
$td_less_files = array (
	'iframe_main' => array (
		'source' => 'assets/less_iframe/iframe_main.less',
		'destination' => 'assets/css/iframe_main.css'
	),
	'wrap_main' => array (
		'source' => 'assets/less_wrap/wrap_main.less',
		'destination' => 'assets/css/wrap_main.css'
	),
	'tdc-wp-admin.css' => array (
		'source' => 'assets/less_wp_admin/wp_admin_main.less',
		'destination' => 'assets/css/tdc_wp_admin_main.css'
	)
);




// from td_less_style.css.php
if (isset($_GET['part'])) {
	if (!empty($td_less_files[$_GET['part']])) {
		td_less_compiler::compile_and_import(
			$td_less_files[$_GET['part']]['source'],
			$td_less_files[$_GET['part']]['destination']
		);
	} else {
		echo "ERROR!!!!! NO ?=part registered in td_less_style.css.php with name: " . $_GET['part'];
	}
}



