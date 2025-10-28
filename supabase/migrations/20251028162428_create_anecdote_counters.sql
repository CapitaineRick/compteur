/*
  # Create anecdote counters table

  1. New Tables
    - `anecdote_counters`
      - `id` (uuid, primary key) - Unique identifier for each person
      - `person_name` (text, not null) - Name of the person sharing anecdotes
      - `count` (integer, default 0) - Number of anecdotes shared
      - `created_at` (timestamptz) - When the counter was created
      - `updated_at` (timestamptz) - Last time the counter was updated

  2. Security
    - Enable RLS on `anecdote_counters` table
    - Add policies for public access (select, insert, update, delete)
      - This is a simple counter app without authentication requirements
*/

CREATE TABLE IF NOT EXISTS anecdote_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE anecdote_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view counters"
  ON anecdote_counters
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert counters"
  ON anecdote_counters
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update counters"
  ON anecdote_counters
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete counters"
  ON anecdote_counters
  FOR DELETE
  USING (true);