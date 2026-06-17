include Object.inc

; Base object type

OBJECT Base
  METHOD Done

  ;   ColSay          : Byte;
  ;   EdY             : Word;
  ;   EdX             : Byte;
  ;   EdRow,EdCol     : Byte;
  ;   Bas, Son        : Word;
  ;   TabStop         : ARRAY[1..10] OF BYTE;


OBJECT Cursor,Base
  FIELD ColSay,BYTE,1
  FIELD EdY,WORD,1
  FIELD EdX,BYTE,1
  FIELD EdRow,BYTE,1
  FIELD EdCol,BYTE,1
  FIELD Bas,WORD,1
  FIELD Son,WORD,1
  FIELD TabStop,BYTE,10
  METHOD ShowLine

OBJECT IkiKod, Cursor
  FIELD  MaxKod, BYTE, 1
  FIELD  NuKod,  BYTE, 1
  FIELD  Len,    BYTE, 1
  FIELD  Aktif,  BYTE, 1
  FIELD  KD   ,  WORD, 1

        LOCALS  @@


DATA    SEGMENT WORD PUBLIC

        EXTRN   WindMin:WORD,WindMax:WORD

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE,DS:DATA

        PUBLIC  Cursor@CursorDown

Cursor@CursorDown PROC FAR


@Self           EQU     (DWORD PTR [BP+6])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     AX, ES:[DI].CurSor@EdY
        CMP     AX, ES:[DI].CurSor@Son
        JE      @@1
        INC     ES:[DI].Cursor@EdY
        INC     BYTE PTR ES:[DI].Cursor@EdRow
        MOV     CX, WINDMIN
        MOV     DX, WINDMAX
        MOV     AL, DH
        SUB     AL, CH
        INC     AL
        CMP     BYTE PTR ES:[DI].Cursor@EdRow, AL
        JLE     @@1
        MOV     BYTE PTR ES:[DI].Cursor@EdRow, AL
	MOV     AX, 0601H
	MOV     BH, 7
	INT     10H
@@1:    POP     BP
        RETF    4
Cursor@CursorDown ENDP

	  PUBLIC Cursor@CursorUp

Cursor@CursorUp PROC FAR

@Self           EQU     (DWORD PTR [BP+6])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     AX, ES:[DI].CurSor@EdY
        CMP     AX, ES:[DI].CurSor@Bas
        JE      @@1
        DEC     ES:[DI].Cursor@EdY
        DEC     ES:[DI].Cursor@EdRow
        CMP     ES:[DI].Cursor@EdRow, 1
        JAE     @@1
        MOV     ES:[DI].Cursor@EdRow, 1
	MOV     AX, 0701H
        MOV     CX, WINDMIN
        MOV     DX, WINDMAX
        MOV     BH, 7
        INT     10H
@@1:    POP     BP
        RETF    4
Cursor@CursorUp ENDP

	PUBLIC Cursor@CursorTab
Cursor@CursorTab  PROC FAR

@Self           EQU     (DWORD PTR [BP+6])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        XOR     BX, BX
        MOV     BL,ES:[DI].CurSor@EdX
        INC     BL
        CMP     ES:[DI].CurSor@ColSay,BL
        JAE     @@1
        MOV     BL,1
@@1:    MOV     ES:[DI].Cursor@EdX, BL
        MOV     AL, ES:[DI].BX.Cursor@TabStop
        MOV     ES:[DI].Cursor@EdCol, AL
	POP     BP
        RETF    4
Cursor@CursorTab ENDP


            PUBLIC     IkiKod@Search
            ; Function    Search(S:String; Var Yer:Byte):Boolean;
IkiKod@Search    PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     (DWORD PTR [BP+10])
@S              EQU     (DWORD PTR [BP+14])


        PUSH    BP
        MOV     BP,SP

        PUSH    DS
        LES     DI,@Self

        LDS     SI, @S

        CLD
        LODSB
	CMP     AL, 2
	JB      @@3
        LODSW
        XOR     CX, CX
        MOV     CL, ES:[DI].IkiKod@NuKod
	JCXZ    @@3

	MOV     BX, 0

