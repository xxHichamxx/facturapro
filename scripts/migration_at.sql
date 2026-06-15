-- Migration: Add Admission Temporaire (AT) fields to documents table
-- Run this in Supabase SQL Editor
-- Date: 2026-06-15

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS at_number TEXT,
  ADD COLUMN IF NOT EXISTS at_date DATE,
  ADD COLUMN IF NOT EXISTS at_bureau TEXT;
