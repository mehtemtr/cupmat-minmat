unit winlist;
interface
uses
 Crt, Nsr, UOg, UIndex, BLUNGR, Exist, GenUtil, DFile, UPrt, StrIn;
Var Txt : Text;
Const  MaxBuf    = MaxOgr;
       MaxImza      = 4;
       MaxNotDip    = 5;
       Imzalar     : Array[1..MaxImza] of String=('™¦RENC˜ ˜LER˜ SORUMLUSU','','','');
       ImzaIsim    : Array[1..MaxImza] of String=('','','','');
       NotDip      : Array[1..MaxNotDip] of String=('D˜S˜PL˜N CEZASI ALMAMITIR','','','','');
       NotDipSay   : Word = 0;
       ImzaSay     : Word = 1;
       MaxBelgeLine =40;
       MxLine       = 59;
       TIT1='          ™¦RENC˜N˜N                    BAARI NOTU         ';
       TIT2='    NO         ADI VE SOYADI        RAKAMLA     YAZIYLA     ';
       AR1 =' -------- ------------------------- ------- ----------------';
       ALT11 =' -----------------------------------------------------------';
       TIT=TIT1+TIT1;
       AR  =AR1+AR1;
       TITN=TIT2+TIT2;
       ALT  = ALT11+ALT11;
  HEAD1='      YIL      DERS˜N                         HAFTALIK   BAARI  ';
  HEAD2='    YARIYIL     KODU          DERS˜N ADI        SAAT      NOTU   ';
  BARA1=' ------------- ------ ------------------------- ---- ------------';
  ALT1 =' ----------------------------------------------------------------';
  ALT2 =' ---------------------------------------------------';
  HEAD3='  DERS˜N                         HAFTALIK   BAARI  ';
  HEAD4='   KODU          DERS˜N ADI        SAAT      NOTU   ';
  BARA2='  ------ ------------------------- ---- ------------';

  YOKLAUST1= 'ÚÄÄÄÂÄÄÄÄÄÄÄÄÂÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ';
YOKLAUST=YOKLAUST1+  'ÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄ¿';
  YOKLABS1 = '³SN.³ ™¦R.NO ³       ADI SOYADI        ';
YOKLABS = YOKLABS1 + '³ 1³ 2³ 3³ 4³ 5³ 6³ 7³ 8³ 9³10³11³12³13³14³     ³     ³     ³     ³     ³     ³     ³';
  YOKLAARA1= 'ÃÄÄÄÅÄÄÄÄÄÄÄÄÅÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ';
YOKLAARA=YOKLAARA1+  'ÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄ´';
  YOKLAORT1= '³   ³        ³                         ';
  YOKLAORT=  YOKLAORT1+  '³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³     ³     ³     ³     ³     ³     ³     ³';
  YOKLAALT1= 'ÀÄÄÄÁÄÄÄÄÄÄÄÄÁÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ';
YOKLAALT=  YOKLAALT1+'ÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÙ';


Type
     OneListRec = record
        Link, OgrAdr : Word;
     end;
     ListBufType = Array[1..MaxBuf] of OneListRec;

     ListObj = Object(Select)
        ListBuf  : ListBufType;
        LinkBuf  : Array[1..MaxYYDrs] of Word;
	ListF    : DataFile;
        Liste    : Array[1..MaxOgr] of Word;
	Mev      : Word;
	Butunleme: Byte;
	YYDersAdr: Word;
       Constructor Init;
       Procedure   ShowLine(Yer:Word; Attr:Byte);virtual;
       Procedure   ListeHazirla;
       Function    ListeOku:Boolean;
       Function    ListFileName:String;
       Procedure   PrintListe;Virtual;
       Procedure   ListeBas;Virtual;
       Procedure   YoklaBas;Virtual;
       Procedure   YoklaPrintListe;Virtual;
       Function    Search(S:String; Var Yer, Adr : Word):Boolean;Virtual;
    end;
    NotEditObj = object(Cursor)
      Mev        : Word;
      YYDrsAdr   : Word;
      OgAdr      : Word;
      GrdYer     : Word;
      KD         : String;
      YYDrNdx    : Word;
      Ed         : Word;
      Constructor Init;
      Procedure   SetMevAdr(M, {Mevcut}
		       A  {YYAdr} : Word);

      Procedure ShowLine(Yer:Word; Attr:Byte);virtual;
      Procedure GoRight;
      Procedure GoLeft;
      Procedure GetOneOgr(Yer : Word; Var S, G : String);
      Procedure EditGrd(B:Byte);
   end;


   procedure ChangeBol(Bol:Byte);
   Function Ortala(M:Byte; S : String):String;
   Procedure EraseExtra(Var S : String);
   Procedure BelgeBas(Tarih, MezTar, MezUnv:String);
   Procedure PrintBelge(Mezuniyet:Boolean);
   Procedure KarneBas;


