Unit Bank;
Interface
uses Crt, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist;

type


   POgrenci=^TOgrenci;
   TOgrenci = record
       OgrNo:String[9];
       OgrAd:String[30];
   end;

   POgrArr = ^TOgrArr;
   TOgrArr = Array[1..MaxOgr] of POgrenci;

   TBol = Record
      BolKod : String[6];
      OgrArr : POgrArr;
      OgrSay : Integer;
   end;
   TBolArr = Array[1..MaxBolum] of TBol;

Var BolInfo : TBolArr;
    BolSay  : Integer;
    BankT   : TextFile;



Procedure InitProg;

Procedure QuitProg;
procedure WriteUniv;
Procedure ReadUniv;

procedure WriteBolKod;
Procedure ReadBolKod;
Procedure ShowBol;

procedure BolDegis(K : Integer);

Procedure GetOgrInfo(Adres : Integer; Var SI, SA : String);
Implementation


procedure WriteBolKod;
Var T : TextFile;
    I : Integer;
    S : String;
begin
   With T do begin
     OpenToWrite('BOLKOD.DAT');
     Str(BolSay,S);
     WriteText(S);
     For I:=1 to BolSay do WriteText(BolInfo[I].BolKod);
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
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  ReadUniv;
  FillChar(BolInfo, SizeOf(BolInfo),#0);
  BolSay:=0;
  Bolum.init;
  BolSay:=Bolum.NuKod;
  ReadBolKod;
  Ogr.Init;  Ogr.Open;
  ShowBol;
end;

Procedure QuitProg;
Var I, J : Integer;

begin
  While EDSP<>0 do CloseEdit;
  WriteBolKod;
  For I:=1 to BolSay do begin
    with BolInfo[I] do begin
      If OgrSay<>0 then begin
         For J:=1 to OgrSay do FreeMem(OgrArr^[J], SizeOf(TOgrenci));
         FreeMem(OgrArr,SizeOf(TOgrArr));
      end;
    end;
  end;
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
Procedure WriteBolInfo(NBol:Integer);
Var SI, SA : String;
    I, Adres : Integer;
Begin
   With BolInfo[NBol] do begin
     OgrSay:=0; OgrArr:=nil;
     With Ogr do begin
        if Say=0 then exit;
        For I:=1 to Say do begin
           Adres:=GetAdr(I);
           DFile.GetRec(Adres, Is);
           SI:=GetIs; SA:=GetAd;
           SI:=Spaces(9)+SI; SI:=Copy(SI,Length(SI)-8,9);
           SA:=SA+Spaces(30);
           SA:=Copy(Sa,1, 30);
           Inc(OgrSay);
           GetMem(OgrArr^[OgrSay], SizeOf(TOgrenci));


     POgrenci=^TOgrenci;
   TOgrenci = record
       OgrNo:String[9];
       OgrAd:String[30];
   end;

   POgrArr = ^TOgrArr;
   TOgrArr = Array[1..MaxOgr] of POgrenci;

   TBol = Record
      BolKod : String[6];
      OgrArr : POgrArr;
      OgrSay : Integer;
   end;
   end;
end;

Procedure PrintDisket;
Var T : TextFile;


    I, M, J, N :Word;
    Basilan     : Word;
    Sayfa       : Byte;
    SIs, SAd, DIs, DAd : String;
    SayfaBasi   : Boolean;

Procedure PrintHader(Sayfa:Byte);
Var UyeInfo, DrsInfo, M, S : String;
    Mev                    : Word;
Begin
   LPT.WriteLnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WriteLnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(ActBol)) );
   LPT.WriteLnPrt('\E\C'+ Ortala(60,' 5 VEYA DAHA AZ DERS˜ KALAN ™¦RENC˜LER'));
   STR(Sayfa:2,S);
   LPT.WriteLnPrt( 'S60SAYFA : '+S);
   LPT.WriteLnPrt(' ');
   LPT.WriteLnPrt('\C    NO         ADI VE SOYADI        DERS˜N KODU         DERS˜N ADI        ');
   LPT.WriteLnPrt('\C -------- ------------------------- ----------- ------------------------- ');
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
   Basilan:=0; Sayfa:=1;
   For I:=1 to Say5 do begin
       N:=BasOgr^[I]^.BasSay;
       M:=Basilan+N+1;
       If M>MaxBas then begin
          FormFeed;
          PrintHader(Sayfa);
       end;
       Basilan:=Basilan+N+1;
       SayfaBasi:=True;
       With Ogr do begin
	  Dfile.GetRec(BasOgr^[I]^.OgrAdr,Is);
	  SIs:=GetIs; SAd:=GetAd;
       end;
       GetDrsInfo(DIs, DAd, BasOgr^[I]^.BasPtr, 1);
       LPT.WriteLnPrt(' '+SIs+' '+SAd+'   '+DIs+'    '+DAd);
       SIs:=Spaces(Length(SIs)); SAd:=Spaces(Length(SAd));
       For J:=2 to BasOgr^[I]^.BasSay do begin
           If Basilan=MaxBas then FormFeed;
           If Basilan=0 then PrintHader(Sayfa);
           GetDrsInfo(DIs, DAd, BasOgr^[I]^.BasPtr, J);
           LPT.WriteLnPrt(' '+Spaces(OgrKeyL)+' '+Spaces(MaxAdLen)+'   '+DIs+'    '+DAd);
       end;
   end;
   if SayfaBasi then FormFeed;
