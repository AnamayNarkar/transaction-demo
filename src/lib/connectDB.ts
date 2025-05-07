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
        // Make sure MONGODB_URI exists and has a default value if not set
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yardstick';
        
        // Add validation to ensure URI is not empty
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        // Connect with explicit options
        const db = await mongoose.connect(mongoURI, {
            // Add connection options if needed
        });
        
        connection.isConnected = db.connection.readyState;
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Rethrow the error to be handled by API route handlers
    }
}

export default connectDB;