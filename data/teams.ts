import type { GroupId, Team } from "@/lib/types/tournament";
import { Locale } from "@/lib/i18n/types";
import { getDrawOrder } from "@/data/official-groups";
import { validateTeamsData } from "@/data/validate-teams";

function flag(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

function squad(
  teamId: string,
  players: { name: string; position: string; club: string; age: number }[],
) {
  return players.map((p, i) => ({
    id: `${teamId}-p${i + 1}`,
    ...p,
  }));
}

type TeamSeed = {
  id: string;
  code: string;
  nameEn: string;
  nameTr: string;
  fifaRank: number;
  group: GroupId;
  confederation: string;
  manager: { name: string; nationality: string; age: number; tenure: string };
  players: { name: string; position: string; club: string; age: number }[];
};

/** Official FIFA World Cup 2026 group draw — 48 nations, groups A–L */
const seeds: TeamSeed[] = [
  {
    "id": "mex",
    "code": "mx",
    "nameEn": "Mexico",
    "nameTr": "Meksika",
    "fifaRank": 14,
    "group": "A",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Javier Aguirre",
      "nationality": "Mexico",
      "age": 66,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Guillermo Ochoa",
        "position": "GK",
        "club": "AEL Limassol",
        "age": 41
      },
      {
        "name": "Raúl Rangel",
        "position": "GK",
        "club": "Guadalajara",
        "age": 26
      },
      {
        "name": "Carlos Acevedo",
        "position": "GK",
        "club": "Santos Laguna",
        "age": 30
      },
      {
        "name": "Jesús Gallardo",
        "position": "DF",
        "club": "Toluca",
        "age": 32
      },
      {
        "name": "César Montes",
        "position": "DF",
        "club": "Lokomotiv Moscow",
        "age": 29
      },
      {
        "name": "Jorge Sánchez",
        "position": "DF",
        "club": "PAOK",
        "age": 29
      },
      {
        "name": "Johan Vásquez",
        "position": "DF",
        "club": "Genoa",
        "age": 28
      },
      {
        "name": "Israel Reyes",
        "position": "DF",
        "club": "América",
        "age": 26
      },
      {
        "name": "Mateo Chávez",
        "position": "DF",
        "club": "AZ",
        "age": 22
      },
      {
        "name": "Everardo López",
        "position": "DF",
        "club": "Toluca",
        "age": 21
      },
      {
        "name": "Bryan González",
        "position": "DF",
        "club": "Guadalajara",
        "age": 23
      },
      {
        "name": "Ramón Juárez",
        "position": "DF",
        "club": "América",
        "age": 25
      },
      {
        "name": "Edson Álvarez",
        "position": "MF",
        "club": "West Ham United",
        "age": 29
      },
      {
        "name": "Orbelín Pineda",
        "position": "MF",
        "club": "AEK Athens",
        "age": 30
      },
      {
        "name": "Roberto Alvarado",
        "position": "MF",
        "club": "Guadalajara",
        "age": 28
      },
      {
        "name": "Luis Romo",
        "position": "MF",
        "club": "Guadalajara",
        "age": 31
      },
      {
        "name": "Luis Chávez",
        "position": "MF",
        "club": "Dynamo Moscow",
        "age": 30
      },
      {
        "name": "Diego Lainez",
        "position": "MF",
        "club": "UANL",
        "age": 26
      },
      {
        "name": "Érik Lira",
        "position": "MF",
        "club": "Cruz Azul",
        "age": 26
      },
      {
        "name": "Marcel Ruiz",
        "position": "MF",
        "club": "Toluca",
        "age": 26
      },
      {
        "name": "Brian Gutiérrez",
        "position": "MF",
        "club": "Chicago Fire",
        "age": 22
      },
      {
        "name": "Efraín Álvarez",
        "position": "MF",
        "club": "Guadalajara",
        "age": 24
      },
      {
        "name": "Raúl Jiménez",
        "position": "FW",
        "club": "Fulham",
        "age": 35
      },
      {
        "name": "Alexis Vega",
        "position": "FW",
        "club": "Toluca",
        "age": 29
      },
      {
        "name": "Santiago Giménez",
        "position": "FW",
        "club": "Milan",
        "age": 25
      },
      {
        "name": "César Huerta",
        "position": "FW",
        "club": "Anderlecht",
        "age": 26
      },
      {
        "name": "Julián Quiñones",
        "position": "FW",
        "club": "Al-Qadsiah",
        "age": 29
      }
    ]
  },
  {
    "id": "kor",
    "code": "kr",
    "nameEn": "South Korea",
    "nameTr": "Güney Kore",
    "fifaRank": 23,
    "group": "A",
    "confederation": "AFC",
    "manager": {
      "name": "Hong Myung-bo",
      "nationality": "South Korea",
      "age": 55,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Kim Seung-gyu",
        "position": "GK",
        "club": "FC Tokyo",
        "age": 36
      },
      {
        "name": "Jo Hyeon-woo",
        "position": "GK",
        "club": "Ulsan HD",
        "age": 35
      },
      {
        "name": "Song Bum-keun",
        "position": "GK",
        "club": "Jeonbuk Hyundai Motors",
        "age": 29
      },
      {
        "name": "Kim Min-jae",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 30
      },
      {
        "name": "Kim Moon-hwan",
        "position": "DF",
        "club": "Daejeon Hana Citizen",
        "age": 31
      },
      {
        "name": "Seol Young-woo",
        "position": "DF",
        "club": "Red Star Belgrade",
        "age": 28
      },
      {
        "name": "Lee Tae-seok",
        "position": "DF",
        "club": "Austria Wien",
        "age": 24
      },
      {
        "name": "Park Jin-seob",
        "position": "DF",
        "club": "Zhejiang FC",
        "age": 31
      },
      {
        "name": "Kim Tae-hyeon",
        "position": "DF",
        "club": "Kashima Antlers",
        "age": 26
      },
      {
        "name": "Lee Han-beom",
        "position": "DF",
        "club": "Midtjylland",
        "age": 24
      },
      {
        "name": "Jens Castrop",
        "position": "DF",
        "club": "Borussia Mönchengladbach",
        "age": 23
      },
      {
        "name": "Cho Wi-je",
        "position": "DF",
        "club": "Jeonbuk Hyundai Motors",
        "age": 25
      },
      {
        "name": "Hwang In-beom",
        "position": "MF",
        "club": "Feyenoord",
        "age": 30
      },
      {
        "name": "Lee Kang-in",
        "position": "MF",
        "club": "Paris Saint-Germain",
        "age": 25
      },
      {
        "name": "Lee Gihyuk",
        "position": "MF",
        "club": "Gangwon FC",
        "age": 26
      },
      {
        "name": "Lee Jae-sung",
        "position": "MF",
        "club": "Mainz 05",
        "age": 34
      },
      {
        "name": "Hwang Hee-chan",
        "position": "MF",
        "club": "Wolverhampton Wanderers",
        "age": 30
      },
      {
        "name": "Paik Seung-ho",
        "position": "MF",
        "club": "Birmingham City",
        "age": 29
      },
      {
        "name": "Kim Jin-gyu",
        "position": "MF",
        "club": "Jeonbuk Hyundai Motors",
        "age": 29
      },
      {
        "name": "Lee Dong-gyeong",
        "position": "MF",
        "club": "Ulsan HD",
        "age": 29
      },
      {
        "name": "Bae Jun-ho",
        "position": "MF",
        "club": "Stoke City",
        "age": 23
      },
      {
        "name": "Eom Ji-sung",
        "position": "MF",
        "club": "Swansea City",
        "age": 24
      },
      {
        "name": "Yang Hyun-jun",
        "position": "MF",
        "club": "Celtic",
        "age": 24
      },
      {
        "name": "Oh Hyeon-gyu",
        "position": "FW",
        "club": "Beşiktaş",
        "age": 25
      },
      {
        "name": "Son Heung-min",
        "position": "FW",
        "club": "Los Angeles FC",
        "age": 34
      },
      {
        "name": "Cho Gue-sung",
        "position": "FW",
        "club": "Midtjylland",
        "age": 28
      }
    ]
  },
  {
    "id": "cze",
    "code": "cz",
    "nameEn": "Czechia",
    "nameTr": "Çekya",
    "fifaRank": 32,
    "group": "A",
    "confederation": "UEFA",
    "manager": {
      "name": "Miroslav Koubek",
      "nationality": "Czechia",
      "age": 74,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Matěj Kovář",
        "position": "GK",
        "club": "PSV",
        "age": 26
      },
      {
        "name": "Jindřich Staněk",
        "position": "GK",
        "club": "Slavia Prague",
        "age": 30
      },
      {
        "name": "Lukáš Horníček",
        "position": "GK",
        "club": "Braga",
        "age": 24
      },
      {
        "name": "Vladimír Coufal",
        "position": "DF",
        "club": "TSG Hoffenheim",
        "age": 34
      },
      {
        "name": "Tomáš Holeš",
        "position": "DF",
        "club": "Slavia Prague",
        "age": 33
      },
      {
        "name": "Ladislav Krejčí",
        "position": "DF",
        "club": "Wolverhampton Wanderers",
        "age": 27
      },
      {
        "name": "David Zima",
        "position": "DF",
        "club": "Slavia Prague",
        "age": 26
      },
      {
        "name": "Jaroslav Zelený",
        "position": "DF",
        "club": "Sparta Prague",
        "age": 34
      },
      {
        "name": "David Jurásek",
        "position": "DF",
        "club": "Slavia Prague",
        "age": 26
      },
      {
        "name": "David Douděra",
        "position": "DF",
        "club": "Slavia Prague",
        "age": 28
      },
      {
        "name": "Robin Hranáč",
        "position": "DF",
        "club": "TSG Hoffenheim",
        "age": 26
      },
      {
        "name": "Štěpán Chaloupek",
        "position": "DF",
        "club": "Slavia Prague",
        "age": 23
      },
      {
        "name": "Tomáš Souček",
        "position": "MF",
        "club": "West Ham United",
        "age": 31
      },
      {
        "name": "Vladimír Darida",
        "position": "MF",
        "club": "Hradec Králové",
        "age": 36
      },
      {
        "name": "Lukáš Provod",
        "position": "MF",
        "club": "Slavia Prague",
        "age": 30
      },
      {
        "name": "Michal Sadílek",
        "position": "MF",
        "club": "Slavia Prague",
        "age": 27
      },
      {
        "name": "Pavel Šulc",
        "position": "MF",
        "club": "Lyon",
        "age": 26
      },
      {
        "name": "Lukáš Červ",
        "position": "MF",
        "club": "Viktoria Plzeň",
        "age": 25
      },
      {
        "name": "Hugo Sochůrek",
        "position": "MF",
        "club": "Sparta Prague",
        "age": 18
      },
      {
        "name": "Alexandr Sojka",
        "position": "MF",
        "club": "Viktoria Plzeň",
        "age": 23
      },
      {
        "name": "Patrik Schick",
        "position": "FW",
        "club": "Bayer Leverkusen",
        "age": 30
      },
      {
        "name": "Denis Višinský",
        "position": "FW",
        "club": "Viktoria Plzeň",
        "age": 23
      },
      {
        "name": "Adam Hložek",
        "position": "FW",
        "club": "TSG Hoffenheim",
        "age": 24
      },
      {
        "name": "Jan Kuchta",
        "position": "FW",
        "club": "Sparta Prague",
        "age": 29
      },
      {
        "name": "Tomáš Chorý",
        "position": "FW",
        "club": "Slavia Prague",
        "age": 31
      },
      {
        "name": "Mojmír Chytil",
        "position": "FW",
        "club": "Slavia Prague",
        "age": 27
      }
    ]
  },
  {
    "id": "rsa",
    "code": "za",
    "nameEn": "South Africa",
    "nameTr": "Güney Afrika",
    "fifaRank": 59,
    "group": "A",
    "confederation": "CAF",
    "manager": {
      "name": "Hugo Broos",
      "nationality": "Belgium",
      "age": 72,
      "tenure": "2021–"
    },
    "players": [
      {
        "name": "Ronwen Williams",
        "position": "GK",
        "club": "Mamelodi Sundowns",
        "age": 34
      },
      {
        "name": "Sipho Chaine",
        "position": "GK",
        "club": "Orlando Pirates",
        "age": 30
      },
      {
        "name": "Ricardo Goss",
        "position": "GK",
        "club": "Siwelele",
        "age": 32
      },
      {
        "name": "Thabang Matuludi",
        "position": "DF",
        "club": "Polokwane City",
        "age": 27
      },
      {
        "name": "Khulumani Ndamane",
        "position": "DF",
        "club": "Mamelodi Sundowns",
        "age": 22
      },
      {
        "name": "Aubrey Modiba",
        "position": "DF",
        "club": "Mamelodi Sundowns",
        "age": 31
      },
      {
        "name": "Mbekezeli Mbokazi",
        "position": "DF",
        "club": "Chicago Fire",
        "age": 21
      },
      {
        "name": "Samukele Kabini",
        "position": "DF",
        "club": "Molde",
        "age": 22
      },
      {
        "name": "Khuliso Mudau",
        "position": "DF",
        "club": "Mamelodi Sundowns",
        "age": 31
      },
      {
        "name": "Ime Okon",
        "position": "DF",
        "club": "Hannover 96",
        "age": 22
      },
      {
        "name": "Olwethu Makhanya",
        "position": "DF",
        "club": "Philadelphia Union",
        "age": 22
      },
      {
        "name": "Kamogelo Sebelebele",
        "position": "DF",
        "club": "Orlando Pirates",
        "age": 24
      },
      {
        "name": "Bradley Cross",
        "position": "DF",
        "club": "Kaizer Chiefs",
        "age": 25
      },
      {
        "name": "Nkosinathi Sibisi",
        "position": "DF",
        "club": "Orlando Pirates",
        "age": 31
      },
      {
        "name": "Teboho Mokoena",
        "position": "MF",
        "club": "Mamelodi Sundowns",
        "age": 29
      },
      {
        "name": "Thalente Mbatha",
        "position": "MF",
        "club": "Orlando Pirates",
        "age": 26
      },
      {
        "name": "Sphephelo Sithole",
        "position": "MF",
        "club": "Tondela",
        "age": 27
      },
      {
        "name": "Jayden Adams",
        "position": "MF",
        "club": "Mamelodi Sundowns",
        "age": 25
      },
      {
        "name": "Oswin Appollis",
        "position": "FW",
        "club": "Orlando Pirates",
        "age": 25
      },
      {
        "name": "Tshepang Moremi",
        "position": "FW",
        "club": "Orlando Pirates",
        "age": 26
      },
      {
        "name": "Lyle Foster",
        "position": "FW",
        "club": "Burnley",
        "age": 26
      },
      {
        "name": "Relebohile Mofokeng",
        "position": "FW",
        "club": "Orlando Pirates",
        "age": 22
      },
      {
        "name": "Themba Zwane",
        "position": "FW",
        "club": "Mamelodi Sundowns",
        "age": 37
      },
      {
        "name": "Thapelo Maseko",
        "position": "FW",
        "club": "AEL Limassol",
        "age": 23
      },
      {
        "name": "Evidence Makgopa",
        "position": "FW",
        "club": "Orlando Pirates",
        "age": 26
      },
      {
        "name": "Iqraam Rayners",
        "position": "FW",
        "club": "Mamelodi Sundowns",
        "age": 31
      }
    ]
  },
  {
    "id": "can",
    "code": "ca",
    "nameEn": "Canada",
    "nameTr": "Kanada",
    "fifaRank": 27,
    "group": "B",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Jesse Marsch",
      "nationality": "USA",
      "age": 51,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Dayne St. Clair",
        "position": "GK",
        "club": "Inter Miami",
        "age": 29
      },
      {
        "name": "Maxime Crépeau",
        "position": "GK",
        "club": "Orlando City",
        "age": 32
      },
      {
        "name": "Owen Goodman",
        "position": "GK",
        "club": "Barnsley",
        "age": 23
      },
      {
        "name": "Alphonso Davies",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 26
      },
      {
        "name": "Alistair Johnston",
        "position": "DF",
        "club": "Celtic",
        "age": 28
      },
      {
        "name": "Luc de Fougerolles",
        "position": "DF",
        "club": "Dender",
        "age": 21
      },
      {
        "name": "Alfie Jones",
        "position": "DF",
        "club": "Middlesbrough",
        "age": 29
      },
      {
        "name": "Joel Waterman",
        "position": "DF",
        "club": "Chicago Fire",
        "age": 30
      },
      {
        "name": "Derek Cornelius",
        "position": "DF",
        "club": "Marseille",
        "age": 29
      },
      {
        "name": "Moïse Bombito",
        "position": "DF",
        "club": "Nice",
        "age": 26
      },
      {
        "name": "Richie Laryea",
        "position": "DF",
        "club": "Toronto FC",
        "age": 31
      },
      {
        "name": "Niko Sigur",
        "position": "DF",
        "club": "Hajduk Split",
        "age": 23
      },
      {
        "name": "Mathieu Choinière",
        "position": "MF",
        "club": "Los Angeles FC",
        "age": 27
      },
      {
        "name": "Stephen Eustáquio",
        "position": "MF",
        "club": "Los Angeles FC",
        "age": 30
      },
      {
        "name": "Ismaël Koné",
        "position": "MF",
        "club": "Sassuolo",
        "age": 24
      },
      {
        "name": "Liam Millar",
        "position": "MF",
        "club": "Hull City",
        "age": 27
      },
      {
        "name": "Jacob Shaffelburg",
        "position": "MF",
        "club": "Los Angeles FC",
        "age": 27
      },
      {
        "name": "Tajon Buchanan",
        "position": "MF",
        "club": "Villarreal",
        "age": 27
      },
      {
        "name": "Ali Ahmed",
        "position": "MF",
        "club": "Norwich City",
        "age": 26
      },
      {
        "name": "Jonathan Osorio",
        "position": "MF",
        "club": "Toronto FC",
        "age": 34
      },
      {
        "name": "Nathan Saliba",
        "position": "MF",
        "club": "Anderlecht",
        "age": 22
      },
      {
        "name": "Marcelo Flores",
        "position": "MF",
        "club": "UANL",
        "age": 23
      },
      {
        "name": "Jonathan David",
        "position": "FW",
        "club": "Juventus",
        "age": 26
      },
      {
        "name": "Cyle Larin",
        "position": "FW",
        "club": "Southampton",
        "age": 31
      },
      {
        "name": "Tani Oluwaseyi",
        "position": "FW",
        "club": "Villarreal",
        "age": 26
      },
      {
        "name": "Promise David",
        "position": "FW",
        "club": "Union Saint-Gilloise",
        "age": 25
      }
    ]
  },
  {
    "id": "sui",
    "code": "ch",
    "nameEn": "Switzerland",
    "nameTr": "İsviçre",
    "fifaRank": 19,
    "group": "B",
    "confederation": "UEFA",
    "manager": {
      "name": "Murat Yakin",
      "nationality": "Switzerland",
      "age": 50,
      "tenure": "2021–"
    },
    "players": [
      {
        "name": "Manuel Akanji",
        "position": "DF",
        "club": "Inter Milan",
        "age": 31
      },
      {
        "name": "Luca Jaquez",
        "position": "DF",
        "club": "VfB Stuttgart",
        "age": 23
      },
      {
        "name": "Miro Muheim",
        "position": "DF",
        "club": "Hamburger SV",
        "age": 28
      },
      {
        "name": "Silvan Widmer",
        "position": "DF",
        "club": "Mainz 05",
        "age": 33
      },
      {
        "name": "Nico Elvedi",
        "position": "DF",
        "club": "Borussia Mönchengladbach",
        "age": 30
      },
      {
        "name": "Ricardo Rodriguez",
        "position": "DF",
        "club": "Betis",
        "age": 34
      },
      {
        "name": "Eray Cömert",
        "position": "DF",
        "club": "Valencia",
        "age": 28
      },
      {
        "name": "Aurèle Amenda",
        "position": "DF",
        "club": "Eintracht Frankfurt",
        "age": 23
      },
      {
        "name": "Denis Zakaria",
        "position": "MF",
        "club": "Monaco",
        "age": 30
      },
      {
        "name": "Remo Freuler",
        "position": "MF",
        "club": "Bologna",
        "age": 34
      },
      {
        "name": "Johan Manzambi",
        "position": "MF",
        "club": "SC Freiburg",
        "age": 21
      },
      {
        "name": "Granit Xhaka",
        "position": "MF",
        "club": "Sunderland",
        "age": 34
      },
      {
        "name": "Ardon Jashari",
        "position": "MF",
        "club": "Milan",
        "age": 24
      },
      {
        "name": "Djibril Sow",
        "position": "MF",
        "club": "Sevilla",
        "age": 29
      },
      {
        "name": "Christian Fassnacht",
        "position": "MF",
        "club": "Young Boys",
        "age": 33
      },
      {
        "name": "Michel Aebischer",
        "position": "MF",
        "club": "Pisa",
        "age": 29
      },
      {
        "name": "Fabian Rieder",
        "position": "MF",
        "club": "FC Augsburg",
        "age": 24
      },
      {
        "name": "Breel Embolo",
        "position": "FW",
        "club": "Rennes",
        "age": 29
      },
      {
        "name": "Dan Ndoye",
        "position": "FW",
        "club": "Nottingham Forest",
        "age": 26
      },
      {
        "name": "Rubén Vargas",
        "position": "FW",
        "club": "Sevilla",
        "age": 28
      },
      {
        "name": "Noah Okafor",
        "position": "FW",
        "club": "Leeds United",
        "age": 26
      },
      {
        "name": "Zeki Amdouni",
        "position": "FW",
        "club": "Burnley",
        "age": 26
      },
      {
        "name": "Cedric Itten",
        "position": "FW",
        "club": "Fortuna Düsseldorf",
        "age": 30
      },
      {
        "name": "Gregor Kobel",
        "position": "GK",
        "club": "Borussia Dortmund",
        "age": 29
      },
      {
        "name": "Yvon Mvogo",
        "position": "GK",
        "club": "Lorient",
        "age": 32
      },
      {
        "name": "Marvin Keller",
        "position": "GK",
        "club": "Young Boys",
        "age": 24
      }
    ]
  },
  {
    "id": "bih",
    "code": "ba",
    "nameEn": "Bosnia and Herzegovina",
    "nameTr": "Bosna-Hersek",
    "fifaRank": 61,
    "group": "B",
    "confederation": "UEFA",
    "manager": {
      "name": "Sergej Barbarez",
      "nationality": "Bosnia",
      "age": 49,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Nikola Vasilj",
        "position": "GK",
        "club": "FC St. Pauli",
        "age": 31
      },
      {
        "name": "Martin Zlomislić",
        "position": "GK",
        "club": "Rijeka",
        "age": 28
      },
      {
        "name": "Mladen Jurkas",
        "position": "GK",
        "club": "Borac Banja Luka",
        "age": 19
      },
      {
        "name": "Sead Kolašinac",
        "position": "DF",
        "club": "Atalanta",
        "age": 33
      },
      {
        "name": "Amar Dedić",
        "position": "DF",
        "club": "Benfica",
        "age": 24
      },
      {
        "name": "Dennis Hadžikadunić",
        "position": "DF",
        "club": "Sampdoria",
        "age": 28
      },
      {
        "name": "Nikola Katić",
        "position": "DF",
        "club": "Schalke 04",
        "age": 30
      },
      {
        "name": "Tarik Muharemović",
        "position": "DF",
        "club": "Sassuolo",
        "age": 23
      },
      {
        "name": "Nihad Mujakić",
        "position": "DF",
        "club": "Partizan",
        "age": 28
      },
      {
        "name": "Stjepan Radeljić",
        "position": "DF",
        "club": "Rijeka",
        "age": 29
      },
      {
        "name": "Nidal Čelik",
        "position": "DF",
        "club": "Lens",
        "age": 20
      },
      {
        "name": "Amir Hadžiahmetović",
        "position": "MF",
        "club": "Hull City",
        "age": 29
      },
      {
        "name": "Benjamin Tahirović",
        "position": "MF",
        "club": "Brøndby",
        "age": 23
      },
      {
        "name": "Armin Gigović",
        "position": "MF",
        "club": "Young Boys",
        "age": 24
      },
      {
        "name": "Dženis Burnić",
        "position": "MF",
        "club": "Karlsruher SC",
        "age": 28
      },
      {
        "name": "Ivan Bašić",
        "position": "MF",
        "club": "Astana",
        "age": 24
      },
      {
        "name": "Esmir Bajraktarević",
        "position": "MF",
        "club": "PSV",
        "age": 21
      },
      {
        "name": "Amar Memić",
        "position": "MF",
        "club": "Viktoria Plzeň",
        "age": 25
      },
      {
        "name": "Ivan Šunjić",
        "position": "MF",
        "club": "Pafos",
        "age": 30
      },
      {
        "name": "Kerim Alajbegović",
        "position": "MF",
        "club": "Red Bull Salzburg",
        "age": 19
      },
      {
        "name": "Ermin Mahmić",
        "position": "MF",
        "club": "Slovan Liberec",
        "age": 21
      },
      {
        "name": "Ermedin Demirović",
        "position": "FW",
        "club": "VfB Stuttgart",
        "age": 28
      },
      {
        "name": "Edin Džeko",
        "position": "FW",
        "club": "Schalke 04",
        "age": 40
      },
      {
        "name": "Samed Baždar",
        "position": "FW",
        "club": "Jagiellonia Białystok",
        "age": 22
      },
      {
        "name": "Haris Tabaković",
        "position": "FW",
        "club": "Borussia Mönchengladbach",
        "age": 32
      },
      {
        "name": "Jovo Lukić",
        "position": "FW",
        "club": "Universitatea Cluj",
        "age": 28
      }
    ]
  },
  {
    "id": "qat",
    "code": "qa",
    "nameEn": "Qatar",
    "nameTr": "Katar",
    "fifaRank": 35,
    "group": "B",
    "confederation": "AFC",
    "manager": {
      "name": "Julen Lopetegui Argote",
      "nationality": "Spain",
      "age": 59,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Mahmud Abunada",
        "position": "GK",
        "club": "Al-Rayyan",
        "age": 26
      },
      {
        "name": "Salah Zakaria",
        "position": "GK",
        "club": "Al-Duhail",
        "age": 27
      },
      {
        "name": "Meshaal Barsham",
        "position": "GK",
        "club": "Al-Sadd",
        "age": 28
      },
      {
        "name": "Pedro Miguel",
        "position": "DF",
        "club": "Al-Sadd",
        "age": 36
      },
      {
        "name": "Lucas Mendes",
        "position": "DF",
        "club": "Al-Wakrah",
        "age": 36
      },
      {
        "name": "Issa Laye",
        "position": "DF",
        "club": "Al-Arabi",
        "age": 29
      },
      {
        "name": "Ayoub Al-Oui",
        "position": "DF",
        "club": "Al-Gharafa",
        "age": 21
      },
      {
        "name": "Homam Ahmed",
        "position": "DF",
        "club": "Cultural Leonesa",
        "age": 27
      },
      {
        "name": "Boualem Khoukhi",
        "position": "DF",
        "club": "Al-Sadd",
        "age": 36
      },
      {
        "name": "Sultan Al-Brake",
        "position": "DF",
        "club": "Al-Duhail",
        "age": 30
      },
      {
        "name": "Al-Hashmi Al-Hussain",
        "position": "DF",
        "club": "Al-Arabi",
        "age": 23
      },
      {
        "name": "Jassem Gaber",
        "position": "MF",
        "club": "Al-Rayyan",
        "age": 24
      },
      {
        "name": "Abdulaziz Hatem",
        "position": "MF",
        "club": "Al-Rayyan",
        "age": 36
      },
      {
        "name": "Karim Boudiaf",
        "position": "MF",
        "club": "Al-Duhail",
        "age": 36
      },
      {
        "name": "Ahmed Fathy",
        "position": "MF",
        "club": "Al-Arabi",
        "age": 33
      },
      {
        "name": "Assim Madibo",
        "position": "MF",
        "club": "Al-Wakrah",
        "age": 30
      },
      {
        "name": "Tahsin Jamshid",
        "position": "MF",
        "club": "Al-Duhail",
        "age": 20
      },
      {
        "name": "Mohamed Al-Mannai",
        "position": "MF",
        "club": "Al-Shamal",
        "age": 23
      },
      {
        "name": "Ahmed Alaaeldin",
        "position": "FW",
        "club": "Al-Rayyan",
        "age": 33
      },
      {
        "name": "Edmilson Junior",
        "position": "FW",
        "club": "Al-Duhail",
        "age": 32
      },
      {
        "name": "Mohammed Muntari",
        "position": "FW",
        "club": "Al-Gharafa",
        "age": 33
      },
      {
        "name": "Hassan Al-Haydos",
        "position": "FW",
        "club": "Al-Sadd",
        "age": 36
      },
      {
        "name": "Akram Afif",
        "position": "FW",
        "club": "Al-Sadd",
        "age": 30
      },
      {
        "name": "Yusuf Abdurisag",
        "position": "FW",
        "club": "Al-Wakrah",
        "age": 27
      },
      {
        "name": "Ahmed Al-Ganehi",
        "position": "FW",
        "club": "Al-Gharafa",
        "age": 26
      },
      {
        "name": "Almoez Ali",
        "position": "FW",
        "club": "Al-Duhail",
        "age": 30
      }
    ]
  },
  {
    "id": "bra",
    "code": "br",
    "nameEn": "Brazil",
    "nameTr": "Brezilya",
    "fifaRank": 5,
    "group": "C",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Carlo Ancelotti",
      "nationality": "Italy",
      "age": 67,
      "tenure": "2026–"
    },
    "players": [
      {
        "name": "Alisson",
        "position": "GK",
        "club": "Liverpool",
        "age": 34
      },
      {
        "name": "Ederson",
        "position": "GK",
        "club": "Fenerbahçe",
        "age": 33
      },
      {
        "name": "Weverton",
        "position": "GK",
        "club": "Palmeiras",
        "age": 39
      },
      {
        "name": "Gabriel Magalhães",
        "position": "DF",
        "club": "Arsenal",
        "age": 29
      },
      {
        "name": "Marquinhos",
        "position": "DF",
        "club": "Paris Saint-Germain",
        "age": 32
      },
      {
        "name": "Danilo Luiz",
        "position": "DF",
        "club": "Juventus",
        "age": 35
      },
      {
        "name": "Bremer",
        "position": "DF",
        "club": "Juventus",
        "age": 29
      },
      {
        "name": "Wesley",
        "position": "DF",
        "club": "Al-Nassr",
        "age": 23
      },
      {
        "name": "Alex Sandro",
        "position": "DF",
        "club": "Flamengo",
        "age": 35
      },
      {
        "name": "Léo Pereira",
        "position": "DF",
        "club": "Flamengo",
        "age": 30
      },
      {
        "name": "Douglas Santos",
        "position": "DF",
        "club": "Zenit Saint Petersburg",
        "age": 32
      },
      {
        "name": "Roger Ibañez",
        "position": "DF",
        "club": "Al-Ahli",
        "age": 28
      },
      {
        "name": "Casemiro",
        "position": "MF",
        "club": "Manchester United",
        "age": 34
      },
      {
        "name": "Bruno Guimarães",
        "position": "MF",
        "club": "Newcastle United",
        "age": 29
      },
      {
        "name": "Fabinho",
        "position": "MF",
        "club": "Al-Ittihad",
        "age": 33
      },
      {
        "name": "Danilo Santos",
        "position": "MF",
        "club": "Botafogo",
        "age": 25
      },
      {
        "name": "Lucas Paquetá",
        "position": "MF",
        "club": "Flamengo",
        "age": 29
      },
      {
        "name": "Vinícius Júnior",
        "position": "FW",
        "club": "Real Madrid",
        "age": 26
      },
      {
        "name": "Raphinha",
        "position": "FW",
        "club": "Barcelona",
        "age": 30
      },
      {
        "name": "Endrick",
        "position": "FW",
        "club": "Real Madrid",
        "age": 20
      },
      {
        "name": "Gabriel Martinelli",
        "position": "FW",
        "club": "Arsenal",
        "age": 25
      },
      {
        "name": "Matheus Cunha",
        "position": "FW",
        "club": "Wolverhampton Wanderers",
        "age": 27
      },
      {
        "name": "Neymar",
        "position": "FW",
        "club": "Santos",
        "age": 34
      },
      {
        "name": "Luiz Henrique",
        "position": "FW",
        "club": "Botafogo",
        "age": 25
      },
      {
        "name": "Igor Thiago",
        "position": "FW",
        "club": "Brentford",
        "age": 25
      },
      {
        "name": "Rayan",
        "position": "FW",
        "club": "Bournemouth",
        "age": 20
      }
    ]
  },
  {
    "id": "sco",
    "code": "gb-sct",
    "nameEn": "Scotland",
    "nameTr": "İskoçya",
    "fifaRank": 36,
    "group": "C",
    "confederation": "UEFA",
    "manager": {
      "name": "Steve Clarke",
      "nationality": "Scotland",
      "age": 62,
      "tenure": "2019–"
    },
    "players": [
      {
        "name": "Angus Gunn",
        "position": "GK",
        "club": "Nottingham Forest",
        "age": 30
      },
      {
        "name": "Liam Kelly",
        "position": "GK",
        "club": "Rangers",
        "age": 30
      },
      {
        "name": "Craig Gordon",
        "position": "GK",
        "club": "Heart of Midlothian",
        "age": 44
      },
      {
        "name": "Andy Robertson",
        "position": "DF",
        "club": "Liverpool",
        "age": 32
      },
      {
        "name": "Aaron Hickey",
        "position": "DF",
        "club": "Brentford",
        "age": 24
      },
      {
        "name": "Grant Hanley",
        "position": "DF",
        "club": "Hibernian",
        "age": 35
      },
      {
        "name": "Jack Hendry",
        "position": "DF",
        "club": "Al-Ettifaq",
        "age": 31
      },
      {
        "name": "John Souttar",
        "position": "DF",
        "club": "Rangers",
        "age": 30
      },
      {
        "name": "Dominic Hyam",
        "position": "DF",
        "club": "Wrexham",
        "age": 31
      },
      {
        "name": "Nathan Patterson",
        "position": "DF",
        "club": "Everton",
        "age": 25
      },
      {
        "name": "Anthony Ralston",
        "position": "DF",
        "club": "Celtic",
        "age": 28
      },
      {
        "name": "Scott McKenna",
        "position": "DF",
        "club": "Dinamo Zagreb",
        "age": 30
      },
      {
        "name": "Kieran Tierney",
        "position": "DF",
        "club": "Celtic",
        "age": 29
      },
      {
        "name": "Tyler Fletcher",
        "position": "MF",
        "club": "Manchester United",
        "age": 19
      },
      {
        "name": "Ryan Christie",
        "position": "MF",
        "club": "Bournemouth",
        "age": 31
      },
      {
        "name": "Ben Gannon-Doak",
        "position": "MF",
        "club": "Bournemouth",
        "age": 21
      },
      {
        "name": "Kenny McLean",
        "position": "MF",
        "club": "Norwich City",
        "age": 34
      },
      {
        "name": "Findlay Curtis",
        "position": "MF",
        "club": "Kilmarnock",
        "age": 20
      },
      {
        "name": "John McGinn",
        "position": "MF",
        "club": "Aston Villa",
        "age": 32
      },
      {
        "name": "Scott McTominay",
        "position": "MF",
        "club": "Napoli",
        "age": 30
      },
      {
        "name": "Lewis Ferguson",
        "position": "MF",
        "club": "Bologna",
        "age": 27
      },
      {
        "name": "Lyndon Dykes",
        "position": "FW",
        "club": "Charlton Athletic",
        "age": 31
      },
      {
        "name": "George Hirst",
        "position": "FW",
        "club": "Ipswich Town",
        "age": 27
      },
      {
        "name": "Lawrence Shankland",
        "position": "FW",
        "club": "Heart of Midlothian",
        "age": 31
      },
      {
        "name": "Ché Adams",
        "position": "FW",
        "club": "Torino",
        "age": 30
      },
      {
        "name": "Ross Stewart",
        "position": "FW",
        "club": "Southampton",
        "age": 30
      }
    ]
  },
  {
    "id": "mar",
    "code": "ma",
    "nameEn": "Morocco",
    "nameTr": "Fas",
    "fifaRank": 13,
    "group": "C",
    "confederation": "CAF",
    "manager": {
      "name": "Mohamed Ouahbi",
      "nationality": "Morocco",
      "age": 55,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Yassine Bounou",
        "position": "GK",
        "club": "Al-Hilal",
        "age": 35
      },
      {
        "name": "Munir El Kajoui",
        "position": "GK",
        "club": "RS Berkane",
        "age": 37
      },
      {
        "name": "Ahmed Reda Tagnaouti",
        "position": "GK",
        "club": "AS FAR",
        "age": 30
      },
      {
        "name": "Achraf Hakimi",
        "position": "DF",
        "club": "Paris Saint-Germain",
        "age": 28
      },
      {
        "name": "Nayef Aguerd",
        "position": "DF",
        "club": "Marseille",
        "age": 30
      },
      {
        "name": "Noussair Mazraoui",
        "position": "DF",
        "club": "Manchester United",
        "age": 29
      },
      {
        "name": "Youssef Belammari",
        "position": "DF",
        "club": "Al Ahly",
        "age": 28
      },
      {
        "name": "Anass Salah-Eddine",
        "position": "DF",
        "club": "PSV",
        "age": 24
      },
      {
        "name": "Chadi Riad",
        "position": "DF",
        "club": "Crystal Palace",
        "age": 23
      },
      {
        "name": "Issa Diop",
        "position": "DF",
        "club": "Fulham",
        "age": 29
      },
      {
        "name": "Zakaria El Ouahdi",
        "position": "DF",
        "club": "Genk",
        "age": 25
      },
      {
        "name": "Redouane Halhal",
        "position": "DF",
        "club": "Mechelen",
        "age": 23
      },
      {
        "name": "Bilal El Khannouss",
        "position": "MF",
        "club": "VfB Stuttgart",
        "age": 22
      },
      {
        "name": "Neil El Aynaoui",
        "position": "MF",
        "club": "Roma",
        "age": 25
      },
      {
        "name": "Sofyan Amrabat",
        "position": "MF",
        "club": "Betis",
        "age": 30
      },
      {
        "name": "Azzedine Ounahi",
        "position": "MF",
        "club": "Girona",
        "age": 26
      },
      {
        "name": "Ismael Saibari",
        "position": "MF",
        "club": "PSV",
        "age": 25
      },
      {
        "name": "Samir El Mourabet",
        "position": "MF",
        "club": "Strasbourg",
        "age": 20
      },
      {
        "name": "Ayyoub Bouaddi",
        "position": "MF",
        "club": "Lille",
        "age": 19
      },
      {
        "name": "Brahim Díaz",
        "position": "FW",
        "club": "Real Madrid",
        "age": 27
      },
      {
        "name": "Ayoub El Kaabi",
        "position": "FW",
        "club": "Olympiacos",
        "age": 33
      },
      {
        "name": "Abde Ezzalzouli",
        "position": "FW",
        "club": "Betis",
        "age": 25
      },
      {
        "name": "Soufiane Rahimi",
        "position": "FW",
        "club": "Al Ain",
        "age": 30
      },
      {
        "name": "Chemsdine Talbi",
        "position": "FW",
        "club": "Sunderland",
        "age": 21
      },
      {
        "name": "Gessime Yassine",
        "position": "FW",
        "club": "Strasbourg",
        "age": 21
      },
      {
        "name": "Ayoube Amaimouni",
        "position": "FW",
        "club": "Eintracht Frankfurt",
        "age": 22
      }
    ]
  },
  {
    "id": "hti",
    "code": "ht",
    "nameEn": "Haiti",
    "nameTr": "Haiti",
    "fifaRank": 87,
    "group": "C",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Sébastien Migné",
      "nationality": "France",
      "age": 52,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Johny Placide",
        "position": "GK",
        "club": "Bastia",
        "age": 38
      },
      {
        "name": "Alexandre Pierre",
        "position": "GK",
        "club": "Sochaux",
        "age": 25
      },
      {
        "name": "Josué Duverger",
        "position": "GK",
        "club": "Cosmos Koblenz",
        "age": 26
      },
      {
        "name": "Ricardo Adé",
        "position": "DF",
        "club": "LDU Quito",
        "age": 36
      },
      {
        "name": "Carlens Arcus",
        "position": "DF",
        "club": "Angers",
        "age": 30
      },
      {
        "name": "Martin Expérience",
        "position": "DF",
        "club": "Nancy",
        "age": 27
      },
      {
        "name": "Jean-Kévin Duverne",
        "position": "DF",
        "club": "Gent",
        "age": 29
      },
      {
        "name": "Duke Lacroix",
        "position": "DF",
        "club": "Colorado Springs Switchbacks",
        "age": 33
      },
      {
        "name": "Wilguens Paugain",
        "position": "DF",
        "club": "Zulte Waregem",
        "age": 25
      },
      {
        "name": "Hannes Delcroix",
        "position": "DF",
        "club": "Lugano",
        "age": 27
      },
      {
        "name": "Keeto Thermoncy",
        "position": "DF",
        "club": "Young Boys",
        "age": 20
      },
      {
        "name": "Leverton Pierre",
        "position": "MF",
        "club": "Vizela",
        "age": 28
      },
      {
        "name": "Danley Jean Jacques",
        "position": "MF",
        "club": "Philadelphia Union",
        "age": 26
      },
      {
        "name": "Carl Sainté",
        "position": "MF",
        "club": "El Paso Locomotive",
        "age": 24
      },
      {
        "name": "Jean‐Ricner Bellegarde",
        "position": "MF",
        "club": "Wolverhampton Wanderers",
        "age": 28
      },
      {
        "name": "Woodensky Pierre",
        "position": "MF",
        "club": "Violette",
        "age": 22
      },
      {
        "name": "Dominique Simon",
        "position": "MF",
        "club": "Tatran Prešov",
        "age": 26
      },
      {
        "name": "Duckens Nazon",
        "position": "FW",
        "club": "Esteghlal",
        "age": 32
      },
      {
        "name": "Frantzdy Pierrot",
        "position": "FW",
        "club": "AEK Athens",
        "age": 31
      },
      {
        "name": "Derrick Etienne Jr.",
        "position": "FW",
        "club": "Toronto",
        "age": 30
      },
      {
        "name": "Louicius Deedson",
        "position": "FW",
        "club": "Dallas",
        "age": 25
      },
      {
        "name": "Ruben Providence",
        "position": "FW",
        "club": "Almere City",
        "age": 25
      },
      {
        "name": "Josué Casimir",
        "position": "FW",
        "club": "Auxerre",
        "age": 25
      },
      {
        "name": "Yassin Fortuné",
        "position": "FW",
        "club": "Vizela",
        "age": 27
      },
      {
        "name": "Wilson Isidor",
        "position": "FW",
        "club": "Sunderland",
        "age": 26
      },
      {
        "name": "Lenny Joseph",
        "position": "FW",
        "club": "Ferencváros",
        "age": 26
      }
    ]
  },
  {
    "id": "usa",
    "code": "us",
    "nameEn": "United States",
    "nameTr": "Amerika Birleşik Devletleri",
    "fifaRank": 11,
    "group": "D",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Mauricio Pochettino",
      "nationality": "Argentina",
      "age": 53,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Matt Turner",
        "position": "GK",
        "club": "New England Revolution",
        "age": 32
      },
      {
        "name": "Matt Freese",
        "position": "GK",
        "club": "New York City",
        "age": 28
      },
      {
        "name": "Chris Brady",
        "position": "GK",
        "club": "Chicago Fire",
        "age": 22
      },
      {
        "name": "Sergiño Dest",
        "position": "DF",
        "club": "PSV",
        "age": 26
      },
      {
        "name": "Chris Richards",
        "position": "DF",
        "club": "Crystal Palace",
        "age": 26
      },
      {
        "name": "Antonee Robinson",
        "position": "DF",
        "club": "Fulham",
        "age": 29
      },
      {
        "name": "Auston Trusty",
        "position": "DF",
        "club": "Celtic",
        "age": 28
      },
      {
        "name": "Miles Robinson",
        "position": "DF",
        "club": "FC Cincinnati",
        "age": 29
      },
      {
        "name": "Tim Ream",
        "position": "DF",
        "club": "Charlotte FC",
        "age": 39
      },
      {
        "name": "Alex Freeman",
        "position": "DF",
        "club": "Villarreal",
        "age": 22
      },
      {
        "name": "Maximilian Arfsten",
        "position": "DF",
        "club": "Columbus Crew",
        "age": 25
      },
      {
        "name": "Mark McKenzie",
        "position": "DF",
        "club": "Toulouse",
        "age": 27
      },
      {
        "name": "Joe Scally",
        "position": "DF",
        "club": "Borussia Mönchengladbach",
        "age": 24
      },
      {
        "name": "Weston McKennie",
        "position": "MF",
        "club": "Juventus",
        "age": 28
      },
      {
        "name": "Malik Tillman",
        "position": "MF",
        "club": "Bayer Leverkusen",
        "age": 24
      },
      {
        "name": "Tyler Adams",
        "position": "MF",
        "club": "Bournemouth",
        "age": 27
      },
      {
        "name": "Giovanni Reyna",
        "position": "MF",
        "club": "Borussia Mönchengladbach",
        "age": 24
      },
      {
        "name": "Sebastian Berhalter",
        "position": "MF",
        "club": "Vancouver Whitecaps",
        "age": 25
      },
      {
        "name": "Cristian Roldan",
        "position": "MF",
        "club": "Seattle Sounders",
        "age": 31
      },
      {
        "name": "Ricardo Pepi",
        "position": "FW",
        "club": "PSV",
        "age": 23
      },
      {
        "name": "Christian Pulisic",
        "position": "FW",
        "club": "Milan",
        "age": 28
      },
      {
        "name": "Brenden Aaronson",
        "position": "FW",
        "club": "Leeds United",
        "age": 26
      },
      {
        "name": "Haji Wright",
        "position": "FW",
        "club": "Coventry City",
        "age": 28
      },
      {
        "name": "Folarin Balogun",
        "position": "FW",
        "club": "Monaco",
        "age": 25
      },
      {
        "name": "Timothy Weah",
        "position": "FW",
        "club": "Marseille",
        "age": 26
      },
      {
        "name": "Alejandro Zendejas",
        "position": "FW",
        "club": "América",
        "age": 28
      }
    ]
  },
  {
    "id": "par",
    "code": "py",
    "nameEn": "Paraguay",
    "nameTr": "Paraguay",
    "fifaRank": 52,
    "group": "D",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Alfaro",
      "nationality": "Argentina",
      "age": 52,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Gatito Fernández",
        "position": "GK",
        "club": "Cerro Porteño",
        "age": 38
      },
      {
        "name": "Orlando Gill",
        "position": "GK",
        "club": "San Lorenzo",
        "age": 26
      },
      {
        "name": "Santiago Rojas",
        "position": "GK",
        "club": "Nacional",
        "age": 30
      },
      {
        "name": "Gustavo Gómez",
        "position": "DF",
        "club": "Palmeiras",
        "age": 33
      },
      {
        "name": "Júnior Alonso",
        "position": "DF",
        "club": "Atlético Mineiro",
        "age": 33
      },
      {
        "name": "Fabián Balbuena",
        "position": "DF",
        "club": "Grêmio",
        "age": 35
      },
      {
        "name": "Omar Alderete",
        "position": "DF",
        "club": "Sunderland",
        "age": 30
      },
      {
        "name": "Juan Cáceres",
        "position": "DF",
        "club": "Dynamo Moscow",
        "age": 26
      },
      {
        "name": "Gustavo Velázquez",
        "position": "DF",
        "club": "Cerro Porteño",
        "age": 35
      },
      {
        "name": "Mateo Gamarra",
        "position": "DF",
        "club": "Cruzeiro",
        "age": 33
      },
      {
        "name": "José Canale",
        "position": "DF",
        "club": "Lanús",
        "age": 30
      },
      {
        "name": "Diego León",
        "position": "DF",
        "club": "Manchester United",
        "age": 19
      },
      {
        "name": "Alexandro Maidana",
        "position": "DF",
        "club": "Talleres",
        "age": 21
      },
      {
        "name": "Alcides Benítez",
        "position": "DF",
        "club": "Belgrano",
        "age": 24
      },
      {
        "name": "Diego Gómez",
        "position": "MF",
        "club": "Brighton &amp; Hove Albion",
        "age": 23
      },
      {
        "name": "Miguel Almirón",
        "position": "MF",
        "club": "Atlanta United",
        "age": 32
      },
      {
        "name": "Andrés Cubas",
        "position": "MF",
        "club": "Vancouver Whitecaps",
        "age": 30
      },
      {
        "name": "Ramón Sosa",
        "position": "MF",
        "club": "Palmeiras",
        "age": 27
      },
      {
        "name": "Damián Bobadilla",
        "position": "MF",
        "club": "São Paulo",
        "age": 25
      },
      {
        "name": "Braian Ojeda",
        "position": "MF",
        "club": "Orlando City",
        "age": 26
      },
      {
        "name": "Matías Galarza",
        "position": "MF",
        "club": "Atlanta United",
        "age": 24
      },
      {
        "name": "Maurício",
        "position": "MF",
        "club": "Palmeiras",
        "age": 24
      },
      {
        "name": "Alejandro Romero Gamarra",
        "position": "FW",
        "club": "Al Ain",
        "age": 31
      },
      {
        "name": "Antonio Sanabria",
        "position": "FW",
        "club": "Cremonese",
        "age": 30
      },
      {
        "name": "Julio César Enciso",
        "position": "FW",
        "club": "Strasbourg",
        "age": 22
      },
      {
        "name": "Gabriel Ávalos",
        "position": "FW",
        "club": "Independiente",
        "age": 35
      },
      {
        "name": "Carlos González",
        "position": "FW",
        "club": "Independiente del Valle",
        "age": 33
      },
      {
        "name": "Álex Arce",
        "position": "FW",
        "club": "LDU Quito",
        "age": 30
      }
    ]
  },
  {
    "id": "aus",
    "code": "au",
    "nameEn": "Australia",
    "nameTr": "Avustralya",
    "fifaRank": 24,
    "group": "D",
    "confederation": "AFC",
    "manager": {
      "name": "Tony Popovic",
      "nationality": "Australia",
      "age": 51,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Mathew Ryan",
        "position": "GK",
        "club": "Levante",
        "age": 34
      },
      {
        "name": "Paul Izzo",
        "position": "GK",
        "club": "Randers",
        "age": 31
      },
      {
        "name": "Patrick Beach",
        "position": "GK",
        "club": "Melbourne City",
        "age": 23
      },
      {
        "name": "Jordan Bos",
        "position": "DF",
        "club": "Feyenoord",
        "age": 24
      },
      {
        "name": "Miloš Degenek",
        "position": "DF",
        "club": "APOEL",
        "age": 32
      },
      {
        "name": "Alessandro Circati",
        "position": "DF",
        "club": "Parma",
        "age": 23
      },
      {
        "name": "Aziz Behich",
        "position": "DF",
        "club": "Melbourne City",
        "age": 36
      },
      {
        "name": "Harry Souttar",
        "position": "DF",
        "club": "Leicester City",
        "age": 28
      },
      {
        "name": "Cameron Burgess",
        "position": "DF",
        "club": "Swansea City",
        "age": 31
      },
      {
        "name": "Jacob Italiano",
        "position": "DF",
        "club": "Grazer AK",
        "age": 25
      },
      {
        "name": "Jason Geria",
        "position": "DF",
        "club": "Albirex Niigata",
        "age": 33
      },
      {
        "name": "Lucas Herrington",
        "position": "DF",
        "club": "Colorado Rapids",
        "age": 19
      },
      {
        "name": "Kai Trewin",
        "position": "DF",
        "club": "New York City",
        "age": 25
      },
      {
        "name": "Connor Metcalfe",
        "position": "MF",
        "club": "FC St. Pauli",
        "age": 27
      },
      {
        "name": "Ajdin Hrustić",
        "position": "MF",
        "club": "Heracles Almelo",
        "age": 30
      },
      {
        "name": "Aiden O'Neill",
        "position": "MF",
        "club": "New York City",
        "age": 28
      },
      {
        "name": "Cameron Devlin",
        "position": "MF",
        "club": "Heart of Midlothian",
        "age": 28
      },
      {
        "name": "Paul Okon-Engstler",
        "position": "MF",
        "club": "Sydney FC",
        "age": 21
      },
      {
        "name": "Jackson Irvine",
        "position": "MF",
        "club": "FC St. Pauli",
        "age": 33
      },
      {
        "name": "Mathew Leckie",
        "position": "FW",
        "club": "Melbourne City",
        "age": 35
      },
      {
        "name": "Mohamed Touré",
        "position": "FW",
        "club": "Norwich City",
        "age": 22
      },
      {
        "name": "Nestory Irankunda",
        "position": "FW",
        "club": "Watford",
        "age": 20
      },
      {
        "name": "Nishan Velupillay",
        "position": "FW",
        "club": "Melbourne Victory",
        "age": 25
      },
      {
        "name": "Awer Mabil",
        "position": "FW",
        "club": "Castellón",
        "age": 31
      },
      {
        "name": "Brandon Borrello",
        "position": "FW",
        "club": "Western Sydney Wanderers",
        "age": 31
      },
      {
        "name": "Cristian Volpato",
        "position": "FW",
        "club": "Sassuolo",
        "age": 23
      }
    ]
  },
  {
    "id": "tur",
    "code": "tr",
    "nameEn": "Türkiye",
    "nameTr": "Türkiye",
    "fifaRank": 26,
    "group": "D",
    "confederation": "UEFA",
    "manager": {
      "name": "Vincenzo Montella",
      "nationality": "Italy",
      "age": 51,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Uğurcan Çakır",
        "position": "GK",
        "club": "Galatasaray",
        "age": 30
      },
      {
        "name": "Mert Günok",
        "position": "GK",
        "club": "Fenerbahçe",
        "age": 37
      },
      {
        "name": "Altay Bayındır",
        "position": "GK",
        "club": "Manchester United",
        "age": 28
      },
      {
        "name": "Merih Demiral",
        "position": "DF",
        "club": "Al-Ahli",
        "age": 28
      },
      {
        "name": "Zeki Çelik",
        "position": "DF",
        "club": "Roma",
        "age": 29
      },
      {
        "name": "Çağlar Söyüncü",
        "position": "DF",
        "club": "Fenerbahçe",
        "age": 30
      },
      {
        "name": "Mert Müldür",
        "position": "DF",
        "club": "Fenerbahçe",
        "age": 27
      },
      {
        "name": "Ferdi Kadıoğlu",
        "position": "DF",
        "club": "Brighton &amp; Hove Albion",
        "age": 27
      },
      {
        "name": "Ozan Kabak",
        "position": "DF",
        "club": "TSG Hoffenheim",
        "age": 26
      },
      {
        "name": "Abdülkerim Bardakcı",
        "position": "DF",
        "club": "Galatasaray",
        "age": 32
      },
      {
        "name": "Eren Elmalı",
        "position": "DF",
        "club": "Trabzonspor",
        "age": 26
      },
      {
        "name": "Samet Akaydin",
        "position": "DF",
        "club": "Çaykur Rizespor",
        "age": 32
      },
      {
        "name": "Hakan Çalhanoğlu",
        "position": "MF",
        "club": "Inter Milan",
        "age": 32
      },
      {
        "name": "Kaan Ayhan",
        "position": "MF",
        "club": "Galatasaray",
        "age": 32
      },
      {
        "name": "Orkun Kökçü",
        "position": "MF",
        "club": "Beşiktaş",
        "age": 26
      },
      {
        "name": "Salih Özcan",
        "position": "MF",
        "club": "Borussia Dortmund",
        "age": 28
      },
      {
        "name": "İsmail Yüksek",
        "position": "MF",
        "club": "Fenerbahçe",
        "age": 27
      },
      {
        "name": "Kerem Aktürkoğlu",
        "position": "FW",
        "club": "Fenerbahçe",
        "age": 28
      },
      {
        "name": "Barış Alper Yılmaz",
        "position": "FW",
        "club": "Galatasaray",
        "age": 26
      },
      {
        "name": "Arda Güler",
        "position": "FW",
        "club": "Real Madrid",
        "age": 21
      },
      {
        "name": "Kenan Yıldız",
        "position": "FW",
        "club": "Juventus",
        "age": 21
      },
      {
        "name": "Yunus Akgün",
        "position": "FW",
        "club": "Galatasaray",
        "age": 26
      },
      {
        "name": "Oğuz Aydın",
        "position": "FW",
        "club": "Fenerbahçe",
        "age": 26
      },
      {
        "name": "Deniz Gül",
        "position": "FW",
        "club": "Porto",
        "age": 22
      },
      {
        "name": "Can Uzun",
        "position": "FW",
        "club": "Eintracht Frankfurt",
        "age": 21
      },
      {
        "name": "İrfan Can Kahveci",
        "position": "FW",
        "club": "Kasımpaşa",
        "age": 31
      }
    ]
  },
  {
    "id": "ger",
    "code": "de",
    "nameEn": "Germany",
    "nameTr": "Almanya",
    "fifaRank": 8,
    "group": "E",
    "confederation": "UEFA",
    "manager": {
      "name": "Julian Nagelsmann",
      "nationality": "Germany",
      "age": 38,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Manuel Neuer",
        "position": "GK",
        "club": "Bayern Munich",
        "age": 40
      },
      {
        "name": "Alexander Nübel",
        "position": "GK",
        "club": "VfB Stuttgart",
        "age": 30
      },
      {
        "name": "Oliver Baumann",
        "position": "GK",
        "club": "TSG Hoffenheim",
        "age": 36
      },
      {
        "name": "Antonio Rüdiger",
        "position": "DF",
        "club": "Real Madrid",
        "age": 33
      },
      {
        "name": "Waldemar Anton",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 30
      },
      {
        "name": "Jonathan Tah",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 30
      },
      {
        "name": "Pascal Groß",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 35
      },
      {
        "name": "Nico Schlotterbeck",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 27
      },
      {
        "name": "Nathaniel Brown",
        "position": "DF",
        "club": "Eintracht Frankfurt",
        "age": 23
      },
      {
        "name": "David Raum",
        "position": "DF",
        "club": "RB Leipzig",
        "age": 28
      },
      {
        "name": "Malick Thiaw",
        "position": "DF",
        "club": "Newcastle United",
        "age": 25
      },
      {
        "name": "Aleksandar Pavlović",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 22
      },
      {
        "name": "Joshua Kimmich",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 31
      },
      {
        "name": "Leon Goretzka",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 31
      },
      {
        "name": "Jamie Leweling",
        "position": "MF",
        "club": "VfB Stuttgart",
        "age": 25
      },
      {
        "name": "Jamal Musiala",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 23
      },
      {
        "name": "Angelo Stiller",
        "position": "MF",
        "club": "VfB Stuttgart",
        "age": 25
      },
      {
        "name": "Florian Wirtz",
        "position": "MF",
        "club": "Bayer Leverkusen",
        "age": 23
      },
      {
        "name": "Felix Nmecha",
        "position": "MF",
        "club": "Borussia Dortmund",
        "age": 26
      },
      {
        "name": "Lennart Karl",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 18
      },
      {
        "name": "Leroy Sané",
        "position": "MF",
        "club": "Galatasaray",
        "age": 30
      },
      {
        "name": "Nadiem Amiri",
        "position": "MF",
        "club": "Mainz 05",
        "age": 30
      },
      {
        "name": "Kai Havertz",
        "position": "FW",
        "club": "Arsenal",
        "age": 27
      },
      {
        "name": "Nick Woltemade",
        "position": "FW",
        "club": "VfB Stuttgart",
        "age": 24
      },
      {
        "name": "Maximilian Beier",
        "position": "FW",
        "club": "Borussia Dortmund",
        "age": 24
      },
      {
        "name": "Deniz Undav",
        "position": "FW",
        "club": "VfB Stuttgart",
        "age": 30
      }
    ]
  },
  {
    "id": "ecu",
    "code": "ec",
    "nameEn": "Ecuador",
    "nameTr": "Ekvador",
    "fifaRank": 30,
    "group": "E",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Sebastián Beccacece",
      "nationality": "Argentina",
      "age": 44,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Moisés Ramírez",
        "position": "GK",
        "club": "Kifisia",
        "age": 26
      },
      {
        "name": "Gonzalo Valle",
        "position": "GK",
        "club": "LDU Quito",
        "age": 30
      },
      {
        "name": "Hernán Galíndez",
        "position": "GK",
        "club": "Huracán",
        "age": 39
      },
      {
        "name": "Piero Hincapie",
        "position": "DF",
        "club": "Arsenal",
        "age": 24
      },
      {
        "name": "Willian Pacho",
        "position": "DF",
        "club": "Paris Saint-Germain",
        "age": 25
      },
      {
        "name": "Félix Torres",
        "position": "DF",
        "club": "Internacional",
        "age": 29
      },
      {
        "name": "Joel Ordóñez",
        "position": "DF",
        "club": "Club Brugge",
        "age": 22
      },
      {
        "name": "Pervis Estupiñán",
        "position": "DF",
        "club": "Milan",
        "age": 28
      },
      {
        "name": "Ángelo Preciado",
        "position": "DF",
        "club": "Atlético Mineiro",
        "age": 28
      },
      {
        "name": "Jackson Porozo",
        "position": "DF",
        "club": "Tijuana",
        "age": 26
      },
      {
        "name": "Yaimar Medina",
        "position": "DF",
        "club": "Genk",
        "age": 22
      },
      {
        "name": "Moisés Caicedo",
        "position": "MF",
        "club": "Chelsea",
        "age": 25
      },
      {
        "name": "Jordy Alcívar",
        "position": "MF",
        "club": "Independiente del Valle",
        "age": 27
      },
      {
        "name": "Denil Castillo",
        "position": "MF",
        "club": "Midtjylland",
        "age": 22
      },
      {
        "name": "John Yeboah",
        "position": "MF",
        "club": "Venezia",
        "age": 26
      },
      {
        "name": "Kendry Páez",
        "position": "MF",
        "club": "River Plate",
        "age": 19
      },
      {
        "name": "Alan Franco",
        "position": "MF",
        "club": "Atlético Mineiro",
        "age": 28
      },
      {
        "name": "Alan Minda",
        "position": "MF",
        "club": "Atlético Mineiro",
        "age": 23
      },
      {
        "name": "Pedro Vite",
        "position": "MF",
        "club": "UNAM",
        "age": 24
      },
      {
        "name": "Jeremy Arévalo",
        "position": "FW",
        "club": "VfB Stuttgart",
        "age": 21
      },
      {
        "name": "Gonzalo Plata",
        "position": "FW",
        "club": "Flamengo",
        "age": 26
      },
      {
        "name": "Anthony Valencia",
        "position": "FW",
        "club": "Antwerp",
        "age": 23
      },
      {
        "name": "Kevin Rodríguez",
        "position": "FW",
        "club": "Union Saint-Gilloise",
        "age": 26
      },
      {
        "name": "Jordy Caicedo",
        "position": "FW",
        "club": "Huracán",
        "age": 29
      },
      {
        "name": "Nilson Angulo",
        "position": "FW",
        "club": "Sunderland",
        "age": 23
      },
      {
        "name": "Enner Valencia",
        "position": "FW",
        "club": "Pachuca",
        "age": 37
      }
    ]
  },
  {
    "id": "civ",
    "code": "ci",
    "nameEn": "Ivory Coast",
    "nameTr": "Fildişi Sahili",
    "fifaRank": 38,
    "group": "E",
    "confederation": "CAF",
    "manager": {
      "name": "Emerse Faé",
      "nationality": "Ivory Coast",
      "age": 52,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Yahia Fofana",
        "position": "GK",
        "club": "Angers",
        "age": 26
      },
      {
        "name": "Alban Lafont",
        "position": "GK",
        "club": "Panathinaikos",
        "age": 27
      },
      {
        "name": "Mohamed Koné",
        "position": "GK",
        "club": "Charleroi",
        "age": 24
      },
      {
        "name": "Odilon Kossounou",
        "position": "DF",
        "club": "Atalanta",
        "age": 25
      },
      {
        "name": "Evan Ndicka",
        "position": "DF",
        "club": "Roma",
        "age": 27
      },
      {
        "name": "Ousmane Diomande",
        "position": "DF",
        "club": "Sporting CP",
        "age": 23
      },
      {
        "name": "Emmanuel Agbadou",
        "position": "DF",
        "club": "Beşiktaş",
        "age": 29
      },
      {
        "name": "Ghislain Konan",
        "position": "DF",
        "club": "Gil Vicente",
        "age": 31
      },
      {
        "name": "Wilfried Singo",
        "position": "DF",
        "club": "Monaco",
        "age": 26
      },
      {
        "name": "Guéla Doué",
        "position": "DF",
        "club": "Strasbourg",
        "age": 24
      },
      {
        "name": "Christopher Opéri",
        "position": "DF",
        "club": "Le Havre",
        "age": 29
      },
      {
        "name": "Seko Fofana",
        "position": "MF",
        "club": "Porto",
        "age": 31
      },
      {
        "name": "Franck Kessié",
        "position": "MF",
        "club": "Al-Ahli",
        "age": 30
      },
      {
        "name": "Jean Michaël Seri",
        "position": "MF",
        "club": "Maribor",
        "age": 35
      },
      {
        "name": "Ibrahim Sangaré",
        "position": "MF",
        "club": "Nottingham Forest",
        "age": 29
      },
      {
        "name": "Parfait Guiagon",
        "position": "MF",
        "club": "Charleroi",
        "age": 25
      },
      {
        "name": "Christ Inao Oulaï",
        "position": "MF",
        "club": "Serbest",
        "age": 20
      },
      {
        "name": "Ange-Yoan Bonny",
        "position": "FW",
        "club": "Inter Milan",
        "age": 23
      },
      {
        "name": "Nicolas Pépé",
        "position": "FW",
        "club": "Villarreal",
        "age": 31
      },
      {
        "name": "Oumar Diakité",
        "position": "FW",
        "club": "Cercle Brugge",
        "age": 23
      },
      {
        "name": "Simon Adingra",
        "position": "FW",
        "club": "Monaco",
        "age": 24
      },
      {
        "name": "Evann Guessand",
        "position": "FW",
        "club": "Crystal Palace",
        "age": 25
      },
      {
        "name": "Amad Diallo",
        "position": "FW",
        "club": "Manchester United",
        "age": 24
      },
      {
        "name": "Yan Diomande",
        "position": "FW",
        "club": "RB Leipzig",
        "age": 20
      },
      {
        "name": "Bazoumana Touré",
        "position": "FW",
        "club": "TSG Hoffenheim",
        "age": 20
      },
      {
        "name": "Elye Wahi",
        "position": "FW",
        "club": "Nice",
        "age": 23
      }
    ]
  },
  {
    "id": "cuw",
    "code": "cw",
    "nameEn": "Curaçao",
    "nameTr": "Curaçao",
    "fifaRank": 88,
    "group": "E",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Dick Advocaat",
      "nationality": "Netherlands",
      "age": 77,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Eloy Room",
        "position": "GK",
        "club": "Miami FC",
        "age": 37
      },
      {
        "name": "Trevor Doornbusch",
        "position": "GK",
        "club": "VVV-Venlo",
        "age": 27
      },
      {
        "name": "Tyrick Bodak",
        "position": "GK",
        "club": "Telstar",
        "age": 24
      },
      {
        "name": "Shurandy Sambo",
        "position": "DF",
        "club": "Sparta Rotterdam",
        "age": 25
      },
      {
        "name": "Juriën Gaari",
        "position": "DF",
        "club": "Abha",
        "age": 33
      },
      {
        "name": "Roshon van Eijma",
        "position": "DF",
        "club": "RKC Waalwijk",
        "age": 28
      },
      {
        "name": "Sherel Floranus",
        "position": "DF",
        "club": "PEC Zwolle",
        "age": 28
      },
      {
        "name": "Armando Obispo",
        "position": "DF",
        "club": "PSV",
        "age": 27
      },
      {
        "name": "Riechedly Bazoer",
        "position": "DF",
        "club": "Konyaspor",
        "age": 30
      },
      {
        "name": "Deveron Fonville",
        "position": "DF",
        "club": "NEC",
        "age": 23
      },
      {
        "name": "Joshua Brenet",
        "position": "DF",
        "club": "Serbest",
        "age": 32
      },
      {
        "name": "Godfried Roemeratoe",
        "position": "MF",
        "club": "RKC Waalwijk",
        "age": 27
      },
      {
        "name": "Juninho Bacuna",
        "position": "MF",
        "club": "Volendam",
        "age": 29
      },
      {
        "name": "Livano Comenencia",
        "position": "MF",
        "club": "Zürich",
        "age": 22
      },
      {
        "name": "Leandro Bacuna",
        "position": "MF",
        "club": "Iğdır",
        "age": 35
      },
      {
        "name": "Tyrese Noslin",
        "position": "MF",
        "club": "Telstar",
        "age": 24
      },
      {
        "name": "Ar'jany Martha",
        "position": "MF",
        "club": "Rotherham United",
        "age": 23
      },
      {
        "name": "Kevin Felida",
        "position": "MF",
        "club": "Den Bosch",
        "age": 27
      },
      {
        "name": "Jürgen Locadia",
        "position": "FW",
        "club": "Miami FC",
        "age": 33
      },
      {
        "name": "Jeremy Antonisse",
        "position": "FW",
        "club": "Kifisia",
        "age": 24
      },
      {
        "name": "Sontje Hansen",
        "position": "FW",
        "club": "Middlesbrough",
        "age": 24
      },
      {
        "name": "Kenji Gorré",
        "position": "FW",
        "club": "Maccabi Haifa",
        "age": 32
      },
      {
        "name": "Jearl Margaritha",
        "position": "FW",
        "club": "Beveren",
        "age": 26
      },
      {
        "name": "Brandley Kuwas",
        "position": "FW",
        "club": "Volendam",
        "age": 34
      },
      {
        "name": "Gervane Kastaneer",
        "position": "FW",
        "club": "Terengganu",
        "age": 30
      },
      {
        "name": "Tahith Chong",
        "position": "FW",
        "club": "Sheffield United",
        "age": 27
      }
    ]
  },
  {
    "id": "ned",
    "code": "nl",
    "nameEn": "Netherlands",
    "nameTr": "Hollanda",
    "fifaRank": 7,
    "group": "F",
    "confederation": "UEFA",
    "manager": {
      "name": "Ronald Koeman",
      "nationality": "Netherlands",
      "age": 61,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Bart Verbruggen",
        "position": "GK",
        "club": "Brighton &amp; Hove Albion",
        "age": 24
      },
      {
        "name": "Mark Flekken",
        "position": "GK",
        "club": "Bayer Leverkusen",
        "age": 33
      },
      {
        "name": "Robin Roefs",
        "position": "GK",
        "club": "Sunderland",
        "age": 23
      },
      {
        "name": "Jan Paul van Hecke",
        "position": "DF",
        "club": "Brighton &amp; Hove Albion",
        "age": 26
      },
      {
        "name": "Jurriën Timber",
        "position": "DF",
        "club": "Arsenal",
        "age": 25
      },
      {
        "name": "Virgil van Dijk",
        "position": "DF",
        "club": "Liverpool",
        "age": 35
      },
      {
        "name": "Nathan Aké",
        "position": "DF",
        "club": "Manchester City",
        "age": 31
      },
      {
        "name": "Micky van de Ven",
        "position": "DF",
        "club": "Tottenham Hotspur",
        "age": 25
      },
      {
        "name": "Jorrel Hato",
        "position": "DF",
        "club": "Chelsea",
        "age": 20
      },
      {
        "name": "Denzel Dumfries",
        "position": "DF",
        "club": "Internazionale",
        "age": 30
      },
      {
        "name": "Mats Wieffer",
        "position": "MF",
        "club": "Brighton &amp; Hove Albion",
        "age": 27
      },
      {
        "name": "Ryan Gravenberch",
        "position": "MF",
        "club": "Liverpool",
        "age": 24
      },
      {
        "name": "Tijjani Reijnders",
        "position": "MF",
        "club": "Manchester City",
        "age": 28
      },
      {
        "name": "Marten de Roon",
        "position": "MF",
        "club": "Atalanta",
        "age": 35
      },
      {
        "name": "Teun Koopmeiners",
        "position": "MF",
        "club": "Juventus",
        "age": 28
      },
      {
        "name": "Frenkie de Jong",
        "position": "MF",
        "club": "Barcelona",
        "age": 29
      },
      {
        "name": "Guus Til",
        "position": "MF",
        "club": "PSV Eindhoven",
        "age": 29
      },
      {
        "name": "Quinten Timber",
        "position": "MF",
        "club": "Marseille",
        "age": 25
      },
      {
        "name": "Wout Weghorst",
        "position": "FW",
        "club": "Ajax",
        "age": 34
      },
      {
        "name": "Cody Gakpo",
        "position": "FW",
        "club": "Liverpool",
        "age": 27
      },
      {
        "name": "Donyell Malen",
        "position": "FW",
        "club": "Roma",
        "age": 27
      },
      {
        "name": "Crysencio Summerville",
        "position": "FW",
        "club": "West Ham United",
        "age": 25
      },
      {
        "name": "Justin Kluivert",
        "position": "FW",
        "club": "Bournemouth",
        "age": 27
      },
      {
        "name": "Memphis Depay",
        "position": "FW",
        "club": "Corinthians",
        "age": 32
      },
      {
        "name": "Noa Lang",
        "position": "FW",
        "club": "PSV Eindhoven",
        "age": 27
      },
      {
        "name": "Brian Brobbey",
        "position": "FW",
        "club": "Sunderland",
        "age": 24
      }
    ]
  },
  {
    "id": "jpn",
    "code": "jp",
    "nameEn": "Japan",
    "nameTr": "Japonya",
    "fifaRank": 18,
    "group": "F",
    "confederation": "AFC",
    "manager": {
      "name": "Hajime Moriyasu",
      "nationality": "Japan",
      "age": 56,
      "tenure": "2018–"
    },
    "players": [
      {
        "name": "Zion Suzuki",
        "position": "GK",
        "club": "Parma",
        "age": 24
      },
      {
        "name": "Keisuke Ōsako",
        "position": "GK",
        "club": "Sanfrecce Hiroshima",
        "age": 27
      },
      {
        "name": "Tomoki Hayakawa",
        "position": "GK",
        "club": "Kashima Antlers",
        "age": 27
      },
      {
        "name": "Kō Itakura",
        "position": "DF",
        "club": "Ajax",
        "age": 29
      },
      {
        "name": "Takehiro Tomiyasu",
        "position": "DF",
        "club": "Ajax",
        "age": 28
      },
      {
        "name": "Tsuyoshi Watanabe",
        "position": "DF",
        "club": "Feyenoord",
        "age": 29
      },
      {
        "name": "Hiroki Itō",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 27
      },
      {
        "name": "Yukinari Sugawara",
        "position": "DF",
        "club": "Werder Bremen",
        "age": 26
      },
      {
        "name": "Shōgo Taniguchi",
        "position": "DF",
        "club": "Sint-Truiden",
        "age": 35
      },
      {
        "name": "Yūto Nagatomo",
        "position": "DF",
        "club": "FC Tokyo",
        "age": 40
      },
      {
        "name": "Ayumu Seko",
        "position": "DF",
        "club": "Le Havre",
        "age": 26
      },
      {
        "name": "Junnosuke Suzuki",
        "position": "DF",
        "club": "Copenhagen",
        "age": 23
      },
      {
        "name": "Wataru Endo",
        "position": "MF",
        "club": "Liverpool",
        "age": 33
      },
      {
        "name": "Ao Tanaka",
        "position": "MF",
        "club": "Leeds United",
        "age": 28
      },
      {
        "name": "Takefusa Kubo",
        "position": "MF",
        "club": "Real Sociedad",
        "age": 25
      },
      {
        "name": "Ritsu Dōan",
        "position": "MF",
        "club": "Eintracht Frankfurt",
        "age": 28
      },
      {
        "name": "Keito Nakamura",
        "position": "MF",
        "club": "Reims",
        "age": 26
      },
      {
        "name": "Junya Itō",
        "position": "MF",
        "club": "Genk",
        "age": 33
      },
      {
        "name": "Kaishu Sano",
        "position": "MF",
        "club": "Mainz 05",
        "age": 26
      },
      {
        "name": "Daichi Kamada",
        "position": "MF",
        "club": "Crystal Palace",
        "age": 30
      },
      {
        "name": "Ayase Ueda",
        "position": "FW",
        "club": "Feyenoord",
        "age": 28
      },
      {
        "name": "Keisuke Gotō",
        "position": "FW",
        "club": "Sint-Truiden",
        "age": 21
      },
      {
        "name": "Daizen Maeda",
        "position": "FW",
        "club": "Celtic",
        "age": 29
      },
      {
        "name": "Yuito Suzuki",
        "position": "FW",
        "club": "SC Freiburg",
        "age": 25
      },
      {
        "name": "Kōki Ogawa",
        "position": "FW",
        "club": "NEC",
        "age": 29
      },
      {
        "name": "Kento Shiogai",
        "position": "FW",
        "club": "VfL Wolfsburg",
        "age": 21
      }
    ]
  },
  {
    "id": "swe",
    "code": "se",
    "nameEn": "Sweden",
    "nameTr": "İsveç",
    "fifaRank": 25,
    "group": "F",
    "confederation": "UEFA",
    "manager": {
      "name": "Graham Potter",
      "nationality": "England",
      "age": 51,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Viktor Johansson",
        "position": "GK",
        "club": "Stoke City",
        "age": 27
      },
      {
        "name": "Kristoffer Nordfeldt",
        "position": "GK",
        "club": "AIK",
        "age": 36
      },
      {
        "name": "Jacob Widell Zetterström",
        "position": "GK",
        "club": "Derby County",
        "age": 28
      },
      {
        "name": "Victor Lindelöf",
        "position": "DF",
        "club": "Aston Villa",
        "age": 31
      },
      {
        "name": "Isak Hien",
        "position": "DF",
        "club": "Atalanta",
        "age": 27
      },
      {
        "name": "Carl Starfelt",
        "position": "DF",
        "club": "Celta de Vigo",
        "age": 30
      },
      {
        "name": "Gabriel Gudmundsson",
        "position": "DF",
        "club": "Leeds United",
        "age": 26
      },
      {
        "name": "Hjalmar Ekdal",
        "position": "DF",
        "club": "Burnley",
        "age": 27
      },
      {
        "name": "Emil Holm",
        "position": "DF",
        "club": "Juventus",
        "age": 26
      },
      {
        "name": "Gustaf Lagerbielke",
        "position": "DF",
        "club": "SC Braga",
        "age": 26
      },
      {
        "name": "Eric Smith",
        "position": "DF",
        "club": "St. Pauli",
        "age": 29
      },
      {
        "name": "Daniel Svensson",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 23
      },
      {
        "name": "Elliot Stroud",
        "position": "DF",
        "club": "Mjällby",
        "age": 23
      },
      {
        "name": "Mattias Svanberg",
        "position": "MF",
        "club": "Wolfsburg",
        "age": 27
      },
      {
        "name": "Jesper Karlström",
        "position": "MF",
        "club": "Udinese",
        "age": 30
      },
      {
        "name": "Lucas Bergvall",
        "position": "MF",
        "club": "Tottenham Hotspur",
        "age": 20
      },
      {
        "name": "Yasin Ayari",
        "position": "MF",
        "club": "Brighton & Hove Albion",
        "age": 22
      },
      {
        "name": "Ken Sema",
        "position": "MF",
        "club": "Pafos FC",
        "age": 32
      },
      {
        "name": "Benjamin Nygren",
        "position": "MF",
        "club": "Celtic",
        "age": 24
      },
      {
        "name": "Besfort Zeneli",
        "position": "MF",
        "club": "Union Saint-Gilloise",
        "age": 23
      },
      {
        "name": "Viktor Gyökeres",
        "position": "FW",
        "club": "Arsenal",
        "age": 27
      },
      {
        "name": "Alexander Isak",
        "position": "FW",
        "club": "Liverpool",
        "age": 26
      },
      {
        "name": "Anthony Elanga",
        "position": "FW",
        "club": "Newcastle United",
        "age": 24
      },
      {
        "name": "Gustaf Nilsson",
        "position": "FW",
        "club": "Club Brugge",
        "age": 28
      },
      {
        "name": "Taha Ali",
        "position": "FW",
        "club": "Malmö FF",
        "age": 27
      },
      {
        "name": "Alexander Bernhardsson",
        "position": "FW",
        "club": "Holstein Kiel",
        "age": 27
      }
    ]
  },
  {
    "id": "tun",
    "code": "tn",
    "nameEn": "Tunisia",
    "nameTr": "Tunus",
    "fifaRank": 40,
    "group": "F",
    "confederation": "CAF",
    "manager": {
      "name": "Sabri Lamouchi",
      "nationality": "France",
      "age": 54,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Aymen Dahmen",
        "position": "GK",
        "club": "CS Sfaxien",
        "age": 29
      },
      {
        "name": "Sabri Ben Hessen",
        "position": "GK",
        "club": "Étoile du Sahel",
        "age": 30
      },
      {
        "name": "Mouhib Chamakh",
        "position": "GK",
        "club": "Club Africain",
        "age": 25
      },
      {
        "name": "Montassar Talbi",
        "position": "DF",
        "club": "Lorient",
        "age": 28
      },
      {
        "name": "Dylan Bronn",
        "position": "DF",
        "club": "Servette",
        "age": 31
      },
      {
        "name": "Ali Abdi",
        "position": "DF",
        "club": "Nice",
        "age": 33
      },
      {
        "name": "Yan Valery",
        "position": "DF",
        "club": "Young Boys",
        "age": 27
      },
      {
        "name": "Mohamed Amine Ben Hamida",
        "position": "DF",
        "club": "Espérance de Tunis",
        "age": 31
      },
      {
        "name": "Moutaz Neffati",
        "position": "DF",
        "club": "IFK Norrköping",
        "age": 22
      },
      {
        "name": "Omar Rekik",
        "position": "DF",
        "club": "Maribor",
        "age": 25
      },
      {
        "name": "Adem Arous",
        "position": "DF",
        "club": "ES Tunis",
        "age": 22
      },
      {
        "name": "Raed Chikhaoui",
        "position": "DF",
        "club": "US Monastir",
        "age": 22
      },
      {
        "name": "Ellyes Skhiri",
        "position": "MF",
        "club": "Eintracht Frankfurt",
        "age": 31
      },
      {
        "name": "Hannibal Mejbri",
        "position": "MF",
        "club": "Burnley",
        "age": 23
      },
      {
        "name": "Anis Ben Slimane",
        "position": "MF",
        "club": "Norwich City",
        "age": 25
      },
      {
        "name": "Mortadha Ben Ouanes",
        "position": "MF",
        "club": "Kasımpaşa",
        "age": 32
      },
      {
        "name": "Ismaël Gharbi",
        "position": "MF",
        "club": "FC Augsburg",
        "age": 22
      },
      {
        "name": "Hadj Mahmoud",
        "position": "MF",
        "club": "Lugano",
        "age": 26
      },
      {
        "name": "Rani Khedira",
        "position": "MF",
        "club": "Union Berlin",
        "age": 32
      },
      {
        "name": "Khalil Ayari",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 21
      },
      {
        "name": "Elias Achouri",
        "position": "FW",
        "club": "Copenhagen",
        "age": 27
      },
      {
        "name": "Firas Chaouat",
        "position": "FW",
        "club": "Club Africain",
        "age": 30
      },
      {
        "name": "Hazem Mastouri",
        "position": "FW",
        "club": "Dynamo Makhachkala",
        "age": 29
      },
      {
        "name": "Elias Saad",
        "position": "FW",
        "club": "Hannover 96",
        "age": 27
      },
      {
        "name": "Sebastian Tounekti",
        "position": "FW",
        "club": "Celtic",
        "age": 24
      },
      {
        "name": "Rayan Elloumi",
        "position": "FW",
        "club": "Vancouver Whitecaps",
        "age": 19
      }
    ]
  },
  {
    "id": "bel",
    "code": "be",
    "nameEn": "Belgium",
    "nameTr": "Belçika",
    "fifaRank": 4,
    "group": "G",
    "confederation": "UEFA",
    "manager": {
      "name": "Rudi Garcia",
      "nationality": "France",
      "age": 62,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Thibaut Courtois",
        "position": "GK",
        "club": "Real Madrid",
        "age": 34
      },
      {
        "name": "Senne Lammens",
        "position": "GK",
        "club": "Manchester United",
        "age": 24
      },
      {
        "name": "Mike Penders",
        "position": "GK",
        "club": "Strasbourg",
        "age": 21
      },
      {
        "name": "Zeno Debast",
        "position": "DF",
        "club": "Sporting CP",
        "age": 23
      },
      {
        "name": "Maxim De Cuyper",
        "position": "DF",
        "club": "Brighton &amp; Hove Albion",
        "age": 26
      },
      {
        "name": "Thomas Meunier",
        "position": "DF",
        "club": "Lille",
        "age": 35
      },
      {
        "name": "Timothy Castagne",
        "position": "DF",
        "club": "Fulham",
        "age": 31
      },
      {
        "name": "Arthur Theate",
        "position": "DF",
        "club": "Eintracht Frankfurt",
        "age": 26
      },
      {
        "name": "Brandon Mechele",
        "position": "DF",
        "club": "Club Brugge",
        "age": 33
      },
      {
        "name": "Koni De Winter",
        "position": "DF",
        "club": "Milan",
        "age": 24
      },
      {
        "name": "Joaquin Seys",
        "position": "DF",
        "club": "Club Brugge",
        "age": 21
      },
      {
        "name": "Nathan Ngoy",
        "position": "DF",
        "club": "Lille",
        "age": 23
      },
      {
        "name": "Axel Witsel",
        "position": "MF",
        "club": "Girona",
        "age": 37
      },
      {
        "name": "Kevin De Bruyne",
        "position": "MF",
        "club": "Napoli",
        "age": 35
      },
      {
        "name": "Youri Tielemans",
        "position": "MF",
        "club": "Aston Villa",
        "age": 29
      },
      {
        "name": "Hans Vanaken",
        "position": "MF",
        "club": "Club Brugge",
        "age": 34
      },
      {
        "name": "Amadou Onana",
        "position": "MF",
        "club": "Aston Villa",
        "age": 25
      },
      {
        "name": "Nicolas Raskin",
        "position": "MF",
        "club": "Rangers",
        "age": 25
      },
      {
        "name": "Diego Moreira",
        "position": "MF",
        "club": "Strasbourg",
        "age": 22
      },
      {
        "name": "Leandro Trossard",
        "position": "FW",
        "club": "Arsenal",
        "age": 32
      },
      {
        "name": "Charles De Ketelaere",
        "position": "FW",
        "club": "Atalanta",
        "age": 25
      },
      {
        "name": "Jérémy Doku",
        "position": "FW",
        "club": "Manchester City",
        "age": 24
      },
      {
        "name": "Dodi Lukébakio",
        "position": "FW",
        "club": "Benfica",
        "age": 29
      },
      {
        "name": "Romelu Lukaku",
        "position": "FW",
        "club": "Napoli",
        "age": 33
      },
      {
        "name": "Alexis Saelemaekers",
        "position": "FW",
        "club": "Milan",
        "age": 27
      },
      {
        "name": "Matias Fernandez-Pardo",
        "position": "FW",
        "club": "Lille",
        "age": 21
      }
    ]
  },
  {
    "id": "irn",
    "code": "ir",
    "nameEn": "Iran",
    "nameTr": "İran",
    "fifaRank": 21,
    "group": "G",
    "confederation": "AFC",
    "manager": {
      "name": "Amir Ghalenoei",
      "nationality": "Iran",
      "age": 61,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Alireza Beiranvand",
        "position": "GK",
        "club": "Tractor",
        "age": 34
      },
      {
        "name": "Payam Niazmand",
        "position": "GK",
        "club": "Persepolis",
        "age": 31
      },
      {
        "name": "Hossein Hosseini",
        "position": "GK",
        "club": "Sepahan",
        "age": 34
      },
      {
        "name": "Saleh Hardani",
        "position": "DF",
        "club": "Esteghlal",
        "age": 28
      },
      {
        "name": "Ehsan Hajsafi",
        "position": "DF",
        "club": "Sepahan",
        "age": 36
      },
      {
        "name": "Shojae Khalilzadeh",
        "position": "DF",
        "club": "Tractor",
        "age": 37
      },
      {
        "name": "Milad Mohammadi",
        "position": "DF",
        "club": "Persepolis",
        "age": 33
      },
      {
        "name": "Hossein Kanaanizadegan",
        "position": "DF",
        "club": "Persepolis",
        "age": 32
      },
      {
        "name": "Aria Yousefi",
        "position": "DF",
        "club": "Sepahan",
        "age": 24
      },
      {
        "name": "Ali Nemati",
        "position": "DF",
        "club": "Foolad",
        "age": 30
      },
      {
        "name": "Ramin Rezaeian",
        "position": "DF",
        "club": "Foolad",
        "age": 36
      },
      {
        "name": "Danial Eiri",
        "position": "DF",
        "club": "Malavan",
        "age": 23
      },
      {
        "name": "Saeid Ezatolahi",
        "position": "MF",
        "club": "Shabab Al-Ahli",
        "age": 30
      },
      {
        "name": "Alireza Jahanbakhsh",
        "position": "MF",
        "club": "Dender",
        "age": 33
      },
      {
        "name": "Mohammad Mohebi",
        "position": "MF",
        "club": "Rostov",
        "age": 28
      },
      {
        "name": "Mohammad Ghorbani",
        "position": "MF",
        "club": "Al-Wahda",
        "age": 25
      },
      {
        "name": "Saman Ghoddos",
        "position": "MF",
        "club": "Kalba",
        "age": 33
      },
      {
        "name": "Rouzbeh Cheshmi",
        "position": "MF",
        "club": "Esteghlal",
        "age": 33
      },
      {
        "name": "Mahdi Torabi",
        "position": "MF",
        "club": "Tractor",
        "age": 32
      },
      {
        "name": "Amirmohammad Razzaghinia",
        "position": "MF",
        "club": "Esteghlal",
        "age": 20
      },
      {
        "name": "Amirmohammad Razaghinia",
        "position": "MF",
        "club": "Esteghlal FC",
        "age": 20
      },
      {
        "name": "Mehdi Taremi",
        "position": "FW",
        "club": "Olympiacos",
        "age": 34
      },
      {
        "name": "Mehdi Ghayedi",
        "position": "FW",
        "club": "Al-Nasr",
        "age": 28
      },
      {
        "name": "Amirhossein Hosseinzadeh",
        "position": "FW",
        "club": "Tractor",
        "age": 26
      },
      {
        "name": "Ali Alipour",
        "position": "FW",
        "club": "Persepolis",
        "age": 31
      },
      {
        "name": "Dennis Dargahi",
        "position": "FW",
        "club": "Standard Liège",
        "age": 29
      }
    ]
  },
  {
    "id": "egy",
    "code": "eg",
    "nameEn": "Egypt",
    "nameTr": "Mısır",
    "fifaRank": 33,
    "group": "G",
    "confederation": "CAF",
    "manager": {
      "name": "Hossam Hassan",
      "nationality": "Egypt",
      "age": 58,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Mohamed El Shenawy",
        "position": "GK",
        "club": "Al Ahly",
        "age": 38
      },
      {
        "name": "Mostafa Shobeir",
        "position": "GK",
        "club": "Al Ahly",
        "age": 26
      },
      {
        "name": "Mohamed Alaa",
        "position": "GK",
        "club": "El Gouna",
        "age": 27
      },
      {
        "name": "Ramy Rabia",
        "position": "DF",
        "club": "Al Ain",
        "age": 33
      },
      {
        "name": "Mohamed Hany",
        "position": "DF",
        "club": "Al Ahly",
        "age": 30
      },
      {
        "name": "Ahmed Abou El Fotouh",
        "position": "DF",
        "club": "Zamalek",
        "age": 28
      },
      {
        "name": "Mohamed Abdelmonem",
        "position": "DF",
        "club": "Nice",
        "age": 27
      },
      {
        "name": "Yasser Ibrahim",
        "position": "DF",
        "club": "Al Ahly",
        "age": 33
      },
      {
        "name": "Hossam Abdelmaguid",
        "position": "DF",
        "club": "Zamalek",
        "age": 25
      },
      {
        "name": "Karim Hafez",
        "position": "DF",
        "club": "Pyramids",
        "age": 30
      },
      {
        "name": "Tarek Alaa",
        "position": "DF",
        "club": "ZED",
        "age": 24
      },
      {
        "name": "Hamdy Fathy",
        "position": "MF",
        "club": "Al-Wakrah",
        "age": 32
      },
      {
        "name": "Marwan Attia",
        "position": "MF",
        "club": "Al Ahly",
        "age": 28
      },
      {
        "name": "Emam Ashour",
        "position": "MF",
        "club": "Al Ahly",
        "age": 28
      },
      {
        "name": "Mohanad Lasheen",
        "position": "MF",
        "club": "Pyramids",
        "age": 30
      },
      {
        "name": "Mahmoud Saber",
        "position": "MF",
        "club": "ZED",
        "age": 25
      },
      {
        "name": "Nabil Donga",
        "position": "MF",
        "club": "Al-Najma",
        "age": 30
      },
      {
        "name": "Mostafa Ziko",
        "position": "MF",
        "club": "Pyramids",
        "age": 29
      },
      {
        "name": "Mohamed Salah",
        "position": "FW",
        "club": "Liverpool",
        "age": 34
      },
      {
        "name": "Omar Marmoush",
        "position": "FW",
        "club": "Manchester City",
        "age": 27
      },
      {
        "name": "Hamza Abdelkarim",
        "position": "FW",
        "club": "Barcelona B",
        "age": 18
      },
      {
        "name": "Trézéguet",
        "position": "FW",
        "club": "Al Ahly",
        "age": 32
      },
      {
        "name": "Zizo",
        "position": "FW",
        "club": "Al Ahly",
        "age": 30
      },
      {
        "name": "Ibrahim Adel",
        "position": "FW",
        "club": "Nordsjælland",
        "age": 25
      },
      {
        "name": "Haissem Hassan",
        "position": "FW",
        "club": "Oviedo",
        "age": 24
      }
    ]
  },
  {
    "id": "nzl",
    "code": "nz",
    "nameEn": "New Zealand",
    "nameTr": "Yeni Zelanda",
    "fifaRank": 94,
    "group": "G",
    "confederation": "OFC",
    "manager": {
      "name": "Darren Bazeley",
      "nationality": "England",
      "age": 53,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Max Crocombe",
        "position": "GK",
        "club": "Millwall",
        "age": 32
      },
      {
        "name": "Alex Paulsen",
        "position": "GK",
        "club": "Lechia Gdańsk",
        "age": 23
      },
      {
        "name": "Michael Woud",
        "position": "GK",
        "club": "Auckland FC",
        "age": 27
      },
      {
        "name": "Tyler Bindon",
        "position": "DF",
        "club": "Nottingham Forest",
        "age": 21
      },
      {
        "name": "Michael Boxall",
        "position": "DF",
        "club": "Minnesota United",
        "age": 37
      },
      {
        "name": "Liberato Cacace",
        "position": "DF",
        "club": "Wrexham",
        "age": 25
      },
      {
        "name": "Francis de Vries",
        "position": "DF",
        "club": "Auckland FC",
        "age": 31
      },
      {
        "name": "Callan Elliot",
        "position": "DF",
        "club": "Auckland FC",
        "age": 26
      },
      {
        "name": "Tim Payne",
        "position": "DF",
        "club": "Wellington Phoenix",
        "age": 32
      },
      {
        "name": "Nando Pijnaker",
        "position": "DF",
        "club": "Auckland FC",
        "age": 27
      },
      {
        "name": "Tommy Smith",
        "position": "DF",
        "club": "Braintree Town",
        "age": 36
      },
      {
        "name": "Finn Surman",
        "position": "DF",
        "club": "Portland Timbers",
        "age": 22
      },
      {
        "name": "Lachlan Bayliss",
        "position": "MF",
        "club": "Newcastle Jets",
        "age": 23
      },
      {
        "name": "Joe Bell",
        "position": "MF",
        "club": "Viking FK",
        "age": 27
      },
      {
        "name": "Matt Garbett",
        "position": "MF",
        "club": "Peterborough United",
        "age": 24
      },
      {
        "name": "Eli Just",
        "position": "MF",
        "club": "Motherwell",
        "age": 26
      },
      {
        "name": "Callum McCowatt",
        "position": "MF",
        "club": "Silkeborg IF",
        "age": 27
      },
      {
        "name": "Ben Old",
        "position": "MF",
        "club": "Saint-Étienne",
        "age": 23
      },
      {
        "name": "Alex Rufer",
        "position": "MF",
        "club": "Wellington Phoenix",
        "age": 30
      },
      {
        "name": "Marko Stamenic",
        "position": "MF",
        "club": "Swansea City",
        "age": 24
      },
      {
        "name": "Sarpreet Singh",
        "position": "MF",
        "club": "Wellington Phoenix",
        "age": 27
      },
      {
        "name": "Ryan Thomas",
        "position": "MF",
        "club": "PEC Zwolle",
        "age": 31
      },
      {
        "name": "Kosta Barbarouses",
        "position": "FW",
        "club": "Western Sydney Wanderers",
        "age": 36
      },
      {
        "name": "Jesse Randall",
        "position": "FW",
        "club": "Auckland FC",
        "age": 23
      },
      {
        "name": "Ben Waine",
        "position": "FW",
        "club": "Port Vale",
        "age": 25
      },
      {
        "name": "Chris Wood",
        "position": "FW",
        "club": "Nottingham Forest",
        "age": 34
      }
    ]
  },
  {
    "id": "esp",
    "code": "es",
    "nameEn": "Spain",
    "nameTr": "İspanya",
    "fifaRank": 3,
    "group": "H",
    "confederation": "UEFA",
    "manager": {
      "name": "Luis de la Fuente",
      "nationality": "Spain",
      "age": 54,
      "tenure": "2022–"
    },
    "players": [
      {
        "name": "David Raya",
        "position": "GK",
        "club": "Arsenal",
        "age": 31
      },
      {
        "name": "Unai Simón",
        "position": "GK",
        "club": "Athletic Bilbao",
        "age": 29
      },
      {
        "name": "Joan Garcia",
        "position": "GK",
        "club": "Espanyol",
        "age": 25
      },
      {
        "name": "Marc Cucurella",
        "position": "DF",
        "club": "Chelsea",
        "age": 28
      },
      {
        "name": "Eric García",
        "position": "DF",
        "club": "Barcelona",
        "age": 25
      },
      {
        "name": "Pedro Porro",
        "position": "DF",
        "club": "Tottenham Hotspur",
        "age": 27
      },
      {
        "name": "Álex Grimaldo",
        "position": "DF",
        "club": "Bayer Leverkusen",
        "age": 31
      },
      {
        "name": "Pau Cubarsí",
        "position": "DF",
        "club": "Barcelona",
        "age": 19
      },
      {
        "name": "Aymeric Laporte",
        "position": "DF",
        "club": "Al-Nassr",
        "age": 32
      },
      {
        "name": "Marcos Llorente",
        "position": "DF",
        "club": "Atlético Madrid",
        "age": 31
      },
      {
        "name": "Marc Pubill",
        "position": "DF",
        "club": "Almería",
        "age": 23
      },
      {
        "name": "Rodri",
        "position": "MF",
        "club": "Manchester City",
        "age": 30
      },
      {
        "name": "Dani Olmo",
        "position": "MF",
        "club": "Barcelona",
        "age": 28
      },
      {
        "name": "Mikel Merino",
        "position": "MF",
        "club": "Arsenal",
        "age": 30
      },
      {
        "name": "Fabián Ruiz",
        "position": "MF",
        "club": "Paris Saint-Germain",
        "age": 30
      },
      {
        "name": "Pedri",
        "position": "MF",
        "club": "Barcelona",
        "age": 24
      },
      {
        "name": "Gavi",
        "position": "MF",
        "club": "Barcelona",
        "age": 22
      },
      {
        "name": "Martín Zubimendi",
        "position": "MF",
        "club": "Real Sociedad",
        "age": 27
      },
      {
        "name": "Álex Baena",
        "position": "MF",
        "club": "Villarreal",
        "age": 25
      },
      {
        "name": "Ferran Torres",
        "position": "FW",
        "club": "Barcelona",
        "age": 26
      },
      {
        "name": "Lamine Yamal",
        "position": "FW",
        "club": "Barcelona",
        "age": 19
      },
      {
        "name": "Mikel Oyarzabal",
        "position": "FW",
        "club": "Real Sociedad",
        "age": 29
      },
      {
        "name": "Nico Williams",
        "position": "FW",
        "club": "Athletic Bilbao",
        "age": 24
      },
      {
        "name": "Yéremy Pino",
        "position": "FW",
        "club": "Villarreal",
        "age": 24
      },
      {
        "name": "Borja Iglesias",
        "position": "FW",
        "club": "Celta Vigo",
        "age": 33
      },
      {
        "name": "Víctor Muñoz",
        "position": "FW",
        "club": "Osasuna",
        "age": 23
      }
    ]
  },
  {
    "id": "uru",
    "code": "uy",
    "nameEn": "Uruguay",
    "nameTr": "Uruguay",
    "fifaRank": 10,
    "group": "H",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Marcelo Bielsa",
      "nationality": "Argentina",
      "age": 70,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Sergio Rochet",
        "position": "GK",
        "club": "Internacional",
        "age": 33
      },
      {
        "name": "Santiago Mele",
        "position": "GK",
        "club": "Monterrey",
        "age": 29
      },
      {
        "name": "Fernando Muslera",
        "position": "GK",
        "club": "Estudiantes",
        "age": 40
      },
      {
        "name": "Ronald Araújo",
        "position": "DF",
        "club": "Barcelona",
        "age": 27
      },
      {
        "name": "José María Giménez",
        "position": "DF",
        "club": "Atlético Madrid",
        "age": 31
      },
      {
        "name": "Sebastián Cáceres",
        "position": "DF",
        "club": "América",
        "age": 27
      },
      {
        "name": "Guillermo Varela",
        "position": "DF",
        "club": "Flamengo",
        "age": 33
      },
      {
        "name": "Mathías Olivera",
        "position": "DF",
        "club": "Napoli",
        "age": 29
      },
      {
        "name": "Matías Viña",
        "position": "DF",
        "club": "River Plate",
        "age": 29
      },
      {
        "name": "Santiago Bueno",
        "position": "DF",
        "club": "Wolverhampton Wanderers",
        "age": 28
      },
      {
        "name": "Joaquín Piquerez",
        "position": "DF",
        "club": "Palmeiras",
        "age": 28
      },
      {
        "name": "Federico Valverde",
        "position": "MF",
        "club": "Real Madrid",
        "age": 28
      },
      {
        "name": "Maximiliano Araújo",
        "position": "MF",
        "club": "Sporting CP",
        "age": 26
      },
      {
        "name": "Rodrigo Bentancur",
        "position": "MF",
        "club": "Tottenham Hotspur",
        "age": 29
      },
      {
        "name": "Manuel Ugarte",
        "position": "MF",
        "club": "Manchester United",
        "age": 25
      },
      {
        "name": "Juan Manuel Sanabria",
        "position": "MF",
        "club": "Real Salt Lake",
        "age": 26
      },
      {
        "name": "Nicolás de la Cruz",
        "position": "MF",
        "club": "Flamengo",
        "age": 29
      },
      {
        "name": "Emiliano Martínez",
        "position": "MF",
        "club": "Palmeiras",
        "age": 27
      },
      {
        "name": "Giorgian de Arrascaeta",
        "position": "MF",
        "club": "Flamengo",
        "age": 32
      },
      {
        "name": "Rodrigo Zalazar",
        "position": "MF",
        "club": "Braga",
        "age": 27
      },
      {
        "name": "Darwin Núñez",
        "position": "FW",
        "club": "Al-Hilal",
        "age": 27
      },
      {
        "name": "Facundo Pellistri",
        "position": "FW",
        "club": "Panathinaikos",
        "age": 25
      },
      {
        "name": "Agustín Canobbio",
        "position": "FW",
        "club": "Fluminense",
        "age": 28
      },
      {
        "name": "Brian Rodríguez",
        "position": "FW",
        "club": "América",
        "age": 26
      },
      {
        "name": "Federico Viñas",
        "position": "FW",
        "club": "Oviedo",
        "age": 28
      },
      {
        "name": "Agustín Álvarez",
        "position": "FW",
        "club": "Monza",
        "age": 25
      }
    ]
  },
  {
    "id": "ksa",
    "code": "sa",
    "nameEn": "Saudi Arabia",
    "nameTr": "Suudi Arabistan",
    "fifaRank": 56,
    "group": "H",
    "confederation": "AFC",
    "manager": {
      "name": "Georgios Donis",
      "nationality": "Greece",
      "age": 56,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Nawaf Al-Aqidi",
        "position": "GK",
        "club": "Al-Nassr",
        "age": 26
      },
      {
        "name": "Mohammed Al-Owais",
        "position": "GK",
        "club": "Al-Ula",
        "age": 35
      },
      {
        "name": "Ahmed Al-Kassar",
        "position": "GK",
        "club": "Al-Qadsiah",
        "age": 35
      },
      {
        "name": "Ali Majrashi",
        "position": "DF",
        "club": "Al-Ahli",
        "age": 27
      },
      {
        "name": "Ali Lajami",
        "position": "DF",
        "club": "Al-Hilal",
        "age": 30
      },
      {
        "name": "Abdulelah Al-Amri",
        "position": "DF",
        "club": "Al-Nassr",
        "age": 29
      },
      {
        "name": "Hassan Al-Tambakti",
        "position": "DF",
        "club": "Al-Hilal",
        "age": 27
      },
      {
        "name": "Saud Abdulhamid",
        "position": "DF",
        "club": "Lens",
        "age": 27
      },
      {
        "name": "Nawaf Boushal",
        "position": "DF",
        "club": "Al-Nassr",
        "age": 27
      },
      {
        "name": "Hassan Kadesh",
        "position": "DF",
        "club": "Al-Ittihad",
        "age": 34
      },
      {
        "name": "Moteb Al-Harbi",
        "position": "DF",
        "club": "Al-Hilal",
        "age": 26
      },
      {
        "name": "Mohammed Abu Al-Shamat",
        "position": "DF",
        "club": "Al-Qadsiah",
        "age": 24
      },
      {
        "name": "Jehad Thakri",
        "position": "DF",
        "club": "Al-Qadsiah",
        "age": 25
      },
      {
        "name": "Nasser Al-Dawsari",
        "position": "MF",
        "club": "Al-Hilal",
        "age": 28
      },
      {
        "name": "Musab Al-Juwayr",
        "position": "MF",
        "club": "Al-Qadsiah",
        "age": 23
      },
      {
        "name": "Salem Al-Dawsari",
        "position": "MF",
        "club": "Al-Hilal",
        "age": 35
      },
      {
        "name": "Abdullah Al-Khaibari",
        "position": "MF",
        "club": "Al-Nassr",
        "age": 30
      },
      {
        "name": "Sultan Mandash",
        "position": "MF",
        "club": "Al-Hilal",
        "age": 32
      },
      {
        "name": "Mohamed Kanno",
        "position": "MF",
        "club": "Al-Hilal",
        "age": 32
      },
      {
        "name": "Alaa Al-Hejji",
        "position": "MF",
        "club": "Neom",
        "age": 31
      },
      {
        "name": "Saleh Abu Al-Shamat",
        "position": "MF",
        "club": "Al-Ahli",
        "age": 24
      },
      {
        "name": "Firas Al-Buraikan",
        "position": "FW",
        "club": "Al-Ahli",
        "age": 26
      },
      {
        "name": "Saleh Al-Shehri",
        "position": "FW",
        "club": "Al-Ittihad",
        "age": 33
      },
      {
        "name": "Abdullah Al-Hamdan",
        "position": "FW",
        "club": "Al-Nassr",
        "age": 27
      },
      {
        "name": "Khalid Al-Ghannam",
        "position": "FW",
        "club": "Al-Ettifaq",
        "age": 26
      },
      {
        "name": "Aiman Yahya",
        "position": "FW",
        "club": "Al-Nassr",
        "age": 25
      }
    ]
  },
  {
    "id": "cpv",
    "code": "cv",
    "nameEn": "Cape Verde",
    "nameTr": "Yeşil Burun Adaları",
    "fifaRank": 65,
    "group": "H",
    "confederation": "CAF",
    "manager": {
      "name": "Pedro Leitao Brito",
      "nationality": "Cape Verde",
      "age": 56,
      "tenure": "2020–"
    },
    "players": [
      {
        "name": "Vozinha",
        "position": "GK",
        "club": "Chaves",
        "age": 40
      },
      {
        "name": "Márcio Rosa",
        "position": "GK",
        "club": "Montana",
        "age": 29
      },
      {
        "name": "CJ dos Santos",
        "position": "GK",
        "club": "San Diego",
        "age": 26
      },
      {
        "name": "Sidny Lopes Cabral",
        "position": "DF",
        "club": "Benfica",
        "age": 23
      },
      {
        "name": "Stopira",
        "position": "DF",
        "club": "Torreense",
        "age": 38
      },
      {
        "name": "Pico",
        "position": "DF",
        "club": "Shamrock Rovers",
        "age": 34
      },
      {
        "name": "João Paulo",
        "position": "DF",
        "club": "FCSB",
        "age": 28
      },
      {
        "name": "Diney",
        "position": "DF",
        "club": "Al Bataeh",
        "age": 31
      },
      {
        "name": "Logan Costa",
        "position": "DF",
        "club": "Villarreal",
        "age": 25
      },
      {
        "name": "Steven Moreira",
        "position": "DF",
        "club": "Columbus Crew",
        "age": 32
      },
      {
        "name": "Wagner Pina",
        "position": "DF",
        "club": "Estoril",
        "age": 24
      },
      {
        "name": "Kelvin Pires",
        "position": "DF",
        "club": "SJK",
        "age": 26
      },
      {
        "name": "Jamiro Monteiro",
        "position": "MF",
        "club": "PEC Zwolle",
        "age": 33
      },
      {
        "name": "Kevin Pina",
        "position": "MF",
        "club": "Krasnodar",
        "age": 29
      },
      {
        "name": "Deroy Duarte",
        "position": "MF",
        "club": "Ludogorets Razgrad",
        "age": 27
      },
      {
        "name": "Telmo Arcanjo",
        "position": "MF",
        "club": "Vitória de Guimarães",
        "age": 25
      },
      {
        "name": "Laros Duarte",
        "position": "MF",
        "club": "Puskás Akadémia",
        "age": 29
      },
      {
        "name": "Yannick Semedo",
        "position": "MF",
        "club": "Farense",
        "age": 31
      },
      {
        "name": "Ryan Mendes",
        "position": "FW",
        "club": "Iğdır",
        "age": 36
      },
      {
        "name": "Garry Rodrigues",
        "position": "FW",
        "club": "Apollon Limassol",
        "age": 36
      },
      {
        "name": "Willy Semedo",
        "position": "FW",
        "club": "Omonia",
        "age": 32
      },
      {
        "name": "Jovane Cabral",
        "position": "FW",
        "club": "Estrela Amadora",
        "age": 28
      },
      {
        "name": "Benchimol",
        "position": "FW",
        "club": "Akron Tolyatti",
        "age": 25
      },
      {
        "name": "Dailon Livramento",
        "position": "FW",
        "club": "Casa Pia",
        "age": 25
      },
      {
        "name": "Hélio Varela",
        "position": "FW",
        "club": "Maccabi Tel Aviv",
        "age": 24
      },
      {
        "name": "Nuno da Costa",
        "position": "FW",
        "club": "Kasımpaşa",
        "age": 35
      }
    ]
  },
  {
    "id": "fra",
    "code": "fr",
    "nameEn": "France",
    "nameTr": "Fransa",
    "fifaRank": 2,
    "group": "I",
    "confederation": "UEFA",
    "manager": {
      "name": "Didier Deschamps",
      "nationality": "France",
      "age": 56,
      "tenure": "2012–"
    },
    "players": [
      {
        "name": "Lucas Hernandez",
        "position": "DF",
        "club": "Paris Saint-Germain",
        "age": 30
      },
      {
        "name": "Lucas Digne",
        "position": "DF",
        "club": "Aston Villa",
        "age": 33
      },
      {
        "name": "Maxence Lacroix",
        "position": "DF",
        "club": "Crystal Palace",
        "age": 26
      },
      {
        "name": "Manu Koné",
        "position": "MF",
        "club": "Roma",
        "age": 25
      },
      {
        "name": "Aurélien Tchouaméni",
        "position": "MF",
        "club": "Real Madrid",
        "age": 26
      },
      {
        "name": "Warren Zaïre-Emery",
        "position": "MF",
        "club": "Paris Saint-Germain",
        "age": 20
      },
      {
        "name": "N'Golo Kanté",
        "position": "MF",
        "club": "Al-Ittihad",
        "age": 35
      },
      {
        "name": "Adrien Rabiot",
        "position": "MF",
        "club": "Milan",
        "age": 31
      },
      {
        "name": "Ousmane Dembélé",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 29
      },
      {
        "name": "Marcus Thuram",
        "position": "FW",
        "club": "Inter Milan",
        "age": 29
      },
      {
        "name": "Kylian Mbappé",
        "position": "FW",
        "club": "Real Madrid",
        "age": 28
      },
      {
        "name": "Michael Olise",
        "position": "FW",
        "club": "Bayern Munich",
        "age": 25
      },
      {
        "name": "Bradley Barcola",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 24
      },
      {
        "name": "Désiré Doué",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 21
      },
      {
        "name": "Jean-Philippe Mateta",
        "position": "FW",
        "club": "Crystal Palace",
        "age": 29
      },
      {
        "name": "Rayan Cherki",
        "position": "FW",
        "club": "Lyon",
        "age": 23
      },
      {
        "name": "Maghnes Akliouche",
        "position": "FW",
        "club": "Monaco",
        "age": 24
      },
      {
        "name": "Brice Samba",
        "position": "GK",
        "club": "Lens",
        "age": 32
      },
      {
        "name": "Mike Maignan",
        "position": "GK",
        "club": "Milan",
        "age": 31
      },
      {
        "name": "Robin Risser",
        "position": "GK",
        "club": "Strasbourg",
        "age": 22
      },
      {
        "name": "Malo Gusto",
        "position": "DF",
        "club": "Chelsea",
        "age": 23
      },
      {
        "name": "Dayot Upamecano",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 28
      },
      {
        "name": "Jules Koundé",
        "position": "DF",
        "club": "Barcelona",
        "age": 28
      },
      {
        "name": "Ibrahima Konaté",
        "position": "DF",
        "club": "Liverpool",
        "age": 27
      },
      {
        "name": "William Saliba",
        "position": "DF",
        "club": "Arsenal",
        "age": 25
      },
      {
        "name": "Théo Hernandez",
        "position": "DF",
        "club": "AC Milan",
        "age": 29
      }
    ]
  },
  {
    "id": "nor",
    "code": "no",
    "nameEn": "Norway",
    "nameTr": "Norveç",
    "fifaRank": 45,
    "group": "I",
    "confederation": "UEFA",
    "manager": {
      "name": "Ståle Solbakken",
      "nationality": "Norway",
      "age": 56,
      "tenure": "2020–"
    },
    "players": [
      {
        "name": "Ørjan Nyland",
        "position": "GK",
        "club": "Sevilla",
        "age": 36
      },
      {
        "name": "Sander Tangvik",
        "position": "GK",
        "club": "Hamburg",
        "age": 24
      },
      {
        "name": "Egil Selvik",
        "position": "GK",
        "club": "Watford",
        "age": 29
      },
      {
        "name": "Julian Ryerson",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 29
      },
      {
        "name": "Kristoffer Vassbakk Ajer",
        "position": "DF",
        "club": "Brentford",
        "age": 28
      },
      {
        "name": "Leo Østigård",
        "position": "DF",
        "club": "Genoa",
        "age": 27
      },
      {
        "name": "David Møller Wolfe",
        "position": "DF",
        "club": "Wolverhampton Wanderers",
        "age": 24
      },
      {
        "name": "Fredrik André Bjørkan",
        "position": "DF",
        "club": "Bodø/Glimt",
        "age": 28
      },
      {
        "name": "Marcus Holmgren Pedersen",
        "position": "DF",
        "club": "Torino",
        "age": 26
      },
      {
        "name": "Torbjørn Heggem",
        "position": "DF",
        "club": "Bologna",
        "age": 27
      },
      {
        "name": "Sondre Langås",
        "position": "DF",
        "club": "Derby County",
        "age": 25
      },
      {
        "name": "Henrik Falchener",
        "position": "DF",
        "club": "Viking",
        "age": 23
      },
      {
        "name": "Martin Ødegaard",
        "position": "MF",
        "club": "Arsenal",
        "age": 28
      },
      {
        "name": "Fredrik Aursnes",
        "position": "MF",
        "club": "Benfica",
        "age": 31
      },
      {
        "name": "Andreas Schjelderup",
        "position": "MF",
        "club": "Benfica",
        "age": 22
      },
      {
        "name": "Morten Thorsby",
        "position": "MF",
        "club": "Cremonese",
        "age": 30
      },
      {
        "name": "Patrick Berg",
        "position": "MF",
        "club": "Bodø/Glimt",
        "age": 29
      },
      {
        "name": "Sander Berge",
        "position": "MF",
        "club": "Fulham",
        "age": 28
      },
      {
        "name": "Kristian Thorstvedt",
        "position": "MF",
        "club": "Sassuolo",
        "age": 27
      },
      {
        "name": "Thelo Aasgaard",
        "position": "MF",
        "club": "Rangers",
        "age": 24
      },
      {
        "name": "Antonio Nusa",
        "position": "MF",
        "club": "RB Leipzig",
        "age": 21
      },
      {
        "name": "Oscar Bobb",
        "position": "MF",
        "club": "Fulham",
        "age": 23
      },
      {
        "name": "Jens Petter Hauge",
        "position": "MF",
        "club": "Bodø/Glimt",
        "age": 27
      },
      {
        "name": "Erling Braut Haaland",
        "position": "FW",
        "club": "Manchester City",
        "age": 26
      },
      {
        "name": "Alexander Sørloth",
        "position": "FW",
        "club": "Atlético Madrid",
        "age": 31
      },
      {
        "name": "Jørgen Strand Larsen",
        "position": "FW",
        "club": "Crystal Palace",
        "age": 26
      }
    ]
  },
  {
    "id": "irq",
    "code": "iq",
    "nameEn": "Iraq",
    "nameTr": "Irak",
    "fifaRank": 58,
    "group": "I",
    "confederation": "AFC",
    "manager": {
      "name": "Graham Arnold",
      "nationality": "Australia",
      "age": 62,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Fahad Talib",
        "position": "GK",
        "club": "Al-Talaba",
        "age": 32
      },
      {
        "name": "Jalal Hassan",
        "position": "GK",
        "club": "Al-Zawraa",
        "age": 35
      },
      {
        "name": "Ahmed Basil",
        "position": "GK",
        "club": "Al-Shorta",
        "age": 30
      },
      {
        "name": "Rebin Ghareeb",
        "position": "DF",
        "club": "Port",
        "age": 34
      },
      {
        "name": "Zaid Tahseen",
        "position": "DF",
        "club": "Pakhtakor",
        "age": 25
      },
      {
        "name": "Akam Hashim",
        "position": "DF",
        "club": "Al-Zawraa",
        "age": 28
      },
      {
        "name": "Manaf Younis",
        "position": "DF",
        "club": "Al-Shorta",
        "age": 30
      },
      {
        "name": "Mustafa Saadoon",
        "position": "DF",
        "club": "Al-Shorta",
        "age": 25
      },
      {
        "name": "Ahmed Yahya",
        "position": "DF",
        "club": "Al-Shorta",
        "age": 31
      },
      {
        "name": "Frans Putros",
        "position": "DF",
        "club": "Persib",
        "age": 33
      },
      {
        "name": "Merchas Doski",
        "position": "DF",
        "club": "Viktoria Plzeň",
        "age": 27
      },
      {
        "name": "Hussein Ali",
        "position": "DF",
        "club": "Pogoń Szczecin",
        "age": 24
      },
      {
        "name": "Ahmed Qasem",
        "position": "MF",
        "club": "Nashville SC",
        "age": 23
      },
      {
        "name": "Zidane Iqbal",
        "position": "MF",
        "club": "Utrecht",
        "age": 23
      },
      {
        "name": "Kevin Yakob",
        "position": "MF",
        "club": "AGF",
        "age": 26
      },
      {
        "name": "Aimar Sher",
        "position": "MF",
        "club": "Sarpsborg",
        "age": 24
      },
      {
        "name": "Marko Farji",
        "position": "MF",
        "club": "Venezia",
        "age": 22
      },
      {
        "name": "Zaid Ismail",
        "position": "MF",
        "club": "Al-Talaba",
        "age": 24
      },
      {
        "name": "Peter Gwargis",
        "position": "MF",
        "club": "Duhok",
        "age": 26
      },
      {
        "name": "Ibrahim Bayesh",
        "position": "MF",
        "club": "Al-Riyadh",
        "age": 26
      },
      {
        "name": "Amir Al-Ammari",
        "position": "MF",
        "club": "Cracovia",
        "age": 29
      },
      {
        "name": "Ali Jasim",
        "position": "FW",
        "club": "Como",
        "age": 22
      },
      {
        "name": "Ali Yousif",
        "position": "FW",
        "club": "Al-Talaba",
        "age": 30
      },
      {
        "name": "Ali Al-Hamadi",
        "position": "FW",
        "club": "Ipswich Town",
        "age": 24
      },
      {
        "name": "Mohanad Ali",
        "position": "FW",
        "club": "Dibba",
        "age": 26
      },
      {
        "name": "Aymen Hussein",
        "position": "FW",
        "club": "Al-Karma",
        "age": 30
      }
    ]
  },
  {
    "id": "sen",
    "code": "sn",
    "nameEn": "Senegal",
    "nameTr": "Senegal",
    "fifaRank": 17,
    "group": "I",
    "confederation": "CAF",
    "manager": {
      "name": "Pape Thiaw",
      "nationality": "Senegal",
      "age": 43,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Édouard Mendy",
        "position": "GK",
        "club": "Al-Ahli",
        "age": 34
      },
      {
        "name": "Mory Diaw",
        "position": "GK",
        "club": "Le Havre",
        "age": 33
      },
      {
        "name": "Yehvann Diouf",
        "position": "GK",
        "club": "Nice",
        "age": 27
      },
      {
        "name": "El Hadji Malick Diouf",
        "position": "DF",
        "club": "West Ham United",
        "age": 22
      },
      {
        "name": "Mamadou Sarr",
        "position": "DF",
        "club": "Chelsea",
        "age": 21
      },
      {
        "name": "Ismail Jakobs",
        "position": "DF",
        "club": "Galatasaray",
        "age": 27
      },
      {
        "name": "Kalidou Koulibaly",
        "position": "DF",
        "club": "Al-Hilal",
        "age": 35
      },
      {
        "name": "Krépin Diatta",
        "position": "DF",
        "club": "Monaco",
        "age": 27
      },
      {
        "name": "Moussa Niakhaté",
        "position": "DF",
        "club": "Lyon",
        "age": 30
      },
      {
        "name": "Abdoulaye Seck",
        "position": "DF",
        "club": "Maccabi Haifa",
        "age": 34
      },
      {
        "name": "Antoine Mendy",
        "position": "DF",
        "club": "Nice",
        "age": 22
      },
      {
        "name": "Pape Matar Sarr",
        "position": "MF",
        "club": "Tottenham Hotspur",
        "age": 24
      },
      {
        "name": "Bara Sapoko Ndiaye",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 19
      },
      {
        "name": "Idrissa Gueye",
        "position": "MF",
        "club": "Everton",
        "age": 37
      },
      {
        "name": "Pape Gueye",
        "position": "MF",
        "club": "Villarreal",
        "age": 27
      },
      {
        "name": "Lamine Camara",
        "position": "MF",
        "club": "Monaco",
        "age": 22
      },
      {
        "name": "Pathé Ciss",
        "position": "MF",
        "club": "Rayo Vallecano",
        "age": 32
      },
      {
        "name": "Habib Diarra",
        "position": "MF",
        "club": "Sunderland",
        "age": 22
      },
      {
        "name": "Nicolas Jackson",
        "position": "FW",
        "club": "Bayern Munich",
        "age": 25
      },
      {
        "name": "Ibrahim Mbaye",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 18
      },
      {
        "name": "Sadio Mané",
        "position": "FW",
        "club": "Al-Nassr",
        "age": 34
      },
      {
        "name": "Ismaïla Sarr",
        "position": "FW",
        "club": "Crystal Palace",
        "age": 28
      },
      {
        "name": "Iliman Ndiaye",
        "position": "FW",
        "club": "Everton",
        "age": 26
      },
      {
        "name": "Bamba Dieng",
        "position": "FW",
        "club": "Lorient",
        "age": 26
      },
      {
        "name": "Cherif Ndiaye",
        "position": "FW",
        "club": "Red Star Belgrade",
        "age": 30
      },
      {
        "name": "Assane Diao",
        "position": "FW",
        "club": "Como",
        "age": 21
      }
    ]
  },
  {
    "id": "arg",
    "code": "ar",
    "nameEn": "Argentina",
    "nameTr": "Arjantin",
    "fifaRank": 1,
    "group": "J",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Lionel Scaloni",
      "nationality": "Argentina",
      "age": 47,
      "tenure": "2018–"
    },
    "players": [
      {
        "name": "Juan Musso",
        "position": "GK",
        "club": "Atlético Madrid",
        "age": 32
      },
      {
        "name": "Gerónimo Rulli",
        "position": "GK",
        "club": "Marseille",
        "age": 34
      },
      {
        "name": "Emiliano Martínez",
        "position": "GK",
        "club": "Aston Villa",
        "age": 34
      },
      {
        "name": "Cristian Romero",
        "position": "DF",
        "club": "Tottenham Hotspur",
        "age": 28
      },
      {
        "name": "Leonardo Balerdi",
        "position": "DF",
        "club": "Marseille",
        "age": 27
      },
      {
        "name": "Nicolás Tagliafico",
        "position": "DF",
        "club": "Lyon",
        "age": 34
      },
      {
        "name": "Gonzalo Montiel",
        "position": "DF",
        "club": "River Plate",
        "age": 29
      },
      {
        "name": "Lisandro Martínez",
        "position": "DF",
        "club": "Manchester United",
        "age": 28
      },
      {
        "name": "Nicolás Otamendi",
        "position": "DF",
        "club": "River Plate",
        "age": 38
      },
      {
        "name": "Facundo Medina",
        "position": "DF",
        "club": "Marseille",
        "age": 27
      },
      {
        "name": "Nahuel Molina",
        "position": "DF",
        "club": "Atlético Madrid",
        "age": 28
      },
      {
        "name": "Exequiel Palacios",
        "position": "MF",
        "club": "Bayer Leverkusen",
        "age": 28
      },
      {
        "name": "Alexis Mac Allister",
        "position": "MF",
        "club": "Liverpool",
        "age": 28
      },
      {
        "name": "Enzo Fernández",
        "position": "MF",
        "club": "Chelsea",
        "age": 25
      },
      {
        "name": "Leandro Paredes",
        "position": "MF",
        "club": "Boca Juniors",
        "age": 32
      },
      {
        "name": "Rodrigo De Paul",
        "position": "MF",
        "club": "Atlético Madrid",
        "age": 32
      },
      {
        "name": "Valentín Barco",
        "position": "MF",
        "club": "Strasbourg",
        "age": 22
      },
      {
        "name": "Giovani Lo Celso",
        "position": "MF",
        "club": "Betis",
        "age": 30
      },
      {
        "name": "Nicolás González",
        "position": "FW",
        "club": "Juventus",
        "age": 28
      },
      {
        "name": "Julián Alvarez",
        "position": "FW",
        "club": "Atlético Madrid",
        "age": 26
      },
      {
        "name": "Lionel Messi",
        "position": "FW",
        "club": "Inter Miami",
        "age": 39
      },
      {
        "name": "Thiago Almada",
        "position": "FW",
        "club": "Botafogo",
        "age": 25
      },
      {
        "name": "Giuliano Simeone",
        "position": "FW",
        "club": "Atlético Madrid",
        "age": 24
      },
      {
        "name": "Nico Paz",
        "position": "FW",
        "club": "Como",
        "age": 22
      },
      {
        "name": "José Manuel López",
        "position": "FW",
        "club": "Palmeiras",
        "age": 26
      },
      {
        "name": "Lautaro Martínez",
        "position": "FW",
        "club": "Internazionale",
        "age": 29
      }
    ]
  },
  {
    "id": "alg",
    "code": "dz",
    "nameEn": "Algeria",
    "nameTr": "Cezayir",
    "fifaRank": 37,
    "group": "J",
    "confederation": "CAF",
    "manager": {
      "name": "Vladimir Petkovic",
      "nationality": "Switzerland",
      "age": 62,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Luca Zidane",
        "position": "GK",
        "club": "Granada",
        "age": 28
      },
      {
        "name": "Melvin Mastil",
        "position": "GK",
        "club": "Stade Nyonnais",
        "age": 26
      },
      {
        "name": "Oussama Benbot",
        "position": "GK",
        "club": "USM Alger",
        "age": 32
      },
      {
        "name": "Rayan Aït-Nouri",
        "position": "DF",
        "club": "Manchester City",
        "age": 25
      },
      {
        "name": "Ramy Bensebaini",
        "position": "DF",
        "club": "Borussia Dortmund",
        "age": 31
      },
      {
        "name": "Aïssa Mandi",
        "position": "DF",
        "club": "Lille",
        "age": 35
      },
      {
        "name": "Achref Abada",
        "position": "DF",
        "club": "USM Alger",
        "age": 27
      },
      {
        "name": "Zineddine Belaïd",
        "position": "DF",
        "club": "JS Kabylie",
        "age": 27
      },
      {
        "name": "Rafik Belghali",
        "position": "DF",
        "club": "Hellas Verona",
        "age": 24
      },
      {
        "name": "Jaouen Hadjam",
        "position": "DF",
        "club": "Young Boys",
        "age": 23
      },
      {
        "name": "Mohamed Amine Tougai",
        "position": "DF",
        "club": "Espérance de Tunis",
        "age": 26
      },
      {
        "name": "Samir Chergui",
        "position": "DF",
        "club": "Paris FC",
        "age": 27
      },
      {
        "name": "Ibrahim Maza",
        "position": "MF",
        "club": "Bayer Leverkusen",
        "age": 21
      },
      {
        "name": "Ramiz Zerrouki",
        "position": "MF",
        "club": "Twente",
        "age": 28
      },
      {
        "name": "Houssem Aouar",
        "position": "MF",
        "club": "Al-Ittihad",
        "age": 28
      },
      {
        "name": "Farès Chaïbi",
        "position": "MF",
        "club": "Eintracht Frankfurt",
        "age": 24
      },
      {
        "name": "Hicham Boudaoui",
        "position": "MF",
        "club": "Nice",
        "age": 27
      },
      {
        "name": "Yacine Titraoui",
        "position": "MF",
        "club": "Charleroi",
        "age": 23
      },
      {
        "name": "Nabil Bentaleb",
        "position": "MF",
        "club": "Lille",
        "age": 32
      },
      {
        "name": "Anis Hadj Moussa",
        "position": "FW",
        "club": "Feyenoord",
        "age": 24
      },
      {
        "name": "Riyad Mahrez",
        "position": "FW",
        "club": "Al-Ahli",
        "age": 35
      },
      {
        "name": "Amine Gouiri",
        "position": "FW",
        "club": "Marseille",
        "age": 26
      },
      {
        "name": "Nadhir Benbouali",
        "position": "FW",
        "club": "Győr",
        "age": 26
      },
      {
        "name": "Farès Ghedjemis",
        "position": "FW",
        "club": "Frosinone",
        "age": 24
      },
      {
        "name": "Mohamed Amoura",
        "position": "FW",
        "club": "VfL Wolfsburg",
        "age": 26
      },
      {
        "name": "Adil Boulbina",
        "position": "FW",
        "club": "Al-Duhail",
        "age": 23
      }
    ]
  },
  {
    "id": "aut",
    "code": "at",
    "nameEn": "Austria",
    "nameTr": "Avusturya",
    "fifaRank": 22,
    "group": "J",
    "confederation": "UEFA",
    "manager": {
      "name": "Ralf Rangnick",
      "nationality": "Germany",
      "age": 67,
      "tenure": "2022–"
    },
    "players": [
      {
        "name": "Alexander Schlager",
        "position": "GK",
        "club": "Red Bull Salzburg",
        "age": 30
      },
      {
        "name": "Florian Wiegele",
        "position": "GK",
        "club": "Viktoria Plzeň",
        "age": 25
      },
      {
        "name": "Patrick Pentz",
        "position": "GK",
        "club": "Brøndby",
        "age": 29
      },
      {
        "name": "Kevin Danso",
        "position": "DF",
        "club": "Tottenham Hotspur",
        "age": 28
      },
      {
        "name": "David Alaba",
        "position": "DF",
        "club": "Real Madrid",
        "age": 34
      },
      {
        "name": "David Affengruber",
        "position": "DF",
        "club": "Elche",
        "age": 25
      },
      {
        "name": "Stefan Posch",
        "position": "DF",
        "club": "Mainz 05",
        "age": 29
      },
      {
        "name": "Philipp Lienhart",
        "position": "DF",
        "club": "SC Freiburg",
        "age": 30
      },
      {
        "name": "Phillipp Mwene",
        "position": "DF",
        "club": "Mainz 05",
        "age": 32
      },
      {
        "name": "Alexander Prass",
        "position": "DF",
        "club": "TSG Hoffenheim",
        "age": 25
      },
      {
        "name": "Marco Friedl",
        "position": "DF",
        "club": "Werder Bremen",
        "age": 28
      },
      {
        "name": "Michael Svoboda",
        "position": "DF",
        "club": "Venezia",
        "age": 28
      },
      {
        "name": "Marcel Sabitzer",
        "position": "MF",
        "club": "Borussia Dortmund",
        "age": 32
      },
      {
        "name": "Carney Chukwuemeka",
        "position": "MF",
        "club": "Borussia Dortmund",
        "age": 23
      },
      {
        "name": "Konrad Laimer",
        "position": "MF",
        "club": "Bayern Munich",
        "age": 29
      },
      {
        "name": "Xaver Schlager",
        "position": "MF",
        "club": "RB Leipzig",
        "age": 29
      },
      {
        "name": "Nicolas Seiwald",
        "position": "MF",
        "club": "RB Leipzig",
        "age": 25
      },
      {
        "name": "Florian Grillitsch",
        "position": "MF",
        "club": "Braga",
        "age": 31
      },
      {
        "name": "Romano Schmid",
        "position": "MF",
        "club": "Werder Bremen",
        "age": 26
      },
      {
        "name": "Christoph Baumgartner",
        "position": "MF",
        "club": "RB Leipzig",
        "age": 27
      },
      {
        "name": "Patrick Wimmer",
        "position": "MF",
        "club": "VfL Wolfsburg",
        "age": 25
      },
      {
        "name": "Paul Wanner",
        "position": "MF",
        "club": "PSV",
        "age": 21
      },
      {
        "name": "Alessandro Schöpf",
        "position": "MF",
        "club": "Wolfsberger AC",
        "age": 32
      },
      {
        "name": "Marko Arnautović",
        "position": "FW",
        "club": "Red Star Belgrade",
        "age": 37
      },
      {
        "name": "Michael Gregoritsch",
        "position": "FW",
        "club": "FC Augsburg",
        "age": 32
      },
      {
        "name": "Saša Kalajdžić",
        "position": "FW",
        "club": "LASK",
        "age": 29
      }
    ]
  },
  {
    "id": "jor",
    "code": "jo",
    "nameEn": "Jordan",
    "nameTr": "Ürdün",
    "fifaRank": 70,
    "group": "J",
    "confederation": "AFC",
    "manager": {
      "name": "Jamal Sellami",
      "nationality": "Morocco",
      "age": 55,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Yazeed Abulaila",
        "position": "GK",
        "club": "Al-Hussein",
        "age": 33
      },
      {
        "name": "Abdallah Al-Fakhouri",
        "position": "GK",
        "club": "Al-Wehdat",
        "age": 26
      },
      {
        "name": "Nour Bani Attiah",
        "position": "GK",
        "club": "Al-Faisaly",
        "age": 33
      },
      {
        "name": "Yazan Al-Arab",
        "position": "DF",
        "club": "FC Seoul",
        "age": 30
      },
      {
        "name": "Abdallah Nasib",
        "position": "DF",
        "club": "Al-Zawraa",
        "age": 32
      },
      {
        "name": "Saed Al-Rosan",
        "position": "DF",
        "club": "Al-Hussein",
        "age": 29
      },
      {
        "name": "Husam Abudahab",
        "position": "DF",
        "club": "Al-Faisaly",
        "age": 26
      },
      {
        "name": "Mohammad Abualnadi",
        "position": "DF",
        "club": "Selangor",
        "age": 25
      },
      {
        "name": "Salim Obaid",
        "position": "DF",
        "club": "Al-Hussein",
        "age": 34
      },
      {
        "name": "Anas Badawi",
        "position": "DF",
        "club": "Al-Faisaly",
        "age": 29
      },
      {
        "name": "Rajaei Ayed",
        "position": "MF",
        "club": "Al-Hussein",
        "age": 33
      },
      {
        "name": "Noor Al-Rawabdeh",
        "position": "MF",
        "club": "Selangor",
        "age": 29
      },
      {
        "name": "Ibrahim Sa'deh",
        "position": "MF",
        "club": "Al-Karma",
        "age": 26
      },
      {
        "name": "Mohammad Abu Hashish",
        "position": "MF",
        "club": "Al-Karma",
        "age": 31
      },
      {
        "name": "Nizar Al-Rashdan",
        "position": "MF",
        "club": "Qatar",
        "age": 27
      },
      {
        "name": "Mohannad Abu Taha",
        "position": "MF",
        "club": "Al-Quwa Al-Jawiya",
        "age": 23
      },
      {
        "name": "Amer Jamous",
        "position": "MF",
        "club": "Al-Zawraa",
        "age": 24
      },
      {
        "name": "Mohammad Al-Dawoud",
        "position": "MF",
        "club": "Al-Wehdat",
        "age": 34
      },
      {
        "name": "Mahmoud Al-Mardi",
        "position": "FW",
        "club": "Al-Hussein",
        "age": 33
      },
      {
        "name": "Musa Al-Taamari",
        "position": "FW",
        "club": "Rennes",
        "age": 29
      },
      {
        "name": "Ali Olwan",
        "position": "FW",
        "club": "Al-Sailiya",
        "age": 26
      },
      {
        "name": "Mohammad Abu Zrayq",
        "position": "FW",
        "club": "Raja Casablanca",
        "age": 29
      },
      {
        "name": "Ibrahim Sabra",
        "position": "FW",
        "club": "Lokomotiva Zagreb",
        "age": 20
      },
      {
        "name": "Odeh Al-Fakhouri",
        "position": "FW",
        "club": "Pyramids",
        "age": 21
      },
      {
        "name": "Ali Azaizeh",
        "position": "FW",
        "club": "Al-Shabab",
        "age": 22
      },
      {
        "name": "Odeh Fakhoury",
        "position": "FW",
        "club": "Pyramids",
        "age": 21
      }
    ]
  },
  {
    "id": "por",
    "code": "pt",
    "nameEn": "Portugal",
    "nameTr": "Portekiz",
    "fifaRank": 6,
    "group": "K",
    "confederation": "UEFA",
    "manager": {
      "name": "Roberto Martínez",
      "nationality": "Spain",
      "age": 51,
      "tenure": "2023–"
    },
    "players": [
      {
        "name": "Diogo Costa",
        "position": "GK",
        "club": "Porto",
        "age": 27
      },
      {
        "name": "José Sá",
        "position": "GK",
        "club": "Wolverhampton Wanderers",
        "age": 33
      },
      {
        "name": "Rui Silva",
        "position": "GK",
        "club": "Real Betis",
        "age": 32
      },
      {
        "name": "Rúben Dias",
        "position": "DF",
        "club": "Manchester City",
        "age": 29
      },
      {
        "name": "João Cancelo",
        "position": "DF",
        "club": "Barcelona",
        "age": 32
      },
      {
        "name": "Nuno Mendes",
        "position": "DF",
        "club": "Paris Saint-Germain",
        "age": 24
      },
      {
        "name": "Gonçalo Inácio",
        "position": "DF",
        "club": "Sporting CP",
        "age": 25
      },
      {
        "name": "Matheus Nunes",
        "position": "DF",
        "club": "Manchester City",
        "age": 28
      },
      {
        "name": "Tomás Araújo",
        "position": "DF",
        "club": "Benfica",
        "age": 24
      },
      {
        "name": "Nélson Semedo",
        "position": "DF",
        "club": "Wolverhampton Wanderers",
        "age": 33
      },
      {
        "name": "Diogo Dalot",
        "position": "DF",
        "club": "Manchester United",
        "age": 27
      },
      {
        "name": "Renato Veiga",
        "position": "DF",
        "club": "Villarreal",
        "age": 23
      },
      {
        "name": "Bernardo Silva",
        "position": "MF",
        "club": "Manchester City",
        "age": 32
      },
      {
        "name": "Vitinha",
        "position": "MF",
        "club": "Paris Saint-Germain",
        "age": 26
      },
      {
        "name": "João Neves",
        "position": "MF",
        "club": "Paris Saint-Germain",
        "age": 22
      },
      {
        "name": "Bruno Fernandes",
        "position": "MF",
        "club": "Manchester United",
        "age": 32
      },
      {
        "name": "Rúben Neves",
        "position": "MF",
        "club": "Al-Hilal",
        "age": 29
      },
      {
        "name": "Samú Costa",
        "position": "MF",
        "club": "Mallorca",
        "age": 26
      },
      {
        "name": "Gonçalo Ramos",
        "position": "FW",
        "club": "Paris Saint-Germain",
        "age": 25
      },
      {
        "name": "Pedro Neto",
        "position": "FW",
        "club": "Chelsea",
        "age": 26
      },
      {
        "name": "Francisco Trincão",
        "position": "FW",
        "club": "Sporting CP",
        "age": 27
      },
      {
        "name": "Francisco Conceição",
        "position": "FW",
        "club": "Juventus",
        "age": 24
      },
      {
        "name": "Cristiano Ronaldo",
        "position": "FW",
        "club": "Al-Nassr",
        "age": 41
      },
      {
        "name": "João Félix",
        "position": "FW",
        "club": "Al-Nassr",
        "age": 27
      },
      {
        "name": "Rafael Leão",
        "position": "FW",
        "club": "Milan",
        "age": 27
      },
      {
        "name": "Gonçalo Guedes",
        "position": "FW",
        "club": "Real Sociedad",
        "age": 30
      }
    ]
  },
  {
    "id": "col",
    "code": "co",
    "nameEn": "Colombia",
    "nameTr": "Kolombiya",
    "fifaRank": 12,
    "group": "K",
    "confederation": "CONMEBOL",
    "manager": {
      "name": "Néstor Lorenzo",
      "nationality": "Argentina",
      "age": 58,
      "tenure": "2022–"
    },
    "players": [
      {
        "name": "David Ospina",
        "position": "GK",
        "club": "Atlético Nacional",
        "age": 38
      },
      {
        "name": "Camilo Vargas",
        "position": "GK",
        "club": "Atlas",
        "age": 37
      },
      {
        "name": "Álvaro Montero",
        "position": "GK",
        "club": "Vélez Sarsfield",
        "age": 31
      },
      {
        "name": "Davinson Sánchez",
        "position": "DF",
        "club": "Galatasaray",
        "age": 30
      },
      {
        "name": "Santiago Arias",
        "position": "DF",
        "club": "Independiente",
        "age": 34
      },
      {
        "name": "Yerry Mina",
        "position": "DF",
        "club": "Cagliari",
        "age": 32
      },
      {
        "name": "Daniel Muñoz",
        "position": "DF",
        "club": "Crystal Palace",
        "age": 30
      },
      {
        "name": "Johan Mojica",
        "position": "DF",
        "club": "Mallorca",
        "age": 34
      },
      {
        "name": "Jhon Lucumí",
        "position": "DF",
        "club": "Bologna",
        "age": 28
      },
      {
        "name": "Deiver Machado",
        "position": "DF",
        "club": "Nantes",
        "age": 33
      },
      {
        "name": "Willer Ditta",
        "position": "DF",
        "club": "Cruz Azul",
        "age": 29
      },
      {
        "name": "Richard Ríos",
        "position": "MF",
        "club": "Benfica",
        "age": 26
      },
      {
        "name": "James Rodríguez",
        "position": "MF",
        "club": "Minnesota United",
        "age": 35
      },
      {
        "name": "Jefferson Lerma",
        "position": "MF",
        "club": "Crystal Palace",
        "age": 32
      },
      {
        "name": "Juan Fernando Quintero",
        "position": "MF",
        "club": "River Plate",
        "age": 33
      },
      {
        "name": "Jhon Arias",
        "position": "MF",
        "club": "Palmeiras",
        "age": 29
      },
      {
        "name": "Kevin Castaño",
        "position": "MF",
        "club": "River Plate",
        "age": 26
      },
      {
        "name": "Jorge Carrascal",
        "position": "MF",
        "club": "Flamengo",
        "age": 28
      },
      {
        "name": "Jaminton Campaz",
        "position": "MF",
        "club": "Rosario Central",
        "age": 26
      },
      {
        "name": "Juan Portilla",
        "position": "MF",
        "club": "Athletico Paranaense",
        "age": 28
      },
      {
        "name": "Gustavo Puerta",
        "position": "MF",
        "club": "Racing de Santander",
        "age": 23
      },
      {
        "name": "Luis Díaz",
        "position": "FW",
        "club": "Bayern Munich",
        "age": 29
      },
      {
        "name": "Luis Suárez",
        "position": "FW",
        "club": "Sporting CP",
        "age": 29
      },
      {
        "name": "Jhon Córdoba",
        "position": "FW",
        "club": "Krasnodar",
        "age": 33
      },
      {
        "name": "Cucho Hernández",
        "position": "FW",
        "club": "Betis",
        "age": 27
      },
      {
        "name": "Andrés Gómez",
        "position": "FW",
        "club": "Vasco da Gama",
        "age": 24
      }
    ]
  },
  {
    "id": "uzb",
    "code": "uz",
    "nameEn": "Uzbekistan",
    "nameTr": "Özbekistan",
    "fifaRank": 62,
    "group": "K",
    "confederation": "AFC",
    "manager": {
      "name": "Fabio Cannavaro",
      "nationality": "Italy",
      "age": 52,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Utkir Yusupov",
        "position": "GK",
        "club": "Navbahor",
        "age": 35
      },
      {
        "name": "Abduvohid Nematov",
        "position": "GK",
        "club": "Nasaf",
        "age": 25
      },
      {
        "name": "Botirali Ergashev",
        "position": "GK",
        "club": "Neftchi",
        "age": 31
      },
      {
        "name": "Abdukodir Khusanov",
        "position": "DF",
        "club": "Manchester City",
        "age": 22
      },
      {
        "name": "Rustam Ashurmatov",
        "position": "DF",
        "club": "Esteghlal",
        "age": 30
      },
      {
        "name": "Farrukh Sayfiev",
        "position": "DF",
        "club": "Neftchi",
        "age": 35
      },
      {
        "name": "Khojiakbar Alijonov",
        "position": "DF",
        "club": "Pakhtakor",
        "age": 29
      },
      {
        "name": "Sherzod Nasrullaev",
        "position": "DF",
        "club": "Nasaf",
        "age": 28
      },
      {
        "name": "Umar Eshmurodov",
        "position": "DF",
        "club": "Nasaf",
        "age": 34
      },
      {
        "name": "Abdulla Abdullaev",
        "position": "DF",
        "club": "Dibba Al Fujairah",
        "age": 29
      },
      {
        "name": "Bekhruz Karimov",
        "position": "DF",
        "club": "Surkhon",
        "age": 19
      },
      {
        "name": "Jakhongir Urozov",
        "position": "DF",
        "club": "Dinamo Samarqand",
        "age": 22
      },
      {
        "name": "Avazbek Ulmasaliev",
        "position": "DF",
        "club": "AGMK",
        "age": 26
      },
      {
        "name": "Otabek Shukurov",
        "position": "MF",
        "club": "Baniyas",
        "age": 30
      },
      {
        "name": "Odiljon Hamrobekov",
        "position": "MF",
        "club": "Tractor",
        "age": 30
      },
      {
        "name": "Jamshid Iskanderov",
        "position": "MF",
        "club": "Neftchi",
        "age": 33
      },
      {
        "name": "Akmal Mozgovoy",
        "position": "MF",
        "club": "Pakhtakor",
        "age": 27
      },
      {
        "name": "Azizjon Ganiev",
        "position": "MF",
        "club": "Al Bataeh",
        "age": 28
      },
      {
        "name": "Sherzod Esanov",
        "position": "MF",
        "club": "Bukhara",
        "age": 23
      },
      {
        "name": "Abbosbek Fayzullaev",
        "position": "MF",
        "club": "CSKA Moscow",
        "age": 23
      },
      {
        "name": "Eldor Shomurodov",
        "position": "FW",
        "club": "Roma",
        "age": 31
      },
      {
        "name": "Igor Sergeev",
        "position": "FW",
        "club": "Persepolis",
        "age": 33
      },
      {
        "name": "Jaloliddin Masharipov",
        "position": "FW",
        "club": "Esteghlal",
        "age": 33
      },
      {
        "name": "Oston Urunov",
        "position": "FW",
        "club": "Persepolis",
        "age": 26
      },
      {
        "name": "Dostonbek Khamdamov",
        "position": "FW",
        "club": "Pakhtakor",
        "age": 30
      },
      {
        "name": "Azizbek Amonov",
        "position": "FW",
        "club": "Buxoro",
        "age": 29
      }
    ]
  },
  {
    "id": "cod",
    "code": "cd",
    "nameEn": "Congo DR",
    "nameTr": "Kongo DC",
    "fifaRank": 64,
    "group": "K",
    "confederation": "CAF",
    "manager": {
      "name": "Sébastien Desabre",
      "nationality": "France",
      "age": 47,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Lionel Mpasi",
        "position": "GK",
        "club": "Le Havre",
        "age": 32
      },
      {
        "name": "Timothy Fayulu",
        "position": "GK",
        "club": "Noah",
        "age": 27
      },
      {
        "name": "Matthieu Epolo",
        "position": "GK",
        "club": "Standard Liège",
        "age": 21
      },
      {
        "name": "Aaron Wan-Bissaka",
        "position": "DF",
        "club": "West Ham United",
        "age": 29
      },
      {
        "name": "Chancel Mbemba",
        "position": "DF",
        "club": "Lille",
        "age": 32
      },
      {
        "name": "Arthur Masuaku",
        "position": "DF",
        "club": "Lens",
        "age": 33
      },
      {
        "name": "Gédéon Kalulu",
        "position": "DF",
        "club": "Aris Limassol",
        "age": 29
      },
      {
        "name": "Joris Kayembe",
        "position": "DF",
        "club": "Genk",
        "age": 32
      },
      {
        "name": "Dylan Batubinsika",
        "position": "DF",
        "club": "AEL",
        "age": 30
      },
      {
        "name": "Axel Tuanzebe",
        "position": "DF",
        "club": "Burnley",
        "age": 29
      },
      {
        "name": "Steve Kapuadi",
        "position": "DF",
        "club": "Widzew Łódź",
        "age": 28
      },
      {
        "name": "Meschak Elia",
        "position": "MF",
        "club": "Young Boys",
        "age": 29
      },
      {
        "name": "Samuel Moutoussamy",
        "position": "MF",
        "club": "Atromitos",
        "age": 30
      },
      {
        "name": "Edo Kayembe",
        "position": "MF",
        "club": "Watford",
        "age": 28
      },
      {
        "name": "Théo Bongonda",
        "position": "MF",
        "club": "Spartak Moscow",
        "age": 31
      },
      {
        "name": "Charles Pickel",
        "position": "MF",
        "club": "Espanyol",
        "age": 29
      },
      {
        "name": "Gaël Kakuta",
        "position": "MF",
        "club": "AEL",
        "age": 35
      },
      {
        "name": "Noah Sadiki",
        "position": "MF",
        "club": "Sunderland",
        "age": 22
      },
      {
        "name": "Nathanaël Mbuku",
        "position": "MF",
        "club": "Montpellier",
        "age": 24
      },
      {
        "name": "Aaron Tshibola",
        "position": "MF",
        "club": "Kilmarnock",
        "age": 31
      },
      {
        "name": "Ngal'ayel Mukau",
        "position": "MF",
        "club": "Lille",
        "age": 22
      },
      {
        "name": "Brian Cipenga",
        "position": "MF",
        "club": "Castellón",
        "age": 28
      },
      {
        "name": "Cédric Bakambu",
        "position": "FW",
        "club": "Betis",
        "age": 35
      },
      {
        "name": "Fiston Mayele",
        "position": "FW",
        "club": "Pyramids",
        "age": 32
      },
      {
        "name": "Yoane Wissa",
        "position": "FW",
        "club": "Newcastle United",
        "age": 30
      },
      {
        "name": "Simon Banza",
        "position": "FW",
        "club": "Al Jazira",
        "age": 30
      }
    ]
  },
  {
    "id": "eng",
    "code": "gb-eng",
    "nameEn": "England",
    "nameTr": "İngiltere",
    "fifaRank": 5,
    "group": "L",
    "confederation": "UEFA",
    "manager": {
      "name": "Thomas Tuchel",
      "nationality": "Germany",
      "age": 52,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "James Trafford",
        "position": "GK",
        "club": "Manchester City",
        "age": 24
      },
      {
        "name": "Jordan Pickford",
        "position": "GK",
        "club": "Everton",
        "age": 32
      },
      {
        "name": "Dean Henderson",
        "position": "GK",
        "club": "Crystal Palace",
        "age": 29
      },
      {
        "name": "John Stones",
        "position": "DF",
        "club": "Manchester City",
        "age": 32
      },
      {
        "name": "Marc Guéhi",
        "position": "DF",
        "club": "Manchester City",
        "age": 26
      },
      {
        "name": "Reece James",
        "position": "DF",
        "club": "Chelsea",
        "age": 27
      },
      {
        "name": "Djed Spence",
        "position": "DF",
        "club": "Tottenham Hotspur",
        "age": 26
      },
      {
        "name": "Nico O'Reilly",
        "position": "DF",
        "club": "Manchester City",
        "age": 21
      },
      {
        "name": "Jarell Quansah",
        "position": "DF",
        "club": "Liverpool",
        "age": 23
      },
      {
        "name": "Ezri Konsa",
        "position": "DF",
        "club": "Aston Villa",
        "age": 29
      },
      {
        "name": "Dan Burn",
        "position": "DF",
        "club": "Newcastle United",
        "age": 34
      },
      {
        "name": "Tino Livramento",
        "position": "DF",
        "club": "Newcastle United",
        "age": 24
      },
      {
        "name": "Jordan Henderson",
        "position": "MF",
        "club": "Ajax",
        "age": 36
      },
      {
        "name": "Declan Rice",
        "position": "MF",
        "club": "Arsenal",
        "age": 27
      },
      {
        "name": "Jude Bellingham",
        "position": "MF",
        "club": "Real Madrid",
        "age": 23
      },
      {
        "name": "Eberechi Eze",
        "position": "MF",
        "club": "Arsenal",
        "age": 28
      },
      {
        "name": "Morgan Rogers",
        "position": "MF",
        "club": "Aston Villa",
        "age": 24
      },
      {
        "name": "Kobbie Mainoo",
        "position": "MF",
        "club": "Manchester United",
        "age": 21
      },
      {
        "name": "Elliot Anderson",
        "position": "MF",
        "club": "Nottingham Forest",
        "age": 24
      },
      {
        "name": "Harry Kane",
        "position": "FW",
        "club": "Bayern Munich",
        "age": 33
      },
      {
        "name": "Bukayo Saka",
        "position": "FW",
        "club": "Arsenal",
        "age": 25
      },
      {
        "name": "Noni Madueke",
        "position": "FW",
        "club": "Chelsea",
        "age": 24
      },
      {
        "name": "Marcus Rashford",
        "position": "FW",
        "club": "Manchester United",
        "age": 29
      },
      {
        "name": "Ollie Watkins",
        "position": "FW",
        "club": "Aston Villa",
        "age": 31
      },
      {
        "name": "Anthony Gordon",
        "position": "FW",
        "club": "Newcastle United",
        "age": 25
      },
      {
        "name": "Ivan Toney",
        "position": "FW",
        "club": "Al-Ahli",
        "age": 30
      }
    ]
  },
  {
    "id": "cro",
    "code": "hr",
    "nameEn": "Croatia",
    "nameTr": "Hırvatistan",
    "fifaRank": 9,
    "group": "L",
    "confederation": "UEFA",
    "manager": {
      "name": "Zlatko Dalić",
      "nationality": "Croatia",
      "age": 59,
      "tenure": "2017–"
    },
    "players": [
      {
        "name": "Dominik Livaković",
        "position": "GK",
        "club": "Dinamo Zagreb",
        "age": 31
      },
      {
        "name": "Dominik Kotarski",
        "position": "GK",
        "club": "Copenhagen",
        "age": 26
      },
      {
        "name": "Ivor Pandur",
        "position": "GK",
        "club": "Hull City",
        "age": 26
      },
      {
        "name": "Joško Gvardiol",
        "position": "DF",
        "club": "Manchester City",
        "age": 24
      },
      {
        "name": "Josip Šutalo",
        "position": "DF",
        "club": "Ajax",
        "age": 26
      },
      {
        "name": "Josip Stanišić",
        "position": "DF",
        "club": "Bayern Munich",
        "age": 26
      },
      {
        "name": "Duje Ćaleta-Car",
        "position": "DF",
        "club": "Real Sociedad",
        "age": 30
      },
      {
        "name": "Marin Pongračić",
        "position": "DF",
        "club": "Fiorentina",
        "age": 29
      },
      {
        "name": "Martin Erlić",
        "position": "DF",
        "club": "Midtjylland",
        "age": 28
      },
      {
        "name": "Luka Vušković",
        "position": "DF",
        "club": "Hamburger SV",
        "age": 19
      },
      {
        "name": "Mateo Kovačić",
        "position": "MF",
        "club": "Manchester City",
        "age": 32
      },
      {
        "name": "Mario Pašalić",
        "position": "MF",
        "club": "Atalanta",
        "age": 31
      },
      {
        "name": "Petar Sučić",
        "position": "MF",
        "club": "Inter Milan",
        "age": 23
      },
      {
        "name": "Luka Modrić",
        "position": "MF",
        "club": "Milan",
        "age": 41
      },
      {
        "name": "Nikola Vlašić",
        "position": "MF",
        "club": "Torino",
        "age": 29
      },
      {
        "name": "Luka Sučić",
        "position": "MF",
        "club": "Real Sociedad",
        "age": 24
      },
      {
        "name": "Martin Baturina",
        "position": "MF",
        "club": "Como",
        "age": 23
      },
      {
        "name": "Kristijan Jakić",
        "position": "MF",
        "club": "FC Augsburg",
        "age": 29
      },
      {
        "name": "Nikola Moro",
        "position": "MF",
        "club": "Bologna",
        "age": 28
      },
      {
        "name": "Toni Fruk",
        "position": "MF",
        "club": "Rijeka",
        "age": 25
      },
      {
        "name": "Ivan Perišić",
        "position": "FW",
        "club": "PSV Eindhoven",
        "age": 37
      },
      {
        "name": "Andrej Kramarić",
        "position": "FW",
        "club": "TSG Hoffenheim",
        "age": 35
      },
      {
        "name": "Ante Budimir",
        "position": "FW",
        "club": "Osasuna",
        "age": 35
      },
      {
        "name": "Marco Pašalić",
        "position": "FW",
        "club": "Orlando City",
        "age": 26
      },
      {
        "name": "Petar Musa",
        "position": "FW",
        "club": "FC Dallas",
        "age": 28
      },
      {
        "name": "Igor Matanović",
        "position": "FW",
        "club": "SC Freiburg",
        "age": 23
      }
    ]
  },
  {
    "id": "pan",
    "code": "pa",
    "nameEn": "Panama",
    "nameTr": "Panama",
    "fifaRank": 41,
    "group": "L",
    "confederation": "CONCACAF",
    "manager": {
      "name": "Thomas Christiansen",
      "nationality": "Denmark",
      "age": 51,
      "tenure": "2024–"
    },
    "players": [
      {
        "name": "Luis Mejía",
        "position": "GK",
        "club": "Nacional",
        "age": 35
      },
      {
        "name": "Orlando Mosquera",
        "position": "GK",
        "club": "Al-Fayha",
        "age": 32
      },
      {
        "name": "César Samudio",
        "position": "GK",
        "club": "Marathón",
        "age": 32
      },
      {
        "name": "Amir Murillo",
        "position": "DF",
        "club": "Beşiktaş",
        "age": 30
      },
      {
        "name": "Eric Davis",
        "position": "DF",
        "club": "Plaza Amador",
        "age": 35
      },
      {
        "name": "Fidel Escobar",
        "position": "DF",
        "club": "Saprissa",
        "age": 31
      },
      {
        "name": "Roderick Miller",
        "position": "DF",
        "club": "Turan Tovuz",
        "age": 34
      },
      {
        "name": "Andrés Andrade",
        "position": "DF",
        "club": "LASK",
        "age": 28
      },
      {
        "name": "César Blackman",
        "position": "DF",
        "club": "Slovan Bratislava",
        "age": 28
      },
      {
        "name": "José Córdoba",
        "position": "DF",
        "club": "Norwich City",
        "age": 25
      },
      {
        "name": "Jiovany Ramos",
        "position": "DF",
        "club": "Puerto Cabello",
        "age": 29
      },
      {
        "name": "Jorge Gutiérrez",
        "position": "DF",
        "club": "Deportivo La Guaira",
        "age": 28
      },
      {
        "name": "Edgardo Fariña",
        "position": "DF",
        "club": "Pari Nizhny Novgorod",
        "age": 25
      },
      {
        "name": "Aníbal Godoy",
        "position": "MF",
        "club": "San Diego",
        "age": 36
      },
      {
        "name": "Alberto Quintero",
        "position": "MF",
        "club": "Plaza Amador",
        "age": 39
      },
      {
        "name": "Yoel Bárcenas",
        "position": "MF",
        "club": "Unattached",
        "age": 33
      },
      {
        "name": "Adalberto Carrasquilla",
        "position": "MF",
        "club": "UNAM",
        "age": 28
      },
      {
        "name": "José Luis Rodríguez",
        "position": "MF",
        "club": "Juárez",
        "age": 28
      },
      {
        "name": "Cristian Martínez",
        "position": "MF",
        "club": "Ironi Kiryat Shmona",
        "age": 29
      },
      {
        "name": "César Yanis",
        "position": "MF",
        "club": "Cobresal",
        "age": 30
      },
      {
        "name": "Carlos Harvey",
        "position": "MF",
        "club": "Minnesota United",
        "age": 26
      },
      {
        "name": "Azarias Londoño",
        "position": "MF",
        "club": "Universidad Católica",
        "age": 25
      },
      {
        "name": "José Fajardo",
        "position": "FW",
        "club": "Universidad Católica",
        "age": 33
      },
      {
        "name": "Ismael Díaz",
        "position": "FW",
        "club": "León",
        "age": 29
      },
      {
        "name": "Cecilio Waterman",
        "position": "FW",
        "club": "Universidad de Concepción",
        "age": 35
      },
      {
        "name": "Tomás Rodríguez",
        "position": "FW",
        "club": "Saprissa",
        "age": 27
      }
    ]
  },
  {
    "id": "gha",
    "code": "gh",
    "nameEn": "Ghana",
    "nameTr": "Gana",
    "fifaRank": 42,
    "group": "L",
    "confederation": "CAF",
    "manager": {
      "name": "Carlos Queiroz",
      "nationality": "Portugal",
      "age": 73,
      "tenure": "2025–"
    },
    "players": [
      {
        "name": "Lawrence Ati-Zigi",
        "position": "GK",
        "club": "St. Gallen",
        "age": 30
      },
      {
        "name": "Benjamin Asare",
        "position": "GK",
        "club": "Hearts of Oak",
        "age": 34
      },
      {
        "name": "Solomon Agbasi",
        "position": "GK",
        "club": "Hearts of Oak",
        "age": 26
      },
      {
        "name": "Abdul Rahman Baba",
        "position": "DF",
        "club": "PAOK",
        "age": 32
      },
      {
        "name": "Gideon Mensah",
        "position": "DF",
        "club": "Auxerre",
        "age": 28
      },
      {
        "name": "Alidu Seidu",
        "position": "DF",
        "club": "Rennes",
        "age": 26
      },
      {
        "name": "Jerome Opoku",
        "position": "DF",
        "club": "İstanbul Başakşehir",
        "age": 28
      },
      {
        "name": "Jonas Adjetey",
        "position": "DF",
        "club": "VfL Wolfsburg",
        "age": 23
      },
      {
        "name": "Abdul Mumin",
        "position": "DF",
        "club": "Rayo Vallecano",
        "age": 28
      },
      {
        "name": "Kojo Peprah Oppong",
        "position": "DF",
        "club": "Nice",
        "age": 22
      },
      {
        "name": "Marvin Senaya",
        "position": "DF",
        "club": "Auxerre",
        "age": 25
      },
      {
        "name": "Derrick Luckassen",
        "position": "DF",
        "club": "Pafos",
        "age": 31
      },
      {
        "name": "Thomas Partey",
        "position": "MF",
        "club": "Villarreal",
        "age": 33
      },
      {
        "name": "Elisha Owusu",
        "position": "MF",
        "club": "Auxerre",
        "age": 29
      },
      {
        "name": "Caleb Yirenkyi",
        "position": "MF",
        "club": "Nordsjælland",
        "age": 20
      },
      {
        "name": "Kwasi Sibo",
        "position": "MF",
        "club": "Oviedo",
        "age": 28
      },
      {
        "name": "Augustine Boakye",
        "position": "MF",
        "club": "Saint-Étienne",
        "age": 26
      },
      {
        "name": "Kamaldeen Sulemana",
        "position": "FW",
        "club": "Atalanta",
        "age": 24
      },
      {
        "name": "Antoine Semenyo",
        "position": "FW",
        "club": "Manchester City",
        "age": 26
      },
      {
        "name": "Fatawu Issahaku",
        "position": "FW",
        "club": "Leicester City",
        "age": 22
      },
      {
        "name": "Jordan Ayew",
        "position": "FW",
        "club": "Leicester City",
        "age": 35
      },
      {
        "name": "Iñaki Williams",
        "position": "FW",
        "club": "Athletic Bilbao",
        "age": 32
      },
      {
        "name": "Ernest Nuamah",
        "position": "FW",
        "club": "Lyon",
        "age": 23
      },
      {
        "name": "Christopher Bonsu Baah",
        "position": "FW",
        "club": "Al-Qadsiah",
        "age": 22
      },
      {
        "name": "Brandon Thomas-Asante",
        "position": "FW",
        "club": "Coventry City",
        "age": 28
      },
      {
        "name": "Prince Kwabena Adu",
        "position": "FW",
        "club": "Viktoria Plzeň",
        "age": 23
      }
    ]
  }
];

