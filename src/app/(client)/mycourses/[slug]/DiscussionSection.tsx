"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MessageSquare, Send, ThumbsUp, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface DiscussionReply {
  _id?: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  createdAt: Date | string;
}

interface Discussion {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  timeAgo: string;
  text: string;
  likes: number;
  likedBy: string[];
  replies: DiscussionReply[];
  createdAt: Date | string;
}

interface DiscussionSectionProps {
  courseSlug: string;
}

function DiscussionComment({
  comment,
  courseSlug,
  currentUserId,
  onUpdate,
}: {
  comment: Discussion;
  courseSlug: string;
  currentUserId: string | undefined;
  onUpdate: () => void;
}) {
  const [liked, setLiked] = useState(
    currentUserId ? comment.likedBy.includes(currentUserId) : false
  );
  const [likesCount, setLikesCount] = useState(comment.likes);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const handleLike = async () => {
    if (isTogglingLike || !currentUserId) return;

    setIsTogglingLike(true);
    try {
      const response = await fetch(
        `/api/discussions/${courseSlug}/${comment.id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setLiked(result.data.liked);
        setLikesCount(result.data.likesCount);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || isSubmittingReply || !currentUserId) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch(
        `/api/discussions/${courseSlug}/${comment.id}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: replyText }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setReplyText("");
        setIsReplying(false);
        // Refresh discussions to get updated replies
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="border-b pb-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <Image
          src={comment.userImage}
          alt={comment.userName}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">{comment.userName}</span>
            <span className="text-xs text-gray-500">{comment.timeAgo}</span>
          </div>
          <p className="text-gray-700 text-sm mb-2">{comment.text}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isTogglingLike || !currentUserId}
              className={`flex items-center space-x-1 text-xs ${
                liked ? "text-purple-600" : "text-gray-500"
              } hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isTogglingLike ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ThumbsUp
                  size={14}
                  className={liked ? "fill-purple-600" : ""}
                />
              )}
              <span>{likesCount}</span>
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)}
              disabled={!currentUserId}
              className="text-xs text-gray-500 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reply
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-10 mt-4 space-y-3">
              {comment.replies.map((reply, index) => {
                const replyDate =
                  typeof reply.createdAt === "string"
                    ? new Date(reply.createdAt)
                    : reply.createdAt;
                return (
                  <div
                    key={reply._id || index}
                    className="flex items-start space-x-3"
                  >
                    <Image
                      src={reply.userImage || "/images/profile.jpg"}
                      alt={reply.userName}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-xs">
                          {reply.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {replyDate.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-xs">{reply.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="ml-10 mt-4 flex items-start space-x-3">
              <Image
                src="/images/profile.jpg"
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder={`Reply to ${comment.userName}...`}
                />
                <div className="flex justify-end items-center mt-2 space-x-3">
                  <button
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText("");
                    }}
                    className="text-xs text-gray-600 font-semibold hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || isSubmittingReply}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isSubmittingReply && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    <span>Post Reply</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscussionSection({
  courseSlug,
}: DiscussionSectionProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/discussions/${courseSlug}`);
      const result = await response.json();

      if (result.success) {
        setDiscussions(result.data);
      } else {
        setError("Failed to load discussions");
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
      setError("Failed to load discussions");
    } finally {
      setIsLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    fetchDiscussions();
  }, [courseSlug, fetchDiscussions]);

  const handlePostComment = async () => {
    if (!comment.trim() || isSubmitting || !session?.user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/discussions/${courseSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });

      const result = await response.json();
      if (result.success) {
        setComment("");
        // Refresh discussions
        await fetchDiscussions();
      } else {
        setError(result.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 text-purple-600" size={24} />
        Course Discussion
      </h2>

      {/* New Comment Input */}
      {session?.user && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={3}
            disabled={isSubmitting}
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePostComment}
              disabled={!comment.trim() || isSubmitting}
              className="bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>Post</span>
            </button>
          </div>
        </div>
      )}

      {/* Discussion List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={24} className="animate-spin text-purple-600" />
        </div>
      ) : error && discussions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
          <button
            onClick={fetchDiscussions}
            className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No discussions yet. Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <DiscussionComment
              key={discussion.id}
              comment={discussion}
              courseSlug={courseSlug}
              currentUserId={session?.user?.id}
              onUpdate={fetchDiscussions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
