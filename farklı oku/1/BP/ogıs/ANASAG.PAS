uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist, Printer, GenUtil, DFile, UList, Basim, UPrt, ogrbas;
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
  YYDrs.YilSec;
end;
Procedure EditYY;
begin
  Ogr.EditYY
end;

Procedure AnaEdit;
begin
   Ogr.EditKut;
end;

procedure OgrGir;
begin
   Ogr.Giris;
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
   Drs.Giris;
end;
procedure UyeGir;
begin
   Uye.Giris;
end;
procedure YYdrsGir;
begin
   YYDrs.Giris;
end;
procedure BolumSec;
begin
   Ogr.BolumSec
end;

procedure BolumGir;
begin
   Bolum.BolumGir;
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDrs.DFile.CloseFile;
  Uye.DFile.CloseFile;
  Drs.DFile.CloseFile;
  Ogr.DFile.CloseFile;
  YYDrs.Done;
  uye.done;
  drs.done;
  ogr.done;
  Yariyil.done;
  clrscr;
  Halt;
end;


Procedure YYNotGir;
begin
  NotEditor.EditGrd(False);
end;
Procedure BTNotGir;
begin
  NotEditor.EditGrd(True);
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
   Ogr.Cikis
end;

procedure DrsCikis;
begin
  drs.cikis
end;
procedure UyeCikis;
begin
   Uye.Cikis
end;
procedure YYDrsCikis;
begin
   YYDrs.Cikis
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
    K:=Bolum.NuKod; List.Butunleme:=False;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
	WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
	TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List.ListeHazirla;
	   YYListStat[ActYY,I]:=True;
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
    K:=Bolum.NuKod; List.Butunleme:=True;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
        WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
        TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List.ListeHazirla;
	   BTListStat[ActYY,I]:=True;
	   WriteListStat;
	end;
    end;
    CloseEdit
end;

procedure AnaKutIsle;
begin
    BEKLEYINIZ('KšTšK YAZILIYOR');
    Ogr.KutIsle;
    CloseWindow;
end;
Procedure YYListeBas;
begin
   List.Butunleme:=False;
   List.ListeBas;
end;
Procedure BTListeBas;
begin
   List.Butunleme:=True;
   List.ListeBas;
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
  printBelge(True)
end;
Procedure OgrIndex;
Begin
   Ogr.IndexDuz;
   Ogr.WriteNdx
end;
Procedure DrsIndex;
Begin
   Drs.IndexDuz;
   Drs.WriteNdx
end;
Procedure YYDrsIndex;
Begin
   YYDrs.IndexDuz;
   YYDrs.WriteNdx
end;
Procedure UyeIndex;
Begin
   Uye.IndexDuz;
   Uye.WriteNdx
end;

procedure Bos;
begin
end;
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open; Drs.KredSaatToMem;
  Uye.init;  Uye.open;
  YYDrs.Init;YYDrs.Open;
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
  with Drs do begin
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
  with Uye do begin
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
  with YYDrs do begin
   if not Selection('YARIYIL DERS BASIMI','6@DRSKOD@2@BL@2@GR@25@DERS˜N ADI',SelectColor) then exit;
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
            Uye.DFile.GetRec(UyeAdr,Uye.Is);
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
Function DisketIndex(D : DataFile; NuRec, KeyL : Word):Boolean;
Var M           : Word;
    L           : Byte;
    T, S        : String;
    IndexFile   : DataFile;
    Which       : Boolean;
begin
     DisketIndex:=False; L:=KeyL;
     With IndexFile do begin
	 Init(1,(D.MaxKay+1)*(KeyL+2)); S:=D.FileName;
	 M:=Pos('.',S); S:=Copy(S,1,M)+'NDX';
	 T:=Copy(S,M-3,3); S:=Drive + S; Which:= ( T = 'OGR');
	 OpenFile(S);
	 If Status<>0 Then Exit;
	 For M:=1 to NuRec do
	    Case Which of
	       True : begin
			T:=Ogr.GetKey(IndAdrBuf[M].IndYer);
			Ogr.SetKeyAdr(T, M, IndAdrBuf[M].Dest);
		      end;
	       False: begin
			T:=Drs.GetKey(IndAdrBuf[M].IndYer);
			Drs.SetKeyAdr(T,M,IndAdrBuf[M].Dest);
		      end;
	    end;
	    Case Which of
	       True : begin
			Move(NuRec,Ogr.KodPtr^,2);
			PutRec(1,Ogr.KodPtr^);
			CloseFile;
			Ogr.ReadNdx;
		      end;
	       False: begin
			Move(NuRec,Drs.KodPtr^,2);
			PutRec(1,Drs.KodPtr^);
			CloseFile;
			Drs.ReadNdx;
		      end;
	    end;
     If Status = 0 then DisketIndex:=True;
     end;
  end;
