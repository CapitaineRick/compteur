/*
  # Create anecdote history table for tracking weekly data

  1. New Tables
    - `anecdote_history`
      - `id` (uuid, primary key)
      - `counter_id` (uuid, foreign key to anecdote_counters)
      - `person_name` (text) - Denormalized for easier querying
      - `count` (integer) - Number of anecdotes added that week
      - `week_start` (date) - Start date of the week
      - `created_at` (timestamptz) - When the record was created

  2. Modifications
    - Add `week_number` column to anecdote_counters for tracking current week

  3. Security
    - Enable RLS on `anecdote_history` table
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS anecdote_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_id uuid NOT NULL REFERENCES anecdote_counters(id) ON DELETE CASCADE,
  person_name text NOT NULL,
  count integer DEFAULT 0,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anecdote_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view history"
  ON anecdote_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert history"
  ON anecdote_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update history"
  ON anecdote_history
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anecdote_counters' AND column_name = 'current_week_start'
  ) THEN
    ALTER TABLE anecdote_counters ADD COLUMN current_week_start date DEFAULT CURRENT_DATE;
  END IF;
END $$;
