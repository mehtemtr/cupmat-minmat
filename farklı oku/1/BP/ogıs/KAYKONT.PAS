uses Crt, Nsr, BlUnGr, Uog, DFile, Exist, GenUtil,  StrIn;
Var
    DskUsed : Array[1..MaxDrs] of Boolean;
    DelLink : Array[1..MaxDrs+1] of Word;
    DelSay  : Word;
    YYUsed  : Array[1..MaxYYDrs] Of Boolean;
    YYDrsX  : Array[1..MaxYYDrs] Of Word;


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



Procedure MevcutDersler;
Var Result:Integer;
    M : Word;
    Buf : Array[1..2] Of Word;
begin
  With Drs do begin
     FillChar(DskUsed, DFile.FirstFree-1, TRUE);
     M:=DFile.Deltd; DelSay:=0;
     While M<>0 do begin
	 DskUsed[M]:=False; Inc(DelSay); DelLink[DelSay]:=M;
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
end;
end;
Function DrsDelIndex(X : Word) : Word;
Var I : Word;
begin
   I:=1;
   DelLink[DelSay+1]:=X; While DelLink[I]<>X do Inc(I);
   If I<=DelSay then DrsDelIndex:=I else DrsDelIndex:=0;
end;
Procedure PutDersAt(X : Word; S : String);

Var I, JunkAdr : Word; Buf : Array[1..2] of word;
begin
   Buf[1]:=$FFFF;
   With Drs do begin
       DFile.GetRec(X, Is);
       Move(S[1],Is, KeyL);
       DFile.PutRec(X, Is);
       DelRec(DelLink, JunkAdr, DrsDelIndex(X), DelSay, 2);
       DelLink[DelSay+1]:=0;
       With DFile Do begin
	   For I:=1 to DelSay do begin
	       DFile.GetRec(DelLink[I], Is);
	       Buf[2]:=DelLink[I+1];
	       Move(Buf,Is,4);
	       DFile.PutRec(DelLink[I], Is);
	   end;
	   Deltd:=DelLink[1];
	   WriteHeader
       end;
   end;
end;

Procedure YYdersKont;
Var N, M, Yer, I : Word;
    TC : Char;
begin
  MevcutDersler;
  With YYDrs Do begin
     N:=Say;
     For I:=N DownTo 1 do begin
	 M:=GetAdr(I);
	 DFile.GetRec(M,Is);
	 If (DrsAdr=0) Or (DrsAdr>=Drs.DFile.FirstFree) then begin
	    Complain(GetIs+' GENEL DERS ADRES˜ 0 VEYA COK BšYšK');
	    Message('YYDERS KONTROL',
		       'BU DERSI S˜LECEG˜M@DEVAM EDEL˜MM˜@ESC:HAYIR@ENTER:EVET',
		       [ESC,CR], TC);
	    If TC=CR then begin
	       Yer:=I;
	       DelIndex(Yer);
	       DFile.ReleaseRec(M);
	       WriteNdx;
	    end else begin
              {	       QuitProg;}
	      { Exit}
	    end;
	 end else
	 If Not DskUsed[DrsAdr] then begin
	    Complain(GetIs+' YARIYIL DERSI GENEL DERSLERDE YOK');
	    Message('YYDERS KONTROL',
		       Copy(GetIs,1,Drs.KeyL)+'DERSINI GENEL DERSLERE@˜LAVE EDEL˜MM˜@ESC:HAYIR@ENTER:EVET',
		       [ESC,CR], TC);
	    IF TC=CR then begin
		 PutDersAt(DrsAdr, GetIs);
		 Drs.WriteNdx;
	    end else begin
		  Message('YYDERS KONTROL',
		       GetIs+'˜LAVE ED˜LMEYECEKSE@DERS˜ S˜LEL˜MM˜@ESC:HAYIR@ENTER:EVET',
		       [ESC,CR], TC);
		  If TC=CR then begin
		       Yer:=I;
		       DelIndex(Yer);
		       DFile.ReleaseRec(M);
		       WriteNdx;
		  end;
	    end;
	 end;
     end;
  end;
end;
Function YYMOK(OgrAdr, K : Word):Boolean;
Var Junk : Boolean;
    M, N : Word;
    Hata : Boolean;
