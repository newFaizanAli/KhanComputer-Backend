const express = require("express");
const router = express.Router();
const { db } = require("../../db");
const { quotations, customers, quotation_items } = require("../../schemas");
const { eq, sql, ilike } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");
const { parseDate } = require("../../utilities/functions");



router.use('/item', require('./items'))

router.use('/preview', require('./preview'))

async function generateQuotationCode() {
    // Fetch the latest quotation
    const lastQuotation = await db
        .select({ code: quotations.code })
        .from(quotations)
        .orderBy(sql`${quotations.id} DESC`)
        .limit(1);

    let nextNumber = 1;
    if (lastQuotation.length > 0) {
        const lastCode = lastQuotation[0].code; // e.g., "QU-5"
        const match = lastCode.match(/QU-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    return `QU-${nextNumber}`;
}

const quotationWithCustomerQuery = (condition) => {
    let query = db
        .select({
            id: quotations.id,
            code: quotations.code,
            date: quotations.date,
            valid_until: quotations.valid_until,
            notes: quotations.notes,
            discount: quotations.discount,
            gst: quotations.gst,
            customerId: customers.id,
            customerName: customers.name,
            totalAmount: sql`COALESCE(SUM(${quotation_items.total})::int, 0)`
        })
        .from(quotations)
        .leftJoin(customers, eq(quotations.customerId, customers.id)) // <-- FIXED
        .leftJoin(quotation_items, eq(quotations.id, quotation_items.quotationId))
        .groupBy(

            customers.id,
            customers.name,
            quotations.id

        );

    if (condition) {
        query = query.where(condition);
    }

    return query;
};

// quotation items



router.get('/', protect, async (req, resp) => {
    try {
        const allQuotations = await quotationWithCustomerQuery();

        resp.json({ success: true, data: allQuotations })

    }
    catch (error) {
        console.error('Error fetching quotations:', error);
        resp.json({ success: false, message: 'Internal Server Error' });
    }
})


router.post('/', protect, async (req, res) => {
    try {

        const { customerId, gst, discount, notes, valid_until, date } = req.body;
        const { store_id } = req.user;



        if (store_id === null) {
            return res.json({ success: false, message: 'Add store information first' });
        }


        const code = await generateQuotationCode();


        const [newQuotation] = await db.insert(quotations).values({
            code: code,
            customerId: customerId,
            storeId: store_id,
            gst: gst,
            discount: discount,
            notes: notes,
            valid_until: parseDate(valid_until),
            date: date
                ? new Date(date + "T00:00:00.000Z")
                : new Date()
        }).returning();

        const [quotation] = await quotationWithCustomerQuery(
            eq(quotations.id, newQuotation.id)
        );

        res.json({ data: quotation, success: true });

    }
    catch (error) {
        console.error('Error fetching quotations:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})

// ── ✅ NEW: POST /quotations/combined ──────────────────────────────────────────
// Creates a quotation + all its items in a single .
// Body: { customerId, discount, gst, date, notes, storeId, valid_until,
//  items: [{ quotationId, description, quantity, uom, price, gst, discount, total, notes }] }

router.post('/combined', protect, async (req, res) => {
    const { customerId, discount = 0, gst = 0, date, notes = '', valid_until, items } = req.body;

    const { store_id } = req.user;

    if (store_id === null) {
        return res.json({ success: false, message: 'Add store information first' });
    }


    if (!customerId) {
        return res.json({ success: false, message: "Customer is required" });
    }



    if (!Array.isArray(items) || items.length === 0) {
        return res.json({ success: false, message: "At least one quotation item is required" });
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

        const code = await generateQuotationCode();

        // 1️⃣ Create the quotation
        const [newQuotation] = await db
            .insert(quotations)
            .values({
                code,
                customerId,
                storeId: store_id,
                gst,
                discount,
                notes,
                valid_until: parseDate(valid_until),
                date: date ? new Date(date) : new Date(),
            })
            .returning();

        // 2️⃣ Prepare items for insertion
        const itemRows = items.map(item => {
            const itemTotal = (item.price * item.quantity) - (item.discount || 0) + (item.gst || 0);
            return {
                quotationId: newQuotation.id,
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
            .insert(quotation_items)
            .values(itemRows)
            .returning();

        const [fullQuotation] = await quotationWithCustomerQuery(
            eq(quotations.id, newQuotation.id)
        );

        // ✅ Response
        return res.json({
            success: true,
            message: "Quotation created successfully",
            data: {
                quotation: fullQuotation,
                items: insertedItems,
            },
        });

    } catch (error) {
        console.error('Error creating quotation:', error);
        return res.json({ success: false, message: 'Internal Server Error' });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {

        const { id } = req.params;
        const { customerId, gst, discount, notes, valid_until, date, storeId } = req.body;



        // Fetch the current quotation to check its status
        const [existingQuotation] = await db
            .select()
            .from(quotations)
            .where(eq(quotations.id, Number(id)));

        if (!existingQuotation) {
            return res.json({
                success: false,
                message: 'Quotation not found'
            });
        }


        const [updatedQuotation] = await db
            .update(quotations)
            .set({
                customerId,
                gst,
                discount,
                notes,
                // valid_until: valid_until && valid_until ? new Date(valid_until) : null,
                valid_until: parseDate(valid_until),
                date: date ? new Date(date) : new Date(),
                storeId
            })
            .where(eq(quotations.id, Number(id)))
            .returning();

        if (!updatedQuotation) {
            return res.json({
                success: false,
                message: 'Quotation not found'
            });
        }

        const [quotation] = await quotationWithCustomerQuery(eq(quotations.id, updatedQuotation.id));

        res.json({ data: quotation, success: true });

    }
    catch (error) {
        console.error('Error fetching quotations:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.get('/search/:code', protect, async (req, res) => {
    const { code } = req.params;
    try {

        const searched_quotations = await db.select({
            id: quotations.id,
            code: quotations.code
        }).from(quotations).where(ilike(quotations.code, `%${code}%`)).limit(10);



        res.json({ data: searched_quotations, success: true });
    } catch (error) {
        console.error('Error searching for quotation:', error);
        res.json({ error: 'Internal Server Error' });
    }
});

// delete quotation

router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.json({ success: false, message: 'Quotations ID is required' });
        }
        const [deletedQuotation] = await db.delete(quotations).where(eq(quotations.id, id)).returning()
        if (!deletedQuotation) {
            return res.json({ message: 'Quotation not found', success: false });
        }
        res.json({ success: true, message: 'Quotation deleted successfully' });
    }
    catch (err) {
        console.error('Error fetching quotations:', err);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router