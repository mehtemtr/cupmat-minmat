import os
import json
import socket
import urllib.request
import urllib.error
import datetime

# Windows'ta IPv6 kaynaklı [WinError 10060] zaman aşımını engellemek için IPv4'ü zorla
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

SUPABASE_URL = "https://ewdfexbuhgtsnsxveobc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE"
API_FOOTBALL_KEY = "d83df7bf863704a20e60235fdaa87cb8"
FOOTBALL_DATA_TOKEN = "15de2c6ad10c459f9e6d0046d30d6512"

HEADERS_SUPABASE = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

TOURNAMENT_DEFINITIONS = [
    # AVRUPA
    {"api_id": 2, "name": "UEFA Şampiyonlar Ligi", "type": "Cup", "region": "europe", "logo": "https://media.api-sports.io/football/leagues/2.png"},
    {"api_id": 3, "name": "UEFA Avrupa Ligi", "type": "Cup", "region": "europe", "logo": "https://media.api-sports.io/football/leagues/3.png"},
    {"api_id": 848, "name": "UEFA Konferans Ligi", "type": "Cup", "region": "europe", "logo": "https://media.api-sports.io/football/leagues/848.png"},
    {"api_id": 5, "name": "UEFA Uluslar Ligi", "type": "Cup", "region": "europe", "logo": "https://media.api-sports.io/football/leagues/5.png"},
    
    # AMERİKA
    {"api_id": 13, "name": "Copa Libertadores", "type": "Cup", "region": "america", "logo": "https://media.api-sports.io/football/leagues/13.png"},
    {"api_id": 11, "name": "Copa Sudamericana", "type": "Cup", "region": "america", "logo": "https://media.api-sports.io/football/leagues/11.png"},
    {"api_id": 16, "name": "CONCACAF Şampiyonlar Kupası", "type": "Cup", "region": "america", "logo": "https://media.api-sports.io/football/leagues/16.png"},
    {"api_id": 34, "name": "FIFA Dünya Kupası CONMEBOL Elemeleri", "type": "Cup", "region": "america", "logo": "https://media.api-sports.io/football/leagues/34.png"},
    {"api_id": 22, "name": "CONCACAF Uluslar Ligi", "type": "Cup", "region": "america", "logo": "https://media.api-sports.io/football/leagues/22.png"},
    
    # ASYA
    {"api_id": 17, "name": "AFC Şampiyonlar Ligi Elite", "type": "Cup", "region": "asia", "logo": "https://media.api-sports.io/football/leagues/17.png"},
    {"api_id": 18, "name": "AFC Şampiyonlar Ligi Two", "type": "Cup", "region": "asia", "logo": "https://media.api-sports.io/football/leagues/18.png"},
    {"api_id": 7, "name": "AFC Asya Kupası & Elemeleri", "type": "Cup", "region": "asia", "logo": "https://media.api-sports.io/football/leagues/7.png"},
    
    # AFRİKA
    {"api_id": 12, "name": "CAF Şampiyonlar Ligi", "type": "Cup", "region": "africa", "logo": "https://media.api-sports.io/football/leagues/12.png"},
    {"api_id": 20, "name": "CAF Konfederasyon Kupası", "type": "Cup", "region": "africa", "logo": "https://media.api-sports.io/football/leagues/20.png"},
    {"api_id": 32, "name": "Afrika Uluslar Kupası Elemeleri (AFCON)", "type": "Cup", "region": "africa", "logo": "https://media.api-sports.io/football/leagues/32.png"},
    
    # DÜNYA & OKYANUSYA
    {"api_id": 15, "name": "FIFA Kulüpler Dünya Kupası", "type": "Cup", "region": "world", "logo": "https://media.api-sports.io/football/leagues/15.png"},
    {"api_id": 68, "name": "OFC Şampiyonlar Ligi", "type": "Cup", "region": "oceania", "logo": "https://media.api-sports.io/football/leagues/68.png"}
]

