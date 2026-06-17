{***************************************************************************
*  SAADemo : Demo program using the SAA unit. This program generates       *
*            a dialog box, radio buttons and other dialog objects.         *
**------------------------------------------------------------------------**
*  Author           : MICHAEL TISCHER                                      *
*  developed on     : 08/21/1989                                           *
*  last update      : 03/13/1990                                           *
***************************************************************************}

program SAADemo;

{***************************************************************************
* Imported units                                                           *
***************************************************************************}

uses Win,                   { Turbo Pascal Internals window unit ( Ch. 6 ) }
     KBM2,           { Turbo Pascal Internals keyboard/mouse unit ( Ch. 7 ) }

{-- Global variables ------------------------------------------------------}

var MainSched,                         { scheduler for the main dialog box }
    HelpSched : SAASched;                  { scheduler for the help window }

{-- Objects for the main dialog box ---------------------------------------}

    MEndButs  : array[1..3] of SAAEButtons;            { three end buttons }
    MEndBut   : SAAEndB;                           { the end button object }
    MANField1,                           { three alphanumeric input fields }
    MANField2,
    MANField3 : SAAIn;
    MRaButs   : array [1..6] of SAARButtons;             { 6 radio buttons }
    MRaBut    : SAARadioB;
    MPB1,                                               { 2 toggle buttons }
    MPB2      : SAAPushB;

{-- Objects for the help window -------------------------------------------}

    HEndButs : array[1..3] of SAAEButtons;         { the three end buttons }
    HEndBut  : SAAEndB;                            { the end button object }

{***************************************************************************
*  Help : controls the help text window.                                   *
**------------------------------------------------------------------------**
*  Input   : none                                                          *
*  Globals : HelpSched/R                                                   *
***************************************************************************}

procedure Help;

var EndIt  : boolean;                                   { return to caller }
    HPage : integer;                                 { displayed help page }
    SBuf  : string[5];                          { string conversion buffer }

