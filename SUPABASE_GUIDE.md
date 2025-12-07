# Synk - Supabase Database Setup Guide

This guide explains how to set up your backend tables and security policies (RLS).

## 1. Access the SQL Editor
1.  Go to your Supabase Project Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  Click on the **SQL Editor** icon (looks like a terminal `>_`) in the left sidebar.
3.  Click **"New Query"**.

## 2. Run the Schema Script
Copy and paste the entire content of `schema.sql` (found in your project root) into the query editor and click **Run**.

### What does this script do? (Settings Explained)

#### **Tables**
*   **`profiles`**: Stores user data (username, avatar).
    *   *Why?* Supabase Auth handles login, but we need a separate table for app-specific user info.
    *   `references auth.users`: Links securely to the managed Auth system.
*   **`channels`**: Chat rooms (e.g., 'general', 'random').
*   **`messages`**: The actual chat logs.
    *   `inserted_at`: Automatically marks when the message was sent (UTC time).

#### **Row Level Security (RLS)** - *Critical for Security*
RLS policies act like "firewall rules" for your database rows. Without these, anyone could delete everyone's messages.
*   `enable row level security`: Turns the firewall ON.
*   **Policies**:
    *   *"Messages are viewable by everyone"*: Allows any user (even prospective ones) to READ messages.
    *   *"Authenticated users can insert messages"*: Only logged-in users can SEND messages. The `auth.role() = 'authenticated'` check enforces this.
    *   *Profiles*: Users can only update *their own* profile (`auth.uid() = id`).

#### **Realtime Triggers**
*   `handle_new_user()`: A database trigger that runs automatically when a user signs up. It creates a blank public profile for them instantly, so you don't have to code that logic in the app.

## 3. Enable Realtime (Websockets)
For the chat to update instantly without refreshing:
1.  Go to **Database** (Sidebar) -> **Replication**.
2.  Click the toggle for **`supabase_realtime`**.
3.  Ensure the `messages` table is toggled **ON**.

## 4. Run the App
The correct command to start the app is:
```bash
npx expo start
```
(Note: `npm expo` doesn't exist, use `npx expo`)
