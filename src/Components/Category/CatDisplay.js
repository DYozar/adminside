'use client'
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons
import UpdateCategory from './UpdateCategory';
import DeleteCatButton from './DeleteCatButton';
import { gql, useMutation } from '@apollo/client';

// Define GraphQL mutations
const UPDATE_CAT = gql`
  mutation UpdateCategory($id: ID!, $title: String!, $cSlug: String!, $subCategories: [SubCategoryInput]) {
    updateCategory(id: $id, title: $title, cSlug: $cSlug, subCategories: $subCategories) {
      id
      cSlug
      title
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const DELETE_CATS = gql`
  mutation DeleteCategories($ids: [ID!]) {
    deleteCategories(ids: $ids) {
      success
    }
  }
`;

const CatDisplay = ({ categories, onSelectedCatIdsChange = () => {}, onSelectCat, SubCat}) => {
  const [isVisible, setIsVisible] = useState(false); // State to manage visibility
  const [selectedCategory, setSelectedCategory] = useState(null); // Manage currently selected category
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Show update form
  const [selectedCatIds, setSelectedCatIds] = useState([]); // Manage selected category IDs

  const [updateCategory] = useMutation(UPDATE_CAT);
  const [deleteCategories] = useMutation(DELETE_CATS);

  useEffect(() => {
    onSelectedCatIdsChange(selectedCatIds); // Notify parent of selected category IDs
  }, [selectedCatIds, onSelectedCatIdsChange]);

  const handleCheckboxChange = (catId) => {
    const updatedSelected = selectedCatIds.includes(catId)
      ? selectedCatIds.filter((id) => id !== catId)
      : [...selectedCatIds, catId];

    setSelectedCatIds(updatedSelected);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory((prevSelectedCategory) =>
      prevSelectedCategory && prevSelectedCategory.id === category.id ? null : category
    );
  };

  const handleUpdateClick = () => {
    setShowUpdateForm(true);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
  };

  const handleUpdateCategory = async (updatedCategory) => {
    try {
      await updateCategory({
        variables: {
          id: updatedCategory.id,
          title: updatedCategory.title,
          cSlug: updatedCategory.cSlug,
          subCategories: updatedCategory.subCategories.map((sub) => ({ id: sub.id })),
        },
      });
      handleCloseUpdateForm();
      // Optionally, refetch categories or update local state to reflect the change
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategories = async () => {
    try {
      await deleteCategories({ variables: { ids: selectedCatIds } });
      setSelectedCatIds([]); // Clear selected categories after deletion
      setSelectedCategory(null); // Clear selected category
    } catch (error) {
      console.error('Error deleting categories:', error);
    }
  };

  const renderedCategories = categories.map((category) => {


    const sub = category.SubCategories.map(sub => ({
      title: sub.title,
      sSlug: sub.sSlug
    }));
    console.log('testCategory:', category) 
    
    return(
    
    <div
      key={category.id}
      className="p-4 mb-4 bg-white shadow-md rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          onChange={() => handleCheckboxChange(category.id)}
          checked={selectedCatIds.includes(category.id)}
          onClick={() => handleSelectCategory(category)}
        />
        <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
      </div>
      <p className="text-sm text-gray-600">{category.cSlug}</p>
      {sub.map((subcategory, index) => (
          <p key={index} className="text-sm text-gray-600">{subcategory.title}</p>
        ))}
      
    </div>
  )});

  return (
    <div className="relative w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isVisible ? (
        <>
         
         <div className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto">
            {renderedCategories}
            
            <button
              onClick={() => setIsVisible(false)} // Hide component
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            
            {categories.length > 0 && selectedCategory &&(
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateClick}
                className='py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Update Category
              </button>
              <DeleteCatButton CatIds={selectedCatIds}  onDeleteComplete={handleDeleteCategories}  onSelectCategory={handleSelectCategory}/>
            </div>
          )}
          {showUpdateForm && selectedCategory && (
            <UpdateCategory
              category={selectedCategory}
              onClose={handleCloseUpdateForm}
              onUpdateCategory={handleUpdateCategory}
              subcategories={SubCat}
            />
          )}
            </div>
         
        </>
      ) : (
        <button
          onClick={() => setIsVisible(true)} // Show component
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Show Categories
        </button>
      )}
    </div>
  );
};

export default CatDisplay;
