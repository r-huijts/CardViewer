# Card Viewer - Student Challenge Cards

A React TypeScript application for displaying student challenge cards with flip animations and admin management capabilities.

## Features

- **Card Grid Display**: Responsive grid layout showing student challenge cards
- **Flip Animation**: Hover over cards to see descriptions on the back
- **Admin Interface**: Login to add, edit, and delete cards
- **Image Upload**: Upload images for cards with file handling
- **Responsive Design**: Mobile-friendly layout with warm beige aesthetic
- **MySQL Storage**: Persistent storage for cards and admin authentication

## Tech Stack

- **Frontend**: React + TypeScript + CSS
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: MySQL
- **Authentication**: Session-based with bcrypt
- **File Upload**: Multer for image handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Install and start MySQL server
2. Create the database and tables:
   ```sql
   mysql -u root -p < backend/database.sql
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=card_viewer
   DB_PORT=3306
   SESSION_SECRET=your-secret-key-here
   PORT=5000
   ```

4. Build and start the backend:
   ```bash
   npm run build
   npm start
   ```

   For development with hot reload:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Admin Access

To access the admin features (add/edit/delete cards):

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Admin Features:**
- Add new cards with title, subtitle, description, and image upload
- Edit existing cards (click the green "Edit" button on any card)
- Delete cards (click the red "Delete" button on any card with confirmation)
- All changes are immediately reflected in the card grid

## Project Structure

```
CardViewer/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── cards.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── database.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── uploads/
│   ├── database.sql
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Card.tsx
│   │   │   ├── CardGrid.tsx
│   │   │   ├── CardForm.tsx
│   │   │   ├── Login.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/status` - Check authentication status

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get single card
- `POST /api/cards` - Create new card (requires auth)
- `PUT /api/cards/:id` - Update card (requires auth)
- `DELETE /api/cards/:id` - Delete card (requires auth)

### Static Files
- `GET /uploads/:filename` - Serve uploaded images

## Usage

1. **Public View**: Visit the main page to see all cards in a grid layout
2. **Card Interaction**: Hover over cards to see descriptions
3. **Admin Access**: Click "Admin Login" to access the management interface
4. **Add Cards**: Use the "Add New Card" button to create new challenge cards
5. **Edit/Delete**: Use the edit/delete buttons on cards in admin mode

## Development

For development, run both frontend and backend servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application supports hot reloading for both frontend and backend changes.