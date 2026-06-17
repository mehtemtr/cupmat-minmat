Unit UIndex;
Interface
uses UBase, BLUNGR, DFile, CRT, Nsr, Exist, Objects;
 Const
  MaxKey        = 2047;
  MaxAdLen:Byte = 25;
Var
  SelArr    : Array[0..MaxKey] of Boolean;
  Indis     : Array[1..MaxKey] of Word;
  InvInd    : Array[1..MaxKey] of Word;
  IndisSay  : Word;

type
  Select = object(CurSor)
     Say, KeyL : Word;
     Constructor Init(KL : Word);
     Function    Search(S:String; Var Yer, Adr : Word):Boolean;Virtual;
     Function    BaslaKod : word;
     Function    Selection(Title, EdT : String; Attr : Byte): Boolean;Virtual;
  end;

  TWord=Array[0..MaxInt div 2] of Word;
  PWord=^TWord;
  Index = object(Select)
          MaxKay           : Word;
	  FirstFree        : Word;
	  Deltd            : Word;
	  RecLen           : Word;
          Sabit            : String[8];
          IndexChange      : Boolean;
          AdrPtr           : PWord;
          PData            : Pointer;
          Data             : Record end;
	  Constructor Init(MK, KL, RL : Word);
	  Destructor  Done; virtual;
          Procedure   Error(Code, Info : Word); Virtual;
          Procedure   ShowLine(Yer : Word; Attr:Byte); Virtual;
          Function    SingleLine(Yer : Word) : String; Virtual;
	  Function    Search( S : String; Var Yer, Adres : Word) : Boolean; Virtual;
	  Function    Selection(Title, EdT : String; Attr : Byte): Boolean;Virtual;
          Procedure   ZeroKay;Virtual;

          Procedure   DelIndex(Yer : Word);
          Procedure   InsIndex(Yer : Word);

          Function    GetKey(Yer : Word) : String; Virtual;
          Function    GetAdr(Yer : Word) : Word;
          Procedure   GetRec(Adr : Word);
          Procedure   PutRec(Adr : Word);
          Function    NewRec : Word;
          Procedure   AddRec(Var X : Word);

          Procedure   SetKeyAdr(S : String; Yer , Adres : Word);
	  Function    ChangeKod(OldS, NewS : String):Boolean;

	  Procedure   ShowStatus(S:String);
	  Function    GetIs : String;
	  Function    GetAd : String;
          Procedure   SetIs(S : String);
          Procedure   SetAd(S : String);
          Procedure   SetRecNil;


          Function ReadKod(X,Y : Byte;
			  Gir : Boolean;
			  NUM : Word):Char;
          Procedure ReadAd(X,Y    : Byte;
			 Var TC : Char);
          Procedure GirisYap;
          Procedure GetSabit;
          Function  GetNewKod(Title:String; Var OldS, NewS : String):Boolean;
          Function  SearchAndPrint(Var S: String;
			      Baslik, EdT : String;
		       Var Yer, Adres  : Word):Boolean;

	  Procedure Load(S  : String);
	  Procedure Store(S : String);

          Procedure IndexDuz;
end;

Implementation

Constructor Select.Init(KL : Word);
Begin
   Cursor.Init;
   KeyL:=KL;
   Say:=0;
End;

Function Select.BaslaKod:Word;
Var
     S            : String;
     TC           : Char;
     Adres        : Word;
     Flag         : Boolean;
     B            : Word;
begin
    ShowCursor; Str(KeyL,S);
    OpenEditWindow('BAžLANGI€ KOD', S+'@KOD','ESC : VAZGE€',[ESC],[],10, 1);
    S := '';
    InputStr(S, 1,1, KeyL, True, ALLKAR, 0, TC);
    If TC = NULL then Begin
	Flag:=Search(S,B, Adres);
	If B > Say then B:= Say;
	BaslaKod:=B;
   end;
   CloseEdit;
   HideCursor;
end;
Function Select.Selection(Title, EdT : String; Attr : Byte): Boolean;
Var L, I, H, T : Word;
    Stop : Boolean;
    TC   : Char;
Procedure PrintLine;
begin
      If SelArr[EdY] then
         ShowLine(EdY,Attr)
      else
         ShowLine(EdY,InvColor(Attr));
end;
Procedure Reprint(T : Word; SaveEdY:Boolean);
Var I , H, L, M : Word;
begin
     ClrScr;
     H := T + Hi(WindMax) - Hi(WindMin);
     If H > SON then H :=SON;
     L:=EdY; M:=EdRow; EdY:=T; Edrow:=1;
     For I:= T to H do begin
	 GotoXY(1,EdRow); PrintLine;
	 Inc(EdY); Inc(EdRow)
     end;
     If SaveEdY then begin
	 EdY:=L;
	 EdRow:=M;
     end else begin
	 EdY:=T;
	 EdRow:=1;
     end;
     EdX:=1; EdCol:=TabStop[1];
     GotoXY(EdCol, EdRow);
