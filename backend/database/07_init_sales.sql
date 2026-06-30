-- RPC: Post Sales Voucher
CREATE OR REPLACE FUNCTION post_sales_voucher(p_voucher_id UUID, p_user_id UUID)
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
    v_current_stock DECIMAL(15, 4);
    v_item_name VARCHAR(100);
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

    IF v_voucher_type != 'Sales' THEN
        RAISE EXCEPTION 'This function is only for Sales vouchers';
    END IF;

    -- 2. Loop through voucher items and update inventory
    FOR v_item IN SELECT item_id, quantity FROM public."Voucher_Items" WHERE voucher_id = p_voucher_id
    LOOP
        -- Check current stock
        SELECT current_quantity, name INTO v_current_stock, v_item_name
        FROM public."Items"
        WHERE id = v_item.item_id FOR UPDATE; -- Lock row to prevent race conditions

        IF v_current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for item: %. Available: %, Requested: %', v_item_name, v_current_stock, v_item.quantity;
        END IF;

        -- Insert movement (OUT)
        INSERT INTO public."Inventory_Movements" (
            company_id, item_id, voucher_id, voucher_type, movement_type, quantity, transaction_date
        ) VALUES (
            v_company_id, v_item.item_id, p_voucher_id, v_voucher_type, 'OUT', v_item.quantity, v_voucher_date
        );

        -- Update Item current_quantity
        UPDATE public."Items"
        SET current_quantity = current_quantity - v_item.quantity,
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

-- RPC: Cancel Sales Voucher
CREATE OR REPLACE FUNCTION cancel_sales_voucher(p_voucher_id UUID, p_user_id UUID)
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

    IF v_voucher_type != 'Sales' THEN
        RAISE EXCEPTION 'This function is only for Sales vouchers';
    END IF;

    -- 2. Loop through voucher items and reverse inventory (IN)
    FOR v_item IN SELECT item_id, quantity FROM public."Voucher_Items" WHERE voucher_id = p_voucher_id
    LOOP
        -- Insert reversing movement
        INSERT INTO public."Inventory_Movements" (
            company_id, item_id, voucher_id, voucher_type, movement_type, quantity, transaction_date
        ) VALUES (
            v_company_id, v_item.item_id, p_voucher_id, v_voucher_type, 'IN', v_item.quantity, CURRENT_DATE
        );

        -- Update Item current_quantity
        UPDATE public."Items"
        SET current_quantity = current_quantity + v_item.quantity,
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
