const CACHE = "restoration-route-free-static-v38";
const ASSETS = [
  "index.html",
  "app.js",
  "data.js",
  "styles.css",
  "manifest.webmanifest",
  "firestore.rules",
  "README.md",
  "GITHUB_UPLOAD_INSTRUCTIONS.txt",
  "SECURITY_GO_LIVE_CHECKLIST.md",
  "assets/component_assets_exhaust_broken.png",
  "assets/component_assets_exhaust_fixed.png",
  "assets/component_assets_fuel_tank_broken.png",
  "assets/component_assets_fuel_tank_fixed.png",
  "assets/component_assets_gearbox_fixed.png",
  "assets/component_assets_headlight_broken.png",
  "assets/component_assets_headlight_fixed.png",
  "assets/component_assets_horn_broken.png",
  "assets/component_assets_horn_fixed.png",
  "assets/component_assets_oil_filter_fixed.png",
  "assets/component_assets_wheel_broken.png",
  "assets/component_assets_wheel_fixed.png",
  "assets/venue_1_ui.jpg",
  "assets/venue_2_ui.jpg",
  "assets/venue_3_ui.jpg",
  "assets/venue_4_ui.jpg",
  "assets/venue_5_ui.jpg",
  "assets/venue_6_ui.jpg",
  "assets/venue_7_ui.jpg",
  "assets/venue_8_ui.jpg",
  "assets/home_ui.webp",
  "assets/garage_directory_assets_repaired_stamp.webp",
  "assets/8_venue_assets_garage_directory_ui.webp",
  "assets/wall_map_exact_from_json.webp",
  "assets/component_assets_scanner_tool.webp",
  "assets/scanner_home_button.png",
  "assets/menu_ui.webp",
  "assets/banter_box.webp",
  "assets/garage_directory_exact_from_json.webp",
  "assets/menu_buttons_restoration_route_button_profile_true_alpha.webp",
  "assets/scanner_ui.webp",
  "assets/component_assets_radiator_broken.webp",
  "assets/menu_buttons_restoration_route_button_leaderboard_true_alpha.webp",
  "assets/menu_buttons_restoration_route_button_issues_true_alpha.webp",
  "assets/menu_buttons_restoration_route_button_log_out_true_alpha.webp",
  "assets/garage_directory_assets_home_button.webp",
  "assets/engine_damaged_true_transparent.webp",
  "assets/engine_repaired_true_transparent.webp",
  "assets/component_assets_radiator_fixed.webp",
  "assets/component_assets_oil_filter_broken.webp",
  "assets/component_assets_gearbox_broken.webp",
  "assets/component_assets_scanner_tool_transparent.webp",
  "assets/garage_directory_assets_directory_tab_buttons_garage_directory_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_the_piston_club_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_mr_watsons_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_gilks_garage_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_oily_rag_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_the_long_itch_diner_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_pats_baps_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_seven_mile_tab_button.webp",
  "assets/garage_directory_assets_directory_tab_buttons_the_man_cave_tab_button.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request).then(net => {
    const copy = net.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{});
    return net;
  }).catch(() => caches.match("index.html"))));
});
