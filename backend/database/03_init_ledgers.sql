-- Ledgers Table
-- This table stores chart of accounts/ledgers per company.

CREATE TABLE IF NOT EXISTS public."Ledgers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "type" VARCHAR(50) NOT NULL, -- Customer, Supplier, Bank, Cash, Income, Expense, Asset, Liability, Equity, Tax, Other
    "opening_balance" DECIMAL(15, 2) DEFAULT 0.00,
    "balance_type" VARCHAR(2) NOT NULL, -- Dr, Cr
    "is_gst_applicable" BOOLEAN DEFAULT FALSE,
    "gst_no" VARCHAR(15),
    "pan_no" VARCHAR(10),
    "contact_person" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "state" VARCHAR(100),
    "country" VARCHAR(100) DEFAULT 'India',
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL REFERENCES public."Users"("id")
);

-- Index for querying by company efficiently
CREATE INDEX IF NOT EXISTS "ledgers_company_id_idx" ON public."Ledgers"("company_id");

-- Ensure unique ledger names within a company
CREATE UNIQUE INDEX IF NOT EXISTS "ledgers_company_id_name_unique_idx" ON public."Ledgers"("company_id", "name") WHERE "is_active" = TRUE;

-- Ensure unique ledger codes within a company
CREATE UNIQUE INDEX IF NOT EXISTS "ledgers_company_id_code_unique_idx" ON public."Ledgers"("company_id", "code") WHERE "is_active" = TRUE AND "code" IS NOT NULL AND "code" != '';
