# Headless WordPress backend for Kannada Vedike

This site is a **headless-WordPress front-end**: the design here stays exactly the
same, and content is pulled from a WordPress site via its REST API. If no
WordPress is configured, the site falls back to the built-in editor
(`admin.html`, browser storage) and then to the static content already in the
pages — so it always works.

## How the front-end chooses its content

For every section marked `data-cms="…"`, the page loads content in this order:

1. **WordPress REST API** — if `window.KV_WP_BASE` is set (see `assets/config.js`).
2. **Built-in editor** — content saved from `admin.html` into the browser (`localStorage`).
3. **Static markup** — whatever is already written in the page.

## 1. Install the WordPress side

1. Copy `kannada-vedike-cms.php` to
   `wp-content/plugins/kannada-vedike-cms/kannada-vedike-cms.php` on your
   WordPress site and **activate** the plugin (Plugins screen).
2. Go to **Settings → Permalinks** and click **Save Changes** (flushes the REST routes).
3. You'll now have new admin menus: **Programs, Movements, Leaders, Media Reports**
   (each with the extra fields), plus the usual **Posts** for the Blog.

The plugin creates these REST endpoints:

| Front-end section | WordPress type | REST endpoint |
|---|---|---|
| Programs (`data-cms="programs"`) | Program CPT | `/wp-json/wp/v2/program` |
| Movements (`data-cms="movements"`) | Movement CPT | `/wp-json/wp/v2/movement` |
| Leaders (`data-cms="leaders"`) | Leader CPT | `/wp-json/wp/v2/leader` |
| Media (`data-cms="media"`) | Media Report CPT | `/wp-json/wp/v2/media_report` |
| Blog (`data-cms="blog"`) | Post | `/wp-json/wp/v2/posts?_embed` |

### Field mapping

| Section | WordPress fields |
|---|---|
| Program | title → **title**; `day`, `month`, `tag`, `place`, `desc` (custom fields) |
| Movement | title → **title**; `year`, `desc` |
| Leader | `role` (or title), `name` |
| Media Report | title → **headline**; `outlet`, `date` |
| Blog | **title**, **excerpt**, **date**, first **category**; `readtime` (custom field) |

### Using ACF (Advanced Custom Fields) — recommended

The front-end reads each field from **either `acf` or `meta`** in the REST
response, so ACF works out of the box. Steps:

1. Install & activate **ACF** (free) and this plugin. (When ACF is active, this
   plugin automatically hides its own built-in field boxes to avoid duplicates.)
2. For each type, create an **ACF Field Group** with fields whose **Field Name**
   matches the keys below, set the group's **Location** to that post type, and in
   the group settings turn **Show in REST API = Yes**:
   - **Program** → `day`, `month`, `tag`, `place`, `desc`
   - **Movement** → `year`, `desc`
   - **Leader** → `role`, `name`
   - **Media Report** → `outlet`, `date`
   - **Post (Blog)** → `readtime` (optional)
3. ACF then returns them under an `acf` object, e.g. `program.acf.day` — which the
   front-end already maps to the cards.

> You can register the custom post types with **ACF** instead of this plugin.
> If you do, set each type's **REST API base URL** (ACF → Post Type → Advanced)
> to exactly `program`, `movement`, `leader`, `media_report`, and don't also
> activate this plugin's post-type registration (to avoid double-registering).

## 2. Point the front-end at WordPress

Edit **`assets/config.js`**:

```js
window.KV_WP_BASE = "https://your-wordpress-site.com"; // no trailing slash
```

Reload the site — Programs/Blog on the home page and the section pages now come
from WordPress. Leave it `""` to keep using the built-in editor.

## 3. CORS

If WordPress is on a **different domain** than the front-end, the browser needs
CORS. The plugin already sends permissive CORS headers for the REST API; tighten
`Access-Control-Allow-Origin` to your front-end's origin in production.

## Notes & limits

- This is **read-only headless**: the public site *reads* from WordPress; you
  author content in **wp-admin** (with logins, revisions, media library, etc.).
- The built-in `admin.html` editor remains as an **offline/no-WordPress**
  fallback — handy for local edits or before the CMS is set up.
- Ordering: WordPress returns newest first by default; adjust with query params
  (e.g. `orderby`, `order`, `meta_key`) if you need a specific order.
