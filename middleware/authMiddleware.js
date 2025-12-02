import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-senha");

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
  }

  res.status(401).json({ message: "Não autorizado" });
};
