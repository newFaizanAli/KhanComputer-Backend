const express = require('express')
const { eq } = require('drizzle-orm')
const { db } = require('../db')
const { protect } = require('../middleware/auth')
const { users } = require('../schemas')
const { hashPassword, comparePassword } = require('../utilities/functions')





const router = express.Router()

// 👉 Get logged-in user profile
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        // remove password before sending
        delete user.password

        res.json({ success: true, data: user })

    } catch (e) {
        console.error(e.message)
        res.status(500).json({ success: false, message: "Server error" })
    }
})


// 👉 Update profile (name, email)
router.put('/', protect, async (req, res) => {
    try {
        const userId = req.user.id
        const { name, email } = req.body

        const [updatedUser] = await db
            .update(users)
            .set({
                ...(name && { name }),
                ...(email && { email }),
            })
            .where(eq(users.id, userId))
            .returning()

        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" })
        }

        delete updatedUser.password

        res.json({
            success: true,
            message: "Profile updated",
            data: updatedUser
        })

    } catch (e) {
        console.error(e.message)
        res.status(500).json({ success: false, message: "Server error" })
    }
})


// 👉 Update password
router.put('/password', protect, async (req, res) => {
    try {
        const userId = req.user.id
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.json({
                success: false,
                message: "Both passwords are required"
            })
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))

        const isMatch = await comparePassword({
            password: currentPassword,
            hash: user.password
        })

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Current password is incorrect"
            })
        }

        const hashedPassword = await hashPassword({ password: newPassword })

        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId))

        res.json({
            success: true,
            message: "Password updated successfully"
        })

    } catch (e) {
        console.error(e.message)
        res.status(500).json({ success: false, message: "Server error" })
    }
})

module.exports = router