Unit GenUtil;
Interface
   Procedure Reverse(Var Rec; RecL, N1, N2:Word);
   Function  WordAra(SRec:Word; Var Rec; NuRec, RecL:Word) : Word;
   Procedure InsRec( Var Rec;
		  Var InsX;
		       Yer   : Word;
		   Var NuRec : Word;
		       RecL  : Word);

   Procedure DelRec(Var Rec;
		   Var DELX;
		       Yer   : Word;
		   Var NuRec : Word;
		       RecL  : Word);


Implementation
{$L REV2.OBJ}
{$F+}
   Procedure Reverse(Var Rec; RecL, N1, N2:Word);External;

   Function  WordAra(SRec:Word; Var Rec; NuRec, RecL:Word) : Word; External;

   Procedure InsRec( Var Rec;
		   Var InsX;
		       Yer   : Word;
		   Var NuRec : Word;
		       RecL  : Word);External;

   Procedure DelRec(Var Rec;
		   Var DELX;
		       Yer   : Word;
		   Var NuRec : Word;
		       RecL  : Word);External;

{$F-}
begin
end.




