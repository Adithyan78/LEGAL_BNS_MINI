# LexAI - AI-Powered Legal Research & Analysis System

## Overview

**LexAI** is an intelligent Retrieval-Augmented Generation (RAG) system designed to assist in understanding and analyzing criminal law provisions in India. It provides semantic search and detailed analysis of the **Bharatiya Nyaya Sanhita (BNS)** - India's new criminal code - with intelligent IPC to BNS mapping to facilitate the transition from the legacy Indian Penal Code.

The system combines advanced natural language processing, vector similarity search, and large language models to provide comprehensive legal insights and explanations for criminal law provisions, case analysis, and legal reasoning.

---

## Key Features

###  Semantic Search
- Search across 358+ BNS sections using natural language queries
- Find relevant legal provisions based on case descriptions
- Similarity scoring with configurable thresholds (default: 0.30)
- Fast retrieval using FAISS vector indexing

###  Comprehensive Knowledge Base
- **358 BNS Sections** fully indexed and searchable
- **500+ IPC Sections** mapped to their BNS equivalents
- **20 Chapters** covering all offense categories in criminal law
- Complete statutory text with explanations, illustrations, and exceptions
- Bidirectional IPC-to-BNS and BNS-to-IPC mapping

###  AI-Powered Legal Analysis
- Automatic query reformulation for better search results
- LLM-based legal analysis generation with:
  - Relevant BNS sections identification
  - Essential ingredients of the offense
  - Legal reasoning and precedents
  - Prescribed punishments and penalties
- Real-time streaming responses for interactive analysis

###  Interactive Chatbot Interface
- Multi-turn conversations with legal context awareness
- Auto-scrolling chat interface for seamless interaction
- Persistent chat history with search and filtering
- Suggested prompts to guide legal research
- Specialized legal response renderer with expandable sections
- Real-time thinking animations during processing

###  User Authentication & Management
- Secure JWT-based authentication (2-hour token expiry)
- Email provider validation (Gmail, Yahoo, Outlook, Hotmail)
- Strong password requirements (uppercase, lowercase, numbers, special chars)
- Bcrypt password hashing with salt rounds
- Persistent user profiles and chat history

###  IPC to BNS Migration Guide
- Easy navigation between old IPC and new BNS provisions
- Mapping shows corresponding sections and their differences
- Helps legal professionals transition to the new code

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Chatbot Interface | Auth | Home | Chat History │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/Axios
┌─────────────────▼──────────────────────────────────────┐
│               Backend (Express.js)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Auth | Chat Management | API Orchestration     │  │
│  │  (/signup, /login, /chats, /analyze-case)      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/Axios
┌─────────────────▼──────────────────────────────────────┐
│           AI Service (FastAPI + Python)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Query Reformulation | FAISS Retrieval | LLM     │  │
│  │  (Semantic Search, Legal Analysis, Streaming)   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ File I/O
┌─────────────────▼──────────────────────────────────────┐
│              Knowledge Base & Indices                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FAISS Index | BNS Sections | IPC-BNS Mapping   │  │
│  │  (358 Sections, 500+ Mappings, Pre-computed)    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                  │ Database Queries
┌─────────────────▼──────────────────────────────────────┐
│                    MongoDB                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  User Profiles | Chat History | Metadata        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Pipeline

1. **User Input** → Case description or legal query through chatbot
2. **Query Processing** → Backend receives request with authentication
3. **AI Pipeline Execution**:
   - Query reformulation using LLM
   - FAISS semantic search on BNS embeddings
   - Top-k relevant sections retrieved (k=5, threshold=0.30)
   - LLM-based legal analysis generation with streaming
4. **Response Flow**:
   - Streamed response chunked to frontend for real-time display
   - Structured legal analysis with sections, ingredients, reasoning, punishments
5. **Persistence** → Chat history saved to MongoDB
6. **Display** → Frontend renders with specialized legal response formatter

---

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with Vite
- **Routing**: React Router DOM 7.12.0
- **HTTP Client**: Axios 1.13.2
- **Utilities**: UUID 13.0.0 for unique identifiers
- **Styling**: CSS3 with responsive design

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB 9.1.3
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Middleware**: CORS, custom auth middleware
- **HTTP Client**: Axios for service-to-service communication

### AI/ML Service
- **Framework**: FastAPI (Python)
- **Vector Search**: FAISS (Facebook AI Similarity Search)
- **Embeddings**: Sentence Transformers (BAAI/bge-large-en-v1.5)
- **LLM**: Ollama with Gemma model
- **Data Storage**: JSON files for section databases and mappings
- **Python Version**: 3.8+

---

## Project Structure

