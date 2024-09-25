'use client';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons

const GET_ITEMS = gql`
  query GetItem {
   Items {
    id
    name
    description
    price
    content
    media {
      url
    }
    links {
      name
      url
    }
  }
  }
`;

const DELETE_ITEMS = gql`
 mutation DeletePosts( $ids: [ID!]!) {
  deletItems(ids: $ids) {
    id
    name
  }
}
`;

const ItemsButton = ({ ItemsIds, onDeleteComplete, onSelectPost }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);

  const { data, loading: queryLoading, error: queryError } = useQuery(GET_ITEMS, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data && data.Items) {
      const items = data.Items.filter(item => ItemsIds.includes(item.id));
      setItemsToDelete(items);
      setShowButton(ItemsIds.length > 0 && items.length > 0);
    }
    if (queryError) {
      console.error('Error fetching items:', queryError.message);
    }
  }, [data, queryError, ItemsIds]);

  const [deletItems] = useMutation(DELETE_ITEMS, {
            update(cache, { data: { deletItems } }) {
          try {
            const existingData = cache.readQuery({ query: GET_ITEMS });
            if (existingData && existingData.Items) {
              const remainingItems = existingData.Items.filter((item) => !deletItems.some((deletedItem) => deletedItem.id === item.id) );
              cache.writeQuery({
                query: GET_ITEMS,
                data: { Items: remainingItems },
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
      if (onDeleteComplete) {
        onDeleteComplete();
      }
    },
  });

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const existingItems = data.Items.map(item => item.id);
      const idsToDelete = ItemsIds.filter(id => existingItems.includes(id));

      if (idsToDelete.length === 0) {
        setError('No valid items selected for deletion.');
        setLoading(false);
        return;
      }

      await deletItems({ variables: { ids: idsToDelete } });
    } catch (error) {
      console.error('Error deleting items:', error.message);
      setError('An error occurred while deleting items.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {showButton && (
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
          }`}
        >
          {loading ? 'Deleting...' : 'Delete Selected Post'}
        </button>
      )}
      {error && <p className="mt-2 text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default ItemsButton;
