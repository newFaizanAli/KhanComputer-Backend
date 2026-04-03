const express = require('express')
const { db } = require('../db')
const { users } = require('../schemas')
const { eq } = require('drizzle-orm')

const app = express()

app.get('/', async (req, res) => {
    try {

        const allUsers = await db.select().from(users)
        res.json({ success: true, data: allUsers })

    }
    catch (e) {
        console.error(e.message)
    }
})

app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, } = req.body;

        const [updateUser] = await db.update(users).set({
            ...(name && { name }),
            ...(email && { email }),
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