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
const CreateItems = dynamic(() => import('../Components/Items/CreateItems'), { ssr: false });
const DisplayItems = dynamic(() => import('../Components/Items/DisplayItems'), { ssr: false });

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


const GET_GENRE= gql`
  query Query {
  
  genres{
    id
    genre
    title
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


const GET_ITEMS = gql`
  query GetItem {
   Items {
    id
    name
    description
    number
    content
     slug
     date
  genres{
    id
    genre
    title
  }
    SubCategories {
        id
        title
        sSlug
      }
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
        number
        content
        genres {
      title
      genre
    }
        media{
        url
        }
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

const Page = () => {
  const { loading: catLoading, error: catError, data: catData } = useQuery(GET_CATEGORIES);
  const { loading: postLoading, error: postError, data: postData } = useQuery(GET_POSTS);
  const { loading: subLoading, error: subError, data: subData } = useQuery(GET_SUBCATEGORIES);
  const { loading: ItemLoading, error: ItemError, data: ItemData } = useQuery(GET_ITEMS);
  const { loading:GenreLoading, error:GenreError, data: GenreData } = useQuery(GET_GENRE);

console.log('cat')


  if (catLoading || postLoading || subLoading || GenreLoading||ItemLoading) return <p className=' text-center '>Loading...</p>;
  if (catError) return <p>Error loading categories: {catError.message}</p>;
  if (postError) return <p>Error loading posts: {postError.message}</p>;
  if (subError) return <p>Error loading subcategories: {subError.message}</p>;
  if (ItemError) return <p>Error loading ItemData: {ItemError.message}</p>;
  if (GenreError) return <p>Error loading Genre: {GenreError.message}</p>;
  if (!catData || !postData || !subData ||!ItemData) return <p>No data available</p>;

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
        <PostForms categories={catData.Categories} SubCategories={subData.SubCategories} item={ItemData.Items}/>
      </div>
      <div className=''>
        <PostDisplay posts={postData.Posts} Cat={catData.Categories} onSelectPost={handleSelectPost} Sub={subData.SubCategories} item={ItemData.Items} />
      </div>

      <div className=''>
        <CategoryForms SubCats={subData.SubCategories}  />
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
      <div className=''>
        <CreateItems item={ItemData.Items} SubCategories={subData.SubCategories} Genre={GenreData.genres}/>
      </div>

      <div className=''>
        <DisplayItems  item={ItemData.Items} SubCat={subData.SubCategories}  onSelectCat={handleSelectCat} GG={GenreData.genres} />
      </div>
    </div>


  );
};

export default Page;


