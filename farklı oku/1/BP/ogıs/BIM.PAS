uses BLUNGR, UIndex, Nsr, Crt, DFile, Exist, UOg, UPrt;

CONST
  MaxTane   = 4;
  MaxDsk    = 2;
  MaxYT     = 2;
  BimKeyL   = 3;
  MaxBim    = 1000;
  CmdDisk   = 1;
  CmdYazici = 2;
  CmdEkran  = 3;
  CmdFakKod = 4;
  FakNo   : Word=1;

Type  BimType = record
        BimIs : Array[0..BimKeyL-1] of Char;
        BimNo : Word;
      end;
var
    BimSay  : Word;
    BimFile : DataFile;
    Bim     : Array[0..MaxBim] of BimType;
    Bas1, Bas2 , Bas3 : String;

Procedure PrepBas(T : Word);
Var I : Word;
begin
   Bas1:=''; Bas2:=''; Bas3:='';
   For I:=1 to T do begin
      Bas1:=Bas1+' DERS                                              ';
      Bas2:=Bas2+' KODU  BL  G B˜MKOD      DERS˜N ADI           SAAT ';
      Bas3:=Bas3+'ÄÄÄÄÄÄ ÄÄ ÄÄ ÄÄÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄ ';
   end;
   Bas1[0]:=Pred(Bas1[0]);
   Bas2[0]:=Pred(Bas2[0]);
   Bas3[0]:=Pred(Bas3[0]);
end;


Function Ortala(M:Byte; S : String):String;
Var L :byte;
begin
   STRIP(S);
   L:=(M - Length(S)) div 2;
   Ortala:=Spaces(L)+S;
end;

Procedure EraseExtra(S : String);
Var Extra:Word;
begin
   For Extra:=1 to Length(S) do
      If S[Extra] in ['+','-','*','='] then S[Extra]:=' ';
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
  Drs.DFile.CloseFile;
  Drs.Done;
  YYDrs.DFile.CloseFile;
  YYDrs.Done;
  If Not BimYaz then
     Complain('B˜MKOD DOSYASINI YAZAMIYORUM');
  ClrScr;
  Halt;
