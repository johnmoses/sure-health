# SureHealth Seed Data Instructions

## Quick Start (Recommended)

For immediate testing:
```bash
python quick_seed.py
```

**Test Credentials:**
- Admin: `admin` / `Admin123!`
- Doctor: `doctor` / `Doctor123!`
- Patient: `patient1` / `Patient123!`

## Full Seed Data

For comprehensive testing with realistic data:
```bash
python seed_data.py
```

**Includes:**
- 9 users (admin, doctors, nurses, patients)
- 5 patients with complete profiles
- 5 chat rooms with sample messages
- Clinical encounters and observations
- Prescriptions and medications
- Billing invoices and payments
- Medical knowledge documents for RAG

## Database Reset

To start fresh:
```bash
python reset_db.py
python quick_seed.py  # or seed_data.py
```

## Usage with Postman

1. Run seed script
2. Import `postman_collections.json`
3. Use "Login User" request with test credentials
4. JWT token will auto-populate for other requests

## Environment Setup

Ensure these are set in your `.env`:
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///db.sqlite3
```