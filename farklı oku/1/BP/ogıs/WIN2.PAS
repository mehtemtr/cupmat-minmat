unit Win2;

interface
uses Crt,Dos, KBM2;
const

      ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?ABCÄDEFG¶HIòJKLMNOôPQRSûTUöVWXYZ';

    MaxTab = 10;
    MesWinX1=24;
    MesWinY1=10;
    MesWinX2=54;
    MesWinY2=15;


   Delimeters   : String='@();&';
   CizChar ='ƒ';

   NumericSet =['0'..'9','.'];

   HiliteAttr   = White     + 16*Black;
   NormalAttr   = LightGray + 16*Black;
   InverseAttr  = Black     + 16*LightGray;
   TitleColor   : Byte = InverseAttr;
   ValueColor   : Byte = NormalAttr;
   CmdColor     : Byte = InverseAttr;
   MenuBarColor : Byte = NormalAttr;
   SelectColor  : Byte = InverseAttr;
   ErrorColor   : Byte = InverseAttr;
   MenuSelectColor:Byte = InverseAttr;
   MenuSelHilite: Byte = HiLiteAttr;
   FieldTitColor:Byte = InverseAttr;
   GirisColor   :Byte = NormalAttr;

   AllKar   = [#32..#127, 'û','ö','ô','Ä','¶','ò'];
   MaxWindow = 10;

type

  TitleStrPtr = ^TitleStr;
  TitleStr    = string[78];
  FrameChars = array[1..8] of Char;
const

  Frame: FrameChars = '⁄ƒø≥≥¿ƒŸ';

  type


  WinRecPtr = ^WinRec;
  WinRec = Record
    Title            : TitleStrPtr;
    CurX, CurY       : Byte;        { The Cursor position under }
    Buffer           : Pointer;     { The image under it }
    WMin, WMax       : Word;        { The WindMin and Wind Max under }
    TAttr            : Byte;        { Text Attr under}
    Framed           : Boolean;     { Is Window framed ? }
end;
var
  WindStack  :  Array[0..MaxWindow] of WinRecPtr;
  WindSP     : Word;





type
  WinState = record
    WindMin, WindMax: Word;
    WhereX, WhereY: Byte;
    TextAttr: Byte;
  end;

const

{ Standard frame character sets }

  SingleFrame: FrameChars = '⁄ƒø≥≥¿ƒŸ';
  DoubleFrame: FrameChars = '…Õª∫∫»Õº';

   Spacing=4;
   MaxMenu = 100;


  Type

    CharSet    = Set of Char;
    ByteSet    = Set of Byte;

    TabType    = Array[1..MaxTab+1] of Byte;

    ProcType = Procedure;
    MenuName = String[25];
    BoxType = record
	X1, Y1, X2, Y2 : Byte
   end;

   MenuType=record
	Name    : MenuName;
	Row     : Byte;
	HotKey  : Char;
	LitChar : Char;
	Cmd     : Byte;
	Father  : Byte;
	Son     : Byte;
	Next    : Byte;
	Prev    : Byte;
	Box     : BoxType
     end;

     EditForm = record
       FieldSay : BYTE;
       FieldLen, FieldKol : ARRAY[1..10] OF BYTE;
   end;

   VAR
    Menu         : Array[1..MaxMenu] of MenuType;
    MenuSay      : Byte;
    L            : Byte;
    MenuBar      : Byte;
    MainCharSet  : CharSet;
    HotKeySet    : CharSet;
    ActiveMenuSet: Set of Byte;
    EventKey     : Byte;
    Event        : Array [Byte] of ProcType;

    WMax, WMin   : Word;
    WX,WY        : Byte;
    TAttr        : Byte;
    Term         : CharSet;
    TermStack    : Array[1..MaxWindow] of CharSet;
    CmdStack     : Array[1..MaxWindow] of ByteSet;
    TermSP       : Word;

    Form     : Editform;
    EdStack  : Array[1..MaxWindow] of EditForm;
    EdSP     : Word;

  procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
  procedure WriteChar(X, Y, Count: Byte; Ch: Char; Attr: Byte);
  procedure FillWin(Ch: Char; Attr: Byte);
  procedure WriteWin(var Buf);
  procedure ReadWin(var Buf);
  function  WinSize: Word;
  procedure FrameWin;
  procedure UnFrameWin;
  Procedure OpenWindow(X1, Y1, X2, Y2: Byte; T: TitleStr; TxtAt : Byte; FrameIt : Boolean);
  procedure CloseWindow;
  procedure Initilize;
  Function  WinLastRow:Word;
  Function  WinLastCol:Word;

  Procedure Strip(Var S:String);
  Procedure SetBlankZero(Var S : String);



  Function StrToReal(S:String):Real;
  Function StrToInt(S:String):Word;
  Function RealToStr(X:Real;Width,Decimal:Byte):String;
  Function IntToStr(K:Word; Width:Byte):String;

  Procedure SaveWinInfo;
  Procedure PrevWin;
  Procedure RestoreWinInfo;
  Procedure NormalWindow;

  Procedure SplitPrint(X, Y : Byte; S : String; Attr : Byte);
  Procedure PromptCmdLine(S:String);

  Procedure HideCursor;
  Procedure ShowCursor;

  Function  ParseWord(Var S, ArgStr: String; DelimChar : Char):Boolean;
  Function  Ortala(L : Byte; S : String):String;
  Procedure EdTit(Var S, A : String);
  Procedure OpenEditWindow( Title, EdT, CmdLn:String;
			    CmdSet:CharSet; ComSet:ByteSet;
			    FirstRow, MaxEntry : Word);


  Procedure OpenSplitWindow( Title, EdT, CmdLn:String;
			     CmdSet:CharSet; ComSet:ByteSet);

  Procedure CloseEdit;

 {KeyBoard Routines}

  Function GetKey2 : Char;
  Function getKeyCmd:Char;

  Function GetDesiredKey(T : CharSet):Char;
  Function Evet   : Boolean;

  Function Spaces(Num : Word) : String;
  Function ConstStr(C : Char ; Num : Byte) : String;

  Procedure Beep;

  Procedure ScrollUpWin;
  Procedure ScrollDownWin;
  Function InvColor(Attr : Byte) : Byte;


  Procedure  Complain( S : String);
  Procedure  Ikaz(S : String);
  Procedure Bekleyiniz( S : String);

  Procedure Message( Title, S: String; TRMSET : CharSet ; Var TC : Char);

  Function UpperCase(S : String) : String;

  Procedure InputStr(Var S : String;
		   X,Y,L : Byte;
		   Exact : Boolean;
		   Target: CharSet;
		   NumLen :Byte;
		Var TC   : Char);


   Procedure PadL(Var S: String; Len : Integer; C : Char);
   Function  YilStr(Y:Word; Z:Byte):String;
   Procedure EnableTerm(T : CharSet; L : ByteSet);
   Procedure DisableTerm;








   Function  AddMenu(C:MenuName; HKey:Char; Comd : Byte; E:ProcType; S, B :Byte):Byte;
   Procedure LinkMenu(F, K : Byte);
   Procedure DefineMainBox(K : Byte);
   Procedure ShowMenuBar(T:Byte);
   Procedure DoEvent(Var EvKey : Byte);
   Function  HotKeyEvent(TC:Char; K : Byte):Byte;


   Procedure OpenForm( Title, EdT, CmdLn:String;
		       CmdSet:CharSet; ComSet : ByteSet;
		       FirstRow:Byte);

  Procedure  GetTarih(Kolon, Row : Byte; Var Tarih : String; Var TC:Char);

  function StrComp(Str1, Str2: String): Integer;
  function UpCaseStr(Str:String): String;
  function UCase(C : Char): Char;

  Procedure BitMap(Var S, T; L : Byte{must be a multiple of 4});
  Procedure AcMap(Var S, T; L : Byte{must be a multiple of 4});

  procedure ClearForm;

  Function Min(X, Y : Integer):Integer;
  Function Max(X, Y : Integer):Integer;

implementation

Function HotKeyEvent(TC:Char; K : Byte):Byte;
Var L, B : Byte;
begin
    B:=0;
    L:=K;
    HotKeyEvent:=0;
    if (MenuSay=0) or (K=0) then exit;
    Repeat
	With Menu[L] do begin
	  If TC = HotKey then B:=Cmd;
	  If (B=0) and (Son<>0) then
	     B:=HotKeyEvent(TC, Son);
	  L:=Next
	end;
    until (B<>0) or (L=K);
    HotKeyEvent:=B;
end;
Procedure SelChar(Var TC:Char; Var K : Byte);
Var L : Byte;
begin
    L:=K;
    Repeat
	With Menu[L] do begin
	  If TC = LitChar then begin
	     TC:=CR;
	     K:=L
	  end else
	    L:=Next
	end;
    until L=K;
end;
Function AddMenu(C:MenuName; HKey:Char; Comd : Byte; E:ProcType; S, B :Byte):Byte;
Var K : Byte;
begin
    Inc(MenuSay);
    With Menu[MenuSay] do begin
       Name:=C; Cmd:=Comd;
       K:=Pos('~',Name);
       If K=0 then
	  LitChar:=Name[1]
       else begin
	  LitChar:=Name[K+1];
	  Delete(Name,K,1)
       end;
       Son:=S;
       Next:=B;
       Event[Cmd]:=E;
       HotKey:=HKey;
       If HKey<>NULL then HotKeySet:=HotKeySet+[HKey];
       ActiveMenuSet:=ActiveMenuSet+[Cmd];
    end;
    AddMenu:=MenuSay
end;
Procedure LinkMenu(F, K : Byte);
Var L, R : Byte;
begin
    L:=K;
       While L<>0 do begin
	 With Menu[L] do begin
	    R:=L;Father:=F;L:=Next;
	 end;
	 If L<>0 then Menu[L].Prev:=R;
       end;
    Menu[K].Prev:=R; Menu[R].Next:=K;
    L:=K;
       Repeat
	   R:=Menu[L].Son;
	   If R<>0 then LinkMenu(L,R);
	   L:=Menu[L].Next;
       Until L=K
end;
Procedure LenSubSay(K:Byte; Var Len, N : Byte);
Var L, R : Byte;
begin
    N:=0; Len:=0; L:=K;
    Repeat
	Inc(N);
	With Menu[L] do begin
	    R:=Length(Name);
	    If R>Len then Len:=R;
	    L:=Next
	end;
    Until L=K
end;

Procedure DefineSubBox(K, X, Y : Byte);
Var L, Len, N, T : Byte;
begin
    L:=K; Inc(X); T:=1;
    Repeat
       With Menu[L] do begin
	 If Son = 0 then begin
	    Len:=Length(Name);
	    N:=0
	 end else  LenSubSay(Son,Len,N);
	  With Box do begin
	     X1:=X;
	     Row:=T;
	     Y1:=Y+Row+1;
	     X2:=X1+Len+1;
	     Y2:=Y1+N+1;
	     If Son<>0 then DefineSubBox(Son,X1, Y1);
	     Inc(T);
	 end;
	 L:=Next
       end;
    until L=K
end;
Procedure DefineMainBox(K : Byte);
Var L, R, Len, N, X, Y : Byte;
begin
    L:=K; X:=Spacing+1; Y:=2;
    Repeat
       With Menu[L] do begin
	 MainCharSet:=MainCharSet+[HotKey];
	 If Son = 0 then begin
	    Len:=Length(Name);
	    N:=0
	 end else  LenSubSay(Son,Len,N);
	  With Box do begin
	     X1:=X;
	     Y1:=2;
	     Row:=1;
	     X2:=X+Len+1;
	     Y2:=Y+N+1;
	     if Son<>0 then DefineSubBox(Son, X, Y);
	     X:=X1+Spacing+Length(Menu[L].Name);
	 end;
	 L:=Next
       end;
    until L=K;
    ActiveMenuSet:=ActiveMenuSet;
end;
Procedure ShowMenuName(R : Byte; Selecting : Boolean);
Var I, J, X, Color : Byte;
    S : String;
    ShowIt:Boolean;
begin
    ShowIt:=True;
    If not Selecting then Color:=MenuBarColor else Color:=MenuSelectColor;
    With Menu[R] do begin
       X:=Length(Name);
       If Father = 0 then begin
	  J:=Box.X1;
          S:=Name;
       end
       else begin
	  J:=1;
	  X:=Menu[Father].Box.X2-Menu[Father].Box.X1-1;
          S:=Name+Spaces(X-Length(Name));
          If Not (Cmd in ActiveMenuSet) then begin
             S:=Spaces(Length(S));
             ShowIt:=False
          end;
       end;
       WriteStr(J,Row,S,Color);
       If selecting Or Not ShowIt then exit;
       I:=Pos(LitChar,Name);
       WriteChar(J+I-1,Row,1, LitChar, MenuSelHilite);
    end;
end;
Procedure ShowMenu(K:Byte);
Var L, R , I : Byte;
begin
  With Menu[K].Box do
       OpenWindow(X1, Y1, X2, Y2,'',MenuBarColor, True);
    L:=Menu[K].Son;R:=L;
    Repeat
	ShowMenuName(R, False);
	R:=Menu[R].Next;
    Until R=L
  end;
Procedure ShowMenuBar(T:Byte);
Var L, R : Byte;
begin
  SaveWinInfo;
  NormalWindow;
  WriteStr(1,1,Spaces(80), MenuBarColor);
  L:=MenuBar;R:=L;
    Repeat
	if R<>T then ShowMenuName(R, False) else ShowMenuName(R, True);
	R:=Menu[R].Next;
    Until R=L;
   RestoreWinInfo;
 end;

Function SelectMenu(K:Byte; Var HK : Char):Byte;
Var L, R, SL : Byte;
    TC : Char;
    Stop:Boolean;

begin
    If Menu[K].Father=0 then ShowMenuBar(K);
    SL:=0; Stop:=False;
    ShowMenu(K);
    R:=Menu[K].Son;
    HideCursor;
    Repeat

	  ShowMenuName(R, True);
	  TC:=GetKey2;
	  ShowMenuName(R, False);
	  SL:=HotKeyEvent(TC,R);
	  If SL<>0 then begin
	     Stop:=True;
	     TC:=NULL;
	     HK:=Menu[R].HotKey;
	  end;
	  SelChar(TC,R);
          With Menu[R] do begin
	  Case TC of
	     ESC    : begin
			 Stop:=True;SL:=0;HK:=NULL;
		      end;
	     UPKey   : R:=Prev;
	     DownKey : R:=Next;
	     LeftKey : If Menu[K].Father=0 then begin
			  SL:=255;HK:=NULL;
			  Stop:=True;
		       end;
	     RightKey: If Menu[K].Father=0 then begin
			  SL:=254;HK:=NULL;
			  Stop:=True;
		       end;
	     CR      : begin
			If Son<>0 then
			    SL:=SelectMenu(R, HK)
			else begin
			    SL:=Cmd;
                            HK:=HotKey
                        end;
			If SL <>0 then Stop:=True;
		      end;
		end;
	  end;
    until Stop;
    ShowCursor;
    CloseWindow;
    If Not ( SL in ActiveMenuSet+[255,254]) then begin SL:=0; HK:=NULL end;
    SelectMenu:=SL;
end;
Procedure InitMenu;
begin
   MenuSay:=0;
   MenuBar:=0;
   EventKey:=0;
   MainCharSet:=[];
   HotKeySet:=[#253];
   ActiveMenuSet:=[];
   Term:=[];
   FillChar(Event        , SizeOf(Event),#0);
end;

Procedure DoEvent(Var EvKey : Byte);
begin
   If (EvKey <>0) and ( EvKey in ActiveMenuSet )then begin
      ShowMenuBar(0);
      Event[EvKey];
   end;
   EvKey := 0;
end;

Function GetKeyCmd:Char;
Var C : Char; K : Byte;
begin
    EventKey:=0;
    C:=GetKey2;GetKeyCmd:=C;
    If C in Term then exit;
    { So it is not in terminator group}
    { could it be a hotkey?}
    EventKey := HotKeyEvent(C, MenuBar);
    If (EventKey <>0) then begin { if yes then}
	If ( EventKey in ActiveMenuSet ) then begin {is it an active menu}
	   GetKeyCmd:=C; { An active command is activated through hotkey}
	   exit
	end
    end
    else begin { C is not a HotKey }
       If Not (C in MainCharSet) then exit;
       K:=MenuBar;
       While Menu[K].HotKey<>C do K:=Menu[K].Next;
       Repeat
	   EventKey:=SelectMenu(K, C);
	   Case EventKey of
	       255: K:=Menu[K].Prev;
	       254: K:=Menu[K].Next;
	   end
	 until Not (EventKey in [255,254]);
	 If EventKey<>0 then begin
	    If C=NULL then C:=#253;
	    GetKeyCmd:=C;
	 end else ShowMenuBar(0);
    end;
end;


  Procedure PushForm;
  begin
     Inc(EDSP);
     EdStack[EdSP]:=Form;
  end;
  Procedure PopForm;
  begin
     If EDSP = 0 then exit;
     Form:=EdStack[EdSP];
     Dec(EDSP);
  end;



Function StrToReal(S:String):Real;
Var L : Real;
    I : Integer;
begin
   Strip(S); SetBlankZero(S); Val(S,L,I);
   if I<>0 then begin
      Complain('HATALI SAYISAL GòRòû');
      StrToReal:=0;
   end else StrToReal:=L;
end;
Function StrToInt(S:String):Word;
Var L , I : Integer;
begin
   Strip(S); SetBlankZero(S); Val(S,L,I);
   if I<>0 then begin
      Complain('HATALI SAYISAL GòRòû');
      StrToInt:=0;
   end else StrToInt:=L;
end;
Function RealToStr(X:Real;Width,Decimal:Byte):String;
Var S:String;
begin
   Str(X:Width:Decimal,S);
   RealToStr:=S;
end;
Function IntToStr(K:Word; Width:Byte):String;
Var S:String;
begin
   Str(K:Width,S);
   IntToStr:=S;
end;

 Procedure SaveWinInfo;
 begin
    WMax:=WindMax; WMin:=WindMin; TAttr:=TextAttr;WX:=WhereX;WY:=WhereY
 end;
 Procedure PrevWin;
 begin
    SaveWinInfo;
    With WindStack[WindSP]^ do begin
       WindMin:=WMin;
       WindMax:=WMAx;
       TextAttr:=TAttr;
       GotoXY(CurX,CurY);
   end;
 end;
Procedure RestoreWinInfo;
begin
   WindMax:=WMax; WindMin:=WMin; TextAttr:=TAttr;GotoXY(WX,WY);
end;

Procedure NormalWindow;
begin
   Window(1,1,80,25);
   TextAttr:=NormalAttr;
end;
Procedure PromptCmdLine(S:String);
begin
    GotoXY(1, WinLastRow);
    Clreol;
    SplitPrint(1, WinLastRow,S,CmdColor);
end;

Procedure HideCursor;
Var Regs : Registers;
begin
  Regs.AX :=$0100;
  Regs.CX :=$2020;
  Intr($10,Regs);
end;
Procedure ShowCursor;
var regs:registers;
    VideoMode : Byte Absolute $0040:$0049;
begin
    if Videomode=7 then
       Regs.CX:=$0C0D
    else
       Regs.CX:=$0607;
    Regs.AX:=$0100;
    Intr($10,Regs)
end;

Procedure OpenEditWindow( Title, EdT, CmdLn:String;
			    CmdSet:CharSet; ComSet:ByteSet;
			    FirstRow, MaxEntry : Word);
Var V, L, M, Y, Delta : Word;
    T : String;
begin
   PushForm;
   EnableTerm(CmdSet, ComSet);
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
   OpenWindow(L, FirstRow , L + M+1, Y, Title, NormalAttr, True);
   WriteStr(1,1,T, NorMalAttr); WriteStr(1,2,EdT,NormalAttr);
   PromptCmdLine(CmdLn);
   OpenWindow(L+1, FirstRow + 3, L+M, Y-2,'',NormalAttr,False);
end;

Procedure OpenSplitWindow( Title, EdT, CmdLn:String;
			   CmdSet:CharSet; ComSet:ByteSet);

Var L, M, Y, Delta : Word;
    T : String;
begin
   PushForm; EnableTerm(CmdSet, ComSet);
   EdTit(EdT, T); L:=Length(T); M:=Length(CmdLn+' ');
   If L > M then M:=L; L:= 2 + (78-M) Div 2;
   OpenWindow(L, 3 , L + M+1, 25, Title, NormalAttr, True);
   WriteStr(1,2,ConstStr(CizChar,WinLastCol),NormalAttr);
   WriteStr(1,3,T,NorMalAttr); WriteStr(1,4,EdT,NormalAttr);
   PromptCmdLine(CmdLn);
   OpenWindow(L+1, 8, L+M, 23,'',NormalAttr,False);
end;

procedure CloseEdit;
begin
    CloseWindow; CloseWindow; DisableTerm; PopForm;
end;
Function GetKey2 : Char;
CONST
   Special      : String = ALT_S+ALT_U+ALT_O+ALT_C+ALT_G+ALT_I;
   SpecialChars : String = 'ûöôÄ¶ò';

var
  C : Char;
begin
REPEAT
 C := ReadKey;
 repeat
     if C = NULL then
     begin
	 C := ReadKey;
	 if Ord(C) > 127 then
	     C := NULL
	 else
	     C:= Chr(Ord(C) + 128);
     end
 until C<>NULL;
UNTIL NOT (C IN [#255, #254, #253] );
 if C in [ALT_S, ALT_U, ALT_O, ALT_C,ALT_G,ALT_I] then
       C:=SpecialChars[Pos(C,Special)];
 C:=UpCase(C);
 GetKey2:=UpCase(C);
end;


function Evet:boolean;
begin
   Evet:=GetDesiredKey(['E','e','H','h'])='E';
end;

Function Spaces(Num : Word) : String;
var
  S : String;
begin
  S:='';
  If Num > 255 then exit;
  S[0]:= Chr(Num);
  FillChar(S[1], Num, ' ');
  Spaces:=S;
end; { Spaces }

Function ConstStr(C : Char ; Num : Byte) : String;
var
  S : String;
begin
  S[0] := Chr(Num);
  FillChar(S[1], Num, C);
  ConstStr := S;

end; { ConstStr }

procedure beep;
begin
  Sound(500); Delay(25); NoSound;
end;
Procedure ComplainIkaz( A, S : String);
var K  : Integer;
    CH    : Char;
begin
    Beep;
    S:=  S + '@DEVAM<ESC>';
    K:=Length(S);
    OpenWindow(2, 19, 5+K, 21, A , NormalAttr, True);
    Clrscr;
    SplitPrint(1,1,S,ErrorColor);
    CH:=GetDesiredKey([ESC]);
    CloseWindow;
end;

Procedure Complain( S : String);
begin ComplainIkaz('HATA', S) end;
 Procedure Ikaz( S : String);
begin ComplainIkaz('òKAZ', S) end;
Procedure Bekleyiniz( S : String);
var K  : Integer;
    CH    : Char;
begin
    S:=  S + '@LöTFEN BEKLEYòNòZ';
    K:=Length(S);
    OpenWindow(2, 19, 5+K, 21,'',NormalAttr, True);
    Clrscr;
    SplitPrint(1,1,S,ErrorColor);
end;

Procedure Message(Title, S: String; TRMSET : CharSet ; Var TC : Char);
var T     : Array[1..2] of String;
    CmdLn : String;
    M, I  : Word;
    B     : Boolean;
begin
    M:=Length(Title);
    For I:=1 to 2 do begin
	B:=ParseWord(S,T[I],'@');
	if M< Length(T[I]) then M:=Length(T[I])
    end;
    CmdLn:=S;
    if M< Length(CmdLn) then M:=Length(CmdLn);
    I:=1+(80-M) div 2;
    OpenWindow(I,20,I+M+1,24,Title,NormalAttr, True);
    Clrscr; GotoXY(1,1);
    For I:=1 to 2 do WriteStr(1,I,T[I],NormalAttr);
    PromptCmdLine(CmdLn);
    TC:=GetDesiredKey(TRMSET);
    CloseWindow;
end;

Function UpperCase(S : String) : String;
var
  Counter : Word;
begin
  for Counter := 1 to Length(S) do
    S[Counter] := UpCase(S[Counter]);
  UpperCase := S;
end; { UpperCase }

Function GetDesiredKey(T : CharSet):Char;
var CH : Char;
    Q  : Integer;
begin
    Repeat
       CH:=GetKey2;
       if not (CH in T) then beep;
    until CH in T;
    GetDesiredKey:=CH;
end;
Procedure InputStr(Var S : String;
		   X,Y,L : Byte;
		   Exact : Boolean;
		   Target: CharSet;
		   NumLen :Byte;
		Var TC   : Char);

var
   P : Byte;
   Ch: Char;
   NU: Byte;
   ChangeNum, Dur, Start, EventRequest : Boolean;
   Filter : CharSet;
begin
  P     := 0;
  Start := True;
  DUR   := False;
  NU    := 0;
  TC:=NULL;
  if Length(S) > L then S[0]:=Char(L);
  Filter:=Term+Target+[CR, LeftKey, RightKey, HomeKey, EndKey, DelKey, BS];
  Repeat
    if Start then
       WriteStr(X,Y,S,InverseAttr)         {InvColor(TextAttr))}
    else
       WriteStr(X,Y,S+ConstStr(CizChar,L-Length(S)),TextAttr);
    GotoXY(X+P,Y);
    CH:=GetKeyCmd;
    EventRequest:=(EventKey<>0) and (CH in HotKeySet);
    if EventRequest or (CH in Term) then begin
       WriteStr(X,Y,S+Spaces(L-Length(S)+1),TextAttr);
       TC:=CH;
       Exit
    end;
    if Not (CH in Filter) then beep;
    if CH in Target then begin
       if Start then S :='';
       Inc(P); Insert(CH,S,P);
       If Length(S) > L then begin S:=Copy(S,1,L); Dec(P) end;
       ChangeNum := (NUMLen<>0) and ( CH in ['0'..'9']);
       if ChangeNum then begin
   	inc(NU); if NU = NUMLen then DUR := TRUE;
       end;
       if Exact and (Length(S) = L) then DUR := TRUE;
    END;
    CASE CH OF
       CR       : DUR:=TRUE;
       LEFTKEY  : if P > 0 then DEC(P);
       RIGHTKEY : if P < Length(S) then INC(P);
       HOMEKEY  : P := 0;
       ENDKEY   : P := Length(S);
       DELKEY   : if Length(S)>=P+1 then begin
	      	    if (NUMLen<>0) and (S[P+1] IN ['0'..'9']) then DEC(NU);
		    DELETE(S,P+1,1);
	          END  ELSE BEEP;
          BS     : if P>0 then BEGIN
		     if (NUMLen<>0) and  (S[P] IN ['0'..'9']) then dec(NU);
		     Delete(S,P,1);
		     DEC(P);
        	   END else beep;
       end;
    Start := False
  until DUR;
  WriteStr(X,Y,S+Spaces(L-Length(S)+1),TextAttr);
END;

Procedure PadL(Var S: String; Len : Integer; C : Char);
begin
    if Length(S)>=Len then exit;
    S:=ConstStr(C,Len - Length(S))+S;
end;



{$L WIN}

procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
external {WIN};

procedure WriteChar(X, Y, Count: Byte; Ch: Char; Attr: Byte);
external {WIN};

procedure FillWin(Ch: Char; Attr: Byte);
external {WIN};

procedure WriteWin(var Buf);
external {WIN};

procedure ReadWin(var Buf);
external {WIN};

function WinSize: Word;
external {WIN};

procedure SaveWin(var W: WinState);
begin
  W.WindMin := WindMin;
  W.WindMax := WindMax;
  W.WhereX := WhereX;
  W.WhereY := WhereY;
  W.TextAttr := TextAttr;
end;

procedure RestoreWin(var W: WinState);
begin
  WindMin := W.WindMin;
  WindMax := W.WindMax;
  GotoXY(W.WhereX, W.WhereY);
  TextAttr := W.TextAttr;
end;
procedure FrameWin;
var
   W, H, Y: Word;
begin
  With WindStack[WindSP]^ do begin
    W := WinLastCol;
    H :=WinLastRow;
    WriteChar(1, 1, 1, Frame[1], InverseAttr);
    WriteChar(2, 1, W - 2, Frame[2], InverseAttr);
    WriteChar(W, 1, 1, Frame[3], InverseAttr);
    if Length(Title^) > W - 2 then Title^[0] := Chr(W - 2);
    WriteStr((W - Length(Title^)) shr 1 + 1 , 1, Title^, TitleColor);
    for Y := 2 to H - 1 do
    begin
        WriteChar(1, Y, 1, Frame[4], InverseAttr);
        WriteChar(W, Y, 1, Frame[5], InverseAttr);
    end;
    WriteChar(1, H, 1, Frame[6], InverseAttr);
    WriteChar(2, H, W - 2, Frame[7], InverseAttr);
    WriteChar(W, H, 1, Frame[8], InverseAttr);
  end;
  Inc(WindMin, $0101);
  Dec(WindMax, $0101);
end;

procedure UnFrameWin;
begin
  Dec(WindMin, $0101);
  Inc(WindMax, $0101);
end;

Procedure OpenWindow(X1, Y1, X2, Y2: Byte; T: TitleStr; TxtAt : Byte; FrameIt : Boolean);
begin
  if WindSp = WindMax then exit;
  Inc(WindSP);
  New(WindStack[WindSP]);
  With WindStack[WindSP]^ do begin
    CurX:=WhereX;
    CurY:=WhereY;
    WMin:=WindMin;
    WMax:=WindMax;
    TAttr:=TextAttr;
    GetMem(Title, Length(T) + 1);
    Title^ := T;
    TextAttr  := TxtAt;
    Framed:=FrameIt;
    Window(X1, Y1, X2, Y2);
    GetMem(Buffer,WinSize);
    ReadWin(Buffer^);
  end;
  if FrameIt then FrameWin;
  FillWin(' ',TxtAt);
end;

procedure CloseWindow;
begin
  if WindSP = 0 then exit;
  With WindStack[WindSP]^ do begin
    if Framed then UnFrameWin;
    WriteWin(Buffer^);
    FreeMem(Buffer, WinSize);
    FreeMem(Title, Length(Title^) + 1);
    WindMin:=WMin;
    WindMax:=WMax;
    TextAttr:=TAttr;
    GotoXY(CurX,CurY);
  end;
  Dispose(WindStack[WindSP]);
  dec(WindSP);
end;
procedure Initilize;
  begin
    CheckBreak := False;
    if (LastMode <> CO80) and (LastMode <> BW80) and
      (LastMode <> Mono) then TextMode(CO80);
    Window(1, 1, 80, 25);
  WindSp:=0;
  FillChar(Form,SizeOf(Form),#0);
  EDSP:=0;
  TermSP:=0;
  If LastMode = CO80 then begin
     SelectColor := 16*LightGray+Blue;
     TitleColor  := 16*Red+LightGreen;
     CmdColor    := LightGreen+16*Red;
     MenuSelHilite:=16*LightGray+Red;
     MenuBarColor:=InverseAttr;
     MenuSelectColor:=White+16*Magenta;
     FieldTitColor:=16*Cyan+Black;
     GirisColor:=16*Magenta+Yellow;
     ErrorColor:=16*Red+White;
  end;
end;
Function  WinLastCol:Word;
begin
   WinLastCol  := Lo(WindMax) - Lo(WindMin) + 1;
end;
Function  WinLastRow:Word;
begin
   WinLastRow := Hi(WindMax) - Hi(WindMin) + 1;
end;

Function YilStr(Y:Word; Z:Byte):String;
Var S, T:String;
begin
    Str(Y:4,S);
    Str((Y+1):4,T);
    S:=S+'-'+Copy(T,3,2);
    Case Z of
       1: S:=S+'  GöZ ';
       2: S:=S+' BAHAR';
       3: S:=S+' YAZ  '
    end;
    YilStr:=S;
end;

  Procedure EnableTerm(T : CharSet; L : ByteSet);
  begin
      Inc(TermSp);
      TermStack[TermSP]:=Term;
      CmdStack[TermSP] :=ActiveMenuSet;
      Term:=T;
      ActiveMenuSet:=L;
  end;
 Procedure DisableTerm;
  begin
     If TermSP=0 then exit;
     Term:=TermStack[TermSP];
     ActiveMenuSet:=CmdStack[TermSP];
     Dec(TermSP);
  end;

Function Ortala(L : Byte; S : String):String;Assembler;
Asm
      PUSH    DS
      LDS     SI, S
      LES     DI, @Result
      MOV     AL, L
      STOSB
      XOR     CX, CX
      MOV     CL, AL
      JCXZ    @@2
      MOV     BL, AL
      MOV     AL, ' '
      CLD
      REP     STOSB
      LODSB
      OR      AL, AL
      JE      @@2
      CMP     BL, AL
      JAE     @@1
      MOV     AL, BL
@@1:  MOV     CL, AL
      XOR     CH, CH
      SUB     BL, AL
      SHR     BL, 1
      XOR     BH, BH
      LES     DI, @Result
      INC     DI
      ADD     DI, BX
      REP     MOVSB
@@2:
      POP     DS
end;
Function FindNum(S : String) : Integer; Assembler;
Asm
     PUSH    DS
     LDS     SI, S
     XOR     BX, BX
     CLD
     LODSB
     MOV     CL, AL
     XOR     CH, CH
     JCXZ    @@2
@@1: LODSB
     CMP     AL, '0'
     JB      @@2
     CMP     AL,'9'
     JA      @@2
     MOV     BH, BL
     SHL     BH, 1
     SHL     BL,1
     SHL     BL,1
     SHL     BL,1
     ADD     BL, BH
     SUB     AL, '0'
     ADD     BL, AL
     LOOP    @@1
@@2: POP     DS
     MOV     AX, BX
end;

Procedure EdTit(Var S, A : String);
Var C, D : String;
    K, M, N, AL  : Integer;
    Junk:Boolean;
    begin
         FillChar(D,256,'ƒ');
         FillChar(Form, SizeOf(Form), #0);
         A:='';
         AL:=1;
         WHile ParseWord(S, C, '@') do begin
            K:=FindNum(C);
            If K<>0 then begin
               Junk:=ParseWord(S, C, '@');
               With Form do Begin
                  Inc(FieldSay);
                  FieldLen[FieldSay]:=K;
                  N:=Length(C);
                  If N < K then N:=K;
                  FieldKol[FieldSay]:= 1 + AL+ ( N-K) SHR 1;
                  A:=A+ Ortala(N, C)+' ';
                  AL:=Length(A);
                  D[AL]:=' ';
                  Inc(AL);
               end;
            end;
         end;
         D[0]:=A[0];
         A:=' '+A; D:=' '+D;S:=D;
end;

Procedure Strip(Var S : String); Assembler;
Asm
     LES      DI, S
     MOV      AL, ' '
     XOR      CH, CH
     MOV      CL, ES:[DI]
     MOV      BX, DI
     JCXZ     @@3
     ADD      DI, CX
     XOR      AH, AH
     STD
     REPE     SCASB
     JE       @@3
     INC      CL
     MOV      DI, BX
     INC      DI
     CLD
     REPE     SCASB
     JE       @@3
     DEC      DI
     INC      CL
     MOV      DX, DS
     MOV      AX, ES
     MOV      DS, AX
     MOV      SI, BX
     INC      SI
     MOV      AH, CL
     XCHG     SI, DI
     CLD
     REP      MOVSB
     MOV      CL, AH
     MOV      DS, DX
@@3: MOV      ES:[BX],CL
end;

Procedure SetBlankZero(Var S: String);Assembler;
Asm
       LES    DI, S
       XOR    CH, CH
       MOV    CL, ES:[DI]
       JCXZ   @@3
       INC    DI
       MOV    AL,' '
 @@1:  SCASB
       JNE    @@2
       DEC    DI
       MOV    BYTE PTR ES:[DI],'0'
       INC    DI
 @@2:  LOOP   @@1
 @@3:
end;
Function ParseWord(Var S, ArgStr: String; DelimChar : Char):Boolean;Assembler;
asm
     PUSH     DS
     XOR      AX, AX
     LES      DI, ARGSTR
     CLD
     STOSB
     LES      DI, S
     XOR      CH, CH
     MOV      CL, ES:[DI]
     JCXZ     @@4
     INC      DI
     MOV      AL, DelimChar
     CLD
     REPZ     SCASB
     JE       @@2
     INC      CL
     DEC      DI
     MOV      DX, DI
     CLD
     REPNE    SCASB
     MOV      AX, 1
     MOV      BX, DI
     SUB      BX, DX
     OR       CL, CL
     JE       @@1
     DEC      BX
@@1: LDS      SI, S
     MOV      SI, DX
     MOV      BH, CL
     MOV      CL, BL
     MOV      DX, DI
     LES      DI, ARGSTR
     CLD
     MOV      ES:[DI], CL
     INC      DI
     REP      MOVSB
     INC      SI
     MOV      CL, BH
     LES      DI, S
     MOV      ES:[DI], BH
     JCXZ     @@4
     INC      DI
     REP      MOVSB
     JMP      @@4
@@2: XOR      AX, AX
@@4: POP      DS
end;

Procedure SplitPrint(X, Y : Byte; S : String; Attr : Byte);Assembler;
Asm
          LES       DI, S
          MOV       CL, ES:[DI]
          INC       DI
          XOR       CH, CH
          JCXZ      @@3
@@1:      MOV       AL, ES:[DI]
          INC       DI
          PUSH      ES
          PUSH      DI
          PUSH      CX
          XOR       BX, BX
          MOV       BL, X
          PUSH      BX
          MOV       BL, Y
          PUSH      BX
          MOV       BX, 1
          PUSH      BX
          MOV       DL, ATTR
          CMP       AL,'@'
          JNE       @@2
          MOV       DX, 7
          MOV       AL,' '
@@2:      PUSH      AX
          PUSH      DX
          CALL      FAR PTR WRITECHAR
          POP       CX
          POP       DI
          POP       ES
          INC       X
          LOOP      @@1
@@3:
end;

Procedure ScrollUpWin;Assembler;
asm
        MOV     AX, 0601H
        MOV     CX, WindMin
        MOV     DX, WindMax
        MOV     BH, 7
        INT     10H
end;

Procedure ScrollDownWin;Assembler;
asm
        MOV     AX, 0701H
        MOV     CX, WindMin
        MOV     DX, WindMax
        MOV     BH, 7
        INT     10H
end;
Function InvColor(Attr : Byte) : Byte; Assembler;
asm
   MOV     AL, ATTR
   AND     AL, 77H
   ROR     AL, 1
   ROR     AL, 1
   ROR     AL, 1
   ROR     AL, 1
   OR      AL, 08H
end;

Procedure OpenForm( Title, EdT, CmdLn:String;
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
   OpenWindow(N, FirstRow , L+N, FirstRow+Form.FieldSay + 4, Title, NormalAttr, True);
   PromptCmdLine(CmdLn);
   For I:=1 to Form.FieldSay do
       WriteStr(2,I+1,Tit[I]+spaces(M+1 - length(tit[i])), FieldTitColor);
   OpenWindow(N+M+4, FirstRow + 2, L+N-1,FirstRow + Form.FieldSay +2 ,'',NormalAttr,False);
   TextAttr:=GirisColor;
end;

Procedure  GetTarih(Kolon, Row : Byte; Var Tarih : String; Var TC:Char);
var A,G,Y : String;
begin
    G:=Copy(Tarih,1,2);
    A:=Copy(Tarih,4,2);
    Y:=Copy(Tarih,7,4);
    Tarih:=G+'/'+A+'/'+Y;
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    InputStr(G,Kolon,Row,2,True,['0'..'9'],2,TC);
    Move(G[1],Tarih[1],2);
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    if TC<>NULL then exit;
    InputStr(A,Kolon+3,Row,2,True,['0'..'9'],2,TC);
    Move(A[1],Tarih[4],2);
    if TC<>NULL then exit;
    WriteStr(Kolon,Row,Tarih,NormalAttr);
    InputStr(Y,Kolon+6,Row,4,True,['0'..'9'],4,TC);
    Move(Y[1],Tarih[7],4);
    WriteStr(Kolon,Row,Tarih,NormalAttr);
end;

Procedure UCaseChar;Near; Assembler;
Asm
      OR	AL,AL
      JE	@@15
      CMP       AL,'á'
      JNE       @@1
      MOV       AL,'Ä'
      JMP       @@15
@@1:  CMP       AL, 'ß'
      JNE       @@2
      MOV       AL,'¶'
      JMP       @@15
@@2:  CMP       AL, 'ç'
      JNE       @@3
      MOV       AL, 'I'
      JMP       @@15
@@3:  CMP       AL, 'i'
      JNE       @@4
      MOV       AL, 'ò'
      JMP       @@15
@@4:  CMP       AL,'î'
      JNE       @@5
      MOV       AL,'ô'
      JMP       @@15
@@5:  CMP       AL, 'ü'
      JNE       @@6
      MOV       AL, 'û'
      JMP       @@15
@@6:  CMP       AL, 'Å'
      JNE       @@7
      MOV       AL, 'ö'
      JMP       @@15
@@7:  CMP	AL,'a'
      JB	@@15
      CMP	AL,'z'
      JA	@@15
      SUB	AL,20H
@@15:
end;

Procedure ConvertChar; Near; Assembler;
Asm
        CALL    UCaseChar
	CMP     AL , 'Ä'
        JNE     @@2
        MOV     AL,68
        JMP     @@16
@@2:    CMP     AL , '¶'
        JNE     @@3
        MOV     AL,73
        JMP     @@16
@@3:    CMP     AL , 'ò'
        JNE     @@4
        MOV     AL,76
        JMP     @@16
@@4:    CMP     AL , 'ô'
        JNE     @@5
        MOV     AL,83
        JMP     @@16
@@5:    CMP     AL , 'û'
        JNE     @@6
        MOV     AL,88
        JMP     @@16
@@6:    CMP     AL , 'ö'
        JNE     @@7
        MOV     AL,91
        JMP     @@16
@@7:    CMP     AL ,'C'
        JLE     @@16
        INC     AL
        CMP     AL,'G'+1
        JLE     @@16
        INC     AL
        CMP     AL,'I'+2
        JLE     @@16
        INC     AL
        CMP     AL,'O'+3
        JLE     @@16
        INC     AL
        CMP     AL,'S'+4
        JLE     @@16
        INC     AL
        CMP     AL,'U'+5
        JLE     @@16
        INC     AL
@@16:
end;


Procedure RestoreChar; Near; Assembler;
Asm

        CMP     AL, 68
        JNE     @@2
        MOV     AL, 'Ä'
        JMP     @@16
@@2:    CMP     AL , 73
        JNE     @@3
        MOV     AL,  '¶'
        JMP     @@16
@@3:    CMP     AL , 76
        JNE     @@4
        MOV     AL, 'ò'
        JMP     @@16
@@4:    CMP     AL , 83
        JNE     @@5
        MOV     AL,  'ô'
        JMP     @@16
@@5:    CMP     AL ,88
        JNE     @@6
        MOV     AL,  'û'
        JMP     @@16
@@6:    CMP     AL , 91
        JNE     @@7
        MOV     AL,  'ö'
        JMP     @@16
@@7:    CMP     AL,'U'+5
        JLE     @@8
        DEC     AL
@@8:    CMP     AL,'S'+4
        JLE     @@9
        DEC     AL
@@9:    CMP     AL,'O'+3
        JLE     @@10
        DEC     AL
@@10:   CMP     AL,'I'+2
        JLE     @@11
        DEC     AL
@@11:   CMP     AL,'G'+1
        JLE     @@12
        DEC     AL
@@12:   CMP     AL ,'C'
        JLE     @@16
        DEC     AL
@@16:
end;
Procedure Change; near; Assembler;
Asm
      CALL     ConvertChar
      CMP      AL, 'A'
      JB       @@1
      DEC      AL
@@1:  SUB      AL, 32
end;
Procedure Geri; near; Assembler;
Asm
      CMP     AL, 32
      JB      @@1
      ADD     AL, 1
@@1:  ADD     AL, 32
      CALL    RestoreChar
end;

Procedure BitMap(Var S, T; L : Byte{must be a multiple of 4}); Assembler;
asm
    CLD
    PUSH    DS
    LDS     SI, S
    LES     DI, T
    LODSB
    MOV     CL, L
    SHR CL, 1
    SHR CL, 1
    XOR CH, CH

@@1:
    LODSB
    CALL    Change
    MOV     BH, AL
    LODSB
    CALL    Change
    MOV     BL, AL
    LODSB
    CALL    Change
    MOV     AH, AL
    LODSB
    CALL    Change

    SHL     BL, 1
    SHL     BL, 1
    SHL     BX, 1
    SHL     BX, 1

    MOV     DH, AH

    SHR     DH, 1
    SHR     DH, 1

    OR      BL, DH

    AND     AH, 3
    SHL     AL, 1
    SHL     AL,1
    SHR     AX, 1
    SHR     AX, 1

    MOV     AH, AL

    MOV     AL, BH
    STOSB
    MOV     AL, BL
    STOSB
    MOV     AL, AH
    STOSB

    LOOP    @@1
    POP     DS
end;

Procedure AcMap(Var S, T; L : Byte{must be a multiple of 4}); Assembler;
asm
    CLD
    PUSH    DS
    LDS     SI, T
    LES     DI, S
    MOV     AL, L
    STOSB
    MOV     CL, L
    SHR CL, 1
    SHR CL, 1
    XOR CH, CH
@@1:
    LODSB
    MOV     BH, AL
    LODSB
    MOV     BL, AL
    LODSB
    MOV     AH, AL

    MOV     AL, BH

    SHR     AL, 1
    SHR     AL, 1
    CALL    Geri
    STOSB

    AND     BH, 3

    SHL     BX,1
    SHL     BX,1
    SHL     BX,1
    SHL     BX,1

    MOV     AL, BH
    CALL    Geri
    STOSB

    MOV     BH, BL

    SHR     BH, 1
    SHR     BH, 1
    SHR     BH, 1
    SHR     BH, 1

    MOV     BL, AH

    SHL     BX, 1
    SHL     BX, 1

    MOV     AL, BH
    CALL    Geri
    STOSB

    MOV     AL, BL
    SHR     AL, 1
    SHR     AL, 1
    CALL    Geri
    STOSB
    LOOP    @@1

    POP     DS
end;

function StrComp(Str1, Str2: String): Integer; Assembler;
asm
	PUSH    DS
	LDS     SI, Str1
	LES     DI, Str2
        XOR     CX, CX
	CLD
	LODSB
	MOV     AH,ES:[DI]
	INC     DI
	MOV     CL,AL
	CMP     CL,AH
	JBE     @@1
	MOV     CL,AH
@@1:    XOR     CH,CH
	REPE    CMPSB
	JE      @@2
	MOV	AL,DS:[SI-1]
        CALL    ConvertChar
        MOV     AH, AL
        MOV     AL, ES:[DI-1]
	CALL    ConvertChar
	XCHG    AL, AH
@@2:    SUB     AL,AH
	SBB     AH,AH
	POP	DS
end;


function UpCaseStr(Str:String): String;Assembler;
asm
	PUSH    DS
	LDS     SI,Str
	LES     DI,@Result

        XOR    CX, CX

	CLD
	LODSB
        STOSB
        MOV     CL, AL
        JCXZ    @@2
@@1:    LODSB
        CALL    UCaseChar
        STOSB
        LOOP    @@1
@@2:
	POP	DS
end;

function UCase(C : Char): CHAR; Assembler;
Asm
	MOV     AL, C
        CALL    UCaseChar
end;

procedure ClearForm;
begin
   Clrscr;
   WriteStr(1,WinLastRow,Spaces(WinLastCol), NormalAttr);
end;

  Function Min(X, Y : Integer):Integer;
  begin
    Min:=X; If Y<X then Min:=Y
  end;
  Function Max(X, Y : Integer):Integer;
   begin
    Max:=X; If Y>X then Max:=Y
  end;
begin
   Initilize;
   InitMenu;
end.

