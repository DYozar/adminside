'use client';
import React, { useState, useEffect } from 'react';
import PostForms from '../Components/Post/PostForms';
import CategoryForms from '../Components/Category/CategoryForms';
import SubCategoryForms from '../Components/SubCategory/SubCategoryForms';
import PostDisplay from '../Components/Post/PostDisplay';
import CatDisplay from '../Components/Category/CatDisplay';
import SubCatDisplay from '../Components/SubCategory/SubCatDisplay';
import { useApolloClient, gql } from '@apollo/client';

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
  const client = useApolloClient(); // Get the Apollo Client
  const [catData, setCatData] = useState(null);
  const [subData, setSubData] = useState(null);
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await client.query({ query: GET_CATEGORIES });
        setCatData(data.Categories);
      } catch (err) {
        setError(`Error loading categories: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [client]);

  // Fetch SubCategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const { data } = await client.query({ query: GET_SUBCATEGORIES });
        setSubData(data.SubCategories);
      } catch (err) {
        setError(`Error loading subcategories: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [client]);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await client.query({ query: GET_POSTS });
        setPostData(data.Posts);
      } catch (err) {
        setError(`Error loading posts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [client]);

  // Handling loading and error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
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
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="">
        <PostForms categories={catData} SubCategories={subData} />
      </div>
      <div className="">
        <PostDisplay posts={postData} Cat={catData} onSelectPost={handleSelectPost} Sub={subData} />
      </div>

      <div className="">
        <CategoryForms SubCats={subData} />
      </div>

      <div className="">
        <CatDisplay categories={catData} onSelectCat={handleSelectCat} SubCat={subData} />
      </div>

      <div className="">
        <SubCategoryForms Cats={catData} />
      </div>

      <div className="">
        <SubCatDisplay SubCat={subData} Cat={catData} onSelectCat={handleSelectCat} />
      </div>
    </div>
  );
};

export default Page;
