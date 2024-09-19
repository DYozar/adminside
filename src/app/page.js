"use client"
import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic from Next.js
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Dynamically import components, disabling SSR
const PostForms = dynamic(() => import('../Components/Post/PostForms'), { ssr: false });
const CategoryForms = dynamic(() => import('../Components/Category/CategoryForms'), { ssr: false });
const SubCategoryForms = dynamic(() => import('../Components/SubCategory/SubCategoryForms'), { ssr: false });
const PostDisplay = dynamic(() => import('../Components/Post/PostDisplay'), { ssr: false });
const CatDisplay = dynamic(() => import('../Components/Category/CatDisplay'), { ssr: false });
const SubCatDisplay = dynamic(() => import('../Components/SubCategory/SubCatDisplay'), { ssr: false });

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
  const { loading: catLoading, error: catError, data: catData } = useQuery(GET_CATEGORIES);
  const { loading: postLoading, error: postError, data: postData } = useQuery(GET_POSTS);
  const { loading: subLoading, error: subError, data: subData } = useQuery(GET_SUBCATEGORIES);

  if (catLoading || postLoading || subLoading) return <p className=' text-center '>Loading...</p>;
  if (catError) return <p>Error loading categories: {catError.message}</p>;
  if (postError) return <p>Error loading posts: {postError.message}</p>;
  if (subError) return <p>Error loading subcategories: {subError.message}</p>;
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
    <div className='grid grid-cols-2 gap-4 mt-4'>
      <div className=''>
        <PostForms categories={catData.Categories} SubCategories={subData.SubCategories} />
      </div>
      <div className=''>
        <PostDisplay posts={postData.Posts} Cat={catData.Categories} onSelectPost={handleSelectPost} Sub={subData.SubCategories} />
      </div>

      <div className=''>
        <CategoryForms SubCats={subData.SubCategories} />
      </div>

      <div className=''>
        <CatDisplay categories={catData.Categories} onSelectCat={handleSelectCat} SubCat={subData.SubCategories} />
      </div>

      <div className=''>
        <SubCategoryForms Cats={catData.Categories} />
      </div>

      <div className=''>
        <SubCatDisplay SubCat={subData.SubCategories} Cat={catData.Categories} onSelectCat={handleSelectCat} />
      </div>
    </div>
  );
};

export default Page;
