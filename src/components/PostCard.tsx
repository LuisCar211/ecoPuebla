import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostProps {
  author: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export default function PostCard({ author, username, avatar, content, timestamp, likes }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      
      <View style={styles.contentContainer}>
        <View style={styles.authorHeader}>
          <Text style={styles.authorName}>{author}</Text>
          <Text style={styles.username}>@{username} · {timestamp}</Text>
        </View>

        <Text style={styles.bodyText}>{content}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle color="#94a3b8" size={18} />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Heart color={liked ? '#ef4444' : '#94a3b8'} fill={liked ? '#ef4444' : 'transparent'} size={18} />
            <Text style={[styles.actionText, liked && { color: '#ef4444' }]}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 color="#94a3b8" size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Bookmark color="#94a3b8" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
  },
  contentContainer: {
    flex: 1,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  authorName: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 15,
  },
  username: {
    color: '#64748b',
    fontSize: 13,
  },
  bodyText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingRight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});