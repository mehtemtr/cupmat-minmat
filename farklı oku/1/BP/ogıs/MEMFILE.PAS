uses Objects;

const MaxDta = 32;
Type

  PByteArray = ^TByteArray;
  TByteArray = array[0..32767] of Byte;

  PWordArray = ^TWordArray;
  TWordArray = array[0..16383] of Word;

{ TObject base object }

  PObject = ^TObject;
  TObject = object
    constructor Init;
    procedure Free;
    destructor Done; virtual;
  end;

   PNode = ^TNode;
   TNode = Object(TObject)
     Dta   : Array[0..MaxDta-1] of Char;
     Next  : PNode;
     Constructor Init;
     Constructor Load(Var S : Stream);
     Procedure   Store(Var S : Stream);
   end;
   PNodeList = ^TNodeList;
   TNodeList = Object(TObject)
     First    : PNode;
     Cur      : PNode;
     Position : Word;
     Constructor Init;
     Constructor Load(Var S : Stream);
     Destructor  Done;Virtual;
     Function    Last : PNode;
     procedure   Insert(N: PNode);
     procedure   Clear;
     Procedure   Write(Var Buf; Count : Word);
     Procedure   Read(Var Buf; Count:Word);
     Procedure   Store(Var S : Stream);
     procedure   Reset;
   end;
   NStream = object(BufStream)
    procedure RegisterTypes; virtual;
  end;
procedure NStream.RegisterTypes;
begin
  BufStream.RegisterTypes;
  Register(TypeOf(TNode) , @TNode.Store , @TNode.Load);
  Register(TypeOf(TNodeList) , @TNodeList.Store , @TNodeList.Load);
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

