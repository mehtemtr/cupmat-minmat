uses Crt, UOg, BLUNGR, DFile, MinNeed;
Var Bol, I, Adr : Integer;
procedure ChangeBol(Bol:Integer);
begin
  with Ogr do begin
    DFile.CloseFile;
    ActBol:=Bol;
    Open;
    ReadNdx;
  end;
end;

begin
  InitProg;
  For Bol:=1 to Bolum.NuKod do begin
     ChangeBol(Bol);
     with Ogr do begin
         For I:=1 to say do begin
            Adr:=GetAdr(I);
            DFile.GetRec(Adr, Is);
            Ad[0]:=Chr(25);
            DFile.PutRec(Adr, Is);
         end;
     end;
  end;
  QuitProg;
end.
