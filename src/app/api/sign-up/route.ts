import { sendVerificationEmail } from '@/helpers/sendVerificatioEmail';
import dbConnect from '@/lib/dbConnect';

import UserModel from '@/model/User'
import bcrypt from 'bcrypt';


export const POST = async (request: Request) => {
    await dbConnect();

    try {
        const { username, email, password } = await request.json()

        const existingUserVerirfiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerirfiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                { status: 400 }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email })
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "Email already exists"
                    },
                    { status: 400 }
                )
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.otp = otp
                existingUserByEmail.otpExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                otp,
                otpExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(email, username, otp)

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                { status: 500 }
            )
        }

        return Response.json(
            {
                success: true,
                message: "User registered successfully. Verification email sent"
            },
            { status: 201 }
        )

    } catch (error) {
        console.error("Error registering user", error);
        return Response.json(
            {
                succcess: false,
                message: "Error registering user"
            },
            { status: 500 }
        )
    }
}