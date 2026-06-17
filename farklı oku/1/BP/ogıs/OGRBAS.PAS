
unit OgrBas;
interface
uses win, crt, Uprt, uindex, Dfile, UOg, BlUnGr, UList, Basim;
Const
 MaxSatir=50;
 MaxBilgi = 17;
 ToplamBilgi =8;
 BasUnite = 1;
 Yazici=2;
 Disket=3;
 BasimSekil = 4;
 HNotBas  = 5;
 KodBas   = 6;
 SoyBas   = 7;
 OrtBas   = 8;
 BasilacakBilgi=9;
 OgrNo    =  10;
 OgrAd    =  11;
 OgrCins  = 12;
 OgrDogYER = 13;
 OgrDogTar =14;
 OgrHazNot =15;
 HazBsYL   =16;
 OgrOrt    =17;
 BilgiTit:Array[1..ToplamBilgi] of String[13]=
		 ('™¦RENC˜ NO',
		  'ADI, SOYADI',
		  'C˜NS˜YET˜',
		  'DO¦UM YER˜',
		  'DO¦UM TAR˜H˜',
		  'HAZIRLIK NOT',
		  'HZ.BAžARI YILI',
		  'NOT ORTALAMA');
 BilgiLen:Array[1..ToplamBilgi] of Byte=
		 ( 8,
                  25,
                   1,
		  15,
		  10,
		  13,
		   4,
		   6);
 BasimBilgi:Array[1..MaxBilgi] of String[27]=
      ('BASIM šN˜TES˜',
		 'YAZICI',
		 'D˜SKET',
       'BASIM žEKL˜',
		 'HAZ.NOTU VEYA BAžARI YILI ',
		 '™¦RENC˜ KODUNA  G™RE BASIM',
		 'SOYADI SIRASINA G™RE BASIM',
                 'NOT  ORTALAMAYA G™RE BASIM',
       'BASILACAK B˜G˜LER',
		 '™¦RENC˜ NO',
		 'ADI, SOYADI',
		 'C˜NS˜YET˜',
		 'DO¦UM YER˜',
		 'DO¦UM TAR˜H˜',
		 'HAZIRLIK NOTU',
		 'HAZ.BAžARI YILI',
		 'GENEL NOT ORTALAMASI');
 Type BasimTuru = Object
	EdRow     : Byte;
	Condensed : Boolean;
        YaziciBas : Boolean;
        BasimTuru : Byte;
        Bilgiler  : Array[1..MaxBilgi] of Boolean;
        SelAr     : Array[1..MaxBilgi] of Boolean;
        Procedure Init;
        Procedure ShowLine(Y, Attr:Byte);
	Procedure Show(Attr:Byte);
        Procedure GoUp;
        Procedure GoDown;
	Function  Selection(Attr : Byte):Boolean;
	procedure PrepHeader;
 end;
 Type SlctOgrObj = Object(Select)
	SoyaGore    : Boolean;
        KrediyeGore : Boolean;
	Constructor Init;
	Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
	Function    Search(S:String; Var Yer, Adr : Word):Boolean;Virtual;
        Function    Selection(Title, EdT : String; Attr : Byte): Boolean; virtual;


     end;

    Procedure OgrenciBasim;
Var
    OgrHead1,OgrHead2 : String;
    BasTur : BasimTuru;
    BilgiSp: Array[1..ToplamBilgi] of Byte;
    BilgiBuf: Array[1..ToplamBilgi] Of String[25];
    SlctOgr   : SlctOgrObj;


