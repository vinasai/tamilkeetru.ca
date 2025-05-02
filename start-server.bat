@echo off
ECHO Starting DailyPulse server...

REM Uncomment one of the following lines based on your MongoDB setup:

REM Local MongoDB (install MongoDB locally)
SET MONGODB_URI=mongodb://localhost:27017/dailypulse

REM Cloud MongoDB Atlas - Replace with your connection string
REM SET MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dailypulse?retryWrites=true&w=majority

SET SESSION_SECRET=dailypulse-session-secret
npm run dev 