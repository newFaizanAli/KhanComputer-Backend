
const express = require("express");
const router = express.Router();
const { db } = require("../../db");
const { letter_heads, store_info } = require("../../schemas");
const { eq } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");

router.get("/:id", protect, async (req, res) => {
    const { id } = req.params;

    try {
        const [letterhead] = await db
            .select()
            .from(letter_heads)
            .where(eq(letter_heads.id, Number(id)));

        if (!letterhead)
            return res.json({ success: false, message: "Letter head not found" });

        const [store] = letterhead.storeId
            ? await db.select().from(store_info).where(eq(store_info.id, letterhead.storeId))
            : [null];



        return res.json({
            success: true,
            data: { letterhead, store: store || null },
        });

    } catch (error) {
        console.error("Error fetching quotation preview data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;