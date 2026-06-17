  EditWindow('FOgrKod','™¦RENC˜Y˜ G˜R˜N˜Z',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI',
		 'F10:SAB˜T@ESC:VAZGE€',
		 '[F10,ESC]',
		 '[CmdBolumSec, CmdBolumGir, CmdOgrGir]',8,1);

  EditWindow('FYYDKod','YARIYIL DERS˜N˜ G˜R˜N˜Z',
		 '12@DERS KOD@25@DERS˜N ADI',
		 'ESC:VAZGE€','[ESC]','[]',8,1);

  EditWindow('FOgrKayKod','™¦RENC˜ KAYIT KONTROL',
		 '8@™GR. NO@25@™¦RENC˜N˜N ADI, SOYADI',
		 'ESC:VAZGE€',
		  '[ESC]',
		 '[]',8,1);

  EditWindow(Title,
		 '4@YIL@3@YARIYIL',
		 'INS:G˜R˜ž@ESC:VAZGE€','[ESC, INSKEY]','[]',10,1);

  makeform('FOgrGir','™¦RENC˜ G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI, SOYADI@1@C˜NS@15@DO¦UM YER˜@10@DO¦UM TAR˜H˜@2@HAZIRILIK NOT@4@HAZIRLIK BAžARI YILI',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
		 '[F9,F10,INSKEY, ESC]',
		 '[CmdBolumSec, CmdBolumGir]',5);

  makeform('FDrsGir','DERS G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '6@DERS KOD@25@DERS˜N ADI@4@SAAT@5@KRED˜',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
		 '[F9,F10,INSKEY,ESC]','[]',9);

  makeform('FUyeGir','™¦R. ELEMANI G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
		 '6@šYE KOD@25@™¦RET˜M ELEMANI ADI@2@šNVAN KOD@11@šNVAN',
		 'F9:KOD DE¦˜ž@F10:SAB˜T@ALT_F10:šNVAN SE€@INS:G˜R˜ž@ESC:VAZGE€',
		 '[F9,F10,INSKEY,ESC, ALT_F10]',
		 '[CmdUnvanGir]',9);

  makeform('FYYDGir','YARIYIL DERS G˜R˜ž˜ VE DE¦˜ž˜KL˜¦˜',
    '6@DERS KOD@2@ALAN B™LšM@2@GRUP@25@DERS˜N ADI@6@šYE KOD@11@šNVAN@25@™¦RET˜M ELEMANI',
    'F10:SAB˜T@INS:G˜R˜ž@ESC:VAZGE€',
    '[F10, INSKEY, ESC, TAB]',
     '[CmdDrsGir, CmdUyeGir]',5);


File DFILE.PAS:
       EditWindow('FSurucuSec',Title, '1@SšRšCš','END:BASLA@ESC:VAZGE€', '[ENDKEY,ESC]', '[]', 10, 1);

File BIM.PAS:
   EditWindow('FBimKod','B˜MKOD',
		 '3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD@3@DERS KOD@3@B˜MKOD',
		 'ESC:€IKIS','[ESC]','[]', 3, (BimSay +1) Div 4);

  EditWindow('FFakKod','FAKšLTE KODU',
		 '2@KOD',
		 'ESC:€IKIS','[ESC]','[]',10,1);

File EXIST.PAS:
       EditWindow('FDirDeg','SšRšCš VE D˜RECTORY DE¦˜ž˜M˜',
	 '44@D˜RECTORY','END:DE¦˜ž˜T˜R@ESC:VAZGE€', '[ENDKEY,ESC]', '[]',10, 5);

