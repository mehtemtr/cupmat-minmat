include object.inc

OBJECT Base
  METHOD Done


OBJECT Cursor,Base
  FIELD ColSay,BYTE,1
  FIELD EdY,WORD,1
  FIELD EdX,BYTE,1
  FIELD EdRow,BYTE,1
  FIELD EdCol,BYTE,1
  FIELD Bas,WORD,1
  FIELD Son,WORD,1
  FIELD TabStop,BYTE,10

OBJECT Select, Cursor
  FIELD   Say ,WORD,1
  FIELD   KeyL,WORD,1

OBJECT  Index, Select
  FIELD MaxKay,WORD, 1
  FIELD Sabit, BYTE, 9
  FIELD NdxAdr,WORD,1
  FIELD FileAdr,WORD,1
  FIELD IndexChange,BYTE,1
  FIELD KodPtr,DWORD,1
  FIELD VMTF,WORD,1
  FIELD F,BYTE, 128
  FIELD FirstFree,WORD,1
  FIELD Deltd, WORD,1
  FIELD RecLen,WORD,1
  FIELD MaxKy, WORD,1
  FIELD IsOpen,WORD,1
  FIELD Status,WORD,1
  FIELD Is, BYTE, 1


        LOCALS  @@
DATA    SEGMENT BYTE PUBLIC

        EXTRN  MaxAdLen : BYTE

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE, DS:DATA

FINDNDX   PROC  NEAR
        MOV     BX, ES:[DI].Select@KeyL
        MOV     CX, BX
        INC     BX
        INC     BX
        MUL     BX
	RET
FINDNDX  ENDP

        PUBLIC  Index@GetKey

Index@GetKey PROC FAR


@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     ( WORD PTR [BP+10])
@ResultPtr      EQU     ( DWORD PTR [BP+12])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     AX, @Yer
        CALL    FINDNDX
        MOV     DX, DS
        LDS     SI, ES:[DI].Index@KodPtr
        ADD     SI, AX
        LES     DI, @ResultPtr
	MOV     ES:[DI], CL
        INC     DI
        CLD
        REP     MOVSB
        MOV     DS, DX
        POP     BP
        RET     6
Index@GetKey   ENDP

        PUBLIC  Index@GetAdr

Index@GetAdr PROC FAR


@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     ( WORD PTR [BP+10])
        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     AX, @Yer
	CALL    FINDNDX
	MOV     DX, DS
	LDS     SI, ES:[DI].Index@KodPtr
	ADD     SI, AX
	ADD     SI, CX
	CLD
	LODSW
	MOV     DS, DX
        POP     BP
        RET     6
Index@GetAdr   ENDP

        PUBLIC  Index@SetKeyAdr

Index@SetKeyAdr PROC FAR


@Self           EQU     (DWORD PTR [BP+6])
@Adres          EQU     ( WORD PTR [BP+10])
@Yer            EQU     ( WORD PTR [BP+12])
@S              EQU     ( DWORD PTR [BP+14])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     AX, @Yer
	CALL    FINDNDX

        LES     DI, ES:[DI].Index@KodPtr
	ADD     DI, AX

        MOV     DX, DS
	MOV     BX, CX
	MOV     AL,' '
        CLD
        REP     STOSB
        MOV     AX, @Adres
        STOSW
        SUB     DI, BX
        DEC     DI
        DEC     DI
        LDS     SI, @S
	LODSB
	MOV     CX, BX
        CMP     CL, AL
        JGE     @@1
        MOV     AL, CL
@@1:    MOV     CL, AL
        JCXZ    @@2
        REP     MOVSB
@@2:    MOV     DS, DX
        POP     BP
        RET     12
Index@SetKeyAdr   ENDP

;COMPAR PROC NEAR
;       PUSH  CX
;       PUSH  SI
;       ; IS A >= B
       ; DS:SI -- A  ES:DI -- B
       ; CX  HAS LEN
;       CLD
;       REPZ CMPSB
;       POP SI
;       POP CX
;       RET
;COMPAR ENDP

;BINSEARCH PROC NEAR
;       @M       EQU  ( WORD PTR [BP - 8] )
;       @YER     EQU  ( WORD PTR [BP - 4] )
;       @L       EQU  ( WORD PTR [BP - 6] )
;       @NUREC   EQU  ( WORD PTR [BP - 2] )
;       @RECLEN  EQU  ( WORD PTR [BP - 10] )
;
       ; ES:DI --- START OF REC
       ; DS:SI --- SREC
       ; AX    --- SAY
       ; CX    --- LEN
       ; BX    --- RECL
;       PUSH    BP
;       MOV     BP, SP
;       SUB     SP, 10

;       MOV    @L, 1
;       MOV    @NUREC, AX
;       INC    AX
;       MOV    @YER , AX
;       MOV    @RECLEN , BX

;@@1:   MOV   BX, @L
;       MOV   AX, @YER
;       CMP   BX, AX       ; WHILE L < YER DO
;       JGE   @@4

;       ADD   AX, BX
;       SHR   AX, 1

