import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 60000, // 60 seconds
            socketTimeoutMS: 60000, // 60 seconds
            connectTimeoutMS: 60000, // 60 seconds
            maxPoolSize: 5,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            w: 'majority'
        });
        console.log(`✅ Connected to DB: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error connecting to DB:', error.message);
        console.error('Please check your MONGO_URI in .env file');
        console.error('Make sure your internet connection is stable');
        process.exit(1); // Exit the process on DB connection failure
    }
};

export default connectDB;

