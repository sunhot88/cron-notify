import mongoose, { type InferSchemaType, type Model } from "mongoose";

const timeLogSchema = new mongoose.Schema(
  {
    // 打 API 的時間
    timestamp: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

export type TimeLogDoc = InferSchemaType<typeof timeLogSchema>;

const TimeLog: Model<TimeLogDoc> =
  (mongoose.models.TimeLog as Model<TimeLogDoc> | undefined) ??
  mongoose.model<TimeLogDoc>("TimeLog", timeLogSchema);

export default TimeLog;
