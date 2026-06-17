

Var Line1, Line4, C, A, D : String;
    L : Word;
begin
 line1 := '';
 line4 := '';
 For L:=1 to 20 do begin
      If L<20 then begin
	c := IntToStr(L,2);
	a:= '  ³';
	D := ConstStr(2 - Length(c), #48) + c + '³';
      end else begin
	 D := '    ³';
	 a := d;
      end;
      line1 := line1 + d;
      line4 := line4 + a;
 end;
   line1 := line1 + d;
   line4 := line4 + a;
   TopMen:= 46;
   Basla := 1;
   Bitir := TopMen;
   sf := 0;
   IF KayNo < TopMen THEN Bitir := KayNo;
   JJ:=1;
   while JJ<=KayNo do begin
	 sf := sf + 1;
	 LPRINT STRING(129, 196); CHR(27); '-1'

	  'ÚÄÄÄÂÄÄÄÄÄÄÄÄÂÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄÂÄÄÄÄÄ¿';
	  '³SN.³ ™¦R.NO ³       ADI SOYADI        ³ 1³ 2³ 3³ 4³ 5³ 6³ 7³ 8³ 9³10³11³12³13³14³     ³     ³     ³     ³     ³';
	  'ÃÄÄÄÅÄÄÄÄÄÄÄÄÅÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄÅÄÄÄÄÄ´';
	  '³   ³        ³                         ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³  ³     ³     ³     ³     ³     ³';
	  'ÀÄÄÄÁÄÄÄÄÄÄÄÄÁÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÁÄÄÄÄÄÙ';
		Á
Ù                       Å
		12345678 1234567890123456789012345                                           12345
	 FOR l := Basla TO Bitir
	    b := SayiKare(CDBL(VAL(MID(Bol(l), 1, 10)))) + '³ '
	    R := STRING(3 - LEN(SayiKare(CDBL(l))), '0') + SayiKare(CDBL(l)) + '³'
	    IF q THEN
	       Xx := 1
	       FOR ll := 1 TO 14
		  MID(line4, Xx, 1) := MID(adi(l), 30 + ll, 1)
		  Xx := Xx + 3
	       NEXT
	    END IF
	    LPRINT '³' + R + b + RTRIM(adi(l)); TAB(52); '³' + line4
	 NEXT
	 LPRINT CHR(27); '-0'; STRING(129, 196)
	 LPRINT ' DERS˜ VEREN ™¦RET˜M ELEMANI : '; TAB(95); '˜MZA : '
	 LPRINT STRING(129, 196); CHR(18)
      FOR hl := 1 TO 7: LPRINT : NEXT
      IF Bitir <> KayNo THEN
	 Basla := Basla + TopMen: Bitir := Bitir + TopMen
	 IF Bitir > KayNo THEN Bitir := KayNo
      ELSE
	 kj := (KayNo MOD 46): IF kj := 0 THEN kj := 46
	 kl := 46 - kj
	 FOR tt := 1 TO kl: LPRINT : NEXT
      END IF
   NEXT
   ERASE adi, Bol: MesajVer 3, '', '', ''

END SUB

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
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI YOKLAMA €˜ZELGES˜'));
   LPT.WriteLnPrt( '\C\S5™¦RET˜M ELEMANI   : \D\C'+UyeInfo);
   LPT.WriteLnPrt( '\C\S5DERS˜N KODU VE ADI: \D\C'+DrsInfo);
   STR(Mev:3,M);STR(Sayfa:2,S);
   case Butunleme of
    1 : LPT.WriteLnPrt( '\C\S5DERS˜N MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
    2 : LPT.WriteLnPrt( '\C\S5BšTšNLEME MEVCUDU : '+M+'\C\S80SAYFA : '+S);
    3 : LPT.WriteLnPrt( '\C\S5TEKRAR MEVCUDU    : '+M+'\C\S80SAYFA : '+S);
   end;
   LPT.WriteLnPrt('\C'+ alt);
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\C'+TIT);
   LPT.WriteLnPrt('\C'+ AR);
   LPT.WriteLnPrt('\C'+ TITN);
   LPT.WriteLnPrt('\C'+ AR);
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   If IsaretSay = 0 then
      lpt.WriteLnPrt('')
   else For L:=1 to IsaretSay do
	LPT.WriteLnPrt('\C'+
	Grad.Grade[IsaretQue[L]].Isaret+' : '+ Grad.ReadDipNot(IsaretQue[L]));
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\C'+'SINAVI YAPAN ™¦RET˜M ELEMANI:\C\S55˜MZA :');
   LPT.WriteLnPrt('\C'+ ALT);
   LPT.WriteLnPrt('\F '+ESC+'2');
   Inc(sayfa);
   SayfaBasi:=False;IsaretSay:=0;
end;
Function AdAndMarker:String;
Var L, M : Word;CH:Char;
begin
  with ogr do begin
    AdAndMarker:=Ad;
    If not SearchDonem(ActYil-1, ActYY, DonemYer) then exit;
    L:=WordAra(DersAdresi,AnaKay[DonemYer], Donem[DonemYer].CNT,SizeOf(AnaRec));
    If L=0 then exit;
    M:=AnaKay[DonemYer,L].Grd;
    CH:=GRAD.Grade[M].Isaret;
    AdAndMarker:=Copy(Ad,1,MaxAdLen-1)+CH;
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
