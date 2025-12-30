import { verify } from "jsonwebtoken"

export const validateToken = (token: string) => {
    try {
        const decoded = verify(token, process.env.JWT_SECRET || "secret");
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, data: null, message: "Invalid or expired token" };
    }
}