end;
Procedure Bos;
begin
end;
{$F-}
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  BimSay:=0;
  Bolum.Init;
  FillChar(Bim,SizeOf(Bim),#0);
  Yariyil.init;
  YYDrs.Init;YYDrs.Open;
  Drs.init;
  Drs.open;
  If Not BimOku then begin
     Complain('B˜M DOSYASI OKUNAMIYOR');
     QuitProg;
  end;
  ReadUniv;
  ShowUnivFak;
end;
Function BimKod(Yer : Word) : String;
Var S:String;
begin
   If Yer>BimSay then begin
      BimKod:='   ';
      exit
   end;
   Move(Bim[Yer],S[1], BimKeyL);
   S[0]:=Chr(BimKeyL);
   BimKod:=S;
end;
Function WrdStr(Yer : Word) : String;
Var I :Word;
    S : String;
begin
    If Yer>BimSay then begin
      WrdStr:='   ';
      exit
   end;
    S:=IntToStr(Bim[Yer].BimNo,3);
    For I:=1 to 3 do if S[I]=' ' then S[I]:='0';
    WrdStr:=S
end;
Function SingleBim(Yer:Word) : String;
begin
    SingleBim:=BimKod(Yer)+'      '+WrdStr(Yer)
end;
Function BimLine(Yer, Tane : Word) : String;
Var I   : Word;
    S, A: String;
begin
    S:='';
    If Yer<=0 then exit;
    For I:=Yer to Yer+Tane-1 do
        S:=S+SingleBim(I)+'    ';
    BimLine:=S;
    I:=Length(S);
    while S[I]=' ' do Dec(I);
    S[0]:=Chr(I);
end;
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
Function SingleBimYD(Adr:Word) : String;
Var S, A : String;
    Yer : Word;
begin
    With YYDRs do begin
       DFile.GetRec(Adr, Is);
       S:=YYDrs.GetIsEXpand;
       A:=Copy(S,1,3);
       If BimAra(A,Yer) then S:=S+' '+WrdStr(Yer)+Copy(S,4,3);
       Adr:=DrsAdr;
    end;
    With Drs do begin
       DFile.GetRec(Adr, Is);
       A:=GetAd+' '+IntToStr(Saat,4);
    end;
    SingleBimYd:=S+' '+A;
end;
Function BimLineYD(Yer, Tane : Word) : String;
Var I   : Word;
    S, A: String;
begin
    S:='';
    If Yer<=0 then exit;
    For I:=Yer to Yer+Tane-1 do
	S:=S+SingleBimYD(Indis[I])+' ';
    S[0]:=Pred(S[0]);
    BimLineYD:=S;
end;

Procedure InsBim(Yer : Word);
Var I : Word;
begin
    Inc(BimSay);
    For I:=BimSay Downto Yer+1 do
        Move(Bim[I-1], Bim[I], SizeOf(BimType));
end;
Procedure DelBim(Yer : Word);
Var I : Word;
begin
    Dec(BimSay);
    For I:=Yer to BimSay+1 do
        Move(Bim[I+1], Bim[I], SizeOf(BimType));
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
Procedure ShowCopwr;
Var S:String;
begin
   Writestr(10, 20, Decode('#9-951; '#0':0+;%56+8%6+'#0'!+.''+7.%/'#0'/%5-%?+'#0'351&'#0'$5'#0'>969&'#0':0.:'), CmdColor);
   str(memavail,s);
   Writestr(27, 24, 'KALAN HAFIZA : '+S+' BYTE', CmdColor);
end;
{$F+}


Procedure EkranBas;
Var I, J : Word;
    TC   : Char;
    S    : String;
begin
   OpenEditWindow('B˜MKOD',
		 '3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD',
		 'ESC:€IKIS',[ESC],[], 3, (BimSay +1) Div 4);
   I:=1; J:=1;
   ShowUnivFak;
   While I<=Bimsay do begin
       S:=BimLine(I,4);
       WriteStr(Form.FieldKol[1], J, S, NormalAttr);
       I:=I+4;
       Inc(J);
   end;
   repeat
      TC:=GetKeyCmd;
   until TC=ESC;
   CloseEdit;
end;
Procedure YYDersBas;
Const MaxBas = 45;
Var I , Basilan, Sayfa   : Word;
    S : String;
    Head:Boolean;
    Bol :Word;
Procedure PrintHeader;
Var F : TextFile;
    C : String;
    D : String;
begin
   LPT.WritelnPrt('\E\C'+Ortala(60,UNIV));
   LPT.WritelnPrt('\E\C'+Ortala(60,Fakulte+' '+Bolum.KodAd(Bol)));
   LPT.WritelnPrt('\E\C'+Ortala(60,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI DERS B˜MKODLARI'));
   LPT.WritelnPrt(' ');
   C:=IntToStr(Bol,4);
   SetBlankZero(C);
   D:=IntToStr(FakNo,2);
   SetBlankZero(D);
   LPT.WritelnPrt('\E\C'+Ortala(60,('FAKšLTE KODU : '+ D+' B™LšM KODU : '+C)));
   LPT.WritelnPrt('\C\S90Sayfa :  '+IntToStr(Sayfa,2));
   If not Head then begin
      F.Init;
      With F do begin
         OpenToRead('BIM.INF');
         While Not eof(T) do begin
	    C:=ReadText;
	    LPT.WritelnPrt('\C'+C);
         end;
        CloseFile;
        end;
        F.Done;
   end;
   Head:=true;
   LPT.WritelnPrt(' ');
   LPT.WritelnPrt('\C'+Bas1);
   LPT.WritelnPrt('\C'+Bas2);
   LPT.WritelnPrt('\C'+Bas3);
end;
Procedure FormFeed;
begin
  Basilan:=0;
  Inc(Sayfa);
  LPT.WritelnPrt('\F ');
  PrintHeader;
end;
begin
   PrepBas(MaxYT);
 For Bol:=1 to Bolum.NuKod do begin
   clrscr;
   ShowUnivFak;
   I:=1;
   Basilan:=0;
   Sayfa:=1;
   Head:=False;
   PrintHeader;
   YYDrs.IndisInit(Bol, 1);
   While I<=IndisSay do begin
       S:=BimLineYD(I,MaxYT);
       LPT.WritelnPrt('\C'+S);
       I:=I+MaxYT;
       Basilan:=Basilan+1;
       If Basilan=MaxBas then FormFeed;
   end;
   If Basilan < MaxBas then LPT.WriteLnPrt('\F ');
 end;
end;
Procedure DiskeBas;
Var I   : Word;
    BimF    : TextFile;
    S : String;
    F       : TextFile;
    Bol     : Word;
    C       : String;
    D       : String;
    Head    : Boolean;

Procedure PrintHeader;
Var F : TextFile;
begin
 With BimF do begin
     WriteText(' ');
     WriteText(Ortala(60,UNIV));
     WriteText(Ortala(60,Fakulte+' '+Bolum.KodAd(Bol)));
     WriteText(Ortala(60,YilStr(ActYil,ActYY)+' ™¦RET˜M YILI DERS B˜MKODLARI'));
     WriteText(' ');
     C:=IntToStr(Bol,4);
     SetBlankZero(C);
     D:=IntToStr(FakNo,2);
     SetBlankZero(D);
     WriteText(Ortala(60,('FAKšLTE KODU : '+ D+' B™LšM KODU : '+C)));
     WriteText(' ');
  end;
 If not Head then begin
   F.Init;
   With F do begin
      OpenToRead('BIM.INF');
      While Not eof(T) do begin
	  C:=ReadText;
	  BimF.WriteText(C);
      end;
      CloseFile;
   end;
   F.Done;
 end;
 Head:=True;
 With BimF do begin
    WriteText(' ');
    WriteText(Bas1);
    WriteText(Bas2);
    WriteText(Bas3);
 end;
end;
begin
   If not DisketTak('B˜MKOD D˜SKET SšRšCšSš') then exit;
   Bekleyiniz('B˜MKODLARI D˜SKETE KOPYALIYORUM');
   ShowUnivFak;
   PrepBas(MaxDsk);
   BimF.Init;
   BimF.OpenToWrite(Drive +'BIM.TXT');
 For Bol:=1 to Bolum.NuKod do begin
   ShowUnivFak;
   YYDrs.IndisInit(Bol, 1);
   I:=1; Head:=False;
   If IndisSay>0 then  PrintHeader;
   While I<=IndisSay do begin
       S:=BimLineYD(I,MaxDsk);
       BimF.WriteText(S);
       I:=I+MaxDsk;
   end;
 end;
 BimF.CloseFile;
 CloseWindow;
end;
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
     FakNo:=StrToInt(S);
  Until TC = ESC;
  CloseEdit;
  T.OpenToWrite(Drive+'FAKNO.INF');
  T.WriteText(S);
  T.CloseFile;
end;
{$F-}
Var CH:Char;
    T : TextFile;
    C : String;
begin
  MenuBar:=
  AddMenu('B˜M KO~D BAS', ALT_D, 0, Bos,
       AddMenu('~D˜SKET      F1', F1,CmdDisk  ,DiskeBas,0,
       AddMenu('~YAZICI      F2', F2,CmdYazici,YYDersBas,0,
       AddMenu('~EKRAN       F3', F3,CmdEkran, EkRanBas,0,
       AddMenu('~FAKšLTE KOD F4', F4,CmdFakKod, FakKodGir,0,
       AddMenu('€~IK     ALT_Q', ALT_Q  , CmdQuitProg  , QuitProg,0,0))))),0);
  LinkMenu(0, MenuBar);
  DefineMainBox(MenuBar);
  ClrScr;
  fillwin(#178,16*Blue+LightGray);
  If Not Disk.ChangeDir then Halt;
  InitProg;
  FakNo:=1;
  IF Exists('FAKNO.INF') then begin
     T.OpenToRead('FAKNO.INF');
     C:=T.ReadText;
     FakNo:=StrToInt(C);
     T.CloseFile;
  end;
  ShowCopwr;
  UpDateBim;
  Repeat
    ShowMenuBar(0);
    CH:=GetKeyCmd;
    fillwin(#178,16*Blue+LightGray);
    DoEvent(EventKey);
    ShowCopwr;
    ShowUnivFak;
  until false;
  ShowCursor;
end.


