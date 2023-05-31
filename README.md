# Bank Application

This project is a bank application built with JavaScript, Node.js, Express.js, MongoDB, dotenv, bcrypt, crypto, and JWT. It was created as a part of the coursework for my "JavaScript as a Backend Language" course.

#### Challenges

One of the most time-consuming aspects of this project was implementing JWT, specifically the refresh and access tokens. I initially planned to implement simple JWT tokens, but decided to challenge myself by using a more secure and professional approach with refresh and access tokens.

A notable challenge arose with the validation and renewal functions for the access tokens. Initially, the function to get a new access token was called with every request. Once this issue was fixed by checking status.ok, it still triggered on any potential error. I eventually solved this by implementing specific status codes sent from the backend, which could then be interpreted by the frontend.

This experience provided a great learning opportunity in troubleshooting, the relationship between the back and frontend and the importance of using status codes and messages for effective event and error handling.

## Features

- User registration and authentication
- Account balance check
- Depositing and withdrawal of funds

## What I Learned

- Setting up and Express.js server
- Working with Express.js to handle routing ,middleware and controllers
- Using and connecting to a MongoDB database
- Creating a REST API
- Implementing JWT for secure routes with access and refresh tokens
- Password encryption using Bcrypt
- Environment variable management with dontenv

### Prerequisites

To run this project, you need to have Node.js and MongoDB installed on your machine.

## Usage

To use the application:

1. Register a new user
2. Authenticate(login) to obtain the JWT Tokens
3. Use the token to access secure routes

## Contributing

Contributions are welcome. Please open an issue , submit a pull request or email me if you have any improvements or features you'd like to suggest.

## Acknowledgements

I would like to thank my teachers at Nackademin for their support and input
