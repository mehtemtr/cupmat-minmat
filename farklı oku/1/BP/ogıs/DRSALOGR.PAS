uses DFile;
Var ActYil : Word;
    BolSay : Word;
    Bol    : Array[1..16] of String[2];
    BolAd  : Array[1..16] of String[30];
    Yil:Array[1..3] of Word;
    YY:Array[1..3] of Byte;

const
  MaxKeyLen     =  8;
  MaxAdLen      = 25;
  OgrKeyL       = 8;
  DrsKeyL       = 6;
  UyeKeyL       = 6;
  YYDrsKeyL     = 8;
  MaxOgr        = 1023;
  MaxDrs        = 2047;
  MaxUye        =  511;
  MaxYYDrs      =  639;
  MaxDonemDrs   = 18;
  MaxDonem      = 20;
  ALFABESTR:STRING =' !"#$%&'#39'()*+,-./0123456789:;<=>?ABC€DEFG¦HI˜JKLMNO™PQRSžTUšVWXYZ';
  GUZBAH : ARRAY[1..3] Of String[3] = ('GUZ', 'BAH','YAZ');

type

  AdStr        = String[25];
  header = record
            f, m, n, t, k : Integer;
 end;

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
   KacType        = Array[1..3] of Byte;
   DonemDers      = Array[1..MaxDonemDrs] of Word;
   YYKayType      = Array[1..3] of DonemDers;
   DersType       = Array[1..3] of AnaRecType;
     TKutRec = Record
       DrsPtr: Integer; Grd : Byte;
   end;
   TKutRecArr = Array[1..MaxDonemDrs] of TKutRec;
   DogumYerStr = String[15];
   OgrRec  = record
	  Is       : Array[0..OgrKeyL-1] of Char;
	  Ad       : String[25];
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
  DrsRec  = record
	  Is         : Array[0..DrsKeyL-1] of Char;
	  Ad         : AdStr;
	  Saat       : Byte;
	  Kredi      : Real;
	  AlanOgrSay : LongInt;
	  YYDSay     : Array[1..3] Of Byte;
     end;

Var
  Ogr       : OgrRec;
  AlanSay : Array[1..MaxDrs] of LongInt;
  YYSay   : Array[1..3,1..MaxDrs] of Word;

   Function  YDFName(Y :Byte):String;
   Var S : String;
   begin
      Str(Yil[Y],S);
      S:=Copy(S,3,2);
      If S[1]=' ' then S[1]:='0';
      Case YY[Y] of
        1 : S:='C:\OSMANIYE\GUZDRS'+S+'.DAT';
        2 : S:='C:\OSMANIYE\BAHDRS'+S+'.DAT';
      end;
      YDFName:=S;
   end;

Procedure ReadBolum;
Var T : Text;
    Aktif,I : Word;
begin
    Assign(T,'C:\OSMANIYE\BOLUM.DAT');
    Reset(T);
    Readln(T,BolSay);
    ReadLn(T,Aktif);
    For I:=1 to BolSay do begin
       ReadLn(T,Bol[I]);
       ReadLn(T,BolAd[I]);
    end;
    Close(T);
end;
Procedure ReadYY;
Var T : Text;
    Aktif, I : Word;
begin
    Assign(T,'C:\OSMANIYE\YIL.DAT');
    Reset(T);
    Readln(T,Aktif);
    For I:=1 to 3 do begin
       ReadLn(T,YIL[I]);
       ReadLn(T,YY[I]);
    end;
    Close(T);
end;
Procedure AlanYaz;
Var I, J  : Word;
    Drs   : DrsRec;
    F     : DataFile;
begin
    F.Init(MaxDrs,SizeOf(DrsRec));
    F.OpenFile('C:\OSMANIYE\DRS.DAT');
    For I:=1 to F.FirstFree-1 do begin
        F.GetRec(I, Drs);
        Drs.AlanOgrSay:=AlanSay[I];
        For J:=1 to 3 do Drs.YYDSay[J]:=YYSay[J,I];
        F.PutRec(I, Drs);
    end;
    F.CloseFile;
end;
Function   IsOk(Var Is; Len : Byte; Var S : String) : Boolean;
Type   IsType         = Array[0..10] of Char;
Var I, J : Integer;
    B : Boolean;
begin
    Move(IsType(Is),S[1], Len);
    S[0]:=Chr(Len);
    B:=True;
    For J:=1 to Len do
        B:= B and (Pos(S[J], AlfabeStr)<>0);
    IsOk:=B
end;


Procedure Process(BolNo : Integer);
Var  X, I, J: Integer;
     T : String;
     F: DataFile;

begin
   F.Init(MaxOgr, SizeOf(OgrRec));
   F.OpenFile('C:\OSMANIYE\'+BOL[BolNo]+'OGR.DAT');
   For X:=1 to F.FirstFree-1 do begin
      F.GetRec(X, Ogr);
      If IsOk(Ogr.Is,8,T) then begin
         For I:=1 to Ogr.YYCount do
             For J:=1 to Ogr.Donem[I].Cnt do
                 Inc(AlanSay[Ogr.AnaKay[I,J].DrsPtr]);
          For I:=1 to 3 do
             For J:=1 to Ogr.Kac[I] do
                 Inc(YYSay[I,Ogr.Ders[I,J].DrsPtr]);
      end;
   end;
   F.CloseFile;
end;
Var BL : Byte;
begin
   ReadBolum;
   FillChar(AlanSay,SizeOf(AlanSay),#0);
   FillChar(YYSay,SizeOf(YYSay),#0);
   For BL:=1 to BolSay do
       Process(BL);
   alanYaz;
end.
