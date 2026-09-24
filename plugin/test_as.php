<?php
require_once dirname(__DIR__) . '/wp-load.php';

if (function_exists('as_next_scheduled_action')) {
    echo "Action Scheduler is loaded.\n";
    $next = as_next_scheduled_action('erp_helpdesk_fetch_emails');
    if ($next !== false) {
        echo "Next scheduled for: " . $next . "\n";
    } else {
        echo "Not scheduled yet.\n";
        // Force the init hook to run? Or just wait for WP to run it naturally.
        do_action('init');
        $next = as_next_scheduled_action('erp_helpdesk_fetch_emails');
        if ($next !== false) {
            echo "Successfully scheduled after init: " . $next . "\n";
        }
    }
} else {
    echo "Action Scheduler is NOT loaded.\n";
}
