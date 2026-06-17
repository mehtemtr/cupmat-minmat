uses GenUtil,BLUNGR, UIndex, Nsr, Crt, DFile, Exist, UOg, UPrt;

CONST
  BimKeyL   = 3;
  MaxBim    = 1000;
  CmdFakKod = 4;
  HataFak   = 1;
  HataBol   = 2;
  HataOgr   = 3;
  HataDrs   = 4;
  HataBirak = 5;
  HataAl    = 6;
  FakNo   : Word=1;



Type  BimType = record
        BimIs : Array[0..BimKeyL-1] of Char;
        BimNo : Word;
      end;
  KayObj = Object
      DosyaAd     : String[9]; {InFile Dosya Adi}
      ErrorAd     : String[11];
      Processed   : Boolean; {Bu Dosya okundumu}
      HataSay     : Word; {Okunan dosyadaki Hata Sayisi}
      Satir       : Word;    {Infile daki satir sayisi}
      DosNo       : Word;
      Line        : String;
      FKStr, BLStr, OgrStr, Grp, BimDrs, BimNo, AlBirak : String;
      OgrAdr, DAdr: Word;
      InFile      : TextFile;
      ErrorFile   : TextFile;
      Constructor Init;
      Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
      Procedure   ReadDosStat;
      Procedure   WriteDosStat;
      Procedure   ProcessLine;
      Function    ConvBimKod(A, BL, GR : String) : String;
      Procedure   PutError(HataNo:word);
      Procedure   KayOku;
      Procedure   OgrListe;
      Procedure   HataBas;
    end;
var
    BimSay  : Word;
    BimFile : DataFile;
    Bim     : Array[0..MaxBim] of BimType;
    Kay     : KayObj;
Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;
Function STInt(S:String):Word;
Var L , I : Integer;
begin
   For I:=1 to Length(S) do
       If Not (S[I] in['0'..'9']) then S[I]:='0';
   Val(S,L,I);
   STInt:=L;
end;


Function BimKod(Yer : Word) : String;
Var S:String;
begin
   BimKod:='   ';
   If (Yer <= BimSay) and (Yer >0 ) then begin
      Move(Bim[Yer],S[1], BimKeyL);
      S[0]:=Chr(BimKeyL);
      BimKod:=S;
   end;
end;
Procedure   KayObj.ReadDosStat;
Var X : DataFile;
    Buf : Array[1..1024] of byte;
    L : Word;
begin
    If Not exists(Bolum.Kod(ActBol)+'XKAYDOS.DAT') then
       WriteDosStat;
    L:=SizeOf(Processed)+ SizeOf(HataSay);
    X.Init(1, L);
    X.OpenFile(Bolum.Kod(ActBol)+'XKAYDOS.DAT');
    X.GetRec(1, Buf);
    Move(Buf, Processed, L);
    X.CloseFile;
end;
Procedure   KayObj.WriteDosStat;
Var X : DataFile;
    Buf : Array[1..1024] of byte;
    L : Word;
    B : Boolean;
begin
    B:=Exists(Bolum.Kod(ActBol)+'XKAYDOS.DAT');
    L:=SizeOf(Processed)+SizeOf(HataSay);
    X.Init(1, L);
    X.OpenFile(Bolum.Kod(ActBol)+'XKAYDOS.DAT');
    Move(Processed, Buf, L);
    If B then X.PutRec(1,Buf) else X.AddRec(L,Buf);
    X.CloseFile;
end;
Constructor KayObj.Init;
Var S , A: String;
    I, J : Word;
begin
    Select.Init(11); Say:=1;
    Processed:=0;
    HataSay:=0;
    A:=IntToStr(ActBol,2)+IntToStr(FakNo,2);
    SetBlankZero(A);
    S:='X'+A+'.DAT';
    DosyaAd:=S;
    ErrorAd:='X'+A+'HT.DAT';
    ReadDosStat;
end;
Procedure   KayObj.ShowLine(Yer : Word; Attr : Byte);
Var S : String;
begin
   WriteStr(Form.FieldKol[1],EdRow, DosyaAd[Yer],Attr);
   S:=DosyaAd[Yer];
   S:=Bolum.KodAd(ActBol)+'AL/CIK KAYITLARI';
   If Processed[Yer] then
        S:=S+' OKUNDU        '
   else S:=S+' HENšZ OKUNMADI';
   WriteStr(Form.FieldKol[2],EdRow,S,Attr);
   WriteStr(Form.FieldKol[3],EdRow,IntToStr(HataSay[Yer],5),Attr)
