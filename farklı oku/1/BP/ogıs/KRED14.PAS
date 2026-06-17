uses Crt, Nsr, UOg, BLUNGR, GenUtil, DFile, Exist, UPrt, UIndex;
Const MaxSatir = 52;


XHead1=' YRYL BAžRLI BAžRSZ TOPLAM DEVMSZ   YRYL BAžRLI BAžRSZ TOPLAM DEVMSZ';
XHead2=' ---- ------ ------ ------ ------   ---- ------ ------ ------ ------';
       MaxImza      = 4;
       MaxNotDip    = 5;
       Imzalar     : Array[1..MaxImza] of String=('™¦RENC˜ ˜žLER˜ SORUMLUSU','','','');
       ImzaIsim    : Array[1..MaxImza] of String=('','','','');
       NotDip      : Array[1..MaxNotDip] of String=('D˜S˜PL˜N CEZASI ALMAMIžTIR','','','','');
       NotDipSay   : Word = 0;
       ImzaSay     : Word = 1;
       MaxBelgeLine =40;
       MxLine       = 59;
       TIT1='          ™¦RENC˜N˜N                    BAžARI NOTU         ';
       TIT2='    NO         ADI VE SOYADI        RAKAMLA     YAZIYLA     ';
       AR1 =' -------- ------------------------- ------- ----------------';
       ALT11 =' -----------------------------------------------------------';
       TIT=TIT1+TIT1;
       AR  =AR1+AR1;
       TITN=TIT2+TIT2;
       ALT  = ALT11+ALT11;
  HEAD1='      YIL      DERS˜N                         HAFTALIK   BAžARI  ';
  HEAD2='    YARIYIL     KODU          DERS˜N ADI        SAAT      NOTU   ';
  BARA1=' ------------- ------ ------------------------- ---- ------------';
  ALT1 =' ----------------------------------------------------------------';
  ALT2 =' ---------------------------------------------------';
  HEAD3='  DERS˜N                         HAFTALIK   BAžARI  ';
  HEAD4='   KODU          DERS˜N ADI        SAAT      NOTU   ';
  BARA2='  ------ ------------------------- ---- ------------';
  Var Sayfa, Satir : Byte;

    Type TDers = Record
         DAdr   : Word;
         DGrd   : Byte;
         DDonem : Byte;
    end;
    ADers = Array[1..8, 1..20] of TDers;
    ADersSay = Array[1..8] of Word;
    AKredTop = Array[1..8] of Real;
    ASaatTop = Array[1..8] of Word;
Var
    BDersSay  : ADersSay;
    BKred     : AKredTop;
    BSaat     : ASaatTop;
    BDers     : ^ADers;
    FDersSay  : ADersSay;
    FKred     : AKredTop;
    DKred     : AKredTop;
    FSaat     : ASaatTop;
    FDers     : ^ADers;
Var BasilanSatir : Byte;
    BASARIBAS    : Boolean;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;

Procedure FormFeed;
begin
   LPT.WriteLnPrt('\F');
   Inc(Sayfa);
   Satir:=0;
end;
Function Tek(A : String):Byte;
Var L   : Byte;
    C   : Char;
begin
   L:=Length(A);
   C:=A[L];
   L:=Ord(C)-48;
   L:=L Mod 2;
   Tek:=L;
end;

Function IlkIndex(S : String): Byte;
Var C : Char; L : Byte;
begin
    C:=S[4]; L:=Ord(C)-48;
    L:=2*L-Tek(S);
    If (L<1) or (L>8) then begin
       Complain(S+' KODLU DERS ISTENEN FORMATA UYMUYOR');
       IlkIndex:=1;
    end else
       IlkIndex:=L
end;


Procedure FindBas;
Var Q, I, J : Word;
    S    : String;
    L    : Byte;
    Succes : Boolean;