TEAM_COUNTRY_CODES = {
    # TÜRKİYE
    "Fenerbahçe": "TÜR", "Beşiktaş": "TÜR", "Galatasaray": "TÜR", "Trabzonspor": "TÜR", "Başakşehir": "TÜR", "Türkiye": "TÜR", "Turkey": "TÜR",
    # İNGİLTERE
    "Manchester City": "İNG", "Man City": "İNG", "Arsenal": "İNG", "Liverpool": "İNG", "Aston Villa": "İNG", "Chelsea": "İNG", "Tottenham": "İNG", "Manchester United": "İNG", "Newcastle": "İNG", "İngiltere": "İNG", "England": "İNG",
    # İSPANYA
    "Real Madrid": "İSP", "Barcelona": "İSP", "Atlético Madrid": "İSP", "Real Sociedad": "İSP", "Athletic Bilbao": "İSP", "Girona": "İSP", "Real Betis": "İSP", "Villarreal": "İSP", "İspanya": "İSP", "Spain": "İSP",
    # ALMANYA
    "Bayern Munich": "ALM", "Bayer Leverkusen": "ALM", "Borussia Dortmund": "ALM", "RB Leipzig": "ALM", "VfB Stuttgart": "ALM", "Eintracht Frankfurt": "ALM", "Heidenheim": "ALM", "Hoffenheim": "ALM", "Almanya": "ALM", "Germany": "ALM",
    # İTALYA
    "Inter": "İTA", "Inter Milan": "İTA", "AC Milan": "İTA", "Juventus": "İTA", "Atalanta": "İTA", "Bologna": "İTA", "Roma": "İTA", "Lazio": "İTA", "Napoli": "İTA", "Fiorentina": "İTA", "İtalya": "İTA", "Italy": "İTA",
    # FRANSA
    "PSG": "FRA", "Paris Saint-Germain": "FRA", "Lille": "FRA", "Monaco": "FRA", "Marseille": "FRA", "Lyon": "FRA", "Brest": "FRA", "Nice": "FRA", "Lens": "FRA", "Fransa": "FRA", "France": "FRA",
    # HOLLANDA & PORTEKİZ
    "PSV": "HOL", "PSV Eindhoven": "HOL", "Feyenoord": "HOL", "Ajax": "HOL", "AZ Alkmaar": "HOL", "Twente": "HOL", "Hollanda": "HOL", "Netherlands": "HOL",
    "Sporting CP": "POR", "Benfica": "POR", "Porto": "POR", "FC Porto": "POR", "Braga": "POR", "Vitoria Guimaraes": "POR", "Portekiz": "POR", "Portugal": "POR",
    # DİĞER AVRUPA
    "Celtic": "İSK", "Rangers": "İSK", "İskoçya": "İSK", "Scotland": "İSK",
    "Club Brugge": "BEL", "Union SG": "BEL", "Anderlecht": "BEL", "Gent": "BEL", "Belçika": "BEL", "Belgium": "BEL",
    "Salzburg": "AVU", "Red Bull Salzburg": "AVU", "Sturm Graz": "AVU", "LASK": "AVU", "Avusturya": "AVU", "Austria": "AVU",
    "Sparta Prag": "ÇEK", "Sparta Praha": "ÇEK", "AC Sparta Praha": "ÇEK", "Slavia Prag": "ÇEK", "Slavia Praha": "ÇEK", "SK Slavia Praha": "ÇEK", "Viktoria Plzen": "ÇEK", "Çekya": "ÇEK", "Czech Republic": "ÇEK",
    "Slovan Bratislava": "SVK", "ŠK Slovan Bratislava": "SVK", "SK Slovan Bratislava": "SVK", "Spartak Trnava": "SVK", "Slovakya": "SVK", "Slovakia": "SVK",
    "Dinamo Zagreb": "HIR", "Hajduk Split": "HIR", "Rijeka": "HIR", "Hırvatistan": "HIR", "Croatia": "HIR",
    "Kızılyıldız": "SIR", "Crvena Zvezda": "SIR", "Partizan": "SIR", "Sırbistan": "SIR", "Serbia": "SIR",
    "Young Boys": "İSV", "Lugano": "İSV", "Servette": "İSV", "İsviçre": "İSV", "Switzerland": "İSV",
    "Bodø/Glimt": "NOR", "Molde": "NOR", "Viking": "NOR", "Norveç": "NOR", "Norway": "NOR",
    "Malmö FF": "İSVE", "Elfsborg": "İSVE", "Djurgården": "İSVE", "İsveç": "İSVE", "Sweden": "İSVE",
    "FC Copenhagen": "DAN", "Midtjylland": "DAN", "Brøndby": "DAN", "Danimarka": "DAN", "Denmark": "DAN",
    "Shakhtar Donetsk": "UKR", "Shakhtar": "UKR", "Shaktar": "UKR", "Dinamo Kiev": "UKR", "Dynamo Kyiv": "UKR", "Ukrayna": "UKR", "Ukraine": "UKR",
    "Qarabag": "AZE", "Karabağ": "AZE", "Sabah": "AZE", "Azerbaycan": "AZE", "Azerbaijan": "AZE",
    "Olympiakos": "YUN", "PAOK": "YUN", "Panathinaikos": "YUN", "AEK": "YUN", "Yunanistan": "YUN", "Greece": "YUN",

    # GÜNEY AMERİKA (CONMEBOL)
    "Flamengo": "BRA", "Palmeiras": "BRA", "Fluminense": "BRA", "Botafogo": "BRA", "São Paulo": "BRA", "Sao Paulo": "BRA", "Corinthians": "BRA", "Atlético Mineiro": "BRA", "Atletico-MG": "BRA", "Grêmio": "BRA", "Cruzeiro": "BRA", "Internacional": "BRA", "Brezilya": "BRA", "Brazil": "BRA",
    "River Plate": "ARG", "Boca Juniors": "ARG", "San Lorenzo": "ARG", "Racing Club": "ARG", "Independiente": "ARG", "Estudiantes": "ARG", "Talleres": "ARG", "Lanús": "ARG", "Arjantin": "ARG", "Argentina": "ARG",
    "Peñarol": "URU", "Penarol": "URU", "Nacional": "URU", "Club Nacional": "URU", "Uruguay": "URU",
    "Colo-Colo": "ŞİL", "Colo Colo": "ŞİL", "Universidad de Chile": "ŞİL", "Şili": "ŞİL", "Chile": "ŞİL",
    "Atlético Nacional": "KOL", "Junior": "KOL", "Millonarios": "KOL", "América de Cali": "KOL", "Kolombiya": "KOL", "Colombia": "KOL",
    "LDU Quito": "EKV", "Independiente del Valle": "EKV", "Barcelona SC": "EKV", "Ekvador": "EKV", "Ecuador": "EKV",
    "Olimpia": "PAR", "Cerro Porteño": "PAR", "Cerro Porteno": "PAR", "Libertad": "PAR", "Paraguay": "PAR",
    "Alianza Lima": "PER", "Universitario": "PER", "Sporting Cristal": "PER", "Peru": "PER",
    "Bolívar": "BOL", "Bolivar": "BOL", "The Strongest": "BOL", "Bolivya": "BOL", "Bolivia": "BOL",
    "Deportivo Táchira": "VEN", "Caracas FC": "VEN", "Venezuela": "VEN",

    # ASYA (AFC)
    "Al-Hilal": "SUU", "Al-Nassr": "SUU", "Al-Ittihad": "SUU", "Al-Ahli": "SUU", "Al-Taawoun": "SUU", "Suudi Arabistan": "SUU", "Saudi Arabia": "SUU",
    "Al-Ain": "BAE", "Al-Wasl": "BAE", "Shabab Al-Ahli": "BAE", "Birleşik Arap Emirlikleri": "BAE", "UAE": "BAE",
    "Al-Sadd": "KAT", "Al-Rayyan": "KAT", "Al-Gharafa": "KAT", "Katar": "KAT", "Qatar": "KAT",
    "Persepolis": "İRA", "Esteghlal": "İRA", "Sepahan": "İRA", "Tractor": "İRA", "İran": "İRA", "Iran": "İRA",
    "Yokohama F. Marinos": "JAP", "Vissel Kobe": "JAP", "Kawasaki Frontale": "JAP", "Urawa Red Diamonds": "JAP", "Japonya": "JAP", "Japan": "JAP",
    "Ulsan HD": "G.KOR", "Pohang Steelers": "G.KOR", "Gwangju FC": "G.KOR", "Jeonbuk": "G.KOR", "Güney Kore": "G.KOR", "Korea Republic": "G.KOR", "South Korea": "G.KOR",
    "Shanghai Port": "ÇİN", "Shanghai Shenhua": "ÇİN", "Shandong Taishan": "ÇİN", "Çin": "ÇİN", "China": "ÇİN",
    "Sydney FC": "AVS", "Central Coast Mariners": "AVS", "Melbourne City": "AVS", "Avustralya": "AVS", "Australia": "AVS",
    "Özbekistan": "ÖZB", "Uzbekistan": "ÖZB", "Irak": "IRK", "Iraq": "IRK", "Ürdün": "ÜRD", "Jordan": "ÜRD",

    # AFRİKA (CAF)
    "Al Ahly": "MIS", "Zamalek": "MIS", "Pyramids FC": "MIS", "Mısır": "MIS", "Egypt": "MIS",
    "Espérance de Tunis": "TUN", "Esperance Tunis": "TUN", "Club Africain": "TUN", "Étoile du Sahel": "TUN", "Tunus": "TUN", "Tunisia": "TUN",
    "Wydad AC": "FAS", "Raja CA": "FAS", "RS Berkane": "FAS", "RSB Berkane": "FAS", "AS FAR": "FAS", "Fas": "FAS", "Morocco": "FAS",
    "Mamelodi Sundowns": "G.AFR", "Orlando Pirates": "G.AFR", "Kaizer Chiefs": "G.AFR", "Güney Afrika": "G.AFR", "South Africa": "G.AFR",
    "TP Mazembe": "KON", "AS Vita Club": "KON", "Demokratik Kongo": "KON", "DR Congo": "KON",
    "Simba SC": "TAN", "Young Africans": "TAN", "Tanzanya": "TAN", "Tanzania": "TAN",
    "MC Alger": "CEZ", "CR Belouizdad": "CEZ", "USM Alger": "CEZ", "JS Kabylie": "CEZ", "Cezayir": "CEZ", "Algeria": "CEZ",
    "Nijerya": "NİJ", "Nigeria": "NİJ", "Senegal": "SEN", "Fildişi Sahili": "FİL", "Ivory Coast": "FİL", "Gana": "GAN", "Ghana": "GAN", "Kamerun": "KAM", "Cameroon": "KAM",

    # KUZEY & ORTA AMERİKA (CONCACAF)
    "Inter Miami": "ABD", "Columbus Crew": "ABD", "LA Galaxy": "ABD", "Los Angeles FC": "ABD", "LAFC": "ABD", "Seattle Sounders": "ABD", "Philadelphia Union": "ABD", "ABD": "ABD", "USA": "ABD",
    "Club América": "MEK", "Monterrey": "MEK", "Tigres UANL": "MEK", "Pachuca": "MEK", "Cruz Azul": "MEK", "Guadalajara": "MEK", "Chivas": "MEK", "Toluca": "MEK", "Meksika": "MEK", "Mexico": "MEK",
    "Vancouver Whitecaps": "KAN", "Toronto FC": "KAN", "CF Montréal": "KAN", "Kanada": "KAN", "Canada": "KAN",
    "Saprissa": "KOS", "Alajuelense": "KOS", "Herediano": "KOS", "Kosta Rika": "KOS", "Costa Rica": "KOS",
    "Olimpia Tegucigalpa": "HON", "Motagua": "HON", "Honduras": "HON",
    "Comunicaciones": "GUA", "Municipal": "GUA", "Guatemala": "GUA",
    "Panama": "PAN", "Jamaika": "JAM", "Jamaica": "JAM"
}

