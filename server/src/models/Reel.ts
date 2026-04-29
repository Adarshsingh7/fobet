import mongoose, { Schema, Document } from 'mongoose';

export interface IReel extends Document {
  runId: mongoose.Types.ObjectId;
  inputUrl?: string;
  instagramId?: string;
  shortCode?: string;
  type?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  url?: string;
  commentsCount?: number;
  firstComment?: string;
  latestComments?: any[];
  dimensionsHeight?: number;
  dimensionsWidth?: number;
  displayUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  likesCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  timestamp?: Date;
  ownerFullName?: string;
  ownerUsername?: string;
  ownerId?: string;
  productType?: string;
  videoDuration?: number;
  isCommentsDisabled?: boolean;
  transcript?: string;
}

const ReelSchema: Schema = new Schema({
  runId: { type: Schema.Types.ObjectId, ref: 'Run', required: true },
  inputUrl: { type: String },
  instagramId: { type: String },
  shortCode: { type: String },
  type: { type: String },
  caption: { type: String },
  hashtags: [{ type: String }],
  mentions: [{ type: String }],
  url: { type: String },
  commentsCount: { type: Number },
  firstComment: { type: String },
  latestComments: [Schema.Types.Mixed],
  dimensionsHeight: { type: Number },
  dimensionsWidth: { type: Number },
  displayUrl: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  likesCount: { type: Number },
  videoViewCount: { type: Number },
  videoPlayCount: { type: Number },
  timestamp: { type: Date },
  ownerFullName: { type: String },
  ownerUsername: { type: String },
  ownerId: { type: String },
  productType: { type: String },
  videoDuration: { type: Number },
  isCommentsDisabled: { type: Boolean },
  transcript: { type: String }
}, { strict: false, timestamps: true }); // strict: false allows for missing/extra fields without schema errors

export default mongoose.model<IReel>('Reel', ReelSchema);
