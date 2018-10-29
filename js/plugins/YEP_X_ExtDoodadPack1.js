1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
401
402
403
404
405
406
407
408
409
410
411
412
413
414
415
416
417
418
419
420
421
422
423
424
425
426
427
428
429
430
431
432
433
434
435
436
437
438
439
440
441
442
443
444
445
446
447
448
449
450
451
452
453
454
455
456
457
458
459
460
461
462
463
464
465
466
467
468
469
470
471
472
473
474
475
476
477
478
479
480
481
482
483
484
485
486
487
488
489
490
491
492
493
494
495
496
497
498
499
500
501
502
503
504
505
506
507
508
509
510
511
512
513
514
515
516
517
518
519
520
521
522
523
524
525
526
527
528
529
530
531
532
533
534
535
536
537
538
539
540
541
542
543
544
545
546
547
548
549
550
551
552
553
554
555
556
557
558
559
560
561
562
563
564
565
566
567
568
569
570
571
572
573
574
575
576
577
578
579
580
581
582
583
584
585
586
587
588
589
590
591
592
593
594
595
596
597
598
599
600
601
602
603
604
605
606
607
608
609
610
611
612
613
614
615
616
617
618
619
620
621
622
623
624
625
626
627
628
629
630
631
632
633
634
635
636
637
638
639
640
641
642
643
644
645
646
647
648
649
650
651
652
653
654
655
656
657
658
659
660
661
662
663
664
665
666
667
668
669
670
671
672
673
674
675
676
677
678
679
680
681
682
683
684
685
686
687
688
689
690
691
692
693
694
695
696
697
698
699
700
701
702
703
704
705
706
707
708
709
710
711
712
713
714
715
716
717
718
719
720
721
722
723
724
725
726
727
728
729
730
731
732
733
734
735
736
737
738
739
740
741
742
743
744
745
746
747
748
749
750
751
752
753
754
755
756
757
758
759
760
761
762
763
764
765
766
767
768
769
770
771
772
773
774
775
776
777
778
779
780
781
782
783
784
785
786
787
788
789
790
791
792
793
794
795
796
797
798
799
800
801
802
803
804
805
806
807
808
809
810
811
812
813
814
815
816
817
818
819
820
821
822
823
824
825
826
827
828
829
830
831
832
833
834
835
836
837
838
839
840
841
842
843
844
845
846
847
848
849
850
851
852
853
854
855
856
857
858
859
860
861
862
863
864
865
866
867
868
869
870
871
872
873
874
875
876
877
878
879
880
881
882
883
884
885
886
887
888
889
890
891
892
893
894
895
896
897
898
899
900
901
902
903
904
905
906
907
908
909
910
911
912
913
914
915
916
917
918
919
920
921
922
923
924
925
926
927
928
929
930
931
932
933
934
935
936
937
938
939
940
941
942
943
944
945
946
947
948
949
950
951
952
953
954
955
956
957
958
959
960
961
962
963
964
965
966
967
968
969
970
971
972
973
974
975
976
977
978
979
980
981
982
983
984
985
986
987
988
989
990
991
992
993
994
995
996
997
998
999
1000
1001
1002
1003
1004
1005
1006
1007
1008
1009
1010
1011
1012
1013
1014
1015
1016
1017
1018
1019
1020
1021
1022
1023
1024
1025
1026
1027
1028
1029
1030
1031
1032
1033
1034
1035
1036
1037
1038
1039
1040
1041
1042
1043
1044
1045
1046
1047
1048
1049
1050
1051
1052
1053
1054
1055
1056
1057
1058
1059
1060
1061
1062
1063
1064
1065
1066
1067
1068
1069
1070
1071
1072
1073
1074
1075
1076
1077
1078
1079
1080
1081
1082
1083
1084
1085
1086
1087
1088
1089
1090
1091
1092
1093
1094
1095
1096
1097
1098
1099
1100
1101
1102
1103
1104
1105
1106
1107
1108
1109
1110
1111
1112
1113
1114
1115
1116
1117
1118
1119
1120
1121
1122
1123
1124
1125
1126
1127
1128
1129
1130
1131
1132
1133
1134
1135
1136
1137
1138
1139
1140
1141
1142
1143
1144
1145
1146
1147
1148
1149
1150
1151
1152
1153
1154
1155
1156
1157
1158
1159
1160
1161
1162
1163
1164
1165
1166
1167
1168
1169
1170
1171
1172
1173
1174
1175
1176
1177
1178
1179
1180
1181
1182
1183
1184
1185
//=============================================================================
// Yanfly Engine Plugins - Grid-Free Doodads Extension - Extended Doodad Pack 1
// YEP_X_ExtDoodadPack1.js
//=============================================================================
 
var Imported = Imported || {};
Imported.YEP_X_ExtDoodadPack1 = true;
 
var Yanfly = Yanfly || {};
Yanfly.EDP1 = Yanfly.EDP1 || {};
Yanfly.EDP1.version = 1.01;
 
//=============================================================================
 /*:
 * @plugindesc v1.01 (Requires YEP_GridFreeDoodads.js) Adds extra options
 * to the Grid-Free Doodads plugin's doodad settings.
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_GridFreeDoodads. Make sure this plugin is located
 * under YEP_GridFreeDoodads in the plugin list.
 *
 * This plugin allows you to add more options to the settings menu in the
 * doodads editor. This allows you to set the tone for doodads to change them
 * into colors that hues will not allow, the option for doodads to appear under
 * certain switch conditions, whether or not party members have joined.
 * 
 * ============================================================================
 * Doodad Settings - Tone
 * ============================================================================
 *
 * The tone is the doodad sprite's tone after all hues are applied. This can be
 * used to provide a different shade of colors that hues won't be able to
 * support, thus giving you more options on how to make your doodads appear in
 * the game without the need to create a bunch of resources. This is also very
 * light on memory usage compared to hues, too, which may make it potentially
 * more favorable to use.
 *
 * ============================================================================
 * Doodad Settings - Party
 * ============================================================================
 *
 * If you would like for certain doodads to appear or disappear if a certain
 * actor has joined the party or is missing from the party, you can use this
 * setting to do so. This way, you can add doodads to a vacant room (if a party
 * member has joined) and remove doodads from their original room. This will
 * count for if the party member is in the active party or the reserve party.
 * There is no differentiation for it.
 *
 * ============================================================================
 * Doodad Settings - Switches
 * ============================================================================
 *
 * For those who would like for some doodads to appear while certain switches
 * are on/off, you can make use of this option. Here, you can set conditions
 * for multiple switches per doodad. All the conditions must be met for the
 * doodad to appear visibly. If a doodad requires a switch to be ON and that
 * switch is OFF, the doodad will be invisible until it is on. The same will
 * apply if reversed. If a doodad requires a switch to be OFF, it will remain
 * visible until the switch turns on, which will cause the doodad to disappear.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.01:
 * - Updated for RPG Maker MV version 1.5.0.
 *
 * Version 1.00:
 * - Finished Plugin!
 */
