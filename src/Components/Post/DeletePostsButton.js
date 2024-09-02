import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons

const GET_POSTS = gql`
  query Query {
    Posts {
      id
      title
      content
    }
  }
`;

const DELETE_POSTS = gql`
  mutation DeletePosts($ids: [ID!]!) {
    deletePosts(ids: $ids) {
      id
      title
      content
    }
  }
`;

const PostsButton = ({ postIds, onDeleteComplete ,onSelectPost }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState([]);

  // Fetch the current posts
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_POSTS, {
    fetchPolicy: 'cache-and-network', // Ensure the cache is up-to-date
  });

  useEffect(() => {
    if (data && data.Posts) {
      const posts = data.Posts.filter(post => postIds.includes(post.id));
      setPostsToDelete(posts);
      setShowButton(postIds && postIds.length > 0 && posts.length > 0);
    }
    if (queryError) {
      console.error('Error fetching posts:', queryError.message);
    }
  }, [data, queryError, postIds]);

  const [deletePosts] = useMutation(DELETE_POSTS, {
    update(cache, { data: { deletePosts } }) {
      try {
        const existingData = cache.readQuery({ query: GET_POSTS });
        if (existingData && existingData.Posts) {
          const remainingPosts = existingData.Posts.filter(
            (post) => !deletePosts.some((deletedPost) => deletedPost.id === post.id)
          );
          cache.writeQuery({
            query: GET_POSTS,
            data: { Posts: remainingPosts },
          });
        }
      } catch (error) {
        console.error('Error updating cache:', error);
      }
    },
    onError: (error) => {
      setError(`Error: ${error.message}`);
    },
    onCompleted: () => {
      setError(null);
      // Callback to inform parent component about completion
      if (onDeleteComplete) {
        onDeleteComplete();
      }
    },
  });

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Verify if all posts to delete exist
      const existingPosts = data.Posts.map(post => post.id);
      const idsToDelete = postIds.filter(id => existingPosts.includes(id));

      if (idsToDelete.length === 0) {
        setError('No valid posts selected for deletion.');
        setLoading(false);
        return;
      }

      await deletePosts({ variables: { ids: idsToDelete } });
    } catch (error) {
      console.error('Error deleting posts:', error.message);
      setError('An error occurred while deleting posts.');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectPost = (post) => {
    onSelectPost(post);
  };

  return (
    <div className="">
      {showButton && (
        <button
          onClick={()=>{handleDelete(); postsToDelete.forEach(post => handleSelectPost(post));}}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
          }`}
        >
          {loading ? 'Deleting...' : 'Delete Selected Post'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default PostsButton;
