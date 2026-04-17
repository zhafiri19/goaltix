# GOALTIX - World Cup 2026 Ticket Booking Platform

A modern, full-stack web application for purchasing World Cup 2026 tickets with real-time features and a Gen Z-inspired dark theme design.

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based login/registration system
- **Admin Panel**: Complete dashboard for managing matches, stadiums, users, and transactions
- **Real-time Updates**: WebSocket integration for live ticket stock updates
- **Payment Processing**: Secure transaction handling with multiple payment methods
- **Ticket Management**: Interactive ticket selection with real-time availability

### Design & UX
- **Dark Theme**: Modern glassmorphism design with neon accents
- **Responsive Design**: Mobile-first approach with smooth animations
- **Gen Z Aesthetics**: Micro-interactions, hover effects, and modern UI patterns
- **Flag System**: Dynamic country flags using flagcdn.com API

### Technical Features
- **TypeScript Backend**: Type-safe Node.js server with Express
- **MySQL Database**: Optimized database with comprehensive schema
- **WebSocket Server**: Real-time communication for live updates
- **JWT Security**: Secure authentication with role-based access control
- **Rate Limiting**: API protection against abuse

## Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** (minimal framework)
- **MySQL** with native driver
- **WebSocket** (ws library)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **dotenv** for environment variables

### Frontend
- **HTML5** + **Tailwind CSS**
- **Vanilla JavaScript** (no frameworks)
- **Font Awesome** for icons
- **Chart.js** for admin dashboard charts
- **flagcdn.com** for country flags

### Database
- **MySQL** with comprehensive schema
- **Manual queries** (no ORM)
- **Connection pooling** for performance

## Project Structure

```
goaltix/
|--------------------------------------------------------------------------
| server/                          # Backend Node.js server
|   src/
|   |   config/                     # Database and JWT configuration
|   |   controllers/                # Request handlers
|   |   middleware/                 # Authentication middleware
|   |   models/                     # Data models and business logic
|   |   routes/                     # API route definitions
|   |   websockets/                 # WebSocket server
|   |   utils/                      # Utility functions
|   |   app.ts                      # Main application entry
|   .env                            # Environment variables
|   package.json                    # Dependencies
|   tsconfig.json                   # TypeScript configuration
|--------------------------------------------------------------------------
| client/                          # Frontend application
|   pages/
|   |   admin/                      # Admin panel pages
|   |   user/                       # User-facing pages
|   assets/
|   |   js/                        # JavaScript modules
|   index.html                      # Homepage
|--------------------------------------------------------------------------
| database/
|   schema.sql                      # Database schema and seed data
|--------------------------------------------------------------------------
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE goaltix;
   ```

2. **Import Schema**
   ```bash
   mysql -u root -p goaltix < database/schema.sql
   ```

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Build and run**
   ```bash
   npm run build
   npm start
   # For development:
   npm run dev
   ```

### Frontend Setup

The frontend is served directly from the backend server. No additional setup required.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/:id` - Get match details
- `GET /api/matches/:matchId/tickets` - Get match tickets
- `POST /api/matches` - Create match (admin)
- `PUT /api/matches/:id` - Update match (admin)
- `DELETE /api/matches/:id` - Delete match (admin)

### Transactions
- `POST /api/transactions/checkout` - Create transaction
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/admin/transactions` - Get all transactions (admin)
- `PATCH /api/transactions/:id/status` - Update transaction status (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stadiums` - Get all stadiums
- `POST /api/admin/stadiums` - Create stadium
- `PUT /api/admin/stadiums/:id` - Update stadium
- `DELETE /api/admin/stadiums/:id` - Delete stadium

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `role`, `is_active`, `created_at`

### Matches
- `id`, `home_team_code`, `away_team_code`, `stadium_id`, `match_date`, `status`, `scores`

### Stadiums
- `id`, `name`, `city`, `country`, `capacity`

### Tickets
- `id`, `match_id`, `category`, `price`, `stock`

### Transactions
- `id`, `user_id`, `total`, `status`, `payment_method`, `created_at`

### Transaction Items
- `id`, `transaction_id`, `ticket_id`, `quantity`, `price`

## Real-time Features

### WebSocket Events
- `ticket_update` - Real-time stock updates
- `transaction_success` - Purchase confirmations
- `match_update` - Match status changes

### Connection
- WebSocket server runs on `ws://localhost:5000/ws`
- Authentication via JWT token in query string
- Automatic reconnection on disconnect

## Authentication & Security

### JWT Tokens
- Access tokens valid for 24 hours
- Role-based authorization (user/admin)
- Middleware protection for sensitive routes

### Security Features
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention with prepared statements

## Default Credentials

### Admin User
- **Email**: admin@goaltix.com
- **Password**: password

*(Note: Change default credentials in production)*

## Development

### Running in Development Mode
```bash
cd server
npm run dev
```

### Database Migrations
The schema.sql file includes both structure and seed data. Simply import it to set up a complete development environment.

### Code Style
- TypeScript for type safety
- Consistent naming conventions
- Modular architecture
- Comprehensive error handling

## Production Deployment

### Environment Variables
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=goaltix
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Build Process
```bash
npm run build
npm start
```

### Recommended Setup
- Use PM2 for process management
- Configure reverse proxy (nginx/Apache)
- Enable HTTPS
- Set up database backups
- Configure monitoring and logging

## Features Roadmap

### Phase 1 (Current)
- [x] Basic ticket booking
- [x] User authentication
- [x] Admin dashboard
- [x] Real-time updates

### Phase 2 (Planned)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API rate limiting tiers
- [ ] Microservices architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@goaltix.com
- Documentation: [Link to docs]

## Acknowledgments

- World Cup 2026 official data
- flagcdn.com for country flags
- Tailwind CSS for styling
- Chart.js for data visualization
- Font Awesome for icons

---

**GOALTIX** - Your gateway to World Cup 2026!
