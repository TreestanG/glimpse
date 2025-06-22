# Glimpse

Running the Glimpse Next.js Frontend
bash
Copy
Edit
# 1 · Install dependencies
pnpm install          # or: npm install / yarn

# 2 · Add environment keys
cp .env.example .env.local
# edit .env.local:
# NEXT_PUBLIC_LIVEKIT_URL = https://your-livekit-server
# (OPTIONAL) NEXT_PUBLIC_LIVEKIT_API_KEY / SECRET = ...

# 3 · Start in dev mode
pnpm dev               # http://localhost:3000
Production build

bash
Copy
Edit
pnpm build
pnpm start


![image](https://github.com/user-attachments/assets/6a190a94-a571-47d6-b90e-e6e1422f006d)

![image](https://github.com/user-attachments/assets/630ec996-f4db-47e9-96d1-c7021cb716e7)


