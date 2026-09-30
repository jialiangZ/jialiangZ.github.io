/* Self-hosted visitor map widget.
 * Basemap: Natural Earth 110m (public domain) rendered as images/world-map.svg.
 * Stats source: your Cloudflare Worker, with repo-hosted JSON as fallback.
 * Edit WORKER_URL below after deploying visitor-map-worker/.
 */
(function () {
  "use strict";

  var WORKER_URL = "https://visitor-map.1690608011qq.workers.dev";

  // ISO 3166-1 alpha-2 -> [lat, lon] (centroid of largest polygon, Natural Earth 110m)
  var CENTROIDS = {"FJ":[-17.8,178],"TZ":[-6.3,34.8],"EH":[24.3,-12.9],"CA":[56.8,-98.3],"US":[37.2,-95.8],"KZ":[48,66.9],"UZ":[41.4,64.5],"PG":[-6.6,145.9],"ID":[0.1,114],"AR":[-37.1,-63.5],"CL":[-35.7,-71.3],"CD":[-4,21.7],"SO":[5.2,46.1],"KE":[0.4,37.9],"SD":[15.1,30.2],"TD":[15.4,18.7],"HT":[19,-73],"DO":[18.7,-70.1],"RU":[61.5,99],"BS":[24.5,-78],"FK":[-51.7,-59.5],"NO":[64.6,18.1],"GL":[71.8,-42.8],"TF":[-49.2,69.6],"TL":[-8.8,126.2],"ZA":[-28.5,24.6],"LS":[-29.6,28.2],"MX":[23.6,-102],"UY":[-32.5,-55.8],"BR":[-14.3,-54.4],"BO":[-16.3,-63.5],"PE":[-9.2,-75],"CO":[4.1,-72.9],"PA":[8.4,-80.1],"CR":[9.7,-84.2],"NI":[12.9,-85.4],"HN":[14.5,-86.3],"SV":[13.8,-88.9],"GT":[15.8,-90.2],"BZ":[17.2,-88.7],"VE":[6.4,-66.5],"GY":[4.8,-59],"SR":[3.9,-56],"FR":[46.7,1.8],"EC":[-1.8,-78.1],"PR":[18.2,-66.4],"JM":[18.1,-77.3],"CU":[21.5,-79.6],"ZW":[-18.9,29.1],"BW":[-22.2,24.7],"NA":[-23,18.4],"SN":[14.5,-14.5],"ML":[17.5,-3.9],"MR":[21,-11],"BJ":[9.2,2.3],"NE":[17.6,8.1],"NG":[9.1,8.6],"CM":[7.3,12.2],"TG":[8.5,0.9],"GH":[7.9,-1.1],"CI":[7.4,-5.6],"GN":[9.9,-11.5],"GW":[11.8,-15.2],"LR":[6.4,-9.5],"SL":[8.4,-11.7],"BF":[12.4,-1.6],"CF":[6.7,20.9],"CG":[-0.7,14.8],"GA":[-0.8,11.6],"GQ":[1.6,10.3],"ZM":[-13.1,27.7],"MW":[-13,34.2],"MZ":[-18.5,35.5],"SZ":[-26.5,31.4],"AO":[-11.9,17.9],"BI":[-3.4,29.9],"IL":[31.4,35.1],"LB":[33.9,35.9],"MG":[-18.8,46.9],"PS":[31.9,35.2],"GM":[13.5,-15.3],"TN":[33.8,9.5],"DZ":[28.1,1.7],"JO":[31.3,37.1],"AE":[24.3,54],"QA":[25.3,51.2],"KW":[29.3,47.5],"IQ":[33.2,43.7],"OM":[20.8,55.9],"VU":[-15.2,166.9],"KH":[12.5,105],"TH":[13.1,101.5],"LA":[18.2,103.8],"MM":[19.1,96.7],"VN":[16,105.8],"KP":[40.3,127.5],"KR":[36.5,127.8],"MN":[46.8,103.8],"IN":[21.7,82.8],"BD":[23.6,90.4],"BT":[27.5,90.5],"NP":[28.4,84.1],"PK":[30.4,69.4],"AF":[33.9,67.8],"TJ":[38.8,71.2],"KG":[41.3,74.9],"TM":[39,59.5],"IR":[32.4,53.7],"SY":[34.8,39],"AM":[40,45],"SE":[62.2,17.5],"BY":[53.7,27.9],"UA":[48.8,31.1],"PL":[51.9,19.1],"AT":[47.7,13.2],"HU":[47.2,19.5],"MD":[47,28.3],"RO":[46,24.9],"LT":[55.1,23.8],"LV":[56.8,24.6],"EE":[58.5,25.7],"DE":[51.1,10.5],"BG":[42.7,25.5],"GR":[39.1,23.4],"TR":[38.9,35.5],"AL":[41.2,20.2],"HR":[44.5,16.5],"CH":[46.8,8.2],"LU":[49.8,6],"BE":[50.5,4.3],"NL":[52.2,5.2],"PT":[39.6,-8],"ES":[39.8,-3.2],"IE":[53.4,-8],"NC":[-21.3,165.6],"SB":[-7.9,159.1],"NZ":[-43.6,170.4],"AU":[-24.9,133.5],"LK":[7.9,80.7],"CN":[36.9,104.4],"TW":[23.6,121],"IT":[42.5,12.6],"DK":[56.3,9.5],"GB":[54.3,-2.2],"IS":[65,-19],"AZ":[40.1,47.7],"GE":[42.3,43.3],"PH":[15.5,122],"MY":[3.9,114.4],"BN":[4.7,114.8],"SI":[46.2,15.1],"FI":[65,26.1],"SK":[48.7,19.7],"CZ":[49.8,15.5],"ER":[15.2,39.7],"JP":[36.2,135.7],"PY":[-23.4,-58.5],"YE":[15.8,47.9],"SA":[24.3,45.1],"AQ":[-74.4,0],"CY":[35.3,33.7],"MA":[28.6,-9.1],"EG":[26.8,30.8],"LY":[26.4,17.2],"ET":[9.2,40.4],"DJ":[11.8,42.5],"UG":[1.4,32.3],"RW":[-2,29.9],"BA":[43.9,17.7],"MK":[41.6,21.7],"RS":[44.2,20.9],"ME":[42.7,19.4],"XK":[42.6,20.9],"TT":[10.4,-61.4],"SS":[7.9,29.6]};

  var COUNTRY_NAMES = {
 "AF": "Afghanistan",
 "AO": "Angola",
 "AL": "Albania",
 "AE": "United Arab Emirates",
 "AR": "Argentina",
 "AM": "Armenia",
 "AQ": "Antarctica",
 "TF": "French Southern Territories",
 "AU": "Australia",
 "AT": "Austria",
 "AZ": "Azerbaijan",
 "BI": "Burundi",
 "BE": "Belgium",
 "BJ": "Benin",
 "BF": "Burkina Faso",
 "BD": "Bangladesh",
 "BG": "Bulgaria",
 "BS": "Bahamas",
 "BA": "Bosnia and Herzegovina",
 "BY": "Belarus",
 "BZ": "Belize",
 "BO": "Bolivia",
 "BR": "Brazil",
 "BN": "Brunei",
 "BT": "Bhutan",
 "BW": "Botswana",
 "CF": "Central African Republic",
 "CA": "Canada",
 "CH": "Switzerland",
 "CL": "Chile",
 "CN": "China",
 "CI": "Côte d'Ivoire",
 "CM": "Cameroon",
 "CD": "DR Congo",
 "CG": "Congo",
 "CO": "Colombia",
 "CR": "Costa Rica",
 "CU": "Cuba",
 "CY": "Cyprus",
 "CZ": "Czechia",
 "DE": "Germany",
 "DJ": "Djibouti",
 "DK": "Denmark",
 "DO": "Dominican Republic",
 "DZ": "Algeria",
 "EC": "Ecuador",
 "EG": "Egypt",
 "ER": "Eritrea",
 "ES": "Spain",
 "EE": "Estonia",
 "ET": "Ethiopia",
 "FI": "Finland",
 "FJ": "Fiji",
 "FK": "Falkland Islands",
 "FR": "France",
 "GA": "Gabon",
 "GB": "United Kingdom",
 "GE": "Georgia",
 "GH": "Ghana",
 "GN": "Guinea",
 "GM": "Gambia",
 "GW": "Guinea-Bissau",
 "GQ": "Equatorial Guinea",
 "GR": "Greece",
 "GL": "Greenland",
 "GT": "Guatemala",
 "GY": "Guyana",
 "HN": "Honduras",
 "HR": "Croatia",
 "HT": "Haiti",
 "HU": "Hungary",
 "ID": "Indonesia",
 "IN": "India",
 "IE": "Ireland",
 "IR": "Iran",
 "IQ": "Iraq",
 "IS": "Iceland",
 "IL": "Israel",
 "IT": "Italy",
 "JM": "Jamaica",
 "JO": "Jordan",
 "JP": "Japan",
 "KZ": "Kazakhstan",
 "KE": "Kenya",
 "KG": "Kyrgyzstan",
 "KH": "Cambodia",
 "KR": "South Korea",
 "XK": "Kosovo",
 "KW": "Kuwait",
 "LA": "Laos",
 "LB": "Lebanon",
 "LR": "Liberia",
 "LY": "Libya",
 "LK": "Sri Lanka",
 "LS": "Lesotho",
 "LT": "Lithuania",
 "LU": "Luxembourg",
 "LV": "Latvia",
 "MA": "Morocco",
 "MD": "Moldova",
 "MG": "Madagascar",
 "MX": "Mexico",
 "MK": "North Macedonia",
 "ML": "Mali",
 "MM": "Myanmar",
 "ME": "Montenegro",
 "MN": "Mongolia",
 "MZ": "Mozambique",
 "MR": "Mauritania",
 "MW": "Malawi",
 "MY": "Malaysia",
 "NA": "Namibia",
 "NC": "New Caledonia",
 "NE": "Niger",
 "NG": "Nigeria",
 "NI": "Nicaragua",
 "NL": "Netherlands",
 "NO": "Norway",
 "NP": "Nepal",
 "NZ": "New Zealand",
 "OM": "Oman",
 "PK": "Pakistan",
 "PA": "Panama",
 "PE": "Peru",
 "PH": "Philippines",
 "PG": "Papua New Guinea",
 "PL": "Poland",
 "PR": "Puerto Rico",
 "KP": "North Korea",
 "PT": "Portugal",
 "PY": "Paraguay",
 "PS": "Palestine",
 "QA": "Qatar",
 "RO": "Romania",
 "RU": "Russia",
 "RW": "Rwanda",
 "EH": "Western Sahara",
 "SA": "Saudi Arabia",
 "SD": "Sudan",
 "SS": "South Sudan",
 "SN": "Senegal",
 "SB": "Solomon Islands",
 "SL": "Sierra Leone",
 "SV": "El Salvador",
 "SO": "Somalia",
 "RS": "Serbia",
 "SR": "Suriname",
 "SK": "Slovakia",
 "SI": "Slovenia",
 "SE": "Sweden",
 "SZ": "Eswatini",
 "SY": "Syria",
 "TD": "Chad",
 "TG": "Togo",
 "TH": "Thailand",
 "TJ": "Tajikistan",
 "TM": "Turkmenistan",
 "TL": "Timor-Leste",
 "TT": "Trinidad and Tobago",
 "TN": "Tunisia",
 "TR": "Turkey",
 "TW": "Taiwan",
 "TZ": "Tanzania",
 "UG": "Uganda",
 "UA": "Ukraine",
 "UY": "Uruguay",
 "US": "United States",
 "UZ": "Uzbekistan",
 "VE": "Venezuela",
 "VN": "Vietnam",
 "VU": "Vanuatu",
 "YE": "Yemen",
 "ZA": "South Africa",
 "ZM": "Zambia",
 "ZW": "Zimbabwe"
};

  function box() { return document.getElementById("visitor-map-box"); }
  function dotLayer() { return document.getElementById("visitor-map-dots"); }
  function counter() { return document.getElementById("visitor-map-counter"); }

  function project(lat, lon) {
    return { left: ((lon + 180) / 360) * 100 + "%", top: ((90 - lat) / 180) * 100 + "%" };
  }

  function render(counts, total, isLive) {
    var layer = dotLayer();
    var boxEl = box();
    if (!layer || !boxEl) return;
    var max = 0, keys = Object.keys(counts);
    for (var i = 0; i < keys.length; i++) if (counts[keys[i]] > max) max = counts[keys[i]];
    for (var j = 0; j < keys.length; j++) {
      var cc = keys[j], n = counts[cc], pos = CENTROIDS[cc];
      if (!pos) continue;
      var dot = document.createElement("div");
      var r = 3 + 7 * Math.sqrt(n / (max || 1)); // px, scaled by sqrt so big values stay readable
      dot.className = "visitor-map-dot";
      dot.style.left = project(pos[0], pos[1]).left;
      dot.style.top = project(pos[0], pos[1]).top;
      dot.style.width = dot.style.height = r * 2 + "px";
      dot.title = (COUNTRY_NAMES[cc] || cc) + ": " + n + " view" + (n === 1 ? "" : "s");
      layer.appendChild(dot);
    }
    if (counter()) {
      var countries = keys.filter(function (k) { return CENTROIDS[k]; }).length;
      counter().textContent = total.toLocaleString() + " page views from " + countries +
        " countries" + (isLive ? "" : " (cached)");
    }
  }

  function pingVisit() {
    var done = false;
    try { done = sessionStorage.getItem("visitor-map-pinged") === "1"; } catch (e) { /* private mode */ }
    if (done || navigator.webdriver) return Promise.resolve(null); // webdriver = headless/test browser
    try { sessionStorage.setItem("visitor-map-pinged", "1"); } catch (e) { /* ignore */ }

    // send only the hostname of the referrer, never the full URL (query strings may contain sensitive data)
    var ref = "direct";
    try {
      if (document.referrer) {
        ref = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, "");
        if (ref === location.hostname.toLowerCase()) ref = "direct";
      }
    } catch (e) { /* ignore */ }

    var payload = JSON.stringify({ referrer: ref }); // text/plain body => simple request, no CORS preflight
    return fetch(WORKER_URL + "/visit", { method: "POST", mode: "cors", keepalive: true, body: payload })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () {
        try { navigator.sendBeacon(WORKER_URL + "/visit", payload); } catch (e2) { /* ignore */ }
        return null;
      });
  }

  function loadStats() {
    return fetch(WORKER_URL + "/stats")
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (s) { return { stats: s, live: true }; })
      .catch(function () {
        // fallback 1: snapshot committed to this repo (same origin)
        return fetch("data/visitor-map.json").then(function (r) {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        }).then(function (s) { return { stats: s, live: false }; });
      });
  }

  function init() {
    pingVisit().then(function (hit) {
      loadStats().then(function (res) {
        var counts = res.stats.counts || {};
        var total = res.stats.total || 0;
        // count the current visit immediately when the ping response was readable and counted
        if (hit && hit.counted && hit.country) {
          counts[hit.country] = (counts[hit.country] || 0) + 1;
          total += 1;
        }
        render(counts, total, res.live);
      }).catch(function () {
        if (counter()) counter().textContent = "";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
