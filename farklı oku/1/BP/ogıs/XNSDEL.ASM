     .MODEL TPASCAL
     .CODE
     PUBLIC INSREC
     PUBLIC DELREC
     PUBLIC GETKOD
     PUBLIC SETKOD
     PUBLIC EXCHANGE
     PUBLIC COMPARE
     PUBLIC REVERSE
     PUBLIC BINSEARCH

 ;PROCEDURE INSREC( VAR REC;
 ;                  VAR INSX;
 ;                      YER  : INTEGER;
 ;                  VAR NUREC:INTEGER;
 ;                      RECL :INTEGER);
 ;GIVE AN ARRAY REC CONSISTING OF RECORDS OF LENGTH RECL, INSERT THE
 ;INSX RECORD INTO YER TH POSITION BY MOVING DOWN

 INSREC PROC FAR  REC:DWORD,INSX:DWORD,YER:WORD,NUREC:DWORD,RECL:WORD;
     LOCAL  X:WORD, Y:WORD = STSZ

     SUB      SP, STSZ        ; MAKE ROOM FOR LOCALS

     LES      DI, NUREC       ; ES:DI POINTS TO NUREC
     MOV      AX, ES:[DI]
     INC      AX              ; INCREASE NUREC
     CMP      AX, YER
     JC       CIKIS1          ; IF YER > NUREC THEN EXIT
     MOV      ES:[DI],AX      ; STORE BACK NUREC

     MOV      BX, RECL        ; SAVE RECL IN BX

     MUL      BX
     MOV      X, AX           ; X = NUREC*RECL

     MOV      AX, YER
     MUL      BX
     MOV      Y, AX           ; Y = YER*RECL

     MOV      DX, DS          ; SAVE DATA SEGMENT

     MOV      CX, X
     SUB      CX, Y

     JZ       PUTRECORD       ; IF NUREC = YER THEN NO NEED TO MOVE DATA

     LDS      SI,REC
     LES      DI,REC
     ADD      SI,X
     DEC      SI              ; DS:SI POINTS TO THE FIRST SOURCE WORD TO MOVE
     MOV      DI,SI
     ADD      DI,BX
     STD                      ; MOVE GOES DOWNWARD
     REP      MOVSB           ; NOW MOVE
PUTRECORD:                    ; NOW THAT MOVE IS DONE PUT RECORD
     LES      DI,REC          ; ES:DI POINTS TO BEGINNING OF REC

     ADD      DI,Y            ; ES:DI POINTS TO REC[YER]

     LDS      SI,INSX         ; DS:SI POINTS TO BEGINNING OF INSX

     MOV      CX,BX           ; CX = RECL


     CLD
     REP      MOVSB           ; MOVE INSX TO REC[YER]
     MOV      DS,DX           ; RESTORE DATA SEGMENT
CIKIS1:
     ADD      SP,STSZ
     RET
INSREC ENDP

 ;  PROCEDURE DELREC(VAR REC;
 ;                  VAR DELX;
 ;                      YER   : INTEGER;
 ;                  VAR NUREC : INTEGER;
 ;                      RECL  : INTEGER);
 ;GIVE AN ARRAY REC CONSISTING OF RECORDS OF LENGTH RECL, DELETE YER TH REC
 ;

 DELREC PROC FAR  REC:DWORD,DELX:DWORD,YER:WORD,NUREC:DWORD,RECL:WORD;
     LOCAL X:WORD, Y : WORD = STSIZE

     SUB      SP,STSIZE

     LES      DI,NUREC        ; ES:DI POINTS TO NUREC
     MOV      AX,ES:[DI]      ; GET NURECINTO AX
     CMP      AX, YER         ; IF YER > NUREC THEN EXIT
     JC       FINISDELREC
     DEC      AX              ; DECREASE NUREC
     MOV      ES:[DI],AX      ; STORE BACK NUREC

     MOV      BX, RECL        ; SAVE RECL IN BX
     INC      AX
     MUL      BX
     MOV      X, AX           ; X = (NUREC+1)*RECL

     MOV      AX, YER
     MUL      BX
     MOV      Y, AX           ; Y = YER*RECL

     MOV      DX, DS          ; SAVE DATA SEGMENT

     LES      DI,DELX         ; ES:DI POINTS TO DELX
     LDS      SI,REC          ; DS:SI POINTS TO REC
     ADD      SI,Y            ; DS:SI POINTS TO REC[YER]
     MOV      CX,BX           ; CX = RECL
     CLD
     REP      MOVSB           ; MOVE YER TH REC INTO DELX

     MOV      CX, X           ; CX = NUREC*RECL;
     SUB      CX, Y           ; CX=(NUREC+1-YER)*RECL

     JZ   FINISDELREC         ; IF NUREC = YER THEN NO NEED TO MOVE DATA

     LES      DI,REC
     LDS      SI,REC
     ADD      DI,Y            ; ES:DI POINTS TO REC[YER]
     MOV      SI,DI
     ADD      SI,BX           ; DS:SI POINTS TO REC[YER+1]
     CLD                      ; MOVE GOES UPWARD
     REP      MOVSB           ; NOW MOVE
     MOV      DS,DX
