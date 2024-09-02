import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'; // Import both icons

const CREATE_CATEGORY = gql`
  mutation Mutation($subCategories: [SubCategoryInput], $title: String!, $cSlug: String!) {
    createCategorie(subCategories: $subCategories, title: $title, cSlug: $cSlug) {
      id
      cSlug
      title
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

const GET_CATEGORY = gql`
  query Query {
    Categories {
      id
      title
      cSlug
      SubCategories {
        id
        title
        sSlug
      }
    }
  }
`;

function CategoryForms({Cats, SubCats }) {
  const [Category, setCategory] = useState({
    title: '',
    cSlug: '',
    SubCategories: [],
  });

  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to manage form visibility

  const [createCat] = useMutation(CREATE_CATEGORY, {
    update(cache, { data: { createCategorie } }) {
      try {
        const existingCategories = cache.readQuery({ query: GET_CATEGORY });
        if (existingCategories) {
          cache.writeQuery({
            query: GET_CATEGORY,
            data: { Categories: [createCategorie, ...existingCategories.Categories] },
          });
        } else {
          cache.writeQuery({
            query: GET_CATEGORY,
            data: { Categories: [createCategorie] },
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
    setSelectedSubCategories(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Array.isArray(SubCats) || !Array.isArray(selectedSubCategories)) {
      console.error('subCategories or selectedSubCategories is not an array.');
      return;
    }

    const subCategoriesInput = selectedSubCategories.map((subCategoryId) => {
      const subCategory = SubCats.find((subCat) => subCat.id === subCategoryId);
      return { title: subCategory.title, sSlug: subCategory.sSlug };
    });

    const variables = {
      title: Category.title,
      cSlug: Category.cSlug,
      subCategories: subCategoriesInput,
    };

    try {
      const { data } = await createCat({ variables });
      console.log('Mutation response:', data);
      alert('Category created successfully');
      setCategory({
        title: '',
        cSlug: '',
        SubCategories: [],
      });
      setSelectedSubCategories([]);
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
              <label htmlFor="cSlug" className="block text-sm font-medium text-gray-700">
                Category Slug
              </label>
              <input
                type="text"
                id="cSlug"
                name="cSlug"
                value={Category.cSlug}
                onChange={HandleInputChange}
                placeholder="Enter category slug"
                required
                className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="subCategories" className=" block text-sm font-medium text-gray-700">
                Subcategories
              </label>
              <select
                id="subCategories"
                multiple
                onChange={HandleSubCatChange}
                value={selectedSubCategories}
                className="mt-1 text-black block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {SubCats.map((subCategory) => (
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
              Create Category
            </button>
          </form>
        </>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)} // Show form
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Create Category
        </button>
      )}
    </div>
  );
}

export default CategoryForms;
