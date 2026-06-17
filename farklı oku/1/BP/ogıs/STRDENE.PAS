uses strin;
const
  ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?@ABC€DEFG¦HI˜JKLMNO™PQRSžTUšVWXYZ';
Var I, J : Integer;
    S, T : String;
    M : Integer;
begin
   For I:=1 to Length(AlfabeStr) do begin
      S:=AlfabeStr[I];
      for j:=1 to Length(AlFabeStr) do begin
          T:=AlfabeStr[J];
          M:=StrComp(@S,@T);
          If M<>(I-J) then
             writeln(S, T);
      end;
   end;
end.



