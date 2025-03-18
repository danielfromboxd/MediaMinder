# ![MediaMinder](frontend/public/Logo.png) MediaMinder

MediaMinder is a comprehensive media tracking application that helps you manage your books, movies, and TV shows all in one place. Never lose track of what you've watched, read, or want to experience next.

## 📋 Features

- **Universal Media Tracking**: Track books, movies, and TV shows in a single webapp
- **Status Management**: Organize media into "Want to Watch/Read", "In Progress", and "Finished" collections
- **Personal Ratings**: Rate your media from 1-5 stars
- **Smart Recommendations**: Get personalized recommendations based on your ratings and preferences
- **New Releases**: Discover new content in the "New This Quarter" section
- **Search**: Search across multiple platforms (TMDB and OpenLibrary) to find new series to binge, movies to watch and books to read
- **Responsive Design**: Works beautifully on both desktop and mobile devices
- **User Accounts**: Personal tracking with secure authentication

## 📱 Usage

### Registration and Login
Create an account to start tracking your media collection. Your data will be securely stored and accessible across devices.

### Adding Media
1. Navigate to Books, Movies, or TV Shows section
2. Search for your desired media
3. Click on the result to view details
4. Click "Add to..." to add to your collection with the desired status

### Tracking Status
Change the status of your media as you progress:
- **Want to Watch/Read**: Your wishlist
- **In Progress**: Currently watching/reading
- **Finished**: Completed media

### Rating Media
After finishing a book, movie, or show, rate it from 1-5 stars to improve your recommendations.

## 🔧 Technology Stack

### Backend
- **Flask**: Lightweight Python web framework for the API
- **SQLAlchemy**: ORM for database interactions
- **JWT**: Token-based authentication
- **PostgreSQL**: Relational database for storing user data and media tracking

### Frontend
- **React**: Component-based UI library
- **TypeScript**: Static typing for improved developer experience and code quality
- **TailwindCSS**: Utility-first CSS framework for styling
- **Lucide Icons**: Simple, consistent icon set
- **React Query**: Data fetching and cache management
- **React Router**: Client-side routing

### External APIs
- **TMDB API**: For movie and TV show data
- **OpenLibrary API**: For book information and covers

## 🏗️ Architecture

MediaMinder follows a modern client-server architecture:

- **RESTful API**: Flask backend providing JSON endpoints
- **Client-Side Rendering**: React frontend consuming the API
- **Token Authentication**: JWT for secure user sessions
- **External API Integration**: Proxy requests to TMDB and OpenLibrary

## 🚀 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/mediaminder.git
cd mediaminder

# Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
cd backend
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Initialize database
flask db upgrade

# Run development server
flask run
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

### Frontend

```
frontend/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts (auth, media tracking)
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API service functions
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript type definitions
```

### Backend

```
backend/
├── app/
│   ├── models/       # Database models
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   └── utils/        # Helper functions
├── migrations/       # Database migrations
└── config.py         # Configuration
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Log in and receive JWT token
- `GET /api/auth/user` - Get current user profile

### Media Tracking
- `GET /api/media` - Get user's tracked media
- `POST /api/media` - Add new media to tracking
- `PUT /api/media/:id` - Update media status or rating
- `DELETE /api/media/:id` - Remove media from tracking

### Search and Discovery
- `GET /api/search/movies` - Search TMDB for movies
- `GET /api/search/tvshows` - Search TMDB for TV shows
- `GET /api/search/books` - Search OpenLibrary for books

## 🔜 Future Enhancements

- A grid featuring prominent cast members of series and movies
- Media statistics and reading/viewing history
- More granular tracking system: seasons and episodes watched for series, minutes watched for movies, and chapters and pages read for books.
- A more elaborate review system
- Social features to share and recommend media with friends
- Custom tags and collections

## 🙏 Acknowledgments

- [TMDB API](https://www.themoviedb.org/documentation/api) for movie and TV data
- [OpenLibrary API](https://openlibrary.org/developers/api) for book data
- All the open source libraries that made this project possible

---

Created by Daniel Mata Alves, Luca Nowak and Anurag Mall
