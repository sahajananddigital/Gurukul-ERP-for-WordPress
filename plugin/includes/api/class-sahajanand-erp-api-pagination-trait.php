<?php
/**
 * Pagination Trait for API Controllers
 * 
 * Provides reusable pagination functionality for all API endpoints
 */

trait SAHAJANAND_ERP_API_Pagination_Trait {
    
    /**
     * Get pagination parameters from request
     * 
     * @param WP_REST_Request $request
     * @return array {
     *     @type int $page Current page number
     *     @type int $per_page Items per page
     *     @type int $offset SQL offset
     * }
     */
    protected function get_pagination_params( $request ) {
        $page = max( 1, (int) $request->get_param( 'page' ) );
        $per_page = (int) $request->get_param( 'per_page' );
        
        // Default per_page values
        if ( $per_page <= 0 || $per_page > 100 ) {
            $per_page = 10; // Default to 10 items
        }
        
        $offset = ( $page - 1 ) * $per_page;
        
        return array(
            'page'     => $page,
            'per_page' => $per_page,
            'offset'   => $offset,
        );
    }
    
    /**
     * Build paginated REST response
     * 
     * @param array $items Array of items for current page
     * @param int $total Total number of items
     * @param array $params Pagination params from get_pagination_params()
     * @return WP_REST_Response
     */
    protected function build_paginated_response( $items, $total, $params ) {
        $total_pages = ceil( $total / $params['per_page'] );
        
        $response = rest_ensure_response( array(
            'data' => $items,
            'pagination' => array(
                'total'       => (int) $total,
                'page'        => (int) $params['page'],
                'per_page'    => (int) $params['per_page'],
                'total_pages' => (int) $total_pages,
            ),
        ) );
        
        // Add headers for HTTP clients that prefer headers over body
        $response->header( 'X-WP-Total', (int) $total );
        $response->header( 'X-WP-TotalPages', (int) $total_pages );
        
        return $response;
    }
    
    /**
     * Get SQL LIMIT and OFFSET clause
     * 
     * @param array $params Pagination params from get_pagination_params()
     * @return string SQL LIMIT clause (already escaped)
     */
    protected function get_sql_limit_clause( $params ) {
        global $wpdb;
        return $wpdb->prepare( "LIMIT %d OFFSET %d", $params['per_page'], $params['offset'] );
    }
}
