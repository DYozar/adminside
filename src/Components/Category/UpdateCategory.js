'use client'
import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/solid';

const UPDATE_CAT = gql`
  mutation UpdateCategory($updatCategoryId: ID!, $title: String, $cSlug: String, $subCategories: [SubCategoryInput]) {
    updatCategory(id: $updatCategoryId, title: $title, cSlug: $cSlug, subCategories: $subCategories) {
      id
      title
      cSlug
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const GET_CATS = gql`
  query GetCategories {
    Categories {
      id
      title
      cSlug
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const UpdateCatForm = ({ category, subcategories = [], onClose }) => {
  const [updateCat] = useMutation(UPDATE_CAT, {
    update(cache, { data: { updatCategory } }) {
      const { Categories } = cache.readQuery({ query: GET_CATS });
      const updatedCats = Categories.map(cat => (cat.id === updatCategory.id ? updatCategory : cat));
      cache.writeQuery({
        query: GET_CATS,
        data: { Categories: updatedCats },
      });
    },
  });

  const [categoryInput, setCategoryInput] = useState({
    title: category.title || '',
    cSlug: category.cSlug || '',
    subcategories: category.SubCategories ? category.SubCategories.map(c => c.id) : [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategoryInput({
      title: category.title || '',
      cSlug: category.cSlug || '',
      subcategories: category.SubCategories ? category.SubCategories.map(c => c.id) : [],
    });
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryInput(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    setCategoryInput(prevState => ({
      ...prevState,
      subcategories: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const subCategoriesInput = categoryInput.subcategories.map(subCategoryId => ({
      id: subCategoryId,
    }));

    const variables = {
      updatCategoryId: category.id,
      title: categoryInput.title,
      cSlug: categoryInput.cSlug,
      subCategories: subCategoriesInput,
    };

    try {
      await updateCat({ variables });
      alert('Category updated successfully');
      if (onClose) onClose(); // Notify parent that the form should be closed
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed text-black inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto">
      <button
        onClick={onClose} // Call the onClose callback
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <form className="space-y-4 mt-10" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={categoryInput.title}
            onChange={handleInputChange}
            placeholder="Enter category title"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="cSlug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="cSlug"
            name="cSlug"
            value={categoryInput.cSlug}
            onChange={handleInputChange}
            placeholder="Enter category slug"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="subcategories" className="block text-sm font-medium text-gray-700">
            Subcategories
          </label>
          <select
            id="subcategories"
            multiple
            onChange={handleSubCategoryChange}
            value={categoryInput.subcategories}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {subcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Category'}
        </button>
      </form>
    </div>
  );
};

export default UpdateCatForm;
