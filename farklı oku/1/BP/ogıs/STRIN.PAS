unit StrIn;
interface

function  Ortala(L : Byte; S : String):String;
function  FindNum(S : String) : Integer;
procedure Strip(Var S);
procedure StripStr(var S : String; const Str: String; C : Char);
procedure SetBlankZero(Var S: String);
function  ParseWord(Var S, ArgStr: String; DelimChar : Char):Boolean;
function  StrComp(Str1, Str2: String): Integer;
function  ConstStr( Character : char; Amount : byte ) : string;
function  Spaces( Amount : byte ) : string;

Procedure EdTit(Var S, A : String);

function  StrToInt(S:String):Integer;
function  GercelToStr(Value : Word) : String;
function  StrToGercel(S : String): Word;

function  BuyukHarf(C : Char) : Char;
function  KucukHarf(C : Char) : Char;

function  LowCaseStr(Str:String): String;
function  UpCaseStr(Str:String): String;

procedure MoveBuf(var Dest; var Source; Attr: Byte; Count: Word);
procedure MoveChar(var Dest; C: Char; Attr: Byte; Count: Word);
procedure MoveCStr(var Dest; const Str: String; Attrs: Word);
procedure MoveStr(var Dest; const Str: String; Attr: Byte);
function  CStrLen(const S: String): Integer;
implementation
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

Procedure Strip(Var S ); Assembler;
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

Procedure UCaseChar;Near; Assembler;
Asm
      CMP       AL, 'Å'
      JNE       @@1
      MOV       AL, 'ö'
      RET
@@1:  CMP       AL, 'á'
      JNE       @@2
      MOV       AL, 'Ä'
      RET
@@2:  CMP       AL, 'ç'
      JNE       @@3
      MOV       AL, 'I'
      RET
@@3:  CMP       AL, 'î'
      JNE       @@4
      MOV       AL, 'ô'
      RET
@@4:  CMP       AL, 'ü'
      JNE       @@5
      MOV       AL, 'û'
      RET
@@5:  CMP       AL, 'ß'
      JNE       @@6
      MOV       AL, '¶'
      RET
@@6:  CMP       AL, 'i'
      JNE       @@7
      MOV       AL, 'ò'
      RET
@@7:  CMP	AL, 'a'
      JB	@@8
      CMP	AL, 'z'
      JA	@@8
      SUB	AL,20H
@@8:
end;
Procedure ConvertChar; Near; Assembler;
Asm
        CALL    UCaseChar
	CMP     AL , 'Ä'
        JNE     @@2
        MOV     AL, 68
        RET
@@2:    CMP     AL , '¶'
        JNE     @@3
        MOV     AL, 73
        RET
@@3:    CMP     AL , 'ò'
        JNE     @@4
        MOV     AL, 76
        RET
@@4:    CMP     AL, 'ô'
        JNE     @@5
        MOV     AL, 83
        RET
@@5:    CMP     AL , 'û'
        JNE     @@6
        MOV     AL, 88
        RET
@@6:    CMP     AL , 'ö'
        JNE     @@7
        MOV     AL, 91
        RET
@@7:    CMP     AL ,'C'
        JLE     @@8
        INC     AL
        CMP     AL,'G'+1
        JLE     @@8
        INC     AL
        CMP     AL,'I'+2
        JLE     @@8
        INC     AL
        CMP     AL,'O'+3
        JLE     @@8
        INC     AL
        CMP     AL,'S'+4
        JLE     @@8
        INC     AL
        CMP     AL,'U'+5
        JLE     @@8
        INC     AL
@@8:
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
function BuyukHarf(C : Char) : Char;assembler;
asm
        MOV      AL, C
        CALL     UcaseChar
end;

function KucukHarf(C : Char) : Char;
begin
  KucukHarf:=C;
  Case C of
  'Ä'  : KucukHarf :='á';
  '¶'  : KucukHarf :='ß';
  'I'  : KucukHarf :='ç';
  'ò'  : KucukHarf :='i';
  'ô'  : KucukHarf :='î';
  'û'  : KucukHarf :='ü';
  'ö'  : KucukHarf :='Å';
  else if ('A'<=C) and (C<='Z') then
    KucukHarf:=Char(Ord(C)+32);
  end;
end;
function  LowCaseStr(Str:String): String;
var i : integer;
    S : string;
begin
  S:=Str;
   for i:=1 to Length(S) do S[i]:=KucukHarf(S[i]);
   LowCaseStr:=S
end;

{ Buffer move routines }

procedure MoveBuf(var Dest; var Source; Attr: Byte; Count: Word); assembler;
asm
	MOV	CX,Count
	JCXZ	@@5
	MOV	DX,DS
	LES	DI,Dest
	LDS	SI,Source
	MOV	AH,Attr
	CLD
	OR	AH,AH
	JE	@@3
@@1:	LODSB
	STOSW
	LOOP	@@1
	JMP	@@4
@@2:	INC	DI
@@3:	MOVSB
	LOOP	@@2
@@4:	MOV	DS,DX
@@5:
end;

