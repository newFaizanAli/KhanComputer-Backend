const express = require('express')
const { db } = require('../db')
const { users } = require('../schemas')
const { eq, ne } = require('drizzle-orm')
const { protect } = require('../middleware/auth')
const { hashPassword } = require('../utilities/functions')

const app = express()

app.get('/', protect, async (req, res) => {
    try {


        const allUsers = await db.select().from(users).where(
            ne(users.id, req.user.id) // exclude current user
        )

        res.json({ success: true, data: allUsers })

    }
    catch (e) {
        console.error(e.message)
    }
})


app.post('/', protect, async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.json({
                success: false,
                message: "Name, email, and password are required"
            })
        }

        const hashedPassword = await hashPassword({ password })

        const [newUser] = await db.insert(users).values({
            name,
            email,
            role,
            password: hashedPassword,
        }).returning()

        res.json({
            success: true,
            message: "User added successfully",
            data: newUser
        })

    } catch (e) {
        console.error(e.message)
        res.json({ success: false, message: 'Server Error' })
    }
})

app.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;



        const [updateUser] = await db.update(users).set({
            ...(name && { name }),
            ...(email && { email }),
            ...(role && { role }),
        }).where(eq(users.id, id)).returning();

        if (!updateUser) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: updateUser
        });

    }
    catch (e) {
        console.error(e.message)
    }
})

module.exports = app