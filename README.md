
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
- [website-builder](https://github.com/uktrade/website-builder)

### Getting Started with development

Run the following from the command line to download the repository and change into the directory:

```bash
git clone git@github.com:uktrade/iigb-beta-website.git

cd iigb-beta-website
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

*Note:* Upon running the development server for the first time, [iigb-beta-content](https://github.com/uktrade/iigb-beta-content) and [iigb-beta-structure](https://github.com/uktrade/iigb-beta-structure) repositories will be cloned into project's root directory for easier development requiring changes on structure and content. 

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
- Release branches: *release/*
- Hotfix branches: *hotfix/*

*Tip:* Following link shows alternative tools and installation methods for git flow:

[http://danielkummer.github.io/git-flow-cheatsheet](http://danielkummer.github.io/git-flow-cheatsheet/)

### Deployment & Release

`develop` branch is continuously deployed to [staging environment](https://staging.invest.great.gov.uk/) for QA purposes. All new features are available on staging soon after the pull request is approved by a team member and feature is finished.

**Approve a pull request**
To approve a team member's pull request for a feature or hotfix please finish the feature using a git flow tool of your choice or apply [git flow finish](http://danielkummer.github.io/git-flow-cheatsheet/) feature steps manually using `git` rather than merging on Github to ensure cleanup and necessary branch changes.

**Release**

To take a cut for releasing from `develop` follow [git flow steps](http://danielkummer.github.io/git-flow-cheatsheet/) to create a release branch with intended release version name.

**Deployment**

A release that should be deployed as [invest.great.gov.uk](https://invest.great.gov.uk/) must be tagged as `stable`; continous integration tool in use should be watching this tag for changes to deploy production environment. 

Any version can be marked as stable to be deployed as [invest.great.gov.uk](https://invest.great.gov.uk/).

Use following commands to mark a release for deployment.

```bash
git tag -f stable v1.1.0

git push --tags -f
```
