import mongoose from 'mongoose';

type ConnectionOject = {
    isConnected?: number;
};

const connection : ConnectionOject = {};

export async function connectDB() : Promise<void> {
    if (connection.isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string || '')
        connection.isConnected = db.connection.readyState;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

export default connectDB;