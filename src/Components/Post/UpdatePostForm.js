import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { XMarkIcon } from '@heroicons/react/24/solid';
import QuillEditor from '../Editor/Index'; // Import EditorComponent
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: String, $imgUrl: String, $slug: String, $categories: [CategoryInput], $subCategories: [SubCategoryInput]) {
    updatePost(id: $id, title: $title, content: $content, slug: $slug, imgUrl: $imgUrl, categories: $categories, subCategories: $subCategories) {
      id
      title
      content
      slug
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

const UpdatePostForm = ({ post, categories = [], SubCategories = [], onClose }) => {
  const [updatePost] = useMutation(UPDATE_POST, {
    update(cache, { data: { updatePost } }) {
      const { Posts } = cache.readQuery({ query: GET_POSTS });
      const updatedPosts = Posts.map(p => (p.id === updatePost.id ? updatePost : p));
      cache.writeQuery({
        query: GET_POSTS,
        data: { Posts: updatedPosts },
      });
    },
  });

  const [postInput, setPostInput] = useState({
    title: post.title || '',
    content: post.content || '',
    slug: post.slug || '',
    imgUrl: post.imgUrl || '',
    categories: post.Categories ? post.Categories.map(c => c.id) : [],
    subCategories: post.SubCategories ? post.SubCategories.map(c => c.id) : [],
  });

  const [selectedCategories, setSelectedCategories] = useState(post.Categories ? post.Categories.map(c => c.id) : []);
  const [selectedSubCategories, setSelectedSubCategories] = useState(post.SubCategories ? post.SubCategories.map(c => c.id) : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPostInput({
      title: post.title || '',
      content: post.content || '',
      slug: post.slug || '',
      imgUrl: post.imgUrl || '',
      categories: post.Categories ? post.Categories.map(c => c.id) : [],
      subCategories: post.SubCategories ? post.SubCategories.map(c => c.id) : [],
    });
    setSelectedCategories(post.Categories ? post.Categories.map(c => c.id) : []);
    setSelectedSubCategories(post.SubCategories ? post.SubCategories.map(c => c.id) : []);
  }, [post]);

  const handleContentChange = (value) => {
    setPostInput({
      ...postInput,
      content: value,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostInput({
      ...postInput,
      [name]: value,
    });
  };


  // const handleCategoryChange = (e) => {
  //   const selectedOptions = Array.from(e.target.options)
  //     .filter(option => option.selected)
  //     .map(option => option.value);
  //   setSelectedCategories(selectedOptions);
  // };

  const handleSubCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.options)
      .filter(option => option.selected)
      .map(option => option.value);
    setSelectedSubCategories(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const categoriesInput = selectedCategories.map(categoryId => ({ id: categoryId }));
    const subCategoriesInput = selectedSubCategories.map(subCategoryId => ({ id: subCategoryId }));

    const variables = {
      id: post.id,
      title: postInput.title,
      content: postInput.content,
      slug: postInput.slug,
      imgUrl: postInput.imgUrl,
      categories: categoriesInput,
      subCategories: subCategoriesInput,
    };

    try {
      await updatePost({ variables });
      alert('Post updated successfully');
      if (onClose) onClose(); // Notify parent that the form should be closed
    } catch (error) {
      console.error('Error updating post:', error);
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
            value={postInput.title}
            onChange={handleInputChange}
            placeholder="Enter post title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <QuillEditor value={postInput.content} onChange={handleContentChange} />

        {/* <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={postInput.slug}
            onChange={handleInputChange}
            placeholder="Enter post slug"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div> */}
        <div>
          <label htmlFor="imgUrl" className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            type="text"
            id="imgUrl"
            name="imgUrl"
            value={postInput.imgUrl}
            onChange={handleInputChange}
            placeholder="Enter image URL"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {categories.map(category => (
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
            required
            onChange={handleSubCategoryChange}
            value={selectedSubCategories}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {SubCategories.map(subCategory => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.title}
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
          {loading ? 'Updating...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePostForm;
