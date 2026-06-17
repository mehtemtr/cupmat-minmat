Unit  BLUNGR;
Interface
uses Ubase, Crt,  Win, Exist, DFile;


const
       HarfNotSay=8;
       CmdBolumSec  =   1;
       CmdBolumGir  =   2;
       CmdYilSec    =   3;
       CmdYeniYil   =   4;
       CmdNotDegis  =   5;
       CmdYeniNot   =   6;
       CmdUnvanSec  =   7;
       CmdUnvanGir  =   8;
       CmdMaxSt     =   9;
       CmdUniversite=   10;
       CmdQuitProg  =   11;


       CmdOgrGir  =   12;
       CmdDrsGir  =   13;
       CmdYYDrsGir=   14;
       CmdUyeGir  =   15;

       CmdOgrCikis  =   16;
       CmdDrsCikis  =   17;
       CmdYYDrsCikis=   18;
       CmdUyeCikis  =   19;

       CmdOgrIndex  =   20;
       CmdDrsIndex  =   21;
       CmdYYDrsIndex=   22;
       CmdUyeIndex  =   23;

       CmdEditYY        =   24;
       CmdYYNotGir      =   25;
       CmdListeHazirla  =   26;
       CmdYYListeBas    =   27;
       CmdBTNotGir      =   28;
       CmdBTListeHazirla=   29;
       CmdBTListeBas    =   30;

       CmdAnaEdit   =   31;
       CmdNotBelge  =   32;
       CmdMezBelge  =   33;
       CmdKarneBasim=   34;
       CmdAnaKutIsle=   35;
       CmdKrediDok  =   36;

       CmdOgrBasim      = 37;
       CmdDrsBasim      = 38;
       CmdYYDrsBasim    = 39;
       CmdUyeBasim      = 40;
       CmdMezunSakla    = 41;
       CmdYYDiskListeBas= 42;
       CmdBTDiskListeBas= 43;
       CmdTTNotGir=44;
       CmdTTListeHazirla=45;
       CmdTTListeBas=46;
       CmdTTDiskListeBas= 47;
       CmdYokla =48;
       CmdKayOku = 49;
       CmdEkCik=50;
       CmdHataDok=51;
       CmdListeDok=52;
       CmdKayKont = 53;
       CmdKredi=54;



  GrdAdLen      = 9 ; MaxGrade = 127;
  BolAdLen      = 30; MaxBolum = 16;
  UnvAdLen      = 11; MaxUnvan = 20;
  EH   : Array[Boolean] of string[5]=('HAYIR','EVET ');
  Guz = 1; Bah = 2; Yaz = 3;
  GUZBAH : ARRAY[Guz..Yaz] Of String[3] = ('GUZ', 'BAH','YAZ');

