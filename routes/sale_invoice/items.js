const express = require("express");
const { db } = require("../../db");
const { sale_invoices, sale_invoice_items } = require("../../schemas");
const { eq } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");
const router = express.Router();


const itemWithInvoiceQuery = (condition) => {

    let query = db
        .select({
            id: sale_invoice_items.id,
            description: sale_invoice_items.description,
            quantity: sale_invoice_items.quantity,
            price: sale_invoice_items.price,
            total: sale_invoice_items.total,
            uom: sale_invoice_items.uom,
            discount: sale_invoice_items.discount,
            gst: sale_invoice_items.gst,
            notes: sale_invoice_items.notes,

            saleInvoiceId: sale_invoices.id,
            saleInvoiceCode: sale_invoices.code,
            saleInvoiceDate: sale_invoices.date,

        })
        .from(sale_invoice_items)
        .leftJoin(sale_invoices, eq(sale_invoice_items.saleInvoiceId, sale_invoices.id))

    if (condition) {
        query = query.where(condition);
    }

    return query;
};


router.get('/', protect, async (req, resp) => {
    try {
        const allItems = await itemWithInvoiceQuery();
        resp.json({ success: true, data: allItems })
    }
    catch (error) {
        console.error('Error fetching items:', error);
        resp.json({ success: false, message: 'Internal Server Error' });
    }
})


router.get('/sale-invoice/:saleInvoiceId', protect, async (req, res) => {
    const { saleInvoiceId } = req.params;

    try {
        if (!saleInvoiceId) {
            return res.json({ success: false, message: 'Sale ID is required' });
        }

        const saleItems = await itemWithInvoiceQuery(eq(sale_invoices.id, parseInt(saleInvoiceId)));

        res.json({ data: saleItems, success: true });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.post('/', protect, async (req, res) => {
    try {

        const { saleInvoiceId, description, quantity, price, gst, discount, uom, total, notes } = req.body;

        const [newItems] = await db.insert(sale_invoice_items).values({ saleInvoiceId, description, quantity, price, gst, discount, uom, total, notes }).returning();

        const [item] = await itemWithInvoiceQuery(
            eq(sale_invoice_items.id, newItems.id)
        );

        res.json({ data: item, success: true });

    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { saleInvoiceId, description, quantity, price, gst, discount, uom, total, notes } = req.body;


        if (total === undefined || !saleInvoiceId) {
            return res.json({
                success: false,
                message: "Fields are required"
            });
        }

        const [updatedItems] = await db
            .update(sale_invoice_items)
            .set({
                ...(req.body && { ...req.body })
            })
            .where(eq(sale_invoice_items.id, Number(id)))
            .returning();

        if (!updatedItems) {
            return res.json({
                success: false,
                message: 'Items not found'
            });
        }

        const [item] = await itemWithInvoiceQuery(eq(sale_invoice_items.id, updatedItems.id));

        res.json({ data: item, success: true });

    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.json({ success: false, message: 'Item ID is required' });
        }

        const [deletedItem] = await db.delete(sale_invoice_items).where(eq(sale_invoice_items.id, id)).returning()
        if (!deletedItem) {
            return res.json({ message: 'Item not found', success: false });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    }
    catch (err) {
        console.error('Error fetching items:', err);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router