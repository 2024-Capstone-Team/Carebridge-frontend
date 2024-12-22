# CareBridge FrontEnd

## Folder Structure

- `/pages`: Contains the main pages of the app:
  - `PreLoginPage.tsx`: Login page where users select either nurse or patient role.
  - `/nurse`: Nurse-specific pages (e.g., Nurse Dashboard).
  - `/patient`: Patient-specific pages (e.g., Patient Call-Bell).

- `/components`: Contains reusable UI components:
  - `/nurse`: Nurse-specific header and footer components.
  - `/patient`: Patient-specific header and footer components.
  - `/common`: Shared components like buttons, input fields, etc.

## Development Process
1. Set up routing using React Router to handle navigation between pages.
2. Create components and pages for nurse and patient functionality.
3. Manage user authentication and state locally for simplicity.
4. Use hooks for managing component state and side effects.

Make sure to follow the code conventions set up in the `README.md` file for consistency.