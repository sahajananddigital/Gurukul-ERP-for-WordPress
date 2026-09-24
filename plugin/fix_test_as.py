filepath = 'includes/api/class-sahajanand-erp-api-general.php'
with open(filepath, 'r') as f:
    content = f.read()

import re
replacement = """		register_rest_route( $this->namespace, '/test-as', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => function() {
					$loaded = function_exists('as_next_scheduled_action');
					$next = $loaded ? as_next_scheduled_action('erp_helpdesk_fetch_emails') : false;
					$scheduled_id = null;
					$error = null;
					if ($loaded && !$next) {
						try {
							$scheduled_id = as_schedule_recurring_action( time(), HOUR_IN_SECONDS, 'erp_helpdesk_fetch_emails' );
						} catch (Throwable $e) {
							$error = $e->getMessage();
						}
					}
					return array('loaded' => $loaded, 'next' => $next, 'scheduled_id' => $scheduled_id, 'error' => $error);
				},
				'permission_callback' => '__return_true',
			),
		) );"""

content = re.sub(
    r"register_rest_route\( \$this->namespace, '/test-as', array\([\s\S]*?\)\s*\);\s*\)\s*\);",
    replacement,
    content
)

with open(filepath, 'w') as f:
    f.write(content)
