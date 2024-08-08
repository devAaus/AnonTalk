import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

// Handler for the POST request
export async function POST(request: Request) {
   // Connect to the database
   await dbConnect();

   // Extract the username and content from the request body
   const { username, content } = await request.json();

   try {
      // Find the user by username
      const user = await UserModel.findOne({ username });

      // If the user is not found, return a 404 error
      if (!user) {
         return Response.json(
            {
               success: false,
               message: "User not found",
            },
            { status: 404 }
         );
      }

      // Check if the user is accepting messages
      if (!user.isAcceptingMessage) {
         return Response.json(
            {
               success: false,
               message: "User is not accepting messages",
            },
            { status: 403 }
         );
      }

      // Create a new message with the content and current date
      const newMessage = {
         content,
         createdAt: new Date(),
      };

      // Add the new message to the user's messages array
      user.messages.push(newMessage as Message);

      // Save the updated user document
      await user.save();

      // If successful, return a success message
      return Response.json(
         {
            success: true,
            message: "Message sent successfully",
         },
         { status: 200 }
      );

   } catch (error) {
      // Log any errors that occurred and return a server error response
      console.log("Error sending message:", error);
      return Response.json(
         {
            success: false,
            message: "Internal server error",
         },
         { status: 500 }
      );
   }
}