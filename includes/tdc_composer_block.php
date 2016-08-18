<?php


class tdc_composer_block {

	private $block_uid; // the block's unique ID. It is generated on each render
	private $atts;      // the block's atts

	function render ($atts, $content = null) {

		$this->block_uid = tdc_util::generate_unique_id();

		$this->atts = shortcode_atts ( // add defaults (if an att is not in this list, it will be removed!)
			array(
				'el_class' => '',
				'el_id' => '',
				'class' => '', // internal usage, from here we add the classes to the block, el_class is used for vc compatibility and it's content will be added to this att
				'css' => ''
			),
			$atts
		);
	}


	// used on row and inner row for now...
	protected function get_block_dom_id() {
		$el_id = $this->get_att('el_id');
		if (!empty($el_id)) {
			$el_id = 'id="' . $el_id . '" ';
		}
		return $el_id;
	}



	protected function get_block_classes($additional_classes_array = array()) {
		$class = $this->get_att('class');



		$el_class = $this->get_att('el_class');

		// on live editor we replace the smart sidebar class for now, due to js issues
		if (tdc_state::is_live_editor_ajax() || tdc_state::is_live_editor_iframe()) {
			$el_class = str_replace('td-ss-row', 'td-ss-row-tdc-placeholder', $el_class);
		}




		// add the vc el_class classes
		$class .= ' ' . $el_class;



		$block_classes = array(
			get_class($this)
		);


		// get the design tab css classes
		$css = $this->get_att('css');
		$css_classes_array = $this->parse_css_att($css);
		if ( $css_classes_array !== false ) {
			$block_classes = array_merge(
				$block_classes,
				$css_classes_array
			);
		}


		//add the classes that we receive via shortcode
		if (!empty($class)) {
			$class_array = explode(' ', $class);
			$block_classes = array_merge(
				$block_classes,
				$class_array
			);
		}


		//marge the additional classes received from blocks code
		if (!empty($additional_classes_array)) {
			$block_classes = array_merge(
				$block_classes,
				$additional_classes_array
			);
		}


		//remove duplicates
		$block_classes = array_unique($block_classes);

		return implode(' ', $block_classes);
	}


	protected function get_block_html_atts() {
		return ' data-td-block-uid="' . $this->block_uid . '" ';
	}


	/**
	 * the css from the 'css' ATT of the blocks
	 */
	protected function get_block_css() {
		$buffy = '';

		$css = $this->get_att('css');

		// VC adds the CSS att automatically so we don't have to do it
		if (!empty($css)) {
			$buffy .= PHP_EOL . '/* tdc_composer_block - inline css att */' . PHP_EOL . $css;

			/** scoped - @link http://www.w3schools.com/tags/att_style_scoped.asp */
			$buffy = PHP_EOL . '<style scoped>' . PHP_EOL . $buffy . PHP_EOL . '</style>';
			return $buffy;
		}


		return '';
	}


	/**
	 * @param $content
	 *
	 * @return string
	 */
	protected function do_shortcode($content) {
		return do_shortcode( shortcode_unautop( $content ) );
	}


	/**
	 * Safe way to read $this->atts. It makes sure that you read them when they are ready and set!
	 * @param $att_name
	 * @return mixed
	 */
	private function get_att($att_name) {
		if ( !isset( $this->atts ) ) {
			tdc_util::error(__FILE__, __FUNCTION__, get_class($this) . '->get_att(' . $att_name . ') TD Composer Internal error: The atts are not set yet(AKA: the render method was not called yet and the system tried to read an att)');
			die;
		}

		if ( !isset( $this->atts[$att_name] ) ) {
			var_dump($this->atts);
			tdc_util::error(__FILE__, __FUNCTION__, 'TD Composer Internal error: The system tried to use an att that does not exists! class_name: ' . get_class($this) . '  Att name: "' . $att_name . '" The list with available atts is in tdc_composer_block::render');
			die;
		}

		return $this->atts[$att_name];
	}



	private function add_class($raw_class_name) {
		if (!empty($this->atts['class'])) {
			$this->atts['class'] = $this->atts['class'] . ' ' . $raw_class_name;
		} else {
			$this->atts['class'] = $raw_class_name;
		}
	}




	/**
	 * parses a design panel generated css string and get's the classes and the
	 * this should be the same with @see td_block::parse_css_att from the main theme
	 * @param $user_css_att
	 *
	 * @return array|bool - array of results or false if no classes are available
	 */
	private function parse_css_att($user_css_att) {
		if (empty($user_css_att)) {
			return false;
		}

		$matches = array();
		$preg_match_ret = preg_match_all ( '/\s*\.\s*([^\{]+)\s*\{\s*([^\}]+)\s*\}\s*/', $user_css_att, $matches);


		if ( $preg_match_ret === 0 || $preg_match_ret === false || empty($matches[1]) || empty($matches[2]) ) {
			return false;
		}

		// get only the selectors
		return $matches[1];
	}

}