uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist, Printer, GenUtil, DFile;
type
  NewYYDrsRec  = record
	  Is         : Array[0..YYDrsKeyL-1] of Char;
	  DrsAdr     : Word;
	  UyeAdr     : Word;
	  Mevcut     : Array[1..3] of Word;
	  ListLink   : Word;
          ButLink    : Word;
          TekLink    : Word;
     end;

Var
    NewDrs        : NewYYDrsRec;
    NewFile       : DataFile;
    W             : Word;
    I,R             : Word;
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
  ReadListStat;
end;

begin
      InitProg;
      NewFile.Init(MaxYYDrs, SizeOf(NewYYDrsRec));
      for ActYY:=1 to 3 do begin
         YYDrs.DFile.CloseFile;
         YYDrs.Open;
         YYDrs.ReadNdx;
         NewFile.OpenFile('C:\YENI\'+GUZBAH[ActYY]+'DRSX.DAT');
         For I:=1 to YYDrs.DFile.FirstFree-1 do begin
             YYDrs.DFile.GetRec(I, YYDrs.Is);
             Move(YYDrs.Is, NewDrs, Ofs(YYDrs.ListLink)-Ofs(YYDrs.Is));
             Move(YYDrs.ListLink, NewDrs.ListLink, 4);
             NewDrs.TekLink:=0;
             NewDrs.Mevcut[3]:=0;
             NewFile.AddRec(R, NewDrs);
         end;
         NewFile.CloseFile;
      end;
      quitProg;
end.