Var List         : ListObj;
    NotEditor    : NotEditObj;
    BasilanSatir : Byte;
    BASARIBAS    : Boolean;

implementation
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
      Imzalar[1]:='™¦RENC˜ ˜LER˜ SORUMLUSU';
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
		 'ESC:G˜R˜ TAMAM',
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
		 'ESC:G˜R˜ TAMAM',
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


  Constructor ListObj.Init;
  Begin
      Select.Init(DrsKeyL);
  end;

Procedure   ListObj.ShowLine(Yer:Word; Attr:Byte);
Var S:String;
begin
   YYDrs.DFile.GetRec(Indis[Yer],YYdrs.Is);
   Drs.DFile.GetRec(YYDrs.DrsAdr,Drs.Is);
   S:=YYDrs.GetIsExpand+' '+Drs.Ad;
   WriteStr(Form.FieldKol[1],EdRow,S, Attr)
end;

Function  ListObj.Search(S:String; Var Yer, Adr : Word):Boolean;
Var B : Boolean;
    K : Word;
begin
    B:=YYDrs.Search(S+Chr(ActBol+64),Yer, Adr);
    Yer:=WordAra(Adr, Indis[1], IndisSay, 2);
    If Yer = 0 then Yer:=1;
    Adr:=Indis[Yer];
end;

Function    ListObj.ListFileName;
Var S : String;
begin
     S:=Bolum.Kod(ActBol)+GUZBAH[ActYY]+SeneStr;
     Case Butunleme of
       1: S:=S+'L.DAT';
       2: S:=S+'B.DAT';
       3: S:=S+'T.DAT';
     end;
     ListFileName:=S
