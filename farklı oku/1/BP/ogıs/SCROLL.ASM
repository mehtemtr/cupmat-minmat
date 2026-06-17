
        LOCALS  @@


DATA    SEGMENT WORD PUBLIC

        EXTRN   WindMin:WORD,WindMax:WORD

DATA    ENDS

CODE    SEGMENT BYTE PUBLIC

        ASSUME  CS:CODE,DS:DATA


ScrollCommon:
        MOV     CX, WINDMIN
        MOV     DX, WINDMAX
        MOV     BH, 7
        INT     10H
        RET

InvColor PROC FAR  ; Function InvColor(Attr : Byte) : Byte;

        PUBLIC INVCOLOR

@Attr           EQU     (WORD PTR [BP+6])
   PUSH    BP
   MOV     BP, SP

   MOV     AX, @ATTR
   AND     AL, 77H
   ROR     AL, 1
   ROR     AL, 1
   ROR     AL, 1
   ROR     AL, 1
   OR      AL, 08H

   POP     BP
   RETF    2
InvColor   ENDP


; procedure ScrollUpWin;

        PUBLIC  ScrollUpWin

ScrollUpWin PROC FAR
        PUSH    BP
        MOV     BP,SP
        MOV     AX, 0601H
        CALL    ScrollCommon
        POP     BP
        RETF
ScrollUpWin ENDP

;procedure ScrollDownWin;

        PUBLIC  ScrollDownWin

ScrollDownWin  PROC FAR

        PUSH    BP
        MOV     BP,SP
        MOV     AX, 0701H
        CALL    ScrollCommon
        POP     BP
        RETF
ScrollDownWin ENDP

CODE ENDS
END
