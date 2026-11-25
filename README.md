# AGRI.IN — Grow What the Market Needs.

A clean, beginner-friendly Smart Agriculture Platform built with **React**, **Vite**, and **Tailwind CSS**.

## Project Structure

- `index.html` — Main HTML file and title.
- `public/images/` — Local agriculture photos (`hero-farm.jpg`, `crop-harvest.jpg`, `village-agent.jpg`).
- `src/data/mockData.js` — Sample crops, buyer demands, mandi rates, weather alerts, and user lists.
- `src/components/` — Landing page sections (`Navbar`, `Hero`, `RoleCards`, `HowItWorks`, `MarketDemandSection`, `LiveMarketSection`, `WeatherAlertsSection`, `AboutContactSection`, `AuthModal`).
- `src/dashboards/` — Separate dedicated dashboards for each user role:
  - `FarmerDashboard.jsx`
  - `BuyerDashboard.jsx`
  - `VillageAgentDashboard.jsx`
  - `AdminDashboard.jsx`
- `src/App.jsx` — Connects the landing page, login/register modal, and all four dashboards.

## Run Locally

```bash
npm install
npm run dev
```
