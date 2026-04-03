// routes/store.js
const express = require("express");
const { db } = require("../db");
const { store_info } = require("../schemas");
const { eq } = require("drizzle-orm");

const app = express()

// Get store info (first/default)
app.get("/", async (req, res) => {
    try {


        const [store] = await db.select().from(store_info).limit(1);

        res.json({ success: true, data: store || null });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
});

// Add store info (first time)
app.post("/", async (req, res) => {
    try {
        const [newStore] = await db.insert(store_info).values(req.body).returning();
        res.json({ success: true, data: newStore, message: "Store added successfully" });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
});

// Update store info
app.put("/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const [updatedStore] = await db
            .update(store_info)
            .set(req.body)
            .where(eq(store_info.id, Number(id)))
            .returning();

        if (!updatedStore) return res.json({ success: false, message: "Store not found" });

        res.json({ success: true, data: updatedStore, message: "Store updated successfully" });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
});

module.exports = app;