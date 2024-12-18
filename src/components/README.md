# Component Structure

This folder contains reusable UI components that are used throughout the application.

## Structure

```
/components
├── nurse
│   ├── NurseHeader.tsx           # Header for nurse pages
│   └── NurseFooter.tsx           # Footer for nurse pages
├── patient
│   ├── PatientHeader.tsx         # Header for patient pages
│   └── PatientFooter.tsx         # Footer for patient pages
├── common
│   ├── Header.tsx                # A common header, if needed
│   ├── Footer.tsx                # A common footer, if needed
│   ├── Button.tsx                # Reusable button component
│   └── InputField.tsx            # Reusable input field component
```

### Descriptions:

- **`NurseHeader.tsx`**:  

- **`NurseFooter.tsx`**:  
  

- **`PatientHeader.tsx`**:  
  

- **`PatientFooter.tsx`**:  
  

- **`Button.tsx`**:  
  

- **`InputField.tsx`**:  
  


---

### Best Practices:

- **Modularity**:  
  Keep each component focused on a specific role or functionality. For components that are shared between nurse and patient pages, place them in the `common` folder.

- **Naming Convention**:  
  Use descriptive filenames (e.g., `NurseHeader.tsx`, `PatientHeader.tsx`) to clearly indicate which user role the component is for.

---