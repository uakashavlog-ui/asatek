# 00_Stitch_UI_Prompts.md
## ASATEK — Google Stitch UI Design Prompts

---

## A. Project Overview

- **Website Name:** ASATEK 🇵🇰
- **Purpose:** Electronics shop & manufacturer — Solar Charge Controllers, UPS/Inverters, Battery Chargers, and Parts & Accessories
- **Target Users:** Pakistani customers looking to buy solar/power electronics online
- **Roles:** Public (all visitors), Admin (single admin panel)
- **Languages:** English (default) + Urdu toggle (LTR/RTL)
- **Order Method:** Guest order form + WhatsApp button (no login required for customers)
- **Admin:** Single admin login with full management dashboard

---

## B. Global Design Direction
*(Use this exact block in every batch prompt)*

```
GLOBAL DESIGN DIRECTION (apply to ALL screens):

Brand: ASATEK — Pakistani electronics manufacturer & shop
Style: Modern, professional, clean, trustworthy
Color Palette:
  - Primary Red: #CC0000
  - Dark Red: #990000
  - White: #FFFFFF
  - Light Gray (backgrounds): #F5F5F5
  - Dark Gray (text): #1A1A1A
  - Medium Gray (secondary text): #666666
  - Border/Divider: #E0E0E0
  - Success Green: #28A745
  - Warning Yellow: #FFC107
  - Danger/Cancel Red: #DC3545

Typography:
  - Headings: Bold, sans-serif (e.g. Inter or Poppins)
  - Body: Regular, sans-serif
  - Labels/Badges: Medium weight, uppercase tracking
  - Urdu text (where shown): Noto Nastaliq Urdu

Buttons:
  - Primary: Solid red (#CC0000) background, white text, 6px radius
  - Secondary: White background, red border, red text, 6px radius
  - Danger: #DC3545 background, white text
  - Ghost: Transparent, gray border

Cards:
  - White background, 1px #E0E0E0 border, 8px radius, subtle box-shadow
  - Product image on top, details below

Forms:
  - White background inputs, 1px #E0E0E0 border, 6px radius
  - Red focus ring
  - Clear error states in red, success in green

Navbar:
  - White background, red ASATEK logo/text on left
  - Navigation links center/right
  - Language toggle (EN | اردو) top right
  - WhatsApp floating button (green) bottom-right corner on all public pages

Icons: Line icons, clean, minimal (Feather or Material style)
Spacing: 8px base grid, generous padding, clean whitespace
Shadows: Subtle (0 2px 8px rgba(0,0,0,0.08))
Mood: Professional, reliable, Pakistani brand identity
```

---

## C. Total Screens Table

| # | Screen Name | Role | Purpose | Batch |
|---|-------------|------|---------|-------|
| 1 | Home | Public | Hero, featured products, brand intro, trust badges | 1 |
| 2 | Products List | Public | Browse all products with filters (category, price) | 1 |
| 3 | Product Detail | Public | Full product info, specs, YouTube video, order CTA | 1 |
| 4 | Order Form | Public | Guest order placement form | 1 |
| 5 | Order Confirmation | Public | Success page after order placed | 1 |
| 6 | Order Tracking | Public | Enter phone number to track order status | 2 |
| 7 | Order Status Result | Public | Show order details & current status | 2 |
| 8 | Service Centers | Public | List of 15+ service centers across Pakistan | 2 |
| 9 | Customer Reviews | Public | Grid of customer review images | 2 |
| 10 | FAQ | Public | Frequently asked questions accordion | 2 |
| 11 | About / Contact | Public | Company info, WhatsApp, contact details | 2 |
| 12 | Admin Login | Admin | Single admin login screen | 3 |
| 13 | Admin Dashboard | Admin | Overview: total orders, revenue, pending orders, quick stats | 3 |
| 14 | Admin Orders List | Admin | All orders table with status, filter, search | 3 |
| 15 | Admin Order Detail | Admin | Full order info + status change actions | 3 |
| 16 | Admin Products List | Admin | All products table with edit/delete | 4 |
| 17 | Admin Add/Edit Product | Admin | Form to add or edit a product | 4 |
| 18 | Admin Reviews Manager | Admin | Upload/delete customer review images | 4 |
| 19 | Admin Service Centers | Admin | Add/edit/delete service center locations | 4 |
| 20 | Admin FAQ Manager | Admin | Add/edit/delete FAQ items | 4 |