export function sortPlayersWithBjkBias(players: any[]): any[] {
  const isBjk = (club: string) => {
    if (!club) return false;
    const c = club.toLowerCase();
    return c.includes("beşiktaş") || c.includes("besiktas") || c === "bjk";
  };
  
  const isGs = (club: string) => {
    if (!club) return false;
    const c = club.toLowerCase();
    return c.includes("galatasaray") || c === "gs" || c.includes("g.saray");
  };

  const positionsOrder = ["GK", "DF", "MF", "FW"];
  const result: any[] = [];

  for (const pos of positionsOrder) {
    const posPlayers = players.filter(p => p.position === pos);
    const bjkPlayers = posPlayers.filter(p => isBjk(p.club));
    const gsPlayers = posPlayers.filter(p => isGs(p.club));
    const otherPlayers = posPlayers.filter(p => !isBjk(p.club) && !isGs(p.club));
    
    result.push(...bjkPlayers, ...otherPlayers, ...gsPlayers);
  }

  const leftoverPlayers = players.filter(p => !positionsOrder.includes(p.position));
  if (leftoverPlayers.length > 0) {
    const bjkPlayers = leftoverPlayers.filter(p => isBjk(p.club));
    const gsPlayers = leftoverPlayers.filter(p => isGs(p.club));
    const otherPlayers = leftoverPlayers.filter(p => !isBjk(p.club) && !isGs(p.club));
    result.push(...bjkPlayers, ...otherPlayers, ...gsPlayers);
  }

  return result;
}

export const TEAMS: Team[] = seeds.map((s) => ({
  id: s.id,
  code: s.code,
  nameEn: s.nameEn,
  nameTr: s.nameTr,
  fifaRank: s.fifaRank,
  group: s.group,
  drawOrder: getDrawOrder(s.id),
  confederation: s.confederation,
  flagUrl: flag(s.code),
  manager: s.manager,
  players: sortPlayersWithBjkBias(squad(s.id, s.players)),
}));

validateTeamsData(TEAMS);

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamsByGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group).sort(
    (a, b) => a.drawOrder - b.drawOrder,
  );
}

export function getTeamName(team: Team, locale: Locale): string {
  if (locale === "tr") return team.nameTr;
  return team.nameEn;
}

export function getAllPlayers() {
  return TEAMS.flatMap((team) =>
    team.players.map((player) => ({
      ...player,
      teamId: team.id,
      teamNameEn: team.nameEn,
      teamNameTr: team.nameTr,
      teamFlagUrl: team.flagUrl,
    }))
  );
}

/** Bump when official draw changes — clears stale browser tournament cache */
export const TOURNAMENT_DATA_VERSION = "wc2026-official-draw-v2";
