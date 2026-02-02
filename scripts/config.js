const APP_CONFIG = {
  firebaseConfig: {
    apiKey: "AIzaSyDaPylIYSWtCbaY8T3ictCe1_6iaT2rsHg",
    authDomain: "purpleheart-b5fa6.firebaseapp.com",
    projectId: "purpleheart-b5fa6",
    storageBucket: "purpleheart-b5fa6.firebasestorage.app",
    messagingSenderId: "880836841031",
    appId: "1:880836841031:web:8a8773a472b313e793ab62",
    measurementId: "G-2D7QT9DKTT"
  },
  googleClientId: "845428318291-f8hg78pi6gllp91gpiiqqmgt2kviueqk.apps.googleusercontent.com",
  allowedEmails: ["cryspyfly@gmail.com", "teodoravuckovic73@gmail.com"],
  events: [
    {
      title: "The Day Love Began",
      date: "2024-08-02",
      color: "var(--accent)"
    },
    {
      title: "The Day Everything Changed",
      date: "2024-11-01",
      color: "var(--accent-soft)"
    }
  ],
  floatingMessages: [],
  dailyNotes: [],
  memoryImages: [
    {
      url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
      caption: "First sunrise together"
    }
  ],
  timelineItems: [
    {
      date: "2024-08-02",
      title: "First spark",
      description: "The night our story ignited."
    },
    {
      date: "2024-11-01",
      title: "Everything changed",
      description: "We chose forever."
    }
  ],
  audioNotes: [
    {
      title: "A soft reminder",
      url: "",
      note: "Add a shared audio note URL (MP3)."
    }
  ],
  openWhenNotes: [
    {
      title: "Open when you need a smile",
      body: "I love you more than words can fit inside a page.",
      openDate: "2026-02-02"
    }
  ],
  visitedCountries: [
    { id: "RS", date: "2024-08-02", note: "Where it all started 💜" }
  ],
  userData: {
    "cryspyfly@gmail.com": {
      birthdays: {
        self: "14 July 1997",
        partner: "19 September 2003"
      },
      floatingBubbles: [],
      privateNotes: [
        {
          title: "For her",
          body: "Write something only she can read when she signs in."
        }
      ]
    },
    "teodoravuckovic73@gmail.com": {
      birthdays: {
        self: "19 September 2003",
        partner: "14 July 1997"
      },
      floatingBubbles: [],
      privateNotes: [
        {
          title: "For him",
          body: "Write something only he can read when she signs in."
        }
      ]
    }
  },
  collages: [],
  slideshows: [],
  vaultNotes: [
    {
      title: "Private promise",
      body: "Reserved for just us."
    }
  ],
  loveMessages: [],
  musicTracks: [
    {
      title: "Add your song title",
      url: ""
    }
  ]
};


