
const jwt = require("jsonwebtoken");
const { users } = require('../schemas');
const { db } = require("../db");
const { eq } = require("drizzle-orm");
const { CONFIG } = require("../constant");

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, CONFIG.JWT_SECRET);

            // ✅ Get single user
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, decoded.id));

            if (!user) {
                return res.json({
                    success: false,
                    message: "User not found",
                    token_auth: false
                });
            }

            req.user = { ...user, store_id: decoded.store_id || null };


            return next();

        } catch (error) {
            console.error(error.message);
            return res.json({
                success: false,
                message: "Token invalid",
                token_auth: false
            });
        }
    }

    return res.json({
        success: false,
        message: "No token",
        token_auth: false
    });
};

module.exports = { protect };

