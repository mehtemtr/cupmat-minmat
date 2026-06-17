unit str;
interface
Type
  PChar = ^TChar;
  TChar = Array[0..65520] of Char;

  function  StrLen(Str: PChar): Byte;
  function  GetStr(Str: PChar): String;
  function  StrComp(Str1, Str2: PChar): Integer;
  function  UpCaseStr(Str1:Pchar): String;
  function  UCase(C : Char): CHAR;
  function  PutStr(S: String; Str : PChar): PChar;
  Procedure Strip(Str: String);
  Procedure SetBlankZero(Str: String);
  Function  ParseWord(Var Str, AgrStr: String; C : Char):Boolean;


implementation

{$L STR.OBJ}
  function StrLen(Str: PChar): Byte; External;
  function GetStr(Str: PChar): String; External;
  function StrComp(Str1, Str2: PChar): Integer; External;
  function UpCaseStr(Str1:Pchar): String; External;
  function UCase(C : Char): CHAR; External;
  Procedure Strip(Str: String); External;
  Procedure SetBlankZero(Str: String);External;
  Function ParseWord(Var Str, AgrStr: String; C : Char):Boolean;External;

  function PutStr(S: String; Str : PChar): PChar;
  Var P : PChar; L , M : Byte;
  begin
      Strip(S);
      M:=Length(S);
      If Str=Nil then
        GetMem(Str, M+1)
      else begin
         L:=StrLen(Str);
         If M > L then  FreeMem(Str, L+1);
         GetMem(Str, M+1);
      end;
      Move(S,Str^, M+1);
      PutStr:=Str;
  end;
end.