begin
  {-- scheduler opens help screen and controls window ---------------------}

  HelpSched.Open;
  WinFrame( VL(24), VO(0), VR(0), VU(0), SIN_FR, CO_FRAME );
  WinPrint( VL(24), VO(0), CO_FRAME, #194 );
  WinPrint( VL(24), VU(0), CO_FRAME, #193 );
  WinPrint( VL( 2), VO(7), CO_HOT, 'This is a help screen.' );
  WinPrint( VL(13), VO(1), CO_FRAME, 'Page' );

  {-- Read loop. Displays options to the user, and available buttons ------}

  HPage := 1;                             { start with the first help page }
  EndIt  := false;                               { can't go past the first }

  repeat
    str( HPage:5, SBuf );
    WinPrint( VL(18), VO(1), CO_NORM, SBuf );
    case HelpSched.Run(1) of                       { convey pressed button }
      0 : if ( HPage < 1000 ) then                             { next page }
            inc( HPage );
      1 : if ( HPage > 1 ) then                           { previous pages }
            dec( HPage );
      2 : EndIt := true;                        { select < CANCEL > button }
    end;
  until EndIt;                              { until < CANCEL > is selected }

  HelpSched.Close;                                     { close help window }
end;

{***************************************************************************
*                        M A I N   P R O G R A M                           *
***************************************************************************}

begin
  {-- create screen -------------------------------------------------------}

  if ( color ) then                                { color card installed? }
    TextBackground( BLUE )                          { yes, blue background }
  else
    TextBackGround( BLACK );                        { no, black background }
  clrscr;                           { clear screen in new background color }

  {-- scheduler initializes help window and its objects -------------------}

  HEndButs[1].Init( 26,  6, ESC,       2, '#Cancel ' );  { place three end }
  HEndButs[2].Init( 26,  7, ord('+'), 0, '+ Page');      { buttons in the  }
  HEndButs[3].Init( 26,  8, ord('-'), 1, '- Page' );     { help window     }
  HEndBut.Init( 2, 3, @HEndButs );         { initialize end button objects }

  HelpSched.Init( 37, 1, 75, 11 );              { initialize the scheduler }
  HelpSched.Add( @HEndBut );                      { display the end button }

  {-- Initialize the different objects used in the main dialog box --------}

  MEndButs[1].Init( 28, 12, CR,  RS_OK,      '#OK' );        { the three   }
  MEndButs[2].Init( 39, 12, F1,  RS_HELP,    '#Help' );      { end buttons }
  MEndButs[3].Init( 52, 12, ESC, RS_A_BREAK, '#Cancel' );
  MEndBut.Init( 1, 3, @MEndButs );                 { the end button object }

  MANField1.Init( 4, 3, 70, 22, 'AN-Field#1 ', 'Jim Middleton' );{ the      }
  MANField2.Init( 4, 4, 25, 22, 'AN-Field#2 ', '201 Bedlam E.' );{ three AN }
  MANField3.Init( 4, 5, 22, 22, 'AN-Field#3 ', 'Serial City MI' ); { fields }

  MRaButs[1].Init( 43, 3, 'Microsoft #Word' );                { initialize }
  MRaButs[2].Init( 43, 4, 'Word#Perfect' );                   { the six    }
  MRaButs[3].Init( 43, 5, '#GemWrite' );                      { radio      }
  MRaButs[4].Init( 43, 6, '#Nota Bene' );                     { buttons    }
  MRaButs[5].Init( 43, 7, 'P#C-Write' );                      { used here  }
  MRaButs[6].Init( 43, 8, '#Edlin' );
  MRaBut.Init( 6, @MRaButs, 2 );                 { the radio button object }

  MPB1.Init(  5, 8, 'Saving file', true );                { initialize two }
  MPB2.Init( 26, 8, 'Alarm!', false );                    { toggle buttons }

  {-- Scheduler initializes and executes main dialog box ------------------}

  with MainSched do                                   { use main scheduler }
    begin
      Init( 5, 6, 70, 19 );                         { initialize scheduler }
      Add( @MANField1 );                            { display the different }
      Add( @MANField2 );                            { dialog objects        }
      Add( @MANField3 );
      Add( @MPB1 );
      Add( @MPB2 );
      Add( @MRaBut );
      Add( @MEndBut );
      Open;                                           { open dialog window }


      WinPrint( VL( 25 ), VO( 0 ), CO_HOT, ' DEMO DIALOG BOX ' );

      WinFrame( VL( 2 ), VO( 2 ), VL( 39), VO( 6 ), SIN_FR, CO_FRAME );
      WinPrint( VL( 7 ), VO( 2 ), CO_FRAME,
        ' ALPHANUMERIC INPUT FIELDS ' );

      WinFrame( VL( 2 ), VO( 7 ), VL( 39), VO( 9 ), SIN_FR, CO_FRAME );
      WinPrint( VL( 13 ), VO( 7 ), CO_FRAME, ' TOGGLE BUTTON ' );

      WinFrame( VR(-24), VO( 2 ), VR( -3), VO( 9 ), SIN_FR, CO_FRAME );
      WinPrint( VR(-20), VO( 2 ), CO_FRAME, ' RADIO BUTTON ' );

      WinPrint( VL( 0 ), VU( -2 ), CO_FRAME,
                #195 + WinStRep( #196, VR( -1 ) - VL( 0 ) ) + #180 );
      WinPrint( VL(3), VU(-1), CO_FRAME, 'END BUTTON ÄÄÄ'#16 );

      {-- Scheduler input loop --------------------------------------------}

      while run( 1 ) = RS_HELP do                      { HELP been called? }
        Help;                          { yes, open and display help window }

      Close;                  { if user selects OK or CANCEL, close dialog }
      Done;                   { box and end scheduler                      }
   end;

  HelpSched.Done;                                        { end help window }

  {-- clear screen and end program ----------------------------------------}

  TextColor( LIGHTGRAY );                               { foreground color }
  TextBackGround( BLACK );                              { background color }
  ClrScr;
  WinSetCursor( 0, 0 );
end.