type
  DipNotType = record
     DipYer : Word;
     Dip    : String[60];
  end;
  Cursor = object(base)
     ColSay          : Byte;
     EdY             : Word;
     EdX             : Byte;
     EdRow,EdCol     : Byte;
     Bas, Son        : Word;
     TabStop         : ARRAY[1..10] OF BYTE;

     Constructor Init;
     Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
     Procedure   PrintGuys(Attr : Byte);
     Procedure   CursorDown;
     Procedure   CursorUp;
     Procedure   CursorTab;
     Function    SelectSingle(Title, EdT : STRING;
                               Basla, Bitir : Word;
                               Attr : Byte):Word;
  end;

  IkiKod = Object(Cursor)
         MaxKod,
         NuKod,
         Len,
         Aktif : Byte;
        Constructor Init(MK, LN : Byte);
        Procedure   ShowLine(Yer : Word; Attr : Byte); Virtual;
        Procedure   ReadFile(FName : String);virtual;
	Procedure   WriteFile(FName: String);virtual;
        Function    Search(S:String; Var Yer:Word):Boolean;
        Function    KOD(Yer : Word)   : String;
	Function    KODAD(Yer : Word) : String;
	Procedure   SetKod(S:String; Yer:Word);
	Procedure   SetKodAd(S:String; Yer:Word);
	Procedure   Giris(Title:String; FName : String);
     end;
     BolumObj = Object(IkiKod)
	    BOL   : Array[1..2*MaxBolum] of Char;
	    BOLAD : Array[1..BolAdLen*MaxBolum] of Char;
	    Constructor Init;
	    Procedure   BolumGir;
	    Function    BolumSec:Word;
     end;
     UnvanObj = Object(IkIKod)
	    UNV   : Array[1..2*MaxUnvan] of Char;
	    UNVAD : Array[1..UnvAdLen*MaxUnvan] of Char;
	    Constructor Init;
	    Procedure   UnvanGir;
	    Function    UnvanSec:Word;
     end;

    GradeRec = Record
      GrdW   : Word;
      OrtHes : Boolean;
      Basari : Boolean;
      Isaret : Char;
   end;

   GradeObj = Object(IkiKod)
      GRDKOD    : Array[1..2*MaxGrade] of Char;
      GRDAD     : Array[1..GrdAdLen*MaxGrade] of Char;
      Grade     : Array[1..MaxGrade] of GradeRec;
      DipNot    : DataFile;
      Constructor Init;
      Procedure  ShowLine(Yer:word; Attr : Byte);virtual;
      Procedure  GradeGir;
      Procedure  ReadGradeFile;
      Procedure  WriteGradeFile;
      Procedure  EditGrd;
      Function   GW(Yer:Word) : Real;
      Function   GradeLine(Yer : Byte):String;
      Function   BasimGradeLine(Yer : Byte) : String;
      Procedure  ReadGrade(KD:String; X, Y : Byte;
		       Var Yer  : Word;
		       Var TC   : Char);
      Function   ReadDipNot(Yer : Word):String;
   end;
   ActYilRec = record
     Sene    : Word;
     YarYil  : Byte
   end;
   YariyilObj = Object(Cursor)
     Yil    : Array[1..3] of ActYilRec;
     Constructor Init;
     Procedure   ShowLine(Yer : Word; Attr : Byte);Virtual;
     Function    YilSec:Word;
     Procedure   ReadYil;
     Procedure   WriteYil;
  end;

  Function  SeneStr:String;
  Function  SnStr(Y :Word):String;

Var Bolum  : BolumObj;
    Unvan  : UnvanObj;
    GRAD    : GradeObj;
    Yariyil: YariyilObj;
    ActBol : Word;
    ActUnv : Word;
    AktifYYInd  : Byte;
    ActYil : Word;
    ActYY  : Byte;
    KrediHesapla:Boolean;
    HarfNotYer:Array [1..HarfNotSay] of Word;
implementation
   Function  SeneStr:String;
   begin
      SeneStr:=Snstr(ActYil);
   end;
   Function  SnStr(Y :Word):String;
   Var S : String;
   begin
      Str(Y,S);
      S:=Copy(S,3,2);
      If S[1]=' ' then S[1]:='0';
      SnStr:=S;
   end;
Constructor YariyilObj.Init;
Var I : Word;
begin
   Cursor.Init;
   For I:=Guz to Bah do
      with Yil[I] do begin
       Sene:=1992; YarYil:=I;
      end;
   with Yil[Yaz] do begin
       Sene:=1992; YarYil:=1;
      end;
   ActYil:=1992;
   ActYY:=1;
   AktifYYInd:=1;
   ReadYil;
end;
Function YariyilObj.YilSec;
Var L : Word;
begin
  L:=SelectSingle('AKTIF YILI SECINIZ','14@DONEM',1,3, SelectColor);
  If L=0 then L:=1;
  YilSec:=L;
end;
Procedure YariyilObj.ShowLine;
Var T:Text;
begin
   With Yil[EdY] do
      WriteStr(Form.FieldKol[1],EdRow,YilStr(Sene,YarYil),Attr);
end;

Procedure YariyilObj.ReadYil;
Var T:TextFile;
    I:Word;
begin
   If Not exists('YIL.DAT') then WriteYil;
   With T do begin
       OpenToRead('YIL.DAT');
       AktifYYInd:=StrToInt(ReadText);
       For I:=Guz to Yaz do
          With Yil[I] do begin
            Sene:=StrToInt(ReadText);
            YarYil:=StrToInt(ReadText);
          end;
       with Yil[AktifYYInd] do begin
         ActYil:=Sene;
         ActYY:=YarYil;
       end;
       CloseFile;
    end;
