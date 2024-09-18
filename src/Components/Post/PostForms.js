import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import QuillEditor from '../Editor/Index'; // Import EditorComponent

const CREATE_POST = gql`
  mutation CreatePost(
    $subCategories: [SubCategoryInput],  
    $title: String!, 
    $content: String!, 
    $slug: String, 
    $imgAuthor: String!, 
    $reads: Int!, 
    $file: Upload
  ) {
    createPost(
      subCategories: $subCategories, 
      title: $title, 
      content: $content, 
      slug: $slug, 
      imgAuthor: $imgAuthor, 
      reads: $reads, 
      file: $file
    ) {
      id
      slug
      title
      content
      image {
        url
      }
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
    }
  }
`;

const ArticleForm = ({ categories, SubCategories }) => {

  
  const [post, setPost] = useState({
    title: '',
    content: '',
    slug: '',
    imgAuthor: '',
    reads: 0,
    categories: [],
    subCategories: [],
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [file, setImageFile] = useState();

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
  

  const handleContentChange = (value) => {
    setPost({
      ...post,
      content: value,
    });
  };


  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
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
      imgAuthor: '',
      reads: 0,
      categories: [],
      subCategories: [],
    });
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setImageFile(null); // Clear file input
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!post.content) {
      setError('Content is required.');
      return;
    }

    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => {
      const subCategory = SubCategories.find((subCat) => subCat.id === subCategoryId);
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
        },
      });
      Clear();
      alert('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error.message);
      if (error.networkError) {
        setGeneralError('Network error occurred. Please try again later.');
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        setGeneralError('Error: ' + error.graphQLErrors[0].message);
      } else {
        setGeneralError('Failed to create post. Please try again.');
      }
    }
  };

  return (
    <div className="relative w-1/2 mx-auto p-6 bg-white shadow-md rounded-lg">
      {isFormVisible ? (
        <form className="fixed inset-0 z-10 h-full w-full p-6 bg-white shadow-md rounded-lg overflow-y-auto" onSubmit={handleSubmit}>
          <button
            onClick={() => setIsFormVisible(false)}
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
            <QuillEditor value={post.content} onChange={handleContentChange} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
                name="image"
                type="file"
                onChange={handleFileChange}
              
            />
          </div>
          <div>
            <label htmlFor="imgAuthor" className="block text-sm font-medium text-gray-700">
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
