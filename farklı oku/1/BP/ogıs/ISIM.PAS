uses nsr, Exist,crt, blungr;
CONST

   MaxDonDrs = 16;
   MaxDonem  = 20;
   BufMax    = 20;

type
     PObject = ^TObject;
    TObject = object
      constructor Init;
      procedure Free;
      destructor Done; virtual;
    end;
     HeadRec = Record
	FirstFree   : Word;
	Deltd       : Word;
	RecLen      : Word;
	MaxKay      : Word;
	IsOpen      : Word;
     end;
   OgrRec  = Record
	  Is       : Array[0..7] of Char;
	  Ad       : String[25];
	  Cins     : Array[1..2048] of char;
   end;
   DrsRec  = Record
	  Is       : Array[0..5] of Char;
	  Ad       : String[25];
	  Cins     : Array[1..2048] of char;
   end;
Var InFile : File;
    Head    : HeadRec;
    Ogr    : OgrRec;
    Drs    : DrsRec;
Procedure OpenFiles(A : String);
Var Result : Word;
begin
  Assign(InFile,A);
  Reset(InFile,1);
  BlockRead(InFile, Head, SizeOf(Head), Result);
end;
Type
    PChar = ^TChar;
    TChar = Array[0..MaxInt] of Char;
    NameList = object
       NameBuf : PChar;
       MaxBuf  : Word;
       FstAv   : Word;
       Delta   : Word;
       Root    : Word;
       Constructor Init(MB, DL : Word);
       Destructor Done;
       Function LLINK(P : Word) : Word;
       Function RLINK(P : Word) : Word;
       Function Key(P : Word) : String;
       Function GetName(P : Word) : String;
       Function PutName(S : String):Word;
       Function Search(S : String):Word;
       Function Avail : Word;
       Procedure Load;
       Procedure Store;
    end;
Procedure NameDone(Var PS : PChar);
Var L : Byte;
    begin
       If PS = nil then exit;
       Move(PS^, L, 1);
       FreeMem(PS, L+1);
    end;

Function PutName(A : String; PS : PChar):Pchar;
Var L : Byte;
begin
    NameDone(PS);
    PS:=Nil;
    Strip(A);
    L:=Length(A);
    If L=0 then exit;
    Inc(L);
    GetMem(PS, L);
    If PS<>Nil then Move(A, PS^, L);
    PutName:=PS;
end;
Function GetName(PS : PChar):String;
Var L : Byte;
    S : String;
    begin
       GetName:=''; If PS = nil then exit;
       Move(PS^, L, 1); Move(PS^, S, L+1);
       GetName:=S;
    end;








constructor TObject.Init;
type
  Image = record
    Link: Word;
    Data: record end;
  end;
begin
 FillChar(Image(Self).Data, SizeOf(Self) - SizeOf(TObject), 0);
end;

procedure TObject.Free;
begin
  Dispose(PObject(@Self), Done);
end;

