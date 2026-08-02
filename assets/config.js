/* Headless CMS configuration.
 *
 * To use WordPress as the content backend (headless), set your WordPress
 * site URL below, with NO trailing slash, e.g.:
 *     window.KV_WP_BASE = "https://cms.kannada-vedike.org";
 *
 * WordPress.com sites work too (the Blog uses the public REST API):
 *     window.KV_WP_BASE = "https://YOURSITE.wordpress.com";
 * Note: free/personal WordPress.com plans support only standard Posts (Blog).
 * Programs / Leaders / Media / Movements need custom post types, which require
 * a self-hosted WordPress or the WordPress.com Business plan (to install the
 * bundled plugin). Until then those sections use the built-in editor/static.
 *
 * The site will then fetch content from the WordPress REST API
 * (/wp-json/wp/v2/...). If WordPress is unreachable or a section has no
 * posts, the page falls back to the built-in editor (admin.html) content,
 * and finally to the static markup already in the page.
 *
 * Leave it as "" to use the built-in editor / static content only.
 */
window.KV_WP_BASE = "";