APP_CONFIG.allCountries = {
  "AF": "Afghanistan", 
  "AL": "Albania", 
  "DZ": "Algeria", 
  "AI": "Anguilla", 
  "AM": "Armenia", 
  "AW": "Aruba", 
  "AT": "Austria", 
  "BH": "Bahrain", 
  "BD": "Bangladesh", 
  "BB": "Barbados", 
  "BY": "Belarus", 
  "BE": "Belgium", 
  "BZ": "Belize", 
  "BJ": "Benin", 
  "BM": "Bermuda", 
  "BT": "Bhutan", 
  "BO": "Bolivia", 
  "BA": "Bosnia and Herzegovina", 
  "BW": "Botswana", 
  "BR": "Brazil", 
  "VG": "British Virgin Islands", 
  "BN": "Brunei Darussalam", 
  "BG": "Bulgaria", 
  "BF": "Burkina Faso", 
  "BI": "Burundi", 
  "KH": "Cambodia", 
  "CM": "Cameroon", 
  "CF": "Central African Republic", 
  "TD": "Chad", 
  "CO": "Colombia", 
  "CR": "Costa Rica", 
  "HR": "Croatia", 
  "CU": "Cuba", 
  "CW": "Curaçao", 
  "CZ": "Czech Republic", 
  "CI": "Côte d'Ivoire", 
  "KP": "Dem. Rep. Korea", 
  "CD": "Democratic Republic of the Congo", 
  "DJ": "Djibouti", 
  "DM": "Dominica", 
  "DO": "Dominican Republic", 
  "EC": "Ecuador", 
  "EG": "Egypt", 
  "SV": "El Salvador", 
  "GQ": "Equatorial Guinea", 
  "ER": "Eritrea", 
  "EE": "Estonia", 
  "ET": "Ethiopia", 
  "FI": "Finland", 
  "GF": "French Guiana", 
  "GA": "Gabon", 
  "GE": "Georgia", 
  "DE": "Germany", 
  "GH": "Ghana", 
  "GL": "Greenland", 
  "GD": "Grenada", 
  "GU": "Guam", 
  "GT": "Guatemala", 
  "GN": "Guinea", 
  "GW": "Guinea-Bissau", 
  "GY": "Guyana", 
  "HT": "Haiti", 
  "HN": "Honduras", 
  "HU": "Hungary", 
  "IS": "Iceland", 
  "IN": "India", 
  "IR": "Iran", 
  "IQ": "Iraq", 
  "IE": "Ireland", 
  "IL": "Israel", 
  "JM": "Jamaica", 
  "JO": "Jordan", 
  "KZ": "Kazakhstan", 
  "KE": "Kenya", 
  "XK": "Kosovo", 
  "KW": "Kuwait", 
  "KG": "Kyrgyzstan", 
  "LA": "Lao PDR", 
  "LV": "Latvia", 
  "LB": "Lebanon", 
  "LS": "Lesotho", 
  "LR": "Liberia", 
  "LY": "Libya", 
  "LT": "Lithuania", 
  "LU": "Luxembourg", 
  "MK": "Macedonia", 
  "MG": "Madagascar", 
  "MW": "Malawi", 
  "MV": "Maldives", 
  "ML": "Mali", 
  "MH": "Marshall Islands", 
  "MQ": "Martinique", 
  "MR": "Mauritania", 
  "YT": "Mayotte", 
  "MX": "Mexico", 
  "MD": "Moldova", 
  "MN": "Mongolia", 
  "ME": "Montenegro", 
  "MS": "Montserrat", 
  "MA": "Morocco", 
  "MZ": "Mozambique", 
  "MM": "Myanmar", 
  "NA": "Namibia", 
  "NR": "Nauru", 
  "NP": "Nepal", 
  "NL": "Netherlands", 
  "BQBO": "Netherlands", 
  "NI": "Nicaragua", 
  "NE": "Niger", 
  "NG": "Nigeria", 
  "PK": "Pakistan", 
  "PW": "Palau", 
  "PS": "Palestine", 
  "PA": "Panama", 
  "PY": "Paraguay", 
  "PE": "Peru", 
  "PL": "Poland", 
  "PT": "Portugal", 
  "QA": "Qatar", 
  "CG": "Republic of Congo", 
  "KR": "Republic of Korea", 
  "RE": "Reunion", 
  "RO": "Romania", 
  "RW": "Rwanda", 
  "BQSA": "Saba (Netherlands)", 
  "LC": "Saint Lucia", 
  "VC": "Saint Vincent and the Grenadines", 
  "BL": "Saint-Barthélemy", 
  "MF": "Saint-Martin", 
  "SA": "Saudi Arabia", 
  "SN": "Senegal", 
  "RS": "Serbia", 
  "SL": "Sierra Leone", 
  "SX": "Sint Maarten", 
  "SK": "Slovakia", 
  "SI": "Slovenia", 
  "SO": "Somalia", 
  "ZA": "South Africa", 
  "SS": "South Sudan", 
  "ES": "Spain", 
  "LK": "Sri Lanka", 
  "BQSE": "St. Eustatius (Netherlands)", 
  "SD": "Sudan", 
  "SR": "Suriname", 
  "SZ": "Swaziland", 
  "SE": "Sweden", 
  "CH": "Switzerland", 
  "SY": "Syria", 
  "TW": "Taiwan", 
  "TJ": "Tajikistan", 
  "TZ": "Tanzania", 
  "TH": "Thailand", 
  "GM": "The Gambia", 
  "TL": "Timor-Leste", 
  "TG": "Togo", 
  "TN": "Tunisia", 
  "TM": "Turkmenistan", 
  "TV": "Tuvalu", 
  "UG": "Uganda", 
  "UA": "Ukraine", 
  "AE": "United Arab Emirates", 
  "UY": "Uruguay", 
  "UZ": "Uzbekistan", 
  "VE": "Venezuela", 
  "VN": "Vietnam", 
  "EH": "Western Sahara", 
  "YE": "Yemen", 
  "ZM": "Zambia", 
  "ZW": "Zimbabwe"
};