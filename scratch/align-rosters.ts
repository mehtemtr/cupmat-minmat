import * as fs from "fs";
import * as path from "path";

const jsonPath = path.join(__dirname, "real-squads.json");

if (!fs.existsSync(jsonPath)) {
  console.error("real-squads.json not found!");
  process.exit(1);
}

const realSquads = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Helper to remove players by name
function removePlayers(teamId: string, namesToRemove: string[]) {
  if (!realSquads[teamId]) return;
  const originalCount = realSquads[teamId].length;
  realSquads[teamId] = realSquads[teamId].filter(
    (p: any) => !namesToRemove.includes(p.name)
  );
  console.log(`[${teamId}] Removed ${originalCount - realSquads[teamId].length} players.`);
}

// Helper to rename a player and optionally change their position
function renamePlayer(teamId: string, oldName: string, newName: string, newPosition?: string) {
  if (!realSquads[teamId]) return;
  const player = realSquads[teamId].find((p: any) => p.name === oldName);
  if (player) {
    player.name = newName;
    if (newPosition) {
      player.position = newPosition;
    }
    console.log(`[${teamId}] Renamed "${oldName}" -> "${newName}"` + (newPosition ? ` (${newPosition})` : ""));
  } else {
    console.warn(`[${teamId}] Player "${oldName}" not found for renaming.`);
  }
}

// Helper to change player position only
function updatePlayerPosition(teamId: string, playerName: string, newPosition: string) {
  if (!realSquads[teamId]) return;
  const player = realSquads[teamId].find((p: any) => p.name === playerName);
  if (player) {
    player.position = newPosition;
    console.log(`[${teamId}] Updated "${playerName}" position -> ${newPosition}`);
  } else {
    console.warn(`[${teamId}] Player "${playerName}" not found for position update.`);
  }
}

// Helper to add a player
function addPlayer(teamId: string, player: { name: string; position: string; club: string; age: number; dateOfBirth: string }) {
  if (!realSquads[teamId]) {
    realSquads[teamId] = [];
  }
  // Check if already exists
  if (realSquads[teamId].some((p: any) => p.name === player.name)) {
    console.log(`[${teamId}] Player "${player.name}" already exists. Updating details.`);
    const existing = realSquads[teamId].find((p: any) => p.name === player.name);
    Object.assign(existing, player);
    return;
  }
  realSquads[teamId].push(player);
  console.log(`[${teamId}] Added player "${player.name}" (${player.position}, ${player.club}).`);
}

console.log("Starting roster alignment...");

// 1. Australia (aus)
removePlayers("aus", ["Kye Rowles", "Martin Boyle"]);
addPlayer("aus", { name: "Cristian Volpato", position: "FW", club: "Sassuolo", age: 23, dateOfBirth: "2003-11-15" });
addPlayer("aus", { name: "Tete Yengi", position: "FW", club: "Machida Zelvia", age: 26, dateOfBirth: "2000-11-22" });

// 2. Bosnia Hersek (bih)
removePlayers("bih", ["Arjan Malić"]);
addPlayer("bih", { name: "Ermin Mahmić", position: "MF", club: "Slovan Liberec", age: 21, dateOfBirth: "2005-03-14" });

// 3. Algeria (alg)
removePlayers("alg", ["Adil Aouchiche", "Amin Chiakha", "Anthony Mandrea", "Kilian Belazzoug", "Mehdi Dorval", "Sohaib Naïr"]);
addPlayer("alg", { name: "Jaouen Hadjam", position: "DF", club: "Young Boys", age: 23, dateOfBirth: "2003-03-26" });
addPlayer("alg", { name: "Melvin Mastil", position: "GK", club: "Stade Nyonnais", age: 26, dateOfBirth: "2000-02-19" });
addPlayer("alg", { name: "Mohamed Amine Tougai", position: "DF", club: "Espérance de Tunis", age: 26, dateOfBirth: "2000-01-22" });
addPlayer("alg", { name: "Nabil Bentaleb", position: "MF", club: "Lille", age: 31, dateOfBirth: "1994-11-24" });
addPlayer("alg", { name: "Oussama Benbot", position: "GK", club: "USM Alger", age: 31, dateOfBirth: "1994-10-11" });
addPlayer("alg", { name: "Samir Chergui", position: "DF", club: "Paris FC", age: 27, dateOfBirth: "1999-02-06" });

