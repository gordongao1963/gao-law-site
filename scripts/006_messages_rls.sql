-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert messages (for contact form and chat)
CREATE POLICY "Allow public inserts on messages"
ON messages
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to read messages (for admin)
CREATE POLICY "Allow public reads on messages"
ON messages
FOR SELECT
TO public
USING (true);

-- Allow anyone to update messages (for marking as read)
CREATE POLICY "Allow public updates on messages"
ON messages
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete messages
CREATE POLICY "Allow public deletes on messages"
ON messages
FOR DELETE
TO public
USING (true);