```
d:\mini_project/
│
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── App.jsx                   # Main app component with routes
│   │   ├── main.jsx                  # React entry point
│   │   ├── Chatbot.jsx               # Main chatbot interface (1079 lines)
│   │   ├── Home.jsx                  # Landing page with feature showcase (651 lines)
│   │   ├── Auth.jsx                  # Login/Signup component
│   │   ├── Layout.jsx                # Navigation wrapper
│   │   ├── ProtectedRoute.jsx        # Auth protection wrapper
│   │   ├── *.css                     # Component-specific styles
│   │   └── assets/                   # Images and static files
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                           # Express.js backend server
│   ├── index.js                       # Main server (660 lines)
│   │   ├── Auth routes (/signup, /login)
│   │   ├── Chat routes (/chats, /chats/:id, etc.)
│   │   ├── AI integration endpoints (/analyze-case, /analyze-case-stream)
│   │   ├── Auth middleware
│   │   └── Error handling
│   ├── package.json
│   └── .env                           # Environment variables (not in repo)
│
├── ai-service/legal_rag/              # Python ML pipeline
│   ├── main.py                        # FastAPI application entry point
│   ├── pipeline.py                    # RAG pipeline (streaming + non-streaming)
│   ├── retriever.py                   # FAISS-based semantic search
│   ├── llm_ollama.py                  # LLM integration (Gemma model)
│   ├── requirements.txt               # Python dependencies
│   ├── faiss_max.bin                  # Pre-computed FAISS index
│   ├── faiss_max.pkl                  # Index metadata
│   ├── bns_max.json                   # BNS sections database
│   ├── bns_ipc_map_updated.json       # IPC-to-BNS mapping
│   ├── embeddings_max.pkl             # Pre-computed embeddings
│   ├── venv/                          # Python virtual environment
│   └── __pycache__/
│
├── bns_ipc_map_updated.json           # Root-level reference mapping
├── README.md                          # This file
└── .gitignore
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB (local or cloud instance)
- Ollama (for LLM inference)

### 1. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/lexai
JWT_SECRET=your_secret_key_here
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

### 3. AI Service Setup

```bash
cd ai-service/legal_rag
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Ensure Ollama is running with the Gemma model:
```bash
ollama run gemma
```

---

## Running the Application

### Terminal 1: Start AI Service
```bash
cd ai-service/legal_rag
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
python main.py
# Runs on http://localhost:8000
```

### Terminal 2: Start Backend
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Access the application at `http://localhost:5173`

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "email": "user@gmail.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```
Response: `{ token: "jwt_token", user: { id, email, fullName } }`

#### POST `/api/auth/login`
Login with existing credentials
```json
{
  "email": "user@gmail.com",
  "password": "SecurePass123!"
}
```
Response: `{ token: "jwt_token", user: { id, email, fullName } }`

### Chat Management Endpoints

All chat endpoints require `Authorization: Bearer <token>` header

#### GET `/api/chats`
Retrieve all chats for the authenticated user
Response: `[{ id, title, createdAt, messages }]`

#### POST `/api/chats`
Create a new chat
Response: `{ id, title, createdAt, messages: [] }`

#### GET `/api/chats/:id`
Get a specific chat by ID
Response: `{ id, title, createdAt, messages: [...] }`

#### PUT `/api/chats/:id`
Update chat title or add message
```json
{
  "title": "New Title",
  "message": { role: "user", content: "..." }
}
```

#### DELETE `/api/chats/:id`
Delete a chat

### AI Analysis Endpoints

All AI endpoints require `Authorization: Bearer <token>` header

#### POST `/api/analyze-case`
Get legal analysis for a case description
```json
{
  "caseDescription": "A stole B's property worth ₹5000..."
}
```
Response:
```json
{
  "relevantSections": [
    { "section": "BNS 304", "score": 0.95 }
  ],
  "analysis": {
    "sections": "...",
    "ingredients": "...",
    "reasoning": "...",
    "punishment": "..."
  }
}
```

#### POST `/api/analyze-case-stream`
Stream legal analysis in real-time
Same request format, response streamed as Server-Sent Events

---

## Usage Guide

### For Lawyers and Legal Professionals
1. Sign up with your email
2. Describe your case or legal scenario
3. LexAI analyzes and returns relevant BNS sections
4. Review detailed explanations including:
   - Applicable sections with similarity scores
   - Essential ingredients of the offense
   - Legal reasoning and precedents
   - Prescribed punishments
5. Save important analyses in chat history
6. Use IPC-to-BNS mapping for code transition reference

### For Law Students
1. Use the **Home** page to understand the BNS structure
2. Explore case scenarios through the chatbot
3. Learn how different sections apply to real situations
4. Review explanations and legal reasoning
5. Use search functionality to find specific sections

### For Researchers
1. Leverage semantic search to find related provisions
2. Analyze legal patterns across sections
3. Use IPC-BNS mapping for comparative research
4. Export chat history for documentation

