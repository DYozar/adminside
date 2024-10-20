"use client";
import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("../Editor/Index"), {
  ssr: false // Disable server-side rendering for this component
});

const UPDATE_POST = gql`
  mutation UpdatePost(
    $id: ID!
    $title: String
    $content: String
    $slug: String
    $categories: [CategoryInput]
    $subCategories: [SubCategoryInput]
    $file: Upload
    $items: [ListItemInput!]
  ) {
    updatePost(
      id: $id
      title: $title
      content: $content
      slug: $slug
      categories: $categories
      subCategories: $subCategories
      file: $file
      items: $items
    ) {
      id
      title
      content
      image {
        url
      }
      items {
        id
        name
        description
        links {
          name
          url
        }
      }
      slug
      Categories {
        id
        title
        cSlug
      }
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const GET_POSTS = gql`
  query Query {
    Posts {
      id
      title
      content
      image {
        url
      }
      items {
        id
        name
        description
        links {
          name
          url
        }
      }
      Categories {
        id
        title
        cSlug
      }
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const UpdatePostForm = ({
  post,
  categories = [],
  SubCategories = [],
  item = [],
  onClose
}) => {
  const [updatePost] = useMutation(UPDATE_POST, {
    refetchQueries: [{ query: GET_POSTS }]
  });

  const [postInput, setPostInput] = useState({
    title: post.title || "",
    content: post.content || "",
    slug: post.slug || "",
    categories: post.Categories ? post.Categories.map((c) => c.id) : [],
    subCategories: post.SubCategories
      ? post.SubCategories.map((c) => c.id)
      : [],
    image: post.image ? post.image.url : "",
    items: post.items
      ? post.items.map((item) => ({
          ...item,
          links: item.links || [] // Ensure links are initialized
        }))
      : []
  });

  const [selectedCategories, setSelectedCategories] = useState(
    post.Categories ? post.Categories.map((c) => c.id) : []
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState(
    post.SubCategories ? post.SubCategories.map((c) => c.id) : []
  );
  const [selectedItems, setSelectedItems] = useState(
    post.items ? post.items.map((item) => item.id) : []
  );

  const [loading, setLoading] = useState(false);
  const [file, setImageFile] = useState();
  const [itemFiles, setItemFiles] = useState({}); // Store files for each item

  useEffect(() => {
    setPostInput({
      title: post.title || "",
      content: post.content || "",
      slug: post.slug || "",
      categories: post.Categories ? post.Categories.map((c) => c.id) : [],
      subCategories: post.SubCategories
        ? post.SubCategories.map((c) => c.id)
        : [],
      image: post.image ? post.image.url : "",
      items: post.items ? post.items.map((item) => item.id) : []
    });
    setSelectedCategories(
      post.Categories ? post.Categories.map((c) => c.id) : []
    );
    setSelectedSubCategories(
      post.SubCategories ? post.SubCategories.map((c) => c.id) : []
    );
    setSelectedItems(post.items ? post.items.map((item) => item.id) : []);
  }, [post]);

  const handleContentChange = (value) => {
    setPostInput({
      ...postInput,
      content: value
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostInput({
      ...postInput,
      [name]: value
    });
  };

  // const handleItemFileChange = (index, e) => {
  //   const file = e.target.files[0];
  //   const updatedItems = [...postInput.items];
  //   updatedItems[index].itemFile = file;
  //   setPostInput({ ...postInput, items: updatedItems });
  // };

  // const handleItemChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedItems = postInput.items.map((item, i) =>
  //     i === index ? { ...item, [name]: value } : item
  //   );
  //   setPostInput({ ...postInput, items: updatedItems });
  // };
  // const addItem = () => {
  //   setPostInput({
  //     ...postInput,
  //     items: [...postInput.items, { name: '', description: '', number: '', links: [] }], // New item structure
  //   });
  // };
  // const removeItem = (index) => {
  //   const updatedItems = postInput.items.filter((_, i) => i !== index);
  //   setPostInput({ ...postInput, items: updatedItems });
  //   const updatedItemFiles = { ...itemFiles };
  //   delete updatedItemFiles[index];  // Remove file associated with this item
  //   setItemFiles(updatedItemFiles);
  // };

  // const handleItemLinkChange = (index, linkIndex, field, value) => {
  //   const updatedItems = [...postInput.items];
  //   const updatedLinks = [...updatedItems[index].links];
  //   updatedLinks[linkIndex][field] = value; // Update the specific link field (name or url)
  //   updatedItems[index].links = updatedLinks;
  //   setPostInput({ ...postInput, items: updatedItems });
  // };

  // const handleAddLink = (index) => {
  //   const updatedItems = [...postInput.items];

  //   // Ensure that links is initialized
  //   if (!updatedItems[index].links) {
  //     updatedItems[index].links = [];
  //   }

  //   // Create a new copy of the item and add a new link
  //   const updatedItem = {
  //     ...updatedItems[index],
  //     links: [...updatedItems[index].links, { name: '', url: '' }], // Create a new array with the new link
  //   };

  //   updatedItems[index] = updatedItem; // Replace the item in the array

  //   setPostInput({ ...postInput, items: updatedItems });
  // };

  // const handleRemoveLink = (index, linkIndex) => {
  //   const updatedItems = [...postInput.items];
  //   updatedItems[index].links.splice(linkIndex, 1); // Remove the link at the specified index
  //   setPostInput({ ...postInput, items: updatedItems });
  // };
  // const handleCategoryChange = (e) => {
  //   const selectedOptions = Array.from(e.target.options)
  //     .filter(option => option.selected)
  //     .map(option => option.value);
  //   setSelectedCategories(selectedOptions);
  // };

  const handleSubCategoryChange = (event) => {
    const value = event.target.value; // Get the checkbox value
    setSelectedSubCategories(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((id) => id !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleItemsChange = (itemId) => {
    setSelectedItems(
      (prevSelected) =>
        prevSelected.includes(itemId)
          ? prevSelected.filter((id) => id !== itemId) // Remove if already selected
          : [...prevSelected, itemId] // Add if not selected
    );
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const categoriesInput = selectedCategories.map((categoryId) => ({
      id: categoryId
    }));
    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => ({
      id: subCategoryId
    }));
    const itemsInput = selectedItems.map((itemId) => ({ id: itemId }));
    // const itemsInput = postInput.items.map(item => ({
    //   name: item.name,
    //   description: item.description,
    //   number:item.number,
    //   // Ensure to include only the fields defined in ListItemInput
    //   links: item.links.map(link => ({
    //     name: link.name,
    //     url: link.url,
    //     // Exclude __typename or any other extra fields
    //   })),
    //   itemFile: item.itemFile,  // Attach the corresponding file for each item

    // }));
    const variables = {
      id: post.id,
      title: postInput.title,
      content: postInput.content,
      slug: postInput.slug,
      categories: categoriesInput,
      subCategories: subCategoriesInput,
      file, // Ensure the file is not null
      items: itemsInput // Include items in the mutation
    };

    try {
      await updatePost({ variables });
      alert("Post updated successfully");
      if (onClose) onClose(); // Notify parent that the form should be closed
    } catch (error) {
      console.error("Error updating post:", error);
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
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={postInput.title}
            onChange={handleInputChange}
            placeholder="Enter post title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <QuillEditor value={postInput.content} onChange={handleContentChange} />

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Image
          </label>
          <input name="image" type="file" onChange={handleFileChange} />
        </div>
        <h1>Select Items</h1>

        <div>
          {item.map((item) => (
            <div key={item.id} className="flex items-center">
              <input
                type="checkbox"
                id={`item-${item.id}`}
                value={item.id}
                
                checked={selectedItems.includes(item.id)} // Check if the item is selected
                onChange={() => handleItemsChange(item.id)} // Updated handler
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`item-${item.id}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {item.name}
              </label>
            </div>
          ))}
        </div>
          <h1>Select subcategory</h1>
        <div>
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
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePostForm;
