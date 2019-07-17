var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());

var axios = require('axios');
const https = require('https');
var { makeExecutableSchema } = require('graphql-tools');

var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

    // http://localhost:4002/graphql
    // {
    //     getPhoto(id: 1) {
    //       albumId
    //       id
    //       title
    //       url
    //       thumbnailUrl
    //     }
    //   }

    // http://localhost:4002/graphql      
    //   {
    //     getPhotos {
    //       albumId
    //       id
    //       title
    //       url
    //       thumbnailUrl
    //     }
    //   }
      

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  
  type Photo {
    albumId: ID
    id: ID
    title: String
    url: String
    thumbnailUrl: String    
  }

  type Query {
      
    getPhotosMock: [Photo]

    getPhotoMock(id: ID!): Photo

    getPhotos: [Photo]

    getPhoto(id: ID!): Photo

  }

  input	PhotoInput{				
    albumId: ID!
    title: String!
    url: String
    thumbnailUrl: String   
  } 

  input	PhotoWhere{ 
    id:	ID! 
  }

  type	Mutation	{				
    createPhoto(data:	PhotoInput!):	Photo				
    deletePhoto(where:	PhotoWhere!):	Photo 
    createPhotoMock(data:	PhotoInput!):	Photo				
    deletePhotoMock(where:	PhotoWhere!):	Photo     
    updatePhotoMock(data:	PhotoInput!, where:	PhotoWhere!):	Photo     
  } 

`);

// type	Mutation	{		
//   deletePhoto(id:	ID!):	Photo 
// } 

var photosMock = [
  {
  albumId: 1,
  id: 1,
  title: 'teste 1',
  url: 'teste 1',
  thumbnailUrl: 'teste 1' 
  },
  {
  albumId: 2,
  id: 2,
  title: 'teste 2',
  url: 'teste  2',
  thumbnailUrl: 'teste 2' 
  }
]

// The root provides a resolver function for each API endpoint
var root = {
  updatePhotoMock: function (values) {
    const findByListAndField = (list, field, value) => list.find(obj => obj[field] == value);
    const result = findByListAndField(photosMock, 'id', values.where.id);
    // console.log(values.where);
    // console.log(values.data);
    // console.log(result);   
    result.albumId = values.data.albumId;
    result.title = values.data.title;
    result.url = values.data.url;
    result.thumbnailUrl = values.data.thumbnailUrl;
    console.log(photosMock);         
    return	result;
   },    
  deletePhotoMock: function (values) {
    // const findByListAndField = (list, field, value) => list.find(obj => obj[field] == value);
    // const result = findByListAndField(photosMock, 'id', values.id);

    const	indice	=	photosMock.findIndex(photo	=>	photo.id	==	values.where.id);						
    if(indice	>=	0){										
      return	photosMock.splice(indice,	1)[0];						
    }
    return	null;
   },  
   deletePhoto: async function (values) {
    const  result  = await deleteAPI('https://jsonplaceholder.typicode.com/photos/'+values.where.id);
    console.log(result);
    return	result;
   },     
    createPhotoMock: function (values) {
      const	newPhoto	=	values.data;				
      newPhoto.id	=	300;
      photosMock.push(newPhoto);		
      console.log(newPhoto);		
      return	newPhoto;
     },    
     createPhoto: async function (values) {
      const	newPhoto	=	values.data;				
      //newPhoto.id	=	300;
      const  result  = await postAPI('https://jsonplaceholder.typicode.com/photos/',newPhoto);
      console.log(result);
      return	result;
     },      
    getPhotosMock: function () {
      return photosMock
    },
    getPhotoMock: function (values) {

      const findByListAndField = (list, field, value) => list.find(obj => obj[field] == value);
      const result = findByListAndField(photosMock, 'id', values.id);
      //console.log(result);
      return result;
     },
    getPhotos: async function () {
        const  result  = await getAPI('https://jsonplaceholder.typicode.com/photos/');
        //console.log(result.data);
        return result.data;

    },
    getPhoto: async function (values) {
          const  result  = await getAPI('https://jsonplaceholder.typicode.com/photos/'+values.id);
          //console.log(result.data);
          console.log(values.id);
          return result.data;
    }
};

async function getAPI(url) {
  try {
    const v = await axios.get(url);
    //console.log(v);
    return v;
  } catch(e) {
    console.log(e);
  }
}

async function postAPI(url, values) {
  try {
      const res = await axios.post(url, values);
      //console.log(res.data);
      return res.data;
  } catch(e) {
    console.error(e);
  }
}

async function deleteAPI(url, values) {
  try {
      //const res = await axios.delete(url, values.id);
      const res = await axios.delete(url);
      //console.log(res.data);
      return res.data;
  } catch(e) {
    console.error(e);
  }
}

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4002);
console.log('Running a GraphQL API server at localhost:4002/graphql');