import { gql } from '@apollo/client';

const GET_CATEGORIES = gql`
  query GetCategories {
    Posts {
      content 
    }
  }
`;


export default GET_CATEGORIES