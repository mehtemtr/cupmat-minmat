uses Crt, Dos, Win, UOg, UIndex, BLUNGR, Exist, Printer, GenUtil, DFile, UList, Basim, UPrt, ogrbas;
Const

SDrs : String = 'DRS.DAT';
SDrsNdx : String = 'DRS.NDX';
SBolum : String = 'BOLUM.DAT';
SUnv : String = 'UNV.DAT';
SGrd : String = 'GRADE.DAT';
SStat : String = 'GRDSTAT.DAT';
SUniv : String = 'UNIVFAK.DAT';
SYil : String = 'YIL.DAT';

{$F+}
Procedure MaxSt;
Var s:STRING;
    TC : Char;
    L:Byte;
    U:CharSet;
begin
  If Not KrediHesapla then
    OpenEditWindow('MAXS˜MUM',
		 '2@SAAT',
		 'ESC:€IKIS',[ESC],[],10,1)
  else
    OpenEditWindow('MAXS˜MUM',
		 '6@KRED˜',
		 'ESC:€IKIS',[ESC],[],10,1);
  ShowCursor;
  ClrScr;
  Repeat
    If Not KrediHesapla then begin
       Str(MaxSaat:2,S); L:=2; U:=['0'..'9'];
    end
    else begin
       Str(MaxKredi:6:2,S); L:=6;U:=['0'..'9','.'];
    end;
    InputStr(S,Form.FieldKol[1],1,6,True,U,6,TC);
    If Not KrediHesapla then
       MaxSaat:=StrToInt(S)
    else
       MaxKredi:=StrToReal(S);
  Until TC = ESC;
  CloseEdit;
end;

Procedure YilSec;
begin
  YYDRS^.YilSec;
end;
Procedure EditYY;
begin
  OGR^.EditYY
end;
Procedure YoklaBas;
begin
   List^.Butunleme:=1;
   List^.YoklaBas;
end;

Procedure AnaEdit;
begin
   OGR^.EditKut;
end;

procedure OgrGir;
begin
   OGR^.Giris;
end;

Procedure YeniYL;
begin
  YeniYil;
end;

procedure UnvanGir;
begin
   Unvan.UnvanGir;
end;
procedure UnvanSec;
begin
   UNvan.Aktif:=Unvan.UnvanSec;
end;

procedure DrsGir;
begin
   DRS^.Giris;
end;
procedure UyeGir;
begin
   UYE^.Giris;
end;
procedure YYdrsGir;
begin
   YYDRS^.Giris;
end;
procedure BolumSec;
begin
   OGR^.BolumSec
end;

procedure BolumGir;
begin
   Bolum.BolumGir;
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDRS^.DFile.CloseFile;
  UYE^.DFile.CloseFile;
  DRS^.DFile.CloseFile;
  OGR^.DFile.CloseFile;
  Dispose(UYE, Done);
  Dispose(YYDRS, Done);
  Dispose(DRS, Done);
  Dispose(OGR, Done);
  Dispose(NotEditor,Done);
  Dispose(List, Done);
  Dispose(DiskList,Done);
  Yariyil.done;
  clrscr;
  Halt;
end;
Procedure YYNotGir;
begin
  NotEditor^.EditGrd(1);
end;
Procedure BTNotGir;
begin
  NotEditor^.EditGrd(2);
end;
Procedure TTNotGir;
begin
  NotEditor^.EditGrd(3);
end;
procedure NotDegis;
begin
   GRad.EditGrd
end;
Procedure YeniNot;
begin
   GRAd.GradeGir;
end;
procedure OgrCikis;
begin
   OGR^.Cikis
end;
procedure DrsCikis;
begin
  DRS^.cikis
end;
procedure UyeCikis;
begin
   UYE^.Cikis
end;
procedure YYDrsCikis;
begin
   YYDRS^.Cikis
end;
Procedure WriteUniv;
Var T : TextFile;
begin
   With T do begin
     OpenToWrite('UNIVFAK.DAT');
     WriteText(Univ);
     WriteText(Fakulte);
     CloseFile;
   end;