def get_country_code(team_name, fallback=""):
    if not team_name:
        return (fallback or "UNK")[:10]
    name_clean = team_name.strip()
    if name_clean in TEAM_COUNTRY_CODES:
        return TEAM_COUNTRY_CODES[name_clean][:10]
    for key, code in TEAM_COUNTRY_CODES.items():
        if key.lower() in name_clean.lower() or name_clean.lower() in key.lower():
            return code[:10]
    return (fallback or "UNK")[:10]

def supabase_get(endpoint):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    req = urllib.request.Request(url, headers=HEADERS_SUPABASE)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[!] Supabase GET hatası ({endpoint}): {e}")
        return []

def supabase_upsert(table, data_list, on_conflict="api_id"):
    if not data_list:
        return 0
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    req = urllib.request.Request(url, data=json.dumps(data_list).encode('utf-8'), headers=HEADERS_SUPABASE, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            return len(data_list)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"[!] Supabase UPSERT hatası ({table}): {err_msg[:200]}")
        return 0
    except Exception as e:
        print(f"[!] Supabase UPSERT genel hata ({table}): {e}")
        return 0

def init_tournaments():
    print("[+] Turnuva tanımları veritabanına işleniyor...")
    current_tournaments = supabase_get("cupmat_tournaments?select=id,api_id")
    existing_map = {t["api_id"]: t["id"] for t in current_tournaments}

    records_to_insert = []
    for t in TOURNAMENT_DEFINITIONS:
        if t["api_id"] not in existing_map:
            records_to_insert.append({
                "api_id": t["api_id"],
                "name": t["name"],
                "type": t["type"],
                "region": t["region"],
                "logo_url": t["logo"]
            })
    
    if records_to_insert:
        supabase_upsert("cupmat_tournaments", records_to_insert)
        print(f"[+] {len(records_to_insert)} yeni turnuva eklendi.")
    
    updated_tournaments = supabase_get("cupmat_tournaments?select=id,api_id,name,region")
    return {t["api_id"]: t["id"] for t in updated_tournaments}