procedure MoveChar(var Dest; C: Char; Attr: Byte; Count: Word); assembler;
asm
	MOV	CX,Count
	JCXZ	@@4
	LES	DI,Dest
	MOV	AL,C
	MOV	AH,Attr
	CLD
	OR	AL,AL
	JE	@@1
	OR	AH,AH
	JE	@@3
	REP	STOSW
	JMP	@@4
@@1:	MOV	AL,AH
@@2:	INC	DI
@@3:	STOSB
	LOOP	@@2
@@4:
end;

procedure MoveCStr(var Dest; const Str: String; Attrs: Word); assembler;
asm
	MOV	DX,DS
	LDS	SI,Str
	CLD
	LODSB
	MOV	CL,AL
	XOR	CH,CH
	JCXZ	@@3
	LES	DI,Dest
	MOV	BX,Attrs
	MOV	AH,BL
@@1:	LODSB
	CMP	AL,'~'
	JE	@@2
	STOSW
	LOOP	@@1
	JMP	@@3
@@2:	XCHG	AH,BH
	LOOP	@@1
@@3:	MOV	DS,DX
end;

procedure MoveStr(var Dest; const Str: String; Attr: Byte); assembler;
asm
	MOV	DX,DS
	LDS	SI,Str
	CLD
	LODSB
	MOV	CL,AL
	XOR	CH,CH
	JCXZ	@@4
	LES	DI,Dest
	MOV	AH,Attr
	OR	AH,AH
	JE	@@3
@@1:	LODSB
	STOSW
	LOOP	@@1
	JMP	@@4
@@2:	INC	DI
@@3:	MOVSB
	LOOP	@@2
@@4:	MOV	DS,DX
end;

function CStrLen(const S: String): Integer; assembler;
asm
	LES	DI,S
	MOV	CL,ES:[DI]
	INC	DI
	XOR	CH,CH
	MOV	BX,CX
        JCXZ    @@2
	MOV	AL,'~'
        CLD
@@1:	REPNE	SCASB
	JNE	@@2
	DEC	BX
	JMP	@@1
@@2:	MOV	AX,BX
end;

Function StrToInt(S:String):Integer;
Var L , I : Integer;
begin
   Strip(S); SetBlankZero(S); Val(S,L,I);
   if I<>0 then StrToInt:=0 else StrToInt:=L;
end;

Procedure ByteVal; near; Assembler;
asm
     MOV     AL,' '
@@1: CMP     AH, 10
     JB      @@2
     SUB     AH, 10
     INC     AL
     JMP     @@1
@@2: ADD     AH, '0'
     CMP     AL, ' '
     JE      @@3
     ADD     AL, 16
@@3: STOSW
end;

Function GercelToStr(Value : Word) : String; Assembler;
asm
     CLD
     LES     DI, @Result;
     MOV     AL, 5
     STOSB
     MOV     BX, Value
     MOV     AH, BH
     CALL    ByteVal
     MOV     AL,'.'
     STOSB
     MOV     AH,BL
     CALL    ByteVal
     CMP     AL, ' '
     JNE     @@2
     MOV     BYTE PTR ES:[DI-2],'0'
@@2:
end;
Function StrToGercel(S : String): Word; Assembler;
asm
     XOR     DX, DX
     XOR     BX, BX
     CLD
     PUSH    DS
     LDS     SI, S
     LODSB
     MOV     CL, AL
     XOR     CH, CH
     JCXZ    @@4
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
@@2: CMP     AL, '.'
     JNE     @@3
     MOV     DH, BL
     XOR     BX, BX
@@3: LOOP    @@1
@@4: MOV     DL, BL
     POP     DS
     MOV     AX, DX
end;
procedure StripStr(var S : String; const Str: String; C : Char); assembler;
asm
	MOV	DX,DS
	LDS	SI, Str
        LES     DI, S
	CLD
	LODSB
        STOSB
	MOV	CL, AL
	XOR	CH,CH
	JCXZ	@@3
        XOR     BL, BL
	MOV	AH,  C
@@1:	LODSB
	CMP	AL, AH
	JE	@@2
	STOSB
        INC     BL
@@2:	LOOP	@@1
        LES     DI, S
        MOV     ES:[DI], BL
@@3:	MOV	DS,DX
end;
Procedure EdTit(Var S, A : String);
Var C, D : String;
    K, N, AL  : Integer;
begin
   D:='  '+ConstStr('ƒ',253);
   A:='  ';
   AL:=1;
   while ParseWord(S, C, '@') do begin
       K:=StrToInt(C);
       If K<>0 then begin
          ParseWord(S, C, '@');
          N:=Length(C);
          if N<K then N:=K;
          A:=A+ Ortala(N, C)+' ';
          AL:=Length(A);
          D[AL]:=' ';
       end;
   end;
   D[0]:=A[0];
   S:=D;
end;
function ConstStr( Character : char; Amount : byte ) : string;
var StrepString : String;
begin
  StrepString[0] := chr( Amount );
  FillChar( StrepString[1], Amount, Character );
  ConstStr := StrepString;
end;
function Spaces( Amount : byte ) : string;
begin
  Spaces:= ConstStr(' ',Amount);
end;
end.