@@1:    CMP     AX, ES:[DI].BX.IkiKod@KD
        JNE     @@2
	MOV     AX, BX
	SHR     AX, 1
	INC     AX
	LES     DI, @Yer
	STOSW
        MOV     AX, 1
        JMP     @@4
@@2:    INC     BX
	INC     BX
        LOOP    @@1
@@3:    XOR     AX, AX
@@4:    POP     DS
        POP     BP
        RETF    12

IkiKod@Search  ENDP

            PUBLIC     IkiKod@KOD
            ;Function    KOD(Yer : Word)   : String;
IkiKod@KOD    PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     (WORD PTR [BP+10])
@ResultPtr      EQU     (DWORD PTR [BP+12])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
	MOV     BX, @Yer
	DEC     BX
        SHL     BX, 1
        MOV     AX, ES:[DI].[BX].IkiKod@KD
        LES     DI,@ResultPtr
        MOV     BYTE PTR ES:[DI], 2
        MOV     WORD PTR ES:[DI+1], AX
        POP     BP
	RETF    6
IkiKod@KOD  ENDP

            PUBLIC     IkiKod@KODAD
            ;KODAD(Yer : Word) : String;

IkiKod@KODAD    PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     (WORD PTR [BP+10])
@ResultPtr      EQU     (DWORD PTR [BP+12])

        PUSH    BP
        MOV     BP,SP
        PUSH    DS


        LDS     SI,@Self
        LES     DI,@ResultPtr

        CLD
	MOV     AL, DS:[SI].IkiKod@Len

        STOSB
        MOV     CL, AL
        XOR     CH, CH
        JCXZ    @@2

        MOV     AX, @Yer
        DEC     AX

        MUL     CX

        XOR     BX, BX
	MOV     BL, DS:[SI].IkiKod@MaxKod
        SHL     BL, 1

	ADD     SI, AX
	ADD     SI, BX
	ADD     SI, IkiKod@KD

        REP     MOVSB
@@2:    POP     DS
        POP     BP
	RETF    6

IkiKod@KODAD  ENDP

            PUBLIC     IkiKod@SetKod
            ;Procedure   SetKod(S:String; Yer:Word);

IkiKod@SetKod    PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     (WORD PTR [BP+10])
@S              EQU     (DWORD PTR [BP+12])

        PUSH    BP
	MOV     BP,SP
	MOV     DX, DS
	CLD
	LDS     SI, @S
	LODSB
	LODSW
	LES     DI,@Self
	MOV     BX, @Yer
	DEC     BX
	SHL     BX, 1
	MOV     ES:[DI].[BX].IkiKod@KD, AX
	MOV     DS, DX
	POP     BP
	RETF    10
IkiKod@SetKod  ENDP

            PUBLIC     IkiKod@SetKodAd
            ;Procedure   SetKodAd(S:String; Yer:Word);

IkiKod@SetKodAd    PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     (WORD PTR [BP+10])
@S              EQU     (DWORD PTR [BP+12])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
	PUSH    DS
	LDS     SI,@S

	XOR     CH, CH
	MOV     CL, ES:[DI].IkiKod@Len
	JCXZ    @@2

	MOV     AX, @Yer
	DEC     AX

	XOR     BH, BH
        MOV     BL, ES:[DI].IkiKod@MaxKod
        OR      BL, BL
        JE      @@2

        SHL     BX,1
        ADD     DI, BX
        ADD     DI, IkiKod@KD
        MUL     CX
        ADD     DI, AX
        PUSH    DI
        CLD
        MOV     AL,' '
        MOV     BX, CX
        REP     STOSB
        POP     DI
        LODSB
        MOV     CL, AL
        XOR     CH, CH
        JCXZ    @@2
        CMP     CL, BL
        JLE     @@1
        MOV     CL, BL
@@1:    REP     MOVSB
@@2:    POP     DS
	POP     BP
	RETF    10
IkiKod@SetKodAd  ENDP

CODE    ENDS

        END

