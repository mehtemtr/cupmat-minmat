uses nsr, dfile;
CONST
Guz=1; Yaz=3;
  MaxKeyLen     =  8;
  MaxAdLen      = 25;
  MaxSaat :Byte = 30;
  MaxKredi:Real = 25;

  OgrKeyL   = 8;
  DrsKeyL   = 6;
  UyeKeyL   = 6;
  YYDrsKeyL = 8;

   MaxOgr       = 1023;
   MaxDrs       = 2047;
   MaxUye       =  511;
   MaxYYDrs     =  511;




  MaxDonemDrs = 18;
  EskMaxDonemDrs = 16;

  MaxDonem    = 20;

type
  KeyStr       = String[MaxKeyLen];
  AdStr        = String[MaxAdLen];
  Str2         = string[2];

  AnaRec = Record
       DrsPtr: Word; Grd : Byte;
   end;
   KayRec = Record
	  OgrPtr: Word; Nt : Byte;
   end;
   YilRec = Record
	   YL  : Word;
	   YY  : Byte;
	  CNT : Byte;
   end;
   YYArr          = Array[1..MaxDonem] of YilRec;
   AnaRecType     = Array[1..MaxDonemDrs] of AnaRec;
   AnaKayType     = Array[1..MaxDonem] of AnaRecType;
   KacType        = Array[Guz..Yaz] of Byte;
   DonemDers      = Array[1..MaxDonemDrs] of Word;
   YYKayType      = Array[Guz..Yaz] of DonemDers;
   DersType       = Array[Guz..Yaz] of AnaRecType;
   KredArr        = Array[1..MaxDrs] of Real;
   SaatArr        = Array[1..MaxDrs] of Byte;
   DogumYerStr = String[15];

   EskYYArr          = Array[1..MaxDonem] of YilRec;
   EskAnaRecType     = Array[1..EskMaxDonemDrs] of AnaRec;
   EskAnaKayType     = Array[1..MaxDonem] of EskAnaRecType;
   EskKacType        = Array[Guz..Yaz] of Byte;
   EskDonemDers      = Array[1..EskMaxDonemDrs] of Word;
   EskYYKayType      = Array[Guz..Yaz] of EskDonemDers;
   EskDersType       = Array[Guz..Yaz] of EskAnaRecType;
   EskKredArr        = Array[1..MaxDrs] of Real;
   EskSaatArr        = Array[1..MaxDrs] of Byte;
   OgrRec  = record
	  Is       : Array[0..OgrKeyL-1] of Char;
	  Ad       : AdStr;
	  Cins     : Char;
	  DogumYer : DogumYerStr;
	  DogumGun : Byte;
	  DogumAy  : Byte;
	  DogumYil : Word;
	  YKK      : Word;
          HazNot   : Word;
	  HazBasYil: Word;
          Kac      : KacType;
          YYKay    : YYKayType;
          Ders     : DersType;
	  YYCount  : Word;
	  Donem    : YYArr;
	  AnaKay   : AnaKayType;
   end;
   EskOgrRec= Record
          Is       : Array[0..OgrKeyL-1] of Char;
	  Ad       : AdStr;
	  Cins     : Char;
	  DogumYer : DogumYerStr;
	  DogumGun : Byte;
	  DogumAy  : Byte;
	  DogumYil : Word;
	  YKK      : Word;
          HazNot   : Word;
	  HazBasYil: Word;
          Kac      : EskKacType;
          YYKay    : EskYYKayType;
          Ders     : EskDersType;
	  YYCount  : Word;
	  Donem    : EskYYArr;
	  AnaKay   : EskAnaKayType;
   end;
   HeadRec = record
	FirstFree   : Word;
	Deltd       : Word;
	RecLen      : Word;
	MaxKay      : Word;
	IsOpen      : Word;
   end;


Var
	    BOL   : Array[1..20] of Str2;
	    BOLAD : Array[1..20] of string;
            NuKod, Aktif : Integer;
            OgrF1, OgrF2 : File;
            HeadOgr1, HeadOgr2:HeadRec;
            Res, Res1, Res2 : Integer;
            Ogr:OgrRec;
            EskOgr: EskOgrRec;
