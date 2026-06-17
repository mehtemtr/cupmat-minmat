uses crt, DFile;
Var InT1, InT2, CikT : TextFile;
    I : Integer;
    A, B : String;
    ABitti, BBitti : Boolean;
procedure Birlestir;
begin
      InT1.OpenToRead('DUM1.TXT');
      InT2.OpenToRead('DUM2.TXT');
      CikT.OpenToWrite('BIRLES.TXT');
      BBitti:=Eof(InT2.T);ABitti:=Eof(InT1.T);
      If Abitti then A:='zzzzzzzzz' else A:=InT1.ReadText;
      if BBitti then B:='zzzzzzzzz' else B:=InT2.ReadText;
      while not ((ABitti) and (BBitti))  do begin
        If A>B then begin
           CikT.WriteText(B);
           BBitti:=Eof(InT2.T);
           if BBitti then B:='zzzzzzzzz' else B:=InT2.ReadText;
        end
        else if A<B then begin
           CikT.WriteText(A);
           ABitti:=Eof(InT1.T);
           If Abitti then A:='zzzzzzzzz' else A:=InT1.ReadText;
        end;
      end;
     InT1.CloseFile; InT2.CloseFile; CikT.CLoseFile;
end;
Var C : Char;S:String;
begin
  clrscr;
  InT1.OpenToWrite('DUM1.TXT');
  InT2.OpenToWrite('DUM2.TXT');
  for C:='A' to 'B' do Int1.WriteText(C+'');
  for C:='A' to 'F' do InT2.WriteText(C+'');
  InT1.CloseFile; InT2.CloseFile;
  Birlestir;
  Cikt.OpenToRead('BIRLES.TXT');
  While not Eof(Cikt.t) do begin
     s:=CikT.ReadText;
     WRiteLn(S);
     readln;
  end;
  Cikt.CloseFile
end.
