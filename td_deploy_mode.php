<?php


// @todo not used yet
if (!defined('TD_DEPLOY_MODE')) {
    define("TD_DEPLOY_MODE", 'dev');
}


/**
 * @see td_less_style.css.php for the full list of files that are compiled. set this to false and you can use your own
 * compiler for the less files
 */
if (!defined('TDC_USE_LESS')) {
	define("TDC_USE_LESS", true);
}