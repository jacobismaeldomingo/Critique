# Critique

A Film Tracker Diary app that allows users to record, track, rate and review movies, TV
shows, and films they watch across different platforms. The purpose of this app is to
provide a personal central application for movie/tv enthusiasts who wants to track their
viewing history and people who loves rating films.

## Features

- Users can Login and Sign up using email/username and password.
- Users can Login using their Google account. (Works for IOS and Android)
- Users can add movies and series to their watchlist.
- Users can review and rate movies and tv series.
- Inside tv series, users can track their viewing history for each season and episodes.
- Users can view the information about the movie or series (with seasons/episodes).
- Users can search for movies and series.
- Users can edit their profile and add their favourite preferred genres.
- Users can find movies and series by genre or the different lists in Home Screen.
- Users can add location to the place where they have watched the show.
- Users can add, delete, add caption and view photos inside each movie or series.
- Users can test notification (not fully implemented).
- Users can change their app appearance by switching between light and dark mode
- Users can reset their password

## Tech Stack

- **Framework:** [Expo React Native](https://reactnative.dev/)
- **Database and Authentication:** [Firebase Console](https://console.firebase.google.com/u/0/)
- **Image Cloud Service:** [Cloudinary](https://cloudinary.com/)

## Prerequisites

Before setting up the project, ensure you have:

- [Xcode](https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators) installed (that is the only device I have tested currently).

## Installation

1. Clone the repository:
   ```sh
   git clone https://git.cs.dal.ca/courses/2025-winter/csci-4176_5708/project-milestone-3/jdomingo
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application

Because I am using Google Authentication, Expo and other packages/libraries does not support custom native modules, I can only test my code, currently, by running a development build in IOS. (I have only tested my current code in IOS).

```sh
// Running on IOS
npx expo run:ios

// Running on Android
npx expo run:android
```
