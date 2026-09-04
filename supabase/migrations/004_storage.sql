-- ============================================================
-- Tesla Capital — Storage Buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('giveaway-images', 'giveaway-images', true) ON CONFLICT DO NOTHING;

-- Avatars: users can upload own
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Product images: public read, admin write
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin can manage product images" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- KYC documents: private — user upload, admin read
CREATE POLICY "Users can upload KYC docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Users can view own KYC docs" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "Admin can view all KYC docs" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Article images: public read, admin write
CREATE POLICY "Anyone can view article images" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');
CREATE POLICY "Admin can manage article images" ON storage.objects FOR ALL USING (bucket_id = 'article-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Giveaway images: public read, admin write
CREATE POLICY "Anyone can view giveaway images" ON storage.objects FOR SELECT USING (bucket_id = 'giveaway-images');
CREATE POLICY "Admin can manage giveaway images" ON storage.objects FOR ALL USING (bucket_id = 'giveaway-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
