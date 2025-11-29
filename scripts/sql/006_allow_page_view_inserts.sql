-- Allow anonymous page view tracking by creating a policy for page_view inserts
CREATE POLICY "allow_anonymous_page_views" ON activities
  FOR INSERT
  WITH CHECK (type = 'page_view');
