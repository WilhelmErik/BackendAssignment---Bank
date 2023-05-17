import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

// Function to generate refreshh token
export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET);
}

// Function to validate token
export function verifyAccessToken(req, res, next) {
  console.log("verifying access, from tokens.js");
  const authHead = req.headers.authorization;
  console.log(authHead, "Auth head ");
  if (authHead) {
    const token = authHead.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = user.userId;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid access token" });
    }
  } else {
    return res.status(401).json({ message: "No access token provided" });
  }
}
// Function to validate token
export async function verifyRefreshToken(req, res, next) {
  console.log("verifying refresh");
  const authHead = req.headers.authorization;
  if (authHead) {
    const token = authHead.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      try {
        let rToken = await usersCollection.findOne({ refreshToken: token });
        if (!rToken) {
          return res
            .status(403)
            .json({ message: "Invalid / Refresh token not found" });
        }
      } catch (dberr) {
        return res.status(500).json({ message: "Internal server error" });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } else {
    return res.status(401).json({ message: "No access token provided" });
  }
}
