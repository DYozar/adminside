'use client'
import parse from 'html-react-parser';
import React, { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons
import { gql, useMutation } from '@apollo/client';
import dynamic from 'next/dynamic';
const UpdatePostForm = dynamic(() => import('./UpdatePostForm'), { ssr: false });
const DeletePostsButton = dynamic(() => import('./DeletePostsButton'), { ssr: false });

// Define GraphQL mutations
const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String!, $content: String!, $categories: [ID!]) {
    updatePost(id: $id, title: $title, content: $content, categories: $categories) {
      id
      title
      content
      Categories {
        id
        title
        cSlug
      }
    }
  }
`;

const DELETE_POSTS = gql`
  mutation DeletePosts($ids: [ID!]) {
    deletePosts(ids: $ids) {
      success
    }
  }
`;

const PostDisplay = ({ posts, Cat, Sub, item }) => {
  const [isVisible, setIsVisible] = useState(false); // Manage visibility of posts
  const [showUpdateForm, setShowUpdateForm] = useState(null); // Manage currently selected post for updating
  const [selectedPostIds, setSelectedPostIds] = useState([]); // Manage selected post IDs

  const [updatePost] = useMutation(UPDATE_POST);
  const [deletePosts] = useMutation(DELETE_POSTS);

  const handleCheckboxChange = (postId) => {
    setSelectedPostIds((prevSelected) =>
      prevSelected.includes(postId)
        ? prevSelected.filter((id) => id !== postId)
        : [...prevSelected, postId]
    );
  };

  const handleUpdateClick = (post) => {
    setShowUpdateForm(post.id);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(null);
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      await updatePost({
        variables: {
          id: updatedPost.id,
          title: updatedPost.title,
          content: updatedPost.content,
          categories: updatedPost.categories.map((cat) => cat.id),
        },
      });
      handleCloseUpdateForm();
      // Optionally, refetch posts or update local state to reflect the change
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePosts = async () => {
    try {
      await deletePosts({ variables: { ids: selectedPostIds } });
      setSelectedPostIds([]); // Clear selected posts after deletion
    } catch (error) {
      console.error('Error deleting posts:', error);
    }
  };

  const renderedPosts = posts.map((post) => {
    let subcategories = post.SubCategories.map(sub => ({
      title: sub.title,
      sSlug: sub.sSlug
    }));

    return (
      <div
        key={post.id}
        className="p-4 mb-4 bg-white shadow-md rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            onChange={() => handleCheckboxChange(post.id)}
            checked={selectedPostIds.includes(post.id)}
          />
          <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
          <button
            onClick={() => handleUpdateClick(post)}
            className="ml-2 py-1 px-2 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update
          </button>
        </div>
        {subcategories.map((subcategory, index) => (
          <p key={index} className="text-sm text-gray-600">{subcategory.title}</p>
        ))}
        {/* Render Update Form for the selected post */}
        {showUpdateForm === post.id && (
          <UpdatePostForm
            post={{ ...post, categories: post.Categories || [] }}
            SubCategories={Sub}
            categories={Cat}
            onClose={handleCloseUpdateForm}
            onUpdatePost={handleUpdatePost}
            item={item}
          />
        )}
      </div>
    );
  });

  return (
    <div className="relative w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isVisible ? (
        <>
          <div className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto">
            {renderedPosts}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {selectedPostIds.length > 0 && (
              <DeletePostsButton postIds={selectedPostIds} onDeletePosts={handleDeletePosts} />
            )}
          </div>
        </>
      ) : (
        <button
          onClick={() => setIsVisible(true)} // Show component
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Show Posts
        </button>
      )}
    </div>
  );
};

export default PostDisplay;