def fetch_uefa_official_matches(tournament_map):
    """UEFA Resmi Açık API'sinden bu sezonun tüm maçlarını çeker."""
    print("\n--- UEFA RESMİ API MAÇLARI ÇEKİLİYOR ---")
    uefa_comps = [
        {"uefa_id": "1", "api_id": 2, "name": "UEFA Şampiyonlar Ligi"},
        {"uefa_id": "3", "api_id": 3, "name": "UEFA Avrupa Ligi"},
        {"uefa_id": "19", "api_id": 848, "name": "UEFA Konferans Ligi"},
        {"uefa_id": "13", "api_id": 5, "name": "UEFA Uluslar Ligi"}
    ]

    total_inserted = 0

    for comp in uefa_comps:
        t_id = tournament_map.get(comp["api_id"])
        if not t_id:
            continue

        print(f"[+] {comp['name']} taranıyor...")
        url = f"https://match.uefa.com/v5/matches?competitionId={comp['uefa_id']}&seasonYear=2025&limit=100&offset=0"
        
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        try:
            with urllib.request.urlopen(req) as resp:
                matches_data = json.loads(resp.read().decode())
        except Exception as e:
            print(f"[!] UEFA API hatası ({comp['name']}): {e}")
            continue

        matches_list = matches_data if isinstance(matches_data, list) else matches_data.get("matches", [])
        print(f"    -> {len(matches_list)} maç bulundu.")

        db_records = []
        for m in matches_list:
            match_id = m.get("id")
            if not match_id:
                continue

            h_team = m.get("homeTeam", {})
            a_team = m.get("awayTeam", {})
            h_name = h_team.get("internationalName") or h_team.get("name") or "TBD"
            a_name = a_team.get("internationalName") or a_team.get("name") or "TBD"

            if h_name == "TBD" and a_name == "TBD":
                continue

            round_info = m.get("round", {})
            round_name = round_info.get("name") or m.get("roundName") or "Lig Aşaması"
            matchday = m.get("matchday")
            if matchday:
                round_name = f"{matchday}. Hafta"

            score = m.get("score", {})
            total_score = score.get("total", {})
            h_score = total_score.get("home")
            a_score = total_score.get("away")

            status = "NS"
            status_raw = m.get("status", "")
            if status_raw in ["FINISHED", "FT"]:
                status = "FT"
            elif status_raw in ["LIVE", "IN_PLAY"]:
                status = "LIVE"
            elif status_raw in ["POSTPONED"]:
                status = "PST"

            utc_date = m.get("kickOffTime", {}).get("dateTime") or m.get("matchDate") or datetime.datetime.now().isoformat()

            int_api_id = int(str(match_id)[:9]) if str(match_id).isdigit() else abs(hash(str(match_id))) % 100000000

            db_records.append({
                "api_id": int_api_id,
                "tournament_id": t_id,
                "season": 2026,
                "round": str(round_name)[:250],
                "date": utc_date,
                "status": str(status)[:50],
                "home_team_id": h_team.get("id") or 0,
                "home_team_name": str(h_name)[:250],
                "home_team_country_code": str(get_country_code(h_name, h_team.get("countryCode")))[:10],
                "home_team_logo": str(h_team.get("logoUrl") or f"https://media.api-sports.io/football/teams/{h_team.get('id', 0)}.png"),
                "home_score": h_score,
                "home_is_winner": (h_score > a_score) if (h_score is not None and a_score is not None) else None,
                "away_team_id": a_team.get("id") or 0,
                "away_team_name": str(a_name)[:250],
                "away_team_country_code": str(get_country_code(a_name, a_team.get("countryCode")))[:10],
                "away_team_logo": str(a_team.get("logoUrl") or f"https://media.api-sports.io/football/teams/{a_team.get('id', 0)}.png"),
                "away_score": a_score,
                "away_is_winner": (a_score > h_score) if (h_score is not None and a_score is not None) else None,
                "home_score_90": h_score,
                "away_score_90": a_score,
                "updated_at": datetime.datetime.now().isoformat()
            })

        if db_records:
            cnt = supabase_upsert("cupmat_matches", db_records, on_conflict="api_id")
            total_inserted += cnt
            print(f"    [+] {cnt} maç veritabanına kaydedildi/güncellendi.")

    return total_inserted

