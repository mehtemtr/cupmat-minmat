uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist;
Var I : Integer;
Procedure InitProg;
begin
  Univ:='€UKUROVA šN˜VERS˜TES˜';
  Fakulte:='';
  Bolum.init;
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  Ogr.Init;  Ogr.Open;
  Drs.init;  Drs.open; Drs.KredSaatToMem;
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
  uye.done;
  drs.done;
  ogr.done;
  Yariyil.done;
  clrscr;
  Halt;
end;
begin
  initprog;
  for AktifYYInd:=3 downto 1 do begin
     with YYdrs do begin
        With Yariyil.Yil[AktifYYInd] do begin
          ActYY:=YarYil;
          ActYil:=Sene;
        end;
        YYDrs.Open;
        For I:=1 to DFile.FirstFree-1 do begin
            DFile.GetRec(I, is);
            FillChar(Mevcut, SizeOf(Mevcut),#0);
            DFile.PutRec(I,Is);
     end;
     DFile.CloseFile;
  end;
end;
  quitProg;
end.
  for boli:=1 to bolum.nukod do begin
       ChangeBol(Boli);
       Ogr.IndexDuz;
       ogr.writendx;
  end;
  Drs.IndexDuz;
  Drs.writendx;
{  listehazirla;
  ogr.bolumsec;
  yylistebas;}
  quitprog
end.
