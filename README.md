# DonateBridge — Physical Donation Management System

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env                # already has sane SQLite defaults
python manage.py makemigrations
python manage.py migrate
python manage.py create_admin --email admin@example.com --password ChangeMe123
python manage.py test               # run the automated test suite
python manage.py runserver          # http://127.0.0.1:8000
```

## Frontend setup

```bash
cd frontend
npm install
cp env.example .env                # points at http://127.0.0.1:8000/api
npm run dev                         # http://localhost:5173
```
