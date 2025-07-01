# Factify - Social Media Learning Platform

![Factify Feed](docs/images/feed-page.png)

**Factify** transforms time spent on social media into an interactive and personalized learning experience. Designed as an educational alternative to traditional platforms, Factify blends the dynamics of a social network with structured, question-and-answer content, encouraging curiosity and personal growth.

This project is a Bachelor's Thesis for the **Faculty of Mathematics and Computer Science** at **Transilvania University of Brașov**, supervised by **Lect. dr. Vlad Monescu**.

## ✨ Key Features

-   **Personalized "For You" Feed**: An intelligent algorithm delivers educational posts based on your interests and past interactions.
-   **Interactive Content**: Posts are presented as "flip cards," initially showing a question and revealing the answer with a single click.
-   **Content Creation**: Users can contribute to the platform by creating their own question-and-answer posts across various categories.
-   **Social Interactions**: Like, share, and report posts. Connect with other users through friend requests.
-   **Real-Time Communication**: A private chat system and instant notifications provide a fluid and dynamic social experience.
-   **User Profiles**: Every user has a customizable profile page to showcase their activity and created posts.
-   **Moderation & Safety**: A dedicated admin panel for managing reported content ensures a safe and constructive environment.

---

## 🚀 How to Use Factify

The platform is designed to be intuitive and familiar to any social media user. Here’s how you can navigate the key functionalities:

### 1. Authentication & Registration

To access Factify, you can create a new account or log in if you already have one. On your first login, you'll be invited to select a few categories of interest to tailor your experience right from the start.

| Register Page                               | Login Page                               |
| ------------------------------------------- | ---------------------------------------- |
| ![Register Page](docs/images/register.png) | ![Login Page](docs/images/login.png) |

### 2. The Main Feed

The feed is the heart of the application, where you'll discover new content curated just for you.

-   **Browse**: Scroll vertically to move from one post to the next.
-   **Reveal the Answer**: Click anywhere on a post's card to "flip" it and see the answer. The fluid animation makes learning more engaging.

![Flip Card Interaction Demo](docs/images/flip-card-demo.gif)

### 3. Interacting with Posts

Each post includes a set of interaction buttons on the side:

-   ❤️ **Like**: Show your appreciation for a post. This helps the algorithm learn what content you enjoy.
-   ➤ **Share**: Share an interesting post with your friends directly within the app's chat.
-   🏳️ **Report**: If you find a post to be inappropriate, spam, or in the wrong category, you can report it for review.

![Post Interaction Buttons](docs/images/post-interactions.png)

### 4. Creating a Post

Contribute to the Factify community by creating your own educational content.

-   Navigate to the "Create" section from the sidebar.
-   Fill in the question, the answer, and select the appropriate category.
-   Click "Submit," and your post will become available to other users.

![Create Post Form](docs/images/create-post.png)

### 5. Searching for Users

Find and connect with other users through the search functionality in the sidebar. You can search by username and view their profiles.

![Search Menu](docs/images/search-menu.png)

### 6. User Profile

-   **Your Profile**: View all the posts you've created. You can also edit your username and profile picture to keep your identity up-to-date.
-   **Viewing Other Profiles**: See posts created by other users and send them a friend request to connect.

| Your Profile Page                               | Edit Profile Menu                               |
| ----------------------------------------------- | ----------------------------------------------- |
| ![User Profile Page](docs/images/profile-page.png) | ![Edit Profile Menu](docs/images/edit-profile.png) |

### 7. Chat & Notifications

-   **Notifications**: Receive real-time notifications for events like new friend requests. You can accept or deny requests directly from the notifications panel.
-   **Chat**: Once you are friends with another user, a private conversation is automatically created. You can exchange text messages, emojis, and even share posts from the feed directly into the chat.

![Chat Page](docs/images/chat-page.png)

### 8. Admin Panel

Users with an "Admin" role have access to a special "Verify Reports" panel. Here, they can:
-   View all active reports submitted by users.
-   Review the reported post and the reason for the report.
-   Decide to either permanently delete the post or dismiss the report.

![Admin Reports Page](docs/images/admin-reports.png)

---

## 🛠️ Tech Stack

-   **Frontend**: Angular 19, RxJS, PrimeNG, SCSS
-   **Backend**: ASP.NET Core 8, C#, Entity Framework Core
-   **Real-Time Communication**: SignalR
-   **Database**: Microsoft SQL Server
-   **Authentication**: JWT (JSON Web Tokens)

---

## ⚙️ Installation & Setup

To run this project locally, follow these steps.

### Prerequisites

-   [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
-   [Node.js and npm](https://nodejs.org/en)
-   [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### 1. Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/factify.git
cd factify/Backend/

# 2. Update the database connection string in `appsettings.json`
# "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=FactifyDB;Trusted_Connection=True;TrustServerCertificate=True;"

# 3. Restore dependencies and apply migrations
dotnet restore
dotnet ef database update

# 4. Run the backend server
dotnet run
