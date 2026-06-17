uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist, WinList, Minneed;

Procedure ListeHazirla;
Var  K : Word;
     I : Byte;TC:char;
begin
    K:=Bolum.NuKod;
    List.Butunleme:=1;
    For I:=1 to K do begin
        Clrscr;
        WriteStr(Form.FieldKol[1],1,Bolum.KodAd(I),NormalAttr);
	WriteStr(Form.FieldKol[1],3,'BU B™LšM HAZIRLANSINMI ?', HiliteAttr);
	TC:=GetKey2;
	If TC = CR then begin
	   ChangeBol(I);
	   List.ListeHazirla;
	   YYListStat[AktifYYInd,I]:=True;
	   WriteListStat;
	end;
    end;
    CloseEdit
end;

Procedure YYListeBas;
begin
   List.Butunleme:=1;
   List.ListeBas;
end;
var boli:integer;
begin
  initprog;
{  yydrs.indexduz;
  yydrs.writendx;

  for boli:=1 to bolum.nukod do begin
       ChangeBol(Boli);
       Ogr.IndexDuz;
       ogr.writendx;
  end;
  Drs.IndexDuz;
  drs.writendx;
  listehazirla;}
  ogr.bolumsec;
  Assign(txt,'Deneme.pas');
  rewrite(txt);
  yylistebas;
  close(txt);
  quitprog
end.
