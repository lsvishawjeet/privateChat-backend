import { UserModel } from "../model/dataModes";
import { createUserService, getUserService, getAllUserService } from "../service/userService";
import { Request, Response } from "express";

export const createUserController = async (req: Request, res: Response) => {
    const {email, name, password} = req.body;

    if(!email || !password || !name){
        return res.status(400).json({success: false, data: null, message: "Missing required fields"});
    }
    const user = {email, name, password};
    const result = await createUserService(user);
    
    return res.status(result.success ? 201 : 400).json(result);
}

export const getUserController=async(req:Request, res:Response)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({success: false, data: null, message: "Missing required fields"})
    }
    const user = {email, password, name: ""};
    const result = await getUserService(user);
    
    return res.status(result.success ? 200 : 400).json(result);
}

export const getAllUsersController = async (req: Request, res: Response) => {
    const result = await getAllUserService();
    return res.status(result.success ? 200 : 400).json(result);
}