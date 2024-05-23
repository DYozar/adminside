'use client'
import React, { useState } from 'react'
//import PostForms from '@/Components/PostForms'
import { gql,useQuery } from '@apollo/client'

const GET_CATEGORIES = gql`
  query GetCategories {
    Posts {
      content 
    }
  }
`;
export const  page =  () => {

  const { loading, error, data } = useQuery(GET_CATEGORIES)
  let da;
  if (data && data.Posts && data.Posts.content && data.Posts.content.length > 0) {
    console.log(data.Posts.content[0], 'test');
    const da = data.Posts.content[0]// Suggested code may be subject to a license. Learn more: ~LicenseLog:2845895885.

  }
  
  return (
    <div>{da}</div>
  )
}

export default page