-- RTO Offices table for RTO Management System
-- Run this SQL manually in PostgreSQL to create the table

CREATE TABLE IF NOT EXISTS rto_offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