end;
Procedure   ListObj.ListeHazirla;
Var LinkAdr,I, J, R, Adres, BufPtr, MM : Word;
begin
    With YYDrs do begin
       IndisInit(ActBol, 1);
       If IndisSay = 0 then begin
	  Complain(Bolum.KodAd(ActBol)+' DERS A€ILMAMI');
	  exit
       end;
    end;
    FillChar(LinkBuf,SizeOf(LinkBuf),#0);
    LinkAdr:=0;BufPtr:=0;
    FillChar(ListBuf, SizeOf(ListBuf),#0);
    With ListF do begin
       Init($FFFF, SizeOf(OneListRec));
       OpenFile(ListFileName);
       Init($FFFF, SizeOf(ListBufType));
       If Status=0 then IsOpen:=1;
       WriteHeader;
    end;
    Bekleyiniz('L˜STE HAZIRLANIYOR');
    For I:=1 to Ogr.Say do begin
       Adres:=Ogr.GetADr(I);
       Ogr.DFile.GetRec(Adres,Ogr.Is);
       For J:=1 to Ogr.Kac[AktifYYInd] do begin
	   If BufPtr = MaxBuf then begin
	      ListF.AddRec(R, ListBuf);
	      BufPtr:=0;
	      FillChar(ListBuf, SizeOf(ListBuf),#0)
	   end;
           If (Butunleme=1) or
              ( (Butunleme =2) and  (Ogr.Ders[AktifYYInd,J].Grd = 102) ) or
              ( (Butunleme =3) and  (Ogr.Ders[AktifYYInd,J].Grd = 107) )
              then begin
  	      inc(LinkAdr);inc(BufPtr);
              With ListBuf[BufPtr] do begin
		  Link:=LinkBuf[Ogr.YYKay[AktifYYInd,J]];
		  LinkBuf[Ogr.YYKay[AktifYYInd,J]]:=LinkAdr;
		  OgrAdr:=Adres;
	      end;
           end;
       end;
   end;
   if BufPtr<=MaxBuf then ListF.AddRec(R, ListBuf);
   With ListF do begin
       Init($FFFF, SizeOf(OneListRec));
       If Status=0 then IsOpen:=1;
       FirstFree:=Succ(LinkAdr);
       CloseFile;
   end;
   With YYDrs do begin
      for I:=1 to IndisSay do begin
          Adres:=Indis[I];
          MM:=LinkBuf[Adres];
          Dfile.GetRec(Adres, Is);
          Case Butunleme of
                1 : ListLink:=MM;
                2 : ButLink :=MM;
                3 : TekLink :=MM;
          end;
          DFile.PutRec(Adres,Is);
    end;
end;
   Case Butunleme of
	 1 : YYListStat[AktifYYInd,ActBol]:=True;
         2 : BTListStat[AktifYYInd,ActBol]:=True;
         3 : TTListStat[AktifYYInd,ActBol]:=True;
    end;
    WriteListStat;
    CloseWindow;
end;
Function    ListObj.ListeOku;
Var  I, P : Word;
     S    : String;
     U    : OneListRec;
     DoIt : Boolean;
begin
    ListeOku:=False; ReadListStat;
    S:=ListFileName;
    If not exists(S) then begin
       complain(S+' L˜STES˜ HAZIRLANMAMI');
       exit
    end;
    Case Butunleme of
     1 : DoIt:=YYListStat[AktifYYInd,ActBol];
     2 : DoIt:=BTListStat[AktifYYInd,ActBol];
     3 : DoIt:=TTListStat[AktifYYInd,ActBol];
    end;
    If Not DoIt then begin
	    COMPLAIN(S+' L˜STES˜ YEN˜DEN HAZIRLANMALI');
	    exit
    end;
    With YYDrs do begin
       Dfile.GetRec(YYDersAdr, Is);
       S:=GetIs;
       Case Butunleme of
         1 : P:=ListLink;
         2 : P:=ButLink;
         3 : P:=TekLink;
       end;
       if P = 0 then begin
	  Complain(S+' DERS˜NE KAYIT YOK');
	  exit
      end;
    end;
    ListF.Init($FFFF, SizeOf(OneListRec));
    ListF.OpenFile(ListFileName);
    Mev:=0;
    while P<>0 do begin
       ListF.GetRec(P,U); Inc(Mev);
       P:=U.Link;
       Liste[Mev]:=U.OgrAdr;
    end;
    ListF.CloseFile;
    Reverse(Liste, SizeOf(Word),1, Mev);
    With YYDrs do begin
      Mevcut[Butunleme]:=Mev;
      Dfile.PutRec(YYDersAdr, Is);
    end;
    ListeOku:=True;
end;

Procedure   ListObj.PrintListe;
Const MaxBas = 30;


Var Basilan, KK : Word;
    Sayfa       : Byte;
    SolIs, SolAd, SagIs, SagAd : String;
    SayfaBasi : Boolean;
    DonemYer : Word;
    DersAdresi:Word;
    IsaretSay:Word;
    IsaretQue:Array[1..MaxGrade] of Word;

Procedure PrintHader(Sayfa:Byte);
Var UyeInfo, DrsInfo, M, S : String;
    Mev                    : Word;
Begin
      With YYDrs do begin
	Mev:=Mevcut[Butunleme];
	Drs.DFile.GetRec(DrsAdr,Drs.Is);
	Uye.DFile.GetRec(UyeAdr, Uye.Is);
	UyeInfo:=Unvan.KodAd(Uye.UnvKd)+' '+Uye.Ad;
	DrsInfo:=Drs.GetIs;
	EraseExtra(DrsInfo);
	DrsInfo:=DrsInfo+' '+Drs.Ad;
      end;
   WriteLn(Txt,Ortala(60,UNIV));
   WriteLn(Txt,Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   WriteLn(Txt,Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI BAARI €˜ZELGES˜'));
   case Butunleme of
    1 : WriteLn(Txt, 'YARIYIL SONU SINAV TAR˜H˜ : ');
    2 : WriteLn(Txt, 'BšTšNLEME SINAV TAR˜H˜    : ');
    3 : WriteLn(Txt, '(TEKRAR)YARIYIL SONU SINAV TAR˜H˜ : ');
   end;
   WriteLn(Txt, '™¦RET˜M ELEMANI   : '+UyeInfo);
   WriteLn(Txt, 'DERS˜N KODU VE ADI: '+DrsInfo);
   STR(Mev:3,M);STR(Sayfa:2,S);
   case Butunleme of
    1 : WriteLn(Txt, 'DERS˜N MEVCUDU    : '+M+'SAYFA : '+S);
    2 : WriteLn(Txt, 'BšTšNLEME MEVCUDU : '+M+'SAYFA : '+S);
    3 : WriteLn(Txt, 'TEKRAR MEVCUDU    : '+M+'SAYFA : '+S);
   end;
   WriteLn(Txt, alt);
   WriteLn(Txt);
   WriteLn(Txt, 'NOTLAR ˜LE ˜LG˜L˜ A€IKLAMA : '+
   'DT:DEVAMSIZ  TT:TEKRAR  MZ:MAZARETL˜ MU:MUAF BS:BAARILI');
   WriteLn(Txt,ALT);
   WriteLn(Txt,TIT);
   WriteLn(Txt, AR);
   WriteLn(Txt, TITN);
   WriteLn(Txt, AR);
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   If IsaretSay = 0 then
      WriteLn(Txt,'')
   else For L:=1 to IsaretSay do
        WriteLn(Txt,
        Grad.Grade[IsaretQue[L]].Isaret+' : '+ Grad.ReadDipNot(IsaretQue[L]));
   WriteLn(Txt, ALT);
   WriteLn(Txt,'SINAVI YAPAN ™¦RET˜M ELEMANI:˜MZA :');
   WriteLn(Txt, ALT);
   writeln;
   Inc(sayfa);
   SayfaBasi:=False;IsaretSay:=0;
end;
Function AdAndMarker:String;
Var L, M : Word;CH:Char; S : String;
begin
  with ogr do begin
    S:=Ad+Spaces(25);
    AdAndMarker:=Copy(S,1,MaxAdLen-1);
    If not SearchDonem(ActYil-1, ActYY, DonemYer) then exit;
    L:=WordAra(DersAdresi,AnaKay[DonemYer], Donem[DonemYer].CNT,SizeOf(AnaRec));
    If L=0 then exit;
    M:=AnaKay[DonemYer,L].Grd;
    CH:=GRAD.Grade[M].Isaret;
    AdAndMarker:=Copy(S,1,MaxAdLen-1)+CH;
    If CH <>' ' then begin
       L:=WordAra(M,IsaretQue, IsaretSay,2);
       If L=0 then begin Inc(IsaretSay);IsaretQue[IsaretSay]:=M; end;
    end;
  end;
end;


begin
   Basilan:=0; KK:=1; Sayfa:=1; IsaretSay:=0;
   With YYDrs do begin
	DFile.GetRec(YYDersAdr, Is);
	DersAdresi:=DrsAdr;
	Mev:=Mevcut[Butunleme];
   end;
   While KK<= Mev do begin
       If Basilan=0 then PrintHader(Sayfa);
       SayfaBasi:=True;
       With Ogr do begin
	  Dfile.GetRec(Liste[KK],Is);
	  SolIs:=GetIs; SolAd:=AdAndMarker;
	  if KK<Mev then begin
	     Inc(KK); Dfile.GetRec(Liste[KK],Is);
	     SagIs:=GetIs; SagAd:=AdAndMarker;
	  end else begin
	     SagIs:=Spaces(8); SagAd:=Spaces(MaxAdLen-1);
	  end;
	end;
	Inc(Basilan);
	WriteLn(Txt,SolIs+' '+SolAd+Spaces(MaxAdlen-Length(SolAd))+
                       SagIs+' '+SagAd);
	WriteLn(Txt, Ar);
	Inc(KK);
	If Basilan=MaxBas - IsaretSay then FormFeed;
   end;
   if SayfaBasi then FormFeed;
end;
Procedure ListObj.ListeBas;
Var B : Boolean;
    I, T,  DSay, SelYer:Word;
    S:String;Tc:Char;
begin
  YYDrs.IndisInit(ActBol, Butunleme);
  Say:=IndisSay;
  Case Butunleme of
   1: S:='YARIYIL';
   2: S:='BšTšNLEME';
   3: S:='TEKRAR';
  end;
  B:=Selection(S+' L˜STE BASIMI SE€˜M',
		'6@DRSKOD@2@BL@2@GR@20@DERS˜N ADI', SelectColor);
  If Not B then exit;
  OpenEditWindow('L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@PGUP:™NCEK˜@PGDN:SONRAK˜@ESC:VAZGE€',
		  [CR, ESC,PGUPKEY,PGDNKEY],[],5,4);
  DSay:=0;
  For I:=1 to Say do
     If SelArr[I] then begin Inc(DSay); Indis[DSay]:=Indis[I] end;
  Say:=DSay;
  I:=1;
  Repeat
      YYDersAdr:=Indis[I];
      YYDrs.Dfile.GetRec(YYDersAdr, YYDrs.Is);
      Drs.Dfile.GetRec(YYDrs.DrsAdr,Drs.Is);
      S:=YYDrs.GetIsExpand;
      WriteStr(Form.FieldKol[1],1,S+' '+Drs.AD, SelectColor);
      WriteStr(Form.FieldKol[1],3,'BASILSIN MI?', CmdColor);
      If (I = Say ) then begin
         Beep;
         WriteStr(Form.FieldKol[1],2,'SE€˜LEN L˜STEN˜N SONU?', CmdColor+Blink);
      end
      else begin
         GotoXY(Form.FieldKol[1],2); ClrEol
      end;
      TC:=GetDesiRedKey([ESC, CR,PGUPKEY,PGDNKEY]);

      Case TC of
          CR     :If ListeOku then BEGIN
                     PrintListe;
                     if (I<Say) then Inc(I);
                  END;
          PGUPKEY:If I>1 then Dec(I);
          PGDNKEY:if (I<Say) then Inc(I);
      end;

  until TC = ESC;
  CloseEdit;
end;

Constructor NotEditObj.Init;
begin
   Cursor.Init;
end;
Procedure  NotEditObj.SetMevAdr(M, {Mevcut}
		       A  {YYAdr} : Word);
begin
   Mev:=M;
   YYDrsAdr:=A;
   Bas:=1;
   Ed:=1;
   Son:=(Mev + 1) Div 2;
end;
Procedure NotEditObj.GetOneOgr(Yer : Word; Var S, G : String);
  Var L : Word;
  begin
     if Yer > Mev then begin
	 S:=Spaces(Ogr.KeyL);
	 G:=Spaces(12);
	 exit
     end;
     with ogr do begin
       OgAdr:=List.Liste[Yer];
       DFile.GetRec(OgAdr,Is);
       S:=GetIs;
       YYDrNdx :=WORDARA(YYDrsAdr, YYKay[AktifYYInd], Kac[AktifYYInd], SizeOf(Word));
       GrdYer:=Ders[AktifYYInd,YYDrNdx].Grd;
       G:=GRAD.GradeLine(GrdYer);
     end;
  end;

Procedure NotEditObj.ShowLine(Yer:Word; Attr:Byte);
    Var S1, S2, G1, G2 : String;
    begin
       GetOneOgr(2*Yer-1,S1, G1);
       GetOneOgr(2*Yer,S2, G2);
       WriteStr(Form.FieldKol[1],EdRow,S1, Attr);
       WriteStr(Form.FieldKol[2],EdRow,G1, Attr);
       WriteStr(Form.FieldKol[3],EdRow,S2, Attr);
       WriteStr(Form.FieldKol[4],EdRow,G2, Attr);
    end;
    Procedure NotEditObj.GoRight;
    begin
     If Ed >= List.Mev then
	beep
     else if EdX=2 then begin
	   EdX:=1;
	   CurSorDown;
	  end
	  else EdX:=2;
    end;
    Procedure NotEditObj.GoLeft;
    begin
     If Ed = 1 then
	beep
     else if EdX=1 then begin
	   EdX:=2;
	   CursorUp;
	end
	else EdX:=1;
    end;

    Procedure NotEditObj.EditGrd(B:byte);
    Var S, G:String;TC:Char;InnerLoop:Boolean;
    begin
         Case B of
          1 :  S:='YARIYIL SONU NOT G˜R˜˜';
          2 :  S:='BšTšNLEME NOT G˜R˜˜';
          3 :  S:='TEKRAR NOT G˜R˜˜';
         end;
          OpenSplitWindow(S,
          '8@™GR. NO@12@NOT@8@™GR. NO@12@NOT',
          'INS:G˜R˜@@ESC : EXIT',
	   [INSKEY, UPKEY, DOWNKEY,LEFTKEY, RIGHTKEY,ESC],[]);
        repeat
           TC:=YYdrs.GetDrs;
           If TC=ESC then begin CloseEdit; exit end;
           List.Butunleme:=B;
           YYDrs.DFile.Getrec(YYdrs.FileAdr,YYdrs.Is);
	   List.YYDersADr:=YYDrs.FileAdr;
	   If Not List.ListeOku then
	       Complain('L˜STE OKUNAMADI')
	   else begin
              NotEditor.SetMevAdr(YYDrs.Mevcut[B],YYDrs.FileAdr);
              PrintGuys(NormalAttr);
	      InnerLoop:=False;
	      repeat
		 ShowLine(EdY,NormalAttr);
		 Ed:=2*(EdY-1)+EdX;
		 EdCol:=Form.FieldKol[2*EdX];
		 GetOneOgr(Ed, S, G);
		 Grad.ReadGrade(KD,EdCol,EdRow, GrdYer, TC);
		 if TC = Null then begin
		     Ogr.Ders[AktifYYInd,YYDrNdx].Grd:=GrdYer;
		     Ogr.DFile.PutRec(OgAdr,Ogr.Is);
		     TC:=RIGHTKEY;
		 end;
                 If TC = #253 then TC:=NULL;
		 Case TC of
		    UPKEY   : CursorUp;
		    DOWNKEY : if Ed+2 > List.Mev then
                                   beep
                                else CursorDown;
		    LEFTKEY : GoLeft;
		    RIGHTKEY: GoRight;
		    INSKEY  : begin
				InnerLoop:=True;
			      end;
                    ESC     : Begin
                                CloseEdit;
                                Exit
                              end;
		 end;
	      until InnerLoop;
	   end;
  until false
end;
procedure ChangeBol(Bol:Byte);
begin
  with Ogr do begin
    DFile.CloseFile;
    WriteNdx;
    FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
    Say:=0;
    ActBol:=Bol;
    Open;
    ReadNdx;
  end;
  ShowBolYil;
end;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Procedure EraseExtra(Var S : String);
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
	S:=YilStr(Ogr.Donem[I].YL, Ogr.Donem[I].YY)
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
       WriteLn(Txt, S);
end;
Procedure CommonHead;
begin
   WriteLn(Txt,HEAD1+HEAD3);
   WriteLn(Txt, HEAD2+HEAD4);
   WriteLn(Txt, BARA1+BARA2);
end;
Procedure BelgeHeader(Tarih, MezTar, MezUnv : String; Sayfa:Word);
Var T, S:String;
begin
   S:=Fakulte+' '+Bolum.KodAd(ActBol); Strip(S);
   WriteLn(Txt,Ortala(60,UNIV));
   WriteLn(Txt, ortala(60,S));
   WriteLn(Txt,Ortala(80,'NOT BELGES˜'));
   WriteLn(Txt,'TAR˜H : '+ Tarih);
   STr(Sayfa:2,S);
   WriteLn(Txt,'SAYFA : '+S);
   WriteLn(Txt,'™¦RENC˜ NO       : \D\C'+Ogr.GetIs);
   WriteLn(Txt,'ADI, SOYADI      : \D\C'+Ogr.GetAd);
   WriteLn(Txt,'MEZUN˜YET TAR˜H˜ : \D\C'+MezTar);
   WriteLn(Txt,'šNVANI           : \D\C'+MezUnv);
   STR(OGR.GPA:3:2,S);
   T:=GRAD.Kod(Ogr.HazNot);
   if (T='TK') or (T='NY') then
      T:=' '
   else
     T:='HAZIRLIK NOTU : '+GRAD.KodAd(Ogr.HazNot);
   WriteLn(Txt,'NOT ORTALAMASI   : \D\C'+S+
   '\C\S60'+T);
   WriteLn(Txt, alt1+alt2);
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
	 WriteLn(Txt);
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
       If BasariBas then begin
           for I:=1 to YYCount do begin
    	       K:=1;
	       While K<=Donem[I].CNT do begin
	          If not GRAD.Grade[AnaKay[I,K].Grd].Basari then begin
                     C:=Donem[I].CNT;
		     DelRec(AnaKay[I], V, K,C , SizeOf(AnaRec));
                     Donem[I].CNT:=C;
                   end else Inc(K);
	        end;
           end;
           I:=1;
           While I<=YYCount do
              if Donem[I].CNT=0 then begin
                    DelRec(Donem, U, I, YYCount, SizeOf(U));
                    Inc(YYCount);
                    DelRec(AnaKay, VV, I, YYCount, SizeOf(AnaRecType));
               end else Inc(I);
       end;
       for I:=1 to YYCount do begin
           J:=1;
            While J<=Donem[I].CNT do begin
                PrintOneBelgeLine(I, J);
	        Inc(BasilanSatir);
                Inc(J,2);
                Proceed;
            end;
            if I<YYCount then begin
               WriteLn(Txt);
               Inc(BasilanSatir);
               Proceed;
            end;
       end;
    end;
    WriteLn(Txt, BARA1+BARA2);
    For I:=1 to NotDipSay do
         WriteLn(Txt,NotDip[I]);
    WriteLn(Txt);
    WriteLn(Txt,Ortala(120,'BELGEY˜ ONAYLAYAN'));
    J:=(120 - ImzaSay*30) div (ImzaSay + 1);
    A:=''; B:=''; D:='';
    For I:=1 to ImzaSay do begin
        A:=A+Spaces(J)+Ortala(30,Imzalar[I]);
        B:=B+Spaces(J)+ConstStr('-',30);
        D:=D+Spaces(J)+Ortala(30,ImzaIsim[I]);
    end;
    WriteLn(Txt,A);
    WriteLn(Txt,B);
    WriteLn(Txt,D);
    WriteLn(Txt);
end;
procedure ShowBasariStat;
begin
       IF BasariBas then
	 WriteStr(Form.FieldKol[1],4,'BAARILI NOTLAR BASILACAK',CmdColor)
       else
	 WriteStr(Form.FieldKol[1],4,'BšTšN NOTLAR BASILACAK',CmdColor)
end;

begin
   if not Ogr.Selection('NOT BELGES˜ VER˜LECEK ™¦RENC˜LER˜ SE€˜N˜Z ',
	       '8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   OgSay:=0;
   For I:=1 to Ogr.Say do
      If SelArr[I] then begin
	 Inc(OgSay);
	 OgAdr[OgSay]:=Ogr.GetAdr(I);
      end;
   OpenEditWindow('NOT BELGES˜ D™KšMš',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI',
		 'CR:BAS@CTRL_X:BAARILI DERSLER@ESC:VAZGE€',
		  [CR, CTRL_X, ESC],[],5,6);
   BASARIBAS:=False;
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
		complain('BU ™¦RENC˜N˜N ANA KšTš¦š BO')
	     else
		LprintOgr;
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
		 'INS:G˜R˜@ESC:VAZGE€',
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
		 'F9:YETK˜L˜ ˜MZALAR@F10:D˜P NOTLAR@INS:G˜R˜@ESC:VAZGE€',
		 [f9, F10,INSKEY, ESC],[CmdBolumSec],5);
   ShowCursor;
   ClrScr;
   For I:=1 to ImzaSay do writestr(1,i+1,Imzaisim[i],textattr);
end;
begin
   Tarih:='01/01/1992';
   BASARIBAS:=False;
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
			  BelgeBas(Tarih, 'MEZUN OLMAMITIR',' ')
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
Procedure KarneBas;
Var OgSay, I, J : Word;
    OgAdr:Array[1..MaxOgr] of Word;
    TC:Char;
    KarneDon, KarneYil:Word;
    KarneYY : Byte;

Procedure PrintOneKarneLine(I, J : Word);
Var S, T, A : String;
    K    : Word;
begin
     S:='  ';
     For K:=J to J+1 do
       With Ogr do begin
          If K<=Donem[KarneDon].CNT then begin
	     A:='';
             Drs.DFile.GetRec(AnaKay[KarneDon,K].DrsPtr,Drs.Is);
             T:=Drs.GetIs;
             EraseExtra(T);
             A:=A+' '+T+' '+Drs.GetAd;
             A:=A+'  '+IntToStr(Drs.Saat,2);
	     A:=A+'  '+GRAD.BasimGradeLine(AnaKay[KarneDon,K].Grd);
             S:=S+' '+A;
          end;
       end;
       WriteLn(Txt, S);
end;
Procedure KarneBaslik;
Var S:String;
begin
   S:=Fakulte+' '+Bolum.KodAd(ActBol);
   WriteLn(Txt,Ortala(60,UNIV));
   WriteLn(Txt,Ortala(60,S));
   WriteLn(Txt,Ortala(120,YilStr(KarneYil,KarneYY)+' YARIYILI ™¦RENC˜ KARNES˜'));
   STR(OGR.YYGPA(KarneDon):3:2,S);
   WriteLn(Txt,'™¦RENC˜ :'+Ogr.GetIs+' '+Ogr.GetAd+
       '  YARIYIL NOT ORTALAMASI   : '+S);
   WriteLn(Txt,''+ ALT2+ALT2);
   WriteLn(Txt,'  '+ HEAD3+HEAD3);
   WriteLn(Txt,'  '+ HEAD4+HEAD4);
   WriteLn(Txt,'  '+ BARA2+BARA2);
   BasilanSatir:=BasilanSatir+8;
end;
procedure LPrintOgr;
Var I, J : Word;
begin
   KarneBaslik;
   J:=1;
   While J<=Ogr.Donem[KarneDon].CNT do begin
       PrintOneKarneLine(I, J);
       Inc(BasilanSatir);
       Inc(J,2);
   end;
end;
Procedure LPrintKarne;
Var T  : Word;
begin
  T:=Ogr.Donem[KarneDon].CNT;
  If T = 0 then
     complain('BU ™¦RENC˜N˜N KAYIDI BO')
  else begin
     If BasilanSatir + 10  + ((T+1) div 2) > MxLine then begin
        BasilanSatir:=0;
	WriteLn(Txt);
     end;
     LprintOgr
  end;
  WriteLn(Txt,'');WriteLn(Txt,'');Inc(BasilanSatir,2);
end;
begin
   if not Ogr.Selection('KARNES˜ VER˜LECEK ™GRENC˜LER˜ SE€˜N˜Z ',
	       '8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   OgSay:=0; BasilanSatir:=0;
   For I:=1 to Ogr.Say do
      If SelArr[I] then begin
	 Inc(OgSay);
	 OgAdr[OgSay]:=Ogr.GetAdr(I);
      end;
   IF (OgSay = 0) then exit;
   KarneYil:=ActYil; KarneYY:=ActYY;
   if  NOT YeniDonemGir(KarneYil,KarneYY,'KARNE D™NEM˜') then exit;
   OpenEditWindow('KARNE D™KšMš',
		 '8@™GR. NO@25@™¦RENC˜N˜N ADI',
		 'CR:BAS@PGDN:SONRAK˜@ESC:VAZGE€',
		  [CR, ESC,PGDNKEY],[],5,4);
   For I:=1 to OgSay do begin
       Ogr.DFile.GetRec(Ogadr[I],Ogr.Is);
       WriteStr(Form.FieldKol[1],1,Ogr.Getis+' '+Ogr.GetAd,SelectColor);
       WriteStr(Form.FieldKol[1],3,'BASILSINMI?',CmdColor);
       TC:=GetDesiredKey([ESC,CR,PGDNKEY,F9]);
       Case TC of
          CR: if Ogr.SearchDonem(KarneYil, KarneYY, KarneDon) then
                   LPrintKarne
                else
                   complain('BU ™GRENC˜N˜N ANA KšTš¦šNDE B™YLE B˜R D™NEM YOK');
	  ESC: begin
		   CloseEdit;
		   If BasilanSatir<>0 then WriteLn(Txt);
		   Exit
		end;
          PGDNKEY:
       end;
    end;
    CloseEdit;
    If BasilanSatir<>0 then WriteLn(Txt);
end;

Procedure ListObj.YoklaBas;
Var B : Boolean;
    I, T,  DSay, SelYer:Word;
    S:String;Tc:Char;
begin
  YYDrs.IndisInit(ActBol, 1);
  Say:=IndisSay;
  B:=Selection('YOKLAMA L˜STE BASIMI SE€˜M',
		'6@DRSKOD@2@BL@2@GR@20@DERS˜N ADI', SelectColor);
  If Not B then exit;
  OpenEditWindow('YOKLAMA L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@PGUP:™NCEK˜@PGDN:SONRAK˜@ESC:VAZGE€',
		  [CR, ESC,PGUPKEY,PGDNKEY],[],5,4);
  DSay:=0;
  For I:=1 to Say do
     If SelArr[I] then begin Inc(DSay); Indis[DSay]:=Indis[I] end;
  Say:=DSay;
  I:=1;
  Repeat
      YYDersAdr:=Indis[I];
      YYDrs.Dfile.GetRec(YYDersAdr, YYDrs.Is);
      Drs.Dfile.GetRec(YYDrs.DrsAdr,Drs.Is);
      S:=YYDrs.GetIsExpand;
      WriteStr(Form.FieldKol[1],1,S+' '+Drs.AD, SelectColor);
      WriteStr(Form.FieldKol[1],3,'BASILSIN MI?', CmdColor);
      If (I = Say ) then begin
	 Beep;
	 WriteStr(Form.FieldKol[1],2,'SE€˜LEN L˜STEN˜N SONU?', CmdColor+Blink);
      end
      else begin
	 GotoXY(Form.FieldKol[1],2); ClrEol
      end;
      TC:=GetDesiRedKey([ESC, CR,PGUPKEY,PGDNKEY]);

      Case TC of
	  CR     :If ListeOku then BEGIN
		     YoklaPrintListe;
		     if (I<Say) then Inc(I);
		  END;
	  PGUPKEY:If I>1 then Dec(I);
	  PGDNKEY:if (I<Say) then Inc(I);
      end;
  until TC = ESC;
  CloseEdit;
end;

Procedure   ListObj.YoklaPrintListe;

Const MaxBas = 49;
      Under    = ESC+'-'+#1;
      CanUnder = ESC+'-'+#0;
Var Basilan, KK : Word;
    Sayfa       : Byte;
    SolIs, SolAd: String;
    SayfaBasi : Boolean;
    DonemYer : Word;
    DersAdresi:Word;
    s : sTRING;

Procedure PrintHader(Sayfa:Byte);
Var UyeInfo, DrsInfo, M, S : String;
    Mev                    : Word;
Begin
      With YYDrs do begin
	Mev:=Mevcut[1];
	Drs.DFile.GetRec(DrsAdr,Drs.Is);
	Uye.DFile.GetRec(UyeAdr, Uye.Is);
	UyeInfo:=Unvan.KodAd(Uye.UnvKd)+' '+Uye.Ad;
	DrsInfo:=Drs.GetIs;
	EraseExtra(DrsInfo);
	DrsInfo:=DrsInfo+' '+Drs.Ad;
      end;
   WriteLn(Txt,Ortala(60,UNIV));
   WriteLn(Txt,Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   WriteLn(Txt,Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI YOKLAMA €˜ZELGES˜'));
   WriteLn(Txt,'™¦RET˜M ELEMANI   : \D\C'+UyeInfo);
   WriteLn(Txt, 'DERS˜N KODU VE ADI: \D\C'+DrsInfo);
   STR(Mev:3,M);STR(Sayfa:2,S);
   WriteLn(Txt, 'DERS˜N MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
   WriteLn(Txt,''+ YOKLAUST);
   WriteLn(Txt,''+ YOKLABS);
   WriteLn(Txt,''+ YOKLAARA);
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   WriteLn(Txt,''+ YOKLAALT);
   WriteLn(Txt,''+'SINAVI YAPAN ™¦RET˜M ELEMANI:\C\S55˜MZA :');
   Inc(sayfa);
   SayfaBasi:=False;
end;
begin
   Basilan:=0;
   KK:=1;
   Sayfa:=1;
   With YYDrs do begin
	DFile.GetRec(YYDersAdr, Is);
	DersAdresi:=DrsAdr;
	Mev:=Mevcut[1];
   end;
   While KK<= Mev do begin
       If Basilan=0 then PrintHader(Sayfa);
       SayfaBasi:=True;
       With Ogr do begin
	  Dfile.GetRec(Liste[KK],Is);
	  SolIs:=GetIs; SolAd:=GetAd;
          Inc(Basilan);
	  S:= '³'+IntToStr(KK,3)+'³'+SolIs+'³'+SolAD;
          S:=S+'³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³     ³     ³     ³     ³     ³     ³     ³';
          S:=#15+'    '+ Under+S+CanUnder+#18#13#10;
	  LPT.WritePrt(S);
          Inc(KK);
	  If Basilan=MaxBas then FormFeed;
       end;
   END;
   if SayfaBasi then FormFeed;
end;
begin
  List.Init;
  NotEditor.Init;
  ReadImzalar;
  FillChar(NotDip, SizeOf(NotDip),#0);
  NotDipSay:=0;
end.



