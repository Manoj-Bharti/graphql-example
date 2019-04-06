const graphql = require('graphql')
const axios = require("axios")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString},
    name: { type: GraphQLString},
    description: { type: GraphQLString},
    employees: {
      type: new GraphQLList(EmployeeType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/employees`)
          .then(response => response.data)
      }
    }
  })
})

const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: () => ({
   id: { type: GraphQLString},
   name: { type: GraphQLString},
   age: { type: GraphQLInt},
   company: {
     type: CompanyType,
     resolve(parentValue, args) {
       return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
         .then(response => response.data)
     }
   }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    employee: {
      type: EmployeeType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/employees/${args.id}`)
          .then(response => response.data)
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString}},
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(response => response.data)
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addEmployee: {
      type: EmployeeType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString}
      },
      resolve(parentValue, { name, age }) {
        return axios.post("http://localhost:3000/employees", { name, age})
          .then(respone => respone.data)
      }
    },
    deleteEmployee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/employees/${id}`)
          .then(response => response.data)
      }
    },
    updateEmployeeDetails: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)},
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: {
          type: GraphQLString
        }
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/employees/${args.id}`, args)
          .then(response => response.data)
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})
