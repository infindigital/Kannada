/* Headless CMS configuration.
 *
 * To use WordPress as the content backend (headless), set your WordPress
 * site URL below, with NO trailing slash, e.g.:
 *     window.KV_WP_BASE = "https://cms.kannada-vedike.org";
 *
 * The site will then fetch content from the WordPress REST API
 * (/wp-json/wp/v2/...). If WordPress is unreachable or a section has no
 * posts, the page falls back to the built-in editor (admin.html) content,
 * and finally to the static markup already in the page.
 *
 * Leave it as "" to use the built-in editor / static content only.
 */
window.KV_WP_BASE = "";
