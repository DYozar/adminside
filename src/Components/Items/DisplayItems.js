"use client";
import parse from "html-react-parser";
import React, { useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid"; // Import icons
import { gql, useMutation } from "@apollo/client";
import dynamic from "next/dynamic";
const UpdateItems = dynamic(() => import("./UpdateItems"), { ssr: false });
const DeleteItemButton = dynamic(() => import("./DeleteItemButton"), {
  ssr: false
});

// Define GraphQL mutations
const UPDATE_POST = gql`
  mutation Mutation(
    $updateItemsId: ID!
    $name: String
    $description: String
    $itemFile: Upload
    $number: String
    $links: [LinkInput!]
    $content: String
    $subCategories: [SubCategoryInput]
    $genres: [genreInput]
    

  ) {
    updateItems(
      id: $updateItemsId
      name: $name
      description: $description
      itemFile: $itemFile
      number: $number
      links: $links
      content: $content
    subCategories: $subCategories
    genres: $genres

    ) {
      id
      number
      name
      media {
        url
      }
        SubCategories {
        id
        title
        sSlug
      }
      links {
        url
        name
      }
         genres {
      title
      genre
    }
      description
    }
  }
`;

const DELETE_POSTS = gql`
  mutation DeletePosts($ids: [ID!]!) {
    deletItems(ids: $ids) {
      success
    }
  }
`;

const ItemsDisplay = ({  item  ,SubCat , GG}) => {
  const [isVisible, setIsVisible] = useState(false); // Manage visibility of posts
  const [showUpdateForm, setShowUpdateForm] = useState(null); // Manage currently selected post for updating
  const [selectedItemsIds, setSelectedItemsIds] = useState([]); // Manage selected post IDs

  const [updateItems] = useMutation(UPDATE_POST);
  const [deleteItems] = useMutation(DELETE_POSTS);

  const handleCheckboxChange = (itemsId) => {
    setSelectedItemsIds((prevSelected) =>
      prevSelected.includes(itemsId)
        ? prevSelected.filter((id) => id !== itemsId)
        : [...prevSelected, itemsId]
    );
  };

  const handleUpdateClick = (item) => {
    setShowUpdateForm(item.id);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(null);
  };

  const handleUpdateItem = async (updatedItems) => {
    try {
      await updateItems({
        variables: {
          id: updatedItems.id,
          name: updatedItems.name,
          content: updatedItems.content,
          categories: updatedItems.categories.map((cat) => cat.id)
        }
      });
      handleCloseUpdateForm();
      // Optionally, refetch posts or update local state to reflect the change
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeleteItems = async () => {
    try {
      await deleteItems({ variables: { ids: selectedItemsIds } });
      setSelectedItemsIds([]); // Clear selected posts after deletion
    } catch (error) {
      console.error("Error deleting posts:", error);
    }
  };

  const renderedItems = item.map((item) => {
    let link = item.links.map((l) => ({
      name: l.name,
      url: l.url
    }));

    return (
      <div
        key={item.id}
        className="p-4 mb-4 bg-white shadow-md rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex item-center mb-2">
          <input
            type="checkbox"
            className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            onChange={() => handleCheckboxChange(item.id)}
            checked={selectedItemsIds.includes(item.id)}
          />
          <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
          <button
            onClick={() => handleUpdateClick(item)}
            className="ml-2 py-1 px-2 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update
          </button>
        </div>
        {link.map((l, index) => (
          <p key={index} className="text-sm text-gray-600">
            {l.name}
          </p>
        ))}
        {/* Render Update Form for the selected item */}
        {showUpdateForm === item.id && (
          <UpdateItems
            item={{ ...item, link: item.links || [] }}
            onClose={handleCloseUpdateForm}
            onUpdateItem={handleUpdateItem}
            SubCategories={SubCat}
            Genre={GG}
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
            {renderedItems}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {selectedItemsIds.length > 0 && (
              <DeleteItemButton ItemsIds={selectedItemsIds} onDeleteItems={handleDeleteItems}  />
            )}
          </div>
        </>
      ) : (
        <button
          onClick={() => setIsVisible(true)} // Show component
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Show Items
        </button>
      )}
    </div>
  );
};

export default ItemsDisplay;
