# MEVN Live Collaboration Drawing Tool

A real-time collaborative drawing application built with MEVN (MongoDB, Express.js, Vue.js, Node.js), Redis, and AWS. It supports user authentication, profile management, and JWT-based logout. Users can draw together in real time, use various tools, and customize their drawing experience.

### Features 🚀
	1.User Authentication
	•JWT-based secure authentication.
	2.Profile Management
	•Manage and update user details seamlessly.
	3.Logout with JWT Blacklisting
	•Ensures secure logout by blacklisting JWT tokens using Redis.
	4.Live Collaboration Drawing Tool 🎨
	•Real-time collaborative canvas.
	•Features include:
	•Pen tool (adjustable size and color).
	•Eraser tool.
	•Live user connections display.

### Tech Stack 🛠️
	•Backend:
	•Node.js 22, Express.js
	•MongoDB for data storage
	•Redis for JWT blacklisting
	•Frontend:
	•Vue.js 3
	•Vuetify for UI components
	•Cloud Infrastructure:
	•AWS EC2 for virtual servers
	•AWS EBS for application deployment
	•AWS S3 for hosting static assets
	•CI/CD:
	•GitHub Actions for automated deployment pipelines

Setup Instructions 🛠️

### Prerequisites

Ensure you have the following installed:
•Node.js (v22+)
•MongoDB
•Redis
•AWS CLI configured (if deploying to AWS)
•Git

1. Clone the Repository

git clone https://github.com/your-repo/live-drawing-tool.git
cd live-drawing-tool

2. Backend Setup
	1.	Navigate to the backend folder:

cd server


	2.	Install dependencies:

npm install


	3.	Configure environment variables:
	•	Create a .env file in the server directory.
	•	Add the following variables:

PORT=5000
MONGODB_URI=<your-mongodb-uri>
REDIS_URI=<your-redis-uri>
JWT_SECRET=<your-jwt-secret>
AWS_S3_BUCKET=<your-s3-bucket>


	4.	Start the backend server:

npm start

3. Frontend Setup
	1.	Navigate to the frontend folder:

cd client


	2.	Install dependencies:

npm install


	3.	Update API endpoint in config.js or .env file:

VITE_API_URL=http://localhost:5000


	4.	Start the frontend server:

npm run dev

4. Redis Setup

Make sure Redis is installed and running locally or on a remote server.

5. Run the Application
	1.	Start the backend server.
	2.	Start the frontend server.
	3.	Access the app at: http://localhost:5173

Deployment Instructions 🚀

Using GitHub Actions
	1.	Set up a .github/workflows/deploy.yml file for your CI/CD pipeline.
	2.	Add secrets for your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) in your GitHub repository settings.

Example Pipeline:

name: Deploy to AWS EC2

on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Dependencies
        run: |
          cd server && npm install
          cd ../client && npm install

      - name: Build Frontend
        run: |
          cd client
          npm run build

      - name: Deploy to EC2
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          # SSH into EC2 and deploy
          ssh -o StrictHostKeyChecking=no ec2-user@<your-ec2-ip> << 'EOF'
          cd /path/to/project
          git pull origin main
          pm2 restart all
          EOF

Future Improvements 🛠️
	•	Add Shapes: Support for different shapes like circles, rectangles, and lines.
	•	Chatroom: A live chat feature for better collaboration.
	•	Invitation System: Generate sharable links to invite others to collaborate.

License

This project is licensed under the MIT License.

Contributing 🤝

Contributions are welcome! Please open an issue or pull request for feature requests, bug fixes, or improvements.

Contact 📧

If you have any questions or suggestions, feel free to reach out:
	•	Name: Abid Gul Shahid
	•	Email: your-email@example.com

This README gives clear instructions and aligns with modern best practices for project documentation. Let me know if you’d like to tweak anything! 🚀