**Total: 20 screens — 4 batches of 5**

---

## D. Batch-wise Prompts

---

### BATCH 1 — Screens 1–5 (Public: Home, Products, Product Detail, Order Form, Confirmation)

```
Design a mobile and desktop UI for ASATEK — a Pakistani electronics shop & manufacturer selling Solar Charge Controllers, UPS/Inverters, Battery Chargers, and Parts & Accessories.

GLOBAL DESIGN DIRECTION (apply to ALL screens):

Brand: ASATEK — Pakistani electronics manufacturer & shop
Style: Modern, professional, clean, trustworthy
Color Palette:
  - Primary Red: #CC0000
  - Dark Red: #990000
  - White: #FFFFFF
  - Light Gray (backgrounds): #F5F5F5
  - Dark Gray (text): #1A1A1A
  - Medium Gray (secondary text): #666666
  - Border/Divider: #E0E0E0
  - Success Green: #28A745
  - Warning Yellow: #FFC107
  - Danger/Cancel Red: #DC3545

Typography:
  - Headings: Bold, sans-serif (Inter or Poppins)
  - Body: Regular, sans-serif
  - Labels/Badges: Medium weight, uppercase tracking

Buttons:
  - Primary: Solid red (#CC0000) background, white text, 6px radius
  - Secondary: White background, red border, red text, 6px radius
  - Ghost: Transparent, gray border

Cards: White background, 1px #E0E0E0 border, 8px radius, subtle shadow
Forms: White inputs, 1px border, 6px radius, red focus ring
Navbar: White bg, ASATEK logo (red text) left, nav links center/right, EN|اردو toggle top-right
WhatsApp floating button: green circle, bottom-right corner, all public pages
Icons: Line icons, Feather/Material style
Spacing: 8px grid, generous whitespace
Mood: Professional, reliable, Pakistani brand identity

---

SCREEN 1: Home (Mobile + Desktop)
Sections:
- Navbar (logo, nav links: Home | Products | Service Centers | Reviews | FAQ | Contact, language toggle EN|اردو, WhatsApp icon)
- Hero banner: Bold headline "Pakistan's Trusted Power Electronics Brand", subheading "Solar Charge Controllers · UPS · Inverters · Battery Chargers · Parts", red CTA button "Shop Now" and secondary "Learn More", background has a subtle red gradient or circuit-board pattern
- Trust badges row: "15+ Service Centers", "Made in Pakistan 🇵🇰", "Warranty Included", "Fast Delivery"
- Featured Categories: 4 cards — Solar Charge Controllers, UPS/Inverters, Battery Chargers, Parts & Accessories — each with icon and red hover state
- Featured Products: horizontal scroll (mobile) / 3-column grid (desktop) of 3 product cards. Each card: product image, name, price in PKR, short spec, red "Order Now" button
- Customer Reviews teaser: heading "What Our Customers Say", 2 review image thumbnails, "View All Reviews" link
- Service Centers teaser: "15+ Centers Across Pakistan", city chips row (Karachi, Lahore, Rawalpindi, Peshawar...), "Find Nearest Center" button
- Footer: logo, links, contact info (WhatsApp number placeholder), copyright "© 2025 ASATEK Pakistan"
Navigation: "Shop Now" → Products List, category cards → Products List (filtered), "Order Now" → Order Form, "View All Reviews" → Customer Reviews, "Find Nearest Center" → Service Centers

SCREEN 2: Products List (Mobile + Desktop)
Sections:
- Navbar (same as Home)
- Page header: "Our Products", breadcrumb Home > Products
- Filters sidebar (desktop) / filter chips row (mobile): Category (All | Solar Charge Controllers | UPS/Inverters | Battery Chargers | Parts & Accessories), Price range slider, sort by (Newest | Price Low-High | Price High-Low)
- Products grid: 2-column (mobile) / 3-column (desktop)
- Each product card: image, category badge (red), product name, key spec (e.g. "12V 60A PWM"), price in PKR (e.g. "PKR 4,500"), red "Order Now" button, "View Details" link
- Realistic products: "ASATEK SC5 VA-1260" PKR 4,500 | "ASATEK SC5 VA-2460" PKR 5,200 | "ASATEK SC6-1230 3-in-1" PKR 3,800 | "ASATEK SC6-2430 3-in-1" PKR 4,200 | "ASATEK UPS 1000W" PKR 18,000 | "Battery Charger 12V 20A" PKR 2,500
- Empty state: if no results, show "No products found" with reset filter button
Navigation: product card → Product Detail, "Order Now" → Order Form (product pre-selected)

SCREEN 3: Product Detail (Mobile + Desktop)
Sections:
- Navbar
- Breadcrumb: Home > Products > SC5 VA-1260
- Product images: large main image + thumbnail strip (mobile: swipeable, desktop: left column)
- Product info (right column desktop / below image mobile):
  - Category badge "Solar Charge Controller"
  - Product name: "ASATEK SC5 VA-1260" (bold, large)
  - Price: "PKR 4,500" (red, large)
  - Short description: "12V 60A PWM Solar Charge Controller with Voltmeter & Ammeter"
  - Key specs list: Type: PWM | Rated Output: 12V, 60A | Max PV Input: 30V, 1000W | Display: Voltmeter + Ammeter
  - Features list (checkmark bullets): Advanced PWM Design, Fan Cooled, Full Metallic Body, Wall Mount, 15+ Service Centers
  - Two buttons: red "Order Now" (goes to Order Form with product pre-filled), green WhatsApp button "Chat on WhatsApp"
- YouTube video section: heading "Watch Product Video", embedded YouTube thumbnail with play button (placeholder)
- Specifications table: full specs in a clean table
- Related products: 3 cards (horizontal scroll mobile)
Navigation: "Order Now" → Order Form, WhatsApp button → WhatsApp (external)

SCREEN 4: Order Form (Mobile + Desktop)
Sections:
- Navbar
- Page heading: "Place Your Order", breadcrumb
- Form card (white, shadow):
  - Section 1 — Product Details:
    - Product dropdown (pre-filled if came from product page): e.g. "ASATEK SC5 VA-1260 — PKR 4,500"
    - Quantity input (number, min 1)
    - Price display: unit price × quantity = total (auto-calculated)
  - Section 2 — Your Information:
    - Full Name (text input)
    - Phone Number (tel input, placeholder: 03XX-XXXXXXX)
    - WhatsApp Number (tel input, checkbox "Same as phone number")
  - Section 3 — Delivery Address:
    - Full Address (textarea)
    - City (text input)
    - Province (dropdown: Punjab | Sindh | KPK | Balochistan | AJK | GB | Islamabad)
    - Country (text input, pre-filled: Pakistan)
    - ZIP Code (text input)
    - Google Maps Location (optional, text input for location link or landmark)
  - Order Summary box: product name, qty, unit price, total in PKR (highlighted red)
  - Submit button: red "Place Order" full-width
  - Below button: small text "After placing order, our team will contact you on WhatsApp to confirm"
- Loading state: spinner on submit button
- Error states: red inline errors on required fields
Navigation: successful submit → Order Confirmation

SCREEN 5: Order Confirmation (Mobile + Desktop)
Sections:
- Navbar
- Centered card:
  - Large green checkmark icon
  - Heading: "Order Placed Successfully!"
  - Subtext: "Thank you for your order. Our team will contact you on WhatsApp within 24 hours."
  - Order summary box: Order ID (e.g. #AST-2025-0042), Product, Qty, Total PKR, Customer name, Phone
  - Track your order section: "Save your phone number to track order status anytime"
  - Two buttons: green "Chat on WhatsApp" button, red outline "Track My Order" button
  - "Continue Shopping" link
Navigation: "Track My Order" → Order Tracking, "Continue Shopping" → Products List, WhatsApp → external

---
DEVICE INSTRUCTION:
Please generate BOTH a Mobile version (375px wide, phone frame) and a Desktop version (1440px wide) for each of the 5 screens above.
In Stitch: first create the Mobile version of each screen, then duplicate and adapt for Desktop layout (wider grid, sidebars, horizontal nav).
Total outputs: 10 frames (5 screens × 2 devices).
```

