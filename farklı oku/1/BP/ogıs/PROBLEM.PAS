Var I, N, M : word;
    A : Array[0..5050] of Longint;
    B : LongInt;
begin
   A[0]:=1; A[1]:=1; A[2]:=2; A[3]:=2;
   M:=2;
   Writeln(A[2]);
   repeat
      B:=A[M];
      For I:=M+1 to (M * (M+1)  div 2) do
         A[I]:=A[I]+(M+1)*A[I-M-1];
      For I:=(M * (M+1)  div 2)+1 to ((M +1)* (M+2)  div 2) do
         A[I]:=(M+1)*A[I-M-1];
      Writeln(A[M+1]:5, (A[M+1]-B):5);
      M:=M+1;
   until M>=15
end.
