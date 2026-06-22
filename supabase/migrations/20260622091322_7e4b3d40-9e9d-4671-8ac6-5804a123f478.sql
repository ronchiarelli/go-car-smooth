
-- Vehicles
DROP POLICY IF EXISTS "Vehicles: public read" ON public.vehicles;
CREATE POLICY "Vehicles: public read" ON public.vehicles
  FOR SELECT USING (
    is_active = true
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );

DROP POLICY IF EXISTS "Vehicles: admin insert" ON public.vehicles;
CREATE POLICY "Vehicles: staff insert" ON public.vehicles
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );

DROP POLICY IF EXISTS "Vehicles: admin update" ON public.vehicles;
CREATE POLICY "Vehicles: staff update" ON public.vehicles
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );

-- Vehicle images
DROP POLICY IF EXISTS "Vehicle images: admin manage" ON public.vehicle_images;
CREATE POLICY "Vehicle images: staff manage" ON public.vehicle_images
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );

-- Bookings
DROP POLICY IF EXISTS "Bookings: own read" ON public.bookings;
CREATE POLICY "Bookings: own read" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );

DROP POLICY IF EXISTS "Bookings: own update" ON public.bookings;
CREATE POLICY "Bookings: own update" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'fleet_manager')
  );
