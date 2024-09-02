import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import icons
import QuillEditor from '../Editor/Index'; // Import EditorComponent

const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!, $content: String!, $imgUrl: String!, $slug: String!,
    $subCategories: [SubCategoryInput], $categories: [CategoryInput]
  ) {
    createPost(
      title: $title, content: $content, slug: $slug, imgUrl: $imgUrl,
      subCategories: $subCategories, categories: $categories
    ) {
      id
      slug
      title
      content
      imgUrl
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
      imgUrl
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

const ArticleForm = ({ categories, SubCategories }) => {
  const [post, setPost] = useState({
    title: '',
    content: '',
    slug: '',
    imgUrl: '',
    categories: [],
    subCategories: [],
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to manage form visibility
  const [error, setError] = useState(''); // State to manage error messages
  const [generalError, setGeneralError] = useState(''); // State for general errors

  const [createPost] = useMutation(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      try {
        const existingPosts = cache.readQuery({ query: GET_POSTS });
        if (existingPosts && existingPosts.Posts) {
          cache.writeQuery({
            query: GET_POSTS,
            data: { Posts: [createPost, ...existingPosts.Posts] },
          });
        } else {
          cache.writeQuery({
            query: GET_POSTS,
            data: { Posts: [createPost] },
          });
        }
      } catch (e) {
        console.error('Error updating cache:', e);
      }
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost({
      ...post,
      [name]: value,
    });
  };

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedOptions = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setSelectedCategories(selectedOptions);
  };
  const handleContentChange = (value) => {
    setPost({
      ...post,
      content: value,
    });
  };

  const handleSubCategoryChange = (e) => {
    const { options } = e.target;
    const selectedOptions = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setSelectedSubCategories(selectedOptions);
  };
  const Clear = () => {
    setPost({
      title: '',
      content: '',
      slug: '',
      imgUrl: '',
      categories: [],
      subCategories: [],
    });
    setSelectedCategories([]);
    setSelectedSubCategories([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!post.content) {
      setError('Content is required.');
      return;
    }
    const categoriesInput = selectedCategories.map((categoryId) => {
      const category = categories.find((cat) => cat.id === categoryId);
      return { title: category.title, cSlug: category.cSlug };
    });

    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => {
      const subCategory = SubCategories.find((subCat) => subCat.id === subCategoryId);
      return { title: subCategory.title, sSlug: subCategory.sSlug };
    });

    const variables = {
      title: post.title,
      content: post.content,
      slug: post.slug,
      imgUrl: post.imgUrl,
      categories: categoriesInput,
      subCategories: subCategoriesInput,
    };

    try {
      await createPost({ variables });
      Clear()
      // setPost({
      //   title: '',
      //   content: '',
      //   slug: '',
      //   imgUrl: '',
      //   categories: [],
      //   subCategories: [],
      // });
      // setSelectedCategories([]);
      // setSelectedSubCategories([]);
      alert('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error.message);
      setGeneralError('Failed to create post. Please try again.');
    } 
  };

  return (
    <div className="relative  w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isFormVisible ? (
        <>
          
          <form className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto" onSubmit={handleSubmit}>
          <button
            onClick={() => setIsFormVisible(false)} // Hide form
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              {/* <textarea
                id="content"
                name="content"
                value={post.content}
                onChange={handleInputChange}
                placeholder="Enter post content"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              /> */}
              <QuillEditor value={post.content} onChange={handleContentChange} />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={post.slug}
                onChange={handleInputChange}
                placeholder="Enter post slug"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="imgUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                id="imgUrl"
                name="imgUrl"
                value={post.imgUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <select
                id="categories"
                multiple
                onChange={handleCategoryChange}
                value={selectedCategories}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div> */}
            <div>
              <label htmlFor="subCategories" className="block text-sm font-medium text-gray-700">
                Subcategories
              </label>
              <select
                id="subCategories"
                multiple
                onChange={handleSubCategoryChange}
                value={selectedSubCategories}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {SubCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
           >
              Create Post
            </button>
            {generalError && <p className="text-red-500 text-sm mt-3">{generalError}</p>}
          </form>
        </>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)} // Show form
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Create Post
        </button>
      )}
    </div>
  );
};

export default ArticleForm;