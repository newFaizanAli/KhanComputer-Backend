import { db } from "../db";
import { quotations } from "../schemas";
import { sql } from "drizzle-orm";

export async function generateQuotationCode() {
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