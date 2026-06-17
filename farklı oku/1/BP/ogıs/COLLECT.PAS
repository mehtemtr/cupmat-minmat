
uses objects;
{ Maximum TCollection size }
const
  MaxCollectionSize = 65520 div SizeOf(Pointer);

{ TCollection error codes }
  vmtHeaderSize = 8;
  coIndexError = -1;              { Index out of range }
  coOverflow   = -2;              { Overflow }
{ TCollection types }
type
  PItemList = ^TItemList;
  TItemList = Array[0..MaxCollectionSize - 1] of Pointer;

{ TCollection object }

  PCollection = ^TCollection;
  TCollection = object(TObject)
    Items: PItemList;
    Count: Integer;
    Limit: Integer;
    Delta: Integer;
    constructor Init(ALimit, ADelta: Integer);
    constructor Load(var S: Stream);
    destructor  Done; virtual;
    function    At(Index: Integer): Pointer;
    procedure   AtDelete(Index: Integer);
    procedure   AtFree(Index: Integer);
    procedure   AtInsert(Index: Integer; Item: Pointer);
    procedure   AtPut(Index: Integer; Item: Pointer);
    procedure   Delete(Item: Pointer);
    procedure   DeleteAll;
    procedure   Error(Code, Info: Integer); virtual;
    function    FirstThat(Test: Pointer): Pointer;
    procedure   ForEach(Action: Pointer);
    procedure   Free(Item: Pointer);
    procedure   FreeAll;
    procedure   FreeItem(Item: Pointer); virtual;
    function    GetItem(var S: Stream): Pointer; virtual;
    function    IndexOf(Item: Pointer): Integer; virtual;
    procedure   Insert(Item: Pointer); virtual;
    function    LastThat(Test: Pointer): Pointer;
    procedure   Pack;
    procedure   PutItem(var S: Stream; Item: Pointer); virtual;
    procedure   SetLimit(ALimit: Integer); virtual;
    procedure   Store(var S: Stream);
  end;

{ TSortedCollection object }

  PSortedCollection = ^TSortedCollection;
  TSortedCollection = object(TCollection)
    Duplicates: Boolean;
    constructor Init(ALimit, ADelta: Integer);
    constructor Load(var S: Stream);
    function    Compare(Key1, Key2: Pointer): Integer; virtual;
    function    IndexOf(Item: Pointer): Integer; virtual;
    procedure   Insert(Item: Pointer); virtual;
    function    KeyOf(Item: Pointer): Pointer; virtual;
    function    Search(Key: Pointer; var Index: Integer): Boolean; virtual;
    procedure   Store(var S: Stream);
  end;
{ TCollection }

const
  TCollection_Error    = vmtHeaderSize + $04;
  TCollection_SetLimit = vmtHeaderSize + $1C;

constructor TCollection.Init(ALimit, ADelta: Integer);
begin
  TObject.Init;
  Items := nil;
  Count := 0;
  Limit := 0;
  Delta := ADelta;
  SetLimit(ALimit);
end;

constructor TCollection.Load(var S: Stream);
var
  C, I: Integer;
begin
  S.Read(Count, SizeOf(Integer) * 3);
  Items := nil;
  C := Count;
  I := Limit;
  Count := 0;
  Limit := 0;
  SetLimit(I);
  Count := C;
  for I := 0 to C - 1 do AtPut(I, GetItem(S));
end;

destructor TCollection.Done;
begin
  FreeAll;
  SetLimit(0);
end;
procedure TCollection.AtFree(Index: Integer);
var
  Item: Pointer;
begin
  Item := At(Index);
  AtDelete(Index);
  FreeItem(Item);
end;
procedure TCollection.Delete(Item: Pointer);
begin
  AtDelete(IndexOf(Item));
end;

procedure TCollection.DeleteAll;
begin
  Count := 0;
end;

procedure TCollection.Error(Code, Info: Integer);
begin
  RunError(212 - Code);
end;
procedure TCollection.Free(Item: Pointer);
begin
  Delete(Item);
  FreeItem(Item);
end;

procedure TCollection.FreeAll;
var
  I: Integer;