Function PutOgrToDisket:Boolean;

Var I, Y, Z, T : Word;
    DistSay    : Word;
    Adr        : Word;
    DAdr       : Word;
    S          : String;
    Yer        : Word;
    Junk       : Boolean;
    DrsDisketF    : DataFile;
    OgrDisketF    : DataFile;

Procedure CloseDisketFiles;
begin
    DrsDisketF.CloseFile;
    OgrDisketF.CloseFile;
end;
begin
   DistSay:=0;
   PutOgrToDisket:=False;
   FillChar(IndAdrBuf, SizeOf(IndAdrBuf),#0);
   DrsDisketF.Init(Drs.DFile.MaxKay, Drs.DFile.RecLen);
   DrsDisketF.OpenFile(Drive+'DRS.DAT');
   OgrDisketF.Init(Ogr.DFile.MaxKay, Ogr.DFile.RecLen);
   OgrDisketF.OpenFile(Drive+Bolum.Kod(ActBol)+'OGR.DAT');
   For I:=1 to IndisSay do begin
    With Ogr do begin
       Adr:=Indis[I];
       DFile.GetRec(Adr,Is);
       For Y:=1 to YYCount do
	   For Z:=1 to Donem[Y].CNT do begin
	      DAdr:=AnaKay[Y,Z].DrsPtr;
	      T:=WORDARA(DAdr, IndAdrBuf, DistSay, SizeOf(IkiAdres));
	      If T=0 then begin
		 Inc(DistSay); T:=DistSay;
		 IndAdrBuf[DistSay].Orjin:=DAdr;
		 Drs.DFile.GetRec(DAdr, Drs.Is);
		 S:=Drs.GetIs;
		 Junk:=Drs.Search(S, Yer, DAdr);
		 IndAdrBuf[DistSay].IndYer:=Yer;
		 DrsDisketF.AddRec(IndAdrBuf[DistSay].Dest, Drs.Is);
		 If IndAdrBuf[DistSay].Dest = 0 then begin
		    Complain('DERSLER˜ D˜SKETE KOPYALIYAMIYORUM');
		    CloseDisketFiles;
		    Exit
		 End
	      end;
	      AnaKay[Y,Z].DrsPtr:=IndAdrBuf[T].Dest;
	   end;
       FillChar(Kac, SizeOf(Kac),#0);
       FillChar(YYKay,SizeOf(YYKay),#0);
       FillChar(Ders,SizeOf(YYKay),#0);
       OgrDisketF.AddRec(Adr,Is);
       If Adr=0 then begin
	   Complain('™¦RENC˜LER˜ D˜SKETE KOPYALIYAMIYORUM');
	   CloseDisketFiles;
	   Exit
       End;
    end;
   end;
   CloseDisketFiles;
   If Not DisketIndex(Drs.DFile, DistSay, Drs.KeyL) then begin
      Complain('D˜SKETE DERS ˜NDEKS˜ YAZILAMADI');
      Exit
   end;
   For I:=1 to IndisSay do
    With Ogr do begin
       Adr:=Indis[I];
       DFile.GetRec(Adr,Is);
       Junk:=Search(GetIs, Yer, Adr);
       IndAdrBuf[I].Dest:=I;
       IndAdrBuf[I].IndYer:=Yer;
    end;
   If Not DisketIndex(Ogr.DFile, IndisSay, Ogr.KeyL) then begin
      Complain('D˜SKETE ™¦RENC˜ ˜NDEKS˜ YAZILAMADI');
      Exit
   end;
   PutOgrToDisket:=True;
end;

Procedure WriteSupportFiles;
Var F : File;
    I, Result:Integer;
    T : TextFile;
    S:String;
begin
    Bolum.WriteFile(Drive+'BOLUM.DAT');
    Unvan.WriteFile(Drive+'UNV.DAT');
    GRAD.WriteFile(Drive+'GRADE.DAT');
    Assign(F,Drive+'GRDSTAT.DAT');
    ReWrite(F,SizeOf(GRAD.Grade));
    BlockWrite(F,GRAD.Grade,1,Result);
    Close(F);
    With T do begin
       OpenToWrite(Drive+'UNIVFAK.DAT');
       WriteText(Univ);
       WriteText(Fakulte);
       CloseFile;
    end;
    With T do begin
       OpenToWrite(Drive+'YIL.DAT');
       Str(ActYil,S);
       WriteText(S);
       Str(ActYY,S);
       WriteText(S);
       For I:=1 to 3 do Begin
	  Str(Yariyil.Yil[I], S);
	  WriteText(S);
       end;
       CloseFile;
    end;
end;

Procedure MezunSakla;
Var I   : Word;
    TC  : Char;
    Junk:Boolean;
Begin
     If Bolum.NuKod = 0 then begin complain('HEN˜Z B˜R B™LšM YOK'); exit end;
     If not DisketTak('MEZUN D˜SKET SšRšCšSš') then exit;
     if not Ogr.Selection('MEZUN OLAN ™¦RENC˜LER',
		   '8@™¦R.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
     If IndisSay = 0 then exit;
     WriteSupportFiles;
     Junk:=PutOgrToDisket;
end;
Procedure YYDiskListeBas;
begin
   DiskList.Butunleme:=False;
   DiskList.ListeBas;
end;
Procedure BTDiskListeBas;
begin
   DiskList.Butunleme:=True;
   DiskList.ListeBas;
end;
Procedure KrediDok;
Var I   : Word;
    TC  : Char;
    S:String;
    Sira,Sayfa:Word;
Function  OgrLine:String;
begin
 With Ogr do
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
  with Ogr do begin
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
     SlctOgr.Say:=Ogr.Say;
     For I:=1 to Ogr.Say do Indis[I]:=Ogr.GetAdr(I);
     IndisSay:=Ogr.Say;
     If SlctOgr.Selection('™¦RENC˜ KRED˜LER˜ BASIMI',
		    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@6@ORTALAMA@8@KRED˜ TOPLAMI',
		     SelectColor) then
     begin
          IndisSay:=0;
          for I:=1 to Ogr.Say do
             If selArr[I] then begin
               Inc(IndisSay);
               Indis[I]:=Ogr.GetAdr(I)
             end;
           OgrAltBasim;
     end;
     SlctOgr.KrediyeGore:=false;
end;

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
       AddMenu('~PROGRAM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('PROGRAM ~G˜R      ', NULL   , CmdBolumGir  , BolumGir,0,
       AddMenu('~YIL SE€ CTRL_F1  ', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('Y~EN˜ YIL         ', NULL   , CmdYeniYil   , YeniYil ,0,
       AddMenu('B~ASIM', NULL, 0, Bos,
	   AddMenu('™¦~RENC˜  ALT_F2', ALT_F2,CmdOgrBasim, OgrBasim,0,
	   AddMenu('~DERS     ALT_F3', ALT_F3,CmdDrsBasim, DrsBasim,0,
	   AddMenu('~YY. DERS ALT_F4', ALT_F4,CmdYYDrsBasim,YYDrsBasim,0,
	   AddMenu('™¦R.~EL.  ALT_F5', ALT_F5,CmdUyeBasim,UyeBasim,0,0)))),
       AddMenu('~D˜SKET', NULL,0,Bos,
	   AddMenu('~MEZUN SAKLA   ', NULL,CmdMezunSakla,MezunSakla,0,
	   AddMenu('~YY. L˜STE BAS ', NULL,CmdYYDiskListeBas,YYDiskListeBas,0,
	   AddMenu('~BšT.L˜STE BAS ', NULL,CmdBTDiskListeBas,BTDiskListeBas,0,0))),

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
       AddMenu('~YY. NOT G˜R˜ž       F7', F7      , CmdYYNotGir,YYNotGir,0,
       AddMenu('YY. ~L˜STE HAZ  CTRL_F6', CTRL_F6 , CmdListeHazirla,ListeHazirla,0,
       AddMenu('YY. L˜~STE BAS  CTRL_F7', CTRL_F7 , CmdYYListeBas,YYListeBas,0,
       AddMenu('~BšT.NOT G˜R˜ž   ALT_F7', ALT_F7  , CmdBTNotGir,BTNotGir,0,
       AddMenu('Bš~T.L˜STE HAZ   ALT_F6', ALT_F6  , CmdBTListeHazirla,BuTListeHazirla,0,
       AddMenu('BšT.L˜ST~E BAS SHIFT_F7', SHIFT_F7, CmdBTListeBas,BTListeBas,0,0))))))),
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
