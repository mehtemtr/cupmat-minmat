export type Stadium = {
  id: string;
  nameEn: string;
  nameTr: string;
  cityEn: string;
  cityTr: string;
  countryEn: string;
  countryTr: string;
  capacity: number;
  matchesHosted: number;
  scheduleNoteEn: string;
  scheduleNoteTr: string;
  imageGradient: string;
  images: string[];
};

export const STADIUMS: Stadium[] = [
  {
    id: "metlife",
    nameEn: "MetLife Stadium",
    nameTr: "MetLife Stadyumu",
    cityEn: "East Rutherford, NJ",
    cityTr: "East Rutherford, NJ",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 82500,
    matchesHosted: 8,
    scheduleNoteEn: "Opening match · Final · Group & Knockout",
    scheduleNoteTr: "Açılış · Final · Grup ve Eleme",
    imageGradient: "from-blue-600/30 to-indigo-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "sofi",
    nameEn: "SoFi Stadium",
    nameTr: "SoFi Stadyumu",
    cityEn: "Inglewood, CA",
    cityTr: "Inglewood, CA",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 70240,
    matchesHosted: 7,
    scheduleNoteEn: "Group stage · Round of 16",
    scheduleNoteTr: "Grup aşaması · Son 16",
    imageGradient: "from-purple-600/30 to-violet-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "att",
    nameEn: "AT&T Stadium",
    nameTr: "AT&T Stadyumu",
    cityEn: "Arlington, TX",
    cityTr: "Arlington, Teksas",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 80000,
    matchesHosted: 7,
    scheduleNoteEn: "Group stage · Quarter-final",
    scheduleNoteTr: "Grup aşaması · Çeyrek final",
    imageGradient: "from-sky-600/30 to-blue-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "mercedes",
    nameEn: "Mercedes-Benz Stadium",
    nameTr: "Mercedes-Benz Stadyumu",
    cityEn: "Atlanta, GA",
    cityTr: "Atlanta, Georgia",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 71000,
    matchesHosted: 6,
    scheduleNoteEn: "Group stage · Semi-final",
    scheduleNoteTr: "Grup aşaması · Yarı final",
    imageGradient: "from-emerald-600/30 to-teal-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "nrg",
    nameEn: "NRG Stadium",
    nameTr: "NRG Stadyumu",
    cityEn: "Houston, TX",
    cityTr: "Houston, Teksas",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 72220,
    matchesHosted: 6,
    scheduleNoteEn: "Group stage · Round of 32",
    scheduleNoteTr: "Grup aşaması · Son 32",
    imageGradient: "from-orange-600/30 to-red-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "lincoln",
    nameEn: "Lincoln Financial Field",
    nameTr: "Lincoln Financial Field",
    cityEn: "Philadelphia, PA",
    cityTr: "Philadelphia",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 69596,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-green-600/30 to-emerald-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "levis",
    nameEn: "Levi's Stadium",
    nameTr: "Levi's Stadyumu",
    cityEn: "Santa Clara, CA",
    cityTr: "Santa Clara, CA",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 68500,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage · Round of 16",
    scheduleNoteTr: "Grup aşaması · Son 16",
    imageGradient: "from-rose-600/30 to-pink-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "lumen",
    nameEn: "Lumen Field",
    nameTr: "Lumen Field",
    cityEn: "Seattle, WA",
    cityTr: "Seattle",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 68740,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-cyan-600/30 to-slate-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "gillette",
    nameEn: "Gillette Stadium",
    nameTr: "Gillette Stadyumu",
    cityEn: "Foxborough, MA",
    cityTr: "Foxborough, MA",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 65878,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-blue-500/30 to-navy-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "hardrock",
    nameEn: "Hard Rock Stadium",
    nameTr: "Hard Rock Stadyumu",
    cityEn: "Miami Gardens, FL",
    cityTr: "Miami Gardens, FL",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 65326,
    matchesHosted: 6,
    scheduleNoteEn: "Third-place match · Knockout",
    scheduleNoteTr: "Üçüncülük · Eleme turu",
    imageGradient: "from-teal-600/30 to-cyan-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "arrowhead",
    nameEn: "Arrowhead Stadium",
    nameTr: "Arrowhead Stadyumu",
    cityEn: "Kansas City, MO",
    cityTr: "Kansas City",
    countryEn: "USA",
    countryTr: "ABD",
    capacity: 76416,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-red-600/30 to-amber-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "azteca",
    nameEn: "Estadio Azteca",
    nameTr: "Estadio Azteca",
    cityEn: "Mexico City",
    cityTr: "Meksiko City",
    countryEn: "Mexico",
    countryTr: "Meksika",
    capacity: 87523,
    matchesHosted: 7,
    scheduleNoteEn: "Historic venue · Group & Knockout",
    scheduleNoteTr: "Tarihi mekan · Grup ve eleme",
    imageGradient: "from-lime-600/30 to-green-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "bbva",
    nameEn: "Estadio BBVA",
    nameTr: "Estadio BBVA",
    cityEn: "Monterrey",
    cityTr: "Monterrey",
    countryEn: "Mexico",
    countryTr: "Meksika",
    capacity: 53500,
    matchesHosted: 4,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-amber-600/30 to-yellow-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "akron",
    nameEn: "Estadio Akron",
    nameTr: "Estadio Akron",
    cityEn: "Guadalajara",
    cityTr: "Guadalajara",
    countryEn: "Mexico",
    countryTr: "Meksika",
    capacity: 49850,
    matchesHosted: 4,
    scheduleNoteEn: "Group stage",
    scheduleNoteTr: "Grup aşaması",
    imageGradient: "from-fuchsia-600/30 to-purple-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "bmo",
    nameEn: "BMO Field",
    nameTr: "BMO Field",
    cityEn: "Toronto",
    cityTr: "Toronto",
    countryEn: "Canada",
    countryTr: "Kanada",
    capacity: 45736,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage · Round of 32",
    scheduleNoteTr: "Grup aşaması · Son 32",
    imageGradient: "from-red-500/30 to-rose-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "bcplace",
    nameEn: "BC Place",
    nameTr: "BC Place",
    cityEn: "Vancouver",
    cityTr: "Vancouver",
    countryEn: "Canada",
    countryTr: "Kanada",
    capacity: 54500,
    matchesHosted: 5,
    scheduleNoteEn: "Group stage · Knockout",
    scheduleNoteTr: "Grup aşaması · Eleme",
    imageGradient: "from-indigo-600/30 to-blue-900/20",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    ],
  },
];
