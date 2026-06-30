-- Units Table
CREATE TABLE IF NOT EXISTS public."Units" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "name" VARCHAR(50) NOT NULL, -- e.g., PCS, KG, BOX
    "formal_name" VARCHAR(255), -- e.g., Pieces, Kilograms
    "number_of_decimal_places" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL REFERENCES public."Users"("id")
);

CREATE INDEX IF NOT EXISTS "units_company_id_idx" ON public."Units"("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "units_company_id_name_unique_idx" ON public."Units"("company_id", "name") WHERE "is_active" = TRUE;

-- Items Table
CREATE TABLE IF NOT EXISTS public."Items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "group_id" UUID NOT NULL REFERENCES public."Groups"("id") ON DELETE RESTRICT,
    "unit_id" UUID NOT NULL REFERENCES public."Units"("id") ON DELETE RESTRICT,
    
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "hsn_code" VARCHAR(50),
    "barcode" VARCHAR(255),
    
    -- Financials
    "purchase_price" DECIMAL(15, 2) DEFAULT 0,
    "selling_price" DECIMAL(15, 2) DEFAULT 0,
    "gst_percentage" DECIMAL(5, 2) DEFAULT 0,
    
    -- Inventory Levels
    "opening_quantity" DECIMAL(15, 4) DEFAULT 0,
    "opening_value" DECIMAL(15, 2) DEFAULT 0,
    
    "min_stock_level" DECIMAL(15, 4) DEFAULT 0,
    "max_stock_level" DECIMAL(15, 4) DEFAULT 0,
    "reorder_level" DECIMAL(15, 4) DEFAULT 0,
    
    -- Dynamic Trackers (Will be mutated by future Voucher modules)
    "current_quantity" DECIMAL(15, 4) DEFAULT 0,
    "reserved_quantity" DECIMAL(15, 4) DEFAULT 0,
    "damaged_quantity" DECIMAL(15, 4) DEFAULT 0,
    
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL REFERENCES public."Users"("id")
);

CREATE INDEX IF NOT EXISTS "items_company_id_idx" ON public."Items"("company_id");
CREATE INDEX IF NOT EXISTS "items_group_id_idx" ON public."Items"("group_id");
CREATE UNIQUE INDEX IF NOT EXISTS "items_company_id_sku_unique_idx" ON public."Items"("company_id", "sku") WHERE "is_active" = TRUE;
