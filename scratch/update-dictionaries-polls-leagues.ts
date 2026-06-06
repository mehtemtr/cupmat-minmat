import * as fs from "fs";
import * as path from "path";

const dictionariesDir = path.join(process.cwd(), "dictionaries");

const newTranslations: Record<string, any> = {
  tr: {
    nav: {
      leagues: "Özel Ligler",
      polls: "Anket & Soru"
    },
    leagues: {
      title: "Özel Ligler",
      subtitle: "Kendi liderlik tablolarınızı oluşturun, arkadaşlarınızı davet edin ve kimin lider olduğunu görün!",
      createLeague: "Lig Oluştur",
      joinLeague: "Lige Katıl",
      leagueName: "Lig Adı",
      enterCode: "Giriş Kodunu Girin",
      joinBtn: "Katıl",
      createBtn: "Oluştur",
      emptyState: "Henüz hiçbir özel lige dahil değilsiniz.",
      createdBy: "Kurucu",
      membersCount: "üye",
      joinCode: "Giriş Kodu",
      copied: "Kopyalandı!",
      leaveLeague: "Ligden Ayrıl",
      typePredictions: "Tahmin Puanı",
      typeFantasy: "Fantezi Düello",
      typeTaraftar: "Taraftar Puanı",
      rank: "Sıra",
      user: "Kullanıcı",
      score: "Puan"
    },
    polls: {
      title: "Anket & Soru",
      subtitle: "Bilginizi test etmek ve Taraftar Puanı kazanmak için oy verin veya soruları yanıtlayın!",
      triviaHeader: "Bilgi Yarışması Sorusu",
      pollHeader: "Kamuoyu Anketi",
      pointsReward: "Ödül",
      correctAnswer: "Tebrikler! Doğru cevap.",
      incorrectAnswer: "Yanlış cevap! Doğru cevap: {answer}",
      votedHeader: "Cevabınız",
      pointsEarned: "+{points} Taraftar Puanı kazandınız!",
      noActive: "Şu anda aktif anket veya soru bulunmamaktadır. Daha sonra tekrar kontrol edin!",
      voteBtn: "Cevabı Gönder",
      alreadyVoted: "Bu soruyu zaten cevapladınız"
    }
  },
  en: {
    nav: {
      leagues: "Private Leagues",
      polls: "Polls & Trivia"
    },
    leagues: {
      title: "Private Leagues",
      subtitle: "Create custom leaderboards, invite your friends with a join code, and see who rules!",
      createLeague: "Create League",
      joinLeague: "Join League",
      leagueName: "League Name",
      enterCode: "Enter Join Code",
      joinBtn: "Join",
      createBtn: "Create",
      emptyState: "You are not in any custom leagues yet.",
      createdBy: "Created by",
      membersCount: "members",
      joinCode: "Join Code",
      copied: "Copied!",
      leaveLeague: "Leave League",
      typePredictions: "Predictions",
      typeFantasy: "Fantasy Duels",
      typeTaraftar: "Fan Points",
      rank: "Rank",
      user: "User",
      score: "Score"
    },
    polls: {
      title: "Polls & Trivia",
      subtitle: "Cast your vote or answer trivia questions to test your knowledge and earn Fan Points!",
      triviaHeader: "Trivia Question",
      pollHeader: "Opinion Poll",
      pointsReward: "Reward",
      correctAnswer: "Correct Answer!",
      incorrectAnswer: "Incorrect. The correct answer was: {answer}",
      votedHeader: "Your Response",
      pointsEarned: "You earned +{points} Fan Points!",
      noActive: "No active polls at the moment. Check back later!",
      voteBtn: "Submit Answer",
      alreadyVoted: "You have answered this question"
    }
  },
  es: {
    nav: {
      leagues: "Ligas Privadas",
      polls: "Encuestas y Preguntas"
    },
    leagues: {
      title: "Ligas Privadas",
      subtitle: "¡Crea tablas de clasificación personalizadas, invita a tus amigos y mira quién lidera!",
      createLeague: "Crear Liga",
      joinLeague: "Unirse a Liga",
      leagueName: "Nombre de la Liga",
      enterCode: "Introduce Código de Acceso",
      joinBtn: "Unirse",
      createBtn: "Crear",
      emptyState: "Aún no estás en ninguna liga privada.",
      createdBy: "Creado por",
      membersCount: "miembros",
      joinCode: "Código de Acceso",
      copied: "¡Copiado!",
      leaveLeague: "Salir de la Liga",
      typePredictions: "Predicciones",
      typeFantasy: "Duelos de Fantasía",
      typeTaraftar: "Puntos de Aficionado",
      rank: "Rango",
      user: "Usuario",
      score: "Puntos"
    },
    polls: {
      title: "Encuestas y Preguntas",
      subtitle: "¡Vota o responde preguntas para poner a cabo tus conocimientos y ganar puntos!",
      triviaHeader: "Pregunta de Trivia",
      pollHeader: "Encuesta de Opinión",
      pointsReward: "Premio",
      correctAnswer: "¡Respuesta Correcta!",
      incorrectAnswer: "Incorrecto. La respuesta correcta era: {answer}",
      votedHeader: "Tu Respuesta",
      pointsEarned: "¡Ganaste +{points} Puntos de Aficionado!",
      noActive: "No hay encuestas activas en este momento. ¡Vuelve más tarde!",
      voteBtn: "Enviar Respuesta",
      alreadyVoted: "Ya has respondido a esta pregunta"
    }
  },
  fr: {
    nav: {
      leagues: "Ligues Privées",
      polls: "Sondages et Questions"
    },
    leagues: {
      title: "Ligues Privées",
      subtitle: "Créez des classements personnalisés, invitez vos amis et découvrez qui est le leader !",
      createLeague: "Créer une Ligue",
      joinLeague: "Rejoindre une Ligue",
      leagueName: "Nom de la Ligue",
      enterCode: "Entrez le Code",
      joinBtn: "Rejoindre",
      createBtn: "Créer",
      emptyState: "Vous ne faites encore partie d'aucune ligue privée.",
      createdBy: "Créé par",
      membersCount: "membres",
      joinCode: "Code d'accès",
      copied: "Copié !",
      leaveLeague: "Quitter la Ligue",
      typePredictions: "Pronostics",
      typeFantasy: "Duels Fantasy",
      typeTaraftar: "Points de Supporters",
      rank: "Rang",
      user: "Utilisateur",
      score: "Score"
    },
    polls: {
      title: "Sondages et Questions",
      subtitle: "Votez ou répondez aux questions pour tester vos connaissances et gagner des points !",
      triviaHeader: "Question de Trivia",
      pollHeader: "Sondage d'Opinion",
      pointsReward: "Récompense",
      correctAnswer: "Bonne Réponse !",
      incorrectAnswer: "Incorrect. La bonne réponse était : {answer}",
      votedHeader: "Votre Réponse",
      pointsEarned: "Vous avez gagné +{points} Points de Supporters !",
      noActive: "Aucun sondage actif pour le moment. Revenez plus tard !",
      voteBtn: "Soumettre",
      alreadyVoted: "Vous avez déjà répondu à cette question"
    }
  },
  de: {
    nav: {
      leagues: "Private Ligen",
      polls: "Umfragen & Quiz"
    },
    leagues: {
      title: "Private Ligen",
      subtitle: "Erstelle eigene Ranglisten, lade deine Freunde ein und finde heraus, wer führt!",
      createLeague: "Liga erstellen",
      joinLeague: "Liga beitreten",
      leagueName: "Name der Liga",
      enterCode: "Zugangscode eingeben",
      joinBtn: "Beitreten",
      createBtn: "Erstellen",
      emptyState: "Du bist noch in keiner privaten Liga.",
      createdBy: "Erstellt von",
      membersCount: "Mitglieder",
      joinCode: "Zugangscode",
      copied: "Kopiert!",
      leaveLeague: "Liga verlassen",
      typePredictions: "Tipps",
      typeFantasy: "Fantasy-Duelle",
      typeTaraftar: "Fan-Punkte",
      rank: "Rang",
      user: "Benutzer",
      score: "Punkte"
    },
    polls: {
      title: "Umfragen & Quiz",
      subtitle: "Stimme ab oder beantworte Quizfragen, um dein Wissen zu testen und Fan-Punkte zu sammeln!",
      triviaHeader: "Quizfrage",
      pollHeader: "Meinungsumfrage",
      pointsReward: "Belohnung",
      correctAnswer: "Richtige Antwort!",
      incorrectAnswer: "Falsch. Die richtige Antwort war: {answer}",
      votedHeader: "Deine Antwort",
      pointsEarned: "Du hast +{points} Fan-Punkte verdient!",
      noActive: "Derzeit gibt es keine aktiven Umfragen. Schau später wieder vorbei!",
      voteBtn: "Antwort senden",
      alreadyVoted: "Du hast diese Frage bereits beantwortet"
    }
  },
  pt: {
    nav: {
      leagues: "Ligas Privadas",
      polls: "Enquetes e Perguntas"
    },
    leagues: {
      title: "Ligas Privadas",
      subtitle: "Crie tabelas de classificação personalizadas, convide seus amigos e veja quem lidera!",
      createLeague: "Criar Liga",
      joinLeague: "Participar da Liga",
      leagueName: "Nome da Liga",
      enterCode: "Insira o Código",
      joinBtn: "Participar",
      createBtn: "Criar",
      emptyState: "Você ainda não está em nenhuma liga privada.",
      createdBy: "Criado por",
      membersCount: "membros",
      joinCode: "Código de Acesso",
      copied: "Copiado!",
      leaveLeague: "Sair da Liga",
      typePredictions: "Palpites",
      typeFantasy: "Duels Fantasia",
      typeTaraftar: "Pontos de Torcedor",
      rank: "Classificação",
      user: "Usuário",
      score: "Pontuação"
    },
    polls: {
      title: "Enquetes e Perguntas",
      subtitle: "Vote ou responda às perguntas para testar seus conhecimentos e ganhar Pontos de Torcedor!",
      triviaHeader: "Pergunta de Trivia",
      pollHeader: "Pesquisa de Opinião",
      pointsReward: "Prêmio",
      correctAnswer: "Resposta Correta!",
      incorrectAnswer: "Incorreto. A resposta correta era: {answer}",
      votedHeader: "Sua Resposta",
      pointsEarned: "Você ganhou +{points} Pontos de Torcedor!",
      noActive: "Nenhuma enquete ativa no momento. Volte mais tarde!",
      voteBtn: "Enviar Resposta",
      alreadyVoted: "Você já respondeu a esta pergunta"
    }
  },
  it: {
    nav: {
      leagues: "Leghe Private",
      polls: "Sondaggi e Domande"
    },
    leagues: {
      title: "Leghe Private",
      subtitle: "Crea classifiche personalizzate, invita i tuoi amici e scopri chi comanda!",
      createLeague: "Crea Lega",
      joinLeague: "Unisciti alla Lega",
      leagueName: "Nome della Lega",
      enterCode: "Inserisci Codice",
      joinBtn: "Unisciti",
      createBtn: "Crea",
      emptyState: "Non fai ancora parte di nessuna lega privata.",
      createdBy: "Creato da",
      membersCount: "membri",
      joinCode: "Codice di Accesso",
      copied: "Copiato!",
      leaveLeague: "Lascia la Lega",
      typePredictions: "Pronostici",
      typeFantasy: "Duelli Fantasy",
      typeTaraftar: "Punti Tifoso",
      rank: "Posizione",
      user: "Utente",
      score: "Punteggio"
    },
    polls: {
      title: "Sondaggi e Domande",
      subtitle: "Vota o rispondi a domande per mettere alla prova la tua conoscenza e guadagnare Punti Tifoso!",
      triviaHeader: "Domanda di Trivia",
      pollHeader: "Sondaggio d'Opinione",
      pointsReward: "Premio",
      correctAnswer: "Risposta Corretta!",
      incorrectAnswer: "Errato. La risposta corretta era: {answer}",
      votedHeader: "La tua Risposta",
      pointsEarned: "Hai guadagnato +{points} Punti Tifoso!",
      noActive: "Nessun sondaggio attivo al momento. Riprova più tardi!",
      voteBtn: "Invia Risposta",
      alreadyVoted: "Hai già risposto a questa domanda"
    }
  },
  ko: {
    nav: {
      leagues: "사설 리그",
      polls: "설문 및 퀴즈"
    },
    leagues: {
      title: "사설 리그",
      subtitle: "맞춤형 순위표를 만들고, 코드로 친구들을 초대하여 누가 최고인지 겨뤄보세요!",
      createLeague: "리그 생성",
      joinLeague: "리그 참여",
      leagueName: "리그 이름",
      enterCode: "참여 코드 입력",
      joinBtn: "참여",
      createBtn: "생성",
      emptyState: "아직 가입한 사설 리그가 없습니다.",
      createdBy: "개설자",
      membersCount: "명",
      joinCode: "참여 코드",
      copied: "복사 완료!",
      leaveLeague: "리그 탈퇴",
      typePredictions: "예상 점수",
      typeFantasy: "판타지 듀얼",
      typeTaraftar: "팬 포인트",
      rank: "순위",
      user: "사용자",
      score: "점수"
    },
    polls: {
      title: "설문 및 퀴즈",
      subtitle: "투표하거나 퀴즈를 풀어 축구 지식을 테스트하고 팬 포인트를 획득하세요!",
      triviaHeader: "퀴즈 질문",
      pollHeader: "의견 설문",
      pointsReward: "보상",
      correctAnswer: "정답입니다!",
      incorrectAnswer: "오답입니다. 정답은 {answer} 입니다.",
      votedHeader: "제출한 답변",
      pointsEarned: "+{points} 팬 포인트를 획득하셨습니다!",
      noActive: "현재 활성화된 설문이나 퀴즈가 없습니다. 나중에 다시 확인해주세요!",
      voteBtn: "답변 제출",
      alreadyVoted: "이미 이 질문에 답변하셨습니다"
    }
  },
  ar: {
    nav: {
      leagues: "الدوريات الخاصة",
      polls: "الاستطلاعات والأسئلة"
    },
    leagues: {
      title: "الدوريات الخاصة",
      subtitle: "أنشئ لوحات صدارة مخصصة، وادعُ أصدقاءك برمز انضمام، واعرف من يتصدر!",
      createLeague: "إنشاء دوري",
      joinLeague: "انضمام لدوري",
      leagueName: "اسم الدوري",
      enterCode: "أدخل رمز الانضمام",
      joinBtn: "انضمام",
      createBtn: "إنشاء",
      emptyState: "لم تنضم إلى أي دوري خاص بعد.",
      createdBy: "أنشئت بواسطة",
      membersCount: "أعضاء",
      joinCode: "رمز الانضمام",
      copied: "تم النسخ!",
      leaveLeague: "مغادرة الدوري",
      typePredictions: "التوقعات",
      typeFantasy: "مبارزات الفانتزي",
      typeTaraftar: "نقاط المشجعين",
      rank: "الترتيب",
      user: "المستخدم",
      score: "النقاط"
    },
    polls: {
      title: "الاستطلاعات والأسئلة",
      subtitle: "صوّت أو أجب عن أسئلة معلوماتية لاختبار معرفتك وكسب نقاط المشجعين!",
      triviaHeader: "سؤال معلوماتي",
      pollHeader: "استطلاع رأي",
      pointsReward: "مكافأة",
      correctAnswer: "إجابة صحيحة!",
      incorrectAnswer: "خاطئ. الإجابة الصحيحة كانت: {answer}",
      votedHeader: "إجابتك",
      pointsEarned: "لقد كسبت +{points} من نقاط المشجعين!",
      noActive: "لا توجد استطلاعات نشطة حاليًا. تحقق لاحقًا!",
      voteBtn: "إرسال الإجابة",
      alreadyVoted: "لقد أجبت عن هذا السؤال بالفعل"
    }
  }
};

function updateFile(lang: string) {
  const filePath = path.join(dictionariesDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist. Skipping.`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  
  const trans = newTranslations[lang] || newTranslations["en"];

  // Update nav keys
  if (!data.nav) data.nav = {};
  data.nav.leagues = trans.nav.leagues;
  data.nav.polls = trans.nav.polls;

  // Add leagues and polls sections
  data.leagues = trans.leagues;
  data.polls = trans.polls;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Updated ${lang}.json successfully.`);
}

const languages = ["tr", "en", "es", "fr", "de", "pt", "it", "ko", "ar"];
languages.forEach(updateFile);
console.log("All language dictionaries updated successfully!");
