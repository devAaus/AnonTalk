import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

// Handler for the GET request
export async function GET(request: Request) {
   // Connect to the database
   await dbConnect();

   // Get the current session
   const session = await getServerSession(authOptions);
   const user: User = session?.user as User;

   // Check if the user is authenticated
   if (!session || !session.user) {
      return Response.json(
         {
            success: false,
            message: "Not authenticated",
         },
         { status: 401 }
      );
   }

   // Convert the user's ID to a mongoose ObjectId
   const userId = new mongoose.Types.ObjectId(user._id);

   try {
      // Aggregate the user's messages, sorting them by creation date in descending order
      const user = await UserModel.aggregate([
         { $match: { _id: userId } }, // Match the user by ID
         { $unwind: "$messages" }, // Unwind the messages array
         { $sort: { "messages.createdAt": -1 } }, // Sort messages by creation date (most recent first)
         { $group: { _id: "$_id", messages: { $push: "$messages" } } }, // Group messages back together
      ]);

      // If the user is not found or has no messages, return an error
      if (!user || user.length === 0) {
         return Response.json(
            {
               success: false,
               message: "User not found",
            },
            { status: 401 }
         );
      }

      // If successful, return the sorted messages
      return Response.json(
         {
            success: true,
            messages: user[0].messages
         },
         { status: 200 }
      );

   } catch (error) {
      // Log any unexpected errors and return a server error response
      console.log("An unexpected error occurred", error);
      return Response.json(
         {
            success: false,
            message: "An unexpected error occurred",
         },
         { status: 500 }
      );
   }
}