# 💚 spotify stats roaster (but make it brat)

a full-stack **MERN** application that authenticates with spotify, analyzes your listening history, and uses **Google Gemini AI** to generate a brutal, sarcastic roast of your music taste. the entire UI is styled with the "brat" aesthetic (neon green, stark black, brutalist typography).

![project screenshot](https://github.com/vanie0000/spotify-roaster/tree/main/imgs/roast.png)

## 💚 features

* **spotify authentication:** secure OAuth 2.0 login flow to access user data.
* **data analysis:** fetches user's top artists and tracks via Spotify Web API.
* **AI roasting:** integrates **Google Gemini API** (`gemini-3-flash-preview`) to generate unique, context-aware insults based on listening habits.
* **persistence:** saves user stats and generated roasts to a **MongoDB** database.
* **brat UI:** custom CSS implementation of the viral charli xcx "brat" aesthetic.

## 🛠️ tech stack

* **frontend:** React.js, Vite, CSS
* **backend:** Node.js, Express.js
* **database:** MongoDB (Atlas)
* **AI:** Google Gemini SDK (@google/generative-ai)
* **APIs:** Spotify Web API

## 🚀 getting started

follow these steps to run the project locally.

### prerequisites
* node.js & npm installed
* a [Spotify Developer](https://developer.spotify.com/) account
* a [Google AI Studio](https://aistudio.google.com/) API Key
* a [MongoDB Atlas](https://www.mongodb.com/atlas) Cluster

### 1. clone the repository

```

git clone [https://github.com/vanie0000/spotify-roaster.git](https://github.com/vanie0000/spotify-roaster.git)
cd spotify-roaster

```

### 2. backend setup

navigate to the server folder and install dependencies.

```

cd server
npm install

```

create a .env file in the server directory and add your credentials:

```

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://127.0.0.1:8888/callback
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=8888

```

start the backend server

```

node index.js

```

*you should see: ✅ Server running on http://127.0.0.1:8888 and ✅ Connected to MongoDB*

### 3. frontend setup

open a new terminal, navigate to the client folder, and install dependencies:

```

cd client
npm install

```

start the react development server

```

npm run dev

```

*open the link provided (usually http://localhost:5173) to view the app.*

## 💚 credits

- inspired by the "brat" album aesthetic by my beloved charli xcx.
