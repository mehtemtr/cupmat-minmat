unit Artikobj;
interface
uses Crt, Dos, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist;
const OgrenimSuresi:Integer=4;
type

   TBolArr = Array[1..MaxBolum+1] of String[6];
   POgr = ^TOgr;
   TOgr = array[0..39] of Char;

   PItemList = ^TItemList;
   TItemList = array[0..3000] of POgr;
   TOgrExpand = Record
      OgrNo  : String[9];
      OgrAd  : String[30];
      BolKod : String[6];
      ArtYil : Integer;
    end;
Var BLKod : TBolArr;
    BolSay : Integer;
    ARTIKT  : TextFile;
    Items: PItemList;
    Count: Integer;
    FKod: String;
    Dir      : array[1..20] of String[12];
    FlCount  : Integer;
    InitDone : Boolean;
    BuYil : Integer;
    YildanAra : Boolean;

Procedure InitProg;

Procedure QuitProg;
procedure WriteUniv;
Procedure ReadUniv;

procedure WriteBolKod;
Procedure ReadBolKod;
Procedure ShowFak;

Procedure WriteOgrInfo;
Procedure BolKodGir;
procedure Birlestir;

procedure  OgrAl(Var X : TOgrExpand;Index: Integer);
Function   NewOgr(SNo, SAd, BolKod:String):POgr;
procedure  Insert(Item: POgr);
function   KeyOf(Item: POgr): String;
function   Search(Key :String; var Index: Integer): Boolean;

procedure FindFiles;

procedure BuYilGir;
Function  ArtikYil:Integer;
implementation

procedure Insert(Item: POgr);
Var I, Index : Integer;
begin
       if Search(KeyOf(Item), Index) then begin
          FreeMem(Item,SizeOf(TOgr));
          exit;
       end;
       inc(Count);
       For I:=Count -1 downto Index + 1 do Items^[I]:=Items^[I-1];
       Items^[Index]:=Item
end;
function Search(Key :String; var Index: Integer): Boolean;
var
  L, H, I, C: Integer;