---

### BATCH 2 — Screens 6–11 (Public: Tracking, Service Centers, Reviews, FAQ, About/Contact)

```
Continue the ASATEK UI. Apply the same Global Design Direction as Batch 1.

GLOBAL DESIGN DIRECTION (apply to ALL screens):
Brand: ASATEK — Pakistani electronics manufacturer & shop
Style: Modern, professional, clean, trustworthy
Color Palette: Primary Red #CC0000 | Dark Red #990000 | White #FFFFFF | Light Gray #F5F5F5 | Dark Gray #1A1A1A | Medium Gray #666666 | Border #E0E0E0 | Success #28A745 | Warning #FFC107 | Danger #DC3545
Typography: Bold sans-serif headings (Inter/Poppins), regular body
Buttons: Primary = solid red, Secondary = white+red border, Ghost = transparent gray border — all 6px radius
Cards: White, 1px #E0E0E0 border, 8px radius, subtle shadow
Navbar: White bg, ASATEK logo (red) left, nav links center/right, EN|اردو toggle top-right
WhatsApp floating button: green circle, bottom-right, all public pages
Icons: Feather/Material line icons
Spacing: 8px grid, generous whitespace

---

SCREEN 6: Order Tracking (Mobile + Desktop)
Sections:
- Navbar
- Page heading: "Track Your Order", breadcrumb Home > Track Order
- Centered card:
  - Heading: "Enter your phone number to check order status"
  - Phone number input (large, placeholder: 03XX-XXXXXXX)
  - Red "Track Order" button
  - Helper text: "Use the same phone number you used while placing your order"
- Loading state: spinner while searching
- Error state: "No order found with this phone number. Please check and try again."
Navigation: found order → Order Status Result

SCREEN 7: Order Status Result (Mobile + Desktop)
Sections:
- Navbar
- Breadcrumb: Home > Track Order > Result
- Order info card:
  - Order ID: #AST-2025-0042
  - Placed on: 15 Nov 2025
  - Customer: Muhammad Ali | Phone: 0300-1234567
  - Product: ASATEK SC5 VA-1260 × 1 | Total: PKR 4,500
- Status tracker (horizontal stepper, 4 steps):
  - Step 1: Order Placed ✅ (green, completed)
  - Step 2: Confirmed ✅ (green, completed)
  - Step 3: Shipped 🔵 (blue, current/active)
  - Step 4: Delivered ⬜ (gray, upcoming)
  - Current status badge: "Shipped" in blue pill
- WhatsApp contact: "Questions? Contact us on WhatsApp" green button
Navigation: WhatsApp button → external

SCREEN 8: Service Centers (Mobile + Desktop)
Sections:
- Navbar
- Page heading: "Service Centers", subheading "15+ centers across Pakistan"
- City filter chips: All | Karachi | Lahore | Rawalpindi | Peshawar | Quetta | Multan | Others
- Service centers list/grid:
  - Each card: city name (bold red), area/address, phone number
  - Realistic entries:
    - Karachi — Saddar, Contact: 021-XXXXXXX
    - Karachi — Hyderabad, Contact: 022-XXXXXXX
    - Lahore — Main Branch, Contact: 042-XXXXXXX
    - Rawalpindi — Contact: 051-XXXXXXX
    - Peshawar — Contact: 091-XXXXXXX
    - Larkana — Contact: 074-XXXXXXX
    - Mardan — Contact: 0937-XXXXXXX
    - Bannu — Contact: 0928-XXXXXXX
    - Swabi — Contact: 0938-XXXXXXX
    - Sadiqabad — Contact: 068-XXXXXXX
    - Bahawalpur — Contact: 062-XXXXXXX
    - Upper Dir — Contact: 0945-XXXXXXX
    - Sanghar — Contact: 0235-XXXXXXX
    - Nowshero Feroz — Contact: XXXXXXX
    - Jhuddo / Chohar Jamali — Contact: XXXXXXX
  - 2-col grid (desktop), 1-col list (mobile)
Navigation: (static page, no navigation actions)

SCREEN 9: Customer Reviews (Mobile + Desktop)
Sections:
- Navbar
- Page heading: "Customer Reviews", subheading "Real feedback from our customers across Pakistan"
- Masonry/grid of review images (placeholder image cards with gray background):
  - Each card: review image (tall/portrait), small caption below (city name, e.g. "Customer from Lahore")
  - 2-column grid (mobile), 3–4 column masonry (desktop)
  - 12 placeholder review image cards shown
- Empty state (admin hasn't uploaded yet): "No reviews yet. Be the first!" with WhatsApp CTA
Navigation: (mostly static, no internal navigation)

SCREEN 10: FAQ (Mobile + Desktop)
Sections:
- Navbar
- Page heading: "Frequently Asked Questions", subheading "Got a question? We have answers."
- Accordion list (one open at a time, expand/collapse):
  - Q: What is a Solar Charge Controller? A: A solar charge controller regulates voltage/current from solar panels to battery...
  - Q: What is the difference between PWM and MPPT? A: PWM is simpler and cost-effective; MPPT is more efficient...
  - Q: Can I use the charge controller without a battery? A: Yes, ASATEK controllers can work as a DC power supply without a battery...
  - Q: How do I convert my regular inverter to a solar hybrid? A: Connect the ASATEK controller in place of the battery terminals in your inverter...
  - Q: What warranty do ASATEK products come with? A: All products come with manufacturer warranty. Contact your nearest service center...
  - Q: How can I place an order? A: Click "Order Now" on any product page or contact us on WhatsApp...
  - Q: Where are the service centers located? A: We have 15+ centers across Pakistan. See our Service Centers page...
  - Q: How do I track my order? A: Go to "Track Order" and enter your phone number used at order time...
- Each accordion item: question bold, red expand arrow icon, answer in gray text when open
Navigation: (static page)

SCREEN 11: About / Contact (Mobile + Desktop)
Sections:
- Navbar
- Hero strip: red background, white text — "About ASATEK", subheading "Pakistan's trusted power electronics manufacturer since 2021"
- About section: 2-col (desktop) — left: company description ("ASATEK is a Pakistani manufacturer of solar charge controllers, inverters, and battery chargers. We serve customers across Pakistan with 15+ service centers and quality-first products made in Pakistan 🇵🇰"), right: brand image placeholder or stats (15+ Service Centers, 1000+ Happy Customers, 4+ Products, Since 2021)
- Contact section heading: "Get In Touch"
- Contact methods cards:
  - WhatsApp: green icon, "+92 3XX-XXXXXXX", green "Chat Now" button
  - Phone: phone icon, "+92 3XX-XXXXXXX", "Call Now" button
  - Email: mail icon, "info@asatek.pk", "Send Email" button
- Our Products reminder: "Looking to buy? Browse our products" red CTA button → Products List
- Footer: logo, nav links, copyright
Navigation: WhatsApp → external, Products CTA → Products List

---
DEVICE INSTRUCTION:
Please generate BOTH a Mobile version (375px wide) and a Desktop version (1440px wide) for each of the 6 screens above.
Total outputs: 12 frames (6 screens × 2 devices).
```

