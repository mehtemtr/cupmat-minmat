        LOCALS  @@
DATA    SEGMENT BYTE PUBLIC

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE, DS:DATA

;Procedure Strip(Str: String): Byte;
        PUBLIC  Strip

Strip PROC FAR
@Str            EQU     (DWORD PTR [BP+6])
        PUSH     BP
        MOV      BP,SP
	LES	 DI,@Str
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
@@3:    MOV      ES:[BX],CL
        POP      BP
        RET      4
Strip ENDP

;Procedure SetBlankZero(Str: PChar)
        PUBLIC  SetBlankZero

SetBlankZero PROC FAR
@Str            EQU     (DWORD PTR [BP+6])
        PUSH    BP
        MOV     BP,SP
	LES	DI,@Str
        XOR     CH, CH
        MOV     CL, ES:[DI]
        JCXZ    @@3
        INC     DI
        MOV     AL,' '
 @@1:   SCASB
        JNE    @@2
        DEC    DI
        MOV    BYTE PTR ES:[DI],'0'
        INC    DI
 @@2:   LOOP   @@1
 @@3:   POP    BP
        RET    4
SetBlankZero ENDP


;Function ParseWord(Var Str, AgrStr: PChar; C : Char):Boolean
        PUBLIC  ParseWord

ParseWord PROC FAR
@Str           EQU     (DWORD PTR [BP+12])
@ArgStr        EQU     (DWORD PTR [BP+8])
@C             EQU     ( WORD PTR [BP+6])
        PUSH    BP
        MOV     BP,SP
        PUSH     DS
        XOR      AX, AX
        LES      DI, @ArgStr
        CLD
        STOSB
        LES      DI, @Str
        XOR      CH, CH
        MOV      CL, ES:[DI]
        JCXZ     @@4   ; EXIT
        INC      DI
        MOV      AX, [@C]
        CLD
        REPZ     SCASB
        JE       @@2   ; SET AX = 0 AND EXIT
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
@@1:    LDS      SI, @Str
        MOV      SI, DX
        MOV      BH, CL
        MOV      CL, BL
        MOV      DX, DI
        LES      DI, @ARGSTR
        CLD
        MOV      ES:[DI], CL
        INC      DI
        REP      MOVSB
        INC      SI
        MOV      CL, BH
        LES      DI, @Str
        MOV      ES:[DI], BH
        JCXZ     @@4  ;EXIT
        INC      DI
        REP      MOVSB
        JMP      @@4
@@2:    XOR      AX, AX
@@4:    POP      DS
        POP      BP
        RET      10
ParseWord  ENDP

;function StrLen(Str: PChar): Byte;
        PUBLIC  StrLen

StrLen PROC FAR
@Str            EQU     (DWORD PTR [BP+6])
        PUSH    BP
        MOV     BP,SP
	LES	DI,@Str
        XOR     AX, AX
        MOV     AL, ES:[DI]
        POP     BP
        RET     4
StrLen   ENDP

;function GetStr(Str: PChar): String;
        PUBLIC  GetStr

GetStr PROC FAR
@Str            EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     ( DWORD PTR [BP+10])

        PUSH    BP
        MOV     BP,SP
        PUSH    DS
        LDS     SI,@Str
        XOR     CX, CX
        MOV     CL, DS:[SI]
        INC     CX
        LES     DI, @ResultPtr
        CLD
        REP     MOVSB
        POP     DS
        POP     BP
        RET     4
GetStr  ENDP
UCASECHAR  PROC NEAR
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
@@15: RET
UCASECHAR ENDP

CONVERT    PROC NEAR
        CALL    UCASECHAR
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
@@16:  	RET
CONVERT ENDP

;function StrComp(Str1, Str2: PChar): Integer;

	    PUBLIC     StrComp

StrComp PROC FAR

@Str2      EQU     (DWORD PTR [BP+6])
@Str1      EQU     (DWORD PTR [BP+10])

	PUSH    BP
	MOV     BP,SP
	PUSH    DS


	LDS     SI,@Str1
	LES     DI,@Str2

        XOR    CX, CX

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
        CALL    CONVERT
        MOV     AH, AL
        MOV     AL, ES:[DI-1]
	CALL    CONVERT
	XCHG    AL, AH
@@2:    SUB     AL,AH
	SBB     AH,AH
	POP	DS
        POP     BP
        RETF    8
StrComp ENDP




;function UpCaseStr(Str1:Pchar): String;

	    PUBLIC     UpCaseStr

UpCaseStr PROC FAR

@Str1      EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     ( DWORD PTR [BP+10])

	PUSH    BP
	MOV     BP,SP
	PUSH    DS


	LDS     SI,@Str1
	LES     DI,@ResultPtr

        XOR    CX, CX

	CLD
	LODSB
        STOSB
        MOV     CL, AL
        JCXZ    @@2
@@1:    LODSB
        CALL    UCASECHAR
        STOSB
        LOOP    @@1
@@2:
	POP	DS
        POP     BP
        RETF    4
UpCaseStr ENDP

;function UCase(C : Char): CHAR;

	    PUBLIC     UCase

UCase PROC FAR

@C      EQU     (WORD PTR [BP+6])

	PUSH    BP
	MOV     BP,SP
	MOV     AX, @C
        CALL    UCASECHAR
        RET     2
UCase ENDP

CODE ENDS
END








CODE ENDS
END









