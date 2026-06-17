
{ Turbo Objects }
{ Copyright (c) 1989 by Borland International, Inc. }

unit Objects;
{ Turbo Pascal 5.5 object-oriented example.
  This unit defines some basic object types.
  Refer to OOPDEMOS.DOC for an overview of this unit.
}

{$S-}

interface

const

{ Stream access modes }

  SCreate    = $3C00;           { Create new file }
  SOpenRead  = $3D00;           { Read access only }
  SOpenWrite = $3D01;           { Write access only }
  SOpen      = $3D02;           { Read and write access }

{ SetPos positioning modes }

  PosAbs = 0;                   { Relative to beginning }
  PosCur = 1;                   { Relative to current position }
  PosEnd = 2;                   { Relative to end }

type

{ General conversion types }

  WordRec = record
    Lo, Hi: Byte;
  end;

  LongRec = record
    Lo, Hi: Word;
  end;

  PtrRec = record
    Ofs, Seg: Word;
  end;

{ Stream type list }

  STypeListPtr = ^STypeList;
  STypeList = array[1..256] of Word;

{ Stream I/O procedure record }

  SProc = object
    StoreProc: Pointer;
    LoadProc: Pointer;
  end;

{ Stream I/O procedure list }

  SProcListPtr = ^SProcList;
  SProcList = array[1..256] of SProc;

{ Abstract stream object type }

  Type
  PObject = ^TObject;
  TObject = object
    constructor Init;
    procedure Free;
    destructor Done; virtual;
  end;
{ Maximum TCollection size }
const
  MaxCollectionSize = 65520 div SizeOf(Pointer);

{ TCollection error codes }
  vmtHeaderSize = 8;
  coIndexError = -1;              { Index out of range }
  coOverflow   = -2;              { Overflow }
{ TCollection types }
type

  StreamPtr = ^Stream;
  Stream = object(TObject)
    TypeCount: Word;
    TypeList: STypeListPtr;
    ProcList: SProcListPtr;
    Status: Integer;
    constructor Init;
    destructor Done; virtual;
    procedure Error(Code: Integer); virtual;
    procedure Flush; virtual;
    function GetPos: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure RegisterTypes; virtual;
    procedure SetPos(Pos: Longint; Mode: Byte); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
    function Get: PObject;
    function GetSize: Longint;
    procedure Put(B: PObject);
    procedure Register(TypePtr, StorePtr, LoadPtr: Pointer);
    procedure Seek(Pos: Longint);
  end;

{ DOS file name string }

  FNameStr = string[79];

{ Unbuffered DOS stream }

  DosStreamPtr = ^DosStream;
  DosStream = object(Stream)
    Handle: Word;
    constructor Init(FileName: FNameStr; Mode: Word);
    destructor Done; virtual;
    function GetPos: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure SetPos(Pos: Longint; Mode: Byte); virtual;
    procedure Truncate; virtual;
    procedure Write(var Buf; Count: Word); virtual;
    procedure Close;
    procedure Open(var Name; Mode: Word);
  end;

{ Buffered DOS stream }

  BufStreamPtr = ^BufStream;
  BufStream = object(DosStream)
    Buffer: Pointer;
    BufSize: Word;
    BufPtr: Word;
    BufEnd: Word;
    constructor Init(FileName: FNameStr; Mode, Size: Word);
    destructor Done; virtual;
    procedure Flush; virtual;
    function GetPos: Longint; virtual;
    procedure Read(var Buf; Count: Word); virtual;
    procedure Write(var Buf; Count: Word); virtual;
  end;


procedure Abstract;

implementation

{$L STREAM}    { Stream externals }
{$L DOSSTM}    { DosStream externals }
{$L BUFSTM}    { BufStream externals }

procedure StreamError; external {STREAM};

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

{ Stream }

constructor Stream.Init;
begin
  TypeCount := 0;
  TypeList := nil;
  ProcList := nil;
  Status := 0;
  RegisterTypes;
  GetMem(TypeList, TypeCount * SizeOf(Word));
  if TypeList = nil then Fail;
  GetMem(ProcList, TypeCount * SizeOf(SProc));
  if ProcList = nil then
  begin
    FreeMem(TypeList, TypeCount * SizeOf(Word));
    Fail;
  end;
  TypeCount := 0;
  RegisterTypes;
end;

destructor Stream.Done;
begin
  FreeMem(ProcList, TypeCount * SizeOf(SProc));
  FreeMem(TypeList, TypeCount * SizeOf(Word));
end;

procedure Stream.Error(Code: Integer);
begin
  Status := Code;
end;

procedure Stream.Flush;
begin
end;

function Stream.GetPos: Longint;
begin
  Abstract;
end;

procedure Stream.Read(var Buf; Count: Word);
begin
  Abstract;
end;

procedure Stream.RegisterTypes;
begin
end;

procedure Stream.SetPos(Pos: Longint; Mode: Byte);
begin
  Abstract;
end;

procedure Stream.Truncate;
begin
  Abstract;
end;

procedure Stream.Write(var Buf; Count: Word);
begin
  Abstract;
end;

function Stream.Get: PObject;
external {STREAM};

function Stream.GetSize: Longint;
var
  P: Longint;
begin
  P := GetPos;
  SetPos(0, PosEnd);
  GetSize := GetPos;
  SetPos(P, PosAbs);
end;

procedure Stream.Put(B: PObject);
external {STREAM};

procedure Stream.Register(TypePtr, StorePtr, LoadPtr: Pointer);
begin
  Inc(TypeCount);
  if TypeList <> nil then
  begin
    TypeList^[TypeCount] := PtrRec(TypePtr).Ofs;
    with ProcList^[TypeCount] do
    begin
      StoreProc := StorePtr;
      LoadProc := LoadPtr;
    end;
  end;
end;

procedure Stream.Seek(Pos: Longint);
begin
  SetPos(Pos, PosAbs);
end;

{ DosStream }

constructor DosStream.Init(FileName: FNameStr; Mode: Word);
var
  L: Integer;
begin
  if not Stream.Init then Fail;
  L := Length(FileName);
  Move(FileName[1], FileName[0], L);
  FileName[L] := #0;
  Open(FileName, Mode);
end;

destructor DosStream.Done;
begin
  Close;
  Stream.Done;
end;

function DosStream.GetPos: Longint;
external {DOSSTM};

procedure DosStream.Read(var Buf; Count: Word);
external {DOSSTM};

procedure DosStream.SetPos(Pos: Longint; Mode: Byte);
external {DOSSTM};

procedure DosStream.Truncate;
external {DOSSTM};

procedure DosStream.Write(var Buf; Count: Word);
external {DOSSTM};

procedure DosStream.Close;
external {DOSSTM};

procedure DosStream.Open(var Name; Mode: Word);
external {DOSSTM};

{ BufStream }

constructor BufStream.Init(FileName: FNameStr; Mode, Size: Word);
begin
  GetMem(Buffer, Size);
  if Buffer = nil then Fail;
  if not DosStream.Init(FileName, Mode) then
  begin
    FreeMem(Buffer, Size);
    Fail;
  end;
  BufSize := Size;
  BufPtr := 0;
  BufEnd := 0;
end;

destructor BufStream.Done;
begin
  DosStream.Done;
  FreeMem(Buffer, BufSize);
end;

procedure BufStream.Flush;
external {BUFSTM};

function BufStream.GetPos: Longint;
external {BUFSTM};

procedure BufStream.Read(var Buf; Count: Word);
external {BUFSTM};

procedure BufStream.Write(var Buf; Count: Word);
external {BUFSTM};



procedure Abstract;
begin
  RunError(211);
end;

end.


