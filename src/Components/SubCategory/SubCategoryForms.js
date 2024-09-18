'use client'
import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import both icons

const CREATE_SUBCATEGORY = gql`
mutation Mutation($title: String!, $sSlug: String!, $categories: [CategoryInput]) {
  createSubCategory(title: $title, sSlug: $sSlug, categories: $categories) {
    title
    id
    sSlug
    Categories {
      cSlug
      title
      id
    }
  }
}
`;

const GET_SUBCATEGORY = gql`
query GetSubCategories {
  SubCategories  {
    id
    title
    id
    sSlug
    Categories {
      title
      id
      cSlug

    }
  } 
}
`;

function SubCategoryForms({ Cats }) {
  const [Category, setCategory] = useState({
    title: '',
    sSlug: '',
    Categories: [],
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to manage form visibility

  const [createSubCat] = useMutation(CREATE_SUBCATEGORY, {
    update(cache, { data: { createSubCategorie } }) {
      try {
        const existingSubCategories = cache.readQuery({ query: GET_SUBCATEGORY });
        if (existingSubCategories) {
          cache.writeQuery({
            query: GET_SUBCATEGORY,
            data: { SubCategories: [createSubCategorie, ...existingSubCategories.SubCategories] },
          });
        } else {
          cache.writeQuery({
            query: GET_SUBCATEGORY,
            data: { SubCategories: [createSubCategorie] },
          });
        }
      } catch (e) {
        console.error('Error updating cache:', e);
      }
    },
  });

  const HandleInputChange = (e) => {
    const { name, value } = e.target;
    setCategory({
      ...Category,
      [name]: value,
    });
  };

  const HandleSubCatChange = (e) => {
    const { options } = e.target;
    const selectedOptions = Array.from(options)
      .filter((o) => o.selected)
      .map((o) => o.value);
    setSelectedCategories(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Array.isArray(Cats) || !Array.isArray(selectedCategories)) {
      console.error('subCategories or selectedCategories is not an array.');
      return;
    }

    const CategoriesInput = selectedCategories.map((CategoryId) => {
      const Category = Cats.find((subCat) => subCat.id === CategoryId);
      return { title: Category.title, cSlug: Category.cSlug };
    });

    const variables = {
      title: Category.title,
      sSlug: Category.sSlug,
      Categories: CategoriesInput,
    };

    try {
      const { data } = await createSubCat({ variables });
      console.log('Mutation response:', data);
      alert('Category created successfully');
      setCategory({
        title: '',
        cSlug: '',
        SubCategories: [],
      });
      setSelectedCategories([]);
      // Do not hide form automatically after creation
    } catch (error) {
      console.error('Error creating Category:', error.message);
      if (error.networkError) {
        console.error('Network error:', error.networkError);
      } else if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }
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
              <label htmlFor="title" className="block  text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={Category.title}
                onChange={HandleInputChange}
                placeholder="Enter category title"
                required
                className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="sSlug" className="block  text-sm font-medium text-gray-700">
                Category Slug
              </label>
              <input
                type="text"
                id="sSlug"
                name="sSlug"
                value={Category.sSlug}
                onChange={HandleInputChange}
                placeholder="Enter Subcategory slug"
                required
                className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="Categories" className=" block text-sm font-medium text-gray-700">
                Subcategories
              </label>
              <select
                id="subCategories"
                multiple
                onChange={HandleSubCatChange}
                value={selectedCategories}
                className="mt-1 text-black block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {Cats.map((subCategory) => (
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
              Create SubCategory
            </button>
          </form>
        </>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)} // Show form
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Create SubCategory
        </button>
      )}
    </div>
  );
}

export default SubCategoryForms;