;       MOV   @M, AX
;       MUL   @RECLEN
;       MOV   DX, DI
;       ADD   DI, AX
;       CALL  COMPAR
;       MOV   DI, DX
;       JA    @@2
;       MOV   AX, @M
;       MOV   @YER, AX
;       JMP   @@1
;@@2:   MOV   AX, @M
;       INC   AX
;       MOV   @L, AX
;       JMP   @@1

;@@4:   MOV   BX, @YER
;       XOR   AX, AX
;       CMP   BX, @NUREC
;       JG    @@5

;       MOV   AX, BX
;       MUL   @RECLEN
;       MOV   DX, DI
;       ADD   DI, AX
;       XOR   AX, AX
;       CALL  COMPAR
;       MOV   DI, DX
;       JNE   @@5
;       MOV   AX, 1
;@@5:   MOV   SP, BP
;       POP   BP
;       RET
;BINSEARCH ENDP


;        PUBLIC Index@Search

;Index@Search PROC FAR

;@Self           EQU     (DWORD PTR [BP+6])

;@Adres          EQU     (DWORD PTR [BP+10])
;@Yer            EQU     (DWORD PTR [BP+14])
;@S              EQU     (DWORD PTR [BP+18])

;        PUSH    BP
;        MOV     BP, SP
;        PUSH    DS
;        LDS     SI, @S
;	LODSB
;	XOR     CH, CH
;        MOV     CL, AL
;        XOR     AX, AX
;        CLD
;        LES     DI, @YER
;        STOSW
;        LES     DI,@Adres
;        STOSW
;        JCXZ    @@3
;        LES     DI,@Self
;        MOV     AX, ES:[DI].Select@Say
;        MOV     BX, ES:[DI].Select@KeyL
;        CMP     CL, BL
;        JLE     @@1
;	MOV     CL, BL
;@@1:    INC     BX
;        INC     BX
;        LES     DI, ES:[DI].Index@KodPtr
;        CALL    BINSEARCH
;        LES     DI, @YER
;        MOV     ES:[DI], BX
;        OR      AX, AX
;        JE      @@3
;	LES     DI, @SELF
;        MOV     AX, BX
;	CALL    FINDNDX
;	LDS     SI, ES:[DI].Index@KodPtr
;	ADD     SI, AX
;	ADD     SI, CX
;	CLD
;	LODSW
;        LES     DI, @Adres
;        STOSW
;        MOV     AX, 1
;@@3:    POP     DS
;        POP     BP
;	RET     16
;
;Index@Search   ENDP

        PUBLIC Index@InsIndex

Index@InsIndex PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     ( WORD PTR [BP+10])
@X              EQU     ( WORD PTR [BP-2] )
@Y              EQU     ( WORD PTR [BP-4] )

	PUSH    BP
	MOV     BP, SP
	SUB     SP, 4
	LES     DI, @SELF
	MOV     AX, ES:[DI].Index@MaxKay
	CMP     AX, @Yer
	JB      @@1
	MOV     AX, ES:[DI].Select@Say
	INC     AX
	CMP     AX, @Yer
	JB      @@1
        MOV     BYTE PTR ES:[DI].Index@IndexChange, 1
	MOV     ES:[DI].Select@Say, AX
	MOV     BX, ES:[DI].Select@KeyL
	INC     BX
	INC     BX
	MUL     BX
	MOV     @X, AX           ; X = NUREC*RECL

	MOV     AX, @YER
	MUL     BX
	MOV     @Y, AX           ; Y = YER*RECL

	MOV      DX, DS          ; SAVE DATA SEGMENT

	MOV      CX, @X
	SUB      CX, @Y

	JZ       @@1
	LDS      SI,ES:[DI].Index@KodPtr
	LES      DI,ES:[DI].Index@KodPtr

	ADD      SI, @X
	DEC      SI
	MOV      DI, SI
	ADD      DI, BX
	STD
	REP      MOVSB
	MOV      DS,DX

@@1:    MOV      SP, BP
	POP      BP
	RET      6
Index@InsIndex ENDP

        PUBLIC Index@DelIndex

Index@DelIndex PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@Yer            EQU     ( WORD PTR [BP+10])
@X              EQU     ( WORD PTR [BP-2] )
@Y              EQU     ( WORD PTR [BP-4] )

	PUSH    BP
	MOV     BP, SP
	SUB     SP, 4
	LES     DI, @SELF
	MOV     AX, ES:[DI].Select@Say
	CMP     AX, @Yer
	JB      @@1
	CMP     @Yer,0
	JLE     @@1
        MOV     BYTE PTR ES:[DI].Index@IndexChange, 1
	MOV     AX, ES:[DI].Select@Say
	DEC     AX
	MOV     ES:[DI].Select@Say, AX
	MOV     BX, ES:[DI].Select@KeyL
	INC     BX
	INC     BX
	INC     AX
	MUL     BX
	MOV     @X, AX

	MOV     AX, @YER
	MUL     BX
	MOV     @Y, AX

	MOV      DX, DS

	MOV      CX, @X
	SUB      CX, @Y
	JZ       @@1
	LDS      SI,ES:[DI].Index@KodPtr
	LES      DI,ES:[DI].Index@KodPtr
	ADD      DI,@Y
	MOV      SI,DI
	ADD      SI,BX
	CLD
	REP      MOVSB
	MOV      DS,DX
