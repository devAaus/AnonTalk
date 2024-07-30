import mongoose from "mongoose";

// Define a type for the connection object, which has an optional property isConnected
type ConnectionObject = {
    isConnected?: number
}

// Initialize the connection object
const connection: ConnectionObject = {}

const dbConnect = async (): Promise<void> => {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

        connection.isConnected = db.connections[0].readyState

        console.log("Connected to database");

    } catch (error) {
        console.log("Error connecting to database", error);

        // Exit the process with a failure code
        process.exit(1)
    }
}

export default dbConnect;