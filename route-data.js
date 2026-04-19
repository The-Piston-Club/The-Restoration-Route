export const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export function normalizeVenueValue(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ROUTE_VENUES = [
  {
    name: "The Piston Club",
    quip: "Where the pistons fire and the engine comes alive.",
    website: "https://thepistonclub.co.uk/",
    websiteLabel: "thepistonclub.co.uk",
    partKey: "engine",
    partLabel: "Engine",
    claimToken: "rr-eng-4a9k1",
    aliases: ["engine", "piston-club", "the-piston-club"],
    opening: {
      Monday: "7:30 AM – 10:00 PM",
      Tuesday: "7:30 AM – 10:00 PM",
      Wednesday: "7:30 AM – 10:00 PM",
      Thursday: "7:30 AM – 10:00 PM",
      Friday: "7:30 AM – 10:00 PM",
      Saturday: "7:30 AM – 10:00 PM",
      Sunday: "7:30 AM – 8:00 PM"
    },
    food: {
      Monday: "Food: 7:30 AM – 8:30 PM",
      Tuesday: "Food: 7:30 AM – 8:30 PM",
      Wednesday: "Food: 7:30 AM – 8:30 PM",
      Thursday: "Food: 7:30 AM – 8:30 PM",
      Friday: "Food: 7:30 AM – 8:30 PM",
      Saturday: "Food: 7:30 AM – 8:30 PM",
      Sunday: "Food: 7:30 AM – 5:00 PM"
    },
    address: [
      "The Piston Club @ The Stag",
      "Alcester Road",
      "Redhill",
      "Stratford upon Avon",
      "Warwickshire",
      "B49 6NQ"
    ],
    phone: "01789 764634",
    email: "info@thepistonclub.co.uk",
    mapQuery: "The Piston Club @ The Stag, Alcester Road, Redhill, Stratford upon Avon, Warwickshire, B49 6NQ",
    socials: {
      facebook: "https://www.facebook.com/ThePistonClubUK",
      instagram: "https://www.instagram.com/thepistonclubhq/"
    }
  },
  {
    name: "Gilks’ Garage Café",
    quip: "Topping up the tank for the miles ahead.",
    website: "https://gilksgaragecafe.com/",
    websiteLabel: "gilksgaragecafe.com",
    partKey: "fuel-system",
    partLabel: "Fuel System",
    claimToken: "rr-fuel-8m2p3",
    aliases: ["fuel-system", "gilks", "gilks-garage-cafe"],
    opening: {
      Monday: "Closed",
      Tuesday: "Closed",
      Wednesday: "9:00 AM – 3:00 PM",
      Thursday: "9:00 AM – 3:00 PM",
      Friday: "9:00 AM – 3:00 PM",
      Saturday: "9:00 AM – 3:00 PM",
      Sunday: "9:00 AM – 3:00 PM"
    },
    food: {
      Wednesday: "Kitchen closes at 2:00 PM",
      Thursday: "Kitchen closes at 2:00 PM",
      Friday: "Kitchen closes at 2:00 PM",
      Saturday: "Kitchen closes at 2:00 PM",
      Sunday: "Kitchen closes at 2:00 PM"
    },
    address: [
      "Banbury Road",
      "Kineton",
      "Warwickshire",
      "CV35 0JZ"
    ],
    phone: "01926 640539",
    email: "keith@gilksgaragecafe.com",
    mapQuery: "Gilks Garage Cafe, Banbury Road, Kineton, Warwickshire, CV35 0JZ",
    socials: {
      facebook: "https://www.facebook.com/gilksgaragecafe/",
      instagram: "https://www.instagram.com/gilksgaragecafe/"
    }
  },
  {
    name: "Mr Watsons Cafe",
    quip: "Double-decker charm with the shell shining bright.",
    website: "https://www.mrwatsonscafe.com/",
    websiteLabel: "mrwatsonscafe.com",
    partKey: "bodywork",
    partLabel: "Bodywork",
    claimToken: "rr-body-1q7x6",
    aliases: ["bodywork", "mr-watsons", "mr-watsons-cafe", "mr-watsons-cafe-blockley"],
    opening: {
      Monday: "10:30 AM – 3:00 PM",
      Tuesday: "8:30 AM – 3:00 PM",
      Wednesday: "8:30 AM – 3:00 PM",
      Thursday: "8:30 AM – 3:00 PM",
      Friday: "8:30 AM – 3:00 PM",
      Saturday: "Check Facebook",
      Sunday: "Closed"
    },
    food: {},
    address: [
      "72 Northwick Business Centre",
      "Blockley",
      "GL56 9RF"
    ],
    phone: "—",
    email: "Mrwatsonscafe@gmail.com",
    mapQuery: "72 Northwick Business Centre, Blockley, GL56 9RF",
    socials: {
      facebook: "https://www.facebook.com/p/Mr-Watsons-Cafe-100091805952631/",
      instagram: "https://www.instagram.com/mrwatsonscafe/"
    }
  },
  {
    name: "Seven Mile",
    quip: "A strong chassis for every mile ahead.",
    website: "https://www.sevenmile.co.uk/",
    websiteLabel: "sevenmile.co.uk",
    partKey: "chassis",
    partLabel: "Chassis",
    claimToken: "rr-chas-6v4d2",
    aliases: ["chassis", "seven-mile", "sevenmile"],
    opening: {
      Monday: "Closed",
      Tuesday: "Closed",
      Wednesday: "Closed",
      Thursday: "Closed",
      Friday: "Closed",
      Saturday: "Closed",
      Sunday: "Closed"
    },
    food: {},
    address: [
      "Bell Cottage",
      "Mill Road",
      "Stratton Audley",
      "OX27 9AR"
    ],
    phone: "07807 939952",
    email: "hello@sevenmile.co.uk",
    mapQuery: "Bell Cottage, Mill Road, Stratton Audley, OX27 9AR",
    socials: {
      facebook: "https://www.facebook.com/sevenmilecande",
      instagram: "https://www.instagram.com/sevenmilecande/"
    }
  },
  {
    name: "Oily Rag",
    quip: "Smooth running starts where the good stuff flows.",
    website: "https://www.oilyrag.com/",
    websiteLabel: "oilyrag.com",
    partKey: "lubrication",
    partLabel: "Lubrication",
    claimToken: "rr-lube-5n8r4",
    aliases: ["lubrication", "oily-rag", "oilyrag"],
    opening: {
      Monday: "Closed",
      Tuesday: "Closed",
      Wednesday: "Closed",
      Thursday: "Closed",
      Friday: "10:00 AM – 2:00 PM",
      Saturday: "10:00 AM – 4:00 PM",
      Sunday: "10:00 AM – 2:30 PM"
    },
    food: {},
    address: [
      "Unit 9 Rockhaven Industrial Estate",
      "Triangle Park",
      "Gloucester",
      "GL1 1AJ"
    ],
    phone: "—",
    email: "info@oilyrag.com",
    mapQuery: "Unit 9 Rockhaven Industrial Estate, Triangle Park, Gloucester, GL1 1AJ",
    socials: {
      facebook: "https://www.facebook.com/OilyRagClothing/",
      instagram: "https://www.instagram.com/oilyragco/"
    }
  },
  {
    name: "The Blue Lias",
    quip: "Keeping the whole build cool under pressure.",
    website: "https://thebluelias.com/",
    websiteLabel: "thebluelias.com",
    partKey: "cooling",
    partLabel: "Cooling",
    claimToken: "rr-cool-9t3w7",
    aliases: ["cooling", "the-blue-lias", "blue-lias"],
    opening: {
      Monday: "12:00 PM – 10:00 PM",
      Tuesday: "12:00 PM – 10:00 PM",
      Wednesday: "12:00 PM – 10:00 PM",
      Thursday: "12:00 PM – 10:00 PM",
      Friday: "12:00 PM – 11:00 PM",
      Saturday: "12:00 PM – 11:00 PM",
      Sunday: "12:00 PM – 10:00 PM"
    },
    food: {
      Monday: "Food: 12:00 PM – 2:30 PM, 5:30 PM – 8:00 PM",
      Tuesday: "Food: 12:00 PM – 2:30 PM, 5:30 PM – 8:00 PM",
      Wednesday: "Food: 12:00 PM – 2:30 PM, 5:30 PM – 8:00 PM",
      Thursday: "Food: 12:00 PM – 2:30 PM, 5:30 PM – 8:00 PM",
      Friday: "Food: 12:00 PM – 2:30 PM, 5:30 PM – 8:00 PM",
      Saturday: "Food: 12:00 PM – 8:00 PM",
      Sunday: "Food: 12:00 PM – 6:00 PM"
    },
    address: [
      "Stockton Road",
      "Stockton",
      "Southam",
      "CV47 8LD"
    ],
    phone: "01926 812249",
    email: "enquiries@thebluelias.com",
    mapQuery: "The Blue Lias, Stockton Road, Stockton, Southam, CV47 8LD",
    socials: {
      facebook: "https://www.facebook.com/bluelias",
      instagram: "https://www.instagram.com/thebluelias/"
    }
  },
  {
    name: "The Long Itch Diner",
    quip: "Keeping the gears sweet for the road ahead.",
    website: "https://www.longitchdiner.co.uk/",
    websiteLabel: "longitchdiner.co.uk",
    partKey: "transmission",
    partLabel: "Transmission",
    claimToken: "rr-trans-2h6m8",
    aliases: ["transmission", "long-itch-diner", "the-long-itch-diner"],
    opening: {
      Monday: "8:30 AM – 2:30 PM",
      Tuesday: "8:30 AM – 2:30 PM",
      Wednesday: "8:30 AM – 2:30 PM",
      Thursday: "8:30 AM – 2:30 PM",
      Friday: "8:30 AM – 2:30 PM",
      Saturday: "8:30 AM – 2:30 PM",
      Sunday: "9:00 AM – 2:30 PM"
    },
    food: {},
    address: [
      "Southam Road",
      "Long Itchington",
      "Southam",
      "CV47 9QZ"
    ],
    phone: "01926 819096",
    email: "Use website contact form",
    mapQuery: "Southam Road, Long Itchington, Southam, CV47 9QZ",
    socials: {
      facebook: "https://www.facebook.com/thelongitchdiner/",
      instagram: ""
    }
  },
  {
    name: "Cotswold Cafe / Pats Baps",
    quip: "Fresh grip for the road and the ride ahead.",
    website: "https://www.cotswoldcafe-patsbaps.co.uk/",
    websiteLabel: "cotswoldcafe-patsbaps.co.uk",
    partKey: "tyres",
    partLabel: "Tyres",
    claimToken: "rr-tyres-7c5p9",
    aliases: ["tyres", "cotswold-cafe", "pats-baps", "cotswold-cafe-pats-baps"],
    opening: {
      Monday: "9:00 AM – 3:00 PM",
      Tuesday: "9:00 AM – 3:00 PM",
      Wednesday: "9:00 AM – 3:00 PM",
      Thursday: "9:00 AM – 3:00 PM",
      Friday: "9:00 AM – 3:00 PM",
      Saturday: "9:00 AM – 1:00 PM",
      Sunday: "Closed"
    },
    food: {
      Sunday: "Open every 3rd Sunday for bike meets: 9:00 AM – 1:00 PM"
    },
    address: [
      "Unit 4, London Road",
      "Little Compton",
      "Moreton-in-Marsh",
      "GL56 0RR"
    ],
    phone: "01608 674729",
    email: "cotswoldcafe@hotmail.com",
    mapQuery: "Unit 4 London Road, Little Compton, Moreton-in-Marsh, GL56 0RR",
    socials: {
      facebook: "https://www.facebook.com/CotswoldCafepatsbaps/",
      instagram: "https://www.instagram.com/cotswoldcafepatsbaps"
    }
  }
];

export const VALID_PARTS = ROUTE_VENUES.map((venue) => venue.partKey);

export const ALIAS_MAP = (() => {
  const map = {};
  ROUTE_VENUES.forEach((venue) => {
    map[venue.partKey] = venue.partKey;
    venue.aliases.forEach((alias) => {
      map[normalizeVenueValue(alias)] = venue.partKey;
    });
  });
  return map;
})();

export const TOKEN_MAP = (() => {
  const map = {};
  ROUTE_VENUES.forEach((venue) => {
    map[venue.partKey] = venue.claimToken;
  });
  return map;
})();

export function getVenueByPartKey(partKey) {
  return ROUTE_VENUES.find((venue) => venue.partKey === partKey) || null;
}
