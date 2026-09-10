import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

data_by_dept = [
    {
        'dept': 'İNGİLİZCE MÜTERCİM VE TERCÜMANLIK BÖLÜMÜ (YKS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '41882024852', 'BERNA DÜGER', 'Atatürk Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı', '2020', 'DİL', '344,73760', '2020', 'DİL', '322,48651', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '3'],
            ['2.', '10193518558', 'DENİZ ARDA GÖDE', 'Çukurova Üniversitesi / Eğitim Fakültesi / Almanca Öğretmenliği', '2024', 'DİL', '364,60113', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', 'HAZIRLIK'],
            ['3.', '11471309714', 'ELİF BENGÜ AKSOY', 'Erzincan Binali Yıldırım Üniversitesi / Fen-Edebiyat Fakültesi / İngilizce Mütercim ve Tercümanlık', '2025', 'DİL', '359,93667', '2025', 'DİL', '348,95064', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '1'],
            ['4.', '11585318596', 'İBRAHİM ÖZDEMİR', 'Malatya Turgut Özal Üniversitesi / Sosyal ve Beşeri Bilimler Fakültesi / İngilizce Mütercim ve Tercümanlık', '2024', 'DİL', '372,72815', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '2'],
            ['5.', '11318329974', 'MEHMET EMİN ŞAŞMAZ', 'Mardin Artuklu Üniversitesi / Edebiyat Fakültesi / İngilizce Mütercim ve Tercümanlık', '2024', 'DİL', '344,70398', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '2'],
            ['6.', '11838139206', 'MUHAMMED KAAN ÇAKIR', 'Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi / İnsan ve Toplum Bilimleri Fakültesi / İngilizce Mütercim ve Tercümanlık', '2024', 'DİL', '379,74197', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '1'],
            ['7.', '12218326230', 'OZAN KILIÇLAR', 'Mardin Artuklu Üniversitesi / Edebiyat Fakültesi / İngilizce Mütercim ve Tercümanlık', '2025', 'DİL', '352,86456', '2025', 'DİL', '348,95064', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '2'],
            ['8.', '10469511108', 'TÜLİN KOÇAK', 'Gümüşhane Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı', '2025', 'DİL', '349,50706', '2025', 'DİL', '348,95064', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '1'],
            ['9.', '68974121930', 'YAĞMUR BÜLBÜL', 'Osmaniye Korkut Ata Üniversitesi / İnsan ve Toplum Bilimleri Fakültesi / İngiliz Dili ve Edebiyatı', '2024', 'DİL', '345,56764', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '2'],
            ['10.', '33655514462', 'ZEHRA YOLCU', 'Mardin Artuklu Üniversitesi / Edebiyat Fakültesi / İngilizce Mütercim ve Tercümanlık', '2024', 'DİL', '362,10409', '2024', 'DİL', '344,25032', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', '2'],
            ['11.', '10504423908', 'ZEYNEP BETÜL YAPICI', 'Burdur Mehmet Akif Ersoy Üniversitesi / Fen-Edebiyat Fakültesi / İspanyol Dili ve Edebiyatı', '2025', 'DİL', '363,10442', '2025', 'DİL', '348,95064', 'İngilizce Mütercim ve Tercümanlık', 'ASİL', 'Başvuru şartlarını taşımaktadır.', 'HAZIRLIK']
        ]
    },
    {
        'dept': 'İNGİLİZCE MÜTERCİM VE TERCÜMANLIK BÖLÜMÜ (DGS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '27017516010', 'NURAY BÜTÜN', 'İstanbul Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı', '2025', 'DGS-SÖZ', '264,56721', '-', '-', '-', 'İngilizce Mütercim ve Tercümanlık', 'RET', '2026-DGS puanı yok', '-'],
            ['2.', '29456546696', 'SEMRA GÖL', 'Dokuz Eylül Üniversitesi / Edebiyat Fakültesi / İngilizce Mütercim ve Tercümanlık', '2023', 'DGS-SÖZ', '261,26052', '-', '-', '-', 'İngilizce Mütercim ve Tercümanlık', 'RET', '2026-DGS puanı yok', '-']
        ]
    },
    {
        'dept': 'TARİH BÖLÜMÜ',
        'rows': [
            ['1.', '12953206446', 'Mert KARABAY', 'Adıyaman Üniversitesi / İlahiyat Fakültesi / İlahiyat Pr.', '2025', 'Sözel', '272,11773', '2025', 'Sözel', '258,90160', 'Tarih', 'Asıl', 'Yüksek Puan', '1'],
            ['2.', '11381478272', 'Enver ASAR', 'Isparta Uygulamalı Bilimler Üniversitesi / Keçiborlu Meslek Yüksekokulu / Motorlu Araçlar ve Ulaştırma Teknolojileri Bölümü / Uçak Teknolojisi Pr.', '2024', 'Sözel', '311,59592', '2024', 'Sözel', '284,33774', 'Tarih', 'Asıl', 'Yüksek Puan', '2']
        ]
    },
    {
        'dept': 'TÜRK DİLİ VE EDEBİYATI BÖLÜMÜ',
        'rows': [
            ['1.', '17144598560', 'Selinay DENİZ', 'İzmir Demokrasi Üniversitesi / Fen Edebiyat Fakültesi / Türk Dili ve Edebiyatı Pr.', '2022', 'SÖZ', '338,84976', '2022', 'SÖZ', '298,73238', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '4'],
            ['2.', '66484316648', 'Nazife KARA', 'Ordu Üniversitesi / Fen Edebiyat Fakültesi / Türk Dili ve Edebiyatı Pr.', '2023', 'SÖZ', '309,43688', '2023', 'SÖZ', '294,56112', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '4'],
            ['3.', '36100296906', 'Ezo Naz ÇAPLI', 'Çağ Üniversitesi / Fen Edebiyat Fakültesi / Türk Dili ve Edebiyatı Pr.', '2022', 'SÖZ', '315,89628', '2022', 'SÖZ', '298,73238', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '2'],
            ['4.', '10198930898', 'Hatice ÖZTÜRK', 'Gümüşhane Üniversitesi / Edebiyat Fakültesi / Türk Dili ve Edebiyatı Pr.', '2025', 'SÖZ', '278,71381', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '2'],
            ['5.', '11918300700', 'Zeynep Şevval TÜRK', 'Çankırı Karatekin Üniversitesi / İnsan ve Toplum Bilimleri Fakültesi / Türk Dili ve Edebiyatı Pr.', '2025', 'SÖZ', '280,83343', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '2'],
            ['6.', '10902167602', 'Fatma Nur TOPÇU', 'Osmaniye Korkut Ata Üniversitesi / İlahiyat Fakültesi / İlahiyat Pr.', '2025', 'SÖZ', '279,85305', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '1'],
            ['7.', '14180172532', 'Merve İBEK', 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi / İlahiyat Fakültesi / İlahiyat Pr.', '2025', 'SÖZ', '269,92260', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '1'],
            ['8.', '10850838272', 'Yaren EVLEKSİZ', 'Fırat Üniversitesi / İlahiyat Fakültesi / İlahiyat Pr.', '2025', 'SÖZ', '267,40639', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '1'],
            ['9.', '57397643914', 'Belgin ÖZCAN', 'Atatürk Üniversitesi / Açık ve Uzaktan Öğretim Fakültesi', '2025', 'SÖZ', '261,83708', '2025', 'SÖZ', '260,60975', 'Türk Dili ve Edebiyatı Programı', 'Asıl', '-', '1']
        ]
    },
    {
        'dept': 'ARKEOLOJİ BÖLÜMÜ',
        'rows': [
            ['1.', '19771121852', 'EMRE İNAL', 'Osmaniye Korkut Ata Üniversitesi / Osmaniye Meslek Yüksek Okulu / Tekstil Teknolojisi Pr.', '2025', 'Y-EA', '244,16668', '2025', 'Y-EA', '223,81174', 'Arkeoloji Pr.', 'ASİL', '-', '1. SINIF']
        ]
    },
    {
        'dept': 'İNGİLİZ DİLİ VE EDEBİYATI BÖLÜMÜ (YKS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '13472282942', 'Batın ATILGAN', 'Uşak Üniversitesi / Fen-Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2022', 'DİL', '364,48482', '2022', 'DİL', '346,14792', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '4. SINIF'],
            ['2.', '12149329720', 'Elçin AYTAR', 'Ordu Üniversitesi / Fen-Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2025', 'DİL', '384,44732', '2025', 'DİL', '344,49179', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '1. SINIF'],
            ['3.', '41882024852', 'Berna DÜGER', 'Atatürk Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2020', 'DİL', '344,73760', '2020', 'DİL', '334,24747', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '3. SINIF'],
            ['4.', '18964064952', 'Gizem Sultan GELDİ', 'Ordu Üniversitesi / Fen-Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2022', 'DİL', '351,88118', '2022', 'DİL', '346,14792', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '4. SINIF'],
            ['5.', '10193518558', 'Deniz Arda GÖDE', 'Çukurova Üniversitesi / Eğitim Fakültesi / Almanca Öğretmenliği Bölümü', '2024', 'DİL', '364,60113', '2024', 'DİL', '341,22939', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', 'Hazırlık'],
            ['6.', '11198363990', 'Yasin İLHAN', 'Kafkas Üniversitesi / Fen-Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2025', 'DİL', '365,72045', '2025', 'DİL', '344,49179', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '2. SINIF'],
            ['7.', '10469511108', 'Tülin KOÇAK', 'Gümüşhane Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2025', 'DİL', '349,50706', '2025', 'DİL', '344,49179', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '1. SINIF'],
            ['8.', '40564400250', 'Semiha Neva ÖNER', 'Fırat Üniversitesi / İnsani ve Sosyal Bilimler Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2023', 'DİL', '382,18818', '2023', 'DİL', '340,22939', 'İngiliz Dili ve Edebiyatı', 'RED', 'Eksik Evrak: ÖSYS Yerleştirme Belgesi bulunmamaktadır.', '-'],
            ['9.', '10940436210', 'Mehmet Onur ÖZDAMİR', 'Bartın Üniversitesi / Bartın Meslek Yüksekokulu / Deniz ve Liman İşletmeciliği', '2025', 'DİL', '-', '2025', 'DİL', '344,49179', 'İngiliz Dili ve Edebiyatı', 'RED', 'Eksik Evrak: ÖSYS Sonuç Belgesi bulunmamaktadır.', '-']
        ]
    },
    {
        'dept': 'İNGİLİZ DİLİ VE EDEBİYATI BÖLÜMÜ (DGS İLE YATAY GEÇİŞ)',
        'rows': [
            ['1.', '27017516010', 'Nuray BÜTÜN', 'İstanbul Üniversitesi / Edebiyat Fakültesi / İngiliz Dili ve Edebiyatı Bölümü', '2025', 'SÖZ', '264,56721', '2025', 'SÖZ', '202,27422', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', '1. SINIF'],
            ['2.', '35956058652', 'Yusuf OZAN', 'Kırıkkale Üniversitesi / İnsan ve Toplum Bilimleri Fakültesi / İngilizce Mütercim ve Tercümanlık Bölümü', '2025', 'SÖZ', '209,35555', '2025', 'SÖZ', '202,27422', 'İngiliz Dili ve Edebiyatı', 'ASIL', '-', 'HAZIRLIK']
        ]
    }
]

headers = [
    'Sıra No', 'T.C. Kimlik No', 'Adı Soyadı', 'Öğrencinin Üniversitesi / Fakültesi / Programı',
    'Öğrenci YKS Yılı', 'Öğrenci Puan Türü', 'Öğrenci Puanı',
    'OKÜ Taban Puan Yılı', 'OKÜ Taban Puan Türü', 'OKÜ Taban Puanı',
    'Yatay Geçiş Yapılan Bölüm / Program', 'Sonuç (Asıl / Yedek / Ret)', 'Karar Gerekçesi / Açıklama', 'Kayıt Olacağı Sınıf'
]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'İTBF Ek Madde 1 Sonuçları'

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
top_cell.value = 'OSMANİYE KORKUT ATA ÜNİVERSİTESİ - İNSAN VE TOPLUM BİLİMLERİ FAKÜLTESİ'
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
    dept_cell = ws.cell(row=curr_row, column=1, value=dept_name)
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
ws.column_dimensions['M'].width = 36
ws.column_dimensions['N'].width = 14

out_path1 = r'D:\2026 dünya\ITBF_Ek_Madde_1_Yatay_Gecis_Sonuclari.xlsx'
out_path2 = r'D:\2026 dünya\kalsın\ITBF_Ek_Madde_1_Yatay_Gecis_Sonuclari.xlsx'

wb.save(out_path1)
wb.save(out_path2)
print('Successfully saved:', out_path1)
print('Successfully saved:', out_path2)
