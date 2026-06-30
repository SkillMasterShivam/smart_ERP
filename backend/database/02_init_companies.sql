-- Companies Table
-- This table stores tenant (company) information, isolating data per user.

CREATE TABLE IF NOT EXISTS public."Companies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES public."Users"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "business_type" VARCHAR(100),
    "gst_no" VARCHAR(15),
    "pan_no" VARCHAR(10),
    "fy_start" DATE NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) DEFAULT 'India',
    "address" TEXT,
    "pincode" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "currency" VARCHAR(10) DEFAULT 'INR',
    "timezone" VARCHAR(50) DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID
);

-- Index for faster queries filtering by user_id
CREATE INDEX IF NOT EXISTS "companies_user_id_idx" ON public."Companies"("user_id");

-- Ensure users cannot have two active companies with the exact same name
CREATE UNIQUE INDEX IF NOT EXISTS "companies_user_id_name_unique_idx" ON public."Companies"("user_id", "name") WHERE "is_active" = TRUE;
