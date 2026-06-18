import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const translations = {
  tr: {
    badge: "YENİ REKOR",
    by: "Oyuncu:",
    score: "Puan:",
    category: "Kategori:",
    playText: "statmatik.com | Zeka ve Matematik Oyunu",
    modes: {
      add: "Toplama",
      sub: "Çıkarma",
      mul: "Çarpma",
      div: "Bölme",
      mix: "4 İşlem",
    },
  },
  en: {
    badge: "NEW RECORD",
    by: "Player:",
    score: "Score:",
    category: "Category:",
    playText: "statmatik.com | Brain & Math Game",
    modes: {
      add: "Addition",
      sub: "Subtraction",
      mul: "Multiplication",
      div: "Division",
      mix: "Mixed",
    },
  },
  de: {
    badge: "NEUER REKORD",
    by: "Spieler:",
    score: "Punkte:",
    category: "Kategorie:",
    playText: "statmatik.com | Gehirn- & Mathe-Spiel",
    modes: {
      add: "Addition",
      sub: "Subtraktion",
      mul: "Multiplikation",
      div: "Division",
      mix: "Gemischt",
    },
  },
  fr: {
    badge: "NOUVEAU RECORD",
    by: "Joueur:",
    score: "Score:",
    category: "Catégorie:",
    playText: "statmatik.com | Jeu de Cerveau & Maths",
    modes: {
      add: "Addition",
      sub: "Soustraction",
      mul: "Multiplication",
      div: "Division",
      mix: "Mélangé",
    },
  },
  es: {
    badge: "NUEVO RÉCORD",
    by: "Jugador:",
    score: "Puntos:",
    category: "Categoría:",
    playText: "statmatik.com | Juego Mental y Matemático",
    modes: {
      add: "Suma",
      sub: "Resta",
      mul: "Multiplicación",
      div: "División",
      mix: "Mixto",
    },
  },
  pt: {
    badge: "NOVO RECORDE",
    by: "Jogador:",
    score: "Pontos:",
    category: "Categoria:",
    playText: "statmatik.com | Jogo de Cérebro e Matemática",
    modes: {
      add: "Adição",
      sub: "Subtração",
      mul: "Multiplicação",
      div: "Divisão",
      mix: "Misto",
    },
  },
  it: {
    badge: "NUOVO RECORD",
    by: "Giocatore:",
    score: "Punteggio:",
    category: "Categoria:",
    playText: "statmatik.com | Gioco di Cervello e Matematica",
    modes: {
      add: "Addizione",
      sub: "Sottrazione",
      mul: "Moltiplicazione",
      div: "Divisione",
      mix: "Misto",
    },
  },
  ko: {
    badge: "새로운 기록",
    by: "플레이어:",
    score: "점수:",
    category: "카테고리:",
    playText: "statmatik.com | 두뇌 및 수학 게임",
    modes: {
      add: "더하기",
      sub: "빼기",
      mul: "곱하기",
      div: "나누기",
      mix: "종합",
    },
  },
  ar: {
    badge: "رقم قياسي جديد",
    by: "اللاعب:",
    score: "النقاط:",
    category: "الفئة:",
    playText: "statmatik.com | لعبة الذكاء والرياضيات",
    modes: {
      add: "الجمع",
      sub: "الطرح",
      mul: "الضرب",
      div: "القسمة",
      mix: "مختلط",
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get("score") || "0";
    const mode = searchParams.get("mode") || "mix";
    const name = searchParams.get("name") || "Oyuncu";
    const langParam = (searchParams.get("lang") || "tr").toLowerCase();
    const lang = (translations[langParam as keyof typeof translations] ? langParam : "tr") as keyof typeof translations;

    const t = translations[lang];
    const modeText = t.modes[mode as keyof typeof t.modes] || t.modes.mix;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#04080e",
            backgroundImage: "linear-gradient(to bottom right, #04080e, #01241a)",
            padding: "80px",
            fontFamily: "sans-serif",
            color: "white",
            position: "relative",
          }}
        >
          {/* Decorative glows */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "10%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.08)",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "10%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.08)",
              filter: "blur(60px)",
            }}
          />

          {/* Header Brand */}
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: "900",
                letterSpacing: "4px",
                color: "#10b981",
              }}
            >
              STATMATIK
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "8px 16px",
                borderRadius: "12px",
              }}
            >
              <span style={{ fontSize: "20px", marginRight: "8px" }}>🏆</span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#34d399",
                  letterSpacing: "1px",
                }}
              >
                {t.badge}
              </span>
            </div>
          </div>

          {/* Main Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            {/* Player details */}
            <span
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#e2e8f0",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              {name}
            </span>

            {/* Score & Category Details */}
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "24px",
                padding: "24px 48px",
                alignItems: "center",
                gap: "40px",
              }}
            >
              {/* Category */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  {t.category}
                </span>
                <span
                  style={{ fontSize: "24px", fontWeight: "800", color: "#f1f5f9" }}
                >
                  {modeText}
                </span>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "50px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              />

              {/* Score */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  {t.score}
                </span>
                <span
                  style={{
                    fontSize: "44px",
                    fontWeight: "900",
                    color: "#10b981",
                  }}
                >
                  {score}
                </span>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#475569",
              letterSpacing: "1px",
            }}
          >
            {t.playText}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("Failed to generate OG image:", e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