end;
Procedure YariyilObj.WriteYil;
Var T:TextFile;
    I:Word;
    S:String;
begin
    With T do begin
       OpenToWrite('YIL.DAT');
       Str(AktifYYInd,S);
       WriteText(S);
       For I:=Guz to Yaz do
          with Yil[I] do begin
	     Str(Sene, S);
	     WriteText(S);
             Str(YarYil, S);
	     WriteText(S);
          end;
       CloseFile;
    end;
end;
Constructor Cursor.Init;
begin
     ColSay:=1; EDY:=1; EdX:=1; EdRow:=1; EdCol:=1;
     Bas:=1; Son:=0; TabStop[1]:=1;
end;

Procedure   Cursor.ShowLine(Yer : Word; Attr : Byte);
begin
end;
{F+}
{$L CURSOR.OBJ}
Procedure Cursor.CursorDown;external;
Procedure Cursor.CursorUp;external;
Procedure Cursor.CursorTab;external;
Procedure Cursor.PrintGuys(Attr:Byte);
Var I, SN : Word;
begin
    ClrScr;
    SN := Bas + Hi(WindMax) - Hi(WindMin);
    If SN > SON then SN :=SON;
    Edrow:=1; EdY:=Bas;
    For  I:= Bas to SN Do begin
	 ShowLine(I, Attr);
         Inc(EdRow); Inc(EdY);
    end;
    EdY:=Bas; EdRow:=1; EDX:=1; EdCol:=TabStop[1];
    GotoXY(EdCol, EdRow);
end;
Function    Cursor.SelectSingle(Title, EdT : STRING;
                               Basla, Bitir : Word;
                               Attr : Byte):Word;
Var Stop : Boolean;
    TC   : Char;
begin
  SelectSingle:=Basla;
  if (Basla >= Bitir) then exit;
  OpenEditWindow(Title, EdT, 'ENTER:SE€˜M@ESC:VAZGE€',
		 [CR,ESC], [], 3, Bitir-Basla+1);

  ClrScr;
  Bas:=Basla; Son:=Bitir;
  PrintGuys(InvColor(Attr));
  Stop:=False; HideCursor;
  Repeat
     ShowLine(EdY, Attr); TC:=GetKeyCmd; ShowLine(EdY, InvColor(Attr));
     Case TC of
        UPKEY  : CursorUp;
        DOWNKEY: CursorDown;
	ESC : Begin
		Stop:=True;
		SelectSingle:=0;
	      end;
	CR  : begin
		SelectSingle:=EdY;
		Stop:=True
	      end;
     end;{Case}
  Until Stop;
  ShowCursor;
  CloseEdit;
end;

Constructor IkiKod.Init(MK, LN : Byte);
Var I, L: Word;
begin
   Cursor.Init;
   MaxKod:=MK;
   Len:=LN;
   NuKod:=0;
   Aktif:=1;
   For I:=1 to MaxKod do SetKod('  ',I);
   For I:=1 to MaxKod do SetKodAd(Spaces(Len),I);
end;
Function   IkiKod.Kod(Yer:Word):String;External;
Function   IkiKod.KodAd(Yer:Word):String;External;
Function   IkiKod.Search(S:String; Var Yer:Word):Boolean;external;
Procedure  IkiKod.SetKod(S:String; Yer:Word);External;
Procedure  IkiKod.SetKodAd(S:String; Yer:Word);External;
Procedure  IkiKod.ShowLine(Yer : Word; Attr: Byte);
begin
   WriteStr(Form.FieldKol[1], EdRow ,KOD(Yer), Attr);
   GotoXY(Form.FieldKol[2],EdRow); ClrEol;
   WriteStr(Form.FieldKol[2], EdRow ,KODAD(Yer), Attr);
end;



Procedure IkiKod.ReadFile;
Var T:TextFile;
    I : Word;
begin
  If Not Exists(FName) then WriteFile(FName);
  With T do begin
    OpenToRead(FName);
    NuKod:=StrToInt(ReadText);
    Aktif:=StrToInt(ReadText);
    For I:=1 to NuKod do begin
       SetKod(ReadText,I); SetKodAD(ReadText,I);
    end;
    CloseFile;
  end;
