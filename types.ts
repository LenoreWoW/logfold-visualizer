export interface ParsedLine {
  id: string;
  timestamp: number;
  content: string;
  raw: string;
  isRelevant: boolean;
}

export interface MetricData {
  timestamp: number;
  fold: number;
  epoch: number;
  step: number;
  loss?: number;
  valLoss?: number;
  valF1?: number;
  type: 'step' | 'epoch_end' | 'fold_start' | 'other';
}

export interface GlobalStats {
  oofF1?: number;
  bestThreshold?: number;
  duration?: number;
}

export enum SlideType {
  Intro = 'INTRO',
  Metrics = 'METRICS',
  Folds = 'FOLDS',
  Terminal = 'TERMINAL',
  Code = 'CODE',
  Demo = 'DEMO',
  Story = 'STORY',
}