File UINDEX.PAS:
  EditWindow('FBaslaKod','BAžLANGI€ KOD', S+'@KOD','ESC : VAZGE€','[ESC]','[]',10, 1);
  EditWindow('FSecim',Title,EdT,
	       'ENTER:SE€˜M@PGUP:HEPS˜@PGDN:H˜€B˜R˜@F10:KOD BAžLA@END:SE€˜M TAMAM@ESC:˜PTAL',
	       '[CR, F10, ENDKEY, ESC,PGUPKEY,PGDNKEY]','[]',3,Say);

    EditWindow('FSabit','SAB˜T BAžLIK', CHR(47+KeyL)+'@SAB˜T KOD',
		    'ESC : VAZGE€','[ESC]', '[]' ,13, 1);

       EditWindow('FKodDeg',Title,
	      Chr(48+KeyL)+'@ESK˜ KOD@'+CHR(48+KeyL)+'@YEN˜ KOD',
	      'ESC:VAZGE€', '[ESC]', '[]', 13, 1);
File OGRBAS.PAS:
       EditWindow('FOgrBas','BAžLANGI€ VE B˜T˜ž ™¦RENC˜ NUMARALARI',
	      Chr(48+OgrKeyL)+'@BAžLANGI€@'+CHR(48+OgrKeyL)+'@B˜T˜ž@1@™¦RENC˜LER˜N SINIFI',
	      'END : G˜R˜ž TAMAM@ESC:VAZGE€', '[ESC, ENDKEY]', '[]', 13, 1);

  EditWindow('FOgrBasSec','™¦RENC˜ BASIMI SE€ENEKLER',
		 '57@BASIMDA YER ALACAK B˜G˜LER˜ VE BASIM šN˜TES˜N˜ SE€˜N˜Z',
		 'ENTER:SE€˜M@END:SE€˜M TAMAM@ESC:VAZGE€',
		 '[CR, ENDKEY, ESC]', '[]', 3, MaxBilgi);

	     EditWindow('FOgrHazNotBas','HAZ.NOTU, BASžARI YILINA G™RE ™¦RENC˜ BASIMI',
	     '4@HAZ.BAžARI YILI@2@HAZIRILIK NOT',
	     'INS:G˜R˜ž@ESC:VAZGE€',
	     '[INSKEY, ESC]','[]',3,4);

File STAT.PAS:
  EditWindow('FYazIstBas','YAZICIYA ˜STAT˜ST˜K BASIMI',
		 '25@ ',
		 'CR:BAS@ESC:VAZGE€',
		  '[CR, ESC]','[]',5,4);

  EditWindow('FDiskIstBas','D˜SKETE ˜STAT˜ST˜K BASIMI',
		 '30@DOSYA ADI',
		 'END:BASIMA GE€@ESC:VAZGE€',
		  '[ENDKEY, ESC]','[]',5,4);

File BASIM.PAS:
  EditWindow('FDiskListBas','D˜SKETE L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@DEL:BASMA@ESC:VAZGE€',
		  '[CR, ESC,DELKEY]','[]',5,4);


