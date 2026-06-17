unit YPKRD;
interface
uses Crt, Dos, GenUtil, Win, UOG, BLUNGR, UPrt, DFile, Exist;
const OgrenimSuresi:Integer=4;
      SonOdemeTar : String='01/01/1997';
      TransferTar : String='01/01/1997';
      DonemYil    : Word=1997;
      DonemYY     : Byte=1;
      Donem       : String='97981';
      OgrTip      : Char='0';
      Harc        : LongInt=15000000;
      InitDone : Boolean=False;
      YildanAra : Boolean=True;
type
   Char10=Array[1..10] of Char;
   Char25=Array[1..25] of Char;
   Char3=Array[1..3] of Char;
   Char5=Array[1..5] of Char;
   Char15=Array[1..15] of Char;
   PDetailKayit=^TDetailKayit;
   TDetailKayit=record
      OgrNo : Char10;
      AdSoyAd:Char25;
      OgrTp:Char;
      Yabancimi:Char;
      BolumKodu:Char3;
      Harclimi:Char;
      Dnem:Char5;
      SonOdemeTr:Char10;
      Tutar:Char15;
      Iptalmi:Char;
      ArtYil :Byte;
   end;
   TBolArr = Array[1..MaxBolum+1] of String[6];
   PItemList = ^TItemList;
   TItemList = array[1..MaxInt div 4] of PDetailKayit;
   TDetailKayitExpand = Record
      OgrNo  : String[10];
      OgrAd  : String[25];
      OgrTip : string[1];
      BolKod : String[6];
      Tutar  : String[15];
      ArtYil : Byte;
    end;
Var BLKod : TBolArr;
    BolSay : Integer;
    ARTIKT  : TextFile;
    Items: PItemList;
    Count: Integer;
    FKod: String;
    Dir      : array[1..20] of String[12];
    FlCount  : Integer;



Procedure InitProg;
procedure BankBirlestir;
Procedure QuitProg;
procedure WriteUniv;
Procedure ReadUniv;

procedure WriteBolKod;
Procedure ReadBolKod;
Procedure ShowFak;

Procedure BolKodGir;
Procedure BankBilgiYaz;
procedure NewOgr(SNo, SAd, BolKod:String; Var P : TDetailKayit);
procedure Insert(Item: TDetailKayit);
function  KeyOf(Item: TDetailKayit): String;
function  Search(Key :String; var Index: Integer): Boolean;

procedure FindFiles;
procedure TransferTarGir;
procedure DonemGir;
Function  ArtikYil:Integer;
implementation

function  KeyOf(Item: TDetailKayit): String;
Var S : String;
begin
   S[0]:=Chr(10);
   Move( Item,S[1],10);
   KeyOf:=S
end;

procedure Insert(Item: TDetailKayit);
Var I, Index : Integer; P : PDetailKayit;
begin
    if Search(KeyOf(Item), Index) then exit;
    GetMem(P, SizeOf(TDetailKayit));
    P^:=Item;
    inc(Count);
    For I:=Count downto Index + 1 do Items^[I]:=Items^[I-1];
    Items^[Index]:=P
end;
function Search(Key :String; var Index: Integer): Boolean;
var
  L, H, I, C: Integer;
procedure Compare;
begin
    C:=0;
    If KeyOf(items^[I]^) > Key then C:=1
       else if KeyOf(Items^[I]^) < Key then C:=-1;
end;
begin
  Search := False;
  L := 0;
  H := Count - 1;
  while L <= H do
  begin
    I := (L + H) shr 1;
    Compare;
    if C < 0 then L := I + 1 else
    begin
      H := I - 1;
      if C = 0 then
      begin
        Search := True;
        L := I;
      end;
    end;
  end;
  Index := L;
end;
procedure WriteBolKod;
Var T : TextFile;
    I, J : Integer;
    S : String;
begin
   With T do begin
     OpenToWrite('BOLKOD.DAT');
     Str(BolSay,S);
     WriteText(S);
     For I:=1 to BolSay do begin
       WriteText(BLKod[I]);
     end;
     WriteText(SonOdemeTar);
     WriteText(OgrTip);
     Str(DonemYil,S);WriteText(S);
     Str(DonemYY,S);WriteText(S);
     Str(OgrenimSuresi,S);WriteText(S);
     Str(Harc,S);WriteText(S);
     WriteText(TransferTar);
     CloseFile;
   end;
