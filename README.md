
IIGB beta website
=====================

### About this application

This application is written using the [Node.js](https://nodejs.org/en/) JavaScript runtime.

### The purpose

This application pulls together the modules which make up invest.gov.uk:

- IIGB-beta-structure
- IIGB-beta-content
- The website layout can be found within the src folder in this project.


### Prerequisites

In order to run the tool locally in development you'll need the following :

- [Node.js](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads) 

### Dependencies

- [iigb-aws-helpers](https://github.com/uktrade/iigb-aws-helpers)
- [iigb-beta-content](https://github.com/uktrade/iigb-beta-content)
- [iigb-beta-structure](https://github.com/uktrade/iigb-beta-structure)

### Getting Started

Run the following from the command line to download the repository and change into the directory:

```
git clone git@github.com:uktrade/iigb-beta-website.git

cd iigb-beta-website
```

### Running the development server

First install the dependencies:

```bash
npm install
```

To run the server type the following command in your terminal

```bash
npm run dev
```

To reload the server to reflect changes made to the layout, via the src folder type the following in the running terminal window

```bash
rs
```

Then you can now visit the site in the browser via [http://localhost:3000](http://localhost:3000).
