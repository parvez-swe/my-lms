"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";

interface Discussion {
  id: number;
  userName: string;
  userImage: string;
  timeAgo: string;
  text: string;
  likes: number;
}

interface DiscussionSectionProps {
  discussions: Discussion[];
}

function DiscussionComment({ comment }: { comment: Discussion }) {
  const [liked, setLiked] = useState(false);
  const [isReplying, setIsReplying] = useState(false); // <-- 1. Add reply state

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
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1 text-xs ${
                liked ? "text-purple-600" : "text-gray-500"
              } hover:text-purple-600`}
            >
              <ThumbsUp size={14} className={liked ? "fill-purple-600" : ""} />
              <span>{comment.likes + (liked ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)} // <-- 2. Toggle reply state
              className="text-xs text-gray-500 hover:text-purple-600"
            >
              Reply
            </button>
          </div>

          {/* --- 3. Add Conditional Reply Form --- */}
          {isReplying && (
            <div className="ml-10 mt-4 flex items-start space-x-3">
              <Image
                src="/images/profile.jpg" // Assuming current user's avatar
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <div className="flex-1">
                <textarea
                  className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder={`Reply to ${comment.userName}...`}
                />
                <div className="flex justify-end items-center mt-2 space-x-3">
                  <button
                    onClick={() => setIsReplying(false)} // Cancel button
                    className="text-xs text-gray-600 font-semibold hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add reply logic here...
                      setIsReplying(false); // Close form after posting
                    }}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-purple-700"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* --- End of Reply Form --- */}
        </div>
      </div>
    </div>
  );
}

export default function DiscussionSection({
  discussions,
}: DiscussionSectionProps) {
  const [comment, setComment] = useState("");

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 text-purple-600" size={24} />
        Course Discussion
      </h2>

      {/* New Comment Input */}
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ask a question or share your thoughts..."
          className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Send size={16} />
            <span>Post</span>
          </button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <DiscussionComment key={discussion.id} comment={discussion} />
        ))}
      </div>

      <button className="w-full mt-4 text-purple-600 font-semibold hover:text-purple-700 py-2">
        Load More Discussions
      </button>
    </div>
  );
}