end;
Constructor TNotBes.Init(S : String);
Var I , M, N : Integer;
    Q : PBasArr;
    A : String;
begin
       Ed       :=1;
       EditRow  :=1;
       Say5     :=0;
       N:=0;
       BasOgr:=Nil;

       GetMem(BasOgr,SizeOf(TBasOgrArr));
       FillChar(BasOgr,SizeOf(TBasOgrArr),#0);
       With Ogr do begin
          For I:=1 to Say do begin
             M:=GetAdr(I);
             DFile.GetRec(M, Is);
             A:=GetIs;
             If Copy(A,1,Length(S)) = S then begin
                 FindBasarisiz(Q, N);
                 if Q<>nil then begin
                    Inc(Say5);
                    With BasOgr^[Say5]^ do begin
                      OgrAdr:=M;
                      BasSay:=N;
                      BasPtr:=Q;
                    end;
                 end;
             end;
          end;
       end;
end;
Procedure   TNotBes.ShowLine;
Var S : String;
begin
     With Ogr do begin
       DFile.GetRec(BasOgr^[Ed]^.OgrAdr, Is);
       S:=GetIs+' '+GetAd;
     end;
  WriteStr(Form.FieldKol[1],EditRow,S,NormalAttr);
end;

Procedure TNotBes.EditNotBes;
Var TC  : Char;

Procedure GoDown;
begin
    if (Ed > Say5) then begin
      beep;
      exit
    end;
    if (EditRow=WinLastRow) then
      ScrollupWin
    else
       Inc(EditRow);
    Inc(Ed);
end;
Procedure GoUp;
begin
    If Ed<=1 then begin
       beep;
       exit
    end;
    If Ed > Say5 then begin
     GotoXY(1, EditRow);
     ClrEol
    end;
    if (EditRow=1) then ScrollDownWin;
    If EditRow > 1 then Dec(EditRow);
    Dec(Ed);
end;
Var J : Integer;
   DIs, DAd, SIs, SAd, S : String;
begin
    OpenEditWindow('MEZUN˜YET ˜€˜N 5 DERS˜ KALAN ™¦RENC˜LER',
	'8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI',
	'F9:DERSLER˜ G™STER@ESC:VAZGE€',
	 [F10,ESC, F9, UPKEY, DOWNKEY],
	 [],3, Say5);
   PrintOgr;
   repeat
     ShowLine;
     TC:=GetKey2;
     Case TC of
	 ESC    : begin CloseEdit; exit end;
	 F9     : begin
                    With Ogr do begin
	               Dfile.GetRec(BasOgr^[Ed]^.OgrAdr,Is);
	               SIs:=GetIs; SAd:=GetAd;
                    end;
                       OpenEditWindow(SIs+' '+SAd+' DERSLER',
	                 '6@DERS˜N KODU@25@DERS˜N ADI@13@D™NEM',
	                 'ESC:TAMAM',[ESC],[],10, BasOgr^[Ed]^.BasSay);
                    For J:=1 to BasOgr^[Ed]^.BasSay do begin
                       GetDrsInfo(DIs, DAd, BasOgr^[Ed]^.BasPtr, J);
                       With Ogr.Donem[BasOgr^[Ed]^.BasPtr^[J].Dn] do
                           S:=YilStr(YL,YY);
                       S:=DIs+'    '+DAd+' '+S;
                       WriteStr(Form.FieldKol[1],EditRow,S,NormalAttr);
                    end;
                  end;

	 Upkey  : GoUp;
	 DownKey: GoDown;
     else DoEvent(EventKey);
     end;
   until False;
end;

procedure TNotBes.PrintOgr;
Var BasEd, Say5Ed, I, L, M, Basla, Bitir : Word;
begin
    ClrScr;
    Say5Ed:=Max(WinLastRow, Min(Ogr.Say, Say5+1));
    BasEd:=Say5Ed-WinLastRow+1;
    Basla:=1 ; Bitir:=Say5Ed - BasEd+1;
    EditRow:=Basla; Ed:=BasEd;
    While (Ed<=Say5Ed) do begin
        ShowLine; Inc(EditRow); Inc(Ed)
    end;
    Ed:=BasEd; EditRow:=Basla;
    While (Ed<=Min(Say5, Ogr.Say-1)) do begin
       Inc(Ed); Inc(EditRow)
    end;
end;
Destructor TNotBes.Done;
Var I : Integer;
begin
   for i:=1 to Say5 do
      if BasOgr^[I]^.BasPtr<> nil then
          FreeMem(BasOgr^[I]^.BasPtr, SizeOf(TBasArr));
   if BasOgr<>nil then FreeMem(BasOgr, SizeOf(TBasOgrArr));
end;
begin
end.

