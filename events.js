// Guiltless Goodies — Event & Location Data
// ============================================================
// Add new pickup / market locations here.
// Both the Order page and the Find Us page read from this file.
// Load this script BEFORE order.js and before any events-page script.
// ============================================================

var GG_EVENTS = [
  {
    id: "jpm",
    name: "JPM",
    subtitle: "Workplace Pickup",
    description: "Available year-round for colleagues. We\u2019ll coordinate a convenient pickup time with you after your order is received.",
    address: null,           // internal — not displayed publicly
    city: null,
    hours: "By arrangement",
    parking: null,
    mapsUrl: null,
    icon: "\uD83C\uDFE2",   // 🏢
    color: "#6b7aa1",
    schedule: { type: "always" }
  },
  {
    id: "woodbury",
    name: "Woodbury Farmers Market",
    subtitle: "Woodbury, NJ",
    description: "A wonderful local market in Woodbury, NJ. Stop by our table \u2014 samples always welcome!",
    address: null,           // TODO: add street address
    city: "Woodbury, NJ",
    hours: "Saturdays",      // TODO: add exact hours, e.g. "Saturdays, 8am \u2013 1pm"
    parking: null,           // TODO: add parking info
    mapsUrl: null,           // TODO: set to Google Maps URL
    icon: "\uD83C\uDF3D",   // 🌽
    color: "#e07b39",
    schedule: {
      type: "specific",
      dates: [
        new Date(2026, 5, 13),  // Jun 13
        new Date(2026, 5, 27),  // Jun 27
        new Date(2026, 6, 11),  // Jul 11
        new Date(2026, 6, 25),  // Jul 25
        new Date(2026, 7,  8),  // Aug  8
        new Date(2026, 7, 22),  // Aug 22
        new Date(2026, 8, 12),  // Sep 12
        new Date(2026, 8, 26)   // Sep 26
      ]
    }
  },
  {
    id: "wenonah",
    name: "Wenonah Farmers Market",
    subtitle: "Wenonah, NJ",
    description: "A charming small-town market. Find us every 1st and 3rd Thursday from May through September.",
    address: null,           // TODO: add street address
    city: "Wenonah, NJ",
    hours: "1st & 3rd Thursdays, May \u2013 September", // TODO: add exact hours
    parking: null,           // TODO: add parking info
    mapsUrl: null,           // TODO: set to Google Maps URL
    icon: "\uD83C\uDF3F",   // 🌿
    color: "#2d8a5e",
    schedule: {
      type: "nth-weekday",
      weekday: 4,              // Thursday  (0 = Sunday)
      occurrences: [1, 3],     // 1st and 3rd
      months: [4, 5, 6, 7, 8] // May(4) – Sep(8), 0-indexed
    }
  }
];

// ============================================================
// Date helpers  (used by both order.js and events page)
// ============================================================

// Returns the nth occurrence of `weekday` in the given month/year
function ggNthWeekday(year, month, weekday, n) {
  var first = new Date(year, month, 1);
  var offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

// All scheduled dates for an event in a given calendar year
function ggGetEventDates(event, year) {
  if (event.schedule.type === "always") return [];
  if (event.schedule.type === "specific") {
    return event.schedule.dates.filter(function (d) {
      return d.getFullYear() === year;
    });
  }
  if (event.schedule.type === "nth-weekday") {
    var s = event.schedule;
    var dates = [];
    s.months.forEach(function (m) {
      s.occurrences.forEach(function (n) {
        dates.push(ggNthWeekday(year, m, s.weekday, n));
      });
    });
    dates.sort(function (a, b) { return a - b; });
    return dates;
  }
  return [];
}

// Upcoming dates for an event starting from `from` (default today), optional limit
function ggGetUpcomingDates(event, from, limit) {
  if (event.schedule.type === "always") return null;
  var fromCopy = new Date(from || new Date());
  fromCopy.setHours(0, 0, 0, 0);
  var year = fromCopy.getFullYear();
  var dates = ggGetEventDates(event, year).concat(ggGetEventDates(event, year + 1));
  dates = dates.filter(function (d) { return d >= fromCopy; });
  if (limit) dates = dates.slice(0, limit);
  return dates;
}

// Which events are scheduled on a specific date
function ggEventsOnDate(date) {
  var check = new Date(date);
  check.setHours(0, 0, 0, 0);
  var result = [];
  GG_EVENTS.forEach(function (evt) {
    if (evt.schedule.type === "always") return;
    ggGetEventDates(evt, date.getFullYear()).forEach(function (d) {
      var dc = new Date(d);
      dc.setHours(0, 0, 0, 0);
      if (dc.getTime() === check.getTime()) result.push(evt);
    });
  });
  return result;
}

function ggFormatDate(d, opts) {
  return d.toLocaleDateString("en-US", opts || {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
}
