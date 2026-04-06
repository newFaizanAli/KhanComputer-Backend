
const { pgTable, serial, varchar, boolean, integer, timestamp, text, numeric } = require('drizzle-orm/pg-core');

// users

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 100 }).notNull(),
});


const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    address: varchar('address', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 100 }).notNull(),
    gst: varchar('gst', { length: 100 }).notNull(),
    ntn: varchar('ntn', { length: 100 }).notNull(),
});


const store_info = pgTable("store_info", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    address: text("address").notNull(),
    email: varchar("email", { length: 100 }),
    phone: varchar("phone", { length: 50 }),
    ntn: varchar("ntn", { length: 50 }),
    gst_no: varchar("gst_no", { length: 50 }),
    notes: text("notes"), // prebuilt invoice notes
    quotation_notes: text("quotation_notes").default(""),
    sale_invoice_notes: text("sale_invoice_notes").default(""),
});

// Quotation 

const quotation_items = pgTable("quotation_items", {
    id: serial("id").primaryKey(),
    quotationId: integer("quotation_id")
        .references(() => quotations.id, { onDelete: "cascade" })
        .notNull(),
    description: varchar("description", { length: 100 }).notNull(), // item description
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default(1),
    uom: varchar("uom", { length: 50 }).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull().default(0),
    gst: numeric("gst", { precision: 12, scale: 2 }).notNull().default(0),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default(0),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default(0),
    notes: text("notes").default(""),
});

const quotations = pgTable('quotations', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    customerId: integer('customers').references(() => customers.id, { onDelete: 'set null' }).default(null),
    storeId: integer('store_info')
        .references(() => store_info.id, { onDelete: 'set null' })
        .notNull(),
    gst: numeric("gst", { precision: 12, scale: 2 }).notNull().default(0),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default(0),
    notes: text("notes").default(""),
    valid_until: timestamp('valid_until'),
    is_tax_inclusive: boolean("is_tax_inclusive").default(false),
    date: timestamp('date').defaultNow().notNull(),
})

// Sale invoice

const sale_invoices = pgTable('sale_invoices', {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    customerId: integer('customers')
        .references(() => customers.id, { onDelete: 'set null' })
        .notNull(),
    storeId: integer('store_info')
        .references(() => store_info.id, { onDelete: 'set null' })
        .notNull(),
    quotationId: integer('quotations')
        .references(() => quotations.id, { onDelete: 'set null' })
        .default(null),
    order_reference_no: varchar('order_reference_no', { length: 20 }).default(""),
    gst: numeric("gst", { precision: 12, scale: 2 }).notNull().default(0),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default(0),
    date: timestamp('date').defaultNow().notNull(),
    notes: text("notes").default(""),
    is_tax_inclusive: boolean("is_tax_inclusive").default(false),
    payment_method: varchar("payment_method", { length: 20 }).default("cash"),
    payment_reference: varchar("payment_reference", { length: 50 }).default(""),
    payment_status: varchar("payment_status", { length: 20 }).default("unpaid"),
});

const sale_invoice_items = pgTable('sale_invoice_items', {
    id: serial('id').primaryKey(),
    saleInvoiceId: integer('sale_invoices')
        .references(() => sale_invoices.id, { onDelete: 'cascade' })
        .notNull(),
    description: varchar('description', { length: 100 }).notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull().default(1),
    uom: varchar('uom', { length: 50 }).notNull(),
    price: numeric('price', { precision: 12, scale: 2 }).notNull().default(0),
    gst: numeric('gst', { precision: 12, scale: 2 }).notNull().default(0),
    discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default(0),
    total: numeric('total', { precision: 12, scale: 2 }).notNull().default(0),
    notes: text('notes').default(""),
});



const letter_heads = pgTable("letter_heads", {
    id: serial("id").primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    storeId: integer("store_id")
        .references(() => store_info.id, { onDelete: "cascade" })
        .notNull(),
    name: varchar("name", { length: 100 }).notNull(), // e.g.,  "Bank", "Client Submission", "Tax Authority", etc
    header_text: text("header_text"), // optional header
    footer_text: text("footer_text"), // optional footer
    default_body: text("default_body"), // e.g., "Dear Sir/Madam, This is to certify..."
    issued_at: timestamp("issued_at").defaultNow(),
    notes: text("notes")
});


module.exports = {
    users,
    customers,
    store_info,
    quotations,
    quotation_items,
    sale_invoices,
    sale_invoice_items,
    letter_heads
}
