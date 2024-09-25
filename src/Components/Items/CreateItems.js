"use client";
import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("../Editor/Index"), {
  ssr: false // Disable server-side rendering for this component
});
const CREATE_ITEMS = gql`
  mutation CreteItems(
    $name: String
    $description: String
    $price: String
    $content: String
    $links: [LinkInput!]
    $itemFile: Upload
  ) {
    creteItems(
      name: $name
      description: $description
      price: $price
      content: $content
      links: $links
      itemFile: $itemFile
    ) {
      content
      description
      id
      media {
        url
      }
      links {
        name
        url
      }
      name
      price
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

const ArticleForm = ({ item }) => {
  const [items, setItem] = useState({
    name: "",
    content: "",
    description: "",
    price: "",
    links: [] // Initialize items as an empty array
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [itemFile, setItemFiles] = useState(); // Store files for each item

  const [createItems] = useMutation(CREATE_ITEMS, {
    update(cache, { data: { creteItems } }) {
      try {
        const existingItems = cache.readQuery({ query: GET_ITEMS });
        if (existingItems && existingItems.Items) {
          cache.writeQuery({
            query: GET_ITEMS,
            data: {
              Items: [creteItems, ...existingItems.Items],
            },
          });
        } else {
          cache.writeQuery({
            query: GET_ITEMS,
            data: { Items: [creteItems] },
          });
        }
      } catch (e) {
        console.error("Error updating cache:", e);
      }
    }
  });
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...items,
      [name]: value
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemFiles(file);
    }
  };
  const handleContentChange = (value) => {
    setItem({
      ...items,
      content: value
    });
  };

  // Handle changes to individual links (for name or URL)
  const handleItemLinkChange = (linkIndex, field, value) => {
    const updatedLinks = [...items.links];
    updatedLinks[linkIndex][field] = value; // Update the specific link field (name or url)
    setItem({ ...items, links: updatedLinks });
  };

  // Add a new empty link
  const handleAddLink = () => {
    const updatedLinks = [...items.links, { name: "", url: "" }]; // Add a new link object
    setItem({ ...items, links: updatedLinks });
  };

  // Remove a link by its index
  const handleRemoveLink = (linkIndex) => {
    const updatedLinks = [...items.links];
    updatedLinks.splice(linkIndex, 1); // Remove the link at the specified index
    setItem({ ...items, links: updatedLinks });
  };

  const Clear = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createItems({
        variables: {
          name: items.name,
          content: items.content,
          description: items.description,
          price: items.price,
          itemFile,
          links: items.links
        }
      });
      Clear();
      alert("Post created successfully");
    } catch (error) {
      console.error("GraphQL error:", error); // Log detailed error
      if (error.networkError) {
        setGeneralError("Network error occurred. Please try again later.");
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        setGeneralError("Error: " + error.graphQLErrors[0].message);
      } else {
        setGeneralError("Failed to create items. Please try again.");
      }
    }
  };

  return (
    <div className="relative w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isFormVisible ? (
        <form
          className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto "
          onSubmit={handleSubmit}
        >
          <button
            onClick={() => setIsFormVisible(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

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
                placeholder="Enter items name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ItemDescription
              </label>
              <input
                type="text"
                name="description"
                value={items.description}
                onChange={handleInputChange}
                placeholder="Enter items description"
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
              <QuillEditor
                value={items.content}
                onChange={(value) => handleContentChange(handleContentChange)}
              />{" "}
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

            {items.links?.map((link, linkIndex) => (
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
              <input name="media"  type="file" onChange={handleFileChange} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Create Post
          </button>
          {generalError && (
            <p className="text-red-500 text-sm mt-3">{generalError}</p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Create Items
        </button>
      )}
    </div>
  );
};

export default ArticleForm;
