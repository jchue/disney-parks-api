import mongoose from 'mongoose';
import event from './event';

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const connectDb = () => mongoose.connect(process.env.DBURL);
const models = { event };

export { connectDb };
export default models;
