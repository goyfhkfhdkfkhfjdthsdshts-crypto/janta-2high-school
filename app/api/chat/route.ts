import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId') || undefined;
    const userRole = (searchParams.get('role') as UserRole) || undefined;
    const userClass = searchParams.get('class') || '10';

    if (type === 'conversations') {
      const userObj = userId
        ? {
            id: userId,
            email: '',
            name: searchParams.get('userName') || '',
            role: userRole || 'student',
            selectedClass: userClass as any,
            createdAt: '',
            updatedAt: '',
          }
        : null;

      const conversations = db.getChatConversations(userObj);
      return NextResponse.json({ success: true, conversations });
    }

    if (conversationId) {
      const messages = db.getChatMessages(conversationId, userId, userRole);
      return NextResponse.json({ success: true, messages });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid chat request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching chat data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      senderId,
      senderName,
      senderRole = 'student',
      senderAvatar,
      text,
      mediaUrl,
      mediaType,
      fileName,
      replyTo,
    } = body;

    if (!conversationId || (!text && !mediaUrl)) {
      return NextResponse.json(
        { success: false, message: 'Message text or media is required' },
        { status: 400 }
      );
    }

    const message = db.sendChatMessage({
      conversationId,
      senderId: senderId || 'student_guest',
      senderName: senderName || 'Student',
      senderRole,
      senderAvatar,
      text: text || '',
      mediaUrl,
      mediaType,
      fileName,
      replyTo,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId, emoji, userId, userName, conversationId } = body;

    if (action === 'reaction' && messageId && emoji) {
      const updated = db.addChatReaction(
        messageId,
        emoji,
        userId || 'guest',
        userName || 'Student'
      );
      return NextResponse.json({ success: true, message: updated });
    }

    if (action === 'mute' && conversationId && userId) {
      const isMuted = db.toggleMuteConversation(conversationId, userId);
      return NextResponse.json({ success: true, isMuted });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid chat action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in chat action:', error);
    return NextResponse.json(
      { success: false, message: 'Chat action failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const role = (searchParams.get('role') as UserRole) || undefined;

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    const deleted = db.deleteChatMessage(messageId, userId, role);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete this message or unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
