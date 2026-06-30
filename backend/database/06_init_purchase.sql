-- Vouchers Table
CREATE TABLE IF NOT EXISTS public."Vouchers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "voucher_type" VARCHAR(50) NOT NULL DEFAULT 'Purchase',
    "voucher_number" VARCHAR(50) NOT NULL,
    "reference_number" VARCHAR(100),
    "voucher_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    
    "party_id" UUID NOT NULL REFERENCES public."Ledgers"("id") ON DELETE RESTRICT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Posted, Cancelled
    
    -- Financials
    "subtotal" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    "remarks" TEXT,
    
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL REFERENCES public."Users"("id")
);

CREATE INDEX IF NOT EXISTS "vouchers_company_id_idx" ON public."Vouchers"("company_id");
CREATE INDEX IF NOT EXISTS "vouchers_party_id_idx" ON public."Vouchers"("party_id");
CREATE UNIQUE INDEX IF NOT EXISTS "vouchers_company_id_number_unique_idx" ON public."Vouchers"("company_id", "voucher_type", "voucher_number");

-- Voucher Items Table
CREATE TABLE IF NOT EXISTS public."Voucher_Items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "voucher_id" UUID NOT NULL REFERENCES public."Vouchers"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL REFERENCES public."Items"("id") ON DELETE RESTRICT,
    "unit_id" UUID NOT NULL REFERENCES public."Units"("id") ON DELETE RESTRICT,
    
    "quantity" DECIMAL(15, 4) NOT NULL CHECK ("quantity" > 0),
    "rate" DECIMAL(15, 2) NOT NULL CHECK ("rate" >= 0),
    "discount_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    "tax_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "voucher_items_voucher_id_idx" ON public."Voucher_Items"("voucher_id");
CREATE INDEX IF NOT EXISTS "voucher_items_item_id_idx" ON public."Voucher_Items"("item_id");

-- Inventory Movements Table
CREATE TABLE IF NOT EXISTS public."Inventory_Movements" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "company_id" UUID NOT NULL REFERENCES public."Companies"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL REFERENCES public."Items"("id") ON DELETE RESTRICT,
    "voucher_id" UUID NOT NULL REFERENCES public."Vouchers"("id") ON DELETE RESTRICT,
    
    "voucher_type" VARCHAR(50) NOT NULL,
    "movement_type" VARCHAR(10) NOT NULL, -- 'IN' or 'OUT'
    "quantity" DECIMAL(15, 4) NOT NULL CHECK ("quantity" > 0),
    "transaction_date" DATE NOT NULL,
    
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "inventory_movements_company_item_idx" ON public."Inventory_Movements"("company_id", "item_id");
CREATE INDEX IF NOT EXISTS "inventory_movements_voucher_idx" ON public."Inventory_Movements"("voucher_id");

-- RPC: Post Purchase Voucher
CREATE OR REPLACE FUNCTION post_purchase_voucher(p_voucher_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status VARCHAR(20);
    v_company_id UUID;
    v_voucher_type VARCHAR(50);
    v_voucher_date DATE;
    v_item RECORD;
BEGIN
    -- 1. Check voucher status
    SELECT status, company_id, voucher_type, voucher_date 
    INTO v_status, v_company_id, v_voucher_type, v_voucher_date 
    FROM public."Vouchers" 
    WHERE id = p_voucher_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Voucher not found';
    END IF;

    IF v_status != 'Draft' THEN
        RAISE EXCEPTION 'Only Draft vouchers can be posted';
    END IF;

    -- 2. Loop through voucher items and update inventory
    FOR v_item IN SELECT item_id, quantity FROM public."Voucher_Items" WHERE voucher_id = p_voucher_id
    LOOP
        -- Insert movement
        INSERT INTO public."Inventory_Movements" (
            company_id, item_id, voucher_id, voucher_type, movement_type, quantity, transaction_date
        ) VALUES (
            v_company_id, v_item.item_id, p_voucher_id, v_voucher_type, 'IN', v_item.quantity, v_voucher_date
        );

        -- Update Item current_quantity
        UPDATE public."Items"
        SET current_quantity = current_quantity + v_item.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_item.item_id;
    END LOOP;

    -- 3. Mark voucher as Posted
    UPDATE public."Vouchers"
    SET status = 'Posted',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_voucher_id;

    RETURN TRUE;
END;
$$;

-- RPC: Cancel Purchase Voucher
CREATE OR REPLACE FUNCTION cancel_purchase_voucher(p_voucher_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status VARCHAR(20);
    v_company_id UUID;
    v_voucher_type VARCHAR(50);
    v_voucher_date DATE;
    v_item RECORD;
BEGIN
    -- 1. Check voucher status
    SELECT status, company_id, voucher_type, voucher_date 
    INTO v_status, v_company_id, v_voucher_type, v_voucher_date 
    FROM public."Vouchers" 
    WHERE id = p_voucher_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Voucher not found';
    END IF;

    IF v_status != 'Posted' THEN
        RAISE EXCEPTION 'Only Posted vouchers can be cancelled';
    END IF;

    -- 2. Loop through voucher items and reverse inventory
    FOR v_item IN SELECT item_id, quantity FROM public."Voucher_Items" WHERE voucher_id = p_voucher_id
    LOOP
        -- Insert reversing movement
        INSERT INTO public."Inventory_Movements" (
            company_id, item_id, voucher_id, voucher_type, movement_type, quantity, transaction_date
        ) VALUES (
            v_company_id, v_item.item_id, p_voucher_id, v_voucher_type, 'OUT', v_item.quantity, CURRENT_DATE
        );

        -- Update Item current_quantity
        UPDATE public."Items"
        SET current_quantity = current_quantity - v_item.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_item.item_id;
    END LOOP;

    -- 3. Mark voucher as Cancelled
    UPDATE public."Vouchers"
    SET status = 'Cancelled',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_voucher_id;

    RETURN TRUE;
END;
$$;