implementation
Function BasSonSelect:Char;
 Var Adres, Yer1, Yer2, I : Word;
      TC        : Char;
      B1, B2   : Boolean;
      Var OldS, NewS, Sinif : String;
  begin
       BasSonSelect:=' ';
       IndisSay:=0;
       OpenEditWindow('BAžLANGI€ VE B˜T˜ž ™¦RENC˜ NUMARALARI',
	      Chr(48+OgrKeyL)+'@BAžLANGI€@'+CHR(48+OgrKeyL)+'@B˜T˜ž@1@™¦RENC˜LER˜N SINIFI',
	      'END : G˜R˜ž TAMAM@ESC:VAZGE€', [ESC, ENDKEY], [], 13, 1);
       ClrScr;
       OldS:='';
       NewS:='';
       Sinif:='';
       repeat
	 InputStr(OldS,Form.FieldKol[1],1,OgrKeyL,True, AllKar, 0, TC);
	  if TC = NULL then
	     InputStr(NewS,Form.FieldKol[2],1,OgrKeyL,True, AllKar, 0, TC);
	  if TC = NULL then
	     InputStr(Sinif,Form.FieldKol[3],1,1,True,['1','2','3','4'], 0, TC);
       until TC in [ESC, ENDKEY];
       if TC=ESC then begin
	  BasSonSelect:=#255;
          CloseEdit;
          exit
       end else begin
           B1:=OGR^.Search(OldS,Yer1, Adres);
           B2:=OGR^.Search(NewS,Yer2, Adres);
           If Yer1 > Yer2 then Yer1:=Yer2;
           If Yer2 > OGR^.Say then Yer2:=OGR^.Say;
           if (Yer1=0) or (Yer2=0) then begin
               Yer1:=1; Yer2:=OGR^.Say;
               Sinif:=' '
           end;
           BasSonSelect:=Sinif[1]
       end;
       For I:=Yer1 to Yer2 do begin
	   Inc(IndisSay);
	   Indis[IndisSay]:=OGR^.GetAdr(I);
       end;
       CloseEdit;
end;

Procedure FormFeed;
begin
   LPT.WriteLnPrt('\F');
   Inc(Sayfa);
   Satir:=0;
end;
Procedure BasimTuru.PrepHeader;
Var I, J, L, M, N : Byte;
    T : String;
begin
 OgrHead1:=' SIRA';
 OgrHead2:=' ----';
 For I:=OgrNo to OgrOrt do
   If Bilgiler[I] then begin
        J:=I-BasilacakBilgi;
        L:=BilgiLen[J];
        T:=BilgiTit[J];
        M:=Length(T);
        If L<M then L:=M;
        N:=(L-M) div 2;
        T:=Spaces(N)+T+Spaces(L-N-M);
        BilgiSp[J]:=Length(T);
        OgrHead1:=OgrHead1+' '+T;
        OgrHead2:=OgrHead2+' '+ConstStr('-',Length(T));
   end;
 Condensed:=False;
 If Length(OgrHead1) > 80 then Condensed:=True;
end;

Procedure BasimTuru.Init;
Var Y : Byte;
begin
   For Y:=1 to MaxBilgi do
    If Y in [BasUnite, BasimSekil, Yazici, KodBas, BasilacakBilgi, OgrNo, OgrAd] then
        SelAr[Y]:=True else SelAr[Y]:=False;
   EdRow:=2;
end;

Procedure BasimTuru.GoUp;
begin
   If EdRow=2 then
      beep
   else
      Dec(EdRow);
      If EdRow in [BasimSekil,BasilacakBilgi] then Dec(EdRow);
end;
Procedure BasimTuru.GoDown;
begin
   If EdRow=MaxBilgi then
      beep
   else
      Inc(EdRow); If EdRow in [BasimSekil,BasilacakBilgi] then Inc(EdRow);
end;
Procedure BasimTuru.ShowLine(Y, Attr:Byte);
var S:String;
    L, X: Byte;
begin
   S:=BasimBilgi[Y]+Spaces(27);
   S:=Copy(S,1,27); X:=18; L:=27;
   If Y in [BasUnite, BasimSekil, BasilacakBilgi] then begin X:=1 ; L:=17 end;
   S:=BasimBilgi[Y]+Spaces(L);
   S:=Copy(S,1,L);
   if SelAr[Y] then
     WriteStr(X,Y,S, InvColor(Attr))
   else
    WriteStr(X,Y,S, Attr);
end;
Procedure BasimTuru.Show(Attr : Byte);
var Y : Byte;
begin
    For Y:=1 to MaxBilgi do ShowLine(Y, Attr);
end;
Function BasimTuru.Selection(Attr : Byte):Boolean;

Var B,Stop : Boolean;
    TC   : Char;
    I    : Byte;
