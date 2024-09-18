'use client';
import React, { useState } from 'react';
import PostForms from '../Components/Post/PostForms';
import CategoryForms from '../Components/Category/CategoryForms';
import SubCategoryForms from '../Components/SubCategory/SubCategoryForms';
import PostDisplay from '../Components/Post/PostDisplay';
import CatDisplay from '../Components/Category/CatDisplay';
import SubCatDisplay from '../Components/SubCategory/SubCatDisplay';
import DeleteCatButton from '../Components/Category/DeleteCatButton';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_CATEGORIES = gql`
  query GetCategories {
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

const GET_SUBCATEGORIES = gql`
  query GetSubCategories {
    SubCategories {
      id
      title
      sSlug
      Categories {
        id
        title
        cSlug
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

const Page = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  const { loading: catLoading, error: catError, data: catData } = useQuery(GET_CATEGORIES);
  const { loading: postLoading, error: postError, data: postData } = useQuery(GET_POSTS);
  const { loading: subLoading, error: subError, data: subData } = useQuery(GET_SUBCATEGORIES);

  // Handle loading state for each query
  if (catLoading || postLoading || subLoading) {
    return (
      <div>
        {catLoading && <p>Loading categories...</p>}
        {postLoading && <p>Loading posts...</p>}
        {subLoading && <p>Loading subcategories...</p>}
      </div>
    );
  }

  // Handle errors for each query
  if (catError) return <p>Error loading categories: {catError.message}</p>;
  if (postError) return <p>Error loading posts: {postError.message}</p>;
  if (subError) return <p>Error loading subcategories: {subError.message}</p>;

  // Ensure data is available before rendering
  if (!catData || !postData || !subData) return <p>No data available</p>;

  const handleSelectPost = (post) => {
    setSelectedPost((prevSelectedPost) =>
      prevSelectedPost && prevSelectedPost.id === post.id ? null : post
    );
  };

  const handleSelectCat = (cat) => {
    setSelectedCat(cat);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Post form section */}
      <div>
        {catData && subData && (
          <PostForms categories={catData.Categories} SubCategories={subData.SubCategories} />
        )}
      </div>

      {/* Post display section */}
      <div>
        {postData && catData && subData && (
          <PostDisplay
            posts={postData.Posts}
            Cat={catData.Categories}
            onSelectPost={handleSelectPost}
            Sub={subData.SubCategories}
          />
        )}
      </div>

      {/* Category form section */}
      <div>
        {subData && (
          <CategoryForms SubCats={subData.SubCategories} />
        )}
      </div>

      {/* Category display section */}
      <div>
        {catData && subData && (
          <CatDisplay
            categories={catData.Categories}
            onSelectCat={handleSelectCat}
            SubCat={subData.SubCategories}
          />
        )}
      </div>

      {/* Subcategory form section */}
      <div>
        {catData && (
          <SubCategoryForms Cats={catData.Categories} />
        )}
      </div>

      {/* Subcategory display section */}
      <div>
        {subData && catData && (
          <SubCatDisplay
            SubCat={subData.SubCategories}
            Cat={catData.Categories}
            onSelectCat={handleSelectCat}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
