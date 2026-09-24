filepath = 'sahajanand-erp.php'
with open(filepath, 'r') as f:
    content = f.read()

import re
replacement = """
		// Enqueue media scripts for wp.media
		wp_enqueue_media();
		
		// Enqueue WP Editor (TinyMCE)
		if ( function_exists( 'wp_enqueue_editor' ) ) {
			wp_enqueue_editor();
		}
"""

content = re.sub(
    r"// Enqueue media scripts for wp\.media\s*wp_enqueue_media\(\);",
    replacement.strip(),
    content
)

with open(filepath, 'w') as f:
    f.write(content)
