# 📊 PollPulse

### Real-Time Polling & Opinion Platform

PollPulse is a full-stack web application that allows users to create, participate in, and analyze polls in an interactive environment. The platform is designed to make collecting opinions simple while providing users with clear and visual insights from poll responses.

---

## 🚀 Features

* 🗳️ **Create Polls** – Create custom polls with multiple options.
* ⚡ **Real-Time Updates** – Poll results can be updated dynamically.
* 📊 **Live Results & Analytics** – Visualize poll responses using interactive charts.
* 🔎 **Poll Discovery** – Browse and interact with available polls.
* 🏷️ **Category-Based Polls** – Organize polls using categories/topics.
* 📱 **Responsive UI** – Designed to work across different screen sizes.
* 🔐 **User Authentication** – Support for user/session-based functionality.
* 🗄️ **Database Integration** – Persistent storage for application data.
* 🔄 **Client–Server Communication** – REST APIs and WebSocket-based communication.
* 🎨 **Modern Interface** – Built using React and Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* Wouter
* React Hook Form
* TanStack React Query
* Chart.js
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* WebSockets

### Database

* PostgreSQL
* Neon Database
* Drizzle ORM
* Drizzle Kit

### Development Tools

* Git
* GitHub
* npm
* VS Code

---

## 🏗️ Project Architecture

```text
PollPulse
│
├── client/              # Frontend application
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application pages
│   └── ...
│
├── server/              # Backend application
│   ├── routes/           # API routes
│   ├── services/         # Backend services
│   └── ...
│
├── shared/              # Shared types and schemas
│
├── package.json         # Project dependencies and scripts
├── vite.config.ts       # Vite configuration
├── drizzle.config.ts    # Drizzle configuration
├── tailwind.config.ts   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) 20+
* npm
* Git
* PostgreSQL database or a compatible Neon database

---

### 1. Clone the Repository

```bash
git clone https://github.com/Hitesh-Mudiraj/poll-pulse.git
```

Move into the project directory:

```bash
cd poll-pulse
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root and configure the required database/environment variables.

Example:

```env
DATABASE_URL=your_database_connection_string
```

> Do not commit your `.env` file or expose database credentials publicly.

---

### 4. Set Up the Database

Run the Drizzle database migration/push command:

```bash
npm run db:push
```

---

### 5. Start the Development Server

```bash
npm run dev
```

The application will start in development mode.

---

## 📜 Available Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Starts the development server                  |
| `npm run build`   | Builds the frontend and backend for production |
| `npm start`       | Starts the production build                    |
| `npm run check`   | Runs TypeScript type checking                  |
| `npm run db:push` | Pushes the Drizzle schema to the database      |

---

## 🔄 How PollPulse Works

```text
        ┌──────────────────┐
        │      User        │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  React Frontend  │
        └────────┬─────────┘
                 │
          API / WebSocket
                 │
                 ▼
        ┌──────────────────┐
        │ Express Backend  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ PostgreSQL /     │
        │ Neon Database    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Poll Results &   │
        │ Analytics        │
        └──────────────────┘
```

---

## 📊 Analytics

PollPulse uses charting libraries to convert collected responses into easy-to-understand visual information.

The application can present poll data through interactive charts and statistical visualizations, helping users quickly understand response patterns.

---

## 🔌 Real-Time Communication

PollPulse uses WebSocket technology alongside standard client-server communication.

This allows the application to support dynamic updates without requiring users to manually refresh the page.

---

## 🎯 Use Cases

PollPulse can be used for:

* 📚 Student surveys
* 🏫 College feedback
* 💼 Team decision-making
* 🎤 Event audience polling
* 🌐 Community opinions
* 📈 Quick market research
* 🗳️ Informal voting and opinion collection

---

## 💡 Future Improvements

Possible future enhancements include:

* [ ] Google/GitHub authentication
* [ ] Anonymous polling
* [ ] Advanced poll analytics
* [ ] Export results as CSV/PDF
* [ ] Poll sharing through unique links
* [ ] Poll expiration and scheduling
* [ ] Email notifications
* [ ] Admin dashboard
* [ ] Improved mobile experience
* [ ] Deployment with CI/CD
* [ ] More advanced real-time analytics

---

## 👨‍💻 Author

**Hitesh Rampe**

B.Tech – Artificial Intelligence & Data Science

GitHub:
https://github.com/Hitesh-Mudiraj

---

## 📂 Repository

🔗 **PollPulse GitHub Repository:**
https://github.com/Hitesh-Mudiraj/poll-pulse

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you find this project useful, consider giving the repository a star!