FINISDELREC:

     ADD SP,STSIZE
     RET
DELREC ENDP
;
;
;  PROCEDURE GETKOD( VAR REC;
;                    VAR KODSTR: KEYSTR;
;                    VAR ADRES : INTEGER;
;                        YER   : INTEGER;
;                        KEYL  : INTEGER);

GETKOD PROC FAR REC:DWORD,KODSTR : DWORD,ADRES:DWORD,YER:WORD, KEYL:WORD
     PUSH     DS              ; SAVE DS
     MOV      BX, KEYL
     MOV      AX, BX
     INC      AX
     INC      AX              ; AX = KEYL+2
     MOV      DX,AX           ; DX = KEYL+2
     MOV      AX,YER          ; AX = YER
     MUL      DX              ; AX = YER*(KEYL+2);
     LDS      SI,REC
     ADD      SI,AX           ; DS:SI POINTS TO KODADR[YER]
     LES      DI,KODSTR       ; ES:DI POINTS TO KODSTR
     MOV      AX,BX
     CLD
     STOSB                    ; LENGTH OF KODSTR = KEYL
     MOV      CX,BX
     REP      MOVSB           ; KODSTR = KODADR[YER]
     LES      DI,ADRES
     MOVSW
     POP      DS
     RET
GETKOD ENDP
;  PROCEDURE SETKOD( VAR REC;
;                        S    : KEYSTR;
;                        ADRES: INTEGER;
;                        YER  : INTEGER;
;                        KEYL : INTEGER);
SETKOD PROC FAR  REC:DWORD,KODSTR : DWORD,ADRES:WORD,YER : WORD, KEYL:WORD
     PUSH     DS              ; SAVE DS
     MOV      BX, KEYL
     MOV      AX, BX          ; AX = KEYL
     INC      AX
     INC      AX
     MOV      DX,AX           ; DX = KEYL+2
     MOV      AX,YER          ; AX = (KEYL+2)*YER
     MUL      DX
     LES      DI,REC
     ADD      DI,AX           ; ES:DI POINTS TO KODADR[YER]
     LDS      SI,KODSTR       ; DS:SI POINTS TO KODSTR[0]
     INC      SI              ; DS:SI POINTS TO KODSTR[1]
     MOV      CX, BX
     CLD
     REP      MOVSB           ; PUT KODSTR IN KODADR[YER]
     MOV      AX, ADRES
     STOSW                    ; PUT ADRES IN PLACE
     POP      DS              ; RESTORE TURBO'S DATA SEGMENT
     RET
SETKOD ENDP
; PROCEDURE EXCHANGE(VAR VAR1, VAR2; COUNT : INTEGER)
EXCHANGE PROC FAR VAR1 : DWORD, VAR2 : DWORD, COUNT : WORD
     CLD
     MOV     DX,DS
     LDS     SI, VAR1
     LES     DI, VAR2
     MOV     CX, COUNT
     SHR     CX,1
     JNC     EXCHANGEWORDS
     MOV     AL,ES:[DI]
     MOVSB
     MOV     [SI-1],AL
     JZ      FINISSWAP
EXCHANGEWORDS:
     MOV     BX,-2
EXCHANGELOOP:
     MOV     AX,ES:[DI]
     MOVSW
     MOV     [BX][SI],AX
     LOOP    EXCHANGELOOP