end;



begin
  Selection:= False;
  If Say < 1 Then Begin
     Complain('SE€ECEK B˜R žEY YOK');
     Exit;
  end;
  OpenEditWindow(Title,EdT,
	       'ENTER:SE€˜M@PGUP:HEPS˜@PGDN:H˜€B˜R˜@F10:KOD BAžLA@END:SE€˜M TAMAM@ESC:˜PTAL',
	       [CR, F10, ENDKEY, ESC,PGUPKEY,PGDNKEY],[],3,Say);
  Bas:=1; Son:=Say;
  FillChar(SelArr,SizeOf(SelArr),#0);
  ClrScr;
  PrintGuys(InvColor(Attr));
  Stop:=False;
  HideCursor;
  Repeat
      PrintLine;
      WriteChar(1,EdRow, 1, Chr(26), Attr);
      TC:=GetKeyCmd;
      WriteStr(1, EdRow, ' ' , InvColor(Attr));
      case TC of
        UPKEY   : CursorUp;
	DOWNKEY : CursorDown;
	ESC     : Stop:=True;
	CR      : begin
                    SelArr[EdY]:=Not SelArr[EdY];
                    PrintLine;
                    CursorDown
                  end;
	F10     : begin
		     T:=BaslaKod;
		     If (Bas<=T) and (T<=Son) then RePrint(T,False);
		 end;
	PGUPKEY : begin
		      For I:=1 to Son do SelArr[I]:=TRUE;
                      T:= EdY - EdRow +1;
		      RePrint(T,True);
		   end;
        PGDNKEY : begin
		      For I:=1 to Son do SelArr[I]:=False;
		      T:= EdY -EdRow +1;
		      RePrint(T,True);
		   end;
	ENDKEY   : begin
		     I:=1;
		     Repeat
			Stop:=SelArr[I]; Inc(I);
		     Until Stop or (I > Say);
		     Selection:=Stop;
		     Stop:=True;
		   end;
	  end;{Case}
  Until Stop;
  ShowCursor; CloseEdit;
  end;

Function Select.search;
begin
end;
Constructor Index.Init(MK, KL, RL : Word);
Var X : Word;
begin
  Select.Init(KL);
  MaxKay:=MK;
  RecLen:=RL;
  Say:=0;
  X:=SizeOf(Word)*MaxKay;
  GetMem(AdrPtr, SizeOf(Word)*MaxKay);
  FillChar(AdrPtr^, X, #0);
  X:=RecLen*MaxKay;
  GetMem(PData, X);
  FillChar(PData^, X, #0);
end;
Destructor  Index.Done;
begin
   FreeMem(AdrPtr, SizeOf(Word)*MaxKay);
end;
Function    Index.SingleLine(Yer : Word) : String;
Var S, S1, A  : String;
    Adr   : Word;
    Buf   : Array[0..2047] of Byte;
begin
    SingleLine:=Spaces(WInLastCol-Form.FieldKol[1]);
    If (Yer <=0) Or ( Yer > Say) then Exit;
    S1:=Spaces(Form.FieldKol[2]-Form.FieldKol[1]);
    Adr:=GetAdr(Yer);
    S:=GetKey(Yer);
    Move(S[1], S1[1], KeyL);
    GetRec(Adr);
    Move(Buf[KeyL], A, Buf[KeyL]+1);
    A:=A+Spaces(MaxAdLen);
    A:=Copy(A,1,MaxAdLen);
    SingleLine:=S1+A;
end;

Procedure   Index.ShowLine(Yer : Word; Attr:Byte);
begin
    WriteStr(Form.FieldKol[1],EdRow,SingleLine(Yer),Attr)
end;

Function  Index.ChangeKod;
Var A, Y, Yer, Adres : Word;
    S    : String;
    Junk : Boolean;
begin
   ChangeKod:=False;
   if Search(OldS, Y, A) then
     If Not Search(NewS, Y, A) then begin
        ChangeKod:=True;
        While Search(OldS, Y, Adres) do begin
              S:=GetKey(Y);
              S:=NewS+Copy(S,Length(OldS)+1,KeyL-Length(OldS));
              DelIndex(Y);
              Junk:=Search(NewS,Yer,A);
              InsIndex(Yer);
              SetKeyAdr(S,Yer,Adres);
              GetRec(Adres);
              SetIs(S);
              PutRec(Adres);
        end;
     end;
end;



{$F+}
{$L IN}

Function    Index.Search( S : String; Var Yer, Adres : Word) : Boolean; External;
Procedure   Index.DelIndex(Yer : Word);External;
Procedure   Index.InsIndex(Yer : Word);External;
Function    Index.GetKey(Yer : Word) : String; External;
Function    Index.GetAdr(Yer : Word) : Word; External;
Procedure   Index.SetKeyAdr(S : String; Yer , Adres : Word);External;
Function    Index.GetIs : String;External;
Function    Index.GetAd : String;External;
Procedure   Index.SetIs(S : String);External;
Procedure   Index.SetAd(S : String);External;
Procedure   Index.SetRecNil;External;

{$F-}
Function    Index.Selection(Title, EdT : String; Attr : Byte): Boolean;
Var I : Word; B:Boolean;
begin
   IndisSay:=0; FillChar(Indis,SizeOf(Indis),#0);
   B:=Select.Selection(Title, EdT, Attr);
   Selection:=B;
   if B then begin
      For I:=1 to Say do
	  If SelArr[I] then begin
	     Inc(IndisSay); Indis[IndisSay]:=GetAdr(I)
	  end;
   end;
end;




Procedure Index.ShowStatus(S:String);
Var X, Y : Word;
begin
     WriteStr(1,WinLastRow,Spaces(WinLastCol), NormalAttr);
     If Search(S,X, Y) then
          WriteStr(1,WinLastRow,'DE¦˜ž˜KL˜K YAPILIYOR',HiliteAttr)
       else
          WriteStr(1,WinLastRow,'YEN˜ G˜R˜ž:YAPILIYOR',HiliteAttr)
end;
Procedure Index.ZeroKay;
begin
end;





Function   Index.ReadKod( X,Y : Byte;
			  Gir : Boolean;
			  NUM : Word):Char;
Var S, T : String;
    L, M : Word;
    TC   : Char;
    OK   : Boolean;
    FileAdr, NdxAdr : Word;
begin
     OK:=False;
repeat
     S:=GetIs; T:=S; L:=Length(Sabit); S:=Copy(S,L+1,KeyL-L);
     WriteStr(X,Y, Sabit, TextAttr);M:=Length(Sabit)+X;
     InputStr(S, M, Y, KeyL-L, True, AllKar, NUM, TC);
     S:=Sabit+S; SetIs(S); S:=GetIs;
     ReadKod:=TC;
     If (TC<>NULL) and (TC<>F10) then exit;
     case TC of
        F10 : GetSabit;
        NULL: begin
                OK:=Search(S, NdxAdr, FileAdr);
                if OK then
	            GetRec(FileAdr)
                else
              	    if Gir then begin
	                OK:=True;
                        If T<>S Then ZeroKay;
                     end else Complain('BU KOD DOSYADA YOK');
              end;
     end;
until OK;
     If not Gir then WriteStr(X, Y, GetIs+' '+GetAd, TextAttr);
end;

Procedure Index.ReadAd( X,Y    : Byte;
			 Var TC : Char);
Var S:String;
    NdxAdr, FileAdr : Word;
Begin
   If TC<>NULL then Exit;
   S:=GetAd;
   InputStr(S, X, Y, MaxAdLen, False, AllKar, 0, TC);
   SetAd(S);
   If TC<>NULL then exit;
   If Search(GetIs, NdxAdr, FileAdr) then PutRec(FileAdr);
end;

Procedure Index.GirisYap;
Var B : Boolean;
    S : String;
    NdxAdr, FileAdr:Word;
Begin
   ClrScr;
   S:=GetIs;
   If Not Search(S, NdxAdr, FileAdr) then begin
      AddRec(FileAdr);
      If FileAdr <>0 then begin
         InsIndex(NdxAdr);
         SetKeyAdr(S, NdxAdr, FileAdr);
         IndexChange:= True;
      end  else  complain('DAHA FAZLA GIRIS YAPAMAM');
   end;
end;
Procedure Index.GetSabit;
Var
     S            : String;
     TC           : Char;
begin
    OpenEditWindow('SAB˜T BAžLIK', CHR(47+KeyL)+'@SAB˜T KOD',
		    'ESC : VAZGE€',[ESC], [] ,13, 1);
    S := Sabit;
    InputStr(S, Form.FieldKol[1],1, KeyL-1, True, ALLKAR, 0, TC);
    If TC = NULL then Sabit:=S else TC:=NULL;
    CloseEdit;
end;


Function Index.GetNewKod(Title:String; Var OldS, NewS : String):Boolean;
 Var Yer, Adres : Word;
      TC        : Char;
      AllOk     : Boolean;
  begin
       AllOk:=True;
       OpenEditWindow(Title,
	      Chr(48+KeyL)+'@ESK˜ KOD@'+CHR(48+KeyL)+'@YEN˜ KOD',
	      'ESC:VAZGE€', [ESC], [], 13, 1);
       ClrScr;
       OldS:='';
       NewS:='';
       InputStr(OldS,Form.FieldKol[1],1,KeyL,True, AllKar, 0, TC);
       if TC = NULL then
	  InputStr(NewS,Form.FieldKol[2],1,KeyL,True, AllKar, 0, TC);
       if TC=ESC then begin
	  CloseEdit;
          exit
       end;
       If (Length(OldS)<>Length(NewS)) or (Length(NewS)<>KeyL) then begin
	 complain('KODLAR AYN˜ UZUNLUKTA OLMALI');
	 AllOk:=False;
       end;
       if AllOk and  not Search(OldS,Yer, Adres) then begin
	      Complain('ESK˜ KOD BULUNAMADI');
	      AllOk:=False
       end;
       if AllOk and Search(NewS,Yer, Adres) then begin
	      Complain('YEN˜ KOD ZATEN VAR');
	      AllOk:=False;
       end;
       GetNewKod:=AllOK;
       CloseEdit;
end;


Function Index.SearchAndPrint(Var S: String;
			      Baslik, EdT : String;
		       Var Yer, Adres  : Word):Boolean;

Var
    Y1, Y2 : Word;
begin
   SearchAndPrint:=False;
   If Not Search(S, Yer, Adres) then exit;
   Y1:=Yer; Y2:=Yer;
   While (Y1<=Say) And ( Copy(GetKey(Y1),1,Length(S)) = S ) do
   begin
       Y2:=Y1;Inc(Y1)
   end;
   If Yer = Y2 then begin SearchAndPrint:=True; exit end;
   Y1 :=Yer;
   Yer:=SelectSingle(Baslik, Edt,Y1, Y2, SelectColor);
   If Yer<>0 then begin
      SearchAndPrint:=True;
      S:=GetKey(Yer);
      Adres:=GetAdr(Yer);
   end;
end;

Procedure Index.Load;
  var
   DS : BufStream;
 begin
     If Not Exists(S) then Store(S);
     DS.Init(S, SOpen, 1024);
     DS.Read(Say, Ofs(IndexChange)-Ofs(Say));
     DS.Read(AdrPtr^, SizeOf(Word)*MaxKay);
     DS.Read(PData^, RecLen*MaxKay);
     DS.Done;
     IndexChange:=False
 end;
Procedure Index.Store;
   var
     DS : BufStream;
  begin
     DS.Init(S, SCreate, 1024);
     DS.Write(Say, Ofs(IndexChange)-Ofs(Say));
     DS.Write(AdrPtr^, SizeOf(Word)*MaxKay);
     DS.Write(PData^, RecLen*MaxKay);
     DS.Done;
     IndexChange:=False
  end;
Procedure    Index.IndexDuz;
Var M, Adr, Yer : Word;
    Buf         : Array[0..2047] of Byte;
    Junk        : Boolean;
    S           : String;
begin
    Say:=0; Bekleyiniz('˜NDEKSLER DšZEL˜YOR');
    For M:=1 to FirstFree-1 do begin
        GetRec(M);
        Move(Buf, Adr, 2);
        If Adr<>$FFFF then begin
           Move(Buf,S[1], KeyL);
           S[0]:=Chr(KeyL);
           Junk:=Search(S, Yer, Adr);
           InsIndex(Yer);
           SetKeyAdr(S,Yer, M);
        end;
    end;
    CloseWindow;
end;


begin
end.


       CmdBolumSec, CmdBolumGir, CmdOgrGir
       CmdYilSec, CmdMaxSt, CmdYYNotGir

       CmdAnaEdit

       CmdYeniYil
       CmdNotDegis
       CmdYeniNot
       CmdEditYY


       CmdUniversite
       CmdQuitProg


       CmdUnvanSec, CmdUnvanGir, CmdUyeGir

       CmdDrsGir, CmdUyeGir, CmdYYDrsGir


       CmdOgrCikis
       CmdDrsCikis
       CmdYYDrsCikis
       CmdUyeCikis

       CmdOgrIndex
       CmdDrsIndex
       CmdYYDrsIndex
       CmdUyeIndex



       CmdListeHazirla
       CmdYYListeBas
       CmdBTNotGir
       CmdBTListeHazirla
       CmdBTListeBas


       CmdNotBelge
       CmdMezBelge
       CmdKarneBasim
       CmdAnaKutIsle

       CmdOgrBasim
       CmdDrsBasim
       CmdYYDrsBasim
       CmdUyeBasim
       CmdMezunSakla
       CmdYYDiskListeBas
       CmdBTDiskListeBas
