<?php
/**
 * Plugin Name: Kannada Vedike — Headless CMS
 * Description: Registers the content types (Programs, Movements, Leaders, Media Reports) and REST fields used by the headless Kannada Vedike front-end. Blog uses standard WordPress Posts.
 * Version:     1.0.0
 * Author:      Kannada Vedike
 *
 * INSTALL: copy this file to wp-content/plugins/kannada-vedike-cms/kannada-vedike-cms.php
 * and activate it. Then go to Settings > Permalinks and click Save (to flush routes).
 */

if (!defined('ABSPATH')) { exit; }

/* ---------------------------------------------------------------------------
 * 1) Custom post types (all REST-enabled; rest_base matches the front-end)
 * ------------------------------------------------------------------------- */
add_action('init', function () {

    $types = array(
        'program' => array(
            'labels'   => kv_labels('Program', 'Programs'),
            'menu_icon'=> 'dashicons-calendar-alt',
        ),
        'movement' => array(
            'labels'   => kv_labels('Movement', 'Movements'),
            'menu_icon'=> 'dashicons-megaphone',
        ),
        'leader' => array(
            'labels'   => kv_labels('Leader', 'Leaders'),
            'menu_icon'=> 'dashicons-groups',
        ),
        'media_report' => array(
            'labels'   => kv_labels('Media Report', 'Media Reports'),
            'menu_icon'=> 'dashicons-media-document',
        ),
    );

    foreach ($types as $slug => $cfg) {
        register_post_type($slug, array(
            'labels'       => $cfg['labels'],
            'public'       => true,
            'show_in_rest' => true,      // exposes /wp-json/wp/v2/<slug>
            'rest_base'    => $slug,
            'menu_icon'    => $cfg['menu_icon'],
            'supports'     => array('title', 'editor'),
            'has_archive'  => false,
        ));
    }

    /* ------ REST-exposed meta fields per type (appear under `meta`) ------ */
    $meta = array(
        'program'      => array('day', 'month', 'tag', 'place', 'desc'),
        'movement'     => array('year', 'desc'),
        'leader'       => array('role', 'name'),
        'media_report' => array('outlet', 'date'),
        // 'post' (blog) uses core fields: title, excerpt, date, category.
        'post'         => array('readtime'),
    );

    foreach ($meta as $ptype => $keys) {
        foreach ($keys as $key) {
            register_post_meta($ptype, $key, array(
                'type'          => 'string',
                'single'        => true,
                'show_in_rest'  => true,
                'auth_callback' => function () { return current_user_can('edit_posts'); },
            ));
        }
    }
});

function kv_labels($singular, $plural) {
    return array(
        'name'          => $plural,
        'singular_name' => $singular,
        'add_new_item'  => 'Add New ' . $singular,
        'edit_item'     => 'Edit ' . $singular,
        'menu_name'     => $plural,
    );
}

/* ---------------------------------------------------------------------------
 * 2) Simple meta boxes so editors can fill the fields (no ACF required).
 *    If you prefer ACF, create fields with the SAME keys and enable
 *    "Show in REST" — you can then delete this section.
 * ------------------------------------------------------------------------- */
$kv_fields = array(
    'program'      => array('day' => 'Day (e.g. 01)', 'month' => 'Month (e.g. ನವೆಂ)', 'tag' => 'Tag/Category', 'place' => 'Place', 'desc' => 'Description'),
    'movement'     => array('year' => 'Year', 'desc' => 'Description'),
    'leader'       => array('role' => 'Role/Designation', 'name' => 'Name (optional)'),
    'media_report' => array('outlet' => 'Outlet', 'date' => 'Date'),
    'post'         => array('readtime' => 'Read time (e.g. 5 ನಿಮಿಷ)'),
);

add_action('add_meta_boxes', function () use ($kv_fields) {
    foreach ($kv_fields as $ptype => $fields) {
        add_meta_box('kv_meta_' . $ptype, 'Details', function ($post) use ($fields) {
            wp_nonce_field('kv_meta_save', 'kv_meta_nonce');
            echo '<style>.kv-row{margin:10px 0}.kv-row label{display:block;font-weight:600;margin-bottom:3px}.kv-row input{width:100%}</style>';
            foreach ($fields as $key => $label) {
                $val = esc_attr(get_post_meta($post->ID, $key, true));
                echo '<div class="kv-row"><label for="kv_' . esc_attr($key) . '">' . esc_html($label) . '</label>';
                echo '<input type="text" id="kv_' . esc_attr($key) . '" name="kv_' . esc_attr($key) . '" value="' . $val . '" /></div>';
            }
        }, $ptype, 'normal', 'high');
    }
});

add_action('save_post', function ($post_id) use ($kv_fields) {
    if (!isset($_POST['kv_meta_nonce']) || !wp_verify_nonce($_POST['kv_meta_nonce'], 'kv_meta_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    $ptype = get_post_type($post_id);
    if (!isset($kv_fields[$ptype])) return;
    foreach ($kv_fields[$ptype] as $key => $label) {
        if (isset($_POST['kv_' . $key])) {
            update_post_meta($post_id, $key, sanitize_text_field(wp_unslash($_POST['kv_' . $key])));
        }
    }
});

/* ---------------------------------------------------------------------------
 * 3) CORS — allow the headless front-end (on a different domain) to read the
 *    REST API. Restrict the origin in production if you can.
 * ------------------------------------------------------------------------- */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($served) {
        header('Access-Control-Allow-Origin: *');           // <- set to your site's origin in production
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $served;
    });
}, 15);
