	LOCALS  @@

CODE    SEGMENT BYTE PUBLIC

	ASSUME  CS:CODE

	PUBLIC  InsRec

 ;PROCEDURE INSREC( VAR REC;
 ;                  VAR INSX;
 ;                      YER   : WORD;
 ;                  VAR NUREC : WORD;
 ;                      RECL  : WORD);


	    InsRec PROC FAR

@RECL           EQU ( WORD PTR [BP+6])
@NUREC          EQU ( DWORD PTR [BP+8])
@YER            EQU ( WORD PTR [BP+12])
@INSX           EQU ( DWORD PTR [BP+14])
@REC            EQU ( DWORD PTR [BP+18])

@X              EQU ( WORD PTR [BP - 2] )
@Y              EQU ( WORD PTR [BP - 4] )

	PUSH    BP
	MOV     BP,SP
	SUB     SP, 4

	LES     DI, @NUREC       ; ES:DI POINTS TO NUREC
	MOV     AX, ES:[DI]
	INC     AX              ; INCREASE NUREC
	CMP     AX, @YER
	JB      @@2
	CMP     @YER, 1
	JB      @@2
	MOV     BX, @RECL        ; SAVE RECL IN BX
	MOV     ES:[DI],AX      ; STORE BACK NUREC
	DEC     AX
	MUL     BX
	MOV     @X, AX           ; X = NUREC*RECL
	MOV     AX, @YER
	DEC     AX
	MUL     BX
	MOV     @Y, AX           ; Y = YER*RECL
	MOV     DX, DS          ; SAVE DATA SEGMENT
	MOV     CX, @X
	SUB     CX, @Y
	JCXZ    @@1
	LDS     SI,@REC
	LES     DI,@REC
	ADD     SI,@X
	DEC     SI
	MOV     DI,SI
	ADD     DI,BX
	STD
	REP      MOVSB
@@1:    LES      DI,@REC
	ADD      DI,@Y
	LDS      SI,@INSX
	MOV      CX, BX
	CLD
	REP      MOVSB           ; MOVE INSX TO REC[YER]
	MOV      DS,DX           ; RESTORE DATA SEGMENT
@@2:    ADD      SP,4
	POP      BP
	RET      16
INSREC ENDP

	PUBLIC  DelRec
 ;
 ;  PROCEDURE DELREC(VAR REC;
 ;                  VAR DELX;
 ;                      YER   : INTEGER;
 ;                  VAR NUREC : INTEGER;
 ;                      RECL  : INTEGER);



	DelRec PROC FAR

@RECL           EQU ( WORD PTR [BP+6])
@NUREC          EQU ( DWORD PTR [BP+8])
@YER            EQU ( WORD PTR [BP+12])
@DELX           EQU ( DWORD PTR [BP+14])
@REC            EQU ( DWORD PTR [BP+18])

@X              EQU ( WORD PTR [BP - 2] )
@Y              EQU ( WORD PTR [BP - 4] )

	PUSH    BP
	MOV     BP,SP
	SUB     SP, 4

	LES     DI, @NUREC
	MOV     AX, ES:[DI]
	CMP     AX, @YER
	JB      @@2
	CMP     @YER, 1
	JB      @@2
	DEC     AX
	MOV     ES:[DI],AX
	MOV     BX, @RECL
	MUL     BX
	MOV     @X, AX
	MOV     AX, @YER
	DEC     AX
	MUL     BX
	MOV     @Y, AX
	MOV     DX, DS
	LES     DI,@DELX
	LDS     SI,@REC
	ADD     SI,@Y
	MOV     CX,BX
	CLD
	REP     MOVSB
	MOV     CX, @X
	SUB     CX, @Y
	JCXZ    @@1
	LES     DI,@REC
	LDS     SI,@REC
	ADD     DI,@Y
	MOV     SI,DI
	ADD     SI,BX
	CLD
	REP     MOVSB
@@1:    MOV     DS,DX
@@2:    ADD     SP,4
	POP     BP
	RET     16
DelRec ENDP

	PUBLIC  WordAra

	; FUNCTION WORDARA(SREC:WORD; VAR REC; NUREC, RECL:WORD) : WORD;

	WordAra PROC FAR

@RECL           EQU ( WORD PTR [BP+6])
@NUREC          EQU ( WORD PTR [BP+8])
@REC            EQU ( DWORD PTR [BP+10])
@SREC           EQU ( WORD PTR [BP+14])

	PUSH    BP
	MOV     BP,SP
	LES     DI, @REC
	XOR     AX, AX
	MOV     CX, @NUREC
	MOV     BX, @RECL
	MOV     DX, @SREC
	SUB     DI,BX
@@1:    JCXZ    @@2
	INC     AX
	ADD     DI,BX
	CMP     DX, ES:[DI]
	JZ      @@2
	LOOP    @@1
	XOR     AX, AX
@@2:    POP     BP
	RET     10
WordAra ENDP

         PUBLIC  Reverse

         ; PROCEDURE REVERSE(VAR REC; RECL, N1, N2:WORD);

	Reverse PROC FAR

@N2              EQU ( WORD PTR [BP+6])
@N1              EQU ( WORD PTR [BP+8])
@RECL            EQU ( WORD PTR [BP+10])
@REC             EQU ( DWORD PTR [BP+12])

	PUSH    BP
	MOV     BP,SP
        PUSH    DS
        LES     DI, @REC
        MOV     DX, ES
        MOV     DS, DX
        MOV     SI, DI
        MOV     BX, @RECL
        MOV     AX, @N2
        CMP     AX, @N1
        JB      @@3
        DEC     @N1
        DEC     @N2

        MOV     AX, BX
        MUL     @N1
        ADD     DI, AX
        MOV     AX, BX
        MUL     @N2
        ADD     SI, AX
        MOV     DX, BX
        SHL     DX, 1
@@1:    CMP     DI, SI
        JAE     @@3
        CLD
        MOV     CX, BX
@@2:    MOV     AL,ES:[DI]
        MOVSB
        MOV     [SI-1],AL
        LOOP    @@2
        SUB     SI, DX
        JMP     @@1
@@3:    POP     DS
        POP     BP
        RET     10
Reverse ENDP



CODE ENDS
END


