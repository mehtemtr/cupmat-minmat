unit ListBsz;
interface
uses Crt, Win, UOg, UIndex, BLUNGR, Exist, GenUtil, DFile, UPrt;

Const  MaxBuf    = MaxOgr;
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
  HEAD2='    YARIYIL     KODU          DERS˜N ADI       KRED˜      NOTU   ';
  BARA1=' ------------- ------ ------------------------- ---- ------------';
  ALT1 =' ----------------------------------------------------------------';
  ALT2 =' ---------------------------------------------------';
  HEAD3='  DERS˜N                         HAFTALIK   BAžARI  ';
  HEAD4='   KODU          DERS˜N ADI       KRED˜      NOTU   ';
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


Var List         : ^ListObj;
    NotEditor    : ^NotEditObj;
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
   YYDRS^.DFile.GetRec(Indis[Yer],YYDRS^.Is);
   DRS^.DFile.GetRec(YYDRS^.DrsAdr,DRS^.Is);
   S:=YYDRS^.GetIsExpand+' '+DRS^.Ad;
   WriteStr(Form.FieldKol[1],EdRow,S, Attr)
end;

Function  ListObj.Search(S:String; Var Yer, Adr : Word):Boolean;
Var B : Boolean;
    K : Word;
begin
    B:=YYDRS^.Search(S+Chr(ActBol+64),Yer, Adr);
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
    With YYDRS^ do begin
       IndisInit(ActBol, 1);
       If IndisSay = 0 then begin
	  Complain(Bolum.KodAd(ActBol)+' DERS A€ILMAMIž');
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
    For I:=1 to OGR^.Say do begin
       Adres:=OGR^.GetADr(I);
       OGR^.DFile.GetRec(Adres,OGR^.Is);
       For J:=1 to OGR^.Kac[AktifYYInd] do begin
	   If BufPtr = MaxBuf then begin
	      ListF.AddRec(R, ListBuf);
	      BufPtr:=0;
	      FillChar(ListBuf, SizeOf(ListBuf),#0)
	   end;
           If (Butunleme=1) or
              ( (Butunleme =2) and  (OGR^.Ders[AktifYYInd,J].Grd = 102) ) or
              ( (Butunleme =3) and not (GRAD.Grade[Ogr^.Ders[AktifYYInd,J].Grd].Basari) )
              then begin
  	      inc(LinkAdr);inc(BufPtr);
              With ListBuf[BufPtr] do begin
		  Link:=LinkBuf[OGR^.YYKay[AktifYYInd,J]];
		  LinkBuf[OGR^.YYKay[AktifYYInd,J]]:=LinkAdr;
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
   With YYDRS^ do begin
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
       complain(S+' L˜STES˜ HAZIRLANMAMIž');
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
    With YYDRS^ do begin
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
    With YYDRS^ do begin
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
      With YYDRS^ do begin
	Mev:=Mevcut[Butunleme];
	DRS^.DFile.GetRec(DrsAdr,DRS^.Is);
	UYE^.DFile.GetRec(UyeAdr, UYE^.Is);
	UyeInfo:=Unvan.KodAd(UYE^.UnvKd)+' '+UYE^.Ad;
	DrsInfo:=DRS^.GetIs;
	EraseExtra(DrsInfo);
	DrsInfo:=DrsInfo+' '+DRS^.Ad;
      end;
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI BAžARI €˜ZELGES˜'));
   case Butunleme of
    1 : LPT.WriteLnPrt( '\C\S75YARIYIL SONU SINAV TAR˜H˜ : ');
    2 : LPT.WriteLnPrt( '\C\S75BšTšNLEME SINAV TAR˜H˜    : ');
    3 : LPT.WriteLnPrt( '\C\S68(TEKRAR)YARIYIL SONU SINAV TAR˜H˜ : ');
   end;
   LPT.WriteLnPrt( '\C\S5™¦RET˜M ELEMANI   : \D\C'+UyeInfo);
   LPT.WriteLnPrt( '\C\S5DERS˜N KODU VE ADI: \D\C'+DrsInfo);
   STR(Mev:3,M);STR(Sayfa:2,S);
   case Butunleme of
    1 : LPT.WriteLnPrt( '\C\S5DERS˜N MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
    2 : LPT.WriteLnPrt( '\C\S5BšTšNLEME MEVCUDU : '+M+'\C\S80SAYFA : '+S);
    3 : LPT.WriteLnPrt( '\C\S5TEKRAR MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
   end;
   LPT.WriteLnPrt('\C'+ alt);
   LPT.WriteLnPrt(ESC+'0');
   LPT.WriteLnPrt( ESC+'4\C\DNOTLAR ˜LE ˜LG˜L˜ A€IKLAMA : \C '+
   'DT:DEVAMSIZ  TT:TEKRAR  MZ:MAZARETL˜ MU:MUAF BS:BAžARILI'+ESC+'5');
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\C'+TIT);
   LPT.WriteLnPrt('\C'+ AR);
   LPT.WriteLnPrt('\C'+ TITN);
   LPT.WriteLnPrt('\C'+ AR);
end;
Procedure FormFeed;
Var L : Word; S : String;
begin
   Basilan:=0;
   If IsaretSay = 0 then
      lpt.WriteLnPrt('')
   else for L:=1 to IsaretSay do begin
        if IsaretQue[L]=$FFFF then
           S:='** : MEZUN˜YET ˜€˜N BEž VEYA DAHA AZ DERS˜ KALAN ™¦RENC˜LER'
        else if IsaretQue[L]<>0 then
           S:=Grad.Grade[IsaretQue[L]].Isaret+' : '+ Grad.ReadDipNot(IsaretQue[L]);
        LPT.WriteLnPrt('\C'+S);
        end;
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\C'+'SINAVI YAPAN ™¦RET˜M ELEMANI:\C\S55˜MZA :');
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\F '+ESC+'2');
   Inc(sayfa);
   SayfaBasi:=False;IsaretSay:=0;
end;
Function AdAndMarker:String;
Var K, L, M, Ilk : Word;
    CH:Char; S : String;
    B:Boolean;


begin
  CH:=' ';
  with OGR^ do begin
    S:=Ad+Spaces(25);
    AdAndMarker:=Copy(S,1,MaxAdLen-1);
    if (YKK and $FF = $FF) then begin
        AdAndMarker:=Copy(S,1,MaxAdLen-2)+'**';
        CH:=#255;
        M:=$FFFF;
    end else begin
         Ilk:=ActYil-1;
         B:=SearchDonem(Ilk, ActYY, DonemYer);
         While B do begin
               L:=WordAra(DersAdresi,AnaKay[DonemYer], Donem[DonemYer].CNT,SizeOf(AnaRec));
               If L=0 then begin
                     Dec(Ilk);
                     B:=SearchDonem(Ilk, ActYY, DonemYer);
               end else begin
                  M:=AnaKay[DonemYer, L].Grd;
                  B:=False;
                  if not GRAD.Grade[M].Basari then begin
                     CH:=GRAD.Grade[M].Isaret;
                     AdAndMarker:=Copy(S,1,MaxAdLen-1)+CH;
                  end;
               end;
         end;
     end;
    If CH <>' ' then begin
       L:=WordAra(M, IsaretQue, IsaretSay, 2);
       If L=0 then begin Inc(IsaretSay);IsaretQue[IsaretSay]:=M; end;
    end;
  end;
end;


begin
   Basilan:=0; KK:=1; Sayfa:=1; IsaretSay:=0;
   With YYDRS^ do begin
	DFile.GetRec(YYDersAdr, Is);
	DersAdresi:=DrsAdr;
	Mev:=Mevcut[Butunleme];
   end;
   While KK<= Mev do begin
       If Basilan=0 then PrintHader(Sayfa);
       SayfaBasi:=True;
       With OGR^ do begin
	  Dfile.GetRec(Liste[KK],Is);
	  SolIs:=GetIs; SolAd:=AdAndMarker;
	  if KK<Mev then begin
	     Inc(KK); Dfile.GetRec(Liste[KK],Is);
	     SagIs:=GetIs; SagAd:=AdAndMarker;
	  end else begin
	     SagIs:=Spaces(8); SagAd:=Spaces(MaxAdLen);
	  end;
	end;
	Inc(Basilan);
	LPT.WriteLnPrt('\C '+SolIs+' '+SolAd+Spaces(MaxAdlen-Length(SolAd))+
                       '\C\S25 '+SagIs+' '+SagAd);
	LPT.WriteLnPrt('\C'+ Ar);
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
  YYDRS^.IndisInit(ActBol, Butunleme);
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
      YYDRS^.Dfile.GetRec(YYDersAdr, YYDRS^.Is);
      DRS^.Dfile.GetRec(YYDRS^.DrsAdr,DRS^.Is);
      S:=YYDRS^.GetIsExpand;
      WriteStr(Form.FieldKol[1],1,S+' '+DRS^.AD, SelectColor);
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
	 S:=Spaces(OGR^.KeyL);
	 G:=Spaces(12);
	 exit
     end;
     with OGR^ do begin
       OgAdr:=List^.Liste[Yer];
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
     If Ed >= List^.Mev then
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
          1 :  S:='YARIYIL SONU NOT G˜R˜ž˜';
          2 :  S:='BšTšNLEME NOT G˜R˜ž˜';
          3 :  S:='TEKRAR NOT G˜R˜ž˜';
         end;
          OpenSplitWindow(S,
          '8@™GR. NO@12@NOT@8@™GR. NO@12@NOT',
          'INS:G˜R˜ž@@ESC : EXIT',
	   [INSKEY, UPKEY, DOWNKEY,LEFTKEY, RIGHTKEY,ESC],[]);
        repeat
           TC:=YYDRS^.GetDrs;
           If TC=ESC then begin CloseEdit; exit end;
           List^.Butunleme:=B;
           YYDRS^.DFile.Getrec(YYDRS^.FileAdr,YYDRS^.Is);
	   List^.YYDersADr:=YYDRS^.FileAdr;
	   If Not List^.ListeOku then
	       Complain('L˜STE OKUNAMADI')
	   else begin
              NotEditor^.SetMevAdr(YYDRS^.Mevcut[B],YYDRS^.FileAdr);
              PrintGuys(NormalAttr);
	      InnerLoop:=False;
	      repeat
		 ShowLine(EdY,NormalAttr);
		 Ed:=2*(EdY-1)+EdX;
		 EdCol:=Form.FieldKol[2*EdX];
		 GetOneOgr(Ed, S, G);
		 Grad.ReadGrade(KD,EdCol,EdRow, GrdYer, TC);
		 if TC = Null then begin
		     OGR^.Ders[AktifYYInd,YYDrNdx].Grd:=GrdYer;
		     OGR^.DFile.PutRec(OgAdr,OGR^.Is);
		     TC:=RIGHTKEY;
		 end;
                 If TC = #253 then TC:=NULL;
		 Case TC of
		    UPKEY   : CursorUp;
		    DOWNKEY : if Ed+2 > List^.Mev then
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
  with OGR^ do begin
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
    NotS : String;

Function AnyLeft : Boolean;
Var I,J : Word;
begin
   AnyLeft:=True;
   With OGR^ do begin
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
	S:=YilStr(OGR^.Donem[I].YL, OGR^.Donem[I].YY)
     else
	S:=Spaces(13);
     For K:=J to J+1 do
       With OGR^ do begin
          If K<=Donem[I].CNT then begin
	     A:='';
	     DRS^.DFile.GetRec(AnaKay[I,K].DrsPtr,DRS^.Is);
	     Basildi[I,K]:=True;
             T:=DRS^.GetIs;
             EraseExtra(T);
             A:=A+' '+T+' '+DRS^.GetAd;
             A:=A+' '+RealToStr(DRS^.Kredi,4,1);
	     A:=A+' '+GRAD.BasimGradeLine(AnaKay[I,K].Grd);
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
Var T, NotS,  S:String;
begin
   S:=Fakulte+' '+Bolum.KodAd(ActBol); Strip(S);
   LPT.WriteLnPrt('\C\E'+ Ortala(60,UNIV));
   LPT.WriteLnPrt('\C\E'+ ortala(60,S));
   LPT.WriteLnPrt(Ortala(60,'NOT BELGES˜'));
   STr(Sayfa:2,S);
   LPT.WriteLnPrt( '\C\S89TAR˜H : '+ Tarih);
   LPT.WriteLnPrt('\C\S89SAYFA : '+S);
   LPT.WriteLnPrt('\C\S4™¦RENC˜ NO       : \D\C'+OGR^.GetIs);

   S:=OGR^.GetAd; S:=S+Spaces(25); S:=Copy(S,1,25);
   S:='\C\S4ADI, SOYADI      : \D\C'+S;
   S:=S+Spaces(59); S:=Copy(S,1,59);
   NotS:='HARF NOTLARININ A¦IRLIKLARI VE SAYISAL KARžILIKLARI:';
   LPT.WriteLnPrt(S+'\C'+NotS);

   S:='\C\S4MEZUN˜YET TAR˜H˜ : \D\C'+MezTar;
   S:=S+Spaces(59); S:=Copy(S,1,59);
   NotS:='AA 4.00 (90-100),BA 3.50 (85-89), BB 3.00 (80-84), CB 2.50 (75-79),';
   LPT.WriteLnPrt(S+'\C'+NotS);

   S:='\C\S4šNVANI           : \D\C'+MezUnv;
   S:=S+Spaces(59); S:=Copy(S,1,59);
   NotS:='CC 2.00 (70-74), DC 1.50 (60-69), DD 1.00 (50-59), FF 0.00 (00-49),';
   LPT.WriteLnPrt(S+'\C'+NotS);

   STR(OGR^.GPA:3:2,S);
   S:='\C\S4NOT ORTALAMASI   : \D\C'+S;
   S:=S+Spaces(59); S:=Copy(S,1,59);
   NotS:='NA DEVAMSIZ, S YETERL˜, U YETERS˜Z';
   LPT.WriteLnPrt(S+'\C'+NotS);

   T:=GRAD.Kod(OGR^.HazNot);
   if not ( (T='TK') or (T='NY')) then begin
      T:='\C\S4HAZIRLIK NOTU    : \D\C'+GRAD.KodAd(OGR^.HazNot);
      LPT.WriteLnPrt(T);
   end;
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
	 BasilanSatir:=6+NotDipSay;
      end;
end;
begin
   Sayfa:=1;
   BelgeHeader(Tarih, MezTar, MezUnv ,Sayfa);
   BasilanSatir:=6+NotDipSay;
   FillChar(Basildi, SizeOf(Basildi),#0);
   with OGR^ do begin
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
               LPT.WriteLnPrt('\L');
               Inc(BasilanSatir);
               Proceed;
            end;
       end;
    end;
    LPT.WriteLnPrt('\C'+ BARA1+BARA2);
    NotS:=Copy(OGR^.GetIs,1,2);
    If NotS<='95' then begin
       NotS:='\C'+'€.š. Y™NET˜M KURULUNUN 26.01.1997 TAR˜HL˜ KARARI ˜LE 95 VE DAHA ™NCE G˜R˜žL˜ ';
       NotS:=NotS+'™¦RENC˜LER˜N ORTALAMALARI, SAYISAL NOTLAR';
       LPT.WriteLnPrt(NotS);
       NotS:='\C'+'60-67 CC, 68-75 CB, 76-83 BB, 84-89 BA, 90-100 AA  SKALASINA  UYGUN  OLARAK  ';
       NotS:=NotS+'HARF NOTLARINA  €EVR˜LEREK HESAPLANMIžTIR';
       LPT.WriteLnPrt(NotS);
    end;
    LPT.WriteLnPrt('\C'+'  ');
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
	 WriteStr(Form.FieldKol[1],4,'BšTšN NOTLAR BASILACAK',CmdColor)
end;

begin
   if not OGR^.Selection('NOT BELGES˜ VER˜LECEK ™¦RENC˜LER˜ SE€˜N˜Z ',
	       '8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   OgSay:=0;
   For I:=1 to OGR^.Say do
      If SelArr[I] then begin
	 Inc(OgSay);
	 OgAdr[OgSay]:=OGR^.GetAdr(I);
      end;
   OpenEditWindow('NOT BELGES˜ D™KšMš',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI',
		 'CR:BAS@CTRL_X:BAžARILI DERSLER@ESC:VAZGE€',
		  [CR, CTRL_X, ESC],[],5,6);
   BASARIBAS:=False;
   I:=1;
   While I<= OgSay do begin
       OGR^.DFile.GetRec(Ogadr[I],OGR^.Is);
       WriteStr(Form.FieldKol[1],1,OGR^.Getis+' '+OGR^.GetAd,SelectColor);
       WriteStr(Form.FieldKol[1],2,'BASILSINMI?',CmdColor);
       ShowBasariStat;
       TC:=GetDesiredKey([ESC,CTRL_X,CR]);
       Case TC of
       CR: begin
	     If OGR^.YYCount = 0 then
		complain('BU ™¦RENC˜N˜N ANA KšTš¦š BOž')
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
       With OGR^ do begin
          If K<=Donem[KarneDon].CNT then begin
	     A:='';
             DRS^.DFile.GetRec(AnaKay[KarneDon,K].DrsPtr,DRS^.Is);
             T:=DRS^.GetIs;
             EraseExtra(T);
             A:=A+' '+T+' '+DRS^.GetAd;
             A:=A+' '+RealToStr(DRS^.Kredi,4,1);
	     A:=A+' '+GRAD.BasimGradeLine(AnaKay[KarneDon,K].Grd);
             S:=S+' '+A;
          end;
       end;
       LPT.WriteLnPrt('\C'+ S);
end;
Procedure KarneBaslik;
Var S:String;
begin
   S:=Fakulte+' '+Bolum.KodAd(ActBol);
   LPT.WriteLnPrt('\C\E'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\C\E'+Ortala(60,S));
   LPT.WriteLnPrt('\C'+Ortala(120,YilStr(KarneYil,KarneYY)+' YARIYILI ™¦RENC˜ KARNES˜'));
   STR(OGR^.YYGPA(KarneDon):3:2,S);
   LPT.WriteLnPrt('\C\S4™¦RENC˜ :\C\D'+OGR^.GetIs+' '+OGR^.GetAd+
       '\C\S24  YARIYIL NOT ORTALAMASI   : \C\D'+S);
   LPT.WriteLnPrt('\C'+ ALT2+ALT2);
   LPT.WriteLnPrt('\C  '+ HEAD3+HEAD3);
   LPT.WriteLnPrt('\C  '+ HEAD4+HEAD4);
   LPT.WriteLnPrt('\C  '+ BARA2+BARA2);
   BasilanSatir:=BasilanSatir+8;
end;
procedure LPrintOgr;
Var I, J : Word;
begin
   KarneBaslik;
   J:=1;
   While J<=OGR^.Donem[KarneDon].CNT do begin
       PrintOneKarneLine(I, J);
       Inc(BasilanSatir);
       Inc(J,2);
   end;
end;
Procedure LPrintKarne;
Var T  : Word;
begin
  T:=OGR^.Donem[KarneDon].CNT;
  If T = 0 then
     complain('BU ™¦RENC˜N˜N KAYIDI BOž')
  else begin
     If BasilanSatir + 10  + ((T+1) div 2) > MxLine then begin
        BasilanSatir:=0;
	LPT.WriteLnPrt('\F');
     end;
     LprintOgr
  end;
  lpt.WriteLnPrt('');lpt.WriteLnPrt('');Inc(BasilanSatir,2);
end;
begin
   if not OGR^.Selection('KARNES˜ VER˜LECEK ™GRENC˜LER˜ SE€˜N˜Z ',
	       '8@™GR.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
   OgSay:=0; BasilanSatir:=0;
   For I:=1 to OGR^.Say do
      If SelArr[I] then begin
	 Inc(OgSay);
	 OgAdr[OgSay]:=OGR^.GetAdr(I);
      end;
   IF (OgSay = 0) then exit;
   KarneYil:=ActYil; KarneYY:=ActYY;
   if  NOT YeniDonemGir(KarneYil,KarneYY,'KARNE D™NEM˜') then exit;
   OpenEditWindow('KARNE D™KšMš',
		 '8@™GR. NO@25@™¦RENC˜N˜N ADI',
		 'CR:BAS@PGDN:SONRAK˜@ESC:VAZGE€',
		  [CR, ESC,PGDNKEY],[],5,4);
   For I:=1 to OgSay do begin
       OGR^.DFile.GetRec(Ogadr[I],OGR^.Is);
       WriteStr(Form.FieldKol[1],1,OGR^.Getis+' '+OGR^.GetAd,SelectColor);
       WriteStr(Form.FieldKol[1],3,'BASILSINMI?',CmdColor);
       TC:=GetDesiredKey([ESC,CR,PGDNKEY,F9]);
       Case TC of
          CR: if OGR^.SearchDonem(KarneYil, KarneYY, KarneDon) then
                   LPrintKarne
                else
                   complain('BU ™GRENC˜N˜N ANA KšTš¦šNDE B™YLE B˜R D™NEM YOK');
	  ESC: begin
		   CloseEdit;
		   If BasilanSatir<>0 then LPT.WriteLnPrt('\F');
		   Exit
		end;
          PGDNKEY:
       end;
    end;
    CloseEdit;
    If BasilanSatir<>0 then LPT.WriteLnPrt('\F');
end;

Procedure ListObj.YoklaBas;
Var B : Boolean;
    I, T,  DSay, SelYer:Word;
    S:String;Tc:Char;
begin
  YYDRS^.IndisInit(ActBol, 1);
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
      YYDRS^.Dfile.GetRec(YYDersAdr, YYDRS^.Is);
      DRS^.Dfile.GetRec(YYDRS^.DrsAdr,DRS^.Is);
      S:=YYDRS^.GetIsExpand;
      WriteStr(Form.FieldKol[1],1,S+' '+DRS^.AD, SelectColor);
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
      With YYDRS^ do begin
	Mev:=Mevcut[1];
	DRS^.DFile.GetRec(DrsAdr,DRS^.Is);
	UYE^.DFile.GetRec(UyeAdr, UYE^.Is);
	UyeInfo:=Unvan.KodAd(UYE^.UnvKd)+' '+UYE^.Ad;
	DrsInfo:=DRS^.GetIs;
	EraseExtra(DrsInfo);
	DrsInfo:=DrsInfo+' '+DRS^.Ad;
      end;
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI YOKLAMA €˜ZELGES˜'));
   LPT.WriteLnPrt( '\C\S5™¦RET˜M ELEMANI   : \D\C'+UyeInfo);
   LPT.WriteLnPrt( '\C\S5DERS˜N KODU VE ADI: \D\C'+DrsInfo);
   STR(Mev:3,M);STR(Sayfa:2,S);
   LPT.WriteLnPrt( '\C\S5DERS˜N MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
   LPT.WriteLnPrt('\C\S4'+ YOKLAUST);
   LPT.WriteLnPrt('\C\S4'+ YOKLABS);
   LPT.WriteLnPrt('\C\S4'+ YOKLAARA);
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   LPT.WriteLnPrt('\C\S4'+ YOKLAALT);
   LPT.WriteLnPrt('\C\S4'+'SINAVI YAPAN ™¦RET˜M ELEMANI:\C\S55˜MZA :');
   LPT.WriteLnPrt('\F '+ESC+'2');
   Inc(sayfa);
   SayfaBasi:=False;
end;
begin
   Basilan:=0;
   KK:=1;
   Sayfa:=1;
   With YYDRS^ do begin
	DFile.GetRec(YYDersAdr, Is);
	DersAdresi:=DrsAdr;
	Mev:=Mevcut[1];
   end;
   While KK<= Mev do begin
       If Basilan=0 then PrintHader(Sayfa);
       SayfaBasi:=True;
       With OGR^ do begin
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
  New(List, Init);
  New(NotEditor,Init);
  ReadImzalar;
  FillChar(NotDip, SizeOf(NotDip),#0);
  NotDipSay:=0;
end.