// 4. Czechia (cze)
removePlayers("cze", ["Pavel Bucha", "Tomáš Ladra"]);
addPlayer("cze", { name: "Alexandr Sojka", position: "MF", club: "Viktoria Plzeň", age: 23, dateOfBirth: "2003-04-02" });
addPlayer("cze", { name: "Denis Višinský", position: "FW", club: "Viktoria Plzeň", age: 23, dateOfBirth: "2003-03-21" });

// 5. Ecuador (ecu)
removePlayers("ecu", [
  "Bruno Caicedo", "Cristhian Loor", "Deinner Ordóñez", "Ederson Castillo", 
  "John Mercado", "José Hurtado", "Luis Fragozo", "Malcom Dacosta", 
  "Darwin Guagua", "Fricio Caicedo"
]);
addPlayer("ecu", { name: "Alan Franco", position: "MF", club: "Atlético Mineiro", age: 28, dateOfBirth: "1998-08-21" });
addPlayer("ecu", { name: "Alan Minda", position: "MF", club: "Atlético Mineiro", age: 23, dateOfBirth: "2003-05-14" });
addPlayer("ecu", { name: "Enner Valencia", position: "FW", club: "Pachuca", age: 37, dateOfBirth: "1989-11-04" });
addPlayer("ecu", { name: "Hernán Galíndez", position: "GK", club: "Huracán", age: 39, dateOfBirth: "1987-03-30" });
addPlayer("ecu", { name: "Nilson Angulo", position: "FW", club: "Sunderland", age: 23, dateOfBirth: "2003-06-19" });
addPlayer("ecu", { name: "Pedro Vite", position: "MF", club: "UNAM", age: 24, dateOfBirth: "2002-03-09" });
addPlayer("ecu", { name: "Piero Hincapie", position: "DF", club: "Arsenal", age: 24, dateOfBirth: "2002-01-09" });
addPlayer("ecu", { name: "Willian Pacho", position: "DF", club: "Paris Saint-Germain", age: 24, dateOfBirth: "2001-10-16" });
addPlayer("ecu", { name: "Gonzalo Plata", position: "FW", club: "Flamengo", age: 26, dateOfBirth: "2000-11-01" });
addPlayer("ecu", { name: "Yaimar Medina", position: "DF", club: "Genk", age: 22, dateOfBirth: "2004-11-05" });

// 6. Morocco (mar)
renamePlayer("mar", "Munir Mohamedi", "Munir El Kajoui");

// 7. Ghana (gha)
removePlayers("gha", ["Alexander Djiku", "Paul Reverson"]);
addPlayer("gha", { name: "Derrick Luckassen", position: "DF", club: "Pafos", age: 30, dateOfBirth: "1995-07-03" });
renamePlayer("gha", "Abdul Fatawu", "Fatawu Issahaku", "FW");
updatePlayerPosition("gha", "Kamaldeen Sulemana", "FW");

// 8. Iraq (irq)
renamePlayer("irq", "Rebin Sulaka", "Rebin Ghareeb");
removePlayers("irq", ["Ahmed Maknzi", "Dario Naamo", "Hasan Abdulkareem", "Jussef Nasrawe", "Kumel Al-Rekabe", "Maitham Jabbar"]);
addPlayer("irq", { name: "Ahmed Basil", position: "GK", club: "Al-Shorta", age: 29, dateOfBirth: "1996-08-19" });
addPlayer("irq", { name: "Ali Jasim", position: "FW", club: "Como", age: 22, dateOfBirth: "2004-01-20" });
addPlayer("irq", { name: "Amir Al-Ammari", position: "MF", club: "Cracovia", age: 28, dateOfBirth: "1997-07-27" });
addPlayer("irq", { name: "Ibrahim Bayesh", position: "MF", club: "Al-Riyadh", age: 26, dateOfBirth: "2000-05-01" });
addPlayer("irq", { name: "Youssef Amyn", position: "MF", club: "AEK Larnaca", age: 22, dateOfBirth: "2003-08-21" });
addPlayer("irq", { name: "Zaid Ismael", position: "MF", club: "Al-Talaba", age: 24, dateOfBirth: "2002-01-03" });

