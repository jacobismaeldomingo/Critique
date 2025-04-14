# 🎬 Critique – Film Diary & Tracker App

A Film Tracker Diary app that allows users to **record**, **track**, **rate** and **review** movies, TV
shows, and films they watch across different platforms. The purpose of this app is to
provide a personal central application for movie/tv enthusiasts who wants to track their
viewing history and people who loves rating films.

## Features

### Authentication

- Sign up & login with email/username and password
- Login with Google (supported on both iOS & Android)
- Password reset functionality (custom landing page)

### Watchlist & Tracking

- Add movies and series to a personal watchlist
- Track watched episodes by season and individual episodes
- Mark movies/series as watched

### Reviews & Ratings

- Write reviews and rate movies & TV series
- View community ratings and user-generated content

### Discovery & Search

- Browse by genres or curated lists (e.g., Trending, Popular, etc.)
- Search for specific titles (movies and series)

### User Profile

- Edit profile details
- Select and display favorite genres

### Extras

- Add a location to where the film/show was watched
- Upload and view photo memories per movie/series (with captions)
- Light & dark theme support for appearance customization
- Notification testing setup (in-progress)

## Tech Stack

- **Framework:** [Expo React Native](https://reactnative.dev/)
- **Database and Authentication:** [Firebase Console and Firestore Authentication](https://console.firebase.google.com/u/0/)
- **Image Cloud Service Storage:** [Cloudinary](https://cloudinary.com/)

## Prerequisites

Before setting up the project, ensure you have:

- [Xcode](https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators)
- [Setting Up Environment](https://reactnative.dev/docs/set-up-your-environment)
- [Android Studio](https://developer.android.com/studio/run/emulator)

## Installation

1. Clone the repository:
   ```sh
   git clone https://git.cs.dal.ca/courses/2025-winter/csci-4176_5708/project-milestone-3/jdomingo
   cd jdomingo
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application

Because I am using Google Authentication, Expo and other packages/libraries does not support custom native modules, I can only test my code, currently, by running a development build in IOS or Android.

```sh
// Running on IOS
npx expo run:ios

// Running on Android
npx expo run:android
```

## Additional Note:

Password Reset Page  
I’ve created a custom landing page using Next.js for users to reset their passwords via email.

[Reset Password Page](https://critique-pass-reset.vercel.app/)
