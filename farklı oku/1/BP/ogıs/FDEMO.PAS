
{ Turbo Form }
{ Copyright (c) 1989 by Borland International, Inc. }

program FDemo;
{ Turbo Pascal 5.5 object-oriented example.
  Demonstrates use of the FORMS and SLIDERS units.
  Refer to OOPDEMOS.DOC for an overview of this program.
}

uses Crt, Forms;

type

  Prgram = record
    ProgKod: string[2];
    Fakulte: string[30];
    YOkul  : string[30];
    Bolum  : string[30];
    ProgNm : string[30];
  end;

const

  PR: Prgram = (
    ProgKod : 'MT';
    Fakulte : 'FEN EDEB˜YAT';
    YOkul   : '';
    Bolum   : 'MATEMAT˜K BOLšMš';
    ProgNm: '');

var
  F: Form;
  P: Prgram;

begin
  Color(BackColor);
  ClrScr;
  Color(ForeColor);
  GotoXY(1, 1); ClrEol;
  Write(' Turbo Pascal 5.5 Object Oriented Forms Editor');
  GotoXY(1, 25); ClrEol;
  Write(' F2-Save  Esc-Quit');
  F.Init(10, 5, 54, 11);
  F.Add(New(FStrPtr, Init(3, 2, 'program kodu ', 2)));
  F.Add(New(FStrPtr, Init(3, 3, 'fakulte      ', 30)));
  F.Add(New(FStrPtr, Init(3, 4, 'Y Okul       ', 30)));
  F.Add(New(FStrPtr, Init(3, 5, 'Bolum        ', 30)));
  F.Add(New(FStrPtr, Init(3, 6, 'Prog isim    ', 30)));
  P := PR;
  F.Put(P);
  F.Show(True);
  if F.Edit = CSave then
     F.Get(P);
  F.Done;
  NormVideo;
  ClrScr;
  WriteLn('Resulting Person record:');
  WriteLn;
  with P do
  begin
    WriteLn('Firstname: ', ProgKod);
    WriteLn(' Lastname: ', Fakulte);
    WriteLn('  Address: ', YOkul);
    WriteLn('     City: ', Bolum);
    WriteLn('    State: ', ProgNm);
  end;
end.