def fetch_football_data_matches(tournament_map):
    """Football-Data.org üzerinden Şampiyonlar Ligi ve Copa Libertadores maçlarını çeker."""
    print("\n--- FOOTBALL-DATA.ORG MAÇLARI ÇEKİLİYOR ---")
    comps = [
        {"code": "CL", "target_api_id": 2, "name": "UEFA Şampiyonlar Ligi"},
        {"code": "CLI", "target_api_id": 13, "name": "Copa Libertadores"}
    ]
    
    total = 0
    for comp in comps:
        t_id = tournament_map.get(comp["target_api_id"])
        if not t_id:
            continue

        print(f"[+] {comp['name']} ({comp['code']}) çekiliyor...")
        url = f"https://api.football-data.org/v4/competitions/{comp['code']}/matches"
        req = urllib.request.Request(url, headers={"X-Auth-Token": FOOTBALL_DATA_TOKEN})
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
        except Exception as e:
            print(f"[!] Football-Data hatası ({comp['code']}): {e}")
            continue

        matches = data.get("matches", [])
        print(f"    -> {len(matches)} maç bulundu.")

        db_records = []
        for m in matches:
            h_team = m.get("homeTeam", {})
            a_team = m.get("awayTeam", {})
            h_name = h_team.get("shortName") or h_team.get("name")
            a_name = a_team.get("shortName") or a_team.get("name")

            if not h_name or not a_name:
                continue

            status = "NS"
            if m.get("status") == "FINISHED":
                status = "FT"
            elif m.get("status") in ["IN_PLAY", "PAUSED"]:
                status = "LIVE"
            elif m.get("status") == "POSTPONED":
                status = "PST"

            stage = m.get("stage", "Normal Sezon")
            matchday = m.get("matchday")
            round_name = f"{matchday}. Hafta" if matchday else stage

            score = m.get("score", {})
            fulltime = score.get("fullTime", {})
            h_score = fulltime.get("home")
            a_score = fulltime.get("away")

            db_records.append({
                "api_id": m.get("id"),
                "tournament_id": t_id,
                "season": 2026,
                "round": str(round_name)[:250],
                "date": m.get("utcDate"),
                "status": str(status)[:50],
                "home_team_id": h_team.get("id") or 0,
                "home_team_name": str(h_name)[:250],
                "home_team_country_code": str(get_country_code(h_name, h_team.get("tla")))[:10],
                "home_team_logo": h_team.get("crest"),
                "home_score": h_score,
                "home_is_winner": (score.get("winner") == "HOME_TEAM") if h_score is not None else None,
                "away_team_id": a_team.get("id") or 0,
                "away_team_name": str(a_name)[:250],
                "away_team_country_code": str(get_country_code(a_name, a_team.get("tla")))[:10],
                "away_team_logo": a_team.get("crest"),
                "away_score": a_score,
                "away_is_winner": (score.get("winner") == "AWAY_TEAM") if a_score is not None else None,
                "home_score_90": h_score,
                "away_score_90": a_score,
                "updated_at": datetime.datetime.now().isoformat()
            })

        if db_records:
            cnt = supabase_upsert("cupmat_matches", db_records, on_conflict="api_id")
            total += cnt
            print(f"    [+] {cnt} maç veritabanına işlendi.")

    return total

