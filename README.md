# Bloggler Backend

The Bloggler backend is a REST API built with NodeJS and ExpressJS that supports the [Bloggler frontend](https://github.com/itsaruproy/bloggler-frontend). It handles data storage and retrieval using a MongoDB database and provides endpoints for creating, editing, and deleting articles, as well as handling user authentication.

## Features

- CRUD functionality for articles
- User authentication
- Data storage and retrieval using MongoDB

## Technologies

- NodeJS
- ExpressJS
- MongoDB

## Configuration

The Bloggler backend requires the following environment variables:

- `CONNECTIONSTRING`: A connection string for connecting to the MongoDB database.
- `PORT`: The port on which the server will be reachable.
- `JWTSECRET`: A random and secure keyword for JWT authentication.

These variables can be stored in a `.env` file in the root directory of the project or set as server environment properties.

## Getting Started

1. Clone the repository: `git clone https://github.com/itsaruproy/bloggler-backend`
2. Install dependencies: `npm install`
3. Set the required environment variables (see Configuration above).
4. Start the backend server: `npm start`

The backend server will be available at http://localhost:PORT (the port specified in the `PORT` environment variable).

## Contributing

We welcome contributions to the Bloggler backend! If you have an idea for a new feature or have found a bug, please open an issue to discuss it.

## License

Bloggler is licensed under the [MIT License](LICENSE).

