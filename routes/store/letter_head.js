const express = require("express");
const router = express.Router();
const { db } = require("../../db");
const { letter_heads } = require("../../schemas");
const { eq, sql } = require("drizzle-orm");
const { protect } = require("../../middleware/auth");


router.use('/preview', require('./letter_head_preview'))

async function generateLetterHeadCode() {
    // Fetch the letter
    const lastLetter = await db
        .select({ code: letter_heads.code })
        .from(letter_heads)
        .orderBy(sql`${letter_heads.id} DESC`)
        .limit(1);

    let nextNumber = 1;
    if (lastLetter.length > 0) {
        const lastCode = lastLetter[0].code; // e.g., "LH-5"
        const match = lastCode.match(/LH-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    return `LH-${nextNumber}`;
}


const letterWithQuery = (condition) => {
    let query = db
        .select({
            id: letter_heads.id,
            code: letter_heads.code,
            name: letter_heads.name,
            storeId: letter_heads.storeId,
            issued_at: letter_heads.issued_at,
            notes: letter_heads.notes,
            header_text: letter_heads.header_text,
            footer_text: letter_heads.footer_text,
            default_body: letter_heads.default_body,
        })
        .from(letter_heads)


    if (condition) {
        query = query.where(condition);
    }

    return query;
};

router.get('/', protect, async (req, resp) => {
    try {
        const allLettters = await letterWithQuery();

        resp.json({ success: true, data: allLettters })

    }
    catch (error) {
        console.error('Error fetching letter heads:', error);
        resp.json({ success: false, message: 'Internal Server Error' });
    }
})


router.post('/', protect, async (req, res) => {
    try {

        const { name, header_text, footer_text, default_body, notes, issued_at } = req.body;
        const { store_id } = req.user;

        if (store_id === null) {
            return res.json({ success: false, message: 'Add store information first' });
        }


        const code = await generateLetterHeadCode();


        const [newLetter] = await db.insert(letter_heads).values({
            code: code,
            name: name,
            storeId: store_id,
            header_text: header_text,
            footer_text: footer_text,
            default_body: default_body,
            notes: notes,
            issued_at: issued_at
                ? new Date(issued_at + "T00:00:00.000Z")
                : new Date()
        }).returning();

        const [letter] = await letterWithQuery(
            eq(letter_heads.id, newLetter.id)
        );

        res.json({ data: letter, success: true });

    }
    catch (error) {
        console.error('Error fetching letter heads:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.put('/:id', protect, async (req, res) => {
    try {

        const { id } = req.params;
        const { name, header_text, footer_text, default_body, notes, issued_at, storeId } = req.body;

        // Fetch the current letter to check its status
        const [existingLetter] = await db
            .select()
            .from(letter_heads)
            .where(eq(letter_heads.id, Number(id)));

        if (!existingLetter) {
            return res.json({
                success: false,
                message: 'Letter head not found'
            });
        }


        const [updatedLetter] = await db
            .update(letter_heads)
            .set({
                name,
                header_text,
                footer_text,
                default_body,
                notes,
                issued_at: issued_at ? new Date(issued_at) : new Date(),
                storeId
            })
            .where(eq(letter_heads.id, Number(id)))
            .returning();

        if (!updatedLetter) {
            return res.json({
                success: false,
                message: 'Letter head not found'
            });
        }

        const [letter] = await letterWithQuery(eq(letter_heads.id, updatedLetter.id));

        res.json({ data: letter, success: true });

    }
    catch (error) {
        console.error('Error fetching letter heads:', error);
        res.json({ success: false, message: 'Internal Server Error' });
    }
})


router.get('/search/:code', protect, async (req, res) => {
    const { code } = req.params;
    try {

        const letters = await db
            .select({
                id: letter_heads.id,
                code: letter_heads.code
            })
            .from(letter_heads)
            .where(eq(letter_heads.code, code));

        res.json({ data: letters, success: true });
    } catch (error) {
        console.error('Error searching for letter head:', error);
        res.json({ error: 'Internal Server Error' });
    }
});

// delete letter head

router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.json({ success: false, message: 'Letter head ID is required' });
        }
        const [deletedLetter] = await db.delete(letter_heads).where(eq(letter_heads.id, id)).returning()
        if (!deletedLetter) {
            return res.json({ message: 'Letter head not found', success: false });
        }
        res.json({ success: true, message: 'Letter head deleted successfully' });
    }
    catch (err) {
        console.error('Error fetching letter heads:', err);
        res.json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router