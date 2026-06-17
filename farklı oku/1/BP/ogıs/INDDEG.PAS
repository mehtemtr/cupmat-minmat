uses blungr, Uog, exist, DFile;

Procedure WriteUniv;
Var T : TextFile;
begin
   With T do begin
     OpenToWrite('UNIVFAK.DAT');
     WriteText(Univ);
     WriteText(Fakulte);
     CloseFile;
   end;
end;
Procedure ReadUniv;
Var T : TextFile;
begin
   If not Exists('UNIVFAK.DAT') then WriteUniv;
   With T do begin
     OpenToRead('UNIVFAK.DAT');
     Univ:=ReadText;
     Fakulte:=ReadText;
     CloseFile;
   end;
end;

procedure bolumdegis(bol : Word);
begin
with ogr do begin
   DFile.CloseFile;
   WriteNdx;
   FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
   Say:=0;
   ActBol:=Bol;
   Open;
   ReadNdx;
   ShowBolYil;
end;
end;

Var F       : DataFile;
    I ,  J, K, Bol : Word;
    S:String;
begin
   Bolum.init;
   Ogr.Init;
   Ogr.Open;
   ReadUniv;
   For Bol:=1 to Bolum.NuKod do begin
       BolumDegis(Bol);
       Ogr.IndexDuz;
   end;
   Ogr.DFile.CloseFile;
   Ogr.Done;
end.