Procedure ReadBol;
Var T:Text;
    I : Word;
    Var S : String;
begin
    Assign(T,'c:\iki\BOLUM.DAT');
    Reset(T);
    Readln(T,S);
    NuKod:=StrToInt(S);
    ReadLn(T,S);
    Aktif:=StrToInt(S);
    For I:=1 to NuKod do begin
       ReadLn(T,S); Bol[I]:=S;
       ReadLn(T,S);BolAd[I]:=S;
    end;
    Close(T);
end;
Procedure Open(B : Integer);
Var S : String;
begin
   S:='c:\iki\'+Bol[B]+'OGR.DAT';
   Assign(OgrF1, S);
   Reset(OgrF1,1);
   BlockRead(OgrF1, HeadOgr1, SizeOf(HeadRec), Res1);
   S:='c:\iki\'+Bol[B]+'OGR.AAA';
   Assign(OgrF2, S);
   ReWrite(OgrF2,1);
end;
Procedure closeF(B : Integer);
Var S : String;
    A : String;
    junk : boolean;
begin
   Close(OgrF1);
   Close(OgrF2);
   junk:=CopyFile('c:\iki\'+Bol[B]+'OGR.AAA','c:\iki\'+Bol[B]+'OGR.DAT');
   EraseFile('c:\iki\'+Bol[B]+'OGR.AAA');
end;
Procedure Kopyala;
Var J : Word;
begin
    HeadOgr2:=HeadOgr1;
    HeadOgr2.RecLen:=SizeOf(OgrRec);
    BlockWrite(OgrF2, HeadOgr2, SizeOf(HeadRec), Res);
    While Not Eof(OgrF1) do begin
         BlockRead(OgrF1, EskOgr, SizeOf(EskOgrRec), Res1);
         FillChar(Ogr,SizeOF(OgrRec), #0);
          Move(EskOgr.Is       , Ogr.Is, SizeOf(EskOgr.Is));
	  Move(EskOgr.Ad       , Ogr.Ad, SizeOf(EskOgr.Ad));
	  Move(EskOgr.Cins     , Ogr.Cins, SizeOf(EskOgr.Cins));
	  Move(EskOgr.DogumYer , Ogr.DogumYer, SizeOf(EskOgr.DogumYer));
	  Move(EskOgr.DogumGun , Ogr.DogumGun, SizeOf(EskOgr.DogumGun));
	  Move(EskOgr.DogumAy  , Ogr.DogumAy, SizeOf(EskOgr.DogumAy));
	  Move(EskOgr.DogumYil , Ogr.DogumYil, SizeOf(EskOgr.DogumYil));
	  Move(EskOgr.YKK      , Ogr.YKK, SizeOf(EskOgr.YKK));
          Move(EskOgr.HazNot   , Ogr.HazNot, SizeOf(EskOgr.HazNot));
	  Move(EskOgr.HazBasYil, Ogr.HazBasYil, SizeOf(EskOgr.HazBasYil));
          Move(EskOgr.Kac      , Ogr.Kac, SizeOf(EskOgr.Kac));
          for j:=1 to 3 do begin
             Move(EskOgr.YYKay[j]    , Ogr.YYKay[j] , SizeOf(EskDonemDers));
             Move(EskOgr.Ders[j]     , Ogr.Ders[j], SizeOf(AnaRecType));
          end;
	  Move(EskOgr.YYCount  , Ogr.YYCount, SizeOf(EskOgr.YYCount));
	  Move(EskOgr.Donem    , Ogr.Donem, SizeOf(EskOgr.Donem));
          for j:=1 to EskOgr.YYCount do
	     Move(EskOgr.AnaKay[j]   , Ogr.AnaKay[j], SizeOf(EskAnaRecType));
          BlockWrite(OgrF2, Ogr, SizeOf(OgrRec), Res2);
    end;
end;
Var BL : Integer;
begin
  readbol;
  For BL:=1 to NuKod do begin
   If Bol[BL]<>'  ' then begin
    open(BL);
    Kopyala;
    closef(BL)
   end;
  end;
end.

