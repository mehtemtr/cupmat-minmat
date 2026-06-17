unit basim;
interface
uses Crt, Win, UOg, UIndex, BLUNGR, Exist, Printer, GenUtil, DFile, UList, UPrt;

Const MaxSatir = 40;



Const

DrsHead1=' SIRA DERS KOD          DERS˜N ADI       SAAT KRED˜';
DrsHead2=' ---- -------- ------------------------- ---- -----';


UyeHead1=' SIRA šYE KOD    ™¦RET˜M ELEMANI ADI    šNVAN KOD    šNVAN';
UyeHead2=' ---- ------- ------------------------- --------- -----------';

YYDHead1=' SIRA DRSKOD BL GR       DERS˜N ADI           šNVAN         ™¦RET˜M ELEMANI';
YYDHead2=' ---- ------ -- -- ----------------------- ----------- -----------------------';

Type
     DiskListObj = Object(ListObj)
       Constructor Init;
       Procedure   PrintListe;Virtual;
       Procedure   ListeBas;Virtual;
    end;
    IkiAdres = record
      Orjin, Dest, IndYer : Word;
    end;

Var Sayfa, Satir, ToplamSay : Byte;
    SIRA      : Word;

    DiskList  : ^DiskListObj;
    DiskTextF : TextFile;
    BasilanSatir : Byte;
    IndAdrBuf    : Array[1..MaxDrs] of IkiAdres;

    Procedure PrintHader(A1, A2:String; Var S : String);
    Function  UyeLine:String;
    Function  YYDrsLine:String;
    Function  DrsLine:String;
    Procedure FormFeed;


implementation


  Constructor DiskListObj.Init;
  Begin
      ListObj.Init;
  end;

Procedure   DiskListObj.PrintListe;
Const MaxBas = 35;
Var KK : Word;
    SolIs, SolAd: String;
    DonemYer : Word;
    DersAdresi:Word;


Procedure PrintHader;
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
      DiskTextF.WriteText(UNIV);
      DiskTextF.WriteText(Fakulte+' '+Bolum.KodAd(ActBol));
      DiskTextF.WriteText(YilStr(ActYil,ActYY)+' ™¦RET˜M YILI BAžARI €˜ZELGES˜');
      DiskTextF.WriteText('™¦RET˜M ELEMANI   : '+UyeInfo);
      DiskTextF.WriteText('DERS˜N KODU VE ADI: '+DrsInfo);
      STR(Mev:3,M);
      Case Butunleme of
         1: DiskTextF.WriteText('DERS˜N MEVCUDU    : '+M);
	 2: DiskTextF.WriteText('BšTšNLEME MEVCUDU : '+M);
	 3: DiskTextF.WriteText('TEKRAR MEVCUDU    : '+M);
      end;
      DiskTextF.WriteText( ALT11);
      DiskTextF.WriteText( TIT1);
      DiskTextF.WriteText( AR1);
      DiskTextF.WriteText( TIT2);
      DiskTextF.WriteText( AR1);
end;
{Function AdAndMarker:String;
Var L, M : Word;
begin
  with ogr do begin
    AdAndMarker:=Ad;
    If not SearchDonem(ActYil-1, ActYY, DonemYer) then exit;
    L:=WordAra(DersAdresi,AnaKay[DonemYer], Donem[DonemYer].CNT,SizeOf(AnaRec));
    If L=0 then exit;
    M:=AnaKay[DonemYer,L].Grd;
    AdAndMarker:=Copy(Ad,1,MaxAdLen-1)+GRAD.Grade[M].Isaret;
  end;
end;}
begin

    KK:=1; Sayfa:=1;
    With YYDRS^ do begin
	DFile.GetRec(YYDersAdr, Is);
	DersAdresi:=DrsAdr;
	Mev:=Mevcut[Butunleme];
   end;
   PrintHader;
   While KK<= Mev do begin
       With OGR^ do begin
	  Dfile.GetRec(Liste[KK],Is);
	  SolIs:=GetIs; SolAd:=AdAndMarker(DersAdresi);
	end;
	DiskTextF.WriteText('   ' + SolIs+' '+SolAd);
	DiskTextF.WriteText(Ar1);
	Inc(KK);
   end;