File ULIST.PAS:
  EditWindow('FListBas','L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@PGUP:™NCEK˜@PGDN:SONRAK˜@ESC:VAZGE€',
		  '[CR, ESC,PGUPKEY,PGDNKEY]','[]',5,4);

   EditWindow('FNotBel','NOT BELGES˜ D™KšMš',
		 '8@™GR. NO@25@™GRENC˜N˜N ADI',
		 'CR:BAS@CTRL_X:BAžARILI DERSLER@ESC:VAZGE€',
		  '[CR, CTRL_X, ESC]','[]',5,6);

   EditWindow('FMezBel','MEZUN˜YET BELGES˜ D™KšMš',
		 '10@MEZUN˜YET TAR˜H˜@30@MEZUN˜YET UNVANI',
		 'INS:G˜R˜ž@ESC:VAZGE€',
		 '[INSKEY, ESC]','[CmdBolumSec]',3,4);

   EditWindow('FKarBel','KARNE D™KšMš',
		 '8@™GR. NO@25@™¦RENC˜N˜N ADI',
		 'CR:BAS@PGDN:SONRAK˜@ESC:VAZGE€',
		  '[CR, ESC,PGDNKEY]','[]',5,4);

  EditWindow('FYokBel','YOKLAMA L˜STE BASIMI',
		 '12@DERS KODU@25@DERS˜N ADI',
		 'CR:BAS@PGUP:™NCEK˜@PGDN:SONRAK˜@ESC:VAZGE€',
		  '[CR, ESC,PGUPKEY,PGDNKEY]','[]',5,4);

    makeform('FImza','NOT BELGES˜NE G˜RECEK ˜MZALAR', S,
		 'ESC:G˜R˜ž TAMAM',
		 '[ESC]','[]', 10);

    makeform('FDipNot','NOT BELGES˜NE YAZILACAK D˜P NOTLAR', S,
		 'ESC:G˜R˜ž TAMAM',
		 '[ESC]','[]', 10);

  makeform('FNotBelDok',S+' BELGES˜ D™KšMš',T,
		 'F9:YETK˜L˜ ˜MZALAR@F10:D˜P NOTLAR@INS:G˜R˜ž@ESC:VAZGE€',
		 '[f9, F10,INSKEY, ESC]','[CmdBolumSec]',5);


File BLUNGR.PAS:
  EditWindow(Title, EdT, 'ENTER:SE€˜M@ESC:VAZGE€',
		 '[CR,ESC]', '[]', 3, Bitir-Basla+1);


  EditWindow(Title,'2@KOD@'+T+'@AD','INS:G˜R˜ž@ESC:VAZGE€',
  '[ESC,INSKEY]','[]', 13, 1);

	     EditWindow('D˜P NOT G˜R˜ž˜',
	     '62@BU ˜žARET ˜LE ˜LG˜L˜ D˜P NOTU G˜R˜N˜Z',
	     'INS:G˜R˜ž@ESC:VAZGE€',
	      '[ESC,INSKEY]', '[]', 6, 1);

   EditWindow('NOTLARDA DE¦˜ž˜KL˜K',
  '2@KOD@9@AD@5@A¦IRLIK@5@ORTALAMA@5@BAžARILI@1@IžARET',
  'F10:NOT BAžLANGI€@ESC:VAZGE€',
   '[F10,ESC, UPKEY, DOWNKEY, TAB]', '[CmdYeniNot]', 3, NuKod);


EditWindow('BAžLANGI€ NOT','2@KOD',
		       'ESC : VAZGE€','[ESC]','[]', 10, 1);

File ANA.PAS:

    EditWindow('MAXS˜MUM',
		 '2@SAAT',
		 'ESC:€IKIS','[ESC]','[]',10,1)

    EditWindow('MAXS˜MUM',
		 '6@KRED˜',
		 'ESC:€IKIS','[ESC]','[]',10,1);

   EditWindow('šN˜VERS˜TE VE FAKšLTE ADI DE¦˜ž˜KL˜¦˜',
   '30@šN˜VERS˜TEN˜N ADI@31@FAKšLTEN˜N ADI' ,'ESC : DE¦˜ž˜KL˜K TAMAM','[ESC]','[]',10, 1);

    EditWindow('YARIYIL L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€','[CR,ESC]','[]',10, 4);

    EditWindow('BšTšNLEME L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€','[CR,ESC]','[]',10, 4);
   EditWindow('TEKRAR L˜STE HAZIRLI¦I','30@B™LšMšN ADI' ,'ENTER: HAZIRLA@ESC : VAZGE€','[CR,ESC]','[]',10, 4);


  Form = record
    X1,
    Y1,
    X2,
    Y2,
    Size: Integer;
    Title,
    EdT,
    CmdLn  : String;
    CmdSet : CharSet;
    ComSet : ByteSet;
    FirstRow, MaxEntry : Word
  end;

    EdTit(EdT, T);
    L:=Length(T);
    M:=Length(CmdLn+' ');
    V:=Length(Title+' ');
   If V>M then M:=V;
   If L > M then M:=L; L:= 2 + (78-M) Div 2;
   Y:= FirstRow + MaxEntry + 4;
   If Y < 24 then
      FirstRow:= FirstRow + (24-Y) div 2;
   Y:= FirstRow + MaxEntry + 4;
   If Y > 24 then Y := 24;
   Window(L, FirstRow , L + M+1, Y, Title, NormalAttr, True);





    Fields: List;



