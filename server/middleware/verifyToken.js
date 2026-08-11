import jwt from "jsonwebtoken";

function verifyToken(req, res, next){
    // checking the token
    const token = req.cookies.token
    if (!token){
        return res.status(401).json({message:"Unauthorized: No token provided"})
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode;
        next()
    } catch (error) {
        res.status(403).json({ message: "Token has been Expired" });
    }
}
export default verifyToken