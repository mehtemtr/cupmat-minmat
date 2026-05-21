export default function MinMatPage() {
  return (
    <html lang="tr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MinMat – Sayı Avı</title>
        <link rel="icon" href="/icon.png" type="image/png" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GMHYYVM3BK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', 'G-GMHYYVM3BK');
            `
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0)
                }
                50% {
                  transform: translateY(-8px)
                }
              }
              html,
              body {
                margin: 0;
                height: 100%;
                font-family: 'Inter', sans-serif;
                background: #04080e;
                color: white;
              }
              .screen {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                justify-content: center;
                align-items: center;
                flex-direction: column;
              }
              .active {
                display: flex;
              }
              #grid {
                display: grid;
                gap: 10px;
                margin-top: 20px;
              }
              .card {
                width: 70px;
                height: 70px;
                background: #334155;
                border-radius: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                background-image: url("/minmat/icon.png");
                background-size: 60%;
                background-repeat: no-repeat;
                background-position: center;
                color: transparent;
              }
              .card.open {
                background: #22c55e;
                color: white;
                background-image: none;
              }
              button {
                background: #1e293b;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 16px;
                font-family: 'Inter', sans-serif;
                transition: all 0.2s;
              }
              button:hover {
                background: #334155;
                transform: translateY(-1px);
              }
              .topRightNav {
                position: fixed;
                top: 16px;
                right: 16px;
                display: flex;
                gap: 10px;
                z-index: 10000;
              }
              .topRightBtn {
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                padding: 0;
              }
              .topRightBtn:hover {
                transform: translateY(-2px) scale(1.05);
                border-color: #22c55e;
                box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
                background: rgba(34, 197, 94, 0.15);
              }
              .menuCard {
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                background: #060b14;
                padding: 40px 32px 32px;
                text-align: center;
                width: 340px;
                max-width: 90vw;
                transition: transform 0.3s;
              }
              .menuLogo {
                width: 80px;
                height: 80px;
                margin: 0 auto 16px;
                border-radius: 20px;
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 30px rgba(34, 197, 94, 0.1);
                animation: float 4s ease-in-out infinite;
              }
              .menuLogo img {
                width: 50px;
                height: 50px;
                object-fit: contain;
              }
              .menuStartBtn {
                width: 100%;
                padding: 14px;
                border: none;
                border-radius: 14px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                font-size: 17px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.25s;
                font-family: 'Inter', sans-serif;
                letter-spacing: 0.5px;
              }
              .menuStartBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.35);
                filter: brightness(1.1);
              }
              .menuLeaderboardBtn {
                width: 100%;
                padding: 13px;
                margin-top: 10px;
                border: none;
                border-radius: 14px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.25s;
                font-family: 'Inter', sans-serif;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
              }
              .menuLeaderboardBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
                filter: brightness(1.1);
              }
              .menuHomeBtn {
                width: 100%;
                padding: 12px;
                margin-top: 10px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 14px;
                background: transparent;
                color: #94a3b8;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.25s;
                font-family: 'Inter', sans-serif;
              }
              .menuHomeBtn:hover {
                border-color: rgba(99, 102, 241, 0.4);
                background: rgba(99, 102, 241, 0.08);
                color: white;
              }
              .scoreRow {
                display: grid;
                grid-template-columns: 40px 80px 70px 80px 60px 80px;
                gap: 5px;
                align-items: center;
                padding: 8px;
                margin: 4px 0;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.08);
                font-size: 13px;
              }
              .scoreHead {
                font-weight: bold;
                color: #facc15;
              }
              .firstPlace {
                background: linear-gradient(90deg, #facc15, #ca8a04);
                color: black;
                font-weight: bold;
                transform: scale(1.03);
              }
              .secondPlace {
                background: linear-gradient(90deg, #a855f7, #6d28d9);
                font-weight: bold;
              }
              .thirdPlace {
                background: linear-gradient(90deg, #f97316, #ea580c);
                font-weight: bold;
              }
              .retryBtn {
                width: 100%;
                max-width: 480px;
                padding: 14px;
                border: none;
                border-radius: 14px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                font-size: 17px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.25s;
                font-family: 'Inter', sans-serif;
                letter-spacing: 0.5px;
              }
              .retryBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.35);
                filter: brightness(1.1);
              }
              .modal-backdrop {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(4, 8, 14, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 11000;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
              }
              .modal-backdrop.active {
                display: flex;
                opacity: 1;
              }
              .modal-container {
                background: linear-gradient(145deg, #0f172a, #04080e);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                width: 90%;
                max-width: 650px;
                max-height: 88vh;
                overflow-y: auto;
                padding: 24px 30px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(34, 197, 94, 0.1);
                position: relative;
                transform: scale(0.9);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Inter', sans-serif;
                box-sizing: border-box;
              }
              .modal-backdrop.active .modal-container {
                transform: scale(1);
              }
              .modal-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
              }
              .modal-logo {
                width: 42px;
                height: 42px;
                filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.5));
              }
              .modal-title {
                font-size: 22px;
                font-weight: 900;
                background: linear-gradient(135deg, #38bdf8, #22c55e);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 0;
                letter-spacing: 0.5px;
              }
              .modal-body {
                font-size: 14px;
                line-height: 1.5;
                color: #cbd5e1;
              }
              .modal-section-title {
                font-size: 15px;
                font-weight: 700;
                color: #38bdf8;
                margin-top: 15px;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .modal-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
              }
              .modal-list li {
                margin-bottom: 10px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
              }
              .modal-list li::before {
                content: "•";
                color: #22c55e;
                font-weight: bold;
              }
              .memorial-card {
                background: linear-gradient(135deg, rgba(234, 179, 8, 0.07), rgba(234, 179, 8, 0.02));
                border: 1px dashed rgba(234, 179, 8, 0.4);
                border-radius: 16px;
                padding: 15px;
                margin: 15px 0;
                text-align: center;
                box-shadow: 0 0 15px rgba(234, 179, 8, 0.05);
              }
              .memorial-title {
                font-size: 13px;
                font-weight: 800;
                color: #facc15;
                letter-spacing: 1.5px;
                margin-bottom: 8px;
                text-transform: uppercase;
              }
              .memorial-names {
                font-size: 14px;
                font-weight: 700;
                color: #fef08a;
                line-height: 1.7;
                text-shadow: 0 0 8px rgba(254, 240, 138, 0.2);
              }
              .memorial-footer {
                font-size: 11px;
                font-style: italic;
                color: #a1a1aa;
                margin-top: 8px;
              }
              .modal-footer-btn-container {
                display: flex;
                justify-content: flex-end;
                margin-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 10px;
              }
              .modal-close-btn {
                background: linear-gradient(135deg, #ef4444, #b91c1c);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 10px 24px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.25s;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                font-family: 'Inter', sans-serif;
              }
              .modal-close-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
                filter: brightness(1.1);
              }
              .authStatusVerified {
                margin-top: 10px;
                padding: 8px 12px;
                border-radius: 12px;
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.25);
                color: #4ade80;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                width: 100%;
                box-sizing: border-box;
              }
              .authStatusWarn {
                margin-top: 10px;
                padding: 10px 14px;
                border-radius: 12px;
                background: rgba(239, 68, 68, 0.08);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #f87171;
                font-size: 11px;
                font-weight: 600;
                line-height: 1.5;
                text-align: center;
                width: 100%;
                box-sizing: border-box;
              }
              .authLoginBtn {
                margin-top: 10px;
                width: 100%;
                padding: 12px;
                border-radius: 14px;
                border: 1px solid rgba(74, 222, 128, 0.4);
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2));
                color: white;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.25s;
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
              }
              .authLoginBtn:hover {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.35), rgba(59, 130, 246, 0.35));
                border-color: rgba(74, 222, 128, 0.6);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(34, 197, 94, 0.15);
              }
              .authSaveWarnBanner {
                margin: 14px 0;
                padding: 12px;
                border-radius: 14px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.25);
                color: #f87171;
                font-size: 11px;
                font-weight: 700;
                line-height: 1.5;
                text-align: center;
              }
            `
          }}
        />
      </head>
      <body>
        <div className="topRightNav">
          <button className="topRightBtn" onClick={() => (window as any).openAbout?.()} title="Hakkında">ℹ️</button>
          <button className="topRightBtn" onClick={() => (window as any).openHelp?.()} title="Yardım">❓</button>
        </div>
        <div id="menuScreen" className="screen active">
          <div className="menuCard">
            <div className="menuLangRow" id="menuLangRow">
              <button className="menuLangBtn" onClick={() => (window as any).setLang?.('tr')}>🇹🇷</button>
              <button className="menuLangBtn" onClick={() => (window as any).setLang?.('en')}>🇬🇧</button>
              <button className="menuLangBtn" onClick={() => (window as any).setLang?.('de')}>🇩🇪</button>
              <button className="menuLangBtn" onClick={() => (window as any).setLang?.('fr')}>🇫🇷</button>
              <button className="menuLangBtn" onClick={() => (window as any).setLang?.('es')}>🇪🇸</button>
            </div>
            <div className="menuLogo">
              <img src="/minmat/icon.png" alt="MinMat" />
            </div>
            <h1 className="menuTitle" style={{ display: 'none' }}>MinMat</h1>
            <p className="menuSub" id="menuSub" style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '10px 0 24px' }}>MinMat — Zeka ve Matematik Oyunu</p>
            <input id="playerInput" type="text" maxLength={20} placeholder="İsmini yaz..." />
            <div id="authContainer" style={{ width: '100%', marginBottom: '12px' }}></div>
            <button className="menuStartBtn" onClick={() => (window as any).startGame?.()} id="btnStart">Başla</button>
            <button className="menuLeaderboardBtn" onClick={() => (window as any).showLeaderboardDirectly?.()} id="btnLeaderboardMenu" disabled>🏆 Puan Tablosu</button>
            <button className="menuHomeBtn" onClick={() => window.location.href = '/'} id="btnHome">🏠 Ana Sayfaya Dön</button>
          </div>
        </div>
        <div id="gameScreen" className="screen">
          <div id="gameTitle">
            <h2 style={{ display: 'none' }}>MinMat</h2>
            <p id="gameSubtitle" style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px' }}>MinMat — Zeka ve Matematik Oyunu</p>
          </div>
          <div id="playerBar">
            <span id="playerText">👤 Oyuncu</span>
            <span id="modeText">🎯 Topla</span>
          </div>
          <div id="topBar">
            <div className="topRow">
              <span id="score">⭐ 0</span>
              <span id="time">⏱️ 30</span>
              <span id="levelLabel">Tur 1</span>
              <button id="pauseBtn" onClick={() => (window as any).togglePause?.()}>⏸️</button>
            </div>
            <div className="topRow">
              <span id="lives">❤️❤️❤️</span>
              <span id="wrongBar">⚠️ 0/3</span>
              <span id="combo">🔥 0</span>
              <span id="extraTimeBadge" className="extraTimeActive" style={{ display: 'none' }}></span>
            </div>
          </div>
          <div id="modeBox">
            <button id="modeBtn_add" onClick={() => (window as any).setMode?.('add')}>➕</button>
            <button id="modeBtn_sub" onClick={() => (window as any).setMode?.('sub')}>➖</button>
            <button id="modeBtn_mul" onClick={() => (window as any).setMode?.('mul')}>✖</button>
            <button id="modeBtn_div" onClick={() => (window as any).setMode?.('div')}>/</button>
            <button id="modeBtn_mix" onClick={() => (window as any).setMode?.('mix')}>🎲</button>
          </div>
          <div className="screenNav">
            <button className="navBtn" onClick={() => (window as any).backToMenu?.()}>🏠 <span id="navMenuText">Menü</span></button>
            <button className="navBtn" onClick={() => (window as any).showLeaderboardDirectly?.()} id="btnLeaderboardGame">🏆 Puan Tablosu</button>
            <button className="navBtn langToggle" onClick={() => (window as any).cycleLang?.()}>
              <span className="langIcon">🌐</span>
              <span id="gameLangLabel">TR</span>
            </button>
          </div>
          <div id="grid"></div>
        </div>
        <div id="levelEffect"></div>
        <div id="gameOverScreen" className="screen">
          <h1 id="gameOverTitle">Oyun Bitti</h1>
          <p id="finalScoreRow"><span id="scoreLabel">Puan</span>: <span id="finalScore"></span></p>
          <div id="authSaveContainer" style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}></div>
          <div id="scoreFilters">
            <button onClick={() => (window as any).setLeaderboardFilter?.('all')} id="btnFilterAll">Hepsi</button>
            <button onClick={() => (window as any).setLeaderboardFilter?.('add')}>➕</button>
            <button onClick={() => (window as any).setLeaderboardFilter?.('sub')}>➖</button>
            <button onClick={() => (window as any).setLeaderboardFilter?.('mul')}>✖️</button>
            <button onClick={() => (window as any).setLeaderboardFilter?.('div')}>/</button>
            <button onClick={() => (window as any).setLeaderboardFilter?.('mix')}>🎲</button>
          </div>
          <div id="leaderboardTabs" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
            <button onClick={() => (window as any).showScoreTab?.()} id="tabScores" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>🏆 Puan Tablosu</button>
            <button onClick={() => (window as any).showRewardTab?.()} id="tabRewards" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>🎁 Ödül Tablosu</button>
          </div>
          <div id="leaderboard"></div>
          <div id="rewardBoard" style={{ display: 'none' }}></div>
          <button className="retryBtn" onClick={() => (window as any).startGame?.()} id="btnRetry">🔄 Bir Daha</button>
          <div className="screenNav" style={{ marginTop: '14px', marginBottom: '20px' }}>
            <button className="navBtn" onClick={() => (window as any).backToMenu?.()}>🏠 <span id="navMenuText2">Menü</span></button>
            <button className="navBtn langToggle" onClick={() => (window as any).cycleLang?.()}>
              <span className="langIcon">🌐</span>
              <span id="goLangLabel">TR</span>
            </button>
          </div>
        </div>
        <div id="effects"></div>
        <div id="aboutModal" className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) (window as any).closeModal?.('aboutModal') }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <img src="/icon.png" className="modal-logo" alt="MahTEM Logo" />
              <h2 className="modal-title">MahTEM</h2>
            </div>
            <div className="modal-body">
              <p>Bu oyun; zihinden işlem hızını, matematiksel zekayı ve stratejik düşünmeyi eğlenceli bir şekilde geliştirmek amacıyla Cupmat & Minmat entegrasyonuyla hazırlanmıştır.</p>
              <div className="modal-section-title">🚀 Yapımcı Stüdyo</div>
              <p style={{ margin: '0 0 10px 15px', fontWeight: 600, color: 'white' }}>MahTEM Oyun Stüdyosu</p>
              <div className="modal-section-title">💻 Geliştirici Ekibi</div>
              <p style={{ margin: '0 0 10px 15px', fontWeight: 600, color: 'white' }}>Mehmet Ali Hayri Temizel & Mehtap Temizel & Harun Temizel</p>
              <div className="modal-section-title">📌 Sürüm</div>
              <p style={{ margin: '0 0 10px 15px', color: '#94a3b8' }}>v1.0.0 (Mayıs 2026)</p>
              <div className="memorial-card">
                <div className="memorial-title">✨ Anılarına, Saygı Sevgi ve Rahmetle ✨</div>
                <div className="memorial-names">
                  Mehmet Ali KILIÇ • Hayri TEMİZEL<br />
                  Lütfiye TEMİZEL • Hüseyin TEMİZEL<br />
                  Şükran TEMİZEL • Abdurrahman Hayri TEMİZEL
                </div>
                <div className="memorial-footer">Aziz anılarına ithaf edilmiştir. Ruhları şad olsun, isimleri hep yaşasın.</div>
              </div>
            </div>
            <div className="modal-footer-btn-container">
              <button className="modal-close-btn" onClick={() => (window as any).closeModal?.('aboutModal')}>❌ Kapat</button>
            </div>
          </div>
        </div>
        <div id="helpModal" className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) (window as any).closeModal?.('helpModal') }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' }}>❓</span>
              <h2 className="modal-title">Nasıl Oynanır?</h2>
            </div>
            <div className="modal-body">
              <ul className="modal-list">
                <li><strong>Mod Seçimi:</strong> Oyun ekranından oynamak istediğiniz matematik modunu (Toplama, Çıkarma, Çarpma, Bölme veya Karışık) seçin.</li>
                <li><strong>Eşleştirme:</strong> Ekranda gizlenen sayıları (örneğin işlem kartı "4 + 5" ile sonuç kartı "9") doğru eşleştirerek sayı avını başlatın.</li>
                <li><strong>Seviye Atlama:</strong> Süre bitmeden ve canlarınızı (❤️) tüketmeden tüm eşleşmeleri tamamlayarak bir sonraki seviyeye geçin.</li>
                <li><strong>Seviye Kilitleri:</strong> Toplama modunda 4. Seviyeye ulaştığınızda Çıkarma modunun kilidi otomatik olarak açılır! Sırasıyla diğer modların kilidini açarak devam edin.</li>
              </ul>
            </div>
            <div className="modal-footer-btn-container">
              <button className="modal-close-btn" onClick={() => (window as any).closeModal?.('helpModal')}>❌ Kapat</button>
            </div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let currentLang = localStorage.getItem("wc2026-locale") || localStorage.getItem("minmat_lang") || "tr";
              const translations = {
                tr: {
                  placeholder: "İsmini yaz...",
                  start: "Başla",
                  home: "🏠 Ana Sayfaya Dön",
                  puanTablosu: "🏆 Puan Tablosu",
                  gameOver: "Oyun Bitti",
                  score: "Puan",
                  again: "🔄 Bir Daha",
                  leaderAll: "🏆 En İyi Puanlar",
                  leaderAdd: "🏆 Topla Puanları",
                  leaderSub: "🏆 Çıkar Puanları",
                  leaderMul: "🏆 Çarp Puanları",
                  leaderDiv: "🏆 Böl Puanları",
                  leaderMix: "🏆 4 İşlem Puanları",
                  colName: "Ad",
                  colDate: "Tarih",
                  colCat: "Kategori",
                  colRound: "Tur",
                  colScore: "Puan",
                  modeAdd: "Toplama",
                  modeSub: "Çıkarma",
                  modeMul: "Çarpma",
                  modeDiv: "Bölme",
                  modeMix: "4 İşlem",
                  shortAdd: "Topla",
                  shortSub: "Çıkar",
                  shortMul: "Çarp",
                  shortDiv: "Böl",
                  shortMix: "4 İşlem",
                  round: "Tur",
                  nameErr: "İsim en az 3 karakter olmalı",
                  guest: "Misafir",
                  menu: "Menü",
                  subtitle: "MinMat — Zeka ve Matematik Oyunu",
                  all: "Hepsi",
                  authWarn: "⚠️ Global sıralamaya girmek ve ödül kazanmak için giriş yapmalısınız.",
                  authVerified: "✓ Doğrulanmış Hesap",
                  authLoginBtn: "🔑 Giriş Yap / Google ile Bağlan",
                  authSaveWarn: "⚠️ Giriş yapmadığınız için skorunuz dünya genel sıralamasına kaydedilemedi.",
                  signout: "Çıkış Yap"
                },
                en: {
                  placeholder: "Enter your name...",
                  start: "Start",
                  home: "🏠 Back to Home",
                  puanTablosu: "🏆 Leaderboard",
                  gameOver: "Game Over",
                  score: "Score",
                  again: "🔄 Play Again",
                  leaderAll: "🏆 Best Scores",
                  leaderAdd: "🏆 Addition Scores",
                  leaderSub: "🏆 Subtraction Scores",
                  leaderMul: "🏆 Multiplication Scores",
                  leaderDiv: "🏆 Division Scores",
                  leaderMix: "🏆 Mixed Scores",
                  colName: "Name",
                  colDate: "Date",
                  colCat: "Category",
                  colRound: "Round",
                  colScore: "Score",
                  modeAdd: "Addition",
                  modeSub: "Subtraction",
                  modeMul: "Multiplication",
                  modeDiv: "Division",
                  modeMix: "Mixed",
                  shortAdd: "Add",
                  shortSub: "Sub",
                  shortMul: "Mul",
                  shortDiv: "Div",
                  shortMix: "Mix",
                  round: "Round",
                  nameErr: "Name must be at least 3 characters",
                  guest: "Guest",
                  menu: "Menu",
                  subtitle: "MinMat — Brain & Math Game",
                  all: "All",
                  authWarn: "⚠️ You must sign in to enter the global leaderboard and win prizes.",
                  authVerified: "✓ Verified Account",
                  authLoginBtn: "🔑 Sign In / Connect with Google",
                  authSaveWarn: "⚠️ Since you are not signed in, your score could not be saved to the global rankings.",
                  signout: "Sign Out"
                },
                de: {
                  placeholder: "Name eingeben...",
                  start: "Starten",
                  home: "🏠 Zurück zur Startseite",
                  puanTablosu: "🏆 Bestenliste",
                  gameOver: "Spiel Vorbei",
                  score: "Punkte",
                  again: "🔄 Nochmal",
                  leaderAll: "🏆 Beste Punkte",
                  leaderAdd: "🏆 Addition Punkte",
                  leaderSub: "🏆 Subtraktion Punkte",
                  leaderMul: "🏆 Multiplikation Punkte",
                  leaderDiv: "🏆 Division Punkte",
                  leaderMix: "🏆 Gemischt Punkte",
                  colName: "Name",
                  colDate: "Datum",
                  colCat: "Kategorie",
                  colRound: "Runde",
                  colScore: "Punkte",
                  modeAdd: "Addition",
                  modeSub: "Subtraktion",
                  modeMul: "Multiplikation",
                  modeDiv: "Division",
                  modeMix: "Gemischt",
                  shortAdd: "Add",
                  shortSub: "Sub",
                  shortMul: "Mul",
                  shortDiv: "Div",
                  shortMix: "Mix",
                  round: "Runde",
                  nameErr: "Name muss mindestens 3 Zeichen haben",
                  guest: "Gast",
                  menu: "Menü",
                  subtitle: "MinMat — Gehirn- & Mathe-Spiel",
                  all: "Alle",
                  authWarn: "⚠️ Sie müssen sich anmelden, um an der globalen Bestenliste teilzunehmen.",
                  authVerified: "✓ Verifiziertes Konto",
                  authLoginBtn: "🔑 Einloggen / Google-Verbindung",
                  authSaveWarn: "⚠️ Da Sie nicht angemeldet sind, wurde Ihr Punktestand nicht in die globale Liste eingetragen.",
                  signout: "Abmelden"
                },
                fr: {
                  placeholder: "Entrez votre nom...",
                  start: "Commencer",
                  home: "🏠 Retour à l'accueil",
                  puanTablosu: "🏆 Classement",
                  gameOver: "Jeu Terminé",
                  score: "Score",
                  again: "🔄 Rejouer",
                  leaderAll: "🏆 Meilleurs Scores",
                  leaderAdd: "🏆 Scores Addition",
                  leaderSub: "🏆 Scores Soustraction",
                  leaderMul: "🏆 Scores Multiplication",
                  leaderDiv: "🏆 Scores Division",
                  leaderMix: "🏆 Scores Mixte",
                  colName: "Nom",
                  colDate: "Date",
                  colCat: "Catégorie",
                  colRound: "Tour",
                  colScore: "Score",
                  modeAdd: "Addition",
                  modeSub: "Soustraction",
                  modeMul: "Multiplication",
                  modeDiv: "Division",
                  modeMix: "Mixte",
                  shortAdd: "Add",
                  shortSub: "Sub",
                  shortMul: "Mul",
                  shortDiv: "Div",
                  shortMix: "Mix",
                  round: "Tour",
                  nameErr: "Le nom doit comporter au moins 3 caractères",
                  guest: "Invité",
                  menu: "Menu",
                  subtitle: "MinMat — Jeu de Cerveau & de Mathématiques",
                  all: "Tous",
                  authWarn: "⚠️ Vous devez vous connecter pour figurer dans le classement mondial et gagner des prix.",
                  authVerified: "✓ Compte Vérifié",
                  authLoginBtn: "🔑 Se connecter / Google",
                  authSaveWarn: "⚠️ Comme vous n'êtes pas connecté, votre score n'a pas pu être enregistré.",
                  signout: "Déconnexion"
                },
                es: {
                  placeholder: "Ingresa tu nombre...",
                  start: "Comenzar",
                  home: "🏠 Ir al Inicio",
                  puanTablosu: "🏆 Clasificación",
                  gameOver: "Juego Terminado",
                  score: "Puntuación",
                  again: "🔄 Jugar de Nuevo",
                  leaderAll: "🏆 Mejores Puntuaciones",
                  leaderAdd: "🏆 Puntos Suma",
                  leaderSub: "🏆 Puntos Resta",
                  leaderMul: "🏆 Puntos Multiplicación",
                  leaderDiv: "🏆 Puntos División",
                  leaderMix: "🏆 Puntos Mixto",
                  colName: "Nombre",
                  colDate: "Fecha",
                  colCat: "Categoría",
                  colRound: "Ronda",
                  colScore: "Puntos",
                  modeAdd: "Suma",
                  modeSub: "Resta",
                  modeMul: "Multiplicación",
                  modeDiv: "División",
                  modeMix: "Mixto",
                  shortAdd: "Suma",
                  shortSub: "Resta",
                  shortMul: "Mult",
                  shortDiv: "Div",
                  shortMix: "Mix",
                  round: "Ronda",
                  nameErr: "El nombre debe tener al menos 3 caracteres",
                  guest: "Invitado",
                  menu: "Menü",
                  subtitle: "MinMat — Juego de Cerebro y Matemáticas",
                  all: "Todos",
                  authWarn: "⚠️ Debes iniciar sesión para ingresar a la tabla de clasificación global y ganar premios.",
                  authVerified: "✓ Cuenta Verificada",
                  authLoginBtn: "🔑 Iniciar Sesión / Google",
                  authSaveWarn: "⚠️ Como no has iniciado sesión, tu puntuación no se pudo guardar en la tabla global."
                }
              };
              function t(key) {
                let lang = translations[currentLang] || translations["tr"];
                return lang[key] || translations["tr"][key] || key;
              }
              window.setLang = function(lang) {
                currentLang = lang;
                localStorage.setItem("wc2026-locale", lang);
                localStorage.setItem("minmat_lang", lang);
                applyLang();
              };
              function applyLang() {
                let pi = document.getElementById("playerInput");
                if (pi) pi.placeholder = t("placeholder");
                let bs = document.getElementById("btnStart");
                if (bs) bs.innerText = t("start");
                let bh = document.getElementById("btnHome");
                if (bh) bh.innerText = t("home");
                let blm = document.getElementById("btnLeaderboardMenu");
                if (blm) blm.innerText = t("puanTablosu");
                let blg = document.getElementById("btnLeaderboardGame");
                if (blg) blg.innerText = t("puanTablosu");
                let go = document.getElementById("gameOverTitle");
                if (go) go.innerText = t("gameOver");
                let ra = document.getElementById("btnRetry");
                if (ra) ra.innerText = t("again");
                let ms = document.getElementById("menuSub");
                if (ms) ms.innerText = t("subtitle");
                let nm = document.getElementById("navMenuText");
                if (nm) nm.innerText = t("menu");
                let nm2 = document.getElementById("navMenuText2");
                if (nm2) nm2.innerText = t("menu");
                let langUp = currentLang.toUpperCase();
                let gl = document.getElementById("gameLangLabel");
                if (gl) gl.innerText = langUp;
                let gol = document.getElementById("goLangLabel");
                if (gol) gol.innerText = langUp;
              }
              window.cycleLang = function() {
                const langs = ["tr", "en", "de", "fr", "es"];
                const idx = langs.indexOf(currentLang);
                window.setLang(langs[(idx + 1) % langs.length]);
              };
              let isGameOver = false;
              let isPaused = false;
              let lock = false;
              let first = null;
              let matched = 0;
              let totalPairs = 0;
              let score = 0;
              let level = 1;
              let timeLeft = 30;
              let lives = 3;
              let wrongCount = 0;
              let combo = 0;
              let gameMode = "add";
              let leaderboardFilter = "all";
              let playerName = "";
              let isGameOverSaved = false;
              let timer = null;
              let userSession = {
                isAuthenticated: false,
                fullName: ""
              };
              let extraTimeSeconds = 0;
              const unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || JSON.stringify({ add: 1, sub: 0, mul: 0, div: 0 }));
              function rand(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
              }
              function updateLivesUI() {
                let text = "";
                for (let i = 0; i < lives; i++) {
                  text += "❤️";
                }
                document.getElementById("lives").innerText = text;
              }
              function showEffect(text) {
                let e = document.createElement("div");
                e.className = "effect";
                e.innerText = text;
                document.body.appendChild(e);
                setTimeout(() => { e.remove(); }, 800);
              }
              function animateLives() {
                let el = document.getElementById("lives");
                if (!el) return;
                el.classList.add("heartPop");
                setTimeout(() => { el.classList.remove("heartPop"); }, 800);
              }
              async function checkAuth() {
                try {
                  const res = await fetch("/api/auth/session");
                  if (res.ok) {
                    const data = await res.json();
                    userSession = {
                      isAuthenticated: data.isSignedIn,
                      fullName: data.fullName || ""
                    };
                  }
                } catch (e) {
                  console.error("Auth check failed", e);
                }
                updateAuthUI();
              }
              function updateAuthUI() {
                const authContainer = document.getElementById("authContainer");
                const authSaveContainer = document.getElementById("authSaveContainer");
                if (!authContainer) return;
                if (userSession.isAuthenticated) {
                  authContainer.innerHTML = \`
                    <div class="authStatusVerified">
                      ✅ \${t("authVerified")}: \${userSession.fullName}
                      <button onclick="signOut()" style="margin-left:10px; padding:4px 8px; border-radius:8px; border:1px solid rgba(239,68,68,0.3); background:rgba(239,68,68,0.1); color:#f87171; cursor:pointer; font-size:11px; font-weight:700;">
                        \${t("signout")}
                      </button>
                    </div>
                  \`;
                  if (authSaveContainer) authSaveContainer.innerHTML = "";
                  const leaderboardBtnMenu = document.getElementById("btnLeaderboardMenu");
                  if (leaderboardBtnMenu) leaderboardBtnMenu.disabled = false;
                } else {
                  authContainer.innerHTML = \`
                    <div class="authStatusWarn">\${t("authWarn")}</div>
                    <button class="authLoginBtn" onclick="signIn()">\${t("authLoginBtn")}</button>
                  \`;
                  if (authSaveContainer) {
                    authSaveContainer.innerHTML = \`
                      <div class="authSaveWarnBanner">\${t("authSaveWarn")}</div>
                    \`;
                  }
                  const leaderboardBtnMenu = document.getElementById("btnLeaderboardMenu");
                  if (leaderboardBtnMenu) leaderboardBtnMenu.disabled = true;
                }
              }
              async function signIn() {
                window.location.href = "/";
              }
              async function signOut() {
                window.location.href = "/auth-signout";
              }
              function show(screenId) {
                document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
                document.getElementById(screenId).classList.add("active");
              }
              window.openAbout = function() {
                document.getElementById("aboutModal").classList.add("active");
              };
              window.openHelp = function() {
                document.getElementById("helpModal").classList.add("active");
              };
              window.closeModal = function(modalId) {
                document.getElementById(modalId).classList.remove("active");
              };
              function updateModeButtons() {
                document.querySelectorAll("#modeBox button").forEach(btn => btn.classList.remove("modeActive", "modeLocked"));
                const currentBtn = document.getElementById("modeBtn_" + gameMode);
                if (currentBtn) currentBtn.classList.add("modeActive");
                const modes = ["add", "sub", "mul", "div"];
                modes.forEach((mode, idx) => {
                  const btn = document.getElementById("modeBtn_" + mode);
                  if (!btn) return;
                  if (unlockedLevels[mode] === 0 && idx !== 0) {
                    btn.classList.add("modeLocked");
                  }
                });
              }
              window.setMode = function(mode) {
                const modes = ["add", "sub", "mul", "div"];
                const idx = modes.indexOf(mode);
                if (idx !== 0 && unlockedLevels[mode] === 0) return;
                gameMode = mode;
                updateModeButtons();
                document.getElementById("modeText").innerText = "🎯 " + t("mode" + mode.charAt(0).toUpperCase() + mode.slice(1));
              };
              function updateUI() {
                document.getElementById("score").innerText = "⭐ " + score;
                document.getElementById("levelLabel").innerText = t("round") + " " + level;
                document.getElementById("time").innerText = "⏱️ " + timeLeft;
                document.getElementById("combo").innerText = "🔥 " + combo;
                updateLivesUI();
                let wrongBar = document.getElementById("wrongBar");
                if (wrongBar) wrongBar.innerText = "⚠️ " + wrongCount + "/3";
                let timeEl = document.getElementById("time");
                if (timeLeft <= 5) {
                  timeEl.classList.add("timeWarning");
                } else {
                  timeEl.classList.remove("timeWarning");
                }
              }
              function createCards() {
                let a, b, question, answer;
                let pairCount = level + 2;
                totalPairs = pairCount * 2;
                let arr = [];
                let used = new Set();
                for (let i = 0; i < pairCount; i++) {
                  let currentMode = gameMode;
                  if (gameMode === "mix") {
                    let modes = ["add", "sub", "mul", "div"];
                    currentMode = modes[Math.floor(Math.random() * modes.length)];
                  }
                  let tries = 0;
                  do {
                    let currentMode = gameMode;
                    if (gameMode === "mix") {
                      let modes = ["add", "sub", "mul", "div"];
                      currentMode = modes[Math.floor(Math.random() * modes.length)];
                    }
                    if (currentMode === "add") {
                      let max = level * 5;
                      if (max > 50) max = 50;
                      a = rand(1, max);
                      b = rand(1, max);
                      question = a + " + " + b;
                      answer = a + b;
                    } else if (currentMode === "sub") {
                      a = rand(1, level * 5);
                      b = rand(1, level * 5);
                      if (a < b) { let t = a; a = b; b = t; }
                      question = a + " - " + b;
                      answer = a - b;
                    } else if (currentMode === "mul") {
                      let mulMax = 3 + level * 2;
                      if (mulMax > 12) mulMax = 12;
                      a = rand(1, mulMax);
                      b = rand(1, mulMax);
                      question = a + " × " + b;
                      answer = a * b;
                    } else if (currentMode === "div") {
                      let divMax = 3 + level;
                      if (divMax > 12) divMax = 12;
                      answer = rand(1, divMax);
                      b = rand(1, divMax);
                      a = answer * b;
                      question = a + " / " + b;
                    }
                    tries++;
                  } while (used.has(answer) && tries < 50);
                  used.add(answer);
                  arr.push({ text: question, match: answer });
                  arr.push({ text: answer, match: question });
                }
                arr.sort(() => Math.random() - 0.5);
                const grid = document.getElementById("grid");
                if (!grid) return;
                grid.innerHTML = "";
                arr.forEach((item, index) => {
                  const card = document.createElement("div");
                  card.className = "card";
                  card.dataset.index = index;
                  card.dataset.match = item.match;
                  card.innerHTML = \`<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">\${item.text}</div>\`;
                  card.onclick = () => handleCardClick(card, item);
                  grid.appendChild(card);
                });
              }
              function handleCardClick(card, item) {
                if (lock || isPaused || isGameOver) return;
                if (card.classList.contains("open")) return;
                card.classList.add("open");
                if (!first) {
                  first = card;
                  return;
                }
                lock = true;
                if (first.dataset.match == card.dataset.match || first.innerText == card.dataset.match || card.innerText == first.dataset.match) {
                  matched++;
                  combo++;
                  score += 10 * (1 + combo * 0.1);
                  showEffect("+10");
                  if (matched === totalPairs / 2) {
                    clearInterval(timer);
                    if (unlockedLevels[gameMode] < level + 1) {
                      unlockedLevels[gameMode] = level + 1;
                      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
                    }
                    level++;
                    setTimeout(() => {
                      startLevel();
                      showLevelEffect();
                    }, 500);
                  }
                } else {
                  combo = 0;
                  wrongCount++;
                  lives--;
                  animateLives();
                  setTimeout(() => {
                    first.classList.remove("open");
                    card.classList.remove("open");
                  }, 500);
                  if (wrongCount >= 3) {
                    wrongCount = 0;
                  }
                  if (lives <= 0) {
                    gameOver();
                  }
                }
                first = null;
                lock = false;
                updateUI();
              }
              function showLevelEffect() {
                let e = document.getElementById("levelEffect");
                if (!e) return;
                e.innerText = t("round") + " " + level;
                e.classList.remove("levelAnim");
                void e.offsetWidth;
                e.classList.add("levelAnim");
              }
              window.togglePause = function() {
                if (isGameOver) return;
                isPaused = !isPaused;
                let btn = document.getElementById("pauseBtn");
                if (isPaused) {
                  clearInterval(timer);
                  btn.innerText = "▶️";
                } else {
                  startTimer();
                  btn.innerText = "⏸️";
                }
              };
              function startTimer() {
                clearInterval(timer);
                timer = setInterval(() => {
                  timeLeft--;
                  updateUI();
                  let timeEl = document.getElementById("time");
                  if (timeLeft <= 5) {
                    timeEl.classList.add("timeWarning");
                  } else {
                    timeEl.classList.remove("timeWarning");
                  }
                  if (timeLeft <= 0) {
                    clearInterval(timer);
                    timeLeft = 0;
                    updateUI();
                    console.log("GAME OVER");
                    gameOver();
                    return;
                  }
                }, 1000);
              }
              function startLevel() {
                lock = false;
                first = null;
                matched = 0;
                createCards();
                let pairs = totalPairs / 2;
                let timePerPair = Math.max(8 - level * 0.5, 4);
                timeLeft = Math.floor(pairs * timePerPair);
                updateUI();
                startTimer();
                showEffect(t("round") + " " + level);
                if (level === 1) {
                  timeLeft = 30;
                } else {
                  timeLeft += 3;
                }
                if (extraTimeSeconds > 0) {
                  timeLeft += extraTimeSeconds;
                }
                updateUI();
                startTimer();
              }
              window.startGame = async function() {
                const pi = document.getElementById("playerInput");
                if (pi && pi.value.trim().length < 3) {
                  alert(t("nameErr"));
                  return;
                }
                playerName = (pi ? pi.value.trim() : "") || t("guest");
                isGameOver = false;
                isPaused = false;
                isGameOverSaved = false;
                score = 0;
                level = 1;
                lives = 3;
                wrongCount = 0;
                combo = 0;
                extraTimeSeconds = 0;
                document.getElementById("playerText").innerText = "👤 " + playerName;
                try {
                  const res = await fetch("/api/gamification?displayName=" + encodeURIComponent(playerName));
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.profile && typeof data.profile.minmatEkSure === "number" && data.profile.minmatEkSure > 0) {
                      extraTimeSeconds = data.profile.minmatEkSure;
                      const badgeEl = document.getElementById("extraTimeBadge");
                      if (badgeEl) {
                        let suffix = "sn Bonus";
                        if (currentLang === "en") suffix = "s Bonus";
                        else if (currentLang === "de") suffix = "s Bonus";
                        else if (currentLang === "fr") suffix = "s Bonus";
                        else if (currentLang === "es") suffix = "s Bono";
                        badgeEl.innerText = "+" + extraTimeSeconds + suffix;
                        badgeEl.style.display = "inline-flex";
                      }
                    }
                  }
                } catch (err) {
                  console.error("Failed to load minmatEkSure:", err);
                }
                startLevel();
                show("gameScreen");
                updateModeButtons();
              };
              window.backToMenu = function() {
                clearInterval(timer);
                show("menuScreen");
              };
              function gameOver() {
                isGameOver = true;
                clearInterval(timer);
                document.getElementById("finalScore").innerText = score;
                show("gameOverScreen");
                saveScore();
              }
              async function saveScore() {
                if (isGameOverSaved) return;
                isGameOverSaved = true;
                updateAuthUI();
                if (!userSession.isAuthenticated) {
                  console.log("Score not saved globally: user is not authenticated.");
                  renderLeaderboard();
                  return;
                }
                const scoreEntry = {
                  name: playerName || t("guest"),
                  score: score,
                  level: level,
                  mode: gameMode,
                  date: new Date().toLocaleDateString("tr-TR")
                };
                try {
                  const response = await fetch("/api/minmat-leaderboard", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify(scoreEntry)
                  });
                  if (!response.ok) {
                    console.error("Failed to save score to global leaderboard");
                  }
                } catch (error) {
                  console.error("Failed to POST global score:", error);
                }
                renderLeaderboard();
              }
              async function renderLeaderboard() {
                let filterKey = "leaderAll";
                if (leaderboardFilter === "add") filterKey = "leaderAdd";
                else if (leaderboardFilter === "sub") filterKey = "leaderSub";
                else if (leaderboardFilter === "mul") filterKey = "leaderMul";
                else if (leaderboardFilter === "div") filterKey = "leaderDiv";
                else if (leaderboardFilter === "mix") filterKey = "leaderMix";
                let titleText = t(filterKey);
                document.getElementById("leaderboard").innerHTML = \`<div style="text-align:center; padding: 20px; color: #94a3b8;">⏳ Yükleniyor... / Loading...</div>\`;
                let scores = [];
                try {
                  const response = await fetch("/api/minmat-leaderboard");
                  if (response.ok) {
                    const data = await response.json();
                    scores = data.leaderboard || [];
                  }
                } catch (error) {
                  console.error("Failed to fetch global leaderboard:", error);
                  scores = JSON.parse(localStorage.getItem("scores")) || [];
                }
                if (leaderboardFilter !== "all") {
                  scores = scores.filter(s => s.mode === leaderboardFilter);
                }
                scores = scores.slice(0, 10);
                let html = \`
                  <h3 id="leaderboardTitle">\${titleText}</h3>
                  <div class="scoreRow scoreHead">
                    <span>#</span>
                    <span>\${t("colName")}</span>
                    <span>\${t("colDate")}</span>
                    <span>\${t("colCat")}</span>
                    <span>\${t("colRound")}</span>
                    <span>\${t("colScore")}</span>
                  </div>
                \`;
                scores.forEach((s, i) => {
                  let medal = i + 1;
                  if (i === 0) medal = "🏆";
                  if (i === 1) medal = "⚡";
                  if (i === 2) medal = "🔥";
                  let cls = "";
                  if (i === 0) cls = "firstPlace";
                  if (i === 1) cls = "secondPlace";
                  if (i === 2) cls = "thirdPlace";
                  html += \`
                    <div class="scoreRow \${cls}">
                      <span>\${medal}</span>
                      <span>\${escapeHTML(s.name)}</span>
                      <span>\${escapeHTML(s.date)}</span>
                      <span>\${modeName(s.mode)}</span>
                      <span>Lv\${s.level}</span>
                      <span>⭐ \${s.score}</span>
                    </div>
                  \`;
                });
                document.getElementById("leaderboard").innerHTML = html;
              }
              function escapeHTML(str) {
                if (!str) return "";
                return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
              }
              window.setLeaderboardFilter = function(mode) {
                leaderboardFilter = mode;
                renderLeaderboard();
              };
              window.showScoreTab = function() {
                document.getElementById("leaderboard").style.display = "";
                document.getElementById("rewardBoard").style.display = "none";
                document.getElementById("scoreFilters").style.display = "";
                const tabS = document.getElementById("tabScores");
                const tabR = document.getElementById("tabRewards");
                tabS.style.background = "rgba(16,185,129,0.2)";
                tabS.style.color = "#6ee7b7";
                tabS.style.borderColor = "rgba(255,255,255,0.15)";
                tabR.style.background = "rgba(255,255,255,0.05)";
                tabR.style.color = "#94a3b8";
                tabR.style.borderColor = "rgba(255,255,255,0.1)";
              };
              window.showRewardTab = function() {
                document.getElementById("leaderboard").style.display = "none";
                document.getElementById("rewardBoard").style.display = "";
                document.getElementById("scoreFilters").style.display = "none";
                const tabS = document.getElementById("tabScores");
                const tabR = document.getElementById("tabRewards");
                tabR.style.background = "rgba(245,158,11,0.2)";
                tabR.style.color = "#fbbf24";
                tabR.style.borderColor = "rgba(245,158,11,0.3)";
                tabS.style.background = "rgba(255,255,255,0.05)";
                tabS.style.color = "#94a3b8";
                tabS.style.borderColor = "rgba(255,255,255,0.1)";
                renderRewardBoard();
              };
              async function renderRewardBoard() {
                const board = document.getElementById("rewardBoard");
                board.innerHTML = \`<div style="text-align:center; padding:20px; color:#94a3b8;">⏳ Yükleniyor...</div>\`;
                try {
                  const res = await fetch("/api/gamification");
                  const data = await res.json();
                  if (!data.success) throw new Error("API error");
                  const cupRewards = data.cupMatRewards || [];
                  const minRewards = data.minMatRewards || [];
                  let html = "";
                  html += \`<div style="margin-bottom:20px;">\`;
                  html += \`<h3 style="text-align:center; color:#fbbf24; font-size:16px; margin-bottom:8px;">🏆 CupMat Ödül Sıralaması</h3>\`;
                  html += \`<p style="text-align:center; color:#94a3b8; font-size:11px; margin-bottom:10px;">Periyot sonunda ilk 3'e girenlere MinMat ödülleri verilir</p>\`;
                  if (cupRewards.length === 0) {
                    html += \`<div style="text-align:center; padding:12px; color:#64748b; font-size:13px;">Henüz uygun kullanıcı yok</div>\`;
                  } else {
                    cupRewards.slice(0, 5).forEach(function(e) {
                      const medal = e.rank === 1 ? "🏆" : e.rank === 2 ? "⚡" : e.rank === 3 ? "🔥" : e.rank;
                      const bg = e.rank <= 3 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)";
                      const border = e.rank <= 3 ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)";
                      html += \`<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin:4px 0; border-radius:8px; background:\${bg}; border:1px solid \${border};">\`;
                      html += \`<div style="display:flex; align-items:center; gap:8px;">\`;
                      html += \`<span style="font-size:14px; min-width:24px; text-align:center;">\${medal}</span>\`;
                      html += \`<span style="color:#e2e8f0; font-size:13px; font-weight:600;">\${escapeHTML(e.displayName)}</span>\`;
                      html += \`</div>\`;
                      html += \`<div style="text-align:right;">\`;
                      html += \`<span style="color:#fff; font-family:monospace; font-size:12px; font-weight:700;">\${e.score} P</span>\`;
                      if (e.reward) {
                        html += \`<div style="color:#fbbf24; font-size:10px; margin-top:2px;">\${escapeHTML(e.reward)}</div>\`;
                      }
                      html += \`</div></div>\`;
                    });
                  }
                  html += \`</div>\`;
                  html += \`<div>\`;
                  html += \`<h3 style="text-align:center; color:#a78bfa; font-size:16px; margin-bottom:8px;">🧮 MinMat Ödül Sıralaması</h3>\`;
                  html += \`<p style="text-align:center; color:#94a3b8; font-size:11px; margin-bottom:10px;">Periyot sonunda ilk 3'e girenlere CupMat global puan ödülleri verilir</p>\`;
                  if (minRewards.length === 0) {
                    html += \`<div style="text-align:center; padding:12px; color:#64748b; font-size:13px;">Henüz uygun kullanıcı yok</div>\`;
                  } else {
                    minRewards.slice(0, 5).forEach(function(e) {
                      const medal = e.rank === 1 ? "🏆" : e.rank === 2 ? "⚡" : e.rank === 3 ? "🔥" : e.rank;
                      const bg = e.rank <= 3 ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)";
                      const border = e.rank <= 3 ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.08)";
                      html += \`<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin:4px 0; border-radius:8px; background:\${bg}; border:1px solid \${border};">\`;
                      html += \`<div style="display:flex; align-items:center; gap:8px;">\`;
                      html += \`<span style="font-size:14px; min-width:24px; text-align:center;">\${medal}</span>\`;
                      html += \`<span style="color:#e2e8f0; font-size:13px; font-weight:600;">\${escapeHTML(e.displayName)}</span>\`;
                      html += \`</div>\`;
                      html += \`<div style="text-align:right;">\`;
                      html += \`<span style="color:#fff; font-family:monospace; font-size:12px; font-weight:700;">\${e.score} P</span>\`;
                      if (e.reward) {
                        html += \`<div style="color:#a78bfa; font-size:10px; margin-top:2px;">\${escapeHTML(e.reward)}</div>\`;
                      }
                      html += \`</div></div>\`;
                    });
                  }
                  html += \`</div>\`;
                  board.innerHTML = html;
                } catch (err) {
                  console.error("Reward board fetch error:", err);
                  board.innerHTML = \`<div style="text-align:center; padding:20px; color:#ef4444;">Ödül tablosu yüklenemedi</div>\`;
                }
              }
              function modeName(mode) {
                if (mode === "add") return t("modeAdd");
                if (mode === "sub") return t("modeSub");
                if (mode === "mul") return t("modeMul");
                if (mode === "div") return t("modeDiv");
                if (mode === "mix") return t("modeMix");
                return "-";
              }
              window.showLeaderboardDirectly = async function() {
                await renderLeaderboard();
                show("gameOverScreen");
              };
              applyLang();
              checkAuth();
            `
          }}
        />
      </body>
    </html>
  );
}
