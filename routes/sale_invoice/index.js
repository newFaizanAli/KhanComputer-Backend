const express = require("express");
const router = express.Router();
const { db } = require("../../db");
const { sale_invoices, customers, sale_invoice_items, quotations } = require("../../schemas");
const { eq, sql } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");


async function generateSaleInvoiceCode() {
    // Fetch the latest invoice
    const lastInvoice = await db
        .select({ code: sale_invoices.code })
        .from(sale_invoices)
        .orderBy(sql`${sale_invoices.id} DESC`)
        .limit(1);

    let nextNumber = 1;
    if (lastInvoice.length > 0) {
        const lastCode = lastInvoice[0].code; // e.g., "SI-5"
        const match = lastCode.match(/SI-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    return `SI-${nextNumber}`;
}


// quotation items

router.use('/item', require('./items'))

router.use("/preview", require("./preview"));


const invoiceWithCustomerQuery = (condition) => {
    let query = db
        .select({
            id: sale_invoices.id,
            code: sale_invoices.code,
            date: sale_invoices.date,
            notes: sale_invoices.notes,
            discount: sale_invoices.discount,
            gst: sale_invoices.gst,
            order_reference_no: sale_invoices.order_reference_no,
            customerId: customers.id,
            customerName: customers.name,
            quotationId: quotations.id,
            quotationCode: quotations.code,
            totalAmount: sql`COALESCE(SUM(${sale_invoice_items.total})::int, 0)`
        })
        .from(sale_invoices)
        .leftJoin(customers, eq(sale_invoices.customerId, customers.id)) // <-- FIXED
        .leftJoin(quotations, eq(sale_invoices.quotationId, quotations.id))
        .leftJoin(sale_invoice_items, eq(sale_invoices.id, sale_invoice_items.saleInvoiceId))
        .groupBy(
            sale_invoices.id,
            customers.id,
            customers.name,
            quotations.id,
            quotations.code
        );

    if (condition) {
        query = query.where(condition);
    }

    return query;
};

router.get('/', protect, async (req, resp) => {
    try {
        const allSaleInvoices = await invoiceWithCustomerQuery();

        resp.json({ success: true, data: allSaleInvoices })

    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        resp.json({ success: false, message: 'Internal Server Error' });
    }
})


router.post('/', protect, async (req, res) => {
    try {

        const { customerId, gst, discount, notes, order_reference_no, quotationId, date } = req.body;
        const { store_id } = req.user;



        if (store_id === null) {
            return res.json({ success: false, message: 'Add store information first' });
        }


        const code = await generateSaleInvoiceCode();


        const [newInvoice] = await db.insert(sale_invoices).values({
            code: code,
            customerId: customerId,
            storeId: store_id,
            gst: gst,
            discount: discount,
            notes: notes,
            quotationId: quotationId,
            order_reference_no: order_reference_no,
            date: date
                ? new Date(date + "T00:00:00.000Z")
                : new Date()
        }).returning();

        const [invoice] = await invoiceWithCustomerQuery(
            eq(sale_invoices.id, newInvoice.id)
        );

        res.json({ data: invoice, success: true });

    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})

// ── ✅ NEW: POST /sale-invoices/combined ──────────────────────────────────────────
// Creates a invoice + all its items in a single .
// Body: { customerId, discount, gst, date, notes, storeId, order_reference_no,
//  items: [{ saleInvoiceId, description, quantity, uom, price, gst, discount, total, notes }] }

router.post('/combined', protect, async (req, res) => {


    const { store_id } = req.user;

    if (store_id === null) {
        return res.json({ success: false, message: 'Add store information first' });
    }


    if (!customerId) {
        return res.json({ success: false, message: "Customer is required" });
    }



    if (!Array.isArray(items) || items.length === 0) {
        return res.json({ success: false, message: "At least one sale item is required" });
    }

    for (const [i, item] of items.entries()) {
        if (!item.description) {
            return res.json({ success: false, message: `Item #${i + 1}: description is required` });
        }
        if (!item.quantity || item.quantity < 1) {
            return res.json({ success: false, message: `Item #${i + 1}: quantity must be at least 1` });
        }
        if (item.price === undefined || item.price < 0) {
            return res.json({ success: false, message: `Item #${i + 1}: price is required` });
        }
    }

    try {

        const code = await generateSaleInvoiceCode();

        // 1️⃣ Create the invoice
        const [newInvoice] = await db
            .insert(sale_invoices)
            .values({
                code,
                customerId,
                storeId: store_id,
                gst,
                quotationId,
                discount,
                notes,
                order_reference_no,
                date: date ? new Date(date) : new Date(),
            })
            .returning();

        // 2️⃣ Prepare items for insertion
        const itemRows = items.map(item => {
            const itemTotal = (item.price * item.quantity) - (item.discount || 0) + (item.gst || 0);
            return {
                saleInvoiceId: newInvoice.id,
                description: item.description,
                quantity: item.quantity,
                uom: item.uom,
                price: item.price,
                discount: item.discount || 0,
                gst: item.gst || 0,
                total: itemTotal,
                notes: item.notes || "",
            };
        });

        // 3️⃣ Insert all items
        const insertedItems = await db
            .insert(sale_invoice_items)
            .values(itemRows)
            .returning();

        const [fullInvoice] = await invoiceWithCustomerQuery(
            eq(sale_invoices.id, newInvoice.id)
        );

        // ✅ Response
        return res.json({
            success: true,
            message: "Sale invoice created successfully",
            data: {
                invoice: fullInvoice,
                items: insertedItems,
            },
        });

    } catch (error) {
        console.error('Error creating invoice:', error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {

        const { id } = req.params;
        const { customerId, gst, discount, notes, order_reference_no, date, quotationId, storeId } = req.body;



        // Fetch the current invoice to check its status
        const [existingInvoice] = await db
            .select()
            .from(sale_invoices)
            .where(eq(sale_invoices.id, Number(id)));

        if (!existingInvoice) {
            return res.json({
                success: false,
                message: 'Invoice not found'
            });
        }


        const [updatedInvoice] = await db
            .update(sale_invoices)
            .set({
                customerId,
                gst,
                discount,
                notes,
                quotationId,
                order_reference_no: order_reference_no,
                date: date ? new Date(date) : new Date(),
                storeId
            })
            .where(eq(sale_invoices.id, Number(id)))
            .returning();

        if (!updatedInvoice) {
            return res.json({
                success: false,
                message: 'Invoice not found'
            });
        }

        const [invoice] = await invoiceWithCustomerQuery(eq(sale_invoices.id, updatedInvoice.id));

        res.json({ data: invoice, success: true });

    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.get('/search/:code', protect, async (req, res) => {
    const { code } = req.params;
    try {

        const invoices = await db
            .select({
                id: sale_invoices.id,
                code: sale_invoices.code
            })
            .from(sale_invoices)
            .where(eq(sale_invoices.code, code));

        res.json({ data: invoices, success: true });
    } catch (error) {
        console.error('Error searching for invoice:', error);
        res.json({ error: 'Internal Server Error' });
    }
});

// delete invoice

router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.json({ success: false, message: 'Invoice ID is required' });
        }
        const [deletedInvoice] = await db.delete(sale_invoices).where(eq(sale_invoices.id, id)).returning()
        if (!deletedInvoice) {
            return res.json({ message: 'Invoice not found', success: false });
        }
        res.json({ success: true, message: 'Invoice deleted successfully' });
    }
    catch (err) {
        console.error('Error fetching invoices:', err);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router