destructor TObject.Done;
begin
end;

 Constructor NameList.Init(MB, DL : Word);
 begin
     MaxBuf:=MB;
     Delta:=DL;
     FstAv:=6;
     Root:=1;
     GetMem(NameBuf, MaxBuf);
     FillChar(NameBuf^, MaxBuf, #0);
     Load;
 end;
 Destructor NameList.Done;
 begin
    Store;
    FreeMem(NameBuf, MaxBuf);
 end;
 Function NameList.LLINK(P : Word) : Word;
 Var L : Byte; X : Word;
 begin
     Move(NameBuf^[P], L, 1);
     Move(NameBuf^[P+L+1], X, 2);
     LLINK:=X
 end;
 Function NameList.RLINK(P : Word) : Word;
  Var L : Byte; X : Word;
 begin
     Move(NameBuf^[P], L, 1);
     Move(NameBuf^[P+L+3], X, 2);
     RLINK:=X
 end;
  Function NameList.Key(P : Word) : String;
   Var L : Byte; S : String;
  begin
     Move(NameBuf^[P], L, 1);
     Move(NameBuf^[P], S, L+1);
     Key:=S;
 end;

 Function NameList.GetName(P : Word) : String;
 Var I, L : Byte; X : Word; T, S : String;
 begin
     GetName:='';
     If X=0 then exit;
     Move(NameBuf^[P], L, 1);
     Move(NameBuf^[P], S, L+1);
     I:=1; T :='';
     While I<=L do begin
        Move(S[I], X, 2);
        T:=T+' '+Key(X);
        Inc(I,2);
     end;
     Strip(T);
     GetName:=T;
 end;
 Function NameList.PutName(S : String):Word;
 Var L, H : Byte; X, Y : Word; T,  K : String; M : Integer;
 begin
     K:=''; H:=0;
     While ParseWord(S, T, ' ') do begin
          M:=Search(T);
          Move(M, K[H+1], 2);
          Inc(H,2);
     end;
     K[0]:=CHR(H);
     If H=0 then
        PutName:=0
     else
        PutName:=Search(K);
 end;
 Function NameList.Search(S : String):Word;
 Var T : String; P, Q : Word; L : Integer;
     R, A : Byte;
 begin
    P:=Root; L:=0;
    Repeat
       T:=Key(P);
       Q:=P;
       if T=S then begin
          Search :=P;
          Exit;
       end;
       if S<T then begin
          L:=-1; P:=LLINK(P);
       end else begin
         L:=1; P:=RLINK(P)
       end;
       If P=0 then begin
           P:=FstAv;
           R:=Length(S);
           Move(S, NameBuf^[P], R+1);
           FstAv:=FstAv+R+5;
           Move(NameBuf^[Q],A, 1);
           if L=-1 then
              Move(P, NameBuf^[Q+A+1], 2)
           else
              Move(P, NameBuf^[Q+A+3], 2);
          Search:=P;
          Exit
      end;
  until False;
 end;


 Function NameList.Avail : Word;
begin
   Avail:=0;
end;
 Procedure NameList.Load;
 Var F : File;
     Result : Word;
 begin
     If not Exists('ISIM.DAT') then
         Store;
     Assign(F,'ISIM.DAT');
     Reset(F,1);
     BlockRead(F,MaxBuf,2,Result);
     BlockRead(F,FstAv,2,Result);
     BlockRead(F,Delta,2,Result);
     BlockRead(F, NameBuf^,MaxBuf,Result);
     Close(F);
 end;

 Procedure NameList.Store;
  Var F : File;
     Result : Word;
 begin
     Assign(F,'ISIM.DAT');
     ReWrite(F,1);
     BlockWrite(F,MaxBuf,2,Result);
     BlockWrite(F,FstAv,2,Result);
     BlockWrite(F,Delta,2,Result);
     BlockWrite(F, NameBuf^,MaxBuf,Result);
     Close(F);
 end;
 Var Isim : NameList;
     Result,Y,X, Z : Word;
     S : STring;
     P : Array[1..4000] of PChar;

begin
{   Isim.Init(16000, 100);}
   FillChar(P, SizeOf(P),#0);
   OpenFiles('DRS.DAT'); X:=0; Z:=MemAvail;
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Drs, Head.Reclen, Result);
           S:=Drs.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           S:=GetName(P[X]);
           Z:=MemAvail;;
  end;

  Close(InFile);

  OpenFiles('BYOGR.DAT');
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Ogr, Head.Reclen, Result);
           S:=Ogr.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           Z:=MemAvail;
  end;
  Close(InFile);
  OpenFiles('FZOGR.DAT');
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Ogr, Head.Reclen, Result);
           S:=Ogr.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           Z:=MemAvail;
  end;
  Close(InFile);
  OpenFiles('MTOGR.DAT');
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Ogr, Head.Reclen, Result);
           S:=Ogr.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           Z:=MemAvail;
  end;
  Close(InFile);
  OpenFiles('TEOGR.DAT');
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Ogr, Head.Reclen, Result);
           S:=Ogr.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           Z:=MemAvail;
  end;
  Close(InFile);
  OpenFiles('KMOGR.DAT');
   For Y:=1 to Head.FirstFree-1 do begin
	   BlockRead(InFile, Ogr, Head.Reclen, Result);
           S:=Ogr.Ad;
           ;
           Inc(X);
           P[X]:=PutName(S,Nil);
           Z:=MemAvail;
  end;
  Close(InFile);
  For Y:=1 to X do NameDone(P[Y]);
 end.


