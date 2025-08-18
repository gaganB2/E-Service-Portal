# E-Service Portal

This project is a modern, fluid, and animated web application that serves as a portal for both service technicians and customers. It facilitates the management of job requests, scheduling, communication, invoicing, and payments in a streamlined interface.

## Features

### General
- **Dual User Roles:** Separate, tailored portals for Technicians and Customers.
- **Secure Authentication:** User sign-up and login powered by Firebase Authentication.
- **Real-time Database:** Job requests and conversations are updated in real-time using Firebase Firestore.
- **Responsive Design:** A clean, responsive UI built with Tailwind CSS that works on all screen sizes.
- **Smooth Animations:** User interface enhanced with fluid animations from Framer Motion.

### Technician Portal
- **Dashboard:** At-a-glance view of new requests, accepted jobs, and completed jobs.
- **Job Management:** View details of incoming service requests, with options to accept or decline.
- **Filtering System:** Easily filter jobs by status (Pending, Accepted, Completed) and urgency (Emergency, High, Normal).
- **Scheduling:** An integrated schedule view to see all upcoming and accepted jobs.
- **Invoicing:** Create and send detailed invoices to customers for completed work.
- **Rating System:** Rate customers after a job is complete to build a trusted community.
- **Live Messaging:** Communicate directly with customers regarding their service requests.

### Customer Portal
- **Request Management:** View a dashboard of all past and present service requests.
- **New Request Creation:** A comprehensive modal to submit new service requests, including:
    - Service category, location, and detailed description.
    - Urgency level selection.
    - An interactive calendar to select a preferred date and time slot.
    - Optional photo uploads for clarity.
- **Payment System:** Securely pay invoices for completed jobs.
- **Rating System:** Rate the technician's service after payment.
- **Live Messaging:** Communicate directly with the assigned technician.

---

## Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Backend & Database:** Firebase (Authentication, Firestore)
- **Animations:** Framer Motion

---

## Running the Project Locally

To run this application on your local machine, you need a local development server. The simplest way to do this is with `npx`, which comes with Node.js.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm and npx) installed on your machine.

### Instructions

1.  **Save the Files:** Make sure all the provided project files (`index.html`, `index.tsx`, `App.tsx`, etc.) are in a single folder on your computer.

2.  **Open Your Terminal:** Open a terminal or command prompt.

3.  **Navigate to the Project Directory:** Use the `cd` command to navigate into the folder where you saved the project files.
    ```bash
    cd path/to/your/project-folder
    ```

4.  **Start the Local Server:** Run the following command. This will download the `serve` package temporarily and start a server for your project.
    ```bash
    npx serve
    ```

5.  **View the App:** The terminal will output a local address, usually `http://localhost:3000`. Open this URL in your web browser to see the application running.

The server will watch for file changes, but you may need to manually refresh your browser to see the updates. To stop the server, press `Ctrl + C` in the terminal.
