# React POS System

This is a comprehensive Point of Sale (POS) application built with React. All data is saved locally in your browser's Local Storage.

## Features

-   **Point of Sale:** Fast, barcode-ready interface for adding items to a cart.
-   **Inventory Management:** Add, edit, and delete products. Includes support for categories, subcategories, and local image uploads.
-   **Customizable Branding:** Click the gear icon to upload your own logo and set your shop name.
-   **Printable Receipts:** Generate professional, thermal-style receipts for every sale.
-   **Sales Reports:** Track your revenue and profit over any date range.
-   **Offline Capable:** All data is stored locally in your browser.

## How to Use (Web Version)

### For Developers

**Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

1.  **Install Dependencies:** Open a terminal or command prompt in the project root folder and run:
    ```
    npm install
    ```

2.  **Run in Development Mode:** To start the application with live-reloading for development, run:
    ```
    npm run dev
    ```
    This will open the application in your default web browser.

3.  **Build for Production:** To create an optimized build of the application for deployment, run:
    ```
    npm run build
    ```
    The production-ready files will be located in the `dist` directory. You can serve this directory using any static file server.

## Desktop Application

This project can also be packaged as a desktop application for Windows, macOS, and Linux.

### How to run in development

This requires two separate terminal windows.

1.  **Terminal 1: Start Web Server**
    In the first terminal, start the Vite web development server:
    ```
    npm run dev
    ```

2.  **Terminal 2: Start Electron App**
    Once the server is running, open a second terminal and start the Electron application window:
    ```
    npm run electron:start
    ```
    The Electron app will open and load the content from the running development server.

### How to build an executable (.exe for Windows)

1.  **Run the Build Command:**
    In your terminal, run the following command:
    ```
    npm run electron:build
    ```

2.  **Find the Installer:**
    This command bundles the React app and the Electron app into a distributable installer. Once complete, the installer (e.g., `React POS System Setup 1.0.0.exe`) will be located in the new `release` folder at the root of your project.
