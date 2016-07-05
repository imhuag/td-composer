# tagDiv Composer v1.0 BETA

License: GPL V3

Author: tagDiv - Themes for smart people


#### What's this?
A GPL pagebuilder plugin for WordPress that uses shortcodes to save and reder the page.

### Download
- [Download the latest release](https://github.com/opradu/td-composer/releases/download/v1.0-beta.0/td-composer.zip) **(recomended)**
- or you can run the plugin from this github repo but please note that the built in LESS compiler runs only on windows for now. You can compile your own less files - modify the TDC_USE_LESS constant in td_deploy_mode.php

#### What's special?
- It's somehow compatible with Visual Composer, meaning that it works with some of the same shortcodes. 
- Much leaner than other composers / pagebuilders
- The plugin works side by side with Visual Composer
- GPL license, open to new contribuitors, maintained and suppoerted by us (tagDiv)
- Fully custom drag and drop code, we don't rely on external libraries like dragable/droable.

We have implemented the following shortcodes: 
```
rev_slider
vc_column
vc_column_inner
vc_column_text
vc_empty_space
vc_raw_html
vc_row
vc_row_inner
vc_widget_sidebar
... + all the shortcodes from Newspaper theme
```

#### Limitations:
-  We generally recomand that you create the pages with tagDiv Composer, we don't have full support for pages generated with Visual Composer but some of them may work
-  Currently the plugin only works with our themes, we did extensive testing and development on Newspaper but it should also work on Newsmag. We plan to support other themes in the future when the pugin si more stable.

#### Contributing to this project:
- We are looking for contributors https://help.github.com/articles/fork-a-repo/
