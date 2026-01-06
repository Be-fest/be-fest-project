-- Migration: Create chat_messages table
-- Run this in Supabase SQL Editor

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_service_id UUID REFERENCES event_services(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_event_service ON chat_messages(event_service_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages from their event services
CREATE POLICY "Users can read messages from their event services"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_services es
      JOIN events e ON es.event_id = e.id
      WHERE es.id = event_service_id
      AND (es.provider_id = auth.uid() OR e.client_id = auth.uid())
    )
  );

-- Policy: Users can send messages to their event services (only if event date hasn't passed and status allows)
CREATE POLICY "Users can send messages to their event services"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM event_services es
      JOIN events e ON es.event_id = e.id
      WHERE es.id = event_service_id
      AND (es.provider_id = auth.uid() OR e.client_id = auth.uid())
      AND es.booking_status IN ('approved', 'waiting_payment', 'in_progress')
      AND e.event_date >= CURRENT_DATE
    )
  );

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
