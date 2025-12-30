import { connectDB } from "../db/dbConnect";
import { UserModel } from "../model/dataModes";
import bcrypt from "bcrypt";
import User from "../db/model/userModel";
import { sign } from "jsonwebtoken";

export const createUserService=async(user:UserModel)=>{
    if(!user.email || !user.password){
        return {success: false, data:null}
    }
    
    await connectDB();
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        if(existingUser) {
            return {success: false, data: null, message: "User already exists"};
        }

        // Hash password
        const hashedPass = await bcrypt.hash(user.password, 10);
        
        // Create and save new user
        const newUser = new User({
            email: user.email,
            password: hashedPass,
            name: user.name
        });
        
        const savedUser = await newUser.save();
        
        return {success: true, data: savedUser};
    } catch (error) {
        console.error("Error creating user:", error);
        return {success: false, data: null, message: "Error creating user"};
    }
}

export const getUserService=async(user:UserModel)=>{
    if(!user.email || !user.password){
        return {success: false, data:null}
    }
    await connectDB();
    
    //search for user in db
    const userExist = await User.findOne({
        email: user.email
    })

    if(!userExist){
        return {success: false, data: null, message: "User does not exist"};
    }
    
    const isPasswordCorrect = await bcrypt.compare(user.password, userExist.password);

    if(!isPasswordCorrect){
        return {success: false, data: null, message: "Email or password is incorrect"};
    }

    const token = sign({ 
        id: userExist._id, 
        email: userExist.email, 
        name: userExist.name 
    }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });

    const {password, ...safeUser} = userExist.toObject();

    const data = {
        token,
        user: safeUser
    }

    return {success: true, data, message: "Login successful"};

}

export const getAllUserService = async () => {
    await connectDB();
    
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        return { success: true, data: users, message: "Users fetched successfully"  };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, data: null, message: "Error fetching users" };
    }
}