procedure Compare;
begin
    C:=0;
    If KeyOf(items^[I]) > Key then C:=1
       else if KeyOf(Items^[I]) < Key then C:=-1;
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
procedure  OgrAl(Var X : TOgrExpand;Index: Integer);
Var P : POgr; AA : String; JJ:Integer;
 begin
    P:=Items^[Index];
    with X do begin
       FillChar(X,SizeOf(X),#32);
       OgrNo[0]:=Chr(9);
       Move( P^,OgrNo[2],8); OgrNo[1]:='0';
       OgrAd[0]:=Chr(30);
       Move(P^[8], OgrAd[1],25);
       BolKod[0]:=Chr(6);
       FillChar(BolKod[1],6,'0');
       Move(P^[33],BolKod[3],4);
       AA:='000';
       Move(P^[37], AA[1],3);
       For JJ:=1 to 3 do if AA[jj]=' ' then aa[jj]:='0';
       Val(AA,X.ArtYil,jj);
    end;
 end;
 Function  NewOgr(SNo, SAd, BolKod:String):POgr;
 Var P : POgr; J : Integer;
 begin
    GetMem(P, SizeOf(TOgr));
    SNo:='00000000'+SNo;
    SNo:=Copy(SNo, Length(SNo)-7,8);
    for j:=1 to 8 do if SNo[j]=' ' then SNo[j]:='0';
    Move(SNo[1],P^[0],8);
    SAd:=SAd+'                         ';
    SAd:=Copy(SAd, 1, 25);
    Move(SAd[1],P^[8],25);
    Move(BolKod[3],P^[33],4);
    NewOgr:=P;
 end;
function  KeyOf(Item: POgr): String;
Var S : String;
begin
   S[0]:=Chr(8);
   Move( Item^,S[1],8);
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
     CloseFile;
   end;
end;
Procedure ReadBolKod;
Var T : TextFile;
    N, I, J : Integer;
begin
   If not Exists('BOLKOD.DAT') then begin
      For I:=1 to BolSay do BLKod[I]:='000000';
      WriteBolKod;
   end;
   With T do begin
     OpenToRead('BOLKOD.DAT');
     N:=StrToInt(ReadText);
     For I:=1 to N do BLKod[I]:=ReadText;
     if BolSay>N then begin
        for J:=N+1 to BolSay do BLKod[I]:='000000';
        WriteBolKod;
     end;
     CloseFile;
   end;
   FKod:=Copy(BLKod[1],3,2);
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

procedure BolumOku(Nbol : Integer);
Var I, Adres, Art, JJ : Integer;
    SI, SA,AA : String;
    P : POgr;
begin
  Bekleyiniz(Bolum.KodAd(NBol)+'OGREC˜LER˜N˜ OKUYORUM');
   If BLKod[NBol]='000000' then begin
      Complain('BOLšM KODU G˜R˜LMEM˜ž');
      closeWindow;
      exit
   end;
   with Ogr do begin
     FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
     Say:=0;
     ActBol:=NBol;
     Open;
     ReadNdx;
     For I:=1 to Say do begin
           Adres:=GetAdr(I);
           DFile.GetRec(Adres, Is);
           SI:=GetIs; SA:=GetAd;
           SI:=Spaces(8)+SI;
           SI:=Copy(SI,Length(SI)-7,8);
           SA:=SA+Spaces(25);
           SA:=Copy(SA,1, 25);
           Art:=ArtikYil;
           P:=NewOgr(SI, SA, BLKod[NBol]);
           Str(Art:3, AA);
           Move(AA[1],P^[37],3);
           Insert(P);
       end;
     DFile.CloseFile;
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
  Ogr.Init;
  InitDone :=False;
  BuYil:=1995;
  YildanAra:=True;
end;
procedure Done;
Var I : Integer;
procedure FreeItem(Item: Pointer);
begin
  if Item <> nil then FreeMem(Item, SizeOf(TOgr));
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
  Done;
  WriteBolKod;
  clrscr;
  Halt;
end;

Procedure WriteOgrInfo;
Var SI, SA : String;
    NBol, I, Adres : Integer;
    P : POgr;
    X : TOgrExpand;
Begin
     init;
     ARTIKT.OpenToWrite(FKod+'ARTIK.DAT');
     For I:=0 to Count-1 do begin
         OgrAl(X,I);
         Str(X.ArtYil:3,SI);
         With X do ARTIKT.WriteText(OgrNo+OgrAd+BolKod+SI);
     end;
     ARTIKT.CloseFile;
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
procedure Birlestir;
Var InT1, InT2, CikT : TextFile;
    I : Integer;
    A, B : String;
    ABitti, BBitti : Boolean;
begin
    FindFiles;
    If FLCount = 0 then begin
       complain('D˜SKTE ARTIK YILLAR DOSYASI YOK');
       exit
    end;
    CopyFile(Dir[1],'ARTIK.DAT');
    if FLCount = 1 then exit;
   Bekleyiniz('DOSYALARI D˜SKETE B˜RLEžT˜R˜YORUM');
   For I:=2 to FLCount do begin
      InT1.OpenToRead(Dir[I]);
      InT2.OpenToRead('ARTIK.DAT');
      CikT.OpenToWrite('ART.$$$');
      BBitti:=Eof(InT2.T);ABitti:=Eof(InT1.T);
      If Abitti then A:='zzzzzzzzz' else A:=InT1.ReadText;
      if BBitti then B:='zzzzzzzzz' else B:=InT2.ReadText;
      while not ((ABitti) and (BBitti))  do begin
        If A>B then begin
           CikT.WriteText(B);
           BBitti:=Eof(InT2.T);
           if BBitti then B:='zzzzzzzzz' else B:=InT2.ReadText;
        end
        else if A<B then begin
           CikT.WriteText(A);
           ABitti:=Eof(InT1.T);
           If Abitti then A:='zzzzzzzzz' else A:=InT1.ReadText;
        end;
      end;
     InT1.CloseFile; InT2.CloseFile; CikT.CLoseFile;
     EraseFile('ARTIK.DAT');
     RenameFile('ART.$$$','ARTIK.DAT');
 end;
 CloseWindow;
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

Procedure BuYilGir;
Var CH : Char; I,J : Integer; S : String;
Procedure ShowStat;
begin
     if YildanAra then
      WriteStr(Form.FieldKol[3],1,'G˜R˜ž YILINA GORE',HiliteAttr)
     else
      WriteStr(Form.FieldKol[3],1,'HAZIRLI¦A GORE   ',HiliteAttr);
     Str(BuYil:4,S);
     WriteStr(Form.FieldKol[1],1,S,NormalAttr);
     Str(OgrenimSuresi:1,S);
     WriteStr(Form.FieldKol[2],1,S,NormalAttr);
end;
procedure  OgrenimSuresiGir;
begin
  if CH<>NULL then exit;
  Str(OgrenimSuresi:1,S);
  InputStr(S,Form.FieldKol[2],1,1, True, ['0'..'9'], 1, CH);
  Val(S,I,J);
  if I<>OgrenimSuresi then Done;
  OgrenimSuresi:=I;
end;
procedure YilGir;
begin
  Str(BuYil,S);
  InputStr(S,Form.FieldKol[1],1,4, True, ['0'..'9'], 4, CH);
  if Length(S)<>4 then
     complain('YANLIž YIL G˜R˜ž˜')
  else begin
     Val(S,I,J);
     if I<>BuYil then Done;
     BuYil:=I;
 end;
end;

begin
    OpenEditWindow('BU YIL G˜R˜ž˜',
	'4@BUYIL@1@O¦REN˜M SšRES˜@18@ARTIK YIL ARAMA',
	'F9: YIL TARAMA DE¦˜ž@END:G˜R˜ž TAMAM',
         [F9,EndKey],
         [],5, 2);
     repeat
         ShowStat;
         YilGir;
         OgrenimSuresiGir;
         if CH=F9 then YildanAra:=Not YildanAra
    until CH=EndKey;
    CloseEdit;
end;


Function GirisYili:Integer;
Var CH : Char; I, J : Integer;
     S : String;
begin
    with Ogr do begin
       S:=GetIs;
       Strip(S);
       S:=Copy(S,1,2);
       Val(S,I,J);
       GirisYili:=I;
    end;
end;
Function ArtikYil:Integer;
Var CH : Char; I, J: Integer; Yer : Word;
     S : String;
function Max(A, B : Integer):Integer;
begin
  Max:=A;
  If B > A then Max:=B;
end;
begin
 with Ogr Do Begin
    I:=GirisYili+1900;J:=BuYil-I;
    If (not YildanAra) and
       Grad.Search('TK', Yer) and
       (HazNot <> Yer) and
       (YYCount<>0) then
          J:=Max(0,BuYil-Donem[1].YL);
 end;
 ArtikYil:=J-OgrenimSuresi;
end;


begin
   FKod:='00';
end.

