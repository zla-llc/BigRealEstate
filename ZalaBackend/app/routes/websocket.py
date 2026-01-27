"""
WebSocket routes for real-time notifications.
"""
from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

router = APIRouter(prefix="/ws", tags=["WebSocket"])

# Store active WebSocket connections by user_id
active_connections: Dict[int, WebSocket] = {}


class ConnectionManager:
    """Manages WebSocket connections for real-time notifications."""

    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"[WebSocket] User {user_id} connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, user_id: int):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"[WebSocket] User {user_id} disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
                print(f"[WebSocket] Sent message to user {user_id}: {message}")
                return True
            except Exception as e:
                print(f"[WebSocket] Failed to send to user {user_id}: {e}")
                self.disconnect(user_id)
                return False
        return False

    async def broadcast(self, message: dict):
        """Send a message to all connected users."""
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    def is_connected(self, user_id: int) -> bool:
        """Check if a user is connected."""
        return user_id in self.active_connections


class TeamConnectionManager:
    """Manages WebSocket connections for team-specific updates."""

    def __init__(self):
        # Dict of team_id -> set of websockets
        self.team_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, team_id: int):
        """Accept a new WebSocket connection for a team."""
        await websocket.accept()
        if team_id not in self.team_connections:
            self.team_connections[team_id] = set()
        self.team_connections[team_id].add(websocket)
        print(f"[WebSocket Team] Connected to team {team_id}. Connections: {len(self.team_connections[team_id])}")

    def disconnect(self, websocket: WebSocket, team_id: int):
        """Remove a WebSocket connection from a team."""
        if team_id in self.team_connections:
            self.team_connections[team_id].discard(websocket)
            if not self.team_connections[team_id]:
                del self.team_connections[team_id]
            print(f"[WebSocket Team] Disconnected from team {team_id}")

    async def broadcast_to_team(self, team_id: int, message: dict):
        """Send a message to all connections watching a team."""
        if team_id not in self.team_connections:
            return
        
        disconnected = []
        for websocket in self.team_connections[team_id]:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
        
        # Clean up
        for ws in disconnected:
            self.team_connections[team_id].discard(ws)


# Global connection manager instances
manager = ConnectionManager()
team_manager = TeamConnectionManager()


@router.websocket("/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    """
    WebSocket endpoint for real-time notifications.
    
    Connect to receive notifications in real-time:
    ws://localhost:8000/ws/notifications/{user_id}
    
    Messages are sent as JSON with format:
    {
        "type": "notification",
        "data": { ... notification data ... }
    }
    """
    await manager.connect(websocket, user_id)
    
    try:
        # Send a connection confirmation
        await websocket.send_json({
            "type": "connection",
            "data": {"status": "connected", "user_id": user_id}
        })
        
        # Keep the connection alive and listen for messages
        while True:
            try:
                # Wait for incoming messages (heartbeat, etc.)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0  # 30 second timeout for ping/pong
                )
                
                # Echo back any received message (can be used for ping/pong)
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                except json.JSONDecodeError:
                    pass
                    
            except asyncio.TimeoutError:
                # Send a ping to keep connection alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
                    
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"[WebSocket] Error for user {user_id}: {e}")
        manager.disconnect(user_id)


async def send_notification_to_user(user_id: int, notification: dict) -> bool:
    """
    Send a notification to a specific user via WebSocket.
    
    Args:
        user_id: The ID of the user to send the notification to
        notification: The notification data to send
        
    Returns:
        True if the message was sent, False otherwise
    """
    message = {
        "type": "notification",
        "data": notification
    }
    return await manager.send_personal_message(message, user_id)


def is_user_online(user_id: int) -> bool:
    """Check if a user is currently connected via WebSocket."""
    return manager.is_connected(user_id)


@router.websocket("/team/{team_id}")
async def websocket_team(websocket: WebSocket, team_id: int):
    """
    WebSocket endpoint for real-time team updates (invitation status changes, member joins, etc.)
    
    Connect to receive team updates in real-time:
    ws://localhost:8000/ws/team/{team_id}
    
    Messages are sent as JSON with format:
    {
        "type": "invitation_update" | "member_joined" | "member_left",
        "data": { ... data ... }
    }
    """
    await team_manager.connect(websocket, team_id)
    
    try:
        # Send a connection confirmation
        await websocket.send_json({
            "type": "connection",
            "data": {"status": "connected", "team_id": team_id}
        })
        
        # Keep the connection alive and listen for messages
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                except json.JSONDecodeError:
                    pass
                    
            except asyncio.TimeoutError:
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
                    
    except WebSocketDisconnect:
        team_manager.disconnect(websocket, team_id)
    except Exception as e:
        print(f"[WebSocket Team] Error for team {team_id}: {e}")
        team_manager.disconnect(websocket, team_id)


async def send_team_update(team_id: int, update_type: str, data: dict) -> None:
    """
    Send an update to all clients watching a team.
    
    Args:
        team_id: The team ID
        update_type: Type of update (invitation_update, member_joined, member_left)
        data: The update data
    """
    message = {
        "type": update_type,
        "data": data
    }
    await team_manager.broadcast_to_team(team_id, message)


async def send_team_update_to_users(user_ids: list, update_type: str, data: dict) -> None:
    """
    Send a team update directly to specific users via their personal notification WebSocket.
    This is useful for team-wide events like team deletion where users might not be
    connected to the team's specific WebSocket channel.
    
    Args:
        user_ids: List of user IDs to notify
        update_type: Type of update (team_deleted, team_joined, etc.)
        data: The update data
    """
    message = {
        "type": update_type,
        "data": data
    }
    print(f"[WebSocket] Sending {update_type} to users {user_ids}")
    for user_id in user_ids:
        try:
            success = await manager.send_personal_message(message, user_id)
            print(f"[WebSocket] Sent {update_type} to user {user_id}: success={success}")
        except Exception as e:
            print(f"[WebSocket] Failed to send {update_type} to user {user_id}: {e}")
