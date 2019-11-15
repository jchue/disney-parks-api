import mongoose from 'mongoose';
import event from './event';

const connectDb = () => mongoose.connect(process.env.DBURL);
const models = { event };

export { connectDb };
export default models;
