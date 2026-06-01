# PrepAI - AI-Powered Interview Preparation & Resume Customizer

PrepAI is a full-stack web application designed to help job seekers prepare for interviews and optimize their resumes. By analyzing target job descriptions against a user's resume, PrepAI generates customized interview preparation plans, provides technical/behavioral question guides, highlights skill gaps, and compiles custom, job-specific ATS-optimized resume PDFs.

---

## 🚀 Key Features

* **AI-Driven Profile Matching:** Instantly calculates a matching score (%) based on the alignment between your resume and the target job description.
* **Structured Interview Prep Guides:** Generates custom-tailored lists of technical and behavioral questions, complete with the interviewer's intent and guidelines on how to answer.
* **Diagnostic Skill Gap Analysis:** Automatically detects and ranks missing skills (Low, Medium, High severity) to target areas of improvement.
* **Custom Day-Wise Study Roadmaps:** Generates a structured preparation schedule with specific day-by-day tasks to bridge skill gaps.
* **ATS-Optimized Resume Tailoring:** Leverages generative AI to rewrite and tailor your resume for the target job description.
* **Headless PDF Generation:** Compiles the tailored resume into a clean, professional, and print-ready A4 PDF utilizing Puppeteer.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Sass (SCSS), Axios, React Router 7
* **Backend:** Node.js, Express, Multer, `pdf-parse`, Puppeteer
* **Database:** MongoDB (Mongoose)
* **AI Engine:** Google GenAI SDK (Gemini-3-Flash), Zod schema validation

---

## 📂 Project Structure

```text
├── Backend/                 # Express API server
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Authentication & Interview logic
│   │   ├── middlewares/     # JWT authentication & File parsing
│   │   ├── models/          # User & Interview report MongoDB schemas
│   │   ├── routes/          # Express API endpoints
│   │   └── services/        # Google GenAI & Puppeteer PDF services
│   ├── server.js            # Main backend entry point
│   └── package.json
│
└── Frontend/                # Vite React client
    ├── src/
    │   ├── features/        # Modular folder structures (Auth & Interview)
    │   │   ├── auth/        # Context, Pages, Hooks, API services
    │   │   └── interview/   # Context, Pages, Hooks, API services, styles
    │   ├── main.jsx         # Client mount point
    │   └── style.scss       # Global Sass variables & structure
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas connection URI)
* Google Gemini API Key (Obtain from [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and define the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📄 License
This project is licensed under the ISC License.
