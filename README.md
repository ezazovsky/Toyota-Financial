# Toyota Financial Services - Vehicle Financing Platform

A comprehensive Next.js application that provides vehicle financing and leasing solutions, similar to Toyota's official website. Built with modern technologies including Firebase, TypeScript, and Tailwind CSS.

## ✨ Features

### 🚗 Vehicle Showcase
- **Homepage**: Display newest vehicles with search and filtering
- **Vehicle Details**: Individual car pages with detailed specifications
- **Interactive Gallery**: Multiple vehicle images with thumbnail navigation

### 💰 Finance Calculator
- **Real-time Calculations**: Dynamic lease and finance payment calculations
- **Credit-based Rates**: Interest rates adjusted based on credit score
- **Customizable Terms**: Adjust down payment, term length, and mileage
- **Payment Breakdown**: Detailed cost analysis and monthly payment estimates

### 🔐 User Authentication
- **Secure Login/Register**: Firebase Authentication integration
- **Role Management**: Support for users, dealers, and administrators
- **Protected Routes**: Role-based access control

### 📋 Finance Applications
- **Application Submission**: Complete finance application forms
- **Dealership Selection**: Choose from available dealerships
- **Real-time Status**: Live updates on application status

### 👥 User Dashboard
- **Application History**: View all submitted finance applications
- **Offer Tracking**: Monitor counter-offers and status updates
- **Interactive Actions**: Accept/decline offers directly from dashboard

### ⚡ Admin Panel
- **Application Management**: Review and process finance applications
- **User Management**: View and manage all platform users
- **Offer Creation**: Create counter-offers with custom terms
- **Analytics Dashboard**: Overview of platform activity

### 🔔 Real-time Features
- **Live Notifications**: Instant updates on offer changes
- **Status Updates**: Real-time application status changes
- **Browser Notifications**: Optional desktop notifications

## 🛠 Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: Firebase Firestore for real-time data
- **Authentication**: Firebase Auth with role-based access
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom component library with shadcn/ui patterns
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Firebase project

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd Toyota-Financial
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

3. **Environment Configuration**
   
   Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### For Users
1. **Browse Vehicles**: Visit the homepage or vehicles page to see available cars
2. **Calculate Payments**: Use the finance calculator on vehicle detail pages
3. **Apply for Financing**: Submit finance applications with your preferred terms
4. **Track Applications**: Monitor your applications in the dashboard
5. **Manage Offers**: Accept or decline counter-offers from dealers

### For Admins
1. **Admin Access**: Login with an admin account to access the admin panel
2. **Review Applications**: See all pending finance applications
3. **Create Offers**: Make counter-offers with custom terms
4. **Manage Users**: View and manage platform users

### Creating Admin Users

To create an admin user:
1. Register normally through the signup page
2. In the Firebase Console, go to Firestore Database
3. Find your user document in the `users` collection
4. Change the `role` field from `user` to `admin`
5. Log out and log back in to see admin features

## 🎯 Key Features

### Finance Calculator
The calculator provides real-time payment estimates based on:
- Vehicle price and credit score (affects interest rate)
- Down payment and term length
- Annual mileage (for leases)

### Real-time Updates
Uses Firebase's real-time listeners for instant updates when:
- New offers are created or application status changes
- Offers are accepted/rejected

### Role-based Access
- **Users**: Browse vehicles, apply for financing, manage applications
- **Dealers**: Manage offers for their dealership  
- **Admins**: Manage all applications, users, and create offers

## 🚀 Deployment

Deploy on Vercel by connecting your Git repository and adding the Firebase environment variables in the Vercel dashboard.

## 📄 License

This project is for educational and demonstration purposes.
