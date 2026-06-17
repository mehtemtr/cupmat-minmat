Unit Banka;
Interface
uses Crt, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist;
const SonOgr:String = 'zzzzzzzzz';
type

   TBol = Record
      BolKod : String[6];
      OgrSay : Integer;
   end;
   TBolArr = Array[1..MaxBolum+1] of TBol;

Var BolInfo : TBolArr;
    BolSay  : Integer;
    BankT   : TextFile;
    SonBolum : Boolean;



Procedure InitProg;

Procedure QuitProg;
procedure WriteUniv;
Procedure ReadUniv;

procedure WriteBolKod;
Procedure ReadBolKod;
Procedure ShowBol;

procedure BolDegis(K : Integer);
Procedure WriteOgrInfo;
Procedure BolKodGir;
procedure Merge;
procedure Birlestir;
Implementation

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
       For J:=1 to 1 do BolInfo[I].BolKod[J]:='0';
       WriteText(BolInfo[I].BolKod);
     end;
     CloseFile;
   end;
end;
Procedure ReadBolKod;
Var T : TextFile;
    N, I : Integer;
begin
   If not Exists('BOLKOD.DAT') then WriteBolKod;
   With T do begin
     OpenToRead('BOLKOD.DAT');
     N:=StrToInt(ReadText);
     For I:=1 to N do BolInfo[I].BolKod:=ReadText;
     if N<>BolSay then WriteBolKod;
     CloseFile;
   end;
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
Procedure ShowBol;
Var S : String;
    L, M : Byte;