begin
  Init; Selection:=False;
  OpenEditWindow('™¦RENC˜ BASIMI SE€ENEKLER',
                 '57@BASIMDA YER ALACAK B˜G˜LER˜ VE BASIM šN˜TES˜N˜ SE€˜N˜Z',
                 'ENTER:SE€˜M@END:SE€˜M TAMAM@ESC:VAZGE€',
		 [CR, ENDKEY, ESC], [], 3, MaxBilgi);

  ClrScr;
  Show(InvColor(Attr));
  Stop:=False; HideCursor;
  Repeat
     WriteStr(15,EdRow,'Ä¯',Attr);
     TC:=GetKeyCmd;
     WriteStr(15,EdRow,'  ',TextAttr);
     Case TC of
        UPKEY  : GoUp;
        DOWNKEY: GoDown;
	ESC   : Stop:=True;
	CR    : begin
                     Case EdRow of
                     Yazici, Disket : begin SelAr[EdRow]:=True;
                                        SelAr[5-EdRow]:=False;
                                      end;
                     HNotBas..OrtBas : begin
                                   FillChar(SelAr[HNotBas],OrtBas-HNotBas+1,#0);
                                   SelAr[EdRow]:=True;
                               end;
                     else
                                   SelAr[EdRow]:=Not SelAr[EdRow];
                     end;
                     Show(InvColor(Attr))
                end;
	ENDKEY: begin
                  Stop:=True;
                  B:=False;
                  I:=OgrNo;
                  While not B and (I<=MaxBilgi) do begin B:=SelAr[I]; inc(I); end;
                  Selection:=B;
                  For I:=OgrNo to OgrOrt do  Bilgiler[I]:=SelAr[I];
                  if B then PrepHeader;
                end;
     end;{Case}
  Until Stop;
  ShowCursor;
  CloseEdit;
  YaziciBas:=SelAr[Yazici];
  BasimTuru:=KodBas-BasimSekil;
  for I:=HNotBas to OrtBas do If SelAr[I] then BasimTuru:=I-BasimSekil;
end;

Procedure OgrenciBasim;
Var HNot: Byte;
    HBasYil:Word;
    OgrSay, KizOgrSay, ErkekOgrSay : Word;
    Sinif:Char;
    I   : Word;
    TC  : Char;
    S:String;
Function  OgrLine:String;
Var I, J : Byte;
    S, T : String;
begin
 S:=' '+IntToStr(SIRA,4);
 With OGR^ do begin
   BilgiBuf[1]:=GetIs;                           {™¦RENC˜ NO}
   BilgiBuf[2]:=GetAd;                           {ADI, SOYADI}
   BilgiBuf[3]:=Cins;                            {C˜NS˜YET˜}
   BilgiBuf[4]:=DogumYer;                        {DO¦UM YER˜}
   BilgiBuf[5]:=DogumTarih;                      {DO¦UM TAR˜H˜}
   T:=GRAD.Kod(HazNot);
   If (T<>'NY') and (T<>'TK') then
       BilgiBuf[6]:=GRAD.GradeLine(HazNot)       {HAZIRLIK NOTU}
   else
       BilgiBuf[6]:='';
   BilgiBuf[7]:=IntToStr(HazBasYil,4);            {HAZ.BAžARI YILI}
   BilgiBuf[8]:=RealToStr(GPA,6,2);              {GENEL NOT ORTALAMASI}
 end;
 For I:=OgrNo to OgrOrt do
   If BasTur.Bilgiler[I] then begin
        J:=I-BasilacakBilgi;
        T:=BilgiBuf[J];
        if Not (J in [1,2,4]) then T:=Ortala(BilgiSp[J], T);
        T:=Copy(T+Spaces(BilgiSp[J]),1,BilgiSp[J]);
        S:=S+' '+T;
   end;
   OgrLine:=S;
end;

Procedure LPTPrintHeader(Var S : String);
Var L : Byte; T1, T2, T3, S1 : String;
Begin
   If Bastur.Condensed then L:=120 else L:=80;
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte));
   S1:=Bolum.KodAd(ActBol); Strip(S1);
   if Sinif=' ' then
      LPT.WriteLnPrt('\E\C'+Ortala(60,S1+' ™¦RENC˜ L˜STES˜'))
   else
      LPT.WriteLnPrt('\E\C'+Ortala(60,S1+' '+Sinif+'.SINIF ™¦RENC˜ L˜STES˜'));
   S:=Ortala(L,OgrHead1);
   L:=1;
   While S[L]=' ' do Inc(L);
   Dec(L); S:=Spaces(L);
   If Bastur.Condensed then S:='\C'+S;
   T1:=IntToStr(OgrSay,4);
   T2:=IntToStr(KizOgrSay,4);
   T3:=IntToStr(ErkekOgrSay,4);
   LPT.WriteLnPrt(S+'™¦RENC˜ SAYISI : '+T1+' KIZ : '+T2+' ERKEK : '+T3);
   LPT.WriteLnPrt('  ');
   LPT.WriteLnPrt(S+OgrHead1);
   LPT.WriteLnPrt(S+OgrHead2);