Constructor TNode.Init;
begin
   TObject.Init;
   FillChar(Dta, SizeOf(Dta),#0);
   Next:=Nil
end;
Constructor TNode.Load;
begin
   S.Read(Dta, MaxDta);
end;
Procedure TNode.Store;
begin
   S.Write(Dta, MaxDta);
end;

Constructor TNodeList.Init;
begin
   TObject.Init;
   First:=nil;
   Position:=0;
   Cur:=Nil;
end;

Constructor TNodeList.Load;
var
  P: PNode;
begin
   Position:=0;
   First:=PNode(S.Get);
   Cur:=First;
   P := First;
   while P<>Nil do P:=PNode(S.Get);
end;
Procedure TNodeList.Store;
var
  P: PNode;
begin
   Position:=0;
   P:=First;
   while P<>Nil do begin P^.Store(S); P:=P^.Next end;
end;

procedure TNodeList.Reset;
begin
   Cur:=First;
   Position:=0;
end;
procedure TNodeList.Insert(N: PNode);
Var P: PNode;
begin
  if First = nil then
     First := N
  else begin
     P:=Last;
     P^.Next:=N
  end;
end;
function TNodeList.Last: PNode;
var
  Q, P: PNode;
begin
  P := First; Q:=First;
  while P<>Nil do begin
     Q:=P;
     P:=P^.Next
  end;
  Last:=Q;
end;
Procedure TNodeList.Write(Var Buf; Count:Word);
Procedure GetNewNode;
begin
    Insert(New(PNode, Init));
    Cur:=Last
end;
var
  K, J : Integer;
begin
  K:=0;
  While Count > 0 do begin
     If Position = MaxDta then Position := 0;
     if Position = 0 then
        If Cur = nil then
           GetNewNode
        else begin
           Cur:=Cur^.Next;
           If Cur=nil then GetNewNode;
        end;
     J:=MaxDta-Position;
     If Count <= J then J:=Count;
     Move(TByteArray(Buf)[K], Cur^.Dta[Position], J);
     Position:=Position+J;
     Count:=Count-J;
     K:=K+J;
  end;
end;
Procedure TNodeList.Read(Var Buf; Count:Word);

Function CurEmpty : Boolean;
begin
   CurEmpTy:=True;
   If Cur = Nil then
         FillChar(TByteArray(Buf), Count, #0)
   else
     CurEmpty:=False
end;

var
  K, J : Word;
begin
  If CurEmpty then exit;
  K:=0;
  While Count > 0 do begin
     If Position = MaxDta then begin
        Cur:=Cur^.Next;
        Position:=0
     end;
     If CurEmpty then exit;
     J:= MaxDta - Position;
     If Count<=J then J:=Count;
     Move(Cur^.Dta[Position], TByteArray(Buf)[K], J);
     Position:=Position + J;
     K:=K+J;
     Count:=Count-J;
  end;
end;


procedure TNodeList.Clear;
begin
  First := nil;
end;

Destructor TNodeList.Done;
var
  P, Q: PNode;
begin
  P:=First;
  While P<>nil do begin
    Q:=P^.Next;
    Dispose(P, Done);
    P:=Q;
  end;
end;

Var R : PNodeList;
    S : String;
    F : Text;
    AA, M, L ,T, I, J: Word;
    N:Byte;
    Buf1, Buf2 : Array[0..3000] of Byte;
    begin
      For I:=0 to 255 do Buf1[I]:=I;
      FillChar(Buf2, SizeOf(Buf2), #0);
      R:=New(PNodeList, Init);
      R^.Reset;
      R^.Write(Buf1, 5);
      R^.Write(Buf1[5], 3);
      R^.Write(Buf1[8], 2);
      R^.Write(Buf1[10], 2);
      R^.Write(Buf1[8], 15);

      R^.Reset;
      R^.Read(Buf2,15);
      Dispose(R,Done);
    end.
      InitProg;
      R:=New(PNodeList, Init);
      R^.Reset;
      With Ogr do begin
       For M:=1 to Say do begin
          AA:=GetAdr(M);
        if AA<>$FFFF then begin
          DFile.GetRec(AA,Is);
          For I:=1 to 3 do begin
               N:=Kac[I];
               R^.Write(N, 1);
               R^.Write(YYKay[I], 2*N);
               R^.Write(Ders[I], 3*N);
          end;
          R^.Write(YYCount, 2);
          For I:=1 to YYCount do begin
              R^.Write(Donem[I], 4);
              R^.Write(AnaKay[I], 3*Donem[I].CNT);
          end;
          ShowCopwr;
        end;
       end;
       Dispose(R, Done);
       end;
       readln;
       ShowCopwr;
       readln;
       quitprog
       end.
       R^.Reset; L:=0;
       For M:=1 to Say do begin
          DFile.GetRec(GetADr(M),Is);
          For I:=1 to 3 do begin
               N:=Kac[I];
               Move(N, Buf1[L], 1); Inc(L);
               Move(YYKay[I], Buf1[L], 2*N);Inc(L, 2*N);
               Move(Ders[I], Buf1[L],3*N)  ;Inc(L, 3*N);
          end;
          Move(YYCount, Buf1[L],2); Inc(L,2);
          For I:=1 to YYCount do begin
              Move(Donem[I], Buf1[L], 4);Inc(L,4);
              Move(AnaKay[I], Buf1[L],3*Donem[I].CNT);Inc(L, 3*Donem[I].CNT);
          end;
          T:=0;
          For I:=1 to 3 do begin
               R^.Read(Buf2[T],1);
               N:=Byte(Buf2[T]);
               Inc(T);
               R^.Read(Buf2[T], 2*N);Inc(T, 2*N);
               R^.Read(Buf2[T] , 3*N);Inc(T, 3*N);
          end;
          R^.Read(Buf2[T], 2);
          Move(Buf2[T],YYCount,2);
          Inc(T,2);
          For I:=1 to YYCount do begin
              R^.Read(Buf2[T], 4);
              Move(Buf2[T],Donem[I],4);
              Inc(T,4);
              R^.Read(Buf2[T], 3*Donem[I].CNT);Inc(T, 3*Donem[I].CNT);
          end;
       end;
       For I:=1 to L do begin
           If not (Buf1[I]<>Buf2[I]) then
              Writeln('hata');
       end;

      end;
      Dispose(R, Done);
     end.

Procedure OgrLoad;
Var S : NStream;