end;
Procedure IkiKod.WriteFile;
Var T:TextFile; I:Word;S:String;
begin
  With T do begin
    OpenToWrite(FName);
    Str(NuKod,S);
    WriteText(S);
    Str(Aktif,S);
    WriteText(S);
    For I:=1 to NuKod do begin
       WriteText(KOD(I)); WriteText(KodAd(I));
    end;
    CloseFile;
  end;
end;
Procedure IkiKod.Giris(Title:String; FName : String);
Var TC    : Char;
    Yer   : Word;
    Adres:Word;
    T, KD, AD  :String;
    Procedure ReadKod;
    begin
      InputStr(KD,Form.FieldKol[1],1,2, True, AllKar, 0, TC);
      KD:=KD+'  '; KD[0]:=Chr(2);
      If TC = NULL then
	 If Search(KD, Yer) then  begin
             ClrScr; Ad:=KodAd(Yer);
         end;
    end;
    Procedure ReadAd;
    begin
	if TC<>Null then exit;
        Strip(AD);
	InputStr(AD,Form.FieldKol[2],1, Len, False, AllKar, 0, TC);
	If Search(KD, Yer) then SetKodAd(AD,Yer);
    end;
begin
  Str(Len,T);
  OpenEditWindow(Title,'2@KOD@'+T+'@AD','INS:G˜R˜ž@ESC:VAZGE€',
  [ESC,INSKEY],[], 13, 1);
  ClrScr; KD:='  '; AD:=Spaces(Len);
  repeat
    ReadKod;
    Writestr(Form.FieldKol[1],1,KD, NormalAttr);
    ReadAD;
    GotoXY(Form.FieldKol[2],1);
    ClrEol;
    Writestr(Form.FieldKol[2],1,AD, NormalAttr);
    Case TC of
       ESC    : WriteFile(FName);
       INSKEY : If not Search(KD,Yer) then
		  If NuKod = MaxKod then
		     Complain('DAHA FAZLA G˜R˜ž:YAPILAMAZ')
		  else begin
		     Inc(NuKod);
		     SetKOD(KD,NuKod);
		     SetKodAd(AD,NuKod);
		     KD:='  '; AD:=Spaces(Len);
		     clrscr;
		  end;
    end;
  until TC=ESC;
  CloseEdit;
end;


constructor Bolumobj.init;
begin
    IkiKod.Init(MaxBolum, BolAdLen);
    ReadFile('BOLUM.DAT');
    ActBol:=Aktif;
end;

Procedure   Bolumobj.BolumGir;
Begin
    Giris('YEN˜ B™LšM G˜R˜ž','BOLUM.DAT')
end;

Function   Bolumobj.BolumSec:Word;
Var L : Word;
begin
    L:=SelectSingle('B™LšMš SE€˜N˜Z','2@B™L@30@B™LšMšN ADI',1, NuKod, SelectColor);
    If L=0 then L:=1;
    BolumSec:=L;
end;


Constructor GradeObj.Init;

Var K : Word;
    G : String;
