"use client";

import React, { useState, useEffect } from "react";
import { MessageDocument } from "@/models/Message";

type Message = Omit<MessageDocument, "_id"> & { _id: string };

// Message Modal Component
const MessageModal: React.FC<{ message: Message; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> {/* Added max-h and overflow-y for modal responsiveness */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Message Details</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &times;
        </button>
        <div className="space-y-2 text-black dark:text-white">
          <p>
            <strong>Name:</strong> {message.name}
          </p>
          <p>
            <strong>Email:</strong> {message.email}
          </p>
          <p>
            <strong>Phone:</strong> {message.phone || "N/A"}
          </p>
          <p>
            <strong>Received:</strong>{" "}
            {new Date(message.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {message.isRead ? "Read" : "Unread"}
          </p>
          <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
            <strong>Message:</strong>
            <p className="whitespace-pre-wrap mt-1">{message.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesManagementPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: !isRead }),
      });
      if (!res.ok) {
        throw new Error("Failed to update message status");
      }
      fetchMessages(); // Refetch messages to update the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const res = await fetch(`/api/contact/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete message");
        }
        fetchMessages(); // Refetch messages to update the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      }
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.isRead) {
      handleToggleRead(message._id, message.isRead); // Mark as read
    }
  };

  const filteredMessages = messages
    .filter((message) => {
      if (filter === "read") return message.isRead;
      if (filter === "unread") return !message.isRead;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0"> {/* Adjusted for responsiveness */}
        <div className="w-full sm:w-auto">
          <label className="mr-2">Filter:</label>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "read" | "unread")
            }
            className="p-2 rounded border w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label className="mr-2">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="p-2 rounded border w-full sm:w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md"> {/* Added rounded-lg and shadow-md for aesthetics */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> {/* Added divide-y */}
            <thead className="bg-gray-50 dark:bg-gray-700"> {/* Added bg-gray */}
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Received</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredMessages.map((message) => (
                <tr
                  key={message._id}
                  className={
                    message.isRead ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700" // Added hover effect
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{message.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{message.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{message.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(message.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {message.isRead ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                        Read
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100">
                        Unread
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewMessage(message)}
                      className="text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleToggleRead(message._id, message.isRead)
                      }
                      className="text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      {message.isRead ? "Mark as Unread" : "Mark as Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="text-sm bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MessagesManagementPage;
