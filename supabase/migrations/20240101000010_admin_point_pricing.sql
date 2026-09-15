-- ============================================================================
-- POINT PACKAGE ADMIN PRICING
-- RLS policy that lets admins manage point packages and lets signed-in users
-- read active packages (the buy modal reads live pricing from the DB).
-- ============================================================================

-- Admins can fully manage point packages
CREATE POLICY "admin_all_point_packages" ON point_packages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Signed-in users can read active packages (like anon already can)
CREATE POLICY "point_packages_auth_read" ON point_packages
  FOR SELECT TO authenticated USING (active = TRUE);

-- Table-level grants: authenticated gets INSERT/UPDATE/DELETE so the admin
-- client (which talks to the DB as signed-in users, not the service role)
-- can persist pricing changes.
GRANT INSERT, UPDATE, DELETE ON point_packages TO authenticated;