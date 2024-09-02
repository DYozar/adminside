import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons
import UpdateSubCategory from './UpdateSubCategory';
import DeleteSubCatButton from './DeleteSubCatButton';
import { gql, useMutation } from '@apollo/client';

// Define GraphQL mutations
const UPDATE_CAT = gql`
  mutation UpdatSubCategory($updatSubCategoryId: ID!, $title: String, $sSlug: String, $categories: [CategoryInput]) {
    updatSubCategory(id: $updatSubCategoryId, title: $title, sSlug: $sSlug, categories: $categories) {
      id
      title
      sSlug
    }
  }
`;

const DELETE_CATS = gql`
mutation DeletSubCategory($ids: [ID!]!) {
  deletSubCategory(ids: $ids) {
    id
    sSlug
    title
  }
}
`;

const CatDisplay = ({ SubCat, onSelectedSubCatIdsChange = () => {}, onSelectCat ,Cat }) => {
  const [isVisible, setIsVisible] = useState(false); // State to manage visibility
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // Manage currently selected category
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Show update form
  const [selectedSubCatIds, setSelectedSubCatIds] = useState([]); // Manage selected category IDs

  const [updateSubCategory] = useMutation(UPDATE_CAT);
  const [deleteSubCategories] = useMutation(DELETE_CATS);

  useEffect(() => {
    onSelectedSubCatIdsChange(selectedSubCatIds); // Notify parent of selected category IDs
  }, [selectedSubCatIds, onSelectedSubCatIdsChange]);

  const handleCheckboxChange = (catId) => {
    const updatedSelected = selectedSubCatIds.includes(catId)
      ? selectedSubCatIds.filter((id) => id !== catId)
      : [...selectedSubCatIds, catId];

    setSelectedSubCatIds(updatedSelected);
  };

  const handleSelectCategory = (category) => {
    setSelectedSubCategory((prevSelectedSubCategory) =>
      prevSelectedSubCategory && prevSelectedSubCategory.id === category.id ? null : category
    );
  };

  const handleUpdateClick = () => {
    setShowUpdateForm(true);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
  };

  const handleUpdateSubCategory = async (updatedCategory) => {
    try {
      await updateSubCategory({
        variables: {
          id: updatedCategory.id,
          title: updatedCategory.title,
          sSlug: updatedCategory.cSlug,
          categories: updatedCategory.categories.map((sub) => ({ id: sub.id })),
        },
      });
      handleCloseUpdateForm();
      // Optionally, refetch categories or update local state to reflect the change
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteSubCategories = async () => {
    try {
      await deleteSubCategories({ variables: { ids: selectedSubCatIds } });
      setSelectedSubCatIds([]); // Clear selected categories after deletion
      setSelectedSubCategory(null); // Clear selected category
    } catch (error) {
      console.error('Error deleting categories:', error);
    }
  };

  const renderedSubCategories = SubCat.map((sub) => (
    <div
      key={sub.id}
      className="p-4 mb-4 bg-white shadow-md rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          onChange={() => handleCheckboxChange(sub.id)}
          checked={selectedSubCatIds.includes(sub.id)}
          onClick={() => handleSelectCategory(sub)}
        />
        <h2 className="text-lg font-semibold text-gray-900">{sub.title}</h2>
      </div>
      <p className="text-sm text-gray-600">{sub.cSlug}</p>
    </div>
  ));

  return (
    <div className="relative  w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isVisible ? (
        <>
         
         <div className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto">
            {renderedSubCategories}
            
            <button
              onClick={() => setIsVisible(false)} // Hide component
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            
            {SubCat.length > 0 && selectedSubCategory &&(
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateClick}
                className='py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Update SubCategory
              </button>
              <DeleteSubCatButton CatIds={selectedSubCatIds}  onDeleteComplete={handleDeleteSubCategories}  onSelectCategory={handleSelectCategory}/>
            </div>
          )}
          {showUpdateForm && selectedSubCategory && (
            <UpdateSubCategory
              SubCat={selectedSubCategory}
              categories={Cat}
              onClose={handleCloseUpdateForm}
              onUpdateSubCategory={handleUpdateSubCategory}
            />
          )}
            </div>
         
        </>
      ) : (
        <button
          onClick={() => setIsVisible(true)} // Show component
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Show SubCategories
        </button>
      )}
    </div>
  );
};

export default CatDisplay;