@@1:    MOV      SP, BP
	POP      BP
	RET      6
Index@DelIndex   ENDP

        PUBLIC  Index@GetIs

Index@GetIs PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     ( DWORD PTR [BP+10])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     CX, ES:[DI].Select@KeyL
        MOV     DX, DS
        LDS     SI, @Self
        ADD     SI, Index@Is
        LES     DI, @ResultPtr
	MOV     ES:[DI], CL
        INC     DI
        CLD
        REP     MOVSB
        MOV     DS, DX
        POP     BP
        RET     4
Index@GetIs   ENDP

        PUBLIC  Index@GetAd

Index@GetAd PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@ResultPtr      EQU     ( DWORD PTR [BP+10])

        PUSH    BP
        MOV     BP,SP
        LES     DI, @ResultPtr
        XOR     CH, CH
        MOV     CL, MaxAdLen
        MOV     BL, CL
        MOV     ES:[DI], CL
        INC     DI
        MOV     DX, DI
        MOV     AL,' '
        CLD
        REP     STOSB             ; FILL IT WITH BLANKS
        MOV     DI, DX

        MOV     DX, DS
        LDS     SI,@Self
        MOV     CX, DS:[SI].Select@KeyL
        ADD     SI, Index@Is      ; ES:[DI] POINTS TO IS
        ADD     SI, CX
        XOR     CH, CH
        MOV     CL, DS:[SI]
        JCXZ    @@1
        INC     SI
        CLD
        REP     MOVSB
@@1:    MOV     DS, DX
        POP     BP
        RET     4
Index@GetAd   ENDP

        PUBLIC  Index@SetIs

Index@SetIs PROC FAR


@Self           EQU     (DWORD PTR [BP+6])
@S              EQU     ( DWORD PTR [BP+10])
        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     CX, ES:[DI].Select@KeyL
        MOV     DX, CX            ; SAVE KEYL IN DX
        ADD     DI, Index@Is      ; ES:[DI] POINTS TO IS
        MOV     BX, DI
        MOV     AL,' '
        CLD
        REP     STOSB             ; FILL IT WITH BLANKS
        MOV     DI, BX            ; RESTORE DI
        ADD     DI, DX            ; ADD KEYL
        DEC     DI                ; POINT TO THE END OF IS
        MOV     BX, DS            ; SAVE DS
        LDS     SI, @S
	MOV     CL, DS:[SI]
        XOR     CH, CH
        JCXZ    @@2               ; IF LENGTH(S)=0 THEN EXI
        CMP     DX, CX
        JGE     @@1
        MOV     CX, DX
@@1:    ADD     SI, CX            ; POINT TO THE END OF S
        STD                       ;
        REP     MOVSB             ; MOV S INTO S
@@2:    MOV     DS, BX
        CLD
        POP     BP
        RET     8

Index@SetIs   ENDP

        PUBLIC  Index@SetAd

Index@SetAd PROC FAR

@Self           EQU     (DWORD PTR [BP+6])
@S              EQU     ( DWORD PTR [BP+10])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     CX, ES:[DI].Select@KeyL
        ADD     DI, Index@Is      ; ES:[DI] POINTS TO IS
        ADD     DI, CX
        MOV     BX, DI
        XOR     CH, CH
        MOV     CL, MaxAdLen
        MOV     DL, CL
        MOV     ES:[DI], CL
        INC     DI
        MOV     AL,' '
        CLD
        REP     STOSB             ; FILL IT WITH BLANKS
        MOV     DI, BX            ; RESTORE DI
        MOV     BL, DL
        MOV     DX, DS
        LDS     SI, @S
        XOR     CH, CH
        MOV     CL, DS:[SI]
        CMP     CL, BL
        JLE     @@1
        MOV     CL, BL
        MOV     DS:[SI], CL
        DEC     CL
        INC     SI
        INC     DI
@@1:    INC     CX
        CLD
        REP     MOVSB
        MOV     DS, DX
        POP     BP
        RET     8
Index@SetAd   ENDP

        PUBLIC  Index@SetRecNil

Index@SetRecNil PROC FAR

@Self           EQU     (DWORD PTR [BP+6])

        PUSH    BP
        MOV     BP,SP
        LES     DI,@Self
        MOV     CX, ES:[DI].Select@KeyL
        MOV     BX, ES:[DI].Index@RecLen
        SUB     BX, CX
        ADD     DI, Index@Is      ; ES:[DI] POINTS TO IS
        MOV     AL,' '
        CLD
        REP     STOSB             ; FILL IT WITH BLANKS
        MOV     CX, BX
        XOR     AX, AX
        REP     STOSB
        POP     BP
        RET     4
Index@SetRecNil   ENDP

CODE ENDS
END