---

### BATCH 3 — Screens 12–15 (Admin: Login, Dashboard, Orders List, Order Detail)

```
Design the ADMIN PANEL screens for ASATEK website. Apply same global brand colors but admin UI should feel more data-focused and dashboard-like.

GLOBAL DESIGN DIRECTION (admin):
Brand colors: Primary Red #CC0000 | White #FFFFFF | Light Gray #F5F5F5 | Dark Gray #1A1A1A | Border #E0E0E0 | Success #28A745 | Warning #FFC107 | Danger #DC3545
Admin layout: Left sidebar (desktop) with ASATEK logo + navigation menu | Top bar with admin name + logout
Sidebar nav items: Dashboard | Orders | Products | Reviews | Service Centers | FAQ | Logout
Mobile admin: bottom tab bar or hamburger menu
Cards/tables: clean white cards, subtle borders, good data density
Status badges: Pending (yellow pill) | Confirmed (blue pill) | Shipped (purple pill) | Cancelled (red pill)
Typography: same as global (Inter/Poppins bold headings, regular body)
Mood: Efficient, clean, information-dense dashboard

---

SCREEN 12: Admin Login (Mobile + Desktop)
Sections:
- Centered login card on a light gray or subtle red-tinted background
- ASATEK logo (red) top center
- Heading: "Admin Login"
- Username input (placeholder: Username)
- Password input (placeholder: Password, with show/hide toggle)
- Red "Login" button (full width)
- Error state: red banner "Invalid credentials. Please try again."
- No "forgot password" or sign up link (single admin only)
Navigation: successful login → Admin Dashboard

SCREEN 13: Admin Dashboard (Mobile + Desktop)
Sections:
- Sidebar (desktop) / top bar + hamburger (mobile) with ASATEK Admin logo
- Top stats row (4 cards):
  - Total Orders: 142 (blue icon)
  - Pending Orders: 8 (yellow icon, urgent feel)
  - Confirmed/Shipped: 118 (green icon)
  - Cancelled: 16 (red icon)
- Recent Orders table (last 5 orders):
  - Columns: Order ID | Customer Name | Product | Total | Status | Date | Action
  - Row 1: #AST-0042 | Muhammad Ali | SC5 VA-1260 | PKR 4,500 | Pending (yellow badge) | 15 Nov | "View" button
  - Row 2: #AST-0041 | Ahmed Khan | UPS 1000W | PKR 18,000 | Confirmed (blue badge) | 14 Nov | "View"
  - Row 3: #AST-0040 | Fatima Bibi | SC6-1230 | PKR 3,800 | Shipped (purple badge) | 13 Nov | "View"
  - Row 4: #AST-0039 | Usman Malik | Battery Charger | PKR 2,500 | Cancelled (red badge) | 12 Nov | "View"
  - Row 5: #AST-0038 | Sara Ahmed | SC5 VA-2460 | PKR 5,200 | Confirmed (blue badge) | 11 Nov | "View"
  - "View All Orders" link at bottom
- Quick actions row: "Add Product" button | "Upload Review" button
Navigation: "View" → Admin Order Detail, "View All Orders" → Admin Orders List, "Add Product" → Admin Add/Edit Product

SCREEN 14: Admin Orders List (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "All Orders"
- Filters row: Search by name/phone | Status filter dropdown (All | Pending | Confirmed | Shipped | Cancelled) | Date range picker
- Orders table (desktop) / list cards (mobile):
  - Columns: Order ID | Customer | Product | Qty | Total | Status | Date | Actions
  - 8 rows with realistic data, mix of all statuses
  - Each row: "View" icon button
  - Status badges: color-coded pills
- Pagination: Previous | 1 | 2 | 3 | Next
- Empty state: "No orders found" with filter reset
Navigation: "View" → Admin Order Detail

SCREEN 15: Admin Order Detail (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Back button "← All Orders"
- Page heading: "Order #AST-2025-0042"
- Two column layout (desktop) / stacked (mobile):
  - LEFT: Customer Information card:
    - Name: Muhammad Ali
    - Phone: 0300-1234567
    - WhatsApp: 0300-1234567
    - Full Address: House 23, Street 4, Gulshan-e-Iqbal
    - City: Karachi | Province: Sindh | ZIP: 75300
    - Country: Pakistan
    - Location: (google maps link or landmark text)
  - RIGHT: Order Information card:
    - Order ID: #AST-2025-0042
    - Date: 15 Nov 2025, 3:42 PM
    - Product: ASATEK SC5 VA-1260
    - Quantity: 2
    - Unit Price: PKR 4,500
    - Total: PKR 9,000 (highlighted red)
- Current Status badge (large): "Pending" in yellow
- Status Actions row (3 buttons):
  - Green "✓ Confirm Order" button
  - Purple "🚚 Mark as Shipped" button
  - Red "✕ Cancel Order" button
  - (Active button depends on current status — e.g. if Confirmed, only Shipped and Cancel are shown)
- WhatsApp quick action: "Send WhatsApp to Customer" green button (opens WhatsApp with pre-filled message)
- Status history log (optional): "Order Placed — 15 Nov 3:42 PM", "Confirmed — 15 Nov 4:00 PM"
Navigation: status buttons update status in-place | WhatsApp → external | back → Orders List

---
DEVICE INSTRUCTION:
Generate BOTH Mobile (375px) and Desktop (1440px) for each of the 4 screens.
Total outputs: 8 frames (4 screens × 2 devices).
```

