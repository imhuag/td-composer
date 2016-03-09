<?php
/**
 * Created by ra.
 * Date: 3/7/2016
 */




class tdc_util {
	static function enqueue_js_files_array($js_files_array, $dependency_array) {
		$last_js_file_id = '';
		foreach ($js_files_array as $js_file_id => $js_file) {
			if ($last_js_file_id == '') {
				wp_enqueue_script($js_file_id, TDC_URL . $js_file, $dependency_array, TDC_VERSION, true); //first, load it with jQuery dependency
			} else {
				wp_enqueue_script($js_file_id, TDC_URL . $js_file, array($last_js_file_id), TDC_VERSION, true);  //not first - load with the last file dependency
			}
			$last_js_file_id = $js_file_id;
		}
	}
}