Procedure SplitWindow( Title, EdT, CmdLn:String;
			   CmdSet:CharSet; ComSet:ByteSet);

Var L, M, Y, Delta : Word;
    T : String;
begin
   PushForm; EnableTerm(CmdSet, ComSet);
   EdTit(EdT, T); L:=Length(T); M:=Length(CmdLn+' ');
   If L > M then M:=L; L:= 2 + (78-M) Div 2;
   Window(L, 3 , L + M+1, 25, Title, NormalAttr, True);
   WriteStr(1,2,ConstStr(CizChar,WinLastCol),NormalAttr);
   WriteStr(1,3,T,NorMalAttr); WriteStr(1,4,EdT,NormalAttr);
   PromptCmdLine(CmdLn);
   Window(L+1, 8, L+M, 23,'',NormalAttr,False);
end;

procedure CloseEdit;
begin
    CloseWindow; CloseWindow; DisableTerm; PopForm;
end;

Procedure Form( Title, EdT, CmdLn:String;
		    CmdSet:CharSet; ComSet : ByteSet;
		    FirstRow:Byte);

Var I, L, K, M, N : Word;
    T, S: String;
    Tit : Array[1..25] of String[40];
    B   : Boolean;
begin
   PushForm;
   EnableTerm(CmdSet, ComSet);
   I:=0;L:=0;K:=0;M:=0;
   While ParseWord(EdT,S,'@') do begin
      Inc(I);
      Form.FieldLen[I]:=StrToInt(S);
      B:=ParseWord(EdT,S,'@');
      Tit[I]:=S;
      If M<Length(Tit[I]) then M:=Length(Tit[I]);
      If K<Form.FieldLen[I] then K:=Form.FieldLen[I];
   end;
   Form.FieldSay:=I;
   While FirstRow + Form.FieldSay > 21 do Dec(FirstRow);
   L:=M+K+5;
   Form.FieldKol[1]:=1;
   If L<Length(CmdLn+' ')  then  L:=Length(CmdLn+' ');
   If L< Length(Title+' ') then  L:=Length(Title+' ');
   N:= 2 + (78-L) Div 2;
   Window(N, FirstRow , L+N, FirstRow+Form.FieldSay + 4, Title, NormalAttr, True);
   PromptCmdLine(CmdLn);
   For I:=1 to Form.FieldSay do
       WriteStr(2,I+1,Tit[I]+spaces(M+1 - length(tit[i])), FieldTitColor);
   Window(N+M+4, FirstRow + 2, L+N-1,FirstRow + Form.FieldSay +2 ,'',NormalAttr,False);
   TextAttr:=GirisColor;
end;


{ Turbo Forms }
{ Copyright (c) 1989 by Borland International, Inc. }

unit Forms;
{ Turbo Pascal 5.5 object-oriented example.
  This unit defines field- and form-editing object types.
  Refer to OOPDEMOS.DOC for an overview of this unit.
}

{$S-}

interface

uses Objects;

