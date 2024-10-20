"use client";
import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("../Editor/Index"), {
  ssr: false // Disable server-side rendering for this component
});
const CREATE_POST = gql`
  mutation CreatePost(
    $subCategories: [SubCategoryInput]
    $title: String!
    $content: String!
    $slug: String
    $imgAuthor: String!
    $reads: Int!
    $file: Upload
    $items: [ListItemInput]
  ) {
    createPost(
      subCategories: $subCategories
      title: $title
      content: $content
      slug: $slug
      imgAuthor: $imgAuthor
      reads: $reads
      file: $file
      items: $items
    ) {
      id
      slug
      title
      content
      imgAuthor
      reads
      
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
      image {
        url
      }
      items {
        id
        name
        description
        content
        date
        slug
        links {
          name
          url
        }
        price
        media {
          url
        }
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
      imgAuthor
      reads
      image {
        url
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
      items {
        id
        name
        description
        content
        date
        slug
        links {
          name
          url
        }
        price
        media {
          url
        }
      }
    }
  }
`;

const ArticleForm = ({ categories, SubCategories, item }) => {
  const [post, setPost] = useState({
    title: "",
    content: "",
    slug: "",
    imgAuthor: "",
    reads: 0,
    categories: [],
    subCategories: [],
    items: [] // Initialize items as an empty array
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [file, setImageFile] = useState();
  const [itemFiles, setItemFiles] = useState({}); // Store files for each item

  const [createPost] = useMutation(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      try {
        const existingPosts = cache.readQuery({ query: GET_POSTS });
        if (existingPosts && existingPosts.Posts) {
          cache.writeQuery({
            query: GET_POSTS,
            data: { Posts: [createPost, ...existingPosts.Posts] }
          });
        } else {
          cache.writeQuery({
            query: GET_POSTS,
            data: { Posts: [createPost] }
          });
        }
      } catch (e) {
        console.error("Error updating cache:", e);
      }
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost({
      ...post,
      [name]: value
    });
  };

  const handleContentChange = (value) => {
    setPost({
      ...post,
      content: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleItemFileChange = (index, e) => {
    const file = e.target.files[0];
    const updatedItems = [...post.items];
    updatedItems[index].itemFile = file;
    setPost({ ...post, items: updatedItems });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = post.items.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    setPost({ ...post, items: updatedItems });
  };

  const handleItemContent = (index, value) => {
    const updatedItems = post.items.map((item, i) =>
      i === index ? { ...item, content: value } : item
    );
    setPost({ ...post, items: updatedItems });
  };

  
  const addItem = () => {
    setPost({
      ...post,
      items: [
        ...post.items,
        { name: "", description: "", price: "",slug:"", links: [] }
      ]
    });
  };

  const removeItem = (index) => {
    const updatedItems = post.items.filter((_, i) => i !== index);
    setPost({ ...post, items: updatedItems });
    const updatedItemFiles = { ...itemFiles };
    delete updatedItemFiles[index]; // Remove file associated with this item
    setItemFiles(updatedItemFiles);
  };

  const handleItemLinkChange = (index, linkIndex, field, value) => {
    const updatedItems = [...post.items];
    const updatedLinks = [...updatedItems[index].links];
    updatedLinks[linkIndex][field] = value; // Update the specific link field (name or url)
    updatedItems[index].links = updatedLinks;
    setPost({ ...post, items: updatedItems });
  };

  const handleAddLink = (index) => {
    const updatedItems = [...post.items];
    updatedItems[index].links.push({ name: "", url: "" }); // Add an empty link object
    setPost({ ...post, items: updatedItems });
  };

  const handleRemoveLink = (index, linkIndex) => {
    const updatedItems = [...post.items];
    updatedItems[index].links.splice(linkIndex, 1); // Remove the link at the specified index
    setPost({ ...post, items: updatedItems });
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

  // const handleItemSelect = (e) => {
  //   const selectedOptions = Array.from(e.target.options)
  //     .filter((option) => option.selected)
  //     .map((option) => option.value);
  //   setSelectedItems(selectedOptions);
  // };

  const handleItemSelect = (event) => {
    const value = event.target.value; // Get the checkbox value
    setSelectedItems(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((id) => id !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };
  const Clear = () => {
    setPost({
      title: "",
      content: "",
      slug: "",
      imgAuthor: "",
      reads: 0,
      categories: [],
      subCategories: [],
      items: [] // Reset items as well
    });
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setImageFile(null);
    setItemFiles({}); // Clear item files
    setError(""); // Clear any errors
    setGeneralError(""); // Clear general errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!post.content) {
      setError("Content is required.");
      return;
    }
    // If no item selected and no item created
    if (selectedItems.length === 0 && post.items.length === 0) {
      setError("Please select or create at least one item.");
      return;
    }

    // Map newly created items and attach files
    const itemsInput = post.items.map((item, index) => ({
      ...item,
      itemFile: item.itemFile // Attach the corresponding file for each item
    }));

    // Map selected items
    const itemsSelect = selectedItems.map((itemId) => ({ id: itemId }));

    // Combine selected and newly created items
    const finalItems = [...itemsInput, ...itemsSelect];

    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => {
      const subCategory = SubCategories.find(
        (subCat) => subCat.id === subCategoryId
      );
      return { title: subCategory.title, sSlug: subCategory.sSlug };
    });

    try {
      await createPost({
        variables: {
          title: post.title,
          content: post.content,
          slug: post.slug,
          imgAuthor: post.imgAuthor,
          reads: post.reads,
          file, // Ensure the file is not null
          subCategories: subCategoriesInput,
          items: finalItems // Include items in the mutation
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
        setGeneralError("Failed to create post. Please try again.");
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
              value={post.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              required
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
            <QuillEditor value={post.content} onChange={handleContentChange} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Items */}
          <h1 className="text-black py-2">Select Items</h1>  

          <div className="max-h-[200px] overflow-y-auto overscroll-x-auto border-black border-2 p-2 rounded-lg">   
            {item.map((item) => (
              <div key={item.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`item-${item.id}`}
                  value={item.id}
                  checked={selectedItems.includes(item.id)} // Check if the item is selected
                  onChange={handleItemSelect} // Updated handler
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
          <h1 className="text-black py-2">Create Items</h1>  
            
            </label>
            {post?.items?.map((item, index) => (
              <div key={index} className="mt-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item {index + 1} Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Enter item name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
             Item {index + 1}  Content
            </label>
            <QuillEditor value={item.content} onChange={(value) => handleItemContent(index, value)} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item {index + 1} Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Enter item description"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item {index + 1} Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Enter item price"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {item.links?.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Link Name"
                      value={link.name}
                      onChange={(e) =>
                        handleItemLinkChange(
                          index,
                          linkIndex,
                          "name",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Link URL"
                      value={link.url}
                      onChange={(e) =>
                        handleItemLinkChange(
                          index,
                          linkIndex,
                          "url",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index, linkIndex)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddLink(index)}
                  className="mt-2 text-blue-500"
                >
                  Add Link
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Image for Item {index + 1}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleItemFileChange(index, e)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove Item
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Item
              <PlusIcon className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <input name="image" type="file" onChange={handleFileChange} />
          </div>

          <div>
            <label
              htmlFor="imgAuthor"
              className="block text-sm font-medium text-gray-700"
            >
              Image Author
            </label>
            <input
              type="text"
              id="imgAuthor"
              name="imgAuthor"
              value={post.imgAuthor}
              onChange={handleInputChange}
              placeholder="Enter image author"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
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
          <PlusIcon className="h-5 w-5 mr-2" /> Create Post
        </button>
      )}
    </div>
  );
};

export default ArticleForm;