def fetch_api_football_leagues(tournament_map):
    """API-Football üzerinden Asya, Afrika, Amerika ve diğer kıta maçlarını çeker."""
    print("\n--- API-FOOTBALL KITASAL MAÇLAR ÇEKİLİYOR ---")
    
    # Çekilecek tüm kıtasal ligler ve sezonları (Tüm ön elemeler ve ana turlar dahil)
    leagues_to_sync = [
        {"api_id": 2, "season": 2024, "name": "UEFA Şampiyonlar Ligi (Ön Elemeler Dahil)"},
        {"api_id": 3, "season": 2024, "name": "UEFA Avrupa Ligi (Ön Elemeler Dahil)"},
        {"api_id": 848, "season": 2024, "name": "UEFA Konferans Ligi (Ön Elemeler Dahil)"},
        {"api_id": 5, "season": 2024, "name": "UEFA Uluslar Ligi"},
        {"api_id": 17, "season": 2024, "name": "AFC Şampiyonlar Ligi Elite"},
        {"api_id": 18, "season": 2024, "name": "AFC Şampiyonlar Ligi Two"},
        {"api_id": 12, "season": 2024, "name": "CAF Şampiyonlar Ligi"},
        {"api_id": 20, "season": 2024, "name": "CAF Konfederasyon Kupası"},
        {"api_id": 11, "season": 2024, "name": "Copa Sudamericana"},
        {"api_id": 16, "season": 2024, "name": "CONCACAF Şampiyonlar Kupası"},
        {"api_id": 34, "season": 2026, "name": "CONMEBOL Dünya Kupası Elemeleri"},
        {"api_id": 22, "season": 2024, "name": "CONCACAF Uluslar Ligi"}
    ]

    total = 0
    for item in leagues_to_sync:
        t_id = tournament_map.get(item["api_id"])
        if not t_id:
            continue

        print(f"[+] {item['name']} (Lig ID: {item['api_id']}, Sezon: {item['season']}) çekiliyor...")
        url = f"https://v3.football.api-sports.io/fixtures?league={item['api_id']}&season={item['season']}"
        req = urllib.request.Request(url, headers={
            "x-apisports-key": API_FOOTBALL_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": API_FOOTBALL_KEY,
            "User-Agent": "Mozilla/5.0"
        })

        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
        except Exception as e:
            print(f"[!] API-Football hatası ({item['name']}): {e}")
            continue

        fixtures = data.get("response", [])
        print(f"    -> {len(fixtures)} maç bulundu.")

        db_records = []
        for f in fixtures:
            fix = f.get("fixture", {})
            teams = f.get("teams", {})
            goals = f.get("goals", {})
            score = f.get("score", {})
            league = f.get("league", {})

            h_team = teams.get("home", {})
            a_team = teams.get("away", {})
            h_name = h_team.get("name") or "TBD"
            a_name = a_team.get("name") or "TBD"

            status_short = fix.get("status", {}).get("short", "NS")
            if status_short in ["FT", "AET", "PEN"]:
                status = "FT"
            elif status_short in ["1H", "2H", "HT", "LIVE"]:
                status = "LIVE"
            elif status_short in ["PST", "CANC"]:
                status = "PST"
            else:
                status = "NS"

            round_name = league.get("round") or "Grup Aşaması"

            db_records.append({
                "api_id": fix.get("id"),
                "tournament_id": t_id,
                "season": 2026,
                "round": str(round_name)[:250],
                "date": fix.get("date"),
                "status": str(status)[:50],
                "venue_name": str(fix.get("venue", {}).get("name") or "")[:250],
                "home_team_id": h_team.get("id") or 0,
                "home_team_name": str(h_name)[:250],
                "home_team_country_code": str(get_country_code(h_name))[:10],
                "home_team_logo": h_team.get("logo"),
                "home_score": goals.get("home"),
                "home_is_winner": h_team.get("winner"),
                "away_team_id": a_team.get("id") or 0,
                "away_team_name": str(a_name)[:250],
                "away_team_country_code": str(get_country_code(a_name))[:10],
                "away_team_logo": a_team.get("logo"),
                "away_score": goals.get("away"),
                "away_is_winner": a_team.get("winner"),
                "home_score_90": score.get("fulltime", {}).get("home") if score.get("fulltime", {}).get("home") is not None else goals.get("home"),
                "away_score_90": score.get("fulltime", {}).get("away") if score.get("fulltime", {}).get("away") is not None else goals.get("away"),
                "updated_at": datetime.datetime.now().isoformat()
            })

        if db_records:
            cnt = supabase_upsert("cupmat_matches", db_records, on_conflict="api_id")
            total += cnt
            print(f"    [+] {cnt} maç veritabanına işlendi.")

    return total

def main():
    print("=" * 65)
    print("   GLOBAL CUPMAT MAÇ VE FİKSTÜR SENKRONİZASYON MOTORU")
    print("=" * 65)

    tournament_map = init_tournaments()
    
    # 1. UEFA Resmi API (Şampiyonlar, Avrupa, Konferans, Uluslar)
    uefa_count = fetch_uefa_official_matches(tournament_map)

    # 2. Football-Data.org (Copa Libertadores & Diğerleri)
    fd_count = fetch_football_data_matches(tournament_map)

    # 3. API-Football Kıtasal Turnuvalar (Asya, Afrika, Amerika, CONCACAF)
    api_count = fetch_api_football_leagues(tournament_map)

    print("\n" + "=" * 65)
    print(f"[+] TOPLAM ISLENEN MAC SAYISI: {uefa_count + fd_count + api_count}")
    print("=" * 65)

if __name__ == '__main__':
    main()