end;
Procedure ReadBolKod;
Var InT : TextFile;
    N, I, J : Integer;
    S :string;
begin
   If not Exists('BOLKOD.DAT') then begin
      For I:=1 to BolSay do BLKod[I]:='000000';
      WriteBolKod;
   end;
   With InT do begin
     OpenToRead('BOLKOD.DAT');
     N:=StrToInt(ReadText);
     For I:=1 to N do BLKod[I]:=ReadText;
     FKod:=Copy(BLKod[1],3,2);
     if not EOF(T) then SonOdemeTar:=ReadText;
     if not EOF(T) then begin S:=ReadText; OgrTip:=S[1]; end;
     if not EOF(T) then begin DonemYil:=StrToInt(ReadText); DonemYY:=StrToInt(ReadText); end;
     if not EOF(T) then OgrenimSuresi:=StrToInt(ReadText);
     if not EOF(T) then begin S:=ReadText; Val(S,Harc,J); end;
     if not EOF(T) then TransferTar:=ReadText;
     CloseFile;
   end;
   WriteBolKod;
end;
procedure WriteUniv;
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
Procedure ShowFak;
Var S : String;
    L, M : Byte;
begin
    SaveWinInfo;NormalWindow;
    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte; If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;
procedure NewOgr(SNo, SAd, BolKod:String; Var P : TDetailKayit);
 Var J,R : Integer; S:String;L:LongInt;
 begin
    With P do begin
      SetBlankZero(SNo);
      SNo:='00'+SNo;
      Move(SNo[1],OgrNo,10);
      Move(SAd[1],AdSoyAd,25);
      OgrTp:=OgrTip;
      Yabancimi:='H';
      Move(BolKod[3],BolumKodu[1],2);
      S:=Copy(BolKod,5,3);
      Val(S,J,R);
      BolumKodu[3]:=Char(64+J);
      Harclimi:='H';
      Move(Donem[1],Dnem,5);
      Move(SonOdemeTar[1],SonOdemeTr,10);
      ArtYil :=ArtikYil;
      L:=Harc;
      if ArtYil=1 then begin
         L:=L div 2;
         L:=Harc+L;
      end else if ArtYil > 1 then L:=2*L;
      Str(L:15,S);
      SetBlankZero(S);
      Move(S[1],Tutar,15);
      Iptalmi:='H';
    end;
 end;
procedure BolumOku(NBol : Integer);
Var I, Adres, Art, JJ : Integer;
    SI, SA,AA : String;
    P : TDetailKayit;
