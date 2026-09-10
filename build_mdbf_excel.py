import json
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

data_by_dept = [
    {
        'dept': 'BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['1.', '10375507288', 'ABİDİN BARKIN DOĞAN', 'Anadolu Üniversitesi/Açıköğretim Fakültesi/Tıbbi Dokümantasyon Ve Sekreterlik Pr. (Açıköğretim)', '2025', 'SAY', '317,57433', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['2.', '68338254830', 'ALİ ERDEM AKINCI', 'Kahramanmaraş Sütçü İmam Üniversitesi/Mühendislik-Mimarlık Fakültesi/Bilgisayar Mühendisliği Pr.', '2025', 'SAY', '331,33017', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['3.', '10853533334', 'ALİ ŞAHİN KARAKAŞ', 'İstanbul Nişantaşı Üniversitesi/Mühendislik-Mimarlık Fakültesi/ Bilgisayar Mühendisliği Pr. (%50 Burslu)', '2025', 'SAY', '331,8459', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['4.', '11099335720', 'AREL BİLDİK', 'Bandırma Onyedi Eylül Üniversitesi/Mühendislik Ve Doğa Bilimleri Fakültesi/Bilgisayar Mühendisliği Pr.', '2025', 'SAY', '396,44757', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['5.', '10243833778', 'BERAT EYMEN İNKAYA', 'Süleyman Demirel Üniversitesi/Mühendislik Ve Doğa Bilimleri Fakültesi/Otomotiv Mühendisliği Pr.', '2025', 'SAY', '353,62079', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['6.', '11723347402', 'BERİL ÖZTOPRAK', 'Eskişehir Osmangazi Üniversitesi/ Fen Fakültesi/ Biyoloji Pr.', '2025', 'SAY', '320,44586', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['7.', '20554012076', 'BERKE YETİK', 'Adana Alparslan Türkeş Bilim Ve Teknoloji Üniversitesi/Mühendislik Fakültesi/Elektrik-Elektronik Mühendisliği Pr. (İngilizce)', '2022', 'SAY', '374,75364', '2022', 'SAY', '329,03671', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['8.', '14332090462', 'BETÜL SUDE MURAT', 'Sağlık Bilimleri Üniversitesi/ Gülhane Sağlık Meslek Yüksekokulu (Ankara)/Anestezi Pr. (Ankara)', '2025', 'SAY', '327,46148', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['9.', '16174927524', 'BURAK EREN TAN', 'Işık Üniversitesi/Mühendislik Ve Doğa Bilimleri Fakültesi/Yazılım Mühendisliği Pr. (İngilizce) (%50 Burslu)', '2020', 'SAY', '352,86229', '2020', 'SAY', '283,68084', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['10.', '10009024174', 'BÜŞRA SARIKAYA', 'Çanakkale Onsekiz Mart Üniversitesi/ Fen Fakültesi/ Kimya Pr.', '2025', 'SAY', '341,4986', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['11.', '10144597472', 'DİLARA KOÇ', 'Ardahan Üniversitesi/Mühendislik Fakültesi/Bilgisayar Mühendisliği Pr.', '2024', 'SAY', '304,35809', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '3'],
            ['12.', '10712269794', 'EMİNE ÖZGE UYGUR', 'Mardin Artuklu Üniversitesi/Mühendislik-Mimarlık Fakültesi/ Bilgisayar Mühendisliği Pr.', '2025', 'SAY', '322,02777', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['13.', '10949368932', 'EMRE ÜNALAN', 'Ardahan Üniversitesi/Mühendislik Fakültesi/Bilgisayar Mühendisliği Pr.', '2025', 'SAY', '321,21469', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['14.', '10162513638', 'FEYZA ÇELİK', 'Bartın Üniversitesi/Eğitim Fakültesi/İlköğretim Matematik Öğretmenliği Pr.', '2025', 'SAY', '318,10031', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['15.', '10763052116', 'GÖRKEM AKSAN', 'Atılım Üniversitesi/Mühendislik Fakültesi/Bilişim Sistemleri Mühendisliği Pr. (İngilizce) (%50 Burslu)', '2021', 'SAY', '269,30776', '2021', 'SAY', '255,14884', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['16.', '10176193536', 'HATİCE KÜBRA KEÇEBAŞ', 'Lefke Avrupa Üniversitesi/Mühendislik Fakültesi/Bilgisayar Mühendisliği Pr. (İngilizce) (Tam Burslu)', '2024', 'SAY', '329,33013', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['17.', '24602511528', 'KAYRA SEMERCİOĞLU', 'Erciyes Üniversitesi/Mühendislik Fakültesi/Makine Mühendisliği Pr.', '2021', 'SAY', '269,6536', '2021', 'SAY', '255,14884', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['18.', '13488083960', 'KORAY EDE', 'Hatay Mustafa Kemal Üniversitesi/Eğitim Fakültesi/Rehberlik Ve Psikolojik Danışmanlık Pr.', '2025', 'SAY', '356,02326', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['19.', '29437926912', 'MEHMET EFE GÜNDOĞDU', 'İstanbul Arel Üniversitesi/Mühendislik-Mimarlık Fakültesi/ Bilgisayar Mühendisliği Pr. (İngilizce) (%50 Burslu)', '2023', 'SAY', '349,99143', '2023', 'SAY', '347,36844', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '3'],
            ['20.', '12308363602', 'MEHMET EMİN AKTAY', 'Zonguldak Bülent Ecevit Üniversitesi/ Uygulamalı Bilimler Yüksekokulu/Bilişim Sistemleri Ve Teknolojileri Pr.', '2025', 'SAY', '317,46513', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['21.', '10121122796', 'MUSA SUNYAR', 'Munzur Üniversitesi/Mühendislik Fakültesi/Bilgisayar Mühendisliği Pr.', '2024', 'SAY', '303,95778', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['22.', '10469701042', 'RABİA BAHADIR', 'Kocaeli Sağlık Ve Teknoloji Üniversitesi/Mühendislik Ve Doğa Bilimleri Fakültesi/Bilgisayar Mühendisliği Pr. (%25 Burslu)', '2025', 'SAY', '320,16354', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2'],
            ['23.', '10401102302', 'SAMET BALER YAVUZ', 'Karabük Üniversitesi/Mühendislik Ve Doğa Bilimleri Fakültesi/Makine Mühendisliği Pr.', '2025', 'SAY', '319,7384', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['24.', '31924833238', 'SÜMEYYE DURSUN', 'İstanbul Üniversitesi/İktisat Fakültesi/ İktisat Pr.', '2024', 'SAY', '305,77597', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['25.', '10609418144', 'ŞEVVAL ÇAKICI', 'Adana Alparslan Türkeş Bilim Ve Teknoloji Üniversitesi/ Bilgisayar Ve Bilişim Fakültesi/ Veri Bilimi Ve Analitiği Pr. (İngilizce)', '2024', 'SAY', '306,38048', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['26.', '67717275596', 'ÜVEYS KAAN ARZUOĞLU', 'Türk-Alman Üniversitesi/Mühendislik Fakültesi/Mekatronik Mühendisliği Pr. (Almanca)', '2024', 'SAY', '473,69574', '2024', 'SAY', '303,33142', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '1'],
            ['27.', '10493694624', 'YASİN TALHA AYDIN', 'Atatürk Üniversitesi/Uygulamalı Bilimler Fakültesi/ Yapay Zeka Ve Makine Öğrenmesi Pr.', '2025', 'SAY', '322,03018', '2025', 'SAY', '317,43255', 'BİLGİSAYAR MÜHENDİSLİĞİ', 'ASIL', '-', '2']
        ]
    },
    {
        'dept': 'BİYOLOJİ BÖLÜMÜ',
        'rows': [
            ['1.', '12171123716', 'ALİ BERAT GÜNEŞ', 'Yozgat Bozok Üniversitesi Fen-Edebiyat Fakültesi Matematik Pr.', '2025', 'SAY', '269,97262', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'ASIL', '-', '2'],
            ['2.', '11879337616', 'ARZU ASLANARGAN', 'Çankırı Karatekin Üniversitesi Fen Fakültesi Biyoloji Pr.', '2025', 'SAY', '254,84997', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'ASIL', '-', '2'],
            ['3.', '11627810668', 'AYSİMA ERGÜÇ', 'Nevşehir Hacı Bektaş Veli Üniversitesi Fen-Edebiyat Fakültesi Biyoloji Pr.', '2025', 'SAY', '275,35269', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'ASIL', '-', '2'],
            ['4.', '74032065344', 'DOĞA IRMAK ELMAS', 'Niğde Ömer Halisdemir Üniversitesi Fen Fakültesi Fizik Pr.', '2025', 'SAY', '250,48013', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'RED', 'BELGE EKSİKLİĞİ', '2'],
            ['5.', '13308089394', 'REMZİYE ÖZALP', 'Kahramanmaraş Sütçü İmam Üniversitesi Fen Fakültesi Biyoloji Pr.', '2025', 'SAY', '261,22904', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'ASIL', '-', '2'],
            ['6.', '12105023150', 'SAADET ÖZDÜĞEN', 'Kırıkkale Üniversitesi Mühendislik Ve Doğa Bilimleri Fakültesi Biyoloji Pr.', '2024', 'SAY', '249,17293', '2024', 'SAY', '243,14648', 'BİYOLOJİ', 'ASIL', '-', '2'],
            ['7.', '13001263848', 'SEDEF ÇELİK', 'İskenderun Teknik Üniversitesi Mimarlık Fakültesi Şehir Ve Bölge Planlama Pr.', '2025', 'SAY', '256,91176', '2025', 'SAY', '249,46665', 'BİYOLOJİ', 'ASIL', '-', '2']
        ]
    },
    {
        'dept': 'ELEKTRİK-ELEKTRONİK MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['1.', '11711313648', 'HASAN BİLEN', 'Gazi Üniversitesi / Gazi Eğitim Fakültesi / Matematik Öğretmenliği', '2025', 'SAY', '416,18672', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '2. sınıf'],
            ['2.', '10886494572', 'ALİ İLKSER BOZOĞLU', 'Bartın Üniversitesi / Mühendislik, Mimarlık ve Tasarım Fakültesi / Elektrik-Elektronik Mühendisliği', '2025', 'SAY', '334,45277', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '2. sınıf'],
            ['3.', '10876414696', 'SÜMEYYE HATUNOĞLU', 'Pamukkale Üniversitesi / Teknoloji Fakültesi / Biyomedikal Mühendisliği', '2025', 'SAY', '333,30603', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '2. sınıf'],
            ['4.', '10401102302', 'SAMET BALER YAVUZ', 'Karabük Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Makine Mühendisliği', '2025', 'SAY', '319,73840', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '1. sınıf'],
            ['5.', '10988274492', 'NİSANUR ÖZCAN', 'Gaziantep Üniversitesi / Mühendislik Fakültesi / Tekstil Mühendisliği', '2025', 'SAY', '317,02932', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '1. sınıf'],
            ['6.', '10892519702', 'YUSUF BOZAN', 'Recep Tayyip Erdoğan Üniversitesi / Mühendislik ve Mimarlık Fakültesi / Elektrik-Elektronik Mühendisliği', '2025', 'SAY', '315,64873', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'YEDEK 1', 'Sıralamaya giremedi', '2. sınıf'],
            ['7.', '10967367818', 'SAMET YURTSEVER', 'Mersin Üniversitesi / Fen Fakültesi / Kimya', '2025', 'SAY', '315,32199', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'YEDEK 2', 'Sıralamaya giremedi', '2. sınıf'],
            ['8.', '12716214374', 'GÜLSÜM KURTOĞULLARI', 'Bitlis Eren Üniversitesi / Mühendislik-Mimarlık Fakültesi / Bilgisayar Mühendisliği', '2025', 'SAY', '310,95689', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'YEDEK 3', 'Sıralamaya giremedi', '2. sınıf'],
            ['9.', '10522955436', 'YİĞİT BERK DÖNGELLİ', 'İstanbul Gelişim Üniversitesi / Mühendislik ve Mimarlık Fakültesi / Elektrik-Elektronik Mühendisliği', '2025', 'SAY', '309,93655', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'YEDEK 4', 'Sıralamaya giremedi', '2. sınıf'],
            ['10.', '67717275596', 'ÜVEYS KAAN ARZUOĞLU', 'Türk-Alman Üniversitesi / Mühendislik Fakültesi / Mekatronik Mühendisliği', '2024', 'SAY', '473,69574', '2024', 'SAY', '290,24569', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '1. sınıf'],
            ['11.', '11870249024', 'HALİD EREN DANE', 'Mersin Üniversitesi / Mühendislik Fakültesi / Elektrik-Elektronik Mühendisliği', '2024', 'SAY', '354,28164', '2024', 'SAY', '290,24569', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '1. sınıf'],
            ['12.', '10174875496', 'AHSEN CEMRE AYDIN', 'Fırat Üniversitesi / Teknoloji Fakültesi / Mekatronik Mühendisliği', '2023', 'SAY', '314,25994', '2023', 'SAY', '307,97503', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '2. sınıf'],
            ['13.', '38434564096', 'FATİH KAAN KURT', 'Çukurova Üniversitesi / Mühendislik Fakültesi / Elektrik-Elektronik Mühendisliği (İngilizce) (İÖ)', '2021', 'SAY', '349,82639', '2021', 'SAY', '248,36368', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '3. sınıf'],
            ['14.', '12997354820', 'MEHMET EMİRHAN KÖSELİ', 'Erciyes Üniversitesi / Mühendislik Fakültesi / Makine Mühendisliği (İÖ)', '2022', 'SAY', '304,48157', '2022', 'SAY', '299,37005', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan', '3. sınıf'],
            ['15.', '14396944572', 'YUSUF KILIÇ', 'Dicle Üniversitesi / Atatürk Sağlık Hizmetleri Meslek Yüksekokulu / Anestezi', '2025', 'SAY', '324,61244', '2025', 'SAY', '309,72300', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan (depremzede kont.)', '1. sınıf'],
            ['16.', '10609418144', 'ŞEVVAL ÇAKICI', 'Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi / Bilgisayar ve Bilişim Fakültesi / Veri Bilimi ve Analitiği', '2024', 'SAY', '306,38048', '2024', 'SAY', '290,24569', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan (depremzede kont.)', '1. sınıf'],
            ['17.', '47455115002', 'HALİL İBRAHİM ÖZKAN', 'İskenderun Teknik Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Elektrik-Elektronik Mühendisliği', '2024', 'SAY', '293,01273', '2024', 'SAY', '290,24569', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan (depremzede kont.)', '2. sınıf'],
            ['18.', '20912067366', 'KENAN KÜRŞAT ALTUNBAŞ', 'Kayseri Üniversitesi / Mühendislik, Mimarlık ve Tasarım Fakültesi / Elektrik-Elektronik Mühendisliği', '2025', 'DGS-SAY', '298,50547', '2025', 'DGS-SAY', '285,19538', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan (DGS kont.)', '2. sınıf'],
            ['19.', '17606032588', 'ORHAN ÖZTÜRK', 'Fırat Üniversitesi / Mühendislik Fakültesi / Mekatronik Mühendisliği', '2022', 'DGS-SAY', '287,67139', '2022', 'DGS-SAY', '274,83593', 'Elektrik-Elektronik Mühendisliği', 'ASIL', 'Yüksek puan (DGS kont.)', '2. sınıf']
        ]
    },
    {
        'dept': 'ENDÜSTRİ MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['1.', '20273180216', 'Bayram Mert KURT', 'Konya Teknik Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Makine Mühendisliği (İ.Ö.)', '2020', 'SAY', '305,96526', '2020', 'SAY', '284,52360', 'Endüstri Mühendisliği', 'ASIL', '-', '4'],
            ['2.', '13949436762', 'Emre YILMAZ', 'Süleyman Demirel Üniversitesi / Mühendislik Fakültesi / Elektrik-Elektronik Mühendisliği (İ.Ö.)', '2022', 'SAY', '331,74638', '2022', 'SAY', '298.25111', 'Endüstri Mühendisliği', 'ASIL', '-', '4'],
            ['3.', '14519161862', 'Furkan BOZ', 'Osmaniye Korkut Ata Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Bilgisayar Mühendisliği', '2025', 'SAY', '319,96488', '2025', 'SAY', '305,72321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['4.', '10763052116', 'Görkem AKSAN', 'Atılım Üniversitesi / Mühendislik Fakültesi / Bilişim Sistemleri Mühendisliği', '2021', 'SAY', '269,30776', '2021', 'SAY', '248,93204', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['5.', '12827399236', 'İbrahim Talha ERTÜRK', 'KTO Karatay Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Endüstri Mühendisliği', '2025', 'SAY', '305,79729', '2025', 'SAY', '305,72321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['6.', '12997354820', 'Mehmet Emirhan KÖSELİ', 'Erciyes Üniversitesi / Mühendislik Fakültesi / Makine Mühendisliği (İ.Ö.)', '2022', 'SAY', '304,8157', '2022', 'SAY', '298.25111', 'Endüstri Mühendisliği', 'ASIL', '-', '3'],
            ['7.', '11447353154', 'Serkan TAŞTEKİN', 'Sivas Cumhuriyet Üniversitesi / Mühendislik Fakültesi / Endüstri Mühendisliği', '2025', 'SAY', '348,00480', '2025', 'SAY', '305,72321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['8.', '13873382500', 'Şükrü Alperen AKÇURA', 'Afyon Kocatepe Üniversitesi / Mühendislik Fakültesi / Elektrik Mühendisliği', '2023', 'SAY', '309,42336', '2023', 'SAY', '307,68459', 'Endüstri Mühendisliği', 'ASIL', '-', '3'],
            ['9.', '10781645338', 'Zehranur DUMAN', 'Sivas Bilim ve Teknoloji Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Kimya Mühendisliği', '2024', 'SAY', '307,89536', '2024', 'SAY', '290,47321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['10.', '17606032588', 'Orhan ÖZTÜRK', 'Fırat Üniversitesi / Mühendislik Fakültesi / Mekatronik Mühendisliği', '2022', 'DGS-SAY', '287,57139', '2022', 'DGS-SAY', '275,31844', 'Endüstri Mühendisliği', 'ASIL', '-', '2'],
            ['11.', '47455115002', 'Halil İbrahim ÖZKAN', 'İskenderun Teknik Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Elektrik-Elektronik Mühendisliği', '2024', 'SAY', '293,01273', '2024', 'SAY', '290,47321', 'Endüstri Mühendisliği', 'ASIL', '-', '2'],
            ['12.', '24602511528', 'Kayra SEMERCİOĞLU', 'Erciyes Üniversitesi / Mühendislik Fakültesi / Makine Mühendisliği', '2021', 'SAY', '269,65360', '2021', 'SAY', '248,93204', 'Endüstri Mühendisliği', 'ASIL', '-', '4'],
            ['13.', '11699827014', 'Selin KÖYAN', 'Iğdır Üniversitesi / Mühendislik Fakültesi / İnşaat Mühendisliği', '2025', 'SAY', '308,11505', '2025', 'SAY', '305,72321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['14.', '66139149324', 'Şemsettin MAĞDEN', 'Erciyes Üniversitesi / Mühendislik Fakültesi / Elektrik-Elektronik Mühendisliği (İ.Ö.)', '2019', 'SAY', '313,25099', '2019', 'SAY', '306,78937', 'Endüstri Mühendisliği', 'ASIL', '-', '4'],
            ['15.', '10009024174', 'Büşra SARIKAYA', 'Çanakkale Onsekiz Mart Üniversitesi / Fen Fakültesi / Kimya', '2025', 'SAY', '341,49860', '2025', 'SAY', '305,72321', 'Endüstri Mühendisliği', 'ASIL', '-', '1'],
            ['16.', '12690110594', 'Ayşe Naz ABALAK', 'Abdullah Gül Üniversitesi / Mühendislik Fakültesi / Endüstri Mühendisliği', '2024', 'SAY', '402,39831', '2024', 'SAY', '290,47321', 'Endüstri Mühendisliği', 'ASIL', '-', '1']
        ]
    },
    {
        'dept': 'FİZİK BÖLÜMÜ',
        'rows': [
            ['1.', '21985032268', 'ARDA ÖZKAN', 'ANADOLU ÜNİVERSİTESİ/ AÇIKÖĞRETİM FAKÜLTESİ/ AŞÇILIK (AÇIKÖĞRETİM)', '2024', 'Y-SAY', '246.17823', '2024', 'Y-SAY', '240.95808', 'Fizik Bölümü', 'ASIL', 'Yüksek Puan', '1'],
            ['2.', '21404486054', 'SAMET YILMAZ', 'AYDIN ADNAN MENDERES ÜNİVERSİTEİ/ FEN FAKÜLTESİ/ FİZİK', '2024', 'Y-SAY', '281,55104', '2024', 'Y-SAY', '240.95808', 'Fizik Bölümü', 'ASIL', 'Yüksek Puan', '1'],
            ['3.', '10930436084', 'SERPİL AKDOĞAN', 'RECEP TAYYİP ERDOĞAN ÜNİVERSİTESİ/ FEN-EDEBİYAT FAKÜLTESİ/ FİZİK', '2025', 'Y-SAY', '270,71998', '2025', 'Y-SAY', '250,97031', 'Fizik Bölümü', 'ASIL', 'Yüksek Puan', '1'],
            ['4.', '12955189044', 'MEHMET BİLGEHAN BAYAZITOĞLU', 'KIRIKKALE ÜNİVERSİTESİ/ MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ/ FİZİK', '2025', 'Y-SAY', '264,02805', '2025', 'Y-SAY', '250,97031', 'Fizik Bölümü', 'BAŞARISIZ', 'Eksik Belge', '-']
        ]
    },
    {
        'dept': 'İNŞAAT MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['1.', '12827399236', 'İBRAHİM TALHA ERTÜRK', 'KTO KARATAY UNIVERSITESI (KONYA) / MUHENDISLIK VE DOGABILIMLERI FAKULTESI / ENDUSTRI MUHENDISLIGI (UCRETLI)', '2025', 'Y-SAY', '305,79729', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'ASIL', '-', '1'],
            ['2.', '11708250420', 'MUSTAFA KEREM DEMİRPENÇE', 'DOGU AKDENIZ UNIVERSITESI (KKTC-GAZIMAGUSA) / MUHENDISLIK FAKULTESI / INSAAT MUHENDISLIGI (BURSLU)', '2025', 'Y-SAY', '305,66726', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'ASIL', '-', '1'],
            ['3.', '10625853684', 'YAŞAR ARDIÇ', 'LEFKE AVRUPA ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ / YAZILIM MÜHENDİSLİĞİ', '2025', 'Y-SAY', '304,10383', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'ASIL', '-', '1'],
            ['4.', '13641079090', 'ERVA NAZ BOZKURT', 'BOLU ABANT İZZET BAYSAL ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ / İNŞAAT MÜHENDİSLİĞİ', '2025', 'Y-SAY', '342,03620', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'RED', 'İmzalı beyanı eksik olduğundan değerlendirme dışı', '-'],
            ['5.', '11756770598', 'DEVRİM DAĞGÜLÜ', 'BAYBURT ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ / İNŞAAT MÜHENDİSLİĞİ', '2025', 'Y-SAY', '312,89610', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'RED', 'İmzalı beyanı eksik olduğundan değerlendirme dışı', '-'],
            ['6.', '10186728766', 'ETHEM MERT EKSİLMEZ', 'BURSA TEKNİK ÜNİVERSİTESİ / MİMARLIK VE TASARIM FAKÜLTESİ / ŞEHİR VE BÖLGE PLANLAMA', '2025', 'Y-SAY', '305,53803', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'RED', 'İmzalı beyanı eksik olduğundan değerlendirme dışı', '-'],
            ['7.', '11014681642', 'MUSTAFA YASİR AĞLAMAZ', 'FATİH SULTAN MEHMET VAKIF ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ / İNŞAAT MÜHENDİSLİĞİ BÖLÜMÜ', '2025', 'Y-SAY', '304,47262', '2025', 'Y-SAY', '303,47942', 'İnşaat Mühendisliği', 'RED', 'ÖSYM Yerleştirme Sonucu evrağı eksik olduğundan değerlendirme dışı', '-'],
            ['8.', '14303168152', 'SİNA ÖZKAYA', 'GAZİANTEP ÜNİVERSİTESİ / MÜHENDİSLİK FAKÜLTESİ / İNŞAAT MÜHENDİSLİĞİ BÖLÜMÜ', '2024', 'Y-SAY', '315,73413', '2024', 'Y-SAY', '298.35922', 'İnşaat Mühendisliği', 'ASIL', '-', '2'],
            ['9.', '20587002778', 'TAMER GÜÇLÜ', 'YAKIN DOĞU ÜNİVERSİTESİ (KKTC-LEFKOŞA) / İNŞAAT VE ÇEVRE MÜHENDİSLİĞİ FAKÜLTESİ / İNŞAAT MÜHENDİSLİĞİ (İNGİLİZCE) (BURSLU)', '2025', 'DGS-SAY', '292,68488', '2025', 'DGS-SAY', '278.34311', 'İnşaat Mühendisliği', 'RED', 'Transkript belgesi eksik olduğundan değerlendirme dışı', '-']
        ]
    },
    {
        'dept': 'KİMYA BÖLÜMÜ',
        'rows': [
            ['1.', '15308913044', 'EMİNE KALENDER', 'Recep Tayyip Erdoğan Üniversitesi / Fen-Edebiyat Fakültesi / Kimya Bölümü / Kimya Pr.', '2025', 'Y-SAY', '309,46147', '2025', 'Y-SAY', '261,05889', 'Kimya Pr.', 'ASIL', 'Merkezi Yerleştirme Puanı (Ek Madde-1)', '2. SINIF'],
            ['2.', '11051335010', 'RÜMEYSA NİSA GÜVELOĞLU', 'Hatay Mustafa Kemal Üniversitesi / Fen-Edebiyat Fakültesi / Kimya Bölümü / Kimya Pr.', '2025', 'Y-SAY', '278,35361', '2025', 'Y-SAY', '261,05889', 'Kimya Pr.', 'ASIL', 'Merkezi Yerleştirme Puanı (Ek Madde-1)', '2. SINIF'],
            ['3.', '11064157982', 'FERİDE SONSÜZ', 'Konya Teknik Üniversitesi / Mimarlık Ve Tasarım Fakültesi / Şehir Ve Bölge Planlama Bölümü / Şehir Ve Bölge Planlama Pr.', '2025', 'Y-SAY', '272,69840', '2025', 'Y-SAY', '261,05889', 'Kimya Pr.', 'ASIL', 'Merkezi Yerleştirme Puanı (Ek Madde-1)', '2. SINIF'],
            ['4.', '21985032268', 'ARDA ÖZKAN', 'Anadolu Üniversitesi / Açıköğretim Fakültesi / Otel, Lokanta Ve İkram Hizmetleri Bölümü / Aşçılık Pr. (Açıköğretim)', '2024', 'Y-SAY', '246,17823', '2024', 'Y-SAY', '245,80875', 'Kimya Pr.', 'ASIL', 'Merkezi Yerleştirme Puanı (Ek Madde-1)', '2. SINIF']
        ]
    },
    {
        'dept': 'MAKİNE MÜHENDİSLİĞİ BÖLÜMÜ (YKS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '20251021890', 'Mustafa Aykut SELÇUK', 'Recep Tayyip Erdoğan Üniversitesi / Mühendislik ve Mimarlık Fakültesi / Makine Mühendisliği Pr.', '2019', 'SAYISAL', '269,2673', '2019', 'SAYISAL', '261,19328', 'Makine Mühendisliği', 'ASIL', '-', '4'],
            ['2.', '20273180216', 'Bayram Mert KURT', 'Konya Teknik Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Makine Mühendisliği', '2020', 'SAYISAL', '305,96526', '2020', 'SAYISAL', '287,05624', 'Makine Mühendisliği', 'ASIL', '-', '4'],
            ['3.', '25892669692', 'Halid Efe ŞABABLI', 'Isparta Uygulamalı Bilimler Üniversitesi / Teknoloji Fakültesi / Mekatronik Müh.', '2022', 'SAYISAL', '312,61666', '2022', 'SAYISAL', '306,88537', 'Makine Mühendisliği', 'ASIL', '-', '3'],
            ['4.', '10174875496', 'Ahsen Cemre AYDIN', 'Fırat Üniversitesi / Teknoloji Fakültesi / Mekatronik Müh.', '2023', 'SAYISAL', '314,25994', '2023', 'SAYISAL', '308,02641', 'Makine Mühendisliği', 'ASIL', '-', '2'],
            ['5.', '13873382500', 'Şükrü Alperen AKÇURA', 'Afyon Kocatepe Üniversitesi / Mühendislik Fakültesi / Elektrik Mühendisliği Pr.', '2023', 'SAYISAL', '309,42336', '2023', 'SAYISAL', '308,02641', 'Makine Mühendisliği', 'ASIL', '-', '3'],
            ['6.', '11915240542', 'Enes TEKİN', 'İzmir Demokrasi Üniversitesi / Mühendislik Fakültesi / Makine Mühendisliği', '2024', 'SAYISAL', '305,11489', '2024', 'SAYISAL', '291,67957', 'Makine Mühendisliği', 'ASIL', '-', '1'],
            ['7.', '11711313648', 'Hasan BİLEN', 'Gazi Üniversitesi / Gazi Eğitim Fakültesi / Matematik Öğretmenliği', '2025', 'SAYISAL', '416,18672', '2025', 'SAYISAL', '308,43575', 'Makine Mühendisliği', 'ASIL', '-', '2'],
            ['8.', '10967435364', 'Kadir TAŞKIN', 'Kafkas Üniversitesi / Mühendislik-Mimarlık Fakültesi', '2025', 'SAYISAL', '325,97352', '2025', 'SAYISAL', '308,43575', 'Makine Mühendisliği', 'ASIL', '-', '2'],
            ['9.', '26149825120', 'Doğan Can AKKAYA', 'İskenderun Teknik Üniversitesi / Mühendislik ve Doğa Bilimleri Fakültesi / Metalurji ve Malzeme Mühendisliği', '2025', 'SAYISAL', '309,34906', '2025', 'SAYISAL', '308,43575', 'Makine Mühendisliği', 'ASIL', '-', '2'],
            ['10.', '10718266360', 'Mehmet Atilla GÖGEBAKAN', 'Hasan Kalyoncu Üniversitesi / Mühendislik Fakültesi / Yazılım Mühendisliği Pr.', '2025', 'SAYISAL', '308,77471', '2025', 'SAYISAL', '308,43575', 'Makine Mühendisliği', 'YEDEK', '-', '1']
        ]
    },
    {
        'dept': 'MAKİNE MÜHENDİSLİĞİ BÖLÜMÜ (DGS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '33275423526', 'MUHAMMED ALİ BARAN', 'Yıldız Teknik Üniversitesi / Kimya-Metalurji Fakültesi / Metalurji Ve Malzeme Mühendisliği Pr.', '2025', 'SAY', '317,33128', '2025', 'SAY', '280,08295', 'Makine Mühendisliği', 'ASIL', '-', '2'],
            ['2.', '20912067366', 'KENAN KÜRŞAT ALTUNBAŞ', 'Kayseri Üniversitesi / Mühendislik, Mimarlık Ve Tasarım Fakültesi / Elektrik-Elektronik Mühendisliği Pr.', '2025', 'SAY', '298,50547', '2025', 'SAY', '280,08295', 'Makine Mühendisliği', 'YEDEK', '-', '2'],
            ['3.', '51157196566', 'BARAN ÖZGÜNGÖR', 'İstanbul Sağlık Ve Teknoloji Üniversitesi / Mühendislik Ve Doğa Bilimleri Fakültesi / Makine Mühendisliği Pr. (İngilizce) (%50 Burslu)', '2025', 'SAY', '280,42321', '2025', 'SAY', '280,08295', 'Makine Mühendisliği', 'YEDEK', '-', '1']
        ]
    },
    {
        'dept': 'MATEMATİK BÖLÜMÜ',
        'rows': [
            ['1.', '10423419532', 'Mithat Efe YAMAN', 'Recep Tayyip Erdoğan Üniversitesi / Matematik', '2025', 'SAY', '297,69959', '2025', 'SAY', '278,8027', 'Matematik', 'Asıl', '-', '2'],
            ['2.', '14090943628', 'Fatıma Havva Nur OĞUZ', 'Burdur Mehmet Akif Ersoy Üniversitesi / Nanobilim Ve Nanoteknoloji', '2025', 'SAY', '293,95740', '2025', 'SAY', '278,8027', 'Matematik', 'Asıl', '-', '2'],
            ['3.', '11170429904', 'Fatmabedia IŞIK', 'Nevşehir Hacı Bektaş Veli Üniversitesi / Matematik', '2025', 'SAY', '284,85334', '2025', 'SAY', '278,8027', 'Matematik', 'Asıl', '-', '2'],
            ['4.', '10889333960', 'Ali EREN', 'Niğde Ömer Halisdemir Üniversitesi / Matematik', '2024', 'SAY', '285,50048', '2024', 'SAY', '264,63033', 'Matematik', 'Asıl', '-', '3'],
            ['5.', '10790769278', 'Elifnaz BULUT', 'Sivas Cumhuriyet Üniversitesi / Matematik', '2024', 'SAY', '276,65243', '2024', 'SAY', '264,63033', 'Matematik', 'Asıl', '-', '3'],
            ['6.', '10797170800', 'Emirhan KURTGÖZ', 'Çukurova Üniversitesi / Matematik', '2023', 'SAY', '357,87951', '2023', 'SAY', '296,82755', 'Matematik', 'Asıl', '-', '4'],
            ['7.', '23419016646', 'İrem AKPOLAT', 'Selçuk Üniversitesi / Matematik', '2022', 'SAY', '308,72937', '2022', 'SAY', '296,82755', 'Matematik', 'Asıl', '-', '4'],
            ['8.', '20554080846', 'Süleyman Efe AVCI', 'Çankırı Karatekin Üniversitesi / Matematik', '2023', 'SAY', '307,91304', '2023', 'SAY', '296,82755', 'Matematik', 'Asıl', '-', '4']
        ]
    },
    {
        'dept': 'ENERJİ SİSTEMLERİ MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['-', '-', 'Başvuru Bulunmamaktadır', '-', '-', '-', '-', '-', '-', '-', 'Enerji Sistemleri Mühendisliği', '-', 'Bölüme yatay geçiş için başvuran aday bulunmamaktadır.', '-']
        ]
    },
    {
        'dept': 'HARİTA MÜHENDİSLİĞİ BÖLÜMÜ',
        'rows': [
            ['-', '-', 'Başvuru Bulunmamaktadır', '-', '-', '-', '-', '-', '-', '-', 'Harita Mühendisliği', '-', 'Bölüme yatay geçiş için başvuran aday bulunmamaktadır.', '-']
        ]
    }
]

headers = [
    'Sıra No', 'T.C. Kimlik No', 'Adı Soyadı', 'Öğrencinin Üniversitesi / Fakültesi / Programı',
    'Öğrenci YKS Yılı', 'Öğrenci Puan Türü', 'Öğrenci Puanı',
    'OKÜ Taban Puan Yılı', 'OKÜ Taban Puan Türü', 'OKÜ Taban Puanı',
    'Yatay Geçiş Yapılan Bölüm / Program', 'Sonuç (Asıl / Yedek)', 'Karar Gerekçesi / Açıklama', 'Kayıt Olacağı Sınıf'
]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'MDBF Ek Madde 1 Sonuçları'

faculty_banner_fill = PatternFill(start_color='0D233A', end_color='0D233A', fill_type='solid')
faculty_banner_font = Font(name='Calibri', size=13, bold=True, color='FFFFFF')
dept_banner_fill = PatternFill(start_color='1F497D', end_color='1F497D', fill_type='solid')
dept_banner_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
col_header_fill = PatternFill(start_color='DCE6F1', end_color='DCE6F1', fill_type='solid')
col_header_font = Font(name='Calibri', size=10, bold=True, color='000000')
data_font = Font(name='Calibri', size=10, color='000000')
zebra_fill = PatternFill(start_color='F9FAFB', end_color='F9FAFB', fill_type='solid')

thin_border = Border(
    left=Side(style='thin', color='D3D3D3'),
    right=Side(style='thin', color='D3D3D3'),
    top=Side(style='thin', color='D3D3D3'),
    bottom=Side(style='thin', color='D3D3D3')
)
thick_bottom = Border(
    left=Side(style='thin', color='D3D3D3'),
    right=Side(style='thin', color='D3D3D3'),
    top=Side(style='thin', color='D3D3D3'),
    bottom=Side(style='medium', color='1F497D')
)

ws.merge_cells('A1:N1')
top_cell = ws['A1']
top_cell.value = 'OSMANİYE KORKUT ATA ÜNİVERSİTESİ - MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ'
top_cell.fill = faculty_banner_fill
top_cell.font = faculty_banner_font
top_cell.alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[1].height = 28

ws.merge_cells('A2:N2')
sub_top = ws['A2']
sub_top.value = '2026-2027 EĞİTİM-ÖĞRETİM YILI GÜZ YARIYILI EK MADDE 1 (MERKEZİ YERLEŞTİRME PUANI) YATAY GEÇİŞ DEĞERLENDİRME SONUÇLARI'
sub_top.fill = PatternFill(start_color='2C3E50', end_color='2C3E50', fill_type='solid')
sub_top.font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
sub_top.alignment = Alignment(horizontal='center', vertical='center')
ws.row_dimensions[2].height = 24

curr_row = 4

for item in data_by_dept:
    dept_name = item['dept']
    rows = item['rows']
    
    ws.merge_cells(start_row=curr_row, start_column=1, end_row=curr_row, end_column=len(headers))
    dept_cell = ws.cell(row=curr_row, column=1, value=f'📌 {dept_name}')
    dept_cell.fill = dept_banner_fill
    dept_cell.font = dept_banner_font
    dept_cell.alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws.row_dimensions[curr_row].height = 24
    curr_row += 1
    
    for c_idx, h_name in enumerate(headers, start=1):
        cell = ws.cell(row=curr_row, column=c_idx, value=h_name)
        cell.fill = col_header_fill
        cell.font = col_header_font
        cell.border = thick_bottom
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws.row_dimensions[curr_row].height = 24
    curr_row += 1
    
    for r_i, r_data in enumerate(rows):
        is_zebra = (r_i % 2 == 1)
        for c_idx, val in enumerate(r_data, start=1):
            cell = ws.cell(row=curr_row, column=c_idx, value=val)
            cell.font = data_font
            cell.border = thin_border
            if is_zebra:
                cell.fill = zebra_fill
            if c_idx in [1, 5, 6, 8, 9, 12, 14]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            elif c_idx in [7, 10]:
                cell.alignment = Alignment(horizontal='right', vertical='center')
            else:
                cell.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
        ws.row_dimensions[curr_row].height = 22
        curr_row += 1
        
    curr_row += 2

ws.column_dimensions['A'].width = 8
ws.column_dimensions['B'].width = 16
ws.column_dimensions['C'].width = 26
ws.column_dimensions['D'].width = 46
ws.column_dimensions['E'].width = 12
ws.column_dimensions['F'].width = 12
ws.column_dimensions['G'].width = 15
ws.column_dimensions['H'].width = 14
ws.column_dimensions['I'].width = 12
ws.column_dimensions['J'].width = 15
ws.column_dimensions['K'].width = 32
ws.column_dimensions['L'].width = 15
ws.column_dimensions['M'].width = 34
ws.column_dimensions['N'].width = 14

out_path1 = r'D:\2026 dünya\MDBF_Ek_Madde_1_Yatay_Gecis_Sonuclari.xlsx'
out_path2 = r'D:\2026 dünya\kalsın\MDBF_Ek_Madde_1_Yatay_Gecis_Sonuclari.xlsx'

wb.save(out_path1)
wb.save(out_path2)
print('Successfully saved:', out_path1)
print('Successfully saved:', out_path2)
