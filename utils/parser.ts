import { ParsedLine, MetricData, GlobalStats } from '../types';

export const DEFAULT_LOGS = `105.1s	36	Using device: cuda
105.1s	37	Train shape: (7613, 5)
105.1s	38	Test shape: (3263, 4)
106.3s	47	========== Fold 1 / 5 ==========
133.5s	61	Some weights of RobertaForSequenceClassification were not initialized from the model checkpoint at roberta-base and are newly initialized
134.1s	67	Fold 1 — Epoch 1/3
168.4s	68	  Fold 1 | Epoch 1 | Step 100/381 | Loss: 0.3754
204.5s	69	  Fold 1 | Epoch 1 | Step 200/381 | Loss: 0.5616
244.6s	70	  Fold 1 | Epoch 1 | Step 300/381 | Loss: 0.2992
290.4s	71	  Train loss: 0.4929
290.4s	72	  Val loss:   0.4086
290.4s	73	  Val F1 @0.5: 0.7925
290.4s	74	  🔥 New best F1 for fold 1: 0.7925
290.4s	76	Fold 1 — Epoch 2/3
330.4s	77	  Fold 1 | Epoch 2 | Step 100/381 | Loss: 0.1251
371.0s	78	  Fold 1 | Epoch 2 | Step 200/381 | Loss: 0.4007
411.2s	79	  Fold 1 | Epoch 2 | Step 300/381 | Loss: 0.3770
456.2s	80	  Train loss: 0.3558
456.2s	81	  Val loss:   0.3676
456.2s	82	  Val F1 @0.5: 0.8120
456.2s	83	  🔥 New best F1 for fold 1: 0.8120
456.2s	85	Fold 1 — Epoch 3/3
496.7s	86	  Fold 1 | Epoch 3 | Step 100/381 | Loss: 0.2780
537.1s	87	  Fold 1 | Epoch 3 | Step 200/381 | Loss: 0.2640
577.6s	88	  Fold 1 | Epoch 3 | Step 300/381 | Loss: 0.0947
622.7s	89	  Train loss: 0.2731
622.7s	90	  Val loss:   0.4420
622.7s	91	  Val F1 @0.5: 0.8255
622.7s	92	  🔥 New best F1 for fold 1: 0.8255
661.9s	93	Fold 1 done. Best F1 (val): 0.8255
661.9s	95	========== Fold 2 / 5 ==========
662.3s	102	Fold 2 — Epoch 1/3
702.6s	103	  Fold 2 | Epoch 1 | Step 100/381 | Loss: 0.2829
743.0s	104	  Fold 2 | Epoch 1 | Step 200/381 | Loss: 0.4835
783.5s	105	  Fold 2 | Epoch 1 | Step 300/381 | Loss: 0.6532
828.6s	106	  Train loss: 0.4895
828.6s	107	  Val loss:   0.4582
828.6s	108	  Val F1 @0.5: 0.8055
828.6s	109	  🔥 New best F1 for fold 2: 0.8055
828.6s	111	Fold 2 — Epoch 2/3
869.0s	112	  Fold 2 | Epoch 2 | Step 100/381 | Loss: 0.8863
909.5s	113	  Fold 2 | Epoch 2 | Step 200/381 | Loss: 0.4072
949.9s	114	  Fold 2 | Epoch 2 | Step 300/381 | Loss: 0.4420
995.0s	115	  Train loss: 0.3615
995.0s	116	  Val loss:   0.3872
995.0s	117	  Val F1 @0.5: 0.8080
995.0s	118	  🔥 New best F1 for fold 2: 0.8080
995.0s	120	Fold 2 — Epoch 3/3
1035.3s	121	  Fold 2 | Epoch 3 | Step 100/381 | Loss: 0.1344
1075.8s	122	  Fold 2 | Epoch 3 | Step 200/381 | Loss: 0.2593
1116.2s	123	  Fold 2 | Epoch 3 | Step 300/381 | Loss: 0.1675
1161.2s	124	  Train loss: 0.2809
1161.2s	125	  Val loss:   0.4299
1161.2s	126	  Val F1 @0.5: 0.8097
1161.2s	127	  🔥 New best F1 for fold 2: 0.8097
1200.4s	128	Fold 2 done. Best F1 (val): 0.8097
1200.4s	130	========== Fold 3 / 5 ==========
1200.8s	137	Fold 3 — Epoch 1/3
1241.0s	138	  Fold 3 | Epoch 1 | Step 100/381 | Loss: 0.5207
1281.3s	139	  Fold 3 | Epoch 1 | Step 200/381 | Loss: 0.2714
1321.6s	140	  Fold 3 | Epoch 1 | Step 300/381 | Loss: 0.4701
1366.6s	141	  Train loss: 0.4968
1366.6s	142	  Val loss:   0.4410
1366.6s	143	  Val F1 @0.5: 0.7887
1366.6s	144	  🔥 New best F1 for fold 3: 0.7887
1366.6s	146	Fold 3 — Epoch 2/3
1407.0s	147	  Fold 3 | Epoch 2 | Step 100/381 | Loss: 0.3521
1447.4s	148	  Fold 3 | Epoch 2 | Step 200/381 | Loss: 0.7685
1487.8s	149	  Fold 3 | Epoch 2 | Step 300/381 | Loss: 0.3369
1532.8s	150	  Train loss: 0.3501
1532.8s	151	  Val loss:   0.4729
1532.8s	152	  Val F1 @0.5: 0.7944
1532.8s	153	  🔥 New best F1 for fold 3: 0.7944
1532.8s	155	Fold 3 — Epoch 3/3
1573.2s	156	  Fold 3 | Epoch 3 | Step 100/381 | Loss: 0.1525
1613.5s	157	  Fold 3 | Epoch 3 | Step 200/381 | Loss: 0.3710
1653.9s	158	  Fold 3 | Epoch 3 | Step 300/381 | Loss: 0.4637
1698.9s	159	  Train loss: 0.2757
1698.9s	160	  Val loss:   0.5255
1698.9s	161	  Val F1 @0.5: 0.7844
1738.2s	162	Fold 3 done. Best F1 (val): 0.7944
1738.2s	164	========== Fold 4 / 5 ==========
1738.6s	171	Fold 4 — Epoch 1/3
1778.9s	172	  Fold 4 | Epoch 1 | Step 100/381 | Loss: 0.4624
1819.2s	173	  Fold 4 | Epoch 1 | Step 200/381 | Loss: 0.5912
1859.5s	174	  Fold 4 | Epoch 1 | Step 300/381 | Loss: 0.2067
1904.6s	175	  Train loss: 0.4930
1904.6s	176	  Val loss:   0.4496
1904.6s	177	  Val F1 @0.5: 0.7723
1904.6s	178	  🔥 New best F1 for fold 4: 0.7723
1904.6s	180	Fold 4 — Epoch 2/3
1945.0s	181	  Fold 4 | Epoch 2 | Step 100/381 | Loss: 0.3996
1985.4s	182	  Fold 4 | Epoch 2 | Step 200/381 | Loss: 0.6720
2025.8s	183	  Fold 4 | Epoch 2 | Step 300/381 | Loss: 0.1097
2071.0s	184	  Train loss: 0.3499
2071.0s	185	  Val loss:   0.4255
2071.0s	186	  Val F1 @0.5: 0.8010
2071.0s	187	  🔥 New best F1 for fold 4: 0.8010
2071.0s	189	Fold 4 — Epoch 3/3
2111.5s	190	  Fold 4 | Epoch 3 | Step 100/381 | Loss: 0.3984
2151.9s	191	  Fold 4 | Epoch 3 | Step 200/381 | Loss: 0.2409
2192.2s	192	  Fold 4 | Epoch 3 | Step 300/381 | Loss: 0.4251
2237.4s	193	  Train loss: 0.2744
2237.4s	194	  Val loss:   0.4791
2237.4s	195	  Val F1 @0.5: 0.8000
2276.6s	196	Fold 4 done. Best F1 (val): 0.8010
2276.6s	198	========== Fold 5 / 5 ==========
2277.0s	205	Fold 5 — Epoch 1/3
2317.3s	206	  Fold 5 | Epoch 1 | Step 100/381 | Loss: 0.5367
2357.5s	207	  Fold 5 | Epoch 1 | Step 200/381 | Loss: 0.0840
2398.1s	208	  Fold 5 | Epoch 1 | Step 300/381 | Loss: 0.5050
2443.3s	209	  Train loss: 0.4879
2443.3s	210	  Val loss:   0.4000
2443.3s	211	  Val F1 @0.5: 0.8013
2443.3s	212	  🔥 New best F1 for fold 5: 0.8013
2443.3s	214	Fold 5 — Epoch 2/3
2483.6s	215	  Fold 5 | Epoch 2 | Step 100/381 | Loss: 0.3885
2524.1s	216	  Fold 5 | Epoch 2 | Step 200/381 | Loss: 0.6384
2564.5s	217	  Fold 5 | Epoch 2 | Step 300/381 | Loss: 0.2853
2609.6s	218	  Train loss: 0.3489
2609.6s	219	  Val loss:   0.4084
2609.6s	220	  Val F1 @0.5: 0.8047
2609.6s	221	  🔥 New best F1 for fold 5: 0.8047
2609.6s	223	Fold 5 — Epoch 3/3
2650.0s	224	  Fold 5 | Epoch 3 | Step 100/381 | Loss: 0.2447
2690.4s	225	  Fold 5 | Epoch 3 | Step 200/381 | Loss: 0.3264
2730.7s	226	  Fold 5 | Epoch 3 | Step 300/381 | Loss: 0.3286
2775.7s	227	  Train loss: 0.2758
2775.7s	228	  Val loss:   0.4453
2775.7s	229	  Val F1 @0.5: 0.8038
2814.7s	230	Fold 5 done. Best F1 (val): 0.8047
2814.7s	232	========== OOF Performance & Threshold Tuning ==========
2814.7s	233	Best OOF F1: 0.8072 at threshold 0.59
2814.7s	235	Saved submission to: submission.csv`;