---

### BATCH 4 — Screens 16–20 (Admin: Products, Add/Edit Product, Reviews, Service Centers, FAQ Manager)

```
Continue ASATEK Admin Panel. Apply same admin design direction as Batch 3.

Admin Layout: Left sidebar (desktop), hamburger (mobile)
Sidebar: Dashboard | Orders | Products | Reviews | Service Centers | FAQ | Logout
Colors: Red #CC0000 | White | Light Gray #F5F5F5 | Border #E0E0E0 | Success #28A745 | Danger #DC3545

---

SCREEN 16: Admin Products List (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "Products", right side: red "＋ Add Product" button
- Search bar + category filter (All | Solar Charge Controllers | UPS/Inverters | Battery Chargers | Parts)
- Products table (desktop) / list cards (mobile):
  - Columns: Image thumbnail | Product Name | Category | Price (PKR) | Status (Active/Hidden) | Actions
  - Rows:
    - SC5 VA-1260 | Solar Charge Controller | PKR 4,500 | Active | Edit / Delete
    - SC5 VA-2460 | Solar Charge Controller | PKR 5,200 | Active | Edit / Delete
    - SC6-1230 3-in-1 | Solar Charge Controller | PKR 3,800 | Active | Edit / Delete
    - SC6-2430 3-in-1 | Solar Charge Controller | PKR 4,200 | Active | Edit / Delete
    - UPS 1000W | UPS/Inverter | PKR 18,000 | Active | Edit / Delete
    - Battery Charger 12V 20A | Battery Charger | PKR 2,500 | Active | Edit / Delete
  - Delete shows confirmation dialog
  - Toggle to Active/Hidden
- Pagination
Navigation: "Add Product" → Admin Add/Edit Product (blank), "Edit" → Admin Add/Edit Product (pre-filled)

SCREEN 17: Admin Add/Edit Product (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "Add New Product" (or "Edit Product: SC5 VA-1260")
- Form card:
  - Product Name (text input)
  - Category (dropdown: Solar Charge Controller | UPS/Inverter | Battery Charger | Parts & Accessories)
  - Price in PKR (number input)
  - Status toggle: Active / Hidden
  - Short Description (textarea, 1-2 lines)
  - Full Description (rich textarea or multi-line)
  - Specifications (repeatable key-value pairs: + Add Spec row — e.g. "Type: PWM", "Voltage: 12V", "Current: 60A")
  - Features (repeatable list: + Add Feature — e.g. "Fan Cooled", "Full Metallic Body")
  - YouTube Video URL (text input, placeholder: https://youtube.com/...)
  - Product Images: drag-and-drop / file upload zone, thumbnail preview with ✕ delete, up to 5 images
  - Save button: red "Save Product" | Cancel link
- Validation: required fields highlighted red on submit
Navigation: Save → Admin Products List, Cancel → Admin Products List

SCREEN 18: Admin Reviews Manager (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "Customer Reviews"
- Upload zone: large dashed border area, "Drop review images here or click to upload" with upload icon, accepts JPG/PNG
- Uploaded reviews grid:
  - 2-col (mobile) / 4-col (desktop)
  - Each: review image, red ✕ delete button on hover/tap
  - Confirmation dialog on delete: "Delete this review image? This cannot be undone." — Cancel / Delete
- Empty state: "No reviews uploaded yet. Upload customer review images above."
Navigation: (page actions only)

SCREEN 19: Admin Service Centers Manager (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "Service Centers", red "＋ Add Center" button
- Service centers list/table:
  - Columns: City | Area/Address | Phone | Actions (Edit / Delete)
  - 8 rows with realistic Pakistan cities and addresses
- Add/Edit modal (inline or modal card):
  - City input
  - Area/Address input
  - Phone number input
  - Save / Cancel buttons
- Delete: confirmation dialog
Navigation: (page actions, modal-based)

SCREEN 20: Admin FAQ Manager (Mobile + Desktop)
Sections:
- Sidebar + top bar
- Page heading: "FAQ Manager", red "＋ Add FAQ" button
- FAQ list (draggable to reorder, drag handle on left):
  - Each row: drag handle | Question text (truncated) | Edit ✏️ | Delete 🗑️
  - 7 existing FAQ rows (same questions as public FAQ screen)
- Add/Edit FAQ modal:
  - Question (text input)
  - Answer (textarea)
  - Save / Cancel
- Delete confirmation dialog
- Empty state: "No FAQs yet. Click Add FAQ to get started."
Navigation: (modal-based, page actions only)

---
DEVICE INSTRUCTION:
Generate BOTH Mobile (375px) and Desktop (1440px) for each of the 5 screens.
Total outputs: 10 frames (5 screens × 2 devices).
```

