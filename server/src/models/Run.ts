import mongoose, { Schema, Document } from 'mongoose';

export interface IRun extends Document {
  name?: string;
  timestamp: Date;
  totalItems: number;
  status: 'pending' | 'completed' | 'failed';
  nicheMetadata?: Record<string, number>;
  error?: string;
}

const RunSchema: Schema = new Schema({
  name: { type: String, default: () => `Run ${new Date().toLocaleDateString()}` },
  timestamp: { type: Date, default: Date.now },
  totalItems: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  nicheMetadata: { type: Schema.Types.Mixed },
  error: { type: String }
});

export const Run = mongoose.model<IRun>('Run', RunSchema);

export interface IAnalysis extends Document {
  runId: mongoose.Types.ObjectId;
  hooks: string[];
  retensionAnal: string[];
  topicGapMap: string[];
  patternRecogonition: string[];
  competitorIntelAnal: string[];
  contentStrategy: string[];
  importantHastags: string[];
  importantKeywords: string[];
  timestamp: Date;
}

const AnalysisSchema: Schema = new Schema({
  runId: { type: Schema.Types.ObjectId, ref: 'Run', required: true, unique: true },
  hooks: [String],
  retensionAnal: [String],
  topicGapMap: [String],
  patternRecogonition: [String],
  competitorIntelAnal: [String],
  contentStrategy: [String],
  importantHastags: [String],
  importantKeywords: [String],
  timestamp: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