const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export const parseLogs = (rawInput: string): { parsedLines: ParsedLine[]; metrics: MetricData[]; stats: GlobalStats } => {
  const lines = rawInput.split('\n');
  const parsedLines: ParsedLine[] = [];
  const metrics: MetricData[] = [];
  const stats: GlobalStats = {};

  let currentFold = 0;
  let currentEpoch = 0;

  lines.forEach((line, index) => {
    // Basic cleanup
    let cleanContent = line.replace(ANSI_REGEX, '').trim();
    
    // Extract timestamp
    const timeMatch = cleanContent.match(/^(\d+(\.\d+)?)s/);
    const timestamp = timeMatch ? parseFloat(timeMatch[1]) : 0;
    stats.duration = timestamp; // Keep tracking last timestamp as duration

    let messageContent = cleanContent;
    if (timeMatch) {
       messageContent = messageContent.substring(timeMatch[0].length).trim();
       const indexMatch = messageContent.match(/^\d+\s+(.*)/);
       if (indexMatch) {
         messageContent = indexMatch[1];
       }
    }

    // Heuristics for "Relevant" lines (Folds)
    const isFoldHeader = /Fold \d+/.test(messageContent) || /========== Fold \d+/.test(messageContent);
    const isStepMetric = /Fold \d+ \| Epoch \d+ \| Step/.test(messageContent);
    const isEpochSummary = /Train loss:|Val loss:|Val F1|Best F1|OOF/.test(messageContent);
    const isSubmission = /Saved submission/.test(messageContent);
    
    // Filter noise
    const isNoise = /━/.test(messageContent) || 
                    /Debugger warning/.test(messageContent) || 
                    /pip's dependency/.test(messageContent) || 
                    /Using device/.test(messageContent) || 
                    /Note:/.test(messageContent) || 
                    /\[\?25/.test(line);

    const isRelevant = !isNoise && (isFoldHeader || isStepMetric || isEpochSummary || isSubmission);

    parsedLines.push({
      id: `line-${index}`,
      timestamp,
      content: messageContent,
      raw: line,
      isRelevant,
    });

    if (isRelevant) {
      // Update Context
      const foldMatch = messageContent.match(/Fold (\d+)/);
      if (foldMatch) {
        currentFold = parseInt(foldMatch[1], 10);
      }
      
      const epochMatch = messageContent.match(/Epoch (\d+)/);
      if (epochMatch) {
        currentEpoch = parseInt(epochMatch[1], 10);
      }

      // OOF Stats
      if (messageContent.includes('Best OOF F1')) {
        const oofMatch = messageContent.match(/Best OOF F1: ([\d.]+)/);
        const threshMatch = messageContent.match(/threshold ([\d.]+)/);
        if (oofMatch) stats.oofF1 = parseFloat(oofMatch[1]);
        if (threshMatch) stats.bestThreshold = parseFloat(threshMatch[1]);
      }

      // Step Loss
      const stepMatch = messageContent.match(/Step (\d+)\/\d+ \| Loss: ([\d.]+)/);
      if (stepMatch) {
        metrics.push({
          timestamp,
          fold: currentFold,
          epoch: currentEpoch,
          step: parseInt(stepMatch[1], 10),
          loss: parseFloat(stepMatch[2]),
          type: 'step'
        });
      }

      // Epoch Summary
      if (messageContent.includes('Train loss:')) {
         const match = messageContent.match(/Train loss:\s*([\d.]+)/);
         if (match) {
             metrics.push({
              timestamp,
              fold: currentFold,
              epoch: currentEpoch,
              step: 0,
              loss: parseFloat(match[1]),
              type: 'epoch_end'
            });
         }
      }

      // Val Loss
      if (messageContent.includes('Val loss:')) {
         const match = messageContent.match(/Val loss:\s*([\d.]+)/);
         if (match) {
             const lastMetric = metrics[metrics.length - 1];
             if (lastMetric && lastMetric.type === 'epoch_end' && lastMetric.fold === currentFold && lastMetric.epoch === currentEpoch) {
                 lastMetric.valLoss = parseFloat(match[1]);
             }
         }
      }

      // Val F1
      if (messageContent.includes('Val F1')) {
         const match = messageContent.match(/Val F1.*:\s*([\d.]+)/);
         if (match) {
             const lastMetric = metrics[metrics.length - 1];
             if (lastMetric && lastMetric.type === 'epoch_end' && lastMetric.fold === currentFold && lastMetric.epoch === currentEpoch) {
                 lastMetric.valF1 = parseFloat(match[1]);
             }
         }
      }
    }
  });

  return { parsedLines, metrics, stats };
};
