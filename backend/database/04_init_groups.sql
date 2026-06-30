-- Groups Table
-- Stores the hierarchical chart of accounts and stock groups

CREATE TABLE IF NOT EXISTS public."Groups" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "parent_id" UUID REFERENCES public."Groups"("id") ON DELETE RESTRICT,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "group_type" VARCHAR(50) NOT NULL DEFAULT 'Accounting', -- Accounting, Stock
    "nature" VARCHAR(50) NOT NULL, -- Asset, Liability, Income, Expense, None
    "affects_gross_profit" BOOLEAN DEFAULT FALSE,
    "description" TEXT,
    "is_system" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL REFERENCES public."Users"("id")
);

-- Index for querying by company efficiently
CREATE INDEX IF NOT EXISTS "groups_company_id_idx" ON public."Groups"("company_id");

-- Index for hierarchical queries
CREATE INDEX IF NOT EXISTS "groups_parent_id_idx" ON public."Groups"("parent_id");

-- Ensure unique group names within a company (only active ones)
CREATE UNIQUE INDEX IF NOT EXISTS "groups_company_id_name_unique_idx" ON public."Groups"("company_id", "name") WHERE "is_active" = TRUE;

-- Ensure unique group codes within a company
CREATE UNIQUE INDEX IF NOT EXISTS "groups_company_id_code_unique_idx" ON public."Groups"("company_id", "code") WHERE "is_active" = TRUE AND "code" IS NOT NULL AND "code" != '';