begin
  for I := 0 to Count - 1 do FreeItem(At(I));
  Count := 0;
end;

procedure TCollection.FreeItem(Item: Pointer);
begin
  if Item <> nil then Dispose(PObject(Item), Done);
end;

function TCollection.GetItem(var S: Stream): Pointer;
begin
  GetItem := S.Get;
end;
procedure TCollection.Insert(Item: Pointer);
begin
  AtInsert(Count, Item);
end;
procedure TCollection.PutItem(var S: Stream; Item: Pointer);
begin
  S.Put(Item);
end;

procedure TCollection.SetLimit(ALimit: Integer);
var
  AItems: PItemList;
begin
  if ALimit < Count then ALimit := Count;
  if ALimit > MaxCollectionSize then ALimit := MaxCollectionSize;
  if ALimit <> Limit then
  begin
    if ALimit = 0 then AItems := nil else
    begin
      GetMem(AItems, ALimit * SizeOf(Pointer));
      if (Count <> 0) and (Items <> nil) then
	Move(Items^, AItems^, Count * SizeOf(Pointer));
    end;
    if Limit <> 0 then FreeMem(Items, Limit * SizeOf(Pointer));
    Items := AItems;
    Limit := ALimit;
  end;
end;

procedure TCollection.Store(var S: Stream);
{$F+}
procedure DoPutItem(P: Pointer);
begin
  PutItem(S, P);
end;
{$F-}

begin
  S.Write(Count, SizeOf(Integer) * 3);
  ForEach(@DoPutItem);
end;
{$L Collect}
function TCollection.At(Index: Integer): Pointer; external;
procedure TCollection.AtDelete(Index: Integer); external;
procedure TCollection.AtInsert(Index: Integer; Item: Pointer); external;
procedure TCollection.AtPut(Index: Integer; Item: Pointer); external;
function TCollection.FirstThat(Test: Pointer): Pointer; external;
procedure TCollection.ForEach(Action: Pointer); external;
function TCollection.IndexOf(Item: Pointer): Integer; external;
function TCollection.LastThat(Test: Pointer): Pointer; external;
procedure TCollection.Pack; external;


{ TSortedCollection }

constructor TSortedCollection.Init(ALimit, ADelta: Integer);
begin
  TCollection.Init(ALimit, ADelta);
  Duplicates := False;
end;

constructor TSortedCollection.Load(var S: Stream);
begin
  TCollection.Load(S);
  S.Read(Duplicates, SizeOf(Boolean));
end;

function TSortedCollection.Compare(Key1, Key2: Pointer): Integer;
begin
  Abstract;
end;

function TSortedCollection.IndexOf(Item: Pointer): Integer;
var
  I: Integer;
begin
  IndexOf := -1;
  if Search(KeyOf(Item), I) then
  begin
    if Duplicates then
      while (I < Count) and (Item <> Items^[I]) do Inc(I);
    if I < Count then IndexOf := I;
  end;
end;

procedure TSortedCollection.Insert(Item: Pointer);
var
  I: Integer;
begin
  if not Search(KeyOf(Item), I) or Duplicates then AtInsert(I, Item);
end;

function TSortedCollection.KeyOf(Item: Pointer): Pointer;
begin
  KeyOf := Item;
end;

function TSortedCollection.Search(Key: Pointer; var Index: Integer): Boolean;
var
  L, H, I, C: Integer;
begin
  Search := False;
  L := 0;
  H := Count - 1;
  while L <= H do
  begin
    I := (L + H) shr 1;
    C := Compare(KeyOf(Items^[I]), Key);
    if C < 0 then L := I + 1 else
    begin
      H := I - 1;
      if C = 0 then
      begin
	Search := True;
	if not Duplicates then L := I;
      end;
    end;
  end;
  Index := L;
end;

procedure TSortedCollection.Store(var S: Stream);
begin
  TCollection.Store(S);
  S.Write(Duplicates, SizeOf(Boolean));
end;

Var T : Pcollection;
    S:STring;
begin
    T^.Init(3,10);
    S:='ABCDE';
    T^.Insert(@S);
    S:='1234';
    T^.Insert(@S);
    T^.done;
end.
