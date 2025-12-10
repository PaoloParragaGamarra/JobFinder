# Folder Structure for a React JS Project - GeeksforGeeks

# Folder Structure for a React JS Project



Organizing a React project with a well-planned folder structure is very important for readability, scalability, and maintainability. A clear structure helps in managing code, configurations, modules, and other assets effectively. In this article, we are going to learn the folder structure of the React project. In this article, we'll explore the best practices for organizing the folder structure of a React project.

## Prerequisites

To understand the folder structure for a React project, ensure you have:

- Basic knowledge of [React](https://www.geeksforgeeks.org/reactjs/react/) and [npm](https://www.geeksforgeeks.org/node-js/node-js-npm-node-package-manager/)
- [A code editor or IDE](https://www.geeksforgeeks.org/installation-guide/how-to-install-visual-studio-code-on-windows/)
- [Node JS installed on your machine](https://www.geeksforgeeks.org/installation-guide/install-node-js-on-windows/)

Table of Content

- [Folder Structure Overview](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#folder-structure-overview)
- [Steps to Create Folder Structure](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#steps-to-create-folder-structure)
- [Improved Files and Folders Structure](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#improved-files-and-folders-structure)
- [Why React project structure is important?](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#why-react-project-structure-is-important)
- [Best Practices for React Project Structure](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#best-practices-for-react-project-structure)
- [Conclusion](https://www.geeksforgeeks.org/reactjs/folder-structure-for-a-react-js-project/#conclusion)

## Folder Structure Overview:folder1 Folder Structure

Folder structure contains the files and folders that are present in the directory. There are multiple files and folders, for example, Components, Utils, Assets, Styles, Context, Services, Layouts, etc.

## Steps to Create Folder Structure:

****Step 1:**** Open the terminal, go to the path where you want to create the project and run the command with the project name to create the project.

```
npx create-react-app folder-structure
```

****Step 2:**** After project folder has been created, go inside the folder using the following command.

```
cd folder-structure
```

****Step 3:**** Install the dependencies required for your project (if any) using the following command.

```
npm i package-name
```

****Step 4:**** Run the command git-init to initialized the git in the project. This will add .gitignore file.

```
git init
```

****Step 5:****Create a file named Readme.md which will contain all the info of the project.

```
touch Readme.md
```

****Step 6:**** Create a file with extension .env which will contain the sensitive information and credentials of the project.

```
touch process.env
```

****Step 7:****Create a file named .gitignore so that all the un-necessary files and folders should not uploaded to github.

```
touch .gitignore
```

****Step 8:**** Create folder like components (contains main components) and pages (contains files which combines components to make a page).

```
mkdir components
touch Navbar.jsx
```

## Improved Files and Folders Structure:

For managing the project in more concise way we can create these folder for more manageable code.

- ****Components Folder****
- ****Context Folder****
- ****Hooks Folder****
- ****Services Folder****
- ****Utils Folder****
- ****Assets Folder****
- ****Config Folder****
- ****Styles Folder****

![folder2](https://media.geeksforgeeks.org/wp-content/uploads/20240301170231/folder2.PNG)

Improved Folder Structure

### ****Components Folder:****

A ****Component**** is one of the core building blocks of ****React****. They have the same purpose as [****JavaScript functions****](https://www.geeksforgeeks.org/javascript/functions-in-javascript/) and return [****HTML****](https://www.geeksforgeeks.org/html/html-introduction/). Components make the task of building UI much easier. A UI is broken down into multiple individual pieces called components. You can work on components independently and then merge them all into a ****parent component**** which will be your final UI.

### ****Contexts Folder:****

This directory contains files related to managing global state using the React Context API. Contexts are used to share state across multiple components without having to pass props manually through each level of the component tree.

### ****Hooks Folder:****

Hooks provide access to states for functional components while creating a React application. It allows you to use state and other React features without writing a class. Placing them in a dedicated directory allows for easy access and reuse across components throughout your application.

### ****Services Folder:****

In this directory, you'll find files responsible for handling API calls and other services. Services keeps the implementation details of interacting with external resources, provides separation of concerns and code maintainability.

### ****Utils Folder:****

Utility functions, such as date formatting or string manipulation, are stored in this directory. These functions are typically used across multiple components or modules and serve to centralize commonly used logic.

### ****Assets Folder:****

Static assets like images, icons, fonts, and other media files are stored in the assets folder. Organizing assets in a dedicated directory keeps your project clean and makes it easy to locate and manage these files.

### Config Folder:

This folder contains of a configuration file where we store environment variables in config.js. We will use this file to set up multi-environment configurations in your application. Ex- Environment Configuration, WebPack Configuration, Babel Configuration, etc.

### ****Styles Folder:****

This directory contains CSS or other styling files used to define the visual appearance of your application. In this folder styles of different components are stored here.

## Why React project structure is important?

Project structure shows the organization of code and files, and a clean, simple, and decent project structure shows a clean written code, which helps to debug code, and another developer can easily read it. Also, while deploying code on the server, it can recognize files easily, which is why developers are implementing clean, simple, and decent project structures.

## Best Practices for React Project Structure

It is best practice to create a project structure for the React application, separate files according to their work, and separate them in the correct directories. For example, single components which can be used multiple places should be present in the components folder, and also standardize the naming conventions of the application so that it will be easy to verify the logic and presence of any particular file or folder.