---

## Development Status

### ✅ Completed
- Core RAG pipeline with semantic search
- 358 BNS sections fully indexed
- 500+ IPC-to-BNS mappings
- User authentication system
- Chatbot interface with auto-scrolling
- Chat persistence in MongoDB
- Streaming responses support
- Protected routes and auth middleware
- Query reformulation for better search
- Legal response rendering with section expansion

### 🔄 In Progress
- Embedding all sections optimizations
- Performance improvements

### 📋 Planned Features
- Case law summaries and precedent analysis
- Sentencing analysis and guidelines
- Comparative legal research tools
- Advanced filtering and sorting
- Export functionality (PDF, Word)
- Offline mode support
- Mobile app version
- Multi-language support

---

## Key Algorithms & Techniques

### Semantic Search (FAISS)
- Uses pre-trained Sentence Transformer embeddings (BAAI/bge-large-en-v1.5)
- Converts case descriptions to embeddings
- Performs cosine similarity search against BNS section embeddings
- Returns top-5 sections above similarity threshold (0.30)

### Query Reformulation
- Uses LLM to rephrase user queries for better semantic matching
- Improves relevance of retrieved sections
- Handles legal terminology normalization

### Legal Analysis Generation
- Uses Ollama Gemma model for analysis generation
- Structures output with sections, ingredients, reasoning, punishment
- Supports streaming for real-time response delivery

---

## Configuration

### Environment Variables

**Frontend (.env)**
- `VITE_API_URL`: Backend server URL

**Backend (.env)**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `AI_SERVICE_URL`: AI service URL

**AI Service (main.py)**
- `FAISS_INDEX_PATH`: Path to FAISS index file
- `SECTIONS_PATH`: Path to BNS sections JSON
- `MAPPING_PATH`: Path to IPC-BNS mapping
- `LLM_MODEL`: Ollama model name (default: gemma)
- `SIMILARITY_THRESHOLD`: Minimum similarity score (default: 0.30)

---

## Performance Metrics

- **FAISS Search**: ~50-100ms for 358 sections
- **Query Reformulation**: ~500-1000ms with LLM
- **Legal Analysis Generation**: ~2-5 seconds (streaming in real-time)
- **API Latency**: ~100-200ms for auth requests
- **Chat History Retrieval**: <50ms for MongoDB queries

---

## Security Considerations

✅ **Implemented**
- JWT-based authentication with expiry
- Password hashing with bcrypt (10 salt rounds)
- Email validation for authorized providers
- CORS middleware configuration
- Protected API endpoints with auth middleware
- Secure token storage in localStorage

⚠️ **Recommendations for Production**
- Use HTTPS/TLS for all communications
- Implement rate limiting on auth endpoints
- Add request validation and sanitization
- Enable MongoDB authentication and encryption
- Use environment-specific configuration
- Implement audit logging for sensitive operations
- Add CSRF protection
- Consider implementing OAuth2 for third-party access

---

## Troubleshooting

### AI Service Not Responding
```bash
# Ensure Ollama is running
ollama list
ollama run gemma

# Check AI service
curl http://localhost:8000/docs
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
mongod --version

# Check connection string in .env
# Format: mongodb://localhost:27017/lexai
```

### CORS Errors
- Verify `VITE_API_URL` in frontend .env matches backend URL
- Check CORS configuration in backend/index.js

### Chat History Not Saving
- Ensure MongoDB is connected
- Check JWT token validity (2-hour expiry)
- Verify auth middleware is applied to chat endpoints

---

## Contributing

To contribute to LexAI:

1. Create a feature branch (`git checkout -b feature/new-feature`)
2. Make your changes with clear commit messages
3. Test thoroughly in all three services
4. Submit a pull request with description of changes
5. Ensure code follows project conventions

---

## License

This project is provided as-is for educational and research purposes.

---

## Citation

If you use LexAI in your work, please cite as:

```
LexAI: An AI-Powered Legal Research System for Indian Criminal Law
Bharatiya Nyaya Sanhita (BNS) Analysis and IPC Mapping
```

---

## Contact & Support

For issues, questions, or suggestions:
- Report issues on GitHub
- For legal accuracy concerns, consult qualified legal professionals
- This system is a research prototype and should not be relied upon as sole legal counsel

---

## Disclaimer

⚠️ **IMPORTANT**: LexAI is an AI-powered research tool and should NOT be used as a substitute for professional legal advice. Always consult with qualified lawyers and legal professionals for actual legal matters. The system may contain errors or incomplete information. Users are responsible for verifying all legal information independently.

---

**Last Updated**: March 2, 2026
**Version**: 1.0.0 (Beta)
**Repository**: mini_project
**Branch**: adii