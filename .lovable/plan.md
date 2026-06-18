
# GoCar — Build Plan

A full-stack car rental + sale app visually modeled on the Carntel reference (orange #FF6B1A + black + light gray, Bebas-Neue-style display headings + clean sans body), brandable as **GoCar**, with a backend powered by Lovable Cloud and ready to wrap in Capacitor for iOS/Android later.

## 1. Design & branding

- Rename brand to **GoCar** (orange "Go", black "Car" wordmark, matching reference's two-tone "Cars & Bikes").
- Tokens in `src/styles.css`: orange primary `#FF6B1A`, near-black `#0F0F0F`, surface `#F4F4F6`, white. Rounded-2xl cards, soft shadows, accent orange tab notch on stat cards.
- Typography: Bebas Neue (display, all-caps hero) + Inter (body) via `@fontsource`.
- Sections cloned 1:1 from screenshots: sticky top nav (logo + Home/About/Cars/Services/Pages/Blog/Contact + phone + email), hero with dark gradient + "MERCEDES" backdrop typography + "Available For Rent" booking card (Car/Van/Minibus/Coupe/Bike tabs, vehicle type, pick-up/drop-off, dates, Find a Vehicle button), Stats block (Clients/Customers/Vehicles/Years with orange notches), orange "Explore Our Premium Brands" band with car cutout, Our Vehicle Fleet 3-up cards with `$/DAY` price tag + Detail button + seat/bag/suv meta + fuel chips, Why Choose Us split with bike image and feature list, Need-any-help footer CTA.

## 2. Routes (TanStack Start)

Public:
- `/` — landing (all marketing sections above)
- `/cars` — rental fleet listing with filters (type, fuel, price)
- `/cars/$id` — rental detail + booking form
- `/sale` — cars for sale listing
- `/sale/$id` — sale detail + "Request to Buy" form
- `/about`, `/services`, `/contact`, `/blog` (basic content pages)
- `/auth` — sign in / sign up (email+password, Google, Phone OTP)

Authenticated (`_authenticated/`):
- `/account` — profile + my bookings + my purchase requests
- `/account/bookings/$id`

Admin (`_authenticated/_admin/`, role-gated via `has_role`):
- `/admin` — dashboard
- `/admin/vehicles` — CRUD rental & sale inventory + image upload
- `/admin/bookings` — manage rental bookings
- `/admin/sales` — manage purchase requests
- `/admin/users` — assign roles

## 3. Backend (Lovable Cloud)

Tables (all with grants + RLS):
- `profiles` (id→auth.users, full_name, phone, avatar_url) — auto-created via trigger on signup.
- `user_roles` (user_id, role enum `admin|customer`) + `has_role()` security definer.
- `vehicles` (id, name, brand, type enum `car|van|minibus|coupe|bike|suv`, listing enum `rent|sale|both`, daily_price, sale_price, seats, bags, fuel, transmission, year, mileage, description, status, primary_image_url).
- `vehicle_images` (vehicle_id, url, sort).
- `bookings` (id, vehicle_id, user_id, pickup_location, dropoff_location, pickup_at, return_at, total_price, status enum `pending|confirmed|cancelled|completed`).
- `purchase_requests` (id, vehicle_id, user_id, offer_price, message, status).

RLS:
- `vehicles`, `vehicle_images`: SELECT for `anon` + `authenticated`; INSERT/UPDATE/DELETE only `has_role(auth.uid(),'admin')`.
- `profiles`: user reads/updates own row; admins read all.
- `bookings`/`purchase_requests`: user reads/writes own; admins all.
- `user_roles`: select for authenticated, mutations admin-only.

Storage bucket `vehicle-images` (public read; admin write).

Auth: enable Email/Password, Google (via Lovable broker), Phone OTP. Seed user_role `admin` for the email you provide once you've signed up.

## 4. Server functions (TanStack `createServerFn`)

- Public read fns (publishable-key client): `listVehicles`, `getVehicle`, `listSaleVehicles`.
- Authenticated (`requireSupabaseAuth`): `createBooking`, `myBookings`, `createPurchaseRequest`, `updateProfile`.
- Admin-guarded: `upsertVehicle`, `deleteVehicle`, `updateBookingStatus`, `grantRole` (load `supabaseAdmin` inside handler).

## 5. Mobile (Capacitor-ready)

- Build remains responsive web first; PWA-friendly manifest + icons.
- Add `@capacitor/core` + `@capacitor/cli` + `@capacitor/ios` + `@capacitor/android` configs and `capacitor.config.ts` pointing to the dist folder, plus README steps for `npx cap add ios/android` after export. No native build attempted in-sandbox.

## 6. Out of scope for this first pass

- Real payments (Stripe) — booking flow stores status `pending` and shows a "Pay at pickup / contact us" notice; we can wire Stripe later.
- Email/SMS notifications — schema ready, sending can be added via Resend / Twilio connectors next iteration.
- Map pickers, reviews, multilingual.

## Technical notes

- TanStack Start file routes; loaders use `ensureQueryData` + `useSuspenseQuery`.
- Admin pages live under `_authenticated/_admin` pathless layout with `has_role` check in `beforeLoad` via router context.
- Images: vehicle hero photos generated with `imagegen` (premium for fleet cards), stored under `src/assets/` for the landing demo cards and uploaded to storage from admin for real inventory.
- After backend is enabled I'll ask you for your admin email and seed the role.
