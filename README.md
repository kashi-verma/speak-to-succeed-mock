# SpeakSuccess 🎤 – Voice AI Mock Interview App

**SpeakSuccess** is an AI-powered voice-to-voice mock interview simulator that helps job seekers prepare for real-world interviews. It delivers dynamic, role-specific questions, listens to your spoken answers, and continues the conversation just like a real interviewer.

---

## 🌟 Features

- 🎯 **Role-Based Interview Tracks**  
  Choose from roles like Software Engineer, Product Manager, or Business Analyst to get tailored questions.

- 🗣️ **Voice Input**  
  Answer questions naturally using your microphone with live voice-to-text.

- 🔊 **Audio Feedback**  
  Questions are spoken aloud using AI-powered text-to-speech for a realistic mock interview experience.

- 🔁 **Conversational Loop**  
  After each answer, the AI follows up with the next relevant question automatically.

---

## 📸 Screenshots

### 🎯 Home Page
![Home Page](/src/assets/image1.png)

### 👨‍💻 Role Selection
![Role Selection](/src/assets/image2.png)

### 🧠 Interview Simulation
![Interview Interface](/src/assets/image3.png)

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn-ui
- **Voice Input**: Web Speech API (or Google STT)
- **Voice Output**: Text-to-Speech via browser or external API
- **AI Brain**: Powered by OpenAI API (connected via Lovable backend)

---

## 🚀 Getting Started (Local Development)

```bash
# Clone the project
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