const

  CSkip  = ^@;
  CHome  = ^A;
  CRight = ^D;
  CPrev  = ^E;
  CEnd   = ^F;
  CDel   = ^G;
  CBack  = ^H;
  CSave  = ^J;
  CEnter = ^M;
  CUndo  = ^R;
  CLeft  = ^S;
  CIns   = ^V;
  CNext  = ^X;
  CClear = ^Y;
  CEsc   = ^[;

type

  FStringPtr = ^FString;
  FString = string[79];

  FieldPtr = ^Field;
  Field = object(Node)
    X, Y, Size: Integer;
    Title: FStringPtr;
    Value: Pointer;
    Extra: record end;
    constructor Init(PX, PY, PSize: Integer; PTitle: FString);
    constructor Load(var S: Stream);
    destructor Done; virtual;
    procedure Clear; virtual;
    function Edit: Char; virtual;
    procedure Show; virtual;
    procedure Store(var S: Stream);
  end;

  FTextPtr = ^FText;
  FText = object(Field)
    Len: Integer;
    constructor Init(PX, PY, PSize: Integer; PTitle: FString;
      PLen: Integer);
    function Edit: Char; virtual;
    procedure GetStr(var S: FString); virtual;
    function PutStr(var S: FString): Boolean; virtual;
    procedure Show; virtual;
  end;

  FStrPtr = ^FStr;
  FStr = object(FText)
    constructor Init(PX, PY: Integer; PTitle: FString; PLen: Integer);
    procedure GetStr(var S: FString); virtual;
    function PutStr(var S: FString): Boolean; virtual;
  end;

  FNumPtr = ^FNum;
  FNum = object(FText)
    procedure Show; virtual;
  end;

  FIntPtr = ^FInt;
  FInt = object(FNum)
    Min, Max: Longint;
    constructor Init(PX, PY: Integer; PTitle: FString;
      PMin, PMax: Longint);
    procedure GetStr(var S: FString); virtual;
    function PutStr(var S: FString): Boolean; virtual;
  end;

  FZipPtr = ^FZip;
  FZip = object(FInt)
    constructor Init(PX, PY: Integer; PTitle: FString);
    procedure GetStr(var S: FString); virtual;
    function PutStr(var S: FString): Boolean; virtual;
  end;

  FRealPtr = ^FReal;
  FReal = object(FNum)
    Decimals: Integer;
    constructor Init(PX, PY: Integer; PTitle: FString;
      PLen, PDecimals: Integer);
    procedure GetStr(var S: FString); virtual;
    function PutStr(var S: FString): Boolean; virtual;
  end;

  FormPtr = ^Form;
  Form = object(Base)
    X1, Y1, X2, Y2, Size: Integer;
    Fields: List;
    constructor Init(PX1, PY1, PX2, PY2: Integer);
    constructor Load(var S: Stream);
    destructor Done; virtual;
    function Edit: Char;
    procedure Show(Erase: Boolean);
    procedure Add(P: FieldPtr);
    procedure Clear;
    procedure Get(var FormBuf);
    procedure Put(var FormBuf);
    procedure Store(var S: Stream);
  end;

  FStream = object(BufStream)
    procedure RegisterTypes; virtual;
  end;

  ColorIndex = (BackColor, ForeColor, TitleColor, ValueColor);

procedure Beep;
procedure Color(C: ColorIndex);
function ReadChar: Char;

implementation

uses Crt;

type
  Bytes = array[0..32767] of Byte;

{ Field }

constructor Field.Init(PX, PY, PSize: Integer; PTitle: FString);
begin
  X := PX;
  Y := PY;
  Size := PSize;
  GetMem(Title, Length(PTitle) + 1);
  Title^ := PTitle;
  GetMem(Value, Size);
end;

constructor Field.Load(var S: Stream);
var
  L: Byte;
begin
  S.Read(X, SizeOf(Integer) * 3);
  S.Read(L, SizeOf(Byte));
  GetMem(Title, L + 1);
  Title^[0] := Chr(L);
  S.Read(Title^[1], L);
  GetMem(Value, Size);
  S.Read(Extra, SizeOf(Self) - SizeOf(Field));
end;

destructor Field.Done;
begin
  FreeMem(Value, Size);
  FreeMem(Title, Length(Title^) + 1);
end;

procedure Field.Clear;
begin
  FillChar(Value^, Size, 0);
end;

function Field.Edit: Char;
begin
  Abstract;
end;

procedure Field.Show;
begin
  Abstract;
end;

procedure Field.Store(var S: Stream);
begin
  S.Write(X, SizeOf(Integer) * 3);
  S.Write(Title^, Length(Title^) + 1);
  S.Write(Extra, SizeOf(Self) - SizeOf(Field));
end;

{ FText }

constructor FText.Init(PX, PY, PSize: Integer; PTitle: FString;
  PLen: Integer);
begin
  Field.Init(PX, PY, PSize, PTitle);
  Len := PLen;
end;

function FText.Edit: Char;
var
  P: Integer;
  Ch: Char;
  Start, Stop: Boolean;
  S: FString;
begin
  P := 0;
  Start := True;
  Stop := False;
  GetStr(S);
  repeat
    GotoXY(X, Y);
    Color(TitleColor);
    Write(Title^);
    Color(ValueColor);
    Write(S, '': Len - Length(S));
    GotoXY(X + Length(Title^) + P, Y);
    Ch := ReadChar;
    case Ch of
      #32..#255:
	begin
	  if Start then S := '';
	  if Length(S) < Len then
	  begin
	    Inc(P);
	    Insert(Ch, S, P);
	  end;
	end;
      CLeft: if P > 0 then Dec(P);
      CRight: if P < Length(S) then Inc(P) else;
      CHome: P := 0;
      CEnd: P := Length(S);
      CDel: Delete(S, P + 1, 1);
      CBack:
	if P > 0 then
	begin
	  Delete(S, P, 1);
	  Dec(P);
	end;
      CClear:
	begin
	  S := '';
	  P := 0;
	end;
      CUndo:
	begin
	  GetStr(S);
	  P := 0;
	end;
      CEnter, CNext, CPrev, CSave:
	if PutStr(S) then
	begin
	  Show;
	  Stop := True;
	end else
	begin
	  Beep;
	  P := 0;
	end;
      CEsc: Stop := True;
    else
      Beep;
    end;
    Start := False;
  until Stop;
  Edit := Ch;
end;

procedure FText.GetStr(var S: FString);
begin
  Abstract;
end;

function FText.PutStr(var S: FString): Boolean;
begin
  Abstract;
end;

procedure FText.Show;
var
  S: FString;
begin
  GetStr(S);
  GotoXY(X, Y);
  Color(TitleColor);
  Write(Title^);
  Color(ValueColor);
  Write(S, '': Len - Length(S));
end;

{ FStr }

constructor FStr.Init(PX, PY: Integer; PTitle: FString; PLen: Integer);
begin
  FText.Init(PX, PY, PLen + 1, PTitle, PLen);
end;

procedure FStr.GetStr(var S: FString);
begin
  S := FString(Value^);
end;

function FStr.PutStr(var S: FString): Boolean;
begin
  FString(Value^) := S;
  PutStr := True;
end;

{ FNum }

procedure FNum.Show;
var
  S: FString;
begin
  GetStr(S);
  GotoXY(X, Y);
  Color(TitleColor);
  Write(Title^);
  Color(ValueColor);
  Write(S: Len);
end;

{ FInt }

constructor FInt.Init(PX, PY: Integer; PTitle: FString;
  PMin, PMax: Longint);
var
  L: Integer;
  S: string[15];
begin
  Str(PMin, S); L := Length(S);
  Str(PMax, S); if L < Length(S) then L := Length(S);
  FNum.Init(PX, PY, SizeOf(Longint), PTitle, L);
  Min := PMin;
  Max := PMax;
end;

procedure FInt.GetStr(var S: FString);
begin
  Str(Longint(Value^), S);
end;

function FInt.PutStr(var S: FString): Boolean;
var
  N: Longint;
  E: Integer;
begin
  Val(S, N, E);
  if (E = 0) and (N >= Min) and (N <= Max) then
  begin
    Longint(Value^) := N;
    PutStr := True;
  end else PutStr := False;
end;

{ FZip }

constructor FZip.Init(PX, PY: Integer; PTitle: FString);
begin
  FInt.Init(PX, PY, PTitle, 0, 99999);
end;

procedure FZip.GetStr(var S: FString);
begin
  FInt.GetStr(S);
  Insert(Copy('0000', 1, 5 - Length(S)), S, 1);
end;

function FZip.PutStr(var S: FString): Boolean;
begin
  PutStr := (Length(S) = 5) and FInt.PutStr(S);
end;

{ FReal }

constructor FReal.Init(PX, PY: Integer; PTitle: FString;
  PLen, PDecimals: Integer);
begin
  FNum.Init(PX, PY, SizeOf(Real), PTitle, PLen);
  Decimals := PDecimals;
end;

procedure FReal.GetStr(var S: FString);
begin
  Str(Real(Value^): 0: Decimals, S);
end;

function FReal.PutStr(var S: FString): Boolean;
var
  R: Real;
  E: Integer;
  T: FString;
begin
  Val(S, R, E);
  PutStr := False;
  if E = 0 then
  begin
    Str(R: 0: Decimals, T);
    if Length(T) <= Len then
    begin
      Real(Value^) := R;
      PutStr := True;
    end;
  end;
end;

{ Form }

constructor Form.Init(PX1, PY1, PX2, PY2: Integer);
begin
  X1 := PX1;
  Y1 := PY1;
  X2 := PX2;
  Y2 := PY2;
  Size := 0;
  Fields.Clear;
end;

constructor Form.Load(var S: Stream);
begin
  S.Read(X1, SizeOf(Integer) * 5);
  Fields.Load(S);
end;

destructor Form.Done;
begin
  Fields.Delete;
end;

function Form.Edit: Char;
var
  P: FieldPtr;
  Ch: Char;
begin
  Window(X1, Y1, X2, Y2);
  P := FieldPtr(Fields.First);
  repeat
    Ch := P^.Edit;
    case Ch of
      CEnter, CNext: P := FieldPtr(P^.Next);
      CPrev: P := FieldPtr(P^.Prev);
    end;
  until (Ch = CSave) or (Ch = CEsc);
  Edit := Ch;
  Window(1, 1, 80, 25);
end;

procedure Form.Show(Erase: Boolean);
var
  P: FieldPtr;
begin
  Window(X1, Y1, X2, Y2);
  if Erase then
  begin
    Color(ForeColor);
    ClrScr;
  end;
  P := FieldPtr(Fields.First);
  while P <> nil do
  begin
    P^.Show;
    P := FieldPtr(Fields.Next(P));
  end;
  Window(1, 1, 80, 25);
end;

procedure Form.Add(P: FieldPtr);
begin
  Inc(Size, P^.Size);
  Fields.Append(P);
end;

procedure Form.Clear;
var
  P: FieldPtr;
begin
  P := FieldPtr(Fields.First);
  while P <> nil do
  begin
    P^.Clear;
    P := FieldPtr(Fields.Next(P));
  end;
end;

procedure Form.Get(var FormBuf);
var
  I: Integer;
  P: FieldPtr;
begin
  I := 0;
  P := FieldPtr(Fields.First);
  while P <> nil do
  begin
    Move(P^.Value^, Bytes(FormBuf)[I], P^.Size);
    Inc(I, P^.Size);
    P := FieldPtr(Fields.Next(P));
  end;
end;

procedure Form.Put(var FormBuf);
var
  I: Integer;
  P: FieldPtr;
begin
  I := 0;
  P := FieldPtr(Fields.First);
  while P <> nil do
  begin
    Move(Bytes(FormBuf)[I], P^.Value^, P^.Size);
    Inc(I, P^.Size);
    P := FieldPtr(Fields.Next(P));
  end;
end;

procedure Form.Store(var S: Stream);
begin
  S.Write(X1, SizeOf(Integer) * 5);
  Fields.Store(S);
end;

{ FStream }

procedure FStream.RegisterTypes;
begin
  BufStream.RegisterTypes;
  Register(TypeOf(FStr), @FStr.Store, @FStr.Load);
  Register(TypeOf(FInt), @FInt.Store, @FInt.Load);
  Register(TypeOf(FZip), @FZip.Store, @FZip.Load);
  Register(TypeOf(FReal), @FReal.Store, @FReal.Load);
end;

{ Global routines }

procedure Beep;
begin
  Sound(500); Delay(25); NoSound;
end;

procedure Color(C: ColorIndex);
type
  Palette = array[ColorIndex] of Byte;
const
  CP: Palette = ($17, $70, $30, $5E);
  MP: Palette = ($07, $70, $70, $07);
begin
  if LastMode = CO80 then TextAttr := CP[C] else TextAttr := MP[C];
end;

function ReadChar: Char;
var
  Ch: Char;
begin
  Ch := ReadKey;
  case Ch of
    #0:
      case ReadKey of
	#15, #72: Ch := CPrev;    { Shift-Tab, Up }
	#60: Ch := CSave;         { F2 }
	#71: Ch := CHome;         { Home }
	#75: Ch := CLeft;         { Left }
	#77: Ch := CRight;        { Right }
	#79: Ch := CEnd;          { End }
	#80: Ch := CNext;         { Down }
	#82: Ch := CIns;          { Ins }
	#83: Ch := CDel;          { Del }
      end;
    #9: Ch := CNext;              { Tab }
  end;
  ReadChar := Ch;
end;

end.

{ Turbo Form }
{ Copyright (c) 1989 by Borland International, Inc. }

program FDemo;
{ Turbo Pascal 5.5 object-oriented example.
  Demonstrates use of the FORMS and SLIDERS units.
  Refer to OOPDEMOS.DOC for an overview of this program.
}

uses Crt, Forms;

type

  Prgram = record
    ProgKod: string[2];
    Fakulte: string[30];
    YOkul  : string[30];
    Bolum  : string[30];
    ProgNm : string[30];
  end;

const

  PR: Prgram = (
    ProgKod : 'MT';
    Fakulte : 'FEN EDEB˜YAT';
    YOkul   : '';
    Bolum   : 'MATEMAT˜K BOLšMš';
    ProgNm: '');

var
  F: Form;
  P: Prgram;

begin
  Color(BackColor);
  ClrScr;
  Color(ForeColor);
  GotoXY(1, 1); ClrEol;
  Write(' Turbo Pascal 5.5 Object Oriented Forms Editor');
  GotoXY(1, 25); ClrEol;
  Write(' F2-Save  Esc-Quit');
  F.Init(10, 5, 54, 11);
  F.Add(New(FStrPtr, Init(3, 2, 'program kodu ', 2)));
  F.Add(New(FStrPtr, Init(3, 3, 'fakulte      ', 30)));
  F.Add(New(FStrPtr, Init(3, 4, 'Y Okul       ', 30)));
  F.Add(New(FStrPtr, Init(3, 5, 'Bolum        ', 30)));
  F.Add(New(FStrPtr, Init(3, 6, 'Prog isim    ', 30)));
  P := PR;
  F.Put(P);
  F.Show(True);
  if F.Edit = CSave then
     F.Get(P);
  F.Done;
  NormVideo;
  ClrScr;
  WriteLn('Resulting Person record:');
  WriteLn;
  with P do
  begin
    WriteLn('Firstname: ', ProgKod);
    WriteLn(' Lastname: ', Fakulte);
    WriteLn('  Address: ', YOkul);
    WriteLn('     City: ', Bolum);
    WriteLn('    State: ', ProgNm);
  end;
end.
