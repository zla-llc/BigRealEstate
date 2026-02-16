-- Teams and related tables schema
-- Run this SQL to create the necessary tables for team management

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id         SERIAL PRIMARY KEY,
    team_name       VARCHAR(75) UNIQUE NOT NULL,
    xp              INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ
);

-- Create users_teams junction table for team membership
CREATE TABLE IF NOT EXISTS users_teams (
    user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    team_id         INTEGER REFERENCES teams(team_id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, team_id)
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    invitation_id   SERIAL PRIMARY KEY,
    team_id         INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    inviter_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    invitee_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    invitee_email   VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    recipient_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_id       INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    invitation_id   INTEGER REFERENCES team_invitations(invitation_id) ON DELETE CASCADE,
    viewed          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add team_id column to properties if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='team_id') THEN
        ALTER TABLE properties ADD COLUMN team_id INTEGER REFERENCES teams(team_id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Add team_id column to boards if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='boards' AND column_name='team_id') THEN
        ALTER TABLE boards ADD COLUMN team_id INTEGER REFERENCES teams(team_id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_teams_user_id ON users_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_users_teams_team_id ON users_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_email ON team_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_invitation_id ON notifications(invitation_id);

-- Create team_announcements table for admin announcements
CREATE TABLE IF NOT EXISTS team_announcements (
    announcement_id SERIAL PRIMARY KEY,
    team_id         INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    author_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ
);

-- Create indexes for announcements
CREATE INDEX IF NOT EXISTS idx_team_announcements_team_id ON team_announcements(team_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_author_id ON team_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_created_at ON team_announcements(created_at DESC);
