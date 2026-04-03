const express = require("express");
const { db } = require("../../db");
const { quotations, quotation_items } = require("../../schemas");
const { eq } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");
const router = express.Router();


const itemWithQuotationQuery = (condition) => {

    let query = db
        .select({
            id: quotation_items.id,
            description: quotation_items.description,
            quantity: quotation_items.quantity,
            price: quotation_items.price,
            total: quotation_items.total,
            uom: quotation_items.uom,
            discount: quotation_items.discount,
            gst: quotation_items.gst,
            notes: quotation_items.notes,

            quotationId: quotations.id,
            quotationCode: quotations.code,
            quotationDate: quotations.date,

        })
        .from(quotation_items)
        .leftJoin(quotations, eq(quotation_items.quotationId, quotations.id))

    if (condition) {
        query = query.where(condition);
    }

    return query;
};


router.get('/', protect, async (req, resp) => {
    try {
        const allItems = await itemWithQuotationQuery();
        resp.json({ success: true, data: allItems })
    }
    catch (error) {
        console.error('Error fetching items:', error);
        resp.json({ success: false, message: 'Internal Server Error' });
    }
})


router.get('/quotation/:quotationId', protect, async (req, res) => {
    const { quotationId } = req.params;




    try {
        if (!quotationId) {
            return res.json({ success: false, message: 'Quotation ID is required' });
        }

        const quotationItems = await itemWithQuotationQuery(eq(quotations.id, parseInt(quotationId)));

        res.json({ data: quotationItems, success: true });
    }
    catch (error) {
        console.error('Error fetching product attributes:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.post('/', protect, async (req, res) => {
    try {

        const { quotationId, description, quantity, price, gst, discount, uom, total, notes } = req.body;

        const [newItems] = await db.insert(quotation_items).values({ quotationId, description, quantity, price, gst, discount, uom, total, notes }).returning();

        const [item] = await itemWithQuotationQuery(
            eq(quotation_items.id, newItems.id)
        );

        res.json({ data: item, success: true });

    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { quotationId, description, quantity, price, gst, discount, uom, total, notes } = req.body;



        if (total === undefined || !quotationId) {
            return res.json({
                success: false,
                message: "Fields are required"
            });
        }

        const [updatedItems] = await db
            .update(quotation_items)
            .set({
                ...(req.body && { ...req.body })
            })
            .where(eq(quotation_items.id, Number(id)))
            .returning();

        if (!updatedItems) {
            return res.json({
                success: false,
                message: 'Items not found'
            });
        }

        const [item] = await itemWithQuotationQuery(eq(quotation_items.id, updatedItems.id));

        res.json({ data: item, success: true });

    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.json({ success: false, message: 'Item ID is required' });
        }

        const [deletedItem] = await db.delete(quotation_items).where(eq(quotation_items.id, id)).returning()
        if (!deletedItem) {
            return res.json({ message: 'Item not found', success: false });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    }
    catch (err) {
        console.error('Error fetching items:', err);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


module.exports = router