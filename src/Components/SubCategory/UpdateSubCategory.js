import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/solid';

const UPDATE_SUBCAT = gql`
mutation UpdatSubCategory($updatSubCategoryId: ID!, $title: String, $sSlug: String, $categories: [CategoryInput]) {
  updatSubCategory(id: $updatSubCategoryId, title: $title, sSlug: $sSlug, categories: $categories) {
    id
    title
    sSlug
  }
}
`;

const GET_SUBCATS = gql`
query GetSubCategories {
  SubCategories {
    id
    title
    sSlug
  }
}
`;

const UpdateSubCatForm = ({ SubCat, categories = [], onClose }) => {
  const [updateSubCat] = useMutation(UPDATE_SUBCAT, {
    update(cache, { data: { updatSubCategory } }) {
      const { SubCategories } = cache.readQuery({ query: GET_SUBCATS });
      const updatedSubCats = SubCategories.map(sub => (sub.id === updatSubCategory.id ? updatSubCategory : sub));
      cache.writeQuery({
        query: GET_SUBCATS,
        data: { SubCategories: updatedSubCats },
      });
    },
  });

  const [subCatInput, setSubCatInput] = useState({
    title: SubCat.title || '',
    sSlug: SubCat.sSlug || '',
    categories: SubCat.Categories ? SubCat.Categories.map(c => c.id) : [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSubCatInput({
      title: SubCat.title || '',
      sSlug: SubCat.sSlug || '',
      categories: SubCat.Categories ? SubCat.Categories.map(c => c.id) : [],
    });
  }, [SubCat]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubCatInput(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    setSubCatInput(prevState => ({
      ...prevState,
      categories: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const CategoriesInput = subCatInput.categories.map(CategoryId => ({
      id: CategoryId,
    }));

    const variables = {
      updatSubCategoryId: SubCat.id,
      title: subCatInput.title,
      sSlug: subCatInput.sSlug,
      categories: CategoriesInput,
    };

    try {
      await updateSubCat({ variables });
      alert('SubCategory updated successfully');
      if (onClose) onClose(); // Notify parent that the form should be closed
    } catch (error) {
      console.error('Error updating SubCategory:', error);
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
            value={subCatInput.title}
            onChange={handleInputChange}
            placeholder="Enter SubCategory title"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="sSlug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="sSlug"
            name="sSlug"
            value={subCatInput.sSlug}
            onChange={handleInputChange}
            placeholder="Enter SubCategory slug"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <select
            id="categories"
            multiple
            onChange={handleCategoryChange}
            value={subCatInput.categories}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
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
          {loading ? 'Updating...' : 'Update SubCategory'}
        </button>
      </form>
    </div>
  );
};

export default UpdateSubCatForm;
