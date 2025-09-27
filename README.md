# WhatsApp Business API Frontend

A comprehensive Next.js frontend application for managing WhatsApp Business API accounts, messages, contacts, and analytics.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview with system status, message statistics, and quick actions
- **Chat Interface**: WhatsApp-like messaging interface with contact sidebar
- **Contact Management**: Complete contact management with search, filtering, and analytics
- **Message Templates**: Create, edit, and manage WhatsApp message templates
- **Analytics**: Comprehensive analytics dashboard with charts and metrics
- **Account Management**: Multi-account support for WhatsApp Business accounts
- **Message History**: Advanced search and filtering of message history
- **Webhook Logs**: Real-time webhook monitoring and debugging
- **Settings**: User preferences, webhook configuration, and system settings

### Technical Features
- **Authentication**: Secure login/logout with protected routes
- **Real-time Updates**: WebSocket integration for live message updates
- **Mobile Responsive**: Fully responsive design optimized for all devices
- **State Management**: Zustand for efficient global state management
- **API Integration**: Comprehensive API service layer
- **Error Handling**: Robust error handling and user feedback
- **Loading States**: Smooth loading indicators and skeleton screens

## 🛠 Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Authentication**: Custom JWT-based auth

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── accounts/          # Account management
│   ├── analytics/         # Analytics dashboard
│   ├── chat/             # Chat interface
│   ├── contacts/         # Contact management
│   ├── history/          # Message history
│   ├── login/            # Authentication
│   ├── settings/         # Settings
│   ├── templates/        # Message templates
│   ├── webhooks/         # Webhook logs
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── contacts/         # Contact-related components
│   ├── layout/           # Layout components
│   ├── templates/        # Template components
│   └── ui/               # UI utility components
├── lib/                  # Utility libraries
│   ├── api.ts           # API service layer
│   └── websocket.ts     # WebSocket manager
├── store/               # State management
│   └── useAppStore.ts   # Zustand store
└── middleware.ts        # Route protection
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- WhatsApp Business API backend running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Email**: admin@example.com
- **Password**: password