// 9. Scotland (sco)
removePlayers("sco", ["James Wilson", "Luke Graham"]);
addPlayer("sco", { name: "Lewis Ferguson", position: "MF", club: "Bologna", age: 26, dateOfBirth: "1999-08-24" });
addPlayer("sco", { name: "Ross Stewart", position: "FW", club: "Southampton", age: 29, dateOfBirth: "1996-07-11" });

// 10. Iran (irn)
renamePlayer("irn", "Dennis Eckert", "Dennis Dargahi");
removePlayers("irn", ["Hadi Habibinejad", "Omid Noorafkan"]);
addPlayer("irn", { name: "Amirmohammad Razaghinia", position: "MF", club: "Esteghlal FC", age: 20, dateOfBirth: "2006-04-11" });
addPlayer("irn", { name: "Shahriyar Moghanloo", position: "FW", club: "Kalba FC", age: 31, dateOfBirth: "1994-12-21" });

// 11. Sweden (swe)
removePlayers("swe", ["Emil Holm"]);
addPlayer("swe", { name: "Herman Johansson", position: "DF", club: "FC Dallas", age: 28, dateOfBirth: "1997-10-16" });

// 12. Japan (jpn)
removePlayers("jpn", ["Maya Yoshida"]);
addPlayer("jpn", { name: "Kento Shiogai", position: "FW", club: "VfL Wolfsburg", age: 21, dateOfBirth: "2005-03-26" });

// 13. Qatar (qat)
removePlayers("qat", ["Rayyan Al-Ali"]);
addPlayer("qat", { name: "Almoez Ali", position: "FW", club: "Al-Duhail", age: 30, dateOfBirth: "1996-08-19" });

// 14. South Korea (kor)
removePlayers("kor", ["Cho Yu-min"]);
addPlayer("kor", { name: "Cho Wi-je", position: "DF", club: "Jeonbuk Hyundai Motors", age: 24, dateOfBirth: "2001-08-25" });
renamePlayer("kor", "Lee Ki-hyuk", "Lee Gihyuk", "MF");

// 15. Mexico (mex)
removePlayers("mex", ["Alejandro Gómez", "Carlos Rodríguez", "Érick Sánchez", "Jesús Alberto Angulo", "Julián Araujo", "Richard Ledezma", "Víctor Guzmán"]);
addPlayer("mex", { name: "Alvaro Fidalgo", position: "MF", club: "Betis", age: 29, dateOfBirth: "1997-04-09" });
addPlayer("mex", { name: "Armando Gonzalez", position: "FW", club: "Guadalajara", age: 23, dateOfBirth: "2003-04-20" });
addPlayer("mex", { name: "Brian Gutierrez", position: "MF", club: "Guadalajara", age: 23, dateOfBirth: "2003-06-17" });
addPlayer("mex", { name: "Erik Lira", position: "MF", club: "Cruz Azul", age: 26, dateOfBirth: "2000-05-08" });
addPlayer("mex", { name: "Gilberto Mora", position: "MF", club: "Tijuana", age: 18, dateOfBirth: "2008-10-14" });
addPlayer("mex", { name: "Guillermo Martinez", position: "FW", club: "UNAM", age: 31, dateOfBirth: "1995-03-15" });
addPlayer("mex", { name: "Obed Vargas", position: "MF", club: "Atlético Madrid", age: 21, dateOfBirth: "2005-08-05" });

// 16. Egypt (egy)
renamePlayer("egy", "Nabil Emad", "Nabil Donga");
addPlayer("egy", { name: "Mahdy Soliman", position: "GK", club: "Zamalek", age: 39, dateOfBirth: "1987-06-08" });