end;
Procedure ReadUniv;
Var T : TextFile;
begin
   If not Exists('UNIVFAK.DAT') then WriteUniv;
   With T do begin
     OpenToRead('UNIVFAK.DAT');
     Univ:=ReadText;
     Fakulte:=ReadText;
     CloseFile;
   end;
end;
Procedure Universite;
Var TC : Char;
begin
   OpenEditWindow('šN˜VERS˜TE VE FAKšLTE ADI DE¦˜ž˜KL˜¦˜',
   '30@šN˜VERS˜TEN˜N ADI@31@FAKšLTEN˜N ADI' ,'ESC : DE¦˜ž˜KL˜K TAMAM',[ESC],[],10, 1);
   Repeat
     InputStr(Univ, Form.FieldKol[1],1,30, False,ALLKar,0, TC);
     If TC = NULL then
       InputStr(Fakulte, Form.FieldKol[2],1,30, False,ALLKar,0, TC);
   until TC=ESC;
   WriteUniv;
   CloseEdit;
   ShowBolYil
end;
Procedure ListeHazirla;
Var  K : Word;
     I : Byte;TC:char;
begin
    OpenEditWindow('YARIYIL L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€',[CR,ESC],[],10, 4);
    K:=Bolum.NuKod; List^.Butunleme:=1;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
	WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
	TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List^.ListeHazirla;
	   YYListStat[AktifYYInd,I]:=True;
	   WriteListStat;
	end;
    end;
    CloseEdit
end;
Procedure ButListeHazirla;
Var  K : Word;
     I : Byte;TC:Char;
begin
    OpenEditWindow('BšTšNLEME L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€',[CR,ESC],[],10, 4);
    K:=Bolum.NuKod; List^.Butunleme:=2;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
        WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
        TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List^.ListeHazirla;
	   BTListStat[AktifYYInd,I]:=True;
	   WriteListStat;
	end;
    end;
    CloseEdit
end;
Procedure TekListeHazirla;
Var  K : Word;
     I : Byte;TC:Char;
begin
    OpenEditWindow('TEKRAR L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€',[CR,ESC],[],10, 4);
    K:=Bolum.NuKod; List^.Butunleme:=3;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
        WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
        TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List^.ListeHazirla;
	   BTListStat[AktifYYInd,I]:=True;
	   WriteListStat;
	end;
    end;
    CloseEdit
end;

procedure AnaKutIsle;
begin
    BEKLEYINIZ('KšTšK YAZILIYOR');
    OGR^.KutIsle;
    CloseWindow;
end;
Procedure YYListeBas;
begin
   List^.Butunleme:=1;
   List^.ListeBas;
end;
Procedure BTListeBas;
begin
   List^.Butunleme:=2;
   List^.ListeBas;
end;
Procedure TTListeBas;
begin
   List^.Butunleme:=3;
   List^.ListeBas;
end;
Procedure KarneBasim;
begin
   KarneBas;
end;
Procedure NotBelge;
begin
   PrintBelge(False)
end;
procedure Mezbelge;
begin
  PrintBelge(True)
end;
Procedure OgrIndex;
Begin
   OGR^.IndexDuz;
   OGR^.WriteNdx
end;
Procedure DrsIndex;
Begin
   DRS^.IndexDuz;
   DRS^.WriteNdx
end;
Procedure YYDrsIndex;
Begin
   YYDRS^.IndexDuz;
   YYDRS^.WriteNdx
end;
Procedure UyeIndex;
Begin
   UYE^.IndexDuz;
   UYE^.WriteNdx
end;

procedure Bos;
begin
end;
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  OGR^.Open;
  DRS^.open; DRS^.KredSaatToMem;
  UYE^.open;
  YYDRS^.Open;
  ReadUniv;
  ShowBolYil;
  ReadListStat;
end;

Procedure OgrBasim;
begin
   Ogrencibasim
end;
procedure DrsBasim;
Var B      : Boolean;
    I      : Word;
    S      : String;
begin
  Satir:=0; Sayfa:=1; SIRA:=0;
  with DRS^ do begin
     if not Selection('DERS BASIMI','6@DRS.KOD@25@DERS˜N ADI',SelectColor) then exit;
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
	    If Satir=0 then begin
	       S:='DERS LISTESI';
	       PrintHader(DrsHead1,DrsHead2,S)
	    end;
	    Inc(Satir);INC(SIRA);
	    LPT.WriteLnPrt(S+DrsLine);
	    If Satir=MaxSatir then FormFeed;
	end;
  end;
  If Satir < MaxSatir then FormFeed;
