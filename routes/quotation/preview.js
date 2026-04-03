
const express = require("express");
const router = express.Router();
const { db } = require("../../db");
const { quotations, customers, store_info, quotation_items } = require("../../schemas");
const { eq } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");

router.get("/:id", protect, async (req, res) => {
    const { id } = req.params;

    try {
        const [quotation] = await db
            .select()
            .from(quotations)
            .where(eq(quotations.id, Number(id)));

        if (!quotation)
            return res.status(404).json({ success: false, message: "Quotation not found" });

        const [customer] = quotation.customerId
            ? await db.select().from(customers).where(eq(customers.id, quotation.customerId))
            : [null];

        const [store] = quotation.storeId
            ? await db.select().from(store_info).where(eq(store_info.id, quotation.storeId))
            : [null];

        const items = await db
            .select()
            .from(quotation_items)
            .where(eq(quotation_items.quotationId, Number(id)));

        return res.json({
            success: true,
            data: { quotation, customer: customer || null, store: store || null, items },
        });

    } catch (error) {
        console.error("Error fetching quotation preview data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;