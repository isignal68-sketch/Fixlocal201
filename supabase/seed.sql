-- =============================================================================
-- Seed Data
-- =============================================================================

insert into public.states (name, code, slug) values
  ('California', 'CA', 'california'),
  ('Texas', 'TX', 'texas'),
  ('New York', 'NY', 'new-york'),
  ('Florida', 'FL', 'florida'),
  ('Illinois', 'IL', 'illinois'),
  ('Washington', 'WA', 'washington'),
  ('Georgia', 'GA', 'georgia'),
  ('Arizona', 'AZ', 'arizona'),
  ('Massachusetts', 'MA', 'massachusetts'),
  ('Colorado', 'CO', 'colorado')
on conflict (code) do nothing;

insert into public.cities (name, slug, state_code, latitude, longitude, population, is_active) values
  ('Los Angeles', 'los-angeles', 'CA', 34.0522, -118.2437, 3898747, true),
  ('San Francisco', 'san-francisco', 'CA', 37.7749, -122.4194, 873965, true),
  ('San Diego', 'san-diego', 'CA', 32.7157, -117.1611, 1386932, true),
  ('Austin', 'austin', 'TX', 30.2672, -97.7431, 961855, true),
  ('Houston', 'houston', 'TX', 29.7604, -95.3698, 2304580, true),
  ('Dallas', 'dallas', 'TX', 32.7767, -96.7970, 1304379, true),
  ('New York City', 'new-york-city', 'NY', 40.7128, -74.0060, 8336817, true),
  ('Buffalo', 'buffalo', 'NY', 42.8864, -78.8784, 278349, true),
  ('Miami', 'miami', 'FL', 25.7617, -80.1918, 467963, true),
  ('Orlando', 'orlando', 'FL', 28.5383, -81.3792, 307573, true),
  ('Chicago', 'chicago', 'IL', 41.8781, -87.6298, 2746388, true),
  ('Seattle', 'seattle', 'WA', 47.6062, -122.3321, 737015, true),
  ('Atlanta', 'atlanta', 'GA', 33.7490, -84.3880, 498715, true),
  ('Phoenix', 'phoenix', 'AZ', 33.4484, -112.0740, 1608139, true),
  ('Boston', 'boston', 'MA', 42.3601, -71.0589, 675647, true),
  ('Denver', 'denver', 'CO', 39.7392, -104.9903, 715522, true)
on conflict (slug, state_code) do nothing;

insert into public.zip_codes (zip_code, city_id, latitude, longitude)
select z.zip, c.id, z.lat, z.lng
from (values
  ('90001', 'los-angeles', 'CA', 33.9731, -118.2479),
  ('90210', 'los-angeles', 'CA', 34.0901, -118.4065),
  ('94102', 'san-francisco', 'CA', 37.7793, -122.4193),
  ('92101', 'san-diego', 'CA', 32.7157, -117.1611),
  ('78701', 'austin', 'TX', 30.2711, -97.7437),
  ('77002', 'houston', 'TX', 29.7589, -95.3677),
  ('75201', 'dallas', 'TX', 32.7876, -96.7996),
  ('10001', 'new-york-city', 'NY', 40.7506, -73.9971),
  ('14201', 'buffalo', 'NY', 42.8919, -78.8592),
  ('33101', 'miami', 'FL', 25.7743, -80.1937),
  ('32801', 'orlando', 'FL', 28.5421, -81.3790),
  ('60601', 'chicago', 'IL', 41.8853, -87.6217),
  ('98101', 'seattle', 'WA', 47.6101, -122.3344),
  ('30301', 'atlanta', 'GA', 33.7550, -84.3900),
  ('85001', 'phoenix', 'AZ', 33.4487, -112.0738),
  ('02108', 'boston', 'MA', 42.3588, -71.0653),
  ('80202', 'denver', 'CO', 39.7508, -104.9963)
) as z(zip, city_slug, state_code, lat, lng)
join public.cities c on c.slug = z.city_slug and c.state_code = z.state_code
on conflict (zip_code) do nothing;

insert into public.categories (name, slug, description, icon, sort_order) values
  ('Plumbing', 'plumbing', 'Leaks, pipes, water heaters, and repairs.', 'Wrench', 1),
  ('Electrical', 'electrical', 'Wiring, panels, lighting, and safety inspections.', 'Zap', 2),
  ('HVAC', 'hvac', 'Heating, cooling, and air quality systems.', 'Thermometer', 3),
  ('Cleaning', 'cleaning', 'Home, office, deep, and move-out cleaning.', 'Sparkles', 4),
  ('Handyman', 'handyman', 'Small repairs and general home fixes.', 'Hammer', 5),
  ('Painting', 'painting', 'Interior, exterior, and cabinet painting.', 'PaintBucket', 6),
  ('Roofing', 'roofing', 'Repairs, replacement, and inspections.', 'Home', 7),
  ('Landscaping', 'landscaping', 'Lawn care, design, and maintenance.', 'Trees', 8),
  ('Flooring', 'flooring', 'Installation, refinishing, and repair.', 'LayoutGrid', 9),
  ('Remodeling', 'remodeling', 'Full home and room renovations.', 'Ruler', 10),
  ('Moving', 'moving', 'Local and long-distance moving help.', 'Truck', 11),
  ('Locksmith', 'locksmith', 'Lockouts, rekeys, and security upgrades.', 'KeyRound', 12),
  ('Pest Control', 'pest-control', 'Inspections and pest removal.', 'Bug', 13),
  ('Pressure Washing', 'pressure-washing', 'Driveways, siding, and decks.', 'Droplets', 14),
  ('Appliance Repair', 'appliance-repair', 'Washers, dryers, fridges, and more.', 'Wrench', 15),
  ('Auto Repair', 'auto-repair', 'Mobile mechanics and diagnostics.', 'Car', 16),
  ('Pool Services', 'pool-services', 'Cleaning, repair, and maintenance.', 'Waves', 17),
  ('Window Cleaning', 'window-cleaning', 'Interior and exterior window care.', 'AppWindow', 18),
  ('Junk Removal', 'junk-removal', 'Hauling and clean-out services.', 'Trash2', 19),
  ('Tree Service', 'tree-service', 'Trimming, removal, and stump grinding.', 'TreePine', 20),
  ('Concrete', 'concrete', 'Driveways, patios, and foundations.', 'Box', 21),
  ('Drywall', 'drywall', 'Installation, repair, and finishing.', 'PanelsTopLeft', 22),
  ('Tile', 'tile', 'Installation and repair for floors and walls.', 'Grid3x3', 23),
  ('Bathroom Remodel', 'bathroom-remodel', 'Full and partial bathroom renovations.', 'Bath', 24),
  ('Kitchen Remodel', 'kitchen-remodel', 'Full and partial kitchen renovations.', 'CookingPot', 25),
  ('Garage Door', 'garage-door', 'Repair, replacement, and openers.', 'DoorClosed', 26),
  ('Solar', 'solar', 'Installation and consultations.', 'Sun', 27),
  ('Carpet Cleaning', 'carpet-cleaning', 'Deep cleaning and stain removal.', 'Layers', 28)
on conflict (slug) do nothing;

insert into public.coupons (code, discount_type, discount_value, max_redemptions, expires_at, is_active) values
  ('WELCOME10', 'percent', 10, 1000, now() + interval '90 days', true),
  ('FIRSTJOB25', 'fixed', 2500, 500, now() + interval '60 days', true)
on conflict (code) do nothing;