end;
procedure UyeBasim;
Var B      : Boolean;
    I      : Word;
    S      : String;
begin
  Satir:=0; Sayfa:=1;SIRA:=0;
  with UYE^ do begin
     if not Selection('™¦RET˜M ELEMANI BASIMI','6@šYE.KOD@10@šNVAN@25@šYEN˜N ADI',SelectColor) then exit;
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
	    If Satir=0 then begin
		S:='™GRET˜M ELEMANI L˜STES˜';
		PrintHader(UyeHead1,UyeHead2,S)
	    end;
	    Inc(Satir);INC(SIRA);
	    LPT.WriteLnPrt(S+UyeLine);
	    If Satir=MaxSatir then FormFeed;
	end;
  end;
  If Satir < MaxSatir then FormFeed;
end;
procedure YYDrsBasim;
Var B      : Boolean;
    I      : Word;
    S      : String;
begin
  Satir:=0; Sayfa:=1;SIRA:=0;
  with YYDRS^ do begin
   if not Selection('YARIYIL DERS BASIMI','6@DRSKOD@2@BL@2@GR@25@DERS˜N ADI',SelectColor) then exit;
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
            UYE^.DFile.GetRec(UyeAdr,UYE^.Is);
	    If Satir=0 then begin
		 S:=YilStr(ActYil,ActYY)+' YARIYIL DERS L˜STES˜';
		 PrintHader(YYDHead1,YYDHead2,S)
	    end;
	    Inc(Satir);INC(SIRA);
	    LPT.WriteLnPrt(S+YYDrsLine);
	    If Satir=MaxSatir then FormFeed;
	end;
  end;
  If Satir < MaxSatir then FormFeed;
end;
Function PutOgrToDisket:Boolean;

Var R, I , Adr, Yer : Word;
    Junk            : Boolean;
    OgrDisketF      : DataFile;
    S : String;