FINISSWAP:
     MOV     DS,DX
     RET
EXCHANGE ENDP

; PROCEDURE REVERSE(VAR REC; RECL, N1, N2:INTEGER);
REVERSE PROC FAR REC : DWORD,RECL : WORD, N1 : WORD, N2 : WORD
     PUSH    DS

     LES     DI, REC
     PUSH    ES
     POP     DS
     MOV     SI, DI

     MOV     BX, RECL

     MOV     AX, BX
     MUL     N1
     ADD     DI, AX           ;ES:DI POINTS TO REC[N1]

     MOV     AX, BX
     MUL     N2
     ADD     SI, AX           ;DS:SI POINTS TO REC[N2]

     MOV     DX, BX
     SHL     DX, 1

AGAIN:

     CMP     DI, SI
     JAE     FINISREVERSE
     CLD
     MOV     CX, BX
E2:
     MOV     AL,ES:[DI]
     MOVSB
     MOV     [SI-1],AL
     LOOP    E2

     SUB     SI, DX

     JMP     AGAIN
FINISREVERSE:
      POP    DS
      RET
REVERSE ENDP

; FUNTION COMPARE(VAR X1 , X2 ; COUNT : WORD):WORD;

COMPARE PROC FAR X1:DWORD,X2:DWORD,COUNT:WORD
       MOV DX,DS
       XOR AX,AX
       MOV CX,[COUNT]
       JCXZ FINI
       LDS SI,X1
       LES DI,X2
       CLD
       REPZ CMPSB
       JE FINI
       MOV AX,-1
       JC FINI
       MOV AX,1
FINI:
       MOV DS,DX
       RET
   COMPARE ENDP



  .MODEL TPASCAL
  .CODE


; FUNCTION BINSEARCH(VAR SREC, REC; VAR YER:INTEGER;
;                      NUREC, RECL, LEN : INTEGER) : BOOLEAN;
;
BINSEARCH PROC FAR SREC:DWORD,REC:DWORD,YER:DWORD,NUREC:WORD,RECL:WORD,LEN:WORD
  PUSH       DS              ; SAVE DS
  MOV        CX,[LEN]
  JCXZ       L4              ; QUIT IF LEN = 0, RETURNING TRUE
  LDS        SI,REC          ; DS:SI POINTS TO REC
  MOV        AX,NUREC        ;
  INC        AX              ;AX = R
  MOV        BX,1            ;BX = L
L1:
  CMP        BX,AX
  JNC        L3
  PUSH       AX             ; SAVE R
  ADD        AX,BX
  SHR        AX,1           ; AX = M
  PUSH       AX             ; SAVE M
  ;
  LDS        SI, REC        ; RESTORE SI VALUE
  MUL        RECL           ; AX=M*RECL
  ADD        SI,AX          ; DS:SI POINTS TO REC[M]
  LES        DI,SREC
  MOV        CX,LEN
  CLD
  REPZ       CMPSB
  JC         L2
  POP        AX             ;AX=M
  POP        DI             ;TO CLEAR STACK
  JMP        L1
L2:
  POP        BX             ; BX = M
  POP        AX             ; AX = R
  INC        BX             ; BX = M+1
  JMP        L1
L3:
  LES        DI,YER
  STOSW                     ; SAVE AX
  MUL        RECL           ; AX=YER*RECL
  LDS        SI,REC
  ADD        SI,AX          ; WHEN WE LEFT THE LOOP SI DOES HAVE ITS VALUE?NO
  MOV        CX,[LEN]       ; MOVE LEN TO CX
  JCXZ       L4             ; QUIT IF LEN = 0, RETURNING TRUE
  LES        DI,SREC        ; LOAD DESTINATION POINTER INTO ES:DI
  CLD                       ; SET DIRECTION TO FORWARD
  REPZ       CMPSB          ; COMPARE THE TWO AREAS
  JZ         L4             ; RETURN TRUE IF THE COMPARE WAS COMPLETED
  MOV        CL,1           ;
L4:
  MOV        AL,CL          ; IF CL = 0, RETURN TRUE, OTHERWISE RETURN FALSE
  XOR        AL,1
  POP        DS             ; RESTORE DS
  RET
BINSEARCH ENDP

CODE ENDS
END