end;
Procedure DiskListObj.ListeBas;
Var B : Boolean;
    I, T,  DSay, SelYer:Word;
    S:String;Tc:Char;
begin
  If Not DisketTak('SšRšCšYE L˜STE BASIMI') then exit;
  YYDRS^.IndisInit(ActBol, Butunleme);Say:=IndisSay;
  Case Butunleme of
   1: S:='YARIYIL';
   2: S:='BšTšNLEME';
   3: S:='TEKRAR';
  end;
  B:=Selection('D˜SKETE '+S+' L˜STE BASIMI SE€˜M',
		'6@DRSKOD@2@BL@2@GR@20@DERS˜N ADI', SelectColor);
  If Not B then exit;
  OpenEditWindow('D˜SKETE L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@DEL:BASMA@ESC:VAZGE€',
		  [CR, ESC,DELKEY],[],5,4);
  DSay:=0;
  For I:=1 to Say do
     If SelArr[I] then begin Inc(DSay); Indis[DSay]:=Indis[I] end;
  Say:=DSay;
  If DSay = 0 then begin CloseEdit; exit end;
  DiskTextF.OpenToWrite(Drive+ListFileName);
  If DiskTextF.Status<>0 then begin
    DiskTextF.Status:=0;
    CloseEdit;
    Exit
  end;
  For I:=1 to Say do begin
      YYDersAdr:=Indis[I];
      YYDRS^.Dfile.GetRec(YYDersAdr, YYDRS^.Is);
      DRS^.Dfile.GetRec(YYDRS^.DrsAdr,DRS^.Is);
      S:=YYDRS^.GetIsExpand;
      WriteStr(Form.FieldKol[1],1,S+' '+DRS^.AD, SelectColor);
      WriteStr(Form.FieldKol[1],3,'BASILSIN MI?', CmdColor);
      TC:=GetDesiredKey([ESC, CR, DELKEY]);
      Case TC of
	  CR     :If ListeOku then PrintListe;
	  ESC    :Begin CloseEdit;
			DiskTextF.CloseFile;
			exit
		  end;
	  DELKEY :
      end;
  END;
  CloseEdit;DiskTextF.CloseFile;
end;

Function UyeLine:String;
begin
  With UYE^ do
   UyeLine:=' '+IntToStr(SIRA,4)+' '+GetIs+'  '+GetAd+'     '+Unvan.Kod(UnvKd)+'    '+ Unvan.KodAd(UnvKd);
end;

Function YYDrsLine:String;
Var S : String;
begin
  With YYDRS^ do begin
    S:=GetIsExpand;
    DRS^.DFile.GetRec(DrsAdr,DRS^.Is);
    S:=S+' '+ Copy(DRS^.GetAd,1,23);
    UYE^.DFile.GetRec(UyeAdr,UYE^.Is);
    S:=S+' '+Unvan.KodAd(UYE^.UnvKd)+' '+Copy(UYE^.GetAd,1,23);
    YYDrsLine:=' '+IntToStr(SIRA,4)+' '+S;
  end;
end;

Function DrsLine:String;
Var S:String;
begin
  With DRS^ do
     DrsLine:=' '+IntToStr(SIRA,4)+' '+GetIs+'   '+ GetAd+' '+ IntToStr(Saat,4)+' '+RealToStr(Kredi,5,2);
end;

Procedure PrintHader(A1, A2:String; Var S : String);
Var L : Byte;
Begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte));
   LPT.WriteLnPrt('\E\C'+Ortala(60,S));
   LPT.WriteLnPrt('  ');
   S:=Ortala(80,A2);
   L:=1;
   While S[L]=' ' do Inc(L);
   Dec(L); S:=Spaces(L);
   LPT.WriteLnPrt(S+A1);
   LPT.WriteLnPrt(S+A2);
end;

Procedure FormFeed;
begin
   LPT.WriteLnPrt('\F');
   Inc(Sayfa);
   Satir:=0;
end;



begin
     New(DiskList,Init);
     DiskTextF.Init;
end.



