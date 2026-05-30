 Distributed E-Commerce Price Arbitrage Engine
This forces the agent to build a distributed backend system, handle database schemas, and orchestrate headless browser automation.

Prompt for Antigravity: "Architect a distributed price-tracking engine using Go (Golang). Create a core API server that manages a PostgreSQL database (write the schema for Products, Prices, and Retailers). Then, write a separate worker service using Playwright (in Go or Node.js) that runs on a schedule. The worker should take a list of product URLs from the database, launch a headless browser to scrape the current price from three different dummy e-commerce sites, normalize the currencies, and send the data back to the core API via gRPC. Finally, build a simple Next.js dashboard that displays a price-history line chart for each product, highlighting when arbitrage opportunities exist."
# High-Fidelity UI Reconstruction Prompt: Precision Arbitrage Engine

## Visual Identity & Branding
- **Design System:** Precision Arbitrage Engine (Light Mode).
- **Primary Palette:** Deep navy backgrounds for sidebars (`#0f172a`), slate/white surfaces for main content (`#f7f9fb`), with high-contrast emerald green (`#10b981`) and alert red (`#ef4444`) for data indicators.
- **Typography:** Inter (Sans-serif), utilizing a clean scale from `headline-md` for page titles to `label-caps` for status indicators.
- **Roundness:** Sharp `ROUND_FOUR` (4px) corner radii for cards and buttons to maintain a professional, technical aesthetic.

## Layout Structure
- **Navigation Shell:** Fixed 240px Sidebar (`SideNavBar`) on the left with tabs for Overview, Products, Retailers, and Alerts. Top Header (`TopNavBar`) spanning the remaining width with a global SKU search bar and system status icons (sensors, speed, account).
- **Grid System:** A modular 12-column dashboard layout with a focus on high data density.

## Key UI Components
1. **System Health Metrics (Top Row):** Three distinct stat cards showing:
   - **Total Products Tracked:** Large counter with a "box" icon.
   - **Active Workers:** Counter with a "terminal" icon and "Online" status badge.
   - **Opportunities Detected:** Counter with a "lightning" icon and percentage change (e.g., +12% vs 24h).
2. **Market Arbitrage Grid:** A collection of product-specific cards showing:
   - 7-day price trend sparklines.
   - Comparative pricing list (ShopA, MarketB, Z-Store).
   - "Spread %" badges with conditional coloring.
   - Status labels: "ARBITRAGE ALERT" (Red) vs "STABLE" (Slate).
3. **System Performance (Bottom Row):** Real-time monitoring cards for:
   - **Scraping Success:** Percentage with a performance sparkline.
   - **gRPC Latency:** Millisecond measurements.
   - **DB Throughput:** Transactions per second (tps) sparkline.
4. **Activity & Status (Right Sidebar/Column):**
   - **Recent Global Activity:** A vertical feed of system events (Scrape success, Arbitrage alerts, Sync completions).
   - **Worker Status Distribution:** A multi-segmented progress bar or stacked list showing Active vs. Idle vs. Retrying counts.

## Implementation Requirements
- **Framework:** Next.js (App Router) for the dashboard.
- **Interactivity:** Tooltips for sparkline data points, hover states on navigation items, and real-time polling indicators.
- **Data Flow:** UI should reflect data ingested via gRPC from a Go-based distributed worker fleet, stored in a PostgreSQL schema.
