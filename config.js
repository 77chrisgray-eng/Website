/* =====================================================================
   JORDAN RIVER MBC — WEBSITE SETTINGS
   ---------------------------------------------------------------------
   This is the ONE file to edit for church details. Everything on every
   page (phone, address, service times, links, giving, forms, calendar)
   is filled in from here.

   HOW TO EDIT SAFELY
   • Only change the text BETWEEN the quotation marks "like this".
   • Keep every quotation mark, comma and bracket exactly as they are.
   • Leave a value as "" (empty quotes) if you don't have it yet —
     the website will show a polite "coming soon" message instead of
     a broken link.
   ===================================================================== */

window.JR_CONFIG = {

  /* ---------- Church identity ---------- */
  churchName: "Jordan River Missionary Baptist Church",
  shortName: "Jordan River",
  websiteUrl: "https://jordanriverbuffalo.com",   // change if you use a different address

  /* ---------- Location & contact (DO NOT GUESS — enter confirmed info) ---------- */
  streetAddress: "440 Leroy Ave",          // e.g. "123 Example Street"
  city: "Buffalo",
  state: "NY",
  zip: "14215",               // e.g. "14201"
  phone: "(716) 546-7735",    // e.g. "(716) 555-0100"
  textNumber: "",             // a number that can RECEIVE text messages (can be the same as phone)
  email: "",                  // e.g. "office@jordanriverbuffalo.com"
  prayerEmail: "",            // optional separate address for prayer requests
  officeHours: "",            // e.g. "Tuesday – Friday, 10:00 AM – 3:00 PM"

  /* ---------- Service times (shown on the home page and footer) ---------- */
  // Fill in "time" for each one. Remove a line (including its comma) if the church doesn't hold it.
  serviceTimes: [
    { name: "Sunday School",              time: "10:30 – 11:30 AM" },
    { name: "Sunday Worship Experience",  time: "12:00 – 1:00 PM" },
    { name: "Wednesday Bible Study",      time: "6:00 PM (call for location)" }
  ],

  /* ---------- Pictures ---------- */
  // Upload the image file next to this file, then type its exact file name here.
  logo: "logo.png",           // e.g. "logo.png"  (the church's ORIGINAL logo only)
  heroImage: "church-building.jpg", // large home-page banner photo, e.g. "sanctuary.jpg"
  buildingPhoto: "church-building.jpg", // photo of the church building
  pastorPhoto: "",            // e.g. "pastor.jpg"
  galleryImages: [],          // e.g. ["choir.jpg", "outreach.jpg", "building.jpg"]

  /* ---------- Social media (full web addresses) ---------- */
  social: {
    facebook:  "https://www.facebook.com/JordanRiverBuffalo",            // e.g. "https://www.facebook.com/YourChurchPage"
    youtube:   "https://www.youtube.com/@jordanriverbuffalo",            // e.g. "https://www.youtube.com/@YourChannel"
    instagram: "https://www.instagram.com/jordanrivermbc"
  },

  /* ---------- YouTube livestream & sermons ---------- */
  youtube: {
    channelId: "UCol18Yt8eDUM6gJeNOwBZ_w",            // starts with "UC…" — see the Admin Guide for how to find it
    sermonsPlaylistId: "",    // optional: a playlist of past services, starts with "PL…"
    broadcastInfo: ""         // e.g. "We broadcast live every Sunday at 11:00 AM (Eastern)."
  },

  /* ---------- Online giving ---------- */
  // Paste the giving page link from the payment provider the church chooses.
  // Never paste card numbers or bank details here.
  giving: {
    provider: "",             // e.g. "Zeffy" or "PayPal"
    url: "",                  // main giving link
    funds: {                  // optional: separate links per fund (leave "" to use the main link)
      tithes: "", offerings: "", special: "", missions: ""
    },
    feeNote: "",              // the provider's fee wording, e.g. "Zeffy charges the church no fees; donors may add an optional tip to Zeffy."
    mailInstructions: ""      // e.g. "Checks payable to Jordan River MBC may be mailed to the church office."
  },

  /* ---------- Forms (free form service: Web3Forms.com) ---------- */
  // Get a free "Access Key" from https://web3forms.com (sent to the church email).
  // Optional separate keys let counseling and transportation go to different inboxes.
  forms: {
    accessKey: "",            // default key used by every form
    counselingKey: "",        // optional (pastor's private inbox)
    transportationKey: "",    // optional (transportation coordinator)
    prayerKey: ""             // optional (prayer ministry leader)
  },

  /* ---------- Event calendar (free Google Calendar) ---------- */
  // Option A (simplest): only fill in googleCalendarId — Google's calendar is shown on the Events page.
  // Option B (best looking): fill in BOTH googleCalendarId and googleApiKey — events appear in
  //                         the church-styled calendar, home page and event pop-ups.
  calendar: {
    googleCalendarId: "",     // e.g. "abc123@group.calendar.google.com"
    googleApiKey: "",
    timeZone: "America/New_York"
  },
  showSampleEvents: true,     // shows clearly-labeled SAMPLE events until a calendar is connected

  /* ---------- Announcements & sermon list (free Google Sheet) ---------- */
  // Publish each sheet tab to the web as CSV and paste the links here (see Admin Guide).
  sheets: {
    announcementsCsv: "",
    sermonsCsv: ""
  },

  /* ---------- Text & email announcements ---------- */
  // Set textAnnouncementsActive to true ONLY after the church has a texting service set up.
  textAnnouncementsActive: false,
  textProviderName: "",       // e.g. the name of the paid texting service the church chooses

  /* ---------- Review mode ---------- */
  // true = dashed gold boxes highlight content the church still needs to supply.
  // Set to false once everything has been reviewed.
  showPlaceholderMarkers: true
};