begin
   Fillchar(BDersSay, SizeOf(BdersSay),#0);
   Fillchar(BKred, SizeOf(BKred),#0);
   Fillchar(BSaat, SizeOf(BSaat),#0);
   FillChar(BDers^, SizeOf(ADers),#0);
With Ogr do begin
   For I:=1 to YYCount do
       For J:=1 to Donem[I].CNT do
        with AnaKay[I,J] do begin
           Succes:=GRAD.Grade[Grd].Basari;
           If Succes then begin
              Drs.DFile.GetRec(DrsPtr,Drs.Is);
              S:=Drs.GetIs;
              L:=IlkIndex(S);
              Q:=WORDARA(DrsPtr, BDers^[L], BDersSay[L], SizeOf(TDers));
              If Q=0 then begin
                 Inc(BDersSay[L]);
                 BKred[L]:=BKred[L]+Drs.Kredi;
                 BSaat[L]:=BSaat[L]+Drs.Saat;
                 With BDers^[L,BDersSay[L]] do begin
                    DAdr:=DrsPtr;
                    DDonem:=I;
                    Dgrd:=Grd;
                 end;
              end;
           end;
        end;{With}
        {End For}
   {end for}
end;
end;
Procedure FindFail;
Var Q, I, J : Word;
    S : String;
    L : Byte;
    Succes : Boolean;
begin
   Fillchar(FDersSay, SizeOf(FdersSay),#0);
   Fillchar(FKred, SizeOf(FKred),#0);
   Fillchar(DKred, SizeOf(DKred),#0);
   Fillchar(FSaat, SizeOf(FSaat),#0);
   FillChar(FDers^, SizeOf(ADers),#0);
With Ogr Do begin
   For I:=YYCount DownTo 1 do
       For J:=1 to Donem[I].CNT do
         with AnaKay[I,J] do begin
           Succes:=GRAD.Grade[Grd].Basari;
           If Not Succes then begin
              Drs.DFile.GetRec(DrsPtr,Drs.Is);
              S:=Drs.GetIs;
              L:=IlkIndex(S);
              Q:=WORDARA(DrsPtr, BDers^[L], BDersSay[L], SizeOf(TDers));
              If Q=0 then begin
                 Q:=WORDARA(DrsPtr, FDers^[L], FDersSay[L], SizeOf(TDers));
                 If Q = 0 then begin
                    Inc(FDersSay[L]);
                    If Grd<>103 then begin
                       FKred[L]:=FKred[L]+Drs.Kredi;
                       FSaat[L]:=FSaat[L]+Drs.Saat;
                    end else
                       DKred[L]:=DKred[L]+Drs.Kredi;
                    With FDers^[L,FDersSay[L]] do begin
                       DAdr:=DrsPtr;
                       DGrd:=Grd;
                       DDonem:=I;
                 end;
                end;
              end;
           end;
         end;{With}
         {End For}
   {end for}
end;
end;
Procedure WriteImzalar;
Var T : TextFile;
    I : Word;
    S : String;
begin
    ImzaSay:=0;
    For I:=1 to MaxImza do
       If Imzalar[I]<>'' then begin
	  Inc(ImzaSay);
	  Imzalar[ImzaSay]:=Imzalar[I];
       end;
   If ImzaSay=0 then begin
      ImzaSay:=1;
      Imzalar[1]:='™¦RENC˜ ˜žLER˜ SORUMLUSU';
   end;
   S:=IntToStr(ImzaSay,1);
   With T do begin
     OpenToWrite('IMZALAR.DAT');
     WriteText(S);
     For I:=1 to ImzaSay do  begin
	 WriteText(Imzalar[I]);
	 WriteText(ImzaIsim[I]);
     end;
     CloseFile;
   end;
end;
Procedure ReadImzalar;
Var T : TextFile;
    I : Word;
    S : String;
begin
   If not Exists('IMZALAR.DAT') then WriteImzalar;
   With T do begin
     OpenToRead('IMZALAR.DAT');
     S:=ReadText;
     ImzaSay:=StrToInt(S);
     For I:=1 to ImzaSay do begin
	 Imzalar[I]:=ReadText;
	 ImzaIsim[I]:=ReadText
     end;
     CloseFile;
   end;
end;
Procedure EditImzalar;
VAR TC:CHAR;
    S : String;
    C : Char;
    I : Word;
procedure ReadImza;
begin
  if TC<>NULL then exit;
  InputStr(Imzalar[I], Form.FieldKol[1], I, 30, False, AllKar, 0, TC);
  If TC=NULL then Inc(I);
  If I > MaxImza then I:=1;
end;
begin
    S:=''; TC:=Null;
    For C:='1' to Chr(MaxImza+48) do S:=S+'30@'+C+'.˜MZA SAH˜B˜N˜N šNVANI@';
    S[0]:=Chr(Length(S)-1);
    OpenForm('NOT BELGES˜NE G˜RECEK ˜MZALAR', S,
		 'ESC:G˜R˜ž TAMAM',
		 [ESC],[], 10);
    I:=1;
    ClrScr;
    Repeat
       ReadImza;
    until TC=ESC;
    CloseEdit;
    WriteImzalar;
End;


Procedure EditNotDip;
VAR TC:CHAR;
    S : String;
    C : Char;
    I : Word;
procedure ReadDip;
begin
  if TC<>NULL then exit;
  InputStr(NotDip[I], Form.FieldKol[1], I, 30, False, AllKar, 0, TC);
  If TC=NULL then Inc(I);
  If I > MaxNotDip then I:=1;
end;
begin
    S:=''; TC:=Null;
    For C:='1' to Chr(MaxNotDip+48) do S:=S+'30@'+C+'.D˜P NOT@';
    S[0]:=Chr(Length(S)-1);
    OpenForm('NOT BELGES˜NE YAZILACAK D˜P NOTLAR', S,
		 'ESC:G˜R˜ž TAMAM',
		 [ESC],[], 10);
    I:=1;
    clrscr;
    Repeat
       ReadDip;
    until TC=ESC;
    CloseEdit;
    NotDipSay:=0;
    NotDipSay:=0;
    For I:=1 to MaxNotDip do
       If NotDip[I]<>'' then begin
	  Inc(NotDipSay);
	  NotDip[NotDipSay]:=NotDip[I];
       end;
end;


Procedure EraseExtra(S : String);
Var Extra:Word;
begin
   For Extra:=1 to Length(S) do
      If S[Extra] in ['+','-','*','='] then S[Extra]:=' ';
end;

Procedure BelgeBas(Tarih, MezTar, MezUnv:String);
Var OgSay, I, J : Word; Sayfa:Byte;
    OgAdr:Array[1..MaxOgr] of Word;
    TC:Char;
    LNeed : Word;
    Basildi : Array[1..MaxDonem,1..MaxDonemDrs] of Boolean;

Function AnyLeft : Boolean;
Var I,J : Word;
begin
   AnyLeft:=True;
   With Ogr do begin
      For I:=1 to YYCount do
	For J:=1 to Donem[I].CNT do
	    If Not Basildi[I,J] then exit;
   end;
   AnyLeft:=False;
end;


Procedure PrintOneBelgeLine(I, J : Word);
Var S, T, A : String;
    K       : Word;

begin
     If J=1 then
	S:=CHR(I+48)+'. YARIYIL  '
     else
	S:=Spaces(13);
     For K:=J to J+1 do
       With Ogr do begin
          If K<=Donem[I].CNT then begin
	     A:='';
	     Drs.DFile.GetRec(AnaKay[I,K].DrsPtr,Drs.Is);
	     Basildi[I,K]:=True;
             T:=Drs.GetIs;
             EraseExtra(T);
             A:=A+' '+T+' '+Drs.GetAd;
             A:=A+'  '+IntToStr(Drs.Saat,2);
	     A:=A+'  '+GRAD.BasimGradeLine(AnaKay[I,K].Grd);
             S:=S+' '+A;
          end;
       end;
       LPT.WriteLnPrt('\C'+ S);
end;
Procedure CommonHead;
begin
   LPT.WriteLnPrt('\C'+ HEAD1+HEAD3);
   LPT.WriteLnPrt('\C'+ HEAD2+HEAD4);
   LPT.WriteLnPrt('\C'+ BARA1+BARA2);
end;
Procedure BelgeHeader(Tarih, MezTar, MezUnv : String; Sayfa:Word);
Var T, S:String;
begin
   S:=Fakulte+' '+Bolum.KodAd(ActBol); Strip(S);
   LPT.WriteLnPrt('\C\E'+ Ortala(60,UNIV));
   LPT.WriteLnPrt('\C\E'+ ortala(60,S));
   LPT.WriteLnPrt(Ortala(80,'NOT BELGES˜'));
   LPT.WriteLnPrt( '\C\S89TAR˜H : '+ Tarih);
   STr(Sayfa:2,S);
   LPT.WriteLnPrt('\C\S89SAYFA : '+S);
   LPT.WriteLnPrt('\C\S4™¦RENC˜ NO       : \D\C'+Ogr.GetIs);
   LPT.WriteLnPrt('\C\S4ADI, SOYADI      : \D\C'+Ogr.GetAd);
   LPT.WriteLnPrt('\C\S4MEZUN˜YET TAR˜H˜ : \D\C'+MezTar);
   LPT.WriteLnPrt('\C\S4šNVANI           : \D\C'+MezUnv);
   STR(OGR.GPA:3:2,S);
   T:=GRAD.Kod(Ogr.HazNot);
   if (T='TK') or (T='NY') then
      T:=' '
   else
     T:='HAZIRLIK NOTU : '+GRAD.KodAd(Ogr.HazNot);
   LPT.WriteLnPrt('\C\S4NOT ORTALAMASI   : \D\C'+S+
   '\C\S60'+T);
   LPT.WriteLnPrt( '\C'+alt1+alt2);
   CommonHead;
end;
procedure LPrintOgr;
Var I, J, K, C : Word;
    V : AnaRec;
    ss:String;
    U : YilRec;
    VV : AnaRecType;
    A, B, D : String;
Procedure Proceed;
begin
  If (BasilanSatir=MaxBelgeLine) then
     if AnyLeft then begin
	 LPT.WriteLnPrt('\F');
	 Inc(Sayfa);
	 BelgeHeader(Tarih,MezTar,MezUnv,Sayfa);
	 BasilanSatir:=0;
      end;
end;
begin
   Sayfa:=1;
   BelgeHeader(Tarih, MezTar, MezUnv ,Sayfa);
   BasilanSatir:=0;
   FillChar(Basildi, SizeOf(Basildi),#0);
   with ogr do begin
       YYCount:=8;
       If BasariBas then
           For I:=1 to YYCount do begin
               Donem[I].CNT:=BDersSay[I];
               For K:=1 to BDersSay[I] do Move(BDers^[I,K], AnaKay[I,K],3);
           end
       else
          For I:=1 to YYCount do begin
               Donem[I].CNT:=FDersSay[I];
               For K:=1 to FDersSay[I] do Move(FDers^[I,K], AnaKay[I,K],3);
           end;
       For I:=1 to YYCount do begin
           J:=1;
           While J<=Donem[I].CNT do begin
                PrintOneBelgeLine(I, J);
	        Inc(BasilanSatir);
                Inc(J,2);
                Proceed;
            end;
            if I<YYCount then begin
               LPT.WriteLnPrt('\L');
               Inc(BasilanSatir);
               Proceed;
            end;
       end;
    end;
    LPT.WriteLnPrt('\C'+ BARA1+BARA2);
    For I:=1 to NotDipSay do
         LPT.WriteLnPrt('\C'+NotDip[I]);
    LPT.WriteLnPrt('\C'+'  ');
    LPT.WriteLnPrt('\C'+Ortala(120,'BELGEY˜ ONAYLAYAN'));
    J:=(120 - ImzaSay*30) div (ImzaSay + 1);
    A:=''; B:=''; D:='';
    For I:=1 to ImzaSay do begin
        A:=A+Spaces(J)+Ortala(30,Imzalar[I]);
        B:=B+Spaces(J)+ConstStr('-',30);
        D:=D+Spaces(J)+Ortala(30,ImzaIsim[I]);
    end;
    LPT.WriteLnPrt('\C'+A);
    LPT.WriteLnPrt('\C'+B);
    LPT.WriteLnPrt('\C'+D);
    LPT.WriteLnPrt('\F');
end;
procedure ShowBasariStat;
begin
       IF BasariBas then
	 WriteStr(Form.FieldKol[1],4,'BAžARILI NOTLAR BASILACAK',CmdColor)
       else
	 WriteStr(Form.FieldKol[1],4,'BAžARISIZ NOTLAR BASILACAK',CmdColor)
end;


begin
   if not Ogr.Selection('KISA NOT BELGES˜ BASILACAK ™¦RENC˜LER˜ SE€˜N˜Z ',
	       '8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   OgSay:=0;
   For I:=1 to Ogr.Say do
      If SelArr[I] then begin
	 Inc(OgSay);
	 OgAdr[OgSay]:=Ogr.GetAdr(I);
      end;
   OpenEditWindow('NOT BELGES˜ D™KšMš',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI',
		 'CR:BAS@CTRL_X:BAžRLI/BAžRSZ@ESC:VAZGE€',
		  [CR, CTRL_X, ESC],[],5,6);
   BASARIBAS:=True;
   I:=1;
   While I<= OgSay do begin
       Ogr.DFile.GetRec(Ogadr[I],Ogr.Is);
       WriteStr(Form.FieldKol[1],1,Ogr.Getis+' '+Ogr.GetAd,SelectColor);
       WriteStr(Form.FieldKol[1],2,'BASILSINMI?',CmdColor);
       ShowBasariStat;
       TC:=GetDesiredKey([ESC,CTRL_X,CR]);
       Case TC of
       CR: begin
	     If Ogr.YYCount = 0 then
		complain('BU ™¦RENC˜N˜N ANA KšTš¦š BOž')
	     else begin
                FindBas;
                FindFail;
		LprintOgr;
             end;
             Inc(I);
	  end;
       CTRL_X : Begin BasariBas:=Not BasariBas; ShowBasariStat end;
       ESC:Inc(I);
      end;
    end;
    CloseEdit;
end;
Procedure PrintBelge(Mezuniyet : Boolean);
Var Tarih, MezTar, MezUnv, S, T : String;
    TC:Char;
    I, Ed : Word;
procedure GetMezUnv;
begin
  if TC<>Null then exit;
  InputStr(MezUnv,Form.FieldKol[2],1,30,False,AllKar,0,TC);
end;
Procedure GetMezTar;
begin
   OpenEditWindow('MEZUN˜YET BELGES˜ D™KšMš',
		 '10@MEZUN˜YET TAR˜H˜@30@MEZUN˜YET UNVANI',
		 'INS:G˜R˜ž@ESC:VAZGE€',
		 [INSKEY, ESC],[CmdBolumSec],3,4);

   MezTar:=Tarih;MezUnv:='';
   ShowCursor;
   ClrScr;
   Repeat
       GetTarih(Form.FieldKol[1], 1, MezTar,TC);
       GetMezUnv;
       If TC=#253 then TC:=NULL;
       case TC of
	  ESC : begin CloseEdit; Exit end;
	  INSKEY : begin CloseEdit; TC:=NULL; exit end;
       end;
  until false
end;
procedure GetImzaIsim;
begin
  if TC<>NULL then exit;
  InputStr(ImzaIsim[Ed],Form.FieldKol[1],Ed + 1,30,False,AllKar,0,TC);
  If TC=NULL then Inc(Ed);
  If Ed > ImzaSay then Ed:=0;
end;
Procedure ReStart;
var I : Word;
begin
  If Mezuniyet then S:='MEZUNIYET' else S:='NOT';
  T:='10@TAR˜H@'; TC:=NULL; Ed:=0;
  For I:=1 to ImzaSay do T:=T+'30@'+Imzalar[I]+'@';
  T[0]:=Chr(Length(T)-1);
  OpenForm(S+' BELGES˜ D™KšMš',T,
		 'F9:YETK˜L˜ ˜MZALAR@F10:D˜P NOTLAR@INS:G˜R˜ž@ESC:VAZGE€',
		 [f9, F10,INSKEY, ESC],[CmdBolumSec],5);
   ShowCursor;
   ClrScr;
   For I:=1 to ImzaSay do writestr(1,i+1,Imzaisim[i],textattr);
end;
begin
   Tarih:='01/01/1992';
   BASARIBAS:=True;
   ReStart;
   Repeat
       If Ed = 0 then begin
	  GetTarih(Form.FieldKol[1], 1, Tarih,TC);
	  Inc(Ed);
       end;
       GetImzaIsim;
       If TC = #253 then TC := NULL;
       case TC of
	  ESC : begin CloseEdit; Exit end;
	  F9  : Begin EditImzalar; CloseEdit; WriteImzalar; ReStart end;
	  F10 : begin EditNotDip; TC:=NULL end;
	  INSKEY : begin
		       CloseEdit; WriteImzalar;
		       If Not mezuniyet then
			  BelgeBas(Tarih, 'MEZUN OLMAMIžTIR',' ')
		       else begin
			  GetMezTar;
			  If TC=ESC then exit;
			  BelgeBas(Tarih, MezTar, MezUnv);
		       end;
		       Exit;
		   end;
       end;
  until false
end;

Procedure PrintHader;
Begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Bolum.KodAd(ActBol)));
   LPT.WriteLnPrt('  ');
   Satir:=5;
end;
Procedure PrintLine;
begin
   LPT.WriteLnPrt(' '+XHead1);
   LPT.WriteLnPrt(' '+XHead2);
end;
Procedure PrintName;
Begin
   LPT.WriteLnPrt('  ');
   LPT.WriteLnPrt('   '+Ogr.GetIs+' '+Ogr.GetAd);
end;
Function Info(L:Byte):String;
Var A, S : String;
begin
    S:='  '+Chr(L+48)+'   ';
    Str(BKred[L]:6:2,A);
    S:=S+A;
    Str(FKred[L]:6:2,A);
    S:=S+' '+A;
    Str((BKred[L]+FKred[L]):6:2,A);
    S:=S+' '+A;
    Str(DKred[L]:6:2,A);
    S:=S+' '+A;
    Info:=S;
end;
Procedure PrintInfo(L : Byte);
Var S : String;
begin
  S:=Info(L)+'  '+Info(L+1);
  LPT.WriteLnPrt(' '+S);
end;
Procedure PrintOgr(OgrAdr: Word);
begin
     Ogr.DFile.GetRec(OgrAdr, Ogr.Is);
     FindBas;
     FindFail;
     PrintName;
     PrintLine;
     PrintInfo(1);
     PrintInfo(3);
     PrintInfo(5);
     PrintInfo(7);
     Satir:=Satir+8;
end;


{$F+}

Procedure YilSec;
begin
  YYDrs.YilSec;
end;
Procedure AnaEdit;
begin
   Ogr.EditKut;
end;
procedure BolumSec;
begin
   Ogr.BolumSec
end;
procedure Bos;
begin
end;

Procedure PrintBasDers;
begin
   PrintBelge(True);
end;

Procedure Kred14Bas;
Var B      : Boolean;
    I      : Word;
    S      : String;
    OgAdr : Word;
begin
  Satir:=0; Sayfa:=1;
  with Ogr do begin
     if not Selection('™¦RENC˜ YARIYIL KRED˜ BASIMI',
      '8@™¦R.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
      Sayfa:=1; Satir:=0;
      For I:=1 to IndisSay do begin
          If Satir > MaxSatir then FormFeed;
          If Satir = 0 then PrintHader;
          PrintOgr(Indis[I]);
      end;
  end;
end;

Procedure KrediDok;
Var I   : Word;
    TC  : Char;
    S:String;
    Sira:Word;
Function  OgrLine:String;
begin
 With Ogr do
    OgrLine:='         '+GetIs+ ' ' +GetAd+'   '+RealToStr(GPA,6,2)+'        '+RealToStr(TopKredi,8,2)
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
     For I:=1 to Ogr.Say do Indis[I]:=Ogr.GetAdr(I);
     If Not Ogr.Selection('™¦RENC˜ KRED˜LER˜ BASIMI',
	    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI', SelectColor) then exit;
     IndisSay:=0;
     for I:=1 to Ogr.Say do
         If SelArr[I] then begin
           Inc(IndisSay);
           Indis[I]:=Ogr.GetAdr(I)
         end;
     OgrAltBasim;
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
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  FreeMem(BDers, SizeOf(ADers));
  FreeMem(FDers, SizeOf(ADers));
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
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Unvan.init;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open; Drs.KredSaatToMem;
  Uye.init;  Uye.open;
  YYDrs.Init;YYDrs.Open;
  GetMem(FDers, SizeOf(ADers));
  GetMem(BDers, SizeOf(ADers));
  ReadUniv;
  ShowBolYil;
  ReadListStat;
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
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('€~IK       ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0,0))),
  AddMenu('K~RED/BAž', ALT_R, 0, Bos,
       AddMenu('KRED˜ D™KšM        F2',F2, CmdOgrGir,   Kred14Bas,  0,
       AddMenu('BAžARILI DERS D™K  F3',F3, CmdDrsGir,   PrintBasDers,  0,0)),
     AddMenu('Kš~TšK', ALT_T, 0, Bos,
       AddMenu('~KšTšK G˜R/DE¦˜ž       F8', F8      , CmdAnaEdit   ,AnaEdit,0,
       AddMenu('KRE~D˜ D™KšMš             ',NULL,CmdKrediDok, KrediDok,0,0)),0)));

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