end;
Procedure DISKPrintHeader;
Var T1, T2, T3:String;
Begin
  DiskTextF.WriteText(UNIV);
  DiskTextF.WriteText(Fakulte);
  if Sinif=' ' then
    DiskTextF.WriteText(Bolum.KodAd(ActBol)+' ™¦RENC˜ LISTESI')
  else
    DiskTextF.WriteText(Bolum.KodAd(ActBol)+' '+Sinif+'.SINIF ™¦RENC˜ LISTESI');
   T1:=IntToStr(OgrSay,4);
   T2:=IntToStr(KizOgrSay,4);
   T3:=IntToStr(ErkekOgrSay,4);
   DiskTextF.WriteText('™¦RENC˜ SAYISI : '+T1+' KIZ : '+T2+' ERKEK : '+T3);
  DiskTextF.WriteText('');
  DiskTextF.WriteText(OgrHead1);
  DiskTextF.WriteText(OgrHead2);
end;
procedure OgrAltBasim;
Var B      : Boolean;
    I      : Word;
    S      : String;
begin
  Satir:=0;
  Sayfa:=1;
  SIRA:=0;
  OgrSay:=IndisSay;
  KizOgrSay:=0;
  ErkekOgrSay:=0;
  with OGR^ do begin
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
	    If Cins='E' then Inc(ErkekOgrSay) else Inc(KizOgrSay);
     end;
  end;
  If Not Bastur.YaziciBas then DISKPrintHeader;
  with OGR^ do begin
     For I:=1 to IndisSay do begin
	    DFile.GetRec(Indis[I],Is);
            INC(SIRA);
            If Not Bastur.YaziciBas then
               DiskTextF.WriteText(OgrLine)
            else begin
	       If (Satir=0) and Bastur.YaziciBas then
		  LPTPrintHeader(S);
	       Inc(Satir);
	       LPT.WriteLnPrt(S+OgrLine);
   	       If Satir=MaxSatir then FormFeed;
            end;
     end;
  end;
  If Not Bastur.YaziciBas then
     DiskTextF.CloseFile
   else If Satir < MaxSatir then FormFeed;
end;

Procedure   ReadHazNot;
Var S, OldSoy, Nm, Soy : String;
    Yer : Word;
Begin
  HNot:=106;HBasYil:=0;
  Repeat
   WriteStr(Form.FieldKol[1], 1 ,IntToStr(HBasYil,4), NorMalAttr);
   WriteStr(Form.FieldKol[2], 1 ,GRAD.KOD(HNot)+' '+GRAD.KODAD(HNot), NorMalAttr);
   S:=IntToStr(HBasYil,4);
   InputStr(S, Form.FieldKol[1], 1, 4, True, ['0'..'9'], 4, TC);
   HBasYil:=StrToInt(S);
   If TC<>NULL then exit;
   if HBasYil=0 then begin
      S:=GRAD.KOD(HNot);
      InputStr(S, Form.FieldKol[2], 1, 2, True, AllKar, 2, TC);
      If TC<>NULL then exit;
      If not GRAD.Search(S, Yer) then
	   complain('BOYLE BIR NOT YOK')
      else HNot:=Yer;
   end
   else HNot:=Succ(MaxGrade);
  until TC in [ESC, INSKEY];
