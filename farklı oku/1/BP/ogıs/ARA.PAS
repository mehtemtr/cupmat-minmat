uses Crt, Nsr, BlUnGr, Uog, DFile, Exist;
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
  ReadUniv;
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
Function MOK(M,K,L:Word):Boolean;
begin
   MOK:=False;
   If (M=0) or (M > MaxDrs) then begin
      With Ogr do begin
        Complain(GetIs+' '+YilStr(DOnem[K].YL, Donem[K].YY)+' '+IntToStr(L,2)+' .CI DERS');
      end;
      exit
   end else MOK:=True;
end;
Function YYMOK(K,M, N:Word):Boolean;
begin
   YYMOK:=False;
   If (M=0) or (M > MaxYYDrs) or (N=0) or (N > MaxDrs) then begin
      With Ogr do begin
        Complain(Ogr.GetIs+' '+YilStr(ActYil,ActYY)+' '+IntToStr(K,2)+' .CI DERS');
      end;
      exit
   end;
   YYDrs.DFile.GetRec(M, YYDrs.Is);
   Junk:=Drs.Search(YYDrs.GetIs, Yer, Adres);
   If Adres<>YYDrs.DrsADr then
    else YYMOK:=True;
end;

Var M, N, I, J, K, L , Bol : Word;
    Used    : Array[1..MaxDrs] of Boolean;
    AlSay   : Array[1..MaxDrs] of LongInt;
    DskUsed : Array[1..MaxDrs] of Boolean;
    YYUsed  : Array[1..MaxYYDrs] Of Boolean;
    YYDrsX  : Array[1..MaxYYDrs] Of Word;
    Hata    : Boolean;
    Result:Integer;
    Buf   : Array[1..2] of Word;
    TC : Char;
begin
  Initprog;
  ClrScr;
  Hata:=False;
  FillChar(Used, SizeOf(Used),#0);
  FillChar(AlSay, SizeOf(AlSay),#0);
  FillChar(DskUsed, SizeOf(DskUsed),#0);
  For Bol:=1 to Bolum.NuKod do begin
     BolumDegis(Bol);
     With Ogr Do begin
        For J:=1 to Ogr.Say do begin
             N:=GetAdr(J);
             DFile.GetRec(N, Is);
             For K:=1 to YYCount do
                For L:=1 to Donem[K].CNT do begin
                     M:=AnaKay[K,L].DrsPtr;
                     If MOK(M,K,L) then begin
                        Used[M]:=True;
                        Inc(AlSay[M]);
                     end;
                end;
         end;
     end;
  end;
  With Drs do begin
     FillChar(DskUsed, DFile.FirstFree-1, TRUE);
     M:=DFile.Deltd;
     While M<>0 do begin
         DskUsed[M]:=False;
         With DFile do begin
            Seek(F, FLPos(RecLen, M, Ofs(Status)-Ofs(FirstFree) ));
            Status:=IOResult;
            M:=0;
            If Status = 0 then begin
	        BlockRead(F,Buf,4,Result);
	        Status:=IOResult;
	        If Status = 0 then M:=Buf[2];
            end;
         end;
     end;
     For I:=1 to MaxDrs do
        If Used[I] then
            If Not DskUsed[I] then begin
               DFile.GetRec(I, Is);
               Complain(GetAd+' DERSI SILIMIS');
               Hata:=True
            End
  end;
  With YYDrs Do begin
     For I:=1 to Say do begin
         M:=GetAdr(I);
         DFile.GetRec(M,Is);
         If (DrsAdr=0) Or (DrsAdr>MaxDrs) then begin
            Complain(GetIs+' GENEL DERS ADRES˜ 0 VEYA COK BUYUK');
            If YYUsed[DrsAdr] then begin
               Complain('FAKAT '+GetIs+' DERS˜NE KAYITLI ™GRENC˜LER VAR');
               Mevcut[1]:=0;
               DFile.PutRec(M,Is);
            end;
         end else
         If Not DskUsed[DrsAdr] then begin
            Complain(GetIs+' YARIYIL DERSI GENEL DERSLERDE YOK');
            If YYUsed[M] then begin
               Message('YYDERS KONTROL',
                       'BU DERSI GENEL DERSLERE@˜LAVE EDEL˜MM˜@ESC:HAYIR@ENTER:EVET',
                       [ESC,CR], TC);
               IF TC=CR then begin
                  Drs.DFile.GetRec(DrsAdr, Drs.Is);
                  Move(Is, Drs.Is, Drs.KeyL);
                  Drs.DFile.AddRec(DrsAdr, Drs.Is);
                  DFile.PutRec(M, Is);
               end;
            end;
         end;
     end;
  end;
  For Bol:=1 to Bolum.NuKod do begin
     BolumDegis(Bol);
     With Ogr Do begin
        For J:=1 to Ogr.Say do begin
             N:=GetAdr(J);
             DFile.GetRec(N, Is);
             For K:=1 to Kac[AktifYYInd] do begin
                M:=YYKay[AktifYYInd, K];
                N:=Ders[AktifYYInd,K].DrsPtr;
                If YYMOK(K, M, N) then YYUsed[M]:=True;
             end;
         end;
     end;
  end;
  quitprog
end.