end;

Procedure   UpdateMevcut;
Var I, J, R, Adres: Word;
    MM : Array[1..MaxYYDrs] of Word;
begin
    With YYDrs do begin
       IndisInit(ActBol, 1);
       If IndisSay = 0 then exit;
    end;
    FillChar(MM, SizeOf(MM), #0);
    With Ogr do begin
       For I:=1 to Say do begin
           Adres:=GetAdr(I);
           DFile.GetRec(Adres, Is);
           For J:=1 to Kac[AktifYYInd] do Inc(MM[ YYKay[AktifYYInd,J] ]);
       end;
    end;
    With YYDrs do begin
      For I:=1 to IndisSay do begin
          Adres:=Indis[I];
          Dfile.GetRec(Adres, Is);
          Mevcut[1]:=MM[Adres];
          DFile.PutRec(Adres,Is);
      end;
    end;
end;
Procedure KayObj.KayOku;
Var I : Word;
begin
 OpenEditWinDow('KAYIT AL/CIK OKUMA',
             '9@DOSYA ADI@36@ACIKLAMA@5@HATA SAYISI', SelectColor);
 If Exists(DosyaAd[I]) then begin
    HataSay:=0;
    ErrorFile.Init;
    ErrorFile.OpenToWrite(ErrorAd);
    InFile.Init;
    with InFile do begin
      OpenToRead(DosyaAd);
      Satir:=0;
      Bekleyiniz(DosyaAd+'@DOSYASINI OKUYORUM');
      While not Eof(T) do begin
          Line:=ReadText;
          If not (Line[1] in ['0'..'9']) then Line[1]:='0';
          Strip(Line);
          Inc(Satir);
          ProcessLine;
       end;
       CloseFile;
       ErrorFile.CloseFile;
     Processed:=True;
    CloseEdit;
  end;
  WriteDosStat;
  SetAllStatFalse;
  WriteListStat;
  Bekleyiniz('DERS MEVCUTLARI DšZENLEN˜YOR');
  UpdateMevcut;
  CloseWindow;
end;
Procedure KayObj.OgrListe;
Var I : Word;
    KayListe : Array[1..MaxOgr] Of Boolean;
    Junk : Boolean;
Function GetWord(Delta : Word):String;
Var S : String;
begin
    GetWord:=Copy(Line,1,Delta);
    Delete(Line,1,Delta+1);
end;
Function GetFak:Boolean;
begin
    GetFak:=True;
    FKStr:=GetWord(2);
    If STInt(FKStr)<>FakNo then GetFak:=False;
end;
Function GetBolum:Boolean;
begin
   GetBolum:=False;
   If Not GetFak then exit;
   GetBolum:=True;
   BLStr:=GetWord(4);
   L:=StInt(BLStr);
   If (L <> ActBol) then  GetBolum:=False;
end;
Function GetOgr:Boolean;
Var Yer : Word;
begin
   GetOgr:=False;
   If Not GetBolum then exit;
   GetOgr:=True;
   OgrStr:=GetWord(8);
   Junk:=Ogr.Search(OgrStr, Yer, OgrAdr);
   If not Junk then
      GetOgr:=False
   else
      Ogr.DFile.GetRec(OgrAdr, Ogr.Is);
end;
Procedure PrOgr;
Const MaxBas = 49;
      KayTit='    NO         ADI VE SOYADI                                                 DERSLER  ';
      KayAr1 =' -------- ---------------------- ';
      KayAr=KayAr1+'----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----';
Var Adres, Basilan, I, J : Word;
    Sayfa      : Byte;
    SayfaBasi  : Boolean;
    S : String;

Procedure PrintHader(Sayfa:Byte);
Var UyeInfo, DrsInfo, M, S : String;
    Mev                    : Word;
Begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\C'+ Ortala(119,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI KAYIT L˜STES˜'));
   LPT.WriteLnPrt(' ');
   LPT.WriteLnPrt('\C'+ KayTit);
   LPT.WriteLnPrt('\C'+ KayAr);
   SayfaBasi:=True;
end;
Procedure FormFeed;
Var L : Word;
begin
   Basilan:=0;
   LPT.WriteLnPrt('\F ');
   Inc(sayfa);
   SayfaBasi:=False;
end;
begin
   Basilan:=0;
   Sayfa:=1;
   SayFaBasi:=False;
