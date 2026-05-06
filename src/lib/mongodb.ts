import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경변수를 설정해주세요.');
}

declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let promise = global._mongoosePromise;

export async function connectDB() {
  if (cached) return cached;

  if (!promise) {
    promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => {
      cached = m;
      global._mongooseConn = m;
      return m;
    });
    global._mongoosePromise = promise;
  }

  cached = await promise;
  return cached;
}
