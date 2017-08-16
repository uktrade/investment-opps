
#Investment Opportunities Alpha

### About this application

This application is written using the [Node.js](https://nodejs.org/en/) JavaScript runtime.

### The purpose

The aim of this applicaiton is to provide a tool within the iigb website that will allow users to view data about business activity across the UK and compare the different regions.

### Prerequisites

In order to run the tool locally in development you'll need the following :

- [Node.js](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads) 

### Dependencies

- [iigb-aws-helpers](https://github.com/uktrade/iigb-aws-helpers)
- [iigb-beta-content](https://github.com/uktrade/iigb-beta-content)
- [iigb-beta-structure](https://github.com/uktrade/iigb-beta-structure)
- [website-builder](https://github.com/uktrade/website-builder)

### Getting Started with development

Run the following from the command line to download the repository and change into the directory:

```bash
git clone git@github.com:uktrade/investment-opps.git

cd investment-opps
```

**Running the development server**

First install the dependencies:

```bash
npm install
```

To run the server type the following command in your terminal

```
npm run dev
```

*Note:*  
Content and structure changes are ignored in this repoository, changes and updates must be managed seperately in these folders using `git`. Make sure to push changes and pull updates for structure and content.

Changes made to layout via the src folder are reflected automatically when dev server is running.

To reload the server to reflect changes made to the content and structure, type the following in the running terminal window:

```
rs
```

Then you can now visit the site in the browser via [http://localhost:3000](http://localhost:3000).

**The flow:**

This application is developed using [git flow](http://nvie.com/posts/a-successful-git-branching-model/) and Github pull requests. `develop` is the main development branch and `master` is the branch for production releases.

The following prefixes are used for special branches:

- Fature branches: *feature/\<feature-description\>*
- Release branches: *release/v\<release-version\>*
- Hotfix branches: *hotfix/\<hotfix-description\>*

*Tip:* Following link shows alternative tools and installation methods for git flow:

[http://danielkummer.github.io/git-flow-cheatsheet](http://danielkummer.github.io/git-flow-cheatsheet/)

### Deployment

The current version of this project is deployed to a second staging environment [staging2.invest.great.gov.uk](https://staging2.invest.great.gov.uk).