//=============================================================================
 
if (Imported.YEP_GridFreeDoodads) {
 
if (Yanfly.GFD.version && Yanfly.GFD.version >= 1.03) {
 
//=============================================================================
// Sprite_Doodad
//=============================================================================
 
Yanfly.EDP1.Sprite_Doodad_initCustomDataZ =
  Sprite_Doodad.prototype.initCustomDataZ;
Sprite_Doodad.prototype.initCustomDataZ = function() {
  Yanfly.EDP1.Sprite_Doodad_initCustomDataZ.call(this);
  this.initCustomEDP1DataZ();
};
 
Sprite_Doodad.prototype.initCustomEDP1DataZ = function() {
  var toneRed = this._data.toneRed || 0;
  var toneGreen = this._data.toneGreen || 0;
  var toneBlue = this._data.toneBlue || 0;
  var toneGrey = this._data.toneGrey || 0;
  this.setColorTone([toneRed, toneGreen, toneBlue, toneGrey]);
  this.switchOn = this._data.switchOn || [];
  this.switchOff = this._data.switchOff || [];
  this.partyHave = this._data.partyHave || [];
  this.partyMiss = this._data.partyMiss || [];
};
 
Yanfly.EDP1.Sprite_Doodad_updateCustomA =
  Sprite_Doodad.prototype.updateCustomA;
Sprite_Doodad.prototype.updateCustomA = function() {
  this.resetOpacity();
  Yanfly.EDP1.Sprite_Doodad_updateCustomA.call(this);
};
 
Sprite_Doodad.prototype.resetOpacity = function() {
  this.opacity = this._data.opacity || 0;
};
 
Yanfly.EDP1.Sprite_Doodad_updateCustomZ = Sprite_Doodad.prototype.updateCustomZ;
Sprite_Doodad.prototype.updateCustomZ = function() {
  Yanfly.EDP1.Sprite_Doodad_updateCustomZ.call(this);
  this.updateCustomEDP1Z();
};
 
Sprite_Doodad.prototype.updateCustomEDP1Z = function() {
  if ($gameTemp._modeGFD) return;
  // Party
  var length = this.partyHave.length;
  for (var i = 0; i < length; ++i) {
    var actorId = this.partyHave[i];
    if (!$gameParty._actors.contains(actorId)) {
      this.opacity = 0;
      return;
    }
  }
  var length = this.partyMiss.length;
  for (var i = 0; i < length; ++i) {
    var actorId = this.partyMiss[i];
    if ($gameParty._actors.contains(actorId)) {
      this.opacity = 0;
      return;
    }
  }
  // Switches
  var length = this.switchOn.length;
  for (var i = 0; i < length; ++i) {
    var switchId = this.switchOn[i];
    if (!$gameSwitches.value(switchId)) {
      this.opacity = 0;
      return;
    }
  }
  var length = this.switchOff.length;
  for (var i = 0; i < length; ++i) {
    var switchId = this.switchOff[i];
    if ($gameSwitches.value(switchId)) {
      this.opacity = 0;
      return;
    }
  }
};
 
//=============================================================================
// Play Test Only
//=============================================================================
 
if (Utils.isNwjs() && Utils.isOptionValid('test')) {
 
//=============================================================================
// Window_GFD_Settings
//=============================================================================
 
Yanfly.EDP1.Window_GFD_Settings_addCustomCommands =
  Window_GFD_Settings.prototype.addCustomCommands;
Window_GFD_Settings.prototype.addCustomCommands = function() {
  this.addLineCommand();
  Yanfly.EDP1.Window_GFD_Settings_addCustomCommands.call(this);
};
 
Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsP =
  Window_GFD_Settings.prototype.addCustomCommandsP;
Window_GFD_Settings.prototype.addCustomCommandsP = function() {
  Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsP.call(this);
  this.addCustomEDP1PartyCommands();
};
 
Window_GFD_Settings.prototype.addCustomEDP1PartyCommands = function() {
  this.addCommand('Party', 'party');
};
 
Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsS =
  Window_GFD_Settings.prototype.addCustomCommandsS;
Window_GFD_Settings.prototype.addCustomCommandsS = function() {
  Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsS.call(this);
  this.addCustomEDP1SwitchCommands();
};
 
Window_GFD_Settings.prototype.addCustomEDP1SwitchCommands = function() {
  this.addCommand('Switch', 'switch');
};
 
Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsT =
  Window_GFD_Settings.prototype.addCustomCommandsT;
Window_GFD_Settings.prototype.addCustomCommandsT = function() {
  Yanfly.EDP1.Window_GFD_Settings_addCustomCommandsT.call(this);
  this.addCustomEDP1ToneCommands();
};
 
Window_GFD_Settings.prototype.addCustomEDP1ToneCommands = function() {
  this.addLineCommand();
  this.addCommand('Tone Preset', 'toneSet');
  this.addCommand('Tone: Red', 'toneRed');
  this.addCommand('Tone: Green', 'toneGreen');
  this.addCommand('Tone: Blue', 'toneBlue');
  this.addCommand('Tone: Grey', 'toneGrey');
  this.addCommand('Tone: Randomize Red', 'toneRandomRed');
  this.addCommand('Tone: Randomize Green', 'toneRandomGreen');
  this.addCommand('Tone: Randomize Blue', 'toneRandomBlue');
  this.addCommand('Tone: Randomize Grey', 'toneRandomGrey');
  this.addCommand('Tone: Randomize All', 'toneRandomAll');
  this.addLineCommand();
};
 
Yanfly.EDP1.Window_GFD_Settings_drawItem =
  Window_GFD_Settings.prototype.drawItem;
Window_GFD_Settings.prototype.drawItem = function(index) {
  this.changeTextColor(this.normalColor());
  Yanfly.EDP1.Window_GFD_Settings_drawItem.call(this, index);
  if (!this._doodad) return;
  var symbol = this.commandSymbol(index);
  var rect = this.itemRectForText(index);
  var text = '';
  switch (symbol) {
  case 'party':
    this._doodad.partyHave = this._doodad.partyHave || [];
    this._doodad.partyMiss = this._doodad.partyMiss || [];
    if (this._doodad.partyHave.length > 1) {
      text = 'Many'
    } else if (this._doodad.partyMiss.length > 1) {
      text = 'Many'
    } else if (this._doodad.partyHave.length === 1 &&
    this._doodad.partyMiss.length === 1) {
      text = 'Many'
    } else if (this._doodad.partyHave.length === 1 &&
    this._doodad.partyMiss.length === 0) {
      var actorId = this._doodad.partyHave[0];
      var actor = $gameActors.actor(actorId);
      if (actor) {
        text = actor.name() + ' Joined';
      } else {
        text = 'Null';
      }
    } else if (this._doodad.partyHave.length === 0 &&
    this._doodad.partyMiss.length === 1) {
      var actorId = this._doodad.partyMiss[0];
      var actor = $gameActors.actor(actorId);
      if (actor) {
        text = actor.name() + ' Missing';
      } else {
        text = 'Null';
      }
    } else {
      text = 'None';
    }
    break;
  case 'toneSet':
    this._doodad.toneRed = this._doodad.toneRed || 0;
    this._doodad.toneGreen = this._doodad.toneGreen || 0;
    this._doodad.toneBlue = this._doodad.toneBlue || 0;
    this._doodad.toneGrey = this._doodad.toneGrey || 0;
    var red = this._doodad.toneRed;
    var green = this._doodad.toneGreen;
    var blue = this._doodad.toneBlue;
    var grey = this._doodad.toneGrey;
    if (red === 0 && green === 0 && blue === 0 && grey === 0) {
      text = 'Normal';
    } else if (red === 0 && green === 0 && blue === 0 && grey === 255) {
      text = 'Grey';
    } else if (red === 255 && green === 0 && blue === 0 && grey === 255) {
      text = 'Red';
    } else if (red === 255 && green === 64 && blue === 0 && grey === 255) {
      text = 'Orange';
    } else if (red === 255 && green === 255 && blue === 0 && grey === 255) {
      text = 'Yellow';
    } else if (red === 68 && green === 255 && blue === 0 && grey === 255) {
      text = 'Lime';
    } else if (red === 0 && green === 255 && blue === 0 && grey === 255) {
      text = 'Green';
    } else if (red === 0 && green === 255 && blue === 68 && grey === 255) {
      text = 'Turquoise';
    } else if (red === 0 && green === 255 && blue === 255 && grey === 255) {
      text = 'Cyan';
    } else if (red === 0 && green === 68 && blue === 255 && grey === 255) {
      text = 'Sky';
    } else if (red === 0 && green === 0 && blue === 255 && grey === 255) {
      text = 'Blue';
    } else if (red === 68 && green === 0 && blue === 255 && grey === 255) {
      text = 'Purple';
    } else if (red === 255 && green === 0 && blue === 255 && grey === 255) {
      text = 'Magenta';
    } else if (red === 255 && green === 0 && blue === 68 && grey === 255) {
      text = 'Pink';
    } else if (red === -68 && green === -68 && blue === -68 && grey === 0) {
      text = 'Dark';
    } else if (red === 34 && green === -34 && blue === -68 && grey === 170) {
      text = 'Sepia';
    } else if (red === 68 && green === -34 && blue === -34 && grey === 0) {
      text = 'Sunset';
    } else if (red === -68 && green === -68 && blue === 0 && grey === 68) {
      text = 'Night';
    } else {
      text = 'Custom';
    }
    break;
  case 'toneRed':
    this._doodad.toneRed = this._doodad.toneRed || 0;
    text = this._doodad.toneRed;
    this.changeTextColor('#ff0000');
    break;
  case 'toneGreen':
    this._doodad.toneGreen = this._doodad.toneGreen || 0;
    text = this._doodad.toneGreen;
    this.changeTextColor('#00ff00');
    break;
  case 'toneBlue':
    this._doodad.toneBlue = this._doodad.toneBlue || 0;
    text = this._doodad.toneBlue;
    this.changeTextColor('#0000ff');
    break;
  case 'toneGrey':
    this._doodad.toneGrey = this._doodad.toneGrey || 0;
    text = this._doodad.toneGrey;
    this.changeTextColor('#888888');
    break;
  case 'switch':
    this._doodad.switchOn = this._doodad.switchOn || [];
    this._doodad.switchOff = this._doodad.switchOff || [];
    if (this._doodad.switchOn.length > 1) {
      text = 'Many'
    } else if (this._doodad.switchOff.length > 1) {
      text = 'Many'
    } else if (this._doodad.switchOn.length === 1 &&
    this._doodad.switchOff.length === 1) {
      text = 'Many'
    } else if (this._doodad.switchOn.length === 1 &&
    this._doodad.switchOff.length === 0) {
      text = 'Switch ' + this._doodad.switchOn[0] + ' On';
    } else if (this._doodad.switchOn.length === 0 &&
    this._doodad.switchOff.length === 1) {
      text = 'Switch ' + this._doodad.switchOff[0] + ' Off';
    } else {
      text = 'None';
    }
    break;
  }
  this.drawText(text, rect.x, rect.y, rect.width, 'right');
};
 
Yanfly.EDP1.DM_inputLeft = DoodadManager.inputLeft;
DoodadManager.inputLeft = function(doodad, symbol, value) {
  doodad.toneRed = doodad.toneRed || 0;
  doodad.toneGreen = doodad.toneGreen || 0;
  doodad.toneBlue = doodad.toneBlue || 0;
  doodad.toneGrey = doodad.toneGrey || 0;
  switch (symbol) {
  case 'toneRed':
    if (doodad.toneRed <= -255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneRed = (doodad.toneRed - value).clamp(-255, 255);
    break;
  case 'toneGreen':
    if (doodad.toneGreen <= -255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneGreen = (doodad.toneGreen - value).clamp(-255, 255);
    break;
  case 'toneBlue':
    if (doodad.toneBlue <= -255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneBlue = (doodad.toneBlue - value).clamp(-255, 255);
    break;
  case 'toneGrey':
    if (doodad.toneGrey <= 0) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneGrey = (doodad.toneGrey - value).clamp(0, 255);
    break;
  default:
    return Yanfly.EDP1.DM_inputLeft.call(this, doodad, symbol, value);
    break;
  }
  SoundManager.playCursor();
  SceneManager._scene._gfdSettingsWindow.refresh();
  this.updateNewSettings();
};
 
Yanfly.EDP1.DM_inputRight = DoodadManager.inputRight;
DoodadManager.inputRight = function(doodad, symbol, value) {
  doodad.toneRed = doodad.toneRed || 0;
  doodad.toneGreen = doodad.toneGreen || 0;
  doodad.toneBlue = doodad.toneBlue || 0;
  doodad.toneGrey = doodad.toneGrey || 0;
  switch (symbol) {
  case 'toneRed':
    if (doodad.toneRed >= 255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneRed = (doodad.toneRed + value).clamp(-255, 255);
    break;
  case 'toneGreen':
    if (doodad.toneGreen >= 255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneGreen = (doodad.toneGreen + value).clamp(-255, 255);
    break;
  case 'toneBlue':
    if (doodad.toneBlue >= 255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneBlue = (doodad.toneBlue + value).clamp(-255, 255);
    break;
  case 'toneGrey':
    if (doodad.toneGrey >= 255) return;
    value *= 5;
    if (Input.isPressed('shift')) value = 1;
    doodad.toneGrey = (doodad.toneGrey + value).clamp(0, 255);
    break;
  default:
    return Yanfly.EDP1.DM_inputLeft.call(this, doodad, symbol, value);
    break;
  }
  SoundManager.playCursor();
  SceneManager._scene._gfdSettingsWindow.refresh();
  this.updateNewSettings();
};
 
//=============================================================================
// Window_GFD_SettingsTonePresets
//=============================================================================
 
function Window_GFD_SettingsTonePresets() {
  this.initialize.apply(this, arguments);
}
 
Window_GFD_SettingsTonePresets.prototype = Object.create(Window_Command.prototype);
Window_GFD_SettingsTonePresets.prototype.constructor = Window_GFD_SettingsTonePresets;
 
Window_GFD_SettingsTonePresets.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 400, 0);
  this.setGFD();
};
 
Window_GFD_SettingsTonePresets.prototype.windowHeight = function() {
  var winHeight = this.fittingHeight(this.numVisibleRows());
  return Math.min(Graphics.boxHeight, winHeight);
};
 
Window_GFD_SettingsTonePresets.prototype.makeCommandList = function() {
  this.addCommand(   'Normal', 'tonePreset', true, [  0,   0,   0,   0]);
  this.addCommand(     'Grey', 'tonePreset', true, [  0,   0,   0, 255]);
  this.addCommand(      'Red', 'tonePreset', true, [255,   0,   0, 255]);
  this.addCommand(   'Orange', 'tonePreset', true, [255,  64,   0, 255]);
  this.addCommand(   'Yellow', 'tonePreset', true, [255, 255,   0, 255]);
  this.addCommand(     'Lime', 'tonePreset', true, [ 68, 255,   0, 255]);
  this.addCommand(    'Green', 'tonePreset', true, [  0, 255,   0, 255]);
  this.addCommand('Turquoise', 'tonePreset', true, [  0, 255,  68, 255]);
  this.addCommand(     'Cyan', 'tonePreset', true, [  0, 255, 255, 255]);
  this.addCommand(      'Sky', 'tonePreset', true, [  0,  68, 255, 255]);
  this.addCommand(     'Blue', 'tonePreset', true, [  0,   0, 255, 255]);
  this.addCommand(   'Purple', 'tonePreset', true, [ 68,   0, 255, 255]);
  this.addCommand(  'Magenta', 'tonePreset', true, [255,   0, 255, 255]);
  this.addCommand(     'Pink', 'tonePreset', true, [255,   0,  68, 255]);
  this.addCommand(     'Dark', 'tonePreset', true, [-68, -68, -68,   0]);
  this.addCommand(    'Sepia', 'tonePreset', true, [ 34, -34, -68, 170]);
  this.addCommand(   'Sunset', 'tonePreset', true, [ 68, -34, -34,   0]);
  this.addCommand(    'Night', 'tonePreset', true, [-68, -68,   0,  68]);
};
 
Window_GFD_SettingsTonePresets.prototype.itemTextAlign = function() {
  return 'center';
};
 
//=============================================================================
// Window_GFD_SettingsToneRGB
//=============================================================================
 
function Window_GFD_SettingsToneRGB() {
  this.initialize.apply(this, arguments);
}
 
Window_GFD_SettingsToneRGB.prototype = Object.create(Window_Command.prototype);
Window_GFD_SettingsToneRGB.prototype.constructor = Window_GFD_SettingsToneRGB;
 
Window_GFD_SettingsToneRGB.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 400, 0);
  this.setGFD();
};
 
Window_GFD_SettingsToneRGB.prototype.windowHeight = function() {
  var winHeight = this.fittingHeight(this.numVisibleRows());
  return Math.min(Graphics.boxHeight, winHeight);
};
 
Window_GFD_SettingsToneRGB.prototype.makeCommandList = function() {
  this.addCommand(' 255', 'toneSet', true,   255);
  this.addCommand(' 250', 'toneSet', true,   250);
  this.addCommand(' 200', 'toneSet', true,   200);
  this.addCommand(' 150', 'toneSet', true,   150);
  this.addCommand(' 128', 'toneSet', true,   128);
  this.addCommand(' 100', 'toneSet', true,   100);
  this.addCommand('  75', 'toneSet', true,    75);
  this.addCommand('  50', 'toneSet', true,    50);
  this.addCommand('  25', 'toneSet', true,    25);
  this.addCommand('   0', 'toneSet', true,     0);
  this.addCommand(' -25', 'toneSet', true,   -25);
  this.addCommand(' -50', 'toneSet', true,   -50);
  this.addCommand(' -75', 'toneSet', true,   -75);
  this.addCommand('-100', 'toneSet', true,  -100);
  this.addCommand('-128', 'toneSet', true,  -128);
  this.addCommand('-150', 'toneSet', true,  -150);
  this.addCommand('-200', 'toneSet', true,  -200);
  this.addCommand('-250', 'toneSet', true,  -250);
  this.addCommand('-255', 'toneSet', true,  -255);
};
 
Window_GFD_SettingsToneRGB.prototype.itemTextAlign = function() {
  return 'center';
};
 
//=============================================================================
// Window_GFD_SettingsToneGrey
//=============================================================================
 
function Window_GFD_SettingsToneGrey() {
  this.initialize.apply(this, arguments);
}
 
Window_GFD_SettingsToneGrey.prototype = Object.create(Window_Command.prototype);
Window_GFD_SettingsToneGrey.prototype.constructor = Window_GFD_SettingsToneGrey;
 
Window_GFD_SettingsToneGrey.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 400, 0);
  this.setGFD();
};
 
Window_GFD_SettingsToneGrey.prototype.makeCommandList = function() {
  this.addCommand(' 255', 'toneSet', true,   255);
  this.addCommand(' 250', 'toneSet', true,   250);
  this.addCommand(' 200', 'toneSet', true,   200);
  this.addCommand(' 150', 'toneSet', true,   150);
  this.addCommand(' 128', 'toneSet', true,   128);
  this.addCommand(' 100', 'toneSet', true,   100);
  this.addCommand('  75', 'toneSet', true,    75);
  this.addCommand('  50', 'toneSet', true,    50);
  this.addCommand('  25', 'toneSet', true,    25);
  this.addCommand('   0', 'toneSet', true,     0);
};
 
Window_GFD_SettingsToneGrey.prototype.itemTextAlign = function() {
  return 'center';
};
 
//=============================================================================
// Window_GFD_SettingsParty
//=============================================================================
 
function Window_GFD_SettingsParty() {
  this.initialize.apply(this, arguments);
}
 
Window_GFD_SettingsParty.prototype = Object.create(Window_Command.prototype);
Window_GFD_SettingsParty.prototype.constructor = Window_GFD_SettingsParty;
 
Window_GFD_SettingsParty.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 400, 0);
  this.setGFD();
};
 
Window_GFD_SettingsParty.prototype.windowWidth = function() {
  return Graphics.boxWidth - 400;
};
 
Window_GFD_SettingsParty.prototype.windowHeight = function() {
  return Graphics.boxHeight;
};
 
Window_GFD_SettingsParty.prototype.maxCols = function() {
  return 4;
};
 
Window_GFD_SettingsParty.prototype.spacing = function() {
  return 0;
};
 
Window_GFD_SettingsParty.prototype.itemRect = function(index) {
  var rect = Window_Command.prototype.itemRect.call(this, index);
  if (this._textWidth === undefined) {
    this._textWidth = this.textWidth('-Missing-');
  }
  if (index % 4 === 0) {
    rect.width = this.contents.width - this._textWidth * 3;
  } else if (index % 4 === 1) {
    rect.x = this.contents.width - this._textWidth * 3;
    rect.width = this._textWidth;
  } else if (index % 4 === 2) {
    rect.x = this.contents.width - this._textWidth * 2;
    rect.width = this._textWidth;
  } else if (index % 4 === 3) {
    rect.x = this.contents.width - this._textWidth * 1;
    rect.width = this._textWidth;
  }
  return rect;
};
 
Window_GFD_SettingsParty.prototype.makeCommandList = function() {
  var actors = $dataActors;
  var length = actors.length;
  var fmt = 'A%1: %2';
  for (var i = 1; i < length; ++i) {
    var actorId = i;
    var actor = $gameActors.actor(actorId);
    if (!actor) continue;
    var actorName = actor.name();
    if (actorName === '') continue;
    var text = fmt.format(actorId.padZero(4), actorName);
    this.addCommand(text, 'actorName');
    this.addCommand('n/a', 'partyNone', true, actorId);
    this.addCommand('Joined', 'partyHave', true, actorId);
    this.addCommand('Missing', 'partyMiss', true, actorId);
  }
};
 
Window_GFD_SettingsParty.prototype.drawItem = function(index) {
  var symbol = this.commandSymbol(index);
  if (symbol === 'actorName') {
    return Window_Command.prototype.drawItem.call(this, index);
  }
  var ext = this._list[index].ext;
  var rect = this.itemRectForText(index);
  var align = 'center';
  var enabled = false;
  this.resetTextColor();
  var doodad = SceneManager._scene._gfdSettingsWindow._doodad;
  if (!doodad) return;
  doodad.partyHave = doodad.partyHave || [];
  doodad.partyMiss = doodad.partyMiss || [];
  if (symbol === 'partyNone') {
    enabled = !doodad.partyHave.contains(ext) && !doodad.partyMiss.contains(ext);
  } else if (symbol === 'partyHave') {
    enabled = doodad.partyHave.contains(ext);
  } else if (symbol === 'partyMiss') {
    enabled = doodad.partyMiss.contains(ext);
  }
  this.changePaintOpacity(enabled);
  this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};
 
//=============================================================================
// Window_GFD_SettingsSwitch
//=============================================================================
 
function Window_GFD_SettingsSwitch() {
  this.initialize.apply(this, arguments);
}
 
Window_GFD_SettingsSwitch.prototype = Object.create(Window_Command.prototype);
Window_GFD_SettingsSwitch.prototype.constructor = Window_GFD_SettingsSwitch;
 
Window_GFD_SettingsSwitch.prototype.initialize = function() {
  Window_Command.prototype.initialize.call(this, 400, 0);
  this.setGFD();
};
 
Window_GFD_SettingsSwitch.prototype.windowWidth = function() {
  return Graphics.boxWidth - 400;
};
 
Window_GFD_SettingsSwitch.prototype.windowHeight = function() {
  return Graphics.boxHeight;
};
 
Window_GFD_SettingsSwitch.prototype.maxCols = function() {
  return 4;
};
 
Window_GFD_SettingsSwitch.prototype.spacing = function() {
  return 0;
};
 
Window_GFD_SettingsSwitch.prototype.itemRect = function(index) {
  var rect = Window_Command.prototype.itemRect.call(this, index);
  if (this._textWidth === undefined) {
    this._textWidth = this.textWidth('12345');
  }
  if (index % 4 === 0) {
    rect.width = this.contents.width - this._textWidth * 3;
  } else if (index % 4 === 1) {
    rect.x = this.contents.width - this._textWidth * 3;
    rect.width = this._textWidth;
  } else if (index % 4 === 2) {
    rect.x = this.contents.width - this._textWidth * 2;
    rect.width = this._textWidth;
  } else if (index % 4 === 3) {
    rect.x = this.contents.width - this._textWidth * 1;
    rect.width = this._textWidth;
  }
  return rect;
};
 
Window_GFD_SettingsSwitch.prototype.makeCommandList = function() {
  var switches = $dataSystem.switches;
  var length = switches.length;
  var fmt = 'S%1: %2';
  for (var i = 1; i < length; ++i) {
    var switchId = i;
    var switchName = $dataSystem.switches[i];
    if (switchName === '') continue;
    var text = fmt.format(switchId.padZero(4), switchName);
    this.addCommand(text, 'switchName');
    this.addCommand('n/a', 'switchNone', true, switchId);
    this.addCommand('ON', 'switchOn', true, switchId);
    this.addCommand('OFF', 'switchOff', true, switchId);
  }
};
 
Window_GFD_SettingsSwitch.prototype.drawItem = function(index) {
  var symbol = this.commandSymbol(index);
  if (symbol === 'switchName') {
    return Window_Command.prototype.drawItem.call(this, index);
  }
  var ext = this._list[index].ext;
  var rect = this.itemRectForText(index);
  var align = 'center';
  var enabled = false;
  this.resetTextColor();
  var doodad = SceneManager._scene._gfdSettingsWindow._doodad;
  if (!doodad) return;
  doodad.switchOn = doodad.switchOn || [];
  doodad.switchOff = doodad.switchOff || [];
  if (symbol === 'switchNone') {
    enabled = !doodad.switchOn.contains(ext) && !doodad.switchOff.contains(ext);
  } else if (symbol === 'switchOn') {
    enabled = doodad.switchOn.contains(ext);
  } else if (symbol === 'switchOff') {
    enabled = doodad.switchOff.contains(ext);
  }
  this.changePaintOpacity(enabled);
  this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};
 
//=============================================================================
// Scene_Map
//=============================================================================
 
Yanfly.EDP1.Scene_Map_createGFDSettingsWindow =
  Scene_Map.prototype.createGFDSettingsWindow;
Scene_Map.prototype.createGFDSettingsWindow = function() {
  Yanfly.EDP1.Scene_Map_createGFDSettingsWindow.call(this);
  var win = this._gfdSettingsWindow;
  win.setHandler('party', this.cmdGFDSettingsParty.bind(this));
  win.setHandler('switch', this.cmdGFDSettingsSwitch.bind(this));
 
  win.setHandler('toneSet', this.cmdGFDSettingsTonePreset.bind(this));
  win.setHandler('toneRed', this.cmdGFDSettingsToneRed.bind(this));
  win.setHandler('toneGreen', this.cmdGFDSettingsToneGreen.bind(this));
  win.setHandler('toneBlue', this.cmdGFDSettingsToneBlue.bind(this));
  win.setHandler('toneGrey', this.cmdGFDSettingsToneGrey.bind(this));
  win.setHandler('toneRandomRed', this.cmdGFDSettToneRandomRed.bind(this));
  win.setHandler('toneRandomGreen', this.cmdGFDSettToneRandomGreen.bind(this));
  win.setHandler('toneRandomBlue', this.cmdGFDSettToneRandomBlue.bind(this));
  win.setHandler('toneRandomGrey', this.cmdGFDSettToneRandomGrey.bind(this));
  win.setHandler('toneRandomAll', this.cmdGFDSettToneRandomAll.bind(this));
};
 
Yanfly.EDP1.Scene_Map_createGFDSettingsSubwindows =
  Scene_Map.prototype.createGFDSettingsSubwindows;
Scene_Map.prototype.createGFDSettingsSubwindows = function() {
  Yanfly.EDP1.Scene_Map_createGFDSettingsSubwindows.call(this);
  this.createGFDSettingsTonePresetWindow();
  this.createGFDSettingsToneRGBWindow();
  this.createGFDSettingsToneGreyWindow();
  this.createGFDSettingsPartyWindow();
  this.createGFDSettingsSwitchWindow();
};
 
// Party Window
 
Scene_Map.prototype.createGFDSettingsPartyWindow = function() {
  this._gfdSettingsPartyWindow = new Window_GFD_SettingsParty();
  this.addChild(this._gfdSettingsPartyWindow);
  this._gfdWindows.push(this._gfdSettingsPartyWindow);
  var win = this._gfdSettingsPartyWindow;
  win.setHandler('cancel', this.cancelGFDSettParty.bind(this));
  win.setHandler('partyNone', this.cmdGFDSettPartyNone.bind(this));
  win.setHandler('partyHave', this.cmdGFDSettPartyHave.bind(this));
  win.setHandler('partyMiss', this.cmdGFDSettPartyMiss.bind(this));
};
 
Scene_Map.prototype.cmdGFDSettingsParty = function() {
  this._gfdSettingsPartyWindow.activate();
  this._gfdSettingsPartyWindow.open();
  this._gfdSettingsPartyWindow.select(0);
  this._gfdSettingsPartyWindow.refresh();
};
 
Scene_Map.prototype.cancelGFDSettParty = function() {
  this._gfdSettingsPartyWindow.close();
  this._gfdSettingsWindow.activate();
};
 
Scene_Map.prototype.cmdGFDSettPartyNone = function() {
  var ext = this._gfdSettingsPartyWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
 
  doodad.partyHave = doodad.partyHave || [];
  var index = doodad.partyHave.indexOf(ext);
  if (index >= 0) doodad.partyHave.splice(index, 1);
 
  doodad.partyMiss = doodad.partyMiss || [];
  var index = doodad.partyMiss.indexOf(ext);
  if (index >= 0) doodad.partyMiss.splice(index, 1);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsPartyWindow.activate();
  this._gfdSettingsPartyWindow.refresh();
};
 
// Switch Window
 
Scene_Map.prototype.createGFDSettingsSwitchWindow = function() {
  this._gfdSettingsSwitchWindow = new Window_GFD_SettingsSwitch();
  this.addChild(this._gfdSettingsSwitchWindow);
  this._gfdWindows.push(this._gfdSettingsSwitchWindow);
  var win = this._gfdSettingsSwitchWindow;
  win.setHandler('cancel', this.cancelGFDSettSwitch.bind(this));
  win.setHandler('switchNone', this.cmdGFDSettSwitchNone.bind(this));
  win.setHandler('switchOn', this.cmdGFDSettSwitchOn.bind(this));
  win.setHandler('switchOff', this.cmdGFDSettSwitchOff.bind(this));
};
 
Scene_Map.prototype.cmdGFDSettingsSwitch = function() {
  this._gfdSettingsSwitchWindow.activate();
  this._gfdSettingsSwitchWindow.open();
  this._gfdSettingsSwitchWindow.select(0);
  this._gfdSettingsSwitchWindow.refresh();
};
 
Scene_Map.prototype.cancelGFDSettSwitch = function() {
  this._gfdSettingsSwitchWindow.close();
  this._gfdSettingsWindow.activate();
};
 
Scene_Map.prototype.cmdGFDSettSwitchNone = function() {
  var ext = this._gfdSettingsSwitchWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
 
  doodad.switchOn = doodad.switchOn || [];
  var index = doodad.switchOn.indexOf(ext);
  if (index >= 0) doodad.switchOn.splice(index, 1);
 
  doodad.switchOff = doodad.switchOff || [];
  var index = doodad.switchOff.indexOf(ext);
  if (index >= 0) doodad.switchOff.splice(index, 1);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsSwitchWindow.activate();
  this._gfdSettingsSwitchWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettSwitchOn = function() {
  var ext = this._gfdSettingsSwitchWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
 
  doodad.switchOn = doodad.switchOn || [];
  var index = doodad.switchOn.indexOf(ext);
  if (!doodad.switchOn.contains(ext)) doodad.switchOn.push(ext);
 
  doodad.switchOff = doodad.switchOff || [];
  var index = doodad.switchOff.indexOf(ext);
  if (index >= 0) doodad.switchOff.splice(index, 1);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsSwitchWindow.activate();
  this._gfdSettingsSwitchWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettSwitchOff = function() {
  var ext = this._gfdSettingsSwitchWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
   
  doodad.switchOn = doodad.switchOn || [];
  var index = doodad.switchOn.indexOf(ext);
  if (index >= 0) doodad.switchOn.splice(index, 1);
 
  doodad.switchOff = doodad.switchOff || [];
  if (!doodad.switchOff.contains(ext)) doodad.switchOff.push(ext);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsSwitchWindow.activate();
  this._gfdSettingsSwitchWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettPartyHave = function() {
  var ext = this._gfdSettingsPartyWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
 
  doodad.partyHave = doodad.partyHave || [];
  var index = doodad.partyHave.indexOf(ext);
  if (!doodad.partyHave.contains(ext)) doodad.partyHave.push(ext);
 
  doodad.partyMiss = doodad.partyMiss || [];
  var index = doodad.partyMiss.indexOf(ext);
  if (index >= 0) doodad.partyMiss.splice(index, 1);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsPartyWindow.activate();
  this._gfdSettingsPartyWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettPartyMiss = function() {
  var ext = this._gfdSettingsPartyWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
   
  doodad.partyHave = doodad.partyHave || [];
  var index = doodad.partyHave.indexOf(ext);
  if (index >= 0) doodad.partyHave.splice(index, 1);
 
  doodad.partyMiss = doodad.partyMiss || [];
  if (!doodad.partyMiss.contains(ext)) doodad.partyMiss.push(ext);
 
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.refresh();
  this._gfdSettingsPartyWindow.activate();
  this._gfdSettingsPartyWindow.refresh();
};
 
// Tone Preset Window
 
Scene_Map.prototype.createGFDSettingsTonePresetWindow = function() {
  this._gfdSettingsTonePresetWindow = new Window_GFD_SettingsTonePresets();
  this.addChild(this._gfdSettingsTonePresetWindow);
  this._gfdWindows.push(this._gfdSettingsTonePresetWindow);
  var win = this._gfdSettingsTonePresetWindow;
  win.setHandler('cancel', this.cancelGFDSettTonePreset.bind(this));
  win.setHandler('tonePreset', this.cmdGFDSettTonePresetOk.bind(this));
};
 
Scene_Map.prototype.cmdGFDSettingsTonePreset = function() {
  this._gfdSettingsTonePresetWindow.activate();
  this._gfdSettingsTonePresetWindow.open();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneRed = doodad.toneRed || 0;
  doodad.toneGreen = doodad.toneGreen || 0;
  doodad.toneBlue = doodad.toneBlue || 0;
  doodad.toneGrey = doodad.toneGrey || 0;
  var index = 0;
  for (var i = 0; i < this._gfdSettingsTonePresetWindow.maxItems(); ++i) {
    var ext = this._gfdSettingsTonePresetWindow._list[i].ext;
    if (!ext) continue;
    if (ext[0] !== doodad.toneRed) continue;
    if (ext[1] !== doodad.toneGreen) continue;
    if (ext[2] !== doodad.toneBlue) continue;
    if (ext[3] !== doodad.toneGrey) continue;
    index = i;
  }
  this._gfdSettingsTonePresetWindow.select(index);
  this._gfdSettingsTonePresetWindow.refresh();
};
 
Scene_Map.prototype.cancelGFDSettTonePreset = function() {
  this._gfdSettingsTonePresetWindow.close();
  this._gfdSettingsWindow.activate();
};
 
Scene_Map.prototype.cmdGFDSettTonePresetOk = function() {
  var ext = this._gfdSettingsTonePresetWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneRed = ext[0];
  doodad.toneGreen = ext[1];
  doodad.toneBlue = ext[2];
  doodad.toneGrey = ext[3];
  DoodadManager.updateNewSettings();
  this.cancelGFDSettTonePreset();
  this._gfdSettingsWindow.refresh();
};
 
// Tone RGB Window
 
Scene_Map.prototype.createGFDSettingsToneRGBWindow = function() {
  this._gfdSettingsToneRGBWindow = new Window_GFD_SettingsToneRGB();
  this.addChild(this._gfdSettingsToneRGBWindow);
  this._gfdWindows.push(this._gfdSettingsToneRGBWindow);
  var win = this._gfdSettingsToneRGBWindow;
  win.setHandler('cancel', this.cancelGFDSettToneRGB.bind(this));
  win.setHandler('toneSet', this.cmdGFDSettToneRGBOk.bind(this));
};
 
Scene_Map.prototype.cmdGFDSettingsToneRed = function() {
  this._gfdToneColor = 'red';
  this._gfdSettingsToneRGBWindow.activate();
  this._gfdSettingsToneRGBWindow.open();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneRed = doodad.toneRed || 0;
  var value = doodad.toneRed;
  var index = 0;
  for (var i = 0; i < this._gfdSettingsToneRGBWindow.maxItems(); ++i) {
    var ext = this._gfdSettingsToneRGBWindow._list[i].ext;
    if (value <= ext) index = i;
  }
  this._gfdSettingsToneRGBWindow.select(index);
  this._gfdSettingsToneRGBWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettingsToneGreen = function() {
  this._gfdToneColor = 'green';
  this._gfdSettingsToneRGBWindow.activate();
  this._gfdSettingsToneRGBWindow.open();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneGreen = doodad.toneGreen || 0;
  var value = doodad.toneGreen;
  var index = 0;
  for (var i = 0; i < this._gfdSettingsToneRGBWindow.maxItems(); ++i) {
    var ext = this._gfdSettingsToneRGBWindow._list[i].ext;
    if (value <= ext) index = i;
  }
  this._gfdSettingsToneRGBWindow.select(index);
  this._gfdSettingsToneRGBWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettingsToneBlue = function() {
  this._gfdToneColor = 'blue';
  this._gfdSettingsToneRGBWindow.activate();
  this._gfdSettingsToneRGBWindow.open();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneBlue = doodad.toneBlue || 0;
  var value = doodad.toneBlue;
  var index = 0;
  for (var i = 0; i < this._gfdSettingsToneRGBWindow.maxItems(); ++i) {
    var ext = this._gfdSettingsToneRGBWindow._list[i].ext;
    if (value <= ext) index = i;
  }
  this._gfdSettingsToneRGBWindow.select(index);
  this._gfdSettingsToneRGBWindow.refresh();
};
 
Scene_Map.prototype.cancelGFDSettToneRGB = function() {
  this._gfdSettingsToneRGBWindow.close();
  this._gfdSettingsWindow.activate();
};
 
Scene_Map.prototype.cmdGFDSettToneRGBOk = function() {
  var ext = this._gfdSettingsToneRGBWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
  if (this._gfdToneColor === 'red') {
    doodad.toneRed = ext;
  } else if (this._gfdToneColor === 'green') {
    doodad.toneGreen = ext;
  } else if (this._gfdToneColor === 'blue') {
    doodad.toneBlue = ext;
  }
  DoodadManager.updateNewSettings();
  this.cancelGFDSettToneRGB();
  this._gfdSettingsWindow.refresh();
};
 
// Tone Grey Window
 
Scene_Map.prototype.createGFDSettingsToneGreyWindow = function() {
  this._gfdSettingsToneGreyWindow = new Window_GFD_SettingsToneGrey();
  this.addChild(this._gfdSettingsToneGreyWindow);
  this._gfdWindows.push(this._gfdSettingsToneGreyWindow);
  var win = this._gfdSettingsToneGreyWindow;
  win.setHandler('cancel', this.cancelGFDSettToneGrey.bind(this));
  win.setHandler('toneSet', this.cmdGFDSettToneGreyOk.bind(this));
};
 
Scene_Map.prototype.cmdGFDSettingsToneGrey = function() {
  this._gfdSettingsToneGreyWindow.activate();
  this._gfdSettingsToneGreyWindow.open();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneGrey = doodad.toneGrey || 0;
  var value = doodad.toneGrey;
  var index = 0;
  for (var i = 0; i < this._gfdSettingsToneGreyWindow.maxItems(); ++i) {
    var ext = this._gfdSettingsToneGreyWindow._list[i].ext;
    if (value <= ext) index = i;
  }
  this._gfdSettingsToneGreyWindow.select(index);
  this._gfdSettingsToneGreyWindow.refresh();
};
 
Scene_Map.prototype.cancelGFDSettToneGrey = function() {
  this._gfdSettingsToneGreyWindow.close();
  this._gfdSettingsWindow.activate();
};
 
Scene_Map.prototype.cmdGFDSettToneGreyOk = function() {
  var ext = this._gfdSettingsToneGreyWindow.currentExt();
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneGrey = ext;
  DoodadManager.updateNewSettings();
  this.cancelGFDSettToneGrey();
  this._gfdSettingsWindow.refresh();
};
 
// Tone Randomize
 
Scene_Map.prototype.cmdGFDSettToneRandomRed = function() {
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneRed = Yanfly.Util.randomIntBetween(0, 255);
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.activate();
  this._gfdSettingsWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettToneRandomGreen = function() {
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneGreen = Yanfly.Util.randomIntBetween(0, 255);
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.activate();
  this._gfdSettingsWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettToneRandomBlue = function() {
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneBlue = Yanfly.Util.randomIntBetween(0, 255);
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.activate();
  this._gfdSettingsWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettToneRandomGrey = function() {
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneGrey = Yanfly.Util.randomIntBetween(0, 255);
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.activate();
  this._gfdSettingsWindow.refresh();
};
 
Scene_Map.prototype.cmdGFDSettToneRandomAll = function() {
  var doodad = this._gfdSettingsWindow._doodad;
  doodad.toneRed = Yanfly.Util.randomIntBetween(0, 255);
  doodad.toneGreen = Yanfly.Util.randomIntBetween(0, 255);
  doodad.toneBlue = Yanfly.Util.randomIntBetween(0, 255);
  doodad.toneGrey = Yanfly.Util.randomIntBetween(0, 255);
  DoodadManager.updateNewSettings();
  this._gfdSettingsWindow.activate();
  this._gfdSettingsWindow.refresh();
};
 
//=============================================================================
// Utilities
//=============================================================================
 
Yanfly.Util = Yanfly.Util || {};
 
Yanfly.Util.randomIntBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
 
//=============================================================================
// End of Play Test Only
//=============================================================================
 
}; // Play Test Only
 
//=============================================================================
// End of File
//=============================================================================
} else { // Yanfly.GFD.version
 
var text = '================================================================\n';
text += 'YEP_X_ExtDoodadPack1 requires YEP_GridFreeDoodads to be at the ';
text += 'latest version to run properly.\n\nPlease go to www.yanfly.moe and ';
text += 'update to the latest version for the YEP_GridFreeDoodads plugin.\n';
text += '================================================================\n';
console.log(text);
require('nw.gui').Window.get().showDevTools();
 
} // Yanfly.GFD.version
}; // YEP_GridFreeDoodads