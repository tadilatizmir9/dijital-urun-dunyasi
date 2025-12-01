-- Add DELETE policy for categories table
CREATE POLICY "Admin kullanıcılar kategorileri silebilir"
ON categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);