With Ogr do begin
   For I:=1 to Say do begin
       If Not SayfaBasi then PrintHader(Sayfa);
          Adres:=GetAdr(I);
          If KayListe[Adres] then begin
             DFile.GetRec(Adres, Is);
             S:=' '+GetIs+' '+Copy(GetAd, 1, 20);
             For J:=1 to Kac[AktifYYInd] do begin
                 YYDrs.DFile.GetRec(YYKay[AktifYYInd, J], YYDrs.Is);
                 S:=S+' '+Copy(YYDrs.GetIs, 1, 6);
             end;
             Inc(Basilan);
             LPT.WriteLnPrt('\C'+ S);
	     If Basilan=MaxBas then FormFeed;
        end;
   end;
   if SayfaBasi then FormFeed;
end;
end;
begin
 FillChar(KayListe,SizeOf(KayListe),#0);
 For I:=1 to 4 do begin
    If Exists(DosyaAd[I]) then begin
       InFile.Init;
       with InFile do begin
          OpenToRead(DosyaAd[I]);
          Bekleyiniz(DosyaAd[I]+'@DOSYASINI OKUYORUM');
          While not Eof(T) do begin
               Line:=ReadText;
               If not (Line[1] in ['0'..'9']) then Line[1]:='0';
               Strip(Line);
               Inc(Satir);
               If GetOgr then KayListe[OgrAdr]:=True;
           end;
          CloseFile;
       end;
    end;
    CloseWindow;
  end;
  PrOgr;
end;
Procedure KayObj.HataBas;
Var I : Word;
begin
   OpenEditWindow('AL/CIK'KAYIT DOSYALARI HATA BASIMI',
             '11@DOSYA ADI@36@ACIKLAMA@5@HATA SAYISI', SelectColor) then exit;
   For I:=1 to 4 do begin
    If Exists(ErrorAd[I]) and SelArr[I] then begin
       ErrorFile.Init;
       ErrorFile.OpenToRead(ErrorAd[I]);
       with ErrorFile do begin
          While not Eof(T) do begin
               Line:=ReadText;
               LPT.WriteLnPrt('C\'+Line);
           end;
       end;
    end;
    ErrorFile.CloseFile;
  end;
end;
Procedure KayObj.PutError(HataNo:word);
begin
   With ErrorFile do begin
      WriteText('Dosya:'+ DosyaAd[DosNo]+' '+'™GRENC˜ NO = '+  OgrStr+'  Satir = '+ IntToStr(Satir,4));;
      Case HataNo of
         HataFak   : WriteText(' HATALI FAKšLTE KODU = '+ FKStr);
         HataBol   : WriteText(' HATALI B™LšM KODU   = ' + BLStr);
         HataOgr   : WriteText(' HATALI ™GRENC˜ NO   = '+  OgrStr);
         HataDrs   : WriteText(' HATALI DERS KODU    = '+  BimDrs+'  '+ BimNo);
         HataBirak : WriteText(' BIRAKILAN DERS :'+BimDrs+' '+ BimNo+' DERS˜NE KAYITLI DE¦˜L');
         HataAL    : WriteText(' ALINAN DERS :'+BimDrs+' '+ BimNo+' '+IntToStr(MaxDonemDrs,2)+' DERSDEN FAZLA OLUYOR');
      end;
   end;
   Inc(HataSay[DosNo]);
 end;
Function KayObj.ConvBimKod(A, BL, GR : String) : String;
Var S : String; Yer : Word;
begin
   Yer:=STInt(Copy(A,1,3));
   S:=BimKod(Yer)+Copy(A,4,3);
   Yer:=STInt(BL); S:=S+Chr(Yer+64);
   Yer:=STInt(Gr); If Yer=0 then Yer:=1; S:=S+Chr(Yer+64);
   ConvBimKod:=S;
end;

Procedure KayObj.ProcessLine;
Var
    Junk : Boolean;
    DYer,L, N : Word;
    Devam : String;
Function GetWord(Delta : Word):String;
Var S : String;
begin
    GetWord:=Copy(Line,1,Delta);
    Delete(Line,1,Delta+1);
end;
Function GetFak:Boolean;
begin
    GetFak:=True;
    FKStr:=GetWord(2);
    If STInt(FKStr)<>FakNo then begin
       PutError(HataFak);
       GetFak:=False;
    end;
end;
Function GetBolum:Boolean;
begin
   GetBolum:=False;
   If Not GetFak then exit;
   GetBolum:=True;
   BLStr:=GetWord(4);
   L:=StInt(BLStr);
   If (L <> ActBol) then begin
          PutError(HataBol);
          GetBolum:=False;
   end;
end;
Function GetOgr:Boolean;
Var Yer : Word;
begin
   GetOgr:=False;
   If Not GetBolum then exit;
   GetOgr:=True;
   OgrStr:=GetWord(8);
   Junk:=Ogr.Search(OgrStr, Yer, OgrAdr);
   If not Junk then begin
      PutError(HataOgr);
      GetOgr:=False;
   end else
      Ogr.DFile.GetRec(OgrAdr, Ogr.Is);
end;

Procedure DropAdd(ALB: WOrd);
Var  I, Dyer : Word;
     V : AnaRec;
     M, L, K, N : Word;

Function SeekCourse:Word;
Var I : Word;
begin
  with ogr do
    For I:=1 to Kac[AktifYYInd] do
     If DAdr = YYKay[AktifYYInd,I] then begin
        SeekCourse:=I;
       exit
    end;
    SeekCourse:=0;
end;
begin
  With Ogr do begin
       L:=SeekCourse;
       Case ALB of
          0 :begin { Birak}
               If L=0 then begin  PutError(HataBirak); exit  end;
               K:=Kac[AktifYYInd];
               DelRec(Ders[AktifYYInd], V, L, K, SizeOf(AnaRec));
               Inc(K);
               DelRec(YYKay[AktifYYInd], M, L, K, 2);
               Kac[AktifYYInd]:=K;
             end;
         1: begin {AL}
               If L<>0 then exit;
               If Kac[AktifYYInd]=MaxDonemDrs then begin
                     PutError(HataAl);
                     exit
               end;
               Inc(Kac[AktifYYInd]);
               L:=Kac[AktifYYInd];
               YYKay[AktifYYInd,L]:=Dadr;
               YYDrs.DFile.GetRec(DAdr, YYDrs.Is);
               With Ders[AktifYYInd,L] do begin
                    DrsPtr:=YYDrs.DrsADr; Grd:=106;
               end;
            end;
       end; {Case}
  end; {With}
end; {DropAdd}
begin
     If Not GetOgr then exit;
     With Ogr do begin
        While Length(Line)>0 do begin
             BimNo:=GetWord(6);
             SetBlankZero(BimNo);
             Grp:=GetWord(1);
             AlBirak:=GetWord(1);
             BimDrs:=ConvBimKod(BimNo, BLStr, Grp);
             Junk:=YYDrs.Search(BimDrs, DYer, DAdr);
             if Not Junk then
                 PutError(HataDrs)
             else
                 DropAdd(StInt(AlBirak));
        end;
        DFile.PutRec(OgrAdr, Is);
     end;
end;


Function BimYaz:Boolean;
begin
     BimYaz:=False;
     BimFile.Init(1, SizeOf(Bim));
     With BimFile do begin
       OpenFile('BIM.DAT');
       If Status<>0 Then Exit;
       Move(BimSay, Bim[0], 2);
       PutRec(1,Bim);
       If Status<>0 Then Exit;
       CloseFile;
       If Status<>0 Then Exit;
     end;
     BimYaz :=True;
  end;

Function BimOku:Boolean;
begin
    BimSay:=0;
    BimOku:=False;
    FillChar(Bim, SizeOf(Bim),#0);
    If Not Exists('BIM.DAT') then
        if Not BimYaz then exit;
    BimFile.Init(1, SizeOf(Bim));
    With BimFile do begin
       OpenFile('BIM.DAT');
       If Status<>0 Then Exit;
       GetRec(1,Bim);
       If Status<>0 Then Exit;
       CloseFile;
       If Status<>0 Then Exit;
     end;
     Move(Bim, BimSay,2);
     BimOku:=True;
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

Procedure ShowUnivFak;
Var S : String;
    L : Byte;
begin
    SaveWinInfo;
    NormalWindow;
    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte;
    L:=Length(S);
    While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;
{$F+}
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDrs.DFile.CloseFile;
  Drs.DFile.CloseFile;
  Ogr.DFile.CloseFile;
  YYDrs.Done;
  drs.done;
  ogr.done;
  Yariyil.done;
  If Not BimYaz then
     Complain('B˜MKOD DOSYASINI YAZAMIYORUM');
  ClrScr;
  Halt;
end;

Procedure Bos;
begin
end;
{$F-}



Procedure PutBimKod(S:String; Yer : Word; N : Word);
begin
    Move(S[1],Bim[Yer], BimKeyL);
    Bim[Yer].BimNo:=N;
end;
Function  BimAra(S : String; Var Yer:Word) : Boolean;
Var L, M : Word;
begin
    BimAra:=False;
    Yer:=1;
    If Length(S)>BimKeyL then S[0]:=Chr(BimKeyL);
    L:=1; Yer:=BimSay+1;
    While Yer>L do begin
      M:=(Yer+L) div 2;
      If BimKod(M)>=S then Yer:=M else L:=M+1;
    end;
    If Yer<=BimSay then BimAra:=(BimKod(Yer)=S);
end;
Procedure InsBim(Yer : Word);
Var I : Word;
begin
    Inc(BimSay);
    For I:=BimSay Downto Yer+1 do
        Move(Bim[I-1], Bim[I], SizeOf(BimType));
end;
Procedure UpdateBim;
Var I, Yer : word;
    A : String;
begin
   For I:=1 to Drs.Say do begin
       A:=Drs.GetKey(I);
       A:=Copy(A,1,3);
       If Not BimAra(A, Yer) then begin
          InsBim(Yer);
          PutBimKod(A, Yer, BimSay);
       end;
   end;
end;
Procedure InitProg;
Var T : TextFile;
    C : String;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  BimSay:=0;
  Bolum.Init;
  FillChar(Bim,SizeOf(Bim),#0);
  Yariyil.init;
  YYDrs.Init;YYDrs.Open;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open;
  If Not BimOku then begin
     Complain('B˜M DOSYASI OKUNAMIYOR');
     QuitProg;
  end;
  ReadUniv;
  FakNo:=1;
  IF Exists('FAKNO.INF') then begin
     T.OpenToRead('FAKNO.INF');
     C:=T.ReadText;
     FakNo:=STInt(C);
     T.CloseFile;
  end;
  UpdateBim;
  ShowBolYil;
end;
Procedure ShowCopwr;
Var S:String;
begin
   Writestr(10, 20, Decode('#9-951; '#0':0+;%56+8%6+'#0'!+.''+7.%/'#0'/%5-%?+'#0'351&'#0'$5'#0'>969&'#0':0.:'), CmdColor);
   str(memavail,s);
   Writestr(27, 24, 'KALAN HAFIZA : '+S+' BYTE', CmdColor);
end;
{$F+}
Procedure FakKodGir;
Var S : STRING;
    TC : Char;
    L:Byte;
    U:CharSet;
    T : TextFile;
begin
  OpenEditWindow('FAKšLTE KODU',
		 '2@KOD',
		 'ESC:€IKIS',[ESC],[],10,1);
  ShowCursor;
  ClrScr;
  Repeat
     Str(FakNo:2,S);
     InputStr(S,Form.FieldKol[1],1,2,True,['0'..'9'],2,TC);
     FakNo:=STInt(S);
  Until TC = ESC;
  CloseEdit;
  T.OpenToWrite(Drive+'FAKNO.INF');
  T.WriteText(S);
  T.CloseFile;
end;


Procedure BolumSec;
begin
 Ogr.BolumSec
end;
Procedure YilSec;
begin
 YYDrs.YilSec
end;
Procedure KayitOku;
begin
   Kay.Init(False);
   With Kay do begin
     KayOku;
     Done;
   end;
end;

Procedure EkCik;
begin
   Kay.Init(True);
   With Kay do begin
     KayOku;
     Done;
   end;
end;

Procedure HataDok;
begin
   Kay.Init(False);
   Kay.HataBas;
   Kay.Done;
end;
Procedure ListeDok;
Begin
   Kay.Init(False);
   Kay.OgrListe;
   Kay.Done;
end;
{$F-}
Var CH:Char;
begin
  MenuBar:=
  AddMenu('~DOSYA', ALT_D, 0, Bos,
       AddMenu('~B™LšM SE€    F1', F1     , CmdBolumSec  , BolumSec,0,
       AddMenu('~YIL SE€ CTRL_F1', CTRL_F1, CmdYilSec    , YilSec  ,0,
       AddMenu('~FAKšLTE KOD  F2', F2, CmdFakKod, FakKodGir,0,
       AddMenu('€~IK     ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0,0)))),
  AddMenu('~KAYIT', ALT_K, 0, Bos,
       AddMenu('~KAYIT OKU F3' , F3, CmdKayOku, KayitOku,0,
       AddMenu('~DERS EK/€IK OKU F4', F4, CmdEkCik, EkCik,0,
       AddMenu('HA~TA D™K F5', F5, CmdHataDok, HataDok,0,
       AddMenu('L˜STE D™K F6 ', F6, CmdListeDok, ListeDok,0,0)))),0));

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