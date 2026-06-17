;***********************************************************************
;
; RdSector    Read sector zero
;
; procedure   RdSector(DriveNo : word; var ErrorCode : word; Var Buffer)
;
;	      DriveNo	0 = A, 1 = B, etc.
;	      ErrorCode The returned status code from DOS interrupt
;			25h, Absolute Disk Read
;
; Description This procedure attempts to read sector zero from the
;	      specified drive.	Although the data is not returned,
;	      the returned error code indicates if the disk is present
;	      and ready for operation.	This internal procedure is
;	      used by __IsDrvFil to detect the presence and availability
;	      of a disk drive.
;
; Version     4.00 (C)Copyright Blaise Computing Inc.  1987
;________________________________________________________________________


code	   segment
	   assume  cs:code,ds:nothing
	   public  RdSector

RdSector   proc    near

	   push    bp
	   mov	   bp,sp
	   push    ds

; Equate the parameters on the stack with mnemonics

Buffer     equ     [bp + 04]
ErrorCode  equ	   [bp + 08]
Drive	   equ	   [bp + 12]
	   mov	   ax,Drive
	   mov	   cx,1 	       ; Read one sector at sector 0
	   mov	   dx,0
	   lds	   bx,Buffer
	   push    bp		       ; BP is destroyed by INT 25
	   int	   25h		       ; Absolute disk read
	   inc	   sp		       ; DOS leaves the flags on the stack
	   inc	   sp		       ; Add 2 to SP but don't alter CF
	   pop	   bp		       ; Recover BP
	   les	   si,ErrorCode        ; ES:SI points to ErrorCode storage
	   jnc	   noerror	       ; Read was successful

	   mov	   word ptr es:[si],ax
	   jmp	   finish
noerror:
	   mov	   word ptr es:[si],0

finish:
	   pop	   ds
	   pop	   bp
	   ret	   10		       ; Discard parameters
RdSector   endp

code	   ends
	   end