end;
Begin
     If Bolum.NuKod = 0 then begin complain('HENšZ B˜R B™LšM YOK'); exit end;
     If not BasTur.Selection(SelectColor) then exit;
     If Not Bastur.YaziciBas then begin
        if Not DisketTak('SšRšCšYE ™¦RENC˜ BASIMI') then exit;
        S:=Bolum.Kod(ActBol)+'OGR.TXT';
        DiskTextF.OpenToWrite(Drive+S);
        If DiskTextF.Status<>0 then begin
           DiskTextF.Status:=0;
           Exit
        end;
     end;
     Case BasTur.Basimturu of
      1:begin
	     Sinif:=' ';
	     OpenEditWindow('HAZ.NOTU, BASžARI YILINA G™RE ™¦RENC˜ BASIMI',
	     '4@HAZ.BAžARI YILI@2@HAZIRILIK NOT',
             'INS:G˜R˜ž@ESC:VAZGE€',
             [INSKEY, ESC],[],3,4);
	     ReadHazNot;
	     CloseEdit;
	     If TC=ESC then exit;
	     IndisSay :=0;
	     With OGR^ do begin
		  For I:=1 to Say do begin
		     DFile.GetRec(GetAdr(I), Is);
		     If ( (HBasYil<>0 )
			and (HazBasYil = HBasYil)
			and (GRAD.Grade[HazNot].Basari) )
			or (HazNot = HNot) then begin
			Inc(IndisSay); Indis[IndisSay]:=GetAdr(I);
		     end;
		  end;
	      end;
	      If IndisSay = 0 then begin
		  Complain(GRAD.KOD(HNot)+' '+'HAZIRLIK NOTU ALAN YOK');
		  Exit
	      end;
	      SlctOgr.Say:=IndisSay;
	      If not SlctOgr.Selection('HAZIRLIK NOTUNA G™RE ™¦RENC˜ BASIMI SE€˜M',
		    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@2@HAZIRILIK NOT',
		     SelectColor) then exit;
	      OgrAltBasim;
	 end;
     2: begin
	    Sinif:=BasSonSelect;
            If Sinif=#255 then exit;
            SlctOgr.Say:=IndisSay;
	      If not SlctOgr.Selection('™¦RENC˜ SINIFINA G™RE ™¦RENC˜ BASIMI',
		   '8@™¦R.KOD@25@™¦RENC˜N˜N ADI',SelectColor) then exit;
	    OgrAltBasim;
	 end;
     3: begin
	     OGR^.SoyIndis; SlctOgr.Say:=IndisSay; Sinif:=' ';
	     If not SlctOgr.Selection('™¦RENC˜ SOYADINA G™RE ™¦RENC˜ BASIMI',
		    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI',
		     SelectColor) then exit;
	      OgrAltBasim;
	 end;
     4: begin
	     OGR^.OrtIndis; SlctOgr.Say:=IndisSay; Sinif:=' ';
	     If not SlctOgr.Selection('™¦RENC˜ ORTALAMASINA G™RE ™¦RENC˜ BASIMI',
		    '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@6@ORTALAMA',
		     SelectColor) then exit;
	      OgrAltBasim;
	 end;
     end;
end;


Constructor SlctOgrObj.Init;
begin
   Select.Init(OgrKeyL);
   SoyaGore:=False;
   KrediyeGore:=False;
end;
Procedure SlctOgrObj.ShowLine(Yer : Word; Attr : Byte);
Var S, N, K, M : String;
begin
   GotoXY(1,EdRow);ClrEol;
   With OGR^ do begin
      DFile.GetRec(Indis[Yer],Is);
      If SoyaGore then begin
	 GetSoyName(S, N);
	 S:=S+', '+N;
	 SetAd(S);
      end;
     S:= GetIs+' '+GetAd+'   ';
     N:=RealToStr(GPA,6,2);
     If KrediyeGore then begin
        M:=RealToStr(TopKredi,8,2);
        S:=S+N+'     '+M;
     end else begin
        K:=GRAD.Kod(HazNot);
        Case  Bastur.BasimTuru of
           1:If (HazNot<>106) then S:=S + K else S:=S+'  ';
           4:S:=S+N;
         end;
     end;
   end;
   WriteStr(2,EdRow,S,Attr);
end;
Function   SlctOgrObj.Search(S:String; Var Yer, Adr : Word):Boolean;
Var L, M : Word;
    A, B,T  : String;
begin
   Case  Bastur.BasimTuru of
         1,2,4: Search:=OGR^.Search(S,Yer, Adr);
         3    : Search:=OGR^.SearchSoy(S,Yer, Adr);
   end;
end;
Function    SlctOgrObj.Selection(Title, EdT : String; Attr : Byte): Boolean;
Var I : Word; B:Boolean;
begin
  { IndisSay:=0; FillChar(Indis,SizeOf(Indis),#0); }
   B:=Select.Selection(Title, EdT, Attr);
   Selection:=B;
   if B then begin
      IndisSay:=0;
      For I:=1 to Say do
	  If SelArr[I] then begin
	     Inc(IndisSay); Indis[IndisSay]:=Indis[I];
	  end;
   end;
end;

begin
     Bastur.Init;
     SlctOgr.Init;
     DiskTextF.Init;
end.







