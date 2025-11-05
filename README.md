# Lead Bridge – Backend (Express + MongoDB)

This is the backend API for the Lead Bridge CRM App.  
It provides endpoints for managing **agents, leads, comments**, and generating **reports**.

---

## 📦 Project Structure
```

backend/
├── db/
│   └── db.connect.js        # MongoDB connection
├── models/
│   ├── agent.model.js       # Agent schema
│   ├── lead.model.js        # Lead schema
│   └── comment.model.js     # Comment schema
├── index.js                 # Express app & routes
├── .env.example             # Template for environment variables
└── README.md                # This file

````

---

## ⚙️ Setup Instructions

1. Navigate to the backend folder:

```bash
cd backend
````

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from example:

```bash
cp .env.example .env
```

4. Edit `.env` and add your MongoDB URI:

```env
MONGODB=your-mongodb-uri-here
PORT=3000
```

5. Run the server:

```bash
node index.js
```

Or with auto-reload:

```bash
npx nodemon index.js
```

API runs at: `http://localhost:3000`

---

## 🌐 API Endpoints

### 👥 Agents

* Add new agent → `POST /agents`
* Get all agents → `GET /agents`
* Update agent → `POST /agents/:id`
* Delete agent → `DELETE /agents/:id`
* Get leads by agent → `GET /agents/leads/:id`

### 👟 Leads

* Add new lead → `POST /leads`
* Get all leads → `GET /leads`
* Update lead → `POST /leads/:id`
* Delete lead → `DELETE /leads/:id`
* Get lead by ID → `GET /leads/:id`

### 💬 Comments

* Add comment → `POST /comments/:id`
* Get comments → `GET /leads/comments/:id`
* Update comment → `POST /comments/update/:id`
* Delete comment → `DELETE /comments/:id`

### 📊 Reports

* Leads closed in last week → `GET /report/last-week`
* Total leads in pipeline → `GET /report/pipeline`
* Leads by agent → `GET /leads-by-agent`
* Lead status distribution → `GET /report/status-distribution`

---

## 🔑 Environment Variables

Your `.env` should include:

```env
MONGODB=your-mongodb-uri
PORT=3000
```

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)






