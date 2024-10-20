"use client";
import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { XMarkIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("../Editor/Index"), {
  ssr: false // Disable server-side rendering for this component
});

const UPDATE_ITEMS = gql`
  mutation UpdateItems(
    $updateItemsId: ID!
    $name: String
    $description: String
    $itemFile: Upload
    $price: String
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
      price: $price
      links: $links
      content: $content
      subCategories: $subCategories
    genres: $genres

    ) {
      id
      price
      name
      media {
        url
        public_id
      }
        genres {
      title
      genre
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
      description
    }
  }
`;

const GET_ITEMS = gql`
  query GetItem {
    Items {
      id
      name
      description
      price
      content
      SubCategories {
        id
        title
        sSlug
      }
        genres {
      title
      genre
    }
      media {
        url
        public_id
      }
      links {
        name
        url
      }
    }
  }
`;

const ArticleForm = ({ item, onClose, SubCategories = [] , Genre }) => {
  const [items, setItem] = useState({
    name: item.name || "",
    content: item.content || "",
    description: item.description || "",
    price: item.price || "",
    subCategories: item.SubCategories
      ? item.SubCategories.map((c) => c.id)
      : [],

    genres: item.genres
      ? item.genres.map((c) => c.id)
      : [],
    links: item.links.map((link) => ({ name: link.name, url: link.url })) || [] // Clean initialization
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [itemFile, setItemFiles] = useState(); // Store files for each item
  const [selectedSubCategories, setSelectedSubCategories] = useState(
    item.SubCategories ? item.SubCategories.map((c) => c.id) : []
  );
  const [selectedGenres, setSelectedGenres] = useState(item.genres
      ? item.genres.map((c) => c.genre)
      : []);

  const [updateItems] = useMutation(UPDATE_ITEMS, {
    refetchQueries: [{ query: GET_ITEMS }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemFiles(file);
    }
  };

  const handleContentChange = (value) => {
    setItem((prev) => ({
      ...prev,
      content: value
    }));
  };

  const handleAddLink = () => {
    const updatedLinks = [...items.links, { name: "", url: "" }]; // Add a new link object
    setItem({ ...items, links: updatedLinks });
  };

  const handleItemLinkChange = (linkIndex, field, value) => {
    const updatedLinks = [...items.links];
    updatedLinks[linkIndex][field] = value; // Update the specific link field (name or url)
    setItem({ ...items, links: updatedLinks });
  };

  // Remove a link by its index
  const handleRemoveLink = (linkIndex) => {
    const updatedLinks = [...items.links];
    updatedLinks.splice(linkIndex, 1); // Remove the link at the specified index
    setItem({ ...items, links: updatedLinks });
  };

  const clearForm = () => {
    setItem({
      name: "",
      content: "",
      description: "",
      price: "",
      links: [] // Initialize items as an empty array
    });
    setItemFiles(); // Clear item files
    setError(""); // Clear any errors
    setGeneralError(""); // Clear general errors
  };

  const handleSubCategoryChange = (event) => {
    const value = event.target.value; // Get the checkbox value
    setSelectedSubCategories(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((id) => id !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };
    const handleGenreChange = (event) => {
    const value = event.target.value;
    setSelectedGenres((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((id) => id !== value)
        : [...prevSelected, value]
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedLinks = items.links.map(({ name, url }) => ({ name, url }));
    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => ({
      id: subCategoryId
    }));

    const genresInput = selectedGenres.map((gen) => ({
      genre: gen
    }));
  

    try {
      await updateItems({
        variables: {
          updateItemsId: item.id, // Pass the ID of the item being updated
          name: items.name,
          content: items.content,
          description: items.description,
          price: items.price,
          itemFile,
          links: sanitizedLinks,
          subCategories: subCategoriesInput,
          genres: genresInput 
        }
      });
      clearForm();
      alert("Item updated successfully");
      if (onClose) onClose(); // Notify parent that the form should be closed
    } catch (error) {
      console.error("Error updating post:", error);
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
      <form className="space-y-4 mt-10 " onSubmit={handleSubmit}>
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Name
            </label>
            <input
              type="text"
              name="name"
              value={items.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Description
            </label>
            <input
              type="text"
              name="description"
              value={items.description}
              onChange={handleInputChange}
              placeholder="Enter item description"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <QuillEditor value={items.content} onChange={handleContentChange} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Price
            </label>
            <input
              type="number"
              name="price"
              value={items.price}
              onChange={handleInputChange}
              placeholder="Enter item price"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {items.links.map((link, linkIndex) => (
            <div
              key={linkIndex}
              className="flex text-black items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Link Name"
                value={link.name}
                onChange={(e) =>
                  handleItemLinkChange(linkIndex, "name", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Link URL"
                value={link.url}
                onChange={(e) =>
                  handleItemLinkChange(linkIndex, "url", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveLink(linkIndex)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddLink}
            className="mt-2 text-blue-500"
          >
            Add Link
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image for Item
            </label>
            <input name="media" type="file" onChange={handleFileChange} />
          </div>
        </div>
        <h1 className="text-black py-2">Select subcategory</h1>
        <div className="max-h-[200px] overflow-y-auto overscroll-x-auto"> 
          {SubCategories.map((subCategory) => (
            <div key={subCategory.id} className="flex items-center">
              <input
                type="checkbox"
                id={`subCategory-${subCategory.id}`}
                value={subCategory.id}
                checked={selectedSubCategories.includes(subCategory.id)}
                onChange={handleSubCategoryChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`subCategory-${subCategory.id}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {subCategory.title}
              </label>
            </div>
          ))}
        </div>
 <label className="block text-sm font-medium text-gray-700">
                Genres
              </label>
        <div  className="max-h-[200px] overflow-y-auto overscroll-x-auto">

             
              {Genre.map((genre) => (
                <div key={genre.id} className="flex items-center ">
                  <input
                    type="checkbox"
                    value={genre.genre}
                    checked={selectedGenres.includes(genre.genre)}
                    onChange={handleGenreChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{genre.title}</span>
                </div>
              ))}
            </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Update Items
        </button>
        {generalError && (
          <p className="text-red-500 text-sm mt-3">{generalError}</p>
        )}
      </form>
    </div>
  );
};

export default ArticleForm;
