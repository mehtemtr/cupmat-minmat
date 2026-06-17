uses Crt, Dos, GenUtil, StrIn, NSR, UOG, BLUNGR, UPrt, DFile, Exist, Win;
const OgrenimSuresi:Integer=4;
      SonOdemeTar : String='01/01/1997';
      DonemYil    : Word=1997;
      DonemYY     : Byte=1;
      Donem       : String='97981';
      OgrTip      : Char='0';
      Harc        : LongInt=15000000;
      InitDone : Boolean=False;
      YildanAra : Boolean=True;
type
  TBolArr = Array[1..MaxBolum+1] of String[6];


Var BLKod : TBolArr;
    BolSay : Integer;
    ARTIKT  : TextFile;
    Count: Integer;
    FKod: String;
    Dir      : array[1..20] of String[12];
    FlCount  : Integer;


    procedure done;
    begin
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
     Str(DonemYil,S);
     Str(DonemYY,S);
     Str(Harc,S);
     CloseFile;
   end;
end;
Procedure ReadBolKod;
Var T : TextFile;
    N, I, J : Integer;
    S :string;
begin
   If not Exists('BOLKOD.DAT') then begin
      For I:=1 to BolSay do BLKod[I]:='000000';
      WriteBolKod;
   end;
   With T do begin
     OpenToRead('BOLKOD.DAT');
     N:=StrToInt(ReadText);
     For I:=1 to N do BLKod[I]:=ReadText;
     SonOdemeTar:=ReadText;
     S:=ReadText; OgrTip:=S[1];
     DonemYil:=StrToInt(ReadText);
     DonemYY:=StrToInt(ReadText);
     S:=ReadText;
     Val(S,Harc,J);
     if BolSay>N then begin
        for J:=N+1 to BolSay do BLKod[I]:='000000';
        WriteBolKod;
     end;
     CloseFile;
   end;
   FKod:=Copy(BLKod[1],1,1);
end;
Function DonemGir:Boolean;
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
                   DonemGir:=True;
                   Str(DonemYil:4,A); Donem:=A;
                   inc(DonemYil);
                   Str( ( DonemYil div 100) : 2, A );
                   Donem:=Donem+A;
                   Str(DonemYY:1,A); Donem:=Donem+A;
                  end;
	F9    :begin YildanAra:=Not YildanAra; TC:=NULL end;
     end;
  Until TC=EndKey;
CloseEdit;
end;

begin
   DonemGir;
end.