begin
  With Ogr do begin
     YYMOK:=False; Hata:=False;
     M:=YYKay[AktifYYInd, K];
     N:=Ders[AktifYYInd,K].DrsPtr;
     Junk:= (M>0) And (M < YYDrs.DFile.FirstFree);
     If Junk then begin
	 YYDrs.DFile.GetRec(M, YYDrs.Is);
	 If N<>YYDrs.DrsAdr then begin
	    N:=YYDrs.DrsAdr;
	    Hata:=True
	 end;
     end;
     Ders[AktifYYInd,K].DrsPtr:=N;
     If Not Junk
	 or (N=0) or (N >= Drs.DFile.FirstFree) then begin
	     Complain(Ogr.GetIs+' '+YilStr(ActYil,ActYY)+' '+IntToStr(K,2)+' .CI DERS');
	     exit
      end;
      YYMOK:=True;
      If Hata then Dfile.PutRec(OgrAdr, Is);
  end;
end;
Procedure ShowBol;
Var S : String;
    L, M : Byte;
begin
    SaveWinInfo;NormalWindow;
    WriteChar(1,2,80,#205,TextAttr);
    S:=Fakulte; If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(2,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    M:=L+6;
    S:= Bolum.KodAd(ActBol);
    If Length(S)> 27 then S:=Copy(S,1,27);
    L:=Length(S); While S[L]=' ' do Dec(L);
    WriteStr(M,2,' ' + Copy(S,1,L)+ ' ', HiLiteAttr);
    RestoreWinInfo;
end;
procedure BolumDegis(K : Integer);
begin
   with Ogr do begin
     DFile.CloseFile;
     FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
     Say:=0;
     ActBol:=K;
     Open;
     ReadNdx;
     ShowBol;
   end;
end;
Procedure OgrKayKont;
Var Bol, I, OgrAdr, L, J, K, P, JunkWord : Word;
    TC : Char;
    DelAnaRec : AnaRec;
begin
  For Bol:=1 to Bolum.NuKod do begin
     BolumDegis(Bol);
     With Ogr Do begin
	For J:=1 to Ogr.Say do begin
	     OgrAdr:=GetAdr(J); DFile.GetRec(OgrAdr, Is);
	     L:=Kac[AktifYYInd];
	     For K:=L DownTo 1 do begin
		If Not YYMOK(OgrAdr,K) then begin
		       Message('YY KAY KONTROL',
		       'KAYITTAN HATALI OLAN@DERS˜ S˜LEL˜MM˜@ESC:HAYIR@ENTER:EVET',
		       [ESC,CR], TC);
		       If TC=CR then begin
			   P:=Kac[AktifYYInd];
			   DelRec(YYKay[AktifYYInd], JunkWord, K, P,2);
			   Inc(P);
			   DelRec(Ders[AktifYYInd], DelAnaRec, K, P,SizeOf(AnaRec));
			   Kac[AktifYYInd]:=P;
			   Ogr.DFile.PutRec(OgrAdr, Ogr.Is);
		       end;
		end;
	     end;
	end;
     end;
  end;
end;
Procedure Mevcutlar;
Var Bol, I, OgrAdr,M,N, L, J, K, P, JunkWord, Yer : Word;
    TC : Char;
    DelAnaRec : AnaRec;
begin
  For Bol:=1 to Bolum.NuKod do begin
     BolumDegis(Bol);
     With Ogr Do begin
	For J:=1 to Ogr.Say do begin
	     OgrAdr:=GetAdr(J); DFile.GetRec(OgrAdr, Is);
             L:=Kac[AktifYYInd];
             if not searchDonem(ActYil, ActYY, Yer) then begin
                writeln(getis,' ',L);
                readln
                end;
	     
             For K:=1 to Kac[AktifYYInd] do begin
                 M:=YYKay[AktifYYInd, K];
                 N:=Ders[AktifYYInd,K].DrsPtr;
                 YYDrs.DFile.GetRec(M, YYDrs.Is);
                 Inc(YYDrs.Mevcut[1]);
                 YYDrs.DFile.PutRec(M, YYDrs.Is);
             end;
        end;
  end;
  end;
end;

begin
  Initprog;
  ClrScr;
  mevcutlar;

{  YYdersKont;
  OgrKayKont;}
  quitprog
end.