begin
    SaveWinInfo;NormalWindow;
    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte; If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    M:=L+6;
    S:= Bolum.KodAd(ActBol);
    If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(M,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;
Procedure InitProg;
Var I : Integer;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  ReadUniv;
  FillChar(BolInfo, SizeOf(BolInfo),#0);
  For I:=1 to MaxBolum+1 do BolInfo[I].BolKod:='000000';
  BolSay:=0;
  Bolum.init;
  BolSay:=Bolum.NuKod;
  ReadBolKod;
  Ogr.Init; Ogr.Open;
  ShowBol;
end;

Procedure QuitProg;
Var I, J : Integer;
begin
  While EDSP<>0 do CloseEdit;
  WriteBolKod;
  Ogr.DFile.CloseFile;
  Ogr.done;
  clrscr;
  Halt;
end;
procedure BolDegis(K : Integer);
begin
   with Ogr do begin
     DFile.CloseFile;
     FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
     Say:=0;
     ActBol:=K;
     Open;
     ReadNdx;
     ShowBol;
   end;
end;
Procedure WriteOgrInfo;
Var SI, SA : String;
    NBol, I, Adres : Integer;
Begin
  Bekleyiniz('BANKA B˜LG˜LER˜ YAZILIYOR');
  BankT.OpenToWrite('BANK.DAT');
  BankT.WriteText(SonOgr);
  BankT.CloseFile;
For NBol:=1 to BolSay do begin
   If BolInfo[NBol].BolKod='000000' then
      Complain('BOLšM KODU G˜R˜LMEM˜ž')
   else begin
       BolDegis(NBol);
       SonBolum:=(NBol=BolSay);
       BankT.OpenToWrite('BAN.$$$');
       With BolInfo[NBol] do begin
          OgrSay:=0;
          With Ogr do begin
             For I:=1 to Say do begin
                 Adres:=GetAdr(I);
                 DFile.GetRec(Adres, Is);
                 SI:=GetIs; SA:=GetAd;
                 SI:=Spaces(9)+SI; SI:=Copy(SI,Length(SI)-8,9);
                 SA:=SA+Spaces(30);
                 SA:=Copy(SA,1, 30);
                 Inc(OgrSay);
                 BankT.WriteText(SI+SA+BolKod);
             end;
          end;
       end;
       if SonBolum then begin
          BankT.CloseFile;
          RenameFile('BAN.$$$', 'BANK.DAT');
       end else begin
          SI:=SonOgr;
          BankT.WriteText(SI);
          BankT.CloseFile;
          Merge;
       end;
   end;
end;

CloseWindow;
end;
Procedure BolKodGir;
Var Ed  : Integer;
    FKod: String;
    TC : Char;
Procedure PrintSingleBolum(I : Integer);
begin
    WriteStr(Form.FieldKol[1],I, Bolum.KodAd(I), NormalAttr);
    WriteStr(Form.FieldKol[2],I, Copy(BolInfo[I].BolKod,3,2), NormalAttr);
    WriteStr(Form.FieldKol[3],I, Copy(BolInfo[I].BolKod,5,2), NormalAttr);
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
Var S : String;
    I : Integer;
begin
    repeat
      S:=Copy(BolInfo[Ed].BolKod,5,2);
      InputStr(S,Form.FieldKol[3],Ed,2, True, AllKar, 0, TC);
      If TC<>NULL then Exit;
      S:=S+'  '; S[0]:=Chr(2);
      If TC = NULL then begin
         BolInfo[MaxBolum+1].BolKod:='0000'+S;
         I:=1;
         While Copy(BolInfo[I].BolKod,5,2)<>S do Inc(I);
         if I > MaxBolum then BEGIN
            Move(S[1],BolInfo[Ed].BolKod[5],2);
            exit
         end else complain('BU KOD ZATEN VAR');
    end;
   until TC<>NULL;
end;
procedure ReadFakKod;
Var CH : Char; I : Integer;
begin
    OpenEditWindow('FAKšLTE KODU G˜R˜ž˜',
	'2@FAKšLTE KODU',
	'END:G˜R˜ž TAMAM',
         [EndKey],
         [],5, 2);
     repeat
         InputStr(FKod,Form.FieldKol[1],1,2, True, AllKar, 0, CH);
         FKod:=FKod+'  '; FKod[0]:=Chr(2);
     until CH=EndKey;
     CloseEdit;
    For I:=1 to Bolum.NuKod do Move(FKod[1],BolInfo[I].BolKod[3],2);
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
                    WriteBolKod;
                    exit
              end;
         F9 : ReadFakKod;
         UpKey : GoUp;
         DownKey : GoDown;
         NULL    : GoDown;
     end;
  until False;
end;
procedure Merge;
Var InT1, InT2, CikT : TextFile;
    I, J : Integer;
    A, B : String;
procedure SonOgrSil;
begin
 If not Exists('BANK.DAT') then exit;
 InT1.OpenToRead('BANK.DAT');
 CikT.OpenToWrite('BANK.$$2');
 A:=InT1.ReadText;
 while A<>SonOgr do CikT.WriteText(A);
 InT1.CloseFile; CikT.CLoseFile;
 EraseFile('BANK.DAT');
 RenameFile('BANK.$$2','BANK.DAT');
end;
begin
   InT1.OpenToRead('BAN.$$$');
   InT2.OpenToRead('BANK.DAT');
   CikT.OpenToWrite('BANK.$$2');
   A:=InT1.ReadText; B:=InT2.ReadText;
   repeat
      If A>B then begin
         CikT.WriteText(B);
         if (Copy(B,1,9) <> SonOgr) then B:=InT2.ReadText;
      end
      else begin
         CikT.WriteText(A);
         if (Copy(A,1,9) <> SonOgr) then A:=InT1.ReadText;
      end;
   until (Copy(A,1,9) = SonOgr) and (Copy(B,1,9) = SonOgr);
   CikT.CLoseFile;
   InT1.CloseFile;
   InT2.CloseFile;
   EraseFile('BANK.DAT');
   RenameFile('BANK.$$2','BANK.DAT');
   EraseFile('BAN.$$$');
   if SonBolum then SonOgrSil;
   CloseWindow;
end;

procedure Birlestir;
Var InT1, InT2, CikT : TextFile;
    I, J : Integer;
    A, B : String;
    ABitti, BBitti : Boolean;
begin
    If not Exists('BANK.DAT') then begin
      Complain('D˜SKTE BANKA DOSYASI YOK');
      exit
    end;
    If not DisketTak('BANKA D˜SKET SšRšCšSš') then exit;
    If not Exists(Drive+'BANK.DAT') then begin
      Complain('D˜SKETTE BANKA DOSYASI YOK');
      exit
    end;
   Bekleyiniz('DOSYALARI D˜SKETE B˜RLEžT˜R˜YORUM');
   InT1.OpenToRead('BANK.DAT');
   InT2.OpenToRead(Drive+'BANK.DAT');
   CikT.OpenToWrite(Drive+'BAN.$$$');
   A:=InT1.ReadText; B:=InT2.ReadText;
   ABitti:=False;
   BBitti:=False;
   repeat
      If A>B then begin
         CikT.WriteText(B);
         BBitti:=Eof(InT2.T);
         if Not BBitti then B:=InT2.ReadText;
      end
      else begin
         CikT.WriteText(A);
         ABitti:=Eof(InT1.T);
         if Not ABitti then A:=InT1.ReadText;
      end;
   until ABitti or BBitti;
   if ABitti then begin
      repeat
         CikT.WriteText(B);
         if not Eof(InT2.T) then B:=InT2.ReadText;
      until Eof(InT2.T);
    end else begin
      repeat
         CikT.WriteText(A);
         if not Eof(InT1.T) then A:=InT1.ReadText;
      until Eof(InT1.T);
    end;
    InT1.CloseFile; InT2.CloseFile; CikT.CLoseFile;
     EraseFile(Drive+'BANK.DAT');
     RenameFile(Drive+'BAN.$$$',Drive+'BANK.DAT');
     CloseWindow;
end;

begin
end.

