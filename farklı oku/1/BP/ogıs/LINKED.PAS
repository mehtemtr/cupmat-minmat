type
      EVENT = record                   { describes mouse or keyboard event }
                EvntCode : integer;                           { event code }
                Time     : longint;                        { time in ticks }
              end;

      EVENTHANDLER = procedure ( var EvRec : EVENT );

  BasePtr = ^Base;
  Base = object
    destructor Done; virtual;
  end;

  PNode = ^TNode;
  TNode = object(Base)
    Next: PNode;
    function Prev: PNode;
  end;

{ Linked TList type }

  PList = ^TList;
  TList = object
    Last: PNode;
    procedure Append(N: PNode);
    procedure Clear;
    procedure Delete;
    function Empty: Boolean;
    function First: PNode;
    procedure Insert(N: PNode);
    function Next(N: PNode): PNode;
    function Prev(N: PNode): PNode;
    procedure Remove(N: PNode);
  end;
  PCmd=^Tcmd;
  TCmd=Object(TNode)
     CmdKey:Integer;
     Ev    : EventHandler;
  end;
  PEventList=^TEventList;
  TEventList=Object(TList)
     Function  Find(Key:Integer):Boolean;
     Procedure Add(Key : integer;E : EventHandler);
     Procedure HandleEvent(Key : integer);
  end;

  PCmdList=^TCmdList;
  TCmdList=Object(TList)
     Function  Find(Key:Integer):Boolean;
     Procedure Add(Key:Integer);
     Procedure HandleEvent(Key : integer);
  end;

Var PAllEvents : PEventList;

destructor Base.Done;
begin
end;


{ Node }

function TNode.Prev: PNode;
var
  P: PNode;
begin
  P := @Self;
  while P^.Next <> @Self do P := P^.Next;
  Prev := P;
end;

{ TList }

procedure TList.Append(N: PNode);
begin
  Insert(N);
  Last := N;
end;

procedure TList.Clear;
begin
  Last := nil;
end;

procedure TList.Delete;
var
  P: PNode;
begin
  while not Empty do
  begin
    P := First;
    Remove(P);
    Dispose(P, Done);
  end;
end;

function TList.Empty: Boolean;
begin
  Empty := Last = nil;
end;

function TList.First: PNode;
begin
  if Last = nil then First := nil else First := Last^.Next;
end;

procedure TList.Insert(N: PNode);
begin
  if Last = nil then Last := N else N^.Next := Last^.Next;
  Last^.Next := N;
end;


function TList.Next(N: PNode): PNode;
begin
  if N = Last then Next := nil else Next := N^.Next;
end;

function TList.Prev(N: PNode): PNode;
begin
  if N = First then Prev := nil else Prev := N^.Prev;
end;

procedure TList.Remove(N: PNode);
var
  P: PNode;
begin
  if Last <> nil then
  begin
    P := Last;
    while (P^.Next <> N) and (P^.Next <> Last) do P := P^.Next;
    if P^.Next = N then
    begin
      P^.Next := N^.Next;
      if Last = N then if P = N then Last := nil else Last := P;
    end;
  end;
end;

procedure Abstract;
begin
  RunError(211);
end;