// 17. Uzbekistan (uzb)
removePlayers("uzb", ["Jasurbek Jaloliddinov", "Umarali Rakhmonaliev"]);
updatePlayerPosition("uzb", "Abbosbek Fayzullaev", "MF");
addPlayer("uzb", { name: "Azizbek Amonov", position: "FW", club: "Buxoro", age: 29, dateOfBirth: "1997-10-30" });

// 18. Paraguay (par)
renamePlayer("par", "Kaku", "Alejandro Romero Gamarra", "FW");
removePlayers("par", ["Carlos Coronel", "Blas Riveros", "Alan Benítez", "Agustín Sández", "Saúl Salcedo", "Mathías Villasanti", "Óscar Romero", "Ángel Romero"]);
addPlayer("par", { name: "Alex Arce", position: "FW", club: "Independiente Rivadavia", age: 31, dateOfBirth: "1995-06-16" });
addPlayer("par", { name: "Alexandro Maidana", position: "DF", club: "Talleres", age: 20, dateOfBirth: "2005-07-26" });
addPlayer("par", { name: "Braian Ojeda", position: "MF", club: "Orlando City", age: 26, dateOfBirth: "2000-07-27" });
addPlayer("par", { name: "Gaston Olveira", position: "GK", club: "Club Olimpia", age: 33, dateOfBirth: "1993-04-21" });
addPlayer("par", { name: "Gustavo Caballero", position: "MF", club: "Portsmouth", age: 25, dateOfBirth: "2001-09-21" });
addPlayer("par", { name: "Isidro Pitta", position: "FW", club: "Red Bull Bragantino", age: 27, dateOfBirth: "1999-08-14" });
addPlayer("par", { name: "Jose Canale", position: "DF", club: "Lanús", age: 29, dateOfBirth: "1996-07-20" });
addPlayer("par", { name: "Mauricio", position: "MF", club: "Palmeiras", age: 25, dateOfBirth: "2001-06-22" });

// 19. Senegal (sen)
removePlayers("sen", ["Ilay Camara", "Moustapha Mbow"]);
addPlayer("sen", { name: "Assane Diao", position: "FW", club: "Como", age: 20, dateOfBirth: "2005-09-07" });
addPlayer("sen", { name: "Cherif Ndiaye", position: "FW", club: "Samsunspor", age: 30, dateOfBirth: "1996-01-23" });

// 20. Saudi Arabia (ksa)
removePlayers("ksa", ["Zakaria Hawsawi", "Abdullah Al-Salem"]);
addPlayer("ksa", { name: "Aiman Yahya", position: "FW", club: "Al-Nassr", age: 25, dateOfBirth: "2001-05-14" });
addPlayer("ksa", { name: "Ziyad Aljohani", position: "MF", club: "Al-Ahli", age: 24, dateOfBirth: "2001-11-11" });

// 21. Uruguay (uru)
removePlayers("uru", ["José Luis Rodríguez", "Nicolás Fonseca", "Facundo Torres"]);
addPlayer("uru", { name: "Rodrigo Aguirre", position: "FW", club: "Tigres UANL", age: 31, dateOfBirth: "1994-10-01" });
addPlayer("uru", { name: "Rodrigo Bentancur", position: "MF", club: "Tottenham Hotspur", age: 28, dateOfBirth: "1997-06-25" });
addPlayer("uru", { name: "Rodrigo Zalazar", position: "MF", club: "Braga", age: 26, dateOfBirth: "1999-08-12" });

// 22. Jordan (jor)
removePlayers("jor", ["Ihsan Haddad", "Yousef Qashi", "Mohammad Taha"]);
addPlayer("jor", { name: "Ali Azaizeh", position: "FW", club: "Al-Shabab", age: 22, dateOfBirth: "2004-04-13" });
addPlayer("jor", { name: "Odeh Fakhoury", position: "FW", club: "Pyramids", age: 20, dateOfBirth: "2005-11-22" });
renamePlayer("jor", "Husam Abu Dahab", "Husam Abudahab");

console.log("Saving updated real-squads.json...");
fs.writeFileSync(jsonPath, JSON.stringify(realSquads, null, 2), "utf8");
console.log("Done aligning real-squads.json!");
