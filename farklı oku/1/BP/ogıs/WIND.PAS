unit wind;
interface
uses Crt,dos;
Const
   LoByte =0;
   HiByte =1;
   CrtMode   = $49;
   CrtWidth  = $4A;
const  {-- the following constants represent the contents of the Video card-}
       MDA       = 0;                         {  MDA and HGC                }
       CGA       = 1;
       EGA       = 2;
       EGA_MONO  = 3;                         { EGA on MDA monitor          }
       VGA       = 4;
       VGA_MONO  = 5;                         { VGA on analog mono monitor  }
       MCGA      = 6;
       MCGA_MONO = 7;                         { MCGA on analog mono monitor }


Var
   CurWindMin, CurWindMax: Word;
   Color    : Boolean;
   VioCard, NumLine,  NumCol : Byte;
Type
     PCharArr=^TCharArr;
     TCharArr=Array[0..MaxInt] of Char;
     PWindow = ^TWindow;                   { pointer to a window descriptor }
     TWindow   = object                                  { window descriptor }
                   Attribute,                            { window attribute }
                   Handle,                    { key to accessing the window }
                   x1, y1,           { the corner coordinates of the window }
                   x2, y2,
                   ViewX1, ViewY1,        { coordinates of the visible area }
                   ViewX2, ViewY2,
                   curc, curr    : byte; { cursor coordinates before opening }
                   Buffer        : PCharArr;        { window buffer starts here }
                   Constructor Init(UX, UY, LX, LY, Attr : Byte);
                   procedure   PrintStr(X, Y: Byte; S: String; Attr: Byte);
                   procedure   PrintChar(X, Y, Count: Byte; C: Char; Attr: Byte);
                   procedure   WinFill(C: Char; Attr: Byte);
                   procedure   WinRead;
                   procedure   WinWrite;
                   function    Size: Word;
                   Procedure   SetView(WX1, WY1, WX2, WY2 : Byte);
                   Procedure   WinGotoXY(X,Y : Byte);
                   Procedure   SetWinDimView;
                   Procedure   SetWinDimWin;
                   Procedure   WinOpen;
                   procedure   WinClose;
                   procedure   WinShadow;
                   Procedure   WinOpenShadow;
                 end;

procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
procedure WriteChar(X, Y, Count: Byte; C: Char; Attr: Byte);
procedure FillWin(C: Char; Attr: Byte);
procedure ReadWin(var Buf);
procedure WriteWin(var Buf);
function  WinSize: Word;
implementation
procedure TWindow.WinShadow;
var Attr : byte;                     { the attribute to be manipulated }
    Line,                               { loop counter for processing lines }
    St,
    Column,                           { loop counter for processing columns }
    DeltaX, Line_Ofs, W   : integer;                         { distance to the next line }
begin
  St:=X2-3;
{  WriteChar(X2-3,Y1, 1, Buffer^[X2-2] ,Attr);
  WriteChar(X2-2,Y1, 1, Buffer^[X2-1] ,Attr);}
  for Line := Y1+1 to Y2 do
  begin
        Attr := Byte(Buffer^[St]);
        if Attr and 128 <> 0 then            { lighter background? }
           Attr := Attribute and 128             { yes, clear bit 7 }
        else                                    { no, normal background }
          Attr := Attr and 15;      { background is now black }
        if Attr and 8 <> 0 then              { lighter foreground? }
          Attr := Attr and (255 - 8);
        WriteChar(X2-3,Line, 1, Buffer^[St+1] ,Attr);
        WriteChar(X2-2,Line, 1, Buffer^[St+3] ,Attr);
        Inc(St,(X2-X1) SHL 1);
     end;
end;

Procedure TWindow.WinOpenShadow;
begin
  X2:=X2+2; Y2:=Y2+1;
  WinOpen;
  WinShadow;
end;




procedure TWindow.WinOpen;
begin
   GetMem(Buffer, Size);
   WinRead;
   WinFill('B', Attribute)
end;
procedure TWindow.WinClose;
begin
   WinWrite;
   FreeMem(Buffer, Size);
end;

procedure TWindow.WinGotoXY(X,Y : Byte);
begin
      GotoXY(X+ViewX1-1, Y+ViewY1-1);
end;
procedure PushOld;near;Assembler;Asm;
       MOV    AX, WindMin
       MOV    CurWindMin, AX
       MOV    AX, WindMax
       MOV    CurWindMax, AX
end;
procedure PopOld;near;Assembler;Asm;
       MOV    AX, CurWindMin
       MOV    WindMin, AX
       MOV    AX, CurWindMax
       MOV    WindMax, AX
end;

procedure TWindow.SetWinDimView;Assembler;Asm;
       CALL   PUSHOLD
       LES    DI, Self
       MOV    AL, ES:[DI+ViewX1]
       DEC    AL
       MOV    AH, ES:[DI+ViewY1]
       DEC    AH
       MOV    WindMin, AX
       MOV    AL, ES:[DI+ViewX2]
       DEC    AL
       MOV    AH, ES:[DI+ViewY2]
       DEC    AH
       MOV    WindMax, AX
end;
procedure TWindow.SetWinDimWin;Assembler;Asm;
       CALL   PUSHOLD
       LES    DI, Self
       MOV    AL, ES:[DI+X1]
       DEC    AL
       MOV    AH, ES:[DI+Y1]
       DEC    AH
       MOV    WindMin, AX
       MOV    AL, ES:[DI+X2]
       DEC    AL
       MOV    AH, ES:[DI+Y2]
       DEC    AH
       MOV    WindMax, AX
end;

Procedure   TWindow.SetView(WX1, WY1, WX2, WY2 : Byte);
begin
      ViewX1:=WX1; ViewY1:=WY1;        { coordinates of the visible area }
      ViewX2:=WX2; ViewY2:=WY2;
end;
Constructor TWindow.Init(UX, UY, LX, LY, Attr : Byte);
begin
      Attribute:=Attr;
      x1:=UX; y1:=UY;
      x2:=LX; y2:=LY;
      ViewX1:=X1; ViewY1:=Y1;        { coordinates of the visible area }
      ViewX2:=X2; ViewY2:=Y2;
      curc:=WhereX; curr:=WhereY;
end;
procedure   TWindow.PrintChar(X, Y, Count: Byte; C: Char; Attr: Byte);
begin
   WriteChar(X+ViewX1-1, Y+ViewY1-1, Count, C, Attr);
end;
procedure    TWindow.PrintStr(X, Y: Byte; S: String; Attr: Byte);
begin
   WriteStr(X+ViewX1-1, Y+ViewY1-1, S, Attr);
end;

procedure   TWindow.WinFill(C: Char; Attr: Byte);
begin
    SetWinDimView;
    FillWin(C, Attr);
    PopOld;
end;

procedure   TWindow.WinRead;
begin
   SetWinDimWin; ReadWin(Buffer^); PopOld;
end;
procedure   TWindow.WinWrite;
begin
   SetWinDimWin; WriteWin(Buffer^); PopOld;
end;
function    TWindow.Size: Word;
begin
   SetWinDimWin; Size:=WinSize; PopOld;
end;


{$L WIN}

procedure WriteStr(X, Y: Byte; S: String; Attr: Byte);
external {WIN};

procedure WriteChar(X, Y, Count: Byte; C: Char; Attr: Byte);
external {WIN};

procedure FillWin(C: Char; Attr: Byte);
external {WIN};

procedure WriteWin(var Buf);
external {WIN};

procedure ReadWin(var Buf);
external {WIN};

function WinSize: Word;
external {WIN};


begin
 color:=true;
 NumCol:=80; NumLine:=25;
end.


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

