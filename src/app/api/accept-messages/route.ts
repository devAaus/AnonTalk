import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

// Handler for the POST request
export async function POST(request: Request) {
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

   // Get the user ID from the session and the acceptMessages flag from the request body
   const userId = user._id;
   const { acceptMessages } = await request.json();

   try {
      // Update the user's acceptMessages setting in the database
      const updatedUser = await UserModel.findByIdAndUpdate(
         userId,
         { isAcceptingMessage: acceptMessages },
         { new: true }
      );

      // If the user could not be found or updated, return an error
      if (!updatedUser) {
         return Response.json(
            {
               success: false,
               message: "Error updating user settings",
            },
            { status: 401 }
         );
      }

      // If successful, return the updated user information
      return Response.json(
         {
            success: true,
            message: "User settings updated",
            updatedUser
         },
         { status: 200 }
      );

   } catch (error) {
      // Log any errors that occurred and return a server error response
      console.log("Error updating user settings", error);
      return Response.json(
         {
            success: false,
            message: "Error updating user settings",
         },
         { status: 500 }
      );
   }
}

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

   // Get the user ID from the session
   const userId = user._id;

   try {
      // Find the user in the database by their ID
      const foundUser = await UserModel.findById(userId);

      // If the user could not be found, return a not found error
      if (!foundUser) {
         return Response.json(
            {
               success: false,
               message: "User not found",
            },
            { status: 404 }
         );
      }

      // If successful, return the user's isAcceptingMessage setting
      return Response.json(
         {
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
         },
         { status: 200 }
      );

   } catch (error) {
      // Log any errors that occurred and return a server error response
      console.log("Error retrieving user settings", error);
      return Response.json(
         {
            success: false,
            message: "Error retrieving user settings",
         },
         { status: 500 }
      );
   }
}
