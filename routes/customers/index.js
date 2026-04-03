const express = require('express');
const router = express.Router();
const { eq, ilike } = require('drizzle-orm');
const { customers } = require('../../schemas');
const { db } = require('../../db');
const { protect } = require('../../middleware/auth');


// router.use('/payments', require('./payments'))

// Get all customers
router.get('/', protect, async (req, res) => {
    try {


        const allCustomers = await db.select().from(customers);
        res.json({ data: allCustomers, success: true });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.json({ error: 'Internal Server Error' });
    }
});


// Create a new customer
router.post('/', protect, async (req, res) => {
    const { name, email, phone, address, gst, ntn } = req.body;
    try {

        if (!name) {
            return res.json({ message: 'Name is required', success: false });
        }

        const [newCustomer] = await db.insert(customers).values({ name, email, phone, address, gst, ntn }).returning();
        res.json({ data: newCustomer, success: true, message: 'customer created successfully' });

    } catch (error) {
        console.error('Error creating customer:', error);
        response.json({ error: 'Internal Server Error' });
    }
});


// Update a customer
router.put('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        if (!name) {
            return res.json({ message: 'Name is required', success: false });
        }
        const [updatedCustomer] = await db.update(customers).set({
            ...(req.body && { ...req.body })
        }).where(eq(customers.id, id)).returning();

        if (!updatedCustomer) {
            return res.json({ message: 'customer not found', success: false });
        }
        res.json({ data: updatedCustomer, success: true, message: 'customer updated successfully' });
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.json({ error: 'Internal Server Error' });
    }
});



// Search for a customer
router.get('/search/:name', protect, async (req, res) => {
    const { name } = req.params;
    try {

        const searched_customers = await db.select({
            id: customers.id,
            name: customers.name
        }).from(customers).where(ilike(customers.name, `%${name}%`)).limit(10);

        res.json({ data: searched_customers, success: true });
    } catch (error) {
        console.error('Error searching for customer:', error);
        res.json({ error: 'Internal Server Error' });
    }
});



// // Delete a customer
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCustomer = await db.delete(customers).where(eq(customers.id, id)).returning()
        if (!deletedCustomer.length) {
            return res.json({ message: 'customer not found', success: false });
        }
        res.json({ data: deletedCustomer[0], success: true, message: 'customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.json({ error: 'Internal Server Error' });
    }
});

module.exports = router;