         .MODEL TPASCAL
         .CODE
            EXTRN  WRITECHAR:PROC
            ; procedure WriteChar(X, Y, Count: Byte; Ch: Char; Attr: Byte);
          PUBLIC SPLITPRINT
SPLITPRINT PROC FAR X:WORD,Y:WORD,S:DWORD,ATTR:WORD
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

          PUSH      X
          PUSH      Y
          MOV       BX, 1
          PUSH      BX
          MOV       DX,ATTR
          CMP       AL,'@'
          JNE       @@2
          MOV       DX,7
          MOV       AL,' '
@@2:      PUSH      AX
          PUSH      DX
          CALL      FAR PTR WRITECHAR
          POP       CX
          POP       DI
          POP       ES
          INC       X
          LOOP      @@1
@@3:      RET
SPLITPRINT ENDP
CODE ENDS
END