begin
   IkiKod.Init(MaxGrade,GrdAdLen);
   DipNot.Init(MaxGrade, SizeOf(DipNotType));
   FillChar(Grade,SizeOf(Grade), #0);
   For K:=1 to 99 do begin
       Str(K:2,G); If G[1]=' ' then G[1]:='0';
       SetKod(G,K);SetKodAD(G,K);
       Grade[K].GrdW:= K;
   end;
   SetKod('00',100);
   SetKodAD('100',100);
   Grade[100].GrdW:=100;
   For K:=1 to 100 do
      With Grade[K] do begin
	OrtHes:=(GrdW>=60);
	Basari  :=OrtHes;
	Isaret:=' ';
      end;
   G:='BSBTDTMUMZNYTTHZTK';
   Move(G[1],GRDKOD[201],Length(G));
   G:='BAžARILI BšTšNLEMEDEVAMSIZ MUAF     MAZARETL˜NOT YOK  TEKRAR   HAZIRLIK         ';
   Move(G[1],GRDAD[100*GrdAdLen+1],Length(G));
   For K:=101 to 109 do
     Grade[K].Isaret:=' ';
   Grade[101].Basari:=True;
   Grade[104].Basari:=True;
   NuKod:=109;
   ReadGradeFile;
end;

Procedure   GradeObj.GradeGir;
Begin
    Giris('YEN˜ NOT G˜R˜ž˜','GRADE.DAT');
    WriteGradeFile;
end;

Function GradeObj.GW(Yer:Word) : Real;
begin
       With Grade[Yer] do GW:=Lo(GrdW)+Hi(GrdW)/10;
end;

Procedure GradeObj.ShowLine(Yer:Word; Attr: Byte);
begin
 GotoXY(1,EdRow); ClrEol;
 With Grade[Yer] do with Form do begin
    WriteStr(FieldKol[1],EdRow,KOD(Yer),Attr);
    WriteStr(FieldKol[2],EdRow,KODAD(Yer),Attr);
    WriteStr(FieldKol[3],EdRow,RealToStr(GW(Yer),5,1),Attr);
    WriteStr(FieldKol[4],EdRow,EH[OrtHes],Attr);
    WriteStr(FieldKol[5],EdRow,EH[Basari],Attr);
    WriteStr(FieldKol[6],EdRow,Isaret,Attr);
 end;
end;

Procedure GradeObj.ReadGradeFile;
Var F : File;
    Result:Integer;
begin
  If Not Exists('GRADE.DAT') then WriteFile('GRADE.DAT');
  ReadFile('GRADE.DAT');
  If Not Exists('GRDSTAT.DAT') then begin
     Assign(F,'GRDSTAT.DAT');
     ReWrite(F,SizeOf(Grade));
     BlockWrite(F,Grade,1,Result);
     Close(F);
  end
  else begin
       Assign(F,'GRDSTAT.DAT');
       Reset(F,SizeOf(Grade));
       BlockRead(F,Grade,1,Result);
       Close(F);
  end;
end;
Procedure GradeObj.WriteGradefile;
Var F : File;
    Result:Integer;
begin
   WriteFile('GRADE.DAT');
   Assign(F,'GRDSTAT.DAT');
   ReWrite(F,SizeOf(Grade));
   BlockWrite(F,Grade,1,Result);
   Close(F);
end;
Function GradeObj.GradeLine(Yer : Byte) : String;
begin
    If (Yer<=0) or (Yer > NuKod) then
       GradeLine:=Spaces(3+GrdAdLen)
    else if Yer<= 99 then
	    GradeLine:=KOD(Yer)+Spaces(1+GrdAdLen)
	 else if Yer=100 then
		 GradeLine:='100'+Spaces(GrdAdlen)
	      else
		 GradeLine:=KOD(Yer)+' '+KODAD(Yer)
end;

Function GradeObj.BasimGradeLine(Yer : Byte) : String;
Var I : integer; J : Boolean;
begin
    I:=1;J:=False;
    While (I<=HarfNotSay) and not J do begin
       if HarfNotYer[I]=Yer then J:=true;
       Inc(I)
    end;
    If (Yer<=0) or (Yer > NuKod) then
       BasimGradeLine:=Spaces(3+GrdAdLen)
    else if (Yer<= 99) or J then
	    BasimGradeLine:=Spaces(6)+KOD(Yer)+Spaces(GrdAdLen-5)
	 else if Yer=100 then
		 BasimGradeLine:=Spaces(5)+'100'+Spaces(GrdAdlen-5)
	      else
		 BasimGradeLine:=KOD(Yer)+' '+KODAD(Yer)
end;
Procedure  GradeObj.ReadGrade(KD:String; X, Y : Byte;
		       Var Yer  : Word;
		       Var TC   : Char);
Begin
    REPEAT
      If (Yer>0) and (Yer<=NuKod) then KD:=KOD(Yer);
      If Not Search(KD,Yer) then Yer:=106;
      WriteStr(X,Y,GradeLine(Yer),NormalAttr);
      InputStr(KD, X,Y,2, True, ALLKAR, 0, TC);
      If TC<>NULL then exit;
      If Search(KD,Yer) then begin
	 WriteStr(X,Y,GradeLine(Yer),NorMalAttr);
	   exit
       end else
	Complain('BU NOT YOK');
    UNTIL FALSE;
end;
Function GradeObj.ReadDipNot(Yer:Word):String;
Var U:DipNotType;
    L:Word;
begin
    ReadDipNot:=Spaces(60);
    if Grade[Yer].Isaret=' ' then exit;
    With DipNot do begin
	OpenFile('DIP.DAT');
	For L:=1 to FirstFree-1 do begin
	     GetRec(L,U);
	     If U.DipYer=Yer then begin
		ReadDipNot:=U.Dip;
		CloseFile;
		Exit
	      end;
	end;
	CloseFile
    end;
end;


Procedure GradeObj.EditGrd;
Var B : Word;
    I, H : Word;
    Stop : Boolean;
    TC   : Char;
    S    : String;
    Procedure GetDipNot;
    Var U:DipNotType;
	L:Word;
        NotVar : Boolean;
	begin
	     If (TC<>NULL) or (Grade[EdY].Isaret=' ') then exit;
	     S:=ReadDipNot(EdY);
	     OpenEditWindow('D˜P NOT G˜R˜ž˜',
	     '62@BU ˜žARET ˜LE ˜LG˜L˜ D˜P NOTU G˜R˜N˜Z',
	     'INS:G˜R˜ž@ESC:VAZGE€',
	      [ESC,INSKEY], [], 6, 1);
	      repeat
		  InputStr(S,Form.FieldKol[1],1, 60, False, AllKar, 0, TC);
		  If TC=INSKEY then begin
		     If Length(S)<60 then S:=S+Spaces(60);
		     S[0]:=Char(60);
		     with DipNot do begin
			OpenFile('DIP.DAT');
                        NotVar:=False;
                        L:=1;
                        While (L<=FirstFree-1) and Not NotVar do begin
                            GetRec(L, U);
                            If U.DipYer=EdY then NotVar:=True;
                            Inc(L);
                        end;
                        U.Dip:=S; U.DipYer:=EdY;
                        If NotVar then begin
                           Dec(L);
                           PutRec(L,U);
                        end else
  			   AddRec(L, U);
			CloseFile;
		     end;
		     TC:=ESC
		  end;
	      until TC=ESC;
	     TC:=NULL;
	     CloseEdit;
	end;
    Procedure GetAd;
    Begin
       If (TC<>NULL) then exit;
       S:=KodAd(EdY);
       InputStr(S, Form.FieldKol[2], EdRow, 9, False, ALLKAR, 0, TC);
       S:=S+Spaces(9); S:=Copy(S,1,9);
       SetKodAd(S,EdY);
     end;
     Procedure GetIsaret;
     Begin
       If (TC<>NULL) then exit;
       S:=Grade[EdY].Isaret;
       InputStr(S, Form.FieldKol[6], EdRow, 1, True,ALLKAR, 0, TC);
       If S='' then S:=' ';
       Grade[EdY].Isaret:=S[1];
       If (TC=NULL) and (S<>' ') then GetDipNot;
     end;
     Procedure GetW;
     Var Y:Real; I:Integer; L,H:Byte;
	Begin
	  If (TC<>NULL) then exit;
	  S:=RealToStr(GW(EdY),5,1);
	  InputStr(S, Form.FieldKol[3], EdRow, 5, False,NumericSet, 0, TC);
	  Y:=StrToReal(S);S:=RealToStr(Y,3,1);
	  I:=Pos('.',S);
	  L:=StrToInt(Copy(S,1,I-1));
	  H:=StrToInt(Copy(S,I+1,Length(S)-I));
	  Grade[EdY].GrdW:=L+(H Shl 8);
	end;

      Procedure GetOrt;
      Begin
       If (TC<>NULL) then exit;
       WriteStr(Form.FieldKol[4],EdRow,EH[Grade[EdY].OrtHes],InverseAttr);
       S:='';
       GotoXY(Form.FieldKol[4],EdRow);
       TC:=GetDesiredKey([ESC, TAB, UpKey, DownKey,  CR, F10]);
       If TC=CR then
	  With Grade[EdY] do begin
	    OrtHes:=Not OrtHes;
	    TC:=NULL;
	  end;
       end;
       Procedure GetBas;
       Begin
	 If (TC<>NULL) then exit;
	 WriteStr(Form.FieldKol[5],EdRow,EH[Grade[EdY].Basari],InverseAttr);
	 GotoXY(Form.FieldKol[5],EdRow);
	 TC:=GetDesiredKey([ESC, TAB, UpKey, DownKey,  CR, F10]);
	 If TC=CR then
	    With Grade[EdY] do begin
	      Basari:=Not Basari;
	      TC:=NULL;
	  end;
       end;
begin
   OpenEditWindow('NOTLARDA DE¦˜ž˜KL˜K',
  '2@KOD@9@AD@5@A¦IRLIK@5@ORTALAMA@5@BAžARILI@1@IžARET',
  'F10:NOT BAžLANGI€@ESC:VAZGE€',
   [F10,ESC, UPKEY, DOWNKEY, TAB], [CmdYeniNot], 3, NuKod);
   ColSay:=Pred(Form.FieldSay);
   ClrScr; Son:=NuKod;
   PrintGuys(NormalAttr);
   TC:=NULL;
   Stop:=False;
   EdX:=1;
   Repeat
      ShowLine(EdY,NormalAttr);
      case EdX of
	1 : GetAd;
	2 : GetW;
	3 : GetOrt;
	4 : GetBas;
	5 : GetIsaret;
      end;
      DoEvent(EventKey);
      Case TC of
	 NULL : TC:=TAB;
	 F10  : begin OpenEditWindow('BAžLANGI€ NOT','2@KOD',
		       'ESC : VAZGE€',[ESC],[], 10, 1);
		      S := '';
		      InputStr(S, Form.FieldKol[1],1, 2, True, ALLKAR, 0, TC);
		      If TC = NULL then Begin
			if not Search(S,B) THEN B:=1;
		      end;
		      CloseEdit;
		      H:=Bas;Bas:=B; PrintGuys(NormalAttr); Bas:=H;
                      TC:=NULL;
		 end;
	 UPKEY   : begin CursorUp;TC:=NULL end;
	 DOWNKEY : begin CursorDown;TC:=NULL end;
	 NULL,TAB: begin CursorTab;TC:=NULL end;
	 #253    : Begin
		     TC:=NULL;
		     ClrScr;
		     Son:=NuKod; Bas:=Son;
		     PrintGuys(NormalAttr);
		     Bas:=1;
		     EdX:=1;
		   end;
      end;
   Until TC = ESC;
   WriteGradeFile;
   CloseEdit
end;

Constructor UnvanObj.init;
Type Str11 = String[11];
Var
    I, L, M : Byte;
    G : String;
begin
   IkiKod.Init(MaxUnvan, UnvAdLen);
   G:='PDDDYDAGOGUZOKODADDG';
   Move(G[1], UNV[1], Length(G));
   G:='PROF.DR.   DO€.DR.    YAR.DO€.DR.AR.G™R.    O¦R.G™R.   UZMAN      OKUTMAN    O¦R.G™R.DR.AR.G™R.DR. D˜GER      ';
   Move(G[1], UNVAD[1], Length(G));
   NuKod:=10;
   ReadFile('UNV.DAT');
   ActUnv:=Aktif;
End;
Procedure UnvanObj.UnvanGir;
begin
   IkiKod.Giris('YENI UNVAN G˜R˜ž˜','UNV.DAT');
END;

Function UnvanObj.UnvanSec:Word;
Var L : Word;
begin
  L:=SelectSingle('šNVANI SE€˜N˜Z','2@KOD@11@šNVAN ADI',1, NuKod, SelectColor);
  If L=0 then L:=1;
  Aktif:=L;
  UnvanSec:=Aktif;
end;
begin
  Bolum.init;
  Unvan.init;
  Grad.iNIT;
  Yariyil.init;
  if Grad.Search('AA', HarfNotYer[1]) then;
  if Grad.Search('BA', HarfNotYer[2]) then;
  if Grad.Search('BB', HarfNotYer[3]) then;
  if Grad.Search('CB', HarfNotYer[4]) then;
  if Grad.Search('CC', HarfNotYer[5]) then;
  if Grad.Search('DC', HarfNotYer[6]) then;
  if Grad.Search('DD', HarfNotYer[7]) then;
  if Grad.Search('FF', HarfNotYer[8]) then;
end.