begin
  Bekleyiniz(Bolum.KodAd(NBol)+'OGREC˜LER˜N˜ OKUYORUM');
   If BLKod[NBol]='000000' then begin
      Complain('BOLšM KODU G˜R˜LMEM˜ž');
      closeWindow;
      exit
   end;
   with Ogr^ do begin
     DFile.CloseFile;
     FillChar(Ogr^.KodPtr^,(Ogr^.KeyL+2)*(Ogr^.MaxKay+1),#0);
     Say:=0;
     ActBol:=NBol;
     Open;
     ReadNdx;
     ShowBolYil;
     For I:=1 to Say do begin
           Adres:=GetAdr(I);
           DFile.GetRec(Adres, Is);
           SI:=GetIs;
           SA:=GetAd;
           SI:=Spaces(8)+SI;
           SI:=Copy(SI,Length(SI)-7,8);
           SA:=SA+Spaces(25);
           SA:=Copy(SA,1, 25);
           NewOgr(SI, SA, BLKod[NBol],P);
           Insert(P);
       end;
   end;
   CloseWindow;
end;

procedure Init;
Var I : Integer;
begin
  if initDone then exit;
  Count := 0;
  GetMem(Items, SizeOf(TItemList));
  For I:=1 to BolSay do BolumOku(I);
  initDone:=True;
end;

Procedure InitProg;
Var I : Integer;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  ReadUniv;
  FillChar(BLKod, SizeOf(BLKod),#0);
  For I:=1 to MaxBolum+1 do BLKod[I]:='000000';
  BolSay:=0;
  Bolum.init;
  Grad.Init;
  BolSay:=Bolum.NuKod;
  ReadBolKod;
  Ogr^.Open;
  InitDone :=False;
  YildanAra:=True;
end;
procedure Done;
Var I : Integer;
   procedure FreeItem(Item: Pointer);
   begin
      if Item <> nil then FreeMem(Item, SizeOf(TDetailKayit));
   end;
 begin
   if not initdone then exit;
   for I := 0 to Count - 1 do FreeItem(Items^[I]);
   FreeMem(Items, SizeOf(TItemList));
   Count := 0;
   InitDone:=False;
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  Ogr^.DFile.CloseFile;
  Dispose(Ogr,Done);
  Done;
  WriteBolKod;
  clrscr;
  Halt;
end;
Procedure BankBilgiYaz;
Var S : String; K,N : integer;
    NBol, I, Adres : Integer;
    P : PDetailKayit;
    X : TDetailKayitExpand;
    OutF:TextFile;
Begin
     init;
     OutF.OpenToWrite(FKod+'YAPI.TXT');
     K:=SizeOf(TDetailKayit);
     For I:=0 to Count-1 do begin
       S[0]:=Chr(K);
       Move(Items^[I]^,S[2],K-1);
       S[1]:='D';
       N:=Pos('/',S);
       while N<>0 do begin S[N]:='.';N:=Pos('/',S);end;
       OutF.WriteText(S);
     end;
     OutF.CloseFile;
end;



Procedure BolKodGir;
Var Ed  : Integer;

    TC : Char;
Procedure PrintSingleBolum(I : Integer);
begin
    WriteStr(Form.FieldKol[1],I, Bolum.KodAd(I), NormalAttr);
    WriteStr(Form.FieldKol[2],I, Copy(BLKod[I],3,2), NormalAttr);
    WriteStr(Form.FieldKol[3],I, Copy(BLKod[I],5,2), NormalAttr);
end;

Procedure PrintBolum;
Var I : Integer;
begin
    For I:=1 to Bolum.NuKod do PrintSingleBolum(I);
end;

Procedure GoDown;
begin
    IF (Ed >= Bolum.NuKod) THEN begin
      beep;
      exit
    end;
    Inc(Ed);
end;
Procedure GoUp;
begin
    IF Ed <= 1 THEN begin
       beep;
       exit
    end;
    Dec(Ed);
end;
Procedure ReadKod;
Var A, S : String;
    I : Integer;

begin
    repeat
      S:=Copy(BLKod[Ed],5,2); A:=S;
      InputStr(S,Form.FieldKol[3],Ed,2, True, AllKar, 0, TC);
      If TC<>NULL then Exit;
      S:=S+'  '; S[0]:=Chr(2);
      If S<>A then Done;
      If TC = NULL then begin
         if A = S then exit;
         BLKod[MaxBolum+1]:='00'+FKod+ S;
         I:=1;
         While Copy(BLKod[I],5,2)<>S do Inc(I);
         if I > MaxBolum then BEGIN
            Move(S[1],BLKod[Ed][5],2);
            exit
         end else complain('BU KOD ZATEN VAR');
    end;
   until TC<>NULL;
end;
procedure ReadFakKod;
Var CH : Char; I : Integer;
   EFKod : String;
begin
    OpenEditWindow('FAKšLTE KODU G˜R˜ž˜',
	'2@FAKšLTE KODU',
	'END:G˜R˜ž TAMAM',
         [EndKey],
         [],5, 2);
     EFKod:=FKod;
     repeat
         InputStr(FKod,Form.FieldKol[1],1,2, True, AllKar, 0, CH);
         FKod:=FKod+'  '; FKod[0]:=Chr(2);
         if EFKod<>FKod then Done;
    until CH=EndKey;
    CloseEdit;
    For I:=1 to Bolum.NuKod do Move(FKod[1],BLKod[I][3],2);
    PrintBolum;
end;

begin
    OpenEditWindow('B™LšM KODU G˜R˜ž˜',
	'30@B™LšM ADI@2@FAKšLTE KODU@2@B™LšM KODU',
	'F9:FAKšLTE KODU@END:G˜R˜ž TAMAM',
         [F9,EndKey, UPKEY, DOWNKEY],
         [],3, Bolum.NuKod);
   PrintBolum;
   Ed:=1;
   repeat
     PrintSingleBolum(Ed);
     ReadKod;
     Case TC of
         EndKey :begin CloseEdit;
                    Init;
                    exit
              end;
         F9 : ReadFakKod;
         UpKey : GoUp;
         DownKey : GoDown;
         NULL    : GoDown;
     end;
  until False;
end;

procedure FindFiles;
var
  F: SearchRec;
begin
  FlCount := 0;
  FindFirst('??ARTIK.DAT',  Archive, F);
  while (DosError = 0) and (FLCount <= 20) do
  begin
    Inc(FLCount);
    Dir[FLCount]:=F.Name;
    FindNext(F);
  end;
end;
Procedure DonemGir;
Var  TC : Char;
Procedure GetYil;
Var S : String;I,J:Integer;
begin
     If TC <> NULL then exit;
    Str(DonemYil:4,S);
    InputStr(S,Form.FieldKol[1],1,4,True,['0'..'9'],4,TC);
    Strip(S);
    if Length(S)<>4 then
       complain('YANLIž YIL G˜R˜ž˜')
    else begin
       Val(S,I,J);
       if I<>DonemYil then Done;
       DonemYil:=I;
    end;
end;

Procedure GetYY;
Var S : String;I,R:Integer;
begin
    If TC <> NULL then exit;
    Str(DonemYY:1,S);
    InputStr(S,Form.FieldKol[2],1,1,True,['1','2'],1,TC);
    Val(S,I,R);
    if I<>DonemYY then Done;
    DonemYY:=I;
end;
procedure GetTar;
Var S : String;R:Integer;
begin
    If TC <> NULL then exit;
    S:=SonOdemeTar;
    GetTarih(Form.FieldKol[3],1,S, TC);
    If S<>SonOdemeTar then Done;
    SonOdemeTar:=S
end;
Procedure GetOgrTip;
Var S : String;R:Integer;
begin
    If TC <> NULL then exit;
    S:=OgrTip;
    InputStr(S,Form.FieldKol[4],1,1,True,['0','1','2'],1,TC);
    if S[1]<>OgrTip then Done;
    OgrTip:=S[1];
end;
Procedure GetHarc;
Var S : String;L : LongInt; R:Integer;
begin
    If TC <> NULL then exit;
    Str(Harc:15,S);
    InputStr(S,Form.FieldKol[5],1,15,True,['0'..'9'],6,TC);
    Strip(S);
    Val(S,L,R);
    if L<>Harc then Done;
    Harc:=L
end;
Procedure GetOgrenimSuresi;
Var S : String;I,R:Integer;
begin
    If TC <> NULL then exit;
    Str(OgrenimSuresi:1,S);
    InputStr(S,Form.FieldKol[6],1,1,True,['0'..'9'],6,TC);
    Strip(S);
    Val(S,I,R);
    if I<>OgrenimSuresi then Done;
    OgrenimSuresi:=I;
end;

Procedure ShowStat;
begin
     if YildanAra then
      WriteStr(Form.FieldKol[7],1,'G˜R˜ž YILINA GORE',HiliteAttr)
     else
      WriteStr(Form.FieldKol[7],1,'HAZIRLI¦A GORE   ',HiliteAttr);
end;
procedure ShowAll;
Var S : String;
begin
     Str(DonemYil:4,S);
     WriteStr(Form.FieldKol[1],1,S,NormalAttr);
     Str(DonemYY:1,S);
     WriteStr(Form.FieldKol[2],1,S,NormalAttr);
     WriteStr(Form.FieldKol[3],1,SonOdemeTar,NormalAttr);
     S:=OgrTip;
     WriteStr(Form.FieldKol[4],1,S,NormalAttr);
     Str(Harc:15,S);
     WriteStr(Form.FieldKol[5],1,S,NormalAttr);
     Str(OgrenimSuresi:1,S);
     WriteStr(Form.FieldKol[6],1,S,NormalAttr);
end;
var A : string;
begin
  OpenEditWindow('™¦REN˜M HARCI D™NEM˜ ˜LE ˜LG˜L˜ B˜LG˜LER˜ G˜R˜N˜Z',
		 '4@YIL@3@DONEM@10@™DEME TAR.@1@T˜P@15@HAR€ M˜KTARI@1@O¦R. SšRES˜@18@ARTIK YIL ARAMA',
		 'F9: YIL TARAMA@END:G˜R@™¦R. T˜P˜=@0: NORMAL@1 : KONSERVATUAR@2: 2.™¦R',[EndKey, F9],[],10,1);

  ShowCursor;
  ClrScr;
  ShowAll;
  TC:=NULL;
  Repeat
     ShowStat;
     GetYil;
     GetYY;
     GetTar;
     GetOgrTip;
     GetHarc;
     GetOgrenimSuresi;
     case TC of
	EndKey : begin
                   Str(DonemYil:4,A); Donem:=Copy(A,3,2);
                   inc(DonemYil);
                   Str(DonemYil: 4, A );
                   Donem:=Donem+Copy(A,3,2);
                   Str(DonemYY:1,A); Donem:=Donem+A;
                   Dec(DonemYil);
                  end;
	F9    :begin YildanAra:=not YildanAra; Done; TC:=NULL end;
     end;
  until TC=EndKey;
  CloseEdit;
end;



Function GirisYili:Integer;
Var CH : Char; I, J : Integer;
     S : String;
begin
    with Ogr^ do begin
       S:=GetIs;
       Strip(S);
       S:=Copy(S,1,2);
       Val(S,I,J);
       GirisYili:=I;
    end;
end;
Function ArtikYil:Integer;
Var CH : Char; I, J: Integer;
     Yer : Word;
     B : Boolean;
     S : String;
function Max(A, B : Integer):Integer;
begin
  Max:=A;
  If B > A then Max:=B;
end;
begin
 I:=GirisYili+1900;
 J:=DonemYil-I+1;
 ArtikYil:=Max(0,J-OgrenimSuresi);
 B:=Grad.Search('TK', Yer);
 if YildanAra or (not B) then exit;
 With Ogr^ do begin
      if (HazNot <> Yer) and (YYCount<>0) then begin
          I:=Donem[1].YL;
          J:=DonemYil-I+1;
          ArtikYil:=Max(0,J-OgrenimSuresi);
      end;
 end;
end;


procedure BankBirlestir;
 const MaxTotLen=15;
Var InT1, InT2, CikT : TextFile;
    L,I, Say : Integer;
    Total : String;
    A, B : String;
    ABitti, BBitti : Boolean;
    Extension : String;
procedure Topla(Var A, B : String); {A:=A+B}
Var I, Elde, X, Y : integer;
begin
    Elde:=0;
    For I:=MaxTotLen downto 1 do begin
        X:=Ord(A[I])-48;
        Y:=Ord(B[I])-48;
        X:=X+Y+Elde;
        Elde:= X div 10;
        X:= X Mod 10;
        A[I]:=Chr(X+48);
    end;
end;
procedure FindBankFiles;
var
  F: SearchRec;
begin
  FlCount := 0;
  FindFirst('??YAPI.TXT',  Archive, F);
  while (DosError = 0) and (FLCount <= 20) do
  begin
    Inc(FLCount);
    Dir[FLCount]:=F.Name;
    FindNext(F);
  end;
end;
procedure IncExt;
Var M,N : integer;
begin
  Val(Extension,M,N);
  Inc(M);
  Str(M:3,Extension);
  SetBlankZero(Extension);
end;
procedure Merge;
begin
      BBitti:=Eof(InT2.T);
      ABitti:=Eof(InT1.T);
      If Abitti then A:='Dzzzzzzzzzz' else A:=InT1.ReadText;
      if BBitti then B:='Dzzzzzzzzzz' else B:=InT2.ReadText;
      while not ((ABitti) and (BBitti))  do begin
        If A>B then begin
           CikT.WriteText(B);
           BBitti:=Eof(InT2.T);
           if BBitti then B:='Dzzzzzzzzzz' else B:=InT2.ReadText;
        end
        else if A<=B then begin
           CikT.WriteText(A);
           ABitti:=Eof(InT1.T);
           If Abitti then A:='Dzzzzzzzzzz' else A:=InT1.ReadText;
        end;
      end;
end;
begin
    FindBankFiles;
    If FLCount = 0 then begin
       complain('D˜SKTE BANKA DOSYALARI YOK');
       exit
    end;
   Bekleyiniz('BANKA DOSYALARINI D˜SKE B˜RLEžT˜R˜YORUM');
   Extension :='000';
   CikT.OpenToWrite('YAPI.000');
   CikT.CloseFile;
   For I:=1 to FLCount do begin
      InT1.OpenToRead(Dir[I]);
      InT2.OpenToRead('YAPI.'+Extension);
      IncExt;
      CikT.OpenToWrite('YAPI.'+Extension);
      Merge;
      InT1.CloseFile;
      InT2.CloseFile;
      CikT.CloseFile;
   end;
   InT2.OpenToRead('YAPI.'+Extension);
   CikT.OpenToWrite('YAPI.TXT');
   CikT.WriteText('H01.01.1997001'+Spaces(59));
   Total:='000000000000000';
   Say:=0;
   while not Eof(InT2.T) do begin
          A:=InT2.ReadText;
          CikT.WriteText(A);
          Inc(Say);
          L:=Length(A);
          A:=Copy(A,L-MaxTotLen,MaxTotLen);
          Topla(Total, A);
     end;
     A:='F';
     Str(Say:10,B); SetBlankZero(B);A:=A+B+Total+Spaces(47);
     CikT.WriteText(A);
     CikT.CloseFile;
     InT2.CloseFile;
     Extension:='000';
     For I:=1 to FLCount do begin
        EraseFile('YAPI.'+Extension);
        IncExt;
     end;
 CloseWindow;
end;

procedure TransferTarGir;
Var  TC : Char;
     P : TDetailKayit;
begin
  OpenEditWindow('HARC B˜LG˜LER˜N˜N BANKAYA TRANSFER TAR˜H˜N˜ G˜R˜N˜Z',
		 '40@TRANSFER TAR˜H˜',
		 'END:G˜R˜ž',[EndKey],[],10,1);
  ShowCursor;
  ClrScr;
  TC:=NULL;
  Repeat
     GetTarih(15, 1, TransferTar,TC);
  until TC=EndKey;
  CloseEdit;
end;
begin
   FKod:='00';
end.
procedure EditArtik;
Var L, I, H, T : Word;
    Stop : Boolean;
    TC   : Char;
    Ed, EdRow, Bas, Son  : integer;
Procedure PrintLine(I : integer);
Var S : String;
    TC : Char;
begin
  P:=Items^[I]^;
  with P do begin
      WriteStr(Form.FieldKol[1],EdRow,OgrNo, NormalAttr);
      WriteStr(Form.FieldKol[2],EdRow,AdSoyAd,NormalAttr);
      Str(ArtYil:2,S);
      WriteStr(Form.FieldKol[3],EdRow,S,NormalAttr);
      WriteStr(Form.FieldKol[4],EdRow,Tutar,NormalAttr);
  end;
end;
Procedure EditArtYil;
Var S : String;I,J:Integer;

begin
    If TC <> NULL then exit;
    Str(ArtYil:2,S);
    InputStr(S,Form.FieldKol[3],EdRow,2,True,['0'..'9'],2,TC);
    Strip(S);
    Val(S,I,J);
    ArtYil:=I;
end;
Procedure EditTutar;
Var S : String;L : LongInt; J:Integer;

begin
    If TC <> NULL then exit;
    Val(Tutar,L,J);
    Str(L,S);
    InputStr(S,Form.FieldKol[4],EdRow,10,True,['0'..'9'],10,TC);
    Val(S,L,J);
    Str(L:15,S);
    SetBlankZero(S);
    Move(S[1],Tutar,15);
end;

Procedure Reprint(T : Word);
Var I , H, L, M : Word;
begin
     ClrScr;
     H := T + Hi(WindMax) - Hi(WindMin);
     If H > SON then H :=SON;
     L:=Ed; M:=EdRow; Ed:=T; Edrow:=1;
     For I:= T to H do begin
	 PrintLine(I);
	 Inc(Ed);
         Inc(EdRow)
     end;
     Ed:=T;
     EdRow:=1;
end;
Function Select.BaslaKod:Word;
Var
     S            : String;
     TC           : Char;
     Adres        : integer;
     Flag         : Boolean;
     B            : Word;
begin
    Str(KeyL,S);
    BaslaKod:=0;
    OpenEditWindow('KOD G˜R', '10@KOD','ESC : VAZGE€',[ESC],[],10, 1);
    S := '';
    InputStr(S, 1,1, 10, True, ALLKAR, 0, TC);
    If TC = NULL then Begin
	Flag:=Search(S,Adres);
	If Adres > Count then Adres:= Count;
	BaslaKod:=Adres;
   end;
   CloseEdit;
end;
Procedure BilgiYaz;
Var S : String; K : integer;
    NBol, I, Adres : Integer;
    OutF:TextFile;
Begin
     OutF.OpenToWrite(FKod+'YAPI.TXT');
     K:=SizeOf(TDetailKayit);
     For I:=0 to Count-1 do begin
       S[0]:=Chr(K);
       Move(Items^[I]^,S[2],K-1);
       S[1]:='D';
       OutF.WriteText(S);
     end;
     OutF.CloseFile;
end;
begin

      if count=0 then begin
         Complain('HENšZ ™¦RENC˜LER OKUNMAMAIž');
         Exit;
      end;
      OpenEditWindow('™¦RENC˜ ARTIK YIL G˜R˜ž˜ HAR€ DENET˜M˜',
                 '10@™GR.NO@25AD@2@ARTIK YIL@15@HARC',
	       'F10:KOD BAžLA@END:DE¦˜ž˜KL˜KLER˜ ˜žLE@ESC:˜PTAL',
	       [F10, ENDKEY, ESC, UPKEY, DOWNKEY],[],3, Count);
      Bas:=1; Son:=Count;
      Ed:=1; EdRow:=1;
      ClrScr;
      Reprint(1);
      Stop:=False;
      TC:=NULL;
      Repeat
         PrintLine(Ed);
         EditArtYil;
         EDitTutar;
         case TC of
           UPKEY   : CursorUp;
	   DOWNKEY : CursorDown;
	   ESC     : Stop:=True;
  	   F10     : begin
		        T:=BaslaKod;
		        If (Bas<=T) and (T<=Son) then RePrint(T);
		     end;
	   ENDKEY   : begin
                        BilgiYaz;
 		        Stop:=True;
		      end;
	  end;{Case}
          TC:=NULL;
  Until Stop;
  ShowCursor; CloseEdit;
  end;

TDetailKayit=record
      OgrNo : Char10;
      AdSoyAd:Char25;
      OgrTp:Char;
      Yabancimi:Char;
      BolumKodu:Char3;
      Harclimi:Char;
      Dnem:Char5;
      SonOdemeTr:Char10;
      Tutar:Char15;
      Iptalmi:Char;
      ArtYil :Byte;
   end;
   procedure  OgrAl(Var X : TDetailKayitExpand;Index: Integer);
Var P : PDetailKayit; AA : String; JJ:Integer;
 begin
    P:=Items^[Index];
    FillChar(X,SizeOf(X),#32);
    X.OgrNo[0]:=Chr(10);
    Move( P^,X.OgrNo[1],10);
    X.OgrAd[0]:=Chr(25);
    Move(P^.AdSoyAd, X.OgrAd[1],25);
    X.BolKod[0]:=Chr(3);
    Move(P^.BolumKodu,X.BolKod[1],3);
    X.Tutar[0]:=Char(15);
    Move(P^.Tutar, X.Tutar[1],15);
    X.ArtYil:=P^.ArtYil
 end;