---

## E. Instructions for You (Step-by-Step)

### How to Use These Prompts in Google Stitch

1. **Open Google Stitch** (stitch.withgoogle.com)
2. Start a new project named: `ASATEK_Website`
3. **Batch 1 first:** Copy the entire Batch 1 code block above and paste it into Stitch's prompt input
4. Stitch will generate screens. Review them and adjust if needed.
5. Continue with **Batch 2**, **Batch 3**, **Batch 4** in order.
6. After all batches are done, check consistency across all screens.

### Generating Mobile + Desktop in Stitch

- In the prompt, it says "Mobile (375px) and Desktop (1440px)"
- In Stitch interface: after generating, look for a **device toggle** or **duplicate frame** option
- If Stitch generates one device at a time: generate Mobile first, then duplicate the project/frame and generate Desktop version using same prompt with note "Desktop version 1440px wide"

### Screen Naming Convention (use exactly these names)

| Screen | Name to use in Stitch |
|--------|----------------------|
| 1 | Home |
| 2 | Products-List |
| 3 | Product-Detail |
| 4 | Order-Form |
| 5 | Order-Confirmation |
| 6 | Order-Tracking |
| 7 | Order-Status-Result |
| 8 | Service-Centers |
| 9 | Customer-Reviews |
| 10 | FAQ |
| 11 | About-Contact |
| 12 | Admin-Login |
| 13 | Admin-Dashboard |
| 14 | Admin-Orders-List |
| 15 | Admin-Order-Detail |
| 16 | Admin-Products-List |
| 17 | Admin-Add-Edit-Product |
| 18 | Admin-Reviews-Manager |
| 19 | Admin-Service-Centers |
| 20 | Admin-FAQ-Manager |

### Consistency Tips

- Keep navbar exactly the same across all public screens
- Keep sidebar exactly the same across all admin screens
- If a batch looks different in colors/fonts, use the Global Design Direction block to re-align

### Exporting the UI Zip

1. When all 20 screens (40 frames: Mobile + Desktop) are done and you're happy with them
2. In Stitch: **File → Export → Export Code (Zip)**
3. Name the file: `ASATEK_UI_Stitch.zip`
4. Upload this Zip to **Google Drive**
5. Share the Zip with Claude for review (Step 8 in workflow)
