import mongoose, { Schema, Document } from 'mongoose';

export interface IScript extends Document {
  analysisId: mongoose.Types.ObjectId;
  runId: mongoose.Types.ObjectId;
  topic: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  viralityScore: number;
  psychTrigger: string;
  timestamp: Date;
}

const ScriptSchema: Schema = new Schema({
  analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', required: true },
  runId: { type: Schema.Types.ObjectId, ref: 'Run', required: true },
  topic: { type: String, required: true },
  hook: { type: String, required: true },
  script: { type: String, required: true },
  caption: { type: String },
  hashtags: [{ type: String }],
  viralityScore: { type: Number },
  psychTrigger: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const Script = mongoose.model<IScript>('Script', ScriptSchema);
