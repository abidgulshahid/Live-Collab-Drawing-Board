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


Deployment Instructions 🚀

Using GitHub Actions
	1.Set up a .github/workflows/deploy.yml file for your CI/CD pipeline.
	2.Add secrets for your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) in your GitHub repository settings.



Future Improvements 🛠️
	•Add Shapes: Support for different shapes like circles, rectangles, and lines.
	•Invitation System: Generate sharable links to invite others to collaborate.

License

This project is licensed under the MIT License.
Contributing 🤝
Contributions are welcome! Please open an issue or pull request for feature requests, bug fixes, or improvements.
Contact 📧
If you have any questions or suggestions, feel free to reach out:
•Name: Abid Gul Shahid
•Email: abidgulshahid@gmail.com