begin
   PutOgrToDisket:=False;
   Bekleyiniz('™¦RENC˜LER˜ D˜SKETE KOPYALIYORUM');
   OgrDisketF.Init(OGR^.DFile.MaxKay, OGR^.DFile.RecLen);
   OgrDisketF.OpenFile(Drive+Bolum.Kod(ActBol)+'OGR.DAT');
   With OGR^ do begin
       Say:=0;
       FillChar(KodPtr^,(MaxKay+1)*(KeyL+2), #0);
       For I:=1 to IndisSay do begin
          Adr:=Indis[I];
          DFile.GetRec(Adr,Is);
          FillChar(Kac  , SizeOf(Kac),#0);
          FillChar(YYKay, SizeOf(YYKay),#0);
          FillChar(Ders , SizeOf(YYKay),#0);
          OgrDisketF.AddRec(Adr,Is);
          If Adr=0 then begin
             CloseWindow;
	     Complain('™¦RENC˜LER˜ D˜SKETE KOPYALIYAMIYORUM');
	     OgrDisketF.CloseFile;
             ReadNdx;
	     Exit
          end;
         S:=GetIs;
         Junk:=Search(S, Yer, R);
         InsIndex(Yer);
         SetKeyAdr(S, Yer, Adr);
    end;
   OgrDisketF.CloseFile;
   if not WriteIndex(Drive+Bolum.Kod(ActBol)+'OGR.NDX') then
      Complain('™¦RENC˜LER˜ D˜SKETE KOPYALIYAMIYORUM');
   PutOgrToDisket:=True;
   ReadNdx;
end;
   CloseWindow;
end;

Function WriteSupportFiles:Boolean;
Var  B : Boolean;
     F : File;
     DFree, SZ : LongInt;

Procedure AddSZ( S: String);
begin
    Assign(F, S);
    Reset(F);
    SZ:=SZ+FileSize(F);
    Close(F)
end;
begin
    WriteSupportFiles:=False;
    Bekleyiniz('DERSLER˜ VE D˜¦ER DOSYALARI KOPYALIYORUM');
    DRS^.DFile.CloseFile;
    SZ:=0;
    AddSZ(SDrs);
    AddSZ(SDrsNdx);
    AddSZ(SBolum);
    AddSZ(SUnv);
    AddSZ(SGrd);
    AddSZ(SStat);
    AddSZ(SUniv);
    AddSZ(SYil);
    DFree:=DiskFree(Ord(Drive[1])-64);
    If (DFree = - 1) or (DFree<SZ) then begin
       Complain('SšRšCšDE HATA VEYA D˜SKTE YETERL˜ YER YOK');
       CloseWindow;
       Exit
    end;
    EraseFile(Drive+SDrsNdx);
    EraseFile(Drive+SDrs);
    WriteSupportFiles:=
              CopyFile(SDrs, Drive+SDrs) and
              CopyFile(SDrsNdx, Drive+SDrsNdx) and
              CopyFile(SBolum, Drive+SBolum) and
              CopyFile(SUnv, Drive+SUnv) and
              CopyFile(SGrd, Drive+SGrd) and
              CopyFile(SStat, Drive+SStat) and
              CopyFile(SUniv, Drive+SUniv) and
              CopyFile(SYil, Drive+SYil);
    DRS^.Open;
    Closewindow;
end;
Procedure MezunSakla;
Var I   : Word;
    TC  : Char;
    Junk:Boolean;
    SZ, DF : LongInt;
Begin
     If Bolum.NuKod = 0 then begin
        complain('HENšZ B˜R B™LšM YOK');
        exit
     end;
     If not DisketTak('MEZUN D˜SKET SšRšCšSš') then exit;
     if not OGR^.Selection('MEZUN OLAN ™¦RENC˜LER',
		   '8@™¦R.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
     If IndisSay = 0 then exit;
     If not WriteSupportFiles then exit;
     DF:=DiskFree(Ord(Drive[1])-64);
     SZ:=10 + IndisSay*OGR^.DFile.RecLen;
     If SZ > DF then begin
       Complain('D˜SKTE YETERL˜ YER YOK');
       Exit
     end;
     Junk:=PutOgrToDisket;
end;
Procedure YYDiskListeBas;
begin
   DiskList^.Butunleme:=1;
   DiskList^.ListeBas;
end;
Procedure BTDiskListeBas;
begin
   DiskList^.Butunleme:=2;
   DiskList^.ListeBas;
end;
Procedure TTDiskListeBas;
begin
   DiskList^.Butunleme:=3;
   DiskList^.ListeBas;
end;
Procedure KrediDok;
Var I   : Word;
    TC  : Char;
    S:String;
    Sira,Sayfa:Word;
Function  OgrLine:String;
begin
 With OGR^ do
    OgrLine:='         '+GetIs+ ' ' +GetAd+'   '+RealToStr(GPA,6,2)+'        '+RealToStr(TopKredi,8,2)
end;
Procedure FormFeed;
begin
   LPT.WriteLnPrt('\F');
   Inc(Sayfa);
   Satir:=0;
end;
Procedure LPTPrintHeader;
Const
  OgrH1='    NO          ADI VE SOYADI        ORTALAMA    TOPLAM KRED˜  ';
  OgrH2=' -------- ------------------------- ---------- ----------------';

Var L : Byte; S:String;
Begin
   L:=80;
   LPT.WriteLnPrt('\E\C'+Ortala(66,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(66,Fakulte));
   LPT.WriteLnPrt('\E\C'+Ortala(66,Bolum.KodAd(ActBol)+' ™¦RENC˜ KRED˜ L˜STES˜'));
   S:=Spaces(8);
   LPT.WriteLnPrt('  ');
   LPT.WriteLnPrt(S+OgrH1);
   LPT.WriteLnPrt(S+OgrH2);
end;
procedure OgrAltBasim;
Var B      : Boolean;
    I      : Word;
    S      : String;
begin
  Satir:=0;
  Sayfa:=1;
  with OGR^ do begin
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
            If (Satir=0) then LPTPrintHeader;
	    Inc(Satir);
	    LPT.WriteLnPrt(OgrLine);
   	    If Satir=MaxSatir then FormFeed;
     end;
  end;
  If Satir < MaxSatir then FormFeed;
end;
Begin
     If Bolum.NuKod = 0 then begin complain('HENšZ B˜R B™LšM YOK'); exit end;
     SlctOgr.KrediyeGore:=True;
     SlctOgr.Say:=OGR^.Say;
     For I:=1 to OGR^.Say do Indis[I]:=OGR^.GetAdr(I);
     IndisSay:=OGR^.Say;
     If SlctOgr.Selection('™¦RENC˜ KRED˜LER˜ BASIMI',
		    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@6@ORTALAMA@8@KRED˜ TOPLAMI',
		     SelectColor) then
     begin
          IndisSay:=0;
          for I:=1 to OGR^.Say do
             If selArr[I] then begin
               Inc(IndisSay);
               Indis[I]:=OGR^.GetAdr(I)
             end;
           OgrAltBasim;
     end;
     SlctOgr.KrediyeGore:=false;
end;
Procedure KayitKont;
begin
   OGR^.KayKont;
end;
{$L ENCODE}
FUNCTION ENCODE( S : STRING):STRING;EXTERNAL;
FUNCTION DECODE( S : STRING):STRING;EXTERNAL;

{$F-}
Procedure ShowCopwr;
Var S:String;
begin
   Writestr(10, 20, Decode('#9-951; '#0':0+;%56+8%6+'#0'!+.''+7.%/'#0'/%5-%?+'#0'351&'#0'$5'#0'>969&'#0':0.:'), CmdColor);
   str(memavail,s);
   Writestr(27, 24, 'KALAN HAFIZA : '+S+' BYTE', CmdColor);
end;



Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA',ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('B™LšM ~G˜R      ', NULL   , CmdBolumGir  , BolumGir,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('Y~EN˜ YIL       ', NULL   , CmdYeniYil   , YeniYil ,0,
       AddMenu('B~ASIM', NULL, 0, Bos,
	   AddMenu('™¦~RENC˜  ALT_F2', ALT_F2,CmdOgrBasim, OgrBasim,0,
	   AddMenu('~DERS     ALT_F3', ALT_F3,CmdDrsBasim, DrsBasim,0,
	   AddMenu('~YY. DERS ALT_F4', ALT_F4,CmdYYDrsBasim,YYDrsBasim,0,
	   AddMenu('™¦R.~EL.  ALT_F5', ALT_F5,CmdUyeBasim,UyeBasim,0,0)))),
       AddMenu('~D˜SKET', NULL,0,Bos,
	   AddMenu('~MEZUN SAKLA   ', NULL,CmdMezunSakla,MezunSakla,0,
	   AddMenu('~YY. L˜STE BAS ', NULL,CmdYYDiskListeBas,YYDiskListeBas,0,
	   AddMenu('~BšT.L˜STE BAS ', NULL,CmdBTDiskListeBas,BTDiskListeBas,0,
           AddMenu('~TEK.L˜STE BAS ', NULL,CmdTTDiskListeBas,TTDiskListeBas,0,0)))),

       AddMenu('~NOT DE¦˜ž ', NULL   , CmdNotDegis  , NotDegis,0,
       AddMenu('YEN˜ NO~T ', NULL   , CmdYeniNot   , YeniNot ,0,
       AddMenu('šNVAN ~SE€ ', NULL   , CmdUnvanSec  , UnvanSec,0,
       AddMenu('YEN˜ šN~VAN', NULL   , CmdUnvanGir  , UnvanGir,0,
       AddMenu('~MAX SAAT', NULL   , CmdMaxSt     , MaxSt   ,0,
       AddMenu('šN˜V/~FAK ', NULL   , CmdUniversite, Universite,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0
       ,0))))))))))))),
  AddMenu('G˜~R˜ž', ALT_R, 0, Bos,
       AddMenu('™¦~RENC˜   F2',F2, CmdOgrGir,   OgrGir,  0,
       AddMenu('~DERS      F3',F3, CmdDrsGir,   DrsGir,  0,
       AddMenu('~YY. DERS  F4',F4, CmdYYDrsGir, YYDrsGir,0,
       AddMenu('™¦R.~EL.   F5',F5, CmdUyeGir  , UyeGir,  0, 0)))),
  AddMenu('€I~KIž', ALT_K, 0, Bos,
       AddMenu('™¦~RENC˜   CTRL-F2', CTRL_F2, CmdOgrCikis  ,OgrCikis,0,
       AddMenu('~DERS      CTRL-F3', CTRL_F3, CmdDrsCikis  ,DrsCikis,0,
       AddMenu('~YY. DERS  CTRL-F4', CTRL_F4, CmdYYDrsCikis,YYDrsCikis,0,
       AddMenu('™¦R.~EL.   CTRL_F5', CTRL_F5, CmdUyeCikis  ,UyeCikis,0,0)))),
   AddMenu('˜NDE~X', ALT_X, 0, Bos,
       AddMenu('™¦~RENC˜ ', NULL, CmdOgrIndex  ,OgrIndex,0,
       AddMenu('~DERS    ', NULL, CmdDrsIndex  ,DrsIndex,0,
       AddMenu('~YY. DERS', NULL, CmdYYDrsIndex,YYDrsIndex,0,
       AddMenu('™¦R.~EL. ', NULL, CmdUyeIndex  ,UyeIndex,0,0)))),
     AddMenu('KA~YIT', ALT_Y, 0, Bos,
       AddMenu('~KAYIT G˜R˜ž˜        F6', F6      , CmdEditYY,EditYY,0,
       AddMenu('Y~OKLAMA L˜STE  BASIMI  ', NULL    , CmdYokla, YoklaBas,0,
       AddMenu('~YY. NOT G˜R˜ž       F7', F7      , CmdYYNotGir,YYNotGir,0,
       AddMenu('YY. ~L˜STE HAZ  CTRL_F6', CTRL_F6 , CmdListeHazirla,ListeHazirla,0,
       AddMenu('YY. L˜~STE BAS  CTRL_F7', CTRL_F7 , CmdYYListeBas,YYListeBas,0,
       AddMenu('~BšT.NOT G˜R˜ž   ALT_F7', ALT_F7  , CmdBTNotGir,BTNotGir,0,
       AddMenu('Bš~T.L˜STE HAZ   ALT_F6', ALT_F6  , CmdBTListeHazirla,BuTListeHazirla,0,
       AddMenu('BšT.L˜ST~E BAS SHIFT_F7', SHIFT_F7, CmdBTListeBas,BTListeBas,0,
       AddMenu('TEK. NOT ~G˜R˜ž        ', NULL    , CmdTTNotGir,TTNotGir,0,
       AddMenu('TEK.L˜STE HA~Z         ', NULL    , CmdTTListeHazirla,TekListeHazirla,0,
       AddMenu('TEK.L˜STE B~AS         ', NULL    , CmdTTListeBas,TTListeBas,0,
       AddMenu('KAYIT KONTROL          ', NULL    , CmdKayKont, KayitKont,0,0)))))))))))),
     AddMenu('Kš~TšK', ALT_T, 0, Bos,
       AddMenu('~KšTšK G˜R/DE¦˜ž       F8', F8      , CmdAnaEdit   ,AnaEdit,0,
       AddMenu('NOT BELGE D™K    CTRL_F8', CTRL_F8 , CmdNotBelge  ,NotBelge,0,
       AddMenu('MEZ.BELGE D™KšM   ALT-F8', ALT_F8  , CmdMezBelge  ,MezBelge,0,
       AddMenu('K~ARNE D™KšM     SHIFT_F8', SHIFT_F8, CmdKarneBasim,KarneBasim,0,
       AddMenu('Kš~TšK ˜žLE        CTRL_K', CTRL_K  , CmdAnaKutIsle,AnaKutIsle,0,
       AddMenu('KRE~D˜ D™KšMš             ',NULL,CmdKrediDok, KrediDok,0,0)))))),0))))));

LinkMenu(0, MenuBar);
DefineMainBox(MenuBar);
ClrScr;
     KrediHesapla:= False;
     fillwin(#178,16*Blue+LightGray);
     If Not Disk.ChangeDir then Halt;
     initprog;
     ShowCopwr;
Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    ShowBolYil;
    DoEvent(EventKey);
    ShowCopwr;
until false;
showCursor;
end.

