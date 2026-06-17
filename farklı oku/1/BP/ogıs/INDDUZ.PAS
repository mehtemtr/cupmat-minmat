uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist;

procedure BolDegis(K : Integer);
begin
   with Ogr do begin
     DFile.CloseFile;
     FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
     Say:=0;
     ActBol:=K;
     Open;
     ReadNdx;
   end;
end;
Procedure YilDegis(I : Integer);
begin
with YYDrs do begin
  DFile.CloseFile;
  WriteNdx;
  FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
  Say:=0;
  AktifYYInd:=I;
  With Yariyil.Yil[AktifYYInd] do begin
    ActYY:=YarYil;
    ActYil:=Sene;
  end;
  Yariyil.WriteYil;
  YYDrs.Open;
  YYDrs.ReadNdx;
end;
end;
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open;
  Uye.init;  Uye.open;
  YYDrs.Init;YYDrs.Open;
  ShowBolYil;
  ReadListStat;
end;
Procedure QuitProg;
begin
  While EDSP<>0 do CloseEdit;
  YYDrs.DFile.CloseFile;
  Uye.DFile.CloseFile;
  Drs.DFile.CloseFile;
  Ogr.DFile.CloseFile;
  YYDrs.Done;
  Uye.done;
  Drs.done;
  Ogr.done;
  Yariyil.done;
  clrscr;
  Halt;
end;

var BolI, YilI : Integer;
begin
  initprog;
  Bekleyiniz('INDEKSLER DUZELIYOR');
  For BolI:=1 to Bolum.NuKod do begin
      BolDegis(BolI);
      Ogr.IndexDuz;
  end;
  Drs.IndexDuz;
  for YilI:=1 to 3 do begin
      YilDegis(YilI);
      YYDrs.IndexDuz;
  end;
  Uye.IndexDuz;
  CloseWindow;
  QuitProg;
 end.
