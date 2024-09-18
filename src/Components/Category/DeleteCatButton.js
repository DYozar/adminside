'use client'
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import React, { useState, useEffect } from 'react';

const GET_Cat = gql`
  query Category {
    Categories {
      id
      title
      cSlug
    }
  }
`;

const DELETE_Cat = gql`
  mutation Mutation($ids: [ID!]!) {
    deletCategory(ids: $ids) {
      title
      id
      cSlug
    }
  }
`;

const DeleteCatButton = ({ CatIds, onDeleteComplete ,onSelectCategory }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [CatsToDelete, setCatssToDelete] = useState([]);

  // Fetch the current categories
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_Cat, {
    fetchPolicy: 'cache-and-network', // Ensure the cache is up-to-date
  });

  useEffect(() => {
    // Set button visibility based on selected categories and available categories
    if (data && data.Categories ) {
      const cats = data.Categories.filter(cat => CatIds.includes(cat.id));
      setShowButton(CatIds && CatIds.length > 0 && cats.length > 0);
      setCatssToDelete(cats);
    }
    if (queryError) {
      console.error('Error fetching categories:', queryError.message);
    }
  }, [data, queryError, CatIds]);


  const [deleteCats] = useMutation(DELETE_Cat, {
    update(cache, { data: { deletCategory } }) {
      try {
        const existingData = cache.readQuery({ query: GET_Cat });
        if (existingData && existingData.Categories) {
          const remainingCats = existingData.Categories.filter(
            (Cat) => !deletCategory.some((deletedCat) => deletedCat.id === Cat.id)
          );
          cache.writeQuery({
            query: GET_Cat,
            data: { Categories: remainingCats },
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
      // Verify if all categories to delete exist
      const existingCategories = data.Categories.map(category => category.id);
      const idsToDelete = CatIds.filter(id => existingCategories.includes(id));

      if (idsToDelete.length === 0) {
        setError('No valid categories selected for deletion.');
        setLoading(false);
        return;
      }

      await deleteCats({ variables: { ids: idsToDelete } });
    } catch (error) {
      console.error('Error deleting categories:', error.message);
      setError('An error occurred while deleting categories.');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectCat = (cat) => {
    onSelectCategory(cat);
  };

  return (
    <div className="flex flex-col items-center">
      {showButton && (
        <button
        onClick={()=>{handleDelete();CatsToDelete.forEach(cat => handleSelectCat(cat));}}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
          }`}
        >
          {loading ? 'Deleting...' : 'Delete Selected Cat'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default DeleteCatButton;
