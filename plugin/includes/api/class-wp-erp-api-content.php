<?php
/**
 * Content API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-wp-erp-api-controller.php';

class WP_ERP_API_Content extends WP_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		// Dashboard Grid
		register_rest_route( $this->namespace, '/content/dashboard', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_dashboard_grid' ),
				'permission_callback' => '__return_true',
			),
		) );
        
        // Daily Darshan (Public Read)
        register_rest_route( $this->namespace, '/content/daily-darshan', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_daily_darshan' ),
				'permission_callback' => '__return_true',
			),
            array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_daily_darshan' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
        
        // Single Daily Darshan (Update/Delete)
        register_rest_route( $this->namespace, '/content/daily-darshan/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array( $this, 'update_daily_darshan' ),
                'permission_callback' => array( $this, 'check_permission' ),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array( $this, 'delete_daily_darshan' ),
                'permission_callback' => array( $this, 'check_permission' ),
            ),
        ) );
	}

	/**
	 * Get Dashboard Grid Structure
	 */
    public function get_dashboard_grid( $request ) {
		$grid = array(
            array(
                'id' => 'daily_darshan',
                'title' => __( 'Daily Darshan', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/daily_darshan.png',
                'route' => '/dashboard/daily-darshan',
                'order' => 1
            ),
            array(
                'id' => 'daily_quotes',
                'title' => __( 'Daily Quotes', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/daily_quotes.png',
                'route' => '/dashboard/daily-quotes',
                'order' => 2
            ),
            array(
                'id' => 'daily_update',
                'title' => __( 'Daily Update', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/daily_updates.png',
                'route' => '/dashboard/daily-updates',
                'order' => 3
            ),
            array(
                'id' => 'daily_satsang',
                'title' => __( 'Daily Satsang', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/daily_satsang.png',
                'route' => '/dashboard/daily-satsang',
                'order' => 4
            ),
            array(
                'id' => 'daily_program',
                'title' => __( 'Daily Program', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/daily_program.png',
                'route' => '/dashboard/daily-program',
                'order' => 5
            ),
            array(
                'id' => 'calendar',
                'title' => __( 'Calendar', 'wp-erp' ),
                'icon_type' => 'image',
                'bg_image' => WP_ERP_PLUGIN_URL . 'assets/images/calendar.png',
                'route' => '/dashboard/calendar',
                'order' => 6
            ),
        );
        
        // $this->set_cache_headers( date('Y-m-d H:00:00') );
        nocache_headers();
		return rest_ensure_response( $grid );
	}

	/**
	 * Get Daily Darshan
     * (Reverted to Meta-based logic for custom React UI)
	 */
	public function get_daily_darshan( $request ) {
        $args = array(
            'post_type'      => 'daily_darshan',
            'posts_per_page' => 10, // Get recent ones
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        $query = new WP_Query( $args );
        $darshans = array();

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $post_id = get_the_ID();
                $time = get_post_meta( $post_id, '_darshan_time', true );
                $gallery_ids = get_post_meta( $post_id, '_darshan_gallery_ids', true );
                
                $images = array();
                if ( ! empty( $gallery_ids ) ) {
                    $ids_array = explode( ',', $gallery_ids );
                    foreach ( $ids_array as $img_id ) {
                        $url = wp_get_attachment_image_url( $img_id, 'large' ); // Use large instead of full for mobile performance
                        if ( ! $url ) {
                             // Fallback to full if large doesn't exist (e.g. small image)
                             $url = wp_get_attachment_image_url( $img_id, 'full' );
                        }
                        
                        if ( $url ) {
                            // Fix for mobile: Replace localhost/127.0.0.1 with LAN IP
                            $images[] = array(
                                'id' => (int) $img_id,
                                'url' => $url,
                            );
                        }
                    }
                }
                
                $darshans[] = array(
                    'id'    => $post_id,
                    'date'  => get_the_title(), // Title is used as Date
                    'time'  => $time,
                    'images'=> $images
                );
            }
            wp_reset_postdata();
        }
        
        // If app requests single latest for dashboard
        if ( isset( $request['latest'] ) ) {
             return rest_ensure_response( !empty($darshans) ? $darshans[0]['images'] : [] );
        }
        
		return rest_ensure_response( $darshans );
	}

    /**
     * Create Daily Darshan (POST)
     */
    public function create_daily_darshan( $request ) {
        $params = $request->get_json_params();
        
        if ( empty( $params['date'] ) || empty( $params['image_ids'] ) ) {
            return new WP_Error( 'missing_params', 'Date and Images are required', array( 'status' => 400 ) );
        }
        
        $post_data = array(
            'post_title'   => sanitize_text_field( $params['date'] ),
            'post_status'  => 'publish',
            'post_type'    => 'daily_darshan',
        );
        
        $post_id = wp_insert_post( $post_data );
        
        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }
        
        update_post_meta( $post_id, '_darshan_time', sanitize_text_field( $params['time'] ) );
        
        // image_ids should be array or comma string
        $image_ids = is_array( $params['image_ids'] ) ? implode( ',', $params['image_ids'] ) : $params['image_ids'];
        update_post_meta( $post_id, '_darshan_gallery_ids', sanitize_text_field( $image_ids ) );
        
        return rest_ensure_response( array( 'id' => $post_id, 'message' => 'Created successfully' ) );
    }

    /**
     * Update Daily Darshan (POST /ID)
     */
    public function update_daily_darshan( $request ) {
        $id = (int) $request['id'];
        $params = $request->get_json_params();

        if ( ! $id ) {
            return new WP_Error( 'no_id', 'ID is required', array( 'status' => 400 ) );
        }

        $post_data = array(
            'ID'           => $id,
            'post_title'   => sanitize_text_field( $params['date'] ),
        );

        $updated_id = wp_update_post( $post_data );

        if ( is_wp_error( $updated_id ) ) {
            return $updated_id;
        }

        if ( isset( $params['time'] ) ) {
            update_post_meta( $id, '_darshan_time', sanitize_text_field( $params['time'] ) );
        }

        if ( isset( $params['image_ids'] ) ) {
            $image_ids = is_array( $params['image_ids'] ) ? implode( ',', $params['image_ids'] ) : $params['image_ids'];
            update_post_meta( $id, '_darshan_gallery_ids', sanitize_text_field( $image_ids ) );
        }

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Updated successfully' ) );
    }

    /**
     * Delete Daily Darshan (DELETE /ID)
     */
    public function delete_daily_darshan( $request ) {
        $id = (int) $request['id'];
        
        if ( ! $id ) {
            return new WP_Error( 'no_id', 'ID is required', array( 'status' => 400 ) );
        }

        $deleted = wp_delete_post( $id, true ); // Force delete

        if ( ! $deleted ) {
            return new WP_Error( 'delete_failed', 'Could not delete post', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Deleted successfully' ) );
    }
}
