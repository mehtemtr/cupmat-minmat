
uses Crt, Nsr, UOg, UIndex, BLUNGR, Exist, GenUtil, DFile;
const
  GRKD : Array[1..10] of byte =(102, 107, 103, 107, 105, 104, 0, 101,0, 106);

Var OldInd    : Array[1..2048] of Word;
    OldMax, OldSay : Word;
    EskiDir, YeniDir : String;
    EskiDrive, YeniDrive : Char;
    AlOg    : Array[1..2048] of LongInt;
Function Legal(S:String; Result : Word):Boolean;
Var I : Word;
begin
  Legal:=False; If Result<>1 then exit;
  For I:=1 to Length(S) do
     If S[I]<' ' then exit;
  Legal:=True;
end;
Procedure YilDegis(I:Word);
begin
  With YYDrs do begin
    DFile.CloseFile; WriteNdx;
    FillChar(KodPtr^, (KeyL+2)*(MaxKay+1),#0);
    Say:=0; ActYY:=I; ActYil:=Yariyil.Yil[I];
    Open; ReadNdx;
  end;
  ShowBolYil;
end;
procedure ChangeBol(Bol:Byte);
begin
  with Ogr do begin
    DFile.CloseFile; KutFile.CloseFile; WriteNdx;
    FillChar(KodPtr^,(KeyL+2)*(MaxKay+1),#0);
    Say:=0; ActBol:=Bol;
    Open; ReadNdx;
  end;
  ShowBolYil;
end;

Procedure WriteUniv;
Var T : Text;
begin
   Assign(T,'UNIVFAK.DAT'); Rewrite(T);
   Writeln(T,Univ); WriteLn(T,Fakulte);
   close(T)
end;
Procedure BolumUnvYil;
Var TB     : Text;
    L, N, I: Word;
    SK, SA : String;
    begin
	 Assign(TB,EskiDir+'TEMEL\TEMEL.SEQ');
	 Reset(TB);
	 Readln(TB,Univ); Readln(TB,Fakulte);
	 WriteUniv;
	 ReadLn(TB,SK); N:=StrToInt(SK); L:=0;
	 For I:=1 to N do begin
	     ReadLn(TB,SA);
	     ReadLn(TB,SK);
	     If SK<>'RK' then begin
		Inc(L);
		Bolum.NuKod:=L;
		Bolum.SetKodAd(SA,L);
		Bolum.SetKod(SK,L);
	     end;
	 end;
	 Bolum.Aktif:=1; ActBol:=1;
	 Bolum.WriteFile('BOLUM.DAT');
	 ReadLn(TB,SK); N:=StrToInt(SK);
	 Unvan.NuKod:=N; Unvan.Aktif:=1;
	 For I:=1 to N do begin
	     ReadLn(TB,SA); ReadLn(TB,SK);
	     Unvan.SetKodAd(SA,I);
	     Unvan.SetKod(SK,I);
	 end;
	 Unvan.WriteFile('UNV.DAT');
	 Close(TB);
	 Assign(TB,EskiDir+'TEMEL\INFOR.SEQ');
	 Reset(TB);
	 Readln(TB,SK); ActYY:=StrToInt(SK);
	 Readln(TB,SA); ActYil:=StrToInt(SA);
	 For I:=1 to 3 do Yariyil.Yil[I]:=ActYil;
	 Close(TB); Yariyil.WriteYil;
	 ShowBolYil;
end;
Procedure ReadOldInd(FName:String);
Var
 OldF : File of word;
 Junk, I, M, Adr : Word;
begin
  Assign(OldF, FName);
  Reset(OldF);
  Read(OldF, M);
  Read(OldF, Junk);
  OldSay:=0; OldMax:=0;
  FillChar(OldInd,SizeOf(OldInd),#0);
  For I:=1 to M do begin
      Read(OldF, Adr);
      If Integer(Adr) > 0 then begin
	 Inc(OldSay);
	 OldInd[OldSay]:=Adr;
	 if OldMax < Adr then OldMax:=Adr;
      end;
  end;
  Close(OldF);
end;

Procedure ConvertDrs;
type
    OldDrsRec = Record
      XIs : Array[0..DrsKeyL-1] of Char;
      XAd : Array[0..24] of Char;
      XST : Char;
      XKR : Char;
    end;
Var I, Adr, XAdr, Yer : Word;
    Result : Integer;
    OldDF  : File;
    OldRec : OldDrsRec;
    S      : String;
Begin
 With Drs do begin
      SetIs(Spaces(DrsKeyL)); SetAd(Spaces(MaxAdLen));
      Assign(OldDF,EskiDir+'GENEL\DERS.RND');
      Reset(OldDF, SizeOf(OldDrsRec));
      Say:=0; Adr:=0;
      ReadOldInd(EskiDir+'GENEL\DERSKEY.RND');
      For I:=1 to OldMax do begin
	 ZeroKay;
	 BlockRead(OldDF, OldRec, 1, Result);
	 Inc(Adr);
	 Move(OldRec.XIs, Is, DrsKeyL);
	 Move(OldRec.XAd, Ad[1], 25);
	 Ad[0]:= Chr(25);
	 Saat := Ord(OLdRec.XST);
	 Kredi:= Ord(OldRec.XKR);
	 DFile.AddRec(XAdr, Is);
	 If Adr<>XAdr then
	    complain('DERS ADRESLERI YANLIS YAZILIYOR');
         If Not Legal(GetIs, Result) then begin
            Yer:=WordAra(Adr, OldInd, OldSay, 2);
            If Yer<>0 then OldInd[Yer]:=$FFFF;
         end;
      end;
      Close(OldDF);
      Adr:=0;
      For I:=1 to OldMax do begin
	 Inc(Adr);
	 Yer:=WordAra(Adr, OldInd, OldSay, 2);
	 If Yer = 0 then
             DFile.ReleaseRec(Adr);
      end;
      IndexDuz;
      WriteNdx;
 end;
end;

Procedure ConvertUye;
Type
    OldUyeRec = Record
      UyeUnv : Char;
      XIs    : Array[0..UyeKeyL+1] of Char;
      XAd    : Array[0..24] of Char;
      Junk   : Char;
    end;
Var I, Yer, L, Adr, XAdr : Word;
    Result : Integer;
    OldDF  : File;
    OldRec : OldUyeRec;
    S      : String;
    C      : Char;
    Junk   : Boolean;

Begin
 With Uye do begin
      SetIs(Spaces(UyeKeyL)); SetAd(Spaces(MaxAdLen));
      ZeroKay; ReadOldInd(EskiDir+'GENEL\TEACHKEY.RND');
      Assign(OldDF,EskiDir+'GENEL\TEACHER.RND');
      Reset(OldDF, SizeOf(OldUyeRec));
      Say:=0; Adr:=0;
      For I:=1 to OldMax do begin
	 ZeroKay;
	 BlockRead(OldDF, OldRec, 1, Result);
	 Inc(Adr);
	 Move(OldRec.XIs, S[1], UyeKeyL);
	 S[0]:=Chr(UyeKeyL);
	 C:='A';
	 While Search(S, NdxAdr, FileAdr) do begin
	    C:=Succ(C); S[UyeKeyL]:=C;
	 end;
	 Move(S[1], Is, UyeKeyL);
	 Move(OldRec.XAd, Ad[1], 25);
	 Ad[0]:=Chr(25);
	 S:=GetIs;
	 S:=Copy(S,3,2);
	 if Unvan.Search(S, Yer) then UnvKd:=Yer else UnvKd:=1;
	 S:=GetIs;
	 Junk:=Search(S, NdxAdr, FileAdr);
         InsIndex(NdxAdr);
	 SetKeyAdr(S, NdxAdr, 0);
	 DFile.AddRec(XAdr, Is);
	 If Adr<>XAdr then
	    complain('UYE ADRESLERI YANLIS YAZILIYOR');
         If Not Legal(GetIs, Result) then begin
            Yer:=WordAra(Adr, OldInd, OldSay, 2);
            If Yer<>0 then OldInd[Yer]:=$FFFF;
         end;
      end;
      Close(OldDF);
      Adr:=0;
      For I:=1 to OldMax do begin
	 Inc(Adr);
	 Yer:=WordAra(Adr, OldInd, OldSay, 2);
	 If Yer = 0 then
              DFile.ReleaseRec(Adr);
      end;
      IndexDuz;
      WriteNdx;
 end;
end;

Procedure ConvYYdrs;
Type
    OldYYdrsRec = Record
       XIs      : Array[0..10] of Char;
       XActADr  : Word;
       XMev     : Word;
       XButMev  : Word;
       XUy      : Word;
       XIlk     : Word;
       XSon     : Word;
    end;
Var I, Yer, L,M, Adr, XAdr : Word;
    Result : Integer;
    OldDF  : File;
    junk:boolean;

   OldRec : OldYYdrsRec;
   S,T,R   : String;

Begin
 With YYDrs do begin
      SetIs(Spaces(YYDrsKeyL));
      Say:=0; ZeroKay;
      S:=EskiDir+'YARIYIL1\DERSKEY.RND';
      If ActYY=Bah then S:=EskiDir+'YARIYIL2\DERSKEY.RND';
      ReadOldInd(S);
      T:= EskiDir+'YARIYIL1\DERS.RND';
      If ActYY=Bah then T:=EskiDir+'YARIYIL2\DERS.RND';
      Assign(OldDF, T);
      Reset(OldDF, SizeOf(OldYYDrsRec));
      Say:=0; Adr:=0;
      For I:=1 to OldMax do begin
	 ZeroKay;
	 BlockRead(OldDF, OldRec, 1, Result);
	 Inc(Adr);
	 Move(OldRec.XIs,S[1],11);
	 S[0]:=Char(11);
	 T:=Copy(S,8,2); R:=Copy(S,10,2);
	 junk:=Bolum.Search(T,L);
	 M:=StrToInt(R);If M=0 then M:=1;
	 S:=Copy(S,1,6)+Chr(L+64)+Chr(M+64);
	 Move(S[1], Is, YYdrsKeyL);
	 S:=GetIs;
	 S:=Copy(S,1,6);
	 DrsAdr:= OldRec.XActADr;
	 Junk:=Drs.Search(S,Drs.NdxAdr, Drs.FileAdr);
	 If DrsAdr<>Drs.FileAdr then begin
            Drs.DFile.GetRec(Drs.FileAdr,Drs.Is);
	    complain(GetIsExpand + ' '+Drs.GetIs+ ' YARIYIL DERSDE TUTARSIZLIK');
	    DrsAdr:= Drs.FileAdr;
	 end;
	 UyeAdr:= OldRec.XUy;
	 DFile.AddRec(XAdr, Is);
	 If Adr<>XAdr then
	    complain('YARIYIL DERS ADRESLERI YANLIS YAZILIYOR');
         If Not Legal(GetIs, Result) then begin
            Yer:=WordAra(Adr, OldInd, OldSay, 2);
            If Yer<>0 then OldInd[Yer]:=$FFFF;
         end;
      end;
      Close(OldDF);
      Adr:=0;
      For I:=1 to OldMax do begin
	 Inc(Adr);
	 Yer:=WordAra(Adr, OldInd, OldSay, 2);
	 If Yer = 0 then
            DFile.ReleaseRec(Adr);
      end;
      IndexDuz;
      WriteNdx;
 end;
end;

Procedure ConvertYYDers;
Var I:Word;
begin
 For I:=Guz to Bah do begin
   YilDegis(I);
   ConvYYDrs;
 end;
end;

Function OldGr(A, B : Char) : Byte;
Var G : Byte;
begin
   G:=Ord(A);
   IF (G>=1) AND (G<=10) THEN begin
       G:=GRKD[G];
       IF G = 0 THEN G:=Ord(B)
   end
   ELSE
      G:=Ord(B);
   OldGr:=G;
END;
Procedure ConvOgr;

CONST
   BLSZ = 31;

TYPE
    ANARC = RECORD
       ANAX : WORD; ANAY : CHAR; ANAZ : CHAR
    END;

  GECBUFTYPE = RECORD
     LNK, YCOUNT : WORD;
     REST        : ARRAY[1..BLSZ] OF ANARC;
  END;

  OLDKAY = record
      YYADR :  WORD;
      ACTADR:  WORD;
      INF   :  CHAR;
      NT    :  CHAR
   end;

   OldKayFRec = record
      XKAC : Char;
      XKY  : ARRAy[1..20] Of OLDKAY;
   end;

   OldOgrRec = Record
       BL         : CHAR;
       XIS        : ARRAY[0..9] OF CHAR;
       XAD        : ARRAY[0..24] OF CHAR;
       DUM1       : ARRAY[1..37] OF CHAR;
       XANAKUTPTR : WORD;
       XDUM2      : WORD;
    END;

Var I, Adres,Yer, Adr, XAdr, L, J : Word;
    Result    : Integer;
    OldDF     : File;
    OldDYYF   : Array[Guz..Bah] of File;
    OldRec    : OldOgrRec;
    S         : String;
    OldKY     : Array[Guz..Bah] of OldKayFRec;
    GECBUF    : GECBUFTYPE;
    AnaKutBuf : Array[1..146] of ANARC;
    ANAKUT    : FILE;


PROCEDURE READOGR(AnaKutPtr : Word);
Var Link, BufPtr, I, Y, Z : Word;
    RESULT:INTEGER;
begin
   With OldRec Do begin
      Link:=AnaKutPtr;
      BufPtr:=1;
      Ogr.YYCount:=0;
      While Link > 0 DO BEGIN
	 SEEK(ANAKUT,LINK-1);
	 BlockREAD(ANAKUT, GECBUF,1,RESULT);
	 WITH GECBUF DO BEGIN
	    LINK:=LNK;
	    Ogr.YYCOUNT:=YCOUNT;
	    FOR I:=1 TO BLSZ DO BEGIN
		AnaKutBuf[BufPtr]  := REST[I];
		Inc(BufPtr);
	    END;
	  END;
       END;
       If Ogr.YYCount=0 then EXIT;
       BufPtr:=1;
       for I:=1 to Ogr.YYCount do begin
	   Ogr.Donem[I]:=YilRec(AnaKutBuf[BufPtr]);
	   BufPtr:=BufPtr+1;
       end;
       For y:=1 to Ogr.YYCount do
	    For z:=1 to Ogr.Donem[Y].CNT do begin
		With Ogr.AnaKay[Y,Z] do begin
		     DrsPtr:=AnaKutBuf[BufPtr].ANAX;
 		     Inc(AlOg[DrsPtr]);
		     Grd:=OldGr(AnaKutBuf[BufPtr].ANAY,AnaKutBuf[BufPtr].ANAZ);
		END;
		Inc(BufPtr);
	    end;
       {End for}
   End;{With}
END;
procedure DeleteYil(X : Word);
Var U : YilRec; V : AnaRecType;
begin
with ogr do begin
  DelRec(Donem, U, X, YYCount, SizeOf(U));
  Inc(YYCount);
  DelRec(AnaKay, V, X, YYCount, SizeOf(AnaRecType));
end;
end;

Procedure PutAnaToOgr;
Var I : Word;

begin
with ogr do begin
    I:=1;
    While I<=YYCount do If Donem[I].CNT=0 then DeleteYil(I) else Inc(I);
    WriteKut;
    Dfile.PutRec(FileAdr,Is);
end;
end;


Begin
 With Ogr do begin
      SetIs(Spaces(OgrKeyL));
      SetAd(Spaces(MaxAdLen));
      ZeroKay;

      ReadOldInd(EskiDir+Bolum.Kod(ActBol)+'\OGRKEY.RND');


      Assign(OldDF, EskiDir+Bolum.Kod(ActBol)+'\OGRENCI.RND');
      Reset(OldDF, SizeOf(OldOgrRec));


      Assign(OldDYYF[Guz], EskiDir+'YARIYIL1\'+Bolum.Kod(ActBol)+'\OGRENCI.RND');
      Reset(OldDYYF[Guz], SizeOf(OldKayFRec));


      Assign(OldDYYF[Bah], EskiDir+'YARIYIL2\'+Bolum.Kod(ActBol)+'\OGRENCI.RND');
      Reset(OldDYYF[Bah], SizeOf(OldKayFRec));


      Assign(ANAKUT, EskiDir+Bolum.Kod(ActBol)+'\OGRKUT.RND');
      Reset(ANAKUT, SizeOf(GECBUFTYPE));

      Say:=0; Adr:=0;
      For I:=1 to OldMax do begin
	 Inc(Adr);
	 BlockRead(OldDF, OldRec, 1, Result);
	 BlockRead(OldDYYF[Guz], OldKY[Guz], 1, Result);
	 BlockRead(OldDYYF[Bah], OldKY[Bah], 1, Result);
	 Yer:=WordAra(Adr, OldInd, OldSay, 2);
	 If Yer <> 0 then begin
	    ZeroKay;
	    Move(OldRec.XIs[2], Is, OgrKeyL);
	    Move(OldRec.XAd, Ad[1], 25);
	    Ad[0]:=Chr(25);
	    ReadOgr(OldRec.XANAKUTPTR);
	    For J:=Guz to Bah do begin
		Kac[J]:=Ord(OldKY[J].XKac);
		If (Kac[J]<0) or (Kac[J]>16) then Kac[J]:=0;
		For L:=1 to Kac[J] do begin
		   YYKay[J,L]:=OldKY[J].XKY[L].YYADR;
		   Ders[J,L].DrsPtr:=OldKY[J].XKY[L].ActAdr;
		   Ders[J,L].Grd:=OldGr(OldKY[J].XKY[L].INF,OldKY[J].XKY[L].NT);
		end;
	    end;
	    DFile.AddRec(XAdr, Is);
            FileAdr:=XAdr;
            PutAnaToOgr;
	 end;
      end;
      Close(OldDF);
      Close(OldDYYF[Guz]);
      Close(OldDYYF[Bah]);
      Close(ANAKUT);
      IndexDuz;
      WriteNdx;
 end;
end;

Procedure ConvertOgr;
Var I:Word;
begin
  for i:=1 to Bolum.NuKod do begin
     ChangeBol(i);
     ConvOgr;
  end;
end;




Function GetOldNewDir:Boolean;
Var Stop:Boolean;
    TC:Char;
    S : String;
begin
   Clrscr;
   GetDir(0,S);
   GetOldNewDir:=False;
   EskiDir:='';
   YeniDir:='';
   Stop:=False;
   OpenEditWindow('ESK˜ DOSYA, YEN˜ DOSYA DE¦˜ž˜KL˜¦˜',
		 '16@ESK˜ D˜RECTORY@16@YEN˜ D˜RECTORY',
		 'INS:GIRIS@ESC:ESC:VAZGE€',
		 [INSKEY, ESC],[],3,4);
   Repeat
        InputStr(EskiDir,Form.FieldKol[1],1,16,False,AllKar, 0, TC);
        If TC=NULL then
           InputStr(YeniDir,Form.FieldKol[2],1,16,False,AllKar, 0, TC);
        Case TC of
           ESC : begin
                   CloseEdit; Exit;
                 end;
           INSKEY:if not Disk.ParseDirName(EskiDrive, EskiDir) then begin
                        Disk.IOError($1000);
                        Disk.IOErrorFlag:=False
                  end
                  else if not Disk.ParseDirName(YeniDrive, YeniDir) then begin
                            Disk.IOError($1000);
                            Disk.IOErrorFlag:=False
                        end else
                            If Disk.DirExists(EskiDir) and
                               Disk.DirExists(YeniDir) then
                                   Stop:=True
                            else
                               complain('D˜RECTORY˜LERDE B˜R˜ MEVCUT DE¦˜L')
        end;
   until Stop;
   CloseEdit;
   If Not Disk.LogDir(YeniDir) then exit;
   YeniDir:='';
   If EskiDir[Length(EskiDir)]<>'\' then EskiDir:=EskiDir+'\';
   GetOldNewDir:=True;
end;
Procedure ReadUniv;
Var T : Text;
begin
   If not Exists('UNIVFAK.DAT') then writeUniv;
   Assign(T,'UNIVFAK.DAT');
   Reset(T);Readln(T,Univ);ReadLn(T,Fakulte);
   close(T)
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
  ReadUniv;
  ShowBolYil;
  ReadListStat;
  FillChar(AlOg, SizeOf(AlOg),#0);
end;
Procedure QuitProg;
vAR S:sTRING;
begin
  While EDSP<>0 do CloseEdit;
  YYDrs.DFile.CloseFile;
  Uye.DFile.CloseFile;
  Drs.DFile.CloseFile;
  Ogr.DFile.CloseFile;
  Ogr.KutFile.CloseFile;
  YYDrs.Done;
  Uye.Done;
  Drs.Done;
  Ogr.Done;
  Yariyil.done;
  clrscr;
  Halt;
end;
Var Da, Dadr : Word;
begin
   If GetOldNewDir then begin
     InitProg;
     BolumUnvYil;
     ConvertUye;
     ConvertDrs;
     ConvertYYDers;
     ConvertOgr;
     With Drs do begin
        For DA:=1 to Say do begin
            DAdr:=GetADr(DA);
            DFile.GetRec(DAdr,Is);
            AlanOgrSay:=AlOg[DAdr];
            DFile.PutRec(DAdr,Is);
        end;
     end;
     QuitProg;
   end;
end.





