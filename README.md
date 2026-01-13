# CookMate 🍳

CookMate is a modern, social mobile application for food enthusiasts to discover, share, and save delicious recipes. Built with React Native and Expo, it offers a seamless and interactive cooking experience.

## ✨ Features

- **🔐 User Authentication**
  - Secure Login & Registration.
  - Email Verification via OTP.
  - Profile Management (Avatar, Name).

- **🍕 Recipe Discovery**
  - Browse a rich feed of recipes.
  - View detailed recipe information including ingredients, instructions, and cooking time.
  - Filter and search for specific dishes (coming soon).

- **❤️ Social Interactions**
  - **Like** recipes to show appreciation.
  - **Comment** on recipes to share feedback or tips.
  - **Share** recipes instantly via native sharing options.

- **🔖 Bookmarks**
  - Save your favorite recipes to your personal collection for quick access.

- **🎨 Modern UI/UX**
  - Beautiful, responsive design.
  - **Dark Mode** and **Light Mode** support (System/Manual).
  - Smooth animations and transitions.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence
- **Networking**: Fetch API with custom hooks/stores
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Handling**: Expo Image
- **Storage**: Async Storage

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device (for physical testing).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avijit969/cookmate.git
   cd cookmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Ensure the API Endpoint in `constants/config.ts` is pointing to your backend server.

### Running the App

1. **Start the development server**
   ```bash
   npm run start
   # or
   npx expo start
   ```

2. **Open the app**
   - **Scanning the QR code**: Use the camera app (iOS) or Expo Go app (Android) to scan the QR code from the terminal.
   - **Emulators**: Press `a` for Android Emulator or `i` for iOS Simulator in the terminal window.

## 📱 Screenshots


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
